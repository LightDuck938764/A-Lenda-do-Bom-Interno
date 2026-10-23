# Gera o site do GitHub Pages: cabeçalho com Firebase + o jogo compilado.
import os, shutil
root = os.path.dirname(os.path.abspath(__file__))
repo = '/home/claude/a-lenda-do-bom-interno'
head = open(os.path.join(root, 'site_head.html'), encoding='utf-8').read()
game = open(os.path.join(root, 'dist', 'a-lenda-do-bom-interno.html'), encoding='utf-8').read()
open(os.path.join(repo, 'index.html'), 'w', encoding='utf-8').write(head + game)
# código-fonte junto do site, para nunca mais se perder
dst = os.path.join(repo, 'fonte')
if os.path.isdir(dst): shutil.rmtree(dst)
os.makedirs(os.path.join(dst, 'src'))
for f in sorted(os.listdir(os.path.join(root, 'src'))):
    if f.endswith('.js'): shutil.copy(os.path.join(root, 'src', f), os.path.join(dst, 'src', f))
for d in ['tools', 'notas']:
    if os.path.isdir(os.path.join(root, d)): shutil.copytree(os.path.join(root, d), os.path.join(dst, d))
for f in ['build.py', 'make_site.py', 'style.css', 'shell.html', 'site_head.html']:
    shutil.copy(os.path.join(root, f), os.path.join(dst, f))
if os.path.isdir(os.path.join(root, 'img')):
    if os.path.isdir(os.path.join(repo, 'img')): shutil.rmtree(os.path.join(repo, 'img'))
    shutil.copytree(os.path.join(root, 'img'), os.path.join(repo, 'img'))
print('ok', len(head + game))
