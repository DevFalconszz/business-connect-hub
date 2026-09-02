import { useState, useEffect, useMemo, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lead } from '@/lib/types';
import { loadLeads, insertLead, updateLead, deleteLead } from '@/lib/leads-store';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadCard } from '@/components/LeadCard';
import { LeadModal } from '@/components/LeadModal';
import { AddLeadModal } from '@/components/AddLeadModal';
import { Plus, Search, LayoutGrid, Table2, Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { detectEnv } from '@/lib/env-check';

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const isMobile = useIsMobile();

  useEffect(() => { if (isMobile) setViewMode('cards'); }, [isMobile]);

  useEffect(() => {
    detectEnv().then(() => {
      loadLeads().then(data => { setLeads(data); setLoading(false); });
    });
  }, []);

  const handleUpdateLead = useCallback(async (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
    await updateLead(updated);
  }, []);

  const handleDeleteLead = useCallback(async (id: string) => {
    const ok = await deleteLead(id);
    if (ok) {
      setLeads(prev => prev.filter(l => l.id !== id));
      toast.success('Lead excluído!');
    } else {
      toast.error('Erro ao excluir lead.');
    }
  }, []);

  const handleAddLead = async (lead: Lead) => {
    const { id, ...rest } = lead;
    const inserted = await insertLead(rest);
    if (inserted) {
      setLeads(prev => [inserted, ...prev]);
      toast.success('Lead adicionado!');
    } else {
      toast.error('Erro ao adicionar lead.');
    }
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(l =>
      l.name.toLowerCase().includes(q) || l.category.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) || l.responsavel.toLowerCase().includes(q) ||
      l.nome_decisor.toLowerCase().includes(q)
    );
  }, [leads, search]);

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/80">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input className="pl-10 h-11 text-sm rounded-xl bg-background border-input focus:border-gold-500 focus:ring-gold-500" placeholder="Buscar por nome, cidade, decisor, responsável..." value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button variant={viewMode === 'cards' ? 'default' : 'outline'} size="sm" className={`h-11 w-11 p-0 rounded-xl ${viewMode === 'cards' ? 'bg-gold-500 hover:bg-gold-600 text-black' : ''}`} onClick={() => setViewMode('cards')}><LayoutGrid className="w-4 h-4" /></Button>
              <Button variant={viewMode === 'table' ? 'default' : 'outline'} size="sm" className={`h-11 w-11 p-0 rounded-xl ${viewMode === 'table' ? 'bg-gold-500 hover:bg-gold-600 text-black' : ''}`} onClick={() => setViewMode('table')}><Table2 className="w-4 h-4" /></Button>
            </div>
            <Button className="h-11 rounded-xl px-4 text-sm bg-gold-500 text-black hover:bg-gold-600" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" /><span className="hidden sm:inline">Adicionar</span><span className="sm:hidden">Novo</span>
            </Button>
            <span className="text-xs font-medium text-muted-foreground bg-accent px-2.5 py-1 rounded-full">{leads.length} leads</span>
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 py-4">
        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold-500" /></div>
        ) : viewMode === 'table' ? (
          <LeadsTable leads={filtered} onOpenLead={setSelectedLead} onUpdateLead={handleUpdateLead} onDeleteLead={handleDeleteLead} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(lead => (
              <LeadCard key={lead.id} lead={lead} onOpenLead={setSelectedLead} onUpdateLead={handleUpdateLead} onDeleteLead={handleDeleteLead} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <p className="text-lg font-medium text-foreground">Nenhum lead encontrado</p>
                <p className="text-sm mt-1">Adicione novos leads pela tela de Prospecção.</p>
              </div>
            )}
          </div>
        )}
      </main>

      <LeadModal lead={selectedLead} open={!!selectedLead} onClose={() => setSelectedLead(null)} onUpdate={handleUpdateLead} />
      <AddLeadModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAddLead} />
    </div>
  );
};

export default Index;
