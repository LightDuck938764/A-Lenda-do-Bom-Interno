/* =====================================================================
   MUNDO: carregamento de mapas, entidades, movimento, colisão, NPCs,
   pacientes, interação, missões secundárias e eventos
   ===================================================================== */
const DIRV = [[0, 1], [0, -1], [-1, 0], [1, 0]];

function playerLook() {
  const p = S.player.look;
  const sh = SHIRT_OPTIONS.find(x => x.id === p.shirt) || SHIRT_OPTIONS[0];
  const pa = PANTS_OPTIONS.find(x => x.id === p.pants) || PANTS_OPTIONS[0];
  const so = SHOE_OPTIONS.find(x => x.id === p.shoes) || SHOE_OPTIONS[0];
  const L = { skin: p.skin, hair: p.hair, hairC: p.hairC, top: sh.top, topC: sh.c, bottomC: pa.c, skirt: !!pa.skirt, shoes: so.c, coat: null, badge: true,
    build: p.pres === 'm' ? 'normal' : 'magro', mouth: p.pres === 'f' ? 'lips' : 'normal', fem: p.pres === 'f', glasses: p.glasses ? 'preta' : null };
  // corpo: sem item de corpo o personagem usa só a roupa escolhida na criação
  const body = ITEMS[S.equip.corpo];
  switch (body && body.visual) {
    case 'jaleco': L.coat = 'jaleco'; break;
    case 'jaleco_hosp': L.coat = 'jaleco'; L.coatTrim = '#2f6fd6'; break;
    case 'pijama': L.scrub = '#4f8fd6'; break;
    case 'liga': L.scrub = LIGA_COLORS[S.ligaColor] || '#c8313b'; break;
    case 'esteril': L.scrub = '#8fc4e8'; L.cap = '#4f8fd6'; L.mask = true; L.badge = false; break;
    case 'peste': L.plague = true; break;
    case 'abada': L.abada = true; L.top = 'regata'; L.topC = '#ffcc33'; break;
  }
  // mão: ferramenta na mão direita (o estetoscópio vai no pescoço; o tridente da Gertrudes é um prendedor de cabelo)
  const mao = S.equip.mao;
  if (mao === 'estetoscopio') L.steth = true; else if (mao === 'tridente_sheila') L.hairpin = true; else if (mao) L.tool = mao;
  // cabeça
  const cab = S.equip.cabeca;
  if (cab === 'touca_estampada') { L.cap = '#3fa66b'; L.capPrint = true; } else if (cab) L.head = cab;
  // amuleto
  const am = S.equip.amuleto;
  if (am === 'tenis') L.shoes = '#ff5a3a';
  else if (am === 'sapato_bico') { L.shoes = '#f4f4f4'; L.pointy = true; }
  else if (am === 'cracha_ouro') L.badgeGold = true;
  else if (am) L.amu = am;
  return L;
}
function refreshPlayerLook() { if (G.player) G.player.look = playerLook(); }

/* ---------------- Entidades ---------------- */
function makeEnt(o) { return Object.assign({ x: 0, y: 0, dir: 0, moving: false, frame: 0, animT: 0, pose: 'idle', poseT: 0, speed: 1, look: {} }, o); }
function lookOf(e) { return typeof e.look === 'string' ? LOOKS[e.look] : e.look; }
function collides(M, x, y) {
  const hw = 0.28, top = y - 0.22, bot = y - 0.02;
  for (const [cx, cy] of [[x - hw, top], [x + hw, top], [x - hw, bot], [x + hw, bot]]) {
    const i = Math.floor(cx), j = Math.floor(cy);
    if (!M.in(i, j) || M.solid[j][i]) return true;
    const lw = lockedWarpAt(M, i, j); if (lw) { G.lockBump = lw; return true; }
    if (S && S.side && S.side.length && sideProps(M.id).some(o => o.solid && o.x === i && o.y === j)) return true;
  }
  return false;
}
// parede invisível: a passagem para um estágio ainda trancado é sólida
function lockedWarpAt(M, i, j) {
  if (!M.warps || typeof S === 'undefined' || !S || !S.order) return null;
  for (const w of M.warps) if (AREAS[w.to] && i >= w.x && i < w.x + w.w && j >= w.y && j < w.y + w.h && !areaUnlocked(w.to)) return w;
  return null;
}
function moveEnt(e, dx, dy, M) {
  let moved = false;
  if (dx) { const nx = e.x + dx; if (!collides(M, nx, e.y)) { e.x = nx; moved = true; } }
  if (dy) { const ny = e.y + dy; if (!collides(M, e.x, ny)) { e.y = ny; moved = true; } }
  return moved;
}
function walkable(M, i, j) { return M.in(i, j) && !M.solid[j][i]; }

/* ---------------- Alcance: quais pisos o jogador consegue pisar a partir das entradas ---------------- */
function reachGrid(M) {
  if (M._reach) return M._reach;
  const H = M.solid.length, W = M.solid[0].length;
  const R = Array.from({ length: H }, () => new Uint8Array(W)); const q = [];
  const seed = (x, y) => { const i = Math.floor(x), j = Math.floor(y); if (walkable(M, i, j) && !R[j][i]) { R[j][i] = 1; q.push([i, j]); } };
  for (const w of M.warps) for (let j = w.y; j < w.y + w.h; j++) for (let i = w.x; i < w.x + w.w; i++) seed(i + 0.5, j + 0.5);
  for (const id in MAPS) for (const w of MAPS[id].warps) if (w.to === M.id) seed(w.tx, w.ty - 0.1);
  if (M.spawn) seed(M.spawn[0], M.spawn[1]);
  while (q.length) { const [i, j] = q.pop(); for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const a = i + di, b = j + dj; if (walkable(M, a, b) && !R[b][a]) { R[b][a] = 1; q.push([a, b]); } } }
  return (M._reach = R);
}
function tileReachable(M, i, j) { const R = reachGrid(M); return M.in(i, j) && !!R[j][i]; }
// um objeto é utilizável se existe um piso alcançável encostado nele (acima, abaixo ou dos lados)
function objReachable(M, o) {
  for (let j = o.y - 1; j <= o.y + o.h; j++) for (let i = o.x - 1; i <= o.x + o.w; i++) {
    const inside = i >= o.x && i < o.x + o.w && j >= o.y && j < o.y + o.h; if (inside) continue;
    const diag = (i < o.x || i >= o.x + o.w) && (j < o.y || j >= o.y + o.h); if (diag) continue;
    if (tileReachable(M, i, j)) return true;
  }
  return false;
}

/* ---------------- Carregar mapa ---------------- */
function enterMap(id, x, y, dir) {
  const M = MAPS[id]; if (!M) return;
  if (!M.canvas) renderMapStatic(M);
  G.map = M;
  if (!G.player) G.player = makeEnt({ look: playerLook() });
  Object.assign(G.player, { x, y, dir: dir ?? G.player.dir, moving: false });
  if (collides(M, x, y)) { const sp = findFree(M, Math.floor(x), Math.floor(y)); G.player.x = sp[0] + 0.5; G.player.y = sp[1] + 0.6; }
  G.npcs = NPCS_DEF.filter(n => n.map === id).map(n => {
    const e = makeEnt(Object.assign({}, n, { x: n.x, y: n.y, home: [n.x, n.y], wait: Math.random() * 2, target: null, busy: Math.random() < 0.3 }));
    if (collides(M, e.x, e.y)) { const sp = findFree(M, Math.floor(e.x), Math.floor(e.y)); e.x = sp[0] + 0.5; e.y = sp[1] + 0.6; }
    return e;
  });
  // NPCs temporários de missões
  for (const q of S.side) for (const tn of (q.tempNpcs || [])) if (tn.map === id) G.npcs.push(makeEnt(Object.assign({}, tn, { wait: 1, target: null })));
  // residentes escondidos (missão "localizar residente")
  for (const q of S.side) if (q.tpl === 'localizar' && q.extra) {
    const n = G.npcs.find(x => x.id === q.extra.npc); if (n && q.extra.map !== id) G.npcs = G.npcs.filter(x => x !== n);
    if (q.extra.map === id && !G.npcs.find(x => x.id === q.extra.npc)) { const base = NPCS_DEF.find(x => x.id === q.extra.npc); if (base) G.npcs.push(makeEnt(Object.assign({}, base, { x: q.extra.x, y: q.extra.y, beh: { t: 'static' }, wait: 9, map: id }))); }
  }
  G.followers = G.followers.filter(f => f.map === id);
  setupSpots(M);
  for (const k in MAIN_FIND) { const st = currentArea() && chainStep(currentArea()); if (st && st.tipo === 'find' && st.obj === k) setupMainFind(st); }
  G.camera.x = G.player.x * TS - VW / 2; G.camera.y = G.player.y * TS - VH / 2;
  G.warpCd = 0.4; G.fade = 1;
  S.map = { id, x: G.player.x, y: G.player.y, dir: G.player.dir };
  updateLocationHUD();
  if (AREAS[id] && !S.tips['area_' + id]) { S.tips['area_' + id] = 1; toast(`<b>${AREAS[id].local}</b><br><small>${AREAS[id].nome}${S.completed[id] ? ' — concluído' : ''}</small>`, 'area'); }
  if (G.psy && G.psy.map === id && !G.npcs.includes(G.psy.ent)) G.npcs.push(G.psy.ent);
}
function findFree(M, i, j) {
  for (let r = 0; r < 12; r++) for (let dj = -r; dj <= r; dj++) for (let di = -r; di <= r; di++) { if (walkable(M, i + di, j + dj)) return [i + di, j + dj]; }
  return [i, j];
}

