// CHAPTER III — LIGHTER THAN AIR. Sky lanterns at night · the Montgolfier balloon as a hand-tinted engraving.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU, noise2, rgba } from '../core.js';
import { surface, grain, vignette, text, glow, strokePolys, hatch, fillPolys, xform, fillRect } from '../gfx.js';
import { stars, ridge } from '../art/sky.js';
import { drawGazer, sightline } from '../art/motif.js';
import { drawFigure, POSES } from '../art/figures.js';
import { parsePath } from '../svgpath.js';

// ===========================================================================
// LANTERNS
function lanternShape(ctx, x, y, s, flick, alpha = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= alpha;
  const g = ctx.createLinearGradient(0, -46, 0, 40);
  g.addColorStop(0, '#d9532a'); g.addColorStop(0.55, '#f6a446'); g.addColorStop(1, '#fff1b8');
  ctx.beginPath();
  ctx.moveTo(-26, -40); ctx.quadraticCurveTo(0, -52, 26, -40);
  ctx.lineTo(21, 36); ctx.quadraticCurveTo(0, 41, -21, 36); ctx.closePath();
  ctx.fillStyle = g; ctx.fill();
  ctx.strokeStyle = 'rgba(140,40,10,0.35)'; ctx.lineWidth = 1;
  for (const sx of [-12, 0, 12]) { ctx.beginPath(); ctx.moveTo(sx * 1.05, -46); ctx.lineTo(sx * 0.85, 38); ctx.stroke(); }
  ctx.restore();
  glow(ctx, x, y + 30 * s, 120 * s * (0.9 + flick * 0.1), '#ffb35a', 0.35 * alpha);
  glow(ctx, x, y + 34 * s, 16 * s, '#fffbe0', 0.9 * alpha);
}

const LANTERNS = (() => {
  const R = rng(83);
  return Array.from({ length: 140 }, () => ({ x: R() * W * 1.3 - W * 0.15, y0: H * (0.4 + R() * 1.2), z: Math.pow(R(), 1.6), sp: 26 + R() * 30, sw: R() * 6, ph: R() * 6 }));
})();

function roofline(ctx, y, col, par, t) {
  // traditional eaves silhouettes
  ctx.fillStyle = col;
  ctx.beginPath(); ctx.moveTo(-50, H);
  let x = -50 - par;
  const R = rng(5);
  while (x < W + 200) {
    const w = 160 + R() * 220, h = 60 + R() * 120;
    ctx.lineTo(x, y);
    ctx.quadraticCurveTo(x + w * 0.12, y - h * 0.15, x + w * 0.22, y - h * 0.62);
    ctx.lineTo(x + w * 0.78, y - h * 0.62);
    ctx.quadraticCurveTo(x + w * 0.88, y - h * 0.15, x + w, y - h * 0.05 - 8);
    ctx.lineTo(x + w, y);
    x += w + R() * 30;
  }
  ctx.lineTo(W + 200, H); ctx.closePath(); ctx.fill();
}

export const lantern = {
  transIn: { dur: 1.6, type: 'fade' },
  caption: 'rgba(255,220,170,0.92)',
  draw(ctx, t, dur) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#050a1d'); g.addColorStop(0.6, '#0d1636'); g.addColorStop(1, '#2a1c2e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    stars(ctx, t, 0.5);
    const tilt = ease.inOutSine(seg(t, 0, dur)) * 120;
    // distant lanterns (bokeh), then near ones
    const sorted = LANTERNS;
    for (const L of sorted) {
      const y = L.y0 - (t + 6) * L.sp * (0.5 + L.z) + tilt * (0.3 + L.z);
      if (y < -120 || y > H + 120) continue;
      const x = L.x + Math.sin(t * 0.5 + L.ph) * L.sw * 6;
      const s = 0.18 + L.z * 0.75;
      const flick = Math.sin(t * 9 + L.ph * 7) * 0.5 + 0.5;
      if (s < 0.4) { glow(ctx, x, y, 34 * s * 3, '#ffae55', 0.28 + L.z * 0.3); glow(ctx, x, y, 5 * s * 3, '#fff2c0', 0.8); }
      else lanternShape(ctx, x, y, s, flick, 1);
    }
    roofline(ctx, H - 120 + tilt * 0.6, '#06070d', tilt * 0.2, t);
    // her lantern rises from her hands
    const rise = ease.inOutSine(seg(t, 0.6, dur));
    const lx = 760 + rise * 220, ly = lerp(H - 210, 160, rise) + tilt * 0.4;
    // the gazer: lit warmly from her lantern
    const gz = drawGazer(ctx, 120, H + 60, 1.25, { tilt: lerp(-0.25, -0.62, sseg(t, 0.5, 6)), extra: 'bun', style: 'rim', color: '#0b0a10', rim: '#ffb060', rimAlpha: 1 - rise * 0.5 });
    glow(ctx, gz.eye[0] + 120, gz.eye[1] + 160, 420, '#ff9a40', 0.22 * (1 - rise * 0.6));
    lanternShape(ctx, lx, ly, 1.3, Math.sin(t * 10) * 0.5 + 0.5, 1);
    sightline(ctx, gz.eye, [lx, ly + 30], sseg(t, 1.6, 4.0), { color: '#ffd9a0', alpha: env(t, 1.6, dur + 0.5, 0.4, 1) * 0.85 });
    vignette(ctx, 0.5);
    grain(ctx, t, 0.07);
  },
};

