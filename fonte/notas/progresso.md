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
Parte 2 (GO, Urgência, Cirurgia?) ainda não chegou.

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
- PENDENTE: go_hac duplica ce_hac_nao_classica → refazer go_hac como amenorreia primária/HAC clássica na parte GO. upa_apend1/2 x cir_apend/2 → resolver em Urgência/Cirurgia.
