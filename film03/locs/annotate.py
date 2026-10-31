"""Annotate the film03 location plates: flight path, camera positions, sun, landmarks + a top-down schematic (% coordinates).

python3 film03/locs/annotate.py  →  film03/locs/LOC_L1..L5.jpg and LOC_all.jpg
Coordinates are fractions of the plate (x right, y down) for the photo, and of the schematic box for the top view.
Continuity: flight always LEFT → RIGHT on screen (westbound), sun low on the LEFT (east), ≤ 20 m above ground/water.
"""
from PIL import Image, ImageDraw, ImageFont

D = 'film03/locs'
FB, FM = '/usr/share/fonts/opentype/inter/Inter-Bold.otf', '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
OR, INK, DIM, BG, SKY = (255, 122, 26), (245, 245, 242), (170, 170, 168), (28, 28, 30), (90, 170, 255)
PW, PH = 1600, 900                 # photo size on the sheet
SW, SH = 760, 428                  # schematic size

LOCS = {
 'L1': dict(title='MOJAVE DRY LAKE · SUNRISE · TAKE-OFF', time='Sunrise, sun on the horizon (east, frame left)',
   path=[(.58, .62), (.66, .52), (.80, .48), (.99, .45)], sun=(.03, .30),
   marks=[((.58, .66), 'LANDING MAT 8 m'), ((.30, .44), 'PICKUP · 60 m LEFT OF MAT')],
   cams=[((.42, .80), '1', 'LOW WIDE · lift-off, dust ring, sun behind'), ((.70, .70), '2', 'FPV CHASE · low behind-left'),
         ((.88, .40), '3', 'POV · skimming the clay, shadow ahead')],
   top=dict(bg=(226, 222, 214), feats=[('rect', (.52, .48, .62, .62), (60, 60, 64), 'MAT'), ('rect', (.12, .46, .18, .52), (250, 250, 250), 'TRUCK')],
            path=[(.57, .55), (.70, .50), (.99, .50)], cams=[((.50, .70), '1'), ((.64, .60), '2'), ((.85, .50), '3')]),
   notes=['Lift-off straight up to ~3 m, then accelerate RIGHT along the open clay.', 'No people on the lake bed; the truck is the only object, 60 m clear of the mat.',
          'Out: helmet-visor reflection of red rock → L2 (match cut).']),
 'L2': dict(title='RED-ROCK CANYON RIVER · EARLY MORNING', time='Early morning, light down the canyon from frame left',
   path=[(.28, .45), (.42, .56), (.62, .68), (.88, .86)], sun=(.04, .08),
   marks=[((.30, .62), 'RIVER ~80 m WIDE'), ((.80, .22), 'WALLS ~50 m')],
   cams=[((.20, .70), '1', 'FPV FOLLOW · 8 m over the water'), ((.70, .45), '2', 'SIDE TRACK · wall skims past'),
         ((.92, .70), '3', 'RIM REVEAL · hop the rim at canyon end')],
   top=dict(bg=(196, 120, 82), feats=[('band', (.0, .38, 1.0, .62), (62, 130, 110), 'RIVER')],
            path=[(.02, .50), (.50, .50), (.98, .50)], cams=[((.15, .60), '1'), ((.55, .40), '2'), ((.92, .62), '3')]),
   notes=['Fly 8 m above the river, centred between the walls (never closer than ~25 m to rock).', 'Bend follows the river: still reads LEFT → RIGHT.',
          'Out: climb just over the canyon rim, ground-hugging, view opens → L3.']),
 'L3': dict(title='HIGH ALPINE LAKE · MORNING', time='Morning, mist lifting on frame left',
   path=[(.03, .80), (.50, .76), (.97, .72)], sun=(.03, .06),
   marks=[((.12, .93), 'GRANITE SHORE'), ((.70, .40), 'PINE SHORE / PEAKS')],
   cams=[((.35, .88), '1', 'WATER-LEVEL CHASE · prop-wash ripples'), ((.60, .60), '2', 'TOP-DOWN · aircraft + mirror reflection'),
         ((.85, .80), '3', 'HAND · right hand on stick (match cut)')],
   top=dict(bg=(120, 140, 110), feats=[('band', (.0, .25, 1.0, .80), (40, 90, 150), 'LAKE')],
            path=[(.02, .55), (.98, .52)], cams=[((.30, .70), '1'), ((.60, .52), '2'), ((.85, .65), '3')]),
   notes=['3–5 m above the water, mirror-still lake shows the reflection.', 'Stay over open water; pines only on the far shore.',
          'Out: whip-pan → L4.']),
 'L4': dict(title='GOLDEN WHEAT HILLS · MID-MORNING', time='Mid-morning, warm backlight from frame left',
   path=[(.00, .62), (.50, .55), (.99, .50)], sun=(.03, .05),
   marks=[((.73, .25), 'LONE OAK · LANDMARK'), ((.20, .90), 'WHEAT AT LENS')],
   cams=[((.25, .78), '1', 'WHEAT-LEVEL · prop wash bends the wheat'), ((.62, .45), '2', 'SIDE TRACK · passes the oak on the right'),
         ((.90, .85), '3', 'WIPE · wheat heads sweep the lens → L5')],
   top=dict(bg=(214, 178, 96), feats=[('circle', (.80, .30, .05), (60, 90, 40), 'OAK')],
            path=[(.02, .55), (.98, .50)], cams=[((.25, .70), '1'), ((.62, .40), '2'), ((.90, .70), '3')]),
   notes=['~3 m above the wheat; the prop wash draws a moving wave in the crop.', 'The oak is the only landmark: always on the right half.',
          'Out: wheat-heads wipe across the lens → L5.']),
 'L5': dict(title='PACIFIC COAST · CLIFFTOP · LANDING', time='Mid-morning, sun over the hills on frame left (east); no glare on the sea',
   path=[(.05, .40), (.30, .48), (.72, .70), (.97, .80)], ret=[(.97, .80), (.70, .92), (.40, .80), (.20, .64)], sun=(.27, .17),
   marks=[((.20, .66), 'LANDING SPOT'), ((.60, .86), 'BEACH + SURF'), ((.85, .40), 'PACIFIC')],
   cams=[((.45, .60), '1', 'HEAD-ON OVER SURF · climax'), ((.66, .80), '2', 'TOP-DOWN SLOW-MO · shadow on wet sand'),
         ((.10, .85), '3', 'FINAL WIDE · aircraft, pilot, ocean')],
   top=dict(bg=(90, 130, 70), feats=[('band', (.55, .0, .70, 1.0), (222, 200, 150), 'BEACH'), ('band', (.70, .0, 1.0, 1.0), (40, 90, 150), 'OCEAN'),
            ('circle', (.25, .55, .06), (240, 240, 240), 'LAND')],
            path=[(.02, .40), (.40, .45), (.85, .55)], ret=[(.85, .55), (.60, .75), (.25, .58)], cams=[((.62, .45), '1'), ((.68, .70), '2'), ((.12, .80), '3')]),
   notes=['Out over the surf at ≤ 10 m, turn back, land on the clifftop meadow.', 'Landing: nobody within 40 m; walk up only after the props stop.',
          'End: logo in the clear sky, upper right.']),
}


