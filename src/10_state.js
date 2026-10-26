/* =====================================================================
   ESTADO DO JOGO, ATRIBUTOS, PROGRESSÃO, INVENTÁRIO E SALVAMENTO
   ===================================================================== */
let S = null;          // estado salvo
const G = {            // estado de execução (não salvo)
  mode: 'title', keys: {}, t: 0, map: null, player: null, npcs: [], spots: [], particles: [], bubbles: [],
  panel: null, modal: null, encounter: null, dialog: null, paused: false, sideTimer: 60, eventTimer: 160, saveTimer: 30,
  questObjs: {}, followers: [], camera: { x: 0, y: 0 }, fade: 0, shake: 0, lastStep: 0,
};
const INV_SIZE = 60;

/* Dois modos, cada um com o seu save:
   - 'internato': a campanha individual (estágios em sequência, missões, chefes)
   - 'vest' (Modo Vestibulando): todos os setores abertos, só casos de pacientes,
     outros jogadores no mapa, duelos no bar e o título de Melhor Interno */
function isVest() { return !!(S && S.modo === 'vest'); }
function modoNome(m) { return m === 'vest' ? 'Modo Vestibulando' : 'Modo Internato'; }
function saveKeyFor(m) { return m === 'vest' ? SAVE_KEY_VEST : SAVE_KEY; }
function newState(p, modo) {
  return {
    v: SAVE_VERSION, created: Date.now(), playTime: 0, modo: modo === 'vest' ? 'vest' : 'internato',
    player: p, ligaColor: 'Vermelho',
    xpTotal: 0, xpAvail: 0, vida: 80, energia: 60, coins: 60, rep: 0, repMin: 0, repMax: 0,
    inv: Array(INV_SIZE).fill(null), equip: { mao: null, cabeca: null, corpo: 'jaleco_padrao', amuleto: null },
    skills: {}, order: [], completed: {}, areaStep: {}, prog: {}, bossTries: {},
    side: [], sideDone: 0, sideFail: 0, cafeDone: 0, sideId: 1,
    stats: { cases: 0, dxOk: 0, cdOk: 0, both: 0, streak: 0, best: 0, procs: 0, rivais: 0, agit: 0, raros: [], bosses: 0, desafios: 0, eventos: 0, timeouts: 0 },
    ach: {}, flags: {}, map: { id: 'rua', x: 34, y: 13.2, dir: 0 }, seen: [], sumico: {}, restUntil: 0, coffeeUntil: 0, buffs: [],
    shop: { rare: 'ultrassom', next: 480 }, tips: {}, spotsState: {}, finished: false,
    erros: {}, priorizar: false, duvidaCd: {},
  };
}

/* ---------------- Atributos ---------------- */
function level() { let L = 1; while (L < BAL.maxLevel && S.xpTotal >= BAL.xpForLevel(L + 1)) L++; return L; }
function hasSkill(id) { return !!(S && S.skills[id]); }
function equippedItems() { return EQUIP_SLOTS.map(k => S.equip[k]).filter(Boolean).map(id => ITEMS[id]).filter(Boolean); }
function fx(key) { let v = 0; for (const it of equippedItems()) { const f = it.fx[key]; if (typeof f === 'number') v += f; else if (f) v = v || f; } return v; }
function fxList(key) { const out = []; for (const it of equippedItems()) { const f = it.fx[key]; if (Array.isArray(f)) out.push(...f); } return out; }
function mods() {
  const m = { vida: 0, energia: 0, foco: 0, conhecimento: 0, precisao: 0, resistencia: 0, influencia: 0, velocidade: 0 };
  for (const it of equippedItems()) for (const k in it.stats) m[k] = (m[k] || 0) + it.stats[k];
  if (hasSkill('med1')) m.influencia += 1;
  if (hasSkill('med3')) m.conhecimento += 2;
  if (hasSkill('med20')) { m.conhecimento += 3; m.precisao += 3; m.foco += 2; }
  if (hasSkill('farm20')) m.conhecimento += 2;
  for (const b of S.buffs) if (b.until > S.playTime) m[b.stat] = (m[b.stat] || 0) + b.v;
  return m;
}
function stats() {
  const L = level(), m = mods();
  return {
    nivel: L,
    vidaMax: 80 + 8 * (L - 1) + m.vida,
    energiaMax: 60 + 4 * (L - 1) + m.energia,
    foco: Math.max(1, 8 + L + m.foco),
    conhecimento: Math.max(1, 5 + L + m.conhecimento),
    precisao: Math.max(1, 5 + L + m.precisao),
    resistencia: Math.max(0, 5 + L + m.resistencia),
    influencia: Math.max(0, 5 + L + m.influencia),
    velocidade: m.velocidade,
  };
}
// fórmulas derivadas (transparentes, exibidas na ficha)
const FORM = {
  tempoFoco: st => Math.round((st.foco - 9) * 1.5),
  danoBase: st => Math.round(8 + st.conhecimento * 1.3),
  critico: st => Math.min(0.35, st.precisao * 0.012),
  reducao: st => Math.min(0.5, st.resistencia * 0.015),
  zonaProc: st => Math.min(0.42, 0.16 + st.precisao * 0.006),
  bonusSocial: st => Math.min(0.3, st.influencia * 0.01),
  descontoLoja: st => Math.min(0.15, st.influencia * 0.005),
  pistaAuto: st => Math.min(0.3, st.conhecimento * 0.01),
};
function clampVitals() { const st = stats(); S.vida = U.clamp(S.vida, 0, st.vidaMax); S.energia = U.clamp(S.energia, 0, st.energiaMax); }
function addBuff(stat, v, dur) { S.buffs = S.buffs.filter(b => b.until > S.playTime); S.buffs.push({ stat, v, until: S.playTime + dur }); }

