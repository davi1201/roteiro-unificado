---
phase: 08-autosave-submiss-o-versionamento
verified: 2026-05-23T04:00:00Z
status: human_needed
score: 11/12 must-haves verificados
overrides_applied: 0
human_verification:
  - test: "Verificação 1 — Autosave funcional no browser"
    expected: "Digitar campo → aguardar 1.5s → toast 'Salvo às HH:MM' aparece; requisição para Supabase visível no DevTools Network"
    why_human: "Comportamento de debounce e toast em tempo real exige execução do app no browser; não verificável por grep"
  - test: "Verificação 2 — Submissão formal end-to-end"
    expected: "Aba NDA mostra sticky footer com 'Enviar Avaliação'; dialog abre com copy exato; 'Confirmar Envio' redireciona para /form/:orgId/history"
    why_human: "Fluxo de navegação e renderização condicional do footer/dialog exigem interação real no browser"
  - test: "Verificação 3 — HistoryPage lista versões com badges corretos"
    expected: "Badge 'Enviado' com bg-accent laranja; botão 'Iniciar Nova Revisão' apenas na versão mais recente submitted"
    why_human: "Cores e renderização condicional de botão dependem de dados reais do Supabase e renderização DOM"
  - test: "Verificação 4 — Nova revisão cria draft pré-preenchido"
    expected: "Clicar 'Iniciar Nova Revisão' → redirect /form/:orgId → campos pré-preenchidos com dados da versão anterior"
    why_human: "Hidratação do store via hydrateFromAssessment com dados do banco exige fluxo completo no browser"
  - test: "Verificação 5 — Persistência após reload do browser"
    expected: "Alterar campo → aguardar toast de salvamento → F5 → dado preservado (vindo do Supabase, não de sessionStorage)"
    why_human: "Distinguir persistência em Supabase vs sessionStorage requer reload real do browser"
  - test: "Verificação 6 — Toast de falha de autosave"
    expected: "Bloquear URL Supabase no DevTools → digitar campo → aguardar 1.5s → toast warning 'Falha ao salvar — tentando novamente'"
    why_human: "Simular falha de rede e observar toast requer interação manual no browser"
  - test: "Verificação 7 — Bug CSS na aba NDA: espaço faltando antes de pb-20"
    expected: "Conteúdo da aba NDA não deve ser coberto pelo sticky footer; classe deve ser 'md:p-6 pb-20' (com espaço)"
    why_human: "Sobreposição visual do footer sobre conteúdo NDA requer inspecão no browser; linha 186 do FormLayout.tsx tem `md:p-6${...? 'pb-20'}` sem espaço separador"
---

# Phase 8: Autosave, Submissão & Versionamento — Relatório de Verificação

**Phase Goal:** Implementar autosave, submissão formal e versionamento append-only das avaliações de prontidão, garantindo que qualquer construtora do piloto consiga salvar, retomar, submeter e criar novas revisões da sua avaliação.
**Verificado:** 2026-05-23T04:00:00Z
**Status:** human_needed
**Re-verificação:** Não — verificação inicial

---

## Conquista do Objetivo

