// CHAPTER I — MYTH & MIMICRY
// Icarus (Greek black-figure vase) · Feitian (Dunhuang mural) · Lu Ban's magpie (ink on xuan paper) · The kite
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, noise2, fbm2, rgba, TAU } from '../core.js';
import { surface, grain, vignette, text, textReveal, glow, fillRect, strokePolys, fillPolys, xform, makeCanvas, texture } from '../gfx.js';
import { drawFigure, POSES, lerpPose } from '../art/figures.js';
import { sightline } from '../art/motif.js';
import { parsePath } from '../svgpath.js';
import { ridge } from '../art/sky.js';

// ===========================================================================
// ICARUS — black-figure terracotta
const CLAY = '#c4693c', BLACK = '#1b1310', INCISE = '#d98d5f';

function meander(x0, y, unit, n) {
  // Greek key: repeating square spiral
  const u = unit, pts = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + i * u * 1.25;
    pts.push([x, y + u], [x, y], [x + u, y], [x + u, y + u * 0.75], [x + u * 0.25, y + u * 0.75], [x + u * 0.25, y + u * 0.25], [x + u * 0.62, y + u * 0.25], [x + u * 0.62, y + u * 0.5], [x + u * 0.5, y + u * 0.5]);
    pts.push([x + u * 0.5, y + u * 0.5]);
    pts.push([x + u * 0.5, y + u]);
    pts.push([x + u * 1.25, y + u]);
  }
  return [pts];
}

function vaseShading(ctx) {
  // cylindrical body shading + glaze highlight
  const g = ctx.createLinearGradient(0, 0, W, 0);
  g.addColorStop(0, 'rgba(40,14,4,0.55)'); g.addColorStop(0.18, 'rgba(40,14,4,0.1)'); g.addColorStop(0.5, 'rgba(0,0,0,0)');
  g.addColorStop(0.82, 'rgba(40,14,4,0.12)'); g.addColorStop(1, 'rgba(40,14,4,0.6)');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  ctx.save(); ctx.globalCompositeOperation = 'screen';
  const h = ctx.createLinearGradient(W * 0.24, 0, W * 0.36, 0);
  h.addColorStop(0, 'rgba(255,230,200,0)'); h.addColorStop(0.5, 'rgba(255,230,200,0.13)'); h.addColorStop(1, 'rgba(255,230,200,0)');
  ctx.fillStyle = h; ctx.fillRect(0, 0, W, H);
  ctx.restore();
}

