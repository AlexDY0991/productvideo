#!/usr/bin/env python3
"""v10.2 cut (no repeated beats): picture + music + VO + SFX from one shot table and one events table.

Music: score_c (exactly 96 BPM, 2.5 s bars) with two bars (track 15.0-20.0 s) removed so the film runs 75.0 s and its
real hits (lift 19.4, drop 30.0, vacuum 41-44, drop 45.0, quiet 55-59, outro 60.0, final hit 72.5) carry the edit.
Usage: python3 film02/v10/build_cut_v102.py OUTDIR
"""
import json, os, subprocess, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent
SRC, GEN, VO = ROOT/'source', ROOT/'gen', ROOT/'vo'
OUT = Path(sys.argv[1]); SEG = OUT/'seg'; SEG.mkdir(parents=True, exist_ok=True)
LOGO = ROOT/'coolfly-logo-white.png'  # white wordmark with the orange F, made from brand/coolfly-logo.png
FPS, W, H = 24, 1920, 1080

# (film_start, film_end, source, source_in, speed)  speed<1 = slow motion
SHOTS = [  # v10.2: every shot is a different beat; clips here are multi-shot edits, so beats are tagged
    # COLD OPEN: three flashes that appear nowhere else in the film
    (0.00, 0.42, SRC/'sc11.mp4', 7.00, 1, 'sunset-water-rush'),
    (0.42, 0.83, SRC/'sc11-1.mp4', 2.50, 1, 'bank-over-spray'),
    (0.83, 1.25, SRC/'sc7.mp4', 9.00, 1, 'pov-cliffs'),
    # RANCH: slow, wide, quiet
    (1.25, 5.00, SRC/'sc1.mp4', 0.10, 1, 'ranch-wide'),
    (5.00, 6.25, SRC/'sc2.mp4', 0.00, 1, 'horses-run'),
    (6.25, 7.50, SRC/'sc3.mp4', 3.00, 1, 'dog-turns'),
    (7.50, 8.75, SRC/'sc2.mp4', 2.40, 1, 'hooves'),
    # GEAR UP: medium to close, quickening
    (8.75, 10.62, SRC/'sc5.mp4', 0.00, 1, 'walk-helmet'),
    (10.62, 12.50, SRC/'sc4.mp4', 2.00, 1, 'helmet-on'),
    (12.50, 13.75, SRC/'sc5.mp4', 5.00, 1, 'motors-green'),
    (13.75, 15.00, SRC/'sc15.mp4', 6.00, 1, 'motor-detail'),     # was sc4 seated-wide: same frame as motors-green
    (15.00, 16.25, SRC/'sc11-1.mp4', 0.00, 1, 'hand-stick'),
    (16.25, 17.50, SRC/'sc11.mp4', 4.00, 0.75, 'stick-overhead'),   # was sc12 hands: same angle as hand-stick
    (17.50, 19.375, SRC/'sc9.mp4', 2.00, 0.5, 'visor-eyes'),        # vacuum, slow
    # LIFT
    (19.375, 20.00, SRC/'sc16.mp4', 0.00, 1, 'grass-whoosh'),     # motion-blur wipe on the hit
    (20.00, 21.88, SRC/'sc4.mp4', 6.00, 1, 'lift-wide'),
    (21.88, 23.75, SRC/'sc5.mp4', 9.00, 1, 'belly-pass'),
    (23.75, 30.00, GEN/'V10N2.mp4', 0.40, 1, 'saddle-to-sky'),    # horses -> Dream match cut
    # FLIGHT: drop, FPV and tracking, fast cuts only at the end
    (30.00, 32.50, SRC/'sc12.mp4', 2.20, 1, 'fpv-seastack'),
    (32.50, 33.75, SRC/'sc7.mp4', 3.00, 1, 'side-surf'),
    (33.75, 35.00, SRC/'sc10.mp4', 4.00, 1, 'track-cliff'),
    (35.00, 36.25, SRC/'sc6.mp4', 8.00, 1, 'pov-front'),
    (36.25, 37.50, SRC/'sc8.mp4', 6.00, 1, 'fpv-rocks'),
    (37.50, 38.12, SRC/'sc11.mp4', 5.00, 1, 'backlit-rocks'),
    (38.12, 39.38, SRC/'sc11-1.mp4', 8.00, 1, 'pov-water'),      # sc11 low-water-cliff dropped: same view
    (39.38, 40.00, SRC/'sc9.mp4', 8.00, 1, 'pov-cockpit'),
    (40.00, 40.62, SRC/'sc11-1.mp4', 11.00, 1, 'depart-low'),
    (40.62, 41.88, SRC/'sc9.mp4', 0.00, 0.5, 'pilot-side'),       # vacuum
    (41.88, 45.00, SRC/'sc12.mp4', 6.00, 0.5, 'smile'),           # "This never gets old."
    # HOME: head-on hero, then the long way back
    (45.00, 47.50, SRC/'sc8.mp4', 0.00, 1, 'head-on'),
    (47.50, 48.75, SRC/'sc6.mp4', 4.00, 1, 'side-water'),
    (48.75, 50.00, SRC/'sc10.mp4', 0.50, 1, 'wide-coast'),
    (50.00, 52.50, SRC/'sc13.mp4', 0.00, 1, 'approach-cliff'),
    (52.50, 53.75, SRC/'sc15.mp4', 0.00, 1, 'breakfast'),
    (53.75, 55.00, SRC/'sc13.mp4', 3.00, 1, 'over-meadow'),
    (55.00, 60.00, GEN/'V10N4.mp4', 0.00, 1, 'landing-far'),
    # REUNION
    (60.00, 61.25, SRC/'sc14.mp4', 0.00, 1, 'girl-through-prop'),
    (61.25, 63.75, GEN/'V10N5-yunjing.mp4', 0.00, 1, 'girl-dog-run'),
    (63.75, 66.25, SRC/'sc14.mp4', 2.00, 1, 'dad-smile'),
    (66.25, 67.50, SRC/'sc15.mp4', 3.00, 1, 'parked-hero'),
    (67.50, 69.38, SRC/'sc14.mp4', 8.00, 1, 'girl-helmet'),
    (69.38, 70.00, SRC/'sc2.mp4', 7.30, 1, 'horse-head'),
    (70.00, 75.00, SRC/'sc16.mp4', 2.00, 1, 'family-hero'),       # logo fades in at 71.25, full on 72.5
]
DUR = 75.0

