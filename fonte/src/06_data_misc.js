/* =====================================================================
   QUESTÕES RÁPIDAS, TRIAGENS, DESAFIOS DE CAPÍTULO, PROCEDIMENTOS,
   RIVAIS, EVENTOS E CONQUISTAS
   ===================================================================== */
const QUICK = [];
function QQ(a, q, o, e) { QUICK.push({ a, q, o, e }); }
// UPA
QQ('upa', 'Frequência de compressões torácicas na RCP do adulto?', ['100 a 120 por minuto', '60 a 80 por minuto', '140 a 160 por minuto', '80 a 90 por minuto'], 'A diretriz recomenda 100–120 compressões/min.');
QQ('upa', 'Profundidade das compressões no adulto?', ['5 a 6 cm', '2 a 3 cm', '8 a 10 cm', '3 a 4 cm'], 'Pelo menos 5 cm, sem ultrapassar 6 cm.');
QQ('upa', 'Quais ritmos de PCR são chocáveis?', ['Fibrilação ventricular e TV sem pulso', 'Assistolia e atividade elétrica sem pulso', 'BAV total e bradicardia sinusal grave', 'Fibrilação atrial e flutter atrial'], 'Apenas FV e TV sem pulso são chocáveis.');
QQ('upa', 'Janela habitual para trombólise IV no AVC isquêmico?', ['Até 4,5 horas do início dos sintomas', 'Até 24 horas, sempre', 'Somente nos primeiros 30 minutos', 'Em qualquer momento'], 'A trombólise IV é indicada até 4,5h (casos selecionados podem ter outras estratégias).');
QQ('upa', 'Antídoto da intoxicação por opioides?', ['Naloxona', 'Flumazenil', 'Atropina', 'N-acetilcisteína'], 'Naloxona reverte a depressão respiratória por opioides.');
QQ('upa', 'Antídoto da intoxicação por paracetamol?', ['N-acetilcisteína', 'Azul de metileno', 'Vitamina K', 'Flumazenil'], 'N-acetilcisteína repõe glutationa.');
QQ('upa', 'Primeira linha para agitação por intoxicação por cocaína?', ['Benzodiazepínico', 'Betabloqueador isolado', 'Naloxona', 'Flumazenil'], 'Benzodiazepínicos reduzem a hiperatividade simpática.');
QQ('upa', 'Glasgow mínimo possível?', ['3', '0', '1', '5'], 'A escala vai de 3 a 15.');
QQ('upa', 'Tríade de Beck (tamponamento cardíaco)?', ['Hipotensão, abafamento de bulhas e turgência jugular', 'Febre, icterícia e dor em hipocôndrio direito', 'Bradicardia, hipertensão e respiração irregular', 'Dor, palidez e ausência de pulso no membro'], 'É a tríade clássica do tamponamento.');
QQ('upa', 'Ordem do atendimento inicial ao politraumatizado?', ['X-A-B-C-D-E', 'A-B-C sem controle de hemorragia', 'D-C-B-A', 'Exames de imagem primeiro'], 'Hemorragia exsanguinante (X), via aérea, ventilação, circulação, neurológico, exposição.');
QQ('upa', 'Dengue com sinais de alarme: qual medicação evitar?', ['AAS e anti-inflamatórios', 'Dipirona e paracetamol', 'Soro fisiológico venoso', 'Soro de reidratação oral'], 'Risco de sangramento.');
QQ('upa', 'IAM com supra: qual a prioridade?', ['Reperfusão o mais rápido possível', 'Teste ergométrico antes de tudo', 'Aguardar a troponina seriada', 'Alta com analgésico e retorno'], 'Tempo é músculo.');
// PED
QQ('ped', 'Faixa etária típica da bronquiolite viral?', ['Menores de 2 anos', '5 a 10 anos', 'Adolescentes', 'Adultos jovens'], 'Principalmente lactentes.');
QQ('ped', 'Principal agente da bronquiolite?', ['Vírus sincicial respiratório', 'Influenza B', 'Staphylococcus aureus', 'Streptococcus pneumoniae'], 'O VSR é o principal agente.');
QQ('ped', 'Icterícia nas primeiras 24h de vida é:', ['Sempre patológica', 'Sempre fisiológica', 'Típica do leite materno', 'Normal em todo RN'], 'Exige investigação (hemólise).');
QQ('ped', 'Exantema que surge quando a febre desaparece?', ['Exantema súbito', 'Sarampo', 'Escarlatina', 'Doença mão-pé-boca'], 'Típico do HHV-6/7.');
QQ('ped', 'Manchas de Koplik são características de:', ['Sarampo', 'Rubéola', 'Escarlatina', 'Caxumba'], 'Enantema patognomônico do sarampo.');
QQ('ped', 'Língua em framboesa + sinal de Pastia sugerem:', ['Escarlatina', 'Sarampo', 'Eritema infeccioso', 'Roséola'], 'Exantema estreptocócico.');
QQ('ped', 'Na varicela, qual medicação evitar?', ['AAS', 'Paracetamol', 'Anti-histamínico', 'Loção de calamina'], 'Risco de síndrome de Reye.');
QQ('ped', 'Fezes em "geleia de morango" + massa em salsicha:', ['Intussuscepção', 'APLV', 'Gastroenterite viral', 'Doença celíaca'], 'Tríade clássica com dor paroxística.');
QQ('ped', 'Taquipneia em lactente de 2 a 11 meses (OMS):', ['FR ≥ 50 irpm', 'FR ≥ 30 irpm', 'FR ≥ 70 irpm', 'FR ≥ 20 irpm'], 'Limiar da OMS para essa faixa.');
QQ('ped', 'Antitussígenos e descongestionantes em menores de 2 anos:', ['São contraindicados', 'São primeira linha', 'São obrigatórios', 'São iguais a placebo e sem risco'], 'Risco de eventos adversos graves.');
QQ('ped', 'Febre em criança com anemia falciforme exige:', ['Antibiótico parenteral empírico precoce', 'Apenas antitérmico e observação em casa', 'Esperar 72 horas de febre', 'Transfusão de hemácias sempre'], 'Asplenia funcional → risco de sepse.');
QQ('ped', 'Cardiopatia cianótica canal-dependente: o que manter o canal aberto?', ['Prostaglandina E1', 'Indometacina', 'Ibuprofeno', 'Oxigênio a 100% isolado'], 'PGE1 mantém o canal arterial.');
// GO
QQ('go', 'Sangramento vermelho vivo e indolor no 3º trimestre:', ['Placenta prévia', 'Descolamento prematuro de placenta', 'Rotura uterina', 'Trabalho de parto'], 'Indolor e vivo = prévia.');
QQ('go', 'Útero hipertônico e doloroso com sangramento escuro:', ['Descolamento prematuro de placenta', 'Placenta prévia centro-total', 'Rotura uterina completa', 'Trabalho de parto prematuro'], 'Clássico do DPP.');
QQ('go', 'Na suspeita de placenta prévia, o que NÃO fazer?', ['Toque vaginal', 'Ultrassom', 'Monitorizar o feto', 'Avaliar sinais vitais'], 'O toque pode desencadear hemorragia.');
QQ('go', 'Colo fechado + embrião com BCF + sangramento discreto:', ['Ameaça de abortamento', 'Abortamento inevitável', 'Abortamento retido', 'Abortamento incompleto'], 'Gestação ainda viável.');
QQ('go', 'Odor de peixe + células-guia:', ['Vaginose bacteriana', 'Candidíase vulvovaginal', 'Tricomoníase', 'Gonorreia'], 'Critérios de Amsel.');
QQ('go', 'Tratamento adequado da sífilis na gestante:', ['Penicilina benzatina', 'Azitromicina', 'Doxiciclina', 'Ceftriaxona isolada'], 'Só a penicilina previne sífilis congênita de forma adequada.');
QQ('go', 'Colo uterino "em framboesa":', ['Tricomoníase', 'Candidíase', 'Vaginose', 'Herpes'], 'Colpite macular.');
QQ('go', 'Cariótipo da insensibilidade completa aos andrógenos:', ['46,XY', '46,XX', '45,X', '47,XXY'], 'Síndrome de Morris.');
QQ('go', 'Amenorreia primária + anosmia:', ['Síndrome de Kallmann', 'Síndrome de Turner', 'MRKH', 'SOP'], 'Hipogonadismo hipogonadotrófico com anosmia.');
QQ('go', 'Critérios de Rotterdam para SOP: quantos são necessários?', ['2 de 3', '3 de 3', '1 de 3', '4 de 5'], 'Após excluir outras causas.');
QQ('go', 'Útero globoso, aumentado difusamente, em multípara com dismenorreia:', ['Adenomiose', 'Mioma', 'Pólipo', 'Endometrioma'], 'Clássico da adenomiose.');
QQ('go', 'Exame que diagnostica e trata o pólipo endometrial:', ['Histeroscopia', 'Colposcopia', 'Laparoscopia', 'Mamografia'], 'Polipectomia histeroscópica.');
// CM
QQ('cm', 'No CURB-65, o "C" significa:', ['Confusão mental', 'Creatinina', 'Cianose central', 'Cefaleia'], 'Confusão, Ureia, FR, PA, idade ≥65.');
QQ('cm', 'CD4 que indica profilaxia para pneumocistose:', ['Abaixo de 200 células/mm³', 'Abaixo de 500 células/mm³', 'Abaixo de 1.000 células/mm³', 'Acima de 350 células/mm³'], 'Sulfametoxazol-trimetoprima.');
QQ('cm', 'ECG clássico da cardiopatia chagásica:', ['BRD + bloqueio divisional anterossuperior', 'Supra de ST difuso com infra de PR', 'Onda delta e PR curto', 'Onda T apiculada isolada'], 'BRD + BDAS.');
QQ('cm', 'Primeira linha farmacológica no DM2 sem contraindicação:', ['Metformina', 'Insulina NPH', 'Glibenclamida', 'Acarbose'], 'Com mudança de estilo de vida.');
QQ('cm', 'Potássio mínimo para iniciar insulina na CAD:', ['3,3 mEq/L', '2,0 mEq/L', '5,5 mEq/L', 'Não importa'], 'Abaixo disso, repor primeiro.');
QQ('cm', 'Bastonetes de Auer sugerem:', ['Leucemia mieloide aguda', 'Leucemia linfoide aguda', 'Linfoma de Hodgkin', 'Mieloma múltiplo'], 'Marcador da linhagem mieloide.');
QQ('cm', 'Classe que faz parte dos 4 pilares da ICFEr:', ['Inibidor de SGLT2', 'Verapamil', 'Digoxina isolada', 'Anti-inflamatório'], 'iSGLT2 reduz mortalidade e internações.');
QQ('cm', 'LDL ≥ 190 mg/dl sem outras causas:', ['Estatina de alta potência', 'Somente dieta por 5 anos', 'Fibrato', 'Ômega-3'], 'Hipercolesterolemia grave.');
QQ('cm', 'Nifedipino sublingual na PA elevada:', ['Contraindicado', 'Primeira linha', 'Indicado sempre', 'Recomendado em idosos'], 'Hipotensão abrupta e isquemia.');
QQ('cm', 'Sinal de Lasègue positivo sugere:', ['Radiculopatia lombar', 'Meningite bacteriana', 'Apendicite aguda', 'Colecistite aguda'], 'Estiramento da raiz nervosa.');
QQ('cm', 'Inibidor de colinesterase usado na doença de Alzheimer:', ['Donepezila', 'Haloperidol', 'Levodopa', 'Clonazepam'], 'Tratamento sintomático.');
QQ('cm', 'Pneumocistose com PaO₂ < 70 mmHg: o que associar ao SMX-TMP?', ['Corticoide', 'Anfotericina', 'Rifampicina', 'Nada'], 'Reduz mortalidade.');
// CIR
QQ('cir', 'Tríade de Charcot:', ['Febre, icterícia e dor em hipocôndrio direito', 'Dor, palidez e ausência de pulso', 'Hipotensão, bulhas abafadas e jugular túrgida', 'Cefaleia, vômitos e papiledema'], 'Colangite aguda.');
QQ('cir', 'Lesão biconvexa (em lente) na TC de crânio:', ['Hematoma extradural', 'Hematoma subdural', 'Hemorragia subaracnóidea', 'Contusão'], 'Geralmente arterial.');
QQ('cir', 'Coleção em crescente (côncavo-convexa) na TC:', ['Hematoma subdural', 'Hematoma extradural', 'AVC isquêmico', 'Abscesso'], 'Veias pontes.');
QQ('cir', 'Vesícula palpável e indolor com icterícia sugere:', ['Neoplasia periampular', 'Colecistite aguda', 'Hepatite A', 'Cólica biliar'], 'Sinal de Courvoisier-Terrier.');
QQ('cir', 'Cirurgia para tumor ressecável de cabeça de pâncreas:', ['Duodenopancreatectomia', 'Colecistectomia', 'Gastrectomia total', 'Esplenectomia isolada'], 'Cirurgia de Whipple.');
QQ('cir', 'Pneumotórax hipertensivo: conduta imediata?', ['Descompressão torácica', 'Raio-X de tórax primeiro', 'TC de tórax urgente', 'Observação e oxigênio'], 'Diagnóstico clínico.');
QQ('cir', 'Momentos do checklist de Cirurgia Segura (OMS):', ['Antes da indução, antes da incisão e antes de sair da sala', 'Só antes da incisão, com a equipe completa', 'Só ao final da cirurgia, antes do curativo', 'Na admissão hospitalar, na indução anestésica e na alta'], 'Sign in, time out e sign out.');
QQ('cir', 'Cálculo ureteral obstrutivo com infecção:', ['Desobstrução urgente (duplo J ou nefrostomia)', 'Analgesia, antibiótico oral e alta', 'Ureteroscopia com litotripsia imediata, sem drenar', 'Aguardar a eliminação espontânea'], 'Rim infectado e obstruído precisa ser drenado.');
QQ('cir', 'Índice tornozelo-braquial < 0,4 com dor em repouso:', ['Isquemia crítica', 'Normal', 'Insuficiência venosa', 'Claudicação leve'], 'Membro ameaçado.');
QQ('cir', 'Cirurgia de Hartmann:', ['Ressecção com colostomia terminal e coto retal fechado', 'Colectomia total com anastomose ileorretal', 'Apendicectomia com drenagem da cavidade', 'Gastroenteroanastomose em Y de Roux'], 'Opção segura na urgência.');
QQ('cir', 'Paciente instável, FAST positivo, não respondedor:', ['Laparotomia de urgência', 'Tomografia de abdome', 'Observação', 'Laparoscopia eletiva'], 'TC só em estáveis.');
QQ('cir', 'Pancreatite biliar leve: quando retirar a vesícula?', ['Na mesma internação', 'Somente após nova crise', 'Nunca', 'Após 1 ano'], 'Reduz recorrência.');

