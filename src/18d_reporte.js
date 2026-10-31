/* =====================================================================
   REPORTAR ERRO + CRÉDITOS DAS IMAGENS
   - reportarErro(ctx): caixa sobre a tela atual (não fecha o caso).
     Sempre guarda uma cópia neste aparelho (localStorage 'lbi_reportes');
     no site, também envia para o Firebase em reportes/{id}.
     ctx = { tipo: 'caso'|'pergunta'|'duvida'|'emergencia'|'geral', id, titulo }
   - ULTIMO_CONTEUDO guarda o último caso/pergunta mostrado, para o botão
     do menu de pausa já saber do que o jogador está falando.
   - openCreditos(): lista as imagens de licença livre (CREDITOS_IMG vem
     do build.py, lido de notas/imagens.md).
   ===================================================================== */
let ULTIMO_CONTEUDO = null;
function marcarConteudo(tipo, id, titulo) { ULTIMO_CONTEUDO = { tipo, id: String(id || '').slice(0, 120), titulo: String(titulo || '').slice(0, 160) }; }
const REP_KEY = 'lbi_reportes';
const REP_MOTIVOS = [['resposta', 'Gabarito errado'], ['explicacao', 'Explicação ou texto'], ['imagem', 'Imagem ou exame'], ['desatualizado', 'Conduta desatualizada'], ['bug', 'Falha do jogo'], ['outro', 'Outro']];
function repLocais() { try { const a = JSON.parse(localStorage.getItem(REP_KEY) || '[]'); return Array.isArray(a) ? a : []; } catch (e) { return []; } }
function repSalvarLocal(r) { try { const a = repLocais(); a.push(r); while (a.length > 60) a.shift(); localStorage.setItem(REP_KEY, JSON.stringify(a)); } catch (e) { } }
function repBotao(ctx, cls = '') { return `<button class="btn small ghost rep-btn ${cls}" data-rep='${U.esc(JSON.stringify(ctx))}'>⚑ Reportar erro</button>`; }
function bindRepBotoes(host) { host.querySelectorAll('.rep-btn').forEach(b => b.onclick = e => { e.stopPropagation(); let ctx = null; try { ctx = JSON.parse(b.dataset.rep); } catch (er) { } reportarErro(ctx); }); }

function reportarErro(ctx) {
  ctx = ctx || ULTIMO_CONTEUDO || { tipo: 'geral', id: '', titulo: '' };
  if (document.querySelector('.rep-box')) return;
  const sobre = ctx.tipo === 'geral' || !ctx.id ? '' : `<p class="rep-sobre"><b>${{ caso: 'Caso', pergunta: 'Pergunta', duvida: 'Dúvida', emergencia: 'Emergência' }[ctx.tipo] || 'Conteúdo'}:</b> ${U.esc(ctx.titulo || ctx.id)}${ctx.id && ctx.titulo ? ` <small>(${U.esc(ctx.id)})</small>` : ''}</p>`;
  const box = U.el('div', 'confirm rep-box', `<div class="panel small rep-panel" role="dialog" aria-label="Reportar erro"><h3>⚑ Reportar erro</h3>${sobre}
    <p class="hint">O que está errado? A equipe revisa cada reporte.</p>
    <div class="rep-mot">${REP_MOTIVOS.map(([k, t], i) => `<label><input type="radio" name="repm" value="${k}" ${i === 0 && ctx.tipo !== 'geral' ? 'checked' : i === 4 && ctx.tipo === 'geral' ? 'checked' : ''}> ${t}</label>`).join('')}</div>
    <textarea id="repTxt" rows="4" maxlength="800" placeholder="Explique em poucas palavras. Se souber, cite a fonte (diretriz, livro, artigo)."></textarea>
    <div class="row"><button class="btn" id="repOk">Enviar</button><button class="btn ghost" id="repX">Cancelar</button></div></div>`);
  document.body.appendChild(box);
  const ta = box.querySelector('#repTxt'); setTimeout(() => { try { ta.focus(); } catch (e) { } }, 30);
  const close = () => { box.remove(); document.removeEventListener('keydown', key, true); };
  const key = e => { e.stopPropagation(); if (e.key === 'Escape') { e.preventDefault(); close(); } };
  document.addEventListener('keydown', key, true);
  box.onclick = e => { if (e.target === box) close(); };
  box.querySelector('#repX').onclick = close;
  box.querySelector('#repOk').onclick = () => {
    const txt = ta.value.trim(); const m = (box.querySelector('input[name=repm]:checked') || {}).value || 'outro';
    if (txt.length < 5) { toast('Escreva o que está errado (pelo menos algumas palavras).', 'bad'); ta.focus(); return; }
    const r = { tipo: ctx.tipo || 'geral', id: ctx.id || '', titulo: ctx.titulo || '', motivo: m, txt: txt.slice(0, 800), modo: S ? S.modo : '', nivel: S ? level() : 0, quando: new Date().toISOString(), tela: innerWidth + 'x' + innerHeight + (IS_TOUCH ? ' toque' : '') };
    repSalvarLocal(r);
    close();
    repEnviar(r).then(ok => toast(ok ? '⚑ Obrigado! Reporte enviado para a equipe.' : '⚑ Obrigado! Reporte guardado neste aparelho.'));
  };
}
async function repEnviar(r) {
  if (typeof FB === 'undefined' || !FB.ok) return false;
  try {
    const u = await Promise.race([FB.ready, new Promise(res => setTimeout(() => res(null), 4000))]); if (!u) return false;
    await Promise.race([FB.db.ref('reportes').push(Object.assign({ uid: u.uid, t: firebase.database.ServerValue.TIMESTAMP }, r)), new Promise((_, rej) => setTimeout(() => rej(new Error('tempo')), 6000))]);
    return true;
  } catch (e) { console.warn('reporte', e); return false; }
}

