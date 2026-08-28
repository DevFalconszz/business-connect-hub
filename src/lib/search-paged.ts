import { supabase } from '@/integrations/supabase/client';
import { StructuredResult } from '@/lib/opencode-api';

export interface PagedSearchResponse {
  success: boolean;
  error?: string;
  data?: StructuredResult[];
  page?: number;
  num?: number;
  total?: number;
}

/**
 * Busca uma página específica de resultados via edge function `search-leads-paged`.
 */
export async function searchLeadsPaged(
  niche: string,
  city: string,
  page: number = 1,
  num: number = 20
): Promise<PagedSearchResponse> {
  const { data, error } = await supabase.functions.invoke<PagedSearchResponse>('search-leads-paged', {
    body: { niche, city, page, num },
  });

  if (error) {
    console.error('search-leads-paged invoke error:', error.message);
    return { success: false, error: error.message };
  }
  return data || { success: false, error: 'Resposta vazia' };
}