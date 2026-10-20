# CoolFly DREAM · v05 脚本「First Light · 30」（v04 压缩到 30 秒）

> 用户反馈：45 秒太长，改成 30 秒左右；先用即梦 Seedance 2.5 的 480p 样片模式试，满意后再提高分辨率。
> 结构：3 场戏 = 3 次 Seedance 2.5 多参考生成（12 s + 10 s + 6 s = 28 s），后期加 3 s 橙色 logo 卡，全片 31 s，16:9。
> 故事、资产、规则都沿用 v04（`SCRIPT-v04.md`）；删掉的镜头：第 2 场的长焦侧跟和俯拍。

| 场 | 时长 | 镜头 | 转场 | 后期叠加 |
|---|---|---|---|---|
| 1 · 点火（机库） | 12 s | 灯逐排亮 → 驾驶员走进（露脸、胸背 logo）→ 戴盔放面罩 → 握杆、绿灯 → 螺旋桨启动吹水雾 → 离地 → 冲出卷帘门掠过镜头 | 机腹遮满画面 | — |
| 2 · 海岸（清晨） | 10 s | 机腹移开、爬升越过崖边 → 贴海追拍 → 沿海岸航拍 → 绕海蚀柱侧倾 → 面罩倒映太阳 | 面罩里的太阳匹配切落日 | `100 km/h`（1.8–3.8 s），`40 min`（4.5–6.3 s） |
| 3 · 抵达（黄昏） | 6 s | 逆光飞来 → 降落崖顶 → 抬面罩看海 | 切橙色 logo 卡 | Pro / ST 参数（2.0–3.6 s） |

提交时 `@handle` 由 `film02/prompts/v05.sh` 换成 `{{node:…}}` 并挂 `--ref`。

---

## 第 1 场 · IGNITION · 12.0 s

