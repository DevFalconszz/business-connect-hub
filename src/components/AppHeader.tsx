import { NavLink, useLocation } from 'react-router-dom';
import { ClipboardList, Radar, Zap } from 'lucide-react';
import { isLocal } from '@/lib/env-check';

const tabs = [
  { to: '/', label: 'Gestão de Leads', icon: ClipboardList },
  { to: '/prospectar', label: 'Prospectar', icon: Radar },
];

export function AppHeader() {
  const location = useLocation();

  return (
    <header className="border-b bg-black text-white sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center gap-6 h-14">
          <span className="text-lg font-bold text-gold-500 shrink-0 flex items-center gap-2">
            <Zap className="w-5 h-5" />
            Business Connect Hub
          </span>
          {isLocal() && (
            <span className="text-[10px] font-mono bg-gold-500/20 text-gold-400 px-2 py-0.5 rounded-full border border-gold-500/30">
              LOCAL
            </span>
          )}
          <nav className="flex gap-1 ml-auto">
            {tabs.map(tab => {
              const active = location.pathname === tab.to;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-gold-500 text-black'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
