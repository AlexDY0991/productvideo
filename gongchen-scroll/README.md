# 竖卷·拱宸

2026“匠智未来”拱墅区数字文创设计技能竞赛参赛短视频（运河新韵 · 竖屏短视频）。

- `PLAN.md`：制作规划（分镜、风格、积分预算、排期）
- `proposal.md`：报名用 200 字创意提案
- `jimeng/state.json`：即梦画布与节点身份（不含任何凭据）
- `tools/jm`：dreamina-canvas 包装脚本，网络断连时用同一组参数自动重试
- `tools/nid`：生成符合格式的节点 ID（`node_` + 10 位小写 Crockford Base32）

## 新会话恢复环境

```bash
curl -fsSL https://jimeng.jianying.com/canvas-cli/install.sh -o /tmp/jimeng-install.sh  # 先读再跑
bash /tmp/jimeng-install.sh
dreamina-canvas auth status   # 未登录则 auth login，把授权链接发给用户
```
