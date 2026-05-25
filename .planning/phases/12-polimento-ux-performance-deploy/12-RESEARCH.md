# Phase 12: Polimento UX, Performance & Deploy — Research

**Pesquisado em:** 2026-05-25
**Domínio:** UX audit, bundle optimization, CI/CD, Vercel deploy, Supabase production
**Confiança Geral:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

- **D-01:** Novo projeto Supabase separado para produção — não usar o projeto de dev em prod. Cria projeto novo no Supabase com as mesmas migrations. Credenciais de dev nunca chegam ao build de prod. Plano Free do Supabase permite 2 projetos ativos.
- **D-02:** Migrations via `supabase db push` — rodar manualmente apontando para o projeto de produção durante a fase de deploy. Não automatizar migrations no CI por enquanto.
- **D-03:** Seed de dados via app em produção — após deploy, admin usa o próprio painel `/admin` do app em prod para criar as 5 orgs e contas de usuário do piloto.
- **D-04:** Repositório GitHub privado — projeto cliente, código não público.
- **D-05:** Auto-deploy: push para `main` → produção no Vercel. PRs geram preview URLs automaticamente.
- **D-06:** GitHub Actions CI obrigatório — workflow `.github/workflows/ci.yml` roda `npm run build` + `npm test` em cada PR. Branch protection rule em `main` bloqueia merge se CI falhar.

### Claude's Discretion

- Targets de performance: FCP < 1.5s, Lighthouse Performance ≥ 85 — implementador executa sem nova decisão.
- Configuração exata de `codeSplitting` groups (vendor vs supabase vs react-router) — implementador segue prescrição com base nesta pesquisa.
- Configuração `vercel.json` com SPA rewrites — implementador segue o padrão verificado abaixo.
- Breakpoints auditados (768px/1024px/1280px) e escopo de acessibilidade — seguir lista do ROADMAP Plans 1 e 2.

### Deferred Ideas (OUT OF SCOPE)

- Domínio customizado (ex: roteiro.suaequipe.ia)
- Mudança do destino pós-login da construtora para `/form/:orgId/dashboard`
- Migrations automáticas no CI/CD
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Descrição | Suporte de Research |
|----|-----------|---------------------|
| UX-01 | Paleta de cores: azul `#123B66` e laranja `#F28C28` como cores primárias | Verificação de contraste WCAG AA: branco sobre azul PASSA (11.39:1); branco sobre laranja FALHA (2.45:1) — exige texto escuro sobre laranja |
| UX-02 | Layout responsivo — desktop e tablet (formulário em campo) | Audit manual em 768px/1024px/1280px usando DevTools; verificar FormLayout e AdminSidebar |
| UX-03 | Indicador visual de aba ativa e progresso geral | Verificação visual no TabNavigation e ProgressBar existentes |
| UX-04 | Feedback visual ao salvar (toast de confirmação) | AutosaveIndicator.tsx já implementado; verificar toast sonner funcionando |
| UX-05 | Estados de loading/skeleton durante carregamento | Skeleton components existentes em src/components/ui/skeleton.tsx; verificar uso em queries |
| UX-06 | Formulário redesenhado — experiência melhorada com Tailwind v4 | Verificação visual completa do FormCard layout, typography, spacing system |
</phase_requirements>

---

## Summary

Esta fase é a fase de entrega final do projeto: nenhuma funcionalidade nova de negócio é adicionada. O trabalho se divide em seis áreas: (1) auditoria visual de responsividade em três breakpoints, (2) auditoria de acessibilidade WCAG AA, (3) otimização do bundle via Vite 8 code splitting, (4) configuração de variáveis de ambiente de produção, (5) deploy no Vercel com CI GitHub Actions e (6) smoke tests em produção.

O projeto atualmente produz um único bundle de **812KB** (229KB gzip) — acima do warning de 500KB do Vite. O próprio output do build recomenda `build.rolldownOptions.output.codeSplitting`. O stack usa **Vite 8** (pinado em 8.0.14), que migrou de Rollup para Rolldown como bundler: a API `manualChunks` foi **removida/depreciada** e substituída por `build.rolldownOptions.output.codeSplitting.groups`.