/* ---------------- Pacientes nos leitos ---------------- */
function mapArea(id) { return AREAS[id] ? id : null; }
function setupSpots(M) {
  G.spots = [];
  const area = mapArea(M.id);
  if (!S.spotsState[M.id]) S.spotsState[M.id] = {};
  const st = S.spotsState[M.id];
  for (const o of M.objs) {
    if (!o.spot) continue;
    if (!st[o.id]) st[o.id] = { active: false, caseId: null, look: null, cd: 0, seed: Math.floor(Math.random() * 1e6) };
    G.spots.push({ obj: o, s: st[o.id] });
  }
  if (area) refillSpots(area);
}
function refillSpots(area) {
  if (!areaUnlocked(area)) return;
  const casos = G.spots.filter(sp => sp.obj.spot === 'caso');
  const active = casos.filter(sp => sp.s.active).length;
  const want = Math.min(casos.length, area === 'cm' ? 9 : area === 'cir' ? 5 : 4);
  const cand = U.shuffle(casos.filter(sp => !sp.s.active && (sp.s.cd || 0) <= S.playTime));
  for (let k = 0; k < want - active && k < cand.length; k++) activateSpot(cand[k], area);
  for (const sp of casos) if (!sp.s.look) sp.s.look = randomCivilLook(sp.s.seed, sp.obj.bebe ? 'bebe' : U.pick(['adulto', 'idoso']));
}
function pickCase(area, spot) {
  const step = areaStepIdx(area), done = !!S.completed[area];
  const maxDif = done ? 3 : step < 3 ? 1 : step < 6 ? 2 : 3;
  let pool = CASES.filter(c => c.area === area);
  if (area === 'go') { const loc = spot.obj.local === 'quarto' ? 'gineco' : spot.obj.local === 'ps' ? 'obst' : spot.obj.local; const g = pool.filter(c => goLocal(c) === loc); if (g.length) pool = g; }
  if (area === 'cm' && spot.obj.ala) { const g = pool.filter(c => c.ala === spot.obj.ala); if (g.length) pool = g; }
  if (spot.obj.bebe) { const b = pool.filter(c => c.pac.tipo === 'bebe'); if (b.length) pool = b; }
  else if (area === 'ped') { const b = pool.filter(c => c.pac.tipo !== 'bebe'); if (b.length) pool = b; }
  const fresh = pool.filter(c => !S.seen.includes(c.id) || prioW(temaDe(c)) > 1); if (fresh.length >= 2) pool = fresh;
  const w = pool.map(c => ({ c, w: (c.dif <= maxDif ? 4 : 1) * prioW(temaDe(c)) }));
  return U.weighted(w).c;
}
// GO: obstetrícia no centro obstétrico/observação/alojamento; ginecologia no consultório, ultrassom e quartos
function goLocal(c) { return c.local || (c.tags && c.tags.includes('obst') ? 'obst' : 'gineco'); }
const GO_QUARTO = ['go_mioma2', 'go_swyer', 'go_rokitansky', 'go_morris', 'go_hac', 'go_kallmann', 'go_endometriose', 'go_endometriose2', 'go_mioma', 'go_adenomiose', 'go_polipo', 'go_sop1', 'go_sop2'];
function activateSpot(sp, area) {
  const c = pickCase(area, sp); if (!c) return;
  sp.s.active = true; sp.s.caseId = c.id;
  const tipo = c.pac.tipo;
  const L = randomCivilLook(sp.s.seed + S.playTime | 0, tipo === 'bebe' ? 'bebe' : tipo);
  if (c.pac.sexo === 'F' && ['curto', 'raspado', 'careca', 'medio'].includes(L.hair)) L.hair = U.pick(['longo', 'coque', 'rabo', 'cacheado', 'bob']);
  if (c.pac.sexo === 'M' && ['longo', 'rabo', 'coque', 'bob', 'trancas'].includes(L.hair)) L.hair = U.pick(['curto', 'raspado', 'cacheado']);
  sp.s.look = L; sp.s.tipo = tipo;
}
function spotDone(sp) { sp.s.active = false; sp.s.caseId = null; sp.s.cd = S.playTime + U.rnd(50, 110); }

/* ---------------- Itens escondidos da campanha ---------------- */
function setupMainFind(step) {
  const f = MAIN_FIND[step.obj]; if (!f) return;
  const M = MAPS[f.map]; if (!M) return;
  if (!S.flags['find_' + step.obj]) {
    let best = null, bd = 1e9;
    for (const o of M.objs) if (o.type === f.objType) { const d = Math.hypot(o.x - f.near[0], o.y - f.near[1]); if (d < bd) { bd = d; best = o; } }
    if (best) S.flags['find_' + step.obj] = best.id;
  }
}

/* ---------------- Atualização ---------------- */
function updateWorld(dt) {
  const M = G.map; if (!M) return;
  const P = G.player, st = stats();
  // movimento do jogador
  let dx = 0, dy = 0;
  if (G.keys.ArrowLeft || G.keys.KeyA) dx -= 1; if (G.keys.ArrowRight || G.keys.KeyD) dx += 1;
  if (G.keys.ArrowUp || G.keys.KeyW) dy -= 1; if (G.keys.ArrowDown || G.keys.KeyS) dy += 1;
  if (G.touchDir) { dx = G.touchDir[0]; dy = G.touchDir[1]; }
  const carrying = S.side.some(q => q.carry);
  let spd = 4.2 * (1 + (st.velocidade || 0) / 100);
  if (carrying && hasSkill('int2')) spd *= 1.15;
  if (G.followers.length && hasSkill('int13')) spd *= 1.2;
  const sprint = hasSkill('int18') && (G.keys.ShiftLeft || G.keys.ShiftRight || G.touchSprint) && S.energia > 1;
  if (sprint && (dx || dy)) { spd *= 1.7; S.energia = Math.max(0, S.energia - dt * 1.5); }
  if (dx || dy) {
    const len = Math.hypot(dx, dy); dx /= len; dy /= len;
    P.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
    G.lockBump = null;
    const m = moveEnt(P, dx * spd * dt, dy * spd * dt, M);
    if (G.lockBump && G.t - (G.lockMsgT ?? -9) > 2.5) { G.lockMsgT = G.t; lockedMsg(G.lockBump.to); }
    P.moving = m; P.animT += dt * (sprint ? 12 : 9);
    if (m && G.t - G.lastStep > 0.28) { G.lastStep = G.t; SFX.play('step'); }
  } else { P.moving = false; P.animT = 0; }
  P.frame = P.moving ? Math.floor(P.animT) % 4 : 0;
  if (P.poseT > 0) { P.poseT -= dt; if (P.poseT <= 0) P.pose = 'idle'; }
  // seguidores (missões de acompanhar paciente)
  let prev = P;
  for (const f of G.followers) {
    const d = Math.hypot(prev.x - f.x, prev.y - f.y);
    if (d > 0.9) { const sp = Math.min(d - 0.8, spd * dt); const ux = (prev.x - f.x) / d, uy = (prev.y - f.y) / d; if (!moveEnt(f, ux * sp, uy * sp, M)) { f.x += ux * sp; f.y += uy * sp; } f.moving = true; f.animT += dt * 8; f.dir = Math.abs(ux) > Math.abs(uy) ? (ux < 0 ? 2 : 3) : (uy < 0 ? 1 : 0); } else f.moving = false;
    f.frame = f.moving ? Math.floor(f.animT) % 4 : 0; prev = f;
  }
  // NPCs
  for (const n of G.npcs) updateNPC(n, dt, M);
  // portas e passagens
  G.warpCd = Math.max(0, (G.warpCd || 0) - dt);
  if (G.warpCd <= 0) for (const w of M.warps) {
    const i = Math.floor(P.x), j = Math.floor(P.y - 0.1);
    if (i >= w.x && i < w.x + w.w && j >= w.y && j < w.y + w.h) { tryWarp(w); break; }
  }
  // câmera
  const tx = P.x * TS - VW / 2, ty = P.y * TS - 20 - VH / 2;
  const mw = M.w * TS, mh = M.h * TS;
  G.camera.x += (U.clamp(tx, 0, Math.max(0, mw - VW)) - G.camera.x) * Math.min(1, dt * 10);
  G.camera.y += (U.clamp(ty, 0, Math.max(0, mh - VH)) - G.camera.y) * Math.min(1, dt * 10);
  if (mw < VW) G.camera.x = -(VW - mw) / 2; if (mh < VH) G.camera.y = -(VH - mh) / 2;
  // energia regenera lentamente
  S.energia = Math.min(st.energiaMax, S.energia + dt * BAL.energyRegen * (1 + (fx('energyRegenMult') || 0)));
  // missões secundárias: prazo
  for (const q of S.side.slice()) {
    q.t -= dt;
    if (q.t <= 0) failSide(q);
  }
  // escolta: chegou ao destino?
  for (const q of S.side) { const stp = q.steps[q.i]; if (stp && stp.k === 'escort' && stp.map === M.id) { const f = G.followers.find(x => x.qid === q.id); if (f && Math.hypot(f.x - stp.x, f.y - stp.y) < 2.2) { G.followers = G.followers.filter(x => x !== f); toast('Paciente entregue no destino!', 'good'); advanceSide(q); } } }
  // reposição de pacientes
  if (Math.floor(G.t) % 5 === 0 && G.t % 5 < dt) { const a = mapArea(M.id); if (a) refillSpots(a); }
  // missões espontâneas e eventos
  const ctx = M.id !== 'rua' && M.id !== 'bar';
  G.sideTimer -= dt; G.eventTimer -= dt; checkSideHave(); updatePsySpawn(dt);
  if (G.sideTimer <= 0) { G.sideTimer = U.rnd(...BAL.sideInterval); if (ctx && S.side.length < BAL.maxSideActive) spawnSideQuest(); }
  if (G.eventTimer <= 0) { G.eventTimer = U.rnd(...BAL.eventInterval); if (ctx) triggerRandomEvent(); }
  // estoque raro do Rodolfo gira com o tempo
  if (S.playTime >= S.shop.next) { const raros = Object.values(ITEMS).filter(i => i.raroLoja); S.shop.rare = U.pick(raros).id; S.shop.next = S.playTime + 480; }
  // autosave
  G.saveTimer -= dt; if (G.saveTimer <= 0) { G.saveTimer = 30; saveGame(); }
  updateInteractPrompt();
}

