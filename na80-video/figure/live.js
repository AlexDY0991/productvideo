// 舞台时间轴：一切状态都是时间 t 的纯函数，window.seek(t) 可逐帧确定性渲染。
const { ROUTES, SHOTS, C, TIMELINE, MOTOR, PROP_Z, PROP_R, HORN_C, HORN_Z, WAYPOINTS, LIFT, CAR_TRAVEL } = DATA;
const P = DATA.P;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const TAU = Math.PI * 2;
const DUR = TIMELINE.duration;

const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sm = (x) => ((x = clamp01(x)), x * x * (3 - 2 * x));
const smoother = (x) => ((x = clamp01(x)), x * x * x * (x * (x * 6 - 15) + 10));
const ramp = (t, t0, d = 0.6) => sm((t - t0) / d);
const win = (t, a, b, d = 0.4) => ramp(t, a, d) * (1 - ramp(t, b, d));
const burst = (age, rise = 0.06, fall = 0.5) => (age < 0 ? 0 : age < rise ? sm(age / rise) : Math.exp(-(age - rise) / fall));
const mix = (a, b, x) => a + (b - a) * x;
const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
const rgb = (a, b, x) => {
  const [p, q] = [hex(a), hex(b)];
  return `rgb(${p.map((v, i) => Math.round(mix(v, q[i], x))).join(",")})`;
};
function springStep(dt, omega = 20, zeta = 0.62) {
  if (dt <= 0) return 0;
  const wd = omega * Math.sqrt(1 - zeta * zeta);
  return 1 - Math.exp(-zeta * omega * dt) * (Math.cos(wd * dt) + ((zeta * omega) / wd) * Math.sin(wd * dt));
}

// ───────── 状态 ─────────
const SWITCHES = [
  { t: C.gcsPress1 + 0.2, to: 1, w: 18 },
  { t: C.gcsPress2 + 0.2, to: 0, w: 18 },
  { t: C.foSwitch, to: 1, w: 46 },
];
function carriage(t) {
  let s = 0;
  let prev = 0;
  for (const e of SWITCHES) {
    s += (e.to - prev) * springStep(t - e.t, e.w, 0.6);
    prev = e.to;
  }
  return s;
}
const lidA = (t) => smoother((t - C.fcLidUp) / 0.9) * (1 - smoother((t - (C.fcEnd - 1.3)) / 0.9)) + smoother((t - (C.dualLids - 0.35)) / 0.9) * (1 - smoother((t - (C.dualEnd - 1.2)) / 0.9));
const lidB = (t) => smoother((t - (C.dualLids - 0.2)) / 0.9) * (1 - smoother((t - (C.dualEnd - 1.1)) / 0.9));
const ghostB = (t) => win(t, C.singleGhost, C.dualRecover + 0.2, 0.8);
const faultA = (t) => Math.max(win(t, C.singleFault, C.dualRecover, 0.12), ramp(t, C.foFault, 0.08));
const faultFlash = (t) => Math.max(burst(t - C.singleFault, 0.05, 0.7), burst(t - C.foFault, 0.05, 0.7));
const speed = (t) => 1 - 0.94 * ramp(t, C.singleFault + 0.25, 1.8) * (1 - ramp(t, C.dualRecover, 1.4));
const flowRate = (t) => 1 - ramp(t, C.singleFault, 0.15) * (1 - ramp(t, C.dualRecover, 0.6));

// 积分量（桨叶角、舵机相位、航线进度）预先按 240 Hz 累加
const STEP = 1 / 240;
const N = Math.ceil((DUR + 2) / STEP);
const propAngle = new Float64Array(N);
const servoTau = new Float64Array(N);
const routeTau = new Float64Array(N);
for (let i = 1; i < N; i++) {
  const t = i * STEP;
  const v = speed(t);
  propAngle[i] = propAngle[i - 1] + TAU * 1.25 * v * STEP;
  servoTau[i] = servoTau[i - 1] + v * STEP;
  routeTau[i] = routeTau[i - 1] + flowRate(t) * STEP;
}
const sample = (arr, t) => {
  const x = Math.max(0, Math.min(N - 1.001, t / STEP));
  const i = Math.floor(x);
  return arr[i] + (arr[i + 1] - arr[i]) * (x - i);
};

