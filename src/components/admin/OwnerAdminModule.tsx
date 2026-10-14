import React, { useState, useEffect } from 'react';
import {
  Crown,
  Building2,
  Users,
  Shield,
  DollarSign,
  Activity,
  Lock,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Save,
  Search,
  Filter,
  Plus,
  QrCode,
  CreditCard,
  Send,
  Trash2,
  Archive,
  RefreshCw,
  Copy,
  ExternalLink,
  Ban,
  Check,
  X,
  FileCheck,
  Layers,
  BookOpen,
} from 'lucide-react';
import { api } from '../../services/api';
import { Company, User, PlanConfig, AuditLog, PaymentTransaction, PaymentStatus, CompanyStatus } from '../../types';
import { PixAuditManager } from './PixAuditManager';

export const OwnerAdminModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [payments, setPayments] = useState<PaymentTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Subtabs: overview | companies | plans | payments | audit
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'plans' | 'payments' | 'audit'>('overview');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('all');

  // Notifications
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // ==========================================
  // MODAL: CREATE / EDIT COMPANY
  // ==========================================
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [editingComp, setEditingComp] = useState<Company | null>(null);
  const [compForm, setCompForm] = useState({
    name: '',
    contactName: '',
    contactEmail: '',
    phone: '',
    cnpj: '',
    industry: 'Tecnologia',
    plan: 'starter',
    status: 'active' as CompanyStatus,
    initialPassword: '',
    sendInvite: true,
  });
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState<string | null>(null);

  // ==========================================
  // MODAL: CREATE / EDIT PLAN
  // ==========================================
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PlanConfig | null>(null);
  const [planForm, setPlanForm] = useState<Partial<PlanConfig>>({
    name: '',
    priceMonthly: 197,
    priceYearly: 1970,
    periodicity: 'monthly',
    status: 'active',
    description: '',
    leadsLimit: 1000,
    aiCredits: 1000,
    automationsLimit: 5,
    usersLimit: 3,
    features: ['CRM Visual', 'Central de IA', 'Estúdio de Conteúdo'],
    modules: ['crm', 'ai-hub', 'content', 'campaigns', 'manual'],
    manualChapters: ['cap-1', 'cap-2'],
    allowPix: true,
    allowInstallments: true,
    popular: false,
  });
  const [featureInput, setFeatureInput] = useState('');

  // ==========================================
  // MODAL: REVIEW PAYMENT
  // ==========================================
  const [reviewingPayment, setReviewingPayment] = useState<PaymentTransaction | null>(null);
  const [adminReviewNotes, setAdminReviewNotes] = useState('');
  const [processingDecision, setProcessingDecision] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [overviewData, plansData, paymentsData] = await Promise.all([
        api.admin.getOverview(),
        api.admin.getPlans(),
        api.admin.getPayments(),
      ]);

      setMetrics(overviewData.metrics);
      setCompanies(overviewData.companies);
      setUsers(overviewData.users);
      setAuditLogs(overviewData.auditLogs);
      setPlans(plansData);
      setPayments(paymentsData);
    } catch (err: any) {
      setActionError(err.message || 'Erro ao sincronizar dados administrativos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const showNotification = (msg: string) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(null), 4000);
  };

  // ==========================================
  // COMPANY ACTIONS
  // ==========================================
  const handleOpenCreateCompany = () => {
    setEditingComp(null);
    setCompForm({
      name: '',
      contactName: '',
      contactEmail: '',
      phone: '',
      cnpj: '',
      industry: 'Tecnologia',
      plan: plans[0]?.id || 'starter',
      status: 'active',
      initialPassword: '',
      sendInvite: true,
    });
    setGeneratedInviteUrl(null);
    setShowCompanyModal(true);
  };

  const handleOpenEditCompany = (c: Company) => {
    setEditingComp(c);
    setCompForm({
      name: c.name,
      contactName: c.contactName || '',
      contactEmail: c.contactEmail || '',
      phone: c.phone || '',
      cnpj: c.cnpj || '',
      industry: c.industry || 'Geral',
      plan: c.plan,
      status: c.status,
      initialPassword: '',
      sendInvite: false,
    });
    setGeneratedInviteUrl(null);
    setShowCompanyModal(true);
  };

  const handleSaveCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingComp) {
        const updated = await api.admin.updateCompany(editingComp.id, {
          name: compForm.name,
          plan: compForm.plan,
          status: compForm.status,
          cnpj: compForm.cnpj,
          industry: compForm.industry,
          phone: compForm.phone,
          contactName: compForm.contactName,
          contactEmail: compForm.contactEmail,
        });
        setCompanies(companies.map((c) => (c.id === updated.id ? updated : c)));
        showNotification(`Empresa ${updated.name} atualizada com sucesso!`);
        setShowCompanyModal(false);
      } else {
        const res = await api.admin.createCompany({
          name: compForm.name,
          contactName: compForm.contactName,
          contactEmail: compForm.contactEmail,
          phone: compForm.phone,
          cnpj: compForm.cnpj,
          industry: compForm.industry,
          plan: compForm.plan,
          status: compForm.status,
          initialPassword: compForm.initialPassword || undefined,
          sendInvite: compForm.sendInvite,
        });
        setCompanies([...companies, res.company]);
        if (res.inviteUrl) {
          setGeneratedInviteUrl(window.location.origin + res.inviteUrl);
          showNotification(`Empresa cadastrada! Link de convite pronto para envio.`);
        } else {
          showNotification(`Empresa ${res.company.name} cadastrada com sucesso!`);
          setShowCompanyModal(false);
        }
      }
      loadData();
    } catch (err: any) {
      alert('Erro ao salvar empresa: ' + err.message);
    }
  };

  const handleGenerateInvite = async (c: Company) => {
    try {
      const res = await api.admin.generateCompanyInvite(c.id, c.contactEmail || '', c.contactName || c.name);
      const fullUrl = window.location.origin + res.inviteUrl;
      navigator.clipboard.writeText(fullUrl);
      showNotification(`Link de convite para ${c.name} gerado e copiado para a área de transferência!`);
    } catch (err: any) {
      alert('Erro ao gerar convite: ' + err.message);
    }
  };

  const handleToggleCompanyStatus = async (c: Company, newStatus: CompanyStatus) => {
    if (!confirm(`Deseja alterar o status de "${c.name}" para "${newStatus.toUpperCase()}"?`)) return;
    try {
      const res = await api.admin.setCompanyStatus(c.id, newStatus, 'Alteração manual pelo proprietário');
      setCompanies(companies.map((comp) => (comp.id === c.id ? res.company : comp)));
      showNotification(`Status de ${c.name} alterado para ${newStatus}.`);
      loadData();
    } catch (err: any) {
      alert('Erro ao atualizar status: ' + err.message);
    }
  };

  // ==========================================
  // PLAN ACTIONS
  // ==========================================
  const handleOpenCreatePlan = () => {
    setEditingPlan(null);
    setPlanForm({
      name: '',
      priceMonthly: 297,
      priceYearly: 2970,
      periodicity: 'monthly',
      status: 'active',
      description: '',
      leadsLimit: 2000,
      aiCredits: 2000,
      automationsLimit: 10,
      usersLimit: 5,
      features: ['CRM Completo', 'Automações via Webhook', 'Central de IA'],
      modules: ['crm', 'ai-hub', 'content', 'campaigns', 'automations', 'reports', 'manual'],
      manualChapters: ['cap-1', 'cap-2', 'cap-3'],
      allowPix: true,
      allowInstallments: true,
      popular: false,
    });
    setFeatureInput('');
    setShowPlanModal(true);
  };

  const handleOpenEditPlan = (p: PlanConfig) => {
    setEditingPlan(p);
    setPlanForm({
      ...p,
      features: [...p.features],
      modules: p.modules ? [...p.modules] : ['crm', 'ai-hub', 'content', 'campaigns', 'manual'],
      manualChapters: p.manualChapters ? [...p.manualChapters] : ['cap-1'],
    });
    setFeatureInput('');
    setShowPlanModal(true);
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    setPlanForm({
      ...planForm,
      features: [...(planForm.features || []), featureInput.trim()],
    });
    setFeatureInput('');
  };

  const handleRemoveFeature = (idx: number) => {
    const list = [...(planForm.features || [])];
    list.splice(idx, 1);
    setPlanForm({ ...planForm, features: list });
  };

  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        const updated = await api.admin.updatePlan(editingPlan.id, planForm);
        setPlans(plans.map((p) => (p.id === updated.id ? updated : p)));
        showNotification(`Plano ${updated.name} atualizado com sucesso!`);
      } else {
        const created = await api.admin.createPlan(planForm);
        setPlans([...plans, created]);
        showNotification(`Novo plano ${created.name} criado com sucesso!`);
      }
      setShowPlanModal(false);
      loadData();
    } catch (err: any) {
      alert('Erro ao salvar plano: ' + err.message);
    }
  };

  const handleArchivePlan = async (p: PlanConfig) => {
    if (!confirm(`Deseja arquivar o plano "${p.name}"? Novas assinaturas serão bloqueadas, mas clientes existentes continuarão funcionando.`)) return;
    try {
      await api.admin.deletePlan(p.id);
      showNotification(`Plano ${p.name} arquivado com sucesso.`);
      loadData();
    } catch (err: any) {
      alert('Erro ao arquivar plano: ' + err.message);
    }
  };

  // ==========================================
  // PAYMENT ACTIONS
  // ==========================================
  const handleOpenReviewPayment = (p: PaymentTransaction) => {
    setReviewingPayment(p);
    setAdminReviewNotes(p.adminNotes || '');
  };

  const handleDecidePayment = async (decision: 'APROVADO' | 'RECUSADO') => {
    if (!reviewingPayment) return;
    setProcessingDecision(true);
    try {
      const res = await api.admin.updatePaymentStatus(reviewingPayment.id, {
        status: decision,
        adminNotes: adminReviewNotes.trim(),
      });
      showNotification(res.message);
      setReviewingPayment(null);
      loadData();
    } catch (err: any) {
      alert('Erro ao processar decisão de pagamento: ' + err.message);
    } finally {
      setProcessingDecision(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center min-h-[400px] gap-2">
        <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />
        <span className="font-mono">Carregando painel de governança Master Owner...</span>
      </div>
    );
  }

  // Filtered lists
  const filteredCompanies = companies.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.contactEmail && c.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.cnpj && c.cnpj.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPayments = payments.filter((p) => {
    const matchesStatus = paymentStatusFilter === 'all' || p.status === paymentStatusFilter;
    const matchesSearch =
      p.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.planName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Action Notification Banner */}
      {actionSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Governança & Administração Master
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
              Proprietário
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Controle de empresas reais, gerenciamento livre de planos comerciais, conferência de pagamentos Pix e auditoria.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Recarregar Dados</span>
          </button>
        </div>
      </div>

      {/* Master Owner Identity Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/40 via-blue-950/30 to-purple-950/20 border border-amber-500/30 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-yellow-500 p-[1px] shadow-[0_0_20px_rgba(245,158,11,0.3)]">
            <div className="w-full h-full bg-[#0a0f1d] rounded-xl flex items-center justify-center text-amber-400 font-bold">
              AM
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">Alifer Madeiro</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold">
                Proprietário Master
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Chave Pix: 11973479473 • E-mail: admin@nexora.ai • Acesso Vitalício Irrestrito ao Manual e Governança
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Autenticação de Segurança Ativa</span>
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Empresas Cadastradas</span>
          <p className="text-2xl font-bold text-white font-mono mt-1">{metrics.totalCompanies}</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            {metrics.activeCompanies} ativas • {metrics.trialCompanies || 0} em teste
          </span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">MRR Recorrente Estimado</span>
          <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
            R$ {metrics.estimatedMRR.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">
            Baseado nos planos ativos
          </span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Pagamentos Pendentes Pix</span>
          <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">{metrics.pendingPayments || 0}</p>
          <span className="text-[10px] text-amber-400 font-mono mt-1 block">
            {payments.filter((p) => p.status === 'EM_ANALISE').length} com comprovante enviado
          </span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Planos Configurados</span>
          <p className="text-2xl font-bold text-purple-400 font-mono mt-1">{plans.length}</p>
          <span className="text-[10px] text-slate-400 font-mono mt-1 block">
            Customizáveis sem limites
          </span>
        </div>
      </div>

      {/* Subtabs Navigation */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          Visão Geral
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'companies'
              ? 'bg-blue-600/30 text-cyan-300 border border-cyan-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Empresas & Contas</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {companies.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('plans')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'plans'
              ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Gerenciar Planos</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {plans.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'payments'
              ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Auditoria Pix</span>
          {payments.filter((p) => p.status === 'EM_ANALISE').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-slate-700 text-white border border-slate-600'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>Auditoria & Segurança</span>
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: VISÃO GERAL                                         */}
      {/* ========================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions */}
            <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400" />
                <span>Ações Rápidas de Governança</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <button
                  onClick={handleOpenCreateCompany}
                  className="p-3 rounded-xl bg-blue-950/40 hover:bg-blue-900/40 border border-blue-500/30 text-left cursor-pointer transition-all space-y-1"
                >
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Cadastrar Nova Empresa</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Definir responsável, associar plano e emitir convite.
                  </p>
                </button>

                <button
                  onClick={handleOpenCreatePlan}
                  className="p-3 rounded-xl bg-purple-950/40 hover:bg-purple-900/40 border border-purple-500/30 text-left cursor-pointer transition-all space-y-1"
                >
                  <span className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Plus className="w-3.5 h-3.5 text-purple-400" />
                    <span>Criar Novo Plano</span>
                  </span>
                  <p className="text-[11px] text-slate-400">
                    Definir limites de leads, módulos e capítulos do manual.
                  </p>
                </button>
              </div>
            </div>

            {/* Pending Pix Alert Box */}
            <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-6 backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-cyan-400" />
                  <span>Comprovantes Pix Aguardando Conferência</span>
                </h2>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                  Chave: 11973479473
                </span>
              </div>

              {payments.filter((p) => p.status === 'EM_ANALISE').length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-400 space-y-1">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="font-semibold text-slate-200">Nenhum comprovante pendente no momento.</p>
                  <p className="text-[11px] text-slate-500">
                    Todas as transações recebidas foram conferidas.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {payments
                    .filter((p) => p.status === 'EM_ANALISE')
                    .slice(0, 3)
                    .map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-bold text-white">{p.companyName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            {p.planName} • R$ {p.amount},00 • {p.receiptDetails || 'Comprovante anexado'}
                          </p>
                        </div>
                        <button
                          onClick={() => setActiveTab('payments')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs cursor-pointer shadow-md inline-flex items-center gap-1"
                        >
                          <span>Auditar Pix</span>
                        </button>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: EMPRESAS & CONTAS                                   */}
      {/* ========================================================== */}
      {activeTab === 'companies' && (
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-400" />
                <span>Empresas Clientes & Contas</span>
              </h2>
              <p className="text-xs text-slate-400">
                Cadastre empresas reais, defina planos, gere links de convite e acompanhe o estado de cada conta.
              </p>
            </div>
            <button
              onClick={handleOpenCreateCompany}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:brightness-110 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Empresa</span>
            </button>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome da empresa, e-mail ou CNPJ..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Ativas</option>
                <option value="trial">Em Teste</option>
                <option value="pending">Pendentes</option>
                <option value="suspended">Suspensas</option>
              </select>
            </div>
          </div>

          {/* Companies Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                  <th className="pb-3">Empresa</th>
                  <th className="pb-3">Responsável & Contato</th>
                  <th className="pb-3">Plano</th>
                  <th className="pb-3">Status da Conta</th>
                  <th className="pb-3">Pagamento</th>
                  <th className="pb-3 text-right">Ações de Governança</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredCompanies.map((c) => {
                  const planObj = plans.find((p) => p.id === c.plan);
                  return (
                    <tr key={c.id} className="hover:bg-slate-900/40">
                      <td className="py-3.5">
                        <div className="font-semibold text-white">{c.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {c.cnpj ? `CNPJ: ${c.cnpj}` : c.industry || 'Geral'}
                        </div>
                      </td>

                      <td className="py-3.5">
                        <div className="text-slate-200">{c.contactName || 'Não informado'}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {c.contactEmail || c.phone || 'Sem contato'}
                        </div>
                      </td>

                      <td className="py-3.5 font-mono">
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-slate-800 text-cyan-300 border border-slate-700">
                          {planObj?.name || c.plan.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5">
                        {c.status === 'active' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Ativa
                          </span>
                        )}
                        {c.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pendente
                          </span>
                        )}
                        {c.status === 'suspended' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30">
                            Suspensa
                          </span>
                        )}
                        {c.status === 'trial' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
                            Em Teste
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 font-mono text-[11px]">
                        {c.paymentStatus ? (
                          <span className="text-slate-300">{c.paymentStatus}</span>
                        ) : (
                          <span className="text-slate-500">Sem histórico</span>
                        )}
                      </td>

                      <td className="py-3.5 text-right space-x-1 font-mono">
                        <button
                          onClick={() => handleGenerateInvite(c)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="Gerar / Copiar Link de Convite"
                        >
                          <Send className="w-3 h-3" />
                          <span>Convite</span>
                        </button>

                        <button
                          onClick={() => handleOpenEditCompany(c)}
                          className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] inline-flex items-center gap-1 cursor-pointer"
                          title="Editar Dados da Empresa"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Editar</span>
                        </button>

                        {c.status === 'suspended' ? (
                          <button
                            onClick={() => handleToggleCompanyStatus(c, 'active')}
                            className="px-2 py-1 rounded bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-400 text-[11px] inline-flex items-center gap-1 cursor-pointer border border-emerald-500/30"
                            title="Reativar Conta"
                          >
                            <Check className="w-3 h-3" />
                            <span>Reativar</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleCompanyStatus(c, 'suspended')}
                            className="px-2 py-1 rounded bg-rose-950/40 hover:bg-rose-900/60 text-rose-400 text-[11px] inline-flex items-center gap-1 cursor-pointer border border-rose-500/30"
                            title="Suspender Acesso"
                          >
                            <Ban className="w-3 h-3" />
                            <span>Suspender</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: GERENCIAR PLANOS                                     */}
      {/* ========================================================== */}
      {activeTab === 'plans' && (
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-purple-400" />
                <span>Gerenciador Completo de Planos Comerciais</span>
              </h2>
              <p className="text-xs text-slate-400">
                Crie novos planos sem limite artificial, ajuste preços, quotas de leads/IA, módulos liberados e capítulos do manual.
              </p>
            </div>
            <button
              onClick={handleOpenCreatePlan}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer shadow-md hover:brightness-110 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Criar Novo Plano</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isArchived = (p as any).status === 'archived';
              return (
                <div
                  key={p.id}
                  className={`rounded-2xl p-5 border flex flex-col justify-between transition-all relative ${
                    isArchived
                      ? 'bg-slate-950/60 border-slate-800 opacity-60'
                      : p.popular
                      ? 'bg-purple-950/20 border-purple-500/50 shadow-[0_0_20px_rgba(168,85,247,0.15)]'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-white text-base">{p.name}</h3>
                      <div className="flex items-center gap-1">
                        {isArchived && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                            Arquivado
                          </span>
                        )}
                        {p.popular && !isArchived && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                            Destaque
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 min-h-[32px]">{p.description}</p>

                    <div className="p-3 rounded-xl bg-[#080d1a] border border-slate-800 space-y-1 font-mono">
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-400 text-xs">Mensal:</span>
                        <span className="text-lg font-bold text-emerald-400">R$ {p.priceMonthly},00</span>
                      </div>
                      <div className="flex justify-between items-baseline">
                        <span className="text-slate-500 text-[11px]">Anual:</span>
                        <span className="text-xs text-slate-300">R$ {p.priceYearly},00</span>
                      </div>
                    </div>

                    {/* Limits & Quotas */}
                    <div className="text-[11px] font-mono text-slate-300 space-y-1 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Leads:</span>
                        <span className="font-bold text-white">{p.leadsLimit.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Créditos IA:</span>
                        <span className="font-bold text-cyan-400">{p.aiCredits.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Empresas Vinculadas:</span>
                        <span className="font-bold text-amber-400">
                          {p.companiesCount || companies.filter((c) => c.plan === p.id).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Capítulos Manual:</span>
                        <span className="font-bold text-slate-300">
                          {p.manualChapters?.includes('all') ? 'Todos (100%)' : p.manualChapters?.join(', ') || 'Básico'}
                        </span>
                      </div>
                    </div>

                    {/* Features preview */}
                    <div className="text-[11px] text-slate-400 space-y-1 pt-1">
                      <span className="text-[10px] font-mono uppercase text-slate-500 block">Benefícios:</span>
                      {p.features.slice(0, 3).map((f, i) => (
                        <div key={i} className="flex items-center gap-1.5 text-slate-300 truncate">
                          <Check className="w-3 h-3 text-cyan-400 shrink-0" />
                          <span className="truncate">{f}</span>
                        </div>
                      ))}
                      {p.features.length > 3 && (
                        <span className="text-[10px] text-slate-500 font-mono">
                          +{p.features.length - 3} outros benefícios
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenEditPlan(p)}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Editar</span>
                    </button>

                    {!isArchived && (
                      <button
                        onClick={() => handleArchivePlan(p)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 border border-slate-700 cursor-pointer transition-colors"
                        title="Arquivar plano"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: AUDITORIA DE TRANSAÇÕES PIX & LIBERAÇÃO MANUAL      */}
      {/* ========================================================== */}
      {activeTab === 'payments' && (
        <PixAuditManager
          payments={payments}
          onPaymentUpdated={loadData}
          onNavigateToAuditLogs={() => setActiveTab('audit')}
        />
      )}

      {/* ========================================================== */}
      {/* TAB 5: AUDITORIA & SEGURANÇA                               */}
      {/* ========================================================== */}
      {activeTab === 'audit' && (
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-cyan-400" />
            <span>Trilha de Auditoria & Governança (Últimos Eventos)</span>
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                  <th className="pb-3">Data / Hora</th>
                  <th className="pb-3">Autor</th>
                  <th className="pb-3">Papel</th>
                  <th className="pb-3">Ação</th>
                  <th className="pb-3">IP</th>
                  <th className="pb-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 text-slate-200 font-mono text-[11px]">{log.actorEmail}</td>
                    <td className="py-3 font-mono text-[10px]">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 uppercase">
                        {log.actorRole}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[11px] text-amber-300 font-semibold">{log.action}</td>
                    <td className="py-3 text-slate-500 font-mono text-[11px]">{log.ipAddress}</td>
                    <td className="py-3 text-slate-300 text-xs">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: CADASTRO / EDIÇÃO DE EMPRESA                        */}
      {/* ========================================================== */}
      {showCompanyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-cyan-500/40 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            <button
              onClick={() => setShowCompanyModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <span>{editingComp ? 'Editar Empresa' : 'Cadastrar Empresa Real'}</span>
            </h2>

            {generatedInviteUrl ? (
              <div className="p-5 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 space-y-3 text-center">
                <CheckCircle2 className="w-10 h-10 text-cyan-400 mx-auto" />
                <h3 className="font-bold text-sm text-white">Link de Convite Gerado com Sucesso!</h3>
                <p className="text-xs text-slate-300">
                  Envie o link abaixo para o responsável da empresa definir sua senha de acesso com segurança:
                </p>
                <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl font-mono text-cyan-300 break-all select-all text-xs">
                  {generatedInviteUrl}
                </div>
                <div className="flex justify-center gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(generatedInviteUrl);
                      showNotification('Link copiado para a área de transferência!');
                    }}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold flex items-center gap-1.5 cursor-pointer text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCompanyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveCompany} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Nome Comercial da Empresa *
                    </label>
                    <input
                      type="text"
                      required
                      value={compForm.name}
                      onChange={(e) => setCompForm({ ...compForm, name: e.target.value })}
                      placeholder="Ex: Alfa Logística e Transportes Ltda"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Nome do Responsável
                    </label>
                    <input
                      type="text"
                      value={compForm.contactName}
                      onChange={(e) => setCompForm({ ...compForm, contactName: e.target.value })}
                      placeholder="Ex: Carlos Eduardo"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      E-mail do Responsável *
                    </label>
                    <input
                      type="email"
                      required={compForm.sendInvite}
                      value={compForm.contactEmail}
                      onChange={(e) => setCompForm({ ...compForm, contactEmail: e.target.value })}
                      placeholder="carlos@empresa.com.br"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      value={compForm.phone}
                      onChange={(e) => setCompForm({ ...compForm, phone: e.target.value })}
                      placeholder="+55 (11) 98765-4321"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      CNPJ
                    </label>
                    <input
                      type="text"
                      value={compForm.cnpj}
                      onChange={(e) => setCompForm({ ...compForm, cnpj: e.target.value })}
                      placeholder="00.000.000/0001-00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Plano Associado *
                    </label>
                    <select
                      value={compForm.plan}
                      onChange={(e) => setCompForm({ ...compForm, plan: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      {plans.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (R$ {p.priceMonthly}/mês)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono text-slate-400 mb-1">
                      Status da Conta *
                    </label>
                    <select
                      value={compForm.status}
                      onChange={(e) => setCompForm({ ...compForm, status: e.target.value as CompanyStatus })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                    >
                      <option value="active">Ativa (Liberada)</option>
                      <option value="pending">Pendente (Aguardando Pagamento)</option>
                      <option value="trial">Em Teste</option>
                      <option value="suspended">Suspensa</option>
                    </select>
                  </div>
                </div>

                {!editingComp && (
                  <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-300 text-xs">
                      <input
                        type="checkbox"
                        checked={compForm.sendInvite}
                        onChange={(e) => setCompForm({ ...compForm, sendInvite: e.target.checked })}
                        className="rounded border-slate-700 text-cyan-500 focus:ring-0"
                      />
                      <span>Gerar Link de Convite Seguro (o cliente define sua própria senha)</span>
                    </label>

                    {!compForm.sendInvite && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-mono text-slate-400 mb-1">
                          Ou definir Senha Provisória:
                        </label>
                        <input
                          type="password"
                          value={compForm.initialPassword}
                          onChange={(e) => setCompForm({ ...compForm, initialPassword: e.target.value })}
                          placeholder="Mínimo 8 dígitos"
                          className="w-full px-3 py-2 rounded-xl bg-[#080d1a] border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
                        />
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCompanyModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs cursor-pointer shadow-md hover:brightness-110"
                  >
                    {editingComp ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: CRIAR / EDITAR PLANO COMERCIAL                      */}
      {/* ========================================================== */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-purple-500/40 rounded-3xl w-full max-w-xl p-6 sm:p-7 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto custom-scrollbar relative">
            <button
              onClick={() => setShowPlanModal(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-purple-400" />
              <span>{editingPlan ? `Editar Plano: ${editingPlan.name}` : 'Criar Novo Plano Comercial'}</span>
            </h2>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Nome do Plano *
                  </label>
                  <input
                    type="text"
                    required
                    value={planForm.name || ''}
                    onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                    placeholder="Ex: Scale Growth"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Preço Mensal (R$) *
                  </label>
                  <input
                    type="number"
                    required
                    value={planForm.priceMonthly || 0}
                    onChange={(e) => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Preço Anual com Desconto (R$)
                  </label>
                  <input
                    type="number"
                    value={planForm.priceYearly || 0}
                    onChange={(e) => setPlanForm({ ...planForm, priceYearly: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Periodicidade / Tipo
                  </label>
                  <select
                    value={planForm.periodicity || 'monthly'}
                    onChange={(e) => setPlanForm({ ...planForm, periodicity: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500 font-mono"
                  >
                    <option value="monthly">Mensal</option>
                    <option value="yearly">Anual</option>
                    <option value="trial">Experimental</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Descrição Curta
                  </label>
                  <textarea
                    rows={2}
                    value={planForm.description || ''}
                    onChange={(e) => setPlanForm({ ...planForm, description: e.target.value })}
                    placeholder="Para empresas que buscam aceleração de leads e automações robustas."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Limite de Leads
                  </label>
                  <input
                    type="number"
                    value={planForm.leadsLimit || 0}
                    onChange={(e) => setPlanForm({ ...planForm, leadsLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Créditos de IA
                  </label>
                  <input
                    type="number"
                    value={planForm.aiCredits || 0}
                    onChange={(e) => setPlanForm({ ...planForm, aiCredits: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Limite de Automações Ativas
                  </label>
                  <input
                    type="number"
                    value={planForm.automationsLimit || 0}
                    onChange={(e) => setPlanForm({ ...planForm, automationsLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Usuários Permitidos
                  </label>
                  <input
                    type="number"
                    value={planForm.usersLimit || 0}
                    onChange={(e) => setPlanForm({ ...planForm, usersLimit: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono"
                  />
                </div>
              </div>

              {/* Manual Chapters selection */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-mono text-slate-300 font-semibold">
                  Capítulos do Manual Liberados:
                </label>
                <div className="flex flex-wrap gap-2 text-xs">
                  {['all', 'cap-1', 'cap-2', 'cap-3', 'cap-4', 'cap-5'].map((chap) => {
                    const isSelected = planForm.manualChapters?.includes(chap);
                    return (
                      <button
                        key={chap}
                        type="button"
                        onClick={() => {
                          let list = planForm.manualChapters ? [...planForm.manualChapters] : [];
                          if (chap === 'all') {
                            list = isSelected ? ['cap-1'] : ['all'];
                          } else {
                            list = list.filter((x) => x !== 'all');
                            if (isSelected) {
                              list = list.filter((x) => x !== chap);
                            } else {
                              list.push(chap);
                            }
                          }
                          setPlanForm({ ...planForm, manualChapters: list });
                        }}
                        className={`px-2.5 py-1 rounded-lg font-mono text-[11px] transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-purple-600 text-white font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {chap === 'all' ? 'Todos os Capítulos (Integral)' : `Capítulo ${chap.replace('cap-', '')}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Features List */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <label className="block text-[11px] font-mono text-slate-300 font-semibold">
                  Benefícios & Recursos Inclusos:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={featureInput}
                    onChange={(e) => setFeatureInput(e.target.value)}
                    placeholder="Novo benefício..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-[#080d1a] border border-slate-800 text-white text-xs focus:outline-none focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddFeature}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {planForm.features?.map((f, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 rounded-lg bg-slate-800 text-slate-200 text-[11px] flex items-center gap-1.5"
                    >
                      <span>{f}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFeature(i)}
                        className="text-slate-400 hover:text-rose-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Flags */}
              <div className="flex items-center gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(planForm.popular)}
                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                    className="rounded border-slate-700 text-purple-500"
                  />
                  <span>Destacar como "Mais Escolhido"</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={planForm.status === 'active'}
                    onChange={(e) => setPlanForm({ ...planForm, status: e.target.checked ? 'active' : 'inactive' })}
                    className="rounded border-slate-700 text-purple-500"
                  />
                  <span>Plano Ativo para Contratação</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold text-xs cursor-pointer shadow-md hover:brightness-110"
                >
                  {editingPlan ? 'Atualizar Plano' : 'Criar Plano'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL: CONFERÊNCIA & DECISÃO DE PAGAMENTO                  */}
      {/* ========================================================== */}
      {reviewingPayment && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-cyan-500/40 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 text-xs relative">
            <button
              onClick={() => setReviewingPayment(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-cyan-400" />
              <span>Conferir & Decidir Ativação de Pagamento</span>
            </h2>

            <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-400">Empresa:</span>
                <span className="text-white font-bold">{reviewingPayment.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Responsável:</span>
                <span className="text-slate-200">{reviewingPayment.userName} ({reviewingPayment.userEmail})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Plano Pretendido:</span>
                <span className="text-cyan-400 font-bold">{reviewingPayment.planName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Valor Esperado:</span>
                <span className="text-emerald-400 font-bold text-sm">R$ {reviewingPayment.amount},00</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-1 text-[11px]">
                <span className="text-slate-500">Chave Pix Utilizada:</span>
                <span className="text-slate-300">11973479473 (Alifer Madeiro)</span>
              </div>
            </div>

            {/* Receipt Details Box */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
              <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider block font-semibold">
                Comprovante / Código Informado pelo Cliente:
              </span>
              <p className="font-mono text-xs text-white break-all bg-black/40 p-2 rounded-lg border border-cyan-500/20 select-all">
                {reviewingPayment.receiptDetails || 'Cliente não digitou código específico.'}
              </p>
              {reviewingPayment.customerNotes && (
                <p className="text-[11px] text-slate-300 italic pt-1">
                  Nota do cliente: "{reviewingPayment.customerNotes}"
                </p>
              )}
            </div>

            {/* Decision Notes */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Anotações do Administrador (Opcional ou Motivo de Recusa):
              </label>
              <textarea
                rows={2}
                value={adminReviewNotes}
                onChange={(e) => setAdminReviewNotes(e.target.value)}
                placeholder="Ex: Pagamento conferido no extrato bancário às 15:10."
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={processingDecision}
                onClick={() => handleDecidePayment('RECUSADO')}
                className="px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/40 font-semibold text-xs cursor-pointer disabled:opacity-50"
              >
                Recusar Pagamento
              </button>

              <button
                type="button"
                disabled={processingDecision}
                onClick={() => handleDecidePayment('APROVADO')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs cursor-pointer shadow-lg hover:brightness-110 flex items-center gap-1.5 disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>APROVAR & LIBERAR PLANO</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
