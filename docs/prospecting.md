# 🔎 Prospecção Inteligente

## Objetivo
Encontrar estabelecimentos que tenham **oportunidade real** de contratar serviços de marketing digital, sites ou automações — ou seja, negócios **sem site** e/ou **sem anúncios pagos** ativos.

## Pipeline

```text
 Usuário (nicho + cidade)
        │
        ▼
 firecrawl-api.ts  ── invoke ──►  Edge Function `firecrawl-search`
                                       │
                                       ├── Firecrawl /v1/search   (markdown bruto)
                                       │
                                       ├── Lovable AI (Gemini)    (extrai JSON)
                                       │
                                       └── Filtro: !has_website || !has_ads
                                       │
                                       ▼
                                 StructuredResult[]
        │
        ▼
 Prospecting.tsx  →  Tabela com badges de oportunidade
        │
        └── Botão (+) → escolhe responsável → insertLead()
```

## Prompt de IA (resumo)

O prompt instrui o Gemini a:
- Extrair campos estruturados (nome, telefone, endereço, etc).
- Detectar `has_website` (site funcional próprio, não rede social).
- Detectar `has_ads` (evidência de anúncios pagos / campanhas ativas).
- Retornar **apenas** estabelecimentos com `has_website=false` OU `has_ads=false`.
- Responder somente JSON puro (sem markdown).

Veja o prompt completo em `supabase/functions/firecrawl-search/index.ts`.

## UI

- Tabela com colunas: Nome, Categoria, Cidade/UF, Telefone, Site, Oportunidade.
- Badges:
  - 🚫 **Sem site** (vermelho)
  - 📵 **Sem anúncios** (laranja)
- Botão **+** abre dialog para escolher o **responsável** e adiciona ao CRM com status `analise_pendente`.

## Limitações conhecidas

- A detecção de `has_ads` depende de evidências textuais nos snippets — pode falsear "sem anúncios" para empresas que de fato anunciam mas não mencionam isso na página indexada.
- Resultados duplicados são deduplicados pelo nome (responsabilidade do prompt).
- `limit` padrão de 20 resultados — ajustável via `options.limit`.