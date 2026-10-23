/* =====================================================================
   PINTURAS DE PAREDE DA PEDIATRIA
   Bichinhos, sol, lua, estrelas, flores... pintados direto na parede
   (sem moldura, sem fundo): só a tinta com o contorno escuro do pincel.
   Cada parede recebe uma "faixa" de colunas (bicho no chão + algo no céu)
   e as pinturas nunca cobrem portas nem janelas.
   ===================================================================== */
// ---------- formas (máscara + caixa) ----------
const MS = {
  ell(cx, cy, rx, ry) { return { bb: [cx - rx - 1, cy - ry - 1, cx + rx + 1, cy + ry + 1], f: (x, y) => { const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; return dx * dx + dy * dy <= 1; } }; },
  rect(x0, y0, w, h) { return { bb: [x0, y0, x0 + w, y0 + h], f: (x, y) => x >= x0 && x < x0 + w && y >= y0 && y < y0 + h }; },
  cap(x0, y0, x1, y1, r) {
    const dx = x1 - x0, dy = y1 - y0, L2 = dx * dx + dy * dy || 1;
    return { bb: [Math.min(x0, x1) - r - 1, Math.min(y0, y1) - r - 1, Math.max(x0, x1) + r + 1, Math.max(y0, y1) + r + 1], f: (x, y) => { const px = x + 0.5 - x0, py = y + 0.5 - y0; const t = Math.max(0, Math.min(1, (px * dx + py * dy) / L2)); const ex = px - t * dx, ey = py - t * dy; return ex * ex + ey * ey <= r * r; } };
  },
  poly(pts) { const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]); return { bb: [Math.min(...xs) - 1, Math.min(...ys) - 1, Math.max(...xs) + 1, Math.max(...ys) + 1], f: (x, y) => polyIn(pts, x + 0.5, y + 0.5) }; },
  star(cx, cy, ro, ri, rot = -Math.PI / 2) { const p = []; for (let k = 0; k < 10; k++) { const a = rot + k * Math.PI / 5, r = k % 2 ? ri : ro; p.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } return MS.poly(p); },
  or(...s) { return { bb: [Math.min(...s.map(a => a.bb[0])), Math.min(...s.map(a => a.bb[1])), Math.max(...s.map(a => a.bb[2])), Math.max(...s.map(a => a.bb[3]))], f: (x, y) => s.some(a => a.f(x, y)) }; },
  sub(a, b) { return { bb: a.bb, f: (x, y) => a.f(x, y) && !b.f(x, y) }; },
  and(a, b) { return { bb: a.bb, f: (x, y) => a.f(x, y) && b.f(x, y) }; },
  above(a, yMax) { return { bb: a.bb, f: (x, y) => y <= yMax && a.f(x, y) }; },
};
// pinta uma forma: tinta chapada + contorno de pincel (tom escuro da própria cor) + um toque de luz no alto
function mPaint(c, s, col, o = {}) {
  const R = PAL.ramp(col), H = PAL.hex;
  const ol = o.ol === null ? null : (o.ol || H(R.d2)), hl = o.hl === false ? null : H(R.l1);
  const [x0, y0, x1, y1] = s.bb.map(Math.round);
  for (let y = y0 - 1; y <= y1 + 1; y++) for (let x = x0 - 1; x <= x1 + 1; x++) {
    let k = null;
    if (s.f(x, y)) k = (hl && !s.f(x, y - 1) && s.f(x, y + 1) && s.f(x - 1, y) && !o.flat) ? hl : (o.fill ? o.fill(x, y) : col);
    else if (ol && (s.f(x + 1, y) || s.f(x - 1, y) || s.f(x, y + 1) || s.f(x, y - 1))) k = ol;
    if (k) { c.fillStyle = k; c.fillRect(x, y, 1, 1); }
  }
}
const mDot = (c, x, y, col, w = 1, h = 1) => { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), w, h); };
const INK = '#3a2e3a', CHEEK = '#f29bb0';
function mFace(c, x, y, o = {}) {           // olhos (x,y) = olho esquerdo; d = distância
  const d = o.d || 5;
  if (o.sleep) { mDot(c, x - 1, y, INK, 2, 1); mDot(c, x + d - 1, y, INK, 2, 1); }
  else { mDot(c, x, y, INK, 1, 2); mDot(c, x + d, y, INK, 1, 2); }
  if (o.cheek !== false) { mDot(c, x - 2, y + 3, CHEEK, 2, 1); mDot(c, x + d + 1, y + 3, CHEEK, 2, 1); }
  if (o.smile !== false) { const mx = x + Math.floor(d / 2); mDot(c, mx - 1, y + 3, INK); mDot(c, mx, y + 4, INK); mDot(c, mx + 1, y + 3, INK); }
}

