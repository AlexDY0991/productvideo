#!/usr/bin/env python3
"""Still-image extension for asset-discovery (added for the CoolFly image studio; upstream code untouched).

Search licensed photos, download them with per-file license evidence, and build numbered contact
sheets the agent actually looks at before using anything as a design reference or layout element.

  images.py search openverse "maldives overwater villa aerial" --limit 12 --out results.json
  images.py search commons   "Hulhumale"            --out results.json
  images.py search nasa      "maldives atoll"       --out results.json
  images.py search pexels    "turquoise lagoon"     --out results.json   # needs PEXELS_API_KEY
  images.py search pixabay   "coral reef top view"  --out results.json   # needs PIXABAY_API_KEY
  images.py search unsplash  "maldives aerial"      --out results.json   # needs UNSPLASH_ACCESS_KEY
  images.py sheet  results.json --out sheet.jpg            # thumbnails, numbered, for visual review
  images.py download results.json 3 7 --dir refs/          # by sheet number or record id
  images.py credits refs/                                  # rebuild CREDITS.md from the evidence files

Standard library only, Pillow optional (needed for `sheet` and image verification).
License policy (default `commercial`): CC0, Public Domain Mark, CC BY (attribution kept), Pexels and
Pixabay platform licenses, NASA media. NC, ND and unknown licenses are rejected; ShareAlike only
with --allow-sa. People, trademarks and buildings in a photo still need a shot-specific check.
"""
import argparse
import hashlib
import io
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

# Wikimedia throttles anonymous clients hard; set ASSET_CONTACT (an email or URL you choose to share) to identify yourself.
UA = 'AssetDiscoveryImages/0.1 (+https://github.com/guangjun5952/asset-discovery' + (
    '; ' + os.environ['ASSET_CONTACT'] if os.environ.get('ASSET_CONTACT', '').strip() and '\n' not in os.environ['ASSET_CONTACT'] else '') + ')'
MAX_BYTES = 40 * 1024 * 1024
PLATFORM = {
    'pexels': ('Pexels License', 'https://www.pexels.com/license/'),
    'pixabay': ('Pixabay Content License', 'https://pixabay.com/service/license-summary/'),
    'unsplash': ('Unsplash License', 'https://unsplash.com/license'),
    'nasa': ('NASA Media Usage Guidelines', 'https://www.nasa.gov/nasa-brand-center/images-and-media/'),
}


def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


def http(url, headers=None, tries=3):
    p = urllib.parse.urlsplit(url)
    if p.scheme != 'https' or p.username or p.password:
        raise ValueError(f'refusing non-HTTPS or credentialed URL: {p.hostname}')
    for i in range(tries):
        try:
            req = urllib.request.Request(url, headers={'User-Agent': UA, **(headers or {})})
            with urllib.request.urlopen(req, timeout=45) as r:
                if urllib.parse.urlsplit(r.geturl()).scheme != 'https':
                    raise ValueError('redirected off HTTPS')
                data = r.read(MAX_BYTES + 1)
                if len(data) > MAX_BYTES:
                    raise ValueError('response exceeds size cap')
                return data, r.headers.get('Content-Type', '')
        except urllib.error.HTTPError as e:
            if e.code in (429, 502, 503) and i < tries - 1:
                wait = e.headers.get('Retry-After', '')
                time.sleep(min(int(wait), 20) if wait.isdigit() else 3 * (i + 1))
                continue
            raise RuntimeError(f'HTTP {e.code} from {p.hostname}') from None
        except urllib.error.URLError as e:
            raise RuntimeError(f'connection to {p.hostname} failed: {e.reason}') from None


def get_json(url, headers=None):
    return json.loads(http(url, headers)[0])


def key(name):
    value = os.environ.get(name)
    if not value:
        raise SystemExit(f'{name} is not set (add it to the environment; never paste keys into chat)')
    return value


def strip_html(s):
    import html
    return html.unescape(re.sub('<[^>]*>', ' ', str(s or ''))).strip()


# ---------------------------------------------------------------- providers -> common record

def rec(provider, ident, **kw):
    r = {'provider': provider, 'id': str(ident), 'title': '', 'thumb': '', 'url': '', 'width': 0, 'height': 0,
         'license': '', 'license_url': '', 'author': '', 'source_page': '', 'attribution': '', 'checked_at': now()}
    r.update(kw)
    return r


