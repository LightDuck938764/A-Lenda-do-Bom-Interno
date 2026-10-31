/* =====================================================================
   PIXEL ART PROGRAMÁTICO — personagens, ícones, fonte 3x5 e utilidades
   ===================================================================== */
const SPR = { cache: new Map(), iconCache: new Map() };

const SKIN_TONES = ['#f6d7c3', '#efc3a4', '#e0ac7e', '#c98e5f', '#a8693f', '#8a5230', '#6b3d22', '#4a2a17'];
const HAIR_COLORS = ['#1d1612', '#3a2414', '#6b3e1f', '#a0622d', '#d9a441', '#efd89a', '#9a9a9a', '#e8e8e8', '#b8325a', '#3c5fb8'];
const HAIR_STYLES = { raspado: 'Raspado', curto: 'Curto', medio: 'Médio', longo: 'Longo liso', ondulado: 'Ondulado', cacheado: 'Cacheado', crespo: 'Crespo volumoso', coque: 'Coque', rabo: 'Rabo de cavalo', franja: 'Franja', trancas: 'Tranças', careca: 'Careca', bob: 'Chanel' };
const SHIRT_OPTIONS = [
  { id: 'branca', nome: 'Camiseta branca', top: 'tshirt', c: '#f2f2ee' }, { id: 'preta', nome: 'Camiseta preta', top: 'tshirt', c: '#2a2a30' },
  { id: 'azul', nome: 'Camiseta azul', top: 'tshirt', c: '#3d6fd1' }, { id: 'cinza', nome: 'Camiseta cinza', top: 'tshirt', c: '#8a9099' },
  { id: 'social', nome: 'Camisa social', top: 'social', c: '#cfe0f5' }, { id: 'verde', nome: 'Camiseta verde', top: 'tshirt', c: '#3fa66b' },
  { id: 'vinho', nome: 'Camiseta vinho', top: 'tshirt', c: '#8c2d43' }, { id: 'amarela', nome: 'Camiseta amarela', top: 'tshirt', c: '#e9c13b' },
  { id: 'rosa', nome: 'Blusa rosa', top: 'tshirt', c: '#e88aa8' }, { id: 'lilas', nome: 'Blusa lilás', top: 'tshirt', c: '#9b7fd1' },
];
const PANTS_OPTIONS = [
  { id: 'preta', nome: 'Calça preta', c: '#24242b' }, { id: 'azul', nome: 'Calça jeans', c: '#2f4f86' },
  { id: 'cinza', nome: 'Calça cinza', c: '#6a6f78' }, { id: 'bege', nome: 'Calça bege', c: '#c4a77d' }, { id: 'branca', nome: 'Calça branca', c: '#e8e8e2' },
  { id: 'saia', nome: 'Saia escura', c: '#33354a', skirt: true },
];
const SHOE_OPTIONS = [{ id: 'preto', nome: 'Tênis preto', c: '#262626' }, { id: 'branco', nome: 'Tênis branco', c: '#ececec' }, { id: 'marrom', nome: 'Sapato marrom', c: '#5a3a22' }, { id: 'croc', nome: 'Crocs azul', c: '#3b7bd8' }];
const LIGA_COLORS = { 'Vermelho': '#c8313b', 'Verde': '#2f9e5b', 'Roxo': '#7a4cc4', 'Laranja': '#e57a2e', 'Preto': '#2b2b33', 'Rosa': '#e06aa0' };


/* aplica contorno escuro em pixels transparentes vizinhos de pixels opacos */
function outlineCanvas(cv) {
  const c = cv.getContext('2d');
  const img = c.getImageData(0, 0, cv.width, cv.height), d = img.data, w = cv.width, h = cv.height;
  const op = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) op[i] = d[i * 4 + 3] > 0 ? 1 : 0;
  const oc = [0x1b, 0x16, 0x22];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (op[i]) continue;
    if ((x > 0 && op[i - 1]) || (x < w - 1 && op[i + 1]) || (y > 0 && op[i - w]) || (y < h - 1 && op[i + w])) {
      d[i * 4] = oc[0]; d[i * 4 + 1] = oc[1]; d[i * 4 + 2] = oc[2]; d[i * 4 + 3] = 255;
    }
  }
  c.putImageData(img, 0, 0);
}

/* =====================================================================
   FONTE 3x5 PARA PLACAS
   ===================================================================== */
