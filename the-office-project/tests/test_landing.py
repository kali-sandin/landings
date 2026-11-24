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
        for name in ('office-overview', 'kanban-overview', 'map-editor', 'agent-profiles', 'deploy-history', 'agent-thinking', 'task-detail', 'project-editor', 'agent-detail'):
            self.assertIn('assets/screenshots/'+name+'.jpg', self.html)
        self.assertIn('totalmente configurables', self.html)

    def test_ticker_groups_are_identical(self):
        groups = re.findall(r'<div class="ticker-group"[^>]*>(.*?)</div>', self.html, re.S)
        self.assertEqual(len(groups), 2)
        self.assertEqual(groups[0], groups[1])
        self.assertIn('.hero-ticker .ticker-track { gap: 0;', self.css)

    def test_architecture_topology(self):
        self.assertIn('The Office Server', self.html)
        self.assertIn('RASPBERRY PI 5 · MISMO SERVIDOR', self.html)
        self.assertIn('Control Plane', self.html)
        self.assertIn('interfaz de oficina', self.html)
        self.assertNotIn('token acotado', self.html)
        self.assertIn('Project State · JSON', self.html)
        self.assertIn('GIT LOCAL', self.html)
        self.assertIn('GIT REMOTO', self.html)
        self.assertIn('Gateway · iniciar turno', self.html)
        self.assertIn('contexto · estado', self.html)

    def test_in_page_lightbox_and_footer(self):
        self.assertIn('id="image-lightbox"', self.html)
        self.assertEqual(self.html.count('target="_blank"'), 1)
        self.assertIn('https://kali-sandin.github.io/landings/the-kali-project/" target="_blank" rel="noopener noreferrer"', self.html)
        self.assertNotIn('SYSTEM DESIGN', self.html)
        self.assertNotIn('Volver arriba', self.html)
        self.assertNotIn('<section class="closing"', self.html)
        self.assertIn('assets/screenshots/login.png', self.html)

    def test_scaled_night_sequence(self):
        minutes = [int(n) for n in re.findall(r'data-minute="(\d+)"', self.html)]
        self.assertEqual(minutes, [0,60,90]+list(range(120,361,30))+[390,420])
        pins = re.findall(r'class="shift-event" style="--at:([0-9.]+)%" data-minute="(\d+)"', self.html)
        for position, minute in pins:
            self.assertAlmostEqual(float(position), int(minute)/420*100, places=5)

    def test_demo_activity_and_labels(self):
        self.assertIn('Simulación de turnos de agentes', self.html)
        self.assertIn('ticker-result', self.html)
        for agent in ('richard', 'jared', 'bruce-lee', 'gilfoyle'):
            self.assertIn('assets/team/'+agent+'.png', self.html)
        self.assertIn('Observabilidad de la actividad del agente.', self.html)
        self.assertIn('thinking, working, reporting', self.html)
        self.assertIn('Habilita o deshabilita cada agente', self.html)
        self.assertIn('PROJECT SYNC', self.js)
        self.assertIn('0101 1100', self.js)
        self.assertNotIn('turnos de 15 minutos', self.html)
        self.assertNotIn('minuto/360', (ROOT / 'README.md').read_text())

    def test_fallback_content_is_not_hidden_without_javascript(self):
        reveal = re.search(r'\.reveal\s*\{([^}]+)\}', self.css)
        self.assertIsNotNone(reveal)
        self.assertIn('opacity: 1', reveal.group(1))


if __name__ == '__main__':
    unittest.main()
