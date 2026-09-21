/**
 * The demo photo set — the single source for both the generated image files
 * and `src/data/portfolio.demo.ts`, so the two can never drift apart.
 *
 * TEMPORARY DEVELOPMENT CONTENT. Deleted in the real-portfolio phase.
 *
 * Aspect ratios and tonality are deliberately mixed (tall portraits, wide
 * landscapes, squares, very light and very dark frames, colour and
 * black & white) so the grid, the lightbox and the responsive rules are
 * exercised by real variation rather than by 30 identical rectangles.
 */

/** Long-edge size of the generated source files. */
export const LONG_EDGE = 2000;

const RATIOS = {
  portraitTall: [4, 5],
  portrait: [2, 3],
  landscape: [3, 2],
  landscapeWide: [16, 9],
  square: [1, 1],
};

/** Colour ramps: [shadow, midtone, highlight] as hex. */
const PALETTES = {
  warmSkin: ['#2a1c16', '#9a6b4f', '#f0ddcd'],
  neutralStudio: ['#1a1a1a', '#8e8e8e', '#f4f4f4'],
  airyWedding: ['#6b5e55', '#cdbfb2', '#fbf8f4'],
  coldWedding: ['#3d4550', '#a8b2bd', '#f2f5f8'],
  stageAmber: ['#0a0705', '#8a4a12', '#f5c07a'],
  stageMagenta: ['#0b0610', '#7d1f5c', '#f2a7d6'],
  stageBlue: ['#04070f', '#16456e', '#8fc6f2'],
  venueDusk: ['#141118', '#4e4557', '#c9bfd4'],
  greenRoom: ['#101713', '#3f6b4f', '#cfe3d5'],
  productWhite: ['#c8c8c8', '#ebebeb', '#ffffff'],
  productSand: ['#b39c82', '#ddcdb8', '#fdf8f1'],
  eventNeutral: ['#232326', '#77767c', '#e8e7ea'],
};

/**
 * @typedef {Object} DemoSpec
 * @property {string} id
 * @property {string} category
 * @property {keyof RATIOS} ratio
 * @property {keyof PALETTES} palette
 * @property {boolean} [mono]
 * @property {number} [scale]      noise frequency; low = broad shapes
 * @property {number} [contrast]
 * @property {string} alt
 * @property {boolean} [featured]
 * @property {boolean} [cover]
 * @property {boolean} [hero]
 */

