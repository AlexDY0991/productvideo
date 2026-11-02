# 列出指定节点的媒体下载链接。用法: python3 tapmedia.py canvas.json n18,n34,n218:video
# 输出每行: 短ID 类型 链接 标题。files.tapnow.top 会自动换成 files.tapnow.media
import json,sys
src=sys.argv[1]; ids=sys.argv[2].split(',')
raw=json.load(open(src))
d=raw.get('data',raw)
for s in ids:
    sid,_,typ=s.partition(':')
    cands=[n for n in d['nodes'] if n['short_id']==sid and (not typ or n['type']==typ)]
    if not cands: print(s,'MISSING',file=sys.stderr); continue
    n=cands[-1]; dd=n['data']
    url=dd.get('src') or (dd.get('options') or [None])[-1] or (dd.get('__metadata') or {}).get('url')
    if not url: print(s,'NOURL',file=sys.stderr); continue
    url=url.replace('files.tapnow.top','files.tapnow.media')
    print(sid, n['type'], url, (dd.get('title') or '').replace(' ','_'))
