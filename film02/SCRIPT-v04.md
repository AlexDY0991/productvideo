# CoolFly DREAM · v04 脚本「First Light」（按 higgsfield-timed-prompts 方法）

> 状态：脚本待确认；资产图（第一步）已完成，见 `film02/assets/`；视频还没生成。
> 结构：3 场戏 = 3 次 Seedance 2.5 生成（16 s + 18 s + 8 s = 42 s），后期再加 3 s 橙色 logo 卡，全片 45 s，16:9。
> 每场戏内部的镜头、运镜、转场和原生音效都写进提示词，由模型一次拍出；后期只加配乐、数据字幕和结尾卡。

## 一句话

**凌晨，机库的灯一排排亮起，驾驶员戴上头盔、启动 Dream，飞出机库，沿着清晨的海岸飞行一整天，黄昏降落在崖顶，抬起面罩看海。**

## 资产（第一步，先做、先确认）

| 标签 | 内容 | 状态 |
|---|---|---|
| `@char_pilot2` | 驾驶员三联定妆照：东亚男性约 30 岁，黑色飞行服、黑手套、黑色全盔 | ✓ |
| `@prop_dream` | Dream 三视图：3/4 前侧、正侧、俯视（照片级，基于 3D 模型参考） | ✓ |
| `@loc_hangar` | 夜间机库：积水地面、6 排顶灯、中央起降方块、左侧工具车、右侧小门、远端卷帘门外是黎明的海 | ✓ |
| `@loc_coast` | 清晨海岸航拍：玄武岩悬崖、海蚀柱、远处灯塔 | ✓ |
| `@loc_pad` | 黄昏崖顶起降台：橙色圆环、草地、夕阳在海平线上 | ✓ |

## 三场戏一览

| 场 | 时长 | 镜头 | 转场 | 后期叠加 |
|---|---|---|---|---|
| 1 · 点火（机库，黎明前） | 16 s | 顶灯逐排亮起 → 驾驶员走进来（露脸）→ 戴头盔、放面罩 → 握操纵杆、电机绿灯 → 螺旋桨启动吹起水雾 → 离地 → 冲出卷帘门、从镜头上方掠过 | 机腹完全遮满画面时切到第 2 场 | — |
| 2 · 海岸（清晨） | 18 s | 机腹移开露出海面 → 贴海高速追拍 → 沿海岸航拍 → 长焦侧面跟拍 → 绕海蚀柱侧倾 → 俯拍越过海岸线 → 面罩倒映太阳，阳光铺满面罩 | 面罩里的太阳匹配切到第 3 场的落日 | `100 km/h`（2–5 s），`40 min`（8–10.5 s） |
| 3 · 抵达（黄昏） | 8 s | 落日前 Dream 逆光飞来 → 降落在崖顶起降台，螺旋桨慢下来 → 驾驶员抬起面罩，看海 | 切到整屏橙色 logo 卡 | Dream Pro / ST 参数（2.5–5 s） |

## 积分

| 方案 | 计算 | 积分 |
|---|---|---|
| 资产图 5 张 | 5 × 8 | 40 |
| 720p 测试三场 | 42 s × 20 | 约 840 |
| 1080p 正式三场（各 1 条） | 42 s × 64 | 约 2,688 |

现在约剩 2,100。建议：先确认脚本和资产 → 用 720p 测试第 1 场（约 320）→ 满意再定正式版预算。

---

## 第 1 场 · IGNITION · 16.0 s

