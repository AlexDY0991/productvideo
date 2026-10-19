#!/usr/bin/env python3
"""按场景分层渲染（剪辑工程用）：每个场景一段 plate-NN.mp4（三维画面）和 overlay-NN.mov（透明标注层）。

场景边界按帧对齐（round(秒 × 30)），和 build.py 的切分完全一致。
  python3 jianying/render_layers.py --out DIR [--from 0 --to 14] [--scenes 1-4] [--layers plate,overlay] [--workers 2]
--scenes 只渲染其中几个场景（编号从 1 开始，按 [from, to] 范围内的顺序），用于把整片拆成几批渲染。
"""
import argparse
import json
import os
import subprocess

FPS = 30
FILM = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--out", required=True)
    ap.add_argument("--from", dest="r0", type=float, default=0)
    ap.add_argument("--to", dest="r1", type=float, default=None)
    ap.add_argument("--scenes", default=None)
    ap.add_argument("--layers", default="plate,overlay")
    ap.add_argument("--workers", default="2")
    a = ap.parse_args()

    tl = json.load(open(os.path.join(FILM, "timeline.json"), encoding="utf-8"))
    r1 = a.r1 if a.r1 is not None else tl["duration"]
    f_r0, f_r1 = round(a.r0 * FPS), round(r1 * FPS)
    scenes = []
    for s in tl["scenes"]:
        f0, f1 = max(round(s["start"] * FPS), f_r0), min(round(s["end"] * FPS), f_r1)
        if f1 > f0:
            scenes.append((s["id"], f0, f1))
    pick = range(1, len(scenes) + 1)
    if a.scenes:
        lo, _, hi = a.scenes.partition("-")
        pick = range(int(lo), int(hi or lo) + 1)
    os.makedirs(a.out, exist_ok=True)
    for layer in a.layers.split(","):
        for i in pick:
            sid, f0, f1 = scenes[i - 1]
            print(f"{layer} {i:02d} {sid}: frames {f0}–{f1}", flush=True)
            subprocess.run(["node", os.path.join(FILM, "render", "render.mjs"), "--layer", layer, "--workers", a.workers,
                            "--from", repr(f0 / FPS), "--to", repr(f1 / FPS), "--out", a.out, "--name", f"{layer}-{i:02d}"], check=True)


if __name__ == "__main__":
    main()
