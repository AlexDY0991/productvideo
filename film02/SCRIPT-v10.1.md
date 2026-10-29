# CoolFly DREAM · v10.1「From the Saddle」— 方案 A（冷开场）+ 新镜头提示词

> 在 v10（`SCRIPT-v10.md`）基础上的修改：① 开场改为方案 A 冷开场；② 用户上传的 17 个原片（sc1–sc16，1080p）顶替了大部分新镜头，只新生成 N2、N4、N5，用样片模式；③ 旁白暂用开源 Kokoro TTS 生成美式男声做小样（即梦没有地道的英文音色），正式版再换专业配音。
> 画布：CoolFly 品牌片 v10 · From the Saddle（`film02/jimeng-state-v10.json`，本轮预算 4,000）。

## 1. 0–15 秒（方案 A）

| # | 时间 | 拍 | 画面 | 来源 | 声音 |
|---|---|---|---|---|---|
| 01 | 0.00–0.63 | 1 | 闪回：Dream 贴着朝阳下的海面冲向镜头 | sc6 8.4–9.0 | 转子轰鸣，音乐冲击 |
| 02 | 0.63–1.25 | 1 | 闪回：面罩后他咧嘴笑 | sc12 6.2–6.8 | 轰鸣 |
| 03 | 1.25–1.88 | 1 | 闪回：机腹从头顶掠过 | sc5 9.0–9.6 | 轰鸣 → 1.88 s 戛然而止 |
| 04 | 1.88–4.38 | 4 | 寂静的晨雾牧场 | sc1 | 风、鸟 · VO1「Out here, mornings don't rush.」 |
| 05 | 4.38–5.63 | 2 | 两匹马奔跑 | sc2 0.0–1.2 | 马蹄 |
| 06 | 5.63–6.88 | 2 | 马蹄特写 | sc2 2.4–3.6 | 马蹄重击 |
| 07 | 6.88–7.50 | 1 | 狗转头 | sc3 3.0–3.6 | — |
| 08 | 7.50–10.00 | 4 | 他提着头盔走过草地，Dream 停在背景 | sc5 0.0–2.0 | 脚步 · VO2「I used to think the best way to see this land was from a saddle.」 |
| 09 | 10.00–12.50 | 4 | 坐进座椅，戴上头盔 | sc5 2.0–4.5 | 头盔扣 |
| 10 | 12.50–13.75 | 2 | 电机绿灯，螺旋桨转起来 | sc5 5.0–6.25 | 电机启动，上升音效 |
| 11 | 13.75–14.38 | 1 | 手推操纵杆 | sc11-1 0.0–0.6 | — |
| 12 | 14.38–15.00 | 1 | 真空：面罩后的眼睛 | sc11 9.0–9.6 | 全部抽空，吸气 |

人和飞行器在 0 秒就出现，第一个镜头即是产品；全身、背景里的 Dream 在 7.5 秒；正脸在 10 秒。

## 2. 新镜头（样片模式 seedance_2.5_draft，480p，满意后在画布直出 1080p）

### N2 · SADDLE TO SKY · 8 s

