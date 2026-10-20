# Build the prompt-review page (rhythm curve + full prompts) from film02/SCRIPT-v09.md.
import re, html, json
src = open('/home/user/productvideo/film02/SCRIPT-v09.md').read()
blocks = re.findall(r"```\n(.*?)```", src, re.S)
parts = [
  ("P1", "TAKEOFF", "起飞", 0, 11, "机库推门 → 室外检查、戴头盔（慢） → 三个快切 → 起飞俯冲（爆发）"),
  ("P2", "THE COAST", "海岸", 11, 11, "从第 1 段最后一帧接着俯冲 → 贴海追飞、擦身而过、甩镜、穿桥（快） → 镜头沿手臂移到张开的手（慢动作） → 脚下海浪 → 跟着下降"),
  ("P3", "HOME", "回家", 22, 10, "接着第 2 段的下降运镜落到草地 → 远处降落 → 女儿跑来 → 戴头盔 → 父亲的笑 → 跟着女儿的视线摇向天空"),
  ("P4", "FINALE", "收尾", 32, 10, "从同一片天空摇下来，落到咖啡杯 → 一家人 → 环绕 Dream → 三个细节快拍（无 05） → 定版静止约 5 秒"),
]
tempo = [(0,6,"slow"),(6,11,"fast"),(11,17,"fast"),(17,19.6,"slowmo"),(19.6,22,"fast"),(22,32,"slow"),(32,35.6,"slow"),(35.6,37.1,"fast"),(37.1,42,"still"),(42,45,"card")]
label = {"slow":"慢","fast":"快","slowmo":"慢动作","still":"定版静止","card":"logo 卡"}
cuts=[]
for (k,_,_,off,d,_),b in zip(parts,blocks):
    for a,c in re.findall(r"^(\d+\.\d)–(\d+\.\d)s — ",b,re.M):
        cuts.append(off+float(c))
