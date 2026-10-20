# CoolFly DREAM · v09 脚本「First Light」— 段间无缝衔接 · 去掉 05 · 张手特写

> 状态：**待用户确认**。第 1 段沿用 v08 的样片（`film02/clips/v08-draft/V8P1.mp4`），不重跑；第 2、3、4 段重写后按顺序生成。
> 结构：11 + 11 + 10 + 10 = 42 s，后期接 3 s 整屏橙色 logo 卡，全片 45 s，16:9。

## 用户对 v08 样片的意见

1. 段与段之间的转场生硬，运镜没有丝滑感。比如第 3 段女儿往上看，怎么过渡到第 4 段的咖啡杯？
2. 张手慢动作不明显，是不是要把镜头拉过去？
3. 05 不好处理的话，全片都不要出现。

## 诊断：接缝为什么生硬（逐帧看了每个接缝的前后各两帧）

| 接缝 | 上一段最后 | 下一段开头 | 问题 |
|---|---|---|---|
| 1 → 2 | FPV 俯冲，地平线斜约 30°，Dream 很小，太阳在左上 | 地平线是平的，Dream 变大，太阳在右边 | 倾斜、大小、光线方向三样同时跳变 |
| 2 → 3 | 高空俯拍 Dream 飞向绿色崖顶 | 贴着草地的平视远景，画面里看不到 Dream | 机位从高空一下子掉到地面 |
| 3 → 4 | 女儿和爸爸的近景 | 手放下咖啡杯的近景 | 运动方向没有关联；女儿并没有真的往上看 |

根本原因：每段是分开生成的，模型不知道上一段最后一帧长什么样，只能按文字去猜。

## 解决办法：下一段的第一帧 = 上一段的最后一帧

1. **按顺序生成，每次拿上一段的最后一帧做参考。** 把上一段样片的最后一帧截出来，上传成图片节点（`@p1_end`、`@p2_end`、`@p3_end`），在下一段提示词里写明「THE VERY FIRST FRAME OF THIS CLIP IS EXACTLY @pN_end」，并且要求开头的运镜和上一段同方向、同速度地继续。这样构图、光线、地平线角度都能接上。
2. **每个接缝都设计一个「桥」：**
   - **1 → 2：** 同一个 FPV 运镜继续。第 2 段从倾斜的地平线开始，1 秒内一边加速追近 Dream，一边把地平线转平。
   - **2 → 3：** 同一个下降运镜继续。第 2 段结尾，镜头在 Dream 后上方，跟着它降向崖顶；第 3 段接着往下降，穿过草地边缘的野花，落到草地高度，同时露出左边早餐桌旁的家人。
   - **3 → 4：** 用天空做桥。第 3 段结尾，女儿仰头看天，镜头跟着她的视线往上摇，直到明亮的晨空和柔和的太阳光晕铺满画面；第 4 段从同一片天空往下摇，落到正在放下咖啡杯的手上，再露出一家人。笑声从第 3 段一直延续到第 4 段，做声音桥。
   - **4 → logo 卡：** 定版远景静止，然后硬切整屏橙色 logo 卡，和 Eletre 的做法一样。
3. **段内也遵守同一条规则：** 切点两边的运动方向一致，左到右就一直左到右；切点两边的镜头速度相近；切在动作上。
4. **后期补一层：** 接缝前后各 4–6 帧做速度渐变；声音和配乐跨过接缝连续，不在接缝处断开。

## 张手慢动作：镜头拉过去

第 2 段 6.2–8.8 秒改成一个专门的升格镜头：
- 先拍他的侧脸；
- 他抬起左手的同时，镜头沿着手臂慢慢移出去，越过手肘，一直推到张开的手；
- 7.6 秒时，戴手套的手占满大半个画面：手指张开，风吹得手套和袖子在抖，阳光从指缝里闪过，背后的海岸虚化成流动的光；
- 8.6 秒时手指慢慢合拢，速度猛地恢复。

## 05：全片不出现

