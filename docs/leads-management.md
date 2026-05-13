# 📋 Gestão de Leads

## Tela principal (`/`)

Renderizada por `pages/Index.tsx`. Composição:

- **Toolbar**: botão de upload (CSV/XLSX), botão de adicionar lead manual.
- **LeadsTable**: tabela editável com todos os leads.
- **LeadModal**: edição completa.
- **AddLeadModal**: criação manual.

## Status de funil

Definidos em `src/lib/types.ts`:

| Valor             | Label exibido         |
| ----------------- | --------------------- |
| `analise_pendente`| Análise Pendente      |
| `em_analise`      | Em Análise            |
| `follow_up`       | Follow Up             |
| `reuniao_agendada`| Reunião Agendada      |
| `recusado`        | Recusado              |
| `venda_fechada`   | Venda Fechada         |

Cada status tem cor própria via `StatusBadge` (tokens HSL semânticos).

## Importação de planilha

`src/lib/csv-parser.ts` provê `parseFile(file)` que:

1. Detecta tipo (`.csv`, `.xlsx`, `.xls`).
2. Para Excel, usa **SheetJS** (`xlsx`) e converte a primeira sheet para AOA.
3. Normaliza headers (NFD + lowercase) e mapeia via `FIELD_MAP`:

   | Header reconhecido (case/acento-insensível) | Campo destino |
   | ------------------------------------------- | ------------- |
   | `nome`, `name`, `estabelecimento`           | `name` |
   | `nicho`, `categoria`, `category`            | `category` |
   | `cidade`, `city`                            | `city` |
   | `uf`, `estado`, `state`                     | `state` |
   | `telefone`, `phone`                         | `phone` |
   | `nome decisor`, `decisor`                   | `nome_decisor` |
   | `numero decisor`, `telefone decisor`        | `numero_decisor` |
   | `responsavel`                               | `responsavel` |
   | `status`                                    | `status` |

4. Valida cada linha (nome obrigatório, telefone em formato razoável).
5. Retorna `{ leads: Lead[], errors: { row: number, message: string }[] }`.

Erros aparecem em toast detalhado por linha.

## Adição manual

`AddLeadModal` cria um lead com defaults seguros e status inicial `analise_pendente`.

## Exclusão

Botão de lixeira por linha → confirma → `deleteLead(id)` → remove do estado e do banco.

## Adição via prospecção

Vide [`prospecting.md`](./prospecting.md). O lead criado herda todos os campos extraídos pela IA + responsável escolhido no diálogo.