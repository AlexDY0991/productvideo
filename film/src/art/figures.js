// Human figures: the recurring "gazer" profile and a parametric full-body silhouette.
import { parsePath } from '../svgpath.js';
import { clamp, smooth, lerp } from '../core.js';

// ---------------------------------------------------------------------------
// THE GAZER — head & shoulders in profile, facing right. Authored upright,
// then bent back at the neck so the face turns toward the sky.
const PROFILE_D = `M 0 500 L 0 466 C 30 446 80 430 116 414 C 134 404 140 380 138 352
 C 136 326 128 304 116 284 C 98 256 82 214 84 166 C 86 104 130 44 196 32
 C 246 24 282 52 290 100 C 293 120 292 134 296 148 C 299 155 297 162 292 168
 C 298 182 312 204 322 220 C 326 228 320 236 308 236 C 302 236 299 240 301 246
 C 304 252 306 256 302 262 C 299 265 299 268 302 272 C 306 278 304 284 297 288
 C 293 291 293 295 297 302 C 302 312 298 324 286 330 C 270 338 252 340 240 344
 C 232 350 230 362 232 378 C 234 400 240 420 254 440 C 270 462 300 478 330 500 Z`;
const EAR_D = 'M 178 214 C 164 204 150 214 152 234 C 154 254 166 266 182 262';
const EYE_D = 'M 262 178 C 268 174 276 174 282 178';
const BROW_D = 'M 256 160 C 266 154 278 154 288 158';
const HAIR_SHORT_D = `M 116 284 C 98 256 80 214 82 166 C 84 102 130 40 196 28 C 248 20 284 50 292 98
 C 266 82 232 80 206 90 C 184 98 172 124 176 158 C 164 168 156 196 152 232 C 142 252 130 270 116 284 Z`;
const HAIR_LONG_D = `M 196 28 C 248 20 284 50 292 98 C 266 82 232 80 206 90 C 184 98 172 124 176 158
 C 168 196 172 240 180 290 C 186 330 170 380 140 420 C 110 446 70 452 40 448 C 80 420 100 380 104 340
 C 100 300 80 250 80 190 C 80 110 130 40 196 28 Z`;
const BUN_D = `M 196 28 C 248 20 284 50 292 98 C 266 82 232 80 206 90 C 184 98 172 124 176 158
 C 150 168 120 160 104 140 C 92 110 120 44 196 28 Z M 98 110 C 66 108 52 76 72 56 C 92 38 124 50 126 80 Z`;
const CAP_D = `M 92 150 C 96 80 150 26 214 26 C 258 26 290 56 298 104 L 352 118 C 358 124 354 130 344 130
 L 262 126 C 200 122 140 132 92 158 Z`;
const HELMET_D = `M 70 250 C 50 150 100 20 214 14 C 320 10 372 100 368 190 C 364 270 330 330 270 360
 C 210 384 120 370 92 320 C 80 300 74 278 70 250 Z`;
const VISOR_D = `M 248 70 C 300 80 352 128 358 190 C 362 236 346 282 314 314 C 290 294 272 262 268 222
 C 262 176 258 120 248 70 Z`;
const AVIATOR_D = `M 82 170 C 82 90 140 30 210 28 C 256 28 286 56 294 100 C 262 86 226 86 198 98
 C 178 108 168 132 168 156 C 140 168 108 176 82 170 Z M 204 102 C 224 88 258 92 276 108 C 284 120 282 134 268 142
 C 248 150 222 144 210 130 C 202 122 200 110 204 102 Z`;

const TRICORN_D = `M 70 128 C 96 112 120 74 160 58 C 200 42 250 44 286 66 C 300 76 318 92 330 112
 C 300 112 280 104 262 98 C 230 90 180 92 140 108 C 116 118 92 126 70 128 Z M 112 104 C 120 60 170 30 222 34 C 258 38 282 60 290 84 C 250 70 190 70 150 86 C 136 92 122 98 112 104 Z`;

const BRODIE_D = `M 40 150 C 70 140 100 136 120 120 C 140 70 180 40 226 42 C 266 44 290 74 296 112
 C 316 122 340 128 366 130 C 340 146 300 150 260 146 C 200 140 120 150 40 150 Z`;

