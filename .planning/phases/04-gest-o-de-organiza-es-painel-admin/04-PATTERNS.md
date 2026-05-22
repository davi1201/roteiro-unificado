# Phase 4: Gestão de Organizações & Painel Admin — Mapa de Padrões

**Mapeado:** 2026-05-22
**Arquivos analisados:** 9 novos / 1 modificado
**Análogos encontrados:** 9 / 10

---

## Classificação de Arquivos

| Arquivo Novo/Modificado | Papel | Fluxo de Dados | Análogo Mais Próximo | Qualidade |
|-------------------------|-------|---------------|----------------------|-----------|
| `supabase/functions/create-user/index.ts` | provider (Edge Function) | request-response | nenhum Edge Function existente | sem análogo |
| `src/components/ui/dialog.tsx` | component | request-response | `src/components/ui/card.tsx` | partial-match |
| `src/components/AdminLayout.tsx` | component (layout) | request-response | `src/components/routing/AdminRoute.tsx` | role-match |
| `src/pages/admin/AdminDashboard.tsx` | component (page) | CRUD | `src/pages/Login.tsx` | role-match |
| `src/pages/admin/OrgDetail.tsx` | component (page) | CRUD | `src/pages/Login.tsx` | role-match |
| `src/components/admin/CreateOrgModal.tsx` | component (form modal) | CRUD | `src/pages/Login.tsx` | exact |
| `src/components/admin/AddMemberModal.tsx` | component (form modal) | CRUD | `src/pages/Login.tsx` | exact |
| `src/components/admin/OrgTable.tsx` | component (table) | CRUD | `src/components/ui/card.tsx` | partial-match |
| `src/components/admin/MemberTable.tsx` | component (table) | CRUD | `src/components/ui/card.tsx` | partial-match |
| `src/router.tsx` (modificar) | config (rotas) | request-response | `src/router.tsx` (atual) | exact |

---

## Atribuições de Padrões

### `supabase/functions/create-user/index.ts` (Edge Function, request-response)

**Análogo:** nenhum Edge Function existe ainda no projeto — usar padrão da documentação oficial Supabase Deno.

**Padrão de imports para Edge Function Deno:**
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
```

**Padrão de segurança obrigatório (D-01):**
```typescript
// NUNCA importar service_role no cliente. Edge Function usa env var do runtime:
const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
```

**Padrão de handler (request-response):**
```typescript
Deno.serve(async (req: Request) => {
  // Verificar método
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { email, password, org_id } = await req.json()

    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ user_id: data.user.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
})
```

**Nota de implantação:** arquivo deve residir em `supabase/functions/create-user/index.ts`; implantar com `supabase functions deploy create-user --no-verify-jwt`.

---

### `src/components/ui/dialog.tsx` (component, request-response)

**Análogo:** `roteiro-unificado/src/components/ui/card.tsx` (mesma estrutura de wrapper com `className` + `cn`)

**Nota:** `@radix-ui` NÃO está instalado no projeto. Implementar Dialog nativo com `role="dialog"` e `aria-modal` — sem instalar nova dependência.

**Padrão de imports** (copiar de `src/components/ui/card.tsx` linhas 1-2):
```typescript
import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'
```

**Padrão de componente UI primitivo** (baseado em `card.tsx` linhas 4-19):
```typescript
// card.tsx como referência de estrutura de sub-componentes exportados do mesmo arquivo
export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('rounded-lg border border-gray-200 bg-white shadow-sm', className)}
      {...props}
    />
  )
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-1.5 p-6', className)} {...props} />
}
```

**Padrão a seguir para Dialog (baseado no card.tsx, adaptado):**
```typescript
// Dialog exporta: Dialog (backdrop+panel), DialogHeader, DialogContent, DialogFooter
// Usar estado controlado via props: open + onClose
interface DialogProps {
  open: boolean
  onClose: () => void
  className?: string
  children: React.ReactNode
}

export function Dialog({ open, onClose, className, children }: DialogProps) {
  if (!open) return null
  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* Panel */}
      <div className={cn('relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl', className)}>
        {children}
      </div>
    </div>
  )
}
```

**Exportar via barrel** (`src/components/ui/index.ts` — adicionar):
```typescript
export { Dialog, DialogHeader, DialogContent, DialogFooter } from './dialog'
```

---

### `src/components/AdminLayout.tsx` (component layout, request-response)

**Análogo:** `roteiro-unificado/src/components/routing/AdminRoute.tsx`

**Padrão de imports** (AdminRoute.tsx linhas 1-3):
```typescript
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'
import { Spinner } from '@/components/ui'
```

**Padrão de uso do Outlet** (AdminRoute.tsx linhas 24):
```typescript
// AdminRoute renderiza <Outlet /> — AdminLayout envolve esse Outlet como wrapper de UI
return <Outlet />
```

**Padrão que AdminLayout deve seguir:**
```typescript
import { Outlet } from 'react-router-dom'
import { useAuth } from '@/features/auth/useAuth'