VO_LINES = [  # (start, file, subtitle)
    (1.76, 'vo1', "Out here, mornings don't rush."),
    (8.94, 'vo2', "I used to think the best way to see this land was from a saddle."),
    (26.79, 'vo3', "Turns out, it's from about sixty feet up."),
    (30.38, 'vo4', "The whole coast. Right under my boots."),
    (42.25, 'vo5', "This never gets old."),
    (55.42, 'vo6', "Home before the coffee gets cold."),
    (60.21, 'vo7a', "But the best view was never up there."),
    (62.90, 'vo7b', "It's you. Running toward me."),
]
VOICE = 'am_michael'

# Sound design events: (time, kind, gain dB)
SFX = [(0.00, 'impact', -4), (0.42, 'whoosh', -10), (0.83, 'whoosh', -10), (17.50, 'riser', -12), (19.38, 'impact', -6), (21.88, 'whoosh', -10), (30.00, 'impact', -3), (37.50, 'whoosh', -12), (38.12, 'whoosh', -12), (39.38, 'whoosh', -12), (40.00, 'whoosh', -8), (45.00, 'impact', -4)]
DIEGETIC_DB = -14   # clip sound under the music


def run(args):
    subprocess.run([str(a) for a in args], check=True)


def duration(path):
    return float(subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(path)],
                                capture_output=True, text=True).stdout)


def has_audio(path):
    return bool(subprocess.run(['ffprobe', '-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', str(path)],
                               capture_output=True, text=True).stdout.strip())


