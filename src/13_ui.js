/* =====================================================================
   INTERFACE: telas, HUD, painéis, diálogos, loja e minigames de missão
   ===================================================================== */
const $ = s => document.querySelector(s);
const OV = () => document.getElementById('overlay');
function icon(key, size = 32) { return `<img class="ico" src="${SPR.iconURL(key, size)}" width="${size}" height="${size}" alt="">`; }
function rarTag(r) { return `<span class="rar" style="--rc:${RARIDADES[r].cor}">${RARIDADES[r].nome}</span>`; }
function statsLine(st) { return Object.entries(st || {}).map(([k, v]) => `<span class="${v >= 0 ? 'pos' : 'neg'}">${v >= 0 ? '+' : ''}${v} ${STAT_NOME[k] || k}</span>`).join(' '); }
function portraitCanvas(look, w = 96, h = 96, opts = {}) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; cv.className = 'pix'; SPR.portrait(cv, look, opts); return cv; }

function setOverlay(html, cls = '') { const o = OV(); o.className = cls; o.innerHTML = html; o.scrollTop = 0; o.hidden = !html; document.body.classList.toggle('has-ov', !!html); return o; }
function closeOverlay(mode = 'explore') { if (G.panelName && String(G.panelName).startsWith('mp_') && typeof mpOnClose === 'function') { const pn = G.panelName; G.panelName = null; mpOnClose(pn); } setOverlay(''); G.mode = mode; G.keys = {}; SFX.play('ui'); }

/* Ajuda de controles: teclado no computador, toque no celular */
function controlesHTML() {
  if (IS_TOUCH) return '<ul class="keys"><li><b>Andar:</b> encoste o polegar no lado esquerdo da tela e arraste (joystick)</li><li><b>AGIR:</b> falar, atender, abrir portas</li><li>Botões à direita: mapa, itens, diário, habilidades, ficha, erros e pausa</li></ul>';
  return '<ul class="keys"><li><kbd>WASD</kbd>/<kbd>setas</kbd> andar</li><li><kbd>E</kbd> interagir</li><li><kbd>M</kbd> mapa</li><li><kbd>I</kbd> inventário</li><li><kbd>J</kbd> diário</li><li><kbd>K</kbd> habilidades</li><li><kbd>C</kbd> ficha</li><li><kbd>N</kbd> caderno de erros</li><li><kbd>Esc</kbd> pausa</li></ul>';
}

/* ---------------- Tela inicial ---------------- */
let NEWMODE = 'internato';
const MODOS_INFO = {
  internato: { tag: 'Campanha · jogo individual', novo: 'Novo internato', feat: [`${N_ESTAGIOS_TXT[0].toUpperCase() + N_ESTAGIOS_TXT.slice(1)} estágios na ordem que você escolher`, 'Missões, preceptores-chefes e missões espontâneas', 'Só você no hospital, sem outros jogadores'] },
  vest: { tag: 'Mapa aberto · online', novo: 'Novo personagem', feat: ['Todos os setores abertos desde o início', 'Só casos de pacientes e emergências, sem missões', 'Outros jogadores no mapa, duelos no bar e o título de Melhor Interno'] },
};
function showTitle() {
  G.mode = 'title';
  const tl = document.getElementById('toasts'); if (tl) tl.innerHTML = '';   // avisos do jogo não ficam na tela inicial
  const saves = { internato: hasSave('internato') ? loadGame('internato') : null, vest: hasSave('vest') ? loadGame('vest') : null };
  const card = m => { const I = MODOS_INFO[m], d = saves[m]; return `<section class="mode-card m-${m}">
      <p class="eyebrow">${I.tag}</p><h2>${modoNome(m)}</h2>
      <ul class="mode-feat">${I.feat.map(f => `<li>${f}</li>`).join('')}</ul>
      ${d ? `<p class="mode-save">${saveSummaryOf(d)}</p>` : ''}
      <div class="menu-col">${d ? `<button class="btn" data-cont="${m}">Continuar</button>` : ''}<button class="btn ${d ? 'ghost' : ''}" data-novo="${m}">${I.novo}</button></div>
    </section>`; };
  const o = setOverlay(`
    <div class="title-screen">
      <div class="title-sky"><canvas id="titleScene" width="640" height="232" class="pix"></canvas></div>
      <div class="title-box">
        <p class="eyebrow">RPG de internato médico · pixel art</p>
        <h1 class="logo">${GAME_TITLE}</h1>
        <p class="sub">${N_ESTAGIOS_TXT[0].toUpperCase() + N_ESTAGIOS_TXT.slice(1)} estágios. ${N_ESTAGIOS_TXT[0].toUpperCase() + N_ESTAGIOS_TXT.slice(1)} preceptores. Um jaleco ainda sem mancha de café.</p>
        <div id="acctBox" class="acct" hidden></div>
        <div class="mode-cards">${card('internato')}${card('vest')}</div>
        <div class="row center"><button class="btn ghost" id="bImp">Importar save</button><button class="btn ghost" id="bSom">Som: ${SFX.on ? 'ligado' : 'desligado'}</button></div>
        <p class="disclaimer">Jogo educacional e ficcional. O conteúdo clínico não substitui protocolos institucionais, supervisão nem orientação médica real.</p>
      </div>
    </div>`, 'full');
  drawTitleScene();
  OV().querySelectorAll('[data-novo]').forEach(b => b.onclick = () => {
    SFX.init(); const m = b.dataset.novo;
    const go = () => { NEWMODE = m; ORD = []; showCreate(); };
    if (saves[m]) confirmBox(`Começar de novo no ${modoNome(m)} apaga o progresso salvo deste modo (o outro modo não muda). Continuar?`, () => { deleteSave(m); go(); }); else go();
  });
  OV().querySelectorAll('[data-cont]').forEach(b => b.onclick = () => {
    SFX.init(); const d = loadGame(b.dataset.cont); if (!d) { toast('Não foi possível carregar o save (dados incompatíveis).', 'bad'); return; }
    S = d; startExplore(true);
  });
  $('#bImp').onclick = () => importBox();
  $('#bSom').onclick = () => { SFX.on = !SFX.on; showTitle(); };
  if (typeof acctRender === 'function') acctRender();
}
function drawTitleScene() {
  const cv = $('#titleScene'); if (!cv) return; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const W = cv.width, H = cv.height;
  // céu de fim de tarde em faixas (dithering de 32 bits)
  const sky = ['#22345e', '#2b4a7a', '#3c6493', '#6a7fa6', '#b88a8c', '#e9a06e', '#f6c27a'];
  for (let y = 0; y < 150; y++) { const t = y / 150 * (sky.length - 1), k = Math.floor(t), f = t - k; c.fillStyle = (f > 0.5 && ((y + Math.floor(y / 2)) % 2)) ? sky[Math.min(k + 1, sky.length - 1)] : sky[k]; c.fillRect(0, y, W, 1); }
  for (let k = 0; k < 40; k++) { c.fillStyle = 'rgba(255,255,255,' + (0.3 + hsh(k, 2) * 0.6) + ')'; c.fillRect(Math.floor(hsh(k, 1) * W), Math.floor(hsh(1, k) * 60), 1, 1); }
  pixEll(c, 110, 40, 30, 7, 'rgba(255,220,200,0.35)'); pixEll(c, 520, 30, 40, 6, 'rgba(255,220,200,0.3)');
  // prédios ao fundo
  for (let k = 0; k < 12; k++) { const bw = 40 + hsh(k, 3) * 30, bh = 40 + hsh(k, 4) * 50, bx = k * 58 - 10; c.fillStyle = '#4a5878'; c.fillRect(bx, 150 - bh, bw, bh); for (let q = 0; q < bh - 8; q += 8) for (let r = 4; r < bw - 6; r += 9) { c.fillStyle = hsh(k * 31 + q, r) > 0.55 ? '#ffd98a' : '#3d4a66'; c.fillRect(bx + r, 150 - bh + 4 + q, 4, 4); } }
  // hospital
  const hx = 110, hw = 420; bevelBox(c, hx, 52, hw, 106, '#e9e3d3'); c.fillStyle = '#c9c2b2'; c.fillRect(hx, 52, hw, 8);
  for (let r = 0; r < 3; r++) for (let k = 0; k < 9; k++) { const wx = hx + 16 + k * 45, wy = 74 + r * 26; if (r === 2 && k >= 3 && k <= 5) continue; bevelBox(c, wx, wy, 26, 18, hsh(k, r) > 0.4 ? '#ffe39a' : '#9fc6dc'); c.fillStyle = 'rgba(255,255,255,0.5)'; c.fillRect(wx + 2, wy + 2, 22, 2); c.fillStyle = '#7a8a96'; c.fillRect(wx + 12, wy, 2, 18); }
  bevelBox(c, hx + hw / 2 - 90, 58, 180, 16, '#1f3f9a'); text57(c, 'SANTA ESPERANCA', hx + hw / 2 - text57W('SANTA ESPERANCA') / 2, 62, '#ffffff');
  DECALS.logo(c, hx + hw / 2 - 12, 122, 24, 24); DECALS.porta(c, hx + hw / 2 - 60, 100, 40, 58, 'vidro'); DECALS.porta(c, hx + hw / 2 + 20, 100, 40, 58, 'vidro');
  // calçada portuguesa e rua
  for (let y = 158; y < H; y++) for (let x = 0; x < W; x += 1) { const band = Math.floor((y + Math.sin(x / 11) * 5) / 8) % 2; if ((x + y) % 2 === 0 || x % 4 === 0) { c.fillStyle = band ? '#3a3a40' : '#e8e4da'; c.fillRect(x, y, 1, 1); } else { c.fillStyle = band ? '#2e2e34' : '#d8d2c4'; c.fillRect(x, y, 1, 1); } }
  // árvores (ipê)
  for (const [tx, col] of [[40, '#f2c230'], [596, '#e88ab8']]) { c.fillStyle = '#6b4a2a'; c.fillRect(tx - 3, 110, 7, 50); for (let k = 0; k < 7; k++) pixCircle(c, tx - 16 + hsh(k, tx) * 32, 92 + hsh(tx, k) * 26, 12, k % 2 ? col : PAL.hex(PAL.ramp(col).d1)); }
  // elenco
  const cast = ['leozao', 'sueli', 'sheila', 'vladimir', 'laercio'];
  cast.forEach((k, i) => { const sp = SPR.char(LOOKS[k], 0, 0, 'idle'); const x = i < 2 ? 70 + i * 92 : 380 + (i - 2) * 80; c.fillStyle = 'rgba(14,10,26,0.3)'; c.fillRect(x + 10, 216, 28, 4); c.drawImage(sp, x, 156); });
  const hero = SPR.char({ skin: SKIN_TONES[3], hair: 'cacheado', hairC: HAIR_COLORS[1], coat: 'jaleco', badge: true, topC: '#3d6fd1', fem: true, mouth: 'lips', build: 'magro', steth: true }, 0, 1, 'victory');
  c.fillStyle = 'rgba(14,10,26,0.3)'; c.fillRect(W / 2 - 22, 226, 44, 5); c.drawImage(hero, W / 2 - SW, 100, SW * 2, SH * 2);
}
function confirmBox(msg, yes, no) {
  const prev = OV().innerHTML, prevCls = OV().className, prevMode = G.mode;
  const box = U.el('div', 'confirm', `<div class="panel small"><p>${msg}</p><div class="row"><button class="btn" id="cfY">Confirmar</button><button class="btn ghost" id="cfN">Cancelar</button></div></div>`);
  OV().hidden = false; OV().appendChild(box);
  box.querySelector('#cfY').onclick = () => { box.remove(); yes && yes(); };
  box.querySelector('#cfN').onclick = () => { box.remove(); if (!prev) OV().hidden = true; no && no(); G.mode = prevMode; };
}
function importBox() {
  const box = U.el('div', 'confirm', `<div class="panel small"><h3>Importar save</h3><p>Cole o código exportado anteriormente.</p><textarea id="impTxt" rows="5"></textarea><div class="row"><button class="btn" id="impOk">Carregar</button><button class="btn ghost" id="impNo">Cancelar</button></div></div>`);
  OV().hidden = false; OV().appendChild(box);
  box.querySelector('#impNo').onclick = () => box.remove();
  box.querySelector('#impOk').onclick = () => { const d = importSave(box.querySelector('#impTxt').value); if (!d) { toast('Código inválido ou de versão incompatível.', 'bad'); return; } S = d; saveGame(); box.remove(); startExplore(true); };
}

