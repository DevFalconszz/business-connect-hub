import { supabase } from '@/integrations/supabase/client';

export interface AdsVerification {
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

export interface AdsResult {
  has_ads: boolean;
  google_ads_count: number;
  meta_has_ads: boolean | null;
  instagram_found: string;
  meta_search_term: string;
}

/**
 * Consulta a edge function `detect-ads` para enriquecer os resultados de busca
 * com a detecção real de anúncios (tags no site + Google Ads via SerpApi + Meta
 * Ad Library, quando os tokens estiverem configurados).
 *
 * Retorna um mapa website|businessName -> { has_ads, google_ads_count }.
 */
export async function detectAds(
  items: { businessName?: string; website?: string; city?: string; instagram?: string }[]
): Promise<Record<string, AdsResult>> {
  const map: Record<string, AdsResult> = {};
  try {
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      results?: AdsVerification[];
    }>('detect-ads', { body: { items } });

    if (error || !data?.success || !data.results) {
      console.error('detect-ads falhou:', error?.message || data);
      return map;
    }

    for (const r of data.results) {
      map[r.website || r.business_name] = {
        has_ads: r.has_ads,
        google_ads_count: r.google_ads_count ?? 0,
        meta_has_ads: r.methods?.meta_ad_library ?? null,
        instagram_found: r.instagram_found || '',
        meta_search_term: r.meta_search_term || '',
      };
    }
  } catch (err) {
    console.error('detect-ads erro:', err);
  }
  return map;
}
