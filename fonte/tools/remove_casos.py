"""Remove casos pelo id de todos os arquivos src/*.js.  Uso: python3 tools/remove_casos.py id1 id2 ..."""
import sys, glob
ids = sys.argv[1:]
for f in sorted(glob.glob('src/*.js')):
    s = open(f, encoding='utf-8').read(); orig = s
    for i in ids:
        k = s.find("CASO({ id: '%s'" % i)
        if k < 0: continue
        e = s.find("});", k) + 3
        while s[e:e+1] == '\n': e += 1
        s = s[:k] + s[e:]; print('removido', i, 'de', f)
    if s != orig: open(f, 'w', encoding='utf-8').write(s)
