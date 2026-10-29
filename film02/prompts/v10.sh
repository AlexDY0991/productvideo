#!/usr/bin/env bash
# v10.1: create the three new shots (sample mode) and three score candidates on the v10 canvas.
set -euo pipefail
cd "$(dirname "$0")/../.."
S=film02/jimeng-state-v10.json
RES="${1:-480p}"; MODEL="${2:-seedance_2.5_draft}"  # 样片模式，满意后在画布直出 1080p
block() {
  python3 - "$1" <<'PY'
import json, re, sys
blocks = re.findall(r"```\n(.*?)```", open("film02/SCRIPT-v10.1.md").read(), re.S)
nodes = json.load(open("film02/jimeng-state-v10.json"))["nodes"]
print(re.sub(r"@(\w+)", lambda m: "{{node:%s}}" % nodes[m.group(1)]["nodeId"], blocks[int(sys.argv[1])]).strip())
PY
}
python3 tools/jm.py $S vid V10N2 --title "v10 N2 Saddle to sky $RES" --prompt "$(block 0)" --mode m2v \
  --ref ref_horses --ref ref_pasture --ref ref_dream_side --ref ref_dream_fly --dur 8 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V10N4 --title "v10 N4 Landing far $RES" --prompt "$(block 1)" --mode m2v \
  --ref ref_picnic --ref ref_wife --ref ref_girl --ref ref_dog --ref ref_dream_rear --dur 6 --res "$RES" --model "$MODEL"
python3 tools/jm.py $S vid V10N5 --title "v10 N5 Dog runs in $RES" --prompt "$(block 2)" --mode m2v \
  --ref ref_dog --ref ref_girl --ref ref_dream_side --ref ref_pasture --dur 5 --res "$RES" --model "$MODEL"
for k in a b c; do
  python3 tools/jm.py $S music M10$k --title "v10 score $k" --prompt "$(block 3)" --dur 80
done
