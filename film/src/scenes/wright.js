// CHAPTER IV — TWELVE SECONDS. Kitty Hawk, 17 December 1903, 10:35 a.m. Silver-gelatin black & white.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, noise2, TAU } from '../core.js';
import { grain, vignette, text, filmDamage, fillRect, glow } from '../gfx.js';
import { THREE, initStage, render3D, camera, look, mat, mannequin, poseMannequin, shadowLight, canvasTexture } from '../three/stage.js';
import { wrightFlyer, spinProps } from '../three/models.js';
import { sightline } from '../art/motif.js';

let scene, cam, flyer, wilbur, ground, rail;
const LIFT = 6.5, LAND = 18.4;

function flyerX(t) {
  // roll along the rail, lift off at LIFT, fly ~36.5 m in 12 s, settle
  if (t < 2.5) return 0;
  if (t < LIFT) { const k = (t - 2.5) / (LIFT - 2.5); return k * k * 12; }
  return 12 + (Math.min(t, LAND + 1) - LIFT) * 3.05;
}
function flyerY(t) {
  if (t < LIFT) return 0.0;
  const k = clamp((t - LIFT) / (LAND - LIFT));
  return Math.sin(k * Math.PI) * 2.6 + Math.sin(k * 11) * 0.35 * Math.sin(k * Math.PI);
}

function wilburPose(m, t, running) {
  const ph = t * 8.5;
  const s = Math.sin(ph) * running;
  poseMannequin(m, {
    spine: -0.12 * running - 0.05, neck: running ? -0.2 : -0.55,
    L: { sh: s * 0.9 + (running ? 0 : 0.15), el: 0.6 + running * 0.4, hp: -s * 0.8, kn: Math.max(0, s) * 1.1 * running + 0.05 },
    R: { sh: -s * 0.9, el: 0.6 + running * 0.4, hp: s * 0.8, kn: Math.max(0, -s) * 1.1 * running + 0.05 },
  });
}