// ---------- os desenhos (cx = centro, by = linha do chão / cy = centro no céu) ----------
const MURAL_ART = {
  girafa(c, cx, by) {
    const Y = '#f2c14e', B = '#c9823a';
    mPaint(c, MS.or(MS.cap(cx + 13, by - 40, cx + 12, by - 45, 1), MS.cap(cx + 17, by - 40, cx + 17, by - 45, 1)), '#a8682e');
    const legs = [cx - 9, cx - 4, cx + 3, cx + 8].map(lx => MS.rect(lx, by - 13, 3, 13));
    mPaint(c, MS.or(MS.ell(cx, by - 16, 13, 6.5), MS.cap(cx + 8, by - 18, cx + 14, by - 35, 3.2), MS.ell(cx + 16, by - 37, 6, 4.2), MS.cap(cx - 12, by - 17, cx - 15, by - 9, 0.8), ...legs), Y);
    for (const [sx, sy, r] of [[cx - 6, by - 17, 2.4], [cx + 1, by - 14, 2], [cx + 6, by - 19, 2.2], [cx - 1, by - 20, 1.8], [cx - 10, by - 14, 1.6], [cx + 10, by - 24, 1.6], [cx + 12, by - 30, 1.5]]) mPaint(c, MS.ell(sx, sy, r, r * 0.85), B, { ol: null, flat: true });
    mPaint(c, MS.ell(cx + 20, by - 35, 3.4, 2.8), '#f7dc98');
    mPaint(c, MS.ell(cx + 12, by - 39, 2.4, 1.4), Y);
    for (const lx of [cx - 9, cx - 4, cx + 3, cx + 8]) mDot(c, lx, by - 2, '#7a4a22', 3, 2);
    mPaint(c, MS.ell(cx - 15, by - 8, 1.5, 2), '#7a4a22', { ol: null });
    for (let k = 0; k < 5; k++) mDot(c, cx + 9 - Math.round(k * 0.6), by - 22 - k * 3, '#a8682e', 1, 2);
    mDot(c, cx + 16, by - 38, INK, 1, 2); mDot(c, cx + 14, by - 35, CHEEK, 2, 1); mDot(c, cx + 20, by - 33, INK, 2, 1);
  },
  elefante(c, cx, by) {
    const G = '#9fb6cf';
    mPaint(c, MS.or(MS.ell(cx - 2, by - 12, 13, 9), MS.rect(cx - 12, by - 8, 5, 8), MS.rect(cx - 4, by - 7, 5, 7), MS.rect(cx + 3, by - 8, 5, 8), MS.ell(cx + 10, by - 18, 8, 7.5), MS.cap(cx + 15, by - 16, cx + 18, by - 7, 2.3), MS.cap(cx + 18, by - 7, cx + 21, by - 10, 1.8), MS.cap(cx - 14, by - 13, cx - 16, by - 7, 0.7)), G);
    mPaint(c, MS.ell(cx + 5, by - 18, 5, 6.5), '#8ea7c4'); mPaint(c, MS.ell(cx + 5, by - 18, 3, 4.5), '#f2bccb', { ol: null });
    for (const fx of [cx - 12, cx - 4, cx + 3]) { mDot(c, fx + 1, by - 1, '#ffffff'); mDot(c, fx + 3, by - 1, '#ffffff'); }
    mDot(c, cx + 12, by - 21, INK, 1, 2); mDot(c, cx + 14, by - 17, CHEEK, 2, 1);
    for (const [dx, dy] of [[23, -13], [25, -17], [22, -20], [26, -22]]) mPaint(c, MS.ell(cx + dx, by + dy, 1.2, 1.4), '#7fc7e9', { hl: false });
  },
  leao(c, cx, by) {
    mPaint(c, MS.or(MS.ell(cx - 3, by - 10, 11, 7), MS.rect(cx - 12, by - 7, 4, 7), MS.rect(cx - 4, by - 6, 4, 6), MS.rect(cx + 2, by - 7, 4, 7), MS.cap(cx - 13, by - 12, cx - 18, by - 19, 0.8)), '#eab54e');
    mPaint(c, MS.ell(cx - 18, by - 20, 2, 2.2), '#c9702e');
    const mane = []; for (let k = 0; k < 11; k++) { const a = k / 11 * Math.PI * 2; mane.push(MS.ell(cx + 8 + Math.cos(a) * 8.5, by - 19 + Math.sin(a) * 8.5, 3.6, 3.6)); }
    mPaint(c, MS.or(MS.ell(cx + 8, by - 19, 9, 9), ...mane), '#d07a34');
    mPaint(c, MS.or(MS.ell(cx + 3, by - 25, 2.4, 2.4), MS.ell(cx + 13, by - 25, 2.4, 2.4)), '#f6cd73');
    mPaint(c, MS.ell(cx + 8, by - 18, 6.6, 6), '#f6cd73');
    mPaint(c, MS.ell(cx + 8, by - 15, 3.6, 2.6), '#fbe6b8', { ol: null });
    mDot(c, cx + 7, by - 17, '#7a3a2a', 3, 1); mDot(c, cx + 8, by - 16, '#7a3a2a');
    mFace(c, cx + 5, by - 21, { d: 6, smile: false }); mDot(c, cx + 7, by - 13, INK); mDot(c, cx + 9, by - 13, INK); mDot(c, cx + 8, by - 14, INK);
  },
  macaco(c, cx, by) {
    const Br = '#9a6440', Sk = '#ecc89e';
    mPaint(c, MS.or(MS.cap(cx + 6, by - 3, cx + 12, by - 6, 1.3), MS.cap(cx + 12, by - 6, cx + 12, by - 12, 1.3), MS.cap(cx + 12, by - 12, cx + 9, by - 14, 1.3)), Br);
    mPaint(c, MS.or(MS.ell(cx, by - 8, 7, 8), MS.ell(cx - 7, by - 19, 2.6, 3), MS.ell(cx + 7, by - 19, 2.6, 3), MS.ell(cx, by - 19, 7, 6.5), MS.ell(cx - 4, by - 1, 3, 1.6), MS.ell(cx + 4, by - 1, 3, 1.6)), Br);
    mPaint(c, MS.ell(cx, by - 6, 4.5, 5), Sk, { ol: null });
    mPaint(c, MS.ell(cx, by - 18, 5, 4.6), Sk, { ol: null });
    mFace(c, cx - 2, by - 20, { d: 4 });
    mPaint(c, MS.cap(cx - 7, by - 9, cx - 3, by - 14, 1.4), '#f6d94a'); mDot(c, cx - 3, by - 15, '#7a5a1a');
  },
  tartaruga(c, cx, by) {
    mPaint(c, MS.or(MS.ell(cx - 7, by - 2, 3, 2.4), MS.ell(cx + 6, by - 2, 3, 2.4), MS.ell(cx + 13, by - 7, 4, 3.5), MS.cap(cx - 12, by - 4, cx - 14, by - 3, 1)), '#a7d98f');
    mPaint(c, MS.above(MS.ell(cx, by - 4, 11, 9), by - 4), '#5aa864');
    for (const [sx, sy] of [[cx - 5, by - 7], [cx + 1, by - 9], [cx + 6, by - 6], [cx - 1, by - 5]]) mPaint(c, MS.ell(sx, sy, 2.2, 1.6), '#8cd07f', { ol: null, flat: true });
    mDot(c, cx - 11, by - 4, '#3f8a4a', 23, 1);
    mDot(c, cx + 14, by - 9, INK, 1, 2); mDot(c, cx + 15, by - 6, INK, 2, 1); mDot(c, cx + 12, by - 6, CHEEK, 1, 1);
  },
  coelho(c, cx, by) {
    const W = '#fbfbfb', O = '#b9b9cc';
    mPaint(c, MS.or(MS.ell(cx - 1, by - 28, 2.2, 6.5), MS.ell(cx + 5, by - 28, 2.2, 6.5)), W, { ol: O });
    mPaint(c, MS.or(MS.ell(cx - 1, by - 28, 1, 4.5), MS.ell(cx + 5, by - 28, 1, 4.5)), '#f4b6c8', { ol: null });
    mPaint(c, MS.or(MS.ell(cx, by - 7, 7, 7), MS.ell(cx + 2, by - 17, 6, 5.5), MS.ell(cx - 7, by - 6, 2.6, 2.6), MS.ell(cx + 4, by - 1, 3, 1.5)), W, { ol: O });
    mFace(c, cx, by - 18, { d: 4 }); mDot(c, cx + 2, by - 16, '#f08aa8');
    mPaint(c, MS.poly([[cx - 6, by - 11], [cx - 2, by - 12], [cx - 10, by - 3]]), '#f08a32'); mDot(c, cx - 4, by - 14, '#4fa35a', 1, 2); mDot(c, cx - 3, by - 14, '#4fa35a', 1, 2);
  },
  urso(c, cx, by) {
    const Br = '#b97a4a';
    mPaint(c, MS.or(MS.ell(cx - 6, by - 24, 2.8, 2.8), MS.ell(cx + 6, by - 24, 2.8, 2.8), MS.ell(cx, by - 8, 8, 8), MS.ell(cx, by - 19, 7, 6.5), MS.ell(cx - 6, by - 1, 3.4, 2), MS.ell(cx + 6, by - 1, 3.4, 2), MS.ell(cx - 8, by - 10, 2.4, 4), MS.ell(cx + 8, by - 10, 2.4, 4)), Br);
    mPaint(c, MS.ell(cx, by - 7, 4.5, 4.5), '#e8c39a', { ol: null }); mPaint(c, MS.ell(cx, by - 16, 3, 2.2), '#e8c39a', { ol: null });
    mDot(c, cx - 1, by - 17, '#5a3420', 3, 1);
    mFace(c, cx - 3, by - 20, { d: 6, smile: false, sleep: true });
    mPaint(c, MS.or(MS.poly([[cx - 4, by - 14], [cx, by - 12], [cx - 4, by - 10]]), MS.poly([[cx + 4, by - 14], [cx, by - 12], [cx + 4, by - 10]])), '#e05a6a');
  },
  ovelha(c, cx, by, o = {}) {
    const lift = o.jump ? 8 : 0, y = by - lift;
    mPaint(c, MS.or(...[cx - 5, cx - 1, cx + 3].map(lx => MS.rect(lx, y - 6, 2, 6))), '#4a4550');
    const puff = []; for (let k = 0; k < 9; k++) { const a = k / 9 * Math.PI * 2; puff.push(MS.ell(cx - 1 + Math.cos(a) * 7, y - 11 + Math.sin(a) * 4.5, 3.2, 3.2)); }
    mPaint(c, MS.or(MS.ell(cx - 1, y - 11, 8, 5), ...puff), '#fbfbfb', { ol: '#b9b9cc' });
    mPaint(c, MS.or(MS.ell(cx + 9, y - 13, 3.6, 4.2), MS.ell(cx + 6, y - 15, 2, 1.2)), '#5a5560');
    mDot(c, cx + 10, y - 14, '#ffffff'); mDot(c, cx + 11, y - 11, CHEEK);
    if (o.jump) for (let k = 0; k < 3; k++) mDot(c, cx - 14 + k * 3, by - 3 - k, '#bcd3e6', 2, 1);
  },
  cerca(c, cx, by) {
    const Wd = '#d39a64';
    mPaint(c, MS.or(MS.rect(cx - 9, by - 13, 3, 13), MS.rect(cx + 6, by - 13, 3, 13), MS.rect(cx - 10, by - 10, 20, 2), MS.rect(cx - 10, by - 5, 20, 2)), Wd);
  },
  coruja(c, cx, by) {
    mPaint(c, MS.or(MS.cap(cx - 16, by - 6, cx + 14, by - 9, 1.6), MS.cap(cx + 2, by - 8, cx + 8, by - 2, 1.2)), '#8a5a34');
    mPaint(c, MS.or(MS.ell(cx - 14, by - 9, 3, 1.6), MS.ell(cx + 12, by - 12, 3, 1.6)), '#5aa864');
    mPaint(c, MS.or(MS.ell(cx, by - 15, 6, 7.5), MS.poly([[cx - 6, by - 21], [cx - 5, by - 26], [cx - 2, by - 22]]), MS.poly([[cx + 6, by - 21], [cx + 5, by - 26], [cx + 2, by - 22]])), '#9a7a5a');
    mPaint(c, MS.ell(cx, by - 12, 3.6, 4), '#e8d6b0', { ol: null });
    mPaint(c, MS.or(MS.ell(cx - 2.6, by - 18, 2.6, 2.6), MS.ell(cx + 2.6, by - 18, 2.6, 2.6)), '#ffffff', { ol: '#6a5a4a', hl: false });
    mDot(c, cx - 3, by - 18, INK, 1, 2); mDot(c, cx + 2, by - 18, INK, 1, 2);
    mDot(c, cx - 1, by - 15, '#f0a040', 2, 2);
    for (const fx of [cx - 3, cx + 1]) mDot(c, fx, by - 8, '#f0a040', 2, 1);
  },
  arvore(c, cx, by, o = {}) {
    mPaint(c, MS.or(MS.cap(cx, by, cx, by - 18, 2.6), MS.cap(cx, by - 12, cx + 6, by - 18, 1.2)), '#9a6a3e');
    mPaint(c, MS.or(MS.ell(cx - 7, by - 24, 8, 7), MS.ell(cx + 7, by - 24, 8, 7), MS.ell(cx, by - 31, 9, 8), MS.ell(cx, by - 21, 10, 5)), o.cor || '#5fb35a');
    for (const [fx, fy] of (o.frutas === false ? [] : [[cx - 8, by - 24], [cx + 5, by - 29], [cx + 9, by - 21], [cx - 2, by - 33], [cx - 3, by - 20]])) mPaint(c, MS.ell(fx, fy, 1.6, 1.6), '#e8564e', { hl: false });
  },
  arvore_coruja(c, cx, by) {
    MURAL_ART.arvore(c, cx, by, { frutas: false, cor: '#4f9a6a' });
    mPaint(c, MS.ell(cx + 1, by - 24, 4, 3), '#3a6a4a', { ol: null });   // oco
    MURAL_ART.coruja(c, cx + 1, by - 18);
  },
  vaca(c, cx, by) {
    mPaint(c, MS.or(MS.ell(cx - 2, by - 12, 12, 7.5), MS.rect(cx - 11, by - 7, 4, 7), MS.rect(cx - 4, by - 6, 4, 6), MS.rect(cx + 3, by - 7, 4, 7), MS.ell(cx + 12, by - 15, 5.5, 6), MS.cap(cx - 14, by - 14, cx - 16, by - 6, 0.7)), '#fbfbfb', { ol: '#a9a9bd' });
    for (const [sx, sy, rx, ry] of [[cx - 6, by - 14, 3.4, 2.6], [cx + 2, by - 10, 2.8, 2.2], [cx - 9, by - 9, 1.6, 1.6], [cx + 13, by - 18, 2, 1.8]]) mPaint(c, MS.ell(sx, sy, rx, ry), '#3a3540', { ol: null, flat: true });
    mPaint(c, MS.ell(cx + 13, by - 11, 4.4, 3), '#f4b6c8');
    mPaint(c, MS.or(MS.cap(cx + 9, by - 20, cx + 7, by - 23, 0.8), MS.cap(cx + 15, by - 20, cx + 17, by - 23, 0.8)), '#f2e0b0');
    mDot(c, cx + 12, by - 11, '#c0607a'); mDot(c, cx + 14, by - 11, '#c0607a');
    mDot(c, cx + 10, by - 16, INK, 1, 2); mDot(c, cx + 15, by - 16, INK, 1, 2);
    mPaint(c, MS.ell(cx - 16, by - 5, 1.4, 1.8), '#3a3540', { ol: null });
    mPaint(c, MS.ell(cx - 1, by - 5, 3, 1.6), '#f4b6c8', { ol: null });
  },
  porquinho(c, cx, by) {
    const P = '#f4a9bd';
    mPaint(c, MS.or(MS.ell(cx - 1, by - 8, 9, 6.5), MS.rect(cx - 8, by - 4, 3, 4), MS.rect(cx - 2, by - 3, 3, 3), MS.rect(cx + 3, by - 4, 3, 4), MS.ell(cx + 8, by - 11, 5, 5), MS.poly([[cx + 5, by - 15], [cx + 6, by - 19], [cx + 9, by - 15]])), P);
    mPaint(c, MS.ell(cx + 12, by - 10, 2.4, 2), '#f78fae'); mDot(c, cx + 11, by - 10, '#c0607a'); mDot(c, cx + 13, by - 10, '#c0607a');
    mDot(c, cx + 8, by - 13, INK, 1, 2);
    for (const [dx, dy] of [[-10, -9], [-11, -10], [-12, -9], [-11, -8]]) mDot(c, cx + dx, by + dy, '#d77a98');
  },
  pintinhos(c, cx, by) {
    for (const [dx, s] of [[-9, 1], [0, 0.85], [8, 0.75]]) {
      const x = cx + dx; mPaint(c, MS.or(MS.ell(x, by - 4 * s, 4.5 * s, 4 * s), MS.ell(x + 3 * s, by - 9 * s, 3 * s, 3 * s)), '#f7d74a');
      mPaint(c, MS.ell(x + 6.5 * s, by - 9 * s, 1.6, 1), '#f08a32', { ol: null }); mDot(c, x + 3 * s + 1, by - 10 * s, INK);
    }
  },
  patos(c, cx, by) {
    for (const [dx, s] of [[-14, 1], [0, 0.85], [12, 0.75]]) {
      const x = cx + dx; mPaint(c, MS.or(MS.ell(x, by - 5 * s, 6 * s, 4.5 * s), MS.ell(x + 5 * s, by - 11 * s, 3.6 * s, 3.6 * s), MS.poly([[x - 6 * s, by - 7 * s], [x - 9 * s, by - 10 * s], [x - 4 * s, by - 5 * s]])), '#f7d74a');
      mPaint(c, MS.ell(x + 9 * s, by - 10 * s, 2.2, 1.2), '#f08a32', { ol: null }); mDot(c, x + 5 * s + 1, by - 12 * s, INK);
      mDot(c, x - 2, by - 6 * s, '#e0b030', 4, 1);
    }
  },
  joaninha(c, cx, by) {
    mPaint(c, MS.or(MS.cap(cx - 6, by, cx + 6, by - 1, 0.6), MS.ell(cx + 4, by - 3, 2.4, 2.2)), '#3a3540');
    mPaint(c, MS.above(MS.ell(cx - 1, by - 2, 5, 4.4), by - 1), '#e8463e');
    mDot(c, cx - 1, by - 6, '#3a3540', 1, 5);
    for (const [dx, dy] of [[-4, -3], [1, -4], [-3, -5], [2, -2]]) mDot(c, cx + dx, by + dy, '#3a3540', 2, 1);
  },
  flor(c, cx, by, o = {}) {
    const col = o.cor || '#f28ab0';
    mPaint(c, MS.or(MS.cap(cx, by, cx, by - 13, 0.8), MS.ell(cx + 3, by - 6, 3, 1.4), MS.ell(cx - 3, by - 9, 2.6, 1.3)), '#4fa35a');
    const pet = []; for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; pet.push(MS.ell(cx + Math.cos(a) * 3.6, by - 16 + Math.sin(a) * 3.6, 2.4, 2.4)); }
    mPaint(c, MS.or(...pet), col);
    mPaint(c, MS.ell(cx, by - 16, 2, 2), '#f7d14a', { hl: false });
  },
  tulipa(c, cx, by, o = {}) {
    mPaint(c, MS.or(MS.cap(cx, by, cx, by - 12, 0.8), MS.ell(cx - 3, by - 5, 3, 1.4)), '#4fa35a');
    mPaint(c, MS.or(MS.above(MS.ell(cx, by - 14, 4, 4.6), by - 11), MS.poly([[cx - 4, by - 15], [cx - 3, by - 20], [cx - 1, by - 16], [cx, by - 20], [cx + 1, by - 16], [cx + 3, by - 20], [cx + 4, by - 15]])), o.cor || '#e8564e');
  },
  baleia(c, cx, by) {
    const Bl = '#5b8fd6';
    mPaint(c, MS.or(MS.ell(cx, by - 10, 20, 9.5), MS.cap(cx - 18, by - 10, cx - 25, by - 16, 2.4), MS.poly([[cx - 25, by - 16], [cx - 31, by - 22], [cx - 26, by - 13], [cx - 30, by - 9], [cx - 23, by - 13]])), Bl);
    mPaint(c, MS.and(MS.ell(cx + 2, by - 9, 17, 7.5), MS.rect(cx - 30, by - 8, 60, 20)), '#bcd8f4', { ol: null, flat: true });
    for (let k = 0; k < 4; k++) mDot(c, cx - 4 + k * 5, by - 6, '#9cbfe6', 3, 1);
    mPaint(c, MS.ell(cx - 4, by - 9, 3.4, 2), '#4a7cc0', { ol: null });
    mDot(c, cx + 11, by - 13, INK, 1, 2); mDot(c, cx + 13, by - 10, CHEEK, 2, 1);
    for (let k = 0; k < 6; k++) mDot(c, cx + 13 + k, by - 7 + (k > 2 ? 1 : 0) - (k > 4 ? 1 : 0), INK);
    for (const [dx, dy, r] of [[6, -22, 1.6], [3, -26, 1.4], [10, -26, 1.4], [6, -29, 1.2], [0, -28, 1.1], [12, -30, 1.1]]) mPaint(c, MS.ell(cx + dx, by + dy, r, r * 1.2), '#7fc7e9', { hl: false });
  },
  caranguejo(c, cx, by) {
    const Rd = '#e8634e';
    mPaint(c, MS.or(MS.cap(cx - 5, by - 3, cx - 9, by, 0.7), MS.cap(cx + 5, by - 3, cx + 9, by, 0.7), MS.cap(cx - 4, by - 2, cx - 6, by, 0.7), MS.cap(cx + 4, by - 2, cx + 6, by, 0.7)), Rd);
    mPaint(c, MS.or(MS.ell(cx, by - 5, 6, 3.8), MS.cap(cx - 5, by - 6, cx - 9, by - 11, 1), MS.cap(cx + 5, by - 6, cx + 9, by - 11, 1), MS.ell(cx - 10, by - 13, 2.6, 2.4), MS.ell(cx + 10, by - 13, 2.6, 2.4), MS.cap(cx - 2, by - 8, cx - 2, by - 11, 0.6), MS.cap(cx + 2, by - 8, cx + 2, by - 11, 0.6)), Rd);
    mDot(c, cx - 2, by - 12, '#ffffff'); mDot(c, cx + 2, by - 12, '#ffffff'); mDot(c, cx - 2, by - 11, INK); mDot(c, cx + 2, by - 11, INK);
    mDot(c, cx - 11, by - 15, '#fbf6f0', 2, 1); mDot(c, cx + 10, by - 15, '#fbf6f0', 2, 1);
    mDot(c, cx - 1, by - 4, INK, 3, 1);
  },
  estrela_mar(c, cx, by) { mPaint(c, MS.star(cx, by - 7, 7, 3, -Math.PI / 2), '#f39a4a'); for (const [dx, dy] of [[0, -10], [-3, -7], [3, -7], [-2, -4], [2, -4]]) mDot(c, cx + dx, by + dy, '#f9c27a'); },
  alga(c, cx, by) { mPaint(c, MS.or(MS.cap(cx, by, cx - 2, by - 8, 1.3), MS.cap(cx - 2, by - 8, cx + 1, by - 16, 1.3), MS.cap(cx + 1, by - 16, cx - 1, by - 22, 1.1), MS.cap(cx + 4, by, cx + 6, by - 7, 1.1), MS.cap(cx + 6, by - 7, cx + 4, by - 13, 1)), '#5fb38a'); },
  // ---- espaço (quarto dos adolescentes) ----
  foguete(c, cx, by) {
    mPaint(c, MS.ell(cx, by - 5, 3, 4.5), '#f7a33a', { ol: null }); mPaint(c, MS.ell(cx, by - 5, 1.5, 2.6), '#fbe36a', { ol: null, hl: false });
    mPaint(c, MS.or(MS.poly([[cx - 5, by - 16], [cx - 10, by - 7], [cx - 4, by - 10]]), MS.poly([[cx + 5, by - 16], [cx + 10, by - 7], [cx + 4, by - 10]])), '#e8564e');
    mPaint(c, MS.ell(cx, by - 21, 6, 13), '#f4f4f0', { ol: '#9aa3b4' });
    mPaint(c, MS.above(MS.ell(cx, by - 27, 6, 9), by - 30), '#e8564e');
    mPaint(c, MS.ell(cx, by - 23, 2.8, 2.8), '#7fc7e9', { ol: '#6a7488' });
    mDot(c, cx - 1, by - 24, '#ffffff');
  },
  planeta(c, cx, by) {
    const cy = by - 22, ring = MS.sub(MS.ell(cx, cy, 16, 4.2), MS.ell(cx, cy, 11.5, 2.6));
    mPaint(c, MS.and(ring, MS.rect(cx - 20, cy - 8, 40, 8)), '#f2c14e', { hl: false });
    mPaint(c, MS.ell(cx, cy, 9, 9), '#9a8ae8');
    for (const dy of [-4, 3]) mPaint(c, MS.and(MS.ell(cx, cy, 9, 9), MS.rect(cx - 10, cy + dy, 20, 2)), '#b9adf2', { ol: null, flat: true });
    mPaint(c, MS.and(ring, MS.rect(cx - 20, cy, 40, 8)), '#f2c14e', { hl: false });
  },
  alien(c, cx, by) {
    const Gn = '#7cd67a';
    mPaint(c, MS.or(MS.cap(cx - 3, by - 19, cx - 6, by - 25, 0.7), MS.cap(cx + 3, by - 19, cx + 6, by - 25, 0.7), MS.ell(cx - 6, by - 26, 1.6, 1.6), MS.ell(cx + 6, by - 26, 1.6, 1.6)), Gn);
    mPaint(c, MS.or(MS.ell(cx, by - 14, 7, 6), MS.ell(cx, by - 5, 4.5, 5), MS.cap(cx - 4, by - 7, cx - 8, by - 10, 1), MS.cap(cx + 4, by - 7, cx + 8, by - 10, 1)), Gn);
    for (const dx of [-3.5, 0, 3.5]) mPaint(c, MS.ell(cx + dx, by - 15, 1.6, 1.8), '#ffffff', { ol: '#4a8a4a', hl: false });
    for (const dx of [-4, 0, 3]) mDot(c, cx + dx, by - 15, INK);
    mDot(c, cx - 2, by - 11, INK); mDot(c, cx - 1, by - 10, INK, 3, 1); mDot(c, cx + 2, by - 11, INK);
  },
  cometa(c, cx, cy) {
    for (let k = 0; k < 14; k++) { mDot(c, cx - 4 - k, cy - 2 - Math.round(k * 0.45), k < 6 ? '#f7d65a' : '#f6e8b0'); if (k < 9) mDot(c, cx - 4 - k, cy + Math.round(-k * 0.45), '#f2c14e'); }
    mPaint(c, MS.star(cx, cy, 5, 2.2), '#f7d65a', { ol: '#d9a83a' });
  },
  // ---- céu ----
  sol(c, cx, cy) {
    const rays = []; for (let k = 0; k < 10; k++) { const a = k / 10 * Math.PI * 2; rays.push(MS.cap(cx + Math.cos(a) * 11, cy + Math.sin(a) * 11, cx + Math.cos(a) * 14, cy + Math.sin(a) * 14, 1.3)); }
    mPaint(c, MS.or(...rays), '#f7c948', { ol: '#e3a52e' });
    mPaint(c, MS.ell(cx, cy, 9, 9), '#f9d457', { ol: '#e3a52e' });
    mFace(c, cx - 3, cy - 2, { d: 5 });
  },
  lua(c, cx, cy) {
    mPaint(c, MS.sub(MS.ell(cx, cy, 10, 10), MS.ell(cx + 6, cy - 3, 8.5, 8.5)), '#f6e49a', { ol: '#d9b85a' });
    mDot(c, cx - 6, cy - 1, INK, 2, 1); mDot(c, cx - 7, cy + 3, CHEEK, 2, 1); mDot(c, cx - 4, cy + 4, INK, 2, 1);
    const z = (x, y) => { mDot(c, x, y, '#8ea7c4', 3, 1); mDot(c, x + 1, y + 1, '#8ea7c4'); mDot(c, x, y + 2, '#8ea7c4', 3, 1); };
    z(cx + 7, cy - 8); z(cx + 11, cy - 13);
  },
  estrela(c, cx, cy) { mPaint(c, MS.star(cx, cy, 5.5, 2.4), '#f7d65a', { ol: '#d9a83a' }); },
  estrelas(c, cx, cy) { MURAL_ART.estrela(c, cx - 7, cy + 3); MURAL_ART.estrela(c, cx + 7, cy - 4); mPaint(c, MS.star(cx + 2, cy + 8, 3, 1.4), '#f7d65a', { ol: '#d9a83a' }); },
  nuvem(c, cx, cy, o = {}) {
    mPaint(c, MS.or(MS.ell(cx - 7, cy + 1, 6, 4.6), MS.ell(cx, cy - 2, 7, 6), MS.ell(cx + 7, cy + 1, 6, 4.6), MS.rect(cx - 12, cy + 1, 24, 4)), '#ffffff', { ol: '#b9d0e4' });
    if (o.face !== false) mFace(c, cx - 3, cy, { d: 5, sleep: true });
  },
  passaro(c, cx, cy) {
    mPaint(c, MS.or(MS.ell(cx, cy, 4.5, 3.2), MS.ell(cx + 4, cy - 2, 2.8, 2.6), MS.poly([[cx - 4, cy - 1], [cx - 8, cy - 3], [cx - 7, cy + 1]])), '#5aa0e0');
    mPaint(c, MS.poly([[cx - 2, cy - 1], [cx + 2, cy - 1], [cx - 1, cy - 7]]), '#3f7fc8');
    mPaint(c, MS.poly([[cx + 6, cy - 3], [cx + 9, cy - 2], [cx + 6, cy - 1]]), '#f0a040', { ol: null });
    mDot(c, cx + 5, cy - 3, INK); mDot(c, cx + 4, cy - 1, CHEEK);
  },
  borboleta(c, cx, cy, o = {}) {
    const col = o.cor || '#b98ae8';
    mPaint(c, MS.or(MS.ell(cx - 4, cy - 2, 4, 3.6), MS.ell(cx + 4, cy - 2, 4, 3.6), MS.ell(cx - 3, cy + 3, 3, 2.4), MS.ell(cx + 3, cy + 3, 3, 2.4)), col);
    for (const [dx, dy] of [[-4, -2], [4, -2], [-3, 3], [3, 3]]) mDot(c, cx + dx, cy + dy, '#ffffff');
    mPaint(c, MS.cap(cx, cy - 4, cx, cy + 5, 0.7), '#3a3540', { ol: null });
    mDot(c, cx - 2, cy - 7, '#3a3540'); mDot(c, cx - 1, cy - 6, '#3a3540'); mDot(c, cx + 2, cy - 7, '#3a3540'); mDot(c, cx + 1, cy - 6, '#3a3540');
  },
  peixe(c, cx, cy, o = {}) {
    const col = o.cor || '#f2a03a';
    mPaint(c, MS.or(MS.ell(cx, cy, 6, 4), MS.poly([[cx - 5, cy], [cx - 10, cy - 4], [cx - 10, cy + 4]])), col);
    mDot(c, cx - 1, cy - 3, '#ffffff', 1, 7); mDot(c, cx + 3, cy - 1, INK, 1, 2);
  },
  peixe2(c, cx, cy) { MURAL_ART.peixe(c, cx, cy, { cor: '#f27aa0' }); MURAL_ART.peixe(c, cx + 12, cy + 7, { cor: '#7fd0c8' }); },
  bolhas(c, cx, cy) { for (const [dx, dy, r] of [[0, 0, 2.6], [4, -6, 1.8], [-3, -10, 1.4], [2, 6, 1.4]]) mPaint(c, MS.sub(MS.ell(cx + dx, cy + dy, r + 1, r + 1), MS.ell(cx + dx, cy + dy, r, r)), '#8cc8e8', { ol: null, hl: false }); },
};
// colunas de cada tema: g = bicho no chão, s = algo no céu, w = largura da coluna
const MURAL_TEMAS = {
  noite: [{ s: 'lua', w: 34 }, { g: 'ovelha', s: 'estrela', w: 34 }, { g: 'cerca', w: 22 }, { g: 'ovelha', jump: true, s: 'nuvem', w: 34 }, { s: 'estrelas', g: 'urso', w: 30 }, { g: 'arvore_coruja', w: 40 }, { s: 'estrela', w: 16 }],
  savana: [{ g: 'girafa', w: 46 }, { g: 'flor', s: 'sol', w: 30 }, { g: 'elefante', w: 50 }, { g: 'tartaruga', s: 'passaro', w: 36 }, { g: 'leao', w: 46 }, { g: 'tulipa', s: 'nuvem', w: 30 }, { g: 'macaco', s: 'passaro', w: 32 }, { g: 'arvore', w: 40 }],
  jardim: [{ g: 'coelho', s: 'borboleta', w: 30 }, { g: 'flor', w: 14 }, { g: 'tulipa', s: 'sol', w: 30 }, { g: 'joaninha', w: 16 }, { g: 'tartaruga', s: 'borboleta', cor: '#f2a03a', w: 36 }, { g: 'flor', cor: '#9a8ae8', w: 14 }, { g: 'patos', w: 46 }],
  fazenda: [{ g: 'vaca', s: 'sol', w: 46 }, { g: 'flor', w: 16 }, { g: 'porquinho', s: 'nuvem', w: 36 }, { g: 'pintinhos', w: 30 }, { g: 'arvore', w: 40 }, { g: 'tulipa', s: 'passaro', cor: '#f28ab0', w: 18 }],
  mar: [{ g: 'baleia', w: 64 }, { g: 'estrela_mar', s: 'peixe', w: 24 }, { g: 'alga', s: 'bolhas', w: 16 }, { g: 'caranguejo', w: 26 }, { g: 'tartaruga', s: 'peixe2', w: 40 }, { g: 'alga', s: 'bolhas', w: 16 }],
  espaco: [{ g: 'foguete', w: 26 }, { g: 'alien', s: 'estrelas', w: 30 }, { g: 'planeta', w: 38 }, { s: 'cometa', g: 'alien', w: 30 }, { s: 'lua', w: 30 }, { g: 'foguete', s: 'estrela', w: 26 }],
  pequeno: [{ g: 'flor', s: 'estrela', w: 16 }, { g: 'tulipa', s: 'borboleta', w: 16 }, { g: 'joaninha', s: 'nuvem', w: 18 }],
  mini: [{ g: 'flor', w: 14 }, { g: 'patos', w: 46 }, { g: 'tulipa', cor: '#f2a03a', w: 14 }, { g: 'joaninha', w: 16 }, { g: 'flor', cor: '#9a8ae8', w: 14 }, { g: 'pintinhos', w: 30 }],
};
function muralCols(tema, w, start) {
  const T = MURAL_TEMAS[tema], gap = 8, cols = []; let used = 0;
  for (let k = 0; k < 40; k++) {
    const col = T[(((start + k) % T.length) + T.length) % T.length];
    if (used + col.w + (cols.length ? gap : 0) > w - 8) { if (!cols.length && k < T.length) continue; break; }
    used += col.w + (cols.length ? gap : 0); cols.push(col);
  }
  return { cols, used, gap };
}
DECALS.mural_ped = function (c, x, y, w, h, o) {
  const { cols, used, gap } = muralCols(o.tema, w, o.start || 0);
  let px = x + Math.round((w - used) / 2);
  const by = y + h - (o.chao ?? 10), skyY = y + (o.ceu ?? 14);
  cols.forEach((col, k) => {
    const cx = px + Math.round(col.w / 2);
    if (col.s && !o.semCeu) MURAL_ART[col.s](c, cx + ((k % 2) ? 3 : -3), skyY + ((k * 7) % 5) - 2, {});
    if (col.g) MURAL_ART[col.g](c, cx, by, { jump: col.jump, cor: col.cor });
    px += col.w + gap;
  });
};
// pinta todas as faces de parede de uma linha, em trechos sem porta e sem janela
function pinturasParede(M, j, faixas) {
  let run = null; const runs = [];
  for (let x = 0; x <= M.w; x++) {
    const ok = x < M.w && M.t(x, j) === '#' && M.t(x, j + 1) === '#' && wallMode(M, x, j) === 'upper';
    if (ok && !run) run = [x, x]; else if (ok) run[1] = x; else if (run) { runs.push(run); run = null; }
  }
  for (const [a, b] of runs) {
    // nenhuma parede fica em branco: trechos sem tema definido ganham um tema conforme o tamanho
    const f = faixas.find(f => a >= f.de && b <= f.ate) || { tema: b - a + 1 >= 3 ? ['jardim', 'fazenda', 'savana', 'mar'][a % 4] : 'pequeno' };
    if (f.pular) continue;
    const x0 = Math.max(a, f.x0 ?? a), x1 = b;
    if (x1 - x0 + 1 < 1) continue;
    if (x1 - x0 + 1 < 3 && MURAL_TEMAS[f.tema].every(c2 => c2.w > (x1 - x0 + 1) * 32 - 8)) f.tema = 'pequeno';
    M.decal('mural_ped', x0 * 16, j * 16 + 2, (x1 - x0 + 1) * 16, 30, Object.assign({ tema: f.tema, start: (f.start || 0) + a }, f.opts || {}));
  }
}