export function AdminLayout() {
  const { user, signOut } = useAuth()

  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa ~240px */}
      <aside className="w-60 shrink-0 bg-primary text-white flex flex-col">
        {/* nav links */}
      </aside>

      {/* Área de conteúdo */}
      <div className="flex flex-1 flex-col">
        {/* Header com nome do admin + botão Sair */}
        <header className="flex h-14 items-center justify-between border-b px-6">
          <span className="text-sm text-gray-700">{user?.email}</span>
          <Button variant="ghost" size="sm" onClick={signOut}>Sair</Button>
        </header>
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
```

**Conexão com router** — AdminLayout é filho dentro de `AdminRoute` children no `router.tsx`:
```typescript
// router.tsx — padrão atual (linhas 35-46):
{
  element: <AdminRoute />,
  children: [
    {
      path: '/admin/dashboard',
      element: <div>Admin Dashboard — Phase 4</div>,
    },
    // ...
  ],
}

// Padrão após Phase 4 — AdminLayout como wrapper de layout:
{
  element: <AdminRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        { path: '/admin/dashboard', element: <AdminDashboard /> },
        { path: '/admin/orgs/:orgId', element: <OrgDetail /> },
      ],
    },
  ],
}
```

---

### `src/pages/admin/AdminDashboard.tsx` (component page, CRUD)

**Análogo:** `roteiro-unificado/src/pages/Login.tsx` — mesma estrutura de page component com lógica de negócio inline.

**Padrão de imports** (Login.tsx linhas 1-9):
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'
import { useToast } from '@/hooks/useToast'
import { Button, Input, Card, CardHeader, CardContent, Spinner } from '@/components/ui'
```

**Padrão de imports para página com TanStack Query (adaptar):**
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { Button, Card, Spinner, Skeleton, Badge } from '@/components/ui'
import type { Tables } from '@/types/database'
```

**Padrão TanStack Query — useQuery para listagem:**
```typescript
// TanStack Query configurado em main.tsx (linhas 9-16) com staleTime 5min
const { data: orgs, isLoading, error } = useQuery({
  queryKey: ['orgs'],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('orgs')
      .select('id, name, cnpj, active, created_at')
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
})
```

**Padrão de loading state** (Login.tsx linhas 63-69):
```typescript
if (isLoading) {
  return (
    <div className="bg-primary flex min-h-screen items-center justify-center">
      <Spinner size="lg" className="border-white border-t-transparent" />
    </div>
  )
}
```

**Padrão de error handling com toast** (Login.tsx linhas 50-61):
```typescript
const toast = useToast()

if (error) {
  toast.error('Erro ao carregar organizações')
}
```

---

### `src/pages/admin/OrgDetail.tsx` (component page, CRUD)

**Análogo:** `roteiro-unificado/src/pages/Login.tsx`

**Padrão de imports com useParams (adaptar de router.tsx linha 30):**
```typescript
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { Button, Card, CardHeader, CardContent, Badge, Spinner, Skeleton } from '@/components/ui'
import type { Tables } from '@/types/database'
```

**Padrão useQuery para detalhe (adaptar):**
```typescript
const { orgId } = useParams<{ orgId: string }>()

const { data: org } = useQuery({
  queryKey: ['orgs', orgId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('orgs')
      .select('*')
      .eq('id', orgId!)
      .single()
    if (error) throw error
    return data
  },
  enabled: !!orgId,
})

const { data: members } = useQuery({
  queryKey: ['org_members', orgId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('org_members')
      .select('id, user_id, role, created_at')
      .eq('org_id', orgId!)
    if (error) throw error
    return data
  },
  enabled: !!orgId,
})
```

---

### `src/components/admin/CreateOrgModal.tsx` (component form modal, CRUD)

**Análogo:** `roteiro-unificado/src/pages/Login.tsx` — melhor match: mesmo padrão React Hook Form + Zod + Supabase + toast + Button isLoading.

**Padrão de schema Zod** (Login.tsx linhas 11-16):
```typescript
const loginSchema = z.object({
  email: z.string().min(1, 'O email é obrigatório').email('Insira um email válido'),
  password: z.string().min(1, 'A senha é obrigatória'),
})
type LoginFormData = z.infer<typeof loginSchema>
```

**Schema para CreateOrg (adaptar — decisão D da CONTEXT.md):**
```typescript
const createOrgSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos'),
})
type CreateOrgFormData = z.infer<typeof createOrgSchema>
```

**Padrão useForm** (Login.tsx linhas 23-30):
```typescript
const {
  register,
  handleSubmit,
  formState: { errors, isSubmitting },
} = useForm<LoginFormData>({
  resolver: zodResolver(loginSchema),
  mode: 'onBlur',
})
```

**Padrão useMutation com invalidateQueries (D-05):**
```typescript
const queryClient = useQueryClient()
const toast = useToast()

