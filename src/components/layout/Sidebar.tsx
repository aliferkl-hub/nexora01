import React from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Target,
  PenTool,
  Megaphone,
  Users,
  Zap,
  BarChart3,
  CreditCard,
  Settings,
  ShieldCheck,
  X,
  Layers,
  ChevronRight,
  ExternalLink,
  BookOpen,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onNavigate,
  isOpen,
  onClose,
}) => {
  const { isOwner, company } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Visão Geral', icon: LayoutDashboard, badge: null },
    { id: 'manual', label: 'Manual de Crescimento', icon: BookOpen, badge: isOwner ? 'Acesso Livre' : 'Manual IA', glow: isOwner },
    { id: 'ai-hub', label: 'Central de IA', icon: Sparkles, badge: '8 Ferramentas', glow: true },
    { id: 'marketing', label: 'Marketing & Crescimento', icon: Target, badge: null },
    { id: 'content', label: 'Estúdio de Conteúdo', icon: PenTool, badge: null },
    { id: 'campaigns', label: 'Publicidade & Campanhas', icon: Megaphone, badge: null },
    { id: 'crm', label: 'CRM & Captação', icon: Users, badge: null },
    { id: 'automations', label: 'Automações & Webhooks', icon: Zap, badge: 'n8n/Make' },
    { id: 'reports', label: 'Relatórios & Inteligência', icon: BarChart3, badge: null },
    { id: 'billing', label: 'Assinatura & Planos', icon: CreditCard, badge: null },
    { id: 'settings', label: 'Configurações', icon: Settings, badge: null },
  ];

  const handleItemClick = (id: string) => {
    onNavigate(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-64 bg-[#080c16] border-r border-slate-800/80 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-[0_0_20px_rgba(37,99,235,0.4)]">
              <div className="w-full h-full bg-[#080c16] rounded-xl flex items-center justify-center">
                <Layers className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <span className="font-black text-lg tracking-wider text-white flex items-center gap-1 font-mono">
                NEXORA <span className="text-cyan-400">AI</span>
              </span>
              <p className="text-[9px] text-slate-400 uppercase tracking-widest font-mono">Enterprise SaaS</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-500 uppercase tracking-wider font-mono">
            Plataforma Operacional
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleItemClick(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-transparent text-white border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.15)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-1.5 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-500/20 text-cyan-300'
                        : 'bg-slate-900 text-slate-400 group-hover:text-cyan-400 group-hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      item.glow
                        ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Owner Exclusives Section */}
          {isOwner && (
            <div className="pt-4 mt-4 border-t border-slate-800/80 space-y-1">
              <div className="px-3 pb-2 text-[10px] font-semibold text-amber-400/90 uppercase tracking-wider font-mono flex items-center justify-between">
                <span>Área do Proprietário</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">MASTER</span>
              </div>

              {/* Master Owner Identity Badge */}
              <div className="px-3 py-1.5 mb-1 rounded-xl bg-amber-950/20 border border-amber-500/20 text-xs">
                <p className="text-[11px] font-bold text-amber-300 flex items-center gap-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="truncate">Alifer Madeiro</span>
                </p>
                <p className="text-[10px] text-slate-400 font-mono">Master Owner • Acesso Livre</p>
              </div>

              <button
                onClick={() => handleItemClick('admin')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  activeSection === 'admin'
                    ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                    : 'text-amber-300/80 hover:text-amber-200 hover:bg-amber-950/20'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-amber-950/40 text-amber-400 group-hover:bg-amber-900/40">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span>Painel do Proprietário</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-amber-400" />
              </button>

              <button
                onClick={() => handleItemClick('manual')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                  activeSection === 'manual'
                    ? 'bg-gradient-to-r from-blue-600/30 to-amber-500/20 text-white border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-lg bg-cyan-950/40 text-cyan-400 group-hover:bg-cyan-900/40">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span>Manual de Crescimento</span>
                </div>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-mono font-bold">
                  LIVRE
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Tenant Info */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070a12]/80">
          <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/90 text-xs flex items-center justify-between">
            <div className="truncate pr-2">
              <p className="text-[11px] font-semibold text-white truncate">{company?.name || 'Nexora Workspace'}</p>
              <p className="text-[10px] text-slate-400 font-mono">ID: {company?.id.slice(0, 12)}...</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Sistema Online" />
          </div>
        </div>
      </aside>
    </>
  );
};