/* ---------- Triagens (ordenar por prioridade: 1 = mais urgente) ---------- */
const TRIAGENS = {
  upa: [
    [{ t: 'Homem, 60 anos, dor torácica em aperto há 30 min, sudoreico', p: 2 }, { t: 'Mulher, 25 anos, entorse de tornozelo, caminha com dor', p: 4 }, { t: 'Criança de 3 anos convulsionando neste momento', p: 1 }, { t: 'Homem, 40 anos, febre e tosse há 2 dias, sinais vitais estáveis', p: 3 }],
    [{ t: 'Idosa com fraqueza súbita no braço direito há 40 minutos', p: 2 }, { t: 'Jovem pedindo atestado por dor de cabeça leve, sem sinais de alarme', p: 4 }, { t: 'Homem que não responde, sem respiração normal, na recepção', p: 1 }, { t: 'Mulher com dor abdominal moderada e vômitos há 6 horas, estável', p: 3 }],
    [{ t: 'Motociclista com PA 78/40 e sangramento ativo na coxa', p: 1 }, { t: 'Adolescente com corte superficial no dedo, sangramento controlado', p: 4 }, { t: 'Asmático falando frases curtas, SpO₂ 90%', p: 2 }, { t: 'Idoso com disúria e febre de 38 °C, lúcido e estável', p: 3 }],
  ],
  ped: [
    [{ t: 'Lactente de 2 meses com apneia e SpO₂ 85%', p: 1 }, { t: 'Criança de 6 anos com piolho', p: 4 }, { t: 'Criança falciforme de 4 anos com febre de 39 °C', p: 2 }, { t: 'Criança de 7 anos com crise de asma leve, falando frases completas', p: 3 }],
    [{ t: 'RN de 18h com icterícia até o umbigo', p: 2 }, { t: 'Criança de 9 anos com tórax silencioso e sonolenta', p: 1 }, { t: 'Lactente de 8 meses com coriza, mamando bem', p: 4 }, { t: 'Criança de 5 anos com exantema áspero e faringite', p: 3 }],
  ],
  go: [
    [{ t: 'Gestante 30 sem, útero lenhoso, BCF 100, sangramento escuro', p: 1 }, { t: 'Mulher com corrimento e prurido há 1 semana', p: 4 }, { t: 'Gestante 9 sem, sangramento discreto, estável', p: 3 }, { t: 'Atraso de 7 sem, dor pélvica forte, PA 90/60', p: 2 }],
    [{ t: 'Placenta prévia com sangramento intenso e PA 80/50', p: 1 }, { t: 'Gestante 20 sem com VDRL reagente, assintomática', p: 4 }, { t: 'Abortamento com febre de 39 °C e secreção fétida', p: 2 }, { t: 'Gestante 10 sem com cólicas e colo entreaberto, estável', p: 3 }],
  ],
  cm: [
    [{ t: 'Leito 3: pH 7,10, glicemia 520, potássio 2,9', p: 1 }, { t: 'Leito 7: aguardando receita de alta', p: 4 }, { t: 'Leito 5: febre nova de 38,5 °C, PA estável', p: 3 }, { t: 'Leito 1: PA 84/50, confuso, lactato 3,8', p: 2 }],
    [{ t: 'Leito 12: SpO₂ 82%, dispneia súbita', p: 1 }, { t: 'Leito 9: dor lombar irradiada, sem déficit', p: 4 }, { t: 'Leito 2: PA 218/128, sem lesão de órgão-alvo', p: 3 }, { t: 'Leito 14: plaquetas 22 mil, sangramento gengival, febre', p: 2 }],
  ],
  cir: [
    [{ t: 'Sala 1: politrauma instável com FAST positivo', p: 1 }, { t: 'Sala 6: hérnia inguinal eletiva', p: 4 }, { t: 'Sala 4: colecistite aguda, estável', p: 3 }, { t: 'Sala 2: hematoma subdural agudo com desvio de 8 mm', p: 2 }],
    [{ t: 'Sala 3: pneumotórax hipertensivo', p: 1 }, { t: 'Sala 9: lobectomia programada estágio I', p: 4 }, { t: 'Sala 7: ureterolitíase obstrutiva com febre', p: 2 }, { t: 'Sala 10: apendicite não complicada', p: 3 }],
  ],
};

