import type { ImageMetadata } from 'astro';

/**
 * Every photograph lives under `src/assets/` (not `public/`) so Astro's image
 * pipeline can emit AVIF/WebP derivatives with srcset and intrinsic dimensions.
 * The demo/real split is preserved as sibling folders:
 *
 *   src/assets/demo/<category>/…      temporary development assets
 *   src/assets/portfolio/<category>/… the real portfolio
 *
 * `src` values in the portfolio data model are paths relative to `src/assets`,
 * e.g. "demo/portrety/portrait-01.jpg".
 */
const modules = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/**/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);

const images = new Map<string, ImageMetadata>();
for (const [key, mod] of Object.entries(modules)) {
  images.set(key.replace('/src/assets/', ''), mod.default);
}

/** Resolve an asset-relative path to Astro image metadata. Throws if missing. */
export function resolveImage(src: string): ImageMetadata {
  const found = images.get(src.replace(/^\/+/, ''));
  if (!found) {
    throw new Error(
      `Photo asset not found: "${src}". Expected a file at src/assets/${src}. ` +
        `Known assets: ${[...images.keys()].slice(0, 5).join(', ')}…`,
    );
  }
  return found;
}

export function hasImage(src: string): boolean {
  return images.has(src.replace(/^\/+/, ''));
}

/** All asset paths currently present — used by the content sanity check. */
export function listImagePaths(): string[] {
  return [...images.keys()];
}
