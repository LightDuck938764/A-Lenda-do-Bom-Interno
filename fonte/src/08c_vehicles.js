/* =====================================================================
   VEÍCULOS — o perfil lateral é desenhado como polígono e "extrudado"
   para cima; a faixa extrudada vira teto, capô, porta-malas e para-brisa
   vistos em 3/4. Todos são desenhados virados para a direita e
   { vira: true } espelha (os textos são escritos depois, sem espelhar).
   ===================================================================== */
function polyIn(pts, x, y) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function vehRaster(P, V) {
  const W = V.W, y0 = V.y0, y1 = 32, H = y1 - y0, flip = !!V.flip;
  const m = new Uint8Array(W * H);
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) if (polyIn(V.prof, x + 0.5, y + 0.5)) m[(y - y0) * W + x] = 1;
  const inS = (x, y) => x >= 0 && x < W && y >= y0 && y < y1 && m[(y - y0) * W + x] === 1;
  const top = new Int16Array(W + 8).fill(99);
  for (let x = 0; x < W; x++) for (let y = y0; y < y1; y++) if (inS(x, y)) { top[x] = y; break; }
  const T = x => (x >= 0 && x < W ? top[x] : 99);
  const put = (x, y, c) => { if (c) P.px(flip ? W - 1 - x : x, y, c); };
  const X = { inS, T, W, D: V.D, put, flip };
  for (let y = y0 - V.D; y < y1; y++) for (let x = 0; x < W; x++) {
    if (inS(x, y)) continue;
    for (let d = 1; d <= V.D; d++) if (inS(x, y + d)) { put(x, y, V.topCol(x, y, d, X)); break; }
  }
  for (let y = y0; y < y1; y++) for (let x = 0; x < W; x++) if (inS(x, y)) put(x, y, V.sideCol(x, y, X));
  if (V.after) V.after(X);
  return X;
}
const VC = h => PAL.rgb(h);
const lvOf = R => [R.d3, R.d2, R.d1, R.b, R.l1, R.l2];
const lvc = (R, lv) => lvOf(R)[Math.max(0, Math.min(5, lv + 3))];
// vidro visto de cima / de lado: azul-acinzentado com reflexos diagonais do céu
const GLASS = ['#1f2a38', '#2e3d50', '#3f5369', '#5b7590', '#93b3cb', '#cfe2ee'].map(VC);
function glassTop(x, d, D) {
  const s = (x * 2 + d * 3) % 19;
  if (s < 2) return GLASS[5]; if (s < 4) return GLASS[4];
  return d <= D * 0.4 ? GLASS[3] : d < D - 1 ? GLASS[2] : GLASS[1];
}
function glassSide(x, y, yTop, yBot) {
  const s = (x - y * 2 + 400) % 23;
  if (s < 2) return GLASS[4]; if (s === 2) return GLASS[3];
  if (y - yTop < 2) return GLASS[3];
  if (yBot - y < 2) return GLASS[1];
  return GLASS[2];
}
// roda com pneu, aro de liga leve (5 raios), cubo e disco de freio
function vehWheel(X, cx, cy, r, rimC = '#c9d0d8') {
  const RIM = PAL.ramp(rimC, 'metal'), rr = r * 0.6;
  for (let y = Math.floor(cy - r - 1); y <= Math.ceil(cy + r); y++) for (let x = Math.floor(cx - r - 1); x <= Math.ceil(cx + r); x++) {
    const dx = x + 0.5 - cx, dy = y + 0.5 - cy, dd = Math.hypot(dx, dy);
    if (dd > r) continue;
    let c;
    if (dd > rr + 0.9) {
      c = VC('#2a2b31');
      if (dd > r - 1.2 && dx + dy < -2) c = VC('#4a4c56');           // brilho na banda de rodagem
      else if (dd < rr + 1.8) c = VC('#202127');                        // talão
      else if (Math.abs(dd - (r - 2.2)) < 0.5 && dy < 0) c = VC('#383a42'); // letras do pneu (sugestão)
    } else if (dd > rr - 0.2) c = dx + dy < 0 ? RIM.l1 : RIM.d1;       // borda do aro
    else if (dd < 1.4) c = dd < 0.8 ? RIM.l2 : VC('#6a717b');           // cubo
    else {
      const a = (Math.atan2(dy, dx) + Math.PI) / (Math.PI * 2);
      const sp = ((a * 5 + 0.08) % 1);
      if (sp < 0.42) c = dx + dy < 0 ? RIM.l2 : RIM.b;                   // raio
      else c = dd < rr - 1.6 ? VC('#59606a') : VC('#3c4048');           // disco de freio atrás
    }
    X.put(x, y, c);
  }
}
// sombra debaixo do carro (entre as rodas)
function vehUnder(X, x0, x1, yb, wheels, r) {
  const wa = Math.min(...wheels.map(w => w[0])), wb = Math.max(...wheels.map(w => w[0]));
  for (let y = yb; y < yb + 2; y++) for (let x = x0; x <= x1; x++) {
    if (y > yb && (x < wa || x > wb)) continue;
    if (wheels.some(([cx, cy]) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy) <= r)) continue;
    X.put(x, y, y === yb ? VC('#2a2733') : VC('#1c1a24'));
  }
}
function vehText(P, X, t, x, y, col) {
  const w = String(t).length * 6 - 1; const xs = X.flip ? X.W - x - w : x; P.text(t, xs, y, col);
}

