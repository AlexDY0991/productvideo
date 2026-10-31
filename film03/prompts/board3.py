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

# v2 of the aircraft shots (user: D06/D10 aircraft wrong): every frame is a photo edit of a composited 3D plate
# (film03/board3/plates.json → composite.py → pc_dNN). The edit may only add people/dust/light; the aircraft must not change.
LOCK = ('Photo edit of @{p}. The aircraft in @{p} is a 3D render of the real CoolFly Dream Pro and is EXACT: keep its shape, '
        'proportions, position, angle and every part exactly as in @{p} — every tube of the black roll cage and where it bends, the '
        'pearl-white fairings and their outlines, the grey CoolFly side panel, the seat, the side-stick, the armrest panel, arms, motors, '
        'propellers, the white parachute pod, the faceted white belly airbags, the skids. Do not add, remove, move, reshape or redesign '
        'any part of it; only make its materials look like a real photograph (real reflections, scuffs, dust). ')
def lock(p):
    return LOCK.format(p=p)
B.update({
 'D03c': (['pc_d03'], lock('pc_d03') + f'Add: Ethan seated low in the seat, seen from above the right rail; his gloved hands click the '
              f'round black buckle of the four-point harness shut at his lap, the black shoulder straps over the CoolFly vest; his RIGHT '
              f'hand then goes to the side-stick. Background: the white lake bed at dawn, soft. {ETHAN} {LOOK}'),
 'D04c': (['pc_d04'], lock('pc_d04') + f'Add: Ethan seated, his head in the white open-face helmet in front of the CoolFly headrest, '
              f'seen through the cage tubes from the front-right; he pulls the clear visor down, his face fully visible, calm, eyes '
              f'looking ahead to the right; sunrise glow from the left. {ETHAN} {LOOK}'),
 'D05c': (['pc_d05'], lock('pc_d05') + f'Add only: the green LED glows, both two-blade propellers start to spin with slight motion blur, '
              f'a little fine white dust lifts off the clay far below; warm sunrise light from the left. No people. {LOOK}'),
 'D06c': (['pc_d06'], lock('pc_d06') + f'{LAKE} Add: Ethan seated in the cockpit (helmet, vest, harness), small at this distance; all '
              f'eight propellers as translucent spinning discs; a ring of white dust blasting outward along the clay under the aircraft; '
              f'keep ONE long soft shadow of the aircraft on the clay toward the right; the small white pickup truck far away on the LEFT, '
              f'about 60 m from the mat; the sun on the left horizon with a soft flare. {ETHAN} {LOOK}'),
 'D07c': (['pc_d07'], lock('pc_d07') + f'Add: Ethan seated, seen over the right rail; his RIGHT gloved hand grips the vertical black '
              f'side-stick on the RIGHT rail and pushes it forward, his forearm along the rail; his left hand on the far armrest panel; '
              f'beyond the cage the white lake bed starts to streak with speed. {ETHAN} {COCKPIT} {LOOK}'),
 'D08c': (['pc_d08'], lock('pc_d08') + f'This is the pilot\'s own point of view in flight. Add: his RIGHT gloved hand on the right '
              f'side-stick (lower right), his LEFT gloved hand resting on the left armrest panel (lower left), his legs in dark jeans and tan '
              f'suede boots going forward into the footwell; propellers as spinning discs; the white cracked clay streaks past about 3 m '
              f'below in strong motion blur, the aircraft\'s shadow racing ahead on the clay; the sun is BEHIND, not in frame. {LOOK}'),
 'D09c': (['pc_d09'], lock('pc_d09') + f'FPV chase from low behind at speed. Add: Ethan\'s white helmet visible in the seat; propellers '
              f'as spinning discs; a trail of fine white dust behind the aircraft; strong motion blur on the clay; keep ONE shadow of the '
              f'aircraft on the clay (remove any second shadow). The sun is behind the camera. {ETHAN} {LOOK}'),
 'D10c': (['pc_d10'], lock('pc_d10') + f'Add: Ethan seated low in the seat in flight, seen from the front-right through the cage: under the '
              f'clear visor (flipped DOWN, face fully visible) he breaks into a wide genuine grin, eyes crinkled; harness over the CoolFly '
              f'vest; his RIGHT gloved hand on the side-stick on the near rail; the background lake bed and mountains streak in motion blur. '
              f'{ETHAN} {COCKPIT} {LOOK}'),
})

