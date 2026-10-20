#!/usr/bin/env bash
# v06 "First Light" (US, four acts): create (or update) the four act nodes from SCRIPT-v06.md §7.
# Usage: film02/prompts/v06.sh [RES] [MODEL]   (default 480p sample mode; nodes are created, not run)
set -euo pipefail
cd "$(dirname "$0")/../.."
RES="${1:-480p}"
MODEL="${2:-seedance_2.5_draft}"  # 即梦「样片模式」；满意后在画布上直出高分辨率
S=film02/jimeng-state.json

# Print the Nth fenced prompt of SCRIPT-v06.md with @handles replaced by {{node:ID}}.
prompt() {
  python3 - "$1" <<'PY'
import json, re, sys
blocks = re.findall(r"```\n(.*?)```", open("film02/SCRIPT-v06.md").read(), re.S)
nodes = json.load(open("film02/jimeng-state.json"))["nodes"]
print(re.sub(r"@(\w+)", lambda m: "{{node:%s}}" % nodes[m.group(1)]["nodeId"], blocks[int(sys.argv[1])]).strip())
PY
}

python3 tools/jm.py $S vid V6A1 --title "v06 A1 Garage $RES" --prompt "$(prompt 0)" --mode m2v \
  --ref char_pilot4 --ref prop_dream --ref loc_garage --dur 11 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V6A2 --title "v06 A2 Coast $RES" --prompt "$(prompt 1)" --mode m2v \
  --ref char_pilot4 --ref prop_dream --ref loc_coast_us --dur 10 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V6A3 --title "v06 A3 Above $RES" --prompt "$(prompt 2)" --mode m2v \
  --ref char_pilot4 --ref prop_dream --ref loc_clouds --dur 12 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V6A4 --title "v06 A4 Home $RES" --prompt "$(prompt 3)" --mode m2v \
  --ref char_pilot4 --ref char_pilot3 --ref char_family --ref prop_dream --ref loc_breakfast --dur 9 --res "$RES" --model "$MODEL"
