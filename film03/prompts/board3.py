#!/usr/bin/env python3
"""film03 v3 storyboard stills (BRIEF-v3.md section 5), one per shot, built only from confirmed assets.

Usage: python3 film03/prompts/board3.py [create|run|wait] [KEY ...]
Assets (film03 canvas): PA1 everyday triptych, PF4 flying-kit triptych, PS5 seated in Dream Pro, VD1 pilot vest,
prop_glb_* cockpit renders, plate_* per-shot 3D plates (render via film03/assets/glb/probe.mjs), L1–L5B location plates.
Rule from the asset round: when the aircraft is the subject, edit a 3D plate of it instead of letting the model draw it.
"""
import subprocess, sys

sys.path.insert(0, 'film03/prompts')
from board import resolve  # noqa: E402

S = 'film03/jimeng-state.json'

# Continuity bible (BRIEF-v3 §2), repeated verbatim in every prompt.
ETHAN = ('The pilot is Ethan, the man in @PA1 and @PF4: looks 40, short dark-brown hair greying at the temples, short stubble. '
         'Flying kit exactly as in @PF4: the black-and-graphite CoolFly mesh pilot vest with thin orange piping (small CoolFly logo on '
         'his left chest, large across the back) over a charcoal crew-neck sweater, dark jeans, tan suede chukka boots, steel pilot '
         'watch on his left wrist, white open-face helmet with a clear visor, thin black leather gloves.')
DREAM = ('The aircraft is the CoolFly Dream Pro exactly as in @prop_glb_hero and @PS5: pearl-white fairings, black tubular roll cage, '
         'four carbon arms in an X with two motors and two-blade propellers each (eight props), green arm LEDs, white parachute pod on '
         'the rear of the roof, three white belly airbags, two black skids with spring ends; no numbers on the body.')
COCKPIT = ('He sits low and slightly reclined, legs inside the tub, black four-point harness over the vest; his RIGHT hand on the '
           'single side-stick on the RIGHT rail, his LEFT hand on the LEFT armrest; never a stick on the left, never two hands on it, '
           'no yoke, no wheel; the helmet stays below the top of the roll cage.')
LAKE = ('Location exactly as in @L1: the Mojave dry lake at sunrise, flat white cracked clay to the horizon, low brown-violet '
        'mountains, clear sky with a pink-amber glow; the sun is low on the LEFT horizon; long shadows fall to the right.')
LOOK = ('Photoreal film still from a premium commercial, 16:9, cinema camera, natural light only, true skin texture, fine grain, '
        'no text, no watermark, no birds, no clouds below the horizon.')

B = {
 'D01': ([], f'{LAKE} Low ground-level shot at dawn: the driver door of a white pickup truck swings open on the left of frame and one '
             f'tan suede chukka boot with dark jeans steps down onto the white cracked clay, a puff of dust; warm low light from the left. '
             f'The man is Ethan in his everyday clothes from @PA1 (charcoal sweater, dark jeans, tan chukkas), only his legs and boot in '
             f'frame. {LOOK}'),
 'D02': ([], f'{LAKE} Close-up, chest height: Ethan zips up the CoolFly pilot vest from @VD1 over his charcoal sweater, the small CoolFly '
             f'logo (white letters, orange F, as in @ref_logo_rev) on his left chest comes into frame; the white aircraft out of focus '
             f'behind him; warm sunrise light from the left. {ETHAN} {LOOK}'),
 'D03': (['prop_glb_seat'], f'Close-up inside the cockpit of the aircraft from @PS5 and @prop_glb_seat: Ethan\'s gloved hands click the '
             f'round black buckle of the four-point harness shut over the CoolFly vest at his lap; the light-grey seat and black cage '
             f'tubes around; pale dawn light from the left. {ETHAN} {LOOK}'),
 'D04': ([], f'{LAKE} Extreme close-up of Ethan\'s face in the white open-face helmet, seated in the cockpit as in @PS5: he pulls the '
             f'clear visor down; his face stays fully visible through the clear visor, eyes calm and focused, looking ahead to the right; '
             f'a black cage tube soft in the foreground; sunrise glow from the left. {ETHAN} {LOOK}'),
 'D05': (['ref_pro2026'], f'{LAKE} Macro close-up of one of the aircraft\'s black motor pods on a carbon arm, exactly as in @prop_glb_hero '
             f'and @ref_pro2026: its green status LED lights up and the two-blade carbon propeller starts to turn, slight motion blur, '
             f'fine white dust stirring on the clay below; sunrise light from the left. {LOOK}'),
 'D06': (['plate_d06'], f'Photo edit of @plate_d06: keep the aircraft exactly as rendered (same shape, angle and every part), make it a '
             f'real photograph and place it into the location of @L1. {LAKE} Low wide shot from ground level: the aircraft lifts off and '
             f'hovers 3 m above its dark landing mat, nose pointing RIGHT, a ring of white dust blasting outward along the clay; the sun '
             f'just above the horizon on the LEFT with a soft flare; the small white pickup far in the background on the left, about 60 m '
             f'away; Ethan visible seated in the cockpit. {DREAM} {COCKPIT} {ETHAN} {LOOK}'),
 'D07': (['prop_glb_stick'], f'Close-up from beside the seat, like @prop_glb_stick: Ethan\'s RIGHT gloved hand pushes the single black '
             f'side-stick on the RIGHT rail forward, firm and decisive; beyond the '
             f'cage tubes the white lake bed starts to blur with speed; warm low light from the left. {ETHAN} {COCKPIT} {LOOK}'),
 'D08': (['prop_glb_pov'], f'Photo edit of @prop_glb_pov: keep the pilot\'s-eye view of the cockpit exactly as rendered (the two V roll '
             f'bars ahead, the left armrest panel, the right side-stick, the seat sides), make it a real photograph in flight. {LAKE} '
             f'Point of view of the pilot flying FAST about 3 m above the white cracked clay: the ground streaks past in motion blur, the '
             f'aircraft\'s shadow races ahead on the clay to the right, the mountains on the horizon; his RIGHT gloved hand on the right '
             f'side-stick in the lower right of frame, his left gloved hand resting on the left armrest panel. The sun is behind-left, '
             f'not in frame. {LOOK}'),
 'D09': (['plate_d09'], f'Photo edit of @plate_d09: keep the aircraft exactly as rendered (same shape, angle and every part), make it a '
             f'real photograph. {LAKE} FPV drone chase shot from low behind: the aircraft speeds away and slightly RIGHT about 3 m above '
             f'the white cracked clay, a long trail of fine dust behind it, its long shadow on the clay, strong motion blur on the ground, '
             f'the sun low on the LEFT; Ethan\'s white helmet visible in the seat. {DREAM} {LOOK}'),
 'D10': ([], f'{LAKE} Close-up of Ethan in flight, seen from the front-right outside the cage: under the clear visor he breaks into a '
             f'wide, genuine grin, eyes crinkled; the black harness straps and CoolFly vest; the white lake bed and mountains rushing '
             f'past behind in motion blur; warm low light from the left. {ETHAN} {COCKPIT} {LOOK}'),
}


