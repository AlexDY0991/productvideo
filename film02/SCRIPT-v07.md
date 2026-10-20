# CoolFly DREAM · v07 脚本「First Light」— 面向美国用户 · 三段 × 14 秒

> 状态：**待用户确认**。故事、人物和美国用户的五个判断都沿用 v06（`SCRIPT-v06.md` 第 1 节）。
> 结构：3 次 Seedance 2.5 多参考生成，每次 14 s，共 42 s，后期加 3 s 橙色 logo 卡，全片 45 s，16:9。
> 每段内部的镜头切换都写进同一条提示词，由模型一次拍出。段与段之间是普通硬切，不再用「机腹遮挡」「全白雾」这类强行匹配的转场。

## 用户对 v06 样片的意见 → v07 的改法

| 意见 | 改法 |
|---|---|
| 第 1 部分的头盔是突然出现在主角头上的 | 戴头盔单独做成一个连续的特写：从腿上拿起头盔 → 举过头顶 → 戴上 → 扣下巴带 → 放下透明面罩，每一步都有时间点。KEEP CONSISTENT 里写明：头盔不能凭空出现 |
| 飞得太高，合理高度是离地约 20 米，不能到云层上 | 删掉「云上」这一幕。全片高度上限是离水面或地面约 20 米，所有镜头的机位也按这个高度写；画面里不出现脚下的云海 |
| 不可能和鸟一起飞 | 删掉所有鹈鹕和海鸟 |
| 最后一幕降落时，人不能离这么近 | 降落点在草地远端，离早餐桌和家人至少 40 米。螺旋桨完全停转之前，所有人都站在桌边不动；停稳以后女儿才跑过来 |
| 改成每段 15 秒左右一次生成，转场都在一条里做 | 三段，每段 14 秒，每段内部的转场都由模型一次完成。段与段之间是普通硬切：时间、地点都换了，观众按剪辑习惯能看懂 |

## 情绪最高点挪到海面上 20 米

不上云层以后，第 2 段要靠这四个镜头撑起情绪：
1. **规模感：** 从拱桥正下方的海面拍，拱桥高高地压在画面上方，Dream 贴着海面从桥下的海湾穿过，飞行高度远低于桥面。
2. **表情：** 侧面跟拍，透过透明面罩，看到他从专注变成咧嘴大笑。
3. **自由：** 右手一直握着操纵杆，左手张开伸到风里。
4. **只有 Dream 能给的视角：** 透过镂空踏板往下看，十几米下面的海浪和浪花从靴子底下飞快掠过。这是 20 米高度最真实、也最让人想亲身试一次的画面。

## 三段一览

| 段 | 时长 | 内容 | 后期小字（英文） |
|---|---|---|---|
| 1 · TAKEOFF | 14 s | 黎明前的车库：放下咖啡 → 检查螺旋桨 → 扣安全带 → 完整戴上头盔 → 玻璃门升起 → 离地 → 飞出车库、越过崖边 → 远景：Dream 贴着海面飞向日出 | — |
| 2 · THE COAST | 14 s | 日出时的海岸，高度约 15–20 米：贴海追拍 → 侧拍大笑，背景公路上有一辆车 → 从拱桥下方飞过 → 张开左手 → 透过镂空踏板看海浪 → 转向崖顶草地 | `100 km/h` |
| 3 · HOME | 14 s | 远处是早餐桌和等着的家人 → 在草地远端降落，螺旋桨停稳 → 女儿跑过来 → 他摘下头盔，把女儿抱进座椅，给她戴上头盔 → 女儿抬头看天，他看着女儿笑 | `40 min`，然后 `Dream Pro · Dream ST` 参数 |

资产沿用 v06：`@char_pilot4`、`@char_pilot3`、`@char_family`、`@prop_dream`、`@loc_garage`、`@loc_coast_us`、`@loc_breakfast`。`@loc_clouds` 不再使用。

## 积分

| 项目 | 计算 | 积分 |
|---|---|---|
| 三段样片模式 | 42 s × 9 | 378 |
| 1080p 直出三段 | 42 s × 64 | 约 2,688 |
| 合计 | | 约 3,066 |

