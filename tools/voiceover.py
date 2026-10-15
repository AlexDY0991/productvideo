"""English documentary narration for "Looking Up" (local neural TTS: Kokoro-82M, ONNX).

Each subtitle cue gets a spoken line (years and names spelled for the voice). Every clip is
generated, trimmed and, if needed, re-generated slightly faster so it fits its subtitle window.
The clips are assembled on the film timeline, processed (EQ, compression, a touch of room),
and mixed with the score, which ducks under the voice.

Usage:
  python3 tools/voiceover.py --model <dir with model.onnx + voices.npz> [--voice am_michael] [--lang en-us]
Outputs: out/audio/vo.wav, out/audio/mix.wav, film/assets/audio/score.m4a
"""
import argparse
import json
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf

ROOT = Path(__file__).resolve().parent.parent
TL = json.loads((ROOT / 'out' / 'timeline.json').read_text())
SR_OUT = 48000

# Spoken versions of the English subtitles (same order as SUBS in film/src/script.js)
SPOKEN = [
    "Long ago, someone looked up for the first time.",
    "Birds crossed the sky. From that moment, humankind had a dream.",
    "In Greek myth, Icarus bound feathers with wax, and flew toward the sun.",
    "The wax melted, and he fell into the sea. But the dream never fell.",
    "On the walls of Doon-hwahng, the apsaras need no wings.",
    "They dance across the sky, on ribbons and wind.",
    "Mo-zee records that Loo Bahn carved a magpie from bamboo and wood.",
    "Once finished, it flew, and stayed aloft for three days.",
    "And with the kite, we first tied our wishes to the sky.",
    "One string. One end in the hand, the other in the clouds.",
    "Fifteen oh five. Leonardo da Vinci writes the Codex on the Flight of Birds.",
    "He watched, measured, and drew, translating the secrets of birds into machines.",
    "The flapping wings and spirals on his pages would wait four hundred years.",
    "Sky lanterns rise. Warm air, lifting light.",
    "We began to believe that something lighter than air could carry us up.",
    "Paris, seventeen eighty-three. A Mon-gol-fee-ay balloon carries two men aloft.",
    "For the first time, humans left the ground.",
    "The seventeenth of December, nineteen oh three. Kitty Hawk, North Carolina.",
    "Spruce, muslin, and a twelve-horsepower engine.",
    "Twelve seconds. One hundred and twenty feet. Powered flight begins.",
    "Just eleven years later, aircraft were sent to war.",
    "Wood, canvas and wire matured fast, in the smoke of war.",
    "The sky became a nation's frontier.",
    "Aluminium and rivets turned adventure into travel.",
    "Nineteen twenty-seven. Lindbergh flies the Atlantic, alone.",
    "Nineteen thirty-six. The D C three enters service, and the sky begins to belong to passengers.",
    "Wind tunnels. Blueprints. Slide rules.",
    "October the fourteenth, nineteen forty-seven. The X one breaks the sound barrier.",
    "Nineteen fifty-two. The first jet airliner enters service.",
    "Nineteen sixty-nine. Concorde flies, built for twice the speed of sound.",
    "Nineteen thirty-nine. Sikorsky's V S three hundred lifts straight up.",
    "Leonardo's paper spiral finally began to turn.",
    "Flight no longer needed a runway.",
    "Nineteen fifty-seven. The first satellite crosses the night sky.",
    "Nineteen sixty-one. Yuri Gagarin says: Pah-yeh-hah-lee. Let's go!",
    "The twentieth of July, nineteen sixty-nine. Humans set foot on the Moon.",
    "In those same years, we looked back at the Earth, for the first time.",
    "We had been living in the sky, all along.",
    "Carbon fibre. Brushless motors. Digital flight control.",
    "Sensors correcting a thousand times a second made flight steadier than ever.",
    "Flight passed from the tools of nations and industry, back into everyone's hands.",
    "For thousands of years, in every age, someone has looked up at the sky.",
    "That gaze has never fallen.",
    "Now, it's your turn.",
    "As high as free will can reach.",
]


def parse_voice(spec, voices):
    style = None
    for part in spec.split(','):
        name, _, w = part.partition(':')
        v = voices[name] * float(w or 1)
        style = v if style is None else style + v
    return style


