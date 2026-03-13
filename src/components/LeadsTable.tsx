import { Lead } from '@/lib/types';
import { StatusSelect } from './StatusSelect';
import { Button } from '@/components/ui/button';
import { Eye, Star, Pencil, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState } from 'react';

interface Props {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
}

const statusRowBg: Record<string, string> = {
  avaliando: 'bg-[hsl(var(--status-evaluating)/0.35)]',
  conversando: 'bg-[hsl(var(--status-talking)/0.35)]',
  reuniao_marcada: 'bg-[hsl(var(--status-meeting)/0.35)]',
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

export function LeadsTable({ leads, onOpenLead, onUpdateLead }: Props) {
  return (
    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/60">
              <th className="sticky left-0 z-10 bg-muted/90 backdrop-blur px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Nome</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Status</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Título</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Categoria</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Cidade</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">UF</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Telefone</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Rating</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Avaliações</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Responsável</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-muted-foreground whitespace-nowrap">Descrição</th>
              <th className="sticky right-0 z-10 bg-muted/90 backdrop-blur px-3 py-2.5 text-center font-semibold text-xs text-muted-foreground whitespace-nowrap">Ação</th>
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
                  <EditableCell value={lead.title} onChange={(v) => onUpdateLead({ ...lead, title: v })} className="w-[140px]" />
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
                <td className="px-3 py-1.5 whitespace-nowrap">
                  {lead.rating && (
                    <span className="flex items-center gap-1 font-mono-num text-xs">
                      <Star className="w-3 h-3 text-yellow-500" />{lead.rating}
                    </span>
                  )}
                </td>
                <td className="px-3 py-1.5 whitespace-nowrap font-mono-num text-xs">{lead.reviews_count}</td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.responsavel} onChange={(v) => onUpdateLead({ ...lead, responsavel: v })} className="w-[120px]" />
                </td>
                <td className="px-3 py-1.5">
                  <EditableCell value={lead.descricao} onChange={(v) => onUpdateLead({ ...lead, descricao: v })} className="w-[160px]" />
                </td>
                <td className="sticky right-0 z-10 bg-card px-3 py-1.5 text-center">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => onOpenLead(lead)}>
                    <Eye className="w-4 h-4" />
                  </Button>
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
