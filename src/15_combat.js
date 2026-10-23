/* =====================================================================
   COMBATE POR TURNOS: duelos com rivais, encontros de agitação
   (desescalada) e batalhas de chefe em três fases
   ===================================================================== */
function battleShell(o) {
  return `<div class="battle" style="--bc:${o.cor || '#5fd4a0'}">
    <div class="arena">
      <div class="foe"><div class="foe-info"><p class="eyebrow">${U.esc(o.titulo || '')}</p><h2 id="bName">${U.esc(o.nome)}</h2><p class="phase" id="bPhase"></p><div class="hpbar foe-hp"><i id="bHp"></i><span id="bHpT"></span></div><div class="intent" id="bIntent"></div></div><div class="foe-spr" id="bFoe"></div></div>
      <div class="me"><div class="me-spr" id="bMe"></div><div class="me-info"><b>${U.esc(S.player.name)}</b><div class="hpbar"><i id="pHp"></i><span id="pHpT"></span></div><div class="enbar"><i id="pEn"></i><span id="pEnT"></span></div><div class="chips" id="pFx"></div></div></div>
    </div>
    <div class="blog" id="bLog" aria-live="polite"></div>
    <div class="bmain" id="bMain"></div></div>`;
}
function bLog(msg, cls = '') { const l = document.getElementById('bLog'); if (!l) return; const p = U.el('p', cls, msg); l.prepend(p); while (l.children.length > 6) l.lastChild.remove(); }
function setSprite(id, look, pose = 'idle', dir = 0, scale = 5) { const el = document.getElementById(id); if (!el) return; el.innerHTML = ''; const k = Math.max(1, Math.round(scale / 2 + 0.01)); const cv = portraitCanvas(look, SW * k, SH * k, { dir, pose, scale }); el.appendChild(cv); if (pose === 'hit') { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); } }
function updPlayerBars(B) {
  const st = stats(); const h = document.getElementById('pHp'), e = document.getElementById('pEn');
  if (h) { h.style.width = U.clamp(S.vida / st.vidaMax * 100, 0, 100) + '%'; document.getElementById('pHpT').textContent = `Vida ${Math.round(S.vida)}/${st.vidaMax}`; }
  if (e) { e.style.width = U.clamp(S.energia / st.energiaMax * 100, 0, 100) + '%'; document.getElementById('pEnT').textContent = `Energia ${Math.round(S.energia)}/${st.energiaMax}`; }
  const fxEl = document.getElementById('pFx'); if (fxEl && B) { const c = []; if (B.shield > 0) c.push(`🛡 ${Math.round(B.shield)}`); if (B.defend) c.push('🛡 Escudo'); if (B.focus) c.push('Foco'); if (B.risky) c.push('Arriscado'); if (B.mestre) c.push('Mestre'); if (B.evade) c.push('Sumiço'); if (B.slow) c.push(`Lentidão x${B.slow}`); if (B.pressure) c.push(`Pressão x${B.pressure}`); if (B.stun) c.push('Atordoado'); if (B.double) c.push('Relâmpago'); if (B.aura > 0) c.push('Aura de Lenda'); if (B.revisao) c.push('Revisão'); fxEl.innerHTML = c.map(x => `<span class="chip on">${x}</span>`).join(''); }
}
function playerDamage(B, base, nome) {
  const st = stats();
  let d = base * BAL.enemyMult(S.rep) * U.rnd(0.85, 1.15) * (1 - FORM.reducao(st));
  if (B.evade) { B.evade = false; bLog(`Você deu um sumiço estratégico e esquivou de "${nome}"!`, 'good'); return 0; }
  if (B.defend) { d *= 0.5; }
  if (!B.hitOnce && fx('firstHitHalf')) { d *= 0.5; bLog('A roupa de médico da peste intimidou o oponente (dano reduzido).', 'good'); }
  B.hitOnce = true;
  if (B.shield > 0) { const ab = Math.min(B.shield, d); B.shield -= ab; d -= ab; }
  d = Math.round(d); S.vida = Math.max(0, S.vida - d);
  if (d > 0) { SFX.play('hit'); setSprite('bMe', playerLook(), 'hit', 1, 4); setTimeout(() => setSprite('bMe', playerLook(), 'idle', 1, 4), 350); }
  return d;
}
function combatActionsAvailable() {
  const acts = [];
  for (const s of Object.values(SKILLS)) if (s.acao && S.skills[s.id]) acts.push(s.acao);
  return acts;
}
function useCombatAction(B, a, after) {
  const def = COMBAT_ACTIONS[a]; const st = stats();
  const costMult = 1 + (fx('skillEnergyMult') || 0);
  const cost = Math.round((def.custo || 0) * costMult);
  if ((B.cd[a] || 0) > 0) { toast(`${def.nome} em recarga (${B.cd[a]} turnos).`, 'bad'); return false; }
  if (def.uso && (B.uses[a] || 0) >= def.uso) { toast('Já usado nesta batalha.', 'bad'); return false; }
  if (S.energia < cost) { toast('Energia insuficiente.', 'bad'); return false; }
  S.energia -= cost; if (def.cd) B.cd[a] = def.cd + 1; B.uses[a] = (B.uses[a] || 0) + 1;
  SFX.play('skill'); setSprite('bMe', playerLook(), 'cast', 1, 4); setTimeout(() => setSprite('bMe', playerLook(), 'idle', 1, 4), 450);
  switch (a) {
    case 'estabilizar': { const v = Math.round(st.vidaMax * 0.3); S.vida = Math.min(st.vidaMax, S.vida + v); bLog(`Estabilizar: +${v} Vida.`, 'good'); break; }
    case 'relampago': B.double = true; bLog('Diagnóstico Relâmpago carregado: o próximo raciocínio certo causa dano dobrado.', 'good'); break;
    case 'mestre': B.mestre = true; bLog('Raciocínio de Mestre: a próxima resposta certa causa dano x2,5.', 'good'); break;
    case 'suporte': S.vida = Math.min(st.vidaMax, S.vida + 25); B.pressure = Math.max(0, (B.pressure || 0) - 2); bLog('Suporte hemodinâmico: +25 Vida.', 'good'); break;
    case 'revisao': B.revisao = true; bLog('Revisão Farmacológica: o próximo raciocínio vem com alternativas erradas eliminadas.', 'good'); break;
    case 'gole': S.energia = Math.min(st.energiaMax, S.energia + 25); addBuff('foco', -1, 120); bLog('Gole duvidoso: +25 Energia (e um leve tremor).'); break;
    case 'coffeebreak': S.energia = Math.min(st.energiaMax, S.energia + 30); S.vida = Math.min(st.vidaMax, S.vida + 20); bLog('Coffee Break Coletivo! +30 Energia, +20 Vida.', 'good'); break;
    case 'sumico': B.evade = true; bLog('Você prepara um sumiço estratégico.'); break;
    case 'aura': B.pressure = 0; B.slow = 0; B.aura = 2; bLog('Aura de Lenda! Pressão removida e dano aumentado.', 'good'); break;
  }
  updPlayerBars(B); after && after(); return true;
}
function actionMenuHTML(B, roundLabel) {
  const extra = combatActionsAvailable();
  const cons = S.inv.map((s, i) => ({ s, i })).filter(x => x.s && ITEMS[x.s.id].cat === 'consumivel');
  const itemBtn = x => { const it = ITEMS[x.s.id], bi = BATTLE_ITEM[x.s.id] || { tag: 'Usar', desc: it.efeito }; return `<button class="btn small ghost item-btn" data-item="${x.i}" ${B.itemUsed ? 'disabled' : ''} title="${U.esc(bi.desc + ' ' + it.efeito)}">${icon(it.icon, 16)} <span><b>${it.nome} x${x.s.q}</b><small>${bi.tag}: ${U.esc(bi.desc)}</small></span></button>`; };
  return `<div class="actions"><button class="btn big" data-act="round">${roundLabel}</button>
    ${extra.length ? `<div class="act-row skills">${extra.map(a => { const d = COMBAT_ACTIONS[a]; const cd = B.cd[a] || 0; const used = d.uso && (B.uses[a] || 0) >= d.uso; return `<button class="btn small" data-act="${a}" ${cd > 0 || used ? 'disabled' : ''} title="${U.esc(d.desc)}">${d.nome}${d.custo ? ` (${Math.round(d.custo * (1 + (fx('skillEnergyMult') || 0)))}⚡)` : ''}${cd > 0 ? ` · ${cd}` : ''}</button>`; }).join('')}</div>` : ''}
    ${cons.length ? `<p class="hint act-hint">Itens de apoio: não gastam o turno (1 por turno).${B.itemUsed ? ' Você já usou um item neste turno.' : ''}</p><div class="act-row items">${cons.slice(0, 8).map(itemBtn).join('')}</div>` : '<p class="hint act-hint">Sem itens de apoio. Café, salgados e balas da cantina ajudam nas batalhas.</p>'}</div>`;
}
// item de apoio: efeito normal + vantagem para o próximo raciocínio (não passa o turno)
function useBattleItem(B, i) {
  const s = S.inv[i]; if (!s || B.itemUsed) return false; const id = s.id;
  if (!useConsumable(i)) return false;
  B.itemUsed = true;
  switch (id) {
    case 'cafe': B.focus = 1.3; B.slow = 0; bLog('Café: foco renovado (+30% de tempo e sem Lentidão).', 'good'); break;
    case 'cafe_duvidoso': B.focus = 1.5; B.risky = true; bLog('Café duvidoso: +50% de tempo... mas um erro vai doer mais.', 'good'); break;
    case 'bala_gengibre': B.revisao = true; bLog('Bala de gengibre: clareza! Alternativas erradas serão eliminadas.', 'good'); break;
    case 'energetico': B.double = true; bLog('Energético: a próxima resposta certa causa dano dobrado.', 'good'); break;
    case 'barrinha_avulsa': B.defend = true; bLog('Barrinha: o próximo ataque causará metade do dano.', 'good'); break;
    case 'agua_coco': B.pressure = 0; B.slow = 0; bLog('Água de coco: hidratado(a), sem Pressão nem Lentidão.', 'good'); break;
    case 'marmita': B.pressure = 0; B.slow = 0; bLog('Marmita da mãe: energias renovadas.', 'good'); break;
    default: bLog(`${ITEMS[id].nome}: ${ITEMS[id].efeito}`, 'good');
  }
  updPlayerBars(B); return true;
}

