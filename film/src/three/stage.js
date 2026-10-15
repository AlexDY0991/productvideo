// Shared three.js stage: one WebGL renderer composited into the 2D film canvas,
// plus modelling helpers (lofted fuselages, airfoil wings, tubes, propellers, mannequins).
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { W, H } from '../core.js';

export { THREE };
// 3D layer is rendered without MSAA at SS× resolution and filtered down (SwiftShader MSAA is ~5× slower).
export const SS = 2;
let renderer = null, pmrem = null;
const envCache = new Map();

export function initStage() {
  if (renderer) return renderer;
  renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, preserveDrawingBuffer: true, premultipliedAlpha: false });
  renderer.setPixelRatio(1);
  renderer.setSize(W * SS, H * SS, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  pmrem = new THREE.PMREMGenerator(renderer);
  return renderer;
}
export const getRenderer = () => renderer;

export function roomEnv() {
  if (!envCache.has('room')) envCache.set('room', pmrem.fromScene(new RoomEnvironment(), 0.04).texture);
  return envCache.get('room');
}

// Environment from a vertical gradient (sky → horizon → ground), for metal reflections.
export function gradientEnv(key, top, horizon, ground, sunDir = null, sunCol = '#fff2d8') {
  if (envCache.has(key)) return envCache.get(key);
  const c = document.createElement('canvas'); c.width = 512; c.height = 256;
  const x = c.getContext('2d');
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, top); g.addColorStop(0.48, horizon); g.addColorStop(0.52, ground); g.addColorStop(1, ground);
  x.fillStyle = g; x.fillRect(0, 0, 512, 256);
  if (sunDir) {
    const gx = x.createRadialGradient(sunDir[0] * 512, sunDir[1] * 256, 0, sunDir[0] * 512, sunDir[1] * 256, 40);
    gx.addColorStop(0, sunCol); gx.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = gx; x.fillRect(0, 0, 512, 256);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  const rt = pmrem.fromEquirectangular(tex).texture;
  envCache.set(key, rt);
  return rt;
}

// Render a scene and composite it onto the 2D context.
export function render3D(ctx, scene, camera, { alpha = 1, op = 'source-over', exposure = 1.0 } = {}) {
  renderer.toneMappingExposure = exposure;
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, camera);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = alpha;
  ctx.globalCompositeOperation = op;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  if (alpha > 0) ctx.drawImage(renderer.domElement, 0, 0, W, H);
  ctx.restore();
}

export function camera(fov = 35) {
  const c = new THREE.PerspectiveCamera(fov, W / H, 0.05, 5000);
  return c;
}
export function look(cam, pos, target, up = [0, 1, 0]) {
  cam.position.set(pos[0], pos[1], pos[2]);
  cam.up.set(up[0], up[1], up[2]);
  cam.lookAt(target[0], target[1], target[2]);
  cam.updateMatrixWorld();
}

// ---------------------------------------------------------------------------
// Materials
export const mat = {
  std: (color, rough = 0.6, metal = 0, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal, ...extra }),
  phys: (color, rough = 0.3, metal = 1, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: rough, metalness: metal, ...extra }),
  basic: (color, extra = {}) => new THREE.MeshBasicMaterial({ color, ...extra }),
  line: (color, opacity = 1) => new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity }),
};

// ---------------------------------------------------------------------------
// Geometry helpers

