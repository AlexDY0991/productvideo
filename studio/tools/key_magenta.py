"""Cut Dream out of a solid-magenta studio frame: alpha from distance to magenta, spill removed, cropped.

  python3 studio/tools/key_magenta.py studio/out/D001.png studio/booth2/dream_top.png
"""
import sys
import numpy as np
from PIL import Image, ImageFilter

src, dst = sys.argv[1:3]
a = np.asarray(Image.open(src).convert('RGB')).astype(np.float32)
r, g, b = a[..., 0], a[..., 1], a[..., 2]
# magenta = high R and B, low G. "magentaness" ~ min(R,B) - G
m = np.clip((np.minimum(r, b) - g), 0, 255)
bg = np.median(m[:40, :40])
alpha = np.clip((bg * 0.85 - m) / (bg * 0.55), 0, 1)
# despill: magenta leaks as B (and R) above G; orange body has B below G, so clamping B and the
# matching share of R toward G only touches the fringe
out = a.copy()
leak = np.clip(b - g, 0, None)
out[..., 2] = b - leak
out[..., 0] = np.maximum(g, r - leak)
alpha[alpha < 0.08] = 0  # faint keyed background otherwise prints as a pale box
al = Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))
im = Image.fromarray(out.clip(0, 255).astype(np.uint8)).convert('RGBA')
im.putalpha(al)
im = im.crop(im.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox())
im.save(dst)
print(dst, im.size)