/* ---------------- Carros de passeio (sedã e hatch) ---------------- */
function drawCar(P, o) {
  const hatch = o.modelo === 'hatch', R = PAL.ramp(o.cor || '#3a7bd5'), D = 10;
  const light = PAL.hsl(R.b)[2] > 0.75;   // carro claro: frisos mais escuros
  const S = hatch ? {
    prof: [[11, 27], [9, 25], [8, 18], [8, 11], [9, 5], [11, 0], [14, -4], [18, -5], [52, -5], [56, -4], [61, 0], [66, 4], [70, 7], [73, 8], [83, 9], [87, 10], [90, 12], [92, 15], [92, 24], [90, 27]],
    wh: [[24, 23], [77, 23]], gx0: 14, gx1: 68, bp: [44, 45], cp: [28, 29], seams: [30, 46, 69], handles: [36, 54], xF: 92, xR: 8,
    seats: [[36, 3], [53, 3]], mirror: 64, fuel: [14, 12], rearGlass: [9, 14], roof: [15, 54], wsh: [55, 72],
  } : {
    prof: [[5, 27], [2, 25], [1, 19], [2, 13], [4, 11], [18, 9], [23, 8], [28, 3], [33, -2], [38, -5], [56, -5], [60, -3], [66, 2], [71, 6], [75, 8], [86, 9], [91, 11], [94, 14], [95, 18], [95, 24], [93, 27]],
    wh: [[19, 23], [78, 23]], gx0: 25, gx1: 72, bp: [49, 50], cp: null, seams: [31, 51, 72], handles: [40, 60], xF: 95, xR: 1,
    seats: [[41, 3], [60, 3]], mirror: 68, fuel: [9, 12], rearGlass: [23, 37], roof: [38, 58], wsh: [59, 75],
  };
  const belt = 8, r = 7;
  const trim = light ? VC('#2b2e36') : VC('#1f2128');
  const chrome = VC('#e3e8ee');
  const P2 = (x, y) => S.wh.some(([cx, cy]) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < r + 1.4);
  const lip = (x, y) => S.wh.some(([cx, cy]) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < r + 2.4);
  const isGlass = (x, y, X) => y < belt && x >= S.gx0 && x <= S.gx1 && y - X.T(x) >= 2 && y - X.T(x - 2) >= 1 && y - X.T(x + 3) >= 1;
  vehRaster(P, {
    W: 96, y0: -8, D, flip: o.vira, prof: S.prof,
    topCol(x, y, d) {
      const near = d === 1, far = d === D;
      const inR = (a) => x >= a[0] && x <= a[1];
      if (inR(S.rearGlass) || inR(S.wsh)) {
        if (near) return R.l1; if (far) return R.d1;
        if (inR(S.wsh) && x >= S.wsh[1] - 1) return trim;                   // borda do capô / limpadores
        if (inR(S.wsh) && x === S.wsh[1] - 3 && d > 2 && d < D - 2) return VC('#15161c'); // palheta
        return glassTop(x, d, D);
      }
      if (inR(S.roof)) {
        if (!hatch && x >= S.roof[0] + 1 && x <= S.roof[0] + 2 && d >= 4 && d <= 6) return VC('#23252c'); // antena tubarão
        if (near) return R.l2; if (far) return R.b;
        return d === 2 ? R.l2 : R.l1;
      }
      // capô / tampa traseira
      if (near) return x > S.xF - 4 || x < S.xR + 4 ? R.l1 : R.l2;
      if (far) return R.d1;
      if (x > S.xF - 3) return R.b;                                          // curva do para-choque
      if (x >= S.wsh[1] + 2 && x <= S.xF - 6 && (d === 3 || d === D - 2)) return R.b;   // vincos do capô
      return R.l1;
    },
    sideCol(x, y, X) {
      if (P2(x, y)) return VC('#17151d');                                    // caixa de roda
      if (lip(x, y)) return y > 20 ? R.d2 : R.d1;
      // vidros e colunas
      if (y < belt) {
        if (isGlass(x, y, X)) {
          if ((x >= S.bp[0] && x <= S.bp[1]) || (S.cp && x >= S.cp[0] && x <= S.cp[1])) return trim;
          for (const [sx, sy] of S.seats) if (x >= sx && x <= sx + 3 && y >= sy - 1 && y <= sy + 3 && !(y === sy - 1 && (x === sx || x === sx + 3))) return VC('#1b222c'); // encostos de cabeça
          return glassSide(x, y, X.T(x) + 2, belt - 1);
        }
        if (y === X.T(x)) return R.l2;
        return x < S.gx0 + 2 && !hatch ? R.b : R.l1;                          // colunas/teto
      }
      if (y === belt) return x >= S.gx0 && x <= S.gx1 ? (hatch ? trim : chrome) : R.l2;
      const tt = y - X.T(x);
      // faróis
      if (x >= S.xF - 6 && y >= 11 && y <= 14) { if (x === S.xF - 6 || y === 14) return VC('#8d8a7a'); return y === 11 ? VC('#ffffff') : (x + y) % 3 === 0 ? VC('#fff9dc') : VC('#efe3ae'); }
      if (x >= S.xF - 4 && y === 15) return VC('#f5a33a');                  // pisca
      // lanternas
      if (hatch ? (x <= S.xR + 3 && y >= 5 && y <= 15 && !X.inS(x - 3, y)) : (x <= S.xR + 4 && y >= 11 && y <= 15)) return y === (hatch ? 5 : 11) ? VC('#ff8f7e') : (x + y) % 4 === 0 ? VC('#f05a4a') : VC('#c22f33');
      // para-choques
      if (y === 19 && (x >= S.xF - 9 || x <= S.xR + 7)) return R.d2;
      if (x >= S.xF - 5 && y >= 21 && y <= 24) return y === 21 ? VC('#3b3e46') : (x % 2 ? VC('#1c1d22') : VC('#2c2e35')); // grade inferior
      if (x <= S.xR + 2 && y === 21) return VC('#a52a2a');                  // refletor
      // portas, maçanetas, tampa do tanque
      if (S.seams.includes(x) && y > belt && y < 25) return R.d2;
      for (const h of S.handles) if (x >= h && x <= h + 3) { if (y === 12) return light ? VC('#cfd5dc') : R.l2; if (y === 13) return R.d2; }
      const [fx, fy] = S.fuel; if (x >= fx && x <= fx + 3 && y >= fy && y <= fy + 2 && (x === fx || x === fx + 3 || y === fy || y === fy + 2)) return R.d1;
      // carroceria: reflexo de céu em cima, vinco, reflexo de chão embaixo
      let lv;
      if (tt === 0) lv = 2; else if (y <= 13) lv = 1; else if (y === 14) lv = 2; else if (y === 15) lv = -1; else if (y <= 21) lv = 0; else if (y <= 24) lv = -1; else lv = -2;
      if (!X.inS(x + 1, y)) lv -= 1; else if (!X.inS(x - 1, y)) lv += y > 15 ? 0 : 1;
      return lvc(R, lv);
    },
    after(X) {
      vehUnder(X, S.xR + 3, S.xF - 3, 27, S.wh, r);
      for (const [cx, cy] of S.wh) vehWheel(X, cx, cy, r);
      // retrovisor (projeta-se para fora, sobre a janela)
      const mx = S.mirror;
      for (let y = 5; y <= 9; y++) for (let x = mx; x <= mx + 4; x++) {
        if ((y === 5 || y === 9) && (x === mx || x === mx + 4)) continue;
        X.put(x, y, y === 5 ? R.l2 : y === 9 ? R.d2 : x === mx ? trim : R.l1);
      }
      X.put(mx + 1, 7, trim);
    },
  });
}
OD('carro', 3, 1, drawCar, { tall: 22, side: 6, overTop: true });

