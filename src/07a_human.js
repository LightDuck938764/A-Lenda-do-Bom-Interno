/* =====================================================================
   PERSONAGENS EM PIXEL ART DE INSPIRAÇÃO 32 BITS — quadro de 48×64
   - Rampas de cor com matiz deslocado (sombras frias, luzes quentes)
   - Cada peça é uma máscara sombreada como material (luz de cima/esquerda)
   - Contorno interno entre peças sobrepostas e contorno seletivo colorido
   ===================================================================== */
const SW = 48, SH = 64;
const OUTLINE = '#1b1622';

/* ---------------- Cores ---------------- */
const PAL = (() => {
  const cache = new Map();
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  function rgb(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h.slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function hsl([r, g, b]) {
    r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
    if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
    return [h, s, l];
  }
  function fromHsl(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s = cl(s, 0, 1); l = cl(l, 0, 1);
    if (s === 0) { const v = Math.round(l * 255); return [v, v, v]; }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = t => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [Math.round(f(h + 1 / 3) * 255), Math.round(f(h) * 255), Math.round(f(h - 1 / 3) * 255)];
  }
  function towards(h, t, a) { const d = ((t - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), a); }
  function ramp(hex, kind = 'cloth') {
    const key = hex + '|' + kind; if (cache.has(key)) return cache.get(key);
    const base = rgb(hex); const [h, s, l] = hsl(base);
    let r;
    if (kind === 'skin') {
      // pele: sombras levemente mais quentes/avermelhadas, sem saturar demais
      const st = l < 0.35 ? 0.075 : 0.105;
      r = {
        d3: fromHsl(towards(h, 350, 14), cl(s * 0.75, 0, 0.6), Math.max(0.08, l * 0.42)),
        d2: fromHsl(towards(h, 0, 9), cl(s * 0.92, 0, 0.75), l - st * 2),
        d1: fromHsl(towards(h, 0, 5), cl(s * 0.97, 0, 0.8), l - st),
        b: base,
        l1: fromHsl(towards(h, 40, 4), s * 0.95, l + (l > 0.8 ? 0.04 : 0.07)),
        l2: fromHsl(towards(h, 45, 6), s * 0.8, l + (l > 0.8 ? 0.08 : 0.14)),
      };
    } else {
      const grey = s < 0.1, metal = kind === 'metal', hair = kind === 'hair';
      const hD = grey ? 228 : h, sD = grey ? (l > 0.75 ? 0.18 : 0.07) : s;
      const tD = 250, tL = 50;
      const st = l > 0.82 ? 0.09 : l < 0.2 ? 0.055 : l < 0.35 ? 0.09 : 0.12;
      let up = l < 0.2 ? 0.1 : l > 0.86 ? 0.045 : 0.085;
      if (hair && l < 0.25) up = 0.13; // cabelo escuro: brilho mais visível
      const sheen = hair && l < 0.25 && s < 0.32; // quase preto: reflexo frio azulado
      const hl = sheen ? 222 : tL;
      r = {
        d3: fromHsl(towards(hD, tD, 32), cl(sD * 0.85 + 0.1, 0, 0.75), Math.max(0.06, l * 0.3)),
        d2: fromHsl(towards(hD, tD, 20), sD + 0.06, l - st * 2),
        d1: fromHsl(towards(hD, tD, 11), sD + 0.04, l - st),
        b: base,
        l1: sheen ? fromHsl(222, 0.14, l + up) : fromHsl(grey ? h : towards(h, hl, 7), s - 0.03, l + up),
        l2: sheen ? fromHsl(218, 0.2, l + up * 2.1) : fromHsl(grey ? h : towards(h, hl, 14), s - (metal ? 0.2 : 0.08), l + up * 2.1),
      };
    }
    cache.set(key, r); return r;
  }
  function mix(a, b, t) { return [Math.round(a[0] + (b[0] - a[0]) * t), Math.round(a[1] + (b[1] - a[1]) * t), Math.round(a[2] + (b[2] - a[2]) * t)]; }
  function hex(c) { return '#' + c.map(v => v.toString(16).padStart(2, '0')).join(''); }
  return { ramp, rgb, hsl, fromHsl, mix, hex };
})();
const LVKEY = { '-3': 'd3', '-2': 'd2', '-1': 'd1', '0': 'b', '1': 'l1', '2': 'l2' };

/* ---------------- Raster ---------------- */
class PxFrame {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint8ClampedArray(w * h * 4); this.part = new Int16Array(w * h).fill(-1); this.pid = 0; }
  in(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h; }
  op(x, y) { return this.in(x, y) && this.d[(y * this.w + x) * 4 + 3] > 0; }
  get(x, y) { const i = (y * this.w + x) * 4; return [this.d[i], this.d[i + 1], this.d[i + 2]]; }
  set(x, y, c, pid = 0) { if (!this.in(x, y)) return; const i = (y * this.w + x) * 4; this.d[i] = c[0]; this.d[i + 1] = c[1]; this.d[i + 2] = c[2]; this.d[i + 3] = 255; this.part[y * this.w + x] = pid; }
  clear(x, y) { if (!this.in(x, y)) return; this.d[(y * this.w + x) * 4 + 3] = 0; this.part[y * this.w + x] = -1; }
}
class PxMask {
  constructor(w = SW, h = SH) { this.w = w; this.h = h; this.m = new Uint8Array(w * h); }
  has(x, y) { return x >= 0 && y >= 0 && x < this.w && y < this.h && this.m[y * this.w + x] > 0; }
  px(x, y, v = 1) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.m[y * this.w + x] = v; return this; }
  rect(x, y, w, h, v = 1) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.px(x + i, y + j, v); return this; }
  span(y, x0, x1, v = 1) { for (let x = Math.round(x0); x <= Math.round(x1); x++) this.px(x, y, v); return this; }
  ell(cx, cy, rx, ry, v = 1) {
    for (let y = Math.floor(cy - ry - 1); y <= Math.ceil(cy + ry + 1); y++) for (let x = Math.floor(cx - rx - 1); x <= Math.ceil(cx + rx + 1); x++) {
      const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry; if (dx * dx + dy * dy <= 1.0) this.px(x, y, v);
    }
    return this;
  }
  // traço espesso entre dois pontos (pincel quadrado)
  line(x0, y0, x1, y1, w = 1, v = 1) {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
    for (let k = 0; k <= n; k++) { const x = x0 + (x1 - x0) * k / n, y = y0 + (y1 - y0) * k / n; this.rect(Math.round(x - (w - 1) / 2), Math.round(y), w, 1, v); }
    return this;
  }
  // membro: centro varia linearmente por linhas entre pontos (x,y) de uma polilinha; largura w
  limb(pts, w, v = 1) {
    for (let s = 0; s < pts.length - 1; s++) {
      const [xa, ya] = pts[s], [xb, yb] = pts[s + 1];
      for (let y = Math.round(ya); y <= Math.round(yb); y++) { const t = yb === ya ? 0 : (y - ya) / (yb - ya); const xc = xa + (xb - xa) * t; const x0 = Math.round(xc - w / 2); this.rect(x0, y, w, 1, v); }
    }
    return this;
  }
  sub(o) { for (let i = 0; i < this.m.length; i++) if (o.m[i]) this.m[i] = 0; return this; }
  and(o) { for (let i = 0; i < this.m.length; i++) if (!o.m[i]) this.m[i] = 0; return this; }
  or(o) { for (let i = 0; i < this.m.length; i++) if (o.m[i]) this.m[i] = 1; return this; }
  clone() { const c = new PxMask(this.w, this.h); c.m.set(this.m); return c; }
  clipRows(y0, y1) { for (let y = 0; y < this.h; y++) if (y < y0 || y > y1) for (let x = 0; x < this.w; x++) this.m[y * this.w + x] = 0; return this; }
  clipCols(x0, x1) { for (let x = 0; x < this.w; x++) if (x < x0 || x > x1) for (let y = 0; y < this.h; y++) this.m[y * this.w + x] = 0; return this; }
  empty() { for (let i = 0; i < this.m.length; i++) if (this.m[i]) return false; return true; }
}
function hsh(x, y, s = 0) { let h = (x * 374761393 + y * 668265263 + s * 2246822519) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }

/* pinta uma máscara como material sombreado */
function paint(F, M, R, o = {}) {
  const pid = ++F.pid;
  const has = (x, y) => M.has(x, y);
  for (let y = 0; y < F.h; y++) for (let x = 0; x < F.w; x++) {
    if (!M.has(x, y)) continue;
    let lv = o.lv || 0;
    if (o.shade !== false) {
      const dR = !has(x + 1, y) ? 0 : !has(x + 2, y) ? 1 : 2;
      const dL = !has(x - 1, y) ? 0 : 2;
      const dT = !has(x, y - 1) ? 0 : 2;
      const dB = !has(x, y + 1) ? 0 : !has(x, y + 2) ? 1 : 2;
      if (dR === 0) lv -= o.hard ? 2 : 1; else if (dR === 1 && o.round) lv -= 1;
      if (dB === 0 && o.bottom !== false) lv -= 1; else if (dB === 1 && o.round && o.bottom !== false) lv -= 0;
      if (dL === 0 && o.rim !== false) lv += 1;
      if (dT === 0 && o.top) lv += 1;
    }
    if (o.pat) lv += o.pat(x, y) || 0;
    if (o.edge !== false) {
      let hit = false;
      for (const [nx, ny] of [[x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]]) if (!has(nx, ny) && F.op(nx, ny) && F.part[ny * F.w + nx] !== pid) { hit = true; break; }
      if (hit) lv = Math.min(lv, o.edgeLv ?? -2);
    }
    lv = Math.max(-3, Math.min(2, lv));
    const col = o.col ? o.col(x, y, lv) : R[LVKEY[lv]];
    if (col) F.set(x, y, col, pid);
  }
  return pid;
}
/* contorno seletivo: cada borda externa herda um tom escuro da cor vizinha */
function selOut(F) {
  const w = F.w, h = F.h, a = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) a[i] = F.d[i * 4 + 3] > 0 ? 1 : 0;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (a[y * w + x]) continue;
    let nb = null, lit = false;
    if (x + 1 < w && a[y * w + x + 1]) { nb = [x + 1, y]; lit = true; }
    else if (y + 1 < h && a[(y + 1) * w + x]) { nb = [x, y + 1]; lit = true; }
    else if (x > 0 && a[y * w + x - 1]) nb = [x - 1, y];
    else if (y > 0 && a[(y - 1) * w + x]) nb = [x, y - 1];
    if (!nb) continue;
    const c = F.get(nb[0], nb[1]);
    const k = lit ? 0.36 : 0.24;
    F.set(x, y, [Math.round(c[0] * k + 16), Math.round(c[1] * k * 0.9 + 10), Math.round(c[2] * k + 24)], -2);
  }
}

/* ---------------- Corpos ---------------- */
const BUILDS = {
  normal: { hw: 16, hh: 17, tw: 16, th: 15, hip: 14, lh: 13, aw: 4, belly: 0, sh: 3 },
  magro: { hw: 16, hh: 17, tw: 14, th: 15, hip: 12, lh: 14, aw: 3, belly: 0, sh: 3 },
  largo: { hw: 17, hh: 17, tw: 20, th: 15, hip: 17, lh: 12, aw: 4, belly: 2, sh: 3 },
  alto: { hw: 16, hh: 17, tw: 16, th: 16, hip: 14, lh: 16, aw: 4, belly: 0, sh: 3 },
  baixo: { hw: 17, hh: 16, tw: 21, th: 14, hip: 19, lh: 7, aw: 4, belly: 3, sh: 3 },
  grande: { hw: 18, hh: 18, tw: 23, th: 17, hip: 19, lh: 14, aw: 5, belly: 2, sh: 3 },
  crianca: { hw: 15, hh: 15, tw: 12, th: 10, hip: 11, lh: 7, aw: 3, belly: 1, sh: 2, kid: true },
  adolescente: { hw: 15, hh: 16, tw: 14, th: 13, hip: 12, lh: 11, aw: 3, belly: 0, sh: 3 },
};

function lookDefaults(l) {
  return Object.assign({ skin: SKIN_TONES[2], hair: 'curto', hairC: HAIR_COLORS[1], top: 'tshirt', topC: '#f2f2ee', bottomC: '#2b3a55', skirt: false, shoes: '#2a2a2a', pointy: false,
    coat: null, coatC: '#f4f6f7', coatTrim: null, tie: null, badge: false, glasses: null, horns: false, facial: null, eyes: 'normal', mouth: 'normal', build: 'normal',
    mask: false, cap: null, acc: null, steth: false, eyebags: false, blush: false, plague: false, dress: null, gown: null, scrub: null, beard: null, cheek: false,
    fem: false, old: false, eyeC: null, lashes: false, apron: null, makeup: false }, l || {});
}
function lookKey(l) { return JSON.stringify(l); }

/* ---------------- Desenho do personagem ---------------- */
function drawHumanPx(L, dir, frame, pose) {
  const F = new PxFrame(SW, SH);
  const B = BUILDS[L.build] || BUILDS.normal;
  const view = dir === 0 ? 'f' : dir === 1 ? 'b' : 's';
  const walking = pose === 'walk';
  const cx = 24, ground = 61;
  const bob = walking && (frame === 1 || frame === 3) ? -1 : 0;
  const breath = pose === 'idle' && frame === 1 ? 1 : 0;
  const crouch = pose === 'defeat' ? 2 : 0;
  const jump = pose === 'victory' && frame % 2 === 1 ? -2 : 0;
  const yUp = bob + breath + crouch + jump;
  const shoeTop = ground - B.sh + 1 + jump, ankle = shoeTop - 1;
  const legTop = ankle - B.lh + 1 + crouch;
  const tBot = legTop + 1 + yUp - crouch + crouch; // tronco se sobrepõe ao quadril
  const tTop = tBot - B.th + 1;
  const hy = tTop - B.hh - 1;
  const R = {
    skin: PAL.ramp(L.skin, 'skin'), hair: PAL.ramp(L.hairC, 'hair'),
    top: PAL.ramp(L.scrub || L.gown || L.topC), bot: PAL.ramp(L.scrub || L.bottomC), shoe: PAL.ramp(L.shoes, 'metal'),
    coat: PAL.ramp(L.plague ? '#2a2630' : (L.coatC || '#f4f6f7')), dress: PAL.ramp(L.dress || L.gown || L.topC),
  };
  const hasCoat = !!L.coat || L.plague;
  const ctx = { F, L, B, R, view, dir, frame, pose, walking, cx, ground, shoeTop, ankle, legTop, tBot, tTop, hy, hasCoat, yUp };
  if (view === 's') drawSide(ctx); else drawFrontBack(ctx);
  selOut(F);
  if (dir === 2) { // espelha para a esquerda
    const d = F.d, w = F.w;
    for (let y = 0; y < F.h; y++) for (let x = 0; x < w / 2; x++) { const a = (y * w + x) * 4, b = (y * w + (w - 1 - x)) * 4; for (let k = 0; k < 4; k++) { const t = d[a + k]; d[a + k] = d[b + k]; d[b + k] = t; } }
  }
  return F;
}

