/* =====================================================================
   MAPAS — construtor, mobiliário, decalques e renderização de tiles
   Cenários reinterpretados em pixel art a partir das fotos de referência:
   UPA (verde-claro, piso terracota, cortinas verdes, ventiladores),
   PED (murais de animais e crianças, piso de madeira, cortinas brancas),
   GO (paredes creme com faixa de madeira, berços acrílicos, mural mãe-bebê),
   CM (piso azul salpicado, persianas, sala de estar com painéis de madeira),
   CIR (corredor branco com faixa ondulada, salas de piso azul, focos cirúrgicos).
   ===================================================================== */
const MAPS = {};
const SOLID_TILES = new Set(['#', 'W', ' ']);

class MapB {
  constructor(id, nome, w, h, theme, base = ' ') {
    Object.assign(this, { id, nome, w, h, theme });
    this.g = Array.from({ length: h }, () => Array(w).fill(base));
    this.objs = []; this.decals = []; this.warps = []; this.labels = []; this.npcs = [];
  }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  fill(x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (this.in(i, j)) this.g[j][i] = ch; return this; }
  room(x, y, w, h, floor = '.', name) { this.fill(x, y, w, h, '#'); this.fill(x + 1, y + 2, w - 2, h - 3, floor); if (name) this.labels.push({ nome: name, x: x + w / 2, y: y + h / 2, rx: x, ry: y, rw: w, rh: h }); return this; }
  door(x, y, w = 1, h = 1) { return this.fill(x, y, w, h, 'D'); }
  win(x, y, w = 1) { for (let i = 0; i < w; i++) if (this.g[y][x + i] === '#') this.g[y][x + i] = 'W'; return this; }
  obj(type, x, y, o = {}) { const d = OBJ_DEFS[type]; if (!d) throw new Error('obj ' + type); const ob = Object.assign({ type, x, y, w: d.w, h: d.h, solid: d.solid !== false, id: this.id + '_' + type + '_' + x + '_' + y }, o); this.objs.push(ob); return ob; }
  row(type, x, y, n, step = 1, o = {}) { for (let i = 0; i < n; i++) this.obj(type, x + i * step, y, Object.assign({}, o)); return this; }
  decal(kind, x, y, w, h, o = {}) { this.decals.push(Object.assign({ kind, x, y, w, h }, o)); return this; }
  warp(x, y, w, h, to, tx, ty, dir = 0) { this.warps.push({ x, y, w, h, to, tx, ty, dir }); return this; }
  t(x, y) { return this.in(x, y) ? this.g[y][x] : ' '; }
}

/* ---------------- Temas visuais ---------------- */
const THEMES = {
  rua: { top: '#8f969e', face: '#e8e2d2', base: '#9a8a70', roof: true },
  lobby: { f1: { k: 'stone', a: '#ddd5c4' }, f2: { k: 'tile', a: '#e2ddd2' }, top: '#4d545e', face: '#ebe5d5', wain: '#d4c9b0', rail: '#a8987c', base: '#6f6250' },
  upa: { f1: { k: 'terracota', a: '#c98f74' }, f2: { k: 'tile', a: '#e7e7e1' }, f3: { k: 'tile', a: '#e7e7e1' }, top: '#3f4c47', face: '#bfe4a2', wain: '#a6d68c', rail: '#eaf5df', base: '#4f7a45' },
  ped: { f1: { k: 'wood', a: '#b07c4f' }, f2: { k: 'speckle', a: '#ebe6d8', acc: '#d9a07a' }, top: '#4f5862', face: '#f4f1e7', band: '#cfe8d8', base: '#b07c4f' },
  go: { f1: { k: 'speckle', a: '#e7e0cd', acc: '#b9a888' }, f2: { k: 'tile', a: '#efefea' }, top: '#504e56', face: '#f1dc9f', wain: '#ead08e', rail: '#7a4a2a', base: '#7a4a2a' },
  cm: { f1: { k: 'speckle', a: '#5677aa', acc: '#8fb0de' }, f2: { k: 'speckle', a: '#d6dadf', acc: '#9aa7b5' }, f3: { k: 'wood', a: '#c8a77a' }, top: '#4a5460', face: '#eef1f4', wain: '#d8e4ee', rail: '#9aa7b5', base: '#7f8d9c' },
  cir: { f1: { k: 'tile', a: '#eef1f3' }, f2: { k: 'tile', a: '#e6eaed' }, f3: { k: 'speckle', a: '#4c8fcf', acc: '#a8d0f0' }, top: '#4d5763', face: '#f7f9fa', wave: true, base: '#9aa5b0' },
  ubs: { f1: { k: 'tile', a: '#e9ebe7' }, f2: { k: 'speckle', a: '#dfe3e6', acc: '#9aa7b5' }, f3: { k: 'tile', a: '#dde6ee' }, top: '#4d5763', face: '#f4f5f2', wain: '#3d7cc9', rail: '#2f62b8', base: '#2f5a8f', grade: true },
  bar: { f1: { k: 'tile', a: '#8b3c2b', b: '#74301f', checker: true }, f2: { k: 'tile', a: '#8b3c2b', b: '#74301f', checker: true }, top: '#3a2c24', face: '#e0b866', azulejo: true, base: '#5a3a24' },
};
const RAMPC = new Map();
function rp(c) { let r = RAMPC.get(c); if (!r) { r = PAL.ramp(c); RAMPC.set(c, r); } return r; }
function vary(c, v) { return [c[0] * (1 + v), c[1] * (1 + v), c[2] * (1 + v)]; }
function dk(c, k) { return [c[0] * (1 - k), c[1] * (1 - k), c[2] * (1 - k) + 6 * k]; }