- 新做了一张 Dream 三视图 `@prop_dream2`：去掉 05，整流罩只有橙色和两条白色条纹，其他和原图完全一样。
- 第 2–4 段全部改用 `@prop_dream2`，并写明飞行器上不出现任何数字、字母或文字。
- 第 4 段原来拍 05 的细节快切，改成拍两条白色条纹和橙色漆面的弧线。
- 第 1 段沿用 v08，逐帧检查过，看不到 05。

## 一个提醒：加州的太阳方向

加州海岸面朝西，日出在陆地一侧，不会从海面升起。现在第 1 段结尾、第 4 段定版，太阳都在海平面上，更像日落。大多数观众不会注意，但熟悉加州的人可能看得出来。这一版先不改，因为改了会牵动第 1 段和定版构图。如果你在意，可以把故事时间改成傍晚：清晨出发改成傍晚出发，早餐改成晚餐。

## 积分

| 项目 | 积分 |
|---|---|
| `@prop_dream2` 三视图（已做） | 8 |
| 第 2、3、4 段样片（按顺序跑） | 99 + 90 + 90 = 279 |
| 1080p 直出四段 | 约 2,688 |

今天剩 2,786，样片跑完剩约 2,507；四段 1080p 还差约 180 积分，可以先直出三段，剩下一段明天出。

---

## 第 1 段 · TAKEOFF · 11.0 s（沿用 v08 样片，不重跑；提示词留作记录）

