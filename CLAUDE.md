# CoolFly 视频工作室

- 这个仓库长期用于制作 CoolFly 视频。开始工作前先读 `HANDOFF.md`（背景、当前进度、账本、下一步），方法和硬规矩在 `.claude/skills/coolfly-film/SKILL.md`。需要细节时再查 `handoff/conversation-log.md`。
- 用户只做决策和评判，其余由 Claude 完成。和用户用中文交流；画面里的文字一律用英文。
- 积分以 `tools/jm.py <状态文件> ledger` 为准。做图可以直接做；视频生成要先报价，并在预算内运行，一律用样片模式。
- 写视频提示词时用 `.claude/skills/higgsfield-timed-prompts`。人物要尽量真实。产品参数只能用 HANDOFF.md 里列出的数据。
- 出片前镜头表必须通过 `tools/edl_check.py`。
