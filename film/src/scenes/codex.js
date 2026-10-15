// CHAPTER II — THE CODEX. Leonardo's sheet: an eye, bird studies, the ornithopter, the aerial screw.
// Sepia ink on parchment, mirror-written notes, drawn stroke by stroke under a slowly travelling camera.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU, noise2 } from '../core.js';
import { surface, grain, vignette, text, strokePolys, hatch, fillPolys, xform, glow } from '../gfx.js';
import { parsePath } from '../svgpath.js';
import { birdSide } from '../art/figures.js';

const SEPIA = '#4b2c17', SEPIA_L = '#7a4e2c', RED = '#9a3b22';

// Virtual sheet is 3200 x 1800; camera keyframes [time, cx, cy, zoom]
const CAM = [[0, 760, 620, 1.9], [4.5, 900, 620, 1.25], [6.5, 1500, 560, 1.0], [11, 1700, 600, 0.95], [12.5, 1720, 1180, 0.9], [17, 1820, 1200, 0.95], [18.5, 2330, 960, 1.05], [22.5, 2360, 940, 1.18]];
function camAt(t) {
  let i = 0;
  while (i < CAM.length - 2 && t > CAM[i + 1][0]) i++;
  const [t0, x0, y0, z0] = CAM[i], [t1, x1, y1, z1] = CAM[i + 1];
  const k = ease.inOutCubic(clamp((t - t0) / (t1 - t0)));
  return [lerp(x0, x1, k), lerp(y0, y1, k), lerp(z0, z1, k)];
}

function mirrorText(ctx, str, x, y, size, alpha, p = 1) {
  if (alpha <= 0 || p <= 0) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(-1, 1);
  const n = Math.ceil(str.length * p);
  text(ctx, str.slice(0, n), 0, 0, { font: 'IM Fell English', style: 'italic', size, color: SEPIA, align: 'right', alpha: alpha * 0.85 });
  ctx.restore();
}

// --- the eye (study after Leonardo's anatomical eyes)
const EYE = {
  lidTop: 'M -150 0 C -100 -62 40 -78 150 -8', lidBot: 'M -150 0 C -80 40 60 46 150 -8',
  crease: 'M -138 -24 C -80 -96 60 -110 160 -30', brow: 'M -190 -90 C -100 -170 80 -176 210 -96',
  lash: 'M -120 -34 L -132 -52 M -90 -50 L -98 -72 M -55 -60 L -58 -84 M -20 -64 L -18 -88 M 20 -64 L 26 -86 M 58 -58 L 68 -78 M 96 -44 L 110 -60',
};
let eyeP = null;

function drawEye(ctx, x, y, s, p, look) {
  if (!eyeP) { eyeP = {}; for (const k in EYE) eyeP[k] = parsePath(EYE[k]); }
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const ink = (polys, w, pp) => strokePolys(ctx, polys, { progress: pp, width: w, color: SEPIA, taper: true, wobble: 0.6, seed: 4 });
  ink(eyeP.lidTop, 4.2, sseg(p, 0, 0.3)); ink(eyeP.lidBot, 3.2, sseg(p, 0.1, 0.4));
  ink(eyeP.crease, 2.2, sseg(p, 0.3, 0.55)); ink(eyeP.brow, 3, sseg(p, 0.4, 0.7)); ink(eyeP.lash, 1.6, sseg(p, 0.5, 0.8));
  // iris & pupil follow the gaze upward
  const ip = sseg(p, 0.45, 0.8);
  if (ip > 0) {
    const ix = 10 + look * 26, iy = -6 - look * 26;
    ctx.save();
    ctx.beginPath(); ctx.moveTo(-150, 0); ctx.bezierCurveTo(-100, -62, 40, -78, 150, -8); ctx.bezierCurveTo(60, 46, -80, 40, -150, 0); ctx.clip();
    ctx.globalAlpha = ip;
    ctx.strokeStyle = SEPIA; ctx.lineWidth = 2.4;
    ctx.beginPath(); ctx.arc(ix, iy, 46, 0, TAU * ip); ctx.stroke();
    ctx.lineWidth = 0.9;
    for (let i = 0; i < 36 * ip; i++) { const a = (i / 36) * TAU; ctx.beginPath(); ctx.moveTo(ix + Math.cos(a) * 20, iy + Math.sin(a) * 20); ctx.lineTo(ix + Math.cos(a) * 44, iy + Math.sin(a) * 44); ctx.stroke(); }
    ctx.fillStyle = SEPIA; ctx.beginPath(); ctx.arc(ix, iy, 18, 0, TAU); ctx.fill();
    ctx.fillStyle = '#efe0bd'; ctx.beginPath(); ctx.arc(ix + 8, iy - 8, 5, 0, TAU); ctx.fill();
    ctx.restore();
  }
  // hatching under the brow
  const hp = sseg(p, 0.7, 1);
  if (hp > 0) hatch(ctx, parsePath('M -170 -40 C -100 -130 80 -140 190 -50 C 80 -110 -90 -100 -170 -40 Z'), { angle: -0.9, spacing: 7, width: 0.9, color: SEPIA, alpha: 0.7 * hp });
  ctx.restore();
  return [x + (10 + look * 26) * s, y + (-6 - look * 26) * s];
}

