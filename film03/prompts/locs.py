#!/usr/bin/env python3
"""film03 step 1.3 · location layout plates (Higgsfield step 1: scenes laid out for the action).

Usage: python3 film03/prompts/locs.py [create|run|wait] [KEY ...]
One empty plate per location (no aircraft, no people except where noted): 3/4 elevated view, clear foreground / midground /
background, room left for the action. Flight path, camera positions and sun are drawn on afterwards by film03/locs/annotate.py.

Continuity bible (applies to every plate and every later prompt):
  - five SEPARATE morning flights cut as a montage (not one journey); on screen each flight travels LEFT → RIGHT (editing rule only);
  - the sun is in the EAST = low on the left of frame; L1 is sunrise, the others mid-morning;
  - clear sky, no cloud below the horizon, no birds; flight within ~20 m of ground or water.
"""
import subprocess, sys

S = 'film03/jimeng-state.json'
LOOK = ('Photoreal landscape location photograph for a premium commercial, 16:9, shot from a drone about 25 m up in a 3/4 view, '
        '24 mm lens, deep focus, natural light only, rich but true colour, fine detail, no people, no vehicles unless named, '
        'no aircraft, no birds, no text, no watermark.')
SUN = 'The sun is low on the LEFT, behind the camera-left side, casting long shadows toward the right and slightly toward the camera.'

L = {
 'L1': ('Location 1 · Mojave dry lake bed at sunrise, the take-off site. Vast flat white cracked clay lake bed. FOREGROUND right of centre: '
        'a single square dark-grey rubber landing mat about 8 m wide lying on the clay, empty. MIDGROUND far LEFT, about 60 m from the mat: '
        'a white pickup truck parked side-on, small in frame. The lake bed runs open and empty to the RIGHT for kilometres (the flight '
        'direction). BACKGROUND: low brown-violet desert mountains along the horizon. Sky clear, pink-amber glow at the horizon on the left '
        f'where the sun has just risen. {SUN}'),
 'L2': ('Location 2 · Red-rock sandstone canyon with a river, seen ACROSS the canyon from the near rim. The canyon runs straight '
        'ACROSS the frame from LEFT to RIGHT, about 80 m wide between sheer red and orange sandstone walls about 50 m high. A calm '
        'emerald-green river fills the canyon floor and runs from the LEFT edge of frame to the RIGHT edge, with open air above the water '
        'for low flight along it. FOREGROUND: the near rim edge, sunlit sandstone ledges at the bottom of frame. MIDGROUND: the river with a '
        'narrow pale sandbar on the near bank. BACKGROUND: the far canyon wall and, above it, a distant flat-topped plateau. '
        f'Early-morning light coming down the canyon from the LEFT. {SUN}'),
 'L3': ('Location 3 · High alpine lake in the Sierra Nevada, morning. A long glassy deep-blue lake stretching from LEFT to RIGHT across '
        'the frame, mirror-still, reflecting the peaks. FOREGROUND: a granite shore with a few boulders and short grass at the bottom left. '
        'MIDGROUND: the open water, wide and empty for low flight; the far shore lined with dark-green pines. BACKGROUND: grey granite '
        f'peaks with small patches of old snow. Crisp clear air, a thin mist just lifting off the water on the left. {SUN}'),
 'L4': ('Location 4 · Rolling golden wheat fields, mid-morning. Endless gently rolling hills of ripe golden wheat, a single lone oak tree '
        'on a crest in the MIDGROUND right as a landmark. FOREGROUND: wheat heads in sharp detail at the bottom of frame. A faint farm track '
        'runs from LEFT to RIGHT along the valley floor, the flight line. BACKGROUND: soft blue hills at the horizon, a wide pale-blue sky. '
        f'Warm backlit glow on the wheat. {SUN}'),
 'L5': ('Location 5 · Pacific coast, Big Sur style, mid-morning, the landing site. Camera looks SOUTH along the coast: the land and '
        'the coastal hills are on the LEFT, the ocean on the RIGHT. FOREGROUND left: a flat green-gold grassy clifftop meadow about 40 m above '
        'the sea, open and empty, a large flat landing area; no fence, no people. MIDGROUND: below the cliff a long sandy beach with white '
        'surf, running from the foreground into the distance; the flight line crosses from the clifftop on the LEFT out over the beach and '
        'the surf toward the RIGHT. BACKGROUND: rugged headlands stepping away into the distance on the left, the deep-blue Pacific on the '
        'right to a sharp horizon. The morning sun is LOW over the hills on the LEFT (east), lighting the sea and the beach from the left; '
        'NO sun and NO sun glitter over the ocean on the right. Sky clear.'),
}

# edits of confirmed plates (key: (refs, prompt))
E = {
 'L1low': (['L1'], 'Background plate for compositing, same place and light as @L1: the Mojave dry lake at sunrise seen from a LOW '
         'camera 1 m above the clay, 24 mm. Flat white cracked clay filling the lower half, a dark square landing mat on the clay '
         'right of centre in the middle distance, the small white pickup truck far away on the left, low brown-violet mountains on the '
         'horizon, the sun just above the horizon on the LEFT with a soft warm flare, long shadows toward the right. Empty: no aircraft, '
         'no people, no birds. Photoreal, 16:9, no text.'),
 'L1pov': (['L1'], 'Background plate for compositing, same place as @L1: the Mojave dry lake in early-morning light, seen looking WEST '
         'from 3 m above the clay, 24 mm, the sun BEHIND the camera (not in frame): flat white cracked clay streaking toward a far horizon '
         'of low brown-violet mountains, clear blue sky with a warm haze low down, the light falling from behind. Empty: no aircraft, no '
         'people, no truck, no birds. Photoreal, 16:9, no text.'),
 'L5B': (['L5', 'L1'], 'Precise edit of @L5. Keep everything exactly the same: camera, framing, light, the clifftop meadow, the beach, the '
         'surf, the headlands and the ocean. One addition only: the same white pickup truck as in @L1, parked side-on on a small dirt '
         'pull-off at the far back-left edge of the clifftop meadow, next to the hillside, at least 60 m from the open landing area in the '
         'left foreground; small in frame, nobody near it. Photoreal, no text.'),
}

if __name__ == '__main__':
    act, keys = (sys.argv[1] if len(sys.argv) > 1 else 'create'), (sys.argv[2:] or list(L))
    if act == 'create':
        for k in keys:
            if k in E:
                sys.path.insert(0, 'film03/prompts'); from board import resolve
                refs, prompt = resolve(*E[k])
                cmd = ['python3', 'tools/jm.py', S, 'img', k, '--title', f'location {k}', '--prompt', prompt, '--model', 'seedream_5.0_pro']
                for r in refs:
                    cmd += ['--ref', r]
            else:
                cmd = ['python3', 'tools/jm.py', S, 'img', k, '--title', f'location {k}', '--prompt', f'{L[k]} {LOOK}', '--model', 'seedream_5.0_pro']
            for attempt in range(3):
                if subprocess.run(cmd).returncode == 0:
                    break
    elif act == 'run':
        subprocess.run(['python3', 'tools/jm.py', S, 'run'] + keys, input='y\n' * 5, text=True)
    elif act == 'wait':
        subprocess.run(['python3', 'tools/jm.py', S, 'wait', 'film03/locs'] + keys)
