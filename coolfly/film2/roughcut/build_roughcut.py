import subprocess,os
SM='/tmp/claude-0/-home-user-productvideo/431a0c19-0762-5b23-941d-3651f6859d1b/scratchpad/canvas_job/samples/'
CG='/tmp/claude-0/-home-user-productvideo/431a0c19-0762-5b23-941d-3651f6859d1b/scratchpad/render/outx/CG_S18_dual_battery_xray.mp4'
LOGO='/home/user/productvideo/coolfly/refs/LOGO_CoolFly_白色.png'
FB='/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'; FR='/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
W,H,FPS=1280,720,24
def esc(t): return t.replace(':','\\:').replace("'","\u2019")
def sup(big,small=None,foot=None):
    f=[]
    if big: f.append(f"drawtext=fontfile={FB}:text='{esc(big)}':x=70:y=h-190:fontsize=64:fontcolor=white:shadowcolor=black@0.6:shadowx=2:shadowy=2:enable='gte(t,0.3)'")
    if small: f.append(f"drawtext=fontfile={FR}:text='{esc(small)}':x=74:y=h-115:fontsize=30:fontcolor=0xFF6A00:shadowcolor=black@0.6:shadowx=2:shadowy=2:enable='gte(t,0.3)'")
    if foot: f.append(f"drawtext=fontfile={FR}:text='{esc(foot)}':x=w-tw-40:y=h-44:fontsize=20:fontcolor=white@0.8")
    return ','.join(f)
segs=[
 ('V01.mp4',2.5,3.0,None),
 ('CARD',0,1.5,'What does it take to fly yourself?'),
 ('V06.mp4',1.0,2.5,None),
 ('V07_b2.mp4',1.0,3.0,None),
 ('V08.mp4',1.0,3.0,sup('100 km/h','top speed')),
 ('V09_b2.mp4',2.0,2.5,None),
 ('V10.mp4',0.5,4.0,None),
 ('V11_b2.mp4',1.5,3.5,sup('40 min','flight time*','* with a 70 kg pilot')),
 ('V12.mp4',1.0,2.5,None),
 ('V13_b2.mp4',0.0,5.0,sup('NA80','dual-redundant flight control')),
 ('V13_b2.mp4',5.0,5.0,sup('Millisecond','switchover')),
 ('V16_b2.mp4',1.0,3.5,sup('mmWave','obstacle avoidance')),
 ('V17.mp4',1.5,3.0,sup('Whole-aircraft','parachute')),
 ('CG',0.0,3.0,sup('Dual','batteries')),
 ('V19_b2.mp4',0.5,5.0,None),
 ('V20_b3.mp4',0.5,5.0,None),
 ('END',0,5.0,None),
]
os.makedirs('seg',exist_ok=True); lst=[]
base=f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS},format=yuv420p"
for i,(src,ss,dur,extra) in enumerate(segs):
    out=f'seg/{i:02d}.mp4'
    if src=='CARD':
        vf=f"drawtext=fontfile={FB}:text='{esc(extra)}':x=(w-tw)/2:y=(h-th)/2:fontsize=48:fontcolor=white,fade=in:0:6,fade=out:{int(dur*FPS)-6}:6"
        cmd=['ffmpeg','-v','error','-y','-f','lavfi','-i',f'color=c=black:s={W}x{H}:r={FPS}:d={dur}','-f','lavfi','-i',f'anullsrc=r=44100:cl=stereo','-t',str(dur),'-vf',vf,'-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k','-shortest',out]
    elif src=='END':
        vf=f"[1:v]scale=640:-1[lg];[0:v][lg]overlay=(W-w)/2:(H-h)/2-60,drawtext=fontfile={FR}:text='[ slogan TBD ]':x=(w-tw)/2:y=h/2+70:fontsize=34:fontcolor=white@0.85,drawtext=fontfile={FR}:text='CE · FCC compliant':x=(w-tw)/2:y=h-70:fontsize=20:fontcolor=white@0.6,fade=in:0:8"
        cmd=['ffmpeg','-v','error','-y','-f','lavfi','-i',f'color=c=black:s={W}x{H}:r={FPS}:d={dur}','-i',LOGO,'-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-t',str(dur),'-filter_complex',vf,'-map','2:a','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',out]
        cmd=['ffmpeg','-v','error','-y','-f','lavfi','-i',f'color=c=black:s={W}x{H}:r={FPS}:d={dur}','-i',LOGO,'-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-filter_complex',vf+'[v]','-map','[v]','-map','2:a','-t',str(dur),'-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',out]
    else:
        path=CG if src=='CG' else SM+src
        vf=base+(','+extra if extra else '')
        has_a=subprocess.run(['ffprobe','-v','error','-select_streams','a','-show_entries','stream=index','-of','csv=p=0',path],capture_output=True,text=True).stdout.strip()!=''
        if has_a:
            cmd=['ffmpeg','-v','error','-y','-ss',str(ss),'-t',str(dur),'-i',path,'-vf',vf,'-af','aresample=44100,aformat=channel_layouts=stereo','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',out]
        else:
            cmd=['ffmpeg','-v','error','-y','-ss',str(ss),'-t',str(dur),'-i',path,'-f','lavfi','-i','anullsrc=r=44100:cl=stereo','-vf',vf,'-map','0:v','-map','1:a','-t',str(dur),'-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','128k',out]
    r=subprocess.run(cmd,capture_output=True,text=True)
    if r.returncode: print('ERR',i,src,r.stderr[-400:])
    lst.append(f"file '{os.path.abspath(out)}'")
open('list.txt','w').write('\n'.join(lst))
subprocess.run(['ffmpeg','-v','error','-y','-f','concat','-safe','0','-i','list.txt','-c:v','libx264','-crf','20','-pix_fmt','yuv420p','-c:a','aac','-b:a','160k','粗剪_v1.mp4'])
print(subprocess.run(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0','粗剪_v1.mp4'],capture_output=True,text=True).stdout)
