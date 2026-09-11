import { Lead } from '@/lib/types';
import { StatusSelect } from './StatusSelect';
import { Button } from '@/components/ui/button';
import { Eye, MapPin, Phone, User2, PackageOpen } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { initials, avatarColor } from '@/lib/avatars';

interface Props {
  leads: Lead[];
  onOpenLead: (lead: Lead) => void;
  onUpdateLead: (lead: Lead) => void;
}

const statusRowBg: Record<string, string> = {
  analise_pendente: 'bg-amber-500/[0.03]',
  em_analise: 'bg-orange-500/[0.03]',
  follow_up: 'bg-sky-500/[0.03]',
  reuniao_agendada: 'bg-violet-500/[0.03]',
  recusado: 'bg-red-500/[0.04]',
  venda_fechada: 'bg-emerald-500/[0.03]',
};

function EditableCell({ value, onChange, className = '' }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <Input
      className={`h-8 text-xs border-transparent bg-transparent hover:border-border focus:border-gold-500 focus:bg-card transition-colors ${className}`}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}

function IconCell({
  icon,
  value,
  onChange,
  onUpdate,
  className = '',
}: { icon: React.ReactNode; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground/50 shrink-0">{icon}</span>
      <EditableCell value={value} onChange={onChange} className={className} />
    </div>
  );
}

export function LeadsTable({ leads, onOpenLead, onUpdateLead }: Props) {
  return (
    <div className="border border-border/70 rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-muted-foreground bg-accent/60">
              <th className="sticky left-0 z-10 bg-accent/70 backdrop-blur px-4 py-3 font-semibold whitespace-nowrap">Nome</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Status</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Nicho</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Cidade</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Telefone</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Nome Decisor</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Número Decisor</th>
              <th className="px-3 py-3 font-semibold whitespace-nowrap">Responsável</th>
              <th className="sticky right-0 z-10 bg-accent/70 backdrop-blur px-4 py-3 text-center font-semibold whitespace-nowrap">Ações</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead, i) => (
              <tr
                key={lead.id}
                className={`hover:bg-accent/40 transition-colors ${statusRowBg[lead.status] || ''} ${i % 2 === 1 ? 'bg-accent/20' : ''}`}
              >
                <td className="sticky left-0 z-10 bg-card px-4 py-2 font-medium whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-xs font-bold ${avatarColor(lead.name)}`}>
                      {initials(lead.name)}
                    </span>
                    <EditableCell
                      value={lead.name}
                      onChange={(v) => onUpdateLead({ ...lead, name: v })}
                      className="font-medium w-[180px]"
                    />
                  </div>
                </td>
                <td className="px-3 py-2">
                  <StatusSelect value={lead.status} onChange={(s) => onUpdateLead({ ...lead, status: s })} />
                </td>
                <td className="px-3 py-2">
                  <EditableCell value={lead.category} onChange={(v) => onUpdateLead({ ...lead, category: v })} className="w-[120px]" />
                </td>
                <td className="px-3 py-2">
                  <IconCell
                    icon={<MapPin className="w-3.5 h-3.5" />}
                    value={lead.city}
                    onChange={(v) => onUpdateLead({ ...lead, city: v })}
                    className="w-[110px]"
                  />
                </td>
                <td className="px-3 py-2">
                  <IconCell
                    icon={<Phone className="w-3.5 h-3.5" />}
                    value={lead.phone}
                    onChange={(v) => onUpdateLead({ ...lead, phone: v })}
                    className="w-[130px] font-mono-num"
                  />
                </td>
                <td className="px-3 py-2">
                  <EditableCell value={lead.nome_decisor} onChange={(v) => onUpdateLead({ ...lead, nome_decisor: v })} className="w-[130px]" />
                </td>
                <td className="px-3 py-2">
                  <EditableCell value={lead.numero_decisor} onChange={(v) => onUpdateLead({ ...lead, numero_decisor: v })} className="w-[130px] font-mono-num" />
                </td>
                <td className="px-3 py-2 whitespace-nowrap">
                  <span className="flex items-center gap-1.5 text-xs text-foreground">
                    <User2 className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
                    {lead.responsavel || '—'}
                  </span>
                </td>
                <td className="sticky right-0 z-10 bg-card px-4 py-2 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-full hover:bg-accent"
                    onClick={() => onOpenLead(lead)}
                    title="Ver detalhes"
                  >
                    <Eye className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {leads.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <PackageOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-foreground">Nenhum lead encontrado</p>
          <p className="text-sm mt-1">Adicione novos leads pela tela de Prospecção.</p>
        </div>
      )}
    </div>
  );
}