import React, { useState, useEffect } from 'react';
import {
  Bell,
  Search,
  Sparkles,
  Building2,
  ChevronDown,
  ShieldAlert,
  LogOut,
  User as UserIcon,
  Crown,
  Menu,
  BookOpen,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { Company } from '../../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (section: string) => void;
  activeSection: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate }) => {
  const { user, company, isOwner, activeTenantId, switchTenant, logout } = useAuth();
  const [allCompanies, setAllCompanies] = useState<Company[]>([]);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  useEffect(() => {
    if (isOwner) {
      api.admin.getCompanies().then(setAllCompanies).catch(console.error);
    }
  }, [isOwner]);

  return (
    <header className="h-16 border-b border-slate-800/80 bg-[#070b14]/80 backdrop-blur-md sticky top-0 z-30 px-4 lg:px-6 flex items-center justify-between">
      {/* Left side: Mobile Toggle & Brand indicator */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 focus:outline-none"
          aria-label="Abrir menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Multi-tenant Company Badge / Selector */}
        <div className="relative">
          {isOwner ? (
            <button
              onClick={() => setShowCompanyDropdown(!showCompanyDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-200 hover:bg-blue-900/40 text-xs font-medium transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-semibold text-white max-w-[140px] sm:max-w-[200px] truncate">
                {company?.name || 'Selecione Empresa'}
              </span>
              <span className="bg-blue-500/20 text-blue-300 text-[10px] px-1.5 py-0.5 rounded border border-blue-400/30 uppercase">
                {company?.plan || 'PRO'}
              </span>
              <ChevronDown className="w-3 h-3 text-blue-400" />
            </button>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs">
              <Building2 className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-semibold text-slate-200 max-w-[160px] truncate">{company?.name}</span>
              <span className="bg-cyan-500/10 text-cyan-400 text-[10px] px-1.5 py-0.5 rounded border border-cyan-500/20 uppercase font-mono">
                {company?.plan || 'Starter'}
              </span>
            </div>
          )}

          {/* Company Switcher for Platform Owner */}
          {showCompanyDropdown && isOwner && (
            <div className="absolute left-0 mt-2 w-72 bg-[#0c1322] border border-blue-500/30 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-2 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800">
                <span>Alternar Empresa (Modo Owner)</span>
                <span className="text-amber-400 font-normal">SuperAdmin</span>
              </div>
              <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                {allCompanies.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      switchTenant(c.id);
                      setShowCompanyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                      company?.id === c.id
                        ? 'bg-blue-600/30 text-white font-medium border border-blue-500/40'
                        : 'text-slate-300 hover:bg-slate-800/80'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <p className="truncate font-medium">{c.name}</p>
                      <p className="text-[10px] text-slate-400">{c.industry || 'Empresa Cliente'}</p>
                    </div>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">
                      {c.plan}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Center Search Input */}
      <div className="hidden md:flex items-center relative w-72 lg:w-96">
        <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Buscar no NEXORA AI (leads, campanhas, IA)..."
          className="w-full bg-[#0d1527]/90 border border-slate-800 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/40 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 outline-none transition-all"
        />
      </div>

      {/* Right side: AI status, Notifications, User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Real-time AI Engine Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-400 text-[11px] font-mono">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-cyan-300" />
          <span>Gemini 3.8 Engine</span>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 relative focus:outline-none transition-colors"
            aria-label="Notificações"
          >
            <Bell className="w-4 h-4" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 ring-2 ring-[#070b14] animate-ping" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 absolute top-1.5 right-1.5 ring-2 ring-[#070b14]" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-[#0c1322] border border-slate-800 rounded-xl shadow-2xl p-3 z-50 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 font-semibold text-slate-200">
                <span>Notificações da Operação</span>
                <span className="text-[10px] text-cyan-400">Tempo Real</span>
              </div>
              <div className="space-y-2 mt-2">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <p className="font-medium text-slate-200">Novo Lead Qualificado por IA</p>
                  <p className="text-[11px] text-slate-400">Rafael Valente pontuado com 92/100 no CRM.</p>
                  <span className="text-[9px] text-slate-500 mt-1 block">Há 15 minutos</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <p className="font-medium text-slate-200">Campanha Meta Ads Otimizada</p>
                  <p className="text-[11px] text-slate-400">CTR aumentou 22% nas últimas 24 horas.</p>
                  <span className="text-[9px] text-slate-500 mt-1 block">Há 1 hora</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-800/60 transition-colors focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs ring-1 ring-cyan-500/30 shadow-[0_0_12px_rgba(59,130,246,0.3)]">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden lg:block text-left text-xs">
              <p className="font-medium text-slate-200 leading-tight">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role === 'owner' ? 'Proprietário' : user?.role}</p>
            </div>
            <ChevronDown className="w-3 h-3 text-slate-400 hidden lg:block" />
          </button>

          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-56 bg-[#0c1322] border border-slate-800 rounded-xl shadow-2xl p-2 z-50 text-xs">
              <div className="px-3 py-2 border-b border-slate-800">
                <p className="font-semibold text-slate-200">{user?.name}</p>
                <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-cyan-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span>Sessão Ativa Segura</span>
                </div>
              </div>
              <div className="py-1">
                <button
                  onClick={() => {
                    onNavigate('settings');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-slate-300 hover:bg-slate-800/80 rounded-lg flex items-center gap-2"
                >
                  <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                  <span>Meu Perfil & Segurança</span>
                </button>
                <button
                  onClick={() => {
                    onNavigate('manual');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-cyan-300 hover:bg-cyan-950/30 rounded-lg flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Manual de Crescimento</span>
                  </div>
                  {isOwner && (
                    <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                      LIVRE
                    </span>
                  )}
                </button>
                {isOwner && (
                  <button
                    onClick={() => {
                      onNavigate('admin');
                      setShowUserDropdown(false);
                    }}
                    className="w-full text-left px-3 py-2 text-amber-300 hover:bg-amber-950/30 rounded-lg flex items-center gap-2"
                  >
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Painel do Proprietário</span>
                  </button>
                )}
              </div>
              <div className="pt-1 border-t border-slate-800">
                <button
                  onClick={() => {
                    logout();
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-rose-400 hover:bg-rose-950/30 rounded-lg flex items-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sair da Conta</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
