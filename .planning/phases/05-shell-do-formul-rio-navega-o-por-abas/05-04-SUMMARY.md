---
phase: 05-shell-do-formul-rio-navega-o-por-abas
plan: 04
subsystem: ui
tags: [react-router, zustand, hash-sync, tailwind, multi-tenant, layout]

# Grafo de dependências
requires:
  - phase: 05-shell-do-formul-rio-navega-o-por-abas
    provides: "TabNavigation, ProgressBar (05-03); formStore + TabKey + tabConfig (05-01); ProgressBadge (05-02)"
  - phase: 03-authentication-roteamento-por-role
    provides: "useAuth() com orgId/signOut; ProtectedRoute; router.tsx"
provides:
  - "FormLayout.tsx: shell completo do formulário com sidebar bg-primary, TabNavigation, ProgressBar sticky, botão Sair, hash sync useEffect e cross-tenant guard"
  - "router.tsx atualizado: /form/:orgId renderiza <FormLayout /> em vez do placeholder"
  - "Phase 5 completa: construtora logada acessa shell navegável de 10 abas com URL hash sync"
affects: [Phase 6, Phase 7, Phase 8, Phase 9]

# Rastreamento de tecnologia
tech-stack:
  added: []
  patterns:
    - "Cross-tenant guard antes de chamar useFormStore — impede store com tenantId alheio ou nulo"
    - "Hash sync sem store nas deps do useEffect — previne loop infinito hash <-> store"
    - "Botão Sair com try/catch + toast.error — espelha padrão AdminHeader"
    - "Sidebar responsiva: hidden md:block para elementos desktop-only (marca + botão Sair)"

key-files:
  created:
    - roteiro-unificado/src/features/form/FormLayout.tsx
  modified:
    - roteiro-unificado/src/router.tsx

key-decisions:
  - "useParams().orgId usado como tenantId do useFormStore — cross-tenant guard valida antes de chamar o hook"
  - "store omitida das deps do useEffect de hash sync — única forma de evitar loop infinito detectado no RESEARCH"
  - "Sidebar usa tokens Tailwind exclusivamente (bg-primary, text-white, border-primary-800) — zero hex hardcoded"
  - "Botão Sair com hidden md:block no desktop — mobile recebe tratamento em Phase 12"

patterns-established:
  - "Cross-tenant guard pattern: isLoading | !routeOrgId | !authOrgId → Spinner; routeOrgId !== authOrgId → <Navigate replace />"
  - "Hash sync pattern: useEffect([location.hash]) com if(activeTab !== matched) antes de setActiveTab"
  - "handleSignOut pattern: try { await signOut(); navigate('/login', { replace: true }) } catch { toast.error(...) }"

requirements-completed: [FORM-01, FORM-04, UX-03]

# Métricas
duration: ~20min (incluindo checkpoint humano)
completed: 2026-05-22
---

# Phase 5 Plan 04: FormLayout + Router Wiring Summary

**Shell do formulário com sidebar bg-primary, 10 abas navegáveis via hash, cross-tenant guard, botão Sair e wiring no router.tsx — checkpoint humano de 11 passos aprovado pelo usuário**

## Performance

- **Duration:** ~20 min (Tasks 1-2 automatizadas + checkpoint humano aprovado)
- **Started:** 2026-05-22
- **Completed:** 2026-05-22
- **Tasks:** 3 (2 auto + 1 checkpoint humano aprovado)
- **Files modificados:** 2

## Realizações

- `FormLayout.tsx` criado com sidebar `bg-primary` à esquerda (min-w-[220px] max-w-[300px]), `TabNavigation` e `ProgressBar` integrados, botão Sair com `mt-auto` no rodapé, hash sync `useEffect`, Spinner de loading e guard de cross-tenant com `<Navigate replace />`
- `router.tsx` atualizado: placeholder `<div>Form Page — Phase 5</div>` substituído por `<FormLayout />`, import adicionado; ProtectedRoute e AdminRoute preservados intocados
- Checkpoint humano (Task 3) aprovado pelo usuário após verificação dos 11 passos: sidebar azul, 10 abas, hash sync, popstate, deep-link, layout mobile, botão Sair, cross-tenant redirect, localStorage sem sectionData, console limpo

## Commits das Tasks

Cada task foi commitada atomicamente:

1. **Task 1: Criar FormLayout.tsx** - `fe89f2b` (feat)
2. **Task 2: Religar router.tsx** - `05f4bc8` (feat)
3. **Task 3: Checkpoint humano** - aprovado pelo usuário (sem commit de código — sem arquivos modificados)

**Metadados do plano:** a ser criado por este SUMMARY

## Arquivos Criados/Modificados

- `roteiro-unificado/src/features/form/FormLayout.tsx` — shell principal do formulário: sidebar com `TabNavigation` + botão Sair, área de conteúdo com placeholder textual por aba, hash sync `useEffect`, cross-tenant guard, Spinner de carregamento
- `roteiro-unificado/src/router.tsx` — rota `/form/:orgId` agora renderiza `<FormLayout />` em vez do placeholder de Phase 5; import de `FormLayout` adicionado

## Decisões Tomadas

- `useParams().orgId` usado como `tenantId` do `useFormStore` — cross-tenant guard valida `routeOrgId === authOrgId` antes de chamar o hook, impedindo criação de store com chave `form-progress-null` ou de outra org
- `store` propositalmente omitida das dependências do `useEffect` de hash sync — única forma de evitar o loop infinito hash ↔ store documentado no RESEARCH (armadilha 2)
- Sidebar responsiva com `hidden md:block` para marca e botão Sair — layout mobile simplificado (botão Sair no mobile será tratado na Phase 12 de polimento UX)
- Todos os tokens de cor via Tailwind (`bg-primary`, `text-white`, `border-primary-800`, `bg-gray-50`) — zero hex hardcoded, conforme constraint de CLAUDE.md e UI-SPEC

## Desvios do Plano

Nenhum — plano executado exatamente como especificado.

- Tasks 1 e 2 executadas conforme especificação sem desvios
- Checkpoint humano (Task 3) aprovado pelo usuário com todos os 11 passos verificados
- Nenhuma correção automática de bug necessária
- Nenhuma funcionalidade crítica ausente detectada
- Nenhum bloqueio encontrado

## Problemas Encontrados

Nenhum.

## Configuração Necessária pelo Usuário

Nenhuma — nenhuma configuração de serviço externo necessária neste plano.

## Prontidão para a Próxima Fase

**Phase 6 — Campos do Formulário (Torre 360) pode iniciar imediatamente.**

O shell de 10 abas está operacional: qualquer construtora logada que acesse `/form/:orgId` vê a estrutura navegável completa com sidebar, ProgressBar e hash sync. A Phase 6 sobrepõe o placeholder textual das abas com campos reais (RadioGroup, CheckboxGroup, Select, Textarea).

Pré-condições atendidas:
- `FormLayout` renderiza e passa `tenantId` (routeOrgId) para `TabNavigation` e `ProgressBar`
- Hash sync funciona em ambos os sentidos (clique ↔ popstate ↔ deep-link)
- Cross-tenant guard garante que `useFormStore` nunca é chamado com tenant alheio
- `npm run build` passa sem erros
- Todos os UATs de navegação da Phase 5 verificados manualmente

---
*Phase: 05-shell-do-formul-rio-navega-o-por-abas*
*Completed: 2026-05-22*
