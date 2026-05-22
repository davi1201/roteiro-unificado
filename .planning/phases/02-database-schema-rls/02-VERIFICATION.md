---
phase: 02-database-schema-rls
verified: 2026-05-22T00:00:00Z
status: human_needed
score: 8/9 must-haves verified
overrides_applied: 0
re_verification: false
human_verification:
  - test: "Verificar isolamento RLS: empresa1 vê somente seus próprios assessments"
    expected: "SELECT em public.assessments como empresa1 retorna 1 linha (seu draft); SELECT como admin retorna todas as linhas"
    why_human: "RLS só pode ser testado contra o banco remoto com usuário autenticado real; grep não pode simular eval de policy em tempo de execução"
  - test: "Verificar login dos usuários de seed"
    expected: "admin@suaequipe.ia / Admin@123 e empresa1@teste.com / Empresa@123 retornam sessão válida (não null) via Supabase Auth"
    why_human: "Requer chamada a supabase.auth.signInWithPassword() contra projeto remoto"
  - test: "Confirmar dados de seed no banco remoto"
    expected: "Table Editor mostra: orgs (2 linhas), org_members (2 linhas), assessments (1 linha draft)"
    why_human: "Só confirmável via Supabase Dashboard ou CLI inspecionando banco remoto"
  - test: "INSERT em assessment com org_id de outra org falha via RLS"
    expected: "INSERT retorna erro ou 0 rows afetados quando org_id não pertence ao user autenticado"
    why_human: "Requer teste com cliente autenticado real contra banco remoto"
---

# Phase 2: Database Schema & RLS — Verification Report

**Phase Goal:** Banco de dados Supabase com todas as tabelas necessárias, enums, foreign keys e políticas RLS que garantem isolamento total entre organizações.
**Verified:** 2026-05-22
**Status:** human_needed
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Diretório supabase/ existe com config.toml e 8 migrations | VERIFIED | `ls supabase/migrations/*.sql` returns 8 files; `supabase/config.toml` exists |
| 2 | Tabelas orgs, org_members, assessments existem com colunas, FKs e constraints corretas | VERIFIED | `20260522000002_create_tables.sql` — UNIQUE(user_id) ORG-02, form_data JSONB sem CHECK (D-03), readiness_level_mgmt/tech como colunas diretas (D-04), active BOOLEAN (Phase 4) |
| 3 | RLS habilitado nas 3 tabelas | VERIFIED | `20260522000004_enable_rls.sql` — 3 ALTER TABLE ENABLE ROW LEVEL SECURITY |
| 4 | is_admin() e is_org_member() com SECURITY DEFINER e SET search_path = '' | VERIFIED | `20260522000005_rls_helper_functions.sql` — ambas as funções nas linhas 18/37 com SECURITY DEFINER e linhas 19/38 com SET search_path = '' |
| 5 | Todas as policies USING/WITH CHECK usam (SELECT auth.uid()) — sem bare auth.uid() | VERIFIED | Grep confirms wrapper em todos os 4 arquivos de policy; linha 21 em 007 é `OR user_id = (SELECT auth.uid())` — wrapper presente |
| 6 | Policy de UPDATE em assessments restringe company a status='draft' (append-only) | VERIFIED | `assessments_update_draft` tem `AND status = 'draft'` em USING (linha 43) e WITH CHECK (linha 47); sem DELETE policy |
| 7 | database.ts exporta Database completa (Row/Insert/Update por tabela, enums, funções) | VERIFIED | 3 tabelas, 2 enums com referência cruzada Database['public']['Enums'][*], is_admin e is_org_member tipados; `tsc --noEmit` exit 0 |
| 8 | supabase.ts usa createClient<Database> — wiring TypeScript confirmado | VERIFIED | `grep "createClient<Database>" src/lib/supabase.ts` — encontrado |
| 9 | Schema e seed aplicados ao banco remoto; dados visíveis (2 orgs, 2 membros, 1 assessment) | UNCERTAIN | SUMMARY-03 documenta `supabase db push` e `supabase db push --include-seed` completos com migration list confirmado; não verificável programaticamente sem acesso ao banco remoto |

