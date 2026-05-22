# Phase 7: Campos — Habilitações, NDA & Classificação G1-G5 — Mapa de Padrões

**Mapeado:** 2026-05-22
**Arquivos analisados:** 14 (novos/modificados)
**Analogs encontrados:** 14 / 14

---

## Classificação de Arquivos

| Arquivo Novo / Modificado | Role | Fluxo de Dados | Analog Mais Próximo | Qualidade do Match |
|---------------------------|------|----------------|---------------------|--------------------|
| `src/features/form/sections/HabVendaSection.tsx` | component (form section) | request-response | `src/features/form/sections/TorreSiengeSection.tsx` | exact — mesmo padrão de matriz aninhada |
| `src/features/form/sections/HabRepositoriosSection.tsx` | component (form section) | request-response | `src/features/form/sections/TorreSiengeSection.tsx` | exact — mesmo padrão de matriz aninhada |
| `src/features/form/sections/HabResponsaveisSection.tsx` | component (form section) | request-response | `src/features/form/sections/TorreSiengeSection.tsx` | exact — mesmo padrão de matriz aninhada |
| `src/features/form/sections/HabClassificacaoSection.tsx` | component (form section) | request-response | `src/features/form/sections/TorreClassificacaoSection.tsx` | exact — selects + textareas simples |
| `src/features/form/sections/NdaSection.tsx` | component (form section) | request-response | `src/features/form/sections/TorreClassificacaoSection.tsx` | role-match + checkbox literal |
| `src/schemas/hab-venda.ts` | model (schema) | transform | `src/schemas/torre-sienge.ts` | exact — schema aninhado com array de slugs |
| `src/schemas/hab-repositorios.ts` | model (schema) | transform | `src/schemas/torre-sienge.ts` | exact — schema aninhado com array de slugs |
| `src/schemas/hab-responsaveis.ts` | model (schema) | transform | `src/schemas/torre-sienge.ts` | exact — schema aninhado com array de slugs |
| `src/schemas/hab-classificacao.ts` | model (schema) | transform | `src/schemas/torre-classificacao.ts` | exact — campos flat opcionais + REQUIRED_COUNT |
| `src/schemas/nda.ts` | model (schema) | transform | `src/schemas/torre-classificacao.ts` | role-match + `z.literal(true)` |
| `src/lib/readiness.ts` | utility (pure function) | transform | `src/lib/utils.ts` | role-match — arquivo de lib pura |
| `src/features/form/ReadinessClassification.tsx` | component (display) | request-response | `src/components/ui/badge.tsx` + `src/features/form/ProgressBadge.tsx` | role-match — display derivado de store |
| `src/components/ui/input-field.tsx` | component (field wrapper) | request-response | `src/components/ui/select-field.tsx` | exact — mesmo padrão Controller wrapper |
| `src/features/form/FormLayout.tsx` *(modificar)* | component (shell) | request-response | si mesmo (adição de cases no switch) | exact — padrão switch já estabelecido |
| `src/constants/nda-text.ts` | config (constant) | — | nenhum análogo — primeiro arquivo `constants/` | no-analog |
| `src/components/ui/index.ts` *(modificar)* | config (barrel export) | — | si mesmo (adição de export) | exact |

---

## Atribuições de Padrão

---

### `src/features/form/sections/HabClassificacaoSection.tsx` (component, request-response)

**Analog:** `roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx`

**Padrão de imports** (linhas 1-9):
```typescript
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import {
  habClassificacaoSchema,
  type HabClassificacaoData,
} from '@/schemas/hab-classificacao'
import { SelectField, TextareaField } from '@/components/ui'
```

**Padrão de setup do componente** (linhas 43-68):
```typescript
interface HabClassificacaoSectionProps {
  tenantId: string
}

export function HabClassificacaoSection({ tenantId }: HabClassificacaoSectionProps) {
  const store = useFormStore(tenantId)

  const {
    control,
    watch,
    formState: { errors },
  } = useForm<HabClassificacaoData>({
    resolver: zodResolver(habClassificacaoSchema),
    defaultValues: (store.sectionData[TabKey.HabClassificacao] ??
      {}) as Partial<HabClassificacaoData>,
    mode: 'onBlur',
  })

  // D-02: sync RHF → Zustand via subscription (evita loop infinito — watch() retorna
  // novo objeto a cada render, o que causaria deps instáveis no useEffect)
  useEffect(() => {
    const subscription = watch((values) => {
      store.updateSection(TabKey.HabClassificacao, values as Record<string, unknown>)
    })
    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
```

