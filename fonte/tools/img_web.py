"""Importa imagem aprovada da internet para img/casos/ e registra licença/autor/link em notas/imagens.md.
Uso: python3 tools/img_web.py origem destino.jpg "o que mostra" "fonte" "autor" "licença" "link" """
import sys, os
from PIL import Image
src, dst, desc, fonte, autor, lic, link = sys.argv[1:8]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'img', 'casos', dst)
im = Image.open(src)
if im.mode in ('RGBA', 'LA', 'P'):
    im = im.convert('RGBA'); bg = Image.new('RGB', im.size, 'white'); bg.paste(im, mask=im.split()[-1]); im = bg
else: im = im.convert('RGB')
if im.width > 1600: im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
im.save(out, quality=86, optimize=True)
open(os.path.join(root, 'notas', 'imagens.md'), 'a').write(f'| {dst} | {desc} | {fonte}: {autor} — {lic} — {link} (aprovada pelo usuário) |\n')
print(dst, im.size, os.path.getsize(out) // 1024, 'KB')
