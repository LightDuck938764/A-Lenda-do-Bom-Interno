/* =====================================================================
   ITENS, EQUIPAMENTOS, AMULETOS, CONSUMÍVEIS E ÁRVORES DE HABILIDADES
   ===================================================================== */
const RARIDADES = {
  comum:    { nome: 'Comum', cor: '#b9c2cc' },
  incomum:  { nome: 'Incomum', cor: '#62d26f' },
  raro:     { nome: 'Raro', cor: '#4aa8ff' },
  epico:    { nome: 'Épico', cor: '#b46cff' },
  lendario: { nome: 'Lendário', cor: '#ffb52e' },
};
const EQUIP_SLOTS = ['mao', 'cabeca', 'corpo', 'amuleto'];
const CAT_NOME = { mao: 'Arma/Ferramenta', cabeca: 'Cabeça', corpo: 'Corpo', amuleto: 'Amuleto', consumivel: 'Consumível', missao: 'Item de missão', material: 'Material diverso' };
const STAT_NOME = { vida: 'Vida', energia: 'Energia', foco: 'Foco', conhecimento: 'Conhecimento', precisao: 'Precisão', resistencia: 'Resistência', influencia: 'Influência', velocidade: 'Velocidade' };

const ITEMS = {};
function IT(id, o) { o.id = id; o.stats = o.stats || {}; o.fx = o.fx || {}; ITEMS[id] = o; }

/* ---------- Armas / ferramentas (slot mão) ---------- */
IT('estetoscopio', { nome: 'Estetoscópio', cat: 'mao', rar: 'comum', preco: 60, icon: 'steth', loja: true,
  desc: 'Clássico. Pendurado no pescoço, transmite autoridade e permite ouvir o que o paciente não diz.',
  efeito: '+1 Conhecimento. Em casos com exame físico relevante: +10s e pista revelada.',
  stats: { conhecimento: 1 }, fx: { toolTags: ['ef'] } });
IT('oximetro', { nome: 'Oxímetro de Pulso', cat: 'mao', rar: 'comum', preco: 70, icon: 'oxi', loja: true,
  desc: 'Pisca, apita e às vezes mede a saturação do dedo errado.',
  efeito: '+1 Foco. Casos respiratórios ou de monitorização: +10s e pista revelada.',
  stats: { foco: 1 }, fx: { toolTags: ['resp', 'mon'] } });
IT('termometro', { nome: 'Termômetro Digital', cat: 'mao', rar: 'comum', preco: 40, icon: 'termo', loja: true,
  desc: 'Bipa em 30 segundos. Ou em 4 minutos. Depende do humor.',
  efeito: 'Casos com febre ou infecção: +10s e pista revelada.',
  stats: {}, fx: { toolTags: ['febre', 'infec'] } });
IT('otoscopio', { nome: 'Otoscópio', cat: 'mao', rar: 'incomum', preco: 95, icon: 'oto', loja: true,
  desc: 'A luz que as crianças mais temem. Mais que a injeção.',
  efeito: '+1 Influência. Casos pediátricos: +8s. Casos de ouvido/vias aéreas superiores: pista revelada.',
  stats: { influencia: 1 }, fx: { toolTags: ['ouvido', 'ivas'], areaTime: { ped: 8 } } });
IT('martelo', { nome: 'Martelo de Reflexos', cat: 'mao', rar: 'incomum', preco: 85, icon: 'martelo', loja: true,
  desc: 'Martelinho de borracha. O neurologista interior desperta.',
  efeito: '+1 Precisão. Casos neurológicos: +10s e pista revelada. +5 de dano em duelos.',
  stats: { precisao: 1 }, fx: { toolTags: ['neuro'], combatDmg: 5 } });
IT('seringa', { nome: 'Seringa de Treinamento', cat: 'mao', rar: 'comum', preco: 75, icon: 'seringa', loja: true,
  desc: 'Vazia, estéril e simbólica. Usada em manequins do laboratório de habilidades.',
  efeito: '+2 Precisão. Procedimentos de punção/coleta: zona de acerto +15%.',
  stats: { precisao: 2 }, fx: { procTags: ['puncao'], procZone: 0.15 } });
IT('bisturi', { nome: 'Bisturi Cabo nº 4', cat: 'mao', rar: 'incomum', preco: 150, icon: 'bisturi', loja: true,
  desc: 'Afiado. O R3 de cirurgia diz que você ainda não é digno.',
  efeito: '+3 Precisão. Casos cirúrgicos: +6s. Procedimentos cirúrgicos: zona de acerto +15%.',
  stats: { precisao: 3 }, fx: { procTags: ['cir'], procZone: 0.15, areaTime: { cir: 6 } } });
IT('tesoura', { nome: 'Tesoura de Metzenbaum', cat: 'mao', rar: 'incomum', preco: 130, icon: 'tesoura', loja: true,
  desc: 'Delicada. Não serve para cortar fio. Nunca. O instrumentador avisou.',
  efeito: '+2 Precisão, +1 Conhecimento. Minigames de instrumentação: zona +20% e um material revelado.',
  stats: { precisao: 2, conhecimento: 1 }, fx: { procTags: ['instrum'], procZone: 0.2, procHint: true } });