```
A 12-second live-action launch film, 16:9. Night in an aircraft hangar: the ceiling lights wake a CoolFly Dream, a pilot suits up, the motors start, and the aircraft flies out through the rolling door and passes directly over the camera, its belly covering the whole frame for the cut into the next scene.

REFERENCES
@prop_dream — the aircraft. Take every detail of shape, livery, arms, motors and propellers from it; ignore its grey studio backdrop.
@char_pilot3 — the pilot. Take his face, hair, flight suit with both CoolFly wordmarks, gloves and helmet; ignore the grey backdrop and the sheet layout.
@loc_hangar — the hangar. The plate's camera angle IS the first shot's angle. The plate shows an empty pad; in this clip the aircraft stands on it.

LOOK
Clean modern digital cinema, 24–100mm lenses, deep clean blacks, punchy contrast, crisp detail. Cold white light from the ceiling rows; the aircraft's orange is the strongest colour in every shot; pale blue dawn beyond the rolling door. Physically plausible, weighted camera moves with slow starts and precise stops.

CHARACTERS
The pilot — an American man in his mid-30s, short dark-brown hair, light stubble, grey-green eyes, real skin. Calm, precise, unhurried. He never speaks and never looks into the lens. Once his visor is down at 4.6s it stays down for the rest of the clip.

SUIT RULE
Matte black one-piece flight suit exactly as @char_pilot3: the CoolFly wordmark printed small on the left chest and large across the upper back, 'Cool' in off-white and 'Fly' in orange, the same slanted stencil letters, never misspelled, mirrored or redesigned. These two prints are the only text allowed in the clip.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange glossy front fairing with two white vertical stripes and the number 05, dark-grey tubular steel roll cage with an arched roof, white bucket seat with harness, four carbon-fibre arms in an X layout, a coaxial pair of black motors at each arm tip (one above, one below) with two-blade carbon propellers, eight propellers in total, open perforated steel floor. Never redesigned; no extra or missing arms, motors or propellers; no added logos or text. Propellers are still until 6.6s; after that they are translucent spinning discs.

WHERE EVERYTHING IS — fixed for the whole clip
The aircraft stands on the painted square pad in the centre of the hangar, nose toward the tall rolling door at the far end. Six rows of ceiling lights run from the rolling door toward the near end. The steel tool cart stands against the left wall at the near end; the small side door is in the right wall. The pilot enters through the side door and stops beside the cockpit on the aircraft's right side.

WHAT IS BEHIND EACH OF THEM
Behind the aircraft (seen from the near end): the half-open rolling door with pale blue dawn over the sea. Behind the pilot at the cockpit: the right wall and the lit side door.

SHOTS
0.0–1.6s — THE VERY FIRST FRAME OF THE CLIP IS THIS: exactly the angle of @loc_hangar, a locked 24mm at floor level beside the tool cart, almost total darkness, only a thin line of blue dawn under the rolling door; the aircraft stands unlit on the pad. The ceiling rows switch on one at a time from the far door toward the camera at 0.2s, 0.45s, 0.7s, 0.95s, 1.2s and 1.45s; each new row slides a long white highlight further along the orange fairing and lights a new stretch of the wet floor. BACKGROUND: the half-open rolling door and the blue dawn. Nobody in frame. Hard cut at 1.6s.

1.6–3.4s — 50mm medium shot at chest height from the right side of the pad, trucking left with the pilot at walking speed and settling. The pilot walks in from the side door at screen right, helmet carried in his left hand, face fully visible, the CoolFly wordmark readable on his left chest, and stops beside the cockpit at 2.7s; at 2.9s he turns to face the cockpit, and the large CoolFly wordmark across his back is clearly readable to the camera. BACKGROUND: the lit roll cage and orange fairing fill the left half of frame; behind the pilot, the right wall and the lit side door. Hard cut at 3.4s.

3.4–5.0s — 85mm close-up, slightly low, front three-quarter on the pilot, a slow push-in that never stops. He pulls the helmet on at 3.7s and settles it; at 4.6s he lowers the dark visor with one gloved finger. BACKGROUND: soft out-of-focus rows of ceiling light. At 5.0s the dark visor fills most of the frame. Hard cut on the visor.

5.0–6.4s — 100mm macro inside the cockpit: his right gloved hand closes on the flight control grip at 5.3s; through the roll cage a carbon arm and a coaxial motor pair sit soft in the background. At 5.8s the green status lights on the motors blink on one after another, left to right. BACKGROUND: dark hangar, the soft edge of the orange fairing. Hard cut at 6.4s.

6.4–8.4s — locked low 24mm at floor level beside the front-right arm tip; the coaxial motors in the right third of frame, the seated pilot soft in the cockpit at left. At 6.6s both propellers start turning; by 7.3s they are translucent discs. The water on the floor shivers, then at 7.6s sprays outward in a ring of fine mist toward the lens. BACKGROUND: the far left wall with the tool cart. Hard cut at 8.4s.

8.4–10.0s — wide 24mm from floor level just inside the open rolling door, looking back into the hangar. The aircraft with the seated pilot lifts vertically from the pad to about 1.5 metres between 8.6s and 9.8s, a ring of mist spreading across the wet floor, the ceiling lights sliding over the fairing. The camera rises slowly with it. BACKGROUND: the lit hangar interior, the tool cart now at screen right and the side door at screen left. Hard cut at 10.0s.

10.0–12.0s — outside the hangar, a locked camera at ground level on the concrete apron just past the rolling door, looking back in through the open door. The aircraft accelerates out through the door toward the camera, nose first, and passes directly over the lens. From 11.5s to 12.0s its belly, open steel floor and arms fill the whole frame, every edge and corner, with strong motion blur. BACKGROUND: the lit hangar through the door, dawn light on the wet apron. The clip ends on the fully covered frame.

SOUND
No music: the score is added in post. Diegetic sound only: hangar room tone; a heavy electrical clunk for each ceiling row at 0.2s, 0.45s, 0.7s, 0.95s, 1.2s and 1.45s; footsteps on wet concrete 1.6–2.7s; helmet sounds at 3.7s; a crisp visor click at 4.6s; a soft electronic chirp at 5.8s; motor whine rising from 6.6s; water hiss at 7.6s; deep rotor roar from 8.6s; outdoor wind from 10.0s; one huge rotor roar as the aircraft passes overhead, peaking at 11.6s and cut off at 12.0s. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the dark hangar at the angle of @loc_hangar, never on a close-up.
- Exactly one aircraft, identical to @prop_dream in every frame; eight propellers, never more or fewer.
- Exactly one pilot, identical to @char_pilot3, including both CoolFly wordmarks on the suit; his face is seen only before 3.7s.
- The helmet stays on and the visor stays down after 4.6s.
- Pad, tool cart, side door and rolling door never move; screen geography flips only on the reverse angle at 8.4s, as stated.
- Propellers are still until 6.6s.
- Cuts at 1.6s, 3.4s, 5.0s, 6.4s, 8.4s and 10.0s are hard cuts; the clip ends on the fully covered frame at 12.0s.
- Colour stays rich and punchy in every shot, never washed out or hazy.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 2 场 · THE COAST · 10.0 s

```
A 10-second live-action flight sequence, 16:9, early morning on a rocky coast. Opens mid-situation: the aircraft has just flown out of the hangar directly over the camera and its belly still covers the whole frame. It climbs away over the cliff edge, skims the sea, flies the coast, banks around a sea stack, and the clip ends on the low sun filling the pilot's visor.

