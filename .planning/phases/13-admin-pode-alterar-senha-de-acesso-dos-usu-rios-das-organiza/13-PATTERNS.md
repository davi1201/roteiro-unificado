# Phase 13: Admin pode alterar senha de acesso dos usuários das organizações — Mapa de Padrões

**Mapeado em:** 2026-06-16
**Arquivos analisados:** 9 (7 novos/modificados + 2 de teste)
**Análogos encontrados:** 9 / 9

---

## Classificação de Arquivos

| Arquivo Novo/Modificado | Role | Data Flow | Análogo Mais Próximo | Qualidade do Match |
|------------------------|------|-----------|---------------------|--------------------|
| `supabase/functions/reset-user-password/index.ts` | service | request-response | `supabase/functions/create-user/index.ts` | exact |
| `src/components/admin/ResetPasswordModal.tsx` | component | request-response | `src/components/admin/AddMemberModal.tsx` | exact |
| `src/schemas/resetPassword.ts` | utility | transform | `src/schemas/addMember.ts` | exact |
| `src/components/ChangePasswordModal.tsx` (path real: `src/features/form/ChangePasswordModal.tsx`) | component | request-response | `src/components/admin/AddMemberModal.tsx` | role-match (sem Edge Function) |
| `src/schemas/changePassword.ts` | utility | transform | `src/schemas/addMember.ts` + padrão `z.refine()` | role-match |
| `src/components/admin/MemberTable.tsx` (MODIFICAR) | component | CRUD | si mesmo + `src/components/admin/AddMemberModal.tsx` (padrão botão) | exact |
| `src/pages/admin/OrgDetail.tsx` (MODIFICAR) | controller | CRUD | si mesmo — adicionar estado `resetPasswordMemberId` | exact |
| `src/features/form/FormLayout.tsx` (MODIFICAR) | component | request-response | si mesmo — adicionar estado `isChangePasswordOpen` + botão | exact |
| `src/schemas/resetPassword.test.ts` / `src/schemas/changePassword.test.ts` | test | — | `src/schemas/identificacao.test.ts` | exact |
| `src/components/admin/ResetPasswordModal.test.tsx` / `MemberTable.test.tsx` | test | — | `src/components/admin/CompanyCard.test.tsx` | exact |

---

## Atribuições de Padrões

### `supabase/functions/reset-user-password/index.ts` (service, request-response)

**Análogo:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/supabase/functions/create-user/index.ts`

**Padrão de importação e setup do adminClient** (linhas 1–12):
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')

if (!serviceRoleKey || !supabaseUrl) {
  throw new Error('Missing required environment variables')
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})
```

**Padrão de CORS headers** (linhas 14–18):
```typescript
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
```

**Padrão core do handler Deno.serve** — estrutura completa com CORS preflight, validação de método, parse de body, validação de input e tratamento de erro (linhas 20–87):
```typescript
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }

  try {
    const body = await req.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON body' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DIFERENÇA vs create-user: campos esperados são { user_id, password } não { email, password, org_id }
    const { user_id, password } = body as { user_id?: unknown; password?: unknown }

    // Validação UUID — mesmo regex do create-user para org_id, adaptado para user_id
    if (typeof user_id !== 'string' || !user_id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return new Response(
        JSON.stringify({ error: 'Invalid user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }
    if (typeof password !== 'string' || password.length < 8) {
      return new Response(
        JSON.stringify({ error: 'Password must be at least 8 characters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DIFERENÇA vs create-user: updateUserById ao invés de createUser
    const { data, error } = await adminClient.auth.admin.updateUserById(user_id, { password })

    if (error || !data.user) {
      return new Response(
        JSON.stringify({ error: error?.message ?? 'Failed to update user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // DIFERENÇA vs create-user: retorna { success: true } não { user_id }
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (_err) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
```

---

### `src/schemas/resetPassword.ts` (utility, transform)

**Análogo:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/schemas/addMember.ts`

**Padrão de schema Zod** — copiar estrutura, remover campo `email`, manter apenas `password` (linhas 1–8 do análogo):
```typescript
import { z } from 'zod'

// addMemberSchema original (linhas 3–6):
export const addMemberSchema = z.object({
  email: z.string().min(1, 'Email é obrigatório').email('Insira um email válido'),
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})
export type AddMemberFormData = z.infer<typeof addMemberSchema>

// resetPasswordSchema — copiar apenas o campo password:
export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
```

---

### `src/schemas/changePassword.ts` (utility, transform)

**Análogo:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/schemas/addMember.ts` + padrão `z.refine()`

