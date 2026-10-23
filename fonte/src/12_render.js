/* =====================================================================
   RENDERIZAÇÃO DO MUNDO
   ===================================================================== */
function drawEnt(c, e, cx, cy) {
  const L = lookOf(e); if (!L) return;
  let pose = e.moving ? 'walk' : (e.pose || 'idle');
  if (e.psy && !e.moving) pose = Math.floor(G.t * 5) % 2 ? 'cast' : 'idle';
  if (e.emerg && !e.moving) pose = Math.floor(G.t * 3) % 2 ? 'interact' : 'idle';
  const frame = pose === 'idle' ? Math.floor(G.t * 1.5 + (e.x || 0) * 0.37 + (e.y || 0) * 0.21) % 2 : e.frame;
  const sp = SPR.char(L, e.dir, frame, pose);
  const sx = Math.round(e.x * TS - SW / 2 - cx + (e.psy ? Math.sin(G.t * 41) * 1.4 : 0)), sy = Math.round(e.y * TS - SH + 4 - cy);
  const fx = sx + SW / 2, fy = sy + SH - 3;
  if (e.psy || e.emerg) { const a = 0.25 + 0.2 * Math.sin(G.t * 8); c.fillStyle = `rgba(255,70,70,${a})`; for (let k = -6; k <= 6; k++) { const w = Math.round(20 * Math.sqrt(1 - (k * k) / 42)); c.fillRect(fx - w, fy + k, w * 2, 1); } }
  c.fillStyle = 'rgba(14,10,26,0.26)'; for (let k = -3; k <= 3; k++) { const w = Math.round(11 * Math.sqrt(1 - (k * k) / 12.5)); c.fillRect(fx - w, fy + k, w * 2, 1); }
  c.drawImage(sp, sx, sy);
  return [sx, sy];
}
function bubble(c, x, y, txt, bg = '#fffef6', fg = '#1b1622') {
  const w = text57W(txt) + 10, h = 15, bx = Math.round(x - w / 2), by = Math.round(y - h - 6);
  c.fillStyle = OUTLINE; c.fillRect(bx - 1, by - 1, w + 2, h + 2); c.fillRect(x - 3, by + h, 6, 3);
  c.fillStyle = bg; c.fillRect(bx, by, w, h); c.fillRect(x - 2, by + h, 4, 2); c.fillStyle = '#dcd8cc'; c.fillRect(bx, by + h - 2, w, 2);
  text57(c, txt, bx + 5, by + 4, fg);
}
function marker(c, x, y, kind) {
  const b = Math.round(Math.sin(G.t * 5) * 3); x = Math.round(x); y = Math.round(y) + b;
  const col = kind === 'main' ? '#ffcf3a' : kind === 'side' ? '#7af0ff' : kind === 'caso' ? '#ff5a5a' : '#ffffff';
  const R = PAL.ramp(col), H = PAL.hex;
  c.fillStyle = OUTLINE; c.fillRect(x - 7, y - 27, 14, 21); c.fillRect(x - 3, y - 6, 6, 3);
  c.fillStyle = H(R.b); c.fillRect(x - 6, y - 26, 12, 19); c.fillStyle = H(R.l2); c.fillRect(x - 6, y - 26, 12, 2); c.fillRect(x - 6, y - 26, 2, 19);
  c.fillStyle = H(R.d1); c.fillRect(x + 4, y - 24, 2, 17); c.fillRect(x - 6, y - 9, 12, 2); c.fillRect(x - 2, y - 7, 4, 2);
  c.fillStyle = OUTLINE; c.fillRect(x - 2, y - 23, 4, 9); c.fillRect(x - 2, y - 12, 4, 3);
}
function sparkle(c, x, y) { const t = G.t * 4 + x; const s = Math.round(Math.abs(Math.sin(t)) * 4 + 2); c.fillStyle = '#fff6b0'; c.fillRect(x - s, y, s * 2 + 1, 1); c.fillRect(x, y - s, 1, s * 2 + 1); c.fillStyle = '#ffffff'; c.fillRect(x - 1, y - 1, 3, 3); }
function ecgAt(p) { if (p < 0.08) return 0; if (p < 0.14) return 0.25 * Math.sin((p - 0.08) / 0.06 * Math.PI); if (p < 0.28) return 0; if (p < 0.3) return -0.25; if (p < 0.33) return 1; if (p < 0.36) return -0.45; if (p < 0.52) return 0; if (p < 0.64) return 0.3 * Math.sin((p - 0.52) / 0.12 * Math.PI); return 0; }
function animObj(c, o, d, px, py) {
  const [sx, sy, sw, sh] = d.screen; const x0 = px + sx, y0 = py + sy;
  if (d.anim === 'monitor' || d.anim === 'anest') {
    const head = Math.floor((G.t * 22 + o.x * 9) % sw);
    for (let k = 0; k < sw; k++) {
      const age = (head - k + sw) % sw; if (age > sw - 4) continue;
      const v = ecgAt(((k + Math.floor(o.x * 9)) % 20) / 20);
      c.fillStyle = age < 2 ? '#d8ffe4' : age < 8 ? '#5af08a' : 'rgba(90,240,138,0.45)';
      c.fillRect(x0 + k, Math.round(y0 + sh * 0.42 - v * sh * 0.32), 1, age < 2 ? 2 : 1);
    }
    pixText(c, String(72 + (o.x * 3 + o.y) % 25), x0 + 1, y0 + sh - 6, '#5af08a'); pixText(c, String(95 + (o.x + o.y) % 5), x0 + sw - 8, y0 + sh - 6, '#6fd8ff');
    if (d.anim === 'anest') { for (let k = 0; k < sw; k++) { const v = Math.sin((k + G.t * 14) / 4) * 0.5 + 0.5; c.fillStyle = 'rgba(255,216,74,0.8)'; c.fillRect(x0 + k, Math.round(y0 + sh * 0.75 - v * 2), 1, 1); } }
  } else if (d.anim === 'vent') {
    for (let k = 0; k < sw; k++) { const p = ((k + G.t * 16) % 16) / 16; const v = p < 0.35 ? Math.sin(p / 0.35 * Math.PI / 2) : Math.max(0, 1 - (p - 0.35) * 3); c.fillStyle = '#ffd84a'; c.fillRect(x0 + k, Math.round(y0 + sh - 3 - v * (sh - 5)), 1, 1); }
    pixText(c, 'PEEP', x0 + 1, y0 + 1, '#6fd8ff');
  } else if (d.anim === 'usg') {
    for (let k = 0; k < 18; k++) { const a = -0.9 + k * 0.1; const r = 3 + (hsh(k, Math.floor(G.t * 6)) * (sh - 3)); c.fillStyle = 'rgba(200,200,200,0.55)'; c.fillRect(Math.round(x0 + sw / 2 + Math.sin(a) * r), Math.round(y0 + 1 + Math.cos(a) * r), 1, 1); }
  }
}

