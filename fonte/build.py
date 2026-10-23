import glob, os
root = os.path.dirname(os.path.abspath(__file__))
js = '\n'.join(open(f, encoding='utf-8').read() for f in sorted(glob.glob(os.path.join(root, 'src', '*.js'))))
css = open(os.path.join(root, 'style.css'), encoding='utf-8').read()
shell = open(os.path.join(root, 'shell.html'), encoding='utf-8').read()
out = shell.replace('/*__CSS__*/', css).replace('/*__JS__*/', js)
open(os.path.join(root, 'dist', 'a-lenda-do-bom-interno.html'), 'w', encoding='utf-8').write(out)
open(os.path.join(root, 'dist', 'bundle.js'), 'w', encoding='utf-8').write(js)
print(len(out))
