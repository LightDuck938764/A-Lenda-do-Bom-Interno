/* =====================================================================
   ENCONTROS: casos clínicos, perguntas rápidas, triagens, desafios de
   capítulo e procedimentos simulados
   ===================================================================== */
function encOpen(cls, html, mode = 'encounter') { G.mode = mode; G.keys = {}; return setOverlay(`<div class="enc ${cls}">${html}</div>`, 'enc-wrap'); }
function timerLoop(getRemain, onTick, onEnd) {
  let last = performance.now(), alive = true;
  const f = now => { if (!alive) return; const dt = Math.min(0.1, (now - last) / 1000); last = now; const r = getRemain(dt); onTick(r); if (r <= 0) { alive = false; onEnd(); return; } requestAnimationFrame(f); };
  requestAnimationFrame(f);
  return () => { alive = false; };
}

/* ---------------- Bônus de tempo, pistas e eliminações ---------------- */
const SKILL_CLUE_TAGS = { med3: 'ef', med7: 'ecg', med8: 'gaso', med9: 'img', med11: 'neuro', med12: 'usg', med15: 'choque', med16: 'cardio', farm14: 'intox', farm16: 'sepse', farm17: 'cad', farm18: 'obst' };
const FARM_TAGS = ['farm2', 'farm3', 'farm4', 'farm5', 'farm6', 'farm7', 'farm8', 'farm9', 'farm10', 'farm11', 'farm12', 'farm14', 'farm15', 'farm16', 'farm17', 'farm18', 'farm19'];
function caseBonuses(c) {
  const st = stats(); const tags = c.tags || []; const out = { time: BAL.caseTime[c.dif] + FORM.tempoFoco(st), notes: [], clue: false, elimCd: 0 };
  const add = (s, why) => { out.time += s; out.notes.push(`+${s}s ${why}`); };
  for (const it of equippedItems()) {
    const tt = it.fx.toolTags || []; if (tt.some(t => tags.includes(t))) { add(it.fx.tagTime || 10, it.nome); out.clue = true; }
    if (it.fx.areaTime && it.fx.areaTime[c.area]) add(it.fx.areaTime[c.area], it.nome);
    if (it.fx.areaClue === c.area) { out.clue = true; out.notes.push('pista: ' + it.nome); }
  }
  if (fx('timeBonus')) add(fx('timeBonus'), '"Ritalina" do RPG');
  if (hasSkill('med2') && tags.includes('ef')) add(8, 'Inspeção Sistemática');
  if (hasSkill('med5') && c.area === 'upa') add(10, 'ABCDE Instintivo');
  if (hasSkill('med11') && tags.includes('neuro')) add(10, 'Exame Neurológico Fino');
  if (hasSkill('med12') && tags.includes('usg') && S.equip.mao === 'ultrassom') add(10, 'POCUS de Bolso');
  if (hasSkill('med14') && tags.includes('resp')) add(8, 'Via Aérea Sob Controle');
  if (hasSkill('med17') && c.dif === 3) add(15, 'Multimorbidade');
  if (hasSkill('med20')) { add(12, 'Mestre do Plantão'); out.clue = true; }
  for (const [sk, tg] of Object.entries(SKILL_CLUE_TAGS)) if (hasSkill(sk) && tags.includes(tg)) { out.clue = true; out.notes.push('pista: ' + SKILLS[sk].nome); }
  if (!out.clue) { const ch = FORM.pistaAuto(st) + (fx('autoClue') || 0) + (hasSkill('med1') ? 0.1 : 0); if (Math.random() < ch) { out.clue = true; out.notes.push('pista automática (Conhecimento/itens)'); } }
  if (FARM_TAGS.some(k => hasSkill(k) && (SKILLS[k].tag === 'ped' ? c.area === 'ped' : tags.includes(SKILLS[k].tag)))) { out.elimCd = 1; out.notes.push('uma conduta errada eliminada (Medicamentos)'); }
  if (hasSkill('farm20')) { out.elimCd = Math.min(2, out.elimCd + 1); }
  return out;
}

/* ---------------- Executor de caso clínico (reutilizado nos chefes) ---------------- */
/* ---------------- Exames: tabela de laboratório e imagens ampliáveis ---------------- */
// lab: [['Hemoglobina', '8,2 g/dL', '12 a 16 g/dL'], ...] — o 3º item (referência) é opcional;
// uma linha com um único texto vira subtítulo (ex.: ['Gasometria arterial']).
function labTableHTML(rows) {
  return `<table class="lab"><thead><tr><th>Exame</th><th>Resultado</th><th>Referência</th></tr></thead><tbody>${rows.map(r => r.length === 1
    ? `<tr class="lab-sub"><td colspan="3">${U.esc(r[0])}</td></tr>`
    : `<tr><td>${U.esc(r[0])}</td><td><b>${U.esc(r[1])}</b></td><td>${U.esc(r[2] || '')}</td></tr>`).join('')}</tbody></table>`;
}
// img: [{ f: 'arquivo.jpg', t: 'legenda neutra (sem dar a resposta)' }]
const IMG_BASE = 'img/casos/';
function caseImgsHTML(list) {
  return `<div class="cimgs">${list.map((im, i) => `<button class="cimg" data-i="${i}" data-src="${U.esc(IMG_BASE + im.f)}" data-t="${U.esc(im.t || '')}"><img src="${U.esc(IMG_BASE + im.f)}" alt="${U.esc(im.t || 'Exame')}" loading="lazy"><span>${U.esc(im.t || '')}</span><i>🔍 ampliar</i></button>`).join('')}</div>`;
}
function bindCaseImgs(host) {
  host.querySelectorAll('.cimg').forEach(b => b.onclick = () => openLightbox(b.dataset.src, b.dataset.t));
  host.querySelectorAll('.cimg img').forEach(im => im.onerror = () => { im.closest('.cimg').classList.add('broken'); });
}
function openLightbox(src, t) {
  const lb = document.createElement('div'); lb.className = 'lightbox'; lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', t || 'Exame');
  lb.innerHTML = `<figure><div class="lb-scroll"><img src="${U.esc(src)}" alt="${U.esc(t || 'Exame')}"></div><figcaption>${U.esc(t || '')} <small>Clique na imagem para aproximar · Esc para fechar</small></figcaption></figure><button class="lb-x" aria-label="Fechar">✕</button>`;
  const close = () => { lb.remove(); document.removeEventListener('keydown', key, true); };
  const key = e => { if (e.key === 'Escape') { e.stopPropagation(); e.preventDefault(); close(); } };
  lb.onclick = e => { if (e.target === lb || e.target.classList.contains('lb-x')) close(); };
  lb.querySelector('img').onclick = e => { e.stopPropagation(); lb.classList.toggle('zoom'); };
  document.addEventListener('keydown', key, true);
  document.body.appendChild(lb); lb.querySelector('.lb-x').focus();
}

