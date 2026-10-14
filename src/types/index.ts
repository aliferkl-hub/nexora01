export type UserRole = 'owner' | 'admin' | 'specialist' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  companyId: string;
  createdAt: string;
}

export type CompanyPlan = string;
export type CompanyStatus = 'active' | 'trial' | 'pending' | 'suspended' | 'terminated';

export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: CompanyStatus;
  cnpj?: string;
  industry?: string;
  phone?: string;
  contactName?: string;
  contactEmail?: string;
  paymentStatus?: PaymentStatus;
  activatedAt?: string;
  createdAt: string;
}

export type LeadStage =
  | 'new'
  | 'contact'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'closed_won'
  | 'closed_lost';

export interface Lead {
  id: string;
  companyId: string;
  name: string;
  companyName: string;
  email: string;
  phone: string;
  stage: LeadStage;
  opportunityValue: number;
  source: string;
  aiScore: number;
  aiQualification: string;
  nextAction: string;
  nextActionDate: string;
  lgpdConsent: boolean;
  lgpdConsentDate?: string;
  tags: string[];
  createdAt: string;
}

export interface LeadInteraction {
  id: string;
  leadId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  summary: string;
  notes: string;
  createdAt: string;
}

export interface MarketingActionItem {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface MarketingPlan {
  id: string;
  companyId: string;
  title: string;
  targetAudience: string;
  valueProposition: string;
  positioning: string;
  goals: string[];
  actions: MarketingActionItem[];
  version: number;
  updatedAt: string;
}

export type ContentPlatform = 'instagram' | 'linkedin' | 'tiktok' | 'twitter' | 'email' | 'blog';
export type ContentStatus = 'draft' | 'ready' | 'scheduled' | 'published';

export interface ContentItem {
  id: string;
  companyId: string;
  platform: ContentPlatform;
  title: string;
  category: string;
  tone: string;
  body: string;
  hashtags: string[];
  status: ContentStatus;
  scheduledDate: string;
  createdAt: string;
}

export type CampaignStatus = 'planning' | 'active' | 'paused' | 'completed';

export interface Campaign {
  id: string;
  companyId: string;
  name: string;
  platform: string;
  objective: string;
  status: CampaignStatus;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
  cpa: number;
  roi: number;
  startDate: string;
  endDate: string;
  targetAudience: string;
  creativeNotes: string;
}

export type AutomationTrigger = 'new_lead' | 'lead_stage_changed' | 'deal_closed_won' | 'task_due';
export type AutomationAction = 'webhook_n8n' | 'webhook_make' | 'send_alert' | 'email_sequence';

export interface Automation {
  id: string;
  companyId: string;
  name: string;
  triggerType: AutomationTrigger | string;
  actionType: AutomationAction | string;
  webhookUrl: string;
  status: 'active' | 'paused' | 'draft';
  executionsCount: number;
  failedCount: number;
  lastTriggeredAt: string | null;
  description: string;
}

export interface ExecutionLog {
  id: string;
  automationId: string;
  companyId: string;
  timestamp: string;
  status: 'success' | 'error';
  statusCode: number;
  durationMs: number;
  payload: any;
  responseSummary: string;
}

export type PaymentStatus = 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'RECUSADO' | 'CANCELADO';
export type PaymentMethod = 'PIX' | 'CARTAO_PARCELADO';

export interface PaymentTransaction {
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
  method: PaymentMethod;
  status: PaymentStatus;
  pixKey: string;
  pixBeneficiary: string;
  receiptDetails?: string;
  customerNotes?: string;
  adminNotes?: string;
  decisionBy?: string;
  decisionAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyInvite {
  token: string;
  companyId: string;
  companyName: string;
  email: string;
  name: string;
  role: UserRole;
  expiresAt: number;
  createdAt: string;
}

export interface PlanConfig {
  id: string;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  periodicity?: 'monthly' | 'yearly' | 'trial' | 'custom';
  status?: 'active' | 'inactive' | 'archived';
  popular?: boolean;
  description: string;
  leadsLimit: number;
  aiCredits: number;
  automationsLimit: number;
  usersLimit: number;
  features: string[];
  modules?: string[];
  manualChapters?: string[];
  allowPix?: boolean;
  allowInstallments?: boolean;
  companiesCount?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: string;
  companyId: string;
  action: string;
  ipAddress: string;
  details: string;
}

export interface DashboardStats {
  kpis: {
    totalLeads: number;
    newLeads: number;
    pipelineValue: number;
    wonValue: number;
    conversionRate: string;
    activeCampaigns: number;
    totalSpent: number;
    totalConversions: number;
    contentCount: number;
    activeAutomations: number;
    totalAutomationsRun: number;
    totalAutomationsFailed: number;
  };
  funnelStages: Record<LeadStage, number>;
  leadEvolution: Array<{ month: string; leads: number; pipeline: number }>;
  recentLeads: Lead[];
  activeCampaignsList: Campaign[];
}

export interface ManualSection {
  title: string;
  content: string;
  keyTakeaways?: string[];
}

export interface ManualDiagramNode {
  step: string;
  badge: string;
  title: string;
  description: string;
}

export interface ManualDiagram {
  title: string;
  subtitle: string;
  visualFlow: ManualDiagramNode[];
  asciiDiagram?: string;
}

export interface ManualAIPrompt {
  title: string;
  category: string;
  description: string;
  prompt: string;
}

export interface ManualExercise {
  id: string;
  title: string;
  instruction: string;
  expectedOutcome: string;
}

export interface ManualChecklistItem {
  id: string;
  label: string;
  details?: string;
}

export interface ManualChapterMeta {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  category: string;
  readTime: string;
  requiresPlan: 'starter' | 'pro' | 'business';
  locked: boolean;
  isOwnerExempt?: boolean;
  summary: string;
  sectionsCount: number;
  promptsCount: number;
  checklistCount: number;
}

export interface ManualChapter extends ManualChapterMeta {
  sections: ManualSection[];
  diagram: ManualDiagram;
  aiPrompts: ManualAIPrompt[];
  exercises: ManualExercise[];
  checklist: ManualChecklistItem[];
  accessGranted: boolean;
}

export interface ManualUserProgress {
  completedChapters: string[];
  checkedItems: string[];
  lastActiveChapterId?: string;
}
