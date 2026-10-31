"""Storyboard sheet for one generation scene of film03 v3.
python3 film03/board3/sheet.py S1  →  film03/board3/BOARD_S1.jpg (frames listed in FRAMES, newest fix wins)."""
import sys
from PIL import Image, ImageDraw, ImageFont

FB, FM = '/usr/share/fonts/opentype/inter/Inter-Bold.otf', '/usr/share/fonts/opentype/inter/Inter-Medium.otf'
OR, INK, DIM, BG = (255, 122, 26), (245, 245, 242), (170, 170, 168), (28, 28, 30)
# shot: (file, time, picture, move / transition) — English on the sheet, matches BRIEF-v3 §5
FRAMES = {
 'S1': ('L1 MOJAVE DRY LAKE · 0–14 s · arrival, gear-up, lift-off, first full speed', [
   ('D01', 'D01', '0.0–1.5', 'Dawn. Pickup door opens, suede boot on the cracked clay', 'Low static · black open, wind, door'),
   ('D02', 'D02b', '1.5–3.0', 'Zips up the CoolFly vest, chest logo into frame', 'Slow push · zip'),
   ('D03', 'D03', '3.0–4.0', 'In the seat: four-point harness buckle clicks shut', 'Static · click'),
   ('D04', 'D04', '4.0–5.0', 'Pulls the clear visor down, eyes ahead', 'Slow push · visor snap'),
   ('D05', 'D05', '5.0–6.0', 'Green motor LED on, coaxial props spin up', 'Macro · motors start'),
   ('D06', 'D06', '6.0–8.0', 'Lift-off: dust ring, sun on the left horizon, pickup 60 m away', 'L1 cam 1 · push · rising tone'),
   ('D07', 'D07', '8.0–9.0', 'RIGHT hand pushes the RIGHT side-stick forward', 'Snap push'),
   ('D08', 'D08b', '9.0–11.0', 'BEAT. POV skimming the clay, shadow ahead right', 'L1 cam 3 · forward rush · hit'),
   ('D09', 'D09b', '11.0–12.5', 'FPV chase from low behind, travelling right', 'L1 cam 2 · follow'),
   ('D10', 'D10b', '12.5–14.0', 'Wide grin behind the clear visor', 'CU · out: hand match cut → S2'),
 ]),
}

scene = sys.argv[1]
title, shots = FRAMES[scene]
IW, IH, PAD, CAP, HEAD = 1000, 562, 16, 74, 100
W = PAD * 3 + IW * 2
H = HEAD + ((len(shots) + 1) // 2) * (IH + CAP) + PAD
s = Image.new('RGB', (W, H), BG)
d = ImageDraw.Draw(s)
d.text((PAD + 4, 20), f'FILM03 v3 · STORYBOARD {scene}', font=ImageFont.truetype(FB, 40), fill=INK)
d.text((PAD + 6, 68), title, font=ImageFont.truetype(FM, 22), fill=DIM)
for i, (shot, f, t, pic, mv) in enumerate(shots):
    x, y = PAD + (i % 2) * (IW + PAD), HEAD + (i // 2) * (IH + CAP)
    s.paste(Image.open(f'film03/board3/{f}.png').convert('RGB').resize((IW, IH), Image.LANCZOS), (x, y))
    d.rectangle([x, y, x + 150, y + 44], fill=(0, 0, 0))
    d.text((x + 10, y + 6), shot, font=ImageFont.truetype(FB, 30), fill=OR)
    d.text((x + 4, y + IH + 8), f'{t} s · {pic}', font=ImageFont.truetype(FB, 22), fill=INK)
    d.text((x + 4, y + IH + 40), mv, font=ImageFont.truetype(FM, 20), fill=DIM)
s.save(f'film03/board3/BOARD_{scene}.jpg', quality=88)
print(s.size)
