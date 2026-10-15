// CHAPTER IX — BEYOND THE SKY. Sputnik · Gagarin · Saturn V · the Moon · Earthrise (the gaze turns back).
import { W, H, seg, sseg, smooth, env, lerp, rng, clamp, ease, TAU, fbm2, noise2, fbm3 } from '../core.js';
import { grain, vignette, text, textReveal, glow, fillRect, makeCanvas, puff } from '../gfx.js';
import { stars } from '../art/sky.js';
import { THREE, initStage, render3D, camera, look, canvasTexture, mat, toScreen } from '../three/stage.js';
import { saturnV } from '../three/models.js';
import { drawGazer, sightline } from '../art/motif.js';

let sceneE, camE, earth, clouds, sceneR, camR, rocket;

function earthTextures() {
  const w = 1024, h = 512;
  const day = makeCanvas(w, h), night = makeCanvas(w, h), cl = makeCanvas(w, h);
  const di = day.ctx.createImageData(w, h), ni = night.ctx.createImageData(w, h), ci = cl.ctx.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const lat = (y / h - 0.5) * Math.PI;
    for (let x = 0; x < w; x++) {
      const lon = (x / w) * TAU;
      const px = Math.cos(lat) * Math.cos(lon), py = Math.sin(lat), pz = Math.cos(lat) * Math.sin(lon);
      const n = fbm3(px * 1.6 + 3, py * 1.6, pz * 1.6, 5);
      const land = n > 0.04;
      const ice = Math.abs(py) > 0.86 + noise2(x * 0.05, 1) * 0.04;
      const i = (y * w + x) * 4;
      let r, g, b;
      if (ice) { r = 236; g = 240; b = 246; }
      else if (land) { const k = clamp((n - 0.04) * 4); const dry = clamp(0.5 - Math.abs(py) * 1.2 + fbm3(px * 4, py * 4, pz * 4, 2) * 0.6); r = lerp(70, 168, dry) - k * 20; g = lerp(104, 140, dry) - k * 16; b = lerp(52, 92, dry) - k * 10; }
      else { const d = clamp(-n * 3); r = lerp(26, 8, d); g = lerp(78, 34, d); b = lerp(140, 92, d); }
      di.data[i] = r; di.data[i + 1] = g; di.data[i + 2] = b; di.data[i + 3] = 255;
      const city = land && !ice && fbm3(px * 40, py * 40, pz * 40, 2) > 0.3 ? 255 : 0;
      ni.data[i] = city; ni.data[i + 1] = city * 0.8; ni.data[i + 2] = city * 0.45; ni.data[i + 3] = 255;
      const c = clamp((fbm3(px * 3 + 9, py * 5, pz * 3, 5) - 0.02) * 2.4);
      ci.data[i] = ci.data[i + 1] = ci.data[i + 2] = 255; ci.data[i + 3] = c * 235;
    }
  }
  day.ctx.putImageData(di, 0, 0); night.ctx.putImageData(ni, 0, 0); cl.ctx.putImageData(ci, 0, 0);
  const T = (c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  return { day: T(day.c), night: T(night.c), clouds: T(cl.c) };
}

function moonGround(ctx, y0, t, curve = 0.0) {
  const g = ctx.createLinearGradient(0, y0, 0, H);
  g.addColorStop(0, '#8d8a85'); g.addColorStop(0.3, '#5c5a57'); g.addColorStop(1, '#1d1c1b');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(0, H);
  for (let x = 0; x <= W; x += 16) ctx.lineTo(x, y0 + curve * Math.pow((x - W / 2) / (W / 2), 2) * 60 + noise2(x * 0.004, 3) * 14);
  ctx.lineTo(W, H); ctx.closePath(); ctx.fill();
  const R = rng(61);
  for (let i = 0; i < 60; i++) {
    const x = R() * W, yy = y0 + 20 + Math.pow(R(), 1.5) * (H - y0), r = (6 + R() * 40) * ((yy - y0) / (H - y0) + 0.2);
    ctx.fillStyle = 'rgba(20,20,20,0.35)'; ctx.beginPath(); ctx.ellipse(x, yy, r, r * 0.3, 0, 0, TAU); ctx.fill();
    ctx.strokeStyle = 'rgba(200,198,192,0.25)'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.ellipse(x, yy + r * 0.05, r, r * 0.3, 0, 0.1, Math.PI - 0.1); ctx.stroke();
  }
}

