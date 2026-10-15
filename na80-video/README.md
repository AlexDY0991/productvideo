# NA80 双余度飞控 · 科普视频

用 anatomy 技能（`.claude/skills/anatomy`）搭了一台等轴测“试验台”来讲双余度：两台 NA80 飞控、表决器（滑动换向器）、执行机构（电调 + 电机桨叶、舵机）和地面站平板。画面里的零件本身就是解释：滑块从 A 滑到 B 就是切换，桨叶一直转就是任务没有中断。

成片：`out/NA80-双余度飞控-科普.mp4`（1920×1080 · 30 fps · 约 1 分 55 秒）

## 口径

以已确认的《NA80 双余度飞控单页》为准，文案语气取自《双飞控》v1.0：

- 讲：飞控是什么、单点失效、双余度（两台独立的 CPU / 内存 / 存储 / IMU / 气压计，同一套软件）、实时同步（健康状态、飞行模式与解锁状态）、表决器仲裁、毫秒级自动切换、地面站可见可控与手动切换。
- 不讲：MAVLink、航插型号、硬件参数（电压、温度、重量、尺寸、同步频率等）。三余度 IMU、RTK、消摆也不在这一支里。

## 分镜

| 段落 | 内容 | 画面 |
|---|---|---|
| Fig 1 飞行没有暂停键 | 开场 | 全景，桨叶转动，控制指令（橙）与同步数据（白）在线缆里流动 |
| Fig 2 什么是飞控 | 感知 → 解算 → 控制 → 执行 | A 机上盖抬起，IMU、气压计、CPU 依次点亮，镜头拉到整条链路 |
| Fig 3 单点失效 | 单飞控只有一条链路 | B 机淡出；A 机故障变红，指令中断，桨叶减速 |
| Fig 4 什么是双余度 | 两台独立飞控 | B 机回来；两机上盖抬起，CPU / 内存 / 存储 / IMU / 气压计成对点亮 |
| Fig 5 实时同步 | 健康状态、模式、解锁状态 | 同步线缆里白色数据双向流动 |
| Fig 6 表决器 | 监测与仲裁 | 换向器特写，两盏健康灯随心跳闪烁，A 路橙色在控，B 路灰色热备 |
| Fig 7 可见 · 可控 | 地面站 | 平板显示余度状态；按“手动切换”，滑块 A→B，再 B→A |
| Fig 8 毫秒级切换 | 故障自动切换 | A 机异常变红，滑块瞬间滑到 B，橙色指令改走 B 路，桨叶不停 |
| Fig 9 第二个判断 | 片尾 | CoolFly 标志 · NA80 军工级双余度飞控系统 · 让飞行始终拥有第二个判断 |

## 配音（火山引擎）

`tts/volc.mjs` 调用火山引擎豆包语音合成 HTTP V3 接口（`/api/v3/tts/unidirectional`），逐句合成。默认音色 `zh_male_m191_uranus_bigtts`（云舟 2.0，通用男声）。也可以换成 `zh_male_yuanboxiaoshu_moon_bigtts`（渊博小叔，1.0）这类更偏讲解的男声。

凭证从环境变量读取，不要写进仓库：

- 新版控制台：`VOLC_API_KEY`
- 旧版控制台：`VOLC_APP_ID` + `VOLC_ACCESS_KEY`
- 可选：`VOLC_SPEAKER`（音色）、`VOLC_RESOURCE_ID`（默认按音色推断 `seed-tts-2.0` / `seed-tts-1.0`）、`VOLC_SPEECH_RATE`（语速，-50～100）

当前仓库里的 `audio/lines/*.mp3` 是**临时预览配音**（edge-tts `zh-CN-YunyangNeural` 男声），只用来对齐画面节奏。拿到火山凭证后运行 `./make.sh` 即可整片重出：画面里的每个动作都挂在配音的关键词上，换了配音会自动重新对齐。

## 命令

```bash
./make.sh            # 火山引擎配音 → 时间轴 → 构建（含 anatomy 审计）→ 渲染 → 合成
./make.sh --preview  # 没有火山凭证时，用临时男声
./make.sh --keep     # 沿用 audio/lines 里已有的配音

node figure/build.mjs --audit                 # 只构建舞台并跑几何审计
node render/render.mjs --shots 13,45,93.7     # 导出静帧检查
```

预览：构建后用任意静态服务器打开 `stage.html`，点击画面即可带配音播放。

## 结构

- `script.json`：文案与分段（唯一的文字来源）
- `tts/`：火山配音、临时预览配音、拼接配音并生成 `timeline.json`
- `figure/build.mjs`：等轴测几何、绘制顺序（`A.settle`）、审计；输出 `stage.html`
- `figure/live.js`：时间轴，所有状态都是时间 t 的纯函数，`window.seek(t)` 可逐帧确定性渲染
- `render/render.mjs`：无头 Chromium 逐帧截图，ffmpeg 编码
- `fonts/fetch.sh`：下载 Noto Sans SC / JetBrains Mono / Barlow Condensed（与单页一致）

## 校验

- `node figure/build.mjs --audit`：audit passed（净空、端点落位、支撑、深度顺序、拥挤等全部为 0）
- `scripts/lines.mjs`：线端悬空 0 / 667（上盖合上、打开、切换到 B 三种姿态）
