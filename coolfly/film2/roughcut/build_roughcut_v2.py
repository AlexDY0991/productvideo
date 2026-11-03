import subprocess,os,json
from PIL import Image,ImageDraw,ImageFont,ImageFilter
SM='/tmp/claude-0/-home-user-productvideo/431a0c19-0762-5b23-941d-3651f6859d1b/scratchpad/canvas_job/samples/'
CG='/tmp/claude-0/-home-user-productvideo/431a0c19-0762-5b23-941d-3651f6859d1b/scratchpad/render/outx/CG_S18_dual_battery_xray.mp4'
FD='/tmp/claude-0/-home-user-productvideo/431a0c19-0762-5b23-941d-3651f6859d1b/scratchpad/fonts/'
LOGO='/home/user/productvideo/coolfly/refs/LOGO_CoolFly_白色.png'
W,H,FPS=1280,720,24; ORANGE=(255,106,0)
def font(name,size,var):
    f=ImageFont.truetype(FD+name,size)
    try: f.set_variation_by_name(var)
    except Exception: pass
    return f
os.makedirs('txt',exist_ok=True); os.makedirs('seg',exist_ok=True)
def card(name,lines,pos='left',y0=None):
    """lines: list of (text,size,color,weight,font)"""
    im=Image.new('RGBA',(W,H),(0,0,0,0)); d=ImageDraw.Draw(im)
    fonts=[font(fn,s,wt) for (_,s,_,wt,fn) in lines]
    hs=[f.getbbox(t)[3] for f,(t,*_) in zip(fonts,lines)]
    y=y0 if y0 is not None else (H-sum(hs)-12*(len(lines)-1))//2
    for f,(t,s,c,wt,fn),h in zip(fonts,lines,hs):
        w=d.textlength(t,font=f); x={'left':80,'center':(W-w)/2,'right':W-80-w}[pos]
        sh=Image.new('RGBA',(W,H),(0,0,0,0)); ImageDraw.Draw(sh).text((x+2,y+3),t,font=f,fill=(0,0,0,140)); sh=sh.filter(ImageFilter.GaussianBlur(4)); im=Image.alpha_composite(im,sh); d=ImageDraw.Draw(im)
        d.text((x,y),t,font=f,fill=c+(255,)); y+=h+12
    p=f'txt/{name}.png'; im.save(p); return p
