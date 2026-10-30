#!/usr/bin/env python3
"""film03 FIRST FLIGHT animatic: storyboard stills with camera moves, cut to a code-synthesised temp score.

Usage: python3 film03/animatic.py OUTDIR
Picture and sound share one timeline (TIMES below = BRIEF-FirstFlight.md section 4; 100 BPM, bar 2.4 s):
drop 12.0 (lift-off), vacuum 38.4, lift 40.8 (she laughs), end 55.2 ("Again."), 60.0 out.
The temp score is original (higgsfield-motion score.html, rendered headless), internal only: the release track is
licensed after picture lock. Temp lines are Kokoro TTS.
"""
import json, os, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
BOARD = ROOT/'board'
OUT = Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
W, H, FPS, DUR, BPM = 1920, 1080, 24, 60.0, 100
SK = Path('/root/.claude/skills/synced/2b3f0ebb-1e37-4d73-b17b-064d8359dcaf_57fae081-93aa-46b6-85bf-2820253df755/higgsfield-motion')
TOOLS = Path(os.environ.get('COOLFLY_TOOLS', '/tmp/coolfly-tools'))
LOGO = ROOT.parent/'film02/v10/coolfly-logo-white.png'
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf'

# (start, end, still, zoom from->to, centre x from->to, centre y from->to); centre in 0..1 of the still
SHOTS = [
    (0.0, 2.4, 'B01', 1.00, 1.08, .55, .55, .55, .55),
    (2.4, 4.8, 'B02', 1.05, 1.12, .50, .50, .50, .50),
    (4.8, 7.2, 'B03', 1.10, 1.10, .45, .55, .50, .50),
    (7.2, 9.6, 'B04', 1.05, 1.20, .52, .52, .40, .40),
    (9.6, 12.0, 'B05', 1.05, 1.18, .55, .60, .55, .55),
    (12.0, 14.4, 'B06', 1.00, 1.15, .50, .50, .45, .40),
    (14.4, 16.8, 'B07', 1.08, 1.16, .50, .50, .40, .40),
    (16.8, 24.0, 'B08', 1.20, 1.25, .38, .62, .50, .50),   # FPV follow, left to right
    (24.0, 26.4, 'B09', 1.12, 1.12, .44, .56, .50, .50),
    (26.4, 28.8, 'B10', 1.05, 1.14, .50, .50, .40, .38),
    (28.8, 36.6, 'B11', 1.30, 1.00, .50, .50, .60, .50),   # rise / reveal: pull out
    (36.6, 38.4, 'B12', 1.00, 1.45, .50, .50, .35, .30),   # crash push toward the visor
    (38.4, 40.8, 'B13', 1.04, 1.06, .50, .50, .50, .50),   # vacuum: almost still
    (40.8, 43.2, 'B14', 1.15, 1.05, .50, .50, .40, .40),   # she laughs: punch then ease out
    (43.2, 48.0, 'B15', 1.20, 1.20, .62, .38, .50, .50),   # hero pass, sweeps across
    (48.0, 52.8, 'B16', 1.00, 1.15, .50, .50, .50, .50),   # head-on, coming home right to left
    (52.8, 55.2, 'B17', 1.05, 1.10, .52, .52, .50, .50),
    (55.2, 57.6, 'B18', 1.12, 1.02, .52, .52, .40, .40),   # "Again."
    (57.6, 60.0, 'B19', 1.10, 1.00, .50, .50, .55, .55),   # wide, logo
]
SHAKE = [(12.0, 0.35, 14), (40.8, 0.3, 10)]        # (time, length s, pixels) camera kick on the two hits
TITLES = [(0.25, 2.25, 'Everyone remembers their first.', 'super'),
          (5.0, 7.0, '“Whenever you’re ready.”', 'sub'),
          (55.7, 57.5, '“Again.”', 'sub')]
EVENTS = {'fps': FPS, 'bpm': BPM, 'dur': DUR, 'events': [
    {'t': 12.0, 'k': 'drop'}, {'t': 38.4, 'k': 'vac'}, {'t': 40.8, 'k': 'lift'}, {'t': 55.2, 'k': 'end'},
    {'t': 3.0, 'k': 'click', 'w': 1.2, 'note': 'buckle'},
    {'t': 12.0, 'k': 'riser', 'dur': 2.4, 'w': 0.9}, {'t': 12.0, 'k': 'impact', 'w': 1.0},
    {'t': 16.8, 'k': 'whoosh', 'dir': 'right', 'w': 0.8}, {'t': 24.0, 'k': 'whoosh', 'dir': 'right', 'w': 0.6},
    {'t': 38.4, 'k': 'riser', 'dur': 1.8, 'w': 0.8}, {'t': 40.8, 'k': 'impact', 'w': 1.1},
    {'t': 43.2, 'k': 'whoosh', 'dir': 'left', 'w': 0.9}, {'t': 48.0, 'k': 'whoosh', 'dir': 'left', 'w': 0.6},
]}
LINES = [(5.1, 'ray', "Whenever you're ready.", 'am_michael'), (55.75, 'maya', 'Again.', 'af_heart')]


def ease(u):
    return u * u * (3 - 2 * u)


def frame_at(img, z, cx, cy):
    sw, sh = img.size
    bw, bh = sw / z, sh / z
    x0 = min(max(cx * sw - bw / 2, 0), sw - bw); y0 = min(max(cy * sh - bh / 2, 0), sh - bh)
    return img.crop((x0, y0, x0 + bw, y0 + bh)).resize((W, H), Image.BICUBIC)


