// CHAPTER VII — BEYOND SOUND. Blueprints, wind tunnels and slide rules; X-1 through Mach 1; the Comet; Concorde.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU, noise2 } from '../core.js';
import { grain, vignette, text, glow, fillRect, surface, strokePolys, xform } from '../gfx.js';
import { THREE, initStage, render3D, renderOutline, camera, look, roomEnv, lineMode, toScreen } from '../three/stage.js';
import { x1, concorde } from '../three/models.js';
import { drawGazer, sightline } from '../art/motif.js';
import { parsePath } from '../svgpath.js';

let scene, camP, camO, plane, planeLines, conc, concLines, sceneC;
const BP = '#0d3a64', LINE = 'rgba(232,242,255,0.92)';
const BOOM = 8.4;

const COMET = 'M 40 0 C 20 0 0 14 0 30 C 0 46 20 54 50 56 L 640 58 C 700 58 760 50 800 40 L 860 -40 L 900 -40 L 880 30 C 900 34 910 40 900 46 L 820 52 C 760 62 700 66 640 66 L 60 66 C 30 66 0 56 0 30';
const COMET_WING = 'M 300 48 L 560 48 L 610 62 L 300 62 Z M 330 48 L 330 62 M 360 48 L 360 62';

const blueTex = () => surface({ key: 'blue', base: '#0f3d68', dark: '#0a2c4f', light: '#174d7e', scale: 3, contrast: 0.35, spots: 20, fibres: 500, seed: 41 });
function blueprint(ctx, t) {
  ctx.drawImage(blueTex(), 0, 0);
  ctx.save();
  ctx.strokeStyle = 'rgba(200,225,255,0.07)'; ctx.lineWidth = 1;
  ctx.beginPath(); for (let x = 0; x <= W; x += 24) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); } for (let y = 0; y <= H; y += 24) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); } ctx.stroke();
  ctx.strokeStyle = 'rgba(200,225,255,0.14)';
  ctx.beginPath(); for (let x = 0; x <= W; x += 120) { ctx.moveTo(x + 0.5, 0); ctx.lineTo(x + 0.5, H); } for (let y = 0; y <= H; y += 120) { ctx.moveTo(0, y + 0.5); ctx.lineTo(W, y + 0.5); } ctx.stroke();
  ctx.restore();
  // title block
  ctx.save(); ctx.strokeStyle = 'rgba(232,242,255,0.5)'; ctx.lineWidth = 1.5;
  ctx.strokeRect(W - 520, H - 250, 440, 120); ctx.beginPath(); ctx.moveTo(W - 520, H - 210); ctx.lineTo(W - 80, H - 210); ctx.moveTo(W - 300, H - 210); ctx.lineTo(W - 300, H - 130); ctx.stroke();
  ctx.restore();
}

function dimension(ctx, x0, y0, x1, y1, label, p = 1, off = 30) {
  if (p <= 0) return;
  ctx.save(); ctx.strokeStyle = LINE; ctx.fillStyle = LINE; ctx.lineWidth = 1; ctx.globalAlpha = p;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L * off, ny = dx / L * off;
  ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x0 + nx * 1.2, y0 + ny * 1.2); ctx.moveTo(x1, y1); ctx.lineTo(x1 + nx * 1.2, y1 + ny * 1.2);
  const ax = x0 + nx, ay = y0 + ny, bx = lerp(ax, x1 + nx, p), by = lerp(ay, y1 + ny, p);
  ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
  text(ctx, label, (ax + x1 + nx) / 2, (ay + y1 + ny) / 2 - 8, { font: 'JetBrains Mono', size: 18, color: '#e8f2ff', alpha: p });
  ctx.restore();
}

function streamlines(ctx, t, cx, cy, a = 1) {
  // potential flow around a cylinder-ish airfoil: animated dashes
  ctx.save(); ctx.strokeStyle = 'rgba(200,230,255,0.55)'; ctx.lineWidth = 1.2; ctx.globalAlpha = a;
  ctx.setLineDash([24, 14]); ctx.lineDashOffset = -t * 90;
  for (let i = -7; i <= 7; i++) {
    ctx.beginPath();
    for (let x = -700; x <= 700; x += 10) {
      const y0 = i * 34;
      const r2 = (x * x) / 9 + y0 * y0 + 1;
      const y = y0 + (y0 >= 0 ? 1 : -1) * 6000 / (Math.sqrt(r2) + 40) * Math.exp(-(x * x) / 200000);
      x === -700 ? ctx.moveTo(cx + x, cy + y) : ctx.lineTo(cx + x, cy + y);
    }
    ctx.stroke();
  }
  ctx.setLineDash([]);
  // airfoil section
  ctx.lineWidth = 2.4; ctx.strokeStyle = LINE; ctx.fillStyle = 'rgba(13,58,100,0.9)';
  ctx.beginPath(); ctx.moveTo(cx - 160, cy); ctx.bezierCurveTo(cx - 150, cy - 40, cx - 40, cy - 46, cx + 180, cy + 4); ctx.bezierCurveTo(cx - 40, cy + 18, cx - 150, cy + 22, cx - 160, cy); ctx.fill(); ctx.stroke();
  ctx.restore();
}

