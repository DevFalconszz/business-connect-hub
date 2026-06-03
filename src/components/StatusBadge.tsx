import { LeadStatus } from '@/lib/types';

const config: Record<LeadStatus, { label: string; bg: string; text: string } | null> = {
  none: null,
  analise_pendente: { label: 'Análise Pendente', bg: 'bg-gold-100', text: 'text-gold-800' },
  em_analise: { label: 'Em Análise', bg: 'bg-gold-100', text: 'text-gold-800' },
  follow_up: { label: 'Follow Up', bg: 'bg-gold-100', text: 'text-gold-800' },
  reuniao_agendada: { label: 'Reunião Agendada', bg: 'bg-gold-100', text: 'text-gold-800' },
  recusado: { label: 'Recusado', bg: 'bg-red-100', text: 'text-red-800' },
  venda_fechada: { label: 'Venda Fechada', bg: 'bg-gold-100', text: 'text-gold-800' },
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  const c = config[status];
  if (!c) return <span className="text-gray-400 text-xs">—</span>;
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}
