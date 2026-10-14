import React, { useState, useEffect } from 'react';
import {
  PenTool,
  Plus,
  Calendar as CalendarIcon,
  Copy,
  Check,
  Edit2,
  Trash2,
  Sparkles,
  Share2,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { api } from '../../services/api';
import { ContentItem, ContentPlatform, ContentStatus } from '../../types';

interface ContentStudioProps {
  onNavigate: (section: string) => void;
}

export const ContentStudio: React.FC<ContentStudioProps> = ({ onNavigate }) => {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | ContentStatus>('all');
  const [platformFilter, setPlatformFilter] = useState<'all' | ContentPlatform>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Modal create/edit
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<ContentPlatform>('linkedin');
  const [category, setCategory] = useState('Post Orgânico');
  const [tone, setTone] = useState('Profissional & Inovador');
  const [body, setBody] = useState('');
  const [hashtagsStr, setHashtagsStr] = useState('');
  const [status, setStatus] = useState<ContentStatus>('draft');
  const [scheduledDate, setScheduledDate] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadItems = async () => {
    setLoading(true);
    try {
      const data = await api.content.getItems();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setTitle('');
    setPlatform('linkedin');
    setCategory('Post Orgânico');
    setTone('Profissional & Inovador');
    setBody('');
    setHashtagsStr('#NexoraAI #MarketingDigital #Growth');
    setStatus('draft');
    setScheduledDate(new Date(Date.now() + 86400000).toISOString().slice(0, 16));
    setModalOpen(true);
  };

  const openEditModal = (item: ContentItem) => {
    setEditingItem(item);
    setTitle(item.title);
    setPlatform(item.platform);
    setCategory(item.category);
    setTone(item.tone);
    setBody(item.body);
    setHashtagsStr(item.hashtags.join(' '));
    setStatus(item.status);
    setScheduledDate(item.scheduledDate ? item.scheduledDate.slice(0, 16) : '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !body) return;

    const hashtags = hashtagsStr
      .split(' ')
      .map((h) => (h.startsWith('#') ? h : `#${h}`))
      .filter((h) => h.length > 1);

    try {
      if (editingItem) {
        const updated = await api.content.updateItem(editingItem.id, {
          title,
          platform,
          category,
          tone,
          body,
          hashtags,
          status,
          scheduledDate,
        });
        setItems(items.map((i) => (i.id === updated.id ? updated : i)));
      } else {
        const created = await api.content.createItem({
          title,
          platform,
          category,
          tone,
          body,
          hashtags,
          status,
          scheduledDate,
        });
        setItems([created, ...items]);
      }
      setModalOpen(false);
    } catch (err: any) {
      alert('Erro ao salvar: ' + err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja excluir este conteúdo?')) return;
    try {
      await api.content.deleteItem(id);
      setItems(items.filter((i) => i.id !== id));
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const handleDuplicate = async (item: ContentItem) => {
    try {
      const duplicated = await api.content.createItem({
        ...item,
        title: `${item.title} (Cópia)`,
        status: 'draft',
      });
      setItems([duplicated, ...items]);
    } catch (err: any) {
      alert('Erro ao duplicar: ' + err.message);
    }
  };

  const handleCopyBody = (item: ContentItem) => {
    const fullText = `${item.body}\n\n${item.hashtags.join(' ')}`;
    navigator.clipboard.writeText(fullText);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === 'all' || item.status === activeTab;
    const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.body.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesPlatform && matchesSearch;
  });

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
              <PenTool className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Estúdio de Conteúdo</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Multicanal
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Produza, organize e agende publicações para LinkedIn, Instagram, TikTok, e-mails e páginas de vendas.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('ai-hub')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/40 text-purple-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Redigir com Assistente IA</span>
          </button>
          <button
            onClick={openCreateModal}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.25)]"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Conteúdo</span>
          </button>
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-4 backdrop-blur-md">
        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 text-xs">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'draft', label: 'Rascunhos' },
            { id: 'ready', label: 'Prontos' },
            { id: 'scheduled', label: 'Agendados' },
            { id: 'published', label: 'Publicados' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl transition-colors whitespace-nowrap cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40 font-medium'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Right Search & Platform filter */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar conteúdo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#080d1a] border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 outline-none w-44 focus:border-purple-500"
            />
          </div>

          <select
            value={platformFilter}
            onChange={(e) => setPlatformFilter(e.target.value as any)}
            className="bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 outline-none"
          >
            <option value="all">Todas as Redes</option>
            <option value="linkedin">LinkedIn</option>
            <option value="instagram">Instagram</option>
            <option value="tiktok">TikTok / Reels</option>
            <option value="twitter">X (Twitter)</option>
            <option value="email">E-mail Comercial</option>
          </select>
        </div>
      </div>

      {/* Content Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="p-12 rounded-2xl bg-[#0c1220]/70 border border-slate-800 text-center text-slate-400 space-y-3">
          <PenTool className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="font-semibold text-white text-sm">Nenhum conteúdo encontrado</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Use o botão "Criar Novo Conteúdo" ou abra a Central de IA para gerar copies prontas.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item) => {
            const statusBadge =
              item.status === 'published'
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                : item.status === 'scheduled'
                ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30'
                : item.status === 'ready'
                ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700';

            return (
              <div
                key={item.id}
                className="bg-[#0c1220]/80 border border-slate-800/90 hover:border-purple-500/40 rounded-2xl p-5 backdrop-blur-md flex flex-col justify-between transition-all group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 uppercase">
                      {item.platform}
                    </span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase ${statusBadge}`}>
                      {item.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-white group-hover:text-purple-300 transition-colors line-clamp-1 mb-1">
                    {item.title}
                  </h3>
                  <p className="text-[10px] text-slate-400 mb-3 font-mono">{item.category} • Tom: {item.tone}</p>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs text-slate-300 line-clamp-5 whitespace-pre-line leading-relaxed mb-3">
                    {item.body}
                  </div>

                  {item.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.hashtags.map((h, i) => (
                        <span key={i} className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded">
                          {h}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3 text-slate-400" />
                    <span>{new Date(item.scheduledDate).toLocaleDateString('pt-BR')}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleCopyBody(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                      title="Copiar texto completo"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={() => handleDuplicate(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                      title="Duplicar conteúdo"
                    >
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => openEditModal(item)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-purple-400 hover:bg-slate-800 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
            <h2 className="text-base font-bold text-white mb-1">
              {editingItem ? 'Editar Peça de Conteúdo' : 'Criar Nova Publicação'}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Configure copy, canal de destino, data de agendamento e hashtags da peça.
            </p>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="text-slate-300 font-medium">Título Interno do Conteúdo</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Como a IA generativa está redefinindo o CAC..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Canal de Publicação</label>
                  <select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value as any)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none"
                  >
                    <option value="linkedin">LinkedIn</option>
                    <option value="instagram">Instagram</option>
                    <option value="tiktok">TikTok / Reels</option>
                    <option value="twitter">X (Twitter)</option>
                    <option value="email">E-mail Comercial</option>
                    <option value="blog">Artigo de Blog</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Categoria</label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-slate-300 font-medium">Texto Completo da Publicação (Copy)</label>
                <textarea
                  rows={6}
                  required
                  placeholder="Escreva ou cole a copy completa da publicação..."
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-purple-500 leading-relaxed font-sans"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium">Hashtags (separadas por espaço)</label>
                <input
                  type="text"
                  value={hashtagsStr}
                  onChange={(e) => setHashtagsStr(e.target.value)}
                  placeholder="#NexoraAI #MarketingDigital"
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-slate-300 font-medium">Status do Conteúdo</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as any)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="ready">Pronto para Publicar</option>
                    <option value="scheduled">Agendado</option>
                    <option value="published">Publicado Manualmente</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-300 font-medium">Data Prevista / Agendamento</label>
                  <input
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-2 text-white outline-none"
                  />
                </div>
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
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-medium cursor-pointer shadow-md"
                >
                  Salvar Publicação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
