# CoolFly film03 — creative directions (2026-10-30)

Starting from scratch: new story, new music, new canvas (`film03/jimeng-state.json`, ledger reset to 0 / 4,000).
The user is hand-editing the film02 v10 version themselves.

## Lessons from film02 that shape this film

1. **Cutting existing footage together cannot fix continuity.** The film02 clips disagree on wardrobe, sun direction and screen direction, and Claude's frame reading cannot judge motion continuity well enough. So continuity is designed **before** anything is generated: a continuity bible, a still storyboard approved by the user, then one generation per scene with moves and transitions inside the clip.
2. **Music first, picture to the music.** The film02 score had no clear hits for picture to land on. This time the track is chosen first, its real hits are mapped (`music_window.py`), and the storyboard is timed to them.
3. **Fewer people, fewer locations, one direction of travel.** Each extra character or place is a continuity risk in generation.

## Three directions

### A · FIRST FLIGHT (recommended)
A woman in her thirties takes her first solo flight in a Dream, on a vast dry lake bed in the Mojave at sunrise. Her instructor stands far away by a pickup truck with a radio.
- Arc: nerves → lift-off → disbelief → pure joy (laughing inside the helmet) → landing → she looks back at the sky and wants to go again.
- **Why:** it sells the feeling the user asked for ("用户看了很想体验"). It is about a first-time pilot, so the viewer can picture themselves in the seat. A dry lake gives a clean, epic frame: flat white ground, long shadows, mountains on the horizon, no clutter. It also keeps continuity simple: one place, one sun position, the flight in one direction. Safe and believable: a training flight in open space, low altitude, the instructor at a distance.
- Cast: the pilot, the instructor (far), the Dream.
- Music: tension (pulse, breath, ticking) → hard stop → the lift → a soaring, driving section → a warm resolve on the landing.

### B · THE LAKE
One man crosses a Sierra alpine lake at sunrise to join friends at a cabin dock: low over turquoise water, along granite shores and pines.
- **Why:** the most beautiful landscapes and the strongest FPV moves (skimming water, threading the shoreline). The story is thinner, closer to a pure flight film.
- Music: driving indie-electronic or hybrid orchestral, about 110 BPM.

### C · SATURDAY
Two friends, two Dreams, a coastal ranch. They race along a fence line, stop on a ridge and share a coffee.
- **Why:** the American "weekend with friends" idea; two aircraft give strong formation and passing shots. It is the hardest for continuity (two aircraft, two people).

## Recommendation
**A · FIRST FLIGHT.** It has the strongest emotional hook, a clear arc that matches music dynamics, and the lowest continuity risk.
