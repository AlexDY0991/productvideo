#!/usr/bin/env python3
"""Storyboard v2 "OPEN SKY" (BRIEF-v2-OpenSky.md): five Western landscapes in one morning, flight always LEFT->RIGHT.

Usage: python3 film03/prompts/board2.py [create|run|wait] [KEY ...]
Seating follows the approved test frames T1-T3: pilot low and reclined deep in the cage, helmet top below the cage
top, RIGHT hand on the single side-stick by the right thigh.
"""
import subprocess, sys
sys.path.insert(0, 'film03/prompts')
from board import resolve, S, LOOK

DREAM = ('The aircraft is identical to @ref_dream_flying and @ref_dream_34front: white front body with the CoolFly wordmark, black tubular roll cage, '
         'four carbon arms in an X layout, two motors per arm, eight two-blade propellers.')
SEAT = ('The pilot sits low and slightly reclined deep inside the cage as in @ref_pilot_seated, the top of her helmet well below the top of the cage, '
        'her RIGHT hand on the single black side-stick next to her right thigh, never two hands on a stick, no steering wheel.')
MAYA = 'The pilot is the woman in @char_maya: olive-green flight jacket, grey hoodie, white helmet with an iridescent visor.'
POV = ('First-person point of view from the pilot seat exactly like @ref_pov: two black cage tubes rising in a V, the small screen low in the centre, '
       'a carbon arm with a motor on each side; her RIGHT gloved hand on the side-stick at the lower right.')
FLY = 'Flying low, never more than twenty metres above the ground or water; no clouds below, no birds.'
DIR = 'Travelling LEFT TO RIGHT across the frame.'
LAKE = 'A Mojave dry lake bed of flat white cracked clay at sunrise, low brown-violet mountains on the horizon, as in @loc_base.'
CANYON = 'A narrow red sandstone canyon with towering walls and a turquoise river at the bottom, warm morning sun.'
ALPINE = 'A clear turquoise Sierra alpine lake with granite boulders and dark pine forest on the shore, mountains behind, crisp morning light.'
PRAIRIE = 'A rolling golden wheat prairie, low sun backlighting the grain, long shadows.'
COAST = 'The Pacific coast of California: golden cliffs, a wide sand beach, white surf, the low sun over the ocean.'
SHOT = lambda s: f'{s} {LOOK}'

