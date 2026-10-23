/* =====================================================================
   INICIALIZAÇÃO, ENTRADA E LAÇO PRINCIPAL
   ===================================================================== */
let CTX = null, CV = null, LAST = 0, HUDT = 0;
const MOVE_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];

function fitCanvas() {
  const st = document.getElementById('stage'); if (!st || !CV) return;
  const w = st.clientWidth, h = st.clientHeight;
  let s = Math.min(w / VW, h / VH); if (s >= 1) { const f = Math.floor(s); if (f / s >= 0.8) s = f; }
  CV.style.width = Math.floor(VW * s) + 'px'; CV.style.height = Math.floor(VH * s) + 'px';
}
function isTyping(e) { const t = e.target; return t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.tagName === 'SELECT'); }
function onKeyDown(e) {
  if (isTyping(e) && e.code !== 'Escape') return;
  SFX.init();
  const k = e.code;
  if (MOVE_KEYS.includes(k) || k === 'Space') e.preventDefault();
  if (G.mode === 'dialog') { if (k === 'KeyE' || k === 'Space' || k === 'Enter') { G.dialog && G.dialog.next(); } return; }
  if (G.mode === 'proc' && k === 'Space' && G.execPress) { G.execPress(); return; }
  if (G.mode === 'explore') {
    if (MOVE_KEYS.includes(k) || k === 'ShiftLeft' || k === 'ShiftRight') G.keys[k] = true;
    if (k === 'KeyE' || k === 'Enter' || k === 'Space') interact();
    else if (k === 'KeyM') togglePanel('map');
    else if (k === 'KeyI') togglePanel('inv');
    else if (k === 'KeyJ') togglePanel('journal');
    else if (k === 'KeyK') togglePanel('skills');
    else if (k === 'KeyC') togglePanel('status');
    else if (k === 'KeyN') togglePanel('caderno');
    else if (k === 'Escape') togglePanel('pause');
    return;
  }
  if (G.mode === 'panel') {
    const map = { KeyM: 'map', KeyI: 'inv', KeyJ: 'journal', KeyK: 'skills', KeyC: 'status', KeyN: 'caderno' };
    if (k === 'Escape') { const conf = OV().querySelector('.confirm'); if (conf) conf.remove(); else { G.rodLine = null; closeOverlay(); } }
    else if (map[k] && ['map', 'inv', 'journal', 'skills', 'status', 'caderno'].includes(G.panelName)) togglePanel(map[k]);
    return;
  }
  if (['encounter', 'boss', 'combat', 'proc'].includes(G.mode) && ['KeyM', 'KeyI', 'KeyJ', 'KeyK', 'KeyN'].includes(k)) toast('Mapa e menus ficam indisponíveis durante encontros, procedimentos e batalhas.', 'bad');
}
function onKeyUp(e) { G.keys[e.code] = false; }

function setupTouch() {
  const t = document.getElementById('touch'); if (!t) return;
  const dirs = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  t.querySelectorAll('[data-d]').forEach(b => {
    const d = dirs[b.dataset.d];
    const on = e => { e.preventDefault(); SFX.init(); G.touchDir = d; }, off = e => { e.preventDefault(); if (G.touchDir === d) G.touchDir = null; };
    b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
  });
  t.querySelectorAll('[data-k]').forEach(b => b.addEventListener('click', e => {
    e.preventDefault(); SFX.init(); const k = b.dataset.k;
    if (G.mode === 'dialog') { G.dialog && G.dialog.next(); return; }
    if (k === 'E') { if (G.mode === 'explore') interact(); else if (G.mode === 'proc' && G.execPress) G.execPress(); }
    else if (G.mode === 'explore' || G.mode === 'panel') togglePanel(k);
  }));
  const run = t.querySelector('[data-run]'); if (run) { run.addEventListener('pointerdown', () => G.touchSprint = true); run.addEventListener('pointerup', () => G.touchSprint = false); run.addEventListener('pointerleave', () => G.touchSprint = false); }
}

function loop(now) {
  const dt = Math.min(0.05, (now - LAST) / 1000 || 0); LAST = now; G.t += dt;
  if (S && G.map) {
    if (G.mode !== 'panel' || !['pause', 'mp_duelo', 'mp_convite'].includes(G.panelName)) { S.playTime += dt; updatePsyCountdown(dt); }
    if (G.mode === 'explore') updateWorld(dt);
    else { const P = G.player; if (P) { P.moving = false; P.frame = 0; } updateInteractPrompt(); }
    updateFx(dt);
    if (typeof mpTick === 'function') mpTick(dt);
    renderWorld(CTX);
    HUDT -= dt; if (HUDT <= 0) { HUDT = 0.1; updateHUD(); const run = document.querySelector('#touch [data-run]'); if (run) run.hidden = !hasSkill('int18'); }
  } else if (CTX) {
    CTX.fillStyle = '#0f1418'; CTX.fillRect(0, 0, VW, VH);
  }
  requestAnimationFrame(loop);
}

function boot() {
  CV = document.getElementById('game'); CV.width = VW; CV.height = VH;
  CTX = CV.getContext('2d'); CTX.imageSmoothingEnabled = false;
  try { buildMaps(); } catch (e) { console.error(e); }
  fitCanvas(); window.addEventListener('resize', fitCanvas);
  window.addEventListener('keydown', onKeyDown); window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', () => { G.keys = {}; G.touchDir = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveGame(); });
  window.addEventListener('beforeunload', saveGame);
  setupTouch();
  document.getElementById('hudMenu').onclick = () => { if (G.mode === 'explore') togglePanel('pause'); };
  document.querySelectorAll('[data-hud]').forEach(b => b.onclick = () => { if (G.mode === 'explore' || G.mode === 'panel') togglePanel(b.dataset.hud); });
  const hot = window.claude && window.claude.hot;
  if (hot && hot.snapshot) { try { hot.snapshot(() => (S && G.map ? { save: JSON.stringify(S) } : {})); } catch (e) { } }
  const start = data => {
    if (data && data.save) { try { const d = migrateSave(JSON.parse(data.save)); if (d) { S = d; startExplore(true); requestAnimationFrame(loop); return; } } catch (e) { } }
    showTitle(); requestAnimationFrame(loop);
  };
  if (hot && hot.ready) hot.ready(start); else start((hot && hot.data) || {});
}
window.addEventListener('DOMContentLoaded', boot);
