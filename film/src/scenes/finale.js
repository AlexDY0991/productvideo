// FINALE — every era's outline, line drawing and wing converges, comes apart and recombines into CoolFly:
// Urban (standing flight) rising over a city, Dream (seated flight) skimming open water; freeze; the wordmark.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU, noise2, rgba } from '../core.js';
import { grain, vignette, text, glow, fillRect, makeCanvas, strokePolys, fillPolys, puff } from '../gfx.js';
import { THREE, SS, initStage, getRenderer, render3D, renderOutline, camera, look, roomEnv, gradientEnv, shadowLight, toScreen, mat } from '../three/stage.js';
import { wrightFlyer, biplane, dc3, x1, concorde, vs300, saturnV, quadcopter, evtol } from '../three/models.js';
import { loadUrban, urban, setUrbanTime, loadDream, dreamGLB, setDreamTime, drawLogo, ORANGE } from '../three/coolfly.js';
import { drawMagpie, swallowKite } from './myth.js';
import { drawOrnithopter, drawScrew } from './codex.js';
import { drawBalloon } from './lighter.js';
import { LOGO } from '../logo-data.js';

const FOCUS = [W / 2, H * 0.3];
// local time marks
const T_BREAK = 5.8, T_FORM = 11.0, T_SOLID = 12.2, T_CITY = 14.5, T_WATER = 22.5, T_FREEZE = 30.0, T_LOGO = 33.0;

let sprites = [], particles = null, targets = null;
let studio, camS, urbanS, dreamS, studioFloor;
let city, camC, urbanC;
let water, camW, dreamW;
let freezeA = null, freezeB = null;

// ---------------------------------------------------------------------------
// Sprite builders: each era's machine as a light line drawing on transparency
function crop(c) {
  const x = c.getContext('2d');
  const d = x.getImageData(0, 0, c.width, c.height).data;
  let x0 = c.width, y0 = c.height, x1 = 0, y1 = 0;
  for (let y = 0; y < c.height; y += 2) for (let xx = 0; xx < c.width; xx += 2) if (d[(y * c.width + xx) * 4 + 3] > 20) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
  const w = Math.max(4, x1 - x0 + 8), h = Math.max(4, y1 - y0 + 8);
  const o = makeCanvas(w, h);
  o.ctx.drawImage(c, x0 - 4, y0 - 4, w, h, 0, 0, w, h);
  return o.c;
}
function recolor(c, col) {
  const x = c.getContext('2d');
  x.globalCompositeOperation = 'source-in'; x.fillStyle = col; x.fillRect(0, 0, c.width, c.height);
  x.globalCompositeOperation = 'source-over';
  return c;
}
function sprite2D(draw, col, outline = false) {
  const { c, ctx } = makeCanvas(W, H);
  draw(ctx);
  let out = crop(c);
  if (outline) {
    // filled artwork → contour lines (dilate minus original)
    const o = makeCanvas(out.width + 8, out.height + 8);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; o.ctx.drawImage(out, 4 + Math.cos(a) * 2.2, 4 + Math.sin(a) * 2.2); }
    o.ctx.globalCompositeOperation = 'destination-out'; o.ctx.drawImage(out, 4, 4);
    out = o.c;
  }
  return recolor(out, col);
}
function sprite3D(model, dir, col, fov = 30) {
  const sc = new THREE.Scene();
  sc.add(model);
  const box = new THREE.Box3().setFromObject(model), cen = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3());
  const cam = camera(fov);
  const R = Math.max(size.x, size.y, size.z) * 1.7, L = Math.hypot(...dir);
  look(cam, [cen.x + dir[0] / L * R, cen.y + dir[1] / L * R, cen.z + dir[2] / L * R], [cen.x, cen.y, cen.z]);
  const { c, ctx } = makeCanvas(W, H);
  renderOutline(ctx, sc, cam, { color: col, width: 2.2 });
  // interior crease lines for detail
  const lm = new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.55 });
  const depth = new THREE.MeshBasicMaterial({ colorWrite: false });
  model.traverse((o) => { if (o.isMesh) { o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 30), lm)); o.material = depth; } });
  render3D(ctx, sc, cam);
  return crop(c);
}

// Sample N points from a canvas' opaque pixels, relative to its centre
function samplePoints(c, n, seed) {
  const x = c.getContext('2d');
  const d = x.getImageData(0, 0, c.width, c.height).data;
  const cand = [];
  for (let y = 0; y < c.height; y += 1) for (let xx = 0; xx < c.width; xx += 1) if (d[(y * c.width + xx) * 4 + 3] > 90) cand.push([xx - c.width / 2, y - c.height / 2]);
  const R = rng(seed), out = [];
  for (let i = 0; i < n && cand.length; i++) out.push(cand[Math.floor(R() * cand.length)]);
  return out;
}