/* ---------- Desafio Pediátrico: lactente x criança maior x adolescente ---------- */
const IDADE_OPCOES = ['Lactente (até 1 ano)', 'Pré-escolar ou escolar', 'Adolescente'];
const DESAFIO_IDADE = [
  { t: 'Primeiro episódio de sibilância após coriza, VSR positivo, crepitações difusas.', r: 0, e: 'Bronquiolite é doença de lactentes.' },
  { t: 'Faringite exsudativa com exantema áspero e língua em framboesa.', r: 1, e: 'Escarlatina predomina entre 3 e 12 anos.' },
  { t: 'FR de 45 irpm em repouso, considerada NORMAL para a idade.', r: 0, e: 'Em lactentes jovens, FR até cerca de 50–60 é esperada; em escolares seria taquipneia.' },
  { t: 'Choro paroxístico com flexão das pernas e fezes em geleia.', r: 0, e: 'A intussuscepção é mais comum entre 3 meses e 3 anos, com pico no primeiro ano.' },
  { t: 'Crises de pânico em ano de vestibular, pede sigilo na consulta.', r: 2, e: 'Contexto e direito à confidencialidade da adolescência.' },
  { t: 'Desatenção e inquietude relatadas pela professora em casa e na escola.', r: 1, e: 'O TDAH costuma ser percebido na idade escolar.' },
  { t: 'Exantema surge quando a febre alta de 3 dias desaparece.', r: 0, e: 'Exantema súbito acomete principalmente 6 meses a 2 anos.' },
  { t: 'Atraso menstrual e beta-hCG positivo.', r: 2, e: 'Gravidez na adolescência.' },
  { t: 'Sangue e muco nas fezes em uso de fórmula infantil, ganho de peso normal.', r: 0, e: 'Proctocolite alérgica é típica dos primeiros meses.' },
  { t: 'Lêndeas aderidas aos fios e surto na sala de aula.', r: 1, e: 'Pediculose é típica de escolares.' },
];

/* ---------- Desafio GO: qual tipo de abortamento? ---------- */
const ABORT_OPCOES = ['Ameaça de abortamento', 'Abortamento inevitável', 'Abortamento incompleto', 'Abortamento completo', 'Abortamento retido', 'Abortamento infectado'];
const DESAFIO_ABORTO = [
  { t: 'Colo fechado, embrião com BCF, sangramento discreto.', r: 0 },
  { t: 'Colo dilatado com bolsa protrusa, conteúdo ainda intrauterino.', r: 1 },
  { t: 'Colo aberto, restos ovulares, cavidade com conteúdo heterogêneo de 25 mm.', r: 2 },
  { t: 'Colo fechado, cavidade vazia, sintomas cessaram após eliminação (gestação tópica prévia).', r: 3 },
  { t: 'Colo fechado, embrião de 8 mm sem BCF, paciente assintomática.', r: 4 },
  { t: 'Febre, secreção purulenta fétida e útero doloroso após manipulação.', r: 5 },
  { t: 'Sangramento leve, cólica discreta, USG com embrião vivo de 9 semanas.', r: 0 },
  { t: 'Cólicas intensas e ritmadas, colo com 2 cm de dilatação, sangramento abundante.', r: 1 },
];

