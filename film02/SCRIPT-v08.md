# CoolFly DREAM · v08 脚本「First Light」— 运镜 + 动作转场重写 · 四段

> 状态：**待用户确认**。故事、人物、20 米高度、家人至少离 40 米这些规则都沿用 v07。
> 第二轮修改（用户意见）：① 从封闭车库里直接飞出去不现实，改成崖顶牧场的**开放式机库**（`@loc_hangar_us`），Dream 停在门外的起降圈上，从室外起飞；② 全片要有快慢切换，新增「节奏设计」一节，按它重排了镜头长度。
> 结构：4 次 Seedance 2.5 生成（11 + 11 + 10 + 8 = 40 s），后期接 3 s 整屏橙色 logo 卡，全片 43 s，16:9。

## 用户对 v07 的意见

1. 最后一段像没讲完，要再加一段，一直到 logo 定版。
2. 几乎没有运镜，转场直接、粗糙，没有商业广告的感觉。

## 诊断：v07 为什么像监控画面

- v07 只用了 higgsfield-timed-prompts 的**结构**，没有用它的**转场方法**。几乎每个镜头都写成「Hard cut at X」，还有 4 个固定机位。
- Skill（第 3、4 节）和参考片（Eletre、Xiaomi，见 `brand/REFERENCE-ANALYSIS.md`）的要求是：
  - 每个镜头都有一个贯穿始终的运镜，镜头「永远不停」；
  - 转场藏在动作里：切在动作上、匹配切、前景遮挡、甩镜、穿越；
  - 节奏有快有慢，蓄势之后再爆发。

## v08 的运镜规则（写进每条提示词的 LOOK 和 KEEP CONSISTENT）

- **没有固定机位。** 每个镜头都写明运镜方式：推、拉、横移、升降、环绕、FPV 跟飞、甩镜，并且贯穿整个镜头。
- **每个切点都有动机，从下面几种里选：**
  - **切在动作上：** 他转身坐进座位的瞬间切；女儿落进座椅的瞬间切。
  - **前景遮挡：** 防滚架的管子、头盔的黑色外壳、桥的阴影、前景的野花扫过画面，新镜头在遮挡后面出现。
  - **甩镜：** 顺着他看的方向甩过去，落在拱桥上。
  - **穿越：** 跟着飞行器从桥下穿过去；镜头从防滚架顶部向下穿进驾驶舱，看到脚下。
  - **光线转场：** 从桥的阴影里冲出来，进入阳光。
- **段与段之间也要有动机：**
  - 第 1 段结尾，FPV 镜头跟着 Dream 从停机坪起飞、俯冲出崖边到海面；第 2 段开头接着同一个方向、同样的速度继续追（运动匹配）。
  - 第 2 段结尾，Dream 朝画面右侧的崖顶飞去；第 3 段开头，它从画面右侧进来降落（方向一致）。
  - 第 3 段结尾是他看着女儿笑；第 4 段开头是一杯咖啡放在桌上，呼应片头放咖啡的动作，前后首尾呼应。
  - 第 4 段结尾，镜头推进橙色整流罩，直到橙色漆面铺满画面；后期直接切到同样橙色的整屏 logo 卡（颜色匹配）。

## 四段一览

| 段 | 时长 | 运镜和转场 | 情绪 |
|---|---|---|---|
| 1 · TAKEOFF | 11 s | 机库里，他放下咖啡、推开巨大的推拉门，门板扫过画面当前景遮挡，门外是停在起降圈上的 Dream → 横移跟拍检查螺旋桨 → 切在他坐下的动作上 → 环绕拍戴头盔 → **三个 0.5–0.7 秒快切**：螺旋桨转起来、手推操纵杆、下洗气流吹开尘土 → 从停机坪起飞，升降镜头跟拍 → 机腹从头顶掠过，镜头翻转 180°，跟着俯冲出崖边 | 仪式感 → 爆发 |
| 2 · THE COAST | 11 s | FPV 贴海追飞 → 贴着水面，飞行器从镜头旁呼啸而过 → 侧拍大笑 → 甩镜到拱桥 → 跟着从桥下穿过，冲进阳光 → **升格慢动作 2.6 秒**：张开左手感受风，声音只剩风声 → 速度和声音同时猛地恢复：越过防滚架顶部向下穿进驾驶舱，看到脚下的海浪 → 拉出，目送他飞向崖顶 | 速度 → 喘息 → 自由 |
| 3 · HOME | 10 s | 穿过前景野花的升降镜头，落在家人身上 → 低机位滑向远处降落的 Dream → 从停住的螺旋桨移焦到远处跑来的女儿 → 环绕拍：摘头盔、抱起女儿 → 切在动作上 → 推近，移焦到他的笑 | 温暖 |
| 4 · FINALE | 8 s | 微距：咖啡杯放下 → 横移露出一家人在早餐桌旁，远处停着 Dream → 低机位慢慢环绕 Dream 的英雄镜头 → **三个 0.5 秒细节快切**：碳纤维机臂、共轴电机、05 号 → 慢慢推进橙色整流罩，直到橙色铺满画面 → 后期切到橙色 logo 卡 | 回味 → 品牌 |

