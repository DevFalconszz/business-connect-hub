import { useState, useEffect, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lead } from '@/lib/types';
import { parseCSV } from '@/lib/csv-parser';
import { loadLeads, saveLeads } from '@/lib/leads-store';
import { LeadsTable } from '@/components/LeadsTable';
import { LeadModal } from '@/components/LeadModal';
import { AddLeadModal } from '@/components/AddLeadModal';
import { Upload, Plus, Search } from 'lucide-react';

const Index = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

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
      <header className="border-b bg-card sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <h1 className="text-lg font-semibold text-foreground mr-auto">
            Gestão de Leads
          </h1>

          <div className="relative w-64">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              className="pl-9 h-8 text-sm"
              placeholder="Buscar por nome, cidade..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleUpload} />
          <Button variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
            <Upload className="w-4 h-4 mr-1.5" />
            Upload Planilha
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            Adicionar
          </Button>

          <span className="text-xs text-muted-foreground">{leads.length} leads</span>
        </div>
      </header>

      {/* Table */}
      <main className="max-w-[1600px] mx-auto px-4 py-4">
        <LeadsTable leads={filtered} onOpenLead={setSelectedLead} onUpdateLead={handleUpdateLead} />
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
