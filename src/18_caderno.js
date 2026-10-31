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
// peso do Caderno de Erros (temas em que o jogador mais erra)
function errW(tema) { const s = prioSet(); return s && s.has(tema) ? BAL.prioMult : 1; }
// peso das bancas prioritárias: média do "lift" do grande tema nas bancas escolhidas (até 3)
function bancasAtivas() { return S && S.bancaPrio && Array.isArray(S.bancas) ? S.bancas.filter(id => BANCA_BY[id]) : []; }
// participação média (%) de um grande tema nas bancas escolhidas, comparada à de um tema "médio"
const SUB_MEDIA = 100 / Object.keys(SUBAREAS).length;
function pesoSub(sub, ids) {
  const p = ids.reduce((a, id) => a + (BANCA_BY[id].sh[sub] ?? SUB_MEDIA), 0) / ids.length;
  return Math.max(0.35, Math.min(4, Math.pow(p / SUB_MEDIA, 0.85)));
}
function bancaW(tema) {
  const bs = bancasAtivas(); if (!bs.length) return 1;
  const sub = TEMA_SUB[tema]; return sub ? pesoSub(sub, bs) : 1;
}
function prioW(tema) { return errW(tema) * bancaW(tema); }
// sorteio ponderado pelos temas priorizados (lista de objetos com .tema)
function pickPrio(list, temaFn = x => x.tema) {
  if (!list.length) return null;
  if (!prioSet() && !bancasAtivas().length) return U.pick(list);
  return U.weighted(list.map(x => ({ x, w: prioW(temaFn(x)) }))).x;
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
      <div class="cad-prio-box ${S.bancaPrio && (S.bancas || []).length ? 'on' : ''}">
        <h3>Bancas Prioritárias</h3>
        <p>${(S.bancas || []).length ? `Escolhidas: ${S.bancas.filter(id => BANCA_BY[id]).map(id => '<b>' + U.esc(BANCA_BY[id].nome) + '</b>').join(', ')}${S.bancaPrio ? ' · priorização ligada' : ' · priorização desligada'}.` : 'Treine com foco nos temas que as suas bancas-alvo mais cobram (até 3).'}</p>
        <button class="btn ghost" id="cadBancas">🎯 Escolher bancas</button>
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
  $('#cadBancas').onclick = () => { closeOverlay(); openBancas(); };
  OV().querySelectorAll('[data-cf]').forEach(b => b.onclick = () => { CADF = b.dataset.cf; reopen(openCaderno); });
  const z = $('#cadZera'); if (z) z.onclick = () => confirmBox('Apagar o histórico do caderno de erros? Essa ação não pode ser desfeita.', () => { S.erros = {}; PRIO_CACHE.t = -1; saveGame(); reopen(openCaderno); });
}

