// Procedural aircraft models. Units ≈ metres; +X forward, +Y up, +Z right wing.
import { THREE, mat, loft, wingPanel, mirrorZ, both, strut, tube, wires, propeller, blurDisc, mannequin, poseMannequin, castAll, canvasTexture } from './stage.js';

// ---------------------------------------------------------------------------
// 1903 WRIGHT FLYER — spruce, ash and muslin; 12.3 m span, 1.83 m gap, canard elevator, twin rudders, two pushers.
export function wrightFlyer() {
  const g = new THREE.Group();
  const muslin = mat.std(0xebe5d6, 0.92, 0, { side: THREE.DoubleSide });
  const spruce = mat.std(0x6a533c, 0.75);
  const dark = mat.std(0x2c2a28, 0.55, 0.5);
  const yL = 0.78, gap = 1.83, yU = yL + gap;
  const half = wingPanel({ root: 1.98, tip: 1.98, span: 6.15, t: 0.03, m: 0.05, le: 0, sections: 14, tipRound: 0.05, dihedral: -0.012 });
  for (const y of [yL, yU]) {
    const w = both(half, muslin);
    w.position.y = y;
    g.add(w);
    // ribs visible through the fabric
    for (let z = -6.0; z <= 6.01; z += 0.31) {
      const r = new THREE.Mesh(new THREE.BoxGeometry(1.96, 0.012, 0.018), spruce);
      r.position.set(-0.99, y + 0.1, z);
      g.add(r);
    }
  }
  // interplane struts (front + rear spars) and wire bracing
  const pairs = [];
  for (const z of [-6.0, -4.6, -3.2, -1.8, -0.55, 0.55, 1.8, 3.2, 4.6, 6.0]) {
    for (const x of [-0.12, -1.78]) g.add(strut([x, yL + 0.04, z], [x, yU + 0.02, z], 0.022, spruce, 6));
  }
  const zs = [-6.0, -4.6, -3.2, -1.8, -0.55, 0.55, 1.8, 3.2, 4.6, 6.0];
  for (let i = 0; i < zs.length - 1; i++) {
    for (const x of [-0.12, -1.78]) {
      pairs.push([[x, yL + 0.05, zs[i]], [x, yU, zs[i + 1]]], [[x, yU, zs[i]], [x, yL + 0.05, zs[i + 1]]]);
    }
  }
  g.add(wires(pairs, 0x3a3a3a, 0.9));
  // canard elevator: biplane surfaces on outriggers
  const elev = wingPanel({ root: 0.9, tip: 0.9, span: 2.2, t: 0.03, m: 0.06, le: 3.4, sections: 6, tipRound: 0.2 });
  for (const y of [1.0, 1.72]) { const e = both(elev, muslin); e.position.y = y; g.add(e); }
  for (const z of [-0.45, 0.45]) {
    g.add(strut([0, yL, z], [3.0, 1.0, z], 0.025, spruce));
    g.add(strut([0, yU, z], [3.0, 1.72, z], 0.025, spruce));
    g.add(strut([3.0, 1.0, z], [3.0, 1.72, z], 0.02, spruce));
    g.add(strut([2.6, 1.0, z], [2.6, 1.72, z], 0.02, spruce));
  }
  // skids
  for (const z of [-0.45, 0.45]) g.add(tube([[-1.9, 0.12, z], [-0.5, 0.06, z], [1.6, 0.1, z], [2.9, 0.42, z], [3.1, 0.72, z]], 0.03, spruce, { smooth: true, seg: 30, radial: 6 }));
  for (const z of [-0.45, 0.45]) for (const x of [-0.12, -1.78]) g.add(strut([x, 0.08, z], [x, yL, z], 0.02, spruce));
  // twin rudders on booms
  const rud = new THREE.Shape();
  rud.moveTo(0, 0); rud.lineTo(-0.62, 0); rud.quadraticCurveTo(-0.7, 0.8, -0.62, 1.62); rud.lineTo(0, 1.62); rud.quadraticCurveTo(0.06, 0.8, 0, 0);
  const rg = new THREE.ShapeGeometry(rud, 6);
  for (const z of [-0.32, 0.32]) {
    const r = new THREE.Mesh(rg, muslin); r.position.set(-4.3, 0.95, z); g.add(r);
  }
  for (const z of [-0.45, 0.45]) {
    g.add(strut([-1.78, yL, z], [-4.3, 0.95, z * 0.75], 0.02, spruce));
    g.add(strut([-1.78, yU, z], [-4.3, 2.57, z * 0.75], 0.02, spruce));
  }
  // engine + chain guides
  const eng = new THREE.Group();
  const block = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.36, 0.42), dark); block.position.set(-0.85, yL + 0.24, 0.42); eng.add(block);
  const radiator = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.7, 0.18), dark); radiator.position.set(-0.5, yL + 0.6, 0.62); eng.add(radiator);
  const fly = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 20), dark); fly.rotation.x = Math.PI / 2; fly.position.set(-1.0, yL + 0.24, 0.66); eng.add(fly);
  g.add(eng);
  g.add(wires([[[-1.2, yL + 0.24, 0.5], [-2.25, yL + 0.85, 1.75]], [[-1.2, yL + 0.24, 0.3], [-2.25, yL + 0.85, -1.75]]], 0x111111));
  // propellers (counter-rotating pushers)
  const props = [];
  for (const z of [-1.75, 1.75]) {
    const p = propeller({ blades: 2, radius: 1.3, chord: 0.2, pitch: 0.5, material: spruce, hub: 0.07 });
    p.position.set(-2.3, yL + 0.85, z);
    const disc = blurDisc(1.3, 0xd8d4c8, 0.0);
    disc.position.copy(p.position);
    g.add(p, disc);
    props.push({ p, disc, dir: z > 0 ? 1 : -1 });
    g.add(strut([-1.78, yL, z], [-2.3, yL + 0.85, z], 0.02, spruce), strut([-1.78, yU, z], [-2.3, yL + 0.85, z], 0.02, spruce));
  }
  // prone pilot, hips in the cradle
  const pilot = mannequin(mat.std(0x2a2826, 0.8), { height: 1.75 });
  poseMannequin(pilot, { neck: -0.5, L: { sh: 0.6, el: 0.9 }, R: { sh: 0.6, el: 0.9 } });
  pilot.rotation.set(0, 0, -Math.PI / 2 + 0.06);
  pilot.position.set(-1.65, yL + 0.18, -0.38);
  g.add(pilot);
  castAll(g, true, false);
  g.userData = { props };
  return g;
}

