/* =====================================================================
   SITE PRÓPRIO (GitHub Pages) + FIREBASE
   - Login com Google (opcional) e save na nuvem: o mesmo personagem em
     qualquer aparelho. Sem login, cada jogador entra como anônimo (só
     para o multiplayer) e o save fica no navegador, como antes.
   - Multiplayer pelo Realtime Database, com a MESMA interface da sala do
     claude.ai (emit/on/presence/peers/onPeers/onConnection), então o
     resto do jogo não precisa saber de onde vem a conexão.
   Organização dos dados:
     online/{uid}  nome, nível, pontos, mapa, estado  (todo mundo lê; muda pouco)
     pos/{uid}     mapa, x, y, direção, roupa         (cada um só escuta o próprio mapa)
     inbox/{uid}   mensagens do duelo para essa pessoa
     saves/{uid}   save na nuvem (só o dono lê e escreve)
   Só existe no site: no artifact do claude.ai, window.FIREBASE_CONFIG não
   é definido e nada disto roda.
   ===================================================================== */
const FB = { ok: false, auth: null, db: null, user: null, ready: null, room: null, err: null, cloud: 'off', upTimer: null, lastUp: 0, syncing: false };

function fbInit() {
  if (!window.FIREBASE_CONFIG || !window.firebase) return;
  try {
    firebase.initializeApp(window.FIREBASE_CONFIG);
    FB.auth = firebase.auth(); FB.db = firebase.database(); FB.ok = true;
  } catch (e) { console.warn('firebase', e); FB.err = 'init'; return; }
  let res; FB.ready = new Promise(r => { res = r; });
  FB.auth.onAuthStateChanged(u => {
    if (!u) { FB.auth.signInAnonymously().catch(e => { console.warn('login anônimo', e); FB.err = (e && e.code) || 'anon'; if (typeof MP !== 'undefined' && MP.status !== 'on') MP.status = 'off'; acctRender(); }); return; }
    FB.err = null;
    FB.user = u; res(u);
    if (FB.room) FB.room._bind(u.uid);
    FB.cloud = u.isAnonymous ? 'off' : 'on';
    if (!u.isAnonymous) cloudSync();
    acctRender();
  });
  window.addEventListener('pagehide', () => cloudFlush());
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') cloudFlush(); });
}
async function fbRoomReady() {
  if (!FB.ok) return null;
  const u = await FB.ready; if (!u) return null;
  if (!FB.room) { FB.room = fbMakeRoom(); FB.room._bind(u.uid); }
  return FB.room;
}