const GALLERY = [
  { label: 'c. 400 BC', col: '#efe4cf' }, { label: 'c. 400 BC', col: '#f2d7b2' }, { label: '1505', col: '#e2bd8a' }, { label: '1505', col: '#e2bd8a' },
  { label: '1783', col: '#d8b48c' }, { label: '1903', col: '#e6e6e6' }, { label: '1917', col: '#cfc8a2' }, { label: '1936', col: '#ecc46e' },
  { label: '1947', col: '#a9d6ff' }, { label: '1969', col: '#a9d6ff' }, { label: '1939', col: '#ffc98a' }, { label: '1969', col: '#d4e4ff' },
  { label: '2015', col: '#7fe8ff' }, { label: '2024', col: '#7fe8ff' },
];

function galleryPos(i, n, t) {
  const a = (i / n) * TAU + t * 0.06 - 0.6;
  const depth = (Math.sin(a) + 1) / 2;                 // 0 back … 1 front
  return { x: W / 2 + Math.cos(a) * W * 0.36, y: H * 0.47 + Math.sin(a) * H * 0.23, s: 0.5 + depth * 0.45, depth };
}

// ---------------------------------------------------------------------------
function cityBackdrop(ctx, rise, t) {
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#0a1430'); g.addColorStop(0.45, '#26386a'); g.addColorStop(0.72, '#7a5a78'); g.addColorStop(0.86, '#e48a5a'); g.addColorStop(1, '#ffb577');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  glow(ctx, W * 0.78, H * 0.86 + rise * 160, 700, '#ffb36b', 0.35);
  const R = rng(5);
  // skyline layers sink as we rise
  for (const [layer, col, par, hMul] of [[0, '#2a3256', 0.35, 0.6], [1, '#161c38', 0.6, 0.85], [2, '#0b0f22', 1.0, 1.1]]) {
    const base = H * (0.78 + layer * 0.07) + rise * 520 * par;
    let x = -40;
    while (x < W + 40) {
      const w = 40 + R() * 110, h = (80 + R() * 300) * hMul;
      ctx.fillStyle = col; ctx.fillRect(x, base - h, w, h + 900);
      if (R() < 0.25) { ctx.fillRect(x + w / 2 - 2, base - h - 50, 4, 50); if (Math.floor(t * 1.5 + x) % 2 === 0) glow(ctx, x + w / 2, base - h - 50, 10, '#ff5040', 0.8); }
      for (let wy = base - h + 12; wy < Math.min(H + 20, base + 300); wy += 14) for (let wx = x + 5; wx < x + w - 5; wx += 10) if (R() < 0.3) { ctx.fillStyle = R() < 0.85 ? `rgba(255,${200 + R() * 40 | 0},140,${0.35 + layer * 0.2})` : 'rgba(160,210,255,0.5)'; ctx.fillRect(wx, wy, 4, 6); }
      x += w + 3;
    }
  }
}