IT('ultrassom', { nome: 'Ultrassom Portátil', cat: 'mao', rar: 'raro', preco: 1200, icon: 'usg', loja: false, raroLoja: true, req: { nivel: 7 },
  desc: 'O sonho de consumo do plantão. Cabe no bolso do jaleco (que rasga).',
  efeito: '+2 Conhecimento, +2 Precisão. Casos com ultrassom pertinente: +15s e laudo extra revelado. Não resolve o caso sozinho.',
  stats: { conhecimento: 2, precisao: 2 }, fx: { toolTags: ['usg'], usgExtra: true, tagTime: 15 } });

/* ---------- Corpo ---------- */
IT('jaleco_padrao', { nome: 'Jaleco Padrão Branco', cat: 'corpo', rar: 'comum', preco: 30, icon: 'jaleco', visual: 'jaleco', loja: true,
  desc: 'O jaleco do primeiro dia. Ainda sem mancha de café. Por enquanto.',
  efeito: 'Atributos neutros. Identificação básica de interno.', stats: {} });
IT('jaleco_hosp', { nome: 'Jaleco do Hospital', cat: 'corpo', rar: 'incomum', preco: 140, icon: 'jaleco_h', visual: 'jaleco_hosp', loja: true,
  desc: 'Bordado com o brasão do Santa Mamãezinha. Os seguranças agora te cumprimentam.',
  efeito: '+2 Influência. Ganhos de reputação +15%.', stats: { influencia: 2 }, fx: { repGainMult: 0.15 } });
IT('pijama_cir', { nome: 'Pijama Cirúrgico', cat: 'corpo', rar: 'comum', preco: 120, icon: 'pijama', visual: 'pijama', loja: true,
  desc: 'Confortável, azul, com bolso que some com a sua caneta.',
  efeito: '+1 Resistência. Casos de Cirurgia: +8s. Procedimentos: zona +8%.', stats: { resistencia: 1 }, fx: { areaTime: { cir: 8 }, procZoneAll: 0.08 } });
IT('roupa_esteril', { nome: 'Roupa Estéril de Cirurgia', cat: 'corpo', rar: 'raro', preco: 320, icon: 'esteril', visual: 'esteril', loja: true, req: { nivel: 4 },
  desc: 'Avental, gorro, máscara e um silêncio reverente. Não encoste em nada.',
  efeito: '+3 Precisão, +2 Resistência. Procedimentos cirúrgicos: zona +20% e penalidade por erro de segurança pela metade.',
  stats: { precisao: 3, resistencia: 2 }, fx: { procTags: ['cir', 'instrum'], procZone: 0.2, safetyHalf: true } });
IT('pijama_liga', { nome: 'Pijama de Liga Acadêmica', cat: 'corpo', rar: 'incomum', preco: 110, icon: 'liga', visual: 'liga', loja: true, cores: true,
  desc: 'Da Liga de Emergência, de Pediatria ou de Qualquer Coisa. Escolha sua cor.',
  efeito: '+3 Influência. Recompensas de missões secundárias +10%.', stats: { influencia: 3 }, fx: { sideRewardMult: 0.1 } });
IT('peste', { nome: 'Roupa de Médico da Peste', cat: 'corpo', rar: 'epico', preco: 900, icon: 'peste', visual: 'peste', loja: false, raroLoja: true, req: { nivel: 6 },
  desc: 'Fantasia histórica com máscara de bico. Item de fantasia: não protege de nada, mas assusta os rivais.',
  efeito: '+6 Resistência. Duelos e chefes: o primeiro ataque inimigo causa 50% menos dano (intimidação). -2 Influência.',
  stats: { resistencia: 6, influencia: -2 }, fx: { firstHitHalf: true } });

/* ---------- Cabeça ---------- */
IT('touca_estampada', { nome: 'Touca Cirúrgica Estampada', cat: 'cabeca', rar: 'incomum', preco: 110, icon: 'touca', loja: true,
  desc: 'Estampa de bichinhos. O anestesista elogiou. O Dr. Leôncio, não.',
  efeito: '+2 Precisão. Procedimentos: zona de acerto +5%.', stats: { precisao: 2 }, fx: { procZoneAll: 0.05 } });
IT('bone_atletica', { nome: 'Boné da Atlética', cat: 'cabeca', rar: 'comum', preco: 70, icon: 'bone', loja: true,
  desc: 'Bordado "MEDICINA" na frente. Fora do centro cirúrgico, por favor.',
  efeito: '+2 Influência.', stats: { influencia: 2 } });
IT('oculos_protecao', { nome: 'Óculos de Proteção', cat: 'cabeca', rar: 'incomum', preco: 130, icon: 'oculos', loja: true,
  desc: 'EPI de verdade: protege os olhos de respingos. Embaça com a máscara, como manda a tradição.',
  efeito: '+2 Resistência, +1 Precisão.', stats: { resistencia: 2, precisao: 1 } });
IT('tiara_carnaval', { nome: 'Tiara de Anteninhas', cat: 'cabeca', rar: 'comum', preco: 60, icon: 'tiara', loja: true,
  desc: 'Sobrou do bloquinho da faculdade. As crianças da Pediatria amam.',
  efeito: '+3 Influência, -1 Foco. Casos pediátricos: +5s.', stats: { influencia: 3, foco: -1 }, fx: { areaTime: { ped: 5 } } });

