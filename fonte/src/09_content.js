/* =====================================================================
   CONTEÚDO: NPCs, diálogos, cadeias de missões principais e chefes
   ===================================================================== */
Object.assign(LOOKS, {
  res_otavio: { skin: '#c98e5f', hair: 'curto', hairC: '#1d1612', top: 'social', topC: '#9fd0e8', bottomC: '#2b3a55', shoes: '#5a3a22', glasses: 'preta', acc: 'prancheta' },
  res_bia: { skin: '#f6d7c3', hair: 'cacheado', hairC: '#a0622d', scrub: '#e57a2e', shoes: '#ececec', acc: 'caneca', eyebags: true },
  // frequentadores do Bar do Rodolfo
  tuche: { skin: '#e0ac7e', hair: 'curto', hairC: '#3a2414', build: 'magro', top: 'tshirt', topC: '#1c1c22', print: 'caveira', bottomC: '#3f5f8f', shoes: '#ececec', mouth: 'smile' },
  barba: { skin: '#d9a07a', hair: 'curto', hairC: '#2a1e18', facial: 'barba', build: 'largo', top: 'tshirt', topC: '#1f7a3e', print: 'verdao', bottomC: '#3f5f8f', shoes: '#151515', mouth: 'smile' },
  tio_gui: { skin: '#efc3a4', hair: 'careca', hairC: '#6b4a2a', build: 'grande', top: 'tshirt', topC: '#f4f4f0', print: 'alvinegro', bottomC: '#2b2b33', shoes: '#3a2a1e', mouth: 'smile' },
  devede: { skin: '#c98e5f', hair: 'topete', hairC: '#151015', top: 'tshirt', topC: '#1c1c22', bottomC: '#24242b', shoes: '#151015', tool: 'tesoura', amu: 'pente', mouth: 'smile' },
  res_caue: { skin: '#8a5230', hair: 'curto', hairC: '#1d1612', scrub: '#4f8fd6', cap: '#4f8fd6', shoes: '#ececec', eyebags: true },
  // UBS Maria das Dores: recém-formados do grupo de estudos e equipe
  yasser: { skin: '#c98e5f', hair: 'curto', hairC: '#151015', facial: 'barba', build: 'normal', top: 'social', topC: '#cfe0f5', bottomC: '#2b3a55', shoes: '#3a2a1e', coat: 'jaleco', badge: true, acc: 'prancheta', mouth: 'smile' },
  camila: { skin: '#f6d7c3', hair: 'rabo', hairC: '#6b3e1f', fem: true, top: 'tshirt', topC: '#9b7fd1', bottomC: '#24242b', shoes: '#ececec', coat: 'jaleco', badge: true, glasses: 'preta', acc: 'caneca' },
  renan: { skin: '#6b3d22', hair: 'raspado', hairC: '#1d1612', build: 'alto', top: 'social', topC: '#3fa66b', bottomC: '#2b2b33', shoes: '#151015', coat: 'jaleco', badge: true, acc: 'papeis', eyebags: true },
  bianca: { skin: '#e0ac7e', hair: 'cacheado', hairC: '#2a1e18', fem: true, top: 'tshirt', topC: '#e88aa8', bottomC: '#3f5f8f', shoes: '#ececec', coat: 'jaleco', badge: true, acc: 'celular', mouth: 'lips' },
  enf_joana: { skin: '#8a5230', hair: 'coque', hairC: '#1d1612', fem: true, scrub: '#3d7cc9', shoes: '#ececec', mouth: 'smile' },
  acs_marcos: { skin: '#a8693f', hair: 'curto', hairC: '#1d1612', top: 'tshirt', topC: '#3d7cc9', bottomC: '#2f4f86', shoes: '#262626', cap: '#2f62b8', acc: 'prancheta' },
  farm_rita: { skin: '#efc3a4', hair: 'bob', hairC: '#a0622d', fem: true, top: 'social', topC: '#f4f4f0', bottomC: '#24242b', shoes: '#262626', coat: 'jaleco', glasses: 'meia' },
  tec_ubs: { skin: '#e0ac7e', hair: 'rabo', hairC: '#3a2414', fem: true, scrub: '#7fc7d9', shoes: '#ececec' },
});