/* ---------------- Ambulância (furgão de teto alto da UPA) ---------------- */
function drawAmbulancia(P, o) {
  const R = PAL.ramp('#f1f3f2'), RR = PAL.ramp('#d3302f'), D = 12;
  const prof = [[3, 26], [1, 24], [1, -24], [3, -27], [6, -28], [95, -28], [99, -27], [102, -24], [106, -17], [110, -8], [112, -5], [119, -3], [123, 0], [125, 4], [126, 9], [126, 23], [124, 26]];
  const wh = [[24, 22], [103, 22]], r = 8;
  const trim = VC('#25272e'), plast = PAL.ramp('#3c3f47');
  const well = (x, y) => wh.some(([cx, cy]) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < r + 1.4);
  const lip = (x, y) => wh.some(([cx, cy]) => Math.hypot(x + 0.5 - cx, y + 0.5 - cy) < r + 2.6);
  const X = vehRaster(P, {
    W: 128, y0: -30, D, flip: o.vira, prof,
    topCol(x, y, d) {
      const near = d === 1, far = d === D;
      if (x >= 100 && x <= 111) {                                           // para-brisa
        if (near) return R.l1; if (far) return R.b;
        if (x >= 110) return trim;
        if (x === 108 && d > 2 && d < D - 2) return VC('#15161c');
        return glassTop(x, d, D);
      }
      if (x > 111) { if (near) return R.l2; if (far) return R.d1; return d === 4 || d === 9 ? R.b : R.l1; }   // capô curto
      if (near) return R.d1; if (far) return R.d1;
      return x % 11 === 5 ? R.b : (x % 11 === 6 || d === 2 ? R.l2 : R.l1);  // calha + nervuras do teto
    },
    sideCol(x, y, X) {
      if (well(x, y)) return VC('#17151d');
      if (lip(x, y)) return y > 20 ? plast.d1 : plast.b;                    // para-lama plástico
      // janela da cabine
      if (x >= 90 && y >= -22 && y <= -7 && y - X.T(x + 3) >= 2) return x === 90 || y === -7 ? trim : glassSide(x, y, -22, -7);
      // janela fosca da porta corrediça
      if (x >= 62 && x <= 80 && y >= -22 && y <= -11) { if (x === 62 || x === 80 || y === -22 || y === -11) return trim; return (x - y) % 13 === 0 ? VC('#f4f8fb') : y < -19 ? VC('#dfe8ee') : VC('#c9d6df'); }
      // faróis, pisca, para-choque plástico
      if (x >= 119 && y >= 1 && y <= 6) { if (y === 6 || !X.inS(x - 2, y - 2)) return VC('#8d8a7a'); return y === 2 ? VC('#ffffff') : (x + y) % 3 ? VC('#efe3ae') : VC('#fff9dc'); }
      if (x >= 121 && (y === 7 || y === 8)) return VC('#f5a33a');
      if (x >= 112 && y >= 15) { if (y === 15) return plast.l1; if (x >= 121 && y >= 18 && y <= 20) return VC('#e9e4c8'); return y > 23 ? plast.d1 : plast.b; }
      // traseira: lanternas verticais e para-choque
      if (x <= 3 && y >= 3 && y <= 20) return y <= 10 ? (y === 3 ? VC('#ff8f7e') : VC('#c9302f')) : y <= 14 ? VC('#f2a03c') : VC('#eef2f4');
      if (x <= 4 && y >= -26 && y <= -22) return y === -26 ? VC('#ff8f7e') : VC('#c9302f');
      if (x <= 9 && y >= 21) return y === 21 ? plast.l1 : plast.b;
      // estribo da porta corrediça e saia lateral
      if (y >= 23) return x >= 58 && x <= 82 ? (y === 23 ? plast.l1 : plast.d1) : plast.b;
      // faixa vermelha (com filete) e filete superior
      if (y >= 3 && y <= 11) return y === 3 ? RR.l1 : y === 11 ? RR.d1 : (!X.inS(x + 1, y) ? RR.d1 : RR.b);
      if (y === 13) return RR.b;
      if (y === -24 && x > 5 && x < 97) return RR.b;
      // portas: corrediça, cabine; trilho da corrediça; maçanetas
      if ((x === 56 || x === 84 || x === 88) && y > -26 && y < 23) return R.d2;
      if (x === 111 && y > -5 && y < 12) return R.d2;
      if (y === -9 && x >= 18 && x < 56) return R.d2;
      if (y === -8 && x >= 18 && x < 56) return R.l2;
      if ((x >= 79 && x <= 82 && y === -9) || (x >= 91 && x <= 94 && y === -2)) return trim;
      if ((x >= 79 && x <= 82 && y === -8) || (x >= 91 && x <= 94 && y === -1)) return R.d1;
      // carroceria branca
      const tt = y - X.T(x);
      let lv = tt === 0 ? 1 : tt === 1 ? 0 : y > 17 ? -2 : -1;
      if (!X.inS(x + 1, y)) lv -= 1; else if (!X.inS(x - 1, y)) lv += 1;
      return lvc(R, lv);
    },
    after(X) {
      vehUnder(X, 4, 122, 26, wh, r);
      for (const [cx, cy] of wh) vehWheel(X, cx, cy, r, '#b9c1c9');
      // emblema: círculo com cruz
      const ex = 15, ey = -14;
      for (let y = ey - 8; y <= ey + 8; y++) for (let x = ex - 8; x <= ex + 8; x++) {
        const dd = Math.hypot(x + 0.5 - ex - 0.5, y + 0.5 - ey - 0.5); if (dd > 7.6) continue;
        const cross = (Math.abs(x - ex) <= 1 && Math.abs(y - ey) <= 5) || (Math.abs(y - ey) <= 1 && Math.abs(x - ex) <= 5);
        X.put(x, y, dd > 6.4 ? RR.b : cross ? (x - ex + y - ey < -2 ? RR.l1 : RR.b) : R.l2);
      }
      // retrovisor grande de furgão
      for (let y = -17; y <= -6; y++) for (let x = 112; x <= 115; x++) X.put(x, y, x === 112 || y === -17 ? VC('#4c515a') : y === -6 ? VC('#17181d') : VC('#2d3037'));
      X.put(110, -10, VC('#2d3037')); X.put(111, -10, VC('#2d3037'));
      // ar-condicionado no teto
      for (let y = -40; y <= -31; y++) for (let x = 30; x <= 52; x++) {
        const face = y >= -33;
        X.put(x, y, face ? (y === -33 ? VC('#c9ced3') : (x % 3 === 0 ? VC('#7d848c') : VC('#a3aab1'))) : (y === -40 || x === 52 ? VC('#b4bac0') : (x - 30) % 4 === 1 && y > -39 && y < -35 ? VC('#9aa1a8') : VC('#dde1e4')));
      }
      // giroflex (barra de luzes) sobre a cabine
      for (let y = -41; y <= -29; y++) for (let x = 78; x <= 96; x++) {
        const face = y >= -32, seg = x < 84 ? 0 : x <= 90 ? 1 : 2;
        let c;
        if (x === 78 || x === 96 || y === -41 || y === -29) c = VC('#2a2c33');
        else if (seg === 1) c = face ? VC('#dfe6ec') : VC('#f2f6f9');
        else c = face ? (y === -32 ? VC('#ff7a6e') : VC('#c42a2a')) : ((x + y) % 5 === 0 ? VC('#ffb3a8') : VC('#e04848'));
        if (face && (x === 84 || x === 90)) c = VC('#2a2c33');
        X.put(x, y, c);
      }
      // lanternas superiores traseiras no teto
      for (let y = -34; y <= -29; y++) for (let x = 2; x <= 6; x++) X.put(x, y, y === -34 || x === 6 ? VC('#7a1d1d') : y >= -31 ? VC('#c9302f') : VC('#ff7a6e'));
    },
  });
  vehText(P, X, 'AMBULANCIA', 7, 4, VC('#ffffff'));
  vehText(P, X, 'UPA 29 DE MAIO', 5, -5, RR.d1);
}
OD('ambulancia', 4, 1, drawAmbulancia, { tall: 46, side: 6, overTop: true, anim: 'giroflex', screen: [0, 0, 0, 0] });
