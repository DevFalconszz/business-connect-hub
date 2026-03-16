import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  url: string;
  title: string;
  description: string;
  markdown?: string;
}

export interface SearchResponse {
  success: boolean;
  error?: string;
  data?: SearchResult[];
}

export async function searchBusinesses(niche: string, city: string): Promise<SearchResponse> {
  const query = `${niche} em ${city} telefone endereço`;

  const { data, error } = await supabase.functions.invoke('firecrawl-search', {
    body: { query, options: { limit: 20, lang: 'pt-BR', country: 'BR' } },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data;
}
