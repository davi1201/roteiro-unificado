# Phase 6: Campos do Formulário — Torre 360 — Mapa de Padrões

**Mapeado:** 2026-05-22
**Arquivos analisados:** 18 (13 novos + 5 modificações)
**Análogos encontrados:** 16 / 18

---

## Classificação de Arquivos

| Arquivo Novo/Modificado | Role | Data Flow | Análogo Mais Próximo | Qualidade |
|------------------------|------|-----------|----------------------|-----------|
| `src/components/ui/SelectField.tsx` | component | request-response | `src/components/ui/select.tsx` | exact |
| `src/components/ui/TextareaField.tsx` | component | request-response | `src/components/ui/textarea.tsx` | exact |
| `src/components/ui/RadioGroupField.tsx` | component | request-response | `src/components/ui/button.tsx` + `select.tsx` | role-match |
| `src/components/ui/CheckboxGroupField.tsx` | component | request-response | `src/components/ui/select.tsx` | role-match |
| `src/components/ui/ConditionalField.tsx` | component | event-driven | nenhum — sem análogo | sem análogo |
| `src/schemas/identificacao.ts` | schema/utility | transform | `src/schemas/createOrg.ts` | exact |
| `src/schemas/torre-decisao.ts` | schema/utility | transform | `src/schemas/createOrg.ts` | exact |
| `src/schemas/torre-sienge.ts` | schema/utility | transform | `src/schemas/createOrg.ts` | role-match |
| `src/schemas/torre-acesso.ts` | schema/utility | transform | `src/schemas/createOrg.ts` | exact |
| `src/schemas/torre-classificacao.ts` | schema/utility | transform | `src/schemas/createOrg.ts` | exact |
| `src/features/form/sections/IdentificacaoSection.tsx` | component | request-response | `src/components/admin/CreateOrgModal.tsx` | role-match |
| `src/features/form/sections/TorreDecisaoSection.tsx` | component | request-response | `src/components/admin/CreateOrgModal.tsx` | role-match |
| `src/features/form/sections/TorreSiengeSection.tsx` | component | request-response | `src/components/admin/CreateOrgModal.tsx` | role-match |
| `src/features/form/sections/TorreAcessoSection.tsx` | component | request-response | `src/components/admin/CreateOrgModal.tsx` | role-match |
| `src/features/form/sections/TorreClassificacaoSection.tsx` | component | request-response | `src/components/admin/CreateOrgModal.tsx` | role-match |
| `src/features/form/useFormSection.ts` | hook | event-driven | si mesmo (modificar) | exact |
| `src/features/form/FormLayout.tsx` | component | request-response | si mesmo (modificar) | exact |
| `src/components/ui/index.ts` | config/barrel | — | si mesmo (modificar) | exact |

---

## Atribuições de Padrão

### `src/components/ui/SelectField.tsx` (component, request-response)

**Análogo:** `src/components/ui/select.tsx`

**Padrão de imports** (linhas 1-3 do select.tsx):
```tsx
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
```
Para SelectField, substituir `forwardRef` por `Controller`:
```tsx
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'
import { Select } from './select'
```

**Padrão de interface props** (select.tsx linhas 4-9):
```tsx
interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  errorMessage?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}
```
SelectField usa interface própria com `control` e genérico `FieldValues`:
```tsx
interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
  error?: string
}
```

**Padrão de label + campo + erro** (select.tsx linhas 13-37 e CreateOrgModal.tsx linhas 72-87):
```tsx
// wrapper div padrão — replicar em todos os field components
<div className="flex flex-col gap-1">
  <label className="text-sm font-semibold text-gray-700">
    {label}{required && <span className="text-g1 ml-0.5">*</span>}
  </label>
  {/* campo controlado via Controller */}
  {error && <p className="text-g1 text-xs">{error}</p>}
</div>
```

**Padrão de estilo do Select base** (select.tsx linhas 16-23):
```tsx
className={cn(
  'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
  'focus-visible:ring-primary/50 focus-visible:ring-2 focus-visible:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50',
  error ? 'border-g1 focus-visible:ring-g1/50' : 'hover:border-primary-400 border-gray-300',
  className
)}
```