const FONT3 = {
  A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111', F: '111100110100100', G: '011100101101011',
  H: '101101111101101', I: '111010010010111', J: '001001001101010', K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101',
  O: '010101101101010', P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010', U: '101101101101111',
  V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010', Z: '111001010100111',
  '0': '111101101101111', '1': '010110010010111', '2': '110001010100111', '3': '110001010001110', '4': '101101111001001', '5': '111100110001110',
  '6': '011100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001110', '-': '000000111000000', '.': '000000000000010',
  ':': '000010000010000', '!': '010010010000010', '/': '001001010100100', '+': '000010111010000', ' ': '000000000000000', "'": '010010000000000',
};
function pixText(c, txt, x, y, col, scale = 1) {
  txt = String(txt).normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase();
  c.fillStyle = col;
  let cx = x;
  for (const ch of txt) {
    const g = FONT3[ch] || FONT3[' '];
    for (let i = 0; i < 15; i++) if (g[i] === '1') c.fillRect(cx + (i % 3) * scale, y + Math.floor(i / 3) * scale, scale, scale);
    cx += 4 * scale;
  }
  return cx - x;
}
function pixTextW(txt, scale = 1) { return String(txt).length * 4 * scale - scale; }

/* =====================================================================
   ÍCONES DE ITENS 16x16
   ===================================================================== */
