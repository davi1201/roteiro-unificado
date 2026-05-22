# Phase 1: Scaffolding & Design System — Pesquisa

**Pesquisado em:** 2026-05-22  
**Domínio:** React + Vite + Tailwind v4 + Supabase Client + Design System base  
**Confiança Geral:** HIGH

---

## Resumo Executivo

A Phase 1 inicializa toda a infraestrutura técnica do projeto: scaffolding do app React/Vite/TypeScript, configuração do Tailwind v4 com tokens de marca, cliente Supabase, state management (TanStack Query v5 + Zustand v5), biblioteca de componentes UI base e tooling (ESLint + Prettier + Husky). Todas as versões foram verificadas no registry npm em 2026-05-22.

O stack é bem maduro e tem poucas armadilhas, mas o Tailwind v4 tem mudanças breaking significativas em relação ao v3 (sem `tailwind.config.js`, configuração via CSS `@theme {}`) e o ESLint 10 usa flat config por padrão — ambos exigem atenção especial dos executores.

**Recomendação principal:** Usar `@tailwindcss/vite` (não PostCSS), definir todos os tokens de cor em `@theme {}` no CSS principal, usar `class-variance-authority` (CVA) + `tailwind-merge` para variantes de componentes, e `sonner` para toasts.

---

## Mapa de Responsabilidade Arquitetural

| Capability | Tier Principal | Tier Secundário | Racional |
|---|---|---|---|
| Design system / tokens de cor | Browser / Client (CSS) | — | Tokens são CSS custom properties no `:root`; sem servidor |
| Componentes UI base | Browser / Client (React) | — | Átomos puros sem dependência de backend |
| Supabase client init | Frontend (src/lib) | — | `createBrowserClient` gera instância client-side; credenciais lidas de env vars no build time |
| TanStack Query provider | Browser / Client (React root) | — | Provider envolve toda a árvore; cache client-side |
| Zustand store skeleton | Browser / Client (React) | — | Estado global do formulário vive no cliente |
| Toast / notificações | Browser / Client (React) | — | `ToastProvider` montado no root do app |
| ESLint + Prettier + Husky | Dev tooling (git hooks) | — | Executa localmente; sem impacto em runtime |

---

## Standard Stack

### Dependências de Produção

| Pacote | Versão Verificada | Finalidade | Por que usar |
|---|---|---|---|
| `react` | `19.2.6` | UI framework | Template Vite react-ts já inclui |
| `react-dom` | `19.2.6` | DOM renderer | Acompanha react |
| `@supabase/supabase-js` | `2.106.1` | BaaS client (auth, db, storage) | Cliente oficial com tipagem TS; `createBrowserClient` é SSR-safe |
| `@tanstack/react-query` | `5.100.11` | Server state / cache / sync | Padrão do mercado; v5 tem API estável |
| `zustand` | `5.0.13` | Client state global | Mínimo boilerplate; suporte a `persist` middleware |
| `class-variance-authority` | `0.7.1` | Gerenciamento de variantes CSS | Remove `if/else` de classes; type-safe |
| `clsx` | `2.1.1` | Conditional className | Utilitário leve; complementa CVA |
| `tailwind-merge` | `3.6.0` | Merge de classes Tailwind sem conflito | Necessário quando props sobrescrevem classes de variante |
| `sonner` | `2.0.7` | Toast / notificações | Mais moderno que react-hot-toast; estilização Tailwind nativa |

### Dependências de Desenvolvimento

| Pacote | Versão Verificada | Finalidade |
|---|---|---|
| `vite` | `8.0.14` | Build tool / dev server |
| `@vitejs/plugin-react` | `6.0.2` | Fast Refresh + JSX transform |
| `tailwindcss` | `4.3.0` | CSS utility framework |
| `@tailwindcss/vite` | `4.3.0` | Plugin Vite para Tailwind v4 (substitui PostCSS) |
| `typescript` | `6.0.3` | Type checker |
| `eslint` | `10.4.0` | Linter (usa flat config por padrão) |
| `@typescript-eslint/eslint-plugin` | `8.59.4` | Regras TypeScript para ESLint |
| `@typescript-eslint/parser` | `8.59.4` | Parser TypeScript para ESLint |
| `eslint-plugin-react-hooks` | `7.1.1` | Regras dos React Hooks |
| `eslint-plugin-react-refresh` | `0.5.2` | Regras de Fast Refresh |
| `eslint-config-prettier` | `10.1.8` | Desabilita regras ESLint que conflitam com Prettier |
| `prettier` | `3.8.3` | Formatador de código |
| `prettier-plugin-tailwindcss` | `0.8.0` | Ordena classes Tailwind no Prettier |
| `husky` | `9.1.7` | Git hooks |
| `lint-staged` | `17.0.5` | Roda linters apenas em arquivos staged |

