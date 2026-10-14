import React, { useState, useEffect } from 'react';
import {
  Zap,
  Plus,
  Play,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Link2,
  Trash2,
  Edit2,
  Server,
  Activity,
  History,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { api } from '../../services/api';
import { Automation, ExecutionLog } from '../../types';

interface AutomationsModuleProps {
  onNavigate: (section: string) => void;
}

export const AutomationsModule: React.FC<AutomationsModuleProps> = ({ onNavigate }) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAuto, setSelectedAuto] = useState<Automation | null>(null);
  const [logs, setLogs] = useState<ExecutionLog[]>([]);
  const [triggeringId, setTriggeringId] = useState<string | null>(null);
  const [triggerFeedback, setTriggerFeedback] = useState<{
    id: string;
    status: 'success' | 'error';
    message: string;
    durationMs: number;
  } | null>(null);

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('new_lead');
  const [actionType, setActionType] = useState('webhook_n8n');
  const [webhookUrl, setWebhookUrl] = useState('https://webhook.n8n.cloud/webhook/nexora-lead-enrichment');
  const [description, setDescription] = useState('');

  const loadAutomations = async () => {
    setLoading(true);
    try {
      const data = await api.automations.getAutomations();
      setAutomations(data);
      if (data.length > 0 && !selectedAuto) {
        setSelectedAuto(data[0]);
        loadLogs(data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLogs = async (autoId: string) => {
    try {
      const logsData = await api.automations.getLogs(autoId);
      setLogs(logsData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadAutomations();
  }, []);

  const openCreateModal = () => {
    setName('');
    setTriggerType('new_lead');
    setActionType('webhook_n8n');
    setWebhookUrl('https://webhook.n8n.cloud/webhook/nexora-trigger');
    setDescription('Dispara workflow no n8n para enriquecer os dados do novo contato e criar notificação.');
    setModalOpen(true);
  };

  const handleSaveAutomation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !triggerType) return;

    try {
      const created = await api.automations.createAutomation({
        name,
        triggerType,
        actionType,
        webhookUrl,
        description,
      });
      setAutomations([created, ...automations]);
      setSelectedAuto(created);
      setModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar automação: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir esta automação?')) return;
    try {
      await api.automations.deleteAutomation(id);
      const remaining = automations.filter((a) => a.id !== id);
      setAutomations(remaining);
      if (selectedAuto?.id === id) {
        setSelectedAuto(remaining[0] || null);
        if (remaining[0]) loadLogs(remaining[0].id);
      }
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleTriggerTest = async (auto: Automation) => {
    setTriggeringId(auto.id);
    setTriggerFeedback(null);
    try {
      const res = await api.automations.triggerAutomation(auto.id);
      setTriggerFeedback({
        id: auto.id,
        status: res.status,
        message: `${res.responseSummary} (HTTP ${res.statusCode})`,
        durationMs: res.durationMs,
      });

      // Update counters in list
      setAutomations(
        automations.map((a) =>
          a.id === auto.id
            ? {
                ...a,
                executionsCount: (a.executionsCount || 0) + 1,
                lastTriggeredAt: new Date().toISOString(),
                failedCount: res.status === 'error' ? (a.failedCount || 0) + 1 : a.failedCount,
              }
            : a
        )
      );

      // Prepend to logs
      setLogs([res.log, ...logs]);
    } catch (err: any) {
      setTriggerFeedback({
        id: auto.id,
        status: 'error',
        message: err.message || 'Falha na conexão do webhook',
        durationMs: 0,
      });
    } finally {
      setTriggeringId(null);
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-600/20 text-cyan-400 border border-cyan-500/30">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Automações Empresariais & Webhooks
            </h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              n8n & Make
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Gatilhos orientados a eventos com disparos em tempo real, validação de latência e histórico de execuções.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-3.5 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)]"
        >
          <Plus className="w-4 h-4" />
          <span>Nova Automação</span>
        </button>
      </div>

      {/* Main Grid: Left List (5 cols), Right Execution Logs & Details (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Automations List */}
        <div className="lg:col-span-5 space-y-3">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
            Automações Conectadas ({automations.length})
          </h2>

          {automations.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#0c1220]/70 border border-slate-800 text-center text-slate-500 text-xs">
              Nenhuma automação cadastrada.
            </div>
          ) : (
            <div className="space-y-3">
              {automations.map((auto) => {
                const isSelected = selectedAuto?.id === auto.id;

                return (
                  <div
                    key={auto.id}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0f172a] border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                        : 'bg-[#0c1220]/80 border-slate-800/80 hover:bg-slate-900/60'
                    }`}
                    onClick={() => {
                      setSelectedAuto(auto);
                      loadLogs(auto.id);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                        <span className="font-bold text-xs text-white truncate max-w-[200px]">{auto.name}</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        {auto.triggerType}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-3">
                      {auto.description || 'Gatilho automatizado em tempo real.'}
                    </p>

                    <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800 text-[10px] font-mono text-cyan-300 truncate mb-3 flex items-center gap-1.5">
                      <Link2 className="w-3 h-3 text-slate-500 shrink-0" />
                      <span className="truncate">{auto.webhookUrl || 'Webhook interno NEXORA'}</span>
                    </div>

                    {/* Footer with test button & executions count */}
                    <div className="flex items-center justify-between border-t border-slate-800/80 pt-2.5 text-[11px]">
                      <div className="flex items-center gap-3 font-mono text-slate-400 text-[10px]">
                        <span>Execuções: {auto.executionsCount || 0}</span>
                        {auto.failedCount > 0 && <span className="text-rose-400">{auto.failedCount} falhas</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTriggerTest(auto);
                          }}
                          disabled={triggeringId === auto.id}
                          className="px-2.5 py-1 rounded-lg bg-cyan-950/50 hover:bg-cyan-900/50 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Play className="w-3 h-3 text-cyan-400 fill-current" />
                          <span>{triggeringId === auto.id ? 'Disparando...' : 'Testar Disparo'}</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(auto.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-400"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Live Trigger Feedback alert */}
                    {triggerFeedback && triggerFeedback.id === auto.id && (
                      <div
                        className={`mt-3 p-2.5 rounded-xl border text-[11px] font-mono flex items-center justify-between ${
                          triggerFeedback.status === 'success'
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {triggerFeedback.status === 'success' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                          )}
                          <span className="truncate">{triggerFeedback.message}</span>
                        </div>
                        {triggerFeedback.durationMs > 0 && (
                          <span className="shrink-0 text-slate-400 pl-2">{triggerFeedback.durationMs}ms</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Execution History & Inspection (7 cols) */}
        <div className="lg:col-span-7 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span>Logs de Execução & Diagnóstico</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {selectedAuto ? `Automação: ${selectedAuto.name}` : 'Selecione uma automação'}
              </p>
            </div>

            {selectedAuto && (
              <button
                onClick={() => loadLogs(selectedAuto.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Recarregar Logs"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Logs List */}
          {logs.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs space-y-2">
              <Terminal className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-slate-400 font-medium">Nenhum log registrado para esta automação.</p>
              <p className="text-[11px] text-slate-500">
                Clique em "Testar Disparo" para executar o webhook e registrar a resposta do servidor.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 font-mono text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        HTTP {log.statusCode}
                      </span>
                      <span className="text-slate-300 text-[11px] font-sans font-medium">{log.responseSummary}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                      <span>{log.durationMs}ms</span>
                      <span>{new Date(log.timestamp).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>

                  {log.payload && (
                    <div className="p-2 rounded-lg bg-[#070b14] border border-slate-800/60 text-[11px] text-slate-400 overflow-x-auto">
                      <span className="text-slate-500 text-[9px] block mb-1">Payload Enviado:</span>
                      <pre className="text-cyan-300 text-[10px]">
                        {JSON.stringify(log.payload, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Automation Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1">Configurar Nova Automação</h2>
            <p className="text-xs text-slate-400 mb-4">
              Vincule gatilhos de CRM e IA com webhooks n8n, Make ou serviços externos.
            </p>

            <form onSubmit={handleSaveAutomation} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Nome da Automação</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Triagem Instantânea de Lead & Disparo WhatsApp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Gatilho (Evento)</label>
                  <select
                    value={triggerType}
                    onChange={(e) => setTriggerType(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none"
                  >
                    <option value="new_lead">Novo Lead Cadastrado</option>
                    <option value="lead_stage_changed">Etapa de Lead Alterada</option>
                    <option value="deal_closed_won">Negócio Fechado / Ganho</option>
                    <option value="campaign_threshold">Limite de Campanha Atingido</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Ação do Destino</label>
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none"
                  >
                    <option value="webhook_n8n">Disparar Webhook n8n</option>
                    <option value="webhook_make">Disparar Webhook Make</option>
                    <option value="send_alert">Alerta Interno de Notificação</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">URL do Webhook (POST)</label>
                <input
                  type="url"
                  placeholder="https://webhook.n8n.cloud/webhook/..."
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white font-mono text-[11px] outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Descrição do Fluxo</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explique o que este fluxo automatiza..."
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium cursor-pointer shadow-md"
                >
                  Criar e Ativar Automação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
