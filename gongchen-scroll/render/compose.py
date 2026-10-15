#!/usr/bin/env python3
"""《竖卷·拱宸》合成器：按 timeline.json 逐帧合成画面，经 ffmpeg 编码。

  python3 render/compose.py                       整片 → out/video-silent.mp4（4 进程并行）
  python3 render/compose.py --shots 3.5,12,40     导出静帧到 out/shots/
  python3 render/compose.py --from 0 --to 10      只渲染一段 → out/part-0-10.mp4

画面一律以“宣纸 + 墨”的方式合成：墨色用乘法叠在纸上，文字也按墨迹逐字显现。
"""
import json
import subprocess
import sys
from functools import lru_cache
from multiprocessing import Pool
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out"
CACHE = OUT / "cache"
TL = json.loads((ROOT / "timeline.json").read_text("utf8"))
W, H, FPS = TL["width"], TL["height"], TL["fps"]

PAPER_RGB = np.array([235, 231, 220], np.float32) / 255  # 取自主视觉 A2 的纸色
INK_RGB = np.array([28, 26, 23], np.float32) / 255
CINNABAR_RGB = np.array([181, 51, 46], np.float32) / 255
BACKDROP_RGB = np.array([38, 34, 31], np.float32) / 255
FONTS = {
    "serif500": ROOT / "fonts" / "NotoSerifSC-500.ttf",
    "serif600": ROOT / "fonts" / "NotoSerifSC-600.ttf",
    "serif900": ROOT / "fonts" / "NotoSerifSC-900.ttf",
    "brush": ROOT / "fonts" / "MaShanZheng-400.ttf",
}
YY, XX = np.mgrid[0:H, 0:W].astype(np.float32)


# ---------------------------------------------------------------- 基础工具

def smooth(x):
    x = np.clip(x, 0.0, 1.0)
    return x * x * (3 - 2 * x)


def ease_out(x):
    x = min(max(x, 0.0), 1.0)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = min(max(x, 0.0), 1.0)
    return 4 * x ** 3 if x < 0.5 else 1 - (-2 * x + 2) ** 3 / 2


def color(name):
    if isinstance(name, str) and name.startswith("#"):
        return np.array([int(name[i:i + 2], 16) for i in (1, 3, 5)], np.float32) / 255
    return {"ink": INK_RGB, "paper": PAPER_RGB, "cinnabar": CINNABAR_RGB, "grey": np.array([0.36, 0.34, 0.31], np.float32)}[name]


def noise(h, w, sigma, seed):
    """平滑噪声，归一到 0..1（按排名均匀化，阈值动画更均匀）。"""
    rng = np.random.default_rng(seed)
    small = rng.standard_normal((max(2, int(h / sigma * 4)), max(2, int(w / sigma * 4)))).astype(np.float32)
    small = cv2.GaussianBlur(small, (0, 0), 1.2)
    field = cv2.resize(small, (w, h), interpolation=cv2.INTER_CUBIC)
    ranks = field.ravel().argsort().argsort().astype(np.float32)
    return (ranks / ranks.size).reshape(h, w)


@lru_cache(None)
def noise_cached(sigma, seed):
    path = CACHE / f"noise-{sigma}-{seed}.npy"
    if path.exists():
        return np.load(path)
    CACHE.mkdir(parents=True, exist_ok=True)
    field = noise(H, W, sigma, seed)
    np.save(path, field)
    return field


