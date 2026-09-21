/**
 * Accessibility + link integrity check over the built site. Dev-only.
 *
 * Runs axe-core on every page (also with the lightbox and the mobile menu
 * open, since those states are invisible to a plain page scan), and verifies
 * that every internal link and image resolves.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const BASE = '/jose.ph.otos';
const DIST = new URL('../dist/', import.meta.url).pathname;
const T = { '.html': 'text/html;charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

const missing = new Set();
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
    missing.add(req.url);
    res.writeHead(404).end('nf');
  }
});
await new Promise((r) => server.listen(4325, r));

const PAGES = ['/', '/portfolio/', '/portfolio/portrety/', '/portfolio/svatby/',
  '/portfolio/koncerty/', '/portfolio/eventy/', '/portfolio/produktove/',
  '/o-mne/', '/cenik/', '/kontakt/'];

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
});
let violations = 0;
const seenLinks = new Set();
const badLinks = [];

const scan = async (page, label) => {
  const r = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'])
    .analyze();
  for (const v of r.violations) {
    violations++;
    console.log(`  ✗ [${v.impact}] ${label}: ${v.id} — ${v.help} (${v.nodes.length}×)`);
    console.log(`      ${v.nodes[0]?.html?.slice(0, 120)}`);
  }
};

for (const url of PAGES) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:4325${BASE}${url}`, { waitUntil: 'networkidle' });
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = 'auto';
    const w = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) { scrollTo(0, y); await w(60); }
    scrollTo(0, 0); await w(300);
  });

  console.log(`\n${url}`);
  await scan(page, url);

  // Collect internal links for the integrity check.
  for (const href of await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')))) {
    if (!href || /^(https?:|mailto:|tel:|#)/.test(href)) continue;
    seenLinks.add(href);
  }

  // Lightbox open — a state a plain scan never reaches.
  const trigger = page.locator('[data-lightbox-item]').first();
  if (await trigger.count()) {
    await trigger.click();
    // Wait out the open transition: axe reads colour contrast from the
    // composited result, and a half-faded overlay reports false failures.
    await page.waitForTimeout(900);
    await scan(page, `${url} (lightbox open)`);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  }
  await ctx.close();
}

// Mobile navigation sheet open.
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  await page.goto(`http://localhost:4325${BASE}/`, { waitUntil: 'networkidle' });
  await page.locator('[data-nav-toggle]').tap();
  await page.waitForTimeout(900);
  console.log('\n/ (mobile menu open)');
  await scan(page, '/ (mobile menu open)');
  await ctx.close();
}

// Link integrity.
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  for (const href of seenLinks) {
    const res = await page.goto(`http://localhost:4325${href}`, { waitUntil: 'domcontentloaded' });
    if (!res || res.status() >= 400) badLinks.push(`${href} → ${res?.status()}`);
  }
  await ctx.close();
}

await browser.close();
server.close();

console.log(`\n--- summary ---`);
console.log(`axe violations : ${violations}`);
console.log(`internal links : ${seenLinks.size} checked, ${badLinks.length} broken`);
badLinks.forEach((l) => console.log(`  ✗ ${l}`));
console.log(`missing assets : ${missing.size}`);
[...missing].forEach((m) => console.log(`  ✗ ${m}`));
process.exit(violations || badLinks.length || missing.size ? 1 : 0);