> **Node.js requerido:** `>=20.19.0 || >=22.12.0` (exigido pelo Vite 8). Sistema atual: v20.19.3 ✅

### Instalação Completa

```bash
# Passo 1 — Scaffold (interativo: selecionar React + TypeScript)
npm create vite@latest roteiro-unificado -- --template react-ts
cd roteiro-unificado

# Passo 2 — Produção
npm install @supabase/supabase-js @tanstack/react-query zustand \
  class-variance-authority clsx tailwind-merge sonner

# Passo 3 — Tailwind
npm install tailwindcss @tailwindcss/vite

# Passo 4 — DevDependencies (tooling)
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser \
  eslint-plugin-react-hooks eslint-plugin-react-refresh \
  eslint-config-prettier prettier prettier-plugin-tailwindcss \
  husky lint-staged
```

---

## Auditoria de Legitimidade de Pacotes

> Slopcheck não estava disponível no ambiente de pesquisa. Todos os pacotes foram verificados manualmente via `npm view` e cruzados com fontes oficiais.

| Pacote | Registry | Idade aprox. | Source Repo | slopcheck | Disposição |
|---|---|---|---|---|---|
| `tailwindcss` | npm | ~7 anos | github.com/tailwindlabs/tailwindcss | manual OK | Aprovado |
| `@tailwindcss/vite` | npm | ~1 ano | github.com/tailwindlabs/tailwindcss | manual OK | Aprovado |
| `@supabase/supabase-js` | npm | ~4 anos | github.com/supabase/supabase-js | manual OK | Aprovado |
| `@tanstack/react-query` | npm | ~6 anos | github.com/tanstack/query | manual OK | Aprovado |
| `zustand` | npm | ~5 anos | github.com/pmndrs/zustand | manual OK | Aprovado |
| `class-variance-authority` | npm | ~2 anos | github.com/joe-bell/cva | manual OK | Aprovado |
| `clsx` | npm | ~5 anos | github.com/lukeed/clsx | manual OK | Aprovado |
| `tailwind-merge` | npm | ~3 anos | github.com/dcastil/tailwind-merge | manual OK | Aprovado |
| `sonner` | npm | ~2 anos | github.com/emilkowalski/sonner | manual OK | Aprovado |
| `husky` | npm | ~8 anos | github.com/typicode/husky | manual OK | Aprovado |
| `lint-staged` | npm | ~7 anos | github.com/lint-staged/lint-staged | manual OK | Aprovado |
| `prettier-plugin-tailwindcss` | npm | ~2 anos | github.com/tailwindlabs/prettier-plugin-tailwindcss | manual OK | Aprovado |

**Pacotes removidos por slopcheck [SLOP]:** nenhum  
**Pacotes marcados como suspeitos [SUS]:** nenhum

---

## Padrões de Arquitetura

### Diagrama de Arquitetura

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│  main.tsx                                               │
│    └─ QueryClientProvider (TanStack Query v5)           │
│         └─ App.tsx                                      │
│              ├─ <Toaster /> (Sonner — posição top-right)│
│              └─ Router → Pages                          │
│                   └─ Components (ui/ + forms/)          │
│                        ├─ Button, Input, Select, Card   │
│                        ├─ Badge (G1–G5)                 │
│                        └─ Spinner, Skeleton             │
│                                                         │
│  Zustand stores/                                        │
│    └─ useFormStore (skeleton — expand em Phase 5)       │
│                                                         │
│  src/lib/supabase.ts                                    │
│    └─ createBrowserClient(URL, ANON_KEY)                │
│         └─ → Supabase Cloud (auth, db, storage)         │
└─────────────────────────────────────────────────────────┘
```

### Estrutura de Pastas Recomendada

```
src/
├── components/
│   ├── ui/              # Átomos puros reutilizáveis
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Textarea.tsx
│   │   ├── Select.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Spinner.tsx
│   │   └── Skeleton.tsx
│   └── forms/           # Compostos de formulário (Phase 5)
├── features/            # Uma pasta por domínio/feature (Phase 3+)
├── hooks/               # Hooks compartilhados globais
├── lib/
│   ├── supabase.ts      # Cliente Supabase
│   └── utils.ts         # cn(), formatters...
├── stores/
│   └── formStore.ts     # Zustand — skeleton para Phase 5
├── types/               # Tipos TypeScript compartilhados
├── index.css            # @import "tailwindcss" + @theme {}
└── main.tsx
```

---

## Seção 1 — Configuração Tailwind v4 + Tokens de Marca

### CSS Principal (`src/index.css`)

```css
/* Source: https://tailwindcss.com/docs/v4-beta (VERIFIED) */