## 节奏设计（快慢切换）

参考片的做法：Xiaomi 先用一个长镜头蓄势，再连续 0.2–0.4 秒快切，然后突然停住；Eletre 是微距慢、飞驰快。v08 全片的节奏曲线如下：

| 时间（全片） | 段 | 节奏 | 镜头长度 | 声音 |
|---|---|---|---|---|
| 0–6 s | 1 | **慢**：推门、检查、戴头盔，仪式感 | 1.6–2.4 s | 安静：门轨、脚步、咔嗒 |
| 6–11 s | 1 | **爆发**：螺旋桨、手、气流三个快切 → 起飞 → 俯冲 | 0.5–0.7 s，再到 1.4–1.6 s | 电机声突然响起，轰鸣 |
| 11–17 s | 2 | **快**：贴海追飞、擦身而过、甩镜、穿桥 | 0.4–1.8 s | 风、浪、桥下回声 |
| 17–19.6 s | 2 | **慢动作喘息**：张开手，全片唯一的升格 | 2.6 s | 突然只剩风声和呼吸 |
| 19.6–22 s | 2 | **再快**：脚下的海浪，拉出 | 1.0–1.4 s | 声音猛地恢复 |
| 22–32 s | 3 | **慢、温柔**：降落、女儿跑来、戴头盔 | 1.6–2.4 s | 草地、风、笑声 |
| 32–36.4 s | 4 | **慢**：咖啡、一家人、环绕 Dream | 2.0–2.4 s | 安静 |
| 36.4–37.9 s | 4 | **三个快拍**：机臂、电机、05 | 0.5 s | 配乐踩点 |
| 37.9–40 s | 4 | **慢推**到橙色铺满 | 2.1 s | 收 |
| 40–43 s | 卡 | 整屏橙色 + 黑色 logo | 3 s | 最后一拍 |

后期配乐会在 6 秒（起飞爆发）、17 秒（慢动作）、19.6 秒（恢复）和 36.4 秒（三个快拍）这几处踩点。

## 积分

| 项目 | 计算 | 积分 |
|---|---|---|
| 四段样片模式 | 40 s × 9 | 360 |
| 1080p 直出 | 40 s × 64 | 约 2,560 |
| 合计 | | 约 2,920 |

今天剩 3,180，扣掉上面两项还剩约 260，大约够返修一段样片。

---

## 第 1 段 · TAKEOFF · 11.0 s

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
An 11-second live-action commercial flight sequence, 16:9, sunrise on the Big Sur coast of California. Opens mid-move: an FPV camera is already chasing the aircraft low over the Pacific at full speed, exactly as the previous clip ended. The pilot grins, the camera whips to the towering arch bridge ahead and flies under it with him, bursts out of its shadow into sunlight, circles him as he opens his hand to the wind, dives through the roll cage to show the sea racing beneath his boots, and pulls back as he banks toward a green clifftop. Rhythm: fast and punchy, then one slow-motion breath as he opens his hand to the wind, then fast again. The camera never stops moving; every transition is driven by movement.

REFERENCES
@prop_dream — the aircraft. Every detail of shape, livery, arms, motors and propellers; ignore the grey backdrop.
@char_pilot4 — the pilot: face, suit with both CoolFly wordmarks, gloves, the black helmet with the perfectly clear visor down; his face is visible through the visor.
@loc_coast_us — the coastline: golden-grass hills, dark cliffs, the concrete arch bridge carrying the two-lane coastal highway high above a canyon mouth, the ocean. Take the geography and light; the camera heights here are lower, as written per shot.

