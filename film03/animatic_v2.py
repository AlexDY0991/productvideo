#!/usr/bin/env python3
"""film03 v2 OPEN SKY animatic (BRIEF-v2-OpenSky.md): storyboard stills with camera moves, cut to a code-synthesised temp score.

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
W, H, FPS, DUR, BPM = 1920, 1080, 24, 60.0, 120
SK = Path('/root/.claude/skills/synced/2b3f0ebb-1e37-4d73-b17b-064d8359dcaf_57fae081-93aa-46b6-85bf-2820253df755/higgsfield-motion')
TOOLS = Path(os.environ.get('COOLFLY_TOOLS', '/tmp/coolfly-tools'))
LOGO = ROOT.parent/'film02/v10/coolfly-logo-white.png'
FONT = '/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf'

# (start, end, still, zoom from->to, centre x from->to, centre y from->to); v2 OPEN SKY, 120 BPM, bar 2.0 s
SHOTS = [
    (0.0, 1.5, 'C01', 1.04, 1.06, 0.5, 0.5, 0.5, 0.5),  # still
    (1.5, 3.0, 'C02', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (3.0, 4.0, 'C03', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (4.0, 6.0, 'C04', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (6.0, 8.0, 'C05', 1.0, 1.45, 0.5, 0.5, 0.42, 0.38),  # crash
    (8.0, 10.0, 'C06', 1.12, 1.32, 0.5, 0.5, 0.55, 0.52),  # fpv
    (10.0, 12.0, 'C07', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (12.0, 13.0, 'C08', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (13.0, 14.0, 'C09', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (14.0, 16.0, 'C10', 1.12, 1.32, 0.5, 0.5, 0.55, 0.52),  # fpv
    (16.0, 17.0, 'C11', 1.12, 1.32, 0.5, 0.5, 0.55, 0.52),  # fpv
    (17.0, 18.0, 'C12', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (18.0, 20.0, 'C13', 1.3, 1.02, 0.5, 0.5, 0.5, 0.5),  # pull
    (20.0, 22.0, 'C14', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (22.0, 23.0, 'C15', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (23.0, 24.0, 'C16', 1.04, 1.06, 0.5, 0.5, 0.5, 0.5),  # still
    (24.0, 26.0, 'C17', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (26.0, 27.0, 'C18', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (27.0, 28.0, 'C19', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (28.0, 30.0, 'C20', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (30.0, 32.0, 'C21', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (32.0, 34.0, 'C22', 1.12, 1.32, 0.5, 0.5, 0.55, 0.52),  # fpv
    (34.0, 36.0, 'C23', 1.0, 1.45, 0.5, 0.5, 0.42, 0.38),  # crash
    (36.0, 38.0, 'C24', 1.06, 1.1, 0.5, 0.5, 0.5, 0.5),  # slow
    (38.0, 40.0, 'C25', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (40.0, 41.0, 'C26', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (41.0, 42.0, 'C27', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (42.0, 43.0, 'C28', 1.12, 1.32, 0.5, 0.5, 0.55, 0.52),  # fpv
    (43.0, 44.0, 'C29', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (44.0, 46.0, 'C30', 1.3, 1.02, 0.5, 0.5, 0.5, 0.5),  # pull
    (46.0, 48.0, 'C31', 1.18, 1.18, 0.4, 0.6, 0.5, 0.5),  # pan_r
    (48.0, 52.0, 'C32', 1.06, 1.1, 0.5, 0.5, 0.5, 0.5),  # slow
    (52.0, 54.0, 'C33', 1.03, 1.15, 0.5, 0.5, 0.48, 0.46),  # push
    (54.0, 56.0, 'C34', 1.04, 1.06, 0.5, 0.5, 0.5, 0.5),  # still
    (56.0, 60.0, 'C35', 1.3, 1.02, 0.5, 0.5, 0.5, 0.5),  # pull
]
SHAKE = [(8.0, 0.3, 14), (38.0, 0.3, 14), (56.0, 0.25, 8)]
TITLES = [(56.6, 59.9, 'Your turn.', 'super')]
EVENTS = {'fps': FPS, 'bpm': BPM, 'dur': DUR, 'events': [
    {'t': 8.0, 'k': 'drop'}, {'t': 36.0, 'k': 'vac'}, {'t': 38.0, 'k': 'lift'}, {'t': 56.0, 'k': 'end'},
    {'t': 2.0, 'k': 'click', 'w': 1.2, 'note': 'visor down'}, {'t': 8.0, 'k': 'riser', 'dur': 2.0, 'w': 0.9}, {'t': 8.0, 'k': 'impact', 'w': 1.0},
    {'t': 13.0, 'k': 'whoosh', 'dir': 'right', 'w': 0.9}, {'t': 18.0, 'k': 'whoosh', 'dir': 'right', 'w': 0.8},
    {'t': 22.0, 'k': 'tick', 'w': 0.9}, {'t': 24.0, 'k': 'whip', 'dir': 'right', 'w': 0.9}, {'t': 27.0, 'k': 'whoosh', 'dir': 'right', 'w': 0.9},
    {'t': 30.0, 'k': 'whoosh', 'dir': 'left', 'w': 0.7}, {'t': 36.0, 'k': 'riser', 'dur': 2.0, 'w': 0.8}, {'t': 38.0, 'k': 'impact', 'w': 1.1},
    {'t': 40.0, 'k': 'whip', 'dir': 'right', 'w': 0.8}, {'t': 42.0, 'k': 'whoosh', 'dir': 'right', 'w': 0.6}, {'t': 56.0, 'k': 'impact', 'w': 0.9},
]}
LINES = []
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
        if t >= 56.3:  # logo in the clear sky of C35
            alpha = min(1, (t - 56.3) / .6)
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
    duck = '+'.join(f'between(t,{t-0.1:.2f},{t+1.6:.2f})' for t, *_ in LINES) or '0'
    graph = ''.join(c + ';' for c in chains) + f"[0]volume='if({duck},0.45,1)':eval=frame[m];[m]{''.join(labels)}amix=inputs={1+len(labels)}:normalize=0:duration=first[a]"
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
    final = OUT/'OPENSKY-animatic-v2.mp4'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(OUT/'picture.mp4'), '-i', str(OUT/'mix.wav'), '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k',
                    '-shortest', str(final)], check=True)
    print(final)