@import "tailwindcss";

/* ── Tokens de marca ────────────────────────────── */
@theme {
  /* Cor primária: azul escuro #123B66 */
  --color-primary:     oklch(0.348 0.088 252.7);
  --color-primary-50:  oklch(0.970 0.015 252.7);
  --color-primary-100: oklch(0.930 0.030 252.7);
  --color-primary-200: oklch(0.850 0.055 252.7);
  --color-primary-300: oklch(0.730 0.075 252.7);
  --color-primary-400: oklch(0.600 0.085 252.7);
  --color-primary-500: oklch(0.490 0.090 252.7);
  --color-primary-600: oklch(0.400 0.088 252.7);
  --color-primary-700: oklch(0.348 0.088 252.7); /* = #123B66 */
  --color-primary-800: oklch(0.280 0.075 252.7);
  --color-primary-900: oklch(0.210 0.055 252.7);

  /* Cor accent: laranja #F28C28 */
  --color-accent:      oklch(0.735 0.161 58.8);
  --color-accent-50:   oklch(0.980 0.025 58.8);
  --color-accent-100:  oklch(0.950 0.055 58.8);
  --color-accent-200:  oklch(0.890 0.100 58.8);
  --color-accent-300:  oklch(0.840 0.135 58.8);
  --color-accent-400:  oklch(0.790 0.155 58.8);
  --color-accent-500:  oklch(0.735 0.161 58.8); /* = #F28C28 */
  --color-accent-600:  oklch(0.660 0.155 58.8);
  --color-accent-700:  oklch(0.570 0.140 58.8);
  --color-accent-800:  oklch(0.460 0.115 58.8);
  --color-accent-900:  oklch(0.360 0.085 58.8);

  /* Escala de prontidão (badges G1–G5) */
  --color-g1: oklch(0.500 0.230 22.0);   /* Crítico  — vermelho   */
  --color-g2: oklch(0.735 0.161 58.8);   /* Baixo    — laranja    */
  --color-g3: oklch(0.795 0.185 86.0);   /* Médio    — amarelo    */
  --color-g4: oklch(0.546 0.215 264.1);  /* Bom      — azul       */
  --color-g5: oklch(0.590 0.160 150.0);  /* Excelente — verde     */

  /* Tipografia */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* Border radius */
  --radius-sm:  0.25rem;
  --radius-md:  0.375rem;
  --radius-lg:  0.5rem;
  --radius-xl:  0.75rem;
  --radius-2xl: 1rem;
}

/* ── Dark mode (prep para fases futuras) ─────────── */
@custom-variant dark (&:where(.dark, .dark *));
```

> **Como usar no JSX:**  
> `bg-primary` → `background: oklch(0.348 0.088 252.7)` (= #123B66)  
> `text-accent` → `color: oklch(0.735 0.161 58.8)` (= #F28C28)  
> `bg-primary-50` → tint mais claro do azul  
> `bg-g5` → verde de G5 (excelente)

### Valores HEX → OKLCH verificados via cálculo

| Cor da Marca | HEX | OKLCH Calculado |
|---|---|---|
| Primary (azul escuro) | `#123B66` | `oklch(0.348 0.088 252.7)` |
| Accent (laranja) | `#F28C28` | `oklch(0.735 0.161 58.8)` |

> **Por que OKLCH?** É o espaço de cor padrão do Tailwind v4. Garante interpolação perceptualmente uniforme e renderização correta em displays P3. Tailwind/Lightning CSS adiciona fallbacks `rgb()` automaticamente para browsers sem suporte a OKLCH (~5% em 2026). [VERIFIED: tailwindcss.com/docs]

---

## Seção 2 — Configuração Vite

### `vite.config.ts`

