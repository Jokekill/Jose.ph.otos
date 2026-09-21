/**
 * Generates the temporary demo photo set and the matching data module.
 *
 * WHY GENERATED: this environment's network policy blocks every stock-photo
 * host, and hot-linking remote URLs is explicitly out of scope. Generating the
 * placeholders locally also removes any licensing question — the files are
 * produced by this script and are ours to delete.
 *
 * The images are abstract tonal fields, not fake photographs. They exist to
 * exercise the grid, the lightbox, srcset generation and the responsive rules
 * with realistic variation in aspect ratio, tonality and colour.
 *
 *   npm run demo:generate
 */
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import {
  DEMO_SET,
  dimensionsFor,
  orientationFor,
  paletteFor,
  assetPath,
} from './demo-set.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const assetsDir = join(root, 'src', 'assets', 'demo');

/* ---------- deterministic noise ----------------------------------------- */

function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** Smooth value-noise lattice sampled with cubic interpolation. */
function makeLattice(size, rand) {
  const g = new Float32Array(size * size);
  for (let i = 0; i < g.length; i++) g[i] = rand();
  return g;
}

const smooth = (t) => t * t * (3 - 2 * t);

function sampleLattice(g, size, x, y) {
  const fx = x * size;
  const fy = y * size;
  const x0 = Math.floor(fx);
  const y0 = Math.floor(fy);
  const tx = smooth(fx - x0);
  const ty = smooth(fy - y0);
  const i = (xx, yy) => g[(((yy % size) + size) % size) * size + (((xx % size) + size) % size)];
  const a = i(x0, y0);
  const b = i(x0 + 1, y0);
  const c = i(x0, y0 + 1);
  const d = i(x0 + 1, y0 + 1);
  return (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
}

/* ---------- colour ------------------------------------------------------- */

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Three-stop ramp: shadow → midtone → highlight. */
function ramp(stops, t) {
  const clamped = Math.min(1, Math.max(0, t));
  const [lo, mid, hi] = stops;
  if (clamped < 0.5) {
    const k = clamped * 2;
    return [0, 1, 2].map((i) => lo[i] + (mid[i] - lo[i]) * k);
  }
  const k = (clamped - 0.5) * 2;
  return [0, 1, 2].map((i) => mid[i] + (hi[i] - mid[i]) * k);
}

/* ---------- one image ---------------------------------------------------- */

const BASE = 240; // noise is computed small, then resized up smoothly

async function renderSpec(spec) {
  const { width, height } = dimensionsFor(spec.ratio);
  const stops = paletteFor(spec.palette).map(hexToRgb);
  const seed = hashString(spec.id);
  const rand = mulberry32(seed);
  const contrast = spec.contrast ?? 1;
  // Low frequencies: broad tonal masses, closer to a defocused photograph
  // than to a texture swatch.
  const scale = (spec.scale ?? 2) * 0.4;

  // Three octaves of value noise give broad tonal masses plus finer structure.
  const octaves = [
    { lattice: makeLattice(12, rand), size: 12, freq: scale * 1.0, amp: 1.0 },
    { lattice: makeLattice(24, rand), size: 24, freq: scale * 2.1, amp: 0.34 },
    { lattice: makeLattice(48, rand), size: 48, freq: scale * 4.3, amp: 0.11 },
  ];

  // Domain warp: displacing the sample coordinates with a second, slower noise
  // field breaks up the lattice grid that plain value noise leaves behind.
  const warpX = makeLattice(8, rand);
  const warpY = makeLattice(8, rand);
  const warpAmount = 0.14;
  const ampSum = octaves.reduce((s, o) => s + o.amp, 0);

  // A soft directional light gradient keeps frames from looking like wallpaper.
  const lightAngle = rand() * Math.PI * 2;
  const lx = Math.cos(lightAngle);
  const ly = Math.sin(lightAngle);

  const bw = spec.ratio.startsWith('portrait')
    ? Math.round(BASE * (width / height))
    : BASE;
  const bh = spec.ratio.startsWith('portrait')
    ? BASE
    : Math.round(BASE * (height / width));

  const buf = Buffer.alloc(bw * bh * 3);
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const u = x / bw;
      const v = y / bh;

      const wu = u + (sampleLattice(warpX, 8, u * 1.7, v * 1.7) - 0.5) * warpAmount;
      const wv = v + (sampleLattice(warpY, 8, u * 1.7, v * 1.7) - 0.5) * warpAmount;

      let n = 0;
      for (const o of octaves) {
        n += sampleLattice(o.lattice, o.size, wu * o.freq, wv * o.freq) * o.amp;
      }
      n /= ampSum;

      // Directional light + gentle vignette.
      const light = 0.5 + 0.5 * (lx * (u - 0.5) + ly * (v - 0.5));
      const dx = (u - 0.5) * 2;
      const dy = (v - 0.5) * 2;
      const vignette = 1 - 0.28 * Math.min(1, (dx * dx + dy * dy) * 0.7);

      let t = (n * 0.72 + light * 0.28) * vignette;
      t = 0.5 + (t - 0.5) * contrast;

      const [r, g, b] = ramp(stops, t);
      const i = (y * bw + x) * 3;
      buf[i] = Math.round(Math.min(255, Math.max(0, r)));
      buf[i + 1] = Math.round(Math.min(255, Math.max(0, g)));
      buf[i + 2] = Math.round(Math.min(255, Math.max(0, b)));
    }
  }

  let img = sharp(buf, { raw: { width: bw, height: bh, channels: 3 } })
    .resize(width, height, { kernel: 'lanczos3', fit: 'fill' })
    .blur(Math.max(0.3, width / 900));

  if (spec.mono) img = img.grayscale();

  // Fine grain keeps the frames from reading as flat CSS gradients.
  const grainRand = mulberry32(seed ^ 0x9e3779b9);
  const grain = Buffer.alloc(width * height);
  for (let i = 0; i < grain.length; i++) {
    grain[i] = Math.round(112 + (grainRand() - 0.5) * 30);
  }
  const grainPng = await sharp(grain, { raw: { width, height, channels: 1 } })
    .toColourspace('b-w')
    .png()
    .toBuffer();

  // A quiet corner mark so a demo frame is never mistaken for Pepa's work.
  const mark = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
       <text x="${width - Math.round(width * 0.03)}" y="${height - Math.round(width * 0.03)}"
             text-anchor="end" font-family="Helvetica, Arial, sans-serif"
             font-size="${Math.round(width * 0.018)}" letter-spacing="${Math.round(width * 0.004)}"
             fill="#ffffff" fill-opacity="0.34">DEMO</text>
     </svg>`,
  );

  return img
    .composite([
      { input: grainPng, blend: 'soft-light' },
      { input: mark, blend: 'over' },
    ])
    .jpeg({ quality: 78, chromaSubsampling: '4:4:4', mozjpeg: true })
    .toBuffer();
}

/* ---------- data module -------------------------------------------------- */

function buildDataModule(records) {
  const entries = records
    .map((r) => {
      const flags = [
        r.spec.featured ? '    featured: true,' : null,
        r.spec.cover ? '    cover: true,' : null,
        r.spec.hero ? '    hero: true,' : null,
      ].filter(Boolean);
      return [
        '  {',
        `    id: '${r.spec.id}',`,
        `    src: '${r.src}',`,
        `    category: '${r.spec.category}',`,
        `    alt: '${r.spec.alt.replace(/'/g, "\\'")}',`,
        `    orientation: '${r.orientation}',`,
        `    order: ${r.order},`,
        ...flags,
        '    placeholder: true,',
        '  },',
      ].join('\n');
    })
    .join('\n');

  return `import type { Photo } from './portfolio';

/**
 * GENERATED FILE — do not edit by hand.
 * Run \`npm run demo:generate\` to regenerate from scripts/demo-set.mjs.
 *
 * ⚠️ TEMPORARY DEMO CONTENT. Every entry carries \`placeholder: true\`.
 * Delete this file (and src/assets/demo/) when the real portfolio lands;
 * see README → "Demo assets".
 */
export const demoPhotos: Photo[] = [
${entries}
];
`;
}

/* ---------- run ---------------------------------------------------------- */

async function main() {
  await rm(assetsDir, { recursive: true, force: true });

  const perCategory = new Map();
  const records = [];

  for (const spec of DEMO_SET) {
    const order = (perCategory.get(spec.category) ?? 0) + 1;
    perCategory.set(spec.category, order);

    const src = assetPath(spec);
    const outPath = join(root, 'src', 'assets', src);
    await mkdir(dirname(outPath), { recursive: true });

    const jpeg = await renderSpec(spec);
    await writeFile(outPath, jpeg);

    records.push({ spec, src, order, orientation: orientationFor(spec.ratio) });
    process.stdout.write(`  ${src} (${(jpeg.length / 1024).toFixed(0)} kB)\n`);
  }

  await writeFile(
    join(root, 'src', 'data', 'portfolio.demo.ts'),
    buildDataModule(records),
  );

  const total = records.length;
  console.log(`\nGenerated ${total} demo photos + src/data/portfolio.demo.ts`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
