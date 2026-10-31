"""Lay the exact 3D aircraft back over a generated storyboard frame (CG-locked aircraft).

python3 film03/board3/finish.py D06m:d06 D07m:d07 ...   →  film03/board3/<SHOT>.png  (e.g. D06m → D06.png)
  - the generated frame (pilot swapped in by the image model) is the base;
  - plates/<p>_hole.png (aircraft render with a transparent hole where the pilot is in front) goes on top, so every tube,
    panel and part of the aircraft is the model's, and the parts in front of the pilot stay in front;
  - the CG layer is graded toward the photo (levels, warmth, a touch of softness) and the whole frame gets the same grain.
Prints how well the generated frame kept the plate's framing (edges of the aircraft around the pilot); < 40 % means it moved.
python3 film03/board3/finish.py --plate-only D05:d05   →  uses plates/d05_comp.jpg as the base (no person in the shot)
"""
import json, re, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

P = json.load(open('film03/board3/plates.json'))
W, H = 1920, 1080
rng = np.random.default_rng(7)


def edges(im):
    return np.array(im.convert('L').filter(ImageFilter.GaussianBlur(1.2)).filter(ImageFilter.FIND_EDGES), dtype=float) > 28


def grade(layer, base, mask):
    """match the CG layer's luminance to the photo under it, warm it slightly, soften a hair; keeps the layer's alpha"""
    rgb = np.array(layer.convert('RGB'), dtype=float); bl = np.array(base, dtype=float); m = mask[..., None]
    gain = float(np.clip((bl * m).sum() / max(1, (rgb * m).sum()), 0.85, 1.15))
    rgb = np.clip(rgb * gain * np.array([1.03, 1.0, 0.96]), 0, 255)
    out = Image.fromarray(rgb.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)).convert('RGBA')
    out.putalpha(layer.split()[3].filter(ImageFilter.GaussianBlur(0.8)))
    return out


def layered(frame, p, sil_only=False, occ_on=True):
    """exact CG aircraft over the generated frame, the generated person back on top, then only the parts in front of the pilot"""
    dx = round(P[p]['comp'][3] * W)
    def L(name):
        im = Image.new('RGBA', (W, H)); im.alpha_composite(Image.open(f'film03/board3/plates/{name}.png').convert('RGBA'), (dx, 0)); return im
    gen = Image.open(f'film03/board3/{frame}.png').convert('RGB').resize((W, H), Image.LANCZOS)
    off, manfat, holefat = L(p), L(f'{p}_manfat'), L(f'{p}_holefat')
    inp = Image.open(f'film03/board3/plates/{p}_mancomp.jpg').convert('RGB')
    a_off = np.array(off.split()[3]) > 128
    sil = (np.abs(np.array(manfat, dtype=int) - np.array(off, dtype=int)).sum(2) > 40)      # fat pilot silhouette
    near = np.array(Image.fromarray(sil.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(81))) > 0
    diff = np.abs(np.array(gen, dtype=int) - np.array(inp, dtype=int)).sum(2) > 55          # what the model painted
    person = sil if sil_only else sil | (diff & near & a_off)                              # incl. where it drew him bigger
    pm = Image.fromarray(person.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(9)).filter(ImageFilter.MinFilter(9))
    hole = pm.copy(); ImageDraw.floodfill(hole, (0, 0), 128)                                # fill holes inside the person
    pm = Image.fromarray(np.where(np.array(hole) == 128, 0, 255).astype(np.uint8))
    pm = pm.filter(ImageFilter.GaussianBlur(2))
    base = Image.open(f'film03/board3/plates/{p}_comp.jpg').convert('RGB') if sil_only else gen   # POV: keep the plate's background
    out = base.convert('RGBA'); out.alpha_composite(grade(off, gen, a_off))                 # 1. exact aircraft everywhere
    out = Image.composite(gen.convert('RGBA'), out, pm)                                      # 2. the person back on top
    if not occ_on:   # POV: nothing sits in front of his own hands
        return out.convert('RGB')
    occ = holefat.copy(); a = np.array(occ.split()[3]); a[~sil] = 0                          # 3. only parts in front of him
    occ.putalpha(Image.fromarray(a))
    out.alpha_composite(grade(occ, gen, a > 128))
    return out.convert('RGB')


plate_only = '--plate-only' in sys.argv
if '--layered' in sys.argv:
    for arg in [a for a in sys.argv[1:] if not a.startswith('--')]:
        frame, p = arg.split(':')
        img = layered(frame, p, sil_only='--sil-only' in sys.argv, occ_on='--no-occ' not in sys.argv)
        g = np.array(img, dtype=float) + rng.normal(0, 3.2, (H, W, 1))
        shot = re.sub('[a-z]+$', '', frame)
        Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).save(f'film03/board3/{shot}.png'); print('→', shot)
    sys.exit()
for arg in [a for a in sys.argv[1:] if not a.startswith('--')]:
    frame, p = arg.split(':')
    dx = round(P[p]['comp'][3] * W)
    if plate_only:
        base = Image.open(f'film03/board3/plates/{p}_comp.jpg').convert('RGB')
        layer = None
    else:
        base = Image.open(f'film03/board3/{frame}.png').convert('RGB').resize((W, H), Image.LANCZOS)
        layer = Image.new('RGBA', (W, H)); layer.alpha_composite(Image.open(f'film03/board3/plates/{p}_hole.png').convert('RGBA'), (dx, 0))
        # framing check: aircraft edges of the plate vs the generated frame, outside the pilot hole
        a = np.array(layer.split()[3]) > 128
        ep = edges(layer.convert('RGB')) & a
        near = np.array(Image.fromarray(edges(base).astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(9))) > 0
        print(f'{frame}: framing kept {(ep & near).sum() / max(1, ep.sum()):.0%}')
        # grade the CG toward the photo: match mean luminance of the covered area, warm it slightly, soften a hair
        rgb = np.array(layer.convert('RGB'), dtype=float)
        bl = np.array(base, dtype=float)
        m = a[..., None]
        gain = (bl * m).sum() / max(1, (rgb * m).sum())
        gain = float(np.clip(gain, 0.85, 1.15))
        rgb = np.clip(rgb * gain * np.array([1.03, 1.0, 0.96]), 0, 255)
        graded = Image.fromarray(rgb.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.6)).convert('RGBA')
        alpha = layer.split()[3].filter(ImageFilter.GaussianBlur(0.8))
        graded.putalpha(alpha)
        out = base.convert('RGBA'); out.alpha_composite(graded); base = out.convert('RGB')
    g = np.array(base, dtype=float) + rng.normal(0, 3.2, (H, W, 1))
    shot = re.sub('[a-z]+$', '', frame)
    Image.fromarray(np.clip(g, 0, 255).astype(np.uint8)).save(f'film03/board3/{shot}.png')
    print('→', f'film03/board3/{shot}.png')
