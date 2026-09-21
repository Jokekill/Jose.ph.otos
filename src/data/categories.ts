/**
 * Portfolio categories.
 *
 * Adding a category = add an entry here + put photos in
 * `src/assets/<demo|portfolio>/<slug>/` + register them in `portfolio.ts`.
 * Categories with no photos are skipped automatically at build time, so an
 * empty category never ships a broken page.
 */

export const CATEGORY_SLUGS = [
  'portrety',
  'svatby',
  'koncerty',
  'eventy',
  'produktove',
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

export interface Category {
  slug: CategorySlug;
  /** Name in navigation and headings. */
  title: string;
  /** One line under the title. Kept short on purpose. */
  intro: string;
  /** Longer paragraph on the category page. */
  description: string;
  /** Display order across portfolio landing + navigation. */
  order: number;
}

export const categories: Category[] = [
  {
    slug: 'portrety',
    title: 'Portréty',
    intro: 'Lidé takoví, jací jsou.',
    description:
      'Portrét nevzniká povelem „usmějte se“. Vzniká z rozhovoru, ze společného času a z chvíle, kdy člověk přestane řešit, že ho někdo fotí. Fotím v ateliéru i venku — podle toho, kde je vám líp.',
    order: 1,
  },
  {
    slug: 'svatby',
    title: 'Svatby',
    intro: 'Den, který uteče rychleji, než čekáte.',
    description:
      'Svatbu fotím reportážně. Držím se stranou, nechávám den plynout a fotím to, co se opravdu děje — přípravy, obřad, rodinu, večer. Domluvené portréty jsou jen krátká část dne.',
    order: 2,
  },
  {
    slug: 'koncerty',
    title: 'Koncerty',
    intro: 'Hudba, světlo a lidi, co ji dělají.',
    description:
      'Od klubů po orchestry. Na koncertech pracuji s tím světlem, které na pódiu je, a soustředím se na hráče, jejich soustředění a na atmosféru v sále.',
    order: 3,
  },
  {
    slug: 'eventy',
    title: 'Eventy',
    intro: 'Firemní a kulturní akce bez strojenosti.',
    description:
      'Konference, festivaly, vernisáže, firemní večery. Cílem je použitelná sada fotek, která akci popíše — prostor, program i lidi, kteří tam byli.',
    order: 4,
  },
  {
    slug: 'produktove',
    title: 'Produktové focení',
    intro: 'Věci fotografované s péčí.',
    description:
      'Produkty na bílém pozadí i v situacích, ve kterých se reálně používají. Vždycky s ohledem na to, kde fotky poběží — e-shop, sociální sítě nebo tisk.',
    order: 5,
  },
];

const bySlug = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
  return bySlug.get(slug as CategorySlug);
}

export const sortedCategories = [...categories].sort((a, b) => a.order - b.order);