**Padrão de render** (linhas 70-151):
```tsx
  return (
    <form className="max-w-2xl" noValidate>
      <div className="space-y-4">
        <SelectField
          name="classificacaoFinal"
          control={control}
          label="Classificação final"
          options={classificacaoFinalOptions}
          error={errors.classificacaoFinal?.message as string | undefined}
        />
        {/* demais SelectField e TextareaField seguem o mesmo padrão */}
      </div>
      <hr className="my-6 border-gray-100" />
      {/* grupos adicionais com <div className="space-y-4"> */}
    </form>
  )
```

---

### `src/features/form/sections/HabVendaSection.tsx` (component, request-response)

**Analog:** `roteiro-unificado/src/features/form/sections/TorreSiengeSection.tsx`

**Padrão de imports com FieldPath para schema aninhado** (linhas 1-11):
```typescript
import { useEffect } from 'react'
import { useForm, type FieldPath } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import {
  habVendaSchema,
  type HabVendaData,
  type HabScenarioSlug,
  HAB_SCENARIOS,
} from '@/schemas/hab-venda'
import { SelectField, TextareaField } from '@/components/ui'
```

**Padrão de erros aninhados** (linha 45):
```typescript
// Tipo auxiliar para erros aninhados — cast controlado (padrão TorreSiengeSection linha 45)
type ScenarioErrors = Record<HabScenarioSlug, Record<string, { message?: string }>>
// ...
const scenarioErrors = (errors.scenarios as unknown as ScenarioErrors) ?? {}
```

**Padrão de render de matriz aninhada** (linhas 75-130):
```tsx
  return (
    <form className="max-w-5xl" noValidate>
      {/* Campos flat acima da matriz */}
      <div className="mb-6 space-y-4">
        <SelectField name="principalFormaVenda" control={control} label="Principal forma de venda" options={...} error={...} />
        {/* demais selects e textareas */}
      </div>

      <hr className="my-6 border-gray-100" />

      <h2 className="mb-4 text-base font-semibold text-gray-900">Matriz de cenários de habilitação</h2>

      {HAB_SCENARIOS.map((scenario) => {
        const scErr = scenarioErrors[scenario.slug] ?? {}
        return (
          <article key={scenario.slug} className="mb-4 rounded-md border border-gray-200 bg-white p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-900">{scenario.label}</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SelectField
                name={`scenarios.${scenario.slug}.acontece` as FieldPath<HabVendaData>}
                control={control}
                label="Acontece hoje?"
                options={aconteceOptions}
                error={scErr.acontece?.message}
              />
              {/* demais colunas do cenário */}
            </div>
            <div className="mt-3">
              <TextareaField
                name={`scenarios.${scenario.slug}.observacoes` as FieldPath<HabVendaData>}
                control={control}
                label="Observações para escopo"
                rows={2}
              />
            </div>
          </article>
        )
      })}
    </form>
  )
```

**Nota crítica:** Cast `as FieldPath<HabVendaData>` em paths aninhados com hífen nos slugs é obrigatório (Pitfall 5 do RESEARCH.md, análogo à linha 92 do TorreSiengeSection).

---

### `src/features/form/sections/HabRepositoriosSection.tsx` (component, request-response)

**Analog:** `roteiro-unificado/src/features/form/sections/TorreSiengeSection.tsx`

Mesmo padrão de HabVendaSection. Diferença: inclui `CheckboxGroupField` para "Onde os documentos vivem hoje" antes da matriz, e a matriz usa `HAB_DOCUMENT_DOMAINS` (14 domínios) com 5 colunas por domínio (incluindo "Terceiros envolvidos" como TextareaField para FORM-02).

**Imports adicionais:**
```typescript
import {
  habRepositoriosSchema,
  type HabRepositoriosData,
  type HabDocumentSlug,
  HAB_DOCUMENT_DOMAINS,
} from '@/schemas/hab-repositorios'
import { SelectField, TextareaField, CheckboxGroupField } from '@/components/ui'
```

