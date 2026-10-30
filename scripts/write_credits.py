"""Build a transparent asset register from the downloaded source manifest."""
from pathlib import Path
import json

root = Path(__file__).resolve().parents[1]
records = json.loads((root / 'public/images/sources.json').read_text(encoding='utf-8'))
usage = {
    'hero': 'Hero', 'chair': 'Collection — Arca', 'sofa': 'Collection — Soma', 'table': 'Collection — Linea',
    'lamp': 'Collection — Lume', 'sideboard': 'Collection — Alto', 'vase': 'Collection — Terra',
    'orbit': 'Signature — Orbit', 'dune': 'Signature — Dune', 'colonna': 'Signature — Colonna',
    'philosophy': 'Approach', 'detail': 'Approach detail', 'wood': 'Materials — oak',
    'stone': 'Materials — travertine', 'linen': 'Materials — linen', 'alcove': 'Journal 01',
    'dining': 'Journal 02', 'morning': 'Journal 03', 'cafe': 'Journal 04', 'rest': 'Journal 05',
    'plaster': 'Journal 06',
}
lines = [
    '# Asset credits', '',
    'LUXE is a self-initiated fictional brand concept. All photography is illustrative. It does not depict LUXE products, a manufacturing operation or completed LUXE interiors, and no photographer or pictured designer endorses this project.', '',
    '## Photography', '',
    f'All {len(records)} photographs come from Unsplash. Each photo page was checked on 25 October 2026: every image is offered under the free [Unsplash License](https://unsplash.com/license), and none is an Unsplash+ (paid) image. The license allows free commercial and non-commercial use, including modification, without required attribution; it does not allow selling unaltered copies or compiling the photos into a competing service. Attribution is still given here and in the website footer.', '',
    '| Local file family | Used for | Photographer | Original photo page | License |',
    '| --- | --- | --- | --- | --- |',
]
for item in records:
    lines.append(
        f"| `public/images/{item['name']}-*.webp` | {usage.get(item['name'], '')} | [{item['author']}]({item['profile']}) | [Unsplash]({item['source']}) | [Unsplash License]({item['license']}) |"
    )
lines += [
    '', 'Product names, materials, dimensions and prices are invented for the concept and are attached to photographs of similar-looking furniture for illustration only.', '',
    '### Selection criteria', '',
    'The set was chosen for one consistent art direction: real photography (no 3D renders), warm natural daylight, and a material palette of oak, travertine, stoneware, linen and bouclé. Each photograph appears once on the page.', '',
    '### Local processing', '',
    'Images are downloaded once by `scripts/prepare_assets.py`, orientation-corrected, resized to 480 px, 960 px and a larger width (960–2,000 px), and encoded as WebP at quality 80. No watermarks were removed and the site does not hotlink imagery. `public/og-image.jpg` and `public/apple-touch-icon.png` are generated from the hero photograph and the brand fonts by `scripts/make_social_images.py`. Exact page and download URLs are stored in `public/images/sources.json`.', '',
    '## Fonts', '',
    '| Family | Distribution | License | Included license |',
    '| --- | --- | --- | --- |',
    '| Cormorant Garamond, normal and italic | [Fontsource](https://fontsource.org/fonts/cormorant-garamond), Google Fonts | SIL Open Font License 1.1 | `public/fonts/cormorant-garamond-OFL.txt` |',
    '| Inter, normal | [Fontsource](https://fontsource.org/fonts/inter), Google Fonts | SIL Open Font License 1.1 | `public/fonts/inter-OFL.txt` |', '',
    'Fonts use locally hosted Latin variable WOFF2 subsets. Original license texts were obtained from the corresponding [Google Fonts repository](https://github.com/google/fonts/tree/main/ofl).', '',
    '## Icons and original work', '',
    '- [Lucide](https://lucide.dev/license): ISC-licensed icons, supplied through `lucide-react`.',
    '- The wordmark, favicon, page composition, interface copy and fictional collection data were created for this concept.',
    '- Photographs, font designs and library code remain the work of their respective owners.', '',
]
(root / 'ASSET_CREDITS.md').write_text('\n'.join(lines), encoding='utf-8')
print(f'Wrote credits for {len(records)} photographs.')