function CaseRunner(host, c, opts = {}) {
  const bon = caseBonuses(c);
  const total = Math.max(25, Math.round(bon.time * (opts.timeMult || 1)));
  const R = { c, total, remain: total, phase: 'apres', clue: bon.clue, clueAsked: false, ddUsed: false, revUsed: false, revised: false,
    dx: U.shuffle(c.dx.map((t, i) => ({ t, ok: i === 0 }))), cd: U.shuffle(c.cd.map((t, i) => ({ t, ok: i === 0 }))), dxPick: null, cdPick: null, elimDx: new Set(), elimCd: new Set() };
  // eliminações automáticas
  const elimWrong = (arr, set, n) => { const wrong = arr.map((o, i) => ({ o, i })).filter(x => !x.o.ok && !set.has(x.i)); U.shuffle(wrong).slice(0, n).forEach(x => set.add(x.i)); };
  elimWrong(R.cd, R.elimCd, bon.elimCd + (opts.elimExtra || 0));
  if (opts.elimExtra) elimWrong(R.dx, R.elimDx, 1);
  // borrões da reputação negativa
  let rate = BAL.blurRate(S.rep) * Math.max(0, 1 - (fx('blurReduce') || 0) - (hasSkill('med4') ? 0.4 : 0));
  const blurred = new Set(); let bid = 0;
  const blurText = (txt, field) => {
    if (!txt) return '';
    if (rate <= 0 || (field === 'ef' && hasSkill('med2'))) return U.esc(txt);
    return txt.split(/(\s+)/).map(w => { if (/\s/.test(w) || w.length < 4 || /\d/.test(w)) return U.esc(w); const id = 'b' + (bid++); if (Math.random() < rate) { blurred.add(id); return `<span class="blur" data-b="${id}" title="Clique para investigar (2 energia)">${U.esc(w)}</span>`; } return U.esc(w); }).join('');
  };
  const p = c.pac;
  const fields = [['Queixa principal', c.qp, 'qp'], ['História da doença atual', c.hda, 'hda'], ['Antecedentes e medicações', c.ant, 'ant'], ['Exame físico', c.ef, 'ef'], ['Sinais vitais', c.sv, 'sv'], ['Exames laboratoriais', c.lab, 'lab'], ['Exames complementares', c.ex, 'ex'], ['Imagem / ultrassonografia', c.usg, 'usg'], ['Exames de imagem e traçados', c.img, 'img']].filter(f => f[1] && (!Array.isArray(f[1]) || f[1].length));
  const chartHTML = fields.map(([l, t, k]) => `<div class="fld-c ${k === 'lab' || k === 'img' ? 'fld-x' : ''}"><dt>${l}</dt><dd>${k === 'lab' ? labTableHTML(t) : k === 'img' ? caseImgsHTML(t) : k === 'qp' || k === 'sv' ? U.esc(t) : blurText(t, k)}</dd></div>`).join('');
  const tipoTxt = { bebe: 'Lactente/RN', crianca: 'Criança', adolescente: 'Adolescente', idoso: 'Idoso(a)', gestante: 'Gestante', adulto: 'Adulto(a)' }[p.tipo] || '';
  host.innerHTML = `
    <header class="case-head"><div class="ch-port"></div><div class="ch-id"><p class="eyebrow">${AREAS[c.area].nome} · ${c.cond ? 'Caso clínico' : ''} · Dificuldade ${'★'.repeat(c.dif)}${'☆'.repeat(3 - c.dif)}</p><h2>${U.esc(p.nome)}</h2><p>${typeof p.idade === 'number' ? p.idade + ' anos' : U.esc(p.idade)} · ${p.sexo === 'F' ? 'Feminino' : 'Masculino'} · ${tipoTxt}</p></div>
      <div class="ch-timer"><div class="tbar"><i id="tFill"></i></div><b id="tTxt">${U.fmtTime(total)}</b><small>${opts.boss ? 'Raciocínio sob pressão' : 'Bônus por rapidez só com acerto'}</small></div></header>
    <ol class="phases"><li data-ph="apres">1 · Apresentação</li><li data-ph="dx">2 · Diagnóstico</li>${opts.dxOnly ? '' : '<li data-ph="cd">3 · Conduta</li>'}<li data-ph="res">${opts.dxOnly ? '3' : '4'} · Resultado</li></ol>
    <div class="case-body"><section class="chart"><dl>${chartHTML}</dl><div id="pistaBox" class="pista" ${R.clue ? '' : 'hidden'}><b>Pista</b> ${U.esc(c.pista || '')}</div></section>
      <aside class="tools"><p class="en">Energia <b id="cEn">${Math.round(S.energia)}</b></p>
        ${blurred.size ? `<p class="warn">Reputação negativa: ${blurred.size} trecho(s) borrado(s). Clique em cada um (2 energia) ou investigue tudo.</p><button class="btn small" id="invAll">Investigar tudo (6 energia)</button>` : ''}
        <button class="btn small ghost" id="askClue" ${R.clue ? 'disabled' : ''}>Pedir pista ao residente (${hasSkill('med4') ? '4 energia' : '8 energia, -15% XP'})</button>
        ${hasSkill('med6') ? '<button class="btn small ghost" id="ddBtn" disabled>Diagnóstico Diferencial (eliminar 1)</button>' : ''}
        ${bon.notes.length ? `<ul class="bon">${bon.notes.map(n => `<li>${U.esc(n)}</li>`).join('')}</ul>` : '<p class="hint">Equipamentos e habilidades compatíveis com o caso aparecem aqui.</p>'}
      </aside></div>
    <footer class="case-foot" id="cFoot"></footer>`;
  bindCaseImgs(host);
  host.querySelector('.ch-port').appendChild(portraitCanvas(opts.look || randomCivilLook(c.id.length * 97 + String(p.idade).length, p.tipo), 84, 84, { crop: true, scale: 4 }));
  const foot = host.querySelector('#cFoot');
  const setPhase = ph => { R.phase = ph; host.querySelectorAll('.phases li').forEach(li => li.classList.toggle('on', li.dataset.ph === ph)); renderFoot(); };
  const enUpd = () => { const e = host.querySelector('#cEn'); if (e) e.textContent = Math.round(S.energia); };
  const spend = n => { if (S.energia < n) { toast('Energia insuficiente. Tome um café ou descanse.', 'bad'); return false; } S.energia -= n; enUpd(); return true; };
  host.querySelectorAll('.blur').forEach(b => b.onclick = () => { if (!b.classList.contains('blur')) return; if (spend(2)) { b.classList.remove('blur'); SFX.play('ui'); } });
  const ia = host.querySelector('#invAll'); if (ia) ia.onclick = () => { if (spend(6)) { host.querySelectorAll('.blur').forEach(b => b.classList.remove('blur')); ia.disabled = true; } };
  host.querySelector('#askClue').onclick = e => { if (R.clue) return; if (spend(hasSkill('med4') ? 4 : 8)) { R.clue = true; R.clueAsked = !hasSkill('med4'); host.querySelector('#pistaBox').hidden = false; e.target.disabled = true; SFX.play('ok'); } };
  const dd = host.querySelector('#ddBtn');
  const opts4 = (arr, elim, pick, kind) => `<div class="opts">${arr.map((o, i) => `<button class="opt ${pick === i ? 'sel' : ''} ${elim.has(i) ? 'elim' : ''}" data-o="${i}" ${elim.has(i) ? 'disabled' : ''}><span class="ol">${'ABCD'[i]}</span>${U.esc(o.t)}</button>`).join('')}</div>`;
  const renderFoot = () => {
    if (R.phase === 'apres') { foot.innerHTML = `<p class="hint">Leia a anamnese, o exame e os exames. O cronômetro já está correndo.</p><button class="btn big" id="goDx">Formular diagnóstico ▸</button>`; foot.querySelector('#goDx').onclick = () => setPhase('dx'); if (dd) dd.disabled = true; return; }
    if (R.phase === 'dx') {
      if (dd) { dd.disabled = R.ddUsed; dd.onclick = () => { if (R.ddUsed) return; R.ddUsed = true; elimWrong(R.dx, R.elimDx, 1); SFX.play('skill'); renderFoot(); }; }
      foot.innerHTML = `<p class="q">Qual o diagnóstico mais provável?</p>${opts4(R.dx, R.elimDx, R.dxPick)}<button class="btn" id="cfDx" ${R.dxPick === null ? 'disabled' : ''}>Confirmar diagnóstico</button>`;
      foot.querySelectorAll('.opt').forEach(b => b.onclick = () => { R.dxPick = +b.dataset.o; SFX.play('ui'); renderFoot(); });
      foot.querySelector('#cfDx').onclick = () => { if (R.dxPick === null) return; if (opts.dxOnly) return finish(false); setPhase('cd'); };
      return;
    }
    if (R.phase === 'cd') {
      if (dd) dd.disabled = true;
      foot.innerHTML = `<p class="q">Diante desse quadro, qual a melhor conduta${c.area === 'cir' ? ' cirúrgica' : ''}?</p>${opts4(R.cd, R.elimCd, R.cdPick)}<button class="btn" id="cfCd" ${R.cdPick === null ? 'disabled' : ''}>Confirmar conduta</button>`;
      foot.querySelectorAll('.opt').forEach(b => b.onclick = () => { R.cdPick = +b.dataset.o; SFX.play('ui'); renderFoot(); });
      foot.querySelector('#cfCd').onclick = () => {
        if (R.cdPick === null) return;
        if (!R.cd[R.cdPick].ok && hasSkill('med19') && !R.revUsed && !opts.boss) { R.revUsed = true; R.revised = true; R.elimCd.add(R.cdPick); R.cdPick = null; SFX.play('skill'); toast('<b>Conduta Baseada em Evidências:</b> a evidência não sustenta essa escolha. Revise (recompensa da conduta pela metade).'); renderFoot(); return; }
        finish(false);
      };
    }
  };
  const stopT = timerLoop(dt => { if (R.phase !== 'res') R.remain -= dt; return R.phase === 'res' ? 1 : R.remain; }, r => {
    const f = host.querySelector('#tFill'), t = host.querySelector('#tTxt'); if (!f) return;
    const fr = Math.max(0, R.remain / total); f.style.width = fr * 100 + '%'; f.className = fr < 0.2 ? 'crit' : fr < 0.5 ? 'warn' : ''; t.textContent = U.fmtTime(R.remain);
  }, () => { if (R.phase !== 'res') finish(true); });
  function finish(timeout) {
    if (R.phase === 'res') return; stopT();
    const used = Math.min(1, (total - Math.max(0, R.remain)) / total);
    const res = { c, dxOk: R.dxPick !== null && R.dx[R.dxPick].ok, cdOk: !opts.dxOnly && R.cdPick !== null && R.cd[R.cdPick].ok, timeout, frac: used, revised: R.revised, clueAsked: R.clueAsked };
    if (opts.dxOnly) res.cdOk = res.dxOk;
    logErro(temaDe(c), res.dxOk && res.cdOk, c.area, (res.dxOk ? '' : c.edx + ' ') + (res.cdOk || opts.dxOnly ? '' : c.ecd));
    setPhase('res');
    const dxRight = R.dx.find(o => o.ok).t, cdRight = R.cd.find(o => o.ok).t;
    let rewardsHTML = '';
    if (!opts.boss) rewardsHTML = applyCaseRewards(res);
    foot.innerHTML = `<div class="result">
      ${timeout ? '<p class="bad">⏱ O tempo acabou. O residente assumiu o caso — veja a resolução abaixo.</p>' : ''}
      <div class="res-row ${res.dxOk ? 'ok' : 'no'}"><b>${res.dxOk ? '✓' : '✗'} Diagnóstico</b><span>Resposta esperada: <b>${U.esc(dxRight)}</b></span><p>${U.esc(c.edx)}</p></div>
      ${opts.dxOnly ? '' : `<div class="res-row ${res.cdOk ? 'ok' : 'no'}"><b>${res.cdOk ? '✓' : '✗'} Conduta${R.revised ? ' (revisada)' : ''}</b><span>Resposta esperada: <b>${U.esc(cdRight)}</b></span><p>${U.esc(c.ecd)}</p></div>`}
      ${rewardsHTML}
      <button class="btn big" id="resOk">Continuar</button></div>`;
    const ro = foot.querySelector('#resOk'); ro.onclick = () => { if (ro.disabled) return; ro.disabled = true; opts.onDone && opts.onDone(res); };
    foot.scrollIntoView({ block: 'nearest' });
    SFX.play(res.dxOk && res.cdOk ? 'win' : res.dxOk || res.cdOk ? 'ok' : 'bad');
  }
  renderFoot(); setPhase('apres');
  return { finish, R };
}