**Tipo auxiliar de erros:**
```typescript
type DocumentErrors = Record<HabDocumentSlug, Record<string, { message?: string }>>
const documentErrors = (errors.documents as unknown as DocumentErrors) ?? {}
```

---

### `src/features/form/sections/HabResponsaveisSection.tsx` (component, request-response)

**Analog:** `roteiro-unificado/src/features/form/sections/TorreSiengeSection.tsx`

Mesmo padrão, mas usa `HAB_RESPONSIBILITIES` (10 atividades). Diferença: inclui `CheckboxGroupField` para "Dificuldades operacionais recorrentes" antes da matriz.

**Imports adicionais:**
```typescript
import {
  habResponsaveisSchema,
  type HabResponsaveisData,
  type HabResponsabilidadeSlug,
  HAB_RESPONSIBILITIES,
} from '@/schemas/hab-responsaveis'
import { SelectField, TextareaField, CheckboxGroupField } from '@/components/ui'
```

---

### `src/features/form/sections/NdaSection.tsx` (component, request-response)

**Analog:** `roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx` (estrutura base) + `src/components/ui/checkbox-group-field.tsx` (padrão Controller para checkbox)

**Padrão de imports:**
```typescript
import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormStore, TabKey } from '@/stores/formStore'
import { ndaSchema, type NdaData } from '@/schemas/nda'
import { TextareaField, InputField } from '@/components/ui'
import { NDA_TEXT } from '@/constants/nda-text'
```

**Padrão de defaultValues com data auto-preenchida:**
```typescript
  const {
    control,
    watch,
    formState: { errors },
  } = useForm<NdaData>({
    resolver: zodResolver(ndaSchema),
    defaultValues: {
      ...(store.sectionData[TabKey.Nda] ?? {}),
      dataAceite: new Date().toLocaleDateString('pt-BR'),
    } as Partial<NdaData>,
    mode: 'onBlur',
  })
```

**Padrão de checkbox booleano via Controller direto** (NÃO usar CheckboxGroupField — confirmado linha 34 de checkbox-group-field.tsx: gerencia arrays, não boolean):
```tsx
      <Controller
        name="aceitaTermos"
        control={control}
        render={({ field }) => (
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="accent-primary h-4 w-4"
              checked={field.value === true}
              onChange={(e) => field.onChange(e.target.checked)}
            />
            <span className="text-sm font-semibold text-gray-700">
              Li e aceito os termos do NDA mútuo
              <span className="text-g1 ml-0.5">*</span>
            </span>
          </label>
        )}
      />
      {errors.aceitaTermos && (
        <p className="text-g1 text-xs">{errors.aceitaTermos.message as string}</p>
      )}
```

**Padrão de div scrollable para texto legal:**
```tsx
      <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 bg-gray-50 text-sm text-gray-700">
        {NDA_TEXT.map((paragraph, i) => (
          <p key={i} className="mb-3 last:mb-0">{paragraph}</p>
        ))}
      </div>
```

---

### `src/schemas/hab-venda.ts` (model, transform)

**Analog:** `roteiro-unificado/src/schemas/torre-sienge.ts`

**Padrão de schema aninhado** (linhas 1-50, TorreSienge completo):
```typescript
import { z } from 'zod'

// Schema reutilizável para um cenário da matriz (colunas fixas, slugs variáveis)
const scenarioSchema = z.object({
  acontece: z.enum(['sim', 'nao', 'parcial', 'nao-sabe']).optional(),
  importancia: z.enum(['alta', 'media', 'baixa', 'eventual']).optional(),
  quemConduz: z.string().optional(),
  principalDificuldade: z.string().optional(),
  observacoes: z.string().optional(),
})

export const habVendaSchema = z.object({
  // Campos flat
  principalFormaVenda: z.enum([...]).optional(),
  quemPedeDocumentos: z.enum([...]).optional(),
  prazoTipico: z.enum([...]).optional(),
  perdeuOportunidade: z.enum([...]).optional(),
  principaisExigencias: z.string().optional(),
  ondeCostumaTravar: z.string().optional(),
  // Matriz aninhada — .optional() obrigatório (Pitfall 2 do RESEARCH)
  scenarios: z.object({
    'venda-propria': scenarioSchema,
    'contratos-privados': scenarioSchema,
    // ... demais 8 slugs
  }).optional(),
})

export type HabVendaData = z.infer<typeof habVendaSchema>
export const HAB_VENDA_REQUIRED_COUNT = 0

export const HAB_SCENARIOS = [
  { slug: 'venda-propria', label: 'Venda própria de unidades / incorporação' },
  // ... 9 demais
] as const

export type HabScenarioSlug = (typeof HAB_SCENARIOS)[number]['slug']
```

