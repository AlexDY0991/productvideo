# CoolFly DREAM · v06 脚本「First Light」— 面向美国用户（四幕 · 45 秒）

> 状态：用户已确认（加州海岸 ✓；女儿可以坐进驾驶座，但飞行器不启动、不飞 ✓；今天预算 4,000 积分 ✓）。资产图已做完，英文提示词见第 7 节。
> 结构：4 次 Seedance 2.5 多参考生成（11 + 10 + 12 + 9 = 42 s），后期加 3 s 橙色 logo 卡，全片 45 s，16:9。
> 生成路线：先样片模式（每秒 9 积分）→ 满意的版本在网页画布上直出 1080p（实测 10 秒 640 积分，约每秒 64）。

---

## 1. 从美国用户的心理出发：五个判断

**看片的人是谁：** 美国的高收入人群，35–55 岁，男女都有。他们住在海边、山里或者郊区，车库里已经有 Porsche、Rivian 或者一辆皮卡；喜欢户外，是新科技的早期用户。他们不缺车，缺的是**没人做过的体验**和**属于自己的时间**。

1. **「开阔的路」是美国人最深的自由神话**（Route 66、加州 1 号公路、公路旅行）。
   - 片子要说的是：**开阔的路，变成了开阔的天空**。
   - 所以海岸要拍成美国的样子：加州 1 号公路式的海岸、混凝土拱桥、金色草坡、褐鹈鹕。
   - 不再用北欧风格的玄武岩和灯塔。
2. **想要，来自「它就住在我家」。**
   - 工业机库是专业设备的感觉；**自家车库**里停着一架 Dream，才是「我也能拥有」的感觉。
   - 起飞地点从机库改成崖边住宅的玻璃车库：本来停车的位置，停着 Dream。
3. **美国人对「飞行汽车」先怀疑，再心动。**
   - 片子不能像特技表演，要让人感觉：他很从容，一切在掌控之中。
   - 所以要有安全带「咔嗒」一声、起飞前用手检查螺旋桨、全程单手握杆。
   - 飞行路线只经过开阔的海岸和海面，不飞过人群和城市，这也符合美国超轻型飞行器的使用常识。
   - 不做贴着海蚀柱急转这类危险动作，改成优雅的大弧度转弯。
4. **情绪要看得见。**
   - 美国广告的情绪表达是外放的：笑出声、睁大眼睛、张开手。
   - 所以头盔改成**透明面罩**，全程看得到他的眼睛和笑容。
   - 删掉「呼气」这种含蓄的动作。
5. **爽之后，要有一个和人分享的落点。**
   - 美国广告最打动人的落点是**家人**。Dream 是单座，没法带人上天，所以分享发生在落地以后：
     - 妻子和 8 岁的女儿开车先到了崖顶，等他吃早餐；
     - 女儿跑过来，坐进座椅，戴上他那顶大一号的头盔，抬头看天空；
     - 他看着女儿笑了。
   - 意思是「这个梦，会传下去」。这句话不写出来，靠画面说。
   - 这个结尾同时让做父母的观众把自己代入，也把座椅、安全带和镂空踏板再展示了一遍。

**一句话故事：** 周六凌晨，他从自家车库里推出 Dream，飞出浓雾中的海岸，穿过云层迎上日出，赶到崖顶和家人吃早餐。女儿坐进了驾驶座。

**时间线改成一个早晨**（凌晨 → 日出 → 早上），不再是「一整天」。这样和 Dream Pro 40 分钟的续航也对得上：一次早晨飞行，飞完就到。

---

## 2. 四幕一览

| 幕 | 时长 | 地点 / 时间 | 情绪 | 后期小字（英文） |
|---|---|---|---|---|
| 1 · THE GARAGE | 11 s | 崖边住宅的玻璃车库，日出前 | 期待、仪式感 | — |
| 2 · THE COAST | 10 s | 加州式海岸，晨雾和拱桥 | 速度、自由 | `100 km/h` |
| 3 · ABOVE | 12 s | 云海之上，日出 | **最高点：敬畏、狂喜** | `40 min` |
| 4 · HOME | 9 s | 崖顶草地，早餐桌，家人 | 温暖、传承 | `Dream Pro · Dream ST` + 参数 |
| 结尾卡 | 3 s | 整屏 CoolFly 橙，黑色 logo | — | — |

**转场**（都在提示词里由模型完成，后期不加特效）：
- 1 → 2：飞行器从镜头上方掠过，机腹遮满画面时切；
- 2 → 3：飞进雾墙，画面全白时切；
- 3 → 4：穿过云层往下降，画面全白时切。

