#!/usr/bin/env python3
"""Jimeng (dreamina-canvas CLI) production helper with a credit ledger.

State (node / submit / resource IDs only, never tokens) lives in a JSON file next to the film,
so a later session can resume. Every run is quoted first and refused if it would push the
ledger past the budget.

  jm.py STATE upload KEY FILE                      upload a local image and pin it as an image node
  jm.py STATE img KEY --title T --prompt P [--ref KEY ...] [--res 2K] [--model M]
  jm.py STATE vid KEY --title T --prompt P --first KEY [--last KEY] [--dur 4] [--res 1080p] [--model M] [--mode first_last_frame|m2v] [--ref KEY ...]
  jm.py STATE quote KEY ...
  jm.py STATE run KEY ...                          quote → check budget → confirm → run
  jm.py STATE wait OUTDIR KEY ...                  wait for each run and download its result
  jm.py STATE ledger
"""
import json, os, subprocess, sys, time, uuid

CLI = os.path.expanduser("~/.local/bin/dreamina-canvas")


def cli(args, tries=5):
    d = {}
    for i in range(tries):
        r = subprocess.run([CLI, "--format", "json", "--non-interactive"] + args, capture_output=True, text=True)
        try:
            d = json.loads(r.stdout or r.stderr)
        except Exception:
            d = {"ok": False, "error": {"class": "retryable_failure", "raw": (r.stdout + r.stderr)[:300]}}
        if d.get("ok") or d.get("error", {}).get("class") != "retryable_failure":
            return d
        time.sleep(3 * (i + 1))
    return d


class State:
    def __init__(self, path):
        self.path = path
        self.d = json.load(open(path))
        self.d.setdefault("nodes", {})
        self.d.setdefault("ledger", {"budget": 7000, "runs": []})

    def save(self):
        json.dump(self.d, open(self.path, "w"), ensure_ascii=False, indent=1)

    @property
    def P(self):
        return self.d["projectId"]

    def node(self, key):
        return self.d["nodes"].setdefault(key, {})

    def nid(self, key):
        n = self.d["nodes"].get(key, {}).get("nodeId")
        if not n:
            sys.exit(f"unknown node key {key}")
        return n

    def spent(self):
        return sum(r["credits"] for r in self.d["ledger"]["runs"])


def sniff(f, kind):
    """rename a download to the extension its bytes say it is (png/jpg/webp/mp4/mp3/wav); returns the extension"""
    try:
        h = open(f, "rb").read(16)
    except OSError:
        return kind
    real = ("png" if h[:4] == b"\x89PNG" else "jpg" if h[:3] == b"\xff\xd8\xff" else "webp" if h[8:12] == b"WEBP"
            else "mp4" if h[4:8] == b"ftyp" else "wav" if h[:4] == b"RIFF" else "mp3" if h[:3] == b"ID3" or h[:2] == b"\xff\xfb" else kind)
    if real != kind:
        os.replace(f, f[: -len(kind)] + real)
    return real


def opt(argv, name, default=None, many=False):
    vals, out, i = [], [], 0
    while i < len(argv):
        if argv[i] == name:
            vals.append(argv[i + 1]); i += 2
        else:
            out.append(argv[i]); i += 1
    argv[:] = out
    return vals if many else (vals[-1] if vals else default)


def save_node(st, key, kind, gen_args, title):
    e = st.node(key)
    e["updateId"] = str(uuid.uuid4())  # each save is a new update
    st.save()
    if "nodeId" in e:
        args = ["node", "edit", kind, "--project-id", st.P, "--node-id", e["nodeId"]]
    else:
        args = ["node", "create", kind, "--project-id", st.P]
    d = cli(args + gen_args + ["--title", title, "--update-id", e["updateId"]])
    if not d.get("ok"):
        sys.exit(f"{key}: save failed {json.dumps(d.get('error'), ensure_ascii=False)[:400]}")
    e["nodeId"] = d["data"]["node"]["nodeId"]
    e["title"] = title
    e.pop("submitId", None); e.pop("resourceId", None); e.pop("submitted", None)
    st.save()
    print(key, "saved", e["nodeId"])


