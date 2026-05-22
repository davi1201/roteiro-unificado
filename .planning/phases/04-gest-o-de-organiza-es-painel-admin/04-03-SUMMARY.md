---
phase: 04-gest-o-de-organiza-es-painel-admin
plan: 03
subsystem: ui
tags: [admin, orgs, modal, react-hook-form, zod, mutation, tanstack-query]

# Dependency graph
requires:
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 01
    provides: Dialog primitive nativo com 6 sub-componentes, AdminLayout, router.tsx atualizado
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 02
    provides: useOrgs hook (queryKey ['orgs']), AdminDashboard com tabela e botão Nova Organização
provides:
  - Schema Zod createOrgSchema com validação name (trim + min) e cnpj (regex /^\d{14}$/) + tipo inferido CreateOrgFormData
  - CreateOrgModal autocontido (RHF + zodResolver + useMutation + invalidateQueries)
  - AdminDashboard wirificado: botão Nova Organização abre modal, modal cria org e refresca tabela sem reload
affects: [04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Schema Zod em arquivo separado (src/schemas/) para reutilização — não inline no componente"
    - "useMutation com onSuccess: invalidateQueries(['orgs']) + toast.success + reset() + onClose()"
    - "Cast as never para contornar limitação de tipagem Supabase em .from().insert() com schema manual"
    - "mode:onBlur no useForm — valida ao sair do campo, não durante digitação"
    - "autoFocus no primeiro campo do modal — foco automático sem useRef extra"

key-files:
  created:
    - roteiro-unificado/src/schemas/createOrg.ts
    - roteiro-unificado/src/components/admin/CreateOrgModal.tsx
  modified:
    - roteiro-unificado/src/pages/admin/AdminDashboard.tsx

key-decisions:
  - "Cast 'as never' no payload do insert: Supabase typed client resolve o argumento do .insert() como never[] quando o schema database.ts é escrito manualmente — mesmo padrão de cast já estabelecido em useOrgs.ts (Plan 02)"
  - "Tipo Database['public']['Tables']['orgs']['Insert'] declarado explicitamente antes do cast para garantir que o shape está correto antes de suprimir o erro de tipo"

# Metrics
duration: 3min
completed: 2026-05-22
---

# Phase 04 Plan 03: Modal de Criação de Organização — Summary

**Schema Zod createOrgSchema com validação pt-br de nome (obrigatório, trim) e CNPJ (14 dígitos numéricos), CreateOrgModal com RHF + zodResolver + useMutation + invalidateQueries, e AdminDashboard wirificado para abrir o modal via estado isCreateModalOpen.**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-22T18:15:27Z
- **Completed:** 2026-05-22T18:18:45Z
- **Tasks:** 3
- **Files modified:** 3

## Accomplishments

- Schema `createOrgSchema` em `src/schemas/createOrg.ts` — exporta schema Zod com `.trim().min(1)` no nome e `.regex(/^\d{14}$/)` no CNPJ, mais tipo inferido `CreateOrgFormData`
- `CreateOrgModal` autocontido: `useForm` com `zodResolver(createOrgSchema)` e `mode:'onBlur'`, `useMutation` que chama `supabase.from('orgs').insert()`, invalida query `['orgs']` no sucesso, exibe toast em pt-br, chama `reset()` e `onClose()` após sucesso
- `AdminDashboard` atualizado: import de `CreateOrgModal`, estado `isCreateModalOpen`, `handleNewOrg` substituído por `setIsCreateModalOpen(true)`, modal renderizado no JSX
- `npm run build` e `npm run lint` passam sem erros

## Task Commits

Cada task foi commitada atomicamente:

1. **Task 1: Criar schema Zod createOrgSchema** — `533dfde` (feat)
2. **Task 2: Criar CreateOrgModal com RHF + Zod + Supabase INSERT** — `b3702d3` (feat)
3. **Task 3: Wire AdminDashboard ao CreateOrgModal** — `fb498b7` (feat)

## Files Created/Modified

- `roteiro-unificado/src/schemas/createOrg.ts` — schema Zod com name (trim, min 1) e cnpj (regex /^\d{14}$/), mensagens pt-br, tipo `CreateOrgFormData` exportado
- `roteiro-unificado/src/components/admin/CreateOrgModal.tsx` — modal com RHF + zodResolver + useMutation; INSERT em orgs com active:true; invalidação + toast + reset + onClose no sucesso; autoFocus no nome, inputMode=numeric + maxLength=14 no CNPJ
- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — import CreateOrgModal, estado isCreateModalOpen, handleNewOrg → setIsCreateModalOpen(true), modal renderizado

## Decisions Made

- **Cast `as never` no Supabase insert:** O cliente Supabase tipado com schema manual resolve o argumento de `.from('orgs').insert()` como `never[]` — erro TS2353 `'name' does not exist in type 'never[]'`. Mesmo padrão de contorno já estabelecido em `useOrgs.ts` (Plan 02). Solução: declarar payload com o tipo explícito `Database['public']['Tables']['orgs']['Insert']` e então cast `as never` para suprimir o erro de tipo.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Erro TS2353 no payload de supabase.from('orgs').insert()**
- **Encontrado durante:** Task 2 — verificação type-check após criar CreateOrgModal
- **Problema:** O Supabase typed client com schema manual `database.ts` resolve o argumento de `.insert()` como `never[]`, causando `TS2353: Object literal may only specify known properties, and 'name' does not exist in type 'never[]'`
- **Correção:** Declarado `payload` com tipo explícito `Database['public']['Tables']['orgs']['Insert']`, depois cast `as never` no argumento do insert — mantém segurança de tipo no shape e suprime a incompatibilidade de tipo do cliente
- **Arquivos modificados:** `src/components/admin/CreateOrgModal.tsx`
- **Commit:** `b3702d3`

## Known Stubs

| Arquivo | Função | Conteúdo | Plano que resolverá |
|---------|--------|----------|---------------------|
| `src/pages/admin/AdminDashboard.tsx` | `handleArchive` | `toast.info('Funcionalidade disponível em breve')` | Plan 04-05 |

## Threat Flags

Nenhuma superfície nova além das modeladas no `<threat_model>` do PLAN.md.
- T-04-13 mitigado: `onError` usa mensagem genérica — erro cru do Supabase não exposto
- T-04-15 mitigado: `.trim().min(1)` no schema name rejeita strings whitespace-only
- T-04-16 mitigado: botão submit desabilitado via `isLoading={createOrgMutation.isPending}` durante submit

## Self-Check

Arquivos criados:
- `roteiro-unificado/src/schemas/createOrg.ts` — FOUND
- `roteiro-unificado/src/components/admin/CreateOrgModal.tsx` — FOUND
- `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` — FOUND (modificado)

Commits:
- `533dfde` — feat(04-03): criar schema Zod createOrgSchema
- `b3702d3` — feat(04-03): criar CreateOrgModal com RHF + Zod + Supabase INSERT
- `fb498b7` — feat(04-03): wire AdminDashboard ao CreateOrgModal via isCreateModalOpen

Build: `npm run build` — PASS (321 kB JS, 18 kB CSS)
Type-check: `npx tsc --noEmit` — PASS (exit 0)
Lint: `npm run lint` — PASS (0 errors, 1 warning pre-existente em button.tsx)

## Self-Check: PASSED

---
*Phase: 04-gest-o-de-organiza-es-painel-admin*
*Completed: 2026-05-22*
