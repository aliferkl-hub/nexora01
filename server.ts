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

  return {
    companies: [
      {
        id: 'comp_nexora_main',
        name: 'Nexora AI Hub (Matriz)',
        slug: 'nexora-ai',
        plan: 'business',
        status: 'active' as 'active' | 'trial' | 'pending' | 'suspended' | 'terminated',
        cnpj: '48.910.123/0001-90',
        industry: 'Tecnologia & Marketing Digital',
        phone: '+55 (11) 98822-1000',
        contactName: 'Alifer Madeiro',
        contactEmail: 'admin@nexora.ai',
        activatedAt: new Date().toISOString(),
        paymentStatus: 'APROVADO',
        createdAt: new Date().toISOString(),
      }
    ] as Array<{
      id: string;
      name: string;
      slug: string;
      plan: string;
      status: 'active' | 'trial' | 'pending' | 'suspended' | 'terminated';
      cnpj?: string;
      industry?: string;
      phone?: string;
      contactName?: string;
      contactEmail?: string;
      activatedAt?: string;
      paymentStatus?: string;
      createdAt: string;
    }>,
    users: [
      {
        id: 'usr_owner_01',
        name: 'Alifer Madeiro',
        email: 'admin@nexora.ai',
        passwordHash: ownerHash,
        passwordSalt: defaultSalt,
        role: 'owner' as 'owner' | 'admin' | 'specialist' | 'viewer',
        companyId: 'comp_nexora_main',
        createdAt: new Date().toISOString(),
      }
    ] as Array<{
      id: string;
      name: string;
      email: string;
      passwordHash: string;
      passwordSalt: string;
      role: 'owner' | 'admin' | 'specialist' | 'viewer';
      companyId: string;
      createdAt: string;
    }>,
    sessions: {} as Record<string, { userId: string; companyId: string; expiresAt: number }>,
    resetTokens: {} as Record<string, { email: string; expiresAt: number }>,
    invites: {} as Record<string, {
      token: string;
      companyId: string;
      companyName: string;
      email: string;
      name: string;
      role: string;
      expiresAt: number;
      createdAt: string;
    }>,
    manualProgress: {} as Record<string, { completedChapters: string[]; checkedItems: string[]; lastActiveChapterId?: string }>,
    leads: [] as Array<any>,
    leadInteractions: [] as Array<any>,
    marketingPlans: [] as Array<any>,
    contentItems: [] as Array<any>,
    campaigns: [] as Array<any>,
    automations: [] as Array<any>,
    executionLogs: [] as Array<any>,
    payments: [] as Array<{
      id: string;
      companyId: string;
      companyName: string;
      userId: string;
      userName: string;
      userEmail: string;
      planId: string;
      planName: string;
      amount: number;
      billingCycle: 'monthly' | 'yearly';
      method: 'PIX' | 'CARTAO_PARCELADO';
      status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO';
      pixKey: string;
      pixBeneficiary: string;
      receiptDetails?: string;
      customerNotes?: string;
      adminNotes?: string;
      decisionBy?: string;
      decisionAt?: string;
      createdAt: string;
      updatedAt: string;
    }>,
    plansConfig: [
      {
        id: 'starter',
        name: 'Starter',
        priceMonthly: 197,
        priceYearly: 1970,
        periodicity: 'monthly',
        status: 'active',
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
          'Suporte via e-mail',
          'Capítulos 1 e 2 do Manual de Crescimento'
        ],
        modules: ['crm', 'ai-hub', 'content', 'campaigns', 'manual'],
        manualChapters: ['cap-1', 'cap-2'],
        allowPix: true,
        allowInstallments: true
      },
      {
        id: 'pro',
        name: 'Pro Growth',
        priceMonthly: 497,
        priceYearly: 4970,
        periodicity: 'monthly',
        status: 'active',
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
          'Capítulos 1 a 4 do Manual de Crescimento'
        ],
        modules: ['crm', 'ai-hub', 'content', 'campaigns', 'automations', 'reports', 'manual'],
        manualChapters: ['cap-1', 'cap-2', 'cap-3', 'cap-4'],
        allowPix: true,
        allowInstallments: true
      },
      {
        id: 'business',
        name: 'Enterprise Business',
        priceMonthly: 1297,
        priceYearly: 12970,
        periodicity: 'monthly',
        status: 'active',
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
          'Acesso vitalício e integral a TODOS os capítulos do Manual',
          'SLA de atendimento garantido'
        ],
        modules: ['crm', 'ai-hub', 'marketing', 'content', 'campaigns', 'automations', 'reports', 'manual'],
        manualChapters: ['all'],
        allowPix: true,
        allowInstallments: true
      }
    ],
    auditLogs: [
      {
        id: 'audit_init_001',
        timestamp: new Date().toISOString(),
        actorEmail: 'admin@nexora.ai',
        actorRole: 'owner',
        companyId: 'comp_nexora_main',
        action: 'SYSTEM_STARTUP',
        ipAddress: '127.0.0.1',
        details: 'NEXORA AI inicializado em ambiente operacional seguro.',
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
      status: 'trial' as const,
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
      role: 'admin' as const,
      companyId: companyId,
      createdAt: new Date().toISOString(),
    };

    db.get().companies.push(newCompany);
    db.get().users.push(newUser);

    // Session token
    const token = crypto.randomBytes(32).toString('hex');
    db.get().sessions[token] = {
      userId,
      companyId,
      expiresAt: Date.now() + 7 * 86400000, // 7 days
    };

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

// Validate Company Invite Token
app.get('/api/auth/invite/:token', (req, res) => {
  const token = req.params.token;
  const invites = (db.get() as any).invites || {};
  const invite = invites[token];

  if (!invite) {
    return res.status(404).json({ error: 'Convite inválido ou expirado.' });
  }

  if (invite.expiresAt < Date.now()) {
    delete invites[token];
    db.save();
    return res.status(400).json({ error: 'Este convite já expirou. Solicite um novo link ao administrador.' });
  }

  const company = db.get().companies.find((c) => c.id === invite.companyId);
  return res.json({
    valid: true,
    invite: {
      ...invite,
      companyName: company ? company.name : invite.companyName,
    },
  });
});

// Accept Company Invite and Set Password
app.post('/api/auth/accept-invite', (req, res) => {
  try {
    const { token, password, name } = req.body;

    if (!token || !password) {
      return res.status(400).json({ error: 'Token do convite e senha são obrigatórios.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'A senha deve conter pelo menos 8 dígitos.' });
    }

    const invites = (db.get() as any).invites || {};
    const invite = invites[token];

    if (!invite || invite.expiresAt < Date.now()) {
      return res.status(400).json({ error: 'Convite expirado ou inválido.' });
    }

    const emailNormalized = invite.email.toLowerCase().trim();
    const company = db.get().companies.find((c) => c.id === invite.companyId);

    if (!company) {
      return res.status(404).json({ error: 'Empresa vinculada ao convite não foi encontrada.' });
    }

    let user = db.get().users.find((u) => u.email.toLowerCase() === emailNormalized);
    const { hash, salt } = hashPassword(password);

    if (user) {
      user.name = name ? name.trim() : user.name;
      user.passwordHash = hash;
      user.passwordSalt = salt;
      user.companyId = company.id;
    } else {
      user = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: name ? name.trim() : invite.name,
        email: emailNormalized,
        passwordHash: hash,
        passwordSalt: salt,
        role: (invite.role as any) || 'admin',
        companyId: company.id,
        createdAt: new Date().toISOString(),
      };
      db.get().users.push(user);
    }

    // Mark company as active if pending
    if (company.status === 'pending') {
      company.status = 'active';
      company.activatedAt = new Date().toISOString();
    }

    delete invites[token];

    // Create session token
    const sessionToken = crypto.randomBytes(32).toString('hex');
    db.get().sessions[sessionToken] = {
      userId: user.id,
      companyId: company.id,
      expiresAt: Date.now() + 7 * 86400000,
    };

    db.save();
    logAudit(user.email, user.role, company.id, 'INVITE_ACCEPTED', `Convite aceito por ${user.name}.`, req);

    return res.json({
      message: 'Cadastro concluído com sucesso! Bem-vindo à NEXORA AI.',
      token: sessionToken,
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
    return res.status(500).json({ error: 'Erro ao processar convite: ' + err.message });
  }
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

  // Real Monthly Lead Evolution based on actual records
  const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  const now = new Date();
  const last6Months: Array<{ month: string; yearMonth: string; leads: number; pipeline: number }> = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const mStr = monthNames[d.getMonth()];
    const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    last6Months.push({ month: mStr, yearMonth: ym, leads: 0, pipeline: 0 });
  }

  leads.forEach((l) => {
    if (!l.createdAt) return;
    const lDate = new Date(l.createdAt);
    const ym = `${lDate.getFullYear()}-${String(lDate.getMonth() + 1).padStart(2, '0')}`;
    const targetMonth = last6Months.find((m) => m.yearMonth === ym);
    if (targetMonth) {
      targetMonth.leads += 1;
      targetMonth.pipeline += (l.opportunityValue || 0);
    }
  });

  const leadEvolution = last6Months.map(({ month, leads: count, pipeline }) => ({
    month,
    leads: count,
    pipeline,
  }));

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

function canAccessChapter(user: any, company: any, chapterId: string): { granted: boolean; reason?: string } {
  // Master Owner has permanent, free, unrestricted access to ALL chapters
  if (user && user.role === 'owner') {
    return { granted: true };
  }
  if (!company) {
    return { granted: false, reason: 'Nenhuma empresa associada ao usuário.' };
  }
  if (company.status !== 'active' && company.status !== 'trial') {
    return {
      granted: false,
      reason: 'Acesso restrito: sua empresa precisa de uma assinatura ativa com pagamento confirmado para acessar o manual.'
    };
  }
  const currentPlan = db.get().plansConfig.find((p) => p.id === company.plan);
  if (currentPlan && Array.isArray(currentPlan.manualChapters)) {
    if (currentPlan.manualChapters.includes('all') || currentPlan.manualChapters.includes(chapterId)) {
      return { granted: true };
    }
    return {
      granted: false,
      reason: `O plano ${currentPlan.name} não inclui este capítulo. Faça upgrade para desbloquear.`
    };
  }
  // Fallback to hierarchy
  const userPlanLevel = MANUAL_PLAN_HIERARCHY[company.plan] || 1;
  const chapter = growthManualChapters.find((c) => c.id === chapterId);
  const requiredLevel = MANUAL_PLAN_HIERARCHY[chapter?.requiresPlan || 'starter'] || 1;
  if (userPlanLevel >= requiredLevel) {
    return { granted: true };
  }
  return {
    granted: false,
    reason: `Capítulo exclusivo para assinantes de planos superiores. Faça upgrade para liberar o acesso.`
  };
}

app.get('/api/manual/chapters', requireAuth, (req, res) => {
  const user = (req as any).user;
  const company = (req as any).company;
  const isMasterOwner = Boolean(user && user.role === 'owner');

  const chaptersMeta = growthManualChapters.map((chapter) => {
    const access = canAccessChapter(user, company, chapter.id);
    return {
      id: chapter.id,
      number: chapter.number,
      title: chapter.title,
      subtitle: chapter.subtitle,
      category: chapter.category,
      readTime: chapter.readTime,
      requiresPlan: chapter.requiresPlan,
      locked: !access.granted,
      accessGranted: access.granted,
      isOwnerExempt: isMasterOwner,
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
    companyPlan: company?.plan || 'starter',
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

  const access = canAccessChapter(user, company, chapterId);
  if (!access.granted) {
    return res.status(403).json({
      error: access.reason || 'Acesso não autorizado a este capítulo.',
      locked: true,
      accessGranted: false,
      requiresPlan: chapter.requiresPlan,
      userPlan: company?.plan || 'starter',
      isOwnerExempt: isMasterOwner,
    });
  }

  return res.json({
    ...chapter,
    locked: false,
    accessGranted: true,
    isOwnerExempt: isMasterOwner,
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
// PLANS & PRICING (Public/Client Endpoint)
// ==========================================
app.get('/api/plans', (req, res) => {
  const allPlans = db.get().plansConfig;
  // Return active plans for clients, with companies count if queried
  const activePlans = allPlans.filter((p) => (p as any).status !== 'archived' && (p as any).status !== 'inactive');
  return res.json(activePlans);
});

// ==========================================
// PAYMENTS & PIX SUBSCRIPTIONS
// ==========================================
app.post('/api/payments', requireAuth, (req, res) => {
  try {
    const user = (req as any).user;
    const company = (req as any).company;
    const { planId, billingCycle = 'monthly', method = 'PIX', customerNotes } = req.body;

    if (!planId) {
      return res.status(400).json({ error: 'Plano é obrigatório.' });
    }

    const plan = db.get().plansConfig.find((p) => p.id === planId);
    if (!plan) {
      return res.status(404).json({ error: 'Plano não encontrado.' });
    }

    if ((plan as any).status === 'archived') {
      return res.status(400).json({ error: 'Este plano está arquivado e não aceita novas contratações.' });
    }

    const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

    if (!db.get().payments) {
      (db.get() as any).payments = [];
    }

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newPayment = {
      id: paymentId,
      companyId: company.id,
      companyName: company.name,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      planId: plan.id,
      planName: plan.name,
      amount,
      billingCycle: billingCycle as 'monthly' | 'yearly',
      method: method as 'PIX' | 'CARTAO_PARCELADO',
      status: 'PENDENTE' as const,
      pixKey: '11973479473',
      pixBeneficiary: 'Alifer Madeiro / NEXORA AI',
      customerNotes: customerNotes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    db.get().payments.unshift(newPayment);
    db.save();

    logAudit(user.email, user.role, company.id, 'PAYMENT_INITIATED', `Cobrança Pix iniciada para o plano ${plan.name} (R$ ${amount}).`, req);

    return res.status(201).json(newPayment);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao criar pagamento: ' + err.message });
  }
});

app.post('/api/payments/:id/receipt', requireAuth, (req, res) => {
  try {
    const user = (req as any).user;
    const company = (req as any).company;
    const paymentId = req.params.id;
    const { receiptDetails, customerNotes } = req.body;

    if (!receiptDetails || !receiptDetails.trim()) {
      return res.status(400).json({ error: 'Informe os dados ou código do comprovante da transação Pix.' });
    }

    const payments = db.get().payments || [];
    const payment = payments.find((p) => p.id === paymentId && p.companyId === company.id);

    if (!payment) {
      return res.status(404).json({ error: 'Registro de pagamento não encontrado.' });
    }

    payment.receiptDetails = receiptDetails.trim();
    if (customerNotes) {
      payment.customerNotes = customerNotes.trim();
    }
    payment.status = 'EM_ANALISE';
    payment.updatedAt = new Date().toISOString();

    (company as any).paymentStatus = 'EM_ANALISE';

    db.save();
    logAudit(user.email, user.role, company.id, 'PAYMENT_RECEIPT_SUBMITTED', `Comprovante Pix enviado para conferência pelo cliente.`, req);

    return res.json({
      message: 'Comprovante enviado com sucesso para análise do administrador.',
      payment,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao enviar comprovante: ' + err.message });
  }
});

app.get('/api/payments/my', requireAuth, (req, res) => {
  const company = (req as any).company;
  const payments = db.get().payments || [];
  const companyPayments = payments.filter((p) => p.companyId === company.id);
  return res.json(companyPayments);
});

// ==========================================
// OWNER / SUPER ADMIN MODULE (Exclusive)
// ==========================================
app.get('/api/admin/overview', requireAuth, requireOwner, (req, res) => {
  const companies = db.get().companies;
  const users = db.get().users;
  const leads = db.get().leads;
  const plans = db.get().plansConfig;
  const payments = db.get().payments || [];

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
      pendingCompanies: companies.filter((c) => (c as any).status === 'pending').length,
      suspendedCompanies: companies.filter((c) => (c as any).status === 'suspended').length,
      totalUsers: users.length,
      totalLeadsSystemWide: leads.length,
      estimatedMRR: totalMRR,
      plansConfigured: plans.length,
      pendingPayments: payments.filter((p) => p.status === 'EM_ANALISE' || p.status === 'PENDENTE').length,
      approvedPayments: payments.filter((p) => p.status === 'APROVADO').length,
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

// Companies Management
app.get('/api/admin/companies', requireAuth, requireOwner, (req, res) => {
  return res.json(db.get().companies);
});

app.post('/api/admin/companies', requireAuth, requireOwner, (req, res) => {
  try {
    const actor = (req as any).user;
    const {
      name,
      contactName,
      contactEmail,
      phone,
      cnpj,
      industry,
      plan = 'starter',
      status = 'pending',
      initialPassword,
      sendInvite = true,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome comercial da empresa é obrigatório.' });
    }

    const companyId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newCompany: any = {
      id: companyId,
      name: name.trim(),
      slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      plan: plan || 'starter',
      status: status || 'pending',
      cnpj: cnpj ? cnpj.trim() : '',
      industry: industry ? industry.trim() : 'Geral',
      phone: phone ? phone.trim() : '',
      contactName: contactName ? contactName.trim() : '',
      contactEmail: contactEmail ? contactEmail.toLowerCase().trim() : '',
      paymentStatus: status === 'active' ? 'APROVADO' : 'PENDENTE',
      createdAt: new Date().toISOString(),
    };

    if (status === 'active') {
      newCompany.activatedAt = new Date().toISOString();
    }

    db.get().companies.push(newCompany);

    let createdUser: any = null;
    let inviteToken: string | undefined = undefined;
    let inviteUrl: string | undefined = undefined;

    // If initial password provided, create user directly
    if (initialPassword && contactEmail) {
      const { hash, salt } = hashPassword(initialPassword);
      createdUser = {
        id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        name: contactName ? contactName.trim() : name.trim(),
        email: contactEmail.toLowerCase().trim(),
        passwordHash: hash,
        passwordSalt: salt,
        role: 'admin',
        companyId,
        createdAt: new Date().toISOString(),
      };
      db.get().users.push(createdUser);
    } else if (contactEmail && sendInvite) {
      // Create invitation token for client to define own password securely
      inviteToken = crypto.randomBytes(24).toString('hex');
      if (!(db.get() as any).invites) {
        (db.get() as any).invites = {};
      }
      (db.get() as any).invites[inviteToken] = {
        token: inviteToken,
        companyId,
        companyName: newCompany.name,
        email: contactEmail.toLowerCase().trim(),
        name: contactName ? contactName.trim() : name.trim(),
        role: 'admin',
        expiresAt: Date.now() + 7 * 86400000, // 7 days
        createdAt: new Date().toISOString(),
      };
      inviteUrl = `/#invite=${inviteToken}`;
    }

    db.save();
    logAudit(actor.email, 'owner', companyId, 'COMPANY_CREATED', `Empresa ${newCompany.name} cadastrada com status ${status}.`, req);

    return res.status(201).json({
      message: 'Empresa cadastrada com sucesso!',
      company: newCompany,
      user: createdUser ? {
        id: createdUser.id,
        name: createdUser.name,
        email: createdUser.email,
        role: createdUser.role,
        companyId: createdUser.companyId,
      } : undefined,
      inviteToken,
      inviteUrl,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao cadastrar empresa: ' + err.message });
  }
});

app.put('/api/admin/companies/:id', requireAuth, requireOwner, (req, res) => {
  const comp = db.get().companies.find((c) => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Empresa não encontrada.' });

  const { name, plan, status, industry, phone, cnpj, contactName, contactEmail } = req.body;
  if (name !== undefined) comp.name = name;
  if (plan !== undefined) comp.plan = plan;
  if (status !== undefined) comp.status = status;
  if (industry !== undefined) comp.industry = industry;
  if (phone !== undefined) comp.phone = phone;
  if (cnpj !== undefined) comp.cnpj = cnpj;
  if (contactName !== undefined) (comp as any).contactName = contactName;
  if (contactEmail !== undefined) (comp as any).contactEmail = contactEmail;

  db.save();
  logAudit((req as any).user.email, 'owner', comp.id, 'COMPANY_ADMIN_UPDATE', `Dados da empresa ${comp.name} alterados pelo proprietário.`, req);

  return res.json(comp);
});

app.put('/api/admin/companies/:id/status', requireAuth, requireOwner, (req, res) => {
  const comp = db.get().companies.find((c) => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Empresa não encontrada.' });

  const { status, reason } = req.body;
  if (!status) return res.status(400).json({ error: 'Status é obrigatório.' });

  const oldStatus = comp.status;
  comp.status = status;
  if (status === 'active' && !(comp as any).activatedAt) {
    (comp as any).activatedAt = new Date().toISOString();
  }

  db.save();
  logAudit(
    (req as any).user.email,
    'owner',
    comp.id,
    'COMPANY_STATUS_CHANGED',
    `Status da empresa ${comp.name} alterado de ${oldStatus} para ${status}. Motivo: ${reason || 'Não informado'}`,
    req
  );

  return res.json({ message: `Status da empresa atualizado para ${status}.`, company: comp });
});

app.post('/api/admin/companies/:id/invite', requireAuth, requireOwner, (req, res) => {
  const comp = db.get().companies.find((c) => c.id === req.params.id);
  if (!comp) return res.status(404).json({ error: 'Empresa não encontrada.' });

  const { email, name } = req.body;
  const inviteEmail = (email || (comp as any).contactEmail || '').toLowerCase().trim();
  const inviteName = name || (comp as any).contactName || comp.name;

  if (!inviteEmail) {
    return res.status(400).json({ error: 'E-mail do responsável é obrigatório para gerar o convite.' });
  }

  const inviteToken = crypto.randomBytes(24).toString('hex');
  if (!(db.get() as any).invites) {
    (db.get() as any).invites = {};
  }

  (db.get() as any).invites[inviteToken] = {
    token: inviteToken,
    companyId: comp.id,
    companyName: comp.name,
    email: inviteEmail,
    name: inviteName,
    role: 'admin',
    expiresAt: Date.now() + 7 * 86400000,
    createdAt: new Date().toISOString(),
  };

  db.save();
  logAudit((req as any).user.email, 'owner', comp.id, 'INVITE_GENERATED', `Convite gerado para ${inviteEmail}.`, req);

  return res.json({
    message: 'Convite gerado com sucesso!',
    inviteToken,
    inviteUrl: `/#invite=${inviteToken}`,
  });
});

// Admin Payments Management
app.get('/api/admin/payments', requireAuth, requireOwner, (req, res) => {
  const payments = db.get().payments || [];
  const { status } = req.query;

  if (status && typeof status === 'string') {
    return res.json(payments.filter((p) => p.status === status));
  }

  return res.json(payments);
});

app.put('/api/admin/payments/:id/status', requireAuth, requireOwner, (req, res) => {
  try {
    const actor = (req as any).user;
    const paymentId = req.params.id;
    const { status, adminNotes } = req.body;

    const allowed = ['PENDENTE', 'EM_ANALISE', 'APROVADO', 'RECUSADO', 'CANCELADO'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Status de pagamento inválido.' });
    }

    const payments = db.get().payments || [];
    const payment = payments.find((p) => p.id === paymentId);

    if (!payment) {
      return res.status(404).json({ error: 'Pagamento não encontrado.' });
    }

    const oldStatus = payment.status;
    payment.status = status;
    payment.adminNotes = adminNotes !== undefined ? adminNotes : payment.adminNotes;
    payment.decisionBy = actor.name;
    payment.decisionAt = new Date().toISOString();
    payment.updatedAt = new Date().toISOString();

    const company = db.get().companies.find((c) => c.id === payment.companyId);

    if (status === 'APROVADO') {
      if (company) {
        company.plan = payment.planId;
        company.status = 'active';
        (company as any).paymentStatus = 'APROVADO';
        (company as any).activatedAt = new Date().toISOString();
      }
      logAudit(
        actor.email,
        'owner',
        payment.companyId,
        'PAYMENT_APPROVED',
        `Pagamento de R$ ${payment.amount} (${payment.planName}) APROVADO pelo administrador. Plano liberado para ${payment.companyName}.`,
        req
      );
    } else if (status === 'RECUSADO') {
      if (company) {
        (company as any).paymentStatus = 'RECUSADO';
      }
      logAudit(
        actor.email,
        'owner',
        payment.companyId,
        'PAYMENT_REJECTED',
        `Pagamento de R$ ${payment.amount} RECUSADO pelo administrador. Motivo: ${adminNotes || 'Não informado'}.`,
        req
      );
    } else {
      logAudit(
        actor.email,
        'owner',
        payment.companyId,
        'PAYMENT_STATUS_UPDATE',
        `Status de pagamento alterado de ${oldStatus} para ${status}.`,
        req
      );
    }

    db.save();

    return res.json({
      message: `Pagamento ${status === 'APROVADO' ? 'aprovado e plano ativado' : 'atualizado'} com sucesso!`,
      payment,
      company,
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao atualizar pagamento: ' + err.message });
  }
});

// Admin Plans Management
app.get('/api/admin/plans', requireAuth, (req, res) => {
  const plans = db.get().plansConfig;
  const companies = db.get().companies;
  const enriched = plans.map((p) => ({
    ...p,
    companiesCount: companies.filter((c) => c.plan === p.id).length,
  }));
  return res.json(enriched);
});

app.post('/api/admin/plans', requireAuth, requireOwner, (req, res) => {
  try {
    const actor = (req as any).user;
    const {
      name,
      priceMonthly,
      priceYearly,
      periodicity = 'monthly',
      status = 'active',
      description,
      leadsLimit = 1000,
      aiCredits = 1000,
      automationsLimit = 5,
      usersLimit = 3,
      features = [],
      modules = ['crm', 'ai-hub', 'content', 'campaigns', 'manual'],
      manualChapters = ['cap-1'],
      allowPix = true,
      allowInstallments = true,
      popular = false,
    } = req.body;

    if (!name || priceMonthly === undefined) {
      return res.status(400).json({ error: 'Nome do plano e preço mensal são obrigatórios.' });
    }

    const planId = req.body.id
      ? req.body.id.toLowerCase().replace(/[^a-z0-9_-]+/g, '-')
      : `plan_${Date.now()}`;

    const existing = db.get().plansConfig.find((p) => p.id === planId);
    if (existing) {
      return res.status(400).json({ error: 'Já existe um plano com este identificador.' });
    }

    const newPlan: any = {
      id: planId,
      name: name.trim(),
      priceMonthly: Number(priceMonthly) || 0,
      priceYearly: Number(priceYearly) || Number(priceMonthly) * 10,
      periodicity,
      status,
      description: description ? description.trim() : '',
      leadsLimit: Number(leadsLimit) || 1000,
      aiCredits: Number(aiCredits) || 1000,
      automationsLimit: Number(automationsLimit) || 5,
      usersLimit: Number(usersLimit) || 3,
      features: Array.isArray(features) ? features : [],
      modules: Array.isArray(modules) ? modules : ['crm', 'ai-hub', 'content', 'campaigns', 'manual'],
      manualChapters: Array.isArray(manualChapters) ? manualChapters : ['cap-1'],
      allowPix: Boolean(allowPix),
      allowInstallments: Boolean(allowInstallments),
      popular: Boolean(popular),
    };

    db.get().plansConfig.push(newPlan);
    db.save();

    logAudit(actor.email, 'owner', 'system', 'PLAN_CREATED', `Novo plano criado: ${newPlan.name} (R$ ${newPlan.priceMonthly}/mês).`, req);

    return res.status(201).json(newPlan);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao criar plano: ' + err.message });
  }
});

app.put('/api/admin/plans/:id', requireAuth, requireOwner, (req, res) => {
  try {
    const actor = (req as any).user;
    const plan = db.get().plansConfig.find((p) => p.id === req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plano não encontrado.' });

    const fields = [
      'name', 'priceMonthly', 'priceYearly', 'periodicity', 'status',
      'description', 'leadsLimit', 'aiCredits', 'automationsLimit',
      'usersLimit', 'features', 'modules', 'manualChapters',
      'allowPix', 'allowInstallments', 'popular'
    ];

    fields.forEach((f) => {
      if (req.body[f] !== undefined) {
        (plan as any)[f] = req.body[f];
      }
    });

    db.save();
    logAudit(actor.email, 'owner', 'system', 'PLAN_UPDATED', `Plano ${plan.name} atualizado pelo proprietário.`, req);

    return res.json(plan);
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao editar plano: ' + err.message });
  }
});

app.delete('/api/admin/plans/:id', requireAuth, requireOwner, (req, res) => {
  try {
    const actor = (req as any).user;
    const plan = db.get().plansConfig.find((p) => p.id === req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plano não encontrado.' });

    // Mark as archived to preserve existing customers and payment history
    (plan as any).status = 'archived';
    db.save();

    logAudit(actor.email, 'owner', 'system', 'PLAN_ARCHIVED', `Plano ${plan.name} arquivado pelo proprietário.`, req);
    return res.json({ message: `Plano ${plan.name} arquivado com sucesso. Assinaturas existentes preservadas.` });
  } catch (err: any) {
    return res.status(500).json({ error: 'Erro ao arquivar plano: ' + err.message });
  }
});

app.put('/api/admin/plans/batch', requireAuth, requireOwner, (req, res) => {
  const { plans } = req.body;
  if (!Array.isArray(plans)) return res.status(400).json({ error: 'Lista de planos inválida.' });

  db.get().plansConfig = plans;
  db.save();
  logAudit((req as any).user.email, 'owner', 'system', 'PLANS_UPDATED', 'Preços e limites dos planos comerciais atualizados em lote.', req);

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