function updateNPC(n, dt, M) {
  const P = G.player;
  const near = Math.hypot(P.x - n.x, P.y - n.y) < 1.6;
  if (n.beh.t === 'static' || near || n.frozen) {
    n.moving = false;
    if (near) { const dx = P.x - n.x, dy = P.y - n.y; n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0); }
  } else {
    if (!n.target) {
      n.wait -= dt;
      if (n.wait <= 0) {
        const r = n.beh.r;
        for (let k = 0; k < 8; k++) { const i = r[0] + Math.floor(Math.random() * r[2]), j = r[1] + Math.floor(Math.random() * r[3]); if (walkable(M, i, j)) { n.target = [i + 0.5, j + 0.6]; n.stuck = 0; break; } }
        n.wait = U.rnd(1.5, 4.5);
      }
      n.moving = false;
    } else {
      const dx = n.target[0] - n.x, dy = n.target[1] - n.y, d = Math.hypot(dx, dy);
      if (d < 0.1) { n.target = null; n.moving = false; }
      else {
        const sp = (n.speed || 0.9) * 2.2 * dt;
        const ox = n.x, oy = n.y;
        moveEnt(n, Math.sign(dx) * Math.min(Math.abs(dx), sp), 0, M);
        moveEnt(n, 0, Math.sign(dy) * Math.min(Math.abs(dy), sp), M);
        if (Math.abs(n.x - ox) + Math.abs(n.y - oy) < sp * 0.2) { n.stuck += dt; if (n.stuck > 0.8) n.target = null; }
        n.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : (dy < 0 ? 1 : 0);
        n.moving = true; n.animT += dt * 7;
      }
    }
  }
  n.frame = n.moving ? Math.floor(n.animT) % 4 : 0;
  if (n.bubbleT > 0) n.bubbleT -= dt;
  if (!n.bubbleT && Math.random() < dt * 0.012 && n.role !== 'loja') { n.bubble = U.pick(['...', '☕', '!?', '♪', 'zzz', '📋']); n.bubbleT = 2.2; }
}

function lockedMsg(target) {
  const i = S.order.indexOf(target);
  toast(`<b>${AREAS[target].nome}: trancado.</b><br><small>Sua sequência: ${S.order.map((a, k) => (k + 1) + '. ' + AREAS[a].curto).join(' → ')}. Este é o estágio ${i + 1}.</small>`, 'bad');
  SFX.play('bad');
}
function tryWarp(w) {
  const target = w.to;
  if (AREAS[target] && !areaUnlocked(target)) {
    lockedMsg(target);
    const P = G.player; const back = DIRV[[1, 0, 3, 2][P.dir]]; P.x += back[0] * 0.6; P.y += back[1] * 0.6; G.warpCd = 1;
    return;
  }
  SFX.play('door');
  if (G.followers.length) { G.followers.forEach(f => f.map = target); }
  transition(() => { enterMap(target, w.tx, w.ty, w.dir); G.followers.forEach(f => { f.x = G.player.x; f.y = G.player.y + 0.6; }); });
}
function transition(fn) { G.fadeOut = 1; G.fadeFn = fn; }

/* ---------------- Interação ---------------- */
function frontPoint(d = 0.75) { const P = G.player, v = DIRV[P.dir]; return [P.x + v[0] * d, P.y - 0.15 + v[1] * d]; }
function findInteractable() {
  const P = G.player, M = G.map; const [fx2, fy2] = frontPoint(0.8);
  // outros internos online (no bar, para desafiar)
  const gp = typeof mpNearbyPeer === 'function' ? mpNearbyPeer() : null; if (gp) return { kind: 'peer', g: gp };
  // NPCs
  let best = null, bd = 9;
  for (const n of G.npcs) {
    const reach = n.reach || 1.25;
    const d = Math.hypot(n.x - fx2, n.y - fy2), d2 = Math.hypot(n.x - P.x, n.y - P.y);
    if ((d < 0.85 || d2 < reach * 0.8) && d2 < reach + 0.2 && d < bd) { bd = d; best = { kind: 'npc', n }; }
  }
  if (best) return best;
  // objetos à frente (até 1,5 tile)
  for (const dist of [0.75, 1.3]) {
    const [px, py] = frontPoint(dist); const i = Math.floor(px), j = Math.floor(py);
    const o = M.objs.find(o => i >= o.x && i < o.x + o.w && j >= o.y && j < o.y + o.h && !OBJ_DEFS[o.type].under) || sideProps(M.id).find(o => i === o.x && j === o.y);
    if (o && interactLabel(o)) return { kind: 'obj', o };
  }
  return null;
}
function interactLabel(o) {
  const tag = o.tag || OBJ_DEFS[o.type].tag;
  const sp = G.spots.find(s => s.obj === o);
  const q = sideTargetFor(o); if (q) return q.label;
  const fk = Object.keys(MAIN_FIND).find(k => S.flags['find_' + k] === o.id && isMainStepActive('find', k));
  if (fk) return 'Procurar: ' + MAIN_FIND[fk].nome;
  const ps = mainProcSpot(o); const mst = currentArea() && chainStep(currentArea());
  if (ps && mst && mst.tipo === 'proc' && mst.proc === ps) return 'Procedimento: ' + PROCS[ps].nome;
  const hs = hiddenSearchFor(o); if (hs) return hs.label;
  if (sp) { if (sp.obj.spot === 'proc') return 'Procedimentos simulados'; return sp.s.active ? 'Atender paciente' : 'Ver paciente'; }
  if (ps) return 'Procedimento: ' + PROCS[ps].nome;
  const labels = { cafe: 'Usar a cafeteira', garrafa: 'Garrafa térmica', impressora: 'Impressora', computador: 'Computador', estoque: 'Armário', cantina: 'Cantina', sofa: 'Descansar no sofá', usg: 'Aparelho de ultrassom', pia: 'Lavar as mãos', geladeira: 'Geladeira' };
  if (tag && labels[tag]) return labels[tag];
  if (OBJ_DEFS[o.type].busca) return 'Vasculhar';
  if (o.type === 'sinuca') return 'Jogar sinuca';
  return null;
}
function isMainStepActive(tipo, key) { const a = currentArea(); const st = a && chainStep(a); return !!(st && st.tipo === tipo && (tipo !== 'find' || st.obj === key)); }
function mainProcSpot(o) {
  const a = currentArea(); const st = a && chainStep(a);
  if ((G.map.id === 'go' || G.map.id === 'ubs') && o.type === 'mesa_gineco') return 'papanicolau';
  if (G.map.id === 'cir' && o.type === 'pia' && o.y < 12) return 'paramentacao';
  if (G.map.id === 'cir' && o.type === 'mesa_instrum') return st && st.tipo === 'proc' && ['checklist', 'instrumentacao'].includes(st.proc) ? st.proc : 'checklist';
  return null;
}
function updateInteractPrompt() {
  const el = document.getElementById('prompt'); if (!el) return;
  if (G.mode !== 'explore') { el.hidden = true; return; }
  const it = findInteractable();
  if (!it) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = it.kind === 'peer' ? `<kbd>E</kbd> ${it.g.st === 'livre' ? 'Desafiar ' + U.esc(it.g.nm) + ' para um duelo' : U.esc(it.g.nm) + (it.g.st === 'duelo' ? ' está em um duelo' : ' está ocupado(a)')}` : `<kbd>E</kbd> ${it.kind === 'npc' ? (it.n.psy ? '⚠ Atender ' + U.esc(it.n.nome) + ' (crise)' : it.n.emerg && G.psy ? '⚠ Atender emergência: ' + U.esc(G.psy.E.titulo) : 'Falar com ' + U.esc(it.n.nome)) : U.esc(interactLabel(it.o))}`;
}
function interact() {
  if (G.mode !== 'explore') return;
  const it = findInteractable(); if (!it) return;
  G.player.pose = 'interact'; G.player.poseT = 0.35;
  if (it.kind === 'peer') return mpChallenge(it.g);
  if (it.kind === 'npc') return talkTo(it.n);
  return useObject(it.o);
}

