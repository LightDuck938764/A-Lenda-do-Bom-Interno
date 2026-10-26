
'use strict';
/* =====================================================================
   A LENDA DO BOM INTERNO — núcleo: constantes, balanceamento, utilidades
   ===================================================================== */
const GAME_TITLE = 'A Lenda do Bom Interno';
const HOSPITAL_NOME = 'Hospital Escola Santa Esperança';
const MOEDA = 'Moedas de Plantão';
const MOEDA_CURTA = 'MP';
const SAVE_KEY = 'lendaBomInterno_save_v1';            // Modo Internato (campanha)
const SAVE_KEY_VEST = 'lendaBomInterno_save_vest_v1';  // Modo Vestibulando (mapa aberto e online)
const SAVE_VERSION = 1;
const TS = 32;            // tamanho do tile em pixels (arte em densidade 32 bits)
const VW = 640, VH = 360; // resolução interna do canvas

const AREAS = {
  upa: { id: 'upa', nome: 'Urgência e Emergência', curto: 'UPA', map: 'upa', chefe: 'leozao', cor: '#41b883', icone: '✚', local: 'UPA 29 de Maio' },
  ped: { id: 'ped', nome: 'Pediatria', curto: 'PED', map: 'ped', chefe: 'sueli', cor: '#f4b942', icone: '★', local: 'Ala Pediátrica' },
  go:  { id: 'go',  nome: 'Ginecologia e Obstetrícia', curto: 'GO', map: 'go', chefe: 'sheila', cor: '#e2738c', icone: '♥', local: 'Centro Obstétrico' },
  cm:  { id: 'cm',  nome: 'Clínica Médica', curto: 'CM', map: 'cm', chefe: 'vladimir', cor: '#5b8def', icone: '◆', local: 'Enfermaria de Clínica Médica' },
  cir: { id: 'cir', nome: 'Cirurgia', curto: 'CIR', map: 'cir', chefe: 'laercio', cor: '#9fd3e8', icone: '✂', local: 'Centro Cirúrgico' },
  ubs: { id: 'ubs', nome: 'Atenção Básica', curto: 'UBS', map: 'ubs', chefe: 'martinho', cor: '#3f8fd6', icone: '⌂', local: 'UBS Maria das Dores' },
};
const AREA_IDS = ['upa', 'ped', 'go', 'cm', 'cir', 'ubs'];
// Alas da Clínica Médica (cada caso de CM tem 'ala' com uma destas chaves)
const ALAS_CM = {
  cardio: { nome: 'Cardiologia', placa: 'CARDIOLOGIA', cor: '#c0392b', manta: '#f2dede' },
  pneumo: { nome: 'Pneumologia', placa: 'PNEUMOLOGIA', cor: '#2f7fb8', manta: '#dcebf5' },
  endocrino: { nome: 'Endocrinologia', placa: 'ENDOCRINOLOGIA', cor: '#8e5bb8', manta: '#ece2f5' },
  gastro: { nome: 'Gastroenterologia', placa: 'GASTROENTEROLOGIA', cor: '#c77d1f', manta: '#f5e8d4' },
  hepato: { nome: 'Hepatologia', placa: 'HEPATOLOGIA', cor: '#7a8f1f', manta: '#eef2d6' },
  hemato: { nome: 'Hematologia', placa: 'HEMATOLOGIA', cor: '#a3243b', manta: '#f5dfe4' },
  infecto: { nome: 'Infectologia', placa: 'INFECTOLOGIA', cor: '#1f8f6a', manta: '#d9f0e6' },
  nefro: { nome: 'Nefrologia', placa: 'NEFROLOGIA', cor: '#c4a21b', manta: '#f5efd2' },
  neuro: { nome: 'Neurologia', placa: 'NEUROLOGIA', cor: '#3f5fc4', manta: '#dfe4f5' },
  psiq: { nome: 'Psiquiatria', placa: 'PSIQUIATRIA', cor: '#4f9a8f', manta: '#dcefe9' },
  reumato: { nome: 'Reumatologia', placa: 'REUMATOLOGIA', cor: '#b85b8f', manta: '#f5e0ec' },
};
const N_ESTAGIOS_TXT = 'seis';

/* ---------------- Balanceamento centralizado ---------------- */
const BAL = {
  // escala da Reputação do Interno: de -1000 (Mal Interno) a +1000 (Bom Interno); os pontos ganhos por ação não mudaram
  repMin: -1000, repMax: 1000,
  // multiplicador de XP: 1,0 na neutralidade, 1,5 em +1000, 0,6 em -1000
  xpMult(rep) { return rep >= 0 ? 1 + 0.5 * rep / 1000 : Math.max(0.6, 1 + 0.4 * rep / 1000); },
  coinMult(rep) { return rep >= 0 ? 1 + 0.3 * rep / 1000 : Math.max(0.7, 1 + 0.3 * rep / 1000); },
  dropMult(rep) { return rep >= 0 ? Math.min(2, 1 + rep / 1000) : Math.max(0.5, 1 + rep / 2000); },
  // inimigos ficam mais fortes com reputação negativa
  enemyMult(rep) { return rep < 0 ? 1 + 0.35 * (-rep) / 1000 : 1; },
  // fração de palavras borradas na anamnese
  blurRate(rep) { return rep < -100 ? Math.min(0.28, (-rep - 100) / 3200) : 0; },
  maxLevel: 40,
  xpForLevel(L) { let t = 0; for (let i = 1; i < L; i++) t += Math.round(50 * Math.pow(i, 1.45) + 30); return t; },
  caseXP: { 1: 40, 2: 60, 3: 85 },
  caseCoins: { 1: 12, 2: 18, 3: 26 },
  caseTime: { 1: 150, 2: 130, 3: 115 },
  caseRep: { // [dxCerto, dxErrado, cdCerta, cdErrada]
    1: [2, -2, 2, -2], 2: [2, -2, 3, -3], 3: [3, -3, 4, -5],
  },
  speedBonusFrac: 0.5,     // usar menos de 50% do tempo
  dropChanceCase: 0.02,    // 2% em casos comuns
  dropChanceSide: 0.03,
  dropChanceRival: 0.10,
  sideInterval: [70, 120], // segundos de exploração entre missões espontâneas
  eventInterval: [150, 240],
  psyInterval: [100, 170], // emergências (e crises psicóticas na UPA) perto do jogador, em segundos de exploração
  psyTime: 30,             // segundos para atender
  psyPenalty: 50,          // reputação perdida se ninguém atender a tempo
  prioMult: 3,             // "Priorizar Temas": peso extra dos temas mais errados
  maxSideActive: 2,
  energyRegen: 1 / 5,      // energia por segundo explorando
  investigateCost: 3,
  sellFactor: 0.4,
};