/* ===== utilidades de peças ===== */
function torsoMask(ctx, w, extraBot = 0) {
  const { B, cx, tTop, tBot } = ctx; const M = new PxMask();
  const tL = cx - Math.floor(w / 2), tR = tL + w - 1, th = tBot - tTop + 1;
  for (let y = tTop; y <= tBot + extraBot; y++) {
    const r = y - tTop; let ins = r === 0 ? 2 : r === 1 ? 1 : 0;
    let bul = B.belly ? Math.round(B.belly * Math.sin(Math.PI * Math.min(1, Math.max(0, (r - th * 0.3) / (th * 0.75))))) : 0;
    if (ctx.L.preg) bul += Math.round(2 * Math.sin(Math.PI * Math.min(1, Math.max(0, (r - th * 0.35) / (th * 0.7)))));
    if (!B.belly && !ctx.L.preg && !B.kid && r > th - 4) ins += 1;
    M.span(y, tL + ins - bul, tR - ins + bul);
  }
  return M;
}
function headMask(ctx, hx, hw, hh, fem) {
  const { hy } = ctx; const M = new PxMask();
  for (let r = 0; r < hh; r++) {
    let ins = r === 0 ? 4 : r === 1 ? 2 : r === 2 ? 1 : 0;
    if (r === hh - 4) ins = 1; if (r === hh - 3) ins = fem ? 2 : 1; if (r === hh - 2) ins = fem ? 3 : 2; if (r === hh - 1) ins = fem ? 5 : 4;
    M.span(hy + r, hx + ins, hx + hw - 1 - ins);
  }
  return M;
}
const C = c => PAL.rgb(c);

/* ===== FRENTE e COSTAS ===== */
function drawFrontBack(ctx) {
  const { F, L, B, R, view, frame, pose, walking, cx, ground, shoeTop, ankle, legTop, tBot, tTop, hy, hasCoat } = ctx;
  const back = view === 'b';
  const hw = B.hw, hh = B.hh, hx = cx - Math.floor(hw / 2);
  const tw = B.tw, tL = cx - Math.floor(tw / 2), tR = tL + tw - 1;
  const hipL = cx - Math.floor(B.hip / 2), hipR = hipL + B.hip - 1;
  const lift = walking ? (frame === 1 ? 'L' : frame === 3 ? 'R' : null) : null;
  const longDress = !!(L.dress || L.gown);
  const coatBot = L.plague ? ankle - 1 : legTop + Math.max(5, Math.round(B.lh * 0.5));

  // ---- cabelo de trás (atrás do corpo) ----
  const hairM = hairMasks(ctx, hx, hw, hh);
  if (hairM.back && !hairM.back.empty()) paint(F, hairM.back, R.hair, { lv: back ? 0 : -1, pat: hairPat(ctx, hx, hw), edge: false });

  // ---- pernas ----
  const gap = B.kid ? 1 : 2;
  const lw = Math.floor((B.hip - gap) / 2);
  const legs = [{ s: 'L', x0: hipL, x1: hipL + lw - 1 }, { s: 'R', x0: hipR - lw + 1, x1: hipR }];
  for (const lg of legs) {
    const up = lift === lg.s ? 2 : 0;
    const M = new PxMask();
    for (let y = legTop; y <= ankle - up; y++) {
      const nearAnkle = y > ankle - up - 4;
      const outerIn = nearAnkle ? 1 : 0;
      M.span(y, lg.x0 + (lg.s === 'L' ? outerIn : 0), lg.x1 - (lg.s === 'R' ? outerIn : 0));
    }
    if (longDress) { M.clipRows(legTop + Math.round(B.lh * 0.5), 99); paint(F, M, R.skin, { round: true }); }
    else if (L.skirt) { const M2 = M.clone().clipRows(legTop + Math.round(B.lh * 0.55), 99); paint(F, M2, R.skin, { round: true }); }
    else paint(F, M, R.bot, { round: true, pat: (x, y) => (x === (lg.s === 'L' ? lg.x0 + 1 : lg.x1 - 2) && y > legTop + 3 && y < ankle - 3 && !L.scrub ? -1 : 0) });
    // sapato
    const sy = shoeTop - up, sh = B.sh;
    const S = new PxMask(); const sx0 = lg.x0 - (lg.s === 'L' ? 1 : 0), sx1 = lg.x1 + (lg.s === 'R' ? 1 : 0);
    for (let r = 0; r < sh; r++) { const ins = r === 0 ? 1 : 0; S.span(sy + r, sx0 + ins, sx1 - ins); }
    if (L.pointy && !back) { if (lg.s === 'L') S.px(sx0 - 1, sy + sh - 1).px(sx0 - 2, sy + sh - 1); else S.px(sx1 + 1, sy + sh - 1).px(sx1 + 2, sy + sh - 1); }
    const white = PAL.hsl(R.shoe.b)[2] > 0.8;
    paint(F, S, R.shoe, { top: true, pat: (x, y) => {
      if (y === sy + sh - 1) return white ? -1 : (L.pointy ? -1 : 2); // sola
      if (L.pointy && y === sy && x === sx0 + 2) return 2; // brilho do couro
      if (!L.pointy && !back && y === sy && (x === Math.round((sx0 + sx1) / 2))) return white ? -1 : 1; // cadarço
      if (L.shoes === '#3b7bd8' && (x + y) % 3 === 0 && y < sy + sh - 1) return -2; // crocs
      return 0;
    } });
  }
  // ---- saia / vestido / camisola até o joelho ----
  if (L.skirt && !longDress) { const M = new PxMask(); const kb = legTop + Math.round(B.lh * 0.55); for (let y = legTop - 1; y <= kb; y++) { const t = (y - legTop + 1) / (kb - legTop + 2); M.span(y, hipL - 1 - Math.round(t * 2), hipR + 1 + Math.round(t * 2)); } paint(F, M, R.bot, { pat: (x, y) => ((x - cx) % 4 === 0 && y > legTop + 1 ? -1 : 0) }); }
  if (longDress) { const M = new PxMask(); const kb = legTop + Math.round(B.lh * 0.5); for (let y = tBot - 2; y <= kb; y++) { const t = (y - tBot + 2) / (kb - tBot + 3); M.span(y, hipL - 1 - Math.round(t * 2), hipR + 1 + Math.round(t * 2)); } paint(F, M, R.dress, { pat: (x, y) => (L.gown ? ((x * 3 + y * 5) % 7 === 0 ? -1 : 0) : ((x - cx + 1) % 5 === 0 && y > tBot + 1 ? -1 : 0)) }); }

  // ---- tronco ----
  const T = torsoMask(ctx, tw);
  const topR = longDress && L.dress ? R.dress : R.top;
  paint(F, T, topR, { round: true, top: true, pat: (x, y) => {
    if (L.preg && !back) { const r = y - tTop; const th = tBot - tTop; if (r > th * 0.45 && r < th * 0.8 && x > cx - 5 && x < cx - 1) return 1; }
    if (back) return (x === cx && y > tTop + 2 && L.top === 'social') ? -1 : 0;
    const r = y - tTop;
    if (L.gown) return (x * 3 + y * 5) % 7 === 0 ? -1 : 0;
    if (L.top === 'social' && !L.scrub && x === cx && r > 2) return (r % 4 === 1) ? 2 : -1; // botões
    if (L.top === 'hoodie' && !L.scrub) { if (r >= tBot - tTop - 4 && x > cx - 5 && x < cx + 4 && (y === tBot - 4 || x === cx - 5 || x === cx + 3)) return -1; }
    if (L.scrub && x >= cx + 2 && x <= cx + 5 && r === 6) return -1; // bolso do pijama
    if (r > tBot - tTop - 2) return -1; // barra
    return 0;
  } });
  // gola / decote
  if (!back) {
    const N = new PxMask();
    if (L.scrub || L.top === 'regata') { for (let r = 0; r < 4; r++) N.span(tTop + r, cx - 3 + r, cx + 2 - r); }
    else if (L.top === 'social' || L.tie) { N.span(tTop, cx - 2, cx + 1); }
    else if (L.top === 'hoodie') { }
    else { N.span(tTop, cx - 3, cx + 2); N.span(tTop + 1, cx - 2, cx + 1); }
    if (!N.empty()) paint(F, N, R.skin, { lv: -1, edge: false, shade: false });
    if (L.top === 'social' || L.tie) { // colarinho
      const W = C(L.tie && L.topC === '#ffffff' ? '#ffffff' : '#f6f6f2'); const CR = PAL.ramp(L.top === 'social' ? L.topC : '#f4f4f0');
      const K = new PxMask(); K.px(cx - 3, tTop).px(cx - 2, tTop + 1).px(cx - 3, tTop + 1).px(cx + 2, tTop).px(cx + 1, tTop + 1).px(cx + 2, tTop + 1);
      paint(F, K, CR, { lv: 1, shade: false, edge: false });
    }
    if (L.top === 'hoodie' && !L.scrub) { const K = new PxMask(); K.span(tTop - 1, cx - 4, cx + 3).span(tTop, cx - 5, cx - 3).span(tTop, cx + 2, cx + 4); paint(F, K, R.top, { lv: -1, edge: false }); F.set(cx - 2, tTop + 2, C('#f2f2ee')); F.set(cx - 2, tTop + 3, C('#f2f2ee')); F.set(cx + 1, tTop + 2, C('#f2f2ee')); F.set(cx + 1, tTop + 3, C('#f2f2ee')); }
  }
  // gravata
  if (L.tie && !back) {
    const TR = PAL.ramp(L.tie); const M = new PxMask();
    M.span(tTop, cx - 1, cx).span(tTop + 1, cx - 1, cx);
    for (let y = tTop + 2; y < tTop + B.th - 4; y++) M.span(y, cx - 1, cx + (y > tTop + 3 ? 1 : 0) - 1 + (y > tTop + 4 ? 1 : 0));
    M.px(cx - 1, tTop + B.th - 4).px(cx, tTop + B.th - 4);
    M.px(cx, tTop + B.th - 3);
    paint(F, M, TR, { edge: false, pat: (x, y) => (y === tTop ? 1 : (y - tTop) % 3 === 0 ? -1 : 0) });
  }
  // avental
  if (L.apron && !back) { const M = new PxMask(); M.rect(cx - 4, tTop + 3, 8, B.th - 3); for (let y = tBot; y <= legTop + Math.round(B.lh * 0.6); y++) M.span(y, cx - 5, cx + 4); paint(F, M, PAL.ramp(L.apron), { pat: (x, y) => (y === tBot - 2 && Math.abs(x - cx) < 4 ? -1 : 0) }); const S2 = new PxMask(); S2.px(cx - 4, tTop + 1).px(cx - 4, tTop + 2).px(cx + 3, tTop + 1).px(cx + 3, tTop + 2); paint(F, S2, PAL.ramp(L.apron), { lv: -1, edge: false, shade: false }); }

  if (L.abada) drawAbada(ctx, tL, tR, back);
  if (L.print && !hasCoat) drawPrint(ctx, tL, tR, back);
  // ---- jaleco ----
  if (hasCoat) drawCoatFB(ctx, coatBot, tL, tR, hipL, hipR, back);

  // ---- estetoscópio ----
  if (L.steth && !back) {
    const ST = PAL.ramp('#2d6fc9'); const M = new PxMask();
    M.limb([[cx - 4, tTop - 1], [cx - 5, tTop + 3], [cx - 4, tTop + 6]], 1).limb([[cx + 3, tTop - 1], [cx + 4, tTop + 3], [cx + 4, tTop + 5]], 1);
    paint(F, M, ST, { edge: false, shade: false });
    const D = new PxMask(); D.rect(cx - 5, tTop + 6, 3, 2); paint(F, D, PAL.ramp('#c9d0d6', 'metal'), { top: true });
    F.set(cx + 4, tTop + 6, C('#9aa3ab'));
  }

  // ---- braços ----
  drawArmsFB(ctx, tL, tR, back);

  // ---- cabeça ----
  if (L.plague) { drawPlagueHeadF(ctx, hx, hw, hh, back); return; }
  const fem = !!(L.fem || L.mouth === 'lips');
  const H = headMask(ctx, hx, hw, hh, fem);
  // pescoço
  const N = new PxMask(); N.rect(cx - 3, hy + hh - 2, 6, tTop - (hy + hh - 2) + 1); paint(F, N, R.skin, { lv: -1, edge: false });
  // orelhas
  const ey = hy + Math.round(hh * 0.52);
  const E = new PxMask(); E.rect(hx - 1, ey - 1, 2, 4).rect(hx + hw - 1, ey - 1, 2, 4); paint(F, E, R.skin, { edge: false, pat: (x, y) => (x === hx || x === hx + hw - 1) ? -1 : 0 });
  paint(F, H, R.skin, { round: true, pat: (x, y) => {
    const r = y - hy;
    if (!back && x <= hx + 3 && r >= Math.round(hh * 0.45) && r <= Math.round(hh * 0.62) && x >= hx + 2) return 1; // maçã do rosto
    if (r >= hh - 2) return -1;
    return 0;
  } });
  if (!back) drawFace(ctx, hx, hw, hh, ey, fem);
  // ---- cabelo da frente ----
  if (hairM.front && !hairM.front.empty()) paint(F, hairM.front, R.hair, { round: true, pat: hairPat(ctx, hx, hw), edgeLv: -2 });
  if (L.messy) for (let k = 0; k < 9; k++) { const a = Math.PI * (1.05 + k * 0.11), rx = hw / 2 + 3, x = Math.round(cx + Math.cos(a) * rx * (k % 2 ? 1 : 0.85)), y = Math.round(hy + 6 + Math.sin(a) * 9); F.set(x, y, R.hair.b); F.set(x + (k % 3) - 1, y - 1, R.hair.d1); }
  if (L.hair === 'careca' || L.hair === 'calvo_lados') { F.set(hx + 4, hy + 1, R.skin.l2); F.set(hx + 5, hy + 1, R.skin.l2); F.set(hx + 3, hy + 2, R.skin.l1); }
  drawHeadwear(ctx, hx, hw, hh, back);
  drawAcc(ctx, tL, tR, back);
  drawGear(ctx, tL, tR, back);
}