function waterBackdrop(ctx, t, horizon) {
  const g = ctx.createLinearGradient(0, 0, 0, horizon);
  g.addColorStop(0, '#2b3f66'); g.addColorStop(0.55, '#c9876a'); g.addColorStop(0.9, '#ffc98a'); g.addColorStop(1, '#ffe2b0');
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, horizon + 2);
  const sunX = W * 0.72, sunY = horizon - 70;
  glow(ctx, sunX, sunY, 900, '#ffb066', 0.45); glow(ctx, sunX, sunY, 180, '#fff0cc', 0.8);
  ctx.fillStyle = '#fff4dc'; ctx.beginPath(); ctx.arc(sunX, sunY, 46, 0, TAU); ctx.fill();
  // distant shore hills
  ctx.fillStyle = '#5a4058';
  ctx.beginPath(); ctx.moveTo(0, horizon); for (let x = 0; x <= W; x += 20) ctx.lineTo(x, horizon - 26 - Math.max(0, Math.sin(x / 260)) * 40 - noise2(x * 0.01, 2) * 14); ctx.lineTo(W, horizon); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#3c2c44';
  ctx.beginPath(); ctx.moveTo(0, horizon); for (let x = 0; x <= W * 0.45; x += 20) ctx.lineTo(x, horizon - 10 - Math.max(0, Math.sin(x / 140 + 1)) * 22); ctx.lineTo(W * 0.45, horizon); ctx.closePath(); ctx.fill();
  // water
  const wg = ctx.createLinearGradient(0, horizon, 0, H);
  wg.addColorStop(0, '#e6a777'); wg.addColorStop(0.25, '#8a6a78'); wg.addColorStop(1, '#1d2440');
  ctx.fillStyle = wg; ctx.fillRect(0, horizon, W, H - horizon);
  // sun glitter path + wave lines
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  const R = rng(Math.floor(t * 12));
  for (let i = 0; i < 260; i++) {
    const k = Math.pow(R(), 1.6), y = horizon + 2 + k * (H - horizon), spread = 40 + k * 520;
    const x = sunX + (R() - 0.5) * spread * 2;
    ctx.fillStyle = `rgba(255,${220 + R() * 30 | 0},170,${(1 - k) * 0.55 * R()})`;
    ctx.fillRect(x, y, 6 + k * 40, 1 + k * 2);
  }
  ctx.restore();
  ctx.strokeStyle = 'rgba(255,220,190,0.08)'; ctx.lineWidth = 1;
  for (let i = 0; i < 40; i++) { const k = i / 40, y = horizon + Math.pow(k, 1.8) * (H - horizon); ctx.beginPath(); for (let x = 0; x <= W; x += 30) ctx.lineTo(x, y + Math.sin(x * 0.01 * (1 + k) + t * 1.5 + i) * (1 + k * 4)); ctx.stroke(); }
}

function productCaption(ctx, name, zh, en, a) {
  if (a <= 0) return;
  const x = 120, y = H - 230;
  ctx.save(); ctx.globalAlpha = a;
  ctx.fillStyle = ORANGE; ctx.fillRect(x, y - 70, 48 * sseg(a, 0, 1), 3);
  text(ctx, name, x - 4, y, { font: 'Inter', size: 76, weight: 300, color: '#ffffff', align: 'left', spacing: 26, shadow: 20, shadowColor: 'rgba(0,0,0,0.35)' });
  text(ctx, zh, x, y + 50, { font: 'Noto Sans SC', size: 26, weight: 500, color: '#ffffff', align: 'left', spacing: 8, alpha: 0.92 });
  text(ctx, en, x, y + 86, { font: 'Inter', size: 17, weight: 500, color: '#ffffff', align: 'left', spacing: 6, alpha: 0.7 });
  ctx.restore();
}

