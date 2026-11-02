# 空镜、关键帧与局部精修

## 目录
1. 空镜（场景参考图）
2. 构图控制的三档
3. 四宫格选镜头
4. 局部精修话术
5. 首帧 / 尾帧
6. 关键帧的版本管理

---

## 1. 空镜

空镜是视频里**光影、空间、材质**的锚点。两条原则：

**不放人。** 句尾加 `--no people, text`。有人的场景图会把那个人的长相、站位带进视频，和人物资产打架。

**预留表演空间。** 构图时就写清楚后面要发生什么：
- "a broad clear patch beside the sandbags leaves room for two men to sit shoulder to shoulder"
- "open churned mud in the center, large enough for two soldiers to wrestle"
- "clear ground beneath the tree for two soldiers to stand together"

### Midjourney 空镜公式（英文）
```
Cinematic [景别] [机位/角度] of [空间主体]. [前景元素]. [中景元素]. [远景元素].
[材质与细节：泥、雪、木头、锈]. [光源方向与光色]. [氛围]. photorealistic [类型] film
--ar 16:9 --no people, text, [其他要排除的东西]
```

范例：
> Cinematic night shot of an empty frontline shelter, rough timber roof and thick sandbag walls. A small oil lantern with a glass chimney burns in a low recessed niche on the right, below the parapet. Its dim amber flame lights a folded olive blanket, a sheltered sitting space and nearby wooden beams, fading quickly into deep shadow. Outside, snow-covered ground disappears into near-black darkness. Quiet, modest soldier's resting place, low-key lighting, photorealistic war film --ar 16:9 --no people, flags, daylight, sunset, bright sky, text

要点：
- **写清唯一光源**和它照亮的范围（"lights only the nearby blanket… fading into deep shadow"）。夜戏最怕平光。
- `--no` 里放你最担心模型自作主张加上的东西：daylight、moonlight、symmetrical corridor、orderly flag rows。
- 同一场景要多个机位时，先定一张满意的，再用 Nano Banana Pro 派生："出一下这个场景的极远景鸟瞰图" / "生成这个区域的近景"。派生出来的图光色一致，比重新抽卡稳定。

### 实景照片转场景资产
品牌片里经常要出现真实的店、酒店、建筑，观众（尤其是员工和客户）认得出来。这时实景照片的作用是**锁定空间的身份**，不是直接当画面用。手机拍的、光线难看都没关系，流程是：

1. 拍照：每个空间拍 2–3 个角度的全景，加上标志性细节（招牌造型、特色装饰、窗外景色、材质）。尽量不拍人。
2. 用 Nano Banana Pro 重新"拍"一遍：
   > 保留@图片1 的空间结构、布局、主要材质和标志性元素，按以下要求重新呈现：[规范卡里的光线和质感]。去掉杂物、电线、人物和所有可读文字，画面整洁但保留真实使用痕迹。电影剧照质感。
3. 生成的图作为这个场景的空镜资产。照片本身不直接进视频。

拍照时比好看更重要的是：**角度覆盖全，标志性的东西拍清楚**。没有照片也能做，但做出来是"像酒店的酒店"，不是"那家酒店"。

### 黑白或特殊影调段落
为黑白段落单独做黑白版的场景和人物资产。只在提示词里写"黑白"，模型会把彩色资产的光线逻辑带进来。

## 2. 构图控制的三档

| 档位 | 做法 | 适用 |
|---|---|---|
| 文字 | 只用提示词描述机位和站位 | 空镜、氛围镜头 |
| 画框标注 | 在空镜上画红框，写"根据图中标注的位置加入人物" | 多人站位、道具摆放 |
| 3D Layout | 用三维软件搭灰模（假人 + 场景 + 机位），再让模型"渲染"成目标风格 | 广告、对构图要求严格的镜头 |

画框标注范例（KILL A）：
> 根据图中标注的位置，在画面中加入人物，保持原画风质感，可以改变人物动作，老板面前有一台笔记本电脑，同事朝着老板坐，白发女人在老板旁边。

> 修改图1，不修改画风和其他细节，在红色框标注处变成一个很浅的门厅，有一扇带猫眼的木门。

3D Layout 范例（周杰伦 TVC）：每个镜头先出 `SC01_C004_Layout_v001`（灰模：车内、假人握方向盘、机位确定），再把灰模和角色、风格参考一起交给 Nano Banana Pro 生成 `SC01_C004_AI_v001`，之后小步精修到 v011。透视和构图百分之百由人决定。

没有三维软件时，可以用手绘草图、实拍手机照片（自己摆姿势拍）代替灰模，原理相同。

## 3. 四宫格选镜头

先让模型一次出四个角度：
> ……你帮我多生成 4 个不同角度的镜头视角，要求有电影感，保持人物一致性。

挑中后提取：
> 把参考图中左上角的图片单独生成出来，保持画面一致性，同时增强画质。

一张图的价格看四个机位，适合早期快速试镜头。注意提取后要检查细节，四宫格里的小图细节少，放大时模型会补，可能补歪。

## 4. 局部精修话术

**一次只改一处，并且声明其他不变。** 一次改三处，模型往往三处都改不好，还顺手动了别的地方。

常用句式：
- 删除：`X 去掉，其他什么都不变`
- 替换：`把图1里的 X 换成图2里 Y 这个样式的，图1里其他不变`
- 换装：`图2的上衣替换到图1身上，保持图1的构图不变`
- 换背景：`图1替换车外的背景，雪夜远山远景模糊，参考图2的山路`
- 调动作：`图1的角色动作参考图2，身体往左倾斜` / `身体轻微后仰`
- 调程度：`车身的雪少一点` / `车尾的速度轨迹变细一点` / `表盘少一点`
- 调质感：`修改图1，不改变构图和光影，只改变人物材质质感，参考图2`
- 风格不变改内容：`保证画面风格笔触细节不变，让画面中左边的窗户拉上窗帘，整体环境稍微昏暗一点点`

用 Lovart 或其他支持框选的平台时，先框选物体再写指令，比纯文字定位准确得多。

**模型选择**：精修用 Nano Banana Pro（最听话）；需要画面里有准确文字、版式、三视图时用 gpt-image-2。

## 5. 首帧 / 尾帧

两种用法：
1. **段落衔接**：上一段视频的最后一帧截出来，作为下一段的首帧（即梦的首帧模式或参考图第一张），写明"严格以首帧起画，延续图中的动作进度，前半秒不冻结画面"。
2. **风格转换**：广告里实拍和动画之间切换时，用实拍画面做首帧、动画关键帧做尾帧（或反过来），让模型生成过渡。

截帧可以用 `scripts/vframes.sh`，或者播放器暂停截图。

## 6. 关键帧的版本管理

- 每个镜头的关键帧按 `SCxx_Cxx_AI_vNNN` 递增，不覆盖旧版。
- 需要后期合成的镜头，关键帧背景直接出绿幕（"背景改成纯绿色 #00FF00"）。
- 定稿关键帧先放大（Topaz 等）再拿去生成视频，视频清晰度会好一档。