LOOK
High-end automotive commercial, clean modern digital cinema, 16–85mm lenses. Low warm sunrise light from the right over the ocean, long shadows on the golden hills, deep blue Pacific, white surf, soft morning mist in the canyon mouths; the aircraft's orange is the strongest colour. The camera is always moving: FPV chases, whip pans, fly-throughs and orbits with real speed, weight and inertia; the flying itself is confident and controlled, never reckless. No locked-off shots. RHYTHM: 0.0–6.0s fast (shots of 0.4–1.8s); 6.0–8.6s a speed ramp into smooth slow motion, the one quiet breath of the film; 8.6–11.0s back to full speed.

CHARACTERS
The pilot — the same American man as @char_pilot4, seated and harnessed, right hand always on the control grip, clear visor down, his face and eyes clearly visible through it. Focus turning into pure, open joy. Never speaks, never looks into the lens.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange front fairing with two white stripes and the number 05, dark-grey tubular roll cage with an arched roof, white seat, four carbon arms in an X layout, coaxial motor pairs at each tip, eight two-blade carbon propellers spinning as translucent discs the whole time, open perforated steel floor. Never redesigned, never round, spherical or hexagonal, no extra or missing parts, no added logos or text, nothing on it glows. The pilot is visible in the seat in every shot. It always flies between about 10 and 20 metres above the water, never higher.

WHERE EVERYTHING IS — fixed for the whole clip
Looking north along the coast: the hills, cliffs, the coastal highway and the arch bridge are on the left (land side); the open Pacific is on the right; the sun is low over the ocean on the right. The aircraft always flies north over the water, never over people or traffic. At the end it banks toward a green clifftop meadow ahead on the right.

SHOTS
0.0–1.4s — THE VERY FIRST FRAME OF THE CLIP IS THIS: FAST — an FPV camera low behind the aircraft, three metres above the swells, chasing it at full speed toward the sunrise, the pilot's helmet visible in the cage, foam and swells rushing under the lens with motion blur, its downwash drawing a line of spray. BACKGROUND: the golden hills and cliffs on the left.

1.4–2.2s — FAST: a camera skimming just above the water, the aircraft roars past close beside the lens from left to right, spray kicking up — cut on the pass at 2.2s.

2.2–3.8s — 85mm side tracking at the aircraft's height, keeping pace, the aircraft side-on travelling left to right. Through the clear visor his face is clearly visible: at 2.5s his focus breaks into a wide, open grin and he shakes his head once, delighted. Behind him, soft, the coastal highway runs along the cliffs with one small car moving slowly. At 3.5s he looks ahead and the camera whip-pans right along his gaze.

3.8–4.2s — FAST: the whip pan, a motion-blurred swish across the coast.

4.2–6.0s — the whip lands: a wide low over the water at the canyon mouth, the huge concrete arch bridge towering ahead across the top of the frame, its deck far above. The aircraft flies toward it just above the water and the camera follows close behind; at 4.9s both pass under the arch, the bridge's shadow sweeping over the lens; at 5.7s they burst out of the shadow into blazing sunlight that flares across the lens.

6.0–8.6s — SLOW MOTION: the action ramps smoothly down into slow motion; 35mm, the camera orbits slowly around the left side of the cockpit. His right hand stays firmly on the control grip; at 6.3s he lifts his left gloved hand and opens it slowly into the airflow, fingers spread, the sleeve rippling, sunlight sliding across his clear visor and his calm, overjoyed face. The orbit rises over the arched roof of the roll cage and at 8.3s tilts straight down between the roof tubes into the cockpit. BACKGROUND: the sunlit ocean, the cliffs.

8.6–9.6s — FAST: real speed snaps back; straight down between his knees: his black boots on the open perforated steel floor, and through its holes and past its edges the sunlit swells and white foam stream past about 15 metres below.

9.6–11.0s — the camera pulls straight up and back out of the cage, rising and falling behind as the aircraft banks gently to the right in a wide, graceful curve toward a green clifftop meadow ahead on the right, the sun lighting the propeller discs. The clip ends with the aircraft heading off toward the meadow at screen right.

