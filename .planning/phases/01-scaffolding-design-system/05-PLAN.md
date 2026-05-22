---
id: "01-05"
title: "Criar biblioteca de componentes UI base"
phase: 1
wave: 4
status: pending
type: implementation
depends_on: ["01-02", "01-06"]
must_haves:
  - req: "UX-01"
    truth: "8 componentes base renderizam corretamente com tokens Tailwind v4 (bg-primary, bg-accent, etc.)"
  - req: "UX-06"
    truth: "Página DesignSystem.tsx visualiza todos os componentes juntos para verificação visual"
truths:
  - "Button com 4 variantes (primary, secondary, ghost, danger) e 3 tamanhos (sm, md, lg)"
  - "Badge G1-G5 com cores corretas para escala de avaliação de prontidão"
  - "Input, Textarea e Select com estilos consistentes e suporte a estado de erro"
  - "Card, Spinner e Skeleton criados"
  - "src/components/ui/index.ts exporta todos os 8 componentes"
  - "class-variance-authority usado para variantes do Button"
---

## Objetivo

Criar os 8 componentes UI base do design system: Button (com CVA), Input, Textarea, Select, Card, Badge G1-G5, Spinner e Skeleton. Criar a página `DesignSystem.tsx` que renderiza todos os componentes para verificação visual.

## Contexto

Este plano está na Wave 3 pois depende do Plano 02 (Tailwind v4 com tokens) para que as classes `bg-primary`, `bg-accent`, `bg-g1-g5` existam. Os componentes usam as variáveis de tema definidas em `src/index.css`.

Este plano também instala `class-variance-authority` (CVA) — a biblioteca para criar variantes de componentes de forma type-safe. O CVA é o padrão da indústria para componentes acessíveis e altamente variáveis (shadcn/ui, Radix etc. usam este padrão).

**Componentes a criar:**

| Arquivo | Componente | Variantes |
|---------|-----------|-----------|
| `button.tsx` | `Button` | primary, secondary, ghost, danger × sm, md, lg |
| `input.tsx` | `Input` | default, error |
| `textarea.tsx` | `Textarea` | default, error |
| `select.tsx` | `Select` | default, error |
| `card.tsx` | `Card`, `CardHeader`, `CardContent`, `CardFooter` | — |
| `badge.tsx` | `Badge` | G1, G2, G3, G4, G5 |
| `spinner.tsx` | `Spinner` | sm, md, lg |
| `skeleton.tsx` | `Skeleton` | — |

## Tarefas

### Tarefa 1 — Instalar class-variance-authority

```bash
npm install class-variance-authority@0.7.1
```

Confirme:

```bash
npm list class-variance-authority
# Resultado esperado: └── class-variance-authority@0.7.1
```

**Nota:** `clsx` e `tailwind-merge` já foram instalados no Plano 02. Se o Plano 02 não foi executado, instale-os agora: `npm install clsx@2.1.1 tailwind-merge@3.6.0`

### Tarefa 2 — Criar src/components/ui/button.tsx

```typescript
import { cva, type VariantProps } from 'class-variance-authority'
import { forwardRef, type ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-white hover:bg-primary-800',
        secondary: 'border border-primary text-primary hover:bg-primary-50',
        ghost:     'text-primary hover:bg-primary-50',
        danger:    'bg-g1 text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4 text-sm',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      disabled={isLoading ?? disabled}
      {...props}
    >
      {isLoading ? (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : null}
      {children}
    </button>
  )
)
Button.displayName = 'Button'

export { buttonVariants }
```

### Tarefa 3 — Criar src/components/ui/input.tsx

```typescript
import { forwardRef, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean
  errorMessage?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, errorMessage, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
          'placeholder:text-gray-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-g1 focus-visible:ring-g1/50'
            : 'border-gray-300 hover:border-primary-400',
          className
        )}
        {...props}
      />
      {error && errorMessage ? (
        <p className="text-xs text-g1">{errorMessage}</p>
      ) : null}
    </div>
  )
)
Input.displayName = 'Input'
```

### Tarefa 4 — Criar src/components/ui/textarea.tsx

```typescript
import { forwardRef, type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
  errorMessage?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, errorMessage, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <textarea
        ref={ref}
        className={cn(
          'flex min-h-[80px] w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
          'placeholder:text-gray-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          error
            ? 'border-g1 focus-visible:ring-g1/50'
            : 'border-gray-300 hover:border-primary-400',
          className
        )}
        {...props}
      />
      {error && errorMessage ? (
        <p className="text-xs text-g1">{errorMessage}</p>
      ) : null}
    </div>
  )
)
Textarea.displayName = 'Textarea'
```

### Tarefa 5 — Criar src/components/ui/select.tsx

