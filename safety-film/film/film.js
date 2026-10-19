// 酷飞 Dream Pro · 安全：一镜到底的尺度俯冲。所有状态都是时间 t 的纯函数，window.seek(t) 逐帧确定性渲染。
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const W = 1920, H = 1080, ASPECT = W / H;
const TL = await (await fetch('../timeline.json')).json();
const DUR = TL.duration;

// ───────── 小工具 ─────────
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sm = (x) => ((x = clamp01(x)), x * x * (3 - 2 * x));
const smoother = (x) => ((x = clamp01(x)), x * x * x * (x * (x * 6 - 15) + 10));
const ramp = (t, t0, d = 0.6) => sm((t - t0) / d);
const win = (t, a, b, d = 0.4) => ramp(t, a, d) * (1 - ramp(t, b, d));
const mix = (a, b, x) => a + (b - a) * x;
const burst = (age, rise = 0.06, fall = 0.5) => (age < 0 ? 0 : age < rise ? sm(age / rise) : Math.exp(-(age - rise) / fall));
const DEG = Math.PI / 180;
const sceneOf = (id) => TL.scenes.find((s) => s.id === id);
function cue(id, line, word, off = 0) {
  const l = sceneOf(id).lines[line];
  const i = l.text.indexOf(word);
  if (i < 0) throw new Error(`cue ${id}.${line} "${word}"`);
  return l.start + ((l.end - l.start) * i) / l.text.length + off;
}
const C = {
  layers: cue('open', 1, '三层'),
  motorsStart: sceneOf('motors').start,
  arms: cue('motors', 1, '四根机臂'),
  coax: cue('motors', 1, '上下两两'),
  fail: cue('motors', 2, '失效'),
  adjust: cue('motors', 2, '飞控即时'),
  still: cue('motors', 2, '依然能够'),
  battStart: sceneOf('battery').start,
  battShare: cue('battery', 0, '共同供电'),
  battFault: cue('battery', 1, '一组出现'),
  battLand: cue('battery', 1, '安全降落'),
  fcStart: sceneOf('fc').start,
  fcTwo: cue('fc', 0, '两台飞控'),
  fcVoter: cue('fc', 0, '表决器'),
  fcFault: cue('fc', 1, '异常'),
  fcSwitch: cue('fc', 1, '毫秒级'),
  fcImu: cue('fc', 2, '三组 IMU'),
  fcNone: cue('fc', 2, '没有哪一个'),
  activeStart: sceneOf('active').start,
  monitor: cue('active', 1, '姿态'),
  intervene: cue('active', 1, '提前介入'),
  boundary: cue('active', 2, '安全边界'),
  passiveStart: sceneOf('passive').start,
  accident: cue('passive', 1, '意外'),
  chute: cue('passive', 1, '降落伞'),
  bags: cue('passive', 1, '机身安全气囊'),
  pilot: cue('passive', 2, '驾驶员'),
  suit: cue('passive', 2, '安全气囊服'),
  helmet: cue('passive', 2, '头盔'),
  endStart: sceneOf('end').start,
};

// ───────── 渲染器与影棚 ─────────
const canvas = document.getElementById('c');
const r = new THREE.WebGLRenderer({ canvas, antialias: !new URLSearchParams(location.search).has('noaa'), preserveDrawingBuffer: true });
r.setSize(W, H, false); r.setPixelRatio(1);
r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.0; r.outputColorSpace = THREE.SRGBColorSpace;
r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap; r.shadowMap.autoUpdate = false;
const scene = new THREE.Scene();
const BG = new THREE.Color(0x050506);
scene.background = BG;
scene.fog = new THREE.Fog(0x050506, 12, 42);
scene.environment = new THREE.PMREMGenerator(r).fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.38;
const KEY_I = 360;
const key = new THREE.SpotLight(0xffffff, KEY_I, 0, 0.62, 0.95, 1.6);
key.position.set(2.5, 13, 5); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.camera.near = 4; key.shadow.camera.far = 40;
scene.add(key, key.target);
const rim = new THREE.DirectionalLight(0xdfe6ff, 2.4); rim.position.set(-8, 4, -7); scene.add(rim);
const rim2 = new THREE.DirectionalLight(0xffffff, 1.2); rim2.position.set(9, 3, -4); scene.add(rim2);
const fill = new THREE.DirectionalLight(0xffe6d2, 0.45); fill.position.set(4, 2, 9); scene.add(fill);

const floorMat = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.78, metalness: 0.0, transparent: true });
const floor = new THREE.Mesh(new THREE.CircleGeometry(80, 96), floorMat);
floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
const grid = new THREE.GridHelper(60, 60, 0x232328, 0x17171b);
grid.material.transparent = true; grid.material.opacity = 0.7; grid.position.y = 0.003; scene.add(grid);

// ───────── 发光材质（X 光 / 全息） ─────────
function holoMat(color, { depthTest = false, base = 0.14 } = {}) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 }, uTime: { value: 0 }, uBase: { value: base } },
    vertexShader: `varying vec3 vN; varying vec3 vW;
      void main(){ vec4 w = modelMatrix*vec4(position,1.); vW = w.xyz; vN = normalize(mat3(modelMatrix)*normal); gl_Position = projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uTime; uniform float uBase; varying vec3 vN; varying vec3 vW;
      void main(){ vec3 v = normalize(cameraPosition - vW); float f = pow(1.0 - abs(dot(normalize(vN), v)), 2.2);
        float scan = 0.5 + 0.5*sin(dot(vW, vec3(0.0, 1.0, 0.0))*260.0 - uTime*5.0);
        float a = (uBase + 0.95*f + 0.06*scan) * uOpacity;
        gl_FragColor = vec4(uColor*a, a); }`,
    transparent: true, depthTest, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  });
}
const ghostMat = holoMat(0x8fb8d8, { depthTest: true, base: 0.02 });
const HOLO = [];   // 所有全息材质，统一推进 uTime
const holo = (c, o) => { const m = holoMat(c, o); HOLO.push(m); return m; };
function lineMat(color) {
  return new THREE.ShaderMaterial({
    uniforms: { uColor: { value: new THREE.Color(color) }, uOpacity: { value: 0 }, uTime: { value: 0 }, uDash: { value: 0.08 }, uSpeed: { value: 0.6 } },
    vertexShader: `attribute float lineDistance; varying float vD; void main(){ vD = lineDistance; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uOpacity; uniform float uTime; uniform float uDash; uniform float uSpeed; varying float vD;
      void main(){ float p = fract((vD - uTime*uSpeed)/uDash); float a = (0.35 + 0.65*smoothstep(0.0,0.15,p)*(1.0-smoothstep(0.45,0.6,p))) * uOpacity; gl_FragColor = vec4(uColor*a, a); }`,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  });
}
const LINES = [];
const lineM = (c) => { const m = lineMat(c); LINES.push(m); return m; };
function polyline(points, mat) {
  const g = new THREE.BufferGeometry().setFromPoints(points.map((p) => new THREE.Vector3(...p)));
  const l = new THREE.Line(g, mat); l.computeLineDistances(); l.layers.set(2); l.renderOrder = 10; return l;
}

