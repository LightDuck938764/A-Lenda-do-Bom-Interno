"""Troca as alternativas de perguntas rápidas (QQ/QD) pelo início do texto da pergunta.
Uso: python3 tools/quick_opcoes.py fix.json   (fix.json = {"início da pergunta": ["correta", "errada", ...]})
A primeira alternativa continua sendo a correta."""
import sys, json, glob
fix = json.load(open(sys.argv[1], encoding='utf-8'))
def js(s): return "'" + s.replace('\\', '\\\\').replace("'", "\\'") + "'"
def fim_array(s, i):
    # s[i] == '[' ; devolve o índice do ']' correspondente, respeitando strings
    q = None; k = i + 1
    while k < len(s):
        c = s[k]
        if q:
            if c == '\\': k += 2; continue
            if c == q: q = None
        elif c in "'\"": q = c
        elif c == ']': return k
        k += 1
    raise ValueError('array sem fim')
feitos = set()
for f in sorted(glob.glob('src/*.js')):
    s = open(f, encoding='utf-8').read(); o = s
    for pref, opts in fix.items():
        p = pref.replace("'", "\\'")
        k = -1
        for cab in ("QQ(", "QD("):
            j = 0
            while True:
                j = s.find(cab, j)
                if j < 0: break
                fimlinha = s.find('\n', j)
                t = s.find("'" + p, j, fimlinha)
                if t >= 0: k = t; break
                j += 3
            if k >= 0: break
        if k < 0: continue
        a = s.find('[', k); b = fim_array(s, a)
        s = s[:a] + '[' + ', '.join(js(x) for x in opts) + ']' + s[b + 1:]
        feitos.add(pref)
    if s != o: open(f, 'w', encoding='utf-8').write(s)
falta = [p for p in fix if p not in feitos]
print('ok', len(feitos), 'não encontradas:', falta)
