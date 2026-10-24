// Print files for the booth: vector PDF at true size (with 50 mm bleed) plus a PNG preview.
//   node studio/booth/render.js studio/booth/backdrop.html studio/out/booth-backdrop 3150 2540 [dpi]
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [src, out, wmm, hmm, dpi = '60'] = process.argv.slice(2);
  const pxPerMm = 96 / 25.4, scale = Number(dpi) / 96;
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  const page = await browser.newPage({ viewport: { width: Math.ceil(wmm * pxPerMm), height: Math.ceil(hmm * pxPerMm) }, deviceScaleFactor: scale });
  await page.goto('file://' + path.resolve(src));
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out + '.png' });
  await page.pdf({ path: out + '.pdf', width: wmm + 'mm', height: hmm + 'mm', printBackground: true, pageRanges: '1' });
  await browser.close();
  console.log(out);
})();
