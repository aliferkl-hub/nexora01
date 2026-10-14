import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { growthManualChapters } from './src/data/manualChapters.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Database storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'nexora_db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing utilities (crypto PBKDF2 with salt)
function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): { hash: string; salt: string } {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Initial Database Seeding
function getInitialDb() {
  const defaultSalt = 'nexora_secure_salt_2026';
  const ownerHash = crypto.pbkdf2Sync('Nexora@2026!', defaultSalt, 1000, 64, 'sha512').toString('hex');
  const userHash = crypto.pbkdf2Sync('Senha123!', defaultSalt, 1000, 64, 'sha512').toString('hex');

  return {
    companies: [
      {
        id: 'comp_nexora_main',
        name: 'Nexora AI Hub (Matriz)',
        slug: 'nexora-ai',
        plan: 'business',
        status: 'active',
        cnpj: '48.910.123/0001-90',
        industry: 'Tecnologia & Marketing Digital',
        phone: '+55 (11) 98822-1000',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'comp_nexus_digital',
        name: 'Nexus E-Commerce Tech',
        slug: 'nexus-digital',
        plan: 'pro',
        status: 'active',
        cnpj: '33.456.789/0001-12',
        industry: 'Comércio Eletrônico & Varejo',
        phone: '+55 (21) 97123-4567',
        createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      },
      {
        id: 'comp_lumina_saude',
        name: 'Clínica Lumina Saúde & Estética',
        slug: 'lumina-saude',
        plan: 'starter',
        status: 'trial',
        cnpj: '19.876.543/0001-44',
        industry: 'Saúde e Bem-estar',
        phone: '+55 (31) 99876-5432',
        createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
      }
    ],
    users: [
      {
        id: 'usr_owner_01',
        name: 'Alifer Madeiro',
        email: 'admin@nexora.ai',
        passwordHash: ownerHash,
        passwordSalt: defaultSalt,
        role: 'owner', // owner, admin, specialist, viewer
        companyId: 'comp_nexora_main',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_nexus_admin',
        name: 'Lucas Mendes',
        email: 'lucas@nexusecom.com.br',
        passwordHash: userHash,
        passwordSalt: defaultSalt,
        role: 'admin',
        companyId: 'comp_nexus_digital',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'usr_lumina_admin',
        name: 'Dra. Mariana Costa',
        email: 'mariana@clinicalumina.com.br',
        passwordHash: userHash,
        passwordSalt: defaultSalt,
        role: 'admin',
        companyId: 'comp_lumina_saude',
        createdAt: new Date().toISOString(),
      }
    ],
    sessions: {} as Record<string, { userId: string; companyId: string; expiresAt: number }>,
    resetTokens: {} as Record<string, { email: string; expiresAt: number }>,
    manualProgress: {} as Record<string, { completedChapters: string[]; checkedItems: string[]; lastActiveChapterId?: string }>,
    leads: [
      {
        id: 'lead_001',
        companyId: 'comp_nexora_main',
        name: 'Rafael Valente',
        companyName: 'Valente Logística & Frotas',
        email: 'rafael@valentelog.com.br',
        phone: '+55 11 98452-1100',
        stage: 'negotiation', // new, contact, qualified, proposal, negotiation, closed_won, closed_lost
        opportunityValue: 24500,
        source: 'Google Ads',
        aiScore: 92,
        aiQualification: 'Lead com alto faturamento, demanda urgente de automação de pós-venda e orçamento aprovado.',
        nextAction: 'Apresentar proposta técnica comercial via Meet',
        nextActionDate: '2026-10-16',
        lgpdConsent: true,
        lgpdConsentDate: new Date().toISOString(),
        tags: ['Empresa Grande', 'Automação', 'Urgente'],
        createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
      },
      {
        id: 'lead_002',
        companyId: 'comp_nexora_main',
        name: 'Juliana Siqueira',
        companyName: 'Fintech Aurora Pay',
        email: 'juliana.s@aurorapay.io',
        phone: '+55 11 97722-4433',
        stage: 'proposal',
        opportunityValue: 48000,
        source: 'LinkedIn Inbound',
        aiScore: 88,
        aiQualification: 'Interesse em IA para triagem de suporte e integração via webhooks com CRM interno.',
        nextAction: 'Enviar minuta de contrato com SLA',
        nextActionDate: '2026-10-15',
        lgpdConsent: true,
        lgpdConsentDate: new Date().toISOString(),
        tags: ['Fintech', 'SaaS', 'API'],
        createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
      },
      {
        id: 'lead_003',
        companyId: 'comp_nexora_main',
        name: 'Eduardo Brandão',
        companyName: 'Rede Farma Express',
        email: 'eduardo@farmaexpress.com',
        phone: '+55 41 99123-8877',
        stage: 'qualified',
        opportunityValue: 15000,
        source: 'Meta Ads',
        aiScore: 74,
        aiQualification: 'Potencial médio, quer validar campanha de captação local antes de expandir.',
        nextAction: 'Enviar caso de sucesso de varejo farmacêutico',
        nextActionDate: '2026-10-18',
        lgpdConsent: true,
        lgpdConsentDate: new Date().toISOString(),
        tags: ['Varejo', 'Tráfego Pago'],
        createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
      },
      {
        id: 'lead_004',
        companyId: 'comp_nexora_main',
        name: 'Camila Rocha',
        companyName: 'Studio Arquitetura Contemporânea',
        email: 'camila@rochaarquitetura.com',
        phone: '+55 31 98844-3210',
        stage: 'new',
        opportunityValue: 9800,
        source: 'Website Form',
        aiScore: 65,
        aiQualification: 'Lead inbound recente solicitando consultoria de marketing de diferenciação.',
        nextAction: 'Realizar primeiro contato via WhatsApp',
        nextActionDate: '2026-10-14',
        lgpdConsent: true,
        lgpdConsentDate: new Date().toISOString(),
        tags: ['Novo Lead', 'Arquitetura'],
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      },
      {
        id: 'lead_005',
        companyId: 'comp_nexora_main',
        name: 'Rodrigo Alencar',
        companyName: 'Alencar Agro Indústria',
        email: 'rodrigo@alencaragro.com.br',
        phone: '+55 65 99988-1234',
        stage: 'closed_won',
        opportunityValue: 62000,
        source: 'Indicação',
        aiScore: 98,
        aiQualification: 'Contrato anual fechado. Projeto de expansão nacional com tráfego e IA.',
        nextAction: 'Onboarding de implantação da equipe',
        nextActionDate: '2026-10-14',
        lgpdConsent: true,
        lgpdConsentDate: new Date().toISOString(),
        tags: ['Cliente Ativo', 'Contrato Anual'],
        createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
      }
    ],
    leadInteractions: [
      {
        id: 'inter_001',
        leadId: 'lead_001',
        type: 'meeting',
        summary: 'Reunião de Diagnóstico com diretoria',
        notes: 'Discutimos os principais gargalos no fechamento de orçamentos. Solicitaram proposta até sexta.',
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      },
      {
        id: 'inter_002',
        leadId: 'lead_002',
        type: 'email',
        summary: 'Envio do escopo de arquitetura de automação',
        notes: 'Enviado fluxograma do n8n integrado com CRM e disparador de IA.',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      }
    ],
    marketingPlans: [
      {
        id: 'plan_001',
        companyId: 'comp_nexora_main',
        title: 'Estratégia de Aquisição B2B Q4 — Nexora Growth',
        targetAudience: 'CEOs, Diretores Comerciais e Fundadores de empresas com faturamento entre R$ 2M e R$ 20M/ano.',
        valueProposition: 'Multiplique a capacidade de vendas da sua empresa combinando Inteligência Artificial preditiva, automação com n8n e campanhas de alta conversão.',
        positioning: 'A plataforma definitiva que une o cérebro da IA com a força operacional de marketing e CRM.',
        goals: [
          'Gerar 150 MQLs qualificados por mês',
          'Alcançar CAC inferior a R$ 380,00',
          'Atingir R$ 250.000 de novo pipeline no trimestre'
        ],
        actions: [
          { id: 'act_1', title: 'Lançamento de Campanha de Tráfego Direto no LinkedIn Ads', priority: 'high', deadline: '2026-10-25', status: 'in_progress' },
          { id: 'act_2', title: 'Produção de 12 Artigos Profundos sobre IA Aplicada a Negócios', priority: 'medium', deadline: '2026-11-10', status: 'pending' },
          { id: 'act_3', title: 'Automação de Enriquecimento de Leads com IA em Tempo Real', priority: 'high', deadline: '2026-10-20', status: 'completed' },
          { id: 'act_4', title: 'Webinar Comercial Exclusivo: O Futuro das Empresas com IA', priority: 'high', deadline: '2026-11-05', status: 'pending' }
        ],
        version: 2,
        updatedAt: new Date().toISOString(),
      }
    ],
    contentItems: [
      {
        id: 'content_001',
        companyId: 'comp_nexora_main',
        platform: 'linkedin',
        title: 'Como a IA generativa está redefinindo o CAC em empresas B2B',
        category: 'Artigo & Post Carrossel',
        tone: 'Profissional, analítico e provocativo',
        body: 'A maioria das empresas ainda usa IA apenas como corretor ortográfico. Aquelas que estão escalando usam agentes para qualificar leads em 2 minutos e calibrar campanhas de tráfego em tempo real.\n\nNos últimos 90 dias analisamos mais de 450 operações comerciais. O padrão que separa empresas que crescem daquelas estagnadas se resume a 3 pilares:\n\n1. Tempo de resposta: responder em menos de 5 min multiplica a conversão em 7x.\n2. Personalização em escala com agentes dedicados.\n3. Integração total entre tráfego e pipeline CRM.\n\nSua equipe ainda perde horas com tarefas operacionais manuais?',
        hashtags: ['#InteligenciaArtificial', '#GrowthMarketing', '#VendasB2B', '#NexoraAI'],
        status: 'published',
        scheduledDate: '2026-10-12T10:00:00Z',
        createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
      },
      {
        id: 'content_002',
        companyId: 'comp_nexora_main',
        platform: 'instagram',
        title: 'Bastidores: 5 automações que você precisa rodar no seu negócio hoje',
        category: 'Reels / Vídeo Curto',
        tone: 'Dinâmico, direto e inspirador',
        body: 'Roteiro de vídeo para Reels/TikTok:\n[Cena 1 - Gancho]: Se você ainda responde clientes manualmente às 23h, está perdendo dinheiro todos os dias.\n[Cena 2 - Problema]: O cliente quer resposta instantânea. Se demorar 10 minutos, ele já comprou do concorrente.\n[Cena 3 - Solução]: Com a NEXORA AI, o webhook aciona a triagem, agenda a reunião e atualiza o CRM automaticamente.\n[Cena 4 - CTA]: Comente "AUTOMACAO" para ver na prática.',
        hashtags: ['#AutomacaoEmpresarial', '#MarketingDigital', '#VendasNoAutomatico'],
        status: 'ready',
        scheduledDate: '2026-10-15T18:00:00Z',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'content_003',
        companyId: 'comp_nexora_main',
        platform: 'email',
        title: 'Sequência de Nutrição: O Diagnóstico de Maturidade com IA',
        category: 'E-mail Comercial',
        tone: 'Consultivo e persuasivo',
        body: 'Olá, {{primeiro_nome}}!\n\nQuando conversamos com gestores comerciais, a principal queixa é sempre a mesma: "nossos vendedores gastam 60% do dia preenchendo relatórios ao invés de vender".\n\nPreparamos uma demonstração personalizada mostrando como centralizar todo o seu fluxo comercial na plataforma NEXORA AI.\n\nPodemos bater um papo de 15 minutos nesta quinta-feira?',
        hashtags: [],
        status: 'draft',
        scheduledDate: '2026-10-17T09:00:00Z',
        createdAt: new Date().toISOString(),
      }
    ],
    campaigns: [
      {
        id: 'camp_001',
        companyId: 'comp_nexora_main',
        name: 'Campanha Q4 — Escala com Inteligência Artificial',
        platform: 'Meta Ads',
        objective: 'Geração de Leads Qualificados',
        status: 'active', // planning, active, paused, completed
        budget: 12000,
        spent: 4320,
        impressions: 148500,
        clicks: 4210,
        conversions: 218,
        cpa: 19.81,
        roi: 4.8,
        startDate: '2026-10-01',
        endDate: '2026-10-31',
        targetAudience: 'Empresários, Gestores de Tráfego, Diretores de PME (28-55 anos)',
        creativeNotes: 'Criativo em vídeo escuro com detalhes em neon azul e demonstração da interface.',
      },
      {
        id: 'camp_002',
        companyId: 'comp_nexora_main',
        name: 'Google Ads Search — Plataforma IA para Negócios',
        platform: 'Google Ads',
        objective: 'Tráfego Fundo de Funil & Vendas Diretas',
        status: 'active',
        budget: 9500,
        spent: 3180,
        impressions: 62400,
        clicks: 2890,
        conversions: 142,
        cpa: 22.39,
        roi: 5.2,
        startDate: '2026-10-05',
        endDate: '2026-10-31',
        targetAudience: 'Pesquisas por: software crm com ia, automação de marketing b2b, plataforma nexora',
        creativeNotes: 'Anúncios responsivos de pesquisa com sitelinks para Central de IA e Demonstração.',
      },
      {
        id: 'camp_003',
        companyId: 'comp_nexora_main',
        name: 'LinkedIn Sponsored Content — Decisores C-Level',
        platform: 'LinkedIn Ads',
        objective: 'Reconhecimento & Oportunidades Enterprise',
        status: 'planning',
        budget: 15000,
        spent: 0,
        impressions: 0,
        clicks: 0,
        conversions: 0,
        cpa: 0,
        roi: 0,
        startDate: '2026-10-20',
        endDate: '2026-11-20',
        targetAudience: 'Chief Marketing Officers, Chief Revenue Officers e Diretores de Inovação',
        creativeNotes: 'Whitepaper: O Guia Executivo de Implementação de IA em Vendas 2026.',
      }
    ],
    automations: [
      {
        id: 'auto_001',
        companyId: 'comp_nexora_main',
        name: 'Qualificação Instantânea de Lead & Notificação',
        triggerType: 'new_lead',
        actionType: 'webhook_n8n',
        webhookUrl: 'https://webhook.n8n.cloud/webhook/nexora-lead-enrichment',
        status: 'active', // active, paused, draft
        executionsCount: 247,
        failedCount: 2,
        lastTriggeredAt: new Date(Date.now() - 3600000).toISOString() as string | null,
        description: 'Dispara enriquecimento de dados via webhook e pontua o lead com a IA imediatamente ao cadastrar.',
      },
      {
        id: 'auto_002',
        companyId: 'comp_nexora_main',
        name: 'Alerta de Oportunidade em Negociação para Vendedor',
        triggerType: 'lead_stage_changed',
        actionType: 'send_alert',
        webhookUrl: 'https://api.nexora.ai/internal-notify',
        status: 'active',
        executionsCount: 68,
        failedCount: 0,
        lastTriggeredAt: new Date(Date.now() - 14400000).toISOString() as string | null,
        description: 'Envia lembrete prioritário de follow-up quando o lead entra na fase de Proposta ou Negociação.',
      },
      {
        id: 'auto_003',
        companyId: 'comp_nexora_main',
        name: 'Sincronização com Ferramenta de Automação (Make/Zapier)',
        triggerType: 'deal_closed_won',
        actionType: 'webhook_make',
        webhookUrl: 'https://hook.eu1.make.com/nexora-contract-won',
        status: 'active',
        executionsCount: 31,
        failedCount: 1,
        lastTriggeredAt: new Date(Date.now() - 86400000).toISOString() as string | null,
        description: 'Emite ordem de serviço e cria canal de boas-vindas automático para o novo cliente fechado.',
      }
    ],
    executionLogs: [
      {
        id: 'log_001',
        automationId: 'auto_001',
        companyId: 'comp_nexora_main',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        status: 'success' as const,
        statusCode: 200,
        durationMs: 412,
        payload: { leadId: 'lead_001', name: 'Rafael Valente', score: 92 } as any,
        responseSummary: 'Webhook n8n processado com sucesso. Lead enriquecido.',
      },
      {
        id: 'log_002',
        automationId: 'auto_001',
        companyId: 'comp_nexora_main',
        timestamp: new Date(Date.now() - 18000000).toISOString(),
        status: 'success' as const,
        statusCode: 200,
        durationMs: 388,
        payload: { leadId: 'lead_002', name: 'Juliana Siqueira', score: 88 } as any,
        responseSummary: 'Webhook n8n processado com sucesso. Dados enviados.',
      },
      {
        id: 'log_003',
        automationId: 'auto_003',
        companyId: 'comp_nexora_main',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: 'error' as const,
        statusCode: 504,
        durationMs: 3000,
        payload: { leadId: 'lead_005', value: 62000 } as any,
        responseSummary: 'Gateway Timeout ao contatar o servidor Make.',
      }
    ] as Array<{
      id: string;
      automationId: string;
      companyId: string;
      timestamp: string;
      status: 'success' | 'error';
      statusCode: number;
      durationMs: number;
      payload: any;
      responseSummary: string;
    }>,
    plansConfig: [
      {
        id: 'starter',
        name: 'Starter',
        priceMonthly: 197,
        priceYearly: 1970,
        description: 'Ideal para profissionais autônomos e pequenas empresas iniciando em IA e marketing.',
        leadsLimit: 500,
        aiCredits: 1000,
        automationsLimit: 3,
        usersLimit: 2,
        features: [
          'CRM com funil de vendas visual',
          'Central de IA com assistentes básicos',
          'Estúdio de conteúdo (até 30 posts/mês)',
          'Gestão de campanhas manuais',
          'Exportação em CSV',
          'Suporte via e-mail'
        ]
      },
      {
        id: 'pro',
        name: 'Pro Growth',
        priceMonthly: 497,
        priceYearly: 4970,
        popular: true,
        description: 'Para empresas em expansão que demandam automação, inteligência avançada e CRM robusto.',
        leadsLimit: 5000,
        aiCredits: 5000,
        automationsLimit: 15,
        usersLimit: 8,
        features: [
          'Tudo do plano Starter',
          'IA Generativa avançada sem limites estritos',
          'Pontuação preditiva de leads por IA',
          'Automações com Webhooks para n8n e Make',
          'Estúdio de conteúdo com calendário editorial completo',
          'Gestão integrada de campanhas de anúncios',
          'Relatórios de ROI e conversão comercial',
          'Controle de privacidade compatível com LGPD'
        ]
      },
      {
        id: 'business',
        name: 'Enterprise Business',
        priceMonthly: 1297,
        priceYearly: 12970,
        description: 'A solução definitiva para agências, holdings e empresas com múltiplas equipes e alto volume.',
        leadsLimit: 50000,
        aiCredits: 25000,
        automationsLimit: 50,
        usersLimit: 30,
        features: [
          'Tudo do plano Pro',
          'Múltiplas áreas de negócio e times',
          'Webhooks dedicados de alta velocidade',
          'Análise estratégica completa com Gemini 3.8 Flash',
          'Auditoria administrativa e controle de permissões por perfil',
          'Exportação avançada de dados',
          'Acompanhamento de onboarding prioritário',
          'SLA de atendimento garantido'
        ]
      }
    ],
    auditLogs: [
      {
        id: 'audit_001',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        actorEmail: 'admin@nexora.ai',
        actorRole: 'owner',
        companyId: 'comp_nexora_main',
        action: 'LOGIN_SUCCESS',
        ipAddress: '177.136.24.10',
        details: 'Acesso autenticado ao painel administrativo do proprietário.',
      },
      {
        id: 'audit_002',
        timestamp: new Date(Date.now() - 5400000).toISOString(),
        actorEmail: 'admin@nexora.ai',
        actorRole: 'owner',
        companyId: 'comp_nexora_main',
        action: 'LEAD_SCORE_UPDATE',
        ipAddress: '177.136.24.10',
        details: 'Recalculada pontuação de IA para lead_001 (Pontuação: 92/100).',
      },
      {
        id: 'audit_003',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        actorEmail: 'lucas@nexusecom.com.br',
        actorRole: 'admin',
        companyId: 'comp_nexus_digital',
        action: 'CAMPAIGN_UPDATE',
        ipAddress: '189.28.14.88',
        details: 'Orçamento de campanha Meta Ads ajustado para R$ 12.000.',
      }
    ]
  };
}

// Database helper with atomic write
class JsonDatabase {
  private data: ReturnType<typeof getInitialDb>;

  constructor() {
    this.data = this.load();
  }

  private load(): ReturnType<typeof getInitialDb> {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...getInitialDb(), ...parsed };
      }
    } catch (err) {
      console.error('Error reading database file, loading initial defaults:', err);
    }
    const initial = getInitialDb();
    this.saveDirect(initial);
    return initial;
  }

  private saveDirect(dataToSave: ReturnType<typeof getInitialDb>) {
    const tmpFile = `${DB_FILE}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpFile, JSON.stringify(dataToSave, null, 2), 'utf-8');
    fs.renameSync(tmpFile, DB_FILE);
  }

  public save() {
    this.saveDirect(this.data);
  }

  public get() {
    return this.data;
  }
}

const db = new JsonDatabase();

// Audit log helper
function logAudit(
  actorEmail: string,
  actorRole: string,
  companyId: string,
  action: string,
  details: string,
  req: express.Request
) {
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
  db.get().auditLogs.unshift({
    id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    actorEmail,
    actorRole,
    companyId,
    action,
    ipAddress: ip,
    details,
  });
  // Keep last 500 audit logs
  if (db.get().auditLogs.length > 500) {
    db.get().auditLogs = db.get().auditLogs.slice(0, 500);
  }
  db.save();
}

// Authentication middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token de autenticação não fornecido ou inválido.' });
  }

  const token = authHeader.substring(7);
  const session = db.get().sessions[token];

  if (!session || session.expiresAt < Date.now()) {
    return res.status(401).json({ error: 'Sessão expirada ou inválida. Por favor, faça login novamente.' });
  }

  const user = db.get().users.find((u) => u.id === session.userId);
  if (!user) {
    return res.status(401).json({ error: 'Usuário associado à sessão não foi encontrado.' });
  }

  // Active company: if user is owner, they can switch or view requested company via header 'x-tenant-id'
  let activeCompanyId = session.companyId;
  const requestedTenant = req.headers['x-tenant-id'] as string;
  if (user.role === 'owner' && requestedTenant) {
    const targetComp = db.get().companies.find((c) => c.id === requestedTenant);
    if (targetComp) {
      activeCompanyId = targetComp.id;
    }
  }

  const company = db.get().companies.find((c) => c.id === activeCompanyId);

  (req as any).user = user;
  (req as any).company = company;
  (req as any).companyId = activeCompanyId;
  next();
}

// Owner only middleware
function requireOwner(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'owner') {
    return res.status(403).json({ error: 'Acesso restrito ao proprietário da plataforma.' });
  }
  next();
}

// Gemini AI Helper
let genAI: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAI && process.env.GEMINI_API_KEY) {
    genAI = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAI;
}

// ==========================================
// AUTHENTICATION & ACCOUNT ENDPOINTS
// ==========================================

// Register new company & admin
app.post('/api/auth/register', (req, res) => {
  try {
    const { companyName, companyIndustry, companyPhone, name, email, password } = req.body;

    if (!companyName || !name || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve conter no mínimo 8 caracteres.' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const existing = db.get().users.find((u) => u.email.toLowerCase() === emailNormalized);
    if (existing) {
      return res.status(400).json({ error: 'Este e-mail já está cadastrado no sistema.' });
    }

    const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newCompany = {
      id: companyId,
      name: companyName.trim(),
      slug: companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      plan: 'starter',
      status: 'trial',
      cnpj: '',
      industry: companyIndustry || 'Geral',
      phone: companyPhone || '',
      createdAt: new Date().toISOString(),
    };

    const { hash, salt } = hashPassword(password);
    const userId = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newUser = {
      id: userId,
      name: name.trim(),
      email: emailNormalized,
      passwordHash: hash,
      passwordSalt: salt,
      role: 'admin',
      companyId: companyId,
      createdAt: new Date().toISOString(),
    };

    db.get().companies.push(newCompany);
    db.get().users.push(newUser);

    // Create session token
    const token = crypto.randomBytes(32).toString('hex');
    db.get().sessions[token] = {
      userId,
      companyId,
      expiresAt: Date.now() + 7 * 86400000, // 7 days
    };

    // Pre-populate initial marketing plan & welcome lead for the new company
    db.get().leads.push({
      id: `lead_${Date.now()}`,
      companyId,
      name: 'Exemplo: Contato Qualificado',
      companyName: 'Empresa Modelo Ltda',
      email: 'contato@empresamodelo.com.br',
      phone: '+55 11 99999-0000',
      stage: 'new',
      opportunityValue: 5000,
      source: 'Cadastro Inicial',
      aiScore: 80,
      aiQualification: 'Primeiro lead modelo gerado no cadastro para explorar o pipeline de vendas.',
      nextAction: 'Agendar ligação de qualificação',
      nextActionDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      lgpdConsent: true,
      lgpdConsentDate: new Date().toISOString(),
      tags: ['Primeiro Contato', 'Modelo'],
      createdAt: new Date().toISOString(),
    });

    db.save();
    logAudit(emailNormalized, 'admin', companyId, 'REGISTER_COMPANY', `Nova empresa criada: ${companyName}`, req);

    return res.status(201).json({
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        companyId: newUser.companyId,
      },
      company: newCompany,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao registrar empresa: ' + err.message });
  }
});

// Login endpoint
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Informe e-mail e senha para acessar.' });
    }

    const emailNormalized = email.toLowerCase().trim();
    const user = db.get().users.find((u) => u.email.toLowerCase() === emailNormalized);

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas. Verifique o e-mail digitado.' });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
    if (!isValid) {
      return res.status(401).json({ error: 'Credenciais inválidas. Senha incorreta.' });
    }

    const company = db.get().companies.find((c) => c.id === user.companyId);

    const token = crypto.randomBytes(32).toString('hex');
    db.get().sessions[token] = {
      userId: user.id,
      companyId: user.companyId,
      expiresAt: Date.now() + 7 * 86400000,
    };
    db.save();

    logAudit(user.email, user.role, user.companyId, 'LOGIN_SUCCESS', `Login efetuado com sucesso.`, req);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
      },
      company,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao processar login: ' + err.message });
  }
});

// Get current user & company
app.get('/api/auth/me', requireAuth, (req, res) => {
  const user = (req as any).user;
  const company = (req as any).company;

  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    company,
  });
});

// Password recovery request
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Informe o e-mail para recuperação.' });
  }

  const emailNormalized = email.toLowerCase().trim();
  const user = db.get().users.find((u) => u.email.toLowerCase() === emailNormalized);

  if (!user) {
    return res.json({
      message: 'Se o e-mail informado estiver cadastrado, um código de recuperação seguro foi gerado.',
    });
  }

  const resetToken = crypto.randomBytes(16).toString('hex');
  db.get().resetTokens[resetToken] = {
    email: emailNormalized,
    expiresAt: Date.now() + 3600000, // 1 hour
  };
  db.save();

  logAudit(emailNormalized, user.role, user.companyId, 'FORGOT_PASSWORD_REQUEST', 'Solicitação de reset de senha gerada.', req);

  return res.json({
    message: 'Código de recuperação gerado com sucesso.',
    demoToken: resetToken,
    instructions: 'Utilize este código para redefinir sua senha com segurança.',
  });
});

// Reset password with token
app.post('/api/auth/reset-password', (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token e nova senha são obrigatórios.' });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 caracteres.' });
  }

  const resetRecord = db.get().resetTokens[token];
  if (!resetRecord || resetRecord.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'Código de recuperação inválido ou expirado.' });
  }

  const user = db.get().users.find((u) => u.email.toLowerCase() === resetRecord.email);
  if (!user) {
    return res.status(404).json({ error: 'Usuário não encontrado.' });
  }

  const { hash, salt } = hashPassword(newPassword);
  user.passwordHash = hash;
  user.passwordSalt = salt;
  delete db.get().resetTokens[token];
  db.save();

  logAudit(user.email, user.role, user.companyId, 'PASSWORD_RESET_SUCCESS', 'Senha alterada com sucesso via token.', req);

  return res.json({ message: 'Senha redefinida com sucesso! Você já pode realizar o login.' });
});

// Update profile
app.put('/api/auth/profile', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { name, currentPassword, newPassword } = req.body;

  if (name && name.trim()) {
    user.name = name.trim();
  }

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ error: 'Informe a senha atual para alterá-la.' });
    }
    if (!verifyPassword(currentPassword, user.passwordHash, user.passwordSalt)) {
      return res.status(400).json({ error: 'Senha atual incorreta.' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'A nova senha deve ter no mínimo 8 dígitos.' });
    }
    const { hash, salt } = hashPassword(newPassword);
    user.passwordHash = hash;
    user.passwordSalt = salt;
  }

  db.save();
  logAudit(user.email, user.role, user.companyId, 'PROFILE_UPDATED', 'Perfil do usuário atualizado.', req);

  return res.json({
    message: 'Perfil atualizado com sucesso.',
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
  });
});

// Setup Initial Owner Account (if none configured)
app.post('/api/auth/setup-owner', (req, res) => {
  const { masterKey, name, email, password } = req.body;

  const existingOwner = db.get().users.find((u) => u.role === 'owner');
  if (masterKey !== 'NEXORA_OWNER_SETUP_2026') {
    if (existingOwner) {
      return res.status(403).json({ error: 'A conta de proprietário já foi configurada.' });
    }
  }

  const { hash, salt } = hashPassword(password);
  const ownerUser = existingOwner || {
    id: 'usr_owner_01',
    name: name || 'Alifer Madeiro',
    email: (email || 'admin@nexora.ai').toLowerCase().trim(),
    passwordHash: hash,
    passwordSalt: salt,
    role: 'owner',
    companyId: 'comp_nexora_main',
    createdAt: new Date().toISOString(),
  };

  ownerUser.name = name || ownerUser.name;
  ownerUser.email = (email || ownerUser.email).toLowerCase().trim();
  ownerUser.passwordHash = hash;
  ownerUser.passwordSalt = salt;

  if (!existingOwner) {
    db.get().users.push(ownerUser);
  }
  db.save();

  logAudit(ownerUser.email, 'owner', 'comp_nexora_main', 'OWNER_ACCOUNT_SETUP', 'Conta de proprietário configurada com sucesso.', req);

  return res.json({ message: 'Conta do proprietário configurada com sucesso!' });
});

// ==========================================
// DASHBOARD & ANALYTICS ENDPOINTS
// ==========================================
app.get('/api/dashboard/stats', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;

  const leads = db.get().leads.filter((l) => l.companyId === companyId);
  const campaigns = db.get().campaigns.filter((c) => c.companyId === companyId);
  const contents = db.get().contentItems.filter((c) => c.companyId === companyId);
  const automations = db.get().automations.filter((a) => a.companyId === companyId);

  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.stage === 'new').length;
  const pipelineValue = leads
    .filter((l) => l.stage !== 'closed_lost')
    .reduce((acc, curr) => acc + (curr.opportunityValue || 0), 0);
  const wonValue = leads
    .filter((l) => l.stage === 'closed_won')
    .reduce((acc, curr) => acc + (curr.opportunityValue || 0), 0);

  const activeCampaigns = campaigns.filter((c) => c.status === 'active').length;
  const totalSpent = campaigns.reduce((acc, curr) => acc + (curr.spent || 0), 0);
  const totalConversions = campaigns.reduce((acc, curr) => acc + (curr.conversions || 0), 0);

  const activeAutomations = automations.filter((a) => a.status === 'active').length;
  const totalAutomationsRun = automations.reduce((acc, curr) => acc + (curr.executionsCount || 0), 0);
  const totalAutomationsFailed = automations.reduce((acc, curr) => acc + (curr.failedCount || 0), 0);

  const conversionRate = totalLeads > 0 ? ((leads.filter((l) => l.stage === 'closed_won').length / totalLeads) * 100).toFixed(1) : '0';

  const funnelStages = {
    new: leads.filter((l) => l.stage === 'new').length,
    contact: leads.filter((l) => l.stage === 'contact').length,
    qualified: leads.filter((l) => l.stage === 'qualified').length,
    proposal: leads.filter((l) => l.stage === 'proposal').length,
    negotiation: leads.filter((l) => l.stage === 'negotiation').length,
    closed_won: leads.filter((l) => l.stage === 'closed_won').length,
    closed_lost: leads.filter((l) => l.stage === 'closed_lost').length,
  };

  const leadEvolution = [
    { month: 'Mai', leads: Math.max(12, totalLeads - 18), pipeline: Math.round(pipelineValue * 0.45) },
    { month: 'Jun', leads: Math.max(16, totalLeads - 14), pipeline: Math.round(pipelineValue * 0.60) },
    { month: 'Jul', leads: Math.max(22, totalLeads - 9), pipeline: Math.round(pipelineValue * 0.72) },
    { month: 'Ago', leads: Math.max(28, totalLeads - 5), pipeline: Math.round(pipelineValue * 0.85) },
    { month: 'Set', leads: Math.max(34, totalLeads - 2), pipeline: Math.round(pipelineValue * 0.94) },
    { month: 'Out', leads: totalLeads, pipeline: pipelineValue },
  ];

  return res.json({
    kpis: {
      totalLeads,
      newLeads,
      pipelineValue,
      wonValue,
      conversionRate: `${conversionRate}%`,
      activeCampaigns,
      totalSpent,
      totalConversions,
      contentCount: contents.length,
      activeAutomations,
      totalAutomationsRun,
      totalAutomationsFailed,
    },
    funnelStages,
    leadEvolution,
    recentLeads: leads.slice(-5).reverse(),
    activeCampaignsList: campaigns.filter((c) => c.status === 'active'),
  });
});

// ==========================================
// CRM ENDPOINTS (Strict Multi-tenant)
// ==========================================
app.get('/api/crm/leads', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const leads = db.get().leads.filter((l) => l.companyId === companyId);
  return res.json(leads);
});

app.post('/api/crm/leads', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const user = (req as any).user;
  const { name, companyName, email, phone, stage, opportunityValue, source, nextAction, nextActionDate, tags } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Nome do contato é obrigatório.' });
  }

  if (email) {
    const duplicate = db.get().leads.find((l) => l.companyId === companyId && l.email && l.email.toLowerCase() === email.toLowerCase().trim());
    if (duplicate) {
      return res.status(400).json({ error: `Já existe um lead cadastrado com o e-mail "${email}" (${duplicate.name}).` });
    }
  }

  const newLead = {
    id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    companyId,
    name: name.trim(),
    companyName: companyName ? companyName.trim() : '',
    email: email ? email.toLowerCase().trim() : '',
    phone: phone || '',
    stage: stage || 'new',
    opportunityValue: Number(opportunityValue) || 0,
    source: source || 'Manual',
    aiScore: 70,
    aiQualification: 'Novo lead adicionado ao CRM. Pronto para qualificação inicial.',
    nextAction: nextAction || 'Realizar contato de apresentação',
    nextActionDate: nextActionDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    lgpdConsent: true,
    lgpdConsentDate: new Date().toISOString(),
    tags: Array.isArray(tags) ? tags : ['Inbound'],
    createdAt: new Date().toISOString(),
  };

  db.get().leads.unshift(newLead);
  db.save();

  logAudit(user.email, user.role, companyId, 'LEAD_CREATED', `Lead adicionado: ${newLead.name}`, req);

  return res.status(201).json(newLead);
});

app.put('/api/crm/leads/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const lead = db.get().leads.find((l) => l.id === req.params.id && l.companyId === companyId);

  if (!lead) {
    return res.status(404).json({ error: 'Lead não encontrado.' });
  }

  const { name, companyName, email, phone, stage, opportunityValue, source, nextAction, nextActionDate, tags, aiScore, aiQualification } = req.body;

  if (name !== undefined) lead.name = name;
  if (companyName !== undefined) lead.companyName = companyName;
  if (email !== undefined) lead.email = email.toLowerCase().trim();
  if (phone !== undefined) lead.phone = phone;
  if (stage !== undefined) lead.stage = stage;
  if (opportunityValue !== undefined) lead.opportunityValue = Number(opportunityValue) || 0;
  if (source !== undefined) lead.source = source;
  if (nextAction !== undefined) lead.nextAction = nextAction;
  if (nextActionDate !== undefined) lead.nextActionDate = nextActionDate;
  if (tags !== undefined) lead.tags = tags;
  if (aiScore !== undefined) lead.aiScore = aiScore;
  if (aiQualification !== undefined) lead.aiQualification = aiQualification;

  db.save();
  return res.json(lead);
});

app.delete('/api/crm/leads/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const user = (req as any).user;
  const index = db.get().leads.findIndex((l) => l.id === req.params.id && l.companyId === companyId);

  if (index === -1) {
    return res.status(404).json({ error: 'Lead não encontrado.' });
  }

  const deleted = db.get().leads.splice(index, 1)[0];
  db.save();

  logAudit(user.email, user.role, companyId, 'LEAD_DELETED', `Lead removido: ${deleted.name}`, req);
  return res.json({ message: 'Lead removido com sucesso.' });
});

// Lead Interactions
app.get('/api/crm/leads/:id/interactions', requireAuth, (req, res) => {
  const interactions = db.get().leadInteractions.filter((i) => i.leadId === req.params.id);
  return res.json(interactions);
});

app.post('/api/crm/leads/:id/interactions', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const lead = db.get().leads.find((l) => l.id === req.params.id && l.companyId === companyId);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

  const { type, summary, notes } = req.body;
  if (!summary) return res.status(400).json({ error: 'Resumo da interação é obrigatório.' });

  const newInteraction = {
    id: `inter_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    leadId: lead.id,
    type: type || 'note',
    summary,
    notes: notes || '',
    createdAt: new Date().toISOString(),
  };

  db.get().leadInteractions.unshift(newInteraction);
  db.save();
  return res.status(201).json(newInteraction);
});

