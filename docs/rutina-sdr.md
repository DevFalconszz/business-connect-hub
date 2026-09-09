# Rotina do SDR — CRM M.I.

Documento oficial que descreve, passo a passo, como um SDR entra na plataforma
e realiza o seu trabalho no dia a dia. Serve como:

- Manual de **onboarding** para novos SDRs.
- Base para **novas funcionalidades** (verificações manuais de anúncios, etc.).
- Fonte da verdade sobre o comportamento atual do sistema.

> O fluxo abaixo foi validado no código atual da plataforma
> (rotas, telas `Gestão de Leads`, `Prospectar`, `Dashboard` e o controle de
> relatórios diários).

---

## 1. Visão geral

A plataforma tem dois papeis:

| Papel | O que pode fazer |
|-------|------------------|
| **SDR** (vendedor) | Prospectar, adicionar e gerenciar leads, registrar relatórios diários. |
| **Admin** | Tudo do SDR + Dashboard com métricas, uso das APIs, usuários e relatórios. |

Um **SDR** só enxerga e edita os **seus próprios leads**. O nome do
**responsável** é atribuído automaticamente ao logar e **não pode ser alterado**
nem digitado manualmente.

### Horário de trabalho (padrão da equipe)

- **Expediente:** das **09:00 às 17:00** (horário comercial padrão).
- **Início do dia:** o SDR entra na plataforma no início do expediente.
- **Fim do dia:** o **Relatório Diário do dia** deve ser preenchido até o fim do
  expediente (17:00).
- A rotina abaixo assume esse intervalo como base para lembretes, bloqueios e
  relatórios.

---

## 2. Fluxograma (fluxo completo de um dia de trabalho)

```mermaid
flowchart TD
    START([SDR faz login na plataforma<br/>email + senha]):::start

    START --> GATE{Relatório do último<br/>dia útil preenchido?}

    GATE -- "Não" --> MODAL_BLOQ[Modal obrigatório abre<br/>Relatório Diário: descreva<br/>o dia anterior]:::block
    MODAL_BLOQ --> SALVA_REL([Enviar Relatório]):::action
    SALVA_REL --> GATE

    GATE -- "Sim" --> HOME[Entra na aba Gestão de Leads<br/>listagem/tabela com seus leads]:::page

    HOME --> ESCOLHE{Qual atividade?}
    ESCOLHE -->|Prospectar novos leads| P1
    ESCOLHE -->|Trabalhar leads existentes| T1

    subgraph PROSPECTO[Prospectar novos leads]
        P1[Preencher Nicho + Cidade<br/>ex: Clínica Odontológica + São Paulo]:::step
        P1 --> P2[Buscar]
        P2 --> P3[Plataforma busca no Google Maps<br/>filtra quem já está salvo<br/>deduplica automaticamente]:::step
        P3 --> P4{Tem oportunidades novas?}
        P4 -- Não --> P4A[Mostra: todos já salvos<br/>ou nada encontrado]:::muted
        P4 -- Sim --> P5[Lista só oportunidades reais:<br/>SEM site OU SEM anúncios ativos]:::step
        P5 --> P6{Análise da linha}
        P6 -->|Tem telefone/site| P7[Confere dados e adiciona]
        P6 -->|Anúncios Meta "Por verificar"| M1
        P7 --> P8[Botão + Adicionar aos leads<br/>status inicial: Análise Pendente]:::action
        P8 --> P9[Responsável atribuído automaticamente<br/>lead passa a ser do SDR]:::done
        P9 --> FIM
    end

    subgraph MANUAL[Verificação manual de anúncios Meta]
        M1[Botão "Ver na Ad Library"<br/>abre a Meta Ad Library em nova aba]:::step
        M1 --> M2[Termo de busca já preenchido:<br/>Instagram sem @ ou nome do negócio]:::step
        M2 --> M3{Encontrou anúncios ativos?}
        M3 -- Sim --> M4[Marcar: Tem anúncio]:::done
        M4 --> FIM
        M3 -- Não --> M5[Marcar: Sem anúncio]:::muted
        M5 --> FIM
    end

    subgraph TRABALHAR[Trabalhar leads existentes]
        T1[Buscar/navegar em Gestão de Leads<br/>por nome, cidade, decisor, responsável]:::step
        T1 --> T2[Abrir o lead (pop-up detalhes)]
        T2 --> T3[Atividades do lead]
        T3 --> T3A[Editar descrição]
        T3 --> T3B[Registrar Relatórios e Anotações]
        T3 --> T3C[Anotar decisor<br/>nome e número]
        T3 --> T3D[Mudar status: Em Análise,<br/>Follow Up, Reunião Agendada,<br/>Recusado, Venda Fechada]:::action
        T3D --> FIM
    end

    FIM([Fim do expediente (17:00)<br/>preencher Relatório Diário]):::end
    FIM --> DIARIO

    subgraph DIARIO[Relatório diário — até 17:00]
        D1[Durante o expediente aparece lembrete<br/>"Não esqueça o relatório de hoje"]:::step
        D1 --> D2[Preencher: prospecções realizadas,<br/>ligações, reuniões, dificuldades,<br/>próximos passos]:::step
        D2 --> D3[Enviar Relatório]:::action
    end

    classDef start fill:#1e293b,stroke:#f5b301,color:#ffffff,stroke-width:2px
    classDef page fill:#0f172a,stroke:#f5b301,color:#f8fafc
    classDef step fill:#1e3a5f,stroke:#2563eb,color:#e2e8f0
    classDef action fill:#f5b301,stroke:#b45309,color:#000000,font-weight:bold
    classDef block fill:#7f1d1d,stroke:#f87171,color:#fee2e2
    classDef done fill:#14532d,stroke:#4ade80,color:#dcfce7
    classDef muted fill:#334155,stroke:#64748b,color:#cbd5e1
    classDef end fill:#1e293b,stroke:#f5b301,color:#ffffff,stroke-width:2px
```