function drawCoatFB(ctx, coatBot, tL, tR, hipL, hipR, back) {
  const { F, L, B, R, cx, tTop, tBot, legTop } = ctx;
  const th = tBot - tTop + 1;
  const M = new PxMask();
  for (let y = tTop - 1; y <= coatBot; y++) {
    const r = y - tTop;
    let xl, xr;
    if (y <= tBot) {
      let ins = r <= 0 ? 3 : r === 1 ? 1 : 0;
      const bul = B.belly ? Math.round(B.belly * Math.sin(Math.PI * Math.min(1, Math.max(0, (r - th * 0.3) / (th * 0.75))))) : 0;
      xl = tL - 1 + ins - bul; xr = tR + 1 - ins + bul;
    } else {
      const t = (y - tBot) / Math.max(1, coatBot - tBot);
      xl = Math.min(tL - 1, hipL - 2) - Math.round(t * 1.5); xr = Math.max(tR + 1, hipR + 2) + Math.round(t * 1.5);
    }
    M.span(y, xl, xr);
  }
  const trimR = L.coatTrim ? PAL.ramp(L.coatTrim) : null;
  if (back) {
    paint(F, M, R.coat, { round: true, top: true, pat: (x, y) => {
      if (x === cx - 1 && y > tBot - 1) return y > coatBot - 4 ? -3 : -1; // costura e abertura
      if ((y === tBot - 3 || y === tBot - 2) && x >= cx - 5 && x <= cx + 4) return y === tBot - 3 ? 1 : -1; // meia-cinta
      if (y === tTop - 1 || y === tTop) return -1; // gola
      if (y === coatBot) return -1;
      return 0;
    } });
    if (trimR) for (let y = tTop; y <= coatBot; y++) { /* debrum lateral */ }
    return;
  }
  // abertura central (camisa aparece)
  const open = new PxMask();
  for (let y = tTop - 1; y <= coatBot; y++) {
    const r = y - tTop;
    let gh = r < 7 ? Math.max(1, 4 - Math.floor(r / 2)) : 1;
    if (y > tBot) gh = 1 + Math.min(2, Math.floor((y - tBot) / 2));
    if (L.plague) gh = r < 5 ? 2 : 0;
    if (gh > 0) open.span(y, cx - gh, cx + gh - 1);
  }
  M.sub(open);
  const left = M.clone().clipCols(0, cx - 1), right = M.clone().clipCols(cx, 99);
  const lapel = (x, y, side) => {
    const r = y - tTop; if (r > 7 || r < 0) return 0;
    const gh = Math.max(1, 4 - Math.floor(r / 2));
    const edgeX = side === 'L' ? cx - gh - 1 : cx + gh;
    const d = Math.abs(x - edgeX);
    if (d === 0) return side === 'L' ? 1 : 0;
    if (d === 2 && r < 6) return -1; // dobra da lapela
    return 0;
  };
  const coatPat = side => (x, y) => {
    let v = lapel(x, y, side);
    if (y === coatBot) v -= 1;
    // bolsos inferiores: abertura + sombra logo abaixo
    const py = tBot + 2;
    if (!L.plague) { const px0 = side === 'L' ? cx - 7 : cx + 2, px1 = side === 'L' ? cx - 3 : cx + 6; if (x >= px0 && x <= px1) { if (y === py) v -= 2; else if (y === py + 1) v += 1; } }
    if (L.plague && (x + y) % 5 === 0) v -= 1;
    return v;
  };
  paint(F, left, R.coat, { round: true, top: true, pat: coatPat('L') });
  paint(F, right, R.coat, { round: true, top: true, pat: coatPat('R') });
  // debrum azul (jaleco do hospital)
  if (trimR) {
    for (let y = tTop; y <= coatBot; y++) { for (const x of [cx - 1, cx]) { let e = x; while (open.has(e, y)) e += (x < cx ? -1 : 1); if (M.has(e, y)) F.set(e, y, y < tTop + 2 ? trimR.l1 : trimR.b); } }
    for (let x = 0; x < SW; x++) if (M.has(x, coatBot)) F.set(x, coatBot, trimR.d1);
  }
  if (L.plague) return;
  // bolso do peito com canetas (lado direito da tela = lado esquerdo do usuário)
  const pkx = cx + 3, pky = tTop + 6;
  for (let x = pkx; x <= pkx + 3; x++) F.set(x, pky, R.coat.d1);
  F.set(pkx, pky + 1, R.coat.d1); F.set(pkx + 3, pky + 1, R.coat.d1); F.set(pkx, pky + 2, R.coat.d1); F.set(pkx + 3, pky + 2, R.coat.d1);
  F.set(pkx + 1, pky - 1, C('#2d5bd6')); F.set(pkx + 1, pky - 2, C('#1d3a9a')); F.set(pkx + 2, pky - 1, C('#d13b3b')); F.set(pkx + 1, pky, C('#c9d0d6'));
  // crachá de INTERNO (lado esquerdo da tela)
  if (L.badge) {
    const bx = cx - 8, by = tTop + 5;
    F.set(bx + 2, by - 1, C('#9aa3ab')); F.set(bx + 2, by - 2, C('#c9d0d6'));
    const bh = L.badgeGold ? C('#e6b422') : C('#2f6fd6');
    for (let x = bx; x <= bx + 4; x++) { F.set(x, by, bh); F.set(x, by + 1, bh); }
    F.set(bx + 1, by, L.badgeGold ? C('#fff1a8') : C('#6fa3ff'));
    for (let y = by + 2; y <= by + 5; y++) for (let x = bx; x <= bx + 4; x++) F.set(x, y, C('#fbfbf6'));
    F.set(bx + 1, by + 2, PAL.ramp(L.hairC).b); F.set(bx + 1, by + 3, C(L.skin));
    F.set(bx + 3, by + 2, C('#7c868f')); F.set(bx + 3, by + 4, C('#9aa3ab')); F.set(bx + 2, by + 4, C('#9aa3ab'));
    for (let x = bx; x <= bx + 4; x++) F.set(x, by + 5, bh);
  }
}

function armGeom(ctx, side, tL, tR) {
  const { B, frame, pose, walking, tTop } = ctx;
  const aw = B.aw; const len = B.th - 1 + (B.kid ? 0 : 0);
  const x = side === 'L' ? tL - aw : tR + 1;
  let dy = 0, raise = false, reach = false, fist = false;
  if (walking) { if (frame === 1) dy = side === 'L' ? -1 : 1; if (frame === 3) dy = side === 'L' ? 1 : -1; }
  if (pose === 'cast') raise = true;
  if (pose === 'victory' && side === 'R') { raise = true; fist = true; }
  if (pose === 'interact' && side === 'R') reach = true;
  if (pose === 'hit') dy = -1;
  return { x, y: tTop + 1, aw, len, dy, raise, reach, fist };
}
function drawArmsFB(ctx, tL, tR, back) {
  const { F, L, B, R, cx, tTop, hasCoat } = ctx;
  const sleeveR = hasCoat ? R.coat : L.dress ? R.dress : (L.top === 'regata' ? R.skin : R.top);
  const shortSleeve = !hasCoat && (L.top === 'tshirt' || L.scrub || L.gown || L.dress) && L.top !== 'social' && L.top !== 'hoodie';
  for (const side of ['L', 'R']) {
    const g = armGeom(ctx, side, tL, tR);
    const A = new PxMask(), Hd = new PxMask();
    if (g.raise) {
      const top = tTop - g.len + 4;
      A.rect(g.x + (side === 'L' ? -1 : 1), top + 3, g.aw, g.len - 2); A.rect(g.x, tTop, g.aw, 3);
      Hd.rect(g.x + (side === 'L' ? -1 : 1), top, g.aw, 3);
    } else if (g.reach && !back) {
      A.rect(g.x, g.y, g.aw, 6); A.rect(g.x - 2, g.y + 5, g.aw + 1, 3);
      Hd.rect(g.x - 4, g.y + 6, 3, 3);
    } else {
      const y0 = g.y + g.dy;
      A.rect(g.x, y0, g.aw, g.len - 3); A.px(g.x + (side === 'L' ? 0 : g.aw - 1), y0 - 1, 0);
      Hd.rect(g.x, y0 + g.len - 3, g.aw, 3); Hd.px(g.x + (side === 'L' ? 0 : g.aw - 1), y0 + g.len - 1, 0);
    }
    if (shortSleeve && !g.raise) {
      const sl = A.clone(); const cut = A.clone(); const ys = [];
      for (let y = 0; y < SH; y++) for (let x = 0; x < SW; x++) if (A.has(x, y)) ys.push(y);
      const y0 = Math.min(...ys); sl.clipRows(y0, y0 + 4); cut.clipRows(y0 + 5, 99);
      paint(F, cut, R.skin, { round: true }); paint(F, sl, sleeveR, { round: true, top: true, pat: (x, y) => (y === y0 + 4 ? -1 : 0) });
    } else {
      paint(F, A, sleeveR, { round: true, top: true, pat: (x, y) => (hasCoat && !A.has(x, y + 1) ? -1 : 0) });
      if (hasCoat && L.coatTrim) { for (let x = 0; x < SW; x++) for (let y = 0; y < SH; y++) if (A.has(x, y) && !A.has(x, y + 1)) F.set(x, y, PAL.ramp(L.coatTrim).b); }
    }
    paint(F, Hd, R.skin, { round: true, edgeLv: -1, pat: (x, y) => (g.fist ? 0 : 0) });
  }
}

