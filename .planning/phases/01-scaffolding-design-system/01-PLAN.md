---
id: "01-01"
title: "Inicializar projeto Vite + React + TypeScript"
phase: 1
wave: 1
status: done
type: setup
must_haves:
  - req: "UX-01"
    truth: "Projeto React 19 + Vite 8 + TypeScript 6 inicializado, roda em dev sem erros"
truths:
  - "Alias @/ resolve para ./src/ tanto no TypeScript quanto no Vite"
  - "Estrutura de pastas src/ criada com todos os subdiretórios necessários"
  - "App.tsx renderiza um stub com fundo primary (#123B66) e botão accent (#F28C28)"
  - "Arquivo .env.local.example documenta todas as variáveis de ambiente necessárias"
  - ".env.local está no .gitignore"
---

## Objetivo

Inicializar o projeto Vite + React 19 + TypeScript 6 com versões exatas pinadas, configurar o alias de caminhos `@/`, criar a estrutura completa de pastas de `src/`, e produzir um `App.tsx` stub que será a base para todos os planos seguintes da fase.

## Contexto

Este é o plano fundacional da Fase 1. Todos os outros planos dependem deste scaffold existir. O projeto substitui um HTML estático (`roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html`) por uma aplicação React multi-tenant com Supabase. Nenhum plano de Wave 2 ou Wave 3 pode iniciar antes deste plano estar completo.

**Decisões críticas neste plano:**
- TypeScript será pinado em `~6.0.0` (tilde, não caret) para evitar auto-upgrade para 6.1+ que quebra `@typescript-eslint@8`
- O `vite.config.ts` já recebe o alias `@/` mas ainda não o plugin Tailwind (adicionado no Plano 02)
- O `App.tsx` stub usa classes inline temporárias (sem Tailwind) para não bloquear verificação visual básica

## Tarefas

### Tarefa 1 — Criar o projeto com Vite usando o template react-ts

Execute no diretório **pai** do projeto (um nível acima de onde o projeto deve ficar), criando o projeto dentro de um novo subdiretório chamado `roteiro-unificado`:

```bash
# Confirme que está no diretório correto antes de executar
# O template react-ts já inclui react@18 por padrão — vamos sobrescrever as versões a seguir

npm create vite@8.0.14 roteiro-unificado -- --template react-ts
cd roteiro-unificado
```

**ATENÇÃO:** Se o projeto já existe no diretório de trabalho atual (verificável pela presença de `package.json`), pule a criação e vá direto para a Tarefa 2.

### Tarefa 2 — Atualizar package.json com versões exatas

Substitua o conteúdo de `package.json` pelo seguinte (mantendo o `name` original se diferente de `roteiro-unificado`):

```json
{
  "name": "roteiro-unificado",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "19.2.6",
    "react-dom": "19.2.6"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "6.0.2",
    "typescript": "~6.0.0",
    "vite": "8.0.14"
  }
}
```

Depois instale as dependências:

```bash
npm install
```

### Tarefa 3 — Configurar tsconfig.json

Sobrescreva o arquivo `tsconfig.json` na raiz do projeto:

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
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

Verifique se `tsconfig.node.json` existe. Se não existir, crie-o:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "skipLibCheck": true
  },
  "include": ["vite.config.ts"]
}
```

### Tarefa 4 — Configurar vite.config.ts com alias @/

Sobrescreva `vite.config.ts` na raiz:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

**Nota:** O plugin `tailwindcss()` será adicionado no Plano 02. Não adicione aqui ainda para manter separação de responsabilidades entre os planos.

Instale o tipo para `path` (necessário para TypeScript reconhecer `__dirname`):

```bash
npm install --save-dev @types/node
```

### Tarefa 5 — Criar a estrutura de pastas de src/

Execute os comandos abaixo para criar todos os diretórios necessários para a aplicação:

```bash
mkdir -p src/components/ui
mkdir -p src/components/forms
mkdir -p src/features
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/stores
mkdir -p src/types
mkdir -p src/pages
```

Crie arquivos `.gitkeep` nos diretórios que ficarão vazios nesta fase para que o git os rastreie:

```bash
touch src/features/.gitkeep
touch src/hooks/.gitkeep
touch src/pages/.gitkeep
```

### Tarefa 6 — Criar App.tsx stub

Substitua o conteúdo de `src/App.tsx` pelo stub abaixo. Este stub usa estilos inline temporários (Tailwind ainda não está configurado) para permitir verificação visual básica:

```typescript
function App() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#123B66',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ color: '#ffffff', fontSize: '2rem', marginBottom: '1rem' }}>
        Roteiro Unificado
      </h1>
      <p style={{ color: '#cbd5e1', marginBottom: '2rem' }}>
        Plataforma de Avaliação de Prontidão — Piloto Sinduscon
      </p>
      <button
        style={{
          background: '#F28C28',
          color: '#ffffff',
          border: 'none',
          borderRadius: '0.375rem',
          padding: '0.625rem 1.5rem',
          fontSize: '1rem',
          cursor: 'pointer',
          fontWeight: 600,
        }}
        onClick={() => alert('App iniciado! Fase 1 — Scaffolding em progresso.')}
      >
        Começar Avaliação
      </button>
    </div>
  )
}

