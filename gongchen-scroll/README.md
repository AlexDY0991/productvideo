# 竖卷·拱宸

2026“匠智未来”拱墅区数字文创设计技能竞赛参赛短视频（运河新韵 · 竖屏短视频）。

| 文件 | 内容 |
|---|---|
| `PLAN.md` | 制作规划：分镜、风格、积分预算、排期、进度 |
| `proposal.md` | 报名用 200 字创意提案 |
| `NARRATION.md` | 旁白提词与录音说明（可选：本人录制旁白） |
| `timeline.json` | 全片时间轴：镜头、转场、文字、字幕、旁白落点、配乐与音效 |
| `render/compose.py` | 画面合成器（宣纸、墨线、长卷转场、逐字墨迹文字、印章、字幕） |
| `render/mix.py` | 混音（旁白落点、配乐闪避、合成音效、响度标准化）与最终编码（两遍编码，≤20MB） |
| `specs/*.json` | 每一批即梦生成的提示词与参数 |
| `jimeng/state.json` | 即梦画布、节点、提交与产物身份（不含任何凭据），以及积分花费 |
| `tools/jmbatch.py` | 按 spec 批量保存、报价、运行、下载；重跑不会重复扣积分 |
| `tools/jm`、`tools/nid` | dreamina-canvas 包装（断网自动重试）与节点 ID 生成 |

## 出片

```bash
fonts/fetch.sh                                  # 首次：下载开源字体
python3 tools/jmbatch.py --restore               # 新会话：取回已生成的素材
python3 tools/jmbatch.py specs/<批次>.json       # 先报价
python3 tools/jmbatch.py specs/<批次>.json --run # 生成并下载到 out/jimeng/
python3 render/compose.py --shots 3.5,12,40     # 抽静帧检查
python3 render/compose.py                       # 合成画面 → out/video-silent.mp4
python3 render/mix.py --mux                     # 混音并编码 → out/竖卷拱宸.mp4
```

依赖：ffmpeg、Python 3 + numpy、Pillow、opencv-python-headless。`out/` 下的素材与成片不入库。

## 新会话恢复环境

```bash
curl -fsSL https://jimeng.jianying.com/canvas-cli/install.sh -o /tmp/jimeng-install.sh  # 先读再跑
bash /tmp/jimeng-install.sh
dreamina-canvas auth status   # 未登录则 auth login，把授权链接发给用户
pip install --break-system-packages opencv-python-headless
```

即梦生成的素材在画布上都能找回：`python3 tools/jmbatch.py --restore` 按 `jimeng/state.json` 把所有已生成的产物重新下载到 `out/jimeng/`。
