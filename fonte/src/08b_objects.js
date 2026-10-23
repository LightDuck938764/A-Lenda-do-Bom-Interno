/* =====================================================================
   MOBILIÁRIO E OBJETOS EM 32 px (perspectiva 3/4: tampo + frente)
   Cada objeto é pintado com o mesmo motor dos personagens (rampas,
   sombreamento por material, contorno seletivo) e guardado em cache.
   ===================================================================== */
const OBJ_DEFS = {};
function OD(type, w, h, draw, o = {}) { OBJ_DEFS[type] = Object.assign({ w, h, draw, tall: 12 }, o); }

/* ---------- fonte 5×7 para placas ---------- */
const FONT57 = (() => {
  const g = {
    A: '01110100011000111111100011000110001', B: '11110100011000111110100011000111110', C: '01110100011000010000100001000101110', D: '11110100011000110001100011000111110',
    E: '11111100001000011110100001000011111', F: '11111100001000011110100001000010000', G: '01110100011000010111100011000101111', H: '10001100011000111111100011000110001',
    I: '01110001000010000100001000010001110', J: '00111000100001000010000101001001100', K: '10001100101010011000101001001010001', L: '10000100001000010000100001000011111',
    M: '10001110111010110101100011000110001', N: '10001100011100110101100111000110001', O: '01110100011000110001100011000101110', P: '11110100011000111110100001000010000',
    Q: '01110100011000110001101011001001101', R: '11110100011000111110101001001010001', S: '01111100001000001110000010000111110', T: '11111001000010000100001000010000100',
    U: '10001100011000110001100011000101110', V: '10001100011000110001100010101000100', W: '10001100011000110101101011010101010', X: '10001100010101000100010101000110001',
    Y: '10001100010101000100001000010000100', Z: '11111000010001000100010001000011111',
    '0': '01110100011001110101110011000101110', '1': '00100011000010000100001000010001110', '2': '01110100010000100010001000100011111', '3': '11111000100010000010000011000101110',
    '4': '00010001100101010010111110001000010', '5': '11111100001111000001000011000101110', '6': '00110010001000011110100011000101110', '7': '11111000010001000100010000100001000',
    '8': '01110100011000101110100011000101110', '9': '01110100011000101111000010001001100',
    '-': '00000000000000011111000000000000000', '.': '00000000000000000000000000110001100', ':': '00000011000110000000011000110000000', '!': '00100001000010000100001000000000100',
    '/': '00001000100001000100010000100010000', '+': '00000001000010011111001000010000000', '<': '00010001000100010000010000010000010', '>': '01000001000001000001000100010001000',
    "'": '00100001000000000000000000000000000', ' ': '00000000000000000000000000000000000', '?': '01110100010000100010001000000000100',
  };
  return g;
})();
function text57(c, txt, x, y, col, scale = 1) {
  txt = String(txt).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  c.fillStyle = col; let cx = x;
  for (const ch of txt) { const g = FONT57[ch] || FONT57[' ']; for (let i = 0; i < 35; i++) if (g[i] === '1') c.fillRect(cx + (i % 5) * scale, y + Math.floor(i / 5) * scale, scale, scale); cx += 6 * scale; }
  return cx - x;
}
function text57W(txt, scale = 1) { return String(txt).length * 6 * scale - scale; }

/* ---------- pintor de objetos ---------- */
class OMask extends PxMask {
  constructor(w, h, ox, oy) { super(w, h); this.ox = ox; this.oy = oy; }
  px(x, y, v = 1) { return super.px(x + this.ox, y + this.oy, v); }
}
class ObjPainter {
  constructor(wpx, hpx, top, side = 6) { this.ox = side; this.oy = top; this.F = new PxFrame(wpx + side * 2, hpx + top + 6); }
  mask() { return new OMask(this.F.w, this.F.h, this.ox, this.oy); }
  R(col, kind) { if (Array.isArray(col)) col = PAL.hex(col.map(v => Math.max(0, Math.min(255, Math.round(v))))); return typeof col === 'string' ? PAL.ramp(col, kind) : col; }
  paint(M, col, o = {}) {
    const o2 = Object.assign({}, o); const ox = this.ox, oy = this.oy;
    if (o.pat) o2.pat = (x, y) => o.pat(x - ox, y - oy);
    if (o.col) o2.col = (x, y, lv) => o.col(x - ox, y - oy, lv);
    return paint(this.F, M, this.R(col, o.kind), o2);
  }
  box(x, y, w, h, col, o = {}) { return this.paint(this.mask().rect(x, y, w, h), col, Object.assign({ round: true, top: true }, o)); }
  ell(cx, cy, rx, ry, col, o = {}) { return this.paint(this.mask().ell(cx, cy, rx, ry), col, Object.assign({ round: true, top: true }, o)); }
  // bloco 3/4: tampo (topH) visto de cima + frente
  block(x, y, w, h, topH, col, o = {}) {
    const R = this.R(col);
    const front = this.mask().rect(x, y + topH, w, h - topH), top = this.mask().rect(x, y, w, topH);
    this.paint(front, R, Object.assign({ lv: -1, round: true, edge: false, pat: o.fpat }, o.front || {}));
    this.paint(top, o.topCol ? this.R(o.topCol) : R, Object.assign({ top: true, edge: false, pat: o.tpat }, o.topO || {}));
    if (o.lip !== false) for (let k = 0; k < w; k++) this.px(x + k, y + topH - 1, (o.topCol ? this.R(o.topCol) : R).l1);
    for (let k = 0; k < w; k++) this.px(x + k, y + topH, R.d2);
  }
  px(x, y, col) { this.F.set(x + this.ox, y + this.oy, typeof col === 'string' ? PAL.rgb(col) : col, -5); }
  rect(x, y, w, h, col) { const c = typeof col === 'string' ? PAL.rgb(col) : col; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.F.set(x + i + this.ox, y + j + this.oy, c, -5); }
  hline(x, y, w, col) { this.rect(x, y, w, 1, col); }
  vline(x, y, h, col) { this.rect(x, y, 1, h, col); }
  text(t, x, y, col) { const g = s => FONT57[s] || FONT57[' ']; let cx = x; for (const ch of String(t).toUpperCase()) { const gg = g(ch); for (let i = 0; i < 35; i++) if (gg[i] === '1') this.px(cx + (i % 5), y + Math.floor(i / 5), col); cx += 6; } }
  get(x, y) { return this.F.get(x + this.ox, y + this.oy); }
  canvas() { selOut(this.F); const cv = document.createElement('canvas'); cv.width = this.F.w; cv.height = this.F.h; cv.getContext('2d').putImageData(new ImageData(this.F.d, this.F.w, this.F.h), 0, 0); return cv; }
}
const OBJ_CACHE = new Map();
function objSprite(o) {
  const d = OBJ_DEFS[o.type];
  const opt = {}; for (const k in o) if (!['x', 'y', 'id', 'type', 'w', 'h', 'solid', 'spot', 'quarto', 'leito', 'sala', 'local', 'bebe'].includes(k)) opt[k] = o[k];
  const key = o.type + JSON.stringify(opt) + (d.vary ? '|' + d.vary(o) : '');
  let s = OBJ_CACHE.get(key);
  if (!s) { const P = new ObjPainter(d.w * TS, d.h * TS, d.tall, d.side || 6); d.draw(P, o); s = { cv: P.canvas(), ox: P.ox, oy: P.oy }; OBJ_CACHE.set(key, s); }
  return s;
}
function drawObj(c, o, px, py) { const s = objSprite(o); c.drawImage(s.cv, px - s.ox, py - s.oy); }
const RAMP = (c, k) => PAL.ramp(c, k);
const STEEL = '#c3cad1', STEEL_D = '#8d969f', WHITE = '#f3f5f6', DARK = '#2a2d36';
function wheels(P, pts) { for (const [x, y] of pts) P.box(x, y, 3, 3, '#3a3d46'); }

