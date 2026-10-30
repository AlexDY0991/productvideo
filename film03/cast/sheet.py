"""Compose the Maya cast sheet (triptych MA1 + seated MS3 + wardrobe spec) for user confirmation.
python3 film03/cast/sheet.py  →  film03/cast/CAST_maya_sheet.jpg"""
from PIL import Image, ImageDraw, ImageFont

FB, FM = '/usr/share/fonts/opentype/inter/Inter-Bold.otf', '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
ORANGE, INK, DIM, BG = (255, 122, 26), (245, 245, 242), (170, 170, 168), (28, 28, 30)
IW, IH, PAD, HEAD, SIDE = 1600, 900, 16, 110, 900
W, H = PAD * 3 + IW + SIDE, HEAD + 2 * (IH + 50) + PAD
s = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(s)
d.text((PAD + 4, 22), 'MAYA  ·  PILOT CAST SHEET', font=ImageFont.truetype(FB, 44), fill=INK)
d.text((PAD + 6, 74), 'film03 step 1.2  ·  Higgsfield triptych + seated in Dream Pro (from the confirmed 3D prop plate)',
       font=ImageFont.truetype(FM, 22), fill=DIM)
for i, (f, cap) in enumerate([('MA1', 'A · TRIPTYCH: FACE / FRONT FROM NECK DOWN / BACK, SAME SCALE'),
                              ('MS3', 'B · SEATED: RIGHT HAND ON RIGHT SIDE-STICK, LEFT HAND ON LEFT ARMREST')]):
    y = HEAD + i * (IH + 50)
    s.paste(Image.open(f'film03/cast/{f}.png').convert('RGB').resize((IW, IH), Image.LANCZOS), (PAD, y))
    d.text((PAD + 4, y + IH + 10), cap, font=ImageFont.truetype(FB, 24), fill=INK)
x, y = PAD * 2 + IW + 24, HEAD + 10
spec = [('MAYA', True), ('34, American. Natural athletic build, ~1.70 m.', False),
        ('Dark-blond low ponytail, loose strands.', False), ('Light freckles, hazel eyes, minimal make-up.', False),
        ('Small silver stud earrings.', False), ('', False),
        ('WARDROBE (FIXED)', True), ('Olive-green MA-1 flight jacket,', False), ('no patches, no logos.', False),
        ('Heather-grey crew-neck sweatshirt.', False), ('Slim black technical trousers.', False),
        ('Brown leather lace-up ankle boots.', False), ('Black analog watch, LEFT wrist.', False), ('', False),
        ('FLYING KIT', True), ('Matte white open-face helmet,', False), ('clear flip-down visor, no graphics.', False),
        ('Thin black leather gloves.', False), ('', False),
        ('IN THE SEAT', True), ('Sits low, slightly reclined,', False), ('legs forward into the footwell.', False),
        ('Helmet below the roof of the cage.', False), ('RIGHT hand on the RIGHT side-stick.', False),
        ('LEFT hand on the LEFT armrest.', False), ('Black harness over the jacket.', False)]
for t, bold in spec:
    d.text((x, y), t, font=ImageFont.truetype(FB if bold else FM, 32 if bold else 28), fill=ORANGE if bold else INK)
    y += 46 if t else 22
s.save('film03/cast/CAST_maya_sheet.jpg', quality=90); print(s.size)
