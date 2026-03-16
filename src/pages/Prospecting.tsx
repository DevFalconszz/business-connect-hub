import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { searchBusinesses, StructuredResult } from '@/lib/firecrawl-api';
import { insertLead } from '@/lib/leads-store';
import { Lead } from '@/lib/types';
import { Search, Plus, Loader2, Globe, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

export default function Prospecting() {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<StructuredResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [responsavel, setResponsavel] = useState('');

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

  const handleAddLead = async (result: StructuredResult) => {
    if (!responsavel.trim()) {
      toast.error('Informe o nome do responsável.');
      return;
    }

    const lead: Omit<Lead, 'id'> = {
      name: result.name || 'Sem nome',
      title: result.title || '',
      category: result.category || niche,
      address: result.address || '',
      city: result.city || city,
      state: result.state || '',
      phone: result.phone || '',
      website: result.website || '',
      google_maps_url: result.google_maps_url || '',
      rating: result.rating || '',
      reviews_count: result.reviews_count || '',
      instagram: result.instagram || '',
      responsavel: responsavel,
      descricao: '',
      status: 'none',
      whatsapp_group: '',
      meeting_dates: [],
    };

    const inserted = await insertLead(lead);
    if (inserted) {
      toast.success(`"${result.name}" adicionado aos leads!`);
      setAddingIndex(null);
      setResponsavel('');
    } else {
      toast.error('Erro ao adicionar lead.');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-[1400px] mx-auto px-4 py-6">
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
            <p className="text-sm text-muted-foreground">Buscando e analisando estabelecimentos com IA...</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              {results.length} resultados para <span className="text-foreground font-semibold">"{niche}"</span> em <span className="text-foreground font-semibold">{city}</span>
            </p>

            <Card className="border-none shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10"></TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>UF</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Avaliações</TableHead>
                      <TableHead>Site</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, i) => (
                      <TableRow key={i} className="hover:bg-muted/50">
                        <TableCell>
                          <Button
                            size="sm"
                            className="h-8 w-8 p-0 rounded-lg"
                            onClick={() => { setAddingIndex(i); setResponsavel(''); }}
                            title="Adicionar aos leads"
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate">
                          {result.name || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.category || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.city || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.state || '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.phone || '—'}
                        </TableCell>
                        <TableCell className="text-sm">
                          {result.rating ? (
                            <span className="text-yellow-600 font-medium">⭐ {result.rating}</span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {result.reviews_count || '—'}
                        </TableCell>
                        <TableCell>
                          {result.website ? (
                            <a
                              href={result.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                            >
                              <Globe className="w-3 h-3" />
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
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
              <div className="bg-muted rounded-xl p-3 space-y-1">
                <p className="font-semibold text-sm truncate">{results[addingIndex].name}</p>
                <p className="text-xs text-muted-foreground">{results[addingIndex].category} • {results[addingIndex].city}/{results[addingIndex].state}</p>
                {results[addingIndex].phone && (
                  <p className="text-xs text-muted-foreground">📞 {results[addingIndex].phone}</p>
                )}
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