/* ---------------- Leitos, macas e berços ---------------- */
OD('leito', 1, 2, (P, o) => {
  const bl = o.blanket || '#e9eef2';
  P.block(1, 2, 30, 60, 58, STEEL);                     // estrutura
  P.block(2, 0, 28, 7, 4, '#d9dde2');                    // cabeceira
  P.box(3, 7, 26, 52, '#fbfcfd', { pat: (x, y) => (x === 3 || x === 28 ? -1 : 0) });   // colchão
  P.ell(16, 13, 10, 5, '#ffffff', { pat: (x, y) => (y > 14 ? -1 : 0) });            // travesseiro
  P.box(3, 22, 26, 36, bl, { pat: (x, y) => (y < 25 ? 1 : (y - 22) % 11 === 6 && x > 6 && x < 25 ? -1 : (x === 9 || x === 22) && y > 28 ? -1 : 0) }); // cobertor
  P.box(3, 22, 26, 3, '#ffffff', { edge: false });       // lençol dobrado
  for (const x of [0, 29]) { P.box(x, 24, 3, 18, STEEL, { lv: 0 }); P.hline(x, 28, 3, STEEL_D); P.hline(x, 35, 3, STEEL_D); }  // grades
  P.block(2, 57, 28, 6, 3, '#d9dde2');                   // peseira
  wheels(P, [[1, 61], [28, 61]]);
});
OD('maca', 1, 2, (P) => {
  P.block(3, 4, 26, 56, 52, STEEL);
  P.box(4, 4, 24, 52, '#5f7486', { pat: (x, y) => ((y - 4) % 13 === 0 ? -1 : 0) });        // estofado
  P.box(10, 4, 12, 52, '#f6f6f2', { edge: false, pat: (x, y) => (x === 10 ? -1 : 0) });  // papel lençol
  P.ell(16, 10, 8, 4, '#ffffff');
  wheels(P, [[3, 58], [26, 58]]);
});
OD('maca_exame', 2, 1, (P) => {
  P.block(1, 6, 62, 24, 12, '#b48a5e', { fpat: (x, y) => (x % 15 === 0 ? -1 : 0) });     // base de madeira
  P.box(2, 4, 60, 12, '#e9e1d2', { pat: (x, y) => (x === 16 ? -1 : 0) });                  // estofado
  P.box(18, 5, 30, 10, '#fbfbf7', { edge: false });                                        // papel
  P.block(46, 18, 14, 12, 4, '#8c6a46');                                                   // degrau
});
OD('berco', 1, 1, (P) => {
  P.block(2, 4, 28, 26, 22, '#fbfbf9');
  P.box(5, 7, 22, 18, '#f6d1df', { pat: (x, y) => ((x + y) % 6 === 0 ? -1 : 0) });
  for (let x = 4; x < 28; x += 4) P.vline(x, 4, 22, '#dfe5ea');
  P.ell(16, 11, 5, 3, '#ffffff');
});
OD('incubadora', 1, 1, (P) => {
  P.block(2, 16, 28, 14, 4, '#9aa3ab');                  // base
  P.box(6, 22, 8, 4, '#26303a'); P.px(8, 23, '#5af08a'); P.px(10, 23, '#ffd84a');
  P.ell(16, 13, 13, 10, '#cfeaf5', { pat: (x, y) => (y < 8 && x < 14 ? 1 : 0) });          // cúpula acrílica
  P.box(9, 11, 14, 6, '#f6d1df', { edge: false });
  P.hline(6, 6, 6, '#ffffff'); P.hline(5, 7, 3, '#ffffff');
  P.box(24, -2, 5, 4, '#e05a5a');
});
OD('bercinho', 1, 1, (P) => {
  P.box(14, 22, 4, 7, STEEL_D); P.box(6, 28, 20, 2, STEEL_D);
  P.ell(16, 13, 12, 9, '#e8f4f8', { pat: (x, y) => (y < 8 ? 1 : 0) });
  P.ell(16, 13, 9, 6.5, '#ffffff', { edge: false });
  P.box(9, 13, 14, 5, '#cfe6f5', { edge: false });
  P.hline(8, 6, 5, '#ffffff');
});
/* ---------------- Cadeiras, sofás e mesas ---------------- */
OD('cadeira_preta', 1, 1, (P) => {
  P.block(3, 2, 26, 12, 4, '#2a2b32');                   // encosto
  P.block(3, 13, 26, 13, 9, '#33343c', { tpat: (x, y) => ((x - 3) % 6 === 0 ? -1 : 0) }); // assento
  P.box(5, 26, 2, 5, '#1b1c20'); P.box(25, 26, 2, 5, '#1b1c20');
});
OD('cadeira_metal', 1, 1, (P) => {
  P.block(4, 2, 24, 10, 3, '#c2cad1', { fpat: (x, y) => (y === 7 ? -1 : 0) });
  P.block(4, 12, 24, 13, 9, '#d8dde2');
  P.box(6, 25, 2, 6, STEEL_D); P.box(24, 25, 2, 6, STEEL_D);
});
OD('cadeira_verde', 1, 1, (P) => {
  P.box(14, 22, 4, 6, '#555a63'); P.box(6, 27, 20, 3, '#3a3d46');
  P.block(6, 3, 20, 10, 3, '#5aa23a');
  P.ell(16, 18, 11, 6, '#78bd52');
}, { solid: false });
OD('poltrona', 1, 1, (P) => {
  P.block(2, 1, 28, 12, 5, '#6b6a4a');
  P.block(2, 10, 6, 20, 8, '#5d5c3f'); P.block(24, 10, 6, 20, 8, '#5d5c3f');
  P.block(8, 11, 16, 18, 11, '#8a8962');
});
OD('sofa', 2, 1, (P, o) => {
  const col = o.cor || '#e8e4dc';
  P.block(2, 1, 60, 12, 6, col, { topO: { lv: -1 } });
  P.block(2, 9, 6, 21, 9, col); P.block(56, 9, 6, 21, 9, col);
  P.block(8, 10, 24, 18, 11, col, { topO: { lv: 1 } }); P.block(32, 10, 24, 18, 11, col, { topO: { lv: 1 } });
  P.ell(14, 8, 5, 3, RAMP(col).l1);
});
OD('mesa_redonda', 1, 1, (P) => {
  P.box(14, 20, 4, 8, STEEL_D); P.ell(16, 29, 7, 2, '#7c868f');
  P.ell(16, 14, 14, 10, '#f4f4f1', { pat: (x, y) => (y > 20 ? -1 : 0) });
  P.ell(11, 11, 3, 2, '#ffffff', { edge: false, shade: false });
});
OD('cadeira_madeira', 1, 1, (P) => {
  P.block(7, 4, 18, 8, 3, '#5a3a24');
  P.block(7, 11, 18, 14, 9, '#7a5234', { tpat: (x, y) => ((y - 11) % 3 === 0 ? -1 : 0) });
  P.box(8, 25, 2, 5, '#4a2e1c'); P.box(22, 25, 2, 5, '#4a2e1c');
}, { solid: false });
OD('mesa', 2, 1, (P, o) => {
  P.block(1, 4, 62, 26, 15, '#e9e4d8', { fpat: (x, y) => ((x === 22 || x === 42) ? -1 : (y === 24 && (x === 11 || x === 32 || x === 52)) ? 2 : 0) }); // mesa com gavetas
  if (o.pc !== false) {
    P.box(13, 12, 6, 4, '#3a3d44'); P.box(8, -6, 17, 19, '#22252c');             // monitor
    P.box(10, -4, 13, 13, '#3d74c4', { edge: false, pat: (x, y) => (y === -4 ? 1 : (y === 0 || y === 3) && x > 11 && x < 21 ? 2 : 0) });
    P.box(11, 2, 5, 4, '#e8f0fa', { edge: false });
    P.box(7, 15, 20, 4, '#3a3d44', { pat: (x, y) => ((x + y) % 2 === 0 ? 1 : 0) });   // teclado
    P.box(30, 15, 3, 4, '#d9dde2');                                                   // mouse
  }
  P.box(38, 6, 12, 10, '#fbfbf6', { pat: (x, y) => (y % 2 === 0 && x > 39 && x < 48 ? -1 : 0) });   // papéis
  P.box(54, 6, 6, 7, '#f0f0ee'); P.px(55, 6, '#6a4428'); P.px(56, 6, '#5a3a1e'); P.px(57, 6, '#6a4428'); // caneca
}, { tag: 'computador', tall: 16 });
OD('balcao', 1, 1, (P, o) => {
  const col = o.cor || '#d9d2c2';
  P.block(0, 6, 32, 26, 9, col, { fpat: (x, y) => (y === 26 ? -1 : 0) });
  if (o.vidro) { P.box(1, -6, 30, 12, '#bfe2ee', { pat: (x, y) => (x - y === 6 || x - y === 7 || x - y === 16 ? 2 : 0) }); P.hline(1, -6, 30, STEEL); P.box(12, 3, 8, 2, '#8d969f'); }
});
OD('impressora', 1, 1, (P) => {
  P.block(2, 6, 28, 24, 12, '#c9cfd4');
  P.box(5, 2, 22, 7, '#fbfbf6', { pat: (x, y) => (y === 3 ? -1 : 0) });  // papel
  P.box(6, 21, 20, 3, '#5d656e');
  P.px(24, 10, '#5af08a'); P.px(25, 10, '#5af08a'); P.box(6, 9, 10, 2, '#3a3d44');
}, { tag: 'impressora' });
function counter(P, col = '#d9d2c2') { P.block(0, 12, 32, 20, 10, col); }
OD('cafeteira', 1, 1, (P) => {
  counter(P);
  P.box(7, -4, 18, 22, '#2b2b33', { pat: (x, y) => (x === 8 ? 1 : 0) });
  P.box(9, -2, 14, 5, '#c0392b');
  P.box(11, 7, 10, 9, '#cfe7f2', { pat: (x, y) => (y > 10 ? -2 : 0) }); P.box(12, 12, 8, 4, '#5a3a1e', { edge: false });
  P.box(25, 12, 5, 5, '#f4f4f0'); P.box(2, 13, 4, 5, '#f4f4f0');
}, { tag: 'cafe', tall: 16 });
OD('garrafa', 1, 1, (P) => {
  counter(P);
  P.box(10, -2, 12, 20, '#c0392b', { pat: (x, y) => (x === 11 ? 1 : 0) });
  P.box(10, -4, 12, 4, '#e6e8ea'); P.box(20, 4, 4, 7, '#2b2b33');
  P.box(24, 13, 5, 5, '#f4f4f0'); P.box(3, 13, 5, 5, '#f4f4f0');
}, { tag: 'garrafa', tall: 16 });
OD('bebedouro', 1, 1, (P) => {
  P.block(6, 10, 20, 21, 4, '#e6eaed');
  P.ell(16, 4, 8, 8, '#7cc4f0', { pat: (x, y) => (x < 13 && y < 3 ? 2 : 0) });
  P.box(10, 16, 12, 4, '#9aa3ab'); P.px(12, 17, '#3a7bd5'); P.px(19, 17, '#d13b3b');
}, { tag: 'garrafa', tall: 16 });
OD('armario', 1, 1, (P, o) => {
  const col = o.cor || '#cfd6dc';
  P.block(1, -12, 30, 43, 5, col, { fpat: (x, y) => (x === 16 ? -2 : x === 17 ? 1 : y === 29 ? -1 : 0) });
  P.box(12, 8, 2, 6, '#5d656e'); P.box(19, 8, 2, 6, '#5d656e');
  P.hline(3, -5, 26, RAMP(col).d1);
}, { tag: 'estoque', busca: true, tall: 18 });
OD('monitor', 1, 1, (P) => {
  P.box(14, 20, 4, 9, STEEL_D); P.box(7, 28, 18, 3, '#6c747c');
  P.box(2, 0, 28, 22, '#dfe4e8');
  P.box(4, 2, 24, 17, '#0c1712', { edge: false });
}, { anim: 'monitor', screen: [4, 2, 24, 17], tall: 14 });
OD('ventilador', 1, 1, (P) => {
  P.block(3, 10, 26, 20, 6, '#d6dadd');
  P.box(5, -4, 22, 16, '#c9cfd4'); P.box(7, -2, 18, 11, '#0c1218', { edge: false });
  P.box(25, 14, 4, 12, '#9fd0e8'); P.box(3, 14, 3, 12, '#9fd0e8');
  wheels(P, [[4, 28], [25, 28]]);
}, { anim: 'vent', screen: [7, -2, 18, 11], tall: 16 });
OD('carrinho_emerg', 1, 1, (P) => {
  P.block(2, 4, 28, 26, 7, '#c62f2f', { fpat: (x, y) => ((y === 16 || y === 22) ? -2 : (y === 17 || y === 23) ? 1 : 0) });
  P.box(6, -3, 20, 9, '#e8ebee'); P.box(9, -1, 9, 5, '#14201a', { edge: false }); P.px(11, 1, '#5af08a'); P.px(13, 0, '#5af08a'); P.box(20, 0, 3, 3, '#ffd84a');
  for (const y of [13, 19, 25]) P.box(13, y, 6, 1, '#f4f4f0');
  wheels(P, [[3, 29], [26, 29]]);
}, { busca: true, tall: 14 });
OD('suporte_soro', 1, 1, (P) => {
  P.box(15, -20, 2, 46, STEEL); P.box(9, -21, 14, 2, STEEL);
  P.box(8, -18, 7, 11, '#e6f4fb', { pat: (x, y) => (y > -12 ? -1 : 0) }); P.box(10, -12, 3, 3, '#cfe7f2', { edge: false });
  P.vline(11, -7, 12, '#cfe7f2');
  P.box(8, 26, 16, 2, '#7c868f'); wheels(P, [[7, 27], [22, 27]]);
}, { solid: false, tall: 26 });
OD('cortina', 1, 1, (P, o) => {
  const col = o.cor || '#7cc694';
  P.box(0, -12, 32, 2, STEEL); for (let k = 2; k < 32; k += 5) P.px(k, -10, STEEL_D);
  const M = P.mask(); for (let y = -10; y < 28; y++) { const wv = y > 24 ? Math.round(Math.sin(y)) : 0; M.span(y, 2, 29 + wv); } for (let x = 2; x < 30; x++) if ((x - 2) % 5 === 2) M.px(x, 28);
  P.paint(M, col, { round: true, top: true, pat: (x, y) => { const f = (x - 2) % 5; return f === 0 ? -1 : f === 2 ? 1 : f === 4 ? -1 : 0; } });
}, { tall: 16 });
OD('planta', 1, 1, (P, o) => {
  P.block(8, 18, 16, 13, 4, '#b5683a', { fpat: (x, y) => (y === 26 ? -1 : 0) });
  const G = RAMP('#3f9a4f');
  const leaves = [[16, 8, 8, 7], [9, 12, 6, 5], [23, 12, 6, 5], [12, 3, 5, 6], [21, 2, 5, 6], [16, -2, 4, 6]];
  for (const [x, y, rx, ry] of leaves) P.ell(x, y, rx, ry, G, { pat: (xx, yy) => (yy < y - ry / 2 && xx < x ? 1 : (xx === x ? -1 : 0)) });
}, { tall: 16 });
OD('pia', 1, 1, (P) => {
  P.box(10, -10, 12, 9, '#cfe0ea', { pat: (x, y) => (x - y === 18 ? 2 : 0) }); // espelho
  P.box(23, -6, 5, 8, '#e8ebee'); P.px(25, -4, '#7cc4f0');                       // saboneteira
  P.block(3, 3, 26, 18, 12, '#f4f6f7');
  P.ell(16, 9, 9, 4, '#cfd8de', { lv: -1, edge: false });
  P.box(15, 0, 3, 5, STEEL); P.box(13, 0, 7, 2, STEEL);
  P.box(13, 21, 6, 9, '#e2e6e9');
}, { tag: 'pia', tall: 14 });
OD('mesa_gineco', 1, 1, (P) => {
  P.box(14, 22, 4, 7, '#6c747c'); P.box(8, 28, 16, 3, '#555a63');
  P.block(6, 0, 20, 10, 4, '#d8c6b0');
  P.block(6, 9, 20, 13, 8, '#e3d4c1');
  P.box(9, 9, 14, 4, '#fbfbf7', { edge: false });
  P.box(1, 20, 6, 3, STEEL); P.box(25, 20, 6, 3, STEEL); P.box(2, 23, 3, 4, STEEL_D); P.box(27, 23, 3, 4, STEEL_D);
});
OD('ultrassom', 1, 1, (P) => {
  P.block(5, 12, 22, 18, 7, '#e8ebee');
  P.box(7, -8, 18, 14, '#dfe4e8'); P.box(9, -6, 14, 10, '#101214', { edge: false });
  P.box(7, 12, 18, 5, '#c9cfd4', { pat: (x, y) => ((x + y) % 3 === 0 ? -1 : 0) });
  P.box(25, 14, 4, 6, '#3b6fb4'); P.box(3, 15, 3, 5, '#e8e8e8');
  wheels(P, [[6, 28], [24, 28]]);
}, { tag: 'usg', busca: true, anim: 'usg', screen: [9, -6, 14, 10], tall: 14 });
OD('mesa_cirurgica', 1, 2, (P) => {
  P.box(12, 26, 8, 22, '#3d434a'); P.box(6, 46, 20, 10, '#3d434a');
  P.block(3, 3, 26, 48, 44, '#e9edf0');
  P.box(4, 4, 24, 42, '#2f6fd6', { pat: (x, y) => ((y - 4) % 14 === 0 ? -1 : 0) });
  P.box(6, 4, 20, 7, '#f7f9fa');
  P.box(0, 20, 4, 14, '#c9cfd4'); P.box(28, 20, 4, 14, '#c9cfd4');
});
OD('foco', 1, 1, (P) => {
  P.box(15, -26, 2, 18, '#dfe4e8'); P.box(4, -10, 24, 2, '#dfe4e8');
  for (const [x, y] of [[8, -6], [24, -3]]) { P.ell(x, y, 7, 6, '#eef1f3'); P.ell(x, y, 4, 3, '#fff3b0', { edge: false }); P.ell(x - 1, y - 1, 1.6, 1.2, '#ffffff', { edge: false, shade: false }); }
}, { solid: false, over: true, tall: 30, glow: true });
OD('anestesia', 1, 1, (P) => {
  P.block(2, 8, 28, 22, 6, '#dfe4e8');
  P.box(4, -8, 24, 18, '#cfd5da'); P.box(6, -6, 20, 10, '#0c1218', { edge: false });
  P.box(5, 9, 5, 16, '#3f9a4f'); P.box(11, 9, 5, 16, '#2f6fd6'); P.box(18, 12, 4, 4, '#e9c13b'); P.box(23, 12, 4, 4, '#9b7fd1');
  wheels(P, [[3, 28], [26, 28]]);
}, { anim: 'anest', screen: [6, -6, 20, 10], tall: 14 });
OD('mesa_instrum', 1, 1, (P) => {
  P.box(4, 22, 2, 8, STEEL_D); P.box(26, 22, 2, 8, STEEL_D);
  P.block(1, 4, 30, 20, 16, '#c9d0d6');
  P.box(3, 5, 26, 14, '#3f8f74', { edge: false, pat: (x, y) => (y === 5 ? 1 : 0) });
  P.box(6, 8, 10, 2, '#e6eaed'); P.box(6, 12, 14, 1, '#e6eaed'); P.box(20, 8, 2, 7, '#e6eaed'); P.box(23, 9, 4, 4, '#dfe4e8'); P.px(24, 10, '#9aa3ab');
}, { busca: true });
OD('aspirador', 1, 1, (P) => {
  P.box(14, 18, 4, 10, STEEL_D); P.box(8, 27, 16, 3, '#555a63');
  P.box(5, 2, 9, 16, '#d8eef7', { pat: (x, y) => (y > 10 ? -2 : x === 6 ? 2 : 0) }); P.box(18, 2, 9, 16, '#d8eef7', { pat: (x, y) => (y > 12 ? -2 : x === 19 ? 2 : 0) });
  P.box(5, 0, 9, 3, '#3b6fb4'); P.box(18, 0, 9, 3, '#3b6fb4');
}, { tall: 12 });
OD('balanca', 1, 1, (P) => {
  P.block(3, 10, 26, 16, 10, '#f2f4f5');
  P.box(5, 11, 22, 8, '#d7eef8', { edge: false });
  P.box(9, 1, 14, 9, '#e8ebee'); P.box(11, 3, 10, 4, '#1c2a22', { edge: false }); P.px(13, 4, '#5af08a'); P.px(15, 4, '#5af08a'); P.px(17, 4, '#5af08a');
}, { solid: false });
OD('brinquedos', 1, 1, (P) => {
  P.block(3, 12, 26, 18, 6, '#f2b84a', { fpat: (x, y) => ((x - 3) % 9 === 0 ? -1 : 0) });
  P.ell(9, 8, 5, 5, '#e05a5a', { pat: (x, y) => (x === 9 ? 2 : 0) });                    // bola
  P.block(16, 3, 9, 10, 3, '#3a7bd5'); P.block(20, 7, 8, 8, 3, '#3fa66b');              // blocos
  P.ell(13, 3, 3, 3, '#a0622d'); P.ell(11, 0, 1.5, 1.5, '#a0622d'); P.ell(15, 0, 1.5, 1.5, '#a0622d'); // ursinho
}, { busca: true, tall: 14 });
OD('tapete', 2, 2, (P) => {
  const cols = ['#f2c84a', '#7fc7d9', '#e88aa8', '#8fd18f'];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) P.box(2 + i * 15, 2 + j * 15, 15, 15, cols[(i + j) % 4], { edge: false, top: false, rim: false, pat: (x, y) => ((x - 2) % 15 === 7 && (y - 2) % 15 > 4 && (y - 2) % 15 < 11 ? -2 : 0) });
}, { solid: false, under: true, tall: 4 });
OD('lixeira', 1, 1, (P, o) => {
  const col = o.cor || '#3a7bd5';
  P.block(8, 8, 16, 21, 4, col, { fpat: (x, y) => ((x - 8) % 4 === 0 ? -1 : 0) });
  P.block(7, 5, 18, 5, 3, RAMP(col).d1);
  P.box(13, 29, 6, 2, '#555a63');
});
OD('estante_bar', 1, 1, (P) => {
  P.block(0, -12, 32, 44, 4, '#5a3a24', { fpat: (x, y) => ((y + 12) % 12 === 0 ? -2 : (y + 12) % 12 === 1 ? 1 : 0) });
  const cols = ['#3f9a4f', '#c0392b', '#e9c13b', '#6fb6ff', '#8a5a2b', '#efe6c8'];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) { const x = 2 + k * 5, y = -6 + r * 12; P.box(x, y + 1, 4, 9, cols[(k + r * 2) % 6], { pat: (xx, yy) => (xx === x ? 2 : 0) }); P.box(x + 1, y - 1, 2, 2, cols[(k + r * 2) % 6]); }
}, { tall: 18 });
OD('geladeira', 1, 1, (P, o) => {
  if (o.vacina) { // câmara de vacinas: branca, porta de vidro, termômetro digital
    P.block(1, -12, 30, 43, 4, '#eef1f4');
    P.box(3, -9, 26, 5, '#1d2a3a', { edge: false }); P.text('2-8C', 6, -9, '#5af08a');
    P.box(4, -2, 24, 28, '#cfe9f5', { pat: (x, y) => (x - y === 2 || x - y === 3 ? 2 : 0) });
    for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) P.box(6 + k * 4, 1 + r * 8, 3, 5, ['#3a7bd5', '#e9c13b', '#f4f4f0', '#3fa66b', '#e88aa8'][(k + r) % 5], { edge: false });
    return;
  }
  P.block(1, -12, 30, 43, 4, '#c62f2f');
  P.box(3, -6, 26, 4, '#ffffff', { edge: false }); P.text('GELADA', 4, -6, '#c62f2f');
  P.box(4, 0, 24, 26, '#bfe7f5', { pat: (x, y) => (x - y === 2 || x - y === 3 ? 2 : 0) });
  const cols = ['#e9c13b', '#3f9a4f', '#e05050', '#6b3e1f', '#f4f4f0'];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 5; k++) P.box(6 + k * 4, 3 + r * 8, 3, 6, cols[(k + r) % 5], { edge: false });
}, { tag: 'geladeira', tall: 18 });
OD('balcao_bar', 1, 1, (P) => {
  P.block(0, 4, 32, 28, 9, '#7a4628', { topCol: '#9a5c34', fpat: (x, y) => (x % 16 === 0 ? -2 : x % 16 === 1 ? 1 : (y === 20 ? -1 : 0)), tpat: (x, y) => ((x * 3 + y) % 11 === 0 ? -1 : 0) });
});
OD('banqueta', 1, 1, (P) => {
  P.box(15, 14, 2, 13, '#9aa3ab'); P.ell(16, 28, 6, 2, '#7c868f');
  P.ell(16, 12, 7, 5, '#c0392b', { pat: (x, y) => (y < 10 && x < 15 ? 1 : 0) });
}, { solid: false });
OD('mesa_plastico', 1, 1, (P, o) => {
  const col = o.cor || '#e9c13b';
  P.box(4, 22, 2, 8, RAMP(col).d1); P.box(26, 22, 2, 8, RAMP(col).d1);
  P.block(1, 3, 30, 22, 16, col, { tpat: (x, y) => (x === 2 || y === 4 ? 1 : 0) });
  if (o.bar) { P.box(7, 2, 5, 13, '#7a4b1e', { pat: (x, y) => (x === 7 ? 2 : 0) }); P.box(8, 0, 3, 3, '#7a4b1e'); P.box(7, 7, 5, 4, '#e9e4c8', { edge: false }); P.box(15, 7, 4, 6, '#f4e7a8'); P.box(21, 7, 4, 6, '#f4e7a8'); } // garrafa e copos americanos
  else { P.box(6, 6, 6, 7, '#f4f4f0'); P.px(7, 6, '#5a3a1e'); P.px(8, 6, '#6a4428'); P.px(9, 6, '#5a3a1e'); P.px(10, 6, '#5a3a1e'); P.box(13, 4, 4, 9, '#3f9a4f', { pat: (x, y) => (x === 13 ? 2 : 0) }); P.box(13, 7, 4, 3, '#e9c13b', { edge: false }); } // café e guaraná
  P.ell(20, 16, 6, 3, '#ffffff'); P.px(18, 15, '#d68a3a'); P.px(20, 16, '#d68a3a'); P.px(22, 15, '#c4783a');  // porção
}, { tall: 14 });
OD('sinuca', 2, 1, (P) => {
  P.box(6, 22, 4, 9, '#4a2e1c'); P.box(54, 22, 4, 9, '#4a2e1c');
  P.block(0, 1, 64, 24, 20, '#6b3e24');
  P.box(4, 4, 56, 15, '#2f8a4a', { edge: false, pat: (x, y) => ((x * 5 + y * 3) % 17 === 0 ? -1 : 0) });
  for (const [x, y] of [[3, 3], [31, 3], [59, 3], [3, 17], [31, 17], [59, 17]]) P.box(x, y, 3, 3, '#14100c');
  P.ell(16, 11, 2, 2, '#ffffff'); P.ell(40, 9, 2, 2, '#e05050'); P.ell(44, 12, 2, 2, '#e9c13b'); P.ell(46, 8, 2, 2, '#3a7bd5');
  P.box(18, 13, 24, 1, '#d9b98a');
}, { tall: 6 });
OD('banco_concreto', 2, 1, (P) => {
  P.box(6, 20, 6, 10, '#a49d8d'); P.box(52, 20, 6, 10, '#a49d8d');
  P.block(1, 8, 62, 14, 8, '#cbc4b4', { tpat: (x, y) => (hsh(x, y, 5) < 0.08 ? -1 : 0) });
});
OD('poste', 1, 1, (P) => {
  P.box(14, -40, 4, 66, '#7c868f', { pat: (x, y) => (x === 14 ? 1 : 0) }); P.box(11, 24, 10, 6, '#5a6470');
  P.box(16, -42, 12, 3, '#9aa3ab'); P.box(22, -40, 8, 3, '#ffe68a');
}, { over: true, tall: 46 });
OD('arvore', 1, 1, (P, o) => {
  const h = hsh(o.x, o.y, 9), ipe = h > 0.72 ? '#f2c230' : h > 0.6 ? '#e88ab8' : null;
  P.box(13, 4, 7, 26, '#6b4a2a', { pat: (x, y) => (x === 14 ? 1 : (y % 7 === 0 ? -1 : 0)) }); P.box(10, 28, 13, 3, '#5a3e22');
  const G = RAMP(ipe || '#3f8f3f');
  const blobs = [[16, -6, 15, 12], [6, -2, 9, 8], [26, -2, 9, 8], [11, -15, 9, 8], [22, -15, 9, 8], [16, 3, 10, 6]];
  for (const [x, y, rx, ry] of blobs) P.ell(x, y, rx, ry, G, { pat: (xx, yy) => { const hh = hsh(xx, yy, 2); if (yy < y - ry * 0.3 && xx < x) return hh < 0.5 ? 1 : 2; if (hh < 0.12) return -1; return 0; } });
}, { over: true, tall: 32, vary: o => o.x * 7 + o.y });
OD('arvore_seca', 1, 1, (P) => {
  const M = P.mask(); M.limb([[16, 30], [16, 10], [15, -14]], 4); M.line(15, 0, 6, -12, 2).line(16, -6, 26, -18, 2).line(15, -14, 10, -24, 2).line(16, 6, 24, -2, 2);
  P.paint(M, '#5a4632', { round: true });
}, { over: true, tall: 30 });
OD('grade', 1, 1, (P) => {
  P.hline(0, 8, 32, '#8f969e'); P.hline(0, 24, 32, '#8f969e');
  for (let i = 0; i < 4; i++) P.box(2 + i * 8, 6, 3, 22, '#9aa3ab', { pat: (x, y) => (y === 6 ? 2 : 0) });
});
OD('ponto_onibus', 2, 1, (P) => {
  P.box(4, -18, 3, 46, '#7c868f'); P.box(57, -18, 3, 46, '#7c868f');
  P.box(9, -14, 46, 24, '#cfe7f2', { pat: (x, y) => (x - y === 10 || x - y === 30 ? 2 : 0) });
  P.block(1, -24, 62, 8, 4, '#3a7bd5');
  P.block(10, 12, 44, 8, 4, '#c9c2b2');
  P.box(38, -12, 20, 11, '#f2c84a'); P.text('BUS', 39, -10, '#1b1622');
}, { over: true, tall: 30 });
OD('cantina', 1, 1, (P) => {
  P.block(0, 6, 32, 26, 6, '#3fa66b', { topCol: '#e8eef2', fpat: (x, y) => (y === 24 ? 1 : y === 25 ? -1 : 0) });
  P.box(1, -6, 30, 13, '#cdeaf3', { pat: (x, y) => (x - y === 6 ? 2 : 0) });
  for (let k = 0; k < 4; k++) { P.ell(6 + k * 7, 2, 2.5, 3, k % 2 ? '#f0c46a' : '#d68a3a'); }
  P.box(3, 8, 6, 3, '#ffffff', { edge: false }); P.px(4, 9, '#d13b3b'); P.px(6, 9, '#d13b3b');
}, { tag: 'cantina', tall: 10 });
OD('armario_vest', 1, 1, (P, o) => {
  P.block(1, -12, 30, 43, 4, '#5b8fb9', { fpat: (x, y) => (x === 16 ? -2 : (y === -6 || y === -4 || y === -2) && (x % 16 > 4 && x % 16 < 12) ? -2 : 0) });
  P.box(5, 4, 3, 5, '#2b4f73'); P.box(21, 4, 3, 5, '#2b4f73');
  P.box(9, 12, 4, 3, '#f4f4f0', { edge: false }); P.box(24, 12, 4, 3, '#f4f4f0', { edge: false });
}, { busca: true, tall: 18 });
OD('banco_madeira', 2, 1, (P) => {
  P.box(6, 18, 4, 11, '#6b4a2a'); P.box(54, 18, 4, 11, '#6b4a2a');
  P.block(1, 8, 62, 12, 7, '#a77a4a', { tpat: (x, y) => (y === 11 ? -1 : 0) });
}, { solid: false });
OD('placa', 1, 1, (P, o) => {
  P.box(15, -4, 3, 34, '#7c868f');
  const tw = text57W(o.texto || ''); const bw = Math.max(40, tw + 10);
  P.box(16 - bw / 2, -20, bw, 18, o.bg || '#2f5fa8', { round: false });
  P.text(o.texto || '', 16 - tw / 2, -15, o.fg || '#ffffff');
}, { over: true, tall: 26, side: 60 });
OD('pilar', 1, 1, (P) => {
  P.box(3, -24, 26, 54, '#a8d98c', { pat: (x, y) => (x < 8 ? 1 : x > 23 ? -1 : 0) });
  P.box(1, -26, 30, 4, '#cfe8bf'); P.box(1, 28, 30, 3, '#7aa868');
}, { over: true, tall: 30 });
OD('estante', 1, 1, (P) => {
  P.block(0, -12, 32, 43, 4, '#8a6a4a', { fpat: (x, y) => ((y + 12) % 13 === 0 ? -2 : (y + 12) % 13 === 1 ? 1 : 0) });
  const cols = ['#3a7bd5', '#e05a5a', '#f2c84a', '#3fa66b', '#9b7fd1', '#efe6c8'];
  for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) { const x = 2 + k * 4, y = -7 + r * 13; const hh = 9 - ((k * 3 + r) % 3); P.box(x, y + (10 - hh), 3, hh, cols[(k + r * 2) % 6], { edge: false, pat: (xx, yy) => (yy === y + (10 - hh) + 2 ? 2 : 0) }); }
}, { busca: true, tall: 18 });
OD('mesa_cabeceira', 1, 1, (P) => {
  P.block(5, 6, 22, 24, 7, '#d6dadf', { fpat: (x, y) => (y === 19 ? -2 : (y === 16 && x > 13 && x < 19) ? -2 : 0) });
  P.box(8, 1, 5, 7, '#cfeaf5', { pat: (x, y) => (y > 4 ? -1 : 0) }); P.box(17, 3, 5, 4, '#ffffff'); P.px(18, 4, '#e05a5a'); P.px(20, 4, '#3a7bd5');
}, { busca: true, tall: 8 });
OD('micro', 1, 1, (P) => {
  counter(P);
  P.block(3, -2, 26, 18, 4, '#e8ebee');
  P.box(5, 3, 15, 10, '#2b2b33', { pat: (x, y) => (x - y === 5 ? 1 : 0) }); P.box(22, 4, 5, 3, '#14201a'); P.px(23, 5, '#5af08a'); P.px(24, 5, '#5af08a');
}, { tall: 10 });
OD('mesa_simples', 2, 1, (P, o) => {
  const col = o.cor || '#e8e4dc';
  P.box(4, 20, 3, 10, RAMP(col).d1); P.box(57, 20, 3, 10, RAMP(col).d1);
  P.block(1, 4, 62, 18, 14, col);
  if (o.papeis) { P.box(10, 6, 12, 10, '#fbfbf6', { pat: (x, y) => (y % 2 === 0 && x > 11 && x < 20 ? -1 : 0) }); P.box(36, 7, 12, 8, '#f6d65a'); P.box(38, 5, 12, 8, '#e9eef2'); }
});