**Padrão Controller** (do RESEARCH.md — nenhum Controller existe na codebase ainda; usar este padrão):
```tsx
<Controller
  name={name}
  control={control}
  render={({ field }) => (
    <Select
      {...field}
      options={options}
      placeholder={placeholder ?? 'Selecione uma opção'}
      error={!!error}
      errorMessage={error}
    />
  )}
/>
```

---

### `src/components/ui/TextareaField.tsx` (component, request-response)

**Análogo:** `src/components/ui/textarea.tsx`

**Padrão de imports** (textarea.tsx linhas 1-2):
```tsx
import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
```
Para TextareaField:
```tsx
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Textarea } from './textarea'
```

**Padrão de estilo do Textarea base** (textarea.tsx linhas 15-23):
```tsx
className={cn(
  'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
  'placeholder:text-gray-400',
  'focus-visible:ring-primary/50 focus-visible:ring-2 focus-visible:outline-none',
  'disabled:cursor-not-allowed disabled:opacity-50',
  'resize-y',
  error ? 'border-g1 focus-visible:ring-g1/50' : 'hover:border-primary-400 border-gray-300',
  className
)}
```

**Padrão de mensagem de erro inline** (textarea.tsx linha 27):
```tsx
{error && errorMessage ? <p className="text-g1 text-xs">{errorMessage}</p> : null}
```
Em TextareaField, a prop é `error?: string` (a mensagem diretamente), não `error: boolean`:
```tsx
{error && <p className="text-g1 text-xs">{error}</p>}
```

**Padrão Controller** (mesmo padrão de SelectField):
```tsx
<Controller
  name={name}
  control={control}
  render={({ field }) => (
    <Textarea
      {...field}
      placeholder={placeholder}
      error={!!error}
      errorMessage={error}
    />
  )}
/>
```

---

### `src/components/ui/RadioGroupField.tsx` (component, request-response)

**Análogos:** `src/components/ui/button.tsx` (estilo de botão, variantes cn) + `src/components/ui/select.tsx` (wrapper div + erro inline)

**Padrão de cn com variantes condicionais** (button.tsx linhas 6-23 — padrão de classes condicionais):
```tsx
// button.tsx usa cva, RadioGroupField usa cn direto por ser mais simples
import { cn } from '@/lib/utils'

// Padrão de classes condicionais por estado — copiar esta estrutura:
className={cn(
  'min-h-[44px] rounded-md px-3 py-2.5 text-sm text-left transition-colors',
  field.value === opt.value
    ? 'ring-2 ring-primary bg-primary/10 text-primary font-medium'
    : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
)}
```

**Padrão de wrapper div + label + erro** (select.tsx linhas 13-38):
```tsx
<div className="flex flex-col gap-1">
  <label className="text-sm font-semibold text-gray-700">
    {label}{required && <span className="text-g1 ml-0.5">*</span>}
  </label>
  {/* Controller com opções como <button type="button"> */}
  {error && <p className="text-g1 text-xs">{error}</p>}
</div>
```

**Padrão de layout flex para opções** (do UI-SPEC §RadioGroupField):
```tsx
<div className={cn('flex gap-2', layout === 'horizontal' ? 'flex-row flex-wrap' : 'flex-col')}>
  {options.map(opt => (
    <button
      key={opt.value}
      type="button"
      onClick={() => field.onChange(opt.value)}
      className={cn(
        'min-h-[44px] rounded-md px-3 py-2.5 text-sm text-left transition-colors',
        field.value === opt.value
          ? 'ring-2 ring-primary bg-primary/10 text-primary font-medium'
          : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
      )}
    >
      {opt.label}
    </button>
  ))}
</div>
```

**Nota:** `type="button"` é obrigatório para evitar submit acidental do `<form>`. Ver padrão em button.tsx linha 30.

---

### `src/components/ui/CheckboxGroupField.tsx` (component, request-response)

**Análogo:** `src/components/ui/select.tsx` (wrapper div + erro inline)

**Padrão de wrapper** (select.tsx linhas 13-38):
```tsx
<div className="flex flex-col gap-1">
  <label className="text-sm font-semibold text-gray-700">
    {label}{required && <span className="text-g1 ml-0.5">*</span>}
  </label>
  {/* Controller com array de checkboxes */}
  {error && <p className="text-g1 text-xs">{error}</p>}
</div>
```

