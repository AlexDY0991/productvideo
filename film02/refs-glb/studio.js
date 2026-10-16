// Dream (GLB) in a black product studio, for identity reference renders.
// Each page sets window.VIEW = { az, el, fit, target? } before importing. Fairings recoloured pearl white (#146, #159).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const V = window.VIEW, W = 1920, H = 1080;
const r = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
r.setSize(W, H); r.setPixelRatio(V.dpr || 1);
r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.prepend(r.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(V.bg ?? 0x0b0b0c);
const pm = new THREE.PMREMGenerator(r);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.55;
const key = new THREE.SpotLight(0xffffff, 900, 0, 0.55, 0.9, 2); key.position.set(0, 14, 2); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); scene.add(key);
const rimL = new THREE.DirectionalLight(0xdfe6ff, 2.2); rimL.position.set(-8, 3, -6); scene.add(rimL);
const rimR = new THREE.DirectionalLight(0xffffff, 1.6); rimR.position.set(8, 2.5, -5); scene.add(rimR);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.ShadowMaterial({ opacity: 0.55 }));
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; floor.visible = V.floorOn !== false; scene.add(floor);

const dl = new DRACOLoader(); dl.setDecoderPath('../../vendor/three/addons/libs/draco/');
const loader = new GLTFLoader(); loader.setDRACOLoader(dl);
const gltf = await loader.loadAsync('../../brand/models/dream.glb');
const src = gltf.scene;
const drop = []; src.traverse((o) => { if (o.isCamera || o.isLight) drop.push(o); }); drop.forEach((o) => o.parent.remove(o));
const pearl = new THREE.MeshPhysicalMaterial({ color: 0xeeece8, roughness: 0.32, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.25 });
src.traverse((o) => {
  if (!o.isMesh) return;
  o.castShadow = true; o.receiveShadow = true;
  if (o.name === 'Plane011' || o.name === 'Plane012') o.visible = false;      // blank decal backs
  if (o.name === 'Plane010' && o.material.map) {                                // logo decal faces inward: mirror it
    o.material = o.material.clone(); const t = o.material.map.clone();
    t.wrapS = THREE.RepeatWrapping; t.repeat.x = -1; t.offset.x = 1; t.needsUpdate = true; o.material.map = t;
  }
  const m = o.material, col = m && m.color;
  // saturated orange-red paint (fairings) → pearl white; keeps carbon, metal, decals and LEDs
  if (V.white === true && col && !m.map) {
    const hsl = {}; col.getHSL(hsl);
    if (hsl.s > 0.6 && hsl.h < 0.1 && hsl.l > 0.15) { window.__recol = (window.__recol || 0) + 1; o.material = pearl; }
  }
});
const mixer = new THREE.AnimationMixer(src); gltf.animations.forEach((a) => mixer.clipAction(a).play()); mixer.setTime(V.propT ?? 0.07);
const g = new THREE.Group(); const inner = new THREE.Group(); inner.add(src); inner.scale.setScalar(0.1); g.add(inner); scene.add(g);
g.updateMatrixWorld(true);
let box = new THREE.Box3().setFromObject(inner); const c = box.getCenter(new THREE.Vector3());
inner.position.set(-c.x, -box.min.y + (V.lift ?? 0), -c.z);
g.updateMatrixWorld(true); box = new THREE.Box3().setFromObject(g);
const size = box.getSize(new THREE.Vector3()), ctr = box.getCenter(new THREE.Vector3());
if (V.target) ctr.set(...V.target);
const radius = size.length() / 2;
const cam = new THREE.PerspectiveCamera(V.fov ?? 24, W / H, 0.05, 200);
const az = THREE.MathUtils.degToRad(V.az), el = THREE.MathUtils.degToRad(V.el);
const dist = (V.fit ?? 1.05) * radius / Math.sin(THREE.MathUtils.degToRad(cam.fov / 2));
cam.position.set(ctr.x + dist * Math.cos(el) * Math.sin(az), ctr.y + dist * Math.sin(el), ctr.z + dist * Math.cos(el) * Math.cos(az));
cam.lookAt(ctr);
if (V.ortho) { const o = new THREE.OrthographicCamera(); }
r.render(scene, cam);
console.log('recoloured meshes', window.__recol, 'dream size m', size.toArray().map((v) => v.toFixed(2)).join(' x '));
window.__ready = true;
