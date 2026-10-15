// 把 audio/lines/*.mp3 拼成整条配音 audio/voice.wav，并写出 timeline.json（每句起止时间）。
// 每句先裁掉首尾静音，再按 script.json 的句间/场间停顿排布。
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const script = JSON.parse(readFileSync(join(ROOT, "script.json"), "utf8"));
const RATE = 48000;
const LEAD = 0.6;

const trim = "silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.03,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.06,areverse";
const pcmOf = (file) =>
  execFileSync("ffmpeg", ["-v", "error", "-i", file, "-af", trim, "-ac", "1", "-ar", String(RATE), "-f", "s16le", "-"], { maxBuffer: 1 << 28 });

const parts = [];
const scenes = [];
let t = LEAD;
const silence = (seconds) => parts.push(Buffer.alloc(Math.round(seconds * RATE) * 2));
silence(LEAD);
script.scenes.forEach((scene, sceneIndex) => {
  const start = sceneIndex === 0 ? 0 : t;
  const lines = scene.lines.map((text, index) => {
    if (index) {
      silence(script.gapSentence);
      t += script.gapSentence;
    }
    const pcm = pcmOf(join(ROOT, "audio", "lines", `${scene.id}-${index}.mp3`));
    const duration = pcm.length / 2 / RATE;
    parts.push(pcm);
    const line = { text, start: +t.toFixed(3), end: +(t + duration).toFixed(3) };
    t += duration;
    return line;
  });
  const hold = (scene.tail ?? 0) + (sceneIndex < script.scenes.length - 1 ? script.gapScene : 0);
  silence(hold);
  t += hold;
  scenes.push({ id: scene.id, fig: scene.fig, title: scene.title, start: +start.toFixed(3), end: +t.toFixed(3), lines });
});

const data = Buffer.concat(parts);
const header = Buffer.alloc(44);
header.write("RIFF", 0);
header.writeUInt32LE(36 + data.length, 4);
header.write("WAVEfmt ", 8);
header.writeUInt32LE(16, 16);
header.writeUInt16LE(1, 20);
header.writeUInt16LE(1, 22);
header.writeUInt32LE(RATE, 24);
header.writeUInt32LE(RATE * 2, 28);
header.writeUInt16LE(2, 32);
header.writeUInt16LE(16, 34);
header.write("data", 36);
header.writeUInt32LE(data.length, 40);
writeFileSync(join(ROOT, "audio", "voice.wav"), Buffer.concat([header, data]));
writeFileSync(join(ROOT, "timeline.json"), JSON.stringify({ duration: +t.toFixed(3), scenes }, null, 1));
for (const scene of scenes) console.log(`${scene.start.toFixed(2).padStart(6)}–${scene.end.toFixed(2).padStart(6)}  ${scene.id}`);
console.log(`total ${t.toFixed(2)} s`);
