/* =====================================================================
   ATENDIMENTO DE EMERGÊNCIA (eventos esporádicos por estágio)
   Três decisões em sequência, com explicação após cada uma.
   ===================================================================== */
function startEmergencia(ps) {
  ps.attending = true; SFX.play('ui');
  const E = ps.E; let k = 0, acertos = 0; const erros = [];
  const o = encOpen('agit psy emerg', `<header class="enc-head"><p class="eyebrow">⚠ Emergência · ${U.esc(AREAS[E.area].nome)}</p><div class="psy-top"><div class="ch-port"></div><div><h2>${U.esc(E.titulo)}</h2><p><b>${U.esc(E.chamador.nome)}:</b> "${U.esc(E.chamador.fala)}"</p><p>${U.esc(E.quadro)}</p></div></div>
    <p class="hint">Simulação educacional: priorize segurança, sequência correta e acionamento da equipe.</p></header><div class="bmain" id="eMain"></div>`);
  OV().querySelector('.ch-port').appendChild(portraitCanvas(ps.ent.look, 84, 84, { crop: true, scale: 4 }));
  const step = () => {
    const m = document.getElementById('eMain'); if (!m) return;
    if (k >= E.r.length) return end();
    const r = E.r[k]; const opts = U.shuffle([r.ok, ...r.ruins]);
    m.innerHTML = `<div class="quick"><p class="eyebrow">Decisão ${k + 1} de ${E.r.length}</p><p class="q">${U.esc(r.q)}</p><div class="opts">${opts.map((t, i) => `<button class="opt" data-i="${i}"><span class="ol">${'ABCD'[i]}</span><span class="otx">${U.esc(t)}</span></button>`).join('')}</div></div>`;
    m.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const ok = opts[+b.dataset.i] === r.ok; if (ok) acertos++; else erros.push(r.exp);
      SFX.play(ok ? 'ok' : 'bad');
      m.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (opts[+x.dataset.i] === r.ok) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      m.insertAdjacentHTML('beforeend', `<div class="fb ${ok ? 'good' : 'bad'}"><b>${ok ? 'Decisão correta.' : 'Não é a melhor conduta.'}</b> ${U.esc(r.exp)}</div><button class="btn" id="eNext">${k + 1 < E.r.length ? 'Continuar' : 'Ver desfecho'}</button>`);
      const nx = document.getElementById('eNext'); nx.onclick = () => { k++; step(); }; nx.focus();
    });
  };
  const end = () => {
    const m = document.getElementById('eMain'); let rew;
    const ok = acertos >= 2;
    logErro(E.tema, ok, E.area, erros.length ? erros.join(' ') : E.r.map(r => r.exp).join(' '));
    if (ok) {
      S.stats.emerg = (S.stats.emerg || 0) + 1; S.stats.eventos++;
      const xp = addXP(80 * BAL.xpMult(S.rep)); const co = addCoins(18); const rp = addRep(acertos === 3 ? 6 : 4, 'emergência');
      rew = `<p class="good big">Emergência conduzida (${acertos}/${E.r.length}).</p><p>${U.esc(E.desfecho || 'O paciente foi estabilizado e encaminhado com segurança.')}</p><div class="rewards"><span>+${xp} XP</span><span>+${co} ${MOEDA_CURTA}</span><span class="pos">+${rp} reputação</span></div>`;
      if (S.stats.emerg >= 5) unlockAch('emerg5');
    } else if (acertos === 1) { const xp = addXP(30 * BAL.xpMult(S.rep)); rew = `<p class="big">A equipe completou o atendimento com você (${acertos}/${E.r.length}).</p><p>Revise os pontos abaixo: a sequência importa.</p><div class="rewards"><span>+${xp} XP</span></div>`; }
    else { const rp = addRep(-5, 'emergência'); rew = `<p class="bad big">A equipe precisou assumir o atendimento (${acertos}/${E.r.length}).</p><p>Revise os pontos abaixo (${rp} reputação). O tema foi anotado no seu caderno de erros.</p>`; }
    m.innerHTML = `<div class="result">${rew}<ul class="proc-log">${E.resumo.map(t => `<li>${U.esc(t)}</li>`).join('')}</ul><div class="res-acts">${repBotao({ tipo: 'emergencia', id: E.id || E.titulo, titulo: E.titulo })}<button class="btn" id="eOk">Voltar ao plantão</button></div></div>`;
    bindRepBotoes(m);
    document.getElementById('eOk').onclick = () => { G.npcs = G.npcs.filter(x => x !== ps.ent); if (G.psy === ps) G.psy = null; closeOverlay(); checkAch(); saveGame(); };
  };
  step();
}