两次「白色遮挡切」很自然，因为雾和云本来就在故事里。

---

## 3. 分镜（中文；确认后再写英文提示词）

### 第 1 幕 · THE GARAGE · 11 s（日出前的蓝调时刻）

| 时间 | 镜头 | 内容 |
|---|---|---|
| 0.0–2.0 | 24mm，车库里面向外拍，固定机位 | 天还没亮，玻璃车库里只有一盏暖色壁灯。Dream 停在本该停车的位置；远处的落地玻璃外，海上起了雾。他走进画面，把一杯咖啡放在工作台上，咖啡还冒着热气。 |
| 2.0–3.6 | 50mm，跟他侧走 | 他用戴手套的手沿着一片螺旋桨划过去，是起飞前的检查。露脸，胸前的 logo 看得清。 |
| 3.6–5.2 | 85mm 特写 | 他坐进座椅，扣上安全带，**咔嗒**一声；戴上头盔，放下**透明面罩**，眼神平静。 |
| 5.2–6.6 | 广角，从车库外往里拍 | 整面玻璃车库门向上升起，雾和海风灌进来；电机的绿灯依次亮起，螺旋桨启动。 |
| 6.6–8.8 | 低机位，在机臂旁边 | 8 个螺旋桨转成半透明的圆盘，地上的落叶和雾被吹散；飞行器平稳垂直离地。 |
| 8.8–11.0 | 车库门外，地面机位朝上拍 | 飞行器飞出车库，从镜头正上方掠过，机腹、镂空踏板和机臂**遮满整个画面**。 |

### 第 2 幕 · THE COAST · 10 s（清晨，海雾正在散去）

| 时间 | 镜头 | 内容 |
|---|---|---|
| 0.0–1.6 | 机腹从画面里移开 | 露出崖边的金色草坡和大海，飞行器向海面飞去。 |
| 1.6–4.2 | 24mm 追拍，贴着海面 | 下洗气流在海面上犁出一道白色水雾；画面右侧，一群褐鹈鹕贴着浪尖滑翔。 |
| 4.2–6.6 | 侧面跟拍，与飞行器同一高度 | 透过透明面罩看到他的脸：先是专注，然后嘴角压不住地笑了。背景里一座混凝土拱桥横跨峡谷，桥上的公路有一辆车慢慢开着。**这是「路 → 天空」的对比，不用解说也看得懂。** |
| 6.6–8.6 | 航拍，从拱桥下方或侧面穿过 | 飞行器优雅地大弧度转弯，绕过拱桥，朝前方的雾墙飞去。 |
| 8.6–10.0 | 从他肩后看出去 | 他的手套握着操纵杆，透过机架的管子，看到前方一堵白色雾墙迎面扑来；飞进去以后，**画面全白**。 |

### 第 3 幕 · ABOVE · 12 s（情绪最高点）

| 时间 | 镜头 | 内容 |
|---|---|---|
| 0.0–2.0 | 画面全白，跟飞行器往上爬 | 白雾往下退，**飞行器冲出云层**；正前方，太阳正从云海的边缘升起，金光扑到他脸上。声音此时收住，只剩风声。 |
| 2.0–4.6 | 85mm 特写，透过透明面罩 | 他的眼睛睁大，眼里映着日出，笑出了声，摇摇头，有点不敢相信。 |
| 4.6–6.6 | 中景 | 他的左手离开扶手，张开五指伸到气流里，感受风，**右手一直握着操纵杆**。 |
| 6.6–8.6 | 透过镂空踏板往下看 | 他的靴子下面，金色的云海在流动。Dream 独有的画面，最让人想亲身试一次。 |
| 8.6–12.0 | 大远景，慢慢拉开 | 一望无际的金色云海上，只有一个小小的橙色 Dream，两只鹈鹕在它旁边同飞。末尾飞行器开始下降，镜头跟着它**沉进云里，画面全白**。 |

### 第 4 幕 · HOME · 9 s（早上，崖顶）

