import {
  User,
  Company,
  Lead,
  LeadInteraction,
  MarketingPlan,
  ContentItem,
  Campaign,
  Automation,
  ExecutionLog,
  PlanConfig,
  AuditLog,
  DashboardStats,
  ManualChapterMeta,
  ManualChapter,
  ManualUserProgress,
} from '../types';

const TOKEN_KEY = 'nexora_auth_token';
const ACTIVE_TENANT_KEY = 'nexora_active_tenant';

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getActiveTenantId(): string | null {
  return localStorage.getItem(ACTIVE_TENANT_KEY);
}

export function setActiveTenantId(companyId: string | null) {
  if (companyId) {
    localStorage.setItem(ACTIVE_TENANT_KEY, companyId);
  } else {
    localStorage.removeItem(ACTIVE_TENANT_KEY);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const activeTenantId = getActiveTenantId();

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (activeTenantId) {
    headers['x-tenant-id'] = activeTenantId;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.error || data?.message || `Erro HTTP ${res.status}: ${res.statusText}`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string) => {
      const data = await request<{ token: string; user: User; company: Company }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      setStoredToken(data.token);
      return data;
    },
    register: async (payload: {
      companyName: string;
      companyIndustry?: string;
      companyPhone?: string;
      name: string;
      email: string;
      password: string;
    }) => {
      const data = await request<{ token: string; user: User; company: Company }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      setStoredToken(data.token);
      return data;
    },
    me: async () => {
      return request<{ user: User; company: Company }>('/api/auth/me');
    },
    logout: () => {
      setStoredToken(null);
      setActiveTenantId(null);
    },
    forgotPassword: async (email: string) => {
      return request<{ message: string; demoToken?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    resetPassword: async (token: string, newPassword: string) => {
      return request<{ message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, newPassword }),
      });
    },
    updateProfile: async (payload: { name?: string; currentPassword?: string; newPassword?: string }) => {
      return request<{ message: string; user: User }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });
    },
    setupOwner: async (payload: { masterKey: string; name: string; email: string; password: string }) => {
      return request<{ message: string }>('/api/auth/setup-owner', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // Dashboard
  dashboard: {
    getStats: async () => {
      return request<DashboardStats>('/api/dashboard/stats');
    },
  },

  // CRM Leads
  crm: {
    getLeads: async () => {
      return request<Lead[]>('/api/crm/leads');
    },
    createLead: async (lead: Partial<Lead>) => {
      return request<Lead>('/api/crm/leads', {
        method: 'POST',
        body: JSON.stringify(lead),
      });
    },
    updateLead: async (id: string, lead: Partial<Lead>) => {
      return request<Lead>(`/api/crm/leads/${id}`, {
        method: 'PUT',
        body: JSON.stringify(lead),
      });
    },
    deleteLead: async (id: string) => {
      return request<{ message: string }>(`/api/crm/leads/${id}`, {
        method: 'DELETE',
      });
    },
    getInteractions: async (leadId: string) => {
      return request<LeadInteraction[]>(`/api/crm/leads/${leadId}/interactions`);
    },
    addInteraction: async (leadId: string, interaction: { type: string; summary: string; notes?: string }) => {
      return request<LeadInteraction>(`/api/crm/leads/${leadId}/interactions`, {
        method: 'POST',
        body: JSON.stringify(interaction),
      });
    },
    importLeads: async (leadsToImport: Partial<Lead>[]) => {
      return request<{ message: string; importedCount: number; duplicateCount: number; leads: Lead[] }>(
        '/api/crm/leads/import',
        {
          method: 'POST',
          body: JSON.stringify({ leadsToImport }),
        }
      );
    },
    calculateAiScore: async (id: string) => {
      return request<{ lead: Lead; score: number; qualification: string }>(`/api/crm/leads/${id}/ai-score`, {
        method: 'POST',
      });
    },
  },

  // Central de IA
  ai: {
    generate: async (toolType: string, params: Record<string, any>) => {
      return request<{ success: boolean; isDemo: boolean; warning?: string; content: string }>('/api/ai/generate', {
        method: 'POST',
        body: JSON.stringify({ toolType, params }),
      });
    },
  },

  // Marketing Strategies & Plans
  marketing: {
    getPlans: async () => {
      return request<MarketingPlan[]>('/api/marketing/plans');
    },
    createPlan: async (plan: Partial<MarketingPlan>) => {
      return request<MarketingPlan>('/api/marketing/plans', {
        method: 'POST',
        body: JSON.stringify(plan),
      });
    },
    updatePlan: async (id: string, plan: Partial<MarketingPlan>) => {
      return request<MarketingPlan>(`/api/marketing/plans/${id}`, {
        method: 'PUT',
        body: JSON.stringify(plan),
      });
    },
    deletePlan: async (id: string) => {
      return request<{ message: string }>(`/api/marketing/plans/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Content Studio
  content: {
    getItems: async () => {
      return request<ContentItem[]>('/api/content');
    },
    createItem: async (item: Partial<ContentItem>) => {
      return request<ContentItem>('/api/content', {
        method: 'POST',
        body: JSON.stringify(item),
      });
    },
    updateItem: async (id: string, item: Partial<ContentItem>) => {
      return request<ContentItem>(`/api/content/${id}`, {
        method: 'PUT',
        body: JSON.stringify(item),
      });
    },
    deleteItem: async (id: string) => {
      return request<{ message: string }>(`/api/content/${id}`, {
        method: 'DELETE',
      });
    },
  },

  // Campaigns & Advertising
  campaigns: {
    getCampaigns: async () => {
      return request<Campaign[]>('/api/campaigns');
    },
    createCampaign: async (campaign: Partial<Campaign>) => {
      return request<Campaign>('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify(campaign),
      });
    },
    updateCampaign: async (id: string, campaign: Partial<Campaign>) => {
      return request<Campaign>(`/api/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(campaign),
      });
    },
    deleteCampaign: async (id: string) => {
      return request<{ message: string }>(`/api/campaigns/${id}`, {
        method: 'DELETE',
      });
    },
    connectPlatform: async (payload: { platformName: string; accountId?: string }) => {
      return request<{ success: boolean; message: string; status: string }>('/api/campaigns/connect-platform', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },
  },

  // Automations & Webhooks
  automations: {
    getAutomations: async () => {
      return request<Automation[]>('/api/automations');
    },
    createAutomation: async (auto: Partial<Automation>) => {
      return request<Automation>('/api/automations', {
        method: 'POST',
        body: JSON.stringify(auto),
      });
    },
    updateAutomation: async (id: string, auto: Partial<Automation>) => {
      return request<Automation>(`/api/automations/${id}`, {
        method: 'PUT',
        body: JSON.stringify(auto),
      });
    },
    deleteAutomation: async (id: string) => {
      return request<{ message: string }>(`/api/automations/${id}`, {
        method: 'DELETE',
      });
    },
    triggerAutomation: async (id: string) => {
      return request<{
        message: string;
        status: 'success' | 'error';
        statusCode: number;
        durationMs: number;
        responseSummary: string;
        log: ExecutionLog;
      }>(`/api/automations/${id}/trigger`, {
        method: 'POST',
      });
    },
    getLogs: async (id: string) => {
      return request<ExecutionLog[]>(`/api/automations/${id}/logs`);
    },
  },

  // Reports
  reports: {
    getReports: async () => {
      return request<{
        overview: {
          totalLeads: number;
          totalPipeline: number;
          totalWon: number;
          totalSpentAds: number;
          totalAutomationsExecuted: number;
          totalContentCreated: number;
        };
        sourceReport: Array<{
          source: string;
          leads: number;
          pipeline: number;
          won: number;
          conversionRate: string;
        }>;
        campaignPerformance: Array<{
          name: string;
          platform: string;
          spent: number;
          conversions: number;
          cpa: number;
          roi: string;
          status: string;
        }>;
      }>('/api/reports');
    },
  },

  // Owner / Admin Exclusive
  admin: {
    getOverview: async () => {
      return request<{
        metrics: {
          totalCompanies: number;
          activeCompanies: number;
          trialCompanies: number;
          totalUsers: number;
          totalLeadsSystemWide: number;
          estimatedMRR: number;
          plansConfigured: number;
        };
        companies: Company[];
        users: User[];
        auditLogs: AuditLog[];
      }>('/api/admin/overview');
    },
    getCompanies: async () => {
      return request<Company[]>('/api/admin/companies');
    },
    updateCompany: async (id: string, company: Partial<Company>) => {
      return request<Company>(`/api/admin/companies/${id}`, {
        method: 'PUT',
        body: JSON.stringify(company),
      });
    },
    getPlans: async () => {
      return request<PlanConfig[]>('/api/admin/plans');
    },
    updatePlans: async (plans: PlanConfig[]) => {
      return request<{ message: string; plans: PlanConfig[] }>('/api/admin/plans', {
        method: 'PUT',
        body: JSON.stringify({ plans }),
      });
    },
    getAuditLogs: async () => {
      return request<AuditLog[]>('/api/admin/audit-logs');
    },
  },

  // Manual de Crescimento Empresarial
  manual: {
    getChapters: async () => {
      return request<{
        chapters: ManualChapterMeta[];
        userProgress: ManualUserProgress;
        isOwner: boolean;
        ownerName: string;
      }>('/api/manual/chapters');
    },
    getChapter: async (id: string) => {
      return request<ManualChapter>(`/api/manual/chapters/${id}`);
    },
    saveProgress: async (progress: Partial<ManualUserProgress>) => {
      return request<{ message: string; userProgress: ManualUserProgress }>('/api/manual/progress', {
        method: 'POST',
        body: JSON.stringify(progress),
      });
    },
  },
};
