# Phase 6: Campos do Formulário — Torre 360 - Pesquisa

**Pesquisado:** 2026-05-22
**Domínio:** Formulários React com React Hook Form v7 + Zod v4 + Controller pattern
**Confiança:** HIGH

---

<user_constraints>
## Restrições do Usuário (do CONTEXT.md)

### Decisões Bloqueadas

- **D-01:** `useForm()` por aba — cada Section component monta seu próprio `useForm` com `zodResolver(schema)` específico da aba. Não há form global no FormLayout.
- **D-02:** Sync via `watch() + useEffect` — `const values = watch(); useEffect(() => { updateSection(tab, values) }, [values])` para sincronizar RHF → Zustand store.
- **D-03:** `useFormSection` atualizado para aceitar `control?` opcional. Assinatura: `useFormSection(tenantId, tab, control?)`. Com control: retorna errors reais e completeness calculado. Sem control: comportamento Phase 5 (`errors: {}`, `completeness: 0.01`). Compatibilidade retroativa preservada.
- **D-04:** `defaultValues: sectionData[tab] ?? {}` — inicializa `useForm` com dados já na store para restaurar preenchimento anterior.
- **D-05:** Section components em `src/features/form/sections/` — um arquivo por aba.
- **D-06:** Field components em `src/components/ui/` — RadioGroupField, CheckboxGroupField, SelectField, TextareaField, ConditionalField adicionados ao barrel export.
- **D-07:** Zod schemas em `src/schemas/` — um arquivo por aba, desacoplados dos components.
- **D-08:** Props explícitas nos Section components — `<IdentificacaoSection tenantId={orgId} control={control} errors={errors} />`. Sem FormProvider/useFormContext.

### Discrição de Claude

- **ConditionalField:** wrapper que usa `watch(fieldName)` para mostrar/ocultar filhos. Campo oculto chama `unregister(fieldName)` ao desmontar. Prop `condition` recebe o valor watched: `<ConditionalField condition={watchedValue === 'sim'}>...</ConditionalField>`.
- **completeness real:** `filledRequiredFields / totalRequiredFields` do schema Zod, range `[0, 1]`. Campos opcionais não afetam o cálculo.
- **Field component API:** todos os field components recebem `control` via prop explícita. Assinatura padrão: `{ name, control, label, options, error?, required? }`.

### Ideias Diferidas (FORA DO ESCOPO)

- Validação cruzada entre abas — deferred para Phase 7 ou avaliado durante planning.
- "Selecionar todos" genérico no CheckboxGroupField — implementar caso específico para Torre Sienge; generalizar só se necessário em Phase 7.
- Animação de transição ao mostrar/ocultar ConditionalField — deferred para Phase 12.
</user_constraints>

<phase_requirements>
## Requisitos da Fase

| ID | Descrição | Suporte de Pesquisa |
|----|-----------|---------------------|
| FORM-05 | Seleções tipo dropdown, radio, checkbox e textarea são fiéis ao documento original | HTML de referência auditado completamente — inventário completo de campos, tipos e opções documentado na seção Field Inventory abaixo |
| FORM-06 | Campos condicionais exibem/ocultam conforme seleção anterior (ex: "Possui BI?" → mostrar qual) | Padrão `watch() + unregister()` verificado nas types do RHF v7; ConditionalField pattern documentado |
</phase_requirements>

---

## Resumo

Esta fase preenche o shell criado na Phase 5 com campos reais nas 5 abas Torre 360. O trabalho central é: (1) criar uma biblioteca de 5 field components integrados com React Hook Form v7 via `Controller`, (2) criar Zod v4 schemas por aba em `src/schemas/`, (3) criar 5 Section components que usam `useForm` individualmente, e (4) atualizar `useFormSection` e `FormLayout` para orquestrar tudo.

O stack está completamente instalado e funcional: RHF 7.76.0, Zod 4.4.3, @hookform/resolvers 5.4.0, Zustand 5.0.13. Nenhuma instalação de pacote nova é necessária nesta fase — tudo é desenvolvimento puro de componentes e schemas. A única mudança de assinatura de API que precisa de atenção é Zod v4 ter deprecado `z.string().email()` em favor de `z.email()`, mas ambas funcionam na versão instalada.

O HTML de referência foi totalmente auditado. A aba Torre Sienge é a mais complexa: contém uma tabela dinâmica (gerada por JS no HTML original) com 12 módulos, cada um com 5 selects. Na versão React, isso vira um `CheckboxGroupField` para "módulos contratados" + tabela ou grid de campos por módulo ativo. O CONTEXT.md e UI-SPEC aprovado prescrevem a abordagem como CheckboxGroupField — esta pesquisa confirma que é a interpretação correta do HTML original e que é implementável com RHF Controller.

**Recomendação primária:** Implementar field components como wrappers de `Controller` que aceitam `control` via props explícitas — nunca usar `useFormContext`. Usar `ConditionalField` que desmonta o filho do DOM (não `display:none`) para que `unregister` funcione corretamente com Zod.

---

## Mapa de Responsabilidade Arquitetural

| Capacidade | Camada Primária | Camada Secundária | Racional |
|------------|----------------|-------------------|----|
| Renderização de campos | Browser / Client (React) | — | Campos são interativos; RHF gerencia estado local do form |
| Validação de campos | Browser / Client (RHF + Zod) | — | Validação client-side; Zod schema resolve via zodResolver |
| Sincronização com store | Browser / Client (Zustand) | — | updateSection(tab, data) — store persiste no sessionStorage |
| Estado de completude | Browser / Client (useFormSection) | — | Calculado localmente a partir do formState.errors do RHF |
| Campos condicionais | Browser / Client (RHF watch) | — | watch() observa valor; unregister() limpa campo oculto |
| Persistência real de dados | Backend / Supabase | — | Fora do escopo desta fase — Phase 8 |

---

## Stack Padrão

### Core (já instalado — nenhum pacote novo necessário)

