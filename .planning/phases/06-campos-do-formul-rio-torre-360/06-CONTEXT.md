# Phase 6: Campos do Formulário — Torre 360 - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar as 5 abas da Torre 360 (Identificação + Torres Decisão, Sienge, Acesso, Classificação) com todos os campos do HTML de referência, tipos corretos e campos condicionais funcionando. Entregas: biblioteca de componentes de campo (RadioGroupField, CheckboxGroupField, SelectField, TextareaField, ConditionalField), Zod schemas por aba em `src/schemas/`, Section components em `src/features/form/sections/`, integração React Hook Form + Zustand store, e `useFormSection` atualizado com completeness real. Sem abas de Habilitações ou NDA — essas vêm na Phase 7.

</domain>

<decisions>
## Implementation Decisions

### Arquitetura React Hook Form + Zustand

- **D-01:** **`useForm()` por aba** — cada Section component monta seu próprio `useForm` com `zodResolver(schema)` específico da aba. Não há um form global no FormLayout. Isso mantém o schema pequeno e o RHF gerencia apenas os campos da aba ativa.
- **D-02:** **Sync via `watch() + useEffect`** — dentro de cada Section, `const values = watch(); useEffect(() => { updateSection(tab, values) }, [values])` para sincronizar dados do RHF de volta para o `sectionData` da store Zustand. Usa o `updateSection` existente sem mudança na interface da store.
- **D-03:** **`useFormSection` atualizado para receber `control`** — assinatura: `useFormSection(tenantId, tab, control?)`. Quando `control` é fornecido (Phase 6+): retorna `errors` reais do `formState.errors` e `completeness` calculado (campos preenchidos / total de campos obrigatórios do schema). Quando `control` ausente (Phase 5 shell): mantém comportamento atual (`errors: {}`, `completeness: 0.01`). Compatibilidade retroativa preservada.
- **D-04:** **`defaultValues: sectionData[tab] ?? {}`** — ao montar cada Section, `useForm` é inicializado com os dados já na store: `useForm({ resolver: zodResolver(schema), defaultValues: sectionData[tab] ?? {} })`. Restaura o preenchimento anterior sem ciclo extra de render.

### Estrutura de Diretórios

- **D-05:** **Section components em `src/features/form/sections/`** — um arquivo por aba: `IdentificacaoSection.tsx`, `TorreDecisaoSection.tsx`, `TorreSiengeSection.tsx`, `TorreAcessoSection.tsx`, `TorreClassificacaoSection.tsx`. Subpasta `sections/` dentro da feature `form/` existente.
- **D-06:** **Field components em `src/components/ui/`** — `RadioGroupField`, `CheckboxGroupField`, `SelectField`, `TextareaField`, `ConditionalField` são componentes genéricos reutilizáveis. Adicionados ao barrel export `src/components/ui/index.ts` junto com Button, Badge, Spinner, Card.
- **D-07:** **Zod schemas em `src/schemas/`** — um arquivo por aba: `identificacao.ts`, `torre-decisao.ts`, `torre-sienge.ts`, `torre-acesso.ts`, `torre-classificacao.ts`. Schemas desacoplados dos componentes para serem reutilizados pela Phase 8 (autosave) e Phase 7.
- **D-08:** **Props explícitas nos Section components** — `<IdentificacaoSection tenantId={orgId} control={control} errors={errors} />`. Sem `FormProvider`/`useFormContext()` para manter os Section components isolados e fáceis de testar. `control` e `errors` são desestruturados de `useForm()` na aba pai e passados via props.

### Claude's Discretion

- **ConditionalField:** wrapper que usa `watch(fieldName)` para mostrar/ocultar filhos. Campo oculto deve chamar `unregister(fieldName)` ao desmontar para não bloquear validação Zod do schema da aba. A prop `condition` recebe o valor watched: `<ConditionalField condition={watchedValue === 'sim'}>...</ConditionalField>`.
- **completeness real:** calculado no `useFormSection` como `filledRequiredFields / totalRequiredFields` do schema Zod, range `[0, 1]`. Substitui o proxy `0.01` de Phase 5. Opcional fields não afetam o cálculo. `completeness === 1` só quando todos os obrigatórios estão preenchidos sem erro.
- **Field component API:** todos os field components (`RadioGroupField`, `CheckboxGroupField`, etc.) recebem `control` via prop explícita (não `useFormContext`), tornando-os reutilizáveis fora do contexto do FormLayout. Assinatura padrão: `{ name, control, label, options, error?, required? }`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e escopo
- `.planning/REQUIREMENTS.md` §FORM-05, §FORM-06 — campos tipo correto (FORM-05) e campos condicionais (FORM-06) são os requisitos principais desta fase
- `.planning/ROADMAP.md` §Phase 6 — 7 planos prescritos: biblioteca de campos, 5 abas, e conexão Zod+RHF

