# CoolFly 品牌视频 · 交接文档（2026-10-20）

新对话从这里接手。完整对话记录在 `handoff/conversation-log.md`。

---

## 0. 新对话的第一步

开新对话时，把下面这段话发给 Claude：

> 继续 CoolFly 品牌视频的制作。仓库 `alexdy0991/productvideo`，所有进度都在分支 `claude/peaceful-goldberg-upekrl`。
> 请先：
> 1. `git fetch origin claude/peaceful-goldberg-upekrl`，在这个分支的最新提交上继续工作；
> 2. 读 `HANDOFF.md`（交接文档），需要细节时再查 `handoff/conversation-log.md`（完整对话记录）；
> 3. 重新安装并登录即梦画布 CLI（步骤见 HANDOFF.md 第 6 节），授权链接发给我；
> 4. 然后从 HANDOFF.md 第 9 节「下一步」继续。

说明：
- 新对话通常在一个全新的云端容器里运行。即梦 CLI 和它的登录状态都不会带过去，需要重装、重新授权一次。
- 新对话可能会被分配一个新的分支名。要么在新分支上合并本分支，要么开对话时直接选本分支。

---

## 1. 项目是什么

- **公司：** CoolFly（酷飞），个人电动飞行器。
- **产品：**
  - **Dream：** 坐式多旋翼，分 Pro 和 ST 两个版本；
  - **Urban：** 站立式。
- **目标：** 建立一套品牌视频内容体系，大约每个月出一条品牌片，体现高级、豪华的品牌调性。目前没有具体的活动或投放目标。
- **正在做：** 第 2 号片（目录 `film02/`）。主角是 Dream（橙色涂装），当前版本是 v04「First Light」。

### 产品参数

画面上只能出现以下数据，不要编造其他参数。

| | Dream Pro | Dream ST |
|---|---|---|
| 续航（载一位 70 kg 驾驶员） | 40 分钟 | 16 分钟 |
| 最高速度 | 100 km/h | 100 km/h |
| 载重 | 120 kg | 95 kg |
| 外观 | 机臂更粗 | 与 Pro 相似 |

---

## 2. 用户已经定下的事（必须遵守）

| 事项 | 决定 |
|---|---|
| 语言 | 和用户用中文交流；**画面里的文字一律用英文** |
| 画幅 | 主版本 16:9（1920×1080），用于官网和社媒；9:16 竖版之后再做 |
| Slogan | 要换新的，**先不写**，不要自己编 |
| 调性 | 高级、豪华。用户过去的素材风格在 `brand/refs/`，只作风格参考，**不能直接当画面用** |
| 涂装 | 由 Claude 决定，已选橙色款（GLB 模型自带的橙色涂装；改色试过，失败了，因为涂装是贴图） |
| 结尾卡 | 整屏 CoolFly 橙色，配黑色 logo（参考 Eletre 的整屏品牌黄），后期加，约 3 秒 |
| 人物 | **要尽量真实。** 主演是美国人，飞行服上要有 CoolFly logo |
| 积分 | **即梦总积分控制在 7000 以内**，在这个范围内可以自由发挥，但不要浪费 |
| 做图 | 只是做图（Seedream，每张约 8 积分）可以直接做，不用先问 |
| 视频 | 每次视频生成都花积分较多：先报价、说明花费，在预算内才能运行 |
| 脚本 | 写好的脚本先发给用户看 |
| 整体把控 | 用户说过「整体你来把控」，但对 v02 和 v03 的效果都不满意（原因见第 4 节） |

---

## 3. 参考片与方法论

- **用户提供的参考片：**
  - `brand/refs/Roborock Q8 Max.mp4`：扫地机器人广告；
  - 即梦上的 Mango 眼镜片：画布链接见对话记录；
  - `main` 分支根目录有两条汽车广告：
    - `放大特写质感汽车广告Eletre-…mp4`：用户认为「比较酷」；
    - `Xiaomi SU7 Ultra PT赛道…mp4`：2.39:1 宽银幕。
  - 拉片分析在 `brand/REFERENCE-ANALYSIS.md`。
- **Higgsfield「3-Step Workflow To Master AI Realism」：** 当前采用的方法，笔记在 `brand/refs/higgsfield-realism-workflow-notes.md`。
  - **第一步：** 先做可复用的资产图并逐张确认，包括人物三联定妆照、为动作设计好布局的场景图、道具三视图。
  - **第二步：** 一场戏只生成一次，每次 16–19 秒、内含多个镜头。提示词按时间码写，转场由动作驱动（匹配切、遮挡切、甩镜），声音只要现场音，配乐后期再加。