export function spinProps(model, angle, blur = 0) {
  for (const { p, disc, dir } of model.userData.props) {
    p.rotation.x = angle * dir;
    disc.material.opacity = blur;
    p.visible = blur < 0.25;
  }
}

// ---------------------------------------------------------------------------
// WWI SCOUT BIPLANE (SPAD XIII-like): boxy fuselage, staggered wings, N-struts, roundels.
function roundel(r, colors) {
  const g = new THREE.Group();
  colors.forEach((c, i) => {
    const m = new THREE.Mesh(new THREE.CircleGeometry(r * (1 - i / colors.length), 32), mat.std(c, 0.85, 0, { side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 - i }));
    m.position.y = 0.002 * (i + 1);
    m.rotation.x = -Math.PI / 2;
    g.add(m);
  });
  return g;
}
export function biplane({ color = 0x6e6a48, under = 0xcfc6a8, roundels = ['#2a4b8d', '#f2efe6', '#b8322a'] } = {}) {
  const g = new THREE.Group();
  const skin = mat.std(color, 0.85), skinU = mat.std(under, 0.85), wood = mat.std(0x5b4430, 0.7), steel = mat.std(0x3a3a3a, 0.5, 0.6), black = mat.std(0x1a1a1a, 0.6);
  const fus = loft([
    { x: 2.15, w: 0.36, h: 0.38, e: 2 }, { x: 1.9, w: 0.43, h: 0.45, e: 2.2 }, { x: 1.2, w: 0.42, h: 0.47, ht: 0.52, e: 3 },
    { x: 0, w: 0.4, h: 0.45, ht: 0.5, e: 3 }, { x: -1.6, w: 0.3, h: 0.38, ht: 0.4, e: 3 }, { x: -3.6, w: 0.1, h: 0.16, ht: 0.18, e: 3, z: 0.08 }, { x: -4.3, w: 0.02, h: 0.05, e: 2, z: 0.12 },
  ], { seg: 28 });
  g.add(new THREE.Mesh(fus, skin));
  const cowl = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.3, 24, 1, true), steel); cowl.rotation.z = Math.PI / 2; cowl.position.x = 2.05; g.add(cowl);
  // cockpit opening
  const ck = new THREE.Mesh(new THREE.TorusGeometry(0.26, 0.04, 8, 20), black); ck.rotation.x = Math.PI / 2; ck.position.set(-0.2, 0.5, 0); ck.scale.set(1.4, 1, 1); g.add(ck);
  const pilot = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 10), mat.std(0x3b2a1e, 0.9)); pilot.position.set(-0.25, 0.62, 0); g.add(pilot);
  // wings
  const up = wingPanel({ root: 1.45, tip: 1.45, span: 4.0, t: 0.06, m: 0.05, le: 0.95, sections: 10, tipRound: 0.12 });
  const lo = wingPanel({ root: 1.25, tip: 1.25, span: 3.85, t: 0.06, m: 0.05, le: 0.55, sections: 10, tipRound: 0.12 });
  const wu = both(up, skin); wu.position.y = 1.05; g.add(wu);
  const wl = both(lo, skin); wl.position.y = -0.38; g.add(wl);
  for (const z of [-3.2, 3.2]) { const r = roundel(0.48, roundels); r.position.set(0.22, 1.12, z); g.add(r); const r2 = roundel(0.42, roundels); r2.position.set(-0.08, -0.29, z); g.add(r2); }
  // N-struts and cabane
  for (const z of [-2.0, 2.0, -3.5, 3.5]) {
    g.add(strut([0.7, -0.33, z], [0.86, 1.05, z], 0.03, wood), strut([-0.45, -0.33, z], [-0.35, 1.05, z], 0.03, wood), strut([0.7, -0.33, z], [-0.35, 1.05, z], 0.02, wood));
  }
  for (const z of [-0.35, 0.35]) g.add(strut([0.9, 0.45, z * 0.9], [0.86, 1.05, z * 1.4], 0.025, steel), strut([-0.2, 0.45, z * 0.9], [-0.3, 1.05, z * 1.4], 0.025, steel));
  const wp = [];
  for (const sd of [-1, 1]) { wp.push([[0.7, -0.33, sd * 0.4], [0.86, 1.05, sd * 3.5]], [[0.86, 1.05, sd * 0.4], [0.7, -0.33, sd * 3.5]], [[-0.4, -0.33, sd * 0.4], [-0.35, 1.05, sd * 3.5]]); }
  g.add(wires(wp, 0x222222, 0.8));
  // tail
  const hs = wingPanel({ root: 0.9, tip: 0.6, span: 1.5, t: 0.05, m: 0, le: -3.55, sections: 4, tipRound: 0.3 });
  const ht = both(hs, skin); ht.position.y = 0.12; g.add(ht);
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(-0.9, 0); fin.quadraticCurveTo(-1.0, 0.9, -0.6, 0.95); fin.quadraticCurveTo(-0.2, 0.9, 0, 0);
  const fm = new THREE.Mesh(new THREE.ShapeGeometry(fin, 8), mat.std(0xf2efe6, 0.8, 0, { side: THREE.DoubleSide })); fm.position.set(-3.45, 0.18, 0); g.add(fm);
  const stripe = new THREE.Mesh(new THREE.ShapeGeometry(fin, 8), mat.std(0x2a4b8d, 0.8, 0, { side: THREE.DoubleSide })); stripe.scale.set(0.33, 1, 1); stripe.position.set(-3.45, 0.18, 0.003); g.add(stripe);
  // gear
  for (const z of [-0.6, 0.6]) {
    g.add(strut([1.3, -0.3, z * 0.5], [1.15, -1.15, z], 0.025, steel), strut([0.4, -0.3, z * 0.5], [1.15, -1.15, z], 0.025, steel));
    const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.1, 20), black); wh.rotation.x = Math.PI / 2; wh.position.set(1.15, -1.15, z); g.add(wh);
  }
  g.add(strut([1.15, -1.15, -0.6], [1.15, -1.15, 0.6], 0.03, steel));
  const prop = propeller({ blades: 2, radius: 1.25, chord: 0.16, pitch: 0.4, material: wood, hub: 0.1 });
  prop.position.x = 2.3; g.add(prop);
  const disc = blurDisc(1.25, 0x8a8170, 0.0); disc.position.x = 2.3; g.add(disc);
  g.userData = { props: [{ p: prop, disc, dir: 1 }] };
  castAll(g, true, false);
  return g;
}