// ---------------------------------------------------------------------------
export default {
  transIn: { dur: 0.8, type: 'white' },
  caption: 'rgba(255,255,255,0.9)',
  async init({ base }) {
    initStage();
    const [ug, dg] = await Promise.all([loadUrban(base), loadDream(base)]);
    // ---- gallery sprites (every era's machine as a line drawing)
    const S = [];
    S.push(sprite2D((c) => drawMagpie(c, W / 2, H / 2, 1.6, 0.4, 1, 0), GALLERY[0].col));
    S.push(sprite2D((c) => swallowKite(c, W / 2, H / 2, 1.1, 0), GALLERY[1].col, true));
    S.push(sprite2D((c) => drawOrnithopter(c, W / 2, H / 2, 0.7, 1, 0.3), GALLERY[2].col));
    S.push(sprite2D((c) => drawScrew(c, W / 2, H / 2 + 150, 0.9, 1, 0.4), GALLERY[3].col));
    S.push(sprite2D((c) => drawBalloon(c, W / 2, H / 2 + 60, 0.9, 1, 0), GALLERY[4].col, true));
    S.push(sprite3D(wrightFlyer(), [0.6, 0.35, 1], GALLERY[5].col));
    S.push(sprite3D(biplane(), [0.8, 0.3, 1], GALLERY[6].col));
    S.push(sprite3D(dc3(), [0.7, 0.3, 1], GALLERY[7].col));
    S.push(sprite3D(x1(), [0.5, 0.25, 1], GALLERY[8].col));
    S.push(sprite3D(concorde(), [0.5, 0.35, 1], GALLERY[9].col));
    S.push(sprite3D(vs300(), [0.6, 0.25, 1], GALLERY[10].col));
    S.push(sprite3D(saturnV(), [1, 0.1, 0.4], GALLERY[11].col, 22));
    S.push(sprite3D(quadcopter(), [0.8, 0.5, 1], GALLERY[12].col));
    S.push(sprite3D(evtol(), [0.7, 0.4, 1], GALLERY[13].col));
    const maxDim = 330;
    sprites = S.map((c, i) => ({ c, k: maxDim / Math.max(c.width, c.height), label: GALLERY[i].label, col: GALLERY[i].col, pts: null }));

    // ---- studio: both machines side by side (particle targets come from this view)
    studio = new THREE.Scene();
    studio.environment = gradientEnv('studio', '#1a2234', '#5a6478', '#0a0b0e');
    studio.add(new THREE.HemisphereLight(0xdfe8ff, 0x101012, 0.6));
    const key = new THREE.DirectionalLight(0xfff2e0, 3.2); key.position.set(-6, 10, -8); studio.add(key);   // 2D contact shadows instead of a shadow pass
    const rim = new THREE.DirectionalLight(0x9fc0ff, 2.2); rim.position.set(6, 5, 9); studio.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(30, 64), mat.std(0x0b0c0f, 0.35, 0.2, { envMapIntensity: 0.4 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; studio.add(floor);
    studioFloor = floor;
    studioFloor = floor;
    studio.fog = new THREE.Fog(0x0e121b, 9, 21);
    // camera looks toward +Z, so screen-left is +X: Urban left, Dream right
    urbanS = urban(ug, { rider: true }); urbanS.position.set(2.9, 0, 0.6); urbanS.rotation.y = -0.5;
    dreamS = dreamGLB(dg, { pilot: true }); dreamS.position.set(-2.5, 0, 1.2); dreamS.rotation.y = 0.85;
    studio.add(urbanS, dreamS);
    camS = camera(30);
    look(camS, [0.0, 2.3, -12.0], [0, 1.05, 0.4]);
    setUrbanTime(urbanS, 0.3); setDreamTime(dreamS, 0.3);
    // target point cloud from the studio outlines
    {
      const { c, ctx } = makeCanvas(W, H);
      studioFloor.visible = false;
      renderOutline(ctx, studio, camS, { color: '#ffffff', width: 1.6 });
      studioFloor.visible = true;
      const R = rng(808), d = ctx.getImageData(0, 0, W, H).data, cand = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 120) cand.push([x, y]);
      targets = cand;
      // particles: sampled from each sprite, each assigned a random target pixel
      const per = 520, list = [];
      sprites.forEach((sp, si) => {
        sp.pts = samplePoints(sp.c, per, 100 + si);
        sp.pts.forEach((p, k) => {
          const tg = cand[Math.floor(R() * cand.length)];
          list.push({ si, ox: p[0], oy: p[1], tx: tg[0], ty: tg[1], delay: R() * 1.6 + (si / sprites.length) * 1.2, dur: 2.4 + R() * 1.4, swirl: (R() - 0.5) * 2, len: 2 + R() * 6, ang: R() * TAU });
        });
      });
      particles = list;
    }
    // ---- city scene for Urban
    city = new THREE.Scene();
    city.environment = gradientEnv('dusk', '#1b2a52', '#e48a5a', '#0b0f22', [0.75, 0.48], '#ffd2a0');
    city.add(new THREE.HemisphereLight(0x8aa0d8, 0x1a1420, 0.7));
    const sunC = new THREE.DirectionalLight(0xffb27a, 3.0); sunC.position.set(14, 4, 12); city.add(sunC);
    const fillC = new THREE.DirectionalLight(0x6f8ad8, 1.0); fillC.position.set(-10, 6, -10); city.add(fillC);
    urbanC = urban(ug, { rider: true });
    city.add(urbanC);
    camC = camera(32);
    // ---- water scene for Dream
    water = new THREE.Scene();
    water.environment = gradientEnv('gold', '#2b3f66', '#ffc98a', '#3a3040', [0.72, 0.47], '#fff2d8');
    water.add(new THREE.HemisphereLight(0xffd8b0, 0x2a2438, 0.8));
    const sunW = new THREE.DirectionalLight(0xffc890, 3.2); sunW.position.set(-20, 6, 30); water.add(sunW);
    const fillW = new THREE.DirectionalLight(0x8090c0, 0.8); fillW.position.set(10, 8, -10); water.add(fillW);
    dreamW = dreamGLB(dg, { pilot: true });
    water.add(dreamW);
    camW = camera(30);
  },

  draw(ctx, t, dur) {
    if (t < T_CITY + 0.6) this.drawConverge(ctx, t);
    if (t >= T_CITY - 0.2 && t < T_WATER + 0.6) { const a = sseg(t, T_CITY - 0.2, T_CITY + 0.5); this.withAlpha(ctx, a, (c) => this.drawCity(c, t)); }
    if (t >= T_WATER && t < T_FREEZE + 0.4) { const a = sseg(t, T_WATER, T_WATER + 0.6); this.withAlpha(ctx, a, (c) => this.drawWater(c, t)); }
    if (t >= T_FREEZE) this.drawFreeze(ctx, t, dur);
    grain(ctx, t < T_FREEZE ? t : T_FREEZE, 0.045);
  },

  withAlpha(ctx, a, fn) {
    if (a >= 0.999) { fn(ctx); return; }
    const { c, ctx: b } = this._buf || (this._buf = makeCanvas(W, H));
    b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.globalCompositeOperation = 'source-over'; b.clearRect(0, 0, W, H);
    fn(b);
    ctx.save(); ctx.globalAlpha = a; ctx.drawImage(c, 0, 0); ctx.restore();
  },

  // ---- convergence + studio reveal
  drawConverge(ctx, t) {
    const g = ctx.createRadialGradient(W / 2, H * 0.46, 0, W / 2, H * 0.5, 1300);
    g.addColorStop(0, '#0e121b'); g.addColorStop(0.45, '#0b0e15'); g.addColorStop(1, '#030407');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // the meeting point carried over from the previous chapter
    glow(ctx, FOCUS[0], FOCUS[1], 260 * (1 - sseg(t, 0, 2)), '#ffe2b8', 0.8 * (1 - sseg(t, 0, 1.6)));
    const n = sprites.length;
    const emerge = ease.outCubic(seg(t, 0.1, 2.4));
    const breakK = sseg(t, T_BREAK, T_BREAK + 0.9);
    // sprites (fade out as their particles take over)
    const order = sprites.map((sp, i) => ({ sp, i, p: galleryPos(i, n, t) })).sort((a, b) => a.p.depth - b.p.depth);
    for (const { sp, i, p } of order) {
      const x = lerp(FOCUS[0], p.x, emerge), y = lerp(FOCUS[1], p.y, emerge), s = sp.k * p.s * lerp(0.2, 1, emerge);
      const a = emerge * (0.45 + p.depth * 0.55) * (1 - breakK);
      if (a <= 0.01) continue;
      ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
      ctx.drawImage(sp.c, x - sp.c.width * s / 2, y - sp.c.height * s / 2, sp.c.width * s, sp.c.height * s);
      ctx.restore();
      text(ctx, sp.label, x, y + sp.c.height * s / 2 + 26, { font: 'JetBrains Mono', size: 15, color: sp.col, spacing: 3, alpha: a * 0.8 * sseg(t, 1.8, 2.8) });
    }
    // particles
    if (t > T_BREAK) {
      const solid = sseg(t, T_FORM + 0.3, T_SOLID + 0.6);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (const q of particles) {
        const sp = sprites[q.si], p = galleryPos(q.si, n, Math.min(t, T_BREAK + 0.8));
        const s = sp.k * p.s;
        const sx = p.x + q.ox * s, sy = p.y + q.oy * s;
        const k = clamp((t - T_BREAK - q.delay) / q.dur);
        const e = ease.inOutCubic(k);
        // swirl through a control point offset perpendicular to the path, with a slow curl
        const mx = (sx + q.tx) / 2, my = (sy + q.ty) / 2;
        const dx = q.tx - sx, dy = q.ty - sy, L = Math.hypot(dx, dy) || 1;
        const cx = mx - dy / L * q.swirl * 260 + noise2(q.ox * 0.01, t * 0.3) * 60, cy = my + dx / L * q.swirl * 260 + noise2(q.oy * 0.01, t * 0.3 + 5) * 60;
        const x = (1 - e) * (1 - e) * sx + 2 * (1 - e) * e * cx + e * e * q.tx;
        const y = (1 - e) * (1 - e) * sy + 2 * (1 - e) * e * cy + e * e * q.ty;
        // colour: era colour → warm white → (on arrival) brand white
        const a = (0.55 + 0.45 * Math.sin(Math.PI * k)) * (1 - solid);
        if (a <= 0.01) continue;
        const ang = q.ang + e * 4 * q.swirl;
        const len = q.len * (1 + Math.sin(Math.PI * k) * 2.5) * (1 - e * 0.6);
        ctx.strokeStyle = k < 0.98 ? sp.col : '#fff3e6';
        ctx.globalAlpha = a;
        ctx.lineWidth = 1.4;
        ctx.beginPath(); ctx.moveTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len); ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len); ctx.stroke();
      }
      ctx.restore();
    }
    // outline → solid reveal of the two machines in the studio
    if (t > T_FORM) {
      const ol = sseg(t, T_FORM, T_FORM + 0.8) * (1 - sseg(t, T_SOLID + 0.6, T_SOLID + 1.6));
      const so = sseg(t, T_SOLID, T_SOLID + 1.4);
      const orbit = (t - T_FORM) * 0.03;
      look(camS, [Math.sin(orbit) * 12.0, 2.3 - (t - T_FORM) * 0.04, -Math.cos(orbit) * 12.0], [0, 1.05, 0.4]);
      setUrbanTime(urbanS, 0.3 + (t - T_FORM) * 0.4); setDreamTime(dreamS, 0.3 + (t - T_FORM) * 0.2);
      if (so > 0) {
        // soft studio floor: light pool + contact shadows under each machine
        for (const [p, r] of [[urbanS.position, 260], [dreamS.position, 360]]) {
          const f = toScreen(p, camS);
          ctx.save(); ctx.globalAlpha = so;
          const g2 = ctx.createRadialGradient(f[0], f[1], 0, f[0], f[1], r * 2.2); g2.addColorStop(0, 'rgba(120,140,170,0.20)'); g2.addColorStop(1, 'rgba(120,140,170,0)');
          ctx.fillStyle = g2; ctx.beginPath(); ctx.ellipse(f[0], f[1], r * 2.2, r * 0.5, 0, 0, TAU); ctx.fill();
          const g3 = ctx.createRadialGradient(f[0], f[1], 0, f[0], f[1], r); g3.addColorStop(0, 'rgba(0,0,0,0.6)'); g3.addColorStop(1, 'rgba(0,0,0,0)');
          ctx.fillStyle = g3; ctx.beginPath(); ctx.ellipse(f[0], f[1], r, r * 0.16, 0, 0, TAU); ctx.fill();
          ctx.restore();
        }
        render3D(ctx, studio, camS, { alpha: so, exposure: 1.15 });
      }
      if (ol > 0) { studioFloor.visible = false; renderOutline(ctx, studio, camS, { color: '#fff3e6', width: 1.6, alpha: ol }); studioFloor.visible = true; }
      const la = sseg(t, T_SOLID + 0.8, T_SOLID + 1.6) * (1 - sseg(t, T_CITY - 0.5, T_CITY));
      const up = toScreen(new THREE.Vector3(2.9, 0, 0.6), camS), dp = toScreen(new THREE.Vector3(-2.5, 0, 1.2), camS);
      text(ctx, 'URBAN', up[0], up[1] + 90, { font: 'Inter', size: 34, weight: 300, color: '#ffffff', spacing: 16, alpha: la });
      text(ctx, '站立飞行 · STANDING FLIGHT', up[0], up[1] + 128, { font: 'Noto Sans SC', size: 17, weight: 300, color: '#d8dde6', spacing: 4, alpha: la * 0.85 });
      text(ctx, 'DREAM', dp[0], dp[1] + 90, { font: 'Inter', size: 34, weight: 300, color: '#ffffff', spacing: 16, alpha: la });
      text(ctx, '坐姿飞行 · SEATED FLIGHT', dp[0], dp[1] + 128, { font: 'Noto Sans SC', size: 17, weight: 300, color: '#d8dde6', spacing: 4, alpha: la * 0.85 });
    }
    vignette(ctx, 0.55);
  },

  // ---- Urban rises over the city at dusk
  drawCity(ctx, t, shift = null) {
    const lt = t - T_CITY;
    const rise = ease.inOutSine(clamp(lt / 7.5));
    const y = rise * 9.5;
    cityBackdrop(ctx, rise, t);
    urbanC.position.set(lt * 0.25, y, -lt * 0.35);
    urbanC.rotation.set(Math.sin(lt * 0.9) * 0.015, 0.5 + lt * 0.05, Math.sin(lt * 0.7) * 0.02 - rise * 0.03);
    setUrbanTime(urbanC, lt * 2.2);
    const c = urbanC.position;
    look(camC, [c.x - 6.6 + lt * 0.12, c.y + 0.5 - (1 - rise) * 0.7, c.z - 4.2], [c.x, c.y + 0.95, c.z]);
    if (shift) camC.setViewOffset(W, H, shift[0], shift[1], W, H); else camC.clearViewOffset();
    // rooftop deck (sinks away as Urban climbs)
    const deck = toScreen(new THREE.Vector3(0, 0, 0), camC);
    ctx.save();
    ctx.fillStyle = '#07080f';
    ctx.beginPath(); ctx.moveTo(0, deck[1] + 40); ctx.lineTo(W, deck[1] - 30); ctx.lineTo(W, H + 900); ctx.lineTo(0, H + 900); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = 'rgba(255,180,120,0.25)'; ctx.lineWidth = 2;
    for (let i = 0; i < 14; i++) { const x = i * 150; ctx.beginPath(); ctx.moveTo(x, deck[1] + 40 - x * 0.036); ctx.lineTo(x, deck[1] + 40 - x * 0.036 - 60); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(0, deck[1] - 20); ctx.lineTo(W, deck[1] - 90); ctx.stroke();
    ctx.restore();
    // underglow from the ducted fans
    const ug = toScreen(new THREE.Vector3(c.x, c.y + 0.25, c.z), camC);
    glow(ctx, ug[0], ug[1] + 30, 360, '#ff7a2a', 0.22);
    render3D(ctx, city, camC, { exposure: 1.2 });
    glow(ctx, ug[0], ug[1] + 10, 120, '#ffb070', 0.18);
    camC.clearViewOffset();
    if (!shift) productCaption(ctx, 'URBAN', '站立飞行', 'STANDING FLIGHT · OVER THE CITY', env(t, T_CITY + 1.2, T_WATER, 0.8, 0.6));
    vignette(ctx, 0.45, '#05060c');
  },

  // ---- Dream skims open water at golden hour
  drawWater(ctx, t, shift = null) {
    const lt = t - T_WATER;
    const horizon = H * 0.5;
    waterBackdrop(ctx, t, horizon);
    const x = lerp(-15, 14, ease.inOutSine(clamp(lt / 8.5)));
    dreamW.position.set(x, 1.5 + Math.sin(lt * 1.4) * 0.08, 0);
    dreamW.rotation.set(-0.02, Math.PI / 2 + 0.12, -0.06 + Math.sin(lt * 0.8) * 0.02);  // nose (-Z) → +X: flying left → right
    setDreamTime(dreamW, lt * 3.0, { blur: 0.16 });
    look(camW, [x - 2.5, 1.05, 12.5], [x + 0.6, 1.25, 0]);
    if (shift) camW.setViewOffset(W, H, shift[0], shift[1], W, H); else camW.clearViewOffset();
    // reflection: flipped copy of the 3D layer about the water point beneath the craft, with ripples
    render3D(ctx, water, camW, { alpha: 0 });                 // render once, then read back a single time
    const glb = this._gl || (this._gl = makeCanvas(W, H));
    glb.ctx.setTransform(1, 0, 0, 1, 0, 0); glb.ctx.clearRect(0, 0, W, H); glb.ctx.imageSmoothingQuality = 'high';
    glb.ctx.drawImage(getRenderer().domElement, 0, 0, W, H);
    const gl = glb.c;
    const wp = toScreen(new THREE.Vector3(x, 0, 0), camW);
    const yw = wp[1];
    // spray & ripples on the water under the rotors
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 5; i++) { const k = ((lt * 0.8 + i / 5) % 1); ctx.strokeStyle = `rgba(255,236,210,${(1 - k) * 0.25})`; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(wp[0] - k * 120, yw, 120 + k * 420, (120 + k * 420) * 0.08, 0, 0, TAU); ctx.stroke(); }
    ctx.restore();
    ctx.save();
    ctx.beginPath(); ctx.rect(0, yw, W, H - yw); ctx.clip();
    for (let sy = 0; sy < 420; sy += 4) {
      const off = Math.sin(sy * 0.09 + t * 5) * (2 + sy * 0.04) + Math.sin(sy * 0.023 - t * 2) * 4;
      ctx.globalAlpha = 0.38 * (1 - sy / 420);
      ctx.drawImage(gl, 0, yw - sy - 4, W, 4, off, yw + sy, W, 4);
    }
    ctx.restore();
    const R = rng(Math.floor(t * 20));
    for (let i = 0; i < 26; i++) { const s = 60 + R() * 160; ctx.save(); ctx.globalAlpha = 0.16 * R(); ctx.drawImage(puff(250), wp[0] - 380 + R() * 620 - s / 2, yw - s * 0.45 - R() * 30, s, s * 0.6); ctx.restore(); }
    ctx.drawImage(gl, 0, 0, W, H);
    camW.clearViewOffset();
    if (!shift) productCaption(ctx, 'DREAM', '坐姿飞行', 'SEATED FLIGHT · ACROSS OPEN WATER', env(t, T_WATER + 1.2, T_FREEZE + 0.2, 0.8, 0.4));
    vignette(ctx, 0.45, '#0b0710');
  },

  // ---- freeze: diagonal diptych, then the wordmark
  drawFreeze(ctx, t, dur) {
    if (!freezeA) {
      const a = makeCanvas(W, H), b = makeCanvas(W, H);
      // re-frame each moment so the machine sits inside its own half of the diagonal
      this.drawCity(a.ctx, T_WATER - 1.2, [W * 0.2, H * 0.1]);
      this.drawWater(b.ctx, T_FREEZE - 1.6, [-W * 0.22, -H * 0.2]);
      freezeA = a.c; freezeB = b.c;
    }
    const lt = t - T_FREEZE;
    const split = ease.inOutCubic(clamp(lt / 1.2));
    // divider runs bottom-left → top-right (the direction of every gaze in the film)
    const d0 = [W * 0.5 - 760, H + 40], d1 = [W * 0.5 + 760, -40];
    const off = (1 - split) * 1400;
    ctx.save();
    ctx.drawImage(freezeB, 0, 0);
    ctx.beginPath();
    ctx.moveTo(-10, -10); ctx.lineTo(d1[0] + off, d1[1]); ctx.lineTo(d0[0] + off, d0[1]); ctx.lineTo(-10, H + 10); ctx.closePath();
    ctx.clip();
    ctx.drawImage(freezeA, -60 * split, -20 * split, W + 60 * split, H + 20 * split);
    ctx.restore();
    // luminous divider
    ctx.save(); ctx.globalCompositeOperation = 'lighter';
    ctx.strokeStyle = 'rgba(255,240,220,0.9)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(d0[0] + off, d0[1]); ctx.lineTo(d1[0] + off, d1[1]); ctx.stroke();
    ctx.strokeStyle = 'rgba(255,200,150,0.15)'; ctx.lineWidth = 14;
    ctx.beginPath(); ctx.moveTo(d0[0] + off, d0[1]); ctx.lineTo(d1[0] + off, d1[1]); ctx.stroke();
    ctx.restore();
    // freeze-frame flash
    fillRect(ctx, '#ffffff', Math.max(0, 1 - lt * 3) * 0.5);
    // darken for the wordmark
    const dim = sseg(t, T_LOGO - 0.6, T_LOGO + 1.2);
    fillRect(ctx, '#05060a', dim * 0.72);
    // wordmark: traced, then filled (white on dark, orange F)
    const lw = 880, lx = W / 2 - lw / 2, ly = H * 0.42 - lw * LOGO.aspect / 2;
    const tp = sseg(t, T_LOGO, T_LOGO + 1.6), fp = sseg(t, T_LOGO + 1.2, T_LOGO + 2.2);
    if (tp > 0) {
      const toPolys = (key) => LOGO[key].map((p) => { const q = p.map(([x, y]) => [lx + x * lw, ly + y * lw]); q.push(q[0]); q.closed = true; return q; });
      ctx.save(); ctx.globalAlpha = 1 - fp * 0.9;
      strokePolys(ctx, toPolys('dark'), { progress: tp, width: 2, color: '#ffffff', sequential: false });
      strokePolys(ctx, toPolys('orange'), { progress: tp, width: 2, color: ORANGE, sequential: false });
      ctx.restore();
      if (fp > 0) drawLogo(ctx, lx, ly, lw, { dark: '#ffffff', orange: ORANGE, alpha: fp });
      // glint sweep
      const gx = lerp(lx - 200, lx + lw + 200, sseg(t, T_LOGO + 2.2, T_LOGO + 3.4));
      if (fp >= 1 && t < T_LOGO + 3.5) {
        ctx.save(); ctx.globalCompositeOperation = 'lighter';
        const g = ctx.createLinearGradient(gx - 120, 0, gx + 120, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,255,255,0.35)'); g.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.fillStyle = g; ctx.fillRect(lx - 10, ly - 10, lw + 20, lw * LOGO.aspect + 20);
        ctx.restore();
      }
      const sa = sseg(t, T_LOGO + 2.4, T_LOGO + 3.4);
      ctx.save(); ctx.globalAlpha = sa * 0.6; ctx.fillStyle = '#ffffff'; ctx.fillRect(W / 2 - 60 * sa, ly + lw * LOGO.aspect + 56, 120 * sa, 1); ctx.restore();
      text(ctx, 'URBAN   ·   DREAM', W / 2, ly + lw * LOGO.aspect + 106, { font: 'Inter', size: 22, weight: 300, color: '#ffffff', spacing: 12, alpha: sa * 0.9 });
    }
    fillRect(ctx, '#000', sseg(t, dur - 2.2, dur - 0.2));
  },
};