function wing(ctx, sx, sy, ang, span, flap, nf, color, incise, broken = 0) {
  // fan of feathers rooted along the arm
  ctx.save();
  ctx.translate(sx, sy);
  ctx.rotate(ang);
  for (let i = 0; i < nf; i++) {
    if (broken && ((i * 7919) % 11) / 11 < broken) continue;
    const k = i / (nf - 1);
    const len = span * (0.55 + 0.6 * Math.sin(k * Math.PI * 0.85 + 0.25));
    const a = -0.25 - k * (1.15 + flap * 0.35) + flap * 0.25;
    const bx = span * 0.42 * (1 - k * 0.92);
    ctx.save();
    ctx.translate(bx, 0);
    ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(len * 0.5, -len * 0.09, len, 0);
    ctx.quadraticCurveTo(len * 0.5, len * 0.07, 0, 0);
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = incise; ctx.lineWidth = 1.1; ctx.globalAlpha = 0.8;
    ctx.beginPath(); ctx.moveTo(len * 0.1, 0); ctx.lineTo(len * 0.92, 0); ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

const FEATHERS = (() => { const R = rng(31); return Array.from({ length: 34 }, () => ({ ox: R.range(-60, 60), oy: R.range(-40, 40), vx: R.range(-40, 90), vy: R.range(60, 140), rot: R() * 6, sp: R.range(1.5, 3.5), ph: R() * 6, l: R.range(26, 46), t0: R.range(0, 2.2) })); })();

export const icarus = {
  transIn: { dur: 1.6, type: 'fade' },
  caption: 'rgba(32,16,10,0.85)',
  init() { surface({ key: 'clay', base: '#c4693c', dark: '#8e4021', light: '#dc8b5a', scale: 3.2, contrast: 0.32, spots: 40, fibres: 300, seed: 4 }); },
  draw(ctx, t, dur) {
    const pan = ease.inOutSine(seg(t, -1, dur)) * 260;
    ctx.drawImage(surface({ key: 'clay' }), 0, 0);
    // decorative bands
    ctx.save();
    ctx.translate(-pan * 0.98, 0);
    ctx.fillStyle = BLACK; ctx.fillRect(-100, 0, W + 600, 22); ctx.fillRect(-100, 166, W + 600, 5); ctx.fillRect(-100, 238, W + 600, 5);
    strokePolys(ctx, meander(-80, 180, 46, 46), { width: 7, color: BLACK, cap: 'butt', join: 'miter' });
    ctx.fillRect(-100, H - 70, W + 600, 70); ctx.fillRect(-100, H - 168, W + 600, 6);
    for (let i = 0; i < 70; i++) { // tongue pattern
      const x = -80 + i * 34;
      ctx.beginPath(); ctx.moveTo(x, H - 160); ctx.lineTo(x, H - 110); ctx.quadraticCurveTo(x + 14, H - 84, x + 28, H - 110); ctx.lineTo(x + 28, H - 160);
      ctx.fillStyle = i % 2 ? BLACK : '#7a2416'; ctx.fill();
    }
    ctx.restore();

    // world (field) transform
    ctx.save();
    ctx.translate(-pan, 0);
    // waves: Greek running-scroll ("Vitruvian wave") along the bottom of the field
    ctx.fillStyle = BLACK;
    ctx.beginPath();
    const wy = H - 176;
    ctx.moveTo(-120, wy + 4);
    for (let i = 0; i < 24; i++) {
      const x = -120 + i * 110;
      ctx.bezierCurveTo(x + 20, wy + 4, x + 40, wy - 44, x + 74, wy - 46);
      ctx.bezierCurveTo(x + 100, wy - 48, x + 112, wy - 22, x + 98, wy - 10);
      ctx.bezierCurveTo(x + 88, wy - 2, x + 72, wy - 10, x + 78, wy - 22);
      ctx.bezierCurveTo(x + 70, wy - 14, x + 72, wy + 4, x + 110, wy + 4);
    }
    ctx.lineTo(W + 900, wy + 10); ctx.lineTo(-120, wy + 10); ctx.closePath(); ctx.fill();
    ctx.fillRect(-100, H - 172, W + 800, 4);
    // the sun
    const sunX = 1500, sunY = 390;
    ctx.save();
    ctx.translate(sunX, sunY);
    ctx.rotate(t * 0.05);
    for (let i = 0; i < 18; i++) {
      ctx.rotate(TAU / 18);
      ctx.beginPath(); ctx.moveTo(86, -10); ctx.lineTo(150 + (i % 2) * 26, 0); ctx.lineTo(86, 10); ctx.closePath(); ctx.fill();
    }
    ctx.beginPath(); ctx.arc(0, 0, 76, 0, TAU); ctx.fill();
    ctx.strokeStyle = INCISE; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0, 0, 60, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 40, 0, TAU); ctx.stroke();
    ctx.restore();

    // Icarus trajectory
    const up = sseg(t, -0.5, 5.6);
    const fall = seg(t, 6.0, 10.6);
    let x, y, rot, pose, broken = 0, flap;
    if (fall <= 0) {
      x = lerp(420, 1170, up); y = lerp(800, 520, ease.outCubic(up));
      rot = -1.05 + up * 0.15; pose = POSES.fly; flap = Math.sin(t * 7.5) * (1 - sseg(t, 4.6, 5.8) * 0.7);
      broken = sseg(t, 4.8, 6.0) * 0.35;
    } else {
      const f = ease.inCubic(fall);
      x = lerp(1170, 1560, fall); y = lerp(520, H - 190, f);
      rot = -0.9 + fall * 3.6; pose = lerpPose(POSES.fly, POSES.fall, smooth(fall * 2)); flap = Math.sin(t * 13) * 0.6;
      broken = 0.35 + fall * 0.5;
    }
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    const fig = drawFigure(ctx, 0, 0, 290, pose, { color: BLACK, hat: 'hair' });
    ctx.restore();
    // wings at shoulder — computed in figure space (approx shoulder position)
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot);
    const shY = -290 * 0.66;
    wing(ctx, 8, shY, -1.9 - flap * 0.4, 190, flap, 15, BLACK, INCISE, broken);
    ctx.restore();
    // incised detail on body
    // line of sight → the sun (while rising)
    const ex = [x + Math.cos(rot) * fig.eye[0] - Math.sin(rot) * fig.eye[1], y + Math.sin(rot) * fig.eye[0] + Math.cos(rot) * fig.eye[1]];
    const sla = env(t, 1.2, 6.2, 0.6, 0.8);
    if (sla > 0) {
      ctx.save(); ctx.strokeStyle = 'rgba(250,222,186,0.95)'; ctx.lineWidth = 2.4; ctx.setLineDash([3, 9]); ctx.lineCap = 'round'; ctx.globalAlpha = sla;
      const p = sseg(t, 1.2, 3.4);
      ctx.beginPath(); ctx.moveTo(ex[0], ex[1]); ctx.lineTo(lerp(ex[0], sunX, p), lerp(ex[1], sunY, p)); ctx.stroke();
      ctx.restore();
    }
    // melting wax drops + falling feathers
    const melt = seg(t, 4.8, 11);
    if (melt > 0) {
      const tt = (t - 4.8);
      for (const f of FEATHERS) {
        const lt = tt - f.t0 * 1.6;
        if (lt < 0) continue;
        const fx = 1140 + f.ox + f.vx * lt + Math.sin(lt * f.sp + f.ph) * 26;
        const fy = 480 + f.oy + f.vy * lt;
        if (fy > H - 200) continue;
        ctx.save(); ctx.translate(fx, fy); ctx.rotate(f.rot + Math.sin(lt * f.sp) * 0.8);
        ctx.fillStyle = BLACK;
        ctx.beginPath(); ctx.moveTo(-f.l / 2, 0); ctx.quadraticCurveTo(0, -f.l * 0.12, f.l / 2, 0); ctx.quadraticCurveTo(0, f.l * 0.1, -f.l / 2, 0); ctx.fill();
        ctx.strokeStyle = INCISE; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.moveTo(-f.l * 0.4, 0); ctx.lineTo(f.l * 0.42, 0); ctx.stroke();
        ctx.restore();
      }
    }
    // splash
    const sp = seg(t, 10.4, 11.4);
    if (sp > 0) {
      ctx.fillStyle = BLACK;
      for (let i = 0; i < 9; i++) {
        const a = -Math.PI / 2 + (i - 4) * 0.28, r = 30 + sp * 120;
        ctx.beginPath(); ctx.ellipse(1560 + Math.cos(a) * r, H - 196 + Math.sin(a) * r * 0.9 + sp * sp * 80, 6 * (1 - sp), 12 * (1 - sp), a, 0, TAU); ctx.fill();
      }
    }
    ctx.restore();

    vaseShading(ctx);
    // Greek inscription (retrograde-style label)
    text(ctx, 'ΙΚΑΡΟΣ', 1330 - pan * 0.4, 650, { font: 'Inter', size: 28, weight: 300, color: BLACK, spacing: 16, alpha: env(t, 1.5, 9, 1, 1) * 0.8 });
    grain(ctx, t, 0.06);
    vignette(ctx, 0.35, '#2a0d02');
  },
};

