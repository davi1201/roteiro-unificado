---
id: "01-04"
title: "Configurar TanStack Query v5 e Zustand"
phase: 1
wave: 2
status: done
type: setup
depends_on: ["01-01"]
must_haves:
  - req: "UX-01"
    truth: "App envolto em QueryClientProvider; TanStack Query v5 disponível para uso em hooks"
truths:
  - "main.tsx envolve App com QueryClientProvider e Toaster (Sonner)"
  - "src/stores/formStore.ts exporta useFormStore com persist em localStorage"
  - "src/stores/index.ts re-exporta todas as stores"
  - "Set<number> é serializado como Array no persist para compatibilidade com localStorage"
  - "Comentário de aviso no formStore sobre namespacing por tenantId na Fase 3"
---

## Objetivo

Instalar e configurar TanStack Query v5 (gerenciamento de estado servidor) e Zustand v5 (estado cliente persistido). Criar a store `useFormStore` com persistência em `localStorage` para salvar o progresso do formulário de avaliação entre sessões.

## Contexto

Este plano depende do Plano 01 (projeto base) mas é independente do Plano 02 (Tailwind). Pode ser executado em paralelo com os Planos 02, 06 e 07 (todos na Wave 2).

**TanStack Query v5** gerencia dados do servidor (fetch de avaliações do Supabase, mutações, cache). É a ferramenta correta para sincronização de dados remotos — não usar `useEffect` + `useState` para fetching.

**Zustand v5** gerencia estado local da UI que precisa persistir entre sessões: progresso no formulário multi-step (qual step está ativo, quais steps foram concluídos). Este estado não vai para o servidor a cada mudança — apenas quando o usuário salva explicitamente.

**Gotcha do `Set` no Zustand persist:** O `localStorage` serializa em JSON, e `JSON.stringify(new Set([1,2,3]))` retorna `"{}"` — o Set não é serializado! É necessário converter para Array no `partialize` e reconverter de volta no `onRehydrateStorage`.

## Tarefas

### Tarefa 1 — Instalar dependências

```bash
npm install @tanstack/react-query@5.100.11 zustand@5.0.13
```

Confirme as versões:

```bash
npm list @tanstack/react-query zustand
# Resultado esperado:
# ├── @tanstack/react-query@5.100.11
# └── zustand@5.0.13
```

### Tarefa 2 — Atualizar main.tsx com QueryClientProvider

Substitua o conteúdo de `src/main.tsx`. Este arquivo será atualizado novamente no Plano 06 (Sonner), mas aqui já adicionamos o `Toaster` para que o Plano 06 apenas confirme que está correto:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import './index.css'
import App from './App'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 1,
    },
  },
})

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

createRoot(root).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>
)
```

**Por que `staleTime: 5min`?** Em um formulário de avaliação, os dados de referência (perguntas, opções) mudam raramente. Um stale time de 5 minutos evita re-fetches desnecessários durante uma sessão de preenchimento.

### Tarefa 3 — Criar src/stores/formStore.ts

Crie o arquivo `src/stores/formStore.ts`:

```typescript
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * Store de progresso do formulário de avaliação.
 *
 * Persiste o step atual e os steps concluídos em localStorage.
 *
 * ⚠️  FASE 3 — Multi-tenant: a chave 'form-progress' deve ser
 * namespaceada por tenantId para evitar vazamento entre empresas
 * que usem o mesmo browser. Substituir por:
 *   name: `form-progress-${tenantId}`
 * após implementar o contexto de autenticação na Fase 3.
 */

interface FormState {
  currentStep: number
  completedSteps: Set<number>
}

interface FormActions {
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  markStepIncomplete: (step: number) => void
  reset: () => void
}

type FormStore = FormState & FormActions

const initialState: FormState = {
  currentStep: 0,
  completedSteps: new Set<number>(),
}

