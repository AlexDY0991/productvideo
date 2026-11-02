# 按关键词筛选节点。用法: python3 tapnodes.py canvas.json "✅|SC_" image,video
import json,sys,re
raw=json.load(open(sys.argv[1]))
d=raw.get('data',raw)
pat=re.compile(sys.argv[2]) if len(sys.argv)>2 else None
types=sys.argv[3].split(',') if len(sys.argv)>3 else None
for n in sorted(d['nodes'],key=lambda n:(n['position']['x'],n['position']['y'])):
    dd=n['data']; p=dd.get('params') or {}
    if types and n['type'] not in types: continue
    pr=(dd.get('prompt') or p.get('prompt') or '')
    s=f"{n['short_id']} {n['type']}/{dd.get('type')} {p.get('model','')} [{dd.get('title','')}] {pr[:60]!r}"
    if pat and not pat.search(s): continue
    print(s.replace('\n',' '))
