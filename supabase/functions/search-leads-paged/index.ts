/**
 * Business Connect Hub - search-leads-paged
 *
 * Busca estabelecimentos no Google Maps (SerpApi) com PAGINAÇÃO.
 * Usado pela tela de Prospectar para preencher a lista com resultados novos
 * (não duplicados) pagina por pagina, sem depender de API oficial da Meta.
 *
 * Body: { niche, city, page?, num? }
 *   - page: numero da pagina (1-based), default 1
 *   - num:  qtd maxima por pagina, default 20
 *
 * Retorna: { success, data: StructuredResult[], page, total }
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SERPAPI_KEY = Deno.env.get("SERPAPI_KEY") || "ba2d21256ba26b49dc428d087c20aff77496c5548e40715fedf832da027ad103";

const COORDS: Record<string, string> = {
  "sao paulo": "@-23.5505,-46.6333,12z",
  "rio de janeiro": "@-22.9068,-43.1729,12z",
  "belo horizonte": "@-19.9167,-43.9345,12z",
  "brasilia": "@-15.7939,-47.8828,12z",
  "salvador": "@-12.9714,-38.5014,12z",
  "fortaleza": "@-3.7319,-38.5267,12z",
  "curitiba": "@-25.4284,-49.2733,12z",
  "recife": "@-8.0476,-34.8770,12z",
  "porto alegre": "@-30.0346,-51.2177,12z",
  "manaus": "@-3.1190,-60.0217,12z",
};

const VALID_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

const AGGREGATOR_HOSTS = [
  'facebook.com', 'instagram.com', 'google.com', 'goo.gl', 'maps.app.goo.gl', 'linkedin.com',
  'ifood.com.br', 'tripadvisor.com', 'tripadvisor.com.br', 'yelp.com', 'wellhub.com',
  'gympass.com', 'apontador.com.br', 'telelistas.net', 'guiamais.com.br', 'solutudo.com.br',
  'encontra.com.br', 'youtube.com', 'twitter.com', 'x.com', 'tiktok.com', 'wa.me',
  'linktr.ee', 'booking.com', 'reclameaqui.com.br', 'econodata.com.br', 'cnpj.biz',
];

function json(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function normalizePhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '');
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return raw || '';
}

function isValidBrPhone(raw: string): boolean {
  let d = (raw || '').replace(/\D/g, '');
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2);
  return (d.length === 10 || d.length === 11) && VALID_DDD.has(Number(d.slice(0, 2)));
}

function isRealOwnWebsite(url: string): boolean {
  if (!url) return false;
  let host = '';
  try {
    host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
  return !AGGREGATOR_HOSTS.some((a) => host === a || host.endsWith(`.${a}`));
}

async function checkUrlExists(url: string, ms: number): Promise<boolean> {
  try {
    const res = await fetch(url.startsWith('http') ? url : `https://${url}`, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(ms),
    });
    return res.status < 400;
  } catch {
    return false;
  }
}

async function serpSearch(niche: string, city: string, start: number, num: number) {
  const ll = COORDS[city.trim().toLowerCase()] || '@-23.5505,-46.6333,12z';
  const params = new URLSearchParams({
    q: `${niche} ${city} Brazil`,
    engine: 'google_maps',
    type: 'search',
    ll,
    hl: 'pt-br',
    num: String(num),
    start: String(start),
    api_key: SERPAPI_KEY,
  });
  const res = await fetch(`https://serpapi.com/search.json?${params}`, {
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) throw new Error(`SerpApi HTTP ${res.status}`);
  return await res.json();
}

function mapPlace(p: Record<string, unknown>): Record<string, unknown> {
  const name = String(p.title || p.name || '').trim();
  const city = String(p.city || '').trim();
  const state = String(p.state || '').trim();
  const phoneRaw = String(p.phone || '');
  const phone = isValidBrPhone(phoneRaw) ? normalizePhone(phoneRaw) : '';
  const website = String(p.website || '').trim();
  const address = String(p.address || '').trim();
  const instagram = detectInstagram(name, website, p);
  const google_maps_url = String(p.link || p.google_maps_url || '').trim();
  const rating = String(p.rating ?? '');
  const reviews = String(p.reviews ?? p.reviews_count ?? '');
  return {
    name,
    title: name,
    category: '',
    city,
    state,
    phone,
    website,
    rating,
    reviews_count: reviews,
    address,
    instagram,
    google_maps_url,
    has_website: isRealOwnWebsite(website) && website.length > 0,
    has_ads: false,
  };
}

function detectInstagram(name: string, website: string, p: Record<string, unknown>): string {
  const adress = String(p.address || '');
  const maps = String(p.maps_url || p.link || '');
  const raw = String(p.extra || '').toLowerCase();
  const instaMatch = raw.match(/instagram\.com\/([^/"'\s?#]+)/);
  if (instaMatch) return `@${instaMatch[1]}`;
  return '';
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const niche = String(body?.niche || '').trim();
    const city = String(body?.city || '').trim();
    const page = Math.max(1, Number(body?.page) || 1);
    const num = Math.min(20, Math.max(5, Number(body?.num) || 20));

    if (!niche || !city) return json({ success: false, error: 'Niche e cidade são obrigatórios' }, 400);
    if (!SERPAPI_KEY) return json({ success: false, error: 'SERPAPI_KEY não configurada' }, 500);

    const start = (page - 1) * num;
    const data = await serpSearch(niche, city, start, num);
    const places: Array<Record<string, unknown>> = data.local_results || [];

    const results = places
      .filter((p) => {
        const n = String(p.title || p.name || '').trim();
        return n.length > 2; // remove vazios/lixos
      })
      .map(mapPlace);

    return json({
      success: true,
      data: results,
      page,
      num,
      total: results.length,
    });
  } catch (err) {
    console.error('search-leads-paged error:', (err as Error)?.message || err);
    return json({ success: false, error: (err as Error)?.message || 'Erro na busca' }, 500);
  }
});
