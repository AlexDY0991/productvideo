// CoolFly · DREAM v03 "Ignition" — the edit on Seed Music M3 (119.7 BPM). Hangar tension → launch at the 8.8 s lift →
// fast flight cuts with transitions hidden in motion → silent line-art beat → drop at 26.85 s → dusk hero → studio →
// full-frame CoolFly orange. __seek(t) is a pure function of t.
import { createExplode } from './explode.js';

const W = 1920, H = 1080, FPS = 24;
const BEAT = 0.5013, B0 = 0.28;                      // M3: first beat 0.28 s
const bt = (n) => +(B0 + n * BEAT).toFixed(3);       // film time of beat n (bar k = beat 4k)
const DUR = 45.5;
window.__comp = { width: W, height: H, fps: FPS, duration: DUR };

const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, x) => a + (b - a) * x;
const easeOutExpo = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
const easeInOut = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3);
const K = (k) => `../keyframes/${k}.png`;

const LIFT = 8.80, VAC = 25.0, DROP = 26.85, HIT = 43.36;

// ---------------------------------------------------------------- shots
// clip time: `in` + (t − a)·rate, or a monotone `map` of [filmT, clipT] pairs (speed ramps)
const SHOTS = [
  { a: 0, b: bt(4), kind: 'clip', id: 'VN1', in: 0.0, still: 'N1' },                                  // hangar lights
  { a: bt(4), b: bt(8), kind: 'clip', id: 'VN2', in: 0.4, still: 'N2' },                               // silhouette
  { a: bt(8), b: bt(12), kind: 'clip', id: 'VN3', in: 0.05, rate: 0.62, still: 'N3' },                 // eye (the drawn light line after 1.4 s is not used)
  { a: bt(12), b: bt(13), kind: 'clip', id: 'V5', in: 1.4, still: 'K5' },                              // light on the blade
  { a: bt(13), b: bt(14), kind: 'still', src: 'K6', z: [1.04, 1.12], pan: [0.015, 0] },
  { a: bt(14), b: LIFT, kind: 'clip', id: 'V2', map: [[bt(14), 0.5], [bt(16), 0.95], [LIFT, 2.6]], still: 'K3' }, // spin-up ramp
  { a: LIFT, b: bt(20), kind: 'clip', id: 'V10', in: 1.0, rate: 1.1, still: 'K10' },                   // launch
  { a: bt(20), b: bt(22), kind: 'clip', id: 'V9', in: 1.2, rate: 2.0, still: 'K9' },
  { a: bt(22), b: bt(26), kind: 'clip', id: 'VN4', in: 3.75 - (bt(26) - bt(22)), still: 'N4' },       // over the camera
  { a: bt(26), b: bt(30), kind: 'clip', id: 'VN5', in: 0.3, still: 'N5' },                             // skim (ends before the odd climb at 3 s)
  { a: bt(30), b: bt(34), kind: 'clip', id: 'VN6', in: 0.4, still: 'N6' },                             // top-down
  { a: bt(34), b: bt(35), kind: 'still', src: 'K7', z: [1.05, 1.13], pan: [-0.02, 0] },
  { a: bt(35), b: bt(36), kind: 'still', src: 'K8', z: [1.04, 1.12], pan: [0.02, 0] },
  { a: bt(36), b: bt(40), kind: 'clip', id: 'VN7', in: 3.95 - (bt(40) - bt(36)), still: 'N7' },       // bank + whip
  { a: bt(40), b: bt(44), kind: 'clip', id: 'V11', in: 0.3, still: 'K11' },                            // coast
  { a: bt(44), b: VAC, kind: 'clip', id: 'VN8', in: 3.75 - (VAC - bt(44)), still: 'N8' },              // rush → over
  { a: VAC, b: DROP, kind: 'gl' },                                                                       // silent X-ray
  { a: DROP, b: bt(64), kind: 'clip', id: 'VN9', in: 0.1, rate: 0.68, still: 'N9b' },                  // dusk, slow
  { a: bt(64), b: bt(68), kind: 'clip', id: 'V12', in: 0.9, still: 'K12' },
  { a: bt(68), b: bt(72), kind: 'clip', id: 'V4b', in: 0.6, still: 'K4b' },
  { a: bt(72), b: bt(84), kind: 'clip', id: 'V1', in: 2.45, rate: (5.0 - 2.45) / (bt(84) - bt(72)), still: 'K1' }, // studio hero
  { a: bt(84), b: DUR, kind: 'card', card: 'end' },                                                     // CoolFly orange
];

// transitions at cuts: flash (2 frames white), smear (horizontal blur across the cut), streak (orange light sweep)
const FX = [
  { t: bt(4), k: 'streak' }, { t: bt(12), k: 'streak' },
  { t: LIFT, k: 'flash' }, { t: bt(20), k: 'smear' }, { t: bt(22), k: 'smear' },
  { t: bt(34), k: 'flash' }, { t: bt(36), k: 'smear' }, { t: bt(40), k: 'smear' },
  { t: DROP, k: 'flash' }, { t: bt(64), k: 'smear' }, { t: bt(72), k: 'streak' },
];