// ───────── Dream 模型（缩放到真实尺寸：机身长 3,850 mm）─────────
const dl = new DRACOLoader(); dl.setDecoderPath('../vendor/three/addons/libs/draco/');
const loader = new GLTFLoader(); loader.setDRACOLoader(dl);
// 渲染用减面版（tools/lite.mjs 生成）；?full 用原始模型对比
const gltf = await loader.loadAsync(new URLSearchParams(location.search).has('full') ? '../models/dream.glb' : '../models/dream-lite.glb');
const src = gltf.scene;
const drop = []; src.traverse((o) => { if (o.isCamera || o.isLight) drop.push(o); }); drop.forEach((o) => o.parent.remove(o));
const S = 0.1 * 0.717;
const AC = new THREE.Group();           // 位置（悬停高度、漂移）
const TILT = new THREE.Group();         // 姿态
const inner = new THREE.Group();
AC.add(TILT); TILT.add(inner); inner.add(src); inner.scale.setScalar(S); scene.add(AC);
src.updateMatrixWorld(true);
{
  const box = new THREE.Box3().setFromObject(inner);
  const c0 = box.getCenter(new THREE.Vector3());
  inner.position.set(-c0.x, -box.min.y, -c0.z);
}
AC.updateMatrixWorld(true);
const acMats = new Set();
src.traverse((o) => {
  if (!o.isMesh) return;
  if (o.name === 'Plane011' || o.name === 'Plane012') { o.visible = false; return; }
  if (o.name === 'Plane010' && o.material.map) { o.material = o.material.clone(); const tx = o.material.map.clone(); tx.wrapS = THREE.RepeatWrapping; tx.repeat.x = -1; tx.offset.x = 1; tx.needsUpdate = true; o.material.map = tx; }
  o.castShadow = true; o.receiveShadow = true; o.layers.enable(1);
  acMats.add(o.material);
});
const matState = [...acMats].map((m) => ({ m, transparent: m.transparent, opacity: m.opacity, depthWrite: m.depthWrite }));
// 静态部件按材质合并成少数几个网格（700+ 次绘制 → 约 40 次）；桨叶组和电池要单独动，保留原样
const KEEP = new Set(['组169', '组167', '组175', '组178', '组188', '组186', '组198', '组196', '输入163', '输入164', '输入165', '输入166']);
{
  const keep = (o) => { for (let p = o; p && p !== src; p = p.parent) if (KEEP.has(p.name)) return true; return false; };
  const toSrc = new THREE.Matrix4().copy(src.matrixWorld).invert();
  const groups = new Map(), merged = [];
  src.traverse((o) => {
    if (!o.isMesh || !o.visible || keep(o)) return;
    const mx = new THREE.Matrix4().multiplyMatrices(toSrc, o.matrixWorld);
    const g = o.geometry.clone().applyMatrix4(mx);
    for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv'].includes(k)) g.deleteAttribute(k);
    if (!g.index) g.setIndex([...Array(g.attributes.position.count).keys()]);
    if (mx.determinant() < 0) { const a = g.index.array; for (let i = 0; i < a.length; i += 3) [a[i + 1], a[i + 2]] = [a[i + 2], a[i + 1]]; }   // 镜像件翻转绕序
    const sig = o.material.uuid + '|' + Object.keys(g.attributes).sort().join();
    if (!groups.has(sig)) groups.set(sig, { mat: o.material, list: [] });
    groups.get(sig).list.push(g); merged.push(o);
  });
  for (const o of merged) o.parent.remove(o);
  for (const { mat, list } of groups.values()) {
    const m = new THREE.Mesh(mergeGeometries(list), mat);
    m.castShadow = true; m.receiveShadow = true; m.layers.enable(1); src.add(m);
  }
  src.updateMatrixWorld(true);
}
// 模型坐标（probe 单位 = 0.1 缩放）→ 机体局部坐标（米）
const P = (x, y, z) => new THREE.Vector3(x * 0.717, y * 0.717, z * 0.717);

// 八个桨叶：上层绕 +z 转，下层反转（共轴对转）
const PROPS = ['组169', '组167', '组175', '组178', '组188', '组186', '组198', '组196'].map((name) => {
  const o = src.getObjectByName(name);
  return { name, o, base: o.quaternion.clone(), up: Math.abs(o.quaternion.z) < 0.1 };
});
const FAIL = PROPS.findIndex((p) => p.name === '组198');        // 右前上
const PARTNER = PROPS.findIndex((p) => p.name === '组196');     // 右前下
const pairPos = (name) => { const v = new THREE.Vector3(); src.getObjectByName(name).getWorldPosition(v); return AC.worldToLocal(v); };
const FR_UP = pairPos('组198'), FR_LO = pairPos('组196');
const FR_MID = FR_UP.clone().add(FR_LO).multiplyScalar(0.5);
const MOTORS = PROPS.map((p) => pairPos(p.name));
// 桨盘光环：失效电机红色，其余电机补偿时橙色
const ringFail = holo(0xff3b30, { base: 0.5 }), ringComp = holo(0xff7a2a, { base: 0.35 });
MOTORS.forEach((m, i) => {
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.98, 0.006, 8, 160), i === FAIL ? ringFail : ringComp);
  ring.rotation.x = Math.PI / 2; ring.position.copy(m); ring.layers.set(2); TILT.add(ring);
});

// ───────── 电池（模型里前后两组电池盒）─────────
const BATT = { front: ['输入164', '输入165'], rear: ['输入163', '输入166'] };
const battHolo = {};
for (const [k, names] of Object.entries(BATT)) {
  const mat = holo(0x9fd6ff);
  battHolo[k] = { mat, meshes: names.map((n) => { const o = src.getObjectByName(n); const h = new THREE.Mesh(o.geometry, mat); h.layers.set(2); o.add(h); return o; }) };
}
const battCenter = (k) => { const b = new THREE.Box3(); battHolo[k].meshes.forEach((m) => b.expandByObject(m)); return AC.worldToLocal(b.getCenter(new THREE.Vector3())); };
const BF = battCenter('front'), BR = battCenter('rear');
// 供电线：前电池沿机身到四根机臂根部，再到电机
const flowMat = lineM(0xff7a2a);
const flowLines = new THREE.Group(); TILT.add(flowLines);
for (const m of [MOTORS[0], MOTORS[2], MOTORS[4], MOTORS[6]]) {
  const root = new THREE.Vector3(Math.sign(m.x) * 0.55, m.y - 0.25, m.z * 0.95);
  flowLines.add(polyline([[BF.x, BF.y + 0.05, BF.z], [0, BF.y + 0.1, root.z * 0.5], [root.x, root.y, root.z], [m.x, m.y - 0.22, m.z]], flowMat));
}