function applyCaseRewards(res) {
  const c = res.c, d = c.dif, tabela = BAL.caseRep[d];
  let rep = 0; const notas = [];
  if (res.timeout && !res.dxOk && !res.cdOk) { let p = -3; if (c.area === 'upa' && hasSkill('med10')) p = -2; rep += p; notas.push(`${p} tempo esgotado`); S.stats.timeouts++; }
  else {
    if (res.dxOk) rep += tabela[0]; else rep += Math.min(0, tabela[1] + (hasSkill('med17') ? 1 : 0));
    if (res.cdOk) rep += res.revised ? Math.ceil(tabela[2] / 2) : tabela[2]; else rep += Math.min(0, tabela[3] + (hasSkill('med17') ? 1 : 0) + (hasSkill('farm1') ? 1 : 0));
  }
  const thr = hasSkill('med18') ? 0.65 : BAL.speedBonusFrac;
  let fast = 0;
  if (res.dxOk && res.cdOk && !res.timeout && res.frac < thr) { fast = 1 + (res.frac < 0.3 ? 1 : 0) + (d === 3 ? 1 : 0); if (hasSkill('med18')) fast *= 2; rep += fast; notas.push(`+${fast} bônus de rapidez`); }
  const part = (res.dxOk ? 0.5 : 0.1) + (res.cdOk ? (res.revised ? 0.3 : 0.5) : 0.1);
  let xpM = 1 + (fx('xpMult') || 0); if (hasSkill('med7') && c.tags.includes('ecg')) xpM += 0.1; if (hasSkill('med16') && c.tags.includes('cardio')) xpM += 0.15; if (res.clueAsked) xpM -= 0.15;
  const xp = addXP(BAL.caseXP[d] * part * BAL.xpMult(S.rep) * xpM);
  let coins = BAL.caseCoins[d] * ((res.dxOk ? 0.5 : 0) + (res.cdOk ? 0.5 : 0)) * BAL.coinMult(S.rep) * (hasSkill('farm1') ? 1.05 : 1) * (fast ? 1.2 : 1);
  coins = addCoins(coins);
  const repApplied = addRep(rep, 'caso');
  S.stats.cases++; if (res.dxOk) S.stats.dxOk++; if (res.cdOk) S.stats.cdOk++;
  if (res.dxOk && res.cdOk) { S.stats.both++; S.stats.streak++; S.stats.best = Math.max(S.stats.best, S.stats.streak); } else S.stats.streak = 0;
  S.seen.push(c.id); if (S.seen.length > 14) S.seen.shift();
  let drop = '';
  if (res.dxOk && res.cdOk && Math.random() < BAL.dropChanceCase * BAL.dropMult(S.rep)) { const it = rollLoot(); if (it && invAdd(it)) { drop = `<p class="drop">🎁 O paciente agradecido deixou um presente: <b>${ITEMS[it].nome}</b> ${rarTag(ITEMS[it].rar)}</p>`; } }
  checkAch();
  return `<div class="rewards"><span>+${xp} XP</span><span>+${coins} ${MOEDA_CURTA}</span><span class="${repApplied >= 0 ? 'pos' : 'neg'}">${repApplied >= 0 ? '+' : ''}${repApplied} reputação</span><span>Tempo: ${Math.round(res.frac * 100)}% usado</span>${notas.map(n => `<span>${n}</span>`).join('')}</div>${drop}`;
}

