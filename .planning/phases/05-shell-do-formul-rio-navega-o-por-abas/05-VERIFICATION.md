---
phase: 05-shell-do-formul-rio-navega-o-por-abas
verified: 2026-05-22T20:30:00Z
status: human_needed
score: 6/6 must-haves verificados
overrides_applied: 0
human_verification:
  - test: "Acessar /form/:orgId como construtora logada e verificar sidebar azul com 10 abas"
    expected: "Sidebar bg-primary (#123B66) visível com os 10 itens de navegação; ProgressBar faixa h-1 sticky no topo"
    why_human: "Renderização visual e cor exata de tokens Tailwind v4 não são verificáveis via grep"
  - test: "Clicar em abas diferentes e verificar que a URL hash muda (ex: #torre-decisao)"
    expected: "URL hash atualiza sem recarregar a página; aba ativa recebe destaque visual diferenciado"
    why_human: "Comportamento de hash sync em tempo real e visual de estado ativo requerem interação no browser"
  - test: "Pressionar o botão Sair na sidebar"
    expected: "Usuário é redirecionado para /login; sessão é encerrada"
    why_human: "Fluxo de autenticação e navegação pós-signOut requerem sessão ativa no browser"
  - test: "Tentar acessar /form/:orgId de outro tenant logado com orgId diferente"
    expected: "Redirecionamento imediato para /form/{authOrgId} correto do usuário logado"
    why_human: "Cross-tenant guard requer dois usuários distintos autenticados para testar o redirect"
  - test: "Verificar layout mobile em viewport 375px"
    expected: "Abas aparecem como pills horizontais scrolláveis no topo; sidebar desktop oculta"
    why_human: "Layout responsivo requer simulação de viewport em browser; breakpoint md: não é verificável via grep"
  - test: "Pressionar botão back do browser após navegar entre abas"
    expected: "Browser retorna à aba anterior; URL hash muda; store sincroniza activeTab"
    why_human: "Comportamento de popstate/history com React Router requer interação em browser real"
---

# Phase 05: Shell do Formulário & Navegação por Abas — Relatório de Verificação

**Goal da Fase:** Entregar o shell do formulário de 10 abas em `/form/:orgId` — navegacao por abas com URL hash sync, sidebar bg-primary, ProgressBar sticky, botao Sair, cross-tenant guard. Phase 6 adicionará os campos reais.

**Verificado em:** 2026-05-22T20:30:00Z
**Status:** HUMAN_NEEDED
**Re-verificação:** Não — verificação inicial

---

## Conquista do Goal

### Verdades Observáveis

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | formStore.ts expandida com enum TabKey de 10 valores | VERIFICADO | `export enum TabKey` com 10 membros em `src/stores/formStore.ts` (L10-21) |
| 2 | tabConfig.ts existe com TAB_CONFIG de 10 itens | VERIFICADO | `src/features/form/tabConfig.ts` — array com 10 entradas Identificação → NDA |
| 3 | ProgressBadge.tsx apresenta 3 estados SVG inline sem hex | VERIFICADO | `src/features/form/ProgressBadge.tsx` — 3 ramos SVG usando `text-green-500`, `text-accent`, `text-primary-300` |
| 4 | useFormSection.ts retorna data/updateField/errors/completeness | VERIFICADO | `src/features/form/useFormSection.ts` — hook com assinatura e retorno corretos |
| 5 | TabNavigation.tsx com stepper desktop + pills mobile e guard anti-loop | VERIFICADO | `src/features/form/TabNavigation.tsx` — `flex flex-row md:flex-col`, `window.history.replaceState`, guard no hash |
| 6 | ProgressBar.tsx faixa h-1 sticky com role=progressbar | VERIFICADO | `src/features/form/ProgressBar.tsx` — `sticky top-0 z-40 h-1`, `role="progressbar"`, `aria-valuenow` |
| 7 | FormLayout.tsx com sidebar bg-primary, hash sync e cross-tenant guard | VERIFICADO | `src/features/form/FormLayout.tsx` — `bg-primary`, `useEffect([location.hash])`, guard `routeOrgId !== authOrgId` |
| 8 | router.tsx sem placeholder "Form Page — Phase 5" | VERIFICADO | `grep -c "Form Page — Phase 5" src/router.tsx` retornou 0; rota `/form/:orgId` renderiza `<FormLayout />` |
| 9 | Sem hex hardcoded nos arquivos de form | VERIFICADO | `grep -r "#[0-9a-fA-F]{3,8}" src/features/form/` não retornou matches |
| 10 | npm run type-check passa sem erros | VERIFICADO | `tsc --noEmit` exitou 0 sem erros TypeScript |
| 11 | npm run build completa com sucesso | VERIFICADO | Vite build completou — 244 módulos transformados, sem erros de compilação |

**Pontuação:** 11/11 verificações automatizáveis aprovadas

