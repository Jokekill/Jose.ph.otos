/**
 * Responsive QA harness: serves `dist/` and screenshots every page at the
 * breakpoints the brief calls out. Dev-only — not part of the site build.
 *
 *   node scripts/qa-screenshots.mjs [outDir]
 */
import { createServer } from 'node:http';
import { readFile, mkdir } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const BASE = '/jose.ph.otos';
const DIST = new URL('../dist/', import.meta.url).pathname;
const outDir = process.argv[2] ?? '/tmp/qa';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.svg': 'image/svg+xml',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
};

const server = createServer(async (req, res) => {
  let url = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (url.startsWith(BASE)) url = url.slice(BASE.length) || '/';
  let file = join(DIST, url);
  if (url.endsWith('/')) file = join(file, 'index.html');
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    try {
      res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
      res.end(await readFile(join(DIST, '404.html')));
    } catch {
      res.writeHead(404).end('not found');
    }
  }
});

const VIEWPORTS = [
  { name: '360', width: 360, height: 780, mobile: true },
  { name: '390', width: 390, height: 844, mobile: true },
  { name: '430', width: 430, height: 932, mobile: true },
  { name: '768-tablet', width: 768, height: 1024, mobile: true },
  { name: '1280-laptop', width: 1280, height: 800, mobile: false },
  { name: '1680-desktop', width: 1680, height: 1050, mobile: false },
];

const PAGES = [
  { name: 'home', url: '/' },
  { name: 'portfolio', url: '/portfolio/' },
  { name: 'gallery', url: '/portfolio/svatby/' },
  { name: 'o-mne', url: '/o-mne/' },
  { name: 'cenik', url: '/cenik/' },
  { name: 'kontakt', url: '/kontakt/' },
  { name: '404', url: '/neexistuje/' },
];

const only = process.env.QA_PAGES?.split(',');
const onlyVp = process.env.QA_VIEWPORTS?.split(',');

await mkdir(outDir, { recursive: true });
await new Promise((r) => server.listen(4321, r));

const browser = await chromium.launch({
  // The environment ships a pinned Chromium; do not download another one.
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
});
const problems = [];

for (const vp of VIEWPORTS.filter((v) => !onlyVp || onlyVp.includes(v.name))) {
  const context = await browser.newContext({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
    hasTouch: vp.mobile,
    isMobile: vp.mobile,
  });
  const page = await context.newPage();
  page.on('pageerror', (e) => problems.push(`JS error @ ${vp.name}: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() !== 'error') return;
    // The 404 page is served with a 404 status on purpose; the browser logs
    // that as a failed resource. Everything else is a real problem.
    if (page.url().includes('/neexistuje/') && m.text().includes('404')) return;
    problems.push(`console @ ${vp.name} [${page.url()}]: ${m.text()}`);
  });

  for (const p of PAGES.filter((x) => !only || only.includes(x.name))) {
    await page.goto(`http://localhost:4321${BASE}${p.url}`, { waitUntil: 'networkidle' });
    // Trigger every lazy image so full-page shots are not half empty.
    // Half-viewport steps with a pause: stepping a whole viewport per frame
    // can skip past an element entirely, so IntersectionObserver never sees it
    // and the reveal animation stays at opacity 0 in the screenshot.
    await page.evaluate(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      // The site sets `scroll-behavior: smooth`, which makes each scrollTo
      // animate — the loop would outrun it and never reach the bottom.
      document.documentElement.style.scrollBehavior = 'auto';
      for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight / 2) {
        window.scrollTo(0, y);
        await wait(90);
      }
      window.scrollTo(0, 0);
      await wait(1200);
    });
    await page.waitForTimeout(400);

    // Horizontal overflow is the classic mobile-layout failure.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    if (overflow > 1) problems.push(`H-OVERFLOW ${overflow}px on ${p.name} @ ${vp.name}`);

    await page.screenshot({ path: join(outDir, `${p.name}-${vp.name}.png`), fullPage: true });
  }
  await context.close();
}

await browser.close();
server.close();

console.log(problems.length ? `\nISSUES:\n- ${problems.join('\n- ')}` : '\nNo overflow or JS errors.');
