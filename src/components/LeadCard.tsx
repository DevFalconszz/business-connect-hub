import { Lead } from '@/lib/types';
import { StatusSelect } from './StatusSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, Star, MapPin, Phone, Pencil, Check, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
  lead: Lead;
  onOpenLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
}

const statusCardBorder: Record<string, string> = {
  avaliando: 'border-l-4 border-l-[hsl(var(--status-evaluating-border))] bg-[hsl(var(--status-evaluating)/0.3)]',
  conversando: 'border-l-4 border-l-[hsl(var(--status-talking-border))] bg-[hsl(var(--status-talking)/0.3)]',
  reuniao_marcada: 'border-l-4 border-l-[hsl(var(--status-meeting-border))] bg-[hsl(var(--status-meeting)/0.3)]',
};

export function LeadCard({ lead, onOpenLead, onUpdateLead }: Props) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(lead);

  const startEdit = () => {
    setEditData(lead);
    setEditing(true);
  };

  const saveEdit = () => {
    onUpdateLead(editData);
    setEditing(false);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const borderClass = statusCardBorder[lead.status] || 'border-l-4 border-l-transparent';

  if (editing) {
    return (
      <div className={`rounded-xl bg-card p-4 shadow-sm ${borderClass} space-y-3`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Editando</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-9 w-9 p-0">
              <X className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={saveEdit} className="h-9 px-4">
              <Check className="w-4 h-4 mr-1" /> Salvar
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            ['name', 'Nome'],
            ['title', 'Título'],
            ['category', 'Categoria'],
            ['city', 'Cidade'],
            ['state', 'UF'],
            ['phone', 'Telefone'],
            ['responsavel', 'Responsável'],
            ['descricao', 'Descrição'],
            ['website', 'Website'],
            ['instagram', 'Instagram'],
            ['rating', 'Rating'],
            ['reviews_count', 'Avaliações'],
          ] as [keyof Lead, string][]).map(([key, label]) => (
            <div key={key} className={key === 'descricao' || key === 'website' ? 'sm:col-span-2' : ''}>
              <label className="text-[11px] font-medium text-muted-foreground">{label}</label>
              <Input
                className="h-10 text-sm mt-0.5"
                value={(editData[key] as string) || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-card p-4 shadow-sm hover:shadow-md transition-shadow ${borderClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-foreground truncate text-base">{lead.name}</h3>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{lead.title || lead.category}</p>
        </div>
        <StatusSelect value={lead.status} onChange={(s) => onUpdateLead({ ...lead, status: s })} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        {lead.city && (
          <span className="flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {lead.city}{lead.state ? `, ${lead.state}` : ''}
          </span>
        )}
        {lead.phone && (
          <span className="flex items-center gap-1 font-mono-num">
            <Phone className="w-3 h-3" /> {lead.phone}
          </span>
        )}
        {lead.rating && (
          <span className="flex items-center gap-1 font-mono-num">
            <Star className="w-3 h-3 text-yellow-500" /> {lead.rating}
          </span>
        )}
      </div>

      {(lead.responsavel || lead.descricao) && (
        <div className="mt-2 text-xs space-y-0.5">
          {lead.responsavel && (
            <p><span className="text-muted-foreground">Responsável:</span> <span className="font-medium text-foreground">{lead.responsavel}</span></p>
          )}
          {lead.descricao && (
            <p className="text-muted-foreground truncate">{lead.descricao}</p>
          )}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 h-10 text-sm" onClick={startEdit}>
          <Pencil className="w-4 h-4 mr-1.5" /> Editar
        </Button>
        <Button size="sm" className="flex-1 h-10 text-sm" onClick={() => onOpenLead(lead)}>
          <Eye className="w-4 h-4 mr-1.5" /> Detalhes
        </Button>
      </div>
    </div>
  );
}