**Score:** 8/9 truths verified (1 uncertain — requer verificação humana do estado remoto)

---

### Deferred Items

None — todos os itens desta fase estão dentro de escopo de Phase 2.

---

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `supabase/config.toml` | Supabase CLI init | VERIFIED | Existe |
| `supabase/migrations/20260522000001_create_enums.sql` | member_role + assessment_status enums | VERIFIED | 2 CREATE TYPE no schema public |
| `supabase/migrations/20260522000002_create_tables.sql` | orgs, org_members, assessments com FKs | VERIFIED | Todas as colunas, UNIQUE(user_id), JSONB sem CHECK, colunas de readiness |
| `supabase/migrations/20260522000003_create_indexes.sql` | 7 índices para membership, dashboard, histórico | VERIFIED | Exatamente 7 CREATE INDEX |
| `supabase/migrations/20260522000004_enable_rls.sql` | ENABLE ROW LEVEL SECURITY nas 3 tabelas | VERIFIED | 3 ALTER TABLE |
| `supabase/migrations/20260522000005_rls_helper_functions.sql` | is_admin() + is_org_member() SECURITY DEFINER | VERIFIED | 2 funções com SECURITY DEFINER + SET search_path = '' + (SELECT auth.uid()) |
| `supabase/migrations/20260522000006_rls_policies_orgs.sql` | 3 policies em orgs (sem DELETE) | VERIFIED | SELECT/INSERT/UPDATE; sem DELETE policy |
| `supabase/migrations/20260522000007_rls_policies_org_members.sql` | 4 policies em org_members | VERIFIED | SELECT/INSERT/UPDATE/DELETE |
| `supabase/migrations/20260522000008_rls_policies_assessments.sql` | 4 policies em assessments (sem DELETE, draft-only UPDATE para company) | VERIFIED | select, insert, update_draft (status='draft'), update_admin; sem DELETE |
| `supabase/seed.sql` | 2 usuários, 2 orgs, 2 memberships, 1 assessment draft | VERIFIED | auth.users×2, auth.identities×2, orgs×1(multi-values), org_members×1, assessments×1; crypt() com extensions. prefix |
| `roteiro-unificado/src/types/database.ts` | Database interface completa com 3 tabelas, 2 enums, 2 funções | VERIFIED | Row/Insert/Update por tabela; enums com referência cruzada; tsc exit 0 |

---

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `roteiro-unificado/src/lib/supabase.ts` | `roteiro-unificado/src/types/database.ts` | `createClient<Database>` | WIRED | Confirmed via grep |
| `20260522000002_create_tables.sql` | `20260522000001_create_enums.sql` | `public.member_role`, `public.assessment_status` | WIRED | Tipos referenciados nas colunas role e status |
| `20260522000006_rls_policies_orgs.sql` | `20260522000005_rls_helper_functions.sql` | `(SELECT public.is_admin())`, `(SELECT public.is_org_member(id))` | WIRED | Ambas as funções referenciadas |
| `20260522000007_rls_policies_org_members.sql` | `20260522000005_rls_helper_functions.sql` | `(SELECT public.is_admin())`, `(SELECT auth.uid())` | WIRED | Função e wrapper direto presentes |
| `20260522000008_rls_policies_assessments.sql` | `20260522000005_rls_helper_functions.sql` | `(SELECT public.is_admin())`, `(SELECT public.is_org_member(org_id))` | WIRED | Ambas as funções referenciadas |
| `supabase/seed.sql` | `20260522000002_create_tables.sql` | `INSERT INTO public.orgs`, `INSERT INTO public.org_members`, `INSERT INTO public.assessments` | WIRED | 3 INSERT statements presentes com colunas corretas |

---

### Data-Flow Trace (Level 4)

