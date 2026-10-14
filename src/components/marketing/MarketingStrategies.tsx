import React, { useState, useEffect } from 'react';
import {
  Target,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sparkles,
  Edit2,
  Trash2,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import { api } from '../../services/api';
import { MarketingPlan, MarketingActionItem } from '../../types';

interface MarketingStrategiesProps {
  onNavigate: (section: string) => void;
}

export const MarketingStrategies: React.FC<MarketingStrategiesProps> = ({ onNavigate }) => {
  const [plans, setPlans] = useState<MarketingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<MarketingPlan | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isNewPlanModal, setIsNewPlanModal] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [valueProposition, setValueProposition] = useState('');
  const [positioning, setPositioning] = useState('');
  const [goalsText, setGoalsText] = useState('');
  const [actions, setActions] = useState<MarketingActionItem[]>([]);

  // New action modal
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionPriority, setNewActionPriority] = useState<'high' | 'medium' | 'low'>('high');
  const [newActionDeadline, setNewActionDeadline] = useState('');

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await api.marketing.getPlans();
      setPlans(data);
      if (data.length > 0 && !selectedPlan) {
        setSelectedPlan(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlans();
  }, []);

  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    try {
      const goals = goalsText
        .split('\n')
        .map((g) => g.trim())
        .filter(Boolean);

      const created = await api.marketing.createPlan({
        title,
        targetAudience,
        valueProposition,
        positioning,
        goals,
        actions: actions.length > 0 ? actions : [
          {
            id: `act_${Date.now()}`,
            title: 'Lançar campanha de captação de clientes',
            priority: 'high',
            deadline: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
            status: 'pending',
          },
        ],
      });

      setPlans([created, ...plans]);
      setSelectedPlan(created);
      setIsNewPlanModal(false);
      resetForm();
    } catch (err: any) {
      alert('Erro ao criar plano: ' + err.message);
    }
  };

  const handleUpdatePlan = async () => {
    if (!selectedPlan) return;
    try {
      const updated = await api.marketing.updatePlan(selectedPlan.id, {
        title: selectedPlan.title,
        targetAudience: selectedPlan.targetAudience,
        valueProposition: selectedPlan.valueProposition,
        positioning: selectedPlan.positioning,
        goals: selectedPlan.goals,
        actions: selectedPlan.actions,
      });

      setPlans(plans.map((p) => (p.id === updated.id ? updated : p)));
      setSelectedPlan(updated);
      setIsEditing(false);
    } catch (err: any) {
      alert('Erro ao atualizar plano: ' + err.message);
    }
  };

  const handleDeletePlan = async (id: string) => {
    if (!confirm('Deseja realmente excluir este plano de marketing?')) return;
    try {
      await api.marketing.deletePlan(id);
      const remaining = plans.filter((p) => p.id !== id);
      setPlans(remaining);
      setSelectedPlan(remaining[0] || null);
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleToggleActionStatus = async (actionId: string) => {
    if (!selectedPlan) return;
    const updatedActions = selectedPlan.actions.map((act) => {
      if (act.id === actionId) {
        const nextStatus =
          act.status === 'pending' ? 'in_progress' : act.status === 'in_progress' ? 'completed' : 'pending';
        return { ...act, status: nextStatus as any };
      }
      return act;
    });

    const updatedPlan = { ...selectedPlan, actions: updatedActions };
    setSelectedPlan(updatedPlan);

    await api.marketing.updatePlan(selectedPlan.id, { actions: updatedActions });
    setPlans(plans.map((p) => (p.id === selectedPlan.id ? updatedPlan : p)));
  };

  const handleAddAction = async () => {
    if (!selectedPlan || !newActionTitle) return;

    const newAction: MarketingActionItem = {
      id: `act_${Date.now()}`,
      title: newActionTitle.trim(),
      priority: newActionPriority,
      deadline: newActionDeadline || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      status: 'pending',
    };

    const updatedActions = [...selectedPlan.actions, newAction];
    const updatedPlan = { ...selectedPlan, actions: updatedActions };
    setSelectedPlan(updatedPlan);
    setNewActionTitle('');

    await api.marketing.updatePlan(selectedPlan.id, { actions: updatedActions });
    setPlans(plans.map((p) => (p.id === selectedPlan.id ? updatedPlan : p)));
  };

  const resetForm = () => {
    setTitle('');
    setTargetAudience('');
    setValueProposition('');
    setPositioning('');
    setGoalsText('');
    setActions([]);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
              <Target className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Marketing & Estratégias de Crescimento
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Planejamento estratégico de mercado, proposta única de valor, metas e acompanhamento de tarefas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('ai-hub')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-cyan-400 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gerar Plano com IA</span>
          </button>
          <button
            onClick={() => {
              resetForm();
              setIsNewPlanModal(true);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Plano Estratégico</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Sidebar Plans Selector & Plan Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Plans List (4 Cols) */}
        <div className="lg:col-span-4 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Planos de Marketing Cadastrados ({plans.length})
          </h2>

          {plans.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0c1220]/70 border border-slate-800 text-center text-slate-500 text-xs">
              Nenhum plano criado ainda. Clique em "Novo Plano Estratégico".
            </div>
          ) : (
            <div className="space-y-2">
              {plans.map((p) => {
                const isSelected = selectedPlan?.id === p.id;
                const completedCount = p.actions.filter((a) => a.status === 'completed').length;
                const totalActions = p.actions.length;

                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      setSelectedPlan(p);
                      setIsEditing(false);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0f172a] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-[#0c1220]/80 border-slate-800/80 hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-white truncate max-w-[200px]">{p.title}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 border border-blue-500/30 text-blue-300">
                        v{p.version}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {p.valueProposition || p.targetAudience}
                    </p>
                    <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2 font-mono">
                      <span>
                        Ações: {completedCount}/{totalActions} concluídas
                      </span>
                      <span>{new Date(p.updatedAt).toLocaleDateString('pt-BR')}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Plan Details (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-6">
          {selectedPlan ? (
            <>
              {/* Header with Title and Actions */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedPlan.title}</h2>
                    <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-500/30">
                      Versão {selectedPlan.version}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Última revisão registrada em {new Date(selectedPlan.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDeletePlan(selectedPlan.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
                    title="Excluir Plano"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Pillars Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block mb-1">
                    Público-Alvo (Perfil de Cliente Ideal)
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedPlan.targetAudience}</p>
                </div>

                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] font-mono text-purple-400 uppercase tracking-wider block mb-1">
                    Posicionamento Estratégico
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed">{selectedPlan.positioning}</p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider block mb-1">
                  Proposta Única de Valor (UVP)
                </span>
                <p className="text-xs text-slate-200 leading-relaxed">{selectedPlan.valueProposition}</p>
              </div>

              {/* Goals */}
              <div>
                <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono mb-2">
                  Metas & Indicadores de Sucesso (KPIs)
                </h3>
                <div className="space-y-1.5">
                  {selectedPlan.goals.map((goal, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-lg bg-[#090e1a] border border-slate-800/60 text-xs text-slate-300 flex items-center gap-2"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{goal}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Items with Deadlines & Status */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider font-mono">
                    Plano de Ação Tático ({selectedPlan.actions.length})
                  </h3>
                  <span className="text-[11px] text-slate-500">Clique na ação para alternar o status</span>
                </div>

                <div className="space-y-2">
                  {selectedPlan.actions.map((act) => {
                    const statusColor =
                      act.status === 'completed'
                        ? 'text-emerald-400 bg-emerald-950/30 border-emerald-500/30'
                        : act.status === 'in_progress'
                        ? 'text-cyan-400 bg-cyan-950/30 border-cyan-500/30'
                        : 'text-slate-400 bg-slate-900/40 border-slate-800';

                    const priorityColor =
                      act.priority === 'high'
                        ? 'text-rose-400 bg-rose-950/20'
                        : act.priority === 'medium'
                        ? 'text-amber-400 bg-amber-950/20'
                        : 'text-slate-400 bg-slate-800';

                    return (
                      <div
                        key={act.id}
                        onClick={() => handleToggleActionStatus(act.id)}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 cursor-pointer transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            className={`p-1.5 rounded-lg border text-xs font-medium ${statusColor}`}
                          >
                            {act.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : act.status === 'in_progress' ? (
                              <Clock className="w-4 h-4" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-600" />
                            )}
                          </button>
                          <div>
                            <p
                              className={`text-xs font-medium ${
                                act.status === 'completed' ? 'line-through text-slate-500' : 'text-white'
                              }`}
                            >
                              {act.title}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono">
                              Prazo limite: {act.deadline}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${priorityColor}`}>
                            {act.priority}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Quick Add Action Form */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    placeholder="Adicionar nova ação tática ao plano..."
                    value={newActionTitle}
                    onChange={(e) => setNewActionTitle(e.target.value)}
                    className="flex-1 bg-[#080d1a] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500"
                  />
                  <select
                    value={newActionPriority}
                    onChange={(e) => setNewActionPriority(e.target.value as any)}
                    className="bg-[#080d1a] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none"
                  >
                    <option value="high">Alta Prioridade</option>
                    <option value="medium">Média Prioridade</option>
                    <option value="low">Baixa Prioridade</option>
                  </select>
                  <input
                    type="date"
                    value={newActionDeadline}
                    onChange={(e) => setNewActionDeadline(e.target.value)}
                    className="bg-[#080d1a] border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 outline-none"
                  />
                  <button
                    onClick={handleAddAction}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium whitespace-nowrap cursor-pointer"
                  >
                    Adicionar Ação
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-16 text-slate-500">Selecione ou crie um plano estratégico.</div>
          )}
        </div>
      </div>

      {/* New Plan Modal */}
      {isNewPlanModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-base font-bold text-white mb-1">Elaborar Novo Plano de Marketing</h2>
            <p className="text-xs text-slate-400 mb-4">
              Preencha os pilares fundamentais da estratégia de crescimento da sua empresa.
            </p>

            <form onSubmit={handleCreatePlan} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Nome / Título do Plano</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Estratégia de Tração Q1 — Escala B2B"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Público-Alvo (ICP)</label>
                <input
                  type="text"
                  placeholder="Ex: Gestores e Fundadores de empresas em crescimento..."
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Proposta Única de Valor (UVP)</label>
                <textarea
                  rows={2}
                  placeholder="Qual benefício transformador e único sua empresa oferece?"
                  value={valueProposition}
                  onChange={(e) => setValueProposition(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Posicionamento de Marca</label>
                <input
                  type="text"
                  placeholder="Ex: A plataforma de tecnologia mais completa e inteligente para o mercado..."
                  value={positioning}
                  onChange={(e) => setPositioning(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Metas Principais (1 por linha)</label>
                <textarea
                  rows={3}
                  placeholder="Ex: Gerar 100 leads MQL por mês&#10;Reduzir CAC para menos de R$ 250&#10;Atingir R$ 150.000 em vendas"
                  value={goalsText}
                  onChange={(e) => setGoalsText(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer"
                >
                  Salvar Plano Estratégico
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