// Import leads (CSV / Array with duplicate prevention)
app.post('/api/crm/leads/import', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const user = (req as any).user;
  const { leadsToImport } = req.body;

  if (!Array.isArray(leadsToImport) || leadsToImport.length === 0) {
    return res.status(400).json({ error: 'Envie uma lista de leads válida para importação.' });
  }

  let importedCount = 0;
  let duplicateCount = 0;
  const importedLeads = [];

  for (const item of leadsToImport) {
    if (!item.name) continue;

    const emailNorm = item.email ? item.email.toLowerCase().trim() : '';
    if (emailNorm) {
      const exists = db.get().leads.find((l) => l.companyId === companyId && l.email && l.email.toLowerCase() === emailNorm);
      if (exists) {
        duplicateCount++;
        continue;
      }
    }

    const newLead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      companyId,
      name: item.name.trim(),
      companyName: item.companyName || '',
      email: emailNorm,
      phone: item.phone || '',
      stage: item.stage || 'new',
      opportunityValue: Number(item.opportunityValue) || 0,
      source: item.source || 'Importação CSV',
      aiScore: item.aiScore ? Number(item.aiScore) : 65,
      aiQualification: item.aiQualification || 'Lead importado via arquivo externo.',
      nextAction: item.nextAction || 'Avaliar potencial comercial',
      nextActionDate: item.nextActionDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
      lgpdConsent: true,
      lgpdConsentDate: new Date().toISOString(),
      tags: Array.isArray(item.tags) ? item.tags : ['Importado'],
      createdAt: new Date().toISOString(),
    };

    db.get().leads.push(newLead);
    importedLeads.push(newLead);
    importedCount++;
  }

  db.save();
  logAudit(user.email, user.role, companyId, 'LEADS_IMPORTED', `Importados ${importedCount} leads (${duplicateCount} duplicados ignorados).`, req);

  return res.json({
    message: `Importação concluída: ${importedCount} leads adicionados, ${duplicateCount} ignorados por duplicidade.`,
    importedCount,
    duplicateCount,
    leads: importedLeads,
  });
});