**Padrão Controller para array de checkboxes** (do RESEARCH.md §Armadilha 6 — padrão verificado):
```tsx
<Controller
  name={name}
  control={control}
  defaultValue={[]}
  render={({ field }) => (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-primary"
            checked={field.value?.includes(opt.value) ?? false}
            onChange={(e) => {
              const current: string[] = field.value ?? []
              field.onChange(
                e.target.checked
                  ? [...current, opt.value]
                  : current.filter((v: string) => v !== opt.value)
              )
            }}
          />
          <span className="text-sm text-gray-700">{opt.label}</span>
        </label>
      ))}
    </div>
  )}
/>
```

**Checkbox master "Selecionar todos" (Torre Sienge)** — prop opcional `showSelectAll?: boolean`:
```tsx
// Exibido acima do grupo quando showSelectAll === true
{showSelectAll && (
  <label className="flex items-center gap-2 border-b border-gray-100 pb-2 mb-2">
    <input
      type="checkbox"
      className="h-4 w-4 accent-primary"
      checked={field.value?.length === options.length}
      onChange={(e) => {
        field.onChange(e.target.checked ? options.map(o => o.value) : [])
      }}
    />
    <span className="text-sm font-semibold text-gray-800">Selecionar todos os módulos</span>
  </label>
)}
```

---

### `src/components/ui/ConditionalField.tsx` (component, event-driven)

**Análogo:** Nenhum análogo existente na codebase. Padrão baseado em RESEARCH.md §Padrão 2 e CONTEXT.md §specifics.

**Padrão de imports:**
```tsx
import { useEffect, type ReactNode } from 'react'
```

**Padrão de props e implementação** (RESEARCH.md linhas 388-402):
```tsx
interface ConditionalFieldProps {
  condition: boolean
  fieldName: string
  unregisterFn: (name: string, options?: { keepValue?: boolean }) => void
  children: ReactNode
}

export function ConditionalField({
  condition,
  fieldName,
  unregisterFn,
  children,
}: ConditionalFieldProps) {
  useEffect(() => {
    if (!condition) {
      unregisterFn(fieldName, { keepValue: false })
    }
  }, [condition, fieldName, unregisterFn])

  if (!condition) return null
  return <>{children}</>
}
```

**Regra crítica do UI-SPEC:** Não usar `display:none` — `condition === false` deve retornar `null` para que o campo seja removido do DOM e `unregister` funcione corretamente com Zod.

---

### `src/schemas/identificacao.ts` (schema, transform)

**Análogo:** `src/schemas/createOrg.ts` (linhas 1-11)

**Padrão de import Zod** (createOrg.ts linha 1):
```typescript
import { z } from 'zod'
```

**Padrão de schema z.object + z.infer** (createOrg.ts linhas 3-11):
```typescript
export const createOrgSchema = z.object({
  name: z.string().trim().min(1, 'O nome é obrigatório'),
  cnpj: z
    .string()
    .min(1, 'O CNPJ é obrigatório')
    .regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos'),
})

export type CreateOrgFormData = z.infer<typeof createOrgSchema>
```

**Padrão adaptado para identificacao.ts:**
```typescript
import { z } from 'zod'

export const identificacaoSchema = z.object({
  empresa: z.string().trim().min(2, 'Mínimo 2 caracteres'),
  cnpj: z
    .string()
    .min(1, 'Campo obrigatório')
    .regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'Formato inválido'),
  // campos opcionais — .optional() em todos os não obrigatórios
  dataReuniao: z.string().optional(),
  participantes: z.string().optional(),
  sponsorPiloto: z.string().optional(),
  // ... demais campos
})

export type IdentificacaoData = z.infer<typeof identificacaoSchema>

// Constante para cálculo de completeness em useFormSection
export const IDENTIFICACAO_REQUIRED_COUNT = 2
```

**Regra de Zod v4 (RESEARCH.md §Armadilha 5):** Usar slugs nos valores de enum (`z.enum(['sim-power-bi', 'nao'])`), nunca labels com acentos. Labels ficam apenas na prop `options[]` do field component.

---

### `src/schemas/torre-decisao.ts` (schema, transform)

**Análogo:** `src/schemas/createOrg.ts`