// ---------- multiplayer pelo Realtime Database ----------
function fbMakeRoom() {
  const db = FB.db, TS = () => firebase.database.ServerValue.TIMESTAMP;
  const ONLINE = ['v', 'nm', 'lv', 'rp', 'map', 'st'], POS = ['map', 'x', 'y', 'd', 'mv', 'lk'];
  const R = { uid: null, online: {}, pos: {}, mine: {}, peerH: [], topicH: {}, connH: [], errH: [], conn: false, last: [], posMap: undefined, posQ: null, inbox: null, sentOnline: '', sentPos: {}, posAt: 0, posTimer: null, offline: [] };
  const pick = (o, ks) => { const r = {}; for (const k of ks) if (o[k] !== undefined) r[k] = o[k]; return r; };
  function snap() {
    const out = [];
    for (const [uid, o] of Object.entries(R.online || {})) {
      if (!o || o.v !== 1 || uid === R.uid) continue;
      const pres = pick(o, ONLINE), p = R.pos[uid];
      if (p && p.map === o.map && o.map === R.posMap) Object.assign(pres, pick(p, ['x', 'y', 'd', 'mv', 'lk']));
      out.push({ peer: uid, by: uid, isMe: false, sameTab: false, kind: 'viewer', guest: false, presence: pres, updatedAt: Date.now() });
    }
    if (R.uid) out.push({ peer: R.uid, by: R.uid, isMe: true, sameTab: true, kind: 'viewer', guest: false, presence: Object.assign({}, R.mine), updatedAt: Date.now() });
    return out;
  }
  function notify() {
    const peers = snap(), ids = new Set(peers.map(p => p.peer));
    const left = R.last.filter(p => !ids.has(p.peer)), joined = peers.filter(p => !R.last.some(q => q.peer === p.peer));
    R.last = peers; for (const h of R.peerH) { try { h({ peers, joined, left, updated: peers }); } catch (e) { console.warn(e); } }
  }
  const fail = e => { console.warn('firebase sala', e); for (const h of R.errH) h({ code: e && e.code === 'PERMISSION_DENIED' ? 'not_granted' : 'upstream_error', message: String(e) }); };
  function watchPos(map) {
    if (map === R.posMap) return;
    if (R.posQ) R.posQ.off();
    R.posMap = map; R.pos = {};
    if (typeof map !== 'string') { R.posQ = null; notify(); return; }
    R.posQ = db.ref('pos').orderByChild('map').equalTo(map);
    R.posQ.on('value', s => { R.pos = s.val() || {}; notify(); }, fail);
  }
  function sendPos(force) {
    if (!R.uid) return;
    const now = Date.now(); if (!force && now - R.posAt < 250) { if (!R.posTimer) R.posTimer = setTimeout(() => { R.posTimer = null; sendPos(true); }, 260); return; }
    const cur = pick(R.mine, POS), diff = {};
    for (const k of POS) { const a = JSON.stringify(cur[k] ?? null), b = JSON.stringify(R.sentPos[k] ?? null); if (a !== b) diff[k] = cur[k] ?? null; }
    if (!Object.keys(diff).length) return;
    R.posAt = now; R.sentPos = Object.assign({}, R.sentPos, cur);
    db.ref('pos/' + R.uid).update(diff).catch(fail);
  }
  function sendOnline() {
    if (!R.uid) return;
    const o = pick(R.mine, ONLINE), key = JSON.stringify(o); if (key === R.sentOnline) return; R.sentOnline = key;
    if (typeof o.map !== 'string') { db.ref('online/' + R.uid).remove().catch(() => {}); db.ref('pos/' + R.uid).remove().catch(() => {}); R.sentPos = {}; return; }
    db.ref('online/' + R.uid).set(Object.assign(o, { t: TS() })).catch(fail);
  }
  const room = {
    _bind(uid) {
      if (R.uid === uid) return;
      if (R.inbox) R.inbox.off();
      R.uid = uid; R.sentOnline = ''; R.sentPos = {};
      for (const k of ['online', 'pos', 'inbox']) db.ref(k + '/' + uid).onDisconnect().remove();
      db.ref('inbox/' + uid).remove().catch(() => {}).then(() => {
        R.inbox = db.ref('inbox/' + uid);
        R.inbox.on('child_added', s => {
          const v = s.val(); s.ref.remove().catch(() => {});
          let m; try { m = JSON.parse(v.d); } catch (e) { return; }
          if (!m || typeof m.topic !== 'string') return;
          for (const h of (R.topicH[m.topic] || [])) h({ topic: m.topic, data: m.data, peer: v.from, by: v.from, isMe: v.from === R.uid, sameTab: v.from === R.uid, kind: 'viewer', guest: false });
        }, fail);
      });
      sendOnline(); sendPos(true); notify();
    },
    // sai de tudo (antes de trocar de conta)
    async _leave() { if (!R.uid) return; const uid = R.uid; if (R.inbox) R.inbox.off(); R.inbox = null; R.uid = null; await Promise.all(['online', 'pos', 'inbox'].map(k => db.ref(k + '/' + uid).remove().catch(() => {}))); },
    async emit(topic, data) {
      if (!R.uid || !data || typeof data.to !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(data.to)) return;
      const d = JSON.stringify({ topic, data }); if (d.length >= 4000) throw { code: 'invalid_argument' };
      await db.ref('inbox/' + data.to).push({ from: R.uid, d, t: TS() });
    },
    on(topic, h) { (R.topicH[topic] = R.topicH[topic] || []).push(h); return () => { R.topicH[topic] = R.topicH[topic].filter(x => x !== h); }; },
    async presence(patch) {
      for (const [k, v] of Object.entries(patch)) { if (v === null) delete R.mine[k]; else R.mine[k] = v; }
      watchPos(typeof R.mine.map === 'string' ? R.mine.map : null);
      sendOnline(); sendPos(false);
    },
    peers: () => R.last,
    onPeers(h, onErr) { R.peerH.push(h); if (onErr) R.errH.push(onErr); setTimeout(() => h({ peers: snap(), joined: [], left: [], updated: [] }), 0); return () => {}; },
    connected: () => R.conn,
    onConnection(h, onErr) { R.connH.push(h); if (onErr) R.errH.push(onErr); setTimeout(() => h(R.conn), 0); return () => {}; },
  };
  db.ref('.info/connected').on('value', s => { R.conn = !!s.val(); for (const h of R.connH) h(R.conn); if (R.conn && R.uid) { for (const k of ['online', 'pos', 'inbox']) db.ref(k + '/' + R.uid).onDisconnect().remove(); R.sentOnline = ''; R.sentPos = {}; sendOnline(); sendPos(true); } });
  db.ref('online').on('value', s => { R.online = s.val() || {}; notify(); }, fail);
  return room;
}

