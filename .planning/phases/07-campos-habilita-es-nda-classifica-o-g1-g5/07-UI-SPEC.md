---
phase: 7
slug: campos-habilita-es-nda-classifica-o-g1-g5
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-22
---

# Phase 7 — UI Design Contract

> Contrato visual e de interação para as 5 abas restantes do formulário (Habilitações + NDA) e o componente `ReadinessClassification` com engine G1-G5. Gerado por gsd-ui-researcher; verificado por gsd-ui-checker.

---

## Design System

| Propriedade | Valor |
|-------------|-------|
| Tool | none (sem shadcn — Tailwind v4 custom tokens via `@theme {}`) |
| Preset | not applicable |
| Component library | custom — `src/components/ui/` (wrappers RHF sobre elementos HTML nativos) |
| Icon library | none (SVG inline ou caracteres Unicode onde necessário) |
| Font | Inter — `var(--font-sans)` definido em `src/index.css` |

Fonte: `src/index.css` (`@theme { --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif; }`), codebase scan.

---

## Spacing Scale

Escala múltiplos de 4 declarada em Tailwind v4 — classes utilitárias padrão (`gap-1` = 4px, `gap-2` = 8px, etc.):

| Token | Valor | Uso nesta fase |
|-------|-------|----------------|
| xs | 4px (`gap-1`, `p-1`) | Gaps ícone-texto, asterisco de campo obrigatório |
| sm | 8px (`gap-2`, `p-2`) | Espaçamento entre opções de checkbox/radio |
| md | 16px (`gap-4`, `p-4`) | Espaçamento padrão entre campos dentro de um grupo; padding do container NDA scrollable |
| lg | 24px (`gap-6`, `p-6`) | Espaçamento entre grupos de campos dentro de uma aba (`space-y-6`) |
| xl | 32px (`gap-8`, `p-8`) | Quebra entre seções de domínio na Matriz de Habilitações |
| 2xl | 48px — | Não usado nesta fase |
| 3xl | 64px — | Não usado nesta fase |

Exceções: touch target mínimo de radiogroup buttons = `min-h-[44px]` (padrão estabelecido em `RadioGroupField` na Phase 6 — mantido).

Fonte: CONTEXT.md (padrões da Phase 6); `src/components/ui/radio-group-field.tsx`.

---

## Typography

Todos os tokens são consumidos via classes Tailwind v4. Não hardcodar tamanho em `style={}`.

| Papel | Tamanho | Peso | Line Height | Uso nesta fase |
|-------|---------|------|-------------|----------------|
| Body | 14px (`text-sm`) | 400 (`font-normal`) | 1.5 (`leading-normal`) | Texto do NDA, labels de opções, texto de placeholder |
| Label | 14px (`text-sm`) | 600 (`font-semibold`) | 1.4 | Labels de campo (`<label>`) — padrão `SelectField`, `RadioGroupField` |
| Heading de seção | 16px (`text-base`) | 600 (`font-semibold`) | 1.3 | Título `<h4>` de cada domínio na Matriz de Habilitações; título de grupo fieldset |
| Heading de aba | 20px (`text-xl`) | 600 (`font-semibold`) | 1.2 | Título da aba ativa em `<main>` (já existe em `FormLayout.tsx` — não recriar) |

Fonte: `src/components/ui/select-field.tsx` (label: `text-sm font-semibold`); `src/features/form/FormLayout.tsx` (`text-xl font-semibold`); padrão Phase 6.

---

## Color

| Papel | Token Tailwind v4 | Valor Hex Aproximado | Uso |
|-------|-------------------|----------------------|-----|
| Dominant (60%) | `bg-gray-50` / `bg-white` | #F9FAFB / #FFFFFF | Fundo de página (`bg-gray-50`), inputs e cards (`bg-white`) |
| Secondary (30%) | `bg-primary` | #123B66 | Sidebar esquerda do FormLayout (já implementada) |
| Accent (10%) | `bg-accent` / `text-accent` | #F28C28 | Botão primário CTA (fora do escopo desta fase — sem submit aqui); asterisco de campo obrigatório usa `text-g1` (ver abaixo) |
| Destructive | `text-g1` / `bg-g1` | ~#D94F3B | Mensagens de erro de validação inline, border de input com erro |