function drawFace(ctx, hx, hw, hh, ey, fem) {
  const { F, L, R, cx, hy, pose } = ctx;
  const sk = R.skin;
  const hairD = PAL.ramp(L.hairC).d2;
  const lid = PAL.mix(hairD, [30, 20, 25], 0.5);
  const iris = L.eyeC ? PAL.ramp(L.eyeC) : PAL.ramp('#4a2e1e');
  const closed = L.eyes === 'closed' || pose === 'defeat';
  const squint = pose === 'hit';
  const exL = cx - 6, exR = cx + 3; // olhos: 3px de largura
  for (const [ex, side] of [[exL, 'L'], [exR, 'R']]) {
    const outer = side === 'L' ? ex : ex + 2, inner = side === 'L' ? ex + 2 : ex;
    if (closed || squint) {
      F.set(ex, ey, lid); F.set(ex + 1, ey + (squint ? 0 : 1), lid); F.set(ex + 2, ey, lid);
      if (squint) { F.set(side === 'L' ? ex + 2 : ex, ey - 1, lid); }
    } else if (L.eyes === 'sleepy') {
      for (let k = 0; k < 3; k++) F.set(ex + k, ey, sk.d2);
      F.set(ex + 1, ey + 1, iris.d1); F.set(inner, ey + 1, iris.b); F.set(outer, ey + 1, C('#f4f0ea'));
      for (let k = 0; k < 3; k++) F.set(ex + k, ey - 1, lid);
    } else if (L.eyes === 'wide') {
      for (let k = 0; k < 3; k++) { F.set(ex + k, ey - 2, lid); F.set(ex + k, ey - 1, C('#fbf8f2')); F.set(ex + k, ey, C('#fbf8f2')); F.set(ex + k, ey + 1, C('#e4dcd6')); }
      F.set(ex + 1, ey, iris.d2); F.set(ex + 1, ey - 1, iris.d1);
    } else if (L.eyes === 'glow') {
      for (let k = 0; k < 3; k++) { F.set(ex + k, ey - 1, lid); F.set(ex + k, ey, C('#ffe14d')); F.set(ex + k, ey + 1, C('#ffb21a')); }
      F.set(ex + 1, ey, C('#fffbe0'));
    } else {
      for (let k = 0; k < 3; k++) F.set(ex + k, ey - 1, lid);
      F.set(outer, ey, C('#f6f2ec')); F.set(outer, ey + 1, C('#e4dcd6'));
      const ix0 = side === 'L' ? ex + 1 : ex;
      F.set(ix0, ey, iris.b); F.set(ix0 + 1, ey, iris.d1); F.set(ix0, ey + 1, iris.d2); F.set(ix0 + 1, ey + 1, iris.d2);
      F.set(side === 'L' ? ix0 : ix0 + 1, ey, C('#ffffff')); // brilho
      if (L.fem || L.lashes) F.set(side === 'L' ? ex - 1 : ex + 3, ey - 2 + 1, lid);
    }
    // sobrancelhas
    const by = ey - 3;
    const bC = L.hair === 'careca' ? sk.d2 : hairD;
    if (L.eyes === 'angry') { for (let k = 0; k < 3; k++) F.set(ex + k, by + (side === 'L' ? (k === 2 ? 1 : k === 1 ? 0 : -1) : (k === 0 ? 1 : k === 1 ? 0 : -1)), bC); }
    else if (L.eyes === 'sleepy') { for (let k = 0; k < 3; k++) F.set(ex + k, by + 1, bC); }
    else if (L.eyes === 'wide') { F.set(ex, by - 1, bC); F.set(ex + 1, by - 2, bC); F.set(ex + 2, by - 1, bC); }
    else { F.set(ex, by + (side === 'L' ? 0 : 0), bC); F.set(ex + 1, by, bC); F.set(ex + 2, by, bC); if (side === 'L') F.set(ex, by + 1, bC); else F.set(ex + 2, by + 1, bC); }
    if (L.eyebags) { F.set(ex, ey + 2, PAL.mix(sk.d1, [120, 80, 140], 0.35)); F.set(ex + 1, ey + 2, PAL.mix(sk.d1, [120, 80, 140], 0.35)); F.set(ex + 2, ey + 2, PAL.mix(sk.d1, [120, 80, 140], 0.25)); }
    if (L.blush || L.cheek || L.makeup) { const bx = side === 'L' ? ex - 1 : ex + 2; F.set(bx, ey + 3, PAL.mix(sk.b, [240, 110, 120], 0.45)); F.set(bx + 1, ey + 3, PAL.mix(sk.b, [240, 110, 120], 0.3)); }
    if (L.old) { F.set(side === 'L' ? ex - 1 : ex + 3, ey + 1, sk.d1); }
  }
  // nariz (sombra à direita, luz à esquerda)
  F.set(cx, ey + 2, sk.d1); F.set(cx, ey + 3, sk.d2); F.set(cx - 1, ey + 3, sk.d1); F.set(cx - 1, ey + 1, sk.l1);
  // boca
  const my = ey + 5;
  const lipD = PAL.mix(sk.d3, [120, 50, 60], 0.2), lipC = L.mouth === 'lips' ? C('#b2304f') : PAL.mix(sk.d2, [170, 80, 80], 0.12);
  if (pose === 'victory' || L.mouth === 'open') { F.set(cx - 2, my, lipD); F.set(cx - 1, my, lipD); F.set(cx, my, lipD); F.set(cx + 1, my, lipD); F.set(cx - 1, my + 1, C('#d9606a')); F.set(cx, my + 1, lipD); }
  else if (L.mouth === 'smile') { F.set(cx - 3, my - 1, lipD); F.set(cx - 2, my, lipD); F.set(cx - 1, my, lipD); F.set(cx, my, lipD); F.set(cx + 1, my - 1, lipD); }
  else if (L.mouth === 'frown' || pose === 'defeat' || pose === 'hit') { F.set(cx - 2, my + 1, lipD); F.set(cx - 1, my, lipD); F.set(cx, my, lipD); F.set(cx + 1, my + 1, lipD); }
  else if (L.mouth === 'lips') { F.set(cx - 2, my, C('#9a2442')); F.set(cx - 1, my, lipC); F.set(cx, my, lipC); F.set(cx + 1, my, C('#9a2442')); F.set(cx - 1, my + 1, C('#d4566f')); F.set(cx, my + 1, C('#c03c5a')); }
  else { F.set(cx - 2, my, lipC); F.set(cx - 1, my, lipD); F.set(cx, my, lipD); F.set(cx + 1, my, lipC); }
  if (L.old) { F.set(cx - 4, my - 1, sk.d1); F.set(cx + 3, my - 1, sk.d1); F.set(cx - 2, hy + 4, sk.d1); F.set(cx - 1, hy + 4, sk.d1); F.set(cx + 1, hy + 4, sk.d1); }
  // pelos faciais
  const HR = PAL.ramp(L.hairC, 'hair');
  if (L.facial === 'bigode') { const M = new PxMask(); M.span(my - 1, cx - 4, cx + 3).span(my - 2, cx - 3, cx + 2).px(cx - 5, my).px(cx + 4, my); paint(F, M, HR, { edge: false, top: true }); }
  if (L.facial === 'barba') { const M = new PxMask(); for (let y = ey + 3; y < hy + hh; y++) { const r = y - (ey + 3); M.span(y, hx + (r > 4 ? 2 + (r - 4) : 0), hx + hw - 1 - (r > 4 ? 2 + (r - 4) : 0)); } M.span(my, cx - 2, cx + 1, 0); M.span(my + 1, cx - 1, cx, 0); for (let y = 0; y < ey + 3; y++) {} paint(F, M, HR, { edge: false, pat: (x, y) => (hsh(x, y) < 0.3 ? -1 : 0) }); F.set(cx - 1, my, lipD); F.set(cx, my, lipD); }
  if (L.facial === 'cavanhaque') { const M = new PxMask(); M.span(my - 1, cx - 3, cx + 2).span(my + 1, cx - 2, cx + 1).span(my + 2, cx - 1, cx).span(my + 3, cx - 1, cx); paint(F, M, HR, { edge: false }); F.set(cx - 1, my, lipD); F.set(cx, my, lipD); }
  // óculos
  if (L.glasses) {
    const GC = L.glasses === 'ouro' ? PAL.ramp('#d6a93b', 'metal') : PAL.ramp('#4a4452');
    const lens = [214, 232, 240];
    for (const ex of [exL, exR]) {
      if (L.glasses === 'meia') { for (let k = -1; k <= 3; k++) F.set(ex + k, ey + 2, GC.b); F.set(ex - 1, ey + 1, GC.b); F.set(ex + 3, ey + 1, GC.b); F.set(ex, ey + 1, PAL.mix(F.get(ex, ey + 1), lens, 0.4)); continue; }
      for (let k = -1; k <= 3; k++) { F.set(ex + k, ey - 2, GC.d1); if (k >= 0 && k <= 2) F.set(ex + k, ey + 2, PAL.mix(GC.b, F.get(ex + k, ey + 2), 0.5)); }
      for (let y = ey - 1; y <= ey + 1; y++) { F.set(ex - 1, y, GC.b); F.set(ex + 3, y, GC.b); }
      F.set(ex, ey - 1, PAL.mix(F.get(ex, ey - 1), lens, 0.6));
    }
    F.set(cx - 1, ey - 1, GC.b); F.set(cx, ey - 1, GC.b);
    F.set(exL - 1, ey - 2, GC.l2);
  }
  // máscara cirúrgica
  if (L.mask) {
    const MR = PAL.ramp('#9fd0e8'); const M = new PxMask();
    for (let y = ey + 2; y < hy + hh; y++) { const r = y - (ey + 2); M.span(y, hx + 1 + (r > 4 ? r - 4 : 0), hx + hw - 2 - (r > 4 ? r - 4 : 0)); }
    paint(F, M, MR, { round: true, top: true, pat: (x, y) => ((y - ey) % 2 === 0 ? -1 : 0) });
    F.set(hx, ey + 1, MR.d1); F.set(hx + hw - 1, ey + 1, MR.d1);
  }
}

/* ===== cabelos ===== */
function hairMasks(ctx, hx, hw, hh) {
  const { L, view, cx, hy, B, tTop } = ctx;
  const s = L.hair, back = view === 'b';
  const T = hy, Lx = hx, Rx = hx + hw - 1, bot = hy + hh;
  const F = new PxMask(), K = new PxMask();
  const cap = (extra = 1, depth = 5) => { F.ell(cx, T + depth, hw / 2 + extra, depth + 2); F.clipRows(0, T + depth - 1 + (back ? 99 : 0)); };
  if (s === 'careca') return { front: F, back: K };
  if (back) {
    // de costas: o cabelo cobre a cabeça
    const full = () => { F.ell(cx, T + hh * 0.42, hw / 2 + 1, hh * 0.5 + 1.5); F.clipRows(0, T + hh - (s === 'raspado' ? 4 : 3)); };
    switch (s) {
      case 'raspado': full(); break;
      case 'calvo_lados': F.ell(cx, T + hh * 0.55, hw / 2 + 1, hh * 0.35); F.clipRows(T + 5, T + hh - 3); break;
      case 'longo': case 'ondulado': case 'trancas': full(); F.rect(Lx - 1, T + 6, hw + 2, hh + (B.kid ? 4 : 10)); if (s === 'ondulado') for (let y = T + 6; y < T + hh + 10; y++) { F.px(Lx - 2 + Math.round(Math.sin(y / 2)), y); F.px(Rx + 2 + Math.round(Math.sin(y / 2)), y); } break;
      case 'bob': full(); F.rect(Lx - 1, T + 5, hw + 2, hh - 3); break;
      case 'rabo': full(); F.rect(cx - 2, T + hh - 3, 4, 9); F.rect(cx - 1, T + hh + 6, 2, 2); break;
      case 'coque': full(); F.ell(cx, T - 1, 4.5, 3.5); break;
      case 'cacheado': F.ell(cx, T + 6, hw / 2 + 3, 10); F.clipRows(0, T + hh + 1); break;
      case 'crespo': F.ell(cx, T + 4, hw / 2 + 4.5, 10); break;
      case 'juba': F.ell(cx, T + 8, hw / 2 + 6, 13); break;
      case 'topete': full(); F.ell(cx, T + 1, hw / 2 - 1, 3); break;
      default: full();
    }
    return { front: F, back: K };
  }
  // ---- frente ----
  switch (s) {
    case 'raspado': F.ell(cx, T + 5, hw / 2 + 0.5, 6.5); F.clipRows(0, T + 3); F.rect(Lx, T + 3, 1, 3).rect(Rx, T + 3, 1, 3); break;
    case 'curto': case 'grisalho_curto':
      cap(1, 4); F.rect(Lx, T + 3, 2, 5).rect(Rx - 1, T + 3, 2, 5);
      F.span(T + 4, cx - 5, cx - 1).span(T + 5, cx - 4, cx - 3).span(T + 4, cx + 2, cx + 4); break;
    case 'medio':
      cap(1, 4); F.rect(Lx - 1, T + 3, 3, hh - 5).rect(Rx - 1, T + 3, 3, hh - 5);
      F.span(T + 4, Lx + 1, cx + 1).span(T + 5, Lx + 1, cx - 1).span(T + 6, Lx + 1, cx - 4); break;
    case 'longo':
      cap(1, 4); F.rect(Lx - 1, T + 3, 3, hh + 3).rect(Rx - 1, T + 3, 3, hh + 3);
      F.span(T + 4, Lx + 1, cx).span(T + 5, Lx + 1, cx - 3);
      K.rect(Lx - 1, T + 6, hw + 2, hh + (B.kid ? 3 : 9)); break;
    case 'ondulado':
      cap(1, 4); for (let y = T + 3; y < T + hh + 4; y++) { const w = Math.round(Math.sin((y - T) / 2.2)); F.span(y, Lx - 1 + w, Lx + 1 + w); F.span(y, Rx - 1 - w, Rx + 1 - w); }
      F.span(T + 4, Lx + 1, cx + 1).span(T + 5, Lx + 2, cx - 2);
      K.rect(Lx - 2, T + 6, hw + 4, hh + (B.kid ? 3 : 8)); break;
    case 'cacheado':
      F.ell(cx, T + 4, hw / 2 + 2.5, 7.5); F.clipRows(0, T + 4);
      F.rect(Lx - 2, T + 3, 4, hh - 3).rect(Rx - 1, T + 3, 4, hh - 3);
      F.span(T + 5, Lx + 1, cx - 2).span(T + 5, cx + 2, Rx - 2).px(cx - 4, T + 6).px(cx + 3, T + 6);
      K.ell(cx, T + 9, hw / 2 + 3, 9); break;
    case 'crespo':
      F.ell(cx, T + 3, hw / 2 + 4.5, 9); F.clipRows(0, T + 3);
      F.rect(Lx - 3, T + 3, 3, hh - 6).rect(Rx + 1, T + 3, 3, hh - 6);
      F.span(T + 4, Lx + 1, Rx - 1);
      K.ell(cx, T + 6, hw / 2 + 4.5, 9); break;
    case 'coque':
      cap(0.5, 3); F.rect(Lx, T + 3, 1, 5).rect(Rx, T + 3, 1, 5); F.span(T + 3, Lx + 1, cx - 2).span(T + 3, cx + 3, Rx - 1);
      F.ell(cx, T - 2, 4.5, 3.5); break;
    case 'rabo':
      cap(0.5, 3); F.rect(Lx, T + 3, 1, 5).rect(Rx, T + 3, 1, 5); F.span(T + 3, Lx + 1, cx - 1);
      K.rect(Rx, T + 4, 3, 10); K.rect(Rx + 1, T + 14, 2, 3); break;
    case 'franja':
      cap(1, 4); F.rect(Lx - 1, T + 3, 3, hh - 4).rect(Rx - 1, T + 3, 3, hh - 4);
      F.rect(Lx + 1, T + 4, hw - 2, 3); break;
    case 'trancas':
      cap(1, 4); F.rect(Lx - 2, T + 3, 3, hh + 6).rect(Rx, T + 3, 3, hh + 6);
      F.span(T + 4, Lx + 1, Rx - 1);
      K.rect(Lx - 2, T + 6, hw + 4, hh + (B.kid ? 3 : 10)); break;
    case 'bob':
      cap(1.5, 4); F.rect(Lx - 2, T + 3, 3, hh - 4).rect(Rx, T + 3, 3, hh - 4); F.px(Lx + 1, T + hh - 2).px(Rx - 1, T + hh - 2);
      F.span(T + 4, Lx + 1, cx + 2).span(T + 5, Lx + 1, cx - 1).span(T + 6, Lx + 1, cx - 4); break;
    case 'topete':
      cap(0.5, 3); F.rect(Lx, T + 3, 1, 4).rect(Rx, T + 3, 1, 4);
      F.ell(cx + 1, T - 1, hw / 2 - 1, 3.5); F.span(T - 4, cx - 2, cx + 4).span(T + 3, cx + 2, cx + 5); break;
    case 'juba':
      F.ell(cx, T + 3, hw / 2 + 2, 6); F.clipRows(0, T + 3);
      for (let k = 0; k < 5; k++) F.px(Lx + 2 + k * 3, T + 4).px(Lx + 3 + k * 3, T + 4).px(Lx + 3 + k * 3, T + 5);
      F.px(cx - 2, T - 4).px(cx - 1, T - 5).px(cx + 3, T - 4);
      K.ell(cx, T + hh * 0.55, hw / 2 + 6.5, hh * 0.55 + 6);
      for (let k = 0; k < 14; k++) { const a = -Math.PI * 0.95 + k * (Math.PI * 1.9 / 13); K.px(cx + Math.cos(a) * (hw / 2 + 8), T + hh * 0.55 + Math.sin(a) * (hh * 0.55 + 7)); }
      break;
    case 'calvo_lados':
      F.rect(Lx - 1, T + 4, 3, 7).rect(Rx - 1, T + 4, 3, 7); F.px(Lx + 2, T + 4).px(Rx - 2, T + 4); break;
    default: cap(1, 4);
  }
  return { front: F, back: K };
}
function hairPat(ctx, hx, hw) {
  const { L, cx, hy } = ctx; const s = L.hair; const T = hy;
  if (s === 'crespo') return (x, y) => { const h = hsh(x, y, 7); if (y < T + 2 && x < cx) return h < 0.5 ? 1 : 0; return h < 0.22 ? -1 : h > 0.86 ? 1 : 0; };
  if (s === 'cacheado' || s === 'juba') return (x, y) => { const u = ((x + (Math.floor(y / 3) % 2) * 2) % 4 + 4) % 4, v = ((y % 3) + 3) % 3; if (u === 0 && v === 0) return 1; if (u === 2 && v === 2) return -1; if (u === 3 && v === 1) return -1; return (y < T + 1 && x < cx) ? 1 : 0; };
  if (s === 'trancas') return (x, y) => { if (y < T + 5) return (y === T + 1 && x < cx) ? 1 : 0; const col = ((x - hx) % 3 + 3) % 3; return col === 2 ? -1 : ((y + x) % 3 === 0 ? 1 : 0); };
  if (s === 'raspado') return (x, y) => ((x + y) % 2 === 0 ? -1 : 0);
  return (x, y) => {
    // faixa de brilho em arco + mechas
    const yb = T + 1 + Math.round(Math.abs(x - (cx - 3)) / 4);
    if ((y === yb || y === yb + 1) && x < cx + 4) return (y === yb && x >= cx - 4 && x <= cx - 2) ? 2 : 1;
    if (y > T + 4 && ((x * 7 + 3) % 5 === 0)) return -1;
    return 0;
  };
}