// ===========================================================================
// FEITIAN — Dunhuang mural: mineral pigments on earthen plaster
const LAPIS = '#2c557d', MALACHITE = '#3f8a73', CINNABAR = '#b6432b', OCHRE = '#c48a3a', OUTLINE = '#6b2c1a', SKIN = '#e8c7a0', HAIRC = '#2a221e';

function cracks() {
  return texture('cracks', () => {
    const { c, ctx } = makeCanvas(W, H);
    const R = rng(77);
    ctx.lineCap = 'round';
    for (let i = 0; i < 70; i++) {
      let x = R() * W, y = R() * H, a = R() * TAU;
      ctx.strokeStyle = `rgba(70,40,20,${0.15 + R() * 0.25})`;
      ctx.lineWidth = 0.6 + R() * 1.2;
      ctx.beginPath(); ctx.moveTo(x, y);
      const n = 6 + R() * 18;
      for (let k = 0; k < n; k++) { a += (R() - 0.5) * 1.2; x += Math.cos(a) * 14; y += Math.sin(a) * 14; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    // flaked patches (pigment loss)
    for (let i = 0; i < 40; i++) {
      const x = R() * W, y = R() * H, r = 6 + R() * 40;
      ctx.fillStyle = `rgba(226,205,170,${0.25 + R() * 0.35})`;
      ctx.beginPath();
      for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU, rr = r * (0.6 + R() * 0.6); ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr * 0.7); }
      ctx.closePath(); ctx.fill();
    }
    return c;
  });
}

function auspiciousCloud(ctx, x, y, s, fill, a = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.fillStyle = fill; ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2.2 / s;
  const bumps = [[0, 0, 34], [40, -14, 28], [76, -2, 24], [-38, 6, 26], [104, 10, 18]];
  ctx.beginPath(); for (const [bx, by, r] of bumps) { ctx.moveTo(bx + r, by); ctx.arc(bx, by, r, 0, TAU); } ctx.fill();
  ctx.beginPath(); for (const [bx, by, r] of bumps) { ctx.moveTo(bx + r * 0.55, by); ctx.arc(bx, by, r * 0.55, 0, TAU * 0.8); } ctx.stroke();
  // trailing tail
  ctx.beginPath(); ctx.moveTo(-60, 10); ctx.bezierCurveTo(-130, 30, -180, -10, -260, 16); ctx.bezierCurveTo(-190, 4, -140, 40, -60, 24); ctx.closePath(); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function flower(ctx, x, y, r, rot, col) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
  ctx.fillStyle = col;
  for (let i = 0; i < 5; i++) { ctx.rotate(TAU / 5); ctx.beginPath(); ctx.ellipse(r * 0.6, 0, r * 0.6, r * 0.34, 0, 0, TAU); ctx.fill(); }
  ctx.fillStyle = OCHRE; ctx.beginPath(); ctx.arc(0, 0, r * 0.28, 0, TAU); ctx.fill();
  ctx.restore();
}

