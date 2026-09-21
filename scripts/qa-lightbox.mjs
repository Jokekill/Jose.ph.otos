/**
 * Functional test for the lightbox: opening, keyboard navigation, focus
 * handling, touch swipe and closing. Dev-only.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const BASE = '/Jose.ph.otos';
const DIST = new URL('../dist/', import.meta.url).pathname;
const T = { '.html': 'text/html;charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

const server = createServer(async (req, res) => {
  let u = decodeURIComponent((req.url ?? '/').split('?')[0]);
  if (u.startsWith(BASE)) u = u.slice(BASE.length) || '/';
  let f = join(DIST, u);
  if (u.endsWith('/')) f = join(f, 'index.html');
  try {
    const b = await readFile(f);
    res.writeHead(200, { 'content-type': T[extname(f)] ?? 'application/octet-stream' });
    res.end(b);
  } catch { res.writeHead(404).end('nf'); }
});
await new Promise((r) => server.listen(4322, r));

const results = [];
const check = (name, pass, detail = '') =>
  results.push({ name, pass, detail });

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
});

/* ---------------- desktop: keyboard ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://localhost:4322${BASE}/portfolio/svatby/`, { waitUntil: 'networkidle' });

  const box = page.locator('[data-lightbox]');
  check('closed on load', await box.isHidden());

  await page.locator('[data-lightbox-item]').nth(2).click();
  await page.waitForTimeout(300);
  check('opens on photo click', await box.isVisible());
  check(
    'counter shows position',
    (await page.locator('[data-lightbox-counter]').textContent())?.trim() === '3 / 7',
    await page.locator('[data-lightbox-counter]').textContent(),
  );
  check(
    'focus moved into dialog',
    await page.evaluate(() => document.activeElement?.hasAttribute('data-lightbox-close')),
  );
  check(
    'body scroll locked',
    await page.evaluate(() => document.body.style.overflow === 'hidden'),
  );

  const srcBefore = await page.locator('[data-lightbox-img]').getAttribute('src');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(250);
  check(
    'ArrowRight advances',
    (await page.locator('[data-lightbox-counter]').textContent())?.trim() === '4 / 7' &&
      (await page.locator('[data-lightbox-img]').getAttribute('src')) !== srcBefore,
  );

  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(250);
  check(
    'ArrowLeft goes back',
    (await page.locator('[data-lightbox-counter]').textContent())?.trim() === '2 / 7',
  );

  // Wrap-around from the first photo.
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(250);
  check(
    'wraps past the first photo',
    (await page.locator('[data-lightbox-counter]').textContent())?.trim() === '7 / 7',
  );

  const alt = await page.locator('[data-lightbox-img]').getAttribute('alt');
  check('image keeps alt text', !!alt && alt.length > 10, alt ?? '');

  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Escape closes', await box.isHidden());
  check(
    'body scroll restored',
    await page.evaluate(() => document.body.style.overflow === ''),
  );
  check(
    'focus returned to the photo',
    await page.evaluate(() =>
      document.activeElement?.hasAttribute('data-lightbox-item'),
    ),
  );

  // Backdrop click.
  await page.locator('[data-lightbox-item]').first().click();
  await page.waitForTimeout(250);
  await page.locator('[data-lightbox-stage]').click({ position: { x: 4, y: 4 } });
  await page.waitForTimeout(400);
  check('backdrop click closes', await box.isHidden());

  check('no JS errors (desktop)', errors.length === 0, errors.join('; '));
  await ctx.close();
}

/* ---------------- mobile: swipe ---------------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(`http://localhost:4322${BASE}/portfolio/svatby/`, { waitUntil: 'networkidle' });

  await page.locator('[data-lightbox-item]').first().tap();
  await page.waitForTimeout(300);
  const box = page.locator('[data-lightbox]');
  check('opens on tap', await box.isVisible());

  check('arrows hidden on touch', await page.locator('[data-lightbox-prev]').isHidden());

  const swipe = (x1, y1, x2, y2) =>
    page.evaluate(
      ([ax, ay, bx, by]) => {
        const el = document.querySelector('[data-lightbox]');
        const mk = (type, x, y) =>
          new TouchEvent(type, {
            bubbles: true,
            cancelable: true,
            touches: type === 'touchend' ? [] : [new Touch({ identifier: 1, target: el, clientX: x, clientY: y })],
            changedTouches: [new Touch({ identifier: 1, target: el, clientX: x, clientY: y })],
          });
        el.dispatchEvent(mk('touchstart', ax, ay));
        el.dispatchEvent(mk('touchend', bx, by));
      },
      [x1, y1, x2, y2],
    );

  await swipe(300, 400, 100, 400); // swipe left → next
  await page.waitForTimeout(250);
  check(
    'swipe left advances',
    (await page.locator('[data-lightbox-counter]').textContent())?.trim() === '2 / 7',
    await page.locator('[data-lightbox-counter]').textContent(),
  );

  await swipe(100, 400, 300, 400); // swipe right → previous
  await page.waitForTimeout(250);
  check(
    'swipe right goes back',
    (await page.locator('[data-lightbox-counter]').textContent())?.trim() === '1 / 7',
  );

  await swipe(200, 200, 200, 420); // flick down → close
  await page.waitForTimeout(400);
  check('flick down closes', await box.isHidden());

  check('no JS errors (mobile)', errors.length === 0, errors.join('; '));
  await ctx.close();
}

/* ---------------- mobile navigation ---------------- */
{
  const ctx = await browser.newContext({
    viewport: { width: 390, height: 844 },
    hasTouch: true,
    isMobile: true,
  });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:4322${BASE}/`, { waitUntil: 'networkidle' });

  const panel = page.locator('[data-mobile-nav]');
  check('nav sheet closed on load', await panel.isHidden());
  await page.locator('[data-nav-toggle]').tap();
  await page.waitForTimeout(350);
  check('nav sheet opens', await panel.isVisible());
  check(
    'toggle reports expanded',
    (await page.locator('[data-nav-toggle]').getAttribute('aria-expanded')) === 'true',
  );
  check(
    'page scroll locked behind sheet',
    await page.evaluate(() => document.body.style.overflow === 'hidden'),
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(400);
  check('Escape closes nav sheet', await panel.isHidden());
  await ctx.close();
}

await browser.close();
server.close();

let failed = 0;
for (const r of results) {
  if (!r.pass) failed++;
  console.log(`${r.pass ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  — ${r.detail}` : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
