import { supabase } from '@/integrations/supabase/client';

export interface AdsVerification {
  business_name: string;
  website: string | null;
  has_ads: boolean;
  methods: {
    html_tags: boolean | null;
    meta_ad_library: boolean | null;
  };
  meta_error: string | null;
}

/**
 * Consulta a edge function `detect-ads` para enriquecer os resultados de busca
 * com a detecção real de anúncios (tags no site + Meta Ad Library, quando o
 * token estiver configurado). Retorna um mapa website -> has_ads.
 */
export async function detectAds(
  items: { businessName?: string; website?: string }[]
): Promise<Record<string, boolean>> {
  const map: Record<string, boolean> = {};
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
      map[r.website || r.business_name] = r.has_ads;
    }
  } catch (err) {
    console.error('detect-ads erro:', err);
  }
  return map;
}