```
A 16-second live-action launch film, 16:9. Night in an aircraft hangar: the ceiling lights wake a CoolFly Dream, a pilot suits up, the motors start, and the aircraft flies out through the rolling door and passes directly over the camera, its belly covering the whole frame for the cut into the next scene.

REFERENCES
@prop_dream — the aircraft. Take every detail of shape, livery, arms, motors and propellers from it; ignore its grey studio backdrop.
@char_pilot2 — the pilot. Take his face, hair, flight suit, gloves and helmet; ignore the grey backdrop and the sheet layout.
@loc_hangar — the hangar. The plate's camera angle IS the first shot's angle. The plate shows an empty pad; in this clip the aircraft stands on it.

LOOK
Clean modern digital cinema, 24–100mm lenses, deep clean blacks, punchy contrast, crisp detail. Cold white light from the ceiling rows; the aircraft's orange is the strongest colour in every shot; pale blue dawn beyond the rolling door. Physically plausible, weighted camera moves with slow starts and precise stops.

CHARACTERS
The pilot — calm, precise, unhurried. He never speaks and never looks into the lens. Once his visor is down at 5.6s it stays down for the rest of the clip.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange glossy front fairing with two white vertical stripes and the number 05, dark-grey tubular steel roll cage with an arched roof, white bucket seat with harness, four carbon-fibre arms in an X layout, a coaxial pair of black motors at each arm tip (one above, one below) with two-blade carbon propellers, eight propellers in total, open perforated steel floor. Never redesigned; no extra or missing arms, motors or propellers; no added logos or text. Propellers are still until 8.3s; after that they are translucent spinning discs.

WHERE EVERYTHING IS — fixed for the whole clip
The aircraft stands on the painted square pad in the centre of the hangar, nose toward the tall rolling door at the far end. Six rows of ceiling lights run from the rolling door toward the near end. The steel tool cart stands against the left wall at the near end; the small side door is in the right wall. The pilot enters through the side door and stops beside the cockpit on the aircraft's right side.

WHAT IS BEHIND EACH OF THEM
Behind the aircraft (seen from the near end): the half-open rolling door with pale blue dawn over the sea. Behind the pilot at the cockpit: the right wall and the lit side door.

SHOTS
0.0–2.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: exactly the angle of @loc_hangar, a locked 24mm at floor level beside the tool cart, almost total darkness, only a thin line of blue dawn under the rolling door; the aircraft stands unlit on the pad. The ceiling rows switch on one at a time from the far door toward the camera at 0.3s, 0.6s, 0.9s, 1.2s, 1.5s and 1.8s; each new row slides a long white highlight further along the orange fairing and lights a new stretch of the wet floor. BACKGROUND: the half-open rolling door and the blue dawn. Nobody in frame. Hard cut at 2.0s.

2.0–4.0s — 50mm medium shot at chest height from the right side of the pad, trucking left with the pilot at walking speed and settling. The pilot walks in from the side door at screen right, helmet carried in his left hand, face fully visible, and stops beside the cockpit at 3.4s. BACKGROUND: the lit roll cage and orange fairing fill the left half of frame; behind the pilot, the right wall and the lit side door. Hard cut at 4.0s.

4.0–6.2s — 85mm close-up, slightly low, front three-quarter on the pilot, a slow push-in that never stops. Both gloved hands lift the helmet; he pulls it on at 4.6s, settles it and gives the chin strap one short tug; at 5.6s he lowers the dark visor with one gloved finger. BACKGROUND: soft out-of-focus rows of ceiling light. At 6.2s the dark visor fills most of the frame. Hard cut on the visor.

6.2–8.0s — 100mm macro inside the cockpit: his right gloved hand closes on the flight control grip; through the roll cage a carbon arm and a coaxial motor pair sit soft in the background. His fingers tighten at 6.8s. At 7.2s the green status lights on the motors blink on one after another, left to right. BACKGROUND: dark hangar, the soft edge of the orange fairing. Hard cut at 8.0s.

8.0–10.5s — locked low 24mm at floor level beside the front-right arm tip; the coaxial motors in the right third of frame, the seated pilot soft in the cockpit at left. At 8.3s both propellers start turning; by 9.2s they are translucent discs. The water on the floor shivers, then at 9.5s sprays outward in a ring of fine mist toward the lens. BACKGROUND: the far left wall with the tool cart. Hard cut at 10.5s.

10.5–13.0s — wide 24mm from floor level just inside the open rolling door, looking back into the hangar. The aircraft with the seated pilot lifts vertically from the pad to about 1.5 metres between 10.8s and 12.4s, a ring of mist spreading across the wet floor, the ceiling lights sliding over the fairing. The camera rises slowly with it and eases to a stop. BACKGROUND: the lit hangar interior, the tool cart now at screen right and the side door at screen left. Hard cut at 13.0s.

13.0–16.0s — outside the hangar, a locked camera at ground level on the concrete apron just past the rolling door, looking back in through the open door. The aircraft accelerates out through the door toward the camera, nose first, and passes directly over the lens. From 15.4s to 16.0s its belly, open steel floor and arms fill the whole frame, every edge and corner, with strong motion blur. BACKGROUND: the lit hangar through the door, dawn light on the wet apron. The clip ends on the fully covered frame.

SOUND
No music: the score is added in post. Diegetic sound only: hangar room tone; a heavy electrical clunk for each ceiling row at 0.3s, 0.6s, 0.9s, 1.2s, 1.5s and 1.8s; footsteps on wet concrete 2.0–3.4s; helmet and strap sounds 4.6–5.4s; a crisp visor click at 5.6s; a soft electronic chirp at 7.2s; motor whine rising from 8.3s; water hiss at 9.5s; deep rotor roar from 10.8s; outdoor wind from 13.0s; one huge rotor roar as the aircraft passes overhead, peaking at 15.6s and cut off at 16.0s. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the dark hangar at the angle of @loc_hangar, never on a close-up.
- Exactly one aircraft, identical to @prop_dream in every frame; eight propellers, never more or fewer.
- Exactly one pilot, identical to @char_pilot2; his face is seen only before 4.6s.
- The helmet stays on and the visor stays down after 5.6s.
- Pad, tool cart, side door and rolling door never move; screen geography flips only on the reverse angle at 10.5s, as stated.
- Propellers are still until 8.3s.
- Cuts at 2.0s, 4.0s, 6.2s, 8.0s, 10.5s and 13.0s are hard cuts; the clip ends on the fully covered frame at 16.0s.
- Colour stays rich and punchy in every shot, never washed out or hazy.
- No subtitles, on-screen text, logos or watermarks.
```

