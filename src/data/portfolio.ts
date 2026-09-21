import type { ImageMetadata } from 'astro';
import { resolveImage } from '../lib/images';
import { sortedCategories, type CategorySlug } from './categories';
import { demoPhotos } from './portfolio.demo';
import { realPhotos } from './portfolio.real';

export type Orientation = 'portrait' | 'landscape' | 'square';

export interface Photo {
  /** Stable, unique id. Used as the lightbox anchor. */
  id: string;
  /** Path relative to `src/assets`, e.g. "demo/portrety/portrait-01.jpg". */
  src: string;
  category: CategorySlug;
  /** Optional caption shown under the photo in the lightbox. Usually empty. */
  title?: string;
  /** Required. Describes the photograph for screen readers. */
  alt: string;
  orientation: Orientation;
  /** Shown in the homepage "vybrané práce" strip. */
  featured?: boolean;
  /** Exactly one per category should be the cover on the portfolio landing. */
  cover?: boolean;
  /** Candidate for the homepage hero. The lowest `order` among these wins. */
  hero?: boolean;
  /** Sort order within its category. */
  order: number;
  /**
   * TRUE while this is a temporary development asset. Must be false/absent for
   * every photo shipped to production.
   */
  placeholder?: boolean;
}

/** A photo with its resolved, build-time-optimisable image. */
export interface ResolvedPhoto extends Photo {
  image: ImageMetadata;
  aspectRatio: number;
}

/**
 * The active photo set.
 *
 * Real photographs take over automatically as soon as `portfolio.real.ts` has
 * entries — that is the whole demo → production switch. See README ("Demo
 * assets") for the removal checklist.
 */
export const usingDemoContent = realPhotos.length === 0;

const activePhotos: Photo[] = usingDemoContent ? demoPhotos : realPhotos;

function resolve(photo: Photo): ResolvedPhoto {
  const image = resolveImage(photo.src);
  return {
    ...photo,
    image,
    aspectRatio: image.width / image.height,
  };
}

export const photos: ResolvedPhoto[] = activePhotos
  .map(resolve)
  .sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));

/** Photos of one category, in display order. */
export function photosByCategory(slug: CategorySlug): ResolvedPhoto[] {
  return photos.filter((p) => p.category === slug);
}

/** Categories that actually have photographs — the only ones we route. */
export const activeCategories = sortedCategories.filter(
  (c) => photosByCategory(c.slug).length > 0,
);

/** The cover for a category: explicit `cover: true`, else the first photo. */
export function categoryCover(slug: CategorySlug): ResolvedPhoto | undefined {
  const set = photosByCategory(slug);
  return set.find((p) => p.cover) ?? set[0];
}

/** Homepage hero: explicit `hero: true`, else the first featured landscape. */
export function heroPhoto(): ResolvedPhoto | undefined {
  return (
    photos.find((p) => p.hero) ??
    photos.find((p) => p.featured && p.orientation === 'landscape') ??
    photos[0]
  );
}

/** Curated homepage preview, excluding whatever is already used as the hero. */
export function featuredPhotos(limit = 8): ResolvedPhoto[] {
  const hero = heroPhoto();
  return photos
    .filter((p) => p.featured && p.id !== hero?.id)
    .slice(0, limit);
}

/** Neighbour lookup for lightbox prev/next within one gallery. */
export function photoCount(): number {
  return photos.length;
}
