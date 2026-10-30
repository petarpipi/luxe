"""Create the Open Graph image and Apple touch icon from the prepared hero photograph."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / 'public'
IVORY, INK, BRONZE = '#f4efe7', '#221d19', '#84644a'
serif = PUBLIC / 'fonts' / 'cormorant-garamond-latin.woff2'
italic = PUBLIC / 'fonts' / 'cormorant-garamond-latin-italic.woff2'
sans = PUBLIC / 'fonts' / 'inter-latin.woff2'

hero = Image.open(PUBLIC / 'images' / 'hero-960.webp').convert('RGB')

og = Image.new('RGB', (1200, 630), IVORY)
og.paste(ImageOps.fit(hero, (560, 630), centering=(0.5, 0.62)), (640, 0))
draw = ImageDraw.Draw(og)
draw.text((72, 72), 'LUXE.', font=ImageFont.truetype(str(serif), 56), fill=INK, spacing=0)
draw.text((72, 250), 'Furniture for', font=ImageFont.truetype(str(serif), 76), fill=INK)
draw.text((72, 330), 'slower rooms.', font=ImageFont.truetype(str(italic), 76), fill=BRONZE)
draw.text((72, 520), 'A FURNITURE DESIGN CONCEPT', font=ImageFont.truetype(str(sans), 18), fill=INK)
og.save(PUBLIC / 'og-image.jpg', quality=86, optimize=True, progressive=True)

icon = Image.new('RGB', (180, 180), INK)
ImageDraw.Draw(icon).text((90, 92), 'L', font=ImageFont.truetype(str(serif), 120), fill=IVORY, anchor='mm')
icon.save(PUBLIC / 'apple-touch-icon.png', optimize=True)
print('ok')
