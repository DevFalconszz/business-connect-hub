import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus } from '@/lib/types';

interface Props {
  value: LeadStatus;
  onChange: (v: LeadStatus) => void;
}

const statusStyles: Record<string, string> = {
  none: '',
  avaliando: 'bg-[hsl(var(--status-evaluating))] text-[hsl(var(--status-evaluating-text))]',
  conversando: 'bg-[hsl(var(--status-talking))] text-[hsl(var(--status-talking-text))]',
  reuniao_marcada: 'bg-[hsl(var(--status-meeting))] text-[hsl(var(--status-meeting-text))]',
};

export function StatusSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as LeadStatus)}>
      <SelectTrigger className={`w-[150px] h-8 text-xs rounded-lg font-medium border-0 ${statusStyles[value] || ''}`}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sem status</SelectItem>
        <SelectItem value="avaliando">🟡 Avaliando</SelectItem>
        <SelectItem value="conversando">🔵 Conversando</SelectItem>
        <SelectItem value="reuniao_marcada">🟢 Reunião Marcada</SelectItem>
      </SelectContent>
    </Select>
  );
}