/* ---------------- Pisos ---------------- */
function floorPx(sp, gx, gy) {
  const R = rp(sp.a), RB = sp.b ? rp(sp.b) : R;
  switch (sp.k) {
    case 'tile': case 'terracota': {
      const S = 16, ti = Math.floor(gx / S), tj = Math.floor(gy / S), sx = gx - ti * S, sy = gy - tj * S;
      const r = sp.checker && ((ti + tj) & 1) ? RB : R; const terr = sp.k === 'terracota';
      const v = (hsh(ti, tj, 11) - 0.5) * (terr ? 0.16 : 0.035);
      if (sx === 0 || sy === 0) return terr ? PAL.mix(r.d2, [205, 195, 180], 0.4) : PAL.mix(r.d1, r.d2, 0.3);
      if (sx === 1 || sy === 1) return vary(r.l1, v * 0.6);
      if (sx === S - 1 || sy === S - 1) return vary(PAL.mix(r.b, r.d1, 0.55), v);
      if (hsh(ti, tj, 5) > 0.9 && sx + sy === 9 && sx > 3 && sx < 7) return PAL.mix(r.l1, r.l2, 0.5);
      if (terr && hsh(gx, gy, 3) < 0.05) return vary(r.d1, v);
      return vary(r.b, v + (hsh(gx, gy, 1) - 0.5) * 0.025);
    }
    case 'wood': {
      const pj = Math.floor(gy / 8), py = gy - pj * 8, off = Math.floor(hsh(pj, 0, 3) * 64), L = 56;
      const pi = Math.floor((gx + off) / L), px = gx + off - pi * L, v = (hsh(pi, pj, 7) - 0.5) * 0.15;
      if (py === 0) return R.d2; if (py === 1) return vary(R.l1, v); if (px === 0) return R.d2; if (px === 1) return vary(R.l1, v);
      const grain = Math.sin((gx + off) * 0.16 + pj * 3) * 1.3 + Math.sin((gx + off) * 0.045 + pj);
      if (py >= 3 && py <= 6 && Math.abs(grain - (py - 4.5) * 0.9) < 0.14) return vary(R.d1, v);
      return vary(R.b, v + (hsh(gx, gy, 2) - 0.5) * 0.03);
    }
    case 'speckle': {
      if (gx % 64 === 0 || gy % 64 === 0) return PAL.mix(R.d1, [170, 175, 180], 0.3);
      const h = hsh(gx, gy, 2), v = (hsh(Math.floor(gx / 16), Math.floor(gy / 16), 6) - 0.5) * 0.035;
      if (h < 0.03) return R.d2; if (h < 0.06) return R.l2; if (h < 0.08 && sp.acc) return rp(sp.acc).b;
      const h2 = hsh(gx >> 1, gy >> 1, 4); if (h2 < 0.022) return R.d1; if (h2 > 0.987) return R.l1;
      return vary(R.b, v);
    }
    case 'stone': {
      const sx = gx & 31, sy = gy & 31; if (sx === 0 || sy === 0) return R.d1; if (sx === 1 || sy === 1) return R.l1;
      const s = hsh(gx >> 5, gy >> 5, 8);
      const vein = Math.sin((gx * 0.25 + gy * 0.6) / 3 + s * 20) + Math.sin((gx * 0.7 - gy * 0.2) / 7 + s * 9) * 0.6;
      if (Math.abs(vein) < 0.07) return PAL.mix(R.b, R.d1, 0.55);
      const sx2 = gx & 31, sy2 = gy & 31; const refl = (sx2 + sy2 > 6 && sx2 + sy2 < 12 && sx2 > 2 && sy2 > 2) ? 0.04 : 0; // brilho no canto da placa polida
      return vary(R.b, (s - 0.5) * 0.05 + refl);
    }
  }
  return R.b;
}
/* calçada, asfalto e grama (rua) */
function streetPx(t, M, i, j, lx, ly, gx, gy) {
  if (t === 'g') {
    const base = rp('#6fae4a'); const h = hsh(gx, gy, 3);
    const fl = hsh(i, j, 12); if (fl > 0.86) { const fx = 6 + Math.floor(hsh(i, j, 13) * 18), fy = 6 + Math.floor(hsh(j, i, 14) * 18); const dx = lx - fx, dy = ly - fy; if (dx * dx + dy * dy <= 2) return fl > 0.95 ? [242, 210, 70] : fl > 0.9 ? [240, 240, 236] : [232, 120, 160]; if (dx * dx + dy * dy <= 5) return base.d1; }
    if (hsh(gx, gy >> 1, 4) > 0.86 && (gy % 3) !== 2) return h > 0.5 ? base.l1 : base.l2;
    if (h < 0.12) return base.d1; if (h < 0.16) return base.d2;
    return vary(base.b, (hsh(gx >> 3, gy >> 3, 5) - 0.5) * 0.06);
  }
  if (t === '_') {
    // calçada portuguesa em ondas (preta e branca)
    const wave = Math.sin(gx / 11) * 5, band = Math.floor((gy + wave + 400) / 8) % 2;
    const stone = (gx % 4 === 0 || (gy + (Math.floor(gx / 4) % 2) * 2) % 4 === 0);
    const col = band ? [52, 52, 58] : [232, 228, 218];
    if (stone) return dk(col, band ? -0.25 : 0.14);
    return vary(col, (hsh(gx >> 2, gy >> 2, 6) - 0.5) * 0.08);
  }
  // asfalto
  const a = rp('#4a4d52'); const h = hsh(gx, gy, 7);
  let col = h < 0.08 ? a.d1 : h > 0.94 ? a.l1 : vary(a.b, (hsh(gx >> 2, gy >> 2, 2) - 0.5) * 0.05);
  if (M.t(i, j - 1) === '_' && ly < 4) col = ly < 2 ? [176, 172, 164] : [120, 118, 112];   // meio-fio
  if (M.t(i, j + 1) === '_' && ly > 29) col = [70, 70, 74];
  if (j === 15 && ly >= 30 && i % 3 !== 0) col = [240, 210, 74];                         // faixa central
  if (j === 16 && ly <= 1 && i % 3 !== 0) col = [240, 210, 74];
  if (t === 'z' && (ly % 10) < 5 && lx > 2 && lx < 29) col = hsh(gx, gy, 9) < 0.1 ? [200, 200, 196] : [238, 238, 234];
  return col;
}
/* ---------------- Paredes ---------------- */
function isWall(t) { return t === '#' || t === 'W'; }
function wallMode(M, i, j) {
  const b1 = M.t(i, j + 1), b2 = M.t(i, j + 2);
  const floorish = t => t === '.' || t === ',' || t === ':' || (t === 'D' && M.theme !== 'rua') || t === '_' || t === 'g' || t === '=' || t === 'z';
  if (floorish(b1)) return 'lower'; if (isWall(b1) && floorish(b2)) return 'upper'; return 'top';
}
function capPx(th, M, i, j, lx, ly, gx, gy) {
  if (th.roof) {
    const rf = (M.roofs || []).find(r => i >= r.x && i < r.x + r.w && j >= r.y && j < r.y + r.h);
    if (rf && rf.kind === 'telha') { // telha colonial
      const row = Math.floor(gy / 8), off = (row % 2) * 6, u = (gx + off) % 12, v = gy % 8;
      const T = rp('#b5532f'); let c = v === 7 ? T.d2 : v >= 5 ? T.d1 : (u < 2 || u > 9) ? T.d1 : (u > 3 && u < 6 && v < 3) ? T.l1 : T.b;
      return vary(c, (hsh(Math.floor((gx + off) / 12), row, 3) - 0.5) * 0.12);
    }
    const R = rp('#a4aab0'); const x0 = rf ? i - rf.x : 5, y0 = rf ? j - rf.y : 5, x1 = rf ? rf.x + rf.w - 1 - i : 5;
    // platibanda (borda elevada do telhado)
    if (rf && ((y0 === 0 && ly < 5) || (x0 === 0 && lx < 5) || (x1 === 0 && lx > 26))) { const e = (y0 === 0 && ly < 5) ? ly : (x0 === 0 && lx < 5) ? lx : 31 - lx; return e === 0 ? R.d2 : e === 1 ? R.l2 : e === 4 ? R.d1 : R.l1; }
    if (gx % 64 === 0 || gy % 64 === 0) return R.d1;
    const h = hsh(gx, gy, 3); return h < 0.06 ? R.d1 : h > 0.95 ? R.l1 : vary(R.b, (hsh(gx >> 4, gy >> 4, 2) - 0.5) * 0.04);
  }
  const R = rp(th.top);
  const h = hsh(gx, gy, 4);
  let col = h < 0.018 ? R.d1 : h > 0.985 ? R.l1 : vary(R.b, (hsh(gx >> 3, gy >> 3, 2) - 0.5) * 0.04);
  if (!isWall(M.t(i, j - 1)) && ly < 2) col = R.l1;
  if (!isWall(M.t(i - 1, j)) && lx < 2) col = R.l1;
  if (!isWall(M.t(i + 1, j)) && lx > 29) col = R.d1;
  if (wallMode(M, i, j + 1) === 'upper' || (!isWall(M.t(i, j + 1)) && M.t(i, j + 1) !== ' ')) { if (ly >= 29) col = R.l2; }
  return col;
}
function facePx(th, M, i, j, lx, fy, gx, win) {
  const F = rp(th.face);
  if (fy === 0) return PAL.mix(rp(th.top).d1, F.d2, 0.5);
  if (fy <= 2) return F.d1;
  if (win && fy >= 8 && fy <= 47) { const w = winPx(th, M, lx, fy, gx); if (w) return w; }
  if (fy >= 57) { const B = rp(th.base); if (fy === 57) return B.l1; if (fy === 63) return B.d2; return (gx % 64 === 0) ? B.d1 : B.b; }
  if (th.azulejo) {
    if (fy >= 24 && fy <= 25) return fy === 24 ? rp('#8a5432').l1 : rp('#6b3e24').b;
    if (fy >= 26 && fy <= 56) { const tx = gx & 7, ty = (fy - 26) & 7; if (tx === 0 || ty === 0) return [201, 197, 181]; const dx = tx - 4, dy = ty - 4; if (dx * dx + dy * dy <= 2) return [47, 95, 168]; if ((tx === 1 || tx === 7) && (ty === 1 || ty === 7)) return [80, 130, 200]; return [241, 239, 228]; }
  }
  if (th.band && fy >= 44 && fy <= 56) { const top = 47 + Math.round(Math.sin(gx / 15) * 1.6 + Math.sin(gx / 43) * 1.3); if (fy >= top) { const Bd = rp(th.band); return fy === top ? Bd.l1 : vary(Bd.b, (hsh(gx >> 2, fy >> 2, 8) - 0.5) * 0.02); } }
  if (th.stripes && fy >= 33 && fy <= 40) { const k = Math.floor((fy - 33) / 2); const S = rp(th.stripes[k]); return (fy - 33) % 2 === 0 ? S.l1 : S.b; }
  if (th.rail && fy >= 38 && fy <= 41) { const Rl = rp(th.rail); return fy === 38 ? Rl.l1 : fy === 41 ? Rl.d2 : Rl.b; }
  if (th.wain && fy > 41) { const W = rp(th.wain); if (fy === 42) return W.d1; if (gx % 64 === 0) return W.d1; if (gx % 64 === 1) return W.l1; return vary(W.b, (hsh(gx >> 2, fy >> 2, 3) - 0.5) * 0.015); }
  if (th.wave) { const cy = 40 + Math.sin(gx / 18) * 4 + Math.sin(gx / 47) * 3; const d = fy - cy; if (d >= -2 && d <= 2) return d < -1 ? [235, 205, 160] : [214, 160, 92]; if (d > 2 && d <= 4) return [236, 214, 178]; }
  const v = (fy < 14 ? -(14 - fy) * 0.005 : 0) + (fy > 44 ? (fy - 44) * 0.002 : 0);
  if (fy === 3) return PAL.mix(F.d1, F.b, 0.5);
  return vary(F.b, v + (hsh(gx >> 2, (fy + j * 64) >> 2, 5) - 0.5) * 0.012);
}
function winPx(th, M, lx, fy, gx) {
  const fr = rp('#e8ecef');
  if (fy >= 46) return fy === 46 ? fr.l2 : fr.d1;          // peitoril
  if (lx <= 1 || lx >= 30) return null;
  if (lx === 2 || lx === 29 || fy <= 9 || fy >= 44) return (lx === 2 || fy <= 9) ? fr.b : fr.d1;
  if (lx === 15 || lx === 16) return lx === 15 ? fr.b : fr.d1;
  const t = (fy - 10) / 34;
  if (M.theme === 'cm') return (fy - 10) % 3 === 0 ? [185, 194, 203] : (fy - 10) % 3 === 1 ? [232, 236, 240] : [216, 222, 230];
  if (M.theme === 'upa') return (fy % 2) ? [223, 238, 240] : [196, 216, 220];
  if (M.theme === 'ubs' && (lx % 5 === 0 || (fy - 10) % 9 === 0)) return [58, 108, 178];   // grade de ferro azul
  let col = PAL.mix([110, 170, 228], [205, 232, 246], t);
  if (M.theme === 'go' || M.theme === 'ped') { const hill = 34 + Math.sin(gx / 9) * 3; if (fy > hill) col = PAL.mix([88, 160, 80], [60, 130, 60], (fy - hill) / 10); }
  if (M.theme === 'rua') col = PAL.mix([90, 140, 190], [160, 200, 225], t);
  if (((lx + fy) % 22) < 3) col = PAL.mix(col, [255, 255, 255], 0.4);
  return col;
}
function doorJambPx(col, M, i, j, lx, ly) {
  const J = rp('#a49480');
  const L = isWall(M.t(i - 1, j)), Rr = isWall(M.t(i + 1, j)), U = isWall(M.t(i, j - 1)), D = isWall(M.t(i, j + 1));
  if (L && lx < 4) return [J.d2, J.l1, J.b, J.d1][lx];
  if (Rr && lx > 27) return [J.d1, J.b, J.l1, J.d2][lx - 28];
  if (!L && !Rr) { if (U && ly < 4) return [J.d2, J.l1, J.b, J.d1][ly]; if (D && ly > 27) return [J.d1, J.b, J.l1, J.d2][ly - 28]; }
  return col;
}
function doorFloorSpec(M, i, j) {
  const th = THEMES[M.theme];
  for (const [di, dj] of [[0, 1], [0, -1], [1, 0], [-1, 0], [0, 2], [0, -2]]) { const t = M.t(i + di, j + dj); if (t === '.') return th.f1; if (t === ',') return th.f2 || th.f1; if (t === ':') return th.f3 || th.f1; }
  return th.f1 || { k: 'tile', a: '#dddddd' };
}
/* pinta todos os tiles do mapa em um buffer de pixels */
function paintTiles(M, img) {
  const th = THEMES[M.theme], W = M.w * TS, d = img.data;
  for (let j = 0; j < M.h; j++) for (let i = 0; i < M.w; i++) {
    const t = M.t(i, j);
    let fn;
    if (M.theme === 'rua' && (t === 'g' || t === '_' || t === '=' || t === 'z')) fn = (lx, ly, gx, gy) => streetPx(t, M, i, j, lx, ly, gx, gy);
    else if (t === '.' || t === ',' || t === ':' || t === 'D') {
      if (M.theme === 'rua' && t === 'D') fn = () => [42, 38, 34];
      else {
        const spec = t === ':' ? (th.f3 || th.f1) : t === ',' ? (th.f2 || th.f1) : t === 'D' ? doorFloorSpec(M, i, j) : th.f1;
        const wU = isWall(M.t(i, j - 1)), wL = isWall(M.t(i - 1, j)), wR = isWall(M.t(i + 1, j));
        fn = (lx, ly, gx, gy) => {
          let col = floorPx(spec, gx, gy);
          if (t === 'D') col = doorJambPx(col, M, i, j, lx, ly);
          let k = 0; if (wU && ly < 9) k += (9 - ly) / 9 * 0.3; if (wL && lx < 5 && t !== 'D') k += (5 - lx) / 5 * 0.16; if (wR && lx > 26 && t !== 'D') k += (lx - 26) / 5 * 0.16;
          return k ? dk(col, k) : col;
        };
      }
    } else if (isWall(t)) {
      const mode = wallMode(M, i, j), win = t === 'W';
      if (mode === 'top') fn = (lx, ly, gx, gy) => capPx(th, M, i, j, lx, ly, gx, gy);
      else { const off = mode === 'upper' ? 0 : 32; fn = (lx, ly, gx) => facePx(th, M, i, j, lx, ly + off, gx, win); }
    } else fn = (lx, ly, gx, gy) => (hsh(gx, gy, 1) < 0.02 ? [30, 28, 38] : [20, 18, 26]);
    for (let ly = 0; ly < TS; ly++) for (let lx = 0; lx < TS; lx++) {
      const gx = i * TS + lx, gy = j * TS + ly; const col = fn(lx, ly, gx, gy); const p = (gy * W + gx) * 4;
      d[p] = col[0]; d[p + 1] = col[1]; d[p + 2] = col[2]; d[p + 3] = 255;
    }
  }
}
/* ---------------- Construção dos mapas ---------------- */
function buildMaps() {
  // ============ RUA (hub externo) ============
  {
    const M = new MapB('rua', 'Avenida dos Plantonistas', 48, 30, 'rua', 'g');
    M.fill(0, 12, 48, 2, '_').fill(0, 14, 48, 4, '=').fill(0, 18, 48, 2, '_').fill(30, 14, 3, 4, 'z');
    // Hospital Santa Esperança: prédio alto (fachada de 10 andares de tile), torre central de vidro azul
    M.fill(20, 0, 28, 12, '#'); M.door(33, 10, 2, 2);
    // UPA
    M.fill(2, 2, 14, 10, '#'); M.door(8, 10, 2, 2);
    // Bar do Rodolfo: quarteirão do outro lado da avenida, com a frente voltada para a própria calçada
    M.fill(3, 20, 20, 1, '_').fill(3, 20, 3, 9, '_').fill(20, 20, 3, 9, '_').fill(3, 26, 20, 3, '_');
    M.fill(6, 21, 14, 5, '#'); M.door(12, 25, 2, 1);
    // UBS Maria das Dores: prédio branco de dois andares do mesmo lado do bar, com calçada própria
    M.fill(28, 20, 20, 1, '_').fill(28, 20, 2, 8, '_').fill(46, 20, 2, 8, '_').fill(28, 26, 20, 2, '_');
    M.fill(30, 21, 16, 5, '#'); M.door(37, 25, 2, 1);
    M.roofs = [{ x: 20, y: 0, w: 28, h: 12, kind: 'concreto' }, { x: 2, y: 2, w: 14, h: 10, kind: 'concreto' }, { x: 6, y: 21, w: 14, h: 5, kind: 'telha' }, { x: 30, y: 21, w: 16, h: 5, kind: 'concreto' }];
    M.decal('heliponto', 40 * 16, 0, 6 * 16, 4 * 16);
    M.decal('ar_cond', 22 * 16, 1 * 16, 5 * 16, 16); M.decal('ar_cond', 4 * 16, 4 * 16, 4 * 16, 16); M.decal('ar_cond', 11 * 16, 6 * 16, 3 * 16, 16);
    M.decal('fachada_hosp', 20 * 16, 2 * 16, 28 * 16, 10 * 16, {});
    M.decal('fachada_upa', 2 * 16, 10 * 16, 14 * 16, 32, { door: [6 * 16, 32] });
    M.decal('letreiro_bar', 7 * 16, 21 * 16 + 4, 12 * 16, 3 * 16 - 4, {});
    M.decal('fachada_bar', 6 * 16, 24 * 16, 14 * 16, 32, {});
    M.decal('fachada_ubs', 30 * 16, 23 * 16, 16 * 16, 48, { door: [7 * 16, 32] });
    M.decal('letreiro_ubs', 31 * 16, 21 * 16 + 1, 14 * 16, 2 * 16 - 2, {});
    M.anims = [{ kind: 'lampadas', x: 7 * 32, y: 21 * 32 + 8, w: 12 * 32, h: 3 * 32 - 8 }];
    M.warp(33, 10, 2, 2, 'lobby', 19.5, 23.5, 1);
    M.warp(8, 10, 2, 2, 'upa', 9.5, 27.5, 1);
    M.warp(12, 25, 2, 1, 'bar', 11.5, 13.5, 1);
    M.warp(37, 25, 2, 1, 'ubs', 7, 27.4, 1);
    // marquise da entrada do hospital (passa por cima do jogador) e seus pilares
    M.obj('marquise', 29, 12); M.obj('pilar_marquise', 29, 13); M.obj('pilar_marquise', 38, 13);
    M.obj('banco_concreto', 3, 12); M.obj('banco_concreto', 12, 12); M.obj('arvore_seca', 15, 12, { solid: true });
    M.obj('arvore', 17, 3); M.obj('arvore', 18, 8); M.obj('arvore', 0, 6); M.obj('arvore', 1, 0);
    for (const gx of [16, 17, 18, 19]) M.obj('grade', gx, 11);
    M.obj('poste', 18, 13); M.obj('poste', 26, 13); M.obj('poste', 44, 13); M.obj('poste', 8, 19); M.obj('poste', 26, 19); M.obj('poste', 40, 19);
    M.obj('ambulancia', 2, 14, { vira: true }); M.obj('carro', 40, 14, { cor: '#c0392b', modelo: 'hatch', vira: true }); M.obj('carro', 21, 17, { cor: '#e8e8e8', modelo: 'sedan' });
    M.obj('ponto_onibus', 28, 18);
    M.obj('placa', 22, 19, { texto: 'BAR DO RODOLFO', bg: '#c0392b', fg: '#ffd84a' });
    // mesinhas do boteco na calçada
    M.obj('mesa_plastico', 7, 27, { cor: '#e9c13b', bar: true }); M.obj('mesa_plastico', 10, 27, { cor: '#c0392b', bar: true }); M.obj('mesa_plastico', 16, 27, { cor: '#e9c13b', bar: true });
    M.obj('banqueta', 6, 27); M.obj('banqueta', 17, 27);
    for (const [tx, ty] of [[0, 22], [24, 23], [25, 28], [0, 27], [30, 28], [41, 28], [46, 28]]) M.obj('arvore', tx, ty);
    M.obj('banco_concreto', 33, 28); M.obj('banco_concreto', 43, 28); M.obj('poste', 29, 27); M.obj('poste', 46, 27);
    M.labels.push({ nome: HOSPITAL_NOME, x: 34, y: 5 }, { nome: 'UPA 29 de Maio', x: 9, y: 6 }, { nome: 'Bar do Rodolfo', x: 13, y: 23 }, { nome: 'UBS Maria das Dores', x: 38, y: 23 }, { nome: 'Avenida', x: 24, y: 16 });
    MAPS.rua = M;
  }
  // ============ SAGUÃO DO HOSPITAL ============
  {
    const M = new MapB('lobby', 'Saguão do ' + HOSPITAL_NOME, 40, 26, 'lobby');
    M.room(0, 0, 40, 26, '.', 'Saguão');
    M.room(0, 14, 12, 12, ',', 'Cantina'); M.door(6, 14, 1, 2);
    M.room(28, 14, 12, 12, ',', 'Copa e Almoxarifado'); M.door(33, 14, 1, 2);
    M.door(19, 25, 2, 1); M.warp(19, 25, 2, 1, 'rua', 33.5, 13, 0);
    M.door(0, 7, 1, 2); M.warp(0, 7, 1, 2, 'ped', 40, 22.5, 2, 'ped');
    M.door(9, 0, 2, 2); M.warp(9, 0, 2, 1, 'go', 20.5, 27.5, 1, 'go');
    M.door(29, 0, 2, 2); M.warp(29, 0, 2, 1, 'cm', 1.5, 15.5, 3, 'cm');
    M.door(39, 7, 1, 2); M.warp(39, 7, 1, 2, 'cir', 1.5, 16.5, 3, 'cir');
    M.warps.forEach(w => { if (w.to !== 'rua') w.area = w.to; });
    M.decal('placa', 6 * 16, 2, 9 * 16, 9, { texto: 'GINECOLOGIA E OBSTETRICIA', bg: '#e2738c' });
    M.decal('placa', 25 * 16, 2, 10 * 16, 9, { texto: 'CLINICA MEDICA', bg: '#3a6fd1' });
    M.decal('elevador', 17 * 16, 4, 48, 26);
    M.decal('logo', 15 * 16, 6, 22, 22);
    M.decal('quadro', 22 * 16 + 4, 8, 40, 20);
    M.decal('cardapio', 1 * 16 + 4, 14 * 16 + 1, 44, 30);
    M.obj('placa', 2, 6, { texto: '< PED', bg: '#f4b942', fg: '#1b1622' }); M.obj('placa', 37, 6, { texto: 'CIR >', bg: '#4a8fc0' });
    M.row('balcao', 13, 18, 5, 1, { cor: '#3fa66b', vidro: true });
    M.row('cadeira_metal', 22, 21, 5); M.row('cadeira_metal', 22, 23, 5);
    M.row('cadeira_metal', 13, 21, 3); M.obj('planta', 1, 2); M.obj('planta', 38, 2); M.obj('planta', 12, 13); M.obj('planta', 27, 13); M.obj('bebedouro', 16, 2);
    // cantina
    M.row('cantina', 2, 17, 3); M.obj('mesa_plastico', 3, 20, { cor: '#e9c13b' }); M.obj('mesa_plastico', 7, 20, { cor: '#e9c13b' }); M.obj('mesa_plastico', 5, 23, { cor: '#e9c13b' }); M.obj('mesa_plastico', 9, 23, { cor: '#e9c13b' });
    // copa / almoxarifado
    M.obj('cafeteira', 29, 17); M.obj('garrafa', 30, 17); M.obj('micro', 31, 17); M.row('armario', 35, 17, 4, 1, { cor: '#c9a46a' }); M.obj('impressora', 38, 20); M.obj('mesa', 29, 22); M.obj('sofa', 34, 23, { cor: '#6b8fb5', tag: 'sofa' });
    MAPS.lobby = M;
  }
  // ============ UPA ============
  {
    const M = new MapB('upa', 'UPA 29 de Maio', 44, 30, 'upa');
    M.room(0, 0, 10, 12, ',', 'Consultório 1'); M.room(9, 0, 10, 12, ',', 'Consultório 2'); M.room(18, 0, 14, 12, ',', 'Observação'); M.room(31, 0, 13, 12, ',', 'Sala Vermelha');
    M.room(0, 11, 44, 6, ',', 'Corredor');
    M.room(0, 16, 21, 14, '.', 'Recepção e Espera');
    M.room(20, 16, 9, 8, ',', 'Posto de Enfermagem'); M.room(28, 16, 16, 8, ',', 'Sala dos Residentes');
    M.room(20, 23, 12, 7, ',', 'Sala de Procedimentos'); M.room(31, 23, 13, 7, ',', 'Copa e Estoque');
    M.door(4, 11, 1, 2); M.door(13, 11, 1, 2); M.door(24, 11, 2, 2); M.door(37, 11, 2, 2);
    M.door(9, 16, 3, 2); M.door(24, 16, 1, 2); M.door(35, 16, 1, 2); M.door(20, 20, 1, 1); M.door(25, 23, 1, 2); M.door(37, 23, 1, 2);
    M.door(9, 29, 2, 1); M.warp(9, 29, 2, 1, 'rua', 8.5, 12.8, 0);
    M.win(2, 0, 2).win(12, 0, 2).win(1, 16, 0);
    // consultórios
    M.obj('mesa', 2, 3); M.obj('cadeira_verde', 3, 4); M.obj('maca', 7, 3, { spot: 'caso' }); M.obj('pia', 1, 9);
    M.obj('mesa', 11, 3); M.obj('cadeira_verde', 12, 4); M.obj('maca', 16, 3, { spot: 'caso' }); M.obj('armario', 10, 9);
    // observação (cortinas verdes, painéis de gases, monitores)
    M.decal('gases', 19 * 16, 18, 12 * 16, 9);
    for (const bx of [20, 23, 26, 29]) { M.obj('leito', bx, 3, { spot: 'caso', blanket: '#e8eef2' }); M.obj('monitor', bx + 1, 3); }
    M.obj('cortina', 22, 5, { cor: '#86cf9c' }); M.obj('cortina', 25, 5, { cor: '#86cf9c' }); M.obj('cortina', 28, 5, { cor: '#86cf9c' });
    M.obj('suporte_soro', 19, 7); M.obj('lixeira', 30, 9);
    // sala vermelha
    M.decal('placa', 33 * 16, 2, 8 * 16, 9, { texto: 'SALA VERMELHA', bg: '#c62f2f' }); M.decal('gases', 32 * 16, 18, 11 * 16, 9);
    for (const bx of [33, 36, 39]) { M.obj('leito', bx, 3, { spot: 'caso', blanket: '#f2d9d9' }); M.obj('ventilador', bx + 1, 3); }
    M.obj('carrinho_emerg', 42, 3); M.obj('suporte_soro', 42, 6); M.obj('monitor', 32, 8);
    // recepção e espera (piso terracota, cadeiras pretas em fileiras, guichês)
    M.row('balcao', 2, 19, 6, 1, { cor: '#e8e8e2', vidro: true });
    M.decal('placa', 2 * 16, 16 * 16 + 18, 6 * 16, 9, { texto: 'RECEPCAO', bg: '#1d8a4a' });
    M.decal('tv', 13 * 16, 16 * 16 + 10, 24, 16, { cor: '#1d8a4a' });
    for (const ry of [22, 24, 26]) { M.row('cadeira_preta', 2, ry, 6); M.row('cadeira_preta', 12, ry, 6); }
    M.obj('pilar', 10, 20); M.obj('planta', 19, 18); M.obj('bebedouro', 1, 27);
    // posto de enfermagem
    M.row('balcao', 22, 20, 4, 1, { cor: '#dfe4e8' }); M.obj('mesa', 21, 18); M.obj('armario', 27, 18, { cor: '#dfe4e8' });
    // sala dos residentes
    M.obj('mesa', 29, 18); M.obj('mesa', 32, 18); M.obj('impressora', 36, 18); M.obj('cafeteira', 37, 18); M.obj('garrafa', 38, 18);
    M.obj('sofa', 40, 21, { cor: '#6b8fb5', tag: 'sofa' }); M.obj('mesa_redonda', 31, 21); M.obj('cadeira_madeira', 30, 21); M.obj('cadeira_madeira', 32, 21);
    M.decal('tv', 40 * 16, 16 * 16 + 12, 28, 16, {}); M.decal('quadro', 29 * 16, 16 * 16 + 12, 36, 18);
    // procedimentos
    M.obj('maca', 23, 25, { spot: 'proc' }); M.obj('carrinho_emerg', 21, 25); M.obj('monitor', 24, 25); M.obj('pia', 30, 25); M.obj('armario', 28, 25); M.obj('mesa_instrum', 26, 26);
    // copa e estoque
    M.row('armario', 33, 25, 3, 1, { cor: '#c9a46a' }); M.obj('garrafa', 39, 25); M.obj('micro', 40, 25); M.obj('bebedouro', 42, 25); M.obj('mesa_simples', 39, 27, { papeis: true }); // colunas 37–38 livres: passagem da porta
    MAPS.upa = M;
  }
  // ============ PEDIATRIA ============
  {
    const M = new MapB('ped', 'Ala Pediátrica', 42, 30, 'ped');
    M.room(0, 0, 14, 11, ',', 'Enfermaria de Bebês'); M.room(13, 0, 15, 11, '.', 'Enfermaria Infantil'); M.room(27, 0, 9, 11, ',', 'Consultório'); M.room(35, 0, 7, 11, '.', 'Brinquedoteca');
    M.room(0, 10, 42, 7, ',', 'Corredor');
    M.room(0, 16, 11, 14, '.', 'Enfermaria de Adolescentes'); M.room(10, 16, 9, 8, ',', 'Posto de Enfermagem'); M.room(18, 16, 9, 8, ',', 'Sala dos Residentes');
    M.room(10, 23, 17, 7, ',', 'Observação Pediátrica'); M.room(26, 16, 16, 14, '.', 'Pronto Atendimento Pediatria');
    M.door(6, 10, 2, 2); M.door(20, 10, 2, 2); M.door(31, 10, 1, 2); M.door(38, 10, 1, 2);
    M.door(5, 16, 1, 2); M.door(14, 16, 1, 2); M.door(22, 16, 1, 2); M.door(32, 16, 3, 2); M.door(14, 23, 1, 2); M.door(10, 26, 1, 1);
    M.door(41, 22, 1, 2); M.warp(41, 22, 1, 2, 'lobby', 1.5, 8, 3);
    M.win(2, 0, 2).win(9, 0, 2);
    // pinturas nas paredes (bichinhos, sol, lua, flores) — nunca sobre portas/janelas
    pinturasParede(M, 0, [{ de: 0, ate: 9, tema: 'noite', start: -4 }, { de: 10, ate: 13, tema: 'noite', start: -7 }, { de: 14, ate: 27, tema: 'savana' }, { de: 28, ate: 35, tema: 'jardim' }, { de: 36, ate: 41, tema: 'fazenda' }]);
    pinturasParede(M, 10, [{ de: 0, ate: 6, tema: 'jardim', start: 2 }, { de: 7, ate: 20, tema: 'mar' }, { de: 21, ate: 31, tema: 'savana', start: 3 }, { de: 32, ate: 38, tema: 'fazenda', start: 2 }, { de: 39, ate: 41, tema: 'mini' }]);
    pinturasParede(M, 16, [{ de: 0, ate: 10, tema: 'espaco' }, { de: 11, ate: 13, x0: 13, tema: 'pequeno' }, { de: 15, ate: 17, tema: 'jardim', start: 4 }, { de: 19, ate: 21, tema: 'fazenda', start: 1 }, { de: 23, ate: 25, tema: 'savana', start: 6 }, { de: 27, ate: 31, x0: 29, tema: 'mini', start: 1 }, { de: 35, ate: 41, tema: 'mini', start: 3, opts: { semCeu: true } }]);
    for (const j of [20, 23, 24]) pinturasParede(M, j, [{ de: 15, ate: 25, tema: 'mar', start: 2 }, { de: 10, ate: 13, tema: 'jardim', start: 1 }]);
    // bebês: berços e incubadoras
    for (const bx of [2, 4, 6, 8, 10]) M.obj('berco', bx, 3, { spot: 'caso', bebe: true });
    M.obj('incubadora', 2, 7, { spot: 'caso', bebe: true }); M.obj('incubadora', 4, 7, { spot: 'caso', bebe: true }); M.obj('poltrona', 8, 7); M.obj('poltrona', 10, 7); M.obj('pia', 12, 3);
    // infantil: leitos, cortinas brancas, berço central, poltronas verde-oliva, mural leão/avestruz/palmeira
    M.obj('leito', 15, 3, { spot: 'caso', blanket: '#f2c8d8' }); M.obj('cortina', 17, 3, { cor: '#f2f2ee' }); M.obj('poltrona', 18, 3);
    M.obj('berco', 19, 4, { spot: 'caso', bebe: true }); M.obj('cortina', 20, 3, { cor: '#f2f2ee' });
    M.obj('leito', 22, 3, { spot: 'caso', blanket: '#e8d9b8' }); M.obj('cortina', 24, 3, { cor: '#f2f2ee' }); M.obj('leito', 25, 3, { spot: 'caso', blanket: '#cfe6c8' });
    M.obj('pia', 26, 7); M.obj('mesa_cabeceira', 14, 7);
    // consultório: mural crianças com balões, nuvem sorridente, maca de madeira, balança
    M.obj('maca_exame', 32, 4, { spot: 'caso' }); M.obj('mesa', 28, 6); M.obj('cadeira_verde', 29, 7); M.obj('cadeira_verde', 30, 8); M.obj('balanca', 34, 7);
    // brinquedoteca
    M.obj('tapete', 37, 4); M.obj('brinquedos', 36, 3); M.obj('brinquedos', 40, 7); M.obj('estante', 40, 3);
    // corredor
    // adolescentes
    M.decal('quadro', 11 * 16 + 1, 16 * 16 + 10, 30, 20);
    for (const by of [19, 23]) { M.obj('leito', 2, by, { spot: 'caso', blanket: '#b8c8f0' }); M.obj('leito', 7, by, { spot: 'caso', blanket: '#d0e8c0' }); M.obj('mesa_cabeceira', 4, by); }
    M.obj('cortina', 5, 21, { cor: '#f2f2ee' });
    // posto e residentes
    M.row('balcao', 11, 21, 4, 1, { cor: '#f2e6c8' }); M.obj('mesa', 11, 18); M.obj('armario', 16, 18, { cor: '#f2e6c8' });
    M.obj('mesa', 19, 18); M.obj('impressora', 23, 18); M.obj('cafeteira', 24, 18); M.obj('garrafa', 25, 18); M.obj('sofa', 19, 21, { cor: '#e88aa8', tag: 'sofa' }); M.obj('armario', 25, 21, { cor: '#c9a46a' });
    // observação / procedimentos
    M.obj('leito', 12, 25, { spot: 'caso', blanket: '#ffe0a0' }); M.obj('leito', 16, 25, { spot: 'proc', blanket: '#e8e8e8' }); M.obj('monitor', 17, 25); M.obj('carrinho_emerg', 19, 25); M.obj('leito', 21, 25, { spot: 'caso', blanket: '#c8e0f8' }); M.obj('suporte_soro', 23, 26); M.obj('armario', 25, 25);
    // PA pediatria: placa, TV de triagem colorida, mural de crianças, cadeiras metálicas
    M.decal('placa', 35 * 16 + 4, 16 * 16 + 4, 6 * 16 - 8, 11, { texto: 'PRONTO ATENDIMENTO PEDIATRIA', bg: '#f7f7f2', fg: '#1d8a4a' });
    M.decal('tv', 27 * 16 + 2, 16 * 16 + 6, 26, 18, { triagem: true });
    for (const ry of [22, 24, 26]) M.row('cadeira_metal', 28, ry, 7);
    M.row('balcao', 36, 20, 3, 1, { cor: '#f2e6c8' }); M.obj('brinquedos', 39, 26); M.obj('planta', 27, 27); M.obj('bebedouro', 40, 27);
    MAPS.ped = M;
  }
  // ============ GINECOLOGIA E OBSTETRÍCIA ============
  {
    const M = new MapB('go', 'Centro Obstétrico e PS de GO', 42, 30, 'go');
    M.room(0, 0, 9, 13, ',', 'Consultório Ginecológico'); M.room(8, 0, 9, 13, ',', 'Sala de Ultrassom'); M.room(16, 0, 15, 13, ',', 'Centro Obstétrico (PPP)'); M.room(30, 0, 12, 13, ',', 'Observação Obstétrica');
    M.room(0, 12, 42, 7, ',', 'Corredor');
    M.room(0, 18, 15, 12, '.', 'Alojamento Conjunto'); M.room(14, 18, 14, 12, '.', 'PS de GO — Recepção'); M.room(27, 18, 8, 7, ',', 'Posto'); M.room(34, 18, 8, 7, ',', 'Sala dos Residentes'); M.room(27, 24, 15, 6, '.', 'Quartos');
    M.door(4, 12, 1, 2); M.door(12, 12, 1, 2); M.door(23, 12, 2, 2); M.door(36, 12, 1, 2);
    M.door(7, 18, 1, 2); M.door(20, 18, 2, 2); M.door(30, 18, 1, 2); M.door(37, 18, 1, 2); M.door(33, 24, 1, 2); M.door(27, 27, 1, 1);
    M.door(20, 29, 2, 1); M.warp(20, 29, 2, 1, 'lobby', 9.5, 2.6, 0);
    M.win(1, 18, 0).win(2, 18, 2).win(10, 18, 2);
    M.decal('letras', 17 * 16, 12 * 16 + 1, 13 * 16, 14, { texto: 'CENTRO OBSTETRICO', fg: '#1d2a6a', s: 2 });
    M.decal('saida', 26 * 16, 12 * 16 + 18, 14, 7);
    // consultório ginecológico
    M.obj('mesa_gineco', 5, 4, { spot: 'caso', local: 'gineco' }); M.obj('cortina', 4, 4, { cor: '#f2f2ee' }); M.obj('mesa', 1, 7); M.obj('pia', 7, 8); M.obj('armario', 1, 3);
    // ultrassom
    M.obj('maca', 11, 3, { spot: 'caso', local: 'gineco' }); M.obj('ultrassom', 12, 3); M.obj('mesa', 13, 8);
    // centro obstétrico: berço aquecido, mural mãe-bebê, relógio
    M.decal('mural_mae', 21 * 16, 2, 5 * 16, 30); M.decal('relogio', 18 * 16, 6, 12, 12);
    M.obj('leito', 18, 4, { spot: 'caso', local: 'obst', blanket: '#e6f0f5' }); M.obj('incubadora', 19, 4); M.obj('monitor', 17, 4);
    M.obj('cortina', 21, 6, { cor: '#f2f2ee' });
    M.obj('leito', 27, 4, { spot: 'caso', local: 'obst', blanket: '#e6f0f5' }); M.obj('incubadora', 28, 4); M.obj('monitor', 29, 4); M.obj('carrinho_emerg', 24, 9); M.obj('pia', 17, 9);
    // observação
    for (const bx of [32, 35, 38]) M.obj('leito', bx, 3, { spot: 'caso', local: 'obst', blanket: '#f2e6c8' });
    M.obj('cortina', 34, 3, { cor: '#efe3b8' }); M.obj('cortina', 37, 3, { cor: '#efe3b8' }); M.obj('monitor', 40, 8);
    // alojamento conjunto: leitos com berços acrílicos e cortinas creme
    for (const bx of [2, 6, 10]) { M.obj('leito', bx, 21, { spot: 'caso', local: 'obst', blanket: '#ffffff' }); M.obj('bercinho', bx + 1, 22); }
    M.obj('cortina', 4, 21, { cor: '#efe3b8' }); M.obj('cortina', 8, 21, { cor: '#efe3b8' }); M.obj('pia', 13, 26); M.obj('poltrona', 2, 26);
    // PS GO recepção
    M.row('balcao', 15, 21, 4, 1, { cor: '#f2e6c8', vidro: true }); for (const ry of [24, 26]) M.row('cadeira_metal', 16, ry, 5); M.obj('planta', 26, 21); M.obj('bebedouro', 26, 25);
    M.decal('placa', 15 * 16, 18 * 16 + 18, 6 * 16, 9, { texto: 'ACOLHIMENTO', bg: '#e2738c' });
    // posto, residentes, quartos
    M.row('balcao', 28, 22, 3, 1, { cor: '#f2e6c8' }); M.obj('mesa', 32, 20, { pc: true });
    M.obj('mesa', 35, 20); M.obj('impressora', 39, 20); M.obj('cafeteira', 40, 20); M.obj('garrafa', 40, 22); M.obj('sofa', 35, 22, { cor: '#c86b98', tag: 'sofa' });
    M.obj('leito', 29, 26, { spot: 'caso', local: 'gineco', blanket: '#e8d9f0' }); M.obj('leito', 34, 26, { spot: 'caso', local: 'gineco', blanket: '#d9f0e8' }); M.obj('leito', 38, 26, { spot: 'caso', local: 'gineco', blanket: '#f0e8d9' }); M.obj('armario', 40, 26);
    MAPS.go = M;
  }
  // ============ CLÍNICA MÉDICA ============
  // Enfermaria dividida em alas por especialidade: cada ala recebe só os casos da sua área.
  {
    const M = new MapB('cm', 'Enfermaria de Clínica Médica', 86, 32, 'cm');
    const NORTE = ['cardio', 'pneumo', 'endocrino', 'gastro', 'hepato', 'hemato'], SUL = ['infecto', 'nefro', 'neuro', 'psiq', 'reumato'];
    NORTE.forEach((a, k) => M.room(k * 12, 0, 13, 13, '.', 'Ala de ' + ALAS_CM[a].nome));
    M.room(72, 0, 14, 13, ':', 'Sala da Clínica Médica');
    M.room(0, 12, 86, 7, ',', 'Corredor das Alas');
    SUL.forEach((a, k) => M.room(k * 12, 18, 13, 14, '.', 'Ala de ' + ALAS_CM[a].nome));
    M.room(60, 18, 13, 7, ',', 'Posto'); M.room(60, 24, 13, 8, ',', 'Copa'); M.room(72, 18, 14, 14, ',', 'Sala de Procedimentos');
    NORTE.forEach((a, k) => { M.door(k * 12 + 6, 12, 1, 2); M.win(k * 12 + 2, 0, 2).win(k * 12 + 9, 0, 2); });
    SUL.forEach((a, k) => M.door(k * 12 + 6, 18, 1, 2));
    M.door(78, 12, 1, 2); M.door(66, 18, 1, 2); M.door(66, 24, 1, 2); M.door(78, 18, 1, 2); M.win(75, 0, 2).win(81, 0, 2);
    M.door(0, 15, 1, 2); M.warp(0, 15, 1, 2, 'lobby', 29.5, 2.6, 0);
    const placa = (a, x, wallY) => { const t = ALAS_CM[a].placa; const w = Math.min(11 * 16, t.length * 4 + 10); M.decal('placa', x * 16 + Math.round((13 * 16 - w) / 2), wallY * 16 + 3, w, 9, { texto: t, bg: ALAS_CM[a].cor }); };
    const ala = (a, x, norte) => {
      const yb = norte ? 3 : 26, cor = ALAS_CM[a].manta;
      [2, 6, 10].forEach((dx, i) => M.obj('leito', x + dx, yb, { spot: 'caso', ala: a, leito: i + 1, blanket: cor }));
      M.obj('cortina', x + 4, yb, { cor: '#dfe4ea' }); M.obj('cortina', x + 8, yb, { cor: '#dfe4ea' });
      if (a === 'psiq') { M.obj('sofa', x + 2, norte ? 8 : 21, { cor: '#c9d8c4' }); M.obj('mesa_redonda', x + 8, norte ? 8 : 21); M.obj('planta', x + 11, norte ? 9 : 21); }
      else { M.obj('suporte_soro', x + 11, norte ? 6 : 23); M.obj('poltrona', x + 1, norte ? 8 : 21); M.obj('pia', x + 11, norte ? 9 : 21); M.obj('mesa_cabeceira', x + 1, yb); }
      if (a === 'infecto') M.decal('placa', x * 16 + 4, (norte ? 12 : 18) * 16 + 3, 48, 9, { texto: 'ISOLAMENTO', bg: '#c0392b' });
      placa(a, x, norte ? 12 : 18);
    };
    NORTE.forEach((a, k) => ala(a, k * 12, true));
    SUL.forEach((a, k) => ala(a, k * 12, false));
    // sala da clínica médica: painéis de madeira, sofás brancos, mesas redondas, janela para a cidade
    M.decal('painel_madeira', 73 * 16, 2, 2 * 16, 30); M.decal('painel_madeira', 83 * 16, 2, 2 * 16, 30); M.decal('janela_cidade', 75 * 16 + 4, 4, 8 * 16 - 8, 24);
    M.obj('sofa', 73, 8, { cor: '#ece8df', tag: 'sofa' }); M.obj('sofa', 77, 4, { cor: '#ece8df' }); M.obj('mesa_redonda', 78, 7); M.obj('cadeira_madeira', 77, 9); M.obj('cadeira_madeira', 79, 9);
    M.obj('mesa', 81, 4); M.obj('mesa', 83, 8); M.obj('impressora', 84, 4); M.obj('cafeteira', 73, 3); M.obj('garrafa', 74, 3); M.obj('planta', 75, 3); M.obj('planta', 84, 10);
    // posto, copa, procedimentos
    M.row('balcao', 61, 22, 3, 1, { cor: '#dfe4e8' }); M.obj('mesa', 64, 20); M.obj('armario', 70, 20, { cor: '#dfe4e8' }); M.obj('mesa_simples', 68, 20, { papeis: true });
    M.obj('garrafa', 61, 26); M.obj('micro', 62, 26); M.obj('armario', 70, 26, { cor: '#c9a46a' }); M.obj('armario', 70, 28, { cor: '#c9a46a' }); M.obj('bebedouro', 61, 29);
    M.obj('maca', 75, 24, { spot: 'proc' }); M.obj('ultrassom', 77, 24); M.obj('carrinho_emerg', 73, 24); M.obj('mesa_instrum', 79, 25); M.obj('pia', 84, 24); M.obj('monitor', 81, 24); M.obj('armario', 84, 28, { cor: '#dfe4e8' });
    MAPS.cm = M;
  }
  // ============ CIRURGIA ============
  {
    const M = new MapB('cir', 'Centro Cirúrgico', 50, 32, 'cir');
    M.room(0, 0, 12, 13, ',', 'Vestiário'); M.room(0, 12, 12, 10, '.', 'Entrada do Centro Cirúrgico'); M.room(0, 21, 12, 11, ',', 'Recuperação (RPA)');
    for (let k = 0; k < 5; k++) M.room(11 + k * 6, 0, 7, 13, ':', 'Sala ' + (k + 1));
    M.room(41, 0, 9, 13, ',', 'Sala de Apoio');
    M.room(11, 12, 39, 10, ',', 'Corredor Cirúrgico');
    for (let k = 0; k < 5; k++) M.room(11 + k * 6, 21, 7, 11, ':', 'Sala ' + (k + 6));
    M.room(41, 21, 9, 11, ',', 'Posto e Copa');
    M.door(6, 12, 1, 2); M.door(6, 21, 1, 2); M.door(11, 15, 1, 3);
    for (let k = 0; k < 5; k++) { M.door(14 + k * 6, 12, 1, 2); M.door(14 + k * 6, 21, 1, 2); }
    M.door(45, 12, 1, 2); M.door(45, 21, 1, 2);
    M.door(0, 16, 1, 2); M.warp(0, 16, 1, 2, 'lobby', 38, 8, 2);
    M.decal('letras', 1 * 16, 12 * 16 + 1, 10 * 16, 14, { texto: 'CENTRO CIRURGICO', fg: '#1f3f9a', s: 2 }); M.decal('logo', 1 * 16 + 2, 14 * 16 + 4, 14, 14);
    M.decal('saida', 1 * 16, 12 * 16 + 20, 14, 7);
    // vestiário
    M.row('armario_vest', 1, 3, 6); M.obj('banco_madeira', 2, 6); M.obj('banco_madeira', 6, 6); M.row('pia', 8, 3, 3); M.obj('armario', 1, 9, { cor: '#9fd0e8' }); M.obj('armario', 10, 9, { cor: '#9fd0e8' });
    // RPA
    for (const bx of [2, 5, 8]) { M.obj('leito', bx, 24, { spot: 'caso', blanket: '#cfe6f5' }); M.obj('monitor', bx + 1, 24); } M.obj('mesa', 3, 28); M.obj('carrinho_emerg', 9, 28);
    // 10 salas cirúrgicas
    let sn = 1;
    for (let k = 0; k < 5; k++) {
      const x = 11 + k * 6;
      M.obj('mesa_cirurgica', x + 3, 5, { spot: 'caso', sala: sn }); M.obj('foco', x + 3, 4); M.obj('anestesia', x + 2, 3); M.obj('monitor', x + 4, 3); M.obj('mesa_instrum', x + 1, 7); M.obj('aspirador', x + 5, 8);
      M.decal('relogio', (x + 1) * 16 + 2, 6, 12, 12); M.decal('placa', (x + 2) * 16, 12 * 16 + 1, 48, 9, { texto: 'SALA ' + sn, bg: '#1f3f9a' }); sn++;
    }
    for (let k = 0; k < 5; k++) {
      const x = 11 + k * 6;
      M.obj('mesa_cirurgica', x + 3, 25, { spot: 'caso', sala: sn }); M.obj('foco', x + 3, 25); M.obj('anestesia', x + 2, 24); M.obj('monitor', x + 4, 24); M.obj('mesa_instrum', x + 1, 27); M.obj('aspirador', x + 5, 28);
      M.decal('placa', (x + 2) * 16, 21 * 16 + 1, 48, 9, { texto: 'SALA ' + sn, bg: '#1f3f9a' }); sn++;
    }
    // apoio (residentes + Leôncio)
    M.obj('mesa', 42, 3); M.obj('mesa', 45, 3); M.obj('impressora', 48, 3); M.obj('cafeteira', 42, 9); M.obj('garrafa', 43, 9); M.obj('sofa', 46, 8, { cor: '#4f8fd6', tag: 'sofa' }); M.decal('quadro', 44 * 16, 4, 40, 18);
    // posto e copa
    M.row('balcao', 42, 25, 3, 1, { cor: '#dfe4e8' }); M.row('armario', 46, 24, 3, 1, { cor: '#9fd0e8' }); M.obj('garrafa', 42, 28); M.obj('micro', 43, 28); M.obj('bebedouro', 48, 28); M.obj('mesa', 45, 28, { pc: true });
    MAPS.cir = M;
  }
  // ============ UBS MARIA DAS DORES ============
  // corredor com cadeiras metálicas e placas azuis "CONSULTÓRIO", paredes brancas com faixa azul,
  // painel de senha na recepção, farmácia com guichê, sala de vacina, sala da equipe e de estudos
  {
    const M = new MapB('ubs', 'UBS Maria das Dores', 44, 30, 'ubs');
    for (let k = 0; k < 5; k++) M.room(k * 7, 0, 8, 12, ',', 'Consultório ' + (k + 1));
    M.room(35, 0, 9, 12, ',', 'Sala de Vacina');
    M.room(0, 11, 44, 6, ',', 'Corredor');
    M.room(0, 16, 15, 14, '.', 'Recepção e Acolhimento');
    M.room(14, 16, 8, 7, ',', 'Farmácia'); M.room(14, 22, 8, 8, ',', 'Sala de Procedimentos');
    M.room(21, 16, 12, 8, ',', 'Sala da Equipe (ESF)'); M.room(32, 16, 12, 8, ',', 'Sala de Estudos');
    M.room(21, 23, 12, 7, '.', 'Sala de Grupos'); M.room(32, 23, 12, 7, ',', 'Almoxarifado e Copa');
    for (let k = 0; k < 5; k++) M.door(k * 7 + 3, 11, 1, 2);
    M.door(39, 11, 1, 2);
    M.door(7, 16, 2, 2); M.door(20, 16, 1, 2); M.door(26, 16, 1, 2); M.door(37, 16, 1, 2);
    M.door(14, 25, 1, 1); M.door(21, 26, 1, 1); M.door(26, 23, 1, 2); M.door(37, 23, 1, 2);
    M.door(6, 29, 2, 1); M.warp(6, 29, 2, 1, 'rua', 38, 26.8, 0);
    for (let k = 0; k < 5; k++) M.win(k * 7 + 2, 0, 2);
    M.win(36, 0, 2);
    // consultórios: mesa, cadeira, maca de exame, pia; placas azuis no corredor
    for (let k = 0; k < 5; k++) {
      const x = k * 7;
      M.obj('mesa', x + 1, 3); M.obj('cadeira_verde', x + 2, 4, { cor: '#3d7cc9' });
      if (k === 4) { M.obj('mesa_gineco', x + 5, 4, { spot: 'caso' }); M.obj('cortina', x + 4, 4, { cor: '#dfe8f2' }); }
      else M.obj('maca_exame', x + 4, 3, { spot: 'caso' });
      M.obj('pia', x + 6, 8); M.obj('armario', x + 1, 9, { cor: '#dfe4e8' });
      M.decal('placa', x * 16 + 2, 11 * 16 + 3, 44, 9, { texto: 'CONSULT. ' + (k + 1), bg: '#2f62b8' });
    }
    M.obj('balanca', 15, 7); M.obj('balanca', 1, 7);
    // sala de vacina
    M.obj('geladeira', 36, 3, { vacina: true }); M.obj('geladeira', 37, 3, { vacina: true }); M.obj('mesa', 39, 3); M.obj('cadeira_verde', 40, 4, { cor: '#3d7cc9' }); M.obj('armario', 42, 3, { cor: '#dfe4e8' }); M.obj('lixeira', 42, 9, { cor: '#e9c13b' }); M.obj('pia', 36, 9);
    M.decal('placa', 35 * 16 + 4, 11 * 16 + 3, 44, 9, { texto: 'VACINA', bg: '#3fa66b' });
    M.decal('cartaz_ubs', 39 * 16 + 4, 4, 30, 24, { tipo: 'vacina' });
    // corredor: cadeiras metálicas encostadas na parede sul (com passagem nas portas)
    for (const [x0, n] of [[1, 5], [10, 8], [22, 3], [28, 8], [39, 3]]) M.row('cadeira_metal', x0, 15, n);
    M.decal('cartaz_ubs', 12 * 16, 11 * 16 + 2, 24, 26, { tipo: 'dengue' }); M.decal('cartaz_ubs', 26 * 16 + 2, 11 * 16 + 2, 24, 26, { tipo: 'hiperdia' });
    M.obj('bebedouro', 42, 13); M.obj('planta', 1, 13);
    // recepção e acolhimento: guichês, painel de senha, cadeiras
    M.row('balcao', 2, 20, 6, 1, { cor: '#e8edf2', vidro: true });
    M.decal('placa', 1 * 16 + 4, 16 * 16 + 18, 5 * 16, 9, { texto: 'ACOLHIMENTO', bg: '#2f62b8' });
    M.decal('painel_senha', 9 * 16, 16 * 16 + 3, 64, 26, { senha: 'A0013', local: 'CONSULT. 2' });
    for (const ry of [23, 25, 27]) { M.row('cadeira_metal', 2, ry, 4); M.row('cadeira_metal', 9, ry, 4); }
    M.obj('planta', 13, 18); M.obj('bebedouro', 1, 18);
    // farmácia
    M.row('estante', 15, 18, 5); M.row('balcao', 15, 20, 5, 1, { cor: '#e8edf2', vidro: true });
    M.decal('placa', 15 * 16, 16 * 16 + 18, 74, 9, { texto: 'FARMACIA - GUICHE 2', bg: '#2f62b8' });
    // procedimentos
    M.obj('maca', 16, 24, { spot: 'proc' }); M.obj('pia', 20, 24); M.obj('armario', 15, 27, { cor: '#dfe4e8' }); M.obj('mesa_instrum', 18, 27); M.obj('suporte_soro', 17, 24);
    // sala da equipe: reunião, genograma na parede, café, impressora, computador
    M.decal('quadro_genograma', 27 * 16 + 2, 16 * 16 + 6, 52, 24, {});
    M.obj('mesa_redonda', 25, 20); M.obj('cadeira_madeira', 24, 20); M.obj('cadeira_madeira', 26, 20);
    M.obj('mesa', 22, 18); M.obj('impressora', 29, 18); M.obj('cafeteira', 30, 18); M.obj('garrafa', 31, 18); M.obj('armario', 31, 21, { cor: '#c9a46a' });
    // sala de estudos dos recém-formados
    M.obj('mesa', 33, 18); M.obj('mesa', 39, 18); M.obj('estante', 42, 18); M.obj('estante', 42, 19);
    M.obj('mesa_redonda', 36, 21); M.obj('cadeira_madeira', 35, 21); M.obj('cadeira_madeira', 37, 21);
    M.obj('sofa', 39, 21, { cor: '#3d7cc9', tag: 'sofa' });
    M.decal('quadro', 34 * 16, 16 * 16 + 6, 40, 20);
    // sala de grupos (Hiperdia, gestantes, tabagismo)
    for (const gx of [23, 25, 27, 29]) M.obj('cadeira_madeira', gx, 27);
    M.obj('balanca', 31, 25); M.obj('mesa_simples', 23, 25, { papeis: true });
    M.decal('cartaz_ubs', 27 * 16, 23 * 16 + 4, 30, 24, { tipo: 'grupos' });
    // almoxarifado e copa
    M.row('armario', 33, 25, 4, 1, { cor: '#c9a46a' }); M.obj('garrafa', 40, 25); M.obj('micro', 41, 25); M.obj('bebedouro', 42, 27); M.obj('mesa_simples', 39, 27);
    MAPS.ubs = M;
  }
  // ============ BAR DO RODOLFO ============
  {
    const M = new MapB('bar', 'Bar do Rodolfo', 24, 16, 'bar');
    M.room(0, 0, 24, 16, '.', 'Bar do Rodolfo');
    M.door(11, 15, 2, 1); M.warp(11, 15, 2, 1, 'rua', 13, 26.75, 0);
    M.decal('neon', 9 * 16, 3, 6 * 16, 16, { texto: 'BAR DO RODOLFO', sub: 'DESDE 1987' });
    M.decal('tv', 17 * 16, 6, 30, 20, {}); M.decal('quadro', 2 * 16, 6, 36, 18);
    M.row('estante_bar', 4, 2, 4); M.obj('geladeira', 18, 2); M.obj('geladeira', 19, 2); M.obj('cafeteira', 16, 2);
    M.row('balcao_bar', 5, 5, 12); M.row('banqueta', 5, 6, 6, 2);
    M.obj('mesa_plastico', 3, 9, { cor: '#c0392b', bar: true }); M.obj('mesa_plastico', 8, 10, { cor: '#e9c13b', bar: true }); M.obj('mesa_plastico', 19, 9, { cor: '#c0392b', bar: true }); M.obj('mesa_plastico', 3, 12, { cor: '#e9c13b', bar: true });
    M.obj('sinuca', 14, 11); M.obj('planta', 22, 13); M.obj('lixeira', 1, 13, { cor: '#3fa66b' });
    MAPS.bar = M;
  }
}

