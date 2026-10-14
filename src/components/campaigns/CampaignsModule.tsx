import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Eye,
  CheckCircle2,
  PauseCircle,
  PlayCircle,
  Link2,
  Trash2,
  Edit2,
  Filter,
  Search,
  Sparkles,
  Info,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';
import { Campaign, CampaignStatus } from '../../types';

interface CampaignsModuleProps {
  onNavigate: (section: string) => void;
}

export const CampaignsModule: React.FC<CampaignsModuleProps> = ({ onNavigate }) => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | CampaignStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [editingCamp, setEditingCamp] = useState<Campaign | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [platform, setPlatform] = useState('Meta Ads');
  const [objective, setObjective] = useState('Geração de Leads');
  const [status, setStatus] = useState<CampaignStatus>('planning');
  const [budget, setBudget] = useState(5000);
  const [spent, setSpent] = useState(0);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
  const [targetAudience, setTargetAudience] = useState('');
  const [creativeNotes, setCreativeNotes] = useState('');

  // Performance metrics manual update
  const [impressions, setImpressions] = useState(0);
  const [clicks, setClicks] = useState(0);
  const [conversions, setConversions] = useState(0);
  const [cpa, setCpa] = useState(0);
  const [roi, setRoi] = useState(0);

  // Connect platform form
  const [adPlatformName, setAdPlatformName] = useState('Meta Ads');
  const [adAccountId, setAdAccountId] = useState('act_1982348123');
  const [connectSuccess, setConnectSuccess] = useState<string | null>(null);

  const loadCampaigns = async () => {
    setLoading(true);
    try {
      const data = await api.campaigns.getCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  const openCreateModal = () => {
    setEditingCamp(null);
    setName('');
    setPlatform('Meta Ads');
    setObjective('Geração de Leads Qualificados');
    setStatus('planning');
    setBudget(6000);
    setSpent(0);
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setTargetAudience('Empresários e Tomadores de Decisão');
    setCreativeNotes('Vídeo demonstrativo com foco em economia de tempo');
    setImpressions(0);
    setClicks(0);
    setConversions(0);
    setCpa(0);
    setRoi(0);
    setCreateModalOpen(true);
  };

  const openEditModal = (camp: Campaign) => {
    setEditingCamp(camp);
    setName(camp.name);
    setPlatform(camp.platform);
    setObjective(camp.objective);
    setStatus(camp.status);
    setBudget(camp.budget);
    setSpent(camp.spent);
    setStartDate(camp.startDate);
    setEndDate(camp.endDate);
    setTargetAudience(camp.targetAudience);
    setCreativeNotes(camp.creativeNotes);
    setImpressions(camp.impressions);
    setClicks(camp.clicks);
    setConversions(camp.conversions);
    setCpa(camp.cpa);
    setRoi(camp.roi);
    setCreateModalOpen(true);
  };

  const handleSaveCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    try {
      if (editingCamp) {
        const updated = await api.campaigns.updateCampaign(editingCamp.id, {
          name,
          platform,
          objective,
          status,
          budget,
          spent,
          startDate,
          endDate,
          targetAudience,
          creativeNotes,
          impressions,
          clicks,
          conversions,
          cpa,
          roi,
        });
        setCampaigns(campaigns.map((c) => (c.id === updated.id ? updated : c)));
      } else {
        const created = await api.campaigns.createCampaign({
          name,
          platform,
          objective,
          status,
          budget,
          spent,
          startDate,
          endDate,
          targetAudience,
          creativeNotes,
        });
        setCampaigns([created, ...campaigns]);
      }
      setCreateModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar campanha: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta campanha?')) return;
    try {
      await api.campaigns.deleteCampaign(id);
      setCampaigns(campaigns.filter((c) => c.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleToggleStatus = async (camp: Campaign) => {
    const nextStatus: CampaignStatus = camp.status === 'active' ? 'paused' : 'active';
    try {
      const updated = await api.campaigns.updateCampaign(camp.id, { status: nextStatus });
      setCampaigns(campaigns.map((c) => (c.id === updated.id ? updated : c)));
    } catch (err: any) {
      alert('Erro ao alterar status: ' + err.message);
    }
  };

  const handleConnectPlatform = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.campaigns.connectPlatform({
        platformName: adPlatformName,
        accountId: adAccountId,
      });
      setConnectSuccess(res.message);
      setTimeout(() => {
        setConnectSuccess(null);
        setConnectModalOpen(false);
      }, 2000);
    } catch (err: any) {
      alert('Erro ao conectar: ' + err.message);
    }
  };

  // Aggregated totals
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalSpent = campaigns.reduce((acc, c) => acc + (c.spent || 0), 0);
  const totalConversions = campaigns.reduce((acc, c) => acc + (c.conversions || 0), 0);
  const avgCpa =
    totalConversions > 0 ? (totalSpent / totalConversions).toFixed(2) : '0.00';

  const filteredCampaigns = campaigns.filter((c) => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch =
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.platform.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Megaphone className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Publicidade & Campanhas</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              ROI & Métricas Reais
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão de anúncios no Meta Ads, Google Ads e LinkedIn Ads com dados declarados e relatórios de eficiência.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setConnectModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Link2 className="w-3.5 h-3.5" />
            <span>Conectar Conta de Anúncios</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Campanha</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Orçamento Total Planejado</span>
          <p className="text-xl font-bold text-white font-mono mt-1">R$ {totalBudget.toLocaleString('pt-BR')}</p>
          <span className="text-[10px] text-slate-500 font-mono mt-2 block">Todas as campanhas cadastradas</span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Investimento Efetivo (Gasto)</span>
          <p className="text-xl font-bold text-cyan-400 font-mono mt-1">R$ {totalSpent.toLocaleString('pt-BR')}</p>
          <span className="text-[10px] text-emerald-400 font-mono mt-2 block">
            {totalBudget > 0 ? `${Math.round((totalSpent / totalBudget) * 100)}% do planejado consumido` : '0%'}
          </span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">Total de Conversões / Leads</span>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-1">{totalConversions}</p>
          <span className="text-[10px] text-slate-500 font-mono mt-2 block">Resultados diretos mensurados</span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md">
          <span className="text-xs text-slate-400 font-medium">CPA Médio (Custo por Lead)</span>
          <p className="text-xl font-bold text-purple-400 font-mono mt-1">R$ {avgCpa}</p>
          <span className="text-[10px] text-slate-500 font-mono mt-2 block">Custo por aquisição medido</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-1 text-xs">
          {[
            { id: 'all', label: 'Todas' },
            { id: 'active', label: 'Ativas' },
            { id: 'paused', label: 'Pausadas' },
            { id: 'planning', label: 'Em Planejamento' },
            { id: 'completed', label: 'Concluídas' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-blue-600/30 text-cyan-300 border border-blue-500/40 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar campanha ou canal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#080d1a] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none w-56 focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Campaigns Cards List */}
      {filteredCampaigns.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0c1220]/70 border border-slate-800 text-center text-slate-500 text-xs">
          Nenhuma campanha encontrada para este filtro.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCampaigns.map((camp) => {
            const statusBadge =
              camp.status === 'active'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : camp.status === 'paused'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                : camp.status === 'planning'
                ? 'bg-blue-500/20 text-cyan-400 border-blue-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700';

            const budgetPercent =
              camp.budget > 0 ? Math.min(100, Math.round((camp.spent / camp.budget) * 100)) : 0;

            return (
              <div
                key={camp.id}
                className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md space-y-4 hover:border-slate-700 transition-all"
              >
                {/* Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                        {camp.platform}
                      </span>
                      <h3 className="font-bold text-sm text-white">{camp.name}</h3>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${statusBadge}`}>
                        {camp.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Objetivo: <span className="text-slate-200">{camp.objective}</span> • Período:{' '}
                      <span className="font-mono">{camp.startDate} a {camp.endDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleStatus(camp)}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-300 flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      {camp.status === 'active' ? (
                        <>
                          <PauseCircle className="w-3.5 h-3.5 text-amber-400" />
                          <span>Pausar</span>
                        </>
                      ) : (
                        <>
                          <PlayCircle className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Ativar</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => openEditModal(camp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Editar Campanha / Atualizar Métricas"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(camp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Metrics Breakdown Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs font-mono">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Orçamento</span>
                    <span className="font-semibold text-white">R$ {camp.budget.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Gasto Efetivo</span>
                    <span className="font-semibold text-cyan-400">R$ {camp.spent.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Impressões</span>
                    <span className="font-semibold text-slate-300">{camp.impressions.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Cliques</span>
                    <span className="font-semibold text-slate-300">{camp.clicks.toLocaleString('pt-BR')}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Conversões</span>
                    <span className="font-semibold text-emerald-400">{camp.conversions}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">CPA / ROI</span>
                    <span className="font-semibold text-purple-400">R$ {camp.cpa} • {camp.roi}x</span>
                  </div>
                </div>

                {/* Budget Progress Bar & Creative details */}
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Consumo do Orçamento: {budgetPercent}%</span>
                    <span>
                      R$ {camp.spent.toLocaleString('pt-BR')} de R$ {camp.budget.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${budgetPercent}%` }}
                      className="h-full rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-400"
                    />
                  </div>
                </div>

                {camp.creativeNotes && (
                  <p className="text-[11px] text-slate-400 italic">
                    Criativo / Oferta: {camp.creativeNotes}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Campaign Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-base font-bold text-white mb-1">
              {editingCamp ? 'Editar Campanha & Métricas' : 'Cadastrar Nova Campanha'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Informe os dados de planejamento e preencha ou atualize as métricas reais.
            </p>

            <form onSubmit={handleSaveCampaign} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Nome da Campanha</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Escala B2B Meta Ads Q4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Canal / Plataforma</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none"
                  >
                    <option value="Meta Ads">Meta Ads (Facebook & Instagram)</option>
                    <option value="Google Ads">Google Ads (Search & Performance Max)</option>
                    <option value="LinkedIn Ads">LinkedIn Ads (B2B)</option>
                    <option value="TikTok Ads">TikTok Ads</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Status Atual</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none"
                  >
                    <option value="planning">Em Planejamento</option>
                    <option value="active">Ativa (Rodando)</option>
                    <option value="paused">Pausada</option>
                    <option value="completed">Concluída</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Objetivo Comercial</label>
                <input
                  type="text"
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                  placeholder="Ex: Geração de Leads Qualificados"
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Orçamento Planejado (R$)</label>
                  <input
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Valor Já Gasto (R$)</label>
                  <input
                    type="number"
                    value={spent}
                    onChange={(e) => setSpent(Number(e.target.value))}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              {/* Metrics update section */}
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <span className="text-[10px] font-mono uppercase text-cyan-400 block font-semibold">
                  Métricas Reais de Desempenho
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400">Impressões</label>
                    <input
                      type="number"
                      value={impressions}
                      onChange={(e) => setImpressions(Number(e.target.value))}
                      className="w-full bg-[#080d1a] border border-slate-800 rounded-lg px-2 py-1 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Cliques</label>
                    <input
                      type="number"
                      value={clicks}
                      onChange={(e) => setClicks(Number(e.target.value))}
                      className="w-full bg-[#080d1a] border border-slate-800 rounded-lg px-2 py-1 text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400">Conversões</label>
                    <input
                      type="number"
                      value={conversions}
                      onChange={(e) => setConversions(Number(e.target.value))}
                      className="w-full bg-[#080d1a] border border-slate-800 rounded-lg px-2 py-1 text-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Descrição do Criativo & Oferta</label>
                <textarea
                  rows={2}
                  value={creativeNotes}
                  onChange={(e) => setCreativeNotes(e.target.value)}
                  placeholder="Detalhes dos criativos, ângulos e copies utilizadas..."
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Campanha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connect Account Modal */}
      {connectModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">Conectar Plataforma de Anúncios</h2>
            <p className="text-xs text-slate-400 mb-4">
              Vincule sua conta de anúncios autorizada no Meta Ads ou Google Ads para sincronização.
            </p>

            {connectSuccess && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{connectSuccess}</span>
              </div>
            )}

            <form onSubmit={handleConnectPlatform} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Selecione a Plataforma</label>
                <select
                  value={adPlatformName}
                  onChange={(e) => setAdPlatformName(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                >
                  <option value="Meta Ads (Facebook & Instagram)">Meta Ads</option>
                  <option value="Google Ads">Google Ads</option>
                  <option value="LinkedIn Ads">LinkedIn Ads</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium">ID da Conta de Anúncios</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: act_123456789 ou 982-123-4567"
                  value={adAccountId}
                  onChange={(e) => setAdAccountId(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-cyan-400 mt-0.5" />
                <span>
                  O NEXORA AI utiliza tokens com permissão restrita de leitura de campanhas e métricas, garantindo
                  total conformidade com as políticas das plataformas.
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setConnectModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer shadow-md"
                >
                  Salvar Conexão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
