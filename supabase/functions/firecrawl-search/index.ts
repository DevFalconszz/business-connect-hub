/**
 * Business Connect Hub - Firecrawl Search (Real Verification)
 * 
 * Esta Edge Function busca estabelecimentos usando Firecrawl e faz
 * verificações REAIS em vez de depender de IA:
 * 
 * 1. Busca estabelecimentos via Firecrawl
 * 2. Para cada resultado:
 *    - Verifica se o site existe (HTTP HEAD/GET)
 *    - Analisa código-fonte para detectar Google Ads
 *    - Verifica Meta Ad Library (se configurado)
 * 3. Retorna apenas leads com oportunidade
 */

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

// ============================================================
// VERIFICADOR DE SITE - Verifica se o site existe via HTTP
// ============================================================

interface SiteCheckResult {
  exists: boolean;
  http_alive: boolean;
  status_code: number;
  domain: string;
}

async function checkWebsite(url: string): Promise<SiteCheckResult> {
  const empty: SiteCheckResult = {
    exists: false,
    http_alive: false,
    status_code: 0,
    domain: '',
  };

  if (!url || !url.trim()) return empty;

  // Extrai domínio
  let domain = '';
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    domain = urlObj.hostname;
  } catch {
    return empty;
  }

  // Tenta HTTP HEAD primeiro (mais rápido)
  try {
    const response = await fetch(url.startsWith('http') ? url : `https://${url}`, {
      method: 'HEAD',
      redirect: 'follow',
      signal: AbortSignal.timeout(5000),
    });

    return {
      exists: response.status < 400,
      http_alive: response.status < 400,
      status_code: response.status,
      domain,
    };
  } catch {
    // Se HEAD falhou, tenta GET
    try {
      const response = await fetch(url.startsWith('http') ? url : `https://${url}`, {
        redirect: 'follow',
        signal: AbortSignal.timeout(8000),
      });

      return {
        exists: response.status < 400,
        http_alive: response.status < 400,
        status_code: response.status,
        domain,
      };
    } catch {
      return empty;
    }
  }
}

// ============================================================
// DETECTOR DE ADS - Analisa código-fonte para Google Ads
// ============================================================

interface AdsDetectionResult {
  has_google_ads: boolean;
  has_google_tag_manager: boolean;
  has_google_analytics: boolean;
  has_meta_pixel: boolean;
  has_microsoft_ads: boolean;
  confidence: number;
}