// ───────── DOM ─────────
const svg = $(".fig");
const layer = $("[data-items]");
const items = $$(".it", layer);
const keyBase = items.map((el) => +el.dataset.k);
const keyLift = items.map((el) => +(el.dataset.l || 0));
const keyPiece = items.map((el) => el.dataset.piece || "");
let order = items.map((_, i) => i);
const byGrp = (g) => items.filter((el) => (el.dataset.grp || "").split(" ").includes(g));
const grpA = byGrp("A");
const grpB = byGrp("B");
const parts = (part, grp) => items.filter((el) => el.dataset.part === part && (!grp || (el.dataset.grp || "").split(" ").includes(grp)));
const pulseGroups = {};
for (const g of $$(".pulses", layer)) (pulseGroups[g.dataset.route] ||= [])[+g.dataset.chunk] = g;
const propG = $("[data-prop]");
const hornG = $("[data-horn]");
const led = { A: $('[data-led="A"]'), B: $('[data-led="B"]') };
const ledGlow = { A: $('[data-led-glow="A"]'), B: $('[data-led-glow="B"]') };
const lamp = { A: $('[data-lamp="A"]'), B: $('[data-lamp="B"]') };
const scr = {
  dot: { A: $('[data-scr-dot="A"]'), B: $('[data-scr-dot="B"]') },
  state: { A: $('[data-scr-state="A"]'), B: $('[data-scr-state="B"]') },
  out: $("[data-scr-out]"),
  btn: $("[data-scr-btn]"),
  done: $("[data-scr-done]"),
  plane: $("[data-scr-plane]"),
  planePath: $("[data-scr-plane] path"),
};
const ui = { fig: $("[data-fig]"), title: $("[data-title]"), sub: $("[data-sub]"), readout: $("[data-readout]"), legend: $("[data-legend]"), end: $("[data-end]"), corners: $$(".corner:not([data-legend]), .logo") };
const figwrap = $(".figwrap");

// 线缆的弧长参数化
for (const r of Object.values(ROUTES)) {
  r.cum = [0];
  for (let i = 1; i < r.pts.length; i++) r.cum.push(r.cum[i - 1] + Math.hypot(...r.pts[i].map((v, j) => v - r.pts[i - 1][j])));
}
function pointOn(r, d) {
  let lo = 0;
  let hi = r.cum.length - 1;
  while (hi - lo > 1) {
    const m = (lo + hi) >> 1;
    if (r.cum[m] <= d) lo = m;
    else hi = m;
  }
  const span = r.cum[hi] - r.cum[lo] || 1;
  const x = (d - r.cum[lo]) / span;
  return r.pts[lo].map((v, j) => v + (r.pts[hi][j] - v) * x);
}

// 航线（屏幕局部坐标）
const wpCum = [0];
for (let i = 1; i < WAYPOINTS.length; i++) wpCum.push(wpCum[i - 1] + Math.hypot(WAYPOINTS[i][0] - WAYPOINTS[i - 1][0], WAYPOINTS[i][1] - WAYPOINTS[i - 1][1]));
const wpTotal = wpCum[wpCum.length - 1];
scr.done.setAttribute("pathLength", "1");
function onRoute(u) {
  const d = u * wpTotal;
  let i = 1;
  while (i < wpCum.length - 1 && wpCum[i] < d) i++;
  const [a, b] = [WAYPOINTS[i - 1], WAYPOINTS[i]];
  const x = (d - wpCum[i - 1]) / (wpCum[i] - wpCum[i - 1]);
  return [a[0] + (b[0] - a[0]) * x, a[1] + (b[1] - a[1]) * x, Math.atan2(b[1] - a[1], b[0] - a[0])];
}