| Biblioteca | Versão Instalada | Propósito | Por que padrão |
|-----------|-----------------|-----------|----------------|
| react-hook-form | 7.76.0 | Gerenciamento de estado do form e validação | Decisão bloqueada; já instalado na Phase 5 [VERIFIED: node_modules] |
| zod | 4.4.3 | Schema de validação e tipagem | Decisão bloqueada; `z.object`, `z.enum`, `z.string().min()`, `z.optional()` verificados funcionais [VERIFIED: node_modules] |
| @hookform/resolvers | 5.4.0 | Ponte `zodResolver` entre Zod e RHF | `zodResolver` importável de `@hookform/resolvers/zod` — verificado [VERIFIED: node_modules] |
| zustand | 5.0.13 | Store de progresso do form por tenant | Decisão bloqueada; `updateSection(tab, data)` já disponível [VERIFIED: codebase scan] |

### Componentes Existentes Reutilizáveis

| Componente | Localização | Relevância para Phase 6 |
|-----------|-------------|------------------------|
| `Input` | `src/components/ui/input.tsx` | Base para campos de texto; aceita `error`, `errorMessage` [VERIFIED: codebase scan] |
| `Select` | `src/components/ui/select.tsx` | Base para `SelectField`; aceita `options`, `placeholder`, `error` [VERIFIED: codebase scan] |
| `Textarea` | `src/components/ui/textarea.tsx` | Base para `TextareaField`; `min-h-[80px]`, `resize-y` [VERIFIED: codebase scan] |
| `useFormStore` | `src/stores/formStore.ts` | `updateSection(tab, data)`, `sectionData[tab]`, `TabKey` enum [VERIFIED: codebase scan] |
| `useFormSection` | `src/features/form/useFormSection.ts` | **Modificar** para aceitar `control?` — comentário no código já aponta Phase 6 [VERIFIED: codebase scan] |
| `TAB_CONFIG` | `src/features/form/tabConfig.ts` | Labels das abas — importar nos Section components [VERIFIED: codebase scan] |

### Sem Instalações Necessárias

Esta fase não instala nenhum pacote externo. Todos os utilitários estão disponíveis:

```bash
# Verificar: todos os pacotes já presentes
npm list react-hook-form zod @hookform/resolvers zustand
# Output esperado: react-hook-form@7.76.0, zod@4.4.3, @hookform/resolvers@5.4.0, zustand@5.0.13
```

---

## Auditoria de Pacotes

> Nenhum pacote novo é instalado nesta fase. Seção não aplicável.

Pacotes removidos por slopcheck [SLOP]: nenhum
Pacotes suspeitos [SUS]: nenhum

---

## Inventário de Campos (FORM-05 — Fonte de Verdade: HTML de Referência)

Auditoria completa do HTML `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html`. Apenas seções Torre 360 (abas desta fase). [VERIFIED: leitura direta do HTML de referência]

### Aba Identificação (`id="inicio"`)

| Campo | Tipo HTML | Tipo React | Obrigatório | Opções / Validação |
|-------|-----------|------------|-------------|---------------------|
| Empresa / grupo | `input` texto | `Input` | Sim | min 2 chars |
| CNPJ principal | `input` texto | `Input` | Sim | formato 00.000.000/0000-00 |
| Data da reunião | `input type="date"` | `Input type="date"` | Não | — |
| Participantes e papéis | `textarea` | `TextareaField` | Não | placeholder: "Diretoria, financeiro, engenharia..." |
| Sponsor do piloto | `input` texto | `Input` | Não | "Nome e cargo" |
| Responsável técnico/Sienge | `input` texto | `Input` | Não | "Nome e contato" |
| Responsável por habilitações/documentos | `input` texto | `Input` | Não | "Nome e contato" |
| Quem conduz oportunidades comerciais? | `input` texto | `Input` | Não | "Diretoria, comercial..." |
| Nº de CNPJs/SPEs no escopo | `input` texto | `Input` | Não | "Quantidade e observações" |
| Nº de obras/empreendimentos | `input` texto | `Input` | Não | "Quantidade, status e observações" |
| Principal prioridade para Torre 360 | `textarea` | `TextareaField` | Não | placeholder longo |
| Principal prioridade para Habilitações | `textarea` | `TextareaField` | Não | placeholder longo |

**Total Identificação:** 12 campos; 2 obrigatórios (Empresa, CNPJ)

### Aba Torre Decisão (`id="t_decisao"`)

**Seção "Ritual e fontes de decisão":**

| Campo | Tipo HTML | Tipo React | Opções |
|-------|-----------|------------|--------|
| Existe reunião de gestão? | `select` | `SelectField` | Semanal / Quinzenal / Mensal / Eventual / Não estruturada |
| Como a informação chega? | `select` | `SelectField` | BI/dashboard / Excel/planilhas / Relatórios Sienge / PDF/apresentação / E-mail/WhatsApp / Misto |
| Existe BI hoje? | `select` | `SelectField` | Sim, Power BI / Sim, outra ferramenta / Em implantação / Não |
| Quem prepara a informação? | `input` texto | `Input` | "Controladoria, financeiro, engenharia, TI..." |
| Relatórios/dashboards usados | `textarea` | `TextareaField` | — |
| Números questionados ou divergentes | `textarea` | `TextareaField` | — |

**Seção "Decisões que a Torre deve melhorar primeiro":**
CheckboxGroup com 9 opções:
- Caixa realizado/projetado
- Contas a pagar/receber
- Inadimplência
- Margem por obra
- Orçado x realizado
- Avanço físico/prazo
- Compras críticas
- Vendas/estoque
- Pós-obra/qualidade

**Seção inferior:**

| Campo | Tipo HTML | Tipo React | Opções |
|-------|-----------|------------|--------|
| Nível gerencial | `select` | `SelectField` | G1 — Decisão informal / G2 — Relatórios manuais / G3 — BI parcial / G4 — Gestão orientada por dados / G5 — Gestão avançada |
| Observações gerenciais essenciais | `textarea` | `TextareaField` | — |