```
An 8-second live-action commercial shot pair, 16:9, early-morning golden light on a coastal ranch in California. A white horse and a black horse gallop left to right along a weathered wooden fence across a golden-grass pasture; on a hidden match cut the camera rises and, travelling in the same direction at the same speed, a white CoolFly Dream glides left to right about 18 metres above the same fence line, the horses small and far behind it on the ground.

REFERENCES
@ref_horses — the two horses (one white, one black), the pasture, the fence and the light; ignore nothing else.
@ref_pasture — the ranch geography: golden-grass pasture, long wooden fence, low hills, the ocean behind.
@ref_dream_side — the aircraft from the side: white front body with the CoolFly wordmark and a small orange F, black tubular roll cage, four carbon arms in an X layout, a coaxial pair of motors with two-blade carbon propellers at each arm tip, small green status lights, black perforated floor.
@ref_dream_fly — the same aircraft in flight with the pilot seated: white helmet with an iridescent visor, plaid shirt, black vest with reflective yellow stripes.

LOOK
High-end automotive commercial, clean modern digital cinema, 35–85mm lenses, warm low morning sun from the left, long shadows, golden grass, soft haze over the distant ocean; natural light only. Smooth, fast, weighted camera moves; the motion never stops across the cut.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @ref_dream_side in every frame: white front body with the CoolFly wordmark, black tubular roll cage, four carbon arms, coaxial motor pairs, eight two-blade propellers spinning as translucent discs. Never redesigned, no extra or missing parts, no other text. The pilot is visible in the seat. It flies level and calm at about 18 metres above the ground, never higher, never banking hard.

ANIMALS
The horses gallop freely and calmly, far from the aircraft; they are never chased, startled or close to it.

SHOTS
0.0–3.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: a low 50mm tracking shot at the horses' shoulder height, moving left to right with them, the white horse nearest the camera, the black horse beside it, hooves throwing up dust, the wooden fence running through the background, the ocean beyond. At 2.6s the camera begins to rise. BACKGROUND: the fence, the golden pasture, the hazy ocean.

3.0–8.0s — MATCH CUT on the rising move, same direction, same speed: a 35mm tracking shot at the aircraft's height, about 18 metres above the pasture, travelling left to right. The white CoolFly Dream glides side-on left to right through the centre of frame, the pilot visible in the cage, propeller discs catching the sun; far below and behind it the two horses keep galloping along the same fence, small in frame. The camera keeps pace and slowly pulls slightly ahead. BACKGROUND: the long fence line, the golden pasture, the ocean.

SOUND
No music. Diegetic only: hoofbeats and dust from 0.0s; wind; from 3.0s the smooth rotor hum of the aircraft passing, with distant hoofbeats underneath. No dialogue.

KEEP CONSISTENT
- The clip opens on the galloping horses, never on the aircraft.
- Screen direction is left to right in both shots; the camera never stops at the cut.
- Exactly one aircraft identical to @ref_dream_side, eight propellers; about 18 metres above the ground.
- The horses stay far from the aircraft and are never frightened.
- Warm, rich morning colour, never washed out.
- No subtitles, on-screen text, extra logos or watermarks.
```

### N4 · LANDING, FAR AWAY · 6 s

```
A 6-second live-action commercial shot, 16:9, a clear golden early morning on a wide clifftop meadow on the California coast. A mother and her young daughter wait by a white picnic table set for breakfast at the near end of the meadow with their border collie; far away at the other end, at least 40 metres from them, the white CoolFly Dream descends and lands gently on the grass near the cliff edge; the propellers slow and stop completely.

REFERENCES
@ref_picnic — the meadow, the white picnic table with breakfast, the mother and daughter and the light.
@ref_wife — the mother: long wavy brown hair, cream sweater, white trousers.
@ref_girl — the daughter, about 8: long wavy brown hair, cream cardigan over a white top, grey trousers.
@ref_dog — the black-and-white border collie.
@ref_dream_rear — the aircraft: white body with the CoolFly wordmark, black tubular roll cage, four carbon arms, coaxial motors with two-blade propellers.

LOOK
High-end lifestyle commercial, clean modern digital cinema, 35mm, warm low morning sun, long soft shadows, wild flowers, the ocean beyond the cliff edge; natural light only. A slow, gentle push-in.

AIRCRAFT RULE
Exactly one CoolFly Dream, identical to @ref_dream_rear, eight propellers; it descends from about 15 metres and lands at 3.0s at the far end of the meadow, at least 40 metres from the table; the propellers slow and are completely still by 5.5s; the pilot is visible in the seat. Nobody moves toward it before the propellers stop.

SHOTS
0.0–6.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: a low 35mm wide from behind the picnic table: the table in the near left foreground with breakfast on it, the mother and the daughter standing beside it and shading their eyes, the border collie sitting at the girl's feet, all looking away from camera across the long meadow. Far away at the other end of the meadow, near the cliff edge and the ocean, the white aircraft descends slowly, small in frame, the grass rippling in a ring under it; it touches down at 3.0s; the propellers slow and stop by 5.5s. At 5.6s the dog stands up, tail wagging. The camera pushes in slowly the whole time. BACKGROUND: the long meadow, the cliff edge, the sunlit ocean.

SOUND
No music. Diegetic only: meadow wind and birdsong; a distant rotor hum descending; a soft touchdown far away at 3.0s; the motors winding down to silence by 5.5s. No dialogue.

KEEP CONSISTENT
- The family and the dog stay by the table, at least 40 metres from the aircraft; nobody moves toward it before the propellers stop.
- Exactly one aircraft identical to @ref_dream_rear; it never lifts again after landing.
- Exactly three living beings near the table: mother, daughter, dog; no other people.
- Warm, rich morning colour, never washed out.
- No subtitles, on-screen text, extra logos or watermarks.
```

