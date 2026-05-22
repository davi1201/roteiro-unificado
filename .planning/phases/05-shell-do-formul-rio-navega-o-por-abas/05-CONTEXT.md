# Phase 5: Shell do Formulário & Navegação por Abas - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Construir o shell navegável do formulário de avaliação: 10 abas com stepper vertical, FormLayout com barra de progresso sticky no topo, Zustand store expandida com estado por seção, indicador de status por aba (não iniciado / em progresso / completo), e URL hash navigation para deep-link e browser back button. Sem campos reais — campos vêm nas Phases 6 e 7. Output: construtora logada acessa `/form/:orgId`, vê 10 abas navegáveis, estado persiste entre abas.

</domain>

<decisions>
## Implementation Decisions

### FormStore — Expansão da store existente
- **D-01:** **Expandir `src/stores/formStore.ts` existente** — não recriar, não criar store separada. Adicionar à store atual: `activeTab: TabKey`, `visitedTabs: Set<TabKey>`, `sectionData: Partial<Record<TabKey, Record<string, unknown>>>`, e as actions `setActiveTab(tab)`, `markTabVisited(tab)`, `updateSection(tab, data)`, `resetForm()`. Manter `createFormStore(tenantId)` e `useFormStore(tenantId)` como interface pública — padrão de persist key namespaced por tenant permanece.
- **D-02:** **`sectionData` type: `Partial<Record<TabKey, Record<string, unknown>>>`** — tipagem genérica agora. Phase 6 sobrepõe com schemas Zod concretos por aba sem mudar a estrutura da store. Zero acoplamento adiantado entre fases.
- **D-03:** **`sessionStorage` para `sectionData`** — dados de resposta não persistem após fechar a aba (Supabase é a persistência real, Phase 8). `activeTab` e `visitedTabs` continuam no `localStorage` (persist key existente `form-progress-${tenantId}`). Implementar storage split: `partialize` separa o que vai para cada storage.
- **D-04:** **`enum TabKey` TypeScript** para os 10 valores de aba:
  ```ts
  enum TabKey {
    Identificacao     = 'identificacao',
    TorreDecisao      = 'torre-decisao',
    TorreSienge       = 'torre-sienge',
    TorreAcesso       = 'torre-acesso',
    TorreClassificacao = 'torre-classificacao',
    HabVenda          = 'hab-venda',
    HabRepositorios   = 'hab-repositorios',
    HabResponsaveis   = 'hab-responsaveis',
    HabClassificacao  = 'hab-classificacao',
    Nda               = 'nda',
  }
  ```
  Os valores string matcheiam os URL hashes (`#torre-decisao`). Exportar de `src/stores/formStore.ts`.

### FormLayout — Layout visual
- **D-05:** **Barra de progresso geral no topo** em vez de header separado. Faixa sticky thin (`h-1` ou `h-2`) com progress bar colorida (`bg-primary`). Sem número percentual — só barra visual. Nome da empresa e botão Sair ficam na sidebar.
- **D-06:** **Sidebar: stepper vertical** com ícone de status por aba:
  - Não visitada: círculo vazio cinza (`text-muted`)
  - Visitada / em progresso: círculo meio-preenchido laranja (`text-accent`)
  - Completa: check verde (`text-green-600` ou token semântico)
  - Label da aba ao lado do ícone. Sem badge de % em Phase 5 — ícone é o indicador.
- **D-07:** **Botão Sair no rodapé da sidebar** — posição `mt-auto` no flex column da sidebar. Chama `signOut()` do `useAuth()`. Abaixo da lista de abas, separado por linha divisória.
- **D-08:** **Sidebar width flex**: `min-w-[220px] max-w-[300px]` — adapta a labels longos como "Hab. Repositórios" sem truncar. Conteúdo principal ocupa o `flex-1` restante.

### Progresso sem campos reais (Phase 5 shell)
- **D-09:** **Proxy por "aba visitada"** — `completeness` sentinel: `0` = não visitada, `0.01` = visitada mas sem campos preenchidos, `1` = completa. Phase 6+ sobrepõe com cálculo real baseado em campos Zod. UATs de Phase 5 testam navegação, não percentual real.
- **D-10:** **`useFormSection(tabName)`** retorna `{ data, updateField, errors, completeness }`:
  - `data`: slice de `sectionData[tabName]` da store
  - `updateField`: wrapper para `updateSection(tabName, { ...data, [field]: value })`
  - `errors`: objeto vazio `{}` em Phase 5 (sem Zod schema ainda)
  - `completeness`: `0` se tab não visitada, `0.01` se visitada (`visitedTabs.has(tabName)`)
- **D-11:** **ProgressBadge visual**:
  - `completeness === 0` → ícone círculo vazio cinza ("não iniciado")
  - `completeness > 0 && completeness < 1` → ícone meio-preenchido laranja ("em progresso")
  - `completeness === 1` → ícone check verde ("completo")
  - Sem texto percentual na sidebar em Phase 5.

