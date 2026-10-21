// Render a 737x1000 sheet to a 1474x2000 PNG and a vector PDF (same aspect, 147.4 x 200 mm; scale to the print size).
//   node studio/na80/render.js studio/na80/front.html studio/out/na80-front
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const [src, out] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: 737, height: 1000 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.resolve(src));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out + '.png' });
  await page.pdf({ path: out + '.pdf', width: '147.4mm', height: '200mm', printBackground: true, pageRanges: '1', scale: 147.4 / 195 });
  await browser.close();
  console.log(out + '.png');
})();