/* ---------------- XP, moedas e reputação ---------------- */
function addXP(n, src) {
  n = Math.max(0, Math.round(n)); if (!n) return 0;
  const before = level();
  S.xpTotal += n; S.xpAvail += n;
  const after = level();
  if (after > before) {
    const st = stats(); S.vida = st.vidaMax; S.energia = st.energiaMax;
    SFX.play('level'); toast(`<b>Nível ${after}!</b> Atributos aumentaram e Vida/Energia foram restauradas.`, 'level');
    spawnParticles('level');
  }
  return n;
}
function addCoins(n) { n = Math.round(n); S.coins = Math.max(0, S.coins + n); if (n > 0) SFX.play('coin'); return n; }
function addRep(d, motivo) {
  if (!d) return 0;
  let v = d;
  if (v > 0) v = v * (1 + (fx('repGainMult') || 0));
  if (v < 0) v = v * (1 + (fx('repLossMult') || 0));
  v = Math.round(v); if (v === 0) v = Math.sign(d);
  const old = S.rep; S.rep = U.clamp(S.rep + v, BAL.repMin, BAL.repMax);
  S.repMin = Math.min(S.repMin, S.rep); S.repMax = Math.max(S.repMax, S.rep);
  if (old >= 0 && S.rep < 0) toast('Sua reputação ficou negativa: <b>Mal Interno</b>. Casos podem vir com informações borradas.', 'bad');
  if (old < 0 && S.rep >= 0) toast('Reputação recuperada: <b>Bom Interno</b>!', 'good');
  checkAch();
  return S.rep - old;
}
function repClass() { return S.rep >= 0 ? 'Bom Interno' : 'Mal Interno'; }