### Claude's Discretion
- **URL hash navigation**: ROADMAP prescreve `#identificacao`, `#torre-decisao`, etc. Usar `useLocation().hash` do React Router v6 para ler a aba ativa. `setActiveTab()` atualiza tanto a store quanto o hash (`window.location.hash = tabKey`). Browser back button funciona via `popstate` nativo.
- **Estrutura de diretórios**: `src/features/form/` para hooks (`useFormSection.ts`, futuros hooks de seção) e componentes de formulário (`FormLayout.tsx`, `TabNavigation.tsx`, `ProgressBar.tsx`).
- **Mobile (tabs horizontais)**: sidebar vira `flex overflow-x-auto` com tabs como pills horizontais em breakpoint `< md`. Sem dropdown — pills scrolláveis com ícone de status mantido.
- **Nomes de exibição das abas**: array de config com `{ key: TabKey, label: string }` para evitar string magic nos componentes de navegação. Definir em `src/features/form/tabConfig.ts`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e escopo
- `.planning/REQUIREMENTS.md` §FORM-01, §FORM-04, §UX-03 — requisitos de formulário tabulado, navegação livre entre abas, e indicador de progresso
- `.planning/ROADMAP.md` §Phase 5 — 6 planos prescritos com estrutura de waves; goals, UATs e dependências

### Código existente (modificar)
- `src/stores/formStore.ts` — **EXPANDIR** (não recriar): adicionar `TabKey` enum, `activeTab`, `visitedTabs`, `sectionData`, e novas actions à store existente; manter `createFormStore(tenantId)` e `useFormStore(tenantId)`
- `src/router.tsx` — substituir placeholder `<div>Form Page — Phase 5</div>` por `<FormLayout />` dentro do bloco `ProtectedRoute`

### Código existente (reutilizar — não recriar)
- `src/features/auth/AuthProvider.tsx` — `useAuth()` expõe `{ user, role, orgId, signOut }` para FormLayout usar no botão Sair
- `src/components/ui/index.ts` — barrel export; importar Button, Badge, Spinner, Card daqui
- `src/components/routing/ProtectedRoute.tsx` — `FormLayout` é filho do `Outlet` desta rota; não modificar o guard

### Referência de domínio
- `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html` — referência dos nomes das 10 abas e estrutura de seções; Phase 5 usa para nomear o `enum TabKey` e `tabConfig.ts`

### Fases anteriores (contexto de integração)
- `.planning/phases/03-authentication-roteamento-por-role/03-CONTEXT.md` — padrão de `useAuth()`, persist key namespaced, estrutura `src/features/auth/`
- `.planning/phases/04-gest-o-de-organiza-es-painel-admin/04-CONTEXT.md` — padrão AdminLayout (sidebar + content); FormLayout segue estrutura similar mas com lógica de progresso

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` (`src/components/ui/button.tsx`) — variante `ghost` para botão Sair no rodapé da sidebar
- `Badge` (`src/components/ui/badge.tsx`) — pode ser base para `ProgressBadge` (ou criar ícone inline simples)
- `Spinner` (`src/components/ui/spinner.tsx`) — loading state enquanto store reidrata
- `useAuth` (`src/features/auth/AuthProvider.tsx`) — `orgId` para identificar a org no FormLayout; `signOut()` para o botão Sair

### Established Patterns
- `createFormStore(tenantId)` / `useFormStore(tenantId)` — padrão de store por tenant já estabelecido; expandir sem quebrar a interface
- `Set<T>` serializado como `Array` no `partialize` e reconvertido no `onRehydrateStorage` — padrão já existe no formStore para `completedSteps`; replicar para `visitedTabs`
- Tailwind v4 tokens: `bg-primary` (#123B66), `text-accent` (#F28C28), nunca hardcodar hex
- Alias `@/` — importar sempre via `@/stores`, `@/features/auth`, `@/components/ui`
- AdminLayout como referência de padrão: `flex h-screen`, sidebar fixa, `flex-1` para conteúdo principal

### Integration Points
- `router.tsx` → `ProtectedRoute` → `Outlet` — `FormLayout` conecta aqui; recebe `orgId` via `useParams()`
- `formStore.ts` → expandir in-place → Phase 6 usa `updateSection(TabKey.TorreDecisao, fields)` sem mudar a interface
- `AuthProvider` → `useAuth().signOut()` → botão Sair no rodapé da sidebar

</code_context>

<specifics>
## Specific Ideas

- Barra de progresso: faixa thin (`h-1`) sticky no topo, `bg-primary` para a parte preenchida, fundo cinza claro. Transição suave ao mudar de aba.
- Stepper sidebar: `flex flex-col gap-1` com cada item como `flex items-center gap-3 px-3 py-2 rounded-md`. Item ativo: `bg-primary/10 text-primary font-medium`. Item não ativo: `hover:bg-gray-100`.
- Sidebar rodapé: `mt-auto pt-4 border-t border-gray-200` com `Button variant="ghost"` exibindo ícone de logout + "Sair".
- Mobile (`< md`): `flex-col` vira `flex-row` na sidebar com `overflow-x-auto`. Cada tab vira pill horizontal com só ícone de status (sem label completo para economizar espaço).

</specifics>

<deferred>
## Deferred Ideas

- **Tooltip no ícone de status da aba** — "X de Y campos preenchidos" — só faz sentido quando Phase 6 tiver campos reais. Deferred para Phase 6 ou Phase 8.
- **Scroll automático para aba ativa na sidebar mobile** — `scrollIntoView()` ao trocar de aba. Deferred para fase de polimento (Phase 12).
- **Animação de transição entre abas** — fade ou slide ao mudar conteúdo. Deferred para Phase 12 (polimento).

</deferred>

---

*Phase: 05-shell-do-formul-rio-navega-o-por-abas*
*Context gathered: 2026-05-22*
