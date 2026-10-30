#!/usr/bin/env python3
"""Seating test: pilot scale and posture in the Dream, single side-stick on the right (user note 2026-10-30)."""
import sys
sys.path.insert(0, 'film03/prompts')
from board import resolve, S, LOOK
import subprocess

SEAT = ('She sits low and slightly reclined in the seat deep inside the roll cage, legs stretched forward, exactly like the pilot in @ref_pilot_seated; '
        'the aircraft and the person are in the same proportion as in @ref_dream_flying: the top of her helmet stays well below the top of the cage, the cage is large around her. '
        'Her RIGHT hand holds the single black side-stick mounted at the right side next to her right thigh; her left hand rests on the left armrest. '
        'No steering wheel, no yoke, no second stick, never both hands on one stick.')
MAYA = 'The pilot is the woman in @char_maya, olive-green flight jacket, grey hoodie, white helmet with the iridescent visor.'
T = {
 'T1': f'Side three-quarter view, eye level, of the white CoolFly Dream parked on the flat white cracked clay of a Mojave dry lake at sunrise, identical to @ref_dream_34front. {SEAT} {MAYA} {LOOK}',
 'T2': f'Front three-quarter tracking shot of the white CoolFly Dream in flight, identical to @ref_dream_flying, about eight metres above a turquoise river winding between towering red sandstone canyon walls, warm morning sun, eight propellers as translucent discs. {SEAT} {MAYA} {LOOK}',
 'T3': f'First-person point of view from the pilot seat, exactly like @ref_pov: the two black cage tubes rising in a V, the small screen in the lower centre, two arms with motors left and right; her RIGHT gloved hand on the single side-stick at the lower right of the frame; ahead, ten metres below, Pacific surf and golden cliffs racing toward camera at speed. {LOOK}',
}
for k, p in T.items():
    refs, prompt = resolve([], p)
    cmd = ['python3', 'tools/jm.py', S, 'img', k, '--title', f'seat test {k}', '--prompt', prompt]
    for r in refs:
        cmd += ['--ref', r]
    subprocess.run(cmd, check=True)