**Campo condicional FORM-06:** "Existe BI hoje?" = "Sim, Power BI" ou "Sim, outra ferramenta" → `ConditionalField` mostra campo texto "Qual ferramenta de BI?" (não está explicitamente no HTML mas está na lógica de negócio — **ASSUMED** baseado na lógica usual do formulário; confirmar com usuário se há campo oculto no HTML original não capturado).

**Total Torre Decisão:** 8 campos de input + 9 checkboxes; campos obrigatórios: a serem definidos pelo planner (HTML não marca required).

### Aba Torre Sienge (`id="t_sienge"`)

Esta aba tem uma **tabela dinâmica** gerada por JavaScript no HTML original. A tabela lista 12 módulos, cada um com 5 selects nas colunas:

**12 Módulos (linhas da tabela):**
1. Cadastros: empresas, obras, empreendimentos e centros de custo
2. Financeiro: contas a pagar, receber, caixa e bancos
3. Inadimplência e carteira de recebíveis
4. Orçamento de obra e orçado x realizado
5. Planejamento, cronograma e avanço físico
6. Medições e contratos de empreiteiros
7. Compras, suprimentos e custo comprometido
8. Comercial: vendas, reservas e contratos
9. Unidades, estoque imobiliário e tabela de preços
10. Contabilidade/fiscal e visão societária
11. Pós-obra, assistência técnica e qualidade
12. BI, planilhas de diretoria e controles paralelos

**Colunas por módulo (5 selects):**
- Contratado no Sienge? → Sim / Não / Não sabe / Não aplicável
- Uso real → Total / Parcial / Baixo / Não usa
- Confiança do dado → Alta / Média / Baixa / Não confiável
- Controle paralelo? → Não / Sim, Excel / Sim, BI / Sim, outro sistema / Sim, informal
- Observações (textarea) → campo livre

**Abordagem React para a tabela:** A tabela do HTML se torna uma lista de 12 grupos de campos. O schema Zod será um objeto com 12 chaves (uma por módulo), cada uma contendo um objeto com as 5 colunas. Exemplo: `modules.cadastros.contratado`, `modules.cadastros.usoReal`, etc. O `CheckboxGroupField` mencionado no CONTEXT.md é para selecionar quais módulos estão ativos — mas **a tabela completa deve ser preservada** conforme FORM-02/FORM-05.

**Decisão de implementação para o planner:** [ASSUMED] O CONTEXT.md prescreve "CheckboxGroup multi-seleção de módulos Sienge, condicional integração". Interpretação: CheckboxGroup seleciona quais módulos estão contratados; para cada módulo selecionado, campos de uso/confiança/paralelo são mostrados via ConditionalField. Alternativa fiel: sempre mostrar todos os 12 módulos na tabela como no HTML. O planner deve decidir baseado em FORM-05 (fidelidade ao HTML original) vs. UX. **Recomendação:** mostrar tabela completa com todos os 12 módulos (fiel ao HTML, sem perda de dados), sem checkbox de seleção prévia.

**Total Torre Sienge:** 12 × 5 = 60 campos (select ou textarea); potencialmente complexo para o schema Zod.

### Aba Torre Acesso (`id="t_acesso"`)

**Seção "Ambiente e acessos":**

| Campo | Tipo HTML | Tipo React | Opções |
|-------|-----------|------------|--------|
| Ambiente Sienge | `select` | `SelectField` | Nuvem/Data Center / Local / Híbrido / Confirmar |
| Subdomínio/tenant conhecido? | `select` | `SelectField` | Sim / Não / Confirmar |
| Usuário técnico somente leitura? | `select` | `SelectField` | Possível / Não possível / Confirmar |
| Ambiente de homologação? | `select` | `SelectField` | Sim / Não / Confirmar |
| API REST | `select` | `SelectField` | Disponível / Não disponível / Confirmar / Parcial |
| Bulk Data | `select` | `SelectField` | Disponível / Não disponível / Confirmar / Parcial |
| Pacote/limite de API conhecido? | `select` | `SelectField` | Sim / Não / Confirmar com Sienge/TI |
| Webhooks relevantes agora? | `select` | `SelectField` | Sim / Não / Confirmar / Não aplicável na fase 1 |
| Outras fontes oficiais ou relevantes | `textarea` | `TextareaField` | — |
| Restrições de segurança/confidencialidade | `textarea` | `TextareaField` | — |

**Seção "Se todos os dados estiverem no Sienge":**
CheckboxGroup com 6 opções:
- Módulos realmente alimentados
- Empresas, obras e centros corretos
- Dados com histórico mínimo
- API/Bulk com acesso autorizado
- Limites compatíveis com o volume
- Regras de indicadores validadas

Mais 1 textarea: "Observação técnica essencial"

**Total Torre Acesso:** 10 selects/textareas + 6 checkboxes + 1 textarea; sem campos condicionais diretos (FORM-06 não se aplica aqui).

### Aba Torre Classificação (`id="t_fechamento"`)

**Seção "Classificação da empresa":**
Cards informativos T360-A/B/C/D/E (não são campos de input — são referência visual).

| Campo | Tipo HTML | Tipo React | Opções |
|-------|-----------|------------|--------|
| Classificação final | `select` | `SelectField` | T360-A / T360-B / T360-C / T360-D / T360-E (com descrições) |
| Abordagem recomendada | `select` | `SelectField` | Integração Sienge/API/Bulk / Híbrida: Sienge + BI/planilhas / Ativação de dados primeiro / Reconciliação com BI atual / Projeto preparatório |
| Justificativa curta | `textarea` | `TextareaField` | — |

**Seção "Plano macro e riscos":**

| Campo | Tipo HTML | Tipo React |
|-------|-----------|------------|
| Fase 1 sugerida | `textarea` | `TextareaField` |
| Fase 2 sugerida | `textarea` | `TextareaField` |
| Fora do escopo inicial | `textarea` | `TextareaField` |
| Riscos para contrato, preço e cronograma | `textarea` | `TextareaField` |