// ---------------------------------------------------------------------------
// DOUGLAS DC-3: polished aluminium, swept-LE wing, two radial-engine nacelles.
export function dc3({ metal } = {}) {
  const g = new THREE.Group();
  const al = metal || mat.phys(0xd8dce0, 0.22, 1.0, { clearcoat: 0.3 });
  const dark = mat.std(0x1b1d22, 0.4, 0.3), glass = mat.std(0x0d1218, 0.1, 0.9);
  const warm = mat.basic(0xffd59a);
  const fus = loft([
    { x: 9.9, w: 0.05, h: 0.05, z: -0.1 }, { x: 9.7, w: 0.55, h: 0.55, z: -0.1 }, { x: 9.2, w: 0.95, h: 1.0, z: 0 }, { x: 8.2, w: 1.22, h: 1.28, z: 0.05 },
    { x: 6.5, w: 1.33, h: 1.38, z: 0.05 }, { x: 0, w: 1.36, h: 1.4, z: 0.05 }, { x: -3, w: 1.25, h: 1.32, z: 0.12 }, { x: -6, w: 0.85, h: 0.95, z: 0.35 },
    { x: -8.6, w: 0.32, h: 0.42, z: 0.55 }, { x: -9.8, w: 0.06, h: 0.1, z: 0.62 },
  ], { seg: 40 });
  const fm = new THREE.Mesh(fus, al); g.add(fm);
  // windscreen + passenger windows
  for (const sd of [-1, 1]) {
    const ws = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.42), glass); ws.position.set(8.55, 0.72, sd * 0.86); ws.rotation.set(0, sd * 0.9, sd * 0.25); g.add(ws);
    for (let i = 0; i < 7; i++) {
      const w = new THREE.Mesh(new THREE.PlaneGeometry(0.42, 0.34), i % 3 === 1 ? warm : glass);
      w.position.set(5.2 - i * 1.25, 0.32, sd * 1.375); w.rotation.y = sd > 0 ? 0 : Math.PI; g.add(w);
    }
  }
  // wing: centre section + outer panels with dihedral and swept leading edge
  const wing = wingPanel({ root: 4.4, tip: 1.6, span: 14.4, sweep: -2.6, dihedral: 0.085, t: 0.16, m: 0.025, le: 2.9, y: -0.85, sections: 12, tipRound: 0.06 });
  g.add(both(wing, al));
  // nacelles + cowlings + props
  const props = [];
  for (const sd of [-1, 1]) {
    const nz = sd * 3.7;
    const nac = loft([{ x: 4.45, w: 0.62, h: 0.62 }, { x: 4.2, w: 0.78, h: 0.78 }, { x: 3.0, w: 0.72, h: 0.76 }, { x: 0.8, w: 0.5, h: 0.55, z: -0.1 }, { x: -1.4, w: 0.12, h: 0.18, z: -0.1 }], { seg: 28 });
    const nm = new THREE.Mesh(nac, al); nm.position.set(0, -0.62, nz); g.add(nm);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.66, 0.08, 10, 28), dark); ring.rotation.y = Math.PI / 2; ring.position.set(4.42, -0.62, nz); g.add(ring);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.62, 28), dark); face.rotation.y = Math.PI / 2; face.position.set(4.4, -0.62, nz); g.add(face);
    const pr = propeller({ blades: 3, radius: 1.78, chord: 0.24, pitch: 0.55, material: dark, hub: 0.2 });
    pr.position.set(4.62, -0.62, nz); g.add(pr);
    const disc = blurDisc(1.78, 0x9aa0a8, 0.0); disc.position.copy(pr.position); g.add(disc);
    props.push({ p: pr, disc, dir: sd });
  }
  // tail
  const hs = wingPanel({ root: 2.5, tip: 1.1, span: 4.3, sweep: -1.0, dihedral: 0.0, t: 0.1, m: 0, le: -7.2, y: 0.55, sections: 6, tipRound: 0.15 });
  g.add(both(hs, al));
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(-2.8, 0); fin.quadraticCurveTo(-3.3, 2.6, -3.0, 3.1); fin.lineTo(-2.2, 3.1); fin.quadraticCurveTo(-1.4, 1.2, 0, 0);
  const fg = new THREE.ExtrudeGeometry(fin, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 2, curveSegments: 12 });
  fg.translate(0, 0, -0.06);
  const finm = new THREE.Mesh(fg, al); finm.position.set(-6.6, 1.0, 0); g.add(finm);
  g.userData = { props };
  castAll(g, true, false);
  return g;
}