// ---------------------------------------------------------------- text over footage
const UNIT = (n, u) => `<div class="big">${n}<span class="unit">${u}</span></div>`;
const OVER = [
  { a: bt(27), b: bt(30) - 0.1, html: `<div class="rule" style="margin-bottom:24px"></div>${UNIT('100', 'km/h')}<div class="label" style="margin-top:26px">Top speed</div>`, css: 'left:140px;bottom:120px' },
  { a: bt(41), b: bt(44) - 0.1, html: `<div class="rule" style="margin-bottom:24px"></div>${UNIT('40', 'min')}<div class="label" style="margin-top:26px">Flight time</div><div class="note" style="margin-top:14px">Dream Pro · with a 70 kg pilot</div>`, css: 'left:140px;bottom:120px' },
  { a: bt(56), b: bt(64) - 0.1, html: `<div class="label" style="font-size:40px;letter-spacing:.34em">Dream Pro</div><div class="note" style="margin-top:16px;color:#e9e6e1">40 min · 120 kg · 100 km/h</div>`, css: 'left:140px;bottom:120px' },
  { a: bt(58), b: bt(64) - 0.1, html: `<div class="label" style="font-size:40px;letter-spacing:.34em">Dream ST</div><div class="note" style="margin-top:16px;color:#e9e6e1">16 min · 95 kg · 100 km/h</div>`, css: 'left:760px;bottom:120px' },
  { a: bt(60), b: bt(64) - 0.1, html: `<div class="note" style="font-size:28px">Flight time with a 70 kg pilot</div>`, css: 'left:140px;bottom:64px' },
  { a: bt(74), b: bt(84) - 0.15, html: '<div class="title">Dream</div>', css: 'left:0;right:0;top:118px;text-align:center' },
  { a: bt(76), b: bt(84) - 0.15, html: '<div class="sub">Personal electric aircraft</div>', css: 'left:140px;bottom:120px' },
];

// ---------------------------------------------------------------- setup
const imgA = document.getElementById('imgA'), gl = document.getElementById('gl'), media = document.getElementById('mediaA');
const cardsEl = document.getElementById('cards'), textEl = document.getElementById('text');
const grain = document.getElementById('grain'), fade = document.getElementById('fade');
const flash = document.getElementById('flash'), streak = document.getElementById('streak');
const smearB = document.getElementById('hsmearB');
const clips = Clips.create({ fps: FPS, cache: 240 });
const loaded = new Set();
await Promise.all(SHOTS.filter((s) => s.kind === 'clip').map(async (s) => {
  try { await clips.load(s.id, `frames/${s.id}`, { still: K(s.still), label: s.id }); loaded.add(s.id); } catch (e) { /* not rendered yet: keyframe stands in */ }
}));
const end = document.createElement('div');
end.className = 'layer'; end.style.cssText = 'background:#FF5A00;display:flex;align-items:center;justify-content:center;opacity:0';
end.innerHTML = `<div class="col" id="endIn"><div id="logo" style="width:900px"></div><div class="label" id="endSub" style="margin-top:84px;font-size:48px;font-weight:500;letter-spacing:.6em;margin-right:-.6em;color:#0b0b0c">Dream</div></div>`;
cardsEl.appendChild(end);
const svg = await (await fetch('../../brand/coolfly-logo.svg')).text();
// on brand orange the orange F must not vanish: the mark is all black here
document.getElementById('logo').innerHTML = svg.replace(/fill="#FF5A00"/i, 'fill="#0b0b0c"').replace('fill="#000"', 'fill="#0b0b0c"').replace('<svg ', '<svg width="100%" ');
const scrim = document.createElement('div'); scrim.className = 'layer'; scrim.style.cssText = 'background:linear-gradient(20deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.25) 26%, transparent 48%);opacity:0'; textEl.appendChild(scrim);
const overEls = OVER.map((o) => { const el = document.createElement('div'); el.className = 't'; el.style.cssText = o.css; el.innerHTML = o.html; textEl.appendChild(el); return el; });
const explode = await createExplode(gl, { base: '../../', lineArt: true });
await document.fonts.ready;