def segments():
    files = []
    for i, (a, b, src, sin, speed, *_) in enumerate(SHOTS):
        n = round((b - a) * FPS)
        need = (b - a) * speed
        assert sin + need <= duration(src) + 0.05, f'shot {i} runs past the end of {src.name}'
        vf = f'scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},fps={FPS}'
        if speed != 1:
            vf = f'setpts=PTS/{speed},' + f'minterpolate=fps={FPS}:mi_mode=mci:mc_mode=aobmc:vsbmc=1,' + vf
        out = SEG/f'{i:02d}.mp4'
        audio = ['-f', 'lavfi', '-t', f'{b-a:.3f}', '-i', 'anullsrc=r=48000:cl=stereo']
        if has_audio(src):
            af = (f'atempo={speed},' if speed != 1 else '') + f'aresample=48000,volume={DIEGETIC_DB}dB,afade=t=in:d=0.02,afade=t=out:st={max(0, b-a-0.15):.3f}:d=0.15'  # no clip transient ahead of the next hit
            run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{sin:.3f}', '-t', f'{need+0.2:.3f}', '-i', src, '-vf', vf, '-af', af,
                 '-frames:v', n, '-t', f'{b-a:.3f}', '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', '-ac', '2', out])
        else:
            run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{sin:.3f}', '-t', f'{need+0.2:.3f}', '-i', src] + audio +
                ['-vf', vf, '-map', '0:v', '-map', '1:a', '-frames:v', n, '-t', f'{b-a:.3f}', '-c:v', 'libx264', '-crf', '16',
                 '-pix_fmt', 'yuv420p', '-c:a', 'pcm_s16le', out])
        files.append(out)
    lst = OUT/'concat.txt'
    lst.write_text(''.join(f"file '{f}'\n" for f in files))
    run(['ffmpeg', '-v', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', lst, '-c:v', 'libx264', '-crf', '16', '-pix_fmt', 'yuv420p',
         '-c:a', 'pcm_s16le', OUT/'picture.mov'])


