# 酷飞 Dream Pro · 安全

一镜到底的尺度俯冲，讲 Dream Pro 的三层安全：冗余 → 主动安全 → 被动安全。镜头从整机推到电机、电池、NA80 飞控（主 / 从 / 表决器）和 IMU 芯片，再拉回整机，最后推进座舱看驾驶员的安全气囊服和头盔。风格参考英伟达《Blackwell Silicon to Scale》。脚本和口径见 [SCRIPT.md](SCRIPT.md)。

成片：`out/酷飞-DreamPro-安全-中文.mp4`（1920×1080 · 30 fps · 约 1 分 31 秒）

## 怎么做的

- `film/index.html` + `film/film.js`：three.js 场景加 HTML 叠加层（标题、字幕、视野标尺、标注框、片尾）。所有状态都是时间 `t` 的纯函数，`window.seek(t)` 逐帧确定性渲染，可以多进程并行。
- 动作挂在配音上：`cue('motors', 2, '失效')` 取的是旁白里“失效”两个字出现的时刻。换了配音以后重跑 `tts/timeline.mjs`，画面会自动重新对齐。
- 模型：
  - 原始模型是 `models/dream.glb`（约 239 万面）。
  - 渲染用的是 `models/dream-lite.glb`（约 58 万面），由 `tools/lite.mjs` 用 meshoptimizer 减面生成，节点名和层级不变。
  - 加载后，静态部件按材质合并；桨叶组和电池单独保留，用来做动画和高亮。
  - 加 `?full` 参数可以换回原始模型对比。
- 渲染：无头 Chromium + SwiftShader（软件 WebGL），约 2 秒一帧。软件 WebGL 已经吃满所有 CPU 核，开多个 worker 提升不大。
- 示意部分：NA80 安装位置、表决器外形、降落伞圆桶、机身安全气囊、驾驶员都是示意，详见 SCRIPT.md。

## 剪映工程（可再剪辑的分层版本）

`jianying/` 把成片拆成分层素材，生成剪映草稿：

- 三维画面：按场景分段，不带文字；
- 透明标注层：标尺和标注框，ProRes 4444；
- 剪映原生文字：标题、三层列表、角标文字、片尾、SRT 字幕；
- 分句配音。

素材包里的文件名全部用英文，草稿里的素材路径用占位符代替。用户解压后双击 `install-draft.bat`，脚本会把占位符换成本机路径，并把草稿复制进剪映的草稿目录。

```bash
SP=/tmp/jy
node render/render.mjs --edit-data $SP/edit.json                                   # 标题、字幕、片尾的出入点和版式
python3 jianying/render_layers.py --out $SP/render --scenes 1-4                   # 分层渲染（整片约 2 小时，分两批）
python3 jianying/render_layers.py --out $SP/render --scenes 5-7
python3 jianying/build.py --edit $SP/edit.json --render $SP/render --out $SP/DreamPro-Safety-ZH --name DreamPro-Safety-ZH
```

需要 `pip install pyJianYingDraft`。剪映字号与像素的换算写在 `build.py` 的 `PX_PER_SIZE`，按剪映里的实际效果校准。

## 配音

- 火山引擎：`tts/volc.mjs`（豆包语音合成 HTTP V3）。
- 凭证从环境变量读取，不要写进仓库：
  - `VOLC_API_KEY`；
  - 或者 `VOLC_APP_ID` + `VOLC_ACCESS_KEY`。
- 可选：
  - `VOLC_SPEAKER`：默认 `zh_male_m191_uranus_bigtts`；
  - `VOLC_RESOURCE_ID`；
  - `VOLC_SPEECH_RATE`。

当前 `audio/lines/*.mp3` 是**临时预览配音**（edge-tts `zh-CN-YunyangNeural`）。

## 命令

```bash
./make.sh            # 火山引擎配音 → 时间轴 → 渲染 → 合成
./make.sh --preview  # 没有火山凭证时，用临时男声
./make.sh --keep     # 沿用 audio/lines 里已有的配音

python3 tts/preview.py zh-CN-YunyangNeural end   # 只重合成某一场的预览配音
node tts/timeline.mjs                            # 重新拼配音、写 timeline.json
node render/render.mjs --shots 3,17.5,40,66,79   # 导出静帧检查（out/shot-*.png）
node render/render.mjs --from 58 --to 72         # 只渲染一段

# 重新生成减面模型（需要先 npm install）
cd tools && npm install && node lite.mjs ../models/dream.glb ../models/dream-lite.glb
```

在浏览器里打开 `film/index.html`（需要本地 HTTP 服务），点击画面即可边播配音边实时预览。加 `?t=40` 可以停在某一时刻。
