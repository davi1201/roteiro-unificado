# Phase 12: Polimento UX, Performance & Deploy — Pattern Map

**Mapeado:** 2026-05-25
**Arquivos analisados:** 4 (2 novos + 2 modificados)
**Análogos encontrados:** 4 / 4

---

## File Classification

| Arquivo Novo / Modificado | Role | Data Flow | Análogo Mais Próximo | Qualidade do Match |
|---------------------------|------|-----------|----------------------|--------------------|
| `roteiro-unificado/vite.config.ts` (modificar) | config | transform | `roteiro-unificado/vitest.config.ts` | role-match (ambos são configs de build tool com alias `@`) |
| `roteiro-unificado/vercel.json` (novo) | config | request-response | nenhum — não existe arquivo de deploy config no projeto | no-analog |
| `.github/workflows/ci.yml` (novo) | config | event-driven | nenhum — não existe workflow CI no projeto | no-analog |
| `roteiro-unificado/src/components/ui/button.tsx` (modificar — contraste) | component | request-response | `roteiro-unificado/src/components/ui/badge.tsx` | exact (mesmo padrão de `cva` + variantes com cores) |

**Arquivos de auditoria visual (sem modificação de código, apenas verificação):**
- `roteiro-unificado/src/components/layouts/AdminSidebar.tsx` — referência para responsividade / aria-label pattern
- `roteiro-unificado/src/features/form/FormLayout.tsx` — referência para skeleton/loading, aria, responsividade md:

---

## Pattern Assignments

### `roteiro-unificado/vite.config.ts` (config, transform — modificar)

**Análogo:** `roteiro-unificado/vitest.config.ts`

**Razão:** Ambos usam `defineConfig`, `@vitejs/plugin-react`, alias `@` com `path.resolve + fileURLToPath`. O vite.config.ts atual já segue este padrão — a modificação adiciona `build.rolldownOptions` sem alterar a estrutura existente.

**Padrão de imports existente** (`roteiro-unificado/vite.config.ts`, linhas 1–7):
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
```

**Estrutura atual completa** (`roteiro-unificado/vite.config.ts`, linhas 9–14):
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

**Padrão a adicionar — `build.rolldownOptions`** (Vite 8 / Rolldown API — não usar `rollupOptions.manualChunks`):
```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  build: {
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/]react(-dom)?[\\/]/,
              priority: 30,
            },
            {
              name: 'supabase',
              test: /node_modules[\\/]@supabase[\\/]/,
              priority: 20,
            },
            {
              name: 'router',
              test: /node_modules[\\/]react-router(-dom)?[\\/]/,
              priority: 10,
            },
          ],
        },
      },
    },
  },
})
```

**Anti-pattern crítico:** `build.rollupOptions.output.manualChunks` foi removido/depreciado no Vite 8 (pinado em 8.0.14 no projeto). Usar exclusivamente `build.rolldownOptions.output.codeSplitting.groups`.

**Verificação pós-modificação:** Rodar `npm run build` e confirmar que o output lista múltiplos chunks (`react-vendor`, `supabase`, `router`) em vez de um único bundle de 812KB.

---

### `roteiro-unificado/vercel.json` (config, request-response — novo)

**Análogo:** nenhum no projeto — é o primeiro arquivo de configuração de deploy.

**Padrão a copiar do RESEARCH.md** (Pattern 2, verificado via docs oficiais Vercel):
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Localização:** `roteiro-unificado/vercel.json` — na raiz do subdiretório do app (onde está o `package.json`), não na raiz do repositório git.

**Contexto crítico de deploy:**
- Vercel deve ter "Root Directory" configurado para `roteiro-unificado` (Settings → General → Root Directory)
- Sem o rewrite, rotas como `/admin/dashboard` e `/form/:orgId` retornam 404 no Vercel CDN
- Sem o Root Directory correto, o Vercel não encontra o `package.json` e falha o build

---

### `.github/workflows/ci.yml` (config, event-driven — novo)

**Análogo:** nenhum no projeto — é o primeiro workflow de CI.

**Padrão a copiar do RESEARCH.md** (Pattern 3, baseado na estrutura de subdiretório do projeto):
```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  ci:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: roteiro-unificado/package-lock.json

      - name: Install dependencies
        working-directory: roteiro-unificado
        run: npm ci

      - name: Type check + build
        working-directory: roteiro-unificado
        run: npm run build

      - name: Test
        working-directory: roteiro-unificado
        run: npm test -- --run
