#!/usr/bin/env bash
# One-time setup for a fresh cloud container: Python tool venv for analysis, TTS and downloads.
# Usage: bash tools/setup.sh   (idempotent; installs into $COOLFLY_TOOLS, default /tmp/coolfly-tools)
# The Jimeng CLI is NOT installed here: its installer is a remote script that must be read first
# (HANDOFF.md, "即梦画布 CLI"), and its login needs the user's browser.
set -euo pipefail
T=${COOLFLY_TOOLS:-/tmp/coolfly-tools}
mkdir -p "$T"
cd "$T"   # run pip from here so no repo or scratch file shadows a stdlib module
[ -x "$T/venv/bin/python" ] || python3 -m venv "$T/venv"
"$T/venv/bin/pip" -q install -U pip
"$T/venv/bin/pip" -q install "yt-dlp[default]" scenedetect opencv-python-headless kokoro-onnx soundfile faster-whisper
M="$T/kokoro-model"; mkdir -p "$M"
for f in kokoro-v1.0.onnx voices-v1.0.bin; do
  [ -s "$M/$f" ] || curl -fsSL -o "$M/$f" "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/$f"
done
# headless Chromium for code-rendered audio/frames (higgsfield-motion render_audio.mjs): root needs --no-sandbox
CH=$(ls -d /opt/pw-browsers/chromium-*/chrome-linux*/chrome 2>/dev/null | head -1 || true)
[ -n "$CH" ] && printf '#!/bin/sh\nexec %s --no-sandbox "$@"\n' "$CH" > "$T/chrome" && chmod +x "$T/chrome"
echo "tool venv ready: $T/venv/bin/python  (export COOLFLY_TOOLS=$T)"