// ───────── NA80 × 2（真实外形 93.2 × 66.1 × 35.2 mm；安装位置为示意）─────────
const silver = new THREE.MeshStandardMaterial({ color: 0xb8bbc1, metalness: 0.85, roughness: 0.3 });
const darkAl = new THREE.MeshStandardMaterial({ color: 0x1b1c1f, metalness: 0.6, roughness: 0.45 });
const blackPlastic = new THREE.MeshStandardMaterial({ color: 0x141416, metalness: 0.2, roughness: 0.6 });
const gold = new THREE.MeshStandardMaterial({ color: 0xd8a84a, metalness: 1, roughness: 0.25 });
const redAl = new THREE.MeshStandardMaterial({ color: 0xb3241c, metalness: 0.7, roughness: 0.35 });
const pcbMat = new THREE.MeshStandardMaterial({ color: 0x0f1613, metalness: 0.1, roughness: 0.7 });
// 主板顶面：走线、过孔、丝印（画布 x → 板 +x，画布 y → 板 +z）
function pcbTexture(BW, BD, z0) {
  const CW = 1024, CH = Math.round((CW * BD) / BW);
  const c = document.createElement('canvas'); c.width = CW; c.height = CH; const x = c.getContext('2d');
  const X = (v) => (v / BW + 0.5) * CW, Z = (v) => ((v - z0) / BD + 0.5) * CH, MM = CW / (BW * 1000);
  let seed = 11; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  x.fillStyle = '#0c1d16'; x.fillRect(0, 0, CW, CH);
  const pads = [[-0.012, -0.014], [0.014, -0.024], [0.012, -0.004], [0.012, 0.008], [-0.006, 0.014], [0.0, -0.03], [-0.02, 0.006], [0.022, 0.018], [-0.022, -0.03], [0, 0.0346]];
  x.lineCap = 'round'; x.lineJoin = 'round';
  for (let i = 0; i < 70; i++) {
    const [ax, az] = pads[Math.floor(rnd() * pads.length)], [bx, bz] = pads[Math.floor(rnd() * pads.length)];
    const o = (rnd() - 0.5) * 0.006;
    x.strokeStyle = rnd() < 0.8 ? '#1c4632' : '#2a5c41'; x.lineWidth = (0.15 + rnd() * 0.25) * MM;
    x.beginPath(); x.moveTo(X(ax + o), Z(az)); x.lineTo(X(ax + o), Z((az + bz) / 2 + o)); x.lineTo(X(bx), Z((az + bz) / 2 + o)); x.lineTo(X(bx), Z(bz)); x.stroke();
  }
  for (let i = 0; i < 160; i++) { const px = (rnd() - 0.5) * BW * 0.9, pz = z0 + (rnd() - 0.5) * BD * 0.9; x.fillStyle = '#8a7036'; x.beginPath(); x.arc(X(px), Z(pz), 0.35 * MM, 0, 7); x.fill(); x.fillStyle = '#0c1d16'; x.beginPath(); x.arc(X(px), Z(pz), 0.15 * MM, 0, 7); x.fill(); }
  for (const [hx, hz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const px = hx * (BW / 2 - 0.0035), pz = z0 + hz * (BD / 2 - 0.0035); x.fillStyle = '#b39248'; x.beginPath(); x.arc(X(px), Z(pz), 2.2 * MM, 0, 7); x.fill(); x.fillStyle = '#050505'; x.beginPath(); x.arc(X(px), Z(pz), 1.4 * MM, 0, 7); x.fill(); }
  x.strokeStyle = '#d9d9d0'; x.fillStyle = '#d9d9d0'; x.lineWidth = 0.18 * MM; x.textBaseline = 'middle';
  const box = (cx, cz, w, d, label, lx = 0, lz = 0) => {
    x.strokeRect(X(cx - w / 2), Z(cz - d / 2), w * CW / BW, d * CH / BD);
    if (label) { x.font = `500 ${1.6 * MM}px "JetBrains Mono"`; x.fillText(label, X(cx + lx), Z(cz + lz)); }
  };
  box(-0.012, -0.014, 0.021, 0.021, 'CPU', -0.0105, -0.0125);
  box(0.014, -0.024, 0.023, 0.011, '', 0, 0);
  box(0.012, -0.004, 0.0085, 0.0085, 'IMU1', 0.0055, 0);
  box(0.012, 0.008, 0.0085, 0.0085, 'IMU2', 0.0055, 0);
  box(-0.006, 0.014, 0.0085, 0.0085, 'IMU3', -0.0165, 0);
  x.font = `700 ${3 * MM}px "Barlow Condensed"`; x.fillText('NA80', X(-0.026), Z(0.022));
  x.font = `500 ${1.4 * MM}px "JetBrains Mono"`; x.fillText('COOLFLY  REV A', X(-0.026), Z(0.027));
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
await Promise.all(['500 20px "JetBrains Mono"', '700 20px "Barlow Condensed"'].map((f) => document.fonts.load(f)));
const pcbTop = new THREE.MeshStandardMaterial({ map: pcbTexture(0.0601, 0.0812, -0.004), metalness: 0.15, roughness: 0.55 });
const chipMat = new THREE.MeshStandardMaterial({ color: 0x101012, metalness: 0.3, roughness: 0.4 });
function chamfered(w, h0, h, len, c) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2, h0); s.lineTo(w / 2, h0); s.lineTo(w / 2, h - c); s.lineTo(w / 2 - c, h); s.lineTo(-w / 2 + c, h); s.lineTo(-w / 2, h - c); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  g.translate(0, 0, -len / 2); return g;
}
function makeNA80() {
  const L = 0.0932, Wd = 0.0661, Hh = 0.0352, T = 0.008;
  const g = new THREE.Group();
  const tray = new THREE.Mesh(new THREE.BoxGeometry(Wd, T, L - 0.003), darkAl); tray.position.set(0, T / 2, -0.0015); g.add(tray);
  for (const sx of [-1, 1]) for (const sz of [-0.022, 0.022]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.0025, 0.016), darkAl); ear.position.set(sx * (Wd / 2 + 0.0045), 0.00125, sz); g.add(ear); }
  const board = new THREE.Mesh(new THREE.BoxGeometry(Wd - 0.006, 0.0016, L - 0.012), [pcbMat, pcbMat, pcbTop, pcbMat, pcbMat, pcbMat]); board.position.set(0, T + 0.0008, -0.004); g.add(board);
  const top = T + 0.0016;
  const cpu = new THREE.Mesh(new THREE.BoxGeometry(0.018, 0.0024, 0.018), chipMat); cpu.position.set(-0.012, top + 0.0012, -0.014); g.add(cpu);
  const ram = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.0018, 0.008), chipMat); ram.position.set(0.014, top + 0.0009, -0.024); g.add(ram);
  const imus = [[0.012, -0.004], [0.012, 0.008], [-0.006, 0.014]].map(([x, z]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.0065, 0.0016, 0.0065), chipMat); m.position.set(x, top + 0.0008, z); g.add(m); return m; });
  for (const [x, z] of [[0.0, -0.03], [-0.02, 0.006], [0.022, 0.018], [-0.022, -0.03]]) { const c = new THREE.Mesh(new THREE.BoxGeometry(0.0035, 0.0012, 0.0018), new THREE.MeshStandardMaterial({ color: 0x8a6a3a, metalness: 0.4, roughness: 0.5 })); c.position.set(x, top + 0.0006, z); g.add(c); }
  const header = new THREE.Mesh(new THREE.BoxGeometry(0.036, 0.016, 0.009), blackPlastic); header.position.set(0, T + 0.0016 + 0.008, L / 2 - 0.012); g.add(header);
  const lid = new THREE.Mesh(chamfered(Wd, T, Hh, L - 0.003, 0.006), silver); lid.position.z = -0.0015; lid.castShadow = true; g.add(lid);
  const bulk = new THREE.Mesh(chamfered(Wd, 0, Hh, 0.003, 0.006), silver); bulk.position.z = L / 2 - 0.0015; g.add(bulk);
  for (const y of [0.012, 0.024]) {
    const plug = new THREE.Mesh(new THREE.BoxGeometry(0.028, 0.0092, 0.01), blackPlastic); plug.position.set(0, y, L / 2 + 0.005); g.add(plug);
    for (const x of [-0.0112, 0.0112]) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.0017, 0.0017, 0.0024, 12), silver); s.rotation.x = Math.PI / 2; s.position.set(x, y, L / 2 + 0.0112); g.add(s); }
  }
  for (const x of [-0.025, 0.025]) {
    const sma = new THREE.Mesh(new THREE.CylinderGeometry(0.0023, 0.0023, 0.008, 14), gold); sma.rotation.x = Math.PI / 2; sma.position.set(x, 0.028, L / 2 + 0.004); g.add(sma);
    const pit = new THREE.Mesh(new THREE.CylinderGeometry(0.0015, 0.0015, 0.009, 12), redAl); pit.rotation.x = Math.PI / 2; pit.position.set(x, 0.0095, L / 2 + 0.0045); g.add(pit);
  }
  const ledMat = new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xff5a00, emissiveIntensity: 0 });
  const led = new THREE.Mesh(new THREE.CylinderGeometry(0.0022, 0.0022, 0.0008, 16), ledMat); led.position.set(Wd / 2 - 0.01, Hh + 0.0004, L / 2 - 0.013); lid.add(led); led.position.z += 0.0015;
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { g, lid, ledMat, imus, L, Wd, Hh };
}
const FC_MOUNT = P(0, 0.47, 0.22);
const fcGroup = new THREE.Group(); fcGroup.position.copy(FC_MOUNT); TILT.add(fcGroup);
const plate = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.003, 0.2), new THREE.MeshStandardMaterial({ color: 0x1e1f22, roughness: 0.5, metalness: 0.4 }));
plate.position.set(0, -0.0015, 0.035); fcGroup.add(plate);
const NA = [makeNA80(), makeNA80()];
NA[0].g.position.set(-0.045, 0, 0); NA[1].g.position.set(0.045, 0, 0);
NA.forEach((u) => fcGroup.add(u.g));
const fcHolo = NA.map((u) => { const m = holo(0xffb070); const h = new THREE.Mesh(new THREE.BoxGeometry(u.Wd, u.Hh, u.L), m); h.position.y = u.Hh / 2; h.layers.set(2); u.g.add(h); return m; });
fcGroup.visible = true;
// 三组 IMU 互相校验（接管后的从飞控）
const IMU_U = NA[1];
const imuLink = lineM(0xff7a2a); imuLink.uniforms.uDash.value = 0.004; imuLink.uniforms.uSpeed.value = 0.01;
const imuLinkBad = lineM(0xff3b30); imuLinkBad.uniforms.uDash.value = 0.004; imuLinkBad.uniforms.uSpeed.value = 0.01;
{
  const p = IMU_U.imus.map((m) => m.position.clone().add(new THREE.Vector3(0, 0.0012, 0)));
  IMU_U.g.add(polyline([p[0], p[1]].map((v) => v.toArray()), imuLink));
  IMU_U.g.add(polyline([p[1], p[2]].map((v) => v.toArray()), imuLinkBad));
  IMU_U.g.add(polyline([p[2], p[0]].map((v) => v.toArray()), imuLinkBad));
}
const imuGlow = IMU_U.imus.map((m, i) => { const mat = holo(i === 2 ? 0xff3b30 : 0xff9a50, { base: 0.12 }); const h = new THREE.Mesh(m.geometry, mat); h.scale.set(1.3, 1.6, 1.3); h.layers.set(2); m.add(h); return mat; });
// 双机同步线
const syncMat = lineM(0xe8e8e4); syncMat.uniforms.uDash.value = 0.012; syncMat.uniforms.uSpeed.value = 0.03;
fcGroup.add(polyline([[-0.045, 0.0352, 0.03], [0, 0.05, 0.03], [0.045, 0.0352, 0.03]], syncMat));
// 表决器（外形示意）：主、从两路输出都接到这里，由它监测双机健康、仲裁哪一路送往执行机构
const VOTER = [0, 0, 0.098];
function voterLabel() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 280; const x = c.getContext('2d');
  x.fillStyle = '#1b1c1f'; x.fillRect(0, 0, 512, 280);
  x.strokeStyle = '#ff5a00'; x.lineWidth = 6; x.beginPath(); x.moveTo(0, 6); x.lineTo(512, 6); x.stroke();
  x.fillStyle = '#d9d9d0'; x.textAlign = 'center'; x.textBaseline = 'middle';
  x.font = '700 92px "Barlow Condensed"'; x.fillText('VOTER', 256, 92);
  x.font = '500 40px "JetBrains Mono"'; x.fillText('A', 116, 214); x.fillText('B', 396, 214);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t;
}
const voter = new THREE.Group(); voter.position.set(...VOTER); fcGroup.add(voter);
const voterLed = [0, 1].map(() => new THREE.MeshStandardMaterial({ color: 0x222222, emissive: 0xff5a00, emissiveIntensity: 0 }));
const voterHolo = holo(0xffb070);
{
  const body = new THREE.Mesh(chamfered(0.056, 0, 0.02, 0.034, 0.004), darkAl); body.castShadow = true; body.receiveShadow = true; voter.add(body);
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.046, 0.025), new THREE.MeshStandardMaterial({ map: voterLabel(), roughness: 0.5, metalness: 0.2 }));
  label.rotation.x = -Math.PI / 2; label.position.y = 0.0201; voter.add(label);
  // 灯在标签上 A / B 字样旁边
  [-1, 1].forEach((sx, i) => { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.0008, 16), voterLed[i]); l.position.set(sx * 0.0115 + 0.0045, 0.0204, 0.0068); voter.add(l); });
  const h = new THREE.Mesh(new THREE.BoxGeometry(0.056, 0.02, 0.034), voterHolo); h.position.y = 0.01; h.layers.set(2); voter.add(h);
}
// 控制通道：主 → 表决器（在控，橙）、从 → 表决器（热备，白），表决器 → 执行机构
const pathA = lineM(0xff7a2a), pathB = lineM(0xe8e8e4), pathOut = lineM(0xff7a2a);
for (const m of [pathA, pathB, pathOut]) { m.uniforms.uDash.value = 0.01; m.uniforms.uSpeed.value = 0.04; }
fcGroup.add(polyline([[-0.045, 0.018, 0.057], [-0.045, 0.018, 0.07], [-0.014, 0.01, 0.081]], pathA));
fcGroup.add(polyline([[0.045, 0.018, 0.057], [0.045, 0.018, 0.07], [0.014, 0.01, 0.081]], pathB));
fcGroup.add(polyline([[0, 0.01, 0.115], [0, 0.006, 0.135], [0, -0.04, 0.2]], pathOut));