export default App
```

### Tarefa 7 — Criar main.tsx limpo

Substitua `src/main.tsx`:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>
)
```

### Tarefa 8 — Criar arquivo index.css temporário

Substitua `src/index.css` com um reset mínimo (o Plano 02 sobrescreverá este arquivo completamente com os tokens Tailwind v4):

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

### Tarefa 9 — Criar .env.local.example

Crie o arquivo `.env.local.example` na raiz do projeto:

```bash
# Supabase — obtido em: https://supabase.com/dashboard/project/<id>/settings/api
VITE_SUPABASE_URL=https://xxxxxxxxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Crie também `.env.local` na raiz (com os valores reais do projeto, se disponíveis, ou mantendo os placeholders):

```bash
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

### Tarefa 10 — Garantir que .env.local está no .gitignore

Verifique se o `.gitignore` contém a linha `.env.local`. Se não contiver, adicione-a. O `.gitignore` mínimo esperado:

```
# Logs
logs
*.log
npm-debug.log*

# Dependencies
node_modules

# Build output
dist
dist-ssr

# Editor
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables (NUNCA commitar)
.env.local
.env.*.local
.env
```

**Confirme que `.env.local.example` NÃO está no .gitignore** — este arquivo deve ser versionado como referência.

## Critérios de Verificação

Execute os seguintes comandos para validar que este plano foi concluído com sucesso:

```bash
# 1. Verificar que o projeto inicia sem erros
npm run dev
# Resultado esperado: "Local: http://localhost:5173/" no terminal, sem erros
# Abra o browser em http://localhost:5173/ e confirme fundo azul (#123B66) e botão laranja (#F28C28)

# 2. Verificar que TypeScript está na versão correta (deve ser 6.0.x, NÃO 6.1+)
npx tsc --version
# Resultado esperado: Version 6.0.x

# 3. Verificar que alias @/ funciona (substituindo um import relativo)
# Crie um arquivo de teste temporário src/test-alias.ts:
echo 'import App from "@/App"; console.log(App);' > src/test-alias.ts
npx tsc --noEmit
rm src/test-alias.ts
# Resultado esperado: sem erros de TypeScript

# 4. Verificar estrutura de pastas
ls src/components/ui src/components/forms src/features src/hooks src/lib src/stores src/types src/pages
# Resultado esperado: todos os diretórios existem

# 5. Verificar que .env.local está no .gitignore
git check-ignore -v .env.local
# Resultado esperado: .gitignore:.env.local
```

## Notas

**TypeScript `~6.0.0` vs `^6.0.0`:**
Use tilde (`~`) e não caret (`^`). O caret permitiria auto-upgrade para 6.1+ em próximos `npm install`, o que quebra `@typescript-eslint@8.x`. O Plano 07 pina a versão do ESLint que pressupõe TypeScript 6.0.x.

**`__dirname` em ESM:**
O Vite config usa `import.meta.url` ou `path.resolve(__dirname, ...)`. Com `moduleResolution: "bundler"` e `@types/node` instalado, `__dirname` fica disponível no `vite.config.ts` normalmente. Se o TypeScript reclamar de `__dirname`, use:
```typescript
import { fileURLToPath } from 'url'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
```

**Vite template vs. versões exatas:**
O `npm create vite@8.0.14` cria o scaffold com versões padrão. A Tarefa 2 sobrescreve o `package.json` com as versões exatas definidas nas pesquisas. Sempre execute `npm install` após sobrescrever o `package.json`.

**Sobre o App.tsx stub:**
Os estilos inline são temporários e deliberados. O Plano 02 (Tailwind v4) será executado imediatamente após este plano. Após o Plano 05 (componentes UI), o `App.tsx` será atualizado para usar as classes Tailwind e os componentes da biblioteca.