**Padrão com z.enum e campos opcionais** (do RESEARCH.md §Padrão 4):
```typescript
import { z } from 'zod'

export const torreDecisaoSchema = z.object({
  reuniaoGestao: z.enum(['semanal', 'quinzenal', 'mensal', 'eventual', 'nao-estruturada']).optional(),
  existeBI: z.enum(['sim-power-bi', 'sim-outra', 'em-implantacao', 'nao']).optional(),
  qualBI: z.string().optional(),           // campo condicional — sempre optional()
  decisoesMelhorar: z.array(z.string()).optional(), // array de checkboxes
  nivelGerencial: z.enum(['g1', 'g2', 'g3', 'g4', 'g5']).optional(),
  // ...
})

export type TorreDecisaoData = z.infer<typeof torreDecisaoSchema>
export const TORRE_DECISAO_REQUIRED_COUNT = 0
```

---

### `src/schemas/torre-sienge.ts` (schema, transform)

**Análogo:** `src/schemas/createOrg.ts` (padrão base), com extensão para schema aninhado

**Padrão de schema aninhado para 12 módulos × 5 colunas** (RESEARCH.md §Armadilha 1):
```typescript
import { z } from 'zod'

const moduleSchema = z.object({
  contratado: z.enum(['sim', 'nao', 'nao-sabe', 'nao-aplicavel']).optional(),
  usoReal: z.enum(['total', 'parcial', 'baixo', 'nao-usa']).optional(),
  confiancaDado: z.enum(['alta', 'media', 'baixa', 'nao-confiavel']).optional(),
  controleParalelo: z.enum(['nao', 'excel', 'bi', 'outro', 'informal']).optional(),
  observacoes: z.string().optional(),
})

export const torreSiengeSchema = z.object({
  modules: z.object({
    cadastros: moduleSchema,
    financeiro: moduleSchema,
    inadimplencia: moduleSchema,
    orcamento: moduleSchema,
    planejamento: moduleSchema,
    medicoes: moduleSchema,
    compras: moduleSchema,
    comercial: moduleSchema,
    unidades: moduleSchema,
    contabilidade: moduleSchema,
    posObra: moduleSchema,
    bi: moduleSchema,
  }),
})

export type TorreSiengeData = z.infer<typeof torreSiengeSchema>
export const TORRE_SIENGE_REQUIRED_COUNT = 0
```

**Padrão de nomeação dos módulos:** slugs sem acento nem espaço (`posObra`, não `pós-obra`). O label com acento fica no componente de seção.

---

### `src/schemas/torre-acesso.ts` e `src/schemas/torre-classificacao.ts` (schema, transform)

**Análogo:** `src/schemas/createOrg.ts` — mesma estrutura de `torre-decisao.ts`.

Ambos seguem o padrão `z.object({ ... })` com campos `.optional()` para selects e `z.array(z.string()).optional()` para checkboxes. `TORRE_ACESSO_REQUIRED_COUNT = 0`, `TORRE_CLASSIFICACAO_REQUIRED_COUNT = 0`.

---

### `src/features/form/sections/IdentificacaoSection.tsx` (component, request-response)

**Análogo principal:** `src/components/admin/CreateOrgModal.tsx`

**Padrão de imports** (CreateOrgModal.tsx linhas 1-18):
```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useFormStore, TabKey } from '@/stores/formStore'
import { identificacaoSchema, type IdentificacaoData, IDENTIFICACAO_REQUIRED_COUNT } from '@/schemas/identificacao'
import { Input, SelectField, TextareaField } from '@/components/ui'
```

**Padrão de useForm com zodResolver** (CreateOrgModal.tsx linhas 30-33):
```tsx
const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm<CreateOrgFormData>({
  resolver: zodResolver(createOrgSchema),
  mode: 'onBlur',
})
```
Para Section components, a variação é `mode: 'onChange'` e adicionar `watch` + `control`:
```tsx
const store = useFormStore(tenantId)
const { control, watch, unregister, formState: { errors } } = useForm<IdentificacaoData>({
  resolver: zodResolver(identificacaoSchema),
  defaultValues: (store.sectionData[TabKey.Identificacao] ?? {}) as IdentificacaoData,
})
```

