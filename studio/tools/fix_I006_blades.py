"""I006 rotor fix: every motor showed three blades (one full two-blade prop plus a single blade of the
lower prop). Copy that lone blade, rotate it 180 degrees about the hub and lay it down as the missing blade.

  python3 studio/tools/fix_I006_blades.py   studio/out/I006.png -> studio/out/I006-fixed.png
"""
import numpy as np
from PIL import Image, ImageFilter

src = Image.open("studio/out/I006.png").convert("RGB")
a = np.asarray(src).astype(np.float32)
H, W = a.shape[:2]
out = Image.fromarray(a.astype(np.uint8)).convert("RGBA")

# (hub, donor blade tip, target tip) in image coordinates, read off 520 px crops around each motor.
# Rear motors: the lone lower blade is whole, so it is turned 180 degrees about the hub.
# Front motors: the lone blade's root hides under the motor, so a blade of the full upper prop is
# turned onto the missing position instead, and the hub cap is laid back on top.
MOTORS = [
    ((473, 1064), (591, 894), (340, 824)),     # front left, missing blade up-left
    ((1265, 1061), (1152, 889), (1398, 818)),  # front right, missing blade up-right
    ((463, 1802), (606, 1582), (320, 2022)),   # rear left, missing blade down-left
    ((1275, 1799), (1137, 1577), (1413, 2021)),# rear right, missing blade down-right
]

yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
lum = a.mean(axis=2)
sat = a.max(axis=2) - a.min(axis=2)
import math
hubs = src.convert("RGBA")
for (hx, hy), (tx, ty), (gx, gy) in MOTORS:
    v = np.array([tx - hx, ty - hy], np.float32)
    L = np.hypot(*v)
    u = v / L
    t = ((xx - hx) * u[0] + (yy - hy) * u[1]) / L
    d = np.abs((xx - hx) * u[1] - (yy - hy) * u[0])
    # taper the wedge toward the hub so the motor housing and its LED are not copied
    front = hy < 1400  # donor is a whole upper-prop blade: take it right from the hub
    wedge = (t > (0.04 if front else 0.08)) & (t < 1.06) & (d < 34 * np.clip((t - 0.1) / 0.3, 0.6 if front else 0.35, 1))
    blade = wedge & (lum < 100) & (sat < 34)
    m = Image.fromarray((blade * 255).astype(np.uint8)).filter(ImageFilter.MaxFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    layer = src.convert("RGBA")
    layer.putalpha(m)
    # PIL rotates counter-clockwise (in screen terms) about `center`
    ang = math.degrees(math.atan2(-(gy - hy), gx - hx) - math.atan2(-(ty - hy), tx - hx))
    layer = layer.rotate(ang, center=(hx, hy), resample=Image.BICUBIC)
    shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    shadow.putalpha(layer.getchannel("A").point(lambda p: int(p * 0.35)))
    shadow = shadow.filter(ImageFilter.GaussianBlur(7))
    out.alpha_composite(shadow, (8, 12))
    out.alpha_composite(layer)
    cap = Image.new("L", (W, H), 0)
    from PIL import ImageDraw
    ImageDraw.Draw(cap).ellipse([hx - 30, hy - 30, hx + 30, hy + 30], fill=255)
    hub = hubs.copy()
    hub.putalpha(cap.filter(ImageFilter.GaussianBlur(2)))
    out.alpha_composite(hub)

out.convert("RGB").save("studio/out/I006-fixed.png")
print("ok")