| 时间 | 镜头 | 内容 |
|---|---|---|
| 0.0–2.4 | 崖顶草地，广角 | 白色从画面里散开，云层在崖下面。崖顶有一张铺着亚麻桌布的早餐桌（她们开车来的，车停在画外）。妻子和女儿抬头往天上看，**Dream 降落，驾驶员清楚地坐在座椅里**。 |
| 2.4–4.4 | 侧面 | 平稳着陆，草被吹平；螺旋桨慢下来，停住。女儿朝飞行器跑过去。 |
| 4.4–6.6 | 中景 | 他摘下头盔，头发被风吹乱，笑着把女儿抱进座椅，把头盔戴到她头上，头盔大了一号，歪在她头上。 |
| 6.6–9.0 | 85mm，镜头慢慢推近，最后停住（**飞行器全程关机，螺旋桨静止，女儿只是坐着，不会飞**） | 女儿坐在驾驶座上，透过太大的透明面罩抬头看天，眼睛发亮。镜头最后停在他身上：他看着女儿，笑了。画面停住，切到橙色结尾卡。 |

**全片没有台词和旁白。** 声音只有现场音：咖啡杯放下、安全带咔嗒、车库门、电机、风、浪、鹈鹕、女儿的一声笑。配乐后期再加，在第 3 幕冲出云层的那一刻音乐最强。

---

## 4. 资产图（第一步，确认脚本后先做，约 6 张 × 8 积分）

| 标签 | 内容 | 状态 |
|---|---|---|
| `@char_pilot4` | 同一个主演，换成**透明面罩**头盔（三联：特写戴盔面罩放下 / 正面全身 / 背面），衣服和 logo 不变 | ✓ |
| `@char_family` | 妻子（30 多岁，美国人，自然妆，米色针织衫）和 8 岁女儿（雀斑、牛仔外套），同框三联 | ✓ |
| `@loc_garage` | 崖边现代住宅的玻璃 + 木结构车库，日出前的蓝调，落地玻璃外是海雾；车位空着，留给 Dream | ✓ |
| `@loc_coast_us` | 加州 1 号公路式海岸：混凝土拱桥跨峡谷、金色草坡、海雾 | ✓ |
| `@loc_clouds` | 云海之上的日出，金色 | ✓ |
| `@loc_breakfast` | 崖顶草地上的早餐桌（亚麻桌布、咖啡壶），崖下是云层；不出现汽车，避免像某个真实品牌 | ✓ |
| `@prop_dream` | 沿用 | ✓ |

---

## 5. 积分预估

| 项目 | 计算 | 积分 |
|---|---|---|
| 资产图 6 张 | 6 × 8 | 约 48 |
| 四幕样片 | 42 s × 9 | 约 378 |
| 预留返修样片（约两幕重跑） | — | 约 200 |
| 1080p 直出四幕 | 42 s × 64 | 约 2,688 |
| **合计** | | **约 3,300** |

---

## 6. 需要用户确认

1. 美国用户的五个判断，尤其是「自家车库」和「家人落点」，方向对吗？
2. 第 4 幕女儿戴着大头盔坐进驾驶座，这个结尾可以吗？还是只要他一个人？
3. 海岸改成加州 1 号公路风格，带拱桥和鹈鹕，可以吗？
4. 预算：今天能用的积分具体是多少？我好把账本上限改到准确的数字。

---

## 7. 英文时间码提示词（按 higgsfield-timed-prompts 结构）

提交时 `@handle` 由 `film02/prompts/v06.sh` 换成 `{{node:…}}` 并挂 `--ref`；模型 `seedance_2.5_draft`（样片模式）。

### 第 1 幕 · THE GARAGE · 11.0 s