/* ---------- Desafio CM: o quarto com dois pacientes ---------- */
const QUARTOS_DUPLOS = [
  { a: { nome: 'Leito A — Sr. Osvaldo', dx: 'Pneumonia grave com sepse' }, b: { nome: 'Leito B — Júlia', dx: 'Cetoacidose diabética' },
    itens: [{ t: 'Crepitações em base esquerda', l: 'a' }, { t: 'Respiração de Kussmaul e hálito cetônico', l: 'b' }, { t: 'pH 7,12 com cetonemia positiva', l: 'b' }, { t: 'CURB-65 = 5', l: 'a' }, { t: 'Glicemia 480 mg/dl', l: 'b' }, { t: 'Hemoculturas e antibiótico IV na primeira hora', l: 'a' }] },
  { a: { nome: 'Leito A — Sr. Valdir', dx: 'IC com fração de ejeção reduzida' }, b: { nome: 'Leito B — Leandro', dx: 'HIV com CD4 180' },
    itens: [{ t: 'Ecocardiograma com FE 30%', l: 'a' }, { t: 'Candidíase oral', l: 'b' }, { t: 'Indicação de sulfametoxazol-trimetoprima profilático', l: 'b' }, { t: 'Otimizar os quatro pilares terapêuticos', l: 'a' }, { t: 'Carga viral elevada', l: 'b' }, { t: 'Turgência jugular na última internação', l: 'a' }] },
  { a: { nome: 'Leito A — Dona Zilda', dx: 'Doença de Alzheimer' }, b: { nome: 'Leito B — Sr. Sebastião', dx: 'Cardiopatia chagásica' },
    itens: [{ t: 'Atrofia hipocampal na TC', l: 'a' }, { t: 'BRD + BDAS no ECG', l: 'b' }, { t: 'Mini-Mental 20/30', l: 'a' }, { t: 'Aneurisma apical do VE', l: 'b' }, { t: 'Donepezila na prescrição', l: 'a' }, { t: 'Morou em casa de pau a pique', l: 'b' }] },
];

/* ---------- Desafio CIR: checklist de Cirurgia Segura ---------- */
const CHECK_MOMENTOS = ['Antes da indução anestésica', 'Antes da incisão (pausa cirúrgica)', 'Antes de o paciente sair da sala'];
const CHECKLIST_ITENS = [
  { t: 'Confirmar identidade, sítio, procedimento e consentimento', m: 0 }, { t: 'Sítio cirúrgico demarcado', m: 0 }, { t: 'Checagem do equipamento de anestesia e do oxímetro', m: 0 },
  { t: 'Alergias conhecidas e risco de via aérea difícil', m: 0 }, { t: 'Risco de perda sanguínea maior que 500 ml', m: 0 },
  { t: 'Equipe se apresenta pelo nome e função', m: 1 }, { t: 'Antibioticoprofilaxia nos últimos 60 minutos', m: 1 }, { t: 'Eventos críticos previstos pelo cirurgião e pela anestesia', m: 1 }, { t: 'Exames de imagem essenciais disponíveis', m: 1 },
  { t: 'Contagem de instrumentais, compressas e agulhas', m: 2 }, { t: 'Identificação correta das peças/amostras', m: 2 }, { t: 'Registro do procedimento realizado', m: 2 }, { t: 'Preocupações para a recuperação pós-anestésica', m: 2 },
];

