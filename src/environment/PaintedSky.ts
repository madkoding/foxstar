// ─── Painted Skies: hand-painted-looking 360° backdrops, made in code ───────
//
// The forest and the planet's core have no photo: their skies are painted
// procedurally in a soft watercolour style (layered washes, no hard edges)
// onto an equirectangular canvas, generated once the first time they're used.

import { fbm } from '../utils/noise';

type RGB = [number, number, number];
const W = 1024, H = 512;

const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const smooth = (a: number, b: number, x: number) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Noise that wraps seamlessly around the 360° horizontal axis. */
function wrapNoise(x: number, y: number, scale: number, oct: number, seed: number): number {
  const u = x / W;
  const a = fbm(x * scale + seed, y * scale, oct);
  const b = fbm((x - W) * scale + seed, y * scale, oct);
  return a * (1 - u) + b * u;
}

function paint(shade: (x: number, y: number, v: number) => RGB): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;
  const img = ctx.createImageData(W, H);
  for (let y = 0; y < H; y++) {
    const v = y / (H - 1);              // 0 = zenith, 0.5 = horizon, 1 = nadir
    for (let x = 0; x < W; x++) {
      const c = shade(x, y, v);
      const i = (y * W + x) * 4;
      img.data[i] = c[0]; img.data[i + 1] = c[1]; img.data[i + 2] = c[2]; img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/** Bosque de Esporas: a humid green-gold afternoon, towering cumulus, drifting pollen light. */
export function paintForestSky(): HTMLCanvasElement {
  const zenith: RGB = [58, 128, 150], mid: RGB = [150, 205, 190], horizon: RGB = [236, 240, 196], ground: RGB = [70, 110, 72];
  const cloudLit: RGB = [255, 250, 232], cloudShade: RGB = [150, 190, 180];
  return paint((x, y, v) => {
    let c = v < 0.5 ? mix(zenith, mid, smooth(0, 0.42, v)) : mix(horizon, ground, smooth(0.5, 0.62, v));
    if (v < 0.5) c = mix(c, horizon, smooth(0.36, 0.5, v));
    // Billowing cumulus, denser toward the horizon, lit from above.
    const n = wrapNoise(x, y, 0.006, 5, 11);
    const band = smooth(0.08, 0.3, v) * (1 - smooth(0.46, 0.54, v));
    const cloud = smooth(0.5, 0.68, n + band * 0.16) * band;
    const lit = wrapNoise(x, y - 14, 0.006, 5, 11) < n ? 0.25 : 1;
    c = mix(c, mix(cloudShade, cloudLit, lit), cloud * 0.92);
    // Watercolour bloom: uneven washes of warm light.
    const wash = wrapNoise(x, y, 0.0022, 3, 40);
    c = mix(c, [255, 236, 170], smooth(0.55, 0.9, wash) * 0.22 * (1 - smooth(0.5, 0.6, v)));
    return c;
  });
}

/** Corazón del Leviatán: not a sky — living tissue, veils of aurora, veins of light. */
export function paintCoreSky(): HTMLCanvasElement {
  const deep: RGB = [22, 8, 58], violet: RGB = [84, 40, 150], glow: RGB = [255, 150, 210], teal: RGB = [70, 230, 215], abyss: RGB = [10, 6, 34];
  return paint((x, y, v) => {
    let c = v < 0.5 ? mix(deep, violet, smooth(0, 0.5, v)) : mix(violet, abyss, smooth(0.5, 0.8, v));
    // A warm heart-glow along the horizon.
    c = mix(c, glow, Math.exp(-Math.pow((v - 0.5) / 0.09, 2)) * 0.55);
    // Vertical aurora curtains.
    const curtain = wrapNoise(x, y * 0.18, 0.012, 4, 70);
    const veil = smooth(0.52, 0.75, curtain) * (1 - smooth(0.42, 0.56, v)) * smooth(0.02, 0.2, v);
    c = mix(c, teal, veil * 0.6);
    // Branching veins of light, like nerves.
    const vein = Math.abs(wrapNoise(x, y, 0.009, 4, 130) - 0.5);
    c = mix(c, [200, 240, 255], (1 - smooth(0.0, 0.018, vein)) * 0.45 * (1 - smooth(0.6, 0.9, v)));
    // Soft cloudy tissue.
    const tissue = wrapNoise(x, y, 0.004, 4, 200);
    c = mix(c, [150, 90, 220], smooth(0.5, 0.85, tissue) * 0.3);
    return c;
  });
}