### N5 · THE DOG RUNS IN · 5 s

```
A 5-second live-action commercial shot, 16:9, a clear golden early morning on a clifftop meadow on the California coast. The black-and-white border collie and the young daughter run joyfully across the grass toward the camera and the parked white aircraft, whose propellers are completely still.

REFERENCES
@ref_dog — the black-and-white border collie.
@ref_girl — the daughter, about 8: long wavy brown hair, cream cardigan over a white top, grey trousers.
@ref_dream_side — the aircraft: a carbon arm and a still two-blade propeller appear in the near foreground.
@ref_pasture — the light and the coastal landscape.

LOOK
High-end lifestyle commercial, clean modern digital cinema, 50mm, shallow depth of field, warm low morning sun from behind the runners, glowing rim light, flying hair and grass; natural light only.

SHOTS
0.0–5.0s — THE VERY FIRST FRAME OF THE CLIP IS THIS: a low 50mm shot at grass height; the dark carbon arm and a still propeller blade of the parked aircraft cross the bottom-right foreground, out of focus; in the middle distance the border collie sprints toward the camera, ears flying, with the girl running right behind it, laughing, hair bouncing; the focus pulls from the propeller to the dog as it closes in; at 4.3s the dog bounds past the camera to the right. The camera drifts slowly sideways. BACKGROUND: the golden meadow, the white picnic table far behind, the ocean.

SOUND
No music. Diegetic only: the dog's paws thudding on the grass, the girl's laugh, meadow wind. No dialogue.

KEEP CONSISTENT
- The propellers are completely still; the aircraft is switched off and never moves.
- Exactly one dog and one girl in the shot.
- Warm, rich morning colour, never washed out.
- No subtitles, on-screen text, extra logos or watermarks.
```

## 3. 配乐（Seed Music，三版对比）

```
Cinematic Americana brand-film score, 96 BPM, 4/4, warm and premium, about 80 seconds. Instruments: fingerpicked acoustic guitar, felt piano, warm strings, deep cinematic drums, low sub-bass hits, subtle synth pad. Structure: 0:00 a short powerful burst of full drums and strings for two seconds, then sudden silence; 0:02 gentle solo acoustic guitar and piano, open and peaceful, morning feeling, a simple memorable 5-note motif; 0:12 a slow riser building tension; 0:15 a big drop: full cinematic drums, pulsing low strings and bass, driving and uplifting; build energy every bar with more percussion and soaring strings; 0:37 sudden near-silence for four seconds, only a soft sustained pad; 0:42 the main theme returns huge, full orchestra and drums, triumphant; 0:47 transition to a warm, emotional half-time section with piano and strings; 1:05 final swelling chord at 1:07 and a long gentle ring-out. No vocals.
```