/* ---------------- Criação de personagem ---------------- */
let CR = null;
function showCreate() {
  G.mode = 'create';
  CR = CR || { name: '', pres: 'f', skin: SKIN_TONES[3], hair: 'cacheado', hairC: HAIR_COLORS[1], shirt: 'azul', pants: 'preta', shoes: 'branco', glasses: false };
  const sw = (arr, key, sel) => arr.map((c, i) => `<button class="sw ${sel === c ? 'on' : ''}" data-k="${key}" data-v="${c}" style="--c:${c}" aria-label="cor ${i + 1}"></button>`).join('');
  const chips = (opts, key, sel) => opts.map(o => `<button class="chip ${sel === o.id ? 'on' : ''}" data-k="${key}" data-v="${o.id}">${o.c ? `<i style="--c:${o.c}"></i>` : ''}${o.nome}</button>`).join('');
  setOverlay(`
    <div class="screen create">
      <header class="scr-head"><p class="eyebrow">${NEWMODE === 'vest' ? 'Modo Vestibulando' : 'Etapa 1 de 2'}</p><h2>Crie seu interno</h2></header>
      <div class="create-grid">
        <div class="preview-col">
          <div class="preview-frame"><canvas id="crPrev" width="176" height="232" class="pix"></canvas></div>
          <div class="badge-card"><span class="bc-top">${HOSPITAL_NOME}</span><b id="crBadge">${U.esc(CR.name || 'Seu nome')}</b><span class="bc-role">INTERNO</span></div>
          <p class="hint">Você começa com jaleco branco e crachá de interno. Roupas, acessórios e itens equipados depois mudam a aparência do personagem.</p>
        </div>
        <div class="form-col">
          <label class="fld"><span>Nome</span><input id="crName" maxlength="18" placeholder="Ex.: Ana Beatriz" value="${U.esc(CR.name)}"></label>
          <div class="fld"><span>Apresentação</span><div class="chips">${chips([{ id: 'f', nome: 'Feminina' }, { id: 'm', nome: 'Masculina' }, { id: 'a', nome: 'Andrógina' }], 'pres', CR.pres)}</div></div>
          <div class="fld"><span>Tom de pele</span><div class="sws">${sw(SKIN_TONES, 'skin', CR.skin)}</div></div>
          <div class="fld"><span>Cabelo</span><div class="chips">${chips(Object.entries(HAIR_STYLES).map(([id, nome]) => ({ id, nome })), 'hair', CR.hair)}</div></div>
          <div class="fld"><span>Cor do cabelo</span><div class="sws">${sw(HAIR_COLORS, 'hairC', CR.hairC)}</div></div>
          <div class="fld"><span>Blusa sob o jaleco</span><div class="chips">${chips(SHIRT_OPTIONS, 'shirt', CR.shirt)}</div></div>
          <div class="fld"><span>Calça ou saia</span><div class="chips">${chips(PANTS_OPTIONS, 'pants', CR.pants)}</div></div>
          <div class="fld"><span>Calçado</span><div class="chips">${chips(SHOE_OPTIONS, 'shoes', CR.shoes)}</div></div>
          <div class="fld"><span>Óculos</span><div class="chips">${chips([{ id: 'nao', nome: 'Sem óculos' }, { id: 'sim', nome: 'Com óculos' }], 'glasses', CR.glasses ? 'sim' : 'nao')}</div></div>
        </div>
      </div>
      <footer class="scr-foot"><button class="btn ghost" id="crBack">Voltar</button><button class="btn" id="crOk">${NEWMODE === 'vest' ? 'Confirmar e entrar no hospital' : 'Confirmar e escolher estágios'}</button></footer>
    </div>`, 'full');
  const prev = $('#crPrev'); let dir = 0, fr = 0;
  const draw = () => { SPR.portrait(prev, previewLook(), { dir, frame: fr, pose: 'walk', scale: 7 }); };
  draw(); clearInterval(G.crInt); G.crInt = setInterval(() => { fr = (fr + 1) % 4; if (fr === 0 && Math.random() < 0.35) dir = (dir + 1) % 4; if (!document.body.contains(prev)) return clearInterval(G.crInt); draw(); }, 180);
  OV().querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const k = b.dataset.k; let v = b.dataset.v; if (k === 'glasses') v = v === 'sim'; CR[k] = v; SFX.play('ui'); showCreate(); });
  $('#crName').oninput = e => { CR.name = e.target.value; $('#crBadge').textContent = CR.name || 'Seu nome'; };
  $('#crBack').onclick = () => showTitle();
  $('#crOk').onclick = () => {
    CR.name = (CR.name || '').trim() || (CR.pres === 'm' ? 'Lucas' : CR.pres === 'a' ? 'Alex' : 'Ana');
    if (NEWMODE !== 'vest') return showOrder();
    // Modo Vestibulando: sem ordem de estágios, todos os setores abertos
    S = newState(crPlayer(), 'vest'); S.order = AREA_IDS.slice(); invAdd('cafe', 2); invAdd('pao_queijo', 1);
    showIntroVest();
  };
}
function crPlayer() { return { name: CR.name, look: { pres: CR.pres, skin: CR.skin, hair: CR.hair, hairC: CR.hairC, shirt: CR.shirt, pants: CR.pants, shoes: CR.shoes, glasses: CR.glasses } }; }
function previewLook() {
  const sh = SHIRT_OPTIONS.find(x => x.id === CR.shirt), pa = PANTS_OPTIONS.find(x => x.id === CR.pants), so = SHOE_OPTIONS.find(x => x.id === CR.shoes);
  return { skin: CR.skin, hair: CR.hair, hairC: CR.hairC, top: sh.top, topC: sh.c, bottomC: pa.c, skirt: !!pa.skirt, shoes: so.c, coat: 'jaleco', badge: true, build: CR.pres === 'm' ? 'normal' : 'magro', mouth: CR.pres === 'f' ? 'lips' : 'normal', glasses: CR.glasses ? 'preta' : null };
}