B = {
 'C01': SHOT(f'{POV} The aircraft is still on the ground: ahead, the flat white dry lake at pre-dawn, a pink glow on the left horizon. {LAKE}'),
 'C02': SHOT(f'Extreme close-up: the clear iridescent visor of her white helmet snaps down over her eyes; freckles, focused, pre-dawn light, the dry lake behind her at eye level. {MAYA}'),
 'C03': SHOT(f'Macro close-up of one black motor on a carbon arm, its green status light glowing, the two-blade propeller starting to spin into a blur; white clay dust lifting. {LAKE} {DREAM}'),
 'C04': SHOT(f'Low wide shot at ground level: the aircraft lifts two metres off a dark landing mat, a ring of white dust blasting outward, the sun breaking the horizon behind it on the left. {LAKE} {DREAM} {SEAT} {MAYA}'),
 'C05': SHOT(f'Close-up from the left inside the cage: her gloved RIGHT hand pushes the single black side-stick forward next to her right thigh, dust streaming past outside. {SEAT} {MAYA}'),
 'C06': SHOT(f'{POV} Racing two metres above the white cracked clay at high speed, motion blur on the ground, the aircraft\'s shadow running ahead. {LAKE}'),
 'C07': SHOT(f'Low FPV chase from behind and below: the aircraft streaks LEFT TO RIGHT one metre above the white clay, dust trail, golden sunrise. {LAKE} {DREAM} {SEAT} {MAYA}'),
 'C08': SHOT(f'Close-up through the cage: she grins wide behind the visor, wind, warm sun from the left. {MAYA} {SEAT}'),
 'C09': SHOT(f'Extreme close-up of her iridescent visor; reflected in it, red sandstone canyon walls rushing past. {MAYA}'),
 'C10': SHOT(f'FPV chase from behind: the aircraft flies eight metres above the turquoise river between the canyon walls, {DIR} {CANYON} {DREAM} {SEAT} {MAYA} {FLY}'),
 'C11': SHOT(f'{POV} Inside the canyon: the red rock wall rushes past very close on the right, the turquoise river below, speed blur. {CANYON}'),
 'C12': SHOT(f'Tight side tracking shot alongside the canyon wall, the aircraft {DIR.lower()} the striped red rock filling the background, eight metres above the river. {CANYON} {DREAM} {SEAT} {MAYA}'),
 'C13': SHOT(f'Wide shot from just above the canyon rim: the aircraft skims over the rim edge a few metres above the rock and the landscape opens up into a vast high plateau with distant snowy mountains, {DIR} {DREAM} {SEAT} {MAYA} {FLY}'),
 'C14': SHOT(f'Tracking shot: the aircraft flies five metres above the glassy turquoise lake, prop wash rippling the water beneath it, {DIR} {ALPINE} {DREAM} {SEAT} {MAYA} {FLY}'),
 'C15': SHOT(f'Close-up from the left inside the cage: her RIGHT gloved hand eases the single side-stick, the alpine lake and pines sliding past outside. {SEAT} {MAYA}'),
 'C16': SHOT(f'Straight top-down drone shot: the small white aircraft and its perfect mirror reflection on the still turquoise lake, a ripple trail behind it, {DIR} {ALPINE} {DREAM}'),
 'C17': SHOT(f'Low tracking shot: the aircraft skims four metres above golden wheat, its prop wash pressing a moving wave into the grain, sun flare behind, {DIR} {PRAIRIE} {DREAM} {SEAT} {MAYA} {FLY}'),
 'C18': SHOT(f'Close-up: she laughs out loud inside the white helmet, golden backlight, wheat blurred beyond the cage. {MAYA} {SEAT}'),
 'C19': SHOT(f'Extreme close-up: golden wheat heads whip across the lens in a blur, the low sun flaring through them. {PRAIRIE}'),
 'C20': SHOT(f'Wide tracking shot: the aircraft flies ten metres above the white surf along a wide beach, golden cliffs on the right, {DIR} {COAST} {DREAM} {SEAT} {MAYA} {FLY}'),
 'C21': SHOT(f'FPV shot on the beach: the aircraft sweeps past very close to the camera, propellers as translucent discs, sand and sea spray in the air, motion blur. {COAST} {DREAM} {SEAT} {MAYA}'),
 'C22': SHOT(f'{POV} Racing three metres above breaking surf straight toward the low sun, spray, glittering water. {COAST}'),
 'C23': SHOT(f'Crash push-in with heavy motion blur toward her helmet and visor, the ocean and sun flaring behind. {MAYA} {SEAT}'),
 'C24': SHOT(f'Straight top-down slow-motion shot over mirror-wet sand where a thin wave has just pulled back: the crisp shadow of the multicopter glides across it, an X-shaped shadow with four arms and eight round propeller discs around a small central cage, exactly the top-view shape of @ref_dream_34front, never an aeroplane shape; the sky reflected in the wet sand. {COAST}'),
 'C25': SHOT(f'Telephoto head-on shot: the aircraft flies straight at the camera three metres above the shining sea, the sun bursting behind it, spray. {COAST} {DREAM} {SEAT} {MAYA} {FLY}'),
 'C26': SHOT(f'Fast side whip pan catching the aircraft passing low over the surf, strong motion blur, {DIR} {COAST} {DREAM}'),
 'C27': SHOT(f'Close-up: she laughs out loud with her head tipped back inside the white helmet, eyes crinkled, both shoulders relaxed, ocean light flaring; her right hand stays low on the side-stick out of frame. {MAYA} {SEAT}'),
 'C28': SHOT(f'{POV} Skimming the crest of a rolling wave, turquoise water and white foam rushing under the arms. {COAST}'),
 'C29': SHOT(f'Macro close-up of a gloved RIGHT hand resting on the black side-stick next to a thigh in black trousers, the sleeve of an olive-green flight jacket at the wrist, sunlight glinting on the knuckles, the ocean blurred beyond the cage. Only the hand, cuff and stick in frame, no face.'),
 'C30': SHOT(f'Extreme wide aerial shot: an endless golden coastline and the tiny white aircraft flying low along the surf line, {DIR} {COAST} {DREAM}'),
 'C31': SHOT(f'Tracking shot: the aircraft skims four metres above a green grassy clifftop, the ocean beyond, {DIR} {COAST} {DREAM} {SEAT} {MAYA} {FLY}'),
 'C32': SHOT(f'Wide shot: the aircraft settles onto the grassy clifftop, grass flattened in a ring, propellers slowing; nobody else around; the Pacific behind. {COAST} {DREAM} {SEAT} {MAYA}'),
 'C33': SHOT(f'Medium close-up: seated in the parked aircraft, she pushes the visor up, breathless and beaming, and looks straight into the camera. {MAYA} {SEAT}'),
 'C34': SHOT(f'Close-up: a gloved RIGHT hand in an olive-green jacket sleeve lets go of the black side-stick, the fingers relaxing; the propeller blades still and the ocean beyond. Only the hand, cuff and stick in frame. Wardrobe is the olive-green jacket of @char_maya, never plaid, never a vest.'),
 'C35': SHOT(f'Extreme wide shot from the clifftop: the white aircraft parked on green grass, the woman standing beside it holding her helmet, the vast Pacific and the morning sun, clear sky in the upper third. {COAST} {DREAM} {MAYA}'),
}

if __name__ == '__main__':
    act, keys = (sys.argv[1] if len(sys.argv) > 1 else 'create'), (sys.argv[2:] or list(B))
    if act == 'create':
        for k in keys:
            refs, prompt = resolve([], B[k])
            cmd = ['python3', 'tools/jm.py', S, 'img', k, '--title', f'board2 {k}', '--prompt', prompt]
            for r in refs:
                cmd += ['--ref', r]
            for attempt in range(3):
                if subprocess.run(cmd).returncode == 0:
                    break
    elif act == 'run':
        subprocess.run(['python3', 'tools/jm.py', S, 'run'] + keys, input='y\n' * 5, text=True)
    elif act == 'wait':
        subprocess.run(['python3', 'tools/jm.py', S, 'wait', 'film03/board'] + keys)