// ---------------------------------------------------------------------------
// BELL X-1: bullet-shaped (.50 cal) fuselage, thin straight wings.
export function x1({ color = 0xe8792b } = {}) {
  const g = new THREE.Group();
  const paint = mat.std(color, 0.35, 0.2), glass = mat.std(0x10161e, 0.1, 0.8);
  const st = [];
  for (let i = 0; i <= 20; i++) { const k = i / 20; const x = 4.7 - k * 9.4; const r = k < 0.35 ? 0.73 * Math.sqrt(Math.sin((k / 0.35) * Math.PI / 2)) : k < 0.85 ? 0.73 : 0.73 - (k - 0.85) / 0.15 * 0.28; st.push({ x, w: r, h: r }); }
  g.add(new THREE.Mesh(loft(st, { seg: 32 }), paint));
  const wing = wingPanel({ root: 1.9, tip: 1.1, span: 4.2, t: 0.08, m: 0, le: 0.9, y: -0.1, sections: 6, tipRound: 0.05 });
  g.add(both(wing, paint));
  const hs = wingPanel({ root: 1.2, tip: 0.6, span: 1.7, sweep: -0.3, t: 0.07, m: 0, le: -3.3, y: 0.35, sections: 4 });
  g.add(both(hs, paint));
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(-1.5, 0); fin.lineTo(-1.6, 1.5); fin.lineTo(-0.9, 1.5); fin.lineTo(0, 0);
  const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.08, bevelEnabled: false }), paint); fm.position.set(-2.9, 0.4, -0.04); g.add(fm);
  const cp = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), glass); cp.scale.set(2.2, 0.8, 1); cp.position.set(2.5, 0.58, 0); g.add(cp);
  for (let i = 0; i < 4; i++) { const n = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.2, 12), mat.std(0x222222, 0.5, 0.6)); n.rotation.z = Math.PI / 2; n.position.set(-4.75, (i % 2 - 0.5) * 0.24, (Math.floor(i / 2) - 0.5) * 0.24); g.add(n); }
  castAll(g, true, false);
  return g;
}

