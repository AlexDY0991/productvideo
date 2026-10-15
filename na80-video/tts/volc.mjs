// 火山引擎（豆包语音合成）逐句合成配音，写入 audio/lines/<scene>-<n>.mp3。
// 接口：HTTP V3 单向流式 https://openspeech.bytedance.com/api/v3/tts/unidirectional
//
// 鉴权（二选一，放在环境变量里，不要写进仓库）：
//   新版控制台：VOLC_API_KEY
//   旧版控制台：VOLC_APP_ID + VOLC_ACCESS_KEY
// 可选：
//   VOLC_SPEAKER      音色，默认 zh_male_m191_uranus_bigtts（云舟 2.0，通用男声）
//   VOLC_RESOURCE_ID  默认按音色推断：*_uranus_bigtts → seed-tts-2.0，其余 → seed-tts-1.0
//   VOLC_SPEECH_RATE  语速 [-50, 100]，默认 0
//
// 用法：node tts/volc.mjs [--only hook-0]
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "audio", "lines");
const script = JSON.parse(readFileSync(join(ROOT, "script.json"), "utf8"));

const speaker = process.env.VOLC_SPEAKER || "zh_male_m191_uranus_bigtts";
const resource = process.env.VOLC_RESOURCE_ID || (speaker.includes("_uranus_") ? "seed-tts-2.0" : "seed-tts-1.0");
const rate = Number(process.env.VOLC_SPEECH_RATE || 0);
const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;

const auth = process.env.VOLC_API_KEY
  ? { "X-Api-Key": process.env.VOLC_API_KEY }
  : process.env.VOLC_APP_ID && process.env.VOLC_ACCESS_KEY
    ? { "X-Api-App-Id": process.env.VOLC_APP_ID, "X-Api-Access-Key": process.env.VOLC_ACCESS_KEY }
    : null;
if (!auth) {
  console.error("缺少火山引擎凭证：请设置 VOLC_API_KEY，或 VOLC_APP_ID + VOLC_ACCESS_KEY。");
  process.exit(2);
}

async function synth(text) {
  const response = await fetch("https://openspeech.bytedance.com/api/v3/tts/unidirectional", {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Resource-Id": resource, "X-Api-Request-Id": randomUUID(), ...auth },
    body: JSON.stringify({
      user: { uid: "na80-video" },
      req_params: { text, speaker, audio_params: { format: "mp3", sample_rate: 24000, speech_rate: rate } },
    }),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${await response.text()}`);
  const chunks = [];
  let buffer = "";
  const take = (line) => {
    if (!line.trim()) return;
    const message = JSON.parse(line);
    if (message.data) chunks.push(Buffer.from(message.data, "base64"));
    else if (message.code && message.code !== 0 && message.code !== 20000000) throw new Error(`TTS ${message.code}: ${message.message}`);
  };
  const decoder = new TextDecoder();
  for await (const part of response.body) {
    buffer += decoder.decode(part, { stream: true });
    // 每个分片是一行完整 JSON；也兼容服务端把多个对象连在一起返回。
    let cut;
    while ((cut = buffer.indexOf("\n")) >= 0) {
      take(buffer.slice(0, cut));
      buffer = buffer.slice(cut + 1);
    }
  }
  buffer.split(/(?<=\})\s*(?=\{)/).forEach(take);
  if (!chunks.length) throw new Error("没有收到音频数据");
  return Buffer.concat(chunks);
}

mkdirSync(OUT, { recursive: true });
for (const scene of script.scenes) {
  for (const [index, text] of scene.lines.entries()) {
    const id = `${scene.id}-${index}`;
    if (only && only !== id) continue;
    const audio = await synth(text);
    writeFileSync(join(OUT, `${id}.mp3`), audio);
    console.log(`${id}  ${(audio.length / 1024).toFixed(0)} KB  ${text}`);
  }
}
console.log(`done · ${speaker} · ${resource}`);
