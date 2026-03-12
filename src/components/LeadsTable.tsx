import { Lead } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { StatusSelect } from './StatusSelect';
import { Button } from '@/components/ui/button';
import { Eye, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface Props {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
}

const statusRowBg: Record<string, string> = {
  avaliando: 'bg-status-evaluating/50',
  conversando: 'bg-status-talking/50',
  reuniao_marcada: 'bg-status-meeting/50',
};

export function LeadsTable({ leads, onOpenLead, onUpdateLead }: Props) {
  return (
    <div className="border rounded-lg bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="sticky left-0 z-10 bg-secondary/90 backdrop-blur px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Nome</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Status</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Título</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Categoria</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Cidade</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">UF</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Telefone</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Rating</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Avaliações</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Responsável</th>
              <th className="px-3 py-2 text-left font-medium text-xs text-muted-foreground whitespace-nowrap">Descrição</th>
              <th className="sticky right-0 z-10 bg-secondary/90 backdrop-blur px-3 py-2 text-center font-medium text-xs text-muted-foreground whitespace-nowrap">Ação</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className={`border-b hover:bg-secondary/30 transition-colors ${statusRowBg[lead.status] || ''}`}>
                <td className="sticky left-0 z-10 bg-card px-3 py-1.5 font-medium whitespace-nowrap max-w-[200px] truncate" style={lead.status !== 'none' ? { backgroundColor: 'inherit' } : undefined}>
                  {lead.name}
                </td>
                <td className="px-3 py-1.5">
                  <StatusSelect value={lead.status} onChange={(s) => onUpdateLead({ ...lead, status: s })} />
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap max-w-[150px] truncate">{lead.title}</td>
                <td className="px-3 py-1.5 whitespace-nowrap max-w-[120px] truncate">{lead.category}</td>
                <td className="px-3 py-1.5 whitespace-nowrap">{lead.city}</td>
                <td className="px-3 py-1.5 whitespace-nowrap">{lead.state}</td>
                <td className="px-3 py-1.5 whitespace-nowrap font-mono-num text-xs">{lead.phone}</td>
                <td className="px-3 py-1.5 whitespace-nowrap">
                  {lead.rating && (
                    <span className="flex items-center gap-1 font-mono-num">
                      <Star className="w-3 h-3 text-yellow-500" />{lead.rating}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap font-mono-num text-xs">{lead.reviews_count}</td>
                <td className="px-3 py-1.5">
                  <Input
                    className="h-7 text-xs w-[120px]"
                    placeholder="Responsável"
                    value={lead.responsavel}
                    onChange={(e) => onUpdateLead({ ...lead, responsavel: e.target.value })}
                  />
                </td>
                <td className="px-3 py-1.5">
                  <Input
                    className="h-7 text-xs w-[140px]"
                    placeholder="Descrição"
                    value={lead.descricao}
                    onChange={(e) => onUpdateLead({ ...lead, descricao: e.target.value })}
                  />
                </td>
                <td className="sticky right-0 z-10 bg-card px-3 py-1.5 text-center">
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onOpenLead(lead)}>
                    <Eye className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          Nenhum lead encontrado. Faça upload de uma planilha ou adicione manualmente.
        </div>
      )}
    </div>
  );
}