const NPCS_DEF = [];
function NPC(o) { NPCS_DEF.push(Object.assign({ speed: 0.9, role: 'civil', beh: { t: 'static' } }, o)); }
// ---------- Rua ----------
NPC({ id: 'pedestre1', nome: 'Pedestre', look: randomCivilLook(11), map: 'rua', x: 6, y: 18.5, beh: { t: 'wander', r: [0, 18, 47, 1] } });
NPC({ id: 'pedestre2', nome: 'Acompanhante apressada', look: randomCivilLook(29), map: 'rua', x: 30, y: 12.5, beh: { t: 'wander', r: [17, 12, 30, 1] } });
NPC({ id: 'pedestre3', nome: 'Seu Zé (aposentado)', look: randomCivilLook(53, 'idoso'), map: 'rua', x: 33, y: 23, beh: { t: 'wander', r: [26, 21, 18, 6] }, fala: ['Na minha época a UPA era um posto com dois bancos e um ventilador.', 'Esse Rodolfo vende o melhor pastel da região. E o pior café.'] });
NPC({ id: 'pipoqueiro', nome: 'Pipoqueiro', look: Object.assign(randomCivilLook(71), { cap: '#c0392b', apron: '#f4f4f0' }), map: 'rua', x: 26, y: 19, fala: ['Pipoca doce ou salgada? ... Ah, você é interno. Já tá salgado o suficiente.', 'Vi o Leão chegando de manhã. Tava mais acordado do que parece, viu.'] });
// ---------- Saguão ----------
NPC({ id: 'marli', nome: 'Marli (recepção)', look: 'recep', map: 'lobby', x: 15, y: 17, role: 'equipe', fala: ['Bem-vindo ao Santa Esperança! As alas estão sinalizadas: Pediatria à esquerda, Cirurgia à direita, GO e Clínica ao fundo.', 'Precisa de alguma coisa? Se for a senha do Wi-Fi, ninguém sabe.'] });
NPC({ id: 'valdemar', nome: 'Seu Valdemar (segurança)', look: 'seguranca', map: 'lobby', x: 21.5, y: 19, role: 'equipe', fala: ['Crachá visível, doutor(a)? Ótimo. INTERNO, hein... força aí.', 'Já vi muito interno entrar chorando e sair formado. Você chega lá.'] });
NPC({ id: 'cida', nome: 'Dona Cida (cantina)', look: 'cida', map: 'lobby', x: 3, y: 16, role: 'cantina', reach: 2.4 });
NPC({ id: 'visitante1', nome: 'Visitante', look: randomCivilLook(101), map: 'lobby', x: 24, y: 10, beh: { t: 'wander', r: [12, 3, 16, 9] } });
NPC({ id: 'limpeza1', nome: 'Dona Fátima (limpeza)', look: 'limpeza', map: 'lobby', x: 8, y: 11, role: 'equipe', beh: { t: 'wander', r: [2, 3, 36, 10] }, fala: ['Cuidado, piso molhado! ...Não, tá seco. Mas cuidado mesmo assim.', 'O pessoal da Cirurgia deixa o vestiário um brinco. O Dr. Leôncio confere com luva branca.'] });
// ---------- UPA ----------
NPC({ id: 'leozao', nome: 'Leão Figura', look: 'leozao', map: 'upa', x: 11, y: 14.5, role: 'preceptor', area: 'upa', speed: 0.45, beh: { t: 'wander', r: [5, 13, 34, 2] } });
NPC({ id: 'res_bruno', nome: 'Bruno (R1)', look: 'res_bruno', map: 'upa', x: 30, y: 19, role: 'residente', area: 'upa', beh: { t: 'wander', r: [29, 19, 11, 3] } });
NPC({ id: 'res_tati', nome: 'Tati (R2)', look: 'res_tati', map: 'upa', x: 20, y: 14, role: 'residente', area: 'upa', beh: { t: 'wander', r: [2, 13, 40, 2] } });
NPC({ id: 'res_rafa', nome: 'Rafa (R1)', look: 'res_rafa', map: 'upa', x: 24, y: 22, role: 'residente', area: 'upa', beh: { t: 'wander', r: [21, 21, 6, 1] } });
NPC({ id: 'res_igor', nome: 'Igor (R3)', look: 'res_igor', map: 'upa', x: 39, y: 20, role: 'residente', area: 'upa', beh: { t: 'wander', r: [36, 19, 6, 3] } });
NPC({ id: 'enf_ana', nome: 'Enfermeira Ana', look: 'enf_ana', map: 'upa', x: 23, y: 19, role: 'equipe', fala: ['Interno, sinais vitais estão no prontuário. Sempre confira antes de decidir.', 'Na dúvida, chama a gente. Equipe é equipe.'] });
NPC({ id: 'tec_jussara', nome: 'Técnica Jussara', look: 'tec_jussara', map: 'upa', x: 22, y: 8, role: 'equipe', beh: { t: 'wander', r: [19, 6, 11, 4] }, fala: ['O leito 3 tá pedindo água. O 2 tá pedindo atestado. O 1 tá pedindo pra ir embora.', 'Hoje é meu aniversário! Se tiver bolo na copa, foi eu.'] });
NPC({ id: 'recep_upa', nome: 'Recepção UPA', look: Object.assign({}, LOOKS.recep, { topC: '#1d8a4a', hair: 'cacheado', skin: '#8a5230' }), map: 'upa', x: 4, y: 18, role: 'equipe', fala: ['Senha 147! ...Senha 147? ...Alguém?', 'A classificação de risco é por gravidade, não por ordem de chegada. Já expliquei isso 300 vezes hoje.'] });
NPC({ id: 'esp1', nome: 'Paciente aguardando', look: randomCivilLook(201, 'idoso'), map: 'upa', x: 8, y: 23, fala: ['Tô esperando desde cedo. Mas tudo bem, vi que chegou um caso grave.'] });
NPC({ id: 'esp2', nome: 'Acompanhante', look: randomCivilLook(202), map: 'upa', x: 11, y: 25, beh: { t: 'wander', r: [8, 21, 4, 6] }, fala: ['Meu pai tá na observação. A equipe tem sido muito atenciosa.'] });
NPC({ id: 'esp3', nome: 'Rapaz com atestado', look: randomCivilLook(203), map: 'upa', x: 18, y: 23, fala: ['Doutor, é só um atestadozinho...', 'Juro que tô com dor de cabeça desde sexta.'] });
// ---------- Pediatria ----------
NPC({ id: 'sueli', nome: 'Dra. Xuxa', look: 'sueli', map: 'ped', x: 16, y: 14, role: 'preceptor', area: 'ped', speed: 0.7, beh: { t: 'wander', r: [10, 12, 22, 3] } });
NPC({ id: 'res_lu', nome: 'Lu (R2)', look: 'res_lu', map: 'ped', x: 20, y: 20, role: 'residente', area: 'ped', beh: { t: 'wander', r: [19, 19, 6, 2] } });
NPC({ id: 'res_davi', nome: 'Davi (R1)', look: 'res_davi', map: 'ped', x: 30, y: 14, role: 'residente', area: 'ped', beh: { t: 'wander', r: [24, 12, 16, 3] } });
NPC({ id: 'enf_jose', nome: 'Enfermeiro José', look: 'enf_jose', map: 'ped', x: 13, y: 19, role: 'equipe', fala: ['Peso, estatura e perímetro cefálico: pediatria começa aí.', 'A Xuxa é brava, mas ela salvou muita criança nessa vida.'] });
NPC({ id: 'mae1', nome: 'Mãe de lactente', look: randomCivilLook(301), map: 'ped', x: 9, y: 5, fala: ['Ele mamou melhor hoje, graças a Deus.'] });
NPC({ id: 'crianca1', nome: 'Pedrinho', look: randomCivilLook(302, 'crianca'), map: 'ped', x: 38, y: 7, beh: { t: 'wander', r: [36, 3, 5, 6] }, fala: ['Você é médico de verdade? Seu crachá diz INTERNO. É tipo estagiário?', 'Eu não vou tomar injeção. EU NÃO VOU.'] });
NPC({ id: 'crianca2', nome: 'Laurinha', look: randomCivilLook(303, 'crianca'), map: 'ped', x: 38, y: 5, beh: { t: 'wander', r: [36, 3, 5, 6] }, fala: ['Desenhei um leão! Igual o da parede!'] });
// crianças da pediatria (zoando o interno, claro)
NPC({ id: 'crianca_enzo', nome: 'Enzo (6 anos)', look: Object.assign(randomCivilLook(311, 'crianca'), { topC: '#3a7bd5' }), map: 'ped', x: 8, y: 13.5, beh: { t: 'wander', r: [2, 12, 12, 2] }, fala: ['Tio, você é médico ou só tá fantasiado?', 'Minha mãe pesquisou no Google e lá diz que eu tenho 37 doenças. Você só achou UMA.', 'Se você me der um adesivo eu deixo você me examinar. Dois adesivos se for a garganta.'] });
NPC({ id: 'crianca_valentina', nome: 'Valentina (5 anos)', look: Object.assign(randomCivilLook(312, 'crianca'), { fem: true, hair: 'trancas', topC: '#e88aa8' }), map: 'ped', x: 31, y: 23.5, fala: ['Seu jaleco tá com mancha de café. Médico de verdade bebe suco de caixinha.', 'Você parece cansado. Quer um pedaço do meu biscoito? ...Pensei melhor. Não.', 'Eu sei falar "esfigmomanômetro". Fala você. ...Viu? Errou.'] });
NPC({ id: 'crianca_theo', nome: 'Theo (7 anos)', look: Object.assign(randomCivilLook(313, 'crianca'), { topC: '#e9c13b' }), map: 'ped', x: 37, y: 23, beh: { t: 'wander', r: [35, 22, 4, 2] }, fala: ['Você esqueceu de lavar a mão antes de examinar o menino ali. Eu VI.', 'Por que você tá suando? Quem tá doente sou eu.', 'Quando a Dra. Xuxa aparece você fica igual estátua. Kkkkkk'] });
NPC({ id: 'crianca_heloisa', nome: 'Heloísa (6 anos)', look: Object.assign(randomCivilLook(314, 'crianca'), { fem: true, hair: 'cacheado', topC: '#9b7fd1' }), map: 'ped', x: 21, y: 8.5, fala: ['Meu ursinho já foi operado três vezes. Ele tem mais experiência que você.', 'Vamos brincar de médico? Eu sou a médica. Você é o paciente. E o estagiário.', 'Meu dente tá mole. Você sabe arrancar? Não? Então pra que você estudou?'] });
NPC({ id: 'crianca_benicio', nome: 'Benício (4 anos)', look: Object.assign(randomCivilLook(315, 'crianca'), { topC: '#3fa66b' }), map: 'ped', x: 29.5, y: 4.5, fala: ['Abre a boca e fala AAAA. ...Viu? Agora EU sou o médico.', 'Sua letra é igual à do meu irmão. Ele tem dois anos.', 'Meu pai disse que interno é tipo jogador do sub-17.'] });
NPC({ id: 'crianca_mariaclara', nome: 'Maria Clara (8 anos)', look: Object.assign(randomCivilLook(316, 'crianca'), { fem: true, hair: 'rabo', topC: '#d13b3b' }), map: 'ped', x: 25, y: 14, beh: { t: 'wander', r: [21, 12, 9, 2] }, fala: ['Quando eu crescer vou ser residente. Interno não, interno só carrega papel.', 'Você já ganhou estrelinha hoje? Eu ganhei três. Por tomar remédio sem chorar.', 'Por que seu crachá tá torto? Minha professora ia brigar com você.'] });
NPC({ id: 'crianca_gael', nome: 'Gael (7 anos)', look: Object.assign(randomCivilLook(317, 'crianca'), { topC: '#4fb3b0' }), map: 'ped', x: 38, y: 8.5, fala: ['Aposto que você não sabe a capital do Peru. ...Eu também não, mas EU tenho 7 anos.', 'Você joga videogame? ...Joga nada. Você só joga plantão.', 'O soro tá pingando. Pinga, pinga, pinga. Você vai ficar olhando também?'] });
NPC({ id: 'adolescente_kaua', nome: 'Kauã (14 anos)', look: Object.assign(randomCivilLook(318, 'adolescente'), { fem: false, skirt: false, dress: null, mouth: 'normal', hair: 'medio', top: 'hoodie', topC: '#2a2a30' }), map: 'ped', x: 5.5, y: 27, fala: ['Mano, cê é interno? Tipo... nível tutorial?', 'O Wi-Fi do hospital é pior que a sua ausculta.', 'Minha mãe acha que você tem 15 anos. Eu acho que tem 12.'] });
NPC({ id: 'adolescente_luana', nome: 'Luana (16 anos)', look: Object.assign(randomCivilLook(321, 'adolescente'), { fem: true, hair: 'longo', hairC: '#3a2414', top: 'tshirt', topC: '#e88aa8', acc: 'celular' }), map: 'ped', x: 3, y: 27, fala: ['Você é o interno? Achei que era filho de algum paciente.', 'Posso postar uma foto com você? Legenda: "o médico que mais pediu ajuda hoje".', 'Relaxa, eu também finjo que sei as coisas na prova.'] });
NPC({ id: 'adolescente_ph', nome: 'Pedro Henrique (13 anos)', look: Object.assign(randomCivilLook(322, 'adolescente'), { fem: false, skirt: false, dress: null, mouth: 'normal', hair: 'curto', top: 'hoodie', topC: '#3a7bd5' }), map: 'ped', x: 31, y: 27.5, fala: ['Pesquisei meus sintomas num vídeo de 15 segundos e lá dizia pra não confiar em interno.', 'Se você errar a veia de novo eu vou contar pro grupo da escola.', 'Seis anos de faculdade?! E ainda tá no tutorial?'] });
NPC({ id: 'adolescente_yasmin', nome: 'Yasmin (15 anos)', look: Object.assign(randomCivilLook(323, 'adolescente'), { fem: true, hair: 'cacheado', hairC: '#1d1612', top: 'tshirt', topC: '#9b7fd1' }), map: 'ped', x: 18.5, y: 28, fala: ['Sua olheira tá maior que meu boletim de faltas.', 'Fala baixo? Tô fingindo que tô dormindo pra não ir pra escola amanhã.', 'Minha mãe disse que você parece "esforçado". Isso é elogio de pena, né?'] });
NPC({ id: 'crianca_lorenzo', nome: 'Lorenzo (5 anos)', look: Object.assign(randomCivilLook(324, 'crianca'), { topC: '#e57a2e' }), map: 'ped', x: 24.5, y: 8.5, fala: ['Por que seu estetoscópio não tem desenho? O da Dra. Xuxa tem um sapinho.', 'Me faz um balão de luva? ...Se você souber fazer, né.', 'Eu fiz xixi na cama. Não conta pra ninguém. Você também já fez, né?'] });
NPC({ id: 'crianca_alice', nome: 'Alice (6 anos)', look: Object.assign(randomCivilLook(325, 'crianca'), { fem: true, hair: 'bob', topC: '#f2c84a' }), map: 'ped', x: 34, y: 13.5, beh: { t: 'wander', r: [32, 12, 8, 2] }, fala: ['Você é o médico que demora? Minha mãe falou que tem um que demora.', 'Eu tomei vacina e nem chorei. Você chora quando toma?', 'Quando eu ficar boa eu vou embora e você vai continuar aqui. Hahaha!'] });
NPC({ id: 'pai1', nome: 'Pai aflito', look: randomCivilLook(304), map: 'ped', x: 34, y: 23, beh: { t: 'wander', r: [27, 20, 13, 7] }, fala: ['A triagem disse que meu filho é "verde". Isso é bom?'] });
// ---------- GO ----------
NPC({ id: 'sheila', nome: 'Dra. Gertrudes', look: 'sheila', map: 'go', x: 22, y: 15, role: 'preceptor', area: 'go', speed: 0.8, beh: { t: 'wander', r: [10, 14, 22, 3] } });
NPC({ id: 'res_julia', nome: 'Júlia (R2)', look: 'res_julia', map: 'go', x: 37, y: 21, role: 'residente', area: 'go', beh: { t: 'wander', r: [35, 20, 5, 2] } });
NPC({ id: 'res_paula', nome: 'Paula (R1)', look: 'res_paula', map: 'go', x: 14, y: 15, role: 'residente', area: 'go', beh: { t: 'wander', r: [2, 14, 36, 3] } });
NPC({ id: 'tec_go', nome: 'Técnica Rosilda', look: Object.assign({}, LOOKS.tec_jussara, { scrub: '#e2738c', skin: '#6b3d22', hair: 'trancas' }), map: 'go', x: 29, y: 21, role: 'equipe', fala: ['Privacidade da paciente em primeiro lugar. Biombo sempre!', 'A Dra. Gertrudes tem chifre? Nunca reparei. (Reparou.)'] });
NPC({ id: 'gestante1', nome: 'Gestante', look: randomCivilLook(401, 'gestante'), map: 'go', x: 22, y: 25, beh: { t: 'wander', r: [16, 23, 9, 4] }, fala: ['Primeira gravidez! Estou ansiosa e feliz.'] });
NPC({ id: 'acomp_go', nome: 'Acompanhante', look: randomCivilLook(402), map: 'go', x: 5, y: 26, fala: ['Ela tá dormindo e o bebê também. Momento raro de paz.'] });
// ---------- Clínica Médica ----------
NPC({ id: 'vladimir', nome: 'Dr. Wagnão', look: 'vladimir', map: 'cm', x: 39, y: 6, role: 'preceptor', area: 'cm', speed: 0.6, beh: { t: 'wander', r: [33, 5, 11, 5] } });
NPC({ id: 'res_kenji', nome: 'Kenji (R2)', look: 'res_kenji', map: 'cm', x: 20, y: 15, role: 'residente', area: 'cm', beh: { t: 'wander', r: [2, 14, 40, 3] } });
NPC({ id: 'res_otavio', nome: 'Otávio (R1)', look: 'res_otavio', map: 'cm', x: 42, y: 9, role: 'residente', area: 'cm', beh: { t: 'wander', r: [40, 5, 4, 5] } });
NPC({ id: 'res_bia', nome: 'Bia (R3)', look: 'res_bia', map: 'cm', x: 36, y: 22, role: 'residente', area: 'cm', beh: { t: 'wander', r: [33, 20, 5, 3] } });
NPC({ id: 'enf_cm', nome: 'Enfermeiro Marcos', look: Object.assign({}, LOOKS.enf_jose, { skin: '#e0ac7e', hair: 'curto', scrub: '#5aa0d8' }), map: 'cm', x: 34, y: 20, role: 'equipe', fala: ['Quarto 3 leito B: glicemia de novo alta. Quarto 6: família quer conversar.', 'Aqui são 16 pacientes. Cada um com sua história.'] });
NPC({ id: 'gustavo_calado', nome: 'Gustavo Calado', look: { skin: '#d9a07a', hair: 'topete', hairC: '#3a2414', top: 'social', topC: '#7fc7d9', bottomC: '#2f4f86', shoes: '#ececec', facial: 'cavanhaque', mouth: 'smile', build: 'normal' }, map: 'cm', x: 22, y: 15.6, beh: { t: 'wander', r: [19, 14, 7, 2] }, fala: ['bixo pra mim você é MELHOR interno que ja passou nesse hospital'] });
NPC({ id: 'familiar_cm', nome: 'Filha de paciente', look: randomCivilLook(501), map: 'cm', x: 12, y: 16, beh: { t: 'wander', r: [2, 14, 28, 3] }, fala: ['O Dr. Wagnão fala bonito, né? Às vezes eu não entendo nada, mas fico emocionada.'] });
// ---------- Cirurgia ----------
NPC({ id: 'laercio', nome: 'Dr. Leôncio', look: 'laercio', map: 'cir', x: 20, y: 16, role: 'preceptor', area: 'cir', speed: 0.7, beh: { t: 'wander', r: [12, 14, 34, 5] } });
NPC({ id: 'res_marina', nome: 'Marina (R2)', look: 'res_marina', map: 'cir', x: 6, y: 17, role: 'residente', area: 'cir', beh: { t: 'wander', r: [2, 14, 8, 5] } });
NPC({ id: 'res_caue', nome: 'Cauê (R1)', look: 'res_caue', map: 'cir', x: 44, y: 6, role: 'residente', area: 'cir', beh: { t: 'wander', r: [42, 5, 6, 5] } });
NPC({ id: 'instrumentador', nome: 'Instrumentador Wagner', look: 'instrumentador', map: 'cir', x: 28, y: 17, role: 'equipe', beh: { t: 'wander', r: [12, 14, 36, 5] }, fala: ['Metzenbaum não corta fio. Repete comigo.', 'Contagem de compressas: 10 entraram, 10 saem. Simples assim.'] });
NPC({ id: 'anestesista', nome: 'Dra. Helena (anestesia)', look: 'anestesista', map: 'cir', x: 4, y: 27, role: 'equipe', fala: ['A pausa cirúrgica salva vidas. E poupa constrangimento.', 'O Leôncio é exigente, mas nunca deixou um paciente desassistido.'] });
// ---------- Bar ----------
NPC({ id: 'rodolfo', nome: 'Rodolfo', look: 'rodolfo', map: 'bar', x: 10.5, y: 4, role: 'loja', reach: 2.6 });
NPC({ id: 'cliente1', nome: 'Residente de folga', look: Object.assign({}, LOOKS.res_igor, { topC: '#3a7bd5', acc: null }), map: 'bar', x: 4, y: 10.5, fala: ['Shhh. Estou de folga. Não existo.', 'O pastel daqui é patrimônio do hospital.'] });
NPC({ id: 'tuche', nome: 'Tuchê (calouro)', look: 'tuche', map: 'bar', x: 9.6, y: 10.8, fala: ['Já comprou a Alaween?', 'Já comprou o brownie da torcida?', 'Tô almoçando de graça aqui no Bar do Rodolfo já tem mais de um ano. Só não deixa o Tio Gui ou o Rodolfo descobrirem.'] });
NPC({ id: 'barba', nome: 'Barba', look: 'barba', map: 'bar', x: 19.5, y: 10.8, fala: ['VAI PARMERA!!!', 'Às vezes eu penso em largar tudo e começar a vender motos.', 'Já Aomossou hoje, fiote?', 'VAI PORCÃO!!!!', 'Ele é. Ponto!'] });
NPC({ id: 'tio_gui', nome: 'Tio Gui', look: 'tio_gui', map: 'bar', x: 14, y: 7.4, fala: ['Esse moleque safado acha que eu não sei que ele tá devendo 14 meses de almoço.', 'Salve, Curinthia!!', 'Esse bar até que é dahora. Só não é melhor que o meu!'] });
NPC({ id: 'devede', nome: 'Dêvedê (cabeleireiro)', look: 'devede', map: 'bar', x: 21.5, y: 6, beh: { t: 'wander', r: [20, 5, 3, 3] }, fala: ['Esse cabelo aí é corte de plantão de 24 horas, né? Senta aqui que eu resolvo.', 'Degradê, navalhado, social... pra interno eu recomendo o "disfarça calvície".', 'Já cortei o cabelo do Dr. Wagnão. Ele pediu pra eu não comentar o topete.', 'Na minha cadeira o povo conta mais coisa que no consultório. Sigilo profissional, parceiro.', 'Tesoura afiada, pente na mão e zero reclamação de cicatriz. Quero ver cirurgião falar isso.'] });
NPC({ id: 'cliente2', nome: 'Técnico de raio-X', look: randomCivilLook(601), map: 'bar', x: 17, y: 12, beh: { t: 'wander', r: [12, 9, 8, 4] }, fala: ['Já viu a sinuca? Os preceptores jogam aqui nas sextas. O Leôncio joga de luva.'] });