/* ---------------- Inventário ---------------- */
function invAdd(id, q = 1) {
  const it = ITEMS[id]; if (!it) return false;
  if (it.empilha) { const slot = S.inv.findIndex(s => s && s.id === id && s.q < 99); if (slot >= 0) { S.inv[slot].q = Math.min(99, S.inv[slot].q + q); return true; } }
  const free = S.inv.findIndex(s => !s); if (free < 0) { toast('Inventário cheio!', 'bad'); return false; }
  S.inv[free] = { id, q: it.empilha ? q : 1 };
  if (['raro', 'epico', 'lendario'].includes(it.rar) && !S.stats.raros.includes(id)) { S.stats.raros.push(id); checkAch(); }
  return true;
}
function invCount(id) { return S.inv.reduce((s, x) => s + (x && x.id === id ? x.q : 0), 0) + (Object.values(S.equip).includes(id) ? 1 : 0); }
function invRemove(id, q = 1) {
  for (let i = 0; i < S.inv.length && q > 0; i++) { const s = S.inv[i]; if (s && s.id === id) { const take = Math.min(q, s.q); s.q -= take; q -= take; if (s.q <= 0) S.inv[i] = null; } }
  return q === 0;
}
function ownsEquip(id) { return invCount(id) > 0; }
function canEquip(it) { if (!EQUIP_SLOTS.includes(it.cat)) return false; if (it.req && it.req.nivel && level() < it.req.nivel) return false; return true; }
function equipFromSlot(i) {
  const s = S.inv[i]; if (!s) return; const it = ITEMS[s.id]; if (!canEquip(it)) { toast(it.req && it.req.nivel ? `Requer nível ${it.req.nivel}.` : 'Este item não pode ser equipado.', 'bad'); return; }
  const cur = S.equip[it.cat]; S.equip[it.cat] = s.id; S.inv[i] = cur ? { id: cur, q: 1 } : null;
  SFX.play('ui'); clampVitals(); refreshPlayerLook(); toast(`Equipado: <b>${it.nome}</b>`);
}
function unequip(slot) {
  const cur = S.equip[slot]; if (!cur) return;
  const free = S.inv.findIndex(s => !s); if (free < 0) { toast('Inventário cheio!', 'bad'); return; }
  S.inv[free] = { id: cur, q: 1 }; S.equip[slot] = null;
  SFX.play('ui'); clampVitals(); refreshPlayerLook();
}
function useConsumable(i) {
  const s = S.inv[i]; if (!s) return false; const it = ITEMS[s.id]; if (it.cat !== 'consumivel') return false;
  const u = it.uso || {}; const st = stats();
  let en = u.energia || 0; if (u.cafe && fx('coffeeEnergy')) en = Math.round(en * (1 + fx('coffeeEnergy')));
  S.vida = Math.min(st.vidaMax, S.vida + (u.vida || 0)); S.energia = Math.min(st.energiaMax, S.energia + en);
  if (u.buff) addBuff(Object.keys(u.buff).find(k => k !== 'dur'), u.buff[Object.keys(u.buff).find(k => k !== 'dur')], u.buff.dur);
  s.q--; if (s.q <= 0) S.inv[i] = null;
  SFX.play(u.cafe ? 'coffee' : 'ok'); toast(`Você usou <b>${it.nome}</b>. ${it.efeito}`);
  clampVitals(); return true;
}

/* ---------------- Habilidades ---------------- */
function skillStatus(id) {
  const sk = SKILLS[id];
  if (S.skills[id]) return 'aprendida';
  const reqOk = sk.req.every(r => S.skills[r]);
  if (!reqOk) return 'bloqueada';
  if (level() < sk.nivel) return 'nivel';
  if (S.xpAvail < sk.custo) return 'xp';
  return 'disponivel';
}
function learnSkill(id) {
  const st = skillStatus(id), sk = SKILLS[id];
  if (st !== 'disponivel') { toast(st === 'aprendida' ? 'Você já tem essa habilidade.' : st === 'bloqueada' ? 'Aprenda os pré-requisitos primeiro.' : st === 'nivel' ? `Requer nível ${sk.nivel}.` : 'XP disponível insuficiente.', 'bad'); return false; }
  S.xpAvail -= sk.custo; S.skills[id] = true; SFX.play('skill');
  toast(`Habilidade aprendida: <b>${sk.nome}</b>`, 'good'); spawnParticles('skill');
  onMainEvent('learn'); checkAch(); clampVitals(); saveGame();
  return true;
}

/* ---------------- Campanha ---------------- */
function currentAreaIdx() { return S.order.findIndex(a => !S.completed[a]); }
// no Modo Vestibulando não há campanha: nenhum estágio "atual" e todos os setores abertos
function currentArea() { if (isVest()) return null; const i = currentAreaIdx(); return i < 0 ? null : S.order[i]; }
function areaUnlocked(a) { return isVest() || !!S.completed[a] || currentArea() === a; }
function areaStepIdx(a) { return S.areaStep[a] || 0; }
function chainStep(a) { return CHAINS[a] && CHAINS[a][areaStepIdx(a)]; }
function prog(a) { if (!S.prog[a]) S.prog[a] = { cases: 0, side: 0, opened: {}, learned: 0 }; return S.prog[a]; }

