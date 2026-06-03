import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadStatus } from '@/lib/types';

interface Props {
  value: LeadStatus;
  onChange: (v: LeadStatus) => void;
}

const statusStyles: Record<string, string> = {
  none: '',
  analise_pendente: 'bg-gold-100 text-gold-800',
  em_analise: 'bg-gold-100 text-gold-800',
  follow_up: 'bg-gold-100 text-gold-800',
  reuniao_agendada: 'bg-gold-100 text-gold-800',
  recusado: 'bg-red-100 text-red-800',
  venda_fechada: 'bg-gold-100 text-gold-800',
};

export function StatusSelect({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as LeadStatus)}>
      <SelectTrigger className={`w-[170px] h-8 text-xs rounded-lg font-medium border-0 ${statusStyles[value] || ''}`}>
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">Sem status</SelectItem>
        <SelectItem value="analise_pendente">An\u00e1lise Pendente</SelectItem>
        <SelectItem value="em_analise">Em An\u00e1lise</SelectItem>
        <SelectItem value="follow_up">Follow Up</SelectItem>
        <SelectItem value="reuniao_agendada">Reuni\u00e3o Agendada</SelectItem>
        <SelectItem value="recusado">Recusado</SelectItem>
        <SelectItem value="venda_fechada">Venda Fechada</SelectItem>
      </SelectContent>
    </Select>
  );
}
