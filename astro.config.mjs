// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

/**
 * `SITE` and `BASE_PATH` are injected by the deploy workflow so the same build
 * works both on a GitHub Pages project site (https://user.github.io/repo/) and
 * on a future custom domain (https://example.com/ with BASE_PATH="/").
 */
const site = process.env.SITE ?? 'https://jokekill.github.io';
const base = process.env.BASE_PATH ?? '/Jose.ph.otos';

export default defineConfig({
  site,
  base,
  trailingSlash: 'always',
  compressHTML: true,
  build: { inlineStylesheets: 'auto' },
  integrations: [sitemap()],
  // No `image.layout` on purpose: the gallery controls its own sizing, so we
  // pass explicit `widths` + `sizes` per image instead of letting Astro inject
  // responsive styles that would fight the justified-row flex layout.
});
