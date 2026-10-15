// Tiny static file server for the film (used by still.mjs / render.mjs).
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.css': 'text/css',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.glb': 'model/gltf-binary', '.wasm': 'application/wasm', '.m4a': 'audio/mp4', '.wav': 'audio/wav', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4' };

export function serve(port = 0) {
  return new Promise((resolve) => {
    const srv = http.createServer((req, res) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
      fs.stat(p, (err, st) => {
        if (err || !st.isFile()) { res.writeHead(404); res.end('not found'); return; }
        res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream', 'Content-Length': st.size, 'Cache-Control': 'no-cache' });
        fs.createReadStream(p).pipe(res);
      });
    });
    srv.listen(port, '127.0.0.1', () => resolve({ srv, port: srv.address().port, root: ROOT }));
  });
}

export const CHROME_ARGS = ['--disable-accelerated-2d-canvas', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox',
  '--force-color-profile=srgb', '--font-render-hinting=none', '--disable-lcd-text', '--autoplay-policy=no-user-gesture-required'];

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const { port } = await serve(parseInt(process.argv[2] || '8080'));
  console.log(`Serving film at http://127.0.0.1:${port}/film/`);
}