function ribbon(ctx, pts, w0, w1, fill, edge) {
  // variable-width band along a polyline
  const L = [], Rr = [];
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i], q = pts[Math.min(i + 1, pts.length - 1)], o = pts[Math.max(i - 1, 0)];
    let dx = q[0] - o[0], dy = q[1] - o[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d;
    const k = i / (pts.length - 1), w = lerp(w0, w1, k) * (0.6 + 0.4 * Math.sin(k * 9 + 1) ** 2);
    L.push([p[0] - dy * w, p[1] + dx * w]); Rr.push([p[0] + dy * w, p[1] - dx * w]);
  }
  ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]);
  for (const p of L) ctx.lineTo(p[0], p[1]);
  for (let i = Rr.length - 1; i >= 0; i--) ctx.lineTo(Rr[i][0], Rr[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  ctx.strokeStyle = edge; ctx.lineWidth = 2; ctx.stroke();
}

function ribbonPath(x0, y0, len, t, ph, dir = 1, lift = -0.4) {
  const pts = [];
  for (let i = 0; i <= 60; i++) {
    const s = i / 60;
    const ang = lift + Math.sin(s * 5.2 - t * 2.2 + ph) * 0.55 * s;
    const prev = pts[i - 1] || [x0, y0];
    const step = len / 60;
    pts.push(i === 0 ? [x0, y0] : [prev[0] + Math.cos(ang) * step * dir, prev[1] + Math.sin(ang) * step + Math.sin(s * 3 + t + ph) * 1.2]);
  }
  return pts;
}

// Apsara body, authored facing left in a ~700x300 box (origin = waist)
const APSARA = {
  skirt: 'M 0 -10 C 60 -30 140 -40 220 -70 C 270 -90 320 -120 350 -150 C 340 -110 300 -60 250 -30 C 300 -40 360 -70 400 -60 C 340 -20 260 20 160 30 C 90 36 30 30 0 20 Z',
  lining: 'M 160 30 C 230 26 300 0 400 -60 C 380 -30 330 10 270 30 C 230 40 190 40 160 30 Z',
  torso: 'M 0 -10 C -30 -20 -70 -40 -100 -46 C -120 -50 -138 -44 -146 -30 C -150 -16 -140 0 -120 6 C -80 14 -30 20 0 20 Z',
  arm1: 'M -120 -40 C -160 -60 -200 -90 -228 -96 C -240 -98 -248 -92 -246 -84 C -230 -80 -196 -66 -170 -46 C -150 -32 -130 -20 -120 -20 Z',
  arm2: 'M -70 -40 C -60 -80 -40 -120 -10 -150 C 0 -158 10 -156 10 -148 C -10 -120 -30 -84 -44 -40 Z',
  head: 'M -150 -40 C -176 -40 -196 -60 -196 -84 C -196 -110 -176 -128 -152 -126 C -128 -124 -112 -104 -114 -80 C -116 -58 -132 -40 -150 -40 Z',
  feet: 'M 388 -64 C 400 -78 418 -84 430 -80 C 436 -76 432 -70 420 -66 C 410 -62 398 -58 388 -56 Z M 340 -150 C 348 -166 362 -176 374 -174 C 380 -170 376 -164 366 -158 C 358 -152 350 -146 344 -142 Z',
  hair: 'M -196 -90 C -200 -120 -180 -142 -152 -142 C -124 -142 -108 -122 -110 -100 C -126 -116 -150 -122 -170 -114 C -184 -108 -192 -100 -196 -90 Z M -150 -142 C -156 -166 -140 -180 -124 -172 C -116 -166 -118 -150 -130 -144 Z',
  halo: [-152, -86, 66],
};
let apsaraP = null;

function drawApsara(ctx, x, y, s, t, alpha = 1) {
  if (!apsaraP) { apsaraP = {}; for (const k in APSARA) if (typeof APSARA[k] === 'string') apsaraP[k] = parsePath(APSARA[k]); }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  const bob = Math.sin(t * 1.3) * 6;
  ctx.translate(0, bob);
  ctx.rotate(Math.sin(t * 0.9) * 0.04 - 0.08);
  // ribbons behind
  ribbon(ctx, ribbonPath(-30, -40, 620, t, 0, 1, -0.5), 9, 3, MALACHITE, OUTLINE);
  ribbon(ctx, ribbonPath(-60, -10, 540, t, 1.7, 1, 0.12), 8, 2.5, LAPIS, OUTLINE);
  // halo
  const [hx, hy, hr] = APSARA.halo;
  ctx.fillStyle = 'rgba(63,138,115,0.85)'; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.fill();
  ctx.fillStyle = 'rgba(196,138,58,0.9)'; ctx.beginPath(); ctx.arc(hx, hy, hr * 0.78, 0, TAU); ctx.fill();
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(hx, hy, hr, 0, TAU); ctx.stroke();
  const shapes = [['feet', SKIN], ['skirt', CINNABAR], ['lining', MALACHITE], ['arm2', SKIN], ['torso', SKIN], ['head', SKIN], ['hair', HAIRC], ['arm1', SKIN]];
  for (const [k, col] of shapes) { fillPolys(ctx, apsaraP[k], col, 1, 'nonzero'); strokePolys(ctx, apsaraP[k], { width: 2.2, color: OUTLINE, taper: false }); }
  // skirt folds
  ctx.strokeStyle = 'rgba(80,20,10,0.7)'; ctx.lineWidth = 1.6;
  for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(30 + i * 40, 0 - i * 6); ctx.quadraticCurveTo(100 + i * 50, -20 - i * 14, 180 + i * 40, -40 - i * 18); ctx.stroke(); }
  // necklace + crown
  ctx.strokeStyle = OCHRE; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(-128, -40, 18, 0.2, 2.6); ctx.stroke();
  ctx.fillStyle = OCHRE; ctx.beginPath(); ctx.moveTo(-180, -128); ctx.lineTo(-170, -150); ctx.lineTo(-156, -134); ctx.lineTo(-140, -152); ctx.lineTo(-130, -128); ctx.closePath(); ctx.fill();
  // face detail
  ctx.strokeStyle = OUTLINE; ctx.lineWidth = 1.6;
  ctx.beginPath(); ctx.moveTo(-180, -92); ctx.quadraticCurveTo(-172, -96, -166, -92); ctx.stroke();
  // flower plate held forward
  flower(ctx, -248, -96, 14, t * 0.5, '#f1e6d0');
  // ribbon over the arm, flowing forward-up
  ribbon(ctx, ribbonPath(-10, -150, 300, t * 1.1, 3.1, -1, -2.2), 6, 2, CINNABAR, OUTLINE);
  ctx.restore();
}