function onMainEvent(type, data = {}) {
  const a = currentArea(); if (!a) return;
  const st = chainStep(a); if (!st) return;
  const p = prog(a);
  let done = false;
  switch (st.tipo) {
    case 'talk': done = type === 'talk' && data.npc === st.alvo; break;
    case 'open': if (type === 'open') { p.opened[data.panel] = true; done = st.alvo.every(k => p.opened[k]); } break;
    case 'learn': if (type === 'learn') { p.learned++; done = p.learned >= st.n; } break;
    case 'cases': if (type === 'case' && data.area === a && (!st.local2 || data.local === st.local2)) { p.cases++; done = p.cases >= st.n; } break;
    case 'proc': done = type === 'proc' && data.proc === st.proc && data.ok; break;
    case 'side': if (type === 'side') { p.side++; done = p.side >= st.n; } break;
    case 'challenge': done = type === 'challenge' && data.ch === st.ch && data.ok; break;
    case 'find': done = type === 'find' && data.obj === st.obj; break;
    case 'boss': done = type === 'boss' && data.area === a; break;
    case 'duvidas': if (type === 'duvida' && data.ok) { p.duv = (p.duv || 0) + 1; done = p.duv >= st.n; } break;
  }
  if (done) advanceStep(a);
}
function advanceStep(a) {
  const st = chainStep(a); const idx = areaStepIdx(a);
  const xp = addXP((40 + idx * 12) * BAL.xpMult(S.rep)); const co = addCoins(15 + idx * 3); const rp = addRep(2, 'missão');
  S.areaStep[a] = idx + 1; S.prog[a] = { cases: 0, side: 0, opened: {}, learned: 0 };
  SFX.play('quest');
  toast(`<b>Missão concluída:</b> ${st.titulo}<br>+${xp} XP · +${co} ${MOEDA_CURTA} · ${rp >= 0 ? '+' : ''}${rp} reputação`, 'quest');
  const next = chainStep(a);
  if (next) setTimeout(() => toast(`<b>Nova missão:</b> ${next.titulo}<br><small>${next.desc}</small>`, 'quest'), 900);
  const dlg = STEP_DIALOGS[st.id + '_done'];
  if (dlg) setTimeout(() => startDialog(dlg.quem, dlg.falas), 300);
  if (next && next.tipo === 'find') setupMainFind(next);
  saveGame();
}
function completeArea(a) {
  S.completed[a] = true; S.areaStep[a] = CHAINS[a].length;
  S.shop.next = 0; // atualiza estoque raro
  const nx = currentArea();
  saveGame();
  return nx;
}

/* ---------------- Conquistas ---------------- */
function unlockAch(id) {
  if (S.ach[id]) return; const a = CONQUISTAS.find(x => x.id === id); if (!a) return;
  S.ach[id] = Date.now(); SFX.play('quest'); toast(`🏆 <b>Conquista:</b> ${a.nome}<br><small>${a.desc}</small>`, 'trophy');
}
function checkAch() {
  if (!S) return; const s = S.stats;
  if (s.cases >= 1) unlockAch('primeiro_caso');
  if (s.dxOk >= 10) unlockAch('dx10');
  if (s.cdOk >= 25) unlockAch('cd25');
  if (s.best >= 5) unlockAch('sequencia5');
  if (s.procs >= 5) unlockAch('proc5');
  if (S.sideDone >= 10) unlockAch('side10');
  if (S.cafeDone >= 5) unlockAch('cafe5');
  if (S.rep >= 500) unlockAch('rep50');
  if (S.rep >= 900) unlockAch('rep90');
  if (S.repMin <= -400 && S.rep >= 200) unlockAch('recuperacao');
  if (s.raros.length) unlockAch('raro');
  if (s.rivais >= 3) unlockAch('rival3');
  if (s.agit >= 1) unlockAch('agit');
  for (const t of ['med', 'farm', 'int']) if (Object.values(SKILLS).filter(k => k.arv === t).every(k => S.skills[k.id])) unlockAch('arvore');
  if (S.skills.int20) unlockAch('lenda');
}