```
An 11-second live-action film opening, 16:9, the blue hour before dawn at a clifftop house on the California coast. A man walks into his private glass garage, where a CoolFly Dream stands in the bay where a car would be, checks it by hand, buckles in, opens the glass door to the sea fog and lifts off; the aircraft flies out directly over the camera and its belly covers the whole frame for the cut into the next scene.

REFERENCES
@prop_dream — the aircraft. Take every detail of shape, livery, arms, motors and propellers; ignore its grey studio backdrop.
@char_pilot4 — the pilot. Take his face, hair, flight suit with both CoolFly wordmarks, gloves and the black helmet with the perfectly clear visor; ignore the grey backdrop and the sheet layout.
@loc_garage — the garage. The plate's camera angle IS the first shot's angle. The plate shows an empty centre bay; in this clip the aircraft stands in it.

LOOK
Clean modern digital cinema, 24–85mm lenses, deep clean blacks, crisp detail. Cool blue pre-dawn light through the glass door mixed with one warm brass wall lamp over the workbench; the aircraft's orange is the strongest colour in every shot. Quiet, architectural, aspirational. Physically plausible, weighted camera moves with slow starts and precise stops.

CHARACTERS
The pilot — an American man in his mid-30s, short dark-brown hair, light stubble, grey-green eyes, real skin. Calm, competent, quietly excited, like a man about to do the thing he loves most. He never speaks and never looks into the lens. From 4.6s his helmet is on with the clear visor down; his eyes and face stay clearly visible through the visor.

SUIT RULE
Matte black one-piece flight suit exactly as @char_pilot4: the CoolFly wordmark printed small on the left chest and large across the upper back, 'Cool' in off-white and 'Fly' in orange, the same slanted stencil letters, never misspelled, mirrored or redesigned. These two prints are the only text allowed in the clip.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange glossy front fairing with two white vertical stripes and the number 05, dark-grey tubular steel roll cage with an arched roof, white bucket seat with harness, four carbon-fibre arms in an X layout, a coaxial pair of black motors at each arm tip (one above, one below) with two-blade carbon propellers, eight propellers in total, open perforated steel floor. Never redesigned; no extra or missing arms, motors or propellers; no added logos or text; nothing on it ever glows. Propellers are still until 5.9s; after that they are translucent spinning discs.

WHERE EVERYTHING IS — fixed for the whole clip
The aircraft stands in the centre bay on the concrete floor, nose toward the tall full-width glass garage door; beyond the door is the cliff edge and the Pacific under low sea fog. The long walnut workbench with the warm brass lamp runs along the left wall. The pilot enters from screen right and works on the aircraft's right side.

WHAT IS BEHIND EACH OF THEM
Behind the aircraft (seen from inside): the glass door, the sea fog and the blue ocean. Behind the pilot at the aircraft's right side: the plain right wall and the timber ceiling.

SHOTS
0.0–2.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: exactly the angle of @loc_garage, a locked 24mm at floor height in the back right corner, the garage dim and blue, the warm lamp on over the workbench, the aircraft standing still in the centre bay in silhouette against the glass door and the fog. At 0.4s the pilot walks in from screen right, helmet in his left hand, and at 1.4s sets a steaming coffee mug down on the workbench. BACKGROUND: the glass door, the fog, the ocean. Hard cut at 2.0s.

2.0–3.6s — 50mm medium shot at chest height, trucking alongside the pilot as he walks the right side of the aircraft. His face is fully visible, calm, a faint private smile; the CoolFly wordmark is readable on his left chest. He runs his gloved right hand slowly along the leading edge of a still carbon propeller blade, a pre-flight check. At 3.1s he turns toward the seat and the large CoolFly wordmark across his back is clearly readable. BACKGROUND: the orange fairing and the roll cage in the foreground, the plain right wall behind him. Hard cut at 3.6s.

3.6–5.2s — 85mm close-up, front three-quarter, a slow push-in that never stops. He is seated; at 3.8s he clicks the harness buckle shut across his chest; at 4.2s he pulls the helmet on and at 4.6s lowers the perfectly clear visor; through it his grey-green eyes look ahead at the glass door, focused, the corner of his mouth lifting. BACKGROUND: soft out-of-focus timber ceiling and the blue glass door. Hard cut at 5.2s.

5.2–6.6s — wide 24mm from outside, on the concrete apron at the cliff edge, looking back into the garage through the glass door. The whole glass door rolls up from 5.2s to 6.2s; sea fog drifts in across the floor; inside, the green status lights on the motors blink on one after another, and at 5.9s the propellers begin to turn. The seated pilot is visible in the cage. BACKGROUND: the lit garage interior, the warm lamp, the workbench. Hard cut at 6.6s.

6.6–8.8s — locked low 24mm at floor level inside, beside the front-right arm tip; the coaxial motors in the right third of frame, the seated pilot clearly visible in the cockpit at left. The propellers are translucent discs; dust and fog blow outward along the floor toward the lens. Between 7.2s and 8.6s the aircraft lifts smoothly and vertically to about 1.5 metres, perfectly level and controlled. BACKGROUND: the open door, the fog and the brightening blue ocean. Hard cut at 8.8s.

8.8–11.0s — outside, a locked camera low on the apron just past the open door, looking back in. The aircraft glides out through the open door toward the camera, nose first, the pilot visible in the seat, and passes directly over the lens. From 10.4s to 11.0s its belly, open perforated steel floor and arms fill the whole frame, every edge and corner, with motion blur. BACKGROUND: the lit garage through the door. The clip ends on the fully covered frame.

SOUND
No music: the score is added in post. Diegetic sound only: quiet room tone and distant surf; footsteps on concrete from 0.4s; the soft knock of the mug on wood at 1.4s; a gloved hand brushing carbon at 2.6s; a crisp harness click at 3.8s; a visor click at 4.6s; the glass door's motor hum 5.2–6.2s with wind and surf rushing in; a soft electronic chirp at 5.6s; motor whine rising from 5.9s; deep rotor roar from 7.2s; one big rotor pass overhead peaking at 10.6s and cut off at 11.0s. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the dim garage at the angle of @loc_garage, never on a close-up.
- Exactly one aircraft, identical to @prop_dream in every frame; eight propellers, never more or fewer; nothing on it glows.
- Exactly one pilot, identical to @char_pilot4, both CoolFly wordmarks on the suit; after 4.6s the clear visor is down and his face stays visible through it.
- The pilot is visible in the seat in every shot after 3.6s; the aircraft is never empty.
- Workbench, lamp and glass door never move.
- Propellers are still until 5.9s.
- Cuts at 2.0s, 3.6s, 5.2s, 6.6s and 8.8s are hard cuts; the clip ends on the fully covered frame at 11.0s.
- Colour stays rich and clean, never washed out or hazy.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

### 第 2 幕 · THE COAST · 10.0 s

```
A 10-second live-action flight sequence, 16:9, early morning on the Big Sur coast of California. Opens mid-situation: the aircraft has just flown out of the garage directly over the camera and its belly still covers the whole frame. It heads out over the Pacific, skims the waves beside a line of brown pelicans, overtakes the coastal highway and its arch bridge, and flies into a wall of sea fog until the frame is pure white for the cut into the next scene.

