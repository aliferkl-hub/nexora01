import React, { useState, useEffect } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Megaphone,
  PenTool,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Filter,
  Search,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  PlusCircle,
  BookOpen,
  Crown,
} from 'lucide-react';
import { api } from '../../services/api';
import { DashboardStats } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface DashboardOverviewProps {
  onNavigate: (section: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const { company, isOwner } = useAuth();
  const [data, setData] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodFilter, setPeriodFilter] = useState<'30d' | '90d' | 'year'>('30d');
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const stats = await api.dashboard.getStats();
      setData(stats);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar dados do painel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [company?.id]);

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs font-mono">Carregando inteligência de dados do NEXORA AI...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300 max-w-xl mx-auto text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="font-semibold text-white">Falha ao sincronizar métricas</h3>
          <p className="text-xs text-rose-300">{error || 'Dados indisponíveis no momento.'}</p>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium inline-flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tentar Novamente</span>
          </button>
        </div>
      </div>
    );
  }

  const { kpis, funnelStages, leadEvolution, recentLeads, activeCampaignsList } = data;

  const filteredRecentLeads = recentLeads.filter(
    (l) =>
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.companyName && l.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Banner / Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Painel de Operações & Crescimento
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Ao Vivo
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Métricas em tempo real para <span className="text-slate-200 font-medium">{company?.name}</span> • Plano{' '}
            <span className="uppercase text-cyan-400 font-mono font-semibold">{company?.plan}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Period filter buttons */}
          <div className="bg-[#0b1120] p-1 rounded-xl border border-slate-800 flex text-xs">
            <button
              onClick={() => setPeriodFilter('30d')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                periodFilter === '30d' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              30 dias
            </button>
            <button
              onClick={() => setPeriodFilter('90d')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                periodFilter === '90d' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              90 dias
            </button>
            <button
              onClick={() => setPeriodFilter('year')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                periodFilter === 'year' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Este Ano
            </button>
          </div>

          <button
            onClick={() => onNavigate('ai-hub')}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-xs shadow-[0_0_15px_rgba(59,130,246,0.25)] hover:brightness-110 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span className="hidden sm:inline">Nova Ação com IA</span>
          </button>
        </div>
      </div>

      {/* Quick Access to Growth Manual */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0d162d] to-purple-950/30 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-white">Manual de Crescimento Empresarial</span>
              {isOwner ? (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-semibold">
                  <Crown className="w-2.5 h-2.5" />
                  <span>Acesso Livre Master • Alifer Madeiro</span>
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                  Metodologia & Diagramas
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Arquitetura de escala com IA, funis preditivos, comandos prontos para copiar e checklists de implementação.
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigate('manual')}
          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shrink-0 cursor-pointer"
        >
          <span>Abrir Manual</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Primary Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Pipeline Total */}
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Pipeline Comercial Ativo</span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-cyan-400 border border-blue-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">
              R$ {kpis.pipelineValue.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span className="text-emerald-400 font-medium flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> Fechado: R$ {kpis.wonValue.toLocaleString('pt-BR')}
            </span>
            <span className="font-mono text-slate-500">Taxa: {kpis.conversionRate}</span>
          </div>
        </div>

        {/* KPI 2: Total Leads */}
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md group hover:border-indigo-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Total de Oportunidades</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{kpis.totalLeads}</span>
            <span className="text-xs text-cyan-400 font-medium">({kpis.newLeads} novos)</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span>Classificados por IA</span>
            <button
              onClick={() => onNavigate('crm')}
              className="text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-0.5"
            >
              <span>Ver CRM</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* KPI 3: Publicidade & Tráfego */}
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md group hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Campanhas Ativas</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Megaphone className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{kpis.activeCampaigns}</span>
            <span className="text-xs text-slate-400">em veiculação</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span>Gasto: R$ {kpis.totalSpent.toLocaleString('pt-BR')}</span>
            <span className="text-emerald-400 font-medium">{kpis.totalConversions} conversões</span>
          </div>
        </div>

        {/* KPI 4: Automações */}
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-5 relative overflow-hidden backdrop-blur-md group hover:border-cyan-500/40 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-medium">Automações n8n & Make</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-white font-mono">{kpis.totalAutomationsRun}</span>
            <span className="text-xs text-emerald-400 font-medium">execuções</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span>{kpis.activeAutomations} ativas</span>
            <span className="text-rose-400">{kpis.totalAutomationsFailed} falhas</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Visual Intelligence */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Pipeline Evolution Graphic */}
        <div className="lg:col-span-2 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-base font-bold text-white">Evolução do Pipeline & Captação</h2>
              <p className="text-xs text-slate-400">Crescimento mensal de novas oportunidades comerciais</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-500 inline-block" />
                <span className="text-slate-300">Pipeline (R$)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-cyan-400 inline-block" />
                <span className="text-slate-300">Qtd. Leads</span>
              </div>
            </div>
          </div>

          {/* Clean SVG Interactive Chart */}
          <div className="h-64 flex items-end gap-4 pt-4 pb-2 px-2 border-b border-slate-800">
            {leadEvolution.map((item) => {
              const maxPipeline = Math.max(...leadEvolution.map((x) => x.pipeline), 1);
              const heightPercent = item.pipeline > 0 ? Math.max(8, Math.round((item.pipeline / maxPipeline) * 100)) : 0;

              return (
                <div key={item.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] bg-slate-900 border border-slate-700 px-2 py-1 rounded text-white font-mono pointer-events-none mb-1 text-center whitespace-nowrap shadow-lg">
                    R$ {item.pipeline.toLocaleString('pt-BR')} • {item.leads} leads
                  </div>
                  <div className="w-full max-w-[48px] bg-slate-800/40 rounded-t-lg overflow-hidden flex flex-col justify-end h-full">
                    {heightPercent > 0 ? (
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className="w-full bg-gradient-to-t from-blue-600 via-indigo-600 to-cyan-400 rounded-t-lg transition-all duration-500 group-hover:brightness-125"
                      />
                    ) : (
                      <div className="w-full h-1 bg-slate-800 rounded-full" />
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 mt-2">{item.month}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 mt-4">
            {kpis.totalLeads > 0 ? (
              <span className="flex items-center gap-1 text-emerald-400 font-medium">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Dados reais apurados do pipeline comercial</span>
              </span>
            ) : (
              <span className="text-slate-500 text-[11px]">
                Nenhum lead cadastrado ainda no período selecionado.
              </span>
            )}
            <button
              onClick={() => onNavigate('reports')}
              className="text-cyan-400 hover:underline text-xs flex items-center gap-1"
            >
              <span>Ver relatório completo</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right Col: Funnel Stage Distribution */}
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-white">Funil Comercial</h2>
              <button
                onClick={() => onNavigate('crm')}
                className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
              >
                Abrir Kanban
              </button>
            </div>

            <div className="space-y-3">
              {[
                { label: 'Novo Lead', count: funnelStages.new, color: 'bg-slate-500' },
                { label: 'Contato Realizado', count: funnelStages.contact, color: 'bg-blue-400' },
                { label: 'Qualificado', count: funnelStages.qualified, color: 'bg-cyan-400' },
                { label: 'Proposta Enviada', count: funnelStages.proposal, color: 'bg-indigo-400' },
                { label: 'Em Negociação', count: funnelStages.negotiation, color: 'bg-purple-400' },
                { label: 'Fechado / Ganho', count: funnelStages.closed_won, color: 'bg-emerald-400' },
              ].map((stage) => {
                const total = Math.max(kpis.totalLeads, 1);
                const pct = Math.round((stage.count / total) * 100);

                return (
                  <div key={stage.label}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-300">{stage.label}</span>
                      <span className="font-mono text-slate-400">
                        {stage.count} ({pct}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full ${stage.color} transition-all duration-500`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 mt-6 text-xs text-blue-200">
            <div className="flex items-center gap-2 font-semibold text-white mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Dica da Inteligência Artificial:</span>
            </div>
            <span>
              {funnelStages.negotiation > 0
                ? `${funnelStages.negotiation} oportunidade(s) em negociação requerem fechamento nos próximos 3 dias.`
                : 'Mova leads qualificados para a fase de proposta para acelerar o ciclo de vendas.'}
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Leads Table & Quick Action AI Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Leads Table */}
        <div className="lg:col-span-2 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Últimas Oportunidades Cadastradas</h2>
              <p className="text-xs text-slate-400">Classificação inteligente e próximos passos</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filtrar lead..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-1 text-xs text-white placeholder-slate-500 outline-none w-40 focus:border-cyan-500"
                />
              </div>

              <button
                onClick={() => onNavigate('crm')}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Novo Lead</span>
              </button>
            </div>
          </div>

          {filteredRecentLeads.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-xs">
              {recentLeads.length === 0
                ? 'Nenhum lead cadastrado ainda nesta empresa. Clique em "+ Novo Lead" para começar.'
                : 'Nenhum lead encontrado com o termo digitado.'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-medium">
                    <th className="pb-2">Contato / Empresa</th>
                    <th className="pb-2">Fase</th>
                    <th className="pb-2">Valor Estimado</th>
                    <th className="pb-2">Pontuação IA</th>
                    <th className="pb-2 text-right">Próxima Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredRecentLeads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-3">
                        <p className="font-semibold text-white">{lead.name}</p>
                        <p className="text-[11px] text-slate-400">{lead.companyName || lead.email}</p>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-cyan-400 border border-blue-500/20 uppercase">
                          {lead.stage.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 font-mono font-medium text-slate-200">
                        R$ {lead.opportunityValue.toLocaleString('pt-BR')}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              lead.aiScore >= 80
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            {lead.aiScore}/100
                          </span>
                        </div>
                      </td>
                      <td className="py-3 text-right text-slate-300">
                        <p className="text-xs truncate max-w-[180px] ml-auto">{lead.nextAction}</p>
                        <span className="text-[10px] text-slate-500">{lead.nextActionDate}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick AI Modules Launcher */}
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Ações Rápidas de IA</span>
            </h2>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded-full border border-cyan-500/30">
              Online
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Inicie fluxos estratégicos de marketing, vendas ou automação com 1 clique usando o motor Gemini 3.8 Flash.
          </p>

          <div className="space-y-2.5">
            <button
              onClick={() => onNavigate('ai-hub')}
              className="w-full text-left p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/80 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="font-semibold text-xs text-white group-hover:text-cyan-300 transition-colors">
                  Gerar Estratégia de Crescimento Q4
                </p>
                <p className="text-[11px] text-slate-400">Planejamento de atração de clientes e canais</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('content')}
              className="w-full text-left p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/40 hover:bg-slate-800/80 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="font-semibold text-xs text-white group-hover:text-indigo-300 transition-colors">
                  Criar Posts para Redes Sociais
                </p>
                <p className="text-[11px] text-slate-400">Instagram, LinkedIn, X com copy e hashtags</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </button>

            <button
              onClick={() => onNavigate('automations')}
              className="w-full text-left p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 hover:bg-slate-800/80 transition-all flex items-center justify-between group cursor-pointer"
            >
              <div>
                <p className="font-semibold text-xs text-white group-hover:text-purple-300 transition-colors">
                  Disparar Webhook de Teste n8n
                </p>
                <p className="text-[11px] text-slate-400">Verifique a latência e o status da conexão</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition-colors" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
