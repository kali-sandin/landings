"""Export the inline diagram for the responsive lightbox; no remote assets."""
from pathlib import Path
import re, base64, mimetypes, io
from PIL import Image
ROOT=Path(__file__).resolve().parents[1]
page=(ROOT/'index.html').read_text()
svg=re.search(r'<svg class="architecture-svg architecture-host".*?</svg>',page,re.S).group()
svg=svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" width="1400" height="1300" ',1)
style='''<style>
svg{background:#171a18;color:#f4eddf;font-family:system-ui,sans-serif}
.host-boundary>rect{fill:#191d1a;stroke:#79827b;stroke-dasharray:7 8}
.host-boundary use{fill:none;stroke:#a6aeab;stroke-width:1.2}
.host-boundary text{fill:#b3bdb6;font:650 14px monospace}
.arch-zone{color:#5c9ded}.server-zone{color:#f6b73c}.agent-zone{color:#ed655e}.repo-zone{color:#f5f7f7}
.arch-zone rect{fill:#202422;stroke:currentColor;stroke-opacity:.65}
.arch-zone text{fill:currentColor;font:700 16px monospace}
.arch-node rect{fill:#1e2625;stroke:#89938d}
.arch-node text{fill:#f4eddf;text-anchor:middle;font:700 18px system-ui,sans-serif}
.arch-node .sub{fill:#c3cbc5;font:500 14px monospace}
.arch-node use{fill:none;stroke:#f4eddf;stroke-width:1.4}
.arch-node .json-icon{fill:#8f70ff;font:700 24px monospace}
[data-node="remote-agent"] text,[data-node="remote-clone"] text{font-size:16px}
[data-node="remote-agent"] .sub,[data-node="remote-clone"] .sub{font-size:12px}
.arch-edge{fill:none;stroke:#aab6ad;stroke-width:1.5;color:#f4eddf}
.arch-label text{fill:#c3cbc5;text-anchor:middle;font:500 13px monospace;paint-order:stroke;stroke:#171a18;stroke-width:4px}
</style>'''
svg=svg.replace('<title id="architectureTitle">',style+'<title id="architectureTitle">',1)
# SVG loaded as an <img> cannot fetch nested external image resources.
# Embed the local captures/icons so the enlarged diagram is self-contained.
svg=re.sub(r'<a\b[^>]*>(.*?)</a>',r'\1',svg,flags=re.S)
def embed(match):
    path=ROOT/match[1]
    mime=mimetypes.guess_type(path.name)[0] or 'application/octet-stream'
    payload=path.read_bytes()
    if mime in ('image/jpeg','image/png'):
        # Technical thumbnails only in the export; original captures stay intact.
        with Image.open(io.BytesIO(payload)) as image:
            image.thumbnail((828,466) if 'screenshots' in str(path) else (96,96))
            buffer=io.BytesIO(); image.save(buffer,format='WEBP',quality=86,method=4)
            payload=buffer.getvalue();mime='image/webp'
    return 'href="data:'+mime+';base64,'+base64.b64encode(payload).decode()+'"' 
svg=re.sub(r'href="(assets/[^"]+)"',embed,svg)
(ROOT/'architecture.svg').write_text(svg)
print('architecture.svg exported')