// ===========================================================================
// BALLOON — hand-tinted copperplate engraving
const ENG = '#2b1d14';
const BALLOON_D = 'M 0 -420 C 150 -420 250 -320 250 -170 C 250 -40 160 60 90 140 C 70 165 60 190 58 214 L -58 214 C -60 190 -70 165 -90 140 C -160 60 -250 -40 -250 -170 C -250 -320 -150 -420 0 -420 Z';
let balloonP = null;

export function drawBalloon(ctx, x, y, s, p, t) {
  if (!balloonP) balloonP = parsePath(BALLOON_D);
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const body = balloonP;
  // watercolour tint (blue body + gold bands), applied after the plate lines appear
  const tint = sseg(p, 0.45, 0.9);
  ctx.save();
  ctx.beginPath(); for (const q of body) { ctx.moveTo(q[0][0], q[0][1]); for (const v of q) ctx.lineTo(v[0], v[1]); } ctx.clip();
  ctx.globalAlpha = tint * 0.85;
  ctx.fillStyle = '#3e6ea8'; ctx.fillRect(-260, -430, 520, 660);
  // gold ornament bands
  ctx.fillStyle = '#d2a84a';
  ctx.fillRect(-260, -250, 520, 34); ctx.fillRect(-260, -60, 520, 46); ctx.fillRect(-260, 96, 520, 22);
  // garlands
  ctx.strokeStyle = '#d2a84a'; ctx.lineWidth = 7;
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * 72, -14, 34, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke(); }
  for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * 80, -300, 9, 0, TAU); ctx.fillStyle = '#e7c46a'; ctx.fill(); } // fleurs (simplified)
  // sun faces in the central band
  for (let i = -2; i <= 2; i++) { ctx.beginPath(); ctx.arc(i * 110, -150, 26, 0, TAU); ctx.fillStyle = '#e1b955'; ctx.fill(); }
  ctx.restore();
  // engraving lines: contour + longitudinal hatching (denser on the shadow side)
  strokePolys(ctx, body, { progress: sseg(p, 0, 0.35), width: 2.6, color: ENG });
  const hp = sseg(p, 0.15, 0.7);
  ctx.save();
  ctx.beginPath(); for (const q of body) { ctx.moveTo(q[0][0], q[0][1]); for (const v of q) ctx.lineTo(v[0], v[1]); } ctx.clip();
  ctx.strokeStyle = ENG;
  for (let i = -24; i <= 24; i++) {
    const k = i / 24;
    const shade = clamp((k + 0.2) * 1.2); // right side = shadow
    ctx.globalAlpha = hp * (0.15 + shade * 0.6);
    ctx.lineWidth = 0.8 + shade * 1.0;
    ctx.beginPath();
    for (let j = 0; j <= 40; j++) {
      const v = j / 40, yy = lerp(-420, 214, v);
      const half = 250 * Math.sin(Math.PI * Math.min(1, v * 1.15 + 0.02)) * (v > 0.75 ? lerp(1, 0.24, (v - 0.75) / 0.25) : 1);
      const xx = k * half;
      j ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy);
    }
    ctx.stroke();
  }
  // cross-hatch deep shadow
  ctx.globalAlpha = hp * 0.35; ctx.lineWidth = 0.8;
  for (let i = 0; i < 26; i++) { const yy = -380 + i * 22; ctx.beginPath(); ctx.moveTo(120, yy); ctx.quadraticCurveTo(200, yy + 30, 260, yy + 10); ctx.stroke(); }
  ctx.restore();
  // band outlines
  ctx.strokeStyle = ENG; ctx.lineWidth = 1.4; ctx.globalAlpha = sseg(p, 0.3, 0.6);
  for (const yy of [-250, -216, -60, -14, 96, 118]) { const half = 250 * Math.sqrt(Math.max(0, 1 - Math.pow((yy + 170) / 300, 2))); ctx.beginPath(); ctx.moveTo(-half, yy); ctx.quadraticCurveTo(0, yy + 16, half, yy); ctx.stroke(); }
  ctx.globalAlpha = 1;
  // gallery + aeronauts + brazier
  const gp = sseg(p, 0.35, 0.7);
  ctx.globalAlpha = gp;
  ctx.strokeStyle = ENG; ctx.lineWidth = 2.2;
  ctx.beginPath(); ctx.ellipse(0, 236, 92, 18, 0, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-92, 236); ctx.lineTo(-92, 262); ctx.moveTo(92, 236); ctx.lineTo(92, 262); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 262, 92, 18, 0, 0, Math.PI); ctx.stroke();
  for (let i = -6; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(i * 15, 214); ctx.lineTo(i * 15.3, 248); ctx.lineWidth = 0.8; ctx.stroke(); }
  drawFigure(ctx, -64, 250, 62, POSES.point, { color: ENG, hat: 'brim' });
  drawFigure(ctx, 66, 250, 62, POSES.lookUp, { color: ENG, facing: -1, hat: 'brim' });
  // fire glow in the neck
  const fl = 0.6 + 0.4 * Math.sin(t * 13);
  ctx.globalAlpha = gp * 0.9;
  glow(ctx, 0, 222, 60, '#ffb24a', 0.6 * fl);
  ctx.restore();
}

