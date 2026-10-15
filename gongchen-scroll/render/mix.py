#!/usr/bin/env python3
"""《竖卷·拱宸》混音：旁白按 timeline.json 落点，配乐随旁白闪避，片段现场声与程序合成音效垫底。

  python3 render/mix.py                → out/audio.wav
  python3 render/mix.py --mux          再与 out/video-silent.mp4 合成 out/竖卷拱宸.mp4（≤20MB）

音效（展卷、墨滴、钤印、收卷）由本脚本用 numpy 合成，来源可说明，无第三方素材。
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
TL = json.loads((ROOT / "timeline.json").read_text("utf8"))
SR = 48000


def total_duration():
    return sum(s["dur"] for s in TL["segments"])


def segment_starts():
    t, starts = 0.0, {}
    for s in TL["segments"]:
        starts[s["id"]] = t
        t += s["dur"]
    return starts


def decode(path, start=0.0, dur=None, tempo=1.0):
    """用 ffmpeg 解码为 48k 立体声 float32。tempo≠1 时变速不变调。"""
    args = ["ffmpeg", "-v", "error", "-ss", str(start)]
    if dur:
        args += ["-t", str(dur * tempo)]
    args += ["-i", str(path), "-vn", "-ac", "2", "-ar", str(SR)]
    if tempo != 1.0:
        args += ["-af", f"atempo={tempo}"]
    args += ["-f", "f32le", "-"]
    raw = subprocess.run(args, capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.float32).reshape(-1, 2).copy()


def place(track, clip, at, gain_db=0.0, fade_in=0.0, fade_out=0.0):
    i = int(at * SR)
    if i >= len(track) or len(clip) == 0:
        return
    clip = clip[: len(track) - i] * (10 ** (gain_db / 20))
    n = len(clip)
    env = np.ones(n, np.float32)
    if fade_in:
        k = min(n, int(fade_in * SR))
        env[:k] = np.linspace(0, 1, k)
    if fade_out:
        k = min(n, int(fade_out * SR))
        env[n - k:] *= np.linspace(1, 0, k)
    track[i:i + n] += clip * env[:, None]


# ---------------------------------------------------------------- 合成音效

def rng(seed):
    return np.random.default_rng(seed)


def bandnoise(seconds, lo, hi, seed):
    n = int(seconds * SR)
    spec = np.fft.rfft(rng(seed).standard_normal(n))
    freqs = np.fft.rfftfreq(n, 1 / SR)
    spec[(freqs < lo) | (freqs > hi)] = 0
    out = np.fft.irfft(spec, n).astype(np.float32)
    return out / (np.abs(out).max() + 1e-9)


def stereo(mono, width=0.0, seed=0):
    if width:
        other = np.roll(mono, int(0.0007 * SR))
        return np.stack([mono, mono * (1 - width) + other * width], -1)
    return np.stack([mono, mono], -1)


def sfx_unroll(seconds=1.5, reverse=False):
    """宣纸展开：带通噪声的“沙沙”声，加上纸张的细碎脆响。"""
    n = int(seconds * SR)
    t = np.linspace(0, 1, n, dtype=np.float32)
    env = np.clip(np.sin(np.pi * t), 0, 1) ** 0.8 * (1 - 0.6 * t)
    swish = bandnoise(seconds, 800, 6000, 1) * env * 0.5
    crackle = np.zeros(n, np.float32)
    r = rng(2)
    for at in r.uniform(0, seconds * 0.9, 40):
        i = int(at * SR)
        k = min(n - i, int(0.004 * SR))
        crackle[i:i + k] += r.uniform(0.2, 0.6) * r.standard_normal(k) * np.exp(-np.arange(k) / (0.001 * SR))
    mono = (swish + crackle * 0.5) * 0.6
    if reverse:
        mono = mono[::-1].copy()
    return stereo(mono, 0.4)


def sfx_thud(freq=70, seconds=0.35, level=0.7):
    t = np.arange(int(seconds * SR)) / SR
    body = np.sin(2 * np.pi * freq * t * (1 - 0.3 * t)) * np.exp(-t * 14)
    click = bandnoise(seconds, 200, 2500, 5) * np.exp(-t * 60) * 0.3
    return stereo((body + click).astype(np.float32) * level)


def sfx_drop():
    """墨滴落纸：短促的水滴声，音高下滑。"""
    seconds = 0.5
    t = np.arange(int(seconds * SR)) / SR
    pitch = 1150 * np.exp(-t * 9) + 520
    phase = 2 * np.pi * np.cumsum(pitch) / SR
    tone = np.sin(phase) * np.exp(-t * 11)
    splash = bandnoise(seconds, 1500, 7000, 9) * np.exp(-t * 40) * 0.25
    return stereo((tone * 0.6 + splash).astype(np.float32) * 0.8)


def sfx_seal():
    """钤印：一声闷实的按压。"""
    body = sfx_thud(95, 0.4, 0.8)
    press = sfx_thud(180, 0.15, 0.25)
    body[:len(press)] += press
    return body


# ---------------------------------------------------------------- 混音

def build():
    total = total_duration()
    n = int(total * SR)
    voice = np.zeros((n, 2), np.float32)
    music = np.zeros((n, 2), np.float32)
    fx = np.zeros((n, 2), np.float32)
    starts = segment_starts()

    vo = TL["audio"]["voice"]
    for line in vo["lines"]:
        clip = decode(ROOT / vo["file"], line["from"], line["to"] - line["from"])
        place(voice, clip, line["at"], vo.get("gainDb", 0), 0.02, 0.08)

    mu = TL["audio"]["music"]
    place(music, decode(ROOT / mu["file"], mu.get("from", 0), total - mu.get("at", 0)), mu.get("at", 0), mu.get("gainDb", -6), 0.5, mu.get("fadeOut", 2.0))

    for seg in TL["segments"]:
        src, sfx = seg["src"], seg.get("sfx")
        if "clip" in src and sfx:
            tempo = src.get("speed", 1.0)
            length = seg["dur"] + sfx.get("tail", 0.6)
            place(fx, decode(ROOT / src["clip"], src.get("start", 0.0), length, tempo), starts[seg["id"]], sfx.get("gainDb", -8), 0.3, 0.5)
    for cue in TL["audio"].get("sfx", []):
        clip = {"unroll": lambda: sfx_unroll(), "rollup": lambda: sfx_unroll(1.4, True), "thud": lambda: sfx_thud(),
                "drop": sfx_drop, "seal": sfx_seal}[cue["kind"]]()
        place(fx, clip, cue["at"], cue.get("gainDb", -6))

    # 配乐闪避：旁白响时压低配乐（包络平滑，避免抽吸感）
    level = np.abs(voice).max(1)
    win = int(0.05 * SR)
    level = np.convolve(level, np.ones(win) / win, "same")
    speaking = (level > 0.02).astype(np.float32)
    smooth_len = int(0.35 * SR)
    speaking = np.convolve(speaking, np.ones(smooth_len) / smooth_len, "same")
    duck = 1 - mu.get("duck", 0.45) * np.clip(speaking * 1.5, 0, 1)
    mix = voice + music * duck[:, None] + fx
    path = OUT / "audio-premaster.wav"
    write_wav(path, mix)
    # 响度标准化到 -16 LUFS，真峰值 -1.5 dBTP
    final = OUT / "audio.wav"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(path), "-af", "loudnorm=I=-16:TP=-1.5:LRA=11", "-ar", str(SR), str(final)], check=True)
    print(f"→ {final.relative_to(ROOT)}  ({total:.2f}s)")
    return final


def write_wav(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(data, -1, 1)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2", "-i", "-", str(path)], input=pcm.astype(np.float32).tobytes(), check=True)


def mux(audio):
    video = OUT / "video-silent.mp4"
    target = OUT / "竖卷拱宸.mp4"
    total = total_duration()
    budget_bits = 18.5 * 8 * 1024 * 1024  # 目标 ≤18.5MB，留余量给 20MB 上限
    audio_kbps = 160
    video_kbps = int(budget_bits / total / 1000 - audio_kbps)
    common = ["-c:v", "libx264", "-preset", "slow", "-profile:v", "high", "-pix_fmt", "yuv420p", "-b:v", f"{video_kbps}k",
              "-maxrate", f"{int(video_kbps * 1.6)}k", "-bufsize", f"{video_kbps * 3}k"]
    log = OUT / "x264-2pass"
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), *common, "-pass", "1", "-passlogfile", str(log), "-an", "-f", "mp4", "/dev/null"], check=True)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(video), "-i", str(audio), *common, "-pass", "2", "-passlogfile", str(log),
                    "-c:a", "aac", "-b:a", f"{audio_kbps}k", "-movflags", "+faststart", "-shortest", str(target)], check=True)
    size = target.stat().st_size / 1024 / 1024
    print(f"→ {target.relative_to(ROOT)}  {size:.1f}MB  (video {video_kbps}kbps)")


if __name__ == "__main__":
    wav = build()
    if "--mux" in sys.argv:
        mux(wav)