@lru_cache(None)
def paper():
    path = CACHE / "paper.npy"
    if path.exists():
        return np.load(path)
    rng = np.random.default_rng(7)
    low = cv2.resize(cv2.GaussianBlur(rng.standard_normal((H // 8, W // 8)).astype(np.float32), (0, 0), 6), (W, H), interpolation=cv2.INTER_CUBIC)
    mid = cv2.resize(cv2.GaussianBlur(rng.standard_normal((H // 2, W // 2)).astype(np.float32), (0, 0), 2), (W, H), interpolation=cv2.INTER_CUBIC)
    grain = rng.standard_normal((H, W)).astype(np.float32)
    lum = 1 + 0.016 * low / (low.std() + 1e-6) + 0.007 * mid / (mid.std() + 1e-6) + 0.005 * grain
    fibers = np.zeros((H, W), np.float32)
    for _ in range(W * H // 2600):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        angle, length = rng.uniform(0, np.pi), rng.uniform(8, 42)
        cv2.line(fibers, (int(x), int(y)), (int(x + length * np.cos(angle)), int(y + length * np.sin(angle))), float(rng.uniform(0.3, 1)), 1, cv2.LINE_AA)
    lum -= 0.022 * cv2.GaussianBlur(fibers, (0, 0), 0.6)
    img = np.clip(lum[..., None] * PAPER_RGB, 0, 1).astype(np.float32)
    CACHE.mkdir(parents=True, exist_ok=True)
    np.save(path, img)
    return img


def ink_on(base, alpha, rgb):
    """把颜色按 alpha 叠到底图上（alpha: HxW 0..1）。"""
    a = alpha[..., None]
    return base * (1 - a) + rgb * a


def multiply(base, layer, amount=1.0):
    return base * (1 - amount + amount * layer)


# ---------------------------------------------------------------- 画面来源

@lru_cache(None)
def load_image(rel):
    img = cv2.imread(str(ROOT / rel), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(rel)
    return cv2.cvtColor(img, cv2.COLOR_BGR2RGB).astype(np.float32) / 255


def cover_affine(sw, sh, zoom, cx, cy):
    """源图按 cover 方式铺满画面后再放大 zoom 倍，(cx, cy) 为画面中心对应的源图相对坐标。"""
    scale = max(W / sw, H / sh) * zoom
    tx = W / 2 - cx * sw * scale
    ty = H / 2 - cy * sh * scale
    # 限制平移，避免露边
    tx = min(0, max(W - sw * scale, tx))
    ty = min(0, max(H - sh * scale, ty))
    return np.array([[scale, 0, tx], [0, scale, ty]], np.float32)


def kenburns(src, u, kb):
    kb = kb or {}
    z = kb.get("z0", 1.0) + (kb.get("z1", kb.get("z0", 1.0)) - kb.get("z0", 1.0)) * u
    cx = kb.get("cx0", 0.5) + (kb.get("cx1", kb.get("cx0", 0.5)) - kb.get("cx0", 0.5)) * u
    cy = kb.get("cy0", 0.5) + (kb.get("cy1", kb.get("cy0", 0.5)) - kb.get("cy0", 0.5)) * u
    m = cover_affine(src.shape[1], src.shape[0], z, cx, cy)
    return cv2.warpAffine(src, m, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


class ClipReader:
    """顺序解码视频帧（按需重启），帧已按 cover 缩放到画面尺寸的 1.1 倍以便推拉。"""

    def __init__(self, rel, speed=1.0, start=0.0):
        self.rel, self.speed, self.start = rel, speed, start
        self.sw, self.sh = int(W * 1.1) // 2 * 2, int(H * 1.1) // 2 * 2
        self.proc, self.index, self.frame = None, -1, None

    def _open(self):
        if self.proc:
            self.proc.kill()
        vf = f"setpts=(PTS-STARTPTS)/{self.speed},fps={FPS},scale={self.sw}:{self.sh}:force_original_aspect_ratio=increase,crop={self.sw}:{self.sh}"
        self.proc = subprocess.Popen(["ffmpeg", "-v", "error", "-ss", str(self.start), "-i", str(ROOT / self.rel), "-vf", vf,
                                      "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
        self.index, self.frame = -1, None

    def get(self, index):
        if self.proc is None or index < self.index:
            self._open()
        size = self.sw * self.sh * 3
        while self.index < index:
            raw = self.proc.stdout.read(size)
            if len(raw) < size:  # 片尾：停在最后一帧
                break
            self.frame = np.frombuffer(raw, np.uint8).reshape(self.sh, self.sw, 3)
            self.index += 1
        return self.frame.astype(np.float32) / 255


_readers = {}


def clip_frame(spec, t):
    key = (spec["clip"], spec.get("speed", 1.0), spec.get("start", 0.0))
    reader = _readers.setdefault(key, ClipReader(*key))
    return reader.get(max(0, int(round(t * FPS))))


@lru_cache(None)
def text_image(text, font, size, vertical, spacing, fill_rgba=(255, 255, 255, 255)):
    """白色文字的 alpha 图（返回 HxW float 0..1 及每个字的包围盒）。"""
    face = ImageFont.truetype(str(FONTS[font]), size)
    chars = list(text)
    if vertical:
        step = int(size * spacing)
        canvas = Image.new("L", (int(size * 1.6), step * len(chars) + size))
        draw = ImageDraw.Draw(canvas)
        boxes = []
        for i, ch in enumerate(chars):
            y = int(size * 0.3) + i * step
            draw.text((canvas.width / 2, y + size / 2), ch, font=face, fill=255, anchor="mm")
            boxes.append((0, y - size * 0.1, canvas.width, y + size * 1.1))
    else:
        width = int(face.getlength(text)) + size
        canvas = Image.new("L", (width, int(size * 1.8)))
        draw = ImageDraw.Draw(canvas)
        draw.text((size / 2, canvas.height / 2), text, font=face, fill=255, anchor="lm")
        boxes, x = [], size / 2
        for ch in chars:
            adv = face.getlength(ch)
            boxes.append((x, 0, x + adv, canvas.height))
            x += adv
    alpha = np.asarray(canvas, np.float32) / 255
    return alpha, tuple(boxes)


def card(text):
    """实拍占位卡：宣纸上一行灰字。"""
    frame = paper().copy()
    alpha, _ = text_image(text, "serif500", 46, False, 1.0)
    return paste_alpha(frame, alpha, W / 2, H / 2, color("grey"), 1.0)


def paste_alpha(frame, alpha, cx, cy, rgb, opacity):
    h, w = alpha.shape
    x0, y0 = int(round(cx - w / 2)), int(round(cy - h / 2))
    fx0, fy0, fx1, fy1 = max(0, x0), max(0, y0), min(W, x0 + w), min(H, y0 + h)
    if fx0 >= fx1 or fy0 >= fy1:
        return frame
    a = alpha[fy0 - y0:fy1 - y0, fx0 - x0:fx1 - x0] * opacity
    frame[fy0:fy1, fx0:fx1] = ink_on(frame[fy0:fy1, fx0:fx1], a, rgb)
    return frame


# ---------------------------------------------------------------- 程序化镜头

@lru_cache(None)
def brush_stroke(x, y0, y1, width, seed=3):
    """一笔竖向墨线（含飞白），返回整幅 alpha 与沿笔画的进度场。"""
    rng = np.random.default_rng(seed)
    alpha = np.zeros((H, W), np.float32)
    length = y1 - y0
    bristles = 90
    sway = np.cumsum(rng.normal(0, 0.35, 200))  # 整笔轻微的手势摆动
    sway = cv2.GaussianBlur(sway.reshape(1, -1).astype(np.float32), (0, 0), 6).ravel() * 3
    for b in range(bristles):
        side = b / (bristles - 1) - 0.5
        density = rng.uniform(0.5, 1.0) * (1 - 0.35 * abs(side) * 2)
        dry_from = rng.uniform(0.35, 0.95) if abs(side) > 0.18 or rng.random() < 0.3 else 2.0
        layer = np.zeros((H, W), np.float32)
        pts, segment = [], []
        for i, s in enumerate(np.linspace(0, 1, 200)):
            taper = 1.0 - 0.5 * s ** 1.4  # 起笔重、收笔轻
            px = x + side * width * taper + sway[i] + 0.8 * np.sin(s * 31 + b)
            on = s < dry_from or rng.random() > (s - dry_from) * 2.2  # 飞白：枯笔处断续
            if on:
                segment.append((px, y0 + s * length))
            elif segment:
                pts.append(segment)
                segment = []
        if segment:
            pts.append(segment)
        for seg_pts in pts:
            if len(seg_pts) > 1:
                cv2.polylines(layer, [np.array(seg_pts, np.int32)], False, density, 2, cv2.LINE_AA)
        alpha = np.maximum(alpha, layer)
    alpha = cv2.GaussianBlur(alpha, (0, 0), 0.9)
    grain = noise_cached(3, 11)
    alpha *= 0.78 + 0.22 * grain
    progress = np.clip((YY - y0) / max(1, length), 0, 1)
    return alpha, progress


def proc_open(seg, t):
    """开卷：立轴自上而下展开，一滴墨落下，拉成一道竖线（运河）。"""
    p = seg["src"]
    x, hit = p["lineX"], p["hitY"]
    frame = np.empty((H, W, 3), np.float32)
    frame[:] = BACKDROP_RGB
    # 1) 展开：纸面从上往下露出，卷轴在纸的下沿
    unroll = ease_out(t / 1.5)
    edge = int(unroll * (H + 90))
    page = paper()
    if edge > 0:
        frame[:min(edge, H)] = page[:min(edge, H)]
        roller_top = edge - 8
        for i in range(46):  # 卷轴：深木色圆柱，带高光
            y = roller_top + i
            if 0 <= y < H:
                shade = 0.55 + 0.45 * np.sin(np.pi * i / 45) ** 0.7
                frame[y] = np.array([0.30, 0.21, 0.15], np.float32) * shade + 0.08 * (i == 12)
        for i in range(1, 18):  # 卷轴投在纸上的阴影
            y = roller_top - i
            if 0 <= y < H:
                frame[y] *= 1 - 0.22 * (1 - i / 18)
    # 2) 墨滴落下
    if 1.7 <= t < 2.2:
        k = (t - 1.7) / 0.5
        y = -40 + (hit + 40) * k * k
        stretch = 1 + 2.5 * k
        drop = np.zeros((H, W), np.float32)
        cv2.ellipse(drop, (x, int(y)), (9, int(9 * stretch)), 0, 0, 360, 1.0, -1, cv2.LINE_AA)
        frame = ink_on(frame, cv2.GaussianBlur(drop, (0, 0), 1.2), INK_RGB)
    # 3) 墨晕开，并顺势向下拉成长线
    if t >= 2.2:
        bloom_r = 46 * ease_out((t - 2.2) / 0.5)
        dist = np.sqrt((XX - x) ** 2 + (YY - hit) ** 2)
        edge_noise = noise_cached(12, 21)
        blot = smooth((bloom_r * (0.8 + 0.4 * edge_noise) - dist) / 6)
        alpha, progress = brush_stroke(x, hit, H + 40, 24)
        head = ease_in_out((t - 2.35) / 1.25)
        reveal = smooth((head - progress) * 40) if t >= 2.35 else np.zeros_like(progress)
        bleed = 1 + 0.6 * smooth((t - 2.2) / 1.5)
        ink = np.maximum(blot * 0.95, alpha * reveal)
        ink = np.maximum(ink, cv2.GaussianBlur(ink, (0, 0), 3 * bleed) * 0.35)
        frame = ink_on(frame, ink, INK_RGB)
    return frame


def proc_name(seg, t):
    """“拱宸”释名：主视觉淡去，朱砂沿三孔描线。"""
    p = seg["src"]
    src = load_image(p["image"])
    kb = p.get("kb", {})
    base = kenburns(src, 0, kb)
    fade = 0.4 + 0.6 * (1 - smooth(t / 0.9))
    frame = paper() * (1 - fade) + base * fade
    # 拱圈坐标是在 1 倍铺满时量的，按当前推镜换算到画面坐标
    m0 = cover_affine(src.shape[1], src.shape[0], 1.0, kb.get("cx0", 0.5), kb.get("cy0", 0.5))
    m1 = cover_affine(src.shape[1], src.shape[0], kb.get("z0", 1.0), kb.get("cx0", 0.5), kb.get("cy0", 0.5))
    k = m1[0, 0] / m0[0, 0]
    to_x = lambda x: (x - m0[0, 2]) * k + m1[0, 2]
    to_y = lambda y: (y - m0[1, 2]) * k + m1[1, 2]
    arches = [(to_x(cx), to_y(top), to_y(spring), half * k, start) for cx, top, spring, half, start in p["arches"]]
    return ink_on(frame, arch_layer(arches, t) * 0.72, CINNABAR_RGB)


def arch_layer(arches, t, duration=1.2):
    """朱砂沿拱圈描线：每孔从左拱脚画到右拱脚，第一孔（中孔）最粗。"""
    layer = np.zeros((H, W), np.float32)
    for i, (cx, top, spring, half, start) in enumerate(arches):
        u = ease_in_out((t - start) / duration)
        if u <= 0:
            continue
        angles = np.linspace(np.pi, np.pi + np.pi * u, max(2, int(80 * u)))
        ry = spring - top
        pts = np.stack([cx + half * np.cos(angles), spring + ry * np.sin(angles)], -1)
        cv2.polylines(layer, [pts.astype(np.int32)], False, 1.0, 9 if i == 0 else 6, cv2.LINE_AA)
    layer = cv2.GaussianBlur(layer, (0, 0), 1.3) * (0.85 + 0.15 * noise_cached(3, 5))
    return np.clip(layer, 0, 1)


def arches_overlay(frame, item, t):
    """叠加层版本的拱圈描线（时间用整片绝对时间），用于片尾呼应释名一镜。"""
    if not (item["start"] <= t < item["end"]):
        return frame
    fade = 1 - smooth((t - (item["end"] - 0.6)) / 0.6)
    return ink_on(frame, arch_layer(item["arches"], t) * item.get("opacity", 0.72) * fade, CINNABAR_RGB)


PROCS = {"open": proc_open, "name": proc_name}


def source_frame(seg, t):
    src = seg["src"]
    u = min(max(t / seg["dur"], 0.0), 1.0)
    if "proc" in src:
        return PROCS[src["proc"]](seg, t)
    if "still" in src:
        return kenburns(load_image(src["still"]), u, src.get("kb"))
    if "clip" in src:
        return kenburns(clip_frame(src, t), u, src.get("kb"))
    if "card" in src:
        return card(src["card"])
    raise ValueError(src)


# ---------------------------------------------------------------- 转场

def transition(kind, a, b, u, params):
    if kind == "fade":
        k = smooth(u)
        return a * (1 - k) + b * k
    if kind == "ink":  # 墨晕：从一点向外洇开，边缘带纸纤维般的毛刺
        cx, cy = params.get("x", W / 2), params.get("y", H / 2)
        dist = np.sqrt((XX - cx) ** 2 + (YY - cy) ** 2) / np.hypot(W, H)
        field = 0.85 * dist + 0.12 * noise_cached(90, 31) + 0.03 * noise_cached(26, 41)
        m = smooth((ease_in_out(u) * 0.95 - field) / 0.035)
        m = cv2.GaussianBlur(m, (0, 0), 2.5)[..., None]  # 边缘像墨在纸上洇开，柔而不碎
        return a * (1 - m) + b * m
    if kind == "inkline":  # 自墨线向两侧晕开，露出画面
        x = params.get("x", W / 2)
        field = 0.72 * np.abs(XX - x) / W + 0.18 * noise_cached(26, 41) + 0.10 * noise_cached(90, 31)
        m = smooth((u * 0.95 - field) / 0.14)[..., None]
        return a * (1 - m) + b * m
    if kind == "scroll":  # 长卷继续下展：上一幅上移，下一幅从下方接上，接缝处纸色柔化
        gap = params.get("gap", 360)  # 两幅画之间留出的宣纸
        k = ease_in_out(u)
        travel = H + gap
        shift = k * travel
        rows = np.arange(H, dtype=np.float32)
        a_rows = rows + shift  # a 中的行号
        b_rows = rows - (H + gap - shift)  # b 中的行号
        wobble = (noise_cached(40, 51) - 0.5) * 140
        fade = params.get("fade", 300)
        wa = smooth((H - a_rows[:, None] - wobble) / fade)  # a 底边淡入纸
        wb = smooth((b_rows[:, None] - wobble) / fade)  # b 顶边淡入纸
        ai = np.clip(a_rows, 0, H - 1).astype(np.int32)
        bi = np.clip(b_rows, 0, H - 1).astype(np.int32)
        pad = paper()
        out = pad * (1 - wa - wb)[..., None] + a[ai] * wa[..., None] + b[bi] * wb[..., None]
        return out
    return b  # cut


# ---------------------------------------------------------------- 叠加层（文字、印章、字幕）

def text_overlay(frame, item, t):
    if not (item["start"] <= t < item["end"]):
        return frame
    alpha, boxes = text_image(item["text"], item.get("font", "serif600"), item["size"], item.get("vertical", False), item.get("spacing", 1.15))
    local = t - item["start"]
    reveal_dur = item.get("reveal", 1.2)
    out_fade = 1 - smooth((t - (item["end"] - item.get("fadeOut", 0.6))) / item.get("fadeOut", 0.6))
    vertical = item.get("vertical", False)
    if item.get("anim", "ink") == "ink":
        n = len(boxes)
        mask = np.zeros_like(alpha)
        for i, (x0, y0, x1, y1) in enumerate(boxes):
            k = smooth((local - reveal_dur * i / max(1, n)) / max(0.25, reveal_dur / max(1, n) * 1.6))
            if k <= 0:
                continue
            ys, xs = slice(max(0, int(y0)), int(y1)), slice(max(0, int(x0)), int(x1))
            mask[ys, xs] = k
        soft = cv2.GaussianBlur(alpha, (0, 0), max(1.0, item["size"] / 30))
        a = alpha * mask + soft * mask * (1 - mask) * 1.2
    else:
        a = alpha * smooth(local / reveal_dur)
    rgb = color(item.get("color", "ink"))
    return paste_alpha(frame, np.clip(a, 0, 1), item["x"], item["y"], rgb, out_fade * item.get("opacity", 1.0))


@lru_cache(None)
def seal_image(text, size):
    """朱文方印：方框 + 字，边缘做出钤印的斑驳。"""
    s = size
    img = Image.new("L", (s, s), 0)
    draw = ImageDraw.Draw(img)
    border = max(3, s // 22)
    draw.rectangle([border, border, s - border, s - border], fill=255)
    face = ImageFont.truetype(str(FONTS["serif900"]), int(s * (0.40 if len(text) == 4 else 0.62)))
    if len(text) == 4:  # 右上起竖读：右列前两字，左列后两字
        spots = [(0.72, 0.30), (0.72, 0.72), (0.28, 0.30), (0.28, 0.72)]
    else:
        spots = [(0.5, 0.30 + 0.42 * i) for i in range(len(text))] if len(text) == 2 else [(0.5, 0.5)]
    for ch, (fx, fy) in zip(text, spots):
        draw.text((fx * s, fy * s), ch, font=face, fill=0, anchor="mm")  # 白文：字处留白
    alpha = np.asarray(img, np.float32) / 255
    rng = np.random.default_rng(len(text) * 97 + s)
    speckle = cv2.GaussianBlur(rng.random((s, s)).astype(np.float32), (0, 0), 1.0)
    alpha *= smooth((speckle - 0.18) / 0.25)
    return alpha


def seal_overlay(frame, item, t):
    if not (item["start"] <= t < item["end"]):
        return frame
    k = smooth((t - item["start"]) / 0.25)
    scale = 1.25 - 0.25 * k  # 钤印：略大落下
    alpha = seal_image(item["text"], item["size"])
    if scale != 1:
        alpha = cv2.resize(alpha, None, fx=scale, fy=scale, interpolation=cv2.INTER_LINEAR)
    fade = 1 - smooth((t - (item["end"] - 0.6)) / 0.6)
    return paste_alpha(frame, alpha, item["x"], item["y"], CINNABAR_RGB, 0.92 * k * fade)


def subtitle_overlay(frame, sub, t):
    if not (sub["start"] <= t < sub["end"]):
        return frame
    k = smooth((t - sub["start"]) / 0.25) * (1 - smooth((t - sub["end"] + 0.25) / 0.25))
    alpha, _ = text_image(sub["text"], "serif600", 54, False, 1.0)
    y = TL.get("subtitleY", 1600)
    h, w = alpha.shape
    region = frame[max(0, y - h // 2):y + h // 2, max(0, W // 2 - w // 2):W // 2 + w // 2]
    dark_bg = region.mean() < 0.5
    text_rgb, halo_rgb = (PAPER_RGB, INK_RGB) if dark_bg else (INK_RGB, PAPER_RGB)
    frame = paste_alpha(frame, subtitle_mist(w, h), W / 2, y, halo_rgb, 0.5 * k)  # 字幕下一抹淡雾，压住繁复画面
    halo = np.clip(cv2.GaussianBlur(cv2.dilate(alpha, np.ones((5, 5), np.uint8)), (0, 0), 7) * 1.6, 0, 1)
    frame = paste_alpha(frame, halo, W / 2, y, halo_rgb, 0.7 * k)
    return paste_alpha(frame, alpha, W / 2, y, text_rgb, k)


@lru_cache(None)
def subtitle_mist(w, h):
    """横向柔和的椭圆雾带，宽于字幕两侧，边缘完全化开。"""
    mw, mh = w + 240, h + 90
    yy, xx = np.mgrid[0:mh, 0:mw].astype(np.float32)
    d = np.sqrt(((xx - mw / 2) / (mw / 2)) ** 2 + ((yy - mh / 2) / (mh / 2)) ** 2)
    return smooth((1 - d) / 0.6)


def rollup(frame, t, start, dur):
    """收卷：纸面自下而上卷起，露出底色。"""
    u = ease_in_out((t - start) / dur)
    if u <= 0:
        return frame
    edge = int(H - u * (H + 60))
    out = frame.copy()
    if edge < H:
        out[max(0, edge):] = BACKDROP_RGB
    for i in range(46):
        y = edge + i - 4
        if 0 <= y < H:
            shade = 0.55 + 0.45 * np.sin(np.pi * i / 45) ** 0.7
            out[y] = np.array([0.30, 0.21, 0.15], np.float32) * shade
    return out


# ---------------------------------------------------------------- 时间轴

def layout():
    segs, t = [], 0.0
    for seg in TL["segments"]:
        seg = dict(seg, start=t)
        segs.append(seg)
        t += seg["dur"]
    return segs, t


SEGMENTS, TOTAL = layout()


def render_frame(t):
    index = max(i for i, s in enumerate(SEGMENTS) if s["start"] <= t + 1e-9)
    seg = SEGMENTS[index]
    local = t - seg["start"]
    frame = source_frame(seg, local)
    trans = seg.get("in")
    if trans and index > 0 and trans["type"] != "cut" and local < trans["dur"]:
        prev = SEGMENTS[index - 1]
        frame = transition(trans["type"], source_frame(prev, t - prev["start"]), frame, local / trans["dur"], trans)
    post = seg.get("post", {})
    if "paper" in post:  # 实拍叠宣纸纹理、略降饱和
        grey = frame.mean(-1, keepdims=True)
        frame = frame * (1 - post.get("desat", 0.2)) + grey * post.get("desat", 0.2)
        frame = multiply(frame, paper() / PAPER_RGB.max(), post["paper"])
    for item in TL.get("overlays", []):
        kind = item.get("kind", "text")
        frame = {"seal": seal_overlay, "arches": arches_overlay, "text": text_overlay}[kind](frame, item, t)
    for sub in TL.get("subtitles", []):
        frame = subtitle_overlay(frame, sub, t)
    if "rollup" in TL:
        frame = rollup(frame, t, TL["rollup"]["start"], TL["rollup"]["dur"])
    return np.clip(frame * 255 + 0.5, 0, 255).astype(np.uint8)


def encode(t0, t1, path):
    path.parent.mkdir(parents=True, exist_ok=True)
    enc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                            "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", str(path)], stdin=subprocess.PIPE)
    for i in range(int(round(t0 * FPS)), int(round(t1 * FPS))):
        enc.stdin.write(render_frame(i / FPS).tobytes())
    enc.stdin.close()
    enc.wait()
    return path


def _encode_part(args):
    return encode(*args)


def main():
    arg = lambda name, default=None: sys.argv[sys.argv.index(name) + 1] if name in sys.argv else default
    paper()  # 先生成缓存，避免并行进程重复计算
    for sigma, seed in [(3, 11), (12, 21), (90, 31), (26, 41), (40, 51), (3, 5)]:
        noise_cached(sigma, seed)
    if arg("--shots"):
        shots = OUT / "shots"
        shots.mkdir(parents=True, exist_ok=True)
        for s in arg("--shots").split(","):
            t = float(s)
            Image.fromarray(render_frame(t)).save(shots / f"t{t:06.2f}.png")
            print("shot", t)
        return
    t0, t1 = float(arg("--from", 0)), float(arg("--to", TOTAL))
    workers = int(arg("--workers", 4))
    cuts = np.linspace(t0, t1, workers + 1)
    parts = [(round(a * FPS) / FPS, round(b * FPS) / FPS, OUT / "parts" / f"part-{i}.mp4") for i, (a, b) in enumerate(zip(cuts[:-1], cuts[1:]))]
    with Pool(workers) as pool:
        files = pool.map(_encode_part, parts)
    listing = OUT / "parts" / "list.txt"
    listing.write_text("".join(f"file '{f.resolve()}'\n" for f in files))
    target = OUT / ("video-silent.mp4" if (t0, t1) == (0, TOTAL) else f"part-{t0:g}-{t1:g}.mp4")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", str(listing), "-c", "copy", str(target)], check=True)
    print(f"→ {target.relative_to(ROOT)}  ({TOTAL:.2f}s timeline)")


if __name__ == "__main__":
    main()