def ass_time(t):
    h, m, s = int(t // 3600), int(t % 3600 // 60), t % 60
    return f'{h}:{m:02d}:{s:05.2f}'


def subtitles():
    head = ('[Script Info]\nScriptType: v4.00+\nPlayResX: 1920\nPlayResY: 1080\n\n[V4+ Styles]\n'
            'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, '
            'ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n'
            'Style: Sub,Inter Display Medium,46,&H00FFFFFF,&H00FFFFFF,&H64000000,&H00000000,0,0,0,0,100,100,0.5,0,1,1.2,1.5,2,160,160,86,1\n\n'
            '[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n')
    rows = []
    for t, key, text in VO_LINES:
        d = duration(VO/f'{key}_{VOICE}.wav')
        rows.append(f'Dialogue: 0,{ass_time(t-0.1)},{ass_time(t+d+0.5)},Sub,,0,0,0,,{{\\fad(120,160)}}{text}')
    (OUT/'subs.ass').write_text(head + '\n'.join(rows) + '\n')


def sfx_bank():
    bank = OUT/'sfx'; bank.mkdir(exist_ok=True)
    defs = {
        'impact': "aevalsrc='0.9*sin(2*PI*(42+60*exp(-8*t))*t)*exp(-3.2*t)+0.25*(random(0)-0.5)*exp(-18*t)':s=48000:d=2.2",
        'whoosh': "anoisesrc=d=0.7:c=pink:a=0.8,afade=t=in:d=0.35:curve=exp,afade=t=out:st=0.35:d=0.35,bandpass=f=1400:w=1800",
        'riser': "anoisesrc=d=2.1:c=white:a=0.5,afade=t=in:d=2.0:curve=exp,highpass=f=600,lowpass=f=9000",
    }
    for k, src in defs.items():
        run(['ffmpeg', '-v', 'error', '-y', '-f', 'lavfi', '-i', src, '-ac', '2', '-ar', '48000', bank/f'{k}.wav'])
    return bank


def audio_mix():
    bank = sfx_bank()
    score = GEN/'score_c.wav'
    # Music: remove two bars (15.08-20.09) so its hits land on the edit; fade the tail.
    run(['ffmpeg', '-v', 'error', '-y', '-i', score, '-filter_complex',
         '[0]atrim=0:15.0,asetpts=N/SR/TB[a];[0]atrim=20.0:80.04,asetpts=N/SR/TB[b];[a][b]acrossfade=d=0.03[m];'
         f'[m]atrim=0:{DUR},afade=t=out:st={DUR-1.2}:d=1.2[o]', '-map', '[o]', OUT/'music.wav'])
    inputs, chains, labels = ['-i', OUT/'picture.mov', '-i', OUT/'music.wav'], [], []
    idx = 2
    vo_windows = []
    for t, key, _ in VO_LINES:
        f = VO/f'{key}_{VOICE}.wav'; d = duration(f); vo_windows.append((t, t + d))
        inputs += ['-i', f]
        chains.append(f'[{idx}]aresample=48000,pan=stereo|c0=c0|c1=c0,volume=2.0,adelay={int(t*1000)}|{int(t*1000)}[v{idx}]'); labels.append(f'[v{idx}]'); idx += 1
    for t, kind, db in SFX:
        inputs += ['-i', bank/f'{kind}.wav']
        chains.append(f'[{idx}]volume={db}dB,adelay={int(t*1000)}|{int(t*1000)}[s{idx}]'); labels.append(f'[s{idx}]'); idx += 1
    hits = (19.375, 30.0, 45.0, 60.0, 72.5)
    # a duck that releases just before a hit reads as an early hit: hold it until the hit
    ends = [next((h for h in hits if 0 <= h - (b + 0.2) < 0.6), b + 0.2) for a, b in vo_windows]
    duck = '+'.join(f'between(t,{a-0.15:.2f},{e:.2f})' for (a, b), e in zip(vo_windows, ends))
    chains.append(f"[1]volume='if({duck},0.38,1)':eval=frame[mus]")
    graph = ';'.join(chains) + f";[0:a][mus]{''.join(labels)}amix=inputs={2+len(labels)}:normalize=0:duration=first[mix]"
    run(['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', graph, '-map', '[mix]', '-t', f'{DUR}', OUT/'mix_raw.wav'])
    # Two-pass loudness to -14 LUFS / -1 dBTP.
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', OUT/'mix_raw.wav', '-af', 'loudnorm=I=-14:TP=-1.0:LRA=11:print_format=json',
                        '-f', 'null', '-'], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex('{'):r.rindex('}')+1])
    run(['ffmpeg', '-v', 'error', '-y', '-i', OUT/'mix_raw.wav', '-af',
         f"loudnorm=I=-14:TP=-1.0:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:"
         f"measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,alimiter=limit=0.82:level=false", '-ar', '48000', OUT/'mix.wav'])


def master(name):
    logo_in, logo_full = 71.25, 72.5
    vf = (f"[0:v]subtitles={OUT/'subs.ass'}[sv];"
          f"[1:v]scale=520:-1,format=rgba[lg];"
          f"[lg]fade=t=in:st={logo_in}:d=0.9:alpha=1[lgf];"
          f"[sv][lgf]overlay=x=(W-w)/2:y=130:enable='gte(t,{logo_in})'[v1];"
          f"[v1]drawtext=fontfile=/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf:text='D R E A M':fontsize=34:fontcolor=white:"
          f"x=(w-text_w)/2:y=262:alpha='if(lt(t,{logo_full}),0,min(1,(t-{logo_full})/0.6))'[v]")
    run(['ffmpeg', '-v', 'error', '-y', '-i', OUT/'picture.mov', '-loop', '1', '-t', f'{DUR}', '-i', LOGO, '-i', OUT/'mix.wav',
         '-filter_complex', vf, '-map', '[v]', '-map', '2:a', '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p',
         '-r', str(FPS), '-c:a', 'aac', '-b:a', '256k', '-t', f'{DUR}', '-movflags', '+faststart', OUT/name])


if __name__ == '__main__':
    sys.path.insert(0, str(ROOT.parents[1]/'tools'))
    from edl_check import check
    print(check(SHOTS, DUR, max_uses=4))
    segments(); subtitles(); audio_mix(); master('DREAM-FromTheSaddle-v10.2-draft.mp4')
    print(OUT/'DREAM-FromTheSaddle-v10.2-draft.mp4')