REFERENCES
@prop_dream — the aircraft. Every detail of shape, livery, arms, motors and propellers; ignore the grey backdrop.
@char_pilot4 — the pilot: face, suit with both CoolFly wordmarks, gloves, the black helmet with the perfectly clear visor down; his face is visible through the visor.
@loc_coast_us — the coastline: golden-grass hills, dark cliffs, the concrete arch bridge carrying the two-lane coastal highway, the fog bank offshore. The plate's camera angle IS the angle of the 6.6–8.6s shot.

LOOK
Clean modern digital cinema, 24–85mm lenses. Low warm morning sun from the left, golden hills, deep blue Pacific, white surf, a soft white fog bank offshore; the aircraft's orange is the strongest colour. Fast but smooth, graceful aerial camera moves with weight and inertia; the flying is confident and controlled, never reckless.

CHARACTERS
The pilot — the same American man as @char_pilot4, seated and harnessed, right hand always on the control grip, clear visor down, his face and eyes clearly visible through it. Focus turning into pure joy. Never speaks, never looks into the lens.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange front fairing with two white stripes and the number 05, dark-grey tubular roll cage, white seat, four carbon arms in an X layout, coaxial motor pairs at each tip, eight two-blade carbon propellers spinning as translucent discs the whole time, open perforated steel floor. Never redesigned, never round or spherical, no extra or missing parts, no added logos or text, nothing on it glows. The pilot is visible in the seat in every shot.

WHERE EVERYTHING IS — fixed for the whole clip
Looking north along the coast: the hills, cliffs and the arch bridge are on the left (land side); the open Pacific is on the right; the fog bank lies ahead and to the right. The aircraft always flies north along the coast, over the water, never over people or traffic. In side shots it travels left to right.

SHOTS
0.0–1.6s — THE VERY FIRST FRAME OF THE CLIP IS THIS: the aircraft's belly, open perforated floor and arms fill the whole frame, every edge and corner, seen from below with motion blur. By 0.6s the frame uncovers and reveals the aircraft sweeping out over the clifftop grass toward the ocean, the pilot visible in the seat. The camera, low on the clifftop, tilts up to follow. BACKGROUND: the morning sky and the blue Pacific. Hard cut at 1.6s.

1.6–4.2s — 24mm chase from behind and to the right, three metres above the water, keeping pace. The aircraft skims low over the swells, its downwash drawing a soft white trail of spray; at 2.4s a line of five brown pelicans glides beside it in formation, wingtips just above the waves, at the right of frame. BACKGROUND: the golden hills and cliffs on the left, the fog bank far ahead. Hard cut at 4.2s.

4.2–6.6s — 85mm side tracking shot at the aircraft's altitude, keeping pace, the aircraft side-on travelling left to right. Through the perfectly clear visor the pilot's face is clearly visible: at 4.6s his focus breaks into a wide, open grin and he shakes his head once, delighted. Behind him, out of focus, the coastal highway runs along the cliffs with one small car moving slowly on it. BACKGROUND: golden hills, the highway, the cliffs. Hard cut at 6.6s.