/* ---------- Créditos das imagens ---------- */
const CRED_BY = Object.fromEntries((typeof CREDITOS_IMG !== 'undefined' ? CREDITOS_IMG : []).map(c => [c.f, c]));
function creditoCurto(f) { const c = CRED_BY[String(f).split('/').pop()]; if (!c) return ''; return `Imagem: ${c.autor && c.autor !== '?' ? c.autor + ' · ' : ''}${c.fonte} · ${c.lic}`; }
function licLink(lic) {
  const m = /CC BY(-SA)? ?([0-9.]+)/i.exec(lic); if (m) return `https://creativecommons.org/licenses/by${m[1] ? '-sa' : ''}/${m[2]}/deed.pt-br`;
  if (/CC0/i.test(lic)) return 'https://creativecommons.org/publicdomain/zero/1.0/deed.pt-br';
  return '';
}
function openCreditos(voltar) {
  const lista = (typeof CREDITOS_IMG !== 'undefined' ? CREDITOS_IMG : []).slice().sort((a, b) => a.m.localeCompare(b.m, 'pt'));
  const linhas = lista.map(c => { const ll = licLink(c.lic); return `<li><img src="${U.esc(IMG_BASE + c.f)}" alt="" loading="lazy"><div><b>${U.esc(c.m)}</b><span>${U.esc(c.autor && c.autor !== '?' ? c.autor : 'Autor não identificado')} · ${U.esc(c.fonte)}</span><span>${ll ? `<a href="${ll}" target="_blank" rel="noopener">${U.esc(c.lic)}</a>` : U.esc(c.lic)} · <a href="${U.esc(c.link)}" target="_blank" rel="noopener">original</a></span></div></li>`; }).join('');
  const body = `<div class="creditos"><p>As imagens de exames e fotos clínicas abaixo são de terceiros, usadas sob licenças livres (domínio público, CC0, CC BY ou CC BY-SA). Algumas foram recortadas ou redimensionadas para caber na tela do jogo; isso não indica endosso dos autores.</p>
    <ul class="cred-lista">${linhas || '<li>Nenhuma imagem de terceiros.</li>'}</ul>
    <h3>Tipografia</h3><p>Pixelify Sans, Silkscreen e Atkinson Hyperlegible, pelo Google Fonts, sob a SIL Open Font License.</p>
    <h3>Arte e sons</h3><p>Personagens, mapas, objetos e efeitos sonoros foram desenhados e gerados para o próprio jogo.</p>
    ${voltar ? '<div class="row center"><button class="btn" id="crVolta">Voltar</button></div>' : ''}</div>`;
  if (G.mode === 'title') {
    setOverlay(`<div class="panel wide" role="dialog" aria-label="Créditos"><header class="p-head"><h2>Créditos</h2><button class="x" id="pClose" aria-label="Fechar">✕</button></header><div class="p-body">${body}</div></div>`, 'dim');
    $('#pClose').onclick = () => showTitle();
  } else openPanel('creditos', 'Créditos', body, { cls: 'wide' });
  const v = OV().querySelector('#crVolta'); if (v) v.onclick = () => voltar();
}
