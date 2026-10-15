// CHAPTER V — WINGS OF WAR. Biplanes over the trenches; the sky becomes a frontier.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, noise2, fbm2, TAU } from '../core.js';
import { grain, vignette, text, glow, fillRect, makeCanvas, texture } from '../gfx.js';
import { THREE, initStage, render3D, camera, look, mat, shadowLight, roomEnv } from '../three/stage.js';
import { biplane, spinProps } from '../three/models.js';
import { drawGazer, sightline } from '../art/motif.js';

let scene, cam, planes = [], squadron = [];

function smokeTex(dark = false) {
  return texture(dark ? 'smoke-dark' : 'smoke-puff', () => {
    const { c, ctx } = makeCanvas(256, 256);
    const img = ctx.createImageData(256, 256);
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const dx = (x - 128) / 128, dy = (y - 128) / 128, r = Math.hypot(dx, dy);
      const n = fbm2(x * 0.03, y * 0.03, 4) * 0.5 + 0.5;
      const a = Math.max(0, 1 - r) ** 1.5 * (0.5 + n * 0.8);
      const v = dark ? 30 + n * 40 : 255;
      const i = (y * 256 + x) * 4; img.data[i] = v; img.data[i + 1] = v * 0.92; img.data[i + 2] = v * 0.8; img.data[i + 3] = Math.min(255, a * 255);
    }
    ctx.putImageData(img, 0, 0);
    return c;
  });
}

function plume(ctx, x, y, t, scale, col, seed) {
  const tex = smokeTex(true);
  const R = rng(seed);
  for (let i = 0; i < 22; i++) {
    const k = ((i / 22) + t * 0.04 * (0.8 + R() * 0.4)) % 1;
    const px = x + Math.sin(k * 3 + seed) * 40 * scale + k * 260 * scale, py = y - k * 620 * scale;
    const s = (60 + k * 360) * scale;
    ctx.save(); ctx.globalAlpha = (1 - k) * 0.55 * Math.min(1, k * 8);
    ctx.drawImage(tex, px - s / 2, py - s / 2, s, s);
    ctx.restore();
  }
  ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.restore();
}