```

**Detalhes críticos para este projeto:**
- `working-directory: roteiro-unificado` em todos os steps de npm — o app está em subdiretório, não na raiz do repo (Pitfall 1 do RESEARCH.md)
- `cache-dependency-path: roteiro-unificado/package-lock.json` — aponta para o lock file correto
- `npm test -- --run` passa `--run` ao Vitest sem modo watch; verificar localmente antes de commitar (Open Question 1 do RESEARCH.md)
- `npm run build` executa `tsc -b && vite build` conforme `package.json` linha 8

**Contexto da suite de testes atual** (a partir de `vitest.config.ts`):
- Environment: jsdom
- Include: `src/**/*.test.ts`, `src/**/*.test.tsx`
- Setup: `./src/test-setup.ts`
- 32 arquivos, 167 testes — todos passando localmente

---

### `roteiro-unificado/src/components/ui/button.tsx` (component, request-response — modificar contraste)

**Análogo:** `roteiro-unificado/src/components/ui/badge.tsx`

**Razão:** Badge já implementa o padrão correto de contraste para os graus G1-G5 — usa `text-white` sobre cores escuras (G1, G2, G4, G5) e `text-primary-900` (escuro) sobre G3 (amarelo/médio). Segue a mesma lógica que button.tsx precisa aplicar ao variant `accent`.

**Padrão correto no badge.tsx** (linhas 3–9) — texto escuro sobre fundo claro/médio:
```typescript
const gradeConfig = {
  G1: { label: 'G1 — Crítico', bg: 'bg-g1', text: 'text-white' },
  G2: { label: 'G2 — Baixo', bg: 'bg-g2', text: 'text-white' },
  G3: { label: 'G3 — Médio', bg: 'bg-g3', text: 'text-primary-900' },  // ← texto escuro sobre fundo amarelo
  G4: { label: 'G4 — Bom', bg: 'bg-g4', text: 'text-white' },
  G5: { label: 'G5 — Excelente', bg: 'bg-g5', text: 'text-white' },
}
```

**Problema identificado em button.tsx** (linha 10):
```typescript
// ATUAL — falha WCAG AA (ratio 2.45:1):
primary: 'bg-primary text-white hover:bg-primary-800',   // OK: azul #123B66 ratio 11.39:1
// Se existir variante accent: 'bg-accent text-white'   // FALHA: laranja #F28C28 ratio 2.45:1
```

**Correção a aplicar** — se houver `bg-accent` com `text-white` em qualquer variante:
```typescript
// CORRETO — WCAG AA passa (ratio 7.23:1):
// Substituir text-white por text-gray-900 sobre qualquer background laranja (bg-accent, #F28C28)
accent: 'bg-accent text-gray-900 hover:bg-accent/90'
```

**Escopo da auditoria de contraste:**
- `src/components/ui/button.tsx` — variantes primary/accent/danger
- `src/components/ui/badge.tsx` — G3 já correto; verificar G1 (`bg-g1`) se é vermelho escuro suficiente
- Qualquer JSX inline com `bg-accent text-white` nas pages e features

**Padrão aria-label existente** (`AdminSidebar.tsx`, linhas 35–36):
```tsx
<button
  type="button"
  aria-label={collapsed ? 'Expandir sidebar' : 'Recolher sidebar'}
  onClick={toggleCollapsed}
>
  {/* ícone SVG com aria-hidden="true" */}
  <svg aria-hidden="true" ...>
