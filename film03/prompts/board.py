#!/usr/bin/env python3
"""Storyboard stills for film03 FIRST FLIGHT (one per beat of BRIEF-FirstFlight.md section 4).

Usage: python3 film03/prompts/board.py [create|run|wait] [KEY ...]
Continuity bible (BRIEF section 3) is folded into every prompt: sun low on the LEFT/behind on the outbound leg,
outbound flight LEFT->RIGHT, return RIGHT->LEFT, white cracked dry lake, Maya's olive jacket and white helmet,
Ray at the white pickup about 60 m left of the mat, Dream identical to the white-background refs.
"""
import json, re, subprocess, sys

S = 'film03/jimeng-state.json'
LOOK = ('Photorealistic film still from a premium automotive commercial, 16:9, shot on a cinema camera, natural light only, '
        'shallow depth of field where noted, rich warm colour, fine film grain, no text, no watermark.')
DREAM = ('The aircraft is identical to @ref_dream_34front and @ref_dream_side: white front body with the CoolFly wordmark, black tubular '
         'roll cage, four carbon arms in an X layout, two motors per arm with two-blade propellers, eight propellers in total.')
MAYA = 'The pilot is the woman in @char_maya: dark-blond low ponytail, freckles, olive-green flight jacket, grey hoodie; when flying she wears the white helmet with the iridescent visor.'
RAY = 'The instructor is the man in @char_ray: salt-and-pepper beard, navy cap, denim jacket, radio.'
LAKE = 'Location: the Mojave dry lake from @loc_base: flat white cracked clay, low brown-violet mountains on the horizon.'

