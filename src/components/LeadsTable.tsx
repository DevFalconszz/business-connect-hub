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
  analise_pendente: 'bg-gold-50/50',
  em_analise: 'bg-gold-50/50',
  follow_up: 'bg-gold-50/50',
  reuniao_agendada: 'bg-gold-50/50',
  recusado: 'bg-red-50/50',
  venda_fechada: 'bg-gold-50/50',
};

function EditableCell({ value, onChange, className = '' }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <Input
      className={`h-8 text-xs border-transparent bg-transparent hover:border-gray-300 focus:border-gold-500 transition-colors ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

export function LeadsTable({ leads, onOpenLead, onUpdateLead, onDeleteLead }: Props) {
  return (
    <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 backdrop-blur px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">Nome</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">Status</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">Nicho</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">Cidade</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">UF</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">Telefone</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">Nome Decisor</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">N\u00famero Decisor</th>
              <th className="px-3 py-2.5 text-left font-semibold text-xs text-gray-700 whitespace-nowrap">Respons\u00e1vel</th>
              <th className="sticky right-0 z-10 bg-gray-50 backdrop-blur px-3 py-2.5 text-center font-semibold text-xs text-gray-700 whitespace-nowrap">A\u00e7\u00f5es</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className={`border-b border-gray-100 hover:bg-gray-50/50 transition-colors ${statusRowBg[lead.status] || ''}`}>
                <td className="sticky left-0 z-10 bg-white px-3 py-1.5 font-medium whitespace-nowrap max-w-[200px] text-gray-900" style={lead.status !== 'none' ? { backgroundColor: 'inherit' } : undefined}>
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
                <td className="sticky right-0 z-10 bg-white px-3 py-1.5 text-center">
                  <div className="flex items-center gap-1 justify-center">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg hover:bg-gray-100" onClick={() => onOpenLead(lead)}>
                      <Eye className="w-4 h-4 text-gray-600" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => onDeleteLead(lead.id)}>
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
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg font-medium text-gray-700">Nenhum lead encontrado</p>
          <p className="text-sm mt-1">Faça upload de uma planilha ou adicione manualmente.</p>
        </div>
      )}
    </div>
  );
}