Um achado crítico de contraste: branco sobre laranja `#F28C28` tem ratio de apenas **2.45:1** — falha em WCAG AA (requer 4.5:1 para texto normal, 3:1 para texto grande). Qualquer texto branco sobre fundo laranja deve ser substituído por texto escuro (`#111827` = ratio 7.23:1 — PASSA).

**Recomendação principal:** Seguir os 6 planos do ROADMAP na ordem — auditoria visual primeiro (identifica problemas), depois performance (bundle split), depois infra (env + deploy), finalizando com smoke tests em produção.

---

## Architectural Responsibility Map

| Capacidade | Camada Primária | Camada Secundária | Racional |
|------------|-----------------|-------------------|---------|
| Responsividade/acessibilidade | Browser/Client (React components) | — | CSS/Tailwind aplicado no render; verificação via DevTools |
| Bundle splitting | Build tool (Vite/Rolldown) | — | Configuração em vite.config.ts; sem runtime |
| Env vars de produção | CI/CD (Vercel dashboard) | Vite (VITE_ prefix) | Vercel injeta vars no build time; não commitadas |
| CI/CD | GitHub Actions | Vercel | GHA valida; Vercel deploya |
| Deploy SPA routing | Vercel CDN | — | vercel.json rewrite rules para SPA deep linking |
| Supabase produção | Supabase cloud | Supabase CLI | `supabase db push --project-ref <id>` aplica migrations |
| Smoke tests | Manual (browser) | — | Testes end-to-end manuais em produção após deploy |

---

## Standard Stack

### Core (já instalado no projeto)

| Biblioteca | Versão | Propósito | Nota |
|------------|--------|-----------|------|
| Vite | 8.0.14 (pinado) | Build tool + bundler Rolldown | `build.rolldownOptions` (não `rollupOptions`) |
| Vitest | ^4.1.7 | Test runner para CI | `npm test -- --run` = 167 testes, 32 arquivos |
| Supabase CLI | 2.101.0 (local) | Migrations para produção | `supabase db push --project-ref <prod-ref>` |

### Sem novas dependências para instalar

Esta fase não requer instalação de pacotes adicionais. Toda a funcionalidade é configuração e verificação de código existente.

**Exceção:** Lighthouse para medição de performance é executado via Chrome DevTools (sem instalação) ou via `npx lighthouse` pontualmente — não como dependência do projeto.

---

## Package Legitimacy Audit

> Nenhum pacote novo é instalado nesta fase. Audit não aplicável.

**Pacotes removidos por slopcheck [SLOP]:** nenhum
**Pacotes sinalizados [SUS]:** nenhum

---

## Architecture Patterns

### System Architecture Diagram

```
Browser
  │
  ▼
Vercel CDN ──── vercel.json rewrites ──── /index.html (SPA catch-all)
  │
  ├── dist/assets/index.js          (app bundle)
  ├── dist/assets/react-vendor.js   (react + react-dom)
  ├── dist/assets/supabase.js       (@supabase/supabase-js)
  ├── dist/assets/router.js         (react-router-dom)
  └── dist/assets/index.css         (Tailwind output)
  │
  ▼
Supabase (produção) ─── PostgreSQL + Auth + RLS
  │
  └── VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY (Vercel env vars)
```

### Fluxo de CI/CD

```
PR aberto
  │
  ▼
GitHub Actions ci.yml
  ├── actions/checkout
  ├── actions/setup-node@v4 (Node 20)
  ├── npm ci (instala dependências)
  ├── npm run build (tsc -b && vite build)
  └── npm test -- --run (vitest --run)
  │
  ▼
Branch protection verifica CI verde
  │
  ▼
Merge para main
  │
  ▼
Vercel auto-deploy (pull direto do GitHub)
  └── Injeta VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY de produção
```

### Estrutura de Arquivos Novos Desta Fase

```
roteiro-unificado/
├── .github/
│   └── workflows/
│       └── ci.yml              # NOVO — CI obrigatório (D-06)
├── vercel.json                 # NOVO — SPA rewrites (Plan 5)
└── vite.config.ts              # MODIFICADO — adicionar codeSplitting (Plan 3)
supabase/                       # existente — migrations já prontas
```

### Pattern 1: Vite 8 — Code Splitting via rolldownOptions

