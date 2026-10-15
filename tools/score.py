"""Procedural score + sound design for "Looking Up", locked to the film's timeline.

Everything is synthesised with numpy/scipy (no samples): pads, piano, plucked strings,
FM bells, percussion, engines, wind, water, rotors, the sonic boom, risers and impacts.

Usage:  python3 tools/score.py            → out/audio/score.wav  (+ film/assets/audio/score.m4a)
"""
import json
import subprocess
from pathlib import Path

import numpy as np
from scipy.signal import butter, lfilter, fftconvolve, sosfilt

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
TL = json.loads((ROOT / 'out' / 'timeline.json').read_text())
DUR = TL['duration']
C = TL['cues']
N = int(DUR * SR)
rng = np.random.default_rng(1903)

# buses: (dry, wet) stereo for music and sfx
BUS = {k: np.zeros((2, N), np.float32) for k in ('mus', 'mus_wet', 'sfx', 'sfx_wet')}


def add(bus, t0, sig, gain=1.0, pan=0.0, wet=0.35):
    """Place a mono (or stereo) signal at time t0 on a bus, with equal-power pan and a reverb send."""
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    if sig.ndim == 1:
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        sig = np.vstack([sig * l, sig * r])
    if i0 < 0:
        sig = sig[:, -i0:]
        i0 = 0
    n = min(sig.shape[1], N - i0)
    BUS[bus][:, i0:i0 + n] += sig[:, :n] * gain * (1 - wet * 0.5)
    BUS[bus + '_wet'][:, i0:i0 + n] += sig[:, :n] * gain * wet


def tt(d):
    return np.arange(int(d * SR)) / SR


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


NOTE = {'C': 0, 'C#': 1, 'Db': 1, 'D': 2, 'D#': 3, 'Eb': 3, 'E': 4, 'F': 5, 'F#': 6, 'Gb': 6, 'G': 7, 'G#': 8, 'Ab': 8, 'A': 9, 'A#': 10, 'Bb': 10, 'B': 11}


def nf(name):
    p = name[:-1]
    o = int(name[-1])
    return midi(12 * (o + 1) + NOTE[p])


def lp(x, fc, order=2):
    b, a = butter(order, min(fc, SR * 0.45) / (SR / 2), 'low')
    return lfilter(b, a, x)


def hp(x, fc, order=2):
    b, a = butter(order, fc / (SR / 2), 'high')
    return lfilter(b, a, x)


def bp(x, f1, f2, order=2):
    sos = butter(order, [f1 / (SR / 2), min(f2, SR * 0.45) / (SR / 2)], 'band', output='sos')
    return sosfilt(sos, x)


def env_adsr(n, a, d, s, r, total):
    t = np.arange(n) / SR
    e = np.where(t < a, t / max(a, 1e-4), 1.0)
    e = np.where((t >= a) & (t < a + d), 1 - (1 - s) * (t - a) / max(d, 1e-4), e)
    e = np.where(t >= a + d, s, e)
    rel = np.clip((total - t) / max(r, 1e-4), 0, 1)
    return e * rel


def fade(n, fi, fo):
    e = np.ones(n)
    a, b = int(fi * SR), int(fo * SR)
    if a:
        e[:a] = np.linspace(0, 1, a) ** 2
    if b:
        e[-b:] *= np.linspace(1, 0, b) ** 2
    return e


def noise(d):
    return rng.standard_normal(int(d * SR))


def pink(d):
    w = rng.standard_normal(int(d * SR))
    b = [0.049922035, -0.095993537, 0.050612699, -0.004408786]
    a = [1, -2.494956002, 2.017265875, -0.522189400]
    return lfilter(b, a, w) * 4


# ---------------------------------------------------------------------------
# Instruments
def saw(f, t, phase=0.0):
    return 2 * ((f * t + phase) % 1.0) - 1


def pad(notes, d, a=2.5, r=3.0, bright=1800, detune=0.006, vib=0.0, gain=1.0):
    t = tt(d)
    out = np.zeros_like(t)
    for f in notes:
        for k, dt in enumerate((-detune, 0, detune)):
            ff = f * (1 + dt) * (1 + vib * 0.004 * np.sin(2 * np.pi * (4.7 + k * 0.3) * t))
            out += saw(ff, t, rng.random()) * (0.6 if dt else 1)
    out = lp(out, bright, 2)
    out = lp(out, bright * 1.6, 1)
    out *= env_adsr(len(t), a, 0.5, 0.9, r, d) / (len(notes) * 2.2)
    return out * gain


def strings(notes, d, a=3.0, r=3.5, gain=1.0):
    return pad(notes, d, a, r, bright=2600, detune=0.004, vib=1.0, gain=gain)


def piano(f, d=4.0, vel=0.8):
    t = tt(d)
    B = 0.00035
    out = np.zeros_like(t)
    tau0 = 2.6 * (261 / f) ** 0.35
    for n in range(1, 11):
        fn = n * f * np.sqrt(1 + B * n * n)
        if fn > 12000:
            break
        out += np.sin(2 * np.pi * fn * t + rng.random()) * (1 / n ** 1.15) * np.exp(-t / (tau0 / (1 + 0.45 * n)))
    hammer = lp(noise(0.02), 3000) * np.exp(-tt(0.02) / 0.004) * 0.3
    out[:len(hammer)] += hammer
    out *= np.minimum(1, t / 0.003) * vel * 0.32
    return out


