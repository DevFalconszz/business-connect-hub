import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

export interface StructuredResult {
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

export interface SearchResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: StructuredResult[];
}

export async function searchBusinesses(niche: string, city: string): Promise<SearchResponse> {
  const query = `${niche} em ${city} telefone endereço contato`;

  const { data, error } = await supabase.functions.invoke<SearchResponse>('firecrawl-search', {
    body: { query, options: { limit: 15, lang: 'pt-BR', country: 'BR', niche, city } },
  });

  if (error) {
    let details = error.message;
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.text().catch(() => '');
      try {
        const parsed = JSON.parse(body);
        details = parsed.error || body || details;
      } catch {
        details = body || details;
      }
    }
    console.error('firecrawl-search falhou:', details);
    return { success: false, error: details };
  }

  if (!data) {
    return { success: false, error: 'Resposta vazia do servidor de busca.' };
  }

  return data;
}