**Seção "Evidências essenciais a solicitar":**
CheckboxGroup com 9 opções:
- Lista de módulos Sienge contratados
- Confirmação API REST/Bulk
- Relatórios usados pela diretoria
- BI atual: prints, links ou descrição
- Planilhas críticas
- Lista de CNPJs e obras ativas
- Exemplo de fluxo de caixa
- Exemplo de orçamento x realizado
- Responsáveis por área

Mais 1 textarea: "Próximos passos"

**Total Torre Classificação:** 2 selects + 5 textareas + 9 checkboxes + 1 textarea; sem campos condicionais.

---

## Padrões de Arquitetura

### Diagrama de Fluxo de Dados

```
URL hash (#torre-decisao)
        ↓
FormLayout.tsx (useFormStore, activeTab)
        ↓
switch(activeTab) → <TorreDecisaoSection tenantId control errors />
        ↓
Section component
  ├── useForm({ resolver: zodResolver(torreDecisaoSchema), defaultValues: sectionData['torre-decisao'] ?? {} })
  ├── watch() → useEffect → updateSection('torre-decisao', values)
  ├── Controller → RadioGroupField / SelectField / CheckboxGroupField / TextareaField
  └── ConditionalField (condition=bool) → unregister ao desmontar

useFormSection(tenantId, tab, control)
  ├── control ausente → { errors: {}, completeness: 0.01 } (Phase 5 compat)
  └── control presente → { errors: formState.errors, completeness: calculado }
                               ↓
                      ProgressBadge (ícone status na sidebar)
```

### Estrutura de Diretórios Recomendada

```
src/
├── schemas/                      # Zod schemas por aba (existente, vazio)
│   ├── identificacao.ts          # CRIAR — z.object com 12 campos
│   ├── torre-decisao.ts          # CRIAR — z.object com selects + checkboxes
│   ├── torre-sienge.ts           # CRIAR — z.object com 12 módulos × 5 cols
│   ├── torre-acesso.ts           # CRIAR — z.object com selects + checkboxes
│   └── torre-classificacao.ts   # CRIAR — z.object com selects + textareas
├── components/ui/
│   ├── radio-group-field.tsx     # CRIAR — Controller wrapper para radio
│   ├── checkbox-group-field.tsx  # CRIAR — Controller wrapper para checkboxes
│   ├── select-field.tsx          # CRIAR — Controller wrapper para select
│   ├── textarea-field.tsx        # CRIAR — Controller wrapper para textarea
│   ├── conditional-field.tsx     # CRIAR — wrapper show/hide + unregister
│   └── index.ts                  # MODIFICAR — adicionar exports
└── features/form/
    ├── useFormSection.ts          # MODIFICAR — adicionar control? param
    ├── FormLayout.tsx             # MODIFICAR — renderizar Section por activeTab
    └── sections/                  # CRIAR diretório
        ├── IdentificacaoSection.tsx
        ├── TorreDecisaoSection.tsx
        ├── TorreSiengeSection.tsx
        ├── TorreAcessoSection.tsx
        └── TorreClassificacaoSection.tsx
```

### Padrão 1: Controller-based Field Component

O padrão central desta fase. Todo field component recebe `control` via props e usa `Controller` internamente.

```tsx
// src/components/ui/select-field.tsx
// Source: RHF v7 types/controller.d.ts — Controller render prop API verificada
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'
import { Select } from './select'

interface SelectFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
  required?: boolean
  error?: string
}

export function SelectField<T extends FieldValues>({
  name,
  control,
  label,
  options,
  placeholder = 'Selecione uma opção',
  required,
  error,
}: SelectFieldProps<T>) {
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
          <Select
            {...field}
            options={options}
            placeholder={placeholder}
            error={!!error}
            errorMessage={error}
          />
        )}
      />
    </div>
  )
}
```

### Padrão 2: ConditionalField com unregister no cleanup

```tsx
// src/components/ui/conditional-field.tsx
// Source: RHF v7 types/form.d.ts — UseFormUnregister type verificada
import { useEffect } from 'react'
import { useFormContext, FieldPath, FieldValues } from 'react-hook-form'

interface ConditionalFieldProps {
  condition: boolean
  fieldName: string
  unregisterFn: (name: string, options?: { keepValue?: boolean }) => void
  children: React.ReactNode
}

export function ConditionalField({ condition, fieldName, unregisterFn, children }: ConditionalFieldProps) {
  useEffect(() => {
    if (!condition) {
      unregisterFn(fieldName, { keepValue: false })
    }
  }, [condition, fieldName, unregisterFn])

  if (!condition) return null
  return <>{children}</>
}
```

**Alternativa mais simples (RECOMENDADA):** receber `condition: boolean` já calculado pelo pai, sem lógica interna de watch.

### Padrão 3: Section component com useForm por aba

```tsx
// src/features/form/sections/TorreDecisaoSection.tsx
// Source: CONTEXT.md D-01 a D-04; RHF v7 useForm API verificada
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useFormStore, TabKey } from '@/stores/formStore'
import { torreDecisaoSchema, type TorreDecisaoData } from '@/schemas/torre-decisao'
import { SelectField, CheckboxGroupField, TextareaField, ConditionalField } from '@/components/ui'

interface TorreDecisaoSectionProps {
  tenantId: string
}

export function TorreDecisaoSection({ tenantId }: TorreDecisaoSectionProps) {
  const store = useFormStore(tenantId)
  const { control, watch, unregister, formState: { errors } } = useForm<TorreDecisaoData>({
    resolver: zodResolver(torreDecisaoSchema),
    defaultValues: (store.sectionData[TabKey.TorreDecisao] ?? {}) as TorreDecisaoData,
  })

  // D-02: sync RHF → Zustand
  const values = watch()
  useEffect(() => {
    store.updateSection(TabKey.TorreDecisao, values as Record<string, unknown>)
  }, [values]) // eslint-disable-line react-hooks/exhaustive-deps

  // Campo condicional: FORM-06
  const temBI = watch('existeBI')
  const mostraQualBI = temBI === 'sim-power-bi' || temBI === 'sim-outra'

  return (
    <form className="max-w-2xl space-y-4">
      <SelectField name="reuniaoGestao" control={control} label="Existe reunião de gestão?" options={[...]} error={errors.reuniaoGestao?.message} />
      <SelectField name="existeBI" control={control} label="Existe BI hoje?" options={[...]} error={errors.existeBI?.message} />
      <ConditionalField condition={mostraQualBI} fieldName="qualBI" unregisterFn={unregister}>
        <SelectField name="qualBI" control={control} label="Qual ferramenta de BI?" options={[...]} />
      </ConditionalField>
      {/* ... demais campos */}
    </form>
  )
}
```