// ---------------------------------------------------------------------------
// CONCORDE: slender fuselage, ogival delta, four engines in paired nacelles.
export function concorde({ color = 0xf4f5f7 } = {}) {
  const g = new THREE.Group();
  const paint = mat.std(color, 0.3, 0.05), dark = mat.std(0x1a1d22, 0.5, 0.4), glass = mat.std(0x0b1016, 0.1, 0.9);
  const st = [];
  for (let i = 0; i <= 30; i++) { const k = i / 30; const x = 31 - k * 62; let r; if (k < 0.18) r = 1.45 * Math.pow(k / 0.18, 0.7); else if (k < 0.8) r = 1.45; else r = 1.45 * (1 - (k - 0.8) / 0.2 * 0.85); st.push({ x, w: r, h: r * 1.08, z: k < 0.05 ? -0.15 * (1 - k / 0.05) : 0 }); }
  g.add(new THREE.Mesh(loft(st, { seg: 36 }), paint));
  // ogival delta wing as a thin shape (planform) extruded
  const sh = new THREE.Shape();
  sh.moveTo(12, 0.0);
  sh.bezierCurveTo(4, 2.5, -6, 8.5, -14.5, 12.8);
  sh.lineTo(-19.5, 12.8); sh.lineTo(-22.5, 6); sh.lineTo(-24, 0); sh.lineTo(-22.5, -6); sh.lineTo(-19.5, -12.8); sh.lineTo(-14.5, -12.8);
  sh.bezierCurveTo(-6, -8.5, 4, -2.5, 12, 0);
  const wg = new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.15, bevelSize: 0.2, bevelSegments: 2, curveSegments: 24 });
  wg.rotateX(Math.PI / 2);
  const wm = new THREE.Mesh(wg, paint); wm.position.y = -0.55; g.add(wm);
  // nacelles
  for (const sd of [-1, 1]) {
    const n = new THREE.Mesh(new THREE.BoxGeometry(11, 0.9, 2.2), dark.clone()); n.material.color.set(0xd9dbdf); n.position.set(-17, -1.25, sd * 4.6); g.add(n);
    for (const dz of [-0.55, 0.55]) { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.4, 16), dark); e.rotation.z = Math.PI / 2; e.position.set(-22.6, -1.25, sd * 4.6 + dz); g.add(e); }
  }
  // fin
  const fin = new THREE.Shape(); fin.moveTo(0, 0); fin.lineTo(-9, 0); fin.lineTo(-10.5, 0.4); fin.lineTo(-10, 6.5); fin.lineTo(-7.5, 6.5); fin.lineTo(0, 0);
  const fm = new THREE.Mesh(new THREE.ExtrudeGeometry(fin, { depth: 0.25, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 1 }), paint); fm.position.set(-17, 0.9, -0.12); g.add(fm);
  for (const sd of [-1, 1]) { const ws = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.35), glass); ws.position.set(25.6, 0.85, sd * 0.78); ws.rotation.set(0, sd * 1.0, sd * 0.3); g.add(ws); }
  castAll(g, true, false);
  return g;
}