/* ---------- Amuletos ---------- */
IT('pendrive', { nome: 'Pendrive com Colinhas', cat: 'amuleto', rar: 'raro', preco: 240, icon: 'pendrive', loja: true,
  desc: 'Resumos de 2014 com marca-texto amarelo. Ainda funciona, por milagre.',
  efeito: '+25% de chance de pista automática nos casos. Borrões da reputação negativa reduzidos em 50%.',
  stats: { conhecimento: 1 }, fx: { autoClue: 0.25, blurReduce: 0.5 } });
IT('energetico_inf', { nome: 'Energético Infinito', cat: 'amuleto', rar: 'raro', preco: 300, icon: 'energetico', loja: true,
  desc: 'Uma lata que nunca esvazia. Os cientistas não sabem explicar. Nem o seu coração.',
  efeito: 'Regeneração de energia x2. Habilidades custam 20% menos energia. Penalidade: -1 Precisão (tremor).',
  stats: { precisao: -1 }, fx: { energyRegenMult: 1, skillEnergyMult: -0.2 } });
IT('ritalina', { nome: '"Ritalina" do RPG', cat: 'amuleto', rar: 'epico', preco: 380, icon: 'ritalina', loja: true, req: { nivel: 6 },
  desc: 'ITEM SATÍRICO E FICTÍCIO. Paródia de RPG — no mundo real, medicação só com prescrição e acompanhamento médico. Nada de automedicação.',
  efeito: '+4 Foco. Casos: +15s. Penalidade: -2 Influência (você fala rápido demais).',
  stats: { foco: 4, influencia: -2 }, fx: { timeBonus: 15 } });
IT('medidor_pa', { nome: 'Medidor de Pressão Automático', cat: 'amuleto', rar: 'incomum', preco: 160, icon: 'pa', loja: true,
  desc: 'Infla sozinho, aperta o braço e emite um bipe de aprovação.',
  efeito: 'Casos cardiovasculares, de choque ou monitorização: pista revelada e +8s.',
  stats: { foco: 1 }, fx: { toolTags: ['cardio', 'choque', 'pa'] } });
IT('barrinha', { nome: 'Barrinha de Proteína', cat: 'amuleto', rar: 'comum', preco: 80, icon: 'barrinha', loja: true,
  desc: 'Sabor "cookies". Textura "isopor". Funciona.',
  efeito: '+10 Energia máxima, +1 Resistência. Em batalhas, quando a energia cai abaixo de 10, recupera 20 automaticamente (1x).',
  stats: { energia: 10, resistencia: 1 }, fx: { autoBar: true } });
IT('abada', { nome: 'Abadá da Atlética', cat: 'corpo', rar: 'incomum', preco: 120, icon: 'abada', visual: 'abada', loja: true,
  desc: 'Ainda com glitter do InterMed. Abre portas e conversas.',
  efeito: '+4 Influência. Missões sociais (família, acompanhamento) rendem +20%.',
  stats: { influencia: 4 }, fx: { socialMult: 0.2 } });
IT('caneca', { nome: 'Caneca da Atlética', cat: 'amuleto', rar: 'comum', preco: 90, icon: 'caneca', loja: true,
  desc: 'Capacidade: 500 ml. Missão: sobreviver.',
  efeito: '+1 Influência. Missões de café +30% de recompensa. Café recupera 50% mais energia.',
  stats: { influencia: 1 }, fx: { coffeeMult: 0.3, coffeeEnergy: 0.5 } });
IT('carimbo', { nome: 'Carimbo do Residente', cat: 'amuleto', rar: 'incomum', preco: 150, icon: 'carimbo', loja: true,
  desc: 'Você não deveria ter isso. Ninguém sabe como chegou ao seu bolso.',
  efeito: '+2 Influência. Missões burocráticas: uma etapa é concluída automaticamente.',
  stats: { influencia: 2 }, fx: { adminAuto: true } });
IT('fone', { nome: 'Fone com Lo-fi de Estudo', cat: 'cabeca', rar: 'incomum', preco: 140, icon: 'fone', loja: true,
  desc: 'Beats relaxantes para estudar e ser cobrado.',
  efeito: '+4 Resistência, +1 Foco.', stats: { resistencia: 4, foco: 1 } });
IT('terco', { nome: 'Terço da Vó', cat: 'amuleto', rar: 'raro', preco: 260, icon: 'terco', loja: true,
  desc: '"Leva, meu filho, que hospital é lugar de muita energia." — Vó.',
  efeito: 'Perdas de reputação reduzidas em 25%. +2 Resistência.',
  stats: { resistencia: 2 }, fx: { repLossMult: -0.25 } });
IT('tenis', { nome: 'Tênis de Plantão', cat: 'amuleto', rar: 'comum', preco: 100, icon: 'tenis', loja: true,
  desc: 'Amortecimento máximo para 36 horas de corredor.',
  efeito: 'Velocidade de caminhada +12%.', stats: { velocidade: 12 } });
IT('apostila', { nome: 'Apostila Amassada do R3', cat: 'amuleto', rar: 'raro', preco: 280, icon: 'apostila', loja: true,
  desc: 'Anotações em três cores de caneta e uma mancha de molho.',
  efeito: '+3 Conhecimento, +1 Foco.', stats: { conhecimento: 3, foco: 1 } });

