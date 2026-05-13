# 🏛️ Arquitetura

## Visão geral

O Lead Hunter é uma SPA React que conversa diretamente com o Lovable Cloud (Supabase) via SDK no browser, e dispara uma Edge Function para tarefas que exigem secrets (Firecrawl + IA).

```text
 Browser (SPA React)
   │
   ├── @supabase/supabase-js  ──► PostgreSQL (tabela `leads`, RLS)
   │
   └── supabase.functions.invoke('firecrawl-search')
                │
                ▼
         Edge Function (Deno)
         ├── fetch Firecrawl /v1/search
         └── fetch Lovable AI Gateway (Gemini)
```

## Princípios

1. **Client-side first** — toda UI é renderizada no browser; servidor é usado apenas para persistência e tarefas com secrets.
2. **Sem servidor próprio** — não existe Node/Express; toda lógica server-side vive em Edge Functions.
3. **Tipos sincronizados** — `src/integrations/supabase/types.ts` é gerado a partir do schema; **nunca editar manualmente**.
4. **Design tokens HSL** — zero cores hardcoded em componentes.
5. **Migrations versionadas** — toda mudança de schema é uma nova migration; nunca alterar uma já aplicada.

## Camadas

### 1. Apresentação (`src/pages`, `src/components`)
- `Index.tsx` → CRM (tabela colaborativa).
- `Prospecting.tsx` → busca + IA.
- `AppHeader.tsx` → navegação entre as duas abas.

### 2. Domínio / acesso a dados (`src/lib`)
- `leads-store.ts` → CRUD de leads (Supabase).
- `csv-parser.ts` → parser robusto CSV/XLSX com validação.
- `firecrawl-api.ts` → wrapper tipado da Edge Function.
- `types.ts` → `Lead`, `LeadStatus`.

### 3. Integração (`src/integrations/supabase`)
- `client.ts` (auto-gerado) → instância Supabase singleton.
- `types.ts` (auto-gerado) → `Database` types.

### 4. Backend (`supabase/`)
- `functions/firecrawl-search/index.ts` → orquestra Firecrawl + Gemini.
- `migrations/*.sql` → schema versionado.

## Decisões de design

| Decisão | Motivo |
| ------- | ------ |
| Edge Function ao invés de chamar Firecrawl direto do browser | Esconder `FIRECRAWL_API_KEY` |
| IA para extração estruturada | Resultado bruto do Firecrawl é markdown caótico — Gemini transforma em JSON validável |
| Filtro `has_website OR !has_ads` no servidor | Evita trafegar leads irrelevantes |
| Status como `text` (não enum) | Flexibilidade para evoluir o funil sem migration |
| `meeting_dates` como `text[]` | Histórico simples, sem necessidade de tabela secundária |