/* ---------------- Ordem dos estágios ---------------- */
let ORD = [];
function showOrder() {
  G.mode = 'order';
  const card = a => { const A = AREAS[a], B = BOSSES[A.chefe], idx = ORD.indexOf(a); return `<button class="area-card ${idx >= 0 ? 'picked' : ''}" data-a="${a}" style="--ac:${A.cor}"><span class="ac-num">${idx >= 0 ? idx + 1 : '+'}</span><span class="ac-ico">${A.icone}</span><b>${A.nome}</b><small>${A.local}</small><span class="ac-boss">Chefe: ${B.nome}</span></button>`; };
  setOverlay(`
    <div class="screen order">
      <header class="scr-head"><p class="eyebrow">Etapa 2 de 2</p><h2>Monte seu internato</h2><p class="lede">Escolha a ordem dos ${N_ESTAGIOS_TXT} estágios. Só o primeiro começa liberado; cada chefe derrotado abre o próximo da sua sequência. O bar do Rodolfo fica aberto o tempo todo.</p></header>
      <div class="order-grid">
        <div class="cards">${AREA_IDS.map(card).join('')}</div>
        <div class="seq panel-lite"><h3>Sua sequência</h3><ol>${ORD.map((a, i) => `<li style="--ac:${AREAS[a].cor}"><span>${AREAS[a].nome}</span><span class="seq-ctl"><button class="mini" data-up="${i}" aria-label="Subir">▲</button><button class="mini" data-dn="${i}" aria-label="Descer">▼</button><button class="mini" data-rm="${i}" aria-label="Remover">✕</button></span></li>`).join('') || '<li class="empty">Clique nos cartões para montar a ordem.</li>'}</ol>
          <div class="row"><button class="btn ghost" id="oRand">Ordem aleatória</button><button class="btn ghost" id="oClr">Limpar</button></div>
        </div>
      </div>
      <footer class="scr-foot"><button class="btn ghost" id="oBack">Voltar ao personagem</button><button class="btn" id="oOk" ${ORD.length === AREA_IDS.length ? '' : 'disabled'}>Começar o internato</button></footer>
    </div>`, 'full');
  OV().querySelectorAll('.area-card').forEach(b => b.onclick = () => { const a = b.dataset.a; const i = ORD.indexOf(a); if (i >= 0) ORD.splice(i, 1); else ORD.push(a); SFX.play('ui'); showOrder(); });
  OV().querySelectorAll('[data-up]').forEach(b => b.onclick = () => { const i = +b.dataset.up; if (i > 0) [ORD[i - 1], ORD[i]] = [ORD[i], ORD[i - 1]]; showOrder(); });
  OV().querySelectorAll('[data-dn]').forEach(b => b.onclick = () => { const i = +b.dataset.dn; if (i < ORD.length - 1) [ORD[i + 1], ORD[i]] = [ORD[i], ORD[i + 1]]; showOrder(); });
  OV().querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { ORD.splice(+b.dataset.rm, 1); showOrder(); });
  $('#oRand').onclick = () => { ORD = U.shuffle(AREA_IDS); showOrder(); };
  $('#oClr').onclick = () => { ORD = []; showOrder(); };
  $('#oBack').onclick = () => showCreate();
  $('#oOk').onclick = () => {
    if (ORD.length !== AREA_IDS.length) return;
    S = newState(crPlayer(), 'internato');
    S.order = ORD.slice(); invAdd('cafe', 2); invAdd('pao_queijo', 1);
    showIntro();
  };
}
function showIntro() {
  const first = AREAS[S.order[0]];
  setOverlay(`<div class="screen intro"><div class="panel story">
    <p class="eyebrow">Primeiro dia</p><h2>${U.esc(S.player.name)}, interno(a) do ${HOSPITAL_NOME}</h2>
    <p>Você chega com o jaleco passado, o crachá torto e um café na mão. Do outro lado da avenida, o Rodolfo já abriu o bar e grita "bom dia, doutor(a)!" para qualquer pessoa de branco.</p>
    <p>Seu primeiro estágio é <b style="color:${first.cor}">${first.nome}</b> (${first.local}). ${S.order[0] === 'upa' ? 'A UPA fica à esquerda na avenida.' : S.order[0] === 'ubs' ? 'A UBS Maria das Dores fica do outro lado da avenida, à direita do bar do Rodolfo.' : 'Entre no hospital pela porta principal e siga as placas do saguão.'}</p>
    ${controlesHTML()}
    <button class="btn big" id="inGo">Começar o plantão</button></div></div>`, 'full');
  $('#inGo').onclick = () => startExplore(false);
}
function showIntroVest() {
  setOverlay(`<div class="screen intro"><div class="panel story">
    <p class="eyebrow">Modo Vestibulando</p><h2>${U.esc(S.player.name)}, bem-vindo(a) ao ${HOSPITAL_NOME}</h2>
    <p>Aqui não há estágios em sequência nem missões: todas as portas estão abertas. UPA, Pediatria, GO, Clínica Médica, Cirurgia e UBS têm pacientes esperando atendimento nos leitos, e emergências podem surgir a qualquer momento. Os preceptores, residentes e o Rodolfo continuam por aí, com as mesmas histórias de sempre.</p>
    <p>Os outros jogadores do Modo Vestibulando aparecem no mapa com o nome sobre a cabeça. No bar do Rodolfo, chegue perto de alguém e aperte <kbd>${TECLA_E()}</kbd> para um duelo de perguntas. Quem tiver mais pontos de reputação entre os jogadores online ganha a placa dourada de <b>Melhor Interno</b>.</p>
    ${controlesHTML()}
    <button class="btn big" id="inGo">Entrar no hospital</button></div></div>`, 'full');
  $('#inGo').onclick = () => startExplore(false);
}
function startExplore(loaded) {
  telaCheia();
  setOverlay(''); G.mode = 'explore';
  G.player = null; enterMap(S.map.id, S.map.x, S.map.y, S.map.dir);
  clampVitals(); if (!loaded) { S.vida = stats().vidaMax; S.energia = stats().energiaMax; }
  $('#hud').hidden = false;
  const a = currentArea(); const st = a && chainStep(a);
  if (st && st.tipo === 'find') setupMainFind(st);
  if (!loaded && isVest()) setTimeout(() => toast('<b>Modo Vestibulando</b><br><small>Todos os setores estão abertos. Procure os leitos com paciente e aperte ' + TECLA_E() + ' para atender.</small>', 'quest'), 600);
  else if (!loaded && st) setTimeout(() => toast(`<b>Missão:</b> ${st.titulo}<br><small>${st.desc}</small>`, 'quest'), 600);
  else toast(`Bem-vindo(a) de volta, ${U.esc(S.player.name)}!`);
  if (loaded && !isVest() && S.flags.novoEstagio && AREAS[S.flags.novoEstagio]) { const A = AREAS[S.flags.novoEstagio]; delete S.flags.novoEstagio; setTimeout(() => toast(`<b>Novo estágio no internato:</b> ${A.nome} (${A.local})<br><small>Ele entrou como o ${S.order.indexOf(A.id) + 1}º estágio da sua sequência. A UBS fica do outro lado da avenida, ao lado do bar.</small>`, 'quest'), 1400); }
  saveGame();
}

/* ---------------- HUD ---------------- */
function updateHUD() {
  if (!S || !G.map) return;
  const st = stats(); const L = st.nivel;
  const xpA = BAL.xpForLevel(L), xpB = BAL.xpForLevel(L + 1);
  const set = (id, v) => { const e = document.getElementById(id); if (e && e.textContent !== String(v)) e.textContent = v; };
  set('hName', S.player.name); set('hLvl', 'Nv ' + L);
  const bar = (id, v, m) => { const e = document.getElementById(id); if (e) e.style.width = U.clamp(v / m * 100, 0, 100) + '%'; };
  bar('hVida', S.vida, st.vidaMax); set('hVidaT', `${Math.round(S.vida)}/${st.vidaMax}`);
  bar('hEn', S.energia, st.energiaMax); set('hEnT', `${Math.round(S.energia)}/${st.energiaMax}`);
  bar('hXp', S.xpTotal - xpA, xpB - xpA); set('hXpT', `XP ${S.xpTotal - xpA}/${xpB - xpA} · disp. ${S.xpAvail}`);
  set('hCoins', S.coins);
  const r = S.rep; const rf = document.getElementById('hRepFill');
  if (rf) { rf.style.left = (r < 0 ? 50 + r / 20 : 50) + '%'; rf.style.width = Math.abs(r) / 20 + '%'; rf.className = r < 0 ? 'neg' : 'pos'; }
  set('hRepT', `${r > 0 ? '+' : ''}${r} · ${repClass()}`);
  const rt = document.getElementById('hRepT'); if (rt) rt.className = r < 0 ? 'neg' : 'pos';
  const a = currentArea(); const stp = a && chainStep(a);
  const obj = document.getElementById('hObj');
  if (obj) {
    let h = '';
    if (isVest()) h = `<span class="tag" style="--ac:#ffcf3a">VEST</span> <b>Mapa aberto</b> (${S.stats.cases} caso${S.stats.cases === 1 ? '' : 's'})<small>Todos os setores liberados</small>`;
    else if (!a) h = '<b>Internato concluído!</b>';
    else if (stp) { const p = prog(a); const extra = stp.tipo === 'cases' ? ` (${p.cases}/${stp.n})` : stp.tipo === 'side' ? ` (${p.side}/${stp.n})` : stp.tipo === 'duvidas' ? ` (${p.duv || 0}/${stp.n})` : stp.tipo === 'open' ? ` (${stp.alvo.filter(k => p.opened[k]).length}/${stp.alvo.length})` : ''; h = `<span class="tag" style="--ac:${AREAS[a].cor}">${AREAS[a].curto}</span> <b>${U.esc(stp.titulo)}</b>${extra}<small>${U.esc(stp.local)}</small>`; }
    if (obj.dataset.h !== h) { obj.innerHTML = h; obj.dataset.h = h; }
  }
  const sq = document.getElementById('sideq');
  if (sq) {
    const psy = G.psy && !G.psy.attending ? `<div class="sq urg psyq"><b>⚠ ${G.psy.kind === 'emerg' ? 'Emergência' : 'Crise psicótica'}: ${U.esc(G.psy.P.nome)}${G.psy.map !== G.map.id ? ' (' + U.esc(MAPS[G.psy.map].nome) + ')' : ''}</b><span class="sq-t">${U.fmtTime(Math.max(0, G.psy.t))}</span><i style="width:${G.psy.t / BAL.psyTime * 100}%"></i></div>` : '';
    const h = psy + S.side.map(q => { const frac = q.t / q.prazo; return `<div class="sq ${frac < 0.25 ? 'urg' : ''}"><b>${U.esc(q.titulo)}</b><span class="sq-t">${U.fmtTime(q.t)}</span><i style="width:${frac * 100}%"></i></div>`; }).join('');
    if (sq.innerHTML !== h) sq.innerHTML = h;
  }
}
function updateLocationHUD() { const e = document.getElementById('hLoc'); if (e && G.map) e.textContent = G.map.nome; }

/* ---------------- Diálogo ---------------- */
function startDialog(npcId, falas, onEnd, choices, npcObj) {
  const n = npcObj || G.npcs.find(x => x.id === npcId) || NPCS_DEF.find(x => x.id === npcId) || { nome: '...', look: {} };
  const nome = n.nome || (BOSSES[npcId] && BOSSES[npcId].nome) || '...';
  const look = typeof n.look === 'string' ? LOOKS[n.look] : n.look;
  const slow = npcId === 'leozao' && !S.flags.leoRevealed;
  if (npcId === 'leozao' && S.areaStep.upa >= 11) S.flags.leoRevealed = true;
  const prevMode = G.mode; G.mode = 'dialog';
  let i = 0, typing = null;
  const box = U.el('div', 'dialog');
  box.innerHTML = `<div class="dlg-port"></div><div class="dlg-body"><b class="dlg-name">${U.esc(nome)}</b><p class="dlg-text"></p><div class="dlg-ch"></div><span class="dlg-next">${IS_TOUCH ? 'toque para continuar ▸' : 'E / Espaço ▸'}</span></div>`;
  box.querySelector('.dlg-port').appendChild(portraitCanvas(look, 92, 92, { crop: true, scale: 5 }));
  document.getElementById('stage').appendChild(box);
  const tEl = box.querySelector('.dlg-text');
  const fill = s => s.replace(/\{nome\}/g, S.player.name);
  let gen = 0;
  const show = () => {
    const my = ++gen; const txt = fill(falas[i]); let k = 0, wait = 0; tEl.textContent = '';
    clearInterval(typing);
    typing = setInterval(() => {
      if (my !== gen || !box.isConnected) { clearInterval(typing); return; }
      if (wait > 0) { wait--; return; }   // pausa dramática do Leão (sem temporizadores paralelos)
      if (k >= txt.length) { clearInterval(typing); typing = null; if (i === falas.length - 1 && choices) showChoices(); return; }
      const ch = txt[k++]; tEl.textContent += ch; if (k % 3 === 0) SFX.play('talk');
      if (slow) { if (ch === '.') wait = 4; else if (ch === ',') wait = 2; }
    }, slow ? 42 : 18);
  };
  const showChoices = () => {
    const c = box.querySelector('.dlg-ch'); c.innerHTML = choices.map((ch, j) => `<button class="btn ch" data-j="${j}">${U.esc(ch.t)}</button>`).join('');
    box.querySelector('.dlg-next').hidden = true;
    c.querySelectorAll('button').forEach(b => b.onclick = e => { e.stopPropagation(); finish(); const ch = choices[+b.dataset.j]; ch.f && ch.f(); });
  };
  const finish = () => { gen++; clearInterval(typing); typing = null; box.remove(); G.dialog = null; if (G.mode === 'dialog') G.mode = prevMode === 'dialog' ? 'explore' : prevMode; G.keys = {}; };
  const next = () => {
    if (typing) { gen++; clearInterval(typing); typing = null; tEl.textContent = fill(falas[i]); if (i === falas.length - 1 && choices) showChoices(); return; }
    if (i === falas.length - 1 && choices) return;
    i++; if (i >= falas.length) { finish(); onEnd && onEnd(); return; } show();
  };
  box.onclick = next; G.dialog = { next };
  show();
}

