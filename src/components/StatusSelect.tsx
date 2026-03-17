import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus } from '@/lib/types';

interface Props {
  value: LeadStatus;
  onChange: (v: LeadStatus) => void;
}

const statusStyles: Record<string, string> = {
  none: '',
  analise_pendente: 'bg-[hsl(var(--status-pending))] text-[hsl(var(--status-pending-text))]',
  em_analise: 'bg-[hsl(var(--status-analyzing))] text-[hsl(var(--status-analyzing-text))]',
  follow_up: 'bg-[hsl(var(--status-followup))] text-[hsl(var(--status-followup-text))]',
  reuniao_agendada: 'bg-[hsl(var(--status-meeting))] text-[hsl(var(--status-meeting-text))]',
  recusado: 'bg-[hsl(var(--status-refused))] text-[hsl(var(--status-refused-text))]',
  venda_fechada: 'bg-[hsl(var(--status-closed))] text-[hsl(var(--status-closed-text))]',
};

export function StatusSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as LeadStatus)}>
      <SelectTrigger className={`w-[170px] h-8 text-xs rounded-lg font-medium border-0 ${statusStyles[value] || ''}`}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sem status</SelectItem>
        <SelectItem value="analise_pendente">🟡 Análise Pendente</SelectItem>
        <SelectItem value="em_analise">🔵 Em Análise</SelectItem>
        <SelectItem value="follow_up">🟠 Follow Up</SelectItem>
        <SelectItem value="reuniao_agendada">🟢 Reunião Agendada</SelectItem>
        <SelectItem value="recusado">🔴 Recusado</SelectItem>
        <SelectItem value="venda_fechada">✅ Venda Fechada</SelectItem>
      </SelectContent>
    </Select>
  );
}
