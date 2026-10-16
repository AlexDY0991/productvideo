// S8–S9: Dream exploded along its assembly axes, from the real GLB parts, in the black studio look.
// explode(t) is a pure function of segment time t (0 … 5 s): 0–2.6 s parts separate (expo-out), hold, 3.9–5.0 s they
// close on the beat (cubic-in). Parts only translate, never rotate. Camera orbits 18° over the segment.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeInCubic = (x) => x * x * x;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const lerp = (a, b, x) => a + (b - a) * x;

export async function createExplode(canvas, { base = '../../', W = 1920, H = 1080 } = {}) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setSize(W, H, false); r.setPixelRatio(1);
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x070708);
  scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.5;
  const key = new THREE.SpotLight(0xffffff, 700, 0, 0.6, 0.9, 2); key.position.set(0, 12, 3); scene.add(key);
  const rimL = new THREE.DirectionalLight(0xdfe6ff, 2.0); rimL.position.set(-8, 3, -6); scene.add(rimL);
  const rimR = new THREE.DirectionalLight(0xffffff, 1.4); rimR.position.set(8, 2.5, -5); scene.add(rimR);

  const dl = new DRACOLoader(); dl.setDecoderPath(base + 'vendor/three/addons/libs/draco/');
  const loader = new GLTFLoader(); loader.setDRACOLoader(dl);
  const gltf = await loader.loadAsync(base + 'brand/models/dream.glb');
  const src = gltf.scene;
  const drop = []; src.traverse((o) => { if (o.isCamera || o.isLight) drop.push(o); }); drop.forEach((o) => o.parent.remove(o));
  src.traverse((o) => {
    if (!o.isMesh) return;
    if (o.name === 'Plane011' || o.name === 'Plane012') o.visible = false;
    if (o.name === 'Plane010' && o.material.map) { o.material = o.material.clone(); const tx = o.material.map.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.x = -1; tx.offset.x = 1; tx.needsUpdate = true; o.material.map = tx; }
  });
  const mixer = new THREE.AnimationMixer(src); gltf.animations.forEach((a) => mixer.clipAction(a).play()); mixer.setTime(0.07);
  const inner = new THREE.Group(); inner.add(src); inner.scale.setScalar(0.1);
  const g = new THREE.Group(); g.add(inner); scene.add(g); g.updateMatrixWorld(true);
  let box = new THREE.Box3().setFromObject(inner); const c0 = box.getCenter(new THREE.Vector3());
  inner.position.set(-c0.x, -box.min.y, -c0.z); g.updateMatrixWorld(true);
  box = new THREE.Box3().setFromObject(g);
  const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());

  // Offsets come from a smooth field over the part's centre, so bolts and brackets travel with their neighbours:
  // arms/motors/props slide out along the arm; the coaxial pair at each tip splits up/down; the body opens as a
  // vertical stack (floor plates down, seat and cage up). Parts only translate.
  const smooth = (a, b, x) => { const u = clamp01((x - a) / (b - a)); return u * u * (3 - 2 * u); };
  const parts = [], tmp = new THREE.Box3(), pc = new THREE.Vector3();
  const armY = (() => { let s = 0, n = 0; g.traverse((o) => { if (!o.isMesh) return; tmp.setFromObject(o); tmp.getCenter(pc);
    if (Math.hypot(pc.x - ctr.x, pc.z - ctr.z) > 1.6) { s += pc.y; n++; } }); return n ? s / n : ctr.y; })();
  g.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    tmp.setFromObject(o); tmp.getCenter(pc);
    const dx = pc.x - ctr.x, dz = pc.z - ctr.z, h = Math.hypot(dx, dz), yn = (pc.y - box.min.y) / size.y;
    const outer = smooth(0.7, 1.3, h), tip = smooth(1.9, 2.5, h);
    const w = new THREE.Vector3(h > 1e-3 ? dx / h : 0, 0, h > 1e-3 ? dz / h : 0).multiplyScalar(0.75 * outer + 0.35 * tip);
    w.y = (1 - outer) * (yn - 0.4) * 1.5 + tip * Math.sign(pc.y - armY) * 0.34;
    const local = o.parent.worldToLocal(o.getWorldPosition(new THREE.Vector3()).add(w)).sub(o.position);
    parts.push({ o, home: o.position.clone(), delta: local });
  });
  // studio floor: dark, with the top light's pool, like the generated keyframes
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const cx = cv.getContext('2d');
  const gr = cx.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, '#2a2a2c'); gr.addColorStop(0.45, '#121213'); gr.addColorStop(1, '#070708');
  cx.fillStyle = gr; cx.fillRect(0, 0, 512, 512);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(cv) }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = box.min.y - 0.6; scene.add(floor);

  const cam = new THREE.PerspectiveCamera(26, W / H, 0.05, 200);
  const radius = size.length() / 2;
  function render(t) {
    const a = easeOutExpo(clamp01(t / 2.6)), b = easeInCubic(clamp01((t - 3.9) / 1.1));
    const k = a * (1 - b);
    for (const p of parts) p.o.position.copy(p.home).addScaledVector(p.delta, k);
    const az = THREE.MathUtils.degToRad(lerp(28, 46, clamp01(t / 5))), el = THREE.MathUtils.degToRad(lerp(20, 15, clamp01(t / 5)));
    const dist = 0.6 * radius / Math.sin(THREE.MathUtils.degToRad(cam.fov / 2));
    const tgt = ctr.clone().add(new THREE.Vector3(0, 0.05, 0));
    cam.position.set(tgt.x + dist * Math.cos(el) * Math.sin(az), tgt.y + dist * Math.sin(el), tgt.z + dist * Math.cos(el) * Math.cos(az));
    cam.lookAt(tgt);
    r.render(scene, cam);
  }
  return { render, parts: parts.length };
}
