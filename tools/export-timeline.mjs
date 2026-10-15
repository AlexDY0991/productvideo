// Export the film's timeline (scenes, subtitles, sync cues) to JSON for the audio tools.
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const m = await import(pathToFileURL(path.join(root, 'film/src/script.js')).href);
const out = path.join(root, 'out/timeline.json');
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify({ duration: m.DURATION, scenes: m.SCENES, subs: m.SUBS, cues: m.CUES }, null, 1));
console.log('wrote', path.relative(root, out));