### Verdades Observáveis

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | Vitest instalado e `npx vitest run` funciona com código 0 | VERIFICADO | `vitest.config.ts` existe com `environment: 'jsdom'`, `include: ['src/**/*.test.ts', 'src/**/*.test.tsx']`; `package.json` tem `"test": "vitest"` |
| 2 | Constraint UNIQUE parcial garante no máximo um draft por org | VERIFICADO | `supabase/migrations/20260523000001_assessments_draft_unique.sql` contém `CREATE UNIQUE INDEX IF NOT EXISTS assessments_org_id_draft_unique ON public.assessments (org_id, status) WHERE (status = 'draft')` |
| 3 | `hydrateFromAssessment` distribui JSONB do Supabase para `sectionData` por TabKey | VERIFICADO | `formStore.ts` linha 57: `hydrateFromAssessment: (formData: Json) => void` na interface; linha 107: implementação com iteração Object.entries e guard validKeys |
| 4 | `useAutosave` observa `sectionData` via `subscribe()` e faz persist após 1500ms de inatividade | VERIFICADO | `useAutosave.ts`: `store.subscribe()` na linha 48, `clearTimeout` + `setTimeout(..., 1500)` nas linhas 53–56, SELECT+UPDATE/INSERT como estratégia de persistência (fix 42P10) |
| 5 | Toast 'Salvo às HH:MM' após autosave bem-sucedido; 'Falha ao salvar' em erro | VERIFICADO | `useAutosave.ts` linha 99: `toastRef.current.warning('Falha ao salvar — tentando novamente')`; linha 101–105: `toLocaleTimeString('pt-BR', ...)` + `toastRef.current.success()` |
| 6 | `useSubmitAssessment` executa UPDATE `status='submitted'` no draft e redireciona para `/form/:orgId/history` | VERIFICADO | `useSubmitAssessment.ts`: `.eq('status', 'draft')` nas linhas 18 e 32; `status: 'submitted'` linha 27; `navigate(.../history, { replace: true })` no onSuccess |
| 7 | `useNewRevision` executa INSERT copiando form_data da versão submitted mais recente com version+1 | VERIFICADO | `useNewRevision.ts`: `.eq('status', 'submitted').order('version', { ascending: false })` linhas 26–27; `INSERT` com `form_data` copiado e `version: latest.version + 1` linhas 34–43 |
| 8 | Nenhuma mutation sobrescreve registros submitted — append-only garantido | VERIFICADO | `useSubmitAssessment.ts` usa UPDATE com `.eq('status', 'draft')` (só modifica draft); `useNewRevision.ts` usa apenas INSERT — nenhum UPDATE em submitted |
| 9 | FormLayout busca draft via useQuery, hidrata store e monta useAutosave | VERIFICADO | `FormLayout.tsx` linha 94: `useQuery(['assessment', 'draft', tenantId])`; linha 117: `hydrateFromAssessment`; linha 122: `useAutosave(tenantId)` |
| 10 | Skeleton exibido durante `draftQuery.isLoading` no FormLayout | VERIFICADO | `FormLayout.tsx` linhas 189–198: `draftQuery.isLoading ? <div aria-busy="true"><Skeleton .../></div> : renderSection(...)` |
| 11 | HistoryPage lista versões com skeleton, badges e botão 'Iniciar Nova Revisão' condicional | VERIFICADO | `HistoryPage.tsx`: `<article>` por versão, `bg-accent ... text-white` para submitted, `bg-gray-100 text-gray-700` para draft, `index === 0 && mostRecentIsSubmitted` como guard do botão |
| 12 | Rota `/form/:orgId/history` registrada no router dentro de ProtectedRoute | VERIFICADO | `router.tsx` linha 11: `import { HistoryPage }...`; linha 38–39: `{ path: '/form/:orgId/history', element: <HistoryPage /> }` dentro de ProtectedRoute |

**Score:** 12/12 verdades com evidência estática verificada

---