function drawHeadwear(ctx, hx, hw, hh, back) {
  const { F, L, cx, hy, view } = ctx; const T = hy;
  if (L.cap) {
    const CR = PAL.ramp(L.cap); const M = new PxMask();
    M.ell(cx, T + 4, hw / 2 + 1.5, 6.5); M.clipRows(0, T + 4);
    if (back) M.rect(cx - 2, T + 5, 4, 2);
    paint(F, M, CR, { round: true, top: true, pat: (x, y) => (y === T + 4 ? -1 : (x + y * 2) % 6 === 0 ? -1 : 0) });
    if (L.capPrint) { const cols = [C('#f2c84a'), C('#e05a9a'), C('#ffffff'), C('#6fd8ff')]; for (let y = T - 2; y < T + 4; y++) for (let x = 0; x < SW; x++) if (M.has(x, y) && (x * 3 + y * 5) % 7 === 0) F.set(x, y, cols[(x + y) % 4]); }
  }
  drawHeadItem(ctx, hx, hw, hh, back);
  if (L.horns) {
    const HR = PAL.ramp('#d8262f'); const M = new PxMask();
    const side = view === 's';
    const horn = (bx, dirx) => { M.rect(bx, T + 1, 3, 2); M.rect(bx + dirx, T - 1, 2, 2); M.px(bx + dirx * 2, T - 2).px(bx + dirx * 2 + (dirx > 0 ? 0 : 1), T - 3); M.px(bx + dirx * 3, T - 4); M.px(bx + dirx * 3, T - 5); };
    if (!side) { horn(hx + 2, -1); horn(hx + hw - 5, 1); } else { horn(hx + 4, -1); horn(hx + hw - 6, 1); }
    paint(F, M, HR, { round: true, top: true, pat: (x, y) => (y <= T - 4 ? -1 : 0) });
  }
}

function drawPlagueHeadF(ctx, hx, hw, hh, back) {
  const { F, cx, hy, tTop } = ctx; const T = hy;
  const D = PAL.ramp('#2a2630'), Kr = PAL.ramp('#151218'), Le = PAL.ramp('#cdb28a'), Gl = PAL.ramp('#b23b3b');
  const Hood = new PxMask(); Hood.ell(cx, T + hh * 0.55, hw / 2 + 1.5, hh * 0.55 + 1); Hood.rect(cx - hw / 2 - 1, T + hh * 0.5, hw + 2, tTop - T - hh * 0.5 + 2);
  paint(F, Hood, D, { round: true, pat: back ? (x, y) => (x === cx - 1 && y > T + 4 ? -1 : 0) : null });
  if (back) { const Hat = new PxMask(); Hat.ell(cx, T + 1, hw / 2 + 5, 2.2); Hat.rect(cx - hw / 2 + 2, T - 6, hw - 4, 7); paint(F, Hat, Kr, { round: true, top: true, pat: (x, y) => (y === T - 2 ? 1 : 0) }); return; }
  const Face = new PxMask(); Face.ell(cx, T + hh * 0.55, hw / 2 - 2, hh * 0.4); paint(F, Face, Le, { lv: -1, round: true });
  const ey = T + Math.round(hh * 0.5);
  for (const ex of [cx - 5, cx + 2]) { const G = new PxMask(); G.rect(ex, ey - 1, 3, 3); paint(F, G, Gl, { top: true, pat: (x, y) => (x === ex && y === ey - 1 ? 2 : 0) }); }
  const Beak = new PxMask(); for (let k = 0; k < 9; k++) Beak.span(ey + 2 + k, cx - 2 + Math.floor(k / 3), cx + 1 - Math.floor(k / 4)); paint(F, Beak, Le, { round: true, top: true });
  const Hat = new PxMask(); Hat.ell(cx, T + 1, hw / 2 + 5, 2.2); Hat.rect(cx - hw / 2 + 2, T - 6, hw - 4, 7); paint(F, Hat, Kr, { round: true, top: true, pat: (x, y) => (y === T - 2 ? 1 : 0) });
}

function drawAcc(ctx, tL, tR, back) {
  const { F, L, B, pose, tTop, cx } = ctx; if (!L.acc || back || pose === 'cast') return;
  const g = armGeom(ctx, 'R', tL, tR); const hx = g.x, hyy = g.y + g.dy + g.len - 3;
  if (L.acc === 'caneca') {
    const M = new PxMask(); M.rect(hx - 1, hyy - 2, 4, 5); paint(F, M, PAL.ramp('#eeeae4'), { round: true, top: true });
    F.set(hx, hyy - 2, C('#6a4428')); F.set(hx + 1, hyy - 2, C('#5a3a1e')); F.set(hx + 3, hyy - 1, C('#cfc9c0')); F.set(hx + 3, hyy, C('#cfc9c0'));
    F.set(hx, hyy, C('#2f6fd6')); F.set(hx + 1, hyy, C('#2f6fd6'));
    if (pose === 'idle') { F.set(hx + 1, hyy - 4, C('#e8e8f0')); F.set(hx, hyy - 5, C('#d8d8e4')); }
  }
  if (L.acc === 'prancheta') {
    const gl = armGeom(ctx, 'L', tL, tR); const bx = gl.x + 1, by = tTop + 3;
    const M = new PxMask(); M.rect(bx, by, 6, 8); paint(F, M, PAL.ramp('#8a5a2b'), { round: true, top: true });
    const P = new PxMask(); P.rect(bx + 1, by + 1, 4, 6); paint(F, P, PAL.ramp('#f6f4ea'), { edge: false, pat: (x, y) => ((y - by) % 2 === 0 && x > bx + 1 ? -1 : 0) });
    F.set(bx + 2, by - 1, C('#c9d0d6')); F.set(bx + 3, by - 1, C('#9aa3ab'));
    const Hd = new PxMask(); Hd.rect(gl.x, by + 4, 3, 3); paint(F, Hd, ctx.R.skin, { round: true });
  }
  if (L.acc === 'celular') { const M = new PxMask(); M.rect(hx, hyy - 3, 3, 5); paint(F, M, PAL.ramp('#24242c'), { round: true }); F.set(hx + 1, hyy - 2, C('#6fb6ff')); F.set(hx + 1, hyy - 1, C('#9fd0ff')); }
  if (L.acc === 'papeis') { const M = new PxMask(); M.rect(hx - 2, hyy - 2, 6, 4); paint(F, M, PAL.ramp('#fbfbf6'), { top: true, pat: (x, y) => (y === hyy - 1 && x > hx - 2 ? -1 : 0) }); }
  if (L.acc === 'pano') { const M = new PxMask(); M.rect(tR - 3, tTop - 1, 4, 6); paint(F, M, PAL.ramp('#e8e8e8'), { round: true, top: true, pat: (x, y) => ((y - tTop) % 3 === 1 ? -1 : 0) }); }
}