今天剩 3,558，扣掉上面两项后还剩约 490，大约够返修一段样片再加半段高清。

---

## 第 1 段 · TAKEOFF · 14.0 s

```
A 14-second live-action film opening, 16:9, the blue hour before dawn at a clifftop house on the California coast. A man walks into his private glass garage, where a CoolFly Dream stands in the bay where a car would be, checks it by hand, buckles in, puts on his helmet, opens the glass door to the sea and lifts off; the aircraft glides out over the cliff edge and heads off low over the Pacific toward the first light of sunrise.

REFERENCES
@prop_dream — the aircraft. Take every detail of shape, livery, arms, motors and propellers; ignore its grey studio backdrop.
@char_pilot4 — the pilot. Take his face, hair, flight suit with both CoolFly wordmarks, gloves and the black helmet with the perfectly clear visor; ignore the grey backdrop and the sheet layout.
@loc_garage — the garage. The plate's camera angle IS the first shot's angle. The plate shows an empty centre bay; in this clip the aircraft stands in it.

LOOK
Clean modern digital cinema, 24–85mm lenses, deep clean blacks, crisp detail. Cool blue pre-dawn light through the glass door mixed with one warm brass wall lamp over the workbench; outside, the sky over the ocean warms toward sunrise by the end of the clip; the aircraft's orange is the strongest colour in every shot. Quiet, architectural, aspirational. Physically plausible, weighted camera moves with slow starts and precise stops.

CHARACTERS
The pilot — an American man in his mid-30s, short dark-brown hair, light stubble, grey-green eyes, real skin. Calm, competent, quietly excited. He never speaks and never looks into the lens. He carries the helmet in his hand until he puts it on in the 3.6–6.6s shot; after that the clear visor is down and his face stays clearly visible through it.

SUIT RULE
Matte black one-piece flight suit exactly as @char_pilot4: the CoolFly wordmark printed small on the left chest and large across the upper back, 'Cool' in off-white and 'Fly' in orange, the same slanted stencil letters, never misspelled, mirrored or redesigned. These two prints are the only text allowed in the clip.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange glossy front fairing with two white vertical stripes and the number 05, dark-grey tubular steel roll cage with an arched roof, white bucket seat with harness, four carbon-fibre arms in an X layout, a coaxial pair of black motors at each arm tip (one above, one below) with two-blade carbon propellers, eight propellers in total, open perforated steel floor. Never redesigned, never round or spherical; no extra or missing arms, motors or propellers; no added logos or text; nothing on it glows. Propellers are still until 7.4s; after that they are translucent spinning discs. It never flies higher than about 20 metres above the ground or the water.

WHERE EVERYTHING IS — fixed for the whole clip
The aircraft stands in the centre bay on the concrete floor, nose toward the tall full-width glass garage door; beyond the door is a concrete apron, the cliff edge and the Pacific. The long walnut workbench with the warm brass lamp runs along the left wall. The pilot enters from screen right and works on the aircraft's right side.

WHAT IS BEHIND EACH OF THEM
Behind the aircraft (seen from inside): the glass door and the blue ocean. Behind the pilot at the aircraft's right side: the plain right wall and the timber ceiling.

SHOTS
0.0–2.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: exactly the angle of @loc_garage, a locked 24mm at floor height in the back right corner, the garage dim and blue, the warm lamp on over the workbench, the aircraft standing still in the centre bay in silhouette against the glass door. At 0.4s the pilot walks in from screen right, the helmet in his left hand, and at 1.4s sets a steaming coffee mug down on the workbench. BACKGROUND: the glass door and the ocean. Hard cut at 2.0s.

2.0–3.6s — 50mm medium shot at chest height, trucking alongside the pilot as he walks the right side of the aircraft, the helmet still in his left hand. His face is fully visible, calm, a faint private smile; the CoolFly wordmark is readable on his left chest. He runs his gloved right hand slowly along the leading edge of a still carbon propeller blade, a pre-flight check. At 3.1s he turns toward the seat and the large CoolFly wordmark across his back is clearly readable. BACKGROUND: the orange fairing and the roll cage in the foreground, the plain right wall behind him. Hard cut at 3.6s.

3.6–6.6s — one continuous 85mm close-up, front three-quarter, a slow push-in that never stops. He is seated, bare-headed, the helmet resting on his lap. At 3.8s he clicks the harness buckle shut across his chest. At 4.2s he lifts the helmet from his lap with both hands, raises it above his head and at 4.8s pulls it down over his head in one clear, visible motion; at 5.4s he fastens the chin strap; at 6.0s he lowers the perfectly clear visor with one finger. Through the visor his grey-green eyes look ahead at the glass door, focused, the corner of his mouth lifting. BACKGROUND: soft out-of-focus timber ceiling and the blue glass door. Hard cut at 6.6s.

6.6–8.2s — wide 24mm from outside, on the concrete apron, looking back into the garage. The whole glass door rolls up from 6.6s to 7.6s; inside, the green status lights on the motors blink on one after another, and at 7.4s the propellers begin to turn. The seated pilot is visible in the cage. BACKGROUND: the lit garage interior, the warm lamp, the workbench. Hard cut at 8.2s.

8.2–10.2s — locked low 24mm at floor level inside, beside the front-right arm tip; the coaxial motors in the right third of frame, the seated pilot clearly visible in the cockpit at left. The propellers are translucent discs; dust blows outward along the floor toward the lens. Between 8.6s and 10.0s the aircraft lifts smoothly and vertically to about 1.5 metres, perfectly level and controlled. BACKGROUND: the open door and the brightening ocean. Hard cut at 10.2s.

10.2–12.2s — 35mm side-on from the apron beside the cliff edge, a slow pan. The aircraft glides out through the open door at walking pace, passes the camera, crosses the cliff edge and eases out over the sea at a low, steady height, the pilot visible in the seat. BACKGROUND: the house and garage behind, then the ocean and the warming horizon. Hard cut at 12.2s.

12.2–14.0s — wide 35mm from the clifftop, about 20 metres above the sea, looking out along the coast. The aircraft flies away from camera, small, orange and clear, about 15 metres above the water, toward the first gold of sunrise on the horizon, its downwash drawing a faint line on the swells. The clip ends on this wide.

SOUND
No music: the score is added in post. Diegetic sound only: quiet room tone and distant surf; footsteps on concrete from 0.4s; the soft knock of the mug on wood at 1.4s; a gloved hand brushing carbon at 2.6s; a crisp harness click at 3.8s; helmet shell and strap sounds 4.8–5.4s; a visor click at 6.0s; the glass door's motor hum 6.6–7.6s with wind and surf rushing in; a soft electronic chirp at 7.0s; motor whine rising from 7.4s; deep rotor roar from 8.6s; the rotor passing at 11.0s; then wind, surf and the rotor fading into the distance. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the dim garage at the angle of @loc_garage, never on a close-up.
- The helmet is in his hand until 4.2s and goes onto his head only in the 3.6–6.6s shot, in one clear visible motion; it never simply appears on his head.
- Exactly one aircraft, identical to @prop_dream in every frame; eight propellers, never more or fewer; nothing on it glows.
- Exactly one pilot, identical to @char_pilot4, both CoolFly wordmarks on the suit; after 6.0s the clear visor is down and his face stays visible through it.
- The pilot is visible in the seat in every shot after 3.6s; the aircraft is never empty.
- The aircraft never flies higher than about 20 metres above the ground or the water; no birds, no clouds below it.
- Workbench, lamp and glass door never move.
- Propellers are still until 7.4s.
- Cuts at 2.0s, 3.6s, 6.6s, 8.2s, 10.2s and 12.2s are hard cuts; the clip ends on the wide at 14.0s.
- Colour stays rich and clean, never washed out or hazy.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 2 段 · THE COAST · 14.0 s

```
A 14-second live-action flight sequence, 16:9, sunrise on the Big Sur coast of California. Opens mid-situation: the aircraft is already flying north along the coast, low over the Pacific, about 15 metres above the water. It races the swells, passes far below the towering arch bridge of the coastal highway, the pilot grins and opens his free hand to the wind, the surf streams past beneath his boots, and the aircraft turns toward a green clifftop meadow and starts to descend.

