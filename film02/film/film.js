// CoolFly · DREAM Anatomy — the edit. __seek(t) is a pure function of t: footage (Seedance, played as frame
// sequences), keyframe stills with a slow push, the GLB exploded view, and code typography, all on the score's bars.
import { createExplode } from './explode.js';

const W = 1920, H = 1080, FPS = 24;
const BAR = 3.006, B = BAR / 4;                 // Seed Music M1: 79.85 BPM; film 0 = track 12.06 s (a bar line)
const DUR = +(16 * BAR).toFixed(3);
window.__comp = { width: W, height: H, fps: FPS, duration: DUR };

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const K = (k) => `../keyframes/${k}.png`;

// ---------------------------------------------------------------- shots (film seconds)
const SHOTS = [
  { a: 0, b: BAR, kind: 'clip', id: 'V5', in: 0.2, still: 'K5' },                        // I  presence
  { a: BAR, b: 2 * BAR, kind: 'clip', id: 'V3', in: 2.0, rate: (4.0 - 2.0) / BAR, still: 'K2' },   // flare at 1.0–1.6 s trimmed
  { a: 2 * BAR, b: 4 * BAR, kind: 'clip', id: 'V1', in: 2.45, rate: (5.0 - 2.45) / (2 * BAR), still: 'K1' },
  { a: 4 * BAR, b: 4 * BAR + 2 * B, kind: 'still', src: 'K6', z: [1.02, 1.09], pan: [0.01, -0.01] },
  { a: 4 * BAR + 2 * B, b: 4 * BAR + 3 * B, kind: 'still', src: 'K7', z: [1.03, 1.08], pan: [-0.01, 0] },
  { a: 4 * BAR + 3 * B, b: 5 * BAR, kind: 'still', src: 'K8', z: [1.02, 1.07], pan: [0, 0.01] },
  { a: 5 * BAR, b: 6 * BAR, kind: 'clip', id: 'V9', in: 0.3, still: 'K9' },              // II structure
  { a: 6 * BAR, b: 7 * BAR, kind: 'clip', id: 'V2', in: 0.6, still: 'K3' },
  { a: 7 * BAR, b: 8 * BAR, kind: 'gl' },
  { a: 8 * BAR, b: 9 * BAR, kind: 'card', card: 'flight' },                               // III performance
  { a: 9 * BAR, b: 10 * BAR, kind: 'clip', id: 'V10', in: 0.6, still: 'K10' },
  { a: 10 * BAR, b: 11 * BAR, kind: 'card', card: 'perf' },
  { a: 11 * BAR, b: 12 * BAR, kind: 'clip', id: 'V4b', in: 0.4, still: 'K4b' },          // IV flight
  { a: 12 * BAR, b: 13 * BAR, kind: 'clip', id: 'V11', in: 0.4, still: 'K11' },
  { a: 13 * BAR, b: 13 * BAR + 3 * B, kind: 'clip', id: 'V12', in: 0.8, still: 'K12' },
  { a: 13 * BAR + 3 * B, b: 14 * BAR, kind: 'still', src: 'K13', z: [1.0, 1.06], pan: [0.01, 0], glint: true },
  { a: 14 * BAR, b: 15 * BAR, kind: 'card', card: 'lineup' },                             // V lineup + brand
  { a: 15 * BAR, b: DUR, kind: 'card', card: 'end' },
];

// ---------------------------------------------------------------- text over footage
const OVER = [
  { a: 2 * BAR + B, b: 4 * BAR - 0.25, html: '<div class="title">Dream</div>', css: 'left:0;right:0;top:118px;text-align:center' },
  { a: 2 * BAR + 3 * B, b: 4 * BAR - 0.25, html: '<div class="sub">Personal electric aircraft</div>', css: 'left:140px;bottom:120px' },
  { a: 5 * BAR + B, b: 6 * BAR - 0.2, html: '<div class="rule" style="margin-bottom:26px"></div><div class="label">Carbon-fibre arms</div>', css: 'left:140px;bottom:132px' },
  { a: 6 * BAR + 2 * B, b: 7 * BAR - 0.2, html: '<div class="rule" style="margin-bottom:26px"></div><div class="label">Coaxial motors</div>', css: 'left:140px;bottom:132px' },
];

