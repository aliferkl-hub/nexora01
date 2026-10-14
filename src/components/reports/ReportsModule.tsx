import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  DollarSign,
  Users,
  Target,
  Sparkles,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
} from 'lucide-react';
import { api } from '../../services/api';

export const ReportsModule: React.FC = () => {
  const [data, setData] = useState<{
    overview: {
      totalLeads: number;
      totalPipeline: number;
      totalWon: number;
      totalSpentAds: number;
      totalAutomationsExecuted: number;
      totalContentCreated: number;
    };
    sourceReport: Array<{
      source: string;
      leads: number;
      pipeline: number;
      won: number;
      conversionRate: string;
    }>;
    campaignPerformance: Array<{
      name: string;
      platform: string;
      spent: number;
      conversions: number;
      cpa: number;
      roi: string;
      status: string;
    }>;
  } | null>(null);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.reports.getReports().then(setData).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleExportCSV = () => {
    if (!data) return;
    let csv = 'Canal / Origem,Total de Leads,Pipeline Gerado (R$),Contratos Fechados,Taxa de Conversao\n';
    data.sourceReport.forEach((s) => {
      csv += `"${s.source}",${s.leads},${s.pipeline},${s.won},"${s.conversionRate}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `relatorio_comercial_nexora_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPDF = () => {
    window.print();
  };

  if (loading || !data) {
    return <div className="p-8 text-center text-slate-400 text-xs">Carregando inteligência comercial...</div>;
  }

  const { overview, sourceReport, campaignPerformance } = data;

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto print:p-0 print:bg-white print:text-black">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80 print:border-gray-300">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30 print:hidden">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight print:text-black">
              Relatórios & Inteligência Comercial
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1 print:text-gray-600">
            Consolidação de conversão por canal de aquisição, eficiência de tráfego e volume de fechamento.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={handleExportCSV}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
          <button
            onClick={handlePrintPDF}
            className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(59,130,246,0.25)]"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md print:bg-gray-100 print:border-gray-300">
          <span className="text-xs text-slate-400 print:text-gray-600">Pipeline Total Medido</span>
          <p className="text-xl font-bold text-white font-mono mt-1 print:text-black">
            R$ {overview.totalPipeline.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1 font-mono">
            {overview.totalLeads} leads mapeados
          </span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md print:bg-gray-100 print:border-gray-300">
          <span className="text-xs text-slate-400 print:text-gray-600">Receita Efetiva Fechada</span>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-1 print:text-black">
            R$ {overview.totalWon.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-emerald-400 block mt-1 font-mono">Status Fechado/Ganho</span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md print:bg-gray-100 print:border-gray-300">
          <span className="text-xs text-slate-400 print:text-gray-600">Investimento Total Ads</span>
          <p className="text-xl font-bold text-cyan-400 font-mono mt-1 print:text-black">
            R$ {overview.totalSpentAds.toLocaleString('pt-BR')}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1 font-mono">Meta + Google Ads</span>
        </div>

        <div className="bg-[#0c1220]/80 border border-slate-800 rounded-2xl p-4 backdrop-blur-md print:bg-gray-100 print:border-gray-300">
          <span className="text-xs text-slate-400 print:text-gray-600">Automações Executadas</span>
          <p className="text-xl font-bold text-purple-400 font-mono mt-1 print:text-black">
            {overview.totalAutomationsExecuted}
          </p>
          <span className="text-[10px] text-slate-500 block mt-1 font-mono">Eventos disparados</span>
        </div>
      </div>

      {/* Main Table: Conversions by Source */}
      <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md print:bg-white print:border-gray-300">
        <h2 className="text-sm font-bold text-white mb-1 print:text-black">
          Desempenho Comercial por Canal de Aquisição
        </h2>
        <p className="text-xs text-slate-400 mb-4 print:text-gray-600">
          Diferenciação clara de resultados captados, pipeline gerado e taxa de conversão final.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 print:text-gray-600 font-medium font-mono text-[11px]">
                <th className="pb-3">Canal de Origem</th>
                <th className="pb-3">Leads Gerados</th>
                <th className="pb-3">Pipeline Gerado (R$)</th>
                <th className="pb-3">Fechados / Ganhos</th>
                <th className="pb-3 text-right">Taxa de Conversão</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {sourceReport.map((row) => (
                <tr key={row.source} className="hover:bg-slate-900/40">
                  <td className="py-3 font-semibold text-white print:text-black">{row.source}</td>
                  <td className="py-3 font-mono text-slate-300 print:text-gray-800">{row.leads}</td>
                  <td className="py-3 font-mono font-medium text-cyan-400 print:text-black">
                    R$ {row.pipeline.toLocaleString('pt-BR')}
                  </td>
                  <td className="py-3 font-mono text-emerald-400 print:text-black">{row.won}</td>
                  <td className="py-3 font-mono font-bold text-right text-purple-300 print:text-black">
                    {row.conversionRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Campaign Performance Table */}
      <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md print:bg-white print:border-gray-300">
        <h2 className="text-sm font-bold text-white mb-1 print:text-black">
          Eficiência das Campanhas Publicitárias (ROI Declarado)
        </h2>
        <p className="text-xs text-slate-400 mb-4 print:text-gray-600">
          Resultados medidos diretamente a partir das configurações de anúncio.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 print:text-gray-600 font-medium text-[11px]">
                <th className="pb-3">Campanha</th>
                <th className="pb-3">Plataforma</th>
                <th className="pb-3">Investido (R$)</th>
                <th className="pb-3">Conversões</th>
                <th className="pb-3">CPA (Custo/Lead)</th>
                <th className="pb-3 text-right">Retorno (ROI)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 print:divide-gray-200">
              {campaignPerformance.map((c, i) => (
                <tr key={i} className="hover:bg-slate-900/40">
                  <td className="py-3 font-sans font-semibold text-white print:text-black">{c.name}</td>
                  <td className="py-3 text-slate-300 print:text-gray-800">{c.platform}</td>
                  <td className="py-3 text-slate-300 print:text-gray-800">R$ {c.spent.toLocaleString('pt-BR')}</td>
                  <td className="py-3 text-emerald-400 print:text-black">{c.conversions}</td>
                  <td className="py-3 text-purple-400 print:text-black">R$ {c.cpa}</td>
                  <td className="py-3 text-right font-bold text-cyan-400 print:text-black">{c.roi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Recommendations Disclaimer */}
      <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 text-xs text-slate-300 flex items-start gap-3">
        <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-white block mb-0.5">Distinção de Dados & Metodologia:</span>
          <span>
            Os valores acima são calculados diretamente das transações do CRM e dos dados de campanhas registrados na
            plataforma. Projeções e sugestões estratégicas geradas pelos modelos de IA são claramente identificadas no
            módulo de Inteligência Artificial para total transparência e conformidade.
          </span>
        </div>
      </div>
    </div>
  );
};