function startCase(c, spot) {
  SFX.play('ui');
  const o = encOpen('case', '<div id="caseHost" class="case-host"></div>');
  CaseRunner(o.querySelector('#caseHost'), c, { spot, look: spot && spot.s.look, onDone: res => {
    if (spot) spotDone(spot);
    closeOverlay();
    onMainEvent('case', { area: c.area, local: spot && spot.obj.local, res });
    saveGame();
  } });
}

/* ---------------- Pergunta rápida ---------------- */
function QuickRunner(host, q, opts = {}) {
  const time = opts.time || 15; let remain = time, done = false;
  const ord = U.shuffle(q.o.map((t, i) => ({ t, ok: i === 0 })));
  const veil = opts.veil || 0; let veilT = veil;
  host.innerHTML = `<div class="quick"><div class="tbar"><i id="qFill"></i></div>${q.img ? '<div class="qfig-wrap"><canvas class="qfig"></canvas></div>' : ''}<p class="q">${U.esc(q.q)}</p><div class="opts ${veil ? 'veiled' : ''}" id="qOpts">${ord.map((o, i) => `<button class="opt" data-o="${i}"><span class="ol">${'ABCD'[i]}</span><span class="otx">${U.esc(o.t)}</span></button>`).join('')}</div>${veil ? '<button class="btn small ghost" id="unveil">"Doutor, seja objetivo" (5 energia)</button>' : ''}<p class="qexp" hidden></p></div>`;
  if (q.img) drawFig(host.querySelector('.qfig'), q.img);
  const stop = timerLoop(dt => { if (!done) { remain -= dt; if (veilT > 0) { veilT -= dt; if (veilT <= 0) host.querySelector('#qOpts').classList.remove('veiled'); } } return done ? 1 : remain; }, () => { const f = host.querySelector('#qFill'); if (f) { f.style.width = Math.max(0, remain / time * 100) + '%'; f.className = remain / time < 0.25 ? 'crit' : ''; } }, () => end(-1));
  const uv = host.querySelector('#unveil'); if (uv) uv.onclick = () => { if (S.energia >= 5) { S.energia -= 5; veilT = 0; host.querySelector('#qOpts').classList.remove('veiled'); uv.remove(); } else toast('Energia insuficiente.', 'bad'); };
  host.querySelectorAll('.opt').forEach(b => b.onclick = () => { if (veilT > 0) return; end(+b.dataset.o); });
  function end(i) {
    if (done) return; done = true; stop();
    const ok = i >= 0 && ord[i].ok;
    if (q.tema) logErro(q.tema, ok, q.a, q.e);
    host.querySelectorAll('.opt').forEach((b, k) => { b.disabled = true; if (ord[k].ok) b.classList.add('right'); else if (k === i) b.classList.add('wrong'); });
    const ex = host.querySelector('.qexp'); ex.hidden = false; ex.innerHTML = `${ok ? '✓ Correto!' : i < 0 ? '⏱ Tempo esgotado.' : '✗ Incorreto.'} ${U.esc(q.e || '')}`;
    SFX.play(ok ? 'ok' : 'bad');
    setTimeout(() => opts.onDone && opts.onDone(ok, remain / time), opts.delay ?? 1300);
  }
}
function pickQuick(area) { const pool = QUICK.filter(q => q.a === area); return pickPrio(pool.length ? pool : QUICK); }

/* ---------------- Triagem (ordenar por prioridade) ---------------- */
function TriageRunner(host, set, opts = {}) {
  const time = opts.time || 40; let remain = time, done = false; const picks = [];
  const cards = U.shuffle(set.map((p, i) => Object.assign({ i }, p)));
  const render = () => {
    host.innerHTML = `<div class="triage"><div class="tbar"><i id="trFill"></i></div><p class="q">${opts.titulo || 'Clique nos pacientes do MAIS urgente para o MENOS urgente.'}</p>
      <div class="tr-cards">${cards.map(cd => { const k = picks.indexOf(cd.i); return `<button class="tr-card ${k >= 0 ? 'on' : ''}" data-i="${cd.i}"><span class="tr-n">${k >= 0 ? k + 1 : '?'}</span>${U.esc(cd.t)}</button>`; }).join('')}</div>
      <div class="row"><button class="btn ghost small" id="trReset">Refazer</button><button class="btn" id="trOk" ${picks.length === set.length ? '' : 'disabled'}>Confirmar ordem</button></div><div class="tr-res" hidden></div></div>`;
    host.querySelectorAll('.tr-card').forEach(b => b.onclick = () => { if (done) return; const i = +b.dataset.i; if (!picks.includes(i)) picks.push(i); SFX.play('ui'); render(); });
    host.querySelector('#trReset').onclick = () => { if (done) return; picks.length = 0; render(); };
    host.querySelector('#trOk').onclick = () => end();
  };
  render();
  const stop = timerLoop(dt => { if (!done) remain -= dt; return done ? 1 : remain; }, () => { const f = host.querySelector('#trFill'); if (f) { f.style.width = Math.max(0, remain / time * 100) + '%'; f.className = remain / time < 0.25 ? 'crit' : ''; } }, () => end());
  function end() {
    if (done) return; done = true; stop();
    const correct = set.map((p, i) => ({ p: p.p, i })).sort((a, b) => a.p - b.p).map(x => x.i);
    let ok = 0; correct.forEach((ci, k) => { if (picks[k] === ci) ok++; });
    const score = ok / set.length;
    logErro(opts.tema || 'Classificação de risco e priorização', score >= 0.75, opts.area, 'Ordem correta: ' + correct.map(i => set[i].t).join(' → '));
    const r = host.querySelector('.tr-res'); r.hidden = false;
    r.innerHTML = `<p>${ok}/${set.length} posições corretas.</p><ol>${correct.map(i => `<li>${U.esc(set[i].t)}</li>`).join('')}</ol>`;
    host.querySelectorAll('.tr-card,#trOk,#trReset').forEach(b => b.disabled = true);
    SFX.play(score >= 0.75 ? 'ok' : 'bad');
    setTimeout(() => opts.onDone && opts.onDone(score), opts.delay ?? 2200);
  }
}