// ---------- login com Google ----------
async function fbGoogleLogin() {
  if (!FB.ok) return;
  const prov = new firebase.auth.GoogleAuthProvider(); prov.setCustomParameters({ prompt: 'select_account' });
  try {
    saveGame(); cloudFlush();
    if (FB.room) await FB.room._leave();
    await FB.auth.signInWithPopup(prov);
  } catch (e) {
    const c = e && e.code;
    if (c === 'auth/popup-blocked' || c === 'auth/operation-not-supported-in-this-environment') { try { await FB.auth.signInWithRedirect(prov); return; } catch (e2) { toast('Não foi possível abrir o login do Google.', 'bad'); } }
    else if (c === 'auth/unauthorized-domain') toast('Este endereço não está autorizado no Firebase (Domínios autorizados).', 'bad');
    else if (c !== 'auth/popup-closed-by-user' && c !== 'auth/cancelled-popup-request') toast('Não foi possível entrar com o Google agora.', 'bad');
    if (FB.room && FB.user) FB.room._bind(FB.user.uid);    // continua como estava
  }
}
async function fbLogout() {
  if (!FB.ok) return;
  saveGame(); cloudFlush();
  if (FB.room) await FB.room._leave();
  FB.cloud = 'off';
  await FB.auth.signOut();   // onAuthStateChanged entra de novo como anônimo
  toast('Você saiu da conta. O save continua neste aparelho.');
}