**Padrão crítico — `.optional()` no objeto pai da matriz** (linha 39 de torre-sienge.ts):
```typescript
  modules: z
    .object({ cadastros: moduleSchema, /* ... */ })
    .optional()   // ← OBRIGATÓRIO — evita erro Zod com defaultValues: {}
```

---

### `src/schemas/hab-repositorios.ts` (model, transform)

**Analog:** `roteiro-unificado/src/schemas/torre-sienge.ts`

Mesmo padrão de schema aninhado. Colunas por domínio: `existeControle`, `repositorioPrincipal` (enum), `responsavelInterno` (string), `terceirosEnvolvidos` (string), `observacoes` (string). O campo `repositorioPrincipal` usa `z.enum(['ged', 'pasta-local', 'google-drive', 'sharepoint', 'nao-possui']).optional()` conforme D-09 (não string livre).

```typescript
const documentSchema = z.object({
  existeControle: z.enum(['sim', 'parcial', 'nao', 'nao-sabe']).optional(),
  repositorioPrincipal: z.enum(['ged', 'pasta-local', 'google-drive', 'sharepoint', 'nao-possui']).optional(),
  responsavelInterno: z.string().optional(),
  terceirosEnvolvidos: z.string().optional(),
  observacoes: z.string().optional(),
})

export const habRepositoriosSchema = z.object({
  // Checkboxes múltiplos (array de enum)
  ondeDocumentosVivem: z.array(z.enum([
    'google-drive', 'onedrive-sharepoint', 'dropbox', 'servidor-local',
    'sienge-erp', 'sistema-juridico', 'contador', 'escritorio-juridico',
    'email-whatsapp', 'pastas-fisicas', 'terceiros-fornecedores', 'nao-ha-padrao',
  ])).optional(),
  // Controles gerais
  existePadraoPastas: z.enum(['sim', 'parcial', 'nao']).optional(),
  existePadraoNomes: z.enum(['sim', 'parcial', 'nao']).optional(),
  controlamValidade: z.enum(['sim', 'parcial', 'nao']).optional(),
  existeTrilhaVersao: z.enum(['sim', 'parcial', 'nao']).optional(),
  observacoesRepositorios: z.string().optional(),
  // Matriz aninhada
  documents: z.object({
    'empresa-cnpj': documentSchema,
    // ... 13 demais slugs
  }).optional(),
})
```

---

### `src/schemas/hab-responsaveis.ts` (model, transform)

**Analog:** `roteiro-unificado/src/schemas/torre-sienge.ts`

Colunas por atividade: `quemFaz` (string), `existeSubstituto` (enum), `terceiroDependente` (enum), `maiorDificuldade` (string), `observacoes` (string).

```typescript
const responsabilidadeSchema = z.object({
  quemFaz: z.string().optional(),
  existeSubstituto: z.enum(['sim', 'parcial', 'nao', 'nao-sabe']).optional(),
  terceiroDependente: z.enum(['sim', 'parcial', 'nao', 'nao-sabe']).optional(),
  maiorDificuldade: z.string().optional(),
  observacoes: z.string().optional(),
})
```

---

### `src/schemas/hab-classificacao.ts` (model, transform)

**Analog:** `roteiro-unificado/src/schemas/torre-classificacao.ts`