```typescript
// Source: https://tailwindcss.com/docs/installation/vite (VERIFIED)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),   // Vite plugin — NÃO instalar @tailwindcss/postcss junto
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

> ⚠️ **Não instalar** `@tailwindcss/postcss`. Usar apenas `@tailwindcss/vite`. Instalar ambos causa processamento duplo. [VERIFIED: tailwindcss.com]

---

## Seção 3 — TypeScript Configuration

### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "skipLibCheck": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

**Pontos críticos:**

| Opção | Valor | Motivo |
|---|---|---|
| `"strict": true` | obrigatório | Zod v4 e React 19 dependem de strict mode para type inference correta |
| `"jsx": "react-jsx"` | obrigatório | React 19 usa new JSX transform; elimina necessidade de `import React` |
| `"moduleResolution": "bundler"` | recomendado | Modo correto para Vite; evita problemas com exports de pacotes ESM |
| `"target": "ES2022"` | recomendado | Suporta top-level await e outras features modernas; Vite transpila para browsers-alvo |
| `"paths"` | aliases `@/` | Necessário aqui E no `vite.config.ts` para funcionar tanto em runtime quanto em type-check |

> **Zod v4 e TypeScript 6:** Zod 4.4.3 foi verificado. A versão atual do `@typescript-eslint@8.59.4` suporta TypeScript `>=4.8.4 <6.1.0` — TypeScript 6.0.3 está dentro do range. **Atenção:** não atualizar para TypeScript 6.1 até que @typescript-eslint lance suporte. [VERIFIED: npm registry — peerDependencies]

---

## Seção 4 — Supabase Client

### `src/lib/supabase.ts`

```typescript
// Source: https://supabase.com/docs/reference/javascript/initializing (VERIFIED)
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### `.env.local` (não commitar — adicionar ao `.gitignore`)

```bash
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### `.env.example` (commitar — template para desenvolvedores)

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Nota:** `createClient` (não `createBrowserClient`) é o método correto para apps SPA com Vite — não há SSR. `createBrowserClient` é específico do pacote `@supabase/ssr` para frameworks como Next.js. [VERIFIED: supabase.com/docs]

---

## Seção 5 — TanStack Query v5 + Zustand v5

### Setup no Root (`src/main.tsx`)

```typescript
// Source: https://tanstack.com/query/v5/docs/framework/react/quick-start (VERIFIED)
import React from 'react'
import ReactDOM from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import App from './App'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,  // 5 minutos
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster position="top-right" richColors />
    </QueryClientProvider>
  </React.StrictMode>
)
```

### Zustand Store Skeleton (`src/stores/formStore.ts`)

```typescript
// Source: https://docs.pmnd.rs/zustand/getting-started/introduction (VERIFIED)
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FormState {
  currentStep: number
  completedSteps: Set<number>
  setStep: (step: number) => void
  markStepComplete: (step: number) => void
  reset: () => void
}

export const useFormStore = create<FormState>()(
  persist(
    (set) => ({
      currentStep: 0,
      completedSteps: new Set(),
      setStep: (step) => set({ currentStep: step }),
      markStepComplete: (step) =>
        set((s) => ({ completedSteps: new Set([...s.completedSteps, step]) })),
      reset: () => set({ currentStep: 0, completedSteps: new Set() }),
    }),
    { name: 'form-progress' }
  )
)
```

> **Nota Zustand v5:** A API é backward-compatible com v4. O middleware `persist` funciona da mesma forma. [ASSUMED — baseado em training data + npm changelog]

---

## Seção 6 — Estratégia de Componentes UI

### Decisão: CVA + tailwind-merge (sem Radix UI em Phase 1)

**Justificativa:**
- **CVA (class-variance-authority)** é o padrão do ecossistema para variantes type-safe. Elimina lógica condicional manual e garante que a prop `variant` seja tipada.
- **tailwind-merge** resolve conflitos quando props externas sobrescrevem classes de variante (ex: `<Button className="w-full">` não quebra a cor do botão).
- **Sem Radix UI** em Phase 1: os átomos base (Button, Input, Card) são elementos HTML simples. Radix seria útil para Select acessível (dropdown), mas pode ser adicionado em Phase 5 quando o formulário real for construído. Adicionar Radix agora aumenta complexidade sem benefício imediato.

### Utilitário `cn()` (`src/lib/utils.ts`)

```typescript
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Padrão CVA — Exemplo com `Button`

```typescript
// Source: https://cva.style/docs (VERIFIED: official docs)
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { ButtonHTMLAttributes, forwardRef } from 'react'

const buttonVariants = cva(
  // Classes base
  'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:   'bg-primary text-white hover:bg-primary-600',
        secondary: 'bg-white text-primary border border-primary hover:bg-primary-50',
        ghost:     'text-primary hover:bg-primary-50',
        danger:    'bg-g1 text-white hover:opacity-90',
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-10 px-4',
        lg: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { buttonVariants }
```

### Interfaces de Props Recomendadas por Componente

| Componente | Props-chave | Variantes |
|---|---|---|
| `Button` | `variant`, `size`, `isLoading?` | `primary`, `secondary`, `ghost`, `danger` |
| `Input` | `label?`, `error?`, `hint?`, `id` | (via `className` + estado de erro) |
| `Textarea` | `label?`, `error?`, `rows?` | (idem) |
| `Select` | `label?`, `error?`, `options[]` | (idem) |
| `Card` | `padding?`, `shadow?` | (via `className`) |
| `Badge` | `grade: 'G1'\|'G2'\|'G3'\|'G4'\|'G5'` | G1–G5 (ver abaixo) |
| `Spinner` | `size?`, `className?` | `sm`, `md`, `lg` |
| `Skeleton` | `className?` | (shape via `className`) |