SPR.icon = function (key, size = 32) {
  const ck = key + '|' + size;
  if (SPR.iconCache.has(ck)) return SPR.iconCache.get(ck);
  const cv = document.createElement('canvas'); cv.width = 16; cv.height = 16;
  const c = cv.getContext('2d');
  const P = (x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x, y, w, h); };
  switch (key) {
    case 'steth': P(4, 2, 1, 6, '#2d77c9'); P(10, 2, 1, 6, '#2d77c9'); P(4, 8, 7, 1, '#2d77c9'); P(7, 8, 1, 4, '#2d77c9'); P(6, 11, 4, 3, '#c9d0d6'); P(7, 12, 2, 1, '#8a949c'); P(3, 1, 2, 1, '#555'); P(10, 1, 2, 1, '#555'); break;
    case 'oxi': P(3, 4, 10, 8, '#e8e8e8'); P(4, 5, 8, 4, '#173a2a'); P(5, 6, 3, 2, '#5af08a'); P(9, 6, 2, 2, '#f0d05a'); P(6, 10, 4, 2, '#4a7fd1'); break;
    case 'termo': P(7, 1, 2, 11, '#e8e8e8'); P(7, 5, 2, 7, '#d73b3b'); P(6, 11, 4, 4, '#d73b3b'); P(9, 3, 3, 1, '#888'); break;
    case 'oto': P(3, 6, 6, 4, '#2b2b33'); P(9, 7, 4, 2, '#cfd6dc'); P(13, 7, 2, 2, '#ffe68a'); P(4, 10, 3, 5, '#2b2b33'); break;
    case 'martelo': P(3, 3, 7, 3, '#e05a5a'); P(3, 3, 2, 3, '#b83a3a'); P(7, 6, 2, 9, '#c9d0d6'); break;
    case 'seringa': P(2, 7, 9, 3, '#e8f2f8'); P(3, 8, 5, 1, '#9fd6ff'); P(11, 8, 4, 1, '#c9d0d6'); P(0, 6, 2, 5, '#888'); break;
    case 'bisturi': P(2, 9, 8, 2, '#c9d0d6'); P(10, 7, 4, 3, '#e8edf1'); P(13, 6, 1, 2, '#e8edf1'); P(2, 9, 8, 1, '#9aa3ab'); break;
    case 'tesoura': P(3, 3, 1, 8, '#c9d0d6'); P(5, 3, 1, 8, '#c9d0d6'); P(4, 10, 1, 1, '#555'); P(2, 11, 3, 3, '#3a7bd5'); P(5, 11, 3, 3, '#3a7bd5'); P(3, 12, 1, 1, '#0000'); break;
    case 'usg': P(2, 2, 12, 9, '#dfe5ea'); P(3, 3, 10, 6, '#111'); P(5, 4, 5, 4, '#6c6c6c'); P(6, 5, 3, 2, '#bbb'); P(5, 11, 6, 2, '#9aa3ab'); P(10, 12, 3, 3, '#3b6fb4'); break;
    case 'jaleco': case 'jaleco_h': P(3, 2, 10, 13, '#f4f6f7'); P(7, 2, 2, 8, '#cfe0f5'); P(3, 2, 2, 10, '#e4e8ea'); P(10, 5, 2, 2, '#2f6fd6'); if (key === 'jaleco_h') { P(4, 4, 2, 2, '#2f6fd6'); P(3, 14, 10, 1, '#2f6fd6'); } break;
    case 'pijama': P(3, 2, 10, 8, '#4f8fd6'); P(6, 2, 4, 2, '#2f6fb6'); P(4, 10, 3, 5, '#4f8fd6'); P(9, 10, 3, 5, '#4f8fd6'); break;
    case 'esteril': P(3, 3, 10, 12, '#8fc4e8'); P(5, 0, 6, 3, '#4f8fd6'); P(6, 3, 4, 2, '#cfe7f5'); break;
    case 'liga': P(3, 2, 10, 8, '#c8313b'); P(6, 2, 4, 2, '#8e1f28'); P(4, 10, 3, 5, '#c8313b'); P(9, 10, 3, 5, '#c8313b'); P(9, 4, 2, 2, '#fff'); break;
    case 'peste': P(4, 1, 8, 3, '#151218'); P(2, 4, 12, 1, '#151218'); P(5, 5, 6, 4, '#3a3440'); P(9, 7, 5, 2, '#cdb28a'); P(6, 6, 1, 1, '#b23b3b'); P(4, 9, 8, 6, '#2a2630'); break;
    case 'pendrive': P(4, 5, 7, 6, '#3a7bd5'); P(11, 6, 3, 4, '#c9d0d6'); P(5, 6, 3, 1, '#ffd84a'); P(5, 8, 4, 1, '#fff'); break;
    case 'energetico': case 'lata': P(5, 2, 6, 12, '#1d8a4a'); P(5, 2, 6, 1, '#c9d0d6'); P(5, 13, 6, 1, '#c9d0d6'); P(6, 5, 4, 4, '#e8f04a'); P(7, 6, 1, 2, '#1d8a4a'); break;
    case 'pa': P(2, 4, 8, 7, '#2b4a7a'); P(3, 5, 6, 3, '#9fe0ff'); P(4, 6, 2, 1, '#173a2a'); P(10, 6, 4, 6, '#3a3a44'); P(9, 11, 2, 3, '#555'); break;
    case 'barrinha': P(2, 6, 12, 4, '#b07a3a'); P(2, 6, 12, 1, '#e6c08a'); P(5, 6, 6, 4, '#e8e8e8'); P(6, 7, 4, 2, '#d13b3b'); break;
    case 'abada': P(3, 2, 10, 10, '#ffcc33'); P(3, 2, 3, 3, '#0000'); P(10, 2, 3, 3, '#0000'); P(5, 5, 6, 3, '#d13b3b'); P(6, 12, 4, 2, '#ffcc33'); break;
    case 'caneca': P(3, 4, 8, 10, '#f0f0f0'); P(11, 6, 3, 5, '#f0f0f0'); P(12, 7, 1, 3, '#0000'); P(3, 4, 8, 2, '#5a3a1e'); P(5, 8, 4, 3, '#2f6fd6'); break;
    case 'carimbo': P(5, 2, 6, 6, '#7a4b2a'); P(4, 8, 8, 3, '#2b2b33'); P(3, 11, 10, 3, '#d13b3b'); break;
    case 'fone': P(3, 3, 10, 2, '#2b2b33'); P(2, 4, 2, 6, '#2b2b33'); P(12, 4, 2, 6, '#2b2b33'); P(1, 8, 4, 5, '#e05a9a'); P(11, 8, 4, 5, '#e05a9a'); break;
    case 'terco': for (let i = 0; i < 8; i++) P(3 + Math.round(5 + 4 * Math.cos(i * 0.8)) - 3, 2 + Math.round(4 + 4 * Math.sin(i * 0.8)), 2, 2, '#c9a14a'); P(7, 11, 1, 4, '#c9a14a'); P(6, 12, 3, 1, '#c9a14a'); break;
    case 'tenis': P(2, 8, 11, 4, '#f0f0f0'); P(2, 12, 12, 2, '#d13b3b'); P(5, 8, 1, 3, '#3a7bd5'); P(8, 8, 1, 3, '#3a7bd5'); P(2, 6, 4, 2, '#f0f0f0'); break;
    case 'apostila': P(3, 2, 10, 12, '#f4f0e0'); P(3, 2, 2, 12, '#3a7bd5'); P(6, 4, 6, 1, '#888'); P(6, 6, 5, 1, '#ffd84a'); P(6, 8, 6, 1, '#888'); P(8, 11, 3, 2, '#d1a06a'); break;
    case 'juba': P(3, 3, 10, 10, '#d99a2b'); P(5, 5, 6, 6, '#f3c86a'); P(6, 7, 1, 1, '#1b1622'); P(9, 7, 1, 1, '#1b1622'); P(7, 9, 2, 1, '#7a2c2c'); break;
    case 'chupeta': P(5, 3, 6, 6, '#ffd84a'); P(6, 4, 4, 4, '#f6b8c8'); P(3, 9, 10, 3, '#ffd84a'); P(7, 12, 2, 2, '#ffd84a'); break;
    case 'tridente': P(7, 4, 2, 11, '#ffd84a'); P(3, 2, 2, 5, '#ffd84a'); P(11, 2, 2, 5, '#ffd84a'); P(3, 6, 10, 2, '#ffd84a'); P(7, 1, 2, 3, '#ffd84a'); break;
    case 'caneta': P(3, 11, 2, 2, '#ffd84a'); P(4, 3, 9, 2, '#1d2a6a'); P(4, 4, 8, 7, '#0000'); for (let i = 0; i < 8; i++) P(4 + i, 11 - i, 2, 2, '#1d2a6a'); P(3, 12, 1, 1, '#ffd84a'); break;
    case 'sapato': P(2, 8, 10, 4, '#f4f4f4'); P(12, 10, 3, 2, '#f4f4f4'); P(2, 12, 13, 1, '#c9d0d6'); P(2, 6, 4, 2, '#f4f4f4'); break;
    case 'cracha': P(4, 2, 8, 12, '#ffd84a'); P(5, 4, 6, 4, '#f4f4f0'); P(7, 5, 2, 2, '#8a5a2b'); P(5, 9, 6, 1, '#1d2a6a'); P(5, 11, 4, 1, '#1d2a6a'); P(7, 0, 2, 2, '#888'); break;
    case 'cafe': P(4, 5, 8, 9, '#f0f0f0'); P(4, 5, 8, 2, '#5a3a1e'); P(5, 2, 1, 2, '#ddd'); P(8, 1, 1, 3, '#ddd'); P(12, 7, 2, 4, '#f0f0f0'); break;
    case 'cafe2': P(4, 5, 8, 9, '#b7c2a0'); P(4, 5, 8, 2, '#3a2a14'); P(6, 9, 4, 2, '#5a6a3a'); P(5, 2, 1, 2, '#9cb06a'); break;
    case 'coxinha': P(5, 3, 6, 2, '#d68a3a'); P(4, 5, 8, 4, '#d68a3a'); P(3, 9, 10, 4, '#d68a3a'); P(5, 6, 2, 2, '#e8a85a'); P(7, 2, 2, 1, '#b86a2a'); break;
    case 'touca': P(2, 5, 12, 7, '#3fa66b'); P(3, 4, 10, 2, '#4fb87b'); P(4, 7, 2, 2, '#f2c84a'); P(9, 6, 2, 2, '#e05a9a'); P(7, 9, 2, 2, '#ffffff'); P(12, 10, 3, 2, '#3fa66b'); break;
    case 'bone': P(3, 4, 10, 6, '#1d3a9a'); P(4, 3, 8, 2, '#2f4fb8'); P(1, 9, 14, 3, '#16307f'); P(6, 5, 4, 3, '#ffffff'); P(7, 6, 2, 1, '#1d3a9a'); break;
    case 'oculos': P(1, 6, 14, 1, '#3a3d46'); P(2, 5, 5, 5, '#bfe4f2'); P(9, 5, 5, 5, '#bfe4f2'); P(3, 6, 2, 1, '#ffffff'); P(10, 6, 2, 1, '#ffffff'); P(7, 7, 2, 1, '#3a3d46'); break;
    case 'tiara': P(2, 12, 12, 2, '#2b2b33'); P(4, 5, 1, 7, '#2b2b33'); P(11, 5, 1, 7, '#2b2b33'); P(3, 2, 3, 3, '#ff6ab0'); P(10, 2, 3, 3, '#ffd84a'); P(3, 2, 1, 1, '#ffffff'); P(10, 2, 1, 1, '#ffffff'); break;
    case 'empada': P(3, 7, 10, 6, '#d9a35a'); P(4, 5, 8, 3, '#e8b86a'); P(5, 6, 6, 1, '#f2d08a'); P(3, 12, 10, 1, '#b07a3a'); for (let k = 0; k < 4; k++) P(4 + k * 2, 13, 1, 1, '#b07a3a'); P(7, 4, 2, 1, '#c88a4a'); break;
    case 'enroladinho': P(2, 6, 12, 5, '#e0a050'); P(2, 7, 12, 3, '#f0c070'); P(4, 6, 1, 5, '#b8783a'); P(8, 6, 1, 5, '#b8783a'); P(12, 6, 1, 5, '#b8783a'); P(0, 7, 2, 3, '#c0504a'); P(14, 7, 2, 3, '#c0504a'); break;
    case 'paoqueijo': P(3, 5, 10, 7, '#f0c46a'); P(4, 4, 8, 1, '#f0c46a'); P(5, 6, 2, 2, '#ffe0a0'); P(9, 8, 2, 2, '#d89a3a'); break;
    case 'coco': P(3, 4, 10, 10, '#4a8a3a'); P(5, 5, 6, 3, '#6aaa4a'); P(9, 1, 1, 5, '#f0f0f0'); break;
    case 'bala': P(5, 5, 6, 6, '#e8b04a'); P(2, 6, 3, 4, '#e8e0c0'); P(11, 6, 3, 4, '#e8e0c0'); break;
    case 'marmita': P(2, 6, 12, 7, '#c9d0d6'); P(2, 5, 12, 2, '#9aa3ab'); P(4, 8, 3, 3, '#f0f0e8'); P(7, 8, 3, 3, '#6a3a1e'); P(10, 8, 2, 3, '#4a8a3a'); break;
    case 'clipe': P(5, 2, 1, 11, '#9aa3ab'); P(10, 2, 1, 11, '#9aa3ab'); P(5, 2, 6, 1, '#9aa3ab'); P(5, 12, 6, 1, '#9aa3ab'); P(7, 4, 1, 7, '#9aa3ab'); break;
    case 'luva': P(4, 6, 8, 8, '#9fd0e8'); P(4, 2, 2, 5, '#9fd0e8'); P(6, 1, 2, 5, '#9fd0e8'); P(8, 2, 2, 5, '#9fd0e8'); P(10, 4, 2, 4, '#9fd0e8'); break;
    case 'tampa': P(6, 3, 4, 9, '#3a7bd5'); P(7, 2, 2, 1, '#3a7bd5'); P(6, 10, 1, 1, '#1d4a8a'); P(9, 8, 1, 1, '#1d4a8a'); break;
    case 'adesivo': P(3, 3, 10, 10, '#e05a9a'); P(5, 5, 6, 6, '#fff'); P(7, 6, 2, 4, '#e05a9a'); P(6, 7, 4, 2, '#e05a9a'); break;
    case 'resma': P(2, 4, 12, 9, '#f8f8f4'); P(2, 4, 12, 3, '#3a7bd5'); P(4, 5, 8, 1, '#fff'); P(2, 12, 12, 1, '#c9d0d6'); break;
    case 'papeis': P(3, 2, 9, 12, '#f8f8f4'); P(5, 4, 8, 11, '#ececE4'); P(6, 6, 5, 1, '#888'); P(6, 8, 5, 1, '#888'); P(6, 10, 3, 1, '#888'); break;
    case 'prontuario': P(3, 2, 10, 12, '#3a7bd5'); P(4, 3, 8, 10, '#f8f8f4'); P(5, 5, 6, 1, '#888'); P(5, 7, 6, 1, '#888'); P(6, 1, 4, 2, '#c9d0d6'); break;
    case 'carregador': P(4, 2, 6, 6, '#f0f0f0'); P(5, 0, 1, 2, '#c9d0d6'); P(8, 0, 1, 2, '#c9d0d6'); P(6, 8, 2, 6, '#f0f0f0'); P(6, 13, 4, 2, '#f0f0f0'); break;
    case 'pergaminho': P(3, 3, 10, 10, '#f3e4c0'); P(2, 2, 12, 2, '#c9a46a'); P(2, 12, 12, 2, '#c9a46a'); P(5, 5, 6, 1, '#6a5a4a'); P(5, 7, 5, 1, '#6a5a4a'); P(5, 9, 6, 1, '#6a5a4a'); P(10, 10, 2, 2, '#c0392b'); break;
    case 'caderno': P(3, 2, 10, 12, '#8a5a2b'); P(4, 3, 8, 10, '#f3e4c0'); P(5, 5, 6, 1, '#555'); P(5, 7, 5, 1, '#555'); P(9, 9, 2, 2, '#d13b3b'); break;
    default: P(3, 3, 10, 10, '#888'); P(6, 6, 4, 4, '#ccc');
  }
  // volume automático + contorno seletivo (estilo 32 bits)
  { const img = c.getImageData(0, 0, 16, 16), d = img.data; const op = (x, y) => x >= 0 && y >= 0 && x < 16 && y < 16 && d[(y * 16 + x) * 4 + 3] > 0; const src = new Uint8ClampedArray(d);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { if (!op(x, y)) continue; const i = (y * 16 + x) * 4; let k = 0; if (!op(x, y - 1) || !op(x - 1, y)) k = 0.16; if (!op(x, y + 1) || !op(x + 1, y)) k = -0.18; if (k) for (let q = 0; q < 3; q++) d[i + q] = k > 0 ? src[i + q] + (255 - src[i + q]) * k : src[i + q] * (1 + k); }
    const F = { w: 16, h: 16, d, get(x, y) { const i = (y * 16 + x) * 4; return [d[i], d[i + 1], d[i + 2]]; }, set(x, y, col) { const i = (y * 16 + x) * 4; d[i] = col[0]; d[i + 1] = col[1]; d[i + 2] = col[2]; d[i + 3] = 255; } };
    selOut(F); c.putImageData(img, 0, 0); }
  const out = document.createElement('canvas'); out.width = size; out.height = size;
  const oc = out.getContext('2d'); oc.imageSmoothingEnabled = false; oc.drawImage(cv, 0, 0, size, size);
  SPR.iconCache.set(ck, out);
  return out;
};
SPR.iconURL = function (key, size = 32) { return SPR.icon(key, size).toDataURL(); };