---

### Artefatos Obrigatórios

| Artefato | Status | Detalhes |
|----------|--------|----------|
| `src/stores/formStore.ts` | VERIFICADO | Expandido in-place com `TabKey` enum, `activeTab`, `visitedTabs`, `sectionData`, 4 actions novas; interface pública preservada |
| `src/features/form/tabConfig.ts` | VERIFICADO | `TAB_CONFIG` array com 10 entradas + `TabConfig` interface; importa `TabKey` via `@/stores/formStore` |
| `src/features/form/ProgressBadge.tsx` | VERIFICADO | Componente puro presentacional, 3 estados SVG, sem dependência de store ou context |
| `src/features/form/useFormSection.ts` | VERIFICADO | Hook com assinatura `(tenantId, tab)` retornando `{ data, updateField, errors, completeness }` |
| `src/features/form/TabNavigation.tsx` | VERIFICADO | Stepper vertical (desktop) + pills (mobile), `window.history.replaceState`, `aria-label`, `aria-current` |
| `src/features/form/ProgressBar.tsx` | VERIFICADO | Faixa sticky h-1, `role="progressbar"`, `aria-valuenow`, cálculo médio de visitedTabs |
| `src/features/form/FormLayout.tsx` | VERIFICADO | Layout completo: sidebar `bg-primary`, `TabNavigation`, `ProgressBar`, botão Sair, hash sync, cross-tenant guard |
| `src/router.tsx` | VERIFICADO | Rota `/form/:orgId` renderiza `<FormLayout />` — import adicionado, placeholder removido |

---

### Verificação de Links Críticos (Wiring)

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `router.tsx` | `FormLayout` | import + `element: <FormLayout />` | WIRED | L10 e L34 do router.tsx |
| `FormLayout` | `TabNavigation` | import + `<TabNavigation tenantId={tenantId} />` | WIRED | L6 e L77 do FormLayout.tsx |
| `FormLayout` | `ProgressBar` | import + `<ProgressBar tenantId={tenantId} />` | WIRED | L7 e L70 do FormLayout.tsx |
| `FormLayout` | `useFormStore` | import + `useFormStore(tenantId)` | WIRED | L4 e L29 do FormLayout.tsx |
| `FormLayout` | `useAuth` | import + `useAuth()` para signOut + cross-tenant guard | WIRED | L3 e L21 do FormLayout.tsx |
| `TabNavigation` | `ProgressBadge` | import + `<ProgressBadge completeness={completeness} />` | WIRED | L3 e L66 do TabNavigation.tsx |
| `TabNavigation` | `TAB_CONFIG` | import + `TAB_CONFIG.map(...)` | WIRED | L2 e L48 do TabNavigation.tsx |
| `ProgressBar` | `TAB_CONFIG` | import + `TAB_CONFIG.reduce(...)` | WIRED | L2 e L25 do ProgressBar.tsx |
| `useFormSection` | `useFormStore` | import + `useFormStore(tenantId)` | WIRED | L1 e L24 do useFormSection.ts |
| `tabConfig.ts` | `TabKey` | import de `@/stores/formStore` | WIRED | L1 do tabConfig.ts |

---

### Verificação de Anti-Padrões

| Arquivo | Padrão | Severidade | Avaliação |
|---------|--------|-----------|-----------|
| `FormLayout.tsx` L17 | "Phase 6+ substitui o placeholder textual..." | INFO | Comentário em JSDoc de documentação — não é código stub. O componente renderiza conteúdo funcional real (label da aba ativa + texto de placeholder intencional da fase). Comportamento correto para um shell de Phase 5. |
| `useFormSection.ts` L34-38 | `errors: {}` + `completeness = 0.01 or 0` | WARNING intencional | Stub documentado e intencional — definido como comportamento correto em CONTEXT D-09 e D-10. Phase 6 substituirá. Não bloqueia o goal da Phase 5. |
| Todos os arquivos | `TBD`, `FIXME`, `XXX` | — | NENHUM encontrado |
| `src/features/form/` | Hex hardcoded | — | NENHUM encontrado |

**Conclusão de anti-padrões:** Sem bloqueadores. Os únicos "stubs" são proxy de completeness e errors vazios — explicitamente definidos como comportamento correto para Phase 5 no CONTEXT.md (D-09/D-10).

---

### Cobertura de Requisitos

| Requisito | Plano | Descrição | Status | Evidência |
|-----------|-------|-----------|--------|-----------|
| FORM-01 | 05-01, 05-04 | Formulário com 10 abas navegáveis | SATISFEITO | `TAB_CONFIG` com 10 entradas; `TabNavigation` mapeia todas; rota `/form/:orgId` operacional |
| FORM-04 | 05-01, 05-03 | Estado cross-step gerenciado por Zustand | SATISFEITO | `formStore.ts` com `sectionData`, `updateSection`, `useFormSection` hook |
| UX-03 | 05-02, 05-03 | Indicador de progresso por aba | SATISFEITO | `ProgressBadge` com 3 estados SVG; `ProgressBar` sticky com `aria-valuenow` |