// ---------------------------------------------------------------------------
// SIKORSKY VS-300 (1939): welded tube frame, open seat, 3-blade rotor, tail boom + tail rotor.
export function vs300() {
  const g = new THREE.Group();
  const tubeM = mat.std(0xd6d2c8, 0.45, 0.6), black = mat.std(0x1a1a1a, 0.6), rotorM = mat.std(0x8a7a5e, 0.6), seatM = mat.std(0x5a3a2a, 0.8);
  const T = (pts, r = 0.035) => g.add(tube(pts, r, tubeM));
  // triangulated cage
  const A = [1.0, 0.3, 0.5], B = [1.0, 0.3, -0.5], C = [-0.8, 0.3, 0.5], D = [-0.8, 0.3, -0.5], Et = [0.2, 1.6, 0], F = [-0.6, 1.4, 0];
  T([A, B]); T([C, D]); T([A, C]); T([B, D]); T([A, Et]); T([B, Et]); T([C, F]); T([D, F]); T([Et, F]);
  T([A, D], 0.025); T([B, C], 0.025);
  // tail boom (triangular truss)
  const tip = [-6.2, 0.9, 0];
  T([C, tip], 0.03); T([D, tip], 0.03); T([F, tip], 0.03);
  for (let i = 1; i < 6; i++) { const k = i / 6; const p1 = [lerp(-0.8, -6.2, k), lerp(0.3, 0.9, k), lerp(0.5, 0, k)], p2 = [lerp(-0.8, -6.2, k), lerp(0.3, 0.9, k), lerp(-0.5, 0, k)], p3 = [lerp(-0.6, -6.2, k), lerp(1.4, 0.9, k), 0]; T([p1, p2], 0.018); T([p2, p3], 0.018); T([p3, p1], 0.018); }
  // landing gear: wheels
  for (const [x, z] of [[1.1, 0.9], [1.1, -0.9], [-5.6, 0]]) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(x < 0 ? 0.12 : 0.22, x < 0 ? 0.12 : 0.22, 0.08, 16), black); w.rotation.x = Math.PI / 2; w.position.set(x, x < 0 ? 0.12 : 0.22, z); g.add(w);
    if (x > 0) T([[x, 0.22, z], [0.6, 0.3, z * 0.55]], 0.025), T([[x, 0.22, z], [1.0, 0.3, z * 0.55]], 0.025);
    else T([[x, 0.12, 0], [-5.4, 0.85, 0]], 0.02);
  }
  // engine block & seat
  const eng = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.45, 0.5), black); eng.position.set(-0.3, 0.6, 0); g.add(eng);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.08, 0.5), seatM); seat.position.set(0.55, 0.62, 0); g.add(seat);
  const back = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.5, 0.5), seatM); back.position.set(0.32, 0.86, 0); g.add(back);
  // mast + rotor
  T([Et, [0.2, 2.3, 0]], 0.05);
  const rotor = new THREE.Group(); rotor.position.set(0.2, 2.32, 0);
  for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(4.5, 0.03, 0.22), rotorM); b.position.x = 2.3; const piv = new THREE.Group(); piv.rotation.y = (i / 3) * Math.PI * 2; b.rotation.x = 0.08; piv.add(b); rotor.add(piv); }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.14, 16), black); rotor.add(hub);
  g.add(rotor);
  const rdisc = blurDisc(4.6, 0xbdb4a0, 0.0, 'y'); rdisc.position.copy(rotor.position); g.add(rdisc);
  const tr = new THREE.Group(); tr.position.set(-6.25, 1.05, 0.12);
  for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.8, 0.08), rotorM); b.position.y = 0.4; const piv = new THREE.Group(); piv.rotation.z = i * Math.PI; piv.add(b); tr.add(piv); }
  g.add(tr);
  // pilot with fedora
  const pilot = mannequin(mat.std(0x2b2b30, 0.8), { height: 1.7 });
  poseMannequin(pilot, { spine: 0.05, neck: -0.25, L: { sh: 0.9, el: 0.6, hp: 1.5, kn: -1.4 }, R: { sh: 0.6, el: 0.9, hp: 1.5, kn: -1.4 } });
  pilot.position.set(0.55, -0.27, 0);
  g.add(pilot);
  const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.015, 20), black), hatTop = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.1, 16), black);
  const hat = new THREE.Group(); hat.add(hatBrim, hatTop); hatTop.position.y = 0.05;
  pilot.userData.neck.add(hat); hat.position.set(0, 0.25, 0);
  g.userData = { rotor, rdisc, tr, pilot };
  castAll(g, true, false);
  return g;
}
const lerp = (a, b, t) => a + (b - a) * t;