### `Input` com estado de erro

```typescript
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-primary-800">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          'h-10 w-full rounded-md border bg-white px-3 text-sm outline-none transition-colors',
          'border-gray-300 focus:border-primary focus:ring-2 focus:ring-primary/20',
          error && 'border-g1 focus:border-g1 focus:ring-g1/20',
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-g1">{error}</p>}
      {hint && !error && <p className="text-xs text-gray-500">{hint}</p>}
    </div>
  )
)
```

---

## Seção 7 — Sistema de Badges G1–G5

### Lógica de Prontidão

Os badges representam níveis de prontidão (grau de maturidade da construtora):

| Grade | Label | Significado | Cor | HEX aprox. | Token CSS |
|---|---|---|---|---|---|
| G1 | Crítico | Sem condições | Vermelho | `#DC2626` | `--color-g1` |
| G2 | Baixo | Muito abaixo do mínimo | Laranja (brand accent) | `#F28C28` | `--color-g2` |
| G3 | Médio | Abaixo do mínimo | Amarelo | `#EAB308` | `--color-g3` |
| G4 | Bom | Acima do mínimo | Azul | `#2563EB` | `--color-g4` |
| G5 | Excelente | Plenamente apto | Verde | `#16A34A` | `--color-g5` |

> **Decisão de paleta:** G2 usa a cor accent da marca (`#F28C28`) para reforço de identidade. G4 usa azul (variante do primary) para indicar "acima do mínimo, progresso". A escala G1→G5 vai de vermelho/perigo a verde/sucesso, seguindo convenção universal de semáforo.

### Implementação do Badge

```typescript
// Cores definidas como bg/text no @theme via tokens --color-g1..g5
const gradeConfig = {
  G1: { label: 'G1 — Crítico',   bg: 'bg-g1',   text: 'text-white' },
  G2: { label: 'G2 — Baixo',     bg: 'bg-g2',   text: 'text-white' },
  G3: { label: 'G3 — Médio',     bg: 'bg-g3',   text: 'text-primary-900' },
  G4: { label: 'G4 — Bom',       bg: 'bg-g4',   text: 'text-white' },
  G5: { label: 'G5 — Excelente', bg: 'bg-g5',   text: 'text-white' },
} as const

type Grade = keyof typeof gradeConfig

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
        bg, text, className
      )}
    >
      {label}
    </span>
  )
}
```

> **Nota G3/amarelo:** Amarelo escuro com texto `text-primary-900` (quase preto) garante contraste WCAG AA. Não usar texto branco sobre amarelo.

---

## Seção 8 — Sistema de Toast: Sonner vs Alternativas

### Comparativo

| Critério | `sonner` v2.0.7 | `react-hot-toast` v2.6.0 | `react-toastify` v11.1.0 |
|---|---|---|---|
| Customização Tailwind v4 | ✅ Excelente (prop `className`) | ✅ Boa (prop `style`/`className`) | ⚠️ Requer override de CSS |
| Peso do bundle | ~4KB | ~5KB | ~15KB |
| API | `toast.success('msg')` | `toast.success('msg')` | `toast.success('msg')` |
| Animações | CSS transitions nativas | Spring animations | CSS transitions |
| Stack visual | Toasts empilhados (hover expand) | Toasts empilhados | Toasts em fila |
| Manutenção | Ativo (Emil Kowalski) | Baixa atividade desde 2022 | Ativo |
| shadcn/ui default | ✅ Sim | Não | Não |

### Recomendação: **Sonner**

Sonner é a escolha padrão do ecossistema shadcn/ui, tem estilização via Tailwind first-class e API simples. Sua versão 2.0.7 é estável. [VERIFIED: sonner.emilkowal.ski]

### Uso

```typescript
// src/main.tsx — já mostrado acima
import { Toaster } from 'sonner'
<Toaster position="top-right" richColors />

// Em qualquer componente
import { toast } from 'sonner'
toast.success('Dados salvos com sucesso!')
toast.error('Erro ao salvar. Tente novamente.')
toast.loading('Enviando...')
toast.promise(saveData(), {
  loading: 'Salvando...',
  success: 'Salvo!',
  error: 'Erro ao salvar',
})
```

---

## Seção 9 — ESLint + Prettier + Husky

### ESLint 10 — Flat Config (`eslint.config.js`)

ESLint 9+ usa flat config por padrão. O arquivo é `eslint.config.js` (não `.eslintrc.json`). [VERIFIED: eslint.org/docs/latest/use/configure/configuration-files]

