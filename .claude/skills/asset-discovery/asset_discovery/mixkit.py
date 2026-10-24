"""One named Mixkit video item page -> license check -> normal download -> evidence + import.

Not a crawler: it reads exactly the item page the caller names and the rendition linked from it.
The license is accepted only when the page's structured data agrees with itself; any conflict
(e.g. copyrightNotice says Restricted while the license URL says Free) stops for human review.
"""
import json
import re
from pathlib import Path
from urllib.parse import urlsplit
from .core import now, write_json
from .providers import Network
from .web_import import import_web

ITEM = re.compile(r'^/free-stock-video/[a-z0-9-]+-(\d+)/$')
LD = re.compile(r'<script[^>]*type="application/ld\+json"[^>]*>(.*?)</script>', re.S)


def _objects(html):
    for block in LD.findall(html):
        try:
            data = json.loads(block)
        except ValueError:
            continue
        for obj in (data if isinstance(data, list) else data.get('@graph', [data])):
            if isinstance(obj, dict):
                yield obj


def page_license(html):
    """Return (license_id, observed_text) or raise when the page is silent or contradicts itself."""
    for obj in _objects(html):
        notice, url = str(obj.get('copyrightNotice') or ''), str(obj.get('license') or '')
        if not (notice or url):
            continue
        notice_free = bool(re.search(r'\bFree\b', notice)) and 'Restricted' not in notice
        says_free = notice_free and url.endswith('#videoFree')
        says_restricted = 'Restricted' in notice or url.endswith('#videoRestricted')
        observed = f'copyrightNotice="{notice}"; license="{url}"'
        if says_free and not says_restricted:
            return 'mixkit-video-free', observed, obj
        if says_restricted and not (notice_free or url.endswith('#videoFree')):
            return 'mixkit-video-restricted', observed, obj
        raise ValueError(f'Conflicting license signals on the item page ({observed}); review the download dialog manually')
    raise ValueError('Item page carries no structured license data; review manually and use import-web')


def mixkit_item(project, url, max_height=None):
    parts = urlsplit(url)
    match = ITEM.match(parts.path)
    if parts.scheme != 'https' or parts.hostname not in ('mixkit.co', 'www.mixkit.co') or not match or parts.query:
        raise ValueError('Give one Mixkit video item URL like https://mixkit.co/free-stock-video/<name>-<id>/')
    ident = match[1]
    net = Network(project)
    with net.open(url) as response:
        raw = response.read(5*1024*1024+1)
    if len(raw) > 5*1024*1024:
        raise ValueError('Item page too large')
    html = raw.decode('utf-8', errors='replace')
    license_id, observed, obj = page_license(html)
    if license_id != 'mixkit-video-free':
        raise ValueError(f'Item is under the Mixkit Restricted License ({observed}); not used for commercial editing')
    limit = int(max_height or project.config['height'])
    renditions = sorted({int(h) for h in re.findall(rf'https://assets\.mixkit\.co/videos/{ident}/{ident}-(\d+)\.mp4', html)})
    usable = [h for h in renditions if h <= limit]
    if not usable:
        raise ValueError(f'No linked MP4 rendition at or below {limit}p (found {renditions})')
    height = usable[-1]
    if height < int(project.config.get('min_video_height', 0)):
        raise ValueError(f'Best linked rendition is {height}p, below min_video_height')
    media_url = f'https://assets.mixkit.co/videos/{ident}/{ident}-{height}.mp4'
    incoming = project.path/'downloads'/'incoming'
    incoming.mkdir(parents=True, exist_ok=True)
    target, evidence = incoming/f'mixkit-{ident}-{height}.mp4', incoming/f'mixkit-{ident}.page.html'
    evidence.write_text(html, encoding='utf-8')
    cap = min(max(1, int(project.config['online']['max_download_mb'])), 1024)*1024*1024
    partial = target.with_suffix('.mp4.part')
    try:
        with net.open(media_url) as response, partial.open('wb') as out:
            size = 0
            while chunk := response.read(1024*1024):
                size += len(chunk)
                if size > cap:
                    raise ValueError('Download exceeds configured size cap')
                out.write(chunk)
        partial.replace(target)
    finally:
        partial.unlink(missing_ok=True)
    from .core import sha
    author = obj.get('author') or obj.get('creator') or {}
    receipt = {'provider': 'mixkit', 'source_page': f'https://mixkit.co{parts.path}',
               'title': str(obj.get('name') or ident), 'author': author.get('name', '') if isinstance(author, dict) else '',
               'license_id': license_id, 'license_url': 'https://mixkit.co/license/modal/videoFree/',
               'license_observed_text': observed, 'variant': f'{height}p MP4 linked from item page',
               'checked_at': now(), 'sha256': sha(target), 'evidence_file': str(evidence), 'reviewed': True,
               'review_method': 'automated_item_page_parse'}
    receipt_path = incoming/f'mixkit-{ident}.receipt.json'
    write_json(receipt_path, receipt)
    result = import_web(project, target, receipt_path)
    record_path = Path(result['path']+'.license.json')
    record = json.loads(record_path.read_text(encoding='utf-8'))
    record['license_status'] = 'tool_parsed_item_page'  # automated parse, not a human reading the page
    write_json(record_path, record)
    return dict(result, license_status=record['license_status'], variant=receipt['variant'], observed=observed)