/* ---------- Recompensas exclusivas de chefes ---------- */
IT('juba_leao', { nome: 'Juba do Leão (Broche)', cat: 'amuleto', rar: 'lendario', preco: 0, icon: 'juba', unico: true, vendavel: false,
  desc: 'Entregue pelo próprio Leão. "Cê passou... no meu teste... de verdade."',
  efeito: '+3 Foco, +3 Resistência. Casos de urgência: +12s.', stats: { foco: 3, resistencia: 3 }, fx: { areaTime: { upa: 12 } } });
IT('chupeta_dourada', { nome: 'Chupeta Dourada da Dra. Xuxa', cat: 'amuleto', rar: 'lendario', preco: 0, icon: 'chupeta', unico: true, vendavel: false,
  desc: '"Não é pra você usar. É pra você lembrar de pesar a criança."',
  efeito: '+3 Conhecimento, +2 Influência. Casos pediátricos: pista automática.', stats: { conhecimento: 3, influencia: 2 }, fx: { areaClue: 'ped' } });
IT('tridente_sheila', { nome: 'Tridente de Ouro da Dra. Gertrudes', cat: 'mao', rar: 'lendario', preco: 0, icon: 'tridente', unico: true, vendavel: false,
  desc: 'Um prendedor de cabelo em forma de tridente. Ela jura que é só enfeite.',
  efeito: '+4 Conhecimento, +2 Precisão. Casos de GO: +12s e pista revelada.', stats: { conhecimento: 4, precisao: 2 }, fx: { areaClue: 'go', areaTime: { go: 12 } } });
IT('caneta_tinteiro', { nome: 'Caneta-Tinteiro do Dr. Wagnão', cat: 'amuleto', rar: 'lendario', preco: 0, icon: 'caneta', unico: true, vendavel: false,
  desc: '"Que esta pena registre evoluções dignas de uma epopeia clínica."',
  efeito: '+4 Conhecimento, +3 Influência. XP de casos +10%.', stats: { conhecimento: 4, influencia: 3 }, fx: { xpMult: 0.1 } });
IT('sapato_bico', { nome: 'Sapato de Bico Fino Branco', cat: 'amuleto', rar: 'lendario', preco: 0, icon: 'sapato', unico: true, vendavel: false,
  desc: 'Do Dr. Leôncio. Apertado. Branco. Intimidador.',
  efeito: '+4 Precisão, +4 Resistência. Procedimentos: zona +15%.', stats: { precisao: 4, resistencia: 4 }, fx: { procZoneAll: 0.15 } });
IT('pergaminho_teses', { nome: 'Pergaminho das 95 Teses', cat: 'amuleto', rar: 'lendario', preco: 0, icon: 'pergaminho', unico: true, vendavel: false,
  desc: 'Assinado pelo Dr. Martinho Lutero. "A 96ª tese é sua: o cuidado continua depois da consulta."',
  efeito: '+3 Conhecimento, +3 Influência. Casos da UBS: +12s e pista revelada.', stats: { conhecimento: 3, influencia: 3 }, fx: { areaClue: 'ubs', areaTime: { ubs: 12 } } });
IT('cracha_ouro', { nome: 'Crachá Dourado de Interno', cat: 'amuleto', rar: 'lendario', preco: 0, icon: 'cracha', unico: true, vendavel: false,
  desc: 'Dado aos internos que sobrevivem ao internato inteiro.',
  efeito: '+2 em todos os atributos. XP +10%.', stats: { foco: 2, conhecimento: 2, precisao: 2, resistencia: 2, influencia: 2 }, fx: { xpMult: 0.1 } });

/* ---------- Consumíveis ---------- */
IT('cafe', { nome: 'Café Coado', cat: 'consumivel', rar: 'comum', preco: 6, icon: 'cafe', loja: true, empilha: true,
  desc: 'Da garrafa térmica da copa. Morno. Essencial.', efeito: '+15 Energia.', uso: { energia: 15, cafe: true } });
IT('cafe_duvidoso', { nome: 'Café de Procedência Duvidosa', cat: 'consumivel', rar: 'comum', preco: 2, icon: 'cafe2', empilha: true,
  desc: 'Encontrado numa garrafa sem etiqueta. Coragem.', efeito: '+22 Energia, -2 Foco por 90s.', uso: { energia: 22, cafe: true, buff: { foco: -2, dur: 90 } } });
IT('coxinha', { nome: 'Coxinha da Cantina', cat: 'consumivel', rar: 'comum', preco: 9, icon: 'coxinha', loja: true, empilha: true,
  desc: 'Crocante por fora, misteriosa por dentro.', efeito: '+25 Vida.', uso: { vida: 25 } });
IT('empada', { nome: 'Empada de Frango', cat: 'consumivel', rar: 'comum', preco: 10, icon: 'empada', loja: false, empilha: true,
  desc: 'Massa que desmancha. Recheio de frango com azeitona (a azeitona é polêmica).', efeito: '+28 Vida.', uso: { vida: 28 } });