Accent reservado para: botão "Enviar Avaliação" (Phase 8) e indicadores de ação principal. **Nesta fase o accent não aparece em novos elementos** — nenhum CTA de submit é introduzido.

Paleta semântica G1-G5 (exclusiva do badge `ReadinessClassification`):

| Nível | Token | Uso no Badge |
|-------|-------|--------------|
| G1 — Crítico | `bg-g1 text-white` | Badge vermelho |
| G2 — Baixo | `bg-g2 text-white` | Badge laranja |
| G3 — Médio | `bg-g3 text-primary-900` | Badge amarelo (texto escuro para contraste) |
| G4 — Bom | `bg-g4 text-white` | Badge azul |
| G5 — Excelente | `bg-g5 text-white` | Badge verde |

Paleta semântica HAB-A a HAB-E (badge `ReadinessClassification`):

| Nível | Classe de fundo | Classe de texto | Significado |
|-------|-----------------|-----------------|-------------|
| HAB-A | `bg-green-100` | `text-green-700` | Maturidade máxima |
| HAB-B | `bg-blue-100` | `text-blue-700` | Boa habilitação |
| HAB-C | `bg-yellow-100` | `text-yellow-700` | Habilitação parcial |
| HAB-D | `bg-orange-100` | `text-orange-700` | Habilitação baixa |
| HAB-E | `bg-red-100` | `text-red-700` | Sem habilitação |

Nota: `bg-g1..g5` são tokens definidos em `src/index.css`. `bg-green-100` etc. são classes Tailwind v4 padrão (não há token customizado para HAB — usar classes utilitárias diretas).

Fonte: CONTEXT.md `<specifics>` (paleta G1-G5 e HAB-A a HAB-E); `src/index.css`; `src/components/ui/badge.tsx`.

---

## Componentes — Inventário para Esta Fase

### Componentes reutilizados sem alteração

Todos já existem em `src/components/ui/` e devem ser importados sem modificação:

| Componente | Arquivo | Uso nesta fase |
|------------|---------|----------------|
| `SelectField` | `select-field.tsx` | "Existe controle?" (Sim/Não/Parcial), "Repositório principal", "Nível gerencial", "Classificação final HAB" |
| `RadioGroupField` | `radio-group-field.tsx` | Campos binários estilo radio nas abas de habilitação (ex: "Utiliza CRM?") |
| `CheckboxGroupField` | `checkbox-group-field.tsx` | Seleções múltiplas de habilitação (ex: certificações do responsável) |
| `TextareaField` | `textarea-field.tsx` | "Observações que mudam escopo" por domínio, "Observações adicionais" no NDA |
| `ConditionalField` | `conditional-field.tsx` | Campos condicionais dependentes de select anterior |
| `Input` | `input.tsx` | "Responsável interno" (campo text livre) — usar diretamente com wrapper de label/error |
| `Badge` | `badge.tsx` | Badge G1-G5 no componente `ReadinessClassification` |

### Novos componentes a criar nesta fase

| Componente | Caminho | Responsabilidade |
|------------|---------|-----------------|
| `InputField` | `src/components/ui/input-field.tsx` | Wrapper RHF para `Input` — idêntico ao padrão `SelectField` (label + Controller + error). Criar se não existir. |
| `HabVendaSection` | `src/features/form/sections/HabVendaSection.tsx` | Aba Hab. Venda |
| `HabRepositoriosSection` | `src/features/form/sections/HabRepositoriosSection.tsx` | Aba Hab. Repositórios |
| `HabResponsaveisSection` | `src/features/form/sections/HabResponsaveisSection.tsx` | Aba Hab. Responsáveis |
| `HabClassificacaoSection` | `src/features/form/sections/HabClassificacaoSection.tsx` | Aba Hab. Classificação (select G1-G5 + select HAB-A a HAB-E) |
| `NdaSection` | `src/features/form/sections/NdaSection.tsx` | Aba NDA completa |
| `ReadinessClassification` | `src/features/form/ReadinessClassification.tsx` | Badge de prontidão G1-G5 + HAB-X em tempo real |
| `readiness.ts` | `src/lib/readiness.ts` | Função pura `calculateReadiness` — sem JSX |
| `nda-text.ts` | `src/constants/nda-text.ts` | Texto legal do NDA como constante TypeScript |

---

