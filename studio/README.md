# CoolFly 做图工作室

分支 `claude/coolfly-image-studio`。用即梦画布 CLI（dreamina-canvas）做图，偶尔做视频。和 film02 视频项目无关：不读写 `film02/jimeng-state.json`，不往它的画布加节点，不推送到 `claude/peaceful-goldberg-upekrl`。

## 画布

- 名称：CoolFly 做图
- 链接 / projectId：见 `studio/jimeng-state.json` 的 `webUrl` / `projectId`

## 开工

1. 新容器要重装 CLI：下载 `https://jimeng.jianying.com/canvas-cli/install.sh`，读一遍再运行。CLI 在 `~/.local/bin/dreamina-canvas`，官方 Skill 在 `~/.agents/skills/dreamina-canvas-cli/SKILL.md`（要读）。
2. 登录：`dreamina-canvas auth login --force` → 把授权链接用中文发给用户 → 用户确认后 `dreamina-canvas auth wait --device-code <code>` → `dreamina-canvas auth status`。
3. main 根目录有一个韩文文件名超长的 mp4，本机文件系统放不下，已用 sparse-checkout 排除（`git sparse-checkout set --no-cone '/*' '!/5 *.mp4'`）。新 clone 合并 main 前先执行这条。

## 做图

```bash
S=studio/jimeng-state.json
python3 tools/jm.py $S upload R_dream brand/refs/ref-dream-orange.webp     # 本地参考图 → 画布节点（大 PNG 先转 JPEG）
python3 tools/jm.py $S img I001 --title "I001 · 标题" --prompt "…" --ref R_dream [--ratio 16:9] [--res 2K]
python3 tools/jm.py $S run I001            # 报价 → 检查预算 → 运行
python3 tools/jm.py $S wait studio/out I001 # 下载到 studio/out/I001.png
python3 tools/jm.py $S ledger              # 本画布积分账本
```

- 键名约定：`R_*` 参考图上传，`I###` 图片，`V###` 视频（`wait` 按 V 开头存 mp4）。
- 提示词里引用参考节点用 `{{node:<节点ID>}}`，同时用 `--ref` 加入参考集合。
- film02 的节点 ID 属于另一个画布，这里不能直接用；要用那边的图就从 `film02/assets` 等目录 `upload` 过来。
- Seedream 5.0 Pro 每张约 8 积分，直接做，事后告诉用户花了多少。
- 视频：先 `quote` 报价，用户同意后再 `run`。Seedance 2.5 约 20 积分/秒（720p）、64 积分/秒（1080p）。
- `ledger.budget` 是本画布的上限（默认 1000，用户可调）。账户与视频项目共用。

## 找素材

需要真实照片做参考或入画时，用仓库内 Skill `asset-discovery` 的 `scripts/images.py`（Openverse/NASA 免 Key；Unsplash/Pexels/Pixabay 需环境变量 `UNSPLASH_ACCESS_KEY` 等）：

```bash
I=.claude/skills/asset-discovery/scripts/images.py
python3 $I search openverse "maldives overwater villas" --out studio/refs/web/q.json
python3 $I sheet studio/refs/web/q.json --out studio/refs/web/q.jpg   # 先看拼板再选
python3 $I download studio/refs/web/q.json 2 5 --dir studio/refs/web   # 附 .license.json 和 CREDITS.md
```

CC BY 素材在成品中要署名；NC/ND 不用。

## 开工前：设计简报（每个新物料必做）

先想清楚再出图。拿到新任务时，先写一份简短简报给用户确认，确认后才生成或排版：

1. **场景**：放在哪里、什么尺寸、观看距离和停留时间（通道里一瞥 / 站定细看 / 手机里刷到）。
2. **观众**：是谁，对 CoolFly 了解多少（政府与合作方、行业买家、普通公众、媒体）。
3. **目的**：吸引眼球、认出品牌、理解产品、拍照传播，还是留下联系方式；只选一个主目的。
4. **信息层级**：必须有的内容按远、中、近排序，各一句话；不确定的问用户，不自己编。
5. **环境关系**：遮挡（人、展台、真机）、周边物料、与其他物料的统一。
6. **方向**：先给 1–2 个方向的小草图或文字描述让用户选，再做精细稿。

物料类型不同，逻辑不同：展台背景墙是空间的一部分（远处认品牌、近处讲产品、可当拍照背景、给真机和人让位），不要当成放大的海报来做。

## 规则

- 画面文字一律英文；人物尽量真实。
- Dream / Urban 外形必须与 `brand/models/*.glb` 和参考图一致；产品参数只能用 `HANDOFF.md` 第 1 节表格里的数据。
- 每次出图：先自查瑕疵（logo、文字、机臂/螺旋桨数量、手指等）→ SendUserFile 发给用户 → 提交并推送到 `claude/coolfly-image-studio`。
- 和用户用中文、简洁。

## 参考素材

| 位置 | 内容 |
|---|---|
| `brand/coolfly-logo.svg/.png` | logo |
| `brand/models/dream.glb`, `urban.glb` | 产品 3D 模型 |
| `brand/refs/ref-dream-orange.webp`, `ref-dream-white.webp`, `ref-urban.webp` | 产品参考图 |
| `brand/refs/*.png`, `*.mp4` | 过往素材与参考片（只作风格参考） |
| `film02/refs-glb/out/v1–v6*.png`, `dream-views-sheet.png` | Dream GLB 六视角渲染 |
| `film02/assets/` | 人物、场景、道具、logo 资产图 |
| `film02/keyframes/` | 已生成的关键帧 |
| main 根目录 | 用户上传的图片、参考视频、`DREAM_PRO_ST_表面定制工艺文件…pdf` |
