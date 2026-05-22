# Phase 7: Campos — Habilitações, NDA & Classificação G1-G5 - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar as 5 abas restantes do formulário (Hab. Venda, Hab. Repositórios, Hab. Responsáveis, Hab. Classificação, NDA) com todos os campos do HTML de referência, validação Zod completa e engine de classificação automática `calculateReadiness`. A engine lê valores de selects preenchidos pelo consultor (não calcula score de respostas individuais) e retorna `{ gerencial: G1|...|G5, habilitacoes: HAB-A|...|HAB-E, ndaAceito: boolean }`. Componente `ReadinessClassification` exibe resultado com badge colorido. Sem Phases 5/6 de código — reusa todos os field components e padrões já estabelecidos.

</domain>

<decisions>
## Implementation Decisions

### Engine de Classificação G1-G5

- **D-01:** **G1-G5 gerencial via select direto** — o consultor escolhe o nível gerencial explicitamente no select "Nível gerencial" da aba Torre Decisão (já existe no HTML e na TorreDecisaoSection). Não há score automático derivado de respostas individuais.
- **D-02:** **HAB-A a HAB-E via select direto** — mesmo padrão: consultor seleciona classificação de maturidade de habilitações na aba Hab. Classificação. Sem algoritmo de inferência.
- **D-03:** **`calculateReadiness(sectionData): ReadinessResult`** — função pura em `src/lib/readiness.ts`. Lê `sectionData[TabKey.TorreDecisao].nivelGerencial`, `sectionData[TabKey.HabClassificacao].classificacaoFinal`, e `sectionData[TabKey.Nda].aceitaTermos`. Retorna: `{ gerencial: 'G1'|'G2'|'G3'|'G4'|'G5' | null, habilitacoes: 'HAB-A'|'HAB-B'|'HAB-C'|'HAB-D'|'HAB-E' | null, ndaAceito: boolean }`. Null quando o campo ainda não foi preenchido.
- **D-04:** **Atualização em tempo real via `useMemo`** — `calculateReadiness` é chamado via `useMemo` no componente `ReadinessClassification` (ou hook dedicado), observando `sectionData` da store. Badge reflete a seleção atual imediatamente sem salvar.

### NDA — Conteúdo Renderizado

- **D-05:** **Texto completo do NDA + campos ao final** — aba NDA renderiza o texto legal integral do NDA mútuo em `<div>` scrollable (não em iframe, não colapsado), seguido dos campos de aceite: nome do representante, cargo, CPF, data de aceite (auto-preenchida com `new Date().toLocaleDateString('pt-BR')`), e checkbox "Li e aceito os termos do NDA" (obrigatório).
- **D-06:** **Texto hardcoded em `src/constants/nda-text.ts`** — conteúdo extraído do HTML de referência e armazenado como constante TypeScript (array de parágrafos ou string). Sem dependência externa, sem plugin Vite adicional.
- **D-07:** **Somente checkbox é obrigatório** — `aceitaTermos: z.literal(true)` no schema Zod da aba NDA. Nome, CPF e cargo são `z.string().optional()`. Data de aceite é preenchida automaticamente ao marcar o checkbox (não requer input do usuário).

### Matriz de Habilitações

- **D-08:** **Lista de selects agrupados por domínio** — a "Matriz enxuta de habilitações e documentos críticos" é representada como grupos de campos (não tabela). Cada domínio (fiscal, ambiental, previdenciário, etc.) é um grupo `<fieldset>` ou `<section>` com título + 4 campos: "Existe controle?" (SelectField), "Repositório principal" (SelectField), "Responsável interno" (input text), "Observações que mudam escopo" (TextareaField). Reutiliza field components já existentes sem criar componente de tabela.
- **D-09:** **Mapeamento de tipos por coluna** — "Existe controle?" = SelectField (opções: Sim/Não/Parcial), "Repositório principal" = SelectField (opções: GED, Pasta local, Google Drive, SharePoint, Não possui), "Responsável interno" = campo text livre (não SelectField — nome específico da pessoa), "Observações" = TextareaField. Baseado no HTML e no padrão já estabelecido na Phase 6.

### Claude's Discretion

- **Domínios específicos da matriz** — quais domínios de habilitação incluir nas rows (fiscal, ambiental, previdenciário, técnico-construtivo, etc.) deve ser extraído do HTML de referência campo a campo. Implementador define a lista completa.
- **Placement do ReadinessClassification fora da última aba** — ROADMAP menciona "preview flutuante". Implementador decide o placement (sidebar, sticky bottom, ou badge no header) baseado no que for menos intrusivo para o fluxo de preenchimento.
- **Formato do CPF** — mask de CPF (000.000.000-00) é desejável mas não foi explicitamente solicitada. Implementador pode incluir se houver biblioteca de mask já instalada, senão campo text simples.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Domínio e campos (OBRIGATÓRIO)
- `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html` — fonte de verdade para todos os campos das 5 abas, opções de radio/select/checkbox, lógica condicional e texto legal do NDA. **Percorrer campo a campo** para garantir FORM-02 (100% dos campos presentes).

### Requisitos e escopo
- `.planning/REQUIREMENTS.md` §FORM-02 — todos os campos do HTML preservados (nenhuma seção omitida)
- `.planning/REQUIREMENTS.md` §FORM-03 — validação Zod + React Hook Form (campos obrigatórios com erro inline)
- `.planning/REQUIREMENTS.md` §FORM-07 — classificação G1-G5 calculada automaticamente
- `.planning/REQUIREMENTS.md` §UX-02 — layout responsivo (desktop + tablet 768px)
- `.planning/ROADMAP.md` §Phase 7 — 7 planos prescritos: 2 abas hab., 2 abas hab., NDA, engine, componente, auditoria campos, responsividade