- **Skill：** 用户上传的 `higgsfield-timed-prompts` 已装在 `.claude/skills/higgsfield-timed-prompts/SKILL.md`，新对话会自动加载。写或改视频提示词时，按它的结构来：
  - REFERENCES、LOOK、CHARACTERS、PROP RULE、WHERE EVERYTHING IS、BACKGROUND、SHOTS、SOUND、KEEP CONSISTENT；
  - 写完要校验时间码是否连续。

---

## 4. 版本历史与教训

| 版本 | 文件 | 做法 | 用户反馈 / 问题 |
|---|---|---|---|
| v01 / v02「Anatomy」 | `film02/out/DREAM-Anatomy-v0{1,2}-draft.mp4` | 仿 Mango：即梦首尾帧 4 秒短镜头，加代码排版的数据卡和 GLB 线稿拆解 | 转场不够酷，像幻灯片 |
| v03「Ignition」 | `film02/out/DREAM-Ignition-v03-draft.mp4`，剪辑代码 `film02/film/v03.js` | 参考 Eletre 和 Xiaomi 重剪：先慢后快，后期做遮挡切、闪白、光带，配合成音效 | 「整体表现不满意」 |
| **v04「First Light」** | `film02/SCRIPT-v04.md` | 改用 Higgsfield 两步工作流，导演式多镜头一次生成 | **进行中**：资产图已做完，场景视频还没生成 |

**诊断：** v01–v03 都是把 4 秒的单动作片段拼起来，再在后期加特效，所以显得假、没有连贯感。参考片的做法是：一条生成就是一场戏，转场和运镜写进提示词里，由模型在镜头内完成。

---

## 5. v04「First Light」现状

脚本：`film02/SCRIPT-v04.md`，三场戏的英文提示词都是完整可用的版本。

**一句话故事：** 凌晨，机库的灯一排排亮起，驾驶员戴上头盔、启动 Dream，飞出机库；清晨沿着海岸飞行；黄昏降落在崖顶，抬起面罩看海。全片约 45 秒。

| 场 | 时长 | 内容 | 转到下一场 |
|---|---|---|---|
| 1 · IGNITION（机库，黎明前） | 16 s | 顶灯逐排亮起 → 驾驶员走进来（露脸，胸前和背后 logo 可见）→ 戴头盔、放下面罩 → 握操纵杆、电机绿灯亮起 → 螺旋桨启动，吹起水雾 → 离地 → 冲出卷帘门，从镜头上方掠过 | 机腹完全遮满画面时切 |
| 2 · THE COAST（清晨） | 18 s | 贴海高速追拍、沿海岸航拍、长焦跟拍、绕海蚀柱侧倾、俯拍越过海岸线、面罩倒映太阳 | 面罩里的太阳匹配切到落日 |
| 3 · ARRIVAL（黄昏） | 8 s | 逆光飞来 → 降落在崖顶起降台 → 抬起面罩看海 | 切到整屏橙色 logo 卡 |

后期只加三样东西：
- 配乐（Seed Music）；
- 数据小字：第 2 场叠 `100 km/h` 和 `40 min`，第 3 场叠 Pro / ST 参数；
- 3 秒的橙色结尾卡。

### 资产图（第一步，都已生成，在 `film02/assets/`）

| 标签 | 文件 | 即梦节点 ID | 说明 |
|---|---|---|---|
| `@char_pilot3` | `char_pilot3.png` | `node_167qx5myg9` | **当前主演。** 美国男性，30 多岁，深棕短发、浅胡茬、灰绿眼睛。黑色飞行服左胸印小号 CoolFly logo，背后印大号 logo（「Cool」米白、「Fly」橙色） |
| `@prop_dream` | `prop_dream.png` | `node_wf2qdjb9n2` | Dream 三视图：3/4 前侧、正侧、俯视 |
| `@loc_hangar` | `loc_hangar.png` | `node_j5jgt50xzf` | 夜间机库：积水地面、6 排顶灯、中央起降方块、左侧工具车、右侧小门、远端卷帘门外是黎明的海 |
| `@loc_coast` | `loc_coast.png` | `node_xw8f1p6315` | 清晨海岸：悬崖在左、大海在右、远处有灯塔 |
| `@loc_pad` | `loc_pad.png` | `node_1s1rtrswq3` | 黄昏崖顶起降台：橙色圆环、草地、落日 |
| `ref_logo` | `ref_logo.jpg` | `node_2m6hhejyzx` | 黑底 logo，用于印在衣服上。生成源文件是 `assets/src/logo-on-black.html` |
| 旧版 | `char_pilot.png`、`char_pilot2.png` | | 东亚男性版，已被 char_pilot3 取代 |

