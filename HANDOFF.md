# CoolFly 视频工作室 · 交接文档（2026-10-29 更新）

这个仓库和对话是**长期**用来做 CoolFly 视频的，不只服务一条片子。
- 方法和规矩：`.claude/skills/coolfly-film/SKILL.md`（新对话会自动加载）。
- 本文件：项目背景、当前进度、账本、下一步。
- 完整对话记录：`handoff/conversation-log.md`。

分工：**用户只做决策和评判，其余由 Claude 完成**。包括找参考、拉片、写脚本、写提示词、生成、剪辑、声音、质检、交付。

---

## 0. 新对话的第一步

1. `git fetch origin claude/peaceful-goldberg-upekrl`，在这个分支的最新提交上继续。
2. 读本文件、`coolfly-film` skill（完整规则）和 `ASSETS.md`（资产清单）。
3. `bash tools/setup.sh`：装拉片、配音和下载用的工具环境，装在 `/tmp/coolfly-tools`。
4. 重装并登录即梦画布 CLI（见第 6 节），把授权链接发给用户。
5. 从第 5 节「当前进度」继续。

新对话通常运行在全新的云端容器里。CLI、登录状态和工具环境都要重来一遍；仓库里的东西都在。

---

## 1. 项目是什么

- **公司：** CoolFly（酷飞），个人电动飞行器。
- **产品：** Dream（坐式多旋翼，Pro / ST 两版）；Urban（站立式）。
- **目标：** 建一套品牌视频内容体系，大约每月一条，调性高级、豪华，面向美国用户。
- **在做：** 第 2 号片（`film02/`），当前版本 v10.1「From the Saddle」。

### 产品参数

画面上只能出现以下数据。

| | Dream Pro | Dream ST |
|---|---|---|
| 续航（载一位 70 kg 驾驶员） | 40 分钟 | 16 分钟 |
| 最高速度 | 100 km/h | 100 km/h |
| 载重 | 120 kg | 95 kg |
| 外观 | 机臂更粗 | 与 Pro 相似 |

---

## 2. 用户已经定下的事

完整清单在 skill 的「Hard rules」一节。要点：
- 中文交流，画面文字用英文；
- 人物要真实；
- 不编参数，不编 slogan；
- 飞行高度约 20 米；家人离降落点至少 40 米；只在白天飞；
- 不出现「05」；不用整屏橙色结尾卡；
- 用即梦**样片模式**，用户在网页上直出 1080p；
- 视频先报价再跑，做图不用问。

---

## 3. 参考片

| 文件 | 说明 |
|---|---|
| `brand/refs/yuanji.mp4` | CoolFly 自己的元际片。60 s 内 44 个镜头，中位镜头长 1.25 s，**没有一个镜头重复**。这是节奏的标杆 |
| `brand/refs/Roborock Q8 Max.mp4` | 95 s 内 46 个镜头，中位 1.64 s |
| `main` 分支根目录 | Eletre、Xiaomi SU7 Ultra 两条汽车片 |
| `brand/REFERENCE-ANALYSIS.md` | 早期拉片笔记 |

拉片工具：`tools/ref_analyze.py`，输出镜头表、景别缩略图和运镜初判。云端下载不了 YouTube 和 Vimeo，参考片请用户上传到仓库或画布。

---

## 4. 版本历史与教训

| 版本 | 做法 | 用户反馈 |
|---|---|---|
| v01–v03 | 4 s 单动作片段拼接，后期加特效 | 像幻灯片，假 |
| v04–v09 | 导演式多镜头一次生成（`SCRIPT-v04…v09.md`），逐轮加入：20 米高度、40 米距离、运镜、动作转场、去掉 05 | 转场生硬、节奏平；头盔凭空出现；空机降落等 |
| v10 | 以用户自己的 84 s 片为底，按 96 BPM 节拍网格重排（`SCRIPT-v10.md`） | 用户认可方向 |
| **v10.1** | 方案 A 冷开场，用了 17 段原片和 3 个新镜头（N2、N4、N5）（`SCRIPT-v10.1.md`，`film02/v10/build_cut.py`） | **「大量的重复镜头」**：47 刀只用了 17 段素材，sc8 用了 5 次，sc12 同一段画面出现两次 |

