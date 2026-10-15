#!/usr/bin/env python3
"""按 spec 批量保存、报价、运行即梦画布节点，并下载产物。

用法：
  python3 tools/jmbatch.py specs/xxx.json             只保存草稿并报价
  python3 tools/jmbatch.py specs/xxx.json --run      报价后运行（总价须 ≤ --ceiling，默认等于报价）
  python3 tools/jmbatch.py specs/xxx.json --run --ceiling 400

spec 格式：
  {"items": [{"key": "k04-a", "type": "image", "title": "...", "mode": "t2i",
              "model": "seedream_5.0_pro", "ratio": "9:16", "resolution": "2K",
              "prompt": "...", "refs": ["key:kv-a2"]}]}
  视频另加 "duration"；refs 里 "key:<业务键>" 解析为该键的 Node ID，也可直接写 "node:<id>"。

身份全部记在 jimeng/state.json：节点 ID 首次保存前生成，提交 ID 运行前生成并先落盘，
所以网络中断后重跑同一命令只会重放同一次提交，不会重复扣积分。生成配置没变且已成功的条目会跳过。
产物下载到 out/jimeng/<key>.<ext>（out/ 不入库）。
"""
import hashlib
import json
import re
import secrets
import subprocess
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
STATE = ROOT / "jimeng" / "state.json"
OUT = ROOT / "out" / "jimeng"
JM = str(ROOT / "tools" / "jm")
GEN_FIELDS = ("mode", "model", "ratio", "resolution", "duration", "prompt", "refs", "voice", "scenario")


def jm(*args):
    proc = subprocess.run([JM, *map(str, args)], capture_output=True, text=True)
    for line in reversed(proc.stdout.strip().splitlines()):
        line = line.strip()
        if line.startswith("{"):
            return json.loads(line)
    raise RuntimeError(f"no JSON from dreamina-canvas {' '.join(map(str, args))}: {proc.stdout}{proc.stderr}")


def new_node_id():
    alphabet = "0123456789abcdefghjkmnpqrstvwxyz"
    return "node_" + "".join(secrets.choice(alphabet) for _ in range(10))


def load_state():
    return json.loads(STATE.read_text("utf8"))


def save_state(state):
    STATE.write_text(json.dumps(state, ensure_ascii=False, indent=2) + "\n", "utf8")


def spec_hash(item):
    return hashlib.sha256(json.dumps({k: item.get(k) for k in GEN_FIELDS}, ensure_ascii=False, sort_keys=True).encode()).hexdigest()[:16]


def resolve_ref(ref, state):
    if ref.startswith("key:"):
        return "node:" + state["items"][ref[4:]]["nodeId"]
    return ref


def save_node(item, state):
    """创建或编辑节点；生成配置未变则不动。返回该条目的 state 记录。"""
    entry = state["items"].setdefault(item["key"], {})
    digest = spec_hash(item)
    if entry.get("nodeId") and entry.get("specHash") == digest:
        return entry
    action = "edit" if entry.get("specHash") else "create"
    entry.setdefault("nodeId", new_node_id())
    save_state(state)
    # 正文里的 {{key:<业务键>}} 换成该键节点的 {{node:<id>}}，用于把多张参考图绑定到正文中的具体角色
    prompt = re.sub(r"\{\{key:([\w-]+)\}\}", lambda m: "{{node:" + state["items"][m.group(1)]["nodeId"] + "}}", item["prompt"])
    args = ["node", action, item["type"], "--project-id", state["canvasId"], "--node-id", entry["nodeId"],
            "--update-id", str(uuid.uuid4()), "--title", item["title"], "--mode", item["mode"], "--prompt", prompt]
    for flag in ("model", "ratio", "resolution", "duration", "scenario"):
        if item.get(flag) is not None:
            args += [f"--{flag}", item[flag]]
    if item.get("voice"):
        args += ["--voice-name", item["voice"]]
    if item["type"] in ("image", "video"):
        args += ["--count", 1]
    for ref in item.get("refs", []):
        args += ["--ref", resolve_ref(ref, state)]
    result = jm(*args)
    if not result.get("ok"):
        raise SystemExit(f"[{item['key']}] save failed: {json.dumps(result, ensure_ascii=False)}")
    entry.update(title=item["title"], type=item["type"], specHash=digest, status="draft")
    entry.pop("submitId", None)
    save_state(state)
    print(f"  saved {item['key']} → {entry['nodeId']} ({action})")
    return entry


def download(key, entry, state):
    ext = {"image": "jpg", "video": "mp4", "audio": "mp3"}[entry["type"]]
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / f"{key}.{ext}"
    result = jm("resource", "download", entry["resourceId"], "--project-id", state["canvasId"], "--output", target)
    if not result.get("ok"):
        print(f"  [{key}] download failed: {result.get('error')}")
        return
    entry["sha256"] = result["data"].get("sha256")
    print(f"  downloaded {target.relative_to(ROOT)}")