IT('enroladinho', { nome: 'Enroladinho de Salsicha', cat: 'consumivel', rar: 'comum', preco: 7, icon: 'enroladinho', loja: false, empilha: true,
  desc: 'Clássico de cantina de hospital. Sempre quente, nunca se sabe como.', efeito: '+18 Vida, +6 Energia.', uso: { vida: 18, energia: 6 } });
IT('pao_queijo', { nome: 'Pão de Queijo', cat: 'consumivel', rar: 'comum', preco: 8, icon: 'paoqueijo', loja: true, empilha: true,
  desc: 'Mineiro de verdade (segundo a cantina).', efeito: '+15 Vida, +10 Energia.', uso: { vida: 15, energia: 10 } });
IT('energetico', { nome: 'Energético em Lata', cat: 'consumivel', rar: 'comum', preco: 16, icon: 'lata', loja: true, empilha: true,
  desc: 'Sabor "frutas vermelhas industrializadas".', efeito: '+35 Energia, -1 Precisão por 60s.', uso: { energia: 35, buff: { precisao: -1, dur: 60 } } });
IT('barrinha_avulsa', { nome: 'Barrinha Avulsa', cat: 'consumivel', rar: 'comum', preco: 12, icon: 'barrinha', loja: true, empilha: true,
  desc: 'Da máquina do corredor. Às vezes cai, às vezes não.', efeito: '+20 Energia, +2 Resistência por 120s.', uso: { energia: 20, buff: { resistencia: 2, dur: 120 } } });
IT('agua_coco', { nome: 'Água de Coco', cat: 'consumivel', rar: 'comum', preco: 10, icon: 'coco', loja: true, empilha: true,
  desc: 'Hidratação com cara de férias.', efeito: '+18 Vida, +6 Energia.', uso: { vida: 18, energia: 6 } });
IT('bala_gengibre', { nome: 'Bala de Gengibre', cat: 'consumivel', rar: 'incomum', preco: 20, icon: 'bala', loja: true, empilha: true,
  desc: 'Arde. Acorda. Concentra.', efeito: '+3 Foco por 120s.', uso: { buff: { foco: 3, dur: 120 } } });
IT('marmita', { nome: 'Marmita da Mãe', cat: 'consumivel', rar: 'raro', preco: 45, icon: 'marmita', loja: true, empilha: true,
  desc: 'Arroz, feijão, bife e amor.', efeito: 'Recupera toda a Vida e +30 Energia.', uso: { vida: 999, energia: 30 } });

/* ---------- Materiais diversos (vendáveis) ---------- */
IT('clipe', { nome: 'Clipe de Papel', cat: 'material', rar: 'comum', preco: 4, icon: 'clipe', empilha: true, desc: 'Útil para tudo, inclusive para nada.', efeito: 'Pode ser vendido ao Rodolfo.' });
IT('caneta_boa', { nome: 'Caneta Que Funciona', cat: 'material', rar: 'incomum', preco: 25, icon: 'caneta', empilha: true, desc: 'Item lendário do cotidiano hospitalar.', efeito: 'Pode ser vendida ao Rodolfo.' });
IT('luva_sem_par', { nome: 'Luva Sem Par', cat: 'material', rar: 'comum', preco: 3, icon: 'luva', empilha: true, desc: 'Tamanho M. A outra nunca será encontrada.', efeito: 'Pode ser vendida ao Rodolfo.' });
IT('tampa_caneta', { nome: 'Tampa de Caneta Mastigada', cat: 'material', rar: 'comum', preco: 1, icon: 'tampa', empilha: true, desc: 'Não pergunte de quem.', efeito: 'Pode ser vendida ao Rodolfo.' });
IT('adesivo_liga', { nome: 'Adesivo de Liga', cat: 'material', rar: 'incomum', preco: 18, icon: 'adesivo', empilha: true, desc: '"LIGA DE TUDO — desde 2003".', efeito: 'Pode ser vendido ao Rodolfo.' });

/* ---------- Itens de missão (não vendáveis) ---------- */
function QI(id, nome, icon, desc) { IT(id, { nome, cat: 'missao', rar: 'comum', preco: 0, icon, vendavel: false, desc, efeito: 'Item de missão: será entregue automaticamente.' }); }
QI('q_cafe', 'Café para Entrega', 'cafe', 'Copinho fumegante. Não derrame.');
QI('q_resma', 'Resma de Papel A4', 'resma', '500 folhas de esperança para a impressora.');
QI('q_papeis', 'Papéis para Entregar', 'papeis', 'Solicitações, evoluções e um formulário em três vias.');
QI('q_salgado', 'Salgado Encomendado', 'coxinha', 'Ainda quentinho, embrulhado em guardanapo.');
QI('q_usg', 'Aparelho de Ultrassom do Setor', 'usg', 'Pesado. Com fio enrolado de um jeito impossível.');
QI('q_prontuario', 'Prontuário Perdido', 'prontuario', 'Capa azul, folhas soltas, letra ilegível.');
QI('q_carregador', 'Carregador de Celular', 'carregador', 'Tipo C. A coisa mais disputada do hospital.');
QI('q_cracha', 'Crachá Perdido do R1', 'cracha', 'Foto tirada no primeiro dia: ainda tinha esperança no olhar.');
QI('q_caderno_leo', 'Caderninho do Leão', 'caderno', 'Um caderninho surrado com anotações sobre... você?');
QI('q_teses', 'As 95 Teses da Atenção Básica', 'pergaminho', 'Folhas de ofício presas com fita crepe. A primeira diz: "A Atenção Básica é a porta de entrada do SUS".');
QI('q_formulario', 'Formulário Preenchido', 'papeis', 'Carimbado, assinado e com o CID certo.');

