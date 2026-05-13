# 🗄️ Banco de Dados

## Tabela `public.leads`

Coração do sistema. Armazena tanto leads importados manualmente quanto os capturados pela prospecção.

### Colunas

| Coluna             | Tipo            | Default            | Descrição |
| ------------------ | --------------- | ------------------ | --------- |
| `id`               | `uuid` PK       | `gen_random_uuid()`| Identificador único |
| `name`             | `text`          | `''`               | Nome do estabelecimento |
| `title`            | `text`          | `''`               | Título / slogan |
| `category`         | `text`          | `''`               | Nicho |
| `address`          | `text`          | `''`               | Endereço completo |
| `city`             | `text`          | `''`               | Cidade |
| `state`            | `text`          | `''`               | UF |
| `phone`            | `text`          | `''`               | Telefone do estabelecimento |
| `website`          | `text`          | `''`               | Site |
| `google_maps_url`  | `text`          | `''`               | Link Google Maps |
| `rating`           | `text`          | `''`               | Mantido para compatibilidade |
| `reviews_count`    | `text`          | `''`               | Mantido para compatibilidade |
| `instagram`        | `text`          | `''`               | Instagram |
| `responsavel`      | `text`          | `''`               | Vendedor responsável |
| `descricao`        | `text`          | `''`               | Notas livres |
| `status`           | `text`          | `'analise_pendente'` | Status do funil |
| `whatsapp_group`   | `text`          | `''`               | Grupo WhatsApp |
| `meeting_dates`    | `text[]`        | `'{}'`             | Datas de reuniões |
| `nome_decisor`     | `text`          | `''`               | Nome do decisor |
| `numero_decisor`   | `text`          | `''`               | Telefone do decisor |
| `created_at`       | `timestamptz`   | `now()`            | Criação |
| `updated_at`       | `timestamptz`   | `now()`            | Atualização (trigger) |

### Status válidos (string lógica)

```
analise_pendente | em_analise | follow_up | reuniao_agendada | recusado | venda_fechada
```

Definidos em `src/lib/types.ts` como `LeadStatus`. O valor especial `'none'` é usado apenas no UI para "sem status definido".

## Row Level Security

RLS habilitado na tabela `leads`. As policies permitem leitura/escrita pública (CRM colaborativo público — ver memória do projeto). Caso o produto evolua para multi-tenant, será necessário:

1. Adicionar `owner_id uuid references auth.users`.
2. Criar tabela `user_roles` separada (ver guideline de segurança).
3. Substituir policies por `auth.uid() = owner_id` ou `has_role(...)`.

## Migrations

Toda mudança de schema é um arquivo novo em `supabase/migrations/` com timestamp.
**Nunca** edite uma migration já aplicada — crie outra.

Migrations atuais:
- `2026031319…` → criação inicial da tabela `leads`.
- `2026031717…` → adição de `nome_decisor` / `numero_decisor`.

## Realtime

Não habilitado por padrão. Para ativar:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
```

E no frontend, subscribe via `supabase.channel(...).on('postgres_changes', ...)`.