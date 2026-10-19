#!/usr/bin/env python3
"""把分层渲染的素材打包成剪映工程：素材包 + 剪映草稿 + Windows 安装脚本，最后压成 zip。

用法：
  python3 jianying/build.py --edit edit.json --render render_dir --out pkg_dir \
      --from 0 --to 14 --name DreamPro-Safety-ZH-Sample [--alpha-test] [--reference out/xxx.mp4]

render_dir 里是 render.mjs 分层渲染的结果，按场景编号：plate-01.mp4 / overlay-01.mov，plate-02.mp4 / overlay-02.mov……
编号顺序就是 [from, to] 范围内出现的场景顺序。

素材包里的文件名全部用英文，避免 Windows 解压、批处理和剪映路径里的中文编码问题；
剪映素材面板里显示的名字（material_name）用中文。
"""
import argparse
import json
import os
import shutil
import subprocess
import uuid
import zipfile

from PIL import Image
import pyJianYingDraft as jy
from pyJianYingDraft import TrackSpec, TrackType

FPS = 30
US = 1_000_000
W, H = 1920, 1080
ROOT_TOKEN = "__COOLFLY_ROOT__"        # 安装脚本把它换成素材包在用户电脑上的实际路径
HERE = os.path.dirname(os.path.abspath(__file__))
FILM = os.path.dirname(HERE)
SCENE_ZH = {"open": "开场", "motors": "冗余·动力", "battery": "冗余·电源", "fc": "冗余·控制",
            "active": "主动安全", "passive": "被动安全", "end": "结尾"}
# 剪映字号与网页像素的换算（1080p 画面）。按小样在剪映里的实际效果再校准。
PX_PER_SIZE = 8.0


def us(t):
    return int(round(t * US))


def frame_us(f):
    return int(round(f * US / FPS))


def rgb(css):
    r, g, b = [int(v) for v in css[css.index("(") + 1:css.index(")")].split(",")[:3]]
    return (r / 255, g / 255, b / 255)


def pos(cx, cy):
    """画面像素坐标（文字框中心）→ 剪映位移（半个画布为 1，向上为正）"""
    return jy.ClipSettings(transform_x=(cx - W / 2) / (W / 2), transform_y=(H / 2 - cy) / (H / 2))


def size(px):
    return round(px / PX_PER_SIZE, 2)


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-v", "error", "-y", *args], check=True)


def clip(a, b, r0, r1):
    """把 [a, b] 裁到 [r0, r1]，返回相对 r0 的起止；不相交返回 None"""
    a, b = max(a, r0), min(b, r1)
    return (a - r0, b - r0) if b - a > 1e-3 else None


def srt_time(t):
    ms = int(round(t * 1000))
    return f"{ms // 3600000:02d}:{ms // 60000 % 60:02d}:{ms // 1000 % 60:02d},{ms % 1000:03d}"