### Referência de domínio (OBRIGATÓRIO para pesquisador e planejador)
- `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html` — fonte de verdade para todos os campos, opções de radio/checkbox/select e lógica condicional. Cada aba deve cobrir 100% dos campos deste HTML. UAT exige verificação manual.

### Código existente (modificar)
- `src/features/form/useFormSection.ts` — **ATUALIZAR** assinatura para aceitar `control?` opcional; implementar completeness real quando control presente; manter comportamento Phase 5 sem control
- `src/components/ui/index.ts` — **ADICIONAR** exports dos novos field components (RadioGroupField, CheckboxGroupField, SelectField, TextareaField, ConditionalField)

### Código existente (reutilizar — não recriar)
- `src/stores/formStore.ts` — `updateSection(tab, data)` é o ponto de sync RHF→Zustand; `sectionData[tab]` fornece `defaultValues` para `useForm`; `TabKey` enum para nomear abas nas Section props
- `src/features/form/tabConfig.ts` — `TAB_CONFIG` array com labels; importar nas sections para manter labels consistentes
- `src/features/form/FormLayout.tsx` — renderiza a aba ativa; deve importar e renderizar o Section component correto baseado em `activeTab`
- `src/features/auth/AuthProvider.tsx` — `useAuth().orgId` fornece o `tenantId` para os Section components
- `src/components/ui/index.ts` — Button, Badge, Spinner, Card já disponíveis para composição nos Section components

### Fases anteriores (contexto de integração)
- `.planning/phases/05-shell-do-formul-rio-navega-o-por-abas/05-CONTEXT.md` — decisões D-01 a D-11 sobre FormStore, FormLayout, useFormSection e completeness proxy. Phase 6 sobrepõe D-09/D-10 (completeness) sem alterar D-01 a D-08 (store + nav).

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `useFormStore(tenantId)` — `updateSection(tab, data)` para sync RHF→Zustand; `sectionData[tab]` para `defaultValues`
- `useFormSection(tenantId, tab)` — **modificar** para aceitar `control?` e retornar errors/completeness reais
- `TabKey` enum (exportado de `formStore.ts`) — usar como tipo para prop `tab` nos Section components
- `Button` (variante `ghost`, `primary`) — submissão e navegação dentro das sections
- `Badge` — pode compor ProgressBadge (já usa para status de aba em Phase 5)
- Tailwind tokens: `bg-primary` (#123B66), `text-accent` (#F28C28) — RadioGroup selected state

### Established Patterns
- `useFormStore(tenantId)` — sempre passar `tenantId` (= `orgId`) para manter isolamento multi-tenant
- Alias `@/` — importar via `@/schemas`, `@/features/form/sections`, `@/components/ui`
- Tailwind v4 tokens — nunca hardcodar hex; usar `bg-primary`, `text-accent`, tokens semânticos
- Props explícitas > context — padrão estabelecido em auth (useAuth) e form (useFormStore) para evitar acoplamento implícito
- `zodResolver` do `@hookform/resolvers/zod` — já instalado junto com react-hook-form na Phase 5

### Integration Points
- `FormLayout.tsx` → switch por `activeTab` → renderiza Section correto com `<TorreDecisaoSection tenantId control errors />`
- `useFormSection` → atualizado → `ProgressBadge` usa `completeness` real para ícone de status na sidebar
- `src/schemas/*.ts` → importados em Section components e futuramente em autosave (Phase 8)
- `ConditionalField` → `watch()` do `useForm` da aba → `unregister()` ao ocultar campo

</code_context>

<specifics>
## Specific Ideas

- `ConditionalField` usa `watch(fieldName)` internamente ou recebe `condition: boolean` como prop (condição já avaliada pelo componente pai). Campos ocultos: `unregister(fieldName, { keepValue: false })` ao desmontar.
- `RadioGroupField`: estilo selecionado com `ring-2 ring-primary bg-primary/10 text-primary font-medium`; não selecionado: `border border-gray-200 hover:bg-gray-50`.
- `CheckboxGroupField` Torre Sienge: suporta "selecionar todos" como checkbox master no topo do grupo.
- Section components devem exportar o Zod schema inferido como `type IdentificacaoData = z.infer<typeof identificacaoSchema>` para tipagem da store.

</specifics>

<deferred>
## Deferred Ideas

- Validação cruzada entre abas (ex: Classificação depende de respostas de Decisão) — requer form global ou context compartilhado. Deferred para Phase 7 ou avaliado durante planning.
- "Selecionar todos" genérico no CheckboxGroupField — implementar caso específico para Torre Sienge; generalizar só se necessário em Phase 7.
- Animação de transição ao mostrar/ocultar ConditionalField — deferred para Phase 12 (polimento).

</deferred>

---

*Phase: 06-campos-do-formul-rio-torre-360*
*Context gathered: 2026-05-22*