total=45.0
W=1000
def x(t): return t/total*W
segs="".join(f'<rect x="{x(a):.1f}" y="{ {"slow":34,"slowmo":46,"still":54,"fast":14,"card":24}[k] }" width="{x(b)-x(a):.1f}" height="{ {"slow":26,"slowmo":14,"still":6,"fast":46,"card":36}[k] }" class="t-{k}"><title>{a}–{b}s {label[k]}</title></rect>' for a,b,k in tempo)
cutl="".join(f'<line x1="{x(c):.1f}" x2="{x(c):.1f}" y1="64" y2="72" class="cut"/>' for c in cuts if c<42)
partl="".join(f'<line x1="{x(off):.1f}" x2="{x(off):.1f}" y1="4" y2="76" class="pb"/><text x="{x(off)+4:.1f}" y="92" class="pl">{k} · {name}</text>' for k,name,_,off,_,_ in parts)+f'<line x1="{x(42):.1f}" x2="{x(42):.1f}" y1="4" y2="76" class="pb"/><text x="{x(42)+4:.1f}" y="92" class="pl">LOGO</text>'
ticks="".join(f'<text x="{x(t):.1f}" y="108" class="tk" text-anchor="middle">{t}s</text>' for t in [0,6,11,17,22,32,37,42,45])
svg=f'<svg viewBox="-10 0 1030 116" role="img" aria-label="全片节奏曲线：柱子越高越快">{segs}{cutl}{partl}{ticks}</svg>'
sections=""
for (k,name,cn,off,d,summary),b in zip(parts,blocks):
    shots=re.findall(r"^(\d+\.\d)–(\d+\.\d)s — (.*)$",b,re.M)
    rows="".join(f'<tr><td class="tc">{a}–{c}</td><td class="tc">{off+float(a):.1f}–{off+float(c):.1f}</td><td>{html.escape(t[:150])}{"…" if len(t)>150 else ""}</td></tr>' for a,c,t in shots)
    sections+=f'''<section class="part" id="{k.lower()}">
<header class="ph"><div><p class="eyebrow">{k} · {d} 秒 · 全片 {off}–{off+d} s</p><h2>{cn} <span class="en">{name}</span></h2><p class="sum">{summary}</p></div>
<button class="copy" data-copy="pr-{k}" type="button">复制英文提示词</button></header>
<details><summary>镜头表（{len(shots)} 个镜头）</summary><div class="tw"><table><thead><tr><th>段内</th><th>全片</th><th>镜头（英文提示词原文开头）</th></tr></thead><tbody>{rows}</tbody></table></div></details>
<pre id="pr-{k}" class="prompt">{html.escape(b.strip())}</pre>
<p class="meta">{len(b.strip())} 字符 · seedance_2.5_draft（样片模式） · 16:9 · 480p · {d} s</p>
</section>'''
page=f'''<title>First Light v09</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@500;700&family=Noto+Sans+SC:wght@400;600&family=JetBrains+Mono:wght@400&display=swap">
<style>
/* layout: one reading column; the rhythm curve is the hero, then four parts each with shot table + full prompt */
:root{{--bg:#f6f4f1;--surface:#ffffff;--fg:#1d1a17;--muted:#6d655d;--line:#e2ddd6;--accent:#e85200;--slow:#9fb4c4;--slowmo:#5d7d95;--fast:#e85200;--card:#ff5a00;
--display:"Saira Condensed","Arial Narrow",sans-serif;--body:"Noto Sans SC","PingFang SC","Microsoft YaHei",system-ui,sans-serif;--mono:"JetBrains Mono",ui-monospace,Menlo,monospace}}
@media (prefers-color-scheme:dark){{:root:not([data-theme="light"]){{--bg:#151311;--surface:#1f1c19;--fg:#ece7e1;--muted:#a39a90;--line:#35302b;--accent:#ff7a33;--slow:#5f7a8e;--slowmo:#8fb0c8;--fast:#ff7a33;--card:#ff5a00;color-scheme:dark}}}}
:root[data-theme="dark"]{{--bg:#151311;--surface:#1f1c19;--fg:#ece7e1;--muted:#a39a90;--line:#35302b;--accent:#ff7a33;--slow:#5f7a8e;--slowmo:#8fb0c8;--fast:#ff7a33;--card:#ff5a00;color-scheme:dark}}
body{{background:var(--bg);color:var(--fg);font-family:var(--body);line-height:1.6;padding-left:max(16px,env(safe-area-inset-left,0px));padding-right:max(16px,env(safe-area-inset-right,0px));padding-block:28px 64px}}
.wrap{{max-width:980px;margin:0 auto;display:grid;gap:28px}}
h1,h2{{font-family:var(--display);text-wrap:balance;margin:0;letter-spacing:.01em}}
h1{{font-size:clamp(2.2rem,6vw,3.4rem);line-height:1}}
h2{{font-size:1.9rem;line-height:1.1}}
.en{{color:var(--muted);font-weight:500}}
.eyebrow{{margin:0 0 4px;font-size:.78rem;letter-spacing:.08em;color:var(--accent);text-transform:uppercase;font-variant-numeric:tabular-nums}}
.lede{{margin:8px 0 0;color:var(--muted);max-width:62ch}}
.rhythm{{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:18px 18px 10px}}
.rhythm h3{{margin:0 0 6px;font-size:1rem}}
.rhythm .tw{{overflow-x:auto}}
svg{{width:100%;min-width:620px;height:auto;display:block}}
.t-slow{{fill:var(--slow)}}.t-still{{fill:var(--fg)}}.t-slowmo{{fill:var(--slowmo)}}.t-fast{{fill:var(--fast)}}.t-card{{fill:var(--card)}}
.cut{{stroke:var(--fg);stroke-width:1.2}}.pb{{stroke:var(--muted);stroke-dasharray:2 3}}
.pl{{fill:var(--fg);font:600 13px var(--display);letter-spacing:.04em}}.tk{{fill:var(--muted);font:11px var(--mono)}}
.legend{{display:flex;flex-wrap:wrap;gap:14px;margin:8px 0 0;padding:0;list-style:none;font-size:.85rem;color:var(--muted)}}
.legend i{{display:inline-block;width:12px;height:12px;border-radius:2px;margin-right:6px;vertical-align:-1px}}
.part{{display:grid;gap:12px;padding-top:20px;border-top:1px solid var(--line)}}
.ph{{display:flex;flex-wrap:wrap;justify-content:space-between;align-items:flex-end;gap:12px}}
.ph>div{{min-width:0}}
.sum{{margin:4px 0 0;color:var(--muted)}}
.copy{{font:600 .9rem var(--body);background:var(--accent);color:#fff;border:0;border-radius:4px;padding:9px 14px;cursor:pointer}}
.copy:focus-visible,summary:focus-visible{{outline:2px solid var(--fg);outline-offset:2px}}
details{{background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:10px 14px}}
summary{{cursor:pointer;font-weight:600}}
.tw{{overflow-x:auto}}
table{{border-collapse:collapse;width:100%;margin-top:8px;font-size:.88rem}}
th,td{{text-align:left;vertical-align:top;padding:6px 8px;border-bottom:1px solid var(--line)}}
th{{color:var(--muted);font-weight:600;font-size:.78rem;letter-spacing:.04em}}
.tc{{font-family:var(--mono);white-space:nowrap;font-variant-numeric:tabular-nums}}
.prompt{{margin:0;background:var(--surface);border:1px solid var(--line);border-radius:6px;padding:14px;font:12.5px/1.55 var(--mono);white-space:pre-wrap;word-break:break-word;max-height:420px;overflow:auto}}
.meta{{margin:0;font-size:.8rem;color:var(--muted);font-family:var(--mono)}}
@media (prefers-reduced-motion:reduce){{*{{scroll-behavior:auto}}}}
</style>
<main class="wrap">
<header><p class="eyebrow">CoolFly Dream · 第 2 号片 · v09 待确认</p><h1>First Light v09</h1>
<p class="lede">四段生成（11 + 11 + 10 + 10 秒），加 3 秒整屏橙色 logo 卡，全片 45 秒。每段的第一帧就是上一段的最后一帧，按顺序生成，段与段之间用同一个运镜接上；第 1 段沿用 v08 样片。全片不出现 05。下面是全片的节奏曲线和四段完整的英文提示词，提交给即梦的就是这些原文；提交前 @名字会换成画布节点。</p></header>
<section class="rhythm" aria-labelledby="rh"><h3 id="rh">全片节奏：柱子越高越快，短竖线是切点</h3><div class="tw">{svg}</div>
<ul class="legend"><li><i style="background:var(--slow)"></i>慢</li><li><i style="background:var(--fast)"></i>快</li><li><i style="background:var(--slowmo)"></i>慢动作（升格）</li><li><i style="background:var(--fg)"></i>定版静止</li><li><i style="background:var(--card)"></i>logo 卡</li></ul></section>
{sections}
</main>
<script>
document.querySelectorAll('.copy').forEach(function(b){{b.addEventListener('click',function(){{var el=document.getElementById(b.dataset.copy);var t=el.textContent;var done=function(){{b.textContent='已复制';setTimeout(function(){{b.textContent='复制英文提示词'}},1600)}};
var fallback=function(){{var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);b.textContent='已选中，请手动复制'}};
try{{navigator.clipboard.writeText(t).then(done,fallback)}}catch(e){{fallback()}}}})}});
</script>'''
open('/tmp/claude-0/-home-user-productvideo/35f88542-6807-5370-9772-9248e254fcf9/scratchpad/page/first-light-v09.html','w').write(page)
print(len(page), len(cuts))