const FLOWERS = (() => { const R = rng(12); return Array.from({ length: 40 }, () => ({ x: R() * W * 1.2, y: R() * H, r: R.range(7, 14), sp: R.range(18, 40), ph: R() * 6, c: R.pick(['#f1e6d0', '#d65b42', '#e9a35b']) })); })();

export const feitian = {
  transIn: { dur: 1.4, type: 'fade' },
  caption: 'rgba(70,30,15,0.9)',
  init() { surface({ key: 'mural', base: '#cbb08a', dark: '#8b6b49', light: '#e3d0ae', scale: 4.5, contrast: 0.55, spots: 70, fibres: 600, seed: 9 }); cracks(); },
  draw(ctx, t, dur) {
    const drift = ease.inOutSine(seg(t, -1, dur + 1));
    ctx.drawImage(surface({ key: 'mural' }), 0, 0);
    // lapis sky field with irregular, worn edges
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(0, 120);
    for (let x = 0; x <= W; x += 40) ctx.lineTo(x, 110 + noise2(x * 0.01, 3) * 22);
    for (let x = W; x >= 0; x -= 40) ctx.lineTo(x, H - 150 + noise2(x * 0.01, 9) * 26);
    ctx.closePath();
    ctx.fillStyle = 'rgba(44,85,125,0.78)'; ctx.fill();
    ctx.clip();
    // pigment variation
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(surface({ key: 'mural' }), 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    // clouds
    for (let i = 0; i < 7; i++) {
      const cx = ((i * 330 + 200 - drift * 160 * (0.5 + (i % 3) * 0.3)) % (W + 400)) - 100;
      auspiciousCloud(ctx, cx, 230 + (i * 137) % 600, 0.8 + (i % 3) * 0.25, i % 2 ? 'rgba(240,232,214,0.92)' : 'rgba(110,170,150,0.92)', 1);
    }
    // falling flowers
    for (const f of FLOWERS) {
      const fx = ((f.x - t * f.sp * 1.4) % (W * 1.2) + W * 1.2) % (W * 1.2) - 60;
      const fy = (f.y + t * f.sp) % H;
      flower(ctx, fx, fy, f.r, t * 0.6 + f.ph, f.c);
    }
    // a second, distant apsara
    drawApsara(ctx, lerp(1700, 1100, drift), 400, 0.55, t + 2, 0.9);
    // main apsara
    drawApsara(ctx, lerp(1450, 640, drift), 640, 1.2, t);
    ctx.restore();
    // border bands (mural frames)
    ctx.fillStyle = 'rgba(107,44,26,0.85)';
    ctx.fillRect(0, 96, W, 8); ctx.fillRect(0, H - 140, W, 8);
    ctx.globalCompositeOperation = 'multiply';
    ctx.drawImage(cracks(), 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    grain(ctx, t, 0.07);
    vignette(ctx, 0.45, '#2a1508');
  },
};

// ===========================================================================
// LU BAN — the wooden magpie: brush ink on xuan paper
const INK = '#1d1a17';
const MAGPIE = {
  body: 'M -120 0 C -90 -34 -10 -44 60 -34 C 100 -28 130 -14 150 -2 C 130 8 100 18 60 22 C -10 30 -90 26 -120 0 Z',
  head: 'M 140 -8 C 150 -34 186 -40 204 -22 C 214 -12 212 2 200 8 L 244 2 L 200 18 C 186 24 158 20 146 8',
  grain1: 'M -100 -4 C -40 -20 40 -22 120 -8', grain2: 'M -96 8 C -30 2 50 0 124 6', grain3: 'M -60 -22 C 0 -32 60 -28 100 -20',
  tail: 'M -118 -2 L -250 -46 L -246 -26 L -122 4 M -118 2 L -256 6 L -250 24 L -120 10 M -116 6 L -238 50 L -228 64 L -112 14',
  peg1: 'M 20 -36 L 20 -46 M 50 -34 L 50 -44 M -20 -34 L -20 -44',
  eye: 'M 182 -18 m -5 0 a 5 5 0 1 0 10 0 a 5 5 0 1 0 -10 0',
};
const WINGD = 'M 0 0 L 40 -170 L 70 -230 L 110 -150 L 120 0 Z M 18 -10 L 52 -190 M 40 -6 L 74 -200 M 64 -4 L 92 -170 M 88 -2 L 104 -110 M 6 -60 L 116 -50 M 14 -120 L 112 -110';
let magP = null, wingP = null;

export function drawMagpie(ctx, x, y, s, flap, prog = 1, explode = 0, col = INK) {
  if (!magP) { magP = {}; for (const k in MAGPIE) magP[k] = parsePath(MAGPIE[k]); wingP = parsePath(WINGD); }
  const brush = (polys, w, p = prog) => strokePolys(ctx, polys, { progress: p, width: w, color: col, taper: true, wobble: 0.8, seed: 2 });
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  ctx.save(); ctx.translate(-explode * 60, explode * 30);
  brush(magP.body, 4); brush(magP.grain1, 1.5); brush(magP.grain2, 1.5); brush(magP.grain3, 1.2); brush(magP.peg1, 2.4);
  ctx.restore();
  ctx.save(); ctx.translate(explode * 90, -explode * 20); brush(magP.head, 3.6); brush(magP.eye, 2); ctx.restore();
  ctx.save(); ctx.translate(-explode * 150, explode * 10); brush(magP.tail, 2.6); ctx.restore();
  // wings: far + near, hinge at the pegs
  for (const [ox, sc, dark] of [[-10, 0.86, 0.6], [30, 1, 1]]) {
    ctx.save();
    ctx.translate(ox + explode * 20, -34 - explode * 140 * sc);
    ctx.scale(1, Math.cos(flap * 1.15) * sc);
    ctx.globalAlpha *= dark;
    brush(wingP, 2.6);
    ctx.restore();
  }
  ctx.restore();
}

const MOZI = ['削竹木以为鹊', '成而飞之', '三日不下'];

export const luban = {
  transIn: { dur: 1.4, type: 'fade' },
  caption: 'rgba(30,26,22,0.88)',
  init() { surface({ key: 'xuan', base: '#efe6d0', dark: '#cdbf9e', light: '#f8f2e4', scale: 6, contrast: 0.28, fibres: 2600, spots: 18, seed: 13 }); },
  draw(ctx, t, dur) {
    ctx.drawImage(surface({ key: 'xuan' }), 0, 0);
    const drift = ease.inOutSine(seg(t, -1, dur + 1));
    // ink-wash mountains (soft)
    ctx.save();
    ctx.filter = 'blur(6px)';
    const rs = [[3, 0.62, 0.16, 'rgba(60,58,54,0.16)', 40], [7, 0.7, 0.12, 'rgba(40,38,36,0.22)', 80], [11, 0.82, 0.08, 'rgba(30,28,26,0.30)', 130]];
    for (const [sd, base, amp, col, par] of rs) {
      const pts = ridge(sd, { base, amp, freq: 2.6, sharp: 0.5 });
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(-50, H);
      for (const [x, y] of pts) ctx.lineTo(x - drift * par, y);
      ctx.lineTo(W + 50, H); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
    // construction lines (red ink, 界画 style)
    const build = seg(t, 0.2, 3.6);
    const assemble = sseg(t, 3.4, 5.2);
    const fly = seg(t, 5.0, dur + 1);
    const explode = 1 - assemble;
    if (fly <= 0.02) {
      ctx.save();
      ctx.strokeStyle = 'rgba(170,40,30,0.55)'; ctx.lineWidth = 1; ctx.setLineDash([6, 6]);
      const a = env(t, 0.4, 5.2, 0.6, 0.6);
      ctx.globalAlpha = a;
      ctx.beginPath(); ctx.moveTo(560, 560); ctx.lineTo(1360, 560); ctx.moveTo(960, 260); ctx.lineTo(960, 820); ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(960, 560, 180, 0, TAU * build); ctx.stroke();
      ctx.restore();
    }
    // magpie: draw → assemble → take flight across the wash
    const fx = lerp(960, 2200, ease.inQuad(fly)), fy = lerp(560, 260, ease.inOutSine(fly)) + Math.sin(t * 3) * 10 * fly;
    const flap = fly > 0 ? Math.sin(t * 6.5) : 0;
    drawMagpie(ctx, fx, fy, 1.5 - fly * 0.4, flap, build, explode * 0.9);
    // motion trail (dry brush)
    if (fly > 0) {
      ctx.save(); ctx.globalAlpha = 0.18 * (1 - fly);
      ctx.strokeStyle = INK; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(fx - 220, fy + i * 7 - 20); ctx.quadraticCurveTo(fx - 600, fy + 60 + i * 9, fx - 1000, fy + 140 + i * 10); ctx.stroke(); }
      ctx.restore();
    }
    // calligraphy column (right side, vertical, top → bottom, columns right → left)
    const cx0 = 1690, cy0 = 210;
    MOZI.forEach((line, ci) => {
      const p = seg(t, 1.0 + ci * 1.6, 2.4 + ci * 1.6);
      [...line].forEach((ch, k) => {
        const a = clamp(p * line.length - k);
        if (a > 0) text(ctx, ch, cx0 - ci * 78, cy0 + k * 76, { font: 'Ma Shan Zheng', size: 64, color: INK, alpha: smooth(a) * 0.92 });
      });
    });
    text(ctx, '——《墨子·鲁问》', 1470, 770, { font: 'Noto Serif SC', size: 28, color: INK, align: 'left', alpha: sseg(t, 5.5, 6.5) * 0.7, spacing: 2 });
    // seal stamp
    const sa = sseg(t, 6.2, 6.5);
    if (sa > 0) {
      ctx.save(); ctx.globalAlpha = sa * 0.9; ctx.translate(1530, 840); ctx.rotate(-0.03);
      ctx.fillStyle = '#b22c22'; ctx.fillRect(0, 0, 92, 92);
      ctx.globalCompositeOperation = 'destination-out';
      text(ctx, '公', 24, 42, { font: 'Ma Shan Zheng', size: 40, color: '#000' });
      text(ctx, '输', 68, 42, { font: 'Ma Shan Zheng', size: 40, color: '#000' });
      text(ctx, '鲁', 24, 84, { font: 'Ma Shan Zheng', size: 40, color: '#000' });
      text(ctx, '班', 68, 84, { font: 'Ma Shan Zheng', size: 40, color: '#000' });
      ctx.restore();
    }
    grain(ctx, t, 0.05);
    vignette(ctx, 0.25, '#3a2c18');
  },
};

// ===========================================================================
// KITE — the string is a line of sight
export function swallowKite(ctx, x, y, s, t, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(Math.sin(t * 1.7) * 0.06); ctx.globalAlpha *= alpha;
  const ol = '#1b1714';
  // tails
  const tail = (dir) => {
    ctx.beginPath(); ctx.moveTo(dir * 12, 60);
    ctx.quadraticCurveTo(dir * 40, 150, dir * 70 + Math.sin(t * 3 + dir) * 8, 240);
    ctx.lineTo(dir * 44, 230); ctx.quadraticCurveTo(dir * 26, 150, dir * 2, 70); ctx.closePath();
    ctx.fillStyle = '#1e2c4a'; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 2; ctx.stroke();
  };
  tail(-1); tail(1);
  // wings
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.bezierCurveTo(dir * 80, -70, dir * 200, -60, dir * 250, -10);
    ctx.bezierCurveTo(dir * 220, 10, dir * 150, 30, dir * 30, 40);
    ctx.closePath();
    ctx.fillStyle = '#f2ead8'; ctx.fill(); ctx.strokeStyle = ol; ctx.lineWidth = 3; ctx.stroke();
    // painted patterns
    ctx.fillStyle = '#c4362a';
    ctx.beginPath(); ctx.ellipse(dir * 120, -14, 46, 18, dir * -0.2, 0, TAU); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#2f5f9a';
    ctx.beginPath(); ctx.ellipse(dir * 200, -24, 26, 11, dir * -0.3, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(dir * 60, 30); ctx.quadraticCurveTo(dir * 140, 20, dir * 230, -8); ctx.strokeStyle = '#1b1714'; ctx.lineWidth = 6; ctx.stroke();
  }
  // body & head
  ctx.fillStyle = '#1b1714';
  ctx.beginPath(); ctx.ellipse(0, 10, 22, 56, 0, 0, TAU); ctx.fill();
  ctx.beginPath(); ctx.arc(0, -48, 30, 0, TAU); ctx.fill();
  ctx.fillStyle = '#f2ead8'; ctx.beginPath(); ctx.arc(-11, -52, 8, 0, TAU); ctx.arc(11, -52, 8, 0, TAU); ctx.fill();
  ctx.fillStyle = '#c4362a'; ctx.beginPath(); ctx.arc(-11, -52, 3.5, 0, TAU); ctx.arc(11, -52, 3.5, 0, TAU); ctx.fill();
  ctx.fillStyle = '#e0a83a'; ctx.beginPath(); ctx.ellipse(0, 14, 10, 30, 0, 0, TAU); ctx.fill();
  ctx.restore();
}

export const kite = {
  transIn: { dur: 1.2, type: 'fade' },
  caption: 'rgba(40,40,50,0.85)',
  draw(ctx, t, dur) {
    // camera tilts up along the string: 0 = ground, 1 = sky
    const tilt = ease.inOutCubic(seg(t, 1.5, 7.5));
    const camY = tilt * 900;
    // sky wash
    const g = ctx.createLinearGradient(0, -900 + camY, 0, H + camY);
    g.addColorStop(0, '#8fb0c8'); g.addColorStop(0.45, '#c9d8de'); g.addColorStop(0.8, '#f1e7d2'); g.addColorStop(1, '#f4e3c4');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.drawImage(surface({ key: 'xuan' }), 0, 0);
    ctx.save(); ctx.globalCompositeOperation = 'multiply'; ctx.fillStyle = g; ctx.globalAlpha = 0.9; ctx.fillRect(0, 0, W, H); ctx.restore();
    ctx.save();
    ctx.translate(0, camY);
    // soft clouds (ink wash, inverted)
    ctx.save(); ctx.filter = 'blur(18px)'; ctx.fillStyle = 'rgba(255,255,255,0.55)';
    for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.ellipse(((i * 380 - t * 20) % (W + 600)) - 200, -600 + (i * 211) % 700, 260, 46, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
    // ground: willow bank + grass in ink
    ctx.save();
    ctx.fillStyle = 'rgba(60,70,50,0.35)'; ctx.filter = 'blur(3px)';
    ctx.beginPath(); ctx.moveTo(0, H - 120); ctx.quadraticCurveTo(W * 0.4, H - 170, W, H - 110); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    ctx.restore();
    // willow: ink trunk + drooping strands with leaf dabs
    ctx.save();
    ctx.strokeStyle = 'rgba(34,30,26,0.85)'; ctx.lineCap = 'round';
    ctx.lineWidth = 16; ctx.beginPath(); ctx.moveTo(1700, H - 120); ctx.bezierCurveTo(1690, H - 300, 1640, H - 420, 1600, H - 560); ctx.stroke();
    ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(1660, H - 400); ctx.quadraticCurveTo(1760, H - 520, 1880, H - 560); ctx.moveTo(1620, H - 500); ctx.quadraticCurveTo(1520, H - 600, 1400, H - 620); ctx.stroke();
    for (let i = 0; i < 26; i++) {
      const bx = 1380 + i * 21, by = H - 640 + Math.abs(i - 12) * 6;
      const sw = Math.sin(t * 1.1 + i * 0.7) * 16;
      const len = 220 + (i * 37) % 160;
      ctx.strokeStyle = 'rgba(52,66,44,0.55)'; ctx.lineWidth = 1.3;
      ctx.beginPath(); ctx.moveTo(bx, by); ctx.quadraticCurveTo(bx + sw * 0.5, by + len * 0.5, bx + sw, by + len); ctx.stroke();
      ctx.fillStyle = 'rgba(60,80,48,0.55)';
      for (let k = 1; k < 10; k++) { const u = k / 10; const lx = bx + sw * u * u, ly = by + len * u; ctx.beginPath(); ctx.ellipse(lx + 3, ly, 5, 1.6, 1.2, 0, TAU); ctx.fill(); }
    }
    ctx.restore();
    // swallows circling near the kite
    for (let i = 0; i < 4; i++) {
      const a = t * 0.9 + i * 1.6;
      const bx = 1240 + Math.cos(a) * (220 + i * 40), by = -460 + Math.sin(a * 1.3) * 90;
      ctx.save(); ctx.fillStyle = 'rgba(28,26,30,0.85)'; ctx.translate(bx, by); ctx.rotate(Math.cos(a) * 0.3);
      const f = Math.sin(t * 12 + i) * 6;
      ctx.beginPath(); ctx.moveTo(-14, -f); ctx.quadraticCurveTo(-4, -2, 0, 0); ctx.quadraticCurveTo(4, -2, 14, -f); ctx.quadraticCurveTo(4, 2, 0, 4); ctx.quadraticCurveTo(-4, 2, -14, -f); ctx.fill();
      ctx.restore();
    }
    // the child
    const fig = drawFigure(ctx, 420, H - 128, 250, POSES.kite, { color: '#221d1a', child: true, dress: true, hat: 'bun' });
    // kite position in world space
    const kx = 1240 + Math.sin(t * 0.7) * 30, ky = -520 + Math.cos(t * 0.9) * 18;
    // string: gentle catenary from hand to kite
    ctx.save();
    ctx.strokeStyle = 'rgba(30,26,22,0.8)'; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(fig.hand[0], fig.hand[1]);
    ctx.quadraticCurveTo((fig.hand[0] + kx) / 2 + 60, (fig.hand[1] + ky) / 2 + 120, kx, ky + 40);
    ctx.stroke();
    ctx.restore();
    // a luminous sightline from the child's eye to the kite, riding alongside the string
    sightline(ctx, fig.eye, [kx, ky], sseg(t, 0.6, 3.2), { color: '#fff3d6', alpha: env(t, 0.6, dur, 0.4, 1.5) * 0.8, width: 1.2 });
    swallowKite(ctx, kx, ky, 0.95, t);
    ctx.restore();
    grain(ctx, t, 0.05);
    vignette(ctx, 0.3, '#2a2a30');
  },
};