def search_openverse(q, limit, a):
    params = {'q': q, 'page_size': min(limit, 20), 'license_type': 'commercial', 'mature': 'false'}
    if a.orientation:
        params['aspect_ratio'] = {'landscape': 'wide', 'portrait': 'tall', 'square': 'square'}[a.orientation]
    if a.min_width >= 1600:
        params['size'] = 'large'
    d = get_json('https://api.openverse.org/v1/images/?' + urllib.parse.urlencode(params))
    out = []
    for x in d.get('results', []):
        lic = 'cc0' if x['license'] == 'cc0' else 'pdm' if x['license'] == 'pdm' else f"cc-{x['license']}-{x.get('license_version', '')}"
        out.append(rec('openverse', x['id'], title=x.get('title') or '', thumb=x.get('thumbnail') or x['url'], url=x['url'],
                       width=x.get('width') or 0, height=x.get('height') or 0, license=lic, license_url=x.get('license_url', ''),
                       author=x.get('creator') or '', source_page=x.get('foreign_landing_url') or '',
                       attribution=x.get('attribution') or '', upstream=x.get('source')))
    return out


def search_commons(q, limit, a):
    params = {'action': 'query', 'format': 'json', 'generator': 'search', 'gsrnamespace': 6,
              'gsrsearch': f'{q} filetype:bitmap', 'gsrlimit': min(limit, 20), 'prop': 'imageinfo',
              'iiprop': 'url|size|mime|extmetadata', 'iiurlwidth': 400}
    d = get_json('https://commons.wikimedia.org/w/api.php?' + urllib.parse.urlencode(params))
    out = []
    for page in (d.get('query', {}).get('pages', {}) or {}).values():
        info = (page.get('imageinfo') or [{}])[0]
        ext = info.get('extmetadata', {})
        v = lambda k: strip_html(ext.get(k, {}).get('value', ''))
        short = v('LicenseShortName').lower().replace(' ', '-')
        lic = 'cc0' if short in ('cc0', 'cc0-1.0', 'cc-zero') else 'pdm' if short.startswith('public-domain') or short == 'pd' else short
        out.append(rec('commons', page['title'], title=page['title'], thumb=info.get('thumburl', ''), url=info.get('url', ''),
                       width=info.get('width', 0), height=info.get('height', 0), license=lic, license_url=v('LicenseUrl'),
                       author=v('Artist'), source_page=info.get('descriptionurl', '')))
    return out


def search_nasa(q, limit, a):
    d = get_json('https://images-api.nasa.gov/search?' + urllib.parse.urlencode({'q': q, 'media_type': 'image'}))
    out = []
    for item in d.get('collection', {}).get('items', [])[:limit]:
        meta = item['data'][0]
        thumb = next((l['href'] for l in item.get('links', []) if l.get('rel') == 'preview'), '')
        nid = meta['nasa_id']
        # originals live in the asset manifest; fetched lazily at download time
        out.append(rec('nasa', nid, title=meta.get('title', ''), thumb=thumb, url='', license='nasa',
                       license_url=PLATFORM['nasa'][1], author=meta.get('center', 'NASA'),
                       source_page=f'https://images.nasa.gov/details/{urllib.parse.quote(nid)}',
                       note='Not copyrighted in the US unless noted; must not imply NASA endorsement.'))
    return out


def search_pexels(q, limit, a):
    params = {'query': q, 'per_page': min(limit, 40)}
    if a.orientation:
        params['orientation'] = a.orientation
    d = get_json('https://api.pexels.com/v1/search?' + urllib.parse.urlencode(params), {'Authorization': key('PEXELS_API_KEY')})
    return [rec('pexels', x['id'], title=x.get('alt', ''), thumb=x['src']['medium'], url=x['src']['original'],
                width=x['width'], height=x['height'], license='pexels', license_url=PLATFORM['pexels'][1],
                author=x.get('photographer', ''), source_page=x['url']) for x in d.get('photos', [])]


def search_pixabay(q, limit, a):
    params = {'key': key('PIXABAY_API_KEY'), 'q': q[:100], 'image_type': 'photo', 'per_page': max(3, min(limit, 50)), 'safesearch': 'true'}
    if a.orientation in ('landscape', 'portrait'):
        params['orientation'] = {'landscape': 'horizontal', 'portrait': 'vertical'}[a.orientation]
    d = get_json('https://pixabay.com/api/?' + urllib.parse.urlencode(params))
    return [rec('pixabay', x['id'], title=x.get('tags', ''), thumb=x['webformatURL'], url=x.get('largeImageURL') or x['webformatURL'],
                width=x['imageWidth'], height=x['imageHeight'], license='pixabay', license_url=PLATFORM['pixabay'][1],
                author=x.get('user', ''), source_page=x['pageURL']) for x in d.get('hits', [])[:limit]]