const createOrgMutation = useMutation({
  mutationFn: async (data: CreateOrgFormData) => {
    const { error } = await supabase.from('orgs').insert({
      name: data.name,
      cnpj: data.cnpj,
      active: true,
    })
    if (error) throw error
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['orgs'] })
    toast.success('Organização criada com sucesso!')
    onClose()
  },
  onError: () => {
    toast.error('Erro ao criar organização. Tente novamente.')
  },
})
```

**Padrão de campo Input com erro** (Login.tsx linhas 81-93):
```typescript
<div className="flex flex-col gap-1">
  <label htmlFor="name" className="text-sm text-gray-700">
    Nome
  </label>
  <Input
    id="name"
    type="text"
    placeholder="Construtora Exemplo"
    error={!!errors.name}
    errorMessage={errors.name?.message}
    {...register('name')}
  />
</div>
```

**Padrão de Button isLoading** (Login.tsx linhas 113-119):
```typescript
<Button
  type="submit"
  isLoading={isSubmitting}
  className="w-full"
>
  {isSubmitting ? 'Criando...' : 'Criar'}
</Button>
```

---

### `src/components/admin/AddMemberModal.tsx` (component form modal, CRUD)

**Análogo:** `roteiro-unificado/src/pages/Login.tsx` — mesmo padrão de formulário com React Hook Form + Zod.

**Padrão de schema Zod:**
```typescript
const addMemberSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Email inválido'),
  password: z.string().min(6, 'Senha mínima de 6 caracteres'),
})
type AddMemberFormData = z.infer<typeof addMemberSchema>
```

**Padrão de chamada à Edge Function (D-01, D-02, D-03):**
```typescript
const addMemberMutation = useMutation({
  mutationFn: async (data: AddMemberFormData) => {
    // Passo 1: chamar Edge Function com service_role (nunca expor chave no cliente)
    const { data: fnData, error: fnError } = await supabase.functions.invoke('create-user', {
      body: { email: data.email, password: data.password, org_id: orgId },
    })
    if (fnError) throw fnError

    // Passo 2: INSERT em org_members com user_id retornado (D-03)
    const { error: memberError } = await supabase.from('org_members').insert({
      org_id: orgId,
      user_id: fnData.user_id,
      role: 'company',
    })
    if (memberError) throw memberError
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['org_members', orgId] })
    toast.success('Membro adicionado com sucesso!')
    onClose()
  },
  onError: () => {
    toast.error('Erro ao adicionar membro. Tente novamente.')
  },
})
```

---

### `src/components/admin/OrgTable.tsx` (component table, CRUD)

**Análogo:** `roteiro-unificado/src/components/ui/card.tsx` — padrão de componente presentacional com `className` + `cn`.

**Padrão de imports para tabela:**
```typescript
import { useNavigate } from 'react-router-dom'
import { Button, Badge, Skeleton } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { Tables } from '@/types/database'
```

**Padrão de tipos inferidos do database** (database.ts linhas 122-126):
```typescript
// Usar o utility type Tables<> para tipar props da tabela
import type { Tables } from '@/types/database'

type Org = Tables<'orgs'>