```javascript
// eslint.config.js
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    extends: [
      ...tseslint.configs.recommended,
    ],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  },
  prettier, // Desabilita regras ESLint que conflitam com Prettier — sempre por último
)
```

> **Compatibilidade:** `@typescript-eslint@8.59.4` suporta ESLint `^8.57.0 || ^9.0.0 || ^10.0.0` e TypeScript `>=4.8.4 <6.1.0`. TypeScript 6.0.3 ✅ está dentro do range. [VERIFIED: npm peerDependencies]

### Prettier (`.prettierrc`)

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

> `prettier-plugin-tailwindcss@0.8.0` ordena classes Tailwind automaticamente em JSX. Funciona com Prettier 3 e Tailwind v4. [VERIFIED: github.com/tailwindlabs/prettier-plugin-tailwindcss]

### Husky v9 + lint-staged

```bash
# Setup inicial (rodar uma vez)
npx husky init
```

Isso cria `.husky/pre-commit`. Substituir o conteúdo:

```bash
# .husky/pre-commit
npx lint-staged
```

Configuração do lint-staged no `package.json`:

```json
{
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{json,md,css}": [
      "prettier --write"
    ]
  }
}
```

> **Husky v9:** O setup mudou — não usa mais `husky add`. O `npx husky init` cria o arquivo `.husky/pre-commit` diretamente. [VERIFIED: typicode.github.io/husky]