// --- ornithopter (after Ms. B): a prone pilot on a frame, two bat-like wings
function wingPolys(span, flap) {
  // spar + radiating ribs + scalloped membrane edge, in wing-local coords (root at 0,0, extends +x)
  const ribs = [], edge = [];
  const tip = [span, -span * 0.12];
  const spar = [[0, 0], [span * 0.35, -span * 0.16], [span * 0.7, -span * 0.2], tip];
  const n = 6;
  for (let i = 0; i < n; i++) {
    const k = (i + 1) / (n + 1);
    const sx = span * (0.18 + k * 0.78), sy = -span * (0.08 + 0.12 * Math.sin(k * Math.PI));
    const len = span * (0.5 - k * 0.32);
    const ang = Math.PI * 0.5 + k * 0.5;
    ribs.push([[sx, sy], [sx + Math.cos(ang) * len * 0.3, sy + Math.sin(ang) * len]]);
  }
  edge.push([0, 30]);
  for (let i = 0; i < ribs.length; i++) {
    const e = ribs[i][1];
    edge.push(e);
    const nx = i < ribs.length - 1 ? ribs[i + 1][1] : tip;
    edge.push([(e[0] + nx[0]) / 2, (e[1] + nx[1]) / 2 - span * 0.05]);
  }
  edge.push(tip);
  return { spar: [spar], ribs, edge: [edge] };
}

export function drawOrnithopter(ctx, x, y, s, p, flap) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const ink = (polys, w, pp, taper = true) => strokePolys(ctx, polys, { progress: pp, width: w, color: SEPIA, taper, wobble: 0.5, seed: 7 });
  // frame / boat
  const frame = parsePath('M -170 40 C -120 70 120 70 170 40 L 150 70 C 80 96 -80 96 -150 70 Z M -150 70 L -170 140 M 150 70 L 170 140 M -40 92 L -60 150 M 40 92 L 60 150');
  ink(frame, 3, sseg(p, 0, 0.25));
  // prone pilot
  const pilot = parsePath('M -120 30 C -80 10 0 6 60 14 C 90 18 110 10 128 0 C 146 -8 160 4 150 18 C 140 30 120 32 100 32 C 40 40 -60 44 -120 30 Z M 128 0 C 120 -14 136 -28 152 -20 C 166 -12 160 4 150 8');
  ink(pilot, 2.4, sseg(p, 0.15, 0.4));
  // pulley + cords
  const pulley = parsePath('M 0 -40 m -16 0 a 16 16 0 1 0 32 0 a 16 16 0 1 0 -32 0 M 0 -24 L 0 30 M -16 -40 L -120 -60 M 16 -40 L 120 -60');
  ink(pulley, 1.6, sseg(p, 0.35, 0.55));
  // wings
  const fl = flap;
  for (const dir of [-1, 1]) {
    ctx.save();
    ctx.translate(dir * 40, -10);
    ctx.scale(dir, 1);
    ctx.rotate(-fl * 0.55);
    const wp = wingPolys(560, fl);
    const pp = sseg(p, 0.3, 0.85);
    ink(wp.spar, 4, pp);
    for (const r of wp.ribs) ink([r], 2.2, pp);
    ink(wp.edge, 1.8, pp);
    hatch(ctx, [wp.edge[0].concat([[0, 0]])], { angle: 0.4, spacing: 6, width: 0.6, color: SEPIA, alpha: 0.42 * sseg(p, 0.7, 1) });
    ctx.restore();
  }
  ctx.restore();
}

