#!/usr/bin/env python3
"""Break a reference film into shots and read each shot's camera move.

Usage: ref_analyze.py VIDEO OUTDIR [--threshold 27]
Needs scenedetect + opencv (see HANDOFF.md, "tool venv"). Writes OUTDIR/shots.md, shots.json
and OUTDIR/sheet.jpg (one mid frame per shot, numbered), so a reference ad can be studied as
an edit (shot lengths, rhythm) and as camera language (push/pull/pan/tilt/roll/handheld/static).

The camera move is estimated from the global similarity transform between frames tracked
with sparse optical flow; it reads the dominant image motion, so a subject moving across a
locked-off frame can read as a pan. Treat the label as a first guess and check the sheet.
"""
import argparse
import json
import math
from pathlib import Path

import cv2
import numpy as np
from scenedetect import ContentDetector, detect


def motion(path, a, b, fps, step=2):
    cap = cv2.VideoCapture(str(path))
    cap.set(cv2.CAP_PROP_POS_FRAMES, a)
    prev, acc, n, jitter = None, np.zeros(4), 0, []
    for f in range(a, b):
        ok, frame = cap.read()
        if not ok:
            break
        if (f - a) % step:
            continue
        g = cv2.cvtColor(cv2.resize(frame, (480, int(480 * frame.shape[0] / frame.shape[1]))), cv2.COLOR_BGR2GRAY)
        if prev is not None:
            pts = cv2.goodFeaturesToTrack(prev, 300, 0.01, 8)
            if pts is not None and len(pts) >= 12:
                nxt, st, _ = cv2.calcOpticalFlowPyrLK(prev, g, pts, None)
                good = st.ravel() == 1
                if good.sum() >= 12:
                    m, _ = cv2.estimateAffinePartial2D(pts[good], nxt[good])
                    if m is not None:
                        s = math.hypot(m[0, 0], m[1, 0])
                        step_v = np.array([m[0, 2], m[1, 2], math.log(s), math.atan2(m[1, 0], m[0, 0])])
                        acc += step_v; n += 1; jitter.append(step_v[:2])
        prev = g
    cap.release()
    if not n:
        return {'label': 'unknown'}
    dur = (b - a) / fps
    tx, ty, zoom, rot = acc / dur  # per second, in 480-px-wide frame units
    jit = float(np.std(np.diff(np.array(jitter), axis=0))) if len(jitter) > 3 else 0.0
    parts = []
    if abs(zoom) > 0.12:
        parts.append(('push in' if zoom > 0 else 'pull out') + (' fast' if abs(zoom) > 0.5 else ''))
    if abs(tx) > 35:  # image moves right -> camera pans/tracks left
        parts.append(('pan/track left' if tx > 0 else 'pan/track right') + (' fast' if abs(tx) > 150 else ''))
    if abs(ty) > 35:
        parts.append(('tilt/crane up' if ty > 0 else 'tilt/crane down') + (' fast' if abs(ty) > 150 else ''))
    if abs(rot) > 0.1:
        parts.append('roll')
    if jit > 12:
        parts.append('handheld/FPV shake')
    return {'label': ', '.join(parts) or 'static / locked-off', 'tx': round(float(tx), 1), 'ty': round(float(ty), 1),
            'zoom': round(float(zoom), 3), 'roll': round(float(rot), 3), 'jitter': round(jit, 2)}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('video'); ap.add_argument('out'); ap.add_argument('--threshold', type=float, default=27)
    a = ap.parse_args()
    out = Path(a.out); out.mkdir(parents=True, exist_ok=True)
    cap = cv2.VideoCapture(a.video); fps = cap.get(cv2.CAP_PROP_FPS); total = int(cap.get(cv2.CAP_PROP_FRAME_COUNT)); cap.release()
    scenes = detect(a.video, ContentDetector(threshold=a.threshold)) or []
    bounds = [(s.frame_num, e.frame_num) for s, e in scenes] or [(0, total)]
    shots, thumbs = [], []
    cap = cv2.VideoCapture(a.video)
    for i, (s, e) in enumerate(bounds, 1):
        cap.set(cv2.CAP_PROP_POS_FRAMES, (s + e) // 2); ok, fr = cap.read()
        if ok:
            t = cv2.resize(fr, (320, int(320 * fr.shape[0] / fr.shape[1])))
            cv2.putText(t, f'{i} {s/fps:.1f}s', (6, 22), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 255), 2)
            thumbs.append(t)
        shots.append(dict(n=i, start=round(s / fps, 2), dur=round((e - s) / fps, 2), **motion(a.video, s, e, fps)))
    cap.release()
    if thumbs:
        cols = 6; h, w = thumbs[0].shape[:2]
        thumbs += [np.zeros_like(thumbs[0])] * (-len(thumbs) % cols)
        rows = [np.hstack([cv2.resize(t, (w, h)) for t in thumbs[r:r + cols]]) for r in range(0, len(thumbs), cols)]
        cv2.imwrite(str(out / 'sheet.jpg'), np.vstack(rows), [cv2.IMWRITE_JPEG_QUALITY, 85])
    durs = [s['dur'] for s in shots]
    lines = [f'# {Path(a.video).name}', '',
             f'{len(shots)} shots in {total/fps:.1f} s; median {np.median(durs):.2f} s, min {min(durs):.2f} s, max {max(durs):.2f} s; '
             f'{sum(d < 1 for d in durs)} shots under 1 s.', '',
             '| # | start | dur | camera (first guess) |', '|---|---|---|---|']
    lines += [f"| {s['n']} | {s['start']:.2f} | {s['dur']:.2f} | {s['label']} |" for s in shots]
    (out / 'shots.md').write_text('\n'.join(lines) + '\n')
    (out / 'shots.json').write_text(json.dumps(shots, indent=1))
    print('\n'.join(lines[:3]))


if __name__ == '__main__':
    main()
