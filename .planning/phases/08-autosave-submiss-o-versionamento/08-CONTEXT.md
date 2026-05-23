# Phase 8: Autosave, Submissão & Versionamento - Context

**Gathered:** 2026-05-23
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar a camada de persistência real do formulário: autosave com debounce 1500ms que grava rascunhos no Supabase, submissão formal que cria versão imutável (append-only), histórico de versões acessível em `/form/:orgId/history`, e skeleton loading via TanStack Query. O formulário hidrata do Supabase ao abrir — não depende de sessionStorage como fonte de verdade. Reutiliza `calculateReadiness()` e toda a estrutura Zustand existente; adiciona `hydrateFromAssessment` action ao formStore.

</domain>

<decisions>
## Implementation Decisions

### Carga do rascunho ao abrir

- **D-01:** **Supabase é fonte de verdade para hidratação** — ao navegar para `/form/:orgId`, `useQuery` do TanStack Query busca o draft mais recente (`status = 'draft'`) do Supabase para o `org_id` do usuário. sessionStorage mantém o papel de cache temporário de UI entre trocas de aba, mas não é fonte de verdade.
- **D-02:** **Nova action `hydrateFromAssessment(formData)` no formStore** — distribui o `form_data` JSONB recuperado para cada `sectionData[TabKey]`. Chamada no `onSuccess` do TanStack Query ao montar o FormLayout. Permite que trocar de dispositivo ou reabrir a página restaure corretamente.
- **D-03:** **Primeira vez: form vazio; draft criado no primeiro autosave** — se não existe draft no Supabase (`null`), o formulário abre em branco. O registro em `assessments` é criado via INSERT quando o autosave dispara pela primeira vez (evita criar registros vazios pre-emptivamente).

### Autosave — comportamento e payload

- **D-04:** **Toast + retry no próximo keystroke** — quando autosave falha (offline/erro), toast warning "Falha ao salvar — tentando novamente" aparece. O próximo change no formulário re-dispara o debounce normalmente. Sem retry queue automática — suficiente para o piloto com 5 construtoras.
- **D-05:** **Calcular e salvar `readiness_level_mgmt` e `readiness_level_tech` no autosave** — `useAutosave` chama `calculateReadiness(sectionData)` e inclui os níveis no payload de upsert. Dashboard da Fase 9 acessa dados frescos sem depender de submissão formal.
- **D-06:** **Estratégia de upsert** (do ROADMAP, confirmado): INSERT se não existe draft para `org_id`; UPDATE se já existe registro com `status = 'draft'` para o mesmo `org_id`. Chave lógica: `org_id + status = 'draft'` (uma org tem no máximo um draft ativo por vez).

### Claude's Discretion

- **Destino pós-submissão** — usuário não discutiu. Implementador decide: redirect para `/form/:orgId/history` após confirmação no dialog é a opção mais natural (feedback claro de que o envio foi bem-sucedido e estado da avaliação mudou).
- **Nova revisão — pré-preenchimento** — usuário não discutiu. ROADMAP especifica "copiando `form_data` da versão mais recente"; implementador usa `hydrateFromAssessment` para carregar dados da versão submetida mais recente no Zustand ao iniciar nova revisão.
- **Placement do botão "Enviar Avaliação"** — implementador decide: sticky footer na última aba (NDA), visível apenas quando `activeTab === TabKey.Nda` ou sempre visível no FormLayout.
- **Indicador de progresso do autosave** — timestamp no toast ("Salvo às 14:32") via `new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e escopo da fase
- `.planning/REQUIREMENTS.md` §SAVE (SAVE-01 a SAVE-06) — requisitos de autosave, submissão, versionamento e histórico
- `.planning/REQUIREMENTS.md` §UX (UX-04, UX-05) — feedback visual de salvamento e skeleton loading
- `.planning/ROADMAP.md` §Phase 8 — 6 planos prescritos, UAT e estratégia de upsert

### Schema do banco
- `roteiro-unificado/src/types/database.ts` §assessments — Row/Insert/Update types; colunas `form_data`, `status`, `version`, `readiness_level_mgmt`, `readiness_level_tech`, `submitted_at`
- `.planning/phases/02-database-schema-rls/02-CONTEXT.md` — D-01 a D-04 (JSONB blob, append-only, colunas de classificação indexadas)

### Código existente (modificar)
- `roteiro-unificado/src/stores/formStore.ts` — **ADICIONAR** `hydrateFromAssessment(formData: Json)` action que distribui JSONB para `sectionData[TabKey.*]`

### Código existente (reutilizar — não recriar)
- `roteiro-unificado/src/lib/readiness.ts` — `calculateReadiness(sectionData)` → `ReadinessResult` — chamar no autosave antes do upsert
- `roteiro-unificado/src/hooks/useToast.ts` — `useToast()` com `.success()`, `.error()`, `.warning()` — não usar Sonner diretamente
- `roteiro-unificado/src/components/ui/skeleton.tsx` — `Skeleton` component para loading states
- `roteiro-unificado/src/components/ui/dialog.tsx` — `Dialog` para confirmação de submissão
- `roteiro-unificado/src/features/form/FormLayout.tsx` — **PONTO DE INTEGRAÇÃO** para montar `useAutosave` e `useQuery` de draft

### Dependências já instaladas
- `@tanstack/react-query: ^5.100.11` — já instalado; usar `useQuery` + `useMutation` para fetch draft e submit
- `sonner: ^2.0.7` — já instalado; acessar via `useToast` hook

### Fases anteriores (contexto de integração)
- `.planning/phases/07-campos-habilita-es-nda-classifica-o-g1-g5/07-CONTEXT.md` — D-01 a D-09 (padrões de Section components, subscription Zustand, schema Zod; Phase 8 não altera esses padrões)
- `.planning/phases/05-shell-do-formul-rio-navega-o-por-abas/05-CONTEXT.md` — TabKey enum, sessionStorage split

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useToast()` — hook wrapper Sonner com `.success()`, `.error()`, `.warning()`, `.promise()` — usar para todos os toasts de autosave
- `Skeleton` — component em `src/components/ui/skeleton.tsx` — usar em FormLayout e HistoryPage durante loading
- `Dialog` — component em `src/components/ui/dialog.tsx` — usar para dialog de confirmação de submissão
- `calculateReadiness(sectionData)` — função pura em `src/lib/readiness.ts` — chamar antes de cada upsert para incluir `readiness_level_mgmt` e `readiness_level_tech`
- `TabKey` enum + `updateSection` action — prontos no formStore; `hydrateFromAssessment` será a nova action
- `@tanstack/react-query` — já instalado; `useQuery` para draft load, `useMutation` para submit e nova revisão