REFERENCES
@prop_dream — the aircraft. Every detail of shape, livery, arms, motors and propellers; ignore the grey backdrop.
@char_pilot4 — the pilot: face, suit with both CoolFly wordmarks, gloves, the black helmet with the perfectly clear visor down; his face is visible through the visor.
@loc_coast_us — the coastline: golden-grass hills, dark cliffs, the concrete arch bridge carrying the two-lane coastal highway high above a canyon mouth, the ocean. Take the geography and light; the camera heights in this clip are lower, as written per shot.

LOOK
Clean modern digital cinema, 24–85mm lenses. Low warm sunrise light from the right over the ocean, long shadows on the golden hills, deep blue Pacific, white surf, soft morning mist lying in the canyon mouths; the aircraft's orange is the strongest colour. Fast but smooth, graceful camera moves with weight and inertia; the flying is confident and controlled, never reckless.

CHARACTERS
The pilot — the same American man as @char_pilot4, seated and harnessed, right hand always on the control grip, clear visor down, his face and eyes clearly visible through it. Focus turning into pure, open joy. Never speaks, never looks into the lens.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange front fairing with two white stripes and the number 05, dark-grey tubular roll cage with an arched roof, white seat, four carbon arms in an X layout, coaxial motor pairs at each tip, eight two-blade carbon propellers spinning as translucent discs the whole time, open perforated steel floor. Never redesigned, never round or spherical, no extra or missing parts, no added logos or text, nothing on it glows. The pilot is visible in the seat in every shot. It always flies between about 10 and 20 metres above the water, never higher.