### Padrão 4: Zod v4 Schema por aba

```typescript
// src/schemas/torre-decisao.ts
// Source: Zod v4 API verificada em node_modules; z.enum, z.optional, z.array funcionais
import { z } from 'zod'

export const torreDecisaoSchema = z.object({
  reuniaoGestao: z.enum(['semanal', 'quinzenal', 'mensal', 'eventual', 'nao-estruturada']).optional(),
  comoInformacaoChega: z.enum(['bi-dashboard', 'excel', 'relatorios-sienge', 'pdf', 'email-whatsapp', 'misto']).optional(),
  existeBI: z.enum(['sim-power-bi', 'sim-outra', 'em-implantacao', 'nao']).optional(),
  qualBI: z.string().optional(),           // campo condicional
  quemPreparaInfo: z.string().optional(),
  relatoriosDiretoria: z.string().optional(),
  numerosQuestionados: z.string().optional(),
  decisoesMelhorar: z.array(z.string()).optional(), // checkboxes
  nivelGerencial: z.enum(['g1', 'g2', 'g3', 'g4', 'g5']).optional(),
  observacoesGerenciais: z.string().optional(),
})

export type TorreDecisaoData = z.infer<typeof torreDecisaoSchema>
```

**Atenção Zod v4:** `z.string().email()` está deprecado mas funcional. A nova sintaxe é `z.email()` (top-level). Para esta fase apenas CNPJ usa validação de formato — use `.regex()` para CNPJ já que `z.email()` não é relevante aqui. [CITED: zod.dev/v4]

### Padrão 5: FormLayout switch por activeTab

```tsx
// src/features/form/FormLayout.tsx — modificação no <main>
// Substituir o placeholder por switch:
import { IdentificacaoSection } from './sections/IdentificacaoSection'
import { TorreDecisaoSection } from './sections/TorreDecisaoSection'
// etc.

function renderSection(activeTab: TabKey, tenantId: string) {
  switch (activeTab) {
    case TabKey.Identificacao: return <IdentificacaoSection tenantId={tenantId} />
    case TabKey.TorreDecisao: return <TorreDecisaoSection tenantId={tenantId} />
    case TabKey.TorreSienge: return <TorreSiengeSection tenantId={tenantId} />
    case TabKey.TorreAcesso: return <TorreAcessoSection tenantId={tenantId} />
    case TabKey.TorreClassificacao: return <TorreClassificacaoSection tenantId={tenantId} />
    default: return <p className="text-sm text-gray-500">Esta seção ainda não possui campos.</p>
  }
}
```

### Padrão 6: useFormSection atualizado (D-03)

```typescript
// src/features/form/useFormSection.ts — assinatura ampliada
// Source: CONTEXT.md D-03; RHF v7 types verificadas
import { Control, FieldValues, FieldErrors } from 'react-hook-form'

export function useFormSection<T extends FieldValues = FieldValues>(
  tenantId: string,
  tab: TabKey,
  control?: Control<T>
): {
  data: Record<string, unknown>
  updateField: (field: string, value: unknown) => void
  errors: Record<string, string>  // mensagens achatadas para ProgressBadge
  completeness: number
} {
  // ...
  const errors = control ? flattenErrors(formState.errors) : {}
  const completeness = control ? calculateCompleteness(control) : (visitedTabs.has(tab) ? 0.01 : 0)
  // ...
}
```

**Nota de implementação:** `control` é suficiente para acessar `formState` via `useFormState({ control })` sem re-subscribe desnecessário.

### Anti-patterns a Evitar

- **FormProvider / useFormContext:** Decisão D-08 bloqueada — props explícitas são o padrão.
- **`shouldUnregister: true` global no useForm:** ConditionalField gerencia unregister manualmente; não ativar globalmente ou haverá conflito ao navegar entre abas.
- **`display: none` para esconder ConditionalField:** UI-SPEC especifica que campo oculto não deve existir no DOM. Usar renderização condicional React (`condition ? <Campo /> : null`).
- **Zod `.superRefine` para validação cruzada entre abas:** Deferred. Não implementar em schemas desta fase.
- **Valores `enum` com espaços/acentos:** Usar slugs (ex: `'nao-estruturada'`) nos valores internos do schema; labels com acentos ficam apenas na prop `label` do SelectField.

---

## Não Construir do Zero

| Problema | Não Construir | Usar Existing | Por que |
|----------|--------------|---------------|---------|
| Validação de formulário | Lógica manual de validação | `zodResolver` + `formState.errors` | Zod trata edge cases de tipo, coercion, mensagens |
| Estado de campos controlados | `useState` por campo | `Controller` do RHF | RHF gerencia dirty/touched/error state; useState causaria re-renders desnecessários |
| Persistência entre abas | Sincronização manual | `updateSection(tab, values)` do formStore | Já implementado com sessionStorage namespaceado por tenant (Phase 5) |
| Select acessível | `<select>` raw sem wrapper | `Select` + `SelectField` wrapping `Controller` | O `Select` base já tem estilo de erro, focus ring, placeholder |
| Checkbox acessível | `<input type="checkbox">` raw | `CheckboxGroupField` wrapping `Controller` | Controller garante que o array de valores seja gerenciado corretamente pelo RHF |
| Tipagem dos dados da aba | Interface manual TypeScript | `z.infer<typeof schema>` | Schema Zod é fonte única de verdade; tipo gerado automaticamente |

