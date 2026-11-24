"""Static regression checks. Run from the repository root with unittest discover."""
from html.parser import HTMLParser
from pathlib import Path
import re
import unittest

ROOT = Path(__file__).resolve().parents[1]


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = []
        self.fragments = []
        self.local_assets = []
        self.steps = []
        self.sections = []
        self.h1_count = 0
        self.shots = 0
        self.lang = None

    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        href = attrs.get('href', '')
        if href.startswith('#'):
            self.fragments.append(href[1:])
        if tag == 'img' and attrs.get('src'):
            self.local_assets.append(attrs['src'])
        if tag == 'script' and attrs.get('src'):
            self.local_assets.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') in ('stylesheet', 'icon'):
            self.local_assets.append(href)
        if 'data-step' in attrs:
            self.steps.append(attrs['data-step'])
        if 'data-shot' in attrs:
            self.shots += 1
        if tag == 'section':
            self.sections.append(attrs.get('id'))
        if tag == 'h1':
            self.h1_count += 1
        if tag == 'html':
            self.lang = attrs.get('lang')


class LandingTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.html = (ROOT / 'index.html').read_text(encoding='utf-8')
        cls.css = (ROOT / 'styles.css').read_text(encoding='utf-8')
        cls.js = (ROOT / 'app.js').read_text(encoding='utf-8')
        cls.page = Page()
        cls.page.feed(cls.html)

    def test_all_fragment_links_resolve(self):
        for fragment in self.page.fragments:
            with self.subTest(fragment=fragment):
                self.assertIn(fragment, self.page.ids)

    def test_unique_ids(self):
        self.assertEqual(len(self.page.ids), len(set(self.page.ids)))

    def test_local_assets_exist(self):
        for asset in self.page.local_assets:
            with self.subTest(asset=asset):
                self.assertTrue((ROOT / asset).is_file())

    def test_document_semantics(self):
        self.assertEqual(self.page.lang, 'es')
        self.assertEqual(self.page.h1_count, 1)
        self.assertIn('contenido', self.page.ids)

    def test_principles_section_removed(self):
        self.assertNotIn('principios', self.page.ids)
        self.assertNotIn('No es teatro', self.html)
        self.assertNotIn('Se convierte en equipo', self.html)

    def test_workflow_steps_and_controls_preserved(self):
        self.assertEqual(self.page.steps, [str(i) for i in range(7)])
        for control in ('workflowPrev', 'workflowNext', 'workflowPlay'):
            self.assertIn(control, self.page.ids)

    def test_sections_and_real_images(self):
        for section in ('flujo', 'arquitectura', 'capacidades', 'equipo'):
            self.assertIn(section, self.page.sections)
        self.assertNotIn('sistema', self.page.sections)
        self.assertNotIn('capturas', self.page.sections)
        self.assertNotIn('interface demo', self.html)
        for name in ('office-overview', 'kanban-overview', 'map-editor', 'agent-profiles', 'deploy-history', 'agent-thinking', 'task-detail'):
            self.assertIn('assets/screenshots/'+name+'.jpg', self.html)
        self.assertIn('totalmente configurables', self.html)

    def test_ticker_groups_are_identical(self):
        groups = re.findall(r'<div class="ticker-group">(.*?)</div>', self.html, re.S)
        self.assertEqual(len(groups), 2)
        self.assertEqual(groups[0], groups[1])
        self.assertIn('.hero-ticker .ticker-track { gap: 0;', self.css)

    def test_architecture_topology(self):
        self.assertIn('THE OFFICE / CONTROL PLANE', self.html)
        self.assertIn('Project State · JSON', self.html)
        self.assertIn('GIT LOCAL', self.html)
        self.assertIn('GIT REMOTO', self.html)
        self.assertIn('Gateway · iniciar turno', self.html)
        self.assertIn('contexto · estado · reportes', self.html)

    def test_fallback_content_is_not_hidden_without_javascript(self):
        reveal = re.search(r'\.reveal\s*\{([^}]+)\}', self.css)
        self.assertIsNotNone(reveal)
        self.assertIn('opacity: 1', reveal.group(1))


if __name__ == '__main__':
    unittest.main()
