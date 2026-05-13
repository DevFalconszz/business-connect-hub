# 🛠️ Desenvolvimento

## Pré-requisitos
- **Node.js 18+** (preferência via [nvm](https://github.com/nvm-sh/nvm))
- **npm** ou **bun**
- Acesso ao projeto Lovable (ou as variáveis de ambiente equivalentes)

## Setup

```bash
git clone <YOUR_GIT_URL>
cd lead-hunter-crm
npm install
npm run dev      # http://localhost:8080
```

## Scripts

| Comando             | O que faz |
| ------------------- | --------- |
| `npm run dev`       | Vite dev server (HMR) |
| `npm run build`     | Build de produção |
| `npm run build:dev` | Build em modo development (sourcemaps + sem minify agressivo) |
| `npm run preview`   | Preview local do build |
| `npm run lint`      | ESLint |
| `npm run test`      | Vitest run |
| `npm run test:watch`| Vitest watch |

## Variáveis de ambiente

`.env` é gerenciado pelo Lovable Cloud — **não editar manualmente**:

```ini
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

Secrets de backend (Edge Functions) são configuradas no painel do Lovable Cloud:
- `FIRECRAWL_API_KEY`
- `LOVABLE_API_KEY`

## Estrutura de testes

- `src/test/setup.ts` — bootstrap do Vitest.
- `src/test/example.test.ts` — exemplo.
- Playwright configurado em `playwright.config.ts`.

## Convenções

1. **Nunca** edite:
   - `src/integrations/supabase/client.ts`
   - `src/integrations/supabase/types.ts`
   - `.env`
   - `supabase/config.toml` (project_id)
   - Migrations já aplicadas
2. Toda mudança de schema → **nova** migration timestamp.
3. Cores em componentes apenas via tokens semânticos.
4. Componentes pequenos, focados, em arquivos próprios.
5. Forms com **react-hook-form + zod**.
6. Tipagem forte; evite `any`.

## Troubleshooting

| Sintoma | Solução |
| ------- | ------- |
| "Failed to invoke function" | Verifique secrets `FIRECRAWL_API_KEY` / `LOVABLE_API_KEY` no painel Cloud |
| Tabela vazia mesmo após inserir | Verifique RLS / cheque o console do navegador |
| Tipos do Supabase desatualizados | São regenerados automaticamente após migration; force reload do editor |
| HMR travado | `npm run dev` novamente; HMR overlay está desabilitado em `vite.config.ts` |
| Importação Excel falhando | Confirme que a primeira aba contém headers reconhecidos pelo `FIELD_MAP` |