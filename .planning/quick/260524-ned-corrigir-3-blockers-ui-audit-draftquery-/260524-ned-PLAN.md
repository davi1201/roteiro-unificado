---
phase: quick-260524-ned
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - roteiro-unificado/src/components/ui/textarea-field.tsx
  - roteiro-unificado/src/schemas/identificacao.ts
  - roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx
  - roteiro-unificado/src/features/form/FormLayout.tsx
autonomous: true
requirements:
  - UI-AUDIT-BLOCKER-1
  - UI-AUDIT-BLOCKER-2
  - UI-AUDIT-BLOCKER-3
must_haves:
  truths:
    - "Quando draftQuery.isError = true, o usuário vê uma UI de erro recuperável com botão 'Tentar novamente' em vez de um formulário vazio silencioso"
    - "Row 2 do IdentificacaoSection exibe exatamente [Responsáveis (amber) | Escopo do Piloto (green)] conforme sketch 002 Variant B"
    - "O card 'Reunião e Participantes' não aparece mais entre Dados da Empresa e Responsáveis (foi removido ou movido para Row 4)"
    - "Row 1 (Dados da Empresa) usa grid 3-col com [Empresa/grupo (col-span-2) | Cidade/UF (col 3)] e CNPJ abaixo com max-width restrito"
    - "O campo Cidade/UF persiste no schema identificacaoSchema e aparece no form"
    - "Ambas as textareas de Prioridades mostram contador 'N / 500' que atualiza ao digitar"
  artifacts:
    - path: "roteiro-unificado/src/components/ui/textarea-field.tsx"
      provides: "TextareaField com prop maxLength opcional + display de char-count"
      contains: "maxLength"
    - path: "roteiro-unificado/src/schemas/identificacao.ts"
      provides: "Schema com campo cidadeUf opcional (max 100)"
      contains: "cidadeUf"
    - path: "roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx"
      provides: "Row 1 com grid 3-col incluindo Cidade/UF; Row 2 = [Responsáveis | Escopo]; textareas com maxLength=500"
      contains: "cidadeUf"
    - path: "roteiro-unificado/src/features/form/FormLayout.tsx"
      provides: "Branch de erro para draftQuery.isError antes de renderSection com botão refetch"
      contains: "draftQuery.isError"
  key_links:
    - from: "roteiro-unificado/src/features/form/FormLayout.tsx"
      to: "draftQuery.refetch"
      via: "onClick do botão Tentar novamente"
      pattern: "draftQuery\\.refetch"
    - from: "roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx"
      to: "identificacaoSchema.cidadeUf"
      via: "register('cidadeUf')"
      pattern: "register\\(['\"]cidadeUf['\"]\\)"
    - from: "roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx"
      to: "TextareaField maxLength"
      via: "prop maxLength={500} nos campos prioridadeTorre360 e prioridadeHabilitacoes"
      pattern: "maxLength=\\{500\\}"
---

<objective>
Corrigir os 3 blockers do UI audit (`.planning/ui-reviews/form-identificacao-UI-REVIEW.md`) que estão impedindo o IdentificacaoSection de bater com o sketch 002 Variant B aprovado:

1. **Blocker UX:** `draftQuery.isError` renderiza formulário vazio sem aviso ao usuário (perda silenciosa de draft)
2. **Blocker visual:** Row 2 está com `[Reunião | Responsáveis]` em vez de `[Responsáveis | Escopo]` (hierarquia invertida)
3. **Blocker funcional:** Campo `Cidade/UF` ausente do schema/form + textareas sem char-count

Purpose: Fechar o gap entre o sketch aprovado e a implementação atual antes de prosseguir para Phase 9 (Dashboard). Os blockers afetam coleta de dados (cidade nunca persiste), confiabilidade percebida (erro silencioso de query) e fidelidade visual ao design system.

