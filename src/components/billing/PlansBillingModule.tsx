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
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { PlanConfig } from '../../types';

export const PlansBillingModule: React.FC = () => {
  const { company } = useAuth();
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState(true);
  const [checkoutModalPlan, setCheckoutModalPlan] = useState<PlanConfig | null>(null);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  useEffect(() => {
    api.admin.getPlans().then(setPlans).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleSimulateCheckout = (plan: PlanConfig) => {
    setCheckoutModalPlan(plan);
    setCheckoutSuccess(false);
  };

  const handleConfirmPayment = () => {
    setCheckoutSuccess(true);
    setTimeout(() => {
      setCheckoutModalPlan(null);
      setCheckoutSuccess(false);
    }, 2500);
  };

  if (loading) {
    return <div className="p-8 text-center text-slate-400 text-xs">Carregando planos...</div>;
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 pb-4">
        <span className="px-3 py-1 rounded-full text-xs font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          Planos Transparentes & Escaláveis
        </span>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Acelere seu Crescimento com o NEXORA AI
        </h1>
        <p className="text-xs text-slate-400">
          Escolha o plano ideal para as necessidades operacionais de marketing, vendas e automação da sua empresa.
        </p>

        {/* Monthly / Yearly Billing Toggle */}
        <div className="pt-3 flex items-center justify-center gap-3">
          <span className={`text-xs ${billingCycle === 'monthly' ? 'text-white font-medium' : 'text-slate-400'}`}>
            Cobrança Mensal
          </span>
          <button
            onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
            className="w-12 h-6 rounded-full bg-slate-800 border border-slate-700 p-0.5 relative transition-colors cursor-pointer"
          >
            <div
              className={`w-5 h-5 rounded-full bg-cyan-400 transition-transform ${
                billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-0'
              }`}
            />
          </button>
          <span className={`text-xs ${billingCycle === 'yearly' ? 'text-cyan-400 font-medium' : 'text-slate-400'}`}>
            Cobrança Anual <span className="text-[10px] bg-cyan-500/20 px-1.5 py-0.5 rounded font-mono">Economize 20%</span>
          </span>
        </div>
      </div>

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {plans.map((plan) => {
          const isCurrentPlan = company?.plan === plan.id;
          const price = billingCycle === 'monthly' ? plan.priceMonthly : Math.round(plan.priceYearly / 12);

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
                  Mais Escolhido
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-base font-bold text-white">{plan.name}</h3>
                  {isCurrentPlan && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Plano Atual
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
                      Faturado anualmente: R$ {plan.priceYearly}
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
                    Recursos Inclusos:
                  </span>
                  {plan.features.map((feat, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800/80">
                <button
                  onClick={() => handleSimulateCheckout(plan)}
                  className={`w-full py-2.5 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isCurrentPlan
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:brightness-110'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <span>{isCurrentPlan ? 'Gerenciar Assinatura' : 'Assinar Plano'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Billing History */}
      <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h2 className="text-sm font-bold text-white">Histórico de Faturas & Pagamentos</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 font-medium text-[11px]">
                <th className="pb-3">Data da Fatura</th>
                <th className="pb-3">Descrição</th>
                <th className="pb-3">Valor</th>
                <th className="pb-3">Método</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right">Comprovante</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              <tr className="hover:bg-slate-900/40">
                <td className="py-3 font-mono text-slate-300">01/10/2026</td>
                <td className="py-3 font-semibold text-white">Assinatura Mensal — Plano {company?.plan?.toUpperCase()}</td>
                <td className="py-3 font-mono text-slate-200">R$ 497,00</td>
                <td className="py-3 text-slate-400 font-mono">Cartão de Crédito •••• 4242</td>
                <td className="py-3">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                    Pago
                  </span>
                </td>
                <td className="py-3 text-right">
                  <button className="text-cyan-400 hover:underline inline-flex items-center gap-1 text-xs">
                    <Download className="w-3 h-3" />
                    <span>Recibo</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal Simulation */}
      {checkoutModalPlan && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4 text-xs">
            <h2 className="text-base font-bold text-white">Confirmar Upgrade de Plano</h2>
            <p className="text-slate-400">
              Você está alterando sua assinatura para o plano{' '}
              <strong className="text-white">{checkoutModalPlan.name}</strong> (R${' '}
              {checkoutModalPlan.priceMonthly}/mês).
            </p>

            {checkoutSuccess ? (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="font-semibold text-sm text-white">Assinatura confirmada com sucesso!</p>
                <p className="text-[11px] text-emerald-400">
                  Os novos limites e recursos foram liberados para o workspace.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Plano Selecionado:</span>
                    <span className="text-white font-bold">{checkoutModalPlan.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ciclo de Cobrança:</span>
                    <span className="text-cyan-400 uppercase">{billingCycle}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-800 pt-1 text-sm font-bold">
                    <span className="text-slate-300">Total:</span>
                    <span className="text-emerald-400">R$ {checkoutModalPlan.priceMonthly},00</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Ambiente seguro com criptografia ponta a ponta e emissão automática de NF-e.</span>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCheckoutModalPlan(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmPayment}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-medium cursor-pointer shadow-md"
                  >
                    Confirmar Contratação
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