/* ---------- Ícones (desenhados em pixel art na interface) ---------- */
// Cada ícone é desenhado por SPR.icon(key) — ver sprites.

/* =====================================================================
   ÁRVORES DE HABILIDADES (3 x 20)
   ===================================================================== */
const SKILLS = {};
const SKILL_TREES = {
  med: { nome: 'Habilidades Médicas', cor: '#5fd4a0', desc: 'Raciocínio clínico, semiologia, exames e procedimentos.' },
  farm: { nome: 'Medicamentos', cor: '#6fb3ff', desc: 'Farmacologia e decisões terapêuticas. Habilidades de jogo — não substituem prescrição real.' },
  int: { nome: 'Internices', cor: '#ffb84d', desc: 'A arte absurda de sobreviver ao internato.' },
};
function SK(id, arv, n, nome, custo, efeito, extra = {}) {
  SKILLS[id] = Object.assign({ id, arv, n, nome, custo, efeito, req: n > 1 ? [arv + (n - 1)] : [], nivel: Math.max(1, Math.floor(n * 0.6)) }, extra);
}
// --- Médicas ---
SK('med1', 'med', 1, 'Escuta Ativa', 20, '+1 Influência. +10% de chance de pista automática ao iniciar um caso.');
SK('med2', 'med', 2, 'Inspeção Sistemática', 35, 'Casos com exame físico relevante: +8s. O exame físico nunca é borrado.');
SK('med3', 'med', 3, 'Semiologia de Leito', 55, '+2 Conhecimento. Casos com exame físico relevante: pista revelada.', { tag: 'ef' });
SK('med4', 'med', 4, 'Anamnese Dirigida', 80, 'Libera o botão "Pedir pista" em todos os casos (custa energia). Borrões da reputação -40%.');
SK('med5', 'med', 5, 'ABCDE Instintivo', 110, 'Casos da UPA: +10s. Batalhas começam com escudo de 12 pontos.');
SK('med6', 'med', 6, 'Diagnóstico Diferencial', 145, 'Uma vez por encontro: elimina uma alternativa diagnóstica incorreta.');
SK('med7', 'med', 7, 'ECG Sem Pânico', 185, 'Casos com eletrocardiograma: pista revelada e +10% XP.', { tag: 'ecg' });
SK('med8', 'med', 8, 'Gasometria na Ponta da Língua', 230, 'Casos com gasometria: pista revelada. Procedimento de gasometria: zona +15%.', { tag: 'gaso' });
SK('med9', 'med', 9, 'Imagem Estratégica', 280, 'Casos com exame de imagem: pista revelada.', { tag: 'img' });
SK('med10', 'med', 10, 'Priorização de Risco', 335, 'Desafios de triagem: +8s. Penalidade por tempo esgotado na UPA pela metade.');
SK('med11', 'med', 11, 'Exame Neurológico Fino', 395, 'Casos neurológicos: pista e +10s. Punção lombar: zona +15%.', { tag: 'neuro' });
SK('med12', 'med', 12, 'POCUS de Bolso', 460, 'Casos com ultrassom pertinente: pista. Com Ultrassom Portátil equipado: +10s extras.', { tag: 'usg' });
SK('med13', 'med', 13, 'Procedimento Asséptico', 530, 'Todos os procedimentos: zona +12% e penalidade de erro de segurança pela metade.');
SK('med14', 'med', 14, 'Via Aérea Sob Controle', 605, 'Intubação simulada: zona +20%. Casos respiratórios: +8s.', { tag: 'resp' });
SK('med15', 'med', 15, 'Choque Sob Controle', 685, 'Casos de instabilidade hemodinâmica: pista. Batalhas: libera a ação "Estabilizar".', { tag: 'choque', acao: 'estabilizar' });
SK('med16', 'med', 16, 'Emergências Cardiovasculares', 770, 'Casos cardiovasculares: pista e +15% XP.', { tag: 'cardio' });
SK('med17', 'med', 17, 'Multimorbidade', 860, 'Casos de dificuldade 3: +15s. Erros custam 1 ponto de reputação a menos.');
SK('med18', 'med', 18, 'Diagnóstico Relâmpago', 955, 'Bônus de velocidade vale até 65% do tempo e é dobrado (só com acerto). Batalhas: ação "Relâmpago".', { acao: 'relampago' });
SK('med19', 'med', 19, 'Conduta Baseada em Evidências', 1055, 'Uma vez por caso: se a conduta estiver errada, você é alertado e pode revisá-la (recompensa da conduta pela metade).');
SK('med20', 'med', 20, 'Mestre do Plantão', 1170, '+3 Conhecimento, +3 Precisão, +2 Foco. Casos: +12s e pista grátis. Batalhas: ação "Raciocínio de Mestre".', { acao: 'mestre' });
// --- Medicamentos ---
SK('farm1', 'farm', 1, 'Prescrição Conferida', 25, '+5% moedas em casos. Conduta errada custa 1 ponto de reputação a menos.');
SK('farm2', 'farm', 2, 'Analgesia Responsável', 40, 'Casos com decisão de analgesia: elimina uma conduta errada.', { tag: 'dor' });
SK('farm3', 'farm', 3, 'Hidratação Individualizada', 60, 'Casos de hidratação/volemia: elimina uma conduta errada.', { tag: 'hidrat' });
SK('farm4', 'farm', 4, 'Antiemético com Critério', 85, 'Casos com náuseas e vômitos: elimina uma conduta errada.', { tag: 'vomito' });
SK('farm5', 'farm', 5, 'Broncodilatador Preciso', 115, 'Casos respiratórios: elimina uma conduta errada.', { tag: 'resp' });
SK('farm6', 'farm', 6, 'Antibioticoterapia Racional', 150, 'Casos de infecção: elimina uma conduta errada.', { tag: 'infec' });
SK('farm7', 'farm', 7, 'Corticoide com Indicação', 190, 'Casos em que o corticoide é decisão relevante: elimina uma conduta errada.', { tag: 'cortic' });
SK('farm8', 'farm', 8, 'Insulina Sem Atalho', 235, 'Casos de diabetes e metabolismo: elimina uma conduta errada.', { tag: 'diabetes' });
SK('farm9', 'farm', 9, 'Diurético Estratégico', 285, 'Casos de insuficiência cardíaca/volume: elimina uma conduta errada.', { tag: 'ic' });
SK('farm10', 'farm', 10, 'Anticoagulação Segura', 340, 'Casos com anticoagulação: elimina uma conduta errada.', { tag: 'anticoag' });
SK('farm11', 'farm', 11, 'Antiplaquetários em Contexto', 400, 'Síndromes coronarianas: elimina uma conduta errada.', { tag: 'sca' });
SK('farm12', 'farm', 12, 'Anticonvulsivantes sob Supervisão', 465, 'Casos de crise convulsiva/neurológicos agudos: elimina uma conduta errada.', { tag: 'convul' });
SK('farm13', 'farm', 13, 'Sedação Segura', 535, 'Encontros de agitação: tensão reduz 25% mais rápido. Intubação simulada: zona +10%.', { tag: 'sedacao' });
SK('farm14', 'farm', 14, 'Antídotos e Reversores', 610, 'Intoxicações: pista e elimina uma conduta errada.', { tag: 'intox' });
SK('farm15', 'farm', 15, 'Vasoativos Simulados', 690, 'Casos de choque: elimina uma conduta errada. Batalhas: ação "Suporte Hemodinâmico".', { tag: 'choque', acao: 'suporte' });
SK('farm16', 'farm', 16, 'Protocolo de Sepse', 775, 'Sepse e infecção grave: pista e elimina uma conduta errada.', { tag: 'sepse' });
SK('farm17', 'farm', 17, 'Cetoacidose Organizada', 865, 'Cetoacidose diabética: pista e elimina uma conduta errada.', { tag: 'cad' });
SK('farm18', 'farm', 18, 'Obstetrícia Emergencial', 960, 'Emergências obstétricas: pista e elimina uma conduta errada.', { tag: 'obst' });
SK('farm19', 'farm', 19, 'Pediatria por Peso', 1060, 'Casos pediátricos: elimina uma conduta errada. (No jogo não há doses: sempre confira idade, peso e protocolos reais.)', { tag: 'ped' });
SK('farm20', 'farm', 20, 'Farmacologia Integrada', 1170, '+2 Conhecimento. Todos os casos: elimina uma conduta errada. Batalhas: ação "Revisão Farmacológica".', { acao: 'revisao' });
// --- Internices ---
SK('int1', 'int', 1, 'Café com Tampa', 20, 'Missões de café: +30s de prazo e +10% de recompensa.');
SK('int2', 'int', 2, 'Estagiário Entregador', 30, 'Carregando itens de missão: +15% de velocidade.');
SK('int3', 'int', 3, 'Xerox Ninja', 45, 'Missões de papéis/documentos: +30s de prazo.');
SK('int4', 'int', 4, 'Recarregar Impressora', 65, 'Minigame da impressora com uma etapa a menos.');
SK('int5', 'int', 5, 'Atualizar o Sistema', 90, 'Missões no computador: um campo vem preenchido automaticamente.');
SK('int6', 'int', 6, 'Dormir no Conforto', 120, 'Descanso no sofá recupera 50% mais e tem recarga pela metade.');
SK('int7', 'int', 7, 'Café de Procedência Duvidosa', 155, 'Garrafas térmicas e bebedouros dão "café duvidoso" (+22 energia, -2 foco). Batalhas: ação "Gole Duvidoso".', { acao: 'gole' });
SK('int8', 'int', 8, 'Mapa Mental do Hospital', 195, 'O mapa e a tela mostram setas para os objetivos ativos.');
SK('int9', 'int', 9, 'Atalho da Cantina', 240, 'Cantina 30% mais barata. Copas das áreas ganham atalho direto para a cantina.');
SK('int10', 'int', 10, 'Impressão Duplex', 295, 'Missões de documentos rendem o dobro de recompensa.');
SK('int11', 'int', 11, 'Doutor, Só Uma Perguntinha', 355, 'Todas as missões secundárias: +20s. Residentes dão dicas sobre missões ativas.');
SK('int12', 'int', 12, 'Cadê o Ultrassom?', 420, 'Objetos procurados em missões de busca ficam brilhando.');
SK('int13', 'int', 13, 'Passeio com Paciente', 490, 'Missões de acompanhamento: +20% velocidade e +20% recompensa.');
SK('int14', 'int', 14, 'A Arte do Café em Larga Escala', 565, 'Pedidos de vários cafés exigem uma só interação. Batalhas: "Coffee Break Coletivo" (1x).', { acao: 'coffeebreak' });
SK('int15', 'int', 15, 'Sumiço Estratégico', 645, '3 usos por área: cancela missão secundária ou evento cômico sem penalidade. Batalhas: ação "Sumiço" (esquiva 1 ataque).', { acao: 'sumico' });
SK('int16', 'int', 16, 'Papelada Quântica', 730, 'Entregas de documentos podem ser feitas de qualquer computador.');
SK('int17', 'int', 17, 'O Residente Conhece Meu Nome', 820, 'Missões secundárias +25% de recompensa (+40% com reputação acima de 500).');
SK('int18', 'int', 18, 'Só Vou Pegar um Café', 915, 'Libera a corrida (segure Shift) e atalho da copa para a sala dos residentes.');
SK('int19', 'int', 19, 'Impressora Sobrenatural', 1015, 'Missões de impressora se resolvem sozinhas. Eventos negativos de documentos são anulados.');
SK('int20', 'int', 20, 'Lenda do Internato', 1120, 'Prazos +40%, recompensas secundárias +30%, reações exclusivas dos NPCs. Batalhas: ação "Aura de Lenda".', { acao: 'aura' });

