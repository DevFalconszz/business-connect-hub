import { NavLink, useLocation } from 'react-router-dom';
import { ClipboardList, Radar, BarChart3, LogOut } from 'lucide-react';
import { isLocal } from '@/lib/env-check';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

interface Tab {
  to: string;
  label: string;
  icon: typeof ClipboardList;
  adminOnly?: boolean;
}

const tabs: Tab[] = [
  { to: '/', label: 'Gestão de Leads', icon: ClipboardList },
  { to: '/prospectar', label: 'Prospectar', icon: Radar },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3, adminOnly: true },
];

export function AppHeader() {
  const location = useLocation();
  const { signOut, user, role } = useAuth();

  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || role === 'admin');

  return (
    <header className="border-b border-border bg-card text-foreground sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center gap-6 h-14">
          <span className="text-lg font-bold text-gold-500 shrink-0 flex items-center gap-2">
            <img src="/logo.png" alt="CRM MI" className="h-9 w-9 object-contain" />
            CRM MI
          </span>
          {isLocal() && (
            <span className="text-[10px] font-mono bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/30">
              LOCAL
            </span>
          )}
          <nav className="flex gap-1 ml-auto">
            {visibleTabs.map(tab => {
              const active = location.pathname === tab.to;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gold-500 text-black'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </NavLink>
              );
            })}
          </nav>
          <div className="flex items-center gap-3 ml-4 pl-4 border-l border-border">
            <span className="text-xs text-muted-foreground hidden sm:inline">{user?.email}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={signOut}
              className="text-muted-foreground hover:text-foreground hover:bg-accent h-9 px-3"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline ml-1">Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
