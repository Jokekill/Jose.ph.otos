/**
 * Pricing.
 *
 * ⚠️ NO REAL PRICES HAVE BEEN SUPPLIED YET.
 *
 * Every package below has `priceConfirmed: false`, which makes the page render
 * "Cena na vyžádání" instead of inventing a number. When the client supplies
 * real prices: fill in `price`, set `priceConfirmed: true`, and the page starts
 * showing them. Nothing else has to change.
 */

export interface PricingItem {
  id: string;
  title: string;
  description: string;
  /** e.g. "od 4 500 Kč". Only shown when `priceConfirmed` is true. */
  price?: string;
  /** Bullet points: duration, deliverables, what is included. */
  details: string[];
  priceConfirmed: boolean;
}

export const pricing: PricingItem[] = [
  {
    id: 'portrety',
    title: 'Portréty',
    description:
      'Individuální portrétní focení v ateliéru nebo v exteriéru. Ideální pro profil, web, herecké portfolio nebo prostě pro sebe.',
    details: [
      'Délka focení: TODO — doplnit',
      'Počet upravených fotografií: TODO — doplnit',
      'Dodání: TODO — doplnit',
    ],
    priceConfirmed: false,
  },
  {
    id: 'svatby',
    title: 'Svatby',
    description:
      'Reportážní focení svatebního dne. Rozsah se domlouvá individuálně — od obřadu po celý den včetně večera.',
    details: [
      'Rozsah: TODO — doplnit (půldenní / celodenní)',
      'Počet upravených fotografií: TODO — doplnit',
      'Dodání: TODO — doplnit',
    ],
    priceConfirmed: false,
  },
  {
    id: 'eventy',
    title: 'Eventy',
    description:
      'Konference, firemní akce, festivaly a vernisáže. Výstupem je použitelná sada fotek pro web, tisk i sociální sítě.',
    details: [
      'Hodinová sazba: TODO — doplnit',
      'Expresní dodání výběru: TODO — doplnit',
      'Dodání kompletní sady: TODO — doplnit',
    ],
    priceConfirmed: false,
  },
  {
    id: 'koncerty',
    title: 'Koncerty',
    description:
      'Focení koncertů, orchestrů a hudebních projektů. Včetně promo fotografií kapel a souborů.',
    details: [
      'Cena za koncert: TODO — doplnit',
      'Promo focení kapely: TODO — doplnit',
      'Dodání: TODO — doplnit',
    ],
    priceConfirmed: false,
  },
  {
    id: 'produktove',
    title: 'Produktové focení',
    description:
      'Produkty na bílém pozadí i v reálných situacích. Cena se odvíjí od počtu produktů a náročnosti přípravy.',
    details: [
      'Cena za produkt: TODO — doplnit',
      'Balíčky pro e-shop: TODO — doplnit',
      'Dodání: TODO — doplnit',
    ],
    priceConfirmed: false,
  },
];

/** True while not a single package has a confirmed price. */
export const pricingIsPlaceholder = pricing.every((p) => !p.priceConfirmed);
