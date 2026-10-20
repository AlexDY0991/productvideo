#!/usr/bin/env bash
# v05 "First Light · 30": create (or update) the three scene nodes from SCRIPT-v05.md.
# Usage: film02/prompts/v05.sh [RES] [MODEL]   (default 480p sample mode; nodes are created, not run)
set -euo pipefail
cd "$(dirname "$0")/../.."
RES="${1:-480p}"
MODEL="${2:-seedance_2.5_draft}"  # 即梦「样片模式」；满意后在画布上直出高分辨率
S=film02/jimeng-state.json

# Print the Nth fenced prompt of SCRIPT-v05.md with @handles replaced by {{node:ID}}.
prompt() {
  python3 - "$1" <<'EOF'
import json, re, sys
blocks = re.findall(r"```\n(.*?)```", open("film02/SCRIPT-v05.md").read(), re.S)
nodes = json.load(open("film02/jimeng-state.json"))["nodes"]
print(re.sub(r"@(\w+)", lambda m: "{{node:%s}}" % nodes[m.group(1)]["nodeId"], blocks[int(sys.argv[1])]).strip())
EOF
}

python3 tools/jm.py $S vid V5S1 --title "v05 S1 Ignition $RES" --prompt "$(prompt 0)" --mode m2v \
  --ref char_pilot3 --ref prop_dream --ref loc_hangar --dur 12 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V5S2 --title "v05 S2 Coast $RES" --prompt "$(prompt 1)" --mode m2v \
  --ref char_pilot3 --ref prop_dream --ref loc_coast --dur 10 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V5S3 --title "v05 S3 Arrival $RES" --prompt "$(prompt 2)" --mode m2v \
  --ref char_pilot3 --ref prop_dream --ref loc_pad --dur 6 --res "$RES" --model "$MODEL"