/* ---------------- Rodadas de classificação (idade / abortamento / momento do checklist / comunicação) ---------------- */
function ChoiceRounds(host, rounds, opts) {
  // rounds: [{t, o:[...], r:index, e?}]
  let k = 0, ok = 0;
  const next = () => {
    if (k >= rounds.length) return opts.onDone(ok / rounds.length, ok);
    const rd = rounds[k]; const time = opts.time || 15; let remain = time, done = false;
    host.innerHTML = `<div class="quick"><p class="eyebrow">${opts.titulo || ''} · ${k + 1}/${rounds.length}</p><div class="tbar"><i id="qFill"></i></div><p class="q">${U.esc(rd.t)}</p><div class="opts ${rd.o.length > 4 ? 'many' : ''}">${rd.o.map((t, i) => `<button class="opt" data-o="${i}">${U.esc(t)}</button>`).join('')}</div><p class="qexp" hidden></p></div>`;
    const stop = timerLoop(dt => { if (!done) remain -= dt; return done ? 1 : remain; }, () => { const f = host.querySelector('#qFill'); if (f) f.style.width = Math.max(0, remain / time * 100) + '%'; }, () => end(-1));
    host.querySelectorAll('.opt').forEach(b => b.onclick = () => end(+b.dataset.o));
    function end(i) {
      if (done) return; done = true; stop(); const good = i === rd.r; if (good) ok++;
      if (rd.tema || opts.tema) logErro(rd.tema || opts.tema, good, opts.area, rd.t + ' → ' + rd.o[rd.r] + (rd.e && !String(rd.e).startsWith('Resposta') && !String(rd.e).startsWith('Momento') ? '. ' + rd.e : ''));
      host.querySelectorAll('.opt').forEach((b, j) => { b.disabled = true; if (j === rd.r) b.classList.add('right'); else if (j === i) b.classList.add('wrong'); });
      const ex = host.querySelector('.qexp'); ex.hidden = false; ex.textContent = (good ? '✓ ' : '✗ ') + (rd.e || '');
      SFX.play(good ? 'ok' : 'bad'); k++; setTimeout(next, good ? 900 : 1700);
    }
  };
  next();
}
function idadeRounds(n = 6) { return U.shuffle(DESAFIO_IDADE).slice(0, n).map(d => ({ t: d.t, o: IDADE_OPCOES, r: d.r, e: d.e, tema: 'Pediatria por faixa etária' })); }
function abortoRounds(n = 6) { return U.shuffle(DESAFIO_ABORTO).slice(0, n).map(d => ({ t: d.t, o: ABORT_OPCOES, r: d.r, e: 'Resposta: ' + ABORT_OPCOES[d.r], tema: 'Tipos de abortamento' })); }
function checklistRounds(n = 8) { return U.shuffle(CHECKLIST_ITENS).slice(0, n).map(d => ({ t: d.t, o: CHECK_MOMENTOS, r: d.m, e: 'Momento: ' + CHECK_MOMENTOS[d.m], tema: 'Checklist de cirurgia segura' })); }
function prevencaoRounds(n = 6) { return U.shuffle(PREVENCAO_ITENS).slice(0, n).map(d => ({ t: d.t, o: PREV_NIVEIS, r: d.r, e: d.e, tema: 'Níveis de prevenção' })); }
function comunicaRound() { const c = U.pick(COMUNICA); const ord = U.shuffle(c.o.map((t, i) => ({ t, ok: !i }))); return [{ t: c.q, o: ord.map(x => x.t), r: ord.findIndex(x => x.ok), e: 'Comunicação profissional: acolhimento, sigilo e clareza.' }]; }

/* ---------------- Quarto duplo (Clínica Médica) ---------------- */
function QuartoRunner(host, set, opts) {
  const itens = U.shuffle(set.itens); const sel = itens.map(() => null); let done = false;
  const render = () => {
    host.innerHTML = `<div class="quarto"><p class="q">Dois pacientes, um quarto. A quem pertence cada dado?</p><div class="qd-heads"><div><b>${set.a.nome}</b><small>${set.a.dx}</small></div><div><b>${set.b.nome}</b><small>${set.b.dx}</small></div></div>
      <ul class="qd-list">${itens.map((it, i) => `<li><span>${U.esc(it.t)}</span><span class="qd-btns"><button class="chip ${sel[i] === 'a' ? 'on' : ''} ${done ? (it.l === 'a' ? 'right' : sel[i] === 'a' ? 'wrong' : '') : ''}" data-i="${i}" data-l="a">Leito A</button><button class="chip ${sel[i] === 'b' ? 'on' : ''} ${done ? (it.l === 'b' ? 'right' : sel[i] === 'b' ? 'wrong' : '') : ''}" data-i="${i}" data-l="b">Leito B</button></span></li>`).join('')}</ul>
      <button class="btn" id="qdOk" ${sel.every(Boolean) && !done ? '' : 'disabled'}>Confirmar</button></div>`;
    if (!done) host.querySelectorAll('[data-l]').forEach(b => b.onclick = () => { sel[+b.dataset.i] = b.dataset.l; SFX.play('ui'); render(); });
    const okb = host.querySelector('#qdOk'); if (okb) okb.onclick = () => { done = true; const ok = itens.filter((it, i) => sel[i] === it.l).length; render(); SFX.play(ok / itens.length >= 0.7 ? 'ok' : 'bad'); setTimeout(() => opts.onDone(ok / itens.length), 1800); };
  };
  render();
}