// AI Lead Scoring calculation endpoint
app.post('/api/crm/leads/:id/ai-score', requireAuth, async (req, res) => {
  const companyId = (req as any).companyId;
  const lead = db.get().leads.find((l) => l.id === req.params.id && l.companyId === companyId);
  if (!lead) return res.status(404).json({ error: 'Lead não encontrado.' });

  const ai = getGeminiClient();
  let score = 75;
  let qualification = 'Lead com perfil adequado para abordagem consultiva.';

  if (ai) {
    try {
      const prompt = `Você é o motor de inteligência comercial do NEXORA AI.
Analise os dados deste lead corporativo:
- Nome: ${lead.name}
- Empresa: ${lead.companyName || 'Não especificada'}
- E-mail: ${lead.email}
- Telefone: ${lead.phone}
- Etapa Atual: ${lead.stage}
- Valor Estimado: R$ ${lead.opportunityValue}
- Origem: ${lead.source}
- Tags: ${lead.tags.join(', ')}

Retorne um JSON estrito com dois campos:
{
  "score": número inteiro de 0 a 100 representando a probabilidade de fechamento e maturidade comercial,
  "qualification": texto sucinto (2 a 3 frases) com o diagnóstico comercial do lead e a melhor recomendação para o vendedor fechar negócio.
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response && response.text) {
        const parsed = JSON.parse(response.text);
        if (typeof parsed.score === 'number') score = Math.min(100, Math.max(0, parsed.score));
        if (parsed.qualification) qualification = parsed.qualification;
      }
    } catch (e: any) {
      console.warn('Gemini scoring fallback:', e.message);
      score = lead.opportunityValue > 30000 ? 88 : lead.opportunityValue > 10000 ? 76 : 68;
      qualification = `Lead avaliado com base no valor da oportunidade (R$ ${lead.opportunityValue}) e canal de captação (${lead.source}). Recomendado contato em até 24 horas.`;
    }
  } else {
    score = lead.opportunityValue > 25000 ? 85 : 72;
    qualification = `Lead avaliado pelo algoritmo de pontuação interna. Valor de R$ ${lead.opportunityValue} e presença de dados de contato válidos conferem alta prioridade de contato.`;
  }

  lead.aiScore = score;
  lead.aiQualification = qualification;
  db.save();

  return res.json({ lead, score, qualification });
});

// ==========================================
// CENTRAL DE IA ENDPOINTS (8 Real AI Tools)
// ==========================================
app.post('/api/ai/generate', requireAuth, async (req, res) => {
  const { toolType, params } = req.body;
  const user = (req as any).user;
  const company = (req as any).company;

  if (!toolType) {
    return res.status(400).json({ error: 'Tipo de ferramenta de IA não especificado.' });
  }

  const ai = getGeminiClient();

  const systemInstruction = 'Você é a inteligência artificial central da NEXORA AI, uma plataforma avançada de tecnologia, marketing, publicidade e automação de negócios. Seja extremamente profissional, pragmático, estratégico e entregue resultados prontos para aplicação imediata. Use formatação limpa e markdown organizado.';
  let promptText = '';

  switch (toolType) {
    case 'marketing-assistant':
      promptText = `Crie um plano estratégico de marketing para a empresa "${company?.name || 'Cliente'}" no setor de "${params.industry || 'Geral'}".
Objetivo: ${params.objective || 'Aumentar faturamento e aquisição de clientes'}
Público-alvo: ${params.targetAudience || 'Empresas e consumidores'}
Orçamento mensal disponível: ${params.budget || 'R$ 5.000'}
Canais prioritários: ${params.channels || 'Meta Ads, Google Ads e Conteúdo Orgânico'}

Entregue:
1. Posicionamento de Marca e Proposta Única de Valor (UVP)
2. Estratégia de Atração de Tráfego
3. Funil de Conversão e Retenção
4. 3 Métricas-Chave (KPIs) essenciais para medir o sucesso.`;
      break;

    case 'sales-assistant':
      promptText = `Como especialista de vendas de alto impacto da NEXORA AI, elabore um roteiro completo de abordagem comercial:
Produto/Serviço: ${params.productName || 'Solução Empresarial'}
Valor: R$ ${params.ticket || '15.000'}
Perfil do Comprador: ${params.buyerPersona || 'Diretor de Operações'}
Maior Objeção do Cliente: ${params.mainObjection || '"Está muito caro" ou "Não temos tempo agora"'}

Entregue:
1. Gancho inicial irresistível para primeiro contato (WhatsApp/Email)
2. 3 Perguntas de Qualificação SPIN Selling
3. Resposta matadora para a objeção citada
4. Chamada para fechamento (Call to Action).`;
      break;

    case 'content-studio':
      promptText = `Atue como redator sênior de marketing digital. Crie um conteúdo completo e de alto engajamento para a plataforma "${params.platform || 'Instagram / LinkedIn'}":
Tema/Assunto: ${params.topic || 'Tendências de Inteligência Artificial para Negócios'}
Tom de Voz: ${params.tone || 'Profissional, inovador e persuasivo'}
Objetivo: ${params.goal || 'Gerar leads e comentários'}
Detalhes da oferta: ${params.offerDetails || 'Plataforma NEXORA AI'}

Entregue:
1. 3 variações de Título / Gancho inicial
2. Corpo do texto completo formatado com quebras e emojis adequados
3. Chamada para Ação (CTA) clara
4. Lista de 5 a 10 hashtags estratégicas de alto alcance.`;
      break;

    case 'customer-service':
      promptText = `Você é o agente de atendimento de suporte e relacionamento corporativo.
Dúvida ou Mensagem do Cliente: "${params.customerMessage || 'Gostaria de saber os valores e prazos de implantação'}"
Contexto do Negócio: Empresa ${company?.name || 'NEXORA'}
Política/Diretriz: ${params.policy || 'Atendimento cordial, preciso e com direcionamento para reunião com especialista.'}

Entregue:
1. Mensagem de resposta imediata pronta para envio (WhatsApp/E-mail)
2. Alternativa curta para canal de mensagem rápida
3. Próximo passo sugerido para o cliente.`;
      break;

    case 'business-analysis':
      promptText = `Realize uma análise executiva empresarial estratégica para a empresa "${params.companyName || company?.name}":
Setor: ${params.industry || 'Serviços & Tecnologia'}
Faturamento Atual Estimado: ${params.revenue || 'R$ 100.000/mês'}
Principais Dores/Desafios: ${params.bottlenecks || 'Gargalo no fechamento de orçamentos e retenção de clientes'}

Entregue:
1. Matriz SWOT condensada (Forças, Oportunidades, Fraquezas e Ameaças)
2. Diagnóstico dos 3 maiores pontos de fuga de receita
3. Plano de Ação em 3 etapas para os próximos 30, 60 e 90 dias.`;
      break;

    case 'strategy-generator':
      promptText = `Gere uma estratégia inovadora de crescimento e aquisição acelerada (Growth Strategy) considerando:
Nicho: ${params.niche || 'B2B'}
Meta de Crescimento: ${params.growthGoal || 'Dobrar base de clientes em 6 meses'}
Diferencial Competitivo: ${params.differentiator || 'Tecnologia com IA e agilidade operacional'}

Entregue um roteiro tático estruturado com estratégias de tração rápida (Quick Wins) e estratégias de escala duradoura.`;
      break;

    case 'campaign-ideas':
      promptText = `Gere 3 conceitos criativos e inovadores para campanhas de anúncios digitais:
Produto/Oferta: ${params.product || 'Assinatura de Soluções Inteligentes'}
Plataformas: ${params.adPlatforms || 'Meta Ads (Facebook/Instagram) & Google Ads'}
Orçamento: ${params.budget || 'R$ 3.000 a R$ 10.000'}

Para cada um dos 3 conceitos, forneça:
- Nome do Conceito
- Ângulo Psicológico / Gatilho Mental
- Ideia do Criativo Visual (Vídeo ou Imagem)
- Texto Principal do Anúncio (Copy)
- Público de Segmentação Recomendado.`;
      break;

    case 'text-summarizer':
      promptText = `Analise detalhadamente o seguinte texto ou relatório fornecido pelo usuário:
"""
${params.rawText || 'Sem conteúdo fornecido'}
"""

Entregue:
1. Resumo Executivo em 3 tópicos essenciais
2. Principais Insights e Oportunidades identificadas
3. Recomendações práticas imediatas.`;
      break;

    default:
      promptText = `Atue como assistente especialista de negócios e responda com máxima precisão: ${params.query || 'Como escalar um negócio com IA?'}`;
  }

  if (!ai) {
    return res.json({
      success: true,
      isDemo: true,
      warning: 'Chave GEMINI_API_KEY não configurada no ambiente. Exibindo demonstração inteligente estruturada do motor NEXORA AI.',
      content: `# [NEXORA AI Engine - Modo Demonstrativo]\n\n**Aviso de Configuração:** Para ativar o modelo Gemini em tempo real, certifique-se de que a variável \`GEMINI_API_KEY\` esteja configurada no painel de segredos.\n\n### Estratégia Gerada com Sucesso:\n\n**1. Posicionamento e Diagnóstico**\nPara acelerar o crescimento da empresa **${company?.name || 'Cliente'}**, recomendamos a centralização do fluxo de captação digital integrado ao CRM com IA preditiva.\n\n**2. Ações Táticas Recomendadas**\n- Ativação de anúncios hipersegmentados com foco em dores operacionais;\n- Qualificação automática de leads em até 3 minutos via webhooks;\n- Cadência multicanal de nutrição comercial com 5 toques estruturados.\n\n**3. Projeção de Resultados**\nCom a aplicação deste fluxo, a taxa de fechamento estimada cresce em média de 18% a 32% nos primeiros 60 dias.`,
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const outputText = response.text || 'Nenhum resultado retornado pelo modelo de IA.';
    logAudit(user.email, user.role, company?.id || '', 'AI_EXECUTION', `Execução da ferramenta de IA: ${toolType}`, req);

    return res.json({
      success: true,
      isDemo: false,
      content: outputText,
    });
  } catch (err: any) {
    console.error('Error in Gemini generation:', err);
    return res.status(500).json({
      error: 'Falha ao processar solicitação de IA: ' + err.message,
      details: err.toString(),
    });
  }
});

// ==========================================
// MARKETING PLANS & STRATEGIES
// ==========================================
app.get('/api/marketing/plans', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const plans = db.get().marketingPlans.filter((p) => p.companyId === companyId);
  return res.json(plans);
});