// ---------------------------------------------------------------------------
// SATURN V (lathe profile, metres; 110.6 m tall)
export function saturnV() {
  const g = new THREE.Group();
  const white = mat.std(0xf1f1ee, 0.5), black = mat.std(0x151515, 0.6), metal = mat.std(0x777777, 0.4, 0.8);
  const prof = [[0, 0], [5.1, 0], [5.1, 42], [5.1, 42.1], [5.1, 44], [3.3, 48], [3.3, 49], [3.3, 66], [3.3, 67], [3.3, 81.6], [3.3, 82], [3.3, 85], [1.95, 91], [1.95, 95.6], [1.4, 99.7], [0.3, 102.5], [0, 103]];
  const pts = prof.map(([r, y]) => new THREE.Vector2(r, y));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), white);
  g.add(body);
  // black roll pattern bands on S-IC
  for (const y of [0.5, 24, 38]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(5.13, 5.13, y === 24 ? 6 : 3, 48, 1, true, 0, Math.PI / 2), black); b.position.y = y + 1.5; g.add(b); }
  const band = new THREE.Mesh(new THREE.CylinderGeometry(3.32, 3.32, 3, 48, 1, true), black); band.position.y = 64; g.add(band);
  // fins + engine bells
  for (let i = 0; i < 4; i++) {
    const a = i * Math.PI / 2 + Math.PI / 4;
    const f = new THREE.Mesh(new THREE.BoxGeometry(0.3, 8, 3.2), white); f.position.set(Math.cos(a) * 6.2, 3.5, Math.sin(a) * 6.2); f.rotation.y = -a; g.add(f);
    const e = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.8, 5.8, 20, 1, true), metal); e.position.set(Math.cos(a) * 2.9, -2.9, Math.sin(a) * 2.9); g.add(e);
  }
  const ec = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.8, 5.8, 20, 1, true), metal); ec.position.y = -2.9; g.add(ec);
  // escape tower
  const tw = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.4, 7.5, 8), mat.std(0xb03a20, 0.5)); tw.position.y = 106.5; g.add(tw);
  castAll(g, true, false);
  return g;
}

// ---------------------------------------------------------------------------
// QUADCOPTER (consumer camera drone, ~0.35 m)
export function quadcopter({ body = 0x2a2d33, accent = 0xff5a00 } = {}) {
  const g = new THREE.Group();
  const shell = mat.std(body, 0.35, 0.3), carbon = mat.std(0x16171a, 0.45, 0.4), motorM = mat.std(0x3a3d44, 0.3, 0.9), propM = mat.std(0x101114, 0.5, 0.1), acc = mat.std(accent, 0.4, 0.1, { emissive: accent, emissiveIntensity: 0.6 });
  const core = new THREE.Mesh(new THREE.CapsuleGeometry(0.05, 0.13, 8, 16), shell); core.rotation.z = Math.PI / 2; core.scale.set(0.62, 1, 1.15); g.add(core);
  const top = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.012, 0.07), mat.std(0x3a3e46, 0.25, 0.6)); top.position.set(-0.01, 0.032, 0); g.add(top);
  const props = [];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2;
    const ex = Math.cos(a) * 0.17, ez = Math.sin(a) * 0.17;
    g.add(strut([0, 0, 0], [ex, 0.01, ez], 0.012, carbon));
    const m = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 0.03, 16), motorM); m.position.set(ex, 0.025, ez); g.add(m);
    const led = new THREE.Mesh(new THREE.SphereGeometry(0.006, 8, 6), acc); led.position.set(ex, -0.004, ez); g.add(led);
    const p = new THREE.Group(); p.position.set(ex, 0.045, ez);
    for (let k = 0; k < 2; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.002, 0.014), propM); b.position.x = 0.055; const piv = new THREE.Group(); piv.rotation.y = k * Math.PI; b.rotation.x = 0.2; piv.add(b); p.add(piv); }
    g.add(p);
    const disc = blurDisc(0.11, 0x8899aa, 0.0, 'y'); disc.position.copy(p.position); g.add(disc);
    props.push({ p, disc, dir: i % 2 ? 1 : -1 });
  }
  const gim = new THREE.Mesh(new THREE.SphereGeometry(0.025, 16, 12), carbon); gim.position.set(0.09, -0.04, 0); g.add(gim);
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.012, 16), mat.std(0x223355, 0.05, 1)); lens.position.set(0.116, -0.04, 0); lens.rotation.y = Math.PI / 2; g.add(lens);
  g.userData = { props, vertical: true };
  castAll(g, true, false);
  return g;
}
export function spinRotors(model, angle, blur = 0) {
  for (const { p, disc, dir } of model.userData.props) { p.rotation.y = angle * dir; disc.material.opacity = blur; p.visible = blur < 0.3; }
}