6.6–8.6s — exactly the angle of @loc_coast_us: aerial 35mm from about 30 metres, looking north along the coast. The aircraft enters from the lower left of frame over the water, small in frame but clearly orange, and flies in a smooth graceful curve past the seaward side of the arch bridge, then heads toward the fog bank; the camera drifts forward with it. BACKGROUND: the arch bridge, the golden hills, the fog. Hard cut at 8.6s.

8.6–10.0s — over-the-shoulder from just behind and above the pilot's right shoulder, looking forward through the roll cage: his gloved right hand on the control grip in the lower frame, the helmet at the left edge, the propeller discs at the edges. A tall soft wall of white sea fog rushes toward the lens; at 9.4s the aircraft flies into it and by 9.8s the whole frame is pure soft white, every edge and corner. The clip ends on the white frame.

SOUND
No music: the score is added in post. Diegetic sound only: outdoor wind; the rotor roar rising and falling with distance; surf against the cliffs; pelican wing-beats close by at 2.4s; a distant car passing on the highway at 5.0s; the rotor muffled as the fog swallows everything from 9.4s. No dialogue, voices, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on the aircraft's belly covering the whole frame, never on a wide or a close-up.
- Exactly one aircraft, identical to @prop_dream, eight spinning propellers; the pilot is in the seat in every shot.
- The pilot's clear visor is down in every frame and his face is visible through it; no dark or mirrored visor; no frontal close-up of the helmet.
- The aircraft always flies north over the water, never over people or traffic; screen direction never flips.
- Hills, cliffs and the arch bridge on the left, the ocean on the right.
- Cuts at 1.6s, 4.2s, 6.6s and 8.6s are hard cuts; the clip ends on the pure white fog frame at 10.0s.
- Colour stays rich and punchy, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

### 第 3 幕 · ABOVE · 12.0 s

