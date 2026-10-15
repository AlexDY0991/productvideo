// CHAPTER X — DIGITAL WINGS. Carbon fibre, brushless motors, flight controllers; a drone that corrects itself
// a thousand times a second; a city laced with flight corridors; flight returns to individual hands.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU, noise2 } from '../core.js';
import { grain, vignette, text, glow, fillRect, makeCanvas, texture } from '../gfx.js';
import { THREE, initStage, render3D, camera, look, roomEnv, toScreen, mat, shadowLight } from '../three/stage.js';
import { quadcopter, spinRotors, evtol, tiltProps } from '../three/models.js';
import { drawGazer, sightline } from '../art/motif.js';

let sceneQ, camQ, drone, sceneV, camV, taxi;
const CYAN = '#5fe1ff', ORANGE = '#ff6a1a';

function carbonWeave() {
  return texture('carbon', () => {
    const { c, ctx } = makeCanvas(W, H);
    ctx.fillStyle = '#0b0c0e'; ctx.fillRect(0, 0, W, H);
    const s = 28;
    for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
      const twill = ((x / s) + (y / s)) % 4 < 2;
      const g = twill ? ctx.createLinearGradient(x, y, x + s, y) : ctx.createLinearGradient(x, y, x, y + s);
      g.addColorStop(0, '#16181c'); g.addColorStop(0.5, '#2a2d33'); g.addColorStop(1, '#121417');
      ctx.fillStyle = g; ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
    }
    return c;
  });
}

function motorDiagram(ctx, cx, cy, r, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.translate(cx, cy);
  const n = 12, active = Math.floor(t * 8) % n;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * TAU;
    ctx.save(); ctx.rotate(ang);
    const on = (i - active + n) % 3 === 0;
    ctx.fillStyle = on ? 'rgba(255,140,60,0.95)' : 'rgba(120,80,40,0.6)';
    ctx.fillRect(r * 0.42, -r * 0.07, r * 0.36, r * 0.14);
    if (on) glow(ctx, r * 0.6, 0, r * 0.25, '#ff9a40', 0.5);
    ctx.restore();
  }
  ctx.strokeStyle = 'rgba(150,200,230,0.7)'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(0, 0, r * 0.95, 0, TAU); ctx.stroke();
  ctx.rotate(t * 2.2);
  for (let i = 0; i < 14; i++) { ctx.rotate(TAU / 14); ctx.fillStyle = i % 2 ? '#c84a4a' : '#4a6ac8'; ctx.fillRect(r * 0.82, -r * 0.08, r * 0.1, r * 0.16); }
  ctx.restore();
}

function pcb(ctx, t, a) {
  if (a <= 0) return;
  const R = rng(19);
  ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 2; ctx.lineCap = 'round';
  for (let i = 0; i < 46; i++) {
    let x = R() * W, y = R() * H; const pts = [[x, y]];
    for (let k = 0; k < 5; k++) { if (R() < 0.5) x += (R() - 0.5) * 400; else y += (R() - 0.5) * 300; pts.push([x, y]); }
    ctx.strokeStyle = 'rgba(95,225,255,0.12)';
    ctx.beginPath(); pts.forEach(([px, py], j) => (j ? ctx.lineTo(px, py) : ctx.moveTo(px, py))); ctx.stroke();
    const ph = ((t * 0.6 + R()) % 1);
    const seg_ = Math.floor(ph * (pts.length - 1)), f = ph * (pts.length - 1) - seg_;
    const p = [lerp(pts[seg_][0], pts[seg_ + 1][0], f), lerp(pts[seg_][1], pts[seg_ + 1][1], f)];
    glow(ctx, p[0], p[1], 14, CYAN, 0.6);
  }
  ctx.restore();
}

function graph(ctx, x, y, w, h, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a;
  ctx.strokeStyle = 'rgba(95,225,255,0.3)'; ctx.lineWidth = 1; ctx.strokeRect(x, y, w, h);
  ctx.beginPath(); ctx.moveTo(x, y + h / 2); ctx.lineTo(x + w, y + h / 2); ctx.stroke();
  const gust = (u) => Math.exp(-Math.pow((u - 7.4) * 2.2, 2)) * 0.8;
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'; ctx.setLineDash([4, 4]);
  ctx.beginPath(); for (let i = 0; i <= w; i += 3) { const u = t - (w - i) / 200; const v = gust(u) * Math.sin(u * 30) * 0.4; i ? ctx.lineTo(x + i, y + h / 2 - v * h * 0.4) : ctx.moveTo(x + i, y + h / 2 - v * h * 0.4); } ctx.stroke();
  ctx.setLineDash([]); ctx.strokeStyle = CYAN; ctx.lineWidth = 2;
  ctx.beginPath(); for (let i = 0; i <= w; i += 3) { const u = t - (w - i) / 200; const v = gust(u) * Math.sin(u * 30) * 0.4 * Math.exp(-Math.max(0, u - 7.4) * 3) + noise2(u * 40, 3) * 0.03; i ? ctx.lineTo(x + i, y + h / 2 - v * h * 0.4) : ctx.moveTo(x + i, y + h / 2 - v * h * 0.4); } ctx.stroke();
  text(ctx, 'ROLL  · PID · 1 kHz', x, y - 10, { font: 'JetBrains Mono', size: 15, color: '#bfefff', align: 'left', spacing: 2 });
  ctx.restore();
}

