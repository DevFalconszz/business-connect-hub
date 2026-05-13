# 📚 Documentação — Lead Hunter CRM

Bem-vindo à documentação técnica do projeto. Esta pasta contém referências detalhadas de cada subsistema.

## Índice

| Documento | Conteúdo |
| --------- | -------- |
| [`architecture.md`](./architecture.md) | Arquitetura geral, fluxo de dados e decisões de design |
| [`database.md`](./database.md) | Schema completo, RLS, migrations e convenções |
| [`edge-functions.md`](./edge-functions.md) | Edge functions, contratos de I/O e secrets |
| [`frontend.md`](./frontend.md) | Estrutura do frontend, rotas, componentes e design system |
| [`prospecting.md`](./prospecting.md) | Pipeline de prospecção (Firecrawl + IA + filtro) |
| [`leads-management.md`](./leads-management.md) | Gestão de leads, status, importação e modais |
| [`development.md`](./development.md) | Setup local, scripts, testes e troubleshooting |
| [`api-reference.md`](./api-reference.md) | Referência das funções `lib/` (TypeScript) |

## Visão rápida

- **Frontend:** React 18 + Vite + TypeScript + Tailwind + shadcn/ui
- **Backend:** Lovable Cloud (Supabase) — PostgreSQL + Edge Functions
- **IA:** Lovable AI Gateway (`google/gemini-2.5-flash`)
- **Scraping:** Firecrawl Search API

Para iniciar rapidamente, leia o [README principal](../README.md) e depois [`development.md`](./development.md).