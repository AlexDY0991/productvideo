"""Typeset the Maldives Expo details and both logos onto the four style posters (I002-I005).

  python3 studio/tools/compose_maldives.py [I002 ...]   ->  studio/out/<KEY>-final.png
Fonts are Google Fonts (OFL) kept in studio/fonts/.
"""
import math
import sys

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

F = "studio/fonts/"
ORANGE = (255, 90, 0)
DATES = "OCT 25 – NOV 2, 2026"
VENUE = "HULHUMALÉ CENTRAL PARK"
DISTRICT = "05 INTERNATIONAL EXHIBITORS DISTRICT"
BOOTH = "CHINA PAVILION  ·  BOOTH C12"


def font(name, size):
    return ImageFont.truetype(F + name, size)


def coolfly(width, base):
    """CoolFly wordmark, F in brand orange, the rest in `base`."""
    src = np.asarray(Image.open("studio/refs/logo_coolfly.jpg").convert("RGB")).astype(np.float32)
    sat = src.max(axis=2) - src.min(axis=2)
    alpha = np.clip(np.maximum(255 - src.min(axis=2), sat * 1.5), 0, 255).astype(np.uint8)
    rgb = np.where((sat > 80)[..., None], ORANGE, base).astype(np.uint8)
    lg = Image.fromarray(np.dstack([rgb, alpha]), "RGBA")
    lg = lg.crop(lg.getbbox())
    return lg.resize((width, round(lg.height * width / lg.width)), Image.LANCZOS)


def expo(width, mono=None):
    """Maldives Expo 2026 logo with its black ground keyed out; mono=(r,g,b) prints it in one ink."""
    src = Image.open("studio/refs/logo_maldives_expo.jpg").convert("RGB")
    a = np.asarray(src).astype(np.float32)
    alpha = np.clip((a.max(axis=2) - 30) * 255 / 140, 0, 255).astype(np.uint8)
    rgb = np.asarray(src) if mono is None else np.broadcast_to(np.array(mono, np.uint8), a.shape)
    lg = Image.fromarray(np.dstack([rgb, alpha]).astype(np.uint8), "RGBA")
    lg = lg.crop(lg.getbbox())
    return lg.resize((width, round(lg.height * width / lg.width)), Image.LANCZOS)