```
A 12-second live-action flight sequence, 16:9, the emotional peak of the film. Opens mid-situation inside pure white fog. The aircraft climbs out of the clouds into the sunrise above an endless golden sea of clouds; the pilot laughs in disbelief, opens his free hand to the wind, the clouds slide beneath his boots, and the tiny orange aircraft flies on alone in the vast sky before sinking back into the clouds until the frame is pure white for the cut into the next scene.

REFERENCES
@prop_dream — the aircraft; every detail; ignore the grey backdrop.
@char_pilot4 — the pilot: face, suit with both CoolFly wordmarks, gloves, the black helmet with the perfectly clear visor down; his face is visible through the visor.
@loc_clouds — the sea of clouds at sunrise. The plate's camera angle IS the angle of the 8.6–12.0s wide.

LOOK
Clean modern digital cinema, 24–85mm lenses. The sun just breaking over the edge of the cloud sea, long golden light across the cloud tops, the sky shading from gold to clear deep blue; warm sunlight on the pilot's face; the aircraft's orange glows naturally in the sun. Slow, floating, majestic camera moves; time seems to slow down.

CHARACTERS
The pilot — the same American man as @char_pilot4, seated and harnessed, right hand always on the control grip, clear visor down, his face and eyes clearly visible through it. Awe turning into open, overwhelmed joy: wide eyes, a real laugh, a slow shake of the head. Never speaks, never looks into the lens.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame: orange front fairing with two white stripes and the number 05, dark-grey tubular roll cage, white seat, four carbon arms in an X layout, coaxial motor pairs at each tip, eight two-blade carbon propellers spinning as translucent discs the whole time, open perforated steel floor. Never redesigned, no extra or missing parts, no added logos or text, nothing on it glows. The pilot is visible in the seat in every shot of the aircraft.

WHERE EVERYTHING IS — fixed for the whole clip
The sun rises dead ahead over the far edge of the cloud sea; the aircraft flies toward it. A few dark mountain ridge tops break through the clouds far away on the left. Two brown pelicans glide off the aircraft's right side from 8.6s.

SHOTS
0.0–2.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: pure soft white fog filling the whole frame, every edge and corner. The camera rises with the aircraft; at 0.6s the white thins and the aircraft bursts up out of the cloud tops, shredding wisps of cloud off its arms, the pilot visible in the seat; at 1.2s it levels off just above the cloud sea, flying straight toward the rising sun as golden light floods the frame. BACKGROUND: the golden horizon and the sun. Hard cut at 2.0s.

2.0–4.6s — 85mm close-up of the pilot's face from a camera flying just ahead and to his left, front three-quarter, through the perfectly clear visor; the roll cage tubes soft at the frame edges. Warm sunlight falls across his face and the sunrise reflects in his grey-green eyes. At 2.4s his eyes widen; at 3.2s he laughs out loud, a real, open laugh, and slowly shakes his head in disbelief. BACKGROUND: soft golden sky. Hard cut at 4.6s.

4.6–6.6s — 35mm medium shot from outside the roll cage at his left side. His right hand stays firmly on the control grip; at 4.9s he lifts his left gloved hand off the armrest and opens it slowly into the airflow beside the cage, fingers spread, feeling the wind, the sleeve rippling. BACKGROUND: the endless cloud sea and the low sun behind him. Hard cut at 6.6s.

6.6–8.6s — straight down from just above the seat, between the pilot's knees: his black boots rest on the open perforated steel floor, and through its holes and past its edges the golden cloud tops slide by far below. BACKGROUND: the cloud sea moving beneath. Hard cut at 8.6s.

8.6–12.0s — exactly the angle of @loc_clouds: a vast wide from cloud-top height, the camera slowly pulling back and rising. The tiny orange aircraft flies toward the sunrise across the endless golden cloud sea, two brown pelicans gliding off its right side; it looks small, free and alone in the enormous sky. At 10.8s the aircraft begins a gentle descent and the camera follows it down into the cloud tops; by 11.6s the whole frame is pure soft white, every edge and corner. The clip ends on the white frame.

SOUND
No music: the score is added in post. Diegetic sound only: the clouds swallow the noise at first; as the aircraft bursts out at 0.6s the rotor roar softens to a smooth distant hum under a high, open wind; one real laugh from the pilot at 3.2s, muffled by the helmet; air rushing past the open hand from 4.9s; pelican wing-beats at 9.0s; wind thickening into fog from 10.8s. No dialogue, words, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on pure white fog filling the whole frame, never on a wide or a close-up.
- Exactly one aircraft, identical to @prop_dream, eight spinning propellers; the pilot is in the seat in every shot.
- His right hand stays on the control grip the whole time; only the left hand opens to the wind.
- The clear visor is down in every frame and his face is visible through it; no dark or mirrored visor.
- The sun stays dead ahead on the horizon; the mountain tops stay far left.
- Cuts at 2.0s, 4.6s, 6.6s and 8.6s are hard cuts; the clip ends on the pure white frame at 12.0s.
- Warm, rich colour, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

### 第 4 幕 · HOME · 9.0 s

```
A 9-second live-action finale, 16:9, a clear sunny morning on a clifftop meadow above the clouds on the California coast. Opens mid-situation as the white of the clouds clears. The aircraft lands beside a breakfast table where his wife and young daughter are waiting; the motors are switched off and the propellers stop; he takes off his helmet, lifts his daughter into the seat and sets the too-big helmet on her head; she looks up at the sky with shining eyes while he watches her and smiles. The aircraft stays switched off on the ground for the rest of the clip.

REFERENCES
@prop_dream — the aircraft; every detail; ignore the grey backdrop.
@char_pilot4 — the pilot in his suit with both CoolFly wordmarks, gloves and the black helmet with the perfectly clear visor.
@char_pilot3 — the pilot's face and hair without a helmet, seen after he takes the helmet off at 4.6s; ignore the grey backdrop.
@char_family — his wife (shoulder-length light-brown hair, cream knit sweater, dark jeans) and their 8-year-old daughter (long sandy-blonde hair, freckles, light denim jacket, white T-shirt, navy leggings, white sneakers); ignore the grey backdrop and the sheet layout.
@loc_breakfast — the clifftop meadow. The plate's camera angle IS the first shot's angle; the open grass at the right is where the aircraft lands.

LOOK
Clean modern digital cinema, 24–85mm lenses. Warm golden morning sun from the right, long soft shadows, the white cloud layer below the cliff edge, clear blue sky, wild flowers in the grass; the aircraft's orange is the strongest colour. Natural light only. Slow, gentle camera moves; warm and tender.

CHARACTERS
The pilot — the same American man as @char_pilot3 and @char_pilot4. Glowing, a little windswept, a quiet proud smile. Never speaks, never looks into the lens.
The wife — as @char_family. Relaxed, amused, warm; she stays standing by the breakfast table.
The daughter — as @char_family, 8 years old. Bursting with excitement, runs to the aircraft only after the propellers have stopped; inside the seat she goes still with wonder.
No one speaks; only the girl laughs once.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @prop_dream in every frame, eight two-blade carbon propellers. It lands at 2.6s; the motors are switched off at once, the propellers slow and are completely still by 4.0s, and the aircraft never moves or lifts again. The girl only sits in it on the ground. Never redesigned, no extra or missing parts, no added logos or text, nothing on it glows. The pilot is visible in the seat until he climbs out.

