/* =====================================================================
   MULTIPLAYER (só no Modo Vestibulando)
   - O Modo Internato é individual: quem está nele não aparece para
     ninguém e não vê ninguém.
   - No Modo Vestibulando, quem está com o jogo aberto ao mesmo tempo
     aparece no mapa para os outros (posição, direção, roupa e nome).
   - No Bar do Rodolfo dá para desafiar outro interno para um Duelo de
     Pergunta Relâmpago (melhor de 5, perguntas de residência).
   Sem conexão (jogo aberto sozinho, arquivo salvo, link público), nada
   disso aparece e o jogo funciona normalmente.
   ===================================================================== */
const MP = {
  room: null, ok: false, status: 'carregando', ghosts: new Map(), roster: new Map(), sentAt: 0, lastPres: '', lastLook: '',
  duel: null, out: null, inv: null, barHint: false,
};
const MP_ROUNDS = 5, MP_WIN = 3, MP_QTIME = 20, MP_REWARD_CAP = 5;

// ---------- conexão ----------
(async function mpStart() {
  try {
    await new Promise(r => setTimeout(r, 0));   // espera o resto do jogo carregar
    // no site próprio a conexão é pelo Firebase; dentro do claude.ai, pela sala do artifact
    let room = null;
    if (typeof fbRoomReady === 'function' && window.FIREBASE_CONFIG) room = await fbRoomReady();
    else if (window.claude && typeof window.claude.use === 'function') room = await window.claude.use('room');
    else { MP.status = 'off'; return; }
    if (!room) { MP.status = 'off'; return; }
    MP.room = room; MP.status = 'conectando';
    const fail = e => { MP.ok = false; MP.ghosts.clear(); MP.roster.clear(); MP.err = (e && (e.message || e.code)) || ''; MP.status = e && (e.code === 'not_granted' || e.code === 'revoked') ? 'negado' : 'off'; console.warn('multiplayer', e); };
    room.onConnection(c => { MP.ok = !!c; if (MP.status !== 'negado' && MP.status !== 'off') MP.status = c ? 'on' : 'conectando'; }, fail);
    room.onPeers(ch => mpPeers(ch), fail);
    room.on('duelo', msg => { try { mpMsg(msg); } catch (e) { console.warn('duelo', e); } });
  } catch (e) { console.warn('multiplayer indisponível', e); }
})();
function mpMyPeer() { const r = MP.room; if (!r) return null; const me = r.peers().find(p => p.sameTab); return me ? me.peer : null; }
function mpEmit(data) { if (MP.room) MP.room.emit('duelo', data).catch(() => {}); }