# fixes after the S1 review (edits keep everything that passed)
B.update({
 'D02b': ([], f'Precise edit of @D02. Keep everything exactly the same (Ethan, his helmet, vest, hands, light, lake bed, mountains) '
              f'except one thing: remove the small propeller airplane on the right completely; the lake bed there is empty white '
              f'cracked clay to the horizon. No other aircraft anywhere. {LOOK}'),
 'D08b': (['prop_glb_pov'], f'Precise edit of @D08. Keep the cockpit, roll bars, arms, propellers, both gloved hands (right on the right '
              f'side-stick, left on the left armrest panel), the motion blur and the lake bed exactly the same. Two changes: (1) the '
              f'pilot\'s legs in the footwell wear dark indigo jeans down to tan suede chukka boots, no bare skin; (2) the sun is BEHIND '
              f'the pilot, not in frame: remove the sun glow at the left horizon, the sky is clear morning blue with a soft warm haze, '
              f'the light comes from behind and casts the aircraft\'s shadow ahead on the clay. {LOOK}'),
 'D09b': (['plate_d09'], f'Precise edit of @D09. Keep everything exactly the same (the aircraft, its angle, the dust trail, the motion '
              f'blur, the lake bed, the sky) except the three belly airbags under the aircraft: make them flat, angular, faceted white '
              f'pods exactly as in @plate_d09 and @prop_glb_hero, not round balls. {LOOK}'),
 'D10b': ([], f'Precise edit of @D10. Keep everything exactly the same (Ethan\'s grin, his face, helmet, vest, harness, hands, the '
              f'aircraft, the background and light) except the helmet visor: it is flipped DOWN over his face, a clear transparent '
              f'visor through which his whole grinning face stays fully visible, with a faint reflection of the sky on it. {LOOK}'),
})

if __name__ == '__main__':
    act, keys = (sys.argv[1] if len(sys.argv) > 1 else 'create'), (sys.argv[2:] or [k for k in B if len(k) == 3])
    if act == 'create':
        for k in keys:
            refs, prompt = resolve(*B[k])
            cmd = ['python3', 'tools/jm.py', S, 'img', k, '--title', f'board3 {k}', '--prompt', prompt, '--model', 'seedream_5.0_pro']
            for r in refs:
                cmd += ['--ref', r]
            for attempt in range(3):
                if subprocess.run(cmd).returncode == 0:
                    break
    elif act == 'run':
        subprocess.run(['python3', 'tools/jm.py', S, 'run'] + keys, input='y\n' * 5, text=True)
    elif act == 'wait':
        subprocess.run(['python3', 'tools/jm.py', S, 'wait', 'film03/board3'] + keys)