**Insight chave:** O maior risco desta fase é recriar infraestrutura que já existe (formStore, Tailwind tokens, componentes base). O trabalho real é **composição** — conectar os pontos corretos.

---

## Armadilhas Comuns

### Armadilha 1: Torre Sienge — tabela de 60 campos no schema Zod

**O que vai errado:** Criar um schema plano com 60 campos nomeados individualmente (`cadastros_contratado`, `cadastros_uso_real`, etc.) — difícil de manter, propenso a erros de nome.

**Por que acontece:** O HTML original é uma tabela com linhas dinâmicas; a tradução ingênua cria campos planos.

**Como evitar:** Usar schema aninhado com slugs de módulo como chaves:
```typescript
const moduleSchema = z.object({
  contratado: z.enum(['sim', 'nao', 'nao-sabe', 'nao-aplicavel']).optional(),
  usoReal: z.enum(['total', 'parcial', 'baixo', 'nao-usa']).optional(),
  confiancaDado: z.enum(['alta', 'media', 'baixa', 'nao-confiavel']).optional(),
  controleParalelo: z.enum(['nao', 'excel', 'bi', 'outro', 'informal']).optional(),
  observacoes: z.string().optional(),
})
const torreSiengeSchema = z.object({
  modules: z.object({
    cadastros: moduleSchema,
    financeiro: moduleSchema,
    inadimplencia: moduleSchema,
    // ... 12 módulos
  }),
})
```

**Sinal de alerta:** Mais de 20 campos no nível raiz de um schema — extrair para sub-schemas.

### Armadilha 2: watch() causando re-render infinito com useEffect

**O que vai errado:** `useEffect(() => { updateSection(tab, watch()) }, [watch()])` — `watch()` sem argumento retorna objeto novo a cada render, causando loop.

**Por que acontece:** `watch()` sem argumento retorna uma cópia do estado a cada chamada.

**Como evitar:** Chamar `watch()` fora do efeito e usar o valor como dependência:
```typescript
const values = watch() // RHF estabiliza esta referência entre renders quando não há mudanças
useEffect(() => {
  store.updateSection(tab, values as Record<string, unknown>)
}, [values]) // eslint-disable-line react-hooks/exhaustive-deps
```

O `store` (de `useFormStore`) não deve entrar nas deps — causa loop infinito (padrão já documentado no STATE.md: "T-05-04-04").

**Sinal de alerta:** Console mostrando re-renders contínuos; sessionStorage sendo escrito em loop.

### Armadilha 3: unregister não limpa o valor no Zod schema

**O que vai errado:** Campo condicional é ocultado, `unregister` é chamado, mas Zod validation ainda valida o campo porque o schema não sabe que ele foi removido.

**Por que acontece:** Zod schema é estático; `unregister` remove o campo do estado do RHF mas o schema ainda inclui o campo como validável.

**Como evitar:** Definir campos condicionais como `.optional()` no schema Zod. `unregister` remove o valor, Zod valida `undefined` como válido para `.optional()`. Não usar `.required()` em campos condicionais.

**Sinal de alerta:** Formulário não valida como `isValid: true` mesmo após preencher todos os campos visíveis.

### Armadilha 4: defaultValues com tipos incompatíveis com o schema

**O que vai errado:** `sectionData[tab]` é `Record<string, unknown>` — passar direto como `defaultValues` causa type error TypeScript porque `useForm<TorreDecisaoData>` espera `Partial<TorreDecisaoData>`.

**Por que acontece:** A store Zustand é tipada de forma genérica para suportar todas as abas.

**Como evitar:** Cast explícito: `defaultValues: (store.sectionData[TabKey.TorreDecisao] ?? {}) as TorreDecisaoData`. O cast é seguro porque os dados vieram de valores anteriores que passaram pela validação Zod. TypeScript precisa do cast; runtime é seguro.

**Sinal de alerta:** Type error `Type 'Record<string, unknown>' is not assignable to...` em `defaultValues`.

### Armadilha 5: Zod v4 — z.enum com valores que serão comparados

**O que vai errado:** Usar labels do HTML como valores do enum (`z.enum(['Sim, Power BI', 'Sim, outra ferramenta'])`) — comparação de strings fica frágil e os valores aparecem em URLs/localStorage.

**Por que acontece:** Desenvolvedores copiam options do HTML diretamente sem normalizar.

**Como evitar:** Separar `value` (slug) de `label` no `options` array:
```typescript
const biOptions = [
  { value: 'sim-power-bi', label: 'Sim, Power BI' },
  { value: 'sim-outra', label: 'Sim, outra ferramenta' },
  { value: 'em-implantacao', label: 'Em implantação' },
  { value: 'nao', label: 'Não' },
]
// Schema Zod usa os slugs:
existeBI: z.enum(['sim-power-bi', 'sim-outra', 'em-implantacao', 'nao']).optional()
```

**Sinal de alerta:** Campo condicional que depende de `watch('existeBI') === 'Sim, Power BI'` — string literal com espaço é sinal de que valores não foram normalizados.

### Armadilha 6: CheckboxGroup com Controller — gerenciamento de array

**O que vai errado:** Usar múltiplos `<input type="checkbox">` sem Controller, cada um com `register()` separado — o RHF não agrega os valores em um array automaticamente.

**Por que acontece:** Intuição de que cada checkbox é um campo separado, como seria com `useState`.

**Como evitar:** Um único `Controller` para o grupo inteiro, gerenciando um `string[]`:
```tsx
<Controller
  name="decisoesMelhorar"
  control={control}
  defaultValue={[]}
  render={({ field }) => (
    <div className="flex flex-col gap-2">
      {options.map(opt => (
        <label key={opt.value} className="flex gap-2 items-center">
          <input
            type="checkbox"
            checked={field.value?.includes(opt.value) ?? false}
            onChange={(e) => {
              const current = field.value ?? []
              field.onChange(
                e.target.checked
                  ? [...current, opt.value]
                  : current.filter((v: string) => v !== opt.value)
              )
            }}
          />
          {opt.label}
        </label>
      ))}
    </div>
  )}
/>
```