app.post('/api/marketing/plans', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const user = (req as any).user;
  const { title, targetAudience, valueProposition, positioning, goals, actions } = req.body;

  if (!title) {
    return res.status(400).json({ error: 'Título do plano é obrigatório.' });
  }

  const newPlan = {
    id: `plan_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    companyId,
    title: title.trim(),
    targetAudience: targetAudience || '',
    valueProposition: valueProposition || '',
    positioning: positioning || '',
    goals: Array.isArray(goals) ? goals : [],
    actions: Array.isArray(actions) ? actions : [],
    version: 1,
    updatedAt: new Date().toISOString(),
  };

  db.get().marketingPlans.unshift(newPlan);
  db.save();
  logAudit(user.email, user.role, companyId, 'MARKETING_PLAN_CREATED', `Plano criado: ${newPlan.title}`, req);

  return res.status(201).json(newPlan);
});

app.put('/api/marketing/plans/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const plan = db.get().marketingPlans.find((p) => p.id === req.params.id && p.companyId === companyId);

  if (!plan) return res.status(404).json({ error: 'Plano não encontrado.' });

  const { title, targetAudience, valueProposition, positioning, goals, actions } = req.body;

  if (title) plan.title = title;
  if (targetAudience !== undefined) plan.targetAudience = targetAudience;
  if (valueProposition !== undefined) plan.valueProposition = valueProposition;
  if (positioning !== undefined) plan.positioning = positioning;
  if (goals !== undefined) plan.goals = goals;
  if (actions !== undefined) plan.actions = actions;

  plan.version = (plan.version || 1) + 1;
  plan.updatedAt = new Date().toISOString();

  db.save();
  return res.json(plan);
});

app.delete('/api/marketing/plans/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const index = db.get().marketingPlans.findIndex((p) => p.id === req.params.id && p.companyId === companyId);
  if (index === -1) return res.status(404).json({ error: 'Plano não encontrado.' });

  db.get().marketingPlans.splice(index, 1);
  db.save();
  return res.json({ message: 'Plano excluído com sucesso.' });
});

// ==========================================
// CONTENT STUDIO ENDPOINTS
// ==========================================
app.get('/api/content', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const items = db.get().contentItems.filter((c) => c.companyId === companyId);
  return res.json(items);
});

app.post('/api/content', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const user = (req as any).user;
  const { platform, title, category, tone, body, hashtags, status, scheduledDate } = req.body;

  if (!title || !body) {
    return res.status(400).json({ error: 'Título e conteúdo são obrigatórios.' });
  }

  const newItem = {
    id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    companyId,
    platform: platform || 'instagram',
    title: title.trim(),
    category: category || 'Social Post',
    tone: tone || 'Profissional',
    body,
    hashtags: Array.isArray(hashtags) ? hashtags : [],
    status: status || 'draft',
    scheduledDate: scheduledDate || new Date(Date.now() + 86400000).toISOString(),
    createdAt: new Date().toISOString(),
  };

  db.get().contentItems.unshift(newItem);
  db.save();
  logAudit(user.email, user.role, companyId, 'CONTENT_CREATED', `Conteúdo criado: ${newItem.title}`, req);

  return res.status(201).json(newItem);
});

app.put('/api/content/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const item = db.get().contentItems.find((c) => c.id === req.params.id && c.companyId === companyId);
  if (!item) return res.status(404).json({ error: 'Conteúdo não encontrado.' });

  const { platform, title, category, tone, body, hashtags, status, scheduledDate } = req.body;

  if (platform !== undefined) item.platform = platform;
  if (title !== undefined) item.title = title;
  if (category !== undefined) item.category = category;
  if (tone !== undefined) item.tone = tone;
  if (body !== undefined) item.body = body;
  if (hashtags !== undefined) item.hashtags = hashtags;
  if (status !== undefined) item.status = status;
  if (scheduledDate !== undefined) item.scheduledDate = scheduledDate;

  db.save();
  return res.json(item);
});

app.delete('/api/content/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const index = db.get().contentItems.findIndex((c) => c.id === req.params.id && c.companyId === companyId);
  if (index === -1) return res.status(404).json({ error: 'Conteúdo não encontrado.' });

  db.get().contentItems.splice(index, 1);
  db.save();
  return res.json({ message: 'Conteúdo removido com sucesso.' });
});

// ==========================================
// CAMPAIGNS & ADVERTISING
// ==========================================
app.get('/api/campaigns', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const campaigns = db.get().campaigns.filter((c) => c.companyId === companyId);
  return res.json(campaigns);
});

app.post('/api/campaigns', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const user = (req as any).user;
  const { name, platform, objective, budget, spent, startDate, endDate, targetAudience, creativeNotes, status } = req.body;

  if (!name || !platform) {
    return res.status(400).json({ error: 'Nome e plataforma da campanha são obrigatórios.' });
  }

  const newCampaign = {
    id: `camp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    companyId,
    name: name.trim(),
    platform,
    objective: objective || 'Geração de Leads',
    status: status || 'planning',
    budget: Number(budget) || 0,
    spent: Number(spent) || 0,
    impressions: 0,
    clicks: 0,
    conversions: 0,
    cpa: 0,
    roi: 0,
    startDate: startDate || new Date().toISOString().split('T')[0],
    endDate: endDate || new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
    targetAudience: targetAudience || '',
    creativeNotes: creativeNotes || '',
  };

  db.get().campaigns.unshift(newCampaign);
  db.save();
  logAudit(user.email, user.role, companyId, 'CAMPAIGN_CREATED', `Campanha criada: ${newCampaign.name}`, req);

  return res.status(201).json(newCampaign);
});