/* =====================================================================
   DUELO COM RIVAL
   ===================================================================== */
function startRival(rid) {
  const R = RIVAIS[rid]; const areaIdx = Object.keys(S.completed).length;
  const B = { kind: 'rival', hp: Math.round(R.hp * BAL.enemyMult(S.rep) * (1 + 0.12 * areaIdx)), turn: 0, cd: {}, uses: {}, shield: hasSkill('med5') ? 12 : 0, quickMult: 1 };
  B.max = B.hp;
  const o = encOpen('battle-wrap', battleShell({ nome: R.nome, titulo: R.titulo, cor: AREAS[R.area].cor }), 'combat');
  setSprite('bFoe', LOOKS[R.look], 'idle', 0, 5); setSprite('bMe', playerLook(), 'idle', 1, 4);
  document.getElementById('bPhase').textContent = 'Duelo de conhecimento';
  const updFoe = () => { document.getElementById('bHp').style.width = Math.max(0, B.hp / B.max * 100) + '%'; document.getElementById('bHpT').textContent = `${Math.max(0, Math.round(B.hp))}/${B.max}`; };
  B.hitFoe = (d, src) => { B.hp -= d; bLog(`${src}: ${d} de dano em ${R.nome}.`, 'good'); setSprite('bFoe', LOOKS[R.look], 'hit', 0, 5); setTimeout(() => setSprite('bFoe', LOOKS[R.look], 'idle', 0, 5), 350); updFoe(); };
  updFoe(); updPlayerBars(B);
  bLog(`"${U.pick(R.falas)}"`);
  const special = { thiago: ['Corrida de Questões', () => { B.quickMult = 0.6; bLog('Thiago acelerou: sua próxima pergunta terá menos tempo.', 'bad'); }], marcela: ['Caderno Colorido', () => { B.hp = Math.min(B.max, B.hp + 12); updFoe(); bLog('Marcela revisou o caderno e recuperou 12.', 'bad'); }], caio: ['Decoreba Massiva', () => { const d = playerDamage(B, R.atk * 2, 'Decoreba'); bLog(`Caio recitou a tabela inteira: ${d} de dano!`, 'bad'); }], lara: ['Nó Cirúrgico', () => { if (!B.defend) { B.stun = true; bLog('Lara te enrolou num nó cirúrgico: você perde o próximo turno!', 'bad'); } else bLog('Você se defendeu do nó cirúrgico.'); }], bruna: ['Plantão Duplo', () => { const d1 = playerDamage(B, R.atk * 0.8, 'Plantão'); const d2 = playerDamage(B, R.atk * 0.8, 'Plantão'); bLog(`Bruna emendou dois plantões: ${d1 + d2} de dano!`, 'bad'); }] };
  const foeTurn = () => {
    if (!document.getElementById('bMain')) return;
    if (B.hp <= 0) return win();
    B.turn++;
    setSprite('bFoe', LOOKS[R.look], 'cast', 0, 5); setTimeout(() => setSprite('bFoe', LOOKS[R.look], 'idle', 0, 5), 400);
    if (B.turn % 3 === 0 && special[rid]) { bLog(`<b>${R.nome}</b> usa <b>${special[rid][0]}</b>!`); special[rid][1](); }
    else { const d = playerDamage(B, R.atk, 'Provocação'); bLog(`${R.nome}: "${U.pick(R.falas)}" — ${d} de dano.`, 'bad'); }
    B.defend = false; B.itemUsed = false; for (const k in B.cd) if (B.cd[k] > 0) B.cd[k]--;
    updPlayerBars(B);
    if (S.vida <= 0) return lose();
    if (B.stun) { B.stun = false; setTimeout(foeTurn, 900); return; }
    setTimeout(menu, 500);
  };
  const menu = () => {
    const m = document.getElementById('bMain'); if (!m) return; m.innerHTML = actionMenuHTML(B, 'Pergunta Relâmpago');
    m.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const a = b.dataset.act;
      if (a === 'round') {
        const q0 = pickQuick(R.area); const q = B.revisao ? Object.assign({}, q0, { o: [q0.o[0], q0.o[1]] }) : q0; B.revisao = false;
        const tq = Math.round(15 * B.quickMult * (B.focus || 1)); B.focus = 0;
        QuickRunner(m, q, { time: tq, onDone: ok => {
          B.quickMult = 1;
          if (ok) { const st = stats(); let d = FORM.danoBase(st) * 1.4 + (fx('combatDmg') || 0); const crit = Math.random() < FORM.critico(st); if (crit) d *= 1.5; if (B.double) { d *= 2; B.double = false; } if (B.mestre) { d *= 2.5; B.mestre = false; } if (B.aura > 0) d *= 1.4; B.hitFoe(Math.round(d), crit ? 'Resposta certeira (CRÍTICO)' : 'Resposta certa'); }
          else { const d = playerDamage(B, B.risky ? 10 : 6, 'Erro'); B.hp = Math.min(B.max, B.hp + 4); updFoe(); bLog(`Você errou: ${d} de dano de estresse.`, 'bad'); }
          B.risky = false;
          if (B.aura > 0) B.aura--; updPlayerBars(B); setTimeout(foeTurn, 300);
        } });
        return;
      }
      useCombatAction(B, a, () => menu());
    });
    m.querySelectorAll('[data-item]').forEach(b => b.onclick = () => { if (useBattleItem(B, +b.dataset.item)) menu(); });
  };
  const win = () => {
    S.stats.rivais++; const xp = addXP((70 + areaIdx * 10) * BAL.xpMult(S.rep)); const co = addCoins(30 * BAL.coinMult(S.rep)); const rp = addRep(2, 'duelo');
    let drop = ''; if (Math.random() < BAL.dropChanceRival * BAL.dropMult(S.rep)) { const it = rollLoot(1); if (it && invAdd(it)) drop = `<p class="drop">🎁 ${R.nome} deixou cair: <b>${ITEMS[it].nome}</b> ${rarTag(ITEMS[it].rar)}</p>`; }
    SFX.play('win'); setSprite('bMe', playerLook(), 'victory', 0, 4); setSprite('bFoe', LOOKS[R.look], 'defeat', 0, 5);
    document.getElementById('bMain').innerHTML = `<div class="result"><p class="good big">Vitória no duelo!</p><p>"${U.pick(['Tá... dessa vez você ganhou.', 'Revanche na semana que vem!', 'Hmpf. Sorte de principiante.'])}"</p><div class="rewards"><span>+${xp} XP</span><span>+${co} ${MOEDA_CURTA}</span><span class="pos">+${rp} reputação</span></div>${drop}<button class="btn big" id="bOk">Continuar</button></div>`;
    document.getElementById('bOk').onclick = () => { closeOverlay(); checkAch(); saveGame(); };
  };
  const lose = () => {
    const rp = addRep(-2, 'duelo'); S.vida = Math.round(stats().vidaMax * 0.25); SFX.play('lose'); setSprite('bMe', playerLook(), 'defeat', 0, 4);
    document.getElementById('bMain').innerHTML = `<div class="result"><p class="bad big">Você perdeu o duelo.</p><p>${R.nome} vai contar isso no grupo da turma. Estude e volte mais forte. (${rp} reputação)</p><button class="btn big" id="bOk">Voltar ao plantão</button></div>`;
    document.getElementById('bOk').onclick = () => { closeOverlay(); saveGame(); };
  };
  menu();
}