```
An 11-second live-action commercial opening, 16:9, the blue hour before dawn at a clifftop ranch on the California coast. A man slides open the huge door of his private hangar; the CoolFly Dream already stands outside on the landing circle of the apron; he checks it by hand, sits and puts on his helmet in a slow, deliberate ritual — then the rhythm explodes: rapid close-ups of the propellers, the grip and the downwash, the aircraft lifts off the apron, sweeps over the camera, and the camera spins round and dives after it off the cliff edge toward the sunrise. Slow build, then a burst of fast cuts. The camera never stops moving.

REFERENCES
@prop_dream — the aircraft. Take every detail of shape, livery, arms, motors and propellers; ignore its grey studio backdrop.
@char_pilot4 — the pilot. Take his face, hair, flight suit with both CoolFly wordmarks, gloves and the black helmet with the perfectly clear visor; ignore the grey backdrop and the sheet layout.
@loc_hangar_us — the hangar and apron: the long dark timber-and-steel hangar on the left with its two huge sliding doors, the warm-lit interior with the walnut workbench and brass lamp, the concrete apron with the large white landing circle, the golden grass, the cliff edge and the Pacific on the right. The plate shows the doors open and the circle empty; in this clip the doors start closed and the aircraft stands in the centre of the circle.

LOOK
High-end automotive commercial, clean modern digital cinema, 24–100mm lenses including macro, deep clean blacks, crisp detail. Deep blue pre-dawn light outside, warm lamplight spilling from the hangar, the first gold on the horizon growing by the end; the aircraft's orange is the strongest colour in every shot. RHYTHM: 0.0–6.2s is slow and deliberate — long, smooth, weighted camera moves; 6.2–11.0s explodes into fast cuts of 0.5–0.7s and hard, accelerating moves. The camera is always moving; no locked-off shots.

CHARACTERS
The pilot — an American man in his mid-30s, short dark-brown hair, light stubble, grey-green eyes, real skin. Calm, competent, quietly excited. He never speaks and never looks into the lens. He carries the helmet in his hand until he puts it on in the 4.0–6.2s shot; after that the clear visor is down and his face stays clearly visible through it.

SUIT RULE
Matte black one-piece flight suit exactly as @char_pilot4: the CoolFly wordmark printed small on the left chest and large across the upper back, 'Cool' in off-white and 'Fly' in orange, the same slanted stencil letters, never misspelled, mirrored or redesigned. These two prints are the only text allowed in the clip.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange glossy front fairing with two white vertical stripes and the number 05, dark-grey tubular steel roll cage with an arched roof, white bucket seat with harness, four carbon-fibre arms in an X layout, a coaxial pair of black motors at each arm tip (one above, one below) with two-blade carbon propellers, eight propellers in total, open perforated steel floor. Never redesigned, never round, spherical or hexagonal; no extra or missing parts; no added logos or text. Its small status lights are tiny and soft and never light up the aircraft or the ground. It stands outside on the landing circle the whole time and takes off from there, never inside the hangar. Propellers are still until 6.2s; after that they are translucent spinning discs. It never flies higher than about 20 metres above the ground or the water.

WHERE EVERYTHING IS — fixed for the whole clip
From the apron looking toward the sea: the hangar on the left with its sliding doors; the aircraft in the centre of the white landing circle on the apron, nose toward the ocean; the golden grass, the cliff edge and the Pacific on the right and ahead. Inside the hangar, the workbench and lamp on its left wall.

SHOTS
0.0–2.4s — THE VERY FIRST FRAME OF THE CLIP IS THIS: inside the dark hangar, low, looking at the closed sliding doors, a thin line of blue dawn light along their edge. At 0.3s the pilot sets a steaming coffee mug down on the workbench in the near foreground, then grips a door handle and slides one huge door open; the camera dollies slowly forward behind him as the door panel glides across the whole frame — a natural foreground wipe — and deep blue dawn floods in, revealing the apron, the aircraft standing on the landing circle and the ocean beyond. SLOW. BACKGROUND: the door, then the apron and the sea.

2.4–4.0s — outside on the apron, 50mm, a slow lateral dolly at chest height alongside the pilot as he walks around the parked aircraft, helmet in his left hand, face fully visible, a faint private smile, the CoolFly wordmark on his left chest. He runs his gloved right hand slowly along the leading edge of a still carbon propeller blade; at 3.4s the large CoolFly wordmark across his back is readable as he turns to the seat; at 3.8s he swings down into the seat — cut on that movement at 4.0s. SLOW. BACKGROUND: the warm open hangar behind, the ocean.

4.0–6.2s — 85mm, one continuous slow orbit of about 60 degrees around the seated pilot, never stopping. At 4.2s he clicks the harness buckle; at 4.5s he lifts the helmet from his lap with both hands, raises it above his head and at 5.0s pulls it down over his head in one clear, visible motion; at 5.5s he fastens the chin strap; at 5.9s he lowers the perfectly clear visor; through it his eyes look ahead at the sea, focused, the corner of his mouth lifting. SLOW. BACKGROUND: the hangar glow, the deep blue sky.

6.2–6.8s — FAST: 100mm macro on a coaxial motor pair as the two-blade propeller snaps into motion and blurs into a translucent disc, the camera whipping past it.

6.8–7.3s — FAST: 100mm macro of his gloved right hand pushing the control grip forward, the camera rushing in.

7.3–8.0s — FAST: ground level at the edge of the landing circle, the camera sliding fast; the downwash blasts a ring of dust and grass outward across the concrete toward the lens.

8.0–9.4s — 35mm low wide from the apron, the camera craning up fast as the aircraft lifts smoothly and vertically off the circle to about 4 metres between 8.1s and 9.2s, perfectly level, the pilot visible in the seat, the hangar glowing behind.

9.4–11.0s — FAST: the aircraft surges forward directly over the camera, its belly and open perforated floor sweeping across the lens at 9.6s; the camera tilts over and spins 180 degrees to follow in one continuous move, then dives off the cliff edge after it like an FPV drone, dropping toward the sea and chasing it low over the water toward the first gold of sunrise, accelerating. The clip ends mid-chase, the camera still moving fast.

SOUND
No music: the score is added in post. Diegetic sound only: dawn wind and distant surf; the soft knock of the mug on wood at 0.3s; the heavy rumble of the sliding door on its rail 0.6–2.2s; footsteps on concrete from 2.4s; a gloved hand brushing carbon at 3.0s; seat and harness sounds at 3.8s; a crisp buckle click at 4.2s; helmet shell and strap sounds 5.0–5.5s; a visor click at 5.9s; then a sudden sharp motor whine at 6.2s, a grip click at 6.8s, a blast of downwash at 7.3s, a deep rotor roar from 8.1s, a huge rotor pass overhead at 9.6s, then wind and surf rushing as the camera dives. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens inside the dark hangar on the closed doors, never on a close-up of the aircraft.
- The aircraft stands outside on the landing circle and takes off from there; it never flies inside the hangar or through a door.
- Rhythm: slow until 6.2s, then fast cuts at 6.8s, 7.3s and 8.0s, then the climb and the dive.
- The camera never stops; no locked-off shots.
- The helmet is in his hand until 4.5s and goes on only in the 4.0–6.2s orbit, in one clear visible motion; it never simply appears on his head.
- Exactly one aircraft, identical to @prop_dream; eight propellers; its status lights never glow on the aircraft or the ground.
- Exactly one pilot, identical to @char_pilot4, both CoolFly wordmarks; after 5.9s the clear visor is down; he is in the seat in every shot after 4.0s.
- The aircraft never flies higher than about 20 metres; no birds, no clouds below it.
- Colour stays rich and clean, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 2 段 · THE COAST · 11.0 s

```
An 11-second live-action commercial flight sequence, 16:9, sunrise on the Big Sur coast of California. It continues the previous clip without a break: it opens on exactly the previous clip's last frame, mid-dive, and the same FPV move carries on. The aircraft races the swells, the pilot grins, the camera whips to the towering arch bridge and flies under it with him, bursts into sunlight, then in slow motion travels out along his arm to his open hand in the wind; real speed snaps back, the camera looks down through the cage at the sea beneath his boots, then rises high behind the aircraft as it banks toward a green clifftop meadow and starts to descend. Rhythm: fast, one slow-motion breath, fast again. The camera never stops moving.