## Layout dos Novos Elementos

### Abas Hab. Venda, Hab. Repositórios, Hab. Responsáveis

Seguem o padrão exato de `TorreClassificacaoSection`:

```
<form className="max-w-2xl" noValidate>
  <div className="space-y-4">   ← grupo de campos
    ...campos...
  </div>
  <hr className="my-6 border-gray-100" />  ← separador entre grupos
  <div className="space-y-4">
    ...campos...
  </div>
</form>
```

### Aba Hab. Classificação

Estrutura de seção com dois SelectField principais:

```
<form className="max-w-2xl" noValidate>
  <div className="space-y-6">
    <SelectField name="nivelGerencial" ...>   ← G1 a G5 (lido por calculateReadiness)
    <SelectField name="classificacaoFinal" ...>  ← HAB-A a HAB-E
    <TextareaField name="observacoes" ...>
  </div>
</form>
```

### Matriz de Habilitações (dentro de HabRepositoriosSection ou seção dedicada)

Cada domínio como `<section>` com título + grid de campos:

```
<section className="space-y-4">
  <h4 className="text-base font-semibold text-gray-800">{nomeDominio}</h4>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <SelectField name="{dominio}.existeControle" ... />    ← Sim/Não/Parcial
    <SelectField name="{dominio}.repositorioPrincipal" ... />  ← GED/etc.
    <InputField name="{dominio}.responsavelInterno" ... />  ← texto livre
    <TextareaField name="{dominio}.observacoes" ... />
  </div>
</section>
```

Grid responsivo: 1 coluna em mobile, 2 colunas em `md:` (768px+).

### Aba NDA

```
<form className="max-w-2xl" noValidate>
  {/* Container scrollable do texto legal */}
  <div className="max-h-[400px] overflow-y-auto border rounded-lg p-4 bg-gray-50 text-sm leading-relaxed mb-6">
    {NDA_TEXT}
  </div>

  {/* Campos de aceite */}
  <div className="space-y-4">
    <InputField name="nomeRepresentante" label="Nome do representante legal" />
    <InputField name="cargo" label="Cargo" />
    <InputField name="cpf" label="CPF" />
    <InputField name="dataAceite" label="Data de aceite" disabled />  ← auto-preenchida
    <CheckboxField name="aceitaTermos" label="Li e aceito os termos do NDA" required />
  </div>
</form>
```

Nota: `CheckboxField` single (não group) para `aceitaTermos` — `z.literal(true)`. Se não existir componente dedicado, implementar inline no `NdaSection` como `Controller` direto.

### Componente ReadinessClassification

Placement: **sticky bottom bar** dentro do `<main>` do `FormLayout`, acima da área de conteúdo da seção ativa. Exibido em todas as abas após o título `<h1>`.

```
<div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-3">
  <span className="text-sm font-semibold text-gray-700">Prontidão atual:</span>
  {gerencial && <Badge grade={gerencial} />}   ← componente Badge existente
  {habilitacoes && <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-{cor}-100 text-{cor}-700">{habilitacoes}</span>}
  {!gerencial && !habilitacoes && <span className="text-sm text-gray-400">Preencha as abas de classificação para ver o resultado</span>}
  {ndaAceito && <span className="text-xs text-green-700 font-medium">NDA aceito</span>}
</div>
```

Responsividade: `flex-wrap` — em mobile empilha os badges verticalmente sem overflow.

---

## Copywriting Contract

| Elemento | Texto |
|----------|-------|
| Empty state (aba não preenchida, antes de qualquer interação) | "Esta seção ainda não possui campos preenchidos." |
| Empty state ReadinessClassification (sem seleção de classificação) | "Preencha as abas de classificação para ver o resultado" |
| Erro de campo obrigatório (checkbox NDA) | "Você deve aceitar os termos do NDA para continuar" |
| Erro de campo de texto obrigatório (genérico) | "Este campo é obrigatório" |
| Placeholder select padrão | "Selecione uma opção" (padrão `SelectField` existente — não alterar) |
| Label do checkbox NDA | "Li e aceito os termos do NDA mútuo" |
| Label campo data de aceite | "Data de aceite" |
| Label campo nome representante | "Nome do representante legal" |
| Label campo CPF | "CPF do representante" |
| Label campo cargo | "Cargo" |
| Heading do container NDA | (sem heading — o texto começa diretamente no container scrollable) |
| Rótulo da seção de prontidão | "Prontidão atual:" |
| NDA aceito — indicador | "NDA aceito" |

