/**
 * Worst-case contrast of the hero text against the photographs behind it.
 *
 * Everywhere else on the site contrast can be reasoned about from tokens,
 * because the background is a known colour. In the hero it is a picture, so
 * the only honest check is to measure the rendered pixels.
 *
 * Method: hide the hero text and the header, screenshot what is behind them,
 * then take the LIGHTEST pixel inside each text's bounding box — the worst
 * spot a letter stroke can land on — and compute its contrast against white.
 * Mean contrast is reported too, but it is the optimistic number and should
 * not be the one you trust.
 *
 * Re-run this whenever the hero photographs change. A high-key frame can push
 * the small text back under its bar even when the page looks fine by eye.
 *
 *   npm run qa:hero
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

const BASE = '/Jose.ph.otos';
const DIST = new URL('../dist/', import.meta.url).pathname;
const T = {
  '.html': 'text/html;charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  let u = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (u.startsWith(BASE)) u = u.slice(BASE.length) || '/';
  let f = join(DIST, u);
  if (u.endsWith('/')) f = join(f, 'index.html');
  try {
    const b = await readFile(f);
    res.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' });
    res.end(b);
  } catch {
    res.writeHead(404).end('not found');
  }
});
await new Promise((r) => server.listen(4367, r));

const luminance = (r, g, b) => {
  const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const contrastWithWhite = (r, g, b) => 1.05 / (luminance(r, g, b) + 0.05);

/** sharp's stats() reads the INPUT image and ignores extract(), so the crop
 *  has to be materialised into its own buffer first. */
const cropStats = async (buf, box) =>
  sharp(await sharp(buf).extract(box).png().toBuffer()).stats();

/** WCAG AA: 3:1 for large text, 4.5:1 for everything else. */
const BARS = { claim: 3.0, brand: 4.5, place: 4.5, nav: 4.5 };

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }],
  ['mobile', { width: 390, height: 844 }],
  ['small', { width: 360, height: 640 }],
];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
});

let worst = Infinity;
let worstWhere = null;
const failures = [];

for (const [vpName, vp] of VIEWPORTS) {
  const ctx = await browser.newContext({
    viewport: vp,
    deviceScaleFactor: 1,
    isMobile: vp.width < 500,
    hasTouch: vp.width < 500,
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:4367${BASE}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(900);

  const boxes = await page.evaluate(() => {
    const g = (sel) => {
      const el = document.querySelector(sel);
      if (!el) return null;
      const r = el.getBoundingClientRect();
      if (r.width < 1 || r.height < 1) return null;
      return {
        left: Math.max(0, Math.round(r.x)), top: Math.max(0, Math.round(r.y)),
        width: Math.round(r.width), height: Math.round(r.height),
      };
    };
    return {
      brand: g('.hero__brand'), claim: g('.hero__claim'),
      place: g('.hero__place'), nav: g('.nav-desktop ul'),
    };
  });

  const slideCount = await page.locator('[data-hero-dot]').count();
  for (let i = 0; i < Math.max(1, slideCount); i++) {
    if (i > 0) {
      await page.locator('[data-hero-dot]').nth(i).click();
      await page.waitForTimeout(1500);
    }
    await page.evaluate(() => {
      document.querySelector('.hero__content').style.visibility = 'hidden';
      document.querySelector('.site-header').style.visibility = 'hidden';
    });
    const shot = await page.screenshot({ clip: { x: 0, y: 0, ...vp } });
    await page.evaluate(() => {
      document.querySelector('.hero__content').style.visibility = '';
      document.querySelector('.site-header').style.visibility = '';
    });

    for (const [name, box] of Object.entries(boxes)) {
      if (!box) continue;
      const st = await cropStats(shot, box);
      const lightest = st.channels.slice(0, 3).map((ch) => ch.max);
      const mean = st.channels.slice(0, 3).map((ch) => ch.mean);
      const cWorst = contrastWithWhite(...lightest);
      const cMean = contrastWithWhite(...mean);
      const bar = BARS[name] ?? 4.5;

      if (cWorst < worst) { worst = cWorst; worstWhere = `${vpName} slide${i + 1} ${name}`; }
      if (cWorst < bar) {
        failures.push(`${vpName} slide${i + 1} ${name}: ${cWorst.toFixed(2)}:1 < ${bar}:1`);
      }
      console.log(
        `  ${vpName.padEnd(7)} slide${i + 1} ${name.padEnd(6)} ` +
          `lightest ${cWorst.toFixed(2)}:1 (bar ${bar})  mean ${cMean.toFixed(2)}:1`,
      );
    }
  }
  await ctx.close();
}

await browser.close();
server.close();

console.log(`\nworst lightest-pixel contrast: ${worst.toFixed(2)}:1  (${worstWhere})`);
if (failures.length) {
  console.log('FAILS:\n  ' + failures.join('\n  '));
  console.log('\nStrengthen .hero__scrim in src/components/HeroSlideshow.astro.');
  process.exit(1);
}
console.log('All hero text clears its WCAG AA bar even at the lightest pixel behind it.');
