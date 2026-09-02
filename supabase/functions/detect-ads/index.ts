/**
 * Business Connect Hub - detect-ads
 *
 * Verifica se um negócio possui anúncios/campanhas ativas, usando fontes:
 *  1. HTML tags (sem chave): procura padrões de Google Ads, Google Tag Manager,
 *     Meta Pixel, Microsoft/Bing Ads no código-fonte do site.
 *  2. Google Ads via SerpApi (engine=google): consulta se o negócio aparece em
 *     anúncios patrocinados no Google e retorna a quantidade de anúncios.
 *     Requer o secret `SERPAPI_KEY` (com fallback legado para compatibilidade).
 *  3. Meta Ad Library API (oficial, gratuita): consulta anúncios ativos por nome
 *     do negócio. Requer o secret `META_ACCESS_TOKEN` (um token de usuário com
 *     acesso à ferramenta de pesquisa da Ad Library).
 *
 * Se os tokens não estiverem configurados (ou estiverem inválidos), as
 * verificações correspondentes são puladas (retornam null) e o resultado se
 * baseia nas demais fontes disponíveis.
 */

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

const SERPAPI_KEY =
  Deno.env.get("SERPAPI_KEY") ||
  "ba2d21256ba26b49dc428d087c20aff77496c5548e40715fedf832da027ad103";

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

interface Item {
  businessName?: string;
  website?: string;
  city?: string;
  instagram?: string;
}

interface Verification {
  business_name: string;
  website: string | null;
  has_ads: boolean;
  google_ads_count: number;
  methods: {
    html_tags: boolean | null;
    google_ads_serpapi: boolean | null;
    meta_ad_library: boolean | null;
  };
  google_ads_error: string | null;
  meta_error: string | null;
  meta_search_term: string | null;
  instagram_found: string;
}

// Padrões que indicam presença de anúncios/tracking no HTML (mesmos do detector Python).
const AD_PATTERNS = [
  /googlesyndication\.com/i,
  /googleadservices\.com/i,
  /adsbygoogle/i,
  /gtag\(\s*['"]config['"]\s*,\s*['"]AW-/i,
  /AW-\d{9,}/,
  /connect\.facebook\.net/i,
  /fbq\(/,
  /bat\.bing\.com/i,
  /gclid/i,
  /googletagmanager\.com/i,
  /ca-pub-\d+/i,
  /data-ad-client/i,
];

const AGGREGATOR_HOSTS = [
  'facebook.com', 'instagram.com', 'google.com', 'goo.gl', 'maps.app.goo.gl',
  'linkedin.com', 'ifood.com.br', 'tripadvisor.com', 'tripadvisor.com.br',
  'yelp.com', 'wellhub.com', 'gympass.com', 'apontador.com.br', 'telelistas.net',
  'guiamais.com.br', 'solutudo.com.br', 'encontra.com.br', 'youtube.com',
  'twitter.com', 'x.com', 'tiktok.com', 'wa.me', 'linktr.ee', 'booking.com',
  'reclameaqui.com.br', 'econodata.com.br', 'cnpj.biz',
];

function isRealOwnWebsite(url: string | undefined): boolean {
  if (!url) return false;
  let host = '';
  try {
    host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
  return !AGGREGATOR_HOSTS.some((a) => host === a || host.endsWith(`.${a}`));
}

async function fetchHtml(url: string, ms: number): Promise<string> {
  const target = url.startsWith('http') ? url : `https://${url}`;
  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(ms) });
    if (!res.ok) {
      await res.text().catch(() => '');
      return '';
    }
    const html = await res.text();
    return html.slice(0, 400_000);
  } catch {
    return '';
  }
}

async function checkHtmlTags(website: string | undefined): Promise<boolean> {
  if (!isRealOwnWebsite(website)) return false;
  const html = await fetchHtml(website!, 7000);
  if (!html) return false;
  return AD_PATTERNS.some((p) => p.test(html));
}

