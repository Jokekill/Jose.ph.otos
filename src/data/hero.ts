import { photos, type ResolvedPhoto } from './portfolio';

/**
 * The homepage hero slideshow.
 *
 * Each slide is either one photograph filling the screen, or two side by side.
 * Alternating the two is what gives the sequence its rhythm — a wide landscape
 * after a pair of portraits reads very differently from four pairs in a row.
 *
 * To change the sequence when the real portfolio lands, edit this array only:
 * ids refer to entries in portfolio.real.ts / portfolio.demo.ts, and a missing
 * id fails the build loudly rather than shipping a gap.
 */
export type HeroSlide =
  | { layout: 'single'; photos: [string] }
  | { layout: 'split'; photos: [string, string] };

export const heroSlides: HeroSlide[] = [
  { layout: 'split', photos: ['portrety-02', 'koncerty-02'] },
  { layout: 'single', photos: ['svatby-01'] },
  { layout: 'split', photos: ['svatby-02', 'portrety-01'] },
  { layout: 'single', photos: ['koncerty-01'] },
];

/** How long each slide is held, in milliseconds. */
export const HERO_INTERVAL = 6000;

export interface ResolvedHeroSlide {
  layout: 'single' | 'split';
  photos: ResolvedPhoto[];
}

const byId = new Map(photos.map((p) => [p.id, p]));

/**
 * Slides whose photographs all exist. A slide naming a missing photo throws —
 * a silent skip would leave the hero quietly shorter than intended.
 */
export const resolvedHeroSlides: ResolvedHeroSlide[] = heroSlides.map((slide) => ({
  layout: slide.layout,
  photos: slide.photos.map((id) => {
    const found = byId.get(id);
    if (!found) {
      throw new Error(
        `Hero slide references unknown photo id "${id}". ` +
          `Known ids: ${[...byId.keys()].join(', ')}`,
      );
    }
    return found;
  }),
}));
