// NA80 双余度飞控 · 等轴测试验台（anatomy 技能）
// 生成 na80-video/stage.html：1920×1080 的视频舞台，window.seek(t) 可逐帧确定性渲染。
//   node figure/build.mjs            构建舞台页
//   node figure/build.mjs --audit    同时跑 anatomy 几何审计
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "../../.claude/skills/anatomy/kit/iso-kit.mjs";
import * as G from "../../.claude/skills/anatomy/kit/lathe.mjs";
import * as A from "../../.claude/skills/anatomy/kit/audit.mjs";
import { tubePieces, tubeSvg } from "../../.claude/skills/anatomy/kit/tube.mjs";
import { kitScript } from "../../.claude/skills/anatomy/scripts/inline-kit.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..");
const TIMELINE = JSON.parse(readFileSync(join(ROOT, "timeline.json"), "utf8"));

// ───────────────────────── world (单位 ≈ 1 mm) ─────────────────────────
const W = 960;
const H = 540;
const PLATE = { x: -290, y: -185, w: 650, d: 318, r: 12 };
const PLATE_H = 14;
const FOOT_H = 6;

// NA80：93.2 × 66.1 × 35.2 mm 的真实外形（只用于画对比例，片中不讲参数）
const UNIT = { w: 66, d: 93, h: 35, tray: 8, bulk: 3, chamfer: 6 };
const UNITS = { A: { x: -205, y: -165 }, B: { x: -55, y: -165 } };
const FRONT = UNITS.A.y + UNIT.d; // -72，接插面
const LIFT = 82;

const VOTER = { x: -60, y: -2, w: 110, d: 62, r: 4 };
const VX0 = VOTER.x;
const VY0 = VOTER.y;
const VOTER_H = 22;
const VX1 = VOTER.x + VOTER.w; // 右侧面 x
const VY1 = VOTER.y + VOTER.d; // 前面 y
const CAR = { x: VX0 + 20, y: VY0 + 22, w: 22, d: 30, r: 2 };
const IN = { A: [VX0 + 20, VY0 + 10], B: [VX0 + 90, VY0 + 10] };
const CAR_TRAVEL = 48;

const ESC = { x: 125, y: -92, w: 52, d: 34, r: 2.5 };
const ESC_H = 13;
const MOTOR = [275, -92];
const MOTOR_Z = 99;
const PROP_Z = 123.4;
const PROP_R = 72;
const SERVO = { x: 175, y: 52, w: 26, d: 46, r: 1.5 };
const SERVO_H = 32;
const HORN_C = [SERVO.x + 13, SERVO.y + 12];
const HORN_Z = 35;

const TAB = { cx: -200, yb: 118, zb: 10, w: 104, h: 74, t: 7, tilt: (24 * Math.PI) / 180 };

const P = k.fitProjection(
  [...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [MOTOR[0] + PROP_R, MOTOR[1] - PROP_R, PROP_Z], [MOTOR[0] - PROP_R, MOTOR[1] + PROP_R, PROP_Z], [MOTOR[0], MOTOR[1] - PROP_R, PROP_Z + 6]],
  W,
  H,
  { pad: 40, azimuth: 52 },
);
const V = G.viewOf(P);
const KS = G.scaleOf(P);
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const L = (d, style) => k.lineSvg(d, style);
const D = (points, style) => k.dotsSvg(points, style);
const f2 = (n) => +n.toFixed(2);

// ───────────────────────── recorder ─────────────────────────
const R = A.recorder(P);
function put(name, ref, svg, shapes, { bias = 0, piece = "", move = [0, 0, 0], grp = "", part = "", attrs = "" } = {}) {
  return R.put({ name, at: ref, bias, piece, move, shapes, svg, grp, part, attrs });
}
const record = (shape) => R.solid(shape);
function box(name, plan, z, h, style = {}, { steps = 3, bevel = 0, extra = "", inner = "", ...rest } = {}) {
  const shape = record(A.slab(plan, z, h, { name }, steps));
  return put(name, [plan.x + plan.w / 2, plan.y + plan.d / 2, z + h / 2], S(k.slabOf(plan, z, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [shape], rest);
}
function cyl(name, cx, cy, r, z, h, style = {}, { steps = 28, bevel = 0, extra = "", inner = "", ...rest } = {}) {
  const shape = record(A.cylinder(cx, cy, r, z, h, { name }));
  return put(name, [cx, cy, z + h / 2], S(k.cylinder(cx, cy, r, z, h, P, steps, bevel), { tone: "mid", ...style, inner }) + extra, [shape], rest);
}
function prism(name, F, poly, s0, s1, style = {}, { extra = "", inner = "", ref, ...rest } = {}) {
  const shape = record(A.prism(F, poly, s0, s1, { name }));
  const cu = poly.reduce((a, p) => a + p[0], 0) / poly.length;
  const cv = poly.reduce((a, p) => a + p[1], 0) / poly.length;
  const centre = G.add3(G.add3(G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), G.mul3(F.u, cu)), G.mul3(F.v, cv));
  return put(name, ref ?? centre, S(G.prismOf(F, poly, s0, s1, P), { tone: "mid", ...style, inner }) + extra, [shape], rest);
}
function disc(name, F, s0, s1, r, style = {}, { extra = "", inner = "", bevel = 0, ...rest } = {}) {
  const shape = record(A.disc(F, s0, s1, r, { name }));
  return put(name, G.add3(F.o, G.mul3(F.a, (s0 + s1) / 2)), S(G.disc(s0, s1, r, F, P, { bevel }), { tone: "mid", ...style, inner }) + extra, [shape], rest);
}
const rect = (u0, v0, u1, v1) => [[u0, v0], [u1, v0], [u1, v1], [u0, v1]];
const roundRect = (u0, v0, u1, v1, r, steps = 4) => k.roundedPlan({ x: u0, y: v0, w: u1 - u0, d: v1 - v0, r }, steps);
function planeMatrix(o, ex, ey) {
  const p0 = at(o);
  const px = at(G.add3(o, ex));
  const py = at(G.add3(o, ey));
  const v = (x) => x.toFixed(4);
  return `matrix(${v(px[0] - p0[0])} ${v(px[1] - p0[1])} ${v(py[0] - p0[0])} ${v(py[1] - p0[1])} ${p0[0].toFixed(2)} ${p0[1].toFixed(2)})`;
}
const FRONT_FACE = (y) => (x0, z0, x1, z1, r = 1, steps = 4) => k.pathOf(roundRect(x0, z0, x1, z1, r, steps).map(([x, z]) => at([x, y, z])), true);

// ───────────────────────── 底板 ─────────────────────────
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, -PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  const feet = k.corners(PLATE, 26).sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  for (const [x, y] of feet) {
    out.push(S(k.cylinder(x, y, 9, -PLATE_H - FOOT_H, 2, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 7, -PLATE_H - FOOT_H + 2, FOOT_H - 2, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, -PLATE_H, PLATE_H, P, 8, 1.6), { tone: "mid", inner: L(k.sideSeam(PLATE, -5, P, 8), { tone: "faint" }) }));
  out.push(L(k.planOutline(k.insetPlan(PLATE, 6), 0, P), { tone: "lo" }));
  const screws = k.corners(PLATE, 12);
  out.push(L(screws.map(([x, y]) => k.ring(x, y, 2.6, 0, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, 0])), { size: 0.55 }));
  // 前缘刻度尺
  const strip = { x: -122, y: PLATE.y + PLATE.d - 17, w: 452, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, 0, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 5, 5, strip.y + 0.8, 0.6, [2.2, 4], P);
  out.push(L(ticks.minor, { tone: "lo" }), L(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, 0.6])], { size: 0.45 }));
  // 铭牌
  const label = { x: 240, y: 88, w: 56, d: 14, r: 1.4 };
  out.push(S(k.slabOf(label, 0, 0.8, P, 3), { tone: "lo", crease: "none" }));
  out.push(L(k.planOutline(k.insetPlan(label, 1.6), 0.8, P, 3), { tone: "faint" }));
  out.push(L([38, 26, 32].map((w, i) => k.lineOnTop([label.x + 5, label.y + 4 + i * 3.2], [label.x + 5 + w, label.y + 4 + i * 3.2], 0.8, P)).join(""), { tone: "lo", free: true }));
  out.push(D([at([label.x + label.w - 4, label.y + 4, 0.8]), at([label.x + label.w - 4, label.y + label.d - 4, 0.8])], { size: 0.45 }));
  const shape = record(A.slab(PLATE, -PLATE_H, PLATE_H, { name: "stand.plate", ground: true }));
  put("stand.plate", [0, 0, -100], out.join(""), [shape], { bias: -1000 });
}