function textAnim(el, t, a, b) {
  const e = easeOutExpo(clamp((t - a) / (8 / FPS))), o = clamp((b - t) / (4 / FPS));
  el.style.opacity = (t < a || t > b) ? 0 : Math.min(e, o);
  el.style.transform = `translateY(${(1 - e) * 12}px)`;
  el.style.filter = `blur(${(1 - e) * 8}px)`;
}
function clipTime(s, t) {
  if (s.map) {
    const m = s.map;
    for (let i = 1; i < m.length; i++) if (t <= m[i][0]) {
      const u = clamp((t - m[i - 1][0]) / (m[i][0] - m[i - 1][0]));
      return lerp(m[i - 1][1], m[i][1], i === m.length - 1 ? u * u : u);   // last leg accelerates into the cut
    }
    return m[m.length - 1][1];
  }
  return (s.in || 0) + (t - s.a) * (s.rate || 1);
}

window.__seek = async (t) => {
  t = clamp(t, 0, DUR - 1e-4);
  const n = Math.round(t * FPS);
  const s = SHOTS.find((x) => t >= x.a && t < x.b) || SHOTS[SHOTS.length - 1];
  const u = clamp((t - s.a) / (s.b - s.a));

  gl.style.opacity = s.kind === 'gl' ? 1 : 0;
  imgA.style.opacity = (s.kind === 'clip' || s.kind === 'still') ? 1 : 0;
  if (s.kind === 'clip') {
    const ct = clipTime(s, t);
    imgA.style.transform = 'none';
    if (loaded.has(s.id)) { clips.draw(imgA, s.id, ct); await clips.preload(s.id, ct); }
    else if (!imgA.src.endsWith(K(s.still).slice(2))) imgA.src = K(s.still);
  } else if (s.kind === 'still') {
    if (!imgA.src.endsWith(K(s.src).slice(2))) imgA.src = K(s.src);
    const e = easeInOut(u);
    imgA.style.transform = `translate(${s.pan[0] * e * 100}%, ${s.pan[1] * e * 100}%) scale(${lerp(s.z[0], s.z[1], e)})`;
  } else if (s.kind === 'gl') {
    explode.render(lerp(0, 2.9, easeOutCubic(u)));            // parts separate in the silence; the drop cuts away
  }
  if (imgA.src && !imgA.complete) await imgA.decode().catch(() => {});

  // transitions
  let fl = 0, sm = 0, sx = 0, st = -1;
  for (const f of FX) {
    const d = t - f.t;
    if (f.k === 'flash' && d >= 0 && d < 2 / FPS) fl = Math.max(fl, d < 1 / FPS ? 0.85 : 0.4);
    if (f.k === 'smear' && Math.abs(d) < 3 / FPS) { const w = 1 - Math.abs(d) / (3 / FPS); sm = Math.max(sm, w); sx = d < 0 ? -1 : 1; }
    if (f.k === 'streak' && d > -6 / FPS && d < 6 / FPS) st = (d + 6 / FPS) / (12 / FPS);
  }
  flash.style.opacity = fl;
  smearB.setAttribute('stdDeviation', `${(sm * 60).toFixed(1)} 0`);
  media.style.filter = sm > 0.01 ? 'url(#hsmear)' : 'none';
  media.style.transform = sm > 0.01 ? `translateX(${(-sx * sm * 6).toFixed(2)}%) scale(${(1 + sm * 0.14).toFixed(3)})` : 'none';   // scale covers the shifted edge
  if (st >= 0) {
    const x = lerp(-30, 130, easeInOut(st));
    streak.style.opacity = Math.sin(Math.PI * st);
    streak.style.background = `linear-gradient(100deg, transparent ${x - 14}%, rgba(255,90,0,.55) ${x - 4}%, rgba(255,214,170,.95) ${x}%, rgba(255,90,0,.55) ${x + 4}%, transparent ${x + 14}%)`;
  } else streak.style.opacity = 0;

  // end card: orange cuts in on the bar, the mark lands on the final hit
  const onEnd = s.kind === 'card';
  end.style.opacity = onEnd ? 1 : 0;
  if (onEnd) {
    const e = easeOutExpo(clamp((t - HIT) / (12 / FPS)));
    const el = document.getElementById('endIn');
    el.style.opacity = e; el.style.transform = `scale(${lerp(0.94, 1, e)})`; el.style.filter = `blur(${(1 - e) * 10}px)`;
    const e2 = easeOutExpo(clamp((t - HIT - 0.5) / (10 / FPS)));
    document.getElementById('endSub').style.opacity = e2;
  }

  OVER.forEach((o, i) => textAnim(overEls[i], t, o.a, o.b));
  // a soft scrim under bottom-left type on bright plates (titles at the top don't need it)
  scrim.style.opacity = Math.max(0, ...OVER.map((o, i) => (o.css.includes('bottom') ? +overEls[i].style.opacity : 0)));
  grain.style.opacity = onEnd ? 0.04 : 0.06;
  grain.style.transform = `translate(${((n * 37) % 64) - 32}px, ${((n * 53) % 64) - 32}px)`;
  fade.style.opacity = Math.max(1 - clamp(t / 0.4), (s.kind === 'gl') ? 0 : 0);
};
window.__ready = true;
