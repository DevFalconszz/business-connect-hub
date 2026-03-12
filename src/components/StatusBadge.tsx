import { LeadStatus } from '@/lib/types';

const config: Record<LeadStatus, { label: string; bg: string; text: string } | null> = {
  none: null,
  avaliando: { label: 'Avaliando', bg: 'bg-status-evaluating', text: 'text-status-evaluating-text' },
  conversando: { label: 'Conversando', bg: 'bg-status-talking', text: 'text-status-talking-text' },
  reuniao_marcada: { label: 'Reunião Marcada', bg: 'bg-status-meeting', text: 'text-status-meeting-text' },
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
