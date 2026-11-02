# 把 canvas.json 导出成可读文本：画布名、节点统计、模型统计、去重后的全部提示词（含输入参考关系）。
# 用法: python3 tapdump.py canvas.json dump.txt
import json,collections,sys
src,out=sys.argv[1],sys.argv[2]
raw=json.load(open(src))
d=raw.get('data',raw)
print('NAME',d['canvas']['name'])
nodes={n['id']:n for n in d['nodes']}
print('nodes',len(nodes),'conns',len(d['connections']))
print(collections.Counter((n['type'],n['data'].get('type')) for n in nodes.values()))
c=collections.Counter()
for n in nodes.values():
    p=n['data'].get('params') or {}
    if p.get('model'): c[(n['type'],p['model'])]+=1
print(c.most_common())
inc=collections.defaultdict(list)
for cc in d['connections']:
    if cc['source'] in nodes and cc['target'] in nodes: inc[cc['target']].append(cc['source'])
def lbl(n): return f"{n['short_id']}:{n['data'].get('title','')}"
order=sorted(nodes.values(), key=lambda n:(n['position']['x'],n['position']['y']))
groups=collections.OrderedDict()
for n in order:
    dd=n['data']; p=dd.get('params') or {}
    pr=(dd.get('prompt') or p.get('prompt') or (dd.get('magicEditDraft') or {}).get('instruction') or '').strip()
    if not pr: continue
    groups.setdefault(pr,[]).append(n)
L=['### TEXT NODES']
for n in order:
    if n['type']=='text': L.append(f"{n['short_id']} ({n['position']['x']:.0f},{n['position']['y']:.0f}) {n['data'].get('text','')!r}")
L.append('\n### UPLOADS')
for n in order:
    if n['data'].get('type') in ('upload','edit'): L.append(f"{n['short_id']} {n['type']} ({n['position']['x']:.0f},{n['position']['y']:.0f}) {n['data'].get('title')}")
for i,(pr,ns) in enumerate(groups.items()):
    n=ns[0]; p=n['data'].get('params') or {}
    prm={k:p.get(k) for k in ['model','mode','modelType','aspectRatio','imageSize','duration','resolution'] if k in p}
    L.append(f"\n===== P{i} type={n['type']} used_by={[lbl(x) for x in ns]} pos=({n['position']['x']:.0f},{n['position']['y']:.0f}) {prm}")
    ins=set()
    for x in ns: ins.update(lbl(nodes[s]) for s in inc[x['id']])
    if ins: L.append('inputs: '+' | '.join(sorted(ins)))
    L.append(pr)
open(out,'w').write('\n'.join(L))
print('unique prompts',len(groups))
