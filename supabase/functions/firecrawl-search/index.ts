/**
 * Business Connect Hub - Firecrawl Search
 *
 * Fluxo:
 * 1. Busca estabelecimentos no Firecrawl (v2, com fallback para v1)
 * 2. Extrai dados estruturados com Lovable AI (Gemini) — com fallback por regex
 * 3. Verificações reais e RÁPIDAS: site existe? tem pixels/ads? Meta Ad Library?
 * 4. Retorna oportunidades (sem site OU sem anúncios). Nunca devolve vazio se
 *    houver resultados — devolve tudo com as flags para o usuário decidir.
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

interface StructuredResult {
  name: string;
  title: string;
  category: string;
  city: string;
  state: string;
  phone: string;
  website: string;
  rating: string;
  reviews_count: string;
  address: string;
  instagram: string;
  google_maps_url: string;
  has_website: boolean;
  has_ads: boolean;
}

// ============================================================
// TELEFONE — normalização e validação (Brasil)
// ============================================================

const VALID_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41, 42, 43,
  44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71, 73, 74, 75, 77,
  79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98, 99,
]);

function normalizePhone(raw: string): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('55') && digits.length > 11) digits = digits.slice(2);
  if (digits.length !== 10 && digits.length !== 11) return '';
  const ddd = Number(digits.slice(0, 2));
  if (!VALID_DDD.has(ddd)) return '';
  const rest = digits.slice(2);
  if (rest.length === 9 && rest[0] !== '9') return '';
  if (/^(\d)\1+$/.test(rest)) return '';
  return `(${digits.slice(0, 2)}) ${rest.slice(0, rest.length - 4)}-${rest.slice(-4)}`;
}

function extractPhoneFromText(text: string): string {
  if (!text) return '';
  const matches = text.match(/(?:\+?55\s?)?\(?\d{2}\)?[\s.-]?9?\d{4}[\s.-]?\d{4}/g) || [];
  for (const m of matches) {
    const normalized = normalizePhone(m);
    if (normalized) return normalized;
  }
  return '';
}

// ============================================================
// VERIFICAÇÕES REAIS (com timeouts curtos)
// ============================================================

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
];

async function fetchHtml(url: string, ms: number): Promise<{ ok: boolean; html: string }> {
  const target = url.startsWith('http') ? url : `https://${url}`;
  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(ms) });
    if (!res.ok) {
      // consome corpo para liberar a conexão
      await res.text().catch(() => '');
      return { ok: false, html: '' };
    }
    const html = await res.text();
    return { ok: true, html: html.slice(0, 400_000) };
  } catch {
    return { ok: false, html: '' };
  }
}

function isRealOwnWebsite(url: string): boolean {
  if (!url) return false;
  let host = '';
  try {
    host = new URL(url.startsWith('http') ? url : `https://${url}`).hostname.replace(/^www\./, '');
  } catch {
    return false;
  }
  const aggregators = [
    'facebook.com', 'instagram.com', 'google.com', 'goo.gl', 'maps.app.goo.gl', 'linkedin.com',
    'ifood.com.br', 'tripadvisor.com', 'tripadvisor.com.br', 'yelp.com', 'wellhub.com',
    'gympass.com', 'apontador.com.br', 'telelistas.net', 'guiamais.com.br', 'solutudo.com.br',
    'encontra.com.br', 'youtube.com', 'twitter.com', 'x.com', 'tiktok.com', 'wa.me',
    'linktr.ee', 'booking.com', 'reclameaqui.com.br', 'econodata.com.br', 'cnpj.biz',
  ];
  return !aggregators.some((a) => host === a || host.endsWith(`.${a}`));
}

async function checkMetaAds(businessName: string): Promise<boolean> {
  const accessToken = Deno.env.get('META_ACCESS_TOKEN');
  if (!accessToken || !businessName) return false;
  try {
    const params = new URLSearchParams({
      search_terms: businessName,
      search_type: 'KEYWORD_UNORDERED',
      ad_reached_countries: JSON.stringify(['BR']),
      fields: 'id',
      limit: '3',
      access_token: accessToken,
    });
    const res = await fetch(`https://graph.facebook.com/v19.0/ads_archive?${params}`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return false;
    const data = await res.json();
    return (data.data || []).length > 0;
  } catch {
    return false;
  }
}

// ============================================================
// FIRECRAWL
// ============================================================

async function firecrawlSearch(apiKey: string, body: Record<string, unknown>) {
  const call = (version: 'v2' | 'v1') =>
    fetch(`https://api.firecrawl.dev/${version}/search`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(60_000),
    });

  let res = await call('v2');
  if (res.status === 404 || res.status === 400) {
    const fallbackText = await res.text().catch(() => '');
    console.log(`v2 falhou (${res.status}): ${fallbackText.slice(0, 200)} — tentando v1`);
    res = await call('v1');
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// ============================================================
// EXTRAÇÃO COM IA
// ============================================================

function parseJsonLoose(text: string): unknown {
  const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('[');
    const end = cleaned.lastIndexOf(']');
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function aiExtract(
  rawResults: Array<Record<string, unknown>>,
  niche: string,
  city: string,
): Promise<StructuredResult[] | null> {
  const lovableKey = Deno.env.get('LOVABLE_API_KEY');
  if (!lovableKey) return null;

  const context = rawResults
    .slice(0, 15)
    .map((r, i) => {
      const md = String(r.markdown || '').slice(0, 2500);
      return `### RESULTADO ${i + 1}\nURL: ${r.url || ''}\nTÍTULO: ${r.title || ''}\nDESCRIÇÃO: ${r.description || ''}\nCONTEÚDO:\n${md}`;
    })
    .join('\n\n');

  const prompt = `Você extrai dados de estabelecimentos brasileiros para um CRM.

Nicho buscado: ${niche || 'não informado'}
Cidade buscada: ${city || 'não informada'}

Analise os resultados abaixo e retorne um ARRAY JSON puro (sem markdown, sem explicação) com um objeto por estabelecimento REAL identificado. Ignore páginas que são listas genéricas, blogs ou diretórios sem um estabelecimento específico.

Campos obrigatórios de cada objeto:
{"name":"","title":"","category":"","city":"","state":"","phone":"","website":"","rating":"","reviews_count":"","address":"","instagram":"","google_maps_url":"","has_website":false,"has_ads":false}

REGRAS:
- phone: copie APENAS números que aparecem LITERALMENTE no conteúdo. Nunca invente, complete ou adivinhe dígitos. Se não houver, deixe "".
- website: apenas o site PRÓPRIO do estabelecimento. Redes sociais, iFood, diretórios e agregadores NÃO contam como site (deixe "" nesse caso).
- has_website: true só se tiver site próprio.
- has_ads: true só se houver evidência textual de anúncios/campanhas pagas.
- state: sigla de 2 letras (ex: SP).
- Não duplique estabelecimentos (mesmo nome = um registro).

RESULTADOS:
${context}`;

  try {
    const res = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${lovableKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      }),
      signal: AbortSignal.timeout(60_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`IA falhou [${res.status}]: ${body.slice(0, 300)}`);
      return null;
    }

    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content || '';
    const parsed = parseJsonLoose(content);
    if (!Array.isArray(parsed)) {
      console.error('IA retornou formato inesperado');
      return null;
    }
    return parsed as StructuredResult[];
  } catch (e) {
    console.error('Erro na IA:', e instanceof Error ? e.message : e);
    return null;
  }
}

function regexExtract(
  rawResults: Array<Record<string, unknown>>,
  niche: string,
  city: string,
  state: string,
): StructuredResult[] {
  return rawResults.map((r) => {
    const url = String(r.url || '');
    const title = String(r.title || '');
    const description = String(r.description || '');
    const markdown = String(r.markdown || '');
    const instagram = (markdown.match(/instagram\.com\/[\w.]+/i) || [''])[0];
    return {
      name: title.split('|')[0].split(' - ')[0].trim() || description.slice(0, 50),
      title: description.slice(0, 100),
      category: niche,
      city,
      state,
      phone: extractPhoneFromText(`${markdown}\n${description}`),
      website: url,
      rating: '',
      reviews_count: '',
      address: '',
      instagram,
      google_maps_url: '',
      has_website: false,
      has_ads: false,
    };
  });
}

// ============================================================
// HANDLER
// ============================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, options } = await req.json().catch(() => ({ query: '', options: {} }));

    if (!query || typeof query !== 'string') {
      return json({ success: false, error: 'Informe o nicho e a cidade para buscar.' }, 400);
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return json({ success: false, error: 'Conector de busca não configurado.' }, 500);
    }

    const niche = String(options?.niche || '');
    const city = String(options?.city || '');
    const state = String(options?.state || '');
    const limit = Math.min(Number(options?.limit) || 15, 20);

    console.log(`🔍 Buscando: ${query}`);

    const search = await firecrawlSearch(apiKey, {
      query,
      limit,
      lang: options?.lang || 'pt-BR',
      country: options?.country || 'BR',
      scrapeOptions: { formats: ['markdown'], onlyMainContent: true },
    });

    if (!search.ok) {
      const detail =
        (search.data as { error?: string })?.error || `status ${search.status}`;
      console.error('❌ Firecrawl:', detail);
      return json(
        { success: false, error: `Busca indisponível no momento (${detail}).` },
        search.status >= 400 && search.status < 600 ? search.status : 502,
      );
    }

    const payload = search.data as { data?: unknown; web?: unknown };
    const rawResults = (Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.web)
        ? payload.web
        : []) as Array<Record<string, unknown>>;

    if (rawResults.length === 0) {
      return json({ success: true, data: [], message: 'Nenhum estabelecimento encontrado para esse nicho e cidade.' });
    }

    console.log(`📊 ${rawResults.length} resultados brutos`);

    // 2. Extração
    let leads = (await aiExtract(rawResults, niche, city)) ?? [];
    if (leads.length === 0) {
      console.log('⚙️ Usando extração por regex (fallback)');
      leads = regexExtract(rawResults, niche, city, state);
    }

    // Normalização + dedupe
    const seen = new Set<string>();
    leads = leads
      .map((l) => {
        const website = String(l?.website || '').trim();
        return {
          name: String(l?.name || '').trim(),
          title: String(l?.title || '').trim(),
          category: String(l?.category || niche).trim(),
          city: String(l?.city || city).trim(),
          state: String(l?.state || state).trim().toUpperCase().slice(0, 2),
          phone: normalizePhone(String(l?.phone || '')),
          website: isRealOwnWebsite(website) ? website : '',
          rating: String(l?.rating ?? ''),
          reviews_count: String(l?.reviews_count ?? ''),
          address: String(l?.address || '').trim(),
          instagram: String(l?.instagram || '').trim(),
          google_maps_url: String(l?.google_maps_url || '').trim(),
          has_website: false,
          has_ads: Boolean(l?.has_ads),
        } as StructuredResult;
      })
      .filter((l) => {
        if (!l.name) return false;
        const key = l.name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, 15);

    // 3. Verificações reais — paralelas e com timeouts curtos
    console.log('🔬 Verificando site e anúncios...');
    const verified = await Promise.all(
      leads.map(async (lead) => {
        const out = { ...lead };
        try {
          if (lead.website) {
            const { ok, html } = await fetchHtml(lead.website, 6000);
            out.has_website = ok;
            if (ok && html) {
              out.has_ads = out.has_ads || AD_PATTERNS.some((p) => p.test(html));
            }
          }
          if (!out.has_ads) {
            out.has_ads = await checkMetaAds(lead.name);
          }
        } catch (e) {
          console.log(`⚠️ Verificação falhou para ${lead.name}: ${e instanceof Error ? e.message : e}`);
        }
        return out;
      }),
    );

    // 4. Oportunidades: sem site OU sem anúncios
    const opportunities = verified.filter((l) => !l.has_website || !l.has_ads);
    console.log(`✅ ${opportunities.length} oportunidades de ${verified.length} verificados`);

    const finalData = opportunities.length > 0 ? opportunities : verified;

    return json({
      success: true,
      data: finalData.slice(0, 15),
      message:
        opportunities.length > 0
          ? undefined
          : 'Nenhum estabelecimento sem site/anúncios encontrado — exibindo todos os resultados.',
    });
  } catch (error) {
    console.error('❌ Erro:', error);
    const message = error instanceof Error ? error.message : 'Falha na busca';
    return json({ success: false, error: `Erro na prospecção: ${message}` }, 500);
  }
});
