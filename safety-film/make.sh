#!/usr/bin/env bash
# 一键出片：配音 → 时间轴 → 逐帧渲染 → 合成
#   ./make.sh            用火山引擎配音（需要 VOLC_API_KEY，或 VOLC_APP_ID + VOLC_ACCESS_KEY）
#   ./make.sh --preview  没有火山凭证时，用临时男声预览配音
#   ./make.sh --keep     不重新合成配音，直接用 audio/lines 里已有的音频
set -euo pipefail
cd "$(dirname "$0")"

[ -f fonts/NotoSansSC-400.ttf ] || ./fonts/fetch.sh

case "${1:-}" in
  --preview) python3 tts/preview.py ;;
  --keep) ;;
  *) node tts/volc.mjs ;;
esac

node tts/timeline.mjs
node render/render.mjs --workers "${WORKERS:-2}"
ffmpeg -v error -y -i out/video-silent.mp4 -i audio/voice.wav -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "out/酷飞-DreamPro-安全-中文.mp4"
rm -f out/video-silent.mp4
echo "→ out/酷飞-DreamPro-安全-中文.mp4"
