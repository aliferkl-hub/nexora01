import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Check,
  Zap,
  Shield,
  Crown,
  Sparkles,
  ArrowRight,
  Clock,
  Download,
  CheckCircle2,
  Copy,
  AlertCircle,
  MessageCircle,
  RefreshCw,
  QrCode,
  FileCheck,
  Send,
  X,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlanConfig, PaymentTransaction, PaymentStatus } from '../../types';

export const PlansBillingModule: React.FC = () => {
  const { company, user } = useAuth();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [myPayments, setMyPayments] = useState<PaymentTransaction[]>([]);
  const [loadingPayments, setLoadingPayments] = useState(false);

  // Modals
  const [selectedPlan, setSelectedPlan] = useState<PlanConfig | null>(null);
  const [paymentMethodModal, setPaymentMethodModal] = useState<'pix' | 'card_installments' | null>(null);

  // Pix flow states
  const [activePayment, setActivePayment] = useState<PaymentTransaction | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [receiptCode, setReceiptCode] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [submittingReceipt, setSubmittingReceipt] = useState(false);
  const [receiptSuccessMsg, setReceiptSuccessMsg] = useState<string | null>(null);
  const [pixError, setPixError] = useState<string | null>(null);

  // Card installments flow states
  const [desiredInstallments, setDesiredInstallments] = useState<string>('3x');

  const PIX_KEY = '11973479473';
  const PIX_BENEFICIARY = 'Alifer Madeiro / NEXORA AI';
  const WHATSAPP_CONTACT = '5511973479473';

  const loadPlans = async () => {
    try {
      const data = await api.plans.list();
      setPlans(data);
    } catch (err) {
      console.error('Erro ao carregar planos:', err);
    }
  };

  const loadMyPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await api.payments.getMyPayments();
      setMyPayments(data);
    } catch (err) {
      console.error('Erro ao carregar pagamentos:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    Promise.all([loadPlans(), loadMyPayments()]).finally(() => setLoading(false));
  }, [company?.id]);

  const handleSelectPlan = (plan: PlanConfig) => {
    setSelectedPlan(plan);
    setPaymentMethodModal('pix');
    setActivePayment(null);
    setReceiptCode('');
    setCustomerNotes('');
    setReceiptSuccessMsg(null);
    setPixError(null);
  };

  const handleCopyPix = () => {
    navigator.clipboard.writeText(PIX_KEY);
    setPixCopied(true);
    setTimeout(() => setPixCopied(false), 3000);
  };

  const handleCreatePixPayment = async () => {
    if (!selectedPlan) return;
    setPixError(null);
    try {
      const payment = await api.payments.createPayment({
        planId: selectedPlan.id,
        billingCycle,
        method: 'PIX',
        customerNotes: `Início de pagamento via Pix para ${selectedPlan.name}`,
      });
      setActivePayment(payment);
      loadMyPayments();
    } catch (err: any) {
      setPixError(err.message || 'Erro ao gerar ordem de pagamento Pix.');
    }
  };

  const handleSubmitReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePayment && selectedPlan) {
      // Create payment first if not yet created
      try {
        const payment = await api.payments.createPayment({
          planId: selectedPlan.id,
          billingCycle,
          method: 'PIX',
          customerNotes,
        });
        await api.payments.submitReceipt(payment.id, {
          receiptDetails: receiptCode,
          customerNotes,
        });
        setReceiptSuccessMsg('Comprovante enviado com sucesso! O pagamento está em análise pelo administrador.');
        loadMyPayments();
      } catch (err: any) {
        setPixError(err.message || 'Erro ao registrar comprovante.');
      }
      return;
    }

    if (!activePayment) return;
    if (!receiptCode.trim()) {
      setPixError('Por favor, informe o código da transação Pix ou cole o texto do comprovante.');
      return;
    }

    setSubmittingReceipt(true);
    setPixError(null);
    try {
      await api.payments.submitReceipt(activePayment.id, {
        receiptDetails: receiptCode,
        customerNotes,
      });
      setReceiptSuccessMsg('Comprovante enviado com sucesso! O pagamento está em análise pelo administrador.');
      loadMyPayments();
    } catch (err: any) {
      setPixError(err.message || 'Erro ao enviar comprovante.');
    } finally {
      setSubmittingReceipt(false);
    }
  };

  const buildWhatsappLink = () => {
    if (!selectedPlan) return '#';
    const amount = billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
    const cycleText = billingCycle === 'yearly' ? 'Anual' : 'Mensal';
    const msg = `Olá, responsável da NEXORA AI! Gostaria de combinar o pagamento parcelado no cartão para a contratação da plataforma.\n\n*Empresa:* ${company?.name || 'Não informada'}\n*Responsável:* ${user?.name || 'Cliente'}\n*Plano Escolhido:* ${selectedPlan.name}\n*Valor Total:* R$ ${amount},00 (${cycleText})\n*Parcelas Pretendidas:* ${desiredInstallments}\n\nAguardo as instruções para prosseguir com a ativação!`;
    return `https://wa.me/${WHATSAPP_CONTACT}?text=${encodeURIComponent(msg)}`;
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'APROVADO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold uppercase">
            Aprovado
          </span>
        );
      case 'EM_ANALISE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold uppercase">
            Em Análise
          </span>
        );
      case 'PENDENTE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold uppercase">
            Pendente
          </span>
        );
      case 'RECUSADO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold uppercase">
            Recusado
          </span>
        );
      case 'CANCELADO':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-500/20 text-slate-400 border border-slate-500/30 font-semibold uppercase">
            Cancelado
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-500/20 text-slate-400">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
        <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
        <span>Carregando planos da NEXORA AI...</span>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pb-2">
        <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Planos Transparentes & Liberação Oficial
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Assinatura & Investimento NEXORA AI
        </h1>
        <p className="text-xs text-slate-400">
          Pagamento direto via Pix ou cartão de crédito parcelado com atendimento dedicado.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <span className={`text-xs ${billingCycle === 'monthly' ? 'text-white font-medium' : 'text-slate-400'}`}>
            Cobrança Mensal
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 rounded-full bg-slate-800 border border-slate-700 p-0.5 relative transition-colors cursor-pointer"
            aria-label="Alternar ciclo de faturamento"
          >
            <div
              className={`w-5 h-5 rounded-full bg-cyan-400 transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs ${billingCycle === 'yearly' ? 'text-cyan-400 font-medium' : 'text-slate-400'}`}>
            Cobrança Anual <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded font-mono">Economia Garantida</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = company?.plan === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);
          const totalYearly = plan.priceYearly;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 backdrop-blur-md flex flex-col justify-between transition-all relative ${
                plan.popular
                  ? 'bg-[#0f172a] border-2 border-cyan-500/60 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
                  : 'bg-[#0c1220]/80 border border-slate-800/90'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-[10px] tracking-wider uppercase font-mono shadow-md">
                  Recomendado
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  {isCurrentPlan && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Plano Ativo
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-400 min-h-[32px]">{plan.description}</p>

                <div className="my-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-slate-400">R$</span>
                    <span className="text-3xl font-black text-white font-mono">{price}</span>
                    <span className="text-xs text-slate-400">/mês</span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                      Total anual: R$ {totalYearly},00
                    </span>
                  )}
                </div>

                {/* Quotas */}
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-300 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Limite de Leads:</span>
                    <span className="font-semibold text-white">{plan.leadsLimit.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Créditos de IA:</span>
                    <span className="font-semibold text-cyan-400">{plan.aiCredits.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Automações:</span>
                    <span className="font-semibold text-white">{plan.automationsLimit} ativas</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-2.5 text-xs text-slate-300">
                  <span className="text-[10px] font-mono uppercase text-slate-500 font-semibold block mb-1">
                    Benefícios Inclusos:
                  </span>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80 space-y-2">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-2.5 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:brightness-110'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Pagar via Pix (Chave Oficial)</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedPlan(plan);
                    setPaymentMethodModal('card_installments');
                  }}
                  className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Cartão Parcelado (Atendimento)</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real Billing History */}
      <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white">Histórico Real de Cobranças & Pagamentos</h2>
            <p className="text-xs text-slate-400">
              Acompanhe o estado de aprovação de pagamentos por Pix e atendimentos de parcelamento da sua empresa.
            </p>
          </div>
          <button
            onClick={loadMyPayments}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 cursor-pointer"
            title="Atualizar histórico"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingPayments ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>
        </div>

        {myPayments.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs border border-dashed border-slate-800 rounded-xl space-y-2">
            <Clock className="w-6 h-6 text-slate-500 mx-auto" />
            <p className="text-slate-300 font-medium">Nenhum pagamento registrado ainda para sua empresa.</p>
            <p className="text-slate-500 text-[11px]">
              Selecione um dos planos acima para iniciar o pagamento via Pix ou combinar o parcelamento com o proprietário.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                  <th className="pb-3">Data</th>
                  <th className="pb-3">Plano</th>
                  <th className="pb-3">Valor</th>
                  <th className="pb-3">Método</th>
                  <th className="pb-3">Situação</th>
                  <th className="pb-3">Comprovante / Decisão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {myPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40">
                    <td className="py-3 font-mono text-slate-300 text-[11px]">
                      {new Date(p.createdAt).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 font-semibold text-white">
                      {p.planName} ({p.billingCycle === 'yearly' ? 'Anual' : 'Mensal'})
                    </td>
                    <td className="py-3 font-mono text-slate-200">
                      R$ {p.amount.toLocaleString('pt-BR')},00
                    </td>
                    <td className="py-3 font-mono text-slate-400 text-[11px]">
                      {p.method === 'PIX' ? 'Pix (11973479473)' : 'Cartão Parcelado'}
                    </td>
                    <td className="py-3">{getStatusBadge(p.status)}</td>
                    <td className="py-3 text-[11px] text-slate-300">
                      {p.status === 'APROVADO' && (
                        <span className="text-emerald-400 flex items-center gap-1 font-mono">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Liberado por {p.decisionBy || 'Administrador'}</span>
                        </span>
                      )}
                      {p.status === 'EM_ANALISE' && (
                        <span className="text-amber-400 font-mono">Comprovante em análise pelo administrador</span>
                      )}
                      {p.status === 'PENDENTE' && (
                        <span className="text-blue-400 font-mono">Aguardando envio do comprovante</span>
                      )}
                      {p.status === 'RECUSADO' && (
                        <span className="text-rose-400 font-mono">
                          {p.adminNotes ? `Recusado: ${p.adminNotes}` : 'Recusado pelo administrador'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ========================================================== */}
      {/* MODAL 1: PAGAMENTO VIA PIX COM CHAVE OFICIAL 11973479473   */}
      {/* ========================================================== */}
      {paymentMethodModal === 'pix' && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-cyan-500/40 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 text-xs relative max-h-[90vh] overflow-y-auto custom-scrollbar">
            <button
              onClick={() => {
                setPaymentMethodModal(null);
                setSelectedPlan(null);
              }}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Fechar janela de pagamento"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal Header */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="p-1 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  <QrCode className="w-4 h-4" />
                </span>
                <h2 className="text-base font-bold text-white">Pagamento via Pix Oficial</h2>
              </div>
              <p className="text-slate-400 text-xs">
                Transfira o valor exato pelo aplicativo do seu banco utilizando a chave Pix do proprietário.
              </p>
            </div>

            {/* Value & Plan Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Plano Selecionado:</span>
                <span className="text-white font-bold">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Ciclo de Cobrança:</span>
                <span className="text-cyan-400 font-mono uppercase font-semibold">
                  {billingCycle === 'yearly' ? 'Anual' : 'Mensal'}
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                <span className="text-slate-300 font-medium">Valor Exato a Pagar:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  R$ {(billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly).toLocaleString('pt-BR')},00
                </span>
              </div>
            </div>

            {/* Chave Pix & Copy Button */}
            <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-cyan-300 font-semibold uppercase tracking-wider">
                  Chave Pix (Telefone / Celular)
                </span>
                <span className="text-[10px] font-mono text-slate-400">Exclusiva & Oficial</span>
              </div>

              <div className="flex items-center justify-between gap-2 bg-[#080d1a] border border-cyan-500/30 rounded-xl p-3 font-mono">
                <span className="text-sm font-bold text-white select-all tracking-wider">{PIX_KEY}</span>
                <button
                  type="button"
                  onClick={handleCopyPix}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    pixCopied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-md'
                  }`}
                >
                  {pixCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>COPIADA!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>COPIAR CHAVE PIX</span>
                    </>
                  )}
                </button>
              </div>

              {/* Beneficiary */}
              <div className="text-[11px] text-slate-300 space-y-1 pt-1 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiário:</span>
                  <span className="text-white font-semibold">{PIX_BENEFICIARY}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Instituição:</span>
                  <span className="text-slate-200">Banco Digital / Pix Vinculado</span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="text-xs text-slate-300 space-y-2 bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <FileCheck className="w-4 h-4 text-cyan-400" />
                <span>Instruções para Conclusão da Contratação:</span>
              </p>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                <li>Abra o aplicativo do seu banco e escolha a opção <strong>Pix &gt; Transferir</strong>.</li>
                <li>Selecione a chave <strong>Celular</strong> e cole <strong>{PIX_KEY}</strong>.</li>
                <li>Confira o beneficiário (<strong>Alifer Madeiro</strong>) e transfira o valor exato.</li>
                <li>Envie abaixo o código/linha do comprovante ou envie diretamente ao administrador.</li>
              </ol>
            </div>

            {/* Receipt Submission Form */}
            {receiptSuccessMsg ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-bold text-sm text-white">Comprovante Recebido com Sucesso!</p>
                <p className="text-[11px] text-emerald-400">
                  {receiptSuccessMsg}
                </p>
                <p className="text-[10px] text-slate-400 pt-1 font-mono">
                  Estado Atual: <strong>EM ANÁLISE</strong>. Assim que a equipe conferir o recebimento, o plano será liberado automaticamente.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMethodModal(null);
                    setSelectedPlan(null);
                  }}
                  className="mt-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs cursor-pointer"
                >
                  Fechar Janela
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitReceipt} className="space-y-3 pt-1">
                <div>
                  <label className="block text-[11px] font-mono text-slate-300 mb-1 font-medium">
                    Código de Autenticação / Linha do Comprovante Pix:
                  </label>
                  <input
                    type="text"
                    required
                    value={receiptCode}
                    onChange={(e) => setReceiptCode(e.target.value)}
                    placeholder="Ex: E0003816620261014184000000000 ou ID da Transação"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    Observações Adicionais (Banco Emissor, Horário, Titular):
                  </label>
                  <textarea
                    rows={2}
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    placeholder="Ex: Pix feito via Nubank às 14:32 em nome da empresa"
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-xs font-mono"
                  />
                </div>

                {pixError && (
                  <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{pixError}</span>
                  </div>
                )}

                <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-[11px] text-amber-300 flex items-start gap-2">
                  <Shield className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>
                    <strong>Importante:</strong> A liberação do plano é realizada após a conferência e aprovação do administrador, garantindo conformidade financeira.
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethodModal(null);
                      setSelectedPlan(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer text-xs"
                  >
                    Voltar aos Planos
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReceipt}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold cursor-pointer shadow-md hover:brightness-110 flex items-center gap-2 disabled:opacity-50 text-xs"
                  >
                    {submittingReceipt ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Enviando...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Enviar Comprovante ao Administrador</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* MODAL 2: CARTÃO DE CRÉDITO PARCELADO — FALAR COM O PROPRIETÁRIO */}
      {/* ========================================================== */}
      {paymentMethodModal === 'card_installments' && selectedPlan && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-indigo-500/40 rounded-3xl w-full max-w-lg p-6 sm:p-7 shadow-2xl space-y-5 text-xs relative">
            <button
              onClick={() => {
                setPaymentMethodModal(null);
                setSelectedPlan(null);
              }}
              className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              aria-label="Fechar janela"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Exact Required Title & Message */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  <CreditCard className="w-4 h-4" />
                </span>
                <h2 className="text-base sm:text-lg font-black text-white">
                  Vamos combinar seu pagamento
                </h2>
              </div>
              <p className="text-slate-300 text-xs leading-relaxed">
                Você escolheu pagar seu plano parcelado. Entre em contato com o responsável pela NEXORA AI para combinar as condições de pagamento e receber as instruções para concluir sua contratação.
              </p>
            </div>

            {/* Plan Details Box */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 font-mono">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Plano Selecionado:</span>
                <span className="text-white font-bold text-sm">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Preço Total:</span>
                <span className="text-emerald-400 font-bold text-base">
                  R$ {(billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly).toLocaleString('pt-BR')},00
                </span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                <span className="text-slate-300 font-sans">Quantidade de Parcelas Pretendida:</span>
                <select
                  value={desiredInstallments}
                  onChange={(e) => setDesiredInstallments(e.target.value)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
                >
                  <option value="1x à vista">1x à vista</option>
                  <option value="2x sem juros">2x</option>
                  <option value="3x">3x</option>
                  <option value="4x">4x</option>
                  <option value="5x">5x</option>
                  <option value="6x">6x</option>
                  <option value="10x">10x</option>
                  <option value="12x">12x</option>
                </select>
              </div>
            </div>

            {/* Safety Notice */}
            <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold text-white">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
                <span>Atendimento Seguro e Sem Coleta de Dados do Cartão:</span>
              </div>
              <p className="text-slate-400 text-[10px]">
                Esta opção é um atendimento direto para combinar as condições comerciais. Nunca informe o número completo do cartão, CVV ou senhas bancárias por chat.
              </p>
            </div>

            {/* Buttons: FALAR COM O RESPONSÁVEL & VOLTAR AOS PLANOS */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setPaymentMethodModal(null);
                  setSelectedPlan(null);
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs cursor-pointer transition-colors"
              >
                VOLTAR AOS PLANOS
              </button>

              <a
                href={buildWhatsappLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-bold text-xs cursor-pointer shadow-lg hover:brightness-110 flex items-center justify-center gap-2 transition-all uppercase tracking-wider font-mono"
              >
                <MessageCircle className="w-4 h-4" />
                <span>FALAR COM O RESPONSÁVEL</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
