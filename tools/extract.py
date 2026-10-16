#!/usr/bin/env python3
"""Footage → JPEG frame sequence + _clip.json for assets/templates/shared/clips.js (ffmpeg stand-in for extract.swift).

  extract.py SRC OUT_DIR [--fps 60] [--blend 2] [--q 3] [--width 1920]

Frames are written at the source's native fps by default (Seedance 2.5 delivers 60 fps), so the page can play them
at any rate, including slow motion. --blend N averages N neighbouring source frames (a soft shutter) before writing.
"""
import json, os, subprocess, sys


def main():
    src, out = sys.argv[1], sys.argv[2]
    args = sys.argv[3:]
    def opt(name, default):
        return args[args.index(name) + 1] if name in args else default
    blend, q, width = int(opt("--blend", "1")), opt("--q", "3"), opt("--width", "1920")
    probe = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                       "stream=r_frame_rate,width,height:format=duration", "-of", "json", src],
                                      capture_output=True, text=True).stdout)
    num, den = map(int, probe["streams"][0]["r_frame_rate"].split("/"))
    src_fps = num / den
    fps = float(opt("--fps", str(src_fps)))
    os.makedirs(out, exist_ok=True)
    for f in os.listdir(out):
        if f.startswith("f_") or f == "_clip.json":
            os.remove(os.path.join(out, f))
    vf = []
    if blend > 1:
        vf.append(f"tmix=frames={blend}")
    if abs(fps - src_fps) > 1e-3:
        vf.append(f"fps={fps}")
    vf.append(f"scale={width}:-2:flags=lanczos")
    subprocess.run(["ffmpeg", "-loglevel", "error", "-y", "-i", src, "-vf", ",".join(vf), "-q:v", q, "-start_number", "0",
                    os.path.join(out, "f_%04d.jpg")], check=True)
    n = len([f for f in os.listdir(out) if f.startswith("f_")])
    info = {"frames": n, "fps": fps, "duration": n / fps, "srcFps": src_fps, "w": probe["streams"][0]["width"],
            "h": probe["streams"][0]["height"], "first": 0, "pattern": "f_%04d.jpg", "source": os.path.basename(src)}
    json.dump(info, open(os.path.join(out, "_clip.json"), "w"))
    print(f"{src} → {out}: {n} frames @ {fps:g} fps")


if __name__ == "__main__":
    main()