REFERENCES
@p1_end — the last frame of the previous clip. THE VERY FIRST FRAME OF THIS CLIP IS EXACTLY THIS IMAGE: same framing, same tilted horizon, same light, same position and size of the aircraft.
@prop_dream2 — the aircraft. Every detail of shape, livery, arms, motors and propellers; ignore the grey backdrop.
@char_pilot4 — the pilot: face, suit with both CoolFly wordmarks, gloves, the black helmet with the perfectly clear visor down; his face is visible through the visor.
@loc_coast_us — the coastline: golden-grass hills, dark cliffs, the concrete arch bridge carrying the coastal highway high above a canyon mouth, the ocean. Take the geography and light; camera heights here are lower, as written per shot.

LOOK
High-end automotive commercial, clean modern digital cinema, 16–85mm lenses. Low warm sunlight, long shadows on the golden hills, deep blue Pacific, white surf, soft morning mist in the canyon mouths; the light direction stays exactly as in @p1_end for the whole clip; the aircraft's orange is the strongest colour. The camera is always moving with real speed, weight and inertia; across every cut the direction of motion continues and the camera speed is similar on both sides. RHYTHM: 0.0–6.2s fast (shots of 0.4–1.6s); 6.2–8.8s a smooth speed ramp into slow motion, the one quiet breath of the film; 8.8–11.0s back to full speed. No locked-off shots.

CHARACTERS
The pilot — the same American man as @char_pilot4, seated and harnessed, right hand always on the control grip, clear visor down, his face and eyes clearly visible through it. Focus turning into pure, open joy. Never speaks, never looks into the lens.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream2 in every frame: plain glossy orange front fairing with two white vertical stripes, dark-grey tubular roll cage with an arched roof, white seat, four carbon arms in an X layout, coaxial motor pairs at each tip, eight two-blade carbon propellers spinning as translucent discs the whole time, open perforated steel floor. No numbers, letters, logos or text anywhere on the aircraft. Never redesigned, never round, spherical or hexagonal; no extra or missing parts; nothing on it glows. The pilot is visible in the seat in every shot. It always flies between about 10 and 20 metres above the water, never higher.

WHERE EVERYTHING IS — fixed for the whole clip
Looking north along the coast: the hills, cliffs, the coastal highway and the arch bridge are on the left (land side); the open Pacific is on the right. The aircraft always flies north over the water, never over people or traffic. At the end it banks right toward a green clifftop meadow ahead.

SHOTS
0.0–1.6s — THE VERY FIRST FRAME OF THE CLIP IS EXACTLY @p1_end: the FPV camera diving low over the sea behind the small aircraft, the horizon tilted. The same move continues at the same speed and direction without a break: the FPV rolls the horizon level by 1.0s while it accelerates and closes in behind the aircraft, three metres above the swells, foam rushing under the lens. FAST.