Output: 4 arquivos modificados (1 componente UI, 1 schema, 1 section, 1 layout) — sem novos arquivos, sem migrações.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/ui-reviews/form-identificacao-UI-REVIEW.md
@roteiro-unificado/src/features/form/FormLayout.tsx
@roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx
@roteiro-unificado/src/components/ui/textarea-field.tsx
@roteiro-unificado/src/components/ui/textarea.tsx
@roteiro-unificado/src/schemas/identificacao.ts

<interfaces>
<!-- Contratos relevantes extraídos da codebase. Executor não precisa explorar. -->

From `roteiro-unificado/src/components/ui/textarea-field.tsx` (atual):
```typescript
interface TextareaFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  required?: boolean
  error?: string
  rows?: number
  helpText?: string
}
```
Internamente envolve `<Controller>` -> `<Textarea {...field} />`. O `field.value` é o que precisamos contar.

From `roteiro-unificado/src/schemas/identificacao.ts` (atual):
```typescript
export const identificacaoSchema = z.object({
  empresa: z.string().trim().min(2, 'Mínimo 2 caracteres'),
  cnpj: z.string().min(1, 'Campo obrigatório').regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Formato inválido'),
  dataReuniao: z.string().optional(),
  participantes: z.string().optional(),
  sponsorPiloto: z.string().optional(),
  responsavelSienge: z.string().optional(),
  responsavelHabilitacoes: z.string().optional(),
  quemConduzComercial: z.string().optional(),
  numCnpjsEscopo: z.string().optional(),
  numObrasAtivas: z.string().optional(),
  prioridadeTorre360: z.string().optional(),
  prioridadeHabilitacoes: z.string().optional(),
})
```

From `roteiro-unificado/src/features/form/FormLayout.tsx` (linha 95-111, atual):
```typescript
const draftQuery = useQuery({
  queryKey: ['assessment', 'draft', tenantId],
  queryFn: async () => { ... },
  staleTime: 30_000,
  enabled: !!tenantId,
})
```
Atualmente, em `FormLayout.tsx:204`, só há branch `draftQuery.isLoading ? <Skeleton/> : renderSection()`. **Falta** branch para `draftQuery.isError`.

From `roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx` (estrutura atual):
- Row 1 (cols=1): Dados da Empresa — `[empresa]` empilhado, depois `[cnpj]` com `max-w-xs`
- Row 2 (cols=2): `[Reunião e Participantes (green) | Responsáveis (amber)]`  ← ERRADO
- Row 3 (cols=1): Escopo do Piloto (green) — 2 inputs side-by-side
- Row 4 (cols=1): Prioridades (purple) — 2 textareas side-by-side

Componentes disponíveis no @/components/ui (já importados onde necessário):
- `Input` (input.tsx) — standard input com props `error`, `errorMessage`
- `Button` (button.tsx) — variants: `primary`, `secondary`, `ghost`; sizes: `sm`, `md`, `lg`
- `Spinner` — para loading states
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Adicionar prop maxLength + char-count ao TextareaField, e cidadeUf ao schema</name>
  <files>roteiro-unificado/src/components/ui/textarea-field.tsx, roteiro-unificado/src/schemas/identificacao.ts</files>
  <action>
Modificar `TextareaField` em `roteiro-unificado/src/components/ui/textarea-field.tsx`:

1. Adicionar `maxLength?: number` na interface `TextareaFieldProps`.
2. Receber `maxLength` na desestruturação de props.
3. Quando `maxLength` for fornecido:
   - Passar `maxLength={maxLength}` para o `<Textarea>` interno (atributo HTML nativo que já bloqueia digitação além do limite).
   - Renderizar um contador `<p className="text-xs text-gray-500 text-right">` abaixo do textarea (após o bloco de `helpText`/`error`), exibindo `{(field.value ?? '').length} / {maxLength}`.
   - Acessar `field.value` dentro do `Controller` render — o contador deve ficar DENTRO do render do Controller (ou usar `useWatch`) para reativar quando o valor muda.
4. Quando `maxLength` for `undefined`, NÃO renderizar o contador (preserva comportamento atual em outras seções).