// barra de luzes da ambulância: vermelho alternado com estrobo branco
function giroflex(c, o, px, py) {
  if (px < -140 || px > VW + 10 || py < -60 || py > VH + 40) return;
  const W = 128, seg = [[79, 83], [85, 89], [91, 95]].map(([a, b]) => o.vira ? [W - 1 - b, W - 1 - a] : [a, b]);
  const ph = Math.floor(G.t * 7) % 6, on = [ph === 0 || ph === 2, ph === 4, ph === 1 || ph === 3];
  seg.forEach(([a, b], k) => {
    if (!on[k]) return; const col = k === 1 ? '255,255,255' : '255,70,60';
    c.fillStyle = 'rgba(' + col + ',0.22)'; c.fillRect(px + a - 6, py - 48, b - a + 13, 24);
    c.fillStyle = 'rgba(' + col + ',0.75)'; c.fillRect(px + a, py - 40, b - a + 1, 11);
  });
}
function questTargetsInMap() {
  const out = []; const M = G.map;
  const a = currentArea(); const st = a && chainStep(a);
  if (st) {
    if (['talk', 'challenge', 'boss'].includes(st.tipo)) { const n = G.npcs.find(n => n.id === st.alvo); if (n) out.push({ x: n.x, y: n.y - 1.8, k: 'main' }); }
    if (st.tipo === 'find') { const oid = S.flags['find_' + st.obj]; const o = M.objs.find(o => o.id === oid); if (o) out.push({ x: o.x + o.w / 2, y: o.y, k: 'main', sparkle: true }); }
    if (st.tipo === 'proc' && M.id === a) {
      const objs = st.spotObj ? M.objs.filter(o => o.type === st.spotObj && (!st.spotMap || M.id === st.spotMap) && (st.spotObj !== 'pia' || o.y < 12)) : M.objs.filter(o => o.spot === 'proc');
      for (const o of objs.slice(0, 3)) out.push({ x: o.x + o.w / 2, y: o.y, k: 'main' });
    }
  }
  for (const q of S.side) {
    const s = q.steps[q.i]; if (!s || s.map !== M.id) continue;
    if (s.k === 'obj') { if ((s.hidden || s.seek) && !hasSkill('int12')) continue; const o = s.prop || M.objs.find(o => o.id === s.obj); if (o) out.push({ x: o.x + o.w / 2, y: o.y, k: 'side' }); }
    if (s.k === 'have') { const o = M.objs.find(o => o.id === s.obj); if (o && invCount(s.item) === 0) out.push({ x: o.x + o.w / 2, y: o.y, k: 'side' }); }
    if (s.k === 'npc') { const n = G.npcs.find(n => n.id === s.npc); if (n) out.push({ x: n.x, y: n.y - 1.8, k: 'side' }); }
    if (s.k === 'escort') out.push({ x: s.x, y: s.y - 1, k: 'side' });
  }
  return out;
}