/* ---------------- Painéis ---------------- */
function openPanel(name, title, body, opts = {}) {
  if (!['explore', 'panel'].includes(G.mode)) { if (['encounter', 'boss', 'proc', 'combat'].includes(G.mode) && ['map', 'inv', 'skills', 'journal'].includes(name)) toast('Indisponível durante encontros, procedimentos e batalhas.', 'bad'); return null; }
  G.mode = 'panel'; G.panelName = name;
  const o = setOverlay(`<div class="panel ${opts.cls || ''}" role="dialog" aria-label="${U.esc(title)}"><header class="p-head"><h2>${title}</h2>${opts.tabs || ''}<button class="x" id="pClose" aria-label="Fechar">✕</button></header><div class="p-body">${body}</div></div>`, 'dim');
  $('#pClose').onclick = () => closeOverlay();
  if (['map', 'journal', 'skills'].includes(name)) onMainEvent('open', { panel: name });
  SFX.play('ui');
  return o;
}
function togglePanel(name) {
  if (G.mode === 'panel' && G.panelName === name) return closeOverlay();
  if (G.mode === 'panel') closeOverlay();
  ({ map: openMap, inv: openInventory, journal: openJournal, skills: openSkills, status: openStatus, pause: openPause, caderno: openCaderno })[name]();
}

/* ---------- Inventário ---------- */
let INVSEL = null, INVF = 'todos';
function openInventory() {
  const st = stats();
  const slot = k => { const id = S.equip[k]; const it = id && ITEMS[id]; return `<button class="eq-slot ${INVSEL === 'eq:' + k ? 'sel' : ''}" data-eq="${k}" style="--rc:${it ? RARIDADES[it.rar].cor : '#3a4552'}"><small>${CAT_NOME[k]}</small>${it ? icon(it.icon, 32) + `<span>${it.nome}</span>` : '<span class="empty">vazio</span>'}</button>`; };
  const filt = [['todos', 'Todos'], ['mao', 'Mão'], ['cabeca', 'Cabeça'], ['corpo', 'Corpo'], ['amuleto', 'Amuletos'], ['consumivel', 'Consumíveis'], ['missao', 'Missão'], ['material', 'Materiais']];
  const grid = S.inv.map((s, i) => { const it = s && ITEMS[s.id]; const dim = it && INVF !== 'todos' && it.cat !== INVF; return `<div class="slot ${INVSEL === i ? 'sel' : ''} ${dim ? 'dim' : ''} ${it && it.cat === 'missao' ? 'quest' : ''}" data-i="${i}" draggable="${!!it}" style="--rc:${it ? RARIDADES[it.rar].cor : 'transparent'}">${it ? icon(it.icon, 32) + (s.q > 1 ? `<b class="q">${s.q}</b>` : '') : ''}</div>`; }).join('');
  const body = `<div class="inv">
    <aside class="inv-eq"><div class="inv-char"></div>${slot('mao')}${slot('cabeca')}${slot('corpo')}${slot('amuleto')}
      <dl class="mini-stats"><dt>Vida</dt><dd>${Math.round(S.vida)}/${st.vidaMax}</dd><dt>Energia</dt><dd>${Math.round(S.energia)}/${st.energiaMax}</dd><dt>Foco</dt><dd>${st.foco}</dd><dt>Conhecimento</dt><dd>${st.conhecimento}</dd><dt>Precisão</dt><dd>${st.precisao}</dd><dt>Resistência</dt><dd>${st.resistencia}</dd><dt>Influência</dt><dd>${st.influencia}</dd></dl></aside>
    <section class="inv-main"><div class="filters">${filt.map(([k, n]) => `<button class="chip ${INVF === k ? 'on' : ''}" data-f="${k}">${n}</button>`).join('')}<button class="chip" id="invSort">Organizar</button></div>
      <div class="grid">${grid}</div><p class="hint">${S.inv.filter(Boolean).length}/${INV_SIZE} espaços ocupados · arraste para reorganizar · clique para inspecionar</p></section>
    <aside class="inv-det">${invDetail()}</aside></div>`;
  openPanel('inv', 'Inventário', body, { cls: 'wide' });
  OV().querySelector('.inv-char').appendChild(portraitCanvas(playerLook(), 96, 120, { scale: 4 }));
  OV().querySelectorAll('.slot').forEach(el => {
    el.onclick = () => { const i = +el.dataset.i; if (typeof INVSEL === 'number' && INVSEL !== i && !S.inv[i]) { S.inv[i] = S.inv[INVSEL]; S.inv[INVSEL] = null; INVSEL = i; } else INVSEL = S.inv[i] ? i : null; reopen(openInventory); };
    el.ondragstart = e => e.dataTransfer.setData('text/plain', el.dataset.i);
    el.ondragover = e => e.preventDefault();
    el.ondrop = e => { e.preventDefault(); const a = +e.dataTransfer.getData('text/plain'), b = +el.dataset.i; [S.inv[a], S.inv[b]] = [S.inv[b], S.inv[a]]; INVSEL = b; reopen(openInventory); };
  });
  OV().querySelectorAll('[data-eq]').forEach(el => el.onclick = () => { INVSEL = 'eq:' + el.dataset.eq; reopen(openInventory); });
  OV().querySelectorAll('[data-f]').forEach(el => el.onclick = () => { INVF = el.dataset.f; reopen(openInventory); });
  $('#invSort').onclick = () => { const order = ['mao', 'cabeca', 'corpo', 'amuleto', 'consumivel', 'missao', 'material']; const rr = ['lendario', 'epico', 'raro', 'incomum', 'comum']; const items = S.inv.filter(Boolean).sort((a, b) => order.indexOf(ITEMS[a.id].cat) - order.indexOf(ITEMS[b.id].cat) || rr.indexOf(ITEMS[a.id].rar) - rr.indexOf(ITEMS[b.id].rar)); S.inv = items.concat(Array(INV_SIZE - items.length).fill(null)); INVSEL = null; reopen(openInventory); };
  bindInvDetail();
}
function reopen(fn) { G.mode = 'explore'; fn(); }
function itemCard(it, extra = '') {
  return `<div class="item-card" style="--rc:${RARIDADES[it.rar].cor}"><div class="ic-head">${icon(it.icon, 48)}<div><b>${it.nome}</b><div>${rarTag(it.rar)} <span class="cat">${CAT_NOME[it.cat]}</span></div></div></div>
    <p class="ic-desc">${it.desc}</p><p class="ic-fx">${it.efeito}</p>${Object.keys(it.stats).length ? `<p class="ic-stats">${statsLine(it.stats)}</p>` : ''}${it.req && it.req.nivel ? `<p class="ic-req ${level() < it.req.nivel ? 'neg' : ''}">Requer nível ${it.req.nivel}</p>` : ''}${extra}</div>`;
}
function invDetail() {
  if (INVSEL === null || INVSEL === undefined) return '<p class="hint">Selecione um item para ver detalhes, comparar e equipar.</p>';
  if (typeof INVSEL === 'string') { const k = INVSEL.slice(3), id = S.equip[k]; if (!id) return '<p class="hint">Slot vazio.</p>'; const it = ITEMS[id]; return itemCard(it, `<div class="row"><button class="btn" id="dUn">Desequipar</button>${it.cores ? '<button class="btn ghost" id="dCor">Mudar cor</button>' : ''}</div>`); }
  const s = S.inv[INVSEL]; if (!s) return '<p class="hint">Espaço vazio.</p>';
  const it = ITEMS[s.id];
  let cmp = '';
  if (EQUIP_SLOTS.includes(it.cat)) {
    const cur = S.equip[it.cat] && ITEMS[S.equip[it.cat]]; const keys = new Set([...Object.keys(it.stats), ...Object.keys(cur ? cur.stats : {})]);
    cmp = `<div class="cmp"><small>Comparação com ${cur ? cur.nome : 'slot vazio'}:</small> ${[...keys].map(k => { const d = (it.stats[k] || 0) - ((cur && cur.stats[k]) || 0); return d ? `<span class="${d > 0 ? 'pos' : 'neg'}">${d > 0 ? '+' : ''}${d} ${STAT_NOME[k]}</span>` : ''; }).join(' ') || '<span>sem diferença de atributos</span>'}</div>`;
  }
  const btns = EQUIP_SLOTS.includes(it.cat) ? '<button class="btn" id="dEq">Equipar</button>' : it.cat === 'consumivel' ? '<button class="btn" id="dUse">Usar</button>' : '';
  const sell = it.vendavel === false || it.cat === 'missao' ? `<p class="hint">${it.cat === 'missao' ? 'Item de missão: protegido contra venda.' : 'Item exclusivo: não pode ser vendido.'}</p>` : `<p class="hint">Valor de venda no Rodolfo: ${Math.round(it.preco * BAL.sellFactor)} ${MOEDA_CURTA}</p>`;
  return itemCard(it, cmp + sell + `<div class="row">${btns}${it.cores ? '<button class="btn ghost" id="dCor">Mudar cor</button>' : ''}</div>`);
}
function bindInvDetail() {
  const b = id => document.getElementById(id);
  if (b('dEq')) b('dEq').onclick = () => { equipFromSlot(INVSEL); INVSEL = null; reopen(openInventory); };
  if (b('dUse')) b('dUse').onclick = () => { useConsumable(INVSEL); if (!S.inv[INVSEL]) INVSEL = null; reopen(openInventory); };
  if (b('dUn')) b('dUn').onclick = () => { unequip(INVSEL.slice(3)); INVSEL = null; reopen(openInventory); };
  if (b('dCor')) b('dCor').onclick = () => ligaColorBox(() => reopen(openInventory));
}
function ligaColorBox(done) {
  const box = U.el('div', 'confirm', `<div class="panel small"><h3>Cor do pijama de liga</h3><div class="chips">${Object.entries(LIGA_COLORS).map(([n, c]) => `<button class="chip ${S.ligaColor === n ? 'on' : ''}" data-c="${n}"><i style="--c:${c}"></i>${n}</button>`).join('')}</div></div>`);
  OV().appendChild(box);
  box.querySelectorAll('[data-c]').forEach(el => el.onclick = () => { S.ligaColor = el.dataset.c; refreshPlayerLook(); box.remove(); done && done(); });
}