// ---------------------------------------------------------------- cards
const CARDS = {
  flight: `<div class="col"><div class="num"><span id="cnt">0</span><span class="unit">min</span></div>
           <div class="label" data-in="2" style="margin-top:72px">Flight time</div><div class="note" data-in="2.5" style="margin-top:22px">Dream Pro · with a 70 kg pilot</div></div>`,
  perf: `<div style="display:flex;gap:220px;align-items:flex-start">
           <div class="col" data-in="0"><div class="num s">100<span class="unit">km/h</span></div><div class="label" style="margin-top:64px">Top speed</div><div class="note" style="margin-top:22px">Dream Pro · Dream ST</div></div>
           <div class="col" data-in="1.5"><div class="num s">120<span class="unit">kg</span></div><div class="label" style="margin-top:64px">Payload</div><div class="note" style="margin-top:22px">Dream Pro</div></div></div>`,
  lineup: `<img src="${K('K1')}" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.26;filter:blur(2px)">
           <div style="position:relative;display:flex;gap:240px;align-items:flex-start">
             <div class="col" data-in="0"><div class="title" style="font-size:84px;letter-spacing:.32em;margin-right:-.32em">Dream Pro</div><div class="rule" style="margin:34px 0 40px"></div>
               <div class="spec"><span class="k">Flight time</span><span>40 min</span><span class="k">Payload</span><span>120 kg</span><span class="k">Top speed</span><span>100 km/h</span></div></div>
             <div class="col" data-in="1"><div class="title" style="font-size:84px;letter-spacing:.32em;margin-right:-.32em">Dream ST</div><div class="rule" style="margin:34px 0 40px;background:#8A8A8E"></div>
               <div class="spec"><span class="k">Flight time</span><span>16 min</span><span class="k">Payload</span><span>95 kg</span><span class="k">Top speed</span><span>100 km/h</span></div></div></div>
           <div class="note" data-in="2.5" style="position:absolute;bottom:92px;left:0;right:0;text-align:center;font-size:28px">Flight time with a 70 kg pilot.</div>`,
  end: `<div class="col"><div id="logo" style="width:860px"></div><div class="label" style="margin-top:86px;font-size:40px;letter-spacing:.6em;margin-right:-.6em">Dream</div></div>`,
};

// ---------------------------------------------------------------- setup
const imgA = document.getElementById('imgA'), gl = document.getElementById('gl');
const cardsEl = document.getElementById('cards'), textEl = document.getElementById('text');
const grain = document.getElementById('grain'), fade = document.getElementById('fade');
const clips = Clips.create({ fps: FPS, cache: 240 });
const loaded = new Set();
await Promise.all(SHOTS.filter((s) => s.kind === 'clip').map(async (s) => {
  try { await clips.load(s.id, `frames/${s.id}`, { still: K(s.still), label: s.id }); loaded.add(s.id); } catch (e) { /* not rendered yet: keyframe stands in */ }
}));
const cardEls = {};
for (const [k, html] of Object.entries(CARDS)) {
  const el = document.createElement('div'); el.className = 'layer card'; el.style.opacity = 0; el.innerHTML = html;
  cardsEl.appendChild(el); cardEls[k] = el;
}
const svg = await (await fetch('../../brand/coolfly-logo.svg')).text();
document.getElementById('logo').innerHTML = svg.replace('fill="#000"', 'fill="#F2EFEA"').replace('<svg ', '<svg width="100%" ');
const overEls = OVER.map((o) => { const el = document.createElement('div'); el.className = 't'; el.style.cssText = o.css; el.innerHTML = o.html; textEl.appendChild(el); return el; });
const glint = document.createElement('div'); glint.className = 'layer'; glint.style.mixBlendMode = 'screen'; document.getElementById('mediaA').appendChild(glint);
const explode = await createExplode(gl, { base: '../../', lineArt: true });
await document.fonts.ready;

