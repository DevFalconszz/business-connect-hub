import { Lead } from '@/lib/types';
import { StatusSelect } from './StatusSelect';
import { Button } from '@/components/ui/button';
import { Eye, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface Props {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const statusRowBg: Record<string, string> = {
  analise_pendente: 'bg-[hsl(var(--status-pending)/0.35)]',
  em_analise: 'bg-[hsl(var(--status-analyzing)/0.35)]',
  follow_up: 'bg-[hsl(var(--status-followup)/0.35)]',
  reuniao_agendada: 'bg-[hsl(var(--status-meeting)/0.35)]',
  recusado: 'bg-[hsl(var(--status-refused)/0.35)]',
  venda_fechada: 'bg-[hsl(var(--status-closed)/0.35)]',
};

function EditableCell({ value, onChange, className = '' }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <Input
      className={`h-8 text-xs border-transparent bg-transparent hover:border-input focus:border-input transition-colors ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function LeadsTable({ leads, onOpenLead, onUpdateLead, onDeleteLead }: Props) {
  return (
    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="sticky left-0 z-10 bg-muted/90 backdrop-blur px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Nome</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Status</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Nicho</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Cidade</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">UF</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Telefone</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Nome Decisor</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Número Decisor</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Responsável</th>
              <th className="sticky right-0 z-10 bg-muted/90 backdrop-blur px-3 py-2.5 text-center font-semibold text-xs text-muted-foreground whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className={`border-b hover:bg-muted/30 transition-colors ${statusRowBg[lead.status] || ''}`}>
                <td className="sticky left-0 z-10 bg-card px-3 py-1.5 font-medium whitespace-nowrap max-w-[200px]" style={lead.status !== 'none' ? { backgroundColor: 'inherit' } : undefined}>
                  <EditableCell value={lead.name} onChange={(v) => onUpdateLead({ ...lead, name: v })} className="font-medium w-[180px]" />
                </td>
                <td className="px-3 py-1.5">
                  <StatusSelect value={lead.status} onChange={(s) => onUpdateLead({ ...lead, status: s })} />
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.category} onChange={(v) => onUpdateLead({ ...lead, category: v })} className="w-[120px]" />
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.city} onChange={(v) => onUpdateLead({ ...lead, city: v })} className="w-[110px]" />
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.state} onChange={(v) => onUpdateLead({ ...lead, state: v })} className="w-[50px]" />
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.phone} onChange={(v) => onUpdateLead({ ...lead, phone: v })} className="w-[130px] font-mono-num" />
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.nome_decisor} onChange={(v) => onUpdateLead({ ...lead, nome_decisor: v })} className="w-[130px]" />
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.numero_decisor} onChange={(v) => onUpdateLead({ ...lead, numero_decisor: v })} className="w-[130px] font-mono-num" />
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.responsavel} onChange={(v) => onUpdateLead({ ...lead, responsavel: v })} className="w-[120px]" />
                </td>
                <td className="sticky right-0 z-10 bg-card px-3 py-1.5 text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => onOpenLead(lead)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => onDeleteLead(lead.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg font-medium">Nenhum lead encontrado</p>
          <p className="text-sm mt-1">Faça upload de uma planilha ou adicione manualmente.</p>
        </div>
      )}
    </div>
  );
}