B = {
 'B01': (['loc_base', 'ref_dream_34front'], f'{LAKE} Extreme wide shot at first light before sunrise, pink and amber glow low on the LEFT horizon. The tiny white aircraft sits on its dark landing mat right of centre; far on the left a tiny white pickup truck. Vast empty space, epic and quiet. {DREAM} {LOOK}'),
 'B02': (['char_maya', 'ref_dream_cockpit'], f'Extreme close-up inside the aircraft seat: a woman\'s hands in the olive-green jacket sleeves clicking a black four-point harness buckle shut over a grey hoodie, fingers slightly tense; soft pre-dawn light, the black cage tubes out of focus. {MAYA} {LOOK}'),
 'B03': (['char_ray', 'loc_base'], f'{LAKE} Medium shot: the instructor stands by the white pickup truck, lifting the radio to his mouth, calm and encouraging, looking off to the right. Far behind him on the right, about sixty metres away and very small in the frame, the white aircraft sits alone on its dark mat; nobody is near it. Pre-dawn light, pink sky on the left. {RAY} {LOOK}'),
 'B04': (['char_maya', 'loc_base'], f'{LAKE} Extreme close-up of her face in a white helmet with a clear iridescent visor, seated in the parked aircraft ON THE GROUND before take-off; behind her at eye level the flat white cracked lake bed and the low mountains with a pink-amber pre-dawn horizon; her face fully visible, no mask, no fog; freckles, a nervous focused look, a slow breath. {MAYA} {LOOK}'),
 'B05': (['char_maya', 'ref_dream_cockpit', 'loc_base'], f'{LAKE} Close-up from inside the cage: her gloved right hand pushes the black control stick forward; beyond the cage a motor\'s green status light glows and fine white dust starts to swirl over the flat white cracked clay; pale pre-dawn light. The ground is white clay, never red or brown. {MAYA} {LOOK}'),
 'B06': (['loc_base', 'ref_dream_side', 'char_maya'], f'{LAKE} Low wide shot from ground level: the white aircraft lifts two metres off the dark mat, a ring of white dust blasting outward, the sun just breaking over the horizon directly behind it on the left, rays and flare; the pilot visible in the seat. {DREAM} {MAYA} {LOOK}'),
 'B07': (['char_maya', 'ref_dream_cockpit', 'loc_base'], f'{LAKE} Close-up of her face in the white helmet, eyes wide, mouth slightly open in disbelief, warm sunrise light from the left, the black cage tubes framing her. Behind her: the flat white dry lake only three metres below and the low mountains on the horizon, clear sky. No clouds anywhere below the horizon; she is flying very low. {MAYA} {LOOK}'),
 'B08': (['ref_dream_34rear', 'char_maya', 'loc_base'], f'{LAKE} FPV drone shot from behind and slightly left: the white aircraft flies LEFT TO RIGHT about three metres above the white cracked clay, fast; its long shadow races across the ground ahead of it to the right; motion blur on the ground, the sun low behind on the left. {DREAM} {MAYA} {LOOK}'),
 'B09': (['ref_dream_side', 'char_maya'], f'{LAKE} Side tracking shot at the aircraft\'s height, travelling left to right: she leans slightly and looks down at the aircraft\'s shadow sliding over the cracked clay below; warm low sun from behind-left. {DREAM} {MAYA} {LOOK}'),
 'B10': (['char_ray', 'loc_base'], f'{LAKE} Medium close-up: the instructor by the white pickup looks up and to the right, slowly taking off his navy cap, a proud half smile, golden sunrise light on his face. {RAY} {LOOK}'),
 'B11': (['loc_base', 'ref_dream_34front', 'char_maya'], f'{LAKE} High aerial drone shot looking down at forty-five degrees from about forty metres up: far below, the small white aircraft flies left to right about fifteen metres above the endless white cracked lake bed, its crisp shadow on the clay, the ring of mountains around the whole dry lake, golden morning light. {DREAM} {LOOK}'),
 'B12': (['char_maya', 'ref_dream_34front', 'loc_base'], f'{LAKE} Fast push-in with motion blur at the frame edges toward her white helmet and iridescent visor as she flies low over the flat white clay, the low sun flaring in the visor, mountains on the horizon, clear sky. Desert only: no grass, no hills nearby, no clouds. {MAYA} {DREAM} {LOOK}'),
 'B13': (['ref_dream_cockpit', 'loc_base'], f'{LAKE} Point-of-view from the pilot\'s seat: the black cage tubes and the small screen in the lower frame, beyond them the infinite white lake bed and the low sun, utterly calm; her gloved hand resting loosely on the stick. {DREAM} {LOOK}'),
 'B14': (['char_maya'], f'Close-up: she laughs out loud inside the white helmet, head tipped back slightly, eyes crinkled with joy, sunlight across her face, wind in a few loose strands of hair. {MAYA} {LOOK}'),
 'B15': (['ref_dream_34front', 'char_maya', 'loc_base'], f'{LAKE} Low FPV hero shot one metre above the clay: the white aircraft sweeps past the camera in a gentle wide arc about four metres above the ground, propellers as translucent discs, dust trailing, sun glinting on the white body. {DREAM} {MAYA} {LOOK}'),
 'B16': (['ref_dream_34front', 'char_maya', 'loc_base'], f'{LAKE} Telephoto head-on shot: the aircraft flies back toward camera and slightly RIGHT TO LEFT, low over the shimmering white clay, the low sun now behind the camera lighting the white body brightly, heat haze. {DREAM} {MAYA} {LOOK}'),
 'B17': (['loc_base', 'ref_dream_34rear', 'char_maya'], f'{LAKE} Wide shot: the aircraft with the pilot still seated inside, helmet on, settles down onto the dark landing mat, a soft ring of dust drifting away, propellers slowing. Nobody stands near the aircraft; the white pickup is tiny far on the left. {DREAM} {MAYA} {LOOK}'),
 'B18': (['char_maya', 'ref_dream_cockpit'], f'Medium close-up: seated in the parked aircraft she pulls off the white helmet, her ponytail falls loose, breathless, beaming, and calls out toward the left; warm morning sun on her face, the black cage around her. {MAYA} {LOOK}'),
 'B19': (['loc_base', 'char_ray', 'char_maya', 'ref_dream_34front'], f'{LAKE} Extreme wide shot in full morning sun: the white aircraft parked on its mat right of centre with the woman standing beside it, the instructor walking toward her from the white pickup on the left, long shadows, open sky with clear space in the upper third. {DREAM} {LOOK}'),
}

def resolve(refs, prompt):
    """@handle -> {{node:ID}}; every handle used in the prompt is also attached as a reference."""
    nodes = json.load(open(S))['nodes']
    used = re.findall(r'@(\w+)', prompt)
    for h in used:
        prompt = prompt.replace('@' + h, '{{node:%s}}' % nodes[h]['nodeId'])
    return list(dict.fromkeys(refs + used)), prompt


if __name__ == '__main__':
    act, keys = (sys.argv[1] if len(sys.argv) > 1 else 'create'), (sys.argv[2:] or list(B))
    if act == 'create':
        for k in keys:
            refs, prompt = resolve(*B[k])
            cmd = ['python3', 'tools/jm.py', S, 'img', k, '--title', f'board {k}', '--prompt', prompt]
            for r in refs:
                cmd += ['--ref', r]
            for attempt in range(3):
                if subprocess.run(cmd).returncode == 0:
                    break
    elif act == 'run':
        subprocess.run(['python3', 'tools/jm.py', S, 'run'] + keys, input='y\n' * 5, text=True)
    elif act == 'wait':
        subprocess.run(['python3', 'tools/jm.py', S, 'wait', 'film03/board'] + keys)