WHERE EVERYTHING IS — fixed for the whole clip
Seen from the first camera: the breakfast table with the white linen cloth, coffee pot and mugs is on the left; the aircraft lands on the open short grass at the right of the table, nose toward the cloud layer; the cliff edge and the clouds are behind. The wife stands beside the table. No vehicles anywhere.

SHOTS
0.0–2.4s — THE VERY FIRST FRAME OF THE CLIP IS THIS: soft white cloud filling the whole frame, clearing by 0.5s to reveal exactly the angle of @loc_breakfast, low in the grass: the table on the left, the wife and the daughter standing beside it looking up and shading their eyes, the cloud layer behind. The aircraft descends into frame from above right, the pilot clearly visible in the seat, the grass beginning to ripple. BACKGROUND: the table, the clouds, the blue sky. Hard cut at 2.4s.

2.4–4.4s — 35mm side-on at grass height. The aircraft settles gently onto the open grass at 2.6s, the grass flattening in a ring around it; the propellers slow from discs to visible blades and stop completely by 4.0s. At 4.0s, only after they have stopped, the daughter runs into frame from the left toward the aircraft. BACKGROUND: the white cloud layer and the sunlit sky. Hard cut at 4.4s.

4.4–6.6s — 50mm medium shot beside the cockpit. The pilot has unbuckled; at 4.6s he pulls his helmet off, his short dark-brown hair messed by the wind, his face the same man as @char_pilot3, grinning. He stands, lifts his daughter by the waist and sets her into the white seat, then at 5.8s places the big helmet on her head; it is far too big and tilts a little to one side; she giggles. BACKGROUND: the clouds and the wife out of focus by the table, smiling. Hard cut at 6.6s.

6.6–9.0s — 85mm, front three-quarter on the daughter in the seat, a slow push-in that eases to a stop by 8.4s and holds. Through the clear visor of the too-big helmet her eyes shine as she tilts her head back and looks up at the sky, lips parted in wonder, small hands on the still control grip. The aircraft is switched off and motionless; its propellers are still. In the soft foreground at the right edge, the pilot's shoulder; at 7.6s the camera's focus shifts to him: he is watching her, and smiles. The clip ends on this held frame at 9.0s.

SOUND
No music: the score is added in post. Diegetic sound only: meadow wind and birdsong; the rotor descending; a soft touchdown at 2.6s; motor spin-down whine 2.6–4.0s, then silence from the aircraft; the girl's quick footsteps in the grass at 4.0s; helmet strap sounds at 4.6s; one short delighted giggle from the girl at 5.9s; then only the wind. No dialogue, words, narrator, stings or added whooshes.

KEEP CONSISTENT
- The clip opens on soft white cloud clearing to the angle of @loc_breakfast, never on a close-up.
- Exactly one aircraft, identical to @prop_dream, eight propellers; switched off and completely still from 4.0s; it never lifts or moves again; the girl never flies.
- The pilot is in the seat whenever the aircraft is in the air; his face matches @char_pilot3 after the helmet comes off.
- Exactly three people: the pilot, the wife, the daughter, as their references; no one else, no vehicles.
- The table stays at the left, the aircraft at the right, the clouds behind.
- Cuts at 2.4s, 4.4s and 6.6s are hard cuts; the clip ends on the held frame at 9.0s.
- Warm, rich colour, never washed out.
- Apart from the two CoolFly wordmarks on the suit, no subtitles, on-screen text, other logos or watermarks.
```

### 时间码校验

- 第 1 幕：0.0–2.0 · 2.0–3.6 · 3.6–5.2 · 5.2–6.6 · 6.6–8.8 · 8.8–11.0，连续，结束 = 11.0 s
- 第 2 幕：0.0–1.6 · 1.6–4.2 · 4.2–6.6 · 6.6–8.6 · 8.6–10.0，连续，结束 = 10.0 s
- 第 3 幕：0.0–2.0 · 2.0–4.6 · 4.6–6.6 · 6.6–8.6 · 8.6–12.0，连续，结束 = 12.0 s
- 第 4 幕：0.0–2.4 · 2.4–4.4 · 4.4–6.6 · 6.6–9.0，连续，结束 = 9.0 s
- 没有台词；SOUND 里的时间点与镜头动作一致
