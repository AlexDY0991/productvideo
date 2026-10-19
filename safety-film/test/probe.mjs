// 读出模型几何信息（部件包围盒、桨叶组、动画轨道），写成 JSON 供分析
import { createServer } from "node:http";
import { createReadStream, existsSync, statSync, writeFileSync } from "node:fs";
import { extname, join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const { chromium } = await import("/opt/node22/lib/node_modules/playwright/index.mjs");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".wasm": "application/wasm", ".glb": "model/gltf-binary" };
const server = createServer((req, res) => {
  const path = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.startsWith(ROOT) || !existsSync(path) || statSync(path).isDirectory()) return res.writeHead(404).end();
  res.writeHead(200, { "Content-Type": TYPES[extname(path)] || "application/octet-stream" });
  createReadStream(path).pipe(res);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium-1194/chrome-linux/chrome", args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("pageerror", e.message));
await page.goto(`http://127.0.0.1:${server.address().port}/safety-film/test/probe.html`);
await page.waitForFunction(() => window.probe, null, { timeout: 120000 });
const data = await page.evaluate(() => JSON.parse(JSON.stringify(window.probe)));
for (const v of ["top", "side"]) { await page.setViewportSize({ width: 1600, height: 900 }); await page.evaluate((x) => window.view(x), v); await page.waitForTimeout(300); await (await page.$("#c")).screenshot({ path: process.argv[2].replace(".json", `-${v}.png`) }); }
writeFileSync(process.argv[2], JSON.stringify(data));
console.log("meshes", data.meshes.length, "box", JSON.stringify(data.box));
await browser.close();
server.close();