def pluck(f, d=2.5, bright=0.6, decay=0.996):
    n = int(d * SR)
    L = int(SR / f)
    x = np.zeros(n)
    exc = rng.uniform(-1, 1, L)
    exc = lp(exc, 800 + 6000 * bright)
    x[:L] = exc
    a = np.zeros(L + 2)
    a[0] = 1
    a[L] = -decay * 0.5
    a[L + 1] = -decay * 0.5
    y = lfilter([1], a, x)
    return y * 0.5


def bell(f, d=3.5, idx=3.0, ratio=3.5, vel=0.6):
    t = tt(d)
    ind = idx * np.exp(-t / 0.9)
    y = np.sin(2 * np.pi * f * t + ind * np.sin(2 * np.pi * f * ratio * t))
    return y * np.exp(-t / 1.4) * np.minimum(1, t / 0.002) * vel * 0.35


def flute(f, d, vel=0.5):
    t = tt(d)
    v = 1 + 0.006 * np.sin(2 * np.pi * 5.2 * t) * np.minimum(1, t / 0.6)
    y = np.sin(2 * np.pi * f * v * t) + 0.25 * np.sin(4 * np.pi * f * v * t) + 0.08 * np.sin(6 * np.pi * f * v * t)
    breath = bp(noise(d), f * 0.8, f * 3) * 0.08
    return (y + breath) * env_adsr(len(t), 0.12, 0.2, 0.85, 0.35, d) * vel * 0.3


def timpani(f, d=2.5, vel=1.0):
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t / 0.04))) / SR
    y = np.sin(ph) * np.exp(-t / 0.9) + 0.4 * np.sin(1.5 * ph) * np.exp(-t / 0.5)
    y += lp(noise(d), 900) * np.exp(-t / 0.08) * 0.5
    return y * vel * 0.6


def kick(d=0.5, vel=1.0):
    t = tt(d)
    ph = 2 * np.pi * np.cumsum(42 + 90 * np.exp(-t / 0.03)) / SR
    y = np.sin(ph) * np.exp(-t / 0.22)
    y[:200] += rng.uniform(-1, 1, 200) * np.linspace(0.5, 0, 200)
    return y * vel * 0.9


def boom(d=4.0, vel=1.0):
    t = tt(d)
    low = np.sin(2 * np.pi * np.cumsum(30 + 40 * np.exp(-t / 0.15)) / SR) * np.exp(-t / 1.1)
    crack = lp(noise(d), 2500) * np.exp(-t / 0.12)
    rumble = lp(noise(d), 160) * np.exp(-t / 1.5) * 3
    return (low * 1.2 + crack * 0.6 + rumble * 0.5) * vel * 0.8


def riser(d, f0=200, f1=4000, vel=1.0):
    """Filtered-noise sweep + rising saw cluster."""
    n = int(d * SR)
    out = np.zeros(n)
    w = noise(d)
    blk = SR // 20
    zi = None
    for i in range(0, n, blk):
        k = i / n
        fc = f0 * (f1 / f0) ** (k ** 1.6)
        b, a = butter(2, [max(30, fc * 0.6) / (SR / 2), min(SR * 0.45, fc * 1.4) / (SR / 2)], 'band')
        seg_, zi = lfilter(b, a, w[i:i + blk], zi=zi if zi is not None else np.zeros(max(len(a), len(b)) - 1))
        out[i:i + blk] = seg_
    t = tt(d)
    pitch = 110 * 2 ** (2.5 * (t / d) ** 2)
    sw = sum(saw(pitch * m, t) for m in (1, 1.5, 2.01)) / 3
    sw = lp(sw, 3000)
    e = (t / d) ** 2.2
    return (out * 2.2 + sw * 0.35) * e * vel


def wind(d, level=1.0, rate=0.15):
    t = tt(d)
    w = lp(pink(d), 900) + lp(hp(noise(d), 1200), 3000) * 0.08
    am = 0.6 + 0.4 * np.sin(2 * np.pi * rate * t + rng.random() * 6) * np.sin(2 * np.pi * rate * 0.37 * t + 1)
    return w * am * level * 0.25