const EXTRAS = { brodie: BRODIE_D, tricorn: TRICORN_D, short: HAIR_SHORT_D, long: HAIR_LONG_D, bun: BUN_D, cap: CAP_D, helmet: HELMET_D, aviator: AVIATOR_D };

const PIVOT = [190, 330];
function bend(polys, angle) {
  const c = Math.cos(angle), s = Math.sin(angle);
  return polys.map((p) => {
    const q = p.map(([x, y]) => {
      const w = smooth(clamp((372 - y) / 44));
      const a = angle * w, ca = Math.cos(a), sa = Math.sin(a);
      const dx = x - PIVOT[0], dy = y - PIVOT[1];
      return [PIVOT[0] + dx * ca - dy * sa, PIVOT[1] + dx * sa + dy * ca];
    });
    q.closed = p.closed;
    return q;
  });
}

const gazerCache = new Map();
// tilt: radians the head is tipped back (negative = looking up). Returns polylines in a 0..360 x 0..500 box.
export function gazer(tilt = -0.42, extra = null) {
  const key = tilt.toFixed(3) + (extra || '');
  if (gazerCache.has(key)) return gazerCache.get(key);
  const body = bend(parsePath(PROFILE_D), tilt);
  const ear = bend(parsePath(EAR_D), tilt);
  const eye = bend(parsePath(EYE_D), tilt);
  const brow = bend(parsePath(BROW_D), tilt);
  const ex = extra ? bend(parsePath(EXTRAS[extra]), tilt) : [];
  const visor = extra === 'helmet' ? bend(parsePath(VISOR_D), tilt) : [];
  const ep = bend([[[272, 180]]], tilt)[0][0];
  const dir = [Math.cos(tilt), Math.sin(tilt)];
  const v = { body, ear, eye, brow, extra: ex, visor, eyePt: ep, dir };
  gazerCache.set(key, v);
  return v;
}

// ---------------------------------------------------------------------------
// Parametric full-body silhouette (forward kinematics, tapered capsules).
// Pose angles in radians, 0 = pointing straight down; positive rotates toward +x (figure's front).
export const POSES = {
  stand: { lean: 0, head: 0, neck: 0, uArmL: 0.08, lArmL: 0.1, uArmR: -0.08, lArmR: 0.1, thighL: 0.04, shinL: 0, thighR: -0.04, shinR: 0 },
  lookUp: { lean: -0.05, head: -0.7, neck: -0.15, uArmL: 0.1, lArmL: 0.2, uArmR: -0.08, lArmR: 0.15, thighL: 0.06, shinL: 0, thighR: -0.06, shinR: 0 },
  kite: { lean: -0.1, head: -0.8, neck: -0.15, uArmL: 2.45, lArmL: 0.2, uArmR: 0.35, lArmR: 1.25, thighL: 0.2, shinL: -0.02, thighR: -0.16, shinR: -0.08 },
  run: { lean: 0.2, head: -0.55, neck: -0.1, uArmL: -0.75, lArmL: 1.0, uArmR: 0.85, lArmR: 1.3, thighL: 0.85, shinL: -0.35, thighR: -0.55, shinR: -1.25 },
  reach: { lean: -0.1, head: -0.8, neck: -0.15, uArmL: 2.75, lArmL: 0.08, uArmR: 0.2, lArmR: 0.3, thighL: 0.08, shinL: 0, thighR: -0.12, shinR: 0 },
  point: { lean: -0.06, head: -0.6, neck: -0.12, uArmL: 2.1, lArmL: 0.1, uArmR: 0.15, lArmR: 0.4, thighL: 0.1, shinL: 0, thighR: -0.1, shinR: 0 },
  sit: { lean: -0.12, head: -0.7, neck: -0.15, uArmL: 0.35, lArmL: 1.0, uArmR: 0.25, lArmR: 0.9, thighL: 1.5, shinL: -1.45, thighR: 1.45, shinR: -1.35 },
  fly: { lean: 0, head: -0.5, neck: -0.1, uArmL: 2.0, lArmL: 0.15, uArmR: 1.5, lArmR: 0.2, thighL: 0.15, shinL: -0.35, thighR: -0.15, shinR: -0.6 },
  fall: { lean: 0.3, head: 0.4, neck: 0.1, uArmL: 2.8, lArmL: 0.5, uArmR: -2.6, lArmR: -0.4, thighL: 0.6, shinL: -0.9, thighR: -0.3, shinR: -0.4 },
  hide: { lean: 0.15, head: -0.95, neck: -0.25, uArmL: 1.5, lArmL: 1.6, uArmR: 1.1, lArmR: 1.5, thighL: 0.6, shinL: -1.2, thighR: 0.4, shinR: -1.0 },
};