def trim(a, sr, thr=0.008, pad=0.06):
    idx = np.where(np.abs(a) > thr)[0]
    if not len(idx):
        return a
    s, e = max(0, idx[0] - int(pad * sr)), min(len(a), idx[-1] + int(pad * 2 * sr))
    return a[s:e]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True)
    ap.add_argument('--voice', default='am_michael')          # chosen narrator; weighted blends like 'bm_george:0.55,bm_lewis:0.45' also work
    ap.add_argument('--lang', default='en-us')
    ap.add_argument('--speed', type=float, default=0.9)
    ap.add_argument('--clips', default=str(ROOT / 'out' / 'audio' / 'vo_clips'))
    args = ap.parse_args()
    from kokoro_onnx import Kokoro
    md = Path(args.model)
    k = Kokoro(str(md / 'model.onnx'), str(md / 'voices.npz'))
    voices = dict(np.load(md / 'voices.npz'))
    style = parse_voice(args.voice, voices)
    subs = TL['subs']
    assert len(subs) == len(SPOKEN), (len(subs), len(SPOKEN))
    clipdir = Path(args.clips)
    clipdir.mkdir(parents=True, exist_ok=True)
    N = int(TL['duration'] * SR_OUT)
    vo = np.zeros(N, np.float32)
    report = []
    prev_end = 0.0
    for i, (s, text) in enumerate(zip(subs, SPOKEN)):
        nxt = subs[i + 1]['a'] if i + 1 < len(subs) else TL['duration']
        end_limit = min(nxt - 0.2, s['b'] + 0.9)
        GAP = 0.45                                           # minimum breath between lines
        start = max(s['a'] - 0.1, prev_end + GAP)
        earliest = max(prev_end + GAP, s['a'] - 1.2)        # may begin a little early if the previous line is done
        speed = args.speed
        for attempt in range(5):
            a, sr = k.create(text, voice=style, speed=speed, lang=args.lang)
            a = trim(np.asarray(a, np.float32), sr)
            dur = len(a) / sr
            if start + dur > end_limit:
                start = max(earliest, end_limit - dur)
            if start + dur <= end_limit or speed >= 1.1:
                break
            speed = min(1.1, speed * (dur / (end_limit - start)) * 1.02)
        window = end_limit - start
        # resample 24k → 48k (linear is adequate here; the voice is band-limited)
        x = np.interp(np.arange(int(len(a) * SR_OUT / sr)) / SR_OUT, np.arange(len(a)) / sr, a).astype(np.float32)
        sf.write(clipdir / f'{i:02d}.wav', x, SR_OUT)
        i0 = int(start * SR_OUT)
        n = min(len(x), N - i0)
        vo[i0:i0 + n] += x[:n]
        prev_end = start + dur
        report.append((i, round(start, 2), round(dur, 2), round(window, 2), round(speed, 3), text[:48]))
        print(f'{i:02d} @{start:7.2f}s  {dur:5.2f}s / {window:5.2f}s  speed {speed:.3f}  {text[:60]}')
    out = ROOT / 'out' / 'audio'
    raw = out / 'vo_raw.wav'
    sf.write(raw, vo, SR_OUT)
    (out / 'vo_report.json').write_text(json.dumps(report, ensure_ascii=False, indent=1))
    # documentary voice chain: rumble cut, warmth, presence, de-harsh, compression, a little room
    chain = ('highpass=f=75,equalizer=f=140:t=q:w=1.0:g=3,equalizer=f=3200:t=q:w=1.4:g=2.0,'
             'equalizer=f=7500:t=q:w=2:g=-2.5,acompressor=threshold=-22dB:ratio=3:attack=8:release=180:makeup=3,'
             'aecho=0.85:0.5:32|57:0.10|0.06,loudnorm=I=-17:TP=-2:LRA=9')
    vo_wav = out / 'vo.wav'
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(raw), '-af', chain, '-ar', str(SR_OUT), '-ac', '1', str(vo_wav)], check=True)
    # mix: score ducks under the narration
    mix = out / 'mix.wav'
    fc = ('[1:a]aformat=channel_layouts=stereo,asplit=2[v1][v2];'
          '[0:a][v1]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=500:makeup=1[duck];'
          '[duck][v2]amix=inputs=2:weights=1 1.15:normalize=0,loudnorm=I=-16:TP=-1.5:LRA=11[m]')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(out / 'score.wav'), '-i', str(vo_wav), '-filter_complex', fc,
                    '-map', '[m]', '-ar', str(SR_OUT), str(mix)], check=True)
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', str(mix), '-c:a', 'aac', '-b:a', '192k', str(ROOT / 'film' / 'assets' / 'audio' / 'score.m4a')], check=True)
    print('wrote', vo_wav.relative_to(ROOT), mix.relative_to(ROOT))


if __name__ == '__main__':
    main()
