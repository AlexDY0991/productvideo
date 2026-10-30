#!/usr/bin/env python3
"""film03 step 1.2 · pilot character sheets (Higgsfield 3-step workflow, step 1).

Usage: python3 film03/prompts/cast.py [create|run|wait] [KEY ...]
  MA1 / MA2   Maya triptych (16:9): left head-and-shoulders (the only face), centre full body front cropped at the neck,
              right full body back at the same scale and floor line; mid-grey seamless, soft light, real skin.
              MA1 = Seedream 5.0 Pro, MA2 = image model N-Pro, for a realism comparison.
  MS1         Maya seated in Dream Pro from references only. Rejected: the image model redesigned the aircraft.
  MS2         Maya seated in Dream Pro as an edit of the 3D plate prop_glb_seat (render.mjs 'seat' view) + the triptych:
              right hand on the right side-stick, left hand on the left armrest, sitting low; the aircraft must stay as rendered.
"""
import subprocess, sys

sys.path.insert(0, 'film03/prompts')
from board import resolve  # noqa: E402  (@handle → {{node:ID}} + reference)

S = 'film03/jimeng-state.json'

# Wardrobe is written once and repeated verbatim in every prompt (continuity bible, step 2).
MAYA = ('Maya, a 34-year-old American woman, natural athletic build, about 1.70 m tall; dark-blond hair pulled into a low ponytail '
        'with a few loose strands; light freckles across the nose and cheeks; hazel eyes; straight dark eyebrows; minimal make-up; '
        'small silver stud earrings. Wardrobe: a plain olive-green nylon MA-1 style flight jacket, waist length, ribbed cuffs and hem, '
        'zipped halfway, no patches, no logos, no text; underneath a plain heather-grey crew-neck sweatshirt; slim black technical '
        'trousers; brown leather lace-up ankle boots; a black analog watch on the left wrist.')
HELMET = ('Her flying kit: a matte white open-face helmet with a clear flip-down visor, a thin black chin strap and no graphics; '
          'thin black leather flying gloves.')
REAL = ('Photoreal, shot on a full-frame cinema camera with an 85 mm lens, true-to-life skin with visible pores, fine vellus hair and '
        'natural asymmetry, no retouching, no beauty filter, no plastic skin, no symmetry correction; natural fabric creases and '
        'wear; neutral white balance; no text, no watermark, no logos.')

TRIPTYCH = (
    'Character reference sheet, one 16:9 image split into three equal vertical panels side by side, separated by thin gaps, '
    'all on the same mid-grey seamless studio backdrop with large soft frontal light and gentle fill. '
    'LEFT panel: frontal head-and-shoulders portrait of her, relaxed neutral expression with a hint of a smile, looking into the lens. '
    'This is the ONLY panel that shows her face. '
    'CENTRE panel: the same woman standing straight, full body from the front, framed from the neck down to the boots, arms relaxed '
    'at her sides; her head is cropped off at the neck by the top of the frame. '
    'RIGHT panel: the same woman, full body from behind, framed from the neck down to the boots at exactly the same scale and the '
    'same floor line as the centre panel; the ponytail tip is visible on her upper back. '
    'Same outfit in all three panels, nothing held in the hands, no helmet. ')

SEATED = (
    'Character reference photo, 16:9: Maya seated in the CoolFly Dream Pro aircraft parked on a plain mid-grey studio floor, '
    'same mid-grey seamless backdrop and soft studio light as @MA. The aircraft is exactly as in @prop_glb_r34 and @prop_glb_hero: '
    'pearl-white fairings, black tubular roll cage, light-grey seat with black harness, white parachute pod on the roof, white belly '
    'airbags, two black skids. Camera at the front-right of the aircraft, slightly above her eye level, 50 mm, like @prop_glb_r34. '
    'She sits LOW and slightly reclined in the seat, back against the seat, legs stretched forward into the footwell, the black '
    'shoulder harness buckled over her jacket; the top of her helmet stays well below the roof of the roll cage. '
    'Her RIGHT gloved hand holds the single black side-stick on the RIGHT side rail, exactly where it is in @prop_glb_stick and '
    '@prop_glb_pov; her LEFT forearm and hand rest relaxed on the LEFT armrest panel. There is only one stick, on her right; '
    'nothing in front of her, no yoke, no wheel, never a stick on the left, never two hands on the stick. '
    'She wears the helmet with the visor flipped up so her face is fully visible, calm and focused, looking ahead past the camera. '
    'Her face, hair and outfit are exactly the woman in @MA. ')