/* ---------- Árvore de habilidades ---------- */
let SKT = 'med', SKSEL = null;
function openSkills() {
  const tree = Object.values(SKILLS).filter(s => s.arv === SKT).sort((a, b) => a.n - b.n);
  const pos = n => { const r = Math.floor((n - 1) / 5), c = (n - 1) % 5; return [r % 2 ? 4 - c : c, r]; };
  const W = 5, H = 4, cw = 132, ch = 94;
  let lines = '';
  for (const s of tree) for (const rq of s.req) { const a = SKILLS[rq]; if (!a || a.arv !== SKT) continue; const [x1, y1] = pos(a.n), [x2, y2] = pos(s.n); lines += `<line x1="${x1 * cw + cw / 2}" y1="${y1 * ch + ch / 2}" x2="${x2 * cw + cw / 2}" y2="${y2 * ch + ch / 2}" class="${S.skills[rq] ? 'on' : ''}"/>`; }
  const nodes = tree.map(s => { const [x, y] = pos(s.n); const stt = skillStatus(s.id); return `<button class="sk-node ${stt} ${SKSEL === s.id ? 'sel' : ''}" data-s="${s.id}" style="left:${x * cw + 6}px;top:${y * ch + 8}px"><span class="sk-n">${s.n}</span><b>${s.nome}</b><small>${stt === 'aprendida' ? '✓ aprendida' : s.custo + ' XP'}</small></button>`; }).join('');
  const sel = SKSEL && SKILLS[SKSEL] && SKILLS[SKSEL].arv === SKT ? SKILLS[SKSEL] : tree.find(s => skillStatus(s.id) === 'disponivel') || tree.find(s => !S.skills[s.id]) || tree[0];
  const stt = skillStatus(sel.id);
  const stName = { aprendida: 'Aprendida', disponivel: 'Disponível', xp: 'XP insuficiente', nivel: `Requer nível ${sel.nivel}`, bloqueada: 'Pré-requisito pendente' }[stt];
  const det = `<div class="sk-det" style="--tc:${SKILL_TREES[SKT].cor}"><p class="eyebrow">${SKILL_TREES[SKT].nome} · ${sel.n}/20</p><h3>${sel.nome}</h3><p>${sel.efeito}</p>
    <dl><dt>Custo</dt><dd>${sel.custo} XP</dd><dt>Nível mínimo</dt><dd>${sel.nivel}</dd><dt>Pré-requisitos</dt><dd>${sel.req.map(r => SKILLS[r].nome + (S.skills[r] ? ' ✓' : '')).join(', ') || 'nenhum'}</dd><dt>Estado</dt><dd>${stName}</dd>${sel.acao ? `<dt>Ação de batalha</dt><dd>${COMBAT_ACTIONS[sel.acao].nome}</dd>` : ''}</dl>
    <button class="btn" id="skLearn" ${stt === 'disponivel' ? '' : 'disabled'}>Aprender (${sel.custo} XP)</button></div>`;
  const tabs = `<nav class="tabs">${Object.entries(SKILL_TREES).map(([k, t]) => `<button class="tab ${SKT === k ? 'on' : ''}" data-t="${k}" style="--tc:${t.cor}">${t.nome} <small>${Object.values(SKILLS).filter(s => s.arv === k && S.skills[s.id]).length}/20</small></button>`).join('')}</nav>`;
  const body = `<div class="skills" style="--tc:${SKILL_TREES[SKT].cor}"><div class="sk-top"><p>${SKILL_TREES[SKT].desc}</p><p class="xpav">XP disponível: <b>${S.xpAvail}</b> · Nível ${level()}</p></div>
    <div class="sk-wrap"><div class="sk-board" style="width:${W * cw}px;height:${H * ch}px"><svg width="${W * cw}" height="${H * ch}">${lines}</svg>${nodes}</div>${det}</div></div>`;
  openPanel('skills', 'Árvores de Habilidades', body, { cls: 'wide', tabs });
  OV().querySelectorAll('[data-t]').forEach(b => b.onclick = () => { SKT = b.dataset.t; SKSEL = null; reopen(openSkills); });
  OV().querySelectorAll('[data-s]').forEach(b => b.onclick = () => { SKSEL = b.dataset.s; reopen(openSkills); });
  $('#skLearn').onclick = () => { if (learnSkill(sel.id)) { SKSEL = sel.id; reopen(openSkills); } };
}

/* ---------- Mapa ---------- */
let MAPTAB = 'local';
function openMap() {
  const tabs = `<nav class="tabs"><button class="tab ${MAPTAB === 'local' ? 'on' : ''}" data-m="local">${U.esc(G.map.nome)}</button><button class="tab ${MAPTAB === 'mundo' ? 'on' : ''}" data-m="mundo">Mundo</button></nav>`;
  const body = `<div class="mapview"><canvas id="mapCv" class="pix"></canvas><div class="map-legend"><span><i class="lg me"></i>Você</span><span><i class="lg main"></i>Missão principal</span><span><i class="lg side"></i>Missão secundária</span><span><i class="lg pac"></i>Paciente aguardando</span><span><i class="lg lock"></i>Estágio trancado</span></div></div>`;
  openPanel('map', 'Mapa', body, { cls: 'wide', tabs });
  OV().querySelectorAll('[data-m]').forEach(b => b.onclick = () => { MAPTAB = b.dataset.m; reopen(openMap); });
  if (MAPTAB === 'local') drawLocalMap(); else drawWorldMap();
}
function drawLocalMap() {
  const M = G.map, cv = $('#mapCv'); const s = Math.max(4, Math.min(16, Math.floor(Math.min(980 / M.w, 520 / M.h))));
  cv.width = M.w * s; cv.height = M.h * s; const c = cv.getContext('2d');
  const th = THEMES[M.theme];
  const fc = { '.': (th.f1 || ['', '#cfc'])[1], ',': (th.f2 || th.f1 || ['', '#ddd'])[1], ':': (th.f3 || th.f1 || ['', '#ccd'])[1], 'D': '#ffe68a', '_': '#c9c5bb', '=': '#4a4d52', 'g': '#6fae4a', 'z': '#eeeeea' };
  c.fillStyle = '#10131a'; c.fillRect(0, 0, cv.width, cv.height);
  for (let j = 0; j < M.h; j++) for (let i = 0; i < M.w; i++) { const t = M.t(i, j); c.fillStyle = isWall(t) ? '#2c3440' : (fc[t] || '#10131a'); c.fillRect(i * s, j * s, s, s); }
  for (const o of M.objs) { c.fillStyle = o.solid ? 'rgba(20,24,32,0.35)' : 'rgba(255,255,255,0.12)'; c.fillRect(o.x * s + 1, o.y * s + 1, o.w * s - 2, o.h * s - 2); }
  for (const w of M.warps) { c.fillStyle = AREAS[w.to] && !areaUnlocked(w.to) ? '#e0453a' : '#ffe68a'; c.fillRect(w.x * s, w.y * s, w.w * s, w.h * s); }
  c.font = `${Math.max(9, s * 1.1)}px "Silkscreen", monospace`; c.textAlign = 'center';
  for (const l of M.labels) { if (!l.rw && M.id !== 'rua') continue; const tx = l.x * s, ty = l.y * s; c.fillStyle = 'rgba(10,12,18,0.7)'; const w = c.measureText(l.nome).width + 8; c.fillRect(tx - w / 2, ty - s * 1.1, w, s * 1.6); c.fillStyle = '#f4efe2'; c.fillText(l.nome, tx, ty + 2); }
  for (const w of M.warps) { const nm = w.to === 'rua' ? 'Saída' : MAPS[w.to].nome; c.fillStyle = '#ffe68a'; c.fillText((AREAS[w.to] && !areaUnlocked(w.to) ? '🔒 ' : '') + nm, (w.x + w.w / 2) * s, (w.y + (w.y < 2 ? 3.2 : -0.6)) * s); }
  for (const sp of G.spots) if (sp.s.active && sp.obj.spot === 'caso') { c.fillStyle = '#ff5a5a'; c.fillRect((sp.obj.x + 0.25) * s, (sp.obj.y + 0.25) * s, s / 2, s / 2); }
  for (const t of questTargetsInMap()) { c.fillStyle = t.k === 'main' ? '#ffcf3a' : '#7af0ff'; c.beginPath(); c.arc(t.x * s, (t.y + 1.2) * s, s * 0.6, 0, 7); c.fill(); }
  const P = G.player; c.fillStyle = '#ffffff'; c.beginPath(); c.arc(P.x * s, (P.y - 0.3) * s, s * 0.7, 0, 7); c.fill(); c.fillStyle = '#e0453a'; c.beginPath(); c.arc(P.x * s, (P.y - 0.3) * s, s * 0.4, 0, 7); c.fill();
}
function drawWorldMap() {
  const cv = $('#mapCv'); cv.width = 760; cv.height = 440; const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  // terreno em grade (estilo mapa-múndi de plataforma)
  for (let j = 0; j < 22; j++) for (let i = 0; i < 38; i++) { c.fillStyle = (i + j) % 2 ? '#5fa84a' : '#67b052'; c.fillRect(i * 20, j * 20, 20, 20); }
  c.fillStyle = '#4a4d52'; c.fillRect(0, 250, 760, 46); for (let i = 0; i < 38; i += 2) { c.fillStyle = '#f0d24a'; c.fillRect(i * 20 + 4, 271, 18, 4); }
  c.fillStyle = '#c9c5bb'; c.fillRect(0, 238, 760, 12); c.fillRect(0, 296, 760, 12);
  const nodes = {
    rua: { x: 380, y: 272, nome: 'Avenida', cor: '#c9c5bb', ico: '◎' }, lobby: { x: 470, y: 160, nome: 'Saguão', cor: '#ebe5d5', ico: 'H' },
    upa: { x: 130, y: 170, nome: 'UPA', cor: AREAS.upa.cor, ico: AREAS.upa.icone, a: 'upa' }, ped: { x: 300, y: 110, nome: 'Pediatria', cor: AREAS.ped.cor, ico: AREAS.ped.icone, a: 'ped' },
    go: { x: 420, y: 50, nome: 'GO', cor: AREAS.go.cor, ico: AREAS.go.icone, a: 'go' }, cm: { x: 560, y: 50, nome: 'Clínica', cor: AREAS.cm.cor, ico: AREAS.cm.icone, a: 'cm' },
    cir: { x: 660, y: 140, nome: 'Cirurgia', cor: AREAS.cir.cor, ico: AREAS.cir.icone, a: 'cir' }, bar: { x: 260, y: 360, nome: 'Bar do Rodolfo', cor: '#e0b866', ico: '$' },
    ubs: { x: 540, y: 360, nome: 'UBS', cor: AREAS.ubs.cor, ico: AREAS.ubs.icone, a: 'ubs' },
  };
  const edges = [['rua', 'lobby'], ['rua', 'upa'], ['rua', 'bar'], ['rua', 'ubs'], ['lobby', 'ped'], ['lobby', 'go'], ['lobby', 'cm'], ['lobby', 'cir']];
  c.lineWidth = 6; c.setLineDash([6, 6]); c.strokeStyle = '#f7f1d8';
  for (const [a, b] of edges) { c.beginPath(); c.moveTo(nodes[a].x, nodes[a].y); c.lineTo(nodes[b].x, nodes[b].y); c.stroke(); }
  c.setLineDash([]);
  c.font = '12px "Silkscreen", monospace'; c.textAlign = 'center';
  for (const [k, n] of Object.entries(nodes)) {
    const locked = n.a && !areaUnlocked(n.a), done = n.a && S.completed[n.a];
    c.fillStyle = '#1b1622'; c.fillRect(n.x - 30, n.y - 26, 60, 52);
    c.fillStyle = locked ? '#6a6f78' : n.cor; c.fillRect(n.x - 27, n.y - 23, 54, 46);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(n.x - 27, n.y - 23, 54, 6);
    c.fillStyle = '#1b1622'; c.font = '22px monospace'; c.fillText(locked ? '🔒' : n.ico, n.x, n.y + 8);
    c.font = '12px "Silkscreen", monospace'; c.fillStyle = '#1b1622'; c.fillRect(n.x - 52, n.y + 30, 104, 18); c.fillStyle = '#f7f1d8'; c.fillText(n.nome, n.x, n.y + 43);
    if (n.a && !isVest()) { const idx = S.order.indexOf(n.a) + 1; c.fillStyle = '#ffcf3a'; c.beginPath(); c.arc(n.x + 26, n.y - 24, 11, 0, 7); c.fill(); c.fillStyle = '#1b1622'; c.fillText(idx, n.x + 26, n.y - 20); if (done) { c.fillStyle = '#ffcf3a'; c.font = '20px monospace'; c.fillText('★', n.x - 26, n.y - 16); c.font = '12px "Silkscreen", monospace'; } }
  }
  const here = G.map.id; const hn = nodes[here] || nodes.rua; const b = Math.sin(G.t * 6) * 3;
  const sp = SPR.char(playerLook(), 0, 0, 'idle'); c.drawImage(sp, hn.x - SW / 2, hn.y - 70 + b);
}