function slideRule(ctx, x, y, w, t, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = LINE; ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, w, 70); ctx.strokeRect(x, y + 22, w, 26);
  const slide = Math.sin(t * 0.8) * 60;
  ctx.lineWidth = 1;
  for (let i = 1; i < 100; i++) {
    const lx = x + Math.log10(1 + i * 0.09) * w;
    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx, y + (i % 10 ? 8 : 16)); ctx.stroke();
    const sx = x + slide + Math.log10(1 + i * 0.09) * w;
    if (sx > x && sx < x + w) { ctx.beginPath(); ctx.moveTo(sx, y + 22); ctx.lineTo(sx, y + 22 + (i % 10 ? 7 : 13)); ctx.stroke(); }
  }
  ctx.strokeRect(x + w * 0.45 + slide * 0.5, y - 6, 36, 82);
  ctx.restore();
}

function machGauge(ctx, x, y, r, M, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = LINE; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(x, y, r, Math.PI * 0.75, Math.PI * 2.25); ctx.stroke();
  for (let i = 0; i <= 12; i++) { const m = i * 0.1 + 0.6, ang = Math.PI * 0.75 + (i / 12) * Math.PI * 1.5; ctx.beginPath(); ctx.moveTo(x + Math.cos(ang) * r, y + Math.sin(ang) * r); ctx.lineTo(x + Math.cos(ang) * (r - (i % 2 ? 10 : 18)), y + Math.sin(ang) * (r - (i % 2 ? 10 : 18))); ctx.stroke(); if (i % 2 === 0) text(ctx, m.toFixed(1), x + Math.cos(ang) * (r - 38), y + Math.sin(ang) * (r - 38) + 6, { font: 'JetBrains Mono', size: 15, color: '#e8f2ff' }); }
  const ang = Math.PI * 0.75 + clamp((M - 0.6) / 1.2) * Math.PI * 1.5;
  ctx.strokeStyle = '#ffb36b'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(ang) * (r - 14), y + Math.sin(ang) * (r - 14)); ctx.stroke();
  text(ctx, `M ${M.toFixed(2)}`, x, y + r * 0.62, { font: 'JetBrains Mono', size: 30, weight: 600, color: M >= 1 ? '#ffd29a' : '#e8f2ff' });
  ctx.restore();
}

