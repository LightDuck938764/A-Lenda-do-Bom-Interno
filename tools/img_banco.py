# Copia uma imagem extraída do banco de questões para img/casos/, otimizada, e registra a origem.
# uso: python3 tools/img_banco.py origem.png nome_destino.jpg "questão de origem" "o que mostra"
import sys, os, datetime
from PIL import Image
src, dst, origem, desc = sys.argv[1:5]
root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
out = os.path.join(root, 'img', 'casos', dst); os.makedirs(os.path.dirname(out), exist_ok=True)
im = Image.open(src).convert('RGB')
if im.width > 1600: im = im.resize((1600, round(im.height * 1600 / im.width)), Image.LANCZOS)
im.save(out, quality=86, optimize=True)
reg = os.path.join(root, 'notas', 'imagens.md')
if not os.path.exists(reg): open(reg, 'w').write('# Imagens dos casos e sua origem\n\n| Arquivo | Mostra | Origem |\n|---|---|---|\n')
open(reg, 'a').write(f'| {dst} | {desc} | Banco de questões: {origem} |\n')
print(dst, im.size, os.path.getsize(out) // 1024, 'KB')
