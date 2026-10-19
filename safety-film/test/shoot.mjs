// 风格测试：渲染若干静帧并测量单帧耗时
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = process.argv[2];
const { chromium } = await import("/opt/node22/lib/node_modules/playwright/index.mjs");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".wasm": "application/wasm", ".glb": "model/gltf-binary", ".ttf": "font/ttf", ".png": "image/png" };
const server = createServer((req, res) => {
  const path = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.startsWith(ROOT) || !existsSync(path) || statSync(path).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { "Content-Type": TYPES[extname(path)] || "application/octet-stream" });
  createReadStream(path).pipe(res);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on("pageerror", (e) => console.error("pageerror", e.message));
page.on("console", (m) => m.type() === "error" && console.error("console", m.text()));
await page.goto(`http://127.0.0.1:${server.address().port}/safety-film/test/style.html`);
await page.waitForFunction(() => window.ready === true, null, { timeout: 120000 });
for (const name of ["wide", "close"]) {
  const info = await page.evaluate((n) => window.renderShot(n), name);
  await page.waitForTimeout(200);
  await page.screenshot({ path: join(OUT, `style-${name}.png`) });
  console.log(name, JSON.stringify(info));
}
await browser.close();
server.close();