function renderWorld(c) {
  const M = G.map; if (!M) return;
  c.fillStyle = '#121018'; c.fillRect(0, 0, VW, VH);
  let cx = Math.round(G.camera.x), cy = Math.round(G.camera.y);
  if (G.shake > 0) { cx += Math.round(U.rnd(-4, 4)); cy += Math.round(U.rnd(-4, 4)); }
  c.drawImage(M.canvas, -cx, -cy);
  // telas animadas (ECG, ventilador, ultrassom)
  for (const o of M.objs) {
    const d = OBJ_DEFS[o.type]; if (!d.anim || d.anim === 'giroflex') continue;
    const px = o.x * TS - cx, py = o.y * TS - cy; if (px < -40 || px > VW + 8 || py < -40 || py > VH + 8) continue;
    animObj(c, o, d, px, py);
  }
  // lâmpadas piscando em letreiros
  for (const an of (M.anims || [])) if (an.kind === 'lampadas') {
    const ph = Math.floor(G.t * 4) % 2; let k = 0;
    const lamp = (x, y) => { const on = (k++ + ph) % 2 === 0; c.fillStyle = on ? '#fff3a0' : '#7a5a1a'; c.fillRect(Math.round(x - cx), Math.round(y - cy), 3, 3); if (on) { c.fillStyle = 'rgba(255,230,120,0.35)'; c.fillRect(Math.round(x - cx) - 1, Math.round(y - cy) - 1, 5, 5); } };
    const x0 = an.x + 22, x1 = an.x + an.w - 25, y0 = an.y + 10, y1 = an.y + an.h - 24;
    for (let x = x0; x <= x1; x += 8) { lamp(x, y0); lamp(x, y1); } for (let y = y0 + 8; y < y1; y += 8) { lamp(x0, y); lamp(x1, y); }
  }
  // pacientes nos leitos
  for (const sp of G.spots) {
    const o = sp.obj; if (o.spot !== 'caso' || !sp.s.look) continue;
    const px = o.x * TS - cx, py = o.y * TS - cy; if (px < -40 || px > VW + 40 || py < -70 || py > VH + 40) continue;
    const L = sp.s.look;
    if (o.bebe || o.type === 'berco' || o.type === 'incubadora') SPR.babyIn(c, px, py, { skin: L.skin, wrap: U.pick ? ['#f6d1df', '#cfe6f5', '#fff3b0'][sp.s.seed % 3] : '#f6d1df', ict: sp.s.caseId && sp.s.caseId.startsWith('ped_ict') });
    else if (o.h === 2) SPR.patientInBed(c, px, py, { skin: L.skin, hairC: L.hairC, long: ['longo', 'rabo', 'trancas', 'ondulado'].includes(L.hair), blanket: o.blanket && o.type !== 'mesa_cirurgica' ? U.shade(o.blanket, -0.06) : (o.type === 'mesa_cirurgica' ? '#3f8fd6' : '#9ec7e6') });
    else { const e = { x: o.x + o.w / 2 + (o.w > 1 ? 0 : 0), y: o.y + o.h + 0.75, dir: 1, frame: 0, look: L, pose: 'idle' }; if (sp.s.active) drawEnt(c, e, cx, cy); }
  }
  // objetos físicos de missões (ex.: carrinho de ultrassom perdido)
  for (const o of sideProps(M.id)) { const px = o.x * TS - cx, py = o.y * TS - cy; if (px > -48 && px < VW + 16 && py > -48 && py < VH + 16) { c.fillStyle = 'rgba(16,12,30,0.2)'; c.fillRect(px + 4, py + 26, 26, 5); drawObj(c, o, px, py); } }
  // entidades ordenadas por profundidade
  const ents = G.npcs.concat(G.followers, [G.player], typeof mpGhostsHere === 'function' ? mpGhostsHere() : []).sort((a, b) => a.y - b.y);
  const heads = [];
  for (const e of ents) { const r = e.mp ? mpDrawGhost(c, e, cx, cy) : drawEnt(c, e, cx, cy); if (r && e.bubble && e.bubbleT > 0) heads.push([r[0] + SW / 2, r[1] + 8, e.bubble]); }
  c.drawImage(M.overlay, -cx, -cy);
  for (const o of M.objs) if (o.type === 'ambulancia') giroflex(c, o, o.x * TS - cx, o.y * TS - cy);
  // marcadores
  for (const sp of G.spots) if (sp.s.active && sp.obj.spot === 'caso') marker(c, (sp.obj.x + sp.obj.w / 2) * TS - cx, sp.obj.y * TS - cy + 4, 'caso');
  const targets = questTargetsInMap();
  for (const t of targets) { const x = t.x * TS - cx, y = t.y * TS - cy; marker(c, x, y, t.k); if (t.sparkle) { sparkle(c, x - 12, y + 20); sparkle(c, x + 14, y + 28); } }
  for (const h of heads) bubble(c, h[0], h[1], h[2]);
  if (typeof mpNameTags === 'function') mpNameTags(c, cx, cy);
  // crise psicótica: cronômetro sobre o paciente e seta quando fora da tela
  if (G.psy && G.psy.map === M.id && !G.psy.attending) {
    const e = G.psy.ent, x = Math.round(e.x * TS - cx), y = Math.round(e.y * TS - SH + 4 - cy) + 6;
    bubble(c, x, y, U.fmtTime(Math.max(0, G.psy.t)), G.psy.t < 10 ? '#ff4a4a' : '#ffd84a', '#1b1622');
    if (x < 0 || x > VW || y < 0 || y > VH + 40) { const ax = U.clamp(x, 18, VW - 18), ay = U.clamp(y + 30, 18, VH - 18); c.fillStyle = Math.floor(G.t * 6) % 2 ? '#ff4a4a' : '#ffffff'; c.save(); c.translate(ax, ay); c.rotate(Math.atan2(y + 30 - ay, x - ax)); c.beginPath(); c.moveTo(14, 0); c.lineTo(-9, -10); c.lineTo(-9, 10); c.fill(); c.restore(); }
  }
  // setas para objetivos fora da tela (Mapa Mental do Hospital)
  if (hasSkill('int8')) for (const t of targets) {
    const x = t.x * TS - cx, y = t.y * TS - cy;
    if (x >= 0 && x <= VW && y >= 0 && y <= VH) continue;
    const ax = U.clamp(x, 16, VW - 16), ay = U.clamp(y, 16, VH - 16);
    c.fillStyle = t.k === 'main' ? '#ffcf3a' : '#7af0ff'; c.save(); c.translate(ax, ay); c.rotate(Math.atan2(y - ay, x - ax)); c.beginPath(); c.moveTo(12, 0); c.lineTo(-8, -8); c.lineTo(-8, 8); c.fill(); c.restore();
  }
  // partículas
  for (const p of G.particles) { c.fillStyle = p.c; c.fillRect(Math.round(p.x - cx), Math.round(p.y - cy), 3, 3); }
  // fade de transição
  if (G.fade > 0) { c.fillStyle = `rgba(10,8,14,${G.fade})`; c.fillRect(0, 0, VW, VH); }
}
function updateFx(dt) {
  for (const p of G.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 180 * dt; p.life -= dt; }
  G.particles = G.particles.filter(p => p.life > 0);
  if (G.fadeOut) { G.fade = Math.min(1, G.fade + dt * 5); if (G.fade >= 1) { G.fadeOut = 0; const f = G.fadeFn; G.fadeFn = null; if (f) f(); } }
  else if (G.fade > 0) G.fade = Math.max(0, G.fade - dt * 3);
  if (G.shake > 0) G.shake -= dt;
}
