# ⚡ Edge Functions

Edge functions rodam em **Deno Deploy** dentro do Supabase. Deploy é automático ao salvar.

## `firecrawl-search`

Localização: `supabase/functions/firecrawl-search/index.ts`

### Propósito
Orquestrar a busca por estabelecimentos:
1. Chama Firecrawl Search API.
2. Envia resultado bruto para o Lovable AI Gateway (Gemini) extrair JSON estruturado.
3. Filtra apenas oportunidades reais (sem site OU sem anúncios).

### Request

```ts
POST /functions/v1/firecrawl-search
Content-Type: application/json

{
  "query": "Restaurante em São Paulo telefone endereço avaliações",
  "options": {
    "limit": 20,
    "lang": "pt-BR",
    "country": "BR",
    "niche": "Restaurante",
    "city": "São Paulo"
  }
}
```

### Response

```ts
{
  "success": true,
  "data": StructuredResult[]
}
```

`StructuredResult` (ver `src/lib/firecrawl-api.ts`):

```ts
interface StructuredResult {
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
```

### Erros

| Status | Causa |
| ------ | ----- |
| 400    | `query` ausente |
| 500    | `FIRECRAWL_API_KEY` ou `LOVABLE_API_KEY` não configurada |
| 4xx/5xx do Firecrawl | Repassado tal qual |

### Secrets necessárias

| Nome | Origem |
| ---- | ------ |
| `FIRECRAWL_API_KEY` | Connector Firecrawl no Lovable Cloud |
| `LOVABLE_API_KEY`   | Auto-provisionada pelo AI Gateway |

### Modelo de IA

`google/gemini-2.5-flash` — equilíbrio entre custo, latência e capacidade de extração estruturada.
Temperatura `0.1` para resultados determinísticos.

### Fallback

Se a IA falhar, a função retorna os resultados brutos do Firecrawl mapeados manualmente para `StructuredResult`, garantindo que o usuário sempre veja algo.