// ───────────────────────── NA80 飞控 ─────────────────────────
const LID_POLY = (z0) => [[0, z0], [UNIT.w, z0], [UNIT.w, UNIT.h - UNIT.chamfer], [UNIT.w - UNIT.chamfer, UNIT.h], [UNIT.chamfer, UNIT.h], [0, UNIT.h - UNIT.chamfer]];
const CHIPS = (x0, y0) => ({
  cpu: { x: x0 + 10, y: y0 + 24, w: 20, d: 20, r: 0.8, h: 2.4 },
  ram: { x: x0 + 37, y: y0 + 24, w: 20, d: 9, r: 0.6, h: 1.8 },
  flash: { x: x0 + 37, y: y0 + 37, w: 14, d: 9, r: 0.6, h: 1.8 },
  imu: { x: x0 + 13, y: y0 + 55, w: 9, d: 9, r: 0.6, h: 2.0 },
  baro: { cx: x0 + 42, cy: y0 + 60, r: 3.8, h: 3.4 },
});
const PLUGS = (x0) => ({
  upper: { cx: x0 + UNIT.w / 2, z: 24 },
  lower: { cx: x0 + UNIT.w / 2, z: 12 },
});

function unit(id) {
  const { x: x0, y: y0 } = UNITS[id];
  const x1 = x0 + UNIT.w;
  const cx = x0 + UNIT.w / 2;
  const grp = id;
  const board = { x: x0 + 3, y: y0 + 3, w: UNIT.w - 6, d: UNIT.d - UNIT.bulk - 6, r: 1 };
  const BZ = UNIT.tray + 1.4;

  // 安装耳
  for (const [ex, side] of [[x0 - 9, -1], [x1, 1]]) {
    for (const ey of [y0 + 12, y0 + 62]) {
      const ear = { x: ex, y: ey, w: 9, d: 16, r: side < 0 ? 0 : 0 };
      const hx = ex + 4.5;
      const hy = ey + 8;
      box(`${id}.ear.${ex}.${ey}`, ear, 0, 2.6, { tone: "lo" }, {
        grp,
        steps: 2,
        extra: S(k.cylinder(hx, hy, 2.6, 2.6, 1.2, P, 18), { tone: "mid" }) + L(k.lineOnTop([hx - 1.6, hy], [hx + 1.6, hy], 3.8, P), { tone: "lo" }),
      });
    }
  }
  // 深色底座
  box(`${id}.tray`, { x: x0, y: y0, w: UNIT.w, d: UNIT.d - UNIT.bulk, r: 0.6 }, 0, UNIT.tray, { tone: "lo" }, { grp, steps: 2, bevel: 0.5 });
  // 主板与走线
  const chips = CHIPS(x0, y0);
  const c = chips;
  const traces = [
    [[c.cpu.x + c.cpu.w, c.cpu.y + 5], [c.ram.x, c.cpu.y + 5]],
    [[c.cpu.x + c.cpu.w, c.cpu.y + 15], [c.flash.x - 3, c.cpu.y + 15], [c.flash.x, c.flash.y + 3]],
    [[c.cpu.x + 6, c.cpu.y + c.cpu.d], [c.cpu.x + 6, c.imu.y - 3], [c.imu.x + 4.5, c.imu.y]],
    [[c.cpu.x + 14, c.cpu.y + c.cpu.d], [c.cpu.x + 14, c.baro.cy - 4], [c.baro.cx - c.baro.r, c.baro.cy]],
    [[c.imu.x + c.imu.w, c.imu.y + 6], [c.baro.cx - c.baro.r, c.imu.y + 6]],
    [[c.ram.x + 6, c.ram.y + c.ram.d], [c.ram.x + 6, c.flash.y]],
  ];
  const traceSvg = L(traces.map((pts) => k.onTop(pts, BZ, P)).join(""), { tone: "faint" });
  const holes = k.corners(board, 3.4);
  box(`${id}.board`, board, UNIT.tray, 1.4, { tone: "lo", crease: "faint" }, {
    grp,
    steps: 2,
    extra: traceSvg + L(holes.map(([hx, hy]) => k.ring(hx, hy, 1.6, BZ, P, 14)).join(""), { tone: "lo" }) + D(holes.map(([hx, hy]) => at([hx, hy, BZ])), { size: 0.45 }),
  });
  // 无源器件
  for (const [px, py, w, d] of [[31, 21, 3, 1.6], [31, 47, 3, 1.6], [7, 50, 1.6, 3], [27, 55, 3, 1.6], [53, 52, 1.6, 3], [55, 64, 3, 1.6], [24, 68, 3, 1.6], [8, 30, 1.6, 3]]) {
    box(`${id}.cap.${px}.${py}`, { x: x0 + px, y: y0 + py, w, d, r: 0.3 }, BZ, 1.0, { tone: "mid", crease: "none" }, { grp, steps: 1 });
  }
  box(`${id}.xtal`, { x: x0 + 31, y: y0 + 28, w: 4, d: 9, r: 2 }, BZ, 1.6, { tone: "mid" }, { grp, steps: 4 });
  // 芯片：CPU / 内存 / 存储 / IMU / 气压计
  const pinsOf = (p) => {
    const lines = [];
    for (let s = 2.4; s < p.w - 1.6; s += 2) {
      lines.push(k.lineOnTop([p.x + s, p.y - 1.6], [p.x + s, p.y], BZ, P), k.lineOnTop([p.x + s, p.y + p.d], [p.x + s, p.y + p.d + 1.6], BZ, P));
    }
    for (let s = 2.4; s < p.d - 1.6; s += 2) {
      lines.push(k.lineOnTop([p.x - 1.6, p.y + s], [p.x, p.y + s], BZ, P), k.lineOnTop([p.x + p.w, p.y + s], [p.x + p.w + 1.6, p.y + s], BZ, P));
    }
    return L(lines.join(""), { tone: "mid" });
  };
  const chip = (name, p, pins) => {
    const shape = record(A.slab(p, BZ, p.h, { name: `${id}.${name}` }, 2));
    const top = BZ + p.h;
    const mark = D([at([p.x + 2.2, p.y + 2.2, top])], { size: 0.55, tone: "mid" });
    const inset = L(k.planOutline(k.insetPlan(p, Math.min(p.w, p.d) * 0.18), top, P, 2), { tone: "faint" });
    put(`${id}.${name}`, [p.x + p.w / 2, p.y + p.d / 2, BZ + p.h / 2], (pins ? pinsOf(p) : "") + S(k.slabOf(p, BZ, p.h, P, 2, 0.4), { tone: "hi", crease: "lo" }) + inset + mark, [shape], { grp, part: name });
  };
  chip("cpu", c.cpu, true);
  chip("ram", c.ram, true);
  chip("flash", c.flash, true);
  chip("imu", c.imu, false);
  {
    const b = c.baro;
    const shape = record(A.cylinder(b.cx, b.cy, b.r, BZ, b.h, { name: `${id}.baro` }));
    const top = BZ + b.h;
    put(`${id}.baro`, [b.cx, b.cy, BZ + b.h / 2], S(k.cylinder(b.cx, b.cy, b.r, BZ, b.h, P, 24, 0.4), { tone: "hi", crease: "lo" }) + L(k.ring(b.cx, b.cy, 1.2, top, P, 14), { tone: "mid" }) + D([at([b.cx, b.cy, top])], { size: 0.5, tone: "hi" }), [shape], { grp, part: "baro" });
  }
  // 接插件背面（板上排针座）
  box(`${id}.header`, { x: cx - 18, y: FRONT - UNIT.bulk - 13.5, w: 36, d: 10, r: 0.6 }, BZ, 16, { tone: "mid" }, {
    grp,
    steps: 2,
    extra: D([...Array(14)].map((_, i) => at([cx - 15.6 + i * 2.4, FRONT - UNIT.bulk - 8.5, BZ + 16])), { size: 0.45, tone: "mid" }),
  });

  // 银色上盖（抬起即打开）
  const F = G.frameOf([x0, y0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  const T = UNIT.h;
  const chev = [[cx, y0 + 30], [cx + 9, y0 + 40], [cx + 6.6, y0 + 40], [cx, y0 + 33.4], [cx - 6.6, y0 + 40], [cx - 9, y0 + 40]];
  const sideLabel = k.pathOf(roundRect(y0 + 14, 14, y0 + 62, 24, 1.6, 4).map(([y, z]) => at([x1, y, z])), true);
  const ledAt = [x1 - 10, FRONT - UNIT.bulk - 10, T];
  const lidExtra = [
    L(k.onTop(chev, T, P, true), { tone: "mid" }),
    k.faceTextSvg(k.topMatrix([cx, y0 + 18], T, P, "x"), "NA80", { size: 5.2, tone: "lo", anchor: "middle" }),
    k.faceTextSvg(k.topMatrix([cx - 14, FRONT - 12], T, P, "x"), id, { size: 13, tone: "mid", anchor: "middle" }),
    L(sideLabel, { tone: "faint" }),
    S(k.cylinder(ledAt[0], ledAt[1], 3.2, T, 0.6, P, 20), { tone: "lo", crease: "none" }),
    `<path data-led="${id}" class="led" d="${k.ring(ledAt[0], ledAt[1], 2.2, T + 0.6, P, 24)}"/>`,
    `<circle data-led-glow="${id}" class="led-glow" cx="${f2(at([ledAt[0], ledAt[1], T + 0.6])[0])}" cy="${f2(at([ledAt[0], ledAt[1], T + 0.6])[1])}" r="7"/>`,
  ].join("");
  // 上盖是空心外壳：按顶板 + 两侧壁 + 后壁记录真实形状
  const SD = UNIT.d - UNIT.bulk;
  const roof = UNIT.h - UNIT.chamfer - 1;
  const shell = [
    record(A.prism(F, [[0, roof], [UNIT.w, roof], ...LID_POLY(UNIT.tray).slice(2)], 0, SD, { name: `${id}.lid` })),
    record(A.prism(F, rect(0, UNIT.tray, 2, roof), 0, SD, { name: `${id}.lid.wall.l` })),
    record(A.prism(F, rect(UNIT.w - 2, UNIT.tray, UNIT.w, roof), 0, SD, { name: `${id}.lid.wall.r` })),
    record(A.prism(F, rect(2, UNIT.tray, UNIT.w - 2, roof), 0, 2, { name: `${id}.lid.wall.b` })),
    record(A.prism(F, rect(2, UNIT.tray, UNIT.w - 2, roof), SD - 2, SD, { name: `${id}.lid.wall.f` })),
  ];
  put(`${id}.lid`, [cx, y0 + SD / 2, (UNIT.tray + T) / 2], S(G.prismOf(F, LID_POLY(UNIT.tray), 0, SD, P), { tone: "hi", crease: "lo" }) + lidExtra, shell, { grp, piece: `lid${id}`, move: [0, 0, LIFT], part: "lid" });

  // 前端接插面（不随上盖抬起）
  const bulkF = G.frameOf([x0, y0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  prism(`${id}.bulkhead`, bulkF, LID_POLY(0), UNIT.d - UNIT.bulk, UNIT.d, { tone: "hi", crease: "lo" }, {
    grp,
    extra: L(k.segment([x0, FRONT, UNIT.tray], [x1, FRONT, UNIT.tray], P), { tone: "faint" }),
  });
  // 射频头（金色 SMA 位置）与皮托管嘴
  const along = (x, z) => G.frameOf([x, FRONT, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  for (const x of [x0 + 8, x1 - 8]) {
    const F1 = along(x, 28);
    disc(`${id}.sma.nut.${x}`, F1, 0, 2.2, 3.4, { tone: "mid" }, { grp });
    disc(`${id}.sma.body.${x}`, F1, 2.2, 8, 2.3, { tone: "hi" }, { grp, extra: L(G.circleOf(F1, 8, 1.1, P), { tone: "mid" }) });
    const F2 = along(x, 9.5);
    disc(`${id}.pitot.base.${x}`, F2, 0, 2.6, 3.2, { tone: "mid" }, { grp });
    disc(`${id}.pitot.tube.${x}`, F2, 2.6, 9, 1.5, { tone: "hi" }, { grp, extra: D([at([x, FRONT + 9, 9.5])], { size: 0.5, tone: "lo" }) });
  }
  // 两个已插合的线缆插头（上：去表决器；下：双机同步）
  for (const [key, plug] of Object.entries(PLUGS(x0))) {
    const plan = { x: plug.cx - 14, y: FRONT, w: 28, d: 10, r: 1.2 };
    const z0 = plug.z - 4.6;
    const screws = [plug.cx - 11.2, plug.cx + 11.2];
    box(`${id}.plug.${key}`, plan, z0, 9.2, { tone: "mid" }, {
      grp: key === "lower" ? `${id} S` : grp,
      steps: 2,
      bevel: 0.4,
      inner: L(k.sideSeam(plan, z0 + 3, P, 2), { tone: "faint" }),
      extra: screws.map((sx) => S(G.disc(10, 12.4, 1.7, along(sx, plug.z), P), { tone: "mid" })).join("") + L(screws.map((sx) => G.circleOf(along(sx, plug.z), 12.4, 0.7, P)).join(""), { tone: "lo" }),
    });
    const Fb = along(plug.cx, plug.z);
    disc(`${id}.boot.${key}`, Fb, 10, 16, 3.2, { tone: "mid" }, { grp: key === "lower" ? `${id} S` : grp });
  }
}

// ───────────────────────── 表决器 ─────────────────────────
function voter() {
  const grp = "V";
  const top = VOTER_H;
  const seam = L(k.sideSeam(VOTER, 7, P, 6), { tone: "faint" });
  const screws = k.corners(VOTER, 6);
  box("voter.body", VOTER, 0, VOTER_H, { tone: "mid" }, {
    grp,
    steps: 6,
    bevel: 1,
    inner: seam,
    extra:
      L(screws.map(([x, y]) => k.ring(x, y, 2.1, top, P, 14)).join(""), { tone: "lo" }) +
      D(screws.map(([x, y]) => at([x, y, top])), { size: 0.5 }) +
      L(k.planOutline(k.insetPlan(VOTER, 4), top, P, 6), { tone: "faint" }),
  });
  // 轨道底板、导轨、触点块
  const track = { x: VX0 + 10, y: VY0 + 20, w: 90, d: 34, r: 2 };
  box("voter.track", track, top, 1.4, { tone: "lo", crease: "none" }, { grp, steps: 3 });
  for (const y of [VY0 + 25, VY0 + 46]) box(`voter.rail.${y}`, { x: VX0 + 20, y, w: 70, d: 3, r: 0.8 }, top + 1.4, 2.6, { tone: "mid" }, { grp, steps: 2, bevel: 0.3 });
  const blocks = [["A", VX0 + 10], ["B", VX0 + 90]];
  for (const [id, x] of blocks) {
    const plan = { x, y: VY0 + 22, w: 10, d: 30, r: 1 };
    box(`voter.block.${id}`, plan, top + 1.4, 7.6, { tone: "hi", crease: "lo" }, {
      grp: id === "B" ? "V B" : grp,
      part: `block${id}`,
      steps: 2,
      bevel: 0.4,
      extra: D([at([x + 5, VY0 + 26, top + 9]), at([x + 5, VY0 + 48, top + 9])], { size: 0.5 }) + L(k.planOutline(k.insetPlan(plan, 2.4), top + 9, P, 2), { tone: "faint" }) + k.faceTextSvg(k.topMatrix([x + 5, VY0 + 37], top + 9, P, "x"), id, { size: 6, tone: "lo", anchor: "middle" }),
    });
  }
  // 刻度条
  const strip = { x: VX0 + 20, y: VY0 + 55, w: 70, d: 5, r: 0.8 };
  box("voter.strip", strip, top, 0.6, { tone: "lo", crease: "none" }, {
    grp,
    steps: 2,
    extra: (() => {
      const t = k.topTicks(strip.x + 3, strip.x + strip.w - 3, 4, 4, strip.y + 0.6, top + 0.6, [1.6, 3], P);
      return L(t.minor, { tone: "lo" }) + L(t.major, { tone: "mid" });
    })(),
  });
  // 滑块（换向器）：静止在 A 位，move 指向 B 位
  const ctop = top + 4 + 6;
  const knob = [CAR.x + CAR.w / 2, CAR.y + CAR.d / 2];
  const carShapes = [record(A.slab(CAR, top + 4, 6, { name: "voter.carriage" }, 3)), record(A.cylinder(knob[0], knob[1], 5.4, ctop, 5, { name: "voter.knob" }))];
  put(
    "voter.carriage",
    [knob[0], knob[1], top + 7],
    [
      S(k.slabOf(CAR, top + 4, 6, P, 3, 0.6), { tone: "hi", crease: "lo", lit: true }),
      D([0, 1, 2, 3].map((i) => at([CAR.x + 3 + i * 5.3, CAR.y + CAR.d - 2.4, ctop])), { size: 0.45, tone: "mid" }),
      S(k.cylinder(knob[0], knob[1], 5.4, ctop, 5, P, 32), { tone: "hi", lit: true }),
      L(k.knurl(knob[0], knob[1], 5.4, ctop, ctop + 5, 30, P), { tone: "lo" }),
      L(k.lineOnTop(knob, [knob[0], knob[1] + 4.6], ctop + 5, P), { tone: "lit", free: "end" }),
      D([at([knob[0], knob[1], ctop + 5])], { size: 0.6, tone: "hi" }),
    ].join(""),
    carShapes,
    { grp, part: "carriage", piece: "car", move: [CAR_TRAVEL, 0, 0] },
  );
  // 输入插座（顶部，接两台飞控）
  for (const [id, [x, y]] of Object.entries(IN)) {
    cyl(`voter.in.${id}.collar`, x, y, 5.6, top, 2, { tone: "lo" }, { grp: id === "B" ? "V B" : grp, steps: 24 });
    cyl(`voter.in.${id}`, x, y, 4.2, top + 2, 6, { tone: "mid" }, { grp: id === "B" ? "V B" : grp, steps: 24, extra: L(k.sideArc(x, y, 4.2, top + 5, P, 16), { tone: "faint" }) });
  }
  // 前面：两盏健康指示灯 + 铭牌
  const Ff = (x, z) => G.frameOf([x, VY1, z], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  for (const [id, x] of [["A", VX0 + 22], ["B", VX0 + 88]]) {
    const F = Ff(x, 11);
    disc(`voter.lamp.${id}.bezel`, F, 0, 1.8, 4.6, { tone: "mid" }, { grp: id === "B" ? "V B" : grp });
    const lens = G.circleOf(F, 1.9, 3.1, P, 32);
    put(`voter.lamp.${id}`, G.add3(F.o, [0, 2.2, 0]), `<path data-lamp="${id}" class="lamp" d="${lens}"/><path class="iso-line" data-tone="lo" d="${lens}"/>`, [record(A.disc(F, 1.8, 2.4, 3.1, { name: `voter.lamp.${id}` }))], { grp: id === "B" ? "V B" : grp, bias: 0.05 });
  }
  const plateFace = FRONT_FACE(VY1);
  put("voter.faceplate", [VX0 + 55, VY1, 11], L(plateFace(VX0 + 40, 6, VX0 + 70, 16, 1.2), { tone: "lo" }) + L([22, 15, 19].map((w, i) => k.segment([VX0 + 43, VY1, 13.6 - i * 2.6], [VX0 + 43 + w, VY1, 13.6 - i * 2.6], P)).join(""), { tone: "lo", free: true }), [record(A.box([VX0 + 40, VY1, 6], [VX0 + 70, VY1 + 0.3, 16], { name: "voter.faceplate" }))], { grp, bias: 0.02 });
  // 右侧：两个输出插头
  const Fr = (y, z) => G.frameOf([VX1, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  for (const y of [VY0 + 20, VY0 + 44]) {
    const F = Fr(y, 11);
    disc(`voter.out.${y}.nut`, F, 0, 3, 4.4, { tone: "mid" }, { grp });
    disc(`voter.out.${y}.plug`, F, 3, 10, 3.3, { tone: "mid" }, { grp, extra: L(G.arcOf(F, 6.5, 3.3, P), { tone: "faint" }) });
  }
}

// ───────────────────────── 执行机构：电调 + 电机 + 舵机 ─────────────────────────
function actuators() {
  const grp = "X";
  box("esc.body", ESC, 0, ESC_H, { tone: "mid" }, { grp, steps: 3, bevel: 0.8, inner: L(k.sideSeam(ESC, 4, P, 3), { tone: "faint" }) });
  for (let i = 0; i < 7; i++) {
    box(`esc.fin.${i}`, { x: ESC.x + 4, y: ESC.y + 3 + i * 4.6, w: ESC.w - 8, d: 1.6, r: 0.4 }, ESC_H, 4, { tone: "mid" }, { grp, steps: 1 });
  }
  const Fin = G.frameOf([ESC.x + 10, ESC.y + ESC.d, 6], [0, 1, 0], [1, 0, 0], [0, 0, 1]);
  disc("esc.in.nut", Fin, 0, 2.4, 3.6, { tone: "mid" }, { grp });
  disc("esc.in.plug", Fin, 2.4, 7, 2.8, { tone: "mid" }, { grp });
  for (const y of [-1, 0, 1].map((i) => MOTOR[1] + 22 + i * 3.5)) {
    disc(`esc.grommet.${y}`, G.frameOf([ESC.x + ESC.w, y, 6.5], [1, 0, 0], [0, 1, 0], [0, 0, 1]), 0, 3, 1.6, { tone: "lo" }, { grp });
  }
  // 电机立柱
  const [mx, my] = MOTOR;
  cyl("motor.flange", mx, my, 16, 0, 3, { tone: "lo" }, { grp, steps: 40, extra: D([0, 1, 2, 3].map((i) => at([mx + 12 * Math.cos(i * Math.PI / 2 + 0.6), my + 12 * Math.sin(i * Math.PI / 2 + 0.6), 3])), { size: 0.55 }) });
  cyl("motor.collar", mx, my, 9, 3, 9, { tone: "mid" }, { grp, steps: 32, extra: L(k.knurl(mx, my, 9, 3, 12, 22, P), { tone: "lo" }) });
  cyl("motor.post", mx, my, 5.5, 12, 84, { tone: "mid", crease: "none" }, { grp, steps: 24, inner: L([36, 64].map((z) => k.sideArc(mx, my, 5.5, z, P, 16)).join(""), { tone: "faint" }) });
  cyl("motor.mount", mx, my, 8, 96, 3, { tone: "mid" }, { grp, steps: 28 });
  cyl("motor.can", mx, my, 15, MOTOR_Z, 18, { tone: "hi", crease: "lo" }, { grp, part: "motor", steps: 48, inner: L(k.sideArc(mx, my, 15, MOTOR_Z + 4, P, 32) + k.sideArc(mx, my, 15, MOTOR_Z + 14, P, 32), { tone: "faint" }) + L(k.knurl(mx, my, 15, MOTOR_Z + 4, MOTOR_Z + 14, 36, P, 0.5), { tone: "lo" }) });
  cyl("motor.bell", mx, my, 13, MOTOR_Z + 18, 2.4, { tone: "hi", crease: "lo" }, { grp, part: "motor", steps: 40, extra: D([0, 1, 2, 3].map((i) => at([mx + 8.5 * Math.cos(i * Math.PI / 2), my + 8.5 * Math.sin(i * Math.PI / 2), MOTOR_Z + 20.4])), { size: 0.5 }) });
  cyl("motor.hub", mx, my, 4, MOTOR_Z + 20.4, PROP_Z - MOTOR_Z - 20.4, { tone: "mid" }, { grp, steps: 20 });
  // 桨叶（每帧重建）与整流罩
  const propShape = record(A.cylinder(mx, my, PROP_R, PROP_Z, 1.6, { name: "prop" }));
  put("prop", [mx, my, PROP_Z + 1], `<g data-prop=""></g>`, [propShape], { grp, part: "prop", bias: 0.2 });
  const spinnerF = G.frameOf([mx, my, PROP_Z + 1.6], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const spinner = [[0, 5.2], [2, 5, 1], [4, 4.1, 1], [6, 2.6, 1], [7.4, 0.6, 1], [7.6, 0]];
  put("prop.spinner", [mx, my, PROP_Z + 5], S(G.solidOf(spinner, spinnerF, P), { tone: "hi", crease: "lo" }), [record(A.solid(spinnerF, spinner, { name: "prop.spinner" }))], { grp, bias: 0.4 });

  // 舵机
  box("servo.case", SERVO, 0, SERVO_H, { tone: "mid" }, { grp, steps: 2, bevel: 0.6, inner: L(k.sideSeam(SERVO, 27, P, 2), { tone: "faint" }) });
  // 舵机两端安装耳
  for (const [name, y] of [["back", SERVO.y - 7], ["front", SERVO.y + SERVO.d]]) {
    const tab = { x: SERVO.x - 1, y, w: SERVO.w + 2, d: 7, r: 1.2 };
    const holes = [[tab.x + 5, y + 3.5], [tab.x + tab.w - 5, y + 3.5]];
    box(`servo.tab.${name}`, tab, 22, 3, { tone: "mid" }, { grp, steps: 2, extra: L(holes.map(([x, hy]) => k.ring(x, hy, 1.4, 25, P, 12)).join(""), { tone: "lo" }) + D(holes.map(([x, hy]) => at([x, hy, 25])), { size: 0.45 }) });
  }
  cyl("servo.spline", HORN_C[0], HORN_C[1], 4.2, SERVO_H, HORN_Z - SERVO_H, { tone: "hi" }, { grp, steps: 24, extra: L(k.knurl(HORN_C[0], HORN_C[1], 4.2, SERVO_H, HORN_Z, 18, P), { tone: "lo" }) });
  put("servo.horn", [HORN_C[0], HORN_C[1], HORN_Z + 1.3], `<g data-horn=""></g>`, [record(A.cylinder(HORN_C[0], HORN_C[1], 6.4, HORN_Z, 2.6, { name: "servo.horn" }))], { grp, part: "horn", bias: 0.1 });
  disc("servo.grommet", G.frameOf([SERVO.x + 10, SERVO.y + SERVO.d, 5], [0, 1, 0], [1, 0, 0], [0, 0, 1]), 0, 3, 2.6, { tone: "lo" }, { grp });
}

// ───────────────────────── 地面站平板 ─────────────────────────
const TAB_N = [0, Math.cos(TAB.tilt), Math.sin(TAB.tilt)];
const TAB_UP = [0, -Math.sin(TAB.tilt), Math.cos(TAB.tilt)];
const TAB_O = [TAB.cx, TAB.yb, TAB.zb];
const tabAt = (u, v, s = 0) => G.add3(G.add3(G.add3(TAB_O, [u, 0, 0]), G.mul3(TAB_UP, v)), G.mul3(TAB_N, s));
const SCREEN = { u0: -46, u1: 46, v0: 9, v1: 69 };
const SCREEN_W = SCREEN.u1 - SCREEN.u0;
const SCREEN_H = SCREEN.v1 - SCREEN.v0;
const SCREEN_MATRIX = planeMatrix(tabAt(SCREEN.u0, SCREEN.v1, 0.05), [1, 0, 0], G.mul3(TAB_UP, -1));
const MAP = { x: 3, y: 10, w: 52, h: 46 };
const WAYPOINTS = [[8, 48], [16, 22], [30, 15], [44, 26], [38, 46], [50, 50]];

function gcs() {
  const grp = "G";
  // 托座
  const cradle = { x: TAB.cx - 58, y: TAB.yb - 12, w: 116, d: 18, r: 3 };
  box("gcs.cradle", cradle, 0, 7, { tone: "lo" }, { grp, steps: 3, bevel: 0.6 });
  box("gcs.lip", { x: TAB.cx - 58, y: TAB.yb + 2, w: 116, d: 4, r: 1 }, 7, 5, { tone: "mid" }, { grp, steps: 2 });
  // 支脚：两端球铰
  for (const u of [-34, 34]) {
    const R0 = 2.6;
    const rod = 1.6;
    const foot = [TAB.cx + u, TAB.yb - 7 - 64];
    const low = [foot[0], foot[1], 2 + R0];
    const high = tabAt(u, 50, -TAB.t - R0);
    const axis = G.unit3(G.sub3(high, low));
    const inset = Math.sqrt(R0 * R0 - rod * rod);
    const F = G.frameAlong(G.add3(low, G.mul3(axis, inset)), axis);
    const len = G.len3(G.sub3(high, low)) - inset * 2;
    cyl(`gcs.strut.pad.${u}`, foot[0], foot[1], 4.5, 0, 2, { tone: "lo" }, { grp, steps: 20 });
    const balls = [["low", low], ["high", high]].map(([end, c]) => {
      const shape = record(A.ball(c, R0, { name: `gcs.strut.ball.${end}.${u}` }));
      put(`gcs.strut.ball.${end}.${u}`, c, S(G.sphereOf(c, R0, P, { steps: 32 }), { tone: "mid" }), [shape], { grp });
      return shape;
    });
    // 杆端以边缘落在球面上（rim on sphere），记为 seated
    const rodShape = record(A.disc(F, 0, len, rod, { name: `gcs.strut.${u}`, seated: true, cut: balls }));
    put(`gcs.strut.${u}`, G.add3(F.o, G.mul3(F.a, len / 2)), S(G.disc(0, len, rod, F, P), { tone: "lo" }), [rodShape], { grp });
  }
  // 机身（后倾）
  const F = G.frameOf(TAB_O, TAB_N, [1, 0, 0], TAB_UP);
  const outline = roundRect(-TAB.w / 2, 0, TAB.w / 2, TAB.h, 7, 6);
  const bezel = k.pathOf(roundRect(SCREEN.u0 - 1.4, SCREEN.v0 - 1.4, SCREEN.u1 + 1.4, SCREEN.v1 + 1.4, 3, 4).map(([u, v]) => at(tabAt(u, v, 0.02))), true);
  const buttons = [-8, 8].map((u) => k.pathOf([...Array(20)].map((_, i) => at(tabAt(u + 2.2 * Math.cos((i / 20) * Math.PI * 2), 4.4 + 2.2 * Math.sin((i / 20) * Math.PI * 2), 0.02))), true)).join("");
  prism("gcs.body", F, outline, -TAB.t, 0, { tone: "mid", crease: "lo" }, {
    grp,
    extra: `<path class="gcs-glass" d="${bezel}"/>` + L(bezel, { tone: "lo" }) + L(buttons, { tone: "lo" }) + `<g transform="${SCREEN_MATRIX}" class="gcs-screen">${screenSvg()}</g>`,
  });
  // 天线
  for (const u of [-38, 38]) {
    const base = tabAt(u, TAB.h, -TAB.t / 2);
    const Fa = G.frameOf(base, TAB_UP, [1, 0, 0], G.mul3(TAB_N, -1));
    disc(`gcs.ant.base.${u}`, Fa, 0, 3, 3.4, { tone: "mid" }, { grp });
    disc(`gcs.ant.whip.${u}`, Fa, 3, 26, 1.7, { tone: "mid" }, { grp, extra: L(G.arcOf(Fa, 10, 1.7, P), { tone: "faint" }) });
  }
}

function screenSvg() {
  const route = k.pathOf(WAYPOINTS);
  const grid = [];
  for (let x = MAP.x + 6.5; x < MAP.x + MAP.w; x += 6.5) grid.push(`M${f2(x)} ${MAP.y}V${MAP.y + MAP.h}`);
  for (let y = MAP.y + 6.5; y < MAP.y + MAP.h; y += 6.5) grid.push(`M${MAP.x} ${f2(y)}H${MAP.x + MAP.w}`);
  const px = 58;
  const row = (y, key, label) =>
    `<text class="scr-t" x="${px}" y="${y}">${label}</text><circle data-scr-dot="${key}" class="scr-dot" cx="${px + 1.6}" cy="${y + 4.6}" r="1.5"/><text data-scr-state="${key}" class="scr-s" x="${px + 4.6}" y="${y + 6}">—</text>`;
  return [
    `<rect class="scr-bg" x="0" y="0" width="${SCREEN_W}" height="${SCREEN_H}" rx="2"/>`,
    `<text class="scr-h" x="3" y="6.2">NA80 · 地面站</text><text class="scr-h" x="${SCREEN_W - 3}" y="6.2" text-anchor="end">余度 · 双机</text>`,
    `<path class="scr-rule" d="M0 8H${SCREEN_W}"/>`,
    `<rect class="scr-map" x="${MAP.x}" y="${MAP.y}" width="${MAP.w}" height="${MAP.h}" rx="1"/>`,
    `<path class="scr-grid" d="${grid.join("")}"/>`,
    `<path class="scr-route" d="${route}"/>`,
    `<path data-scr-done="" class="scr-done" pathLength="1" d="${route}"/>`,
    WAYPOINTS.map(([x, y], i) => `<circle class="scr-wp" cx="${x}" cy="${y}" r="${i === 0 || i === WAYPOINTS.length - 1 ? 1.7 : 1.2}"/>`).join(""),
    `<g data-scr-plane=""><path class="scr-plane" d="M2.6 0L-1.8 -1.9L-1 0L-1.8 1.9Z"/></g>`,
    row(11, "A", "主飞控 A"),
    row(22, "B", "从飞控 B"),
    `<text class="scr-t" x="${px}" y="35">输出通道</text><text data-scr-out="" class="scr-big" x="${px}" y="43">A</text>`,
    `<rect data-scr-btn="" class="scr-btn" x="${px}" y="47" width="30" height="9" rx="1.4"/><text data-scr-btn-t="" class="scr-btn-t" x="${px + 15}" y="53.2" text-anchor="middle">手动切换</text>`,
  ].join("");
}

// ───────────────────────── 线缆 ─────────────────────────
const ROUTES = {};
function cable(name, points, r, { grp = "", bend = 6, tone = "mid", maxLength = 14, shells = [false, false] } = {}) {
  const route = G.fillet(points, Math.max(bend, r * 2.6), 10, { P, tube: r });
  const total = G.pathLength(route);
  R.route(name, route, r, { limp: true });
  const pieces = tubePieces(route, r, P, { maxLength, spacing: Math.max(0.6, Math.min(1.6, r)) });
  const chunks = pieces.map((piece, index) => {
    put(`${name}:${index}`, piece.mid, tubeSvg(piece, { tone }) + `<g class="pulses" data-route="${name}" data-chunk="${index}"></g>`, [A.tube(piece.points, piece.radii)], { grp, bias: 0.02 });
    return [f2(piece.from ?? 0), f2(piece.to ?? total)];
  });
  ROUTES[name] = { pts: route.map((p) => p.map(f2)), total: f2(total), chunks, r };
  return route;
}

// ───────────────────────── 搭建 ─────────────────────────
plate();
unit("A");
unit("B");
voter();
actuators();
gcs();

const cxA = UNITS.A.x + UNIT.w / 2;
const cxB = UNITS.B.x + UNIT.w / 2;
const plugEnd = FRONT + 16;
cable("sync", [[cxA, plugEnd, 12], [cxA, plugEnd + 5, 12], [cxA, plugEnd + 12, 6], [cxA + 14, plugEnd + 20, 2.6], [cxB - 14, plugEnd + 20, 2.6], [cxB, plugEnd + 12, 6], [cxB, plugEnd + 5, 12], [cxB, plugEnd, 12]], 1.7, { grp: "S B", bend: 7 });
cable("cabA", [[cxA, plugEnd, 24], [cxA, plugEnd + 5, 24], [cxA, plugEnd + 16, 33], [IN.A[0] - 36, IN.A[1] - 24, 46], [IN.A[0], IN.A[1] - 5, 47], [IN.A[0], IN.A[1], 42], [IN.A[0], IN.A[1], VOTER_H + 8]], 1.9, { grp: "A", bend: 9 });
cable("cabB", [[cxB, plugEnd, 24], [cxB, plugEnd + 5, 24], [cxB, plugEnd + 16, 33], [IN.B[0] - 22, IN.B[1] - 26, 46], [IN.B[0], IN.B[1] - 5, 47], [IN.B[0], IN.B[1], 42], [IN.B[0], IN.B[1], VOTER_H + 8]], 1.9, { grp: "B", bend: 9 });
cable("out1", [[VX1 + 10, VY0 + 20, 11], [VX1 + 15, VY0 + 20, 11], [VX1 + 24, VY0 + 20, 5], [VX1 + 50, VY0 - 6, 2.8], [ESC.x + 10, ESC.y + ESC.d + 24, 2.8], [ESC.x + 10, ESC.y + ESC.d + 14, 6], [ESC.x + 10, ESC.y + ESC.d + 7, 6]], 1.8, { grp: "V", bend: 9 });
cable("out2", [[VX1 + 10, VY0 + 44, 11], [VX1 + 15, VY0 + 44, 11], [VX1 + 24, VY0 + 44, 5], [VX1 + 60, VY0 + 92, 2.8], [SERVO.x - 4, SERVO.y + SERVO.d + 18, 2.8], [SERVO.x + 10, SERVO.y + SERVO.d + 12, 5], [SERVO.x + 10, SERVO.y + SERVO.d + 3, 5]], 1.8, { grp: "V", bend: 9 });
const MW = [-1, 0, 1].map((i) => ({ y: MOTOR[1] + 22 + i * 3.5, x: MOTOR[0] + i * 3.5 }));
MW.forEach(({ x, y }, i) => {
  cable(`mw${i}`, [[ESC.x + ESC.w + 3, y, 6.5], [ESC.x + ESC.w + 7, y, 6.5], [ESC.x + ESC.w + 16, y, 1.65], [x, y, 1.65], [x, y, 16], [x, MOTOR[1] + 10.4, 26], [x, MOTOR[1] + 10.4, MOTOR_Z]], 1.05, { grp: "X", bend: 5, tone: "mid" });
});

// ───────────────────────── 排序 ─────────────────────────
const t0 = Date.now();
A.settle(R, P, { states: [0, 1] });
R.items.sort((a, b) => a.key - b.key);
const settleMs = Date.now() - t0;
const lifts = R.items.map((item) => f2(G.dot3(item.move, V)));

// ───────────────────────── 镜头 ─────────────────────────
// 镜头：内容放进避开角标与字幕的安全区（1920×1080 画面中 x 80–1840，y 175–880）
const SAFE = { x0: 80, x1: 1840, y0: 175, y1: 880 };
function shotOf(points, { pad = 0.04 } = {}) {
  const flat = points.map(at);
  const xs = flat.map((p) => p[0]);
  const ys = flat.map((p) => p[1]);
  const [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  const cw = (x1 - x0) * (1 + pad * 2);
  const ch = (y1 - y0) * (1 + pad * 2);
  const s = Math.min((SAFE.x1 - SAFE.x0) / cw, (SAFE.y1 - SAFE.y0) / ch);
  const w = 1920 / s;
  const cx = (x0 + x1) / 2 - ((SAFE.x0 + SAFE.x1) / 2 - 960) / s;
  const cy = (y0 + y1) / 2 - ((SAFE.y0 + SAFE.y1) / 2 - 540) / s;
  return [f2(cx), f2(cy), f2(w)];
}
const unitBox = (id, up = 0) => k.boxCorners({ x: UNITS[id].x - 9, y: UNITS[id].y, w: UNIT.w + 18, d: UNIT.d + 18 }, 0, UNIT.h + up);
const inBox = (id) => { const [x, y] = IN[id]; return [[x, y, VOTER_H + 8], [x, y, 48]]; };
const SHOTS = {
  wide: shotOf([...k.boxCorners(PLATE, -PLATE_H - FOOT_H, 0), [MOTOR[0], MOTOR[1] - PROP_R, PROP_Z], [MOTOR[0] + PROP_R, MOTOR[1], PROP_Z], tabAt(0, TAB.h + 26)], { pad: 0.0 }),
  a: shotOf([...unitBox("A", LIFT + 2), [cxA, plugEnd + 14, 0], [cxA - 20, plugEnd + 14, 0]], { pad: 0.03 }),
  path: shotOf([...unitBox("A", 4), ...unitBox("B", 4), ...k.boxCorners(VOTER, 0, 30), ...k.boxCorners(SERVO, 0, 40), [MOTOR[0] + PROP_R, MOTOR[1], PROP_Z], [MOTOR[0], MOTOR[1] - PROP_R, PROP_Z]], { pad: 0.02 }),
  ab: shotOf([...unitBox("A", LIFT + 2), ...unitBox("B", LIFT + 2), [cxA, plugEnd + 22, 0], [cxB, plugEnd + 22, 0]], { pad: 0.03 }),
  sync: shotOf([...unitBox("A", 4), ...unitBox("B", 4), ...k.boxCorners(VOTER, 0, 30)], { pad: 0.04 }),
  voter: shotOf([...k.boxCorners(VOTER, 0, 40), ...inBox("A"), ...inBox("B"), [VX1 + 12, VY0 + 44, 0]], { pad: 0.08 }),
  gcs: shotOf([tabAt(-TAB.w / 2, 0), tabAt(TAB.w / 2, 0), tabAt(-TAB.w / 2, TAB.h), tabAt(TAB.w / 2, TAB.h)], { pad: 0.08 }),
  gcsVoter: shotOf([tabAt(-TAB.w / 2, 0), tabAt(TAB.w / 2, TAB.h + 26), ...k.boxCorners(VOTER, 0, 40), ...inBox("B")], { pad: 0.04 }),
};

// ───────────────────────── 时间提示点 ─────────────────────────
const sceneOf = (id) => TIMELINE.scenes.find((s) => s.id === id);
function cue(id, line, word, offset = 0) {
  const l = sceneOf(id).lines[line];
  const index = l.text.indexOf(word);
  if (index < 0) throw new Error(`cue ${id}.${line}: "${word}" not found`);
  return f2(l.start + ((l.end - l.start) * index) / l.text.length + offset);
}
const C = {
  fcLidUp: cue("fc", 0, "大脑"),
  fcImu: cue("fc", 1, "IMU"),
  fcBaro: cue("fc", 1, "气压计"),
  fcCpu: cue("fc", 1, "解算"),
  fcOut: cue("fc", 1, "电调"),
  fcS1: cue("fc", 2, "感知"),
  fcS2: cue("fc", 2, "解算"),
  fcS3: cue("fc", 2, "控制"),
  fcS4: cue("fc", 2, "执行"),
  fcEnd: sceneOf("fc").end,
  singleGhost: cue("single", 0, "传统"),
  singleOne: cue("single", 0, "一条"),
  singleFault: cue("single", 1, "硬件故障"),
  singleSqueeze: cue("single", 1, "迅速压缩"),
  dualStart: sceneOf("dual").start,
  dualRecover: cue("dual", 0, "NA80"),
  dualTwo: cue("dual", 0, "两台"),
  dualLids: cue("dual", 1, "它们"),
  dualCpu: cue("dual", 1, "CPU"),
  dualRam: cue("dual", 1, "内存"),
  dualFlash: cue("dual", 1, "存储"),
  dualImu: cue("dual", 1, "IMU"),
  dualBaro: cue("dual", 1, "气压计"),
  dualSame: cue("dual", 2, "同一套"),
  dualNot: cue("dual", 2, "不共用"),
  dualEnd: sceneOf("dual").end,
  syncStart: sceneOf("sync").start,
  syncHealth: cue("sync", 0, "健康状态"),
  syncMode: cue("sync", 0, "飞行模式"),
  syncHand: cue("sync", 1, "交接"),
  voterStart: sceneOf("voter").start,
  voterLit: cue("voter", 0, "表决器"),
  voterMonitor: cue("voter", 1, "监测"),
  voterArb: cue("voter", 1, "仲裁"),
  voterMain: cue("voter", 2, "主飞控"),
  voterStandby: cue("voter", 2, "从飞控"),
  gcsStart: sceneOf("gcs").start,
  gcsStatus: cue("gcs", 0, "余度状态"),
  gcsHealth: cue("gcs", 0, "谁健康"),
  gcsCtrl: cue("gcs", 0, "谁在控制"),
  gcsPress1: cue("gcs", 1, "切换指令"),
  foStart: sceneOf("failover").start,
  foRoute: cue("failover", 0, "航线"),
  foFault: cue("failover", 1, "异常"),
  foExplain: cue("failover", 2, "表决器"),
  foCont: cue("failover", 3, "任务"),
  closeStart: sceneOf("close").start,
  closeSlogan: cue("close", 1, "第二个判断"),
  closeBrand: cue("close", 2, "酷飞"),
  end: TIMELINE.duration,
};
C.gcsPress2 = f2(Math.min(C.gcsPress1 + 1.7, C.foStart - 0.5));
C.foSwitch = f2(C.foFault + 0.12);

// ───────────────────────── 页面 ─────────────────────────
const items = R.items.map((item, index) => {
  const attrs = [`class="it"`, `data-i="${index}"`, `data-k="${f2(item.key)}"`];
  if (lifts[index]) attrs.push(`data-l="${lifts[index]}"`, `data-piece="${item.piece}"`);
  if (item.grp) attrs.push(`data-grp="${item.grp}"`);
  if (item.part) attrs.push(`data-part="${item.part}"`);
  return `<g ${attrs.join(" ")}>${item.svg}</g>`;
});
const svg = `<svg xmlns="http://www.w3.org/2000/svg" class="iso-svg fig" viewBox="${SHOTS.wide[0] - SHOTS.wide[2] / 2} ${SHOTS.wide[1] - (SHOTS.wide[2] * 9) / 32} ${SHOTS.wide[2]} ${(SHOTS.wide[2] * 9) / 16}" preserveAspectRatio="xMidYMid meet" role="img" aria-label="NA80 双余度飞控试验台：两台独立飞控、表决器、执行机构与地面站">
<defs><filter id="glow" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.2"/></filter></defs>
<g data-items="">${items.join("")}</g></svg>`;

const DATA = { P, ROUTES, SHOTS, C, TIMELINE, MOTOR, PROP_Z, PROP_R, HORN_C, HORN_Z, WAYPOINTS, LIFT, CAR_TRAVEL };
const css = readFileSync(join(HERE, "stage.css"), "utf8");
const live = readFileSync(join(HERE, "live.js"), "utf8");
const fonts = [
  ["Noto Sans SC", 400], ["Noto Sans SC", 500], ["Noto Sans SC", 700], ["Noto Sans SC", 900],
  ["JetBrains Mono", 400], ["JetBrains Mono", 500], ["Barlow Condensed", 600], ["Barlow Condensed", 700],
].map(([family, weight]) => `@font-face{font-family:'${family}';font-weight:${weight};src:url(fonts/${family.replace(/ /g, "")}-${weight}.ttf)}`).join("");
const page = `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><title>NA80 双余度飞控 · 科普</title>
<style>${fonts}${k.ISO_CSS}${css}</style></head>
<body class="iso" data-theme="dark">
<div class="frame">
  <div class="figwrap">${svg}</div>
  <div class="shade top"></div><div class="shade bottom"></div>
  <div class="card-line"></div>
  <img class="logo" src="assets/coolfly-logo-white.png" alt="CoolFly">
  <div class="corner tl"><span class="fig-no" data-fig>Fig 1</span><span class="fig-title" data-title>飞行没有暂停键</span></div>
  <div class="corner tr">NA80 · DUAL REDUNDANCY FLIGHT CONTROL</div>
  <div class="corner bl" data-legend><span class="key"><i class="sw ctrl"></i>控制指令</span><span class="key"><i class="sw sync"></i>同步数据</span><span class="key"><i class="sw idle"></i>热备通道</span></div>
  <div class="corner br" data-readout></div>
  <div class="subtitle" data-sub></div>
  <div class="endcard" data-end>
    <img src="assets/coolfly-logo-white.png" alt="CoolFly">
    <div class="end-kicker">NA80 · 军工级双余度飞控系统</div>
    <div class="end-line">让飞行始终拥有<br><em>第二个判断</em></div>
    <div class="end-url">www.coolflyaircraft.com</div>
  </div>
</div>
<audio data-voice src="audio/voice.wav" preload="auto"></audio>
<script>const DATA = ${JSON.stringify(DATA)};</script>
<script type="module">${(kitScript() + "\n" + live).replace(/<\/(script)/gi, "<\\/$1")}</script>
</body></html>`;
writeFileSync(join(ROOT, "stage.html"), page);
console.log(`stage.html ${(page.length / 1024).toFixed(0)} KB · ${R.items.length} items · settle ${settleMs} ms · scale ${KS.toFixed(3)} · ${Object.keys(ROUTES).length} cables · ${TIMELINE.duration}s`);
A.auditOrExit(R, P, {});