def f(sz, bold=True):
    return ImageFont.truetype(FB if bold else FM, sz)


def arrow(d, pts, col, w, dash=False):
    for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
        if dash:
            n = int(((x1 - x0) ** 2 + (y1 - y0) ** 2) ** .5 // 22) or 1
            for i in range(0, n, 2):
                a, b = i / n, min((i + 1) / n, 1)
                d.line([(x0 + (x1 - x0) * a, y0 + (y1 - y0) * a), (x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)], fill=col, width=w)
        else:
            d.line([(x0, y0), (x1, y1)], fill=col, width=w)
    (x0, y0), (x1, y1) = pts[-2], pts[-1]
    import math
    a = math.atan2(y1 - y0, x1 - x0); L = w * 4
    d.polygon([(x1, y1), (x1 - L * math.cos(a - .45), y1 - L * math.sin(a - .45)), (x1 - L * math.cos(a + .45), y1 - L * math.sin(a + .45))], fill=col)


def cam(d, x, y, n, r=20):
    d.ellipse([x - r, y - r, x + r, y + r], fill=(20, 20, 20), outline=INK, width=3)
    d.text((x, y), n, font=f(int(r * 1.1)), fill=INK, anchor='mm')


def label(d, x, y, t, sz=22):
    w = d.textlength(t, font=f(sz)) + 16
    d.rectangle([x - w / 2, y - sz * .75, x + w / 2, y + sz * .75], fill=(0, 0, 0, 170))
    d.text((x, y), t, font=f(sz), fill=INK, anchor='mm')


def sheet(k, c):
    W, H = PW + SW + 48, 110 + PH + 16
    s = Image.new('RGB', (W, H), BG)
    d = ImageDraw.Draw(s, 'RGBA')
    d.text((16, 22), f'{k} · {c["title"]}', font=f(40), fill=INK)
    d.text((18, 72), 'film03 step 1.3 · location layout · flight LEFT → RIGHT (westbound) · ≤ 20 m AGL · ' + c['time'], font=f(21, False), fill=DIM)
    ph = Image.open(f'{D}/{k}.png').convert('RGB').resize((PW, PH), Image.LANCZOS)
    s.paste(ph, (16, 110))
    P = lambda p: (16 + p[0] * PW, 110 + p[1] * PH)
    arrow(d, [P(p) for p in c['path']], OR, 9)
    if 'ret' in c:
        arrow(d, [P(p) for p in c['ret']], OR, 6, dash=True)
    sx, sy = P(c['sun'])
    d.ellipse([sx - 26, sy - 26, sx + 26, sy + 26], outline=(255, 214, 90), width=5)
    tw = d.textlength('SUN (EAST)', font=f(22))
    d.rectangle([sx + 28, sy - 17, sx + 44 + tw, sy + 17], fill=(0, 0, 0, 170))
    d.text((sx + 36, sy), 'SUN (EAST)', font=f(22), fill=(255, 214, 90), anchor='lm')
    for p, t in c['marks']:
        label(d, *P(p), t)
    for p, n, _ in c['cams']:
        cam(d, *P(p), n)
    # right column: top view + legend + notes
    x0, y0 = 16 + PW + 16, 110
    d.rectangle([x0, y0, x0 + SW, y0 + SH], fill=c['top']['bg'])
    T = lambda p: (x0 + p[0] * SW, y0 + p[1] * SH)
    for kind, g, col, t in c['top']['feats']:
        if kind in ('rect', 'band'):
            d.rectangle([*T(g[:2]), *T(g[2:])], fill=col)
            cx, cy = T(((g[0] + g[2]) / 2, (g[1] + g[3]) / 2))
        else:
            cx, cy = T(g[:2]); r = g[2] * SW
            d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=col)
        d.text((cx, cy), t, font=f(18), fill=(20, 20, 20) if sum(col) > 400 else INK, anchor='mm')
    arrow(d, [T(p) for p in c['top']['path']], OR, 7)
    if 'ret' in c['top']:
        arrow(d, [T(p) for p in c['top']['ret']], OR, 5, dash=True)
    for p, n in c['top']['cams']:
        cam(d, *T(p), n, r=15)
    d.text((x0 + 10, y0 + 8), 'TOP VIEW (schematic)', font=f(18), fill=(20, 20, 20))
    d.text((x0 + SW - 10, y0 + 8), 'SUN ← EAST', font=f(18), fill=(20, 20, 20), anchor='ra')
    y = y0 + SH + 22
    d.text((x0, y), 'CAMERAS', font=f(24), fill=OR); y += 36
    for _, n, t in c['cams']:
        cam(d, x0 + 16, y + 12, n, r=14); d.text((x0 + 40, y), t, font=f(20, False), fill=INK); y += 34
    y += 10; d.text((x0, y), 'ACTION', font=f(24), fill=OR); y += 36
    for t in c['notes']:
        d.text((x0, y), '· ' + t, font=f(19, False), fill=INK); y += 30
    out = f'{D}/LOC_{k}.jpg'
    s.save(out, quality=90)
    return out


if __name__ == '__main__':
    outs = [sheet(k, c) for k, c in LOCS.items()]
    ims = [Image.open(o) for o in outs]
    w, h = ims[0].size
    allp = Image.new('RGB', (w, h * len(ims)), BG)
    for i, im in enumerate(ims):
        allp.paste(im, (0, i * h))
    allp.resize((w // 2, h * len(ims) // 2)).save(f'{D}/LOC_all.jpg', quality=88)
    print(outs)