def main():
    path, cmd, argv = sys.argv[1], sys.argv[2], sys.argv[3:]
    st = State(path)
    if cmd == "upload":
        key, f = argv
        e = st.node(key)
        e.setdefault("uploadResourceId", str(uuid.uuid4())); st.save()
        d = cli(["resource", "upload", "--project-id", st.P, "--file", f, "--name", key, "--resource-id", e["uploadResourceId"]])
        if not d.get("ok"):
            sys.exit(f"upload failed {d.get('error')}")
        save_node(st, key, "image", ["--import-kind", "local_upload", "--resource-id", e["uploadResourceId"]], f"REF · {key}")
    elif cmd == "img":
        key = argv.pop(0)
        title, prompt = opt(argv, "--title"), opt(argv, "--prompt")
        refs, res, model = opt(argv, "--ref", many=True), opt(argv, "--res", "2K"), opt(argv, "--model", "seedream_5.0_pro")
        g = ["--mode", "i2i" if refs else "t2i", "--model", model, "--ratio", "16:9", "--resolution", res, "--count", "1", "--prompt", prompt]
        for r in refs:
            g += ["--ref", "node:" + st.nid(r)]
        save_node(st, key, "image", g, title)
    elif cmd == "vid":
        key = argv.pop(0)
        title, prompt = opt(argv, "--title"), opt(argv, "--prompt")
        first, last = opt(argv, "--first"), opt(argv, "--last")
        refs = opt(argv, "--ref", many=True)
        dur, res = opt(argv, "--dur", "4"), opt(argv, "--res", "1080p")
        model, mode = opt(argv, "--model", "seedance_2.5"), opt(argv, "--mode", "first_last_frame")
        g = ["--mode", mode, "--model", model, "--ratio", "16:9", "--resolution", res, "--duration", dur, "--prompt", prompt]
        for r in ([first] if first else []) + ([last] if last else []) + refs:
            g += ["--ref", "node:" + st.nid(r)]
        save_node(st, key, "video", g, title)
    elif cmd == "music":
        key = argv.pop(0)
        title, prompt, dur = opt(argv, "--title"), opt(argv, "--prompt"), opt(argv, "--dur", "60")
        save_node(st, key, "audio", ["--mode", "music", "--model", opt(argv, "--model", "seed_music_1.0"), "--duration", dur, "--prompt", prompt], title)
    elif cmd in ("quote", "run"):
        keys = argv
        args = ["node", "quote", "--project-id", st.P]
        for k in keys:
            args += ["--node-id", st.nid(k)]
        q = cli(args)
        if not q.get("ok"):
            sys.exit(f"quote failed {json.dumps(q.get('error'), ensure_ascii=False)[:400]}")
        items = {i["nodeId"]: i for i in q["data"]["items"]}
        for k in keys:
            it = items.get(st.nid(k), {})
            print(f"  {k:8s} {it.get('maxCredits', 'ERR ' + json.dumps(it.get('error'), ensure_ascii=False)[:200])}")
        total = q["data"].get("totalMaxCredits", 0)
        left = st.d["ledger"]["budget"] - st.spent()
        print(f"  total {total} · spent {st.spent()} · left {left}")
        if cmd == "quote":
            return
        if any("error" in items.get(st.nid(k), {}) for k in keys):
            sys.exit("refusing to run: some items cannot be quoted")
        if total > left:
            sys.exit(f"refusing to run: {total} > remaining budget {left}")
        token = None
        if q["data"].get("confirmationRequired"):
            args = ["node", "confirm", "--project-id", st.P, "--credit-ceiling", str(total)]
            for k in keys:
                args += ["--node-id", st.nid(k)]
            c = cli(args)
            if not c.get("ok"):
                sys.exit(f"confirm failed {json.dumps(c.get('error'), ensure_ascii=False)[:400]}")
            token = c["data"].get("creditConfirmationToken") or c["data"].get("token")
        for k in keys:
            if st.node(k).pop("submitted", False):  # a re-run of an edited node is a new submission
                st.node(k)["submitId"] = str(uuid.uuid4())
            st.node(k).setdefault("submitId", str(uuid.uuid4()))
        st.save()
        args = ["node", "run", "--project-id", st.P]
        for k in keys:
            args += ["--node-id", st.nid(k)]
        for k in keys:
            args += ["--submit-id", st.node(k)["submitId"]]
        if token:
            args += ["--credit-token", token]
        d = cli(args)
        if not d.get("ok"):
            sys.exit(f"run failed {json.dumps(d.get('error'), ensure_ascii=False)[:500]}")
        for it in d["data"]["items"]:
            k = next(k for k in keys if st.nid(k) == it["nodeId"])
            st.node(k)["submitted"] = True
            st.node(k)["resourceId"] = (it.get("resources") or [{}])[0].get("resourceId")
            st.d["ledger"]["runs"].append({"key": k, "credits": items[it["nodeId"]]["maxCredits"], "submitId": it["submitId"], "at": time.strftime("%Y-%m-%d %H:%M")})
        st.save()
        print(f"  submitted {len(keys)} · spent now {st.spent()} of {st.d['ledger']['budget']}")
    elif cmd == "wait":
        out = argv.pop(0)
        os.makedirs(out, exist_ok=True)
        for k in argv:
            e = st.node(k)
            d = cli(["operation", "wait", e["submitId"], "--project-id", st.P, "--timeout", "20m"])
            data = d.get("data", {})
            state = data.get("state")
            rid = next((r["resourceId"] for r in data.get("resources", []) if r.get("state", "succeeded") in ("succeeded", "success")), None)
            print(k, state, flush=True)
            if state == "succeeded" and rid:
                kind = "mp4" if "video" in e.get("title", "").lower() or k.startswith("V") else ("wav" if k.startswith("M") else "png")
                o = cli(["resource", "download", rid, "--project-id", st.P, "-o", f"{out}/{k}.{kind}"])
                print(k, "downloaded" if o.get("ok") else f"download failed {o.get('error')}", flush=True)
                kind = sniff(f"{out}/{k}.{kind}", kind)  # the key-prefix guess is wrong for e.g. image keys starting with M
                fresh = State(path)  # other jm.py processes may have written meanwhile: merge, don't clobber
                fresh.node(k)["result"] = f"{out}/{k}.{kind}"; fresh.save()
            else:
                print(k, json.dumps(d, ensure_ascii=False)[:500], flush=True)
    elif cmd == "ledger":
        for r in st.d["ledger"]["runs"]:
            print(f"  {r['at']}  {r['key']:8s} {r['credits']}")
        print(f"  spent {st.spent()} of {st.d['ledger']['budget']}")


if __name__ == "__main__":
    main()