/* ---------- Procedimentos simulados (conceituais, sempre supervisionados) ---------- */
const PROCS = {
  iot: { nome: 'Intubação Orotraqueal (simulada)', area: ['upa', 'cm'], tags: ['viaaerea'], dif: 3,
    paciente: 'Paciente com rebaixamento do nível de consciência (Glasgow 7), sem proteção de via aérea.',
    indicacao: { q: 'Qual é a indicação para a via aérea definitiva neste caso?', o: ['Incapacidade de proteger a via aérea (Glasgow ≤ 8)', 'Ansiedade intensa com taquipneia e agitação', 'Dor torácica com SpO₂ de 98% em ar ambiente', 'Pedido do acompanhante para "garantir o paciente"'] },
    comunica: { q: 'O paciente está rebaixado. Com quem e como você comunica?', o: ['Informar a família e registrar, sob orientação do médico responsável', 'Não informar ninguém, já que o paciente está rebaixado e não vai lembrar', 'Realizar sozinho, sem chamar o residente, para ganhar tempo', 'Pedir para o paciente rebaixado assinar o termo de consentimento'] },
    materiais: { ok: ['Laringoscópio testado', 'Tubo orotraqueal (com cuff testado)', 'Bolsa-válvula-máscara com O₂', 'Aspirador funcionando', 'Capnografia/monitor'], dist: ['Espéculo vaginal', 'Bisturi nº 11', 'Sonda vesical', 'Otoscópio'] },
    sequencia: ['Preparar e testar material, monitor e plano de resgate', 'Pré-oxigenar o paciente', 'Medicações da sequência rápida conforme o supervisor', 'Confirmar a posição do tubo com capnografia e ausculta', 'Fixar o tubo e ajustar a ventilação'],
    erro: { q: 'Identifique a falha de segurança:', o: ['Confirmar a posição do tubo só pela ausculta, sem capnografia', 'Testar o cuff do tubo antes de iniciar o procedimento', 'Deixar o aspirador ligado e testado ao lado do leito', 'Pré-oxigenar o paciente antes das medicações'] } },
  gaso: { nome: 'Coleta de Gasometria Arterial (simulada)', area: ['upa', 'cm'], tags: ['puncao'], dif: 1,
    paciente: 'Paciente com dispneia e suspeita de distúrbio ácido-básico.',
    indicacao: { q: 'Qual a indicação da gasometria arterial aqui?', o: ['Avaliar oxigenação, ventilação e equilíbrio ácido-básico', 'Dosar colesterol e triglicérides com mais precisão', 'Medir a glicemia de rotina de forma mais confiável', 'Substituir o hemograma na avaliação da infecção'] },
    comunica: { q: 'Como iniciar?', o: ['Identificar o paciente, explicar o procedimento e obter consentimento', 'Puncionar sem avisar, para não assustar o paciente e evitar que ele se mexa', 'Pedir para outro paciente da sala segurar o braço dele', 'Explicar só depois da punção, se ele perguntar'] },
    materiais: { ok: ['Seringa heparinizada', 'Agulha adequada', 'Luvas', 'Antisséptico', 'Gaze para compressão'], dist: ['Laringoscópio', 'Garrote apertado no braço', 'Espátula de Ayre', 'Tesoura de Metzenbaum'] },
    sequencia: ['Identificar e explicar', 'Avaliar a circulação colateral da mão', 'Antissepsia', 'Punção arterial radial sob supervisão', 'Compressão local por alguns minutos e envio imediato da amostra'],
    erro: { q: 'Identifique o erro:', o: ['Deixar a amostra com bolhas de ar por 2 horas na bancada', 'Comprimir o local por alguns minutos após a punção', 'Identificar a seringa com nome e horário da coleta', 'Usar luvas e antissepsia antes da punção'] } },
  cvc: { nome: 'Acesso Venoso Central (simulado)', area: ['cm', 'upa'], tags: ['puncao'], dif: 3,
    paciente: 'Paciente em choque séptico que precisa de vasopressor contínuo.',
    indicacao: { q: 'Qual a indicação principal do acesso central aqui?', o: ['Infusão contínua de vasopressor', 'Coleta de hemograma de rotina', 'Hidratação oral', 'Preferência estética'] },
    comunica: { q: 'Antes de começar:', o: ['Checklist de inserção, consentimento e confirmação do lado e do sítio', 'Começar sem checklist para ganhar tempo, já que o paciente está em choque', 'Não explicar nada ao paciente lúcido, para não deixá-lo ansioso', 'Escolher o sítio de punção no meio do procedimento'] },
    materiais: { ok: ['Kit de cateter venoso central', 'Ultrassom com capa estéril', 'Gorro, máscara, avental e luvas estéreis', 'Campo estéril amplo', 'Clorexidina alcoólica'], dist: ['Espéculo', 'Martelo de reflexos', 'Fórmula infantil', 'Espátula de Ayre'] },
    sequencia: ['Checklist e consentimento', 'Barreira máxima estéril (gorro, máscara, avental, luvas, campo amplo)', 'Localizar a veia com ultrassom', 'Inserção pela técnica de Seldinger, sob supervisão direta', 'Confirmar posição, fixar e registrar'],
    erro: { q: 'Qual atitude aumenta o risco de infecção de cateter?', o: ['Dispensar a barreira máxima estéril', 'Usar clorexidina alcoólica na antissepsia', 'Usar campo estéril amplo, cobrindo o paciente', 'Higienizar as mãos antes da paramentação'] } },
  toraco: { nome: 'Toracocentese (simulada)', area: ['cm'], tags: ['puncao'], dif: 2,
    paciente: 'Paciente com derrame pleural novo à direita, sem diagnóstico.',
    indicacao: { q: 'Qual a indicação da toracocentese?', o: ['Investigar a causa de derrame pleural novo', 'Tratar pneumonia sem derrame pleural associado', 'Dosar troponina no líquido pleural', 'Fazer parte da rotina pré-operatória'] },
    comunica: { q: 'Antes da punção:', o: ['Confirmar o lado com exame e ultrassom, explicar e obter consentimento', 'Puncionar pelo lado que parecer melhor na hora, sem exame de imagem', 'Dispensar o consentimento, já que é um procedimento simples', 'Confirmar o lado depois da punção, pelo aspecto do líquido'] },
    materiais: { ok: ['Ultrassom', 'Antisséptico e campo estéril', 'Anestésico local', 'Kit de punção pleural', 'Frascos para análise do líquido'], dist: ['Laringoscópio', 'Sonda nasogástrica', 'Fórmula láctea', 'Otoscópio'] },
    sequencia: ['Confirmar lado e ponto com ultrassom', 'Posicionar o paciente sentado e inclinado para frente', 'Antissepsia e anestesia local', 'Punção na borda SUPERIOR da costela inferior, sob supervisão', 'Enviar o líquido para análise e reavaliar o paciente'],
    erro: { q: 'Qual a falha técnica?', o: ['Puncionar na borda inferior da costela, onde passa o feixe vasculonervoso', 'Usar ultrassom para escolher o ponto e o lado da punção', 'Anestesiar a pele e o trajeto até a pleura', 'Enviar o líquido para análise bioquímica, citológica e cultura'] } },
  puncao_lombar: { nome: 'Punção Lombar Pediátrica (simulada)', area: ['ped'], tags: ['puncao'], dif: 2,
    paciente: 'Criança de 3 anos com febre, rigidez de nuca e suspeita de meningite, sem sinais de hipertensão intracraniana.',
    indicacao: { q: 'Indicação da punção lombar:', o: ['Investigar meningite com coleta de líquor', 'Tratar a crise de asma associada à febre', 'Dosar a bilirrubina no líquor', 'Medir a glicemia capilar com mais precisão'] },
    comunica: { q: 'Com os responsáveis:', o: ['Explicar riscos e benefícios, obter consentimento e oferecer apoio', 'Pedir para os pais saírem da sala sem explicar nada a eles', 'Dizer que não dói nada e que o procedimento nunca tem riscos', 'Fazer a punção escondido dos pais, para não assustá-los'] },
    materiais: { ok: ['Agulha de punção lombar adequada à idade', 'Antisséptico e campo estéril', 'Tubos para citologia, bioquímica e cultura', 'Luvas estéreis', 'Profissional para posicionar a criança'], dist: ['Laringoscópio adulto', 'Espéculo', 'Bisturi', 'Fórmula infantil'] },
    sequencia: ['Checar contraindicações (instabilidade, coagulopatia, sinais de hipertensão intracraniana)', 'Posicionar em decúbito lateral com ajuda', 'Antissepsia e campo estéril', 'Punção no espaço intervertebral lombar baixo, sob supervisão', 'Coletar líquor para análise e fazer curativo'],
    erro: { q: 'Qual a falha mais grave?', o: ['Não checar contraindicações antes da punção', 'Usar luvas estéreis e campo estéril', 'Identificar os tubos antes de enviar ao laboratório', 'Explicar o procedimento aos pais antes'] } },
  papanicolau: { nome: 'Coleta de Citopatológico — Papanicolau (simulada)', area: ['go', 'ubs'], tags: ['go'], dif: 1,
    paciente: 'Mulher de 32 anos, rastreamento de rotina do câncer do colo do útero.',
    indicacao: { q: 'Indicação do exame:', o: ['Rastrear o câncer do colo do útero conforme idade e intervalo', 'Tratar a candidíase vaginal durante a própria coleta', 'Diagnosticar gravidez em fase inicial', 'Avaliar as mamas e os linfonodos axilares no mesmo exame'] },
    comunica: { q: 'Antes de começar:', o: ['Explicar cada etapa, obter consentimento, garantir privacidade e oferecer acompanhante', 'Começar sem explicar, para ser rápido e reduzir o desconforto da paciente', 'Deixar a porta aberta para facilitar a circulação da equipe durante a coleta', 'Comentar o caso com outros pacientes na sala de espera'] },
    materiais: { ok: ['Espéculo de tamanho adequado', 'Espátula de Ayre', 'Escova endocervical', 'Lâmina identificada', 'Fixador'], dist: ['Laringoscópio', 'Bisturi', 'Martelo de reflexos', 'Oxímetro'] },
    sequencia: ['Explicar, obter consentimento e garantir privacidade', 'Posicionar e introduzir o espéculo com delicadeza', 'Coletar a ectocérvice com espátula', 'Coletar a endocérvice com escova', 'Fixar a lâmina imediatamente e retirar o espéculo com cuidado'],
    erro: { q: 'Qual atitude prejudica o exame?', o: ['Demorar a fixar a lâmina, deixando o material secar', 'Identificar a lâmina antes da coleta', 'Explicar o procedimento à paciente antes', 'Usar espéculo de tamanho adequado à paciente'] } },
  checklist: { nome: 'Checklist de Cirurgia Segura', area: ['cir'], tags: ['cir'], dif: 1,
    paciente: 'Paciente para colecistectomia videolaparoscópica.',
    indicacao: { q: 'Para que serve o checklist de Cirurgia Segura?', o: ['Reduzir erros e complicações evitáveis em momentos críticos', 'Atrasar a cirurgia até todos os exames ficarem prontos', 'Substituir a avaliação pré-anestésica', 'Cumprir uma exigência burocrática, sem efeito na segurança'] },
    comunica: { q: 'Quem participa da pausa cirúrgica?', o: ['Toda a equipe: cirurgia, anestesia e enfermagem', 'Só o cirurgião principal, que lê em voz alta', 'Só o interno, que preenche o formulário', 'Ninguém fala na sala; cada um confere sozinho'] },
    materiais: { ok: ['Prontuário com consentimento', 'Exames de imagem', 'Antibioticoprofilaxia registrada', 'Oxímetro funcionando', 'Sítio demarcado'], dist: ['Espéculo vaginal', 'Fórmula infantil', 'Otoscópio', 'Pente fino'] },
    sequencia: ['Confirmar identidade e consentimento antes da indução', 'Checar anestesia e oxímetro', 'Pausa: equipe se apresenta e confirma paciente/sítio', 'Confirmar antibioticoprofilaxia', 'Contagem de compressas e instrumentais antes de sair da sala'],
    erro: { q: 'Qual a falha de segurança?', o: ['Encerrar a cirurgia sem contar compressas e instrumentais', 'Demarcar o sítio cirúrgico com o paciente acordado', 'Fazer a pausa cirúrgica antes da incisão', 'Checar alergias com o paciente e no prontuário'] } },
  instrumentacao: { nome: 'Instrumentação Cirúrgica (simulada)', area: ['cir'], tags: ['instrum', 'cir'], dif: 2,
    paciente: 'Apendicectomia aberta: monte a mesa de instrumentais básicos.',
    indicacao: { q: 'Qual o objetivo de organizar a mesa por tempos cirúrgicos?', o: ['Agilizar a cirurgia e reduzir erros de contagem', 'Deixar a mesa mais bonita para a equipe', 'Usar todos os instrumentos possíveis na cirurgia', 'Atrasar o cirurgião para ele operar com calma'] },
    comunica: { q: 'Ao passar instrumentos:', o: ['Comunicação clara, passar na posição de uso e manter a contagem', 'Arremessar o instrumento para ganhar tempo nos momentos críticos', 'Falar baixo para não incomodar e passar o que achar melhor', 'Passar sem olhar, confiando na memória da sequência'] },
    materiais: { ok: ['Bisturi', 'Pinça anatômica e dente de rato', 'Tesoura de Metzenbaum', 'Porta-agulha', 'Afastador de Farabeuf', 'Pinça hemostática Kelly'], dist: ['Espéculo vaginal', 'Laringoscópio', 'Otoscópio', 'Escova endocervical'] },
    sequencia: ['Diérese (abertura)', 'Hemostasia', 'Exérese (tempo principal)', 'Síntese (fechamento)', 'Contagem final'],
    erro: { q: 'Qual erro clássico de instrumentação?', o: ['Usar a tesoura de Metzenbaum para cortar fio', 'Contar as compressas no início e no fim', 'Organizar a mesa por tempos cirúrgicos', 'Manter a mesa estéril durante toda a cirurgia'] } },
  paramentacao: { nome: 'Paramentação Cirúrgica (simulada)', area: ['cir'], tags: ['cir'], dif: 1,
    paciente: 'Você vai entrar para auxiliar a cirurgia.',
    indicacao: { q: 'Por que paramentar corretamente?', o: ['Manter a técnica asséptica e reduzir infecção de sítio cirúrgico', 'Ficar com aparência mais profissional diante do paciente', 'É opcional quando a cirurgia é curta e limpa', 'Proteger apenas a roupa da equipe contra sangue'] },
    comunica: { q: 'Se você contaminar a luva:', o: ['Avisar imediatamente e trocar a luva', 'Esconder e seguir, para não atrasar a cirurgia', 'Limpar a luva com álcool e continuar', 'Esperar acabar a cirurgia para trocar'] },
    materiais: { ok: ['Gorro', 'Máscara cirúrgica', 'Solução para degermação', 'Avental estéril', 'Luvas estéreis'], dist: ['Estetoscópio no pescoço', 'Anel e relógio', 'Fone de ouvido', 'Celular no bolso'] },
    sequencia: ['Gorro e máscara', 'Degermação das mãos e antebraços', 'Secagem com compressa estéril', 'Vestir o avental estéril', 'Calçar as luvas estéreis'],
    erro: { q: 'Qual a contaminação?', o: ['Tocar a máscara com a luva estéril', 'Manter as mãos acima da cintura', 'Não encostar em superfícies não estéreis', 'Avisar o instrumentador'] } },
};

