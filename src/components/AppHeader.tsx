import { NavLink, useLocation } from 'react-router-dom';
import { ClipboardList, Radar } from 'lucide-react';

const tabs = [
  { to: '/', label: 'Gestão de Leads', icon: ClipboardList },
  { to: '/prospectar', label: 'Prospectar', icon: Radar },
];

export function AppHeader() {
  const location = useLocation();

  return (
    <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-[1600px] mx-auto px-4">
        <div className="flex items-center gap-6 h-14">
          <span className="text-lg font-bold text-foreground shrink-0">📋 CRM</span>
          <nav className="flex gap-1">
            {tabs.map(tab => {
              const active = location.pathname === tab.to;
              return (
                <NavLink
                  key={tab.to}
                  to={tab.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
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
