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

// ── Dream Pro update (user's 2026 product render): parachute pod, 3 belly airbags, skid gear, sensors ──
// Built in g's frame (pilot faces +z, pilot's right = -x), then the whole aircraft is lifted onto the skids.
const LIFT = 0.28; window.LIFT = LIFT;
const shellW = new THREE.MeshPhysicalMaterial({ color: 0xf1f0ec, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.3 });
const blk = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.5, metalness: 0.2 });
const rubber = new THREE.MeshStandardMaterial({ color: 0x0c0c0c, roughness: 0.85 });
const seatG = new THREE.MeshStandardMaterial({ color: 0x5a5a59, roughness: 0.9 });
const strap = new THREE.MeshStandardMaterial({ color: 0x111112, roughness: 0.9 });
src.traverse((o) => {
  if (!o.isMesh) return;
  if (/BREP_077$|D947E9F6A009$|2D7A1F477588$|EA3D935BC002$/.test(o.name)) o.material = seatG;   // seat cushion + back: light grey
  if (o.material.name === 'Material #144') o.material = strap;                                   // harness: black
});
const pro = new THREE.Group(); g.add(pro);
const put = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.rotation.set(rx, ry, rz);
  m.castShadow = m.receiveShadow = true; pro.add(m); return m;
};
// faceted pod: side profile (z, y) with chamfered lower corners, extruded across x, small bevel
const pod = (w, h, l, ch) => {
  const s2 = new THREE.Shape();
  s2.moveTo(-l / 2, h); s2.lineTo(l / 2, h); s2.lineTo(l / 2, ch); s2.lineTo(l / 2 - ch * 1.6, 0);
  s2.lineTo(-l / 2 + ch * 1.6, 0); s2.lineTo(-l / 2, ch); s2.closePath();
  const geo = new THREE.ExtrudeGeometry(s2, { depth: w - 0.06, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.025, bevelSegments: 3 });
  geo.translate(0, 0, -(w - 0.06) / 2); geo.rotateY(Math.PI / 2);   // profile now in (z, y), width along x
  return geo;
};
// airbags in g coords (ground is at y = -LIFT): front under the footwell/nose, middle under the seat cradle, rear under the tail
put(pod(0.80, 0.24, 0.80, 0.08), shellW, 0, 0.08, 1.72);
put(pod(0.70, 0.17, 0.82, 0.06), shellW, 0, -0.17, 0.0);
put(pod(0.80, 0.26, 0.78, 0.08), shellW, 0, 0.16, -1.62);
// whole-aircraft parachute pod on the rear of the roof, above the headrest
const chute = new THREE.Shape(); chute.moveTo(-0.30, 0); chute.lineTo(0.22, 0); chute.quadraticCurveTo(0.32, 0, 0.32, 0.10);
chute.lineTo(0.30, 0.14); chute.quadraticCurveTo(0.27, 0.20, 0.12, 0.21); chute.lineTo(-0.24, 0.21); chute.quadraticCurveTo(-0.30, 0.21, -0.30, 0.15); chute.closePath();
const cg = new THREE.ExtrudeGeometry(chute, { depth: 0.66, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.03, bevelSegments: 4 });
cg.translate(0, 0, -0.33); cg.rotateY(Math.PI / 2);
put(cg, shellW, 0, 2.27, -0.78);
// skid landing gear: two straight skids with spring bumpers at both ends, inverted-V struts up to the cradle
const ground = -LIFT, R = 0.028;
for (const sx of [-0.62, 0.62]) {
  put(new THREE.CylinderGeometry(R, R, 2.5, 20), blk, sx, ground + R, 0.05, Math.PI / 2);
  for (const end of [-1, 1]) {
    const z0 = 0.05 + end * 1.25;
    for (let k = 0; k < 9; k++) put(new THREE.TorusGeometry(R + 0.012, 0.009, 8, 20), rubber, sx, ground + R, z0 + end * (0.02 + k * 0.022));
    put(new THREE.CylinderGeometry(R * 1.25, R * 1.25, 0.13, 20), rubber, sx, ground + R, z0 + end * 0.29, Math.PI / 2);
  }
  for (const sz of [-0.75, 0.8]) {   // strut from skid to cradle bottom (x ±0.40, y ≈ 0.02, z ±0.25)
    const a = new THREE.Vector3(sx, ground + R, sz), b = new THREE.Vector3(Math.sign(sx) * 0.40, 0.03, Math.sign(sz) * 0.25);
    const len = a.distanceTo(b), mid = a.clone().add(b).multiplyScalar(0.5);
    const m = put(new THREE.CylinderGeometry(0.022, 0.022, len, 14), blk, mid.x, mid.y, mid.z);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  }
}
// sensor pucks on the roof tubes (roof top ≈ 2.24 at z -0.9 falling to 1.86 at z 1.2) and a dome camera at the nose
const roofY = (z) => 2.24 - (z + 0.9) * 0.183 + 0.03;
for (const [x, z] of [[0.36, 1.15], [-0.36, 1.15], [0.36, 0.35], [-0.36, 0.35]]) {
  put(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 20), blk, x, roofY(z) + 0.025, z);
  put(new THREE.CylinderGeometry(0.055, 0.05, 0.11, 24), rubber, x, roofY(z) + 0.105, z);
}
put(new THREE.BoxGeometry(0.14, 0.03, 0.14), blk, 0.22, 1.29, 1.95);
put(new THREE.SphereGeometry(0.05, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0xc8ccd2, roughness: 0.08, metalness: 0.9 }), 0.22, 1.305, 1.95);
g.position.y = LIFT;
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
// first hit along a ray, for measuring the frame: hit([x,y,z],[dx,dy,dz]) → {mat, point}
window.hit = (o, dir) => {
  const rc = new THREE.Raycaster(new THREE.Vector3(...o), new THREE.Vector3(...dir).normalize());
  const h = rc.intersectObject(g, true)[0];
  return h ? { mat: h.object.material.name, name: h.object.name.slice(-12), point: h.point.toArray().map((n) => +n.toFixed(3)) } : null;
};