export const useFormStore = create<FormStore>()(
  persist(
    (set) => ({
      ...initialState,

      setCurrentStep: (step) => set({ currentStep: step }),

      markStepComplete: (step) =>
        set((state) => ({
          completedSteps: new Set([...state.completedSteps, step]),
        })),

      markStepIncomplete: (step) =>
        set((state) => {
          const next = new Set(state.completedSteps)
          next.delete(step)
          return { completedSteps: next }
        }),

      reset: () => set({ ...initialState, completedSteps: new Set<number>() }),
    }),
    {
      name: 'form-progress',
      // ⚠️  Fase 3: substituir 'form-progress' por `form-progress-${tenantId}`
      storage: createJSONStorage(() => localStorage),

      // Serializa Set como Array para localStorage (JSON não suporta Set)
      partialize: (state) => ({
        currentStep: state.currentStep,
        completedSteps: [...state.completedSteps],
      }),

      // Reconverte Array de volta para Set ao reidratar do localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.completedSteps = new Set(
            state.completedSteps as unknown as number[]
          )
        }
      },
    }
  )
)
```

### Tarefa 4 — Criar src/stores/index.ts

Crie o barrel file de stores:

```typescript
export { useFormStore } from './formStore'

// Fase 2: adicionar useAssessmentStore quando o estado de avaliação for criado
// Fase 3: adicionar useAuthStore quando autenticação for implementada
```

## Critérios de Verificação

```bash
# 1. App inicia sem erros com QueryClientProvider
npm run dev
# Acesse http://localhost:5173 — sem erros no console do browser
# Especificamente: sem "No QueryClient set" ou similar

# 2. TypeScript compila sem erros
npm run type-check
# Resultado esperado: sem output

# 3. Verificar que os arquivos foram criados
ls -la src/stores/formStore.ts src/stores/index.ts
# Resultado esperado: ambos existem

# 4. Verificar serialização do Set — teste rápido no console do browser:
# Abra DevTools → Console e cole:
#   const { useFormStore } = await import('./src/stores/formStore')
#   useFormStore.getState().markStepComplete(1)
#   useFormStore.getState().markStepComplete(3)
#   const data = JSON.parse(localStorage.getItem('form-progress') || '{}')
#   console.log(data.state.completedSteps)
# Resultado esperado: [1, 3] (Array, não {}) — confirma que Set é serializado corretamente

# 5. Verificar imports do TanStack Query no main.tsx
grep "QueryClientProvider\|QueryClient" src/main.tsx
# Resultado esperado: ambos aparecem no arquivo
```

## Notas

**TanStack Query v5 breaking changes vs v4:**
- `useQuery` agora requer objeto de configuração (não mais argumentos posicionais)
- `onSuccess`, `onError`, `onSettled` foram removidos dos hooks — usar `useEffect` para side-effects ou `.then()/.catch()` nas mutações
- `cacheTime` foi renomeado para `gcTime`

Exemplo de uso correto na v5:
```typescript
// ✅ v5 correto
const { data } = useQuery({
  queryKey: ['assessments', companyId],
  queryFn: () => fetchAssessments(companyId),
})

// ❌ v4 legado — não usar
const { data } = useQuery(['assessments'], fetchAssessments, { onSuccess: ... })
```

**Zustand v5 e TypeScript:**
O Zustand v5 melhorou a inferência de tipos. O padrão `create<Store>()(middleware(fn))` é o correto — o duplo parêntese é necessário para que o TypeScript infira corretamente os tipos com middlewares.

**Por que separar FormState e FormActions?**
A separação em interfaces distintas facilita o uso do `partialize` do persist (serializamos apenas `FormState`, não as actions) e torna o tipo mais legível. É um padrão recomendado pelo Zustand para stores com persist.

**QueryClient fora do componente:**
O `queryClient` é criado fora do componente `main` para evitar recriação a cada render. Isso é obrigatório — criar dentro de um componente sem `useMemo` recria o cache a cada re-render.
