---
id: "01-07"
title: "Configurar ESLint + Prettier + Husky"
phase: 1
wave: 1
status: pending
type: config
must_haves:
  - req: "UX-06"
    truth: "Pipeline de qualidade de código configurado: lint e format rodam automaticamente no pre-commit"
truths:
  - "eslint.config.js usa flat config (ESLint 10) com typescript-eslint, react-hooks e react-refresh"
  - ".prettierrc configurado com prettier-plugin-tailwindcss para ordenação automática de classes"
  - "Husky intercepta commits e roda lint-staged em arquivos staged"
  - "Scripts npm: lint, lint:fix, format, type-check disponíveis em package.json"
  - "npm run lint passa sem erros no código gerado pelo Plano 01"
---

## Objetivo

Configurar o toolchain completo de qualidade de código: ESLint 10 (flat config) com TypeScript, React Hooks e React Refresh plugins; Prettier com ordenação automática de classes Tailwind; e Husky + lint-staged para enforcement no pre-commit.

## Contexto

Este plano é independente dos outros (pode rodar em Wave 1) porque instala apenas ferramentas de desenvolvimento e cria arquivos de configuração na raiz do projeto — não modifica `src/`. O único prerequisito é que `package.json` e `node_modules/` existam (Plano 01 concluído).

A configuração usa **ESLint 10 com flat config** (`eslint.config.js`), não o formato legado (`.eslintrc`). O ESLint 10 não suporta mais o formato `.eslintrc` — qualquer tentativa de usar esse formato causará erros.

**Decisão de versões:**
- `typescript@~6.0.0` deve estar pinado (Plano 01) pois `@typescript-eslint@8.x` pressupõe TypeScript 6.0.x
- `eslint@10.4.0` usa flat config por padrão

## Tarefas

### Tarefa 1 — Instalar dependências de desenvolvimento

Execute o comando abaixo para instalar todas as ferramentas de uma vez:

```bash
npm install --save-dev \
  eslint@10.4.0 \
  @typescript-eslint/eslint-plugin@8.59.4 \
  @typescript-eslint/parser@8.59.4 \
  typescript-eslint@8.59.4 \
  eslint-plugin-react-hooks@5.2.0 \
  eslint-plugin-react-refresh@0.4.20 \
  eslint-config-prettier@10.1.5 \
  prettier@3.8.3 \
  prettier-plugin-tailwindcss@0.8.0 \
  husky@9.1.7 \
  lint-staged@17.0.5
```

**Versões exatas** são importantes. Se `eslint-plugin-react-hooks@5.2.0` ou `eslint-plugin-react-refresh@0.4.20` não estiverem disponíveis no registry, use as mais recentes da série `5.x` e `0.4.x` respectivamente — registre a versão real instalada nas notas da execução.

### Tarefa 2 — Criar eslint.config.js (flat config)

Crie o arquivo `eslint.config.js` na raiz do projeto:

```javascript
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettier from 'eslint-config-prettier'

export default tseslint.config(
  { ignores: ['dist', 'node_modules', '.husky'] },
  {
    extends: [...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': [
        'warn',
        { allowConstantExport: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  prettier,
)
```

**Nota:** `eslint-config-prettier` deve ser o último elemento para desativar regras do ESLint que conflitam com o Prettier.

### Tarefa 3 — Criar .prettierrc

Crie o arquivo `.prettierrc` na raiz:

