import subprocess,os,shutil
from PIL import Image,ImageDraw,ImageFont,ImageFilter
SC='/tmp/claude-0/-home-user-productvideo/431a0c19-0762-5b23-941d-3651f6859d1b/scratchpad/'
SM=SC+'canvas_job/samples/'; CG=SC+'render/outx/CG_S18_dual_battery_xray.mp4'; FD=SC+'fonts/'
LOGO_W='/home/user/productvideo/coolfly/refs/LOGO_CoolFly_白色.png'; LOGO_B='/home/user/productvideo/coolfly/refs/LOGO_CoolFly_黑色.png'
W,H,FPS=1280,720,24; ACC=(255,138,40); WH=(255,255,255)
def F(size,wt='SemiBold'):
    f=ImageFont.truetype(FD+'Montserrat.ttf',size)
    try: f.set_variation_by_name(wt)
    except Exception: pass
    return f
def text_seq(name,lines,dur,anchor,xy,stagger=0.035,fade=0.25,out=0.3):
    """Midea-style: lines [(text,color)], characters fade+rise in one by one; anchor left/center/right at xy=(x,y)."""
    d=f'txt/{name}'; shutil.rmtree(d,ignore_errors=True); os.makedirs(d)
    f=F(40); n=int(round(dur*FPS)); tmp=ImageDraw.Draw(Image.new('RGBA',(1,1)))
    # layout chars
    chars=[]; y=xy[1]; k=0
    for t,c in lines:
        w=tmp.textlength(t,font=f); x0={'left':xy[0],'center':xy[0]-w/2,'right':xy[0]-w}[anchor]; x=x0
        for ch in t:
            chars.append((ch,x,y,c,k)); x+=tmp.textlength(ch,font=f); k+=1
        y+=52
    for i in range(n):
        t=i/FPS; im=Image.new('RGBA',(W,H),(0,0,0,0)); sh=Image.new('RGBA',(W,H),(0,0,0,0))
        dr=ImageDraw.Draw(im); ds=ImageDraw.Draw(sh)
        gout=1.0 if t<dur-out else max(0,(dur-t)/out)
        for ch,x,y,c,k in chars:
            a=min(1,max(0,(t-0.15-k*stagger)/fade))*gout
            if a<=0: continue
            dy=(1-a)*8
            ds.text((x+1,y+dy+2),ch,font=f,fill=(0,0,0,int(110*a)))
            dr.text((x,y+dy),ch,font=f,fill=c+(int(255*a),))
        sh=sh.filter(ImageFilter.GaussianBlur(3)); Image.alpha_composite(sh,im).save(f'{d}/{i:04d}.png')
    return d
