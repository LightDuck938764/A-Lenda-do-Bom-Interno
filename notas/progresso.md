# Banco de casos a partir das questões de residência — progresso

## Regras combinadas com o usuário
- Casos novos, sem repetição, inspirados nas questões (não copiar enunciados).
- Imagens de exame: usar as das questões; se não houver, buscar na internet (fontes livres) e MOSTRAR AO USUÁRIO para aprovar antes de entrar no jogo. Mesma regra para partograma e ECG (decisão do usuário).
- Imagens marcadas "Arquivo pessoal; imagem usada com autorização" ou "Reproduzida com permissão" ficam de fora por padrão (licença só do editor do banco) — avisar o usuário.
- Distocias (fase ativa prolongada, parada secundária da dilatação/descida, período pélvico prolongado, parto precipitado): sempre com partograma.
- CM: cada caso tem `ala` (ALAS_CM em 01_core.js). GO: `local` 'obst' (centro obstétrico/observação/alojamento) ou 'gineco' (consultório, USG, quartos).
- Alternativas: a correta NÃO pode ser sistematicamente a mais longa (rodar `node tools/valida.js prefixo_`; corrigir com tools/opcoes.py).
- Campo `tema` = nome do tema da lista do usuário (agrupa o caderno de erros).

## Formato novo de caso
`lab: [['Exame','Resultado','Referência'], ['Subtítulo']]`, `img: [{ f: 'arquivo.jpg', t: 'legenda neutra' }]` (pasta img/casos/), `ex` texto livre (laudos), `ala`, `local`, `tema`.

## Banco recebido (parte 1): PEDIATRIA_1..8 e CLI1..11 (2.550 questões)
Blocos de Pediatria: 1 = infecções respiratórias; 2 = diarreia; 3 = crescimento/nutrição; 4 = reanimação neonatal; 5 = PALS/afogamento/OVACE; 6 = vacinas; 7 = sífilis congênita e TORCH; 8 = variados (constipação, SHU, Down, cardiopatias, triagem, ITU, maus-tratos).
Parte 2 recebida (zips CIR1-6, GO1-6, PREV1-4), extraída em scratchpad/banco2 (todas2.json; go_c.txt = GO por tema). ATENÇÃO: o campo imgs do todas2.json às vezes aponta para a imagem errada (índice de página deslocado) — sempre olhar a imagem antes de usar.

## Feito
- PEDIATRIA_1 lido → src/03p_ped_resp.js (35 casos, prefixo pr_).
- PEDIATRIA_2 lido → src/03q_ped_gi.js (13 casos, prefixo pd_). ECG do banco: ecg_taquicardia_sinusal_crianca.jpg.
- PEDIATRIA_3 lido → src/03r_ped_cresc.js (24 casos, prefixo pc_: DNPM, TEA, TDAH, estatura, obesidade, desnutrição, puberdade). Curvas OMS do banco: curva_estatura_menino_p3.jpg, curva_estatura_9anos_110cm.jpg.
- PEDIATRIA_4 lido → src/03s_ped_neo_rean.js (14 casos, prefixo rn_: sala de parto SBP 2022, hérnia diafragmática com RX do banco rx_hernia_diafragmatica_rn.jpg, hipotermia terapêutica).
- PEDIATRIA_5 → src/03t_ped_emerg.js (17, pa_: PALS, OVACE, afogamento, cáusticos). ECGs do banco: ecg_fv_crianca, ecg_tv_sem_pulso, ecg_ritmo_organizado_aesp, monitor_bradicardia_hipotensao.
- PEDIATRIA_6 → src/03u_ped_vacinas.js (15, pv_), calendário técnico 2026 (gov.br).
- PEDIATRIA_7 → src/03v_ped_sifilis_torch.js (11, ps_). RX do banco: rx_ossos_longos_sifilis_lactente (Revalida 2024), rx_ossos_longos_sifilis_rn (USP 2024; não usado ainda).
- PEDIATRIA_8 → src/03w_ped_diversos.js (23, pm_). TC do banco: tc_hematoma_subdural_lactente; tc_pneumonia_necrotizante (anexada a pr_pneumonia_necrotizante).
- Temas da lista sem questões → src/03x_ped_neonatal.js (19, pn_: resp. neonatal, sepse, icterícia, triagens, aleitamento, ferro SBP 2026) e src/03y_ped_cir_exant.js (27, pq_/px_: cirurgia pediátrica, anomalias anorretais, VUP, gigantismo, exantemáticas, Kawasaki).
- Mastite lactacional ficou em pn_mastite (pediatria/aleitamento): no GO-puerpério não repetir mastite.
- Removidos 17 casos antigos de pediatria repetidos (bronquiolite, APLV, icterícia, sarampo, rubéola, resfriado, TGA, coqueluche, autismo, TDAH, exantemáticas).
- Tempo do caso: +20 s com tabela de exames, +15 s por imagem (máx. 30), +10 s com laudo.
- valida.js agora mostra também % da conduta correta como a MAIS CURTA (evitar o padrão inverso; alvo: distribuição parecida entre as 4 posições de tamanho).