PLATE = (
    'Photo edit of @prop_glb_seat. Keep the aircraft EXACTLY as it is in @prop_glb_seat: the same camera angle, framing, every tube '
    'of the black roll cage, the white parachute pod on the roof, the pearl-white fairings, the CoolFly lettering, the arms, '
    'propellers, airbags and skids, in the same positions; do not add, remove, move or redesign any part of the aircraft. '
    'Only two changes: (1) turn the 3D render into a real photograph of the real aircraft in a photo studio with a mid-grey '
    'seamless floor and backdrop and soft overhead light, real materials, real reflections, soft contact shadows; '
    '(2) seat Maya, the woman in @MA, in the light-grey seat. '
    'She sits LOW and slightly reclined, back and helmet against the seat, legs stretched forward into the footwell, the black '
    'shoulder harness buckled over her jacket; the top of her helmet stays well below the roof of the roll cage. '
    'Her RIGHT gloved hand rests on the single black side-stick on the RIGHT side rail, at the position of the stick in '
    '@prop_glb_stick and @prop_glb_pov (on the near side of the seat in this view); her LEFT forearm and hand rest on the LEFT armrest '
    'panel on the far side. Only one stick; nothing in front of her, no yoke, no wheel, never two hands on the stick. '
    'Helmet visor flipped up so her face is fully visible, calm and focused, eyes looking ahead past the camera. '
    'Her face, hair and outfit are exactly the woman in @MA. ')

FIX_HAND = (
    'Precise edit of @MS2. Keep everything in @MS2 exactly the same: the woman, her face, helmet, outfit, pose, the aircraft, '
    'the camera, the light and the background. Change ONLY her right hand: on the near (right) side rail there is a single '
    'vertical black side-stick, a joystick grip about 25 cm tall rising from the rail, exactly like the stick in @prop_glb_stick and '
    '@prop_glb_pov. Her RIGHT gloved hand wraps around that vertical grip, fingers curled around it, thumb on top, wrist relaxed, '
    'forearm resting along the rail. Her left hand stays on the far armrest as it is. One stick only, on her right. ')

TRIPTYCH_M = (TRIPTYCH.replace('the ponytail tip is visible on her upper back', 'the back of his neck and hairline just cropped')
              .replace('frontal head-and-shoulders portrait of her', 'frontal head-and-shoulders portrait of him')
              .replace('shows her face', 'shows his face').replace('the same woman', 'the same man')
              .replace(' her head is cropped', ' his head is cropped').replace('at her sides', 'at his sides'))

# ── v2 lead (user, 2026-10-30): a man who looks about 40 — the core US buyer, not a stated ex-pilot. Maya (MA*/MS*) retired. ──
ETHAN = ('Ethan, a 40-year-old American man, lean and fit, about 1.82 m tall; short dark-brown hair, neatly cut, greying at the '
         'temples; short well-kept stubble with a little grey; light tan, fine crow\'s feet, blue-grey eyes; handsome in an '
         'ordinary, lived-in way, not a model; the calm, confident look of a self-made founder who spends weekends outdoors. ')
EVERYDAY = ('Everyday wardrobe: a charcoal-grey fine merino crew-neck sweater, sleeves pushed slightly up the forearms; dark indigo '
            'straight-leg jeans; tan suede chukka boots; a steel pilot chronograph on a brown leather strap on the LEFT wrist. '
            'No logos anywhere on the clothes. ')
VEST = ('Flying kit, worn over the everyday clothes: a CoolFly airbag vest, a slim fitted matte-black technical vest like a '
        'motorcycle electronic airbag vest, smooth stretch shell with subtle quilted panels over the chest and back, a rounded '
        'padded collar that wraps the base of the neck, a front zip with one black chest buckle strap, a slim adjuster strap at '
        'each hip; the CoolFly wordmark exactly as in @ref_logo_rev (off-white letters, orange F) printed small on the left chest '
        'and large across the upper back, no other text or graphics. A matte white open-face helmet with a clear flip-down visor '
        'and a thin black chin strap, no graphics. Thin black leather flying gloves. ')

TRIPTYCH_FLY = (
    'Character reference sheet, one 16:9 image split into three equal vertical panels side by side, separated by thin gaps, '
    'all on the same mid-grey seamless studio backdrop with large soft frontal light and gentle fill. Same man as @PA1. '
    'LEFT panel: frontal head-and-shoulders portrait wearing the white helmet with the visor flipped up, face fully visible, '
    'chin strap fastened, the vest collar and the small chest logo visible. This is the ONLY panel that shows his face. '
    'CENTRE panel: full body from the front, framed from the neck down to the boots, wearing the vest over the sweater, gloves on, '
    'arms relaxed at his sides; head cropped off at the neck by the top of the frame. '
    'RIGHT panel: full body from behind, framed from the neck down to the boots at exactly the same scale and floor line as the '
    'centre panel, the large CoolFly wordmark across the upper back of the vest clearly readable. ')