/* ---------- Diário ---------- */
function openJournalVest() {
  const s = S.stats;
  const setores = AREA_IDS.map(a => { const tot = CASES.filter(c => c.area === a).length, vistos = CASES.filter(c => c.area === a && S.seen.includes(c.id)).length; return `<li class="done" style="--ac:${AREAS[a].cor}"><span class="n">${AREAS[a].icone}</span><b>${AREAS[a].nome}</b><small>Aberto · ${vistos} de ${tot} casos já atendidos</small></li>`; }).join('');
  const body = `<div class="journal"><section><h3>Modo Vestibulando</h3><p class="hint">Sem campanha e sem missões: atenda os pacientes de qualquer setor, responda às emergências e desafie outros jogadores no bar do Rodolfo. A reputação decide quem leva a placa de Melhor Interno entre os jogadores online.</p><h3>Setores</h3><ol class="camp">${setores}</ol></section>
    <section><h3>Estatísticas</h3><dl class="stat-grid"><dt>Casos atendidos</dt><dd>${s.cases}</dd><dt>Diagnósticos corretos</dt><dd>${s.dxOk}</dd><dt>Condutas corretas</dt><dd>${s.cdOk}</dd><dt>Procedimentos</dt><dd>${s.procs}</dd><dt>Melhor sequência</dt><dd>${s.best}</dd><dt>Reputação</dt><dd>${S.rep > 0 ? '+' : ''}${S.rep} (${repClass()})</dd><dt>Duelos vencidos</dt><dd>${(S.duelos && S.duelos.vitorias) || 0}</dd><dt>Tempo de jogo</dt><dd>${U.fmtHM(S.playTime)}</dd></dl></section></div>`;
  openPanel('journal', 'Diário do Vestibulando', body, { cls: 'wide' });
}
function openJournal() {
  if (isVest()) return openJournalVest();
  const cur = currentArea();
  const camp = S.order.map((a, i) => { const st = S.completed[a] ? 'done' : a === cur ? 'cur' : 'lock'; return `<li class="${st}" style="--ac:${AREAS[a].cor}"><span class="n">${i + 1}</span><b>${AREAS[a].nome}</b><small>${st === 'done' ? 'Concluído ★' : st === 'cur' ? 'Estágio atual' : 'Trancado'} · Chefe: ${BOSSES[AREAS[a].chefe].nome}${S.completed[a] ? ' (derrotado)' : ''}</small></li>`; }).join('');
  let steps = '';
  if (cur) {
    const p = prog(cur), idx = areaStepIdx(cur);
    steps = CHAINS[cur].map((s, i) => { const st = i < idx ? 'done' : i === idx ? 'cur' : 'todo'; const extra = st === 'cur' ? (s.tipo === 'cases' ? ` — ${p.cases}/${s.n}` : s.tipo === 'side' ? ` — ${p.side}/${s.n}` : s.tipo === 'duvidas' ? ` — ${p.duv || 0}/${s.n}` : '') : ''; return `<li class="${st}"><span class="ck">${st === 'done' ? '✓' : st === 'cur' ? '▶' : '·'}</span><div><b>${s.titulo}${extra}</b>${st === 'cur' ? `<p>${s.desc}</p><small>Local: ${s.local}</small>` : ''}${s.tipo === 'boss' ? '<small class="boss">Chefe final</small>' : ''}</div></li>`; }).join('');
  }
  const side = S.side.map(q => `<li><div><b>${U.esc(q.titulo)}</b> <span class="sq-t">${U.fmtTime(q.t)}</span><p>${U.esc(q.desc)}</p>${q.steps[q.i] && q.steps[q.i].dica ? `<small>Próximo passo: ${U.esc(q.steps[q.i].dica)}</small>` : ''}<small>Recompensa: ~${q.rec.xp} XP, ${q.rec.coins} ${MOEDA_CURTA}, +${q.rec.rep} reputação</small></div><button class="btn ghost small" data-dec="${q.id}">${S.playTime - q.criado <= 20 ? 'Recusar (grátis)' : 'Abandonar'}</button></li>`).join('') || '<li class="empty">Nenhuma missão secundária ativa. Elas surgem enquanto você explora os setores.</li>';
  const s = S.stats;
  const body = `<div class="journal"><section><h3>Campanha</h3><ol class="camp">${camp}</ol>
    <h3>Estatísticas</h3><dl class="stat-grid"><dt>Casos atendidos</dt><dd>${s.cases}</dd><dt>Diagnósticos corretos</dt><dd>${s.dxOk}</dd><dt>Condutas corretas</dt><dd>${s.cdOk}</dd><dt>Procedimentos</dt><dd>${s.procs}</dd><dt>Missões secundárias</dt><dd>${S.sideDone} (${S.sideFail} expiradas)</dd><dt>Melhor sequência</dt><dd>${s.best}</dd><dt>Tempo de campanha</dt><dd>${U.fmtHM(S.playTime)}</dd></dl></section>
    <section><h3>${cur ? 'Missões principais — ' + AREAS[cur].nome : 'Campanha concluída'}</h3><ol class="steps">${steps}</ol><h3>Missões secundárias</h3><ul class="sides">${side}</ul></section></div>`;
  openPanel('journal', 'Diário de Missões', body, { cls: 'wide' });
  OV().querySelectorAll('[data-dec]').forEach(b => b.onclick = () => { const q = S.side.find(x => x.id === +b.dataset.dec); if (q) declineSide(q); reopen(openJournal); });
}

/* ---------- Ficha / Status ---------- */
function openStatus() {
  const st = stats(), L = st.nivel;
  const row = (n, v, f) => `<tr><th>${n}</th><td>${v}</td><td class="f">${f}</td></tr>`;
  const ach = CONQUISTAS.map(a => `<li class="${S.ach[a.id] ? 'on' : ''}"><b>${S.ach[a.id] ? '🏆' : '🔒'} ${a.nome}</b><small>${a.desc}</small></li>`).join('');
  const body = `<div class="status"><section class="st-left"><div class="st-char"></div><div class="badge-card"><span class="bc-top">${HOSPITAL_NOME}</span><b>${U.esc(S.player.name)}</b><span class="bc-role">INTERNO</span></div>
    <div class="repbox"><b>Reputação do Interno</b><div class="repbar big"><span class="mid"></span><i class="${S.rep < 0 ? 'neg' : 'pos'}" style="left:${S.rep < 0 ? 50 + S.rep / 20 : 50}%;width:${Math.abs(S.rep) / 20}%"></i></div><p class="${S.rep < 0 ? 'neg' : 'pos'}">${S.rep > 0 ? '+' : ''}${S.rep} · ${repClass()}</p>
    <small>XP x${BAL.xpMult(S.rep).toFixed(2)} · Moedas x${BAL.coinMult(S.rep).toFixed(2)} · Drop x${BAL.dropMult(S.rep).toFixed(2)} · Inimigos x${BAL.enemyMult(S.rep).toFixed(2)} · Borrões ${Math.round(BAL.blurRate(S.rep) * 100)}%</small></div></section>
    <section><h3>Atributos (nível ${L})</h3><table class="attr">${row('XP total', S.xpTotal, `próximo nível em ${BAL.xpForLevel(L + 1)}`)}${row('XP disponível', S.xpAvail, 'gasto em habilidades; não reduz nível')}${row('Vida', `${Math.round(S.vida)}/${st.vidaMax}`, '80 + 8 por nível + itens')}${row('Energia', `${Math.round(S.energia)}/${st.energiaMax}`, '60 + 4 por nível + itens')}${row('Foco', st.foco, `+${FORM.tempoFoco(st)}s nos casos`)}${row('Conhecimento', st.conhecimento, `dano ${FORM.danoBase(st)} · pista automática ${Math.round(FORM.pistaAuto(st) * 100)}%`)}${row('Precisão', st.precisao, `zona de procedimento ${Math.round(FORM.zonaProc(st) * 100)}% · crítico ${Math.round(FORM.critico(st) * 100)}%`)}${row('Resistência ao estresse', st.resistencia, `reduz dano em ${Math.round(FORM.reducao(st) * 100)}%`)}${row('Influência social', st.influencia, `missões +${Math.round(FORM.bonusSocial(st) * 100)}% · loja -${Math.round(FORM.descontoLoja(st) * 100)}%`)}${row(MOEDA, S.coins, '')}</table>
    <h3>Conquistas (${Object.keys(S.ach).length}/${CONQUISTAS.length})</h3><ul class="ach">${ach}</ul></section></div>`;
  openPanel('status', 'Ficha do Interno', body, { cls: 'wide' });
  OV().querySelector('.st-char').appendChild(portraitCanvas(playerLook(), 120, 150, { scale: 5 }));
}

