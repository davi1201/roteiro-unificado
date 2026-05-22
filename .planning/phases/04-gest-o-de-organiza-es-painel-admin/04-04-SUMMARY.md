---
phase: 04-gest-o-de-organiza-es-painel-admin
plan: 04
subsystem: ui
tags: [admin, edge-function, members, supabase-functions, rls, deno, zod, react-query]

# Dependency graph
requires:
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 01
    provides: AdminLayout shell, OrgDetail stub com useParams, Dialog primitive, router.tsx atualizado
  - phase: 04-gest-o-de-organiza-es-painel-admin
    plan: 02
    provides: useOrgs hook (queryKey ['orgs']), OrgTable, AdminDashboard com listagem
provides:
  - Edge Function create-user (Deno runtime) com service_role isolado em Deno.env — nunca no cliente
  - addMemberSchema (Zod) com mensagens em pt-br para email e senha temporaria
  - useOrgDetail hook com 2 queries paralelas — queryKey ['orgs', orgId] + ['org_members', orgId]
  - MemberTable componente apresentacional com 3 colunas, Skeleton loading, empty state
  - AddMemberModal com fluxo 2-step: Edge Function invoke -> INSERT org_members
  - OrgDetail.tsx completo substituindo stub do Plan 01 — breadcrumb, header, card de membros, modal
affects: [04-05]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "Edge Function Deno com CORS preflight + validacao de input (email regex, UUID hex, password length)"
    - "2-step mutation: supabase.functions.invoke + supabase.from().insert para isolar service_role"
    - "Invalidacao dupla de queries apos mutacao bem-sucedida: ['org_members', orgId] + ['orgs']"
    - "Cast as unknown as never para compatibilidade de tipo Insert com schema manual (mesmo padrao de Plan 02)"
    - "Exibicao de user_id truncado (8 chars) — email completo deferred (requer view ou RPC em auth.users)"

key-files:
  created:
    - supabase/functions/create-user/index.ts
    - supabase/functions/create-user/deno.json
    - roteiro-unificado/src/schemas/addMember.ts
    - roteiro-unificado/src/features/admin/useOrgDetail.ts
    - roteiro-unificado/src/components/admin/MemberTable.tsx
    - roteiro-unificado/src/components/admin/AddMemberModal.tsx
  modified:
    - roteiro-unificado/src/pages/admin/OrgDetail.tsx

key-decisions:
  - "SERVICE_ROLE_KEY apenas em Deno.env da Edge Function — zero referencia em src/ do cliente (grep retorna 0)"
  - "Fluxo 2-step deliberado (D-01 + D-03): Edge Function cria auth user, cliente faz INSERT em org_members gateado por RLS is_admin()"
  - "Cast as unknown as never em INSERT org_members — schema manual nao infere tipo Insert corretamente com supabase-js v2.106.1 (mesmo padrao de useOrgs.ts em Plan 02)"
  - "MemberTable mostra user_id truncado — email completo requer view ou RPC em schema auth.users, deferred para fase futura"

requirements-completed: [ORG-03]

# Metrics
duration: 6min
completed: 2026-05-22
---

# Phase 04 Plan 04: Pagina de Detalhe da Org e Adicao de Membro via Edge Function — Summary

**Edge Function create-user (Deno runtime, service_role isolado em Deno.env), schema addMemberSchema (Zod, mensagens pt-br), hook useOrgDetail (2 queries paralelas), MemberTable apresentacional, AddMemberModal com fluxo 2-step seguro e OrgDetail.tsx completo substituindo stub do Plan 01.**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-22T18:16:04Z
- **Completed:** 2026-05-22T18:22:29Z
- **Tasks:** 4
- **Files modified:** 7

## Accomplishments

- Edge Function `supabase/functions/create-user/index.ts` com Deno.serve, CORS preflight, validacao de email/password/org_id, `auth.admin.createUser({ email_confirm: true })` — service_role nunca exposta ao cliente
- Schema `addMemberSchema` com mensagens em pt-br: "Insira um email valido" e "Senha deve ter no minimo 8 caracteres"
- Hook `useOrgDetail(orgId)` com 2 useQuery paralelos: `['orgs', orgId]` e `['org_members', orgId]`, ambos com `enabled: !!orgId` e `.single<Tables<'orgs'>>()`
- `MemberTable` apresentacional: 3 colunas (Usuario/Role/Adicionado em), Skeleton loading, empty state sem CTA duplicado, badges admin (primary-100) e company (gray-100)
- `AddMemberModal`: RHF + zodResolver + addMemberSchema, mutacao 2-step (Edge Function -> INSERT org_members), invalidacao dupla de queries, toasts especificos por erro
- `OrgDetail.tsx` substituindo stub: breadcrumb com aria-label, header org/status, card de membros com count, botao "Convidar Membro" disabled quando !org.active, modal controlado por useState

## Task Commits

1. **Task 1: Criar Edge Function create-user** - `fde0173` (feat)
2. **Task 2: Criar schema addMemberSchema + hook useOrgDetail** - `24ebc90` (feat)
3. **Task 3: Criar MemberTable + AddMemberModal** - `1a0c24d` (feat)
4. **Task 4: Popular OrgDetail.tsx substituindo stub** - `3ccf81b` (feat)

## Files Created/Modified