**Padrão base** (campo `password` de `addMember.ts` linha 5) + extensão com `.refine()` para correspondência de senhas:
```typescript
import { z } from 'zod'

// Base: z.string().min(8) idêntico ao addMemberSchema
// Extensão: z.object().refine() para validar que newPassword === confirmPassword
export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'], // erro aparece no campo confirmPassword no RHF
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
```

---

### `src/components/admin/ResetPasswordModal.tsx` (component, request-response)

**Análogo:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/components/admin/AddMemberModal.tsx`

**Padrão de importações** (linhas 1–16 do análogo):
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'  // sem useQueryClient — reset não invalida queries
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import {
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '@/components/ui'
import { resetPasswordSchema, type ResetPasswordFormData } from '@/schemas/resetPassword'
```

**Padrão de props** — interface análoga a `AddMemberModalProps` (linhas 18–22), substituindo `orgId` por `userId` + `memberEmail`:
```typescript
interface ResetPasswordModalProps {
  userId: string
  memberEmail?: string  // opcional: exibido no DialogDescription para contexto do admin
  open: boolean
  onClose: () => void
}
```

**Padrão useForm** (linhas 25–33 do análogo — copiar exatamente):
```typescript
const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm<ResetPasswordFormData>({
  resolver: zodResolver(resetPasswordSchema),
  mode: 'onBlur',
})
```

**Padrão useMutation com invoke** (linhas 38–78 do análogo) — adaptar `mutationFn` para chamar `reset-user-password` ao invés de `create-user`:
```typescript
const resetPasswordMutation = useMutation({
  mutationFn: async (data: ResetPasswordFormData) => {
    const { data: fnData, error: fnError } = await supabase.functions.invoke<{ success: boolean }>(
      'reset-user-password',
      { body: { user_id: userId, password: data.password } }
    )
    // CRÍTICO: checar ambos fnError E fnData?.success (Pitfall 2 do RESEARCH.md)
    if (fnError || !fnData?.success) {
      throw new Error('reset_failed')
    }
  },
  onSuccess: () => {
    toast.success('Senha redefinida com sucesso')
    reset()
    onClose()  // onClose() SOMENTE em onSuccess — nunca no onClick do submit (Anti-pattern 4)
  },
  onError: () => {
    toast.error('Não foi possível redefinir a senha. Tente novamente.')
  },
})
```

**Padrão JSX do Dialog** (linhas 82–143 do análogo) — estrutura Dialog + form + DialogContent + DialogFooter:
```typescript
return (
  <Dialog open={open} onClose={onClose}>
    <DialogHeader>
      <DialogTitle>Redefinir senha</DialogTitle>
      <DialogDescription>
        {memberEmail ? `Nova senha para ${memberEmail}.` : 'Digite a nova senha para o usuário.'}
      </DialogDescription>
    </DialogHeader>
    <form onSubmit={handleSubmit((data) => resetPasswordMutation.mutate(data))} noValidate>
      <DialogContent className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="reset-password" className="text-sm text-gray-700">
            Nova senha
          </label>
          <Input
            id="reset-password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            error={!!errors.password}
            errorMessage={errors.password?.message}
            autoFocus
            {...register('password')}
          />
        </div>
      </DialogContent>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={() => { reset(); onClose() }}
          disabled={resetPasswordMutation.isPending}
        >
          Cancelar
        </Button>
        <Button type="submit" variant="primary" isLoading={resetPasswordMutation.isPending}>
          {resetPasswordMutation.isPending ? 'Salvando...' : 'Salvar'}
        </Button>
      </DialogFooter>
    </form>
  </Dialog>
)
```

---

### `src/features/form/ChangePasswordModal.tsx` (component, request-response)

**Análogo:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/components/admin/AddMemberModal.tsx`

**Diferença-chave vs ResetPasswordModal:** Usa `supabase.auth.updateUser()` no cliente (sem Edge Function). Exige três campos (senha atual + nova + confirmação). Requer `useAuth()` para obter `user.email` caso Opção B de verificação de senha atual seja implementada.

**Padrão de importações** — idêntico a `AddMemberModal` exceto schema e sem `useQueryClient`:
```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/features/auth/useAuth'  // necessário para user.email (Opção B)
import { useToast } from '@/hooks/useToast'
import {
  Button, Input, Dialog, DialogHeader, DialogTitle,
  DialogDescription, DialogContent, DialogFooter,
} from '@/components/ui'
import { changePasswordSchema, type ChangePasswordFormData } from '@/schemas/changePassword'
```

**Padrão de props** (mais simples que AddMemberModal — sem orgId/userId):
```typescript
interface ChangePasswordModalProps {
  open: boolean
  onClose: () => void
}
```

**Padrão useMutation com client SDK** — divergência do análogo: sem `functions.invoke`, usa `supabase.auth.updateUser()`:
```typescript
// Dentro de ChangePasswordModal
const { user } = useAuth()

