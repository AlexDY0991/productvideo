// Render individual frames to PNG for review:  node tools/still.mjs 12.5 30 61 [--out dir] [--sheet name]
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';
import { serve, CHROME_ARGS } from './serve.mjs';

const args = process.argv.slice(2);
let out = 'out/stills', sheet = null, scale = 1, cols_ = 3;
const times = [];
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--out') out = args[++i];
  else if (args[i] === '--sheet') sheet = args[++i];
  else if (args[i] === '--scale') scale = parseFloat(args[++i]);
  else if (args[i] === '--cols') cols_ = parseInt(args[++i]);
  else times.push(parseFloat(args[i]));
}
const { srv, port, root } = await serve();
fs.mkdirSync(path.join(root, out), { recursive: true });
const browser = await chromium.launch({ args: CHROME_ARGS });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERROR ' + e.message));
await page.goto(`http://127.0.0.1:${port}/film/index.html?render=1`);
try { await page.waitForFunction(() => window.filmReady === true, null, { timeout: 180000 }); }
catch (e) { console.log(errors.join('\n')); throw e; }
const files = [];
for (const t of times) {
  const t0 = Date.now();
  await page.evaluate((t) => window.renderFrame(t), t);
  const ms = Date.now() - t0;
  const f = path.join(root, out, `t${t.toFixed(2).padStart(7, '0')}.png`);
  const url = await page.evaluate(() => document.getElementById('film').toDataURL('image/png'));
  const buf = Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  fs.writeFileSync(f, buf);
  files.push(f);
  console.log(`t=${t} ${ms}ms → ${path.relative(root, f)}`);
}
if (errors.length) console.log('console:\n' + [...new Set(errors)].slice(0, 30).join('\n'));
await browser.close();
srv.close();
if (sheet && files.length) {
  const cols = Math.min(cols_, files.length), rows = Math.ceil(files.length / cols);
  const inputs = files.flatMap((f) => ['-i', f]);
  const fc = files.map((_, i) => `[${i}:v]scale=640:360,drawtext=text='${times[i].toFixed(1)}':x=8:y=8:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.5[v${i}]`).join(';')
    + ';' + files.map((_, i) => `[v${i}]`).join('') + `xstack=inputs=${files.length}:layout=` +
    files.map((_, i) => `${(i % cols) * 640}_${Math.floor(i / cols) * 360}`).join('|') + (files.length < cols * rows ? `:fill=black` : '') + '[o]';
  const target = path.join(root, out, sheet);
  if (files.length === 1) fs.copyFileSync(files[0], target);
  else execFileSync('ffmpeg', ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fc, '-map', '[o]', '-frames:v', '1', target]);
  console.log('sheet →', path.relative(root, target));
}