### 还没确认的事

`char_pilot3` 刚生成完，用户还没看过。下面四件事都需要用户确认：
1. 新主演的样子：外貌是默认设定，可以改；另外视频运动中 logo 可能会变形。
2. 故事线：点火 → 海岸 → 黄昏抵达。
3. 驾驶员只在开头和结尾露脸，其余时间面罩放下。
4. 全片没有台词和旁白，等 slogan 定了再考虑旁白。

---

## 6. 即梦画布 CLI（dreamina-canvas）

- **画布：** https://jimeng.jianying.com/ai-tool/ai-canvas/cdac4ce4-f845-4758-b9fa-841d6f0bffb0（projectId `cdac4ce4-f845-4758-b9fa-841d6f0bffb0`）。
- **安装：** `curl -fsSL https://jimeng.jianying.com/canvas-cli/install.sh | bash`
  - 先读一遍脚本再运行；
  - CLI 装到 `~/.local/bin/dreamina-canvas`，官方 Skill 装到 `~/.agents/skills/dreamina-canvas-cli/`（这个 Skill 不在仓库里，要读）；
  - 上次用的版本是 v1.0.3。
- **登录：**
  1. 运行 `dreamina-canvas auth login --force`，拿到 device code 和授权链接；
  2. 把链接发给用户，请用户在浏览器里确认；
  3. 运行 `dreamina-canvas auth wait --device-code <code>`；
  4. 用 `auth status` 检查是否登录成功。
  - 报 `oauth_scope_insufficient` 时，重新走一遍 `auth login --force`。
- **生成工具 `tools/jm.py`：** 带积分账本，预算 7000，超预算会拒绝运行。状态文件是 `film02/jimeng-state.json`，里面只存节点和资源 ID，不存 token。
  ```bash
  S=film02/jimeng-state.json
  python3 tools/jm.py $S img KEY --title T --prompt "…" --ref char_pilot3 --ref ref_logo        # 做图（Seedream 5.0 Pro 2K）
  python3 tools/jm.py $S vid KEY --title T --prompt "…" --mode m2v --ref char_pilot3 --ref prop_dream --ref loc_hangar --dur 16 --res 720p   # 多参考视频
  python3 tools/jm.py $S vid KEY --title T --prompt "…" --first K1 --last K2 --dur 5 --res 1080p          # 首尾帧视频
  python3 tools/jm.py $S music KEY --title T --prompt "…" --dur 60
  python3 tools/jm.py $S quote KEY        # 只报价
  python3 tools/jm.py $S run KEY …        # 报价 → 检查预算 → 确认 → 运行
  python3 tools/jm.py $S wait OUTDIR KEY …  # 等结果并下载
  python3 tools/jm.py $S ledger           # 查看积分账本
  ```
- **⚠️ 提示词里的引用：** 脚本里写的 `@char_pilot3` 这类名字，即梦**不会自动识别**。
  - 提交前要把正文里的 `@xxx` 换成 `{{node:<节点ID>}}` 占位符（节点 ID 见第 5 节的表）；
  - 同时用 `--ref` 把这些节点加入参考集合；
  - 依据是官方 Skill 的 `references/identity-and-references.md`「Prompt 引用」一节。
  - 第一次跑之前，先用 `dreamina-canvas schema` 和 `model list --type video` 核对当前参数。
- **常见故障：**
  - 代理连接中途断开（`ws_closed_mid_exchange`）：重试即可；
  - 上传报 `upload_state_unknown`：用同一个 resource id 重试，不会重复上传；
  - 大 PNG 上传失败：改成 JPEG 再传；
  - Seed Music 输出的其实是 MP3 文件，后缀却是 `.wav`，下载后要改名。

### 积分

- **账本：** 已用 **4,944 / 7,000**，剩 **2,056**，以 `jm.py ledger` 为准。
- **价格（实测）：**

| 模型 | 规格 | 积分 |
|---|---|---|
| Seedance 2.5 | 720p | 约 20 / 秒 |
| Seedance 2.5 | 1080p | 约 64 / 秒（4 秒 256） |
| Seedream 5.0 Pro | 每张图 | 8 |
| Seed Music 1.0 | 每 60 秒 | 6 |

- **v04 预算估算：**
  - 第 1 场 720p 测试：约 320；
  - 三场都做 720p 测试：约 840；
  - **1080p 正式版三场各一条：约 2,688，超出剩余积分。** 已向用户建议把总预算加到约 1.2–1.3 万，用户还没答复。

