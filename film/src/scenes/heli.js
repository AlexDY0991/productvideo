// CHAPTER VIII — VERTICAL. Sikorsky VS-300, 1939: an exploded view assembles, the rotor spins up,
// Leonardo's aerial screw returns as a ghost, and the machine rises straight up.
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU } from '../core.js';
import { grain, vignette, text, glow, fillRect, strokePolys } from '../gfx.js';
import { THREE, initStage, render3D, camera, look, roomEnv, shadowLight, toScreen, mat } from '../three/stage.js';
import { vs300 } from '../three/models.js';
import { sightline } from '../art/motif.js';

let scene, cam, heli, floor, grid;
const AMBER = '#ffb45a';

function callout(ctx, from, to, label, sub, a) {
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.strokeStyle = AMBER; ctx.fillStyle = AMBER; ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.arc(from[0], from[1], 4, 0, TAU); ctx.fill();
  const k = sseg(a, 0, 1);
  ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(lerp(from[0], to[0], k), lerp(from[1], to[1], k)); ctx.lineTo(lerp(from[0], to[0], k) + (to[0] > from[0] ? 180 : -180) * k, to[1]); ctx.stroke();
  const tx = to[0] + (to[0] > from[0] ? 8 : -8), al = to[0] > from[0] ? 'left' : 'right';
  text(ctx, label, tx, to[1] - 10, { font: 'JetBrains Mono', size: 19, weight: 600, color: '#ffe2b8', align: al, spacing: 2 });
  text(ctx, sub, tx, to[1] + 22, { font: 'JetBrains Mono', size: 15, color: '#ffcf96', align: al, alpha: 0.8 });
  ctx.restore();
}