SOUND
No music: the score is added in post. Diegetic sound only: wind and rushing water; the rotor roar rising and falling; a close rotor pass at 1.8s; a distant car on the highway at 2.9s; the natural air rush of the whip pan at 3.8s; the rotor booming and echoing under the bridge at 4.9s, opening out into bright wind at 5.7s; during the slow motion 6.0–8.6s everything drops to a low, soft rush of wind and his calm breathing inside the helmet; full sound slams back at 8.6s with the hiss of waves below. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens mid-chase low over the water, never on a wide or a close-up.
- Rhythm: fast to 6.0s, one smooth slow-motion breath 6.0–8.6s, full speed again from 8.6s.
- The camera never stops; no locked-off shots; transitions exactly as written: pass-by cut, whip pan, bridge shadow, orbit through the roof.
- Exactly one aircraft, identical to @prop_dream, eight spinning propellers, never round or hexagonal; the pilot is in the seat in every shot.
- It always flies about 10–20 metres above the water, far below the bridge deck; no clouds below it, no birds anywhere.
- His right hand stays on the control grip the whole time; only the left hand opens to the wind.
- The clear visor is down in every frame; no dark or mirrored visor; no frontal close-up of the helmet.
- Land on the left, ocean on the right; it flies north and banks right toward the meadow at the end.
- Colour stays rich and punchy, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 3 段 · HOME · 10.0 s