// Ramificações extras (pré-requisitos cruzados para dar variedade)
// cada habilidade exige apenas a anterior da mesma árvore (as linhas seguem a ordem numérica 1 → 20)

// Ações de batalha liberadas por habilidades
const COMBAT_ACTIONS = {
  estabilizar: { nome: 'Estabilizar', custo: 15, cd: 3, desc: 'Recupera 30% da Vida.' },
  relampago: { nome: 'Relâmpago', custo: 12, cd: 3, desc: 'O próximo raciocínio certo causa dano dobrado.' },
  mestre: { nome: 'Raciocínio de Mestre', custo: 25, cd: 4, desc: 'A próxima resposta certa causa dano x2,5.' },
  suporte: { nome: 'Suporte Hemodinâmico', custo: 18, cd: 3, desc: 'Recupera 25 Vida e remove 2 acúmulos de pressão.' },
  revisao: { nome: 'Revisão Farmacológica', custo: 15, cd: 3, desc: 'No próximo raciocínio, 2 alternativas erradas são eliminadas.' },
  gole: { nome: 'Gole Duvidoso', custo: 0, cd: 3, desc: '+25 Energia, -1 Foco nesta batalha.' },
  coffeebreak: { nome: 'Coffee Break Coletivo', custo: 0, uso: 1, desc: '+30 Energia e +20 Vida (1x por batalha).' },
  sumico: { nome: 'Sumiço', custo: 10, cd: 4, desc: 'Esquiva o próximo ataque inimigo.' },
  aura: { nome: 'Aura de Lenda', custo: 20, cd: 5, desc: 'Remove toda a pressão e +40% de dano por 2 turnos.' },
};

