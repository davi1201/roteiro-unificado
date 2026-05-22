---
id: "01-02"
title: "Configurar Tailwind v4 com design tokens"
phase: 1
wave: 2
status: pending
type: config
depends_on: ["01-01"]
must_haves:
  - req: "UX-01"
    truth: "Classes Tailwind como bg-primary, bg-accent, text-white funcionam no browser após npm run dev"
  - req: "UX-06"
    truth: "Design tokens primary (azul #123B66) e accent (laranja #F28C28) definidos via @theme {} em CSS"
truths:
  - "@tailwindcss/vite plugin registrado no vite.config.ts"
  - "src/index.css contém @import 'tailwindcss' e bloco @theme {} com todos os tokens de cor, fonte e radius"
  - "Cores G1-G5 para badges de avaliação definidas nos tokens"
  - "src/lib/utils.ts exporta função cn() combinando clsx e tailwind-merge"
  - "Modo dark configurado via variante .dark (não via prefers-color-scheme)"
---

## Objetivo

Instalar Tailwind CSS v4 via plugin Vite (sem `tailwind.config.js`), definir todos os design tokens do sistema (paleta primária azul, accent laranja, grades G1-G5, tipografia e raios) via `@theme {}` no CSS, e criar o helper `cn()` para composição de classes.

## Contexto

Este plano depende do Plano 01 (projeto Vite + React deve existir). Deve ser executado antes dos Planos 04, 05 e 06, pois eles consomem os tokens definidos aqui.

**Tailwind v4 muda tudo em relação ao v3:**
- Não existe mais `tailwind.config.js` — toda configuração fica no CSS via `@theme {}`
- O plugin Vite (`@tailwindcss/vite`) substitui o PostCSS pipeline
- As cores são definidas em OKLCH para melhor interpolação e percepção de cor uniforme
- `@custom-variant dark` configura o modo escuro baseado em classe (não em `prefers-color-scheme`)

O sistema de cores foi definido baseado no HTML estático original do projeto:
- **Primary**: Azul corporativo `#123B66` → `oklch(0.348 0.088 252.7)`
- **Accent**: Laranja de ação `#F28C28` → `oklch(0.735 0.161 58.8)`
- **G1-G5**: Escala de avaliação de prontidão (Crítico → Excelente)

## Tarefas

### Tarefa 1 — Instalar tailwindcss e @tailwindcss/vite

```bash
npm install tailwindcss@4.3.0 @tailwindcss/vite@4.3.0
```

Confirme as versões instaladas:

```bash
npm list tailwindcss @tailwindcss/vite
# Resultado esperado:
# ├── @tailwindcss/vite@4.3.0
# └── tailwindcss@4.3.0
```

### Tarefa 2 — Instalar clsx e tailwind-merge

Estes pacotes são usados pelo helper `cn()` e também são dependência dos componentes UI do Plano 05:

```bash
npm install clsx@2.1.1 tailwind-merge@3.6.0
```

### Tarefa 3 — Atualizar vite.config.ts para incluir o plugin Tailwind

Abra `vite.config.ts` e adicione o import e plugin do Tailwind. O arquivo final deve ser:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

**Não use PostCSS para Tailwind v4** — o plugin Vite é o método correto e mais rápido. Não crie `postcss.config.js`.

### Tarefa 4 — Substituir src/index.css com tokens completos do design system

Substitua **todo** o conteúdo de `src/index.css` pelo seguinte. Este arquivo é o coração do design system:

```css
@import "tailwindcss";

@theme {
  /* ── Paleta Principal: Azul Corporativo ── */
  --color-primary:     oklch(0.348 0.088 252.7);  /* #123B66 — cor base */
  --color-primary-50:  oklch(0.970 0.015 252.7);
  --color-primary-100: oklch(0.930 0.030 252.7);
  --color-primary-200: oklch(0.850 0.055 252.7);
  --color-primary-300: oklch(0.730 0.075 252.7);
  --color-primary-400: oklch(0.600 0.085 252.7);
  --color-primary-500: oklch(0.490 0.090 252.7);
  --color-primary-600: oklch(0.400 0.088 252.7);
  --color-primary-700: oklch(0.348 0.088 252.7);  /* = --color-primary */
  --color-primary-800: oklch(0.280 0.075 252.7);
  --color-primary-900: oklch(0.210 0.055 252.7);

  /* ── Paleta Accent: Laranja de Ação ── */
  --color-accent:      oklch(0.735 0.161 58.8);   /* #F28C28 — cor base */
  --color-accent-50:   oklch(0.980 0.025 58.8);
  --color-accent-100:  oklch(0.950 0.055 58.8);
  --color-accent-200:  oklch(0.890 0.100 58.8);
  --color-accent-300:  oklch(0.840 0.135 58.8);
  --color-accent-400:  oklch(0.790 0.155 58.8);
  --color-accent-500:  oklch(0.735 0.161 58.8);   /* = --color-accent */
  --color-accent-600:  oklch(0.660 0.155 58.8);
  --color-accent-700:  oklch(0.570 0.140 58.8);
  --color-accent-800:  oklch(0.460 0.115 58.8);
  --color-accent-900:  oklch(0.360 0.085 58.8);

  /* ── Escala de Avaliação G1-G5 ── */
  /* Usadas pelos componentes Badge e na visualização de prontidão */
  --color-g1: oklch(0.500 0.230 22.0);   /* Crítico   — vermelho */
  --color-g2: oklch(0.735 0.161 58.8);   /* Baixo     — laranja (= accent) */
  --color-g3: oklch(0.795 0.185 86.0);   /* Médio     — amarelo */
  --color-g4: oklch(0.546 0.215 264.1);  /* Bom       — azul */
  --color-g5: oklch(0.590 0.160 150.0);  /* Excelente — verde */

  /* ── Tipografia ── */
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;

  /* ── Raios de Borda ── */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;
}

/* Modo dark via classe .dark (não prefers-color-scheme) */
@custom-variant dark (&:where(.dark, .dark *));

/* Reset base */
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Por que OKLCH?**
OKLCH é um espaço de cores perceptualmente uniforme. Isso significa que ao interpolar entre tons (ex: primary-100 até primary-900), a diferença visual entre passos é consistente. Hex/RGB não garante isso.

### Tarefa 5 — Criar src/lib/utils.ts com helper cn()

Crie o arquivo `src/lib/utils.ts`:

```typescript
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Combina classes CSS condicionalmente e resolve conflitos Tailwind.
 *
 * Uso:
 *   cn('bg-primary', isActive && 'opacity-100', className)
 *   cn('px-4 py-2', size === 'lg' && 'px-6 py-3')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