Implementação sugerida: mover o JSX para dentro do `render={({ field }) => (...)} ` do Controller para ter acesso reativo a `field.value`, OU usar `useWatch({ control, name })` para ler o valor. Manter `helpText` e `error` exatamente como estão hoje.

Aplicar o estilo do sketch: contador alinhado à direita, cor `text-gray-500`, tamanho `text-xs`.

Modificar `roteiro-unificado/src/schemas/identificacao.ts`:

5. Adicionar uma nova propriedade entre `cnpj` e `dataReuniao`:
   `cidadeUf: z.string().max(100, 'Máximo 100 caracteres').optional(),`
6. NÃO alterar `IDENTIFICACAO_REQUIRED_COUNT` (campo é opcional, não muda contagem de obrigatórios).
7. NÃO modificar nenhum outro campo do schema.
  </action>
  <verify>
    <automated>cd roteiro-unificado && npx tsc --noEmit 2>&1 | grep -E "(textarea-field|identificacao)" || echo "OK: no type errors in modified files"</automated>
  </verify>
  <done>
- `TextareaField` aceita prop `maxLength?: number`; quando passada, exibe contador `{n} / {max}` que reage à digitação.
- `identificacaoSchema` tem campo `cidadeUf: z.string().max(100).optional()`.
- `npx tsc --noEmit` passa sem novos erros em `textarea-field.tsx` ou `identificacao.ts`.
- Comportamento atual de TextareaField em outras seções (Torre360, NDA, etc.) permanece inalterado quando `maxLength` não é fornecido.
  </done>
</task>

<task type="auto">
  <name>Task 2: Reestruturar IdentificacaoSection (Row 1 grid 3-col + Cidade/UF, Row 2 invertida, char-count wired)</name>
  <files>roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx</files>
  <action>
Reestruturar layout do `IdentificacaoSection` para bater com sketch 002 Variant B.

**Row 1 (Dados da Empresa — iconColor="blue"):**
- Trocar o conteúdo do card "Dados da Empresa" de stacked (flex-col) para grid 3-col responsivo.
- Linha 1 do grid: `[Empresa/grupo (col-span-2)] [Cidade/UF (col 3)]` — usar `grid grid-cols-1 md:grid-cols-3 gap-4`, com `md:col-span-2` no wrapper do campo Empresa.
- Linha 2 do grid: campo `CNPJ principal` com `max-w-[280px]` (sketch usa max-width 280px) — pode ficar abaixo do grid em um `<div className="mt-4 max-w-[280px]">`.
- Adicionar o novo campo `Cidade/UF sede`:
  - Label: `"Cidade/UF sede"` (sem asterisco — opcional).
  - `<Input type="text" placeholder="Ex.: São Paulo / SP" {...register('cidadeUf')} error={!!errors.cidadeUf} errorMessage={errors.cidadeUf?.message} />`
  - `maxLength={100}` no input (HTML nativo) para alinhar com schema.

**Row 2 — INVERTER e MOVER conteúdo (escolher opção A do task_details):**
- Row 2 deve ficar EXATAMENTE assim: `[Responsáveis (amber) | Escopo do Piloto (green)]`.
- O card "Responsáveis (amber)" mantém os 3 campos atuais (`responsavelSienge`, `responsavelHabilitacoes`, `quemConduzComercial`) sem alterações de label nesta task (label "Responsável técnico/Sienge" → "Resp. Torre 360" é MEDIUM-priority no audit, NÃO está nos 3 blockers desta task — deixar como está).
- O card "Escopo do Piloto (green)" mantém os 2 campos atuais (`numCnpjsEscopo`, `numObrasAtivas`) — mover do Row 3 atual para Row 2.
- Remover Row 3 atual (que tinha Escopo standalone).