const changePasswordMutation = useMutation({
  mutationFn: async (data: ChangePasswordFormData) => {
    // Opção B (recomendada): verificar senha atual via re-autenticação antes de updateUser
    if (user?.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: data.currentPassword,
      })
      if (signInError) throw new Error('wrong_current_password')
    }
    const { error } = await supabase.auth.updateUser({ password: data.newPassword })
    if (error) throw new Error('update_failed')
  },
  onSuccess: () => {
    toast.success('Senha alterada com sucesso')
    reset()
    onClose()
  },
  onError: (err: Error) => {
    if (err.message === 'wrong_current_password') {
      toast.error('Senha atual incorreta.')
    } else {
      toast.error('Não foi possível alterar a senha. Tente novamente.')
    }
  },
})
```

**Padrão JSX do Dialog** — três campos ao invés de dois; copiar estrutura do `AddMemberModal` (linhas 82–143):
```typescript
// Três campos: currentPassword, newPassword, confirmPassword
// Mesmo padrão div.flex.flex-col.gap-1 + label + Input com error props
// Mesmo DialogFooter com Cancelar (secondary) + Salvar (primary, isLoading)
```

---

### `src/components/admin/MemberTable.tsx` — MODIFICAR (component, CRUD)

**Análogo:** si mesmo (linhas 1–76), sem mudanças estruturais — apenas addição de prop e coluna.

**Padrão de interface atual** (linhas 4–7) — adicionar `onResetPassword`:
```typescript
// ANTES:
interface MemberTableProps {
  members: OrgMemberWithEmail[] | undefined
  isLoading: boolean
}

// DEPOIS (adicionar prop opcional):
interface MemberTableProps {
  members: OrgMemberWithEmail[] | undefined
  isLoading: boolean
  onResetPassword?: (userId: string) => void  // nova
}
```

**Padrão de thead existente** (linhas 24–37) — adicionar quarta coluna "Ações" com mesmo padrão de classe:
```typescript
// Coluna existente "Role" (linha 28–30) como template:
<th scope="col" className="w-28 px-4 py-3 text-left text-sm font-semibold text-gray-600">
  Role
</th>

// Nova coluna "Ações" — mesmo padrão de classe, largura w-36:
<th scope="col" className="w-36 px-4 py-3 text-left text-sm font-semibold text-gray-600">
  Ações
</th>
```

**Padrão de tbody existente** (linhas 54–72) — adicionar quarta célula `<td>` com botão condicional por `role`:
```typescript
// Células existentes (ex. linha 56–58) como template para a nova:
<td className="px-4 py-3 text-gray-900">{member.email}</td>

// Nova célula — botão condicional apenas para role 'company':
<td className="px-4 py-3">
  {member.role === 'company' && onResetPassword && (
    <Button
      variant="secondary"
      size="sm"
      onClick={() => onResetPassword(member.user_id)}
    >
      Redefinir senha
    </Button>
  )}
</td>

// Skeleton row também precisa de quarta célula no isLoading branch (linhas 41–53):
<td className="px-4 py-3">
  <Skeleton className="h-4 w-24" />
</td>
```

---

### `src/pages/admin/OrgDetail.tsx` — MODIFICAR (controller, CRUD)

**Análogo:** si mesmo (linhas 1–102) — replicar padrão `isAddMemberOpen` / `isArchiveOpen` para o novo estado.

**Padrão de estado de modal existente** (linhas 13–14) — adicionar terceiro estado:
```typescript
// Padrão existente:
const [isAddMemberOpen, setIsAddMemberOpen] = useState(false)
const [isArchiveOpen, setIsArchiveOpen] = useState(false)

// Adicionar (estado é string|null, não boolean, para carregar o userId):
const [resetPasswordMemberId, setResetPasswordMemberId] = useState<string | null>(null)
```

**Padrão de passagem de prop para MemberTable** (linha 79) — adicionar `onResetPassword`:
```typescript
// ANTES (linha 79):
<MemberTable members={members} isLoading={false} />