// Extrai o handle do Instagram a partir do HTML do site do negócio.
// Prefere o handle "legível" (ex: padariabellapaulista) ao ID numérico da página
// (ex: 17841401967636565), que é apenas o ID interno.
function extractInstagramFromHtml(html: string): string {
  if (!html) return '';
  const handles = Array.from(
    html.matchAll(/instagram\.com\/(?:@)?([A-Za-z0-9_][A-Za-z0-9_.]{2,})/gi),
    (m) => m[1].replace(/[.\/?#].*$/, ''),
  );
  const readable = handles.find((h) => !/^\d+$/.test(h));
  return readable || '';
}

async function checkMetaAds(searchTerm: string): Promise<{ has_ads: boolean | null; error: string | null }> {
  const token = Deno.env.get('META_ACCESS_TOKEN');
  if (!token || !searchTerm) return { has_ads: null, error: !token ? 'META_ACCESS_TOKEN não configurado (pulado)' : null };
  try {
    const params = new URLSearchParams({
      search_terms: searchTerm,
      search_type: 'KEYWORD_UNORDERED',
      ad_reached_countries: JSON.stringify(['BR']),
      fields: 'id',
      limit: '3',
      access_token: token,
    });
    const res = await fetch(`https://graph.facebook.com/v19.0/ads_archive?${params}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        msg = body?.error?.message || msg;
      } catch { /* ignore */ }
      return { has_ads: null, error: `Erro Meta: ${msg}` };
    }
    const data = await res.json();
    return { has_ads: (data.data || []).length > 0, error: null };
  } catch (err: unknown) {
    return { has_ads: null, error: `Erro Meta: ${(err as Error)?.message || 'timeout'}` };
  }
}

async function checkGoogleAdsSerpApi(
  businessName: string,
  city?: string,
): Promise<{ count: number; found: boolean | null; error: string | null }> {
  if (!SERPAPI_KEY || !businessName) {
    return { count: 0, found: null, error: !SERPAPI_KEY ? 'SERPAPI_KEY não configurado (pulado)' : null };
  }
  try {
    const query = city?.trim()
      ? `${businessName} ${city.trim()}`
      : businessName;
    const params = new URLSearchParams({
      engine: 'google',
      q: query,
      hl: 'pt-br',
      gl: 'br',
      safe: 'off',
      api_key: SERPAPI_KEY,
    });
    const res = await fetch(`https://serpapi.com/search.json?${params}`, {
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const body = await res.json();
        msg = body?.error?.message || msg;
      } catch { /* ignore */ }
      return { count: 0, found: null, error: `Erro SerpApi: ${msg}` };
    }
    const data = await res.json();
    if (data?.error) {
      return { count: 0, found: null, error: `Erro SerpApi: ${data.error}` };
    }
    const ads = Array.isArray(data?.ads) ? data.ads : [];
    return { count: ads.length, found: ads.length > 0, error: null };
  } catch (err: unknown) {
    return { count: 0, found: null, error: `Erro SerpApi: ${(err as Error)?.message || 'timeout'}` };
  }
}

async function verifyOne(item: Item): Promise<Verification> {
  const name = (item.businessName || '').trim();
  const website = (item.website || '').trim() || null;
  const city = (item.city || '').trim() || undefined;

  // Instagram vindo do payload (ex: detectado pelo SerpAPI na prospecção).
  let instagram = (item.instagram || '').trim().replace(/^@/, '');

  // Se não veio Instagram, varre o site do negócio em busca do link do Instagram.
  const siteHtml = isRealOwnWebsite(website) ? await fetchHtml(website, 7000) : '';
  if (!instagram && siteHtml) {
    instagram = extractInstagramFromHtml(siteHtml);
  }

  // Prioridade do termo de busca na Meta Ad Library: Instagram > nome do negócio.
  const metaSearchTerm = instagram || name;
  const htmlHasAds = siteHtml ? AD_PATTERNS.some((p) => p.test(siteHtml)) : false;

  const [google, meta] = await Promise.all([
    checkGoogleAdsSerpApi(name, city),
    checkMetaAds(metaSearchTerm),
  ]);

  return {
    business_name: name,
    website,
    has_ads: Boolean(htmlHasAds || google.found || meta.has_ads),
    google_ads_count: google.count,
    methods: {
      html_tags: htmlHasAds,
      google_ads_serpapi: google.found,
      meta_ad_library: meta.has_ads,
    },
    google_ads_error: google.error,
    meta_error: meta.error,
    meta_search_term: metaSearchTerm,
    instagram_found: instagram,
  };
}

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    // Aceita um único item OU uma lista de itens (batch).
    const items: Item[] = Array.isArray(body?.items) ? body.items : [body];

    const results = await Promise.all(items.map((it) => verifyOne(it)));
    return json({ success: true, results });
  } catch (err: unknown) {
    console.error('detect-ads error:', err);
    return json({ success: false, error: (err as Error)?.message || 'Erro interno' }, 500);
  }
});
