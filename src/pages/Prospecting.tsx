import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { searchBusinesses, SearchResult } from '@/lib/firecrawl-api';
import { insertLead } from '@/lib/leads-store';
import { Lead } from '@/lib/types';
import { Search, Plus, Loader2, ExternalLink, Globe, BarChart3, Megaphone, Code, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Prospecting() {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [responsavel, setResponsavel] = useState('');
  const [statsIndex, setStatsIndex] = useState<number | null>(null);

  const handleSearch = async () => {
    if (!niche.trim() || !city.trim()) {
      toast.error('Preencha o nicho e a cidade.');
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      const res = await searchBusinesses(niche, city);
      if (res.success && res.data && res.data.length > 0) {
        setResults(res.data);
        toast.success(`${res.data.length} resultados encontrados!`);
      } else {
        toast.error(res.error || 'Nenhum resultado encontrado.');
      }
    } catch {
      toast.error('Erro ao buscar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (result: SearchResult) => {
    if (!responsavel.trim()) {
      toast.error('Informe o nome do responsável.');
      return;
    }

    const lead: Omit<Lead, 'id'> = {
      name: result.title || 'Sem nome',
      title: result.description || '',
      category: niche,
      address: '',
      city: city,
      state: '',
      phone: '',
      website: result.url || '',
      google_maps_url: '',
      rating: '',
      reviews_count: '',
      instagram: '',
      responsavel: responsavel,
      descricao: result.markdown?.substring(0, 300) || '',
      status: 'none',
      whatsapp_group: '',
      meeting_dates: [],
    };

    const inserted = await insertLead(lead);
    if (inserted) {
      toast.success(`"${result.title}" adicionado aos leads!`);
      setAddingIndex(null);
      setResponsavel('');
    } else {
      toast.error('Erro ao adicionar lead.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1200px] mx-auto px-4 py-6">
        {/* Search Section */}
        <Card className="mb-6 border-none shadow-md bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Prospectar Novos Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                className="h-12 text-sm rounded-xl flex-1"
                placeholder="Nicho (ex: Clínica Odontológica, Restaurante...)"
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Input
                className="h-12 text-sm rounded-xl flex-1"
                placeholder="Cidade (ex: São Paulo, Curitiba...)"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button
                className="h-12 rounded-xl px-8 text-sm font-semibold min-w-[140px]"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Buscar
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Buscando estabelecimentos...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              {results.length} resultados para <span className="text-foreground font-semibold">"{niche}"</span> em <span className="text-foreground font-semibold">{city}</span>
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {results.map((result, i) => (
                <Card key={i} className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-foreground text-sm truncate">
                          {result.title || 'Sem título'}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {result.description || 'Sem descrição disponível'}
                        </p>
                        {result.url && (
                          <a
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-2"
                          >
                            <Globe className="w-3 h-3" />
                            Visitar site
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>

                      <div className="flex flex-col gap-1.5 shrink-0">
                        <Button
                          size="sm"
                          className="h-10 w-10 p-0 rounded-xl"
                          onClick={() => { setAddingIndex(i); setResponsavel(''); }}
                          title="Adicionar aos leads"
                        >
                          <Plus className="w-5 h-5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-10 w-10 p-0 rounded-xl"
                          onClick={() => setStatsIndex(statsIndex === i ? null : i)}
                          title="Ver estatísticas e serviços"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stats Panel */}
                    {statsIndex === i && (
                      <div className="mt-3 pt-3 border-t space-y-3">
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                          Oportunidades de Serviços
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <ServiceCard
                            icon={<Megaphone className="w-5 h-5" />}
                            title="Marketing Digital"
                            items={['Google Ads', 'Meta Ads', 'SEO Local', 'Gestão de redes sociais']}
                          />
                          <ServiceCard
                            icon={<Code className="w-5 h-5" />}
                            title="Criação de Sites"
                            items={['Landing pages', 'Site institucional', 'E-commerce', 'Blog corporativo']}
                          />
                          <ServiceCard
                            icon={<Bot className="w-5 h-5" />}
                            title="Automações"
                            items={['Chatbot WhatsApp', 'Agendamento online', 'CRM automatizado', 'Email marketing']}
                          />
                        </div>

                        {result.markdown && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-primary font-medium flex items-center gap-1">
                              Ver conteúdo extraído
                            </summary>
                            <div className="mt-2 bg-muted rounded-lg p-3 max-h-40 overflow-y-auto whitespace-pre-wrap text-muted-foreground">
                              {result.markdown.substring(0, 1000)}
                            </div>
                          </details>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {!loading && results.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">Busque novos leads</p>
            <p className="text-sm mt-1">Digite o nicho e a cidade para encontrar estabelecimentos.</p>
          </div>
        )}
      </main>

      {/* Add Lead Dialog */}
      <Dialog open={addingIndex !== null} onOpenChange={(o) => !o && setAddingIndex(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">Adicionar aos Leads</DialogTitle>
          </DialogHeader>
          {addingIndex !== null && results[addingIndex] && (
            <div className="space-y-4">
              <div className="bg-muted rounded-xl p-3">
                <p className="font-semibold text-sm truncate">{results[addingIndex].title}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{results[addingIndex].url}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Responsável *</label>
                <Input
                  className="h-12 text-sm rounded-xl mt-1.5"
                  placeholder="Nome do responsável por este lead"
                  value={responsavel}
                  onChange={(e) => setResponsavel(e.target.value)}
                  autoFocus
                />
              </div>
              <Button
                className="w-full h-12 rounded-xl text-sm font-semibold"
                onClick={() => handleAddLead(results[addingIndex])}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Lead
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ServiceCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="bg-muted/50 rounded-xl p-3 space-y-2">
      <div className="flex items-center gap-2 text-primary">
        {icon}
        <span className="text-xs font-semibold">{title}</span>
      </div>
      <ul className="space-y-1">
        {items.map((item, i) => (
          <li key={i} className="text-xs text-muted-foreground flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-primary/50 shrink-0" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