# v3 (CG-locked aircraft): the image model only turns the grey seated mannequin into Ethan; film03/board3/finish.py then lays the
# exact 3D render of the aircraft (with a hole where the pilot is in front) back over the result.
SWAP = ('Photo edit of @{p}. Replace ONLY the plain grey mannequin seated in the aircraft with Ethan, the man in @PF4, in exactly the '
        'same pose, position, size and angle as the mannequin (sitting low and reclined, head against the headrest, RIGHT hand on the '
        'side-stick, LEFT hand on the left armrest, legs forward inside the footwell). He wears the flying kit from @PF4: white open-face '
        'helmet with the clear visor down (face fully visible), the black-and-graphite CoolFly mesh vest with thin orange piping over a '
        'charcoal sweater, black four-point harness over the vest, thin black leather gloves, dark jeans, tan suede boots. Keep '
        'everything else in the image exactly as it is: the same framing and crop, the aircraft, the background, the light. Do not zoom '
        'out, do not move the camera, do not redraw the aircraft. Photoreal, true skin texture, no text. ')
for k, extra in {
    'd03': 'His gloved hands are clicking the round harness buckle shut at his lap.',
    'd04': 'He is pulling the clear visor down; calm, focused, eyes ahead to the right.',
    'd06': 'He is small at this distance. Add only a ring of white dust blowing outward along the clay under the hovering aircraft.',
    'd07': 'His RIGHT gloved hand grips the vertical black side-stick and pushes it forward.',
    'd08': 'This is his own point of view: only his forearms, gloved hands and legs are visible; the ground streaks past in motion blur.',
    'd09': 'Seen from behind and below: only the back of his white helmet and shoulders are visible in the seat.',
    'd10': 'He breaks into a wide genuine grin under the clear visor, eyes crinkled.',
}.items():
    B[k.upper() + 'm'] = ([], SWAP.format(p='pm_' + k) + extra)

B['D04n'] = ([], SWAP.format(p='pm_d04b') + 'Front view through the cage: he pulls the clear visor down over his face; his whole face '
             'stays visible through the clear visor, calm and focused, eyes looking straight ahead past the camera.')
B['D08n'] = ([], SWAP.format(p='pm_d08') + 'This is HIS OWN point of view from inside the helmet, looking forward. Of the grey mannequin '
             'limbs: the OUTER left and right ones are his ARMS — charcoal sweater sleeves ending in thin black leather gloves, the RIGHT '
             'glove gripping the side-stick on the right, the LEFT glove resting on the left armrest panel; the two INNER ones are his '
             'LEGS in dark indigo jeans running forward down into the footwell, his tan suede boots far ahead at the bottom of the '
             'footwell. Nothing else is added: the sky between the roll bars stays empty. The clay below streaks past in motion blur.')
B['D09n'] = (['pc_d09'], 'Photo edit of @pc_d09. Keep the aircraft, the camera, the framing, the sky and the shadow exactly as they are. '
             'Add ONLY a long trail of fine white dust kicked up from the clay behind and under the aircraft, and motion blur on the clay '
             'to show speed. Do not add any person outside the aircraft, no legs or boots below it, nothing in the sky. Photoreal, no text.')

B['D08p'] = ([], 'Photo edit of @pm_d08b. FIRST-PERSON VIEW: the camera is the pilot\'s own eyes looking forward over his knees; there is '
             'NO person facing the camera, no face, no head, no helmet anywhere in the image. Turn the simple coloured shapes into real '
             'photographed body parts in exactly the same places: the two dark-grey tubes on the left and right are his forearms in a '
             'charcoal knit sweater, ending in thin black leather gloves — the RIGHT glove wrapped around the black side-stick on the '
             'right rail, the LEFT glove resting on the left armrest panel; the two blue tubes in the middle are his thighs in dark '
             'indigo jeans, running forward to tan suede boots in the footwell. Keep the cockpit, roll bars, arms, propellers, sky and '
             'mountains exactly as they are, same framing; the clay below streaks past in motion blur. Photoreal, no text.')

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
