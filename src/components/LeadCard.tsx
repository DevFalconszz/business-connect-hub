import { Lead } from '@/lib/types';
import { StatusSelect } from './StatusSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Eye, MapPin, Phone, Pencil, Check, X, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Props {
  lead: Lead;
  onOpenLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
  onDeleteLead: (id: string) => void;
}

const statusCardBorder: Record<string, string> = {
  analise_pendente: 'border-l-4 border-l-gold-500 bg-gold-50/30',
  em_analise: 'border-l-4 border-l-gold-500 bg-gold-50/30',
  follow_up: 'border-l-4 border-l-gold-500 bg-gold-50/30',
  reuniao_agendada: 'border-l-4 border-l-gold-500 bg-gold-50/30',
  recusado: 'border-l-4 border-l-red-400 bg-red-50/30',
  venda_fechada: 'border-l-4 border-l-gold-500 bg-gold-50/30',
};

export function LeadCard({ lead, onOpenLead, onUpdateLead, onDeleteLead }: Props) {
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(lead);

  const startEdit = () => { setEditData(lead); setEditing(true); };
  const saveEdit = () => { onUpdateLead(editData); setEditing(false); };
  const cancelEdit = () => setEditing(false);

  const borderClass = statusCardBorder[lead.status] || 'border-l-4 border-l-transparent';

  if (editing) {
    return (
      <div className={`rounded-xl bg-white p-4 shadow-sm border border-gray-200 ${borderClass} space-y-3`}>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Editando</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-9 w-9 p-0"><X className="w-4 h-4" /></Button>
            <Button size="sm" onClick={saveEdit} className="h-9 px-4 bg-black text-white hover:bg-gray-800"><Check className="w-4 h-4 mr-1" /> Salvar</Button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {([
            ['name', 'Nome'], ['category', 'Nicho'], ['city', 'Cidade'], ['state', 'UF'],
            ['phone', 'Telefone'], ['nome_decisor', 'Nome Decisor'], ['numero_decisor', 'N\u00famero Decisor'],
            ['responsavel', 'Respons\u00e1vel'], ['descricao', 'Descri\u00e7\u00e3o'], ['website', 'Website'],
          ] as [keyof Lead, string][]).map(([key, label]) => (
            <div key={key} className={key === 'descricao' || key === 'website' ? 'sm:col-span-2' : ''}>
              <label className="text-[11px] font-medium text-gray-500">{label}</label>
              <Input className="h-10 text-sm mt-0.5 border-gray-200 focus:border-gold-500" value={(editData[key] as string) || ''} onChange={(e) => setEditData(prev => ({ ...prev, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-xl bg-white p-4 shadow-sm border border-gray-200 hover:shadow-md transition-shadow ${borderClass}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-900 truncate text-base">{lead.name}</h3>
          <p className="text-xs text-gray-500 truncate mt-0.5">{lead.category}</p>
        </div>
        <StatusSelect value={lead.status} onChange={(s) => onUpdateLead({ ...lead, status: s })} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
        {lead.city && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {lead.city}{lead.state ? `, ${lead.state}` : ''}</span>}
        {lead.phone && <span className="flex items-center gap-1 font-mono-num"><Phone className="w-3 h-3" /> {lead.phone}</span>}
      </div>

      {(lead.nome_decisor || lead.responsavel) && (
        <div className="mt-2 text-xs space-y-0.5">
          {lead.nome_decisor && <p><span className="text-gray-500">Decisor:</span> <span className="font-medium text-gray-900">{lead.nome_decisor}</span></p>}
          {lead.responsavel && <p><span className="text-gray-500">Respons\u00e1vel:</span> <span className="font-medium text-gray-900">{lead.responsavel}</span></p>}
        </div>
      )}

      <div className="mt-3 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1 h-10 text-sm border-gray-200 hover:border-gold-500" onClick={startEdit}><Pencil className="w-4 h-4 mr-1.5" /> Editar</Button>
        <Button size="sm" className="flex-1 h-10 text-sm bg-black text-white hover:bg-gray-800" onClick={() => onOpenLead(lead)}><Eye className="w-4 h-4 mr-1.5" /> Detalhes</Button>
        <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteLead(lead.id)}><Trash2 className="w-4 h-4" /></Button>
      </div>
    </div>
  );
}
