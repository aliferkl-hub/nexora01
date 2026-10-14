import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Company } from '../types';
import { api, getStoredToken, getActiveTenantId, setActiveTenantId } from '../services/api';

interface AuthContextType {
  user: User | null;
  company: Company | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOwner: boolean;
  activeTenantId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    companyName: string;
    companyIndustry?: string;
    companyPhone?: string;
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchTenant: (companyId: string | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTenantId, setActiveTenantState] = useState<string | null>(getActiveTenantId());

  const refreshUser = async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setCompany(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.auth.me();
      setUser(data.user);
      setCompany(data.company);
    } catch (err) {
      console.warn('Session expired or invalid:', err);
      api.auth.logout();
      setUser(null);
      setCompany(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setUser(res.user);
    setCompany(res.company);
    setActiveTenantState(null);
  };

  const register = async (payload: {
    companyName: string;
    companyIndustry?: string;
    companyPhone?: string;
    name: string;
    email: string;
    password: string;
  }) => {
    const res = await api.auth.register(payload);
    setUser(res.user);
    setCompany(res.company);
    setActiveTenantState(null);
  };

  const logout = () => {
    api.auth.logout();
    setUser(null);
    setCompany(null);
    setActiveTenantState(null);
  };

  const switchTenant = async (companyId: string | null) => {
    setActiveTenantId(companyId);
    setActiveTenantState(companyId);
    await refreshUser();
  };

  const isOwner = user?.role === 'owner';

  return (
    <AuthContext.Provider
      value={{
        user,
        company,
        isAuthenticated: !!user,
        isLoading,
        isOwner,
        activeTenantId,
        login,
        register,
        logout,
        refreshUser,
        switchTenant,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