v10.1 之后加了检查：`tools/edl_check.py`。同一段画面用两次、一段素材用超过两次、相邻镜头来自同一段素材、镜头短于 0.4 秒，都会被拒绝出片。

---

## 5. 当前进度（film02 v10.1）

- 成片小样：`film02/out/DREAM-FromTheSaddle-v10.1-draft.mp4`。75 s，−14 LUFS，−1.5 dBTP，5 个重拍都卡准。**但镜头重复，需要重剪。**
- 画布：「CoolFly 品牌片 v10 · From the Saddle」，projectId `aaadd86c-6906-4e93-ba7a-062885fdee47`，状态文件 `film02/jimeng-state-v10.json`。
- 素材：
  - 用户的 17 段 1080p 原片放在 `film02/v10/source/`，不入库，可以从画布重新下载；
  - 新镜头 N2、N4、N5 和配乐 score_c 放在 `film02/v10/gen/`，同样不入库；
  - 临时旁白在 `film02/v10/vo/`。
- 运镜：用户在 N5 上选了即梦预设「迎面跟拍」，在网页上试跑。**这个节点不要再用 CLI 改。**
- 下一步：
  1. 看 N5 加运镜预设的效果，决定后面怎么用运镜预设。
  2. 重排 v10.2 镜头表：先数清素材能撑多少个不同镜头，缺口用新的样片镜头补，每个都配好运镜。镜头表先给用户看。
  3. 重剪，edl_check 通过后再出片，并做 QA。
  4. 用户认可后：在网页上把用到的样片直出 1080p，换专业配音，出终版。

---

## 5b. 当前进度（film03，2026-10-30）

- 画布：「CoolFly film03」，projectId `d7176c30-5f8b-4e8d-a3ed-b2f41df12a46`，状态文件 `film03/jimeng-state.json`，预算 7,000，已用 600。
- film02 交给用户自己剪，film03 从头做。方向几经调整：
  1. 先做了 v1「FIRST FLIGHT」，用户意见：坐姿不对、场景单一。
  2. 改为 v2「OPEN SKY」：五种西部地貌，节奏和代入感优先，见 `film03/BRIEF-v2-OpenSky.md`、`film03/out/OPENSKY-animatic-v2.mp4`。
- **用户对 v2 的意见（必须先解决）：**
  - 一致性差：有的镜头左手去握右侧的杆，有的镜头杆跑到了左边；
  - 没用 3D 模型；
  - **跳过了 Higgsfield 第一步**：应该先做人物、场景、道具资产，逐个确认，再做分镜。
- 下一步，严格按 `brand/refs/higgsfield-realism-workflow-notes.md`：
  1. **道具：** 用 `brand/models/dream.glb`（three.js 渲染，`film02/refs-glb/studio.js`）渲染座舱：俯视、左侧视、驾驶位 POV，标明右侧操纵杆的位置。做成座舱三视图，给用户确认。
  2. **人物：** Maya 的三联定妆照（Higgsfield 规格：左正面头肩，中正面全身、脖子以下，右背面全身；中灰背景）。再加一张坐进座舱的定妆照：右手握杆，左手放扶手。给用户确认。
  3. **场景：** 五个地貌各出一张按动作设计好布局的场景图（3/4 视角，前、中、背景都有；标出飞行路线和镜头位置）。给用户确认。
  4. 资产全部确认后，再做分镜和动态分镜，然后按场生成，一次生成就是一场完整的戏。
- 配乐：Seed Music 不按指定时间走。临时配乐用 higgsfield-motion 的 score.html 代码合成（`film03/animatic.py` 的 `sound()`，浏览器用 `/tmp/coolfly-tools/chrome` 这个不开沙箱的包装脚本）。定剪后购买正版授权曲。

---

## 6. 即梦画布 CLI（dreamina-canvas）

