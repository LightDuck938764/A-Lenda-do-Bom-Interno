// Valida os casos clínicos: estrutura, repetição e equilíbrio do tamanho das alternativas.
// uso: node tools/valida.js [prefixo_de_id ...]
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');
global.window = {}; global.document = { createElement: () => ({ getContext: () => ({}) }), getElementById: () => null, addEventListener: () => {} };
const code = fs.readFileSync(path.join(root, 'dist/bundle.js'), 'utf8');
const stop = code.indexOf('/* =====================================================================\n   MAPAS');
const run = new Function(code.slice(0, stop).replace(/'use strict';/, '') + '; return { CASES, AREAS, ALAS_CM };');
const { CASES, AREAS, ALAS_CM } = run();
const pref = process.argv.slice(2);
const sel = pref.length ? CASES.filter(c => pref.some(p => c.id.startsWith(p))) : CASES;
const err = [], warn = []; const ids = new Set(); const conds = {};
for (const c of CASES) { if (ids.has(c.id)) err.push('id repetido ' + c.id); ids.add(c.id); }
let shortCd = 0, longCd = 0, longDx = 0;
for (const c of sel) {
  const E = m => err.push(c.id + ': ' + m), W = m => warn.push(c.id + ': ' + m);
  if (!AREAS[c.area]) E('área inválida');
  for (const k of ['cond', 'qp', 'hda', 'ef', 'pista', 'edx', 'ecd']) if (!c[k]) E('falta ' + k);
  if (!c.tema) W('sem tema');
  if (!c.pac || !c.pac.nome || !c.pac.tipo || !c.pac.sexo) E('pac incompleto');
  if (![1, 2, 3].includes(c.dif)) E('dif inválida');
  for (const f of ['dx', 'cd']) { if (!Array.isArray(c[f]) || c[f].length !== 4 || new Set(c[f]).size !== 4) E(f + ' precisa de 4 opções distintas'); }
  if (c.area === 'cm' && !(ALAS_CM[c.ala])) W('caso de CM sem ala válida');
  if (c.lab) { if (!Array.isArray(c.lab)) E('lab não é lista'); else c.lab.forEach((r, i) => { if (!Array.isArray(r) || (r.length !== 1 && r.length < 2)) E('lab linha ' + i); }); }
  if (c.img) c.img.forEach(im => { if (!fs.existsSync(path.join(root, 'img/casos', im.f))) E('imagem não encontrada ' + im.f); });
  const L = a => a.map(s => s.length);
  const cd = L(c.cd), dx = L(c.dx);
  if (cd[0] > Math.max(...cd.slice(1))) { longCd++; if (cd[0] > 1.15 * Math.max(...cd.slice(1))) W(`conduta correta bem mais longa (${cd.join('/')})`); }
  if (cd[0] < Math.min(...cd.slice(1))) shortCd++;
  if (dx[0] > Math.max(...dx.slice(1))) { longDx++; if (dx[0] > 1.3 * Math.max(...dx.slice(1))) W(`diagnóstico correto bem mais longo (${dx.join('/')})`); }
  const key = c.area + '|' + c.cond.toLowerCase(); if (conds[key]) W('mesma condição que ' + conds[key]); conds[key] = c.id;
}
console.log(`casos verificados: ${sel.length} | conduta correta é a mais longa: ${longCd} (${Math.round(longCd / sel.length * 100)}%) | diagnóstico correto mais longo: ${longDx} (${Math.round(longDx / sel.length * 100)}%) | conduta correta é a mais curta: ${shortCd} (${Math.round(shortCd / sel.length * 100)}%)`);
if (warn.length) console.log('AVISOS:\n  ' + warn.join('\n  '));
if (err.length) { console.log('ERROS:\n  ' + err.join('\n  ')); process.exit(1); }
