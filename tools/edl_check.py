"""Gate for a shot table before anything is rendered.

A shot is (film_start, film_end, source_path, source_in, speed[, beat]). check() raises with every
problem it finds; build scripts call it first so a cut that repeats footage never renders.

Rules (from the v10.1 review: "大量的重复镜头"):
- shots are contiguous and no shorter than MIN_LEN;
- no two shots use overlapping source time (the same picture twice);
- one source clip feeds at most MAX_USES shots (raise it only for clips that are themselves
  multi-shot edits, and then tag beats);
- two neighbouring shots never come from the same source clip;
- a beat tag (what the shot shows, e.g. 'smile', 'belly-pass') appears once: two takes of
  the same action are a repeat even when they come from different files.
"""
from pathlib import Path

MIN_LEN = 0.4
MAX_USES = 2


def check(shots, dur=None, min_len=MIN_LEN, max_uses=MAX_USES, allow_adjacent=()):
    errors, uses, beats, prev_end = [], {}, {}, None
    for i, (a, b, src, sin, speed, *tag) in enumerate(shots):
        name = Path(src).name
        if tag:
            if tag[0] in beats:
                errors.append(f"shot {i} repeats beat '{tag[0]}' already shown in shot {beats[tag[0]]}")
            beats.setdefault(tag[0], i)
        if prev_end is not None and abs(a - prev_end) > 1e-6:
            errors.append(f'shot {i} starts at {a} but the previous one ends at {prev_end}')
        if b - a < min_len - 1e-6:
            errors.append(f'shot {i} ({name}) is {b - a:.2f} s, shorter than {min_len} s')
        span = (sin, sin + (b - a) * speed)
        for j, other in uses.get(name, []):
            if span[0] < other[1] - 1e-6 and other[0] < span[1] - 1e-6:
                errors.append(f'shot {i} reuses {name} {span[0]:.2f}-{span[1]:.2f} already shown in shot {j} ({other[0]:.2f}-{other[1]:.2f})')
        uses.setdefault(name, []).append((i, span))
        if i and Path(shots[i - 1][2]).name == name and i not in allow_adjacent:
            errors.append(f'shots {i - 1} and {i} both come from {name}; cut to a different clip')
        prev_end = b
    for name, spans in uses.items():
        if len(spans) > max_uses:
            errors.append(f'{name} feeds {len(spans)} shots (max {max_uses}): ' + ', '.join(str(j) for j, _ in spans))
    if dur is not None and prev_end is not None and abs(prev_end - dur) > 1e-6:
        errors.append(f'shots end at {prev_end}, not at {dur}')
    if errors:
        raise SystemExit('Shot table rejected:\n  ' + '\n  '.join(errors))
    return f'{len(shots)} shots from {len(uses)} clips, no repeated footage'
