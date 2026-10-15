// CoolFly aircraft: Urban and Dream, both loaded from the supplied GLB models.
import { THREE, mat, blurDisc, mannequin, poseMannequin } from './stage.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { LOGO } from '../logo-data.js';

export const ORANGE = '#ff5a00';

// Draw the traced CoolFly wordmark into a 2D context (x, y = top-left, width w)
export function drawLogo(ctx, x, y, w, { dark = '#000', orange = ORANGE, alpha = 1 } = {}) {
  ctx.save();
  ctx.globalAlpha *= alpha;
  for (const [key, col] of [['dark', dark], ['orange', orange]]) {
    ctx.fillStyle = col;
    ctx.beginPath();
    for (const poly of LOGO[key]) { poly.forEach(([px, py], i) => (i ? ctx.lineTo(x + px * w, y + py * w) : ctx.moveTo(x + px * w, y + py * w))); ctx.closePath(); }
    ctx.fill('evenodd');
  }
  ctx.restore();
}

// ---------------------------------------------------------------------------
// URBAN — standing personal eVTOL, from the supplied GLB.
let urbanGltf = null;
export async function loadUrban(base) {
  if (urbanGltf) return urbanGltf;
  urbanGltf = await new GLTFLoader().loadAsync(`${base}assets/models/urban.glb`);
  return urbanGltf;
}

// Returns a group with the model sitting on y=0, centred in x/z, plus an animation driver.
export function urban(gltf, { rider = true } = {}) {
  const src = gltf.scene.clone(true);
  const g = new THREE.Group();
  const box = new THREE.Box3().setFromObject(src);
  const c = box.getCenter(new THREE.Vector3());
  src.position.sub(new THREE.Vector3(c.x, box.min.y, c.z));
  g.add(src);
  src.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; if (o.material) { o.material = o.material.clone(); o.material.envMapIntensity = 1.0; } } });
  const mixer = new THREE.AnimationMixer(src);
  const clips = gltf.animations.map((a) => { const act = mixer.clipAction(a); act.play(); return act; });
  const size = box.getSize(new THREE.Vector3());
  let man = null;
  if (rider) {
    man = mannequin(mat.std(0x1f2124, 0.65), { height: 1.78 });
    poseMannequin(man, { spine: 0.02, neck: -0.05, L: { sh: 0.85, shX: 0.18, el: 0.95, hp: 0.04, kn: -0.08 }, R: { sh: 0.85, shX: -0.18, el: 0.95, hp: 0.04, kn: -0.08 } });
    man.rotation.y = Math.PI / 2;           // faces -Z (Urban's forward)
    man.position.set(0, 0.43, -0.5);
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), mat.phys(0x15161a, 0.25, 0.3, { clearcoat: 1 }));
    helmet.position.y = 0.15; man.userData.neck.add(helmet);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.152, 20, 14, -0.9, 1.8, 1.0, 0.9), mat.phys(0x2a3a4c, 0.05, 0.9, { clearcoat: 1 }));
    visor.position.y = 0.15; visor.rotation.y = Math.PI; man.userData.neck.add(visor);
    g.add(man);
  }
  g.userData = { mixer, clips, size, rider: man, src };
  return g;
}
export function setUrbanTime(model, t) { model.userData.mixer.setTime(t); }

// ---------------------------------------------------------------------------
// DREAM from the supplied GLB (Draco-compressed, decimetre units, nose toward +Z).
let dreamGltf = null;
export async function loadDream(base) {
  if (dreamGltf) return dreamGltf;
  const dl = new DRACOLoader();
  dl.setDecoderPath(`${base}vendor/three/addons/libs/draco/`);
  const loader = new GLTFLoader();
  loader.setDRACOLoader(dl);
  dreamGltf = await loader.loadAsync(`${base}assets/models/dream.glb`);
  return dreamGltf;
}

// Returns a group in metres sitting on y=0, nose toward -Z (same forward axis as Urban), with optional pilot.
export function dreamGLB(gltf, { pilot = true } = {}) {
  const src = gltf.scene.clone(true);
  const drop = [];
  src.traverse((o) => { if (o.isCamera || o.isLight) drop.push(o); });
  drop.forEach((o) => o.parent && o.parent.remove(o));
  const inner = new THREE.Group();
  inner.add(src);
  inner.scale.setScalar(0.1);
  inner.rotation.y = Math.PI;                 // nose → -Z
  const g = new THREE.Group();
  g.add(inner);
  g.updateMatrixWorld(true);
  const box = new THREE.Box3().setFromObject(inner);
  inner.position.y = -box.min.y;
  src.traverse((o) => {
    if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    // side decals: Plane011/012 are blank backs; Plane010's logo faces inward, so mirror its texture
    if (o.name === 'Plane011' || o.name === 'Plane012') o.visible = false;
    if (o.name === 'Plane010' && o.material && o.material.map) {
      o.material = o.material.clone();
      const tx = o.material.map.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.x = -1; tx.offset.x = 1; tx.needsUpdate = true;
      o.material.map = tx;
    }
  });
  const mixer = new THREE.AnimationMixer(src);
  gltf.animations.forEach((a) => mixer.clipAction(a).play());
  // motion-blur discs at each animated propeller group
  g.updateMatrixWorld(true);
  const discs = [];
  const animated = new Set(gltf.animations.flatMap((a) => a.tracks.map((tr) => tr.name.split('.')[0])));
  src.traverse((o) => {
    if (!animated.has(o.name)) return;
    const b = new THREE.Box3().setFromObject(o), c = b.getCenter(new THREE.Vector3()), sz = b.getSize(new THREE.Vector3());
    const d = blurDisc(Math.max(sz.x, sz.z) / 2, 0xc9ced6, 0, 'y');
    d.position.copy(c);
    g.add(d); discs.push(d);
  });
  let man = null;
  if (pilot) {
    man = mannequin(mat.std(0x23252a, 0.7), { height: 1.75 });
    poseMannequin(man, { spine: -0.18, neck: 0.12, L: { sh: 0.75, shX: 0.1, el: 0.85, hp: 1.5, kn: -1.45 }, R: { sh: 0.6, shX: -0.1, el: 1.15, hp: 1.5, kn: -1.45 } });
    man.rotation.y = Math.PI / 2;            // faces -Z
    const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.15, 20, 14), mat.phys(0x15161a, 0.25, 0.3, { clearcoat: 1 }));
    helmet.position.y = 0.15; man.userData.neck.add(helmet);
    const visor = new THREE.Mesh(new THREE.SphereGeometry(0.152, 20, 14, -0.9, 1.8, 1.0, 0.9), mat.phys(0x2a3a4c, 0.05, 0.9, { clearcoat: 1 }));
    visor.position.y = 0.15; visor.rotation.y = Math.PI; man.userData.neck.add(visor);
    man.position.set(0, -0.08, 0.7);
    g.add(man);
  }
  g.userData = { mixer, rider: man, src, inner, discs, duration: gltf.animations[0]?.duration || 1, size: new THREE.Box3().setFromObject(g).getSize(new THREE.Vector3()) };
  return g;
}
// speed: propeller animation playback rate; blur: opacity of the motion discs (blades hidden when strong)
export function setDreamTime(model, t, { speed = 1, blur = 0 } = {}) {
  const u = model.userData;
  u.mixer.setTime((t * speed) % u.duration);
  for (const d of u.discs) d.material.opacity = blur;
}