// ───────── 镜头 ─────────
const CAM = [
  [-1, "wide", 0.01],
  [C.fcLidUp - 1.0, "a", 1.7],
  [C.fcOut - 0.5, "path", 1.9],
  [C.dualTwo - 0.4, "ab", 1.7],
  [C.syncStart - 0.2, "sync", 1.7],
  [C.voterStart - 0.2, "voter", 1.7],
  [C.gcsStart - 0.2, "gcs", 1.7],
  [C.gcsPress1 - 1.0, "gcsVoter", 1.3],
  [C.foStart - 0.3, "wide", 1.9],
  [C.foFault - 1.7, "sync", 1.3],
  [C.foExplain - 0.2, "voter", 1.4],
  [C.foCont - 0.3, "wide", 1.9],
];
function camera(t) {
  let i = 0;
  while (i + 1 < CAM.length && CAM[i + 1][0] <= t) i++;
  const [t0, name, d] = CAM[i];
  const from = i ? SHOTS[CAM[i - 1][1]] : SHOTS[name];
  const to = SHOTS[name];
  const x = smoother((t - t0) / d);
  const cx = mix(from[0], to[0], x);
  const cy = mix(from[1], to[1], x);
  let w = Math.exp(mix(Math.log(from[2]), Math.log(to[2]), x));
  // 缓慢推近：开场与片尾
  if (t < C.fcLidUp) w *= 1.07 - 0.07 * sm(t / Math.max(1, C.fcLidUp - 1));
  if (t > C.closeStart) w *= 1 - 0.06 * sm((t - C.closeStart) / 8);
  return [cx, cy, w];
}

// ───────── 字幕 ─────────
const SUBS = [];
for (const scene of TIMELINE.scenes) {
  for (const line of scene.lines) {
    const pieces = [];
    let buf = "";
    for (const part of line.text.split(/(?<=[，：；])|(?<=——)/)) {
      if ((buf + part).replace(/[，：；。——]/g, "").length > 21 && buf) {
        pieces.push(buf);
        buf = part;
      } else buf += part;
    }
    if (buf) pieces.push(buf);
    const total = pieces.reduce((n, p) => n + p.length, 0);
    let t = line.start;
    for (const p of pieces) {
      const d = ((line.end - line.start) * p.length) / total;
      SUBS.push({ a: t, b: t + d, text: p.replace(/[，；：。]+$|——$/g, "").replace(/[，；]/g, "　").replace(/：/g, "：") });
      t += d;
    }
  }
}
for (let i = 0; i < SUBS.length; i++) SUBS[i].hold = i + 1 < SUBS.length ? Math.min(SUBS[i + 1].a, SUBS[i].b + 0.45) : SUBS[i].b + 0.6;

const READOUT = [
  [0, "主飞控 A · <b>控制</b>　从飞控 B · 热备"],
  [C.fcLidUp, "感知 → 解算 → 控制 → 执行"],
  [C.singleGhost, "单飞控 · 1 条控制通道"],
  [C.singleFault, "<i>主飞控异常 · 控制中断</i>"],
  [C.dualRecover, "双余度 · 2 套独立飞控 · 同时在线"],
  [C.dualCpu, "各自独立 · CPU / 内存 / 存储 / IMU / 气压计"],
  [C.syncStart, "实时同步 · 健康状态"],
  [C.syncMode, "实时同步 · 飞行模式 / 解锁状态"],
  [C.voterStart, "表决器 · 输出通道 <b>A</b>"],
  [C.gcsStart, "地面站 · 余度状态"],
  [C.gcsPress1 + 0.2, "手动切换 · A → <b>B</b>"],
  [C.gcsPress2 + 0.2, "手动切换 · B → <b>A</b>"],
  [C.foStart, "执行航线 · 主飞控 A <b>控制</b>"],
  [C.foFault, "<i>主飞控 A 异常</i>"],
  [C.foSwitch + 0.04, "已切换至从飞控 <b>B</b> · 毫秒级"],
  [C.foCont, "指令不中断 · 任务沿原航线继续"],
  [C.closeSlogan - 0.6, ""],
];

