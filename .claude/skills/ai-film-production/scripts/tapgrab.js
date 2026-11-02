// 抓取 TapNow 公开分享画布的完整数据（节点、提示词、参数、连线）。
// 用法: node tapgrab.js https://app.tapnow.ai/tapflow/view/<分享ID> <输出目录>
// 产出: <输出目录>/canvas.json 和 <输出目录>/shot.png（画布截图）
const { chromium } = require('playwright');
const fs = require('fs');

const url = process.argv[2];
const out = process.argv[3] || 'canvas_out';
if (!url) { console.error('用法: node tapgrab.js <分享链接> <输出目录>'); process.exit(1); }
const shareId = url.split('/').filter(Boolean).pop();
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
  let saved = false;
  page.on('response', async (r) => {
    if (r.url().includes(`/shares/${shareId}/canvas`)) {
      try { fs.writeFileSync(`${out}/canvas.json`, await r.text()); saved = true; } catch (e) {}
    }
  });
  await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 }).catch((e) => console.log('goto:', e.message));
  await page.waitForTimeout(8000);
  await page.screenshot({ path: `${out}/shot.png` });
  await browser.close();
  console.log(saved ? `已保存 ${out}/canvas.json` : '没有抓到画布数据：检查链接是否为公开分享链接');
})();