function useObject(o) {
  const tag = o.tag || OBJ_DEFS[o.type].tag;
  // missões secundárias têm prioridade
  const q = sideTargetFor(o); if (q) return q.run();
  // item escondido da campanha
  const fk = Object.keys(MAIN_FIND).find(k => S.flags['find_' + k] === o.id && isMainStepActive('find', k));
  if (fk) { const st = chainStep(currentArea()); if (st.item) invAdd(st.item); SFX.play('quest'); toast(`Você encontrou: <b>${MAIN_FIND[fk].nome}</b>`, 'quest'); onMainEvent('find', { obj: fk }); return; }
  const ps0 = mainProcSpot(o); const mst = currentArea() && chainStep(currentArea());
  if (ps0 && mst && mst.tipo === 'proc' && mst.proc === ps0) return startProcedure(ps0);
  const hs = hiddenSearchFor(o); if (hs) return hs.run();
  const sp = G.spots.find(s => s.obj === o);
  if (sp) {
    if (sp.obj.spot === 'proc') return openProcMenu();
    if (sp.s.active) { const c = CASES.find(x => x.id === sp.s.caseId); if (c) return startCase(c, sp); }
    return toast(U.pick(['Paciente descansando. Já foi atendido(a).', 'O paciente agradece a visita e volta a dormir.', 'Leito em higienização. Em breve um novo paciente chega.']));
  }
  const ps = mainProcSpot(o); if (ps) return startProcedure(ps);
  switch (tag) {
    case 'cafe': {
      if (S.coffeeUntil > S.playTime) return toast('A cafeteira está fazendo mais café... Espere um pouco.');
      const st = stats(); let en = 15 * (1 + (fx('coffeeEnergy') || 0)); S.energia = Math.min(st.energiaMax, S.energia + en); S.coffeeUntil = S.playTime + 45;
      SFX.play('coffee'); return toast(`Café passado na hora. +${Math.round(en)} Energia.`);
    }
    case 'garrafa':
      if (hasSkill('int7')) { if (S.coffeeUntil > S.playTime) return toast('A garrafa ainda está vazia.'); S.coffeeUntil = S.playTime + 60; invAdd('cafe_duvidoso'); SFX.play('coffee'); return toast('Você encontrou um <b>café de procedência duvidosa</b>. Coragem.'); }
      return toast(U.pick(['A garrafa está vazia. Alguém SEMPRE deixa vazia.', 'Sobrou um dedo de café frio com borra. Não, obrigado.']));
    case 'impressora': SFX.play('printer'); return toast(U.pick(['A impressora pisca uma luz laranja misteriosa.', '"Papel atolado na bandeja 2." Não existe bandeja 2.', 'Ela imprimiu uma página em branco. Missão cumprida?']));
    case 'computador': return toast(U.pick(['O sistema está... carregando... ainda... carregando.', 'Você checou os exames do dia. Tudo atualizado.', 'Alguém deixou o login aberto. Você fecha por segurança.']));
    case 'cantina': return openCantina();
    case 'sofa': return rest();
    case 'pia': SFX.play('ui'); return toast('Você lavou as mãos com técnica correta. Os germes tremem.');
    case 'geladeira': if (o.vacina) return toast('Câmara de vacinas entre 2 °C e 8 °C. A técnica confere e anota a temperatura todo dia: rede de frio também é cuidado.'); return toast('Refrigerantes, água e uma marmita com o nome "NÃO MEXA — R3".');
    case 'usg': return toast('O ultrassom do setor. Está com o gel pela metade e o cabo enrolado.');
  }
  if (o.type === 'sinuca') return toast('Você encaçapou a bola 8 sem querer. O cliente do lado aplaude.');
  if (OBJ_DEFS[o.type].busca) {
    const key = 'busca_' + o.id; if ((S.flags[key] || 0) > S.playTime) return toast('Você já vasculhou aqui há pouco.');
    S.flags[key] = S.playTime + 240;
    if (Math.random() < 0.3) { const id = U.pick(['clipe', 'luva_sem_par', 'tampa_caneta', 'caneta_boa', 'adesivo_liga', 'clipe']); if (invAdd(id)) { SFX.play('coin'); return toast(`Você achou: <b>${ITEMS[id].nome}</b>`); } }
    return toast(U.pick(['Só tem gaze, esparadrapo e um formulário de 2015.', 'Nada útil. Mas está bem organizado.', 'Uma caneta! ...que não funciona.']));
  }
}

function rest() {
  if (S.restUntil > S.playTime) return toast(`Você ainda não está com sono. Descanse de novo em ${Math.ceil(S.restUntil - S.playTime)}s.`);
  const st = stats(); const mult = hasSkill('int6') ? 1.5 : 1;
  const v = Math.round(st.vidaMax * 0.4 * mult), e = Math.round(st.energiaMax * 0.5 * mult);
  S.vida = Math.min(st.vidaMax, S.vida + v); S.energia = Math.min(st.energiaMax, S.energia + e);
  S.restUntil = S.playTime + (hasSkill('int6') ? 60 : 120);
  G.fade = 1; SFX.play('ok');
  toast(`Cochilo estratégico de 15 minutos. +${v} Vida, +${e} Energia.` + (hasSkill('int6') ? ' (Dormir no Conforto)' : ''));
}

/* ---------------- Diálogo com NPCs ---------------- */
function talkTo(n) {
  const nome = S.player.name;
  if (n.psy || n.emerg) return startPsyCrisis(n);
  // missões secundárias
  const q = sideTargetForNpc(n); if (q) return q.run();
  // etapa principal
  const a = currentArea(); const st = a && chainStep(a);
  if (st && st.tipo === 'talk' && st.alvo === n.id) {
    const d = STEP_DIALOGS[st.id]; startDialog(n.id, d ? d.falas : ['...'], () => onMainEvent('talk', { npc: n.id })); return;
  }
  if (st && st.tipo === 'challenge' && st.alvo === n.id) { startDialog(n.id, ['Pronto(a) para o desafio do capítulo?'], null, [{ t: 'Começar o desafio', f: () => startChallenge(st.ch, st.area) }, { t: 'Ainda não', f: () => { } }]); return; }
  if (st && st.tipo === 'boss' && st.alvo === n.id) { const b = BOSSES[n.id]; startDialog(n.id, b.intro, null, [{ t: 'Enfrentar ' + b.nome, f: () => startBoss(n.id) }, { t: 'Preciso me preparar', f: () => { } }]); return; }
  if (n.role === 'duvida') return startDuvida(n);
  if (n.role === 'loja') return openShop();
  if (n.role === 'cantina') return openCantina();
  if (n.role === 'preceptor') {
    const area = n.area;
    if (S.completed[area]) return startDialog(n.id, [U.pick(['Você de novo? Bom ver. Continue estudando.', 'Revisitar é aprender duas vezes.', 'Ainda lembro do seu desempenho na prova. Hmm.'])]);
    if (!areaUnlocked(area)) return startDialog(n.id, ['Ainda não é seu estágio aqui. Volte quando for a sua vez.']);
    const extra = (S.skills.int20 && Math.random() < 0.4) ? [FALAS_RES.lenda[0]] : [];
    let lines = [U.pick(FALAS_PRECEPTOR[n.id] || ['...'])].concat(extra);
    if (st) lines.push(`(Missão atual: ${st.titulo})`);
    return startDialog(n.id, lines);
  }
  if (n.role === 'residente') {
    let lines;
    const r = S.rep;
    if (n.busy && Math.random() < 0.6) lines = [U.pick(FALAS_RES.ocupado)];
    else if (S.skills.int20 && Math.random() < 0.35) lines = [U.pick(FALAS_RES.lenda)];
    else if (r >= 400 && Math.random() < 0.5) lines = [U.pick(FALAS_RES.repAlta)];
    else if (r <= -250 && Math.random() < 0.6) lines = [U.pick(FALAS_RES.repBaixa)];
    else lines = [U.pick(Math.random() < 0.5 && FALAS_AREA[n.area] ? FALAS_AREA[n.area] : FALAS_RES.normal)];
    if (hasSkill('int11') && S.side.length) { const qq = S.side[0]; lines.push(`Dica: "${qq.titulo}" — ${qq.steps[qq.i] ? qq.steps[qq.i].dica || qq.desc : qq.desc}`); }
    n.busy = Math.random() < 0.3;
    return startDialog(n.id, lines);
  }
  const fl = n.fala || ['Bom plantão!']; n._fi = ((n._fi ?? -1) + 1) % fl.length; startDialog(n.id, [fl[n._fi]]);
}

/* =====================================================================
   MISSÕES SECUNDÁRIAS ESPONTÂNEAS
   ===================================================================== */
function sideBonusTime(q) {
  let t = 0;
  if (q.cafe && hasSkill('int1')) t += 30;
  if (q.doc && hasSkill('int3')) t += 30;
  if (hasSkill('int11')) t += 20;
  return t;
}
function requesterIn(mapId) {
  const cands = G.npcs.filter(n => ['residente', 'preceptor', 'equipe'].includes(n.role) && n.map === mapId);
  return cands.length ? U.pick(cands) : null;
}
function objsByTag(mapId, tag) { const M = MAPS[mapId]; return M ? M.objs.filter(o => (o.tag || OBJ_DEFS[o.type].tag) === tag) : []; }
function randomSearchObj(mapId, exclude = []) { const r = pickHideSpots([mapId], 1, exclude)[0]; return r ? r.o : null; }

/* ---------------- Objetos físicos de missão (ex.: carrinho de ultrassom) ---------------- */
function sideProps(mapId) {
  const out = []; if (!S || !S.side) return out;
  for (const q of S.side) { const st = q.steps[q.i]; if (st && st.prop && st.map === mapId) out.push(st.prop); }
  return out;
}
// escolhe um piso livre e alcançável, encostado numa parede ou móvel, sem fechar passagens
function placeProp(mapId) {
  const M = MAPS[mapId]; if (!M) return null; if (!M.solid) renderMapStatic(M);
  const busy = new Set(); for (const o of M.objs) for (let j = o.y; j < o.y + o.h; j++) for (let i = o.x; i < o.x + o.w; i++) busy.add(i + ',' + j);
  for (const w of M.warps) for (let j = w.y - 1; j <= w.y + w.h; j++) for (let i = w.x - 1; i <= w.x + w.w; i++) busy.add(i + ',' + j);
  for (const n of NPCS_DEF) if (n.map === mapId) busy.add(Math.floor(n.x) + ',' + Math.floor(n.y));
  for (const q of S.side) for (const st of q.steps) if (st.prop && st.map === mapId) busy.add(st.prop.x + ',' + st.prop.y);
  const floor = (i, j) => ['.', ',', ':'].includes(M.t(i, j)) && walkable(M, i, j) && !busy.has(i + ',' + j);
  const groups = {};
  for (let j = 1; j < M.h - 1; j++) for (let i = 1; i < M.w - 1; i++) {
    if (!floor(i, j) || !tileReachable(M, i, j)) continue;
    if (walkable(M, i, j - 1)) continue;                                   // encostado em algo acima
    if ([[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1]].some(([a, b]) => M.t(i + a, j + b) === 'D')) continue; // longe de portas
    if (![[-1, 0], [1, 0], [-1, 1], [0, 1], [1, 1]].every(([a, b]) => floor(i + a, j + b))) continue; // não fecha corredor
    const room = roomOf(mapId, i, j); (groups[room] = groups[room] || []).push([i, j]);
  }
  const recent = S.flags.propRecent || [];
  let rooms = U.shuffle(Object.keys(groups)); rooms.sort((a, b) => (recent.includes(mapId + a) ? 1 : 0) - (recent.includes(mapId + b) ? 1 : 0));
  if (!rooms.length) return null;
  S.flags.propRecent = recent.concat(mapId + rooms[0]).slice(-5);
  return U.pick(groups[rooms[0]]);
}
// etapa "ter o item": avança assim que o item está no inventário (ex.: salgado comprado na cantina)
function checkSideHave() {
  if (!S || !S.side) return;
  for (const q of S.side.slice()) { const st = q.steps[q.i]; if (st && st.k === 'have' && invCount(st.item) > 0) { toast(`Você tem <b>${ITEMS[st.item].nome}</b>. Agora leve para ${U.esc(q.req.nome)}.`); advanceSide(q); } }
}