/* Itens em batalha: apoios de estudo. Não gastam o turno; 1 item por turno.
   Além do efeito normal (vida/energia), cada um dá uma vantagem para a próxima pergunta. */
const BATTLE_ITEM = {
  cafe: { tag: 'Foco', desc: '+30% de tempo no próximo raciocínio e remove a Lentidão.' },
  cafe_duvidoso: { tag: 'Foco arriscado', desc: '+50% de tempo no próximo raciocínio, mas um erro causa dano extra.' },
  bala_gengibre: { tag: '50/50', desc: 'Elimina alternativas erradas no próximo raciocínio.' },
  energetico: { tag: 'Turbo', desc: 'A próxima resposta certa causa dano dobrado.' },
  barrinha_avulsa: { tag: 'Escudo', desc: 'O próximo ataque do oponente causa metade do dano.' },
  agua_coco: { tag: 'Hidratar', desc: 'Recupera Vida e remove Pressão e Lentidão.' },
  coxinha: { tag: 'Recarregar', desc: 'Recupera Vida.' }, empada: { tag: 'Recarregar', desc: 'Recupera Vida.' }, enroladinho: { tag: 'Recarregar', desc: 'Recupera Vida e um pouco de Energia.' },
  pao_queijo: { tag: 'Recarregar', desc: 'Recupera Vida e Energia.' }, marmita: { tag: 'Comida de mãe', desc: 'Recupera toda a Vida e remove Pressão e Lentidão.' },
};

/* cardápio da cantina da Dona Cida (fonte única: missões de salgado só pedem o que está aqui) */
const CANTINA_MENU = ['cafe', 'coxinha', 'pao_queijo', 'empada', 'enroladinho', 'agua_coco', 'barrinha_avulsa', 'bala_gengibre'];
const CANTINA_SALGADOS = ['coxinha', 'pao_queijo', 'empada', 'enroladinho'];