// Ghost of Leonardo's vite aerea, drawn in sepia around the rotor hub
function ghostScrew(ctx, cx, cy, s, rot, a) {
  if (a <= 0) return;
  ctx.save(); ctx.translate(cx, cy); ctx.scale(s, s); ctx.globalAlpha = a;
  ctx.strokeStyle = '#d9b07a'; ctx.lineWidth = 2;
  const R = 260, Hh = 300, tilt = 0.3;
  ctx.beginPath();
  for (let i = 0; i <= 140; i++) { const k = i / 140, th = k * 1.15 * TAU + rot; const x = Math.cos(th) * R * (1 - k * 0.15), y = -60 - k * Hh + Math.sin(th) * R * tilt * (1 - k * 0.15); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
  ctx.stroke();
  ctx.lineWidth = 0.8;
  for (let i = 0; i <= 140; i += 4) { const k = i / 140, th = k * 1.15 * TAU + rot; const x = Math.cos(th) * R * (1 - k * 0.15), y = -60 - k * Hh + Math.sin(th) * R * tilt * (1 - k * 0.15); ctx.beginPath(); ctx.moveTo(0, -80 - k * Hh); ctx.lineTo(x, y); ctx.stroke(); }
  ctx.beginPath(); ctx.ellipse(0, 0, 200, 60, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

export default {
  transIn: { dur: 1.4, type: 'fade' },
  caption: 'rgba(255,226,184,0.95)',
  async init() {
    initStage();
    scene = new THREE.Scene();
    scene.environment = roomEnv();
    scene.add(new THREE.HemisphereLight(0xffe8d0, 0x101418, 0.5));
    const key = shadowLight(0xffe2c0, 3.2, [6, 14, 8], 10); scene.add(key, key.target);
    const rim = new THREE.DirectionalLight(0x8ab4ff, 1.4); rim.position.set(-8, 6, -10); scene.add(rim);
    scene.fog = new THREE.Fog(0x07080a, 14, 34);
    floor = new THREE.Mesh(new THREE.CircleGeometry(60, 64), mat.std(0x0c0d10, 0.55, 0.2, { envMapIntensity: 0.25 })); floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    grid = new THREE.GridHelper(40, 40, 0x6a4a28, 0x2e2a26); grid.position.y = 0.005; grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);
    heli = vs300(); scene.add(heli);
    cam = camera(34);
  },
  draw(ctx, t, dur) {
    ctx.fillStyle = '#07080a'; ctx.fillRect(0, 0, W, H);
    glow(ctx, W * 0.5, H * 0.45, 900, '#3a2a1c', 0.6, 'source-over');
    const u = heli.userData;
    const explode = 1 - sseg(t, 0.4, 4.0);
    const spin = sseg(t, 4.2, 7.0);
    const lift = ease.inOutSine(seg(t, 8.2, dur + 1.5));
    u.rotor.position.y = 2.32 + explode * 3.2; u.rdisc.position.y = u.rotor.position.y;
    u.pilot.position.set(0.55 + explode * 1.8, -0.27 + explode * 0.8, explode * 1.5);
    u.tr.position.set(-6.25 - explode * 1.5, 1.05, 0.12 + explode * 0.6);
    const ang = (t - 4) * 22 * spin * spin;
    u.rotor.rotation.y = ang; u.rdisc.material.opacity = spin * 0.28; u.rotor.visible = spin < 0.8;
    u.tr.rotation.z = ang * 4;
    heli.position.y = lift * 6;
    heli.rotation.y = 0.35;
    grid.material.opacity = 0.35 * (1 - sseg(t, 9, 12));
    // orbiting camera, then tilting up with the lift
    const orb = -0.6 + t * 0.07;
    const dist = 13 + explode * 5;
    look(cam, [Math.cos(orb) * dist, 3.2 + lift * 3 + explode * 1.5, Math.sin(orb) * dist], [-1.5, 1.4 + lift * 5.6 + explode * 1.2, 0]);
    render3D(ctx, scene, cam, { exposure: 1.05 });
    // downwash dust ring
    if (spin > 0.4 && t < 13) {
      const c = toScreen(new THREE.Vector3(0, 0.02, 0), cam);
      ctx.save(); ctx.globalCompositeOperation = 'lighter';
      for (let i = 0; i < 4; i++) { const k = ((t * 0.9 + i / 4) % 1); ctx.strokeStyle = `rgba(255,210,160,${(1 - k) * 0.12 * spin})`; ctx.lineWidth = 10; ctx.beginPath(); ctx.ellipse(c[0], c[1], 120 + k * 600, (120 + k * 600) * 0.28, 0, 0, TAU); ctx.stroke(); }
      ctx.restore();
    }
    // callouts on the exploded view
    const hub = toScreen(new THREE.Vector3(0.2, u.rotor.position.y + heli.position.y, 0), cam);
    const tail = toScreen(new THREE.Vector3(-6.3 - explode * 1.5, 1.0 + heli.position.y, 0), cam);
    const eng = toScreen(new THREE.Vector3(-0.3, 0.6 + heli.position.y, 0), cam);
    const ca = env(t, 0.8, 7.5, 0.6, 0.8);
    callout(ctx, hub, [hub[0] + 160, hub[1] - 80], 'MAIN ROTOR', 'Ø 8.5 m · 3 BLADES', ca);
    callout(ctx, tail, [tail[0] - 120, tail[1] - 120], 'ANTI-TORQUE ROTOR', 'SINGLE TAIL ROTOR', ca * sseg(t, 1.2, 2));
    callout(ctx, eng, [eng[0] + 220, eng[1] + 160], 'LYCOMING 75 HP', 'BELT + GEAR DRIVE', ca * sseg(t, 1.8, 2.6));
    text(ctx, 'VS-300 · STRATFORD, CONN. · 14 SEP 1939', 120, 230, { font: 'JetBrains Mono', size: 20, color: '#ffe2b8', align: 'left', spacing: 2, alpha: env(t, 1, 12, 0.6, 1) });
    // Leonardo's screw returns over the spinning rotor
    ghostScrew(ctx, hub[0], hub[1] + 40, 0.9, -ang * 0.05, env(t, 5.6, 10.2, 1.2, 1.4) * 0.7);
    // the pilot looks up at the rotor
    if (t > 6 && t < 11) {
      const head = u.pilot.userData.neck.getWorldPosition(new THREE.Vector3()); head.y += 0.18;
      const e = toScreen(head, cam);
      sightline(ctx, [e[0], e[1]], [hub[0], hub[1]], sseg(t, 6.2, 7.6), { color: '#ffe8c8', alpha: env(t, 6.2, 11, 0.4, 0.6) * 0.85, width: 1.2 });
    }
    vignette(ctx, 0.6, '#000', 0.35);
    grain(ctx, t, 0.06);
  },
};
