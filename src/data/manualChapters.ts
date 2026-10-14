import { ManualChapter } from '../types';

export const growthManualChapters: ManualChapter[] = [
  {
    id: 'cap-1',
    number: 1,
    title: 'Fundamentos da Operação Exponencial com IA',
    subtitle: 'Como estruturar uma empresa ágil, enxuta e escalável operada por inteligência artificial',
    category: 'Fundamentos & Arquitetura',
    readTime: '10 min de leitura',
    requiresPlan: 'starter',
    locked: false,
    summary: 'Aprenda os princípios centrais para transformar tarefas manuais repetitivas em sistemas operacionais autônomos com o ecossistema NEXORA AI.',
    sectionsCount: 3,
    promptsCount: 2,
    checklistCount: 4,
    accessGranted: true,
    sections: [
      {
        title: '1. O Fim do Crescimento Linear: A Empresa Operada por IA',
        content: `O modelo tradicional de crescimento empresarial baseava-se em uma equação engessada: para dobrar o faturamento, era necessário dobrar o número de funcionários operacionais, triplicar os custos de folha e suportar um aumento desproporcional de erros humanos.

Na era dos agentes de inteligência artificial, essa premissa foi superada. A plataforma NEXORA AI introduz a Operação Exponencial: um modelo onde a inteligência generativa e os pipelines de automação assumem 80% do trabalho repetitivo de triagem, redação, acompanhamento e qualificação de clientes.

Isso permite que fundadores, diretores e equipes de alta performance concentrem sua energia nas decisões estratégicas, negociações de alto valor e inovação contínua de produtos e serviços.`,
        keyTakeaways: [
          'Desacoplamento de faturamento e headcount operacional',
          'Eliminação de tarefas braçais repetitivas com agentes dedicados',
          'Adoção de padrões de resposta ultra-rápidos (< 3 minutos)',
        ],
      },
      {
        title: '2. Os 4 Pilares da Operação NEXORA',
        content: `Toda empresa de sucesso sustentável dentro do ecossistema NEXORA AI opera sobre quatro pilares interdependentes:

1. Atração Preditiva: Campanhas de tráfego com segmentação precisa e mensagens que dialogam diretamente com as dores urgentes do cliente ideal (ICP).
2. Triagem e Qualificação em Tempo Real: Enriquecimento instantâneo de dados no momento em que o lead converte, atribuindo pontuações objetivas (Lead Scoring).
3. Ciclo de Vendas Consultivo: Roteiros comerciais baseados em perguntas de diagnóstico profundo (SPIN Selling) e quebra de objeções.
4. Automação e Retenção Contínua: Integrações via webhooks (n8n/Make) que orquestram a entrega, o onboarding e a retenção sem atritos.`,
        keyTakeaways: [
          'Pilares unificados evitam que leads fiquem perdidos em planilhas desconectadas',
          'A IA atua como um co-piloto ativo em cada etapa do funil',
        ],
      },
      {
        title: '3. Auditoria de Gargalos & Diagnóstico de Maturidade',
        content: `Antes de ativar ferramentas ou investir capital agressivo em tráfego pago, é indispensável diagnosticar onde sua empresa está perdendo dinheiro. Em 90% das auditorias que realizamos, as empresas perdem receita em três momentos críticos:

- Demora no primeiro contato: Responder um lead após 30 minutos reduz a chance de conversão em mais de 70%.
- Falta de personalização comercial: Vendedores enviando mensagens genéricas de cópia-e-cola sem contexto do negócio do prospect.
- Ausência de acompanhamento (follow-up): Mais de 60% das vendas B2B são fechadas entre o 4º e o 8º contato, mas a maioria dos vendedores desiste no 1º contato.`,
        keyTakeaways: [
          'Velocidade e cadência estruturada superam o volume desordenado',
          'Mapear e documentar o fluxo atual antes de automatizar',
        ],
      },
    ],
    diagram: {
      title: 'Diagrama da Arquitetura Operacional NEXORA AI',
      subtitle: 'Fluxo integrado da captura do lead até o fechamento contratual',
      visualFlow: [
        {
          step: '01',
          badge: 'Aquisição',
          title: 'Tráfego & Inbound',
          description: 'Campanhas hipersegmentadas no Meta e Google Ads captam visitantes com intenção comercial.',
        },
        {
          step: '02',
          badge: 'Qualificação',
          title: 'Triagem com IA',
          description: 'Motor Gemini 3.8 Flash analisa os dados do contato e calcula o Score Comercial (0-100).',
        },
        {
          step: '03',
          badge: 'Engajamento',
          title: 'Ação Comercial',
          description: 'Vendedor recebe alerta imediato com roteiro personalizado e perguntas SPIN sugeridas.',
        },
        {
          step: '04',
          badge: 'Escala',
          title: 'Pipeline n8n/Make',
          description: 'Webhooks sincronizam o contrato ganho, disparam onboarding e organizam tarefas.',
        },
      ],
      asciiDiagram: `[ Anúncios / Inbound ] ──> [ Formulário com LGPD ] ──> [ Triagem IA (Score 0-100) ]
                                                                  │
                                            ┌─────────────────────┴─────────────────────┐
                                            ▼                                           ▼
                                 [ Score >= 75: Urgente ]                   [ Score < 75: Nutrição ]
                                 Vendedor recebe alerta instantâneo         Sequência de conteúdo com IA
                                 Contato em até 3 minutos                   Automação de e-mails / WhatsApp`,
    },
    aiPrompts: [
      {
        title: 'Diagnóstico Executivo de Fugas de Receita',
        category: 'Diagnóstico & Estratégia',
        description: 'Use este comando na Central de IA (ferramenta Análise Empresarial) para mapear os gargalos da sua operação.',
        prompt: `Atue como auditor sênior de operações comerciais e eficiência em SaaS da NEXORA AI.
Analise a seguinte estrutura da minha empresa:
- Faturamento mensal atual: [Insira o valor, ex: R$ 80.000/mês]
- Tamanho da equipe comercial: [Insira número de vendedores/atendentes]
- Principal canal de vendas: [Ex: WhatsApp, Meta Ads, Indicações]
- Maior desafio atual: [Ex: Leads desqualificados, demora na resposta, objeção de preço]

Entregue:
1. Os 3 maiores pontos cegos onde estou deixando dinheiro na mesa.
2. Como a implementação de resposta rápida (< 5 min) impactaria minha receita estimada.
3. Plano de ação imediato em 3 passos para os próximos 14 dias.`,
      },
      {
        title: 'Construção da Proposta Única de Valor Irresistível (UVP)',
        category: 'Posicionamento',
        description: 'Utilize para formular uma proposta de valor de alto impacto no módulo Marketing & Estratégias.',
        prompt: `Como estrategista de posicionamento da NEXORA AI, formule 3 variações de Proposta Única de Valor (UVP) para minha empresa considerando:
- O que vendemos: [Descreva seu produto ou serviço]
- Para quem vendemos (ICP): [Descreva o decisor de compra]
- O maior problema que eliminamos: [Descreva a dor principal]
- Diferencial técnico ou de entrega: [Ex: Tecnologia com IA, agilidade, suporte consultivo]

As propostas devem seguir o framework: Verbo de Ação + Benefício Tangível + Redução de Risco ou Tempo + Sem o Maior Inconveniente Comum.`,
      },
    ],
    exercises: [
      {
        id: 'ex-1-1',
        title: 'Mapeamento de Horas Desperdiçadas',
        instruction: 'Calcule quantas horas semanais sua equipe gasta redigindo e-mails do zero, preenchendo relatórios manuais e respondendo perguntas repetitivas de clientes.',
        expectedOutcome: 'Identificar no mínimo 8 a 15 horas semanais liberadas para automação com os assistentes NEXORA.',
      },
      {
        id: 'ex-1-2',
        title: 'Auditoria de Tempo de Primeira Resposta (Speed to Lead)',
        instruction: 'Envie um lead de teste para os canais da sua empresa e cronometre exatamente quantos minutos levou para o primeiro contato humano acontecer.',
        expectedOutcome: 'Estabelecer a meta inegociável de responder em menos de 5 minutos utilizando o gatilho de automação.',
      },
    ],
    checklist: [
      {
        id: 'chk-1-1',
        label: 'Definir claramente o Perfil de Cliente Ideal (ICP) e critérios de desqualificação rápida.',
        details: 'Evite que vendedores percam tempo com curiosos ou contatos fora do orçamento.',
      },
      {
        id: 'chk-1-2',
        label: 'Configurar a Central de IA com o tom de voz e as políticas institucionais da marca.',
        details: 'Garanta uniformidade e profissionalismo em todas as mensagens geradas.',
      },
      {
        id: 'chk-1-3',
        label: 'Verificar a conformidade e o consentimento explícito LGPD em todos os formulários.',
        details: 'Garantir proteção jurídica e transparência no tratamento de dados comerciais.',
      },
      {
        id: 'chk-1-4',
        label: 'Alinhar o time de vendas sobre o SLA de resposta para leads qualificados com Score > 75.',
        details: 'A velocidade de contato é o multiplicador número 1 de taxa de fechamento.',
      },
    ],
  },
  {
    id: 'cap-2',
    number: 2,
    title: 'Engenharia de Tráfego Pago & Aquisição Preditiva',
    subtitle: 'Estruturação de campanhas no Meta Ads, Google Ads e LinkedIn orientadas a ROI e MQLs qualificados',
    category: 'Tráfego & Anúncios',
    readTime: '14 min de leitura',
    requiresPlan: 'pro',
    locked: false,
    summary: 'Aprenda a estruturar anúncios que atraem tomadores de decisão qualificados, calibrar o custo por aquisição e produzir criativos de alta retenção.',
    sectionsCount: 3,
    promptsCount: 2,
    checklistCount: 4,
    accessGranted: true,
    sections: [
      {
        title: '1. Arquitetura de Campanhas: Captura vs. Geração de Demanda',
        content: `O erro mais recorrente de gestores de tráfego é tratar todos os canais de mídia como se fossem idênticos. No modelo NEXORA de aquisição preditiva, dividimos a estratégia em dois motores complementares:

Motor 1 — Captura de Demanda (Google Search & Rede de Pesquisa):
O prospect já tem consciência da dor e está ativamente digitando termos como "software CRM com automação", "plataforma de marketing para clínicas" ou "agência de crescimento B2B". Aqui o anúncio deve ser objetivo, direto na solução e com sitelinks bem estruturados.

Motor 2 — Geração de Demanda e Interrupção (Meta Ads & LinkedIn Ads):
O prospect não está necessariamente buscando sua empresa naquele minuto, mas vivencia diariamente o problema que você resolve. O anúncio precisa interromper o feed nos primeiros 3 segundos através de um gancho visual e psicológico forte.`,
        keyTakeaways: [
          'Google Ads captura intenção transacional existente',
          'Meta Ads e LinkedIn geram reconhecimento e provocam a demanda',
          'Calcular sempre o CPA Máximo Aceitável antes de subir orçamento',
        ],
      },
      {
        title: '2. Criativos de Alta Retenção: A Fórmula do Gancho + Dor + Demonstração',
        content: `Criativos estáticos genéricos com fotos de bancos de imagens gratuitos não convertem mais. Os anúncios que alcançam ROI superior a 4x no NEXORA AI seguem a estrutura dos 4 blocos:

1. O Gancho (0 a 3s): Uma frase ou cena que quebra o padrão mental do usuário (ex: "Se você ainda passa 2 horas do dia preenchendo relatórios no Excel, você está jogando margem de lucro no lixo").
2. A Agitação da Dor (3 a 12s): Explicar as consequências reais de manter o processo antigo.
3. A Demonstração Visual (12 a 30s): Exibir a interface da solução em ação (a tela do CRM, a pontuação da IA ou o webhook sendo disparado).
4. Chamada para Ação com Redução de Risco (30 a 45s): "Clique no botão abaixo para receber um diagnóstico gratuito da sua operação comercial."`,
        keyTakeaways: [
          'Demonstrações práticas da interface geram 3x mais autoridade que depoimentos genéricos',
          'Substituir termos vagos por métricas tangíveis',
        ],
      },
      {
        title: '3. Acompanhamento de Métricas: Não Seja Iludido por Métricas de Vaidade',
        content: `Muitos empresários comemoram milhares de impressões e curtidas enquanto o caixa da empresa continua vazio. No módulo Publicidade & Campanhas da NEXORA AI, focamos exclusivamente nas métricas que pagam as contas:

- CTR (Click-Through Rate): Percentual de cliques nos anúncios. Benchmark saudável: > 1.8% no Meta Ads e > 4.5% na Rede de Pesquisa Google.
- CPA (Custo por Aquisição / Lead Qualificado): Quanto custa colocar um MQL real na esteira do CRM.
- Taxa de Qualificação (MQL / Total): Percentual de contatos válidos com dados reais.
- ROI (Retorno sobre Investimento Publicitário): Faturamento líquido gerado dividido pelo gasto de mídia.`,
        keyTakeaways: [
          'Curtidas não pagam servidores ou comissões',
          'Otimizar campanhas semana a semana com base nas conversões reais registradas no CRM',
        ],
      },
    ],
    diagram: {
      title: 'Fluxograma de Aquisição e Retargeting Dinâmico',
      subtitle: 'Como conduzir o usuário do desconhecimento até a oportunidade aberta no CRM',
      visualFlow: [
        {
          step: '01',
          badge: 'Descoberta',
          title: 'Campanha de Topo',
          description: 'Vídeos de 30-45s no Meta Ads introduzindo a dor operacional e os benefícios da automação.',
        },
        {
          step: '02',
          badge: 'Captura',
          title: 'Página de Conversão',
          description: 'Landing page ultra-rápida solicitando nome, empresa, e-mail e telefone com consentimento.',
        },
        {
          step: '03',
          badge: 'Retargeting',
          title: 'Recuperação Ativa',
          description: 'Anúncios de prova social e cases de clientes para quem visitou e não preencheu o formulário.',
        },
        {
          step: '04',
          badge: 'Sincronização',
          title: 'Entrada no CRM',
          description: 'Criação instantânea do lead na coluna "Novo Lead" com disparo do scoring da IA.',
        },
      ],
      asciiDiagram: `[ Anúncio Meta / Google ] ──> [ Landing Page Otimizada ]
             │                                   │
             ▼ (Não converteu)                   ▼ (Converteu)
     [ Retargeting Dinâmico ]             [ Entrada no CRM NEXORA ]
     Vídeos de cases e depoimentos         Disparo imediato de triagem por IA`,
    },
    aiPrompts: [
      {
        title: 'Gerador de 5 Variações de Ganchos e Copies de Anúncios',
        category: 'Publicidade',
        description: 'Cole na Central de IA (Ideias de Campanhas) para gerar variações completas de anúncio.',
        prompt: `Atue como copywriter sênior de anúncios de alta conversão para tráfego pago da NEXORA AI.
Quero criar uma campanha de anúncios para:
- Nicho: [Ex: Clínicas Médicas, B2B, Varejo, Consultoria]
- Oferta: [Ex: Demonstração guiada de automação de vendas]
- Principal dor: [Ex: Perda de clientes por falta de resposta rápida]
- Plataforma: Meta Ads (Instagram/Facebook)

Entregue:
1. 5 ganchos magnéticos para os primeiros 3 segundos de vídeo.
2. 3 textos principais completos (Primary Text) formatados com emojis estratégicos e CTAs claras.
3. 5 opções de títulos curtos (Headlines) para os cards de anúncio.`,
      },
      {
        title: 'Roteiro de Anúncio em Vídeo no Formato de Demonstração (Reels/TikTok)',
        category: 'Vídeo Marketing',
        description: 'Estruture roteiros de tela mostrando a interface e gerando desejo imediato.',
        prompt: `Crie um roteiro detalhado de vídeo de 40 segundos para Reels/TikTok Ads:
- Produto: NEXORA AI Hub
- Público: Empresários e Diretores que sofrem com processos manuais
- Formato: Vídeo dividido em Cena Visual + Áudio Falado + Texto na Tela

O roteiro deve ter 4 partes:
- 0 a 5s: Gancho disruptivo
- 5 a 15s: Demonstração da dor
- 15 a 30s: Resolução rápida mostrando o software funcionando
- 30 a 40s: Chamada de ação direta (CTA)`,
      },
    ],
    exercises: [
      {
        id: 'ex-2-1',
        title: 'Cálculo da Métrica de CPA Máximo Viável',
        instruction: 'Multiplique o ticket médio do seu serviço pela margem bruta da empresa e pela taxa média de conversão de fechamento para estipular o valor máximo que pode pagar por lead.',
        expectedOutcome: 'Garantir que as campanhas só operem com folga de margem e segurança financeira.',
      },
      {
        id: 'ex-2-2',
        title: 'Criação de Biblioteca de 3 Criativos com Ângulos Distintos',
        instruction: 'Produza um criativo focado em Ganho de Tempo, um focado em Aumento de Lucro e um focado em Eliminação de Erros.',
        expectedOutcome: 'Testar qual ângulo psicológico ressoa melhor com o seu público.',
      },
    ],
    checklist: [
      {
        id: 'chk-2-1',
        label: 'Configurar e validar o Pixel de conversão e eventos na página de destino.',
        details: 'Garante que os algoritmos de anúncio otimizem para vendas e não apenas cliques aleatórios.',
      },
      {
        id: 'chk-2-2',
        label: 'Testar no mínimo 3 criativos visuais diferentes para cada conjunto de anúncios.',
        details: 'Evita fadiga precoce de criativos e reduz o custo por clique.',
      },
      {
        id: 'chk-2-3',
        label: 'Estabelecer orçamento diário consistente por no mínimo 7 dias antes de alterar parâmetros.',
        details: 'Respeite a fase de aprendizado dos algoritmos de tráfego.',
      },
      {
        id: 'chk-2-4',
        label: 'Conectar a conta de anúncios no módulo Campanhas da NEXORA para controle de ROI.',
        details: 'Mantenha os indicadores de gasto e retorno centralizados em uma visão única.',
      },
    ],
  },
  {
    id: 'cap-3',
    number: 3,
    title: 'CRM Inteligente & Ciclo de Vendas de Alta Velocidade',
    subtitle: 'Metodologia SPIN Selling, pontuação preditiva de leads por IA e gestão visual do funil comercial',
    category: 'Vendas & Negociação',
    readTime: '12 min de leitura',
    requiresPlan: 'pro',
    locked: false,
    summary: 'Implemente cadências comerciais consultivas, elimine gargalos de negociação e feche contratos maiores usando inteligência artificial.',
    sectionsCount: 3,
    promptsCount: 2,
    checklistCount: 4,
    accessGranted: true,
    sections: [
      {
        title: '1. O Mito do "Vendedor Nato" vs. O Processo Comercial Previsível',
        content: `Durante décadas acreditou-se que vender dependia do carisma de um indivíduo específico. Em operações empresariais modernas, vendas é uma ciência matemática e processual.

No CRM da NEXORA AI, todo lead percorre etapas padronizadas:
1. Novo Lead: Entrada inicial sem contato.
2. Contato Realizado: Primeira abordagem efetuada em menos de 5 minutos.
3. Qualificado: Critérios de orçamento, autoridade e necessidade confirmados.
4. Proposta Enviada: Apresentação do escopo com valor de investimento e SLA.
5. Em Negociação: Alinhamento final de termos, prazos e contratos.
6. Fechado / Ganho: Contrato formalizado e início do onboarding.`,
        keyTakeaways: [
          'Processos documentados geram receita previsível e replicável',
          'A pontuação da IA identifica quais leads devem receber atenção prioritária do closer',
        ],
      },
      {
        title: '2. Metodologia SPIN Selling Aplicada na Prática',
        content: `Para fechar negócios de alto valor sem depender de dar descontos desnecessários, utilize o framework SPIN nas reuniões comerciais:

- S (Situação): Perguntas para entender o momento atual do cliente ("Como sua equipe distribui tarefas hoje?").
- P (Problema): Perguntas para fazer o prospect reconhecer o atrito ("Onde os clientes mais reclamam de demora?").
- I (Implicação): Perguntas que evidenciam o custo real de não resolver o problema ("Quanto dinheiro você estima que a empresa perde por mês com essa ineficiência?").
- N (Necessidade de Solução): Perguntas que fazem o próprio cliente verbalizar o valor da sua solução ("Se você pudesse automatizar essa triagem em 3 minutos, quanto isso aliviaria sua operação?").`,
        keyTakeaways: [
          'O cliente se convence pelo que ele fala, não pelo que o vendedor tenta empurrar',
          'Venda valor e tempo recuperado, nunca apenas funcionalidades',
        ],
      },
      {
        title: '3. Inteligência Artificial no Fechamento: Diagnóstico em Segundos',
        content: `O botão de Pontuação Preditiva (Lead Score) da NEXORA AI analisa o histórico, cargo, tamanho da empresa e valor da oportunidade do lead para gerar um parecer consultivo instantâneo.

Isso orienta o consultor comercial exatamente sobre qual argumento utilizar e qual gatilho de urgência acionar antes de iniciar a ligação ou enviar a mensagem de proposta.`,
        keyTakeaways: [
          'Leads com Score > 80 devem ser contatados por ligação de voz prioritária',
          'Leads com Score < 70 recebem automações de nutrição com materiais e estudos de caso',
        ],
      },
    ],
    diagram: {
      title: 'Esteira de Qualificação e Fechamento no CRM',
      subtitle: 'Da entrada do lead até a formalização do contrato',
      visualFlow: [
        {
          step: '01',
          badge: 'Triagem',
          title: 'Pontuação de IA',
          description: 'O algoritmo lê as informações cadastrais e gera o Score de 0 a 100 com diagnóstico.',
        },
        {
          step: '02',
          badge: 'Diagnóstico',
          title: 'Reunião SPIN',
          description: 'O vendedor conduz a conversa investigando a dor e quantificando as perdas do cliente.',
        },
        {
          step: '03',
          badge: 'Proposta',
          title: 'Apresentação de Solução',
          description: 'Envio da minuta comercial com termos claros, prazos de entrega e retorno estimado.',
        },
        {
          step: '04',
          badge: 'Fechamento',
          title: 'Contrato Ganho',
          description: 'Lead movido para "Fechado/Ganho" com acionamento automático de boas-vindas.',
        },
      ],
      asciiDiagram: `[ Novo Lead ] ──> [ Score IA: 88 ] ──> [ Ligação de Diagnóstico SPIN ]
                                                     │
                                                     ▼
                                       [ Envio de Proposta Comercial ]
                                                     │
                                                     ▼
                                       [ Fechado / Ganho: Contrato Ativo ]`,
    },
    aiPrompts: [
      {
        title: 'Gerador de Roteiro SPIN Selling Customizado',
        category: 'Vendas',
        description: 'Execute na Central de IA (Assistente de Vendas) antes de uma reunião comercial decisiva.',
        prompt: `Atue como o Diretor Comercial de Alta Performance da NEXORA AI.
Tenho uma reunião com o seguinte perfil de cliente:
- Cargo do comprador: [Ex: Diretor Financeiro ou Sócio de Clínica]
- Setor: [Ex: Serviços de Saúde / Tecnologia / Comércio]
- Valor da proposta estimada: R$ [Insira valor]
- Principal dor declarada: [Ex: Atendimento lento e desorganizado]

Gere:
1. 2 perguntas de Situação (S) para aquecimento.
2. 2 perguntas de Problema (P) cirúrgicas.
3. 2 perguntas de Implicação (I) que evidenciem o prejuízo de não agir hoje.
4. 2 perguntas de Necessidade de Solução (N) para conduzir ao fechamento.`,
      },
      {
        title: 'Quebra Matadora de Objeção de Preço ("Está muito caro")',
        category: 'Negociação',
        description: 'Script para responder clientes que tentam pedir desconto ou hesitam no valor.',
        prompt: `Como especialista em negociação executiva da NEXORA AI, formule uma resposta consultiva e elegante para a objeção:
"Achei a solução muito boa, mas o valor está acima do nosso orçamento para este mês."

A resposta deve:
- Validar a preocupação financeira com empatia
- Comparar o valor do investimento com o prejuízo que a empresa continua tendo sem a solução
- Apresentar uma opção de parcelamento ou início com foco no retorno rápido nos primeiros 30 dias
- Terminar com uma pergunta fechada de compromisso`,
      },
    ],
    exercises: [
      {
        id: 'ex-3-1',
        title: 'Simulação de Roleplay de Vendas com IA',
        instruction: 'Use o Assistente de Vendas para simular um cliente cético e teste diferentes respostas até dominar a quebra da objeção sem gaguejar.',
        expectedOutcome: 'Aumentar a confiança da equipe antes de entrar em contato com leads reais.',
      },
      {
        id: 'ex-3-2',
        title: 'Auditoria Semanal dos Leads Estagnados',
        instruction: 'Revise todas as oportunidades paradas há mais de 7 dias na coluna "Proposta Enviada" e aplique um follow-up de desapego ("Break-up email").',
        expectedOutcome: 'Reativar no mínimo 20% das negociações mornas ou liberar espaço no funil.',
      },
    ],
    checklist: [
      {
        id: 'chk-3-1',
        label: 'Garantir que todo lead cadastrado tenha data e descrição da próxima ação definida.',
        details: 'Nenhum contato deve permanecer no CRM sem um próximo passo agendado.',
      },
      {
        id: 'chk-3-2',
        label: 'Executar o recálculo de Score por IA em todas as novas oportunidades.',
        details: 'Identifique os leads mais quentes para contato nas primeiras 24 horas.',
      },
      {
        id: 'chk-3-3',
        label: 'Registrar o histórico de ligações, reuniões e notas dentro do card do lead.',
        details: 'Permite que qualquer pessoa da equipe assuma o atendimento com histórico transparente.',
      },
      {
        id: 'chk-3-4',
        label: 'Exportar o relatório de funil mensalmente em CSV para análise de gargalos.',
        details: 'Acompanhe a evolução da taxa de conversão entre etapas.',
      },
    ],
  },
  {
    id: 'cap-4',
    number: 4,
    title: 'Automações Avançadas com n8n, Make & Webhooks',
    subtitle: 'Arquitetura de microsserviços, gatilhos de eventos e sincronização em tempo real sem código complexo',
    category: 'Tecnologia & Automação',
    readTime: '15 min de leitura',
    requiresPlan: 'pro',
    locked: false,
    summary: 'Construa ecossistemas automatizados conectados a webhooks externos, garantindo integridade de dados e latência mínima.',
    sectionsCount: 3,
    promptsCount: 2,
    checklistCount: 4,
    accessGranted: true,
    sections: [
      {
        title: '1. O Papel dos Webhooks no Ecossistema Moderno',
        content: `Automações baseadas em sincronizações periódicas ("polling" a cada 15 minutos) pertencem ao passado. No NEXORA AI, a comunicação entre o CRM e plataformas de automação (como n8n, Make ou Zapier) é orientada a eventos (Event-Driven Architecture).

Quando um evento ocorre — por exemplo, a criação de um novo lead ou a mudança de fase no pipeline — o servidor do NEXORA envia imediatamente uma requisição HTTP POST segura para o webhook configurado.

O payload viaja em formato JSON contendo todos os dados relevantes do lead, permitindo que seu fluxo do n8n execute instantaneamente:
- Consulta a bases externas e enriquecimento de dados CNPJ
- Disparo de mensagem no WhatsApp da equipe comercial
- Emissão de contratos automáticos via plataformas de assinatura digital`,
        keyTakeaways: [
          'Comunicação em tempo real em menos de 500ms',
          'Carga zero no navegador: todas as execuções ocorrem no servidor',
          'Logs de auditoria gravam código de status e tempo de resposta',
        ],
      },
      {
        title: '2. Melhores Práticas de Segurança e Resiliência',
        content: `Integrar sistemas exige disciplina de segurança para evitar falhas silenciosas ou perda de leads valiosos:

- Tratamento de Falhas (Error Handling): Se o webhook externo retornar HTTP 500 ou 504 (timeout), o NEXORA AI sinaliza a falha e registra o log com detalhes para reexecução.
- Validação de Payloads: Verifique sempre se os dados de contato contêm e-mail ou telefone válidos antes de disparar automações de comunicação.
- Teste de Disparo ao Vivo: Utilize o botão de "Testar Disparo" no módulo Automações para verificar a conectividade e a latência antes de ativar qualquer fluxo em produção.`,
        keyTakeaways: [
          'Nunca considere uma automação ativa sem antes realizar um teste de ponta a ponta',
          'Monitore periodicamente a aba de Logs de Execução para identificar instabilidades externas',
        ],
      },
      {
        title: '3. Casos de Uso Mais Lucrativos com n8n & NEXORA',
        content: `Entre os fluxos mais adotados por empresas que escalaram sua operação com a NEXORA AI, destacam-se:

1. Onboarding Automático de Contratos Ganhos: O lead entra em Fechado/Ganho no CRM, o webhook do n8n gera uma pasta compartilhada no Google Drive, cria a cobrança recorrente e envia um e-mail com as credenciais de acesso ao cliente.
2. Alerta Prioritário no Telegram / WhatsApp da Diretoria: Quando um contrato acima de R$ 30.000 é fechado, a equipe recebe uma notificação comemorativa instantânea.
3. Alerta de Inatividade de Vendas: Se um lead em negociação passar mais de 4 dias sem interação, uma tarefa de urgência é criada para o gestor comercial.`,
        keyTakeaways: [
          'Automatize tarefas burocráticas para que humanos façam apenas trabalho relacional e criativo',
        ],
      },
    ],
    diagram: {
      title: 'Topologia do Pipeline de Automação com Webhook',
      subtitle: 'Comunicação segura entre a plataforma NEXORA e serviços externos',
      visualFlow: [
        {
          step: '01',
          badge: 'Gatilho',
          title: 'Evento no NEXORA',
          description: 'Ação do usuário ou atualização no banco de dados dispara o evento correspondente.',
        },
        {
          step: '02',
          badge: 'Servidor',
          title: 'Disparo HTTP POST',
          description: 'Servidor Express envia requisição com payload JSON e headers para o endpoint n8n/Make.',
        },
        {
          step: '03',
          badge: 'Orquestrador',
          title: 'Execução do Workflow',
          description: 'O n8n executa os nós de enriquecimento, mensagens e conexões com APIs terceiras.',
        },
        {
          step: '04',
          badge: 'Feedback',
          title: 'Registro de Log',
          description: 'O código HTTP e o tempo de resposta em milissegundos são gravados nos logs da empresa.',
        },
      ],
      asciiDiagram: `[ NEXORA AI Core ] ──(HTTP POST Seguro)──> [ Webhook n8n / Make ]
          │                                              │
          ▼                                              ▼
    Grava Log de Execução                        Executa Workflow:
    - Status HTTP (200 / 500)                    - Notifica Vendedor
    - Latência em milissegundos                  - Dispara Mensagem de Boas-vindas
    - Payload transmitido                        - Registra no Sistema Contábil`,
    },
    aiPrompts: [
      {
        title: 'Gerador de Estrutura de Workflow JSON para n8n',
        category: 'Automação & Integração',
        description: 'Gere o mapeamento lógico dos nós do n8n antes de montar o fluxo visual.',
        prompt: `Atue como arquiteto de automações empresariais especialista em n8n e webhooks da NEXORA AI.
Preciso estruturar um fluxo que faça o seguinte:
- Gatilho: Recebe webhook da NEXORA AI no evento 'new_lead'
- Etapa 1: Validar se o telefone possui DDD válido brasileiro
- Etapa 2: Se Score da IA >= 80, enviar mensagem instantânea no canal de vendas
- Etapa 3: Criar tarefa no calendário para o closer ligar em até 15 minutos

Entregue:
1. Diagrama em tópicos explicando cada nó necessário no n8n.
2. Exemplo do código JavaScript a ser inserido no nó 'Code' para tratamento do payload.
3. Estratégia de fallback caso o serviço de mensagem esteja fora do ar.`,
      },
      {
        title: 'Script de Validação e Enriquecimento de Dados de Lead',
        category: 'Engenharia de Dados',
        description: 'Código limpo em Node.js / JavaScript para ser usado em nós de funções ou webhooks.',
        prompt: `Escreva uma função pura em JavaScript (Node.js ES6) para higienizar dados de leads vindos de formulários web:
- Entrada: Objeto contendo { name, email, phone, companyName }
- Regras:
  1. Remover caracteres não numéricos do telefone e garantir formato DDI + DDD + Número
  2. Colocar o nome da empresa e da pessoa em Title Case (Primeiras letras maiúsculas)
  3. Validar se o e-mail não é de domínio descartável (tempmail, 10minutemail, etc.)
  4. Retornar objeto limpo e flag 'isValid: boolean'`,
      },
    ],
    exercises: [
      {
        id: 'ex-4-1',
        title: 'Teste de Disparo Real com Webhook de Demonstração',
        instruction: 'Acesse o módulo de Automações, clique em Testar Disparo na automação principal e verifique nos logs o tempo de resposta e o payload transmitido.',
        expectedOutcome: 'Confirmar retorno HTTP 200 e latência inferior a 800 milissegundos.',
      },
      {
        id: 'ex-4-2',
        title: 'Configuração de Webhook de Alerta em Caso de Falha',
        instruction: 'Crie uma automação que alerte o administrador caso uma tentativa de integração com serviço terceiro retorne erro.',
        expectedOutcome: 'Evitar que erros de sincronização passem despercebidos pela equipe técnica.',
      },
    ],
    checklist: [
      {
        id: 'chk-4-1',
        label: 'Verificar se todas as URLs de webhooks utilizam protocolo HTTPS seguro.',
        details: 'Protege os dados em trânsito contra interceptações.',
      },
      {
        id: 'chk-4-2',
        label: 'Realizar teste de latência e conferir o registro no histórico de logs de execução.',
        details: 'Valide se o endpoint externo responde em tempo adequado.',
      },
      {
        id: 'chk-4-3',
        label: 'Documentar os parâmetros de cada webhook para que outros membros da equipe possam operar.',
        details: 'Facilita manutenções futuras e expansão de novos fluxos.',
      },
      {
        id: 'chk-4-4',
        label: 'Garantir que segredos e tokens de API nunca sejam expostos no front-end.',
        details: 'Siga rigorosamente as diretrizes de segurança no servidor.',
      },
    ],
  },
  {
    id: 'cap-5',
    number: 5,
    title: 'Retenção, LTV e Expansão de Clientes (Playbook de Escala)',
    subtitle: 'Maximização do Lifetime Value, onboarding orientado a sucesso e redução estrutural de churn',
    category: 'Escala & Retenção',
    readTime: '16 min de leitura',
    requiresPlan: 'business',
    locked: false,
    summary: 'Aprenda a estruturar programas de retenção ativa, encantar clientes desde os primeiros 7 dias e multiplicar o valor vitalício dos contratos.',
    sectionsCount: 3,
    promptsCount: 2,
    checklistCount: 4,
    accessGranted: true,
    sections: [
      {
        title: '1. A Verdadeira Máquina de Crescimento: O Net Revenue Retention (NRR)',
        content: `Adquirir novos clientes é caro. Uma empresa que apenas atrai clientes novos, mas perde 5% a 10% da sua base todos os meses (churn), assemelha-se a um balde furado: é preciso gastar fortunas em anúncios apenas para manter o faturamento estagnado.

As empresas mais valiosas do mundo constroem seu império sobre o NRR (Net Revenue Retention): quando os clientes existentes contratam mais planos, utilizam mais recursos e aumentam seu gasto médio ao longo do tempo.

No modelo NEXORA AI de expansão:
- O cliente inicia no plano Starter ou Pro.
- Em 60 dias, a geração de leads e a eficiência das automações provam o retorno financeiro.
- O cliente naturalmente realiza o upgrade para o plano Enterprise Business para adicionar mais equipes e automações ilimitadas.`,
        keyTakeaways: [
          'Reter um cliente existente custa até 7 vezes menos que adquirir um novo',
          'O valor vitalício (LTV) determina o teto de crescimento da sua empresa',
        ],
      },
      {
        title: '2. O Framework do Onboarding dos Primeiros 7 Dias (First Value)',
        content: `O cancelamento (churn) não acontece no dia em que o cliente pede o cancelamento: ele acontece na primeira semana, quando o cliente não consegue extrair valor imediato do serviço contratado.

Para garantir que cada novo cliente sinta o impacto positivo da sua empresa em até 7 dias, aplique o roteiro de onboarding ativo:
- Dia 0 (Imediato): Mensagem calorosa do fundador e liberação instantânea de acessos.
- Dia 1: Ligação de boas-vindas com especialista para configurar o primeiro fluxo de sucesso.
- Dia 3: Verificação de uso — confirmar que a primeira campanha ou lead já foi registrado.
- Dia 7: Entrega do primeiro relatório de progresso, celebrando os primeiros resultados conquistados.`,
        keyTakeaways: [
          'Acelerar o momento "Aha!" do cliente reduz o cancelamento em mais de 50%',
          'Celebrar pequenas vitórias constrói relacionamento de longo prazo',
        ],
      },
      {
        title: '3. Transição de Prestador de Serviço para Parceiro Estratégico',
        content: `Clientes cancelam prestadores de serviços comoditizados (que disputam preço centavo a centavo). Clientes nunca cancelam parceiros estratégicos que geram inteligência e receita direta para seus negócios.

Ao utilizar os relatórios de inteligência comercial, as métricas de ROI e a Central de IA da NEXORA, você deixa de entregar apenas "tarefas" e passa a entregar previsibilidade de crescimento executivo para a diretoria da empresa cliente.`,
        keyTakeaways: [
          'Apresente relatórios mensais comparativos com foco em receita líquida gerada',
          'Antecipe gargalos futuros e proponha soluções antes que o cliente sinta a dor',
        ],
      },
    ],
    diagram: {
      title: 'Jornada de Retenção e Expansão de LTV (90 Dias)',
      subtitle: 'Como transformar clientes pontuais em defensores de longo prazo',
      visualFlow: [
        {
          step: '01',
          badge: 'Dia 0 a 7',
          title: 'Primeiro Valor Real',
          description: 'Configuração imediata e ativação do primeiro fluxo de retorno tangível.',
        },
        {
          step: '02',
          badge: 'Dia 30',
          title: 'Revisão de ROI',
          description: 'Apresentação formal dos resultados mensurados no painel de relatórios.',
        },
        {
          step: '03',
          badge: 'Dia 60',
          title: 'Identificação de Upsell',
          description: 'Mapeamento de novos setores ou produtos que podem ser automatizados.',
        },
        {
          step: '04',
          badge: 'Dia 90+',
          title: 'Contrato de Longo Prazo',
          description: 'Renovação anual com ampliação de capacidade e desconto de fidelidade.',
        },
      ],
      asciiDiagram: `[ Contrato Fechado ] ──> [ Onboarding 7 Dias: First Value ]
                                       │
                                       ▼
                       [ Dia 30: Apresentação de ROI Mensurado ]
                                       │
                                       ▼
                       [ Dia 60+: Expansão & Upgrade de Plano ]
                       Maior LTV, Menor Custo de Venda e Fidelidade`,
    },
    aiPrompts: [
      {
        title: 'Roteiro de E-mails de Onboarding Ativo para Clientes',
        category: 'Retenção & Onboarding',
        description: 'Gere a sequência completa de e-mails para engajar o cliente nos primeiros 14 dias.',
        prompt: `Atue como Especialista Sênior em Customer Success e Retenção da NEXORA AI.
Crie uma sequência estratégica de 4 e-mails de Onboarding para novos clientes corporativos:
- Produto/Serviço: [Descreva sua solução]
- Meta do cliente: [Descreva o resultado que ele contratou]
- Tom: Acolhedor, profissional, focado em ação e sem jargões corporativos vazios

A sequência deve conter:
- E-mail 1 (D0): Boas-vindas calorosas + 1 única ação rápida para hoje
- E-mail 2 (D3): Dica de ouro para economizar tempo imediatamente
- E-mail 3 (D7): Verificação de progresso e canal direto para tirar dúvidas
- E-mail 4 (D14): Convite para reunião de alinhamento estratégico de 20 minutos`,
      },
      {
        title: 'Pesquisa Proativa de Satisfação e Diagnóstico Pré-Churn',
        category: 'Customer Success',
        description: 'Identifique clientes insatisfeitos antes que eles decidam cancelar.',
        prompt: `Escreva um modelo de mensagem curta e pessoal para WhatsApp/E-mail destinada a clientes ativos há 45 dias:
- O objetivo é colher feedback genuíno sem parecer uma pesquisa burocrática fria
- A mensagem deve demonstrar que o fundador/diretor se importa de verdade com o resultado do cliente
- Deve convidar para uma conversa rápida caso algo não esteja correspondendo 100% à expectativa inicial`,
      },
    ],
    exercises: [
      {
        id: 'ex-5-1',
        title: 'Auditoria de Churn dos Últimos 6 Meses',
        instruction: 'Liste todos os clientes que cancelaram nos últimos 6 meses e categorize o motivo principal: Falha de onboarding, produto não utilizado, falta de contato ou corte de custos.',
        expectedOutcome: 'Identificar a causa raiz para blindar a base atual contra o mesmo erro.',
      },
      {
        id: 'ex-5-2',
        title: 'Mapeamento de 3 Oportunidades de Upgrade na Base Ativa',
        instruction: 'Analise sua carteira e selecione 3 clientes que já atingiram resultados e poderiam dobrar seu volume contratando o próximo nível de plano.',
        expectedOutcome: 'Gerar receita nova imediata sem gastar 1 centavo a mais em tráfego pago.',
      },
    ],
    checklist: [
      {
        id: 'chk-5-1',
        label: 'Garantir que todo cliente passe pelo fluxo de onboarding ativo nos primeiros 7 dias.',
        details: 'O primeiro contato de suporte define o nível de satisfação permanente.',
      },
      {
        id: 'chk-5-2',
        label: 'Apresentar relatórios formais de ROI com métricas claras extraídas do sistema.',
        details: 'Tangibilize o valor gerado para o contratante de forma visual.',
      },
      {
        id: 'chk-5-3',
        label: 'Criar canal direto de suporte e atendimento prioritário para contas estratégicas.',
        details: 'Clientes de alto valor exigem tempo de resposta imediato.',
      },
      {
        id: 'chk-5-4',
        label: 'Oferecer incentivo e desconto atrativo para clientes que migram para planos anuais.',
        details: 'Planos anuais garantem previsibilidade de fluxo de caixa e estabilidade operacional.',
      },
    ],
  },
];