// ───────── 绘制 ─────────
function propSvg(angle, v) {
  const [mx, my] = MOTOR;
  const blade = (a) => {
    const pts = [];
    const n = 14;
    const side = (sgn) => {
      const pts = [];
      for (let i = 0; i <= n; i++) {
        const r = 5 + ((PROP_R - 5) * i) / n;
        const c = 1.6 + 8.2 * Math.pow(Math.sin((Math.PI * (r - 3)) / (PROP_R - 1)), 0.62);
        const off = sgn > 0 ? c * 0.38 : -c * 0.62;
        pts.push([r, off]);
      }
      return pts;
    };
    const lead = side(1);
    const trail = side(-1).reverse();
    for (const [r, o] of [...lead, ...trail]) pts.push([mx + r * Math.cos(a) - o * Math.sin(a), my + r * Math.sin(a) + o * Math.cos(a)]);
    return pts;
  };
  const out = [];
  out.push(lineSvg(ring(mx, my, PROP_R - 3, PROP_Z + 1.4, P, 72), { tone: "faint" }));
  const trail = Math.min(1, v);
  for (const g of [3, 2, 1]) {
    for (const k2 of [0, Math.PI]) {
      const r = blade(angle + k2 - g * 0.16 * trail);
      const top = pathOf(r.map(([x, y]) => iso([x, y, PROP_Z + 1.4], P)), true);
      out.push(`<path d="${top}" fill="#5a5b60" fill-opacity="${(0.09 * (4 - g) * trail).toFixed(3)}" stroke="none"/>`);
    }
  }
  for (const k2 of [0, Math.PI]) out.push(solidSvg(extrude(blade(angle + k2), PROP_Z, 1.4, P), { tone: "hi", crease: "lo" }));
  return out.join("");
}
function hornSvg(phi) {
  const [cx, cy] = HORN_C;
  const len = 17;
  const tip = [cx + len * Math.cos(phi), cy + len * Math.sin(phi)];
  const ringPts = [];
  for (let i = 0; i <= 12; i++) {
    const a = phi + Math.PI / 2 + (Math.PI * i) / 12;
    ringPts.push([cx + 5.6 * Math.cos(a), cy + 5.6 * Math.sin(a)]);
  }
  for (let i = 0; i <= 12; i++) {
    const a = phi - Math.PI / 2 + (Math.PI * i) / 12;
    ringPts.push([tip[0] + 2.8 * Math.cos(a), tip[1] + 2.8 * Math.sin(a)]);
  }
  const z = HORN_Z + 2.4;
  const holes = [7, 11, 15].map((d) => ring(cx + d * Math.cos(phi), cy + d * Math.sin(phi), 0.9, z, P, 12)).join("");
  return solidSvg(extrude(ringPts, HORN_Z, 2.4, P), { tone: "hi", crease: "lo" }) + lineSvg(holes, { tone: "lo" }) + dotsSvg([iso([cx, cy, z], P)], { size: 0.7, tone: "hi" });
}