**Padrão de sync RHF → Zustand** (D-02 do CONTEXT.md — padrão novo sem análogo direto):
```tsx
// Imediatamente após useForm — dentro do Section component
const values = watch()
useEffect(() => {
  store.updateSection(TabKey.Identificacao, values as Record<string, unknown>)
}, [values]) // eslint-disable-line react-hooks/exhaustive-deps
// CRÍTICO: não adicionar `store` às deps — causa loop infinito (T-05-04-04)
```

**Padrão de label + Input com erro** (CreateOrgModal.tsx linhas 72-87):
```tsx
<div className="flex flex-col gap-1">
  <label htmlFor="org-name" className="text-sm text-gray-700">
    Nome da organização
  </label>
  <Input
    id="org-name"
    type="text"
    placeholder="Ex: Construtora Silva Ltda."
    error={!!errors.name}
    errorMessage={errors.name?.message}
    {...register('name')}
  />
</div>
```
Para campos com `Controller` (SelectField, TextareaField), trocar `{...register()}` por `control={control} error={errors.campo?.message}`.

**Padrão de estrutura JSX do form** (CreateOrgModal.tsx linhas 70-121):
```tsx
// Section components NÃO têm handleSubmit — formulário é salvo automaticamente
// O <form> existe para semântica HTML mas não tem onSubmit nesta fase
<form className="max-w-2xl space-y-4">
  {/* grupos de campos */}
</form>
```

---

### `src/features/form/sections/TorreDecisaoSection.tsx` (component, request-response)

**Análogo:** `src/components/admin/CreateOrgModal.tsx` — mesmo padrão de IdentificacaoSection.

**Padrão adicional para ConditionalField** (D-02 do CONTEXT.md + RESEARCH.md §Padrão 3):
```tsx
// Após useForm:
const temBI = watch('existeBI')
const mostraQualBI = temBI === 'sim-power-bi' || temBI === 'sim-outra'

// No JSX:
<ConditionalField condition={mostraQualBI} fieldName="qualBI" unregisterFn={unregister}>
  <SelectField name="qualBI" control={control} label="Qual ferramenta de BI?" options={[...]} />
</ConditionalField>
```

---

### `src/features/form/sections/TorreSiengeSection.tsx` (component, request-response)

**Análogo:** `src/components/admin/CreateOrgModal.tsx`

**Padrão especial para tabela de 12 módulos** — campos aninhados com `name` usando notação de ponto:
```tsx
// Campos do módulo usam nome aninhado: "modules.cadastros.contratado"
<SelectField
  name="modules.cadastros.contratado"
  control={control}
  label="Contratado no Sienge?"
  options={contratadoOptions}
  error={errors.modules?.cadastros?.contratado?.message}
/>
```

**Padrão de CheckboxGroupField** (RESEARCH.md §Armadilha 6):
```tsx
<CheckboxGroupField
  name="modulosSelecionados"
  control={control}
  label="Módulos Sienge"
  options={modulosOptions}
  showSelectAll
  error={errors.modulosSelecionados?.message}
/>
```

---

### `src/features/form/sections/TorreAcessoSection.tsx` e `src/features/form/sections/TorreClassificacaoSection.tsx` (component, request-response)

**Análogo:** `src/components/admin/CreateOrgModal.tsx` — mesmo padrão de IdentificacaoSection e TorreDecisaoSection, sem campos condicionais adicionais.

---

### `src/features/form/useFormSection.ts` (hook, event-driven) — MODIFICAR

**Análogo:** si mesmo (arquivo existente nas linhas 1-41)

**Assinatura atual** (useFormSection.ts linhas 15-23):
```typescript
export function useFormSection(
  tenantId: string,
  tab: TabKey
): {
  data: Record<string, unknown>
  updateField: (field: string, value: unknown) => void
  errors: Record<string, string>
  completeness: number
}
```

**Assinatura nova — ampliar com `control?` opcional** (D-03 do CONTEXT.md):
```typescript
import { type Control, type FieldValues, useFormState } from 'react-hook-form'

export function useFormSection<T extends FieldValues = FieldValues>(
  tenantId: string,
  tab: TabKey,
  control?: Control<T>,
  totalRequired?: number
): {
  data: Record<string, unknown>
  updateField: (field: string, value: unknown) => void
  errors: Record<string, string>
  completeness: number
}
```

**Padrão de compatibilidade retroativa** (manter bloco existente nas linhas 34-38):
```typescript
// Sem control: comportamento Phase 5 preservado
const errors: Record<string, string> = {}
const completeness = store.visitedTabs.has(tab) ? 0.01 : 0
```