/* ===== PERFIL (virado para a direita) ===== */
function drawSide(ctx) {
  const { F, L, B, R, frame, pose, walking, cx, ground, shoeTop, ankle, legTop, tBot, tTop, hy, hasCoat } = ctx;
  const depth = Math.max(8, Math.round(B.tw * 0.62)) + (B.kid ? -1 : 0);
  const tBack = cx - Math.floor(depth / 2) - 1, tFront = tBack + depth - 1;
  const lw = Math.max(4, Math.round(B.hip * 0.36));
  const longDress = !!(L.dress || L.gown);
  const coatBot = L.plague ? ankle - 1 : legTop + Math.max(5, Math.round(B.lh * 0.5));
  // passada: deslocamentos do pé (perto/longe)
  let nf = 0, ff = 0, nUp = 0, fUp = 0;
  if (walking) { if (frame === 1) { nf = 4; ff = -4; fUp = 1; } else if (frame === 3) { nf = -4; ff = 4; nUp = 1; } }
  if (pose === 'hit') { nf = -1; }
  const hipX = cx - 1;
  const hw = B.hw - 1, hh = B.hh, hx = cx - Math.floor(hw / 2) + 1;

  // cabelo de trás
  const hairS = hairMasksSide(ctx, hx, hw, hh);
  if (!hairS.back.empty()) paint(F, hairS.back, R.hair, { lv: -1, pat: hairPat(ctx, hx, hw), edge: false });

  // braço de trás
  drawArmSide(ctx, 'far', tBack, tFront);
  // pernas (longe, depois perto)
  for (const [off, up, far] of [[ff, fUp, true], [nf, nUp, false]]) {
    const M = new PxMask();
    const footX = hipX + off, knee = Math.round((legTop + ankle) / 2);
    const kneeX = hipX + off * 0.45 + (up ? -1 : 0);
    M.limb([[hipX, legTop], [kneeX, knee], [footX, ankle - up]], lw);
    const legR = longDress || L.skirt ? R.skin : R.bot;
    if (longDress) M.clipRows(legTop + Math.round(B.lh * 0.5), 99); else if (L.skirt) M.clipRows(legTop + Math.round(B.lh * 0.55), 99);
    paint(F, M, legR, { round: true, lv: far ? -1 : 0 });
    // sapato
    const S = new PxMask(); const sy = shoeTop - up; const fx = Math.round(footX);
    S.span(sy, fx - 2, fx + 1); S.span(sy + 1, fx - 3, fx + 3 + (L.pointy ? 2 : 0)); if (B.sh > 2) S.span(sy + 2, fx - 3, fx + 4 + (L.pointy ? 3 : 0));
    if (L.pointy) S.px(fx + 7, sy + 1);
    const white = PAL.hsl(R.shoe.b)[2] > 0.8;
    paint(F, S, R.shoe, { lv: far ? -1 : 0, top: true, pat: (x, y) => (y === sy + B.sh - 1 ? (white ? -1 : L.pointy ? -1 : 2) : (L.pointy && y === sy + 1 && x === fx + 1 ? 2 : 0)) });
  }
  // saia/vestido
  if (L.skirt && !longDress) { const M = new PxMask(); const kb = legTop + Math.round(B.lh * 0.55); for (let y = legTop - 1; y <= kb; y++) { const t = (y - legTop + 1) / (kb - legTop + 2); M.span(y, tBack - Math.round(t * 2), tFront + Math.round(t * 3)); } paint(F, M, R.bot, { round: true }); }
  if (longDress) { const M = new PxMask(); const kb = legTop + Math.round(B.lh * 0.5); for (let y = tBot - 2; y <= kb; y++) { const t = (y - tBot + 2) / (kb - tBot + 3); M.span(y, tBack - Math.round(t * 2), tFront + Math.round(t * 3)); } paint(F, M, R.dress, { round: true }); }
  // tronco
  const T = new PxMask(); const th = tBot - tTop + 1;
  for (let y = tTop; y <= tBot; y++) { const r = y - tTop; const ins = r === 0 ? 2 : r === 1 ? 1 : 0; const bul = B.belly ? Math.round(B.belly * 1.3 * Math.sin(Math.PI * Math.min(1, Math.max(0, (r - th * 0.3) / (th * 0.75))))) : 0; const chest = (L.fem && r >= 3 && r <= 6) ? 1 : 0; const preg = L.preg ? Math.round(5 * Math.sin(Math.PI * Math.min(1, Math.max(0, (r - th * 0.3) / (th * 0.75))))) : 0; T.span(y, tBack + ins, tFront - ins + bul + chest + preg); }
  paint(F, T, longDress && L.dress ? R.dress : R.top, { round: true, top: true, pat: (x, y) => (y > tBot - 2 ? -1 : 0) });
  if (L.tie && !hasCoat) { for (let y = tTop + 1; y < tTop + B.th - 4; y++) F.set(tFront - (y > tTop + 2 ? 0 : 1), y, PAL.ramp(L.tie).b); }
  if (L.apron) { const M = new PxMask(); M.rect(tFront - 2, tTop + 3, 3, th); for (let y = tBot; y <= legTop + Math.round(B.lh * 0.6); y++) M.span(y, tFront - 3, tFront + 1); paint(F, M, PAL.ramp(L.apron), { round: true }); }
  // jaleco
  if (hasCoat) {
    const M = new PxMask();
    for (let y = tTop - 1; y <= coatBot; y++) {
      const r = y - tTop; let xl, xr;
      if (y <= tBot) { const ins = r <= 0 ? 3 : r === 1 ? 1 : 0; const bul = B.belly ? Math.round(B.belly * 1.3 * Math.sin(Math.PI * Math.min(1, Math.max(0, (r - th * 0.3) / (th * 0.75))))) : 0; xl = tBack - 1 + ins; xr = tFront + ins * 0 + bul - (r < 6 ? 1 : 0); }
      else { const t = (y - tBot) / Math.max(1, coatBot - tBot); xl = tBack - 1 - Math.round(t * (walking ? 3 : 1.5)); xr = tFront + 1 + Math.round(t * 1) + (walking && frame % 2 ? 1 : 0); }
      M.span(y, xl, xr);
    }
    paint(F, M, R.coat, { round: true, top: true, pat: (x, y) => {
      if (L.plague) return (x + y) % 5 === 0 ? -1 : 0;
      if (y > tBot && x === tFront - 1) return -1; // borda da abertura
      if (y === tBot + 2 && x > tBack + 1 && x < tFront - 2) return -1; // bolso
      if (y === coatBot) return -1;
      return 0;
    } });
    if (!L.plague) {
      // camisa aparece na frente do peito (abertura)
      for (let y = tTop; y < tTop + 6; y++) F.set(tFront - 0, y, (L.tie ? PAL.ramp(L.tie).b : R.top.b));
      if (L.badge) { F.set(tFront - 2, tTop + 5, C('#2f6fd6')); F.set(tFront - 1, tTop + 5, C('#2f6fd6')); F.set(tFront - 2, tTop + 6, C('#fbfbf6')); F.set(tFront - 1, tTop + 6, C('#fbfbf6')); F.set(tFront - 2, tTop + 7, C('#fbfbf6')); F.set(tFront - 1, tTop + 7, C('#2f6fd6')); }
      if (L.coatTrim) for (let y = tTop; y <= coatBot; y++) for (let x = SW - 1; x >= 0; x--) if (M.has(x, y)) { F.set(x, y, PAL.ramp(L.coatTrim).b); break; }
    }
  }
  if (L.steth) { F.set(tFront - 1, tTop, C('#2d6fc9')); F.set(tFront, tTop + 1, C('#2d6fc9')); F.set(tFront, tTop + 2, C('#2d6fc9')); F.set(tFront, tTop + 3, C('#c9d0d6')); }
  // cabeça
  if (L.plague) { drawPlagueHeadS(ctx, hx, hw, hh, tFront); drawArmSide(ctx, 'near', tBack, tFront); return; }
  const fem = !!(L.fem || L.mouth === 'lips');
  const N = new PxMask(); N.rect(cx - 3, hy + hh - 3, 6, tTop - (hy + hh - 3) + 1); paint(F, N, R.skin, { lv: -1, edge: false });
  const H = new PxMask(); const ey = hy + Math.round(hh * 0.52);
  for (let r = 0; r < hh; r++) {
    let l = r === 0 ? 4 : r === 1 ? 2 : r === 2 ? 1 : 0, rr = r === 0 ? 4 : r === 1 ? 2 : r === 2 ? 1 : 0;
    if (r >= hh - 4) { l = r - (hh - 5); }
    if (r === hh - 3) rr = 1; if (r === hh - 2) rr = fem ? 3 : 2; if (r === hh - 1) rr = fem ? 5 : 4;
    H.span(hy + r, hx + l, hx + hw - 1 - rr);
  }
  H.px(hx + hw, ey + 1).px(hx + hw, ey + 2); // nariz
  paint(F, H, R.skin, { round: true, pat: (x, y) => (y >= hy + hh - 2 ? -1 : 0) });
  // orelha
  const ex0 = hx + Math.floor(hw * 0.38);
  const E = new PxMask(); E.rect(ex0, ey - 1, 3, 4); paint(F, E, R.skin, { edge: true, edgeLv: -1, pat: (x, y) => (x === ex0 + 1 && y > ey - 1 && y < ey + 2 ? -1 : 0) });
  // olho, sobrancelha, boca
  const iris = L.eyeC ? PAL.ramp(L.eyeC) : PAL.ramp('#4a2e1e');
  const lid = PAL.mix(PAL.ramp(L.hairC).d2, [30, 20, 25], 0.5);
  const ex = hx + hw - 5;
  if (L.eyes === 'closed' || pose === 'defeat' || pose === 'hit') { F.set(ex, ey, lid); F.set(ex + 1, ey, lid); }
  else if (L.eyes === 'glow') { F.set(ex, ey, C('#ffe14d')); F.set(ex + 1, ey, C('#fffbe0')); F.set(ex, ey + 1, C('#ffb21a')); F.set(ex, ey - 1, lid); F.set(ex + 1, ey - 1, lid); }
  else { F.set(ex, ey - 1, lid); F.set(ex + 1, ey - 1, lid); F.set(ex, ey, L.eyes === 'sleepy' ? R.skin.d2 : iris.b); F.set(ex, ey + 1, iris.d2); F.set(ex + 1, ey + 1, C('#f2ede6')); if (L.eyes !== 'sleepy') F.set(ex + 1, ey, C('#ffffff')); if (L.fem || L.lashes) F.set(ex + 2, ey - 1, lid); }
  const bC = PAL.ramp(L.hairC).d2;
  if (L.eyes === 'angry') { F.set(ex - 1, ey - 4, bC); F.set(ex, ey - 3, bC); F.set(ex + 1, ey - 3, bC); F.set(ex + 2, ey - 2, bC); } else { F.set(ex - 1, ey - 3, bC); F.set(ex, ey - 3, bC); F.set(ex + 1, ey - 3, bC); }
  if (L.eyebags) F.set(ex, ey + 2, PAL.mix(R.skin.d1, [120, 80, 140], 0.35));
  if (L.blush || L.cheek || L.makeup) F.set(ex - 1, ey + 3, PAL.mix(R.skin.b, [240, 110, 120], 0.45));
  const my = ey + 5; const lipC = L.mouth === 'lips' ? C('#b2304f') : PAL.mix(R.skin.d2, [190, 70, 80], 0.3);
  F.set(hx + hw - 2, my, lipC); F.set(hx + hw - 3, my + (L.mouth === 'smile' || pose === 'victory' ? -1 : L.mouth === 'frown' ? 1 : 0), lipC);
  if (L.old) { F.set(hx + hw - 4, my - 1, R.skin.d1); F.set(ex - 1, ey + 1, R.skin.d1); }
  const HR = PAL.ramp(L.hairC, 'hair');
  if (L.facial === 'bigode') { const M = new PxMask(); M.span(my - 1, hx + hw - 4, hx + hw).px(hx + hw - 1, my); paint(F, M, HR, { edge: false }); }
  if (L.facial === 'barba') { const M = new PxMask(); for (let y = ey + 3; y < hy + hh; y++) M.span(y, ex0 + 3, hx + hw - 2 - (y > ey + 6 ? y - ey - 6 : 0)); M.px(hx + hw - 2, my, 0).px(hx + hw - 3, my, 0); paint(F, M, HR, { edge: false, pat: (x, y) => (hsh(x, y) < 0.3 ? -1 : 0) }); }
  if (L.facial === 'cavanhaque') { const M = new PxMask(); M.span(my + 1, hx + hw - 4, hx + hw - 3).span(my + 2, hx + hw - 4, hx + hw - 3); paint(F, M, HR, { edge: false }); }
  if (L.glasses) { const GC = L.glasses === 'ouro' ? PAL.ramp('#d6a93b', 'metal') : PAL.ramp('#4a4452'); if (L.glasses !== 'meia') for (let k = 0; k <= 2; k++) F.set(ex + k, ey - 2, GC.b); else for (let k = 0; k <= 2; k++) F.set(ex + k, ey + 2, GC.b); F.set(ex + 2, ey - 1, GC.b); F.set(ex + 2, ey, GC.b); F.set(ex + 2, ey + 1, GC.d1); for (let k = ex - 1; k > ex0 + 2; k--) F.set(k, ey - 1, GC.d1); }
  if (L.mask) { const M = new PxMask(); for (let y = ey + 2; y < hy + hh; y++) M.span(y, ex0 + 3, hx + hw - (y > ey + 5 ? 2 : 0)); paint(F, M, PAL.ramp('#9fd0e8'), { round: true, pat: (x, y) => ((y - ey) % 2 === 0 ? -1 : 0) }); F.set(ex0 + 2, ey + 1, PAL.ramp('#9fd0e8').d1); }
  // cabelo da frente
  if (!hairS.front.empty()) paint(F, hairS.front, R.hair, { round: true, pat: hairPat(ctx, hx, hw), edgeLv: -2 });
  if (L.hair === 'careca' || L.hair === 'calvo_lados') { F.set(hx + 6, hy + 1, R.skin.l2); F.set(hx + 7, hy + 1, R.skin.l2); }
  drawHeadwear(ctx, hx, hw, hh, false);
  // braço da frente por cima
  const nearEnd = drawArmSide(ctx, 'near', tBack, tFront);
  drawGearSide(ctx, nearEnd, tBack, tFront);
}
function hairMasksSide(ctx, hx, hw, hh) {
  const { L, cx, hy, B } = ctx; const s = L.hair; const T = hy, Lx = hx, Rx = hx + hw - 1;
  const F = new PxMask(), K = new PxMask();
  const ear = hx + Math.floor(hw * 0.38);
  const cap = (depth = 4, back = 0) => { F.ell(cx + 0.5, T + depth + 1, hw / 2 + 1, depth + 3); F.clipRows(0, T + depth); F.rect(Lx - 1, T + depth, ear - Lx + 1 + back, hh - depth - 4); };
  switch (s) {
    case 'careca': break;
    case 'raspado': F.ell(cx + 0.5, T + 5, hw / 2 + 0.5, 6); F.clipRows(0, T + 3); F.rect(Lx, T + 3, ear - Lx, 6); break;
    case 'curto': case 'grisalho_curto': cap(3); F.span(T + 4, Rx - 5, Rx - 1); break;
    case 'medio': cap(4, 1); F.rect(Lx - 1, T + hh - 4, ear - Lx + 1, 3); F.span(T + 4, Rx - 6, Rx - 1); break;
    case 'longo': case 'ondulado': case 'trancas': cap(4, 1); K.rect(Lx - 2, T + 5, ear - Lx + 3, hh + (B.kid ? 3 : 9)); if (s === 'ondulado') for (let y = T + 5; y < T + hh + 9; y++) K.px(Lx - 3 + Math.round(Math.sin(y / 2)), y); F.span(T + 4, Rx - 6, Rx - 1); break;
    case 'bob': cap(4, 2); F.rect(Lx - 2, T + 4, ear - Lx + 4, hh - 5); F.span(T + 4, Rx - 6, Rx - 1); break;
    case 'franja': cap(4, 1); F.rect(Lx - 1, T + 4, ear - Lx + 3, hh - 5); F.rect(Rx - 6, T + 4, 6, 3); break;
    case 'coque': cap(3); F.ell(Lx + 1, T + 2, 3.5, 3.5); break;
    case 'rabo': cap(3); K.limb([[Lx, T + 5], [Lx - 3, T + 10], [Lx - 3, T + 15]], 3); break;
    case 'cacheado': F.ell(cx - 1, T + 5, hw / 2 + 3, 8); F.clipRows(0, T + 4); F.ell(Lx + 3, T + 9, 6, 8); K.ell(Lx + 2, T + 10, 6, 9); break;
    case 'crespo': F.ell(cx - 1, T + 3, hw / 2 + 4.5, 9); F.clipRows(0, T + 3); F.ell(Lx + 2, T + 6, 7, 8); break;
    case 'topete': cap(3); F.ell(cx + 2, T - 1, hw / 2 - 1, 3.5); F.span(T - 4, cx - 1, cx + 5); F.px(Rx + 1, T - 2).px(Rx + 1, T - 1); break;
    case 'juba': F.ell(cx - 1, T + 3, hw / 2 + 2, 6); F.clipRows(0, T + 3); K.ell(cx - 3, T + hh * 0.55, hw / 2 + 5, hh * 0.55 + 6); for (let k = 0; k < 9; k++) { const a = Math.PI * 0.55 + k * (Math.PI * 1.1 / 8); K.px(cx - 3 + Math.cos(a) * (hw / 2 + 7), T + hh * 0.55 + Math.sin(a) * (hh * 0.55 + 7) * -1); } break;
    case 'calvo_lados': F.rect(Lx - 1, T + 5, ear - Lx + 1, 7); F.rect(ear - 1, T + 4, 2, 3); break;
    default: cap(3);
  }
  // não cobrir olho/rosto: limpa a frente do rosto
  const face = new PxMask(); face.rect(ear + 3, T + 5, Rx - ear, hh); if (!['crespo', 'cacheado', 'juba'].includes(s)) F.sub(face); else { const f2 = new PxMask(); f2.rect(ear + 4, T + 4, Rx - ear, hh); F.sub(f2); }
  return { front: F, back: K };
}
function drawArmSide(ctx, which, tBack, tFront) {
  const { F, L, B, R, frame, pose, walking, tTop, hasCoat, cx } = ctx;
  const far = which === 'far';
  const sleeveR = hasCoat ? R.coat : L.dress ? R.dress : (L.top === 'regata' ? R.skin : R.top);
  const shortSleeve = !hasCoat && (L.top === 'tshirt' || L.scrub || L.gown || L.dress) && L.top !== 'social' && L.top !== 'hoodie';
  const sx = cx - (far ? 2 : 0), sy = tTop + 1; const len = B.th - 1; const aw = B.aw;
  let swing = 0; if (walking) { if (frame === 1) swing = far ? 4 : -4; else if (frame === 3) swing = far ? -4 : 4; }
  let pts;
  if (pose === 'interact' && !far) pts = [[sx, sy], [sx + 3, sy + 5], [sx + 8, sy + 5]];
  else if (pose === 'cast' || (pose === 'victory' && !far)) pts = [[sx, sy], [sx + 2, sy - 6], [sx + 3, sy - 11]];
  else pts = [[sx, sy], [sx + swing * 0.4, sy + Math.round(len * 0.5)], [sx + swing, sy + len - 3]];
  const A = new PxMask();
  if (pose === 'interact' && !far) { A.limb([pts[0], pts[1]], aw); A.rect(pts[1][0] - 1, pts[1][1], pts[2][0] - pts[1][0], aw - 1); }
  else if (pts[2][1] < pts[0][1]) { // braço levantado
    for (let s = 0; s < 2; s++) { const [xa, ya] = pts[s], [xb, yb] = pts[s + 1]; A.line(xa, ya, xb, yb, aw); }
  } else A.limb(pts, aw);
  const end = pts[2];
  const Hd = new PxMask(); Hd.rect(Math.round(end[0] - aw / 2) + (pose === 'interact' && !far ? 0 : 0), end[1] + (pts[2][1] < pts[0][1] ? -2 : 0), Math.max(3, aw), 3);
  if (shortSleeve && pts[2][1] >= pts[0][1]) {
    const sl = A.clone().clipRows(0, sy + 4), sk = A.clone().clipRows(sy + 5, 99);
    paint(F, sk, R.skin, { round: true, lv: far ? -1 : 0 }); paint(F, sl, sleeveR, { round: true, top: true, lv: far ? -1 : 0 });
  } else paint(F, A, sleeveR, { round: true, top: true, lv: far ? -1 : 0 });
  paint(F, Hd, R.skin, { round: true, lv: far ? -1 : 0, edgeLv: -1 });
  if (!far && L.acc === 'caneca' && pose !== 'cast') { const M = new PxMask(); M.rect(end[0] - 1, end[1] - 2, 4, 5); paint(F, M, PAL.ramp('#eeeae4'), { round: true, top: true }); F.set(end[0], end[1] - 2, C('#5a3a1e')); F.set(end[0] + 1, end[1] - 2, C('#6a4428')); }
  if (!far && L.acc === 'celular') { const M = new PxMask(); M.rect(end[0], end[1] - 3, 2, 4); paint(F, M, PAL.ramp('#24242c')); }
  if (!far && L.acc === 'papeis') { const M = new PxMask(); M.rect(end[0] - 1, end[1] - 1, 5, 2); paint(F, M, PAL.ramp('#fbfbf6'), { top: true }); }
  if (!far && L.acc === 'prancheta') { const M = new PxMask(); M.rect(tFront - 1, tTop + 3, 2, 8); paint(F, M, PAL.ramp('#8a5a2b')); }
  return pts[2][1] < pts[0][1] ? [end[0], end[1] - 2] : end;
}
function drawPlagueHeadS(ctx, hx, hw, hh, tFront) {
  const { F, cx, hy, tTop } = ctx; const T = hy;
  const D = PAL.ramp('#2a2630'), Kr = PAL.ramp('#151218'), Le = PAL.ramp('#cdb28a'), Gl = PAL.ramp('#b23b3b');
  const Hood = new PxMask(); Hood.ell(cx, T + hh * 0.55, hw / 2 + 1.5, hh * 0.55 + 1); Hood.rect(cx - hw / 2, T + hh * 0.5, hw, tTop - T - hh * 0.5 + 2); paint(F, Hood, D, { round: true });
  const ey = T + Math.round(hh * 0.5);
  const G = new PxMask(); G.rect(hx + hw - 5, ey - 1, 3, 3); paint(F, G, Gl, { top: true });
  const Beak = new PxMask(); for (let k = 0; k < 10; k++) Beak.span(ey + 1 + Math.floor(k / 3), hx + hw - 3 + k, hx + hw - 3 + k); for (let k = 0; k < 8; k++) Beak.span(ey + 2 + Math.floor(k / 2.5), hx + hw - 3, hx + hw + k - 1); paint(F, Beak, Le, { round: true, top: true });
  const Hat = new PxMask(); Hat.ell(cx, T + 1, hw / 2 + 5, 2.2); Hat.rect(cx - hw / 2 + 2, T - 6, hw - 4, 7); paint(F, Hat, Kr, { round: true, top: true, pat: (x, y) => (y === T - 2 ? 1 : 0) });
}