---

## 3. Rotina prática passo a passo

### Etapa 1 — Entrar na plataforma
1. No início do expediente (**09:00**), acesse o endereço da plataforma.
2. Entre com **email e senha** (Login).
3. O sistema te leva automaticamente para a tela certa:
   - **Admin** → `Dashboard`.
   - **SDR** → `Gestão de Leads`.

> No cabeçalho aparecem as abas **Gestão de Leads**, **Prospectar** e (só para
> admin) **Dashboard**. No canto superior direito o seu nome é exibido.

### Etapa 2 — Relatório do dia anterior (obrigatório)
- O sistema calcula o **último dia útil** (ignora fins de semana e feriados).
- Se você **não preencheu o relatório** daquele dia, um **modal bloqueia a
  plataforma**: em **09:00** você precisa descrever o que foi feito no dia
  anterior e enviar para começar a trabalhar.
- Durante **dias úteis**, aparece um aviso fixo na parte de baixo:
  *"Não esqueça de preencher o relatório de hoje."* — basta tocar em
  **Preencher**. O ideal é salvá-lo **até as 17:00** (fim do expediente).

### Etapa 3 — Prospectar novos leads
1. Vá na aba **Prospectar**.
2. Preencha **Nicho** (ex.: `Restaurante`, `Clínica Odontológica`) e **Cidade**.
3. Clique em **Buscar**.
4. A plataforma:
   - Busca estabelecimentos no Google Maps (SerpAPI).
   - **Exclui automaticamente** os lead que já estão salvos (não duplica).
   - **Adiciona telefone e verifica anúncios automaticamente**.
   - Mostra apenas **oportunidades reais**: estabelecimentos **sem site** ou
     **sem anúncios ativos**.
5. Na lista você vê: Nome, Nicho, Cidade, UF, Telefone, Site (Sim/Sem site),
   **Ads Google** (n anúncios / Sem anúncio), **Ads Meta**
   (Tem anúncio / Sem anúncio / Por verificar) e um botão
   **Verificar Anúncios**.
6. Para aproveitar um resultado, clique no botão **+** da linha.
   - O **responsável** é gravado automaticamente (seu nome).
   - O status inicial é **Análise Pendente**.

### Etapa 4 — Verificação de anúncios
| Plataforma | Como é verificada hoje |
|------------|------------------------|
| **Google Ads** | Automática: a plataforma consulta se o negócio aparece em anúncios patrocinados e retorna a quantidade. |
| **Meta (Facebook/Instagram)** | Manual: o SDR abre a **Meta Ad Library** e confere visualmente. |