WH=(255,255,255)
T={
 'q1':card('q1',[('What does it take',48,WH,'SemiBold','Oswald.ttf'),('to fly yourself?',48,ORANGE,'SemiBold','Oswald.ttf')],'left',250),
 'spd':card('spd',[('100',190,WH,'Bold','Oswald.ttf'),('KM/H TOP SPEED',40,ORANGE,'Medium','Oswald.ttf')],'left',150),
 'end40':card('end40',[('40 MIN',150,WH,'Bold','Oswald.ttf'),('OF FLIGHT*',38,ORANGE,'Medium','Oswald.ttf')],'center',120),
 'foot':card('foot',[('* with a 70 kg pilot',20,WH,'Regular','Inter.ttf')],'right',H-50),
 'q2':card('q2',[('What if something fails?',48,WH,'SemiBold','Oswald.ttf'),("There's always a backup.",48,ORANGE,'SemiBold','Oswald.ttf')],'left',250),
 'na80':card('na80',[('NA80',130,WH,'Bold','Oswald.ttf'),('DUAL-REDUNDANT FLIGHT CONTROL',34,ORANGE,'Medium','Oswald.ttf')],'left',440),
 'ms':card('ms',[('MILLISECOND',96,WH,'Bold','Oswald.ttf'),('SWITCHOVER',34,ORANGE,'Medium','Oswald.ttf')],'left',470),
 'radar':card('radar',[('mmWave',96,WH,'Bold','Oswald.ttf'),('OBSTACLE AVOIDANCE',34,ORANGE,'Medium','Oswald.ttf')],'left',470),
 'chute':card('chute',[('WHOLE-AIRCRAFT',84,WH,'Bold','Oswald.ttf'),('PARACHUTE',34,ORANGE,'Medium','Oswald.ttf')],'left',480),
 'batt':card('batt',[('DUAL',110,WH,'Bold','Oswald.ttf'),('BATTERIES',34,ORANGE,'Medium','Oswald.ttf')],'left',460),
}
# end card
im=Image.new('RGBA',(W,H),(0,0,0,255)); lg=Image.open(LOGO).convert('RGBA'); lg.thumbnail((560,200)); im.alpha_composite(lg,((W-lg.width)//2,H//2-lg.height+10)); d=ImageDraw.Draw(im)
f=font('Oswald.ttf',34,'Light'); t='[ SLOGAN TBD ]'; d.text(((W-d.textlength(t,font=f))/2,H//2+40),t,font=f,fill=(255,255,255,210))
f2=font('Inter.ttf',18,'Regular'); t='CE · FCC compliant'; d.text(((W-d.textlength(t,font=f2))/2,H-60),t,font=f2,fill=(255,255,255,150))
im.convert('RGB').save('txt/end.png')
GRADE="eq=contrast=1.06:saturation=1.06:gamma=0.98,colorbalance=rs=0.03:gs=0.0:bs=-0.035:rm=0.02:bm=-0.02"
segs=[ # src, ss, dur, overlay, fade_in_at
 ('W01_altar.mp4',2.6,3.4,'q1',0.2),
 ('W02a_buckle.mp4',1.2,0.7,None,0),
 ('W02b_led.mp4',0.9,0.7,None,0),
 ('W02c_motor.mp4',1.0,0.7,None,0),
 ('W02d_visor.mp4',1.6,0.8,None,0),
 ('V07_b2.mp4',1.0,3.0,None,0),
 ('W03_prop.mp4',1.6,1.6,None,0),
 ('W06a_side.mp4',0.8,3.2,'spd',0.25),
 ('V09_b2.mp4',2.0,2.0,None,0),
 ('V10.mp4',0.5,3.0,None,0),
 ('W06b_horizon.mp4',1.5,3.8,'end40+foot',0.4),
 ('W04_reflect.mp4',1.0,1.6,None,0),
 ('V12.mp4',1.0,2.0,None,0),
 ('W01_altar.mp4',0.3,2.4,'q2',0.15),
 ('V13_b2.mp4',0.0,4.5,'na80',0.3),
 ('V13_b2.mp4',4.5,4.5,'ms',0.2),
 ('V16_b2.mp4',1.0,2.6,'radar',0.2),
 ('V17.mp4',1.5,2.6,'chute',0.2),
 ('CG',0.0,2.6,'batt',0.2),
 ('W05_disc.mp4',1.0,2.0,None,0),
 ('V19_b2.mp4',0.5,4.4,None,0),
 ('V20_b3.mp4',0.5,3.7,None,0),
 ('END',0,4.0,None,0),
]
lst=[]
base=f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},format=yuv420p"
for i,(src,ss,dur,ov,fi) in enumerate(segs):
    out=f'seg/{i:02d}.mp4'
    A=['-f','lavfi','-i','anullsrc=r=44100:cl=stereo']
    if src=='END':
        cmd=['ffmpeg','-v','error','-y','-loop','1','-t',str(dur),'-i','txt/end.png']+A+['-filter_complex',f'[0:v]fps={FPS},format=yuv420p,fade=in:0:10[v]','-map','[v]','-map','1:a','-t',str(dur),'-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',out]
    else:
        path=CG if src=='CG' else SM+src
        has_a=subprocess.run(['ffprobe','-v','error','-select_streams','a','-show_entries','stream=index','-of','csv=p=0',path],capture_output=True,text=True).stdout.strip()!=''
        inputs=['-ss',str(ss),'-t',str(dur),'-i',path]; fc=f'[0:v]{base},{GRADE}[b]'; last='b'; idx=1
        if ov:
            for name in ov.split('+'):
                inputs+=['-loop','1','-t',str(dur),'-i',T[name]]
                fc+=f';[{idx}:v]format=rgba,fade=in:st={fi}:d=0.35:alpha=1[t{idx}];[{last}][t{idx}]overlay=0:0:shortest=1[o{idx}]'; last=f'o{idx}'; idx+=1
        if has_a: amap=['-map','0:a']; ain=[]
        else: ain=A; amap=['-map',f'{idx}:a']
        cmd=['ffmpeg','-v','error','-y']+inputs+ain+['-filter_complex',fc,'-map',f'[{last}]']+amap+['-t',str(dur),'-af','aresample=44100,aformat=channel_layouts=stereo','-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',out]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode: print('ERR',i,src,r.stderr[-500:])
    lst.append(f"file '{os.path.abspath(out)}'")
open('list.txt','w').write('\n'.join(lst))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','list.txt','-c:v','libx264','-crf','19','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','-af','loudnorm=I=-16:TP=-1.5:LRA=11','粗剪_v2.mp4'])
print(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','粗剪_v2.mp4'],capture_output=True,text=True).stdout)