```
A 10-second live-action commercial scene, 16:9, a clear sunny morning on a wide clifftop meadow on the California coast. His wife and young daughter wait by a breakfast table at the near end of the meadow; the aircraft arrives from the right and lands far away at the other end, at least 40 metres from them; the propellers stop completely; only then does the daughter run across the grass. He takes off his helmet, lifts her into the seat and sets the too-big helmet on her head; she looks up at the sky with shining eyes while he watches her and smiles. The camera is always moving, gently; focus pulls and movement carry every transition. The aircraft stays switched off on the ground.

REFERENCES
@prop_dream — the aircraft; every detail; ignore the grey backdrop.
@char_pilot4 — the pilot in his suit with both CoolFly wordmarks, gloves and the black helmet with the perfectly clear visor.
@char_pilot3 — the pilot's face and hair without a helmet, seen after he takes the helmet off at 5.8s; ignore the grey backdrop.
@char_family — his wife (shoulder-length light-brown hair, cream knit sweater, dark jeans) and their 8-year-old daughter (long sandy-blonde hair, freckles, light denim jacket, white T-shirt, navy leggings, white sneakers); ignore the grey backdrop and the sheet layout.
@loc_breakfast — the clifftop meadow: the breakfast table on the left near camera, the long open meadow stretching away to the right; the aircraft lands at the far end of that open meadow.

LOOK
High-end lifestyle commercial, clean modern digital cinema, 24–85mm lenses, shallow depth of field. Warm golden morning sun from the right, long soft shadows, morning mist lying low over the ocean beyond the cliff edge, clear blue sky, wild flowers; the aircraft's orange is the strongest colour. Natural light only. The camera is always moving, gently — cranes, slides, slow orbits, motivated focus pulls; warm and tender. No locked-off shots.

CHARACTERS
The pilot — the same American man as @char_pilot3 and @char_pilot4. Glowing, a little windswept, a quiet proud smile. Never speaks, never looks into the lens.
The wife — as @char_family. Relaxed, amused, warm. She stays by the table until the propellers have stopped, then walks slowly across.
The daughter — as @char_family, 8 years old. Bursting with excitement, she stays at her mother's side until the propellers have stopped, then runs across the meadow; in the seat she goes still with wonder.
No one speaks; only the girl laughs once.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame, eight two-blade carbon propellers. It enters from the right, descends from about 15 metres and lands at 2.6s at the far end of the meadow, at least 40 metres from the table; the motors are switched off at once and the propellers are completely still by 3.8s; it never moves or lifts again. The girl only sits in it on the ground. Never redesigned, never round or hexagonal, no added logos or text, nothing on it glows. The pilot is in the seat until he climbs out.

WHERE EVERYTHING IS — fixed for the whole clip
The breakfast table with the white linen cloth, coffee pot and mugs is on the left near the first camera; the wife and the daughter stand beside it; the long open meadow runs away to the right; the aircraft lands at its far end, at least 40 metres from the table, nose toward the ocean. No vehicles, no other people.

SHOTS
0.0–2.2s — THE VERY FIRST FRAME OF THE CLIP IS THIS: the camera low among tall wild-flower stems that fill the foreground, craning slowly up and through them; the stems part to reveal, at the angle of @loc_breakfast, the breakfast table on the left with the wife and the daughter beside it, shading their eyes and looking up. Far away to the right, the aircraft glides in from the right edge and descends, small and orange, the pilot visible in the seat. BACKGROUND: the long meadow, the cliff edge, the ocean.

2.2–4.0s — 50mm, the camera slides low over the grass toward the far end of the meadow as the aircraft settles gently onto the grass at 2.6s, the grass flattening in a ring; the propellers slow from discs to visible blades and are completely still by 3.8s. Nobody is near it. BACKGROUND: the meadow, the ocean.

4.0–5.6s — 50mm close on a still carbon propeller blade in sharp focus in the foreground, the camera drifting slowly sideways; at 4.2s, far away across the meadow, the daughter breaks away from her mother and runs toward the aircraft, and the focus pulls from the blade to her as she runs closer, hair flying; the wife follows slowly. BACKGROUND: the table, the meadow, the sun.

5.6–7.6s — 50mm, a slow orbit around the cockpit. At 5.8s the pilot pulls his helmet off, his short dark-brown hair messed by the wind, his face the same man as @char_pilot3, grinning. The daughter arrives at 6.3s, breathless and laughing; he lifts her by the waist and swings her up into the white seat — cut on that movement as she lands in the seat at 7.6s. BACKGROUND: the meadow and the ocean, the wife small in the distance walking over.

7.6–10.0s — 85mm, front three-quarter on the daughter in the seat, a slow push-in that eases to a stop by 9.4s. At 7.8s he sets the big helmet on her head; it is far too big and tilts to one side; at 8.2s she giggles and pushes it straight with both hands, then tilts her head back and looks up at the sky through the clear visor, eyes shining, lips parted in wonder, small hands on the still control grip. At 9.1s the focus pulls to the pilot's face in the soft foreground at the right edge: he is watching her, and smiles. The clip ends on this frame at 10.0s.

SOUND
No music: the score is added in post. Diegetic sound only: meadow wind and birdsong; the rotor arriving from the right and descending; a soft touchdown at 2.6s; motor spin-down whine 2.6–3.8s, then silence from the aircraft; the girl's quick footsteps in the grass from 4.2s; helmet strap sounds at 5.8s; her breathless laugh at 6.3s; one short delighted giggle at 8.2s; then only the wind. No dialogue, words, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens low in the wild flowers craning up to the family by the table, never on a close-up.
- The camera is always moving gently; transitions are carried by movement and focus pulls exactly as written.
- The aircraft lands at least 40 metres from the table; nobody is near it until the propellers are completely still at 3.8s; the girl starts running only at 4.2s.
- Exactly one aircraft, identical to @prop_dream; switched off and still from 3.8s; it never lifts or moves again; the girl never flies.
- The pilot's face matches @char_pilot3 after the helmet comes off.
- Exactly three people: the pilot, the wife, the daughter; no one else, no vehicles, no birds near the aircraft.
- Warm, rich colour, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

## 第 4 段 · FINALE · 8.0 s

```
An 8-second live-action commercial finale, 16:9, the same sunny clifftop morning, a little later. A coffee mug is set down on the breakfast table and the camera glides past it to reveal the family laughing together at breakfast, the Dream parked far away on the meadow in the golden light; then the camera circles the parked aircraft in a slow hero move, glides over its details, and pushes into the glossy orange fairing until the orange fills the whole frame. The camera never stops moving.

REFERENCES
@prop_dream — the aircraft; every detail of shape, livery, carbon arms, coaxial motors, propellers and the number 05; ignore the grey backdrop.
@char_pilot3 — the pilot without a helmet, still in his black flight suit with the CoolFly wordmark on the left chest (as @char_pilot4).
@char_pilot4 — the flight suit and both CoolFly wordmarks.
@char_family — his wife and their 8-year-old daughter, exactly as their sheet.
@loc_breakfast — the clifftop meadow with the breakfast table on the left and the long open meadow to the right.

