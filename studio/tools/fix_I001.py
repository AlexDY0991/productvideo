"""I001 post fix: retype the misspelled card subtitle and the date block, swap in the real Maldives Expo logo.

  python3 studio/tools/fix_I001.py FONTDIR   ->  studio/out/I001-fixed.png
Fonts (Google Fonts): cg600.ttf = Cormorant Garamond 600, lato.ttf = Lato 400.
"""
import sys
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

FD = sys.argv[1]
im = cv2.imread("studio/out/I001.png")
rng = np.random.default_rng(1)


def erase(img, box, thresh):
    """Inpaint dark ink inside box, then restore paper grain from the box's own clean pixels."""
    x0, y0, x1, y1 = box
    roi = img[y0:y1, x0:x1]
    g = cv2.cvtColor(roi, cv2.COLOR_BGR2GRAY)
    ink = (g < np.median(g) - thresh).astype(np.uint8) * 255
    ink = cv2.dilate(ink, np.ones((7, 7), np.uint8))
    clean = cv2.inpaint(roi, ink, 9, cv2.INPAINT_TELEA)
    paper = roi[ink == 0].astype(np.float32)
    sd = paper.std(axis=0).mean() if len(paper) else 4
    blur = cv2.GaussianBlur(clean, (0, 0), 6).astype(np.float32)
    noise = rng.normal(0, sd * 0.8, roi.shape[:2])[..., None]
    filled = np.clip(blur + noise, 0, 255).astype(np.uint8)
    m = (cv2.GaussianBlur(ink, (0, 0), 2) / 255.0)[..., None]
    img[y0:y1, x0:x1] = (filled * m + roi * (1 - m)).astype(np.uint8)


# card subtitle, date block (left column), old logo
erase(im, (430, 490, 1300, 555), 25)
erase(im, (400, 1715, 840, 1890), 25)
erase(im, (690, 2115, 1050, 2275), 18)

pil = Image.fromarray(cv2.cvtColor(im, cv2.COLOR_BGR2RGB))
d = ImageDraw.Draw(pil)
serif = lambda s: ImageFont.truetype(f"{FD}/cg600.ttf", s)
sans = ImageFont.truetype(f"{FD}/lato.ttf", 40)
BROWN = (74, 50, 32)

d.text((864, 525), "Personal flight, Island skies, A closer look", font=sans, fill=(118, 106, 92), anchor="mm")
# left column, right-aligned against the vertical rule like the right column is left-aligned to it
# baselines match MALDIVES / EXPO 2026 in the right column; lining figures like the AI-set "2026"
d.text((805, 1788), "OCT 25 –", font=serif(80), fill=BROWN, anchor="rs", features=["lnum"])
d.text((805, 1860), "NOV 2, 2026", font=serif(80), fill=BROWN, anchor="rs", features=["lnum"])

# official logo, black keyed out, printed as dark-green ink on the kraft
logo = Image.open("studio/refs/logo_maldives_expo.jpg").convert("RGB")
a = np.asarray(logo).astype(np.float32).max(axis=2)
alpha = np.clip((a - 30) * 255 / 160, 0, 255).astype(np.uint8)
ink = Image.new("RGBA", logo.size, (44, 70, 42, 255))
ink.putalpha(Image.fromarray(alpha))
ink = ink.crop(ink.getbbox())
w = 330
ink = ink.resize((w, round(ink.height * w / ink.width)), Image.LANCZOS)
pil.paste(ink, (871 - w // 2, 2185 - ink.height // 2), ink)

pil.save("studio/out/I001-fixed.png")
print("ok")
