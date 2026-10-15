// CHAPTER VI — THE GOLDEN AGE. Art Deco travel-poster sky; a polished DC-3; the transatlantic route; a child at the airfield fence.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU } from '../core.js';
import { grain, vignette, text, glow, fillRect } from '../gfx.js';
import { THREE, initStage, render3D, camera, look, gradientEnv } from '../three/stage.js';
import { dc3, spinProps } from '../three/models.js';
import { drawFigure, POSES } from '../art/figures.js';
import { sightline } from '../art/motif.js';

let scene, cam, plane;
const NAVY = '#14233f', TEAL = '#1e5361', CORAL = '#e9765b', GOLD = '#e8b85a', CREAM = '#f4e6c8';

function sunburst(ctx, x, y, r, t, a = 1) {
  ctx.save(); ctx.globalAlpha = a;
  ctx.translate(x, y);
  for (let i = 0; i < 36; i++) {
    const a0 = (i / 36) * TAU + t * 0.01, a1 = a0 + TAU / 72;
    ctx.fillStyle = i % 2 ? 'rgba(255,226,160,0.16)' : 'rgba(255,200,120,0.06)';
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.arc(0, 0, r, a0, a1); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function decoCloud(ctx, x, y, w, a = 1) {
  ctx.save(); ctx.globalAlpha = a;
  const bands = [[0, 0, 1], [0.12, 22, 0.8], [0.26, 44, 0.55]];
  for (const [ox, oy, k] of bands) {
    const bw = w * k, h = 20;
    ctx.fillStyle = 'rgba(20,35,63,0.18)'; ctx.beginPath(); ctx.roundRect(x + w * ox + 8, y + oy + 8, bw, h, h / 2); ctx.fill();
    ctx.fillStyle = CREAM; ctx.beginPath(); ctx.roundRect(x + w * ox, y + oy, bw, h, h / 2); ctx.fill();
  }
  ctx.restore();
}

function skyline(ctx, y, col, win) {
  const R = rng(27);
  let x = -20;
  while (x < W + 40) {
    const w = 70 + R() * 110, h = 120 + R() * 260, steps = 1 + Math.floor(R() * 3);
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.moveTo(x, H);
    let cx = x, cw = w, ch = y - h;
    ctx.lineTo(x, ch);
    for (let s = 0; s < steps; s++) { const inset = cw * 0.16; ctx.lineTo(cx + inset, ch); ctx.lineTo(cx + inset, ch - 34); cx += inset; cw -= inset * 2; ch -= 34; }
    if (R() < 0.35) { ctx.lineTo(cx + cw / 2 - 4, ch); ctx.lineTo(cx + cw / 2, ch - 70); ctx.lineTo(cx + cw / 2 + 4, ch); }
    for (let s = 0; s < steps; s++) { }
    ctx.lineTo(x + w - (w - cw) / 2, ch); ctx.lineTo(x + w - (w - cw) / 2, ch);
    ctx.lineTo(x + w, y - h); ctx.lineTo(x + w, H); ctx.closePath(); ctx.fill();
    // gold vertical window lines
    ctx.strokeStyle = win; ctx.lineWidth = 1.5;
    for (let k = 1; k < 4; k++) { ctx.beginPath(); ctx.moveTo(x + (w * k) / 4, y - h + 30); ctx.lineTo(x + (w * k) / 4, H); ctx.stroke(); }
    x += w + 6;
  }
}

function spiritIcon(ctx, x, y, s, ang) {
  // Ryan NYP "Spirit of St. Louis": high wing monoplane silhouette
  ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.scale(s, s);
  ctx.fillStyle = NAVY;
  ctx.beginPath(); ctx.ellipse(0, 0, 22, 4, 0, 0, TAU); ctx.fill();
  ctx.fillRect(-6, -7, 20, 3);
  ctx.beginPath(); ctx.moveTo(-22, -1); ctx.lineTo(-28, -8); ctx.lineTo(-24, 1); ctx.fill();
  ctx.fillRect(22, -5, 2, 10);
  ctx.restore();
}

export default {
  transIn: { dur: 1.4, type: 'fade' },
  caption: 'rgba(244,230,200,0.95)',
  async init() {
    initStage();
    scene = new THREE.Scene();
    scene.environment = gradientEnv('deco', '#2b5d74', '#f5b77a', '#3a3040', [0.3, 0.47], '#fff4d8');
    scene.add(new THREE.HemisphereLight(0xffe7c8, 0x6a5060, 1.4));
    const sun = new THREE.DirectionalLight(0xffd9a8, 2.6); sun.position.set(30, 10, -40); scene.add(sun);
    const fill = new THREE.DirectionalLight(0xfff0e0, 1.6); fill.position.set(-10, -4, 60); scene.add(fill);
    plane = dc3();
    scene.add(plane);
    cam = camera(30);
  },
  draw(ctx, t, dur) {
    const shot = t < 11 ? 0 : 1;
    // --- poster sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, NAVY); g.addColorStop(0.35, TEAL); g.addColorStop(0.72, CORAL); g.addColorStop(0.86, GOLD); g.addColorStop(1, '#f6d58e');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const sunY = shot ? H * 0.74 : H * 0.8;
    sunburst(ctx, W * 0.5, sunY, 1500, t);
    ctx.fillStyle = '#ffe9b8'; ctx.beginPath(); ctx.arc(W * 0.5, sunY, 190, 0, TAU); ctx.fill();
    ctx.fillStyle = 'rgba(232,118,91,0.35)'; for (let i = 0; i < 5; i++) ctx.fillRect(W * 0.5 - 200, sunY + 40 + i * 30, 400, 8 + i * 2);
    decoCloud(ctx, 140 - t * 6, 260, 520, 0.95);
    decoCloud(ctx, 1240 + t * 4, 180, 460, 0.9);
    decoCloud(ctx, 900 - t * 3, 470, 380, 0.75);

    // --- Lindbergh route (shot 0, second half)
    const rA = env(t, 5.4, 11.2, 0.6, 0.6);
    if (rA > 0) {
      const p0 = [260, 330], p1 = [1660, 330];
      const prog = sseg(t, 5.8, 10.4);
      ctx.save(); ctx.globalAlpha = rA;
      ctx.strokeStyle = CREAM; ctx.lineWidth = 3; ctx.setLineDash([14, 12]);
      ctx.beginPath();
      for (let i = 0; i <= 80 * prog; i++) { const k = i / 80; const x = lerp(p0[0], p1[0], k), y = p0[1] - Math.sin(k * Math.PI) * 160; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.setLineDash([]);
      const k = prog, sx = lerp(p0[0], p1[0], k), sy = p0[1] - Math.sin(k * Math.PI) * 160;
      spiritIcon(ctx, sx, sy, 1.5, -Math.cos(k * Math.PI) * 0.45);
      text(ctx, 'NEW YORK', p0[0], p0[1] + 46, { font: 'Poiret One', size: 30, color: CREAM, spacing: 6 });
      text(ctx, 'PARIS', p1[0], p1[1] + 46, { font: 'Poiret One', size: 30, color: CREAM, spacing: 6, alpha: sseg(t, 9.6, 10.4) });
      text(ctx, '33 ½ HOURS · MAY 1927', W / 2, 140, { font: 'Limelight', size: 34, color: CREAM, spacing: 5, alpha: sseg(t, 7, 8) });
      ctx.restore();
    }

    // --- DC-3
    const prop = t * 70;
    spinProps(plane, prop, 0.25);
    if (!shot) {
      const k = seg(t, -0.6, 11.5);
      plane.position.set(lerp(-60, 60, k), 0, 0);
      plane.rotation.set(Math.sin(t * 0.4) * 0.05 - 0.08, 0, 0.06);
      look(cam, [lerp(-30, 20, k), -6, 70], [plane.position.x * 0.7, 0, 0]);
    } else {
      const k = seg(t, 11, dur + 0.5);
      plane.position.set(lerp(40, -50, ease.inOutSine(k)), 14, -6);
      plane.rotation.set(0.1, Math.PI, -0.03);
      look(cam, [0, 0, 30], [0, 10, -6]);
    }
    render3D(ctx, scene, cam, { exposure: 1.25 });

    // --- shot 1: city + fence + the child gazing up
    if (shot) {
      const a = sseg(t, 11, 11.6);
      ctx.save(); ctx.globalAlpha = a;
      skyline(ctx, H + 150, NAVY, 'rgba(232,184,90,0.4)');
      // chain-link fence
      ctx.strokeStyle = 'rgba(14,22,40,0.85)'; ctx.lineWidth = 2;
      for (let x = -200; x < W + 200; x += 36) { ctx.beginPath(); ctx.moveTo(x, H - 260); ctx.lineTo(x + 180, H); ctx.moveTo(x + 180, H - 260); ctx.lineTo(x, H); ctx.stroke(); }
      ctx.fillStyle = NAVY; ctx.fillRect(0, H - 270, W, 12);
      for (let x = 60; x < W; x += 300) ctx.fillRect(x, H - 300, 12, 300);
      glow(ctx, W * 0.5, H - 200, 360, '#ffe6b0', 0.35, 'source-over');
      const fig = drawFigure(ctx, W * 0.5 - 40, H - 14, 320, POSES.reach, { color: '#0b1426', child: true, hat: 'cap' });
      const pp = plane.position.clone(); pp.y += 0; const pv = pp.project(cam);
      sightline(ctx, fig.eye, [(pv.x + 1) / 2 * W, (1 - pv.y) / 2 * H], sseg(t, 12.6, 14.6), { color: '#fff1d0', alpha: env(t, 12.6, dur + 1, 0.4, 1) * 0.9 });
      ctx.restore();
    } else {
      skyline(ctx, H + 120, 'rgba(20,35,63,0.9)', 'rgba(232,184,90,0.35)');
    }
    // deco frame
    ctx.save();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.strokeRect(40, 40, W - 80, H - 80);
    ctx.lineWidth = 1; ctx.strokeRect(52, 52, W - 104, H - 104);
    for (const [cx, cy] of [[40, 40], [W - 40, 40], [40, H - 40], [W - 40, H - 40]]) { ctx.fillStyle = GOLD; ctx.beginPath(); ctx.arc(cx, cy, 7, 0, TAU); ctx.fill(); }
    ctx.restore();
    text(ctx, 'THE  GOLDEN  AGE  OF  FLIGHT', W - 96, 104, { font: 'Limelight', size: 30, color: CREAM, align: 'right', spacing: 3, alpha: env(t, 0.6, 5.6, 0.8, 0.8) });
    grain(ctx, t, 0.05);
    vignette(ctx, 0.3, '#0a1020');
  },
};