// DEPOIS (manter isLoading={false} — Pitfall 3 do RESEARCH.md):
<MemberTable
  members={members}
  isLoading={false}
  onResetPassword={(userId) => setResetPasswordMemberId(userId)}
/>
```

**Padrão de renderização condicional de modal** (linhas 87–98 do análogo — pattern de AddMemberModal):
```typescript
// Padrão existente:
{orgId && (
  <AddMemberModal
    orgId={orgId}
    open={isAddMemberOpen}
    onClose={() => setIsAddMemberOpen(false)}
  />
)}

// Novo modal — após os existentes:
{resetPasswordMemberId && (
  <ResetPasswordModal
    userId={resetPasswordMemberId}
    memberEmail={members?.find(m => m.user_id === resetPasswordMemberId)?.email}
    open={!!resetPasswordMemberId}
    onClose={() => setResetPasswordMemberId(null)}
  />
)}
```

**Padrão de importação** — adicionar dois imports no topo do arquivo:
```typescript
// Linhas 1–8 do análogo como base; adicionar:
import { ResetPasswordModal } from '@/components/admin/ResetPasswordModal'
// (useState já importado na linha 1)
```

---

### `src/features/form/FormLayout.tsx` — MODIFICAR (component, request-response)

**Análogo:** si mesmo (linhas 1–355) — padrão `isSubmitOpen` na linha 93 como template para o novo estado.

**Padrão de estado de modal existente** (linha 93):
```typescript
// Padrão existente:
const [isSubmitOpen, setIsSubmitOpen] = useState(false)

// Adicionar:
const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
```

**Padrão de sidebar footer** (linhas 196–205 — seção `border-primary-800 mt-auto border-t p-3`) — inserir botão antes do botão "Sair":
```typescript
// ANTES (linhas 196–205):
<div className="border-primary-800 mt-auto border-t p-3">
  <Button
    variant="ghost"
    size="sm"
    className="hover:bg-primary-800 w-full justify-start text-white"
    onClick={handleSignOut}
  >
    Sair
  </Button>
</div>

// DEPOIS — adicionar flex-col gap-2 e botão "Alterar senha" antes de "Sair":
<div className="border-primary-800 mt-auto border-t p-3 flex flex-col gap-2">
  <Button
    variant="ghost"
    size="sm"
    className="hover:bg-primary-800 w-full justify-start text-white"
    onClick={() => setIsChangePasswordOpen(true)}
  >
    Alterar senha
  </Button>
  <Button
    variant="ghost"
    size="sm"
    className="hover:bg-primary-800 w-full justify-start text-white"
    onClick={handleSignOut}
  >
    Sair
  </Button>
</div>
```

**Padrão de Dialog existente** (linhas 318–352) — renderizar `ChangePasswordModal` após o Dialog de submissão com mesmo padrão condicional:
```typescript
// Padrão Dialog existente (linhas 318–352) como referência estrutural.
// ChangePasswordModal é um componente separado (não Dialog inline) — renderizar após o Dialog:
{isChangePasswordOpen && (
  <ChangePasswordModal
    open={isChangePasswordOpen}
    onClose={() => setIsChangePasswordOpen(false)}
  />
)}
```

**Padrão de importação** — adicionar ao bloco de imports existente (após linha 36 que importa `Button, Spinner`):
```typescript
import { ChangePasswordModal } from '@/features/form/ChangePasswordModal'
```

---

## Padrões Compartilhados

### Dialog primitive (cross-cutting — todos os modais)

**Fonte:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/components/admin/AddMemberModal.tsx` linhas 8–15 (importação) e 83–143 (uso)
**Aplicar a:** `ResetPasswordModal.tsx`, `ChangePasswordModal.tsx`

```typescript
// Importação padrão (extraída de AddMemberModal, linha 8–15):
import {
  Button,
  Input,
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from '@/components/ui'

// Estrutura padrão (extraída de AddMemberModal, linhas 83–143):
<Dialog open={open} onClose={onClose}>
  <DialogHeader>
    <DialogTitle>...</DialogTitle>
    <DialogDescription>...</DialogDescription>
  </DialogHeader>
  <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <DialogContent className="flex flex-col gap-4">
      {/* campos */}
    </DialogContent>
    <DialogFooter>
      <Button type="button" variant="secondary" onClick={() => { reset(); onClose() }} disabled={mutation.isPending}>
        Cancelar
      </Button>
      <Button type="submit" variant="primary" isLoading={mutation.isPending}>
        {mutation.isPending ? 'Salvando...' : 'Salvar'}
      </Button>
    </DialogFooter>
  </form>
</Dialog>
```