// ───────── 降落伞（后舱圆桶，示意）─────────
const CAN = P(0, 1.38, -1.33);
const canHoloMat = holo(0x9fd6ff);
const canister = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 40, 1, true), canHoloMat);
canister.position.copy(CAN); canister.layers.set(2); TILT.add(canister);
const capMat = new THREE.MeshStandardMaterial({ color: 0x2a2b2f, metalness: 0.5, roughness: 0.4, transparent: true });
const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.03, 40), capMat); cap.position.copy(CAN).add(new THREE.Vector3(0, 0.165, 0)); cap.visible = false; TILT.add(cap);
function gores() {
  const c = document.createElement('canvas'); c.width = 512; c.height = 8; const x = c.getContext('2d');
  for (let i = 0; i < 16; i++) { x.fillStyle = i % 2 ? '#e9e7e2' : '#ff5a00'; x.fillRect((i * 512) / 16, 0, 512 / 16 + 1, 8); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const canopyMat = new THREE.MeshStandardMaterial({ map: gores(), roughness: 0.85, metalness: 0, side: THREE.DoubleSide, transparent: true });
const CANOPY_R = 3.6;
const canopy = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 16, 0, Math.PI * 2, 0, Math.PI * 0.42), canopyMat);
canopy.castShadow = true; scene.add(canopy); canopy.visible = false;
const shroud = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xb8b8b4, transparent: true, opacity: 0.8 }));
scene.add(shroud); shroud.visible = false;

// ───────── 安全气囊（机体底部，示意）─────────
const bagMat = new THREE.MeshStandardMaterial({ color: 0x2b4ea6, roughness: 0.82, metalness: 0 });
const bags = new THREE.Group(); TILT.add(bags);
for (const [x, w] of [[-0.42, 0.62], [0.42, 0.62]]) { const b = new THREE.Mesh(new RoundedBoxGeometry(w, 0.5, 2.9, 6, 0.24), bagMat); b.position.set(x, -0.2, 0.02); b.castShadow = true; bags.add(b); }
for (const z of [-1.3, 1.3]) { const b = new THREE.Mesh(new RoundedBoxGeometry(1.5, 0.46, 0.6, 6, 0.22), bagMat); b.position.set(0, -0.2, z); b.castShadow = true; bags.add(b); }
bags.visible = false;

// ───────── 驾驶员（全息示意）：安全气囊服 + 头盔 ─────────
const pilot = new THREE.Group(); TILT.add(pilot); pilot.visible = false;
const bodyMat = holo(0x9fd6ff, { base: 0.1 }), suitMat = holo(0xff7a2a, { base: 0.14 }), helmetMat = holo(0xe8e8e4, { base: 0.16 });
const UP = new THREE.Vector3(0, 1, 0);
function limb(a, b, r, mat, parent = pilot) {
  const A = P(...a), B = P(...b), d = B.clone().sub(A);
  const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, d.length(), 6, 18), mat);
  m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UP, d.normalize());
  m.layers.set(2); parent.add(m); return m;
}
// 坐姿（模型坐标）：背靠座椅，双手在身前，脚伸向前方
const PILOT = { pelvis: [0, 0.5, -0.74], chest: [0, 1.1, -0.88], neck: [0, 1.22, -0.9], head: [0, 1.38, -0.9] };
limb(PILOT.pelvis, PILOT.chest, 0.11, bodyMat).scale.set(1.45, 1, 1);
limb(PILOT.chest, PILOT.neck, 0.045, bodyMat);
{ const h = new THREE.Mesh(new THREE.SphereGeometry(0.095, 24, 16), bodyMat); h.position.copy(P(...PILOT.head)); h.layers.set(2); pilot.add(h); }
for (const sx of [-1, 1]) {
  limb([sx * 0.27, 1.06, -0.86], [sx * 0.36, 0.78, -0.7], 0.042, bodyMat);
  limb([sx * 0.36, 0.78, -0.7], [sx * 0.2, 0.74, -0.38], 0.037, bodyMat);
  limb([sx * 0.13, 0.5, -0.72], [sx * 0.16, 0.7, -0.14], 0.068, bodyMat);
  limb([sx * 0.16, 0.7, -0.14], [sx * 0.16, 0.28, 0.2], 0.048, bodyMat);
  limb([sx * 0.16, 0.28, 0.2], [sx * 0.16, 0.24, 0.42], 0.035, bodyMat);
}
// 安全气囊服：躯干外一层 + 护颈，充气时鼓起
const suit = new THREE.Group(); pilot.add(suit);
const suitTorso = limb([0, 0.62, -0.77], PILOT.chest, 0.125, suitMat, suit);
const collar = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.034, 14, 40), suitMat);
collar.position.copy(P(0, 1.17, -0.89)); collar.rotation.x = Math.PI / 2 - 0.15; collar.layers.set(2); suit.add(collar);
const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.128, 32, 20), helmetMat);
helmet.position.copy(P(0, 1.4, -0.91)); helmet.layers.set(2); pilot.add(helmet);