/* ---------------- Bancas prioritárias ---------------- */
function bancaInfo(b) {
  if (b.id === 'unicamp') return 'Destaques de análises publicadas das provas anteriores';
  if (b.id === 'febrasgo') return 'Prova de título de GO: só temas de Ginecologia e Obstetrícia';
  return `${b.n} questões de provas de ${b.anos[0] === b.anos[1] ? b.anos[0] : b.anos[0] + '–' + b.anos[1]}${b.n < 40 ? ' · amostra pequena' : ''}`;
}
// grandes temas em foco com as bancas escolhidas (mesma conta do sorteio)
function bancaFoco(ids) {
  const subs = Object.keys(SUBAREAS);
  return subs.map(s => ({ s, w: pesoSub(s, ids) })).filter(x => x.w >= 1.15).sort((a, b) => b.w - a.w).slice(0, 6);
}
function openBancas() {
  if (!Array.isArray(S.bancas)) S.bancas = [];
  S.bancas = S.bancas.filter(id => BANCA_BY[id]).slice(0, 3);
  const sel = S.bancas, on = !!S.bancaPrio, cheio = sel.length >= 3;
  const chip = id => { const b = BANCA_BY[id], ativo = sel.includes(id); return `<button class="chip bc-chip ${ativo ? 'on' : ''}" data-b="${id}" ${!ativo && cheio ? 'aria-disabled="true"' : ''}>${ativo ? '✓ ' : ''}${U.esc(b.nome)}</button>`; };
  const grupos = BANCA_GRUPOS.map(([g, ids]) => `<h4>${g}</h4><div class="chips">${ids.map(chip).join('')}</div>`).join('');
  const fmt = x => x.toFixed(1).replace('.', ',');
  const foco = sel.length ? bancaFoco(sel) : [];
  const cards = sel.map(id => {
    const b = BANCA_BY[id];
    const linhas = b.top.map(([s, p]) => p == null ? `<li><span>${U.esc(SUBAREAS[s])}</span><em>destaque</em></li>`
      : `<li><span>${U.esc(SUBAREAS[s])}</span><div class="bc-bar"><i style="width:${Math.min(100, p * 3)}%"></i></div><em>${p}%</em></li>`).join('');
    return `<article class="bc-card"><header><b>${U.esc(b.nome)}</b><small>${bancaInfo(b)}</small></header><p class="bc-sub">Mais cobrados</p><ol class="bc-top">${linhas}</ol></article>`;
  }).join('');
  const main = sel.length ? `
      <div class="bc-foco ${on ? 'on' : ''}"><h3>${on ? 'Em foco agora' : 'Em foco quando ligar'}</h3>
        <ul>${foco.map(x => `<li><span>${U.esc(SUBAREAS[x.s])}</span><b>×${fmt(x.w)}</b></li>`).join('') || '<li><span>Sem diferença marcante entre os temas destas bancas.</span></li>'}</ul>
        <p class="hint">Casos, emergências, dúvidas e perguntas desses temas aparecem mais vezes; os temas que essas bancas quase não cobram aparecem menos.</p></div>
      <div class="bc-cards">${cards}</div>`
    : '<p class="bc-vazio">Escolha até 3 bancas na lista ao lado para ver o que cada uma mais cobra e treinar com foco nelas.</p>';
  const body = `<div class="bancas">
    <section class="bc-side">
      <p>Escolha até <b>3 bancas</b>. Com a priorização ligada, os casos e perguntas dos temas que elas mais cobram aparecem com mais frequência em todos os setores.</p>
      <div class="row"><button class="btn ${on ? '' : 'ghost'}" id="bcPrio" aria-pressed="${on}" ${sel.length ? '' : 'disabled'}>${on ? '● Priorização por banca ligada' : '○ Ligar priorização por banca'}</button><span class="hint">${sel.length}/3 escolhidas</span></div>
      ${grupos}
      <p class="disclaimer">Frequências calculadas a partir de questões de provas anteriores, agrupadas por grande tema. É uma tendência, não uma previsão da próxima prova. Funciona junto com o Caderno de Erros.</p>
    </section>
    <section class="bc-main">${main}</section></div>`;
  openPanel('bancas', 'Bancas Prioritárias', body, { cls: 'wide' });
  OV().querySelectorAll('[data-b]').forEach(bt => bt.onclick = () => {
    const id = bt.dataset.b, i = S.bancas.indexOf(id);
    if (i >= 0) S.bancas.splice(i, 1);
    else if (S.bancas.length >= 3) { toast('Você já escolheu 3 bancas. Tire uma para trocar.', 'bad'); return; }
    else { S.bancas.push(id); if (S.bancas.length === 1 && !S.bancaPrio) S.bancaPrio = true; }
    if (!S.bancas.length) S.bancaPrio = false;
    SFX.play('ui'); saveGame(); reopen(openBancas);
  });
  $('#bcPrio').onclick = () => {
    if (!S.bancas.length) return;
    S.bancaPrio = !S.bancaPrio; SFX.play(S.bancaPrio ? 'quest' : 'ui');
    toast(S.bancaPrio ? `<b>Priorização por banca ligada.</b> Foco em ${S.bancas.map(id => U.esc(BANCA_BY[id].nome)).join(', ')}.` : 'Priorização por banca desligada.');
    saveGame(); reopen(openBancas);
  };
}