/* ---------------- Esconderijos espalhados ----------------
   Os itens perdidos podem estar em vários tipos de móvel. O sorteio escolhe primeiro uma SALA
   (evitando as salas usadas recentemente) e só depois um móvel dela, então os itens se espalham pelo mapa. */
const HIDE_TYPES = new Set(['armario', 'carrinho_emerg', 'ultrassom', 'mesa_instrum', 'brinquedos', 'armario_vest', 'estante', 'mesa_cabeceira',
  'lixeira', 'mesa', 'mesa_simples', 'balcao', 'sofa', 'poltrona', 'micro', 'geladeira', 'mesa_redonda', 'anestesia', 'aspirador']);
function hideCandidates(mid) {
  const M = MAPS[mid]; if (!M) return []; if (!M.solid) renderMapStatic(M);
  return M.objs.filter(o => HIDE_TYPES.has(o.type) && o.solid && !o.spot && objReachable(M, o));
}
function isHideable(o) { return HIDE_TYPES.has(o.type) && o.solid && !o.spot && objReachable(G.map, o); }
function pickHideSpots(maps, n = 1, exclude = []) {
  const busy = new Set(exclude);
  for (const q of S.side) for (const s of q.steps) if (s.k === 'obj') busy.add(s.obj);
  const groups = {};
  for (const mid of maps) for (const o of hideCandidates(mid)) {
    if (busy.has(o.id)) continue;
    const room = roomOf(mid, o.x, o.y), key = mid + '|' + room;
    (groups[key] = groups[key] || { mid, room, objs: [] }).objs.push(o);
  }
  const recent = S.flags.hideRecent || [];
  let keys = U.shuffle(Object.keys(groups));
  keys.sort((a, b) => (recent.includes(a) ? 1 : 0) - (recent.includes(b) ? 1 : 0)); // salas recentes vão para o fim da fila
  const out = [];
  for (const k of keys.slice(0, n)) { const g = groups[k]; out.push({ mid: g.mid, room: g.room, o: U.pick(g.objs) }); }
  S.flags.hideRecent = recent.concat(out.map(r => r.mid + '|' + r.room)).slice(-6);
  return out;
}
// item escondido de missão: qualquer móvel "vasculhável" do mapa pode ser o certo
function hiddenSearchFor(o) {
  if (!isHideable(o)) return null;
  for (const q of S.side) {
    const st = q.steps[q.i]; if (!st || st.k !== 'obj' || !st.hidden || st.map !== G.map.id || st.obj === o.id) continue;
    if ((q.miss || []).includes(o.id)) return { q, label: 'Já vasculhado', run: () => toast('Você já procurou aqui. Tente outro móvel.') };
    return { q, label: 'Vasculhar (missão)', run: () => missHidden(q, st, o) };
  }
  return null;
}
function missHidden(q, st, o) {
  q.miss = q.miss || []; q.miss.push(o.id); SFX.play('ui');
  const alvo = MAPS[st.map].objs.find(x => x.id === st.obj);
  const room = alvo ? roomOf(st.map, alvo.x, alvo.y) : null, aqui = roomOf(G.map.id, o.x, o.y);
  const nada = U.pick(['Nada aqui além de gaze e um formulário de 2015.', 'Não está aqui.', 'Só achou uma caneta sem tampa.', 'Vazio. Alguém já "pegou emprestado" tudo daqui.']);
  if (room && room === aqui) return toast(nada + ' <b>Está quente!</b> Deve estar nesta sala.');
  if (q.miss.length >= 3 && room) { st.dica = 'Alguém viu por último em: ' + room; return toast(nada + `<br><small>Um técnico passa e comenta: "Acho que vi isso em <b>${U.esc(room)}</b>."</small>`); }
  toast(nada);
}
function roomOf(mapId, x, y) { const M = MAPS[mapId]; const r = M.labels.filter(l => l.rw && x >= l.rx && x < l.rx + l.rw && y >= l.ry && y < l.ry + l.rh); r.sort((a, b) => a.rw * a.rh - b.rw * b.rh); return r[0] ? r[0].nome : M.nome; }