**Mover "Reunião e Participantes" para Row 3 (NOVA Row 3, antes de Prioridades):**
- Manter o card "Reunião e Participantes" com `iconColor="amber"` (TROCAR de green para amber para não colidir com Escopo — agora Responsáveis está em amber também, então usar `iconColor="purple"`... NÃO: já temos roxo em Prioridades. Usar `iconColor="blue"` seria duplicar Dados da Empresa.
- **Decisão de cor (Claude's discretion):** usar `iconColor="green"` ainda funciona pois Escopo ficou no Row 2 e Reunião no Row 3 — não estão lado a lado, então não há colisão visual conforme audit. Manter `iconColor="green"`.
- Os 3 campos (`dataReuniao`, `sponsorPiloto`, `participantes`) ficam intocados — só o posicionamento muda (era Row 2 esquerda → agora Row 3 standalone, `cols={1}`).

**Row 4 (Prioridades — iconColor="purple"):**
- Adicionar `maxLength={500}` nas DUAS instâncias de `<TextareaField>`:
  - `prioridadeTorre360`
  - `prioridadeHabilitacoes`
- Manter resto do JSX intacto.

**Ordem final dos Rows:**
1. Row 1 (cols=1 — internamente grid 3-col): Dados da Empresa [blue] — Empresa + Cidade/UF + CNPJ
2. Row 2 (cols=2): Responsáveis [amber] | Escopo do Piloto [green]
3. Row 3 (cols=1): Reunião e Participantes [green]
4. Row 4 (cols=1): Prioridades [purple] — agora com maxLength=500

NÃO renomear nenhum campo do schema. NÃO mexer em useForm/watch/useEffect. Só JSX e props.
  </action>
  <verify>
    <automated>cd roteiro-unificado && npx tsc --noEmit 2>&1 | grep "IdentificacaoSection" || echo "OK: no type errors"</automated>
    <automated>grep -c "cidadeUf" roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx</automated>
    <automated>grep -c "maxLength={500}" roteiro-unificado/src/features/form/sections/IdentificacaoSection.tsx</automated>
  </verify>
  <done>
- Row 1 usa grid 3-col com Empresa (col-span-2) + Cidade/UF (col 3) e CNPJ abaixo com max-w-[280px].
- Row 2 contém EXATAMENTE `[Responsáveis | Escopo do Piloto]` nessa ordem.
- "Reunião e Participantes" foi movido para Row 3 standalone (cols=1).
- Prioridades tem `maxLength={500}` em ambas as textareas.
- `grep -c "cidadeUf"` retorna ≥ 1 (campo presente no JSX).
- `grep -c "maxLength={500}"` retorna 2 (duas textareas).
- `npx tsc --noEmit` passa sem erros novos em IdentificacaoSection.tsx.
  </done>
</task>

<task type="auto">
  <name>Task 3: Adicionar branch de erro em FormLayout para draftQuery.isError</name>
  <files>roteiro-unificado/src/features/form/FormLayout.tsx</files>
  <action>
Em `roteiro-unificado/src/features/form/FormLayout.tsx`, adicionar uma branch de erro antes da renderização normal do conteúdo do `<main>`.

Localização exata: dentro do `<main>` (linha ~198), dentro do bloco condicional onde hoje existe `draftQuery.isLoading ? <Skeleton/> : renderSection(...)` (linha 204-213).

Transformar o ternário binário em uma cadeia que cobre 3 estados:

1. `draftQuery.isLoading` → manter os 4 skeletons existentes (não mexer).
2. `draftQuery.isError` → NOVO: renderizar uma UI de erro recuperável.
3. caso contrário → `renderSection(store.activeTab, tenantId)` como hoje.

UI de erro recuperável (inline, sem novo componente):
- Wrapper: `<div className="mt-4 flex flex-col items-start gap-3 rounded-md border border-g1/30 bg-g1/5 p-4" role="alert" aria-live="polite">`
- Título: `<p className="text-sm font-semibold text-g1">Não foi possível carregar seu rascunho</p>`
- Descrição: `<p className="text-sm text-gray-700">Verifique sua conexão e tente novamente. Seus dados anteriores não foram perdidos.</p>`
- Botão: `<Button variant="secondary" size="sm" onClick={() => draftQuery.refetch()}>Tentar novamente</Button>`

CRÍTICO — o footer universal (linhas 216-263, `{!draftQuery.isLoading && (<div className="sticky bottom-0 ...">...)`) DEVE permanecer escondido enquanto há erro também. Trocar a condição `!draftQuery.isLoading` para `!draftQuery.isLoading && !draftQuery.isError` para evitar que o usuário clique em "Próxima aba" quando o draft falhou em carregar.

NÃO mexer em outros estados (cross-tenant guard, isLoading do auth, dialog de submissão).
NÃO remover ou alterar a `useQuery` config — `draftQuery.refetch()` é fornecido nativamente pelo TanStack Query v5.

Garantir que `Button` já está importado (linha 23: `import { Button, Spinner } from '@/components/ui'` — está).
  </action>
  <verify>
    <automated>cd roteiro-unificado && npx tsc --noEmit 2>&1 | grep "FormLayout" || echo "OK: no type errors"</automated>
    <automated>grep -c "draftQuery.isError" roteiro-unificado/src/features/form/FormLayout.tsx</automated>
    <automated>grep -c "draftQuery.refetch" roteiro-unificado/src/features/form/FormLayout.tsx</automated>
  </verify>
  <done>
- `FormLayout.tsx` contém branch `draftQuery.isError` que renderiza UI de erro com `role="alert"`.
- Botão "Tentar novamente" chama `draftQuery.refetch()`.
- Footer universal (botões Anterior/Próxima aba) NÃO aparece quando `draftQuery.isError` é true.
- `grep -c "draftQuery.isError"` retorna ≥ 2 (uma na branch, uma no footer guard).
- `grep -c "draftQuery.refetch"` retorna ≥ 1.
- `npx tsc --noEmit` passa sem erros novos em FormLayout.tsx.
- A renderização normal (`renderSection`) continua funcionando quando `!isLoading && !isError`.
  </done>
</task>

</tasks>

<verification>
Verificação manual ao final (após Task 3):

1. **Smoke build:** `cd roteiro-unificado && npm run build` (ou `npx tsc --noEmit && npx vite build`) — deve passar sem erros.
2. **Linter:** `cd roteiro-unificado && npx eslint src/features/form/FormLayout.tsx src/features/form/sections/IdentificacaoSection.tsx src/components/ui/textarea-field.tsx src/schemas/identificacao.ts` — sem warnings novos.
3. **Visual sanity (opcional, manual):** abrir a aba Identificação no browser e confirmar:
   - Row 1 mostra Empresa + Cidade/UF lado a lado, CNPJ abaixo.
   - Row 2 mostra Responsáveis (esq) + Escopo (dir).
   - Textareas de Prioridades mostram `0 / 500` no canto.
</verification>

<success_criteria>
- ✅ `draftQuery.isError` mostra UI de erro recuperável com botão "Tentar novamente" funcional.
- ✅ Row 2 = `[Responsáveis (amber) | Escopo do Piloto (green)]` — bate com sketch.
- ✅ Card "Reunião e Participantes" não está mais no Row 2 (movido para Row 3).
- ✅ Campo `Cidade/UF sede` aparece no Row 1 (col 3) e persiste via schema `cidadeUf`.
- ✅ Ambas textareas de Prioridades exibem contador `N / 500` reativo.
- ✅ Nenhum erro TypeScript ou ESLint novo.
- ✅ Schema `identificacaoSchema` exporta `cidadeUf` opcional com max 100.
- ✅ TextareaField sem `maxLength` continua funcionando idêntico em outras seções (Torre360, NDA, etc.).
</success_criteria>

<output>
Após conclusão, criar `.planning/quick/260524-ned-corrigir-3-blockers-ui-audit-draftquery-/260524-ned-SUMMARY.md` documentando:
- O que foi corrigido (3 blockers)
- Quais arquivos foram tocados e a natureza da mudança em cada um
- Decisão tomada para "Reunião e Participantes" (movido para Row 3 standalone — opção A)
- Qualquer desvio do plano e o motivo
</output>