function bootprint(ctx, x, y, s, a) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s * 0.45); ctx.rotate(-0.2); ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(25,25,25,0.75)';
  ctx.beginPath(); ctx.roundRect(-70, -170, 140, 340, 60); ctx.fill();
  ctx.strokeStyle = 'rgba(180,178,172,0.55)'; ctx.lineWidth = 7;
  for (let i = 0; i < 11; i++) { ctx.beginPath(); ctx.moveTo(-58, -140 + i * 28); ctx.lineTo(58, -140 + i * 28); ctx.stroke(); }
  ctx.restore();
}

function sputnik(ctx, x, y, s, t) {
  ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.rotate(t * 0.4);
  ctx.strokeStyle = '#d8dde4'; ctx.lineWidth = 1.2;
  for (let i = 0; i < 4; i++) { const a = Math.PI * 0.75 + (i - 1.5) * 0.18; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 46, Math.sin(a) * 46); ctx.stroke(); }
  const g = ctx.createRadialGradient(-3, -3, 1, 0, 0, 9); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#8a929c');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, 9, 0, TAU); ctx.fill();
  ctx.restore();
}

function flame(ctx, x, y, s, t) {
  const R = rng(Math.floor(t * 30));
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const k = R(), len = (220 + R() * 160) * s;
    const g = ctx.createRadialGradient(x, y + len * 0.3, 0, x, y + len * 0.3, len * 0.6);
    g.addColorStop(0, 'rgba(255,250,220,0.35)'); g.addColorStop(0.4, 'rgba(255,170,70,0.18)'); g.addColorStop(1, 'rgba(255,90,20,0)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(x + (k - 0.5) * 30 * s, y + len * 0.35, 40 * s, len * 0.55, 0, 0, TAU); ctx.fill();
  }
  ctx.restore();
}

