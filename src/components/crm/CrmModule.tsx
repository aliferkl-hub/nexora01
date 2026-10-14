import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  DollarSign,
  Calendar,
  Sparkles,
  Phone,
  Mail,
  Building,
  Upload,
  Download,
  Shield,
  MessageSquare,
  Clock,
  Trash2,
  Edit2,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { api } from '../../services/api';
import { Lead, LeadStage, LeadInteraction } from '../../types';

interface CrmModuleProps {
  onNavigate: (section: string) => void;
}

const STAGES: { id: LeadStage; label: string; color: string }[] = [
  { id: 'new', label: 'Novo Lead', color: 'border-slate-600' },
  { id: 'contact', label: 'Contato Realizado', color: 'border-blue-500' },
  { id: 'qualified', label: 'Qualificado', color: 'border-cyan-500' },
  { id: 'proposal', label: 'Proposta Enviada', color: 'border-indigo-500' },
  { id: 'negotiation', label: 'Em Negociação', color: 'border-purple-500' },
  { id: 'closed_won', label: 'Fechado / Ganho', color: 'border-emerald-500' },
  { id: 'closed_lost', label: 'Perdido', color: 'border-rose-500' },
];

export const CrmModule: React.FC<CrmModuleProps> = ({ onNavigate }) => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState<'all' | LeadStage>('all');

  // Modals
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [leadInteractions, setLeadInteractions] = useState<LeadInteraction[]>([]);

  // Scoring loading state
  const [scoringLeadId, setScoringLeadId] = useState<string | null>(null);

  // New lead form
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [stage, setStage] = useState<LeadStage>('new');
  const [opportunityValue, setOpportunityValue] = useState(10000);
  const [source, setSource] = useState('Website');
  const [nextAction, setNextAction] = useState('Agendar call de demonstração');
  const [nextActionDate, setNextActionDate] = useState(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [tagsStr, setTagsStr] = useState('Qualificado, B2B');

  // Interaction form
  const [interType, setInterType] = useState('call');
  const [interSummary, setInterSummary] = useState('');
  const [interNotes, setInterNotes] = useState('');

  // Import form state
  const [importText, setImportText] = useState('');
  const [importResult, setImportResult] = useState<string | null>(null);

  const loadLeads = async () => {
    setLoading(true);
    try {
      const data = await api.crm.getLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const openCreateModal = () => {
    setSelectedLead(null);
    setName('');
    setCompanyName('');
    setEmail('');
    setPhone('');
    setStage('new');
    setOpportunityValue(8000);
    setSource('Formulário Inbound');
    setNextAction('Realizar primeiro contato');
    setNextActionDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setTagsStr('Inbound, PME');
    setLeadModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setSelectedLead(lead);
    setName(lead.name);
    setCompanyName(lead.companyName || '');
    setEmail(lead.email);
    setPhone(lead.phone);
    setStage(lead.stage);
    setOpportunityValue(lead.opportunityValue);
    setSource(lead.source);
    setNextAction(lead.nextAction);
    setNextActionDate(lead.nextActionDate);
    setTagsStr(lead.tags.join(', '));
    setLeadModalOpen(true);
  };

  const openDetailModal = async (lead: Lead) => {
    setSelectedLead(lead);
    setDetailModalOpen(true);
    try {
      const interactions = await api.crm.getInteractions(lead.id);
      setLeadInteractions(interactions);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveLead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    const tags = tagsStr
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (selectedLead) {
        const updated = await api.crm.updateLead(selectedLead.id, {
          name,
          companyName,
          email,
          phone,
          stage,
          opportunityValue,
          source,
          nextAction,
          nextActionDate,
          tags,
        });
        setLeads(leads.map((l) => (l.id === updated.id ? updated : l)));
      } else {
        const created = await api.crm.createLead({
          name,
          companyName,
          email,
          phone,
          stage,
          opportunityValue,
          source,
          nextAction,
          nextActionDate,
          tags,
        });
        setLeads([created, ...leads]);
      }
      setLeadModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar lead: ' + err.message);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm('Deseja excluir este lead permanentemente?')) return;
    try {
      await api.crm.deleteLead(id);
      setLeads(leads.filter((l) => l.id !== id));
      if (selectedLead?.id === id) setDetailModalOpen(false);
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleUpdateStage = async (leadId: string, newStage: LeadStage) => {
    try {
      const updated = await api.crm.updateLead(leadId, { stage: newStage });
      setLeads(leads.map((l) => (l.id === updated.id ? updated : l)));
    } catch (err: any) {
      alert('Erro ao mover lead: ' + err.message);
    }
  };

  const handleCalculateAiScore = async (leadId: string) => {
    setScoringLeadId(leadId);
    try {
      const res = await api.crm.calculateAiScore(leadId);
      setLeads(leads.map((l) => (l.id === res.lead.id ? res.lead : l)));
      if (selectedLead?.id === res.lead.id) {
        setSelectedLead(res.lead);
      }
    } catch (err: any) {
      alert('Falha ao pontuar lead com IA: ' + err.message);
    } finally {
      setScoringLeadId(null);
    }
  };

  const handleAddInteraction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !interSummary) return;

    try {
      const added = await api.crm.addInteraction(selectedLead.id, {
        type: interType,
        summary: interSummary,
        notes: interNotes,
      });
      setLeadInteractions([added, ...leadInteractions]);
      setInterSummary('');
      setInterNotes('');
    } catch (err: any) {
      alert('Erro ao registrar interação: ' + err.message);
    }
  };

  // CSV Import parser
  const handleImportLeads = async () => {
    if (!importText.trim()) return;

    const lines = importText.trim().split('\n');
    const parsed: Partial<Lead>[] = [];

    // format: Nome, Empresa, Email, Telefone, Valor, Origem
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      // Skip header if detected
      if (i === 0 && line.toLowerCase().includes('nome')) continue;

      const cols = line.split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 1 && cols[0]) {
        parsed.push({
          name: cols[0],
          companyName: cols[1] || '',
          email: cols[2] || '',
          phone: cols[3] || '',
          opportunityValue: Number(cols[4]) || 5000,
          source: cols[5] || 'Planilha CSV',
          stage: 'new',
        });
      }
    }

    try {
      const res = await api.crm.importLeads(parsed);
      setImportResult(res.message);
      setLeads([...res.leads, ...leads]);
      setTimeout(() => {
        setImportResult(null);
        setImportModalOpen(false);
      }, 2500);
    } catch (err: any) {
      alert('Falha na importação: ' + err.message);
    }
  };

  // CSV Export
  const handleExportCsv = () => {
    const headers = 'Nome,Empresa,Email,Telefone,Fase,Valor (R$),Origem,Score IA,LGPD Consentimento\n';
    const rows = leads
      .map(
        (l) =>
          `"${l.name}","${l.companyName}","${l.email}","${l.phone}","${l.stage}","${l.opportunityValue}","${l.source}","${l.aiScore}","Sim"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `leads_nexora_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLeads = leads.filter((l) => {
    const matchesStage = stageFilter === 'all' || l.stage === stageFilter;
    const matchesSearch =
      l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (l.companyName && l.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (l.email && l.email.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStage && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">CRM & Captação de Clientes</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              LGPD Compliant
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gestão do funil de vendas com pontuação preditiva por IA, prevenção de duplicidades e histórico de interações.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setImportModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Importar CSV</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Lead</span>
          </button>
        </div>
      </div>

      {/* Control Bar: View Toggle, Filter, Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-[#080d1a] p-1 rounded-xl border border-slate-800 flex text-xs">
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-blue-600 text-white font-medium' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lista Completa
            </button>
          </div>

          <span className="text-xs text-slate-400 font-mono hidden md:inline">
            Total: {leads.length} oportunidades registradas
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar lead, empresa ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#080d1a] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none w-56 focus:border-cyan-500"
            />
          </div>

          {viewMode === 'list' && (
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value as any)}
              className="bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none"
            >
              <option value="all">Todas as Fases</option>
              {STAGES.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' ? (
        <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar min-h-[550px]">
          {STAGES.map((stageObj) => {
            const stageLeads = filteredLeads.filter((l) => l.stage === stageObj.id);
            const stageValue = stageLeads.reduce((acc, curr) => acc + (curr.opportunityValue || 0), 0);

            return (
              <div
                key={stageObj.id}
                className="w-72 shrink-0 bg-[#0c1220]/70 border border-slate-800/80 rounded-2xl p-3 flex flex-col justify-between"
              >
                <div>
                  {/* Column Header */}
                  <div className={`border-b ${stageObj.color} pb-2.5 mb-3`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-white">{stageObj.label}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                        {stageLeads.length}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                      R$ {stageValue.toLocaleString('pt-BR')}
                    </span>
                  </div>

                  {/* Cards inside column */}
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                    {stageLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="bg-[#0f172a] border border-slate-800 hover:border-cyan-500/50 rounded-xl p-3 shadow-md hover:shadow-cyan-500/10 transition-all cursor-pointer group"
                        onClick={() => openDetailModal(lead)}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="font-bold text-xs text-white group-hover:text-cyan-300 transition-colors truncate max-w-[170px]">
                            {lead.name}
                          </span>
                          <span
                            className={`text-[9px] font-bold font-mono px-1.5 py-0.5 rounded ${
                              lead.aiScore >= 80
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                            title="Pontuação de Inteligência Artificial"
                          >
                            {lead.aiScore} pts
                          </span>
                        </div>

                        {lead.companyName && (
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mb-2 truncate">
                            <Building className="w-3 h-3 text-slate-500 shrink-0" />
                            <span>{lead.companyName}</span>
                          </p>
                        )}

                        <div className="flex items-center justify-between text-xs font-mono py-1 border-t border-slate-800/80 mt-1">
                          <span className="text-cyan-400 font-bold">
                            R$ {lead.opportunityValue.toLocaleString('pt-BR')}
                          </span>
                          <span className="text-[10px] text-slate-400">{lead.source}</span>
                        </div>

                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/60">
                          <span className="truncate max-w-[140px] text-slate-300">{lead.nextAction}</span>
                          <span className="font-mono text-slate-500">{lead.nextActionDate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    setStage(stageObj.id);
                    openCreateModal();
                  }}
                  className="w-full mt-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-dashed border-slate-700/80 text-[11px] text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Adicionar nesta etapa</span>
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium">
                <th className="pb-3">Contato & Empresa</th>
                <th className="pb-3">Fase do Funil</th>
                <th className="pb-3">Valor da Oportunidade</th>
                <th className="pb-3">Score IA</th>
                <th className="pb-3">Próximo Contato</th>
                <th className="pb-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLeads.map((lead) => (
                <tr key={lead.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3">
                    <p className="font-semibold text-white">{lead.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {lead.companyName ? `${lead.companyName} • ` : ''}
                      {lead.email}
                    </p>
                  </td>
                  <td className="py-3">
                    <select
                      value={lead.stage}
                      onChange={(e) => handleUpdateStage(lead.id, e.target.value as any)}
                      className="bg-[#080d1a] border border-slate-700 rounded-lg px-2 py-1 text-[11px] text-slate-200 outline-none"
                    >
                      {STAGES.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 font-mono font-medium text-slate-200">
                    R$ {lead.opportunityValue.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3">
                    <button
                      onClick={() => handleCalculateAiScore(lead.id)}
                      disabled={scoringLeadId === lead.id}
                      className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-blue-950/40 border border-blue-500/30 text-cyan-300 hover:bg-blue-900/40 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>{scoringLeadId === lead.id ? 'Calculando...' : `${lead.aiScore}/100`}</span>
                    </button>
                  </td>
                  <td className="py-3 text-slate-300">
                    <p className="text-xs truncate max-w-[160px]">{lead.nextAction}</p>
                    <span className="text-[10px] text-slate-500 font-mono">{lead.nextActionDate}</span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openDetailModal(lead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800"
                        title="Ver Histórico & Interações"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(lead)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800"
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteLead(lead.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800"
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Lead Modal */}
      {leadModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-base font-bold text-white mb-1">
              {selectedLead ? 'Editar Oportunidade' : 'Cadastrar Novo Lead Comercial'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Preencha os dados de contato, etapa do funil e valor estimado da oportunidade.
            </p>

            <form onSubmit={handleSaveLead} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Nome do Contato</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Carlos Silva"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Empresa / Razão</label>
                  <input
                    type="text"
                    placeholder="Ex: Silva Logística"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">E-mail</label>
                  <input
                    type="email"
                    placeholder="carlos@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Telefone / Celular</label>
                  <input
                    type="text"
                    placeholder="+55 11 99999-0000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Fase do Funil</label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value as any)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-2 py-2 text-white outline-none"
                  >
                    {STAGES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Valor Estimado (R$)</label>
                  <input
                    type="number"
                    value={opportunityValue}
                    onChange={(e) => setOpportunityValue(Number(e.target.value))}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Origem do Lead</label>
                  <input
                    type="text"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="Google, Meta, Indicação"
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Próxima Ação Comercial</label>
                  <input
                    type="text"
                    value={nextAction}
                    onChange={(e) => setNextAction(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Data do Próximo Contato</label>
                  <input
                    type="date"
                    value={nextActionDate}
                    onChange={(e) => setNextActionDate(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Tags (separadas por vírgula)</label>
                <input
                  type="text"
                  value={tagsStr}
                  onChange={(e) => setTagsStr(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-300 flex items-center gap-2">
                <Shield className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>Consentimento LGPD ativo e registrado no banco de dados com carimbo de tempo.</span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setLeadModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer shadow-md"
                >
                  Salvar Oportunidade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lead Detail & Interactions Timeline Modal */}
      {detailModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar space-y-5">
            {/* Lead Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{selectedLead.name}</span>
                  <span
                    className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                      selectedLead.aiScore >= 80
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    AI Score: {selectedLead.aiScore}/100
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedLead.companyName || 'Empresa não informada'} • {selectedLead.email} • {selectedLead.phone}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCalculateAiScore(selectedLead.id)}
                  disabled={scoringLeadId === selectedLead.id}
                  className="px-3 py-1.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-900/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Recalcular IA</span>
                </button>
                <button
                  onClick={() => setDetailModalOpen(false)}
                  className="text-slate-400 hover:text-white text-xs px-2 py-1"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* AI Diagnosis Box */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-950/30 to-purple-950/30 border border-blue-500/30 space-y-1">
              <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Diagnóstico de Inteligência Comercial (Gemini):
              </span>
              <p className="text-xs text-slate-200 leading-relaxed">{selectedLead.aiQualification}</p>
            </div>

            {/* Key Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs font-mono">
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Valor Estimado</span>
                <span className="font-bold text-white text-sm">
                  R$ {selectedLead.opportunityValue.toLocaleString('pt-BR')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Etapa Comercial</span>
                <span className="font-bold text-cyan-400 uppercase">{selectedLead.stage.replace('_', ' ')}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 uppercase block">Canal de Origem</span>
                <span className="font-bold text-slate-300">{selectedLead.source}</span>
              </div>
            </div>

            {/* Interaction Timeline */}
            <div>
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-3">
                Histórico de Interações & Notas ({leadInteractions.length})
              </h3>

              <div className="space-y-2 mb-4">
                {leadInteractions.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">Nenhuma interação registrada ainda.</p>
                ) : (
                  leadInteractions.map((inter) => (
                    <div key={inter.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-white flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{inter.summary}</span>
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {new Date(inter.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      {inter.notes && <p className="text-slate-300 text-[11px] mt-1 pl-5">{inter.notes}</p>}
                    </div>
                  ))
                )}
              </div>

              {/* Add Interaction Form */}
              <form onSubmit={handleAddInteraction} className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs">
                <span className="font-medium text-slate-300 block">Registrar Novo Contato / Nota</span>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={interType}
                    onChange={(e) => setInterType(e.target.value)}
                    className="bg-[#080d1a] border border-slate-800 rounded-lg px-2 py-1.5 text-white outline-none"
                  >
                    <option value="call">Ligação Telefônica</option>
                    <option value="meeting">Reunião / Call</option>
                    <option value="email">E-mail Comercial</option>
                    <option value="note">Nota Interna</option>
                  </select>
                  <input
                    type="text"
                    required
                    placeholder="Resumo da conversa..."
                    value={interSummary}
                    onChange={(e) => setInterSummary(e.target.value)}
                    className="col-span-2 bg-[#080d1a] border border-slate-800 rounded-lg px-3 py-1.5 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <textarea
                  rows={2}
                  placeholder="Detalhes ou anotações adicionais..."
                  value={interNotes}
                  onChange={(e) => setInterNotes(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-lg px-3 py-1.5 text-white outline-none focus:border-cyan-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer"
                  >
                    Salvar Interação
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {importModalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">Importação de Planilha de Leads</h2>
            <p className="text-xs text-slate-400 mb-3">
              Cole linhas separadas por vírgula ou ponto-e-vírgula no padrão:
              <br />
              <code className="text-[10px] text-cyan-400 font-mono">Nome, Empresa, Email, Telefone, Valor, Origem</code>
            </p>

            {importResult && (
              <div className="p-3 mb-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{importResult}</span>
              </div>
            )}

            <textarea
              rows={8}
              placeholder={`Mariana Dias, Dias Contabilidade, mariana@diascontabil.com.br, +55 11 98877-6655, 14000, Meta Ads\nFelipe Moura, Moura Engenharia, felipe@mouraeng.com.br, +55 21 97766-5544, 35000, Google Ads`}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
              className="w-full bg-[#080d1a] border border-slate-800 rounded-xl p-3 text-xs text-white font-mono outline-none focus:border-cyan-500"
            />

            <p className="text-[11px] text-slate-500 mt-2">
              * O sistema verifica duplicidade por e-mail e aplica consentimento LGPD nos registros importados.
            </p>

            <div className="flex justify-end gap-2 pt-4 border-t border-slate-800 mt-4">
              <button
                type="button"
                onClick={() => setImportModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportLeads}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer shadow-md"
              >
                Processar e Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