**Padrão completo** (linhas 1-50 de torre-classificacao.ts):
```typescript
import { z } from 'zod'

export const habClassificacaoSchema = z.object({
  // Selects — campo que alimenta calculateReadiness
  classificacaoFinal: z.enum(['hab-a', 'hab-b', 'hab-c', 'hab-d', 'hab-e']).optional(),
  abordagemRecomendada: z.enum([
    'implantar-direto',
    'implantar-carga-assistida',
    'ativar-repositorio-responsaveis',
    'comecar-dossie-especifico',
    'fase-preparatoria',
  ]).optional(),
  escopoInicialSugerido: z.enum([
    'empresa-cnpj', 'obra-empreendimento', 'financiamento',
    'licitacao', 'contrato-privado-homologacao',
    'fiscalizacao-auditoria', 'misto-reduzido',
  ]).optional(),
  complexidadePreco: z.enum(['baixa', 'media', 'alta', 'critica']).optional(),
  // Textareas livres
  fase1: z.string().optional(),
  fase2: z.string().optional(),
  riscosPrincipais: z.string().optional(),
  evidenciasEssenciais: z.string().optional(),
  observacoesFinais: z.string().optional(),
})

export type HabClassificacaoData = z.infer<typeof habClassificacaoSchema>
export const HAB_CLASSIFICACAO_REQUIRED_COUNT = 0
```

---

### `src/schemas/nda.ts` (model, transform)

**Analog:** `roteiro-unificado/src/schemas/torre-classificacao.ts` (estrutura) + padrão `z.literal(true)` do RESEARCH.md D-07

```typescript
import { z } from 'zod'

export const ndaSchema = z.object({
  nomeRepresentante: z.string().optional(),
  cargo: z.string().optional(),
  cpf: z.string().optional(),
  dataAceite: z.string().default(() => new Date().toLocaleDateString('pt-BR')),
  aceitaTermos: z.literal(true, {
    errorMap: () => ({ message: 'Você deve aceitar os termos do NDA para continuar' }),
  }),
  observacoes: z.string().optional(),
})

export type NdaData = z.infer<typeof ndaSchema>

/**
 * aceitaTermos é o único campo obrigatório desta aba.
 */
export const NDA_REQUIRED_COUNT = 1
```

**Atenção:** `z.literal(true)` requer `errorMap` explícito e o Controller deve inicializar com `false` no defaultValues, não `undefined` (Pitfall 3 do RESEARCH.md).

---

### `src/lib/readiness.ts` (utility, transform)

**Analog:** `roteiro-unificado/src/lib/utils.ts` (arquivo de lib pura sem dependências React)

**Padrão completo conforme D-03:**
```typescript
import { TabKey } from '@/stores/formStore'

export interface ReadinessResult {
  gerencial: 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | null
  habilitacoes: 'HAB-A' | 'HAB-B' | 'HAB-C' | 'HAB-D' | 'HAB-E' | null
  ndaAceito: boolean
}

export function calculateReadiness(
  sectionData: Partial<Record<TabKey, Record<string, unknown>>>
): ReadinessResult {
  const torreDecisao = sectionData[TabKey.TorreDecisao] ?? {}
  const habClassificacao = sectionData[TabKey.HabClassificacao] ?? {}
  const nda = sectionData[TabKey.Nda] ?? {}

  const rawGerencial = torreDecisao['nivelGerencial'] as string | undefined
  const rawHab = habClassificacao['classificacaoFinal'] as string | undefined

  // slugs do schema são lowercase (confirmado: torre-decisao.ts linha 30)
  const gerencialMap: Record<string, ReadinessResult['gerencial']> = {
    g1: 'G1', g2: 'G2', g3: 'G3', g4: 'G4', g5: 'G5',
  }
  const habMap: Record<string, ReadinessResult['habilitacoes']> = {
    'hab-a': 'HAB-A', 'hab-b': 'HAB-B', 'hab-c': 'HAB-C',
    'hab-d': 'HAB-D', 'hab-e': 'HAB-E',
  }

  return {
    gerencial: rawGerencial ? (gerencialMap[rawGerencial] ?? null) : null,
    habilitacoes: rawHab ? (habMap[rawHab] ?? null) : null,
    ndaAceito: nda['aceitaTermos'] === true,
  }
}
```

**Confirmação de A1 (slugs lowercase):** `torreDecisaoSchema.nivelGerencial` usa `z.enum(['g1', 'g2', 'g3', 'g4', 'g5'])` — confirmado em `src/schemas/torre-decisao.ts` linha 30.

---

### `src/features/form/ReadinessClassification.tsx` (component display, request-response)

**Analog:** `roteiro-unificado/src/components/ui/badge.tsx` (uso do Badge existente) + `roteiro-unificado/src/features/form/ProgressBadge.tsx` (padrão de display derivado de store)