```json
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "printWidth": 100,
  "trailingComma": "es5",
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

**Por que `prettier-plugin-tailwindcss`?** Este plugin ordena automaticamente as classes Tailwind na ordem canônica recomendada pela Tailwind CSS. Isso elimina discussões sobre ordem de classes e mantém consistência no código.

### Tarefa 4 — Criar .prettierignore

Crie o arquivo `.prettierignore` na raiz:

```
dist
node_modules
.husky
*.md
public
```

### Tarefa 5 — Inicializar Husky

```bash
npx husky init
```

Este comando cria o diretório `.husky/` e um arquivo `.husky/pre-commit` de exemplo. Também adiciona o script `"prepare": "husky"` ao `package.json` automaticamente.

Confirme que `.husky/` foi criado:

```bash
ls -la .husky/
```

### Tarefa 6 — Configurar .husky/pre-commit

Substitua o conteúdo de `.husky/pre-commit` pelo seguinte:

```sh
npx lint-staged
```

Certifique-se de que o arquivo tem permissão de execução:

```bash
chmod +x .husky/pre-commit
```

### Tarefa 7 — Configurar lint-staged em package.json

Adicione a seção `lint-staged` ao `package.json`. Abra o arquivo e adicione após a seção `"devDependencies"`:

```json
"lint-staged": {
  "*.{ts,tsx}": [
    "eslint --fix",
    "prettier --write"
  ],
  "*.{json,css,md}": [
    "prettier --write"
  ]
}
```

### Tarefa 8 — Adicionar scripts npm ao package.json

Atualize a seção `"scripts"` do `package.json` para incluir os novos scripts:

```json
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "format": "prettier --write .",
  "type-check": "tsc --noEmit",
  "prepare": "husky"
}
```

**Atenção:** O script `"prepare"` pode já ter sido adicionado pelo `npx husky init`. Se já existir, não duplique.

## Critérios de Verificação

```bash
# 1. ESLint passa sem erros no código atual
npm run lint
# Resultado esperado: sem erros (warnings são aceitáveis na fase inicial)

# 2. Prettier formata sem erros
npm run format
# Resultado esperado: lista de arquivos formatados, sem erros

# 3. TypeScript compila sem erros
npm run type-check
# Resultado esperado: sem output (sem erros)

# 4. Husky pre-commit está configurado
cat .husky/pre-commit
# Resultado esperado: "npx lint-staged"

# 5. lint-staged está no package.json
grep -A 8 '"lint-staged"' package.json
# Resultado esperado: configuração com *.{ts,tsx} e *.{json,css,md}

# 6. Simular um commit para testar o hook
git add -A
git commit --dry-run -m "test: verificar pre-commit hook"
# OU fazer um commit real de teste:
git add -A
git commit -m "chore(phase-1): configurar ESLint + Prettier + Husky"
# Resultado esperado: lint-staged roda, commit é criado (ou dry-run passa)
```

## Notas

**ESLint flat config vs .eslintrc:**
O ESLint 10 usa `eslint.config.js` por padrão. Se por acidente um `.eslintrc.*` for criado, o ESLint pode se comportar de forma inesperada. Se houver conflito, delete qualquer `.eslintrc.*` na raiz.

**`typescript-eslint` vs `@typescript-eslint/eslint-plugin`:**
A partir da versão 6+, o `typescript-eslint` é o pacote unificado que inclui o parser e o plugin. O `tseslint.config()` é o helper que facilita a composição de configurações. Ainda instalamos `@typescript-eslint/eslint-plugin` e `@typescript-eslint/parser` separadamente para compatibilidade total com `8.x`.

**Conflito TypeScript 6.0 e @typescript-eslint@8:**
O `@typescript-eslint@8.x` suporta TypeScript até 6.0. Se o TypeScript for atualizado para 6.1+, o eslint pode emitir avisos de "TypeScript version not supported". Por isso o Plano 01 pina TypeScript em `~6.0.0`.

**prettier-plugin-tailwindcss e Tailwind v4:**
A versão `0.8.0` do `prettier-plugin-tailwindcss` tem suporte para Tailwind v4. Certifique-se de que a versão do `tailwindcss` instalada no Plano 02 é compatível (v4.3.0 é suportada).

**`husky init` no CI:**
O script `"prepare": "husky"` roda automaticamente após `npm install`. Em ambientes CI (como GitHub Actions), o Husky detecta que não está em um repositório git interativo e pula a instalação dos hooks automaticamente — isso é comportamento esperado.
