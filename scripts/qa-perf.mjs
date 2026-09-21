/**
 * Measures what a visitor actually downloads for the first screen, plus LCP
 * and layout shift. Dev-only, run against `dist/`.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { join, extname } from 'node:path';
import { chromium } from 'playwright';

const BASE = '/jose.ph.otos';
const DIST = new URL('../dist/', import.meta.url).pathname;
const T = { '.html': 'text/html;charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

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
await new Promise((r) => server.listen(4323, r));

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium',
});

const PAGES = ['/', '/portfolio/', '/portfolio/svatby/', '/o-mne/', '/cenik/', '/kontakt/'];
const DEVICES = [
  { name: 'mobile 390', width: 390, height: 844, mobile: true },
  { name: 'desktop 1440', width: 1440, height: 900, mobile: false },
];

for (const dev of DEVICES) {
  console.log(`\n### ${dev.name}`);
  for (const url of PAGES) {
    const ctx = await browser.newContext({
      viewport: { width: dev.width, height: dev.height },
      isMobile: dev.mobile,
      hasTouch: dev.mobile,
      deviceScaleFactor: dev.mobile ? 2 : 1,
    });
    const page = await ctx.newPage();
    const bytes = { total: 0, image: 0, font: 0, css: 0, js: 0, html: 0 };
    page.on('response', async (res) => {
      try {
        const buf = await res.body();
        const ct = res.headers()['content-type'] ?? '';
        bytes.total += buf.length;
        if (ct.startsWith('image/')) bytes.image += buf.length;
        else if (ct.startsWith('font/')) bytes.font += buf.length;
        else if (ct.includes('css')) bytes.css += buf.length;
        else if (ct.includes('javascript')) bytes.js += buf.length;
        else if (ct.includes('html')) bytes.html += buf.length;
      } catch { /* redirects have no body */ }
    });

    await page.goto(`http://localhost:4323${BASE}${url}`, { waitUntil: 'load' });
    // Settle: let LCP and any shift land without scrolling (scrolling would
    // pull in below-the-fold lazy images and misreport the first screen).
    await page.waitForTimeout(1500);

    const vitals = await page.evaluate(
      () =>
        new Promise((resolve) => {
          let lcp = 0;
          let cls = 0;
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) lcp = Math.max(lcp, e.startTime);
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          new PerformanceObserver((l) => {
            for (const e of l.getEntries()) if (!e.hadRecentInput) cls += e.value;
          }).observe({ type: 'layout-shift', buffered: true });
          const nav = performance.getEntriesByType('navigation')[0];
          setTimeout(
            () =>
              resolve({
                lcp: Math.round(lcp),
                cls: Number(cls.toFixed(4)),
                domContentLoaded: Math.round(nav?.domContentLoaded ?? 0),
              }),
            300,
          );
        }),
    );

    const kb = (n) => `${(n / 1024).toFixed(0)}k`;
    console.log(
      `  ${url.padEnd(22)} LCP ${String(vitals.lcp).padStart(5)}ms  CLS ${String(vitals.cls).padEnd(6)}  ` +
        `total ${kb(bytes.total).padStart(6)}  img ${kb(bytes.image).padStart(6)}  ` +
        `font ${kb(bytes.font).padStart(5)}  css ${kb(bytes.css).padStart(5)}  js ${kb(bytes.js)}`,
    );
    await ctx.close();
  }
}

await browser.close();
server.close();