/* ---------------- Utilidades ---------------- */
const U = {
  clamp: (v, a, b) => Math.max(a, Math.min(b, v)),
  rnd: (a, b) => a + Math.random() * (b - a),
  ri: (a, b) => Math.floor(a + Math.random() * (b - a + 1)),
  pick: arr => arr[Math.floor(Math.random() * arr.length)],
  shuffle(arr) { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; },
  fmtTime(s) { s = Math.max(0, Math.round(s)); const m = Math.floor(s / 60); return m + ':' + String(s % 60).padStart(2, '0'); },
  fmtHM(s) { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60); return (h ? h + 'h ' : '') + m + 'min'; },
  esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); },
  el(tag, cls, html) { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; },
  shade(hex, amt) { // amt -1..1
    let c = hex.replace('#', ''); if (c.length === 3) c = c.split('').map(x => x + x).join('');
    let r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
    if (amt < 0) { r *= 1 + amt; g *= 1 + amt; b *= 1 + amt; } else { r += (255 - r) * amt; g += (255 - g) * amt; b += (255 - b) * amt; }
    return '#' + [r, g, b].map(v => Math.round(U.clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  },
  weighted(list) { const t = list.reduce((s, x) => s + x.w, 0); let r = Math.random() * t; for (const x of list) { if ((r -= x.w) <= 0) return x; } return list[list.length - 1]; },
  dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); },
};

/* ---------------- Áudio sintetizado (sem arquivos externos) ---------------- */
const SFX = {
  ctx: null, on: true,
  init() { if (this.ctx) return; try { this.ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { this.ctx = null; } },
  tone(freq, dur, type = 'square', vol = 0.06, slide = 0, delay = 0) {
    if (!this.on || !this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + delay;
      const o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      if (slide) o.frequency.linearRampToValueAtTime(Math.max(30, freq + slide), t0 + dur);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0008, t0 + dur);
      o.connect(g); g.connect(this.ctx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch (e) { /* ignora */ }
  },
  play(name) {
    switch (name) {
      case 'step': this.tone(110, 0.03, 'triangle', 0.025); break;
      case 'talk': this.tone(520 + Math.random() * 80, 0.03, 'square', 0.02); break;
      case 'ui': this.tone(660, 0.05, 'square', 0.035); break;
      case 'ok': this.tone(660, 0.08, 'square', 0.05); this.tone(990, 0.12, 'square', 0.05, 0, 0.08); break;
      case 'bad': this.tone(220, 0.18, 'sawtooth', 0.05, -80); break;
      case 'quest': this.tone(523, 0.08, 'triangle', 0.06); this.tone(659, 0.08, 'triangle', 0.06, 0, 0.09); this.tone(784, 0.14, 'triangle', 0.06, 0, 0.18); break;
      case 'coin': this.tone(988, 0.05, 'square', 0.04); this.tone(1319, 0.1, 'square', 0.04, 0, 0.05); break;
      case 'door': this.tone(180, 0.1, 'triangle', 0.05, 60); break;
      case 'hit': this.tone(160, 0.12, 'sawtooth', 0.07, -100); break;
      case 'skill': this.tone(400, 0.25, 'triangle', 0.05, 500); break;
      case 'boss': this.tone(98, 0.5, 'sawtooth', 0.06, -30); this.tone(73, 0.6, 'square', 0.04, 0, 0.3); break;
      case 'win': [523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.16, 'square', 0.05, 0, i * 0.12)); break;
      case 'lose': [392, 330, 262, 196].forEach((f, i) => this.tone(f, 0.2, 'triangle', 0.05, 0, i * 0.15)); break;
      case 'coffee': this.tone(300, 0.3, 'triangle', 0.03, -120); this.tone(200, 0.2, 'triangle', 0.03, 50, 0.25); break;
      case 'printer': for (let i = 0; i < 5; i++) this.tone(140 + (i % 2) * 40, 0.06, 'square', 0.03, 0, i * 0.07); break;
      case 'level': [392, 523, 659, 784, 1046].forEach((f, i) => this.tone(f, 0.12, 'square', 0.05, 0, i * 0.08)); break;
      case 'alarm': for (let i = 0; i < 3; i++) this.tone(880, 0.1, 'square', 0.04, 0, i * 0.2); break;
    }
  },
};

/* ---------------- Toasts ---------------- */
function toast(msg, kind = '') {
  const box = document.getElementById('toasts'); if (!box) return;
  const t = U.el('div', 'toast ' + kind, msg);
  box.appendChild(t);
  setTimeout(() => t.classList.add('out'), 3400);
  setTimeout(() => t.remove(), 3900);
  while (box.children.length > 5) box.firstChild.remove();
}