def chirp(f0=3200, f1=4800, d=0.09):
    t = tt(d)
    f = f0 + (f1 - f0) * (t / d) + 300 * np.sin(2 * np.pi * 40 * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.sin(np.pi * t / d) * 0.2


def knock(f=520, vel=1.0):
    d = 0.35
    t = tt(d)
    y = bp(noise(d), f * 0.8, f * 1.3) * np.exp(-t / 0.03) * 3 + np.sin(2 * np.pi * f * t) * np.exp(-t / 0.06)
    return y * vel * 0.5


def engine_putter(d, rate=9.0, level=1.0):
    """1903 four-cylinder: irregular firing pulses + prop whirr."""
    n = int(d * SR)
    y = np.zeros(n)
    t0 = 0.0
    while t0 < d:
        i = int(t0 * SR)
        L = int(0.05 * SR)
        p = lp(noise(0.05), 600) * np.exp(-tt(0.05) / 0.012) + np.sin(2 * np.pi * 70 * tt(0.05)) * np.exp(-tt(0.05) / 0.02)
        y[i:i + L] += p[:max(0, min(L, n - i))]
        t0 += 1 / rate * (1 + rng.uniform(-0.08, 0.08))
    t = tt(d)
    whirr = bp(noise(d), 120, 400) * (0.5 + 0.5 * np.sin(2 * np.pi * rate * 2 * t)) * 0.6
    return (y + whirr) * level * 0.5


def radial_drone(d, f0=24, level=1.0, dopp=None):
    t = tt(d)
    f = f0 * (np.ones_like(t) if dopp is None else dopp(t / d))
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = sum(np.sin(ph * k + k) / k ** 0.7 for k in range(1, 14))
    y = lp(y, 1400) + bp(noise(d), 200, 900) * 0.3
    return y * level * 0.12


def rotor(d, f_start=2, f_end=6, level=1.0, center=600):
    t = tt(d)
    f = f_start + (f_end - f_start) * np.minimum(1, (t / d) * 1.4)
    ph = np.cumsum(f) / SR
    chop = (0.5 + 0.5 * np.cos(2 * np.pi * ph)) ** 6
    w = bp(noise(d), center * 0.3, center * 1.6)
    thump = lp(noise(d), 120) * chop * 2
    return (w * (0.3 + 0.7 * chop) + thump) * level * 0.35


def jet(d, level=1.0, bright=1.0):
    t = tt(d)
    y = lp(noise(d), 500 + 1500 * bright) * 0.8 + bp(noise(d), 1800, 6000) * 0.25 * bright
    return y * level * 0.4


def motor_whine(d, f0=300, f1=900, level=1.0):
    t = tt(d)
    f = f0 + (f1 - f0) * (t / d)
    ph = 2 * np.pi * np.cumsum(f) / SR
    y = np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.25 * np.sin(3 * ph + 1)
    return y * level * 0.06


def blip(f, d=0.06, vel=0.3):
    t = tt(d)
    return np.sign(np.sin(2 * np.pi * f * t)) * np.exp(-t / 0.02) * vel * 0.2


def crowd(d, level=1.0):
    t = tt(d)
    y = sum(bp(noise(d), 250 * k, 400 * k) * (0.5 + 0.5 * np.sin(2 * np.pi * (0.8 + k * 0.3) * t + k)) for k in (1, 1.6, 2.4))
    return y * level * 0.25


def water(d, level=1.0):
    t = tt(d)
    y = lp(pink(d), 700) * (0.6 + 0.4 * np.sin(2 * np.pi * 0.12 * t)) + hp(noise(d), 3000) * 0.04 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.3 * t))
    return y * level * 0.3


def crackle(d, density=12, level=1.0):
    n = int(d * SR)
    y = np.zeros(n)
    for _ in range(int(d * density)):
        i = rng.integers(0, max(1, n - 400))
        y[i:i + 300] += hp(noise(300 / SR), 2000) * np.exp(-np.arange(300) / 40) * rng.uniform(0.2, 1)
    return y * level * 0.3


def arp(chord, d, rate, inst='pluck', vel=0.5, pattern=None, octave=1):
    """Repeating arpeggio over a chord (list of Hz) for d seconds at `rate` notes/s."""
    n = int(d * SR)
    y = np.zeros(n)
    seq = pattern or [0, 1, 2, 3, 2, 1]
    k = 0
    tnote = 0.0
    while tnote < d:
        f = chord[seq[k % len(seq)] % len(chord)] * octave
        if inst == 'pluck':
            s = pluck(f, 1.6, 0.7)
        elif inst == 'harpsi':
            s = msum(pluck(f, 1.2, 1.0, 0.993), pluck(f * 2, 0.8, 1.0, 0.99) * 0.3)
        elif inst == 'celesta':
            s = bell(f * 2, 1.6, 1.2, 4.0, 0.5)
        elif inst == 'synth':
            tn = tt(0.22)
            s = lp(saw(f, tn) + saw(f * 1.005, tn), 2400) * np.exp(-tn / 0.08) * 0.5
        else:
            s = piano(f, 1.8, 0.5)
        i = int(tnote * SR)
        L = min(len(s), n - i)
        if L > 0:
            y[i:i + L] += s[:L] * vel
        k += 1
        tnote += 1 / rate
    return y


def msum(*sigs):
    n = max(len(x) for x in sigs)
    out = np.zeros(n)
    for x in sigs:
        out[:len(x)] += x
    return out


def ch(*names):
    return [nf(x) for x in names]


GAZE = ['A3', 'D4', 'E4', 'A4']          # the rising "looking up" motif


def gaze_motif(t0, gain=1.0, resolve='F#5', step=0.42, inst='piano'):
    for i, nme in enumerate(GAZE):
        f = nf(nme)
        add('mus', t0 + i * step, piano(f, 3.5, 0.75) if inst == 'piano' else bell(f, 3, 1.5, 3.0, 0.7), gain, pan=-0.15 + i * 0.1, wet=0.5)
    if resolve:
        add('mus', t0 + len(GAZE) * step + 0.15, piano(nf(resolve), 5, 0.7), gain * 0.9, 0.2, wet=0.6)


# ===========================================================================
# THE SCORE
# Prologue ---------------------------------------------------------------
add('mus', 0.5, pad(ch('D2', 'A2'), 14, 6, 4, 600), 0.6, wet=0.6)
add('mus', 2.0, strings(ch('D3', 'A3', 'E4', 'F4'), 12.5, 5, 2.5), 0.55, wet=0.6)
add('sfx', 0.0, wind(20, 0.8) * fade(int(20 * SR), 3, 3), 0.8, wet=0.2)
for i in range(14):
    add('sfx', 5.0 + i * 0.7 + rng.uniform(0, 0.4), chirp(rng.uniform(2600, 3600), rng.uniform(4000, 5200), rng.uniform(0.06, 0.12)), 0.35, pan=rng.uniform(-0.6, 0.6), wet=0.5)
gaze_motif(8.6, 0.8, resolve=None)
add('mus', C['titleHit'], strings(ch('D2', 'A2', 'D3', 'F#3', 'A3', 'E4', 'F#4', 'A4'), 9.5, 1.8, 4), 0.75, wet=0.6)
add('mus', C['titleHit'], bell(nf('F#5'), 5, 2, 3.5, 0.8), 0.6, 0.2, wet=0.7)
add('mus', C['titleHit'], piano(nf('D3'), 6, 0.9), 0.7, -0.2, wet=0.5)