interface OrgTableProps {
  orgs: Org[]
  isLoading: boolean
  onArchive: (orgId: string) => void
}
```

**Padrão de Skeleton para loading** (skeleton.tsx):
```typescript
// Usar Skeleton de src/components/ui/skeleton.tsx
// className="h-4 w-full" para simular linhas de tabela
{isLoading ? (
  Array.from({ length: 3 }).map((_, i) => (
    <tr key={i}>
      <td><Skeleton className="h-4 w-32" /></td>
      <td><Skeleton className="h-4 w-24" /></td>
    </tr>
  ))
) : (
  orgs.map(org => (
    <tr key={org.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/admin/orgs/${org.id}`)}>
      {/* células */}
    </tr>
  ))
)}
```

---

### `src/router.tsx` (modificar — config rotas)

**Análogo:** `roteiro-unificado/src/router.tsx` (arquivo atual — modificação direta)

**Padrão atual de AdminRoute** (router.tsx linhas 35-46):
```typescript
{
  element: <AdminRoute />,
  children: [
    {
      path: '/admin/dashboard',
      element: <div>Admin Dashboard — Phase 4</div>,
    },
    {
      path: '/admin/orgs/:orgId',
      element: <div>Org Detail — Phase 4</div>,
    },
  ],
},
```

**Padrão após modificação — inserir AdminLayout como layout intermediário:**
```typescript
// Adicionar imports no topo do arquivo:
import { AdminLayout } from '@/components/AdminLayout'
import { AdminDashboard } from '@/pages/admin/AdminDashboard'
import { OrgDetail } from '@/pages/admin/OrgDetail'

// Substituir bloco AdminRoute existente:
{
  element: <AdminRoute />,
  children: [
    {
      element: <AdminLayout />,
      children: [
        {
          path: '/admin/dashboard',
          element: <AdminDashboard />,
        },
        {
          path: '/admin/orgs/:orgId',
          element: <OrgDetail />,
        },
      ],
    },
  ],
},
```

---

## Padrões Compartilhados

### Autenticação / Guard
**Fonte:** `roteiro-unificado/src/features/auth/useAuth.ts` + `roteiro-unificado/src/features/auth/AuthProvider.tsx`
**Aplicar a:** `AdminLayout`, todos os page components admin
```typescript
// useAuth expõe: { user, session, role, orgId, isLoading, signOut }
// AuthProvider.tsx linhas 7-13:
export interface AuthContextType {
  user: User | null
  session: Session | null
  role: Enums<'member_role'> | null
  orgId: string | null
  isLoading: boolean
  signOut: () => Promise<void>
}
```

### Importação de componentes UI
**Fonte:** `roteiro-unificado/src/components/ui/index.ts`
**Aplicar a:** todos os arquivos de componente
```typescript
// Sempre importar via barrel — nunca importar direto de ./button, ./input etc.
import { Button, Input, Card, CardHeader, CardContent, CardFooter, Badge, Spinner, Skeleton } from '@/components/ui'
```

### Alias de caminho
**Fonte:** `roteiro-unificado/vite.config.ts` (configurado em Phase 1)
**Aplicar a:** todos os novos arquivos
```typescript
// Sempre usar @/ — nunca ../../../
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
```

### Tokens de cor Tailwind
**Fonte:** `roteiro-unificado/src/index.css` (configurado via `@theme {}` em Phase 1)
**Aplicar a:** todos os arquivos com classes Tailwind
```typescript
// Usar tokens semânticos — nunca hardcodar hex
// bg-primary     → #123B66 (azul corporativo)
// text-accent    → #F28C28 (laranja de ação)
// bg-g1 a bg-g5  → escala de prontidão
// border-gray-*  → bordas neutras
```

### Tratamento de erros
**Fonte:** `roteiro-unificado/src/hooks/useToast.ts` linhas 15-38
**Aplicar a:** todos os `useMutation` e `onSubmit` handlers
```typescript
const toast = useToast()

// Padrão em onError de useMutation:
onError: () => {
  toast.error('Mensagem de erro específica.')
},

// Padrão em onSuccess:
onSuccess: () => {
  toast.success('Ação concluída com sucesso!')
},
```

### Validação com React Hook Form + Zod
**Fonte:** `roteiro-unificado/src/pages/Login.tsx` linhas 11-30
**Aplicar a:** `CreateOrgModal`, `AddMemberModal`
```typescript
// 1. Definir schema Zod
const schema = z.object({ ... })
type FormData = z.infer<typeof schema>

// 2. Inicializar form
const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur',
})

// 3. Renderizar campo com erro
<Input
  error={!!errors.campo}
  errorMessage={errors.campo?.message}
  {...register('campo')}
/>
```

### Tipos do banco de dados
**Fonte:** `roteiro-unificado/src/types/database.ts` linhas 122-126
**Aplicar a:** todos os arquivos que consomem dados do Supabase
```typescript
import type { Tables, Enums } from '@/types/database'

// Tipar dados retornados por queries:
type Org = Tables<'orgs'>
type OrgMember = Tables<'org_members'>
type MemberRole = Enums<'member_role'>  // 'admin' | 'company'
```

---

## Sem Análogo Encontrado

| Arquivo | Papel | Fluxo | Motivo |
|---------|-------|-------|--------|
| `supabase/functions/create-user/index.ts` | provider (Edge Function) | request-response | Nenhuma Edge Function existe no projeto. `@radix-ui` não está instalado — Dialog deve ser implementação nativa. Usar padrão oficial Supabase Deno descrito acima. |

---

## Metadados

**Escopo de busca de análogos:** `roteiro-unificado/src/` (todos os subdiretórios)
**Arquivos escaneados:** 20 arquivos `.ts`/`.tsx` no projeto principal
**Dependências confirmadas instaladas:** `@tanstack/react-query ^5`, `react-hook-form ^7`, `zod ^4`, `@hookform/resolvers ^5`, `@supabase/supabase-js ^2`, `react-router-dom ^7`, `sonner ^2`
**Dependências NÃO instaladas:** `@radix-ui/*` — Dialog deve ser implementação nativa sem nova dependência
**Data de extração:** 2026-05-22