1.6–2.4s — FAST, cut on movement: a camera skimming just above the water; the aircraft roars past close beside the lens from left to right, spray kicking up.

2.4–4.0s — 50mm, the camera tracking just ahead of the cockpit at front three-quarter, travelling with it. Through the perfectly clear visor his face is clearly visible: at 2.7s his focus breaks into a wide, open grin and he shakes his head once, delighted. At 3.7s he looks ahead toward the coast and the camera whip-pans right along his gaze.

4.0–4.4s — FAST: the whip pan, a motion-blurred swish across the coast, continuing to the right.

4.4–6.2s — the whip lands: low over the water at the canyon mouth, the huge concrete arch bridge towering ahead across the top of the frame, its deck far above. The aircraft flies toward it just above the water and the camera follows close behind; at 5.1s both pass under the arch, the bridge's shadow sweeping over the lens; at 5.9s they burst out of the shadow into bright sunlight that flares across the lens.

6.2–8.8s — SLOW MOTION: the action ramps smoothly into slow motion. 85mm, the camera starts close on the pilot's left profile through the clear visor, calm and overjoyed. At 6.4s he lifts his left arm out beside the cage; the camera travels slowly out along his arm, past the elbow, to his open hand: by 7.6s the gloved hand fills most of the frame, fingers spread wide, the wind rippling the glove and the sleeve, sunlight flickering between the fingers, the coast streaming past behind as soft flowing light. At 8.6s his fingers close slowly. His right hand stays on the control grip, out of frame.

8.8–9.6s — FAST: real speed snaps back; the camera whips up over the arched roof of the roll cage and looks straight down between his knees: his black boots on the open perforated steel floor, and through its holes the sunlit swells and white foam stream past about 15 metres below.

9.6–11.0s — the camera pulls straight up and back out of the cage, rising high above and behind the aircraft as it banks gently to the right toward a green clifftop meadow ahead and begins to descend toward it; the camera follows it down. The clip ends with the camera high behind the descending aircraft, the aircraft in the lower centre of frame, the green meadow and the cliff edge ahead.

SOUND
No music: the score is added in post. Diegetic sound only: wind and rushing water continuing from the previous clip; the rotor roar rising and falling; a close rotor pass at 2.0s; the natural air rush of the whip pan at 4.0s; the rotor booming under the bridge at 5.1s, opening out into bright wind at 5.9s; during the slow motion 6.2–8.8s everything drops to a low, soft rush of wind over the glove and his calm breathing; full sound slams back at 8.8s with the hiss of waves below; the rotor note dropping as it descends from 9.6s. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The first frame is exactly @p1_end and the FPV move continues from it without a break, never a new composition.
- Rhythm: fast to 6.2s, one smooth slow-motion breath 6.2–8.8s with the open hand filling the frame, full speed again from 8.8s.
- The camera never stops; across every cut the direction of motion continues and the speed is similar.
- Exactly one aircraft, identical to @prop_dream2, eight spinning propellers; no numbers or text on it; the pilot is in the seat in every shot.
- It always flies about 10–20 metres above the water, far below the bridge deck; no clouds below it, no birds anywhere.
- His right hand stays on the control grip the whole time; only the left hand opens to the wind.
- The clear visor is down in every frame; no dark or mirrored visor.
- Land on the left, ocean on the right; it flies north and banks right toward the meadow at the end.
- Colour stays rich and punchy, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 3 段 · HOME · 10.0 s