// ---------------------------------------------------------------------------
// eVTOL AIR TAXI (generic tilt-prop, 6 rotors, V-tail)
export function evtol({ color = 0xf2f3f5 } = {}) {
  const g = new THREE.Group();
  const paint = mat.std(color, 0.25, 0.1), dark = mat.std(0x15181d, 0.3, 0.5), glass = mat.phys(0x0a1220, 0.05, 0.6, { transparent: true, opacity: 0.85 });
  const st = [{ x: 3.4, w: 0.05, h: 0.05, z: 0.1 }, { x: 3.1, w: 0.6, h: 0.6, z: 0.1 }, { x: 2.2, w: 0.85, h: 0.82, ht: 0.95 }, { x: 0.4, w: 0.9, h: 0.85, ht: 1.0 }, { x: -1.4, w: 0.7, h: 0.7, z: 0.15 }, { x: -3.6, w: 0.2, h: 0.25, z: 0.5 }, { x: -4.1, w: 0.04, h: 0.06, z: 0.6 }];
  g.add(new THREE.Mesh(loft(st, { seg: 32 }), paint));
  const can = new THREE.Mesh(new THREE.SphereGeometry(0.85, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), glass); can.scale.set(2.0, 0.55, 0.92); can.position.set(1.6, 0.55, 0); g.add(can);
  const wing = wingPanel({ root: 1.4, tip: 0.9, span: 5.4, t: 0.12, m: 0.03, le: 0.6, y: 0.95, sections: 8, tipRound: 0.05 });
  g.add(both(wing, paint));
  const props = [];
  for (const sd of [-1, 1]) for (const zz of [1.8, 3.8, 5.4]) {
    const z = sd * zz;
    const pod = new THREE.Mesh(new THREE.CapsuleGeometry(0.12, 1.4, 6, 12), paint); pod.rotation.z = Math.PI / 2; pod.position.set(0.2, 0.92, z); g.add(pod);
    const p = new THREE.Group(); p.position.set(1.0, 0.92, z); p.rotation.z = -Math.PI / 2;
    for (let k = 0; k < 5; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.02, 0.12), dark); b.position.x = 0.45; const piv = new THREE.Group(); piv.rotation.y = (k / 5) * Math.PI * 2; b.rotation.x = 0.25; piv.add(b); p.add(piv); }
    g.add(p);
    const disc = blurDisc(0.9, 0xc8d0da, 0.0, 'y'); disc.position.set(0, 0, 0); p.add(disc);
    props.push({ p, disc, dir: (zz > 3 ? 1 : -1) * sd });
  }
  for (const sd of [-1, 1]) { const v = wingPanel({ root: 0.9, tip: 0.5, span: 1.6, sweep: -0.5, t: 0.1, m: 0, le: -3.0, y: 0.5, sections: 4 }); const m = new THREE.Mesh(sd > 0 ? v : mirrorZ(v), paint); m.rotation.x = sd * -0.7; m.position.y = 0.0; g.add(m); }
  g.userData = { props };
  castAll(g, true, false);
  return g;
}
export function tiltProps(model, tilt, angle, blur = 0) {
  for (const { p, disc, dir } of model.userData.props) { p.rotation.z = -tilt; p.rotation.y = angle * dir; disc.material.opacity = blur; p.children.forEach((c) => { if (c !== disc) c.visible = blur < 0.3; }); }
}