// ---------- save na nuvem ----------
function cloudUser() { return FB.ok && FB.user && !FB.user.isAnonymous ? FB.user : null; }
function cloudQueue() {
  if (!cloudUser() || FB.syncing) return;
  clearTimeout(FB.upTimer);
  FB.upTimer = setTimeout(cloudUpload, Date.now() - FB.lastUp > 20000 ? 2000 : 8000);
}
function cloudFlush() { if (FB.upTimer) { clearTimeout(FB.upTimer); FB.upTimer = null; cloudUpload(); } }
// Os dois modos ficam no mesmo registro da conta: d = {v: 2, i: save do Modo Internato, e: save do Modo Vestibulando}.
// Registros antigos (d = um save só) são tratados como Modo Internato.
function cloudPack() {
  const raw = m => { let r = null; try { r = localStorage.getItem(saveKeyFor(m)); } catch (e) { r = null; } if (!r && S && S.modo === m) r = JSON.stringify(S); return r; };
  return JSON.stringify({ v: 2, i: raw('internato'), e: raw('vest') });
}
function cloudUnpack(str) {
  let o; try { o = JSON.parse(str); } catch (e) { return {}; }
  const mig = (r, m) => { if (typeof r !== 'string') return null; try { const d = migrateSave(JSON.parse(r)); if (d) d.modo = m; return d; } catch (e) { return null; } };
  if (o && o.v === 2) return { internato: mig(o.i, 'internato'), vest: mig(o.e, 'vest') };
  if (o && o.player) return { internato: mig(str, 'internato'), vest: null };
  return {};
}
function cloudUpload() {
  const u = cloudUser(); if (!u || FB.syncing) return;
  const raw = cloudPack();
  if (raw.length >= 500000) return;
  FB.lastUp = Date.now(); FB.cloud = 'salvando';
  FB.db.ref('saves/' + u.uid).set({ d: raw, t: firebase.database.ServerValue.TIMESTAMP }).then(() => { FB.cloud = 'on'; acctRender(); }).catch(e => { console.warn('nuvem', e); FB.cloud = 'erro'; acctRender(); });
}
function saveSummary(d) { return saveSummaryOf(d); }
async function cloudSync() {
  const u = cloudUser(); if (!u || FB.syncing) return;
  FB.syncing = true; acctRender();
  let cloud = {};
  try { const s = await FB.db.ref('saves/' + u.uid).once('value'); const v = s.val(); if (v && typeof v.d === 'string') cloud = cloudUnpack(v.d); } catch (e) { console.warn('nuvem', e); FB.syncing = false; FB.cloud = 'erro'; acctRender(); return; }
  let mudou = false, subir = false;
  const usar = (m, d) => { try { localStorage.setItem(saveKeyFor(m), JSON.stringify(d)); mudou = true; } catch (e) {} };
  // pergunta qual personagem manter quando aparelho e conta têm personagens diferentes no mesmo modo
  const perguntar = (m, c, l) => new Promise(res => {
    const box = U.el('div', 'confirm', `<div class="panel small"><h3>${modoNome(m)}: qual personagem você quer usar?</h3><p>Encontramos um save deste modo na sua conta e outro neste aparelho.</p>
      <div class="menu-col"><button class="btn" id="svNuvem">☁ Da conta Google: ${saveSummary(c)}</button><button class="btn ghost" id="svLocal">💻 Deste aparelho: ${saveSummary(l)}</button></div>
      <p class="hint">O que você não escolher será substituído.</p></div>`);
    OV().appendChild(box);
    box.querySelector('#svNuvem').onclick = () => { box.remove(); res('nuvem'); };
    box.querySelector('#svLocal').onclick = () => { box.remove(); res('local'); };
  });
  for (const m of ['internato', 'vest']) {
    const c = cloud[m] || null, l = loadGame(m);
    if (!c && !l) continue;
    if (c && !l) { usar(m, c); continue; }
    if (!c && l) { subir = true; continue; }
    // os dois existem: mesmo personagem → fica o que tem mais tempo de jogo; personagens diferentes → pergunta
    if (c.created === l.created) { if ((c.playTime || 0) > (l.playTime || 0)) usar(m, c); else if ((c.playTime || 0) < (l.playTime || 0)) subir = true; continue; }
    if (G.mode !== 'title') continue;           // decide na próxima vez que estiver na tela inicial
    if (await perguntar(m, c, l) === 'nuvem') usar(m, c); else subir = true;
  }
  FB.syncing = false;
  if (subir) { cloudUpload(); toast('Seu progresso agora está salvo na sua conta Google.', 'good'); }
  if (mudou) { if (G.mode === 'title') showTitle(); toast('Save carregado da sua conta Google.', 'good'); }
  acctRender();
}

// ---------- caixa da conta na tela inicial ----------
function acctRender() {
  const el = document.getElementById('acctBox'); if (!el) return;
  if (!window.FIREBASE_CONFIG) { el.hidden = true; return; }
  el.hidden = false;
  const u = FB.user;
  if (!FB.ok || FB.err === 'init') { el.innerHTML = '<p class="hint">Login indisponível agora. Você pode jogar normalmente; o save fica neste navegador.</p>'; return; }
  const gBtn = `<button class="btn big g-login" id="bGoogle"><span class="g-ico">G</span> Entrar com Google</button>`;
  if (!u || u.isAnonymous) {
    const nota = !u && FB.err ? `<p class="hint err">O modo online sem conta não conectou (${U.esc(String(FB.err).replace('auth/', ''))}). Entre com o Google para jogar online, ou jogue normalmente com o save neste navegador.</p>`
      : !u ? '<p class="hint">Conectando ao modo online…</p>' : '';
    el.innerHTML = gBtn + nota + `<p class="hint">Salve seu personagem na nuvem e jogue em qualquer aparelho. Sem conta, o save fica só neste navegador.</p>`;
    el.querySelector('#bGoogle').onclick = () => { SFX.init(); fbGoogleLogin(); };
    return;
  }
  {
    const st = FB.syncing ? 'sincronizando…' : FB.cloud === 'erro' ? '⚠ não foi possível salvar na nuvem agora' : FB.cloud === 'salvando' ? 'salvando…' : 'save na nuvem ativo';
    el.innerHTML = `<p class="acct-on">✔ Conectado como <b>${U.esc(u.displayName || 'jogador')}</b> · ${st}</p><button class="btn ghost small" id="bSair">Sair da conta</button>`;
    el.querySelector('#bSair').onclick = () => fbLogout();
  }
}
fbInit();