// --- aerial screw (vite aerea): a linen helix around a mast, on a round platform
export function drawScrew(ctx, x, y, s, p, rot) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
  const R = 260, Hh = 360, turns = 1.15, tilt = 0.32;
  const P3 = (r, th, h) => [Math.cos(th + rot) * r, -h + Math.sin(th + rot) * r * tilt];
  const outer = [], inner = [];
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const k = i / N, th = k * turns * TAU, h = 60 + k * (Hh - 80);
    outer.push(P3(R * (1 - k * 0.15), th, h)); inner.push(P3(14, th, h + 30));
  }
  const ink = (polys, w, pp) => strokePolys(ctx, polys, { progress: pp, width: w, color: SEPIA, taper: true, wobble: 0.4, seed: 11 });
  // platform ellipse + mast
  const plat = [];
  for (let i = 0; i <= 64; i++) { const a = (i / 64) * TAU; plat.push([Math.cos(a) * 200, Math.sin(a) * 200 * tilt]); }
  ink([plat], 2.6, sseg(p, 0, 0.25));
  ink([[[0, 30], [0, -Hh - 40]]], 3, sseg(p, 0.1, 0.35));
  ink([outer], 3, sseg(p, 0.2, 0.7));
  // radial battens & linen hatching
  const hp = sseg(p, 0.45, 1);
  ctx.save();
  ctx.globalAlpha = hp;
  ctx.strokeStyle = SEPIA; ctx.lineWidth = 0.9;
  for (let i = 0; i <= N; i += 3) {
    const k = i / N, th = k * turns * TAU + rot;
    const front = Math.sin(th) > 0;
    ctx.globalAlpha = hp * (front ? 0.85 : 0.35);
    ctx.beginPath(); ctx.moveTo(inner[i][0], inner[i][1]); ctx.lineTo(outer[i][0], outer[i][1]); ctx.stroke();
  }
  ctx.restore();
  // legs / crank
  ink(parsePath('M -150 40 L -170 150 M 150 40 L 170 150 M 0 60 L 0 160 M -40 140 L 40 140 L 40 120'), 2, sseg(p, 0.3, 0.6));
  ctx.restore();
}