Não há ações destrutivas nesta fase (nenhum delete, archive ou reset de dados).

Fonte: CONTEXT.md D-05, D-07; padrão `SelectField` (placeholder existente).

---

## Validação e Estados de Interação

| Campo | Regra Zod | Comportamento visual |
|-------|-----------|----------------------|
| `aceitaTermos` (NDA) | `z.literal(true)` | Checkbox com borda vermelha + mensagem de erro abaixo ao tentar salvar sem marcar |
| Campos de texto das seções (nome, cargo, CPF, observações) | `z.string().optional()` | Sem validação inline — erro só em campos obrigatórios |
| `nivelGerencial` (Hab. Classificação) | `z.enum([...]).optional()` | Sem erro inline — campo opcional |
| `classificacaoFinal` HAB (Hab. Classificação) | `z.enum([...]).optional()` | Sem erro inline — campo opcional |
| `dataAceite` | `z.string().default(() => new Date().toLocaleDateString('pt-BR'))` | Input desabilitado (`disabled`), preenchido automaticamente ao montar |

Modo de validação: `mode: 'onBlur'` (padrão da Phase 6 — não alterar).

Sincronização store: `useEffect(() => { const sub = watch(v => store.updateSection(tab, v)); return () => sub.unsubscribe() }, [])` — sem deps (padrão subscription anti-loop da Phase 6).

---

## Responsividade (UX-02)

| Breakpoint | Comportamento |
|------------|---------------|
| Mobile (< 768px) | Formulário em coluna única; abas como pills horizontais scrolláveis no topo (já implementado em TabNavigation); grid da Matriz de Habilitações vira 1 coluna |
| Tablet (768px = `md:`) | Grid da Matriz de Habilitações passa para 2 colunas (`md:grid-cols-2`); sidebar lateral aparece com nav de abas vertical |
| Desktop (1280px+) | Layout completo: sidebar 220-300px + main flex-1; max-w-2xl no formulário previne linhas excessivamente largas |

Container de conteúdo das seções: `max-w-2xl` (672px) — evita que campos de texto fiquem muito largos em monitores grandes. Padrão estabelecido em `TorreClassificacaoSection` — manter em todas as novas sections.

Container NDA scrollable: `max-h-[400px] overflow-y-auto` — altura fixa com scroll interno; nunca expandir para ocupar a viewport inteira.

---

## Registry Safety

| Registry | Blocos Usados | Safety Gate |
|----------|---------------|-------------|
| shadcn official | nenhum (sem shadcn inicializado) | not applicable |
| third-party | nenhum | not applicable |

Não há dependências de registry externo nesta fase. Todos os componentes são criados internamente ou reutilizados do codebase existente.

---

## Pre-Population Sources

| Fonte | Decisões utilizadas |
|-------|---------------------|
| CONTEXT.md `<decisions>` | D-01 a D-09 — engine G1-G5, NDA, Matriz de Habilitações, paleta de badges |
| CONTEXT.md `<specifics>` | Paleta HAB-A a HAB-E, container NDA com `max-h-[400px]`, paleta G1-G5 com classes Tailwind |
| CONTEXT.md `<code_context>` | Padrão subscription, props explícitas, `defaultValues`, `mode: 'onBlur'` |
| `src/index.css` | Tokens `--color-primary`, `--color-accent`, `--color-g1..g5`, `--font-sans` |
| `src/components/ui/` | API de todos os field components, classes CSS estabelecidas |
| `src/features/form/FormLayout.tsx` | Estrutura de layout, heading `text-xl font-semibold`, `max-w` do main |
| `src/features/form/sections/TorreClassificacaoSection.tsx` | Modelo exato de estrutura: `space-y-4`, `hr my-6`, `max-w-2xl` |
| `src/components/ui/badge.tsx` | Implementação exata dos badges G1-G5 (reutilizar sem alteração) |
| REQUIREMENTS.md §UX-02 | Responsividade desktop + tablet 768px |

Nenhuma pergunta foi feita ao usuário — todas as decisões de design estavam pré-respondidas nos artefatos upstream e no codebase existente.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending
