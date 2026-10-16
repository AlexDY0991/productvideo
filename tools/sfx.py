#!/usr/bin/env python3
"""Synthesised SFX layer (stdlib only, no samples): whooshes, sub hits, ticks, risers.

  sfx.py EVENTS.json OUT.wav

EVENTS.json: {"dur": 45.5, "events": [{"t": 8.8, "k": "hit", "w": 1.0}, {"t": 13.3, "k": "whoosh", "w": 0.8, "dir": 1}, ...]}
Kinds: whoosh (peaks on t, pans by dir), hit (sub drop + click on t), tick (short metallic tick on t),
riser (noise swell that ends on t, length "len"). 48 kHz, 16-bit stereo, peak-normalised to -3 dBFS.
"""
import json, math, random, struct, sys, wave

SR = 48000


def svf_bandpass(x, f0, f1, q, sr=SR):
    """State-variable band-pass with the centre frequency gliding exponentially from f0 to f1."""
    low = band = 0.0
    out = [0.0] * len(x)
    n = len(x)
    for i, v in enumerate(x):
        f = f0 * (f1 / f0) ** (i / max(1, n - 1))
        g = 2 * math.sin(math.pi * min(f, sr / 6) / sr)
        high = v - low - band / q
        band += g * high
        low += g * band
        out[i] = band
    return out


def whoosh(w, direction, length=0.9):
    n = int(length * SR)
    rnd = random.Random(11)
    noise = [rnd.uniform(-1, 1) for _ in range(n)]
    a = svf_bandpass(noise, 280, 2600, 1.6)
    b = svf_bandpass(noise[::-1], 1200, 380, 2.2)
    peak = 0.62                                  # the whoosh peaks at 62 % of its length (on the event time)
    L, R = [0.0] * n, [0.0] * n
    for i in range(n):
        u = i / n
        env = (u / peak) ** 2.2 if u < peak else math.exp(-(u - peak) * 9)
        s = (a[i] * 0.8 + b[i] * 0.5) * env * w
        pan = max(-1, min(1, direction * (u - peak) * 2.2))
        L[i] = s * math.cos((pan + 1) * math.pi / 4)
        R[i] = s * math.sin((pan + 1) * math.pi / 4)
    return L, R, int(peak * n)


def hit(w):
    n = int(1.6 * SR)
    rnd = random.Random(5)
    L = [0.0] * n
    ph = 0.0
    for i in range(n):
        t = i / SR
        f = 34 + 40 * math.exp(-t * 9)
        ph += 2 * math.pi * f / SR
        body = math.sin(ph) * math.exp(-t * 2.2)
        click = rnd.uniform(-1, 1) * math.exp(-t * 90) * 0.5
        L[i] = (math.tanh(body * 1.8) * 0.9 + click) * w
    return L, L[:], 0


def tick(w):
    n = int(0.06 * SR)
    L = [0.0] * n
    for i in range(n):
        t = i / SR
        L[i] = (math.sin(2 * math.pi * 3100 * t) * 0.6 + math.sin(2 * math.pi * 5200 * t) * 0.3) * math.exp(-t * 120) * w
    return L, L[:], 0


def riser(w, length):
    n = int(length * SR)
    rnd = random.Random(3)
    noise = [rnd.uniform(-1, 1) for _ in range(n)]
    a = svf_bandpass(noise, 200, 5000, 1.2)
    L = [a[i] * (i / n) ** 3 * w for i in range(n)]
    return L, L[:], n


def main():
    spec = json.load(open(sys.argv[1]))
    dur = spec["dur"]
    N = int(dur * SR)
    L, R = [0.0] * N, [0.0] * N
    for e in spec["events"]:
        k, w = e["k"], e.get("w", 0.8)
        if k == "whoosh":
            l, r, anchor = whoosh(w, e.get("dir", 1), e.get("len", 0.9))
        elif k == "hit":
            l, r, anchor = hit(w)
        elif k == "tick":
            l, r, anchor = tick(w)
        elif k == "riser":
            l, r, anchor = riser(w, e.get("len", 1.5))
        else:
            continue
        start = int(e["t"] * SR) - anchor
        for i in range(len(l)):
            j = start + i
            if 0 <= j < N:
                L[j] += l[i]; R[j] += r[i]
    peak = max(1e-9, max(max(abs(v) for v in L), max(abs(v) for v in R)))
    g = 10 ** (-3 / 20) / peak
    with wave.open(sys.argv[2], "wb") as wf:
        wf.setnchannels(2); wf.setsampwidth(2); wf.setframerate(SR)
        wf.writeframes(b"".join(struct.pack("<hh", int(L[i] * g * 32767), int(R[i] * g * 32767)) for i in range(N)))
    print(f"{sys.argv[2]}: {len(spec['events'])} events, {dur} s")


if __name__ == "__main__":
    main()