def picture():
    stills = {}
    font_super = ImageFont.truetype(FONT, 46); font_sub = ImageFont.truetype(FONT, 40); font_tag = ImageFont.truetype(FONT, 30)
    logo = Image.open(LOGO).convert('RGBA'); logo = logo.resize((520, int(520 * logo.height / logo.width)), Image.LANCZOS)
    ff = subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', str(FPS), '-i', '-',
                           '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p', str(OUT/'picture.mp4')], stdin=subprocess.PIPE)
    for n in range(int(DUR * FPS)):
        t = n / FPS
        a, b, key, z0, z1, x0, x1, y0, y1 = next(s for s in SHOTS if s[0] <= t < s[1])
        if key not in stills:
            stills[key] = Image.open(next(p for p in (BOARD/f'{key}.png', BOARD/f'{key}.jpg') if p.exists())).convert('RGB').resize((2560, 1440), Image.LANCZOS)
        u = ease((t - a) / (b - a))
        fr = frame_at(stills[key], z0 + (z1 - z0) * u, x0 + (x1 - x0) * u, y0 + (y1 - y0) * u)
        for ht, ln, px in SHAKE:
            if ht <= t < ht + ln:
                k = (1 - (t - ht) / ln) * px; s = 1 if n % 2 else -1
                fr = fr.transform(fr.size, Image.AFFINE, (1, 0, s * k, 0, 1, -s * k * .6), Image.BICUBIC)
        d = ImageDraw.Draw(fr)
        for ta, tb, text, kind in TITLES:
            if ta <= t < tb:
                alpha = min(1, (t - ta) / .3, (tb - t) / .3)
                f = font_super if kind == 'super' else font_sub
                tw = d.textlength(text, font=f); y = H * .46 if kind == 'super' else H * .86
                c = int(255 * alpha)
                d.text(((W - tw) / 2 + 2, y + 2), text, font=f, fill=(0, 0, 0))
                d.text(((W - tw) / 2, y), text, font=f, fill=(c, c, c))
        if t >= 57.9:  # logo in the clear sky of B19
            alpha = min(1, (t - 57.9) / .6)
            lg = logo.copy(); lg.putalpha(lg.getchannel('A').point(lambda v: int(v * alpha)))
            fr.paste(lg, ((W - lg.width) // 2, 150), lg)
            tw = d.textlength('D R E A M', font=font_tag)
            c = int(255 * alpha); d.text(((W - tw) / 2, 150 + lg.height + 24), 'D R E A M', font=font_tag, fill=(c, c, c))
        tc = f'{key}  {t:05.2f}'
        d.text((24, 20), tc, font=font_tag, fill=(255, 210, 0))  # board id + time, it is an animatic
        ff.stdin.write(fr.tobytes())
    ff.stdin.close(); ff.wait()


def sound():
    ev = OUT/'events.json'; ev.write_text(json.dumps(EVENTS))
    env = dict(os.environ, HFT_BROWSER=str(TOOLS/'chrome'))
    subprocess.run(['node', 'scripts/render_audio.mjs', 'assets/templates/audio/score.html', str(OUT/'score.wav'),
                    '--query', f'preset=arrival&bpm={BPM}&dur={DUR}', '--events', str(ev)], cwd=SK, env=env, check=True)
    py = str(TOOLS/'venv/bin/python')
    for _, key, text, voice in LINES:
        (OUT/f'{key}.json').write_text(json.dumps({key: text}))
        subprocess.run([py, str(ROOT.parent/'tools/vo.py'), str(OUT/f'{key}.json'), str(OUT), '--voice', voice, '--speed', '0.95'],
                       env=dict(os.environ, COOLFLY_TOOLS=str(TOOLS)), check=True)
    inputs, chains, labels = ['-i', str(OUT/'score.wav')], [], []
    for i, (t, key, _, voice) in enumerate(LINES, 1):
        inputs += ['-i', str(OUT/f'{key}_{voice}.wav')]
        chains.append(f'[{i}]aresample=48000,pan=stereo|c0=c0|c1=c0,volume=1.8,adelay={int(t*1000)}|{int(t*1000)}[v{i}]'); labels.append(f'[v{i}]')
    duck = '+'.join(f'between(t,{t-0.1:.2f},{t+1.6:.2f})' for t, *_ in LINES)
    graph = ';'.join(chains) + f";[0]volume='if({duck},0.45,1)':eval=frame[m];[m]{''.join(labels)}amix=inputs={1+len(labels)}:normalize=0:duration=first[a]"
    subprocess.run(['ffmpeg', '-v', 'error', '-y'] + inputs + ['-filter_complex', graph, '-map', '[a]', '-t', str(DUR), '-ar', '48000', str(OUT/'mix_raw.wav')], check=True)
    # gain to -14 LUFS measured on the raw mix, then a brick-wall limiter (true peak <= -1 dBTP)
    r = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(OUT/'mix_raw.wav'), '-af', 'ebur128', '-f', 'null', '-'], capture_output=True, text=True).stderr
    lufs = float(r[r.rindex('I:'):].split()[1])
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(OUT/'mix_raw.wav'), '-af',
                    f'volume={-14 - lufs:.2f}dB,aresample=192000,alimiter=limit=0.82:attack=1:release=60:level=false,aresample=48000',
                    str(OUT/'mix.wav')], check=True)


if __name__ == '__main__':
    assert abs(SHOTS[-1][1] - DUR) < 1e-6 and all(abs(SHOTS[i][1] - SHOTS[i+1][0]) < 1e-6 for i in range(len(SHOTS) - 1))
    sound(); picture()
    final = OUT/'FIRSTFLIGHT-animatic-v1.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(OUT/'picture.mp4'), '-i', str(OUT/'mix.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
                    '-shortest', str(final)], check=True)
    print(final)