**Padrão de imports e useMemo** (conforme D-04):
```typescript
import { useMemo } from 'react'
import { useFormStore } from '@/stores/formStore'
import { calculateReadiness } from '@/lib/readiness'
import { Badge, type Grade } from '@/components/ui'

interface ReadinessClassificationProps {
  tenantId: string
}

export function ReadinessClassification({ tenantId }: ReadinessClassificationProps) {
  const store = useFormStore(tenantId)
  const result = useMemo(
    () => calculateReadiness(store.sectionData),
    [store.sectionData]
  )
```

**Padrão de render dos badges** (tokens do Badge existente — badge.tsx linhas 3-8):
```tsx
  // Badge G1-G5: reutiliza <Badge grade={...} /> — gradeConfig em badge.tsx já tem G1-G5
  // Badge HAB-X: span inline (Grade type não cobre HAB-X — não existe no gradeConfig)
  const habConfig: Record<string, { bg: string; text: string; label: string }> = {
    'HAB-A': { bg: 'bg-green-100', text: 'text-green-700', label: 'HAB-A — Pronta' },
    'HAB-B': { bg: 'bg-blue-100', text: 'text-blue-700', label: 'HAB-B — Organizada' },
    'HAB-C': { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'HAB-C — Parcial' },
    'HAB-D': { bg: 'bg-orange-100', text: 'text-orange-700', label: 'HAB-D — Risco alto' },
    'HAB-E': { bg: 'bg-red-100', text: 'text-red-700', label: 'HAB-E — Não recomendada' },
  }

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 mb-4">
      {result.gerencial ? (
        <Badge grade={result.gerencial as Grade} />
      ) : (
        <span className="text-sm text-gray-400">Preencha as abas de classificação para ver o resultado</span>
      )}
      {result.habilitacoes && (() => {
        const cfg = habConfig[result.habilitacoes]
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
            {cfg.label}
          </span>
        )
      })()}
      {result.ndaAceito && (
        <span className="text-xs text-green-700 font-medium">NDA aceito</span>
      )}
    </div>
  )
```

---

### `src/components/ui/input-field.tsx` (component field wrapper, request-response)

**Analog:** `roteiro-unificado/src/components/ui/select-field.tsx` (padrão exato de Controller wrapper)

**Padrão completo** baseado nas linhas 1-45 de select-field.tsx e input.tsx:
```typescript
import { Controller, type Control, type FieldPath, type FieldValues } from 'react-hook-form'
import { Input } from './input'

interface InputFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  error?: string
}

export function InputField<T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  required,
  disabled,
  error,
}: InputFieldProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {required && <span className="text-g1 ml-0.5">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            {...field}
            placeholder={placeholder}
            disabled={disabled}
            error={!!error}
            errorMessage={error}
          />
        )}
      />
      {error && <p className="text-g1 text-xs">{error}</p>}
    </div>
  )
}
```

**Atenção:** Após criar `input-field.tsx`, adicionar ao `src/components/ui/index.ts`:
```typescript
export { InputField } from './input-field'
```

---

### `src/features/form/FormLayout.tsx` (modificação)

**Analog:** si mesmo — adicionar 5 cases no switch existente (linhas 21-40)

**Padrão de imports a adicionar** (após linha 14):
```typescript
import { HabVendaSection } from './sections/HabVendaSection'
import { HabRepositoriosSection } from './sections/HabRepositoriosSection'
import { HabResponsaveisSection } from './sections/HabResponsaveisSection'
import { HabClassificacaoSection } from './sections/HabClassificacaoSection'
import { NdaSection } from './sections/NdaSection'
import { ReadinessClassification } from './ReadinessClassification'
```

**Padrão de cases a adicionar no switch** (antes do `default` na linha 33):
```typescript
    case TabKey.HabVenda:
      return <HabVendaSection tenantId={tenantId} />
    case TabKey.HabRepositorios:
      return <HabRepositoriosSection tenantId={tenantId} />
    case TabKey.HabResponsaveis:
      return <HabResponsaveisSection tenantId={tenantId} />
    case TabKey.HabClassificacao:
      return <HabClassificacaoSection tenantId={tenantId} />
    case TabKey.Nda:
      return <NdaSection tenantId={tenantId} />
```

**Padrão de placement do ReadinessClassification** (linhas 122-124 atuais, inserir após `<h1>`):
```tsx
          <h1 className="text-xl font-semibold text-gray-900">{activeTabConfig.label}</h1>
          <ReadinessClassification tenantId={tenantId} />
          {renderSection(store.activeTab, tenantId)}
```

