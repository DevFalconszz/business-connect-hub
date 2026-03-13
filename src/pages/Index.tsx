import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lead } from '@/lib/types';
import { parseCSV } from '@/lib/csv-parser';
import { loadLeads, saveLeads } from '@/lib/leads-store';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadCard } from '@/components/LeadCard';
import { LeadModal } from '@/components/LeadModal';
import { AddLeadModal } from '@/components/AddLeadModal';
import { Upload, Plus, Search, LayoutGrid, Table2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const fileRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  // Auto-switch to cards on mobile
  useEffect(() => {
    if (isMobile) setViewMode('cards');
  }, [isMobile]);

  // Load from localStorage or default CSV
  useEffect(() => {
    const stored = loadLeads();
    if (stored.length > 0) {
      setLeads(stored);
      setLoaded(true);
    } else {
      fetch('/data/leads.csv')
        .then(r => r.text())
        .then(text => {
          const parsed = parseCSV(text);
          setLeads(parsed);
          saveLeads(parsed);
          setLoaded(true);
        })
        .catch(() => setLoaded(true));
    }
  }, []);

  // Save on change
  useEffect(() => {
    if (loaded) saveLeads(leads);
  }, [leads, loaded]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const parsed = parseCSV(text);
      setLeads(prev => [...prev, ...parsed]);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUpdateLead = (updated: Lead) => {
    setLeads(prev => prev.map(l => l.id === updated.id ? updated : l));
  };

  const handleAddLead = (lead: Lead) => {
    setLeads(prev => [lead, ...prev]);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return leads;
    const q = search.toLowerCase();
    return leads.filter(l =>
      l.name.toLowerCase().includes(q) ||
      l.category.toLowerCase().includes(q) ||
      l.city.toLowerCase().includes(q) ||
      l.responsavel.toLowerCase().includes(q)
    );
  }, [leads, search]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground mr-auto">
              📋 Gestão de Leads
            </h1>
            <span className="text-xs font-medium text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {leads.length} leads
            </span>
          </div>

          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                className="pl-10 h-11 text-sm rounded-xl"
                placeholder="Buscar por nome, cidade, responsável..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                className="h-11 w-11 p-0 rounded-xl"
                onClick={() => setViewMode('cards')}
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                className="h-11 w-11 p-0 rounded-xl"
                onClick={() => setViewMode('table')}
              >
                <Table2 className="w-4 h-4" />
              </Button>
            </div>

            <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
            <Button variant="outline" className="h-11 rounded-xl px-4 text-sm" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Upload</span>
              <span className="sm:hidden">CSV</span>
            </Button>
            <Button className="h-11 rounded-xl px-4 text-sm" onClick={() => setShowAdd(true)}>
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Adicionar</span>
              <span className="sm:hidden">Novo</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-[1600px] mx-auto px-4 py-4">
        {viewMode === 'table' ? (
          <LeadsTable leads={filtered} onOpenLead={setSelectedLead} onUpdateLead={handleUpdateLead} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(lead => (
              <LeadCard key={lead.id} lead={lead} onOpenLead={setSelectedLead} onUpdateLead={handleUpdateLead} />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-full text-center py-16 text-muted-foreground">
                <p className="text-lg font-medium">Nenhum lead encontrado</p>
                <p className="text-sm mt-1">Faça upload de uma planilha ou adicione manualmente.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <LeadModal
        lead={selectedLead}
        open={!!selectedLead}
        onClose={() => setSelectedLead(null)}
        onUpdate={handleUpdateLead}
      />
      <AddLeadModal open={showAdd} onClose={() => setShowAdd(false)} onAdd={handleAddLead} />
    </div>
  );
};

export default Index;
