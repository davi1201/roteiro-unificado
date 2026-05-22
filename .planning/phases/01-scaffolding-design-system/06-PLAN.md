---
id: '01-06'
title: 'Criar sistema de Toast com Sonner'
phase: 1
wave: 3
status: pending
type: implementation
depends_on: ['01-01', '01-04']
must_haves:
  - req: 'UX-01'
    truth: 'Toasts de sucesso, erro, loading e promise funcionam visualmente no browser'
  - req: 'UX-06'
    truth: 'API de toast unificada via hook useToast com tipagem completa'
truths:
  - '<Toaster> do Sonner está montado em main.tsx dentro do QueryClientProvider'
  - 'src/hooks/useToast.ts exporta wrapper tipado sobre a API do Sonner'
  - 'Toasts têm posição top-right e richColors ativado'
  - 'Página de demonstração (ou App.tsx) tem botões para testar cada tipo de toast'
---

## Objetivo

Instalar Sonner (não react-hot-toast) e configurar o `<Toaster>` global em `main.tsx`. Criar o hook `useToast` como wrapper da API do Sonner para padronizar o uso no projeto.

## Contexto

Este plano depende do Plano 01 (projeto base) e do Plano 04 (para que o `<Toaster>` seja colocado dentro do `QueryClientProvider` na hierarquia correta). Pode ser executado em paralelo com o Plano 02 (Tailwind).

**Por que Sonner e não react-hot-toast?**

- Sonner é a biblioteca de toasts recomendada para React 19+ (zero dependências extras)
- Animações mais suaves baseadas em CSS (não JavaScript)
- API mais simples: `toast.success()`, `toast.error()`, `toast.promise()`
- `richColors` oferece toasts com cores semânticas sem configuração adicional
- Integração nativa com Tailwind v4

O `useToast` hook não adiciona funcionalidade — ele encapsula o `toast` do Sonner em uma interface consistente, facilita mocks em testes e evita imports diretos do Sonner espalhados pelo código.

## Tarefas

### Tarefa 1 — Instalar Sonner

```bash
npm install sonner@2.0.7
```

Confirme:

```bash
npm list sonner
# Resultado esperado: └── sonner@2.0.7
```

### Tarefa 2 — Atualizar main.tsx com Toaster

Atualize `src/main.tsx` para incluir o `<Toaster>`. O arquivo completo deve ser:

```typescript
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
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
      <Toaster
        position="top-right"
        richColors
        duration={4000}
        closeButton
      />
    </QueryClientProvider>
  </StrictMode>
)
```

**Configurações do Toaster:**

- `position="top-right"` — padrão para apps web desktop-first
- `richColors` — usa cores semânticas (verde para sucesso, vermelho para erro, etc.)
- `duration={4000}` — 4 segundos antes de auto-dismiss (ajustável por toast individual)
- `closeButton` — botão X visível para dismiss manual

### Tarefa 3 — Criar src/hooks/useToast.ts

Crie o arquivo `src/hooks/useToast.ts`:

```typescript
import { toast, type ExternalToast } from 'sonner';

type ToastOptions = ExternalToast;

/**
 * Hook wrapper sobre o Sonner para uso padronizado no projeto.
 *
 * Uso:
 *   const { success, error, loading, promise } = useToast()
 *   success('Avaliação salva com sucesso!')
 *   error('Erro ao salvar. Tente novamente.')
 *   loading('Salvando avaliação...')
 *   promise(saveAssessment(), { loading: '...', success: '...', error: '...' })
 */
export function useToast() {
  return {
    success: (message: string, options?: ToastOptions) =>
      toast.success(message, options),

    error: (message: string, options?: ToastOptions) =>
      toast.error(message, options),

    loading: (message: string, options?: ToastOptions) =>
      toast.loading(message, options),

    info: (message: string, options?: ToastOptions) =>
      toast.info(message, options),

    warning: (message: string, options?: ToastOptions) =>
      toast.warning(message, options),

    promise: <T>(
      promiseFn: Promise<T>,
      msgs: {
        loading: string;
        success: string | ((data: T) => string);
        error: string | ((error: unknown) => string);
      }
    ) => toast.promise(promiseFn, msgs),

    dismiss: (toastId?: string | number) => toast.dismiss(toastId),
  };
}
```

### Tarefa 4 — Adicionar demonstração de toasts no App.tsx