const SIDE_TPL = [
  { id: 'cafe', w: 5, make(rq, mid) {
    const n = Math.random() < 0.35 ? U.ri(2, 3) : 1; const acucar = Math.random() < 0.5;
    const c = objsByTag(mid, 'cafe')[0] || objsByTag('lobby', 'cafe')[0]; const cmap = objsByTag(mid, 'cafe').length ? mid : 'lobby';
    return { titulo: n > 1 ? `${n} cafés para a equipe` : `Café ${acucar ? 'COM' : 'SEM'} açúcar`, desc: `${rq.nome} pediu ${n > 1 ? n + ' cafés' : 'um café ' + (acucar ? 'com' : 'sem') + ' açúcar'}. Vá até a cafeteira (${roomOf(cmap, c.x, c.y)}) e leve para ${rq.nome}.`, prazo: 110, cafe: true,
      steps: [{ k: 'obj', map: cmap, obj: c.id, mini: 'cafe', n, acucar, give: 'q_cafe', dica: 'A cafeteira fica em ' + roomOf(cmap, c.x, c.y) }, { k: 'npc', npc: rq.id, map: rq.map, take: 'q_cafe', dica: 'Entregue para ' + rq.nome }],
      rec: { xp: 25 + n * 8, coins: 8 + n * 4, rep: 2 } };
  } },
  { id: 'familia', w: 3, make(rq, mid) {
    const M = MAPS[mid]; const [i, j] = findFree(M, U.ri(3, M.w - 4), U.ri(3, M.h - 4));
    const fam = { id: 'fam_' + S.sideId, nome: U.pick(['Dona Ivone (filha do paciente)', 'Seu Jair (pai da paciente)', 'Neide (esposa do paciente)']), look: randomCivilLook(S.sideId * 31 + 7), map: mid, x: i + 0.5, y: j + 0.6, beh: { t: 'static' }, role: 'familia' };
    return { titulo: 'Conversar com a família', desc: `${rq.nome} pediu que você acolha ${fam.nome}, que está aflito(a) por notícias (${roomOf(mid, i, j)}).`, prazo: 120, social: true, tempNpcs: [fam],
      steps: [{ k: 'npc', npc: fam.id, map: mid, mini: 'familia', dica: fam.nome + ' está em ' + roomOf(mid, i, j) }], rec: { xp: 35, coins: 10, rep: 3 } };
  } },
  { id: 'papeis', w: 3, make(rq, mid) {
    const dests = objsByTag(mid, 'computador').filter(o => roomOf(mid, o.x, o.y) !== roomOf(rq.map, rq.x, rq.y));
    const d1 = U.pick(dests.length ? dests : objsByTag('lobby', 'computador')); const dmap = dests.length ? mid : 'lobby';
    return { titulo: 'Entregar papéis', desc: `${rq.nome} entregou uma pilha de solicitações para levar até ${roomOf(dmap, d1.x, d1.y)}.`, prazo: 100, doc: true, carry: true, giveNow: 'q_papeis',
      steps: [{ k: 'obj', map: dmap, obj: d1.id, take: 'q_papeis', dica: 'Destino: ' + roomOf(dmap, d1.x, d1.y) }], rec: { xp: 25, coins: 10, rep: 2 } };
  } },
  { id: 'folhas', w: 3, make(rq, mid) {
    const reach = m => objsByTag(m, 'estoque').filter(o => { if (!MAPS[m].solid) renderMapStatic(MAPS[m]); return objReachable(MAPS[m], o); });
    let est = reach(mid), emap = mid; if (!est.length) { est = reach('lobby'); emap = 'lobby'; } if (!est.length) return null;
    const rooms = U.shuffle([...new Set(est.map(o => roomOf(emap, o.x, o.y)))]); const e = U.pick(est.filter(o => roomOf(emap, o.x, o.y) === rooms[0]));
    return { titulo: 'Papel para a impressora', desc: `A impressora ficou sem papel. ${rq.nome} pediu uma resma: procure no armário (${roomOf(emap, e.x, e.y)}).`, prazo: 100, doc: true,
      steps: [{ k: 'obj', map: emap, obj: e.id, give: 'q_resma', dica: 'Armário em ' + roomOf(emap, e.x, e.y) }, { k: 'npc', npc: rq.id, map: rq.map, take: 'q_resma' }], rec: { xp: 25, coins: 10, rep: 2 } };
  } },
  { id: 'salgado', w: 2, make(rq) {
    const id = U.pick(CANTINA_SALGADOS), it = ITEMS[id], c = objsByTag('lobby', 'cantina')[0]; if (!c || !it) return null;
    const nome = it.nome.replace(' da Cantina', '');
    return { titulo: `Buscar ${nome.toLowerCase()}`, desc: `${rq.nome} está há 14 horas sem comer e pediu ${{ coxinha: 'uma', pao_queijo: 'um', empada: 'uma', enroladinho: 'um' }[id] || 'um'} ${nome.toLowerCase()} da cantina da Dona Cida, no saguão. Compre e leve (custa ${it.preco} ${MOEDA_CURTA}; reembolsado na entrega).`, prazo: 150,
      steps: [{ k: 'have', item: id, map: 'lobby', obj: c.id, dica: `Compre ${nome} na cantina da Dona Cida (saguão)` }, { k: 'npc', npc: rq.id, map: rq.map, take: id, dica: `Entregue ${nome} para ${rq.nome}` }], rec: { xp: 25, coins: 10 + it.preco, rep: 2 } };
  } },
  { id: 'ultrassom', w: 2, make(rq, mid) {
    const m2 = Math.random() < 0.7 ? mid : 'lobby'; const pos = placeProp(m2); if (!pos) return null;
    const pid = 'prop_usg_' + S.sideId;
    return { titulo: 'Cadê o ultrassom?', desc: `O aparelho de ultrassom portátil sumiu de novo. ${rq.nome} precisa dele. Alguém viu o carrinho estacionado em algum canto de: ${MAPS[m2].nome}.`, prazo: 160, busca: true,
      steps: [{ k: 'obj', map: m2, obj: pid, give: 'q_usg', seek: true, prop: { type: 'ultrassom', id: pid, x: pos[0], y: pos[1], w: 1, h: 1, solid: true }, dica: 'Procure o carrinho do ultrassom pelas salas de ' + MAPS[m2].nome }, { k: 'npc', npc: rq.id, map: rq.map, take: 'q_usg', dica: 'Leve o ultrassom para ' + rq.nome }], rec: { xp: 35, coins: 14, rep: 3 } };
  } },
  { id: 'impressora', w: 3, make(rq, mid) {
    const p = objsByTag(mid, 'impressora')[0]; if (!p) return null;
    return { titulo: 'A impressora travou', desc: `${rq.nome} precisa imprimir uma prescrição e a impressora (${roomOf(mid, p.x, p.y)}) travou. Faça ela funcionar.`, prazo: 90, doc: true,
      steps: [{ k: 'obj', map: mid, obj: p.id, mini: 'impressora', dica: 'Impressora em ' + roomOf(mid, p.x, p.y) }], rec: { xp: 25, coins: 10, rep: 2 } };
  } },
  { id: 'escolta', w: 2, make(rq, mid) {
    const M = MAPS[mid]; const dest = M.objs.find(o => o.spot === 'proc') || M.objs.find(o => (OBJ_DEFS[o.type].tag) === 'usg'); if (!dest) return null;
    const [i, j] = findFree(M, Math.floor(rq.x), Math.floor(rq.y) + 1);
    if (!M.solid) renderMapStatic(M);
    let dp = null; for (const [a2, b2] of [[0, dest.h], [-1, dest.h - 1], [dest.w, dest.h - 1], [0, -1], [-1, 0], [dest.w, 0]]) { const ti = dest.x + a2, tj = dest.y + b2; if (walkable(M, ti, tj) && tileReachable(M, ti, tj)) { dp = [ti, tj]; break; } } if (!dp) return null;
    const pac = { id: 'pac_' + S.sideId, nome: U.pick(['Seu Raimundo', 'Dona Cleusa', 'Marcinho']), look: Object.assign(randomCivilLook(S.sideId * 13 + 3), { gown: '#a8d0f0' }), map: mid, x: i + 0.5, y: j + 0.6, beh: { t: 'static' }, role: 'escolta' };
    return { titulo: 'Levar paciente', desc: `${rq.nome} pediu que você acompanhe ${pac.nome} até ${roomOf(mid, dest.x, dest.y)}.`, prazo: 130, social: true, tempNpcs: [pac],
      steps: [{ k: 'npc', npc: pac.id, map: mid, escortStart: true, dica: pac.nome + ' está perto de ' + rq.nome }, { k: 'escort', map: mid, x: dp[0] + 0.5, y: dp[1] + 0.6, dica: 'Destino: ' + roomOf(mid, dest.x, dest.y) }], rec: { xp: 30, coins: 12, rep: 3 } };
  } },
  { id: 'prontuario', w: 2, make(rq, mid) {
    const h = pickHideSpots([mid])[0]; if (!h) return null; const o = h.o;
    return { titulo: 'Encontrar um prontuário', desc: `${rq.nome} não acha o prontuário do leito 7. Pode estar em qualquer armário, gaveta, mesa, carrinho ou até embaixo do sofá deste setor.`, prazo: 140, busca: true, doc: true,
      steps: [{ k: 'obj', map: mid, obj: o.id, give: 'q_prontuario', hidden: true, dica: 'Vasculhe armários, gavetas, mesas, sofás e lixeiras de ' + MAPS[mid].nome }, { k: 'npc', npc: rq.id, map: rq.map, take: 'q_prontuario' }], rec: { xp: 30, coins: 12, rep: 2 } };
  } },
  { id: 'admin', w: 3, make(rq, mid) {
    const pc = U.pick(objsByTag(mid, 'computador')); if (!pc) return null;
    return { titulo: 'Problema administrativo', desc: `${rq.nome} precisa de um encaminhamento preenchido no sistema (${roomOf(mid, pc.x, pc.y)}). Preencha certo.`, prazo: 110, doc: true,
      steps: [{ k: 'obj', map: mid, obj: pc.id, mini: 'admin', dica: 'Computador em ' + roomOf(mid, pc.x, pc.y) }], rec: { xp: 30, coins: 12, rep: 2 } };
  } },
  { id: 'localizar', w: 2, make(rq, mid) {
    const res = G.npcs.filter(n => n.role === 'residente' && n.id !== rq.id); if (!res.length) return null; const alvo = U.pick(res);
    const lugares = [['lobby', 6, 22, 'na cantina'], ['bar', 6, 8, 'no bar do Rodolfo'], ['lobby', 33, 22, 'na copa do saguão'], ['rua', 36, 21, 'na praça em frente ao hospital']];
    const L = U.pick(lugares);
    return { titulo: `Onde está ${alvo.nome}?`, desc: `${alvo.nome} sumiu do setor "só pra pegar um café". ${rq.nome} precisa dele(a). Dizem que foi visto(a) ${L[3]}.`, prazo: 160,
      extra: { npc: alvo.id, map: L[0], x: L[1] + 0.5, y: L[2] + 0.6, home: mid },
      steps: [{ k: 'npc', npc: alvo.id, map: L[0], dica: 'Procure ' + L[3] }], rec: { xp: 30, coins: 12, rep: 2 } };
  } },
  { id: 'organizar', w: 2, make(rq, mid) {
    const objs = pickHideSpots([mid], 3).map(h => h.o); if (objs.length < 3) return null;
    return { titulo: 'Organizar a sala', desc: `${rq.nome} pediu para organizar 3 pontos do setor (armários/carrinhos marcados) antes da visita.`, prazo: 150,
      steps: objs.map(o => ({ k: 'obj', map: mid, obj: o.id, dica: 'Organize: ' + roomOf(mid, o.x, o.y) })), rec: { xp: 30, coins: 12, rep: 2 } };
  } },
  { id: 'absurda', w: 3, make(rq, mid) {
    const tipo = U.pick(['carregador', 'cracha', 'caneta']);
    const h = pickHideSpots([U.pick([mid, mid, 'lobby'])])[0]; if (!h) return null; const o = h.o, omap = h.mid;
    const info = { carregador: ['O carregador sagrado', `${rq.nome} está com 2% de bateria e a regulação vai ligar. Ache o carregador tipo C que "alguém pegou emprestado".`, 'q_carregador'], cracha: ['O crachá do R1', `O R1 perdeu o crachá e não consegue entrar na sala de prescrição. ${rq.nome} pediu ajuda.`, 'q_cracha'], caneta: ['A caneta que funciona', `${rq.nome} precisa assinar 30 receitas e só existe UMA caneta que funciona no setor.`, 'caneta_boa'] }[tipo];
    return { titulo: info[0], desc: info[1], prazo: 130, busca: true,
      steps: [{ k: 'obj', map: omap, obj: o.id, give: info[2], hidden: true, dica: 'Vasculhe armários, gavetas, mesas, sofás e lixeiras de ' + MAPS[omap].nome }, { k: 'npc', npc: rq.id, map: rq.map, take: info[2] }], rec: { xp: 30, coins: 14, rep: 2 } };
  } },
];

