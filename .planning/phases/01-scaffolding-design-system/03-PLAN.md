---
id: '01-03'
title: 'Configurar cliente Supabase'
phase: 1
wave: 1
status: pending
type: setup
depends_on: ['01-01']
must_haves:
  - req: 'UX-01'
    truth: 'Cliente Supabase inicializado com createClient, pronto para uso em qualquer módulo via import'
truths:
  - 'src/lib/supabase.ts exporta instância singleton do cliente Supabase'
  - 'src/types/database.ts exporta o tipo Database com estrutura inicial (vazia, preparada para Fase 2)'
  - 'Variáveis VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são validadas na inicialização'
  - 'Erro claro é lançado se as variáveis de ambiente estiverem ausentes'
---

## Objetivo

Instalar o SDK `@supabase/supabase-js` e criar o cliente Supabase singleton que será usado em toda a aplicação. Também criar o arquivo de tipos `Database` que será populado com o schema real na Fase 2 (quando as tabelas do Supabase forem definidas).

## Contexto

Este plano é independente do Plano 01 (pode ser executado em paralelo) porque apenas cria arquivos novos em `src/lib/` e `src/types/`. No entanto, para executá-lo, o projeto precisa existir (ter `package.json` e `node_modules/`). Se o Plano 01 ainda não completou, aguarde sua conclusão antes de instalar pacotes.

O cliente Supabase é o ponto central de acesso ao backend. **Decisão crítica:** usar `createClient` do pacote `@supabase/supabase-js` (não `createBrowserClient` do `@supabase/ssr` — esse é para frameworks SSR como Next.js). Como o projeto usa Vite com SPA, o cliente de browser direto é correto.

O tipo `Database` começa vazio e será expandido na Fase 2 com as tabelas reais. Criá-lo agora estabelece o padrão de tipagem que o projeto seguirá.

## Tarefas

### Tarefa 1 — Instalar @supabase/supabase-js

```bash
npm install @supabase/supabase-js@2.106.1
```

Verifique que foi adicionado a `dependencies` no `package.json`:

```bash
grep '"@supabase/supabase-js"' package.json
# Resultado esperado: "@supabase/supabase-js": "2.106.1"
```

### Tarefa 2 — Criar src/lib/supabase.ts

Crie o arquivo `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Variáveis de ambiente Supabase não configuradas. ' +
      'Copie .env.local.example para .env.local e preencha os valores.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
```

**Por que `createClient` e não `createBrowserClient`?**

- `createBrowserClient` vem do pacote `@supabase/ssr` (não instalado) e é para Next.js/Remix
- `createClient` do `@supabase/supabase-js` é o correto para SPAs com Vite

### Tarefa 3 — Criar src/types/database.ts

Crie o arquivo `src/types/database.ts` com o scaffold de tipo que será populado na Fase 2:

```typescript
/**
 * Tipos gerados para o schema do Supabase.
 *
 * Este arquivo será expandido na Fase 2 quando as tabelas forem criadas.
 * Para regenerar após mudanças no schema:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 *
 * Tabelas planejadas (Fase 2):
 *   - companies          → dados das construtoras (tenants)
 *   - assessments        → avaliações de prontidão
 *   - assessment_answers → respostas individuais por pergunta
 *   - users              → perfis de usuários (via Supabase Auth)
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      // Tabelas serão adicionadas na Fase 2
      // Exemplo da estrutura esperada:
      // companies: {
      //   Row: { id: string; name: string; cnpj: string; created_at: string }
      //   Insert: { id?: string; name: string; cnpj: string }
      //   Update: Partial<...>
      // }
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      // Enums serão adicionados conforme necessário
      // grade: 'G1' | 'G2' | 'G3' | 'G4' | 'G5'
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

// Tipos utilitários para uso na aplicação
export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T];
```

### Tarefa 4 — Verificar que .env.local existe e tem as variáveis

Confirme que `.env.local` existe na raiz do projeto (criado no Plano 01). Se não existir, crie-o agora:

```bash
# Verificar se existe
ls -la .env.local

# Se não existir, criar com valores placeholder
cat > .env.local << 'ENVEOF'
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
ENVEOF
```

**Para os testes do projeto funcionarem em dev**, as variáveis precisam ter valores reais. Se o projeto Supabase já foi criado, preencha os valores agora. Se não, o app mostrará o erro de variáveis faltando ao iniciar — isso é comportamento esperado e correto.

Para obter os valores:

1. Acesse https://supabase.com/dashboard
2. Selecione o projeto (ou crie um novo)
3. Vá em **Settings → API**
4. Copie `Project URL` → `VITE_SUPABASE_URL`
5. Copie `anon public` key → `VITE_SUPABASE_ANON_KEY`

## Critérios de Verificação

```bash
# 1. Verificar que o pacote foi instalado
node -e "const { createClient } = require('@supabase/supabase-js'); console.log('OK:', typeof createClient)"
# OU (ESM):
node --input-type=module -e "import { createClient } from '@supabase/supabase-js'; console.log('OK:', typeof createClient)"
# Resultado esperado: OK: function

# 2. Verificar que os arquivos foram criados
ls -la src/lib/supabase.ts src/types/database.ts
# Resultado esperado: ambos os arquivos existem

# 3. Verificar que TypeScript compila os arquivos sem erros
npx tsc --noEmit
# Resultado esperado: sem output (sem erros)

# 4. Verificar que o import funciona (quando .env.local tem valores)
# Execute npm run dev e confirme que não há erro de "Missing Supabase environment variables"
# Se as variáveis estiverem vazias, o erro é esperado e confirma que a validação funciona

# 5. Verificar que createBrowserClient NÃO está sendo usado
grep -r "createBrowserClient" src/
# Resultado esperado: sem resultado (nenhuma ocorrência)
```

## Notas

**Por que o tipo `Database` começa vazio?**
O Supabase CLI pode gerar tipos TypeScript automaticamente a partir do schema real com `supabase gen types`. Na Fase 2, após criar as tabelas, rodaremos esse comando e substituiremos o conteúdo deste arquivo pelos tipos gerados. Começar com a estrutura vazia agora garante que os imports já existam e compilem.

**Multi-tenant e RLS:**
O cliente Supabase padrão criado aqui usa a `anon key`. O RLS do Supabase aplica as políticas de segurança automaticamente baseado no JWT do usuário autenticado. Nenhuma configuração adicional no cliente é necessária para o isolamento multi-tenant — isso é gerenciado nas políticas RLS da Fase 2.

**Singleton pattern:**
O arquivo exporta uma única instância `supabase`. Todos os módulos que precisam acessar o banco importam desta instância. Não criar múltiplas instâncias com `createClient`.

**Variáveis de ambiente com prefixo VITE\_:**
Apenas variáveis com prefixo `VITE_` são expostas para o bundle do Vite. Nunca colocar chaves secretas (como `service_role`) em variáveis `VITE_` — essas ficam no código do browser. A `anon key` é segura para expor pois é controlada pelo RLS.
