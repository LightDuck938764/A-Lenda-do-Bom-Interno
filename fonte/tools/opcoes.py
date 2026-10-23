# Substitui listas dx/cd de casos. uso: python3 tools/opcoes.py arquivo.js novas.json
# novas.json: { "id": { "dx": [...4], "cd": [...4] } }  (a 1ª opção é sempre a correta)
import re, sys, json
P, J = sys.argv[1], sys.argv[2]
s = open(P, encoding='utf-8').read(); N = json.load(open(J, encoding='utf-8'))
esc = lambda x: "'" + x.replace("\\", "\\\\").replace("'", "\\'") + "'"
for cid, new in N.items():
    i = s.index("id: '" + cid + "'")
    nxt = s.find('CASO({', i + 5); nxt = len(s) if nxt < 0 else nxt
    for f in ['dx', 'cd']:
        if f not in new: continue
        assert len(new[f]) == 4, cid
        m = re.compile(r"\n  " + f + r": \[(.*?)\],\n", re.S).search(s, i)
        assert m and m.start() < nxt, (cid, f)
        s = s[:m.start()] + "\n  " + f + ": [" + ', '.join(esc(x) for x in new[f]) + "],\n" + s[m.end():]
        nxt = s.find('CASO({', i + 5); nxt = len(s) if nxt < 0 else nxt
open(P, 'w', encoding='utf-8').write(s); print('ok', len(N))
