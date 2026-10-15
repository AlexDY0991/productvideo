// PROLOGUE — pre-dawn. A person looks up; birds cross the sky; the title appears where the gaze lands.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease } from '../core.js';
import { grain, vignette, text, glow, fillRect } from '../gfx.js';
import { skyGradient, stars, cloudLayer, drawCloudLayer, ridge, fillRidge } from '../art/sky.js';
import { drawBird } from '../art/figures.js';
import { drawGazer, sightline } from '../art/motif.js';
import { TITLE } from '../script.js';

const R = rng(7);
const FLOCK = Array.from({ length: 23 }, (_, i) => ({
  dx: (i === 0 ? 0 : R.range(-1, 1) * 260 + i * 34), dy: (i === 0 ? 0 : R.range(-1, 1) * 120 - i * 2), ph: R() * 6.28, sp: 9 + R() * 3, s: 0.9 + R() * 0.7,
}));
let ridges;

export default {
  transIn: { dur: 0.1, type: 'cut' },
  caption: 'rgba(255,240,220,0.9)',
  init() {
    ridges = [ridge(2, { base: 0.74, amp: 0.1, freq: 1.6 }), ridge(5, { base: 0.82, amp: 0.08, freq: 2.4 }), ridge(9, { base: 0.9, amp: 0.06, freq: 3.2 })];
    cloudLayer('dawn1', { seed: 3, h: 300, density: 0.0, softness: 0.4 });
    cloudLayer('dawn2', { seed: 8, h: 220, density: -0.05, softness: 0.3 });
  },
  draw(ctx, t, dur) {
    const dawn = sseg(t, 1.5, 14);
    const push = ease.inOutSine(seg(t, 0, dur));
    // --- sky
    skyGradient(ctx, [
      [0, `rgb(${lerp(3, 18, dawn)},${lerp(4, 26, dawn)},${lerp(10, 58, dawn)})`],
      [0.45, `rgb(${lerp(6, 64, dawn)},${lerp(8, 62, dawn)},${lerp(22, 104, dawn)})`],
      [0.68, `rgb(${lerp(10, 214, dawn)},${lerp(10, 132, dawn)},${lerp(24, 92, dawn)})`],
      [0.78, `rgb(${lerp(14, 255, dawn)},${lerp(12, 196, dawn)},${lerp(20, 140, dawn)})`],
      [1, `rgb(${lerp(8, 120, dawn)},${lerp(6, 70, dawn)},${lerp(10, 60, dawn)})`],
    ]);
    stars(ctx, t, (1 - dawn) * env(t, 0, 30, 2.5, 1));
    glow(ctx, W * 0.62, H * 0.8, 900, '#ffb070', 0.32 * dawn);
    glow(ctx, W * 0.62, H * 0.8, 260, '#fff0d0', 0.4 * dawn);
    // clouds lit from below
    drawCloudLayer(ctx, cloudLayer('dawn1'), H * 0.18 - push * 30, t * 6, 0.22 * dawn);
    drawCloudLayer(ctx, cloudLayer('dawn2'), H * 0.42 - push * 20, 900 + t * 12, 0.3 * dawn);

    // --- terrain (parallax)
    const p = push;
    ctx.save();
    fillRidge(ctx, ridges[0], `rgba(${lerp(10, 92, dawn)},${lerp(12, 70, dawn)},${lerp(26, 96, dawn)},1)`, -p * 30, p * 10);
    fillRidge(ctx, ridges[1], `rgba(${lerp(6, 46, dawn)},${lerp(7, 34, dawn)},${lerp(16, 56, dawn)},1)`, -p * 60, p * 24);
    fillRidge(ctx, ridges[2], `rgb(${lerp(3, 14, dawn)},${lerp(3, 10, dawn)},${lerp(6, 18, dawn)})`, -p * 100, p * 40);
    ctx.restore();

    // --- birds: flock crosses right → upper left
    const fb = seg(t, 4.5, 15.5);
    if (fb > 0 && fb < 1) {
      const lx = lerp(W * 1.08, W * 0.18, ease.inOutSine(fb));
      const ly = lerp(H * 0.36, H * 0.16, fb) + Math.sin(fb * 6) * 10;
      for (const b of FLOCK) {
        drawBird(ctx, lx + b.dx * (0.6 + fb * 0.5), ly + b.dy, 1.15 * b.s * (0.8 + fb * 0.3), t * b.sp + b.ph, { color: `rgba(${lerp(5, 30, dawn)},${lerp(5, 22, dawn)},${lerp(10, 30, dawn)},1)` });
      }
    }

    // --- the first gazer (rim-lit silhouette), head lifting as birds pass
    const tilt = lerp(-0.12, -0.5, sseg(t, 3.5, 9.5));
    const s = 1.55 + p * 0.12;
    const gx = 140 - p * 40, gy = H + 40 + p * 20;
    const g = drawGazer(ctx, gx, gy, s, { tilt, extra: 'long', style: 'rim', color: `rgb(${lerp(2, 10, dawn)},${lerp(2, 7, dawn)},${lerp(4, 12, dawn)})`, rim: '#ffbf7a', rimAlpha: 0.15 + dawn * 0.85 });

    // --- line of sight → toward the lead bird, then onward to where the title appears
    const sl = sseg(t, 8.0, 12.2);
    const target = [W * 0.62, H * 0.34];
    sightline(ctx, g.eye, target, sl, { color: '#ffe7c4', alpha: env(t, 8, 19.6, 0.5, 1.4) * 0.95 });

    // --- title
    const ta = env(t, 13.4, 19.8, 1.2, 1.0);
    if (ta > 0) {
      const tp = sseg(t, 13.4, 16.5);
      ctx.save();
      text(ctx, TITLE.zh.split('').join('  '), W * 0.62, H * 0.34 + 34, { font: 'Noto Serif SC', size: 112, weight: 600, color: '#fff8ec', spacing: 18, alpha: ta * tp, shadow: 30, shadowColor: 'rgba(255,170,90,0.35)' });
      text(ctx, TITLE.en, W * 0.62 + 6, H * 0.34 + 104, { font: 'Cormorant Garamond', size: 30, weight: 600, color: '#fff2de', spacing: 22 * (1.4 - tp * 0.4), alpha: ta * sseg(t, 14.2, 17) });
      ctx.globalAlpha = ta * sseg(t, 15, 17.5);
      ctx.strokeStyle = 'rgba(255,236,210,0.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(W * 0.62 - 120, H * 0.34 + 136); ctx.lineTo(W * 0.62 + 120, H * 0.34 + 136); ctx.stroke();
      text(ctx, TITLE.subZh, W * 0.62, H * 0.34 + 176, { font: 'Noto Serif SC', size: 24, weight: 400, color: '#fff0dc', spacing: 8, alpha: ta * sseg(t, 15.4, 17.8) });
      text(ctx, TITLE.subEn, W * 0.62, H * 0.34 + 210, { font: 'Cormorant Garamond', size: 21, weight: 500, style: 'italic', color: '#ffeedd', spacing: 1.5, alpha: ta * sseg(t, 15.8, 18.2) * 0.85 });
      ctx.restore();
    }

    vignette(ctx, 0.55);
    grain(ctx, t, 0.07);
    fillRect(ctx, '#000', 1 - sseg(t, 0, 2.2));
  },
};
