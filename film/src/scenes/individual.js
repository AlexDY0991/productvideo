// CHAPTER XI — EVERYONE. Every age's gazer in quick succession; then all their lines of sight meet in one point.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU } from '../core.js';
import { grain, vignette, text, glow, fillRect, surface } from '../gfx.js';
import { drawGazer, sightline } from '../art/motif.js';

// [background painter, gazer options]
const ERAS = [
  { bg: (c) => grad(c, ['#1a1a40', '#d68a5c', '#ffcf8f']), g: { extra: 'long', style: 'rim', color: '#0a0606', rim: '#ffbf7a' }, line: '#ffe7c4' },
  { bg: (c) => c.drawImage(surface({ key: 'clay' }), 0, 0), g: { extra: 'short', style: 'blackfigure', color: '#1b1310' }, line: '#f6d2a6' },
  { bg: (c) => c.drawImage(surface({ key: 'xuan' }), 0, 0), g: { extra: 'bun', style: 'ink', color: '#1d1a17', width: 3 }, line: '#b22c22' },
  { bg: (c) => c.drawImage(surface({ key: 'parchment' }), 0, 0, W, H), g: { extra: 'long', style: 'engrave', color: '#4b2c17', width: 2.6 }, line: '#9a3b22' },
  { bg: (c) => grad(c, ['#050a1d', '#0d1636', '#2a1c2e']), g: { extra: 'bun', style: 'rim', color: '#0b0a10', rim: '#ffb060' }, line: '#ffd9a0' },
  { bg: (c) => c.drawImage(surface({ key: 'laid' }), 0, 0), g: { extra: 'tricorn', style: 'engrave', color: '#2b1d14', width: 2.4 }, line: '#b5502a' },
  { bg: (c) => grad(c, ['#8d8c8a', '#c9c7c2', '#d8d5ce']), g: { extra: 'aviator', style: 'silhouette', color: '#2a2826' }, line: '#ffffff' },
  { bg: (c) => grad(c, ['#24241f', '#7d7058', '#c9a979']), g: { extra: 'brodie', style: 'rim', color: '#120f0b', rim: '#ffcf90' }, line: '#ffe6bd' },
  { bg: (c) => grad(c, ['#14233f', '#1e5361', '#e9765b', '#e8b85a']), g: { extra: 'cap', style: 'silhouette', color: '#0b1426' }, line: '#fff1d0' },
  { bg: (c) => c.drawImage(surface({ key: 'blue' }), 0, 0), g: { extra: 'short', style: 'blueprint', color: '#e8f2ff', width: 2 }, line: '#ffffff' },
  { bg: (c) => { grad(c, ['#000000', '#02040c', '#06102a']); glow(c, W * 0.75, H * 0.3, 400, '#5a9cff', 0.25); }, g: { extra: 'helmet', style: 'silhouette', color: '#0b0c0f' }, line: '#cfe2ff' },
  { bg: (c) => grad(c, ['#04060f', '#0c1734', '#1d2a4a']), g: { extra: 'short', style: 'neon', color: '#5fe1ff', width: 2.4 }, line: '#d8f6ff' },
];

function grad(ctx, cols) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  cols.forEach((c, i) => g.addColorStop(i / (cols.length - 1), c));
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

const FOCUS = [W / 2, H * 0.3];

export default {
  transIn: { dur: 1.2, type: 'fade' },
  caption: 'rgba(255,248,236,0.92)',
  draw(ctx, t, dur) {
    const montageEnd = 7.0;
    if (t < montageEnd + 0.4) {
      // ---- rapid montage
      const n = ERAS.length, d = montageEnd / n;
      const i = clamp(Math.floor(t / d), 0, n - 1);
      const lt = t - i * d;
      const drawEra = (k, alpha) => {
        const e = ERAS[k];
        ctx.save(); ctx.globalAlpha = alpha;
        e.bg(ctx);
        const push = 1.15 + (lt / d) * 0.06;
        const gz = drawGazer(ctx, 260 - push * 40, H + 80, push, { ...e.g, tilt: -0.48, progress: 1 });
        sightline(ctx, gz.eye, FOCUS, 1, { color: e.line, alpha: 0.9, glint: false });
        ctx.restore();
      };
      drawEra(i, 1);
      if (i > 0 && lt < 0.12) drawEra(i - 1, 1 - lt / 0.12);
      fillRect(ctx, '#000', sseg(t, montageEnd - 0.2, montageEnd + 0.4));
    }
    if (t > montageEnd) {
      // ---- the lineup: all gazers, all sightlines meet in one point
      const a = sseg(t, montageEnd, montageEnd + 0.8);
      ctx.save(); ctx.globalAlpha = a;
      const g = ctx.createRadialGradient(FOCUS[0], FOCUS[1], 0, FOCUS[0], FOCUS[1], 1400);
      g.addColorStop(0, '#1d1a24'); g.addColorStop(1, '#050507');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      const n = ERAS.length;
      const arrived = [];
      for (let k = 0; k < n; k++) {
        const e = ERAS[k];
        const x = 40 + k * ((W - 120) / n), s = 0.34;
        const appear = sseg(t, montageEnd + 0.1 + k * 0.08, montageEnd + 0.6 + k * 0.08);
        ctx.save(); ctx.globalAlpha = a * appear;
        // tinted card behind each gazer (its era's palette)
        ctx.save(); ctx.beginPath(); ctx.rect(x - 6, H - 380, (W - 120) / n - 6, 220); ctx.clip(); e.bg(ctx);
        const gz = drawGazer(ctx, x, H - 160, s, { ...e.g, tilt: -0.55, width: (e.g.width || 2) * 0.6 }); ctx.restore();
        const p = sseg(t, montageEnd + 0.8 + k * 0.1, montageEnd + 2.4 + k * 0.1);
        sightline(ctx, gz.eye, FOCUS, p, { color: e.line, alpha: 0.85, width: 1.2, glint: p < 1 });
        if (p >= 1) arrived.push(k);
        ctx.restore();
      }
      // the meeting point
      const core = arrived.length / n;
      const grow = sseg(t, 10.6, 13.6);
      glow(ctx, FOCUS[0], FOCUS[1], 60 + core * 160 + grow * 1400, '#ffe2b8', (0.3 + core * 0.5) * a);
      glow(ctx, FOCUS[0], FOCUS[1], 14 + core * 22 + grow * 300, '#ffffff', (0.6 + core * 0.4) * a);
      fillRect(ctx, '#fff4e4', sseg(t, 12.6, 14.0) * 0.85, 'lighter');
    }
    vignette(ctx, 0.45);
    grain(ctx, t, 0.06);
  },
};
