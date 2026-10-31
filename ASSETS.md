# CoolFly 资产清单（2026-10-30）

可以重复使用的资产都列在这里。状态说明：
- ✅ 用户确认过
- 🟡 生成了但用户没确认
- ⚠️ 有问题，慎用

画布节点 ID 只在对应的画布里有效。换画布时，用 `tools/jm.py STATE upload KEY 文件` 重新上传。

## 1. 飞行器 Dream（以这一节为准）

| 资产 | 位置 | 说明 |
|---|---|---|
| 3D 模型 | `brand/models/dream.glb` | 完整的 CAD 结构模型，含座椅、安全带骨架和座椅两侧的操控件。渲染脚本是 `film02/refs-glb/studio.js`，页面是 `v1–v6*.html`，用 three.js，库在 `vendor/three/`。**座舱视图还没渲染过，下一步要做** |
| 模型渲染图（橙色涂装） | `film02/refs-glb/out/v1-front34 … v6-low.png`、`dream-views-sheet.png` | 前 3/4、侧、正、俯、后 3/4、低角度。俯视图能看到座椅、安全带和两侧的操控件 |
| **film03 Dream Pro 座舱道具图** | `film03/assets/prop/PROP_cockpit_sheet.jpg`（带标注总图）；干净渲染 `glb_hero / top / left / right / stick / pov.png` | ✅ 用户确认（2026-10-30）。`film03/assets/glb/render.mjs` 从 dream.glb 渲染：`cockpit.js` 改成真机涂装（珍珠白整流罩、黑管架、浅灰座椅、黑安全带，去掉 05/20），并按 2026 产品图手工补了 Pro 模块：顶部后方降落伞舱、机腹前/中/后 3 个气囊、带弹簧缓冲的双滑橇、顶管 4 个传感器、机头球形摄像头（结构部门没有轻量模型，尺寸为估算）。坐标：驾驶员面朝 +z，**右手边是 −x**，握把顶离地约 1.4 m |
| Dream Pro 2026 产品图 | `brand/refs/ref-dream-pro-2026-modules.webp`（红框标出新模块）、`ref-dream-pro-2026-parachute-airbag.webp`（中文标注：整机降落伞、安全气囊） | ✅ 用户提供，Pro 外形以此为准 |
| 真实产品照 | `brand/refs/45°侧视外观特写.png` | 停在机场跑道上的实拍照。白色机身，最能代表真实质感 |
| 白底产品图 | `brand/refs/ref-dream-white.webp`、`film02/v10/refs/node_ax2zhza6ga.png`（前 3/4）、`node_gcdgnkc2pg.png`（侧）、`node_n4gss3vqjp.png`（驾驶位视角）、`node_y1s61hxhz1.png`（后 3/4） | 在 film03 画布上分别是：`ref_dream_34front`（node_f6vjnq7gm7）、`ref_dream_side`（node_zwahy7j8v3）、`ref_dream_cockpit`（node_gk20gkbsm7）、`ref_dream_34rear`（node_07epe8v4jn） |
| 橙色款 | `brand/refs/ref-dream-orange.webp`、`film02/assets/prop_dream*.png` | film02 早期用过 |
| 飞控板 | `brand/refs/飞控-1.png` | 内部电子件特写，不是操纵杆 |
| 坐姿参考（男飞行员） | `film02/v10/refs/TapNow_1792741234212___1.png` | 人坐得低、腿往前伸、右手握右侧杆。⚠️ 衣服是格子衬衫加反光背心，用作参考时要写明"不要照搬衣服"。film03 画布上是 `ref_pilot_seated`（node_3d7whmyh5x） |
| 飞行中全机（含驾驶员） | `film02/v10/refs/TapNow_1792742822555___1.png` | 人和机身的比例参考。film03 画布上是 `ref_dream_flying`（node_sfq5mqqkp0） |
| 驾驶位 POV | `film02/v10/refs/_-441891838874314753_00174.png` | 两根防滚架管呈 V 形，中间一块小屏。film03 画布上是 `ref_pov`（node_g826wgxn42） |
| 坐姿测试 | `film03/board/T1.jpg`、`T2.jpg`、`T3.jpg` | 🟡 比例基本对：侧面、飞行中、POV |
| Urban（站立式） | `brand/models/urban.glb`、`brand/refs/ref-urban.webp`、`brand/refs/开场.png` | 还没用过 |

## 2. 人物