/* ---------- Falas genéricas por papel ---------- */
// ---------- UBS Maria das Dores ----------
NPC({ id: 'martinho', nome: 'Dr. Martinho Lutero', look: 'martinho', map: 'ubs', x: 20, y: 13.6, role: 'preceptor', area: 'ubs', speed: 0.6, beh: { t: 'wander', r: [2, 13, 38, 2] } });
NPC({ id: 'yasser', nome: 'Dr. Yasser', look: 'yasser', map: 'ubs', x: 35, y: 19.6, role: 'duvida', grupo: 'yasser', area: 'ubs', beh: { t: 'wander', r: [33, 19, 4, 1] },
  duvIntro: ['{nome}! Dá uma força? A prova cobra indicador de saúde em toda edição e eu sempre travo na conta.', 'Pergunta rápida: você sabe calcular VPP de cabeça? Porque eu não sei.', 'Estou montando um resumo de epidemiologia. Me ajuda a conferir umas questões?'],
  duvFim: ['Fechou! Vou colar essas explicações no meu resumo.', 'Entendi a lógica. Agora só falta decorar o resto do edital.', 'Valeu! Se eu passar, a primeira coxinha é sua.'],
  duvEspera: ['Tô passando a limpo o que você explicou. Volta daqui a pouco!', 'Deixa eu digerir isso antes da próxima rodada.'] });
NPC({ id: 'camila', nome: 'Dra. Camila', look: 'camila', map: 'ubs', x: 40, y: 20.2, role: 'duvida', grupo: 'camila', area: 'ubs', beh: { t: 'static' },
  duvIntro: ['Coorte, caso-controle, ecológico... na hora da prova tudo vira a mesma coisa. Me ajuda?', 'Eficácia, efetividade ou eficiência? Eu juro que sabia isso ontem.', 'Os níveis de prevenção me perseguem. Vamos treinar?'],
  duvFim: ['Agora sim! Vou desenhar a pirâmide de evidências no espelho do banheiro.', 'Perfeito. Você explica melhor que o cursinho.'],
  duvEspera: ['Tô fazendo flashcards com o que você falou. Já já te chamo.'] });
