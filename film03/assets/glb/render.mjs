// node render.mjs OUTDIR : clean Dream cockpit prop renders for film03 step 1 + projected label points (labels.json).
// Needs a static server on the repo root at :8765 (python3 -m http.server 8765 --bind 127.0.0.1).
// Axes: pilot faces +z, pilot's RIGHT is -x, floor y = 0, metres.
import { createRequire } from 'module';
import { writeFileSync } from 'fs';
const { chromium } = createRequire(import.meta.url)('playwright');
const OUT = process.argv[2];
const P = {   // world points of the parts we label
  stick: [-0.51, 1.12, 0.33], panel: [0.55, 0.98, 0.5], seat: [0, 0.62, -0.1], harness: [0, 0.95, -0.55],
  headrest: [0, 1.62, -1.04], footwell: [0, 0.3, 1.15], vbars: [0, 1.9, 1.2], nose: [0, 1.0, 2.6],
  chute: [0, 2.42, -0.78], bagF: [0.42, 0.2, 1.72], bagM: [0.37, -0.1, 0], bagR: [0.42, 0.3, -1.62], skid: [0.62, -0.25, 1.0],
};
const VIEWS = {
  hero:    { pos: [5.6, 2.4, 5.1], target: [0, 1.0, 0], fov: 32 },          // front 3/4 from pilot's left, like the runway photo
  top:     { pos: [0, 7.5, 0.15], target: [0, 0.6, 0.15], up: [0, 0, 1], fov: 24 },   // plan view, forward = up, pilot's right = frame right
  left:    { pos: [8.5, 1.25, 0], target: [0, 0.95, 0], fov: 30 },         // pilot's left side
  right:   { pos: [-8.5, 1.25, 0], target: [0, 0.95, 0], fov: 30 },        // pilot's right side
  stick:   { pos: [-1.25, 2.05, 1.35], target: [-0.45, 0.95, 0.2], fov: 30 },   // from front-right, down onto the side-stick
  r34:     { pos: [-5.6, 3.0, 1.6], target: [0, 0.95, 0.1], fov: 30 },          // front 3/4 from pilot's right, eye level: seated-pilot reference
  seat:    { pos: [-4.6, 2.62, 4.4], target: [-0.1, 1.02, -0.25], fov: 24 },   // seated-pilot plate: front-right, elevated, clear view of seat + right stick
  pov:     { pos: [0, 1.5, -0.65], target: [0, 0.75, 2.5], fov: 78 },       // pilot eye
};
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('http://127.0.0.1:8765/film03/assets/glb/cockpit.html');
await p.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const labels = {};
const LIFT = await p.evaluate(() => window.LIFT || 0);   // the aircraft stands on skids: cameras are set relative to the airframe
for (const [k, v0] of Object.entries(VIEWS)) {
  const v = { ...v0, pos: [v0.pos[0], v0.pos[1] + LIFT, v0.pos[2]], target: [v0.target[0], v0.target[1] + LIFT, v0.target[2]] };
  await p.evaluate((x) => window.shot(x), v);
  await p.screenshot({ path: `${OUT}/glb_${k}.png` });
  const lift = await p.evaluate(() => window.LIFT || 0);
  const pr = await p.evaluate((q) => window.project(q), Object.values(P).map(([x, y, z]) => [x, y + lift, z]));
  labels[k] = Object.fromEntries(Object.keys(P).map((n, i) => [n, pr[i]]));
}
writeFileSync(`${OUT}/labels.json`, JSON.stringify(labels, null, 1));
await b.close();
