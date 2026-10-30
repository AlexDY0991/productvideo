// node probe.mjs : serve repo, load cockpit.html, print model box and pick the two side controls from a top view
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('console', (m) => console.log('[page]', m.text()));
await p.goto('http://127.0.0.1:8765/film03/assets/glb/cockpit.html');
await p.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
console.log(JSON.stringify(await p.evaluate(() => window.info())));
const cmds = JSON.parse(process.argv[2] || '[]');
for (const c of cmds) {
  if (c.shot) { await p.evaluate((v) => window.shot(v), c.shot); if (c.out) await p.screenshot({ path: c.out }); }
  if (c.pick) console.log('pick', JSON.stringify(c.pick), JSON.stringify(await p.evaluate(([x, y]) => window.pick(x, y), c.pick)));
  if (c.within) console.log('within', JSON.stringify(await p.evaluate(([a, z]) => window.within(a, z), c.within)));
  if (c.tint) console.log('tint', await p.evaluate(([n, h]) => window.tint(n, h), c.tint));
  if (c.project) console.log('proj', JSON.stringify(await p.evaluate((q) => window.project(q), c.project)));
}
await b.close();
