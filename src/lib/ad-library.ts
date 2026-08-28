// Monta o link da Meta Ad Library (web) para consulta manual de anúncios.
// Uso: gerar link com o Instagram ou nome do estabelecimento.

export function adLibraryUrl(query: string, country = 'BR'): string {
  const q = (query || '').trim();
  const base = 'https://www.facebook.com/ads/library/';
  const params = new URLSearchParams({
    active_status: 'active',
    ad_type: 'all',
    country,
    is_targeted_country: 'false',
    media_type: 'all',
    q,
    search_type: 'keyword_unordered',
    sort_data_direction: 'desc',
    sort_data_mode: 'total_impressions',
  });
  return `${base}?${params.toString()}`;
}

// Extrai um bom termo de busca: Instagram (sem @) > nome > fallback vazio.
export function adLibraryQueryTerm(instagram?: string, name?: string): string {
  const insta = (instagram || '').trim().replace(/^@/, '');
  if (insta) return insta;
  return (name || '').trim();
}