/* renderiza a camada estática de um mapa (tiles, decalques, móveis, sombras) */
function renderMapStatic(M) {
  const W = M.w * TS, H = M.h * TS;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const c = cv.getContext('2d'); c.imageSmoothingEnabled = false;
  const img = c.createImageData(W, H); paintTiles(M, img); c.putImageData(img, 0, 0);
  // decalques (coordenadas de construção em unidades de 16 → ×2)
  for (const d of M.decals) {
    const o = Object.assign({}, d); if (o.door) o.door = [d.door[0] * 2, d.door[1] * 2];
    const fach = d.kind.startsWith('fachada'); c.save(); c.beginPath(); c.rect(d.x * 2 - (fach ? 0 : 0), d.y * 2 - (fach ? 24 : 0), d.w * 2, d.h * 2 + (fach ? 24 : 0)); c.clip();
    try { DECALS[d.kind](c, d.x * 2, d.y * 2, d.w * 2, d.h * 2, o); } catch (e) { console.warn('decal', d.kind, e); }
    c.restore();
  }
  // sombras de contato dos móveis (elipse suave com borda pontilhada)
  for (const o of M.objs) {
    const d = OBJ_DEFS[o.type]; if (d.under || d.over || d.noShadow || !o.solid) continue;
    const w = o.w * TS, cxp = o.x * TS + w / 2 + 2, bot = o.y * TS + o.h * TS - 1, rx = w / 2 - 1, ry = 4;
    for (let k = -ry; k <= ry; k++) { const hw = Math.round(rx * Math.sqrt(1 - (k * k) / (ry * ry + 1))); c.fillStyle = 'rgba(16,12,30,' + (0.2 - Math.abs(k) * 0.03) + ')'; c.fillRect(Math.round(cxp - hw), bot + k, hw * 2, 1); }
  }
  const sorted = M.objs.slice().sort((a, b) => (OBJ_DEFS[b.type].under ? 1 : 0) - (OBJ_DEFS[a.type].under ? 1 : 0) || a.y - b.y || a.x - b.x);
  for (const o of sorted) { const d = OBJ_DEFS[o.type]; if (d.over) continue; drawObj(c, o, o.x * TS, o.y * TS); }
  const ov = document.createElement('canvas'); ov.width = W; ov.height = H;
  const oc = ov.getContext('2d'); oc.imageSmoothingEnabled = false;
  // veículos: a parte acima da linha do chão vai para a camada de cima (o jogador passa atrás)
  for (const o of sorted) {
    const d = OBJ_DEFS[o.type]; if (!d.overTop) continue;
    oc.save(); oc.beginPath(); oc.rect(o.x * TS - 64, o.y * TS - 128, o.w * TS + 128, 128); oc.clip(); drawObj(oc, o, o.x * TS, o.y * TS); oc.restore();
  }
  for (const o of sorted) {
    const d = OBJ_DEFS[o.type]; if (!d.over) continue;
    if (d.glow) { const g = oc.createRadialGradient(o.x * TS + 16, o.y * TS + 20, 2, o.x * TS + 16, o.y * TS + 20, 34); g.addColorStop(0, 'rgba(255,250,220,0.28)'); g.addColorStop(1, 'rgba(255,250,220,0)'); oc.fillStyle = g; oc.fillRect(o.x * TS - 24, o.y * TS - 20, 80, 80); }
    if (o.type === 'arvore' || o.type === 'arvore_seca') { c.fillStyle = 'rgba(16,40,16,0.18)'; for (let k = -16; k <= 16; k++) { const w = Math.round(Math.sqrt(256 - k * k) * 1.4); c.fillRect(o.x * TS + 18 - w, o.y * TS + 26 + Math.round(k / 3), w * 2, 1); } }
    drawObj(oc, o, o.x * TS, o.y * TS);
  }
  M.canvas = cv; M.overlay = ov;
  // grade de colisão
  M.solid = Array.from({ length: M.h }, (_, j) => Array.from({ length: M.w }, (_, i) => SOLID_TILES.has(M.t(i, j))));
  for (const o of M.objs) { if (!o.solid) continue; for (let j = o.y; j < o.y + o.h; j++) for (let i = o.x; i < o.x + o.w; i++) if (M.in(i, j)) M.solid[j][i] = true; }
}