/* =====================================================================
   VISUAIS DOS PERSONAGENS (aparências fixas de NPCs)
   ===================================================================== */
const LOOKS = {
  leozao: { skin: '#c98e5f', hair: 'juba', hairC: '#b8772c', build: 'grande', top: 'social', topC: '#d6c7a6', tie: '#6b3e1f', bottomC: '#3a3a44', shoes: '#3a2a1e', pointy: true, coat: 'jaleco', badge: false, eyes: 'sleepy', acc: 'caneca', eyebags: true },
  leozao_fera: { skin: '#c98e5f', hair: 'juba', hairC: '#e09a2a', build: 'grande', top: 'social', topC: '#d6c7a6', tie: '#6b3e1f', bottomC: '#3a3a44', shoes: '#3a2a1e', pointy: true, coat: 'jaleco', eyes: 'glow', mouth: 'frown' },
  sueli: { skin: '#efc3a4', hair: 'coque', hairC: '#c4c4cc', build: 'baixo', fem: true, old: true, top: 'tshirt', topC: '#c86b98', dress: '#7a4a8a', shoes: '#4a2a3a', coat: 'jaleco', glasses: 'meia', eyes: 'angry', mouth: 'frown' },
  sheila: { skin: '#f0c9a8', hair: 'bob', hairC: '#f27ab8', build: 'magro', fem: true, old: true, makeup: true, top: 'tshirt', topC: '#8e1f2b', dress: '#5a1520', shoes: '#1d1a1e', pointy: true, coat: 'jaleco', horns: true, eyes: 'angry', mouth: 'lips' },
  vladimir: { skin: '#e8b98f', hair: 'topete', hairC: '#151015', build: 'alto', eyeC: '#3a6a9a', lashes: true, top: 'social', topC: '#e8eef8', tie: '#7a1d34', bottomC: '#20202a', shoes: '#151015', pointy: true, coat: 'jaleco', mouth: 'smile', facial: null },
  martinho: { skin: '#efc3a4', hair: 'curto', hairC: '#4a3020', build: 'largo', top: 'social', topC: '#24242b', bottomC: '#24242b', shoes: '#151015', coat: 'jaleco', tool: 'martelo', amu: 'tese', mouth: 'normal' },
  martinho_reforma: { skin: '#efc3a4', hair: 'curto', hairC: '#4a3020', build: 'largo', top: 'social', topC: '#24242b', bottomC: '#24242b', shoes: '#151015', coat: 'jaleco', tool: 'martelo', amu: 'tese', eyes: 'glow', mouth: 'frown' },
  laercio: { skin: '#efc3a4', hair: 'calvo_lados', hairC: '#ececec', build: 'alto', old: true, top: 'social', topC: '#ffffff', tie: '#f4f4f4', bottomC: '#f4f4f4', shoes: '#ffffff', pointy: true, coat: 'jaleco', eyes: 'angry', mouth: 'frown', glasses: 'ouro' },
  rodolfo: { skin: '#d9a07a', hair: 'calvo_lados', hairC: '#3a2414', build: 'largo', top: 'tshirt', topC: '#e8e4d8', bottomC: '#3a3a44', shoes: '#4a3020', facial: 'bigode', apron: '#a8432f', acc: 'pano', mouth: 'smile' },
  cida: { skin: '#a8693f', hair: 'coque', hairC: '#2a1e18', build: 'largo', top: 'tshirt', topC: '#f4f4f0', bottomC: '#3a3a44', apron: '#3fa66b', cap: '#f4f4f0', mouth: 'smile' },
  // residentes (todos diferentes)
  res_bruno: { skin: '#e0ac7e', hair: 'curto', hairC: '#3a2414', scrub: '#3f8f74', shoes: '#ececec', eyebags: true, acc: 'caneca' },
  res_tati: { skin: '#8a5230', hair: 'crespo', hairC: '#1d1612', top: 'hoodie', topC: '#5b5f8f', bottomC: '#2f4f86', shoes: '#ececec', acc: 'celular' },
  res_rafa: { skin: '#f6d7c3', hair: 'ondulado', hairC: '#a0622d', top: 'tshirt', topC: '#e9c13b', bottomC: '#24242b', shoes: '#262626', acc: 'prancheta', glasses: 'preta' },
  res_julia: { skin: '#c98e5f', hair: 'rabo', hairC: '#1d1612', scrub: '#c86b98', shoes: '#3b7bd8', eyebags: true, acc: 'papeis' },
  res_igor: { skin: '#6b3d22', hair: 'raspado', hairC: '#1d1612', top: 'tshirt', topC: '#2a2a30', bottomC: '#6a6f78', shoes: '#ececec', facial: 'barba', acc: 'caneca', build: 'largo' },
  res_lu: { skin: '#efc3a4', hair: 'franja', hairC: '#d9a441', scrub: '#4f8fd6', shoes: '#ececec', acc: 'prancheta' },
  res_davi: { skin: '#e0ac7e', hair: 'cacheado', hairC: '#3a2414', top: 'tshirt', topC: '#3fa66b', bottomC: '#2f4f86', shoes: '#262626', eyebags: true, acc: 'celular' },
  res_marina: { skin: '#a8693f', hair: 'trancas', hairC: '#1d1612', scrub: '#7a4cc4', shoes: '#ececec', acc: 'caneca' },
  res_kenji: { skin: '#efc3a4', hair: 'medio', hairC: '#1d1612', top: 'hoodie', topC: '#8c2d43', bottomC: '#24242b', shoes: '#ececec', glasses: 'preta', eyebags: true },
  res_paula: { skin: '#f6d7c3', hair: 'longo', hairC: '#6b3e1f', scrub: '#3f8f74', shoes: '#3b7bd8', acc: 'papeis' },
  // equipe
  enf_ana: { skin: '#c98e5f', hair: 'coque', hairC: '#1d1612', scrub: '#f2f2f2', shoes: '#ececec', mouth: 'smile' },
  enf_jose: { skin: '#8a5230', hair: 'raspado', hairC: '#1d1612', scrub: '#5aa0d8', shoes: '#ececec' },
  tec_jussara: { skin: '#e0ac7e', hair: 'bob', hairC: '#6b3e1f', scrub: '#e88aa8', shoes: '#ececec', mouth: 'smile' },
  recep: { skin: '#efc3a4', hair: 'longo', hairC: '#3a2414', top: 'social', topC: '#3fa66b', bottomC: '#24242b', shoes: '#262626' },
  seguranca: { skin: '#6b3d22', hair: 'raspado', hairC: '#1d1612', top: 'social', topC: '#24242b', bottomC: '#24242b', shoes: '#151015', build: 'largo' },
  limpeza: { skin: '#a8693f', hair: 'curto', hairC: '#9a9a9a', scrub: '#4a6a8a', shoes: '#262626' },
  instrumentador: { skin: '#e0ac7e', hair: 'curto', hairC: '#3a2414', scrub: '#4f8fd6', cap: '#4f8fd6', mask: true, shoes: '#ececec' },
  anestesista: { skin: '#c98e5f', hair: 'curto', hairC: '#1d1612', scrub: '#3f8f74', cap: '#3f8f74', mask: true, shoes: '#ececec', glasses: 'preta' },
  // rivais
  rival_thiago: { skin: '#e0ac7e', hair: 'topete', hairC: '#6b3e1f', top: 'tshirt', topC: '#e57a2e', bottomC: '#24242b', coat: 'jaleco', badge: true, shoes: '#ececec', mouth: 'smile' },
  rival_marcela: { skin: '#f6d7c3', hair: 'rabo', hairC: '#b8325a', top: 'tshirt', topC: '#9b7fd1', bottomC: '#2f4f86', coat: 'jaleco', badge: true, shoes: '#ececec', glasses: 'preta' },
  rival_caio: { skin: '#a8693f', hair: 'curto', hairC: '#1d1612', top: 'social', topC: '#cfe0f5', bottomC: '#6a6f78', coat: 'jaleco', badge: true, shoes: '#262626', glasses: 'preta', eyebags: true },
  rival_lara: { skin: '#e0ac7e', hair: 'coque', hairC: '#1d1612', scrub: '#4f8fd6', coat: 'jaleco', badge: true, shoes: '#3b7bd8', eyes: 'angry' },
  rival_bruna: { skin: '#6b3d22', hair: 'cacheado', hairC: '#1d1612', top: 'tshirt', topC: '#e88aa8', bottomC: '#24242b', coat: 'jaleco', badge: true, shoes: '#ececec', mouth: 'smile' },
};
// pacientes e acompanhantes gerados de forma variada
function randomCivilLook(seed, tipo) {
  let s = seed; const r = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const pick = a => a[Math.floor(r() * a.length)];
  const fem = tipo === 'gestante' ? true : r() > 0.5;
  const kid = tipo === 'crianca' || tipo === 'bebe';
  const L = { skin: pick(SKIN_TONES), hair: pick(fem ? ['longo', 'rabo', 'coque', 'cacheado', 'bob', 'ondulado', 'crespo', 'trancas'] : (kid ? ['curto', 'raspado', 'cacheado', 'crespo', 'medio'] : ['curto', 'raspado', 'curto', 'cacheado', 'careca', 'medio', 'crespo'])),
    hairC: pick(HAIR_COLORS.slice(0, 6)), top: pick(['tshirt', 'tshirt', 'hoodie', 'social']), topC: pick(['#d13b3b', '#3a7bd5', '#3fa66b', '#e9c13b', '#8c2d43', '#5b5f8f', '#e88aa8', '#f2f2ee', '#2a2a30', '#d68a3a', '#4fb3b0', '#9b7fd1']),
    bottomC: pick(['#2f4f86', '#24242b', '#6a6f78', '#c4a77d', '#3a5f3a']), shoes: pick(['#262626', '#ececec', '#5a3a22', '#d13b3b']), fem };
  if (tipo === 'idoso') { L.hairC = pick(['#9a9a9a', '#e8e8e8', '#c4c4c4']); L.glasses = r() > 0.5 ? 'preta' : null; L.old = true; if (!fem && r() > 0.5) L.hair = 'calvo_lados'; }
  if (tipo === 'crianca') { L.build = 'crianca'; L.blush = true; L.top = 'tshirt'; }
  if (tipo === 'bebe') { L.build = 'crianca'; L.blush = true; L.hair = pick(['raspado', 'curto']); L.top = 'tshirt'; L.topC = pick(['#f6d1df', '#cfe6f5', '#fff3b0']); L.bottomC = L.topC; L.facial = null; L.mouth = 'normal'; }
  if (tipo === 'adolescente') { L.build = 'adolescente'; if (L.hair === 'careca') L.hair = 'curto'; }
  if (tipo === 'gestante') { L.build = 'normal'; L.preg = true; L.dress = pick(['#e88aa8', '#9b7fd1', '#3a7bd5', '#f2c27a']); }
  if (fem && r() > 0.6 && !kid) L.mouth = 'lips';
  if (!fem && !kid && tipo !== 'adolescente' && r() > 0.7) L.facial = pick(['bigode', 'barba', 'cavanhaque']);
  if (fem && !kid && r() > 0.5) L.skirt = r() > 0.5 && !L.dress;
  return L;
}
