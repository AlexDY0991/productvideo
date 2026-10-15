// The film's through-line: a person looking up, and the line of sight that leaves their eye.
import { clamp, smooth, rgba, lerp, noise2 } from '../core.js';
import { strokePolys, fillPolys, xform, hatch, glow } from '../gfx.js';
import { gazer } from './figures.js';

// Draw the gazer profile. (x, y) = bottom-left of the 360x500 box, s = scale.
// style: silhouette | rim | ink | engrave | blueprint | neon | photo | blackfigure
export function drawGazer(ctx, x, y, s, { tilt = -0.42, extra = null, style = 'silhouette', color = '#000', rim = '#ffcf8a', rimAlpha = 0.9, progress = 1, alpha = 1, flip = false, width = 2, t = 0 } = {}) {
  const g = gazer(tilt, extra);
  const T = (polys) => xform(polys, { x, y: y - 500 * s, s, sx: flip ? -s : s });
  const body = T(g.body), extraP = T(g.extra), ear = T(g.ear), eye = T(g.eye), brow = T(g.brow), visor = T(g.visor);
  ctx.save();
  ctx.globalAlpha *= alpha;
  if (style === 'silhouette' || style === 'rim' || style === 'blackfigure') {
    fillPolys(ctx, body, color, 1, 'nonzero');
    if (extraP.length) fillPolys(ctx, extraP, color, 1, 'nonzero');
    if (style === 'rim') {
      // rim light: stroke the front edge with a warm hairline, clipped to the face side
      ctx.save();
      ctx.beginPath();
      const ex = x + (flip ? -1 : 1) * 200 * s;
      ctx.rect(flip ? ex - 400 * s : ex, y - 520 * s, 400 * s, 520 * s);
      ctx.clip();
      strokePolys(ctx, body, { width: 2.2 * s * 2, color: rim, alpha: rimAlpha * 0.55 });
      strokePolys(ctx, body, { width: 0.9 * s * 2, color: '#fff7e8', alpha: rimAlpha * 0.6 });
      ctx.restore();
    }
    if (style === 'blackfigure') {
      // incised details (Greek black-figure technique)
      strokePolys(ctx, ear, { width: 1.6, color: '#d27a46', alpha: 0.9 });
      strokePolys(ctx, eye, { width: 1.6, color: '#d27a46', alpha: 0.9 });
      strokePolys(ctx, brow, { width: 1.4, color: '#d27a46', alpha: 0.7 });
    }
  } else if (style === 'ink' || style === 'engrave') {
    strokePolys(ctx, body, { progress, width, color, taper: style === 'ink', wobble: style === 'ink' ? 1.2 : 0, seed: 3 });
    strokePolys(ctx, extraP, { progress, width: width * 0.9, color, taper: true, seed: 5 });
    if (progress > 0.6) {
      const p2 = smooth((progress - 0.6) / 0.4);
      strokePolys(ctx, ear, { progress: p2, width: width * 0.8, color, taper: true });
      strokePolys(ctx, eye, { progress: p2, width: width * 0.9, color, taper: true });
      strokePolys(ctx, brow, { progress: p2, width: width * 0.7, color, taper: true });
    }
    if (style === 'engrave') hatch(ctx, body, { angle: -0.6, spacing: 4.5 * Math.max(1, s * 2), width: 0.7, color, alpha: 0.55 * progress });
  } else if (style === 'blueprint' || style === 'neon') {
    const c = color;
    const draw = (polys, w, a) => {
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      strokePolys(ctx, polys, { progress, width: w + 6, color: c, alpha: a * 0.08 });
      strokePolys(ctx, polys, { progress, width: w, color: c, alpha: a });
      ctx.restore();
    };
    draw(body, width, 0.9); draw(extraP, width * 0.8, 0.8); draw(visor, width * 0.8, 0.8);
    draw(ear, width * 0.7, 0.6); draw(eye, width * 0.8, 0.9);
  } else if (style === 'photo') {
    // tonal silhouette with soft internal gradient (for b/w photograph scenes)
    fillPolys(ctx, body, color, 1, 'nonzero');
    if (extraP.length) fillPolys(ctx, extraP, color, 1, 'nonzero');
  }
  if (visor.length && (style === 'silhouette' || style === 'rim')) {
    fillPolys(ctx, visor, '#1d2a3c', 1, 'nonzero');
    ctx.save();
    const vp = visor[0];
    ctx.clip(); // no-op guard
    ctx.restore();
  }
  ctx.restore();
  const e = g.eyePt;
  return { eye: [x + (flip ? -1 : 1) * e[0] * s, y - 500 * s + e[1] * s], dir: [g.dir[0] * (flip ? -1 : 1), g.dir[1]] };
}

// A line of sight: fine luminous line from p0 toward p1, revealed by progress, with a travelling glint.
export function sightline(ctx, p0, p1, progress, { color = '#fff4dc', width = 1.4, alpha = 1, glint = true, dashed = false, glow: gl = 10 } = {}) {
  if (progress <= 0 || alpha <= 0) return;
  const p = clamp(progress);
  const x = lerp(p0[0], p1[0], p), y = lerp(p0[1], p1[1], p);
  ctx.save();
  ctx.lineCap = 'round';
  const grad = ctx.createLinearGradient(p0[0], p0[1], x, y);
  grad.addColorStop(0, rgba(color, 0));
  grad.addColorStop(0.15, rgba(color, alpha * 0.55));
  grad.addColorStop(1, rgba(color, alpha));
  if (dashed) ctx.setLineDash([10, 8]);
  ctx.globalCompositeOperation = 'lighter';
  ctx.strokeStyle = grad;
  ctx.lineWidth = width + gl * 0.5;
  ctx.globalAlpha = 0.12;
  ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(x, y); ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.lineWidth = width;
  ctx.beginPath(); ctx.moveTo(p0[0], p0[1]); ctx.lineTo(x, y); ctx.stroke();
  ctx.restore();
  if (glint && p < 1) glow(ctx, x, y, 26, color, alpha * 0.9);
  if (glint) glow(ctx, x, y, 7, '#ffffff', alpha * (p < 1 ? 1 : 0.5));
  return [x, y];
}