```
Aplicar este mesmo padrão em qualquer botão icônico sem texto visível encontrado durante auditoria.

---

## Shared Patterns

### Padrão de Responsividade (auditoria visual)

**Fonte:** `roteiro-unificado/src/features/form/FormLayout.tsx`

**Aplicar em:** verificação visual de AdminSidebar, FormLayout, FormCard durante auditoria manual

Breakpoints em uso no projeto (Tailwind v4):
```tsx
// FormLayout.tsx — padrão md: para offset de sidebar
<aside className="... hidden w-[240px] md:flex">          // sidebar aparece em md (768px+)
<div className="... md:ml-[240px]">                       // conteúdo offset em md
<main className="... px-6 pt-11 pb-6 md:px-8 md:pb-8">  // padding aumenta em md
<div className="... md:hidden">                           // mobile tab bar some em md
```

**Targets da auditoria:**
- 768px (md): sidebar desktop aparece, mobile bar some — verificar transição
- 1024px: conteúdo principal não deve ter overflow horizontal
- 1280px: grid de cards admin deve ter no mínimo 2 colunas

### Padrão de Skeleton/Loading (auditoria visual)

**Fonte:** `roteiro-unificado/src/features/form/FormLayout.tsx` (linhas 211–215) + `roteiro-unificado/src/components/ui/skeleton.tsx`

**Aplicar em:** verificar que todas as queries com `isLoading` usam `<Skeleton>` e `aria-busy="true"`

```tsx
// FormLayout.tsx — padrão correto de loading com acessibilidade:
{draftQuery.isLoading ? (
  <div className="mt-4 space-y-4" aria-busy="true">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="h-24 w-full" />
  </div>
) : ...}
```

```tsx
// skeleton.tsx — implementação base:
export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('animate-pulse rounded-md bg-gray-200', className)} {...props} />
}
```

### Padrão de Focus Ring / Acessibilidade de Formulário

**Fonte:** `roteiro-unificado/src/components/ui/button.tsx` (linha 6)

**Aplicar em:** todos inputs, selects, checkboxes durante auditoria

```typescript
// button.tsx — focus ring aplicado via CVA base class:
'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50'

// Verificar que inputs/selects têm classe equivalente; padrão esperado:
'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1'
```

### Padrão de Ícones Acessíveis

**Fonte:** `roteiro-unificado/src/components/layouts/AdminSidebar.tsx` (linhas 35–66)

**Aplicar em:** qualquer botão com ícone sem texto visível encontrado na auditoria

```tsx
// Padrão correto — botão com aria-label + ícone aria-hidden:
<button
  type="button"
  aria-label="Descrição da ação"
  onClick={handler}
>
  <svg aria-hidden="true" focusable="false" ...>
    <path ... />
  </svg>
</button>

// Padrão errado (sem aria-label):
<button onClick={handler}>
  <XIcon />  {/* ← sem label = falha de acessibilidade */}
</button>
```

### Variáveis de Ambiente — Separação Dev/Prod

**Fonte:** `.env.local` (existente no projeto — referência de estrutura)

**Aplicar em:** configuração do Vercel Dashboard (não commitada no repo)

```bash
# Estrutura de variáveis do projeto (VITE_ prefix = exposto no bundle):
VITE_SUPABASE_URL=https://<projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...

# Regra: .env.local existe no repo (gitignored com chaves reais de dev)
#         .env.production NÃO existe no repo — vars configuradas no Vercel Dashboard
# Verificação pós-build: grep -r "dev-project.supabase.co" dist/ — deve retornar vazio
```

---

## No Analog Found

| Arquivo | Role | Data Flow | Motivo |
|---------|------|-----------|--------|
| `roteiro-unificado/vercel.json` | config | request-response | Primeiro arquivo de configuração de deploy no projeto — usar padrão documentado no RESEARCH.md Pattern 2 |
| `.github/workflows/ci.yml` | config | event-driven | Primeiro workflow de CI no projeto — usar padrão documentado no RESEARCH.md Pattern 3 |

---

## Metadata

**Escopo de busca de análogos:**
- `roteiro-unificado/src/components/` — componentes UI e layouts
- `roteiro-unificado/src/features/` — features de formulário e admin
- `roteiro-unificado/` — arquivos de configuração (vite.config.ts, vitest.config.ts, package.json)
- `.github/` — inexistente, confirmado via busca

**Arquivos lidos:** 9 (vite.config.ts, vitest.config.ts, package.json, button.tsx, badge.tsx, AdminSidebar.tsx, FormLayout.tsx, skeleton.tsx, CONTEXT.md + RESEARCH.md)

**Data do mapeamento:** 2026-05-25

**Nota sobre escopo desta fase:** Phase 12 é primariamente auditoria e infraestrutura — a maioria dos "arquivos" são verificações visuais/manuais (responsividade, acessibilidade, smoke tests) que não geram novos arquivos de código. Os únicos arquivos efetivamente criados/modificados são os 4 listados na tabela de classificação.
