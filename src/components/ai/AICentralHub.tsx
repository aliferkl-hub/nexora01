import React, { useState } from 'react';
import {
  Sparkles,
  Target,
  ShoppingBag,
  PenTool,
  Headphones,
  BarChart,
  Lightbulb,
  FileText,
  Copy,
  Check,
  RefreshCw,
  Send,
  Save,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface AICentralHubProps {
  onNavigate: (section: string) => void;
}

type AIToolKey =
  | 'marketing-assistant'
  | 'sales-assistant'
  | 'content-studio'
  | 'customer-service'
  | 'business-analysis'
  | 'strategy-generator'
  | 'campaign-ideas'
  | 'text-summarizer';

interface ToolMeta {
  id: AIToolKey;
  title: string;
  category: string;
  description: string;
  icon: any;
  color: string;
}

export const AICentralHub: React.FC<AICentralHubProps> = ({ onNavigate }) => {
  const { company } = useAuth();

  const tools: ToolMeta[] = [
    {
      id: 'marketing-assistant',
      title: 'Assistente de Marketing',
      category: 'Estratégia & UVP',
      description: 'Elabore planos táticos de atração, posicionamento de marca e metas mensuráveis.',
      icon: Target,
      color: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'sales-assistant',
      title: 'Assistente de Vendas',
      category: 'Comercial & Fechamento',
      description: 'Gere discursos persuasivos, quebra de objeções e perguntas de qualificação SPIN.',
      icon: ShoppingBag,
      color: 'from-indigo-600 to-purple-600',
    },
    {
      id: 'content-studio',
      title: 'Assistente de Conteúdo',
      category: 'Redes Sociais & Copy',
      description: 'Crie posts de alto impacto para Instagram, LinkedIn, roteiros de Reels e e-mails.',
      icon: PenTool,
      color: 'from-purple-600 to-pink-500',
    },
    {
      id: 'customer-service',
      title: 'Atendimento & Suporte',
      category: 'Relacionamento',
      description: 'Redija respostas rápidas, empáticas e consultivas para dúvidas de clientes.',
      icon: Headphones,
      color: 'from-cyan-600 to-blue-500',
    },
    {
      id: 'business-analysis',
      title: 'Análise Empresarial',
      category: 'Diagnóstico & SWOT',
      description: 'Identifique gargalos de receita, ameaças competitivas e oportunidades em 90 dias.',
      icon: BarChart,
      color: 'from-emerald-600 to-teal-500',
    },
    {
      id: 'strategy-generator',
      title: 'Estratégias Comerciais',
      category: 'Crescimento Rápido',
      description: 'Descubra estratégias de tração rápida (Quick Wins) e diferenciais competitivos.',
      icon: Lightbulb,
      color: 'from-amber-600 to-orange-500',
    },
    {
      id: 'campaign-ideas',
      title: 'Ideias de Campanhas',
      category: 'Anúncios Digitais',
      description: 'Gere 3 conceitos criativos completos para Meta Ads e Google Ads com copies e públicos.',
      icon: Sparkles,
      color: 'from-violet-600 to-indigo-500',
    },
    {
      id: 'text-summarizer',
      title: 'Resumo & Análise de Dados',
      category: 'Inteligência',
      description: 'Extraia os principais insights executivos de relatórios, briefings ou reuniões.',
      icon: FileText,
      color: 'from-rose-600 to-red-500',
    },
  ];

  const [selectedTool, setSelectedTool] = useState<AIToolKey>('marketing-assistant');
  const [params, setParams] = useState<Record<string, any>>({
    industry: company?.industry || 'Tecnologia & Serviços',
    objective: 'Aumentar aquisição de clientes qualificados em 40%',
    budget: 'R$ 8.000 / mês',
    targetAudience: 'CEOs e Diretores Comerciais',
    channels: 'Meta Ads, Google Ads e LinkedIn',
    productName: 'Plataforma SaaS Corporativa',
    ticket: '12000',
    buyerPersona: 'Diretor de Operações',
    mainObjection: 'Nosso orçamento atual já está comprometido',
    platform: 'LinkedIn & Instagram',
    topic: 'Tendências e Impacto de IA nos Negócios em 2026',
    tone: 'Profissional, inovador e provocativo',
    goal: 'Gerar leads qualificados via inbox',
    offerDetails: 'Demonstração gratuita de 15 minutos do NEXORA AI',
    customerMessage: 'Gostaria de saber os prazos de implantação e valores dos planos.',
    policy: 'Atendimento consultivo, acolhedor e direcionamento para especialista.',
    companyName: company?.name || 'Nexora Tech',
    revenue: 'R$ 150.000 / mês',
    bottlenecks: 'Dificuldade de qualificar contatos e lentidão na resposta inicial.',
    niche: 'B2B e Serviços Especializados',
    growthGoal: 'Dobrar carteira ativa nos próximos 6 meses',
    differentiator: 'IA integrada em tempo real com automações e webhooks',
    product: 'Assinatura Premium de IA & Automação',
    adPlatforms: 'Meta Ads e Google Ads',
    rawText: '',
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [isDemoNotice, setIsDemoNotice] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  const handleParamChange = (key: string, value: string) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setResult(null);
    setSavedStatus(null);
    setIsDemoNotice(false);

    try {
      const res = await api.ai.generate(selectedTool, params);
      setResult(res.content);
      setIsDemoNotice(res.isDemo);
    } catch (err: any) {
      setResult(`Erro na geração: ${err.message || 'Verifique as configurações do servidor.'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToContent = async () => {
    if (!result) return;
    try {
      await api.content.createItem({
        title: `Geração IA: ${tools.find((t) => t.id === selectedTool)?.title}`,
        platform: 'linkedin',
        body: result,
        category: 'Geração por IA',
        status: 'draft',
      });
      setSavedStatus('Salvo com sucesso no Estúdio de Conteúdo!');
    } catch (err: any) {
      setSavedStatus('Erro ao salvar no Estúdio.');
    }
  };

  const handleSaveToMarketingPlan = async () => {
    if (!result) return;
    try {
      await api.marketing.createPlan({
        title: `Estratégia IA - ${new Date().toLocaleDateString('pt-BR')}`,
        targetAudience: params.targetAudience || 'Definido por IA',
        valueProposition: params.differentiator || 'Plataforma NEXORA AI',
        positioning: 'Liderança Tecnológica em IA e Automação',
        goals: ['Implementar recomendações geradas pelo motor de IA'],
        actions: [
          {
            id: `act_${Date.now()}`,
            title: 'Executar plano tático recomendado pela Central de IA',
            priority: 'high',
            deadline: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
            status: 'pending',
          },
        ],
      });
      setSavedStatus('Salvo como novo Plano de Marketing!');
    } catch (err: any) {
      setSavedStatus('Erro ao salvar plano.');
    }
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 text-white">
              <Sparkles className="w-5 h-5 text-cyan-300" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Central de Inteligência Artificial
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Gemini 3.8 Flash
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Selecione uma ferramenta especializada para potencializar marketing, vendas, criativos e estratégias.
          </p>
        </div>
      </div>

      {/* 8 Specialized AI Tools Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {tools.map((t) => {
          const Icon = t.icon;
          const isSelected = selectedTool === t.id;

          return (
            <button
              key={t.id}
              onClick={() => {
                setSelectedTool(t.id);
                setResult(null);
                setSavedStatus(null);
              }}
              className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative overflow-hidden group ${
                isSelected
                  ? 'bg-[#0f172a] border-cyan-500/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                  : 'bg-[#0c1220]/70 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${t.color} flex items-center justify-center text-white mb-2.5 shadow-md`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-bold text-xs text-white leading-snug">{t.title}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{t.category}</p>

              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Workspace: Left Form, Right Generated Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form (5 Cols) */}
        <div className="lg:col-span-5 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-5 backdrop-blur-md space-y-4">
          <div className="border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span>Configuração da Ferramenta</span>
            </h2>
            <p className="text-[11px] text-slate-400 mt-1">
              {tools.find((t) => t.id === selectedTool)?.description}
            </p>
          </div>

          {/* Form Fields Depending on Tool */}
          {selectedTool === 'marketing-assistant' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Setor da Empresa</label>
                <input
                  type="text"
                  value={params.industry}
                  onChange={(e) => handleParamChange('industry', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Objetivo Principal</label>
                <input
                  type="text"
                  value={params.objective}
                  onChange={(e) => handleParamChange('objective', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Público-Alvo (ICP)</label>
                <input
                  type="text"
                  value={params.targetAudience}
                  onChange={(e) => handleParamChange('targetAudience', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Orçamento Mensal</label>
                  <input
                    type="text"
                    value={params.budget}
                    onChange={(e) => handleParamChange('budget', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Canais Desejados</label>
                  <input
                    type="text"
                    value={params.channels}
                    onChange={(e) => handleParamChange('channels', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedTool === 'sales-assistant' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Produto / Solução</label>
                <input
                  type="text"
                  value={params.productName}
                  onChange={(e) => handleParamChange('productName', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Ticket Médio (R$)</label>
                  <input
                    type="text"
                    value={params.ticket}
                    onChange={(e) => handleParamChange('ticket', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Cargo do Comprador</label>
                  <input
                    type="text"
                    value={params.buyerPersona}
                    onChange={(e) => handleParamChange('buyerPersona', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 font-medium">Principal Objeção a Ser Quebrada</label>
                <textarea
                  rows={2}
                  value={params.mainObjection}
                  onChange={(e) => handleParamChange('mainObjection', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {selectedTool === 'content-studio' && (
            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Rede Social</label>
                  <select
                    value={params.platform}
                    onChange={(e) => handleParamChange('platform', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  >
                    <option value="LinkedIn">LinkedIn (B2B)</option>
                    <option value="Instagram">Instagram (Carrossel / Post)</option>
                    <option value="TikTok / Reels">TikTok & Reels (Roteiro Vídeo)</option>
                    <option value="Twitter / X">Twitter / X (Thread)</option>
                    <option value="Newsletter">E-mail Comercial / Newsletter</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Tom de Voz</label>
                  <input
                    type="text"
                    value={params.tone}
                    onChange={(e) => handleParamChange('tone', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 font-medium">Tema / Assunto do Conteúdo</label>
                <input
                  type="text"
                  value={params.topic}
                  onChange={(e) => handleParamChange('topic', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Chamada para Ação Desejada (CTA)</label>
                <input
                  type="text"
                  value={params.goal}
                  onChange={(e) => handleParamChange('goal', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {selectedTool === 'customer-service' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Dúvida ou Mensagem Enviada pelo Cliente</label>
                <textarea
                  rows={3}
                  value={params.customerMessage}
                  onChange={(e) => handleParamChange('customerMessage', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Diretriz de Atendimento</label>
                <input
                  type="text"
                  value={params.policy}
                  onChange={(e) => handleParamChange('policy', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {selectedTool === 'business-analysis' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Nome da Empresa</label>
                <input
                  type="text"
                  value={params.companyName}
                  onChange={(e) => handleParamChange('companyName', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Setor de Mercado</label>
                  <input
                    type="text"
                    value={params.industry}
                    onChange={(e) => handleParamChange('industry', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Faturamento Estimado</label>
                  <input
                    type="text"
                    value={params.revenue}
                    onChange={(e) => handleParamChange('revenue', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-slate-300 font-medium">Principais Desafios / Gargalos</label>
                <textarea
                  rows={2}
                  value={params.bottlenecks}
                  onChange={(e) => handleParamChange('bottlenecks', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {selectedTool === 'strategy-generator' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Nicho / Segmento</label>
                <input
                  type="text"
                  value={params.niche}
                  onChange={(e) => handleParamChange('niche', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Meta de Crescimento</label>
                <input
                  type="text"
                  value={params.growthGoal}
                  onChange={(e) => handleParamChange('growthGoal', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-300 font-medium">Diferencial Único</label>
                <input
                  type="text"
                  value={params.differentiator}
                  onChange={(e) => handleParamChange('differentiator', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {selectedTool === 'campaign-ideas' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Oferta / Produto Anunciado</label>
                <input
                  type="text"
                  value={params.product}
                  onChange={(e) => handleParamChange('product', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Canais de Tráfego</label>
                  <input
                    type="text"
                    value={params.adPlatforms}
                    onChange={(e) => handleParamChange('adPlatforms', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Orçamento Estimado</label>
                  <input
                    type="text"
                    value={params.budget}
                    onChange={(e) => handleParamChange('budget', e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            </div>
          )}

          {selectedTool === 'text-summarizer' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Cole o Texto, Relatório ou Briefing</label>
                <textarea
                  rows={6}
                  placeholder="Cole aqui transcrição de reuniões, histórico de atendimento ou briefing para análise..."
                  value={params.rawText}
                  onChange={(e) => handleParamChange('rawText', e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          {/* Execution Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Processando com IA...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-cyan-300" />
                <span>Gerar Resposta com IA</span>
              </>
            )}
          </button>
        </div>

        {/* Right Output Area (7 Cols) */}
        <div className="lg:col-span-7 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md flex flex-col justify-between min-h-[480px]">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-white">Resultado do Motor NEXORA AI</span>
                {result && !loading && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Concluído
                  </span>
                )}
              </div>

              {result && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {isDemoNotice && (
              <div className="mb-4 p-3 rounded-xl bg-amber-950/30 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2">
                <Info className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <span>
                  Modo Demonstrativo: Configure a chave de API Gemini no painel de segredos para respostas em tempo real.
                </span>
              </div>
            )}

            {savedStatus && (
              <div className="mb-4 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{savedStatus}</span>
              </div>
            )}

            {/* Generated Content Body */}
            {loading ? (
              <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center animate-pulse shadow-[0_0_25px_rgba(59,130,246,0.5)]">
                  <Sparkles className="w-6 h-6 text-cyan-300 animate-spin" />
                </div>
                <p className="text-xs font-mono text-cyan-400">Consultando motor Gemini 3.8 Flash...</p>
                <p className="text-[11px] text-slate-500">
                  Elaborando estratégia com parâmetros empresariais avançados...
                </p>
              </div>
            ) : result ? (
              <div className="prose prose-invert prose-sm max-w-none text-slate-200 text-xs leading-relaxed whitespace-pre-wrap font-sans max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {result}
              </div>
            ) : (
              <div className="py-20 text-center text-slate-500 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs font-medium text-slate-400">Nenhum resultado gerado ainda.</p>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                  Ajuste os parâmetros no formulário à esquerda e clique em "Gerar Resposta com IA" para receber
                  estratégias práticas.
                </p>
              </div>
            )}
          </div>

          {/* Bottom Actions: Save to Studio / Marketing */}
          {result && !loading && (
            <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] text-slate-400 font-mono">Exportar para módulos:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleSaveToContent}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Salvar no Estúdio de Conteúdo</span>
                </button>
                <button
                  onClick={handleSaveToMarketingPlan}
                  className="px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Target className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Salvar como Plano de Marketing</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
