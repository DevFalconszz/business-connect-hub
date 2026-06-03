<div align="center">

<img src="./public/logo.svg" alt="Business Connect Hub" width="420" />

### Plataforma CRM de Prospecção Inteligente com IA

_Encontre, qualifique e gerencie leads B2B com oportunidades reais de marketing digital._

[![React](https://img.shields.io/badge/React-18-0A0A0A?logo=react&logoColor=F5A623)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-0A0A0A?logo=typescript&logoColor=F5A623)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-5-0A0A0A?logo=vite&logoColor=F5A623)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-0A0A0A?logo=tailwind-css&logoColor=F5A623)](https://tailwindcss.com)
[![OpenCode](https://img.shields.io/badge/OpenCode-IA-0A0A0A?logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNiIgaGVpZ2h0PSIxNiIgZmlsbD0iI0Y1QTYyMyI+PHJlY3Qgd2lkdGg9IjE2IiBoZWlnaHQ9IjE2IiByeD0iNCIvPjwvc3ZnPg==&logoColor=F5A623)](https://opencode.ai)
[![Supabase](https://img.shields.io/badge/Supabase-0A0A0A?logo=supabase&logoColor=F5A623)](https://supabase.com)

</div>

---

## ✨ Visão Geral

**Business Connect Hub** é um CRM fullstack para times comerciais que precisam **encontrar**, **qualificar** e **gerenciar** leads B2B com foco em estabelecimentos com **oportunidades de marketing digital** (sem site, sem anúncios ativos).

| Modo | Prospecção | Banco de Dados |
|------|-----------|----------------|
| 🌐 **Online** | Firecrawl + IA (Gemini) via Supabase Edge Functions | Supabase Cloud |
| 💻 **Local** | OpenCode AI (websearch) via servidor Node.js local | Supabase Cloud |

---

## 🚀 Funcionalidades

### 📋 Gestão de Leads
- Tabela colaborativa editável em linha
- Funil de vendas: `Análise Pendente` → `Em Análise` → `Follow Up` → `Reunião Agendada` → `Recusado` / `Venda Fechada`
- Importação em lote via **CSV / XLSX / XLS**
- Edição completa com modal de detalhes
- Agendamento de reuniões com link para Google Calendar
- Atribuição de responsável e grupo de WhatsApp

### 🔎 Prospecção Inteligente
- Busca por **nicho + cidade** (ex.: "Restaurante" em "São Paulo")
- **Modo Local**: usa OpenCode AI com websearch para pesquisar dados reais da web
- **Modo Online**: usa Firecrawl + Gemini para extração estruturada
- Detecção automática de presença digital (`has_website`, `has_ads`)
- Adição rápida ao CRM com 1 clique

### 🎨 Design System M.I.
- **Branco** (#FFFFFF) — backgrounds, cards, superfícies
- **Preto** (#0A0A0A) — textos, headers, botões primários
- **Dourado** (#F5A623) — ações, acentos, destinos, status positivos

---

## 🧱 Stack

| Camada | Tecnologia |
|--------|-----------|
| **Frontend** | React 18, TypeScript 5, Vite 5, React Router 6 |
| **UI** | Tailwind CSS 3, shadcn/ui, Radix UI, Lucide Icons |
| **Backend Local** | Node.js + Express (porta 3001) |
| **IA Local** | OpenCode CLI — agente `lead-researcher` com websearch |
| **Backend Cloud** | Supabase — PostgreSQL, Edge Functions (Deno) |
| **IA Cloud** | Firecrawl + Gemini |
| **Planilhas** | SheetJS (`xlsx`) |

---

## 🏛️ Arquitetura

```text
                    ┌─────────────────────────────────────┐
                    │         FRONTEND (React + Vite)      │
                    │   localhost:8080                      │
                    │                                      │
                    │  ┌──────────┐  ┌──────────────────┐  │
                    │  │ / (CRM)  │  │ /prospectar      │  │
                    │  └────┬─────┘  └────────┬─────────┘  │
                    └───────┼─────────────────┼─────────────┘
                            │                 │
              ┌─────────────┼─────────────────┼──────────┐
              │             ▼                 ▼          │
              │  ┌──────────────────────────────────┐    │
              │  │   Modo Local?                     │    │
              │  │   sim ───▶ Servidor :3001         │    │
              │  │   não ───▶ Supabase Edge Function │    │
              │  └────────────────┬─────────────────┘    │
              │                   │                       │
              │         ┌─────────▼─────────┐            │
              │         │  opencode run     │            │
              │         │  --agent lead-    │            │
              │         │  researcher       │            │
              │         │  (websearch)      │            │
              │         └───────────────────┘            │
              └──────────────────────────────────────────┘
```

---

## 📂 Estrutura

```
.
├── src/                    # Frontend React
│   ├── components/         # AppHeader, LeadsTable, LeadCard, LeadModal...
│   ├── pages/              # Index (CRM), Prospecting, NotFound
│   ├── lib/                # leads-store, csv-parser, opencode-api, env-check
│   └── hooks/              # use-toast, use-mobile
├── server/                 # Backend local (Express + OpenCode)
│   ├── index.js            # Servidor HTTP (porta 3001)
│   ├── lead-researcher.js  # Bridge para OpenCode
│   └── .env                # Config do servidor
├── .opencode/
│   ├── opencode.jsonc      # Config do OpenCode
│   └── agents/
│       └── lead-researcher.md  # Agente especializado
├── setup.sh                # Setup Linux/macOS
├── setup.bat               # Setup Windows
├── tailwind.config.ts      # Design system M.I.
└── index.html
```

---

## ⚙️ Setup Rápido

### Linux / macOS

```bash
chmod +x setup.sh
./setup.sh
```

### Windows

```batch
.\setup.bat
```

O script instala dependências (Node.js, npm), verifica se o OpenCode está disponível, e inicia:
- **Frontend**: http://localhost:8080
- **Backend Local**: http://localhost:3001

### Manual

```bash
# Instalar dependências
npm install
cd server && npm install && cd ..

# Iniciar servidor local
cd server && node index.js &

# Iniciar frontend
npm run dev
```

### Pré-requisitos

| Ferramenta | Obrigatório? | Para quê? |
|-----------|-------------|-----------|
| Node.js 18+ | ✅ Sim | Frontend + Servidor |
| npm | ✅ Sim | Gerenciamento de pacotes |
| OpenCode CLI | ⬜ Opcional | Prospecção local com IA real |

Para instalar o OpenCode:
```bash
curl -fsSL https://opencode.ai/install.sh | sh
opencode providers  # Configure um provedor de IA
```

---

## 🎨 Design System M.I.

O tema segue a identidade **M.I.** (Marca Identitária):

```css
--background: 0 0% 100%;       /* Branco */
--foreground: 0 0% 4%;         /* Preto */
--primary: 42 100% 50%;        /* Dourado (#F5A623) */
--sidebar-background: 0 0% 4%; /* Sidebar preta */
```

Cores:
- **Dourado** `#F5A623` — botões primários, badges de status positivo, links, ícones ativos
- **Preto** `#0A0A0A` — header, navbar, botões, textos principais
- **Branco** `#FFFFFF` — fundo de páginas, cards, modais

---

## 📜 Scripts

| Comando | Ação |
|---------|------|
| `npm run dev` | Inicia frontend (Vite) |
| `npm run build` | Build de produção |
| `npm run lint` | ESLint |
| `npm run test` | Vitest |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Branch: `git checkout -b feat/minha-feature`
3. Commit: `git commit -m "feat: descrição"`
4. Push e abra um PR

---

<div align="center">

**Business Connect Hub** © 2026 — Construído com ☕ e OpenCode

</div>