/* ---------------- Seleção de materiais ---------------- */
function MateriaisRunner(host, procId, opts) {
  const P = PROCS[procId]; const all = U.shuffle(P.materiais.ok.map(t => ({ t, ok: true })).concat(P.materiais.dist.map(t => ({ t, ok: false }))));
  const sel = new Set(); let done = false; const time = opts.time || 30; let remain = time;
  const hint = opts.hint ? all.findIndex(m => m.ok) : -1;
  const render = () => {
    host.innerHTML = `<div class="mats"><div class="tbar"><i id="mFill"></i></div><p class="q">${U.esc(P.nome)}: selecione os ${P.materiais.ok.length} itens necessários.</p><div class="mat-grid">${all.map((m, i) => `<button class="mat ${sel.has(i) ? 'on' : ''} ${done ? (m.ok ? 'right' : sel.has(i) ? 'wrong' : '') : ''} ${i === hint && !done ? 'hint' : ''}" data-i="${i}">${U.esc(m.t)}</button>`).join('')}</div><button class="btn" id="mOk" ${done ? 'disabled' : ''}>Confirmar materiais (${sel.size})</button></div>`;
    if (!done) { host.querySelectorAll('.mat').forEach(b => b.onclick = () => { const i = +b.dataset.i; sel.has(i) ? sel.delete(i) : sel.add(i); SFX.play('ui'); render(); }); host.querySelector('#mOk').onclick = () => end(); }
  };
  render();
  const stop = timerLoop(dt => { if (!done) remain -= dt; return done ? 1 : remain; }, () => { const f = host.querySelector('#mFill'); if (f) f.style.width = Math.max(0, remain / time * 100) + '%'; }, () => end());
  function end() { if (done) return; done = true; stop(); let s = 0; all.forEach((m, i) => { if (m.ok && sel.has(i)) s++; if (!m.ok && sel.has(i)) s--; }); const score = Math.max(0, s / P.materiais.ok.length); render(); SFX.play(score >= 0.7 ? 'ok' : 'bad'); setTimeout(() => opts.onDone(score), 1600); }
}

/* ---------------- Desafios de capítulo ---------------- */
function startChallenge(ch, area) {
  const titles = { triagem: 'Desafio do Capítulo: A Fila da UPA', idade: 'Desafio do Capítulo: Que idade tem esse caso?', aborto: 'Desafio do Capítulo: Abortamentos', quarto: 'Desafio do Capítulo: O Quarto Duplo', checklist: 'Desafio do Capítulo: Os Três Momentos', prevencao: 'Desafio do Capítulo: Qual Nível de Prevenção?' };
  const o = encOpen('challenge', `<header class="enc-head"><p class="eyebrow">${AREAS[area].nome}</p><h2>${titles[ch]}</h2><p class="hint">Meta: 70% de acertos.</p></header><div id="chHost"></div>`);
  const host = o.querySelector('#chHost');
  const done = score => {
    const ok = score >= 0.7; S.stats.desafios++;
    let msg;
    if (ok) { const xp = addXP(90 * BAL.xpMult(S.rep)); const co = addCoins(35); const rp = addRep(4, 'desafio'); msg = `<p class="good big">Desafio superado! ${Math.round(score * 100)}% de acertos.</p><div class="rewards"><span>+${xp} XP</span><span>+${co} ${MOEDA_CURTA}</span><span class="pos">+${rp} reputação</span></div>`; }
    else { const rp = addRep(-1, 'desafio'); msg = `<p class="bad big">${Math.round(score * 100)}% — abaixo da meta de 70%.</p><p>Revise as explicações e tente novamente quando quiser (${rp} reputação).</p>`; }
    host.innerHTML = `<div class="result">${msg}<button class="btn big" id="chOk">Continuar</button></div>`;
    host.querySelector('#chOk').onclick = () => { closeOverlay(); onMainEvent('challenge', { ch, ok }); saveGame(); };
  };
  if (ch === 'triagem') { const sets = U.shuffle(TRIAGENS.upa); let k = 0, tot = 0; const run = () => { if (k >= sets.length) return done(tot / sets.length); TriageRunner(host, sets[k], { area: 'upa', time: 40 + (hasSkill('med10') ? 8 : 0), titulo: `Rodada ${k + 1}/${sets.length}: ordene do MAIS urgente para o MENOS urgente.`, onDone: s => { tot += s; k++; run(); } }); }; run(); }
  if (ch === 'idade') ChoiceRounds(host, idadeRounds(6), { titulo: 'Lactente, criança maior ou adolescente?', area: 'ped', onDone: done });
  if (ch === 'aborto') ChoiceRounds(host, abortoRounds(6), { titulo: 'Qual tipo de abortamento?', time: 18, area: 'go', onDone: done });
  if (ch === 'quarto') { const sets = U.shuffle(QUARTOS_DUPLOS).slice(0, 2); let k = 0, tot = 0; const run = () => { if (k >= sets.length) return done(tot / sets.length); QuartoRunner(host, sets[k], { onDone: s => { tot += s; k++; run(); } }); }; run(); }
  if (ch === 'checklist') ChoiceRounds(host, checklistRounds(8), { titulo: 'Em que momento do checklist?', area: 'cir', onDone: done });
  if (ch === 'prevencao') ChoiceRounds(host, prevencaoRounds(6), { titulo: 'Primária, secundária, terciária, quaternária ou quinquenária?', time: 22, area: 'ubs', onDone: done });
}