**O que é:** Vite 8 usa Rolldown como bundler (substituiu Rollup). A API `manualChunks` foi removida (objeto) e depreciada (função). O substituto é `build.rolldownOptions.output.codeSplitting.groups`.

**Quando usar:** Bundles > 500KB precisam ser divididos em chunks para reduzir o First Contentful Paint.

**Configuração verificada para este projeto:**

```typescript
// vite.config.ts — Source: Rolldown docs + output do build warn
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

**Por que separar esses chunks:**
- `react` + `react-dom`: raramente muda entre deploys → cache duradouro no browser
- `@supabase/supabase-js`: ~200KB, muda com versões do cliente → chunk separado
- `react-router-dom`: ~50KB, independente do app code

**Nota sobre estabilidade da API:** `codeSplitting.groups` é a API oficial do Rolldown para Vite 8. O campo `priority` determina qual grupo tem precedência quando um módulo pode pertencer a vários grupos. [CITED: rolldown.rs/in-depth/manual-code-splitting]

### Pattern 2: Vercel SPA Rewrites

**O que é:** Para apps SPA (Single Page Application), rotas como `/form/:orgId` não existem como arquivos no servidor. O Vercel precisa de uma regra de rewrite para redirecionar qualquer rota para `index.html`.

**Configuração verificada pelo Vercel oficial:**

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

**Localização do arquivo:** `roteiro-unificado/vercel.json` (raiz do subdiretório do app). O Vercel detecta o `package.json` em `roteiro-unificado/` como o root do projeto.

**Por que é necessário:** Sem este arquivo, navegação direta para `/admin/dashboard` retornaria 404 no Vercel. [CITED: vercel.com/docs/frameworks/vite]

### Pattern 3: GitHub Actions CI Mínimo

**Configuração validada para Node 20 + npm + vitest:**

```yaml
# .github/workflows/ci.yml
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

**Detalhes críticos:**
- `working-directory: roteiro-unificado` — o app está em um subdiretório, não na raiz do repo
- `cache-dependency-path` apontando para o `package-lock.json` correto
- `npm test -- --run` passa `--run` para o Vitest executar sem modo watch
- `npm run build` inclui `tsc -b` (type check) + `vite build` [ASSUMED — baseado no package.json atual; verificar se scripts não mudam antes do CI]

### Pattern 4: Supabase Produção — Fluxo de Migração

**Sequência de deploy do banco de produção:**

```bash
# 1. Criar projeto no Supabase Dashboard (dashboard.supabase.com)
#    - Anotar: project_ref (ex: abcdefghijklm)
#    - Anotar: database password

# 2. Linkar projeto de produção ao CLI local
supabase link --project-ref <prod-project-ref>

# 3. Aplicar todas as migrations ao banco de produção
supabase db push

# 4. Verificar: as 11 migrations existentes devem estar aplicadas
supabase migration list

# 5. Configurar Edge Functions em produção (se houver)
supabase functions deploy create-user
```

**Migrations existentes no projeto (11 arquivos):**
- 20260522000001..20260522000008 — schema base + RLS
- 20260523000001 — UNIQUE parcial para autosave
- 20260523000002 — fix RLS submit
- 20260525000001 — RPC org_members_with_email

[CITED: supabase.com/docs/guides/local-development]

### Anti-Patterns a Evitar

- **Não usar `build.rollupOptions.manualChunks`**: depreciado/removido no Vite 8; usar `build.rolldownOptions.output.codeSplitting` [CITED: vite.dev/guide/migration]
- **Não commitar `.env.production`**: as env vars de produção ficam SOMENTE no Vercel Dashboard (Settings → Environment Variables); o arquivo `.env.production` contém apenas comentários ou é omitido
- **Não usar `push` para `main` para testar**: criar PRs e deixar o CI validar; branch protection impede merge com CI falho
- **Não testar contraste só visualmente**: usar cálculo matemático — branco sobre `#F28C28` tem ratio 2.45:1, que FALHA WCAG AA independente de parecer "legível"

---

## Don't Hand-Roll

