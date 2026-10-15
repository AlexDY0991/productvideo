"""临时预览配音（非火山引擎）：在拿到火山引擎凭证之前，用于对齐画面节奏。

用法：python3 tts/preview.py [voice]   默认 zh-CN-YunyangNeural（男声）
输出与 volc.mjs 相同：audio/lines/<scene>-<n>.mp3
"""
import asyncio
import json
import os
import pathlib
import ssl
import sys

import edge_tts
import edge_tts.communicate

# 走代理时用环境提供的 CA（例如 SSL_CERT_FILE），否则 edge-tts 默认只信任 certifi。
if os.environ.get("SSL_CERT_FILE"):
    edge_tts.communicate._SSL_CTX = ssl.create_default_context(cafile=os.environ["SSL_CERT_FILE"])

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "audio" / "lines"
VOICE = sys.argv[1] if len(sys.argv) > 1 else "zh-CN-YunyangNeural"


async def main():
    script = json.loads((ROOT / "script.json").read_text("utf8"))
    OUT.mkdir(parents=True, exist_ok=True)
    for scene in script["scenes"]:
        for index, text in enumerate(scene["lines"]):
            target = OUT / f"{scene['id']}-{index}.mp3"
            await edge_tts.Communicate(text, VOICE, rate="+0%").save(str(target))
            print(target.name, text)


asyncio.run(main())
