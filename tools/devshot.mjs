// Screenshot a dev page: node tools/devshot.mjs film/dev/gazer.html out/dev.png
import { chromium } from 'playwright';
import { serve, CHROME_ARGS } from './serve.mjs';
const [page_, out] = process.argv.slice(2);
const { srv, port } = await serve();
const b = await chromium.launch({ args: CHROME_ARGS });
const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
p.on('pageerror', (e) => console.log('ERR', e.message));
p.on('console', (m) => m.type() === 'error' && console.log('console', m.text()));
await p.goto(`http://127.0.0.1:${port}/${page_}`);
await p.waitForFunction(() => window.done, null, { timeout: 120000 });
await p.screenshot({ path: out });
await b.close(); srv.close();
