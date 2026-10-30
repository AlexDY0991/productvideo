import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
await p.goto('http://127.0.0.1:8765/film03/assets/glb/cockpit.html');
await p.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
const q = JSON.parse(process.argv[2]);
for (const [o, d] of q) console.log(JSON.stringify(o), JSON.stringify(await p.evaluate(([a, c]) => window.hit(a, c), [o, d])));
await b.close();