// ---------- dados recebidos são não confiáveis: higieniza tudo ----------
function mpName(s) { return String(s || '').replace(/[\u0000-\u001f\u007f-\u009f​-‏‪-‮⁠-⁯]/g, '').trim().slice(0, 18) || 'Interno(a)'; }
function mpLook(lk) {
  if (!lk || typeof lk !== 'object') return null;
  const out = {};
  for (const [k, v] of Object.entries(lk)) {
    if (!/^[a-zA-Z]{1,16}$/.test(k)) continue;
    if (typeof v === 'boolean') out[k] = v;
    else if (typeof v === 'number' && isFinite(v)) out[k] = v;
    else if (typeof v === 'string' && v.length <= 24 && /^[#a-zA-Z0-9_ -]*$/.test(v)) out[k] = v;
  }
  return out.skin ? out : null;
}
const MP_FALLBACK_LOOK = { skin: '#e0ac7e', hair: 'curto', hairC: '#3a2414', top: 'tshirt', topC: '#3a7bd5', bottomC: '#2b3a55', shoes: '#262626', coat: 'jaleco', badge: true };

function mpPeers(ch) {
  for (const p of ch.left) { MP.ghosts.delete(p.peer); MP.roster.delete(p.peer); }
  for (const p of ch.peers) {
    if (p.isMe) continue;
    const pr = p.presence || {};
    if (pr.v !== 1 || typeof pr.map !== 'string') { MP.ghosts.delete(p.peer); MP.roster.delete(p.peer); continue; }
    // elenco: todo mundo online, em qualquer mapa (contador e "Melhor Interno")
    MP.roster.set(p.peer, { peer: p.peer, map: pr.map, nm: mpName(pr.nm), lv: Math.max(1, Math.min(99, pr.lv | 0)), rp: Math.max(-1000, Math.min(1000, Math.round(+pr.rp || 0))) });
    let g = MP.ghosts.get(p.peer);
    const tx = +pr.x, ty = +pr.y;
    if (!isFinite(tx) || !isFinite(ty)) { MP.ghosts.delete(p.peer); continue; }   // está em outro mapa
    if (!g) { g = { peer: p.peer, x: tx, y: ty, animT: 0, frame: 0, look: MP_FALLBACK_LOOK, mp: true }; MP.ghosts.set(p.peer, g); }
    if (g.map !== pr.map) { g.x = tx; g.y = ty; }
    g.map = pr.map; g.tx = tx; g.ty = ty; g.dir = [0, 1, 2, 3].includes(pr.d) ? pr.d : 0; g.mv = !!pr.mv;
    g.nm = mpName(pr.nm); g.lv = Math.max(1, Math.min(99, pr.lv | 0)); g.rp = Math.max(-1000, Math.min(1000, Math.round(+pr.rp || 0))); g.st = ['livre', 'ocupado', 'duelo'].includes(pr.st) ? pr.st : 'ocupado';
    if (pr.lk && pr.lk !== g.lkRaw) { g.lkRaw = pr.lk; g.look = mpLook(pr.lk) || MP_FALLBACK_LOOK; g.bad = false; }
  }
  // quem saiu no meio de um desafio
  const here = new Set(ch.peers.map(p => p.peer));
  if (MP.duel && !here.has(MP.duel.opp) && MP.duel.phase !== 'fim') mpDuelEnd('saiu');
  if (MP.out && !here.has(MP.out.to)) { toast(`${U.esc(MP.out.nm)} saiu do bar.`); MP.out = null; }
  if (MP.inv && !here.has(MP.inv.from)) { MP.inv = null; if (G.panelName === 'mp_convite') { G.panelName = null; closeOverlay(); } }
}

// ---------- a cada quadro: minha presença, interpolação dos outros, duelo ----------
function mpTick(dt) {
  mpChip();
  const r = MP.room; if (!r) return;
  // presença (até ~10x por segundo, só quando muda)
  const now = performance.now();
  if (now - MP.sentAt > 100) {
    let pres;
    if (S && G.map && G.player && isVest()) {
      const st = MP.duel ? 'duelo' : (G.mode === 'explore' ? 'livre' : 'ocupado');
      pres = { v: 1, nm: mpName(S.player.name), lv: level(), rp: Math.round(S.rep || 0), map: G.map.id, x: Math.round(G.player.x * 20) / 20, y: Math.round(G.player.y * 20) / 20, d: G.player.dir, mv: !!G.player.moving, st };
    } else pres = { v: 1, map: null };
    const key = JSON.stringify(pres);
    const lk = S && G.player && isVest() ? JSON.stringify(playerLook()) : '';
    if (key !== MP.lastPres || lk !== MP.lastLook) {
      const patch = Object.assign({}, pres);
      if (lk !== MP.lastLook) { patch.lk = lk ? JSON.parse(lk) : null; MP.lastLook = lk; }
      MP.lastPres = key; MP.sentAt = now;
      r.presence(patch).catch(() => {});
    }
  }
  // movimento suave dos outros internos
  for (const g of MP.ghosts.values()) {
    const dx = g.tx - g.x, dy = g.ty - g.y, d = Math.hypot(dx, dy);
    if (d > 3) { g.x = g.tx; g.y = g.ty; } else { const k = Math.min(1, dt * 10); g.x += dx * k; g.y += dy * k; }
    g.moving = g.mv || d > 0.06;
    if (g.moving) { g.animT += dt * 9; g.frame = Math.floor(g.animT) % 4; } else { g.animT = 0; g.frame = 0; }
  }
  if (S && isVest() && G.map && G.map.id === 'bar' && !MP.barHint && [...MP.ghosts.values()].some(g => g.map === 'bar')) {
    MP.barHint = true; toast('<b>Outros internos estão no bar!</b><br><small>Chegue perto de alguém e aperte ' + TECLA_E() + ' para desafiar para um Duelo de Pergunta Relâmpago.</small>', 'quest');
  }
  mpDuelTick(now);
  if (MP.duel && G.panelName === 'mp_duelo') mpScene(now);
}
function mpGhostsHere() { if (!MP.room || !G.map || !isVest()) return []; const id = G.map.id; return [...MP.ghosts.values()].filter(g => g.map === id); }
function mpDrawGhost(c, g, cx, cy) {
  try { return drawEnt(c, g, cx, cy); } catch (e) { if (!g.bad) { g.bad = true; g.look = MP_FALLBACK_LOOK; } return null; }
}
// "Melhor Interno": quem tem mais pontos de reputação entre todos os internos online agora
// (empate: maior nível; depois um critério fixo, para todos verem a mesma pessoa)
function mpBest() {
  if (!MP.room || !MP.ok || !S || !isVest() || !MP.roster.size) return null;
  const me = mpMyPeer(); if (!me) return null;
  const all = [...MP.roster.values()].map(g => ({ peer: g.peer, rp: g.rp || 0, lv: g.lv || 1 }));
  all.push({ peer: me, rp: Math.round(S.rep || 0), lv: level() });
  const top = all.filter(p => p.rp > 0).sort((a, b) => b.rp - a.rp || b.lv - a.lv || (a.peer < b.peer ? -1 : 1))[0];
  return top ? top.peer : null;
}
function mpTitle(c, x, y) {
  // placa dourada em duas linhas ("MELHOR" / "INTERNO"), com coroinha e brilho passando
  const w = text57W('INTERNO') + 8, h = 20, bob = Math.round(Math.sin(G.t * 3) * 1), x0 = Math.round(x - w / 2), y0 = y - h + bob;
  c.fillStyle = '#5a3a08'; c.fillRect(x0 - 1, y0 - 1, w + 2, h + 2);
  c.fillStyle = '#e6b422'; c.fillRect(x0, y0, w, h);
  c.fillStyle = '#ffe58a'; c.fillRect(x0, y0, w, 2); c.fillStyle = '#b8860b'; c.fillRect(x0, y0 + h - 2, w, 2);
  const sx = x0 + Math.round((G.t * 30) % (w + 24)) - 12; c.fillStyle = 'rgba(255,255,255,0.6)'; for (let k = 0; k < 5; k++) if (sx + k >= x0 && sx + k < x0 + w) c.fillRect(sx + k, y0 + 2 + k * 3, 2, 3);
  text57(c, 'MELHOR', x0 + Math.round((w - text57W('MELHOR')) / 2), y0 + 2, '#5a3a08');
  text57(c, 'INTERNO', x0 + 4, y0 + 11, '#5a3a08');
  // coroinha
  const cx2 = Math.round(x); c.fillStyle = '#5a3a08'; c.fillRect(cx2 - 5, y0 - 6, 11, 5);
  c.fillStyle = '#ffd84a'; c.fillRect(cx2 - 4, y0 - 4, 9, 3); c.fillRect(cx2 - 4, y0 - 6, 1, 2); c.fillRect(cx2, y0 - 7, 1, 3); c.fillRect(cx2 + 4, y0 - 6, 1, 2);
  c.fillStyle = '#e8463e'; c.fillRect(cx2, y0 - 3, 1, 1);
}
// plaquinha com o nome (e o estado) sobre a cabeça de cada interno online
function mpNameTags(c, cx, cy) {
  const best = mpBest();
  if (best && best === mpMyPeer() && G.player) { const P = G.player; mpTitle(c, Math.round(P.x * TS - cx), Math.round(P.y * TS - SH + 4 - cy) + 8); }
  for (const g of mpGhostsHere()) {
    const x = Math.round(g.x * TS - cx), y = Math.round(g.y * TS - SH + 4 - cy) + 4;
    if (x < -60 || x > VW + 60 || y < -30 || y > VH + 40) continue;
    const label = g.nm + ' NV' + g.lv, w = text57W(label) + 8;
    c.fillStyle = 'rgba(14,19,23,0.82)'; c.fillRect(x - w / 2, y - 12, w, 11);
    c.fillStyle = '#7af0ff'; c.fillRect(x - w / 2, y - 12, 2, 11);
    text57(c, label, Math.round(x - w / 2 + 5), y - 10, '#ffffff');
    if (g.st !== 'livre') { const t = g.st === 'duelo' ? 'EM DUELO' : 'OCUPADO', tw = text57W(t) + 6; c.fillStyle = g.st === 'duelo' ? '#c62f2f' : '#4a5560'; c.fillRect(x - tw / 2, y - 23, tw, 10); text57(c, t, Math.round(x - tw / 2 + 3), y - 22, '#ffffff'); }
    if (best === g.peer) mpTitle(c, x, y - (g.st !== 'livre' ? 25 : 14));
  }
}
// interno online mais próximo, à frente do jogador, no bar
function mpNearbyPeer() {
  if (!MP.room || !G.map || G.map.id !== 'bar' || !isVest()) return null;
  const [fx, fy] = frontPoint(0.8), P = G.player; let best = null, bd = 9;
  for (const g of mpGhostsHere()) { const d = Math.hypot(g.x - fx, g.y - fy), d2 = Math.hypot(g.x - P.x, g.y - P.y); if ((d < 0.9 || d2 < 1.1) && d2 < 1.6 && d < bd) { bd = d; best = g; } }
  return best;
}
// nome curto de cada lugar, para dizer onde o outro interno está
const MP_LUGAR = { rua: 'Avenida', lobby: 'Saguão', upa: 'UPA', ped: 'Pediatria', go: 'GO', cm: 'Clínica Médica', cir: 'Cirurgia', bar: 'Bar do Rodolfo', ubs: 'UBS' };
function mpLugar(id) { return MP_LUGAR[id] || (MAPS[id] && MAPS[id].nome) || 'outro setor'; }
function mpMotivoOff() {
  if (window.FIREBASE_CONFIG && !window.firebase) return 'a rede bloqueou o servidor do jogo';
  if (typeof FB !== 'undefined' && FB.err) return 'login anônimo falhou: ' + String(FB.err).replace('auth/', '');
  return 'sem conexão';
}
function mpChip() {
  let el = document.getElementById('mpChip');
  const n = MP.ok ? MP.roster.size : 0;
  const show = !!(S && G.map && !document.getElementById('hud').hidden);
  if (!el) { if (!show) return; el = document.createElement('div'); el.id = 'mpChip'; document.getElementById('stage').appendChild(el); }
  el.hidden = !show; if (!show) return;
  if (!isVest()) { const t = '🔒 Modo Internato · jogo individual'; el.className = 'mp-off'; if (el.textContent !== t) el.textContent = t; return; }
  const outros = [...MP.roster.values()], aqui = outros.filter(g => g.map === G.map.id).length;
  // estado da conexão sempre visível, e onde os outros estão (para conseguirem se encontrar)
  const txt = MP.status === 'on' ? (n === 1 ? `🟢 Online · ${outros[0].nm} ${outros[0].map === G.map.id ? 'está aqui' : 'está em: ' + mpLugar(outros[0].map)}` : n ? `🟢 Online · ${n} internos · ${aqui ? aqui + ' aqui' : 'nenhum aqui (veja o MAPA)'}` : '🟢 Online · só você por aqui')
    : MP.status === 'conectando' || MP.status === 'carregando' ? '🟡 Conectando ao modo online…'
    : MP.status === 'negado' ? (window.FIREBASE_CONFIG ? '🔴 O servidor recusou a conexão (permissão do banco de dados)' : '🔴 Multiplayer: esta conta não tem acesso (peça um convite)') : `⚪ Modo solo (${mpMotivoOff()})`;
  el.className = 'mp-' + MP.status;
  if (el.textContent !== txt) el.textContent = txt;
}

// ---------- desafio ----------
function mpChallenge(g) {
  if (!MP.ok) return toast('Sem conexão com os outros internos agora.', 'bad');
  if (g.st !== 'livre') return toast(`${U.esc(g.nm)} está ${g.st === 'duelo' ? 'em outro duelo' : 'ocupado(a)'} agora.`, 'bad');
  if (MP.duel || MP.out) return toast('Você já tem um desafio em andamento.', 'bad');
  const id = 'd' + Math.random().toString(36).slice(2, 10);
  MP.out = { id, to: g.peer, nm: g.nm, t: performance.now() };
  mpEmit({ t: 'convite', id, to: g.peer, nm: mpName(S.player.name), lv: level() });
  toast(`Desafio enviado para <b>${U.esc(g.nm)}</b>. Aguardando resposta…`);
}
function mpMsg(msg) {
  if (msg.isMe) return;
  const m = msg.data; if (!m || typeof m !== 'object' || typeof m.id !== 'string' || m.id.length > 20) return;
  const me = mpMyPeer();
  if (m.to && m.to !== me) return;               // mensagem para outra pessoa
  const D = MP.duel;
  switch (m.t) {
    case 'convite': {
      const busy = !S || !isVest() || !G.map || G.map.id !== 'bar' || G.mode !== 'explore' || MP.duel || MP.inv || MP.out;
      if (busy) return mpEmit({ t: 'resposta', id: m.id, to: msg.peer, ok: false, motivo: 'ocupado' });
      MP.inv = { id: m.id, from: msg.peer, nm: mpName(m.nm), lv: Math.max(1, Math.min(99, m.lv | 0)), t: performance.now() };
      mpShowInvite(); SFX.play('quest');
      return;
    }
    case 'resposta': {
      if (!MP.out || MP.out.id !== m.id || msg.peer !== MP.out.to) return;
      const o = MP.out; MP.out = null;
      if (!m.ok) return toast(m.motivo === 'ocupado' ? `${U.esc(o.nm)} está ocupado(a) agora.` : `${U.esc(o.nm)} recusou o duelo.`, 'bad');
      if (!S || G.mode !== 'explore') return mpEmit({ t: 'desiste', id: o.id, to: o.to });
      return mpHostStart(o);
    }
    case 'inicio': {
      if (!D || D.host || D.id !== m.id || msg.peer !== D.opp) return;
      if (D.phase === 'wait') { if (!mpValidQs(m.qs)) return mpDuelEnd('erro'); D.qs = m.qs; mpRound(0, 0, 0); }
      return;
    }
    case 'rodada': {
      if (!D || D.host || D.id !== m.id || msg.peer !== D.opp || !D.qs) return;
      const r = m.r | 0; if (r < 0 || r >= MP_ROUNDS) return;
      if (r > D.r || (r === D.r && D.phase === 'wait')) mpRound(r, m.sa | 0, m.sb | 0);
      return;
    }
    case 'resp': {
      if (!D || D.id !== m.id || msg.peer !== D.opp) return;
      const r = m.r | 0; if (r < 0 || r >= MP_ROUNDS || D.theirs[r]) return;
      D.theirs[r] = { ok: !!m.ok, ms: Math.max(0, Math.min(MP_QTIME * 1000, +m.ms || MP_QTIME * 1000)) };
      if (D.phase === 'q' && r === D.r) mpRender();
      return;
    }
    case 'placar': {
      if (!D || D.host || D.id !== m.id || msg.peer !== D.opp) return;
      const r = m.r | 0; if (r !== D.r || D.phase !== 'q' && D.phase !== 'wait') return;
      D.sa = m.sa | 0; D.sb = m.sb | 0;
      D.theirs[r] = D.theirs[r] || { ok: !!m.okA, ms: +m.msA || 0 };
      D.res = { a: { ok: !!m.okA, ms: +m.msA || 0 }, b: { ok: !!m.okB, ms: +m.msB || 0 }, w: m.w === 'a' || m.w === 'b' ? m.w : null };
      D.phase = 'res'; D.resAt = performance.now(); mpHitAnim(D); mpRender();
      return;
    }
    case 'fim': {
      if (!D || D.host || D.id !== m.id || msg.peer !== D.opp || D.phase === 'fim') return;
      D.sa = m.sa | 0; D.sb = m.sb | 0; mpDuelEnd('placar');
      return;
    }
    case 'desiste': {
      if (D && D.id === m.id && msg.peer === D.opp && D.phase !== 'fim') mpDuelEnd('desistiu');
      if (MP.inv && MP.inv.id === m.id) { MP.inv = null; if (G.panelName === 'mp_convite') { G.panelName = null; closeOverlay(); } }
      return;
    }
  }
}
function mpValidQs(qs) {
  if (!Array.isArray(qs) || qs.length !== MP_ROUNDS) return false;
  return qs.every(q => q && Number.isInteger(q.qi) && q.qi >= 0 && q.qi < QUICK.length && Array.isArray(q.ord) && q.ord.length === QUICK[q.qi].o.length && [...q.ord].sort().every((v, i) => v === i));
}
function mpShow(html, name) { G.mode = 'panel'; G.panelName = name; setOverlay(`<div class="panel small minibox duel" role="dialog"><header class="p-head"><h2>Duelo no Bar do Rodolfo</h2><button class="x" id="pClose" aria-label="Fechar">✕</button></header><div class="p-body">${html}</div></div>`, 'dim'); $('#pClose').onclick = () => closeOverlay(); }
function mpShowInvite() {
  const I = MP.inv;
  mpShow(`<p><b>${U.esc(I.nm)}</b> (Nv ${I.lv}) te desafiou para um <b>Duelo de Pergunta Relâmpago</b>!</p><p class="hint">Melhor de 5 perguntas de residência. Ponto para quem acertar; se os dois acertarem, ganha quem respondeu mais rápido.</p><div class="duel-timer" id="duelT"><i></i></div><div class="menu-col"><button class="btn" id="mpAceita">Aceitar o desafio</button><button class="btn ghost" id="mpRecusa">Recusar</button></div>`, 'mp_convite');
  $('#mpAceita').onclick = () => {
    const inv = MP.inv; if (!inv) return closeOverlay();
    MP.inv = null;
    MP.duel = { id: inv.id, host: false, opp: inv.from, oppNm: inv.nm, phase: 'wait', r: 0, sa: 0, sb: 0, mine: {}, theirs: {}, sentAt: 0, t0: performance.now() };
    mpEmit({ t: 'resposta', id: inv.id, to: inv.from, ok: true });
    mpRender();
  };
  $('#mpRecusa').onclick = () => closeOverlay();
}
// fechar a janela: recusar o convite / desistir do duelo
function mpOnClose(name) {
  if (name === 'mp_convite' && MP.inv) { mpEmit({ t: 'resposta', id: MP.inv.id, to: MP.inv.from, ok: false, motivo: 'recusou' }); MP.inv = null; }
  if (name === 'mp_duelo' && MP.duel) {
    if (MP.duel.phase !== 'fim') { mpEmit({ t: 'desiste', id: MP.duel.id, to: MP.duel.opp }); toast('Você desistiu do duelo.', 'bad'); }
    MP.duel = null;
  }
}
function mpHostStart(o) {
  const pool = U.shuffle(QUICK.map((q, i) => i).filter(i => !QUICK[i].img)).slice(0, MP_ROUNDS);
  const qs = pool.map(qi => ({ qi, ord: U.shuffle(QUICK[qi].o.map((_, k) => k)) }));
  MP.duel = { id: o.id, host: true, opp: o.to, oppNm: o.nm, qs, phase: 'q', r: 0, sa: 0, sb: 0, mine: {}, theirs: {}, sentAt: performance.now(), fimSent: 0 };
  mpEmit({ t: 'inicio', id: o.id, to: o.to, qs });
  mpRound(0, 0, 0);
}
function mpRound(r, sa, sb) {
  const D = MP.duel; D.r = r; D.sa = sa; D.sb = sb; D.phase = 'q'; D.t0 = performance.now(); D.res = null; D.sentAt = performance.now();
  mpRender(); SFX.play('ui');
}
function mpAnswer(k) {
  const D = MP.duel; if (!D || D.phase !== 'q' || D.mine[D.r]) return;
  const q = D.qs[D.r];
  const ok = k !== null && q.ord[k] === 0, ms = Math.min(MP_QTIME * 1000, Math.round(performance.now() - D.t0));
  D.mine[D.r] = { ok, ms, k };
  SFX.play(ok ? 'ok' : 'bad');
  mpEmit({ t: 'resp', id: D.id, to: D.opp, r: D.r, ok, ms }); D.sentAt = performance.now();
  mpRender();
}
function mpResolve() {
  const D = MP.duel, r = D.r, A = D.mine[r], B = D.theirs[r] || { ok: false, ms: MP_QTIME * 1000 };
  let w = null;
  if (A.ok && B.ok) w = A.ms <= B.ms ? 'a' : 'b'; else if (A.ok) w = 'a'; else if (B.ok) w = 'b';
  if (w === 'a') D.sa++; else if (w === 'b') D.sb++;
  D.res = { a: A, b: B, w }; D.phase = 'res'; D.nextAt = performance.now() + 4600; mpHitAnim(D);
  mpEmit({ t: 'placar', id: D.id, to: D.opp, r, sa: D.sa, sb: D.sb, okA: A.ok, msA: A.ms, okB: B.ok, msB: B.ms, w });
  mpRender();
}
function mpDuelTick(now) {
  const D = MP.duel;
  if (MP.out && now - MP.out.t > 20000) { toast(`${U.esc(MP.out.nm)} não respondeu ao desafio.`); MP.out = null; }
  if (MP.inv && G.panelName === 'mp_convite') { const b = document.querySelector('#duelT i'); if (b) b.style.width = Math.max(0, 100 - (now - MP.inv.t) / 150) + '%'; if (now - MP.inv.t > 15000) closeOverlay(); }
  if (!D) return;
  if (D.phase === 'wait' && now - D.t0 > 12000) return mpDuelEnd('erro');
  if (D.phase === 'q') {
    const left = MP_QTIME - (now - D.t0) / 1000;
    const bar = document.querySelector('#duelT i'); if (bar) { bar.style.width = Math.max(0, left / MP_QTIME * 100) + '%'; bar.classList.toggle('low', left < 6); }
    if (left <= 0 && !D.mine[D.r]) mpAnswer(null);
    if (D.host) {
      if (D.mine[D.r] && (D.theirs[D.r] || left < -3)) return mpResolve();
      // reenvia a rodada atual enquanto a resposta do adversário não chega
      if (!D.theirs[D.r] && now - D.sentAt > 2500) { D.sentAt = now; mpEmit(D.r === 0 ? { t: 'inicio', id: D.id, to: D.opp, qs: D.qs } : { t: 'rodada', id: D.id, to: D.opp, r: D.r, sa: D.sa, sb: D.sb }); }
    } else if (D.mine[D.r] && now - D.sentAt > 2500) { D.sentAt = now; const a = D.mine[D.r]; mpEmit({ t: 'resp', id: D.id, to: D.opp, r: D.r, ok: a.ok, ms: a.ms }); }
  }
  if (D.phase === 'res' && !D.host && now - D.resAt > 15000) return mpDuelEnd('placar');
  if (D.phase === 'res' && D.host && now > D.nextAt) {
    if (D.sa >= MP_WIN || D.sb >= MP_WIN || D.r >= MP_ROUNDS - 1) { mpEmit({ t: 'fim', id: D.id, to: D.opp, sa: D.sa, sb: D.sb }); D.fimSent = now; D.fimN = 1; mpDuelEnd('placar'); }
    else { mpEmit({ t: 'rodada', id: D.id, to: D.opp, r: D.r + 1, sa: D.sa, sb: D.sb }); mpRound(D.r + 1, D.sa, D.sb); }
  }
  if (D.phase === 'fim' && D.host && D.fimN < 3 && now - D.fimSent > 2000) { D.fimSent = now; D.fimN++; mpEmit({ t: 'fim', id: D.id, to: D.opp, sa: D.sa, sb: D.sb }); }
}
function mpDuelEnd(why) {
  const D = MP.duel; if (!D) return;
  D.phase = 'fim'; D.why = why; D.fimAt = performance.now();
  const my = D.host ? D.sa : D.sb, op = D.host ? D.sb : D.sa;
  D.out = why === 'saiu' || why === 'desistiu' ? 'vitoria_wo' : why === 'erro' ? 'erro' : my > op ? 'vitoria' : my < op ? 'derrota' : 'empate';
  // recompensa (limite diário de duelos premiados; W.O. não vale prêmio)
  if (!D.rewarded && ['vitoria', 'derrota', 'empate'].includes(D.out) && S) {
    D.rewarded = true;
    const hoje = new Date().toISOString().slice(0, 10);
    if (!S.duelos || S.duelos.dia !== hoje) S.duelos = Object.assign({ vitorias: (S.duelos && S.duelos.vitorias) || 0 }, { dia: hoje, n: 0 });
    if (D.out === 'vitoria') S.duelos.vitorias = (S.duelos.vitorias || 0) + 1;
    if (S.duelos.n < MP_REWARD_CAP) {
      S.duelos.n++;
      const xp = D.out === 'vitoria' ? 40 : D.out === 'empate' ? 25 : 15, mo = D.out === 'vitoria' ? 20 : D.out === 'empate' ? 10 : 0;
      addXP(xp, 'duelo'); if (mo) addCoins(mo);
      D.prize = `+${xp} XP${mo ? ` · +${mo} Moedas de Plantão` : ''}`;
    } else D.prize = 'Recompensa diária de duelos já recebida (o duelo continua valendo a glória).';
    try { saveGame(); } catch (e) {}
  }
  SFX.play(D.out.startsWith('vitoria') ? 'quest' : D.out === 'derrota' ? 'bad' : 'ui');
  if (G.panelName === 'mp_duelo' || G.panelName === 'mp_convite' || G.mode === 'explore') mpRender();
}
function mpFmt(ms) { return (ms / 1000).toFixed(1).replace('.', ',') + ' s'; }
// ---------- cena de batalha (estilo RPG clássico de monstrinhos) ----------
function mpHitAnim(D) {
  const R = D.res; if (!R || !R.w) { D.anim = null; return; }
  const mineW = (R.w === 'a') === D.host;
  D.anim = { victim: mineW ? 'op' : 'me', t0: performance.now(), sfx: false };
}
function mpOppLook() { const D = MP.duel, g = D && MP.ghosts.get(D.opp); return (g && g.look) || MP_FALLBACK_LOOK; }
function mpHpBar(c, x, y, w, frac) {
  c.fillStyle = '#2a2d36'; c.fillRect(x - 1, y - 1, w + 2, 6);
  c.fillStyle = '#4a4f5a'; c.fillRect(x, y, w, 4);
  c.fillStyle = frac > 0.5 ? '#4fd67a' : frac > 0.2 ? '#f2c84a' : '#ff5a5a';
  c.fillRect(x, y, Math.round(w * Math.max(0, frac)), 4);
  c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x, y, Math.round(w * Math.max(0, frac)), 1);
}
function mpInfoBox(c, x, y, w, nm, lv, frac, hpTxt) {
  c.fillStyle = '#1b1622'; c.fillRect(x - 1, y - 1, w + 2, (hpTxt ? 31 : 24) + 2);
  c.fillStyle = '#f7f5ef'; c.fillRect(x, y, w, hpTxt ? 31 : 24);
  c.fillStyle = '#d9d4c4'; c.fillRect(x, y + (hpTxt ? 29 : 22), w, 2);
  text57(c, nm.slice(0, 12), x + 4, y + 3, '#1b1622');
  const lvT = 'NV' + lv; text57(c, lvT, x + w - 4 - text57W(lvT), y + 3, '#1b1622');
  c.fillStyle = '#f2a03a'; c.fillRect(x + 4, y + 13, 15, 7); text57(c, 'PV', x + 6, y + 13, '#ffffff');
  mpHpBar(c, x + 22, y + 14, w - 27, frac);
  if (hpTxt) text57(c, hpTxt, x + w - 4 - text57W(hpTxt), y + 22, '#1b1622');
}
function mpScene(now) {
  const D = MP.duel, cv = document.getElementById('duelCv'); if (!D || !cv) return;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const W = cv.width, H = cv.height, t = now / 1000;
  // fundo: parede quente do bar com faixas de luz + piso de madeira
  const g = c.createLinearGradient(0, 0, 0, 92); g.addColorStop(0, '#ffe7b0'); g.addColorStop(1, '#f2b46a'); c.fillStyle = g; c.fillRect(0, 0, W, 92);
  c.fillStyle = 'rgba(255,255,255,0.18)'; for (let k = 0; k < 7; k++) { const yy = 8 + k * 12 + Math.round(Math.sin(t * 2 + k) * 1); c.fillRect(0, yy, W, 2); }
  c.fillStyle = '#b07c4f'; c.fillRect(0, 92, W, H - 92);
  for (let yy = 92; yy < H; yy += 7) { c.fillStyle = '#9a6a42'; c.fillRect(0, yy, W, 1); for (let xx = ((yy / 7) % 2) * 20; xx < W; xx += 40) c.fillRect(xx, yy, 1, 7); }
  c.fillStyle = '#8a5a34'; c.fillRect(0, 90, W, 3);
  // tapetes redondos (as "arenas")
  const pad = (cx, cy, rx, ry, col, rim) => { for (let k = -ry; k <= ry; k++) { const w = Math.round(rx * Math.sqrt(1 - (k * k) / (ry * ry))); c.fillStyle = Math.abs(k) > ry - 2 ? rim : col; c.fillRect(cx - w, cy + k, w * 2, 1); } };
  pad(188, 78, 46, 10, '#c0392b', '#8e2424'); pad(188, 77, 34, 6, '#e9c13b', '#e9c13b');
  pad(66, 140, 62, 13, '#3a7bd5', '#24508f'); pad(66, 139, 46, 8, '#e9c13b', '#e9c13b');
  // estado das animações
  const my = D.host ? D.sa : D.sb, op = D.host ? D.sb : D.sa;
  D.hpMe = D.hpMe ?? 3; D.hpOp = D.hpOp ?? 3;
  const A = D.anim, at = A ? (now - A.t0) / 1000 : 9;
  if (!A || at > 0.45) { const tm = MP_WIN - op, to = MP_WIN - my; D.hpMe += Math.sign(tm - D.hpMe) * Math.min(Math.abs(tm - D.hpMe), 0.03); D.hpOp += Math.sign(to - D.hpOp) * Math.min(Math.abs(to - D.hpOp), 0.03); }
  if (A && at > 0.35 && !A.sfx) { A.sfx = true; SFX.play('hit'); }
  const off = { me: [0, 0], op: [0, 0] }, vis = { me: true, op: true }, pose = { me: 'idle', op: 'idle' };
  if (A && at < 1.3) {
    const att = A.victim === 'op' ? 'me' : 'op', dirx = att === 'me' ? 1 : -1, diry = att === 'me' ? -1 : 1;
    if (at < 0.3) { const k = Math.sin(at / 0.3 * Math.PI); off[att] = [dirx * 10 * k, diry * 5 * k]; pose[att] = 'cast'; }
    if (at > 0.3 && at < 1.2) { pose[A.victim] = 'hit'; off[A.victim] = [Math.round(Math.sin(at * 60) * 3), 0]; vis[A.victim] = Math.floor(at * 12) % 2 === 0; }
  }
  // fim: quem perdeu "desmaia" (afunda e some), quem ganhou comemora
  let faint = null;
  if (D.phase === 'fim' && D.out !== 'erro' && D.out !== 'empate') { const loser = D.out === 'derrota' ? 'me' : 'op'; faint = { who: loser, k: Math.min(1, (now - (D.fimAt || now)) / 1000 / 0.9) }; pose[loser === 'me' ? 'op' : 'me'] = 'victory'; }
  const drawSp = (who, L, dir, x, y, sc) => {
    if (!vis[who]) return;
    const sp = SPR.char(L, dir, pose[who] === 'idle' ? Math.floor(t * 1.5) % 2 : 0, pose[who]);
    const w = SW * sc, h = SH * sc; let dx = Math.round(x - w / 2 + off[who][0]), dy = Math.round(y - h + off[who][1]);
    if (faint && faint.who === who) { c.save(); c.beginPath(); c.rect(0, 0, W, y + 2); c.clip(); dy += Math.round(faint.k * h * 0.9); c.globalAlpha = 1 - faint.k * 0.7; c.drawImage(sp, dx, dy, w, h); c.restore(); return; }
    c.drawImage(sp, dx, dy, w, h);
    if (pose[who] === 'hit' && Math.floor((now - A.t0) / 60) % 3 === 0) { c.save(); c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.5; c.drawImage(sp, dx, dy, w, h); c.restore(); }
  };
  try { drawSp('op', mpOppLook(), 0, 188, 80, 1); } catch (e) { drawSp('op', MP_FALLBACK_LOOK, 0, 188, 80, 1); }
  drawSp('me', playerLook(), 1, 70, H + 52, 2);
  // golpe: estrela de "pergunta certa" voando do atacante para a vítima
  if (A && at > 0.12 && at < 0.42) {
    const k = (at - 0.12) / 0.3, [x0, y0, x1, y1] = A.victim === 'op' ? [96, 100, 188, 50] : [188, 50, 80, 112];
    const x = x0 + (x1 - x0) * k, y = y0 + (y1 - y0) * k - Math.sin(k * Math.PI) * 14;
    c.fillStyle = '#fff6b0'; c.fillRect(Math.round(x) - 4, Math.round(y), 9, 1); c.fillRect(Math.round(x), Math.round(y) - 4, 1, 9);
    c.fillStyle = '#ffd84a'; c.fillRect(Math.round(x) - 2, Math.round(y) - 2, 5, 5); c.fillStyle = '#ffffff'; c.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2);
  }
  if (A && at > 0.32 && at < 0.42) { c.fillStyle = 'rgba(255,255,255,0.55)'; c.fillRect(0, 0, W, H); }
  // caixas de informação
  const opG = MP.ghosts.get(D.opp);
  mpInfoBox(c, 8, 10, 112, D.oppNm, opG ? opG.lv : 1, D.hpOp / MP_WIN);
  mpInfoBox(c, 136, 96, 112, mpName(S.player.name), level(), D.hpMe / MP_WIN, Math.round(Math.max(0, D.hpMe)) + '/' + MP_WIN);
  c.fillStyle = 'rgba(27,22,34,0.75)'; const rt = D.phase === 'fim' ? 'FIM DE DUELO' : 'PERGUNTA ' + (D.r + 1) + '/' + MP_ROUNDS; c.fillRect(W - text57W(rt) - 12, 4, text57W(rt) + 8, 11); text57(c, rt, W - text57W(rt) - 8, 6, '#ffffff');
}
function mpRender() {
  const D = MP.duel; if (!D) return;
  const opNm = U.esc(D.oppNm);
  let msg = '', cmd = '';
  if (D.phase === 'wait') msg = `<p>${opNm} aceitou o duelo! Preparando as perguntas…</p>`;
  else if (D.phase === 'q') {
    const q = QUICK[D.qs[D.r].qi], mine = D.mine[D.r], theirs = D.theirs[D.r];
    msg = `<p class="duel-q">${U.esc(q.q)}</p><div class="duel-timer" id="duelT"><i></i></div><p class="hint">${mine ? `Resposta enviada! ${theirs ? opNm + ' também já respondeu.' : 'Aguardando ' + opNm + '…'}` : theirs ? `${opNm} já respondeu. Rápido!` : 'Acerte antes do adversário para atacar!'}</p>`;
    cmd = `<div class="duel-cmd">${D.qs[D.r].ord.map((oi, k) => `<button class="c${k % 4} ${mine && mine.k === k ? 'picked' : ''}" data-k="${k}" ${mine ? 'disabled' : ''}>${U.esc(q.o[oi])}</button>`).join('')}</div>`;
  } else if (D.phase === 'res') {
    const q = QUICK[D.qs[D.r].qi], R = D.res, A = D.host ? R.a : R.b, B = D.host ? R.b : R.a;
    const mineW = R.w && ((R.w === 'a') === D.host);
    const fala = !R.w ? (A.ok || B.ok ? 'Empate técnico!' : 'Os dois erraram! Ninguém tomou dano.') : mineW ? `Você acertou${A.ms < MP_QTIME * 1000 ? ' em ' + mpFmt(A.ms) : ''}! ${opNm} tomou dano!` : `${opNm} acertou${B.ms < MP_QTIME * 1000 ? ' em ' + mpFmt(B.ms) : ''}! Você tomou dano!`;
    const sit = (x) => x.ok ? `✔ ${mpFmt(x.ms)}` : x.ms >= MP_QTIME * 1000 ? '⏱ tempo esgotado' : '✘ errou';
    msg = `<p class="duel-fala">${fala}</p><p class="hint">Você: ${sit(A)} · ${opNm}: ${sit(B)}</p><p><b>Resposta certa:</b> ${U.esc(q.o[0])}</p><p class="hint">${U.esc(q.e)}</p>`;
  } else {
    const fala = { vitoria: `${opNm} não aguentou! Você venceu o duelo! 🏆`, derrota: `Você não aguentou… ${opNm} venceu o duelo.`, empate: 'Empate! Os dois saem de pé.', vitoria_wo: `${opNm} ${D.why === 'saiu' ? 'saiu do bar' : 'fugiu do duelo'}! Vitória por W.O.`, erro: 'O duelo não pôde continuar (conexão instável).' }[D.out];
    msg = `<p class="duel-fala">${fala}</p>${D.prize ? `<p>${U.esc(D.prize)}</p>` : ''}${S && S.duelos ? `<p class="hint">Duelos vencidos: ${S.duelos.vitorias || 0}</p>` : ''}`;
    cmd = `<div class="duel-cmd one"><button class="c3" id="mpVolta">Voltar ao bar</button></div>`;
  }
  const keep = document.getElementById('duelCv') && G.panelName === 'mp_duelo';
  if (keep) { // atualiza só a parte de baixo, sem recriar a cena (as animações continuam)
    OV().querySelector('.duel-msg').innerHTML = msg; OV().querySelector('.duel-side').innerHTML = cmd;
  } else mpShow(`<canvas id="duelCv" class="duel-cv" width="256" height="144"></canvas><div class="duel-bottom"><div class="duel-msg">${msg}</div><div class="duel-side">${cmd}</div></div>`, 'mp_duelo');
  OV().querySelector('.duel-bottom').classList.toggle('full', !cmd);
  OV().querySelectorAll('[data-k]').forEach(b => b.onclick = () => mpAnswer(+b.dataset.k));
  const v = $('#mpVolta'); if (v) v.onclick = () => closeOverlay();
  mpScene(performance.now());
}
