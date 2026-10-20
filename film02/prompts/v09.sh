#!/usr/bin/env bash
# v09 "First Light": generate parts 2-4 in order; each part's first frame is the previous part's last frame.
# Part 1 is the v08 sample (film02/clips/v08-draft/V8P1.mp4, last frame uploaded as @p1_end).
# Usage: film02/prompts/v09.sh [RES] [MODEL]   (default 480p sample mode; this RUNS generations: quote first)
set -euo pipefail
cd "$(dirname "$0")/../.."
RES="${1:-480p}"
MODEL="${2:-seedance_2.5_draft}"  # 即梦「样片模式」；满意后在画布上直出高分辨率
S=film02/jimeng-state.json
OUT=film02/clips/v09-draft
mkdir -p "$OUT"

# Print the Nth fenced prompt of SCRIPT-v09.md with @handles replaced by {{node:ID}}.
prompt() {
  python3 - "$1" <<'PY'
import json, re, sys
blocks = re.findall(r"```\n(.*?)```", open("film02/SCRIPT-v09.md").read(), re.S)
nodes = json.load(open("film02/jimeng-state.json"))["nodes"]
print(re.sub(r"@(\w+)", lambda m: "{{node:%s}}" % nodes[m.group(1)]["nodeId"], blocks[int(sys.argv[1])]).strip())
PY
}

# Save the exact last frame of a clip and upload it as an image node.
last_frame() {
  local clip="$1" key="$2" n
  n=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of csv=p=0 "$clip")
  ffmpeg -v error -y -i "$clip" -vf "select=eq(n\,$((n-1)))" -vsync 0 -frames:v 1 -q:v 2 "film02/assets/$key.jpg"
  python3 tools/jm.py $S upload "$key" "film02/assets/$key.jpg"
}

step() {  # key title idx dur refs...
  local key="$1" title="$2" idx="$3" dur="$4"; shift 4
  local refs=(); for r in "$@"; do refs+=(--ref "$r"); done
  local text; text="$(prompt "$idx")"
  for try in 1 2 3; do  # the service sometimes rejects a valid save once (service.2); retry
    python3 tools/jm.py $S vid "$key" --title "$title $RES" --prompt "$text" --mode m2v \
      "${refs[@]}" --dur "$dur" --res "$RES" --model "$MODEL" && break
    [ "$try" = 3 ] && exit 1; sleep 5
  done
  python3 tools/jm.py $S run "$key"
  python3 tools/jm.py $S wait "$OUT" "$key"
}

step V9P2 "v09 P2 Coast" 1 11 p1_end char_pilot4 prop_dream2 loc_coast_us
last_frame "$OUT/V9P2.mp4" p2_end
step V9P3 "v09 P3 Home" 2 10 p2_end char_pilot4 char_pilot3 char_family prop_dream2 loc_breakfast
last_frame "$OUT/V9P3.mp4" p3_end
step V9P4 "v09 P4 Finale" 3 10 p3_end char_pilot3 char_pilot4 char_family prop_dream2 loc_breakfast
