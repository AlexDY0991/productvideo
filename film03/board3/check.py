"""Overlay the 3D plate's aircraft edges (red) on a generated frame to check the aircraft was not redrawn.
python3 film03/board3/check.py D06c:d06 D10c:d10 ...  →  film03/board3/check/<frame>.jpg (+ prints a match score)"""
import json, os, sys
from PIL import Image, ImageChops, ImageFilter
import numpy as np

os.makedirs('film03/board3/check', exist_ok=True)
for arg in sys.argv[1:]:
    frame, plate = arg.split(':')
    g = Image.open(f'film03/board3/{frame}.png').convert('RGB')
    W, H = g.size
    dx = round(json.load(open('film03/board3/plates.json'))[plate]['comp'][3] * 1920)
    p0 = Image.new('RGBA', (1920, 1080)); p0.alpha_composite(Image.open(f'film03/board3/plates/{plate}.png').convert('RGBA'), (dx, 0))
    p = p0.resize((W, H))
    alpha = np.array(p.split()[3]) > 128
    def edges(im):
        e = np.array(im.convert('L').filter(ImageFilter.GaussianBlur(1.2)).filter(ImageFilter.FIND_EDGES), dtype=float)
        return e > 28
    ep = edges(p.convert('RGB')) & alpha                    # aircraft edges in the plate
    eg = edges(g)
    near = np.array(Image.fromarray(eg.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(9))) > 0   # generated edges, ±4 px
    score = (ep & near).sum() / max(1, ep.sum())
    out = np.array(g).copy()
    out[ep & ~near] = [255, 40, 40]       # plate edge with nothing nearby in the generated frame: likely redrawn
    out[ep & near] = [60, 255, 120]       # plate edge matched
    Image.fromarray(out).resize((W // 2, H // 2)).save(f'film03/board3/check/{frame}.jpg', quality=85)
    print(f'{frame}: {score:.0%} of the plate\'s aircraft edges matched')