/* ---------- Pausa ---------- */
function openPause() {
  const body = `<div class="pause"><button class="btn big" id="pzC">Continuar</button><button class="btn" id="pzF">Ficha do interno (C)</button><button class="btn" id="pzS">Salvar agora</button><button class="btn ghost" id="pzSom">Som: ${SFX.on ? 'ligado' : 'desligado'}</button>${IS_TOUCH ? `<button class="btn ghost" id="pzFS">${document.fullscreenElement || document.webkitFullscreenElement ? 'Sair da tela cheia' : 'Tela cheia'}</button>` : ''}<button class="btn ghost" id="pzE">Exportar save</button><button class="btn ghost" id="pzI">Importar save</button><button class="btn ghost" id="pzT">Tela inicial (trocar de modo)</button><button class="btn ghost" id="pzN">Recomeçar este modo</button>
    <div class="help"><h3>Controles</h3>${IS_TOUCH ? controlesHTML() : `<p><kbd>WASD</kbd>/<kbd>setas</kbd> andar · <kbd>E</kbd> interagir · <kbd>M</kbd> mapa · <kbd>I</kbd> inventário · <kbd>J</kbd> diário · <kbd>K</kbd> habilidades · <kbd>C</kbd> ficha · <kbd>Esc</kbd> pausa${hasSkill('int18') ? ' · <kbd>Shift</kbd> correr' : ''}</p>`}<p class="disclaimer">O progresso é salvo automaticamente neste navegador. Use "Exportar save" para guardar uma cópia. Conteúdo educacional: não substitui protocolos, supervisão ou orientação médica real.</p></div></div>`;
  openPanel('pause', 'Pausa', body, { cls: 'small' });
  $('#pzC').onclick = () => closeOverlay();
  $('#pzF').onclick = () => { closeOverlay(); openStatus(); };
  $('#pzS').onclick = () => { saveGame(); toast('Jogo salvo.'); };
  $('#pzSom').onclick = () => { SFX.on = !SFX.on; reopen(openPause); };
  if ($('#pzFS')) $('#pzFS').onclick = () => { const on = document.fullscreenElement || document.webkitFullscreenElement; telaCheia(on ? 'sair' : true); setTimeout(() => { if (G.panelName === 'pause') reopen(openPause); }, 400); };
  $('#pzE').onclick = () => { const code = exportSave(); const box = U.el('div', 'confirm', `<div class="panel small"><h3>Exportar save</h3><p>Guarde este código para restaurar o progresso.</p><textarea rows="6" readonly>${code}</textarea><div class="row"><button class="btn" id="exCp">Copiar</button><button class="btn ghost" id="exX">Fechar</button></div></div>`); OV().appendChild(box); const ta = box.querySelector('textarea'); box.querySelector('#exCp').onclick = () => { try { navigator.clipboard.writeText(code).then(() => toast('Copiado!'), () => { ta.select(); }); } catch (e) { ta.select(); } }; box.querySelector('#exX').onclick = () => box.remove(); };
  $('#pzI').onclick = () => importBox();
  const sair = () => { S = null; G.map = null; G.npcs = []; G.followers = []; G.psy = null; G.player = null; $('#hud').hidden = true; CR = null; ORD = []; showTitle(); };
  $('#pzT').onclick = () => { saveGame(); if (typeof cloudFlush === 'function') cloudFlush(); sair(); };
  $('#pzN').onclick = () => { const m = S.modo; confirmBox(`Recomeçar o ${modoNome(m)}? O progresso deste modo será apagado (o outro modo não muda).`, () => { deleteSave(m); sair(); }); };
}

/* ---------- Loja do Rodolfo ---------- */
let SHOPTAB = 'comprar', SHOPSEL = null;
function shopPrice(it) { return Math.max(1, Math.round(it.preco * (1 - FORM.descontoLoja(stats())))); }
function rodolfoLine() {
  const done = Object.keys(S.completed).length;
  if (S.rep >= 400 && Math.random() < 0.5) return U.pick(FALAS_RODOLFO.repAlta);
  if (S.rep <= -250 && Math.random() < 0.6) return U.pick(FALAS_RODOLFO.repBaixa);
  if (done && Math.random() < 0.4) return U.pick(FALAS_RODOLFO.progresso).replace('{n}', done);
  if (Math.random() < 0.2) return U.pick(FALAS_RODOLFO.equip);
  return U.pick(FALAS_RODOLFO.oi);
}
function openShop() {
  const stock = Object.values(ITEMS).filter(i => i.loja).concat(ITEMS[S.shop.rare] ? [ITEMS[S.shop.rare]] : []);
  const listBuy = stock.map(it => { const owned = EQUIP_SLOTS.includes(it.cat) && ownsEquip(it.id); const eq = Object.values(S.equip).includes(it.id); return `<button class="shop-row ${SHOPSEL === it.id ? 'sel' : ''}" data-it="${it.id}" style="--rc:${RARIDADES[it.rar].cor}">${icon(it.icon, 32)}<span><b>${it.nome}</b>${it.raroLoja ? '<em class="hot">Estoque raro</em>' : ''}<small>${CAT_NOME[it.cat]}${eq ? ' · equipado' : owned ? ' · já adquirido' : ''}</small></span><span class="price">${shopPrice(it)} ${MOEDA_CURTA}</span></button>`; }).join('');
  const sellable = S.inv.map((s, i) => ({ s, i })).filter(({ s }) => s && ITEMS[s.id].cat !== 'missao' && ITEMS[s.id].vendavel !== false && ITEMS[s.id].preco > 0);
  const listSell = sellable.map(({ s, i }) => { const it = ITEMS[s.id]; return `<button class="shop-row ${SHOPSEL === 'v' + i ? 'sel' : ''}" data-sell="${i}" style="--rc:${RARIDADES[it.rar].cor}">${icon(it.icon, 32)}<span><b>${it.nome}${s.q > 1 ? ' x' + s.q : ''}</b><small>${CAT_NOME[it.cat]}</small></span><span class="price">${Math.round(it.preco * BAL.sellFactor)} ${MOEDA_CURTA}</span></button>`; }).join('') || '<p class="hint">Nada para vender. Itens de missão e exclusivos não podem ser vendidos.</p>';
  let det = '<p class="hint">Escolha um item.</p>';
  if (SHOPTAB === 'comprar' && SHOPSEL && ITEMS[SHOPSEL]) {
    const it = ITEMS[SHOPSEL]; const owned = EQUIP_SLOTS.includes(it.cat) && ownsEquip(it.id); const lvlOk = !(it.req && it.req.nivel && level() < it.req.nivel); const pr = shopPrice(it);
    det = itemCard(it, `<p class="price-big">${pr} ${MOEDA_CURTA}</p><button class="btn" id="shBuy" ${owned || !lvlOk ? 'disabled' : ''}>${owned ? 'Já adquirido' : !lvlOk ? 'Nível insuficiente' : 'Comprar'}</button>`);
  } else if (SHOPTAB === 'vender' && typeof SHOPSEL === 'string' && SHOPSEL.startsWith('v')) {
    const i = +SHOPSEL.slice(1), s = S.inv[i]; if (s) { const it = ITEMS[s.id]; det = itemCard(it, `<p class="price-big">Vende por ${Math.round(it.preco * BAL.sellFactor)} ${MOEDA_CURTA}</p><button class="btn" id="shSell">Vender 1</button>`); }
  }
  const tabs = `<nav class="tabs"><button class="tab ${SHOPTAB === 'comprar' ? 'on' : ''}" data-st="comprar">Comprar</button><button class="tab ${SHOPTAB === 'vender' ? 'on' : ''}" data-st="vender">Vender</button></nav>`;
  const body = `<div class="shop"><aside class="shop-npc"><div class="sn-port"></div><p class="quote">"${U.esc(G.rodLine || (G.rodLine = rodolfoLine()))}"</p><p class="wallet">Carteira: <b>${S.coins} ${MOEDA_CURTA}</b></p><p class="hint">Estoque raro troca a cada 8 minutos de plantão e a cada estágio concluído. Desconto por Influência: ${Math.round(FORM.descontoLoja(stats()) * 100)}%.</p></aside>
    <section class="shop-list">${SHOPTAB === 'comprar' ? listBuy : listSell}</section><aside class="shop-det">${det}</aside></div>`;
  openPanel('shop', 'Bar do Rodolfo', body, { cls: 'wide', tabs });
  OV().querySelector('.sn-port').appendChild(portraitCanvas(LOOKS.rodolfo, 120, 120, { crop: true, scale: 6 }));
  OV().querySelectorAll('[data-st]').forEach(b => b.onclick = () => { SHOPTAB = b.dataset.st; SHOPSEL = null; reopen(openShop); });
  OV().querySelectorAll('[data-it]').forEach(b => b.onclick = () => { SHOPSEL = b.dataset.it; reopen(openShop); });
  OV().querySelectorAll('[data-sell]').forEach(b => b.onclick = () => { SHOPSEL = 'v' + b.dataset.sell; reopen(openShop); });
  const pClose = $('#pClose'); pClose.onclick = () => { G.rodLine = null; closeOverlay(); };
  if ($('#shBuy')) $('#shBuy').onclick = () => {
    const it = ITEMS[SHOPSEL]; const pr = shopPrice(it);
    if (S.coins < pr) { SFX.play('bad'); toast(`Moedas insuficientes. Faltam ${pr - S.coins} ${MOEDA_CURTA}. "Fiado eu não faço, doutor(a)."`, 'bad'); return; }
    if (!S.inv.some(s => !s) && !(it.empilha && S.inv.some(s => s && s.id === it.id))) { toast('Inventário cheio!', 'bad'); return; }
    const doBuy = () => { if (!invAdd(it.id)) return; addCoins(-pr); SFX.play('coin'); G.rodLine = U.pick(['Negócio fechado! Garantia de 7 dias ou até o próximo plantão.', 'Ótima escolha. Eu mesmo usaria. Se fosse médico.', 'Vai com Deus e com esse equipamento!']); toast(`Comprado: <b>${it.nome}</b>`, 'good'); saveGame(); reopen(openShop); };
    if (it.cores) ligaColorBox(doBuy); else doBuy();
  };
  if ($('#shSell')) $('#shSell').onclick = () => { const i = +SHOPSEL.slice(1), s = S.inv[i]; if (!s) return; const it = ITEMS[s.id]; s.q--; if (s.q <= 0) { S.inv[i] = null; SHOPSEL = null; } addCoins(Math.round(it.preco * BAL.sellFactor)); G.rodLine = 'Hmm... isso aqui eu revendo pro pessoal da Cirurgia.'; saveGame(); reopen(openShop); };
}

/* ---------- Cantina (Dona Cida) ---------- */
function openCantina() {
  const items = CANTINA_MENU;
  const pr = it => Math.max(1, Math.round(ITEMS[it].preco * (hasSkill('int9') ? 0.7 : 1)));
  const body = `<div class="cantina"><div class="cn-port"></div><div><p class="quote">"${U.pick(['Coxinha saindo, meu bem!', 'Come alguma coisa, você tá pálido(a)!', 'Pão de queijo fresquinho. Fresquinho de hoje cedo.', 'Interno não vive só de café, viu?'])}"</p>
    <div class="cn-list">${items.map(id => `<button class="shop-row" data-c="${id}" style="--rc:${RARIDADES[ITEMS[id].rar].cor}">${icon(ITEMS[id].icon, 32)}<span><b>${ITEMS[id].nome}</b><small>${ITEMS[id].efeito}</small></span><span class="price">${pr(id)} ${MOEDA_CURTA}</span></button>`).join('')}</div><p class="wallet">Carteira: <b>${S.coins} ${MOEDA_CURTA}</b>${hasSkill('int9') ? ' · Atalho da Cantina: -30%' : ''}</p></div></div>`;
  openPanel('cantina', 'Cantina da Dona Cida', body, { cls: 'small' });
  OV().querySelector('.cn-port').appendChild(portraitCanvas(LOOKS.cida, 100, 100, { crop: true, scale: 5 }));
  OV().querySelectorAll('[data-c]').forEach(b => b.onclick = () => { const id = b.dataset.c, p = pr(id); if (S.coins < p) { toast('Moedas insuficientes.', 'bad'); return; } if (invAdd(id)) { addCoins(-p); toast(`Comprou: <b>${ITEMS[id].nome}</b>`); reopen(openCantina); } });
}