**Sinal de alerta:** `watch('checkboxField')` retorna um único valor string em vez de array.

---

## Exemplos de Código Verificados

### RadioGroupField completo (com estilo do UI-SPEC)

```tsx
// Source: UI-SPEC §RadioGroupField; RHF Controller API verificada em controller.d.ts
import { Controller, Control, FieldPath, FieldValues } from 'react-hook-form'
import { cn } from '@/lib/utils'

interface Option { value: string; label: string }

interface RadioGroupFieldProps<T extends FieldValues> {
  name: FieldPath<T>
  control: Control<T>
  label: string
  options: Option[]
  required?: boolean
  error?: string
  layout?: 'vertical' | 'horizontal'
}

export function RadioGroupField<T extends FieldValues>({
  name, control, label, options, required, error, layout = 'vertical'
}: RadioGroupFieldProps<T>) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-gray-700">
        {label}{required && <span className="text-g1 ml-0.5">*</span>}
      </label>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
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
        )}
      />
      {error && <p className="text-xs text-g1">{error}</p>}
    </div>
  )
}
```

### Cálculo de completeness para useFormSection

```typescript
// Source: CONTEXT.md §decisions D-03; RHF useFormState API
import { useFormState, Control, FieldValues } from 'react-hook-form'

function calculateCompleteness<T extends FieldValues>(
  control: Control<T>,
  totalRequired: number
): number {
  const { errors, touchedFields } = useFormState({ control })
  const errorCount = Object.keys(errors).length
  const filledRequired = Math.max(0, totalRequired - errorCount)
  return totalRequired === 0 ? 1 : filledRequired / totalRequired
}
```

**Nota:** `totalRequired` deve ser derivado do schema Zod analisando quais campos são obrigatórios (não `.optional()`). Uma abordagem simples é hardcodar a contagem por schema ou usar `schema.shape` para introspection.

---

## Estado da Arte

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|-----------------|----------------|--------------|---------|
| `z.string().email()` | `z.email()` (top-level) | Zod v4 | Método antigo deprecado mas funcional; migrar progressivamente |
| `useFormContext()` em field components | `control` via props explícitas | CONTEXT.md D-08 | Props explícitas = testabilidade melhor, sem acoplamento implícito |
| `register()` para campos controlados | `Controller` + render prop | RHF v7 best practice | `Controller` é mais explícito para componentes customizados; `register` fica para inputs nativos |
| `shouldUnregister: true` global | `unregister()` manual no unmount | RHF v7 + CONTEXT.md | Global causa problemas ao navegar entre abas; manual é explícito |
| Zod v3 `errorMap` | Zod v4 `error` function | Zod v4 | Error customization unificada: `z.string({ error: (issue) => "msg" })` |

**Deprecados/desatualizados:**
- `NestedValue<T>` do RHF: marcado como `@deprecated` nos types — não usar.
- `z.string().email()`: funciona mas emite warning de deprecação em Zod v4 — usar `z.email()` em código novo.

---

## Arquitetura de Validação (Nyquist)

### Framework de Testes

| Propriedade | Valor |
|------------|-------|
| Framework | Nenhum detectado na codebase (sem vitest.config.ts, jest.config.ts, package.json test script) |
| Config | Não existe |
| Comando rápido | N/A — framework não instalado |
| Comando completo | N/A |

### Mapa de Requisitos → Testes

| Req ID | Comportamento | Tipo de Teste | Comando | Arquivo Existe? |
|--------|--------------|--------------|---------|----------------|
| FORM-05 | SelectField renderiza opções do HTML original | Componente | N/A | ❌ Wave 0 |
| FORM-05 | CheckboxGroupField gerencia array de valores | Componente | N/A | ❌ Wave 0 |
| FORM-05 | RadioGroupField muda valor ao clicar | Componente | N/A | ❌ Wave 0 |
| FORM-06 | ConditionalField oculta/mostra baseado em condition | Componente | N/A | ❌ Wave 0 |
| FORM-06 | unregister é chamado ao ocultar campo | Unidade | N/A | ❌ Wave 0 |
| D-02 | watch+useEffect sincroniza RHF → Zustand | Integração | N/A | ❌ Wave 0 |
| D-04 | defaultValues restaura dados do sessionStorage | Integração | N/A | ❌ Wave 0 |

**Nota:** Como não há framework de teste instalado, os testes desta fase serão **manuais / UAT visual**. O ROADMAP.md §Phase 6 lista UAT com verificação manual campo por campo contra o HTML de referência. Se o planner quiser adicionar testes automatizados, Wave 0 deve incluir instalação de Vitest + @testing-library/react.

### Wave 0 Gaps

- [ ] Nenhum framework de teste instalado — planner deve decidir: instalar Vitest agora ou manter UAT manual
- [ ] Se instalar: `npm install -D vitest @testing-library/react @testing-library/user-event jsdom`
- [ ] UAT manual: tabela de verificação campo-a-campo contra HTML de referência deve ser criada no VERIFICATION.md

---

## Domínio de Segurança

### ASVS Aplicável

| Categoria ASVS | Aplica | Controle Padrão |
|----------------|--------|----------------|
| V2 Autenticação | Não (Phase 3 já cobre) | — |
| V3 Gerenciamento de Sessão | Não | — |
| V4 Controle de Acesso | Sim (cross-tenant guard) | Cross-tenant guard já em FormLayout; não alterar |
| V5 Validação de Input | Sim | Zod schemas com `.min()`, `.regex()` para CNPJ/email |
| V6 Criptografia | Não | — |

