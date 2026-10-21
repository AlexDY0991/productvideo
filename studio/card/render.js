// Render a card page to a 600 dpi PNG preview and a print PDF (90 x 54 mm, vector text).
//   node studio/card/render.js studio/card/card.html studio/out/card-front
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const [src, out] = process.argv.slice(2);
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  // 90 mm = 340.16 css px; scale 6.25 gives ~2126 px wide (600 dpi)
  const page = await browser.newPage({ viewport: { width: 341, height: 205 }, deviceScaleFactor: 6.25 });
  await page.goto('file://' + path.resolve(src));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out + '.png', clip: { x: 0, y: 0, width: 340, height: 204 } });
  await page.pdf({ path: out + '.pdf', width: '90mm', height: '54mm', printBackground: true, pageRanges: '1' });
  await browser.close();
  console.log(out + '.png', out + '.pdf');
})();