Not applicable — this phase delivers SQL migrations and TypeScript types, not UI components or API routes with dynamic data rendering.

---

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| TypeScript compila contra database.ts sem erros | `cd roteiro-unificado && npx tsc --noEmit` | Exit 0 | PASS |
| 8 migration files existem | `ls supabase/migrations/*.sql \| wc -l` | 8 | PASS |
| form_data não tem CHECK constraint | `grep "form_data" 20260522000002_create_tables.sql` | Linha sem CHECK | PASS |
| is_admin() usa SECURITY DEFINER + SET search_path = '' | `grep -n "^SECURITY DEFINER\|^SET search_path" 20260522000005*.sql` | 2+2 linhas | PASS |
| assessments UPDATE draft-only: status='draft' em USING e WITH CHECK | `grep -c "status = 'draft'" 20260522000008*.sql` | 2 | PASS |
| Seed tem auth.identities pareados (prevenção Pitfall 1) | `grep -c "INSERT INTO auth.identities" seed.sql` | 2 | PASS |

---

### Probe Execution

Step 7c: SKIPPED — esta fase não define probes em `scripts/*/tests/probe-*.sh`. Verificação programável coberta nos Behavioral Spot-Checks acima.

---

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|-------------|-------------|--------|----------|
| ORG-01 | 02-01, 02-02, 02-03 | Cada construtora é uma organização isolada por RLS no Supabase | SATISFIED | Tabela `orgs` criada; RLS habilitado; policies de SELECT em todas as tabelas garantem isolamento por org |
| ORG-02 | 02-01 | Usuário pertence a exatamente uma org via tabela org_members | SATISFIED | `UNIQUE (user_id)` em `org_members` — constraint DB-level; policy INSERT em org_members restrita a admin |
| ORG-04 | 02-02 | RLS garante que consultas de uma org nunca retornam dados de outra | SATISFIED (local) / NEEDS HUMAN (remote) | Policies existem e são substantivas; isolamento real só verificável contra banco remoto com usuário autenticado |

---

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| — | — | — | — | Nenhum anti-pattern encontrado |

**Scans executados:**
- TBD/FIXME/XXX em todos os arquivos de migration e database.ts: nenhum encontrado
- placeholder/not implemented: nenhum encontrado
- return null/return {}/return [] em database.ts: nenhum encontrado (padrão `[_ in never]: never` em Views e CompositeTypes é estrutural correto, não stub)
- Bare `auth.uid()` sem wrapper em policies: nenhum encontrado — todos usam `(SELECT auth.uid())`

**Nota sobre SECURITY DEFINER count:** O grep inicial retornou 5 porque inclui 3 ocorrências em comentários (linhas 3, 7, 8) + 2 em declarações reais (linhas 18, 37). Verificação com `grep -n "^SECURITY DEFINER"` confirma 2 declarações reais — correto.

---

### Human Verification Required

#### 1. Isolamento RLS — empresa1 vs. admin

**Test:** No Supabase Dashboard SQL Editor, executar:
```sql
-- Pegar UUID de empresa1:
SELECT id FROM auth.users WHERE email = 'empresa1@teste.com';

-- Simular perspectiva de empresa1:
SET LOCAL role = 'authenticated';
SET LOCAL "request.jwt.claim.sub" = '<UUID_empresa1>';
SELECT count(*) FROM public.assessments;  -- esperado: 1
SELECT count(*) FROM public.orgs;         -- esperado: 1

-- Simular perspectiva de admin:
SET LOCAL "request.jwt.claim.sub" = '<UUID_admin>';
SELECT count(*) FROM public.orgs;         -- esperado: 2
SELECT count(*) FROM public.assessments;  -- esperado: 1
```
**Expected:** empresa1 vê somente seus dados; admin vê tudo
**Why human:** RLS é avaliado em tempo de execução pelo PostgreSQL; grep no SQL da policy não prova que a avaliação real isola corretamente