def restore():
    """新会话：把 state 里所有已成功的产物重新下载到 out/jimeng/。"""
    state = load_state()
    for key, entry in state["items"].items():
        if entry.get("status") != "succeeded" or not entry.get("resourceId"):
            continue
        ext = {"image": "jpg", "video": "mp4", "audio": "mp3"}[entry["type"]]
        if not (OUT / f"{key}.{ext}").exists():
            download(key, entry, state)
    save_state(state)


def main():
    if sys.argv[1] == "--restore":
        return restore()
    spec = json.loads(Path(sys.argv[1]).read_text("utf8"))
    run = "--run" in sys.argv
    ceiling = int(sys.argv[sys.argv.index("--ceiling") + 1]) if "--ceiling" in sys.argv else None
    state = load_state()

    print("save:")
    pending = []
    for item in spec["items"]:
        entry = save_node(item, state)
        if entry.get("status") != "succeeded":
            pending.append((item["key"], entry))
    for item in spec["items"]:
        entry = state["items"][item["key"]]
        ext = {"image": "jpg", "video": "mp4", "audio": "mp3"}[entry["type"]]
        if entry.get("status") == "succeeded" and not (OUT / f"{item['key']}.{ext}").exists():
            download(item["key"], entry, state)
    if not pending:
        print("nothing to run")
        return

    quote = jm("node", "quote", "--project-id", state["canvasId"], *[a for _, e in pending for a in ("--node-id", e["nodeId"])])
    if not quote.get("ok"):
        raise SystemExit(f"quote failed: {json.dumps(quote, ensure_ascii=False)}")
    prices = {i["nodeId"]: i.get("maxCredits") for i in quote["data"]["items"]}
    for key, entry in pending:
        print(f"  quote {key}: {prices.get(entry['nodeId'])}")
    total = quote["data"]["totalMaxCredits"]
    budget = state["creditBudget"]
    print(f"total {total} credits (spent so far {budget['spent']} / ceiling {budget['ceiling']})")
    if any(prices.get(e["nodeId"]) is None for _, e in pending):
        raise SystemExit("some items could not be quoted; fix them before running")
    if not run:
        return
    if budget["spent"] + total > budget["ceiling"]:
        raise SystemExit("would exceed the overall credit ceiling; stopping")
    if ceiling is not None and total > ceiling:
        raise SystemExit(f"quote {total} exceeds --ceiling {ceiling}; stopping")

    for _, entry in pending:
        entry.setdefault("submitId", str(uuid.uuid4()))
        entry["quotedCredits"] = prices[entry["nodeId"]]
    save_state(state)
    args = ["node", "run", "--project-id", state["canvasId"]]
    for _, entry in pending:
        args += ["--node-id", entry["nodeId"], "--submit-id", entry["submitId"]]
    if quote["data"].get("confirmationRequired"):
        confirm = jm("node", "confirm", "--project-id", state["canvasId"], "--credit-ceiling", ceiling or total,
                     *[a for _, e in pending for a in ("--node-id", e["nodeId"])])
        if not confirm.get("ok"):
            raise SystemExit(f"confirm failed: {json.dumps(confirm, ensure_ascii=False)}")
        args += ["--credit-token", confirm["data"]["creditConfirmationToken"]]
    result = jm(*args)
    if not result.get("ok"):
        raise SystemExit(f"run failed: {json.dumps(result, ensure_ascii=False)}")
    outcome = {i["nodeId"]: i for i in result["data"]["items"]}
    accepted = []
    for key, entry in pending:
        item = outcome.get(entry["nodeId"], {})
        if item.get("error"):
            entry["status"] = "rejected"
            print(f"  [{key}] rejected: {json.dumps(item['error'], ensure_ascii=False)}")
        else:
            entry["status"] = "submitted"
            accepted.append((key, entry))
            budget["spent"] += entry["quotedCredits"]
    save_state(state)
    print(f"submitted {len(accepted)} item(s); waiting…")

    for key, entry in accepted:
        waited = jm("operation", "wait", entry["submitId"], "--project-id", state["canvasId"], "--timeout", "15m")
        data = waited.get("data") or {}
        if data.get("state") == "succeeded" and data.get("resources"):
            entry["status"] = "succeeded"
            entry["resourceId"] = data["resources"][0]["resourceId"]
            download(key, entry, state)
        else:
            entry["status"] = data.get("state") or "unknown"
            print(f"  [{key}] {entry['status']}: {json.dumps(waited, ensure_ascii=False)[:400]}")
        save_state(state)


if __name__ == "__main__":
    main()
