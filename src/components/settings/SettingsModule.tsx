import React, { useState } from 'react';
import {
  Settings,
  User,
  Building,
  Shield,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Download,
  Trash2,
  Sparkles,
  Link2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const SettingsModule: React.FC = () => {
  const { user, company, refreshUser } = useAuth();

  // Profile update
  const [userName, setUserName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [profileMsg, setProfileMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [savingProfile, setSavingProfile] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg(null);

    try {
      const res = await api.auth.updateProfile({
        name: userName,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      });

      setProfileMsg({ type: 'success', text: res.message });
      setCurrentPassword('');
      setNewPassword('');
      await refreshUser();
    } catch (err: any) {
      setProfileMsg({ type: 'error', text: err.message || 'Erro ao atualizar perfil' });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleExportLgpdData = () => {
    const backup = {
      tenant: company,
      user: { id: user?.id, name: user?.name, email: user?.email, role: user?.role },
      exportedAt: new Date().toISOString(),
      compliance: 'LGPD Artigo 18 - Direito à portabilidade e acesso aos dados',
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `lgpd_dados_${company?.slug || 'empresa'}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-600/20 text-cyan-400 border border-blue-500/30">
            <Settings className="w-5 h-5" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">Configurações do Sistema</h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Gerencie seu perfil de acesso, credenciais de segurança, integrações e conformidade de dados LGPD.
        </p>
      </div>

      {/* Profile & Security Section */}
      <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            <span>Perfil do Usuário & Senha Segura</span>
          </h2>
          <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/30 uppercase">
            Função: {user?.role}
          </span>
        </div>

        {user?.role === 'owner' && (
          <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-center justify-between text-xs flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <Shield className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <p className="font-semibold text-white">Conta Master Owner Registrada</p>
                <p className="text-[11px] text-slate-400">
                  Proprietário Master: <span className="text-amber-300 font-medium">Alifer Madeiro</span> • Acesso livre, gratuito e permanente ao Manual de Crescimento Empresarial.
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
              ISENÇÃO VITALÍCIA
            </span>
          </div>
        )}

        {profileMsg && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              profileMsg.type === 'success'
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}
          >
            {profileMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{profileMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-slate-300 font-medium">Nome Completo</label>
              <input
                type="text"
                required
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-slate-300 font-medium">E-mail (Identificador Único)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-xs font-semibold text-slate-300 block mb-2">Alterar Senha de Acesso</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400">Senha Atual</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Digite sua senha atual"
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="text-slate-400">Nova Senha (mínimo 8 dígitos)</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nova senha segura"
                  className="w-full mt-1 bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-white outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={savingProfile}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium cursor-pointer shadow-md"
            >
              {savingProfile ? 'Salvando...' : 'Salvar Perfil'}
            </button>
          </div>
        </form>
      </div>

      {/* Integrations Status */}
      <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Link2 className="w-4 h-4 text-cyan-400" />
          <span>Status das Integrações do Workspace</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Google Gemini 3.8 Flash</p>
              <p className="text-[11px] text-slate-400">Motor de IA para estratégias, CRM e cópias</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Conectado
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Webhooks n8n & Make</p>
              <p className="text-[11px] text-slate-400">Disparo de eventos em tempo real</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Ativo
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">Meta Ads (Facebook & Instagram)</p>
              <p className="text-[11px] text-slate-400">Sincronização de tráfego e campanhas</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Configurado
            </span>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
            <div>
              <p className="font-semibold text-white">WhatsApp Cloud API & Resend</p>
              <p className="text-[11px] text-slate-400">Disparador de alertas comerciais</p>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400">
              Pronto para Uso
            </span>
          </div>
        </div>
      </div>

      {/* LGPD & Data Privacy Section */}
      <div className="bg-[#0c1220]/80 border border-slate-800/90 rounded-2xl p-6 backdrop-blur-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Privacidade & Proteção de Dados (LGPD)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Conformidade total com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018).
            </p>
          </div>
          <span className="text-[10px] font-mono bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
            Conformidade Ativa
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          O NEXORA AI adota medidas técnicas e administrativas aptas a proteger os dados pessoais de acessos não
          autorizados. Todos os leads contam com registro de consentimento explícito e histórico rastreável.
        </p>

        <div className="pt-2 flex flex-wrap gap-2">
          <button
            onClick={handleExportLgpdData}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Exportar Dados da Minha Empresa (Portabilidade)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
