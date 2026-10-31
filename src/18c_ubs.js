/* =====================================================================
   UBS: figuras das questões (curvas de Nelson de Moraes, Swaroop-Uemura,
   tabela 2×2, genograma) e sessões de dúvidas dos recém-formados.
   ===================================================================== */
const FIG_W = 480, FIG_H = 232;
const NELSON = { nelson1: [35, 25, 10, 20, 10], nelson2: [45, 10, 5, 15, 25], nelson3: [30, 5, 5, 15, 45], nelson4: [5, 1, 3, 11, 80] };
function drawFig(cv, key) {
  if (!cv) return;
  const k = 2; cv.width = FIG_W * k; cv.height = FIG_H * k;
  const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0);
  const ink = '#1f2328', soft = '#5b6470', paper = '#fbf8f0', blue = '#2f6fc4';
  c.fillStyle = paper; c.fillRect(0, 0, FIG_W, FIG_H);
  c.strokeStyle = '#d9d2c0'; c.lineWidth = 2; c.strokeRect(1, 1, FIG_W - 2, FIG_H - 2);
  const font = (w, s) => `${w} ${s}px "Atkinson Hyperlegible", system-ui, sans-serif`;
  const txt = (t, x, y, o = {}) => { c.font = font(o.b ? 700 : 400, o.s || 13); c.fillStyle = o.c || ink; c.textAlign = o.a || 'left'; c.textBaseline = o.bl || 'alphabetic'; c.fillText(t, x, y); };
  if (NELSON[key]) {
    const v = NELSON[key], labs = ['< 1', '1–4', '5–19', '20–49', '≥ 50'];
    txt('Mortalidade proporcional por faixa etária (%)', FIG_W / 2, 22, { b: 1, a: 'center' });
    const x0 = 56, y0 = 196, w = 390, h = 150, max = 90;
    c.strokeStyle = '#c9c2b0'; c.lineWidth = 1;
    for (let g = 0; g <= max; g += 15) { const y = y0 - g / max * h; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + w, y); c.stroke(); txt(String(g), x0 - 8, y + 4, { a: 'right', s: 11, c: soft }); }
    const step = w / v.length, pts = [];
    v.forEach((val, i) => { const bx = x0 + i * step + step * 0.22, bw = step * 0.56, bh = val / max * h; c.fillStyle = 'rgba(47,111,196,0.22)'; c.fillRect(bx, y0 - bh, bw, bh); pts.push([x0 + i * step + step / 2, y0 - bh]); txt(labs[i], x0 + i * step + step / 2, y0 + 18, { a: 'center', s: 12 }); txt(val + '%', x0 + i * step + step / 2, y0 - bh - 7, { a: 'center', s: 11, c: soft }); });
    c.strokeStyle = blue; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke();
    c.fillStyle = blue; for (const [x, y] of pts) { c.beginPath(); c.arc(x, y, 4, 0, 7); c.fill(); }
    c.strokeStyle = ink; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0 - h - 4); c.lineTo(x0, y0); c.lineTo(x0 + w, y0); c.stroke();
    txt('idade (anos)', x0 + w, y0 + 32, { a: 'right', s: 11, c: soft });
    return;
  }
  if (key === 'swaroop') {
    const rows = [['Menores de 1 ano', '120'], ['1 a 4 anos', '30'], ['5 a 19 anos', '60'], ['20 a 49 anos', '290'], ['50 anos ou mais', '1.500']];
    txt('Município Boa Vista do Sul — óbitos registrados no ano', FIG_W / 2, 24, { b: 1, a: 'center' });
    const x0 = 90, y0 = 44, cw = [200, 110], rh = 26;
    c.fillStyle = '#e8eef8'; c.fillRect(x0, y0, cw[0] + cw[1], rh); txt('Faixa etária', x0 + 10, y0 + 18, { b: 1 }); txt('Óbitos', x0 + cw[0] + cw[1] - 10, y0 + 18, { b: 1, a: 'right' });
    rows.forEach(([a, b], i) => { const y = y0 + rh * (i + 1); if (i % 2) { c.fillStyle = '#f2ede0'; c.fillRect(x0, y, cw[0] + cw[1], rh); } txt(a, x0 + 10, y + 18); txt(b, x0 + cw[0] + cw[1] - 10, y + 18, { a: 'right' }); });
    const yT = y0 + rh * 6; c.fillStyle = '#e8eef8'; c.fillRect(x0, yT, cw[0] + cw[1], rh); txt('Total', x0 + 10, yT + 18, { b: 1 }); txt('2.000', x0 + cw[0] + cw[1] - 10, yT + 18, { b: 1, a: 'right' });
    c.strokeStyle = '#b9b2a0'; c.lineWidth = 1; c.strokeRect(x0, y0, cw[0] + cw[1], rh * 7);
    return;
  }
  if (key === 'tab2x2') {
    txt('Novo teste rápido × padrão-ouro (1.000 pessoas)', FIG_W / 2, 24, { b: 1, a: 'center' });
    const x0 = 70, y0 = 46, cw = [110, 100, 100, 90], rh = 40;
    const head = ['', 'Doença +', 'Doença −', 'Total'], body = [['Teste +', '90', '40', '130'], ['Teste −', '10', '860', '870'], ['Total', '100', '900', '1.000']];
    let x = x0; head.forEach((h, i) => { c.fillStyle = i ? '#e8eef8' : paper; c.fillRect(x, y0, cw[i], rh); if (h) txt(h, x + cw[i] / 2, y0 + 25, { b: 1, a: 'center' }); x += cw[i]; });
    body.forEach((r, j) => { let xx = x0; r.forEach((v, i) => { const y = y0 + rh * (j + 1); c.fillStyle = i === 0 || j === 2 || i === 3 ? '#f2ede0' : '#ffffff'; c.fillRect(xx, y, cw[i], rh); txt(v, xx + cw[i] / 2, y + 25, { b: i === 0 || j === 2 || i === 3 ? 1 : 0, a: 'center', s: i && j < 2 && i < 3 ? 16 : 13 }); xx += cw[i]; }); });
    c.strokeStyle = '#b9b2a0'; c.lineWidth = 1; let gx = x0; for (const w of cw) { c.strokeRect(gx, y0, w, rh * 4); gx += w; } for (let j = 1; j < 4; j++) { c.beginPath(); c.moveTo(x0, y0 + rh * j); c.lineTo(gx, y0 + rh * j); c.stroke(); }
    txt('VP = 90 · FP = 40 · FN = 10 · VN = 860', FIG_W / 2, y0 + rh * 4 + 22, { a: 'center', s: 12, c: soft });
    return;
  }
  if (key === 'genograma') {
    const S0 = 30, R = 15; c.lineWidth = 2; c.strokeStyle = ink;
    const sq = (x, y, o = {}) => { c.fillStyle = '#ffffff'; c.fillRect(x - S0 / 2, y - S0 / 2, S0, S0); c.strokeRect(x - S0 / 2, y - S0 / 2, S0, S0); if (o.x) { c.beginPath(); c.moveTo(x - S0 / 2, y - S0 / 2); c.lineTo(x + S0 / 2, y + S0 / 2); c.moveTo(x + S0 / 2, y - S0 / 2); c.lineTo(x - S0 / 2, y + S0 / 2); c.stroke(); } if (o.age) txt(o.age, x, y + 5, { a: 'center', s: 12 }); };
    const ci = (x, y, o = {}) => { c.fillStyle = '#ffffff'; c.beginPath(); c.arc(x, y, R, 0, 7); c.fill(); c.stroke(); if (o.dup) { c.beginPath(); c.arc(x, y, R + 5, 0, 7); c.stroke(); } if (o.age) txt(o.age, x, y + 5, { a: 'center', s: 12 }); };
    const line = (pts) => { c.beginPath(); pts.forEach(([x, y], i) => i ? c.lineTo(x, y) : c.moveTo(x, y)); c.stroke(); };
    const lab = (t, x, y) => { c.fillStyle = '#c0392b'; c.beginPath(); c.arc(x, y, 10, 0, 7); c.fill(); txt(t, x, y + 5, { a: 'center', b: 1, c: '#ffffff', s: 12 }); };
    // 1ª geração
    sq(150, 40, { x: 1 }); ci(250, 40, { age: '74' }); line([[150, 55], [150, 70], [250, 70], [250, 55]]); lab('A', 118, 30);
    sq(330, 40, { age: '70' }); ci(430, 40, { age: '68' }); line([[330, 55], [330, 70], [430, 70], [430, 55]]);
    // 2ª geração
    line([[200, 70], [200, 90], [160, 90], [160, 108]]); line([[200, 90], [240, 90], [240, 108]]);
    sq(160, 124, { age: '45' }); ci(240, 124, { age: '43' });
    line([[380, 70], [380, 108]]); ci(380, 124, { age: '44' });
    line([[160, 139], [160, 156], [380, 156], [380, 139]]);
    c.beginPath(); c.moveTo(300, 164); c.lineTo(310, 148); c.moveTo(309, 164); c.lineTo(319, 148); c.stroke(); lab('B', 338, 172);
    // 3ª geração
    line([[230, 156], [230, 174], [200, 174], [200, 190]]); line([[230, 174], [262, 174], [262, 190]]);
    ci(200, 206, { dup: 1, age: '16' }); sq(262, 206, { age: '12' }); lab('C', 164, 198);
    txt('Família Souza (UBS Maria das Dores)', FIG_W - 12, 222, { s: 11, c: soft, a: 'right' });
    return;
  }
}