// ───────── 主动安全：边界墙 ─────────
const fenceMat = new THREE.ShaderMaterial({
  uniforms: { uOpacity: { value: 0 }, uGlow: { value: 0 }, uColor: { value: new THREE.Color(0xff5a00) } },
  vertexShader: `varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
  fragmentShader: `uniform float uOpacity; uniform float uGlow; uniform vec3 uColor; varying vec2 vU;
    void main(){ vec2 g = abs(fract(vU*vec2(24.0,10.0)) - 0.5); float line = 1.0 - smoothstep(0.0, 0.06, min(g.x, g.y));
      float edge = smoothstep(0.0,0.15,vU.y)*(1.0-smoothstep(0.8,1.0,vU.y)) * smoothstep(0.0,0.08,vU.x)*(1.0-smoothstep(0.92,1.0,vU.x));
      float a = (0.05 + 0.35*line + 0.25*uGlow) * edge * uOpacity; gl_FragColor = vec4(uColor*a, a); }`,
  transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
});
const fence = new THREE.Mesh(new THREE.PlaneGeometry(7, 3.6), fenceMat);
fence.rotation.y = Math.PI / 2; fence.position.set(3.6, 1.8, 0); scene.add(fence);

// ───────── 状态（全部是 t 的函数）─────────
const HOVER = 1.15;
// 桨叶转速倍率
function propSpeed(i, t) {
  let s = 1;
  if (i === FAIL) s *= 1 - ramp(t, C.fail, 0.7) * (1 - ramp(t, C.battStart + 0.2, 1.2));
  else if (t > C.fail && t < C.battStart + 1.4) s *= 1 + (i === PARTNER ? 0.35 : 0.12) * ramp(t, C.adjust - 0.3, 0.4) * (1 - ramp(t, C.battStart + 0.2, 1.2));
  s *= 1 - 0.92 * ramp(t, C.battLand + 1.4, 1.0) * (1 - ramp(t, C.fcStart + 2.2, 1.2));
  s *= 1 - ramp(t, C.accident + 0.05, 0.5);
  return s;
}
// 预积分：桨叶角度、被动安全的下落
const STEP = 1 / 240, N = Math.ceil((DUR + 2) / STEP);
const ANG = PROPS.map(() => new Float64Array(N));
const FALL = new Float64Array(N);
const DROP_FROM = 8.5, BAG_H = 0.45;
let landAt = Infinity, bagAt = Infinity, popAt = C.accident + 0.45;
{
  let y = DROP_FROM, v = 0;
  for (let k = 0; k < N; k++) {
    const t = k * STEP;
    if (k) PROPS.forEach((p, i) => (ANG[i][k] = ANG[i][k - 1] + Math.PI * 2 * 1.6 * propSpeed(i, t) * STEP));
    if (t > C.accident) {
      const vt = t > popAt ? -2.4 : -60;
      const k2 = t > popAt ? 5.0 : 0;
      v += (t > popAt ? (vt - v) * k2 : -9.8) * STEP;
      y += v * STEP;
      if (y < 2.3 && bagAt === Infinity) bagAt = t;
      if (y <= BAG_H && landAt === Infinity) { landAt = t; }
      if (landAt < Infinity) { y = BAG_H; v = 0; }
    }
    FALL[k] = y;
  }
}
const sample = (arr, t) => { const x = Math.max(0, Math.min(N - 1.001, t / STEP)); const i = Math.floor(x); return arr[i] + (arr[i + 1] - arr[i]) * (x - i); };
function acY(t) {
  let y = HOVER;
  y = mix(y, 0, smoother((t - (C.battLand - 0.5)) / 2.2));          // 安全降落
  y = mix(y, HOVER, smoother((t - (C.fcStart + 2.6)) / 2.6));       // 重新起飞（镜头在飞控内部时）
  y = mix(y, DROP_FROM, smoother((t - (C.passiveStart - 0.2)) / 2.4));
  if (t > C.accident) y = sample(FALL, t);
  return y;
}
// 主动安全：一阵风把机体推向边界，系统拉回并改平
function activeState(t) {
  const gust = burst(t - C.intervene, 0.5, 1.1);
  const drift = 1.15 * sm((t - (C.intervene - 0.4)) / 1.1) * (1 - sm((t - (C.intervene + 0.9)) / 1.6));
  return { roll: -9 * DEG * gust * Math.sin(Math.min(1, (t - C.intervene + 0.5) / 0.6) * Math.PI), x: drift, gust };
}

// ───────── 镜头 ─────────
const acPos = (t) => new THREE.Vector3(0, acY(t), 0);
const fcWorld = (t, off = [0, 0.02, 0]) => new THREE.Vector3(FC_MOUNT.x + off[0], acY(t) + FC_MOUNT.y + off[1], FC_MOUNT.z + off[2]);
const pilotWorld = (t, p) => P(...p).add(new THREE.Vector3(0, acY(t), 0));
const imuWorld = (t) => fcWorld(t, [0.045 + 0.006, 0.012, 0.006]);
const SHOTS = [
  { t: -1, d: 0.01, tg: () => new THREE.Vector3(0, 1.4, 0), az: 32, el: 9, dist: 8.8, fov: 30 },
  { t: C.layers - 0.4, d: 3.0, tg: () => new THREE.Vector3(0.9, 1.4, 0), az: 22, el: 12, dist: 9.4, fov: 30 },
  { t: C.motorsStart + 0.2, d: 2.6, tg: () => new THREE.Vector3(0, 1.25, 0), az: 52, el: 30, dist: 9.6, fov: 30 },
  { t: C.coax - 0.6, d: 2.4, tg: () => FR_MID.clone().setY(FR_MID.y + acY(C.coax)), az: 64, el: 10, dist: 1.25, fov: 32 },
  { t: C.fail, d: 1.6, tg: () => FR_MID.clone().setY(FR_MID.y + acY(C.fail) + 0.12), az: 76, el: 16, dist: 1.25, fov: 32 },
  { t: C.still - 0.5, d: 2.6, tg: () => new THREE.Vector3(0, 1.25, 0), az: 58, el: 16, dist: 9.2, fov: 30 },
  { t: C.battStart - 0.3, d: 2.4, tg: (t) => new THREE.Vector3(0, acY(t) + 0.55, 0.05), az: 88, el: 12, dist: 5.6, fov: 32 },
  { t: C.battLand - 0.6, d: 2.2, tg: (t) => new THREE.Vector3(0, acY(t) + 0.6, 0.05), az: 74, el: 14, dist: 6.8, fov: 32 },
  { t: C.fcStart - 0.4, d: 2.6, tg: (t) => fcWorld(t, [0, 0.02, 0.03]), az: 58, el: 30, dist: 0.9, fov: 32 },
  { t: C.fcTwo - 0.5, d: 1.6, tg: (t) => fcWorld(t, [0, 0.02, 0.03]), az: 40, el: 40, dist: 0.42, fov: 32 },
  { t: C.fcVoter - 0.5, d: 1.6, tg: (t) => fcWorld(t, [0, 0.015, 0.05]), az: 16, el: 36, dist: 0.4, fov: 32 },
  { t: C.fcFault - 0.3, d: 2.4, tg: (t) => fcWorld(t, [0, 0.015, 0.05]), az: 8, el: 42, dist: 0.36, fov: 32 },
  { t: C.fcImu - 0.4, d: 1.8, tg: (t) => imuWorld(t), az: 30, el: 62, dist: 0.075, fov: 32 },
  { t: C.fcNone - 0.5, d: 2.2, tg: (t) => imuWorld(t), az: 50, el: 56, dist: 0.062, fov: 32 },
  { t: C.activeStart - 0.6, d: 3.2, tg: (t) => new THREE.Vector3(0.6, acY(t) + 0.4, 0), az: 18, el: 9, dist: 11.5, fov: 30 },
  { t: C.passiveStart - 0.4, d: 2.6, tg: (t) => new THREE.Vector3(0, acY(t) + 0.5, 0), az: 34, el: 2, dist: 11, fov: 30 },
  { t: popAt - 0.3, d: 1.8, tg: (t) => new THREE.Vector3(0, acY(t) + 3.7, 0), az: 34, el: -2, dist: 22.5, fov: 30 },
  { t: C.pilot - 0.6, d: 2.4, tg: (t) => pilotWorld(t, [0, 0.95, -0.55]), az: 2, el: 17, dist: 3.2, fov: 30 },
  { t: C.helmet - 0.4, d: 2.6, tg: (t) => pilotWorld(t, [0, 1.05, -0.62]), az: -4, el: 13, dist: 2.6, fov: 30 },
];
function camState(t) {
  let i = 0; while (i + 1 < SHOTS.length && SHOTS[i + 1].t <= t) i++;
  const s = SHOTS[i], p = i ? SHOTS[i - 1] : s;
  const x = smoother((t - s.t) / s.d);
  const pt = p.tg(t), st = s.tg(t);   // 两端都跟随机体，过渡中不会把机体甩出画面
  const tg = pt.clone().lerp(st, x);
  const az = mix(p.az, s.az, x) + 0.35 * t, el = mix(p.el, s.el, x);
  const dist = Math.exp(mix(Math.log(p.dist), Math.log(s.dist), x));
  const fov = mix(p.fov, s.fov, x);
  return { tg, az: az * DEG, el: el * DEG, dist, fov };
}
const cam = new THREE.PerspectiveCamera(30, ASPECT, 0.01, 6000);

// ───────── 叠加层 ─────────
const $ = (s) => document.querySelector(s);
const ui = { sub: $('[data-sub]'), title: $('[data-title]'), h1: $('[data-title] h1'), en: $('[data-title] .en'), layers: $('[data-layers]'), ruler: $('[data-ruler]'), co: $('[data-callouts]'), end: $('[data-end]'), fades: [...document.querySelectorAll('[data-fade]')] };
const LOG_TOP = Math.log10(100), LOG_BOT = Math.log10(0.01);
const rulerFrac = (w) => clamp01((LOG_TOP - Math.log10(w)) / (LOG_TOP - LOG_BOT));
ui.ruler.innerHTML = `<div class="cap">视野 · FIELD OF VIEW</div><div class="bar"></div>` + ['100 m', '10 m', '1 m', '10 cm', '1 cm'].map((l, i) => `<div class="tick" style="top:${40 + (i / 4) * 560}px">${l}<i></i></div>`).join('') + `<div class="now" data-now><span></span><i></i></div>`;
const rulerNow = ui.ruler.querySelector('[data-now]'), rulerText = rulerNow.querySelector('span');
const fmtLen = (w) => (w >= 1000 ? `≈ ${(w / 1000).toFixed(1)} km` : w >= 10 ? `≈ ${Math.round(w)} m` : w >= 1 ? `≈ ${w.toFixed(1)} m` : w >= 0.1 ? `≈ ${Math.round(w * 100)} cm` : w >= 0.01 ? `≈ ${(w * 100).toFixed(1)} cm` : `≈ ${Math.round(w * 1000)} mm`);
const SUBS = [];
for (const s of TL.scenes) for (const l of s.lines) {
  const parts = []; let buf = '';
  for (const part of l.text.split(/(?<=[，：；。])/)) { if ((buf + part).replace(/[，：；。]/g, '').length > 22 && buf) { parts.push(buf); buf = part; } else buf += part; }
  if (buf) parts.push(buf);
  const total = parts.reduce((n, p) => n + p.length, 0); let a = l.start;
  for (const p of parts) { const d = ((l.end - l.start) * p.length) / total; SUBS.push({ a, b: a + d, text: p.replace(/[，；：。]+$/g, '').replace(/[，；]/g, '　') }); a += d; }
}
SUBS.forEach((s, i) => (s.hold = i + 1 < SUBS.length ? Math.min(SUBS[i + 1].a, s.b + 0.5) : s.b + 0.6));
function project(v) { const p = v.clone().project(cam); return [(p.x * 0.5 + 0.5) * W, (-p.y * 0.5 + 0.5) * H, p.z]; }
function gaugeSvg(kind, st) {
  if (kind === 'att') { const a = (st.roll / DEG) * 2.2; return `<svg class="gauge" width="120" height="44" viewBox="-60 -22 120 44"><circle r="20" fill="none" stroke="#4a4b50"/><line x1="-34" x2="34" stroke="#ff5a00" stroke-width="2" transform="rotate(${a.toFixed(1)})"/><line x1="-6" x2="6" stroke="#f2f1ec"/></svg>`; }
  if (kind === 'alt') { const h = clamp01(st.y / 2.4); return `<svg class="gauge" width="120" height="44" viewBox="0 0 120 44"><rect x="10" y="18" width="100" height="8" fill="none" stroke="#4a4b50"/><rect x="10" y="18" width="${(100 * h).toFixed(1)}" height="8" fill="#ff5a00"/></svg>`; }
  if (kind === 'pwr') return `<svg class="gauge" width="120" height="44" viewBox="0 0 120 44"><rect x="10" y="16" width="44" height="12" fill="none" stroke="#4a4b50"/><rect x="12" y="18" width="34" height="8" fill="#e8e8e4"/><rect x="64" y="16" width="44" height="12" fill="none" stroke="#4a4b50"/><rect x="66" y="18" width="34" height="8" fill="#e8e8e4"/></svg>`;
  const px = 60 + 34 * (st.x / 2.4); return `<svg class="gauge" width="120" height="44" viewBox="0 0 120 44"><rect x="14" y="6" width="92" height="32" fill="none" stroke="#4a4b50"/><line x1="98" y1="6" x2="98" y2="38" stroke="#ff5a00" stroke-width="${st.gust > 0.2 ? 3 : 1.5}"/><circle cx="${px.toFixed(1)}" cy="22" r="4" fill="#ff5a00"/></svg>`;
}

// ───────── 一帧 ─────────
const tmp = new THREE.Vector3();
function render(t) {
  // 机体位置与姿态
  const act = t > C.activeStart - 1 && t < C.passiveStart ? activeState(t) : { roll: 0, x: 0, gust: 0 };
  const y = acY(t);
  const hoverBob = 0.02 * Math.sin(t * 1.3) * (y > 0.3 ? 1 : 0);
  AC.position.set(act.x, y + hoverBob, 0);
  const failTilt = (t > C.fail && t < C.battStart + 1.5 ? burst(t - C.fail, 0.3, 0.6) * 2.5 * DEG : 0);
  const landSquash = t > landAt ? burst(t - landAt, 0.05, 0.35) : 0;
  TILT.rotation.set(failTilt * 0.6, 0, act.roll - failTilt);
  AC.updateMatrixWorld(true);
  PROPS.forEach((p, i) => p.o.quaternion.copy(p.base).multiply(tmpQ.setFromAxisAngle(Z, (p.up ? 1 : -1) * sample(ANG[i], t))));

  // X 光（机体半透明）与全息部件
  const cs = camState(t);
  const near = clamp01(cs.dist / 2.5);
  const xray = Math.max(win(t, C.battStart + 0.3, C.battFault + 2.2, 0.8), win(t, C.fcStart - 0.2, C.activeStart - 0.2, 0.9), win(t, C.passiveStart + 0.6, C.chute + 0.4, 0.6) * 0.7, win(t, C.pilot - 0.3, C.endStart + 1.0, 0.7) * 0.55);
  for (const s of matState) {
    if (xray > 0.01) { s.m.transparent = true; s.m.opacity = s.opacity * (1 - mix(0.97, 0.82, near) * xray); s.m.depthWrite = xray < 0.5; }
    else { s.m.transparent = s.transparent; s.m.opacity = s.opacity; s.m.depthWrite = s.depthWrite; }
  }
  ghostMat.uniforms.uOpacity.value = 0.55 * xray * Math.min(1, Math.max(0.12, cs.dist / 2.5));
  for (const m of [...HOLO, ...LINES]) m.uniforms.uTime.value = t;
  const battOn = win(t, C.battStart + 0.6, C.battLand + 2.0, 0.6);
  const fault = ramp(t, C.battFault, 0.3);
  battHolo.front.mat.uniforms.uColor.value.set(0x9fd6ff).lerp(new THREE.Color(0xff7a2a), fault);
  battHolo.rear.mat.uniforms.uColor.value.set(0x9fd6ff).lerp(new THREE.Color(0xff3b30), fault);
  battHolo.front.mat.uniforms.uOpacity.value = battOn * (1 + 0.4 * fault);
  battHolo.rear.mat.uniforms.uOpacity.value = battOn * (1 - 0.35 * fault * (0.5 + 0.5 * Math.sin(t * 9)));
  flowMat.uniforms.uOpacity.value = battOn * ramp(t, C.battShare - 0.2, 0.5) * 0.9;
  ringFail.uniforms.uOpacity.value = win(t, C.fail + 0.1, C.battStart + 0.4, 0.3) * (0.75 + 0.25 * Math.sin(t * 10));
  ringComp.uniforms.uOpacity.value = win(t, C.adjust - 0.1, C.battStart + 0.4, 0.4) * 0.8;
  const fcIn = win(t, C.fcStart + 0.2, C.activeStart, 0.6);
  const intro = fcIn * (1 - ramp(t, C.fcTwo, 0.8)) * 0.9;
  const faultA = ramp(t, C.fcFault, 0.15) * (1 - ramp(t, C.activeStart - 1.0, 0.6));   // 主飞控异常（演示）
  const sw = ramp(t, C.fcSwitch, 0.12);                                                // 表决器切到从飞控
  const pulse = 0.6 + 0.4 * Math.sin(t * 10);
  fcHolo[0].uniforms.uColor.value.set(0xffb070).lerp(new THREE.Color(0xff3b30), faultA);
  fcHolo[0].uniforms.uOpacity.value = Math.max(intro, faultA * pulse * win(t, C.fcFault, C.fcImu - 0.4, 0.2));
  fcHolo[1].uniforms.uOpacity.value = Math.max(intro, 0.8 * burst(t - C.fcSwitch, 0.08, 0.7));
  const pathsOn = win(t, C.fcVoter - 0.3, C.fcImu - 0.2, 0.4);
  pathA.uniforms.uColor.value.set(0xff7a2a).lerp(new THREE.Color(0xff3b30), faultA);
  pathA.uniforms.uOpacity.value = pathsOn * (1 - 0.75 * sw);
  pathB.uniforms.uColor.value.set(0xe8e8e4).lerp(new THREE.Color(0xff7a2a), sw);
  pathB.uniforms.uOpacity.value = pathsOn * (0.45 + 0.55 * sw);
  pathOut.uniforms.uOpacity.value = pathsOn;
  voterHolo.uniforms.uOpacity.value = 0.9 * win(t, C.fcVoter - 0.2, C.fcVoter + 1.4, 0.3) + 0.9 * burst(t - C.fcSwitch, 0.05, 0.5);
  voterLed[0].emissive.set(0xff5a00).lerp(new THREE.Color(0xff3b30), faultA); voterLed[0].emissiveIntensity = 2.5 * fcIn * (1 - sw) + 2.5 * faultA * sw * (0.5 + 0.5 * Math.sin(t * 12));
  voterLed[1].emissive.set(0xff5a00); voterLed[1].emissiveIntensity = 2.5 * fcIn * sw;
  const lidOpen = smoother((t - (C.fcImu - 0.6)) / 1.0) * (1 - smoother((t - (C.activeStart - 1.2)) / 0.8));
  IMU_U.lid.position.set(0.07 * lidOpen, 0.12 * lidOpen, -0.0015);
  IMU_U.lid.rotation.z = -0.45 * lidOpen;
  NA[0].ledMat.emissive.set(0xff5a00).lerp(new THREE.Color(0xff3b30), faultA); NA[0].ledMat.emissiveIntensity = 2.5 * fcIn * (faultA > 0.5 ? 0.5 + 0.5 * Math.sin(t * 12) : 1);
  NA[1].ledMat.emissive.set(0xe8e8e4).lerp(new THREE.Color(0xff5a00), sw); NA[1].ledMat.emissiveIntensity = fcIn * mix(1.6 * (0.6 + 0.4 * Math.sin(t * 4)), 2.5, sw);
  syncMat.uniforms.uOpacity.value = win(t, C.fcTwo + 0.3, C.fcVoter, 0.4);
  const imuOn = win(t, C.fcImu + 0.4, C.activeStart - 0.6, 0.4);
  const outvote = win(t, C.fcNone - 0.2, C.activeStart - 0.9, 0.3);
  imuGlow.forEach((m, i) => (m.uniforms.uOpacity.value = 0.6 * imuOn * (i === 2 ? 0.8 + 0.9 * outvote * (0.5 + 0.5 * Math.sin(t * 14)) : 1)));
  imuGlow[2].uniforms.uColor.value.set(0xff9a50).lerp(new THREE.Color(0xff3b30), outvote);
  imuLink.uniforms.uOpacity.value = imuOn;
  imuLinkBad.uniforms.uOpacity.value = imuOn * (1 - 0.85 * outvote);
  imuLinkBad.uniforms.uColor.value.set(0xff7a2a).lerp(new THREE.Color(0xff3b30), outvote);

  // 降落伞与气囊
  const canOn = win(t, C.passiveStart + 1.0, popAt + 0.3, 0.5);
  canHoloMat.uniforms.uOpacity.value = canOn * 1.2;
  canister.scale.setScalar(1);
  const age = t - popAt;
  cap.visible = age > -0.05 && age < 1.2;
  if (cap.visible) { cap.position.copy(CAN).add(new THREE.Vector3(-0.4 * age, 0.165 + 6 * age - 3 * age * age, 0)); cap.rotation.z = age * 6; capMat.opacity = 1 - clamp01((age - 0.6) / 0.6); }
  const canopyOn = age > 0 && t < C.endStart;
  canopy.visible = shroud.visible = canopyOn;
  if (canopyOn) {
    const inflate = smoother(age / 1.1);
    const collapse = t > landAt ? smoother((t - landAt - 0.4) / 2.4) : 0;
    const top = new THREE.Vector3(0, CAN.y, CAN.z).applyMatrix4(TILT.matrixWorld);
    const lineLen = mix(1.5, 6.2, smoother(age / 0.7));
    const R = mix(0.25, CANOPY_R, inflate) * (1 - 0.15 * collapse);
    const breathe = 1 + 0.03 * Math.sin(age * 5.5) * inflate;
    const cx = top.x - collapse * 5.2, cy = mix(top.y + lineLen, 0.2, collapse), cz = top.z - collapse * 1.2;
    canopy.position.set(cx, cy, cz);
    canopy.scale.set(R * breathe, mix(R * 2.4, R * 0.78, inflate) * (1 - 0.8 * collapse), R * breathe);
    canopy.rotation.z = collapse * 1.1;
    canopyMat.opacity = 1 - ramp(t, C.pilot - 0.8, 1.0);
    const pts = [];
    for (let k = 0; k < 16; k++) {
      const a = (k / 16) * Math.PI * 2;
      const rim = new THREE.Vector3(Math.cos(a) * Math.sin(Math.PI * 0.42), Math.cos(Math.PI * 0.42), Math.sin(a) * Math.sin(Math.PI * 0.42)).multiply(canopy.scale).applyEuler(canopy.rotation).add(canopy.position);
      pts.push(rim, top);
    }
    shroud.geometry.setFromPoints(pts);
    shroud.material.opacity = 0.8 * (1 - collapse) * canopyMat.opacity;
  }
  const pilotOn = win(t, C.pilot - 0.5, C.endStart + 0.8, 0.5);
  pilot.visible = pilotOn > 0.001;
  const suitInf = smoother((t - C.suit) / 0.45);
  bodyMat.uniforms.uOpacity.value = 0.95 * pilotOn;
  suitMat.uniforms.uOpacity.value = 0.8 * pilotOn * ramp(t, C.suit - 0.15, 0.2) * (1 + 0.5 * burst(t - C.suit, 0.1, 0.6));
  suitTorso.scale.set(1.45 * mix(0.9, 1.22, suitInf), mix(0.95, 1.04, suitInf), mix(0.9, 1.25, suitInf));
  collar.scale.setScalar(mix(0.5, 1.15, suitInf));
  helmetMat.uniforms.uColor.value.set(0xe8e8e4).lerp(new THREE.Color(0xff7a2a), ramp(t, C.helmet - 0.1, 0.3));
  helmetMat.uniforms.uOpacity.value = pilotOn * (0.75 + 0.6 * burst(t - C.helmet, 0.1, 0.7));
  const bagInf = t > bagAt ? smoother((t - bagAt) / 0.28) : 0;
  bags.visible = bagInf > 0.001 && t < C.endStart;
  bags.scale.set(mix(0.4, 1, bagInf), mix(0.05, 1, bagInf) * (1 - 0.18 * landSquash), mix(0.5, 1, bagInf));
  bags.position.y = 0.05;

  // 主动安全：边界
  const fenceOn = win(t, C.intervene - 0.8, C.passiveStart - 0.3, 0.6);
  fenceMat.uniforms.uOpacity.value = fenceOn;
  fenceMat.uniforms.uGlow.value = act.gust + 0.6 * win(t, C.boundary - 0.3, C.boundary + 1.8, 0.4);

  // 镜头
  const pos = new THREE.Vector3(Math.cos(cs.el) * Math.sin(cs.az), Math.sin(cs.el), Math.cos(cs.el) * Math.cos(cs.az)).multiplyScalar(cs.dist).add(cs.tg);
  cam.position.copy(pos); cam.lookAt(cs.tg); cam.fov = cs.fov;
  cam.near = Math.max(0.0015, cs.dist * 0.02); cam.far = Math.max(200, cs.dist * 8);
  cam.updateProjectionMatrix();

  // 渲染：常规 → 机体 X 光描边 → 全息部件
  r.shadowMap.needsUpdate = true;
  r.autoClear = true; cam.layers.set(0); r.render(scene, cam);
  r.autoClear = false; scene.background = null;   // 颜色背景会让每一遍都清屏
  if (xray > 0.01) { cam.layers.set(1); scene.overrideMaterial = ghostMat; r.render(scene, cam); scene.overrideMaterial = null; }
  cam.layers.set(2); r.render(scene, cam);
  cam.layers.set(0); r.autoClear = true; scene.background = BG;

  // 叠加层
  const scene_ = TL.scenes.find((s) => t >= s.start && t < s.end) || TL.scenes[TL.scenes.length - 1];
  const titleOn = scene_.title ? win(t, scene_.start + 0.3, scene_.end - 0.3, 0.5) : 0;
  if (ui.h1.textContent !== scene_.title) { ui.h1.textContent = scene_.title; ui.en.textContent = scene_.en; }
  const layersOn = win(t, C.layers - 0.2, C.motorsStart - 0.2, 0.5);
  ui.title.style.opacity = (titleOn * (1 - layersOn)).toFixed(3);
  ui.layers.style.opacity = layersOn.toFixed(3);
  [...ui.layers.children].forEach((el, i) => (el.style.opacity = ramp(t, C.layers + i * 0.35, 0.4).toFixed(3)));
  const sub = SUBS.find((s) => t >= s.a && t < s.hold);
  const endOn = ramp(t, C.endStart - 0.2, 1.0);
  const subText = sub ? sub.text : '';
  if (ui.sub.textContent !== subText) ui.sub.textContent = subText;
  ui.sub.style.opacity = '1';
  const w = 2 * cs.dist * Math.tan((cs.fov * DEG) / 2) * ASPECT;
  rulerNow.style.top = `${40 + rulerFrac(w) * 560}px`;
  rulerText.textContent = fmtLen(w);
  ui.end.style.opacity = endOn.toFixed(3);
  for (const el of ui.fades) el.style.opacity = (1 - endOn).toFixed(3);
  callouts(t, { y, roll: act.roll, x: act.x, gust: act.gust, outvote });
}
const tmpQ = new THREE.Quaternion(), Z = new THREE.Vector3(0, 0, 1);

function callouts(t, st) {
  const list = [];
  const at = (local) => local.clone().applyMatrix4(TILT.matrixWorld);
  const add = (on, world, zh, en, cls = '', stem = 46, extra = '') => { if (on > 0.01) list.push({ on, world, zh, en, cls, stem, extra }); };
  // 冗余 · 动力
  const m8 = win(t, C.arms + 0.3, C.coax - 0.4, 0.4);
  add(m8, at(MOTORS[2].clone().add(new THREE.Vector3(0, 0.25, 0))), '<em>8</em> 个独立电机', 'EIGHT INDEPENDENT MOTORS');
  add(win(t, C.coax + 0.6, C.fail - 0.2, 0.3), at(FR_UP.clone().add(new THREE.Vector3(0, 0.15, 0))), '上下共轴', 'COAXIAL PAIR', '', 40);
  add(win(t, C.fail + 0.3, C.still - 0.3, 0.3), at(FR_UP.clone().add(new THREE.Vector3(0, 0.06, 0))), '<em>电机失效</em>', 'MOTOR OUT', 'fault', 30);
  add(win(t, C.adjust + 0.2, C.still - 0.3, 0.3), at(FR_LO.clone().add(new THREE.Vector3(0, 0.1, 0))), '其余电机即时补偿', 'OTHER MOTORS COMPENSATE', '', 30);
  add(win(t, C.still + 1.4, C.battStart - 0.2, 0.4), at(new THREE.Vector3(0, 2.0, 0)), '<em>7</em> / 8 电机 · 继续飞行', 'KEEPS FLYING');
  // 电池
  const bOn = win(t, C.battStart + 1.0, C.battLand + 1.6, 0.4);
  add(bOn, at(BF.clone().add(new THREE.Vector3(0, 0.3, 0))), t > C.battFault ? '<em>前电池组</em> · 继续供电' : '前电池组', 'FRONT PACK');
  add(bOn, at(BR.clone().add(new THREE.Vector3(0, 0.3, 0))), t > C.battFault ? '<em>后电池组</em> · 异常' : '后电池组', 'REAR PACK', t > C.battFault ? 'fault' : 'holo');
  add(win(t, C.battLand + 1.2, C.fcStart - 0.3, 0.3), at(new THREE.Vector3(0, 1.9, 0)), '安全降落', 'SAFE LANDING');
  // 飞控
  const fcOn = win(t, C.fcStart + 0.8, C.fcImu - 0.5, 0.4);
  const fA = t > C.fcFault, sB = t > C.fcSwitch + 0.15;
  add(fcOn, fcWorld(t, [-0.045, 0.04, 0]), fA ? '<em>主飞控 · 异常</em>' : 'NA80 · <em>主</em>', fA ? 'PRIMARY · FAULT' : 'PRIMARY · 示意位置', fA ? 'fault' : '', 30);
  add(fcOn, fcWorld(t, [0.045, 0.04, 0]), sB ? 'NA80 · 从 · <em>接管</em>' : 'NA80 · 从', sB ? 'SECONDARY · IN CONTROL' : 'SECONDARY · 示意位置', sB ? '' : 'holo', 30);
  add(win(t, C.fcVoter + 0.1, C.fcImu - 0.5, 0.4), fcWorld(t, [0, 0.022, VOTER[2]]), sB ? '表决器 · <em>毫秒级切换</em>' : '<em>表决器</em>', sB ? 'VOTER · FAILOVER' : 'VOTER · 监测 · 仲裁 · 示意', '', 24);
  const imuOn = win(t, C.fcImu + 0.6, C.activeStart - 0.6, 0.4);
  IMU_U.imus.forEach((m, i) => { const wp = m.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(0, 0.003, 0)); add(imuOn, wp, i === 2 && st.outvote > 0.5 ? `<em>IMU ${i + 1}</em> · 被识别` : `IMU ${i + 1}`, i === 2 && st.outvote > 0.5 ? 'OUTVOTED' : 'CROSS-CHECK', i === 2 && st.outvote > 0.5 ? 'fault' : '', 26); });
  // 主动安全
  const hud = (k, i) => win(t, C.monitor + i * 0.45, C.passiveStart - 0.3, 0.35);
  const P0 = (v) => v.clone().applyMatrix4(TILT.matrixWorld);
  add(hud('att', 0), P0(new THREE.Vector3(0, 1.75, 0.2)), '姿态', 'ATTITUDE', '', 50, gaugeSvg('att', st));
  add(hud('alt', 1), P0(new THREE.Vector3(-1.6, 0.95, 1.4)), '高度', 'ALTITUDE', '', 40, gaugeSvg('alt', st));
  add(hud('pwr', 2), P0(BF.clone().add(new THREE.Vector3(0, 0.2, 0))), '电量', 'POWER', '', 40, gaugeSvg('pwr', st));
  add(hud('pos', 3), P0(new THREE.Vector3(1.9, 0.95, 0.6)), '位置', 'POSITION', '', 40, gaugeSvg('pos', st));
  add(win(t, C.intervene + 0.3, C.boundary + 2.0, 0.3), new THREE.Vector3(3.6, 3.4, 0), '安全边界', 'SAFE LIMIT', '', 20);
  // 被动安全
  const canWorld = CAN.clone().add(new THREE.Vector3(0, 0.2, 0)).applyMatrix4(TILT.matrixWorld);
  add(win(t, C.passiveStart + 1.2, popAt + 0.2, 0.4), canWorld, '整机降落伞', 'PARACHUTE · 示意', 'holo', 60);
  add(win(t, bagAt + 0.4, C.pilot - 0.2, 0.3), new THREE.Vector3(1.3, 0.35, 1.4), '机身安全气囊', 'AIRBAGS · 示意', '', 40);
  add(win(t, C.suit + 0.2, C.endStart - 0.1, 0.3), P0(P(0.18, 0.9, -0.72)), '<em>安全气囊服</em>', 'AIRBAG SUIT · 示意', '', 40);
  add(win(t, C.helmet + 0.1, C.endStart - 0.1, 0.3), P0(P(0, 1.58, -0.91)), '<em>头盔</em>', 'HELMET', '', 30);

  const html = [];
  for (const c of list) {
    const [x, y, z] = project(c.world);
    if (z > 1 || x < -200 || x > W + 200 || y < -200 || y > H + 200) continue;
    html.push(`<div class="co ${c.cls}" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;opacity:${c.on.toFixed(3)}"><div class="box">${c.zh}<small>${c.en}</small>${c.extra}</div><div class="stem" style="height:${c.stem}px"></div><div class="pin"></div></div>`);
  }
  const s = html.join('');
  if (ui.co.innerHTML !== s) ui.co.innerHTML = s;
}

// ───────── 对外接口 ─────────
window.DURATION = DUR;
const glc = r.getContext(); const px = new Uint8Array(4);
window.timeRender = (t, opts = {}) => {
  r.shadowMap.enabled = opts.shadows ?? true; key.castShadow = opts.shadows ?? true;
  if (opts.size) r.setSize(opts.size[0], opts.size[1], false);
  const t0 = performance.now(); render(t); glc.readPixels(0, 0, 1, 1, glc.RGBA, glc.UNSIGNED_BYTE, px); return performance.now() - t0;
};
window.seek = (t) => { render(t); return new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done))); };
await document.fonts.ready;
const params = new URLSearchParams(location.search);
render(params.has('t') ? +params.get('t') : 0);
window.ready = true;
if (!params.has('render')) {
  const audio = document.querySelector('[data-voice]');
  let playing = false;
  const loop = () => { render(audio.currentTime); if (playing) requestAnimationFrame(loop); };
  document.addEventListener('click', () => { playing = !playing; if (playing) audio.play().then(loop); else audio.pause(); });
}