---

## 7. 文件地图

| 位置 | 内容 |
|---|---|
| `brand/coolfly-logo.svg / .png` | 品牌 logo |
| `brand/models/dream.glb`, `urban.glb` | 产品 3D 模型 |
| `brand/refs/` | 用户提供的过往素材、参考片和笔记 |
| `brand/REFERENCE-ANALYSIS.md` | 参考片分析：Mango、Roborock、Eletre、Xiaomi，以及即梦报价 |
| `film01/SCRIPT.md` | 第 1 号片「The Coast」：早期的方向稿 |
| `film02/SCRIPT.md` | v01–v03「Anatomy / Ignition」的脚本 |
| `film02/SCRIPT-v04.md` | **当前脚本「First Light」** |
| `film02/prompts/` | 各批次提示词：`assets.sh` 是资产图，`batch1–4.sh` 是 v01–v03，`director-seq1.md` 和 `scene1-hangar.md` 是导演式草稿 |
| `film02/assets/` | v04 资产图 |
| `film02/keyframes/`, `film02/clips/` | v01–v03 的关键帧和视频片段，K* / N* 是图，V* / VN* 是视频 |
| `film02/refs-glb/` | GLB 六视图渲染（three.js，`studio.js`） |
| `film02/type/` | 代码排版的数据卡（v01–v02 用） |
| `film02/film/` | 代码剪辑引擎：`index.html` / `film.js` 是 v02，`v03.html` / `v03.js` 是 v03，另有 `explode.js` 线稿、`clips.js` 帧序列 |
| `film02/audio/` | 配乐 M1、M3、M4 和混音 `mix/` |
| `film02/out/` | 已交付的样片 |
| `tools/jm.py` | 即梦生成工具 |
| `tools/extract.py` | 视频转帧序列 |
| `tools/sfx.py` | 合成音效：呼啸、重击、咔嗒、上升音 |
| `vendor/three/` | three.js |
| `.claude/skills/higgsfield-timed-prompts/` | 写时间码提示词的 Skill |

### 渲染和后期流程（v02、v03 用过，v04 后期会再用）

1. HTML 页面暴露 `window.__comp` 和 `window.__seek`；
2. 用 Chromium 逐帧截图，参数 `--no-sandbox`，渲染脚本要尽早设置 `window.__ready=false`；
3. 用 ffmpeg 编码成 H.264 + AAC，响度统一到 −14 LUFS。

`film02/film/frames/` 不入库，需要时重新生成。

---

## 8. 和用户沟通的习惯

- 用中文回复，简洁。需要用户确认的事列成编号问题。
- 交付物（视频、对照图）用 SendUserFile 直接发给用户。
- 花视频积分前先报价；做图可以直接做。
- 每完成一步就 commit，并 push 到工作分支。
- 生成的画面先自己逐帧检查（瑕疵、黑边、人脸、logo 是否变形）再交付。用过的修正办法：
  - 剪掉炫光；
  - 只用片段里干净的前一段；
  - 重新生成全画幅版本，去掉内嵌黑边。

---

## 9. 下一步

1. **新对话开场：** 拉取本分支，重装即梦 CLI 并让用户授权。
2. **请用户确认：** 把 `film02/assets/char_pilot3.png`（新主演定妆照）发给用户，同时问第 5 节「还没确认的事」里的四个问题。用户要改外貌或 logo 的话，直接重做图，每张约 8 积分。
3. **第 1 场 720p 测试：** 用户确认后跑，约 320 积分。
   - 按第 6 节的说明，把脚本里的 `@handle` 换成 `{{node:…}}`；
   - 挂上 `char_pilot3`、`prop_dream`、`loc_hangar` 三个参考；
   - 时长 16 秒。
4. **逐帧检查：**
   - 人物是否真实；
   - Dream 结构是否一致：4 根机臂，每根上下两个电机，共 8 个螺旋桨；
   - logo 是否变形；
   - 转场是否成立。
   根据结果修改提示词。
5. **预算决策：** 1080p 正式版三场约需 2,688，剩余积分不够。先请用户决定是追加预算，还是部分镜头用 720p，或者缩短时长。
6. **后期：**
   - Seed Music 配乐；
   - `100 km/h`、`40 min` 和 Pro / ST 参数小字；
   - 3 秒的整屏橙色结尾卡；
   - 响度 −14 LUFS；
   - 输出 16:9 母版。
7. **之后：**
   - 9:16 竖版：有些镜头可能需要按竖构图重新生成；
   - 下个月的片子：Urban；
   - 定下 slogan 后，考虑加旁白或文字。