// Padrões regex para detecção de ads
const ADS_PATTERNS = {
  google_ads: [
    /google[\._/]?ads/gi,
    /googlesyndication\.com/gi,
    /googleadservices\.com/gi,
    /pagead2\.googlesyndication/gi,
    /adsbygoogle/gi,
    /ca-pub-\d+/gi,
    /data-ad-client/gi,
    /data-ad-slot/gi,
  ],
  google_tag_manager: [
    /googletagmanager\.com/gi,
    /GTM-[A-Z0-9]+/g,
    /gtag\(/g,
  ],
  google_analytics: [
    /google-analytics\.com/gi,
    /analytics\.js/gi,
    /gtag\.js/gi,
    /UA-\d+-\d+/g,
    /G-[A-Z0-9]+/g,
  ],
  meta_pixel: [
    /facebook\.net\/en_US\/fbevents/gi,
    /fbq\(/g,
    /pixel\.facebook\.com/gi,
    /connect\.facebook\.net/gi,
  ],
  microsoft_ads: [
    /bat\.bing\.com/gi,
    /clarity\.ms/gi,
  ],
};

async function detectGoogleAds(url: string): Promise<AdsDetectionResult> {
  const empty: AdsDetectionResult = {
    has_google_ads: false,
    has_google_tag_manager: false,
    has_google_analytics: false,
    has_meta_pixel: false,
    has_microsoft_ads: false,
    confidence: 0,
  };

  if (!url) return empty;

  try {
    const response = await fetch(url.startsWith('http') ? url : `https://${url}`, {
      redirect: 'follow',
      signal: AbortSignal.timeout(10000),
    });

    if (response.status >= 400) return empty;

    const html = await response.text();

    // Verifica cada categoria de padrão
    const results: Record<string, boolean> = {};
    for (const [category, patterns] of Object.entries(ADS_PATTERNS)) {
      results[category] = patterns.some(pattern => pattern.test(html));
    }

    // Calcula confiança
    let confidence = 0;
    if (results.google_ads) confidence += 0.5;
    if (results.google_tag_manager) confidence += 0.2;
    if (results.google_analytics) confidence += 0.1;
    if (results.meta_pixel) confidence += 0.1;
    if (results.microsoft_ads) confidence += 0.1;

    return {
      has_google_ads: results.google_ads || false,
      has_google_tag_manager: results.google_tag_manager || false,
      has_google_analytics: results.google_analytics || false,
      has_meta_pixel: results.meta_pixel || false,
      has_microsoft_ads: results.microsoft_ads || false,
      confidence: Math.min(confidence, 1),
    };
  } catch {
    return empty;
  }
}

// ============================================================
// META AD LIBRARY - Verifica anúncios no Facebook/Instagram
// ============================================================

interface MetaAdResult {
  has_active_ads: boolean;
  ads_count: number;
}

async function checkMetaAds(businessName: string): Promise<MetaAdResult> {
  const accessToken = Deno.env.get('META_ACCESS_TOKEN');

  if (!accessToken) {
    return { has_active_ads: false, ads_count: 0 };
  }

  try {
    const params = new URLSearchParams({
      search_terms: businessName,
      search_type: 'KEYWORD_UNORDERED',
      ad_reached_countries: JSON.stringify(['BR']),
      fields: 'id',
      limit: '5',
      access_token: accessToken,
    });

    const response = await fetch(
      `https://graph.facebook.com/v19.0/ads_archive?${params}`,
      { signal: AbortSignal.timeout(10000) }
    );

    if (!response.ok) {
      return { has_active_ads: false, ads_count: 0 };
    }

    const data = await response.json();
    const ads = data.data || [];

    return {
      has_active_ads: ads.length > 0,
      ads_count: ads.length,
    };
  } catch {
    return { has_active_ads: false, ads_count: 0 };
  }
}

// ============================================================
// MAIN HANDLER
// ============================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, options } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Query is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl connector not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const niche = options?.niche || '';
    const city = options?.city || '';

    console.log(`🔍 Searching: ${query}`);

    // ============================================
    // 1. BUSCA NO FIRECRAWL
    // ============================================

    const response = await fetch('https://api.firecrawl.dev/v1/search', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        limit: options?.limit || 20,
        lang: options?.lang || 'pt-BR',
        country: options?.country || 'BR',
        scrapeOptions: { formats: ['markdown'] },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Firecrawl API error:', data);
      return new Response(
        JSON.stringify({ success: false, error: data.error || `Request failed with status ${response.status}` }),
        { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const results = data.data || [];
    if (results.length === 0) {
      return new Response(
        JSON.stringify({ success: true, data: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📊 Found ${results.length} results from Firecrawl`);

    // ============================================
    // 2. EXTRAI INFORMAÇÕES BÁSICAS DOS RESULTADOS
    // ============================================

    // Tenta extrair informações dos resultados do Firecrawl
    // sem depender de IA - usa regex e parsing simples
    const leads: any[] = [];

    for (const result of results) {
      const url = result.url || '';
      const title = result.title || '';
      const description = result.description || '';
      const markdown = result.markdown || '';

      // Extrai informações básicas usando regex do conteúdo
      const phoneMatch = markdown.match(/(?:\+\d{2}\s?)?\(?\d{2}\)?\s?\d{4,5}[\-\s]?\d{4}/);
      const emailMatch = markdown.match(/[\w.-]+@[\w.-]+\.\w+/);
      const instagramMatch = markdown.match(/@[\w.]+|instagram\.com\/[\w.]+/);

      // Monta o lead
      const lead = {
        name: title.split('|')[0].split('-')[0].trim() || description.substring(0, 50),
        title: description.substring(0, 100),
        category: niche,
        address: '',
        city: city,
        state: options?.state || '',
        phone: phoneMatch ? phoneMatch[0] : '',
        website: url,
        rating: '',
        reviews_count: '',
        instagram: instagramMatch ? instagramMatch[0] : '',
        google_maps_url: '',
        has_website: false,
        has_ads: false,
      };

      leads.push(lead);
    }

    console.log(`📋 Extracted ${leads.length} basic leads`);

    // ============================================
    // 3. VERIFICAÇÕES REAIS EM PARALELO
    // ============================================

    console.log('🔬 Running real verifications...');

    const verifiedLeads = await Promise.all(
      leads.map(async (lead) => {
        const verified = { ...lead };

        // 3a. Verifica se o site existe
        if (lead.website) {
          const siteCheck = await checkWebsite(lead.website);
          verified.has_website = siteCheck.exists;

          // 3b. Se o site existe, verifica se tem ads
          if (siteCheck.exists) {
            const adsCheck = await detectGoogleAds(lead.website);
            verified.has_ads = adsCheck.has_google_ads;
          }
        }

        // 3c. Verifica Meta Ad Library
        const metaCheck = await checkMetaAds(lead.name);
        if (metaCheck.has_active_ads) {
          verified.has_ads = true;
        }

        return verified;
      })
    );

    // ============================================
    // 4. FILTRA: APENAS OPORTUNIDADES
    // ============================================

    const opportunities = verifiedLeads.filter(
      (lead) => !lead.has_website || !lead.has_ads
    );

    console.log(`✅ ${opportunities.length} opportunities found (${verifiedLeads.length} total, ${verifiedLeads.length - opportunities.length} filtered out)`);

    return new Response(
      JSON.stringify({ success: true, data: opportunities.slice(0, 10) }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('❌ Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to search';
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
