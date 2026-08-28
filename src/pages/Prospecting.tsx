import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { StructuredResult } from '@/lib/opencode-api';
import { searchLeadsLocal, isLocalServerRunning } from '@/lib/opencode-api';
import { searchBusinesses } from '@/lib/firecrawl-api';
import { detectAds } from '@/lib/detect-ads';
import { enrichPhones } from '@/lib/enrich-phone';
import { insertLead } from '@/lib/leads-store';
import { Lead } from '@/lib/types';
import { Search, Plus, Loader2, Globe, ExternalLink, AlertTriangle, CheckCircle, Zap, Wifi, WifiOff } from 'lucide-react';
import { adLibraryUrl, adLibraryQueryTerm } from '@/lib/ad-library';
import { inferUf } from '@/lib/uf';
import { toast } from 'sonner';
import { isLocal } from '@/lib/env-check';

export default function Prospecting() {
  const [niche, setNiche] = useState('');
  const [city, setCity] = useState('');
  const [results, setResults] = useState<StructuredResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingIndex, setAddingIndex] = useState<number | null>(null);
  const [responsavel, setResponsavel] = useState('');
  const [localMode, setLocalMode] = useState(false);

  useEffect(() => {
    isLocalServerRunning().then(running => setLocalMode(running));
  }, []);

  const enrichResults = async (list: StructuredResult[]): Promise<StructuredResult[]> => {
    const items = list.map((r) => ({ name: r.name, website: r.website, phone: r.phone }));
    const [adsMap, phones] = await Promise.all([
      detectAds(list.map((r) => ({ businessName: r.name, website: r.website }))),
      enrichPhones(items),
    ]);
    return list.map((r) => {
      const key = r.website || r.name;
      const newPhone = phones.map[key];
      return {
        ...r,
        has_ads: adsMap[key] ?? r.has_ads,
        phone: newPhone && newPhone !== r.phone ? newPhone : r.phone,
      };
    });
  };

  const handleSearch = async () => {
    if (!niche.trim() || !city.trim()) {
      toast.error('Preencha o nicho e a cidade.');
      return;
    }
    setLoading(true);
    setResults([]);
    try {
      if (localMode) {
        const res = await searchLeadsLocal(niche, city);
        if (res.success && res.data && res.data.length > 0) {
          setResults(await enrichResults(res.data));
          toast.success(`${res.data.length} resultados encontrados!`);
        } else {
          toast.error(res.error || 'Nenhum resultado encontrado.');
        }
      } else {
        const res = await searchBusinesses(niche, city);
        if (res.success && res.data && res.data.length > 0) {
          setResults(await enrichResults(res.data));
          if (res.message) {
            toast.warning(res.message);
          } else {
            toast.success(`${res.data.length} resultados encontrados!`);
          }
        } else if (res.success) {
          toast.info(res.message || 'Nenhum resultado retornado. Tente outro nicho ou cidade.');
        } else {
          toast.error(res.error || 'Não foi possível concluir a busca.');
        }
      }
    } catch (err: any) {
      if (err?.name === 'TimeoutError' || err?.name === 'AbortError') {
        toast.error('A busca está demorando mais que o esperado. Tente novamente.');
      } else {
        toast.error(err?.message || 'Erro ao buscar leads. Tente novamente em instantes.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddLead = async (result: StructuredResult) => {
    if (!responsavel.trim()) {
      toast.error('Informe o nome do responsável.');
      return;
    }

    const toStr = (v: any) => v != null ? String(v) : '';

    const leadCity = toStr(result.city) || city;
    const leadState = toStr(result.state) || inferUf(leadCity) || inferUf(city);

    const lead: Omit<Lead, 'id'> = {
      name: toStr(result.name) || 'Sem nome', title: toStr(result.title),
      category: toStr(result.category) || niche, address: toStr(result.address),
      city: leadCity, state: leadState,
      phone: toStr(result.phone), website: toStr(result.website),
      google_maps_url: toStr(result.google_maps_url), rating: toStr(result.rating),
      reviews_count: toStr(result.reviews_count), instagram: toStr(result.instagram),
      responsavel: responsavel, descricao: '', status: 'none',
      whatsapp_group: '', meeting_dates: [], nome_decisor: '', numero_decisor: '',
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
        <Card className="mb-6 border border-border shadow-sm bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2 text-foreground">
              {localMode ? (
                <Zap className="w-5 h-5 text-gold-500" />
              ) : (
                <Search className="w-5 h-5 text-muted-foreground" />
              )}
              Prospectar Novos Leads
              {localMode ? (
                <span className="ml-auto flex items-center gap-1 text-xs font-mono text-gold-500 bg-gold-500/10 border border-gold-500/30 px-2 py-0.5 rounded-full">
                  <Zap className="w-3 h-3" /> IA Local
                </span>
              ) : (
                <span className="ml-auto flex items-center gap-1 text-xs font-mono text-muted-foreground bg-accent border border-border px-2 py-0.5 rounded-full">
                  <Wifi className="w-3 h-3" /> Modo Online
                </span>
              )}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Mostra apenas estabelecimentos <strong>sem site</strong> ou <strong>sem anúncios/campanhas ativas</strong> &mdash; oportunidades reais de venda.
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input className="h-12 text-sm rounded-xl flex-1 bg-background border-input focus:border-gold-500 focus:ring-gold-500" placeholder="Nicho (ex: Clínica Odontológica, Restaurante...)" value={niche} onChange={(e) => setNiche(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              <Input className="h-12 text-sm rounded-xl flex-1 bg-background border-input focus:border-gold-500 focus:ring-gold-500" placeholder="Cidade (ex: São Paulo, Curitiba...)" value={city} onChange={(e) => setCity(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
              <Button className="h-12 rounded-xl px-8 text-sm font-semibold min-w-[140px] bg-gold-500 text-black hover:bg-gold-600" onClick={handleSearch} disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (<><Search className="w-4 h-4 mr-2" />Buscar</>)}
              </Button>
            </div>
          </CardContent>
        </Card>

        {loading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-gold-500" />
            <p className="text-sm text-muted-foreground">
              {localMode
                ? 'Pesquisando leads com IA via OpenCode...'
                : 'Buscando e filtrando estabelecimentos sem presença digital...'}
            </p>
            <p className="text-xs text-muted-foreground/60">Isso pode levar até 2 minutos</p>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium">
              {results.length} oportunidades para <span className="text-foreground font-semibold">"{niche}"</span> em <span className="text-foreground font-semibold">{city}</span>
            </p>

            <Card className="border border-border shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-accent/50">
                      <TableHead className="w-10"></TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Nome</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Nicho</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Cidade</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">UF</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Telefone</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Site</TableHead>
                      <TableHead className="text-muted-foreground font-semibold">Verificar Anúncios</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, i) => (
                      <TableRow key={i} className="hover:bg-accent/40 border-border">
                        <TableCell>
                          <Button size="sm" className="h-8 w-8 p-0 rounded-lg bg-gold-500 text-black hover:bg-gold-600" onClick={() => { setAddingIndex(i); setResponsavel(''); }} title="Adicionar aos leads">
                            <Plus className="w-4 h-4" />
                          </Button>
                        </TableCell>
                        <TableCell className="font-medium text-sm max-w-[200px] truncate text-foreground">{result.name || '\u2014'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{niche || result.category || '\u2014'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{result.city || '\u2014'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{result.state || '\u2014'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{result.phone || '\u2014'}</TableCell>
                        <TableCell>
                          {result.has_website ? (
                            <Badge variant="outline" className="text-xs gap-1 border-border"><CheckCircle className="w-3 h-3 text-green-500" />Sim</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-xs gap-1"><AlertTriangle className="w-3 h-3" />Sem site</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <a
                            href={adLibraryUrl(adLibraryQueryTerm(result.instagram, result.name))}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-gold-500 text-xs hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Ver na Ad Library
                          </a>
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
            <p className="text-lg font-medium text-foreground">Busque novos leads</p>
            <p className="text-sm mt-1">Digite o nicho e a cidade para encontrar oportunidades.</p>
          </div>
        )}
      </main>

      <Dialog open={addingIndex !== null} onOpenChange={(o) => !o && setAddingIndex(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg text-foreground">Adicionar aos Leads</DialogTitle>
          </DialogHeader>
          {addingIndex !== null && results[addingIndex] && (
            <div className="space-y-4">
              <div className="bg-accent rounded-xl p-3 space-y-1 border border-border">
                <p className="font-semibold text-sm truncate text-foreground">{results[addingIndex].name}</p>
                <p className="text-xs text-muted-foreground">{niche || results[addingIndex].category} &bull; {results[addingIndex].city}/{results[addingIndex].state}</p>
                {results[addingIndex].phone && <p className="text-xs text-muted-foreground">{'\uD83D\uDCDE'} {results[addingIndex].phone}</p>}
                <div className="flex gap-2 mt-1">
                  {!results[addingIndex].has_website && <Badge variant="destructive" className="text-[10px]">Sem site</Badge>}
                  <a
                    href={adLibraryUrl(adLibraryQueryTerm(results[addingIndex].instagram, results[addingIndex].name))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-gold-500 text-[10px] hover:underline"
                  >
                    <ExternalLink className="w-3 h-3" /> Ver na Ad Library
                  </a>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Responsável *</label>
                <Input className="h-12 text-sm rounded-xl mt-1.5 bg-background border-input focus:border-gold-500 focus:ring-gold-500" placeholder="Nome do responsável por este lead" value={responsavel} onChange={(e) => setResponsavel(e.target.value)} autoFocus />
              </div>
              <Button className="w-full h-12 rounded-xl text-sm font-semibold bg-gold-500 text-black hover:bg-gold-600" onClick={() => handleAddLead(results[addingIndex])}>
                <Plus className="w-4 h-4 mr-2" />Adicionar Lead
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