NPC({ id: 'renan', nome: 'Dr. Renan', look: 'renan', map: 'ubs', x: 25, y: 26, role: 'duvida', grupo: 'renan', area: 'ubs', beh: { t: 'static' },
  duvIntro: ['Ética e saúde do trabalhador: é onde eu perco ponto bobo. Bora?', 'Imperícia, imprudência, negligência... parece trava-língua. Me salva?', 'Hoje um paciente perguntou sobre declaração de óbito e eu travei. Me ajuda a revisar?'],
  duvFim: ['Boa! Agora eu respondo isso até dormindo.', 'Anotei tudo. Vou levar para o grupo.'],
  duvEspera: ['Tô relendo o Código de Ética. Volta daqui a pouco.'] });
NPC({ id: 'dra_bianca', nome: 'Dra. Bianca', look: 'bianca', map: 'ubs', x: 28, y: 20, role: 'duvida', grupo: 'bianca', area: 'ubs', beh: { t: 'wander', r: [27, 19, 3, 2] },
  duvIntro: ['História do SUS: CAPs, IAPs, INPS... uma sopa de letrinhas. Me ajuda a organizar?', 'NOB 91, 93 ou 96? Sempre erro qual criou o quê.', 'Fiz o genograma da família Souza no quadro. Confere comigo?'],
  duvFim: ['Organizou minha cabeça! Valeu demais.', 'Vou apresentar isso na reunião de equipe. Com os créditos, claro.'],
  duvEspera: ['Tô atualizando o genograma do quadro. Volta já!'] });
NPC({ id: 'enf_joana', nome: 'Enfermeira Joana', look: 'enf_joana', map: 'ubs', x: 39, y: 6, role: 'equipe', fala: ['Sala de vacina: rede de frio entre 2 e 8 graus. Se a geladeira desliga, a gente perde tudo.', 'Caderneta em dia é a melhor prevenção que existe. Pede para ver a caderneta em TODA consulta.', 'dTpa na gestante a partir de 20 semanas, em toda gestação. Anota aí, doutor(a).'] });
NPC({ id: 'acs_marcos', nome: 'Marcos (agente comunitário)', look: 'acs_marcos', map: 'ubs', x: 30, y: 14, role: 'equipe', beh: { t: 'wander', r: [24, 13, 14, 2] }, fala: ['Conheço cada família da microárea 3. Inclusive o cachorro que morde.', 'A Dona Cida da rua 5 não vem desde março. Vou fazer visita domiciliar hoje.', 'Territorialização é isso: saber onde mora o risco antes de ele chegar na UBS.'] });
NPC({ id: 'recep_ubs', nome: 'Gisele (recepção)', look: Object.assign({}, LOOKS.recep, { topC: '#2f62b8', hair: 'cacheado', skin: '#a8693f' }), map: 'ubs', x: 4, y: 19.4, role: 'equipe', reach: 2.4, fala: ['Senha A0013! ...A0013? Alguém?', 'Aqui é acolhimento com classificação de risco: quem está pior passa na frente.', 'Cartão do SUS e comprovante de endereço, por favor. Ou pelo menos um sorriso.'] });
NPC({ id: 'farm_rita', nome: 'Rita (farmácia)', look: 'farm_rita', map: 'ubs', x: 17, y: 19.4, role: 'equipe', reach: 2.4, fala: ['Guichê 2! Receita com letra legível, doutor(a), pelo amor de Deus.', 'Metformina, losartana e sinvastatina saem que nem pão quente.', 'Antibiótico só com receita em duas vias. Regra é regra.'] });
NPC({ id: 'tec_ubs', nome: 'Técnica Débora', look: 'tec_ubs', map: 'ubs', x: 18, y: 25.6, role: 'equipe', fala: ['Curativo do Seu Antônio às 10h. Pé diabético não espera.', 'Retirada de pontos, nebulização, coleta... aqui é procedimento o dia inteiro.'] });
NPC({ id: 'pac_ubs1', nome: 'Dona Benedita', look: randomCivilLook(611, 'idoso'), map: 'ubs', x: 3, y: 24, fala: ['Vim só medir a pressão. E conversar. Mas principalmente conversar.', 'O Dr. Martinho pregou um papel na porta da secretaria. Diz que são 95 teses. Eu li só a primeira.'] });
NPC({ id: 'pac_ubs2', nome: 'Seu Jurandir', look: randomCivilLook(612, 'idoso'), map: 'ubs', x: 11, y: 26, fala: ['Faz 20 anos que me trato aqui. Já vi interno chegar perdido e sair doutor.', 'Hipertensão a gente não sente. Por isso tomo o remédio todo dia. O doutor que ensinou.'] });
NPC({ id: 'pac_ubs3', nome: 'Gestante na fila', look: randomCivilLook(613, 'gestante'), map: 'ubs', x: 13, y: 14, fala: ['Consulta de pré-natal das 9h. Já tomei a dTpa!', 'A enfermeira falou do grupo de gestantes na quinta. Vou levar meu marido.'] });
const FALAS_RES = {
  ocupado: ['Agora não, tô evoluindo 12 pacientes.', 'Só um minuto... (não levanta os olhos do computador)', 'Tô no telefone com a regulação. Fala depois.', 'Shhh... tô calculando hidratação.'],
  normal: ['Bom plantão, interno!', 'Se tiver dúvida, pergunta. Dúvida não mata, chute mata.', 'Já tomou café? Toma. É sério.', 'Revisa os sinais vitais antes de decidir. Sempre.', 'Prazo da missão no canto da tela, hein. Fica de olho.'],
  repAlta: ['Ó o Bom Interno aí! O pessoal tá elogiando você.', 'Contigo no plantão fica mais leve. Valeu!', 'Vou pedir pra você ficar no meu time na residência.'],
  repBaixa: ['Hmm... tá meio complicado o seu plantão hoje, né?', 'Respira. Todo mundo erra. Mas não erra de novo, tá?', 'Ouvi umas histórias... bora recuperar essa reputação?'],
  lenda: ['É... é a Lenda do Internato! Posso tirar uma foto?', 'Dizem que você recarregou uma impressora só com o olhar.'],
};
const FALAS_AREA = {
  upa: ['O Leão parece que dorme, mas ele vê TUDO.', 'Dizem que o Leão já chefiou três UPAs e voltou pra cá por escolha.', 'Na triagem, quem tá parando vem antes de quem tá com dor no dedo.', 'A impressora daqui só funciona se você falar com carinho.'],
  ped: ['A Xuxa conta quantas vezes você lava a mão. Eu juro.', 'Lactente com apneia é sinal de alarme, não de "manha".', 'Adolescente tem direito a sigilo. Conversa a sós com ele também.'],
  go: ['A Dra. Gertrudes odeia quando confundem abortamento incompleto com inevitável.', 'Placenta prévia: NADA de toque vaginal.', 'Papanicolau: privacidade, consentimento e lâmina fixada na hora.'],
  cm: ['O Wagnão chama café de "elixir vigílico". Eu chamo de sobrevivência.', 'Quarto duplo: não troca os pacientes de leito na evolução!', 'Potássio antes de insulina na CAD. Repete comigo.'],
  ubs: ['Aqui o paciente volta. Toda semana. Por anos. Isso se chama longitudinalidade.', 'O Dr. Martinho diz que indulgência não fura fila. Acolhimento fura.', 'Prevenção quaternária é saber quando NÃO pedir exame.'],
  cir: ['O Leôncio já mandou interno de volta pro vestiário por causa de um fio de cabelo.', 'Contagem de compressas é sagrada.', 'Paramentação: gorro, máscara, degermação, avental, luva. Nessa ordem.'],
};
const FALAS_PRECEPTOR = {
  leozao: ['Calma... a pressa é inimiga da... como é mesmo...?', 'Sabe o que eu acho...? ...Esqueci.', 'O segredo da emergência... é priorizar. E café.', 'Eu já fui chefe de... ah, deixa pra lá.', 'Hm... interessante... (ele anota algo num caderninho)', 'Tô de olho... (ele fecha um olho só)'],
  sueli: ['Pesou a criança? NÃO? Então não fala comigo.', 'Criança não é adulto pequeno, interno!', 'Cadê a curva de crescimento?!', 'Na minha época a gente sabia o calendário vacinal de trás pra frente.', 'Lavou a mão? Lava de novo.'],
  sheila: ['Diagnóstico diferencial, interno. DI-FE-REN-CI-AL.', 'Que chifre? Isso é um prendedor de cabelo.', 'São grampos. Combinam com o rosa. Algum comentário? Não? Ótimo.', 'Se confundir prévia com descolamento de novo, volta pro ciclo básico.', 'No PS, pensa rápido. No quarto, pensa direito.'],
  vladimir: ['Que hipótese deliciosamente sindrômica!', 'O potássio, meu jovem, é o maestro silencioso da orquestra cardíaca.', 'Café? Prefiro chamá-lo de elixir vigílico.', 'Uma evolução clínica deve ser escrita como quem compõe uma sonata.', 'Contemplemos a beleza de uma ausculta bem feita.'],
  martinho: ['Tese nº 7: o cuidado não termina quando o paciente sai do consultório.', 'Aqui estou. Não posso fazer outra coisa. A agenda está lotada.', 'Indulgência não compra saúde. Prevenção, sim.', 'Tese nº 23: o ACS conhece o território melhor que qualquer mapa.', 'Lei 8.142: participação da comunidade. Já foi a uma reunião do conselho de saúde?'],
  laercio: ['Isso foi um nó ou um laço de presente?', 'Minha tia instrumenta melhor que você. E ela é dentista.', 'Pinça! Não, a OUTRA pinça. A que você não sabe o nome.', 'Bico fino, raciocínio fino. Você tem um dos dois?', 'Sapato branco não suja. Sabe por quê? Porque eu não erro.'],
};
const FALAS_RODOLFO = {
  oi: ['Ô, doutor(a)! Senta aí! Café é por conta da casa... mentira, é 6 moedas.', 'Chegou meu cliente preferido! (ele diz isso pra todo mundo)', 'Fala, interno! Hoje tem pastel de queijo e equipamento de qualidade duvidosa!', 'O de sempre? Ah, é a primeira vez. Então vai o de sempre dos outros.'],
  repAlta: ['Tão falando bem de você lá no hospital, hein! O tal do Bom Interno!', 'O R3 da Clínica veio aqui e disse que você é fera. Paguei até um café pra ele.'],
  repBaixa: ['Ih... tão falando de você lá no grupo dos residentes. E não é elogio.', 'Plantão difícil, né? Toma uma água. Essa é de graça. Só essa.'],
  progresso: ['Já passou por {n} estágio(s)? O tempo voa, meu filho.', 'Daqui a pouco vem a formatura e você nunca mais aparece. Ingrato.'],
  equip: ['Esse jaleco aí tá pedindo uma lavagem.', 'Que estetoscópio bonito! Comprou de mim? Então é de qualidade.'],
};