| Problema | Não Construir | Usar em Vez | Por Quê |
|----------|--------------|-------------|---------|
| Medição de contraste de cor | Cálculo manual a olho | Fórmula WCAG (luminance) ou WebAIM checker | Olho humano não detecta falhas de contraste próximas de 4.5:1 |
| Chunk splitting | Separação manual de imports | `build.rolldownOptions.output.codeSplitting.groups` | Rolldown gerencia deps transitivas corretamente |
| CI validation | Scripts shell customizados | GitHub Actions com `setup-node@v4` | Action oficial gerencia cache, matrix, e Node version |
| SPA routing no servidor | Middleware customizado | `vercel.json` rewrites | Vercel suporta nativamente; custom middleware viola o modelo serverless |
| Lighthouse measurement | Gravar métricas manualmente | Chrome DevTools Lighthouse tab | Interface integrada, sem instalação extra |

---

## Achado Crítico: Contraste de Cores WCAG AA

Este é o único achado desta pesquisa que requer decisão de implementação além do prescrito no ROADMAP.

**Verificado computacionalmente:**

| Combinação | Ratio | WCAG AA Normal (4.5:1) | WCAG AA Grande (3:1) |
|------------|-------|------------------------|----------------------|
| Branco (#FFF) sobre Azul (#123B66) | **11.39:1** | PASSA | PASSA |
| Branco (#FFF) sobre Laranja (#F28C28) | **2.45:1** | **FALHA** | **FALHA** |
| Escuro (#111827) sobre Laranja (#F28C28) | **7.23:1** | PASSA | PASSA |

**Implicação:** Qualquer texto branco sobre fundo laranja (ex: botões CTA primários com variante `bg-accent text-white`) viola WCAG AA. A correção é usar `text-gray-900` (`#111827`) sobre laranja.

**Onde procurar no código:** `src/components/ui/button.tsx` variante primary/accent, quaisquer badges com `bg-accent`, rótulos de classificação G1-G5 com fundo colorido.

[VERIFIED: cálculo computacional com fórmula WCAG 2.1 luminance]

---

## Common Pitfalls

### Pitfall 1: Subdiretório do App no CI

**O que dá errado:** O workflow de CI tenta rodar `npm ci` na raiz do repositório, mas `package.json` e `package-lock.json` estão em `roteiro-unificado/`. O CI falha com "No package.json found".

**Por que acontece:** O projeto tem estrutura monorepo-like: repo git na raiz, app em subdiretório.

**Como evitar:** Definir `working-directory: roteiro-unificado` em todos os steps de npm do CI, e `cache-dependency-path: roteiro-unificado/package-lock.json` para o cache funcionar.

**Sinal de alerta:** `npm ci` retornando erro de package.json no primeiro run do CI.

---

### Pitfall 2: Vite 8 — `rollupOptions` vs `rolldownOptions`

**O que dá errado:** Usar `build.rollupOptions.output.manualChunks` no vite.config.ts. No Vite 8, isso é alias para `rolldownOptions` mas `manualChunks` está depreciado — o objeto form não funciona, o function form está depreciado e pode ser removido.

**Por que acontece:** Toda documentação anterior ao Vite 8 (e alguns tutoriais atuais desatualizados) usa `rollupOptions.manualChunks`.

**Como evitar:** Usar `build.rolldownOptions.output.codeSplitting.groups` conforme especificado nesta pesquisa.

**Sinal de alerta:** Warning de depreciação no output do build; chunks não sendo separados conforme esperado.

[CITED: vite.dev/guide/migration]

---

### Pitfall 3: `.env.production` commitado acidentalmente

**O que dá errado:** Criar `.env.production` com credenciais reais e commitar no repositório (privado, mas ainda inseguro).

**Por que acontece:** Desenvolvedor cria o arquivo localmente para testar o build de produção e esquece de adicionar ao `.gitignore`.

**Como evitar:**
1. Adicionar `.env.production` ao `.gitignore` antes de criar o arquivo
2. Usar as env vars diretamente no Vercel Dashboard (Settings → Environment Variables)
3. O arquivo `.env.local.example` já existe como referência — `.env.production` segue o mesmo padrão

**Sinal de alerta:** `git status` mostrando `.env.production` como untracked; `git diff` mostrando chaves de API.

---

### Pitfall 4: Vercel — Root Directory vs Monorepo

**O que dá errado:** Vercel detecta o repo raiz como root e tenta buildar de lá, onde não há `package.json`. O build falha.

**Por que acontece:** O projeto tem `package.json` em `roteiro-unificado/`, não na raiz do repositório.

**Como evitar:** Ao conectar o repositório no Vercel, configurar **Root Directory** para `roteiro-unificado` nas configurações do projeto (Settings → General → Root Directory). Vercel então usa essa pasta como base para todos os comandos de build.

**Sinal de alerta:** Vercel Dashboard mostrando erro "No package.json found" no primeiro deploy.

---

### Pitfall 5: Branch Protection Antes do Primeiro CI Verde

**O que dá errado:** Habilitar branch protection em `main` antes de ter rodado o CI pelo menos uma vez. O GitHub não conhece o status check `ci` ainda, então a proteção bloqueia todos os merges.

**Por que acontece:** Branch protection requer que o status check exista (já tenha rodado pelo menos uma vez).

**Como evitar:** Criar o CI workflow, abrir um PR de teste, deixar o CI rodar e ficar verde, depois habilitar branch protection selecionando o check `ci` pelo nome exato.

---

### Pitfall 6: `supabase db push` sem `--linked`

**O que dá errado:** Rodar `supabase db push` sem ter linkado o projeto de produção previamente. Ele pode aplicar migrations no projeto local ou dar erro de autenticação.

**Por que acontece:** O CLI do Supabase precisa saber qual projeto remoto usar.

**Como evitar:** Sempre rodar `supabase link --project-ref <prod-ref>` antes de `supabase db push`. Confirmar com `supabase projects list` que o projeto correto está selecionado.

---

## Code Examples

### Configuração Final do vite.config.ts

```typescript
// Source: Rolldown docs [CITED: rolldown.rs/in-depth/manual-code-splitting]
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

### Checklist de Auditoria de Acessibilidade

```typescript
// Padrão correto para botões icônicos — sem aria-label = erro de acessibilidade
// Ruim:
<button onClick={handleClose}>
  <XIcon />
</button>

// Bom:
<button onClick={handleClose} aria-label="Fechar dialog">
  <XIcon aria-hidden="true" />
</button>

// Focus ring — Tailwind v4 (já deve estar aplicado via theme)
// Verificar: todo input/button/select tem focus:ring visível
// Token existente: box-shadow: 0 0 0 3px rgba(37,99,235,0.1)
```

### Variáveis de Ambiente — Estrutura Correta

```bash
# .env.local (dev — NÃO commitar chaves reais, mas o arquivo pode existir)
VITE_SUPABASE_URL=https://dev-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...dev...

# Vercel Dashboard (prod — configurado na UI, nunca commitado)
# Settings → Environment Variables → Production
VITE_SUPABASE_URL=https://prod-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...prod...

# Verificar que não vaza: depois do build, grep no dist/
grep -r "dev-project.supabase.co" dist/ || echo "OK — sem credenciais de dev no build"
```

---

## State of the Art

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|-----------------|-----------------|--------------|---------|
| `build.rollupOptions.manualChunks` (objeto ou função) | `build.rolldownOptions.output.codeSplitting.groups` | Vite 8.0 (2025) | Configs antigas quebram ou são depreciadas |
| `actions/checkout@v3`, `setup-node@v3` | `actions/checkout@v4`, `setup-node@v4` | GitHub Actions 2024 | v3 ainda funciona mas v4 é padrão atual |

**Depreciado/desatualizado:**
- `build.rollupOptions`: alias temporário para `rolldownOptions`; usar `rolldownOptions` diretamente no Vite 8
- `manualChunks` como objeto: removido no Vite 8 com Rolldown
- `manualChunks` como função: depreciado, pode ser removido em versão futura

---

## Assumptions Log

| # | Afirmação | Seção | Risco se Errado |
|---|-----------|-------|-----------------|
| A1 | CI step `npm test -- --run` passa `--run` ao Vitest corretamente via npm scripts | Pattern 3 / GitHub Actions CI | CI pode rodar em modo watch e nunca terminar — verificar comportamento antes do primeiro push |
| A2 | `codeSplitting.groups` com `priority` numérico funciona conforme documentado no Rolldown em Vite 8.0.14 | Pattern 1 | Chunks podem não ser gerados conforme esperado — verificar output do build após configuração |
| A3 | A Edge Function `create-user` existente em `supabase/functions/` pode ser deployada com `supabase functions deploy create-user` para o projeto de produção | Supabase produção | Se a função usa APIs que mudaram entre ambiente dev e prod, pode falhar |

---

## Open Questions (RESOLVED)

1. **Vitest `--run` flag via npm test** — RESOLVED ✓
   - `npm test` script = `vitest` (sem flags). `npm test -- --run` passa `--run` corretamente ao vitest via npm arg passthrough. Verificado no package.json: `"test": "vitest"`. O CI pode usar `npm test -- --run` sem script adicional.

2. **Vercel Root Directory vs projeto monorepo** — RESOLVED ✓
   - Vercel NÃO detecta automaticamente o subdiretório em monorepos sem framework reconhecido. Root Directory = `roteiro-unificado` deve ser configurado manualmente no Vercel Dashboard ao conectar o repo. Plan 05 inclui este passo como checkpoint obrigatório.

3. **Estado atual das Phases 10 e 11 (PDF + Excel)** — RESOLVED ✓
   - Fases 10 e 11 NÃO estão implementadas (diretórios `.planning/phases/10-*` e `.planning/phases/11-*` inexistentes). Os smoke tests de PDF/Excel no Plan 06 são condicionais — executar apenas após Phases 10 e 11 estiverem completas. O plano já inclui nota de pré-condição para este caso.

---

## Environment Availability

| Dependência | Requerida por | Disponível | Versão | Fallback |
|-------------|--------------|------------|--------|----------|
| Node.js | Build + testes | ✓ | v20.19.3 | — |
| npm | Gerenciador de pacotes | ✓ | 11.6.4 | — |
| Supabase CLI | `supabase db push` (Plan 4/5) | ✓ | 2.101.0 | — |
| GitHub Actions | CI (D-06) | ✓ | — | — (repo GitHub existe) |
| Vercel account | Deploy (Plan 5) | ? | — | Nenhum — requer conta Vercel |
| Lighthouse | Medição FCP/LCP (Plan 3) | ✗ (global) | — | Chrome DevTools Lighthouse tab (zero instalação) |

**Dependências faltando com fallback:**
- Lighthouse CLI: usar Chrome DevTools → Lighthouse tab → Generate report. Sem instalação, mesmo resultado.

**Dependências faltando sem fallback:**
- Conta Vercel: requer criação manual pelo usuário antes do Plan 5.

---

## Validation Architecture

### Test Framework

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest 4.1.7 + jsdom |
| Config file | `roteiro-unificado/vitest.config.ts` |
| Comando rápido | `npm test -- --run` (ou `vitest --run`) |
| Comando completo | `npm test -- --run` (sem modo watch) |
| Status atual | 32 arquivos de teste, 167 testes — todos passando |

### Phase Requirements → Test Map

| Req ID | Comportamento | Tipo de Teste | Comando | Arquivo Existe? |
|--------|---------------|---------------|---------|-----------------|
| UX-01 | Contraste de cor ≥ 4.5:1 | Manual (DevTools / cálculo) | DevTools Accessibility panel | N/A — manual |
| UX-02 | Layout responsivo em 768px/1024px/1280px | Manual (DevTools device mode) | Browser resize | N/A — visual |
| UX-03 | Indicador de aba ativa e progresso | Visual + unit existente | `npm test -- --run src/features/form/FormLayout.test.tsx` | ✅ |
| UX-04 | Toast de confirmação de autosave | Unit existente | `npm test -- --run src/features/form/AutosaveIndicator.test.tsx` | ✅ |
| UX-05 | Estados de loading/skeleton | Visual (DevTools Network throttle) | N/A — visual | N/A — visual |
| UX-06 | FormCard layout melhorado | Visual + unit existente | `npm test -- --run src/features/form/FormCard.test.tsx` | ✅ |

### Sampling Rate

- **Por commit:** `npm test -- --run` (167 testes, ~7s)
- **Por wave merge:** `npm test -- --run` (suite completa)
- **Phase gate:** Suite completa verde + smoke tests manuais em produção

### Wave 0 Gaps

Nenhum — infraestrutura de testes está completa para os testes automatizados existentes. Os requisitos UX desta fase são primariamente verificação visual/manual.

---

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Aplica | Controle Padrão |
|---------------|--------|-----------------|
| V2 Authentication | sim | Supabase Auth (já implementado) — verificar que funciona em produção |
| V3 Session Management | sim | `createBrowserClient` persiste sessão — verificar em produção |
| V4 Access Control | sim | RLS Supabase — migrations aplicadas via `supabase db push` |
| V5 Input Validation | não | Sem novos inputs nesta fase |
| V6 Cryptography | não | Sem novo código criptográfico |

### Ameaças Relevantes para Esta Fase

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Credenciais de dev expostas no build de prod | Information Disclosure | `.env.production` nunca commitado; vars no Vercel Dashboard |
| Chave anon do Supabase exposta no bundle JS | Information Disclosure | A chave anon é pública por design no Supabase; RLS protege os dados |
| Dev credentials no bundle de produção | Information Disclosure | Verificar com `grep` no `dist/` após build de prod |

**Nota sobre a chave anon:** A `VITE_SUPABASE_ANON_KEY` será visível no bundle JavaScript de produção — isso é esperado e seguro pelo design do Supabase. A segurança dos dados é garantida pelo RLS, não pelo segredo da chave anon. [CITED: supabase.com/docs/guides/auth]

---

## Project Constraints (from CLAUDE.md)

- **Stack frontend obrigatória:** React + Vite + Tailwind v4 — nenhum framework alternativo
- **Backend/BaaS:** Supabase — nenhum backend customizado
- **Documentação:** em português brasileiro — todos os artefatos de planejamento
- **Código/commits/nomes de arquivo:** em inglês
- **Multi-tenant:** isolamento via RLS — não adicionar novos endpoints sem RLS

---

## Sources

### Primary (HIGH confidence)

- [vite.dev/guide/migration](https://vite.dev/guide/migration) — confirmação de que `manualChunks` foi depreciado e `rolldownOptions.output.codeSplitting` é o substituto no Vite 8
- [vite.dev/config/build-options](https://vite.dev/config/build-options.html) — `build.rolldownOptions` como alias de `build.rollupOptions` (deprecated)
- [vercel.com/docs/frameworks/vite](https://vercel.com/docs/frameworks/vite) — configuração exata do `vercel.json` para SPA rewrites (confirmado verbatim)
- [rolldown.rs/in-depth/manual-code-splitting](https://rolldown.rs/in-depth/manual-code-splitting) — API `codeSplitting.groups` com campos `test`, `name`, `priority`
- [docs.github.com — Building and testing Node.js](https://docs.github.com/en/actions/use-cases-and-examples/building-and-testing/building-and-testing-nodejs) — estrutura do workflow CI com `setup-node@v4`
- Cálculo computacional WCAG 2.1 (fórmula de luminância relativa) — ratios verificados: azul 11.39:1 PASSA, laranja 2.45:1 FALHA
- Output do `npm run build` local — confirma bundle 812KB single chunk, warning do Vite recomendando `codeSplitting`
- Output do `npm test -- --run` local — confirma 32 arquivos, 167 testes, 100% passando

### Secondary (MEDIUM confidence)

- [WebSearch] — Vite 8 Rolldown migration; múltiplas fontes confirmam deprecação de `manualChunks`
- [WebSearch] — GitHub Actions CI patterns para projetos Vite+Vitest

### Tertiary (LOW confidence)

- Nenhuma afirmação neste documento depende exclusivamente de fontes de baixa confiança.

---

## Metadata

**Breakdown de confiança:**
- Vite 8 codeSplitting API: HIGH — verificado via docs oficiais + output de build local
- Vercel SPA rewrites: HIGH — citado verbatim da documentação oficial Vercel
- Contraste de cores WCAG: HIGH — cálculo computacional com fórmula oficial
- GitHub Actions CI: HIGH — documentação oficial GitHub
- Supabase CLI `db push`: HIGH — CLI instalado e verificado localmente (2.101.0)
- Smoke test checklist: MEDIUM — baseado no UAT do ROADMAP, não testado em prod ainda

**Data de pesquisa:** 2026-05-25
**Válido até:** 2026-06-25 (30 dias — stack estável; Vite 8 recente mas API do Rolldown é documentada)