/* ---------------- Sessões de dúvidas ---------------- */
function startDuvida(n) {
  const cdT = (S.duvidaCd || {})[n.id] || 0;
  if (cdT > S.playTime) return startDialog(n.id, [U.pick(n.duvEspera || ['Tô revisando o que você explicou. Volta daqui a pouco?'])]);
  const pool = QUICK.filter(q => q.g === n.grupo); if (!pool.length) return startDialog(n.id, ['Hoje não tenho dúvida. Milagre.']);
  const rest = pool.slice(), qs = [];
  for (let k = 0; k < 3 && rest.length; k++) { const q = pickPrio(rest); qs.push(q); rest.splice(rest.indexOf(q), 1); }
  startDialog(n.id, [U.pick(n.duvIntro || ['Tenho umas dúvidas para a prova. Me ajuda?'])], null, [{ t: 'Tirar as dúvidas', f: () => runDuvida(n, qs) }, { t: 'Agora não', f: () => { } }]);
}
function runDuvida(n, qs) {
  SFX.play('ui');
  let k = 0, acertos = 0;
  const temas = [...new Set(qs.map(q => q.tema))];
  const o = encOpen('agit duvida', `<header class="enc-head"><p class="eyebrow">Grupo de estudos para a residência · Preventiva e SUS</p><div class="psy-top"><div class="ch-port"></div><div><h2>${U.esc(n.nome)} tem dúvidas</h2><p>${temas.map(t => U.esc(t)).join(' · ')}</p></div></div>
    <p class="hint">Sem cronômetro. Cada acerto vale XP e reputação; o que errar vai para o caderno de erros.</p></header><div class="bmain" id="dMain"></div>`);
  OV().querySelector('.ch-port').appendChild(portraitCanvas(lookOf(n), 84, 84, { crop: true, scale: 4 }));
  const step = () => {
    const m = document.getElementById('dMain'); if (!m) return;
    if (k >= qs.length) return end();
    const q = qs[k]; const ord = U.shuffle(q.o.map((t, i) => ({ t, ok: i === 0 })));
    marcarConteudo('duvida', q.id || q.q.slice(0, 60), q.q.slice(0, 140));
    m.innerHTML = `<div class="quick"><p class="eyebrow">Dúvida ${k + 1} de ${qs.length} · ${U.esc(q.tema)}</p>${q.img ? '<div class="qfig-wrap"><canvas class="qfig" role="img" aria-label="Figura da questão"></canvas></div>' : ''}<p class="q">${U.esc(q.q)}</p><div class="opts">${ord.map((x, i) => `<button class="opt" data-i="${i}"><span class="ol">${'ABCD'[i]}</span><span class="otx">${U.esc(x.t)}</span></button>`).join('')}</div></div>`;
    if (q.img) drawFig(m.querySelector('.qfig'), q.img);
    m.querySelectorAll('.opt').forEach(b => b.onclick = () => {
      const ok = ord[+b.dataset.i].ok; if (ok) acertos++;
      logErro(q.tema, ok, 'ubs', q.e);
      SFX.play(ok ? 'ok' : 'bad');
      m.querySelectorAll('.opt').forEach((x, i) => { x.disabled = true; if (ord[i].ok) x.classList.add('right'); });
      if (!ok) b.classList.add('wrong');
      m.insertAdjacentHTML('beforeend', `<div class="fb ${ok ? 'good' : 'bad'}"><b>${ok ? 'Isso! Agora eu entendi.' : 'Hmm, acho que não é isso.'}</b> ${U.esc(q.e)}</div><div class="res-acts">${repBotao({ tipo: 'duvida', id: q.id || q.q.slice(0, 60), titulo: q.q.slice(0, 140) })}<button class="btn" id="dNext">${k + 1 < qs.length ? 'Próxima dúvida' : 'Encerrar'}</button></div>`);
      bindRepBotoes(m);
      const nx = document.getElementById('dNext'); nx.onclick = () => { k++; step(); }; nx.focus();
    });
  };
  const end = () => {
    const ok = acertos >= 2;
    S.duvidaCd = S.duvidaCd || {}; S.duvidaCd[n.id] = S.playTime + 40;
    S.stats.duvidas = (S.stats.duvidas || 0) + (ok ? 1 : 0);
    const xp = addXP(28 * acertos * BAL.xpMult(S.rep)); const co = addCoins(4 * acertos); const rp = addRep(acertos ? acertos : -1, 'dúvidas');
    if (S.stats.duvidas >= 10) unlockAch('duvidas10');
    const fala = ok ? U.pick(n.duvFim || ['Valeu! Vou cair isso na prova, tenho certeza.']) : U.pick(['Acho que a gente precisa revisar isso juntos. Volta depois?', 'Ficou confuso... vou abrir o resumo de novo.']);
    document.getElementById('dMain').innerHTML = `<div class="result"><p class="${ok ? 'good' : 'bad'} big">${acertos}/${qs.length} dúvidas resolvidas.</p><p>${U.esc(n.nome)}: "${U.esc(fala)}"</p><div class="rewards"><span>+${xp} XP</span><span>+${co} ${MOEDA_CURTA}</span><span class="${rp >= 0 ? 'pos' : 'neg'}">${rp >= 0 ? '+' : ''}${rp} reputação</span></div><button class="btn big" id="dOk">Voltar à UBS</button></div>`;
    document.getElementById('dOk').onclick = () => { closeOverlay(); onMainEvent('duvida', { ok, npc: n.id }); checkAch(); saveGame(); };
  };
  step();
}