PLATE_E = (
    'Photo edit of @prop_glb_seat. Keep the aircraft EXACTLY as it is in @prop_glb_seat: the same camera angle and framing, every '
    'tube of the black roll cage, the white parachute pod on the roof, the pearl-white fairings, the CoolFly lettering, the arms, '
    'propellers, airbags and skids, all in the same positions. Do not add, remove, move or redesign any part of the aircraft. '
    'In particular the cockpit is a closed tub: the dark side panel below the near white fairing, the side tubes and the front of '
    'the cage stay exactly as in @prop_glb_seat and fully enclose the footwell; nothing of the pilot passes through or outside them. '
    'Only two changes: (1) turn the 3D render into a real photograph of the real aircraft in a photo studio with a mid-grey seamless '
    'floor and backdrop and soft overhead light, real materials, real reflections, soft contact shadows; '
    '(2) seat Ethan, the man in @PA1 and @PF2, in the light-grey seat, wearing the flying kit exactly as in @PF2 (CoolFly airbag '
    'vest, white open-face helmet with the visor up, black gloves) over his everyday clothes. '
    'He sits LOW and slightly reclined, back and helmet against the seat, the black shoulder harness buckled over the vest. '
    'His legs go forward INSIDE the tub into the footwell and are hidden behind the near side panel and the white fairing; at most '
    'his knees show just above the side rail; his boots are not visible. The top of his helmet stays well below the cage roof. '
    'His RIGHT gloved hand wraps around the single vertical black side-stick on the near (right) side rail, exactly where the stick '
    'is in @prop_glb_stick and @prop_glb_pov; his LEFT forearm and hand rest on the LEFT armrest panel on the far side. One stick '
    'only; nothing in front of him, no yoke, no wheel. Calm, focused, eyes ahead past the camera. ')

FIX_FLY = (
    'Precise edit of @PF2. Keep everything exactly the same: the man, his face, helmet, vest, clothes, gloves, boots, poses, light, '
    'background and the three-panel layout. Two changes only, both in the CENTRE panel: (1) the vest gets the same small CoolFly '
    'wordmark as in the LEFT panel and @ref_logo_rev (off-white letters, orange F), printed on HIS LEFT chest, which is on the '
    'right-hand side of the image, just beside the zip; (2) the top of the centre panel crops at the base of his neck, so no mouth, '
    'chin or face is visible in the centre panel. ')

FIX_BELT = (
    'Precise edit of @PS1. Keep everything exactly the same: the man, his face, helmet, vest, hands, pose, the aircraft, camera, '
    'light and background. One change only: he is strapped in with the seat\'s black four-point harness, the same black webbing as '
    'the straps on the seat in @prop_glb_seat: two black shoulder straps come over his shoulders from the seat back, run down over '
    'the CoolFly airbag vest and lock into a round black buckle at his lap together with the black lap belt. The small chest logo '
    'on the vest stays visible beside the left strap. ')

C = {
    'MA1': ([], f'{TRIPTYCH}{MAYA} {REAL}', 'seedream_5.0_pro'),
    'MA2': ([], f'{TRIPTYCH}{MAYA} {REAL}', 'jm_image_model_gg_bp'),
    'MS1': ([], f'{SEATED}{MAYA} {HELMET} {REAL}', 'seedream_5.0_pro'),   # rejected: the model redesigned the aircraft
    'MS2': ([], f'{PLATE}{MAYA} {HELMET} {REAL}', 'seedream_5.0_pro'),     # 3D plate + identity: aircraft stays as rendered
    'MS3': ([], f'{FIX_HAND}{REAL}', 'seedream_5.0_pro'),                  # MS2 with the right hand gripping the side-stick
    'PA1': ([], f'{TRIPTYCH_M}{ETHAN}{EVERYDAY}{REAL}', 'seedream_5.0_pro'),        # Ethan, everyday clothes
    'PF1': (['PA1'], f'{TRIPTYCH_FLY}{ETHAN}{EVERYDAY}{VEST}{REAL}', 'seedream_5.0_pro'),   # Ethan, flying kit
    'PF2': ([], f'{FIX_FLY}{REAL}', 'seedream_5.0_pro'),                   # PF1 with the chest logo + neck crop in the centre panel
    'PS1': (['prop_glb_seat'], f'{PLATE_E}{ETHAN}{REAL}', 'seedream_5.0_pro'),     # Ethan seated, from the 3D plate
    'PS2': ([], f'{FIX_BELT}{REAL}', 'seedream_5.0_pro'),                  # PS1 with the four-point harness on
}


if __name__ == '__main__':
    act, keys = (sys.argv[1] if len(sys.argv) > 1 else 'create'), sys.argv[2:]
    ma = 'MA1'   # the triptych chosen for the seated sheet; @MA in SEATED points to it
    if act == 'create':
        for k in keys:
            refs, prompt, model = C[k]
            refs, prompt = resolve(refs, prompt.replace('@MA', '@' + ma))
            cmd = ['python3', 'tools/jm.py', S, 'img', k, '--title', f'cast {k}', '--prompt', prompt, '--model', model]
            for r in refs:
                cmd += ['--ref', r]
            for attempt in range(3):
                if subprocess.run(cmd).returncode == 0:
                    break
    elif act == 'run':
        subprocess.run(['python3', 'tools/jm.py', S, 'run'] + keys, input='y\n' * 5, text=True)
    elif act == 'wait':
        subprocess.run(['python3', 'tools/jm.py', S, 'wait', 'film03/cast'] + keys)
