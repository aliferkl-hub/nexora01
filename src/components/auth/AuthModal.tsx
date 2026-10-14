import React, { useState } from 'react';
import {
  Lock,
  Mail,
  Building,
  User,
  Phone,
  Shield,
  KeyRound,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Crown,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

interface AuthModalProps {
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onSuccess }) => {
  const { login, register } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset' | 'owner-setup'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('Tecnologia');
  const [companyPhone, setCompanyPhone] = useState('');

  // Password reset fields
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Owner setup fields
  const [masterKey, setMasterKey] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao realizar login');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        companyName,
        companyIndustry,
        companyPhone,
        name,
        email,
        password,
      });
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.forgotPassword(email);
      setSuccessMsg(res.message);
      if (res.demoToken) {
        setResetToken(res.demoToken);
        setMode('reset');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao solicitar recuperação');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.resetPassword(resetToken, newPassword);
      setSuccessMsg(res.message);
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
    } finally {
      setLoading(false);
    }
  };

  const handleOwnerSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api.auth.setupOwner({
        masterKey,
        name,
        email,
        password,
      });
      setSuccessMsg(res.message);
      setMode('login');
    } catch (err: any) {
      setError(err.message || 'Erro ao configurar proprietário');
    } finally {
      setLoading(false);
    }
  };

  // Quick Demo fill buttons for smooth testing
  const fillCredentials = (type: 'owner' | 'client') => {
    if (type === 'owner') {
      setEmail('admin@nexora.ai');
      setPassword('Nexora@2026!');
    } else {
      setEmail('lucas@nexusecom.com.br');
      setPassword('Senha123!');
    }
  };

  return (
    <div className="min-h-screen bg-[#060913] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background glow ambiance */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-blue-600/15 via-purple-600/15 to-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-md bg-[#0c1220]/90 border border-slate-800 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-2xl relative z-10">
        {/* Brand Logo & Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-[0_0_25px_rgba(59,130,246,0.3)] mb-3">
            <div className="w-full h-full bg-[#080c16] rounded-2xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white tracking-wider font-mono">
            NEXORA <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Plataforma Corporativa de Inteligência, Marketing & Automação
          </p>
        </div>

        {/* Status Alerts */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Mode: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail Corporativo</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@suaempresa.com"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-slate-300">Senha Segura</label>
                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Autenticando...</span>
              ) : (
                <>
                  <span>Acessar Plataforma</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Demo Credentials */}
            <div className="pt-3 border-t border-slate-800/80">
              <p className="text-[10px] text-slate-500 font-mono text-center uppercase tracking-wider mb-2">
                Acesso Rápido de Testes
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => fillCredentials('owner')}
                  className="px-2.5 py-1.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-300 hover:bg-amber-950/40 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Crown className="w-3 h-3 text-amber-400" />
                  <span>Proprietário</span>
                </button>
                <button
                  type="button"
                  onClick={() => fillCredentials('client')}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-950/20 border border-blue-500/30 text-blue-300 hover:bg-blue-900/30 text-[11px] font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Building className="w-3 h-3 text-cyan-400" />
                  <span>Empresa Cliente</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Não possui conta? </span>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Cadastre sua empresa
              </button>
            </div>
          </form>
        )}

        {/* Mode: REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome da Empresa</label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Nexus Tech Marketing"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ramo de Atuação</label>
                <select
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-2.5 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="Tecnologia & SaaS">Tecnologia & SaaS</option>
                  <option value="E-Commerce & Varejo">E-Commerce & Varejo</option>
                  <option value="Saúde & Clínica">Saúde & Clínica</option>
                  <option value="Imobiliário & Construção">Imobiliário</option>
                  <option value="Consultoria & Serviços">Consultoria & Serviços</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={companyPhone}
                  onChange={(e) => setCompanyPhone(e.target.value)}
                  placeholder="+55 (11) 9..."
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Responsável</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Lucas Mendes"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail Profissional</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Senha (mínimo 8 dígitos)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 mt-2 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white font-medium text-xs shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? <span>Criando Workspace...</span> : <span>Cadastrar e Iniciar Demonstração</span>}
            </button>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-400">Já possui uma conta? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
              >
                Fazer login
              </button>
            </div>
          </form>
        )}

        {/* Mode: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <p className="text-xs text-slate-400">
              Digite o e-mail cadastrado. Um código seguro de redefinição será gerado pelo servidor.
            </p>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail Cadastrado</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu.email@empresa.com"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:border-cyan-500 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-medium text-xs hover:bg-blue-500 transition-colors"
            >
              {loading ? 'Gerando...' : 'Gerar Código de Recuperação'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Voltar para o Login
              </button>
            </div>
          </form>
        )}

        {/* Mode: RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Código de Redefinição</label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  placeholder="Código de recuperação"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nova Senha (mínimo 8 dígitos)</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#080d1a] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-medium text-xs hover:bg-emerald-500 transition-colors"
            >
              {loading ? 'Salvando...' : 'Atualizar Senha com Sucesso'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Mode: OWNER SETUP */}
        {mode === 'owner-setup' && (
          <form onSubmit={handleOwnerSetup} className="space-y-3">
            <div className="p-2.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs">
              Configuração inicial protegida da conta master do Proprietário do NEXORA AI.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Chave Mestra de Instalação</label>
              <input
                type="password"
                required
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="Insira a chave mestra segura"
                className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Proprietário</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alifer Madeiro"
                className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail do Proprietário</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexora.ai"
                className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Senha Master</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#080d1a] border border-slate-800 rounded-xl px-3 py-2 text-xs text-white outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-medium text-xs hover:bg-amber-500 transition-colors"
            >
              {loading ? 'Configurando...' : 'Concluir Setup do Proprietário'}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-400 hover:text-white"
              >
                Voltar
              </button>
            </div>
          </form>
        )}

        {/* Owner setup trigger link at bottom */}
        {mode === 'login' && (
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={() => {
                setMasterKey('NEXORA_OWNER_SETUP_2026');
                setName('Alifer Madeiro');
                setEmail('admin@nexora.ai');
                setMode('owner-setup');
              }}
              className="text-[11px] text-slate-500 hover:text-amber-400 transition-colors flex items-center justify-center gap-1 mx-auto"
            >
              <Shield className="w-3 h-3" />
              <span>Configuração Inicial do Proprietário</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