#### 2. Login dos usuários de seed funciona

**Test:** Via app ou chamada direta a `supabase.auth.signInWithPassword({ email: 'admin@suaequipe.ia', password: 'Admin@123' })` e idem para `empresa1@teste.com / Empresa@123`
**Expected:** Ambos retornam sessão válida (session não null) — auth.identities pareados corretamente
**Why human:** Requer chamada HTTP ao Supabase Auth do projeto remoto; não testável via grep

#### 3. Confirmar estado do banco remoto via Dashboard

**Test:** Abrir Supabase Dashboard → Table Editor
- `orgs`: 2 linhas (SuaEquipe.IA Admin + Construtora Teste 1)
- `org_members`: 2 linhas (admin role + company role)
- `assessments`: 1 linha (status='draft', version=1)
- Dashboard → Authentication → Users: 2 usuários listados
**Expected:** Todas as contagens acima batem
**Why human:** Não há acesso programático ao banco remoto neste ambiente de verificação

#### 4. INSERT com org_id inválido rejeitado por RLS

**Test:** Autenticado como empresa1, tentar `INSERT INTO public.assessments (org_id, ...) VALUES ('<org_id_de_outra_org>', ...)`
**Expected:** Operação retorna 0 rows ou erro; nenhuma linha criada na org incorreta
**Why human:** Requer autenticação real e banco remoto com seed

---

### Gaps Summary

Nenhum gap bloqueador identificado. Todos os artefatos locais estão completos, substantivos e devidamente conectados. O único item pendente é a confirmação do estado do banco remoto (Truth 9) — documentado pelo SUMMARY-03 como aplicado com sucesso via `supabase db push`, mas requer verificação humana para fechar formalmente.

Os 4 UAT items do ROADMAP Phase 2 que envolvem comportamento runtime (RLS isolation, login) estão na lista de Human Verification Required.

---

## Detailed Findings per Verification Check

### ORG-01: Org isolation via RLS

- `public.orgs` tabela: EXISTS, substantive (id, name, cnpj, active, created_at com constraints corretas)
- RLS enabled: `ALTER TABLE public.orgs ENABLE ROW LEVEL SECURITY` — linha 8 de 000004
- SELECT policy: `is_org_member(id)` garante que company vê somente sua org
- Admin bypass: `is_admin()` em todas as policies de SELECT
- Status: VERIFIED (local) — confirmed in code

### ORG-02: UNIQUE(user_id) enforcement

- `UNIQUE (user_id)` presente na linha 22 de `20260522000002_create_tables.sql`
- INSERT/UPDATE em `org_members` restritos a `is_admin()` — company não pode se auto-adicionar a outra org
- Status: VERIFIED

### ORG-04: RLS total isolation

- Helper functions `is_admin()` e `is_org_member()` com SECURITY DEFINER garantem que as policies não podem ser bypassadas via search_path attack
- `(SELECT auth.uid())` wrapper garante caching e elimina timing attacks por-row
- `assessments_update_draft` com `status = 'draft'` em BOTH USING e WITH CHECK garante append-only
- Ausência de DELETE policy em `orgs` e `assessments` garante soft-delete e imutabilidade de histórico
- Status: VERIFIED (code) / UNCERTAIN (runtime) — ver Human Verification

### D-03: form_data sem CHECK constraint

- `form_data JSONB NOT NULL DEFAULT '{}'` — sem nenhuma constraint CHECK na linha
- Validação delegada ao Zod no frontend (FORM-03 em Phase 7)
- Status: VERIFIED

### D-04: readiness_level_mgmt e readiness_level_tech como colunas diretas

- `readiness_level_mgmt VARCHAR(10)` — linha 32 de 000002
- `readiness_level_tech VARCHAR(100)` — linha 33 de 000002
- Ambas indexadas em 000003 para suporte a filtros DASH-05
- Status: VERIFIED

---

_Verified: 2026-05-22_
_Verifier: Claude (gsd-verifier)_