/* ---------- Cadeias de missões principais ---------- */
// tipos: talk, open, cases, learn, proc, side, challenge, find, boss
const CHAINS = {
  upa: [
    { id: 'upa_intro', titulo: 'Bem-vindo à UPA', tipo: 'talk', alvo: 'leozao', local: 'Corredor da UPA', desc: 'Encontre o preceptor Leão Figura no corredor da UPA e se apresente.' },
    { id: 'upa_mapa', titulo: 'Onde fica cada coisa?', tipo: 'open', alvo: ['map', 'journal'], local: 'Qualquer lugar', desc: 'Abra o mapa (M) e o diário de missões (J) para se orientar.' },
    { id: 'upa_res', titulo: 'Conheça os residentes', tipo: 'talk', alvo: 'res_bruno', local: 'Sala dos Residentes', desc: 'O R1 Bruno está na Sala dos Residentes. Ele explica como funcionam os pedidos da equipe.' },
    { id: 'upa_casos1', titulo: 'Primeiros atendimentos', tipo: 'cases', n: 2, local: 'Consultórios e Observação', desc: 'Atenda 2 pacientes marcados com "!" (aproxime-se e aperte E).' },
    { id: 'upa_skill', titulo: 'Treinamento', tipo: 'learn', n: 1, local: 'Árvore de habilidades (K)', desc: 'Abra a árvore de habilidades (K) e aprenda sua primeira habilidade com o XP disponível.' },
    { id: 'upa_proc', titulo: 'Gasometria supervisionada', tipo: 'proc', proc: 'gaso', local: 'Sala de Procedimentos', desc: 'Vá até a maca da Sala de Procedimentos e realize a coleta simulada de gasometria.' },
    { id: 'upa_side', titulo: 'Trabalho em equipe', tipo: 'side', n: 1, local: 'UPA', desc: 'Conclua 1 pedido da equipe (missão secundária) dentro do prazo.' },
    { id: 'upa_casos2', titulo: 'O plantão esquentou', tipo: 'cases', n: 3, local: 'Sala Vermelha e Observação', desc: 'Atenda mais 3 pacientes. Os casos agora são mais complexos.' },
    { id: 'upa_cap', titulo: 'Desafio do Capítulo: A Fila', tipo: 'challenge', ch: 'triagem', area: 'upa', local: 'Recepção da UPA', desc: 'Fale com a recepção da UPA e organize a fila por prioridade clínica.', alvo: 'recep_upa' },
    { id: 'upa_proc2', titulo: 'Via aérea na Sala Vermelha', tipo: 'proc', proc: 'iot', local: 'Sala de Procedimentos', desc: 'Participe da intubação orotraqueal simulada, sob supervisão.' },
    { id: 'upa_pista', titulo: 'O caderninho', tipo: 'find', obj: 'caderno_leo', item: 'q_caderno_leo', local: 'Sala dos Residentes', desc: 'Os residentes comentam sobre um caderninho que o Leão sempre carrega... Ele foi esquecido em algum lugar da Sala dos Residentes.' },
    { id: 'upa_boss', titulo: 'A Verdade do Leão', tipo: 'boss', alvo: 'leozao', local: 'Corredor da UPA', desc: 'Leão Figura revelou quem realmente é. Encontre-o e enfrente o chefe final da UPA.' },
  ],
  ped: [
    { id: 'ped_intro', titulo: 'A Doutora Xuxa', tipo: 'talk', alvo: 'sueli', local: 'Corredor da Pediatria', desc: 'Apresente-se à preceptora Xuxa. Pontualidade conta.' },
    { id: 'ped_res', titulo: 'Idades e sinais de alarme', tipo: 'talk', alvo: 'res_lu', local: 'Sala dos Residentes (PED)', desc: 'A R2 Lu vai explicar como a Pediatria muda conforme a idade.' },
    { id: 'ped_casos1', titulo: 'Ronda nas enfermarias', tipo: 'cases', n: 2, local: 'Enfermarias de bebês e infantil', desc: 'Atenda 2 pacientes pediátricos.' },
    { id: 'ped_proc', titulo: 'Punção lombar supervisionada', tipo: 'proc', proc: 'puncao_lombar', local: 'Observação Pediátrica', desc: 'Participe da punção lombar simulada na Observação Pediátrica.' },
    { id: 'ped_side', titulo: 'A enfermaria não para', tipo: 'side', n: 1, local: 'Pediatria', desc: 'Ajude a equipe com 1 pedido no prazo.' },
    { id: 'ped_casos2', titulo: 'Bebês, crianças e adolescentes', tipo: 'cases', n: 3, local: 'Pediatria', desc: 'Atenda mais 3 pacientes, incluindo adolescentes.' },
    { id: 'ped_cap', titulo: 'Desafio do Capítulo: Que idade tem esse caso?', tipo: 'challenge', ch: 'idade', area: 'ped', local: 'Consultório', desc: 'Converse com o R1 Davi e diferencie apresentações de lactentes, crianças maiores e adolescentes.', alvo: 'res_davi' },
    { id: 'ped_prep', titulo: 'A caderneta perdida', tipo: 'find', obj: 'caderneta', item: 'q_prontuario', local: 'Brinquedoteca', desc: 'A Xuxa quer a caderneta de vacinação de um paciente antes da prova. Dizem que caiu na brinquedoteca.' },
    { id: 'ped_boss', titulo: 'A Prova da Dra. Xuxa', tipo: 'boss', alvo: 'sueli', local: 'Pediatria', desc: 'Entregue a caderneta à Xuxa e enfrente a prova final de Pediatria.' },
  ],
  go: [
    { id: 'go_intro', titulo: 'A Dra. Gertrudes', tipo: 'talk', alvo: 'sheila', local: 'Corredor da GO', desc: 'Apresente-se à Dra. Gertrudes. Sim, aqueles são chifres. Não comente.' },
    { id: 'go_res', titulo: 'PS e quartos', tipo: 'talk', alvo: 'res_julia', local: 'Sala dos Residentes (GO)', desc: 'A R2 Júlia explica a diferença entre os casos do PS e os dos quartos.' },
    { id: 'go_casos1', titulo: 'Plantão no PS de GO', tipo: 'cases', n: 2, local: 'Consultório, USG, CO e Observação', desc: 'Atenda 2 pacientes do pronto-socorro.' },
    { id: 'go_proc', titulo: 'Coleta de Papanicolau', tipo: 'proc', proc: 'papanicolau', local: 'Consultório Ginecológico', desc: 'Realize a coleta simulada de citopatológico com privacidade e consentimento. Use a mesa ginecológica.', spotObj: 'mesa_gineco' },
    { id: 'go_casos2', titulo: 'Visita aos quartos', tipo: 'cases', n: 2, local: 'Alojamento e Quartos', desc: 'Atenda 2 pacientes internadas nos quartos.', local2: 'quarto' },
    { id: 'go_side', titulo: 'Equipe obstétrica', tipo: 'side', n: 1, local: 'GO', desc: 'Conclua 1 pedido da equipe no prazo.' },
    { id: 'go_cap', titulo: 'Desafio do Capítulo: Abortamentos', tipo: 'challenge', ch: 'aborto', area: 'go', local: 'Corredor', desc: 'A R1 Paula montou um treino-relâmpago: classifique os tipos de abortamento.', alvo: 'res_paula' },
    { id: 'go_prep', titulo: 'O manual da Gertrudes', tipo: 'find', obj: 'manual_go', item: 'q_papeis', local: 'Sala dos Residentes (GO)', desc: 'A Dra. Gertrudes exige que você leia o manual de condutas do serviço antes do "tribunal". Ele está em algum armário da GO.' },
    { id: 'go_boss', titulo: 'O Tribunal da Dra. Gertrudes', tipo: 'boss', alvo: 'sheila', local: 'GO', desc: 'Enfrente a Dra. Gertrudes na prova final de Ginecologia e Obstetrícia.' },
  ],
  cm: [
    { id: 'cm_intro', titulo: 'O Dr. Wagnão', tipo: 'talk', alvo: 'vladimir', local: 'Sala da Clínica Médica', desc: 'Apresente-se ao Dr. Wagnão na Sala da Clínica Médica.' },
    { id: 'cm_res', titulo: 'A visita', tipo: 'talk', alvo: 'res_kenji', local: 'Corredor da CM', desc: 'O R2 Kenji organiza a visita. Fale com ele.' },
    { id: 'cm_casos1', titulo: 'Visita aos quartos', tipo: 'cases', n: 3, local: 'Quartos 1 a 8', desc: 'Avalie 3 pacientes da enfermaria.' },
    { id: 'cm_proc', titulo: 'Toracocentese supervisionada', tipo: 'proc', proc: 'toraco', local: 'Sala de Procedimentos (CM)', desc: 'Participe da toracocentese simulada.' },
    { id: 'cm_side', titulo: 'A enfermaria é viva', tipo: 'side', n: 1, local: 'Clínica Médica', desc: 'Conclua 1 pedido da equipe no prazo.' },
    { id: 'cm_cap', titulo: 'Desafio do Capítulo: O Quarto Duplo', tipo: 'challenge', ch: 'quarto', area: 'cm', local: 'Posto (CM)', desc: 'A R3 Bia pediu ajuda: separe corretamente os dados de dois pacientes do mesmo quarto.', alvo: 'res_bia' },
    { id: 'cm_proc2', titulo: 'Acesso venoso central', tipo: 'proc', proc: 'cvc', local: 'Sala de Procedimentos (CM)', desc: 'Participe da passagem simulada de acesso venoso central.' },
    { id: 'cm_casos2', titulo: 'Casos complexos', tipo: 'cases', n: 2, local: 'Quartos', desc: 'Resolva mais 2 casos da enfermaria.' },
    { id: 'cm_boss', titulo: 'O Discurso Definitivo', tipo: 'boss', alvo: 'vladimir', local: 'Sala da Clínica Médica', desc: 'Enfrente o Dr. Wagnão na prova final de Clínica Médica.' },
  ],
  cir: [
    { id: 'cir_intro', titulo: 'O Dr. Leôncio', tipo: 'talk', alvo: 'laercio', local: 'Corredor Cirúrgico', desc: 'Apresente-se ao Dr. Leôncio. Sem gorro? Corra.' },
    { id: 'cir_res', titulo: 'Regras do bloco', tipo: 'talk', alvo: 'res_marina', local: 'Entrada do Centro Cirúrgico', desc: 'A R2 Marina explica as regras do centro cirúrgico.' },
    { id: 'cir_param', titulo: 'Paramentação', tipo: 'proc', proc: 'paramentacao', local: 'Vestiário', desc: 'Faça a paramentação simulada na pia do vestiário.', spotObj: 'pia', spotMap: 'cir' },
    { id: 'cir_casos1', titulo: 'Avaliação pré-operatória', tipo: 'cases', n: 2, local: 'Salas cirúrgicas', desc: 'Avalie 2 pacientes nas salas cirúrgicas.' },
    { id: 'cir_check', titulo: 'Cirurgia segura', tipo: 'proc', proc: 'checklist', local: 'Salas cirúrgicas', desc: 'Conduza o checklist de Cirurgia Segura em uma sala cirúrgica (interaja com a mesa de instrumentação).', spotObj: 'mesa_instrum' },
    { id: 'cir_side', titulo: 'O bloco depende de você', tipo: 'side', n: 1, local: 'Centro Cirúrgico', desc: 'Conclua 1 pedido da equipe no prazo.' },
    { id: 'cir_cap', titulo: 'Desafio do Capítulo: Os Três Momentos', tipo: 'challenge', ch: 'checklist', area: 'cir', local: 'Sala de Apoio', desc: 'O R1 Cauê quer testar seu domínio do checklist: classifique cada item no momento certo.', alvo: 'res_caue' },
    { id: 'cir_instrum', titulo: 'A mesa do instrumentador', tipo: 'proc', proc: 'instrumentacao', local: 'Salas cirúrgicas', desc: 'Monte a mesa de instrumentais (mesa de instrumentação de qualquer sala).', spotObj: 'mesa_instrum' },
    { id: 'cir_casos2', titulo: 'Decisões cirúrgicas', tipo: 'cases', n: 2, local: 'Salas cirúrgicas', desc: 'Resolva mais 2 casos cirúrgicos.' },
    { id: 'cir_boss', titulo: 'A Prova do Bico Fino', tipo: 'boss', alvo: 'laercio', local: 'Corredor Cirúrgico', desc: 'Enfrente o Dr. Leôncio na prova final de Cirurgia.' },
  ],
  ubs: [
    { id: 'ubs_intro', titulo: 'O Dr. Martinho Lutero', tipo: 'talk', alvo: 'martinho', local: 'Corredor da UBS', desc: 'Apresente-se ao preceptor Dr. Martinho Lutero no corredor da UBS Maria das Dores.' },
    { id: 'ubs_yasser', titulo: 'O grupo de estudos', tipo: 'talk', alvo: 'yasser', local: 'Sala de Estudos', desc: 'O Dr. Yasser lidera o grupo de recém-formados que estuda para a residência. Vá conhecê-lo.' },
    { id: 'ubs_casos1', titulo: 'Agenda do dia', tipo: 'cases', n: 2, local: 'Consultórios 1 a 5', desc: 'Atenda 2 pacientes nos consultórios (marcados com "!").' },
    { id: 'ubs_duvidas1', titulo: 'Explicar é aprender duas vezes', tipo: 'duvidas', n: 2, local: 'Sala de Estudos, Sala da Equipe e Sala de Grupos', desc: 'Resolva 2 sessões de dúvidas dos recém-formados (acerte pelo menos 2 de 3 em cada).' },
    { id: 'ubs_side', titulo: 'A equipe de Saúde da Família', tipo: 'side', n: 1, local: 'UBS', desc: 'Ajude a equipe com 1 pedido dentro do prazo.' },
    { id: 'ubs_casos2', titulo: 'Longitudinalidade', tipo: 'cases', n: 3, local: 'Consultórios', desc: 'Atenda mais 3 pacientes. Os casos agora são mais complexos.' },
    { id: 'ubs_cap', titulo: 'Desafio do Capítulo: Qual Nível de Prevenção?', tipo: 'challenge', ch: 'prevencao', area: 'ubs', local: 'Sala da Equipe', desc: 'A Dra. Bianca montou um treino: classifique cada ação como prevenção primária, secundária, terciária, quaternária ou quinquenária.', alvo: 'dra_bianca' },
    { id: 'ubs_duvidas2', titulo: 'Reta final para a residência', tipo: 'duvidas', n: 2, local: 'UBS', desc: 'Resolva mais 2 sessões de dúvidas dos recém-formados.' },
    { id: 'ubs_teses', titulo: 'As 95 Teses', tipo: 'find', obj: 'teses', item: 'q_teses', local: 'Almoxarifado e Copa', desc: 'As 95 Teses da Atenção Básica do Dr. Martinho sumiram da porta. Alguém guardou num armário do almoxarifado.' },
    { id: 'ubs_boss', titulo: 'A Reforma da Atenção Básica', tipo: 'boss', alvo: 'martinho', local: 'Corredor da UBS', desc: 'Devolva as teses e enfrente o Dr. Martinho Lutero na prova final da Atenção Básica.' },
  ],
};
// itens escondidos das missões principais (aparecem quando a etapa está ativa)
const MAIN_FIND = {
  caderno_leo: { map: 'upa', objType: 'mesa', near: [29, 18], nome: 'Caderninho do Leão' },
  caderneta: { map: 'ped', objType: 'brinquedos', near: [40, 7], nome: 'Caderneta de vacinação' },
  manual_go: { map: 'go', objType: 'armario', near: [40, 26], nome: 'Manual de condutas' },
  teses: { map: 'ubs', objType: 'armario', near: [34, 25], nome: 'As 95 Teses da Atenção Básica' },
};