export default {
  transIn: { dur: 1.0, type: 'black' },
  caption: 'rgba(235,225,200,0.92)',
  async init() {
    initStage();
    scene = new THREE.Scene();
    scene.environment = roomEnv();
    scene.add(new THREE.HemisphereLight(0xd8cfb8, 0x3a3428, 1.3));
    const sun = new THREE.DirectionalLight(0xffe2b0, 2.4); sun.position.set(-20, 12, -30); scene.add(sun);
    const roundels = [['#2a4b8d', '#f2efe6', '#b8322a'], ['#b8322a', '#f2efe6', '#2a4b8d'], ['#222222', '#d8d0bb', '#222222']];
    for (let i = 0; i < 3; i++) { const p = biplane({ color: [0x6e6a48, 0x7a5a3a, 0x5d6448][i], roundels: roundels[i] }); scene.add(p); planes.push(p); }
    for (let i = 0; i < 14; i++) { const p = biplane({ color: 0x3a3830 }); p.scale.setScalar(1); scene.add(p); squadron.push(p); }
    cam = camera(38);
  },
  draw(ctx, t, dur) {
    // --- sky
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#24241f'); g.addColorStop(0.5, '#7d7058'); g.addColorStop(0.8, '#c9a979'); g.addColorStop(1, '#5a4c3a');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    glow(ctx, W * 0.3, H * 0.62, 520, '#ffd9a0', 0.35);
    glow(ctx, W * 0.3, H * 0.62, 90, '#fff2d8', 0.6);
    // smoke plumes from the front line
    plume(ctx, 300, H * 0.95, t, 1.4, '#000', 3);
    plume(ctx, 1200, H * 0.98, t + 4, 1.0, '#000', 9);
    plume(ctx, 1650, H * 0.95, t + 2, 1.7, '#000', 15);
    // flak bursts
    const R = rng(5);
    for (let i = 0; i < 16; i++) {
      const t0 = R() * 14, x = R() * W, y = H * (0.1 + R() * 0.45);
      const k = (t - t0);
      if (k < 0 || k > 3) continue;
      ctx.save(); ctx.globalAlpha = (1 - k / 3) * 0.85;
      const sz = 70 + k * 70;
      ctx.drawImage(smokeTex(true), x - sz / 2, y - sz / 2 + k * 10, sz, sz);
      ctx.restore();
      if (k < 0.12) glow(ctx, x, y, 80, '#ffcf80', (1 - k / 0.12) * 0.8);
    }

    // --- 3D dogfight
    const T = t;
    const lead = planes[0], chase = planes[1], far = planes[2];
    const path = (u, off) => [Math.sin(u * 0.6 + off) * 40, 60 + Math.sin(u * 0.9 + off) * 8, -u * 30 + Math.cos(u * 0.5 + off) * 30];
    const place = (p, u, off, roll) => {
      const a = path(u, off), b = path(u + 0.02, off);
      p.position.set(...a);
      p.lookAt(b[0], b[1], b[2]);
      p.rotateY(-Math.PI / 2);
      p.rotateX(roll);
      spinProps(p, T * 60, 0.22);
    };
    const u = T * 0.55;
    place(lead, u, 0, Math.sin(u * 0.6) * 0.9);
    place(chase, u - 0.32, 0.25, Math.sin((u - 0.3) * 0.6) * 0.95);
    place(far, u * 0.9 + 3, 2.2, 0.4);
    // squadron appears at the end
    const sq = sseg(t, 9.5, 12.5);
    squadron.forEach((p, i) => {
      const row = Math.floor(i / 5), col = i % 5;
      p.visible = sq > 0;
      p.position.set(lead.position.x - 30 + col * 14 - row * 5, 80 + row * 7 - (1 - sq) * 60, lead.position.z - 120 - row * 16 + col * 3);
      p.rotation.set(0, Math.PI / 2 + 0.25, 0);
      spinProps(p, T * 60, 0.2);
    });
    // camera
    const wide = 1 - sseg(t, 4.2, 6.2) + sseg(t, 10, 12);
    const lp = lead.position;
    const chaseCam = [lp.x + 19 * Math.cos(t * 0.3), lp.y + 4, lp.z + 22];
    const groundCam = [lp.x - 20, 0, lp.z + 60];
    const cpos = [lerp(chaseCam[0], groundCam[0], clamp(wide)), lerp(chaseCam[1], groundCam[1], clamp(wide)), lerp(chaseCam[2], groundCam[2], clamp(wide))];
    look(cam, cpos, [lp.x, lp.y + (wide > 0.5 ? 8 : 0), lp.z - 6]);
    cam.rotation.z += Math.sin(t * 0.7) * 0.08 * (1 - clamp(wide));
    render3D(ctx, scene, cam, { exposure: 1.0 });
    // tracers from the chaser
    if (t > 5.5 && t < 10.5) {
      const a = chase.position.clone().project(cam), b = lead.position.clone().project(cam);
      if (a.z < 1 && b.z < 1) {
        const ax = (a.x + 1) / 2 * W, ay = (1 - a.y) / 2 * H, bx = (b.x + 1) / 2 * W, by = (1 - b.y) / 2 * H;
        ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = 'rgba(255,220,150,0.8)'; ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const k = ((t * 3 + i / 5) % 1);
          const x0 = lerp(ax, bx, k), y0 = lerp(ay, by, k) + (i - 2) * 6, x1 = lerp(ax, bx, Math.min(1, k + 0.05)), y1 = lerp(ay, by, Math.min(1, k + 0.05)) + (i - 2) * 6;
          if (Math.floor(t * 6 + i) % 3 === 0) { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke(); }
        }
        ctx.restore();
      }
    }
    // --- trench foreground + soldier gazing up (wide shots)
    const fgA = clamp(wide);
    if (fgA > 0.02) {
      ctx.save(); ctx.globalAlpha = fgA;
      ctx.fillStyle = '#17130e';
      ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H - 160);
      for (let x = 0; x <= W; x += 30) ctx.lineTo(x, H - 150 - noise2(x * 0.006, 4) * 50 - (x > 1300 ? 40 : 0));
      ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
      // barbed wire posts + coils
      ctx.strokeStyle = '#17130e'; ctx.lineWidth = 2;
      for (let i = 0; i < 9; i++) { const x = 760 + i * 130; ctx.beginPath(); ctx.moveTo(x, H - 170); ctx.lineTo(x + 10, H - 290); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x - 20, H - 260); ctx.lineTo(x + 30, H - 250); ctx.stroke(); }
      ctx.lineWidth = 1.2; ctx.beginPath();
      for (let x = 740; x < 1900; x += 3) ctx.lineTo(x, H - 230 + Math.sin(x * 0.18) * 26);
      ctx.stroke();
      const gz = drawGazer(ctx, 120, H + 70, 1.05, { tilt: -0.5, extra: 'brodie', style: 'rim', color: '#120f0b', rim: '#ffcf90', rimAlpha: 0.8 });
      const tp = lead.position.clone().project(cam);
      sightline(ctx, gz.eye, [(tp.x + 1) / 2 * W, (1 - tp.y) / 2 * H], sseg(t, 1.0, 3.2) * (t < 6 ? 1 : 0) + (t > 11 ? sseg(t, 11, 12.5) : 0), { color: '#ffe6bd', alpha: 0.8 * fgA, width: 1.2 });
      ctx.restore();
    }
    // --- grade: desaturated olive, crushed blacks
    ctx.save();
    ctx.globalCompositeOperation = 'saturation'; ctx.globalAlpha = 0.7; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.25; ctx.fillStyle = '#7a6a40'; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    // stencilled date
    text(ctx, '1914 — 1918', W - 110, 150, { font: 'Special Elite', size: 46, color: '#e8dcc0', align: 'right', alpha: env(t, 1, 6, 0.8, 1) * 0.85, spacing: 4 });
    vignette(ctx, 0.7, '#0a0805', 0.32);
    grain(ctx, t, 0.13, 1.6);
  },
};