/* ---------------- API de sprites ---------------- */
SPR.char = function (look, dir, frame, pose) {
  const L = lookDefaults(look);
  pose = pose || 'idle';
  const key = lookKey(L) + '|' + dir + '|' + frame + '|' + pose;
  let cv = SPR.cache.get(key);
  if (cv) return cv;
  const F = drawHumanPx(L, dir, frame, pose);
  cv = document.createElement('canvas'); cv.width = SW; cv.height = SH;
  const c = cv.getContext('2d'); c.putImageData(new ImageData(F.d, SW, SH), 0, 0);
  if (pose === 'hit') { c.globalCompositeOperation = 'source-atop'; c.fillStyle = 'rgba(255,60,60,0.42)'; c.fillRect(0, 0, SW, SH); c.globalCompositeOperation = 'source-over'; }
  if (SPR.cache.size > 4000) SPR.cache.clear();
  SPR.cache.set(key, cv);
  return cv;
};
/* retrato ampliado (diálogos, batalhas, criação). opts.scale segue a escala antiga (sprite 22×32) */
SPR.portrait = function (canvas, look, opts = {}) {
  const c = canvas.getContext('2d');
  c.imageSmoothingEnabled = false;
  c.clearRect(0, 0, canvas.width, canvas.height);
  const sp = SPR.char(look, opts.dir || 0, opts.frame || 0, opts.pose || 'idle');
  let scale = opts.scale ? Math.max(1, Math.round(opts.scale / 2 + 0.01)) : Math.max(1, Math.floor(Math.min(canvas.width / SW, canvas.height / SH)));
  if (opts.crop) scale = Math.max(scale, Math.round(canvas.width / 30));
  const w = SW * scale, h = SH * scale;
  const ox = Math.floor((canvas.width - w) / 2);
  let oy;
  if (opts.crop) { const L = lookDefaults(look); const B = BUILDS[L.build] || BUILDS.normal; const headTop = 61 - B.sh - B.lh - B.th - B.hh + 1; oy = Math.floor(canvas.height * 0.12 - (headTop - 4) * scale); }
  else oy = Math.floor((canvas.height - h) / 2);
  c.drawImage(sp, ox, oy + (opts.dy || 0), w, h);
};

/* ---------- Pacientes deitados e bebês (vista de cima, tile 32) ---------- */
SPR.patientInBed = function (c, x, y, p) {
  const key = 'bed|' + p.skin + p.hairC + p.long + p.blanket;
  let cv = SPR.cache.get(key);
  if (!cv) {
    const F = new PxFrame(32, 64);
    const sk = PAL.ramp(p.skin, 'skin'), hr = PAL.ramp(p.hairC, 'hair'), bl = PAL.ramp(p.blanket || '#9ec7e6');
    const Hm = new PxMask(32, 64); Hm.ell(16, 13, 6.5, 6.5); if (p.long) Hm.rect(9, 12, 14, 9);
    paint(F, Hm, hr, { round: true, top: true, pat: (xx, yy) => (yy === 8 && xx < 16 ? 1 : 0) });
    const Fm = new PxMask(32, 64); Fm.ell(16, 15, 5, 5.5); paint(F, Fm, sk, { round: true });
    F.set(14, 15, sk.d3); F.set(18, 15, sk.d3); F.set(14, 14, sk.d2); F.set(18, 14, sk.d2); F.set(16, 17, sk.d1); F.set(15, 19, sk.d2); F.set(16, 19, sk.d2);
    selOut(F); // contorno só na cabeça
    const Bm = new PxMask(32, 64); Bm.rect(5, 21, 22, 34); for (let k = 0; k < 22; k++) Bm.px(5 + k, 55 + (k % 3 === 0 ? 1 : 0));
    paint(F, Bm, bl, { round: true, top: true, edge: false, pat: (xx, yy) => (yy === 21 || yy === 22 ? 1 : (yy - 21) % 9 === 4 && xx > 7 && xx < 24 ? -1 : (xx === 10 || xx === 21) && yy > 26 ? -1 : 0) });
    const Am = new PxMask(32, 64); Am.rect(6, 25, 3, 9); Am.rect(23, 25, 3, 9); paint(F, Am, sk, { round: true });
    cv = document.createElement('canvas'); cv.width = 32; cv.height = 64; cv.getContext('2d').putImageData(new ImageData(F.d, 32, 64), 0, 0);
    SPR.cache.set(key, cv);
  }
  c.drawImage(cv, x, y);
};
SPR.babyIn = function (c, x, y, p) {
  const key = 'baby|' + p.skin + p.wrap + !!p.ict;
  let cv = SPR.cache.get(key);
  if (!cv) {
    const F = new PxFrame(32, 32);
    const sk = PAL.ramp(p.ict ? PAL.hex(PAL.mix(PAL.rgb(p.skin), [235, 200, 60], 0.35)) : p.skin, 'skin'), wr = PAL.ramp(p.wrap || '#f6d1df');
    const W = new PxMask(32, 32); W.ell(16, 19, 7, 8); paint(F, W, wr, { round: true, top: true, pat: (xx, yy) => ((xx + yy) % 5 === 0 ? -1 : 0) });
    const Hm = new PxMask(32, 32); Hm.ell(16, 11, 5, 5); paint(F, Hm, sk, { round: true });
    F.set(14, 11, sk.d3); F.set(18, 11, sk.d3); F.set(16, 14, sk.d2); F.set(13, 13, PAL.mix(sk.b, [240, 110, 120], 0.4)); F.set(19, 13, PAL.mix(sk.b, [240, 110, 120], 0.4));
    const Cp = new PxMask(32, 32); Cp.ell(16, 8, 5, 3); Cp.clipRows(0, 8); paint(F, Cp, wr, { lv: 1, round: true });
    selOut(F);
    cv = document.createElement('canvas'); cv.width = 32; cv.height = 32; cv.getContext('2d').putImageData(new ImageData(F.d, 32, 32), 0, 0);
    SPR.cache.set(key, cv);
  }
  c.drawImage(cv, x, y);
};

/* =====================================================================
   EQUIPAMENTOS VISÍVEIS: ferramenta na mão, amuleto, cabeça, abadá
   ===================================================================== */