// Loft along +X through elliptical stations: {x, w (half-width), h (half-height), z (vertical centre), top?:extra top bulge}
export function loft(stations, { seg = 32, cap = true } = {}) {
  const pos = [], idx = [];
  const rings = stations.length;
  for (let i = 0; i < rings; i++) {
    const s = stations[i];
    for (let j = 0; j <= seg; j++) {
      const a = (j / seg) * Math.PI * 2;
      const cy = Math.cos(a), sz = Math.sin(a);
      // superellipse exponent for boxier sections
      const e = s.e ?? 2;
      const fy = Math.sign(cy) * Math.pow(Math.abs(cy), 2 / e), fz = Math.sign(sz) * Math.pow(Math.abs(sz), 2 / e);
      const hh = cy > 0 ? (s.ht ?? s.h) : s.h;
      pos.push(s.x, (s.z ?? 0) + fy * hh, fz * s.w);
    }
  }
  for (let i = 0; i < rings - 1; i++) {
    for (let j = 0; j < seg; j++) {
      const a = i * (seg + 1) + j, b = a + seg + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// NACA 4-digit-like airfoil (thickness t, camber m at p). Returns upper/lower points along chord 0..1.
function airfoil(n, t = 0.12, m = 0.02, p = 0.4) {
  const up = [], lo = [];
  for (let i = 0; i <= n; i++) {
    const x = (1 - Math.cos((i / n) * Math.PI)) / 2;
    const yt = 5 * t * (0.2969 * Math.sqrt(x) - 0.126 * x - 0.3516 * x * x + 0.2843 * x ** 3 - 0.1036 * x ** 4);
    const yc = x < p ? (m / (p * p)) * (2 * p * x - x * x) : (m / ((1 - p) ** 2)) * (1 - 2 * p + 2 * p * x - x * x);
    up.push([x, yc + yt]); lo.push([x, yc - yt]);
  }
  return { up, lo };
}

// Wing panel: root at z=0, extends to +z (span). Chord runs along -X from leading edge at x=le.
// opts: root, tip (chords), span, sweep (LE offset at tip, +x = forward), dihedral (rad), t (thickness), m (camber), twist
export function wingPanel({ root = 2, tip = 1, span = 5, sweep = 0, dihedral = 0, t = 0.12, m = 0.02, le = 0, y = 0, sections = 8, n = 18, tipRound = 0 }) {
  const af = airfoil(n, t, m);
  const ring = [...af.up.slice().reverse(), ...af.lo.slice(1)];
  const pos = [], idx = [];
  const R = ring.length;
  for (let s = 0; s <= sections; s++) {
    const k = s / sections;
    let chord = root + (tip - root) * k;
    if (tipRound && k > 1 - tipRound) chord *= Math.sqrt(Math.max(0.02, 1 - Math.pow((k - (1 - tipRound)) / tipRound, 2)));
    const z = span * k;
    const lx = le + sweep * k - (root - chord) * (tipRound && k > 1 - tipRound ? 0.5 : 0);
    const yy = y + Math.tan(dihedral) * z;
    for (const [cx, cy] of ring) pos.push(lx - cx * chord, yy + cy * chord, z);
  }
  for (let s = 0; s < sections; s++) {
    for (let i = 0; i < R - 1; i++) {
      const a = s * R + i, b = a + R;
      idx.push(a, a + 1, b, b, a + 1, b + 1);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

// Mirror a geometry across the XY plane (z → -z), fixing winding.
export function mirrorZ(geo) {
  const g = geo.clone();
  g.scale(1, 1, -1);
  const index = g.getIndex();
  if (index) { const a = index.array; for (let i = 0; i < a.length; i += 3) { const tmp = a[i]; a[i] = a[i + 2]; a[i + 2] = tmp; } index.needsUpdate = true; }
  g.computeVertexNormals();
  return g;
}

export function both(geo, material) {
  const grp = new THREE.Group();
  grp.add(new THREE.Mesh(geo, material), new THREE.Mesh(mirrorZ(geo), material));
  return grp;
}

// Cylinder between two points
const _up = new THREE.Vector3(0, 1, 0);
export function strut(a, b, r, material, radial = 8) {
  const va = new THREE.Vector3(...a), vb = new THREE.Vector3(...b);
  const d = vb.clone().sub(va), L = d.length();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, L, radial, 1), material);
  m.position.copy(va).add(vb).multiplyScalar(0.5);
  m.quaternion.setFromUnitVectors(_up, d.normalize());
  return m;
}

// Tube through points (polyline with small rounding via CatmullRom when smooth)
export function tube(points, r, material, { smooth = false, seg = 64, radial = 10, closed = false } = {}) {
  const v = points.map((p) => new THREE.Vector3(...p));
  let curve;
  if (smooth) curve = new THREE.CatmullRomCurve3(v, closed, 'centripetal');
  else {
    curve = new THREE.CurvePath();
    for (let i = 0; i < v.length - 1; i++) curve.add(new THREE.LineCurve3(v[i], v[i + 1]));
  }
  const g = new THREE.TubeGeometry(curve, smooth ? seg : Math.max(1, v.length - 1) * 2, r, radial, closed);
  return new THREE.Mesh(g, material);
}

// Line segments (wires) from pairs of points
export function wires(pairs, color = 0x222222, opacity = 1) {
  const pos = [];
  for (const [a, b] of pairs) pos.push(...a, ...b);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  return new THREE.LineSegments(g, mat.line(color, opacity));
}

// Propeller: blades rotating about local X axis (thrust axis)
export function propeller({ blades = 2, radius = 1, chord = 0.12, pitch = 0.4, material, hub = 0.06 }) {
  const grp = new THREE.Group();
  for (let i = 0; i < blades; i++) {
    const b = wingPanel({ root: chord, tip: chord * 0.55, span: radius, t: 0.1, m: 0.03, sections: 6, n: 8, tipRound: 0.25 });
    b.translate(chord / 2, 0, 0);
    const m = new THREE.Mesh(b, material);
    const piv = new THREE.Group();
    m.rotation.z = Math.PI / 2;      // chord along Y→ plane of rotation
    m.rotation.y = pitch;
    piv.add(m);
    piv.rotation.x = (i / blades) * Math.PI * 2;
    grp.add(piv);
  }
  const h = new THREE.Mesh(new THREE.SphereGeometry(hub, 12, 8), material);
  grp.add(h);
  return grp;
}

// Translucent motion-blur disc for fast props/rotors
export function blurDisc(radius, color = 0xdddddd, opacity = 0.18, axis = 'x') {
  const g = new THREE.RingGeometry(radius * 0.08, radius, 48, 1);
  const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color, transparent: true, opacity, side: THREE.DoubleSide, depthWrite: false }));
  if (axis === 'x') m.rotation.y = Math.PI / 2;
  if (axis === 'y') m.rotation.x = -Math.PI / 2;
  return m;
}

// Simple articulated mannequin (capsules). Height ~1.75 units. pose angles in radians.
export function mannequin(material, { height = 1.75 } = {}) {
  const s = height / 1.75;
  const root = new THREE.Group();
  const cap = (r, l) => new THREE.Mesh(new THREE.CapsuleGeometry(r * s, l * s, 6, 10), material);
  const joint = (parent, x, y, z) => { const g = new THREE.Group(); g.position.set(x * s, y * s, z * s); parent.add(g); return g; };
  const hips = joint(root, 0, 0.95, 0);
  const pelvis = cap(0.13, 0.1); pelvis.rotation.x = Math.PI / 2; hips.add(pelvis);
  const spine = joint(hips, 0, 0.05, 0);
  const torso = cap(0.16, 0.34); torso.position.y = 0.25 * s; torso.scale.set(1, 1, 1.35); spine.add(torso);
  const neck = joint(spine, 0, 0.52, 0);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.11 * s, 16, 12), material); head.position.y = 0.13 * s; head.scale.set(1, 1.18, 0.92); neck.add(head);
  const limbs = {};
  for (const side of [-1, 1]) {
    const sh = joint(spine, 0, 0.46, side * 0.21);
    const ua = cap(0.05, 0.24); ua.position.y = -0.15 * s; sh.add(ua);
    const el = joint(sh, 0, -0.3, 0);
    const la = cap(0.045, 0.24); la.position.y = -0.15 * s; el.add(la);
    const hp = joint(hips, 0, -0.04, side * 0.1);
    const th = cap(0.075, 0.34); th.position.y = -0.22 * s; hp.add(th);
    const kn = joint(hp, 0, -0.44, 0);
    const sn = cap(0.06, 0.34); sn.position.y = -0.22 * s; kn.add(sn);
    const ft = new THREE.Mesh(new THREE.BoxGeometry(0.22 * s, 0.07 * s, 0.09 * s), material); ft.position.set(0.05 * s, -0.46 * s, 0); kn.add(ft);
    limbs[side] = { sh, el, hp, kn };
  }
  root.userData = { hips, spine, neck, limbs };
  root.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return root;
}