/* ---------------- Salvamento ---------------- */
function saveGame() {
  if (!S || G.mode === 'title' || G.mode === 'create' || G.mode === 'order') return;
  if (G.player && G.map) { S.map = { id: G.map.id, x: G.player.x, y: G.player.y, dir: G.player.dir }; }
  try { localStorage.setItem(saveKeyFor(S.modo), JSON.stringify(S)); } catch (e) { /* armazenamento indisponível */ }
  if (typeof cloudQueue === 'function') cloudQueue();   // site: copia também para a conta Google
}
function loadGame(modo) {
  try { const raw = localStorage.getItem(saveKeyFor(modo)); if (!raw) return null; const d = migrateSave(JSON.parse(raw)); if (d) d.modo = modo === 'vest' ? 'vest' : 'internato'; return d; } catch (e) { return null; }
}
function migrateSave(d) {
  if (!d || typeof d !== 'object' || !d.player) return null;
  const base = newState(d.player, d.modo);
  const out = Object.assign(base, d);
  out.modo = d.modo === 'vest' ? 'vest' : 'internato';
  out.stats = Object.assign(newState(d.player).stats, d.stats || {});
  out.equip = Object.assign({ mao: null, cabeca: null, corpo: 'jaleco_padrao', amuleto: null }, d.equip || {});
  if (!Array.isArray(out.inv)) out.inv = Array(INV_SIZE).fill(null);
  while (out.inv.length < INV_SIZE) out.inv.push(null);
  out.inv = out.inv.map(s => (s && ITEMS[s.id]) ? s : null);
  for (const k of EQUIP_SLOTS) if (out.equip[k] && !ITEMS[out.equip[k]]) out.equip[k] = null;
  // itens que mudaram de espaço (abadá → corpo, fone → cabeça): devolve ao inventário
  for (const k of EQUIP_SLOTS) { const id = out.equip[k]; if (id && ITEMS[id].cat !== k) { out.equip[k] = null; const f = out.inv.findIndex(s => !s); if (f >= 0) out.inv[f] = { id, q: 1 }; } }
  // antes o jaleco padrão era implícito: garante que o jogador ainda o tenha
  if (!Object.values(out.equip).includes('jaleco_padrao') && !out.inv.some(s => s && s.id === 'jaleco_padrao')) { const f = out.inv.findIndex(s => !s); if (f >= 0) out.inv[f] = { id: 'jaleco_padrao', q: 1 }; }
  for (const k in out.skills) if (!SKILLS[k]) delete out.skills[k];
  if (!Array.isArray(out.order) || out.order.length < 5) return null;
  out.order = out.order.filter(a => AREAS[a]);
  // saves antigos (5 estágios): a UBS entra como 6º estágio no fim da sequência
  for (const a of AREA_IDS) if (!out.order.includes(a)) { out.order.push(a); out.flags = Object.assign({}, out.flags, { novoEstagio: a }); }
  if (!out.erros || typeof out.erros !== 'object') out.erros = {};
  if (!out.duvidaCd || typeof out.duvidaCd !== 'object') out.duvidaCd = {};
  if (!MAPS[out.map && out.map.id]) out.map = { id: 'rua', x: 34, y: 13.2, dir: 0 };
  out.v = SAVE_VERSION;
  return out;
}
function exportSave() { saveGame(); try { return btoa(unescape(encodeURIComponent(JSON.stringify(S)))); } catch (e) { return ''; } }
function importSave(code) { try { const d = migrateSave(JSON.parse(decodeURIComponent(escape(atob(code.trim()))))); return d; } catch (e) { return null; } }
function hasSave(modo) { try { return !!localStorage.getItem(saveKeyFor(modo)); } catch (e) { return false; } }
function deleteSave(modo) { try { localStorage.removeItem(saveKeyFor(modo)); } catch (e) { } }
// resumo de um save para a tela inicial e para a escolha entre aparelho e nuvem
function saveSummaryOf(d) {
  if (!d || !d.player) return '—';
  let L = 1; while (L < BAL.maxLevel && (d.xpTotal || 0) >= BAL.xpForLevel(L + 1)) L++;
  const h = Math.floor((d.playTime || 0) / 3600), m = Math.floor(((d.playTime || 0) % 3600) / 60);
  const meio = d.modo === 'vest' ? `${(d.stats && d.stats.cases) || 0} casos` : `${Object.keys(d.completed || {}).length}/${AREA_IDS.length} estágios`;
  return `<b>${U.esc(d.player.name || 'Interno(a)')}</b> · Nv ${L} · ${meio} · ${h}h${String(m).padStart(2, '0')} de jogo`;
}