function spawnSideQuest(forceTpl) {
  const mid = G.map.id; const rq = requesterIn(mid); if (!rq) return;
  for (let tries = 0; tries < 6; tries++) {
    const tpl = forceTpl ? SIDE_TPL.find(t => t.id === forceTpl) : U.weighted(SIDE_TPL);
    if (S.side.some(q => q.tpl === tpl.id)) continue;
    const def = tpl.make({ id: rq.id, nome: rq.nome, map: mid, x: rq.x, y: rq.y }, mid); if (!def) continue;
    const q = Object.assign({ id: S.sideId++, tpl: tpl.id, req: { npc: rq.id, nome: rq.nome, map: mid }, i: 0, criado: S.playTime }, def);
    q.prazo = Math.round((q.prazo + sideBonusTime(q)) * (hasSkill('int20') ? 1.4 : 1)); q.t = q.prazo;
    if (q.giveNow) invAdd(q.giveNow);
    S.side.push(q);
    for (const tn of (q.tempNpcs || [])) if (tn.map === mid) G.npcs.push(makeEnt(Object.assign({}, tn, { wait: 1, target: null })));
    if (q.tpl === 'localizar') { G.npcs = G.npcs.filter(n => !(n.id === q.extra.npc && q.extra.map !== mid)); if (q.extra.map === mid) { const base = NPCS_DEF.find(x => x.id === q.extra.npc); G.npcs.push(makeEnt(Object.assign({}, base, { x: q.extra.x, y: q.extra.y, beh: { t: 'static' } }))); } }
    rq.bubble = '!'; rq.bubbleT = 4;
    SFX.play('quest');
    toast(`<b>${U.esc(rq.nome)}:</b> "${U.esc(sideCallout(q))}"<br><small>Nova missão: ${U.esc(q.titulo)} — prazo ${U.fmtTime(q.prazo)}</small>`, 'side');
    if (!S.tips.side) { S.tips.side = 1; setTimeout(() => toast('Missões secundárias aparecem sozinhas. Você pode ignorá-las, mas expirar custa reputação. Recusar nos primeiros 20s (diário, J) é grátis.'), 1800); }
    return q;
  }
}
function sideCallout(q) {
  return { cafe: 'Interno! Pelo amor de Deus, um café...', familia: 'Pode dar uma atenção pra família? Estou atolado(a).', papeis: 'Leva esses papéis pra mim? Urgente!', folhas: 'Acabou o papel da impressora. DE NOVO.', salgado: 'Tô desde ontem sem comer... traz um salgado?', ultrassom: 'Alguém viu o ultrassom?!', impressora: 'A impressora travou com a minha prescrição!', escolta: 'Leva o paciente pra mim?', prontuario: 'Cadê o prontuário do leito 7?!', admin: 'Me ajuda com esse encaminhamento no sistema?', localizar: 'Alguém viu o meu R1? Ele foi "só pegar um café".', organizar: 'A visita vai começar e isso aqui tá um caos!', absurda: 'Interno, missão de vida ou morte!' }[q.tpl] || 'Interno, uma ajudinha?';
}
function sideTargetFor(o) {
  for (const q of S.side) { const st = q.steps[q.i]; if (st && st.k === 'obj' && st.obj === o.id && st.map === G.map.id) return { q, label: st.hidden ? 'Vasculhar (missão)' : st.prop ? 'Pegar o ultrassom (missão)' : (st.mini === 'cafe' ? 'Preparar café (missão)' : st.mini === 'impressora' ? 'Consertar impressora' : st.mini === 'admin' ? 'Preencher no sistema' : st.mini === 'salgado' ? 'Comprar o salgado' : st.take ? 'Entregar (missão)' : 'Organizar (missão)'), run: () => runSideObj(q, st) }; }
  if (hasSkill('int16')) { const tag = o.tag || OBJ_DEFS[o.type].tag; if (tag === 'computador') for (const q of S.side) { const st = q.steps[q.i]; if (q.doc && st && st.take === 'q_papeis') return { q, label: 'Entregar documentos pelo sistema', run: () => runSideObj(q, st) }; } }
  return null;
}
function sideTargetForNpc(n) {
  for (const q of S.side) { const st = q.steps[q.i]; if (st && st.k === 'npc' && st.npc === n.id) return { q, run: () => runSideNpc(q, st, n) }; }
  return null;
}
function runSideObj(q, st) {
  if (st.mini === 'cafe') return miniCafe(q, st, () => { invAdd(st.give); toast(`Café pronto! Leve para ${q.req.nome}.`); advanceSide(q); });
  if (st.mini === 'impressora') return miniImpressora(() => advanceSide(q));
  if (st.mini === 'admin') return miniAdmin(() => advanceSide(q), () => toast('Campo errado! O sistema recusou. Tente de novo.', 'bad'));
  if (st.mini === 'salgado') { if (S.coins < st.custo) return toast(`Você precisa de ${st.custo} ${MOEDA_CURTA} para pagar o salgado (será reembolsado).`, 'bad'); addCoins(-st.custo); invAdd(st.give); toast('Dona Cida embrulhou o salgado com carinho.'); return advanceSide(q); }
  if (st.take) { invRemove(st.take); toast('Entregue!'); return advanceSide(q); }
  if (st.give) { invAdd(st.give); SFX.play('quest'); toast(`Você encontrou: <b>${ITEMS[st.give].nome}</b>!`); return advanceSide(q); }
  SFX.play('ui'); toast('Organizado!'); advanceSide(q);
}
function runSideNpc(q, st, n) {
  if (st.mini === 'familia') return miniFamilia(q, n);
  if (st.escortStart) { const f = makeEnt(Object.assign({}, n, { qid: q.id, map: G.map.id })); G.npcs = G.npcs.filter(x => x !== n); G.followers.push(f); q.tempNpcs = []; startDialog(n.id, ['Vamos lá, doutor(a). Devagarzinho, tá?'], () => advanceSide(q), null, n); return; }
  if (q.tpl === 'localizar') { startDialog(n.id, [U.pick(['Ah... me acharam. Eu só ia pegar um café. Faz 40 minutos.', 'Shhh! Tava só respirando um pouco. Tá bom, tô voltando!'])], () => { advanceSide(q); }, null, n); return; }
  if (st.take) { invRemove(st.take); startDialog(n.id, [U.pick(['Você salvou meu plantão!', 'Valeu demais, interno!', 'Isso! Exatamente o que eu precisava.', 'Já pode pedir música no Fantástico.'])], () => advanceSide(q), null, n); return; }
  advanceSide(q);
}
function advanceSide(q) {
  q.i++;
  const st = q.steps[q.i];
  if (q.steps[q.i - 1] && q.steps[q.i - 1].give) q.carry = true;
  if (!st) return completeSide(q);
  SFX.play('ui');
}
function sideRewardMult(q) {
  let m = 1 + (fx('sideRewardMult') || 0) + FORM.bonusSocial(stats());
  if (q.social) m += (fx('socialMult') || 0) + (hasSkill('int13') && q.tpl === 'escolta' ? 0.2 : 0);
  if (q.cafe) { m += (fx('coffeeMult') || 0) + (hasSkill('int1') ? 0.1 : 0); }
  if (q.doc && hasSkill('int10')) m += 1;
  if (hasSkill('int17')) m += S.rep > 500 ? 0.4 : 0.25;
  if (hasSkill('int20')) m += 0.3;
  return m;
}
function completeSide(q) {
  S.side = S.side.filter(x => x !== q);
  const m = sideRewardMult(q);
  const xp = addXP(q.rec.xp * m * BAL.xpMult(S.rep)); const co = addCoins(q.rec.coins * m * BAL.coinMult(S.rep)); const rp = addRep(q.rec.rep, 'missão secundária');
  S.sideDone++; if (q.cafe) S.cafeDone += 1;
  let drop = '';
  if (Math.random() < BAL.dropChanceSide * BAL.dropMult(S.rep)) { const it = rollLoot(); if (it && invAdd(it)) drop = `<br>🎁 Recompensa rara: <b>${ITEMS[it].nome}</b>`; }
  if (Math.random() < 0.15) { const c = U.pick(['cafe', 'pao_queijo', 'barrinha_avulsa']); if (invAdd(c)) drop += `<br>Brinde: ${ITEMS[c].nome}`; }
  toast(`<b>Missão secundária concluída:</b> ${U.esc(q.titulo)}<br>+${xp} XP · +${co} ${MOEDA_CURTA} · +${rp} reputação${drop}`, 'quest');
  SFX.play('quest');
  cleanupSide(q);
  onMainEvent('side'); checkAch(); saveGame();
}
function failSide(q, silent) {
  S.side = S.side.filter(x => x !== q); S.sideFail++;
  const rp = addRep(-2, 'missão expirada');
  if (!silent) { toast(`<b>Missão expirada:</b> ${U.esc(q.titulo)}<br>${U.esc(q.req.nome)}: "${U.pick(['Deixa, eu mesmo resolvo...', 'Tudo bem... (não está tudo bem)', 'Anotado.'])}" · ${rp} reputação`, 'bad'); SFX.play('bad'); }
  cleanupSide(q);
}
function cleanupSide(q) {
  for (const k of ['q_cafe', 'q_resma', 'q_papeis', 'q_salgado', 'q_usg', 'q_prontuario', 'q_carregador', 'q_cracha']) if (q.steps.some(s => s.give === k || s.take === k) || q.giveNow === k) invRemove(k, 99);
  G.npcs = G.npcs.filter(n => !(q.tempNpcs || []).some(t => t.id === n.id));
  G.followers = G.followers.filter(f => f.qid !== q.id);
  if (q.tpl === 'localizar') { if (G.map.id !== q.extra.home) G.npcs = G.npcs.filter(n => n.id !== q.extra.npc); }
}
function declineSide(q) {
  const free = S.playTime - q.criado <= 20;
  const sumico = hasSkill('int15') && (S.sumico[currentArea() || 'x'] || 0) < 3;
  if (free) { S.side = S.side.filter(x => x !== q); cleanupSide(q); toast('Missão recusada sem penalidade.'); return; }
  if (sumico) { S.sumico[currentArea() || 'x'] = (S.sumico[currentArea() || 'x'] || 0) + 1; S.side = S.side.filter(x => x !== q); cleanupSide(q); toast('Sumiço Estratégico! Missão cancelada sem penalidade.'); return; }
  S.side = S.side.filter(x => x !== q); cleanupSide(q); addRep(-1, 'missão recusada'); toast('Missão recusada (-1 reputação).', 'bad');
}

function rollLoot(bias = 0) {
  const pool = Object.values(ITEMS).filter(i => EQUIP_SLOTS.includes(i.cat) && i.preco > 0 && !i.unico && i.id !== 'jaleco_padrao');
  const w = pool.map(i => ({ i, w: { comum: 10, incomum: 5, raro: 1.6 + bias, epico: 0.5 + bias / 2, lendario: 0 }[i.rar] }));
  const notOwned = w.filter(x => !ownsEquip(x.i.id)); const src = notOwned.length ? notOwned : w;
  return U.weighted(src).i.id;
}

/* =====================================================================
   EVENTOS ALEATÓRIOS
   ===================================================================== */