### Script de type-check no `package.json`

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "lint:fix": "eslint . --fix",
    "format": "prettier --write .",
    "type-check": "tsc --noEmit",
    "preview": "vite preview"
  }
}
```

---

## Seção 10 — Pontos de Integração para Fases Futuras

### Decisões da Phase 1 que Impactam Fases Posteriores

| Decisão Phase 1 | Impacto em | Como |
|---|---|---|
| `--color-primary`, `--color-accent` definidos em `@theme {}` | **Todas as fases** | Todos os componentes usam `bg-primary`, `text-accent` — não hardcodar hex |
| Tokens `--color-g1`–`--color-g5` definidos | **Phase 5 (Form), Phase 6 (Dashboard)** | Badges nos formulários e no dashboard de acompanhamento |
| `src/lib/supabase.ts` — instância singleton exportada | **Phase 3 (Auth), Phase 4+ (DB)** | Todos os módulos importam do mesmo lugar; não criar múltiplos clientes |
| `useFormStore` no Zustand com `persist` | **Phase 5 (Form shell)** | O store é esqueleto — Phase 5 adiciona campos de dados; a key de persist `'form-progress'` deve ser namespaceada por `tenantId` no Phase 3 |
| `QueryClientProvider` no root | **Phase 3+ (queries)** | Queries Supabase usarão `useQuery` do TanStack Query; o provider já está no lugar |
| Alias `@/` configurado em `tsconfig.json` E `vite.config.ts` | **Todas as fases** | Todos os imports usam `@/components/...`; não usar caminhos relativos longos |
| Sonner `<Toaster>` no root | **Phase 3+ (feedback)** | Chamadas `toast.success()` / `toast.error()` funcionam em qualquer componente sem prop drilling |
| Estrutura `src/features/` criada mas vazia | **Phase 3 (auth), Phase 5 (form), Phase 6 (dashboard)** | Cada feature vai em `features/<nome>/`; não criar em `components/` |

### Nota Crítica sobre Multi-tenant (Phase 3)

O Zustand store de Phase 1 usa chave de persist `'form-progress'` — no Phase 3 (Auth), essa chave **deve ser atualizada** para incluir o `tenantId` (`form-progress-${tenantId}`) para evitar vazamento de dados entre construtoras no mesmo browser.

---

## Armadilhas & Itens de Risco

### Armadilha 1: `tailwind.config.js` Silenciosamente Ignorado

**O que dá errado:** Se um `tailwind.config.js` for criado (por hábito de v3), o Tailwind v4 o ignora sem erro — tokens de cor não aparecem.  
**Por que acontece:** v4 migrou toda configuração para CSS.  
**Como evitar:** Não criar `tailwind.config.js`. Toda configuração em `@theme {}` no CSS.  
**Sinal de alerta:** Classes `bg-primary` não aplicam cor.

### Armadilha 2: Instalar `@tailwindcss/postcss` junto com `@tailwindcss/vite`

**O que dá errado:** Processamento duplo do CSS; classes duplicadas ou conflitantes no build.  
**Como evitar:** Usar apenas `@tailwindcss/vite`. Se houver um `postcss.config.js` existente que referencia Tailwind, deletar.

### Armadilha 3: `bg-opacity-*` Removido no Tailwind v4

**O que dá errado:** `bg-primary bg-opacity-50` não funciona em v4.  
**Solução:** Usar sintaxe de barra: `bg-primary/50`.  
**Outros removidos:** `text-opacity-*`, `border-opacity-*` — todos usam `/` agora.

### Armadilha 4: `@custom-variant dark` Antes do `@import`

**O que dá errado:** Variant de dark mode não funciona.  
**Como evitar:** Sempre colocar `@custom-variant dark (...)` **depois** de `@import "tailwindcss"`.

### Armadilha 5: TypeScript 6.1 Quebrará @typescript-eslint@8

**O que dá errado:** Se o dev rodar `npm update` e TypeScript subir para 6.1+, o `@typescript-eslint@8` não suporta (range: `<6.1.0`).  
**Como evitar:** Pinnar TypeScript no `package.json`: `"typescript": "~6.0.0"` (minor patch updates OK, não minor version).

### Armadilha 6: `.env.local` Commitado Acidentalmente

**O que dá errado:** Chave anon do Supabase vaza no repositório.  
**Como evitar:** Garantir que `.env.local` está no `.gitignore` (o template Vite já inclui `*.local`). Adicionar `.env.local` explicitamente se não estiver.

### Armadilha 7: Supabase `createClient` vs `createBrowserClient`

**O que dá errado:** `createBrowserClient` é do pacote `@supabase/ssr` (para Next.js/Remix). Importar do `@supabase/supabase-js` e usar `createClient`.  
**Causa:** Confusão com documentação SSR do Supabase.  
**Solução:** Ver Seção 4 — usar `createClient` de `@supabase/supabase-js`.

### Armadilha 8: Alias `@/` Configurado em Apenas um Lugar

**O que dá errado:** TypeScript resolve `@/components/Button` mas o Vite não (ou vice-versa) — erros de import em dev ou build.  
**Como evitar:** Configurar o alias **tanto** no `tsconfig.json` (`paths`) **quanto** no `vite.config.ts` (`resolve.alias`).

### Armadilha 9: `Set` em Zustand `persist`

**O que dá errado:** `new Set()` não é serializado corretamente pelo `persist` middleware — ao recarregar a página, `completedSteps` vira um array vazio.  
**Como evitar:** Serializar como array no storage:

```typescript
persist(
  ...,
  {
    name: 'form-progress',
    storage: createJSONStorage(() => localStorage),
    partialize: (state) => ({
      ...state,
      completedSteps: [...state.completedSteps], // Set → Array para JSON
    }),
    onRehydrateStorage: () => (state) => {
      if (state) {
        state.completedSteps = new Set(state.completedSteps as unknown as number[])
      }
    },
  }
)
```

---

## Não Reimplementar

| Problema | Não construir | Usar | Motivo |
|---|---|---|---|
| Variantes de componentes | Ternários manuais de className | `class-variance-authority` | CVA é type-safe e elimina lógica condicional frágil |
| Merge de classes Tailwind | Concatenação de strings | `tailwind-merge` | Resolve conflitos de especificidade automaticamente |
| Toasts / feedback | Componente Toast custom | `sonner` | Acessibilidade, animações, stacking já resolvidos |
| Git hooks | Shell scripts manuais | Husky + lint-staged | Husky gerencia instalação dos hooks automaticamente |
| Ordenação de classes | Revisão manual no code review | `prettier-plugin-tailwindcss` | Automatizado no save/commit |

---

## Validação — Arquitetura de Testes

> `nyquist_validation: true` no `config.json` — seção incluída.

### Framework de Testes

Não há testes ainda (projeto greenfield). Recomendação para Phase 1:

| Propriedade | Valor |
|---|---|
| Framework | Vitest (integrado ao Vite; zero config) |
| Config | `vitest.config.ts` (Wave 0) |
| Comando rápido | `npx vitest run --reporter=dot` |
| Suite completa | `npx vitest run` |

### Mapeamento de Requisitos → Testes

| Req ID | Comportamento | Tipo de Teste | Comando |
|---|---|---|---|
| UX-01 | `npm run dev` abre sem erros de console | Smoke (manual) | Verificação visual |
| UX-01 | Página inicial renderiza fundo azul `#123B66` | Visual/snapshot | `vitest --ui` ou visual manual |
| UX-01 | Classes `bg-primary` aplicam cor correta | Unit (CSS token) | Snapshot do CSS gerado |
| UX-06 | Button, Input, Card renderizam distintos | Component test | `@testing-library/react` |
| UX-06 | Toast dispara e desaparece após timeout | Component test | `@testing-library/react` + fake timers |
| UX-01 | `npm run build` completa sem erros TS | Build check | `npm run build` no CI |