/* ---------------- Procedimentos simulados ---------------- */
function openProcMenu() {
  const a = mapArea(G.map.id) || 'upa'; const st = currentArea() === a ? chainStep(a) : null;
  const list = Object.entries(PROCS).filter(([k, p]) => p.area.includes(a) && !['papanicolau', 'paramentacao', 'checklist', 'instrumentacao'].includes(k));
  if (!list.length) return openPanel('proc', 'Sala de Procedimentos', '<p>Na UBS, esta sala é usada para curativos, retirada de pontos, nebulização e coleta de exames.</p><p class="hint">A coleta simulada do preventivo (Papanicolau) fica na mesa ginecológica do Consultório 5.</p>', { cls: 'small' });
  const body = `<p class="hint">Simulações educacionais supervisionadas: ênfase em indicação, segurança e preparo. Não são guias para execução real.</p><div class="menu-col">${list.map(([k, p]) => `<button class="btn ${st && st.tipo === 'proc' && st.proc === k ? '' : 'ghost'}" data-p="${k}">${p.nome}${st && st.tipo === 'proc' && st.proc === k ? ' — MISSÃO' : ''}${S.flags['proc_' + k] ? ' ✓' : ''}</button>`).join('')}</div>`;
  openPanel('proc', 'Sala de Procedimentos', body, { cls: 'small' });
  OV().querySelectorAll('[data-p]').forEach(b => b.onclick = () => { setOverlay(''); G.mode = 'explore'; startProcedure(b.dataset.p); });
}
function procZone(id) {
  const P = PROCS[id]; const st = stats(); let z = FORM.zonaProc(st) + (fx('procZoneAll') || 0);
  for (const it of equippedItems()) if ((it.fx.procTags || []).some(t => P.tags.includes(t))) z += it.fx.procZone || 0;
  if (hasSkill('med13')) z += 0.12; if (hasSkill('med14') && id === 'iot') z += 0.2; if (hasSkill('med8') && id === 'gaso') z += 0.15; if (hasSkill('med11') && id === 'puncao_lombar') z += 0.15; if (hasSkill('farm13') && id === 'iot') z += 0.1;
  return Math.min(0.6, z);
}
function startProcedure(id) {
  const P = PROCS[id]; SFX.play('ui');
  const o = encOpen('proc', `<header class="enc-head"><p class="eyebrow">Procedimento simulado · sob supervisão</p><h2>${P.nome}</h2><p>${U.esc(P.paciente)}</p><ol class="phases" id="prPh"></ol></header><div id="prHost"></div>`, 'proc');
  const host = o.querySelector('#prHost'); const ph = o.querySelector('#prPh');
  const etapas = ['Identificação', 'Indicação', 'Comunicação', 'Materiais', 'Sequência', 'Execução supervisionada', 'Checagem de segurança'];
  ph.innerHTML = etapas.map((e, i) => `<li data-i="${i}">${e}</li>`).join('');
  const setPh = i => ph.querySelectorAll('li').forEach(li => { li.classList.toggle('on', +li.dataset.i === i); li.classList.toggle('done', +li.dataset.i < i); });
  let score = 0; const log = [];
  const safetyHalf = hasSkill('med13') || fx('safetyHalf');
  const nome = U.pick(['Maria Aparecida dos Santos', 'José Carlos Pereira', 'Ana Lúcia Ferreira', 'Raimundo Nonato Silva']);
  const dob = `${U.ri(1, 28)}/${String(U.ri(1, 12)).padStart(2, '0')}/${U.ri(1950, 2005)}`;
  const steps = [
    () => { setPh(0); const fakes = [[nome.split(' ')[0] + ' ' + U.pick(['Souza', 'Lima', 'Costa']), dob], [nome, `${U.ri(1, 28)}/${String(U.ri(1, 12)).padStart(2, '0')}/${U.ri(1950, 2005)}`]]; const opts = U.shuffle([[nome, dob, true], [fakes[0][0], fakes[0][1], false], [fakes[1][0], fakes[1][1], false]]);
      host.innerHTML = `<div class="quick"><p class="q">O prontuário indica: <b>${nome}</b>, nascimento <b>${dob}</b>. Qual pulseira confere?</p><div class="opts">${opts.map((x, i) => `<button class="opt" data-i="${i}">🏷 ${x[0]} · ${x[1]}</button>`).join('')}</div></div>`;
      host.querySelectorAll('.opt').forEach(b => b.onclick = () => { const ok = opts[+b.dataset.i][2]; score += ok ? 12 : 0; log.push(ok ? '✓ Paciente identificado com dois identificadores.' : '✗ Identificação errada: confira nome completo E data de nascimento.'); SFX.play(ok ? 'ok' : 'bad'); next(); }); },
    () => { setPh(1); single(P.indicacao, 14, 'Indicação'); },
    () => { setPh(2); single(P.comunica, 12, 'Comunicação'); },
    () => { setPh(3); MateriaisRunner(host, id, { hint: fx('procHint') && (P.tags.includes('instrum') || P.tags.includes('cir')), onDone: s => { score += Math.round(16 * s); log.push(s >= 0.8 ? '✓ Material completo e adequado.' : '✗ Faltou material ou houve itens desnecessários: ' + P.materiais.ok.join(', ') + '.'); next(); } }); },
    () => { setPh(4); const ord = U.shuffle(P.sequencia.map((t, i) => ({ t, i }))); const picked = []; let errs = 0;
      const rnd = () => { host.innerHTML = `<div class="quick"><p class="q">Clique nas etapas na ordem correta (visão geral, sem detalhes técnicos).</p><ol class="seq-done">${picked.map(i => `<li>${U.esc(P.sequencia[i])}</li>`).join('')}</ol><div class="opts">${ord.filter(x => !picked.includes(x.i)).map(x => `<button class="opt" data-i="${x.i}">${U.esc(x.t)}</button>`).join('')}</div><p class="hint">Erros: ${errs}</p></div>`;
        host.querySelectorAll('.opt').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i === picked.length) { picked.push(i); SFX.play('ui'); if (picked.length === P.sequencia.length) { const pts = Math.max(0, 18 - errs * 4); score += pts; log.push(errs ? `✗ ${errs} erro(s) de sequência. Ordem: ${P.sequencia.join(' → ')}.` : '✓ Sequência correta.'); return next(); } rnd(); } else { errs++; SFX.play('bad'); b.classList.add('wrong'); setTimeout(rnd, 350); } }); };
      rnd(); },
    () => { setPh(5); execBar(); },
    () => { setPh(6); single(P.erro, 12, 'Segurança', true); },
  ];
  let k = 0; const next = () => { k++; if (k < steps.length) steps[k](); else finish(); };
  function single(spec, pts, nomeEt, safety) {
    const ord = U.shuffle(spec.o.map((t, i) => ({ t, ok: !i })));
    host.innerHTML = `<div class="quick"><p class="q">${U.esc(spec.q)}</p><div class="opts">${ord.map((o, i) => `<button class="opt" data-i="${i}">${U.esc(o.t)}</button>`).join('')}</div></div>`;
    host.querySelectorAll('.opt').forEach(b => b.onclick = () => { const ok = ord[+b.dataset.i].ok; let p = ok ? pts : 0; if (!ok && safety && safetyHalf) p = Math.round(pts / 2); score += p; log.push(`${ok ? '✓' : '✗'} ${nomeEt}: ${ok ? 'correto.' : (safety ? 'a falha a ser identificada era "' : 'o esperado era "') + spec.o[0] + '".'}`); SFX.play(ok ? 'ok' : 'bad'); next(); });
  }
  function execBar() {
    const zone = procZone(id); const st = stats(); const speed = Math.max(0.45, 1.05 - st.foco * 0.015) * (P.dif === 3 ? 1.2 : P.dif === 2 ? 1.05 : 0.9);
    let pos = 0, dir = 1, hits = 0, tries = 0, alive = true; const need = 3; let center = U.rnd(zone / 2 + 0.05, 0.95 - zone / 2);
    host.innerHTML = `<div class="exec"><p class="q">Execução sob supervisão do residente: aperte <kbd>Espaço</kbd> ou o botão quando o marcador estiver na zona verde. (${need} acertos)</p><div class="ebar"><i class="zone" style="left:${(center - zone / 2) * 100}%;width:${zone * 100}%"></i><i class="mk" id="mk"></i></div><p class="hint" id="exInfo">Acertos 0/${need} · Tentativas 0/5 · Zona ${Math.round(zone * 100)}%</p><button class="btn big" id="exGo">Executar</button></div>`;
    const mk = host.querySelector('#mk');
    const loop = () => { if (!alive) return; pos += dir * speed * 0.016; if (pos > 1) { pos = 1; dir = -1; } if (pos < 0) { pos = 0; dir = 1; } mk.style.left = pos * 100 + '%'; requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
    const press = () => { if (!alive) return; tries++; const ok = Math.abs(pos - center) <= zone / 2; if (ok) { hits++; SFX.play('ok'); G.player.pose = 'cast'; } else SFX.play('bad'); center = U.rnd(zone / 2 + 0.05, 0.95 - zone / 2); const zEl = host.querySelector('.zone'); zEl.style.left = (center - zone / 2) * 100 + '%'; host.querySelector('#exInfo').textContent = `Acertos ${hits}/${need} · Tentativas ${tries}/5 · Zona ${Math.round(zone * 100)}%`; if (hits >= need || tries >= 5) { alive = false; G.execPress = null; const pts = Math.round(16 * hits / need); score += pts; log.push(hits >= need ? '✓ Execução supervisionada adequada.' : `✗ ${hits}/${need} acertos na execução. Treine no laboratório de habilidades.`); setTimeout(next, 500); } };
    host.querySelector('#exGo').onclick = press; G.execPress = press;
  }
  function finish() {
    score = U.clamp(Math.round(score), 0, 100);
    const ok = score >= 60; const first = !S.flags['proc_' + id];
    let rew = '';
    if (ok) { const xp = addXP((first ? 70 : 35) * (1 + P.dif * 0.2) * BAL.xpMult(S.rep)); const co = addCoins(first ? 20 : 10); const rp = addRep(first ? 3 : 1, 'procedimento'); S.flags['proc_' + id] = true; rew = `<div class="rewards"><span>+${xp} XP</span><span>+${co} ${MOEDA_CURTA}</span><span class="pos">+${rp} reputação</span></div>`; }
    else { const rp = addRep(-2, 'procedimento'); rew = `<div class="rewards"><span class="neg">${rp} reputação</span><span>Repita quando quiser</span></div>`; }
    S.stats.procs++; checkAch();
    host.innerHTML = `<div class="result"><p class="${ok ? 'good' : 'bad'} big">${ok ? 'Procedimento simulado concluído' : 'Abaixo do esperado'}: ${score}/100</p><ul class="proc-log">${log.map(l => `<li>${U.esc(l)}</li>`).join('')}</ul>${rew}<p class="disclaimer">Simulação educacional. Procedimentos reais exigem treinamento, supervisão e protocolos institucionais.</p><button class="btn big" id="prOk">Continuar</button></div>`;
    host.querySelector('#prOk').onclick = () => { closeOverlay(); onMainEvent('proc', { proc: id, ok }); saveGame(); };
  }
  steps[0]();
}