/* ---------- Rivais ---------- */
const RIVAIS = {
  thiago: { nome: 'Thiago Turbo', titulo: 'Interno do Grupo de Estudos 24h', area: 'upa', hp: 70, atk: 9, look: 'rival_thiago',
    falas: ['Eu já fiz 3 mil questões hoje. E você?', 'Quem responde primeiro, ganha. Regra minha.', 'Isso aí cai na prova de residência!'] },
  marcela: { nome: 'Marcela Monitora', titulo: 'Monitora de Tudo', area: 'ped', hp: 80, atk: 10, look: 'rival_marcela',
    falas: ['Meu caderno tem 7 cores de marca-texto.', 'Você não fez o resumo? Tsc, tsc.', 'Eu já apresentei esse caso no congresso.'] },
  caio: { nome: 'Caio Concurseiro', titulo: 'Decorador Profissional', area: 'cm', hp: 95, atk: 11, look: 'rival_caio',
    falas: ['Isso é a página 342 do Harrison.', 'Eu sei a tabela inteira de cor.', 'Decoreba é uma arte.'] },
  lara: { nome: 'Lara Laparoscópica', titulo: 'Futura Cirurgiã (segundo ela)', area: 'cir', hp: 90, atk: 12, look: 'rival_lara',
    falas: ['Eu já segurei afastador por 6 horas.', 'Clínica é para os fracos.', 'Meu nó cirúrgico é perfeito.'] },
  bruna: { nome: 'Bruna Bancada', titulo: 'Rainha do Plantão Obstétrico', area: 'go', hp: 85, atk: 11, look: 'rival_bruna',
    falas: ['Já acompanhei 40 partos.', 'Você sabe as manobras de cor?', 'A Dra. Gertrudes gosta de mim.'] },
};