def search_unsplash(q, limit, a):
    params = {'query': q, 'per_page': min(limit, 30), 'content_filter': 'high'}
    if a.orientation:
        params['orientation'] = {'square': 'squarish'}.get(a.orientation, a.orientation)
    d = get_json('https://api.unsplash.com/search/photos?' + urllib.parse.urlencode(params),
                 {'Authorization': 'Client-ID ' + key('UNSPLASH_ACCESS_KEY'), 'Accept-Version': 'v1'})
    utm = '?utm_source=coolfly_studio&utm_medium=referral'  # API guidelines: credit links carry UTM params
    return [rec('unsplash', x['id'], title=x.get('alt_description') or x.get('description') or '', thumb=x['urls']['small'],
                url=x['urls']['raw'] + '&q=90&fm=jpg&w=4000', width=x['width'], height=x['height'], license='unsplash',
                license_url=PLATFORM['unsplash'][1], author=x['user']['name'], source_page=x['links']['html'] + utm,
                author_page=x['user']['links']['html'] + utm, download_location=x['links']['download_location'])
            for x in d.get('results', [])]


PROVIDERS = {'openverse': search_openverse, 'unsplash': search_unsplash, 'commons': search_commons, 'nasa': search_nasa,
             'pexels': search_pexels, 'pixabay': search_pixabay}


def policy(r, allow_sa=False, mode='commercial'):
    lic = (r.get('license') or '').lower()
    if mode == 'cc0':
        return (lic in ('cc0', 'pdm', 'nasa'), 'strict mode: public domain only')
    if lic in ('cc0', 'pdm', 'pexels', 'pixabay', 'unsplash', 'nasa'):
        return True, ''
    if re.fullmatch(r'cc-by-[\d.]+', lic):
        return (bool(r.get('author') and r.get('source_page')), 'CC BY needs author and source page for attribution')
    if re.fullmatch(r'cc-by-sa-[\d.]+', lic):
        return (allow_sa, 'ShareAlike: derivative must carry the same license; pass --allow-sa after review')
    return False, f'license "{lic or "unknown"}" not cleared for commercial design use (NC/ND/unknown)'


# ---------------------------------------------------------------- commands

def cmd_search(a):
    rows = PROVIDERS[a.provider](a.query, a.limit, a)
    keep, rejected = [], []
    for r in rows:
        ok, why = policy(r, a.allow_sa, a.license_mode)
        if ok and (not r['width'] or r['width'] >= a.min_width):
            keep.append(r)
        else:
            rejected.append({'id': r['id'], 'title': r['title'][:80], 'reason': why or f'narrower than {a.min_width}px'})
    for i, r in enumerate(keep, 1):
        r['n'] = i
    result = {'provider': a.provider, 'query': a.query, 'checked_at': now(), 'candidates': keep, 'rejected': rejected}
    text = json.dumps(result, ensure_ascii=False, indent=1)
    if a.out:
        Path(a.out).parent.mkdir(parents=True, exist_ok=True)
        Path(a.out).write_text(text, encoding='utf-8')
    for r in keep:
        print(f"{r['n']:>3}  {r['width']}x{r['height']}  {r['license']:<10} {r['title'][:60]}")
    print(f'{len(keep)} kept, {len(rejected)} rejected' + (f' -> {a.out}' if a.out else ''))


