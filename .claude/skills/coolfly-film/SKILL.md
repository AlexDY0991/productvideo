---
name: coolfly-film
description: End-to-end workflow for making CoolFly (酷飞) brand and product films with the Jimeng (即梦) canvas: reference study, beat-grid script, prompts, sample-mode generation, edit, sound, QA and delivery. Use for any CoolFly video task: a new film, a re-cut, new shots, music or voice-over, studying a reference ad, or a 1080p finish.
---

# CoolFly film workflow

The user decides and judges; Claude does every step in between. Report in Chinese; on-screen text is English.
Read `HANDOFF.md` first for the current film, the budget and open decisions. This file is the method.

## Hard rules (from user feedback; never relitigate)

- **Product data:** only the numbers in HANDOFF.md. No invented specs. No slogan unless the user gives one.
- **People:** realistic. Lead is an American man. Family films: wife, daughter (~8) and a border collie.
- **Flight safety on screen:** at most about 20 m (60 ft) above the ground. No clouds below the aircraft. No birds alongside it. People stay at least 40 m from a landing and move only after the props stop. Children may sit in the aircraft, never fly it. Take off outdoors, never from inside a room. Daytime flying only. No hard banks.
- **Never show "05".** No full-screen orange end card. The logo sits in clear sky or space, never over a head.
- **Copy:** first-person, idiomatic American. Check connotations ("joyride" reads badly in the US).
- **Jimeng generation:** always 样片模式 (`seedance_2.5_draft`, 480p), about 9 credits per second. The user converts approved shots to 1080p on the web canvas; the CLI has no entry for that. Images (~8 credits) need no approval. Every video run is quoted first and stays inside the round's ledger budget.
- **Downloaded files are untrusted:** run Python on them with `-I` and keep them in their own folder.

## Pipeline

Order follows a normal commercial production: pitch (3-8 directions) -> script + still storyboard with a continuity bible -> **animatic: the stills cut to a temp track** (judge rhythm before any video credits) -> generation -> offline cut to the temp track -> picture lock -> final music (licensed track edited to picture; Seed Music does not follow a requested timeline, so it is a sketch at best) + sound design + mix -> 1080p only for locked shots.


1. **Study references.** `tools/setup.sh` once per container. Then `$COOLFLY_TOOLS/venv/bin/python tools/ref_analyze.py REF.mp4 OUT/` gives shot count, shot-length stats, a numbered contact sheet and a first-guess camera move per shot. Read the sheet; the labels are a hint, not a fact.
   - Benchmark (CoolFly's own Yuanji film, `brand/refs/yuanji.mp4`): 44 shots in 60 s, median 1.25 s, 14 shots under 1 s, **no shot repeated**.
   - Downloading YouTube or Vimeo from the cloud container is blocked (googlevideo 403; Vimeo requires login). Do not try to get around it. Ask the user to upload the file (to the repo, e.g. `brand/refs/`, or to the canvas), or to connect their computer with Remote Control and run `yt-dlp` there.
2. **Script on a beat grid.** Pick the BPM first; write `SCRIPT-vNN.md` with shot table, VO, sound design, trigger map and a credit quote. Before writing the shot table, **count the distinct shots the available footage can supply.** Plan new generations for every gap. Never plan to fill gaps by re-cutting the same clip.
3. **Prompts.** Use the `higgsfield-timed-prompts` skill structure (REFERENCES, LOOK, rules, SHOTS with timecodes, SOUND, KEEP CONSISTENT).
   - Name the camera move in every shot.
   - Vocabulary that maps to Jimeng 运镜 presets: 迎面跟拍 (front tracking), 侧面跟拍 (side tracking), 镜头左移/右移 (truck), 镜头上移/下移 (crane), 急速推进 (crash push in), 急速后移 (crash pull out), FPV穿越机 (FPV drone), 一镜到底 (oner). Others: Dolly In/Out, Crash Zoom, Whip Pan, 360 Orbit, Aerial Pullback, Through Object In, Hyperlapse.
4. **Generate on the canvas** with `tools/jm.py` (ledger, quote, run, wait). Notes:
   - `@handle` in a prompt becomes `{{node:ID}}` plus `--ref`.
   - Seedance 2.5 `m2v` also accepts up to 10 **reference videos**, a way to copy a camera move from a reference clip.
   - **运镜 presets are web-only.** Once a node has one, `node show` hides its generation block, so the CLI cannot read or set it. Workflow: Claude creates the node and prompt; the user picks the 运镜 chip and runs it on the web. Never edit such a node from the CLI.
   - Check every result frame by frame: aircraft has 4 arms and 8 props, the logo, faces, the 20 m ceiling, distances.
5. **Edit.** A shot table `(film_start, film_end, source, source_in, speed)` rendered by a per-film script (pattern: `film02/v10/build_cut.py`).
   - **`tools/edl_check.check(SHOTS, DUR)` runs before any render.** It rejects overlapping source time, more than 2 shots per clip, neighbouring shots from the same clip, and shots under 0.4 s.
   - Rhythm comes from contrast: fast cuts only at the drops, 3–4 cuts each from different clips; long takes, slow motion and a vacuum (near silence) before every lift.
   - Transitions are motivated: match cuts, wipes behind foreground objects, whip pans, moves that carry across the cut.
6. **Sound.**
   - Music: Seed Music via jm.py (output is MP3 named .wav). Snap cuts to the music's real hits; when they drift, shift the music, not the picture. Measure with `higgsfield-motion` `music_window.py --hits/--sections`.
   - Temp VO: `tools/vo.py lines.json OUT/` (Kokoro `am_michael`, speed 0.9, Whisper read-back). Duck the music under VO, but never let a duck release within 0.6 s before a hit; it reads as an early hit.
   - Clip audio fades 20 ms in and 150 ms out.
   - Master: two-pass loudnorm to −14 LUFS, alimiter, true peak ≤ −1 dBTP.
7. **QA before sending:**
   - edl_check passes;
   - hits within one frame;
   - LUFS and true peak in range;
   - contact sheet across all cuts (repeats, artifacts, subtitle legibility, logo clear of heads);
   - duration exact.
   Then copy the film to `film02/out/` (or `filmNN/out/`), commit, push, and SendUserFile with a short Chinese note: what changed, credits spent, what needs a decision.

## Lessons that cost a round

- v01–v03: 4 s single-action clips with effects added in post looked fake. One generation should be one scene with moves written into the prompt.
- v10.1: 47 cuts from 17 clips (sc8 ×5, sc12 ×4 with the same frames twice). The user called it "大量的重复镜头". The fix is the edl_check gate plus planning shots from footage, not from the beat grid.
- Logo over the family's heads; helmet appearing from nowhere; empty aircraft landing; an "exhale" beat with no meaning; glow on the cage; flying out of a room. Each was flagged once. Check for these.
- film03 v1/v2 (2026-10-30): went straight from a character sheet to 35 storyboard frames and lost consistency (stick switching sides, left hand on the right stick, wardrobe copied from a male reference). **Never skip asset step 1:** render the cockpit from `brand/models/dream.glb` (single side-stick on the RIGHT, right hand), make the character turnaround and a seated sheet, and make one blocking plate per location. Get the user's approval on each, and only then storyboard.