# I · Myth --------------------------------------------------------------
add('mus', 19.0, pad(ch('D3', 'F3', 'A3', 'C4', 'E4'), 7.5, 2.5, 2.5, 1400), 0.55, wet=0.5)
add('mus', 25.6, pad(ch('A#2', 'F3', 'A3', 'D4', 'E4'), 6.4, 1.5, 2.0, 1200), 0.55, wet=0.5)
penta = ch('D4', 'E4', 'G4', 'A4', 'C5', 'D5', 'E5')
for i, k in enumerate([0, 1, 2, 3, 4, 5, 6, 5]):                      # rising guqin phrase
    add('mus', 20.6 + i * 0.6, pluck(penta[k], 2.4, 0.45, 0.997), 0.55, pan=-0.3 + k * 0.08, wet=0.45)
for i, k in enumerate([6, 4, 3, 1, 0]):                               # falling
    add('mus', 26.2 + i * 0.85, pluck(penta[k] / 2, 2.6, 0.4, 0.997), 0.5, pan=0.3 - k * 0.08, wet=0.5)
add('sfx', 20.0, wind(11, 0.6, 0.3), 0.7, wet=0.2)
add('sfx', C['splash'], lp(noise(1.6), 1800) * np.exp(-tt(1.6) / 0.35), 0.35, pan=0.4, wet=0.3)
add('mus', 30.5, pad(ch('G2', 'D3', 'F3', 'A3', 'A#3'), 6.6, 2.0, 2.0, 1500), 0.5, wet=0.55)
add('mus', 36.6, pad(ch('F2', 'C3', 'E3', 'G3', 'A3'), 6.4, 2.0, 2.5, 1500), 0.5, wet=0.55)
mel = [('A4', 0.9), ('C5', 0.6), ('D5', 1.2), ('E5', 0.8), ('D5', 0.6), ('C5', 0.6), ('A4', 1.4), ('G4', 0.8), ('A4', 2.0)]
tm = 31.8
for nme, dd in mel:
    add('mus', tm, flute(nf(nme), dd * 1.15, 0.6), 0.55, 0.2, wet=0.55)
    tm += dd
for i in range(16):
    add('mus', 31.5 + i * 0.65 + rng.uniform(0, 0.3), bell(rng.choice(penta) * 2, 2.5, 1.2, 3.0, 0.4), 0.25, pan=rng.uniform(-0.7, 0.7), wet=0.7)
add('mus', 41.5, pad(ch('D3', 'A3', 'D4', 'F4'), 6, 2.0, 2.0, 1200), 0.5, wet=0.5)
add('mus', 47.0, pad(ch('C3', 'G3', 'C4', 'E4'), 5.5, 1.5, 2.0, 1200), 0.5, wet=0.5)
for i in range(3):
    add('sfx', C['magpieAssemble'] - 0.4 + i * 0.45, knock(560 + i * 60), 0.5, pan=-0.1 + i * 0.1, wet=0.3)
add('sfx', C['sealStamp'], knock(180, 1.2), 0.5, wet=0.2)
add('sfx', C['sealStamp'], lp(noise(0.2), 400) * np.exp(-tt(0.2) / 0.03), 0.5, wet=0.2)
for i in range(10):                                                   # brush strokes
    s = bp(noise(0.5), 1500, 5000) * np.sin(np.pi * tt(0.5) / 0.5) ** 2
    add('sfx', 42.4 + i * 0.36, s, 0.08, pan=rng.uniform(-0.3, 0.3), wet=0.2)
add('mus', 51.5, pad(ch('A#2', 'F3', 'A3', 'C4', 'D4'), 6.5, 2.0, 2.0, 1600), 0.5, wet=0.55)
add('mus', 57.5, pad(ch('A2', 'E3', 'A3', 'D4', 'E4'), 5.5, 2.0, 2.0, 1600), 0.5, wet=0.55)
gaze_motif(53.0, 0.75, resolve='E5')
add('sfx', 52.0, wind(10, 0.5, 0.4), 0.6, wet=0.2)

# II · Codex -------------------------------------------------------------
prog = [ch('D3', 'F3', 'A3', 'D4'), ch('C3', 'E3', 'G3', 'C4'), ch('A#2', 'D3', 'F3', 'A#3'), ch('A2', 'C#3', 'E3', 'A3')]
for i in range(8):
    c_ = prog[i % 4]
    add('mus', 62.0 + i * 2.75, arp(c_, 2.75, 5.8, 'harpsi', 0.45, [0, 1, 2, 3, 2, 1], octave=1), 0.5, pan=-0.15, wet=0.35)
    add('mus', 62.0 + i * 2.75, strings([c_[0] / 2, c_[2]], 3.2, 1.0, 1.2), 0.32, wet=0.5)