- **安装：** `curl -fsSL https://jimeng.jianying.com/canvas-cli/install.sh | bash`。先读一遍脚本再运行（用户已允许）。CLI 装到 `~/.local/bin/dreamina-canvas`，上次用的是 v1.0.3。
- **登录：** `auth login --force` 拿到授权链接 → 发给用户 → `auth wait --device-code <code>` → `auth status`。
- **生成工具 `tools/jm.py`：** 带积分账本，超预算会拒绝运行。
  ```bash
  S=film02/jimeng-state-v10.json
  python3 tools/jm.py $S img KEY --title T --prompt "…" --ref ref_actor
  python3 tools/jm.py $S vid KEY --title T --prompt "…" --mode m2v --model seedance_2.5_draft --ref … --dur 5 --res 480p
  python3 tools/jm.py $S music KEY --title T --prompt "…" --dur 80
  python3 tools/jm.py $S quote KEY | run KEY | wait OUTDIR KEY | ledger
  ```
  - 提示词里的 `@handle` 会自动换成 `{{node:ID}}`，并加进 `--ref`。
  - Seedance 2.5 的 m2v 模式最多可以挂 30 张图、10 段视频、10 段音频做参考。
- **运镜预设只能在网页上设。** 设过运镜的节点，`node show` 不再返回生成参数。
- **常见故障：**
  - 连接中途断开：重试；
  - `upload_state_unknown`：用同一个 id 重试；
  - 大 PNG 上传失败：改成 JPEG 再传；
  - 保存时报 `invalid_input`：偶发，重试；
  - Seed Music 下载下来的是 MP3，后缀却是 `.wav`。

### 积分

| 账本 | 已用 / 预算 |
|---|---|
| `film02/jimeng-state.json`（v04–v09） | 7,025 / 11,025 |
| `film02/jimeng-state-v10.json`（v10 这一轮） | 189 / 4,000 |

价格：

| 模型 | 规格 | 积分 |
|---|---|---|
| 样片模式 | 480p | 约 9 / 秒（5 s 是 45，8 s 是 72） |
| 网页直出 1080p | 10 s | 约 640 |
| 图片 | 每张 | 约 8 |
| Seed Music | 每 80 s | 约 6 |

---

## 7. 文件地图

| 位置 | 内容 |
|---|---|
| `.claude/skills/coolfly-film/` | **工作流和硬规矩** |
| `.claude/skills/higgsfield-timed-prompts/` | 写时间码提示词 |
| `.claude/skills/asset-discovery/` | 免版权素材检索（见文末） |
| `tools/jm.py` | 即梦生成和账本 |
| `tools/edl_check.py` | 镜头表检查，出片前必须通过 |
| `tools/ref_analyze.py` | 拉片：镜头表、景别缩略图、运镜初判 |
| `tools/vo.py` | 临时英文旁白（Kokoro），带 Whisper 回听校对 |
| `tools/setup.sh` | 新容器工具环境 |
| `tools/sfx.py`、`tools/extract.py`、`tools/prompt_page.py`、`tools/script_docx.js` | 音效、拆帧、提示词页面、Word 版脚本 |
| `film02/SCRIPT-v*.md` | 各版脚本 |
| `film02/v10/` | v10 剪辑脚本 `build_cut.py`、logo、临时旁白 |
| `film02/out/` | 交付过的小样 |
| `brand/` | logo、3D 模型、参考片 |

---

## 8. 和用户沟通的习惯

- 中文，简洁；需要决定的事列成编号问题，并给出建议。
- 交付物用 SendUserFile 发；出片前自己先过 QA。
- 每完成一步就 commit 并 push。
- 用户要的是商业大片感：节奏要有快有慢，运镜和转场要丝滑。别交没自检过的东西。

---

## 补充：素材检索 Skill `asset-discovery`

- 来源：https://github.com/guangjun5952/asset-discovery （MIT），已审读后安装。本仓库扩展了 Openverse 来源和 `mixkit-item` 命令，共 52 个测试。
- 云端环境现状：
  - Openverse、Mixkit 可用；
  - Wikimedia Commons 被限流（429）；
  - Pexels、Pixabay 要在环境设置里加 `PEXELS_API_KEY` / `PIXABAY_API_KEY`。
- Mixkit 的 FPV 和航拍素材大多是爱好者水平，不适合当商业运镜范例。
- 用法：
  ```bash
  A=.claude/skills/asset-discovery/scripts/assets.py; P=<项目目录>
  python3 $A --project $P init
  python3 $A --project $P online-search openverse "helicopter rotor" --kind audio
  python3 $A --project $P download openverse <UUID>
  ```