## Imagens pendentes (buscar em fonte livre e mostrar ao usuário)
- RX de tórax pediátrico: consolidação lobar; derrame pleural; hiperinsuflação (bronquiolite); infiltrado intersticial (Mycoplasma/clamídia).
- Otoscopia: membrana timpânica abaulada (OMA).
- Foto: pseudomembrana diftérica; gengivoestomatite herpética; herpangina.
- RX de mão/punho para idade óssea (opcional, casos pc_).
- RX tórax neonatal: DMH (reticulogranular), TTRN, SAM; RX dupla bolha (atresia duodenal); RX atresia de esôfago (sonda enrolada); RX corpo estranho brônquico (aprisionamento aéreo); RX bateria (duplo halo).
- Fotos: onfalocele x gastrosquise; manchas de Koplik; face esbofeteada; varicela; mão-pé-boca; escarlatina/língua em framboesa; Kawasaki; higroma cístico; leucocoria.

## Casos antigos
Quando um tema for coberto pelo banco novo, remover/ajustar os casos antigos do mesmo tema na mesma área (sem repetição).

## Onde está salvo
- Trabalho em andamento no branch **banco-de-casos** do repositório (o site no main não muda até o teste final). Publicar = merge no main.
- Backup do código-fonte: branch codigo-fonte (scratchpad/scripts/backup.sh).
- CM neuro → src/05l_cm_neuro.js (17, nr_; nr_crise_febril e nr_paralisia_cerebral em 'ped'; crise febril complexa para não repetir em_convulsao).
- CM psiq → src/05m_cm_psiq.js (26, py_): delirium, pseudodemência, esquizofrenia, SNM, acatisia, parkinsonismo, discinesia tardia, humor, lítio, ansiedade, TOC, TEPT, adaptação, alimentares, 7 transtornos de personalidade.
- CM reumato → src/05n_cm_reumato.js (22, rm_; AIJ x2 e IgA em 'ped'): gota, AR, espondiloartrites, vasculites, LES, ES, OA, gonocócica.
- PENDENTE auditoria de duplicatas UBS x pediatria nova (ubs_baixa estatura, atraso constitucional, telarca, puberdade precoce, OMA, faringite, resfriado) e ped_ansiedade/ped_depressao antigos.
- Auditoria de duplicatas (scratchpad/scripts/dups.js): removidos ubs_ira_faringite, ubs_ira_otite, ubs_cd_familiar, ce_prediabetes, cp_pac_ambulatorial, cm_colest1. Reescritos para nível hospitalar: ci_dengue_b→ci_dengue_hepatite, ci_dengue_c (2ª etapa), ci_chikungunya (atípica), ci_zika (síndrome congênita), ce_dm2_dcv (DM+ICFEr), cp_asma_diagnostico (asma tratada como DPOC).
- Urgência → src/05o_upa_urgencia.js (31, ue_): taquiarritmias, PCR adulto, bradi/BAV, crise hipertensiva, DAC, pericardite/tamponamento, AVC. Removidos upa_iam1/2, upa_avc1/2, upa_ic1/2, upa_pcr1/2. 19 imagens do banco (ECGs de CLI3/6/7/11, TC/RM de CLI4/CLI10). Excluídas: arquivo pessoal (CLI3 i-001/i-020-011/i-031; CLI4 i-017-002, i-032, i-038; CLI6 i-032-015, i-038-023; CLI7 i-004 = CLI8 i-022), créditos externos (ecgedu CLI6 i-039, LITFL CLI11 i-046, ecgpm CLI7 i-046). CLI3 i-034-019 com cabeçalho de dados do paciente recortado.
- Sem imagem do banco (candidatas à internet, mostrar ao usuário): TC de hemorragia cerebelar/intraparenquimatosa, ECG de tamponamento (alternância elétrica), ECG de FA pré-excitada (WPW), ECG de BAVT.
- Cirurgia → src/05p_cir_digestivo.js (39, cx_): apendicite (3), diverticular (4), pólipos/CCR (6), RCU (2, peça do banco CLI3#21), Crohn (3), C. difficile, SII, carcinoide (2), pancreatite aguda (6) e crônica, câncer de pâncreas, vias biliares (7), fígado (3). Removidos cir_apend/2, upa_apend1/2, cir_colecist1/2, cir_pancr1/2, cir_ccr/2, cir_ca_intestino, cir_capanc/2. Mantidos cir_hsd, cir_hsa/2, cir_ureter, cir_daop, cir_polit1/2, cir_capulm.
- Nomes de pacientes repetidos corrigidos.
- Imagens da internet: domínios liberados pelo usuário. Busca: python3 scratchpad/scripts/commons.py "termo" n. Montar página de conferência com cada candidata + licença e só usar após aprovação.

## Ginecologia e Obstetrícia (banco parte 2: GO1-6)
- Ginecologia (local 'gineco'): 04b_go_gineco_endo.js (24, gg_: amenorreias, HAC clássica, hiperprolactinemia, SOP, climatério, osteoporose, uroginecologia), 04c_go_gineco_inf.js (18, gi_: vulvovaginites, cervicite, DIP, úlceras, sífilis por fase, violência sexual com gestação → aborto legal, mioma, pólipo, adenomiose, endometriose), 04d_go_gineco_onco.js (13, gm_: mama, ovário, colo, endométrio).
- Obstetrícia (local 'obst'): 04e_go_obst_parto.js (17, op_: datação, indução/Bishop, estática, CTG, prolapso de cordão, distocia de ombro, 3 distocias COM partograma, taquicardia fetal, oligoâmnio/PBF, 41 semanas, fórcipe, fase latente, situação transversa, VBAC, óbito fetal), 04f_go_obst_sang.js (21, os_: abortamentos x6, IIC, colo curto, SAF, mola completa/parcial, NTG, ectópica MTX, localização desconhecida, placenta prévia, acretismo, DPP, Bandl-Frommel, vasa prévia, Rh x2), 04g_go_obst_clin.js (26, oc_: hipertensivas x9, hiperglicemia x4, gemelares x4, HIV e herpes no parto, HPP atonia, retenção placentária, endometrite, tromboflebite pélvica, blues, depressão pós-parto, psicose puerperal).
- Removidos: src/04_cases_go.js inteiro (30 casos antigos) e go_herpes2, go_sifilis2, go_vaginose2, go_mioma2. GO_QUARTO removido do 11_world.js.
- Evitados (já são eventos/UBS): em_rpmo, em_corio, em_parto, em_tpp, em_ectopica (rota), em_violencia, ubs_pn_dmg, ubs_pn_aas, ubs_pn_inicio, ubs_pn_gbs, pn_mastite.
- PENDENTE com partograma: período pélvico prolongado e parto precipitado (banco não tem; pedido ao usuário o manual do MS 2001 ou liberar bvsms.saude.gov.br). Não criar sem partograma aprovado.
- Tags: adicionada 'infec' em todos os casos com 'infecto'/'sepse' (as habilidades usam 'infec'); 'diabetes', 'convul', 'anticoag', 'choque', 'cortic' nos casos de GO pertinentes.
- PENDENTE: usar CIR1-6 (estômago, esôfago, trauma, vascular, uro, hérnias, tireoide…) e decidir PREV1-4.

## Cirurgia (banco parte 2: CIR1-6)
- 05q_cir_trauma.js (22: tr_ trauma — via aérea cirúrgica, respondedor transitório, LAD/neuroproteção, pneumotórax aberto, tórax instável, aorta, hemotórax retido, baço com blush, fígado TNO, cinto/Chance, toracoabdominal, compartimental abdominal, controle de danos, choque neurogênico, compartimental de perna, lesão vascular, bexiga, gestante; qm_ queimaduras — inalação, grande queimado, escarotomia, elétrica).
- 05r_cir_geral.js (22, cs_: fundoplicatura, DRGE no obeso, Barrett com DAG, Boerhaave, megaesôfago IV, úlcera perfurada, ca gástrico distal, hérnia interna pós-bypass, volvo de sigmoide, íleo biliar, Ogilvie, hérnias inguinal/femoral/umbilical, hemorroidas IV, trombose hemorroidária, fissura, abscesso perianal, pilonidal, Marjolin, melanoma, pneumotórax espontâneo).
- 05s_cir_vasc_uro.js (15: va_ AAA x3, dissecção B, isquemia aguda, carótida; ur_ cálculo expulsivo, cálculo 2 cm, cistostomia, HPB, próstata, testículo, Fournier, hematúria, massa renal).
- 05t_cir_periop.js (13, po_: stent recente, ponte de heparina, profilaxia colectomia, hipertermia maligna, toxicidade de anestésico local, febre precoce, ISC, abscesso cavitário, deiscência de anastomose, evisceração, fístula enterocutânea, nutrição precoce, TEV).
- Imagens do banco CIR: tc_laceracao_hepatica, tc_trauma_cinto_chance, tc/rx_hemotorax_retido, angiotc_disseccao_tipo_b, tc_hernia_interna, foto_hernia_umbilical_estrangulada, foto_ulcera_marjolin, foto_fournier, foto_hemorroidas_prolapsadas. (O índice imgs do todas2.json está deslocado: a folha scratchpad/banco2/sheets_cir mostra a imagem certa por questão.)
- Removidos por duplicar eventos de emergência: cir_hsd (em_subdural), cir_polit1 (em_abd_fechado), cir_polit2 (em_ptx), cir_hsa2 (= cir_hsa), upa_tce2 (em_extradural).
- PREV1-4 ainda não usados.

## Preventiva (banco parte 2: PREV1-4)
- PREV é quase todo teoria (SUS, epidemiologia, vigilância, trabalho, ética): entrou como perguntas rápidas dos recém-formados da UBS (QD), não como casos. Novo arquivo src/06d_data_ubs_prev.js (63 perguntas: Yasser — RR, NNT/NNH, OR, imunidade coletiva, letalidade, transição, VPP; Camila — notificação, surtos, endemia, fases de ensaio, ITT, confundimento, vieses, rastreamento, prevenção quaternária, cuidados inversos; Renan — CAT, material biológico, chumbo, asma ocupacional, organofosforado, níquel, PAIR, LER/DORT, sigilo, atestados, publicidade, adolescente, DO de morte violenta, recusa terapêutica; Bianca — Conselhos/8.142, CIB/CIT, LC 141, complementar, equidade, regionalização, RAS, CAPS III, matriciamento, PTS, PNH, Ouvidoria, atributos de Starfield, acesso, telessaúde).
- Perguntas rápidas (QQ/QD) também tinham a correta como a mais longa em 43%: rebalanceadas para ~10% com tools/quick_opcoes.py (JSON {"início da pergunta": [correta, ...]}; só mexe em linhas QQ(/QD().

## Imagens da internet
- Rodada 1 (Wikimedia): 16 aprovadas e já no jogo/site (registro em notas/imagens.md). Página: https://claude.ai/artifact/9GwHC4Bu1sXqYGsQLZiB68
- Rodada 2 (PMC + Commons, só CC BY/CC BY-SA/CC0/domínio público): 8 aprovadas e no jogo (bateria, atresia de esôfago, HNF com TC acrescentada ao exame, hemangioma, onfalocele, Kawasaki, escarlatina, gastrosquise em ilustração). OMA recusada; o usuário mandou outra otoscopia, que entrou em pr_oma_lactente. Página: https://claude.ai/artifact/HAENbTvCaEimb4JhacaKzX (db coleção `decisoes`, doc id r2_*). Lista em notas/candidatas/cands_r2.json; arquivos em scratchpad/r2/aprova/img.
  - Ajuste combinado se aprovar r2_hnf: acrescentar TC trifásica ao exame de cx_hnf antes da RM.
- Descartadas na rodada 2: WPW (o artigo mostra FA SEM pré-excitação), gengivoestomatite (adulto jovem), Mycoplasma (consolidação lobar, caso é intersticial), PAC/derrame/empiema (lado/lobo diferentes do caso ou paciente adulto), TTRN (RX do 5º dia, inespecífico).
- Ainda sem imagem aberta: TTRN, Mycoplasma intersticial, PAC lobo inferior direito em pré-escolar, derrame/empiema à esquerda, hematoma cerebelar, FA pré-excitada (WPW), gengivoestomatite em criança pequena.
- Domínios ainda bloqueados (403): phil.cdc.gov, openi.nlm.nih.gov, ebi.ac.uk/europepmc, zenodo, openverse, radiopaedia, dermnet, arca.fiocruz.br; bvsms.saude.gov.br dá 503. upload.wikimedia.org responde 429 (limite) na maior parte das vezes.
- Partogramas de período pélvico prolongado e parto precipitado: enviados pelo usuário (manual do MS "Parto, aborto e puerpério"); casos op_periodo_pelvico e op_parto_precipitado criados. O formulário em branco do MS que ele mandou antes foi descartado a pedido dele.
- ECG de FA com resposta controlada (enviado pelo usuário, Aprenda ECG) no caso cc_fa_anticoag. Não serve para ue_fa_wpw (QRS estreito, sem pré-excitação); WPW segue sem imagem.
