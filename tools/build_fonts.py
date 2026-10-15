"""Subset the film's fonts down to the glyphs actually used.

Scans film/src/**/*.js for string content, then for every font face listed in
FACES picks the matching @fontsource woff2 files, subsets them with fontTools
(pyftsubset) and writes film/assets/fonts/*.woff2 plus film/src/fonts.js, a
manifest the player loads through the FontFace API.

Usage: python3 tools/build_fonts.py <path-to-node_modules/@fontsource>
"""
import json
import os
import re
import subprocess
import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'film' / 'src'
OUT = ROOT / 'film' / 'assets' / 'fonts'
FS = Path(sys.argv[1] if len(sys.argv) > 1 else 'node_modules/@fontsource')

# family name, fontsource package, weight, style, cjk?
FACES = [
    ('Noto Serif SC', 'noto-serif-sc', 400, 'normal', True),
    ('Noto Serif SC', 'noto-serif-sc', 600, 'normal', True),
    ('Noto Serif SC', 'noto-serif-sc', 900, 'normal', True),
    ('Noto Sans SC', 'noto-sans-sc', 300, 'normal', True),
    ('Noto Sans SC', 'noto-sans-sc', 500, 'normal', True),
    ('Ma Shan Zheng', 'ma-shan-zheng', 400, 'normal', True),
    ('Cormorant Garamond', 'cormorant-garamond', 400, 'normal', False),
    ('Cormorant Garamond', 'cormorant-garamond', 500, 'normal', False),
    ('Cormorant Garamond', 'cormorant-garamond', 600, 'normal', False),
    ('Cormorant Garamond', 'cormorant-garamond', 400, 'italic', False),
    ('Cormorant Garamond', 'cormorant-garamond', 500, 'italic', False),
    ('Cinzel', 'cinzel', 400, 'normal', False),
    ('Cinzel', 'cinzel', 600, 'normal', False),
    ('IM Fell English', 'im-fell-english', 400, 'normal', False),
    ('IM Fell English', 'im-fell-english', 400, 'italic', False),
    ('Special Elite', 'special-elite', 400, 'normal', False),
    ('Limelight', 'limelight', 400, 'normal', False),
    ('Poiret One', 'poiret-one', 400, 'normal', False),
    ('JetBrains Mono', 'jetbrains-mono', 400, 'normal', False),
    ('JetBrains Mono', 'jetbrains-mono', 600, 'normal', False),
    ('Inter', 'inter', 300, 'normal', False),
    ('Inter', 'inter', 500, 'normal', False),
    ('Inter', 'inter', 700, 'normal', False),
]

text = ''
for f in sorted(SRC.rglob('*.js')):
    if f.name == 'fonts.js' or f.name == 'logo-data.js':
        continue
    text += f.read_text(encoding='utf-8')
chars = set(text)
chars |= set(chr(c) for c in range(0x20, 0x7f))          # always keep ASCII
chars |= set('—–·“”‘’…«»°′″×±→←↑↓©®™')
cjk = sorted(c for c in chars if ord(c) >= 0x2e80)
print(f'{len(chars)} distinct chars, {len(cjk)} CJK/fullwidth')


def ranges(css_text):
    """Yield (file, set_of_codepoints) for each @font-face block in a fontsource css."""
    for block in re.findall(r'@font-face\s*{(.*?)}', css_text, re.S):
        url = re.search(r'url\(\./files/([^)]+?\.woff2)\)', block) or re.search(r'url\(\.\/files\/([^)]+\.woff2)\)', block)
        ur = re.search(r'unicode-range:\s*([^;]+);', block)
        if not url or not ur:
            continue
        cps = set()
        for part in ur.group(1).split(','):
            part = part.strip().replace('U+', '').replace('u+', '')
            if '-' in part:
                a, b = part.split('-')
                cps.update(range(int(a, 16), int(b, 16) + 1))
            elif '?' in part:
                a = int(part.replace('?', '0'), 16)
                b = int(part.replace('?', 'F'), 16)
                cps.update(range(a, b + 1))
            else:
                cps.add(int(part, 16))
        yield url.group(1), cps


OUT.mkdir(parents=True, exist_ok=True)
for old in OUT.glob('*.woff2'):
    old.unlink()
manifest = []
used_cps = set(ord(c) for c in chars)
for family, pkg, weight, style, is_cjk in FACES:
    pdir = FS / pkg
    css_name = f'{weight}{"-italic" if style == "italic" else ""}.css'
    css_path = pdir / css_name
    if not css_path.exists():
        print('missing', css_path)
        continue
    need = set()
    picked = []
    for fname, cps in ranges(css_path.read_text()):
        inter = cps & used_cps
        if not inter:
            continue
        picked.append((fname, inter))
    for i, (fname, inter) in enumerate(picked):
        src = pdir / 'files' / fname
        out_name = f'{pkg}-{weight}{"i" if style == "italic" else ""}-{i}.woff2'
        uni = ','.join(f'U+{c:04X}' for c in sorted(inter))
        subprocess.run(['pyftsubset', str(src), f'--unicodes={uni}', '--flavor=woff2',
                        f'--output-file={OUT / out_name}', '--layout-features=*', '--no-hinting'], check=True)
        # keep only code points the font really maps (some subsets cover chars a font lacks)
        cmap = TTFont(OUT / out_name).getBestCmap() or {}
        inter = {c for c in inter if c in cmap}
        if not inter:
            (OUT / out_name).unlink()
            continue
        # unicode-range: compress to ranges
        cs = sorted(inter)
        rs = []
        s = p = cs[0]
        for c in cs[1:]:
            if c == p + 1:
                p = c
                continue
            rs.append((s, p))
            s = p = c
        rs.append((s, p))
        urange = ','.join(f'U+{a:X}' if a == b else f'U+{a:X}-{b:X}' for a, b in rs)
        manifest.append({'family': family, 'weight': weight, 'style': style, 'file': out_name, 'range': urange})

size = sum((OUT / m['file']).stat().st_size for m in manifest)
(SRC / 'fonts.js').write_text(
    '// Auto-generated by tools/build_fonts.py — glyph-subset font manifest\n'
    f'export const FONTS = {json.dumps(manifest, ensure_ascii=False, indent=0)};\n', encoding='utf-8')
print(f'{len(manifest)} font files, {size / 1024:.0f} KiB total')