```
A 10-second live-action commercial scene, 16:9, a clear sunny morning on a wide clifftop meadow on the California coast. It continues the previous clip without a break: it opens on exactly the previous clip's last frame, high behind the descending aircraft, and the same descending camera move carries on down to the meadow, revealing his wife and young daughter waiting by a breakfast table. The aircraft lands far away at the other end of the meadow, at least 40 metres from them; the propellers stop completely; only then does the daughter run across the grass. He takes off his helmet, lifts her into the seat and sets the too-big helmet on her head; he watches her and smiles; she tilts her head back to look at the sky and the camera follows her gaze up into the bright morning sky. The aircraft stays switched off on the ground.

REFERENCES
@p2_end — the last frame of the previous clip. THE VERY FIRST FRAME OF THIS CLIP IS EXACTLY THIS IMAGE.
@prop_dream2 — the aircraft; every detail; ignore the grey backdrop.
@char_pilot4 — the pilot in his suit with both CoolFly wordmarks, gloves and the black helmet with the perfectly clear visor.
@char_pilot3 — the pilot's face and hair without a helmet, seen after he takes the helmet off at 5.8s; ignore the grey backdrop.
@char_family — his wife (shoulder-length light-brown hair, cream knit sweater, dark jeans) and their 8-year-old daughter (long sandy-blonde hair, freckles, light denim jacket, white T-shirt, navy leggings, white sneakers); ignore the grey backdrop and the sheet layout.
@loc_breakfast — the clifftop meadow: the breakfast table on the left, the long open meadow stretching away to the right; the aircraft lands at the far end of that open meadow.

LOOK
High-end lifestyle commercial, clean modern digital cinema, 24–85mm lenses, shallow depth of field. Warm golden morning sun, long soft shadows, morning mist lying low over the ocean beyond the cliff edge, clear blue sky, wild flowers; the aircraft's orange is the strongest colour. Natural light only. The camera is always moving, gently — one continuous descending crane at the start, then slides, slow orbits and motivated focus pulls; across every cut the motion continues. Warm and tender. No locked-off shots.

CHARACTERS
The pilot — the same American man as @char_pilot3 and @char_pilot4. Glowing, a little windswept, a quiet proud smile. Never speaks, never looks into the lens.
The wife — as @char_family. Relaxed, amused, warm. She stays by the table until the propellers have stopped, then walks slowly across.
The daughter — as @char_family, 8 years old. Bursting with excitement, she stays at her mother's side until the propellers have stopped, then runs across the meadow; in the seat she goes still with wonder.
No one speaks; only the girl laughs.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream2 in every frame, eight two-blade carbon propellers, plain orange fairing with two white stripes, no numbers, letters or text anywhere on it. It descends to the far end of the meadow and lands at 2.4s, at least 40 metres from the table; the motors are switched off at once and the propellers are completely still by 3.8s; it never moves or lifts again. The girl only sits in it on the ground. Never redesigned, never round or hexagonal, nothing on it glows. The pilot is in the seat until he climbs out.

WHERE EVERYTHING IS — fixed for the whole clip
The breakfast table with the white linen cloth, coffee pot and mugs is on the left near the meadow's edge; the wife and the daughter stand beside it; the long open meadow runs away to the right; the aircraft lands at its far end, at least 40 metres from the table, nose toward the ocean. No vehicles, no other people.

SHOTS
0.0–2.6s — THE VERY FIRST FRAME OF THE CLIP IS EXACTLY @p2_end: the camera high behind the descending aircraft, the green meadow and the cliff edge ahead. The same descending move continues without a break: the camera follows the aircraft down and keeps sinking, down through the tops of tall wild-flower stems at the meadow's edge to grass level; as it lands it reveals, on the left, the breakfast table with the wife and the daughter beside it, shading their eyes and looking up. The aircraft continues to the far end of the meadow on the right and settles on the grass at 2.4s, small and far away. BACKGROUND: the long meadow, the cliff edge, the ocean.

2.6–4.0s — 50mm, the camera slides low over the grass toward the far end of the meadow, continuing the same direction; the grass around the parked aircraft flattens in a ring; the propellers slow from discs to visible blades and are completely still by 3.8s. Nobody is near it.

4.0–5.6s — 50mm close on a still carbon propeller blade in sharp focus in the foreground, the camera drifting slowly sideways; at 4.2s, far away across the meadow, the daughter breaks away from her mother and runs toward the aircraft, and the focus pulls from the blade to her as she runs closer, hair flying; the wife follows slowly.

5.6–7.6s — 50mm, a slow orbit around the cockpit. At 5.8s the pilot pulls his helmet off, his short dark-brown hair messed by the wind, his face the same man as @char_pilot3, grinning. The daughter arrives at 6.3s, breathless and laughing; he lifts her by the waist and swings her up into the white seat — cut on that movement as she lands in the seat at 7.6s.

7.6–10.0s — 85mm, front three-quarter on the daughter in the seat, a slow push-in. At 7.8s he sets the big helmet on her head; it is far too big and tilts to one side; at 8.1s she giggles and pushes it straight with both hands; at 8.5s the focus pulls to his face beside her: he watches her and smiles. At 9.0s she tilts her head back and looks up at the sky with shining eyes, and the camera follows her gaze, tilting up past the top of her helmet into the bright morning sky; by 9.8s soft bright blue sky with a gentle warm sun flare fills the whole frame, every edge and corner. The clip ends on the bright sky.

SOUND
No music: the score is added in post. Diegetic sound only: wind continuing from the previous clip; the rotor descending; a soft touchdown at 2.4s; motor spin-down whine 2.4–3.8s, then silence from the aircraft; meadow wind and birdsong; the girl's quick footsteps in the grass from 4.2s; helmet strap sounds at 5.8s; her breathless laugh at 6.3s; a delighted giggle at 8.1s that keeps ringing softly as the camera rises into the sky. No dialogue, words, narrator, stings or added whooshes.

KEEP CONSISTENT
- The first frame is exactly @p2_end and the descending move continues from it without a break, down to grass level.
- The aircraft lands at least 40 metres from the table; nobody is near it until the propellers are completely still at 3.8s; the girl starts running only at 4.2s.
- Exactly one aircraft, identical to @prop_dream2; no numbers or text on it; switched off and still from 3.8s; it never lifts or moves again; the girl never flies.
- The pilot's face matches @char_pilot3 after the helmet comes off.
- Exactly three people: the pilot, the wife, the daughter; no one else, no vehicles, no birds near the aircraft.
- The clip ends with the camera tilted up into the bright sky filling the whole frame.
- Warm, rich colour, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 4 段 · FINALE · 10.0 s

```
A 10-second live-action commercial finale, 16:9, the same sunny clifftop morning, a little later. It continues the previous clip without a break: it opens on exactly the previous clip's last frame, the bright morning sky, and the camera tilts and cranes down out of the sky to a coffee mug being set down on the breakfast table, revealing the family laughing together at breakfast with the Dream parked far away on the meadow; a slow orbit around the parked aircraft, three quick macro beats of its details, and then the stillest, longest shot of the film: the family standing beside the Dream at the cliff edge, seen from behind, looking out at the ocean and the sun, held for five seconds with open sky above for the title.