def full_frame_png(path, logo, box, fill=None):
    """整幅 1920×1080 的 PNG：剪映里铺满画布不用再调位置。box 为 None 时只填底色。"""
    img = Image.new("RGBA", (W, H), fill or (0, 0, 0, 0))
    if box:
        lg = Image.open(logo).convert("RGBA")
        w = round(lg.width * box["h"] / lg.height)
        img.alpha_composite(lg.resize((w, round(box["h"])), Image.LANCZOS), (round(box["x"]), round(box["y"])))
    img.save(path)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--edit", required=True)
    ap.add_argument("--render", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--from", dest="r0", type=float, default=0)
    ap.add_argument("--to", dest="r1", type=float, default=None)
    ap.add_argument("--name", required=True)
    ap.add_argument("--alpha-test", action="store_true")
    ap.add_argument("--reference", default=None)
    a = ap.parse_args()

    ed = json.load(open(a.edit, encoding="utf-8"))
    lay = ed["layout"]
    r0 = a.r0
    r1 = a.r1 if a.r1 is not None else ed["duration"]
    f_r0, f_r1 = round(r0 * FPS), round(r1 * FPS)

    pkg = os.path.abspath(a.out)
    if os.path.exists(pkg):
        shutil.rmtree(pkg)
    media = os.path.join(pkg, "media")
    dirs = {k: os.path.join(media, k) for k in ["plate", "overlay", "voice", "subtitles", "images"]}
    for d in dirs.values():
        os.makedirs(d)

    # ── 场景：三维画面 + 标注层（按帧对齐切分）──
    scenes = []
    for s in ed["scenes"]:
        f0, f1 = max(round(s["start"] * FPS), f_r0), min(round(s["end"] * FPS), f_r1)
        if f1 > f0:
            scenes.append({**s, "f0": f0 - f_r0, "f1": f1 - f_r0})
    for i, s in enumerate(scenes, 1):
        tag = f"{i:02d}-{s['id']}"
        s["plate"] = os.path.join(dirs["plate"], f"{tag}.mp4")
        s["overlay"] = os.path.join(dirs["overlay"], f"{tag}.mov")
        shutil.copy(os.path.join(a.render, f"plate-{i:02d}.mp4"), s["plate"])
        # 标注层转成 ProRes 4444（带 alpha，剪映和大多数剪辑软件都认）
        ffmpeg("-i", os.path.join(a.render, f"overlay-{i:02d}.mov"), "-c:v", "prores_ks", "-profile:v", "4444",
               "-pix_fmt", "yuva444p10le", "-alpha_bits", "16", "-vendor", "apl0", s["overlay"])

    # ── 配音：从整条配音里按句切出来（与时间轴完全一致）──
    voice = []
    for ln in ed["lines"]:
        c = clip(ln["start"], ln["end"], r0, r1)
        if not c:
            continue
        path = os.path.join(dirs["voice"], f"{ln['id']}.wav")
        ffmpeg("-i", os.path.join(FILM, "audio", "voice.wav"), "-ss", f"{r0 + c[0]:.3f}", "-to", f"{r0 + c[1]:.3f}",
               "-c:a", "pcm_s16le", path)
        voice.append({**ln, "path": path, "t0": c[0]})

    # ── 字幕 SRT ──
    srt_path = os.path.join(dirs["subtitles"], "subtitles-zh.srt")
    subs = [(clip(x["in"], x["out"], r0, r1), x["text"]) for x in ed["subs"]]
    subs = [(c, t) for c, t in subs if c]
    with open(srt_path, "w", encoding="utf-8") as f:
        for n, (c, t) in enumerate(subs, 1):
            f.write(f"{n}\n{srt_time(c[0])} --> {srt_time(c[1])}\n{t.replace('　', ' ')}\n\n")

    # ── 图片：角标 Logo、片尾 Logo、片尾黑底（都是整幅画布大小）──
    logo_src = os.path.join(FILM, "assets", "coolfly-logo-white.png")
    corner_png = os.path.join(dirs["images"], "corner-logo.png")
    end_logo_png = os.path.join(dirs["images"], "end-logo.png")
    black_png = os.path.join(dirs["images"], "end-black.png")
    full_frame_png(corner_png, logo_src, lay["logo"])
    full_frame_png(end_logo_png, logo_src, lay["endLogo"])
    full_frame_png(black_png, None, None, fill=(5, 5, 6, 255))

    # ── 剪映草稿 ──
    drafts = os.path.join(pkg, "draft")
    os.makedirs(drafts)
    script = jy.DraftFolder(drafts).create_draft(a.name, W, H, FPS, allow_replace=True)
    for kind, name in [(TrackType.video, "三维画面"), (TrackType.video, "标注层"), (TrackType.video, "角标Logo"),
                       (TrackType.video, "片尾黑底"), (TrackType.video, "片尾Logo"),
                       (TrackType.text, "标题"), (TrackType.text, "标题英文"),
                       (TrackType.text, "三层1"), (TrackType.text, "三层2"), (TrackType.text, "三层3"),
                       (TrackType.text, "角标文字"), (TrackType.text, "片尾标语"), (TrackType.text, "片尾网址"),
                       (TrackType.audio, "配音")]:
        script.append_track(TrackSpec(kind, name))

    for i, s in enumerate(scenes, 1):
        t0, t1 = frame_us(s["f0"]), frame_us(s["f1"])
        zh = SCENE_ZH.get(s["id"], s["id"])
        for track, path, label in [("三维画面", s["plate"], "画面"), ("标注层", s["overlay"], "标注")]:
            mat = jy.VideoMaterial(path, material_name=f"{i:02d} {zh} · {label}")
            script.add_segment(jy.VideoSegment(mat, jy.Timerange(t0, min(t1 - t0, mat.duration))), track)

    for v in voice:
        mat = jy.AudioMaterial(v["path"], material_name=f"配音 {v['id']} · {v['text'][:12]}")
        script.add_segment(jy.AudioSegment(mat, jy.Timerange(us(v["t0"]), mat.duration)), "配音")

    def text(track, content, t_in, t_out, *, px, color, cx, cy, align=0, fade_in=0.0, fade_out=0.0, shadow=False):
        c = clip(t_in, t_out, r0, r1)
        if not c:
            return
        seg = jy.TextSegment(content, jy.Timerange(us(c[0]), us(c[1] - c[0])),
                             style=jy.TextStyle(size=size(px), color=color, align=align),
                             clip_settings=pos(cx, cy),
                             shadow=jy.TextShadow(alpha=0.85, diffuse=12, distance=2) if shadow else None)
        # 入出场动画只在片段没被小样范围截断时加
        if fade_in and t_in >= r0:
            seg.add_animation(jy.TextIntro.渐显, us(fade_in))
        if fade_out and t_out <= r1:
            seg.add_animation(jy.TextOutro.渐隐, us(fade_out))
        script.add_segment(seg, track)

    def left_cx(el, content, key):
        """左对齐文字：按网页里测得的宽度（去掉字距）算出文字框中心"""
        w = lay["widths"].get(key, el["w"])
        spacing = float(el["spacing"].rstrip("px")) if el["spacing"] not in ("normal", "") else 0
        return el["x"] + (w - spacing * len(content)) / 2

    h1, en, sub = lay["h1"], lay["en"], lay["sub"]
    for t in ed["titles"]:
        text("标题", t["text"], t["in"], t["out"], px=h1["px"], color=rgb(h1["color"]),
             cx=left_cx(h1, t["text"], "h1:" + t["text"]), cy=h1["y"] + h1["h"] / 2, fade_in=t["fadeIn"], fade_out=t["fadeOut"])
        text("标题英文", t["en"], t["in"], t["out"], px=en["px"], color=rgb(en["color"]),
             cx=left_cx(en, t["en"], "en:" + t["en"]), cy=en["y"] + en["h"] / 2, fade_in=t["fadeIn"], fade_out=t["fadeOut"])
    for i, (l, row) in enumerate(zip(ed["layers"], lay["rows"]), 1):
        content = f"{l['num']}  {l['zh']}  {l['en']}"
        text(f"三层{i}", content, l["in"], l["out"], px=row["px"], color=rgb(row["color"]),
             cx=row["x"] + lay["widths"].get("row:" + l["num"], row["w"]) / 2, cy=row["y"] + row["h"] / 2,
             fade_in=l["fadeIn"], fade_out=l["fadeOut"])
    tr = lay["tr"]
    corner = ed["corner"]
    text("角标文字", tr["text"], corner["in"], corner["out"], px=tr["px"], color=rgb(tr["color"]),
         cx=tr["x"] + tr["w"] / 2, cy=tr["y"] + tr["h"] / 2, align=2, fade_out=corner["fadeOut"])
    c = clip(corner["in"], corner["out"], r0, r1)
    if c:
        mat = jy.VideoMaterial(corner_png, material_name="角标 Logo")
        seg = jy.VideoSegment(mat, jy.Timerange(us(c[0]), us(c[1] - c[0])))
        if corner["out"] <= r1:
            seg.add_animation(jy.OutroType.渐隐, us(corner["fadeOut"]))
        script.add_segment(seg, "角标Logo")

    end = ed["end"]
    c = clip(end["in"], end["out"], r0, r1)
    if c:
        for track, path, label in [("片尾黑底", black_png, "片尾黑底"), ("片尾Logo", end_logo_png, "片尾 Logo")]:
            seg = jy.VideoSegment(jy.VideoMaterial(path, material_name=label), jy.Timerange(us(c[0]), us(c[1] - c[0])))
            seg.add_animation(jy.IntroType.渐显, us(end["fadeIn"]))
            script.add_segment(seg, track)
        for track, el in [("片尾标语", lay["endTag"]), ("片尾网址", lay["endUrl"])]:
            text(track, el["text"], end["in"], end["out"], px=el["px"], color=rgb(el["color"]),
                 cx=el["x"] + el["w"] / 2, cy=el["y"] + el["h"] / 2, align=1, fade_in=end["fadeIn"])

    # 字幕：导入 SRT，样式参照网页字幕（居中、白字、阴影）
    if subs:
        ref = jy.TextSegment("字幕", jy.Timerange(0, US), style=jy.TextStyle(size=size(sub["px"]), color=rgb(sub["color"]), align=1),
                             shadow=jy.TextShadow(alpha=0.9, diffuse=15, distance=2))
        script.import_srt(srt_path, "字幕", style_reference=ref, clip_settings=pos(W / 2, sub["y"] + sub["h"] / 2))
    script.save()

    # ── 路径换成占位符：安装脚本会换成用户电脑上的实际位置（Windows 反斜杠）──
    draft_dir = os.path.join(drafts, a.name)
    content_path = os.path.join(draft_dir, "draft_content.json")
    content = json.load(open(content_path, encoding="utf-8"))

    def relink(node):
        if isinstance(node, dict):
            return {k: relink(v) for k, v in node.items()}
        if isinstance(node, list):
            return [relink(v) for v in node]
        if isinstance(node, str) and node.startswith(pkg + os.sep):
            return ROOT_TOKEN + "\\" + node[len(pkg) + 1:].replace("/", "\\")
        return node
    content = relink(content)
    dumped = json.dumps(content, ensure_ascii=False)
    assert pkg not in dumped, "草稿里还有本机路径"
    open(content_path, "w", encoding="utf-8").write(dumped)
    meta_path = os.path.join(draft_dir, "draft_meta_info.json")
    meta = json.load(open(meta_path, encoding="utf-8"))
    meta.update(draft_id=str(uuid.uuid4()).upper(), draft_name=a.name, tm_duration=frame_us(f_r1 - f_r0))
    open(meta_path, "w", encoding="utf-8").write(json.dumps(meta, ensure_ascii=False))

    # ── 透明格式测试（小样用）：同一段标注层的四种编码 ──
    if a.alpha_test:
        test = os.path.join(media, "alpha-test")
        os.makedirs(test)
        src = os.path.join(a.render, f"overlay-{len(scenes):02d}.mov")
        ffmpeg("-i", src, "-c:v", "prores_ks", "-profile:v", "4444", "-pix_fmt", "yuva444p10le", "-alpha_bits", "16",
               "-vendor", "apl0", os.path.join(test, "A-prores4444.mov"))
        shutil.copy(src, os.path.join(test, "B-png.mov"))
        ffmpeg("-i", src, "-c:v", "qtrle", "-pix_fmt", "argb", os.path.join(test, "C-qtrle.mov"))
        ffmpeg("-i", src, "-c:v", "libvpx-vp9", "-pix_fmt", "yuva420p", "-b:v", "0", "-crf", "24", "-row-mt", "1",
               os.path.join(test, "D-vp9.webm"))

    if a.reference:
        os.makedirs(os.path.join(media, "reference"))
        ffmpeg("-ss", f"{r0:.3f}", "-to", f"{r1:.3f}", "-i", a.reference, "-c:v", "libx264", "-crf", "18",
               "-c:a", "aac", "-b:a", "192k", os.path.join(media, "reference", "reference-full.mp4"))

    # ── 安装脚本与说明 ──
    os.makedirs(os.path.join(pkg, "tools"))
    shutil.copy(os.path.join(HERE, "install-draft.ps1"), os.path.join(pkg, "tools", "install-draft.ps1"))
    shutil.copy(os.path.join(HERE, "install-draft.bat"), os.path.join(pkg, "install-draft.bat"))
    readme = open(os.path.join(HERE, "README-package.txt"), encoding="utf-8").read().replace("{DRAFT}", a.name)
    if not a.alpha_test:   # “需要确认”一节只给小样
        readme = readme.split("四、")[0].rstrip() + "\n"
    open(os.path.join(pkg, "README.txt"), "w", encoding="utf-8-sig", newline="\r\n").write(readme)

    zpath = pkg.rstrip(os.sep) + ".zip"
    with zipfile.ZipFile(zpath, "w", zipfile.ZIP_DEFLATED) as z:
        for base, _, files in os.walk(pkg):
            for fn in sorted(files):
                full = os.path.join(base, fn)
                z.write(full, os.path.join(os.path.basename(pkg), os.path.relpath(full, pkg)))
    print("→", zpath, f"{os.path.getsize(zpath) / 1e6:.1f} MB")


if __name__ == "__main__":
    main()