REFERENCES
@prop_dream — the aircraft. Every detail of shape, livery, arms, motors and propellers; ignore the grey backdrop.
@char_pilot3 — the pilot's suit with both CoolFly wordmarks, gloves and helmet. His visor stays down for the whole clip; his face is never seen.
@loc_coast — the coastline geography: basalt cliffs, the offshore sea stack, the lighthouse on the far headland. The plate's camera angle IS the angle of the 4.0–6.5s shot.

LOOK
Clean modern digital cinema, 24–50mm lenses. Soft silver overcast with a low sun breaking through near the horizon; deep blue-grey sea, black basalt, white surf; the aircraft's orange is the strongest colour. Fast but physically plausible aerial camera moves with weight and inertia.

CHARACTERS
The pilot — the same American man as @char_pilot3, seated and harnessed, calm and precise, visor down throughout; the CoolFly wordmark on his left chest is visible whenever his chest is in frame. Never speaks, never looks into the lens.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange front fairing with two white stripes and the number 05, dark-grey tubular roll cage, white seat, four carbon arms in an X layout, coaxial motor pairs at each tip, eight two-blade carbon propellers spinning as translucent discs the whole time, open perforated steel floor. Never redesigned, no extra or missing parts, no added logos or text.

WHERE EVERYTHING IS — fixed for the whole clip
The coast runs from the near cliff top toward the far headland with the lighthouse. Looking along the coast toward the lighthouse, the cliffs are on the left and the open sea is on the right; the sea stack stands offshore in the middle distance, just right of the cliffs. The aircraft always flies along the coast toward the lighthouse. Screen direction never flips: in chase shots it moves away from the camera.

SHOTS
0.0–1.5s — THE VERY FIRST FRAME OF THE CLIP IS THIS: the aircraft's belly, open steel floor and arms fill the whole frame, every edge and corner, seen from below with strong motion blur. The aircraft keeps moving away; by 0.6s the frame uncovers and reveals it climbing away over the edge of a cliff top, the grey sea and the far coastline beyond. The camera, low on the cliff-top grass, tilts up to follow. BACKGROUND: silver sky and the sea horizon. Hard cut at 1.5s.

1.5–4.0s — 24mm chase from behind and to the left, three metres above the water, keeping pace. The aircraft skims low over the sea at full speed, its downwash ploughing a white trail of mist; waves rush under the lens with strong motion blur. At 3.4s the aircraft pulls ahead of the camera. BACKGROUND: the cliffs on the left, the lighthouse headland far ahead. Hard cut at 4.0s.

4.0–6.5s — exactly the angle of @loc_coast: aerial 35mm from about 40 metres, looking along the coast. The aircraft enters from the lower left of frame and flies along the cliffs toward the lighthouse, small in frame, its shadow travelling on the water below; the camera drifts forward with it. BACKGROUND: basalt cliffs, the sea stack, the lighthouse. Hard cut at 6.5s.

6.5–8.5s — 24mm from a rock ledge close to the sea stack. The aircraft banks hard around the stack, tilted about 20 degrees, passing close to the camera; the camera whips to follow as it clears the stack at 8.0s, without stopping. BACKGROUND: surf exploding at the base of the stack, the lighthouse beyond. Hard cut at 8.5s.

8.5–10.0s — 50mm close-up of the pilot's helmet from a camera rig flying alongside, front three-quarter, outside the roll cage; the camera pushes in until the visor fills most of the frame. The dark visor reflects the coastline and the low sun. At 9.2s the reflected sun slides into the centre of the visor and blooms until warm golden light fills the entire visor and most of the frame by 10.0s. The clip ends on the bright sun filling the visor.

SOUND
No music: the score is added in post. Diegetic sound only: outdoor wind; the rotor roar rising and falling with distance; surf against the cliffs; a close rotor pass with a natural Doppler shift at 8.0s; inside the last shot the rotor heard slightly muffled through the helmet. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the aircraft's belly covering the whole frame, never on a wide or a close-up.
- Exactly one aircraft, identical to @prop_dream, eight spinning propellers.
- The pilot's visor is down in every frame; his face is never seen.
- The aircraft always flies toward the lighthouse; screen direction never flips.
- Cliffs on the left, sea on the right when looking toward the lighthouse; the sea stack and lighthouse never move.
- Cuts at 1.5s, 4.0s, 6.5s and 8.5s are hard cuts; the clip ends on the sun filling the visor at 10.0s.
- Colour stays rich and punchy, never washed out or hazy.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 3 场 · ARRIVAL · 6.0 s