/* ---------- Diálogos das etapas ---------- */
const STEP_DIALOGS = {
  upa_intro: { quem: 'leozao', falas: ['Opa... cê que é o interno novo... né? {nome}... bonito nome.', 'Eu sou o Leão... Leão Figura... preceptor aqui... da UPA.', 'Relaxa... aqui é tranquilo... (um alarme toca ao fundo) ...geralmente.', 'Os pacientes com um "!" em cima... tão te esperando. Chega perto... aperta E.', 'Abre o mapa com M... e o diário com J... pra não se perder. Eu me perdi... em 2009. Fiquei.', 'Eu fico por aqui... anotando umas coisas... no meu caderninho. Nada de mais.'] },
  upa_res: { quem: 'res_bruno', falas: ['E aí, {nome}! Eu sou o Bruno, R1. Dormi 2 horas. Bem-vindo!', 'De vez em quando alguém vai te pedir alguma coisa: café, papel, achar o ultrassom... Tem PRAZO. O contador aparece embaixo à esquerda.', 'Lá em cima tem a barra de Reputação do Interno. Azul é Bom Interno, vermelho é Mal Interno.', 'Reputação alta dá mais XP e mais recompensa. Reputação baixa... borra até o prontuário. Literalmente.', 'XP sobe seu nível e também compra habilidades na árvore (K). E as moedas? Gasta no bar do Rodolfo, do outro lado da rua.', 'Ah, e o Leão... parece que tá dormindo, mas cuidado. Ele vê tudo.'] },
  upa_pista_done: { quem: 'leozao', falas: ['Ah... cê achou... meu caderninho...', '"Dia 1: o interno {nome} chegou. Avaliar priorização, comunicação, conduta." É... sou eu.', 'Eu tava... te avaliando... desde o primeiro minuto.', 'Plantão sem pressa... é só pra quem sabe... ONDE tá a pressa de verdade.', '(Os olhos dele se abrem completamente pela primeira vez. A juba parece crescer.)', 'Quando cê tiver pronto... fala comigo. Vamo ver se cê aguenta... A VERDADE DO LEÃO.'] },
  ped_intro: { quem: 'sueli', falas: ['Então você é o interno. Hmpf. {nome}, é? Sou a Doutora Xuxa. Pediatria há 41 anos.', 'Regras: um, criança se pesa. Dois, criança se examina inteira. Três, os pais se escutam. Quatro, atrasou, perdeu.', 'Lactente não é escolar e escolar não é adolescente. Se você confundir, EU VOU SABER.', 'Vai falar com a Lu na sala dos residentes. E LAVA A MÃO.'] },
  ped_res: { quem: 'res_lu', falas: ['Oi, {nome}! Sobreviveu à Xuxa? Bom sinal.', 'Aqui tem enfermaria de bebês, infantil e de adolescentes. Cada idade tem doenças e sinais de alarme diferentes.', 'Frequência respiratória normal de um lactente seria taquipneia num escolar, por exemplo.', 'Com adolescente: conversa também a sós. Sigilo é direito dele, exceto quando há risco.', 'E se a Xuxa gritar... ela grita com todo mundo. Até com o diretor.'] },
  ped_prep_done: { quem: 'sueli', falas: ['A caderneta! Até que enfim. Vacinas... em dia. Hmpf.', 'Muito bem. Sente-se. Não. Fique em pé. A PROVA vai começar quando eu disser.', 'Venha falar comigo quando estiver pronto. E PRONTO quer dizer pronto.'] },
  go_intro: { quem: 'sheila', falas: ['Sou a Dra. Gertrudes. Não, não sou o capeta. Sou pior: sou preceptora de GO.', 'Que chifre? Isso é prendedor de cabelo. Próxima pergunta.', 'Aqui tem PS e tem quarto. No PS, pensa rápido. No quarto, pensa direito.', 'E se fizer Papanicolau sem explicar, sem consentimento ou sem privacidade, volta pro fim da fila. Do curso.'] },
  go_res: { quem: 'res_julia', falas: ['Oi, {nome}! Já levou a primeira bronca da Gertrudes? Não? Vai levar.', 'No PS chegam sangramentos de primeiro trimestre, corrimentos, gestantes com dor... O segredo é o diagnóstico diferencial.', 'Nos quartos ficam casos de investigação: amenorreia, dor pélvica crônica, sangramento uterino.', 'Respeito sempre. Em casos de diferenças do desenvolvimento sexual, nada de piadinha. A Gertrudes é brava, mas nisso ela é implacável.'] },
  go_prep_done: { quem: 'sheila', falas: ['Leu o manual? Leu MESMO, ou só olhou as figuras?', 'Hmpf. Veremos no tribunal. Venha quando estiver pronto(a).'] },
  cm_intro: { quem: 'vladimir', falas: ['Saudações, caríssimo(a) {nome}. Seja bem-vindo(a) a este sodalício da Clínica Médica, onde a semiologia se faz poesia.', 'Sou o Doutor Wagnão. Meu propósito é lapidar o diamante bruto do seu raciocínio até que reluza sob o fulgor da medicina interna.', 'Oito quartos. Dezesseis almas a serem compreendidas em sua plenitude fisiopatológica.', 'Dirija-se ao estimado Kenji, que orquestrará a sinfonia matinal da visita.'] },
  cm_res: { quem: 'res_kenji', falas: ['Tradução do que o Wagnão disse: vai lá falar com os pacientes.', 'São 8 quartos com 2 pacientes cada. Cuidado para não misturar as histórias do leito A com as do leito B.', 'Ele é rebuscado, mas sabe muito. Responde direito que ele te elogia com umas palavras que você nunca ouviu.'] },
  ubs_intro: { quem: 'martinho', falas: ['Seja bem-vindo(a), {nome}. Sou o Dr. Martinho Lutero, preceptor da UBS Maria das Dores.', 'Aqui ninguém compra indulgência para furar a fila: o acesso é por acolhimento e classificação de risco.', 'Escrevi 95 teses sobre a Atenção Básica. Pretendo pregá-las na porta da Secretaria de Saúde.', 'A primeira você já pode decorar: "a Atenção Básica é a porta de entrada preferencial do SUS". As outras 94 você aprende no caminho.', 'Vá até a Sala de Estudos. O Dr. Yasser e os recém-formados estão estudando para a residência e vivem cheios de dúvidas.'] },
  ubs_yasser: { quem: 'yasser', falas: ['E aí, {nome}! Dr. Yasser, formado há quatro meses. Trabalho aqui e estudo para a residência à noite.', 'Somos quatro no grupo: eu, a Dra. Camila, o Dr. Renan e a Dra. Bianca. Toda prova cobra Preventiva e SUS pesado.', 'Quando a gente travar em alguma dúvida, vai te chamar. Fala com qualquer um de nós.', 'E atender aqui é diferente do hospital: hipertensão, diabetes, pré-natal, puericultura, anticoncepção... e o paciente VOLTA.'] },
  ubs_teses_done: { quem: 'martinho', falas: ['As minhas teses! Estavam no almoxarifado, embaixo de uma caixa de seringas?', 'Agora sim. Hora de pregá-las na porta... e de ver se você consegue defendê-las.', 'Quando estiver pronto(a), fale comigo. A Reforma da Atenção Básica começa agora.'] },
  cir_intro: { quem: 'laercio', falas: ['Você. Interno. Parado aí. Quem deixou você entrar sem gorro?', 'Sou o Doutor Leôncio. Quarenta anos de bisturi. Sapato branco. Paciência nenhuma.', 'No meu centro cirúrgico, cada gaze tem nome e sobrenome. Se sumir uma, você vai morar aqui.', 'Vá falar com a Marina. E se tocar em alguma coisa estéril, eu vou saber.'] },
  cir_res: { quem: 'res_marina', falas: ['Respira, {nome}. Todo mundo treme na primeira vez com o Leôncio.', 'Primeiro: paramentação no vestiário. Depois: checklist de cirurgia segura antes de cada procedimento.', 'São 10 salas. Cada uma tem um paciente esperando avaliação. Aqui as condutas são cirúrgicas: o desafio é escolher a estratégia certa.', 'E nunca, NUNCA, corte fio com a Metzenbaum.'] },
};

