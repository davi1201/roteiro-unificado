# Phase 5: Shell do Formulário & Navegação por Abas - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 05-shell-do-formul-rio-navega-o-por-abas
**Areas discussed:** FormStore schema, FormLayout + header, Progresso sem campos reais

---

## FormStore schema

### Q1: Como tratar a store existente?

| Option | Description | Selected |
|--------|-------------|----------|
| Expandir a store existente | Adicionar activeTab, sectionData e novas actions à store atual. Mantém padrão createFormStore(tenantId). | ✓ |
| Recriar com schema limpo | Substituir formStore.ts inteiro. Remove step-based schema, define tipos explícitos para 10 seções. | |
| Manter atual + criar store separada | Deixar formStore.ts como está, criar assessmentStore.ts separada. | |

**User's choice:** Expandir a store existente

---

### Q2: Formato para sectionData?

| Option | Description | Selected |
|--------|-------------|----------|
| Record<TabKey, Record<string, unknown>> | Tipo genérico agora, Phase 6 sobrepõe com tipos concretos. Zero acoplamento entre fases. | ✓ |
| Definir tipos de seção agora (sem campos) | Criar interfaces vazias IdentificacaoData, TorreDecisaoData, etc. Phase 6 popula. | |
| Só guardar activeTab + visitedTabs | Phase 5 não guarda dados de seção. Phase 6+ adiciona quando implementar campos. | |

**User's choice:** Record<TabKey, Record<string, unknown>>

---

### Q3: Onde guardar no browser?

| Option | Description | Selected |
|--------|-------------|----------|
| sessionStorage para sectionData | Dados perdem ao fechar aba (Supabase é a persistência real). localStorage só para activeTab/visitedTabs. | ✓ |
| localStorage para tudo | Dados da seção ficam no localStorage, igual ao padrão atual da store. | |

**User's choice:** sessionStorage para sectionData

---

### Q4: Formato do TabKey?

| Option | Description | Selected |
|--------|-------------|----------|
| String union type com slugs | `type TabKey = 'identificacao' \| 'torre-decisao' \| ...`. Matcheia URL hash. | |
| Enum TypeScript | `enum TabKey { Identificacao = 'identificacao', ... }`. Autocomplete explícito. | ✓ |

**User's choice:** Enum TypeScript

---

## FormLayout + header

### Q1: Header próprio?

| Option | Description | Selected |
|--------|-------------|----------|
| Header simples com nome da empresa + botão Sair | Faixa no topo com org name e botão Sair. Consistente com AdminLayout. | |
| Sem header — sidebar absorve o contexto | Nome da empresa na sidebar. Mais área para conteúdo. | |
| Barra de progresso geral no lugar do header | Faixa sticky no topo é a progress bar geral. Nome da empresa na sidebar. | ✓ |

**User's choice:** Barra de progresso geral no lugar do header

---

### Q2: Estilo visual da sidebar?

| Option | Description | Selected |
|--------|-------------|----------|
| Stepper vertical com ícone de status | Ícone (vazio/meio/check) + label + badge de %. Estilo stepper. | ✓ |
| Lista simples como AdminSidebar | Mesmo padrão do admin com badge de % ao lado do label. | |
| Tabs com card por grupo | Seções agrupadas (Torre 360, Habilitações, NDA) com sub-tabs. | |

**User's choice:** Stepper vertical com ícone de status

---

### Q3: Botão Sair?

| Option | Description | Selected |
|--------|-------------|----------|
| Botão Sair no rodapé da sidebar | mt-auto, chama signOut() do AuthContext. | ✓ |
| Menu de usuário no header (top-right) | Ícone de usuário que abre dropdown com "Sair". | |
| Sem botão de logout no formulário | Pode ser adicionado em fase de polimento. | |

**User's choice:** Botão Sair no rodapé da sidebar

---

### Q4: Largura da sidebar?

| Option | Description | Selected |
|--------|-------------|----------|
| 260px fixa | Mesma largura do AdminSidebar + um pouco mais. | |
| 280px fixa | Um pouco mais larga para labels longos como "Hab. Repositórios". | |
| Flex (min 220px, max 300px) | Sidebar adapta à largura do conteúdo. | ✓ |

**User's choice:** Flex (min 220px, max 300px)

---

## Progresso sem campos reais

### Q1: Como ProgressBadge funciona no shell?

| Option | Description | Selected |
|--------|-------------|----------|
| Proxy por "aba visitada" | Visitada = em progresso (0%). Phase 6+ substitui com cálculo real. | ✓ |
| Registry de campos obrigatórios definido agora | Criar formRegistry.ts com campos por aba. Phase 6 preenche. | |
| Mocks hardcodados para demo | ProgressBadge com dados mockados só para validar visual. | |

**User's choice:** Proxy por "aba visitada"

---

### Q2: Valor de completeness sem campos?

| Option | Description | Selected |
|--------|-------------|----------|
| completeness = 0 se não visitada, 0.01 se visitada | Valor sentinel. Phase 6 sobrepõe com cálculo real. | ✓ |
| completeness sempre 0 em Phase 5 | Retorna 0 para todas as abas. Visual só mostra "Não iniciado". | |

**User's choice:** completeness = 0 se não visitada, 0.01 se visitada

---

### Q3: Visual do estado "em progresso" (completeness = 0.01)?

| Option | Description | Selected |
|--------|-------------|----------|
| Ícone de círculo meio preenchido + sem % | Cinza/laranja/verde por estado. Sem "0%" para abas só visitadas. | ✓ |
| Badge texto: Não iniciado / Em progresso / Completo | Label textual ao lado do nome da aba. | |

**User's choice:** Ícone de círculo meio preenchido + sem %

---

### Q4: Barra de progresso geral — exibe número?

| Option | Description | Selected |
|--------|-------------|----------|
| Barra visual + percentual numérico (ex: "30%") | Barra colorida + texto percentual à direita. | |
| Só barra visual | Barra thin sticky no topo. Sem número — mais sutil. | ✓ |

**User's choice:** Só barra visual

---

## Claude's Discretion

- URL hash navigation: ROADMAP prescreve `#identificacao`, `#torre-decisao`, etc. Usar `useLocation().hash` do React Router v6.
- Estrutura de diretórios: `src/features/form/` para hooks e componentes do formulário.
- Mobile (tabs horizontais): `flex overflow-x-auto` com pills scrolláveis em breakpoint `< md`.
- `tabConfig.ts`: array de config com `{ key: TabKey, label: string }` para evitar string magic.

## Deferred Ideas

- **Tooltip no ícone de status da aba** — "X de Y campos preenchidos" — deferred para Phase 6 ou 8.
- **Scroll automático para aba ativa na sidebar mobile** — `scrollIntoView()` — deferred para Phase 12.
- **Animação de transição entre abas** — fade ou slide — deferred para Phase 12 (polimento).