/* =====================================================================
   AGITAÇÃO PSICOMOTORA — encontro de desescalada (sem agressão)
   ===================================================================== */
function startAgitation() {
  const P = U.pick(AGITACAO); const st = stats();
  const A = { tensao: U.ri(65, 80), seg: 100, turno: 0, equipe: false };
  const o = encOpen('agit', `<header class="enc-head"><p class="eyebrow">Encontro de segurança clínica</p><h2>Acolhendo ${U.esc(P.nome)}</h2><p>${U.esc(P.desc)}</p><p class="hint">Objetivo: reduzir a tensão com segurança para todos, usando comunicação, ambiente e equipe. O paciente precisa de cuidado, não de confronto.</p></header>
    <div class="agit-bars"><div><b>Tensão</b><div class="hpbar tens"><i id="aT"></i><span id="aTt"></span></div></div><div><b>Segurança da cena</b><div class="hpbar seg"><i id="aS"></i><span id="aSt"></span></div></div></div><div class="blog" id="bLog"></div><div class="bmain" id="aMain"></div>`);
  const upd = () => { document.getElementById('aT').style.width = A.tensao + '%'; document.getElementById('aTt').textContent = Math.round(A.tensao); document.getElementById('aS').style.width = A.seg + '%'; document.getElementById('aSt').textContent = Math.round(A.seg); };
  const turn = () => {
    upd();
    if (A.tensao <= 15) return end(true);
    if (A.seg <= 0 || A.turno >= 8) return end(false);
    const good = U.shuffle(AGIT_ACOES.filter(a => a.tipo !== 'ruim')), bad = U.shuffle(AGIT_ACOES.filter(a => a.tipo === 'ruim'));
    const opts = U.shuffle(good.slice(0, 3).concat(bad.slice(0, 1)));
    const m = document.getElementById('aMain');
    m.innerHTML = `<p class="q">Turno ${A.turno + 1}/8 — o que você faz?</p><div class="opts">${opts.map((a, i) => `<button class="opt" data-i="${i}">${U.esc(a.t)}</button>`).join('')}</div>`;
    m.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const a = opts[+b.dataset.i]; A.turno++;
      let d = a.d; if (d < 0) { d *= 1 + st.influencia * 0.02; if (hasSkill('farm13')) d *= 1.25; if (a.tipo === 'verbal' && P.causa.includes('Delirium')) d *= 0.8; }
      if (a.tipo === 'equipe') A.equipe = true;
      A.tensao = U.clamp(A.tensao + d, 0, 100); A.seg = U.clamp(A.seg + a.seg, 0, 100);
      bLog(`${a.tipo === 'ruim' ? '✗' : '✓'} ${a.t}`, a.tipo === 'ruim' ? 'bad' : 'good');
      const drift = A.equipe ? 3 : 6; A.tensao = U.clamp(A.tensao + drift * Math.random(), 0, 100);
      if (!A.equipe && A.tensao > 70) { A.seg -= 8; bLog('A tensão continua alta. Seria bom chamar apoio da equipe.', 'bad'); }
      SFX.play(a.tipo === 'ruim' ? 'bad' : 'ok'); turn();
    });
  };
  const end = ok => {
    upd(); let rew;
    if (ok) { S.stats.agit++; const xp = addXP(65 * BAL.xpMult(S.rep)); const rp = addRep(4, 'agitação'); rew = `<p class="good big">Situação acolhida com segurança.</p><p>${U.esc(P.nome)} aceitou conversar e ser avaliado(a). Causa provável: ${U.esc(P.causa)}</p><div class="rewards"><span>+${xp} XP</span><span class="pos">+${rp} reputação</span></div>`; }
    else { const rp = addRep(-2, 'agitação'); rew = `<p class="bad big">A equipe precisou assumir a abordagem.</p><p>Ninguém se feriu. Causa provável: ${U.esc(P.causa)}. (${rp} reputação)</p>`; }
    document.getElementById('aMain').innerHTML = `<div class="result">${rew}<ul class="proc-log"><li>Abordagem verbal calma, escuta e validação reduzem a agitação na maioria dos casos.</li><li>Reduzir estímulos, manter distância segura e chamar a equipe protegem paciente e profissionais.</li><li>Investigue causas orgânicas (dor, delirium, intoxicação, hipoglicemia). Agitação não é sinônimo de violência.</li><li>Medidas restritivas são exceção, decididas pela equipe responsável conforme protocolo.</li></ul><button class="btn big" id="aOk">Continuar</button></div>`;
    document.getElementById('aOk').onclick = () => { closeOverlay(); checkAch(); saveGame(); };
  };
  turn();
}

