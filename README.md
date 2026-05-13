<div align="center">

# 🎯 Lead Hunter CRM

### Plataforma colaborativa de gestão e prospecção inteligente de leads

_Encontre estabelecimentos com oportunidades digitais reais e gerencie todo o seu funil comercial em um só lugar._

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Supabase](https://img.shields.io/badge/Lovable_Cloud-Supabase-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![Lovable](https://img.shields.io/badge/Built_with-Lovable-FF4D8D)](https://lovable.dev)

</div>

---

## ✨ Visão Geral

**Lead Hunter CRM** é um sistema fullstack para times comerciais que precisam **encontrar**, **qualificar** e **gerenciar** leads B2B com foco em estabelecimentos que apresentam **oportunidades de marketing digital** (sem site, sem anúncios ativos, etc).

O projeto une duas frentes em uma única interface:

1. **Gestão de Leads** — uma planilha colaborativa estilo Google Sheets, totalmente editável, com status de funil, decisor, agendamentos e importação de planilhas.
2. **Prospecção Inteligente** — busca automatizada via **Firecrawl + Google Maps**, com extração estruturada por **IA (Gemini)** e filtro automático de oportunidades reais.

---

## 🚀 Funcionalidades

### 📋 Gestão de Leads
- Tabela colaborativa editável em tempo real
- Status de funil padronizado:
  `Análise Pendente` → `Em Análise` → `Follow Up` → `Reunião Agendada` → `Recusado` / `Venda Fechada`
- Campos otimizados: **Nome • Status • Nicho • Cidade/UF • Telefone • Nome do Decisor • Número do Decisor**
- Importação em lote via **CSV / XLSX / XLS** com relatório detalhado de erros por linha
- Exclusão rápida e edição modal completa
- Registro de datas de reunião, descrição, responsável e grupo de WhatsApp

### 🔎 Prospecção Inteligente
- Busca por **nicho + cidade** (ex.: "Restaurante" em "São Paulo")
- Scraping via **Firecrawl** + extração estruturada via **Lovable AI Gateway (Gemini 2.5 Flash)**
- Detecção automática de **presença digital** (`has_website`, `has_ads`)
- **Filtro automático** — apenas estabelecimentos com oportunidade real (sem site OU sem anúncios) aparecem
- Adição rápida ao CRM com 1 clique (`+`), atribuindo um responsável
- Badges visuais ("Sem site" • "Sem anúncios") para priorização

### 🔐 Backend (Lovable Cloud)
- Banco PostgreSQL com **Row Level Security**
- Edge Functions serverless para Firecrawl + IA
- Secrets gerenciados (FIRECRAWL_API_KEY, LOVABLE_API_KEY)
- Tipos TypeScript autogerados a partir do schema

---

## 🧱 Stack Tecnológica

| Camada        | Tecnologia                                                                 |
| ------------- | -------------------------------------------------------------------------- |
| **Frontend**  | React 18, TypeScript 5, Vite 5, React Router 6, TanStack Query             |
| **UI/UX**     | Tailwind CSS 3, shadcn/ui, Radix UI, Lucide Icons, Sonner (toasts)         |
| **Forms**     | React Hook Form + Zod                                                      |
| **Planilhas** | SheetJS (`xlsx`) para parsing CSV/Excel                                    |
| **Backend**   | Lovable Cloud (Supabase) — PostgreSQL, Edge Functions (Deno), Auth, Storage |
| **IA**        | Lovable AI Gateway — `google/gemini-2.5-flash`                             |
| **Scraping**  | [Firecrawl](https://firecrawl.dev) Search API                              |
| **Testes**    | Vitest, Testing Library, Playwright                                        |

---

## 🏛️ Arquitetura

```text
┌────────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React + Vite)                    │
│                                                                    │
│   ┌──────────────────┐         ┌─────────────────────────────┐    │
│   │  /  (Index)      │         │  /prospectar (Prospecting)  │    │
│   │  Gestão de Leads │         │  Busca + IA + Filtro        │    │
│   └────────┬─────────┘         └──────────────┬──────────────┘    │
│            │                                  │                   │
│            ▼                                  ▼                   │
│   ┌──────────────────────────────────────────────────────────┐    │
│   │      lib/   (leads-store, csv-parser, firecrawl-api)     │    │
│   └──────────────────────┬───────────────────────────────────┘    │
└──────────────────────────┼─────────────────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                    LOVABLE CLOUD (Supabase)                        │
│                                                                    │
│   ┌─────────────────┐    ┌────────────────────────────────────┐   │
│   │  PostgreSQL     │    │  Edge Function: firecrawl-search   │   │
│   │  table: leads   │    │   1. Firecrawl /v1/search          │   │
│   │  (RLS enabled)  │    │   2. AI extrai JSON estruturado    │   │
│   └─────────────────┘    │   3. Filtra oportunidades          │   │
│                          └─────────┬──────────────────────────┘   │
└────────────────────────────────────┼──────────────────────────────┘
                                     │
                ┌────────────────────┴────────────────────┐
                ▼                                         ▼
        ┌───────────────┐                    ┌────────────────────┐
        │   Firecrawl   │                    │  Lovable AI        │
        │   Search API  │                    │  Gateway (Gemini)  │
        └───────────────┘                    └────────────────────┘
```

---

## 📂 Estrutura do Projeto

```text
.
├── src/
│   ├── components/         # UI: AppHeader, LeadsTable, LeadModal, AddLeadModal,
│   │   │                   #     StatusBadge, StatusSelect, NavLink, LeadCard
│   │   └── ui/             # shadcn/ui primitives
│   ├── pages/
│   │   ├── Index.tsx       # Gestão de Leads (tabela + upload + modais)
│   │   ├── Prospecting.tsx # Busca via Firecrawl + IA
│   │   └── NotFound.tsx
│   ├── lib/
│   │   ├── leads-store.ts  # CRUD de leads (Supabase)
│   │   ├── csv-parser.ts   # Parser CSV/XLSX com validação
│   │   ├── firecrawl-api.ts# Wrapper da edge function
│   │   ├── types.ts        # Lead, LeadStatus
│   │   └── utils.ts
│   ├── integrations/supabase/  # client.ts + types.ts (auto-gerados)
│   ├── hooks/              # use-toast, use-mobile
│   ├── App.tsx             # Rotas
│   ├── index.css           # Design tokens (HSL semantic colors)
│   └── main.tsx
├── supabase/
│   ├── functions/firecrawl-search/index.ts  # Edge Function
│   ├── migrations/                           # SQL versionado
│   └── config.toml
├── public/
├── tailwind.config.ts      # Design system
├── vite.config.ts
└── package.json
```

---

## 🗄️ Schema do Banco

Tabela `public.leads`:

| Coluna           | Tipo         | Descrição                                    |
| ---------------- | ------------ | -------------------------------------------- |
| `id`             | `uuid` (PK)  | Identificador único                          |
| `name`           | `text`       | Nome do estabelecimento                      |
| `title`          | `text`       | Título / slogan                              |
| `category`       | `text`       | Nicho / categoria                            |
| `address`        | `text`       | Endereço completo                            |
| `city` / `state` | `text`       | Cidade e UF                                  |
| `phone`          | `text`       | Telefone do estabelecimento                  |
| `nome_decisor`   | `text`       | Nome do contato decisor                      |
| `numero_decisor` | `text`       | Telefone do decisor                          |
| `website`        | `text`       | Site                                         |
| `instagram`      | `text`       | Handle do Instagram                          |
| `google_maps_url`| `text`       | Link do Google Maps                          |
| `responsavel`    | `text`       | Vendedor responsável                         |
| `descricao`      | `text`       | Notas / descrição                            |
| `status`         | `text`       | Status do funil (enum lógico)                |
| `whatsapp_group` | `text`       | Grupo de WhatsApp                            |
| `meeting_dates`  | `text[]`     | Histórico de reuniões                        |
| `created_at`     | `timestamptz`| Auto                                         |
| `updated_at`     | `timestamptz`| Auto                                         |

**Status válidos:** `analise_pendente`, `em_analise`, `follow_up`, `reuniao_agendada`, `recusado`, `venda_fechada`.

---

## ⚙️ Como rodar localmente

### Pré-requisitos
- Node.js 18+ (recomendado via [nvm](https://github.com/nvm-sh/nvm))
- npm ou bun

### Instalação

```bash
# 1. Clone o repositório
git clone <YOUR_GIT_URL>
cd lead-hunter-crm

# 2. Instale dependências
npm install

# 3. Inicie o dev server
npm run dev
```

O app abre em `http://localhost:8080`.

### Variáveis de ambiente

O arquivo `.env` é **gerenciado automaticamente** pelo Lovable Cloud:

```ini
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
VITE_SUPABASE_PROJECT_ID=...
```

**Secrets de backend** (configurados no painel do Lovable Cloud, nunca no código):

| Secret              | Uso                                             |
| ------------------- | ----------------------------------------------- |
| `FIRECRAWL_API_KEY` | Autenticação da Firecrawl Search API            |
| `LOVABLE_API_KEY`   | Autenticação no Lovable AI Gateway (Gemini)     |

---

## 📜 Scripts disponíveis

| Comando             | Ação                                          |
| ------------------- | --------------------------------------------- |
| `npm run dev`       | Inicia o servidor de desenvolvimento (Vite)   |
| `npm run build`     | Build de produção                             |
| `npm run build:dev` | Build em modo development                     |
| `npm run preview`   | Pré-visualiza o build local                   |
| `npm run lint`      | Lint com ESLint                               |
| `npm run test`      | Roda testes (Vitest)                          |
| `npm run test:watch`| Modo watch                                    |

---

## 🔄 Fluxos principais

### Importar planilha de leads
1. Clique em **Upload** na tela de Gestão de Leads.
2. Selecione um `.csv`, `.xlsx` ou `.xls`.
3. O parser normaliza headers (`Nicho` ↔ `Categoria`, `Telefone Decisor` ↔ `numero_decisor`, etc.) via `FIELD_MAP` com NFD.
4. Erros por linha são reportados em toast (linha + motivo).
5. Linhas válidas são inseridas em batch via `insertLeads()`.

### Prospectar novos leads
1. Acesse **/prospectar**.
2. Informe **Nicho** e **Cidade**.
3. A edge function `firecrawl-search`:
   - Chama a Firecrawl Search API
   - Envia os resultados para o Gemini extrair JSON estruturado
   - Filtra apenas estabelecimentos com `has_website=false` OU `has_ads=false`
4. Resultados aparecem em tabela com badges de oportunidade.
5. Clique em **+** → escolha o responsável → o lead vai direto pro CRM.

---

## 🎨 Design System

Tudo é tematizado via **tokens HSL semânticos** em `src/index.css` e `tailwind.config.ts`.
Componentes **nunca** usam cores diretas (`text-white`, `bg-black`) — sempre via tokens (`bg-background`, `text-foreground`, `text-primary`, etc.), garantindo dark mode consistente.

---

## 🚢 Deploy

Este projeto é desenvolvido na [Lovable](https://lovable.dev). Para publicar:

1. Abra o projeto no editor Lovable.
2. Clique em **Share → Publish**.
3. (Opcional) Conecte um domínio próprio em **Project → Settings → Domains**.

Como o código é padrão Vite + React, também é possível fazer deploy em **Vercel**, **Netlify**, **Cloudflare Pages** ou qualquer host estático — basta replicar as variáveis de ambiente.

---

## 🤝 Contribuindo

1. Faça um fork
2. Crie uma branch: `git checkout -b feat/minha-feature`
3. Commit: `git commit -m "feat: descrição"`
4. Push e abra um PR

Recomendações:
- Siga o design system (tokens semânticos, sem cores hardcoded).
- Mantenha componentes pequenos e focados.
- Toda mudança de schema vai como **nova migration** (nunca edite migrations antigas).

---

## 📄 Licença

Projeto privado. Todos os direitos reservados.

---

<div align="center">

Construído com ❤️ usando [Lovable](https://lovable.dev) • [Lovable Cloud](https://docs.lovable.dev/features/cloud) • [Firecrawl](https://firecrawl.dev)

</div>