"""Create a file://-compatible review copy without changing production output."""
from pathlib import Path
import os, re, shutil, zipfile
source = Path('dist')
output = Path('/workspace/previews/the-shop-coolum')
if output.exists():
    shutil.rmtree(output)
shutil.copytree(source, output)
for page in output.rglob('*.html'):
    def relative(url):
        path, sep, fragment = url.partition('#')
        target = output / path.lstrip('/')
        if path.endswith('/'):
            target = target / 'index.html'
        return os.path.relpath(target, page.parent) + (sep + fragment if sep else '')
    html = page.read_text()
    html = re.sub(r'(href|src|poster)="(/[^\"]*)"', lambda m: m[1]+'="'+relative(m[2])+'"', html)
    html = re.sub(r'srcset="([^\"]+)"', lambda m: 'srcset="'+', '.join(relative(item.strip().split()[0])+' '+' '.join(item.strip().split()[1:]) for item in m[1].split(','))+'"', html)
    # The browser blocks file:// ES module scripts; this source has no imports.
    html = html.replace('type="module"', 'defer')
    page.write_text(html)
for css in (output / '_astro').glob('*.css'):
    css.write_text(css.read_text().replace('/_astro/', './'))
script = output / 'js/motion.js'
script.write_text(script.read_text().replace('export function initScrollFilm', 'function initScrollFilm'))
(output / 'READ-ME.txt').write_text('THE SHOP @ COOLUM — WEBSITE PREVIEW\n\nOpen index.html in your browser. Navigate between all six main pages.\nThis review copy works directly from the extracted folder.\n\nSupporting scroll motion is implemented. The commissioned Higgsfield video\nis NOT included: its generation tools were unavailable. The coffee feature\ncurrently uses an honestly disclosed still illustration.\n\nPhotography is AI-generated editorial illustration, not real business imagery.\nContact information is from the brief and awaits independent verification.\nNo public deployment has been performed.\n')
archive = Path('/workspace/previews/The-Shop-Coolum-preview.zip')
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as z:
    for f in output.rglob('*'):
        if f.is_file(): z.write(f, f.relative_to(output))
print(archive, archive.stat().st_size)