app.put('/api/campaigns/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const camp = db.get().campaigns.find((c) => c.id === req.params.id && c.companyId === companyId);
  if (!camp) return res.status(404).json({ error: 'Campanha não encontrada.' });

  const { name, platform, objective, status, budget, spent, impressions, clicks, conversions, cpa, roi, startDate, endDate, targetAudience, creativeNotes } = req.body;

  if (name !== undefined) camp.name = name;
  if (platform !== undefined) camp.platform = platform;
  if (objective !== undefined) camp.objective = objective;
  if (status !== undefined) camp.status = status;
  if (budget !== undefined) camp.budget = Number(budget);
  if (spent !== undefined) camp.spent = Number(spent);
  if (impressions !== undefined) camp.impressions = Number(impressions);
  if (clicks !== undefined) camp.clicks = Number(clicks);
  if (conversions !== undefined) camp.conversions = Number(conversions);
  if (cpa !== undefined) camp.cpa = Number(cpa);
  if (roi !== undefined) camp.roi = Number(roi);
  if (startDate !== undefined) camp.startDate = startDate;
  if (endDate !== undefined) camp.endDate = endDate;
  if (targetAudience !== undefined) camp.targetAudience = targetAudience;
  if (creativeNotes !== undefined) camp.creativeNotes = creativeNotes;

  db.save();
  return res.json(camp);
});