class Poster:
    def __init__(self, key):
        self.key = key
        self.im = Image.open(f"studio/out/{key}.png").convert("RGBA")
        self.W, self.H = self.im.size

    def shade(self, y0, y1, rgb, max_alpha, box=None):
        """Vertical gradient from transparent at y0 to max_alpha at y1, for legibility over busy ground.
        box=(x0, y0, x1, y1) clips it to a panel."""
        a = np.zeros((self.H, self.W), np.float32)
        ramp = np.clip((np.arange(self.H) - y0) / max(1, y1 - y0), 0, 1) ** 1.5 * max_alpha
        a[:] = ramp[:, None]
        if box:
            m = np.zeros_like(a)
            m[box[1]:box[3], box[0]:box[2]] = 1
            a *= m
        lay = Image.new("RGBA", self.im.size, rgb + (0,))
        lay.putalpha(Image.fromarray(a.astype(np.uint8)))
        self.im.alpha_composite(lay)

    def layer(self):
        return Image.new("RGBA", self.im.size, (0, 0, 0, 0))

    def put(self, lay, shadow=0, opacity=1.0):
        if shadow:
            sh = Image.new("RGBA", lay.size, (0, 0, 0, 0))
            sh.putalpha(lay.getchannel("A").point(lambda v: int(v * 0.55)))
            self.im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(shadow)))
        if opacity < 1:
            lay.putalpha(lay.getchannel("A").point(lambda v: int(v * opacity)))
        self.im.alpha_composite(lay)

    def text(self, xy, s, f, fill, anchor="mm", spacing=0, shadow=0, opacity=1.0, **kw):
        lay = self.layer()
        d = ImageDraw.Draw(lay)
        if spacing:  # tracked caps: draw char by char around the anchor point
            widths = [d.textlength(c, font=f) + spacing for c in s]
            total = sum(widths) - spacing
            x = xy[0] - (total / 2 if anchor[0] == "m" else total if anchor[0] == "r" else 0)
            for c, w in zip(s, widths):
                d.text((x, xy[1]), c, font=f, fill=fill, anchor="l" + anchor[1])
                x += w
        else:
            d.text(xy, s, font=f, fill=fill, anchor=anchor, **kw)
        self.put(lay, shadow, opacity)
        return lay.getbbox()

    def paste(self, img, cx, cy, shadow=0):
        lay = self.layer()
        lay.alpha_composite(img, (round(cx - img.width / 2), round(cy - img.height / 2)))
        self.put(lay, shadow)

    def worn(self, lay, strength=0.35, seed=0):
        """Road-paint wear: knock random speckles out of a layer's alpha."""
        rng = np.random.default_rng(seed)
        n = rng.random((self.H // 3, self.W // 3)).astype(np.float32)
        n = np.asarray(Image.fromarray((n * 255).astype(np.uint8)).resize((self.W, self.H), Image.BILINEAR)) / 255.0
        a = np.asarray(lay.getchannel("A")).astype(np.float32) * (1 - strength * (n > 0.6))
        lay.putalpha(Image.fromarray(a.astype(np.uint8)))
        return lay

    def save(self):
        self.im.convert("RGB").save(f"studio/out/{self.key}-final.png")
        print(self.key, "->", f"studio/out/{self.key}-final.png")


def i002():
    """Aerial road: details painted on the asphalt below the aircraft, like the auto-show poster."""
    p = Poster("I002")
    cx = 958  # road centreline at the bottom of the frame
    p.paste(coolfly(330, (245, 245, 240)), cx, 92, shadow=4)
    lay = p.layer()
    d = ImageDraw.Draw(lay)
    d.text((cx, 1940), "MALDIVES EXPO 2026", font=font("Oswald600.ttf", 104), fill=ORANGE, anchor="mm")
    d.text((cx, 2042), DATES, font=font("Oswald500.ttf", 64), fill=(242, 242, 236), anchor="mm")
    d.text((cx, 2112), VENUE, font=font("Oswald500.ttf", 42), fill=(242, 242, 236), anchor="mm")
    d.text((cx, 2165), f"{DISTRICT}  ·  CHINA PAVILION  ·  BOOTH C12", font=font("Oswald400.ttf", 29), fill=(242, 242, 236), anchor="mm")
    p.put(p.worn(lay, 0.3, 2), opacity=0.93)
    p.paste(expo(250), cx, 2245)
    p.save()


def i003():
    """Turquoise top-down: header lockup, badge + details, scrolling ticker band."""
    p = Poster("I003")
    W = p.W
    white, sand = (255, 255, 255), (238, 226, 200)
    p.paste(coolfly(250, white), W / 2, 92, shadow=4)
    d = ImageDraw.Draw(p.im)
    for x0, x1 in ((330, 690), (W - 690, W - 330)):
        d.line([(x0, 92), (x1, 92)], fill=(255, 255, 255, 200), width=3)
    # left badge: booth number in a ring
    bx, by, r = 560, 1930, 150
    ring = p.layer()
    ImageDraw.Draw(ring).ellipse([bx - r, by - r, bx + r, by + r], outline=white, width=5)
    ImageDraw.Draw(ring).ellipse([bx - r + 16, by - r + 16, bx + r - 16, by + r - 16], outline=(255, 255, 255, 120), width=2)
    p.put(ring, shadow=4)
    p.text((bx, by - 62), "BOOTH", font("Fredoka600.ttf", 38), white, shadow=3)
    p.text((bx, by + 12), "C12", font("Fredoka700.ttf", 118), white, shadow=4)
    p.text((bx, by + 92), "CHINA PAVILION", font("Fredoka600.ttf", 25), white, shadow=3)
    # divider
    d = ImageDraw.Draw(p.im)
    d.line([(800, 1790), (800, 2070)], fill=white, width=4)
    p.text((850, 1835), "OCT 25 – NOV 2", font("Fredoka700.ttf", 92), white, anchor="lm", shadow=4)
    p.text((852, 1912), "2026  ·  MALDIVES EXPO", font("Fredoka600.ttf", 38), sand, anchor="lm", shadow=3)
    p.text((850, 1985), VENUE, font("Fredoka700.ttf", 46), white, anchor="lm", shadow=3)
    p.text((852, 2038), DISTRICT, font("Fredoka500.ttf", 27), white, anchor="lm", shadow=3)
    p.paste(expo(230, white), W / 2, 2152, shadow=3)
    # ticker band
    d = ImageDraw.Draw(p.im)
    d.line([(0, 2222), (W, 2222)], fill=(255, 255, 255, 170), width=2)
    d.line([(0, 2288), (W, 2288)], fill=(255, 255, 255, 170), width=2)
    item = "MALDIVES EXPO 2026   ·   BOOTH C12   ·   "
    f = font("Fredoka600.ttf", 34)
    x, i = -120, 0
    while x < W:
        col = sand if i % 2 else white
        d.text((x, 2255), item, font=f, fill=col, anchor="lm")
        x += d.textlength(item, font=f)
        i += 1
    p.save()


def i004():
    """Open sea: partner lockup top, tracked lines around SOAR, slogan + badge at the bottom."""
    p = Poster("I004")
    W = p.W
    navy, cream, sky = (14, 34, 70), (246, 236, 214), (150, 205, 255)
    p.shade(1600, p.H, (6, 22, 52), 215)
    p.paste(coolfly(250, (255, 255, 255)), 250, 90, shadow=6)
    p.paste(expo(250, (255, 255, 255)), W - 250, 90, shadow=6)
    p.text((W / 2, 225), "FREEDOM. HORIZONS. ENDLESS SKIES.", font("Barlow700.ttf", 30), (255, 255, 255), spacing=5, shadow=4)
    p.text((W / 2, 945), "Follow the sky.", font("Barlow500.ttf", 52), (255, 255, 255), shadow=6)
    p.text((W / 2, 1035), "MALDIVES EXPO 2026  ·  " + DATES, font("Barlow700.ttf", 34), navy, spacing=3)
    # bottom-left slogan, like LEAVE THE SHORE / FIND YOURSELF
    f = font("BarlowCondensed700.ttf", 82)
    for i, (s, c) in enumerate([("LEAVE", cream), ("THE SHORE.", cream), ("FIND", sky), ("YOUR SKY.", sky)]):
        p.text((70, 1800 + i * 76), s, f, c, anchor="lm", shadow=6)
    d = ImageDraw.Draw(p.im)
    d.rounded_rectangle([72, 2110, 280, 2120], radius=5, fill=sky)
    # bottom-right ring badge with circular text
    bx, by, r = W - 230, 1950, 160
    ring = p.layer()
    rd = ImageDraw.Draw(ring)
    rd.ellipse([bx - r, by - r, bx + r, by + r], fill=(8, 28, 62, 190), outline=(255, 255, 255), width=4)
    rd.ellipse([bx - r + 52, by - r + 52, bx + r - 52, by + r - 52], outline=(255, 255, 255), width=3)
    p.put(ring, shadow=5)
    fc = font("Barlow700.ttf", 27)
    s = "CHINA PAVILION  ·  BOOTH C12  ·  "
    rr = r - 27
    step = 360 / len(s)
    for i, ch in enumerate(s):
        ang = -90 + i * step
        g = Image.new("RGBA", (60, 60), (0, 0, 0, 0))
        ImageDraw.Draw(g).text((30, 30), ch, font=fc, fill=(255, 255, 255), anchor="mm")
        g = g.rotate(-(ang + 90), resample=Image.BICUBIC)
        p.paste(g, bx + rr * math.cos(math.radians(ang)), by + rr * math.sin(math.radians(ang)))
    p.text((bx, by - 4), "C12", font("BarlowCondensed700.ttf", 78), (255, 255, 255), shadow=4)
    # bottom centre: rule · venue · rule, district below
    y = 2195
    bb = p.text((W / 2, y), VENUE, font("Barlow700.ttf", 40), sky, spacing=6, shadow=4)
    d = ImageDraw.Draw(p.im)
    d.line([(bb[0] - 140, y), (bb[0] - 30, y)], fill=sky, width=2)
    d.line([(bb[2] + 30, y), (bb[2] + 140, y)], fill=sky, width=2)
    p.text((W / 2, 2250), DISTRICT, font("Barlow600.ttf", 28), sky, spacing=4, shadow=4)
    p.save()


def i005():
    """Black-and-white jetty: dates left, event right, orange line at the bottom, logo lockup."""
    p = Poster("I005")
    W = p.W
    white = (255, 255, 255)
    p.shade(2050, p.H, (0, 0, 0), 170)
    p.text((W / 2, 52), "T.H.E", font("Archivo800.ttf", 40), (25, 25, 25), spacing=10)
    f = font("Archivo700.ttf", 64)
    for i, s in enumerate(["OCT 25 –", "NOV 2,", "2026"]):
        p.text((95, 1300 + i * 72), s, f, white, anchor="lm", shadow=8)
    for i, s in enumerate(["MALDIVES", "EXPO", "2026."]):
        p.text((W - 95, 1300 + i * 72), s, f, white, anchor="rm", shadow=8)
    fo = font("Archivo800.ttf", 30)
    p.text((W / 2, 2150), f"{VENUE}  ·  {BOOTH}", fo, ORANGE, spacing=5, shadow=5)
    p.text((W / 2, 2195), DISTRICT, fo, ORANGE, spacing=5, shadow=5)
    p.paste(coolfly(220, white), W / 2 - 150, 2258, shadow=5)
    d = ImageDraw.Draw(p.im)
    d.line([(W / 2, 2232), (W / 2, 2284)], fill=white, width=2)
    p.paste(expo(220, white), W / 2 + 150, 2258, shadow=5)
    p.save()


EMBASSY = "INVITED BY THE EMBASSY OF THE PEOPLE’S REPUBLIC OF CHINA IN THE REPUBLIC OF MALDIVES"
HEADLINE = "MALDIVES’ FIRST PERSONAL AIRCRAFT FLIGHT DISPLAY"


def i006():
    """Editorial (THE EDGE): masthead in the paper band, copy on the water, embassy credit at the foot."""
    p = Poster("I006")
    W = p.W
    teal, cream, orange = (20, 58, 66), (248, 240, 224), (255, 128, 48)
    p.paste(coolfly(240, (24, 30, 32)), 190, 1095)
    p.text((1540, 1078), "MALDIVES", font("Archivo800.ttf", 38), teal, spacing=4)
    p.text((1540, 1124), "EXPO 2026", font("Archivo800.ttf", 30), teal, spacing=4)
    # darken the foot of the water panel so the copy reads over the ripples
    p.shade(1930, 2236, (4, 30, 34), 200, box=(61, 1176, 1668, 2237))
    p.text((W / 2, 2085), HEADLINE, font("Archivo800.ttf", 42), cream, spacing=3)
    p.text((W / 2, 2152), "MALDIVES EXPO 2026  ·  " + DATES, font("Archivo800.ttf", 34), orange, spacing=3)
    p.text((W / 2, 2272), EMBASSY, font("Archivo700.ttf", 26), teal, spacing=2)
    p.save()


def i007():
    """Travel (SPAIN): script "First Flight" over the knockout MALDIVES, so it reads as the Maldives' first flight."""
    p = Poster("I007")
    terra = (180, 70, 38)
    W = p.W
    bb = p.text((W / 2, 140), "First Flight", font("KaushanScript.ttf", 168), terra)
    p.text((bb[0] - 55, 168), "oct 25 – nov 2", font("Montserrat600.ttf", 38), terra, anchor="rm")
    p.text((bb[2] + 55, 168), "2026", font("Montserrat600.ttf", 38), terra, anchor="lm")
    p.shade(1780, p.H, (0, 22, 38), 230)
    p.paste(coolfly(230, (255, 255, 255)), W / 2, 2005, shadow=5)
    p.text((W / 2, 2085), HEADLINE, font("Montserrat600.ttf", 45), (255, 255, 255), spacing=2, shadow=5)
    p.text((W / 2, 2147), "MALDIVES EXPO 2026  ·  " + DATES, font("Montserrat600.ttf", 34), (255, 196, 150), spacing=3, shadow=5)
    p.text((W / 2, 2255), EMBASSY, font("Montserrat500.ttf", 26), (255, 255, 255), spacing=2, shadow=4)
    p.save()

if __name__ == "__main__":
    todo = sys.argv[1:] or ["I002", "I003", "I004", "I005"]
    for k in todo:
        globals()[k.lower()]()
