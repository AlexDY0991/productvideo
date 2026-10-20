#!/usr/bin/env bash
# v07 "First Light" (US, three 14 s parts): create (or update) the three part nodes from SCRIPT-v07.md.
# Usage: film02/prompts/v07.sh [RES] [MODEL]   (default 480p sample mode; nodes are created, not run)
set -euo pipefail
cd "$(dirname "$0")/../.."
RES="${1:-480p}"
MODEL="${2:-seedance_2.5_draft}"  # 即梦「样片模式」；满意后在画布上直出高分辨率
S=film02/jimeng-state.json

# Print the Nth fenced prompt of SCRIPT-v07.md with @handles replaced by {{node:ID}}.
prompt() {
  python3 - "$1" <<'PY'
import json, re, sys
blocks = re.findall(r"```\n(.*?)```", open("film02/SCRIPT-v07.md").read(), re.S)
nodes = json.load(open("film02/jimeng-state.json"))["nodes"]
print(re.sub(r"@(\w+)", lambda m: "{{node:%s}}" % nodes[m.group(1)]["nodeId"], blocks[int(sys.argv[1])]).strip())
PY
}

python3 tools/jm.py $S vid V7P1 --title "v07 P1 Takeoff $RES" --prompt "$(prompt 0)" --mode m2v \
  --ref char_pilot4 --ref prop_dream --ref loc_garage --dur 14 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V7P2 --title "v07 P2 Coast $RES" --prompt "$(prompt 1)" --mode m2v \
  --ref char_pilot4 --ref prop_dream --ref loc_coast_us --dur 14 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V7P3 --title "v07 P3 Home $RES" --prompt "$(prompt 2)" --mode m2v \
  --ref char_pilot4 --ref char_pilot3 --ref char_family --ref prop_dream --ref loc_breakfast --dur 14 --res "$RES" --model "$MODEL"