export default {
  transIn: { dur: 1.4, type: 'black' },
  caption: 'rgba(230,236,245,0.92)',
  async init() {
    initStage();
    const tx = earthTextures();
    sceneE = new THREE.Scene();
    earth = new THREE.Mesh(new THREE.SphereGeometry(10, 96, 64), new THREE.MeshStandardMaterial({ map: tx.day, roughness: 0.75, metalness: 0, emissiveMap: tx.night, emissive: 0xffc070, emissiveIntensity: 0.0 }));
    clouds = new THREE.Mesh(new THREE.SphereGeometry(10.12, 96, 64), new THREE.MeshStandardMaterial({ map: tx.clouds, transparent: true, depthWrite: false, roughness: 1 }));
    sceneE.add(earth, clouds);
    const sunL = new THREE.DirectionalLight(0xfff6e8, 3.4); sunL.position.set(-40, 6, 6); sceneE.add(sunL);
    const sunDirV = { value: new THREE.Vector3() };
    earth.material.onBeforeCompile = (sh) => {
      sh.uniforms.sunDirV = sunDirV;
      sh.fragmentShader = 'uniform vec3 sunDirV;\n' + sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n totalEmissiveRadiance *= clamp(1.0 - 4.0 * max(dot(normal, sunDirV), 0.0), 0.0, 1.0);');
    };
    earth.userData.updateSun = (cam) => { sunDirV.value.copy(sunL.position).normalize().transformDirection(cam.matrixWorldInverse); };
    sceneE.add(new THREE.AmbientLight(0x223355, 0.12));
    camE = camera(30);
    sceneR = new THREE.Scene();
    rocket = saturnV(); sceneR.add(rocket);
    sceneR.add(new THREE.HemisphereLight(0x9fb4d8, 0x221a14, 0.8));
    const kl = new THREE.DirectionalLight(0xffd8a8, 2.4); kl.position.set(40, 30, 60); sceneR.add(kl);
    camR = camera(28);
  },
  draw(ctx, t, dur) {
    ctx.fillStyle = '#020309'; ctx.fillRect(0, 0, W, H);
    // ---- A. Sputnik over a night field (0–6)
    if (t < 6.4) {
      const a = env(t, -1, 6.4, 0.5, 0.6);
      ctx.save(); ctx.globalAlpha = a;
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#02040c'); g.addColorStop(1, '#0e1a34');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      stars(ctx, t, 1);
      const k = seg(t, 0.2, 6.6), sx = lerp(260, 1760, k), sy = 300 - Math.sin(k * Math.PI) * 140;
      sputnik(ctx, sx, sy, 1.0, t);
      glow(ctx, sx, sy, 30, '#dfe8ff', 0.6);
      for (let i = 0; i < 4; i++) { const ph = ((t / 0.75) - i) % 4; if (ph < 0 || ph > 1) continue; ctx.strokeStyle = `rgba(200,220,255,${(1 - ph) * 0.5})`; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.arc(sx, sy, 14 + ph * 110, 0, TAU); ctx.stroke(); }
      ctx.fillStyle = '#04060a'; ctx.beginPath(); ctx.moveTo(0, H); ctx.lineTo(0, H - 170); ctx.quadraticCurveTo(W * 0.5, H - 250, W, H - 150); ctx.lineTo(W, H); ctx.fill();
      const gz = drawGazer(ctx, 140, H + 60, 1.0, { tilt: lerp(-0.4, -0.62, k), extra: 'short', style: 'rim', color: '#03050a', rim: '#9fb8ff', rimAlpha: 0.7 });
      sightline(ctx, gz.eye, [sx, sy], sseg(t, 0.8, 2.6), { color: '#d8e4ff', alpha: 0.75, width: 1.1 });
      text(ctx, 'SPUTNIK 1 · 4 OCT 1957 · 20.005 MHz', W - 110, 150, { font: 'JetBrains Mono', size: 20, color: '#cfe0ff', align: 'right', spacing: 2, alpha: env(t, 0.6, 6, 0.5, 0.6) });
      ctx.restore();
    }
    // ---- B. Gagarin: orbit over the Earth's limb (6–11.4)
    if (t > 5.8 && t < 11.8) {
      const a = env(t, 5.8, 11.8, 0.6, 0.6);
      earth.rotation.y = t * 0.03; clouds.rotation.y = t * 0.036;
      earth.material.emissiveIntensity = 0;
      look(camE, [0, 4.6, 14.2], [0, 9.6, 0]);
      earth.userData.updateSun(camE);
      ctx.save(); ctx.globalAlpha = a; stars(ctx, t, 0.8); ctx.restore();
      render3D(ctx, sceneE, camE, { alpha: a, exposure: 1.1 });
      // atmosphere limb glow
      ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter';
      const lg = ctx.createLinearGradient(0, H * 0.42, 0, H * 0.6); lg.addColorStop(0, 'rgba(90,150,255,0)'); lg.addColorStop(0.5, 'rgba(120,180,255,0.35)'); lg.addColorStop(1, 'rgba(90,150,255,0)');
      ctx.fillStyle = lg; ctx.fillRect(0, H * 0.42, W, H * 0.2); ctx.restore();
      // Vostok capsule crossing
      const k = seg(t, 6, 11.6), vx = lerp(W * 0.15, W * 0.85, k), vy = H * 0.3 - Math.sin(k * Math.PI) * 30;
      ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#c9ced6'; ctx.beginPath(); ctx.arc(vx, vy, 10, 0, TAU); ctx.fill();
      ctx.fillStyle = '#7b828c'; ctx.beginPath(); ctx.moveTo(vx - 8, vy + 4); ctx.lineTo(vx - 26, vy + 14); ctx.lineTo(vx - 26, vy - 6); ctx.closePath(); ctx.fill();
      glow(ctx, vx, vy, 26, '#ffffff', 0.4);
      // CRT telemetry
      ctx.globalCompositeOperation = 'source-over';
      textReveal(ctx, '«ПОЕХАЛИ!»', W / 2, H * 0.2, sseg(t, 6.8, 8.2), { font: 'JetBrains Mono', size: 64, weight: 600, color: '#9dffb0', spacing: 10, shadow: 18, shadowColor: 'rgba(80,255,140,0.5)' });
      text(ctx, 'ВОСТОК-1 · 12.04.1961 · 108 MIN', W / 2, H * 0.2 + 56, { font: 'JetBrains Mono', size: 22, color: '#9dffb0', spacing: 4, alpha: sseg(t, 8, 9) * 0.85 });
      ctx.restore();
    }
    // ---- C. Saturn V launch (11.4–14.8)
    if (t > 11.2 && t < 15.2) {
      const a = env(t, 11.2, 15.2, 0.4, 0.5);
      const lt = t - 11.4;
      const up = Math.max(0, lt - 0.6) ** 2 * 4;
      rocket.position.set(0, up, 0);
      look(camR, [0, 30 + up * 0.8, 200], [0, 50 + up * 0.9, 0]);
      ctx.save(); ctx.globalAlpha = a;
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0a1430'); g.addColorStop(0.7, '#3a3e5e'); g.addColorStop(1, '#c97a4a');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const base = toScreen(new THREE.Vector3(0, up - 3, 0), camR);
      // smoke billows at the pad
      ctx.globalCompositeOperation = 'source-over';
      const R = rng(9);
      for (let i = 0; i < 46; i++) { const sx = base[0] + (R() - 0.5) * 1500 * Math.min(1, lt * 0.7), sy = H - 40 - R() * 240 * Math.min(1, lt), s = 220 + R() * 300; ctx.globalAlpha = a * (0.5 + R() * 0.4); ctx.drawImage(puff(230), sx - s / 2, sy - s / 2, s, s * 0.8); }
      ctx.globalAlpha = a;
      ctx.restore();
      render3D(ctx, sceneR, camR, { alpha: a });
      if (lt > 0.2) flame(ctx, base[0], base[1], 1.4, t);
      glow(ctx, base[0], base[1] + 80, 600, '#ffb060', 0.5 * a);
      text(ctx, 'APOLLO 11 · SATURN V · 16 JUL 1969', W - 110, 150, { font: 'JetBrains Mono', size: 20, color: '#ffe6c8', align: 'right', spacing: 2, alpha: a });
    }
    // ---- D. The Moon: a footprint (14.6–17.6)
    if (t > 14.4 && t < 17.8) {
      const a = env(t, 14.4, 17.8, 0.5, 0.6);
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      stars(ctx, t, 0.3);
      moonGround(ctx, H * 0.38, t);
      bootprint(ctx, W * 0.52, H * 0.76, 1.15, sseg(t, 14.8, 15.6));
      // LM silhouette far away
      ctx.fillStyle = '#d8d2c2'; ctx.fillRect(W * 0.78, H * 0.33, 70, 34); ctx.fillStyle = '#c9a54a'; ctx.fillRect(W * 0.78 + 4, H * 0.33 + 34, 62, 18);
      ctx.strokeStyle = '#bbb'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(W * 0.78, H * 0.33 + 50); ctx.lineTo(W * 0.78 - 20, H * 0.33 + 80); ctx.moveTo(W * 0.78 + 70, H * 0.33 + 50); ctx.lineTo(W * 0.78 + 90, H * 0.33 + 80); ctx.stroke();
      text(ctx, 'TRANQUILITY BASE · 20 JUL 1969', W - 110, 150, { font: 'JetBrains Mono', size: 20, color: '#e6e2d8', align: 'right', spacing: 2 });
      ctx.restore();
    }
    // ---- E. Earthrise — the gaze turns back (17.2–28)
    if (t > 17.0) {
      const a = sseg(t, 17.0, 17.8);
      const rise = ease.outCubic(seg(t, 17.2, 26));
      const pull = sseg(t, 22, 28);
      earth.rotation.y = 2.2 + t * 0.02; clouds.rotation.y = 2.2 + t * 0.026;
      earth.material.emissiveIntensity = sseg(t, 25, 28) * 1.2;
      const ez = lerp(40, 70, pull);
      look(camE, [0, lerp(-3.4, 2, rise), ez], [0, lerp(-1, 1.5, rise), 0]);
      earth.userData.updateSun(camE);
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
      stars(ctx, t, 0.6);
      ctx.restore();
      render3D(ctx, sceneE, camE, { alpha: a, exposure: 1.15 });
      const ec = toScreen(new THREE.Vector3(0, 0, 0), camE);
      glow(ctx, ec[0], ec[1], 520 * (1 - pull * 0.4), '#5a9cff', 0.18 * a);
      ctx.save(); ctx.globalAlpha = a * (1 - pull);
      moonGround(ctx, H * 0.7 + pull * 300, t, 1.0);
      ctx.restore();
      // astronaut in profile, visor catching the Earth
      const gA = a * (1 - sseg(t, 24.5, 26.5));
      if (gA > 0) {
        const gz = drawGazer(ctx, -40 - pull * 200, H + 120, 1.45, { tilt: -0.22, extra: 'helmet', style: 'silhouette', color: '#0b0c0f', alpha: gA });
        glow(ctx, gz.eye[0] + 40, gz.eye[1] - 10, 40, '#7ab0ff', 0.5 * gA);
        sightline(ctx, gz.eye, [ec[0] - 40, ec[1]], sseg(t, 18.6, 20.6), { color: '#cfe2ff', alpha: env(t, 18.6, 26, 0.5, 1) * 0.85, width: 1.2 });
      }
      text(ctx, 'EARTHRISE · APOLLO 8 · 24 DEC 1968', W - 110, 150, { font: 'JetBrains Mono', size: 20, color: '#dfe8f5', align: 'right', spacing: 2, alpha: env(t, 18, 23, 0.6, 1) });
    }
    vignette(ctx, 0.5);
    grain(ctx, t, 0.06);
  },
};