export default {
  transIn: { dur: 1.4, type: 'fade' },
  caption: 'rgba(240,236,228,0.92)',
  async init() {
    initStage();
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0xbfbcb4, 30, 170);
    scene.add(new THREE.HemisphereLight(0xeeeef0, 0xb4ae9e, 2.0));
    const sun = shadowLight(0xffffff, 1.6, [-8, 14, -6], 18);
    scene.add(sun, sun.target);
    // sand
    const sandTex = canvasTexture(1024, 1024, (x, w, h) => {
      x.fillStyle = '#b8b2a4'; x.fillRect(0, 0, w, h);
      const R = rng(5);
      for (let i = 0; i < 40000; i++) { const v = 150 + R() * 70; x.fillStyle = `rgba(${v},${v - 4},${v - 12},0.35)`; x.fillRect(R() * w, R() * h, 1 + R() * 2, 1 + R() * 2); }
      x.strokeStyle = 'rgba(120,114,100,0.25)';
      for (let i = 0; i < 70; i++) { const y0 = R() * h; x.lineWidth = 1 + R() * 2; x.beginPath(); x.moveTo(0, y0); for (let k = 0; k <= 20; k++) x.lineTo((k / 20) * w, y0 + Math.sin(k * 0.8 + i) * 6); x.stroke(); }
    }, { repeat: [40, 40] });
    ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), mat.std(0xffffff, 1, 0, { map: sandTex }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true;
    scene.add(ground);
    // the launching rail ("Grand Junction Railroad"): 60 ft of 2x4 capped with metal
    rail = new THREE.Group();
    const wood = mat.std(0x6b5a46, 0.8);
    const r = new THREE.Mesh(new THREE.BoxGeometry(18.3, 0.1, 0.1), wood); r.position.set(9.15 - 2, 0.05, 0); rail.add(r);
    const cap = new THREE.Mesh(new THREE.BoxGeometry(18.3, 0.015, 0.04), mat.std(0x444444, 0.4, 0.8)); cap.position.set(9.15 - 2, 0.105, 0); rail.add(cap);
    rail.traverse((o) => { if (o.isMesh) o.receiveShadow = o.castShadow = true; });
    scene.add(rail);
    flyer = wrightFlyer();
    scene.add(flyer);
    wilbur = mannequin(mat.std(0x2e2c2a, 0.85));
    scene.add(wilbur);
    cam = camera(32);
  },
  draw(ctx, t, dur) {
    // gate weave
    const wx = noise2(t * 7, 1) * 2.5, wy = noise2(t * 6, 9) * 2;
    ctx.save();
    ctx.translate(wx, wy);
    // --- 3D state
    const fx = flyerX(t), fy = flyerY(t);
    flyer.position.set(fx, fy, 0);
    flyer.rotation.z = t > LIFT ? Math.sin((t - LIFT) * 1.4) * 0.05 + 0.03 : 0;
    const rpm = sseg(t, 1.2, 3.0);
    spinProps(flyer, t * 40 * rpm, rpm > 0.6 ? 0.16 * rpm : 0);
    // Wilbur runs at the right wingtip, then stops and watches
    const run = t > 2.6 && t < LIFT + 1.0 ? 1 : 0;
    const wxp = Math.min(fx, 12 + 3) - 1.0;
    wilbur.position.set(t < LIFT + 1 ? wxp : 14.0, 0, 6.9);
    wilbur.rotation.y = t < LIFT + 1 ? 0 : -0.3 - sseg(t, LIFT + 1, LIFT + 4) * 0.5;
    wilburPose(wilbur, t, run);
    // --- camera: wide establishing → tracking → detail → wide landing
    let pos, tgt;
    const c1 = [[-7, 1.5, -12], [3, 1.4, 0]];
    const c2 = [[fx - 5, 1.6 + fy * 0.6, -13], [fx + 1, 1.5 + fy * 0.8, 0]];
    const c3 = [[fx - 5.6, fy + 2.9, 6.8], [fx - 0.8, fy + 1.3, 0.2]];
    const c4 = [[34, 1.3, -24], [fx, 1.6 + fy * 0.5, 0]];
    const blend = (a, b, k) => [a[0].map((v, i) => lerp(v, b[0][i], k)), a[1].map((v, i) => lerp(v, b[1][i], k))];
    let cc;
    if (t < 4.5) cc = c1;
    else if (t < 10.5) cc = blend(c1, c2, sseg(t, 4.5, 7));
    else if (t < 14.5) cc = blend(c2, c3, sseg(t, 10.5, 11.6));
    else cc = blend(c3, c4, sseg(t, 14.5, 15.8));
    [pos, tgt] = cc;
    look(cam, pos, tgt);

    // --- sky & distant dunes (2D), horizon from projection
    const hv = new THREE.Vector3(pos[0] + (tgt[0] - pos[0]) * 400, pos[1], pos[2] + (tgt[2] - pos[2]) * 400).project(cam);
    const hy = (1 - hv.y) / 2 * H;
    const sky = ctx.createLinearGradient(0, hy - 900, 0, hy);
    sky.addColorStop(0, '#8d8c8a'); sky.addColorStop(0.7, '#c9c7c2'); sky.addColorStop(1, '#d8d5ce');
    ctx.fillStyle = sky; ctx.fillRect(-10, -10, W + 20, H + 20);
    // overcast cloud streaks
    ctx.save(); ctx.globalAlpha = 0.25; ctx.filter = 'blur(14px)'; ctx.fillStyle = '#efede8';
    for (let i = 0; i < 8; i++) { ctx.beginPath(); ctx.ellipse(((i * 420 + t * 8) % (W + 600)) - 300, hy - 200 - (i * 97) % 380, 380, 30, 0, 0, TAU); ctx.fill(); }
    ctx.restore();
    // Kill Devil Hill on the horizon
    ctx.fillStyle = '#a9a59b';
    ctx.beginPath(); ctx.moveTo(-10, hy + 2);
    for (let x = -10; x <= W + 10; x += 20) ctx.lineTo(x, hy - 18 - Math.max(0, Math.sin((x - 900 + pos[2] * 6) / 420)) * 70 - noise2(x * 0.004, 2) * 12);
    ctx.lineTo(W + 10, hy + 2); ctx.closePath(); ctx.fill();
    render3D(ctx, scene, cam, { exposure: 1.05 });
    ctx.restore();

    // --- gaze: Wilbur watching the machine in the air
    if (t > LIFT + 1 && t < LAND) {
      const eye = new THREE.Vector3(wilbur.position.x + 0.05, 1.65, wilbur.position.z).project(cam);
      const tgtv = new THREE.Vector3(fx - 0.9, fy + 1.6, 0).project(cam);
      if (eye.z < 1 && tgtv.z < 1) {
        sightline(ctx, [(eye.x + 1) / 2 * W, (1 - eye.y) / 2 * H], [(tgtv.x + 1) / 2 * W, (1 - tgtv.y) / 2 * H], sseg(t, LIFT + 1.2, LIFT + 3), { color: '#ffffff', alpha: env(t, LIFT + 1.2, 10.4, 0.4, 0.5) * 0.85, width: 1.2 });
      }
    }

    // --- black & white silver print
    ctx.save();
    ctx.globalCompositeOperation = 'saturation'; ctx.fillStyle = '#808080'; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'color'; ctx.globalAlpha = 0.18; ctx.fillStyle = '#a08560'; ctx.fillRect(0, 0, W, H);
    ctx.restore();
    const flick = filmDamage(ctx, t, 1.2);
    fillRect(ctx, '#000', clamp((1 - flick) * 2, 0, 0.12));
    vignette(ctx, 0.62, '#000', 0.36);
    grain(ctx, t, 0.16, 1.8);

    // --- typewriter readouts
    const tw = { font: 'Special Elite', size: 30, color: '#f2efe8', align: 'left', spacing: 2 };
    text(ctx, 'KITTY HAWK, N.C.   DEC. 17, 1903   10:35 A.M.', 96, H - 180, { ...tw, size: 24, alpha: env(t, 0.8, 6, 0.6, 0.8) * 0.9 });
    const airT = clamp(t - LIFT, 0, 12.0), dist = Math.min(120, Math.max(0, (fx - 12) / 36.5 * 120));
    const ra = env(t, LIFT - 0.3, dur - 0.2, 0.4, 0.6);
    if (ra > 0) {
      text(ctx, `TIME      ${airT.toFixed(1).padStart(4, '0')} s`, W - 470, 150, { ...tw, alpha: ra });
      text(ctx, `DISTANCE  ${String(Math.round(dist)).padStart(3, ' ')} ft`, W - 470, 194, { ...tw, alpha: ra });
      text(ctx, `ENGINE    12 hp`, W - 470, 238, { ...tw, alpha: ra * 0.75 });
    }
    // freeze: the photograph
    const fz = sseg(t, LAND + 0.1, LAND + 0.5);
    if (fz > 0) {
      fillRect(ctx, '#fff', (1 - Math.abs(fz - 0.5) * 2) * 0.5);
      ctx.save(); ctx.strokeStyle = 'rgba(245,242,235,0.9)'; ctx.lineWidth = 26 * fz; ctx.strokeRect(13 * fz, 13 * fz, W - 26 * fz, H - 26 * fz); ctx.restore();
    }
  },
};