/* =====================================================================
   BATALHAS DE CHEFE
   ===================================================================== */
function startBoss(bid) {
  const Bd = BOSSES[bid]; const area = Bd.area; const st0 = stats();
  S.vida = st0.vidaMax; S.energia = st0.energiaMax;
  S.bossTries[bid] = (S.bossTries[bid] || 0) + 1;
  const B = { kind: 'boss', bid, phase: 0, hp: 100, max: 100, ri: 0, cd: {}, uses: {}, shield: hasSkill('med5') ? 12 : 0, slow: 0, pressure: 0, alarm: 0, bossTurns: 0, intent: null, roundsDone: 0 };
  const o = encOpen('battle-wrap', battleShell({ nome: Bd.nome, titulo: Bd.titulo, cor: AREAS[area].cor }), 'boss');
  const look = () => (B.phase === 2 && Bd.lookFinal) ? LOOKS[Bd.lookFinal] : LOOKS[Bd.look];
  const enMult = () => (1 + 0.1 * B.phase) * (1 + 0.1 * Object.keys(S.completed).length);
  setSprite('bFoe', look(), 'idle', 0, 6); setSprite('bMe', playerLook(), 'idle', 1, 4);
  const updFoe = () => { document.getElementById('bHp').style.width = Math.max(0, B.hp / B.max * 100) + '%'; document.getElementById('bHpT').textContent = `Exigência ${Math.max(0, Math.round(B.hp))}/${B.max}`; const f = Bd.fases[B.phase]; document.getElementById('bPhase').innerHTML = `Fase ${B.phase + 1}/3 · <b>${f.nome}</b>`; };
  B.hitFoe = (d, src) => { const pm = 1 - 0.08 * B.pressure; d = Math.round(d * pm); B.hp -= d; bLog(`${src}: ${d} de dano.`, 'good'); setSprite('bFoe', look(), 'hit', 0, 6); setTimeout(() => setSprite('bFoe', look(), 'idle', 0, 6), 380); updFoe(); };
  updFoe(); updPlayerBars(B);
  SFX.play('boss');
  bLog(`<b>${Bd.nome}</b>: "${Bd.fases[0].fala[0]}"`);
  const phaseMec = () => Bd.fases[B.phase].mec;
  const setIntent = () => {
    const el = document.getElementById('bIntent'); const f = Bd.fases[B.phase];
    if (phaseMec() === 'telegrafo') { B.intent = Math.random() < 0.5 ? 'rugido' : 'olhar'; el.innerHTML = B.intent === 'rugido' ? '⚠ Leão respira fundo... vem um <b>RUGIDO</b>. (Acerte o raciocínio para manter a calma e amortecer o rugido)' : '👁 Leão observa em silêncio, avaliando. (Um acerto agora causa dano extra)'; }
    else if (phaseMec() === 'teses') { B.intent = Math.random() < 0.5 ? 'pregar' : 'ler'; el.innerHTML = B.intent === 'pregar' ? '🔨 O Dr. Martinho ergue o martelo: vai <b>PREGAR UMA TESE</b>. (Responda certo para refutá-la e amortecer a martelada)' : '📜 Ele lê as teses em silêncio. (Um acerto agora causa dano extra)'; }
    else if (phaseMec() === 'reforma') { B.intent = B.bossTurns % 2 ? 'sermao' : 'normal'; el.innerHTML = B.intent === 'sermao' ? '⚠ Ele sobe no púlpito: <b>Sermão de Worms</b> no próximo turno!' : `Próximo ataque: ${f.atk.nome}`; }
    else if (phaseMec() === 'bico_fino') { B.intent = B.bossTurns % 2 ? 'bico' : 'normal'; el.innerHTML = B.intent === 'bico' ? '⚠ O sapato branco brilha: <b>Chute de Bico Fino</b> no próximo turno!' : `Próximo ataque: ${f.atk.nome}`; }
    else if (phaseMec() === 'alarme' && B.alarm) el.innerHTML = area === 'ubs' ? '🚨 <b>A RECEPÇÃO LOTOU</b>: o próximo raciocínio será o acolhimento com classificação de risco.' : '🚨 <b>ALARME</b> na enfermaria: o próximo raciocínio será uma triagem de gravidade.';
    else el.innerHTML = `Próximo ataque: <b>${f.atk.nome}</b> — ${f.atk.desc}`;
  };
  setIntent();
  const roundType = () => { if (phaseMec() === 'alarme' && B.alarm) return 'triage'; const r = Bd.fases[B.phase].rounds; return r[B.ri % r.length]; };
  const roundLabel = t => ({ case: 'Raciocínio clínico (caso)', dxonly: 'Diagnóstico diferencial', quick: 'Pergunta de prova', triage: 'Priorizar a fila', idade: 'Faixa etária', aborto: 'Classificar abortamento', checklist: 'Checklist cirúrgico', materiais: 'Montar materiais', quarto: 'Quarto duplo', comunica: 'Comunicação profissional', duplo: 'Casos integrados' }[t] || 'Raciocínio');
  const timeMult = () => { let m = B.focus || 1; if (B.slow) m *= 1 - 0.2 * B.slow; if (B.pressure) m *= 1 - 0.05 * B.pressure; if (phaseMec() === 'retorica') m *= 0.9; if (phaseMec() === 'bico_fino' || phaseMec() === 'reforma') m *= Math.pow(0.9, B.roundsDone); return Math.max(0.45, m); };
  const dmgMods = d => { const st = stats(); if (Math.random() < FORM.critico(st)) { d *= 1.4; bLog('Raciocínio brilhante (CRÍTICO)!', 'good'); } if (B.double && d > 0) { d *= 2; B.double = false; } if (B.mestre && d > 0) { d *= 2.5; B.mestre = false; } if (B.aura > 0) d *= 1.4; if ((B.intent === 'olhar' && phaseMec() === 'telegrafo') || (B.intent === 'ler' && phaseMec() === 'teses')) d += 10; return d; };
  const area0 = area;
  const runRound = () => {
    const t = roundType(); const m = document.getElementById('bMain'); const tm = timeMult(); B.focus = 0; const elim = B.revisao ? 1 : 0; B.revisao = false;
    let roundOver = false;
    const finishRound = (score, label) => {
      if (roundOver) return; roundOver = true; holder.innerHTML = '<p class="hint">O chefe prepara a resposta...</p>'; holder.className = 'round-host';
      B.ri++; B.roundsDone++; if (B.alarm && t === 'triage') B.alarm = 0;
      const base = { case: 52, dxonly: 34, quick: 30, duplo: 62 }[t] || 46;
      let d = base * score; if (d > 0) d = dmgMods(d);
      B.lastOk = score >= 0.5;
      if (score > 0) B.hitFoe(Math.round(d), label); else bLog('Raciocínio falhou: nenhum dano.', 'bad');
      if (score < 0.5 && B.risky) { const dd = playerDamage(B, 8, 'Café duvidoso'); bLog(`O café duvidoso cobrou o preço do erro: ${dd} de dano.`, 'bad'); updPlayerBars(B); } B.risky = false;
      if (score < 0.5) { B.failed = true; if (phaseMec() === 'bronca') { B.stun = true; bLog('<b>Bronca da Xuxa!</b> Você fica sem reação e perde o próximo turno.', 'bad'); } }
      if (B.aura > 0) B.aura--;
      setTimeout(bossTurn, 500);
    };
    const holder = U.el('div', 'round-host'); m.innerHTML = ''; m.appendChild(holder);
    if (phaseMec() === 'caos' && Math.random() < 0.45 && t !== 'triage') {
      const it = U.pick(INTERRUPCOES); const ord = U.shuffle(it.o.map((x, i) => ({ x, ok: i === it.c })));
      return ChoiceRounds(holder, [{ t: '🚨 INTERRUPÇÃO: ' + it.q, o: ord.map(y => y.x), r: ord.findIndex(y => y.ok), e: 'Priorizar o paciente crítico e delegar o resto com clareza.' }], { titulo: 'O caos da UPA', time: 7, onDone: s => { if (!s) { const dd = playerDamage(B, 8, 'Interrupção'); bLog(`A interrupção te desconcentrou: ${dd} de dano.`, 'bad'); updPlayerBars(B); if (S.vida <= 0) return lose(); } runRoundInner(); } });
    }
    runRoundInner();
    function runRoundInner() {
      holder.innerHTML = '';
      if (t === 'case' || t === 'dxonly') {
        const pool = CASES.filter(c => c.area === area0 && c.dif >= (B.phase === 2 ? 3 : 2)); const c = U.pick(pool.length ? pool : CASES.filter(c => c.area === area0));
        holder.className = 'round-host case-host';
        return CaseRunner(holder, c, { boss: true, dxOnly: t === 'dxonly', timeMult: tm, elimExtra: elim, onDone: res => { holder.className = 'round-host'; finishRound(t === 'dxonly' ? (res.dxOk ? 1 : 0) : (res.dxOk ? 0.35 : 0) + (res.cdOk ? 0.65 : 0), res.dxOk && res.cdOk ? 'Caso resolvido' : 'Caso parcialmente resolvido'); } });
      }
      if (t === 'duplo') {
        const pool = U.shuffle(CASES.filter(c => c.area === area0 && c.dif >= 2)); let sc = 0;
        holder.className = 'round-host case-host';
        return CaseRunner(holder, pool[0], { boss: true, timeMult: tm * 0.85, elimExtra: elim, onDone: r1 => { sc += (r1.dxOk ? 0.25 : 0) + (r1.cdOk ? 0.25 : 0); CaseRunner(holder, pool[1], { boss: true, timeMult: tm * 0.85, onDone: r2 => { sc += (r2.dxOk ? 0.25 : 0) + (r2.cdOk ? 0.25 : 0); holder.className = 'round-host'; finishRound(sc, 'Casos integrados'); } }); } });
      }
      if (t === 'quick') { const q = pickQuick(area0); const qq = elim ? Object.assign({}, q, { o: [q.o[0], q.o[1]] }) : q; return QuickRunner(holder, qq, { time: Math.round((q.img ? 30 : area0 === 'ubs' ? 22 : 16) * tm), veil: phaseMec() === 'retorica' ? 4 : 0, onDone: ok => finishRound(ok ? 1 : 0, 'Resposta certa') }); }
      if (t === 'triage') { const sets = TRIAGENS[area0] || TRIAGENS.upa; return TriageRunner(holder, U.pick(sets), { area: area0, tema: area0 === 'ubs' ? 'Acolhimento com classificação de risco' : undefined, time: Math.round((B.alarm ? 25 : 38 + (hasSkill('med10') ? 8 : 0)) * tm), onDone: s => finishRound(s >= 0.99 ? 1 : s * 0.8, 'Fila priorizada') }); }
      if (t === 'idade') return ChoiceRounds(holder, idadeRounds(3), { area: area0, titulo: 'Faixa etária', time: Math.round(13 * tm), onDone: s => finishRound(s, 'Idades diferenciadas') });
      if (t === 'aborto') return ChoiceRounds(holder, abortoRounds(3), { area: area0, titulo: 'Abortamentos', time: Math.round(15 * tm), onDone: s => finishRound(s, 'Classificação correta') });
      if (t === 'checklist') return ChoiceRounds(holder, checklistRounds(4), { area: area0, titulo: 'Cirurgia Segura', time: Math.round(10 * tm), onDone: s => finishRound(s, 'Checklist em dia') });
      if (t === 'materiais') return MateriaisRunner(holder, U.pick(['instrumentacao', 'paramentacao', 'checklist']), { time: Math.round(30 * tm), hint: !!fx('procHint'), onDone: s => finishRound(s, 'Mesa montada') });
      if (t === 'quarto') return QuartoRunner(holder, U.pick(QUARTOS_DUPLOS), { onDone: s => finishRound(s, 'Leitos separados') });
      if (t === 'comunica') return ChoiceRounds(holder, comunicaRound(), { titulo: 'Comunicação', time: Math.round(18 * tm), onDone: s => finishRound(s, 'Resposta profissional') });
    }
  };
  const bossTurn = () => {
    if (!document.getElementById('bMain') || B.over) return;
    if (B.hp <= 0) return nextPhase();
    const f = Bd.fases[B.phase]; const mec = f.mec; B.bossTurns++;
    setSprite('bFoe', look(), 'cast', 0, 6); setTimeout(() => setSprite('bFoe', look(), 'idle', 0, 6), 420);
    let base = f.atk.dano * enMult(); let nome = f.atk.nome;
    if (B.failed) { base *= 1.3; B.failed = false; }
    if (mec === 'telegrafo') { if (B.intent === 'rugido') { if (B.lastOk) { base *= 0.75; nome = 'Rugido do Plantão (amortecido)'; bLog('Você manteve a calma com a resposta certa: o rugido perdeu força.', 'good'); } else { base *= 1.45; nome = 'Rugido do Plantão'; } } else { base *= 0.6; nome = 'Olhar Avaliador'; } }
    if (mec === 'teses') { if (B.intent === 'pregar') { if (B.lastOk) { base *= 0.75; nome = 'Martelada na Porta (tese refutada)'; bLog('Sua resposta certa refutou a tese: a martelada perdeu força.', 'good'); } else { base *= 1.45; nome = 'Martelada na Porta'; } } else { base *= 0.6; nome = 'Leitura das Teses'; } }
    if (mec === 'bico_fino' && B.intent === 'bico') { base *= 1.35; nome = 'Chute de Bico Fino'; }
    if (mec === 'reforma' && B.intent === 'sermao') { base *= 1.35; nome = 'Sermão de Worms'; }
    const d = playerDamage(B, base, nome);
    bLog(`<b>${Bd.nome}</b>: "${U.pick(f.fala)}" — ${nome}: ${d} de dano.`, 'bad');
    if (mec === 'lentidao' && !B.defend) { B.slow = Math.min(2, B.slow + 1); bLog('Lentidão: seu próximo raciocínio terá menos tempo.', 'bad'); }
    if (mec === 'pressao' && Math.random() > FORM.reducao(stats()) * 1.2) { B.pressure = Math.min(5, B.pressure + 1); bLog(`Pressão psicológica x${B.pressure}: menos dano e menos tempo (as respostas certas continuam as mesmas).`, 'bad'); }
    if (mec === 'alarme' && B.bossTurns % 2 === 0) { B.alarm = 1; SFX.play('alarm'); }
    B.defend = false; B.itemUsed = false; for (const k in B.cd) if (B.cd[k] > 0) B.cd[k]--;
    updPlayerBars(B);
    if (S.vida <= 0) return lose();
    if (S.energia < 10 && fx('autoBar') && !B.autoBarUsed) { B.autoBarUsed = true; S.energia += 20; bLog('Barrinha de proteína consumida automaticamente: +20 Energia.', 'good'); updPlayerBars(B); }
    setIntent();
    if (B.stun) { B.stun = false; setTimeout(bossTurn, 1100); return; }
    setTimeout(menu, 450);
  };
  const menu = () => {
    const m = document.getElementById('bMain'); if (!m) return; const t = roundType();
    m.innerHTML = actionMenuHTML(B, '▶ ' + roundLabel(t));
    m.querySelectorAll('[data-act]').forEach(b => b.onclick = () => {
      const a = b.dataset.act;
      if (a === 'round') return runRound();
      useCombatAction(B, a, () => menu());
    });
    m.querySelectorAll('[data-item]').forEach(b => b.onclick = () => { if (useBattleItem(B, +b.dataset.item)) menu(); });
  };
  const nextPhase = () => {
    if (B.hp > 0 || B.over) return;
    if (B.phase < 2) {
      B.phase++; B.hp = B.max; B.ri = 0; B.slow = 0; B.alarm = 0; B.roundsDone = 0;
      { const st = stats(); const heal = Math.round(st.vidaMax * 0.3); S.vida = Math.min(st.vidaMax, S.vida + heal); S.energia = Math.min(st.energiaMax, S.energia + 15); bLog(`Intervalo entre as fases: um residente traz café. +${heal} Vida, +15 Energia.`, 'good'); updPlayerBars(B); }
      const f = Bd.fases[B.phase];
      SFX.play('boss'); G.shake = 0.5;
      setSprite('bFoe', look(), 'victory', 0, 6); setTimeout(() => setSprite('bFoe', look(), 'idle', 0, 6), 700);
      updFoe(); setIntent();
      const m = document.getElementById('bMain');
      m.innerHTML = `<div class="phase-card"><p class="eyebrow">Fase ${B.phase + 1} de 3</p><h2>${f.nome}</h2><p>"${U.esc(f.fala[0])}"</p><p class="hint">Mecânica: ${{ caos: 'interrupções aleatórias antes dos raciocínios.', telegrafo: 'leia a intenção do chefe: acertar quando ele vai rugir amortece o rugido; acertar quando ele observa causa dano extra.', alarme: 'alarmes forçam triagens de gravidade: priorize a fila corretamente.', ultimo: 'casos pediátricos complexos.', plantao: 'triagem obstétrica e classificações rápidas.', pressao: 'acúmulos de pressão reduzem dano e tempo; respire fundo para aliviar.', enfermaria: 'diferencie pacientes do mesmo quarto.', discurso: 'dois casos seguidos por rodada.', dez_salas: 'priorização das salas cirúrgicas.', bico_fino: 'o tempo encurta a cada rodada; defenda o Chute de Bico Fino.', teses: 'quando ele for pregar uma tese, responda certo para refutá-la; quando ele só lê, um acerto causa dano extra.', reforma: 'o tempo encurta a cada rodada; defenda-se do Sermão de Worms.' }[f.mec] || ''}</p><button class="btn big" id="phOk">Continuar</button></div>`;
      document.getElementById('phOk').onclick = menu;
      return;
    }
    win();
  };
  const win = () => {
    if (B.over) return; B.over = true;
    SFX.play('win'); setSprite('bMe', playerLook(), 'victory', 0, 4); setSprite('bFoe', look(), 'defeat', 0, 6);
    const xp = addXP(520 * BAL.xpMult(S.rep)); const co = addCoins(220 * BAL.coinMult(S.rep)); const rp = addRep(10, 'chefe');
    const got = invAdd(Bd.item); S.stats.bosses++; unlockAch(Bd.ach);
    const nx = completeArea(area);
    onMainEvent('boss', { area });
    const lines = Bd.vitoria.map(l => `<p>${U.esc(l)}</p>`).join('');
    document.getElementById('bMain').innerHTML = `<div class="result victory"><p class="eyebrow">Chefe derrotado</p><h2>${AREAS[area].nome}: estágio concluído!</h2><div class="vit-lines">${lines}</div><div class="rewards"><span>+${xp} XP</span><span>+${co} ${MOEDA_CURTA}</span><span class="pos">+${rp} reputação</span>${got ? `<span>${icon(ITEMS[Bd.item].icon, 16)} ${ITEMS[Bd.item].nome} ${rarTag(ITEMS[Bd.item].rar)}</span>` : ''}</div>
      <p>${nx ? `Próximo estágio desbloqueado: <b style="color:${AREAS[nx].cor}">${AREAS[nx].nome}</b>.` : '<b>Você concluiu todos os estágios do internato!</b>'}</p><button class="btn big" id="bOk">${nx ? 'Continuar' : 'Ir para a formatura'}</button></div>`;
    document.getElementById('bOk').onclick = () => { closeOverlay(); saveGame(); if (!nx) setTimeout(showEnding, 300); else toast(`<b>Novo estágio:</b> ${AREAS[nx].nome}<br><small>${CHAINS[nx][0].desc}</small>`, 'quest'); };
    saveGame();
  };
  const lose = () => {
    if (B.over) return; B.over = true;
    SFX.play('lose'); setSprite('bMe', playerLook(), 'defeat', 0, 4);
    document.getElementById('bMain').innerHTML = `<div class="result"><p class="bad big">Você foi mandado(a) para casa descansar.</p><p>${U.esc(Bd.nome)}: "${U.pick(['Volte quando estiver pronto(a).', 'Estude. E volte.', 'Hmpf. Previsível.'])}"</p><p class="hint">Dica: aprenda habilidades com ações de batalha, equipe itens da área e leve consumíveis. A batalha recomeça do início.</p><div class="row"><button class="btn" id="bRetry">Tentar de novo (-3 reputação)</button><button class="btn ghost" id="bOk">Voltar ao hospital</button></div></div>`;
    document.getElementById('bRetry').onclick = () => { addRep(-3, 'chefe'); closeOverlay('explore'); setTimeout(() => startBoss(bid), 200); };
    document.getElementById('bOk').onclick = () => { addRep(-3, 'chefe'); S.vida = Math.round(stats().vidaMax * 0.5); closeOverlay(); saveGame(); };
  };
  // apresentação do chefe
  const m = document.getElementById('bMain');
  m.innerHTML = `<div class="phase-card intro"><p class="eyebrow">Chefe final · ${AREAS[area].nome}</p><h2>${Bd.nome}</h2><p>${Bd.titulo}</p><p>"${U.esc(Bd.intro[Bd.intro.length - 1])}"</p><p class="hint">Três fases. Cada raciocínio certo reduz a Exigência do chefe; ele contra-ataca após cada ação sua. Vida e Energia foram restauradas pelos residentes (com café).</p><button class="btn big" id="phOk">Começar — Fase 1: ${Bd.fases[0].nome}</button></div>`;
  document.getElementById('phOk').onclick = menu;
}