### Tarefa 6 — Atualizar App.tsx para usar classes Tailwind

Agora que o Tailwind v4 está configurado, atualize `src/App.tsx` para usar as classes reais e validar os tokens:

```typescript
function App() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-primary">
      <h1 className="mb-4 text-3xl font-bold text-white">
        Roteiro Unificado
      </h1>
      <p className="mb-8 text-primary-200">
        Plataforma de Avaliação de Prontidão — Piloto Sinduscon
      </p>
      <button className="rounded-md bg-accent px-6 py-2.5 font-semibold text-white transition-colors hover:bg-accent-600">
        Começar Avaliação
      </button>
    </div>
  )
}

export default App
```

## Critérios de Verificação

```bash
# 1. Servidor de desenvolvimento inicia sem erros
npm run dev
# Acesse http://localhost:5173 e confirme:
# - Fundo azul escuro (#123B66 aproximado)
# - Botão laranja (#F28C28 aproximado)
# - Sem erros no console do browser

# 2. Build de produção funciona
npm run build
# Resultado esperado: "✓ built in Xs" sem erros TypeScript

# 3. Verificar que cn() está tipado corretamente
npx tsc --noEmit
# Resultado esperado: sem erros

# 4. Verificar que tailwindcss está como dependency (não devDependency)
grep '"tailwindcss"' package.json
# Resultado esperado: linha em "dependencies" OU em "devDependencies"
# (Tailwind v4 com o plugin Vite pode ficar em devDependencies — ambos são válidos)

# 5. Confirmar que NÃO existe tailwind.config.js
ls tailwind.config.* 2>/dev/null && echo "ERRO: arquivo de config não deveria existir" || echo "OK: sem arquivo de config legacy"
# Resultado esperado: "OK: sem arquivo de config legacy"

# 6. Confirmar que NÃO existe postcss.config.js (não necessário com plugin Vite)
ls postcss.config.* 2>/dev/null && echo "AVISO: postcss.config não necessário com @tailwindcss/vite" || echo "OK"
```

## Notas

**Sem tailwind.config.js:**
No Tailwind v4, toda configuração fica no CSS. Não crie `tailwind.config.js` ou `tailwind.config.ts`. O Tailwind CLI e o plugin Vite leem a configuração diretamente do CSS.

**`@tailwindcss/vite` vs PostCSS:**
Com o plugin Vite, o Tailwind processa CSS via Vite diretamente. É mais rápido e mais simples que o pipeline PostCSS. Não instale `postcss` nem `autoprefixer` — não são necessários.

**Import da fonte Inter:**
Os tokens definem `--font-sans: 'Inter', ...` mas a fonte não está sendo importada via `<link>` ou `@import`. Isso é intencional nesta fase — o sistema vai carregar a fonte do sistema como fallback. Se quiser adicionar Inter, inclua no `index.html`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
```
Isso pode ser feito como melhoria no Plano 05 ao criar os componentes.

**Valores OKLCH e compatibilidade:**
OKLCH é suportado em todos os browsers modernos (Chrome 111+, Firefox 113+, Safari 15.4+). Para o piloto Sinduscon (construtoras que provavelmente usam Chrome corporativo), a compatibilidade é garantida.

**tailwind-merge e Tailwind v4:**
O `tailwind-merge@3.x` tem suporte nativo para Tailwind v4. Versões antigas do `tailwind-merge` (1.x, 2.x) não reconhecem as classes do v4 e podem causar conflitos inesperados. A versão `3.6.0` especificada é compatível.
