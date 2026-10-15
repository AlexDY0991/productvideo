# 仰望 · LOOKING UP

**人类飞行的梦想与飞行器演变史** — 为 CoolFly 制作的一部约 5 分钟的动态影像，中英双语字幕，英文纪录片旁白。

*A five-minute motion film on the human dream of flight, from myth to machine, ending on CoolFly's two personal aircraft: Urban (standing flight) and Dream (seated flight).*

整部片子由代码生成：每一帧都是时间 `t` 的确定函数，所以可以在浏览器里实时播放，也可以逐帧渲染成母版视频。2D 画面用 Canvas 绘制，飞行器用 three.js 实时渲染，配乐和音效用 numpy 程序合成，旁白用本地神经网络 TTS 生成。

---

## 叙事结构

贯穿全片的线索：**每个时代都有一个人仰望天空**。同一个抬头的侧影在不同时代换上当时的画风，从眼睛射出一道"视线"，连到那个时代的飞行器上。最后所有视线汇聚到同一个点，转入结尾。

| 时间 | 章节 | 画面风格 |
|---|---|---|
| 0:00 | 序 · 仰望 | 黎明前的剪影、鸟群、片名 |
| 0:20 | I 神话与仿生 | 伊卡洛斯：古希腊黑绘陶瓶 · 敦煌飞天：矿物颜料壁画 · 鲁班木鹊：宣纸墨线与印章 · 风筝：工笔设色 |
| 1:02 | II 手稿 1505 | 达·芬奇羊皮纸手稿：眼睛素描、鸟类飞行习作、扑翼机、空中螺旋，镜像书写 |
| 1:24 | III 比空气更轻 1783 | 孔明灯夜景 · 蒙哥尔费热气球：手工上色铜版画 |
| 1:46 | IV 十二秒 1903 | 莱特飞行者号：银盐黑白照片、片门抖动、计时器，定格成那张照片 |
| 2:06 | V 战争之翼 | 一战双翼机缠斗，战壕、硝烟与橄榄色调 |
| 2:20 | VI 黄金年代 | 装饰艺术旅行海报、抛光铝 DC-3、林德伯格航线 |
| 2:38 | VII 超越声音 | 蓝图、风洞、计算尺 · X-1 突破声障（纹影激波）· 彗星客机 · 协和式 |
| 3:00 | VIII 垂直 | VS-300 爆炸图组装、旋翼启动、达·芬奇螺旋的幽灵重现 |
| 3:14 | IX 天空之外 | 人造卫星、加加林、土星五号、月面脚印、地出（视线第一次回望地球） |
| 3:42 | X 数字之翼 | 碳纤维、无刷电机、飞控纠偏、城市飞行走廊 |
| 4:02 | XI 每一个人 | 12 个时代的仰望者，视线汇于一点 |
| 4:16 | 终章 | 各时代线稿拆解为线段粒子 → 重组为 Urban 与 Dream → 城市上空升起 / 掠过开阔水面 → 对角分屏定格 → CoolFly |

## 播放

```bash
node tools/serve.mjs 8080          # 然后打开 http://127.0.0.1:8080/film/
```

空格播放/暂停，← → 快退快进 5 秒，`C` 开关字幕，`F` 全屏，进度条上标有章节。播放器同步播放 `film/assets/audio/score.m4a`（配乐 + 旁白混音）。

## 渲染母版

需要 Node 18+、Playwright（Chromium）、ffmpeg、Python 3（numpy、scipy）。

```bash
node tools/export-timeline.mjs                 # 导出时间轴（字幕、同步点）给音频工具
python3 tools/score.py                         # 合成配乐与音效  → out/audio/score.wav
python3 tools/voiceover.py --model <kokoro>    # 生成旁白并混音  → out/audio/mix.wav
node tools/render.mjs --workers 4 --audio out/audio/mix.wav --out out/video/looking-up.mp4
```