## 第 2 场 · THE COAST · 18.0 s

```
An 18-second live-action flight sequence, 16:9, early morning on a rocky coast. Opens mid-situation: the aircraft has just flown out of the hangar directly over the camera and its belly still covers the whole frame. It climbs away over the cliff edge, skims the sea, flies the coast, banks around a sea stack, crosses the cliffs, and the clip ends on the low sun filling the pilot's visor.

REFERENCES
@prop_dream — the aircraft. Every detail of shape, livery, arms, motors and propellers; ignore the grey backdrop.
@char_pilot2 — the pilot's suit, gloves and helmet. His visor stays down for the whole clip; his face is never seen.
@loc_coast — the coastline geography: basalt cliffs, the offshore sea stack, the lighthouse on the far headland. The plate's camera angle IS the angle of the 5.0–8.0s shot.

LOOK
Clean modern digital cinema. 16–35mm wides for energy, a 200mm long lens for the side tracking shot. Soft silver overcast with a low sun breaking through near the horizon; deep blue-grey sea, black basalt, white surf; the aircraft's orange is the strongest colour. Fast but physically plausible aerial camera moves with weight and inertia.

CHARACTERS
The pilot — seated, harnessed, calm and precise. Never speaks, never looks into the lens, visor down throughout.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange front fairing with two white stripes and the number 05, dark-grey tubular roll cage, white seat, four carbon arms in an X layout, coaxial motor pairs at each tip, eight two-blade carbon propellers spinning as translucent discs the whole time, open perforated steel floor. Never redesigned, no extra or missing parts, no added logos or text.

WHERE EVERYTHING IS — fixed for the whole clip
The coast runs from the near cliff top toward the far headland with the lighthouse. Looking along the coast toward the lighthouse, the cliffs are on the left and the open sea is on the right; the sea stack stands offshore in the middle distance, just right of the cliffs. The aircraft always flies along the coast toward the lighthouse. Screen direction never flips: in side shots it travels left to right; in chase shots it moves away from the camera.

SHOTS
0.0–2.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: the aircraft's belly, open steel floor and arms fill the whole frame, every edge and corner, seen from below with strong motion blur. The aircraft keeps moving away; by 0.8s the frame uncovers and reveals it climbing away over the edge of a cliff top, the grey sea and the far coastline beyond. The camera, low on the cliff-top grass, tilts up to follow and holds steady. BACKGROUND: silver sky and the sea horizon. Hard cut at 2.0s.

2.0–5.0s — 24mm chase from behind and to the left, three metres above the water, keeping pace. The aircraft skims low over the sea at full speed, its downwash ploughing a white trail of mist; waves rush under the lens with strong motion blur. At 4.4s the aircraft pulls ahead of the camera. BACKGROUND: the cliffs on the left, the lighthouse headland far ahead. Hard cut at 5.0s.

5.0–8.0s — exactly the angle of @loc_coast: aerial 35mm from about 40 metres, looking along the coast. The aircraft enters from the lower left of frame and flies along the cliffs toward the lighthouse, small in frame, its shadow travelling on the water below; the camera drifts forward with it. BACKGROUND: basalt cliffs, the sea stack, the lighthouse. Hard cut at 8.0s.

8.0–10.5s — 200mm side tracking shot at the aircraft's altitude, keeping pace. The aircraft is side-on, travelling left to right, filling about a third of the frame; the pilot is visible in the cage, visor down. The cliffs behind streak past with heavy parallax. At 9.8s the aircraft begins to bank toward the sea stack. BACKGROUND: dark cliffs and surf. Hard cut at 10.5s.

10.5–13.5s — 24mm from a rock ledge close to the sea stack. The aircraft banks hard around the stack, tilted about 20 degrees, passing close to the camera; the camera whips to follow as it clears the stack at 12.8s, without stopping. BACKGROUND: surf exploding at the base of the stack, the lighthouse beyond. Hard cut at 13.5s.

13.5–16.0s — straight-down top shot, 24mm, from about 40 metres, tracking with the aircraft. It crosses from the sea at the right of frame over the cliff edge onto the land at the left; the X of the four arms, the spinning discs and the orange fairing are clearly visible, its shadow sliding across white surf and then black rock. BACKGROUND: sea at the right of frame, rocks at the left. Hard cut at 16.0s.

16.0–18.0s — 50mm close-up of the pilot's helmet from a camera rig flying alongside, front three-quarter, outside the roll cage; the roll cage tubes frame the edges. The dark visor reflects the coastline and the low sun. At 17.4s the reflected sun slides across the visor and fills it with warm light. The clip ends on the bright sun filling the visor.

SOUND
No music: the score is added in post. Diegetic sound only: outdoor wind; the rotor roar rising and falling with distance; surf against the cliffs; a close rotor pass with a natural Doppler shift at 12.8s; inside the last shot the rotor heard slightly muffled through the helmet. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the aircraft's belly covering the whole frame, never on a wide or a close-up.
- Exactly one aircraft, identical to @prop_dream, eight spinning propellers.
- The pilot's visor is down in every frame; his face is never seen.
- The aircraft always flies toward the lighthouse; screen direction never flips.
- Cliffs on the left, sea on the right when looking toward the lighthouse; the sea stack and lighthouse never move.
- All cuts are hard cuts; the clip ends on the sun filling the visor at 18.0s.
- Colour stays rich and punchy, never washed out or hazy.
- No subtitles, on-screen text, logos or watermarks.
```