function corridors(ctx, t, a) {
  if (a <= 0) return;
  const R = rng(73);
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 9; i++) {
    const y0 = 160 + R() * 360, y1 = 120 + R() * 380, cy = (y0 + y1) / 2 - 80 - R() * 140, col = R() < 0.3 ? ORANGE : CYAN;
    ctx.strokeStyle = col; ctx.globalAlpha = a * 0.25; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-50, y0); ctx.quadraticCurveTo(W / 2, cy, W + 50, y1); ctx.stroke();
    for (let k = 0; k < 6; k++) {
      const u = ((t * (0.05 + R() * 0.05)) + k / 6 + R()) % 1;
      const x = lerp(lerp(-50, W / 2, u), lerp(W / 2, W + 50, u), u), y = lerp(lerp(y0, cy, u), lerp(cy, y1, u), u);
      ctx.globalAlpha = a; glow(ctx, x, y, 16, col, 0.7); glow(ctx, x, y, 3, '#ffffff', 0.9);
    }
  }
  ctx.restore();
}

function nightCity(ctx, y, t, a) {
  if (a <= 0) return;
  const R = rng(91);
  ctx.save(); ctx.globalAlpha = a;
  for (const [layer, col, hMul] of [[0, '#0b1120', 0.7], [1, '#070b14', 1]]) {
    let x = -20;
    while (x < W + 20) {
      const w = 50 + R() * 120, h = (100 + R() * 340) * hMul;
      ctx.fillStyle = col; ctx.fillRect(x, y - h + layer * 60, w, h + 400);
      for (let wy = y - h + 14 + layer * 60; wy < y + 60; wy += 16) for (let wx = x + 6; wx < x + w - 6; wx += 12) if (R() < 0.32) { ctx.fillStyle = R() < 0.8 ? 'rgba(255,214,150,0.55)' : 'rgba(150,220,255,0.6)'; ctx.fillRect(wx, wy, 5, 7); }
      x += w + 4;
    }
  }
  ctx.restore();
}