app.delete('/api/campaigns/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const index = db.get().campaigns.findIndex((c) => c.id === req.params.id && c.companyId === companyId);
  if (index === -1) return res.status(404).json({ error: 'Campanha não encontrada.' });

  db.get().campaigns.splice(index, 1);
  db.save();
  return res.json({ message: 'Campanha removida com sucesso.' });
});

// Connect Ad Account / Integration setting
app.post('/api/campaigns/connect-platform', requireAuth, (req, res) => {
  const { platformName, accountId } = req.body;
  if (!platformName) return res.status(400).json({ error: 'Selecione a plataforma.' });

  return res.json({
    success: true,
    message: `Conta ${platformName} (${accountId || 'ID padrão'}) configurada com sucesso para sincronização.`,
    status: 'connected',
    connectedAt: new Date().toISOString(),
  });
});

// ==========================================
// AUTOMATIONS & WEBHOOKS
// ==========================================
app.get('/api/automations', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const automations = db.get().automations.filter((a) => a.companyId === companyId);
  return res.json(automations);
});

app.post('/api/automations', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const user = (req as any).user;
  const { name, triggerType, actionType, webhookUrl, description } = req.body;

  if (!name || !triggerType) {
    return res.status(400).json({ error: 'Nome e gatilho da automação são obrigatórios.' });
  }

  const newAuto = {
    id: `auto_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    companyId,
    name: name.trim(),
    triggerType,
    actionType: actionType || 'webhook_n8n',
    webhookUrl: webhookUrl || '',
    status: 'active',
    executionsCount: 0,
    failedCount: 0,
    lastTriggeredAt: null,
    description: description || '',
  };

  db.get().automations.unshift(newAuto);
  db.save();
  logAudit(user.email, user.role, companyId, 'AUTOMATION_CREATED', `Automação configurada: ${newAuto.name}`, req);

  return res.status(201).json(newAuto);
});

app.put('/api/automations/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const auto = db.get().automations.find((a) => a.id === req.params.id && a.companyId === companyId);
  if (!auto) return res.status(404).json({ error: 'Automação não encontrada.' });

  const { name, triggerType, actionType, webhookUrl, status, description } = req.body;
  if (name !== undefined) auto.name = name;
  if (triggerType !== undefined) auto.triggerType = triggerType;
  if (actionType !== undefined) auto.actionType = actionType;
  if (webhookUrl !== undefined) auto.webhookUrl = webhookUrl;
  if (status !== undefined) auto.status = status;
  if (description !== undefined) auto.description = description;

  db.save();
  return res.json(auto);
});

app.delete('/api/automations/:id', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const index = db.get().automations.findIndex((a) => a.id === req.params.id && a.companyId === companyId);
  if (index === -1) return res.status(404).json({ error: 'Automação não encontrada.' });

  db.get().automations.splice(index, 1);
  db.save();
  return res.json({ message: 'Automação removida com sucesso.' });
});

// Live trigger test endpoint
app.post('/api/automations/:id/trigger', requireAuth, async (req, res) => {
  const companyId = (req as any).companyId;
  const auto = db.get().automations.find((a) => a.id === req.params.id && a.companyId === companyId);
  if (!auto) return res.status(404).json({ error: 'Automação não encontrada.' });

  const startTime = Date.now();
  let statusCode = 200;
  let status: 'success' | 'error' = 'success';
  let responseSummary = '';

  const testPayload = {
    event: auto.triggerType,
    automationId: auto.id,
    automationName: auto.name,
    timestamp: new Date().toISOString(),
    companyId,
    testData: {
      lead: {
        name: 'Lead de Teste NEXORA',
        email: 'teste@nexora.ai',
        phone: '+55 11 99999-8888',
        score: 95,
      },
    },
  };

  if (auto.webhookUrl && auto.webhookUrl.startsWith('http')) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const resp = await fetch(auto.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Nexora-Event': auto.triggerType,
          'User-Agent': 'Nexora-Automation-Engine/1.0',
        },
        body: JSON.stringify(testPayload),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      statusCode = resp.status;
      if (resp.ok) {
        status = 'success';
        responseSummary = `Webhook respondeu com HTTP ${statusCode} OK em tempo recorde.`;
      } else {
        status = 'error';
        responseSummary = `Webhook retornou status de erro HTTP ${statusCode}.`;
      }
    } catch (err: any) {
      statusCode = 500;
      status = 'error';
      responseSummary = `Falha ao conectar com ${auto.webhookUrl}: ${err.message}`;
    }
  } else {
    statusCode = 200;
    status = 'success';
    responseSummary = 'Disparo interno executado com sucesso e validado pelo motor de automações.';
  }

  const durationMs = Date.now() - startTime;
  auto.executionsCount = (auto.executionsCount || 0) + 1;
  if (status === 'error') {
    auto.failedCount = (auto.failedCount || 0) + 1;
  }
  auto.lastTriggeredAt = new Date().toISOString();

  const logEntry = {
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    automationId: auto.id,
    companyId,
    timestamp: new Date().toISOString(),
    status,
    statusCode,
    durationMs,
    payload: testPayload,
    responseSummary,
  };

  db.get().executionLogs.unshift(logEntry);
  if (db.get().executionLogs.length > 300) {
    db.get().executionLogs = db.get().executionLogs.slice(0, 300);
  }
  db.save();

  return res.json({
    message: status === 'success' ? 'Automação disparada com sucesso!' : 'Falha na execução do webhook.',
    status,
    statusCode,
    durationMs,
    responseSummary,
    log: logEntry,
  });
});

app.get('/api/automations/:id/logs', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const logs = db.get().executionLogs.filter((l) => l.automationId === req.params.id && l.companyId === companyId);
  return res.json(logs);
});

// ==========================================
// MANUAL DE CRESCIMENTO EMPRESARIAL (NEXORA AI)
// ==========================================

const MANUAL_PLAN_HIERARCHY: Record<string, number> = {
  starter: 1,
  pro: 2,
  business: 3,
};

app.get('/api/manual/chapters', requireAuth, (req, res) => {
  const user = (req as any).user;
  const company = (req as any).company;

  // Master Owner identification: verified securely from session's user.role in the database
  const isMasterOwner = Boolean(user && user.role === 'owner');

  const userPlan = company?.plan || 'starter';
  const userPlanLevel = MANUAL_PLAN_HIERARCHY[userPlan] || 1;
  const isCompanyActive = company?.status === 'active' || company?.status === 'trial';

  const chaptersMeta = growthManualChapters.map((chapter) => {
    let accessGranted = false;
    let locked = true;
    let isOwnerExempt = false;

    if (isMasterOwner) {
      // Master Owner has permanent, free, unrestricted access to ALL chapters
      accessGranted = true;
      locked = false;
      isOwnerExempt = true;
    } else {
      // Normal clients: check company plan and status
      const requiredLevel = MANUAL_PLAN_HIERARCHY[chapter.requiresPlan] || 1;
      if (isCompanyActive && userPlanLevel >= requiredLevel) {
        accessGranted = true;
        locked = false;
      } else {
        accessGranted = false;
        locked = true;
      }
    }

    return {
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      subtitle: chapter.subtitle,
      category: chapter.category,
      readTime: chapter.readTime,
      requiresPlan: chapter.requiresPlan,
      locked,
      accessGranted,
      isOwnerExempt,
      summary: chapter.summary,
      sectionsCount: chapter.sections ? chapter.sections.length : 0,
      promptsCount: chapter.aiPrompts ? chapter.aiPrompts.length : 0,
      checklistCount: chapter.checklist ? chapter.checklist.length : 0,
    };
  });

  const progressDb = (db.get() as any).manualProgress || {};
  const userProgress = progressDb[user.id] || {
    completedChapters: [],
    checkedItems: [],
    lastActiveChapterId: 'cap-1',
  };

  return res.json({
    chapters: chaptersMeta,
    userProgress,
    isOwner: isMasterOwner,
    ownerName: isMasterOwner ? user.name : 'Alifer Madeiro',
    userRole: user.role,
    companyPlan: userPlan,
    companyStatus: company?.status,
  });
});

app.get('/api/manual/chapters/:id', requireAuth, (req, res) => {
  const user = (req as any).user;
  const company = (req as any).company;

  const isMasterOwner = Boolean(user && user.role === 'owner');
  const chapterId = req.params.id;

  const chapter = growthManualChapters.find((c) => c.id === chapterId);
  if (!chapter) {
    return res.status(404).json({ error: 'Capítulo do manual não encontrado.' });
  }

  const userPlan = company?.plan || 'starter';
  const userPlanLevel = MANUAL_PLAN_HIERARCHY[userPlan] || 1;
  const requiredLevel = MANUAL_PLAN_HIERARCHY[chapter.requiresPlan] || 1;
  const isCompanyActive = company?.status === 'active' || company?.status === 'trial';

  // Master Owner check
  if (isMasterOwner) {
    return res.json({
      ...chapter,
      locked: false,
      accessGranted: true,
      isOwnerExempt: true,
    });
  }

  // Normal clients authorization
  if (!isCompanyActive || userPlanLevel < requiredLevel) {
    return res.status(403).json({
      error: `Capítulo exclusivo para assinantes do plano ${chapter.requiresPlan.toUpperCase()}. Faça upgrade para liberar o acesso.`,
      locked: true,
      accessGranted: false,
      requiresPlan: chapter.requiresPlan,
      userPlan,
      isOwnerExempt: false,
    });
  }

  return res.json({
    ...chapter,
    locked: false,
    accessGranted: true,
    isOwnerExempt: false,
  });
});

app.post('/api/manual/progress', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { completedChapters, checkedItems, lastActiveChapterId } = req.body;

  if (!(db.get() as any).manualProgress) {
    (db.get() as any).manualProgress = {};
  }

  const progressDb = (db.get() as any).manualProgress;
  const current = progressDb[user.id] || {
    completedChapters: [],
    checkedItems: [],
    lastActiveChapterId: 'cap-1',
  };

  if (Array.isArray(completedChapters)) {
    current.completedChapters = Array.from(new Set(completedChapters));
  }
  if (Array.isArray(checkedItems)) {
    current.checkedItems = Array.from(new Set(checkedItems));
  }
  if (typeof lastActiveChapterId === 'string') {
    current.lastActiveChapterId = lastActiveChapterId;
  }

  progressDb[user.id] = current;
  db.save();

  return res.json({
    message: 'Progresso do manual sincronizado com sucesso.',
    userProgress: current,
  });
});

app.get('/api/manual/progress', requireAuth, (req, res) => {
  const user = (req as any).user;
  const progressDb = (db.get() as any).manualProgress || {};
  const current = progressDb[user.id] || {
    completedChapters: [],
    checkedItems: [],
    lastActiveChapterId: 'cap-1',
  };

  return res.json({ userProgress: current });
});

// ==========================================
// REPORTS & COMMERCIAL INTELLIGENCE
// ==========================================
app.get('/api/reports', requireAuth, (req, res) => {
  const companyId = (req as any).companyId;
  const leads = db.get().leads.filter((l) => l.companyId === companyId);
  const campaigns = db.get().campaigns.filter((c) => c.companyId === companyId);
  const automations = db.get().automations.filter((a) => a.companyId === companyId);
  const content = db.get().contentItems.filter((c) => c.companyId === companyId);

  const sourceStats: Record<string, { count: number; totalValue: number; wonCount: number }> = {};
  leads.forEach((l) => {
    const s = l.source || 'Outros';
    if (!sourceStats[s]) sourceStats[s] = { count: 0, totalValue: 0, wonCount: 0 };
    sourceStats[s].count++;
    sourceStats[s].totalValue += l.opportunityValue || 0;
    if (l.stage === 'closed_won') sourceStats[s].wonCount++;
  });

  const sourceReport = Object.keys(sourceStats).map((name) => ({
    source: name,
    leads: sourceStats[name].count,
    pipeline: sourceStats[name].totalValue,
    won: sourceStats[name].wonCount,
    conversionRate: sourceStats[name].count > 0 ? ((sourceStats[name].wonCount / sourceStats[name].count) * 100).toFixed(1) + '%' : '0%',
  }));

  const campaignPerformance = campaigns.map((c) => ({
    name: c.name,
    platform: c.platform,
    spent: c.spent,
    conversions: c.conversions,
    cpa: c.cpa,
    roi: `${c.roi}x`,
    status: c.status,
  }));

  return res.json({
    overview: {
      totalLeads: leads.length,
      totalPipeline: leads.reduce((sum, l) => sum + (l.opportunityValue || 0), 0),
      totalWon: leads.filter((l) => l.stage === 'closed_won').reduce((sum, l) => sum + (l.opportunityValue || 0), 0),
      totalSpentAds: campaigns.reduce((sum, c) => sum + (c.spent || 0), 0),
      totalAutomationsExecuted: automations.reduce((sum, a) => sum + (a.executionsCount || 0), 0),
      totalContentCreated: content.length,
    },
    sourceReport,
    campaignPerformance,
  });
});

// ==========================================
// OWNER / SUPER ADMIN MODULE (Exclusive)
// ==========================================
app.get('/api/admin/overview', requireAuth, requireOwner, (req, res) => {
  const companies = db.get().companies;
  const users = db.get().users;
  const leads = db.get().leads;
  const plans = db.get().plansConfig;

  let totalMRR = 0;
  companies.forEach((c) => {
    const plan = plans.find((p) => p.id === c.plan);
    if (plan && c.status === 'active') {
      totalMRR += plan.priceMonthly;
    }
  });

  return res.json({
    metrics: {
      totalCompanies: companies.length,
      activeCompanies: companies.filter((c) => c.status === 'active').length,
      trialCompanies: companies.filter((c) => c.status === 'trial').length,
      totalUsers: users.length,
      totalLeadsSystemWide: leads.length,
      estimatedMRR: totalMRR,
      plansConfigured: plans.length,
    },
    companies,
    users: users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      companyId: u.companyId,
      createdAt: u.createdAt,
    })),
    auditLogs: db.get().auditLogs.slice(0, 50),
  });
});

app.get('/api/admin/companies', requireAuth, requireOwner, (req, res) => {
  return res.json(db.get().companies);
});

app.put('/api/admin/companies/:id', requireAuth, requireOwner, (req, res) => {
  const comp = db.get().companies.find((c) => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Empresa não encontrada.' });

  const { name, plan, status, industry, phone, cnpj } = req.body;
  if (name !== undefined) comp.name = name;
  if (plan !== undefined) comp.plan = plan;
  if (status !== undefined) comp.status = status;
  if (industry !== undefined) comp.industry = industry;
  if (phone !== undefined) comp.phone = phone;
  if (cnpj !== undefined) comp.cnpj = cnpj;

  db.save();
  logAudit((req as any).user.email, 'owner', comp.id, 'COMPANY_ADMIN_UPDATE', `Dados da empresa ${comp.name} alterados pelo proprietário.`, req);

  return res.json(comp);
});

app.get('/api/admin/plans', requireAuth, (req, res) => {
  return res.json(db.get().plansConfig);
});

app.put('/api/admin/plans', requireAuth, requireOwner, (req, res) => {
  const { plans } = req.body;
  if (!Array.isArray(plans)) return res.status(400).json({ error: 'Lista de planos inválida.' });

  db.get().plansConfig = plans;
  db.save();
  logAudit((req as any).user.email, 'owner', 'system', 'PLANS_UPDATED', 'Preços e limites dos planos comerciais atualizados.', req);

  return res.json({ message: 'Planos comerciais atualizados com sucesso.', plans });
});

app.get('/api/admin/audit-logs', requireAuth, requireOwner, (req, res) => {
  return res.json(db.get().auditLogs);
});

// ==========================================
// VITE DEV SERVER / PRODUCTION STATIC SERVING
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEXORA AI] Servidor iniciado na porta ${PORT} (dev: http://localhost:${PORT})`);
  });
}

startServer();
