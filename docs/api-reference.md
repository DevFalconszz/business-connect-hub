# 🔌 API Reference (`src/lib`)

## `leads-store.ts`

Wrapper sobre o Supabase para a tabela `leads`.

```ts
loadLeads(): Promise<Lead[]>
```
Lê todos os leads ordenados por `created_at desc`.

```ts
insertLead(lead: Omit<Lead, 'id'>): Promise<Lead | null>
```
Insere um único lead. Retorna o lead com `id`.

```ts
insertLeads(leads: Omit<Lead, 'id'>[]): Promise<Lead[]>
```
Inserção em batch (usado pela importação de planilhas).

```ts
updateLead(lead: Lead): Promise<boolean>
```
Atualiza por `id`. Retorna `true` em sucesso.

```ts
deleteLead(id: string): Promise<boolean>
```
Remove por `id`.

---

## `csv-parser.ts`

```ts
parseFile(file: File): Promise<{
  leads: Omit<Lead, 'id'>[];
  errors: { row: number; message: string }[];
}>
```

- Aceita `.csv`, `.xlsx`, `.xls`.
- Headers normalizados via NFD + lowercase.
- Mapeamento via `FIELD_MAP` (sinônimos PT/EN).
- Validação por linha; erros agregados em `errors[]`.

---

## `firecrawl-api.ts`

```ts
interface StructuredResult {
  name: string; title: string; category: string;
  city: string; state: string; phone: string;
  website: string; rating: string; reviews_count: string;
  address: string; instagram: string; google_maps_url: string;
  has_website: boolean; has_ads: boolean;
}

interface SearchResponse {
  success: boolean;
  error?: string;
  data?: StructuredResult[];
}

searchBusinesses(niche: string, city: string): Promise<SearchResponse>
```

Invoca a Edge Function `firecrawl-search` com query padronizada.
Retorna **apenas** estabelecimentos com oportunidade (sem site OU sem anúncios).

---

## `types.ts`

```ts
type LeadStatus =
  | 'none'
  | 'analise_pendente'
  | 'em_analise'
  | 'follow_up'
  | 'reuniao_agendada'
  | 'recusado'
  | 'venda_fechada';

interface Lead {
  id: string;
  name: string; title: string; category: string;
  address: string; city: string; state: string;
  phone: string; website: string; google_maps_url: string;
  rating: string; reviews_count: string; instagram: string;
  responsavel: string; descricao: string;
  status: LeadStatus;
  whatsapp_group: string;
  meeting_dates: string[];
  nome_decisor: string; numero_decisor: string;
}
```

---

## `utils.ts`

```ts
cn(...inputs: ClassValue[]): string
```
Helper padrão shadcn (clsx + tailwind-merge).