/** @type {DemoSpec[]} */
export const DEMO_SET = [
  // ---- Portréty ---------------------------------------------------------
  { id: 'portrety-01', category: 'portrety', ratio: 'portrait', palette: 'warmSkin', cover: true, featured: true, alt: 'Dočasná ukázková fotografie — portrét na výšku v teplých tónech.' },
  { id: 'portrety-02', category: 'portrety', ratio: 'portraitTall', palette: 'neutralStudio', mono: true, featured: true, alt: 'Dočasná ukázková fotografie — černobílý portrét na výšku.' },
  { id: 'portrety-03', category: 'portrety', ratio: 'landscape', palette: 'warmSkin', scale: 2.4, alt: 'Dočasná ukázková fotografie — portrét na šířku v přirozeném světle.' },
  { id: 'portrety-04', category: 'portrety', ratio: 'portrait', palette: 'neutralStudio', alt: 'Dočasná ukázková fotografie — ateliérový portrét na světlém pozadí.' },
  { id: 'portrety-05', category: 'portrety', ratio: 'square', palette: 'warmSkin', mono: true, alt: 'Dočasná ukázková fotografie — čtvercový černobílý detail.' },
  { id: 'portrety-06', category: 'portrety', ratio: 'portraitTall', palette: 'airyWedding', scale: 1.6, alt: 'Dočasná ukázková fotografie — světlý portrét na výšku.' },
  { id: 'portrety-07', category: 'portrety', ratio: 'landscapeWide', palette: 'venueDusk', alt: 'Dočasná ukázková fotografie — portrét v širokém formátu za šera.' },

  // ---- Svatby -----------------------------------------------------------
  { id: 'svatby-01', category: 'svatby', ratio: 'landscape', palette: 'airyWedding', cover: true, hero: true, featured: true, scale: 1.8, alt: 'Dočasná ukázková fotografie — svatební reportáž na šířku ve světlých tónech.' },
  { id: 'svatby-02', category: 'svatby', ratio: 'portrait', palette: 'airyWedding', featured: true, alt: 'Dočasná ukázková fotografie — svatební portrét na výšku.' },
  { id: 'svatby-03', category: 'svatby', ratio: 'portrait', palette: 'coldWedding', mono: true, alt: 'Dočasná ukázková fotografie — černobílý svatební okamžik.' },
  { id: 'svatby-04', category: 'svatby', ratio: 'landscapeWide', palette: 'coldWedding', scale: 2.2, alt: 'Dočasná ukázková fotografie — panoramatický svatební snímek.' },
  { id: 'svatby-05', category: 'svatby', ratio: 'square', palette: 'airyWedding', alt: 'Dočasná ukázková fotografie — čtvercový svatební detail.' },
  { id: 'svatby-06', category: 'svatby', ratio: 'portraitTall', palette: 'coldWedding', alt: 'Dočasná ukázková fotografie — svatební snímek na výšku v chladných tónech.' },
  { id: 'svatby-07', category: 'svatby', ratio: 'landscape', palette: 'warmSkin', scale: 3, alt: 'Dočasná ukázková fotografie — večerní svatební reportáž.' },

  // ---- Koncerty ---------------------------------------------------------
  { id: 'koncerty-01', category: 'koncerty', ratio: 'landscape', palette: 'stageMagenta', cover: true, featured: true, contrast: 1.25, alt: 'Dočasná ukázková fotografie — koncert v purpurovém pódiovém světle.' },
  { id: 'koncerty-02', category: 'koncerty', ratio: 'portrait', palette: 'stageAmber', featured: true, contrast: 1.3, alt: 'Dočasná ukázková fotografie — hudebník v teplém pódiovém světle.' },
  { id: 'koncerty-03', category: 'koncerty', ratio: 'portraitTall', palette: 'stageBlue', contrast: 1.2, alt: 'Dočasná ukázková fotografie — koncertní snímek v modrém světle.' },
  { id: 'koncerty-04', category: 'koncerty', ratio: 'landscapeWide', palette: 'stageBlue', scale: 2.6, contrast: 1.35, alt: 'Dočasná ukázková fotografie — široký záběr na pódium.' },
  { id: 'koncerty-05', category: 'koncerty', ratio: 'square', palette: 'stageAmber', mono: true, contrast: 1.3, alt: 'Dočasná ukázková fotografie — černobílý koncertní detail.' },
  { id: 'koncerty-06', category: 'koncerty', ratio: 'portrait', palette: 'venueDusk', mono: true, alt: 'Dočasná ukázková fotografie — černobílý snímek z koncertního sálu.' },
  { id: 'koncerty-07', category: 'koncerty', ratio: 'landscape', palette: 'stageMagenta', scale: 3.4, alt: 'Dočasná ukázková fotografie — orchestr v barevném světle.' },

  // ---- Eventy -----------------------------------------------------------
  { id: 'eventy-01', category: 'eventy', ratio: 'landscape', palette: 'eventNeutral', cover: true, featured: true, alt: 'Dočasná ukázková fotografie — reportáž z firemní akce.' },
  { id: 'eventy-02', category: 'eventy', ratio: 'portrait', palette: 'venueDusk', alt: 'Dočasná ukázková fotografie — snímek z akce na výšku.' },
  { id: 'eventy-03', category: 'eventy', ratio: 'landscapeWide', palette: 'greenRoom', scale: 2.4, featured: true, alt: 'Dočasná ukázková fotografie — široký záběr na sál během akce.' },
  { id: 'eventy-04', category: 'eventy', ratio: 'square', palette: 'eventNeutral', mono: true, alt: 'Dočasná ukázková fotografie — černobílý detail z akce.' },
  { id: 'eventy-05', category: 'eventy', ratio: 'portraitTall', palette: 'eventNeutral', alt: 'Dočasná ukázková fotografie — vertikální snímek z konference.' },
  { id: 'eventy-06', category: 'eventy', ratio: 'landscape', palette: 'greenRoom', scale: 1.7, alt: 'Dočasná ukázková fotografie — venkovní kulturní akce.' },

  // ---- Produktové focení ------------------------------------------------
  { id: 'produktove-01', category: 'produktove', ratio: 'square', palette: 'productWhite', cover: true, featured: true, scale: 1.4, alt: 'Dočasná ukázková fotografie — produkt na bílém pozadí.' },
  { id: 'produktove-02', category: 'produktove', ratio: 'portrait', palette: 'productSand', alt: 'Dočasná ukázková fotografie — produktový snímek v teplých tónech.' },
  { id: 'produktove-03', category: 'produktove', ratio: 'landscape', palette: 'productWhite', scale: 1.3, alt: 'Dočasná ukázková fotografie — produkt na šířku na světlém pozadí.' },
  { id: 'produktove-04', category: 'produktove', ratio: 'square', palette: 'productSand', mono: true, alt: 'Dočasná ukázková fotografie — černobílé produktové zátiší.' },
  { id: 'produktove-05', category: 'produktove', ratio: 'portraitTall', palette: 'productWhite', alt: 'Dočasná ukázková fotografie — vysoký produktový snímek.' },
];

export function dimensionsFor(ratio) {
  const [w, h] = RATIOS[ratio];
  if (w >= h) return { width: LONG_EDGE, height: Math.round((LONG_EDGE * h) / w) };
  return { width: Math.round((LONG_EDGE * w) / h), height: LONG_EDGE };
}

export function orientationFor(ratio) {
  const [w, h] = RATIOS[ratio];
  if (w === h) return 'square';
  return w > h ? 'landscape' : 'portrait';
}

export function paletteFor(name) {
  return PALETTES[name];
}

export function assetPath(spec) {
  return `demo/${spec.category}/${spec.id}.jpg`;
}