- `tools/still.mjs 12.5 64 270 --sheet a.png`：渲染任意时间点的静帧和联系表，用来检查画面。
- 渲染器以 2 秒为单位把帧分给多个无头 Chromium 进程，每帧在页面内导出 PNG，经 ffmpeg 编码成 H.264 分段后拼接，再混入音轨。
- 3D 层不开 MSAA，以 2 倍分辨率渲染后缩小（SwiftShader 下 MSAA 比超采样慢约 5 倍）；2D 画布用 CPU 光栅化（`--disable-accelerated-2d-canvas`）。

## 旁白

`tools/voiceover.py` 用 [Kokoro-82M](https://huggingface.co/hexgrad/Kokoro-82M)（Apache-2.0，ONNX 版 `onnx-community/Kokoro-82M-v1.0-ONNX`）离线合成英文男声，默认是两种英式男声的混合（`bm_george:0.55,bm_lewis:0.45`），语速 0.9。每句旁白对齐到对应字幕，放不下时自动略微提速。人声链路：高通、暖音 EQ、齿音衰减、压缩、轻微空间混响、响度归一；配乐在人声出现时自动避让（sidechain）。

`--model` 指向一个包含 `model.onnx` 和 `voices.npz` 的目录（`voices.npz` 由该仓库 `voices/*.bin` 打包而成，每个音色为 `(510, 1, 256)` 的 float32 数组）。如需换成火山引擎等云端 TTS，只需按 `out/timeline.json` 里的字幕时间生成同样的分句音频，替换 `out/audio/vo_raw.wav`，后面的处理和混音流程不变。

## 目录

```
film/
  index.html            播放器（同时提供渲染模式 ?render=1）
  src/film.js           合成器：场景调度、转场、章节卡、字幕
  src/script.js         剧本：场景时间、章节、双语字幕、声画同步点
  src/scenes/*.js       各章节场景
  src/art/              人物侧影与"视线"母题、天空与地形、2D 绘制工具
  src/three/            three.js 舞台、程序化飞行器模型、CoolFly 模型加载
  assets/models/        urban.glb、dream.glb（CoolFly 提供）
  assets/brand/         CoolFly Logo（PNG + 描摹的 SVG）与产品参考图
  assets/fonts/         按片中实际用字裁剪的字体子集
  vendor/three/         three.js r169 及加载器
tools/                  渲染、静帧、配乐、旁白、字体裁剪、Logo 描摹
```

## 资料与署名

- 历史节点：伊卡洛斯（希腊神话）；敦煌飞天壁画；《墨子·鲁问》"公输子削竹木以为鹊，成而飞之，三日不下"；达·芬奇《论鸟的飞行》（1505）及"鸟是按数学规律运作的工具"一句（Codex Atlanticus）；1783 年 11 月 21 日蒙哥尔费热气球首次载人自由飞行（巴黎）；1903 年 12 月 17 日莱特兄弟首飞（12 秒、120 英尺、约 12 马力）；1927 年林德伯格单人飞越大西洋；1936 年 DC-3 投入航线；1947 年 10 月 14 日 X-1 突破声障；1952 年 5 月 2 日彗星客机投入航线；1969 年 3 月 2 日协和式首飞；1939 年 9 月 14 日 VS-300 首次（系留）升空；1957 年斯普特尼克 1 号；1961 年 4 月 12 日加加林；1968 年地出（阿波罗 8 号）；1969 年 7 月 20 日阿波罗 11 号登月。
- 除 CoolFly 的两个 GLB 外，所有飞行器都是简化的示意模型，比例按公开资料近似，不是工程精确模型。片中人物均为风格化的匿名剪影。
- 字体：Noto Serif SC、Noto Sans SC、Ma Shan Zheng、Cormorant Garamond、Cinzel、IM Fell English、Special Elite、Limelight、Poiret One、JetBrains Mono、Inter（均为 SIL OFL，经 @fontsource 获取并裁剪）。
- three.js（MIT）；Draco 解码器（Apache-2.0）；Kokoro-82M（Apache-2.0）。
- CoolFly 名称、Logo 与 Urban / Dream 模型版权归 CoolFly 所有。
