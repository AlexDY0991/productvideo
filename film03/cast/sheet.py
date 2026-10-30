"""Compose the pilot cast sheet for user confirmation: everyday triptych PA1, flying-kit triptych PF2, seated PS2, spec.
python3 film03/cast/sheet.py  →  film03/cast/CAST_ethan_sheet.jpg"""
from PIL import Image, ImageDraw, ImageFont

FB, FM = '/usr/share/fonts/opentype/inter/Inter-Bold.otf', '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
ORANGE, INK, DIM, BG = (255, 122, 26), (245, 245, 242), (170, 170, 168), (28, 28, 30)
IW, IH, PAD, HEAD = 1280, 720, 16, 110
W, H = PAD * 3 + IW * 2, HEAD + 2 * (IH + 50) + PAD
s = Image.new('RGB', (W, H), BG); d = ImageDraw.Draw(s)
d.text((PAD + 4, 22), 'ETHAN  ·  PILOT CAST SHEET', font=ImageFont.truetype(FB, 44), fill=INK)
d.text((PAD + 6, 74), 'film03 step 1.2  ·  Higgsfield triptychs (everyday / flying kit) + seated in Dream Pro (from the confirmed 3D prop plate)',
       font=ImageFont.truetype(FM, 22), fill=DIM)
cells = [('PA1', 'A · EVERYDAY: FACE / FRONT FROM NECK DOWN / BACK'), ('PF2', 'B · FLYING KIT: COOLFLY AIRBAG VEST, HELMET, GLOVES'),
         ('PS2', 'C · SEATED: RIGHT HAND ON RIGHT STICK, LEFT ON ARMREST, HARNESS ON')]
for i, (f, cap) in enumerate(cells):
    x, y = PAD + (i % 2) * (IW + PAD), HEAD + (i // 2) * (IH + 50)
    s.paste(Image.open(f'film03/cast/{f}.png').convert('RGB').resize((IW, IH), Image.LANCZOS), (x, y))
    d.text((x + 4, y + IH + 10), cap, font=ImageFont.truetype(FB, 24), fill=INK)
x, y = PAD * 2 + IW + 30, HEAD + IH + 50 + 10
spec = [('ETHAN', True), ('Looks 40. American, lean and fit, ~1.82 m. Short dark-brown hair,', False),
        ('greying temples, short stubble. Self-made founder, outdoors on weekends.', False), ('', False),
        ('EVERYDAY (FIXED)', True), ('Charcoal merino crew-neck, dark indigo jeans, tan suede chukkas,', False),
        ('steel pilot chronograph on brown leather, LEFT wrist. No logos.', False), ('', False),
        ('FLYING KIT (FIXED)', True), ('Black CoolFly airbag vest: padded collar, chest buckle, hip straps,', False),
        ('small logo on his left chest, large logo across the back.', False),
        ('Matte white open-face helmet, clear flip-up visor. Black leather gloves.', False), ('', False),
        ('IN THE SEAT', True), ('Low and slightly reclined; legs inside the tub, hidden by the side panel.', False),
        ('Black four-point harness over the vest. RIGHT hand on the RIGHT stick,', False),
        ('LEFT hand on the LEFT armrest. Helmet below the cage roof.', False)]
for t, bold in spec:
    d.text((x, y), t, font=ImageFont.truetype(FB if bold else FM, 28 if bold else 24), fill=ORANGE if bold else INK)
    y += 38 if t else 14
s.save('film03/cast/CAST_ethan_sheet.jpg', quality=90); print(s.size)