function engravedCloud(ctx, x, y, s, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.globalAlpha *= a;
  ctx.strokeStyle = ENG; ctx.lineWidth = 1.6;
  const lobes = [[-120, 0, 60], [-50, -30, 70], [30, -20, 64], [100, 4, 50]];
  ctx.beginPath(); for (const [lx, ly, r] of lobes) { ctx.moveTo(lx + r, ly); ctx.arc(lx, ly, r, Math.PI * 1.05, Math.PI * 1.95); } ctx.stroke();
  ctx.lineWidth = 0.8; ctx.globalAlpha *= 0.6;
  for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.moveTo(-170 + i * 8, 10 + i * 4); ctx.quadraticCurveTo(-20, 30 + i * 3, 150 - i * 6, 10 + i * 4); ctx.stroke(); }
  ctx.restore();
}

function parisSkyline(ctx, y, p) {
  ctx.save();
  ctx.fillStyle = 'rgba(43,29,20,0.12)'; ctx.strokeStyle = ENG; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.moveTo(0, y);
  const R = rng(17);
  let x = 0;
  while (x < W) {
    const w = 40 + R() * 90, h = 30 + R() * 70;
    ctx.lineTo(x, y - h); ctx.lineTo(x + w * 0.5, y - h - 20 * R()); ctx.lineTo(x + w, y - h); x += w;
    if (R() < 0.15) { ctx.lineTo(x, y - h - 60); ctx.lineTo(x + 8, y - h - 60); ctx.lineTo(x + 8, y - h); x += 8; }
  }
  ctx.lineTo(W, y + 300); ctx.lineTo(0, y + 300); ctx.closePath();
  ctx.globalAlpha = p; ctx.fill(); ctx.stroke();
  // dome (Les Invalides-like)
  ctx.beginPath(); ctx.moveTo(1380, y - 60); ctx.quadraticCurveTo(1440, y - 210, 1500, y - 60); ctx.closePath(); ctx.fillStyle = 'rgba(210,168,74,0.35)'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1440, y - 190); ctx.lineTo(1440, y - 250); ctx.stroke();
  // horizontal engraving lines across the city
  ctx.globalAlpha = p * 0.5; ctx.lineWidth = 0.7;
  for (let i = 0; i < 30; i++) { ctx.beginPath(); ctx.moveTo(0, y - 20 + i * 6); ctx.lineTo(W, y - 20 + i * 6); ctx.stroke(); }
  ctx.restore();
}