// Pose: { spine, neck, L:{sh:[x,z], el, hp, kn}, R:{...} } angles in radians (z = swing fore/aft)
export function poseMannequin(m, p) {
  const u = m.userData;
  u.spine.rotation.z = p.spine ?? 0;
  u.neck.rotation.z = p.neck ?? 0;
  for (const [k, side] of [['L', 1], ['R', -1]]) {
    const q = p[k] || {}, l = u.limbs[side];
    l.sh.rotation.set(q.shX ?? 0, 0, q.sh ?? 0);
    l.el.rotation.set(0, 0, q.el ?? 0);
    l.hp.rotation.set(q.hpX ?? 0, 0, q.hp ?? 0);
    l.kn.rotation.set(0, 0, q.kn ?? 0);
  }
}

export function shadowLight(color = 0xffffff, intensity = 2.5, pos = [5, 10, 4], size = 12) {
  const l = new THREE.DirectionalLight(color, intensity);
  l.position.set(...pos);
  l.castShadow = true;
  l.shadow.mapSize.set(2048, 2048);
  const c = l.shadow.camera; c.left = -size; c.right = size; c.top = size; c.bottom = -size; c.near = 0.5; c.far = 80;
  l.shadow.bias = -0.0004;
  l.shadow.radius = 4;
  return l;
}