**Novo bloco quando `control` presente:**
```typescript
// REGRA: useFormState deve ser chamado dentro do hook, não condicionalmente
// Usar padrão de early return antes de chamar hooks é inválido
// Solução: criar sub-hook interno ou chamar useFormState sempre
```

**Importante:** `useFormState` é um hook React — não pode ser chamado condicionalmente. O padrão correto é sempre chamá-lo, mas ignorar o resultado quando `control` é undefined. Ver nota do RESEARCH.md §Padrão 6 sobre `useFormState({ control })`.

---

### `src/features/form/FormLayout.tsx` (component, request-response) — MODIFICAR

**Análogo:** si mesmo (arquivo existente linhas 1-99)

**Padrão de switch por activeTab** (substituir linhas 90-96 do arquivo atual):

Atual (linhas 90-95):
```tsx
<main className="flex-1 p-4 md:p-6">
  <h1 className="text-xl font-semibold text-gray-900">{activeTabConfig.label}</h1>
  <p className="mt-2 text-sm text-gray-500">
    Esta seção ainda não possui campos. Em breve os campos estarão disponíveis aqui.
  </p>
</main>
```

Padrão da modificação (RESEARCH.md §Padrão 5):
```tsx
import { IdentificacaoSection } from './sections/IdentificacaoSection'
import { TorreDecisaoSection } from './sections/TorreDecisaoSection'
import { TorreSiengeSection } from './sections/TorreSiengeSection'
import { TorreAcessoSection } from './sections/TorreAcessoSection'
import { TorreClassificacaoSection } from './sections/TorreClassificacaoSection'

function renderSection(activeTab: TabKey, tenantId: string) {
  switch (activeTab) {
    case TabKey.Identificacao: return <IdentificacaoSection tenantId={tenantId} />
    case TabKey.TorreDecisao: return <TorreDecisaoSection tenantId={tenantId} />
    case TabKey.TorreSienge: return <TorreSiengeSection tenantId={tenantId} />
    case TabKey.TorreAcesso: return <TorreAcessoSection tenantId={tenantId} />
    case TabKey.TorreClassificacao: return <TorreClassificacaoSection tenantId={tenantId} />
    default:
      return (
        <p className="text-sm text-gray-500">
          Esta seção ainda não possui campos.
        </p>
      )
  }
}

// No JSX, dentro do <main>:
<main className="flex-1 p-4 md:p-6">
  <h1 className="text-xl font-semibold text-gray-900">{activeTabConfig.label}</h1>
  {renderSection(store.activeTab, tenantId)}
</main>
```

**Preservar:** Todo o restante do FormLayout (linhas 1-89 e 96-99) permanece inalterado — cross-tenant guard, hash sync, sidebar, ProgressBar, TabNavigation.

---

### `src/components/ui/index.ts` (barrel, —) — MODIFICAR

**Análogo:** si mesmo (arquivo existente linhas 1-23)

**Padrão de export atual** (index.ts linhas 1-23):
```typescript
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'
export { Input } from './input'
export { Textarea } from './textarea'
export { Select } from './select'
// ...
```

**Adições a inserir após os exports existentes:**
```typescript
// Novos field components — Phase 6
export { SelectField } from './select-field'
export { TextareaField } from './textarea-field'
export { RadioGroupField } from './radio-group-field'
export { CheckboxGroupField } from './checkbox-group-field'
export { ConditionalField } from './conditional-field'
```

**Convenção de nomes de arquivo:** `kebab-case.tsx` (padrão existente — `button.tsx`, `select.tsx`). Novos arquivos seguem a mesma convenção: `select-field.tsx`, `textarea-field.tsx`, etc.

---

## Padrões Compartilhados

### 1. Padrão de label + campo + erro (todos os field components)

**Fonte:** `src/components/ui/select.tsx` linhas 13-37 e `src/components/admin/CreateOrgModal.tsx` linhas 72-87
**Aplicar a:** SelectField, TextareaField, RadioGroupField, CheckboxGroupField

```tsx
<div className="flex flex-col gap-1">
  <label className="text-sm font-semibold text-gray-700">
    {label}
    {required && <span className="text-g1 ml-0.5">*</span>}
  </label>
  {/* campo específico de cada component */}
  {error && <p className="text-g1 text-xs">{error}</p>}
</div>
```