### Código existente (modificar)
- `src/features/form/FormLayout.tsx` — **ADICIONAR** renderização das 5 novas Section components baseado em `activeTab`
- `src/components/ui/index.ts` — **VERIFICAR** exports — todos os field components já devem estar exportados da Phase 6

### Código existente (reutilizar — não recriar)
- `src/features/form/sections/TorreClassificacaoSection.tsx` — **REFERÊNCIA DIRETA** para estrutura das novas sections (padrão useForm + zodResolver + subscription sync + props explícitas)
- `src/schemas/torre-classificacao.ts` — **REFERÊNCIA DIRETA** para estrutura dos novos schemas Zod (todos os campos opcionais, exportar `REQUIRED_COUNT`)
- `src/stores/formStore.ts` — `TabKey` enum (HabVenda, HabRepositorios, HabResponsaveis, HabClassificacao, Nda já definidos), `updateSection`, `sectionData`
- `src/features/form/tabConfig.ts` — `TAB_CONFIG` com labels das 5 abas já definidos
- `src/components/ui/` — `RadioGroupField`, `CheckboxGroupField`, `SelectField`, `TextareaField`, `ConditionalField` — todos prontos

### Fases anteriores (contexto de integração)
- `.planning/phases/06-campos-do-formul-rio-torre-360/06-CONTEXT.md` — D-01 a D-08 (arquitetura RHF + Zustand, subscription pattern, field API, props explícitas). Phase 7 segue os mesmos padrões sem alteração.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `TorreClassificacaoSection.tsx` — modelo exato para as 5 novas sections: `useForm` + `zodResolver` + `useEffect` com subscription `watch()` + `store.updateSection`
- `SelectField`, `RadioGroupField`, `CheckboxGroupField`, `TextareaField`, `ConditionalField` — prontos em `src/components/ui/`
- `useFormStore(tenantId)` — `sectionData[tab]` para `defaultValues`, `updateSection(tab, data)` para sync
- `TabKey` enum — HabVenda, HabRepositorios, HabResponsaveis, HabClassificacao, Nda já definidos
- Tailwind tokens — `bg-primary` (#123B66), `text-accent` (#F28C28), nunca hardcodar hex

### Established Patterns
- `useEffect(() => { const sub = watch(v => store.updateSection(tab, v)); return () => sub.unsubscribe() }, [])` — subscription sem deps instáveis (sem render loop)
- Props explícitas `tenantId` nos Section components (não useFormContext)
- `defaultValues: (store.sectionData[TabKey.X] ?? {}) as Partial<XData>` — restaura preenchimento anterior
- `mode: 'onBlur'` no useForm — validação ao sair do campo, não no keystroke
- Schemas em `src/schemas/` com todos os campos `optional()` (consultor não é obrigado a preencher tudo)
- Exportar `X_REQUIRED_COUNT` de cada schema para `useFormSection` calcular completeness

### Integration Points
- `FormLayout.tsx` → switch por `activeTab` → renderizar `<HabVendaSection tenantId />`, etc.
- `calculateReadiness(sectionData)` → `useMemo` no `ReadinessClassification` → badge G1-G5 + HAB-X em tempo real
- `sectionData[TabKey.Nda].aceitaTermos` → booleano consumido por `calculateReadiness` → `ndaAceito: boolean`
- `src/lib/readiness.ts` → importado por Phase 8 (autosave inclui nível de prontidão no payload) e Phase 9 (dashboard exibe classificação)

</code_context>

<specifics>
## Specific Ideas

- `calculateReadiness` é função pura — inputs: `Partial<Record<TabKey, Record<string, unknown>>>`, output: `ReadinessResult`. Testável sem React. Retorna `null` para dimensões sem seleção.
- Aba NDA: texto em `div` com `max-h-[400px] overflow-y-auto border rounded-lg p-4 bg-gray-50 text-sm` antes dos campos. Data de aceite: `z.string().default(() => new Date().toLocaleDateString('pt-BR'))` inicializado no `defaultValues`.
- Badge G1-G5: `G1 = bg-red-100 text-red-700`, `G2 = bg-orange-100 text-orange-700`, `G3 = bg-yellow-100 text-yellow-700`, `G4 = bg-blue-100 text-blue-700`, `G5 = bg-green-100 text-green-700` — escala semântica de risco.
- Matriz de habilitações: cada domínio como `<section>` com `<h4>` título + grid de 4 campos. Campo "Responsável interno" como `<input type="text">` dentro de um wrapper de label/error (ou criar `InputField` genérico se não existir ainda).

</specifics>

<deferred>
## Deferred Ideas

- Cálculo de score por sub-respostas (ex: derivar G1-G5 somando pontos de perguntas individuais) — explicitamente descartado em favor de select direto. Possível em versão futura se análise de dados exigir.
- Tooltip no badge mostrando quais campos influenciam a classificação — deferred para Phase 12 (polimento).
- Máscara de CPF na aba NDA — deferred para Phase 12 se não houver lib de mask instalada.

</deferred>

---

*Phase: 07-campos-habilita-es-nda-classifica-o-g1-g5*
*Context gathered: 2026-05-22*
