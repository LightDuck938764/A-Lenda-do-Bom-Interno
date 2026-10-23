/* =====================================================================
   CADERNO DE ERROS + "PRIORIZAR TEMAS"
   Cada caso, pergunta, emergência ou dúvida respondida registra o tema.
   O caderno mostra onde o jogador mais erra e, com "Priorizar Temas"
   ligado, esses temas passam a aparecer com mais frequência.
   ===================================================================== */
function temaDe(c) { return (c && (c.tema || c.cond)) || 'Outros'; }
function logErro(tema, ok, area, dica) {
  if (!S || !tema) return;
  if (!S.erros || typeof S.erros !== 'object') S.erros = {};
  const r = S.erros[tema] || (S.erros[tema] = { n: 0, e: 0, a: null, t: 0, d: '' });
  r.n++;
  if (area && AREAS[area]) r.a = area;
  if (!ok) { r.e++; r.t = Date.now(); if (dica) r.d = String(dica).replace(/\s+/g, ' ').trim().slice(0, 600); }
  else r.ok = (r.ok || 0) + 1;
}
// pontuação de "tema fraco": muitos erros e taxa de erro alta pesam mais
function erroScore(r) { if (!r || !r.e) return 0; const taxa = r.e / r.n; return r.e * taxa * (taxa >= 0.34 ? 1 : 0.4); }
function temasFracos(n = 5) {
  const E = (S && S.erros) || {};
  return Object.entries(E).filter(([, r]) => r.e > 0 && r.e / r.n >= 0.34).sort((a, b) => erroScore(b[1]) - erroScore(a[1]) || b[1].t - a[1].t).slice(0, n).map(([k]) => k);
}
let PRIO_CACHE = { t: -1, set: new Set() };
function prioSet() {
  if (!S || !S.priorizar) return null;
  if (PRIO_CACHE.t !== S.playTime) PRIO_CACHE = { t: S.playTime, set: new Set(temasFracos(5)) };
  return PRIO_CACHE.set.size ? PRIO_CACHE.set : null;
}
function prioW(tema) { const s = prioSet(); return s && s.has(tema) ? BAL.prioMult : 1; }
// sorteio ponderado pelos temas priorizados (lista de objetos com .tema)
function pickPrio(list, temaFn = x => x.tema) {
  if (!list.length) return null;
  const s = prioSet(); if (!s) return U.pick(list);
  return U.weighted(list.map(x => ({ x, w: s.has(temaFn(x)) ? BAL.prioMult : 1 }))).x;
}

/* ---------------- Painel ---------------- */
let CADF = 'todos';
function openCaderno() {
  const E = (S.erros = S.erros || {});
  const all = Object.entries(E);
  const comErro = all.filter(([, r]) => r.e > 0).sort((a, b) => erroScore(b[1]) - erroScore(a[1]) || b[1].e - a[1].e);
  const fracos = new Set(temasFracos(5));
  const dominados = all.filter(([, r]) => r.n >= 2 && r.e / r.n < 0.34).length;
  const tot = all.reduce((s, [, r]) => s + r.n, 0), totE = all.reduce((s, [, r]) => s + r.e, 0);
  const areas = [...new Set(comErro.map(([, r]) => r.a).filter(Boolean))];
  const lista = comErro.filter(([, r]) => CADF === 'todos' || r.a === CADF);
  const tag = a => a && AREAS[a] ? `<span class="tag" style="--ac:${AREAS[a].cor}">${AREAS[a].curto}</span>` : '<span class="tag" style="--ac:#8a94a0">GERAL</span>';
  const rows = lista.map(([k, r], i) => {
    const taxa = Math.round(r.e / r.n * 100);
    return `<li class="cad-row ${fracos.has(k) ? 'fraco' : ''}"><div class="cad-top"><span class="cad-n">${i + 1}</span>${tag(r.a)}<b>${U.esc(k)}</b>${fracos.has(k) ? '<span class="cad-prio" title="Entre os temas que você mais erra">★ foco</span>' : ''}</div>
      <div class="cad-bar" aria-label="Taxa de erro ${taxa}%"><i style="width:${taxa}%"></i></div>
      <small>${r.e} erro${r.e > 1 ? 's' : ''} em ${r.n} tentativa${r.n > 1 ? 's' : ''} · ${taxa}% de erro</small>
      ${r.d ? `<details><summary>Revisar o ponto-chave</summary><p>${U.esc(r.d)}</p></details>` : ''}</li>`;
  }).join('') || `<li class="empty">${comErro.length ? 'Nenhum tema com erro neste filtro.' : 'Seu caderno ainda está em branco. Cada caso, pergunta, emergência ou dúvida em que você errar entra aqui, com o ponto-chave para revisar.'}</li>`;
  const on = !!S.priorizar;
  const fr = [...fracos];
  const body = `<div class="caderno">
    <section class="cad-side">
      <div class="cad-sum"><div><b>${comErro.length}</b><small>temas com erro</small></div><div><b>${tot ? Math.round((tot - totE) / tot * 100) : 0}%</b><small>de acerto geral</small></div><div><b>${dominados}</b><small>temas dominados</small></div></div>
      <div class="cad-prio-box ${on ? 'on' : ''}">
        <h3>Priorizar Temas</h3>
        <p>Com a opção ligada, casos, perguntas de prova, emergências e dúvidas dos temas em que você mais erra aparecem <b>${BAL.prioMult}× mais</b> nos setores correspondentes.</p>
        ${fr.length ? `<p class="hint">Foco atual: ${fr.map(t => '<b>' + U.esc(t) + '</b>').join(', ')}.</p>` : '<p class="hint">Ainda não há temas com erro suficiente para priorizar.</p>'}
        <button class="btn ${on ? '' : 'ghost'}" id="cadPrio" aria-pressed="${on}">${on ? '● Priorização ligada' : '○ Ligar priorização'}</button>
      </div>
      <p class="hint">Como usar: estude os temas do topo da lista, volte ao setor e atenda de novo. A taxa de erro cai a cada acerto, e o tema sai do foco quando você passa a acertar.</p>
      ${comErro.length ? '<button class="btn ghost small" id="cadZera">Recomeçar o caderno</button>' : ''}
    </section>
    <section class="cad-main">
      <div class="chips cad-filt"><button class="chip ${CADF === 'todos' ? 'on' : ''}" data-cf="todos">Todos</button>${areas.map(a => `<button class="chip ${CADF === a ? 'on' : ''}" data-cf="${a}">${AREAS[a].curto}</button>`).join('')}</div>
      <ol class="cad-list">${rows}</ol>
    </section></div>`;
  openPanel('caderno', 'Caderno de Erros', body, { cls: 'wide' });
  $('#cadPrio').onclick = () => { S.priorizar = !S.priorizar; PRIO_CACHE.t = -1; SFX.play(S.priorizar ? 'quest' : 'ui'); toast(S.priorizar ? '<b>Priorizar Temas ligado.</b> Seus temas fracos vão aparecer com mais frequência.' : 'Priorizar Temas desligado.'); saveGame(); reopen(openCaderno); };
  OV().querySelectorAll('[data-cf]').forEach(b => b.onclick = () => { CADF = b.dataset.cf; reopen(openCaderno); });
  const z = $('#cadZera'); if (z) z.onclick = () => confirmBox('Apagar o histórico do caderno de erros? Essa ação não pode ser desfeita.', () => { S.erros = {}; PRIO_CACHE.t = -1; saveGame(); reopen(openCaderno); });
}
