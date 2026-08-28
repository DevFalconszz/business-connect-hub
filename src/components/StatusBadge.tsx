import { LeadStatus, STATUS_LABELS } from '@/lib/types';

const config: Record<LeadStatus, { label: string; bg: string; text: string } | null> = {
  none: null,
  analise_pendente: { label: STATUS_LABELS.analise_pendente, bg: 'bg-gold-500/15', text: 'text-gold-400' },
  em_analise: { label: STATUS_LABELS.em_analise, bg: 'bg-gold-500/15', text: 'text-gold-400' },
  follow_up: { label: STATUS_LABELS.follow_up, bg: 'bg-gold-500/15', text: 'text-gold-400' },
  reuniao_agendada: { label: STATUS_LABELS.reuniao_agendada, bg: 'bg-gold-500/15', text: 'text-gold-400' },
  recusado: { label: STATUS_LABELS.recusado, bg: 'bg-red-500/15', text: 'text-red-400' },
  venda_fechada: { label: STATUS_LABELS.venda_fechada, bg: 'bg-gold-500/15', text: 'text-gold-400' },
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