/* ---------- Eventos aleatórios de exploração ---------- */
const EVENTOS = [
  { id: 'codigo_amarelo', titulo: 'Código Amarelo no corredor!', texto: 'Um acompanhante passa mal e cai sentado no corredor, pálido e suando.',
    op: [{ t: 'Chamar a equipe e iniciar avaliação ABCDE', rep: 3, xp: 25, msg: 'Você manteve a calma e a equipe chegou rápido. Era hipoglicemia, já resolvida.' },
      { t: 'Filmar para o grupo da turma', rep: -4, msg: 'O residente te olhou de um jeito que você vai lembrar para sempre.' },
      { t: 'Fingir que não viu', rep: -2, msg: 'Uma técnica de enfermagem resolveu. E anotou seu nome.' }] },
  { id: 'banheiro', titulo: 'Onde é o banheiro?', texto: 'Uma senhora com andador pergunta onde fica o banheiro.',
    op: [{ t: 'Acompanhá-la até lá com paciência', rep: 2, xp: 10, msg: 'Ela te deu uma bala de hortelã e a bênção.' },
      { t: 'Apontar vagamente "é por ali"', rep: -1, msg: 'Ela foi parar no almoxarifado.' }] },
  { id: 'sistema', titulo: 'O sistema caiu!', texto: 'Todos os computadores do setor travaram ao mesmo tempo. Pânico entre os residentes.',
    op: [{ t: 'Sugerir o protocolo de contingência em papel e avisar a TI', rep: 2, xp: 15, msg: 'Você salvou as prescrições da manhã.' },
      { t: 'Desligar o servidor da tomada', rep: -3, msg: 'Agora caiu a impressora também.' },
      { t: 'Aproveitar para tomar um café', rep: -1, msg: 'O café estava bom. A consciência, nem tanto.' }] },
  { id: 'residente_dormindo', titulo: 'Residente dormindo na escada', texto: 'O R2 está dormindo sentado na escada, com a caneca na mão inclinada.',
    op: [{ t: 'Segurar a caneca e acordá-lo com gentileza', rep: 2, xp: 10, msg: '"Valeu... eu tava só... descansando os olhos."' },
      { t: 'Tirar foto para o grupo', rep: -3, msg: 'A foto vazou. Para o grupo dos preceptores.' },
      { t: 'Deixar dormir', rep: 0, msg: 'O café derramou. Mas ele dormiu feliz.' }] },
  { id: 'familiar_irritado', titulo: 'Familiar irritado', texto: 'Um familiar reclama alto que está esperando há horas sem notícias.',
    op: [{ t: 'Acolher, explicar o fluxo e chamar o médico responsável para atualizar', rep: 3, xp: 20, msg: 'Ele se acalmou e agradeceu. Comunicação é procedimento.' },
      { t: 'Dar o diagnóstico você mesmo, sem autorização', rep: -3, msg: 'A informação estava errada. O residente teve que desfazer o mal-entendido.' },
      { t: 'Dizer que não é com você', rep: -2, msg: 'Ele foi reclamar na ouvidoria. Com o seu nome.' }] },
  { id: 'impressora_possuida', titulo: 'A impressora está possuída', texto: 'A impressora começa a imprimir sozinha 300 páginas de uma evolução de 2017.', doc: true,
    op: [{ t: 'Desligar, cancelar a fila e avisar a TI', rep: 1, xp: 10, msg: 'Exorcismo técnico concluído.' },
      { t: 'Ler as evoluções de 2017', rep: -1, xp: 15, msg: 'Você aprendeu muito. Mas acabou o papel do setor.' }] },
  { id: 'achado', titulo: 'Algo brilha no chão', texto: 'Debaixo de uma cadeira há algo esquecido.', achado: true, op: [{ t: 'Pegar', rep: 0, msg: '' }] },
  { id: 'cafe_gratis', titulo: 'Bolo de aniversário na copa', texto: 'É aniversário da técnica Jussara e tem bolo na copa!',
    op: [{ t: 'Cantar parabéns e pegar um pedaço', rep: 1, energia: 20, msg: 'Bolo de cenoura com cobertura de chocolate. +20 Energia.' },
      { t: 'Levar um pedaço para o residente', rep: 2, xp: 10, msg: 'O residente quase chorou de emoção.' }] },
  { id: 'agitacao', titulo: 'Paciente em sofrimento', texto: 'Um paciente está muito agitado no corredor. A equipe pede sua ajuda para abordá-lo com segurança.', agitacao: true, op: [{ t: 'Ajudar a equipe', rep: 0, msg: '' }] },
  { id: 'rival', titulo: 'Um rival aparece!', texto: 'Outro interno te desafia para um duelo de conhecimento.', rival: true, op: [{ t: 'Aceitar o duelo', rep: 0, msg: '' }, { t: 'Recusar educadamente', rep: 0, msg: 'Você recusou. Ele vai se gabar no grupo, mas tudo bem.' }] },
];

/* ---------- Encontros de agitação psicomotora (desescalada) ---------- */
const AGITACAO = [
  { nome: 'Sr. Rubens', desc: 'Homem de 45 anos, muito ansioso, andando de um lado para o outro, falando alto que "ninguém resolve nada" e que sente dor forte.', causa: 'Dor intensa não tratada e espera longa.' },
  { nome: 'Wesley', desc: 'Jovem de 23 anos, assustado, olhando para os cantos, dizendo que estão falando dele. A mãe está aflita ao lado.', causa: 'Quadro psicótico com medo, sem histórico de agressividade.' },
  { nome: 'Dona Neusa', desc: 'Senhora de 80 anos internada, desorientada à noite, tentando retirar o acesso venoso e chamando pela filha.', causa: 'Delirium (infecção urinária), piora à noite.' },
];
const AGIT_ACOES = [
  { t: 'Apresentar-se com calma, chamar pelo nome e falar baixo', d: -18, seg: 0, tipo: 'verbal' },
  { t: 'Perguntar o que ele(a) precisa e validar o sofrimento', d: -16, seg: 0, tipo: 'verbal' },
  { t: 'Reduzir estímulos: afastar curiosos, diminuir luz e barulho', d: -12, seg: 5, tipo: 'ambiente' },
  { t: 'Manter distância segura, sem bloquear a saída de ninguém', d: -6, seg: 10, tipo: 'seguranca' },
  { t: 'Chamar apoio da equipe (enfermagem/segurança) de forma discreta', d: -4, seg: 15, tipo: 'equipe' },
  { t: 'Oferecer algo concreto: água, cadeira, analgesia, notícia', d: -14, seg: 0, tipo: 'verbal' },
  { t: 'Aproximar-se sozinho(a) e segurar o braço do paciente', d: +20, seg: -25, tipo: 'ruim' },
  { t: 'Gritar mais alto para impor autoridade', d: +22, seg: -10, tipo: 'ruim' },
  { t: 'Dizer que "isso é frescura" e virar as costas', d: +18, seg: -10, tipo: 'ruim' },
];

/* ---------- Crise psicótica com agitação (atendimento imediato e contenção) ----------
   Conteúdo educacional: segurança da cena, desescalada verbal, contenção apenas como último recurso,
   feita pela equipe treinada, conforme protocolo e com monitorização; investigação de causas orgânicas.
   Sem doses: tranquilização medicamentosa só por prescrição e protocolo institucional. */
