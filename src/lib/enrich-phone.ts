import { supabase } from '@/integrations/supabase/client';

export interface PhoneEnrichResult {
  name: string;
  website: string | null;
  phone: string;
  cnpj: string | null;
  source: string;
}

/**
 * Consulta a edge function `enrich-phone` para normalizar/enriquecer o telefone
 * de cada resultado de busca (telefone da busca → site → BrasilAPI/CNPJ).
 * Retorna um mapa key (website || name) -> novo phone, e também a lista de
 * resultados para saber a fonte.
 */
export async function enrichPhones(
  items: { name?: string; website?: string; phone?: string; cnpj?: string }[]
): Promise<{ map: Record<string, string>; results: PhoneEnrichResult[] }> {
  const empty = { map: {}, results: [] };
  try {
    const { data, error } = await supabase.functions.invoke<{
      success: boolean;
      results?: PhoneEnrichResult[];
    }>('enrich-phone', { body: { items } });

    if (error || !data?.success || !data.results) {
      console.error('enrich-phone falhou:', error?.message || data);
      return empty;
    }

    const map: Record<string, string> = {};
    for (const r of data.results) {
      const key = r.website || r.name;
      if (r.phone && key) map[key] = r.phone;
    }
    return { map, results: data.results };
  } catch (err) {
    console.error('enrich-phone erro:', err);
    return empty;
  }
}
