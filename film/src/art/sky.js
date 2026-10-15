// Sky, stars, clouds, terrain layers — shared environment painters.
import { W, H, rng, fbm2, noise2, rgba, mix, clamp, lerp } from '../core.js';
import { makeCanvas, texture } from '../gfx.js';

export function skyGradient(ctx, stops, y0 = 0, y1 = H) {
  const g = ctx.createLinearGradient(0, y0, 0, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Pre-generated star field
const STARS = (() => {
  const R = rng(99);
  return Array.from({ length: 900 }, () => ({ x: R(), y: R() * R(), m: Math.pow(R(), 3), tw: R() * 6.28, sp: 0.5 + R() * 2 }));
})();
export function stars(ctx, t, alpha = 1, { yMax = 0.8, ox = 0, oy = 0, scale = 1 } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  for (const s of STARS) {
    if (s.y > yMax) continue;
    const a = alpha * (0.25 + 0.75 * s.m) * (0.75 + 0.25 * Math.sin(t * s.sp + s.tw));
    const r = (0.5 + s.m * 1.5) * scale;
    ctx.fillStyle = `rgba(255,250,240,${a})`;
    ctx.fillRect(((s.x * W + ox) % W + W) % W, s.y * H + oy, r, r);
  }
  ctx.restore();
}

// Soft cloud bank texture (cached, tileable horizontally)
export function cloudLayer(key, { w = W * 2, h = 360, seed = 1, scale = 4, density = 0.1, softness = 0.35, color = [255, 255, 255] } = {}) {
  return texture('cloud-' + key, () => {
    const lw = w >> 2, lh = h >> 2;
    const { c, ctx } = makeCanvas(lw, lh);
    const img = ctx.createImageData(lw, lh);
    for (let y = 0; y < lh; y++) {
      for (let x = 0; x < lw; x++) {
        const u = x / lw, v = y / lh;
        // horizontally tileable noise via circle mapping
        const ang = u * Math.PI * 2;
        const nx = Math.cos(ang) * scale * 0.6 + seed * 7, nz = Math.sin(ang) * scale * 0.6;
        let n = fbm2(nx + nz * 0.7 + 3, v * scale * 0.5 + nz * 0.5 + seed, 5);
        const vert = Math.sin(Math.PI * v);
        n = clamp((n + density) * vert / softness);
        const i = (y * lw + x) * 4;
        img.data[i] = color[0]; img.data[i + 1] = color[1]; img.data[i + 2] = color[2];
        img.data[i + 3] = n * 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const out = makeCanvas(w, h);
    out.ctx.imageSmoothingQuality = 'high';
    out.ctx.drawImage(c, 0, 0, w, h);
    return out.c;
  });
}
export function drawCloudLayer(ctx, tex, y, offset, alpha = 1, tint = null, h = null) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  const w = tex.width, hh = h || tex.height;
  const o = ((offset % w) + w) % w;
  ctx.drawImage(tex, -o, y, w, hh);
  ctx.drawImage(tex, w - o, y, w, hh);
  ctx.restore();
}

// Ridge line generator (mountains / dunes / hills)
export function ridge(seed, { base = 0.7, amp = 0.12, freq = 2.2, oct = 5, sharp = 0 } = {}) {
  const pts = [];
  for (let i = 0; i <= 240; i++) {
    const u = -0.2 + (i / 240) * 1.5;
    let n = fbm2(u * freq + seed * 13.1, seed * 3.7, oct);
    if (sharp) n = lerp(n, 1 - Math.abs(n) * 2, sharp);
    pts.push([u * W, (base - n * amp) * H]);
  }
  return pts;
}
export function fillRidge(ctx, pts, fill, ox = 0, yOff = 0) {
  ctx.save();
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.moveTo(pts[0][0] + ox, H + 10);
  for (const [x, y] of pts) ctx.lineTo(x + ox, y + yOff);
  ctx.lineTo(pts[pts.length - 1][0] + ox, H + 10);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// Sun disc with bloom
export function sun(ctx, x, y, r, core = '#fff6e0', haloCol = '#ffb36b', alpha = 1) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [rr, a] of [[r * 14, 0.08], [r * 6, 0.16], [r * 2.6, 0.32]]) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
    g.addColorStop(0, rgba(haloCol, a * alpha));
    g.addColorStop(1, rgba(haloCol, 0));
    ctx.fillStyle = g;
    ctx.fillRect(x - rr, y - rr, rr * 2, rr * 2);
  }
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = alpha;
  ctx.fillStyle = core;
  ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}

// Volumetric light rays from a point
export function rays(ctx, x, y, { n = 18, len = 1400, width = 0.06, color = '#fff2d0', alpha = 0.12, t = 0, seed = 3 } = {}) {
  if (alpha <= 0) return;
  const R = rng(seed);
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const a0 = R() * Math.PI * 2 + t * 0.02 * (R() - 0.5);
    const w = width * (0.4 + R());
    const g = ctx.createRadialGradient(x, y, 0, x, y, len);
    const aa = alpha * (0.4 + 0.6 * R()) * (0.7 + 0.3 * Math.sin(t * 0.6 + i));
    g.addColorStop(0, rgba(color, aa));
    g.addColorStop(1, rgba(color, 0));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, len, a0, a0 + w);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