/* =====================================================================
   FORMATURA
   ===================================================================== */
function showEnding() {
  S.finished = true; unlockAch('formatura'); invAdd('cracha_ouro'); saveGame();
  G.mode = 'ending';
  const s = S.stats;
  const raros = s.raros.map(id => ITEMS[id] ? ITEMS[id].nome : id).join(', ') || 'nenhum';
  setOverlay(`<div class="screen ending"><div class="diploma">
    <p class="eyebrow">${HOSPITAL_NOME} · Colação de grau</p><h1>Internato concluído</h1>
    <p class="dip-name">${U.esc(S.player.name)}</p><p>sobreviveu à UPA do Leão, à prova da Xuxa, ao tribunal da Dra. Gertrudes, ao discurso do Dr. Wagnão, ao bico fino do Dr. Leôncio e às 95 teses do Dr. Martinho Lutero.</p>
    <div class="dip-port"></div>
    <dl class="stat-grid"><dt>Casos clínicos resolvidos</dt><dd>${s.cases}</dd><dt>Diagnósticos corretos</dt><dd>${s.dxOk}</dd><dt>Condutas corretas</dt><dd>${s.cdOk}</dd><dt>Procedimentos simulados</dt><dd>${s.procs}</dd><dt>Missões secundárias</dt><dd>${S.sideDone}</dd><dt>Reputação final</dt><dd class="${S.rep < 0 ? 'neg' : 'pos'}">${S.rep > 0 ? '+' : ''}${S.rep} · ${repClass()}</dd><dt>Habilidades</dt><dd>${Object.keys(S.skills).length}/60</dd><dt>Itens raros</dt><dd>${raros}</dd><dt>Duelos vencidos</dt><dd>${s.rivais}</dd><dt>Conquistas</dt><dd>${Object.keys(S.ach).length}/${CONQUISTAS.length}</dd><dt>Tempo de campanha</dt><dd>${U.fmtHM(S.playTime)}</dd></dl>
    <p class="hint">Você recebeu o <b>Crachá Dourado de Interno</b>. O hospital continua aberto para revisitas e missões secundárias.</p>
    <div class="row"><button class="btn big" id="enCont">Continuar explorando</button><button class="btn ghost" id="enNew">Novo internato</button></div></div></div>`, 'full');
  OV().querySelector('.dip-port').appendChild(portraitCanvas(playerLook(), 140, 180, { pose: 'victory', scale: 5 }));
  SFX.play('win');
  $('#enCont').onclick = () => { closeOverlay(); };
  $('#enNew').onclick = () => confirmBox('Começar um novo internato? O progresso atual será apagado.', () => { deleteSave(); S = null; G.map = null; $('#hud').hidden = true; CR = null; ORD = []; showTitle(); });
}