function triggerRandomEvent(forceId) {
  if (G.mode !== 'explore') return;
  const area = mapArea(G.map.id) || currentArea() || 'upa';
  const list = EVENTOS.filter(e => (!e.agitacao || area === 'upa') && (!e.rival || Object.values(RIVAIS).some(r => r.area === area)));
  const ev = forceId ? EVENTOS.find(e => e.id === forceId) : U.weighted(list.map(e => ({ e, w: e.rival ? 1.5 : e.agitacao ? 1.2 : 1 }))).e;
  if (ev.doc && hasSkill('int19')) { toast('Um evento de documentos ia acontecer... mas a <b>Impressora Sobrenatural</b> resolveu sozinha.'); return; }
  S.stats.eventos++;
  if (ev.achado) {
    if (Math.random() < 0.5) { const c = addCoins(U.ri(5, 20)); toast(`Você achou ${c} ${MOEDA_CURTA} perdidas debaixo de uma cadeira!`); }
    else { const id = U.pick(['caneta_boa', 'adesivo_liga', 'clipe', 'bala_gengibre', 'barrinha_avulsa']); invAdd(id); toast(`Você achou: <b>${ITEMS[id].nome}</b>`); }
    return;
  }
  if (ev.agitacao) return openEventModal(ev, () => startAgitation());
  if (ev.rival) { const r = Object.entries(RIVAIS).filter(([k, v]) => v.area === area); const [rid] = U.pick(r.length ? r : Object.entries(RIVAIS)); return openEventModal(ev, (k) => { if (k === 0) startRival(rid); else toast(ev.op[1].msg); }, RIVAIS[rid]); }
  openEventModal(ev, (k) => {
    const op = ev.op[k];
    if (op.rep) addRep(op.rep, 'evento'); if (op.xp) addXP(op.xp * BAL.xpMult(S.rep)); if (op.energia) { S.energia = Math.min(stats().energiaMax, S.energia + op.energia); }
    toast(op.msg + (op.rep ? ` (${op.rep > 0 ? '+' : ''}${op.rep} reputação)` : ''), op.rep < 0 ? 'bad' : '');
  });
}

/* ---------------- Partículas ---------------- */
function spawnParticles(kind, x, y) {
  const P = G.player; if (!P) return;
  x = x ?? P.x * TS; y = y ?? (P.y * TS - 40);
  const cols = kind === 'level' ? ['#ffd84a', '#ffffff', '#5fd4a0'] : kind === 'skill' ? ['#6fb6ff', '#ffffff', '#b46cff'] : ['#ffffff'];
  for (let k = 0; k < 24; k++) G.particles.push({ x, y, vx: U.rnd(-80, 80), vy: U.rnd(-140, -20), life: U.rnd(0.6, 1.2), c: U.pick(cols) });
}

/* =====================================================================
   EMERGÊNCIAS ESPORÁDICAS: surgem perto do jogador; 30 s para atender.
   Crise psicótica só na UPA; cada estágio tem as suas (CM e UBS não têm).
   ===================================================================== */
const EMERG_MAPS = ['upa', 'go', 'ped', 'cir'];
function psyLook(P, seed) {
  const L = randomCivilLook(seed, P.idade >= 60 ? 'idoso' : null);
  return Object.assign(L, { gown: '#a8d0f0', top: 'tshirt', topC: '#a8d0f0', dress: null, skirt: false, shoes: L.skin, eyes: 'wide', mouth: 'open', messy: true, glasses: null, facial: P.sexo === 'M' && seed % 2 ? 'barba' : null,
    fem: P.sexo === 'F', hair: P.sexo === 'F' ? (seed % 2 ? 'longo' : 'cacheado') : (seed % 2 ? 'cacheado' : 'medio'), build: 'normal', old: P.idade >= 60 });
}
function updatePsySpawn(dt) {
  if (G.psy) return;
  if (G.psyTimer === undefined) G.psyTimer = U.rnd(...BAL.psyInterval);
  if (!EMERG_MAPS.includes(G.map.id) || G.mode !== 'explore' || !S.stats || S.stats.cases < 1) return;
  G.psyTimer -= dt;
  if (G.psyTimer <= 0) { G.psyTimer = U.rnd(...BAL.psyInterval); spawnEmergencia(G.map.id); }
}
// piso livre entre 4 e 8 passos do jogador (busca em largura)
function spotNearPlayer() {
  const M = G.map, P = G.player; const si = Math.floor(P.x), sj = Math.floor(P.y);
  const dist = new Map([[si + ',' + sj, 0]]), q = [[si, sj]], cand = [];
  const occupied = (i, j) => G.npcs.some(n => Math.floor(n.x) === i && Math.floor(n.y) === j);
  while (q.length) { const [i, j] = q.shift(); const d = dist.get(i + ',' + j); if (d >= 4 && d <= 8 && !occupied(i, j) && M.t(i, j) !== 'D') cand.push([i, j]); if (d >= 8) continue;
    for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const k = (i + a) + ',' + (j + b); if (!dist.has(k) && walkable(M, i + a, j + b)) { dist.set(k, d + 1); q.push([i + a, j + b]); } } }
  return cand.length ? U.pick(cand) : null;
}
function spawnEmergencia(area, forceId) {
  const lista = EMERG[area] || [];
  if (forceId === 'psy' || (!forceId && area === 'upa' && Math.random() < 0.3) || (!lista.length && area === 'upa')) return spawnPsy();
  const E = forceId ? lista.find(e => e.id === forceId) : pickPrio(lista); if (!E) return false;
  const pos = spotNearPlayer(); if (!pos) return false;
  const [i, j] = pos; const seed = Math.floor(Math.random() * 9999);
  const ent = makeEnt({ id: 'emerg', nome: E.chamador.nome, look: emergLook(E, seed), x: i + 0.5, y: j + 0.6, home: [i + 0.5, j + 0.6], role: 'psy', emerg: true, speed: 1, reach: 1.8,
    beh: { t: 'static' }, wait: 9, target: null });
  G.npcs.push(ent);
  G.psy = { kind: 'emerg', ent, E, P: { nome: E.titulo }, t: BAL.psyTime, map: G.map.id, attending: false };
  SFX.play('alarm');
  toast(`<b>⚠ Emergência perto de você!</b><br>${U.esc(E.chamador.nome)}: "${U.esc(E.chamador.fala)}"<br><small>Vá até a pessoa e aperte <b>E</b> em até ${BAL.psyTime} segundos.</small>`, 'bad');
  return true;
}
function emergLook(E, seed) {
  const q = E.chamador.quem;
  if (q === 'enfermagem') return Object.assign({}, LOOKS[U.pick(['enf_ana', 'tec_jussara', 'enf_jose'])]);
  if (q === 'samu') return { skin: U.pick(SKIN_TONES), hair: U.pick(['curto', 'raspado', 'rabo']), hairC: '#1d1612', top: 'social', topC: '#e8742e', bottomC: '#e8742e', shoes: '#151015', build: 'normal' };
  if (q === 'residente') return Object.assign({}, LOOKS[U.pick(['res_bruno', 'res_lu', 'res_julia', 'res_marina', 'res_davi', 'res_paula'])]);
  const L = randomCivilLook(seed, E.chamador.tipo || null);
  if (E.chamador.sexo === 'F') { L.fem = true; if (['curto', 'raspado', 'careca'].includes(L.hair)) L.hair = 'longo'; }
  if (E.chamador.sexo === 'M') { L.fem = false; L.skirt = false; L.dress = null; L.preg = false; if (['longo', 'rabo', 'coque', 'bob', 'trancas'].includes(L.hair)) L.hair = 'curto'; }
  return L;
}
function spawnPsy() {
  const pos = spotNearPlayer(); if (!pos) return false;
  const M = G.map; const [i, j] = pos; const P0 = U.pick(PSY_CASOS); const seed = Math.floor(Math.random() * 9999);
  const ent = makeEnt({ id: 'psy', nome: P0.nome, look: psyLook(P0, seed), x: i + 0.5, y: j + 0.6, home: [i + 0.5, j + 0.6], role: 'psy', psy: true, speed: 1.25, reach: 1.8,
    beh: { t: 'wander', r: [Math.max(1, i - 2), Math.max(1, j - 1), 4, 3] }, wait: 0.3, target: null });
  G.npcs.push(ent);
  G.psy = { kind: 'psy', ent, P: P0, t: BAL.psyTime, map: M.id, attending: false };
  SFX.play('alarm');
  toast(`<b>⚠ Paciente em crise psicótica perto de você!</b><br>${U.esc(P0.nome)}, ${P0.idade} anos, está muito agitado(a). Vá até ele(a) e aperte <b>E</b> em até ${BAL.psyTime} segundos.`, 'bad');
  return true;
}
function updatePsyCountdown(dt) {
  if (!G.psy || G.psy.attending) return;
  G.psy.t -= dt;
  if (G.psy.t <= 0) failPsy();
}
function failPsy() {
  const ps = G.psy; if (!ps) return; G.psy = null;
  G.npcs = G.npcs.filter(n => n !== ps.ent);
  const old = S.rep; S.rep = U.clamp(S.rep - BAL.psyPenalty, BAL.repMin, BAL.repMax); S.repMin = Math.min(S.repMin, S.rep);
  S.stats.psyFail = (S.stats.psyFail || 0) + 1;
  SFX.play('bad'); G.shake = 0.3;
  if (ps.kind === 'emerg') { S.stats.emergFail = (S.stats.emergFail || 0) + 1; logErro(ps.E.tema, false, ps.E.area, 'Emergência não atendida a tempo. ' + ps.E.r.map(r => r.exp).join(' ')); }
  toast(ps.kind === 'emerg' ? `<b>Ninguém atendeu a emergência a tempo:</b> ${U.esc(ps.E.titulo)}.<br>A equipe assumiu sem você. ${S.rep - old} de reputação.` : `<b>Ninguém atendeu ${U.esc(ps.P.nome)} a tempo.</b> A equipe precisou conter o paciente sem você.<br>${old > 0 ? 'Bom Interno' : 'Mal Interno'}: ${S.rep - old} de reputação.`, 'bad');
  if (old >= 0 && S.rep < 0) toast('Sua reputação ficou negativa: <b>Mal Interno</b>.', 'bad');
  saveGame();
}