/* =====================================================================
   DECALQUES EM 2× (murais, placas, fachadas) — coordenadas já em px de 32
   ===================================================================== */
function RR(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function bevelBox(c, x, y, w, h, col) { const r = PAL.ramp(col); const H = PAL.hex; RR(c, x, y, w, h, H(r.b)); RR(c, x, y, w, 1, H(r.l1)); RR(c, x, y, 1, h, H(r.l1)); RR(c, x, y + h - 1, w, 1, H(r.d2)); RR(c, x + w - 1, y, 1, h, H(r.d1)); }
function pixCircle(c, cx, cy, r, col) { c.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y + r * 0.6)); c.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } }
function pixEll(c, cx, cy, rx, ry, col) { c.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); c.fillRect(Math.round(cx - w), Math.round(cy + y), w * 2 + 1, 1); } }
function pixLine(c, x0, y0, x1, y1, col, w = 1) { c.fillStyle = col; const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1; for (let k = 0; k <= n; k++) c.fillRect(Math.round(x0 + (x1 - x0) * k / n - (w - 1) / 2), Math.round(y0 + (y1 - y0) * k / n - (w - 1) / 2), w, w); }
const DECALS = {
  placa(c, x, y, w, h, o) {
    const bg = o.bg || '#2f5fa8'; bevelBox(c, x, y, w, h, bg);
    const tw = text57W(o.texto); const fy = y + Math.floor((h - 7) / 2);
    text57(c, o.texto, x + Math.floor((w - tw) / 2) + 1, fy + 1, PAL.hex(PAL.ramp(bg).d2));
    text57(c, o.texto, x + Math.floor((w - tw) / 2), fy, o.fg || '#ffffff');
  },
  letras(c, x, y, w, h, o) { const s = o.s || 2; const tw = text57W(o.texto, s); const tx = x + Math.floor((w - tw) / 2), ty = y + Math.floor((h - 7 * s) / 2); text57(c, o.texto, tx + 2, ty + 2, 'rgba(0,0,0,0.18)', s); text57(c, o.texto, tx, ty, o.fg || '#1f3f9a', s); },
  saida(c, x, y) { bevelBox(c, x, y, 30, 14, '#1d8a4a'); text57(c, 'SAIDA', x + 1, y + 4, '#ffffff'); },
  relogio(c, x, y) { pixCircle(c, x + 12, y + 12, 11, '#2b2b33'); pixCircle(c, x + 12, y + 12, 9, '#f7f7f2'); pixCircle(c, x + 10, y + 10, 4, '#ffffff'); for (let k = 0; k < 12; k++) RR(c, x + 12 + Math.round(Math.cos(k * Math.PI / 6) * 7.5), y + 12 + Math.round(Math.sin(k * Math.PI / 6) * 7.5), 1, 1, '#555'); pixLine(c, x + 12, y + 12, x + 12, y + 5, '#1b1622', 2); pixLine(c, x + 12, y + 12, x + 17, y + 12, '#1b1622', 2); RR(c, x + 12, y + 12, 1, 6, '#d13b3b'); },
  gases(c, x, y, w) {
    bevelBox(c, x, y, w, 18, '#eef0f1');
    const cols = ['#3f9a4f', '#e8e8e8', '#e9c13b', '#3a7bd5'];
    for (let k = 0; k < Math.floor(w / 12); k++) { const gx = x + 4 + k * 12; pixCircle(c, gx + 3, y + 7, 3, PAL.hex(PAL.ramp(cols[k % 4]).d1)); pixCircle(c, gx + 3, y + 7, 2, cols[k % 4]); RR(c, gx + 2, y + 6, 1, 1, '#ffffff'); RR(c, gx + 2, y + 11, 3, 4, '#7c868f'); }
  },
  tv(c, x, y, w, h, o) {
    bevelBox(c, x, y, w, h, '#1d1d24'); const sx = x + 3, sy = y + 3, sw = w - 6, sh = h - 6;
    if (o.triagem) { const cols = ['#d13b3b', '#e57a2e', '#e9c13b', '#3fa66b', '#3a7bd5']; RR(c, sx, sy, sw, sh, '#0d1220'); for (let k = 0; k < 5; k++) { RR(c, sx + 2, sy + 2 + k * Math.floor((sh - 4) / 5), sw - 4, Math.floor((sh - 4) / 5) - 1, cols[k]); RR(c, sx + 3, sy + 3 + k * Math.floor((sh - 4) / 5), 6, 1, 'rgba(255,255,255,0.6)'); } return; }
    const g = c.createLinearGradient(0, sy, 0, sy + sh); g.addColorStop(0, o.cor || '#2f5fa8'); g.addColorStop(1, PAL.hex(PAL.ramp(o.cor || '#2f5fa8').d2)); c.fillStyle = g; c.fillRect(sx, sy, sw, sh);
    RR(c, sx + 4, sy + 4, sw - 18, 4, '#ffffff'); RR(c, sx + 4, sy + 11, sw - 10, sh - 15, '#3fa66b'); RR(c, sx + 8, sy + 14, 6, 6, '#ffffff'); RR(c, sx + 18, sy + 15, sw - 26, 2, '#e8f0fa'); RR(c, sx + 18, sy + 19, sw - 30, 2, '#e8f0fa');
    for (let k = 0; k < 6; k++) RR(c, sx + sw - 8 - k, sy + k, 1, 1, 'rgba(255,255,255,0.35)');
  },
  quadro(c, x, y, w, h) {
    bevelBox(c, x, y, w, h, '#8a6a4a'); RR(c, x + 3, y + 3, w - 6, h - 6, '#d9c4a0');
    for (let k = 0; k < 40; k++) RR(c, x + 3 + hsh(k, 1) * (w - 6), y + 3 + hsh(1, k) * (h - 6), 1, 1, '#c4ab84');
    const cols = ['#fff59a', '#ffb3c6', '#a8e6ff', '#c8f2a8'];
    for (let k = 0; k < Math.floor((w - 8) / 14); k++) { const px = x + 5 + k * 14, py = y + 5 + (k % 2) * 7; RR(c, px + 1, py + 1, 11, 11, 'rgba(0,0,0,0.15)'); RR(c, px, py, 11, 11, cols[k % 4]); RR(c, px + 2, py + 3, 7, 1, '#9a8a6a'); RR(c, px + 2, py + 6, 5, 1, '#9a8a6a'); RR(c, px + 5, py - 1, 2, 2, '#d13b3b'); }
  },
  elevador(c, x, y, w, h) {
    bevelBox(c, x, y, w, h, '#b9c2ca'); const dw = w / 2 - 6;
    for (const dx of [x + 4, x + w / 2 + 2]) { bevelBox(c, dx, y + 6, dw, h - 6, '#d9dee2'); for (let k = 0; k < 4; k++) RR(c, dx + 3 + k, y + 8 + k * 3, 1, 8, 'rgba(255,255,255,0.5)'); }
    RR(c, x + 4, y + 20, w - 8, 14, '#f2c84a'); for (let k = 0; k < w - 8; k += 8) { c.fillStyle = '#1b1622'; for (let q = 0; q < 4; q++) c.fillRect(x + 4 + k + q, y + 20 + q * 3, 3, 3); }
    RR(c, x + 6, y + 23, w - 12, 9, '#f2c84a'); text57(c, 'MANUTENCAO', x + Math.floor((w - text57W('MANUTENCAO')) / 2), y + 24, '#1b1622');
  },
  logo(c, x, y, w, h) { const r = Math.min(w, h) / 2; pixCircle(c, x + w / 2, y + h / 2, r, '#1f3f9a'); pixCircle(c, x + w / 2, y + h / 2, r - 3, '#ffffff'); RR(c, x + w / 2 - 3, y + h / 2 - r + 7, 6, 2 * r - 14, '#d13b3b'); RR(c, x + w / 2 - r + 7, y + h / 2 - 3, 2 * r - 14, 6, '#d13b3b'); RR(c, x + w / 2 - 2, y + h / 2 - r + 8, 1, 2 * r - 16, '#ff7a7a'); },
  cardapio(c, x, y, w, h) {
    bevelBox(c, x, y, w, h, '#1b1622'); RR(c, x + 2, y + 2, w - 4, h - 4, '#262a24');
    text57(c, 'CARDAPIO', x + 5, y + 3, '#f2c84a');
    const nomes = { coxinha: 'COXINHA', pao_queijo: 'PAO QJ', empada: 'EMPADA', enroladinho: 'ENROLAD', cafe: 'CAFE' };
    ['coxinha', 'pao_queijo', 'empada', 'enroladinho', 'cafe'].forEach((id, k) => { const yy = y + 13 + k * 9; text57(c, nomes[id], x + 5, yy, '#ffffff'); const p = String(ITEMS[id] ? ITEMS[id].preco : ''); text57(c, p, x + w - 6 - text57W(p), yy, '#9fe0a0'); });
  },
  janela_cidade(c, x, y, w, h) {
    bevelBox(c, x, y, w, h, '#2b2b33');
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#5f9fe0'); g.addColorStop(1, '#bfe0f5'); c.fillStyle = g; c.fillRect(x + 3, y + 3, w - 6, h - 6);
    for (let k = 0; k < (w - 6) / 10; k++) { const bh = 10 + (k * 7) % 22; const bx = x + 3 + k * 10; RR(c, bx, y + h - 3 - bh, 9, bh, k % 2 ? '#e8ebee' : '#c9d0d6'); for (let q = 0; q < bh - 4; q += 4) { RR(c, bx + 2, y + h - bh + q, 2, 2, hsh(k, q) > 0.6 ? '#ffe68a' : '#8fa3b5'); RR(c, bx + 6, y + h - bh + q, 2, 2, hsh(q, k) > 0.6 ? '#ffe68a' : '#8fa3b5'); } }
    for (let k = 1; k < 4; k++) RR(c, x + Math.floor(k * w / 4), y, 2, h, '#2b2b33');
  },
  painel_madeira(c, x, y, w, h) { RR(c, x, y, w, h, '#7a5234'); for (let k = 0; k < w; k += 6) { RR(c, x + k, y, 1, h, '#5a3a24'); RR(c, x + k + 1, y, 1, h, '#946642'); } for (let k = 0; k < 30; k++) RR(c, x + hsh(k, 4) * w, y + hsh(4, k) * h, 1, 3, '#6a4428'); },
  neon(c, x, y, w, h, o) {
    bevelBox(c, x, y, w, h, '#1b1622');
    const tw = text57W(o.texto); const tx = x + Math.floor((w - tw) / 2);
    text57(c, o.texto, tx - 1, y + 5, 'rgba(255,90,160,0.35)'); text57(c, o.texto, tx + 1, y + 5, 'rgba(255,90,160,0.35)'); text57(c, o.texto, tx, y + 4, 'rgba(255,90,160,0.35)'); text57(c, o.texto, tx, y + 5, '#ffb3d6');
    if (o.sub) { const sw = text57W(o.sub); text57(c, o.sub, x + Math.floor((w - sw) / 2), y + 18, '#5af0ff'); }
  },
  mural_animais(c, x, y, w, h) {
    const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#a9d8ea'); g.addColorStop(1, '#d9f0f4'); c.fillStyle = g; c.fillRect(x, y, w, h);
    pixCircle(c, x + w * 0.42, y + 16, 12, '#f8d860'); pixCircle(c, x + w * 0.42, y + 16, 9, '#ffe98a');
    for (let k = 0; k < 3; k++) { pixEll(c, x + 20 + k * w / 3, y + 10, 12, 5, '#ffffff'); pixEll(c, x + 30 + k * w / 3, y + 8, 9, 5, '#ffffff'); }
    pixEll(c, x + w * 0.2, y + h, w * 0.3, 20, '#9cc583'); pixEll(c, x + w * 0.85, y + h, w * 0.25, 28, '#e2b59a'); pixEll(c, x + w * 0.55, y + h + 4, w * 0.2, 14, '#b8d68f');
    // palmeira
    const px = x + w * 0.12; for (let k = 0; k < h - 20; k++) RR(c, px + Math.sin(k / 8) * 2, y + 20 + k, 4, 1, k % 4 ? '#c98a5a' : '#a86a3a');
    for (let k = 0; k < 6; k++) { const a = -Math.PI + k * Math.PI / 5; pixLine(c, px + 2, y + 20, px + 2 + Math.cos(a) * 16, y + 20 + Math.sin(a) * 8 + 6, '#3f9a5f', 3); }
    // leão
    const lx = x + w * 0.7, ly = y + 22; pixCircle(c, lx, ly, 13, '#b8702c'); for (let k = 0; k < 12; k++) pixCircle(c, lx + Math.cos(k * 0.52) * 12, ly + Math.sin(k * 0.52) * 12, 3, '#9a5a22'); pixCircle(c, lx, ly + 1, 8, '#efb86a'); RR(c, lx - 4, ly - 1, 2, 2, '#1b1622'); RR(c, lx + 3, ly - 1, 2, 2, '#1b1622'); RR(c, lx - 1, ly + 3, 3, 2, '#7a3a2a'); RR(c, lx - 6, ly + 13, 12, 14, '#efb86a');
    // avestruz
    const ax = x + w * 0.3, ay = y + 30; pixEll(c, ax + 6, ay + 6, 10, 7, '#3a2a2a'); RR(c, ax + 1, ay + 6, 8, 3, '#f4f0ea'); RR(c, ax + 13, ay - 14, 3, 18, '#e8b0a8'); pixCircle(c, ax + 15, ay - 15, 3, '#3a2a2a'); RR(c, ax + 18, ay - 15, 3, 2, '#e8a050'); RR(c, ax + 3, ay + 12, 2, 10, '#e8a8a8'); RR(c, ax + 9, ay + 12, 2, 10, '#e8a8a8');
  },
  mural_criancas(c, x, y, w, h) {
    RR(c, x, y, w, h * 0.62, '#9fd8ef'); RR(c, x, y + h * 0.62, w, h * 0.38, '#6cc14a'); for (let k = 0; k < w; k += 3) RR(c, x + k, y + h * 0.62, 1, 2, '#58a83a');
    for (let k = 0; k < 3; k++) { pixEll(c, x + 16 + k * w / 3, y + 14, 9, 5, '#ffffff'); pixEll(c, x + 26 + k * w / 3, y + 12, 10, 6, '#ffffff'); }
    const cols = ['#e05050', '#f2c84a', '#3a7bd5', '#3fa66b', '#b46cff'];
    for (let k = 0; k < 4; k++) {
      const kx = x + 14 + k * (w - 28) / 3, ky = y + h * 0.58; const sk = SKIN_TONES[(k * 3) % 8];
      pixLine(c, kx + 9, ky - 10, kx + 9, ky - 30, '#666'); pixCircle(c, kx + 9, ky - 34, 6, cols[(k + 2) % 5]); RR(c, kx + 6, ky - 37, 2, 2, '#ffffff');
      pixCircle(c, kx + 4, ky - 8, 5, sk); RR(c, kx - 1, ky - 14, 11, 4, HAIR_COLORS[k % 5]); RR(c, kx + 2, ky - 9, 1, 1, '#1b1622'); RR(c, kx + 6, ky - 9, 1, 1, '#1b1622');
      RR(c, kx - 1, ky - 3, 10, 11, cols[k]); RR(c, kx, ky + 8, 2, 7, sk); RR(c, kx + 6, ky + 8, 2, 7, sk);
    }
    for (let k = 0; k < 5; k++) { c.strokeStyle = cols[k]; c.lineWidth = 3; c.beginPath(); c.arc(x + w * 0.62, y + h * 0.98, 28 - k * 4, Math.PI, 0); c.stroke(); }
  },
  mural_entrada_ped(c, x, y, w, h) {
    RR(c, x, y, w, h, '#f7f5ef'); const cols = ['#f2c84a', '#e88aa8', '#7fc7d9', '#b46cff', '#3fa66b', '#e57a2e'];
    for (let k = 0; k < 14; k++) pixCircle(c, x + hsh(k, 1) * w, y + hsh(1, k) * h * 0.55, 2 + Math.floor(hsh(k, k) * 5), cols[k % 6]);
    for (let k = 0; k < 5; k++) { const kx = x + 12 + k * (w - 24) / 4, ky = y + h - 26; const sk = SKIN_TONES[(k * 2 + 1) % 8]; pixCircle(c, kx + 6, ky + 5, 6, sk); RR(c, kx - 1, ky - 3, 14, 5, HAIR_COLORS[(k * 3) % 6]); RR(c, kx + 3, ky + 4, 2, 2, '#1b1622'); RR(c, kx + 8, ky + 4, 2, 2, '#1b1622'); RR(c, kx + 4, ky + 8, 4, 1, '#c0505a'); RR(c, kx, ky + 12, 12, 12, cols[k]); }
  },
  nuvem_rosto(c, x, y) { pixCircle(c, x + 16, y + 18, 11, '#ffffff'); pixCircle(c, x + 30, y + 13, 13, '#ffffff'); pixCircle(c, x + 42, y + 19, 10, '#ffffff'); RR(c, x + 6, y + 22, 46, 8, '#ffffff'); RR(c, x + 22, y + 17, 3, 3, '#1b1622'); RR(c, x + 34, y + 17, 3, 3, '#1b1622'); RR(c, x + 18, y + 22, 4, 2, '#f08b8b'); RR(c, x + 37, y + 22, 4, 2, '#f08b8b'); RR(c, x + 27, y + 23, 5, 2, '#c0505a'); for (let k = 0; k < 3; k++) RR(c, x + 18 + k * 10, y + 32, 2, 7, ['#7fc7d9', '#f2c84a', '#e88aa8'][k]); },
  mural_mae(c, x, y, w, h) {
    RR(c, x, y, w, h, '#fbf6ea');
    pixEll(c, x + w * 0.6, y + h * 0.42, w * 0.16, h * 0.28, '#efd9cc'); pixEll(c, x + w * 0.6, y + h * 0.42, w * 0.16 - 2, h * 0.28 - 2, '#f6e6dc');
    pixEll(c, x + w * 0.44, y + h * 0.58, w * 0.1, h * 0.16, '#efd9cc');
    c.strokeStyle = '#2b2b33'; c.lineWidth = 1; c.beginPath(); c.moveTo(x + w * 0.74, y + h * 0.18); c.quadraticCurveTo(x + w * 0.94, y + h * 0.6, x + w * 0.84, y + h); c.stroke();
    for (let k = 0; k < 7; k++) { pixCircle(c, x + w * 0.48 + k * 4, y + h * 0.14 - (k % 2) * 3, 2, '#c9a14a'); RR(c, x + w * 0.48 + k * 4, y + h * 0.14 - (k % 2) * 3, 1, 1, '#f2d27a'); }
    pixCircle(c, x + w * 0.15, y + h * 0.55, 8, '#9fd0e8'); for (let k = 0; k < 6; k++) pixLine(c, x + w * 0.15, y + h * 0.55, x + w * 0.15 + Math.cos(k * 1.05) * 11, y + h * 0.55 + Math.sin(k * 1.05) * 11, '#6a5a4a');
    RR(c, x + w * 0.15, y + h * 0.62, 1, h * 0.38, '#2b2b33');
  },
  mural_upa(c, x, y, w, h) {
    RR(c, x, y, w, h, '#f4f2ec'); pixCircle(c, x + w * 0.5, y + h * 0.58, h * 0.38, '#f2c84a');
    pixCircle(c, x + w * 0.45, y + h * 0.48, 8, '#d13b3b'); pixCircle(c, x + w * 0.55, y + h * 0.48, 8, '#d13b3b');
    c.fillStyle = '#d13b3b'; c.beginPath(); c.moveTo(x + w * 0.37, y + h * 0.52); c.lineTo(x + w * 0.5, y + h * 0.85); c.lineTo(x + w * 0.63, y + h * 0.52); c.fill();
    c.strokeStyle = '#1d8a4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, y + h * 0.62); c.lineTo(x + w * 0.3, y + h * 0.62); c.lineTo(x + w * 0.34, y + h * 0.32); c.lineTo(x + w * 0.38, y + h * 0.86); c.lineTo(x + w * 0.42, y + h * 0.62); c.lineTo(x + w - 4, y + h * 0.62); c.stroke();
    text57(c, 'CUIDAR 24H', x + 6, y + 4, '#3a7bd5');
  },
  fachada_upa(c, x, y, w, h) {
    RR(c, x, y, w, h, '#a9aba7'); for (let k = 0; k < w; k += 16) RR(c, x + k, y, 1, h, '#9a9c98');
    RR(c, x + w * 0.16, y, w * 0.07, h, '#c62f2f');
    RR(c, x + w * 0.23, y - 12, w * 0.47, h + 12, '#f1f0eb'); DECALS.mural_upa(c, x + w * 0.27, y - 8, w * 0.38, h - 4, {});
    RR(c, x + w * 0.7, y - 8, w * 0.3, h + 8, '#c62f2f'); for (let yy = 0; yy < h + 8; yy += 6) RR(c, x + w * 0.7, y - 8 + yy, w * 0.3, 1, '#a82424'); for (let xx = 0; xx < w * 0.3; xx += 6) RR(c, x + w * 0.7 + xx, y - 8, 1, h + 8, '#b02828');
    bevelBox(c, x + 2, y + 2, 68, 30, '#1d8a4a'); RR(c, x + 22, y + 4, 28, 11, '#f4f4f2'); text57(c, 'UPA', x + 27, y + 6, '#1d8a4a'); text57(c, '29 DE MAIO', x + 7, y + 19, '#ffffff');
  },
  porta(c, x, y, w, h, kind) {
    if (kind === 'vidro') { bevelBox(c, x, y + 26, w, h - 26, '#5a6470'); for (const dx of [x + 4, x + w / 2 + 2]) { RR(c, dx, y + 30, w / 2 - 6, h - 30, '#a8d4e6'); for (let k = 0; k < 10; k++) RR(c, dx + 3 + k, y + 32 + k, 2, 1, 'rgba(255,255,255,0.6)'); } RR(c, x + w / 2 - 1, y + 30, 2, h - 30, '#3a4048'); }
    else { bevelBox(c, x, y + 24, w, h - 24, '#3a2a20'); RR(c, x + 4, y + 28, w - 8, h - 28, '#1b1622'); RR(c, x + 8, y + 32, w - 16, 4, '#e0b866'); }
  },
};
for (const k of ['fachada_upa']) { const f = DECALS[k]; DECALS[k] = (c, x, y, w, h, o) => { f(c, x, y, w, h, o); if (o && o.door) { DECALS.porta(c, x + o.door[0], y, o.door[1], h, k === 'fachada_bar' ? 'bar' : 'vidro'); if (k === 'fachada_upa') { bevelBox(c, x + o.door[0] + 6, y + 34, 52, 12, '#1d8a4a'); text57(c, 'UPA', x + o.door[0] + 23, y + 36, '#ffffff'); } } }; }

