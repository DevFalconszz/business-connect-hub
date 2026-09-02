import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus, STATUS_LABELS } from '@/lib/types';

interface Props {
  value: LeadStatus;
  onChange: (v: LeadStatus) => void;
}

const statusStyles: Record<string, string> = {
  analise_pendente: 'bg-gold-500/15 text-gold-400',
  em_analise: 'bg-gold-500/15 text-gold-400',
  follow_up: 'bg-gold-500/15 text-gold-400',
  reuniao_agendada: 'bg-gold-500/15 text-gold-400',
  recusado: 'bg-red-500/15 text-red-400',
  venda_fechada: 'bg-gold-500/15 text-gold-400',
};

const STATUSES: LeadStatus[] = [
  'analise_pendente', 'em_analise', 'follow_up',
  'reuniao_agendada', 'recusado', 'venda_fechada',
];

export function StatusSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as LeadStatus)}>
      <SelectTrigger className={`w-[170px] h-8 text-xs rounded-lg font-medium border-0 ${statusStyles[value] || ''}`}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        {STATUSES.map((s) => (
          <SelectItem key={s} value={s}>{STATUS_LABELS[s]}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