```
A 6-second live-action finale, 16:9, at dusk. Opens on a match: the low sun that filled the pilot's visor becomes the setting sun over the sea. The aircraft returns against the sun, lands on a cliff-top pad, the propellers slow, and the pilot lifts his visor and looks out to sea.

REFERENCES
@prop_dream — the aircraft; every detail; ignore the grey backdrop.
@char_pilot3 — the pilot. His face, identical to the portrait panel, is seen after 4.0s; the CoolFly wordmark on his left chest stays readable.
@loc_pad — the cliff-top landing pad at dusk. The plate's camera angle IS the first shot's angle; the pad is empty until the aircraft lands.

LOOK
Clean modern digital cinema, 24–85mm lenses. The sun just above the horizon, warm golden backlight, long soft shadows, glittering sea, deep clean blacks in the silhouettes. The aircraft's orange fairing is the strongest colour; natural light only, no glow or light effects on the aircraft. Slow, weighted camera moves.

CHARACTERS
The pilot — the same American man as @char_pilot3: short dark-brown hair, light stubble, grey-green eyes. Calm. After landing he lifts the visor, breathes out once and looks at the sea. Never speaks, never looks into the lens, never smiles broadly.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame, eight two-blade carbon propellers: translucent discs in flight, slowing to visible blades after landing. Never redesigned, no extra or missing parts, no added logos or text.

WHERE EVERYTHING IS — fixed for the whole clip
The circular concrete pad with its thin orange ring lies on the grassy cliff top; the sea and the setting sun are beyond it; a low dry-stone wall runs along the cliff edge on the right of the first camera. The aircraft lands in the centre of the ring, nose toward the sea.

SHOTS
0.0–2.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: exactly the angle of @loc_pad, low on the grass, the sun just above the horizon in the centre of frame, the empty pad in the foreground. At 0.3s the aircraft enters from the left of frame, silhouetted against the sun, and descends toward the pad. The camera pushes in slowly. BACKGROUND: sun, sea, the stone wall at right. Hard cut at 2.0s.

2.0–3.6s — 35mm side-on at pad height. The aircraft settles onto the centre of the ring at 2.6s; the grass around the pad bends flat in the downwash; the propellers slow toward visible blades. The orange front fairing with its white stripes and the number 05 faces the camera side; the dark-grey roll cage and carbon arms stay matte and unlit, lit only by the natural sunset. BACKGROUND: the glittering sea and the low sun. Hard cut at 3.6s.

3.6–6.0s — 85mm front three-quarter on the seated pilot, through the roll cage, a slow push-in that eases to a stop by 5.6s and holds. At 4.0s he lifts the visor with one gloved finger; his face, the same man as @char_pilot3, is lit by the warm sunset; the CoolFly wordmark on his chest catches the light. At 4.9s he breathes out once, calm, and looks out to the sea. BACKGROUND: soft golden sea and sky. The clip ends on this held frame at 6.0s.

SOUND
No music: the score is added in post. Diegetic sound only: wind on the cliff top; surf far below; the rotor roar descending; a soft touchdown thump at 2.6s; motor spin-down whine 2.6–4.6s; a visor click at 4.0s; one calm exhale at 4.9s; then only the wind. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the sun at the angle of @loc_pad, never on a close-up.
- Exactly one aircraft, identical to @prop_dream, eight propellers.
- Exactly one pilot; his face matches @char_pilot3 and is seen only after 4.0s.
- The pad, the orange ring and the stone wall never move.
- Cuts at 2.0s and 3.6s are hard cuts; the clip ends on the held frame at 6.0s.
- The roll cage, arms and fairing never glow, light up or turn into outlines; no light trails, rim-light effects or added light effects anywhere.
- The orange front fairing with two white stripes and the number 05 is visible whenever the aircraft is in frame.
- Warm and rich colour, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 时间码校验

- 第 1 场：0.0–1.6 · 1.6–3.4 · 3.4–5.0 · 5.0–6.4 · 6.4–8.4 · 8.4–10.0 · 10.0–12.0，连续，结束 = 12.0 s ✓
- 第 2 场：0.0–1.5 · 1.5–4.0 · 4.0–6.5 · 6.5–8.5 · 8.5–10.0，连续，结束 = 10.0 s ✓
- 第 3 场：0.0–2.0 · 2.0–3.6 · 3.6–6.0，连续，结束 = 6.0 s ✓
- 三场都没有台词；SOUND 里的时间点与镜头动作一致 ✓
