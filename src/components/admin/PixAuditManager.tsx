import React, { useState, useMemo } from 'react';
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  Clock,
  Check,
  X,
  FileCheck,
  Search,
  Filter,
  Copy,
  ExternalLink,
  ShieldAlert,
  ShieldCheck,
  Building2,
  DollarSign,
  User,
  Calendar,
  RefreshCw,
  FileText,
  BadgeAlert,
  ArrowUpRight,
} from 'lucide-react';
import { PaymentTransaction, PaymentStatus } from '../../types';
import { api } from '../../services/api';

interface PixAuditManagerProps {
  payments: PaymentTransaction[];
  onPaymentUpdated: () => void;
  onNavigateToAuditLogs?: () => void;
}

export const PixAuditManager: React.FC<PixAuditManagerProps> = ({
  payments,
  onPaymentUpdated,
  onNavigateToAuditLogs,
}) => {
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  // Modal / Review state
  const [selectedTransaction, setSelectedTransaction] = useState<PaymentTransaction | null>(null);
  const [decisionModalMode, setDecisionModalMode] = useState<'details' | 'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const PIX_OFFICIAL_KEY = '11973479473';
  const PIX_BENEFICIARY = 'Alifer Madeiro / NEXORA AI';

  // Metrics calculation
  const metrics = useMemo(() => {
    const pixPayments = payments.filter((p) => p.method === 'PIX' || !p.method);
    const emAnalise = pixPayments.filter((p) => p.status === 'EM_ANALISE').length;
    const pendentes = pixPayments.filter((p) => p.status === 'PENDENTE').length;
    const aprovados = pixPayments.filter((p) => p.status === 'APROVADO');
    const recusados = pixPayments.filter((p) => p.status === 'RECUSADO').length;
    const totalAprovadoValor = aprovados.reduce((acc, p) => acc + (p.amount || 0), 0);

    return {
      total: pixPayments.length,
      emAnalise,
      pendentes,
      aprovadosCount: aprovados.length,
      recusados,
      totalAprovadoValor,
    };
  }, [payments]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return payments
      .filter((p) => {
        // Only Pix transactions
        if (p.method && p.method !== 'PIX') return false;

        const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
        const search = searchTerm.toLowerCase();
        const matchesSearch =
          !searchTerm ||
          p.companyName.toLowerCase().includes(search) ||
          p.userName.toLowerCase().includes(search) ||
          p.userEmail.toLowerCase().includes(search) ||
          p.planName.toLowerCase().includes(search) ||
          (p.receiptDetails && p.receiptDetails.toLowerCase().includes(search)) ||
          (p.customerNotes && p.customerNotes.toLowerCase().includes(search));

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [payments, statusFilter, searchTerm]);

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2500);
  };

  const handleOpenDecisionModal = (payment: PaymentTransaction, mode: 'details' | 'approve' | 'reject') => {
    setSelectedTransaction(payment);
    setDecisionModalMode(mode);
    setAdminNotes(payment.adminNotes || '');
    setFeedbackMessage(null);
  };

  const handleCloseModal = () => {
    setSelectedTransaction(null);
    setDecisionModalMode(null);
    setAdminNotes('');
    setIsSubmitting(false);
  };

  const handleExecuteDecision = async (status: PaymentStatus) => {
    if (!selectedTransaction) return;
    setIsSubmitting(true);
    setFeedbackMessage(null);

    try {
      const res = await api.admin.updatePaymentStatus(selectedTransaction.id, {
        status,
        adminNotes: adminNotes.trim(),
      });
      setFeedbackMessage({
        type: 'success',
        text: res.message || `Transação Pix atualizada para ${status}.`,
      });
      onPaymentUpdated();
      setTimeout(() => {
        handleCloseModal();
      }, 1500);
    } catch (err: any) {
      setFeedbackMessage({
        type: 'error',
        text: err.message || 'Erro ao processar a decisão de pagamento.',
      });
      setIsSubmitting(false);
    }
  };

  const renderStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'APROVADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Aprovado</span>
          </span>
        );
      case 'EM_ANALISE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 animate-pulse font-bold uppercase">
            <Clock className="w-3 h-3 text-amber-400" />
            <span>Em Análise</span>
          </span>
        );
      case 'PENDENTE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 uppercase">
            <AlertCircle className="w-3 h-3 text-blue-400" />
            <span>Pendente</span>
          </span>
        );
      case 'RECUSADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 uppercase">
            <X className="w-3 h-3 text-rose-400" />
            <span>Recusado</span>
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-500/20 text-slate-400 border border-slate-500/30 uppercase">
            <X className="w-3 h-3 text-slate-400" />
            <span>Cancelado</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Auditing KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Em Análise */}
        <div className="bg-[#0c1220]/90 border border-amber-500/30 rounded-2xl p-4 backdrop-blur-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-amber-300 font-semibold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Aguardando Conferência</span>
            </span>
            {metrics.emAnalise > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.emAnalise}
          </p>
          <span className="text-[11px] text-amber-400/80 font-mono mt-1 block">
            Comprovante enviado pelo cliente
          </span>
        </div>

        {/* Total Aprovado */}
        <div className="bg-[#0c1220]/90 border border-emerald-500/30 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-emerald-300 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Aprovadas pelo Proprietário</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">
            {metrics.aprovadosCount}
          </p>
          <span className="text-[11px] text-slate-400 font-mono mt-1 block">
            R$ {metrics.totalAprovadoValor.toLocaleString('pt-BR')},00 liberados
          </span>
        </div>

        {/* Pendentes */}
        <div className="bg-[#0c1220]/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-blue-300 font-medium flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-blue-400" />
              <span>Pendentes de Comprovante</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono">
            {metrics.pendentes}
          </p>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">
            Aguardando cliente transferir
          </span>
        </div>

        {/* Recusadas */}
        <div className="bg-[#0c1220]/90 border border-slate-800 rounded-2xl p-4 backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-rose-300 font-medium flex items-center gap-1.5">
              <X className="w-3.5 h-3.5 text-rose-400" />
              <span>Transações Recusadas</span>
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-rose-400 font-mono">
            {metrics.recusados}
          </p>
          <span className="text-[11px] text-slate-500 font-mono mt-1 block">
            Comprovante inválido ou não conferido
          </span>
        </div>
      </div>

      {/* Official Pix Key Reference Box */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
            <QrCode className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white">Chave Pix Oficial da NEXORA AI:</span>
              <span className="font-mono text-cyan-300 font-semibold px-2 py-0.5 rounded-md bg-cyan-950 border border-cyan-500/30 select-all">
                {PIX_OFFICIAL_KEY}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Beneficiário: <strong className="text-slate-200">{PIX_BENEFICIARY}</strong> • Conferência manual e liberação estrita pelo proprietário
            </p>
          </div>
        </div>

        {onNavigateToAuditLogs && (
          <button
            onClick={onNavigateToAuditLogs}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Ver Trilha Geral de Auditoria</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Card: Transactions List & Controls */}
      <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-5 sm:p-6 backdrop-blur-md space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <span>Auditoria de Transações Pix & Liberação de Acesso</span>
            </h2>
            <p className="text-xs text-slate-400">
              Inspecione o código informado pelo cliente, confira o extrato do seu banco e aprove manualmente a ativação do plano.
            </p>
          </div>

          <button
            onClick={onPaymentUpdated}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 cursor-pointer self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Atualizar Lista</span>
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por empresa, cliente, e-mail, plano ou código do comprovante..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="all">Todos os Estados ({metrics.total})</option>
              <option value="EM_ANALISE">Em Análise ({metrics.emAnalise})</option>
              <option value="PENDENTE">Pendente ({metrics.pendentes})</option>
              <option value="APROVADO">Aprovado ({metrics.aprovadosCount})</option>
              <option value="RECUSADO">Recusado ({metrics.recusados})</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-2xl space-y-2">
            <FileCheck className="w-7 h-7 text-slate-500 mx-auto" />
            <p className="text-slate-300 font-semibold text-sm">Nenhuma transação Pix encontrada</p>
            <p className="text-slate-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Tente ajustar os filtros de busca para encontrar transações.'
                : 'Quando os clientes iniciarem um pagamento via Pix, os registros aparecerão aqui para conferência do proprietário.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                  <th className="pb-3">Data / Hora</th>
                  <th className="pb-3">Empresa & Solicitante</th>
                  <th className="pb-3">Plano & Valor</th>
                  <th className="pb-3">Comprovante Informado</th>
                  <th className="pb-3">Estado</th>
                  <th className="pb-3">Decisão de Auditoria</th>
                  <th className="pb-3 text-right">Ação do Proprietário</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {filteredTransactions.map((tx) => {
                  const isAwaitingReview = tx.status === 'EM_ANALISE';

                  return (
                    <tr
                      key={tx.id}
                      className={`transition-colors ${
                        isAwaitingReview
                          ? 'bg-amber-500/5 hover:bg-amber-500/10'
                          : 'hover:bg-slate-900/40'
                      }`}
                    >
                      {/* Date */}
                      <td className="py-3.5 font-mono text-slate-300 text-[11px] whitespace-nowrap">
                        <div>
                          {new Date(tx.createdAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {new Date(tx.createdAt).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Company & User */}
                      <td className="py-3.5">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <span>{tx.companyName}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          {tx.userName} • {tx.userEmail}
                        </div>
                      </td>

                      {/* Plan & Value */}
                      <td className="py-3.5 font-mono">
                        <div className="text-cyan-300 font-bold">{tx.planName}</div>
                        <div className="text-white font-black text-xs">
                          R$ {tx.amount.toLocaleString('pt-BR')},00
                        </div>
                        <span className="text-[10px] text-slate-400 uppercase font-semibold">
                          {tx.billingCycle === 'yearly' ? 'Anual' : 'Mensal'}
                        </span>
                      </td>

                      {/* Receipt Code */}
                      <td className="py-3.5">
                        {tx.receiptDetails ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[11px] text-amber-300 bg-amber-950/40 border border-amber-500/30 px-2 py-0.5 rounded max-w-[200px] truncate select-all block">
                                {tx.receiptDetails}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyCode(tx.id, tx.receiptDetails || '')}
                                title="Copiar código para conferir no app do banco"
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                              >
                                {copiedCodeId === tx.id ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                            {tx.customerNotes && (
                              <p className="text-[10px] text-slate-400 truncate max-w-[220px]" title={tx.customerNotes}>
                                Obs: {tx.customerNotes}
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono italic">
                            Aguardando cliente enviar comprovante
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 whitespace-nowrap">
                        {renderStatusBadge(tx.status)}
                      </td>

                      {/* Decision Details / Audit Trail */}
                      <td className="py-3.5 text-[11px]">
                        {tx.status === 'APROVADO' && (
                          <div className="space-y-0.5 font-mono">
                            <span className="text-emerald-400 block font-semibold">
                              Liberado por {tx.decisionBy || 'Proprietário'}
                            </span>
                            {tx.decisionAt && (
                              <span className="text-[10px] text-slate-500 block">
                                em {new Date(tx.decisionAt).toLocaleDateString('pt-BR')} às {new Date(tx.decisionAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            )}
                            {tx.adminNotes && (
                              <span className="text-[10px] text-slate-400 block italic">
                                "{tx.adminNotes}"
                              </span>
                            )}
                          </div>
                        )}
                        {tx.status === 'RECUSADO' && (
                          <div className="space-y-0.5 font-mono text-rose-400">
                            <span className="font-semibold block">
                              Recusado por {tx.decisionBy || 'Proprietário'}
                            </span>
                            {tx.adminNotes && (
                              <span className="text-[10px] text-slate-400 block italic">
                                Motivo: {tx.adminNotes}
                              </span>
                            )}
                          </div>
                        )}
                        {tx.status === 'EM_ANALISE' && (
                          <span className="text-amber-400 font-mono text-[11px]">
                            Aguardando conferência do extrato Pix
                          </span>
                        )}
                        {tx.status === 'PENDENTE' && (
                          <span className="text-slate-500 font-mono text-[11px]">
                            Aguardando transferência bancária
                          </span>
                        )}
                      </td>

                      {/* Action Button */}
                      <td className="py-3.5 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          {tx.status === 'EM_ANALISE' ? (
                            <>
                              <button
                                onClick={() => handleOpenDecisionModal(tx, 'approve')}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-semibold cursor-pointer shadow-md inline-flex items-center gap-1.5 transition-all"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprovar Pix</span>
                              </button>
                              <button
                                onClick={() => handleOpenDecisionModal(tx, 'reject')}
                                className="px-2.5 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-mono text-xs cursor-pointer"
                              >
                                Recusar
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleOpenDecisionModal(tx, 'details')}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-300 font-mono text-xs cursor-pointer border border-slate-700 inline-flex items-center gap-1.5"
                            >
                              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                              <span>Inspecionar</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* MODAL: AUDITORIA & DECISÃO MANUAL DO PROPRIETÁRIO          */}
      {/* ========================================================== */}
      {selectedTransaction && decisionModalMode && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-cyan-500/40 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 text-xs relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={handleCloseModal}
              disabled={isSubmitting}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Title */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <h3 className="text-base font-bold text-white">
                  {decisionModalMode === 'approve'
                    ? 'Aprovação Manual & Liberação de Acesso'
                    : decisionModalMode === 'reject'
                    ? 'Recusa de Pagamento Pix'
                    : 'Auditoria de Transação Pix'}
                </h3>
              </div>
              <p className="text-slate-400 text-xs">
                Conferência de recebimento no extrato bancário oficial e liberação do workspace.
              </p>
            </div>

            {/* Feedback alert */}
            {feedbackMessage && (
              <div
                className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  feedbackMessage.type === 'success'
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
                }`}
              >
                {feedbackMessage.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{feedbackMessage.text}</span>
              </div>
            )}

            {/* Transaction Inspection Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2.5 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Empresa:</span>
                <span className="text-white font-bold">{selectedTransaction.companyName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Responsável:</span>
                <span className="text-slate-200">
                  {selectedTransaction.userName} ({selectedTransaction.userEmail})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plano Selecionado:</span>
                <span className="text-cyan-300 font-bold">
                  {selectedTransaction.planName} ({selectedTransaction.billingCycle})
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                <span className="text-slate-300">Valor Esperado:</span>
                <span className="text-emerald-400 font-black text-base">
                  R$ {selectedTransaction.amount.toLocaleString('pt-BR')},00
                </span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                <span>Chave Pix Oficial:</span>
                <span className="text-slate-200">{PIX_OFFICIAL_KEY} ({PIX_BENEFICIARY})</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-slate-400">
                <span>Estado Atual:</span>
                <div>{renderStatusBadge(selectedTransaction.status)}</div>
              </div>
            </div>

            {/* Receipt Inspection Area */}
            <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-300 uppercase tracking-wider font-semibold">
                  Comprovante / Código Informado pelo Cliente:
                </span>
                {selectedTransaction.receiptDetails && (
                  <button
                    type="button"
                    onClick={() => handleCopyCode('modal', selectedTransaction.receiptDetails || '')}
                    className="text-[10px] text-cyan-400 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                  >
                    {copiedCodeId === 'modal' ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copiar Código</span>
                      </>
                    )}
                  </button>
                )}
              </div>
              <div className="p-2.5 rounded-lg bg-[#080d1a] border border-cyan-500/20 font-mono text-xs text-white break-all select-all">
                {selectedTransaction.receiptDetails || (
                  <span className="text-slate-500 italic">Cliente não forneceu código específico.</span>
                )}
              </div>
              {selectedTransaction.customerNotes && (
                <p className="text-[11px] text-slate-300 italic pt-1">
                  Observações do cliente: "{selectedTransaction.customerNotes}"
                </p>
              )}
            </div>

            {/* Audit Justification Field */}
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1 font-medium">
                {decisionModalMode === 'reject'
                  ? 'Motivo da Recusa (obrigatório para informar o cliente):'
                  : 'Anotações de Auditoria do Proprietário (opcional):'}
              </label>
              <textarea
                rows={2}
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={
                  decisionModalMode === 'reject'
                    ? 'Ex: Valor não identificado no extrato da chave Pix até o momento.'
                    : 'Ex: Pagamento conferido no extrato bancário. Liberação autorizada por Alifer Madeiro.'
                }
                className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-cyan-500 font-mono"
              />
            </div>

            {/* Buttons & Decision Dispatch */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleCloseModal}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer disabled:opacity-50"
              >
                Cancelar
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                {decisionModalMode !== 'approve' && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleExecuteDecision('RECUSADO')}
                    className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border border-rose-500/30 font-semibold text-xs cursor-pointer disabled:opacity-50"
                  >
                    Recusar Pagamento
                  </button>
                )}

                {decisionModalMode !== 'reject' && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleExecuteDecision('APROVADO')}
                    className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs cursor-pointer shadow-lg hover:brightness-110 flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>APROVAR & LIBERAR ACESSO</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
