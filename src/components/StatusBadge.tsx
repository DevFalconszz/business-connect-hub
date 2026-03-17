import { LeadStatus } from '@/lib/types';

const config: Record<LeadStatus, { label: string; bg: string; text: string } | null> = {
  none: null,
  analise_pendente: { label: 'Análise Pendente', bg: 'bg-status-pending', text: 'text-status-pending-text' },
  em_analise: { label: 'Em Análise', bg: 'bg-status-analyzing', text: 'text-status-analyzing-text' },
  follow_up: { label: 'Follow Up', bg: 'bg-status-followup', text: 'text-status-followup-text' },
  reuniao_agendada: { label: 'Reunião Agendada', bg: 'bg-status-meeting', text: 'text-status-meeting-text' },
  recusado: { label: 'Recusado', bg: 'bg-status-refused', text: 'text-status-refused-text' },
  venda_fechada: { label: 'Venda Fechada', bg: 'bg-status-closed', text: 'text-status-closed-text' },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const c = config[status];
  if (!c) return <span className="text-muted-foreground text-xs">—</span>;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