const PSY_CASOS = [
  { nome: 'Jefferson', idade: 27, sexo: 'M', quadro: 'Grita no corredor que "estão vindo pegá-lo" e responde a vozes que só ele ouve. Interrompeu o tratamento psiquiátrico há meses.',
    q4: { q: 'Após a contenção, qual é a prioridade?', ok: 'Checar sinais vitais e glicemia, investigar causas orgânicas, acionar a psiquiatria e retirar a contenção assim que for seguro', exp: 'Mesmo com história psiquiátrica conhecida, causas clínicas precisam ser afastadas. A contenção é temporária, reavaliada em intervalos curtos e retirada o quanto antes.' } },
  { nome: 'Dona Marlene', idade: 68, sexo: 'F', quadro: 'Internada por pneumonia, de repente começou a ver bichos na parede, puxa o acesso venoso e não reconhece a filha. Piorou à noite.',
    q4: { q: 'Qual hipótese e conduta orientam o cuidado depois da contenção?', ok: 'Delirium: investigar e tratar a causa orgânica (hipoxemia, infecção, glicemia, medicações) e reorientar, reavaliando a contenção com frequência', exp: 'Agitação aguda com flutuação e desatenção em idosa internada sugere delirium, que é uma urgência clínica. Tratar a causa é o principal; a contenção física pode piorar o delirium e deve ser a mais breve possível.' } },
  { nome: 'Caio', idade: 19, sexo: 'M', quadro: 'Chegou de uma festa muito agitado, desconfiado, suando, com o coração acelerado e as pupilas dilatadas. Diz que "todo mundo está contra ele".',
    q4: { q: 'O que é essencial após a contenção?', ok: 'Monitorizar sinais vitais, temperatura e ECG, investigar intoxicação e complicações clínicas, reavaliando a contenção em intervalos curtos', exp: 'Intoxicação por estimulantes pode causar hipertermia, arritmias e rabdomiólise; lutar contra a contenção piora o quadro. Monitorização contínua e investigação clínica são obrigatórias.' } },
  { nome: 'Rosângela', idade: 35, sexo: 'F', quadro: 'Não dorme há quatro dias, fala sem parar, diz ter sido escolhida para salvar o hospital e se irrita quando é contrariada. Jogou uma cadeira na recepção.',
    q4: { q: 'Depois da contenção, como seguir?', ok: 'Checar sinais vitais e causas orgânicas, acionar a psiquiatria para o manejo do episódio de humor e reavaliar a contenção periodicamente', exp: 'Um episódio maníaco com sintomas psicóticos exige avaliação psiquiátrica, mas causas clínicas e uso de substâncias também devem ser afastados. A contenção é reavaliada e retirada assim que possível.' } },
];
const PSY_PERGUNTAS = [
  { q: 'Você chega perto do paciente em crise. Qual é a primeira atitude?', ok: 'Avaliar a cena, manter distância segura com a saída livre e chamar a equipe (enfermagem e segurança)',
    ruins: ['Chegar por trás e segurar o paciente para acabar logo com a situação', 'Esperar sozinho(a) ele se cansar, sem avisar ninguém', 'Pedir aos acompanhantes que o segurem enquanto você vai buscar ajuda'],
    exp: 'Segurança primeiro: de todos, inclusive do paciente. Ninguém aborda sozinho, ninguém fica encurralado, e a equipe é chamada cedo.' },
  { q: 'Como fazer a abordagem verbal?', ok: 'Apresentar-se, falar baixo e devagar, com frases curtas, oferecer escolhas simples e não discutir o conteúdo do delírio',
    ruins: ['Explicar com firmeza que as vozes não são reais e que ele está errado', 'Ameaçar com a contenção para ele obedecer', 'Fazer piada para descontrair o ambiente'],
    exp: 'A desescalada verbal resolve boa parte das crises. Confrontar o delírio, ameaçar ou ridicularizar aumenta a agitação.' },
  { q: 'Mesmo com a abordagem, o risco de agressão a si e aos outros continua iminente. Como realizar a contenção?', ok: 'Contenção física pela equipe treinada, em número suficiente, explicando ao paciente, seguindo o protocolo, com prescrição, registro e monitorização frequente',
    ruins: ['Conter sozinho(a), rapidamente, antes que ele perceba', 'Amarrar o paciente e deixá-lo sem observação até "se acalmar"', 'Usar a contenção como castigo pelo comportamento'],
    exp: 'Contenção é último recurso, nunca punição. É feita pela equipe treinada, com técnica segura, prescrição, registro, monitorização de sinais vitais e circulação, e reavaliação constante. A tranquilização medicamentosa, quando indicada, segue protocolo e prescrição médica.' },
];

/* ---------- Conquistas ---------- */
const CONQUISTAS = [
  { id: 'primeiro_caso', nome: 'Primeiro Plantão', desc: 'Resolva seu primeiro caso clínico.' },
  { id: 'dx10', nome: 'Olho Clínico', desc: 'Acerte 10 diagnósticos.' },
  { id: 'cd25', nome: 'Conduta Impecável', desc: 'Acerte 25 condutas.' },
  { id: 'sequencia5', nome: 'Em Chamas', desc: 'Resolva 5 casos seguidos com diagnóstico e conduta corretos.' },
  { id: 'proc5', nome: 'Mãos de Seda', desc: 'Realize 5 procedimentos simulados.' },
  { id: 'side10', nome: 'Faz-Tudo do Setor', desc: 'Complete 10 missões secundárias.' },
  { id: 'cafe5', nome: 'Barista Hospitalar', desc: 'Entregue 5 cafés.' },
  { id: 'rep50', nome: 'Bom Interno', desc: 'Alcance +500 de reputação.' },
  { id: 'rep90', nome: 'Interno Lendário', desc: 'Alcance +900 de reputação.' },
  { id: 'recuperacao', nome: 'A Volta por Cima', desc: 'Chegue a -400 de reputação e depois volte a +200.' },
  { id: 'raro', nome: 'Caçador de Raros', desc: 'Obtenha um item Raro ou superior.' },
  { id: 'rival3', nome: 'Rival de Respeito', desc: 'Vença 3 duelos contra internos rivais.' },
  { id: 'agit', nome: 'Voz Calma', desc: 'Conduza um encontro de agitação com segurança.' },
  { id: 'arvore', nome: 'Especialista', desc: 'Aprenda todas as 20 habilidades de uma árvore.' },
  { id: 'lenda', nome: 'Lenda do Internato', desc: 'Aprenda a habilidade Lenda do Internato.' },
  { id: 'boss_leozao', nome: 'Domador de Leão', desc: 'Derrote Leão Figura.' },
  { id: 'boss_sueli', nome: 'Aprovado pela Dra. Xuxa', desc: 'Derrote a Dra. Xuxa.' },
  { id: 'boss_sheila', nome: 'Exorcista Obstétrico', desc: 'Derrote a Dra. Gertrudes.' },
  { id: 'boss_vladimir', nome: 'Retórica Superada', desc: 'Derrote o Dr. Wagnão.' },
  { id: 'boss_laercio', nome: 'Bico Fino Vencido', desc: 'Derrote o Dr. Leôncio.' },
  { id: 'boss_martinho', nome: 'Reforma da Atenção Básica', desc: 'Derrote o Dr. Martinho Lutero.' },
  { id: 'duvidas10', nome: 'Monitor do Grupo de Estudos', desc: 'Resolva 10 sessões de dúvidas dos recém-formados.' },
  { id: 'emerg5', nome: 'Plantão das Emergências', desc: 'Conduza 5 emergências com sucesso.' },
  { id: 'formatura', nome: 'Formado!', desc: 'Conclua o internato.' },
];