REFERENCES
@p3_end — the last frame of the previous clip. THE VERY FIRST FRAME OF THIS CLIP IS EXACTLY THIS IMAGE.
@prop_dream2 — the aircraft; every detail of shape, livery, carbon arms, coaxial motors and propellers; ignore the grey backdrop.
@char_pilot3 — the pilot without a helmet, still in his black flight suit with the CoolFly wordmarks (as @char_pilot4).
@char_pilot4 — the flight suit and both CoolFly wordmarks.
@char_family — his wife and their 8-year-old daughter, exactly as their sheet.
@loc_breakfast — the clifftop meadow with the breakfast table on the left, the long open meadow to the right and the cliff edge above the ocean.

LOOK
High-end automotive commercial finale, clean modern digital cinema, 35–100mm lenses including macro, shallow depth of field. Warm low golden sun, a soft natural sheen on the orange clear coat, real carbon weave, morning mist on the ocean beyond the cliff edge. Natural light only; nothing on the aircraft glows. RHYTHM: slow 0.0–3.6s, three quick beats 3.6–5.1s, then complete stillness 5.1–10.0s — the calm after the energy, like the held final shot of a car commercial. The camera keeps only a barely perceptible drift in the final shot; no handheld shake.

CHARACTERS
The pilot — the same American man as @char_pilot3, no helmet, black flight suit, relaxed, laughing with his family. Never looks into the lens.
The wife and the daughter — as @char_family, happy and relaxed.
No one speaks.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream2 in every frame, parked and switched off on the grass near the cliff edge at the far end of the meadow, at least 40 metres from the table, nose toward the ocean; all eight propellers are completely still; it never moves. Plain glossy orange front fairing with two white vertical stripes, dark-grey tubular roll cage, white seat, four carbon arms, coaxial motor pairs. No numbers, letters, logos or text anywhere on the aircraft. Never redesigned.