### 2. Padrão de import de cn (todos os novos components com lógica de classe condicional)

**Fonte:** `src/lib/utils.ts` linhas 1-13 e todos os componentes UI
**Aplicar a:** RadioGroupField (selecionado vs não selecionado)

```tsx
import { cn } from '@/lib/utils'
// Uso:
className={cn('base-classes', condition && 'conditional-classes', className)}
```

### 3. Padrão de useForm + zodResolver (todos os Section components)

**Fonte:** `src/components/admin/CreateOrgModal.tsx` linhas 28-33
**Aplicar a:** IdentificacaoSection, TorreDecisaoSection, TorreSiengeSection, TorreAcessoSection, TorreClassificacaoSection

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const { control, watch, unregister, formState: { errors } } = useForm<SectionData>({
  resolver: zodResolver(sectionSchema),
  defaultValues: (store.sectionData[tab] ?? {}) as SectionData,
})
```

### 4. Padrão de sync RHF → Zustand (todos os Section components)

**Fonte:** CONTEXT.md D-02 — padrão novo na codebase, sem análogo ainda
**Aplicar a:** Todos os 5 Section components
**Anti-pattern a evitar:** Não colocar `store` nas deps do useEffect (causa loop — referenciado em FormLayout.tsx linha 42 como T-05-04-04)

```tsx
const values = watch()
useEffect(() => {
  store.updateSection(tab, values as Record<string, unknown>)
}, [values]) // eslint-disable-line react-hooks/exhaustive-deps
```

### 5. Padrão de alias de importação `@/`

**Fonte:** Todos os arquivos existentes (FormLayout.tsx, CreateOrgModal.tsx, formStore.ts)
**Aplicar a:** Todos os arquivos novos

```tsx
import { useFormStore, TabKey } from '@/stores/formStore'
import { TAB_CONFIG } from '@/features/form/tabConfig'
import { SelectField, TextareaField } from '@/components/ui'
import { sectionSchema } from '@/schemas/nome-da-aba'
```

### 6. Padrão de estado de erro de campo

**Fonte:** `src/components/ui/input.tsx` linha 22 e `src/components/admin/CreateOrgModal.tsx` linhas 82-83
**Aplicar a:** Todos os field components e Section components

```tsx
// Nos Section components, passar erro assim:
error={errors.nomeCampo?.message}

// Nos field components base (Input, Select, Textarea), o prop é `error: boolean`:
error={!!errors.nomeCampo}
errorMessage={errors.nomeCampo?.message}

// Nos novos field wrapper components (SelectField, TextareaField, etc.), o prop é `error?: string`:
// O field wrapper converte internamente: error={!!error} errorMessage={error}
```

---

## Sem Análogo Encontrado

| Arquivo | Role | Data Flow | Motivo |
|---------|------|-----------|--------|
| `src/components/ui/ConditionalField.tsx` | component | event-driven | Nenhum componente de show/hide condicional existe na codebase. Padrão a seguir: RESEARCH.md §Padrão 2 (linhas 382-402). |

---

## Metadados

**Escopo da busca de análogos:** `roteiro-unificado/src/` — todos os subdiretórios
**Arquivos lidos:** 17 arquivos
**Data do mapeamento:** 2026-05-22

**Notas de implementação críticas:**
1. **Loop infinito:** `store` nunca entra nas `deps` do `useEffect` nos Section components — padrão documentado no FormLayout.tsx linha 42.
2. **Zod v4:** Campos condicionais devem ser `.optional()` no schema — unregister remove o valor, Zod valida `undefined` como válido para `.optional()`.
3. **Controller obrigatório:** Nunca usar `register()` direto para SelectField, RadioGroupField, CheckboxGroupField, TextareaField — sempre via `Controller`. `register()` fica restrito a `<Input>` nativo nos Section components (ex: campos de texto simples).
4. **Props explícitas:** Sem `FormProvider` / `useFormContext()` — decisão D-08 bloqueada. `control` e `errors` são sempre passados via props.
5. **Nomes de arquivo:** `kebab-case.tsx` para novos components UI (`select-field.tsx`, não `SelectField.tsx`).
