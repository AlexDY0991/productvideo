"""Composite the transparent 3D plates (film03/board3/plates/dNN[_man].png) over location backgrounds with matched horizons.
python3 film03/board3/composite.py [--man] [dNN ...]  →  film03/board3/plates/dNN_comp.jpg (or dNN_mancomp.jpg with the mannequin)"""
import json, math, sys
from PIL import Image, ImageFilter

P = json.load(open('film03/board3/plates.json'))
W, H = 1920, 1080
MAN = '--man' in sys.argv
args = [a for a in sys.argv[1:] if a != '--man']
for k in (args or list(P)):
    v = P[k]; bgname, blur, bg_hz, dx = v['comp']
    pos, tgt, fov = v['pos'], v['target'], v['fov']
    pitch = math.atan2(tgt[1] - pos[1], math.hypot(tgt[0] - pos[0], tgt[2] - pos[2]))
    hz = 0.5 + math.tan(pitch) / (2 * math.tan(math.radians(fov / 2)))      # where the horizon falls in the plate
    bg = Image.open(f'film03/locs/{bgname}.png').convert('RGB').resize((W, H), Image.LANCZOS)
    off = round((hz - bg_hz) * H)                                            # move the background so the horizons meet
    canvas = Image.new('RGB', (W, H))
    if off > 0:   # camera looks up: fill the exposed top with a smooth sky gradient sampled from the plate's sky
        top = bg.crop((0, 0, W, 6)).resize((1, 1), Image.BOX).getpixel((0, 0))
        deep = tuple(round(c * f) for c, f in zip(top, (0.62, 0.72, 0.92)))
        for y in range(off + 80):
            t = min(1, y / max(1, off + 80))
            canvas.paste(tuple(round(d + (c - d) * t) for d, c in zip(deep, top)), (0, y, W, y + 1))
    if off + H < H:   # camera looks down: fill the bottom with stretched clay
        clay = bg.crop((0, round(H * 0.7), W, H)).resize((W, H), Image.BICUBIC)
        canvas.paste(clay, (0, 0))
    if off < -bg_hz * H:   # horizon pushed out of frame: the view is all ground
        canvas = bg.crop((0, round(H * 0.55), W, H)).resize((W, H), Image.BICUBIC)
    else:
        mask = Image.new('L', (W, H), 255)
        for y in range(80):   # feather the top edge of the background into the sky fill
            mask.paste(round(255 * y / 80), (0, y, W, y + 1))
        canvas.paste(bg, (0, off), mask if off > 0 else None)
    if blur:
        canvas = canvas.filter(ImageFilter.GaussianBlur(blur))
    pl = Image.open(f'film03/board3/plates/{k}{"_man" if MAN else ""}.png').convert('RGBA')
    canvas = canvas.convert('RGBA'); canvas.alpha_composite(pl, (round(dx * W), 0))
    canvas.convert('RGB').save(f'film03/board3/plates/{k}_{"mancomp" if MAN else "comp"}.jpg', quality=92)
    print(k, f'horizon {hz:.2f}, bg shift {off}px')