/* ---------- Chefes ---------- */
const BOSSES = {
  leozao: {
    nome: 'Leão Figura', titulo: 'O Leão da UPA', area: 'upa', look: 'leozao', lookFinal: 'leozao_fera', cor: '#d99a2b', item: 'juba_leao', ach: 'boss_leozao',
    intro: ['Então... chegou a hora...', 'Eu passei esse plantão todo... de olho em você.', 'Agora... sem pressa... mas também sem perdão.'],
    fases: [
      { nome: 'Plantão Sem Pressa', rounds: ['quick', 'quick', 'case'], mec: 'lentidao', atk: { nome: 'Calma, calma...', dano: 9, desc: 'Lentidão: seu próximo raciocínio terá menos tempo.' }, fala: ['Calma... devagar... (o cronômetro parece andar mais rápido)', 'Que pressa é essa...?'] },
      { nome: 'A UPA Virou um Caos', rounds: ['triage', 'case', 'quick'], mec: 'caos', atk: { nome: 'Fila Infinita', dano: 12, desc: 'A sala de espera transborda.' }, fala: ['Olha a fila... OLHA A FILA!', 'Chegou SAMU, chegou criança, chegou o pedido de atestado...'] },
      { nome: 'A Verdade do Leão', rounds: ['case', 'quick', 'case'], mec: 'telegrafo', atk: { nome: 'Rugido do Plantão', dano: 20, desc: 'Um rugido que ecoa pelos corredores.' }, fala: ['AGORA CÊ VAI VER... O LEÃO ACORDADO!', 'Prioriza... PRIORIZA!'] },
    ],
    vitoria: ['(Leão boceja e a juba volta ao normal.)', 'É... cê passou... no meu teste. De verdade.', 'Toma... essa juba de broche. Pra lembrar... que a calma vem DEPOIS de saber o que fazer.', 'Vai... o próximo estágio te espera. Eu vou... tirar um cochilo.'],
  },
  sueli: {
    nome: 'Dra. Xuxa', titulo: 'A Guardiã da Curva de Crescimento', area: 'ped', look: 'sueli', cor: '#f4b942', item: 'chupeta_dourada', ach: 'boss_sueli',
    intro: ['Prova surpresa. Não é surpresa porque eu avisei. Mas é surpresa.', 'Errou, eu interrompo. Atrasou, eu reprovo. Entendeu? NÃO RESPONDE, COMEÇA.'],
    fases: [
      { nome: 'A Prova Surpresa', rounds: ['quick', 'quick', 'quick'], mec: 'bronca', atk: { nome: 'Cadê a Curva?!', dano: 9, desc: 'Uma bronca ensurdecedora.' }, fala: ['ERRADO! Quer dizer... ainda não. Responde!', 'Isso é resposta de quem não pesou a criança!'] },
      { nome: 'A Enfermaria em Alerta', rounds: ['idade', 'triage', 'idade'], mec: 'alarme', atk: { nome: 'Alarme da Enfermaria', dano: 12, desc: 'Um monitor dispara no fundo.' }, fala: ['Ouviu esse alarme? Qual criança você vê primeiro?', 'Lactente, escolar, adolescente: NÃO MISTURA!'] },
      { nome: 'O Último Caso da Dra. Xuxa', rounds: ['case', 'case'], mec: 'ultimo', atk: { nome: 'Olhar por Cima dos Óculos', dano: 16, desc: 'Você sente o peso de 41 anos de pediatria.' }, fala: ['Último caso. O MEU caso.', 'Pensa na idade, pensa no peso, pensa na família.'] },
    ],
    vitoria: ['(Xuxa tira os óculos e, pela primeira vez, sorri. Um pouco.)', 'Hmpf. Você pesou a criança. Examinou inteira. Escutou a mãe.', 'Toma. A chupeta dourada. É simbólica. NÃO COLOCA NA BOCA.', 'Pode ir. E lava a mão na saída.'],
  },
  sheila: {
    nome: 'Dra. Gertrudes', titulo: 'A Senhora do Tribunal Obstétrico', area: 'go', look: 'sheila', cor: '#e2738c', item: 'tridente_sheila', ach: 'boss_sheila',
    intro: ['Bem-vindo ao meu tribunal.', 'Aqui a ré é a sua dúvida. E eu sou juíza, júri e preceptora.'],
    fases: [
      { nome: 'Diagnósticos que se Confundem', rounds: ['dxonly', 'quick', 'dxonly'], mec: 'confusao', atk: { nome: 'Olhar Fulminante', dano: 10, desc: 'Os chifres brilham levemente.' }, fala: ['DI-FE-REN-CI-AL!', 'Incompleto ou inevitável? Pensa no colo!'] },
      { nome: 'Plantão Obstétrico', rounds: ['triage', 'aborto', 'case'], mec: 'plantao', atk: { nome: 'Sangramento no Terceiro Trimestre', dano: 13, desc: 'Três gestantes chegam ao mesmo tempo.' }, fala: ['Quem você vê primeiro? RÁPIDO!', 'Prévia não se toca! Descolamento não espera!'] },
      { nome: 'O Tribunal da Dra. Gertrudes', rounds: ['case', 'comunica', 'case'], mec: 'pressao', atk: { nome: 'Pressão Psicológica', dano: 11, desc: 'Você acumula pressão: menos dano e menos tempo (as respostas certas não mudam).' }, fala: ['Tem certeza? TEM CERTEZA?', 'O júri está... decepcionado.'] },
    ],
    vitoria: ['(Os chifres da Dra. Gertrudes param de brilhar.)', 'Hmpf. Absolvido(a). Por unanimidade.', 'Leve este tridente. É um prendedor de cabelo. Não pergunte.', 'E da próxima vez que vir um sangramento de terceiro trimestre... lembre de mim.'],
  },
  vladimir: {
    nome: 'Dr. Wagnão', titulo: 'O Orador da Medicina Interna', area: 'cm', look: 'vladimir', cor: '#5b8def', item: 'caneta_tinteiro', ach: 'boss_vladimir',
    intro: ['Eis que chegamos ao clímax desta odisseia formativa.', 'Que nossas mentes se entrelacem num duelo de argumentos fisiopatológicos!'],
    fases: [
      { nome: 'Argumentação Clínica', rounds: ['quick', 'case', 'quick'], mec: 'retorica', atk: { nome: 'Retórica Ofuscante', dano: 9, desc: 'Um véu de palavras rebuscadas cobre as alternativas por alguns segundos.' }, fala: ['Contemplemos, pois, a etiologia em sua magnificência!', 'Que hipótese... deliciosamente plausível. Ou não?'] },
      { nome: 'A Enfermaria Complexa', rounds: ['quarto', 'case'], mec: 'enfermaria', atk: { nome: 'Visita Interminável', dano: 12, desc: 'Dezesseis evoluções. Uma caneta.' }, fala: ['Leito A ou leito B? A distinção, meu caro, é a essência!', 'Não confunda as almas que compartilham o mesmo quarto!'] },
      { nome: 'O Discurso Definitivo', rounds: ['duplo', 'duplo'], mec: 'discurso', atk: { nome: 'Discurso Definitivo', dano: 15, desc: 'Um monólogo de 40 minutos sobre o potássio.' }, fala: ['E assim, como diria a fisiologia renal em sua sabedoria ancestral...', 'Integre! INTEGRE!'] },
    ],
    vitoria: ['(Dr. Wagnão aplaude lentamente.)', 'Esplêndido. Magnânimo. Fisiopatologicamente irrepreensível.', 'Aceite esta caneta-tinteiro. Que ela registre evoluções dignas de epopeia.', 'Vá, nobre interno(a). O mundo clama por raciocínios como o seu.'],
  },
  laercio: {
    nome: 'Dr. Leôncio', titulo: 'O Bico Fino Implacável', area: 'cir', look: 'laercio', cor: '#e9f2f7', item: 'sapato_bico', ach: 'boss_laercio',
    intro: ['Prova final. Sem gorro, sem chance.', 'Se errar, eu te mando instrumentar cirurgia de unha encravada até o fim do ano.'],
    fases: [
      { nome: 'A Checagem do Centro Cirúrgico', rounds: ['checklist', 'materiais', 'checklist'], mec: 'checagem', atk: { nome: 'Inspeção com Luva Branca', dano: 10, desc: 'Ele passa o dedo na mesa. Encontra poeira imaginária.' }, fala: ['Cadê a contagem de compressas?!', 'Isso é campo estéril ou toalha de praia?'] },
      { nome: 'O Mapa de Dez Salas', rounds: ['triage', 'case', 'triage'], mec: 'dez_salas', atk: { nome: 'Dez Salas, Uma Mente', dano: 13, desc: 'Todas as salas chamam ao mesmo tempo.' }, fala: ['Qual sala primeiro? QUAL?', 'Politrauma instável não espera eletiva!'] },
      { nome: 'A Prova do Bico Fino', rounds: ['case', 'case', 'case'], mec: 'bico_fino', atk: { nome: 'Chute de Bico Fino', dano: 20, desc: 'Humilhação máxima (e simbólica). O tempo encurta a cada rodada.' }, fala: ['Minha avó responde mais rápido. E ela tá dormindo.', 'MAIS RÁPIDO. E CERTO.'] },
    ],
    vitoria: ['(O Dr. Leôncio olha para você por um longo tempo.)', '...Aceitável. Não. Bom. Muito bom. Não conte pra ninguém que eu disse isso.', 'Leve meus sapatos de bico fino. Tenho outros 14 pares iguais.', 'Agora saia do meu centro cirúrgico antes que eu mude de ideia.'],
  },
};