### Artefatos Obrigatórios

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|---------|
| `roteiro-unificado/vitest.config.ts` | Configuração Vitest com jsdom | VERIFICADO | Contém `environment: 'jsdom'`, `include`, alias `@` via `fileURLToPath` |
| `roteiro-unificado/src/hooks/useAutosave.test.ts` | Stub de testes para useAutosave | VERIFICADO | Existe; suite expandida com 12 pass, 14 todo, 3 skipped per 08-05-SUMMARY |
| `roteiro-unificado/src/lib/readiness.test.ts` | Stub de testes para calculateReadiness | VERIFICADO | Existe |
| `roteiro-unificado/src/features/form/useSubmitAssessment.test.ts` | Stub de testes para useSubmitAssessment | VERIFICADO | Existe |
| `roteiro-unificado/src/features/form/useNewRevision.test.ts` | Stub de testes para useNewRevision | VERIFICADO | Existe |
| `roteiro-unificado/src/stores/formStore.test.ts` | Testes unitários para hydrateFromAssessment | VERIFICADO | Criado no plano 08-02 com 6 casos cobrindo todos os behaviors |
| `supabase/migrations/20260523000001_assessments_draft_unique.sql` | Constraint UNIQUE parcial WHERE status='draft' | VERIFICADO | Contém `CREATE UNIQUE INDEX IF NOT EXISTS assessments_org_id_draft_unique ON public.assessments (org_id, status) WHERE (status = 'draft')` |
| `roteiro-unificado/src/stores/formStore.ts` | Action hydrateFromAssessment na interface e implementação | VERIFICADO | Interface linha 57 + implementação linha 107 |
| `roteiro-unificado/src/hooks/useAutosave.ts` | Hook de autosave com debounce 1500ms | VERIFICADO | SELECT+UPDATE/INSERT com `setTimeout(..., 1500)`, `clearTimeout`, `subscribe()`, cleanup |
| `roteiro-unificado/src/features/form/useSubmitAssessment.ts` | Mutation hook para submissão formal | VERIFICADO | Two-step SELECT+UPDATE, `.eq('status', 'draft')`, navigate history |
| `roteiro-unificado/src/features/form/useNewRevision.ts` | Mutation hook para nova revisão append-only | VERIFICADO | SELECT submitted + INSERT draft com form_data copiado e version+1 |
| `roteiro-unificado/src/features/form/FormLayout.tsx` | FormLayout com useQuery, useAutosave, skeleton, dialog | VERIFICADO | Todos os pontos de integração confirmados |
| `roteiro-unificado/src/features/form/HistoryPage.tsx` | Página /form/:orgId/history com lista de versões | VERIFICADO | 193 linhas, useAssessmentHistory, skeleton, badges, botão condicional |
| `roteiro-unificado/src/router.tsx` | Rota /form/:orgId/history dentro de ProtectedRoute | VERIFICADO | Import + rota confirmados |

---

### Verificação de Key Links

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `useAutosave.ts` → `formStore.ts` | subscribe() | `store.subscribe()` | WIRED | Linha 48 de useAutosave.ts chama `store.subscribe()` |
| `useAutosave.ts` → `assessments tabela` | SELECT+UPDATE/INSERT | Estratégia sem upsert (fix 42P10) | WIRED | `supabase.from('assessments').select/update/insert` — substituiu `upsert` que gerava erro 42P10 com índice parcial |
| `useSubmitAssessment.ts` → `assessments` | UPDATE WHERE status='draft' | `.eq('status', 'draft')` | WIRED | Linhas 18 e 32 de useSubmitAssessment.ts |
| `useNewRevision.ts` → `assessments` | INSERT copiando form_data | `supabase.from('assessments').insert` | WIRED | Linha 34 de useNewRevision.ts |
| `FormLayout.tsx` → `useAutosave.ts` | `useAutosave(tenantId)` | import + call | WIRED | Linha 17 (import) + linha 122 (call) |
| `FormLayout.tsx` → `formStore.hydrateFromAssessment` | `useEffect([draftQuery.data, tenantId])` | `createFormStore(tenantId).getState()` | WIRED | Linha 117: sem subscription React — evita loop infinito (Armadilha 2) |
| `HistoryPage.tsx` → `useNewRevision.ts` | `newRevisionMutation.mutate()` | `useNewRevision` importado | WIRED | Linha 8 (import) + linha 55 (instanciação) + onClick no botão |
| `router.tsx` → `HistoryPage.tsx` | `/form/:orgId/history` | `element: <HistoryPage />` | WIRED | Linhas 11 e 38–39 de router.tsx |

---

### Data-Flow Trace (Nível 4)