export default {
  transIn: { dur: 1.6, type: 'fade' },
  caption: 'rgba(191,239,255,0.95)',
  async init() {
    initStage();
    sceneQ = new THREE.Scene(); sceneQ.environment = roomEnv();
    sceneQ.add(new THREE.HemisphereLight(0x9fd8ff, 0x101820, 0.6));
    const k = new THREE.DirectionalLight(0xffffff, 2.2); k.position.set(2, 4, 3); sceneQ.add(k);
    const rim = new THREE.DirectionalLight(0x5fe1ff, 2.0); rim.position.set(-3, 1, -3); sceneQ.add(rim);
    drone = quadcopter(); sceneQ.add(drone);
    camQ = camera(30);
    sceneV = new THREE.Scene(); sceneV.environment = roomEnv();
    sceneV.add(new THREE.HemisphereLight(0x6080c0, 0x101018, 0.5));
    const k2 = new THREE.DirectionalLight(0xffd0a0, 1.5); k2.position.set(-10, 5, 10); sceneV.add(k2);
    taxi = evtol(); sceneV.add(taxi);
    camV = camera(28);
  },
  draw(ctx, t, dur) {
    ctx.fillStyle = '#05070a'; ctx.fillRect(0, 0, W, H);
    // ---- 1. materials macro (0–5.6)
    const a1 = env(t, -1, 5.8, 0.5, 0.8);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1;
      ctx.save(); ctx.translate(-t * 12, 0); ctx.drawImage(carbonWeave(), 0, 0); ctx.drawImage(carbonWeave(), W, 0); ctx.restore();
      // specular sweep across the weave
      const sx = lerp(-400, W + 400, seg(t, 0, 4));
      const g = ctx.createLinearGradient(sx - 300, 0, sx + 300, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(200,230,255,0.16)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      pcb(ctx, t, sseg(t, 1.6, 2.6));
      motorDiagram(ctx, W * 0.62, H * 0.46, 220, t, sseg(t, 1.0, 2.2));
      text(ctx, 'CARBON FIBRE · T700', 160, 300, { font: 'JetBrains Mono', size: 22, color: '#d8f4ff', align: 'left', spacing: 3, alpha: sseg(t, 0.6, 1.4) });
      text(ctx, 'BRUSHLESS DC · 12N14P', W * 0.62, H * 0.46 + 290, { font: 'JetBrains Mono', size: 22, color: '#ffd2b0', spacing: 3, alpha: sseg(t, 1.6, 2.4) });
      text(ctx, 'FLIGHT CONTROLLER · 3× IMU', 160, 760, { font: 'JetBrains Mono', size: 22, color: '#bfefff', align: 'left', spacing: 3, alpha: sseg(t, 2.6, 3.4) });
      ctx.restore();
    }
    // ---- 2. the drone corrects itself (5–11.6)
    const a2 = env(t, 5.0, 11.8, 0.6, 0.6);
    if (a2 > 0) {
      ctx.save(); ctx.globalAlpha = a2;
      const g = ctx.createRadialGradient(W / 2, H * 0.55, 0, W / 2, H * 0.55, 900); g.addColorStop(0, '#0e1a26'); g.addColorStop(1, '#030507');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      // perspective neon floor grid
      ctx.strokeStyle = 'rgba(95,225,255,0.15)'; ctx.lineWidth = 1;
      for (let i = -20; i <= 20; i++) { ctx.beginPath(); ctx.moveTo(W / 2 + i * 30, H * 0.62); ctx.lineTo(W / 2 + i * 260, H); ctx.stroke(); }
      for (let j = 0; j < 12; j++) { const y = H * 0.62 + Math.pow(j / 12, 2) * H * 0.38; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
      ctx.restore();
      const gust = Math.exp(-Math.pow((t - 7.4) * 2.2, 2)) * 0.5;
      const roll = gust * Math.sin(t * 30) * Math.exp(-Math.max(0, t - 7.4) * 3) + Math.sin(t * 1.3) * 0.02;
      drone.position.set(0, Math.sin(t * 1.6) * 0.01, 0);
      drone.rotation.set(roll, t * 0.15, Math.sin(t * 0.9) * 0.03);
      spinRotors(drone, t * 120, 0.35);
      look(camQ, [1.05 * Math.cos(t * 0.12 + 0.6), 0.36, 1.05 * Math.sin(t * 0.12 + 0.6)], [0, -0.02, 0]);
      render3D(ctx, sceneQ, camQ, { alpha: a2, exposure: 1.1 });
      // body axes
      const o = toScreen(drone.position, camQ);
      const ax = [[new THREE.Vector3(0.12, 0, 0), '#ff5a5a', 'X'], [new THREE.Vector3(0, 0.12, 0), '#5aff8a', 'Z'], [new THREE.Vector3(0, 0, 0.12), '#5aa8ff', 'Y']];
      ctx.save(); ctx.globalAlpha = a2 * sseg(t, 6, 6.8); ctx.lineWidth = 2;
      for (const [v, c, l] of ax) { const e = toScreen(v.applyEuler(drone.rotation), camQ); ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(o[0], o[1]); ctx.lineTo(e[0], e[1]); ctx.stroke(); text(ctx, l, e[0] + 8, e[1], { font: 'JetBrains Mono', size: 16, color: c }); }
      ctx.restore();
      graph(ctx, W - 560, 220, 440, 150, t, a2 * sseg(t, 6.2, 7));
      const hz = Math.floor((t - 5) * 1000);
      text(ctx, `CORRECTIONS  ${String(Math.max(0, hz)).padStart(5, '0')}`, W - 560, 430, { font: 'JetBrains Mono', size: 20, color: '#bfefff', align: 'left', spacing: 2, alpha: a2 * sseg(t, 6.6, 7.2) });
      if (gust > 0.05) text(ctx, 'GUST DETECTED → STABILISED', W / 2, H * 0.84, { font: 'JetBrains Mono', size: 22, color: '#ffd2b0', spacing: 3, alpha: a2 * clamp(gust * 3) });
    }
    // ---- 3. the city of corridors; a young pilot looks up (11–20)
    const a3 = sseg(t, 11.0, 12.0);
    if (a3 > 0) {
      ctx.save(); ctx.globalAlpha = a3;
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#04060f'); g.addColorStop(0.6, '#0c1734'); g.addColorStop(1, '#1d2a4a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      ctx.restore();
      corridors(ctx, t, a3);
      const k = seg(t, 11.5, dur + 1);
      taxi.position.set(lerp(-26, 22, k), 4 + Math.sin(t * 0.8) * 0.3, -6);
      taxi.rotation.set(0, 0.25, 0.04);
      tiltProps(taxi, lerp(0, Math.PI / 2, sseg(t, 13, 17)), t * 50, 0.3);
      look(camV, [0, 1, 26], [0, 3.4, -6]);
      render3D(ctx, sceneV, camV, { alpha: a3, exposure: 1.1 });
      nightCity(ctx, H - 40, t, a3);
      const gz = drawGazer(ctx, 120, H + 50, 1.12, { tilt: lerp(-0.25, -0.5, sseg(t, 12, 15)), extra: 'short', style: 'neon', color: CYAN, width: 2.4, progress: sseg(t, 11.6, 13), alpha: a3 });
      const tp = toScreen(taxi.position, camV);
      sightline(ctx, gz.eye, [tp[0], tp[1]], sseg(t, 13.2, 15.2), { color: '#d8f6ff', alpha: env(t, 13.2, dur + 1, 0.4, 1) * 0.9 });
    }
    vignette(ctx, 0.5);
    grain(ctx, t, 0.05);
  },
};
