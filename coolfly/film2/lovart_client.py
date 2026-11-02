#!/usr/bin/env python3
"""Minimal Lovart MCP client. usage: lv.py <tool> '<json-args>'  (prints result JSON)"""
import json, os, sys, urllib.request

URL = "https://lgw.lovart.ai/v1/openapi/mcp/widgets"
AUTH = "Bearer %s:%s" % (os.environ["LOVART_ACCESS_KEY"], os.environ["LOVART_SECRET_KEY"])


def rpc(method, params):
    body = json.dumps({"jsonrpc": "2.0", "id": 1, "method": method, "params": params}).encode()
    req = urllib.request.Request(URL, data=body, headers={
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Authorization": AUTH,
        "User-Agent": "claude-code-lovart/1.0",
    })
    with urllib.request.urlopen(req, timeout=300) as r:
        txt = r.read().decode()
    if txt.lstrip().startswith("data:") or "\ndata:" in txt:
        txt = [l[5:] for l in txt.splitlines() if l.startswith("data:")][-1]
    return json.loads(txt)


def call(name, args):
    d = rpc("tools/call", {"name": name, "arguments": args})
    if "error" in d:
        return {"rpc_error": d["error"]}
    res = d["result"]
    out = {"isError": res.get("isError", False), "text": [], "images": []}
    for c in res.get("content", []):
        if c.get("type") == "text":
            try:
                out["text"].append(json.loads(c["text"]))
            except Exception:
                out["text"].append(c["text"])
        elif c.get("type") == "image":
            out["images"].append(c)
    if "structuredContent" in res:
        out["structured"] = res["structuredContent"]
    return out


if __name__ == "__main__":
    name = sys.argv[1]
    args = json.loads(sys.argv[2]) if len(sys.argv) > 2 else {}
    out = call(name, args)
    imgdir = os.environ.get("LV_IMGDIR")
    if imgdir and out["images"]:
        import base64
        os.makedirs(imgdir, exist_ok=True)
        for i, im in enumerate(out["images"]):
            ext = (im.get("mimeType", "image/png").split("/")[-1])
            p = os.path.join(imgdir, "%s_%d.%s" % (os.environ.get("LV_PREFIX", "img"), i, ext))
            open(p, "wb").write(base64.b64decode(im["data"]))
            print("saved", p, file=sys.stderr)
    out["images"] = len(out["images"])
    print(json.dumps(out, ensure_ascii=False, indent=1))
