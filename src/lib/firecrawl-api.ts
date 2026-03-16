import { supabase } from '@/integrations/supabase/client';

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
}

export interface SearchResponse {
  success: boolean;
  error?: string;
  data?: StructuredResult[];
}

export async function searchBusinesses(niche: string, city: string): Promise<SearchResponse> {
  const query = `${niche} em ${city} telefone endereço avaliações`;

  const { data, error } = await supabase.functions.invoke('firecrawl-search', {
    body: { query, options: { limit: 20, lang: 'pt-BR', country: 'BR', niche, city } },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}