| 资产 | 位置 | 状态 |
|---|---|---|
| **Ethan 定妆（film03 主角，step 1.2）**：日常装三联 `film03/cast/PA1.png`（PA1 node_ndd183m8z0）、飞行装三联 `PF4.png`（PF4 node_9zrfqnzvb3）、坐姿 `PS5.png`（PS5 node_5pwp3avpr4）、背心设计 `VD1.png`（VD1 node_sk4ate0ckd）、总图 `film03/cast/CAST_ethan_sheet.jpg`；提示词 `film03/prompts/cast.py`；背心 logo 参考 `brand/coolfly-logo-reverse.jpg`（画布 ref_logo_rev） | 看起来 40 岁的美国男性，精干，深棕短发、鬓角灰白、短胡茬，创业者气质（用户定：贴近核心买家，不点明是否前飞行员）。日常：炭灰美丽诺圆领毛衣、深靛蓝直筒牛仔裤、棕褐麂皮沙漠靴、左腕钢壳飞行员计时表（棕皮表带），无标志。飞行（v4，用户定）：CoolFly 公司自己的网眼飞行员马甲（原版 `brand/refs/ref-coolfly-mesh-vest.jpg`，无气囊），改得更帅：哑光黑肩部/下摆/袋盖、石墨灰网眼、细橙色滚边，左胸小 logo、背后肩部大 logo。v1 摩托气囊背心、v3 充气救生背心（PF1–3、PS1–4）弃用。哑光白开放式头盔+透明翻盖面罩，黑色皮手套。坐姿：3D 底图 + 身份参考编辑，腿在座舱内，四点式安全带。PF2 中格露出一点嘴和下巴 | 人物、日常装、飞行装 v4 ✅ 用户确认（2026-10-31） |
| Maya（34 岁女驾驶员，`film03/cast/MA1.png`、`MS3.png`、`CAST_maya_sheet.jpg`） | 用户认为不贴近核心买家，MS3 座舱前端被生成模型改开了 | ⚠️ 已弃用 |
| Maya（film03 v2 旧版，女驾驶员，34 岁，深金色低马尾，雀斑，橄榄绿飞行夹克、灰色连帽衫、黑裤、棕色短靴、白色头盔配彩虹色面罩） | `film03/board/char_maya.jpg`，film03 画布 `char_maya`（node_87mf3kbv9p） | 🟡 只有一张四格定妆图，**不符合 Higgsfield 三联规格**，要重做 |
| Ray（film03 教练，50 多岁） | `film03/board/char_ray.jpg`，`char_ray`（node_0thhvst771） | 🟡 |
| film02 男主（格子衬衫、黑色背心带黄色反光条、白色头盔） | `film02/v10/refs/TapNow_1792554833040…`（全身）、`…1792555179693…`（脸）、`…1792556906832…`（飞行服三视图），在 film02 v10 画布上 | ✅ 用户自己做的 |
| film02 妻子、女儿、牧羊犬 | `film02/v10/refs/TapNow_1792564621368…`、`…1792565766731…`、`…1792566125721…`、`…1792570249278…` | ✅ 用户自己做的 |
| 更早的驾驶员 | `film02/assets/char_pilot*.png`、`char_family.png` | ⚠️ 已弃用 |

## 3. 场景

| 资产 | 位置 | 状态 |
|---|---|---|
| 莫哈韦干湖床起降点（日出、皮卡在左边 60 米处、起降垫） | `film03/board/loc_base.jpg`，`loc_base`（node_2nrw0x9ke0） | 🟡 |
| 加州海岸、牧场、崖顶野餐 | `film02/v10/refs/TapNow_1792736792136…`（海岸）、`…1792569384099…`（牧场）、`…1793002601242…`（野餐） | ✅ film02 用户做的 |
| 更早的场景图 | `film02/assets/loc_*.png`（机库、海岸、起降台、车库、早餐） | ⚠️ 旧版 |
| **film03 场景布局（step 1.3）**：提示词 `film03/prompts/locs.py`，标注脚本 `film03/locs/annotate.py`，总览 `film03/locs/LOC_all.jpg`。连贯性：全程从左往右（向西），太阳在画面左侧（东），≤ 20 m | | |
| **L1 莫哈韦干湖床·日出·起飞点（8 m 起降垫，皮卡在左侧 60 m）** | `film03/locs/L1.png`（画布 node_azjvdsv3m2），标注图 `film03/locs/LOC_L1.jpg` | 🟡 待用户确认 |
| **L2 红岩峡谷河道（河宽约 80 m，崖高约 50 m，贴水 8 m 飞）** | `film03/locs/L2.png`（画布 node_z6wfrq044s），标注图 `film03/locs/LOC_L2.jpg` | 🟡 待用户确认 |
| **L3 高山湖+松林（镜面湖，贴水 3–5 m）** | `film03/locs/L3.png`（画布 node_m07tb19rgb），标注图 `film03/locs/LOC_L3.jpg` | 🟡 待用户确认 |
| **L4 金色麦田丘陵（孤橡树做地标，贴麦浪约 3 m）** | `film03/locs/L4.png`（画布 node_m12s433nbr），标注图 `film03/locs/LOC_L4.jpg` | 🟡 待用户确认 |
| **L5 太平洋海岸·崖顶草地·降落点（镜头朝南，陆地在左、海在右）** | `film03/locs/L5.png`（画布 node_s3wvp4n9af），标注图 `film03/locs/LOC_L5.jpg` | 🟡 待用户确认 |
| film03 v2 的五种地貌 | 只在分镜图 `film03/board/C*.jpg` 里出现过：干湖床、红岩峡谷、高山湖、麦田、海岸 | ⚠️ 没有单独的场景布局图，要按 Higgsfield 第一步重做 |