### Padrões de Ameaça para o Stack

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Cross-tenant data leakage | Spoofing | `useFormStore(tenantId)` namespaceado — já implementado; não usar store sem tenantId |
| XSS via valores de formulário | Tampering | React escapa valores por padrão; não usar `dangerouslySetInnerHTML` nos field components |
| Bypass de validação client-side | Tampering | Zod valida; validação server-side virá na Phase 8 (Supabase RLS + constraints) |

---

## Disponibilidade do Ambiente

| Dependência | Requerida por | Disponível | Versão | Fallback |
|-------------|--------------|------------|--------|---------|
| Node.js | Build | ✓ | 20.19.3 | — |
| react-hook-form | Todos os campos | ✓ | 7.76.0 | — |
| zod | Schemas | ✓ | 4.4.3 | — |
| @hookform/resolvers | zodResolver | ✓ | 5.4.0 | — |
| zustand | formStore | ✓ | 5.0.13 | — |
| Tailwind v4 tokens | Estilização | ✓ | 4.3.0 | — |

**Nenhuma dependência bloqueante identificada.**

---

## Log de Suposições

| # | Afirmação | Seção | Risco se Errada |
|---|-----------|-------|----------------|
| A1 | Campo condicional "Qual ferramenta de BI?" é necessário na Torre Decisão (não está explicitamente no HTML original mas é a lógica de negócio evidente) | Inventário de Campos — Torre Decisão | Campo seria omitido ou adicionado incorretamente; confirmar com usuário |
| A2 | Torre Sienge deve renderizar todos os 12 módulos sempre visíveis (não com checkbox de seleção prévia), por fidelidade ao HTML (FORM-05) | Inventário de Campos — Torre Sienge | Se CheckboxGroup de seleção prévia for preferido, impacta implementação e schema |
| A3 | Campos da aba Identificação: Empresa/grupo e CNPJ são os únicos obrigatórios (HTML não usa `required` attribute) | Inventário de Campos — Identificação | Campos opcionais podem precisar ser obrigatórios conforme regra de negócio |
| A4 | `useFormState({ control })` é a API correta para ler `errors` no `useFormSection` atualizado sem causar re-render desnecessário no FormLayout | Padrão 6 (useFormSection) | Se API estiver errada, ProgressBadge pode não atualizar ou causar renders excessivos |

---

## Perguntas em Aberto

1. **Torre Sienge: tabela sempre visível vs. CheckboxGroup de seleção prévia**
   - O que sabemos: HTML original mostra tabela com todos os 12 módulos sempre visível
   - O que está indefinido: CONTEXT.md prescreve "CheckboxGroup multi-seleção de módulos Sienge" — pode ser a coluna "Contratado no Sienge?" já existente na tabela, ou pode ser um CheckboxGroup separado que pré-filtra quais módulos mostrar
   - Recomendação: Implementar fiel ao HTML (todos os 12 módulos sempre visíveis, coluna "Contratado?" como select) — é o caminho de menor risco para FORM-05

2. **totalRequired para cálculo de completeness**
   - O que sabemos: `completeness = filledRequired / totalRequired`
   - O que está indefinido: Como determinar `totalRequired` dinamicamente do schema Zod sem introspection complexa
   - Recomendação: Hardcodar `totalRequired` por schema como constante exportada junto com o schema (ex: `export const IDENTIFICACAO_REQUIRED_COUNT = 2`). Zod v4 não tem API pública de introspection estável.

3. **Campos obrigatórios por aba**
   - O que sabemos: HTML original não usa atributo `required` — todos os campos são tecnicamente opcionais
   - O que está indefinido: Quais campos o produto considera obrigatórios para `isValid` e para `completeness === 1`
   - Recomendação: Empresa/grupo e CNPJ em Identificação como mínimo obrigatório; demais abas: nenhum obrigatório (formulário de diagnóstico, não cadastro). O planner deve confirmar com o usuário.

---

## Fontes

### Primárias (confiança ALTA)
- `roteiro-unificado/node_modules/react-hook-form/dist/types/controller.d.ts` — `ControllerProps`, `ControllerRenderProps`, `UseControllerProps` verificados
- `roteiro-unificado/node_modules/react-hook-form/dist/types/form.d.ts` — `UseFormUnregister`, `FormState`, `UseFormProps` verificados
- `roteiro-unificado/src/stores/formStore.ts` — API `updateSection`, `sectionData`, `TabKey` verificados via leitura direta
- `roteiro-unificado/src/features/form/useFormSection.ts` — assinatura atual verificada; comentário de Phase 6 presente
- `roteiro-unificado/src/components/ui/{input,select,textarea}.tsx` — APIs base verificadas
- `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html` — todos os campos auditados linha por linha
- Node.js REPL — `z.object().optional()`, `z.enum()`, `z.string().min()`, `z.discriminatedUnion()`, `zodResolver` todos verificados funcionais com versões instaladas

### Secundárias (confiança MÉDIA)
- `zod.dev/v4` — breaking changes Zod v4 documentados: `error` unificado, `z.email()` top-level, refinements internos [CITED: zod.dev/v4]
- `roteiro-unificado/src/index.css` — tokens `--color-primary`, `--color-g1`, `--color-accent` verificados

### Terciárias (confiança BAIXA)
- Suposição A1 (campo condicional BI) — sem fonte direta no HTML; inferência de lógica de negócio

---

## Metadados

**Breakdown de confiança:**
- Stack padrão: ALTA — todas as bibliotecas verificadas em node_modules com versões exatas
- Inventário de campos: ALTA — HTML de referência lido linha por linha
- Padrões de arquitetura: ALTA — baseados em tipos do RHF verificados e CONTEXT.md (decisões bloqueadas)
- Armadilhas: MÉDIA — baseadas em comportamento verificável das APIs + padrões conhecidos
- Schema Torre Sienge: MÉDIA — estrutura aninhada recomendada é a abordagem correta, mas número exato de campos obrigatórios é [ASSUMED]

**Data da pesquisa:** 2026-05-22
**Válido até:** 2026-06-22 (stack estável; APIs não mudam entre patches)