export function lerpPose(a, b, t) {
  const o = {};
  for (const k in a) o[k] = lerp(a[k], b[k] ?? a[k], t);
  return o;
}

// Draw a figure whose feet rest at (x, y). h = standing height in px. opts.child shortens proportions.
export function drawFigure(ctx, x, y, h, pose, { color = '#000', child = false, dress = false, coat = false, hat = null, facing = 1, alpha = 1 } = {}) {
  const u = h / (child ? 6.2 : 7.6);           // head units
  const P = { ...POSES.stand, ...pose };
  const legL = (child ? 2.7 : 3.9) * u, torso = (child ? 2.0 : 2.45) * u, armU = (child ? 1.25 : 1.5) * u, armL = (child ? 1.2 : 1.55) * u;
  const thigh = legL * 0.52, shin = legL * 0.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(facing, 1);
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color; ctx.strokeStyle = color;
  ctx.lineCap = 'round'; ctx.lineJoin = 'round';
  const dirv = (a) => [Math.sin(a), Math.cos(a)];
  // hips: compute so that the lower foot touches y=0
  const hipX = 0;
  const kneeL = (a) => dirv(a);
  const footOf = (th, sh) => { const k = dirv(th), s = dirv(th + sh); return [k[0] * thigh + s[0] * shin, k[1] * thigh + s[1] * shin]; };
  const fL = footOf(P.thighL, P.shinL), fR = footOf(P.thighR, P.shinR);
  const hipY = -Math.max(fL[1], fR[1]);
  const hip = [hipX - (fL[1] > fR[1] ? fL[0] : fR[0]) * 0.0, hipY];
  const td = dirv(Math.PI + P.lean);
  const sh = [hip[0] + td[0] * torso, hip[1] + td[1] * torso];
  const neckD = dirv(Math.PI + P.lean + P.neck);
  const nk = [sh[0] + neckD[0] * u * 0.35, sh[1] + neckD[1] * u * 0.35];
  const headA = Math.PI + P.lean + P.neck - P.head * 0.3;
  const headC = [nk[0] + Math.sin(headA) * u * 0.55, nk[1] + Math.cos(headA) * u * 0.55];
  const limb = (p0, a1, l1, a2, l2, w0, w1, w2) => {
    const d1 = dirv(a1), j = [p0[0] + d1[0] * l1, p0[1] + d1[1] * l1];
    const d2 = dirv(a1 + a2), e = [j[0] + d2[0] * l2, j[1] + d2[1] * l2];
    taper(ctx, p0, j, w0, w1); taper(ctx, j, e, w1, w2);
    return e;
  };
  const back = (fn) => { ctx.save(); ctx.globalAlpha *= 0.82; fn(); ctx.restore(); };
  // far limbs slightly lighter for depth
  back(() => limb([hip[0] - u * 0.1, hip[1]], P.thighR, thigh, P.shinR, shin, u * 0.62, u * 0.42, u * 0.3));
  back(() => limb(sh, P.uArmR + P.lean, armU, P.lArmR, armL, u * 0.36, u * 0.3, u * 0.2));
  // torso
  taper(ctx, hip, sh, u * (child ? 0.95 : 1.0), u * (child ? 1.0 : 1.2));
  if (dress) {
    ctx.beginPath();
    ctx.moveTo(hip[0] - u * 0.5, hip[1] - u * 0.8);
    ctx.quadraticCurveTo(hip[0] - u * 1.3, hip[1] + u * 1.2, hip[0] - u * 1.2, hip[1] + u * 1.9);
    ctx.lineTo(hip[0] + u * 1.3, hip[1] + u * 1.9);
    ctx.quadraticCurveTo(hip[0] + u * 1.2, hip[1] + u * 1.0, hip[0] + u * 0.5, hip[1] - u * 0.8);
    ctx.fill();
  }
  if (coat) {
    ctx.beginPath();
    ctx.moveTo(sh[0] - u * 0.6, sh[1]);
    ctx.lineTo(hip[0] - u * 0.75, hip[1] + u * 1.3);
    ctx.lineTo(hip[0] + u * 0.85, hip[1] + u * 1.3);
    ctx.lineTo(sh[0] + u * 0.6, sh[1]);
    ctx.fill();
  }
  limb([hip[0] + u * 0.1, hip[1]], P.thighL, thigh, P.shinL, shin, u * 0.62, u * 0.42, u * 0.3);
  // feet
  ctx.beginPath(); ctx.ellipse(fL[0] + hip[0] + u * 0.25, fL[1] + hip[1], u * 0.42, u * 0.16, 0, 0, Math.PI * 2); ctx.fill();
  back(() => { ctx.beginPath(); ctx.ellipse(fR[0] + hip[0] + u * 0.25, fR[1] + hip[1], u * 0.42, u * 0.16, 0, 0, Math.PI * 2); ctx.fill(); });
  // neck + head (looking up tips the head back; face direction rotates upward)
  taper(ctx, sh, nk, u * 0.42, u * 0.36);
  const faceA = Math.PI / 2 - P.head - P.lean * 0.5;
  ctx.beginPath(); ctx.ellipse(headC[0], headC[1], u * 0.47, u * 0.56, P.lean + P.head * 0.75, 0, Math.PI * 2); ctx.fill();
  const fd = dirv(faceA), fu = dirv(faceA + 0.55);
  ctx.beginPath(); ctx.ellipse(headC[0] + fd[0] * u * 0.44, headC[1] + fd[1] * u * 0.44, u * 0.13, u * 0.09, faceA, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(headC[0] + fd[0] * u * 0.2 - fu[0] * u * 0.05, headC[1] + fd[1] * u * 0.2 + u * 0.32 * Math.abs(fd[0]) * 0.6, u * 0.34, u * 0.26, faceA, 0, Math.PI * 2); ctx.fill();
  if (hat === 'cap') { ctx.save(); ctx.translate(headC[0], headC[1]); ctx.rotate(P.lean + P.head * 0.75); ctx.beginPath(); ctx.ellipse(0, -u * 0.18, u * 0.52, u * 0.42, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(0, -u * 0.22, u * 0.85, u * 0.1); ctx.restore(); }
  if (hat === 'helmet') { ctx.save(); ctx.translate(headC[0], headC[1]); ctx.rotate(P.lean + P.head * 0.75); ctx.beginPath(); ctx.ellipse(0, -u * 0.12, u * 0.62, u * 0.5, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-u * 0.8, -u * 0.16, u * 1.6, u * 0.12); ctx.restore(); }
  if (hat === 'bun') { ctx.beginPath(); ctx.arc(headC[0] - fd[0] * u * 0.5, headC[1] - fd[1] * u * 0.5 - u * 0.15, u * 0.26, 0, Math.PI * 2); ctx.fill(); }
  if (hat === 'hair') { ctx.beginPath(); ctx.moveTo(headC[0], headC[1] - u * 0.5); ctx.quadraticCurveTo(headC[0] - u * 1.0, headC[1], headC[0] - u * 0.7, headC[1] + u * 1.2); ctx.lineTo(headC[0] - u * 0.2, headC[1] + u * 0.6); ctx.closePath(); ctx.fill(); }
  if (hat === 'brim') { ctx.save(); ctx.translate(headC[0], headC[1]); ctx.rotate(P.lean + P.head * 0.75); ctx.beginPath(); ctx.ellipse(0, -u * 0.28, u * 0.45, u * 0.36, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-u * 0.75, -u * 0.32, u * 1.5, u * 0.1); ctx.restore(); }
  limb(sh, P.uArmL + P.lean, armU, P.lArmL, armL, u * 0.36, u * 0.3, u * 0.2);
  // hand position returned in world coords (for kite strings etc.)
  const dA = dirv(P.uArmL + P.lean), dB = dirv(P.uArmL + P.lean + P.lArmL);
  const hand = [sh[0] + dA[0] * armU + dB[0] * armL, sh[1] + dA[1] * armU + dB[1] * armL];
  ctx.restore();
  const fA = Math.PI / 2 - P.head - P.lean * 0.5;
  const ex = headC[0] + Math.sin(fA + 0.5) * u * 0.32, ey = headC[1] + Math.cos(fA + 0.5) * u * 0.32;
  return {
    hand: [x + hand[0] * facing, y + hand[1]],
    head: [x + headC[0] * facing, y + headC[1]],
    eye: [x + ex * facing, y + ey],
    gaze: [Math.sin(fA + 0.12) * facing, Math.cos(fA + 0.12)],
  };
}

function taper(ctx, a, b, w0, w1) {
  const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  ctx.beginPath();
  ctx.moveTo(a[0] + nx * w0 / 2, a[1] + ny * w0 / 2);
  ctx.lineTo(b[0] + nx * w1 / 2, b[1] + ny * w1 / 2);
  ctx.arc(b[0], b[1], w1 / 2, Math.atan2(ny, nx), Math.atan2(ny, nx) + Math.PI, true);
  ctx.lineTo(a[0] - nx * w0 / 2, a[1] - ny * w0 / 2);
  ctx.arc(a[0], a[1], w0 / 2, Math.atan2(-ny, -nx), Math.atan2(-ny, -nx) + Math.PI, true);
  ctx.closePath();
  ctx.fill();
}

// ---------------------------------------------------------------------------
// Bird silhouette with flapping wings. phase in radians. Returns nothing; draws.
export function drawBird(ctx, x, y, s, phase, { color = '#000', alpha = 1, glide = 0 } = {}) {
  const f = Math.sin(phase) * (1 - glide);
  const up = f * 0.9;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.globalAlpha *= alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  // body
  ctx.ellipse(0, 0, 9, 2.6, 0, 0, Math.PI * 2);
  ctx.fill();
  // wings (two-segment, curved)
  for (const side of [-1, 1]) {
    ctx.beginPath();
    const ex = 4 * side, ey = -up * 10 - 2;
    const tx = 20 * side * (0.75 + 0.25 * Math.cos(phase)), ty = -up * 18 + (1 - Math.abs(f)) * 2 + 3;
    ctx.moveTo(-3 * side * 0, -1);
    ctx.quadraticCurveTo(ex + 2 * side, ey, tx, ty);
    ctx.quadraticCurveTo(ex + 3 * side, ey + 6, 3 * side, 1.5);
    ctx.closePath();
    ctx.fill();
  }
  // tail
  ctx.beginPath(); ctx.moveTo(-8, 0); ctx.lineTo(-14, -2.5); ctx.lineTo(-13, 2.5); ctx.closePath(); ctx.fill();
  ctx.restore();
}

// Side-view bird (for codex studies / prologue close-ups): wing angle controls the stroke.
export function birdSide(phase) {
  const a = Math.sin(phase);
  const wy = -a * 60;
  return [
    // body
    `M -70 0 C -50 -16 10 -20 40 -10 C 56 -6 66 -2 74 2 C 64 4 52 6 40 6 C 10 14 -40 14 -70 0 Z`,
    // head/beak
    `M 40 -10 C 52 -22 70 -20 76 -10 L 92 -6 L 74 -2`,
    // wing
    `M -10 -8 C 0 ${wy * 0.4 - 10} 20 ${wy * 0.8 - 14} 10 ${wy - 18} C -20 ${wy - 6} -40 ${wy * 0.6} -46 ${wy * 0.3 - 4} C -30 -6 -20 -6 -10 -8`,
    // tail
    `M -66 -2 L -110 -14 L -104 4 L -68 6`,
  ].join(' ');
}