### useForm + zodResolver (cross-cutting — todos os modais)

**Fonte:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/components/admin/AddMemberModal.tsx` linhas 25–33
**Aplicar a:** `ResetPasswordModal.tsx`, `ChangePasswordModal.tsx`

```typescript
const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm<FormData>({
  resolver: zodResolver(schema),
  mode: 'onBlur',
})
```

### useToast (cross-cutting — todos os modais)

**Fonte:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/components/admin/AddMemberModal.tsx` linha 36
**Aplicar a:** `ResetPasswordModal.tsx`, `ChangePasswordModal.tsx`

```typescript
const toast = useToast()
// Uso padrão:
toast.success('Mensagem de sucesso')
toast.error('Mensagem de erro')
```

### Padrão de teste de schema Zod (test)

**Fonte:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/schemas/identificacao.test.ts` (linhas 1–66)
**Aplicar a:** `src/schemas/resetPassword.test.ts`, `src/schemas/changePassword.test.ts`

```typescript
// Estrutura de arquivo de teste (identificacao.test.ts como template):
import { resetPasswordSchema } from './resetPassword'

describe('resetPasswordSchema', () => {
  it('rejeita senha com menos de 8 caracteres', () => {
    const result = resetPasswordSchema.safeParse({ password: '1234567' })
    expect(result.success).toBe(false)
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path.includes('password'))
      expect(err).toBeDefined()
    }
  })

  it('aceita senha com 8 ou mais caracteres', () => {
    const result = resetPasswordSchema.safeParse({ password: '12345678' })
    expect(result.success).toBe(true)
  })
})
```

### Padrão de teste de componente RTL (test)

**Fonte:** `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/roteiro-unificado/src/components/admin/CompanyCard.test.tsx` (linhas 1–82)
**Aplicar a:** `src/components/admin/ResetPasswordModal.test.tsx`, `src/components/admin/MemberTable.test.tsx`

```typescript
// Estrutura de arquivo de teste de componente (CompanyCard.test.tsx como template):
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemberTable } from './MemberTable'
import type { OrgMemberWithEmail } from '@/types/database'

// Mock de dependências externas (ex: react-router-dom) se necessário
vi.mock('react-router-dom', () => ({ ... }))

// Fixtures tipadas com o tipo correto do banco
const memberCompany: OrgMemberWithEmail = { ... role: 'company' }
const memberAdmin: OrgMemberWithEmail = { ... role: 'admin' }

describe('MemberTable', () => {
  it('exibe botão "Redefinir senha" para membros company', () => {
    render(<MemberTable members={[memberCompany]} isLoading={false} onResetPassword={vi.fn()} />)
    expect(screen.getByRole('button', { name: /redefinir senha/i })).toBeDefined()
  })

  it('NÃO exibe botão "Redefinir senha" para membros admin', () => {
    render(<MemberTable members={[memberAdmin]} isLoading={false} onResetPassword={vi.fn()} />)
    expect(screen.queryByRole('button', { name: /redefinir senha/i })).toBeNull()
  })
})
```

---

## Sem Análogo

Não há arquivos sem análogo nesta fase. Todos os padrões necessários existem no codebase.

---

## Metadados

**Escopo da busca de análogos:**
- `supabase/functions/` — Edge Functions Deno
- `roteiro-unificado/src/components/admin/` — componentes do painel admin
- `roteiro-unificado/src/schemas/` — schemas Zod
- `roteiro-unificado/src/pages/admin/` — páginas admin
- `roteiro-unificado/src/features/form/` — FormLayout e features do formulário

**Arquivos escaneados:** 15
**Data de extração de padrões:** 2026-06-16

**Localização real de arquivos (divergência do CONTEXT.md):**
- Edge Function análoga: `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/supabase/functions/create-user/index.ts` (não dentro de `roteiro-unificado/`)
- Nova Edge Function deve ir em: `/Users/DaviAlves/Documents/Desenvolvimento/Giba/Roteiro Unificado/supabase/functions/reset-user-password/index.ts`
- FormLayout: `roteiro-unificado/src/features/form/FormLayout.tsx` (não `src/components/layouts/`)
- ChangePasswordModal deve ir em: `roteiro-unificado/src/features/form/ChangePasswordModal.tsx` (mesmo diretório do FormLayout que o importa)
