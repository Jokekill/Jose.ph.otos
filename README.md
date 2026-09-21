# jose.ph.otos

Photography portfolio for **Pepa Dočkal** — *„Fotím lidi, co se neradi fotí.“*

> ⚠️ **The site currently runs on temporary demo photographs.** They are
> generated placeholders, not Pepa's work, and must be removed before launch.
> See [`docs/demo-assets.md`](docs/demo-assets.md).

## Project

A static, Czech-language photography portfolio: homepage, portfolio landing,
five category galleries, About, Pricing and Contact. White background,
near-black type, photographs doing all the talking.

Working state, decisions and open questions live in
[`AGENT_PROGRESS.md`](AGENT_PROGRESS.md) — read that first when picking the
project back up.

## Stack

| | |
| --- | --- |
| Framework | [Astro](https://astro.build) 7, static output |
| Language | TypeScript (strict) |
| Styling | Hand-written CSS with custom properties. No CSS framework |
| JS shipped | ~4 kB: navigation, scroll reveal, lightbox. No UI framework |
| Images | Astro's built-in pipeline (sharp) → AVIF + WebP + JPEG fallback |
| Fonts | Inter Variable + Instrument Serif, self-hosted, latin + latin-ext |
| Deployment | GitHub Actions → GitHub Pages |

## Development

```bash
npm install
npm run dev          # http://localhost:4321/jose.ph.otos/
```

Note the base path — the dev server serves the site under `/jose.ph.otos/`,
matching the GitHub Pages project site.

```bash
npm run check        # astro check (TypeScript + template diagnostics)
npm run demo:generate  # regenerate the temporary demo photographs
```

## Build

```bash
npm run build        # astro check && astro build  →  dist/
npm run preview      # serve dist/ locally
```

Override the deployment target when building for somewhere else:

```bash
SITE=https://example.com BASE_PATH=/ npm run build
```

## Deployment

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every
push to `main`. `SITE` and `BASE_PATH` come from `actions/configure-pages`, so
the same source works for a project site and for a custom domain.

**One-time setup:** GitHub → Settings → Pages → *Source: GitHub Actions*.

**Moving to a custom domain:** add the domain in Settings → Pages, put a
`CNAME` file in `public/`, and `configure-pages` will report the new origin
with `BASE_PATH=/` automatically. No source changes needed — every internal
link goes through `path()` in `src/lib/paths.ts`.

`.github/workflows/ci.yml` builds every branch and pull request.

## Portfolio

Photographs live under `src/assets/`, **not** `public/` — only files under
`src/` get responsive derivatives, srcset and intrinsic dimensions from Astro's
image pipeline.

```
src/assets/
├── demo/        ← temporary placeholders (delete before launch)
│   ├── portrety/  svatby/  koncerty/  eventy/  produktove/
└── portfolio/   ← the real portfolio goes here
    └── <category>/
```

The data model lives in `src/data/`:

| File | Purpose |
| --- | --- |
| `portfolio.ts` | Types, the demo→real switch, every query helper |
| `portfolio.real.ts` | **Register real photographs here** |
| `portfolio.demo.ts` | Generated demo entries (delete at swap time) |
| `categories.ts` | Category definitions |

`usingDemoContent` flips to `false` the moment `realPhotos` is non-empty — that
single change swaps the whole site over to the real portfolio.

## Adding a photo

1. Put the file in `src/assets/portfolio/<category>/<name>.jpg`
2. Add an entry to `realPhotos` in `src/data/portfolio.real.ts`:

```ts
{
  id: 'portrety-anna-01',
  src: 'portfolio/portrety/anna-01.jpg',   // relative to src/assets
  category: 'portrety',
  alt: 'Anna u okna v ateliéru, boční světlo',
  orientation: 'portrait',
  order: 1,
}
```

`src` is resolved at build time — a typo fails the build with the list of known
assets rather than shipping a broken image. Width, height and aspect ratio are
read from the file; you never type them.

## Categories

Add an entry to `categories` in `src/data/categories.ts` and add its slug to
`CATEGORY_SLUGS`:

```ts
{ slug: 'street', title: 'Street', intro: '…', description: '…', order: 6 }
```

Routes, navigation, the portfolio landing page and the footer all follow
automatically. **A category with no photographs is skipped entirely** — no
empty page is ever generated, so you can add a category before its photos.

Removing a category is the reverse. Don't create one just to have it.

## Ordering

`order` sorts photographs **within their category** (ascending). Reorder a
gallery by editing those numbers — leaving gaps (10, 20, 30) makes inserting
easier later.

Categories are ordered by their own `order` field in `categories.ts`.

## Featured photos

| Flag | Effect |
| --- | --- |
| `hero: true` | The big photograph on the homepage. Set it on **one** photo |
| `featured: true` | Appears in "Vybrané práce" on the homepage |
| `cover: true` | The category's photograph on the portfolio landing page. **One per category** |

Sensible fallbacks if you set nothing: the hero falls back to the first
featured landscape, a category cover falls back to its first photograph.

## Pricing

`src/data/pricing.ts`. Each package needs a price *and* `priceConfirmed: true`
before the number is shown:

```ts
{
  id: 'portrety',
  title: 'Portréty',
  description: '…',
  price: 'od 4 500 Kč',
  details: ['90 minut focení', '15 upravených fotografií', 'Dodání do 10 dnů'],
  priceConfirmed: true,
}
```

Until then the page shows "Cena na vyžádání" and a notice that prices are being
prepared — **it never invents a number**.

## About

`src/data/about.ts` — `lead`, `paragraphs` and `facts`. While
`textConfirmed: false`, the page shows a visible "draft text" notice. Set it to
`true` once Pepa has approved the copy and the notice disappears.

Brand-level copy (name, claim, location, contact channels) is in
`src/data/site.ts`. Contact channels marked `placeholder: true` are hidden from
the footer and shown as "Zatím nedoplněno" on the contact page.

## Demo assets

Every temporary image is identifiable four ways:

1. it lives under `src/assets/demo/`
2. its data entry has `placeholder: true`
3. its alt text starts with *"Dočasná ukázková fotografie"*
4. it has a faint `DEMO` mark in the corner

**None of it may ship.** The full removal checklist is at the end of
[`docs/demo-assets.md`](docs/demo-assets.md). Quick verification after the swap:

```bash
npm run build
grep -r "Dočasná ukázková" dist/   # must return nothing
ls src/assets/demo 2>/dev/null     # must not exist
```

## Repository layout

```
src/
├── assets/       photographs (demo + real)
├── components/   Header, Footer, SEO, Gallery, PhotoFigure, Lightbox
├── data/         portfolio, categories, site, pricing, about
├── layouts/      BaseLayout
├── lib/          image resolver, base-path helper
├── pages/        routes
└── styles/       global.css — the entire design system
docs/             design research, demo asset provenance
scripts/          demo image generator, responsive QA harness
```
