import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Lead } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { MapPin, Phone, Globe, MessageCircle, Instagram, ExternalLink, User, PhoneCall } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

export function LeadModal({ lead, open, onClose, onUpdate }: Props) {
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen && lead) {
      setWhatsapp(lead.whatsapp_group);
      setSelectedDates(lead.meeting_dates.map(d => new Date(d)));
    }
    if (!isOpen) onClose();
  };

  if (!lead) return null;

  const handleSave = () => {
    onUpdate({ ...lead, whatsapp_group: whatsapp, meeting_dates: selectedDates.map(d => d.toISOString()) });
    onClose();
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    setSelectedDates(prev => {
      const exists = prev.some(d => d.toDateString() === date.toDateString());
      if (exists) return prev.filter(d => d.toDateString() !== date.toDateString());
      return [...prev, date];
    });
  };

  const generateGCalUrl = (date: Date) => {
    const start = date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const end = new Date(date.getTime() + 3600000).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=Reunião - ${encodeURIComponent(lead.name)}&dates=${start}/${end}`;
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-xl font-semibold text-foreground">{lead.name}</DialogTitle>
            <StatusBadge status={lead.status} />
          </div>
          <p className="text-sm text-muted-foreground">{lead.category}</p>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div className="space-y-4">
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Informações de Contato</h3>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex items-start gap-2"><MapPin className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" /><span>{lead.address || '—'}</span></div>
                <div className="flex items-center gap-2"><span className="text-muted-foreground text-xs">{lead.city}, {lead.state}</span></div>
                <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground shrink-0" /><span className="font-mono-num">{lead.phone || '—'}</span></div>
                {lead.website && <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-muted-foreground shrink-0" /><a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline truncate">{lead.website}</a></div>}
                {lead.instagram && <div className="flex items-center gap-2"><Instagram className="w-4 h-4 text-muted-foreground shrink-0" /><span>{lead.instagram}</span></div>}
                {lead.google_maps_url && <a href={lead.google_maps_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-gold-500 text-xs hover:underline"><ExternalLink className="w-3 h-3" /> Ver no Google Maps</a>}
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Decisor</h3>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground shrink-0" /><span>{lead.nome_decisor || '—'}</span></div>
                <div className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-muted-foreground shrink-0" /><span className="font-mono-num">{lead.numero_decisor || '—'}</span></div>
              </div>
            </section>

            {(lead.responsavel || lead.descricao) && (
              <section>
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gestão</h3>
                {lead.responsavel && <p className="text-sm text-foreground"><span className="text-muted-foreground">Responsável:</span> {lead.responsavel}</p>}
                {lead.descricao && <p className="text-sm mt-1 text-foreground"><span className="text-muted-foreground">Descrição:</span> {lead.descricao}</p>}
              </section>
            )}
          </div>

          <div className="space-y-4">
            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2"><MessageCircle className="w-3 h-3 inline mr-1" />Grupo WhatsApp</h3>
              <Input placeholder="https://chat.whatsapp.com/..." value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} className="bg-background border-input focus:border-gold-500 focus:ring-gold-500" />
              {whatsapp && <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="text-xs text-gold-500 hover:underline mt-1 inline-block">Abrir grupo</a>}
            </section>

            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Agendar Reuniões</h3>
              <Calendar mode="single" selected={undefined} onSelect={handleDateSelect} modifiers={{ booked: selectedDates }} modifiersClassNames={{ booked: 'bg-gold-500 text-black rounded-md' }} className={cn("p-3 pointer-events-auto border border-border rounded-md")} />
              {selectedDates.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-xs text-muted-foreground font-medium">Reuniões agendadas:</p>
                  {selectedDates.sort((a, b) => a.getTime() - b.getTime()).map((d, i) => (
                    <div key={i} className="flex items-center justify-between text-xs bg-accent rounded px-2 py-1 border border-border">
                      <span className="font-mono-num text-foreground">{d.toLocaleDateString('pt-BR')}</span>
                      <a href={generateGCalUrl(d)} target="_blank" rel="noopener noreferrer" className="text-gold-500 hover:underline">Google Calendar</a>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Button onClick={handleSave} className="w-full bg-gold-500 text-black hover:bg-gold-600">Salvar Alterações</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