## 第 3 场 · ARRIVAL · 8.0 s

```
An 8-second live-action finale, 16:9, at dusk. Opens on a match: the low sun that filled the pilot's visor becomes the setting sun over the sea. The aircraft returns against the sun, lands on a cliff-top pad, the propellers slow, and the pilot lifts his visor and looks out to sea.

REFERENCES
@prop_dream — the aircraft; every detail; ignore the grey backdrop.
@char_pilot2 — the pilot. His face, identical to the portrait panel, is seen after 5.6s.
@loc_pad — the cliff-top landing pad at dusk. The plate's camera angle IS the first shot's angle; the pad is empty until the aircraft lands.

LOOK
Clean modern digital cinema, 24–85mm lenses. The sun just above the horizon, warm golden backlight, long soft shadows, glittering sea, deep clean blacks in the silhouettes. The aircraft's orange glows in the backlight. Slow, weighted camera moves.

CHARACTERS
The pilot — calm. After landing he lifts the visor, breathes out once and looks at the sea. Never speaks, never looks into the lens, never smiles broadly.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame, eight two-blade carbon propellers: translucent discs in flight, slowing to visible still blades after landing. Never redesigned, no extra or missing parts, no added logos or text.

WHERE EVERYTHING IS — fixed for the whole clip
The circular concrete pad with its thin orange ring lies on the grassy cliff top; the sea and the setting sun are beyond it; a low dry-stone wall runs along the cliff edge on the right of the first camera. The aircraft lands in the centre of the ring, nose toward the sea.

SHOTS
0.0–2.5s — THE VERY FIRST FRAME OF THE CLIP IS THIS: exactly the angle of @loc_pad, low on the grass, the sun just above the horizon in the centre of frame, the empty pad in the foreground. At 0.4s the aircraft enters from the left of frame, silhouetted against the sun, and descends toward the pad. The camera pushes in slowly. BACKGROUND: sun, sea, the stone wall at right. Hard cut at 2.5s.

2.5–5.0s — 35mm side-on at pad height. The aircraft settles onto the centre of the ring at 3.6s; the grass around the pad bends flat in the downwash; the propellers slow from discs to visible blades by 4.8s. A golden rim light runs along the roll cage and arms. BACKGROUND: the glittering sea and the low sun. Hard cut at 5.0s.

5.0–8.0s — 85mm front three-quarter on the seated pilot, through the roll cage, a slow push-in that eases to a stop by 7.6s and holds. At 5.6s he lifts the visor with one gloved finger; his face, the same man as @char_pilot2, is lit by the warm sunset. At 6.6s he breathes out once, calm, and looks out to the sea. BACKGROUND: soft golden sea and sky. The clip ends on this held frame at 8.0s.

SOUND
No music: the score is added in post. Diegetic sound only: wind on the cliff top; surf far below; the rotor roar descending; a soft touchdown thump at 3.6s; motor spin-down whine 3.6–6.0s; a visor click at 5.6s; one calm exhale at 6.6s; then only the wind. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the sun at the angle of @loc_pad, never on a close-up.
- Exactly one aircraft, identical to @prop_dream, eight propellers.
- Exactly one pilot; his face matches @char_pilot2 and is seen only after 5.6s.
- The pad, the orange ring and the stone wall never move.
- Cuts at 2.5s and 5.0s are hard cuts; the clip ends on the held frame at 8.0s.
- Warm and rich colour, never washed out.
- No subtitles, on-screen text, logos or watermarks.
```

## 时间码校验

- 第 1 场：0.0–2.0 · 2.0–4.0 · 4.0–6.2 · 6.2–8.0 · 8.0–10.5 · 10.5–13.0 · 13.0–16.0，连续，结束 = 16.0 s ✓
- 第 2 场：0.0–2.0 · 2.0–5.0 · 5.0–8.0 · 8.0–10.5 · 10.5–13.5 · 13.5–16.0 · 16.0–18.0，连续，结束 = 18.0 s ✓
- 第 3 场：0.0–2.5 · 2.5–5.0 · 5.0–8.0，连续，结束 = 8.0 s ✓
- 三场都没有台词；各场声音列表里的时间点和镜头里的动作时间一致 ✓