const COLORS = { ctrl: "#ff5a00", sync: "#ecece8", idle: "#6d6e73" };
function pulses(t, st) {
  for (const list of Object.values(pulseGroups)) for (const g of list) if (g && g.firstChild) g.textContent = "";
  const add = (name, { speed = 30, gap = 15, color, alpha = 1, reverse = false, size = 1 }) => {
    if (alpha < 0.01) return;
    const r = ROUTES[name];
    const phase = (((t * speed) % gap) + gap) % gap;
    for (let d = phase; d < r.total; d += gap) {
      const s = reverse ? r.total - d : d;
      const edge = sm(Math.min(s, r.total - s) / 7);
      const a = alpha * edge;
      if (a < 0.02) continue;
      const chunk = r.chunks.findIndex(([f, to]) => s >= f && s <= to);
      const g = pulseGroups[name][chunk < 0 ? 0 : chunk];
      const [x, y] = iso(pointOn(r, s), P);
      g.insertAdjacentHTML("beforeend", `<circle class="pulse-halo" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(3.4 * size).toFixed(2)}" fill="${color}" opacity="${(0.55 * a).toFixed(3)}"/><circle class="pulse-core" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="${(1.25 * size).toFixed(2)}" fill="${color}" opacity="${a.toFixed(3)}"/>`);
    }
  };
  const present = 1 - st.ghost;
  // 主/从飞控各自送往表决器：在控的为橙色，热备为灰色
  const roleA = 1 - st.car;
  const roleB = st.car;
  const okA = 1 - st.faultA;
  add("cabA", { color: rgb(COLORS.idle, COLORS.ctrl, roleA), alpha: okA * mix(0.55, 1, roleA) * st.flow, speed: 34 });
  add("cabB", { color: rgb(COLORS.idle, COLORS.ctrl, roleB), alpha: present * mix(0.55, 1, roleB), speed: 34 });
  const out = st.outFlow;
  add("out1", { color: COLORS.ctrl, alpha: out, speed: 34 });
  add("out2", { color: COLORS.ctrl, alpha: out, speed: 34 });
  const syncBoost = win(t, C.syncStart, C.voterStart, 0.6);
  add("sync", { color: COLORS.sync, alpha: present * okA * mix(0.6, 1, syncBoost), speed: 24, gap: 18, size: mix(0.85, 1.05, syncBoost) });
  add("sync", { color: COLORS.sync, alpha: present * mix(0.6, 1, syncBoost), speed: 24, gap: 18, reverse: true, size: mix(0.85, 1.05, syncBoost) });
}

function resort(shares) {
  const keys = keyBase.map((k0, i) => (keyLift[i] ? k0 + keyLift[i] * (shares[keyPiece[i]] || 0) : k0));
  const next = order.slice().sort((a, b) => keys[a] - keys[b] || a - b);
  if (next.some((v, i) => v !== order[i])) {
    const frag = document.createDocumentFragment();
    for (const i of next) frag.appendChild(items[i]);
    layer.appendChild(frag);
    order = next;
  }
}

const highlightSets = (t) => {
  const on = [];
  const A = (p) => on.push([p, "A"]);
  const both = (p) => on.push([p, "A"], [p, "B"]);
  if (win(t, C.fcImu, C.fcCpu + 0.2, 0.25)) A("imu");
  if (win(t, C.fcBaro, C.fcCpu + 0.2, 0.25)) A("baro");
  if (win(t, C.fcCpu, C.fcOut + 0.4, 0.25)) A("cpu");
  if (win(t, C.fcS1, C.fcS2, 0.2)) A("imu"), A("baro");
  if (win(t, C.fcS2, C.fcS3, 0.2)) A("cpu");
  if (win(t, C.fcS3, C.fcS4, 0.2)) on.push(["carriage"]);
  if (win(t, C.fcS4, C.fcEnd - 0.3, 0.2)) on.push(["prop"], ["motor"], ["horn"]);
  if (win(t, C.dualCpu, C.dualRam, 0.2) || win(t, C.dualNot, C.dualEnd - 1.2, 0.2)) both("cpu");
  if (win(t, C.dualRam, C.dualFlash, 0.2) || win(t, C.dualNot, C.dualEnd - 1.2, 0.2)) both("ram");
  if (win(t, C.dualFlash, C.dualImu, 0.2) || win(t, C.dualNot, C.dualEnd - 1.2, 0.2)) both("flash");
  if (win(t, C.dualImu, C.dualBaro, 0.2) || win(t, C.dualNot, C.dualEnd - 1.2, 0.2)) both("imu");
  if (win(t, C.dualBaro, C.dualSame, 0.2) || win(t, C.dualNot, C.dualEnd - 1.2, 0.2)) both("baro");
  if (t >= C.voterLit && t < C.closeSlogan) on.push(["carriage"]);
  return on;
};
const allHL = new Set(items.filter((el) => el.dataset.part));