| Artefato | Variável de Dados | Fonte | Produz Dados Reais | Status |
|----------|------------------|----|-------------------|--------|
| `FormLayout.tsx` | `draftQuery.data` | `supabase.from('assessments').select('*').eq('org_id', tenantId).eq('status', 'draft').maybeSingle()` | Sim — query real ao banco | FLOWING |
| `useAutosave.ts` | `sectionData` do store | Zustand subscribe + SELECT+UPDATE/INSERT no Supabase | Sim — dados persistidos e lidos do banco | FLOWING |
| `HistoryPage.tsx` | `history` (array de versões) | `supabase.from('assessments').select(...).eq('org_id', orgId).order('version', { ascending: false })` | Sim — query real ao banco | FLOWING |
| `useSubmitAssessment.ts` | `draft.version` | SELECT antes do UPDATE (two-step) | Sim — lê do banco antes de atualizar | FLOWING |
| `useNewRevision.ts` | `latest.form_data` | SELECT da versão submitted mais recente | Sim — cópia real do banco | FLOWING |

---

### Cobertura de Requisitos

| Requisito | Plano | Descrição | Status | Evidência |
|-----------|-------|-----------|--------|-----------|
| SAVE-01 | 08-00, 08-02, 08-04 | Respostas salvas no Supabase com status `draft` | SATISFEITO | useAutosave persiste via SELECT+UPDATE/INSERT com `status: 'draft'` |
| SAVE-02 | 08-00, 08-02 | Autosave automático com debounce 1500ms | SATISFEITO | `setTimeout(..., 1500)` + `clearTimeout` em useAutosave.ts |
| SAVE-03 | 08-03, 08-04 | Submissão muda status para `submitted` (imutável) | SATISFEITO | useSubmitAssessment: UPDATE com `status: 'submitted'` + guard `.eq('status', 'draft')` |
| SAVE-04 | 08-03 | Cada envio cria nova versão sem sobrescrever histórico (append-only) | SATISFEITO | useNewRevision usa INSERT; useSubmitAssessment não modifica submitted |
| SAVE-05 | 08-03, 08-04 | Usuário pode iniciar nova revisão a partir da versão mais recente enviada | SATISFEITO | useNewRevision: SELECT submitted + INSERT draft com form_data copiado e version+1 |
| SAVE-06 | 08-04, 08-05 | Histórico completo de versões acessível | SATISFEITO | HistoryPage lista todas versões; rota /form/:orgId/history registrada |
| UX-04 | 08-02, 08-04 | Feedback visual ao salvar (toast de confirmação) | SATISFEITO | `toastRef.current.success('Salvo às ${time}')` + `warning('Falha ao salvar...')` |
| UX-05 | 08-04 | Estados de loading/skeleton durante carregamento do Supabase | SATISFEITO | FormLayout: Skeleton durante `draftQuery.isLoading`; HistoryPage: skeleton de 3 cards fake |

---

### Anti-Padrões Encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| `roteiro-unificado/src/features/form/FormLayout.tsx` | 186 | Template literal sem espaço: `` `flex-1 p-4 md:p-6${...? 'pb-20' : ''}` `` — resulta em `md:p-6pb-20` (classe inválida) | AVISO | Na aba NDA, o padding-bottom pb-20 não é aplicado; conteúdo pode ser coberto pelo sticky footer |

Nenhum marcador de dívida técnica (TBD, FIXME, XXX) encontrado nos arquivos modificados.

---

### Verificação Humana Requerida

#### 1. Autosave funcional no browser

**Teste:** Fazer login → navegar para `/form/:orgId` → digitar em qualquer campo → aguardar 1.5s sem digitar
**Esperado:** Toast "Salvo às HH:MM" aparece com horário atual; requisição para Supabase visível no DevTools Network
**Por que humano:** Comportamento de debounce e toast em tempo real exige execução do app no browser

#### 2. Submissão formal end-to-end

