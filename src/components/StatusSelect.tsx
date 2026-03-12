import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus } from '@/lib/types';

interface Props {
  value: LeadStatus;
  onChange: (v: LeadStatus) => void;
}

export function StatusSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as LeadStatus)}>
      <SelectTrigger className="w-[160px] h-8 text-xs">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sem status</SelectItem>
        <SelectItem value="avaliando">Avaliando</SelectItem>
        <SelectItem value="conversando">Conversando</SelectItem>
        <SelectItem value="reuniao_marcada">Reunião Marcada</SelectItem>
      </SelectContent>
    </Select>
  );
}
