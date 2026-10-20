"""I001 livery fix: replace the garbled CoolFly wordmarks on Dream's side panel and seat headrest
with the real logo (studio/refs/logo_coolfly.jpg), slanted to each surface.

  python3 studio/tools/fix_I001_livery.py   studio/out/I001-fixed.png -> studio/out/I001-v2.png
"""
import cv2
import numpy as np
from PIL import Image

im = cv2.imread("studio/out/I001-fixed.png")


def erase(box, mask_fn):
    x0, y0, x1, y1 = box
    roi = im[y0:y1, x0:x1]
    m = cv2.dilate(mask_fn(roi).astype(np.uint8) * 255, np.ones((3, 3), np.uint8))
    im[y0:y1, x0:x1] = cv2.inpaint(roi, m, 5, cv2.INPAINT_TELEA)


hsv = lambda r: cv2.cvtColor(r, cv2.COLOR_BGR2HSV)
light = lambda r: cv2.cvtColor(r, cv2.COLOR_BGR2GRAY) > np.median(cv2.cvtColor(r, cv2.COLOR_BGR2GRAY)) + 25
orange = lambda r: (hsv(r)[..., 1] > 110) & (hsv(r)[..., 0] < 25)
dark = lambda r: cv2.cvtColor(r, cv2.COLOR_BGR2GRAY) < np.median(cv2.cvtColor(r, cv2.COLOR_BGR2GRAY)) - 20

# side panel: white letters + orange F on mid grey; headrest: dark letters on light grey
erase((966, 1006, 1040, 1052), lambda r: light(r) | orange(r))
erase((982, 858, 1029, 884), dark)

pil = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB)).convert("RGBA")

# logo -> RGBA: ink alpha from darkness/saturation, orange kept, black recoloured per surface
src = np.asarray(Image.open("studio/refs/logo_coolfly.jpg").convert("RGB")).astype(np.float32)
sat = src.max(axis=2) - src.min(axis=2)
alpha = np.clip(np.maximum(255 - src.min(axis=2), sat * 1.5), 0, 255)
is_or = sat > 80


def wordmark(base_rgb, width, angle, shear):
    rgb = np.where(is_or[..., None], [255, 90, 0], base_rgb).astype(np.uint8)
    lg = Image.fromarray(np.dstack([rgb, alpha.astype(np.uint8)]), "RGBA")
    lg = lg.crop(lg.getbbox())
    h = round(lg.height * width * 4 / lg.width)
    lg = lg.resize((width * 4, h), Image.LANCZOS)  # work at 4x, then shrink for clean edges
    lg = lg.transform(lg.size, Image.AFFINE, (1, shear, -shear * h / 2, 0, 1, 0), Image.BICUBIC)
    lg = lg.rotate(angle, expand=True, resample=Image.BICUBIC)
    return lg.resize((lg.width // 4, lg.height // 4), Image.LANCZOS)


def place(lg, cx, cy, opacity=1.0):
    if opacity < 1:
        a = lg.getchannel("A").point(lambda v: int(v * opacity))
        lg.putalpha(a)
    pil.alpha_composite(lg, (round(cx - lg.width / 2), round(cy - lg.height / 2)))


place(wordmark([232, 232, 228], 62, 18, 0.0), 1001, 1031, 0.95)
place(wordmark([28, 28, 30], 36, -14, 0.0), 1005, 871, 0.9)

pil.convert("RGB").save("studio/out/I001-v2.png")
print("ok")