def load(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def cmd_sheet(a):
    from PIL import Image, ImageDraw, ImageFont
    cands = load(a.results)['candidates']
    cell, cols = a.cell, a.cols
    rows = (len(cands) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * cell, rows * (cell + 34)), (20, 20, 20))
    d = ImageDraw.Draw(sheet)
    try:
        f = ImageFont.truetype('DejaVuSans-Bold.ttf', 18)
    except OSError:
        f = ImageFont.load_default()
    for i, r in enumerate(cands):
        x, y = (i % cols) * cell, (i // cols) * (cell + 34)
        try:
            im = Image.open(io.BytesIO(http(r['thumb'])[0])).convert('RGB')
            im.thumbnail((cell - 8, cell - 8))
            sheet.paste(im, (x + (cell - im.width) // 2, y + (cell - im.height) // 2))
        except Exception as e:  # keep the sheet usable when one thumbnail fails
            d.text((x + 10, y + cell // 2), f'thumb failed: {str(e)[:30]}', fill=(200, 80, 80), font=f)
        d.text((x + 8, y + cell + 6), f"#{r['n']}  {r['width']}x{r['height']}  {r['license']}", fill=(255, 255, 255), font=f)
    sheet.save(a.out, quality=88)
    print(a.out)


def pick(cands, wanted):
    for w in wanted:
        hit = next((r for r in cands if str(r.get('n')) == w or r['id'] == w), None)
        if not hit:
            raise SystemExit(f'no candidate {w}')
        yield hit


def nasa_original(nid):
    links = get_json(f'https://images-api.nasa.gov/asset/{urllib.parse.quote(nid)}')['collection']['items']
    hrefs = [l['href'] for l in links if re.search(r'\.(jpe?g|png|tif)$', l['href'], re.I)]
    best = next((h for h in hrefs if '~orig' in h), None) or next((h for h in hrefs if '~large' in h), None) or hrefs[0]
    return best.replace('http://', 'https://')


def cmd_download(a):
    res = load(a.results)
    out = Path(a.dir)
    out.mkdir(parents=True, exist_ok=True)
    for r in pick(res['candidates'], a.ids):
        ok, why = policy(r, a.allow_sa, a.license_mode)
        if not ok:
            print(f"skip {r['id']}: {why}")
            continue
        try:
            if r['provider'] == 'unsplash':  # API guidelines require pinging the download endpoint
                get_json(r['download_location'], {'Authorization': 'Client-ID ' + key('UNSPLASH_ACCESS_KEY')})
            url = nasa_original(r['id']) if r['provider'] == 'nasa' else r['url']
            data, ctype = http(url)
        except (RuntimeError, ValueError) as e:  # one failed host must not abort the batch
            print(f"skip {r['id']}: {e}")
            continue
        ext = {'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/tiff': '.tif'}.get(ctype.split(';')[0].strip())
        ext = ext or (Path(urllib.parse.urlsplit(url).path).suffix.lower() or '.jpg')
        try:
            from PIL import Image
            with Image.open(io.BytesIO(data)) as im:
                im.verify()
                size = im.size
        except ImportError:
            size = (r['width'], r['height'])
        except Exception:
            print(f"skip {r['id']}: download is not a readable image")
            continue
        slug = re.sub(r'[^a-z0-9]+', '-', (r['title'] or r['id']).lower()).strip('-')[:40] or 'image'
        name = f"{r['provider']}-{slug}-{hashlib.sha1(r['id'].encode()).hexdigest()[:6]}{ext}"
        (out / name).write_bytes(data)
        ev = dict(r, file=name, download_url=url, sha256=hashlib.sha256(data).hexdigest(), pixels=list(size), downloaded_at=now(),
                  rights_notice='Copyright license only; people, logos, artworks and private property in frame need separate clearance.')
        (out / (name + '.license.json')).write_text(json.dumps(ev, ensure_ascii=False, indent=1), encoding='utf-8')
        print(f"{name}  {size[0]}x{size[1]}  {r['license']}")
    cmd_credits(argparse.Namespace(dir=a.dir, quiet=True))


def credit_line(e):
    lic = e['license']
    if lic in PLATFORM:
        return f"{e['title'] or e['id']} by {e['author'] or 'unknown'} via {PLATFORM[lic][0]} <{e['source_page']}>"
    if e.get('attribution'):
        return e['attribution']
    return f"\"{e['title'] or e['id']}\" by {e['author'] or 'unknown'}, {lic.upper()} <{e['license_url']}>, source <{e['source_page']}>"


def cmd_credits(a):
    d = Path(a.dir)
    evs = [json.loads(p.read_text(encoding='utf-8')) for p in sorted(d.glob('*.license.json'))]
    must = [e for e in evs if re.fullmatch(r'cc-by(-sa)?-[\d.]+', e['license'])]
    lines = ['# Image credits', '', 'Generated from the *.license.json evidence next to each file.', '']
    if must:
        lines += ['## Attribution required in the published piece (CC BY / BY-SA)', ''] + [f'- {credit_line(e)}' for e in must] + ['']
    lines += ['## All files', ''] + [f"- `{e['file']}` · {e['license']} · {credit_line(e)}" for e in evs]
    (d / 'CREDITS.md').write_text('\n'.join(lines) + '\n', encoding='utf-8')
    if not getattr(a, 'quiet', False):
        print(d / 'CREDITS.md')


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument('--license-mode', choices=['commercial', 'cc0'], default='commercial')
    p.add_argument('--allow-sa', action='store_true')
    sub = p.add_subparsers(dest='cmd', required=True)
    s = sub.add_parser('search')
    s.add_argument('provider', choices=sorted(PROVIDERS))
    s.add_argument('query')
    s.add_argument('--limit', type=int, default=12)
    s.add_argument('--orientation', choices=['landscape', 'portrait', 'square'])
    s.add_argument('--min-width', type=int, default=0)
    s.add_argument('--out')
    s = sub.add_parser('sheet'); s.add_argument('results'); s.add_argument('--out', required=True)
    s.add_argument('--cols', type=int, default=4); s.add_argument('--cell', type=int, default=360)
    s = sub.add_parser('download'); s.add_argument('results'); s.add_argument('ids', nargs='+'); s.add_argument('--dir', required=True)
    s = sub.add_parser('credits'); s.add_argument('dir')
    a = p.parse_args()
    try:
        {'search': cmd_search, 'sheet': cmd_sheet, 'download': cmd_download, 'credits': cmd_credits}[a.cmd](a)
    except (RuntimeError, ValueError) as e:
        sys.exit(f'error: {e}')


if __name__ == '__main__':
    main()