WHERE EVERYTHING IS — fixed for the whole clip
Looking north along the coast: the hills, cliffs, the coastal highway and the arch bridge are on the left (land side); the open Pacific is on the right; the sun is low over the ocean on the right. The aircraft always flies north over the water, never over people or traffic. In side shots it travels left to right.

SHOTS
0.0–2.6s — THE VERY FIRST FRAME OF THE CLIP IS THIS: a 24mm chase from behind and to the right, the camera about 12 metres above the swells, keeping pace with the aircraft, which fills the centre of frame flying away from camera about 15 metres above the water, the pilot's helmet visible in the cage. Swells and foam rush under the lens with motion blur; its downwash draws a soft line of spray on the water. BACKGROUND: the golden hills and cliffs on the left, the coastline running ahead. Hard cut at 2.6s.

2.6–5.0s — 85mm side tracking shot at the aircraft's height, keeping pace, the aircraft side-on travelling left to right. Through the perfectly clear visor his face is clearly visible: at 3.0s his focus breaks into a wide, open grin and he shakes his head once, delighted. Behind him, out of focus, the coastal highway runs along the cliffs with one small car moving slowly on it. BACKGROUND: golden hills, the highway, the cliffs. Hard cut at 5.0s.

5.0–7.6s — a locked 24mm low on the water at the mouth of the canyon, looking up: the huge concrete arch bridge towers across the top of the frame, its deck far above. The aircraft flies across the frame from left to right just above the water, far below the deck, small against the massive arch, its downwash lifting spray; the camera pans to follow. BACKGROUND: the arch, the canyon walls, the morning sky. Hard cut at 7.6s.

7.6–9.6s — 35mm medium shot from outside the roll cage at the pilot's left side. His right hand stays firmly on the control grip; at 7.9s he lifts his left gloved hand and opens it slowly into the airflow beside the cage, fingers spread, feeling the wind, the sleeve rippling. BACKGROUND: the sunlit ocean and the cliffs behind him. Hard cut at 9.6s.

9.6–11.6s — straight down from just above the seat, between the pilot's knees: his black boots rest on the open perforated steel floor, and through its holes and past its edges the sunlit swells and white foam stream past about 15 metres below. BACKGROUND: the moving sea beneath. Hard cut at 11.6s.

11.6–14.0s — wide 35mm from a clifftop about 20 metres above the sea. The aircraft banks gently to the left in a wide, graceful curve toward a green clifftop meadow ahead and begins to descend, the sun behind it lighting the propeller discs. The clip ends on this wide.