LOOK
High-end automotive commercial packshot, clean modern digital cinema, 35–100mm lenses including macro, shallow depth of field. Warm low golden sun backlighting the aircraft, a soft natural sheen on the orange clear coat, real carbon weave, morning mist over the ocean beyond the cliff edge. Natural light only; nothing on the aircraft glows. The camera is always moving: a slow lateral glide, a slow orbit, three quick macro beats of 0.5s, a final slow push-in. Calm, confident, premium. RHYTHM: slow 0.0–4.4s, three quick beats 4.4–5.9s, slow final push 5.9–8.0s.

CHARACTERS
The pilot — the same American man as @char_pilot3, no helmet, black flight suit, relaxed, laughing with his family. Never looks into the lens.
The wife and the daughter — as @char_family, at the table with him, happy and relaxed.
No one speaks.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame, parked and switched off on the grass at the far end of the meadow, at least 40 metres from the table; all eight propellers are completely still; it never moves. Orange glossy front fairing with two white vertical stripes and the number 05, dark-grey tubular roll cage, white seat, four carbon arms, coaxial motor pairs. Never redesigned, no added logos or text.

SHOTS
0.0–2.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: a 100mm macro of the wife's hand setting a steaming ceramic coffee mug down on the white linen tablecloth, in the near foreground. The camera glides sideways past the mug; the focus pulls to reveal the family at the breakfast table — the pilot laughing, the daughter on his knee, the wife sitting down beside them — and, far behind them at the end of the meadow, the parked orange Dream in the golden light. BACKGROUND: the meadow, the parked aircraft, the misty ocean.

2.0–4.4s — 35mm low hero orbit around the parked aircraft on the grass, the camera circling slowly from its front three-quarter to its side, the low sun behind it flaring softly through the roll cage and rimming the arms, the grass moving in the breeze; far behind, the family at the table, soft and small.

4.4–4.9s — QUICK: 100mm macro gliding along a carbon-fibre arm, the real weave catching the light.

4.9–5.4s — QUICK: 100mm macro sliding over the black coaxial motor pair and a still two-blade propeller.

5.4–5.9s — QUICK: 100mm macro across the two white stripes and the number 05 on the orange fairing.

5.9–8.0s — SLOW: the camera pushes straight and slowly into the glossy orange fairing between the stripes, the reflection of the sky sliding across the clear coat, until the orange paint fills the whole frame, every edge and corner, softly out of focus. The clip ends on the full orange frame.

SOUND
No music: the score is added in post. Diegetic sound only: the soft knock of the mug on the table at 0.4s; the family's quiet laughter at 1.0s, no words; meadow wind, distant surf and birdsong; then only a soft breeze. No dialogue, words, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the macro of the coffee mug being set down, never on a wide.
- The aircraft is parked, switched off and completely still at least 40 metres from the table; it never moves.
- Exactly one aircraft, identical to @prop_dream; eight still propellers; the number 05 and the two white stripes exact.
- Exactly three people at the table; no one else, no vehicles.
- The camera never stops; the clip ends on the orange paint filling the whole frame.
- Warm, rich colour, never washed out.
- Apart from the CoolFly wordmark on the suit and the number 05 on the fairing, no subtitles, on-screen text, other logos or watermarks.
```

## 时间码校验

- 第 1 段：0.0–2.4 · 2.4–4.0 · 4.0–6.2 · 6.2–6.8 · 6.8–7.3 · 7.3–8.0 · 8.0–9.4 · 9.4–11.0，连续，结束 = 11.0 s
- 第 2 段：0.0–1.4 · 1.4–2.2 · 2.2–3.8 · 3.8–4.2 · 4.2–6.0 · 6.0–8.6 · 8.6–9.6 · 9.6–11.0，连续，结束 = 11.0 s
- 第 3 段：0.0–2.2 · 2.2–4.0 · 4.0–5.6 · 5.6–7.6 · 7.6–10.0，连续，结束 = 10.0 s
- 第 4 段：0.0–2.0 · 2.0–4.4 · 4.4–4.9 · 4.9–5.4 · 5.4–5.9 · 5.9–8.0，连续，结束 = 8.0 s
- 没有台词；SOUND 里的时间点与镜头动作一致
