// Canvas drawing toolkit: textures, strokes, hatching, glow, typography, post effects.
import { W, H, clamp, lerp, rng, fbm2, noise2, rgba, hex, polyLength, smooth } from './core.js';

export function makeCanvas(w = W, h = H) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  return { c, ctx };
}

// ---------------------------------------------------------------------------
// Procedural paper / surface textures (generated once, cached)
const texCache = new Map();
export function texture(key, fn) {
  let t = texCache.get(key);
  if (!t) { t = fn(); texCache.set(key, t); }
  return t;
}

// Generic noisy surface: base colour modulated by fbm, optional fibres + burnt edges.
export function surface({ key, base, dark, light, scale = 3.2, contrast = 0.5, fibres = 0, edge = 0, seed = 1, spots = 0, w = W, h = H }) {
  return texture(key, () => {
    const lw = w >> 1, lh = h >> 1;
    const { c, ctx } = makeCanvas(lw, lh);
    const img = ctx.createImageData(lw, lh);
    const b = hex(base), d = hex(dark || base), l = hex(light || base);
    const ox = seed * 17.3, oy = seed * 9.1;
    for (let y = 0; y < lh; y++) {
      for (let x = 0; x < lw; x++) {
        const nx = x / lw * scale * (lw / lh), ny = y / lh * scale;
        let n = fbm2(nx + ox, ny + oy, 5) * contrast;
        n += noise2(nx * 9 + ox, ny * 9) * 0.06;
        let r, g, bb;
        if (n < 0) { const k = clamp(-n * 1.6); r = lerp(b[0], d[0], k); g = lerp(b[1], d[1], k); bb = lerp(b[2], d[2], k); }
        else { const k = clamp(n * 1.6); r = lerp(b[0], l[0], k); g = lerp(b[1], l[1], k); bb = lerp(b[2], l[2], k); }
        if (edge) {
          const ex = Math.min(x, lw - 1 - x) / lw, ey = Math.min(y, lh - 1 - y) / lh;
          const e = clamp(1 - Math.min(ex * 5.5, ey * 3.2) + fbm2(nx * 2, ny * 2, 3) * 0.25);
          const k = Math.pow(e, 2.2) * edge;
          r = lerp(r, d[0] * 0.55, k); g = lerp(g, d[1] * 0.5, k); bb = lerp(bb, d[2] * 0.45, k);
        }
        const i = (y * lw + x) * 4;
        img.data[i] = r; img.data[i + 1] = g; img.data[i + 2] = bb; img.data[i + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
    const out = makeCanvas(w, h);
    out.ctx.imageSmoothingQuality = 'high';
    out.ctx.drawImage(c, 0, 0, w, h);
    const R = rng(seed * 31 + 7);
    if (fibres) {
      out.ctx.lineCap = 'round';
      for (let i = 0; i < fibres; i++) {
        const x = R() * w, y = R() * h, a = R() * Math.PI, len = 4 + R() * 26;
        out.ctx.strokeStyle = R() < 0.5 ? rgba(l, 0.18 * R()) : rgba(d, 0.14 * R());
        out.ctx.lineWidth = 0.6 + R() * 0.8;
        out.ctx.beginPath();
        out.ctx.moveTo(x, y);
        out.ctx.quadraticCurveTo(x + Math.cos(a) * len * 0.5 + R() * 4, y + Math.sin(a) * len * 0.5 + R() * 4, x + Math.cos(a) * len, y + Math.sin(a) * len);
        out.ctx.stroke();
      }
    }
    for (let i = 0; i < spots; i++) {
      const x = R() * w, y = R() * h, r = 20 + R() * 140;
      const g = out.ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(d, 0.10 * R()));
      g.addColorStop(0.7, rgba(d, 0.05 * R()));
      g.addColorStop(1, rgba(d, 0));
      out.ctx.fillStyle = g;
      out.ctx.fillRect(x - r, y - r, r * 2, r * 2);
    }
    return out.c;
  });
}

// ---------------------------------------------------------------------------
// Film grain: a few pre-generated noise tiles, one picked + offset per frame.
let grainTiles = null;
function initGrain() {
  grainTiles = [];
  const R = rng(4242);
  for (let k = 0; k < 6; k++) {
    const { c, ctx } = makeCanvas(256, 256);
    const img = ctx.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) {
      const v = 128 + R.gauss() * 46;
      img.data[i * 4] = img.data[i * 4 + 1] = img.data[i * 4 + 2] = clamp(v, 0, 255);
      img.data[i * 4 + 3] = 255;
    }
    ctx.putImageData(img, 0, 0);
    grainTiles.push(c);
  }
}
export function grain(ctx, t, amount = 0.08, size = 1.5) {
  if (amount <= 0) return;
  if (!grainTiles) initGrain();
  const f = Math.floor(t * 24);
  const tile = grainTiles[((f % grainTiles.length) + grainTiles.length) % grainTiles.length];
  const R = rng(f * 13 + 1);
  ctx.save();
  ctx.globalAlpha = amount;
  ctx.globalCompositeOperation = 'overlay';
  const pat = ctx.createPattern(tile, 'repeat');
  const m = new DOMMatrix().translateSelf(R() * 256, R() * 256).scaleSelf(size, size);
  pat.setTransform(m);
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

export function vignette(ctx, strength = 0.5, color = '#000', inner = 0.45) {
  if (strength <= 0) return;
  const g = ctx.createRadialGradient(W / 2, H / 2, H * inner, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, rgba(color, 0));
  g.addColorStop(1, rgba(color, strength));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

// Old-film artefacts: vertical scratches, dust specks, flicker.
export function filmDamage(ctx, t, amt = 1, col = '#fff') {
  const f = Math.floor(t * 24);
  const R = rng(f * 97 + 3);
  ctx.save();
  ctx.globalAlpha = 1;
  const ns = R() < 0.6 ? 1 + (R() * 2 | 0) : 0;
  for (let i = 0; i < ns * amt; i++) {
    const x = R() * W;
    ctx.strokeStyle = rgba(col, 0.08 + R() * 0.14);
    ctx.lineWidth = 0.6 + R() * 1.4;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + (R() - 0.5) * 6, H); ctx.stroke();
  }
  const nd = (R() * 14 * amt) | 0;
  for (let i = 0; i < nd; i++) {
    ctx.fillStyle = R() < 0.5 ? rgba('#000', 0.35 * R()) : rgba(col, 0.25 * R());
    const x = R() * W, y = R() * H, r = 0.6 + R() * 2.4;
    ctx.beginPath(); ctx.ellipse(x, y, r, r * (0.4 + R()), R() * 3, 0, Math.PI * 2); ctx.fill();
  }
  if (R() < 0.08 * amt) { // hair
    ctx.strokeStyle = rgba('#000', 0.25); ctx.lineWidth = 1;
    const x = R() * W, y = R() * H;
    ctx.beginPath(); ctx.moveTo(x, y);
    ctx.bezierCurveTo(x + 30, y + 10, x + 10, y + 50, x + 40, y + 70); ctx.stroke();
  }
  ctx.restore();
  return 1 + (R() - 0.5) * 0.06 * amt; // flicker factor
}

// ---------------------------------------------------------------------------
// Stroking polylines with draw-on progress, ink wobble and taper.

// Total-length based reveal across a list of polylines (sequential).
export function strokePolys(ctx, polys, opt = {}) {
  const { progress = 1, width = 2, color = '#000', alpha = 1, wobble = 0, seed = 0, taper = false, sequential = true, cap = 'round', join = 'round', dash = null, t = 0 } = opt;
  if (progress <= 0 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = cap; ctx.lineJoin = join;
  if (dash) ctx.setLineDash(dash);
  let total = 0;
  const lens = polys.map((p) => { const l = p._len ?? (p._len = polyLength(p)); total += l; return l; });
  let budget = sequential ? total * progress : Infinity;
  for (let k = 0; k < polys.length; k++) {
    const p = polys[k];
    let lim = sequential ? budget : lens[k] * progress;
    if (lim <= 0) break;
    budget -= lens[k];
    const wob = wobble;
    if (taper) {
      // Draw as segments with varying width (ink pressure)
      let acc = 0;
      for (let i = 1; i < p.length && acc < lim; i++) {
        const [x0, y0] = p[i - 1]; let [x1, y1] = p[i];
        const d = Math.hypot(x1 - x0, y1 - y0);
        if (acc + d > lim) { const kk = (lim - acc) / d; x1 = x0 + (x1 - x0) * kk; y1 = y0 + (y1 - y0) * kk; }
        const u = (acc + d * 0.5) / lens[k];
        const press = Math.sin(Math.PI * clamp(u)) * 0.75 + 0.25 + noise2(seed + k * 3.1, acc * 0.02) * 0.25;
        ctx.lineWidth = width * press;
        ctx.beginPath();
        ctx.moveTo(x0 + (wob ? noise2(x0 * 0.05 + seed, y0 * 0.05) * wob : 0), y0 + (wob ? noise2(y0 * 0.05, x0 * 0.05 + seed) * wob : 0));
        ctx.lineTo(x1 + (wob ? noise2(x1 * 0.05 + seed, y1 * 0.05) * wob : 0), y1 + (wob ? noise2(y1 * 0.05, x1 * 0.05 + seed) * wob : 0));
        ctx.stroke();
        acc += d;
      }
    } else {
      ctx.beginPath();
      let acc = 0;
      const jx = (x, y) => (wob ? noise2(x * 0.04 + seed, y * 0.04 + t) * wob : 0);
      const jy = (x, y) => (wob ? noise2(y * 0.04 + t, x * 0.04 + seed + 50) * wob : 0);
      ctx.moveTo(p[0][0] + jx(p[0][0], p[0][1]), p[0][1] + jy(p[0][0], p[0][1]));
      for (let i = 1; i < p.length; i++) {
        const [x0, y0] = p[i - 1]; let [x1, y1] = p[i];
        const d = Math.hypot(x1 - x0, y1 - y0);
        if (acc + d > lim) { const kk = (lim - acc) / d; x1 = x0 + (x1 - x0) * kk; y1 = y0 + (y1 - y0) * kk; ctx.lineTo(x1 + jx(x1, y1), y1 + jy(x1, y1)); break; }
        ctx.lineTo(x1 + jx(x1, y1), y1 + jy(x1, y1));
        acc += d;
      }
      if (p.closed && lim >= lens[k]) ctx.closePath();
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function fillPolys(ctx, polys, color, alpha = 1, rule = 'evenodd') {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (const p of polys) {
    ctx.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) ctx.lineTo(p[i][0], p[i][1]);
    ctx.closePath();
  }
  ctx.fill(rule);
  ctx.restore();
}

export function pathFromPolys(polys) {
  const path = new Path2D();
  for (const p of polys) {
    path.moveTo(p[0][0], p[0][1]);
    for (let i = 1; i < p.length; i++) path.lineTo(p[i][0], p[i][1]);
    if (p.closed) path.closePath();
  }
  return path;
}

// Parallel hatching clipped to polys. density: px between lines.
export function hatch(ctx, polys, { angle = 0.8, spacing = 6, width = 0.8, color = '#000', alpha = 1, bbox = null, progress = 1, cross = false } = {}) {
  if (alpha <= 0 || progress <= 0) return;
  ctx.save();
  const path = pathFromPolys(polys);
  ctx.clip(path, 'evenodd');
  ctx.globalAlpha *= alpha;
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  if (bbox) [x0, y0, x1, y1] = bbox;
  else for (const p of polys) for (const [x, y] of p) { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); }
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2 + 2;
  const draw = (ang) => {
    const ca = Math.cos(ang), sa = Math.sin(ang);
    ctx.beginPath();
    const n = Math.ceil((2 * R) / spacing);
    for (let i = 0; i <= n * progress; i++) {
      const o = -R + i * spacing;
      ctx.moveTo(cx + ca * -R - sa * o, cy + sa * -R + ca * o);
      ctx.lineTo(cx + ca * R - sa * o, cy + sa * R + ca * o);
    }
    ctx.stroke();
  };
  draw(angle);
  if (cross) draw(angle + Math.PI / 2.3);
  ctx.restore();
}

// Transform polylines (copy)
export function xform(polys, { x = 0, y = 0, s = 1, sx = null, sy = null, r = 0, ox = 0, oy = 0 } = {}) {
  const c = Math.cos(r), sn = Math.sin(r), kx = sx ?? s, ky = sy ?? s;
  return polys.map((p) => {
    const q = p.map(([px, py]) => { const ux = (px - ox) * kx, uy = (py - oy) * ky; return [x + ux * c - uy * sn, y + ux * sn + uy * c]; });
    q.closed = p.closed;
    return q;
  });
}

// Bounding box of polylines
export function bbox(polys) {
  let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
  for (const p of polys) for (const [x, y] of p) { if (x < x0) x0 = x; if (y < y0) y0 = y; if (x > x1) x1 = x; if (y > y1) y1 = y; }
  return [x0, y0, x1, y1];
}

// Glowing line (neon/blueprint): layered strokes.
export function glowStroke(ctx, polys, { color = '#8ff', width = 1.5, glow = 8, alpha = 1, progress = 1, sequential = true } = {}) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  strokePolys(ctx, polys, { progress, width: width + glow, color, alpha: alpha * 0.06, sequential });
  strokePolys(ctx, polys, { progress, width: width + glow * 0.45, color, alpha: alpha * 0.12, sequential });
  strokePolys(ctx, polys, { progress, width, color, alpha: alpha * 0.9, sequential });
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Typography
export function text(ctx, str, x, y, { font = 'Cormorant Garamond', size = 40, weight = 400, style = 'normal', color = '#fff', align = 'center', baseline = 'alphabetic', spacing = 0, alpha = 1, shadow = 0, shadowColor = 'rgba(0,0,0,0.6)', stroke = null } = {}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.font = `${style} ${weight} ${size}px "${font}"`;
  ctx.textAlign = align;
  ctx.textBaseline = baseline;
  ctx.letterSpacing = `${spacing}px`;
  if (shadow) { ctx.shadowColor = shadowColor; ctx.shadowBlur = shadow; }
  if (stroke) { ctx.strokeStyle = stroke.color; ctx.lineWidth = stroke.width; ctx.strokeText(str, x, y); }
  ctx.fillStyle = color;
  ctx.fillText(str, x, y);
  ctx.restore();
}

// Per-character reveal (typewriter-ish with fade)
export function textReveal(ctx, str, x, y, p, opt = {}) {
  const chars = [...str];
  const n = chars.length;
  ctx.save();
  ctx.font = `${opt.style || 'normal'} ${opt.weight || 400} ${opt.size || 40}px "${opt.font || 'Cormorant Garamond'}"`;
  ctx.letterSpacing = `${opt.spacing || 0}px`;
  const widths = chars.map((c) => ctx.measureText(c).width + (opt.spacing || 0));
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = opt.align === 'left' ? x : opt.align === 'right' ? x - total : x - total / 2;
  ctx.restore();
  for (let i = 0; i < n; i++) {
    const a = clamp(p * (n + 4) - i, 0, 4) / 4;
    if (a > 0) text(ctx, chars[i], cx, y + (1 - a) * (opt.rise ?? 6), { ...opt, align: 'left', alpha: (opt.alpha ?? 1) * smooth(a) });
    cx += widths[i];
  }
}

// Soft radial light
export function glow(ctx, x, y, r, color, alpha = 1, op = 'lighter') {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalCompositeOperation = op;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, rgba(color, alpha));
  g.addColorStop(0.35, rgba(color, alpha * 0.35));
  g.addColorStop(1, rgba(color, 0));
  ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);
  ctx.restore();
}

export function linGrad(ctx, x0, y0, x1, y1, stops) {
  const g = ctx.createLinearGradient(x0, y0, x1, y1);
  for (const [o, c] of stops) g.addColorStop(o, c);
  return g;
}

export function fillRect(ctx, color, alpha = 1, op = 'source-over', x = 0, y = 0, w = W, h = H) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = op;
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
  ctx.restore();
}

// Letterbox bars (cinematic). amount 0..1 → bar height fraction of 2.39:1 crop.
export function letterbox(ctx, amount = 1) {
  if (amount <= 0) return;
  const target = (H - W / 2.39) / 2;
  const h = target * amount;
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, h);
  ctx.fillRect(0, H - h, W, h);
}

// Soft smoke/cloud puff sprite (cached). tone: 0..255 grey level of the puff.
export function puff(tone = 255, key = 'puff') {
  return texture(key + tone, () => {
    const { c, ctx } = makeCanvas(256, 256);
    const img = ctx.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const dx = (x - 128) / 128, dy = (y - 128) / 128, r = Math.hypot(dx, dy);
      const n = fbm2(x * 0.03 + tone, y * 0.03, 4) * 0.5 + 0.5;
      const a = Math.max(0, 1 - r) ** 1.5 * (0.45 + n * 0.85);
      const v = tone * (0.85 + n * 0.15);
      const i = (y * 256 + x) * 4; img.data[i] = v; img.data[i + 1] = v * 0.97; img.data[i + 2] = v * 0.92; img.data[i + 3] = Math.min(255, a * 255);
    }
    ctx.putImageData(img, 0, 0);
    return c;
  });
}