export default {
  transIn: { dur: 1.2, type: 'fade' },
  caption: 'rgba(232,242,255,0.95)',
  async init() {
    initStage();
    blueTex();
    scene = new THREE.Scene();
    scene.environment = roomEnv();
    scene.add(new THREE.HemisphereLight(0xffffff, 0x334455, 1.2));
    const d = new THREE.DirectionalLight(0xffffff, 2); d.position.set(10, 20, 10); scene.add(d);
    plane = x1(); scene.add(plane);
    planeLines = lineMode(plane, { color: 0xe8f2ff, threshold: 18 });
    sceneC = new THREE.Scene();
    sceneC.add(new THREE.HemisphereLight(0x8fa8d8, 0x281820, 0.5));
    const s2 = new THREE.DirectionalLight(0xffb070, 3.4); s2.position.set(-60, -6, 20); sceneC.add(s2);
    const s3 = new THREE.DirectionalLight(0x6a88c8, 0.8); s3.position.set(20, 40, -20); sceneC.add(s3);
    conc = concorde(); sceneC.add(conc);
    concLines = lineMode(conc, { color: 0xe8f2ff, threshold: 18 });
    camP = camera(30);
    camO = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, 0.1, 500);
  },
  draw(ctx, t, dur) {
    blueprint(ctx, t);
    // ---- 1. engineer · wind tunnel · slide rule
    const a1 = env(t, -1, 5.6, 0.5, 0.8);
    if (a1 > 0) {
      ctx.save(); ctx.globalAlpha = a1;
      streamlines(ctx, t, 1180, 430, 1);
      slideRule(ctx, 760, 760, 820, t, sseg(t, 0.6, 2));
      const gz = drawGazer(ctx, 60, H + 30, 1.05, { tilt: lerp(-0.1, -0.42, sseg(t, 0.6, 2.6)), extra: 'short', style: 'blueprint', color: '#e8f2ff', progress: sseg(t, -0.6, 1.6), width: 2 });
      sightline(ctx, gz.eye, [1180, 430], sseg(t, 1.8, 3.6), { color: '#ffffff', alpha: 0.9, dashed: true });
      text(ctx, 'WIND TUNNEL TEST · SECTION A-A', 1180, 220, { font: 'JetBrains Mono', size: 20, color: '#e8f2ff', spacing: 3, alpha: sseg(t, 1, 2) });
      ctx.restore();
    }
    // ---- 2. X-1: three-view → alive → Mach 1
    const a2 = env(t, 5.0, 11.4, 0.6, 0.6);
    let M = 0.8;
    if (a2 > 0) {
      const lt = t - 5;
      const alive = sseg(t, 6.6, 7.6);
      plane.position.set(0, 0, 0);
      plane.rotation.set(0, 0, 0);
      if (alive < 1) {
        // orthographic side view (left) — lines only
        planeLines.set(0, a2 * (1 - alive));
        camO.zoom = 60; camO.updateProjectionMatrix();
        camO.position.set(0, 0.2, 50); camO.lookAt(0, 0.2, 0); camO.updateMatrixWorld();
        camO.position.x = 3.5; camO.updateMatrixWorld();
        const va = sseg(t, 5.2, 6.0) * (1 - alive);
        ctx.save(); ctx.translate(0, -150);
        renderOutline(ctx, scene, camO, { width: 2, alpha: va, fill: 'rgba(20,70,120,0.5)' });
        render3D(ctx, scene, camO, { alpha: va });
        ctx.restore();
        // top view (lower)
        camO.position.set(-3.5, 50, 0.001); camO.up.set(0, 0, -1); camO.lookAt(-3.5, 0, 0); camO.updateMatrixWorld();
        const vb = sseg(t, 5.6, 6.4) * (1 - alive);
        ctx.save(); ctx.translate(0, 190);
        renderOutline(ctx, scene, camO, { width: 2, alpha: vb, fill: 'rgba(20,70,120,0.5)' });
        render3D(ctx, scene, camO, { alpha: vb });
        ctx.restore();
        camO.up.set(0, 1, 0);
        dimension(ctx, W / 2 - 3.5 * 60 - 283, H / 2 - 240, W / 2 - 3.5 * 60 + 283, H / 2 - 240, '9.42 m', sseg(t, 5.8, 6.6) * (1 - alive), -30);
        dimension(ctx, W / 2 + 3.5 * 60 - 126, H / 2 + 190 + 260, W / 2 + 3.5 * 60 + 126, H / 2 + 190 + 260, '8.53 m', sseg(t, 6.0, 6.8) * (1 - alive), 30);
      }
      if (alive > 0) {
        M = lerp(0.8, 1.06, sseg(t, 7.2, BOOM + 0.6));
        planeLines.set(sseg(t, 7.6, 9.0), 1 - sseg(t, 7.6, 9.0) * 0.7);
        plane.position.set((t - 7) * 2.0, Math.sin(t * 2) * 0.05, 0);
        plane.rotation.set(0.15, 0, 0.02);
        look(camP, [plane.position.x - 6, 2.2, 13], [plane.position.x + 0.5, 0, 0]);
        // schlieren shock cone once supersonic
        const nose = toScreen(new THREE.Vector3(plane.position.x + 4.7, 0, 0), camP);
        const sh = sseg(t, BOOM - 0.2, BOOM + 0.4);
        if (sh > 0) {
          const mu = Math.asin(1 / Math.max(1.0001, M)) * 0.9;
          ctx.save(); ctx.globalCompositeOperation = 'lighter';
          for (const sgn of [-1, 1]) {
            const L = 1400;
            const ex = nose[0] - Math.cos(mu) * L, ey = nose[1] + sgn * Math.sin(mu) * L * 0.6;
            const g = ctx.createLinearGradient(nose[0], nose[1], ex, ey);
            g.addColorStop(0, `rgba(255,255,255,${0.9 * sh})`); g.addColorStop(1, 'rgba(255,255,255,0)');
            ctx.strokeStyle = g; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(ex, ey); ctx.stroke();
            ctx.lineWidth = 12; ctx.globalAlpha = 0.15; ctx.beginPath(); ctx.moveTo(nose[0], nose[1]); ctx.lineTo(ex, ey); ctx.stroke(); ctx.globalAlpha = 1;
          }
          ctx.restore();
        }
        renderOutline(ctx, scene, camP, { width: 2, alpha: alive * a2 * (1 - sseg(t, 7.6, 9.0)) });
        render3D(ctx, scene, camP, { alpha: alive * a2 });
        // the boom: expanding ring + flash
        const bk = seg(t, BOOM, BOOM + 1.6);
        if (bk > 0 && bk < 1) {
          ctx.save(); ctx.strokeStyle = `rgba(255,236,210,${(1 - bk) * 0.8})`; ctx.lineWidth = 6 * (1 - bk) + 1;
          ctx.beginPath(); ctx.arc(nose[0], nose[1], 40 + bk * 1400, 0, TAU); ctx.stroke(); ctx.restore();
          fillRect(ctx, '#ffffff', (1 - bk) ** 3 * 0.55);
        }
        machGauge(ctx, W - 240, 300, 120, M, alive * a2);
        text(ctx, 'BELL X-1 · 14 OCT 1947 · 13,100 m', 120, 230, { font: 'JetBrains Mono', size: 20, color: '#e8f2ff', align: 'left', spacing: 2, alpha: alive * a2 });
      }
    }
    // ---- 3. Comet (blueprint side elevation)
    const a3 = env(t, 11.2, 16.8, 0.6, 0.6);
    if (a3 > 0) {
      const cp = xform(parsePath(COMET), { x: 330, y: 460, s: 1.4 }), cw = xform(parsePath(COMET_WING), { x: 330, y: 460, s: 1.4 });
      const p = sseg(t, 11.2, 13.6);
      strokePolys(ctx, cp, { progress: p, width: 2, color: LINE, alpha: a3 });
      strokePolys(ctx, cw, { progress: p, width: 1.5, color: LINE, alpha: a3 });
      ctx.save(); ctx.globalAlpha = a3 * sseg(t, 12.6, 13.6); ctx.strokeStyle = LINE; ctx.lineWidth = 1.2;
      for (let i = 0; i < 16; i++) ctx.strokeRect(330 + 140 + i * 48, 460 + 24, 22, 20);  // the Comet's (early) square windows
      ctx.restore();
      dimension(ctx, 330, 560, 330 + 1260, 560, '28.35 m', sseg(t, 13, 14) * a3, 40);
      text(ctx, 'DE HAVILLAND DH.106 COMET · 2 MAY 1952', W / 2, 330, { font: 'JetBrains Mono', size: 22, color: '#e8f2ff', spacing: 3, alpha: a3 * sseg(t, 12, 13) });
      // speed band
      ctx.save(); ctx.globalAlpha = a3 * 0.5; ctx.strokeStyle = LINE; ctx.setLineDash([6, 10]);
      for (let i = 0; i < 6; i++) { ctx.beginPath(); ctx.moveTo(300 - ((t * 400 + i * 160) % 1600) + 1600, 420 + i * 22); ctx.lineTo(300 - ((t * 400 + i * 160) % 1600) + 1400, 420 + i * 22); ctx.stroke(); }
      ctx.restore();
    }
    // ---- 4. Concorde: lines → solid in the stratosphere
    const a4 = sseg(t, 16.4, 17.2);
    if (a4 > 0) {
      const strat = sseg(t, 18.2, 20.2);
      if (strat > 0) {
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#02040c'); g.addColorStop(0.55, '#0b1838'); g.addColorStop(0.8, '#3a4e7e'); g.addColorStop(0.92, '#e9a46a'); g.addColorStop(1, '#6a3a3a');
        ctx.save(); ctx.globalAlpha = strat; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
        glow(ctx, W * 0.15, H * 0.9, 700, '#ffb070', 0.4 * strat);
      }
      const lt = t - 16.4;
      conc.position.set(lt * 6, 0, 0);
      conc.rotation.set(0.05, 0, 0.04);
      look(camP, [conc.position.x - 40, 14, 70], [conc.position.x + 2, 0, 0]);
      concLines.set(strat, 1 - strat * 0.85);
      renderOutline(ctx, sceneC, camP, { width: 2, alpha: a4 * (1 - strat), fill: 'rgba(20,70,120,0.5)' });
      render3D(ctx, sceneC, camP, { alpha: a4, exposure: 1.0 });
      text(ctx, 'CONCORDE · 2 MAR 1969', 120, 230, { font: 'JetBrains Mono', size: 20, color: '#e8f2ff', align: 'left', spacing: 2, alpha: a4 * env(t, 16.6, 22, 0.5, 1) });
      machGauge(ctx, W - 240, 300, 120, lerp(1.2, 2.02, sseg(t, 17, 21)), a4 * env(t, 16.6, 23, 0.5, 1));
    }
    vignette(ctx, 0.45, '#020a14');
    grain(ctx, t, 0.05);
  },
};