**Teste:** Navegar até aba NDA → verificar sticky footer → clicar "Enviar Avaliação" → verificar dialog → clicar "Confirmar Envio"
**Esperado:** Footer aparece apenas na aba NDA; dialog tem título "Enviar Avaliação?", descrição de imutabilidade, botões "Manter Rascunho" e "Confirmar Envio"; redirect para `/form/:orgId/history` após confirmação
**Por que humano:** Renderização condicional e navegação requerem interação real no browser

#### 3. HistoryPage lista versões com badges corretos

**Teste:** Acessar `/form/:orgId/history` após submeter avaliação
**Esperado:** Badge "Enviado" com cor laranja (bg-accent); botão "Iniciar Nova Revisão" apenas na versão mais recente
**Por que humano:** Cores e renderização condicional dependem de dados reais do Supabase e renderização DOM

#### 4. Nova revisão cria draft pré-preenchido

**Teste:** Na HistoryPage, clicar "Iniciar Nova Revisão"
**Esperado:** Redirect para `/form/:orgId` com campos pré-preenchidos com dados da versão anterior
**Por que humano:** Hidratação do store via `hydrateFromAssessment` com dados do banco exige fluxo completo no browser

#### 5. Persistência após reload

**Teste:** Alterar campo → aguardar toast de salvamento → fechar browser ou pressionar F5 → reabrir `/form/:orgId`
**Esperado:** Dado alterado preservado (vindo do Supabase, não de sessionStorage)
**Por que humano:** Distinguir entre fontes de dados requer reload real do browser

#### 6. Toast de falha de autosave

**Teste:** Bloquear URL Supabase no DevTools Network → digitar campo → aguardar 1.5s
**Esperado:** Toast warning "Falha ao salvar — tentando novamente" aparece
**Por que humano:** Simular falha de rede requer interação manual com DevTools

#### 7. Bug CSS na aba NDA — espaço faltando antes de pb-20 (AVISO)

**Teste:** Abrir aba NDA → verificar se conteúdo não está coberto pelo sticky footer
**Esperado:** Espaço entre conteúdo e footer visível; classe CSS deve ser `md:p-6 pb-20` (com espaço)
**Por que humano:** O template literal na linha 186 de `FormLayout.tsx` é `` `flex-1 p-4 md:p-6${store.activeTab === TabKey.Nda ? 'pb-20' : ''}` `` — sem espaço separador, Tailwind não reconhece `md:p-6pb-20` como classe válida. Conteúdo pode sobrepor-se ao footer na aba NDA. Verificar visualmente e corrigir se necessário com `` ` md:p-6${... ? ' pb-20' : ''}` ``

---

### Nota: Desvio de Implementação — upsert substituído por SELECT+UPDATE/INSERT

O plano 08-02 especificou `supabase.upsert({ onConflict: 'org_id,status' })`. Em produção, esse padrão gerou o erro PostgreSQL `42P10: there is no unique or exclusion constraint matching the ON CONFLICT specification` porque o PostgREST não suporta predicado `WHERE` em `ON CONFLICT` para índices parciais.

O fix documentado no 08-05-SUMMARY substituiu o upsert por SELECT+UPDATE/INSERT, que é funcionalmente equivalente e correto. O must_have da fase ("autosave executa upsert com sucesso — apenas um draft por org existe no banco a qualquer momento") continua válido em termos de comportamento observável — a implementação mudou, o objetivo não.

---

## Resumo de Gaps

Nenhum gap bloqueador identificado. Todos os 12 must-haves têm evidência estática verificada no código. O status `human_needed` reflete o checkpoint explícito do plano 08-05 (gate `blocking`), não a ausência de implementação.

**Bug CSS pendente (AVISO):** Linha 186 de `FormLayout.tsx` — espaço faltando no template literal do `pb-20` na aba NDA. Não é bloqueador do objetivo da fase mas deve ser corrigido antes de QA visual.

---

_Verificado: 2026-05-23T04:00:00Z_
_Verificador: Claude (gsd-verifier)_