## 4. 分镜和动态分镜（只作参考，不直接沿用）

| 资产 | 位置 |
|---|---|
| film03 v1「FIRST FLIGHT」：简报、19 张分镜、动态分镜 | `film03/BRIEF-FirstFlight.md`、`film03/board/B*.jpg`、`film03/out/FIRSTFLIGHT-animatic-v1.mp4` |
| film03 v2「OPEN SKY」：简报、35 张分镜、动态分镜 | `film03/BRIEF-v2-OpenSky.md`、`film03/board/C*.jpg`、`film03/out/OPENSKY-animatic-v2.mp4`。⚠️ 有一致性问题，见 skill 第八节 |
| film03 创意方向（8 个） | `film03/CONCEPTS-v2.md` |

## 5. 视频素材

| 资产 | 位置 |
|---|---|
| film02 用户的 17 段 1080p 原片 | v10 画布（节点见 `film02/jimeng-state-v10.json`），本地下载到 `film02/v10/source/`（不入库） |
| film02 新生成的镜头 N2、N4、N5，以及 N5 加运镜版 | v10 画布，本地 `film02/v10/gen/` |
| film02 v10.2 成片小样 | `film02/out/DREAM-FromTheSaddle-v10.2-draft.mp4` |

## 6. 音乐和声音

| 资产 | 说明 |
|---|---|
| Seed Music 候选（film02 score_a/b/c；film03 M1、M3、M4） | ⚠️ 不按指定时间走、对比弱，用户说"都不行"。本地在 `film03/gen/` 和 `film02/v10/gen/`（不入库） |
| 代码合成临时配乐 | higgsfield-motion 的 `score.html`（预设 arrival、organic、luxury、pulse、house），用法见 `film03/animatic.py` |
| 临时配音 | `tools/vo.py`（Kokoro：男声 am_michael，女声 af_heart） |

## 7. 参考片

| 资产 | 位置 | 说明 |
|---|---|---|
| 元际片（CoolFly） | `brand/refs/yuanji.mp4` | 节奏标杆：44 个镜头，中位 1.25 秒 |
| Roborock 广告 | `brand/refs/Roborock Q8 Max.mp4` | |
| Eletre、Xiaomi SU7 Ultra、用户的「品牌片 480」 | `main` 分支根目录 | |
| Red Bull F1 迈阿密（Johnny FPV） | 画布上 videoplayback (1)，本地 `film02/refs-ads/ref2.mp4`（不入库，无声） | 20 个镜头，中位 2.3 秒，FPV 贴地贴水 |
| 用户上传的另一条 | 画布上 videoplayback | 超过下载上限，需要 480p 版本 |
| 待下载清单 | `brand/refs/CANDIDATES.md` | 13 条，带链接和学习点 |
| Higgsfield 工作流笔记 | `brand/refs/higgsfield-realism-workflow-notes.md` | **必读** |

## 8. 画布和账本

| 画布 | projectId | 状态文件 | 账本 |
|---|---|---|---|
| film02 旧画布 | cdac4ce4-f845-4758-b9fa-841d6f0bffb0 | `film02/jimeng-state.json` | 7,025 / 11,025 |
| film02 v10 | aaadd86c-6906-4e93-ba7a-062885fdee47 | `film02/jimeng-state-v10.json` | 189 / 4,000 |
| film03 | d7176c30-5f8b-4e8d-a3ed-b2f41df12a46 | `film03/jimeng-state.json` | 600 / 7,000 |
