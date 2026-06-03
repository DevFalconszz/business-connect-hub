const LOCAL_SERVER_URL = 'http://localhost:3001';

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
  data?: StructuredResult[];
}

export async function isLocalServerRunning(): Promise<boolean> {
  try {
    const res = await fetch(`${LOCAL_SERVER_URL}/api/health`, { signal: AbortSignal.timeout(3000) });
    const data = await res.json();
    return data.status === 'ok';
  } catch {
    return false;
  }
}

export async function searchLeadsLocal(niche: string, city: string): Promise<SearchResponse> {
  try {
    const res = await fetch(`${LOCAL_SERVER_URL}/api/search-leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ niche, city }),
      signal: AbortSignal.timeout(120000),
    });
    return await res.json();
  } catch (err: any) {
    return { success: false, error: err.message || 'Erro ao conectar ao servidor local' };
  }
}