/* ---------------- Rua: hospital alto, marquise, boteco e telhados ---------------- */
Object.assign(DECALS, {
  // Hospital Santa Esperança: alas com faixas de janelas azuis + torre central de vidro + térreo envidraçado
  fachada_hosp(c, x, y, w, h) {
    const H = PAL.hex, B = PAL.ramp('#2f62b8'), G = PAL.ramp('#6fa8dc'), Wt = PAL.ramp('#eef0ea');
    const tx0 = x + 320, tw = 256, wingTop = y + 64, ground = y + h - 64;
    // alas laterais
    for (const [wx, ww] of [[x, tx0 - x], [tx0 + tw, x + w - tx0 - tw]]) {
      RR(c, wx, wingTop, ww, ground - wingTop, H(Wt.b));
      RR(c, wx, wingTop, ww, 10, H(PAL.ramp('#d9dcd6').b)); RR(c, wx, wingTop, ww, 2, H(Wt.l2)); RR(c, wx, wingTop + 10, ww, 4, H(B.b)); // platibanda + faixa azul
      for (let f = 0; f < 4; f++) {
        const fy = wingTop + 18 + f * 44;
        RR(c, wx, fy, ww, 26, H(G.d1));                                                     // fita de janelas
        for (let k = 0; k < ww; k += 16) { RR(c, wx + k, fy, 2, 26, H(PAL.ramp('#dfe6ee').b)); RR(c, wx + k + 3, fy + 3, 9, 8, H(G.b)); RR(c, wx + k + 4, fy + 4, 3, 2, H(G.l2)); }
        RR(c, wx, fy + 26, ww, 3, H(B.b)); RR(c, wx, fy + 29, ww, 1, H(B.d2));             // peitoril azul
        if (hsh(f, wx, 3) > 0.4) for (let k = 0; k < 3; k++) RR(c, wx + 24 + Math.floor(hsh(k, f, wx) * (ww - 40)), fy + 12, 9, 12, '#ffe39a'); // luzes acesas
      }
      for (let k = 48; k < ww; k += 96) { RR(c, wx + k, wingTop + 14, 8, ground - wingTop - 14, H(Wt.l1)); RR(c, wx + k + 6, wingTop + 14, 2, ground - wingTop - 14, H(Wt.d1)); } // pilastras
    }
    // torre central de vidro azul
    RR(c, tx0, y, tw, ground - y, H(B.d1));
    for (let yy = y + 30; yy < ground; yy += 30) { RR(c, tx0, yy, tw, 4, H(Wt.b)); RR(c, tx0, yy + 4, tw, 1, H(Wt.d2)); }
    for (let k = 0; k < tw; k += 16) RR(c, tx0 + k, y + 30, 2, ground - y - 30, H(B.d2));
    for (let k = 0; k < 18; k++) { const sx = tx0 + 10 + k * 14; for (let q = 0; q < 6; q++) RR(c, sx + q, y + 40 + q * 2 + (k % 3) * 30, 1, 2, 'rgba(255,255,255,0.35)'); }
    RR(c, tx0 - 6, y, 6, ground - y, H(Wt.l1)); RR(c, tx0 + tw, y, 6, ground - y, H(Wt.d1));        // molduras brancas
    // coroamento com o nome
    RR(c, tx0 - 6, y, tw + 12, 30, H(Wt.b)); RR(c, tx0 - 6, y, tw + 12, 3, H(Wt.l2)); RR(c, tx0 - 6, y + 27, tw + 12, 3, H(B.b));
    const t1 = 'HOSPITAL', t2 = 'SANTA ESPERANCA';
    text57(c, t1, tx0 + tw / 2 - text57W(t1) / 2, y + 4, H(B.d1)); text57(c, t2, tx0 + tw / 2 - text57W(t2, 2) / 2 + 1, y + 13, H(B.d2), 2); text57(c, t2, tx0 + tw / 2 - text57W(t2, 2) / 2, y + 12, H(B.b), 2);
    DECALS.logo(c, tx0 + 8, y + 3, 24, 24); DECALS.logo(c, tx0 + tw - 32, y + 3, 24, 24);
    // térreo: pedra clara nas alas, vidro na entrada
    RR(c, x, ground, w, 64, H(PAL.ramp('#cfcfc6').b)); for (let k = 0; k < w; k += 32) RR(c, x + k, ground, 1, 64, H(PAL.ramp('#cfcfc6').d1)); RR(c, x, ground, w, 4, H(B.b));
    for (let k = 16; k < w; k += 64) { if (x + k > tx0 - 40 && x + k < tx0 + tw + 8) continue; bevelBox(c, x + k, ground + 14, 36, 34, '#3f6f99'); RR(c, x + k + 3, ground + 17, 30, 3, 'rgba(255,255,255,0.4)'); }
    RR(c, tx0 + 16, ground + 8, tw - 32, 56, H(PAL.ramp('#9fd0ec').d1));
    for (let k = 0; k < tw - 32; k += 32) { RR(c, tx0 + 16 + k, ground + 8, 3, 56, H(PAL.ramp('#dfe6ee').b)); for (let q = 0; q < 8; q++) RR(c, tx0 + 24 + k + q, ground + 14 + q * 2, 2, 1, 'rgba(255,255,255,0.45)'); }
    bevelBox(c, tx0 + tw / 2 - 40, ground + 8, 80, 12, '#2f62b8'); text57(c, 'ENTRADA', tx0 + tw / 2 - text57W('ENTRADA') / 2, ground + 10, '#ffffff');
    // canteiros na base
    for (const px of [tx0 - 56, tx0 + tw + 8]) { bevelBox(c, px, ground + 46, 48, 18, '#8f969e'); for (let k = 0; k < 6; k++) pixCircle(c, px + 6 + k * 7, ground + 44, 5, k % 2 ? '#3f8f3f' : '#58a858'); }
  },
  // fachada sul do boteco: toldo listrado, porta de aço aberta com o balcão aceso, vitrines com neon
  fachada_bar(c, x, y, w, h) {
    const H = PAL.hex, Y = PAL.ramp('#e9b44c');
    RR(c, x, y, w, h, H(Y.b)); for (let k = 0; k < w; k += 8) RR(c, x + k, y + 16, 1, h - 16, H(Y.d1));
    RR(c, x, y + h - 10, w, 10, H(PAL.ramp('#2f8a4a').b)); for (let k = 0; k < w; k += 10) RR(c, x + k + 2, y + h - 8, 6, 6, H(PAL.ramp('#2f8a4a').l1)); // rodapé de azulejo verde
    // toldo
    for (let k = 0; k < w; k += 16) { RR(c, x + k, y, 8, 14, '#c0392b'); RR(c, x + k + 8, y, 8, 14, '#f4f2ea'); pixCircle(c, x + k + 4, y + 14, 4, '#c0392b'); pixCircle(c, x + k + 12, y + 14, 4, '#f4f2ea'); }
    RR(c, x, y, w, 2, '#8e1f1f');
    // porta de aço enrolada (aberta) com interior iluminado
    const dx = x + 6 * 32 - 4, dw = 72;
    RR(c, dx, y + 18, dw, h - 18, '#3a2416'); RR(c, dx + 4, y + 22, dw - 8, h - 22, '#ffcf7a');
    RR(c, dx + 4, y + 22, dw - 8, 5, '#9aa3ab'); for (let k = 0; k < dw - 8; k += 3) RR(c, dx + 4 + k, y + 22, 1, 5, '#6c747c');
    RR(c, dx + 8, y + 30, dw - 16, 6, '#8a5432'); for (let k = 0; k < 8; k++) RR(c, dx + 10 + k * 7, y + 28, 3, 6, ['#3f9a4f', '#c0392b', '#e9c13b', '#6fb6ff'][k % 4]);
    RR(c, dx + 8, y + 42, dw - 16, 4, '#6b3e24'); RR(c, dx + 18, y + 36, 6, 6, '#f4f4f0'); RR(c, dx + 46, y + 36, 8, 6, '#d68a3a');
    // vitrines com neon
    for (const vx of [x + 16, x + w - 100]) { bevelBox(c, vx, y + 20, 84, 32, '#2b2b33'); RR(c, vx + 3, y + 23, 78, 26, '#ffd9a0'); RR(c, vx + 3, y + 40, 78, 9, '#c98a4a'); }
    text57(c, 'CERVEJA', x + 16 + 42 - text57W('CERVEJA') / 2, y + 26, '#ff4a8a'); text57(c, 'GELADA', x + 16 + 42 - text57W('GELADA') / 2, y + 34, '#2fa8ff');
    text57(c, 'PASTEL', x + w - 100 + 42 - text57W('PASTEL') / 2, y + 26, '#ff8a1a'); text57(c, 'SINUCA', x + w - 100 + 42 - text57W('SINUCA') / 2, y + 34, '#2fd06a');
  },
  // letreiro grande no telhado
  letreiro_bar(c, x, y, w, h) {
    const H = PAL.hex;
    RR(c, x + 40, y + h - 16, 8, 16, '#4a4d52'); RR(c, x + w - 48, y + h - 16, 8, 16, '#4a4d52');               // pés
    bevelBox(c, x + 10, y + 4, w - 20, h - 22, '#8e1f1f'); RR(c, x + 16, y + 10, w - 32, h - 34, '#5a0f12');
    const t = 'BAR DO RODOLFO', s = 3, tw = text57W(t, s), tx = x + w / 2 - tw / 2, ty = y + 16;
    text57(c, t, tx + 3, ty + 3, '#2a0608', s); text57(c, t, tx, ty, '#ffd84a', s); text57(c, t, tx, ty, '#ffd84a', s);
    for (let k = 0; k < tw; k += 1) if (hsh(k, 7) > 0.85) RR(c, tx + k, ty, 1, 1, '#fff6c0');
    const sub = 'PASTEL - CERVEJA - SINUCA - DESDE 1987'; text57(c, sub, x + w / 2 - text57W(sub) / 2, ty + 26, '#ffffff');
    // caneca e coxinha nas pontas
    const mx = x + 26, my = y + 22; RR(c, mx, my, 14, 18, '#f2c84a'); RR(c, mx, my, 14, 5, '#ffffff'); RR(c, mx + 14, my + 5, 4, 9, '#f2c84a');
    const cx2 = x + w - 40; pixCircle(c, cx2, y + 34, 8, '#d68a3a'); RR(c, cx2 - 2, y + 22, 4, 6, '#d68a3a'); pixCircle(c, cx2 - 3, y + 31, 2, '#e8a85a');
  },
  heliponto(c, x, y, w, h) {
    const cx = x + w / 2, cy = y + h / 2 + 4, r = Math.min(w, h) / 2 - 6;
    pixCircle(c, cx, cy, r + 2, '#7c868f'); pixCircle(c, cx, cy, r, '#5a6470'); pixCircle(c, cx, cy, r - 6, '#f2c84a'); pixCircle(c, cx, cy, r - 9, '#5a6470');
    text57(c, 'H', cx - 9, cy - 13, '#ffffff', 4);
  },
  ar_cond(c, x, y, w) { for (let k = 0; k + 30 <= w; k += 40) { bevelBox(c, x + k, y + 4, 30, 22, '#c9cfd4'); pixCircle(c, x + k + 11, y + 15, 7, '#7c868f'); pixCircle(c, x + k + 11, y + 15, 2, '#3a3d46'); for (let q = 0; q < 4; q++) RR(c, x + k + 21, y + 8 + q * 4, 6, 2, '#9aa3ab'); } },
});
/* ---------------- UBS Maria das Dores ---------------- */
Object.assign(DECALS, {
  // prédio branco de dois andares, esquadrias azuis e janelas com grade; porta de vidro com marquise
  fachada_ubs(c, x, y, w, h, o) {
    const H = PAL.hex, Wt = PAL.ramp('#f2f3ef'), B = PAL.ramp('#2f6fc4'), Gy = PAL.ramp('#c9ced2');
    const top = y - 12;
    RR(c, x, top, w, h + 22, H(Wt.b)); for (let k = 0; k < w; k += 64) RR(c, x + k, top, 1, h + 22, H(Wt.d1));
    RR(c, x, top, w, 4, H(Wt.l2)); RR(c, x, top + 4, w, 3, H(B.b));                              // platibanda com friso azul
    const fl = y + 34; RR(c, x, fl, w, 5, H(B.b)); RR(c, x, fl + 5, w, 1, H(B.d2));                  // faixa azul entre os andares
    RR(c, x, y + h - 8, w, 8, H(Gy.b)); RR(c, x, y + h - 8, w, 1, H(Gy.l1));                         // embasamento
    const janela = (jx, jy, jw, jh) => {
      RR(c, jx - 2, jy - 2, jw + 4, jh + 4, H(B.b)); RR(c, jx - 2, jy - 2, jw + 4, 1, H(B.l1));
      const g = c.createLinearGradient(0, jy, 0, jy + jh); g.addColorStop(0, '#9ccbe8'); g.addColorStop(1, '#d6ecf6'); c.fillStyle = g; c.fillRect(jx, jy, jw, jh);
      for (let k = 0; k < 6; k++) RR(c, jx + 3 + k, jy + 2 + k, 2, 1, 'rgba(255,255,255,0.55)');
      for (let gx = jx + 4; gx < jx + jw; gx += 6) RR(c, gx, jy, 1, jh, H(B.d1));                  // grade
      RR(c, jx, jy + Math.floor(jh / 2), jw, 1, H(B.d1)); RR(c, jx - 3, jy + jh + 2, jw + 6, 2, H(Wt.d1));
    };
    const dx = x + (o.door ? o.door[0] : w / 2 - 32), dw = o.door ? o.door[1] : 64;
    for (let jx = x + 14; jx + 40 < x + w - 8; jx += 56) { if (jx + 44 > dx - 6 && jx < dx + dw + 6) continue; janela(jx, top + 14, 40, 20); } // andar de cima
    const qx = dx + dw + 20;
    for (let jx = x + 14; jx + 40 < x + w - 8; jx += 56) { if (jx + 44 > dx - 6 && jx < qx + 66) continue; janela(jx, fl + 14, 40, 22); }
    // porta de vidro com marquise azul e placa
    bevelBox(c, dx - 4, fl + 8, dw + 8, h - (fl - y) - 16, '#4a5d74');
    for (const px of [dx, dx + dw / 2 + 1]) { RR(c, px + 1, fl + 12, dw / 2 - 3, h - (fl - y) - 20, '#a8d4e6'); for (let k = 0; k < 9; k++) RR(c, px + 3 + k, fl + 14 + k, 2, 1, 'rgba(255,255,255,0.6)'); }
    RR(c, dx + dw / 2 - 1, fl + 12, 2, h - (fl - y) - 20, '#33404f');
    RR(c, dx - 14, fl + 2, dw + 28, 6, H(B.b)); RR(c, dx - 14, fl + 2, dw + 28, 1, H(B.l2)); RR(c, dx - 14, fl + 8, dw + 28, 2, 'rgba(20,30,50,0.35)');
    bevelBox(c, dx + dw / 2 - 16, fl - 12, 32, 12, '#ffffff'); text57(c, 'UBS', dx + dw / 2 - 8, fl - 10, H(B.b));
    // quadro de serviços ao lado da porta (como a placa azul da foto)
    if (qx + 60 < x + w) { bevelBox(c, qx, fl + 12, 60, 34, '#2f62b8'); text57(c, 'VACINA', qx + 4, fl + 15, '#ffffff'); text57(c, 'CONSULTA', qx + 4, fl + 24, '#ffffff'); text57(c, 'FARMACIA', qx + 4, fl + 33, '#ffffff'); RR(c, qx + 2, fl + 13, 2, 32, '#e9c13b'); }
  },
  // letreiro grande no telhado
  letreiro_ubs(c, x, y, w, h) {
    RR(c, x + 30, y + h - 14, 6, 14, '#4a4d52'); RR(c, x + w - 36, y + h - 14, 6, 14, '#4a4d52');
    bevelBox(c, x + 6, y + 2, w - 12, h - 16, '#2f62b8'); RR(c, x + 10, y + 6, w - 20, h - 24, '#2a58a6');
    RR(c, x + 10, y + h - 20, w - 20, 2, '#f2f3ef');
    const t = 'UBS MARIA DAS DORES', s = 2, tw = text57W(t, s), tx = x + w / 2 - tw / 2, ty = y + 8;
    text57(c, t, tx + 2, ty + 2, '#173a73', s); text57(c, t, tx, ty, '#ffffff', s);
    const sub = 'UNIDADE BASICA DE SAUDE'; text57(c, sub, x + w / 2 - text57W(sub) / 2, ty + 18, '#cfe0f5');
    // cruz e casinha nas pontas
    const cx = x + 22, cy = y + h / 2 - 6; RR(c, cx - 3, cy - 8, 6, 16, '#ffffff'); RR(c, cx - 8, cy - 3, 16, 6, '#ffffff');
    const hx = x + w - 30, hy = y + h / 2 - 2; c.fillStyle = '#ffffff'; c.beginPath(); c.moveTo(hx - 9, hy); c.lineTo(hx, hy - 9); c.lineTo(hx + 9, hy); c.fill(); RR(c, hx - 6, hy, 12, 8, '#ffffff'); RR(c, hx - 2, hy + 3, 4, 5, '#2a58a6');
  },
  // painel eletrônico de senhas da recepção
  painel_senha(c, x, y, w, h, o) {
    bevelBox(c, x, y, w, h, '#1b1d24'); RR(c, x + 3, y + 3, w - 6, h - 6, '#0b1a33');
    RR(c, x + 3, y + 3, w - 6, 9, '#2f62b8'); text57(c, 'SENHA', x + 6, y + 4, '#ffffff'); text57(c, 'LOCAL', x + w - 6 - text57W('LOCAL'), y + 4, '#ffffff');
    text57(c, o.senha || 'A0013', x + 6, y + 18, '#ffd84a', 2);
    const L = o.local || 'GUICHE 2'; text57(c, L, x + w - 6 - text57W(L), y + 22, '#9fe0ff');
    RR(c, x + 3, y + h - 12, w - 6, 9, '#13284a'); text57(c, 'ANTERIOR A0012', x + 6, y + h - 11, '#7f93b3');
    for (let k = 0; k < 6; k++) RR(c, x + w - 9 - k, y + 13 + k, 1, 1, 'rgba(255,255,255,0.3)');
  },
  // quadro branco da sala da equipe com um genograma desenhado
  quadro_genograma(c, x, y, w, h) {
    bevelBox(c, x, y, w, h, '#9aa3ab'); RR(c, x + 3, y + 3, w - 6, h - 6, '#fbfbf7');
    const ink = '#2f3a8a', red = '#c0392b';
    const sq = (px, py, xx) => { c.strokeStyle = ink; c.lineWidth = 1; c.strokeRect(px - 4.5, py - 4.5, 9, 9); if (xx) { pixLine(c, px - 4, py - 4, px + 4, py + 4, ink); pixLine(c, px + 4, py - 4, px - 4, py + 4, ink); } };
    const ci = (px, py, dup) => { c.strokeStyle = ink; c.lineWidth = 1; c.beginPath(); c.arc(px, py, 5, 0, 7); c.stroke(); if (dup) { c.strokeStyle = red; c.beginPath(); c.arc(px, py, 7.5, 0, 7); c.stroke(); } };
    const mx = x + w / 2;
    sq(mx - 26, y + 12, true); ci(mx - 6, y + 12); pixLine(c, mx - 26, y + 17, mx - 26, y + 20, ink); pixLine(c, mx - 26, y + 20, mx - 6, y + 20, ink); pixLine(c, mx - 6, y + 17, mx - 6, y + 20, ink);
    sq(mx + 14, y + 12); ci(mx + 32, y + 12); pixLine(c, mx + 14, y + 20, mx + 32, y + 20, ink);
    pixLine(c, mx - 16, y + 20, mx - 16, y + 26, ink); pixLine(c, mx + 23, y + 20, mx + 23, y + 26, ink);
    sq(mx - 16, y + 30); ci(mx + 23, y + 30); pixLine(c, mx - 16, y + 35, mx - 16, y + 38, ink); pixLine(c, mx - 16, y + 38, mx + 23, y + 38, ink); pixLine(c, mx + 23, y + 35, mx + 23, y + 38, ink);
    pixLine(c, mx + 2, y + 40, mx + 6, y + 36, red); pixLine(c, mx + 6, y + 40, mx + 10, y + 36, red);
    pixLine(c, mx + 3, y + 38, mx + 3, y + 42, ink); ci(mx + 3, y + 44, true);
    text57(c, 'FAMILIA SOUZA', x + 6, y + h - 10, '#7a8290');
  },
  // cartazes das campanhas
  cartaz_ubs(c, x, y, w, h, o) {
    const T = { vacina: ['#3fa66b', 'VACINE', 'SE!'], dengue: ['#e9c13b', 'DENGUE', '10 MIN'], hiperdia: ['#e05050', 'HIPER', 'DIA'], grupos: ['#9b7fd1', 'GRUPO', 'GESTANTE'] }[o.tipo] || ['#3a7bd5', 'SUS', ''];
    bevelBox(c, x, y, w, h, '#f7f5ee'); RR(c, x + 2, y + 2, w - 4, 12, T[0]);
    text57(c, T[1], x + Math.floor((w - text57W(T[1])) / 2), y + 4, '#ffffff');
    if (T[2]) text57(c, T[2], x + Math.floor((w - text57W(T[2])) / 2), y + 17, T[0]);
    if (o.tipo === 'vacina') { RR(c, x + w / 2 - 2, y + 28, 4, 14, '#9fd6ff'); RR(c, x + w / 2 - 1, y + 42, 2, 5, '#9aa3ab'); RR(c, x + w / 2 - 5, y + 26, 10, 2, '#3a7bd5'); }
    if (o.tipo === 'dengue') { pixCircle(c, x + w / 2, y + 36, 6, '#2b2b33'); for (let k = -1; k <= 1; k += 2) { pixLine(c, x + w / 2, y + 36, x + w / 2 + k * 10, y + 30, '#2b2b33'); pixLine(c, x + w / 2, y + 38, x + w / 2 + k * 10, y + 44, '#2b2b33'); } RR(c, x + w / 2 - 1, y + 33, 1, 1, '#ffffff'); }
    if (o.tipo === 'hiperdia') { pixCircle(c, x + w / 2 - 4, y + 34, 5, '#e05050'); pixCircle(c, x + w / 2 + 4, y + 34, 5, '#e05050'); c.fillStyle = '#e05050'; c.beginPath(); c.moveTo(x + w / 2 - 9, y + 36); c.lineTo(x + w / 2, y + 46); c.lineTo(x + w / 2 + 9, y + 36); c.fill(); }
    if (o.tipo === 'grupos') for (let k = 0; k < 3; k++) { pixCircle(c, x + 10 + k * (w - 20) / 2, y + 32, 4, SKIN_TONES[(k * 3 + 1) % 8]); RR(c, x + 6 + k * (w - 20) / 2, y + 37, 8, 8, ['#e88aa8', '#3a7bd5', '#3fa66b'][k]); }
  },
});
OD('marquise', 10, 2, (P) => {
  // laje vista de cima + testeira azul com o nome; os pilares descem até a calçada
  for (const px of [12, 300]) P.box(px, 18, 8, 44, '#e8ebee', { pat: (x, y) => (x === px ? 1 : 0) });
  P.box(0, -30, 320, 40, '#d9dee2', { pat: (x, y) => (y < -27 ? 1 : (x % 32 === 0 ? -1 : 0)) });
  P.box(0, 8, 320, 12, '#2f62b8', { pat: (x, y) => (y === 8 ? 1 : 0) });
  P.text('HOSPITAL SANTA ESPERANCA - ENTRADA', 160 - text57W('HOSPITAL SANTA ESPERANCA - ENTRADA') / 2, 11, '#ffffff');
}, { solid: false, over: true, tall: 40 });
OD('pilar_marquise', 1, 1, (P) => { P.box(12, 22, 8, 8, '#cfd5da'); }, { noShadow: true });
