// 逐帧渲染 film/index.html → MP4。每个 worker 用独立的浏览器（软件 WebGL 在同一个浏览器里共用一个 GPU 进程，开多页并不会更快）。
//   node render/render.mjs --shots 3,12.5,40 [--out dir]     导出若干静帧（PNG）检查
//   node render/render.mjs [--fps 30] [--workers 4] [--from 0 --to 115]   渲染整片
import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { createReadStream, existsSync, mkdirSync, statSync, writeFileSync, rmSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || "/opt/node22/lib/node_modules/playwright/index.mjs");
const arg = (name, fallback) => (process.argv.includes(name) ? process.argv[process.argv.indexOf(name) + 1] : fallback);
const FPS = Number(arg("--fps", 30));
const WORKERS = Number(arg("--workers", 4));
const OUT = arg("--out", join(ROOT, "out"));
const EXECUTABLE = process.env.CHROME_PATH || (existsSync("/opt/pw-browsers/chromium-1194/chrome-linux/chrome") ? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome" : undefined);
const GL_ARGS = ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"];
mkdirSync(OUT, { recursive: true });

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".ttf": "font/ttf", ".png": "image/png", ".wav": "audio/wav", ".json": "application/json", ".glb": "model/gltf-binary", ".wasm": "application/wasm", ".mp3": "audio/mpeg" };
const server = createServer((req, res) => {
  const path = join(ROOT, decodeURIComponent(new URL(req.url, "http://x").pathname));
  if (!path.startsWith(ROOT) || !existsSync(path) || statSync(path).isDirectory()) {
    res.writeHead(404).end();
    return;
  }
  res.writeHead(200, { "Content-Type": TYPES[extname(path)] || "application/octet-stream" });
  createReadStream(path).pipe(res);
});
await new Promise((done) => server.listen(0, "127.0.0.1", done));
const URL_ = `http://127.0.0.1:${server.address().port}/film/index.html?render`;

async function open(browser) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.goto(URL_, { waitUntil: "load" });
  await page.waitForFunction(() => window.ready === true, null, { timeout: 180000 });
  await page.waitForTimeout(300);
  if (errors.length) console.error(errors.join("\n"));
  return page;
}

const launch = () => chromium.launch({ executablePath: EXECUTABLE, args: ["--font-render-hinting=none", "--disable-lcd-text", ...GL_ARGS] });
const browser = await launch();
try {
  const shots = arg("--shots", null);
  if (shots) {
    const page = await open(browser);
    for (const t of shots.split(",").map(Number)) {
      await page.evaluate((x) => window.seek(x), t);
      const file = join(OUT, `shot-${String(t.toFixed(2)).padStart(7, "0")}.png`);
      await page.screenshot({ path: file });
      console.log("saved", file);
    }
  } else {
    const duration = await (await open(browser)).evaluate(() => window.DURATION);
    const from = Number(arg("--from", 0));
    const to = Number(arg("--to", duration));
    const total = Math.round((to - from) * FPS);
    const per = Math.ceil(total / WORKERS);
    const started = Date.now();
    let done = 0;
    const parts = await Promise.all(
      [...Array(WORKERS)].map(async (_, w) => {
        const a = w * per;
        const b = Math.min(total, a + per);
        if (a >= b) return null;
        const own = await launch();
        const page = await open(own);
        const file = join(OUT, `part-${w}.mp4`);
        const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-", "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", file], { stdio: ["pipe", "inherit", "inherit"] });
        for (let f = a; f < b; f++) {
          await page.evaluate((x) => window.seek(x), from + f / FPS);
          const png = await page.screenshot({ type: "png" });
          if (!ff.stdin.write(png)) await new Promise((r) => ff.stdin.once("drain", r));
          done++;
          if (done % 150 === 0) {
            const rate = done / ((Date.now() - started) / 1000);
            console.log(`${done}/${total} frames · ${rate.toFixed(1)} fps · eta ${((total - done) / rate).toFixed(0)} s`);
          }
        }
        ff.stdin.end();
        await new Promise((r) => ff.on("close", r));
        await own.close();
        return file;
      }),
    );
    const list = join(OUT, "parts.txt");
    writeFileSync(list, parts.filter(Boolean).map((p) => `file '${p}'`).join("\n"));
    const silent = join(OUT, "video-silent.mp4");
    await run("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", silent]);
    for (const p of parts.filter(Boolean)) rmSync(p);
    rmSync(list);
    console.log(`rendered ${total} frames in ${((Date.now() - started) / 1000).toFixed(0)} s → ${silent}`);
  }
} finally {
  await browser.close();
  server.close();
}

function run(cmd, args) {
  return new Promise((done, fail) => spawn(cmd, args, { stdio: "inherit" }).on("close", (code) => (code ? fail(new Error(`${cmd} ${code}`)) : done())));
}

