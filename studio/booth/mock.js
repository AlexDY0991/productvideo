const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const p = await b.newPage({ viewport: { width: 1600, height: 1100 }, deviceScaleFactor: 1.5 });
  await p.goto('file://' + path.resolve('studio/booth/mockup.html')); await p.waitForTimeout(300);
  await p.screenshot({ path: 'studio/out/booth-mockup.png' }); await b.close(); })();