for a_, b_ in ((62.2, 64.6), (66.2, 69.0), (73.2, 77.2), (79.2, 82.6)):  # quill scratching
    d = b_ - a_
    nn = int(d * SR)
    g = np.resize((rng.random(int(d * 40) + 2) > 0.45).astype(float).repeat(SR // 40), nn)
    s = bp(noise(d), 2500, 7000)[:nn] * lp(g, 30)
    add('sfx', a_, s, 0.05, pan=0.1, wet=0.15)

# III · Lighter than air -------------------------------------------------
for i, c_ in enumerate([ch('F2', 'C3', 'E3', 'G3', 'A3'), ch('A2', 'E3', 'G3', 'C4'), ch('A#2', 'F3', 'A3', 'D4'), ch('C3', 'G3', 'C4', 'E4')]):
    add('mus', 83.5 + i * 2.6, pad(c_, 3.4, 1.0, 1.4, 1700), 0.5, wet=0.55)
for i in range(22):
    add('mus', 84.5 + i * 0.42 + rng.uniform(0, 0.2), bell(rng.choice(ch('C5', 'E5', 'G5', 'A5', 'C6')), 2.4, 1.0, 3.0, 0.35), 0.22, pan=rng.uniform(-0.8, 0.8), wet=0.75)
add('sfx', 84.0, crackle(10, 10, 0.5), 0.5, wet=0.2)
add('mus', 94.0, strings(ch('D3', 'A3', 'D4', 'F#4'), 5.5, 1.5, 1.5), 0.55, wet=0.5)
add('mus', 99.0, strings(ch('B2', 'D3', 'G3', 'B3', 'D4'), 4.0, 0.5, 1.2), 0.6, wet=0.5)
add('mus', 102.5, strings(ch('A2', 'E3', 'A3', 'D4', 'E4'), 2.0, 0.6, 0.6), 0.6, wet=0.5)
add('mus', 104.3, strings(ch('A2', 'E3', 'A3', 'C#4', 'E4'), 2.6, 0.4, 1.5), 0.6, wet=0.5)
add('sfx', C['burner'], lp(noise(2.2), 900) * env_adsr(int(2.2 * SR), 0.2, 0.3, 0.8, 0.8, 2.2), 0.45, wet=0.2)
add('sfx', 94.0, crowd(12, 0.6) * fade(int(12 * SR), 1.5, 1.5), 0.6, wet=0.3)
add('sfx', C['balloonLift'], crowd(3.5, 1.4) * env_adsr(int(3.5 * SR), 0.3, 0.6, 0.6, 1.5, 3.5), 0.6, wet=0.4)
gaze_motif(100.6, 0.7, resolve='F#5')

# IV · Twelve seconds ----------------------------------------------------
add('sfx', 106.0, wind(20, 0.9, 0.5), 0.8, wet=0.15)
add('sfx', C['wrightEngine'], engine_putter(C['wrightLand'] - C['wrightEngine'], 9.5, 1.0) * fade(int((C['wrightLand'] - C['wrightEngine']) * SR), 1.0, 0.4), 0.55, pan=0.1, wet=0.2)
add('mus', 106.0, piano(nf('B2'), 6, 0.6), 0.6, wet=0.5)
add('mus', 106.0, strings(ch('B2', 'F#3', 'B3', 'D4'), 6.7, 2.0, 1.5), 0.42, wet=0.5)
add('mus', C['wrightLift'], strings(ch('G2', 'D3', 'G3', 'B3', 'D4'), 4.8, 0.6, 1.2), 0.55, wet=0.5)
add('mus', 117.0, strings(ch('F#2', 'D3', 'A3', 'D4', 'F#4'), 4.2, 0.8, 1.2), 0.55, wet=0.5)
add('mus', 121.0, strings(ch('A2', 'E3', 'A3', 'C#4', 'E4'), 3.6, 0.8, 1.0), 0.6, wet=0.5)
gaze_motif(113.6, 0.75, resolve='B4')
shutter = hp(noise(0.05), 2000) * np.exp(-tt(0.05) / 0.006)
add('sfx', C['wrightLand'] + 0.1, shutter, 0.6, wet=0.2)
add('sfx', C['wrightLand'] + 0.16, shutter * 0.6, 0.6, wet=0.2)
add('mus', C['wrightLand'] + 0.1, pad(ch('D3', 'A3', 'E4', 'F#4'), 3.0, 0.3, 2.0, 1400), 0.5, wet=0.7)

# V · War ----------------------------------------------------------------
add('mus', 126.0, pad(ch('D2', 'D#2', 'A2'), 14, 1.5, 2.5, 500, detune=0.01), 0.7, wet=0.4)
add('mus', 126.5, strings(ch('D3', 'F3', 'A#3'), 13, 3, 2.5), 0.45, wet=0.5)
for i in range(7):
    add('mus', 126.2 + i * 2.0, timpani(nf('D2'), 2.4, 0.9 if i % 2 == 0 else 0.6), 0.65, -0.1, wet=0.4)
add('sfx', 126.0, radial_drone(14, 30, 1.0, lambda u: 1 + 0.05 * np.sin(u * 9)), 0.6, -0.3, wet=0.3)
add('sfx', 127.0, radial_drone(13, 36, 0.8, lambda u: 1.04 - 0.08 * u), 0.5, 0.4, wet=0.3)
for i in range(9):
    add('sfx', 126.8 + rng.uniform(0, 12.5), boom(2.5, rng.uniform(0.25, 0.6)), 0.5, pan=rng.uniform(-0.8, 0.8), wet=0.4)

# VI · Golden age --------------------------------------------------------
for i, c_ in enumerate([ch('D3', 'F#3', 'A3', 'D4'), ch('B2', 'D3', 'F#3', 'B3'), ch('G2', 'B2', 'D3', 'G3'), ch('A2', 'C#3', 'E3', 'A3'), ch('D3', 'F#3', 'A3', 'D4')]):
    t0 = 140.0 + i * 3.9
    add('mus', t0, arp(c_, 3.9 if i < 4 else 2.4, 4.6, 'celesta', 0.6, [0, 2, 3, 1, 2, 3], 1), 0.45, 0.15, wet=0.45)
    add('mus', t0, strings(c_, 4.4 if i < 4 else 2.6, 0.6, 1.0), 0.45, wet=0.45)
    for b_ in range(2):
        add('mus', t0 + b_ * 1.95, piano(c_[0] / 2, 2.0, 0.6), 0.5, -0.2, wet=0.4)
add('sfx', 140.5, radial_drone(9.5, 22, 1.0, lambda u: 1.05 - 0.1 * u), 0.55, 0.0, wet=0.3)
add('sfx', 151.0, radial_drone(7.0, 24, 1.3, lambda u: 1.08 - 0.18 * u) * np.sin(np.pi * tt(7.0) / 7.0) ** 1.5, 0.75, 0.2, wet=0.3)
gaze_motif(152.6, 0.75, resolve='F#5')

# VII · Beyond sound -----------------------------------------------------
add('sfx', 158.0, bp(noise(5.5), 400, 3000) * fade(int(5.5 * SR), 0.6, 1.2), 0.2, wet=0.2)
for i in range(4):
    c_ = [ch('E3', 'G3', 'B3', 'E4'), ch('C3', 'G3', 'C4', 'E4'), ch('A2', 'E3', 'A3', 'C4'), ch('B2', 'F#3', 'B3', 'D#4')][i]
    add('mus', 158.0 + i * 2.1, arp(c_, 2.1, 8, 'synth', 0.5, [0, 1, 2, 3], 1), 0.38, wet=0.3)
add('mus', 158.0, pad(ch('E2', 'B2', 'E3'), 8.6, 2, 0.6, 900), 0.45, wet=0.4)
add('sfx', 163.5, jet(3.0, 1.0, 0.6) * (tt(3.0) / 3.0) ** 2, 0.7, wet=0.2)
add('sfx', C['sonicBoom'] - 2.8, riser(2.8, 300, 5000, 0.5), 0.45, wet=0.2)
add('sfx', C['sonicBoom'], boom(5.0, 1.0), 1.0, wet=0.35)
add('mus', C['sonicBoom'] + 0.3, strings(ch('G2', 'D3', 'B3', 'D4', 'F#4'), 8.5, 1.2, 2.0), 0.6, wet=0.6)
add('mus', C['sonicBoom'] + 0.3, bell(nf('B5'), 4, 1.5, 3.5, 0.6), 0.35, 0.3, wet=0.7)
add('mus', 175.0, strings(ch('D2', 'A2', 'D3', 'A3', 'C#4', 'F#4', 'A4'), 5.6, 1.2, 1.4), 0.65, wet=0.55)
add('sfx', 174.6, jet(5.4, 1.0, 1.0) * fade(int(5.4 * SR), 1.0, 1.4), 0.6, wet=0.3)

# VIII · Vertical --------------------------------------------------------
add('mus', 180.0, pad(ch('E2', 'B2', 'E3', 'F#3', 'G3'), 7, 1.5, 1.5, 1300), 0.45, wet=0.5)
add('mus', 186.5, pad(ch('C3', 'G3', 'B3', 'D4', 'E4'), 7.5, 1.0, 2.5, 1500), 0.5, wet=0.5)
for i in range(6):                                                    # Leonardo's harpsichord returns
    add('mus', 185.6 + i * 0.68, arp(prog[i % 4], 0.68, 5.8, 'harpsi', 0.35, [0, 1, 2, 3]), 0.35, -0.25, wet=0.6)
add('sfx', C['heliSpin'], rotor(194 - C['heliSpin'], 1.5, 6.5, 1.0) * fade(int((194 - C['heliSpin']) * SR), 1.5, 1.0), 0.75, wet=0.25)
for i in range(10):
    add('sfx', 180.6 + i * 0.35, knock(1400 + i * 30, 0.4), 0.25, pan=0.2, wet=0.2)
add('sfx', C['heliLift'] - 2.0, riser(2.2, 150, 2000, 0.35), 0.35, wet=0.2)

# IX · Beyond the sky ----------------------------------------------------
add('mus', 194.0, pad(ch('A3', 'E4', 'B4'), 11, 3, 2, 2400), 0.3, wet=0.7)
for i in range(8):                                                    # Sputnik's beeps
    t0 = C['sputnik'] + i * 0.75
    tone = np.sin(2 * np.pi * (1000 if i % 2 else 820) * tt(0.32)) * fade(int(0.32 * SR), 0.005, 0.01)
    add('sfx', t0, tone, 0.1, 0.4, wet=0.4)
add('sfx', 200.0, bp(noise(5.4), 500, 4000) * fade(int(5.4 * SR), 0.4, 0.6) * (0.6 + 0.4 * np.sin(2 * np.pi * 7 * tt(5.4))), 0.06, wet=0.1)
add('mus', 200.0, strings(ch('F2', 'C3', 'A3', 'C4', 'E4'), 5.6, 1.5, 1.0), 0.5, wet=0.6)
add('sfx', C['launch'] - 0.4, (lp(noise(4.0), 180) * 3 + lp(noise(4.0), 900) * 0.6) * env_adsr(int(4.0 * SR), 0.5, 0.5, 1.0, 1.0, 4.0), 0.7, wet=0.3)
add('mus', C['launch'], strings(ch('D2', 'A2', 'D3', 'F#3', 'A3'), 3.3, 0.8, 0.8), 0.6, wet=0.5)
add('mus', C['moon'] + 0.3, pad(ch('A4', 'E5'), 2.8, 0.8, 1.0, 3000), 0.25, wet=0.8)
add('mus', C['earthrise'], strings(ch('D2', 'A2', 'D3', 'F#3', 'A3', 'E4', 'F#4', 'A4', 'D5'), 11.0, 3.0, 3.5), 0.75, wet=0.65)
add('mus', C['earthrise'] + 0.2, piano(nf('D3'), 6, 0.7), 0.5, wet=0.6)
for i, nme in enumerate(['F#5', 'E5', 'D5', 'A4']):
    add('mus', 216.8 + i * 0.9, piano(nf(nme), 4, 0.55), 0.55, 0.15, wet=0.6)

# X · Digital wings ------------------------------------------------------
add('sfx', 222.0, motor_whine(5.2, 220, 880, 1.0) * fade(int(5.2 * SR), 0.8, 0.8), 0.6, wet=0.2)
for i in range(30):
    add('sfx', 222.4 + rng.uniform(0, 4.6), blip(rng.choice([1760, 2093, 2637, 3136])), 0.25, pan=rng.uniform(-0.6, 0.6), wet=0.3)
beat = 60 / 120
dprog = [ch('D3', 'F3', 'A3', 'C4'), ch('A#2', 'D3', 'F3', 'A3'), ch('F2', 'A2', 'C3', 'F3'), ch('C3', 'E3', 'G3', 'C4')]
for bar in range(10):
    t0 = 222.0 + bar * 4 * beat
    c_ = dprog[bar % 4]
    add('mus', t0, arp(c_, 4 * beat, 8, 'synth', 0.55, [0, 1, 2, 3, 2, 1, 2, 3], 2), 0.32, pan=0.1, wet=0.3)
    add('mus', t0, pad(c_, 4 * beat + 0.3, 0.4, 0.6, 1800), 0.35, wet=0.4)
    if t0 >= 227.5:
        for b_ in range(4):
            add('mus', t0 + b_ * beat, kick(0.4, 0.8), 0.55, wet=0.05)
        add('mus', t0, np.sin(2 * np.pi * c_[0] / 2 * tt(4 * beat)) * env_adsr(int(4 * beat * SR), 0.02, 0.2, 0.7, 0.2, 4 * beat), 0.35, wet=0.05)
add('sfx', 227.0, (bp(noise(6.0), 180, 900) * (0.7 + 0.3 * np.sin(2 * np.pi * 95 * tt(6.0)))) * fade(int(6 * SR), 0.6, 0.8), 0.15, wet=0.2)
add('sfx', C['gust'] - 0.3, lp(noise(1.4), 1200) * np.sin(np.pi * tt(1.4) / 1.4) ** 2, 0.4, -0.5, wet=0.3)
add('sfx', 234.0, jet(7.0, 0.6, 0.5) * np.sin(np.pi * tt(7.0) / 7.0) ** 2, 0.35, 0.3, wet=0.3)

# XI · Everyone ----------------------------------------------------------
gaze_motif(243.0, 0.85, resolve='F#5')
for i, c_ in enumerate([ch('G2', 'D3', 'G3', 'B3', 'D4'), ch('F#2', 'D3', 'A3', 'D4', 'F#4'), ch('E2', 'B2', 'E3', 'G3', 'D4'), ch('A2', 'E3', 'A3', 'D4', 'E4')]):
    add('mus', 242.0 + i * 2.55, strings(c_, 3.2, 1.0, 1.2, ), 0.55 + i * 0.06, wet=0.55)
add('mus', 252.2, strings(ch('A2', 'E3', 'A3', 'C#4', 'E4', 'A4'), 3.8, 0.4, 0.8), 0.8, wet=0.6)
gaze_motif(252.3, 0.8, resolve='A5', step=0.32)
add('sfx', 252.0, riser(3.6, 200, 7000, 0.7), 0.6, wet=0.4)

# XII · Finale -----------------------------------------------------------
add('mus', 255.8, strings(ch('D2', 'A2', 'D3', 'E4', 'F#4', 'A4'), 7.0, 0.3, 2.5), 0.65, wet=0.7)
lyd = ch('D5', 'E5', 'F#5', 'G#5', 'A5', 'C#6', 'E6')
for i in range(40):
    add('mus', 256.0 + i * 0.14 + rng.uniform(0, 0.08), bell(rng.choice(lyd), 2.2, 1.0, 3.0, 0.35), 0.18, pan=rng.uniform(-0.9, 0.9), wet=0.8)
add('sfx', C['converge'], riser(C['assembled'] - C['converge'], 120, 6000, 0.9), 0.55, wet=0.4)
for i in range(24):                                                   # accelerating ticks
    tk = C['converge'] + (C['assembled'] - C['converge']) * (1 - (1 - i / 24) ** 1.8)
    add('sfx', tk, blip(2400 + i * 40, 0.03, 0.4), 0.25, pan=rng.uniform(-0.5, 0.5), wet=0.3)
add('sfx', C['assembled'], boom(4.5, 0.9), 0.85, wet=0.45)
add('mus', C['assembled'], strings(ch('D2', 'A2', 'D3', 'A3', 'D4', 'F#4', 'A4', 'D5'), 3.6, 0.05, 2.5), 0.75, wet=0.6)
add('mus', C['assembled'], piano(nf('D2'), 5, 1.0), 0.7, wet=0.4)
bpm = 100
b4 = 60 / bpm
cprog = [ch('D3', 'F#3', 'A3', 'D4'), ch('A2', 'C#3', 'E3', 'A3'), ch('B2', 'D3', 'F#3', 'B3'), ch('G2', 'B2', 'D3', 'G3')]
t0 = C['urbanRise']
bar = 0
while t0 < C['dreamSkim'] - 0.01:
    c_ = cprog[bar % 4]
    add('mus', t0, strings(c_, 4 * b4 + 0.4, 0.3, 0.6), 0.5, wet=0.45)
    add('mus', t0, arp(c_, 4 * b4, 4 / b4 * 0.5, 'piano', 0.5, [0, 2, 3, 1], 2), 0.35, 0.2, wet=0.4)
    for k in range(4):
        add('mus', t0 + k * b4, kick(0.4, 0.85 if k % 2 == 0 else 0.6), 0.55, wet=0.08)
    add('mus', t0, np.sin(2 * np.pi * c_[0] / 2 * tt(4 * b4)) * env_adsr(int(4 * b4 * SR), 0.02, 0.3, 0.7, 0.3, 4 * b4), 0.4, wet=0.05)
    t0 += 4 * b4
    bar += 1
add('sfx', C['urbanRise'], (bp(noise(8.0), 300, 2500) * (0.8 + 0.2 * np.sin(2 * np.pi * 110 * tt(8.0)))) * fade(int(8 * SR), 1.0, 1.0), 0.18, wet=0.25)
wprog = [ch('G2', 'D3', 'B3', 'D4'), ch('F#2', 'D3', 'A3', 'D4'), ch('E2', 'B2', 'G3', 'D4'), ch('A2', 'E3', 'A3', 'C#4')]
t0 = C['dreamSkim']
for i in range(4):
    c_ = wprog[i]
    d = (C['freeze'] - C['dreamSkim']) / 4
    add('mus', t0, strings(c_ + [c_[2] * 2], d + 0.5, 0.4, 0.8), 0.55, wet=0.55)
    add('mus', t0, arp(c_, d, 6, 'pluck', 0.55, [0, 1, 2, 3, 2, 1], 2), 0.35, -0.2, wet=0.5)
    t0 += d
add('sfx', C['dreamSkim'], water(C['freeze'] - C['dreamSkim'] + 1, 1.0), 0.6, wet=0.25)
add('sfx', C['dreamSkim'], rotor(C['freeze'] - C['dreamSkim'], 9, 11, 0.6, 900) * fade(int((C['freeze'] - C['dreamSkim']) * SR), 1.0, 0.2), 0.45, wet=0.25)
for i in range(6):
    add('sfx', C['dreamSkim'] + 1 + i * 1.1, chirp(rng.uniform(2800, 3400), rng.uniform(4200, 5000), 0.1), 0.2, pan=rng.uniform(-0.6, 0.6), wet=0.5)
# freeze: everything stops on an impact + a long reverb bloom
add('sfx', C['freeze'], boom(4.0, 0.7), 0.7, wet=0.6)
add('mus', C['freeze'], strings(ch('D2', 'A2', 'D3', 'F#3', 'A3', 'E4', 'A4'), 2.6, 0.02, 2.4), 0.6, wet=0.9)
add('mus', C['freeze'], bell(nf('A5'), 5, 2.5, 3.5, 0.8), 0.4, wet=0.9)
# wordmark
gaze_motif(C['logo'] + 0.2, 0.8, resolve='F#5', step=0.5)
add('mus', C['logo'] + 2.4, strings(ch('D2', 'A2', 'D3', 'F#3', 'A3', 'E4', 'F#4', 'A4'), 8.0, 2.5, 4.0), 0.6, wet=0.7)
add('mus', C['logo'] + 2.4, piano(nf('D2'), 7, 0.8), 0.6, wet=0.6)
for i in range(12):
    add('mus', C['logo'] + 2.6 + i * 0.22, bell(rng.choice(lyd), 2.5, 0.8, 3.0, 0.3), 0.16, pan=rng.uniform(-0.8, 0.8), wet=0.85)

# ===========================================================================
# Mix: reverb on the wet buses, gentle bus compression, master limiter
def make_ir(sec=4.2, rt=2.6, seed=7):
    n = int(sec * SR)
    r = np.random.default_rng(seed)
    t = np.arange(n) / SR
    ir = np.zeros((2, n))
    for c in range(2):
        w = r.standard_normal(n)
        w = lp(w, 6000) * 0.6 + lp(w, 1500) * 0.4
        ir[c] = w * np.exp(-6.9 * t / rt)
    ir[:, :int(0.012 * SR)] = 0
    return ir / np.sqrt((ir ** 2).sum(axis=1, keepdims=True))


print('reverb…')
ir_m, ir_s = make_ir(4.5, 3.0, 7), make_ir(2.5, 1.4, 9)
mix = np.zeros((2, N), np.float64)
for dry, wet, ir, g in (('mus', 'mus_wet', ir_m, 1.0), ('sfx', 'sfx_wet', ir_s, 0.9)):
    w = np.vstack([fftconvolve(BUS[wet][0], ir[0])[:N], fftconvolve(BUS[wet][1], ir[1])[:N]])
    bus = BUS[dry] + w * 0.9
    mix += bus * g
mix = hp(mix, 28)
# soft-knee limiter
peak_target = 0.89
rms = np.sqrt(np.mean(mix ** 2))
mix *= 0.12 / max(rms, 1e-9)
mix = np.tanh(mix * 1.15) / np.tanh(1.15)
mix *= peak_target / max(np.abs(mix).max(), 1e-9)
mix *= fade(N, 0.05, 2.0)

out = ROOT / 'out' / 'audio'
out.mkdir(parents=True, exist_ok=True)
wav = out / 'score.wav'
pcm = (np.clip(mix.T, -1, 1) * 32767).astype('<i2')
import wave
with wave.open(str(wav), 'wb') as f:
    f.setnchannels(2)
    f.setsampwidth(2)
    f.setframerate(SR)
    f.writeframes(pcm.tobytes())
print('wrote', wav.relative_to(ROOT), f'{DUR}s', 'rms', float(np.sqrt(np.mean(mix ** 2))))