```typescript
import { forwardRef, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean
  errorMessage?: string
  options: Array<{ value: string; label: string }>
  placeholder?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, error, errorMessage, options, placeholder, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      <select
        ref={ref}
        className={cn(
          'flex h-10 w-full rounded-md border bg-white px-3 py-2 text-sm transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error
            ? 'border-g1 focus-visible:ring-g1/50'
            : 'border-gray-300 hover:border-primary-400',
          className
        )}
        {...props}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && errorMessage ? (
        <p className="text-xs text-g1">{errorMessage}</p>
      ) : null}
    </div>
  )
)
Select.displayName = 'Select'
```

### Tarefa 6 — Criar src/components/ui/card.tsx

```typescript
import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 bg-white shadow-sm',
        className
      )}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex flex-col gap-1.5 p-6', className)}
      {...props}
    />
  )
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('p-6 pt-0', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('flex items-center p-6 pt-0', className)}
      {...props}
    />
  )
}
```

### Tarefa 7 — Criar src/components/ui/badge.tsx

Os badges G1-G5 representam a escala de avaliação de prontidão do projeto (Crítico → Excelente):

```typescript
import { cn } from '@/lib/utils'

const gradeConfig = {
  G1: { label: 'G1 — Crítico',   bg: 'bg-g1', text: 'text-white' },
  G2: { label: 'G2 — Baixo',     bg: 'bg-g2', text: 'text-white' },
  G3: { label: 'G3 — Médio',     bg: 'bg-g3', text: 'text-primary-900' },
  G4: { label: 'G4 — Bom',       bg: 'bg-g4', text: 'text-white' },
  G5: { label: 'G5 — Excelente', bg: 'bg-g5', text: 'text-white' },
} as const

export type Grade = keyof typeof gradeConfig

interface BadgeProps {
  grade: Grade
  className?: string
}

export function Badge({ grade, className }: BadgeProps) {
  const { label, bg, text } = gradeConfig[grade]
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        bg,
        text,
        className
      )}
    >
      {label}
    </span>
  )
}
```

### Tarefa 8 — Criar src/components/ui/spinner.tsx

```typescript
import { cn } from '@/lib/utils'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-6 w-6 border-2',
  lg: 'h-10 w-10 border-4',
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="Carregando"
      className={cn(
        'inline-block animate-spin rounded-full border-primary border-t-transparent',
        sizeClasses[size],
        className
      )}
    />
  )
}
```

### Tarefa 9 — Criar src/components/ui/skeleton.tsx

```typescript
import { cn } from '@/lib/utils'
import { type HTMLAttributes } from 'react'

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-md bg-gray-200', className)}
      {...props}
    />
  )
}
```

### Tarefa 10 — Criar src/components/ui/index.ts (barrel exports)

```typescript
export { Button, buttonVariants } from './button'
export type { ButtonProps } from './button'

export { Input } from './input'
export { Textarea } from './textarea'
export { Select } from './select'

export { Card, CardHeader, CardContent, CardFooter } from './card'

export { Badge } from './badge'
export type { Grade } from './badge'

export { Spinner } from './spinner'
export { Skeleton } from './skeleton'
```

### Tarefa 11 — Criar src/pages/DesignSystem.tsx

Esta página renderiza todos os componentes para verificação visual. Não é parte do produto final — é uma sandbox de desenvolvimento:

```typescript
import {
  Button,
  Input,
  Textarea,
  Select,
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Badge,
  Spinner,
  Skeleton,
} from '@/components/ui'
import { useToast } from '@/hooks/useToast'
import { useState } from 'react'

export function DesignSystem() {
  const { success, error, loading, promise } = useToast()
  const [inputValue, setInputValue] = useState('')
  const [hasError, setHasError] = useState(false)

  const simulateAsync = () =>
    new Promise<string>((resolve) => setTimeout(() => resolve('OK'), 1500))

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-12">
        <header className="rounded-xl bg-primary p-8 text-white">
          <h1 className="text-3xl font-bold">Design System — Roteiro Unificado</h1>
          <p className="mt-2 text-primary-200">Paleta Azul/Laranja · Escala G1–G5</p>
        </header>

        {/* Botões */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">Button</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button isLoading>Salvando...</Button>
            <Button disabled>Desabilitado</Button>
          </div>
        </section>

        {/* Badges G1-G5 */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">Badge — Escala de Prontidão</h2>
          <div className="flex flex-wrap gap-3">
            <Badge grade="G1" />
            <Badge grade="G2" />
            <Badge grade="G3" />
            <Badge grade="G4" />
            <Badge grade="G5" />
          </div>
        </section>

        {/* Inputs */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">Input / Textarea / Select</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">Nome da Empresa</label>
              <Input
                placeholder="Ex: Construtora Exemplo Ltda"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">CNPJ (com erro)</label>
              <Input
                placeholder="00.000.000/0000-00"
                error={hasError}
                errorMessage="CNPJ inválido"
                onFocus={() => setHasError(true)}
                onBlur={() => setHasError(false)}
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Observações</label>
            <Textarea placeholder="Descreva a situação atual..." rows={3} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Nível de Prontidão</label>
            <Select
              placeholder="Selecione..."
              options={[
                { value: 'G1', label: 'G1 — Crítico' },
                { value: 'G2', label: 'G2 — Baixo' },
                { value: 'G3', label: 'G3 — Médio' },
                { value: 'G4', label: 'G4 — Bom' },
                { value: 'G5', label: 'G5 — Excelente' },
              ]}
            />
          </div>
        </section>

        {/* Card */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">Card</h2>
          <Card className="max-w-sm">
            <CardHeader>
              <h3 className="font-semibold">Construtora Exemplo</h3>
              <p className="text-sm text-gray-500">Última avaliação: 15/01/2025</p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Badge grade="G4" />
                <span className="text-sm text-gray-600">Prontidão atual</span>
              </div>
            </CardContent>
            <CardFooter className="gap-2">
              <Button size="sm">Ver detalhes</Button>
              <Button size="sm" variant="ghost">Histórico</Button>
            </CardFooter>
          </Card>
        </section>

        {/* Spinner e Skeleton */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">Spinner / Skeleton</h2>
          <div className="flex items-center gap-6">
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </div>
          <div className="space-y-2 max-w-sm">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
          </div>
        </section>

        {/* Toasts */}
        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-primary">Toast (Sonner)</h2>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => success('Avaliação salva com sucesso!')}>
              Sucesso
            </Button>
            <Button variant="danger" onClick={() => error('Erro ao conectar com o servidor.')}>
              Erro
            </Button>
            <Button variant="secondary" onClick={() => loading('Sincronizando dados...')}>
              Loading
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                promise(simulateAsync(), {
                  loading: 'Salvando...',
                  success: 'Salvo com sucesso!',
                  error: 'Erro ao salvar',
                })
              }
            >
              Promise
            </Button>
          </div>
        </section>
      </div>
    </div>
  )
}
```