---

### `src/constants/nda-text.ts` (config, —)

**Sem analog direto** — primeiro arquivo no diretório `constants/`. Seguir padrão de constantes TypeScript do projeto (`as const`, export nomeado).

```typescript
/**
 * Texto integral do NDA mútuo — fonte: HTML de referência linhas 542-586.
 * Cada item do array é um parágrafo separado (renderizado como <p> no NdaSection).
 */
export const NDA_TEXT: readonly string[] = [
  'Cláusula 1 — ...',
  // ... 10 cláusulas extraídas do HTML
] as const
```

---

## Padrões Compartilhados

### Subscription RHF → Zustand (anti-render-loop)
**Fonte:** `roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx` linhas 63-68
**Aplicar a:** Todos os 5 Section components (HabVenda, HabRepositorios, HabResponsaveis, HabClassificacao, Nda)
```typescript
useEffect(() => {
  const subscription = watch((values) => {
    store.updateSection(TabKey.X, values as Record<string, unknown>)
  })
  return () => subscription.unsubscribe()
}, []) // eslint-disable-line react-hooks/exhaustive-deps
```

### defaultValues com restauração de sessão
**Fonte:** `roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx` linhas 56-58
**Aplicar a:** Todos os 5 Section components
```typescript
defaultValues: (store.sectionData[TabKey.X] ?? {}) as Partial<XData>,
```

### Props explícitas `tenantId` (não useFormContext)
**Fonte:** Todos os Section components existentes
**Aplicar a:** Todos os novos Section components e ReadinessClassification
```typescript
interface XSectionProps {
  tenantId: string
}
export function XSection({ tenantId }: XSectionProps) { ... }
```

### Schema todos os campos `.optional()` exceto `aceitaTermos`
**Fonte:** `roteiro-unificado/src/schemas/torre-classificacao.ts` linha 5, `torre-sienge.ts` linha 11
**Aplicar a:** Todos os schemas de hab + nda (apenas `aceitaTermos` é `z.literal(true)`)

### Tokens de cor Tailwind — nunca hex hardcoded
**Fonte:** `roteiro-unificado/src/components/ui/badge.tsx` linhas 3-8 (usa `bg-g1`, `bg-g5`, etc.)
**Aplicar a:** ReadinessClassification e todos os componentes com cor semântica

### `mode: 'onBlur'` no useForm
**Fonte:** `roteiro-unificado/src/features/form/sections/TorreClassificacaoSection.tsx` linha 58
**Aplicar a:** Todos os 5 Section components — validação ao sair do campo, não no keystroke

---

## Sem Analog Encontrado

| Arquivo | Role | Fluxo de Dados | Motivo |
|---------|------|----------------|--------|
| `src/constants/nda-text.ts` | config (constant) | — | Primeiro arquivo no diretório `constants/` — sem precedente no codebase. Seguir padrão TypeScript de `as const` com export nomeado. |

---

## Metadados

**Escopo de busca de analogs:** `roteiro-unificado/src/` (components, features, schemas, stores, lib)
**Arquivos escaneados:** 57 arquivos `.ts`/`.tsx` em `src/` (excluindo `node_modules`)
**Data do mapeamento:** 2026-05-22

**Verificações de codebase realizadas:**
- `nivelGerencial` usa slugs `'g1'..'g5'` (minúsculo) — confirmado em `src/schemas/torre-decisao.ts` linha 30
- `CheckboxGroupField` gerencia arrays de string (não boolean) — confirmado em `src/components/ui/checkbox-group-field.tsx` linha 34
- `Badge` aceita `Grade` type (`G1`..`G5`) mas não cobre `HAB-X` — confirmado em `src/components/ui/badge.tsx` linhas 3-11
- `InputField` não existe em `src/components/ui/index.ts` — confirmado (ausente no barrel export, linha 30)
- `TabKey` já define `HabVenda`, `HabRepositorios`, `HabResponsaveis`, `HabClassificacao`, `Nda` — confirmado em `src/stores/formStore.ts` linhas 16-21
- `FormLayout.tsx` tem `default` no switch cobrindo as 5 abas novas com placeholder — confirmado em linhas 33-39