---

### Verificação de Commits

| Hash | Descrição | Encontrado |
|------|-----------|-----------|
| `0569a77` | feat(05-01): expand formStore with TabKey + storage split | Sim |
| `6723acd` | feat(05-02): add ProgressBadge component with 3-state SVG icons | Sim |
| `e36ee16` | feat(05-03): add useFormSection hook | Sim |
| `936584b` | feat(05-03): add TabNavigation with 10-tab stepper | Sim |
| `291ac49` | feat(05-03): add ProgressBar sticky strip | Sim |
| `fe89f2b` | feat(05-04): add FormLayout with sidebar, hash sync, cross-tenant guard | Sim |
| `05f4bc8` | feat(05-04): wire /form/:orgId route to FormLayout | Sim |

Todos os 7 commits documentados nos SUMMARYs existem no histórico git.

---

### Verificação Humana Necessária

As verificações abaixo requerem interação no browser com usuário autenticado e não podem ser executadas via grep ou análise estática de código.

#### 1. Sidebar visual e 10 abas

**Teste:** Acessar `/form/:orgId` como construtora logada
**Esperado:** Sidebar azul (`bg-primary` = #123B66) à esquerda com os 10 itens de navegação na ordem canônica (Identificação → NDA); `ProgressBar` faixa h-1 visível no topo da página
**Por que humano:** Renderização visual e aplicação de tokens Tailwind v4 via `@theme {}` não são verificáveis sem renderizar o browser

#### 2. Hash sync ao clicar nas abas

**Teste:** Clicar em abas diferentes (ex: "Torre Decisão", "NDA")
**Esperado:** URL hash muda para `#torre-decisao`, `#nda` etc. sem recarregar a página; aba ativa recebe fundo `bg-primary-800` e `font-semibold`
**Por que humano:** Comportamento dinâmico de hash sync via `window.history.replaceState` requer browser ativo

#### 3. Botão Sair

**Teste:** Clicar no botão "Sair" no rodapé da sidebar (desktop)
**Esperado:** Usuário redirecionado para `/login` com `replace: true`; sessão Supabase encerrada
**Por que humano:** Fluxo `signOut()` do Supabase Auth requer sessão ativa e conexão com Supabase

#### 4. Cross-tenant guard

**Teste:** Tentar acessar `/form/{orgId-de-outro-tenant}` com usuário logado como outro tenant
**Esperado:** Redirecionamento imediato para `/form/{authOrgId}` correto do usuário logado via `<Navigate replace />`
**Por que humano:** Requer dois tenants distintos autenticados para testar o redirect

#### 5. Layout mobile em 375px

**Teste:** Abrir DevTools → simular viewport 375px (iPhone SE)
**Esperado:** Sidebar vira pills horizontais scrolláveis no topo; logo e botão Sair ocultados (`hidden md:block`); 10 abas acessíveis via scroll horizontal
**Por que humano:** Responsividade com breakpoint `md:` requer renderização em viewport real ou simulada

#### 6. Browser back button entre abas

**Teste:** Navegar pelas abas e pressionar o botão "back" do browser
**Esperado:** Browser retorna à aba anterior; `popstate` é detectado; `location.hash` muda; `store.activeTab` sincroniza via `useEffect`
**Por que humano:** Comportamento de history stack com `replaceState` vs `pushState` requer interação em browser

---

### Resumo

**Todos os 11 checks automatizáveis passaram sem falhas.**

A Phase 05 entregou o shell completo do formulário conforme definido no goal do ROADMAP.md:

- 10 abas navegáveis via `TabNavigation` mapeando `TAB_CONFIG`
- URL hash sync via `window.history.replaceState` com guard anti-loop
- Sidebar `bg-primary` com botão Sair
- `ProgressBar` sticky h-1 com `role="progressbar"` e `aria-valuenow`
- Cross-tenant guard — `routeOrgId !== authOrgId` redireciona via `<Navigate replace />`
- `formStore.ts` expandida com `TabKey`, `activeTab`, `visitedTabs`, `sectionData`, 4 actions
- Storage split: localStorage persiste navegação; sessionStorage persiste dados de seção
- Zero hex hardcoded; todos os tokens via Tailwind v4 (`bg-primary`, `text-accent`, etc.)
- `npm run type-check` e `npm run build` passam sem erros

O status é `human_needed` porque os UATs de navegação visual, hash sync em browser, botão Sair e cross-tenant guard não podem ser verificados programaticamente sem um browser com usuário autenticado.

---

_Verificado em: 2026-05-22T20:30:00Z_
_Verificador: Claude (gsd-verifier)_