**Como fazer a verificação manual (Meta), de forma simples:**
1. Na linha do resultado, clique em **Ver na Ad Library**.
2. O navegador abre a Meta Ad Library já **buscando** o Instagram do negócio
   (sem o `@`) ou, se não houver, o **nome** do estabelecimento, filtrado para
   anúncios **ativos no Brasil**.
3. Olhe os resultados:
   - Apareceu anúncio ativo da marca → o negócio **tem anúncio**.
   - Não apareceu / aparece página sem anúncios ativos → **não tem anúncio**.
4. Use a informação para decidir se é realmente uma oportunidade.

> Este procedimento é a base para a próxima funcionalidade: registrar o resultado
> da verificação manual dentro do próprio lead (ex.: botões "Tem anúncio" /
> "Sem anúncio" que são salvos e exibidos no lead e no dashboard).

### Etapa 5 — Gerenciar os leads
Na aba **Gestão de Leads**:
- **Buscar** por nome, cidade, decisor ou responsável.
- Alternar entre **tabela** e **cards** (no celular, cards aparecem sozinhos).
- **Adicionar** lead manualmente (botão Adicionar).
- **Abrir** um lead para ver os detalhes completos.

**O que dá para fazer dentro do lead (pop-up):**
- Editar a **descrição** do negócio.
- Registrar **Relatórios e Anotações** (adicionar, editar, excluir).
- Anotar o **decisor** (nome e número/WhatsApp).
- **Mudar o status** conforme o andamento:
  - `Análise Pendente` → lead recém-adicionado.
  - `Em Análise` → você verificou os dados.
  - `Follow Up` → recontato agendado.
  - `Reunião Agendada` → reunião marcada.
  - `Recusado` → não é cliente.
  - `Venda Fechada` → fechou.

> O **responsável** de um lead **não pode ser alterado** pelo SDR (nem na tela
> nem manualmente) — é definido automaticamente por quem criou/assumiu o lead.

### Etapa 6 — Fim do expediente: relatório diário
Todo **dia útil** o SDR deve preencher o **Relatório Diário** descrevendo:

- Prospecções realizadas.
- Ligações feitas/recebidas.
- Reuniões e próximos passos.
- Dificuldades encontradas.

O relatório diário do dia deve ser enviado **até as 17:00** (fim do expediente).
Sem isso, **no dia útil seguinte, o trabalho fica bloqueado** até o relatório do
último dia útil ser enviado.

---

## 4. Regras que o sistema garante

1. **Responsável automático e imutável** — todo lead criado já nasce com o nome
   do usuário logado; o valor é travado no banco de dados.
2. **Sem duplicação** — a prospecção remove automaticamente negócios que já
   estão na base.
3. **Visibilidade por usuário** — o SDR vê somente os próprios leads; admin vê
   todos.
4. **Controle por relatório** — sem relatório do dia útil anterior, não se
   trabalha na plataforma.
5. **Expediente 09:00–17:00** — horário padrão assumido pela equipe para
   entrada, operação e fechamento (relatório do dia até 17:00).
6. **`Exclusão de leads não existe`** — leads não podem ser apagados; apenas
   mudam de status e responsável (remanejamento feito por admin no banco).

---

## 5. Próximos passos (melhorias a serem adicionadas)

Com esta rotina formalizada, as melhorias terão base clara:

- **Registrar a verificação manual de anúncios** dentro do lead
  (botões "Tem anúncio / Sem anúncio / Revisar" + quem verificou + quando).
- **Filtros rápidos** em Gestão de Leads por status e por anúncio
  (ex.: só leads "Sem anúncio").
- **Checklist de verificação** na prospecção para padronizar o SDR
  (site, telefone, Instagram, anúncios Google e Meta).
- **Lembretes com base no horário de expediente (09:00–17:00):** aviso de
  "relatório pendente" programado para o fim do dia, e bloqueio de entrada até
  o relatório anterior ser preenchido.
- **Relatório diário estruturado** (campos numéricos: nº de prospecções,
  ligações, reuniões) em vez de somente texto livre.