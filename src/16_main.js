/* =====================================================================
   INICIALIZAÇÃO, ENTRADA E LAÇO PRINCIPAL
   ===================================================================== */
let CTX = null, CV = null, LAST = 0, HUDT = 0;
const MOVE_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW', 'KeyA', 'KeyS', 'KeyD'];

function fitCanvas() {
  const st = document.getElementById('stage'); if (!st || !CV) return;
  const w = st.clientWidth, h = st.clientHeight;
  let s = Math.min(w / VW, h / VH); if (s >= 1 && !IS_TOUCH) { const f = Math.floor(s); if (f / s >= 0.8) s = f; }
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

/* Joystick analógico de toque: o dedo encosta em qualquer ponto do lado esquerdo,
   a base aparece ali e o pino segue o dedo. Quanto mais longe do centro, mais rápido anda. */
const JOY = { id: null, cx: 0, cy: 0, R: 46 };
let joyReset = () => { G.touchDir = null; G.touchMag = 0; };
const IS_TOUCH = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
function TECLA_E() { return IS_TOUCH ? 'AGIR' : 'E'; }
function telaCheia(forcar) {
  const el = document.documentElement, fs = document.fullscreenElement || document.webkitFullscreenElement;
  if (fs) { if (forcar === 'sair') (document.exitFullscreen || document.webkitExitFullscreen || (() => { })).call(document); return; }
  if (!IS_TOUCH && !forcar) return;
  const req = el.requestFullscreen || el.webkitRequestFullscreen; if (!req) return;
  try {
    const p = req.call(el, { navigationUI: 'hide' });
    const lock = () => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => { }); } catch (e) { } };
    if (p && p.then) p.then(lock).catch(() => { }); else lock();
  } catch (e) { }
}
function setupTouch() {
  const t = document.getElementById('touch'); if (!t) return;
  const zone = document.getElementById('joyZone');
  if (zone) {
    const base = zone.querySelector('.joy-base'), knob = zone.querySelector('.joy-knob');
    joyReset = () => { JOY.id = null; base.removeAttribute('style'); base.classList.remove('on'); knob.style.transform = ''; G.touchDir = null; G.touchMag = 0; };
    const move = (x, y) => {
      let dx = x - JOY.cx, dy = y - JOY.cy; const d = Math.hypot(dx, dy), R = JOY.R;
      if (d > R) { dx = dx / d * R; dy = dy / d * R; }
      knob.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)`;
      const mag = Math.min(1, d / R);
      if (mag < 0.2) { G.touchDir = null; G.touchMag = 0; } else { G.touchDir = [dx / Math.hypot(dx, dy), dy / Math.hypot(dx, dy)]; G.touchMag = mag; }
    };
    zone.addEventListener('pointerdown', e => {
      if (JOY.id !== null) return;
      e.preventDefault(); SFX.init();
      const zr = zone.getBoundingClientRect(); JOY.R = (base.offsetWidth || 92) / 2;
      JOY.id = e.pointerId; try { zone.setPointerCapture(e.pointerId); } catch (_) { }
      const m = JOY.R + 4;
      JOY.cx = Math.max(zr.left + m, Math.min(zr.right - m, e.clientX)); JOY.cy = Math.max(zr.top + m, Math.min(zr.bottom - m, e.clientY));
      base.style.left = (JOY.cx - zr.left - JOY.R) + 'px'; base.style.top = (JOY.cy - zr.top - JOY.R) + 'px'; base.style.bottom = 'auto';
      base.classList.add('on'); move(e.clientX, e.clientY);
    });
    zone.addEventListener('pointermove', e => { if (e.pointerId === JOY.id) { e.preventDefault(); move(e.clientX, e.clientY); } });
    const end = e => { if (e.pointerId === JOY.id) joyReset(); };
    ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => zone.addEventListener(ev, end));
    zone.addEventListener('contextmenu', e => e.preventDefault());
  }
  t.addEventListener('contextmenu', e => e.preventDefault());
  // pointerdown (e não click): o celular não gera "click" para o segundo dedo, e o jogador
  // precisa apertar AGIR ou abrir um menu enquanto segura o joystick
  t.querySelectorAll('[data-k]').forEach(b => b.addEventListener('pointerdown', e => {
    if (e.button > 0) return;
    e.preventDefault(); SFX.init(); const k = b.dataset.k;
    if (navigator.vibrate) try { navigator.vibrate(8); } catch (_) { }
    if (G.mode === 'dialog') { G.dialog && G.dialog.next(); return; }
    if (k === 'E') { if (G.mode === 'explore') interact(); else if (G.mode === 'proc' && G.execPress) G.execPress(); }
    else if (G.mode === 'explore' || G.mode === 'panel') togglePanel(k);
  }));
  const run = t.querySelector('[data-run]'); if (run) { run.addEventListener('pointerdown', e => { e.preventDefault(); G.touchSprint = true; }); ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(ev => run.addEventListener(ev, () => G.touchSprint = false)); }
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
  window.addEventListener('blur', () => { G.keys = {}; joyReset(); });
  document.body.classList.toggle('is-touch', IS_TOUCH);
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
