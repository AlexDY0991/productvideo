// Film compositor: maps global time t → scene draws, transitions, captions, subtitles.
import { W, H, clamp, smooth, env, seg } from './core.js';
import { makeCanvas, text } from './gfx.js';
import { SCENES, SUBS, CHAPTERS, DURATION } from './script.js';
import { FONTS } from './fonts.js';

import prologue from './scenes/prologue.js';
import { icarus, feitian, luban, kite } from './scenes/myth.js';
import codex from './scenes/codex.js';
import { lantern, balloon } from './scenes/lighter.js';
import wright from './scenes/wright.js';
import war from './scenes/war.js';
import golden from './scenes/golden.js';
import jet from './scenes/jet.js';
import heli from './scenes/heli.js';
import space from './scenes/space.js';
import digital from './scenes/digital.js';
import individual from './scenes/individual.js';
import finale from './scenes/finale.js';

const MODULES = { prologue, icarus, feitian, luban, kite, codex, lantern, balloon, wright, war, golden, jet, heli, space, digital, individual, finale };

export const film = {
  canvas: null,
  ctx: null,
  buf: null,
  showSubs: true,
  ready: false,
  duration: DURATION,
};

export async function loadFonts(base = './') {
  const faces = FONTS.map((f) => new FontFace(f.family, `url(${base}assets/fonts/${f.file})`, { weight: String(f.weight), style: f.style, unicodeRange: f.range }));
  await Promise.all(faces.map((f) => f.load().then((ff) => document.fonts.add(ff)).catch((e) => console.warn('font', f.family, e))));
}

export async function init(canvas, { base = './' } = {}) {
  film.canvas = canvas;
  canvas.width = W; canvas.height = H;
  film.ctx = canvas.getContext('2d');
  film.buf = makeCanvas(W, H);
  await loadFonts(base);
  for (const s of SCENES) {
    const m = MODULES[s.id];
    s.mod = m;
    if (m.init) await m.init({ base, scene: s });
  }
  film.ready = true;
}

// Transition-in duration & style per scene
function transIn(s) { return s.mod.transIn ?? { dur: 1.2, type: 'fade' }; }

export function renderFrame(t) {
  const ctx = film.ctx;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Find active scene(s)
  let idx = SCENES.findIndex((s) => t >= s.a && t < s.b);
  if (idx < 0) idx = t < 0 ? 0 : SCENES.length - 1;
  const cur = SCENES[idx];
  const next = SCENES[idx + 1];
  const draw = (s, c) => {
    c.save();
    s.mod.draw(c, t - s.a, s.b - s.a, t);
    c.restore();
  };

  // Is the next scene's transition-in already overlapping the tail of the current one?
  let blended = false;
  if (next) {
    const tr = transIn(next);
    const half = tr.dur / 2;
    if (t >= next.a - half) {
      const k = smooth((t - (next.a - half)) / tr.dur);
      blendScenes(ctx, cur, next, k, tr.type, draw, t);
      blended = true;
    }
  }
  if (!blended) {
    const prev = SCENES[idx - 1];
    const tr = transIn(cur);
    const half = tr.dur / 2;
    if (prev && t < cur.a + half) {
      const k = smooth((t - (cur.a - half)) / tr.dur);
      blendScenes(ctx, prev, cur, k, tr.type, draw, t);
    } else {
      draw(cur, ctx);
    }
  }

  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = 'source-over';
  drawChapterCard(ctx, t);
  if (film.showSubs) drawSubs(ctx, t);
  ctx.restore();
}

function blendScenes(ctx, A, B, k, type, draw, t) {
  if (type === 'cut') { draw(k < 0.5 ? A : B, ctx); return; }
  if (type === 'black' || type === 'white') {
    const col = type === 'black' ? '#000' : '#fff';
    if (k < 0.5) draw(A, ctx); else draw(B, ctx);
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1 - Math.abs(k - 0.5) * 2;
    ctx.fillStyle = col;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
    return;
  }
  draw(A, ctx);
  const b = film.buf.ctx;
  b.setTransform(1, 0, 0, 1, 0, 0);
  b.globalAlpha = 1; b.globalCompositeOperation = 'source-over';
  b.clearRect(0, 0, W, H);
  draw(B, b);
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  if (type === 'wipe') {
    // soft diagonal wipe following the sightline direction (bottom-left → top-right)
    ctx.drawImage(maskApply(film.buf.c, makeMask(k * 1.3 - 0.15)), 0, 0);
  } else {
    ctx.globalAlpha = k;
    ctx.drawImage(film.buf.c, 0, 0);
  }
  ctx.restore();
}