// Canvas texture helper
export function canvasTexture(w, h, draw, { repeat = null, srgb = true } = {}) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]); }
  t.anisotropy = 4;
  return t;
}

export function castAll(obj, cast = true, receive = false) {
  obj.traverse((o) => { if (o.isMesh) { o.castShadow = cast; o.receiveShadow = receive; } });
  return obj;
}

// ---------------------------------------------------------------------------
// Line-drawing mode: every mesh gets an edge outline; meshes can become depth-only
// (hidden-line removal) or fade between solid and wireframe.
const depthOnly = new THREE.MeshBasicMaterial({ colorWrite: false });
export function lineMode(model, { color = 0xffffff, threshold = 25, opacity = 1 } = {}) {
  const lm = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthTest: true });
  const meshes = [];
  model.traverse((o) => {
    if (o.isMesh && !o.userData.edge && o.geometry) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, threshold), lm);
      e.userData.edge = true;
      e.renderOrder = 2;
      o.add(e);
      meshes.push({ mesh: o, mat: o.material, edge: e });
    }
  });
  const ctl = {
    lineMat: lm,
    // mode: 0 = lines only (hidden lines removed), 1 = solid only; between = both, lines fading
    set(mix, lineOpacity = 1) {
      for (const m of meshes) {
        m.mesh.material = mix <= 0.001 ? depthOnly : m.mat;
        m.edge.visible = lineOpacity > 0.01;
        if (mix > 0.001 && mix < 0.999) {
          const mats = Array.isArray(m.mat) ? m.mat : [m.mat];
          for (const mm of mats) { mm.transparent = true; mm.opacity = mix; }
        } else if (mix >= 0.999) {
          const mats = Array.isArray(m.mat) ? m.mat : [m.mat];
          for (const mm of mats) { mm.transparent = mm.userData?.wasTransparent ?? false; mm.opacity = 1; }
        }
      }
      lm.opacity = lineOpacity;
    },
  };
  return ctl;
}

// Project a world point to screen pixels
export function toScreen(v, cam) {
  const p = v.clone().project(cam);
  return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H, p.z];
}

// Silhouette outline (technical-drawing look): render a flat mask, dilate it, subtract the original.
let _mask = null, _out = null, _white = null;
function buf() { const c = document.createElement('canvas'); c.width = W; c.height = H; return { c, x: c.getContext('2d') }; }
export function renderOutline(ctx, scene, cam, { color = '#e8f2ff', width = 2, alpha = 1, fill = null } = {}) {
  if (alpha <= 0) return;
  if (!_mask) { _mask = buf(); _out = buf(); _white = new THREE.MeshBasicMaterial({ color: 0xffffff }); }
  const prev = scene.overrideMaterial;
  // hide invisible helpers (blur discs at opacity 0, depth-only shells) from the mask
  const hidden = [];
  scene.traverse((o) => { if ((o.isMesh || o.isLineSegments) && o.visible && o.material && !Array.isArray(o.material) && ((o.material.transparent && o.material.opacity < 0.05) || o.isLineSegments)) { o.visible = false; hidden.push(o); } });
  scene.overrideMaterial = _white;
  const tm = renderer.toneMapping; renderer.toneMapping = THREE.NoToneMapping;
  renderer.setClearColor(0x000000, 0);
  renderer.render(scene, cam);
  renderer.toneMapping = tm;
  scene.overrideMaterial = prev;
  for (const o of hidden) o.visible = true;
  const m = _mask.x; m.setTransform(1, 0, 0, 1, 0, 0); m.globalCompositeOperation = 'source-over'; m.clearRect(0, 0, W, H); m.imageSmoothingQuality = 'high'; m.drawImage(renderer.domElement, 0, 0, W, H);
  const o = _out.x; o.setTransform(1, 0, 0, 1, 0, 0); o.globalCompositeOperation = 'source-over'; o.clearRect(0, 0, W, H);
  const n = 12;
  for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; o.drawImage(_mask.c, Math.cos(a) * width, Math.sin(a) * width); }
  o.globalCompositeOperation = 'destination-out'; o.drawImage(_mask.c, 0, 0);
  o.globalCompositeOperation = 'source-in'; o.fillStyle = color; o.fillRect(0, 0, W, H);
  ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = alpha;
  if (fill) { const f = _mask.x; f.globalCompositeOperation = 'source-in'; f.fillStyle = fill; f.fillRect(0, 0, W, H); ctx.drawImage(_mask.c, 0, 0); }
  ctx.drawImage(_out.c, 0, 0);
  ctx.restore();
}
