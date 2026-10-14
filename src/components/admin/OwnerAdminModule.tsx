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
} from 'lucide-react';
import { api } from '../../services/api';
import { Company, User, PlanConfig, AuditLog } from '../../types';

export const OwnerAdminModule: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Subtabs
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'plans' | 'audit'>('overview');

  // Edit company modal
  const [editingComp, setEditingComp] = useState<Company | null>(null);
  const [editCompName, setEditCompName] = useState('');
  const [editCompPlan, setEditCompPlan] = useState<'starter' | 'pro' | 'business'>('starter');
  const [editCompStatus, setEditCompStatus] = useState<'active' | 'trial' | 'suspended'>('active');

  // Save plans state
  const [plansState, setPlansState] = useState<PlanConfig[]>([]);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const overview = await api.admin.getOverview();
      setMetrics(overview.metrics);
      setCompanies(overview.companies);
      setUsers(overview.users);
      setAuditLogs(overview.auditLogs);

      const plansData = await api.admin.getPlans();
      setPlans(plansData);
      setPlansState(plansData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingComp) return;

    try {
      const updated = await api.admin.updateCompany(editingComp.id, {
        name: editCompName,
        plan: editCompPlan,
        status: editCompStatus,
      });

      setCompanies(companies.map((c) => (c.id === updated.id ? updated : c)));
      setEditingComp(null);
    } catch (err: any) {
      alert('Erro ao atualizar empresa: ' + err.message);
    }
  };

  const handleSavePlans = async () => {
    try {
      const res = await api.admin.updatePlans(plansState);
      setSaveSuccess(res.message);
      setPlans(res.plans);
      setTimeout(() => setSaveSuccess(null), 3000);
    } catch (err: any) {
      alert('Erro ao salvar planos: ' + err.message);
    }
  };

  if (loading || !metrics) {
    return <div className="p-8 text-center text-slate-400 text-xs">Carregando painel do proprietário...</div>;
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Crown className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Área Administrativa do Proprietário
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Acesso Master
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão global de empresas clientes, usuários, precificação de planos comerciais e auditoria de segurança.
          </p>
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
                Master Owner
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              admin@nexora.ai • Identificador Interno: usr_owner_01 • Acesso Master Vitalício ao Manual & Governança
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Sessão Master Autenticada</span>
          </span>
        </div>
      </div>

      {/* Primary KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Empresas Cadastradas</span>
          <p className="text-2xl font-bold text-white font-mono mt-1">{metrics.totalCompanies}</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-1 block">
            {metrics.activeCompanies} ativas • {metrics.trialCompanies} em teste
          </span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Receita Mensal Estimada (MRR)</span>
          <p className="text-2xl font-bold text-amber-400 font-mono mt-1">
            R$ {metrics.estimatedMRR.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Assinaturas ativas</span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Usuários do Sistema</span>
          <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">{metrics.totalUsers}</p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Contas com autenticação</span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Leads em Toda a Base</span>
          <p className="text-2xl font-bold text-purple-400 font-mono mt-1">{metrics.totalLeadsSystemWide}</p>
          <span className="text-[10px] text-slate-500 font-mono mt-1 block">Volume multi-tenant</span>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex items-center gap-1 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-1.5 backdrop-blur-md text-xs">
        {[
          { id: 'overview', label: 'Visão Geral & Usuários' },
          { id: 'companies', label: 'Empresas Clientes' },
          { id: 'plans', label: 'Planos & Precificação' },
          { id: 'audit', label: 'Logs de Auditoria' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB: OVERVIEW & USERS */}
      {activeTab === 'overview' && (
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <h2 className="text-sm font-bold text-white">Usuários Cadastrados na Plataforma</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3">Nome</th>
                  <th className="pb-3">E-mail</th>
                  <th className="pb-3">Papel / Função</th>
                  <th className="pb-3">Empresa Associada</th>
                  <th className="pb-3 text-right">Cadastrado em</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {users.map((u) => {
                  const comp = companies.find((c) => c.id === u.companyId);

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 font-sans">
                      <td className="py-3 font-semibold text-white">{u.name}</td>
                      <td className="py-3 text-slate-300 font-mono">{u.email}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold ${
                            u.role === 'owner'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">{comp?.name || u.companyId}</td>
                      <td className="py-3 text-right text-slate-400 font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: COMPANIES */}
      {activeTab === 'companies' && (
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white">Empresas e Workspaces Clientes</h2>
            <span className="text-xs text-slate-400 font-mono">{companies.length} empresas</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-3">Nome da Empresa</th>
                  <th className="pb-3">Plano</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Segmento</th>
                  <th className="pb-3">Telefone</th>
                  <th className="pb-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {companies.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-semibold text-white">
                      <p>{c.name}</p>
                      <span className="text-[10px] text-slate-500 font-mono">ID: {c.id}</span>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-blue-500/10 text-cyan-300 border border-blue-500/20">
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase ${
                          c.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-300">{c.industry || 'Não especificado'}</td>
                    <td className="py-3 text-slate-300 font-mono">{c.phone || '-'}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setEditingComp(c);
                          setEditCompName(c.name);
                          setEditCompPlan(c.plan);
                          setEditCompStatus(c.status);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: PLANS & PRICING CONFIG */}
      {activeTab === 'plans' && (
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white">Configuração de Planos Comerciais & Limites</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Altere valores mensais, anuais e cotas de uso do sistema para cada nível de assinatura.
              </p>
            </div>

            <button
              onClick={handleSavePlans}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Alterações de Planos</span>
            </button>
          </div>

          {saveSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{saveSuccess}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plansState.map((plan, index) => (
              <div
                key={plan.id}
                className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/90 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white uppercase font-mono">{plan.name}</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    ID: {plan.id}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium">Preço Mensal (R$)</label>
                    <input
                      type="number"
                      value={plan.priceMonthly}
                      onChange={(e) => {
                        const updated = [...plansState];
                        updated[index].priceMonthly = Number(e.target.value);
                        setPlansState(updated);
                      }}
                      className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-slate-400 font-medium">Preço Anual (R$)</label>
                    <input
                      type="number"
                      value={plan.priceYearly}
                      onChange={(e) => {
                        const updated = [...plansState];
                        updated[index].priceYearly = Number(e.target.value);
                        setPlansState(updated);
                      }}
                      className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2 font-mono">
                    <div>
                      <label className="text-slate-400 text-[10px]">Limite Leads</label>
                      <input
                        type="number"
                        value={plan.leadsLimit}
                        onChange={(e) => {
                          const updated = [...plansState];
                          updated[index].leadsLimit = Number(e.target.value);
                          setPlansState(updated);
                        }}
                        className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-lg px-2 py-1 text-white text-xs outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-slate-400 text-[10px]">Automações</label>
                      <input
                        type="number"
                        value={plan.automationsLimit}
                        onChange={(e) => {
                          const updated = [...plansState];
                          updated[index].automationsLimit = Number(e.target.value);
                          setPlansState(updated);
                        }}
                        className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-lg px-2 py-1 text-white text-xs outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>Registro de Auditoria de Segurança (Audit Logs)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Rastreabilidade de login, alterações de planos e execuções críticas com registro de IP.
              </p>
            </div>
            <span className="text-xs font-mono text-slate-400">{auditLogs.length} eventos gravados</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                  <th className="pb-3">Data / Hora</th>
                  <th className="pb-3">Ação</th>
                  <th className="pb-3">Usuário</th>
                  <th className="pb-3">IP</th>
                  <th className="pb-3">Detalhes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-700 text-amber-300">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-2.5 text-slate-300">{log.actorEmail}</td>
                    <td className="py-2.5 text-slate-400">{log.ipAddress}</td>
                    <td className="py-2.5 font-sans text-slate-300 text-xs max-w-sm truncate">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingComp && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">Editar Dados da Empresa</h2>
            <p className="text-xs text-slate-400 mb-4">Atualize nome, plano e status do workspace cliente.</p>

            <form onSubmit={handleUpdateCompany} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Nome da Empresa</label>
                <input
                  type="text"
                  required
                  value={editCompName}
                  onChange={(e) => setEditCompName(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Plano Contratado</label>
                <select
                  value={editCompPlan}
                  onChange={(e) => setEditCompPlan(e.target.value as any)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro Growth</option>
                  <option value="business">Enterprise Business</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Status do Workspace</label>
                <select
                  value={editCompStatus}
                  onChange={(e) => setEditCompStatus(e.target.value as any)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="active">Ativo (Regular)</option>
                  <option value="trial">Período de Demonstração (Trial)</option>
                  <option value="suspended">Suspenso</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingComp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
