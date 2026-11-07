# CoolFly 视频项目｜工作规则（每个会话必读）

## 1. 必须使用 ai-film-production skill
- skill 在 `.claude/skills/ai-film-production/`。凡是涉及 AI 片子的工作（资产、关键帧、视频提示词、声音、剪辑），一律按它执行。
- **每一步动手前，先重读对应的参考文件**，不凭记忆：
  - 视觉规范卡、人物资产板、服装、产品六视图 → `references/01-setting-and-assets.md`
  - 空镜、关键帧、四宫格、局部精修、首帧和尾帧 → `references/02-scene-and-keyframe.md`
  - 即梦视频提示词 → `references/03-video-prompt.md`
  - 声音 → `references/04-sound.md`
  - 选模型 → `references/05-models-and-platforms.md`
  - 质检 → `references/06-checklists.md`
  - 产品片 → `references/08-product-brand-film.md`
- 偏离 skill 时，必须先说明原因，并征得用户同意。

## 2. 硬性规则（以前违反过，不能再犯）
1. **视频先出样片**：先出 480p 草稿，用户看过再升级或重出 1080p。不允许直接出 1080p。
2. **视频提交前，先报清单，等用户确认**：报几条、模型、时长、分辨率、预计积分，用户确认后才提交。
3. **新的关键镜头先做模型比较**：同一条提示词在 2–3 个模型上各跑一条样片，比较后再定主力模型。
4. **人物资产板**用 01 里的固定版式原文，加真实感前缀、刻意不对称和固定负面描述；模型用 gpt-image-2。
5. **视频参考图的上传顺序**：首帧 → 场景 → 人物 → 服装 → 产品。每张图写清"只负责什么、不继承什么"，并写上"资产图的灯光、背景、锐度全部忽略；六视图的背景和标注不进入成片"。
6. **正式镜头先出关键帧**：四宫格选机位 → 精修 → 放大，再当视频首帧。
7. **每条视频提交前**，按 06 第 1 节的清单逐项检查，把检查结果附在报告里。
8. **人和产品同框的镜头**一律先做 3D Layout：在 glb 渲染里放一个 1.83 m 的人体假人，加地面网格和投影，人的站位、手的位置和产品的比例都由模型定死。**比例（v2，11 月 7 日修正）**：60.4 mm/模型单位（`window.U=1/0.0604`）。依据：座椅到防滚架顶梁的人体工学、品牌片里头盔在顶梁下方的位置、官方带桨展开 4450 mm，三者一致。真实尺寸：整机高约 1.67 m（伞舱盒顶约到站立男子的眼睛），防滚架顶梁约 1.51 m（下巴），座舱侧沿约 0.88 m，座面离地约 0.50 m，机臂离地约 0.77 m（大腿根），共轴电机组顶部约 1.04 m（腰部），电机组含桨高约 0.54 m、电机直径约 0.20 m，桨叶直径约 1.8 m，带桨整机宽约 4.2–4.45 m。旧版按 52.7 mm/单位（整机 1.46 m）算，偏小约 15%，方向 A 第一版关键帧因此和 gpt-image-2 的进一步缩小而把飞行器做得太小。**关键帧回来后必须和灰模叠图核对**：飞行器高度和人身高的比值与灰模相差超过 10% 就重出。
9. **座舱里有飞行员的镜头**用坐姿人体假人（`window.addSeated()`，座面离地约 0.50 m，靠背后仰约 26°，腿向前伸到中控台下，头盔顶在防滚架顶梁下约 10 cm，右手握右侧侧杆）；从后方拍飞行镜头时，提示词写死"机头朝飞行方向、飞行员背对镜头"，防止倒着飞（V09 第一版就倒着飞）。
10. **logo**：生成时尽量让 AI 留空或只在关键帧里保留核对过的 logo（F 必须是橙色）；视频里运动后 logo 会变形，成片一律后期用官方 logo 文件跟踪合成。
11. **每条即梦视频提示词末尾必须加【结构与物理硬约束】段**（模板见 `coolfly/film2/video_samples/样片批次3_提示词_含约束.md`），至少包括：飞行器零件数量和结构不变；单镜头不切镜；不新增人物或物体；物理真实（不瞬移、不穿模，飞行时 8 副桨始终在转，桨停时不能离地）。按镜头再加：飞行镜头写"机头始终朝前进方向、严禁倒飞或原地掉头"和"飞行员全程坐在座舱里、不消失不变形"；停放镜头写"座舱里没有人"；手部镜头写"只有一名飞行员，手指数量正常"。视频回来后逐帧检查这几条。
12. **锁产品结构的图**用 gpt-image-2 的编辑模式，加 `input_fidelity: high`，把结构渲染当作被编辑的图。局部精修用 Nano Banana Pro，一次只改一处。

