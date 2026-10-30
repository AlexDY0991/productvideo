// Dream (GLB) cockpit prop renders for film03 step 1. Same studio as film02/refs-glb/studio.js,
// but driven from render.mjs: window.shot({pos, target, fov, bg}) renders, window.pick(x, y) names the mesh under a pixel,
// window.tint(names, hex) marks meshes (e.g. the right side-stick). Units: metres after the 0.1 scale, floor at y = 0.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const W = 1920, H = 1080;
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
r.setSize(W, H);
r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(r.domElement);

const scene = new THREE.Scene();
const pm = new THREE.PMREMGenerator(r);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.7;
const key = new THREE.SpotLight(0xffffff, 900, 0, 0.55, 0.9, 2); key.position.set(0, 14, 2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key);
const rimL = new THREE.DirectionalLight(0xdfe6ff, 2.2); rimL.position.set(-8, 3, -6); scene.add(rimL);
const rimR = new THREE.DirectionalLight(0xffffff, 1.6); rimR.position.set(8, 2.5, -5); scene.add(rimR);
const fill = new THREE.DirectionalLight(0xffffff, 1.2); fill.position.set(0, 6, 8); scene.add(fill);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.35 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);

const dl = new DRACOLoader(); dl.setDecoderPath('../../../vendor/three/addons/libs/draco/');
const loader = new GLTFLoader(); loader.setDRACOLoader(dl);
const gltf = await loader.loadAsync('../../../brand/models/dream.glb');
const src = gltf.scene;
const drop = []; src.traverse((o) => { if (o.isCamera || o.isLight) drop.push(o); }); drop.forEach((o) => o.parent.remove(o));
// real product: pearl-white fairings, black roll cage (brand/refs/45°侧视外观特写.png)
const pearl = new THREE.MeshPhysicalMaterial({ color: 0xeeece8, roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25 });
const cage = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.45, metalness: 0.3 });
src.traverse((o) => {
  if (!o.isMesh) return;
  o.castShadow = true; o.receiveShadow = true;
  if (o.name === 'Plane011' || o.name === 'Plane012') o.visible = false;
  if (o.name === 'Plane010' && o.material.map) {
    o.material = o.material.clone(); const t = o.material.map.clone();
    t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; t.needsUpdate = true; o.material.map = t;
  }
  const m = o.material, col = m && m.color;
  if (col && !m.map) {
    const hsl = {}; col.getHSL(hsl);
    if (hsl.s > 0.6 && hsl.h < 0.1 && hsl.l > 0.15 && !/^SHELL/.test(o.name)) o.material = pearl;   // keep the orange F of the CoolFly lettering
  }
  if (m && (m.name === 'Material #847' || m.name === 'Material #850')) o.material = cage;   // tube frame, mounts → black as on the real aircraft
  // race-livery fairing textures (orange paint, "05"/"20" numbers) → plain pearl white like the real aircraft; no "05" anywhere
  if (m && /^Material #279111/.test(m.name)) o.material = pearl;
});
const mixer = new THREE.AnimationMixer(src); gltf.animations.forEach((a) => mixer.clipAction(a).play()); mixer.setTime(0.07);
const g = new THREE.Group(); const inner = new THREE.Group(); inner.add(src); inner.scale.setScalar(0.1); g.add(inner); scene.add(g);
g.updateMatrixWorld(true);
let box = new THREE.Box3().setFromObject(inner); const c = box.getCenter(new THREE.Vector3());
inner.position.set(-c.x, -box.min.y, -c.z);
g.updateMatrixWorld(true); box = new THREE.Box3().setFromObject(g);

const cam = new THREE.PerspectiveCamera(30, W / H, 0.02, 200);
const ray = new THREE.Raycaster();
const tinted = new Map();

window.info = () => ({ min: box.min.toArray(), max: box.max.toArray() });
window.shot = (v) => {
  scene.background = new THREE.Color(v.bg ?? 0x5c5c5e);
  floor.visible = v.floor !== false;
  cam.fov = v.fov ?? 30; cam.updateProjectionMatrix();
  cam.position.set(...v.pos); cam.up.set(...(v.up ?? [0, 1, 0])); cam.lookAt(new THREE.Vector3(...v.target));
  r.render(scene, cam);
  return true;
};
window.pick = (x, y) => {
  ray.setFromCamera(new THREE.Vector2((x / W) * 2 - 1, -(y / H) * 2 + 1), cam);
  return ray.intersectObject(g, true).slice(0, 4).map((h) => {
    const b = new THREE.Box3().setFromObject(h.object);
    return { mat: h.object.material.name, name: h.object.name, parent: h.object.parent && h.object.parent.name, point: h.point.toArray().map((n) => +n.toFixed(3)),
      box: [b.min.toArray().map((n) => +n.toFixed(3)), b.max.toArray().map((n) => +n.toFixed(3))] };
  });
};
// all meshes whose world box centre lies inside [min, max]
window.within = (min, max) => {
  const out = []; const q = new THREE.Box3(new THREE.Vector3(...min), new THREE.Vector3(...max));
  g.traverse((o) => { if (o.isMesh) { const b = new THREE.Box3().setFromObject(o); if (q.containsPoint(b.getCenter(new THREE.Vector3()))) out.push(o.name); } });
  return out;
};
window.tint = (names, hex) => {
  const set = new Set(names);
  g.traverse((o) => {
    if (!o.isMesh) return;
    if (set.has(o.name)) { if (!tinted.has(o)) tinted.set(o, o.material); o.material = new THREE.MeshStandardMaterial({ color: hex, emissive: hex, emissiveIntensity: 0.35, roughness: 0.5 }); }
    else if (tinted.has(o) && hex !== null) { /* keep earlier tints */ }
  });
  if (hex === null) { tinted.forEach((m, o) => { o.material = m; }); tinted.clear(); }
  return set.size;
};
// project world points to pixels (for drawing labels afterwards)
window.project = (pts) => pts.map((p) => { const v = new THREE.Vector3(...p).project(cam); return [+(((v.x + 1) / 2) * W).toFixed(1), +(((1 - v.y) / 2) * H).toFixed(1), v.z < 1]; });
window.__ready = true;