// enter: 8 frames up 12 px + fade + blur 8→0 on expo-out; exit: 4 frames fade (cubic-in mirror)
function textAnim(el, t, a, b) {
  const e = easeOutExpo(clamp((t - a) / (8 / FPS))), o = clamp((b - t) / (4 / FPS));
  el.style.opacity = (t < a || t > b) ? 0 : Math.min(e, o);
  el.style.transform = `translateY(${(1 - e) * 12}px)`;
  el.style.filter = `blur(${(1 - e) * 8}px)`;
}

window.__seek = async (t) => {
  t = clamp(t, 0, DUR - 1e-4);
  const n = Math.round(t * FPS);
  const s = SHOTS.find((x) => t >= x.a && t < x.b) || SHOTS[SHOTS.length - 1];
  const u = clamp((t - s.a) / (s.b - s.a));

  // media
  gl.style.opacity = s.kind === 'gl' ? 1 : 0;
  imgA.style.opacity = (s.kind === 'clip' || s.kind === 'still') ? 1 : 0;
  glint.style.opacity = 0;
  if (s.kind === 'clip') {
    const ct = (s.in || 0) + (t - s.a) * (s.rate || 1);
    imgA.style.transform = 'none';
    if (loaded.has(s.id)) { clips.draw(imgA, s.id, ct); await clips.preload(s.id, ct); }
    else if (!imgA.src.endsWith(K(s.still).slice(2))) imgA.src = K(s.still);
  } else if (s.kind === 'still') {
    if (!imgA.src.endsWith(K(s.src).slice(2))) imgA.src = K(s.src);
    const e = easeInOut(u), z = lerp(s.z[0], s.z[1], e);
    imgA.style.transform = `translate(${s.pan[0] * e * 100}%, ${s.pan[1] * e * 100}%) scale(${z})`;
    if (s.glint) {   // a reflection that crosses the fairing on the cut to the lineup
      const x = lerp(-40, 140, easeInOut(clamp(u * 1.1)));
      glint.style.opacity = 1;
      glint.style.background = `linear-gradient(105deg, transparent ${x - 18}%, rgba(255,255,255,.55) ${x}%, transparent ${x + 18}%)`;
    }
  } else if (s.kind === 'gl') {
    explode.render((t - s.a) * (5 / (s.b - s.a)));
  }
  if (imgA.src && !imgA.complete) await imgA.decode().catch(() => {});

  // cards: 6-frame fade in from black, hard cut out
  for (const [k, el] of Object.entries(cardEls)) {
    const on = s.kind === 'card' && s.card === k;
    el.style.opacity = on ? easeOutCubic(clamp((t - s.a) / (6 / FPS))) : 0;
    if (!on) continue;
    if (k !== 'end') el.style.transform = `scale(${lerp(1, 1.035, easeInOut(u))})`;
    el.querySelectorAll('[data-in]').forEach((c) => textAnim(c, t, s.a + parseFloat(c.dataset.in) * B, s.b + 1));
  }
  if (s.kind === 'card' && s.card === 'flight') {
    document.getElementById('cnt').textContent = String(Math.round(40 * easeOutCubic(clamp((t - s.a - 0.15) / 0.9))));
  }
  if (s.kind === 'card' && s.card === 'end') {
    const el = cardEls.end.firstElementChild;
    const e = easeOutExpo(clamp((t - s.a - 0.1) / (12 / FPS)));
    el.style.transform = `scale(${lerp(0.96, 1, e)})`; el.style.filter = `blur(${(1 - e) * 8}px)`; el.style.opacity = e;
  }

  // text over footage
  OVER.forEach((o, i) => textAnim(overEls[i], t, o.a, o.b));

  // grain moves every frame (deterministic); open from black, close to black
  grain.style.transform = `translate(${((n * 37) % 64) - 32}px, ${((n * 53) % 64) - 32}px)`;
  fade.style.opacity = Math.max(1 - clamp(t / 0.9), clamp((t - (DUR - 0.7)) / 0.7));
};
window.__ready = true;