BOSSES.martinho = {
  nome: 'Dr. Martinho Lutero', titulo: 'O Reformador da Atenção Básica', area: 'ubs', look: 'martinho', lookFinal: 'martinho_reforma', cor: '#3f8fd6', item: 'pergaminho_teses', ach: 'boss_martinho',
  intro: ['Aqui estou. Não posso fazer outra coisa.', 'Noventa e cinco teses. Cada pergunta, uma tese. Cada erro, uma indulgência que você vai ter que pagar.'],
  fases: [
    { nome: 'As 95 Teses', rounds: ['quick', 'quick', 'case'], mec: 'teses', atk: { nome: 'Martelada na Porta', dano: 10, desc: 'Ele prega mais uma tese. O barulho ecoa pela UBS.' }, fala: ['Tese nº 12: rastreamento sem indicação não é cuidado!', 'Tese nº 31: prevalência não é incidência!', 'Tese nº 54: o conselho de saúde é paritário!'] },
    { nome: 'Acolhimento Lotado', rounds: ['triage', 'case', 'quick'], mec: 'alarme', atk: { nome: 'Fila do Acolhimento', dano: 12, desc: 'A recepção enche de uma vez.' }, fala: ['Quem entra primeiro? Gravidade, não ordem de chegada!', 'Acolher é escutar e classificar. Rápido!'] },
    { nome: 'A Reforma da Atenção Básica', rounds: ['case', 'quick', 'case'], mec: 'reforma', atk: { nome: 'Sermão de Worms', dano: 16, desc: 'Um sermão inteiro sobre a Lei 8.142. O tempo encurta a cada rodada.' }, fala: ['Retrate-se! Ou responda certo.', 'Longitudinalidade! Integralidade! Coordenação do cuidado!'] },
  ],
  vitoria: ['(O Dr. Martinho guarda o martelo e sorri.)', 'Você defendeu as teses melhor do que muito doutor que eu conheço.', 'Leve este pergaminho. São as 95 teses, assinadas. A 96ª é sua: "o cuidado continua depois da consulta".', 'Vá. E lembre: quando é bem feita, a Atenção Básica resolve a maior parte dos problemas de saúde da população.'],
};

/* ---------- Respostas profissionais (rodadas de comunicação) ---------- */
const COMUNICA = [
  { q: 'A paciente com abortamento retido chora e pergunta se "fez algo errado".', o: ['Acolher, explicar que na maioria das vezes a perda ocorre por alterações cromossômicas e não por algo que ela fez, e oferecer apoio', 'Dizer que deve ter sido estresse no trabalho', 'Mudar de assunto rapidamente', 'Dizer que isso acontece toda hora e não é nada'] },
  { q: 'A família pergunta o diagnóstico de uma paciente lúcida que pediu sigilo.', o: ['Respeitar o sigilo e orientar que a própria paciente decidirá o que compartilhar', 'Contar tudo porque são da família', 'Mentir sobre o diagnóstico', 'Pedir para a técnica contar'] },
  { q: 'Adolescente grávida de 16 anos pede para não contar aos pais agora.', o: ['Garantir confidencialidade, avaliar riscos e rede de apoio e estimular a participação de um adulto de confiança', 'Ligar para os pais imediatamente', 'Recusar o atendimento sem responsável', 'Dar um sermão sobre contracepção'] },
  { q: 'Você errou a conduta e o residente percebeu antes de qualquer dano.', o: ['Reconhecer o erro, agradecer a correção e revisar o raciocínio', 'Culpar a enfermagem', 'Esconder o prontuário', 'Dizer que foi um teste'] },
  { q: 'Paciente com DDS (insensibilidade aos andrógenos) pergunta sobre o próprio corpo.', o: ['Explicar com linguagem clara e respeitosa, sem julgamentos, e oferecer apoio psicológico e acompanhamento', 'Evitar responder para não constranger', 'Chamar colegas para "ver o caso raro"', 'Usar termos técnicos sem explicar'] },
];

/* ---------- Interrupções do caos (Leão fase 2) ---------- */
const INTERRUPCOES = [
  { q: 'O R1 pede café AGORA enquanto chega um paciente sem pulso.', o: ['"Já levo, primeiro o paciente crítico!"', 'Correr para a copa', 'Ignorar os dois'], c: 0 },
  { q: 'A impressora travou com a prescrição do paciente grave.', o: ['Pedir a prescrição manual assinada e avisar a TI depois', 'Consertar a impressora por 20 minutos', 'Esperar alguém resolver'], c: 0 },
  { q: 'Acompanhante grita na recepção pedindo notícias.', o: ['Acolher e chamar o médico responsável para atualizar', 'Gritar de volta', 'Fingir que não ouviu'], c: 0 },
  { q: 'Alguém pede atestado no meio de uma PCR.', o: ['"Assim que a emergência acabar, você será atendido."', 'Fazer o atestado ali mesmo', 'Mandar embora sem avaliar'], c: 0 },
];
