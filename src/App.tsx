import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { AICentralHub } from './components/ai/AICentralHub';
import { MarketingStrategies } from './components/marketing/MarketingStrategies';
import { ContentStudio } from './components/content/ContentStudio';
import { CampaignsModule } from './components/campaigns/CampaignsModule';
import { CrmModule } from './components/crm/CrmModule';
import { AutomationsModule } from './components/automations/AutomationsModule';
import { ReportsModule } from './components/reports/ReportsModule';
import { OwnerAdminModule } from './components/admin/OwnerAdminModule';
import { PlansBillingModule } from './components/billing/PlansBillingModule';
import { SettingsModule } from './components/settings/SettingsModule';
import { GrowthManualModule } from './components/manual/GrowthManualModule';
import { RefreshCw, Layers } from 'lucide-react';

function getSectionFromUrl(): string {
  try {
    const hash = window.location.hash.replace('#', '');
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab') || params.get('section');
    if (tabParam) return tabParam;
    if (hash) {
      if (hash.startsWith('manual')) return 'manual';
      return hash;
    }
    if (window.location.pathname.includes('/manual')) return 'manual';
  } catch {
    // ignore
  }
  return 'dashboard';
}

function AppContent() {
  const { isAuthenticated, isLoading, isOwner } = useAuth();
  const [activeSection, setActiveSection] = useState<string>(getSectionFromUrl);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  React.useEffect(() => {
    const handleLocationChange = () => {
      const section = getSectionFromUrl();
      setActiveSection(section);
    };
    window.addEventListener('hashchange', handleLocationChange);
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('hashchange', handleLocationChange);
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    try {
      if (section === 'manual') {
        if (!window.location.hash.startsWith('#manual')) {
          window.location.hash = 'manual';
        }
      } else {
        window.location.hash = section;
      }
    } catch {
      // ignore
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 p-[1px] shadow-[0_0_30px_rgba(59,130,246,0.4)]">
          <div className="w-full h-full bg-[#080c16] rounded-2xl flex items-center justify-center">
            <Layers className="w-6 h-6 text-cyan-400 animate-pulse" />
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Iniciando NEXORA AI...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AuthModal />;
  }

  const renderSection = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview onNavigate={handleNavigate} />;
      case 'manual':
        return <GrowthManualModule onNavigate={handleNavigate} />;
      case 'ai-hub':
        return <AICentralHub onNavigate={handleNavigate} />;
      case 'marketing':
        return <MarketingStrategies onNavigate={handleNavigate} />;
      case 'content':
        return <ContentStudio onNavigate={handleNavigate} />;
      case 'campaigns':
        return <CampaignsModule onNavigate={handleNavigate} />;
      case 'crm':
        return <CrmModule onNavigate={handleNavigate} />;
      case 'automations':
        return <AutomationsModule onNavigate={handleNavigate} />;
      case 'reports':
        return <ReportsModule />;
      case 'billing':
        return <PlansBillingModule />;
      case 'settings':
        return <SettingsModule />;
      case 'admin':
        return isOwner ? <OwnerAdminModule /> : <DashboardOverview onNavigate={handleNavigate} />;
      default:
        return <DashboardOverview onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-white">
      {/* Top Bar */}
      <Navbar
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onNavigate={handleNavigate}
        activeSection={activeSection}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeSection={activeSection}
          onNavigate={handleNavigate}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 overflow-y-auto custom-scrollbar">
          {renderSection()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