### Tarefa 12 — Atualizar App.tsx para mostrar a página DesignSystem

Atualize `src/App.tsx` para renderizar a página DesignSystem (removendo os stubs anteriores):

```typescript
import { DesignSystem } from '@/pages/DesignSystem'

function App() {
  return <DesignSystem />
}

export default App
```

## Critérios de Verificação

```bash
# 1. Build sem erros TypeScript
npm run build
# Resultado esperado: "✓ built in Xs" sem erros

# 2. Lint sem erros
npm run lint
# Resultado esperado: sem erros (warnings são aceitáveis)

# 3. Verificar que todos os componentes existem
ls src/components/ui/
# Resultado esperado: badge.tsx button.tsx card.tsx index.ts input.tsx
#                     select.tsx skeleton.tsx spinner.tsx textarea.tsx

# 4. Verificar que a página DesignSystem existe
ls src/pages/DesignSystem.tsx
# Resultado esperado: arquivo existe

# 5. Verificação visual (MANUAL — requer browser):
npm run dev
# Acesse http://localhost:5173 e confirme:
# ✓ Header azul escuro (#123B66) com texto branco
# ✓ Button "Primary" — fundo azul escuro
# ✓ Button "Danger" — fundo vermelho (cor G1)
# ✓ Badge G1 — vermelho; G2 — laranja; G3 — amarelo; G4 — azul; G5 — verde
# ✓ Input com estado de erro (clique no campo CNPJ, ele fica vermelho)
# ✓ Card com bordas arredondadas e sombra sutil
# ✓ Spinner animado em 3 tamanhos
# ✓ Skeleton com animação pulse
# ✓ Toasts aparecem no canto superior direito ao clicar nos botões
```

## Notas

**Por que `forwardRef` em Input, Textarea, Select?**
Com `forwardRef`, esses componentes podem ser usados com bibliotecas de gerenciamento de formulários (react-hook-form, no Plano de formulários futuros). O `ref` permite acesso direto ao elemento DOM para foco programático, validação etc.

**`cn()` vs `clsx()` diretamente:**
Usar sempre `cn()` (que combina `clsx` + `tailwind-merge`). O `tailwind-merge` resolve conflitos — por exemplo, se um componente tem `px-4` e você passa `className="px-8"`, o `tailwind-merge` remove o `px-4` original e aplica apenas `px-8`. Sem `tailwind-merge`, ambas as classes ficariam e a ordem no CSS determinaria qual ganha (comportamento imprevisível).

**Sobre a página DesignSystem:**
Ela não é roteada (sem React Router nesta fase). O `App.tsx` a renderiza diretamente. Nas fases seguintes, quando o roteamento for adicionado, a rota `/design-system` será adicionada e o `App.tsx` será atualizado.

**Tipos do CVA e TypeScript 6:**
O `class-variance-authority@0.7.1` é totalmente compatível com TypeScript 6. O padrão `VariantProps<typeof buttonVariants>` infere automaticamente os tipos de variantes — não é necessário declarar tipos manualmente para os props de variante.

**Badge G3 com texto escuro:**
O badge G3 (Médio — amarelo) usa `text-primary-900` em vez de `text-white` pois o amarelo tem alto brilho e texto branco teria contraste insuficiente. Esta é uma decisão de acessibilidade (WCAG AA).
