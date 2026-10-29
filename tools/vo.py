#!/usr/bin/env python3
"""Temp voice-over for drafts: Kokoro TTS (Apache-2.0), then a Whisper read-back of every take.

Usage: vo.py LINES.json OUTDIR [--voice am_michael] [--speed 0.9]
LINES.json maps a key to its line, e.g. {"vo1": "Out here, mornings don't rush."}.
Writes OUTDIR/<key>_<voice>.wav and prints duration plus what Whisper heard, so a take
that drops or mangles a word is caught before it goes into a cut. Run with the tool venv
(tools/setup.sh); the model files live in $COOLFLY_TOOLS/kokoro-model.
Drafts only: the release voice is a professional read.
"""
import argparse
import json
import os
import re
from pathlib import Path

import numpy as np
import soundfile as sf

TOOLS = Path(os.environ.get('COOLFLY_TOOLS', '/tmp/coolfly-tools'))


def words(text):
    return re.sub(r"[^a-z0-9' ]", ' ', text.lower()).split()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('lines'); ap.add_argument('out')
    ap.add_argument('--voice', default='am_michael'); ap.add_argument('--speed', type=float, default=0.9)
    a = ap.parse_args()
    from kokoro_onnx import Kokoro
    from faster_whisper import WhisperModel
    lines = json.loads(Path(a.lines).read_text())
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    tts = Kokoro(str(TOOLS/'kokoro-model/kokoro-v1.0.onnx'), str(TOOLS/'kokoro-model/voices-v1.0.bin'))
    asr = WhisperModel('small.en', device='cpu', compute_type='int8')
    bad = 0
    for key, text in lines.items():
        audio, sr = tts.create(text, voice=a.voice, speed=a.speed, lang='en-us')
        sf.write(out/f'{key}_{a.voice}.wav', audio, sr)
        x = np.interp(np.linspace(0, len(audio) - 1, int(len(audio) * 16000 / sr)), np.arange(len(audio)), audio).astype(np.float32)
        heard = ' '.join(s.text.strip() for s in asr.transcribe(x, beam_size=5)[0])
        ok = words(heard) == words(text)
        bad += not ok
        print(f'{key:6} {len(audio)/sr:5.2f}s  {"ok " if ok else "CHECK"}  {heard}')
    if bad:
        raise SystemExit(f'{bad} take(s) differ from the script; listen and re-run them')


if __name__ == '__main__':
    main()