SHOTS
0.0–2.0s — THE VERY FIRST FRAME OF THE CLIP IS EXACTLY @p3_end: the bright morning sky with a gentle sun flare filling the frame. The camera tilts and cranes down out of the sky in one smooth move; at 0.9s the wife's hand sets a steaming ceramic coffee mug down on the white linen tablecloth in the near foreground; the focus pulls to reveal the family at the breakfast table — the pilot laughing, the daughter on his knee, the wife sitting down beside them — and, far behind them at the end of the meadow, the parked orange Dream in the golden light. SLOW.

2.0–3.6s — 35mm low, a slow orbit around the parked aircraft on the grass, from its front three-quarter toward its side, the low sun flaring softly through the roll cage and rimming the arms, the grass moving in the breeze. SLOW.

3.6–4.1s — QUICK: 100mm macro gliding along a carbon-fibre arm, the real weave catching the light.

4.1–4.6s — QUICK: 100mm macro sliding over the black coaxial motor pair and a still two-blade propeller.

4.6–5.1s — QUICK: 100mm macro gliding along the curve of the plain orange fairing and its two white stripes, the sky reflected in the clear coat; no numbers or text.

5.1–10.0s — THE FINAL HERO SHOT, STILL, lasting the full 4.9 seconds: a wide 35mm from low behind, a calm symmetrical composition. The parked Dream stands at the cliff edge in the right half of frame, seen from behind, nose to the ocean, its arms and still propellers in silhouette, a warm rim of sunlight along the roll cage. Beside it on the left, the family stands with their backs to camera looking out to sea: the pilot with his daughter riding on his shoulders, the wife leaning against him. Beyond them the glittering ocean, the morning mist and the low sun just above the horizon at the centre. The upper third of the frame is open, clean sky. The camera pushes in so slowly that it is almost still; nobody moves except the girl's hair and the grass in the wind. The clip ends on this held frame at 10.0s.

SOUND
No music: the score is added in post. Diegetic sound only: the girl's giggle continuing from the previous clip and melting into the family's quiet laughter at the table, no words; the soft knock of the mug on the table at 0.9s; meadow wind, distant surf and birdsong; in the final shot only a soft wind and the far surf. No dialogue, words, narrator, stings or added whooshes.

KEEP CONSISTENT
- The first frame is exactly @p3_end and the camera tilts down out of that sky without a break.
- The aircraft is parked, switched off and completely still near the cliff edge, at least 40 metres from the table; it never moves.
- Exactly one aircraft, identical to @prop_dream2; eight still propellers; no numbers, letters or text anywhere on it.
- Exactly three people; no one else, no vehicles.
- The final shot from 5.1s is the stillest and longest shot: composed, symmetrical, open sky in the upper third, held for the full 4.9 seconds to 10.0s.
- Warm, rich colour, never washed out.
- Apart from the CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 时间码校验

- 第 1 段：沿用 v08（0.0–2.4 · 2.4–4.0 · 4.0–6.2 · 6.2–6.8 · 6.8–7.3 · 7.3–8.0 · 8.0–9.4 · 9.4–11.0）
- 第 2 段：0.0–1.6 · 1.6–2.4 · 2.4–4.0 · 4.0–4.4 · 4.4–6.2 · 6.2–8.8 · 8.8–9.6 · 9.6–11.0，连续，结束 = 11.0 s
- 第 3 段：0.0–2.6 · 2.6–4.0 · 4.0–5.6 · 5.6–7.6 · 7.6–10.0，连续，结束 = 10.0 s
- 第 4 段：0.0–2.0 · 2.0–3.6 · 3.6–4.1 · 4.1–4.6 · 4.6–5.1 · 5.1–10.0，连续，结束 = 10.0 s
- 没有台词；SOUND 里的时间点与镜头动作一致
