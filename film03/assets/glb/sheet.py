"""Compose the film03 cockpit prop sheet from render.mjs output.

python3 film03/assets/glb/sheet.py film03/assets/prop
Writes PROP_cockpit_sheet.jpg (labelled, for the user) next to the clean glb_*.png renders.
"""
import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

D = Path(sys.argv[1])
ROOT = Path(__file__).resolve().parents[3]
FB = '/usr/share/fonts/opentype/inter/Inter-Bold.otf'
FM = '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
CW, CH, PAD, HEAD = 853, 480, 14, 110
W, H = 3 * CW + 4 * PAD, HEAD + 3 * (CH + 44) + PAD
ORANGE, INK, BG = (255, 122, 26), (245, 245, 242), (28, 28, 30)
L = json.loads((D / 'labels.json').read_text())

sheet = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(sheet)
f_title, f_cap, f_lab, f_rule = (ImageFont.truetype(FB, 44), ImageFont.truetype(FB, 24),
                                 ImageFont.truetype(FB, 22), ImageFont.truetype(FM, 26))
d.text((PAD + 6, 22), 'DREAM  ·  COCKPIT PROP SHEET', font=f_title, fill=INK)
d.text((PAD + 8, 74), 'Rendered from brand/models/dream.glb  ·  livery matched to the runway photo  ·  film03 step 1',
       font=ImageFont.truetype(FM, 22), fill=(170, 170, 168))


def cell(i):
    c, r = i % 3, i // 3
    return PAD + c * (CW + PAD), HEAD + r * (CH + 44)


def fit(img):
    """cover-crop to the cell aspect"""
    w, h = img.size
    s = max(CW / w, CH / h)
    img = img.resize((round(w * s), round(h * s)), Image.LANCZOS)
    x, y = (img.width - CW) // 2, (img.height - CH) // 2
    return img.crop((x, y, x + CW, y + CH)), s, x, y


def callout(x0, y0, view, part, text, dx, dy):
    """arrow from a label box to the projected part; coords are in the 1920x1080 render"""
    px, py, _ = L[view][part]
    s = CW / 1920
    tx, ty = x0 + px * s, y0 + py * s
    lx, ly = tx + dx, ty + dy
    d.line([(lx, ly), (tx, ty)], fill=ORANGE, width=4)
    d.ellipse([tx - 9, ty - 9, tx + 9, ty + 9], outline=ORANGE, width=4)
    bw = d.textlength(text, font=f_lab) + 20
    bx = lx - bw / 2
    bx = min(max(bx, x0 + 6), x0 + CW - bw - 6)
    by = min(max(ly - 18, y0 + 6), y0 + CH - 42)
    d.rectangle([bx, by, bx + bw, by + 36], fill=ORANGE)
    d.text((bx + 10, by + 6), text, font=f_lab, fill=(20, 20, 20))


cells = [
    ('glb_hero.png', 'A · 3D MODEL, FRONT 3/4 (PILOT\'S LEFT)'),
    (ROOT / 'brand/refs/45°侧视外观特写.png', 'B · REAL AIRCRAFT (RUNWAY PHOTO)'),
    ('glb_left.png', 'C · LEFT SIDE'),
    ('glb_top.png', 'D · TOP  (FORWARD = UP)'),
    ('glb_stick.png', 'E · SIDE-STICK CLOSE-UP'),
    ('glb_right.png', 'F · RIGHT SIDE'),
    ('glb_pov.png', 'G · PILOT POV'),
]
for i, (src, cap) in enumerate(cells):
    x0, y0 = cell(i)
    img, *_ = fit(Image.open(src if isinstance(src, Path) else D / src).convert('RGB'))
    sheet.paste(img, (x0, y0))
    d.text((x0 + 4, y0 + CH + 8), cap, font=f_cap, fill=INK)

# D · top
x0, y0 = cell(3)
callout(x0, y0, 'top', 'stick', 'R SIDE-STICK', 150, 40)
callout(x0, y0, 'top', 'panel', 'L ARMREST PANEL', -150, 40)
callout(x0, y0, 'top', 'seat', 'SEAT', 170, 60)
callout(x0, y0, 'top', 'footwell', 'FOOTWELL', 170, -10)
d.polygon([(x0 + 60, y0 + 40), (x0 + 44, y0 + 76), (x0 + 76, y0 + 76)], fill=ORANGE)
d.text((x0 + 28, y0 + 82), 'FWD', font=f_lab, fill=ORANGE)
# E · stick
x0, y0 = cell(4)
callout(x0, y0, 'stick', 'stick', 'RIGHT HAND ONLY', 190, -120)
# G · POV
x0, y0 = cell(6)
callout(x0, y0, 'pov', 'stick', 'R SIDE-STICK', 110, -40)
callout(x0, y0, 'pov', 'panel', 'L ARMREST PANEL', -90, -60)
callout(x0, y0, 'pov', 'vbars', 'V ROLL BARS', -230, -20)

# rules panel spans the last two cells
x0, y0 = cell(7)
d.rectangle([x0, y0, x0 + 2 * CW + PAD, y0 + CH], outline=ORANGE, width=3)
rules = [
    ('ONE STICK. RIGHT SIDE. RIGHT HAND.', True),
    ('Single side-stick on the right rail, grip top ~1.1 m above ground.', False),
    ('Left hand rests on the left armrest panel (buttons, grab handle).', False),
    ('Never on the left. Never the left hand. Never two hands. No yoke, no wheel.', False),
    ('', False),
    ('AIRFRAME', True),
    ('X-frame, 4 arms, 2 motors per arm = 8 two-blade props, green arm LEDs.', False),
    ('Pearl-white fairings, black tubular roll cage, CoolFly on side panel + headrest.', False),
    ('Two V roll bars ahead of the pilot. Pilot sits low, slightly reclined, legs', False),
    ('forward into the footwell; helmet stays below the top of the cage.', False),
    ('No numbers on the body (no "05", no "20").', False),
]
y = y0 + 26
for t, bold in rules:
    d.text((x0 + 30, y), t, font=ImageFont.truetype(FB, 30) if bold else f_rule, fill=ORANGE if bold else INK)
    y += 42 if t else 18
sheet.save(D / 'PROP_cockpit_sheet.jpg', quality=90)
print(D / 'PROP_cockpit_sheet.jpg', sheet.size)