function startPsyCrisis(n) {
  const ps = G.psy; if (!ps || ps.ent !== n) return;
  if (ps.kind === 'emerg') return startEmergencia(ps);
  ps.attending = true; SFX.play('ui');
  const P = ps.P;
  const ruinsQ4 = ['Manter a contenção até o fim do plantão, sem reavaliar', 'Dar alta assim que ele(a) se acalmar', 'Dispensar a avaliação clínica porque "é só psiquiátrico"'];
  const rounds = PSY_PERGUNTAS.map(x => ({ q: x.q, ok: x.ok, ruins: x.ruins, exp: x.exp })).concat([{ q: P.q4.q, ok: P.q4.ok, ruins: ruinsQ4, exp: P.q4.exp }]);
  let k = 0, acertos = 0;
  const o = encOpen('agit psy', `<header class="enc-head"><p class="eyebrow">⚠ Atendimento imediato · crise psicótica com agitação</p><div class="psy-top"><div class="ch-port"></div><div><h2>${U.esc(P.nome)}, ${P.idade} anos</h2><p>${U.esc(P.quadro)}</p></div></div>
    <p class="hint">Objetivo: proteger o paciente e as pessoas ao redor. Contenção só como último recurso, feita pela equipe e conforme protocolo.</p></header><div class="bmain" id="pMain"></div>`);
  OV().querySelector('.ch-port').appendChild(portraitCanvas(n.look, 84, 84, { crop: true, scale: 4 }));
  const step = () => {
    const m = document.getElementById('pMain'); if (!m) return;
    if (k >= rounds.length) return end();
    const r = rounds[k]; const opts = U.shuffle([r.ok, ...r.ruins]);
    m.innerHTML = `<div class="quick"><p class="eyebrow">Etapa ${k + 1} de ${rounds.length}</p><p class="q">${U.esc(r.q)}</p><div class="opts">${opts.map((t, i) => `<button class="opt" data-i="${i}"><span class="otx">${U.esc(t)}</span></button>`).join('')}</div></div>`;
    m.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const ok = opts[+b.dataset.i] === r.ok; if (ok) acertos++;
      SFX.play(ok ? 'ok' : 'bad');
      m.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (opts[+x.dataset.i] === r.ok) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      m.insertAdjacentHTML('beforeend', `<div class="fb ${ok ? 'good' : 'bad'}"><b>${ok ? 'Conduta adequada.' : 'Não é o mais seguro.'}</b> ${U.esc(r.exp)}</div><button class="btn" id="pNext">${k + 1 < rounds.length ? 'Continuar' : 'Ver desfecho'}</button>`);
      document.getElementById('pNext').onclick = () => { k++; step(); };
    });
  };
  const end = () => {
    const m = document.getElementById('pMain'); let rew;
    logErro('Crise psicótica e agitação', acertos >= 3, 'upa', rounds.map(r => r.exp).join(' '));
    if (acertos >= 3) { S.stats.agit++; const xp = addXP(90 * BAL.xpMult(S.rep)); const co = addCoins(20); const rp = addRep(6, 'crise psicótica'); rew = `<p class="good big">Crise manejada com segurança (${acertos}/4).</p><p>${U.esc(P.nome)} foi acolhido(a), contido(a) apenas pelo tempo necessário e encaminhado(a) para avaliação.</p><div class="rewards"><span>+${xp} XP</span><span>+${co} ${MOEDA_CURTA}</span><span class="pos">+${rp} reputação</span></div>`; }
    else if (acertos === 2) { const xp = addXP(40 * BAL.xpMult(S.rep)); rew = `<p class="big">A equipe completou o manejo com você (${acertos}/4).</p><p>Ninguém se feriu, mas algumas decisões poderiam ter sido mais seguras.</p><div class="rewards"><span>+${xp} XP</span></div>`; }
    else { const rp = addRep(-6, 'crise psicótica'); rew = `<p class="bad big">A equipe precisou assumir a abordagem (${acertos}/4).</p><p>Revise os princípios abaixo. (${rp} reputação)</p>`; }
    m.innerHTML = `<div class="result">${rew}<ul class="proc-log"><li>Segurança da cena e equipe acionada antes de qualquer aproximação.</li><li>Desescalada verbal primeiro: calma, frases curtas, sem confrontar o delírio.</li><li>Contenção física é último recurso, feita pela equipe treinada, com prescrição, registro, monitorização e reavaliação frequente; nunca é punição.</li><li>Sempre investigue causas orgânicas: delirium, hipoglicemia, intoxicação, infecção.</li></ul><button class="btn" id="pOk">Voltar ao plantão</button></div>`;
    document.getElementById('pOk').onclick = () => { G.npcs = G.npcs.filter(x => x !== ps.ent); if (G.psy === ps) G.psy = null; closeOverlay(); checkAch(); saveGame(); };
  };
  step();
}
