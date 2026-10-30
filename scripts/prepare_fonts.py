"""Self-host Google Fonts; keep original OFL license files alongside fonts."""
from pathlib import Path
import urllib.request

folder = Path(__file__).resolve().parents[1] / 'public' / 'fonts'
folder.mkdir(parents=True, exist_ok=True)
headers = {'User-Agent': 'Mozilla/5.0'}
for family, filename, repo_name in [
    ('Cormorant+Garamond:wght@400;500', 'cormorant-garamond', 'cormorantgaramond'),
    ('Inter:wght@400;500;600', 'inter', 'inter'),
]:
    font_url = f'https://cdn.jsdelivr.net/npm/@fontsource-variable/{filename}/files/{filename}-latin-wght-normal.woff2'
    data = urllib.request.urlopen(urllib.request.Request(font_url, headers=headers), timeout=30).read()
    if data[:4] != b'wOF2':
        raise RuntimeError('Expected WOFF2 font data')
    (folder / f'{filename}-latin.woff2').write_bytes(data)
    if filename == 'cormorant-garamond':
        italic_url = font_url.replace('-normal.woff2', '-italic.woff2')
        (folder / f'{filename}-latin-italic.woff2').write_bytes(urllib.request.urlopen(italic_url, timeout=30).read())
    license_url = f'https://raw.githubusercontent.com/google/fonts/main/ofl/{repo_name}/OFL.txt'
    license_text = urllib.request.urlopen(license_url, timeout=30).read().decode('utf-8')
    (folder / f'{filename}-OFL.txt').write_text('\n'.join(line.rstrip() for line in license_text.splitlines()) + '\n', encoding='utf-8')
    print(f'{filename}: downloaded WOFF2 and OFL license', flush=True)