## 3. 品牌口径
- 参数和说法以 `coolfly-press-release` skill 为准。Dream Pro 的数据：最高速度 100 km/h、续航 40 分钟（搭载一名 70 kg 飞行员）、最大载重 120 kg、NA80 双余度飞控、毫米波避障、整机降落伞和气囊、主备双电池。
- 不飞越人群和城市，飞行高度 20–30 米，不做特技动作；不出现第三方品牌。
- logo 的位置：座椅头枕印黑色 CoolFly；侧面三角板印大号白色 CoolFly；机头不放 logo。官方 logo 文件在 `coolfly/refs/LOGO_*`。成片里看得清 logo 的镜头，后期用真 logo 跟踪合成。
- CE 和 FCC 只证明电磁兼容（`coolfly/refs/certs/`），不是飞行安全认证。只放在片尾；英文写 "CE · FCC compliant"，不放进安全章节。

## 4. 项目文件
- 进度和决定都记在 `coolfly/film2/`：01 规范卡、02 流程、03 完整路线、04 skill 对照、`assets/生成记录.md`、`video_tests/试跑记录.md`。新会话先读这几个文件，再开始工作。
- 座舱结构：侧杆在飞行员的**右侧**，用右手握（3D 模型核实过）。
- 已定的事：主角是 Dream Pro 白色版；片长 60 秒，海外社媒，16:9；飞行员是 35–40 岁的美国男性，穿 CoolFly 气囊马甲、戴全盔；场景是加州中部海岸。

## 5. 平台
- **Lovart**：环境变量里有 `LOVART_ACCESS_KEY` 和 `LOVART_SECRET_KEY`，用 `coolfly/film2/lovart_client.py` 调用。项目是"CoolFly Dream Pro 卖点片"（projectId `2upxgw4pgjk0`）。
- **即梦**：用即梦画布命令行 `dreamina-canvas`（装在 `~/.local/bin`，它的 skill 在 `~/.agents/skills/dreamina-canvas-cli/`；安装命令 `curl -fsSL https://jimeng.jianying.com/canvas-cli/install.sh | bash`）。
  - 登录：`dreamina-canvas --format json auth login` 拿到授权链接给用户，然后执行 `auth wait --device-code <deviceCode>`。
  - 项目画布："CoolFly Dream Pro 卖点片"，projectId `301dcb30-6c66-4a06-a4d0-6bd193d982d7`，链接 https://jimeng.jianying.com/ai-tool/ai-canvas/301dcb30-6c66-4a06-a4d0-6bd193d982d7
  - **样片**：模型用 `seedance_2.5_draft`（480p），满意后用 `node promote video-sample --resolution 1080p` 转成正片。**样片最长保存 7 天**，过期后不能再转正片，交付样片时必须提醒用户。
  - 积分要先报价，用户批准消费上限后才能运行（`--credit-ceiling`）。不能用 `--yes` 绕过。
  - 旧的 `dreamina` 命令行（只能提交到"对话"）不再使用。
  - 图片仍然用 Lovart（用户定的分工）。即梦 skill 里"生成一律优先用即梦"那条，不适用于本项目。

## 6. Git
- 仓库根目录有一个韩文长文件名的 mp4，Linux 建不出来。clone 时加 `GIT_LFS_SKIP_SMUDGE=1`。提交时**只 add 自己新建的文件**，不要用 `git add -A`，否则会把那个"删除"一起提交。
- 产出放在 `claude/coolfly-dreampro-film` 分支。