/* ---------- Evento aleatório ---------- */
function openEventModal(ev, cb, rival) {
  if (G.mode !== 'explore') return;
  G.mode = 'panel'; G.panelName = 'event';
  const pop = rival ? `<div class="ev-port"></div><p class="quote">"${U.pick(rival.falas)}" — <b>${rival.nome}</b>, ${rival.titulo}</p>` : '';
  setOverlay(`<div class="panel small event"><header class="p-head"><h2>${ev.titulo}</h2></header><div class="p-body">${pop}<p>${ev.texto}</p><div class="menu-col">${ev.op.map((o, k) => `<button class="btn ${k ? 'ghost' : ''}" data-k="${k}">${o.t}</button>`).join('')}${hasSkill('int15') && !ev.rival && !ev.agitacao && (S.sumico[currentArea() || 'x'] || 0) < 3 ? '<button class="btn ghost" data-k="sumico">Sumiço Estratégico (pular)</button>' : ''}</div></div></div>`, 'dim');
  if (rival) OV().querySelector('.ev-port').appendChild(portraitCanvas(LOOKS[rival.look], 90, 90, { crop: true, scale: 5 }));
  SFX.play('alarm');
  OV().querySelectorAll('[data-k]').forEach(b => b.onclick = () => { setOverlay(''); G.mode = 'explore'; if (b.dataset.k === 'sumico') { S.sumico[currentArea() || 'x'] = (S.sumico[currentArea() || 'x'] || 0) + 1; toast('Você deu um sumiço estratégico. Ninguém percebeu.'); return; } cb(+b.dataset.k); });
}

/* =====================================================================
   MINIGAMES DAS MISSÕES SECUNDÁRIAS
   ===================================================================== */
function miniBox(title, html) { G.mode = 'panel'; G.panelName = 'mini'; return setOverlay(`<div class="panel small minibox" role="dialog"><header class="p-head"><h2>${title}</h2><button class="x" id="pClose">✕</button></header><div class="p-body">${html}</div></div>`, 'dim'); }
function miniCafe(q, st, done) {
  const lote = st.n > 1 && !hasSkill('int14') ? st.n : 1; let feitos = 0;
  const round = () => {
    miniBox('Cafeteira da copa', `<p>Pedido: <b>${st.n > 1 ? st.n + ' cafés' : 'café ' + (st.acucar ? 'COM' : 'SEM') + ' açúcar'}</b>${lote > 1 ? ` — preparando ${feitos + 1} de ${lote}` : hasSkill('int14') && st.n > 1 ? ' — Café em Larga Escala: todos de uma vez!' : ''}</p><p>Como vai o açúcar?</p><div class="menu-col"><button class="btn" data-a="1">Com açúcar</button><button class="btn" data-a="0">Sem açúcar</button><button class="btn ghost" data-a="2">Adoçante (ninguém pediu)</button></div>`);
    $('#pClose').onclick = () => closeOverlay();
    OV().querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
      const a = +b.dataset.a; const ok = st.n > 1 ? a !== 2 : (a === (st.acucar ? 1 : 0));
      if (!ok) { SFX.play('bad'); q.t -= 10; toast('Errou o pedido! Jogou fora e recomeçou (-10s de prazo).', 'bad'); return round(); }
      SFX.play('coffee'); feitos++;
      if (feitos < lote) return round();
      closeOverlay(); done();
    });
  };
  round();
}
function miniImpressora(done) {
  if (hasSkill('int19')) { SFX.play('printer'); toast('A <b>Impressora Sobrenatural</b> sentiu sua presença e voltou a funcionar sozinha.'); return done(); }
  const etapas = [
    { q: 'Luz laranja piscando. Primeiro passo?', o: ['Abrir a tampa e procurar papel atolado', 'Dar um tapa na lateral', 'Desligar o computador do setor'], c: 0 },
    { q: 'Achou uma folha amassada. E agora?', o: ['Puxar devagar, no sentido do papel', 'Puxar com força para trás', 'Deixar lá e fechar'], c: 0 },
    { q: 'Ela diz "sem toner". Mas tem toner.', o: ['Tirar o cartucho, balançar levemente e recolocar', 'Comprar outra impressora', 'Chorar'], c: 0 },
    { q: 'Mensagem final: "Erro 0x0042".', o: ['Desligar, contar até 10 e ligar de novo', 'Ligar para a TI e esperar 3 dias', 'Rezar para São Gutemberg'], c: 0 },
  ];
  const seq = hasSkill('int4') ? etapas.slice(0, 2).concat([etapas[3]]).slice(0, 2) : U.shuffle(etapas.slice(0, 3)).concat([etapas[3]]).slice(0, 3);
  let i = 0;
  const step = () => {
    const e = seq[i]; const ord = U.shuffle(e.o.map((t, k) => ({ t, k })));
    miniBox('Impressora travada', `<p class="eyebrow">Etapa ${i + 1} de ${seq.length}</p><p>${e.q}</p><div class="menu-col">${ord.map(o => `<button class="btn ghost" data-k="${o.k}">${o.t}</button>`).join('')}</div>`);
    $('#pClose').onclick = () => closeOverlay();
    OV().querySelectorAll('[data-k]').forEach(b => b.onclick = () => { if (+b.dataset.k !== e.c) { SFX.play('bad'); toast('A impressora rosnou. Tente outra coisa.', 'bad'); return; } SFX.play('printer'); i++; if (i >= seq.length) { closeOverlay(); toast('A impressora voltou à vida e imprimiu tudo!', 'good'); done(); } else step(); });
  };
  step();
}
function miniAdmin(done, fail) {
  const casos = [
    { pac: 'Paciente com IAM com supra aguardando hemodinâmica', campos: [['Tipo de solicitação', ['Transferência de urgência', 'Consulta ambulatorial eletiva', 'Atestado'], 0], ['Prioridade', ['Emergência', 'Eletiva', 'Retorno em 6 meses'], 0], ['Destino', ['Serviço de hemodinâmica de referência', 'UBS', 'Fisioterapia'], 0]] },
    { pac: 'Gestante de 34 semanas com pré-eclâmpsia', campos: [['Tipo de solicitação', ['Vaga em maternidade de referência', 'Consulta de rotina', 'Exame de vista'], 0], ['Prioridade', ['Urgência', 'Eletiva', 'Sem prioridade'], 0], ['Especialidade', ['Obstetrícia de alto risco', 'Dermatologia', 'Ortopedia'], 0]] },
    { pac: 'Criança com suspeita de TEA', campos: [['Tipo de solicitação', ['Encaminhamento para avaliação multiprofissional', 'Internação em UTI', 'Cirurgia'], 0], ['Prioridade', ['Prioritária (intervenção precoce)', 'Daqui a 5 anos', 'Emergência'], 0], ['Destino', ['Serviço especializado em neurodesenvolvimento', 'Pronto-socorro', 'Banco de sangue'], 0]] },
  ];
  const cs = U.pick(casos); const auto = (hasSkill('int5') ? 1 : 0) + (fx('adminAuto') ? 1 : 0);
  const sel = cs.campos.map((c, i) => i < auto ? 0 : -1);
  const render = () => {
    miniBox('Sistema hospitalar (lento)', `<p><b>${cs.pac}</b></p><div class="form-mini">${cs.campos.map((c, i) => `<label>${c[0]}${i < auto ? ' <em>(preenchido automaticamente)</em>' : ''}<select data-i="${i}" ${i < auto ? 'disabled' : ''}><option value="-1">— escolha —</option>${U.shuffle(c[1].map((t, k) => ({ t, k }))).map(o => `<option value="${o.k}" ${sel[i] === o.k ? 'selected' : ''}>${o.t}</option>`).join('')}</select></label>`).join('')}</div><button class="btn" id="admOk">Enviar</button>`);
    $('#pClose').onclick = () => closeOverlay();
    OV().querySelectorAll('select').forEach(s => s.onchange = () => { sel[+s.dataset.i] = +s.value; });
    $('#admOk').onclick = () => { if (sel.every((v, i) => v === cs.campos[i][2])) { closeOverlay(); SFX.play('ok'); toast('Encaminhamento aceito pelo sistema!', 'good'); done(); } else { SFX.play('bad'); fail && fail(); } };
  };
  render();
}
function miniFamilia(q, n) {
  const perguntas = [
    { q: `${n.nome}: "Doutor(a), ele vai ficar bem? Ninguém me fala nada!"`, o: [['Acolher, se apresentar como interno(a) e chamar o médico responsável para atualizar o quadro', 3], ['Dizer que vai ficar tudo bem, com certeza', -1], ['Explicar o diagnóstico por conta própria, sem autorização', -2]] },
    { q: `${n.nome}: "Posso ver o prontuário dele aqui no corredor?"`, o: [['Explicar que informações são passadas em local reservado pela equipe, respeitando a privacidade e as autorizações do paciente', 3], ['Mostrar o prontuário ali mesmo', -2], ['Ignorar a pergunta', -1]] },
  ];
  let i = 0, pts = 0;
  const step = () => {
    const p = perguntas[i]; const ord = U.shuffle(p.o);
    miniBox('Conversa com a família', `<div class="ev-port"></div><p>${p.q}</p><div class="menu-col">${ord.map((o, k) => `<button class="btn ghost" data-k="${k}">${o[0]}</button>`).join('')}</div>`);
    OV().querySelector('.ev-port').appendChild(portraitCanvas(lookOf(n), 90, 90, { crop: true, scale: 5 }));
    $('#pClose').onclick = () => closeOverlay();
    OV().querySelectorAll('[data-k]').forEach(b => b.onclick = () => { const o = ord[+b.dataset.k]; pts += o[1]; SFX.play(o[1] > 0 ? 'ok' : 'bad'); i++; if (i < perguntas.length) step(); else { closeOverlay(); if (pts >= 5) { toast('A família agradeceu o acolhimento. Comunicação é procedimento!', 'good'); advanceSide(q); } else { addRep(-1, 'comunicação'); toast('A conversa não foi bem. A família ficou mais ansiosa. Tente de novo.', 'bad'); } } });
  };
  step();
}
