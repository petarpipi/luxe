"""Download credited Unsplash photography and create local responsive WebP variants.

Every photograph below was checked on its Unsplash page on 25 October 2026 and is
offered under the Unsplash License (not Unsplash+). Run from the project root:

    python scripts/prepare_assets.py
"""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from pathlib import Path
import json
import urllib.request
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / 'public' / 'images'

# (local name, Unsplash image id, page slug, photographer, profile, largest width)
ASSETS = [
    ('hero', '1772442363851-738a548f6c5c', 'sunlight-streams-across-a-dining-set-with-chairs-caA5D7QCHyA', 'Tim Schmidbauer', 'timschmidbauer', 2000),
    ('chair', '1695457264728-ed616015c6b2', 'a-chair-and-a-foot-stool-in-a-room-_nw31uYz5-A', 'Olena Bohovyk', 'olenkasergienko', 1400),
    ('sofa', '1761330440315-7550eb161354', 'a-neutral-toned-modular-sofa-with-a-textured-throw-V_pX3_3ImrY', 'Caroline Badran', '___atmos', 1400),
    ('table', '1694830470387-2e0f234ecaf7', 'a-wooden-table-topped-with-white-plates-and-bowls-orI7hd1tNY0', 'Mélyna Côté', 'laptiteminimaliste', 1400),
    ('lamp', '1667312939978-64cf31718a6e', 'a-lamp-and-books-on-a-table-ulh3-dLSXjI', 'Karolina Grabowska', 'kaboompics', 1400),
    ('sideboard', '1742729118744-216a86a65560', 'a-cozy-room-features-elegant-furniture-and-decor-3WuPC7cv_rI', 'Francesco Liotti', 'francesco_liotti', 1400),
    ('vase', '1643569556871-91ec60671ed7', 'a-white-vase-sitting-on-top-of-a-table-giRMqme_f-Q', 'Jocelyn Morales', 'molnj', 1400),
    ('orbit', '1684165610413-2401399e0e59', 'a-white-couch-sitting-on-top-of-a-white-floor-kcxZ-YUZ8VE', 'Kevin Shek', 'kevinshek', 1600),
    ('dune', '1768946131536-39b5f3ec329d', 'a-textured-brown-sofa-bathed-in-dramatic-sunlight-8wfoqYB4LgE', 'Caroline Badran', '___atmos', 1600),
    ('colonna', '1792498599080-cddbc3adaf7f', 'dining-table-with-flowers-and-shelving-4EAsqbh1pt4', 'Tim Schmidbauer', 'timschmidbauer', 1600),
    ('philosophy', '1772442364499-52f96e8fc4d4', 'two-textured-vases-with-dry-branches-near-window-gX1aDOsmV1o', 'Tim Schmidbauer', 'timschmidbauer', 1600),
    ('detail', '1642523209612-0ba9c676d073', 'a-white-vase-sitting-on-top-of-a-shelf-jDOtKVk5oYs', 'Daryl Han', 'darylbydesign', 960),
    ('wood', '1659930087003-2d64e33181f7', 'person-marking-wooden-board-with-pencil-GfYA6q5ESLI', 'Craft Kitties', 'craftkitties', 1600),
    ('stone', '1759507058804-cc729b38d1ed', 'row-of-stone-columns-with-strong-shadows-uezooiynnt8', 'Paolo Chiabrando', 'chiabra', 1400),
    ('linen', '1690893631932-2ad83b51afcd', 'the-shadow-of-a-plant-on-a-white-sheet-JQfR0cpHpqE', 'Shan Chick', 'wilderiverstudio', 1400),
    ('alcove', '1758024836397-2c9c698087f0', 'cozy-armchair-by-a-window-with-a-garden-view-CjmHORCoIfw', 'Clay Banks', 'claybanks', 1600),
    ('dining', '1674542572845-7875fa71f1ca', 'a-dining-room-table-with-a-vase-of-flowers-on-it-4uMRVFnJcP4', 'Zhao Yangyang', 'yoyoand', 1600),
    ('morning', '1787539386490-85a97302af03', 'sunlight-on-wooden-floorboards-Q9ttGXgFYFk', 'Franco Debartolo', 'francotheshooter', 2000),
    ('cafe', '1759050427122-eaeb5885eaf7', 'modern-room-with-marble-table-and-potted-snake-plant-LOm3L0BP61o', 'Johan Mouchet', 'johanmouchet', 1600),
    ('rest', '1589271243958-d61e12b61b97', 'brown-and-green-plant-on-brown-wooden-table-lPZZXH9sjZU', 'Thanos Pal', 'thanospal', 1600),
    ('plaster', '1552558636-f6a8f071c2b3', 'leaf-plant-near-bed-OZiflZqq0N0', 'nine koepfer', 'enka80', 1600),
]


def prepare(asset):
    name, image_id, slug, author, profile, largest = asset
    download = f'https://images.unsplash.com/photo-{image_id}?w={largest}&q=88&fm=jpg'
    request = urllib.request.Request(download, headers={'User-Agent': 'LUXE-Portfolio-Asset-Preparation/2.0'})
    photo = ImageOps.exif_transpose(Image.open(BytesIO(urllib.request.urlopen(request, timeout=60).read()))).convert('RGB')
    widths = sorted({480, 960, min(largest, photo.width)})
    for width in widths:
        variant = photo.copy()
        if variant.width > width:
            variant = variant.resize((width, round(photo.height * width / photo.width)), Image.Resampling.LANCZOS)
        variant.save(FOLDER / f'{name}-{width}.webp', 'WEBP', quality=80, method=6)
    print(f'{name}: {photo.width}x{photo.height}', flush=True)
    return {
        'name': name,
        'id': image_id,
        'author': author,
        'profile': f'https://unsplash.com/@{profile}',
        'source': f'https://unsplash.com/photos/{slug}',
        'download': download,
        'width': photo.width,
        'height': photo.height,
        'largest': widths[-1],
        'license': 'https://unsplash.com/license',
    }


if __name__ == '__main__':
    FOLDER.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=6) as pool:
        records = list(pool.map(prepare, ASSETS))
    (FOLDER / 'sources.json').write_text(json.dumps(records, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
