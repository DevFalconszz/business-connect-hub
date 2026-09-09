import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Lead, LeadReport } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { MapPin, Phone, Globe, MessageCircle, Instagram, ExternalLink, User, PhoneCall, FileText, Plus, Trash2, Pencil } from 'lucide-react';
import { adLibraryUrl, adLibraryQueryTerm } from '@/lib/ad-library';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { loadLeadReports, addLeadReport, updateLeadReport, deleteLeadReport } from '@/lib/leads-store';
import { toast } from 'sonner';

interface Props {
  lead: Lead | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (lead: Lead) => void;
}

export function LeadModal({ lead, open, onClose, onUpdate }: Props) {
  const [whatsapp, setWhatsapp] = useState('');
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [descricao, setDescricao] = useState('');
  const [reports, setReports] = useState<LeadReport[]>([]);
  const [newReport, setNewReport] = useState('');
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [editingReport, setEditingReport] = useState<string | null>(null);
  const [editingContent, setEditingContent] = useState('');

  useEffect(() => {
    if (open && lead) {
      setWhatsapp(lead.whatsapp_group);
      setSelectedDates(lead.meeting_dates.map(d => new Date(d)));
      setDescricao(lead.descricao || '');
      setNewReport('');
      setExpandedReport(null);
      setEditingReport(null);
      loadLeadReports(lead.id).then(setReports);
    }
  }, [open, lead]);

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  if (!lead) return null;

  const handleSave = () => {
    onUpdate({
      ...lead,
      whatsapp_group: whatsapp,
      meeting_dates: selectedDates.map(d => d.toISOString()),
      descricao,
    });
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

  const handleAddReport = async () => {
    if (!newReport.trim()) return;
    const created = await addLeadReport(lead.id, newReport.trim());
    if (created) {
      setReports(prev => [created, ...prev]);
      setNewReport('');
      toast.success('Relatório adicionado.');
    } else {
      toast.error('Erro ao adicionar relatório.');
    }
  };

  const handleUpdateReport = async (id: string, content: string) => {
    if (!content.trim()) return;
    const ok = await updateLeadReport(id, content.trim());
    if (ok) {
      setReports(prev => prev.map(r => r.id === id ? { ...r, content: content.trim(), updated_at: new Date().toISOString() } : r));
      setEditingReport(null);
      toast.success('Relatório atualizado.');
    } else {
      toast.error('Erro ao atualizar relatório.');
    }
  };

  const handleDeleteReport = async (id: string) => {
    const ok = await deleteLeadReport(id);
    if (ok) {
      setReports(prev => prev.filter(r => r.id !== id));
      toast.success('Relatório removido.');
    } else {
      toast.error('Erro ao remover relatório.');
    }
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
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 w-auto min-w-0 px-3 py-1.5 bg-gold-500 text-black hover:bg-gold-600 font-medium"
                  asChild
                >
                  <a
                    href={adLibraryUrl(adLibraryQueryTerm(lead.instagram, lead.name))}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-3 h-3 mr-1.5" />
                    Ver na Ad Library
                  </a>
                </Button>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Decisor</h3>
              <div className="space-y-2 text-sm text-foreground">
                <div className="flex items-center gap-2"><User className="w-4 h-4 text-muted-foreground shrink-0" /><span>{lead.nome_decisor || '—'}</span></div>
                <div className="flex items-center gap-2"><PhoneCall className="w-4 h-4 text-muted-foreground shrink-0" /><span className="font-mono-num">{lead.numero_decisor || '—'}</span></div>
              </div>
            </section>

            <section>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Gestão</h3>
              <div className="space-y-2 text-sm text-foreground">
                <p><span className="text-muted-foreground">Responsável:</span> {lead.responsavel || '—'}</p>
                <div>
                  <span className="text-muted-foreground">Descrição:</span>
                  <Textarea
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    className="mt-1 bg-background border-input focus:border-gold-500 focus:ring-gold-500 min-h-[80px] text-sm"
                    placeholder="Descreva informações relevantes sobre este lead..."
                  />
                </div>
              </div>
            </section>
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

        <section className="mt-6 border-t border-border pt-4">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> Relatórios e Anotações
          </h3>

          <div className="space-y-2">
            {reports.length === 0 && (
              <p className="text-xs text-muted-foreground">Nenhum relatório/anotação registrado para este lead.</p>
            )}
            {reports.map(r => (
              <div key={r.id} className="border border-border rounded-xl bg-accent/40 p-3 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-muted-foreground">{new Date(r.created_at).toLocaleString('pt-BR')}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => { setEditingReport(r.id); setEditingContent(r.content); }}>
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-500" onClick={() => handleDeleteReport(r.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                {editingReport === r.id ? (
                  <div className="mt-2 space-y-2">
                    <Textarea value={editingContent} onChange={(e) => setEditingContent(e.target.value)} className="min-h-[60px] text-sm bg-background border-input" />
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gold-500 text-black hover:bg-gold-600" onClick={() => handleUpdateReport(r.id, editingContent)}>
                        Salvar
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditingReport(null)}>Cancelar</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={"mt-1 text-foreground whitespace-pre-wrap cursor-pointer" + (expandedReport === r.id ? '' : ' line-clamp-2')} onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}>
                      {r.content}
                    </p>
                    {r.content.length > 120 && (
                      <button className="text-gold-500 text-xs hover:underline mt-1" onClick={() => setExpandedReport(expandedReport === r.id ? null : r.id)}>
                        {expandedReport === r.id ? 'Ver menos' : 'Ver mais'}
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-2">
            <Textarea
              value={newReport}
              onChange={(e) => setNewReport(e.target.value)}
              placeholder="Escreva um novo relatório/anotação sobre este lead (ligações feitas, retornos, próximos passos...)"
              className="min-h-[70px] text-sm bg-background border-input focus:border-gold-500"
            />
            <Button className="bg-gold-500 text-black hover:bg-gold-600" onClick={handleAddReport} disabled={!newReport.trim()}>
              <Plus className="w-4 h-4 mr-1.5" /> Adicionar Relatório
            </Button>
          </div>
        </section>
      </DialogContent>
    </Dialog>
  );
}