export const balloon = {
  transIn: { dur: 1.4, type: 'fade' },
  caption: 'rgba(43,29,20,0.9)',
  init() { surface({ key: 'laid', base: '#efe3c6', dark: '#c9b48c', light: '#f7eedb', scale: 5, contrast: 0.3, fibres: 1600, spots: 40, edge: 0.4, seed: 33 }); },
  draw(ctx, t, dur) {
    ctx.drawImage(surface({ key: 'laid' }), 0, 0);
    const rise = ease.inOutCubic(seg(t, 3.5, dur + 1.5));
    const camUp = rise * 360;
    ctx.save();
    ctx.translate(0, camUp);
    // sky: horizontal engraving lines (tonal), lighter near horizon
    ctx.save(); ctx.strokeStyle = ENG; ctx.lineWidth = 0.7;
    const plate = sseg(t, 0, 2.2);
    for (let i = 0; i < 90; i++) {
      const yy = -420 + i * 12;
      ctx.globalAlpha = plate * 0.22 * (1 - i / 90);
      ctx.beginPath(); ctx.moveTo(0, yy); ctx.lineTo(W * Math.min(1, plate * 1.4), yy); ctx.stroke();
    }
    ctx.restore();
    engravedCloud(ctx, 380, 180, 1.2, plate * 0.9);
    engravedCloud(ctx, 1560, -60, 1.0, plate * 0.8);
    engravedCloud(ctx, 1200, 330, 0.8, plate * 0.7);
    parisSkyline(ctx, H - 150, plate);
    // smoke from the launch
    const sm = seg(t, 2.5, dur);
    ctx.save(); ctx.strokeStyle = ENG; ctx.lineWidth = 1.2;
    for (let i = 0; i < 10; i++) {
      const k = (i / 10 + sm * 0.4) % 1;
      const sx = 960 + Math.sin(i * 2.3 + t) * 40 + k * 120, sy = H - 250 - k * 380;
      ctx.globalAlpha = (1 - k) * 0.5 * sm;
      ctx.beginPath(); ctx.arc(sx, sy, 20 + k * 60, Math.PI * 0.9, Math.PI * 2.4); ctx.stroke();
    }
    ctx.restore();
    // the balloon
    const by = lerp(H - 300, 120, rise);
    drawBalloon(ctx, 960 + Math.sin(t * 0.4) * 10, by, 0.82 + rise * 0.06, seg(t, 0.4, 4.2), t);
    // crowd in the foreground
    const R = rng(44);
    for (let i = 0; i < 26; i++) {
      const fx = 80 + i * 72 + R() * 30, h = 120 + R() * 50;
      const pose = R() < 0.4 ? POSES.point : R() < 0.5 ? POSES.reach : POSES.lookUp;
      drawFigure(ctx, fx, H - 20, h, pose, { color: ENG, hat: R() < 0.6 ? 'brim' : null, dress: R() < 0.4, facing: fx < 960 ? 1 : -1, alpha: plate });
    }
    ctx.restore();
    // foreground gazer (engraved), sightline to the gallery
    const gz = drawGazer(ctx, 40, H + 40, 0.95, { tilt: lerp(-0.3, -0.62, sseg(t, 3, 8)), extra: 'tricorn', style: 'engrave', color: ENG, width: 2.4, progress: sseg(t, 0.5, 3) });
    sightline(ctx, gz.eye, [960, by + camUp + 230 * 0.86], sseg(t, 4.5, 7), { color: '#b5502a', alpha: env(t, 4.5, dur, 0.4, 1) * 0.9, width: 1.6, glow: 6 });
    // print caption
    text(ctx, 'EXPÉRIENCE DE LA MACHINE AÉROSTATIQUE', W / 2 + 380, 170, { font: 'IM Fell English', size: 30, color: ENG, spacing: 6, alpha: sseg(t, 1.5, 3.5) * (1 - rise * 0.6) });
    text(ctx, 'de MM. de Montgolfier · le 21 Novembre 1783', W / 2 + 380, 210, { font: 'IM Fell English', style: 'italic', size: 26, color: ENG, alpha: sseg(t, 2, 4) * (1 - rise * 0.6) });
    grain(ctx, t, 0.05);
    vignette(ctx, 0.3, '#3a2814');
  },
};