- `supabase/functions/create-user/index.ts` — Edge Function Deno com Deno.serve, CORS, validacao de input, adminClient com service_role, retorno { user_id } ou { error }
- `supabase/functions/create-user/deno.json` — import map para esm.sh/@supabase/supabase-js@2
- `roteiro-unificado/src/schemas/addMember.ts` — addMemberSchema Zod + type AddMemberFormData
- `roteiro-unificado/src/features/admin/useOrgDetail.ts` — hook com 2 useQuery tipados, queryKeys canonicas para invalidacao
- `roteiro-unificado/src/components/admin/MemberTable.tsx` — componente puro, 3 colunas, Skeleton, empty state
- `roteiro-unificado/src/components/admin/AddMemberModal.tsx` — modal RHF + fluxo 2-step Edge Function + INSERT
- `roteiro-unificado/src/pages/admin/OrgDetail.tsx` — pagina completa substituindo stub do Plan 01

## Decisions Made

- **Fluxo 2-step (D-01 + D-03):** Edge Function cria o auth user com service_role (nunca exposta ao browser). Cliente faz INSERT em org_members com o user_id retornado — gateado por RLS `is_admin()`. Esta separacao e obrigatoria por seguranca.
- **Cast as unknown as never em INSERT:** O schema `database.ts` e escrito manualmente e nao infere corretamente o tipo Insert de `org_members` com supabase-js v2.106.1. Cast aplicado como solucao pragmatica, removivel quando tipos forem gerados via `supabase gen types`.
- **user_id truncado em MemberTable:** Email completo dos usuarios esta em `auth.users` (schema separado). Exibir email requer view ou RPC — deferred para fase futura. UUID truncado (8 chars) e suficiente para o piloto.
- **`--no-verify-jwt` na Edge Function (instrucao de deploy):** Para piloto interno, aceitavel. INSERT em org_members ainda e gateado por RLS. Risco residual documentado no threat_model (T-04-19).

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Erro de tipo TS2353 em AddMemberModal.tsx — INSERT org_members**
- **Encontrado durante:** Task 3 — verificacao type-check
- **Problema:** `supabase.from('org_members').insert({ org_id, user_id, role })` retornava erro TS2353 com tipo `never[]` — schema manual nao declara a relacao Insert corretamente para inferencia do supabase-js v2.106.1.
- **Correcao:** Cast `as unknown as never` na chamada insert — mesmo padrao estabelecido no Plan 02 para `org_members(count)`.
- **Arquivos modificados:** `src/components/admin/AddMemberModal.tsx`
- **Commit:** `1a0c24d`

**2. [Operacional] Symlink node_modules ausente no worktree**
- **Encontrado durante:** Inicio da execucao
- **Problema:** O worktree nao tinha `node_modules/` proprio.
- **Correcao:** Criado symlink `roteiro-unificado/node_modules -> main_repo/roteiro-unificado/node_modules` (mesmo procedimento dos Plans 01 e 02).
- **Commit:** nao commitado (symlink nao rastreado pelo git)

## Known Stubs

| Arquivo | Funcao | Conteudo | Plano que resolverá |
|---------|--------|----------|---------------------|
| `src/pages/admin/OrgDetail.tsx` | Botao Arquivar | comentario "Botao Arquivar sera wired no Plan 05" | Plan 04-05 |

O objetivo deste plano (detalhe completo da org com adicao de membro) e alcancado. O botao Arquivar e intencionalmente deixado para o Plan 05.

## Threat Flags

Nenhuma superficie nova alem das modeladas no `<threat_model>` do PLAN.md (T-04-17 a T-04-25). Todos os mitigates do threat register foram implementados:

- T-04-17 (SERVICE_ROLE_KEY no cliente): `grep -rc "SUPABASE_SERVICE_ROLE_KEY" roteiro-unificado/src` retorna 0 em todos os arquivos
- T-04-18 (payload invalido na Edge Function): validacao de email regex, password length >= 8, org_id UUID hex
- T-04-20 (vazamento de error.message): AddMemberModal nao expoe mensagem crua — exibe texto especifico ao usuario

## Self-Check

Arquivos criados/modificados:
- `supabase/functions/create-user/index.ts` — FOUND
- `supabase/functions/create-user/deno.json` — FOUND
- `roteiro-unificado/src/schemas/addMember.ts` — FOUND
- `roteiro-unificado/src/features/admin/useOrgDetail.ts` — FOUND
- `roteiro-unificado/src/components/admin/MemberTable.tsx` — FOUND
- `roteiro-unificado/src/components/admin/AddMemberModal.tsx` — FOUND
- `roteiro-unificado/src/pages/admin/OrgDetail.tsx` — FOUND (reescrito)

Commits:
- `fde0173` — FOUND (feat Edge Function create-user)
- `24ebc90` — FOUND (feat schema + hook)
- `1a0c24d` — FOUND (feat MemberTable + AddMemberModal)
- `3ccf81b` — FOUND (feat OrgDetail populado)

Criterio critico de seguranca: `grep -rc "SUPABASE_SERVICE_ROLE_KEY" roteiro-unificado/src` — retorna 0 em todos os arquivos: PASS

## Self-Check: PASSED

---
*Phase: 04-gest-o-de-organiza-es-painel-admin*
*Completed: 2026-05-22*
