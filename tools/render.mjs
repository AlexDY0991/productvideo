// Render the film to video: headless-Chromium workers pull 2-second chunks from a queue,
// each chunk is encoded to its own segment, then segments are concatenated and the audio is muxed.
//
//   node tools/render.mjs [--fps 30] [--workers 4] [--from 0] [--to 300] [--chunk 60]
//                         [--audio out/audio/mix.wav] [--out out/video/looking-up.mp4] [--crf 17]
import { chromium } from 'playwright';
import { spawn, execFileSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { serve, CHROME_ARGS } from './serve.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const FPS = +arg('fps', 30), WORKERS = +arg('workers', 4), FROM = +arg('from', 0), TO = +arg('to', 300);
const CHUNK = +arg('chunk', 60), CRF = arg('crf', '17'), AUDIO = arg('audio', null);
const OUT = arg('out', 'out/video/looking-up.mp4');
const { srv, port, root } = await serve();
const segDir = path.join(root, 'out/video/segments');
fs.rmSync(segDir, { recursive: true, force: true });
fs.mkdirSync(segDir, { recursive: true });

const f0 = Math.round(FROM * FPS), f1 = Math.round(TO * FPS), total = f1 - f0;
const chunks = [];
for (let a = f0; a < f1; a += CHUNK) chunks.push([a, Math.min(f1, a + CHUNK)]);
let next = 0, done = 0;
const t0 = Date.now();
const tick = () => { done++; if (done % 90 === 0 || done === total) { const el = (Date.now() - t0) / 1000; console.log(`${done}/${total} frames · ${(done / el).toFixed(2)} fps · eta ${((total - done) / (done / el) / 60).toFixed(1)} min`); } };

function encodeSegment(file) {
  return spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', CRF, '-pix_fmt', 'yuv420p', '-tune', 'film', '-r', String(FPS), file], { stdio: ['pipe', 'inherit', 'inherit'] });
}

async function worker(k) {
  const browser = await chromium.launch({ args: CHROME_ARGS });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error(`[w${k}] pageerror`, e.message));
  await page.goto(`http://127.0.0.1:${port}/film/index.html?render=1`);
  await page.waitForFunction(() => window.filmReady === true, null, { timeout: 600000 });
  while (next < chunks.length) {
    const ci = next++;
    const [a, b] = chunks[ci];
    const ff = encodeSegment(path.join(segDir, `seg_${String(ci).padStart(4, '0')}.mp4`));
    for (let f = a; f < b; f++) {
      // render + encode inside the page (far faster than a compositor screenshot)
      const url = await page.evaluate((t) => { window.renderFrame(t); return document.getElementById('film').toDataURL('image/png'); }, f / FPS);
      const png = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
      if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once('drain', r));
      tick();
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
  }
  await browser.close();
}

await Promise.all(Array.from({ length: WORKERS }, (_, k) => worker(k)));
srv.close();
const segs = chunks.map((_, ci) => path.join(segDir, `seg_${String(ci).padStart(4, '0')}.mp4`));
const list = path.join(segDir, 'list.txt');
fs.writeFileSync(list, segs.map((s) => `file '${s}'`).join('\n'));
const video = path.join(root, 'out/video/picture.mp4');
execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'concat', '-safe', '0', '-i', list, '-c:v', 'copy', video], { stdio: 'inherit' });
const out = path.join(root, OUT);
fs.mkdirSync(path.dirname(out), { recursive: true });
if (AUDIO) {
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', video, '-ss', String(FROM), '-t', String(TO - FROM), '-i', path.join(root, AUDIO),
    '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-shortest', '-movflags', '+faststart', out], { stdio: 'inherit' });
} else fs.copyFileSync(video, out);
console.log(`→ ${path.relative(root, out)} in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