### Established Patterns
- `useEffect(() => { const sub = watch(v => store.updateSection(tab, v)); return () => sub.unsubscribe() }, [])` — subscription sem deps instáveis (Phase 6/7); `useAutosave` se baseia no mesmo `sectionData` do store
- `mode: 'onBlur'` no useForm — validação ao blur, não no keystroke
- Schemas em `src/schemas/` com campos `optional()` — autosave pode salvar `form_data` parcialmente preenchido sem erro
- Navegação: `navigate(path, { replace: true })` em redirects de auth (Phase 3); usar o mesmo padrão para redirect pós-submissão
- TanStack Query v5: `queryKey: ['assessment', 'draft', orgId]`; `staleTime: 30_000` (30s) para evitar re-fetch em cada troca de aba

### Integration Points
- `FormLayout.tsx` → `useQuery` para fetch do draft → `hydrateFromAssessment(data.form_data)` no onSuccess → `useAutosave` observa `sectionData` do store
- `FormLayout.tsx` → Skeleton durante `isLoading` do useQuery
- Nova rota `/form/:orgId/history` → `HistoryPage` componente com lista de avaliações; `useQuery(['assessments', orgId])` filtrando todos os status
- `ReadinessClassification.tsx` (Phase 7) → pode exibir classificação calculada a partir do sectionData hidratado; sem mudança necessária

</code_context>

<specifics>
## Specific Ideas

- `useAutosave(tenantId)`: observa `formStore.subscribe()` do store, debounce 1500ms, chama `calculateReadiness(sectionData)`, faz upsert via Supabase client com payload `{ org_id, form_data: sectionData, readiness_level_mgmt, readiness_level_tech, status: 'draft' }`, exibe toast.success com timestamp em `pt-BR` ou toast.warning em caso de falha.
- `hydrateFromAssessment(formData: Json)` no formStore: itera sobre `Object.entries(formData as Record<TabKey, unknown>)` e chama `updateSection(tab, data)` para cada tab encontrado no JSONB. Seguro mesmo se `formData` tiver keys desconhecidos (ignorados).
- TanStack Query query key: `['assessment', 'draft', orgId]` para fetch inicial; mutation key: `['assessment', 'submit', orgId]` para submissão.
- Submissão: `UPDATE assessments SET status = 'submitted', submitted_at = now(), version = version + 1 WHERE org_id = :orgId AND status = 'draft'`. Após sucesso, `navigate(\`/form/${orgId}/history\`, { replace: true })`.
- Nova revisão: `INSERT INTO assessments (org_id, form_data, status, version) SELECT org_id, form_data, 'draft', version + 1 FROM assessments WHERE org_id = :orgId AND status = 'submitted' ORDER BY version DESC LIMIT 1`. Retorna novo draft; `hydrateFromAssessment` preenche o Zustand.
- RLS: policy de UPDATE bloqueia `status = 'submitted'` para role `company` (definido na Phase 2; Phase 8 só consome).

</specifics>

<deferred>
## Deferred Ideas

None — discussão focada no escopo da fase.

</deferred>

---

*Phase: 08-autosave-submiss-o-versionamento*
*Context gathered: 2026-05-23*