function pxRects(F, ox, oy, rects) { for (const [x, y, w, h, c] of rects) { const col = typeof c === 'string' ? C(c) : c; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) F.set(ox + x + i, oy + y + j, col); } }
// arte das ferramentas, com origem no topo da mão
const TOOL_ART = {
  oximetro: [[-1, -3, 5, 4, '#dfe4e8'], [0, -2, 3, 2, '#14201a'], [0, -2, 1, 1, '#5af08a'], [2, -1, 1, 1, '#ffd84a']],
  termometro: [[1, -6, 2, 8, '#f4f6f7'], [1, -6, 1, 8, '#ffffff'], [1, 1, 2, 2, '#d13b3b'], [1, -3, 2, 2, '#5b8fd6']],
  otoscopio: [[1, -4, 2, 6, '#2b2b33'], [0, -7, 4, 3, '#c9d0d6'], [3, -7, 1, 1, '#ffe68a']],
  martelo: [[2, -7, 1, 8, '#c9d0d6'], [0, -9, 5, 2, '#d13b3b'], [0, -9, 1, 2, '#8e1f1f']],
  seringa: [[1, -7, 2, 7, '#e8f2f8'], [1, -5, 2, 3, '#9fd6ff'], [1, -9, 2, 2, '#3a7bd5'], [2, 0, 1, 3, '#c9d0d6']],
  bisturi: [[2, -6, 1, 7, '#c9d0d6'], [2, -9, 2, 3, '#eef2f5'], [3, -9, 1, 1, '#ffffff']],
  tesoura: [[1, -7, 1, 6, '#d6dce1'], [3, -7, 1, 6, '#d6dce1'], [2, -2, 1, 1, '#7c868f'], [0, -1, 2, 2, '#3a7bd5'], [3, -1, 2, 2, '#3a7bd5']],
  ultrassom: [[-1, -7, 5, 7, '#f2f4f5'], [0, -6, 3, 3, '#101214'], [1, -5, 1, 1, '#9aa3ab'], [-2, 0, 2, 3, '#3b6fb4'], [-1, -1, 1, 1, '#3b6fb4']],
};
const LEFT_ART = {
  caneca: [[-1, -3, 4, 5, '#eeeae4'], [-1, -3, 4, 1, '#5a3a1e'], [-2, -2, 1, 3, '#cfc9c0'], [0, -1, 2, 1, '#2f6fd6']],
  energetico_inf: [[0, -4, 3, 6, '#1d8a4a'], [0, -4, 3, 1, '#c9d0d6'], [0, -2, 3, 2, '#e8f04a'], [0, -4, 1, 6, '#2fb06a']],
  carimbo: [[1, -4, 2, 3, '#7a4b2a'], [0, -1, 4, 2, '#2b2b33'], [0, 1, 4, 1, '#d13b3b']],
  tese: [[-1, -6, 4, 8, '#f3e4c0'], [-1, -6, 4, 1, '#c9a46a'], [-1, 1, 4, 1, '#c9a46a'], [0, -4, 2, 1, '#6a5a4a'], [0, -2, 2, 1, '#6a5a4a']],
  pente: [[0, -6, 2, 9, '#d8cfb8'], [0, -6, 1, 9, '#f4eedd'], [2, -5, 1, 1, '#b8ae96'], [2, -3, 1, 1, '#b8ae96'], [2, -1, 1, 1, '#b8ae96'], [2, 1, 1, 1, '#b8ae96']],
};
function drawGear(ctx, tL, tR, back) {
  const { F, L, B, cx, tTop, tBot, pose, hasCoat } = ctx;
  if (back) { if (L.abada) return; return; }
  if (L.plague) return;
  // crachá preso na roupa quando não há jaleco
  if (L.badge && !hasCoat) {
    const bx = cx - 7, by = tTop + 4, hd = L.badgeGold ? C('#e6b422') : C('#2f6fd6');
    pxRects(F, 0, 0, [[bx + 2, by - 1, 1, 1, '#c9d0d6'], [bx, by, 4, 2, hd], [bx, by + 2, 4, 3, '#fbfbf6'], [bx, by + 2, 1, 1, PAL.ramp(L.hairC).b], [bx, by + 3, 1, 1, L.skin], [bx + 2, by + 3, 2, 1, '#9aa3ab']]);
  }
  const gR = armGeom(ctx, 'R', tL, tR), gL = armGeom(ctx, 'L', tL, tR);
  // ferramenta na mão direita (lado direito da tela)
  if (L.tool && TOOL_ART[L.tool] && pose !== 'cast' && !(pose === 'victory')) {
    const hx = gR.reach ? gR.x - 4 : gR.x, hy = gR.reach ? gR.y + 6 : gR.y + gR.dy + gR.len - 3;
    pxRects(F, hx, hy, TOOL_ART[L.tool]);
  }
  const am = L.amu; if (!am) return;
  const lhx = gL.x, lhy = gL.y + gL.dy + gL.len - 3;
  if (LEFT_ART[am] && pose !== 'cast') pxRects(F, lhx, lhy, LEFT_ART[am]);
  if (am === 'apostila') { const bx = gL.x + 1, by = tTop + 3; pxRects(F, 0, 0, [[bx, by, 6, 8, '#3a7bd5'], [bx + 1, by + 1, 5, 6, '#f4f0e0'], [bx + 2, by + 2, 3, 1, '#9a9a9a'], [bx + 2, by + 4, 3, 1, '#ffd84a'], [bx, by, 1, 8, '#24508f']]); pxRects(F, gL.x, by + 4, [[0, 0, 3, 3, PAL.ramp(L.skin, 'skin').b]]); }
  if (am === 'pendrive') { for (let k = 0; k < 7; k++) { F.set(cx - 4 + Math.round(k * 0.55), tTop + k, C('#c62f2f')); F.set(cx + 3 - Math.round(k * 0.55), tTop + k, C('#c62f2f')); } pxRects(F, cx - 1, tTop + 7, [[0, 0, 2, 4, '#3a7bd5'], [0, 3, 2, 1, '#c9d0d6'], [0, 0, 1, 1, '#ffd84a']]); }
  if (am === 'terco') { for (let k = 0; k < 8; k += 1) { if (k % 2) continue; F.set(cx - 4 + Math.round(k * 0.5), tTop + k, C('#8a5a2b')); F.set(cx + 3 - Math.round(k * 0.5), tTop + k, C('#8a5a2b')); } pxRects(F, cx - 1, tTop + 8, [[1, 0, 1, 4, '#c9a14a'], [0, 1, 3, 1, '#c9a14a']]); }
  if (am === 'chupeta_dourada') { for (let k = 0; k < 7; k++) { F.set(cx - 4 + Math.round(k * 0.55), tTop + k, C('#e6b422')); F.set(cx + 3 - Math.round(k * 0.55), tTop + k, C('#e6b422')); } pxRects(F, cx - 2, tTop + 7, [[0, 0, 4, 3, '#ffd84a'], [1, 1, 2, 1, '#f6b8c8'], [1, 3, 2, 1, '#e6b422']]); }
  if (am === 'juba_leao') pxRects(F, cx + 4, tTop + 2, [[0, 0, 4, 4, '#d99a2b'], [1, 1, 2, 2, '#f3c86a'], [1, 1, 1, 1, '#1b1622']]);
  if (am === 'caneta_tinteiro') pxRects(F, hasCoat ? cx + 4 : cx + 3, tTop + (hasCoat ? 3 : 2), [[0, 0, 1, 4, '#e6b422'], [0, 0, 1, 1, '#fff1a8'], [1, 1, 1, 2, '#1d2a6a']]);
  if (am === 'ritalina') pxRects(F, cx + 3, tBot + 1, [[0, 0, 3, 2, '#f4f4f0'], [0, 0, 2, 2, '#ff7a3a']]);
  if (am === 'barrinha') pxRects(F, cx - 7, tBot + 1, [[0, 0, 4, 2, '#b07a3a'], [1, 0, 2, 2, '#e8e8e8']]);
  if (am === 'medidor_pa') { pxRects(F, gL.x, gL.y + gL.dy + 2, [[0, 0, gL.aw, 3, '#2f5fa8'], [0, 1, gL.aw, 1, '#4f7fd0']]); F.set(gL.x + gL.aw, gL.y + gL.dy + 3, C('#7c868f')); }
}
function drawGearSide(ctx, end, tBack, tFront) {
  const { F, L, tTop, pose, hasCoat } = ctx; if (L.plague || !end) return;
  if (L.tool && TOOL_ART[L.tool] && pose !== 'cast' && pose !== 'victory') pxRects(F, Math.round(end[0]) - 1, end[1], TOOL_ART[L.tool]);
  if (L.badge && !hasCoat) pxRects(F, tFront - 2, tTop + 4, [[0, 0, 2, 2, L.badgeGold ? '#e6b422' : '#2f6fd6'], [0, 2, 2, 2, '#fbfbf6']]);
  const am = L.amu;
  if (am === 'pendrive') pxRects(F, tFront - 1, tTop + 1, [[0, 0, 1, 5, '#c62f2f'], [0, 5, 1, 3, '#3a7bd5']]);
  if (am === 'terco') pxRects(F, tFront - 1, tTop + 1, [[0, 0, 1, 1, '#8a5a2b'], [0, 2, 1, 1, '#8a5a2b'], [0, 4, 1, 1, '#8a5a2b'], [0, 6, 1, 3, '#c9a14a']]);
  if (am === 'chupeta_dourada') pxRects(F, tFront - 1, tTop + 1, [[0, 0, 1, 5, '#e6b422'], [0, 5, 2, 3, '#ffd84a']]);
  if (am === 'juba_leao') pxRects(F, tFront - 2, tTop + 2, [[0, 0, 2, 3, '#d99a2b']]);
  if (am === 'apostila') pxRects(F, tFront - 2, tTop + 4, [[0, 0, 3, 8, '#3a7bd5'], [2, 1, 1, 6, '#f4f0e0']]);
}
function drawHeadItem(ctx, hx, hw, hh, back) {
  const { F, L, cx, hy, view } = ctx; const T = hy, side = view === 's', ey = hy + Math.round(hh * 0.52);
  const it = L.head;
  if (L.hairpin) { // tridente dourado da Dra. Gertrudes usado como prendedor
    const x0 = side ? hx + 3 : hx + hw - 5, y0 = T - 3;
    pxRects(F, x0, y0, [[1, 0, 1, 6, '#e6b422'], [0, 0, 1, 2, '#e6b422'], [2, 0, 1, 2, '#e6b422'], [0, 2, 3, 1, '#c99a1a'], [1, 0, 1, 1, '#fff1a8']]);
  }
  if (!it) return;
  if (it === 'fone') {
    const band = C('#2b2b33'), cup = PAL.ramp('#e05a9a');
    if (!side) {
      for (let x = hx + 3; x <= hx + hw - 4; x++) F.set(x, T - 2, band);
      F.set(hx + 2, T - 1, band); F.set(hx + 1, T, band); F.set(hx + hw - 3, T - 1, band); F.set(hx + hw - 2, T, band);
      for (let y = T + 1; y < ey - 2; y++) { F.set(hx, y, band); F.set(hx + hw - 1, y, band); }
      for (const x0 of [hx - 3, hx + hw - 1]) { const M = new PxMask(); M.rect(x0, ey - 3, 4, 6); paint(F, M, cup, { round: true, top: true }); }
    } else {
      const ear = hx + Math.floor(hw * 0.38);
      for (let y = T - 1; y < ey - 2; y++) F.set(ear + 1, y, band); for (let x = ear - 2; x <= ear + 3; x++) F.set(x, T - 2, band);
      const M = new PxMask(); M.rect(ear - 1, ey - 3, 5, 6); paint(F, M, cup, { round: true, top: true });
    }
  }
  if (it === 'bone_atletica') {
    const R = PAL.ramp('#1d3a9a'); const M = new PxMask(); M.ell(cx + (side ? 0 : 0), T + 4, hw / 2 + 1.5, 6.5); M.clipRows(0, T + 3);
    paint(F, M, R, { round: true, top: true, pat: (x, y) => ((x - cx) % 5 === 0 && y > T - 1 ? -1 : 0) });
    if (!side && !back) { const Br = new PxMask(); Br.span(T + 4, hx - 1, hx + hw); Br.span(T + 5, hx, hx + hw - 1); paint(F, Br, PAL.ramp('#16307f'), { top: true }); pxRects(F, cx - 2, T, [[0, 0, 4, 2, '#ffffff'], [1, 0, 2, 1, '#e05a5a']]); }
    if (side) { const Br = new PxMask(); Br.rect(hx + hw - 3, T + 3, 7, 2); paint(F, Br, PAL.ramp('#16307f'), { top: true }); F.set(hx + hw - 4, T + 1, C('#ffffff')); }
    if (back) { F.set(cx - 1, T + 3, C('#1b1622')); F.set(cx, T + 3, C('#1b1622')); }
  }
  if (it === 'oculos_protecao') {
    const fr = C('#3a3d46');
    if (back) { for (let x = hx; x < hx + hw; x++) F.set(x, ey - 1, fr); return; }
    if (!side) {
      for (let y = ey - 2; y <= ey + 2; y++) for (let x = hx + 1; x <= hx + hw - 2; x++) {
        const edge = y === ey - 2 || y === ey + 2 || x === hx + 1 || x === hx + hw - 2 || x === cx - 1 || x === cx;
        F.set(x, y, edge ? (y === ey - 2 ? C('#5a5e68') : fr) : PAL.mix(F.get(x, y), [190, 228, 242], 0.38));
      }
      F.set(hx + 3, ey - 1, C('#ffffff')); F.set(cx + 2, ey - 1, C('#ffffff')); F.set(hx, ey - 1, fr); F.set(hx + hw - 1, ey - 1, fr);
    } else {
      const ex = hx + hw - 6;
      for (let y = ey - 2; y <= ey + 2; y++) for (let x = ex; x <= ex + 5; x++) { const edge = y === ey - 2 || y === ey + 2 || x === ex + 5; F.set(x, y, edge ? fr : PAL.mix(F.get(x, y), [190, 228, 242], 0.38)); }
      for (let x = hx + 1; x < ex; x++) F.set(x, ey - 1, fr); F.set(ex + 2, ey - 1, C('#ffffff'));
    }
  }
  if (it === 'tiara_carnaval') {
    const band = C('#2b2b33');
    const ants = side ? [[hx + 5, -1], [hx + hw - 5, 1]] : [[hx + 4, -1], [hx + hw - 5, 1]];
    if (!side) for (let x = hx + 2; x <= hx + hw - 3; x++) F.set(x, T - 1, band); else for (let x = hx + 3; x <= hx + hw - 4; x++) F.set(x, T - 1, band);
    ants.forEach(([ax, d], k) => {
      for (let y = 0; y < 6; y++) F.set(ax + Math.round(d * y * 0.4), T - 2 - y, band);
      const bx = ax + Math.round(d * 2.4) - 1, by = T - 10; const col = k ? '#ffd84a' : '#ff6ab0';
      const M = new PxMask(); M.rect(bx, by, 3, 3); paint(F, M, PAL.ramp(col), { top: true, round: true }); F.set(bx, by, C('#ffffff'));
    });
  }
}
// estampas de camiseta: caveira (calouro), camisa verde de time e camisa alvinegra de time (sem escudo)
function drawPrint(ctx, tL, tR, back) {
  const { F, L, cx, tTop, tBot } = ctx;
  const W = C('#f4f4f0'), Wd = C('#c9c9cf'), K = C('#16161b');
  if (L.print === 'caveira') {
    if (back) return;
    const art = ['..XXXXX..', '.XXXXXXX.', 'XXXXXXXXX', 'XX..X..XX', 'XX..X..XX', 'XXXX.XXXX', '.XXX.XXX.', '..X.X.X..', '..XXXXX..'];
    const ox = cx - 5, oy = tTop + 3;
    art.forEach((row, j) => [...row].forEach((v, i) => { if (v === 'X') F.set(ox + i, oy + j, (i === 0 || j === 0 || (i === 1 && j < 3)) ? W : (j > 6 ? Wd : W)); }));
    for (const [i, j] of [[-1, 8], [9, 8], [-2, 9], [10, 9], [9, 0], [-1, 0], [10, -1], [-2, -1]]) F.set(ox + i, oy + j, Wd); // ossos cruzados
    return;
  }
  const time = L.print === 'verdao' ? { trim: W, dark: C('#145a2e') } : { trim: K, dark: C('#d8d8d2') };
  if (!back) {
    // gola em V e acabamento nos ombros
    for (let k = 0; k < 4; k++) { F.set(cx - 4 + k, tTop + k, time.trim); F.set(cx + 3 - k, tTop + k, time.trim); }
    for (let y = tTop + 1; y < tBot - 1; y += 1) if ((y - tTop) % 2 === 0) { F.set(tL + 1, y, time.dark); F.set(tR - 1, y, time.dark); }
    for (let x = tL + 1; x <= tR - 1; x++) F.set(x, tBot - 2, time.trim);
    if (L.print === 'alvinegro') for (let x = cx - 5; x <= cx + 4; x++) F.set(x, tTop + 6, time.trim);   // listra no peito
  } else {
    // número 10 nas costas
    const g = { '1': ['010', '110', '010', '010', '111'], '0': ['111', '101', '101', '101', '111'] };
    ['1', '0'].forEach((d, k) => g[d].forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') F.set(cx - 4 + k * 4 + i, tTop + 3 + j, time.trim); })));
  }
}
function drawAbada(ctx, tL, tR, back) {
  const { F, B, cx, tTop, tBot } = ctx;
  const red = C('#d13b3b'), redD = C('#9e2424'), blue = C('#2f5fa8');
  if (!back) {
    // faixa diagonal e logotipo da Atlética
    for (let y = tTop + 1; y < tBot - 1; y++) { const x = tL + 1 + Math.round((y - tTop) * (B.tw - 3) / (tBot - tTop)); F.set(x, y, red); F.set(x + 1, y, red); F.set(x + 2, y, redD); }
    pxRects(F, cx - 6, tTop + 3, [[0, 0, 4, 3, blue], [1, 1, 2, 1, '#ffffff']]);
    for (let x = tL + 1; x <= tR - 1; x++) if ((x + tBot) % 3 === 0) F.set(x, tBot - 1, C('#fff1a8'));
  } else {
    // número nas costas
    const g = { '2': ['111', '001', '111', '100', '111'], '1': ['010', '110', '010', '010', '111'] };
    ['2', '1'].forEach((d, k) => g[d].forEach((row, j) => [...row].forEach((v, i) => { if (v === '1') F.set(cx - 4 + k * 4 + i, tTop + 3 + j, red); })));
  }
}
