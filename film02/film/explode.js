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

export async function createExplode(canvas, opts = {}) {
  const { base = '../../', W = 1920, H = 1080 } = opts;
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
  // Rule-based groups in model space (metres, x = width, z = length, nose at +z), measured from the GLB:
  // arms + motors + props outside |x| 0.75 slide out along their own axis and the coaxial pair splits up/down;
  // nose and tail fairings move fore/aft; side panels move sideways; seat rises; the roll-cage top lifts;
  // the floor plates drop. Everything else (the main rails) stays: that is the reference the eye holds on to.
  const parts = [], tmp = new THREE.Box3(), pc = new THREE.Vector3();
  const textured = (m) => !!(m && m.map);
  g.traverse((o) => {
    if (!o.isMesh || !o.visible) return;
    tmp.setFromObject(o); tmp.getCenter(pc);
    const m = inner.worldToLocal(pc.clone()).multiplyScalar(0.1);      // model space in metres
    const w = new THREE.Vector3();
    if (Math.abs(m.x) >= 0.75) {
      const dir = new THREE.Vector3(m.x, 0, m.z - Math.sign(m.z) * 0.6).normalize();
      const r = Math.hypot(m.x, m.z);
      w.addScaledVector(dir, 0.5 + (r > 2.6 ? 0.25 : 0));
      if (r > 2.6) w.y = m.y > -0.27 ? 0.3 : -0.3;
    } else if (textured(o.material) || (o.material && o.material.name === 'Material #278')) {
      if (m.z > 1.3) w.set(0, 0.12, 0.6);
      else if (m.z < -1.3) w.set(0, 0.12, -0.6);
      else w.set(Math.sign(m.x) * 0.45, 0.05, 0);
    } else if (m.y > 0.12 && m.y < 0.4 && Math.abs(m.z) < 1.2 && o.material && /#2825274|#2825331/.test(o.material.name)) {
      w.set(0, 0.55, 0);                                                // seat
    } else if (m.y > 0.05) {
      w.set(0, 0.85, 0);                                                // roll-cage top
    } else if (m.y < -0.6) {
      w.set(0, -0.5, 0);                                                // floor plates
    }
    const local = o.parent.worldToLocal(o.getWorldPosition(new THREE.Vector3()).add(w)).sub(o.position);
    parts.push({ o, home: o.position.clone(), delta: local });
  });
  // Engineering line-art look: matte near-black solids + feature edges (bone; orange on the painted fairings).
  if (opts.lineArt) {
    const solid = new THREE.MeshStandardMaterial({ color: 0x17171a, roughness: 0.5, metalness: 0.25, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
    const boneLine = new THREE.LineBasicMaterial({ color: 0xf2efea, transparent: true, opacity: 0.85 });
    const signalLine = new THREE.LineBasicMaterial({ color: 0xff5a00, transparent: true, opacity: 0.9 });
    for (const p of parts) {
      const o = p.o, painted = o.material && /#2791|#278$/.test(o.material.name || '');   // fairings only (#2821 is carbon)
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 28), painted ? signalLine : boneLine);
      o.add(edges);
      o.material = solid;
    }
  }
  // studio floor: dark, with the top light's pool, like the generated keyframes
  const cv = document.createElement('canvas'); cv.width = cv.height = 512; const cx = cv.getContext('2d');
  const gr = cx.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, '#161618'); gr.addColorStop(0.35, '#0c0c0d'); gr.addColorStop(1, '#070708');
  cx.fillStyle = gr; cx.fillRect(0, 0, 512, 512);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(26, 26), new THREE.MeshBasicMaterial({ map: Object.assign(new THREE.CanvasTexture(cv), { colorSpace: THREE.SRGBColorSpace }), toneMapped: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = box.min.y - 0.6; floor.visible = !opts.lineArt; scene.add(floor);

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
