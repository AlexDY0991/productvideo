import json
import tempfile
import unittest
from pathlib import Path
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from asset_discovery.core import Project
from asset_discovery.providers import openverse_record, allowed_url
from asset_discovery.rights import apply_policy
from asset_discovery.mixkit import page_license


def ov(**over):
    data = {'id': '7bd44417-cc78-4526-adfd-67596a09c94e', 'title': 'waves', 'license': 'cc0', 'license_version': '1.0',
            'license_url': 'https://creativecommons.org/publicdomain/zero/1.0/', 'creator': 'someone',
            'foreign_landing_url': 'https://freesound.org/people/x/sounds/1/', 'url': 'https://cdn.freesound.org/previews/1/1-hq.mp3',
            'source': 'freesound', 'filetype': 'mp3', 'duration': 62000, 'tags': [{'name': 'ocean'}], 'mature': False}
    data.update(over)
    return data


def ld(notice, url):
    return '<script type="application/ld+json" data-x="1">' + json.dumps({'@type': 'VideoObject', 'name': 'Clip', 'copyrightNotice': notice, 'license': url}) + '</script>'


class OpenverseTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.project = Project.init(Path(self.tmp.name)/'p')

    def tearDown(self):
        self.project.db.close()
        self.tmp.cleanup()

    def test_cc0_accepted(self):
        record = openverse_record(ov())
        self.assertEqual(record['license_id'], 'cc0')
        self.assertEqual(record['duration'], 62)
        self.assertFalse(apply_policy(self.project, record)['attribution_required'])

    def test_cc_by_requires_attribution(self):
        record = openverse_record(ov(license='by', license_version='4.0', license_url='https://creativecommons.org/licenses/by/4.0/'))
        self.assertTrue(apply_policy(self.project, record)['attribution_required'])

    def test_code_and_url_must_agree(self):
        self.assertIsNone(openverse_record(ov(license='by', license_version='4.0')))

    def test_noncommercial_rejected_by_policy(self):
        record = openverse_record(ov(license='by-nc', license_version='4.0', license_url='https://creativecommons.org/licenses/by-nc/4.0/'))
        with self.assertRaises(ValueError):
            apply_policy(self.project, record)

    def test_unknown_file_host_rejected(self):
        self.assertIsNone(openverse_record(ov(url='https://evil.example.com/a.mp3')))
        self.assertTrue(allowed_url('https://prod-1.storage.jamendo.com/?trackid=1&format=mp32'))

    def test_mature_rejected(self):
        self.assertIsNone(openverse_record(ov(mature=True)))


class MixkitLicenseTests(unittest.TestCase):
    def test_free(self):
        self.assertEqual(page_license(ld('Free', 'https://mixkit.co/license/#videoFree'))[0], 'mixkit-video-free')

    def test_restricted(self):
        self.assertEqual(page_license(ld('Mixkit Restricted License', 'https://mixkit.co/license/#videoRestricted'))[0], 'mixkit-video-restricted')

    def test_conflict_stops(self):
        with self.assertRaises(ValueError):
            page_license(ld('Mixkit Restricted License', 'https://mixkit.co/license/#videoFree'))

    def test_silent_page_stops(self):
        with self.assertRaises(ValueError):
            page_license('<html>no structured data</html>')


if __name__ == '__main__':
    unittest.main()