### Wave 0 — Gaps (a criar antes de implementar)

- [ ] `vitest.config.ts` — config mínima com `environment: 'jsdom'`
- [ ] `src/test/setup.ts` — `@testing-library/jest-dom` matchers
- [ ] `src/components/ui/__tests__/Button.test.tsx` — cobre UX-06
- [ ] `src/components/ui/__tests__/Badge.test.tsx` — testa G1–G5
- [ ] Instalar: `npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom`

---

## Disponibilidade de Ambiente

| Dependência | Requerida por | Disponível | Versão | Fallback |
|---|---|---|---|---|
| Node.js ≥20.19 | Vite 8 | ✅ | v20.19.3 | — |
| npm | Instalação de pacotes | ✅ | 11.6.4 | — |
| Git | Husky hooks | ✅ (assumido) | — | Desabilitar Husky |
| Supabase project | `supabase.ts` | ⚠️ Requer config | — | Usar mock/placeholder nas vars |

**Dependências faltantes sem fallback:** Nenhuma — o projeto Supabase pode usar placeholder nas env vars durante Phase 1 (só é necessário para Phase 3+).

---

## Segurança

### Categorias ASVS Aplicáveis à Phase 1

| Categoria ASVS | Aplica | Controle |
|---|---|---|
| V2 Autenticação | Não (Phase 3) | — |
| V3 Sessão | Não (Phase 3) | — |
| V5 Validação de Input | Parcial | Componentes Input com `error` prop; validação real no Phase 5 |
| V10 Código Malicioso | Sim | Não commitar `.env.local`; verificar pacotes npm |

**Controles de Phase 1:**
1. `.env.local` no `.gitignore` — chave anon Supabase não vaza
2. `.env.example` sem valores reais commitado para onboarding
3. ESLint + Husky pré-commit para prevenir commits acidentais com credenciais

---

## Restrições do Projeto (de CLAUDE.md)

| Diretriz | Impacto na Phase 1 |
|---|---|
| Stack React + Vite + Tailwind v4 | Non-negotiable — usar exatamente estes |
| Supabase como BaaS | `@supabase/supabase-js` com `createClient` |
| Multi-tenant via RLS | Zustand store deve incluir `tenantId` na chave de persist a partir da Phase 3 |
| Export PDF client-side | Não instalar em Phase 1; preparar estrutura de pastas em `features/` |
| Export Excel SheetJS | Idem — Phase posterior |
| Não fazer edições diretas fora de workflow GSD | Seguir `/gsd-execute-phase` |

---

## Log de Suposições

| # | Afirmação | Seção | Risco se Incorreto |
|---|---|---|---|
| A1 | Zustand v5 é backward-compatible com API v4 | Seção 5 | Pode exigir ajuste de imports; sem breaking change documentado no registry |
| A2 | `@hookform/resolvers@5.4.0` suporta Zod v4 (relevante para Phase 5) | Seção 8 / futuro | Se não suportar, downgrade para Zod 3.x na Phase 5 |
| A3 | Prettier-plugin-tailwindcss@0.8.0 funciona corretamente com Tailwind v4.3 | Seção 9 | Pode não ordenar todas as classes customizadas de `@theme {}` — verificar em uso |

---

## Fontes

### Primárias (Confiança HIGH)
- `npm view [pacote] version` — versões verificadas em 2026-05-22
- `npm view @typescript-eslint/eslint-plugin --json` — peerDependencies verificadas
- Cálculo matemático direto (Python) — conversões HEX→OKLCH
- `.planning/research/react-vite-tailwind-saas-form.md` — pesquisa prévia do projeto

### Secundárias (Confiança MEDIUM)
- [tailwindcss.com/docs](https://tailwindcss.com/docs) — configuração `@theme {}` e plugin Vite
- [sonner.emilkowal.ski](https://sonner.emilkowal.ski) — API de toast
- [typicode.github.io/husky](https://typicode.github.io/husky) — Husky v9 setup
- [cva.style/docs](https://cva.style/docs) — CVA API

---

## Metadados

**Breakdown de confiança:**
- Stack / versões: HIGH — verificado via `npm view` em 2026-05-22
- Configuração Tailwind v4: HIGH — cruzado com pesquisa prévia do projeto + docs oficiais
- Conversões OKLCH: HIGH — calculado matematicamente
- Arquitetura de componentes: HIGH — padrão estabelecido do ecossistema
- Compatibilidade TypeScript 6 + @typescript-eslint: HIGH — verificado via peerDependencies
- Zustand v5 backward compat: MEDIUM/ASSUMED — não verificado em docs oficiais

**Data da pesquisa:** 2026-05-22  
**Válido até:** 2026-06-22 (30 dias — stack estável)
