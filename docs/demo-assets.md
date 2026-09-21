# Demo assets — temporary development content

> ⚠️ **Every image described here must be gone before the site goes to
> production.** They are placeholders for building and testing the layout,
> nothing else.

## Where they came from

Not from a stock library. The brief's preferred route — downloading
clearly-licensed stock photographs — was **not possible in this environment**:
the network policy allows package registries only and refused every image host
(`picsum.photos`, `images.unsplash.com`, `images.pexels.com` all returned no
connection via the proxy). Hot-linking remote URLs was explicitly ruled out by
the brief, and rightly so.

So the demo images are **generated locally by a script in this repository**:

- Generator: `scripts/generate-demo-images.mjs`
- Specification: `scripts/demo-set.mjs`
- Command: `npm run demo:generate`

They are multi-octave value-noise fields with domain warping, mapped through
three-stop colour ramps, softened and grained. They read as defocused tonal
fields — deliberately *not* as fake photographs of people.

## Licensing

There is nothing to license. The files are produced by our own script from
pseudo-random numbers; no third-party work is included, and no attribution is
owed to anyone. Deleting them costs nothing.

## What they are for

Testing, specifically:

| Property | Coverage in the set |
| --- | --- |
| Orientation | 4:5 and 2:3 portrait, 3:2 and 16:9 landscape, 1:1 square |
| Tonality | very light (product, wedding), mid, very dark (stage) |
| Colour | warm, cold, heavily saturated (magenta/amber stage light), near-neutral |
| Black & white | 7 of the 32 are monochrome |

That variation is what exercises the justified gallery, the lightbox, srcset
selection and the responsive rules. A set of 32 near-identical rectangles would
not have caught the row-height bug that this one did.

## How to recognise them

Four independent markers — any one is enough:

1. **Location:** `src/assets/demo/**`. Real photographs go in
   `src/assets/portfolio/**`.
2. **Data:** every entry in `src/data/portfolio.demo.ts` has
   `placeholder: true`.
3. **Alt text:** every one begins with "Dočasná ukázková fotografie".
4. **Visually:** a faint `DEMO` mark in the bottom-right corner of each image.

## Inventory

32 images across five categories, all 2000px on the long edge, JPEG q78:

| Category | Count | Path |
| --- | --- | --- |
| Portréty | 7 | `src/assets/demo/portrety/` |
| Svatby | 7 | `src/assets/demo/svatby/` |
| Koncerty | 7 | `src/assets/demo/koncerty/` |
| Eventy | 6 | `src/assets/demo/eventy/` |
| Produktové focení | 5 | `src/assets/demo/produktove/` |

Full per-file metadata (id, category, orientation, flags) lives in
`src/data/portfolio.demo.ts`.

## Removal checklist

When the real portfolio lands, the switch is designed to be mechanical:

- [ ] Add real photographs to `src/assets/portfolio/<category>/`
- [ ] Register them in `src/data/portfolio.real.ts`
      (`usingDemoContent` flips to `false` automatically once it is non-empty)
- [ ] Verify each category has exactly one `cover: true`, and the site one `hero: true`
- [ ] Write real `alt` text for every photograph
- [ ] `rm -rf src/assets/demo`
- [ ] `rm src/data/portfolio.demo.ts` and drop its import from `src/data/portfolio.ts`
- [ ] `rm scripts/demo-set.mjs scripts/generate-demo-images.mjs`, drop the
      `demo:generate` script from `package.json`
- [ ] `rm docs/demo-assets.md` (this file)
- [ ] `npm run build`, then confirm: `grep -ri "demo" dist/ | grep -v sourcemap`
      returns nothing, and `grep -r "Dočasná ukázková" dist/` returns nothing