def centered_title(name,text,dur): return text_seq(name,[(text,WH)],dur,'center',(W/2,70))
GRADE="curves=all='0/0.035 0.25/0.26 0.5/0.515 0.75/0.76 1/0.975',colorbalance=rs=0.02:bs=-0.025:rm=0.01:bm=-0.015,eq=saturation=0.96"
os.makedirs('txt',exist_ok=True); os.makedirs('seg',exist_ok=True)
# logo opener overlay (fade in/out) on V01
lg=Image.open(LOGO_W).convert('RGBA'); lg.thumbnail((300,110))
segs=[ # src, ss, dur, text-spec
 ('V01.mp4',2.5,3.0,'LOGO'),
 ('V06.mp4',1.0,2.6,('q',[('What does it take',WH),('to fly yourself?',ACC)],'right',(1230,250))),
 ('W02a_buckle.mp4',1.0,1.2,None),
 ('W02d_visor.mp4',1.2,1.4,None),
 ('V07_b2.mp4',1.0,3.0,None),
 ('V08.mp4',1.0,3.0,('spd',[('100 km/h',WH),('Top Speed',ACC)],'left',(70,190))),
 ('V09_b2.mp4',2.0,2.5,None),
 ('V10.mp4',0.5,3.5,None),
 ('V11_b2.mp4',1.5,3.5,('end',[('40 Minutes',WH),('of Flight*',ACC)],'left',(70,150))),
 ('W04_reflect.mp4',1.0,1.5,None),
 ('V12.mp4',1.0,2.5,None),
 ('V13_b2.mp4',0.0,5.0,('na80',[('NA80 Dual-Redundant Flight Control',WH)],'center',(W/2,64))),
 ('V13_b2.mp4',5.0,4.5,('ms',[('Millisecond Switchover',WH)],'center',(W/2,64))),
 ('V16_b2.mp4',1.0,2.8,('rad',[('mmWave',WH),('Obstacle Avoidance',ACC)],'left',(70,560))),
 ('V17.mp4',1.5,2.8,('chute',[('Whole-Aircraft',WH),('Parachute',ACC)],'left',(70,560))),
 ('CG',0.0,2.8,('bat',[('Dual Batteries',WH)],'center',(W/2,64))),
 ('V19_b2.mp4',0.5,5.5,None),
 ('V20_b3.mp4',0.5,4.5,None),
 ('END',0,4.4,None),
]
# end card (Midea-style white)
im=Image.new('RGB',(W,H),(255,255,255)); lb=Image.open(LOGO_B).convert('RGBA'); lb.thumbnail((420,150)); im.paste(lb,((W-lb.width)//2,H//2-lb.height+10),lb); d=ImageDraw.Draw(im)
d.line(((W-420)//2,H//2+40,(W+420)//2,H//2+40),fill=(200,200,200),width=1); d.rectangle(((W+420)//2-70,H//2+37,(W+420)//2-56,H//2+43),fill=ACC)
f=F(20,'Medium'); t='[ Slogan TBD ]'; d.text(((W-d.textlength(t,font=f))/2,H//2+58),t,font=f,fill=(90,90,90))
f2=F(14,'Regular'); t='CE · FCC compliant'; d.text(((W-d.textlength(t,font=f2))/2,H-52),t,font=f2,fill=(150,150,150))
im.save('txt/end.png')
foot=Image.new('RGBA',(W,H),(0,0,0,0)); fd=ImageDraw.Draw(foot); ff=F(15,'Regular'); t='* with a 70 kg pilot'; fd.text((W-40-fd.textlength(t,font=ff),H-40),t,font=ff,fill=(255,255,255,200)); foot.save('txt/foot.png')
lst=[]; base=f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},format=yuv420p"
for i,(src,ss,dur,spec) in enumerate(segs):
    out=f'seg/{i:02d}.mp4'; A=['-f','lavfi','-i','anullsrc=r=44100:cl=stereo']; enc=['-t',str(dur),'-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',out]
    if src=='END':
        cmd=['ffmpeg','-v','error','-y','-loop','1','-t',str(dur),'-i','txt/end.png']+A+['-filter_complex',f'[0:v]fps={FPS},format=yuv420p,fade=in:0:8[v]','-map','[v]','-map','1:a']+enc
    else:
        path=CG if src=='CG' else SM+src
        has_a=subprocess.run(['ffprobe','-v','error','-select_streams','a','-show_entries','stream=index','-of','csv=p=0',path],capture_output=True,text=True).stdout.strip()!=''
        inputs=['-ss',str(ss),'-t',str(dur),'-i',path]; fc=f'[0:v]{base},{GRADE}[b]'; last='b'; idx=1
        if spec=='LOGO':
            ov=Image.new('RGBA',(W,H),(0,0,0,0)); ov.paste(lg,((W-lg.width)//2,(H-lg.height)//2-40),lg); ov.save('txt/logo_ov.png')
            inputs+=['-loop','1','-t',str(dur),'-i','txt/logo_ov.png']; fc+=f';[1:v]format=rgba,fade=in:st=0.2:d=0.4:alpha=1,fade=out:st=1.9:d=0.5:alpha=1[l];[b][l]overlay=0:0:shortest=1[o1]'; last='o1'; idx=2
        elif spec:
            name,lines,anchor,xy=spec; dd=text_seq(name,lines,dur,anchor,xy)
            inputs+=['-framerate',str(FPS),'-i',f'{dd}/%04d.png']; fc+=f';[b][1:v]overlay=0:0:eof_action=pass[o1]'; last='o1'; idx=2
            if name=='end':
                inputs+=['-loop','1','-t',str(dur),'-i','txt/foot.png']; fc+=f';[2:v]format=rgba,fade=in:st=0.6:d=0.4:alpha=1[ft];[o1][ft]overlay=0:0:shortest=1[o2]'; last='o2'; idx=3
        if has_a: amap=['-map','0:a']; ain=[]
        else: ain=A; amap=['-map',f'{idx}:a']
        cmd=['ffmpeg','-v','error','-y']+inputs+ain+['-filter_complex',fc,'-map',f'[{last}]']+amap+['-af','aresample=44100,aformat=channel_layouts=stereo']+enc
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode: print('ERR',i,src,r.stderr[-400:])
    lst.append(f"file '{os.path.abspath(out)}'")
open('list.txt','w').write('\n'.join(lst))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','list.txt','-c:v','libx264','-crf','18','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-af','loudnorm=I=-16:TP=-1.5:LRA=11','粗剪_v3.mp4'])
print(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','粗剪_v3.mp4'],capture_output=True,text=True).stdout)
