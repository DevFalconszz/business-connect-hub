# 🎨 Frontend

## Stack

- **React 18** + **TypeScript 5**
- **Vite 5** (porta `8080`)
- **React Router 6** (`BrowserRouter`)
- **TanStack Query** (instância global em `App.tsx`)
- **Tailwind CSS 3** + **shadcn/ui** + **Radix UI**
- **Sonner** + **shadcn Toaster** para notificações
- **Lucide Icons**

## Rotas

| Path           | Componente            | Função |
| -------------- | --------------------- | ------ |
| `/`            | `pages/Index.tsx`     | Gestão de Leads (tabela + upload) |
| `/prospectar`  | `pages/Prospecting.tsx` | Busca via Firecrawl + IA |
| `*`            | `pages/NotFound.tsx`  | 404 |

`AppHeader` fica fora do `<Routes>` e renderiza a navegação persistente.

## Componentes-chave

| Componente | Responsabilidade |
| ---------- | ---------------- |
| `AppHeader` | Header com navegação entre as duas abas |
| `LeadsTable` | Tabela editável principal |
| `LeadCard` | Versão card (mobile) |
| `LeadModal` | Edição completa de um lead |
| `AddLeadModal` | Criação manual de lead |
| `StatusBadge` | Badge colorido conforme status |
| `StatusSelect` | Dropdown de status com labels traduzidos |
| `NavLink` | Link de navegação com estado ativo |

## Design System

Tokens definidos em **HSL** em `src/index.css` (variáveis CSS) e expostos via `tailwind.config.ts`.
Uso correto:

```tsx
// ✅ certo
<div className="bg-background text-foreground border-border" />

// ❌ errado
<div className="bg-white text-black border-gray-200" />
```

Isso garante dark mode automático e consistência visual.

## Estado

- Estado de servidor → **TanStack Query** + funções de `lib/leads-store.ts`.
- Estado local de UI → `useState` / `useReducer`.
- Não há Redux / Zustand — não é necessário.

## Toasts

Use `useToast()` (shadcn) para feedback estruturado, e `sonner` para mensagens rápidas.
Erros de importação são exibidos em formato de lista por linha.