let birdsP = null;
export default {
  transIn: { dur: 1.6, type: 'fade' },
  caption: 'rgba(60,34,18,0.9)',
  init() {
    surface({ key: 'parchment', w: 3200, h: 1800, base: '#e2cc9f', dark: '#9d7a4c', light: '#f1e3c2', scale: 4, contrast: 0.42, spots: 120, fibres: 3000, edge: 0.9, seed: 21 });
    birdsP = Array.from({ length: 6 }, (_, i) => parsePath(birdSide(-1.4 + i * 0.55)));
  },
  draw(ctx, t, dur) {
    const [cx, cy, z] = camAt(t);
    ctx.fillStyle = '#2a1a0e'; ctx.fillRect(0, 0, W, H);
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.scale(z, z);
    ctx.translate(-cx, -cy);
    ctx.drawImage(surface({ key: 'parchment', w: 3200, h: 1800 }), 0, 0);
    // margin rules and folio
    ctx.strokeStyle = 'rgba(122,78,44,0.35)'; ctx.lineWidth = 1.2;
    ctx.beginPath(); ctx.moveTo(120, 90); ctx.lineTo(120, 1710); ctx.moveTo(3080, 90); ctx.lineTo(3080, 1710); ctx.stroke();
    text(ctx, 'f. 8 r.', 2980, 140, { font: 'IM Fell English', style: 'italic', size: 40, color: SEPIA_L, alpha: 0.8 });
    text(ctx, 'Codice sul volo degli uccelli · 1505', 1600, 140, { font: 'IM Fell English', size: 46, color: SEPIA, alpha: 0.8 * sseg(t, 3, 5), spacing: 2 });

    // 1. The eye — the gaze moment
    const look = sseg(t, 2.2, 3.6);
    const iris = drawEye(ctx, 700, 640, 1.3, seg(t, 0.2, 2.6), look);
    mirrorText(ctx, "l'occhio, finestra dell'anima", 880, 860, 34, 1, sseg(t, 2, 4));
    // sightline: ink dashes to the bird studies
    const sl = sseg(t, 3.2, 5.8);
    if (sl > 0) {
      ctx.save(); ctx.strokeStyle = RED; ctx.lineWidth = 2; ctx.setLineDash([12, 10]); ctx.globalAlpha = 0.8;
      ctx.beginPath(); ctx.moveTo(iris[0], iris[1]); ctx.lineTo(lerp(iris[0], 1180, sl), lerp(iris[1], 420, sl)); ctx.stroke(); ctx.restore();
    }

    // 2. Bird studies: a sequence of wing positions
    birdsP.forEach((b, i) => {
      const p = sseg(t, 4.2 + i * 0.5, 5.6 + i * 0.5);
      const bx = 1250 + i * 270, by = 470 + Math.sin(i * 0.9) * 50;
      strokePolys(ctx, xform(b, { x: bx, y: by, s: 1.45 }), { progress: p, width: 2.8, color: SEPIA, taper: true, wobble: 0.5, seed: i });
      if (p > 0.6) hatch(ctx, xform([b[0]], { x: bx, y: by, s: 1.45 }), { angle: 0.6, spacing: 5, width: 0.7, color: SEPIA, alpha: 0.5 * smooth((p - 0.6) / 0.4) });
    });
    // motion arcs of the wingtip
    const arcP = sseg(t, 7, 9);
    if (arcP > 0) {
      ctx.save(); ctx.strokeStyle = SEPIA_L; ctx.lineWidth = 1.2; ctx.setLineDash([4, 6]); ctx.globalAlpha = 0.7;
      ctx.beginPath();
      for (let i = 0; i <= 60 * arcP; i++) { const k = i / 60; const x = 1240 + k * 1300, y = 380 - Math.sin(k * TAU * 2.5) * 60; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.restore();
    }
    mirrorText(ctx, "L'uccello è strumento operante per legge matematica,", 1330, 720, 40, 1, sseg(t, 6.5, 9.5));
    mirrorText(ctx, "il quale strumento è in potestà dell'omo poterlo fare", 1330, 772, 40, 1, sseg(t, 7.5, 10.5));
    mirrorText(ctx, 'con tutti i sua moti.', 1330, 824, 40, 1, sseg(t, 8.5, 11));

    // 3. Ornithopter
    const flap = Math.sin((t - 13) * 2.6) * sseg(t, 14.5, 15.5);
    drawOrnithopter(ctx, 1760, 1240, 1.0, seg(t, 11.2, 15.2), flap);
    mirrorText(ctx, 'ala di pipistrello', 1340, 1560, 36, 1, sseg(t, 14, 16));
    text(ctx, 'A', 1180, 1110, { font: 'IM Fell English', size: 40, color: RED, alpha: sseg(t, 13, 14) });
    text(ctx, 'B', 2350, 1110, { font: 'IM Fell English', size: 40, color: RED, alpha: sseg(t, 13.2, 14.2) });

    // 4. Aerial screw — will wait four hundred years
    const rot = (t - 17) * 0.7 * sseg(t, 19.5, 21);
    drawScrew(ctx, 2420, 1080, 1.0, seg(t, 17.2, 20.6), rot);
    mirrorText(ctx, 'vite aerea', 2560, 1290, 40, 1, sseg(t, 19, 20.5));
    const glowA = sseg(t, 20, 22);
    if (glowA > 0) glow(ctx, 2420, 870, 380, '#fff1cf', 0.18 * glowA);
    ctx.restore();

    // candle-light falloff
    vignette(ctx, 0.62, '#1c0f05', 0.35);
    grain(ctx, t, 0.07);
  },
};