let maskBuf = null;
function makeMask(p) {
  if (!maskBuf) maskBuf = makeCanvas(W, H);
  const m = maskBuf.ctx;
  m.setTransform(1, 0, 0, 1, 0, 0);
  m.globalCompositeOperation = 'source-over';
  m.clearRect(0, 0, W, H);
  const g = m.createLinearGradient(0, H, W * 0.6, -H * 0.2);
  const a = clamp(p - 0.12, 0, 1), b = clamp(p + 0.12, 0, 1);
  g.addColorStop(0, 'rgba(0,0,0,1)');
  if (a > 0) g.addColorStop(a, 'rgba(0,0,0,1)');
  g.addColorStop(b, 'rgba(0,0,0,0)');
  g.addColorStop(1, 'rgba(0,0,0,0)');
  m.fillStyle = g;
  m.fillRect(0, 0, W, H);
  return maskBuf;
}
function maskApply(src, mask) {
  const m = mask.ctx;
  m.globalCompositeOperation = 'source-in';
  m.drawImage(src, 0, 0);
  m.globalCompositeOperation = 'source-over';
  return mask.c;
}

// ---------------------------------------------------------------------------
// Chapter card: museum-caption style, top-left. Colour follows the scene's palette.
function captionColor(t) {
  const s = SCENES.find((x) => t >= x.a && t < x.b);
  return (s && s.mod.caption) || 'rgba(255,255,255,0.92)';
}
function drawChapterCard(ctx, t) {
  const ch = CHAPTERS.find((c) => t >= c.a && t < c.b);
  if (!ch) return;
  const lt = t - ch.a;
  const a = env(lt, 0.8, 6.8, 0.9, 1.2);
  if (a <= 0) return;
  const col = captionColor(t);
  const x = 96, y = 104;
  const grow = smooth(seg(lt, 0.8, 2.4));
  ctx.save();
  ctx.globalAlpha = a;
  text(ctx, ch.n, x, y, { font: 'Cinzel', size: 20, weight: 600, color: col, align: 'left', spacing: 4 });
  ctx.strokeStyle = col;
  ctx.globalAlpha = a * 0.7;
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(x + 58, y - 7); ctx.lineTo(x + 58 + 64 * grow, y - 7); ctx.stroke();
  ctx.globalAlpha = a;
  text(ctx, ch.zh, x + 140, y + 1, { font: 'Noto Serif SC', size: 26, weight: 600, color: col, align: 'left', spacing: 8 });
  text(ctx, `${ch.en}  ·  ${ch.year}`, x + 140, y + 34, { font: 'Cormorant Garamond', size: 17, weight: 600, color: col, align: 'left', spacing: 4.5, alpha: 0.82 });
  ctx.restore();
}

// ---------------------------------------------------------------------------
// Bilingual subtitles
function drawSubs(ctx, t) {
  for (const s of SUBS) {
    if (t < s.a - 0.4 || t > s.b + 0.4) continue;
    const a = env(t, s.a - 0.25, s.b + 0.25, 0.45, 0.45);
    if (a <= 0) continue;
    const rise = (1 - smooth(seg(t, s.a - 0.25, s.a + 0.4))) * 6;
    ctx.save();
    // soft shadow band for legibility on bright scenes
    const g = ctx.createLinearGradient(0, H - 210, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, 'rgba(0,0,0,0.38)');
    ctx.globalAlpha = a * 0.75;
    ctx.fillStyle = g;
    ctx.fillRect(0, H - 210, W, 210);
    ctx.restore();
    text(ctx, s.zh, W / 2, H - 104 + rise, { font: 'Noto Serif SC', size: 38, weight: 600, color: '#fbf8f1', spacing: 3, alpha: a, shadow: 14, shadowColor: 'rgba(0,0,0,0.55)' });
    text(ctx, s.en, W / 2, H - 60 + rise, { font: 'Cormorant Garamond', size: 27, weight: 500, style: 'italic', color: '#f1ece2', spacing: 0.6, alpha: a * 0.92, shadow: 12, shadowColor: 'rgba(0,0,0,0.6)' });
  }
}
