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
- valida.js agora mostra também % da conduta correta como a MAIS CURTA (evitar o padrão inverso; alvo: distribuição parecida entre as 4 posições de tamanho).

## Imagens pendentes (buscar em fonte livre e mostrar ao usuário)
- RX de tórax pediátrico: consolidação lobar; derrame pleural; hiperinsuflação (bronquiolite); infiltrado intersticial (Mycoplasma/clamídia).
- Otoscopia: membrana timpânica abaulada (OMA).
- Foto: pseudomembrana diftérica; gengivoestomatite herpética; herpangina.
- RX de mão/punho para idade óssea (opcional, casos pc_).

## Casos antigos
Quando um tema for coberto pelo banco novo, remover/ajustar os casos antigos do mesmo tema na mesma área (sem repetição).

## Onde está salvo
- Trabalho em andamento no branch **banco-de-casos** do repositório (o site no main não muda até o teste final). Publicar = merge no main.