Atualize `src/App.tsx` para incluir botões de teste de toast. Estes botões serão removidos quando a página DesignSystem for criada no Plano 05 — por enquanto servem para validação visual:

```typescript
import { useToast } from '@/hooks/useToast'

function App() {
  const { success, error, loading, promise } = useToast()

  const simulateAsync = () =>
    new Promise<string>((resolve, reject) => {
      const shouldSucceed = Math.random() > 0.5
      setTimeout(() => {
        if (shouldSucceed) resolve('Avaliação salva!')
        else reject(new Error('Falha na conexão'))
      }, 2000)
    })

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#123B66',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        fontFamily: 'sans-serif',
      }}
    >
      <h1 style={{ color: '#ffffff', fontSize: '2rem' }}>
        Roteiro Unificado
      </h1>
      <p style={{ color: '#cbd5e1', marginBottom: '1rem' }}>
        Teste do sistema de notificações
      </p>

      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={() => success('Dados salvos com sucesso!')}
          style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Toast Sucesso
        </button>

        <button
          onClick={() => error('Erro ao salvar. Tente novamente.')}
          style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Toast Erro
        </button>

        <button
          onClick={() => loading('Salvando avaliação...')}
          style={{ background: '#6b7280', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Toast Loading
        </button>

        <button
          onClick={() =>
            promise(simulateAsync(), {
              loading: 'Salvando avaliação...',
              success: (msg) => msg,
              error: 'Falha ao salvar. Verifique sua conexão.',
            })
          }
          style={{ background: '#F28C28', color: '#fff', border: 'none', borderRadius: '0.375rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
        >
          Toast Promise (50% sucesso)
        </button>
      </div>
    </div>
  )
}

export default App
```

**Nota:** Se o Plano 02 (Tailwind) já foi executado quando este plano rodar, substitua os `style={{...}}` por classes Tailwind equivalentes. Se não, mantenha os estilos inline — são temporários.

## Critérios de Verificação

```bash
# 1. App inicia sem erros
npm run dev
# Acesse http://localhost:5173

# 2. Testar cada tipo de toast manualmente:
# - Clique em "Toast Sucesso" → toast verde aparece no canto superior direito
# - Clique em "Toast Erro" → toast vermelho aparece
# - Clique em "Toast Loading" → toast com spinner aparece
# - Clique em "Toast Promise" → spinner por 2s, então sucesso ou erro (50/50)
# - Todos desaparecem após ~4 segundos ou ao clicar no X

# 3. TypeScript compila sem erros
npm run type-check
# Resultado esperado: sem output

# 4. Verificar que Sonner está em main.tsx
grep "Toaster\|sonner" src/main.tsx
# Resultado esperado: import e uso do Toaster

# 5. Verificar que react-hot-toast NÃO está instalado
grep "react-hot-toast" package.json 2>/dev/null && echo "ERRO: usar Sonner, não react-hot-toast" || echo "OK"
# Resultado esperado: OK
```

## Notas

**Sonner vs react-hot-toast:**
O projeto usa Sonner. Se em algum momento um PR ou sugestão trouxer `react-hot-toast`, rejeite. As razões:

- Sonner tem melhor suporte para React 19 (react-hot-toast tem issues com Strict Mode)
- Sonner tem API de `promise` nativa que facilita feedback durante operações assíncronas do Supabase
- Uma biblioteca para toasts é suficiente — não instalar as duas

**`toast.dismiss()` sem ID:**
Chamar `toast.dismiss()` sem argumento dismiss **todos** os toasts visíveis. Use com cuidado — por exemplo, ao navegar entre etapas do formulário, pode ser desejável limpar toasts anteriores.

**`toast.promise()` com Supabase:**
No futuro, o padrão de uso será:

```typescript
promise(supabase.from('assessments').insert(data).throwOnError(), {
  loading: 'Salvando avaliação...',
  success: 'Avaliação salva com sucesso!',
  error: (err) => `Erro: ${err.message}`,
});
```

**Customização do Toaster:**
Se no futuro for necessário customizar as cores dos toasts (para usar exatamente as cores do design system), o Sonner aceita um prop `toastOptions` no `<Toaster>`:

```typescript
<Toaster
  toastOptions={{
    classNames: {
      success: 'bg-g5 text-white',
      error: 'bg-g1 text-white',
    }
  }}
/>
```

Mas isso exige que o Tailwind v4 esteja configurado — fazer apenas após o Plano 02.
