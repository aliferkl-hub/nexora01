import React, { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Crown,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Search,
  Sparkles,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Clock,
  Layers,
  FileText,
  Workflow,
  ListTodo,
  Terminal,
  RefreshCw,
  AlertCircle,
  Share2,
  Bookmark,
} from 'lucide-react';
import { api } from '../../services/api';
import { ManualChapterMeta, ManualChapter, ManualUserProgress } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface GrowthManualModuleProps {
  onNavigate: (section: string) => void;
  initialChapterId?: string;
}

export const GrowthManualModule: React.FC<GrowthManualModuleProps> = ({
  onNavigate,
  initialChapterId,
}) => {
  const { user, isOwner } = useAuth();

  const [chapters, setChapters] = useState<ManualChapterMeta[]>([]);
  const [currentChapter, setCurrentChapter] = useState<ManualChapter | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<string>(initialChapterId || 'cap-1');
  const [userProgress, setUserProgress] = useState<ManualUserProgress>({
    completedChapters: [],
    checkedItems: [],
    lastActiveChapterId: 'cap-1',
  });

  const [loading, setLoading] = useState<boolean>(true);
  const [loadingChapter, setLoadingChapter] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chapterError, setChapterError] = useState<string | null>(null);

  // Search & Active Tab inside Chapter
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'content' | 'diagram' | 'prompts' | 'exercises'>('content');

  // Copy states
  const [copiedPromptIndex, setCopiedPromptIndex] = useState<number | null>(null);
  const [copiedDiagram, setCopiedDiagram] = useState<boolean>(false);
  const [linkCopied, setLinkCopied] = useState<boolean>(false);

  // Master Owner display name guarantee
  const masterOwnerName = isOwner ? (user?.name || 'Alifer Madeiro') : 'Alifer Madeiro';

  // Load manual metadata & progress
  const loadManualIndex = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.manual.getChapters();
      setChapters(data.chapters);
      if (data.userProgress) {
        setUserProgress(data.userProgress);
      }

      // Read target chapter from URL hash or initial param if available
      const hash = window.location.hash;
      let targetId = initialChapterId;
      if (hash.includes('manual/')) {
        const hashId = hash.split('manual/')[1]?.trim();
        if (hashId) targetId = hashId;
      } else if (data.userProgress?.lastActiveChapterId) {
        targetId = targetId || data.userProgress.lastActiveChapterId;
      }

      const validId = targetId && data.chapters.some((c) => c.id === targetId)
        ? targetId
        : (data.chapters[0]?.id || 'cap-1');

      setSelectedChapterId(validId);
    } catch (err: any) {
      setError(err.message || 'Erro ao carregar o Manual de Crescimento Empresarial.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadManualIndex();
  }, []);

  // Load active chapter details
  const loadChapter = async (id: string) => {
    setLoadingChapter(true);
    setChapterError(null);
    try {
      const chapterData = await api.manual.getChapter(id);
      setCurrentChapter(chapterData);

      // Update URL hash for direct access bookmarking
      window.location.hash = `manual/${id}`;

      // Update last active chapter in progress
      api.manual.saveProgress({ lastActiveChapterId: id }).catch(console.error);
      setUserProgress((prev) => ({ ...prev, lastActiveChapterId: id }));
    } catch (err: any) {
      setChapterError(err.message || 'Erro ao carregar o conteúdo do capítulo.');
      setCurrentChapter(null);
    } finally {
      setLoadingChapter(false);
    }
  };

  useEffect(() => {
    if (selectedChapterId) {
      loadChapter(selectedChapterId);
    }
  }, [selectedChapterId]);

  // Toggle chapter completion
  const handleToggleChapterCompletion = async (chapterId: string) => {
    const isCompleted = userProgress.completedChapters.includes(chapterId);
    const updated = isCompleted
      ? userProgress.completedChapters.filter((id) => id !== chapterId)
      : [...userProgress.completedChapters, chapterId];

    setUserProgress((prev) => ({ ...prev, completedChapters: updated }));
    try {
      await api.manual.saveProgress({ completedChapters: updated });
    } catch (err) {
      console.error('Failed to sync chapter completion', err);
    }
  };

  // Toggle checklist item
  const handleToggleChecklist = async (itemId: string) => {
    const isChecked = userProgress.checkedItems.includes(itemId);
    const updated = isChecked
      ? userProgress.checkedItems.filter((id) => id !== itemId)
      : [...userProgress.checkedItems, itemId];

    setUserProgress((prev) => ({ ...prev, checkedItems: updated }));
    try {
      await api.manual.saveProgress({ checkedItems: updated });
    } catch (err) {
      console.error('Failed to sync checklist item', err);
    }
  };

  // Copy prompt helper
  const handleCopyPrompt = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptIndex(index);
    setTimeout(() => setCopiedPromptIndex(null), 2500);
  };

  // Copy diagram helper
  const handleCopyDiagram = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedDiagram(true);
    setTimeout(() => setCopiedDiagram(false), 2500);
  };

  // Copy link helper
  const handleCopyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#manual/${selectedChapterId}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  // Search filtered chapters
  const filteredChapters = useMemo(() => {
    if (!searchTerm.trim()) return chapters;
    const term = searchTerm.toLowerCase();
    return chapters.filter(
      (c) =>
        c.title.toLowerCase().includes(term) ||
        c.subtitle.toLowerCase().includes(term) ||
        c.summary.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term)
    );
  }, [chapters, searchTerm]);

  // Progress metrics calculation
  const totalChapters = chapters.length;
  const completedCount = userProgress.completedChapters.length;
  const progressPercent = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[450px] text-slate-400 gap-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-xs font-mono">Carregando Manual de Crescimento Empresarial NEXORA AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto text-center space-y-4">
        <div className="p-6 rounded-2xl bg-rose-950/30 border border-rose-500/30 text-rose-300">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto mb-2" />
          <h3 className="font-semibold text-white">Falha ao acessar o Manual</h3>
          <p className="text-xs text-rose-300 mt-1">{error}</p>
          <button
            onClick={loadManualIndex}
            className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-medium cursor-pointer"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Master Exemption Recognition */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="p-1.5 rounded-lg bg-gradient-to-tr from-cyan-500/20 to-blue-600/20 text-cyan-400 border border-cyan-500/30">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Manual de Crescimento Empresarial
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 uppercase">
              Operação com IA
            </span>
            {isOwner && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 font-semibold">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>Acesso Livre Master • {masterOwnerName}</span>
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Metodologia prática, arquitetura operacional, diagramas de fluxo, prompts de alta conversão e checklists de execução.
          </p>
        </div>

        {/* Global Progress Bar */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-2xl p-3 sm:w-64">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Progresso de Leitura</span>
            <span className="text-cyan-400 font-mono font-bold">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(6,182,212,0.5)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1 text-right">
            {completedCount} de {totalChapters} capítulos finalizados
          </p>
        </div>
      </div>

      {/* Master Owner Unrestricted Access Banner */}
      {isOwner && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/30 via-blue-950/20 to-purple-950/20 border border-amber-500/30 backdrop-blur-md flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-xs">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <span>Identificação Master Owner:</span>
                <span className="text-amber-300 font-bold">{masterOwnerName}</span>
              </p>
              <p className="text-slate-300 text-[11px]">
                Acesso total, gratuito e permanente concedido no backend sem necessidade de planos ou pagamentos.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-[10px] font-bold">
              ISENÇÃO VITALÍCIA ATIVA
            </span>
          </div>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chapters Navigation & Search (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Chapter Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar capítulos, prompts e tópicos..."
              className="w-full bg-[#0c1220]/90 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 outline-none transition-all"
            />
          </div>

          {/* Chapters List */}
          <div className="space-y-2">
            <div className="px-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono flex items-center justify-between">
              <span>Capítulos ({filteredChapters.length})</span>
              <span>NEXORA Framework</span>
            </div>

            {filteredChapters.map((ch) => {
              const isSelected = selectedChapterId === ch.id;
              const isCompleted = userProgress.completedChapters.includes(ch.id);

              return (
                <button
                  key={ch.id}
                  onClick={() => setSelectedChapterId(ch.id)}
                  className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col gap-2 group cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-cyan-500/10 border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/30'
                      : 'bg-[#0c1220]/70 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      Capítulo {ch.number}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {isCompleted && (
                        <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-1.5 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          <span>Lido</span>
                        </span>
                      )}

                      {/* Locked vs Owner Exempt vs Granted */}
                      {ch.isOwnerExempt ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Crown className="w-2.5 h-2.5" />
                          <span>Livre</span>
                        </span>
                      ) : ch.locked ? (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-rose-950/50 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          <span className="uppercase">{ch.requiresPlan}</span>
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-blue-950/40 text-cyan-300 border border-cyan-500/30 uppercase">
                          {ch.requiresPlan}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className={`text-xs font-bold leading-snug line-clamp-2 ${isSelected ? 'text-white' : 'text-slate-200 group-hover:text-cyan-300'}`}>
                      {ch.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{ch.subtitle}</p>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{ch.readTime}</span>
                    </span>
                    <span>{ch.promptsCount} Prompts IA</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Column: Chapter Reader & Resources (8 cols) */}
        <div className="lg:col-span-8">
          {loadingChapter ? (
            <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-3 min-h-[400px]">
              <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              <p className="text-xs font-mono">Abrindo capítulo...</p>
            </div>
          ) : chapterError ? (
            /* Locked Paywall Screen for Clients */
            <div className="bg-[#0c1220]/90 border border-slate-800 rounded-2xl p-8 text-center space-y-5 backdrop-blur-md">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-500/20 via-purple-500/20 to-blue-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                <Lock className="w-7 h-7" />
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 uppercase">
                  Acesso Restrito ao Plano
                </span>
                <h2 className="text-xl font-bold text-white">Conteúdo Exclusivo de Assinantes</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {chapterError}
                </p>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-300 text-left space-y-1">
                  <p className="font-semibold text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Regra de Acesso NEXORA AI:</span>
                  </p>
                  <p className="text-slate-400">
                    O Master Owner (<span className="text-amber-300 font-semibold">{masterOwnerName}</span>) possui isenção vitalícia automática. Para contas de empresas clientes comuns, o acesso é vinculado ao nível de assinatura contratada.
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  onClick={() => onNavigate('billing')}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-xs hover:brightness-110 shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>Conhecer Planos & Fazer Upgrade</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : currentChapter ? (
            <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl backdrop-blur-md overflow-hidden">
              {/* Chapter Header Banner */}
              <div className="p-6 sm:p-8 border-b border-slate-800/80 bg-gradient-to-br from-[#0c1527] via-[#0c1220] to-[#080d18] relative">
                <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/20 text-cyan-300 border border-blue-500/30">
                      Capítulo {currentChapter.number}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">• {currentChapter.category}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Copiar URL direta deste capítulo"
                    >
                      {linkCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Share2 className="w-3 h-3" />}
                      <span>{linkCopied ? 'Link Copiado' : 'Compartilhar URL'}</span>
                    </button>

                    <button
                      onClick={() => handleToggleChapterCompletion(currentChapter.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                        userProgress.completedChapters.includes(currentChapter.id)
                          ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                          : 'bg-blue-600/20 border border-blue-500/40 text-blue-300 hover:bg-blue-600/30'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>
                        {userProgress.completedChapters.includes(currentChapter.id)
                          ? 'Concluído'
                          : 'Marcar como Concluído'}
                      </span>
                    </button>
                  </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {currentChapter.title}
                </h1>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-3xl">
                  {currentChapter.subtitle}
                </p>

                {/* Summary Box */}
                <div className="mt-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{currentChapter.summary}</p>
                </div>

                {/* Subtabs Navigation */}
                <div className="flex items-center gap-1 mt-6 border-b border-slate-800/80 -mb-6 -mx-6 sm:-mx-8 px-6 sm:px-8 overflow-x-auto text-xs">
                  {[
                    { id: 'content', label: 'Conteúdo & Teoria', icon: FileText, count: currentChapter.sections.length },
                    { id: 'diagram', label: 'Diagramas & Fluxo', icon: Workflow, count: 1 },
                    { id: 'prompts', label: 'Comandos de IA', icon: Terminal, count: currentChapter.aiPrompts.length },
                    { id: 'exercises', label: 'Exercícios & Checklist', icon: ListTodo, count: currentChapter.checklist.length },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`pb-3 px-3.5 font-medium transition-all flex items-center gap-2 border-b-2 whitespace-nowrap cursor-pointer ${
                          isActive
                            ? 'text-cyan-300 border-cyan-400 font-semibold'
                            : 'text-slate-400 border-transparent hover:text-slate-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{tab.label}</span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                          isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {tab.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Subtab Content Area */}
              <div className="p-6 sm:p-8 space-y-6">
                {/* 1. TEORIA & CONTEÚDO */}
                {activeTab === 'content' && (
                  <div className="space-y-8">
                    {currentChapter.sections.map((sec, idx) => (
                      <article key={idx} className="space-y-4 pb-6 border-b border-slate-800/60 last:border-0 last:pb-0">
                        <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                          <span className="text-cyan-400 font-mono text-sm">#{idx + 1}</span>
                          <span>{sec.title}</span>
                        </h2>

                        <div className="text-xs text-slate-300 leading-relaxed whitespace-pre-line space-y-3 font-sans">
                          {sec.content}
                        </div>

                        {sec.keyTakeaways && sec.keyTakeaways.length > 0 && (
                          <div className="p-4 rounded-xl bg-gradient-to-r from-blue-950/30 to-purple-950/20 border border-blue-500/20 space-y-2">
                            <span className="text-[11px] font-semibold text-cyan-300 font-mono uppercase tracking-wider block">
                              Pontos de Ação & Insights
                            </span>
                            <ul className="space-y-1.5">
                              {sec.keyTakeaways.map((item, i) => (
                                <li key={i} className="text-xs text-slate-200 flex items-start gap-2">
                                  <ChevronRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                {/* 2. DIAGRAMAS & FLUXO VISUAL */}
                {activeTab === 'diagram' && (
                  <div className="space-y-6">
                    <div>
                      <h2 className="text-base font-bold text-white">{currentChapter.diagram.title}</h2>
                      <p className="text-xs text-slate-400 mt-1">{currentChapter.diagram.subtitle}</p>
                    </div>

                    {/* Interactive Visual Flow Nodes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {currentChapter.diagram.visualFlow.map((node, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-2xl bg-gradient-to-b from-[#0c1629] to-[#080d19] border border-blue-500/20 hover:border-cyan-500/50 transition-all space-y-2 group shadow-lg"
                        >
                          <div className="flex items-center justify-between">
                            <span className="w-7 h-7 rounded-lg bg-blue-600/20 border border-blue-500/30 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                              {node.step}
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                              {node.badge}
                            </span>
                          </div>
                          <h3 className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                            {node.title}
                          </h3>
                          <p className="text-[11px] text-slate-400 leading-relaxed">{node.description}</p>
                        </div>
                      ))}
                    </div>

                    {/* ASCII Architecture Flowchart */}
                    {currentChapter.diagram.asciiDiagram && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 font-mono">
                            <Terminal className="w-4 h-4 text-cyan-400" />
                            <span>Esquema de Fluxo Operacional (ASCII Architecture)</span>
                          </span>
                          <button
                            onClick={() => handleCopyDiagram(currentChapter.diagram.asciiDiagram || '')}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-[11px] font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            {copiedDiagram ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedDiagram ? 'Copiado!' : 'Copiar Diagrama'}</span>
                          </button>
                        </div>
                        <div className="p-4 rounded-2xl bg-[#050811] border border-slate-800 font-mono text-[11px] text-cyan-300 overflow-x-auto whitespace-pre leading-relaxed custom-scrollbar">
                          {currentChapter.diagram.asciiDiagram}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. COMANDOS DE IA (PROMPTS) */}
                {activeTab === 'prompts' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-base font-bold text-white">Comandos de IA Prontos para Execução</h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Copie e execute diretamente nos assistentes da Central de IA para resultados imediatos.
                        </p>
                      </div>
                      <button
                        onClick={() => onNavigate('ai-hub')}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/40 text-cyan-300 hover:bg-blue-600/30 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Abrir Central de IA</span>
                      </button>
                    </div>

                    <div className="space-y-4">
                      {currentChapter.aiPrompts.map((promptItem, i) => (
                        <div
                          key={i}
                          className="p-5 rounded-2xl bg-gradient-to-br from-[#0c1322] to-[#070b16] border border-slate-800 space-y-3"
                        >
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950/60 text-cyan-400 border border-blue-500/30 uppercase">
                                {promptItem.category}
                              </span>
                              <h3 className="text-xs font-bold text-white mt-1">{promptItem.title}</h3>
                              <p className="text-[11px] text-slate-400">{promptItem.description}</p>
                            </div>

                            <button
                              onClick={() => handleCopyPrompt(promptItem.prompt, i)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
                                copiedPromptIndex === i
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-blue-600 text-white hover:bg-blue-500 shadow-md'
                              }`}
                            >
                              {copiedPromptIndex === i ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Comando Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copiar Comando</span>
                                </>
                              )}
                            </button>
                          </div>

                          {/* Code/Prompt Container */}
                          <div className="relative p-3.5 rounded-xl bg-[#060913] border border-slate-800/80 font-mono text-xs text-slate-200 whitespace-pre-wrap leading-relaxed select-all">
                            {promptItem.prompt}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. EXERCÍCIOS & CHECKLIST */}
                {activeTab === 'exercises' && (
                  <div className="space-y-6">
                    {/* Practical Exercises */}
                    <div className="space-y-3">
                      <h2 className="text-base font-bold text-white">Exercícios Práticos</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentChapter.exercises.map((ex) => (
                          <div
                            key={ex.id}
                            className="p-4 rounded-2xl bg-[#0c1220] border border-slate-800 space-y-2.5"
                          >
                            <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-semibold">
                              Exercício Prático
                            </span>
                            <h3 className="text-xs font-bold text-white">{ex.title}</h3>
                            <p className="text-xs text-slate-300 leading-relaxed">{ex.instruction}</p>
                            <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-emerald-300 space-y-1">
                              <span className="font-semibold text-emerald-400 block font-mono">Resultado Esperado:</span>
                              <p className="text-slate-300">{ex.expectedOutcome}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Interactive Checklist */}
                    <div className="space-y-3 pt-4 border-t border-slate-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <h2 className="text-base font-bold text-white">Checklist de Execução</h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Marque os itens à medida que implementar na sua operação.
                          </p>
                        </div>
                        <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                          {currentChapter.checklist.filter((item) => userProgress.checkedItems.includes(item.id)).length} de {currentChapter.checklist.length} concluídos
                        </span>
                      </div>

                      <div className="space-y-2">
                        {currentChapter.checklist.map((item) => {
                          const isChecked = userProgress.checkedItems.includes(item.id);
                          return (
                            <button
                              key={item.id}
                              onClick={() => handleToggleChecklist(item.id)}
                              className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                                isChecked
                                  ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                                  : 'bg-[#0a0f1d] border-slate-800 hover:border-slate-700 text-slate-300'
                              }`}
                            >
                              <div
                                className={`w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                                  isChecked
                                    ? 'bg-emerald-500 border-emerald-400 text-black'
                                    : 'border-slate-700 bg-slate-900'
                                }`}
                              >
                                {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                              <div className="flex-1">
                                <p className={`text-xs font-medium leading-snug ${isChecked ? 'line-through text-slate-400' : 'text-white'}`}>
                                  {item.label}
                                </p>
                                {item.details && (
                                  <p className="text-[11px] text-slate-400 mt-0.5">{item.details}</p>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
