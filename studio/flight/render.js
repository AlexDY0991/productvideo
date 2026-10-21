// node studio/flight/render.js studio/flight/poster.html studio/out/flight-poster  -> 1728x2304 PNG
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [src, out] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 864, height: 1152 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve(src));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out + '.png' });
  await browser.close();
  console.log(out + '.png');
})();