SOUND
No music: the score is added in post. Diegetic sound only: outdoor wind; the rotor roar rising and falling with distance; surf against the cliffs; a distant car passing on the highway at 3.4s; the rotor echoing off the canyon walls under the bridge at 6.2s; air rushing past the open hand from 7.9s; the hiss of waves below from 9.6s. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the chase shot low over the water, never on a wide or a close-up.
- Exactly one aircraft, identical to @prop_dream, eight spinning propellers, never round or spherical; the pilot is in the seat in every shot.
- It always flies about 10–20 metres above the water, far below the bridge deck; no clouds below it, no birds anywhere.
- His right hand stays on the control grip the whole time; only the left hand opens to the wind.
- The clear visor is down in every frame and his face is visible through it; no dark or mirrored visor; no frontal close-up of the helmet.
- The aircraft always flies north over the water, never over people or traffic; land on the left, ocean on the right.
- Cuts at 2.6s, 5.0s, 7.6s, 9.6s and 11.6s are hard cuts; the clip ends on the wide at 14.0s.
- Colour stays rich and punchy, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 3 段 · HOME · 14.0 s

```
A 14-second live-action finale, 16:9, a clear sunny morning on a wide clifftop meadow on the California coast. His wife and young daughter wait by a breakfast table at the near end of the meadow; the aircraft lands far away at the other end, at least 40 metres from them; the motors are switched off and the propellers stop completely; only then does the daughter run across the grass. He takes off his helmet, lifts her into the seat and sets the too-big helmet on her head; she looks up at the sky with shining eyes while he watches her and smiles. The aircraft stays switched off on the ground.

REFERENCES
@prop_dream — the aircraft; every detail; ignore the grey backdrop.
@char_pilot4 — the pilot in his suit with both CoolFly wordmarks, gloves and the black helmet with the perfectly clear visor.
@char_pilot3 — the pilot's face and hair without a helmet, seen after he takes the helmet off at 7.0s; ignore the grey backdrop.
@char_family — his wife (shoulder-length light-brown hair, cream knit sweater, dark jeans) and their 8-year-old daughter (long sandy-blonde hair, freckles, light denim jacket, white T-shirt, navy leggings, white sneakers); ignore the grey backdrop and the sheet layout.
@loc_breakfast — the clifftop meadow. The plate's camera angle IS the first shot's angle: the breakfast table on the left near camera, the long open meadow stretching away to the right; the aircraft lands at the far end of that open meadow.

LOOK
Clean modern digital cinema, 24–85mm lenses. Warm golden morning sun from the right, long soft shadows, morning mist lying low over the ocean beyond the cliff edge, clear blue sky, wild flowers in the grass; the aircraft's orange is the strongest colour. Natural light only. Slow, gentle camera moves; warm and tender.

CHARACTERS
The pilot — the same American man as @char_pilot3 and @char_pilot4. Glowing, a little windswept, a quiet proud smile. Never speaks, never looks into the lens.
The wife — as @char_family. Relaxed, amused, warm. She stays by the breakfast table until the propellers have stopped, then walks slowly across.
The daughter — as @char_family, 8 years old. Bursting with excitement, she stays at her mother's side by the table until the propellers have stopped, then runs across the meadow; inside the seat she goes still with wonder.
No one speaks; only the girl laughs once.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame, eight two-blade carbon propellers. It descends from about 15 metres and lands at 3.0s at the far end of the meadow, at least 40 metres from the table and the family; the motors are switched off at once, the propellers slow and are completely still by 4.6s, and the aircraft never moves or lifts again. The girl only sits in it on the ground. Never redesigned, never round or spherical, no extra or missing parts, no added logos or text, nothing on it glows. The pilot is visible in the seat until he climbs out.

WHERE EVERYTHING IS — fixed for the whole clip
From the first camera: the breakfast table with the white linen cloth, coffee pot and mugs is on the left, near camera; the wife and the daughter stand beside it; the long open meadow runs away to the right; the aircraft lands at its far end, at least 40 metres from the table, nose toward the ocean; the cliff edge and the ocean are behind. No vehicles anywhere, no other people.

SHOTS
0.0–2.6s — THE VERY FIRST FRAME OF THE CLIP IS THIS: exactly the angle of @loc_breakfast, low in the grass: the breakfast table on the left near camera, the wife and the daughter standing beside it, shading their eyes and looking up and across the meadow. Far away at the other end of the open meadow, the aircraft descends from about 15 metres, small, orange, the pilot visible in the seat. BACKGROUND: the long meadow, the cliff edge, the ocean, the blue sky. Hard cut at 2.6s.

2.6–4.8s — 50mm side-on at grass height at the far end of the meadow, nobody near. The aircraft settles gently onto the grass at 3.0s, the grass flattening in a ring around it; the propellers slow from discs to visible blades and are completely still by 4.6s. Far behind it, tiny and out of focus, the wife and the daughter are still standing by the table. BACKGROUND: the meadow, the distant table, the sky. Hard cut at 4.8s.

4.8–6.8s — wide 35mm from just behind the parked aircraft, looking back across the meadow toward the table. The propellers are completely still. At 5.0s the daughter breaks away from her mother and runs across the long meadow toward the camera, hair flying; the wife follows slowly, smiling. BACKGROUND: the breakfast table, the meadow, the morning sun. Hard cut at 6.8s.

6.8–9.4s — 50mm medium shot beside the cockpit. The pilot has unbuckled; at 7.0s he pulls his helmet off, his short dark-brown hair messed by the wind, his face the same man as @char_pilot3, grinning. The daughter arrives at 7.8s, breathless and laughing; he stands, lifts her by the waist and sets her into the white seat by 9.2s. BACKGROUND: the meadow and the ocean; the wife small in the distance, walking over. Hard cut at 9.4s.

9.4–11.2s — 50mm, front three-quarter on the daughter in the seat. At 9.6s he places the big helmet on her head; it is far too big and tilts a little to one side; at 10.2s she giggles and pushes it straight with both hands. BACKGROUND: the soft meadow and sky. Hard cut at 11.2s.

11.2–14.0s — 85mm, front three-quarter on the daughter in the seat, a slow push-in that eases to a stop by 13.2s and holds. Through the clear visor of the too-big helmet her eyes shine as she tilts her head back and looks up at the sky, lips parted in wonder, small hands resting on the still control grip. The aircraft is switched off and motionless; its propellers are still. In the soft foreground at the right edge, the pilot's shoulder; at 12.4s the focus shifts to him: he is watching her, and smiles. The clip ends on this held frame at 14.0s.

SOUND
No music: the score is added in post. Diegetic sound only: meadow wind and birdsong; the rotor descending in the distance; a soft touchdown at 3.0s; motor spin-down whine 3.0–4.6s, then silence from the aircraft; the girl's quick footsteps in the grass from 5.0s; helmet strap sounds at 7.0s; her breathless laugh at 7.8s; one short delighted giggle at 10.2s; then only the wind. No dialogue, words, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the angle of @loc_breakfast with the family by the table and the aircraft far away, never on a close-up.
- The aircraft lands at least 40 metres from the table; nobody is near it until the propellers are completely still at 4.6s; the girl starts running only at 5.0s.
- Exactly one aircraft, identical to @prop_dream, eight propellers; switched off and completely still from 4.6s; it never lifts or moves again; the girl never flies.
- The pilot is in the seat whenever the aircraft is in the air; his face matches @char_pilot3 after the helmet comes off.
- Exactly three people: the pilot, the wife, the daughter, as their references; no one else, no vehicles, no birds near the aircraft.
- Cuts at 2.6s, 4.8s, 6.8s, 9.4s and 11.2s are hard cuts; the clip ends on the held frame at 14.0s.
- Warm, rich colour, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 时间码校验

- 第 1 段：0.0–2.0 · 2.0–3.6 · 3.6–6.6 · 6.6–8.2 · 8.2–10.2 · 10.2–12.2 · 12.2–14.0，连续，结束 = 14.0 s
- 第 2 段：0.0–2.6 · 2.6–5.0 · 5.0–7.6 · 7.6–9.6 · 9.6–11.6 · 11.6–14.0，连续，结束 = 14.0 s
- 第 3 段：0.0–2.6 · 2.6–4.8 · 4.8–6.8 · 6.8–9.4 · 9.4–11.2 · 11.2–14.0，连续，结束 = 14.0 s
- 没有台词；SOUND 里的时间点与镜头动作一致