function render(t) {
  const car = carriage(t);
  const ghost = ghostB(t);
  const fA = faultA(t);
  const v = speed(t);
  const activeB = car > 0.5;
  const outFlow = activeB ? 1 - ghost : (1 - fA) * flowRate(t);
  const st = { car: Math.max(0, Math.min(1, car)), ghost, faultA: fA, flow: flowRate(t), outFlow };

  // 镜头
  const [cx, cy, w] = camera(t);
  const h = (w * 9) / 16;
  svg.setAttribute("viewBox", `${(cx - w / 2).toFixed(2)} ${(cy - h / 2).toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)}`);

  // 运动部件
  const shares = { lidA: lidA(t), lidB: lidB(t), car };
  for (const el of items) {
    const p = el.dataset.piece;
    if (!p) continue;
    const s = shares[p] || 0;
    const move = p === "car" ? [CAR_TRAVEL * s, 0, 0] : [0, 0, LIFT * s];
    if (Math.abs(s) < 1e-4) el.removeAttribute("transform");
    else el.setAttribute("transform", translateAlong(P, move));
  }
  resort(shares);

  // 幽灵（单飞控假设）与故障
  const op = (1 - 0.88 * ghost).toFixed(3);
  for (const el of grpB) el.style.opacity = ghost > 0.001 ? op : "";
  const flash = faultFlash(t);
  const faultEdges = flash > 0.25;
  for (const el of grpA) el.classList.toggle("fault", faultEdges);

  // 高亮
  const on = new Set();
  for (const [p, g] of highlightSets(t)) for (const el of parts(p, g)) on.add(el);
  for (const el of allHL) el.classList.toggle("on", on.has(el));

  // 桨叶与舵机
  propG.innerHTML = propSvg(sample(propAngle, t), v);
  const tau = sample(servoTau, t);
  hornG.innerHTML = hornSvg(-0.9 + 0.38 * Math.sin(TAU * 0.29 * tau) + 0.16 * Math.sin(TAU * 0.83 * tau + 1));

  // 指示灯
  const beat = (t2, rate = 1.1) => Math.pow(0.5 + 0.5 * Math.cos(TAU * rate * t2), 6);
  const ledState = (id) => {
    if (id === "A" && fA > 0.5) return { c: "#ff3b30", g: 0.5 + 0.5 * (Math.sin(TAU * 3 * t) > 0 ? 1 : 0.35) * Math.min(1, 0.6 + flash) };
    const active = id === "A" ? !activeB : activeB;
    return active ? { c: "#ff5a00", g: 0.55 + 0.3 * beat(t, 0.8) } : { c: rgb("#3a3a3e", "#d8d8d4", 0.35 + 0.65 * beat(t + 0.4, 0.8)), g: 0 };
  };
  for (const id of ["A", "B"]) {
    const s = ledState(id);
    led[id].style.fill = s.c;
    ledGlow[id].style.fill = s.c;
    ledGlow[id].style.opacity = s.g.toFixed(3);
  }
  const monitor = win(t, C.voterMonitor - 0.2, C.gcsStart, 0.4);
  for (const id of ["A", "B"]) {
    const faulted = id === "A" && fA > 0.5;
    const b = beat(t + (id === "B" ? 0.45 : 0), 1.25);
    lamp[id].style.fill = faulted ? "#ff3b30" : rgb("#1d1d21", "#f0f0ea", mix(0.35, 1, monitor) * b);
  }

  // 脉冲
  pulses(t, st);

  // 地面站屏幕
  const scrState = (id) => {
    if (id === "B" && ghost > 0.5) return ["离线", "#3a3b40", "#6a6b70"];
    if (id === "A" && fA > 0.5) return ["异常", "#ff3b30", "#ff3b30"];
    const active = id === "A" ? !activeB : activeB;
    return active ? ["控制中", "#ff5a00", "#ff5a00"] : ["热备", "#d8d8d4", "#e8e8e4"];
  };
  for (const id of ["A", "B"]) {
    const [text, dot, color] = scrState(id);
    if (scr.state[id].textContent !== text) scr.state[id].textContent = text;
    scr.dot[id].style.fill = dot;
    scr.state[id].style.fill = color;
  }
  const outText = outFlow > 0.5 ? (activeB ? "B" : "A") : "—";
  if (scr.out.textContent !== outText) scr.out.textContent = outText;
  scr.out.style.fill = outFlow > 0.5 ? "#ff5a00" : "#ff3b30";
  const pressed = win(t, C.gcsPress1 - 0.05, C.gcsPress1 + 0.45, 0.06) + win(t, C.gcsPress2 - 0.05, C.gcsPress2 + 0.45, 0.06);
  scr.btn.classList.toggle("on", pressed > 0.5);
  const u = Math.min(0.995, 0.04 + (0.93 * sample(routeTau, t)) / DUR);
  scr.done.style.strokeDasharray = `${u.toFixed(4)} 1`;
  const [px, py, pa] = onRoute(u);
  scr.plane.setAttribute("transform", `translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${((pa * 180) / Math.PI).toFixed(1)}) scale(1.25)`);
  scr.planePath.classList.toggle("fault", flowRate(t) < 0.5 && Math.sin(TAU * 2.5 * t) > 0);

  // 角标、字幕、读数
  const scene = TIMELINE.scenes.find((s) => t >= s.start && t < s.end) || TIMELINE.scenes[TIMELINE.scenes.length - 1];
  if (ui.fig.textContent !== scene.fig) ui.fig.textContent = scene.fig;
  if (ui.title.textContent !== scene.title) ui.title.textContent = scene.title;
  const sub = SUBS.find((s) => t >= s.a && t < s.hold);
  const end = ramp(t, C.closeSlogan - 0.7, 1.3);
  const subText = sub && end < 0.5 ? sub.text : "";
  if (ui.sub.textContent !== subText) ui.sub.textContent = subText;
  ui.sub.style.opacity = (1 - end).toFixed(3);
  let ro = "";
  for (const [t0, text] of READOUT) if (t >= t0) ro = text;
  if (ui.readout.innerHTML !== ro) ui.readout.innerHTML = ro;
  ui.legend.style.opacity = (ramp(t, C.fcOut - 0.5, 0.8) * (1 - end)).toFixed(3);
  ui.end.style.opacity = end.toFixed(3);
  figwrap.style.opacity = (1 - 0.88 * end).toFixed(3);
  for (const el of ui.corners) el.style.opacity = (1 - end).toFixed(3);
}

window.render = render;
window.DURATION = DUR;
window.seek = (t) => {
  render(t);
  return new Promise((done) => requestAnimationFrame(() => requestAnimationFrame(done)));
};
window.ready = document.fonts.ready.then(() => true);

// 浏览器预览：点击播放（带配音）
const audio = $("[data-voice]");
const params = new URLSearchParams(location.search);
render(params.has("t") ? +params.get("t") : 0);
if (!params.has("render")) {
  let playing = false;
  const loop = () => {
    render(audio.currentTime);
    if (playing) requestAnimationFrame(loop);
  };
  document.addEventListener("click", () => {
    playing = !playing;
    if (playing) audio.play().then(loop);
    else audio.pause();
  });
}
