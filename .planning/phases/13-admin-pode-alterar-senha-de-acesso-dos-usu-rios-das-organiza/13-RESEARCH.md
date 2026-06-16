# Phase 13: Admin pode alterar senha de acesso dos usuários das organizações — Pesquisa

**Pesquisada em:** 2026-06-16
**Domínio:** Supabase Auth Admin API · Edge Functions (Deno) · React Hook Form + Zod · Dialog Pattern
**Confiança geral:** HIGH — baseada em leitura direta do código existente + Context7 para Supabase JS v2

---

<user_constraints>
## Restrições do Usuário (de CONTEXT.md)

### Decisões Bloqueadas

- **D-01:** Coluna "Ações" na MemberTable — nova coluna "Ações" com botão "Redefinir senha" por linha, visível apenas para role `company`.
- **D-02:** Sem dialog extra de confirmação — o modal de redefinição já é suficiente. Sem "Tem certeza?" adicional.
- **D-03:** Botão "Alterar senha" no header/sidebar do FormLayout — abre modal inline para usuário company.
- **D-04:** Modal do admin com campo "Nova senha" (mín. 8 chars), mesmo padrão visual do `AddMemberModal`.
- **D-05:** Edge Function com `service_role` — chamar `supabase.auth.admin.updateUserById(userId, { password })` via nova Edge Function seguindo o padrão da `create-user` existente.
- **D-06:** Modal da company com senha atual + nova senha + confirmação — usa `supabase.auth.updateUser({ password })` diretamente no cliente.
- **D-07:** Sem Edge Function para self-service — `supabase.auth.updateUser()` opera com o token autenticado.

### Claude's Discretion

- Nome exato da nova Edge Function (ex.: `reset-user-password` ou `update-user-password`)
- Validação de força de senha (mín. 8 chars seguindo padrão do `addMemberSchema`)
- Posicionamento exato do botão "Alterar senha" no FormLayout (header vs sidebar vs menu)
- Handling de erros específicos da Supabase Auth API

### Deferred Ideas (FORA DO ESCOPO)

- Notificação automática por email quando a senha é redefinida pelo admin
- Log de auditoria de alterações de senha
- Expiração forçada de sessões ativas após reset
</user_constraints>

---

## Resumo

Esta fase implementa dois fluxos de alteração de senha: (1) admin redefine senha de membro `company` via painel `/admin/org/:orgId`, usando uma nova Edge Function com `service_role`; (2) usuário `company` altera sua própria senha via modal no FormLayout, usando `supabase.auth.updateUser()` do client SDK.

A arquitetura está totalmente mapeada pelo código existente. O padrão da Edge Function `create-user` é o template exato para a nova `reset-user-password` — substituindo `admin.createUser()` por `admin.updateUserById()`. No frontend, o padrão `AddMemberModal` (Dialog + useForm + useMutation + useToast) é replicado nos dois novos modais. O fluxo de self-service para o company não exige Edge Function; a verificação de senha atual é responsabilidade da aplicação (Supabase GoTrue v2 suporta `current_password` no corpo de `updateUser`, mas essa verificação depende de configuração do projeto).

**Recomendação primária:** Nomear a Edge Function `reset-user-password` (action-oriented, consistente com o verbo "redefinir" do CONTEXT.md). Botão "Alterar senha" na área do footer da sidebar do FormLayout (abaixo do botão "Sair"), em vez do header, para não ocupar o topbar que já tem `AutosaveIndicator`.

---

## Mapa de Responsabilidade Arquitetural

| Capacidade | Camada Primária | Camada Secundária | Rationale |
|------------|----------------|-------------------|-----------|
| Reset de senha por admin | Edge Function (Deno) | — | Requer `service_role`; client anon não pode chamar `auth.admin.*` |
| Self-service de senha (company) | Client SDK (Browser) | — | Operação autenticada com JWT do próprio usuário via `supabase.auth.updateUser()` |
| Validação dos campos de senha | Frontend (React Hook Form + Zod) | Edge Function (revalida) | Fail-fast no cliente; Edge Function faz revalidação defensiva |
| Controle de acesso ao botão admin | Frontend (condicional por `role`) | — | Botão oculto para `role === 'admin'`; Edge Function não verifica quem chamou (confia no admin autenticado) |
| Estado dos modais | OrgDetail (admin) / FormLayout (company) | — | Cada entry-point gerencia seu próprio estado de modal |

---

## Stack Padrão

### Core — sem novas instalações necessárias

| Biblioteca | Versão atual | Propósito | Justificativa |
|------------|-------------|-----------|---------------|
| `@supabase/supabase-js` | v2.x (instalado) | `auth.admin.updateUserById()` na Edge Function e `auth.updateUser()` no cliente | Único client necessário para ambos os fluxos |
| `react-hook-form` | instalado | Validação do modal de senha | Padrão estabelecido em `AddMemberModal` |
| `zod` + `@hookform/resolvers` | instalados | Schema de validação `resetPasswordSchema` | Mesmo padrão de `addMemberSchema` |
| `@tanstack/react-query` | instalado | `useMutation` para invocar Edge Function | Padrão de `AddMemberModal` |

**Nenhum pacote novo precisa ser instalado.** [VERIFIED: leitura direta do package.json e código existente]

### Package Legitimacy Audit

> Nenhum pacote novo é instalado nesta fase. Seção N/A.

---

## API Supabase Auth — Referência Verificada

### Admin: `auth.admin.updateUserById()` (Edge Function com service_role)

[VERIFIED: Context7 /supabase/supabase-js, GoTrueAdminApi.ts]

```typescript
// Dentro da Edge Function com adminClient (service_role)
const { data: user, error } = await adminClient.auth.admin.updateUserById(
  userId,           // string UUID do usuário
  { password: 'nova_senha_minimo_8_chars' }
)
// Retorno: { data: { user: User }, error: AuthError | null }
```

Erros conhecidos que o handler deve tratar:
- `error.message` contendo `"User not found"` → 404 (userId inválido)
- `error.message` contendo `"Password should be at least 6 characters"` → 400 (senha muito curta — o Supabase verifica no servidor independente da validação frontend)
- Erro genérico de rede/timeout → 500

### Self-service: `auth.updateUser()` (Client SDK, no contexto do usuário logado)

[VERIFIED: Context7 /supabase/supabase-js, GoTrueClient.ts]

```typescript
// No componente React, com o cliente anon + sessão ativa do usuário
const { data, error } = await supabase.auth.updateUser({
  password: 'nova_senha'
  // current_password é suportado pelo tipo UserAttributes mas requer
  // GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD habilitado no projeto Supabase
})
// error: AuthError | null — AuthSessionMissingError se não houver sessão ativa
```

**Importante sobre verificação de senha atual:** [ASSUMED] A flag `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` provavelmente não está habilitada no projeto — o padrão do Supabase hosted é desabilitada. Se não estiver habilitada, a `current_password` passada no corpo é ignorada silenciosamente pelo GoTrue. Isso significa que a "verificação de senha atual" no self-service é implementada no frontend via formulário (UX), mas GoTrue não rejeita a chamada se a senha atual estiver errada. **Recomendação:** Verificar se o requisito de segurança exige validação server-side da senha atual; se sim, implementar via `supabase.auth.signInWithPassword({ email, password: currentPassword })` antes de chamar `updateUser`, e só prosseguir se o login for bem-sucedido.

---

## Padrões de Arquitetura

### Diagrama de Fluxo

```
FLUXO ADMIN:
OrgDetail (state: resetPasswordMemberId)
  └─► MemberTable (prop: onResetPassword)
        └─► [botão "Redefinir senha" por linha, role=company apenas]
              └─► ResetPasswordModal (open, userId, onClose)
                    ├─► useForm + zodResolver(resetPasswordSchema)
                    └─► useMutation
                          └─► supabase.functions.invoke('reset-user-password', { body: { user_id, password } })
                                └─► Edge Function (Deno, service_role)
                                      └─► adminClient.auth.admin.updateUserById(user_id, { password })
                                            └─► [200 OK] → toast.success → modal fecha


FLUXO COMPANY:
FormLayout (sidebar footer)
  └─► [botão "Alterar senha"]
        └─► ChangePasswordModal (open, onClose)
              ├─► useForm + zodResolver(changePasswordSchema) [senha atual + nova + confirmação]
              └─► useMutation
                    ├─► [validação UX: currentPassword correto]
                    └─► supabase.auth.updateUser({ password: newPassword })
                          └─► [200 OK] → toast.success → modal fecha
```

### Estrutura de Arquivos Recomendada

```
supabase/functions/
└── reset-user-password/
    └── index.ts              # Nova Edge Function (espelho de create-user)

src/
├── components/admin/
│   ├── MemberTable.tsx       # MODIFICAR: + coluna Ações + prop onResetPassword
│   └── ResetPasswordModal.tsx # NOVO: modal de redefinição para admin
├── components/form/
│   └── ChangePasswordModal.tsx # NOVO: modal de alteração para company
├── pages/admin/
│   └── OrgDetail.tsx         # MODIFICAR: + estado resetPasswordMemberId + modal
├── features/form/
│   └── FormLayout.tsx        # MODIFICAR: + botão "Alterar senha" + modal state
└── schemas/
    ├── resetPassword.ts      # NOVO: z.string().min(8) para admin
    └── changePassword.ts     # NOVO: senha atual + nova + confirmação com .refine()
```

### Padrão 1: Edge Function `reset-user-password` (espelho de `create-user`)

[VERIFIED: leitura direta de `supabase/functions/create-user/index.ts`]

```typescript
// supabase/functions/reset-user-password/index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabaseUrl = Deno.env.get('SUPABASE_URL')

if (!serviceRoleKey || !supabaseUrl) {
  throw new Error('Missing required environment variables')
}

const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

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

    const { user_id, password } = body as { user_id?: unknown; password?: unknown }

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

    const { data, error } = await adminClient.auth.admin.updateUserById(user_id, { password })

    if (error || !data.user) {
      return new Response(
        JSON.stringify({ error: error?.message ?? 'Failed to update user' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

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

### Padrão 2: Schema Zod para reset de senha (admin)

[VERIFIED: leitura direta de `src/schemas/addMember.ts`]

```typescript
// src/schemas/resetPassword.ts
import { z } from 'zod'

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Senha deve ter no mínimo 8 caracteres'),
})

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
```

### Padrão 3: Schema Zod para alteração de senha (company self-service)

[VERIFIED: padrão `z.refine()` do Zod — knowledge confirmada por uso extenso no projeto]

```typescript
// src/schemas/changePassword.ts
import { z } from 'zod'

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
    newPassword: z.string().min(8, 'Nova senha deve ter no mínimo 8 caracteres'),
    confirmPassword: z.string().min(1, 'Confirmação é obrigatória'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
```

### Padrão 4: Mutation para invocar Edge Function (espelho de AddMemberModal)

[VERIFIED: leitura direta de `src/components/admin/AddMemberModal.tsx`]

```typescript
// Dentro de ResetPasswordModal.tsx
const resetPasswordMutation = useMutation({
  mutationFn: async (data: ResetPasswordFormData) => {
    const { data: fnData, error: fnError } = await supabase.functions.invoke<{ success: boolean }>(
      'reset-user-password',
      { body: { user_id: userId, password: data.password } }
    )
    if (fnError || !fnData?.success) {
      throw new Error('reset_failed')
    }
  },
  onSuccess: () => {
    toast.success('Senha redefinida com sucesso')
    reset()
    onClose()
  },
  onError: () => {
    toast.error('Não foi possível redefinir a senha. Tente novamente.')
  },
})
```

### Padrão 5: Expansão de MemberTable com coluna Ações

[VERIFIED: leitura direta de `src/components/admin/MemberTable.tsx`]

```typescript
// MemberTable — nova assinatura de props
interface MemberTableProps {
  members: OrgMemberWithEmail[] | undefined
  isLoading: boolean
  onResetPassword?: (userId: string) => void  // nova prop opcional
}

// No thead — nova coluna
<th scope="col" className="w-28 px-4 py-3 text-left text-sm font-semibold text-gray-600">
  Ações
</th>

// No tbody — botão por linha, apenas para role company
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
```

### Padrão 6: Estado do modal em OrgDetail (espelho de isAddMemberOpen)

[VERIFIED: leitura direta de `src/pages/admin/OrgDetail.tsx`]

```typescript
// OrgDetail.tsx — novo estado
const [resetPasswordMemberId, setResetPasswordMemberId] = useState<string | null>(null)

// Passagem de callback para MemberTable
<MemberTable
  members={members}
  isLoading={false}
  onResetPassword={(userId) => setResetPasswordMemberId(userId)}
/>

// Modal condicional após os existentes
{resetPasswordMemberId && (
  <ResetPasswordModal
    userId={resetPasswordMemberId}
    open={!!resetPasswordMemberId}
    onClose={() => setResetPasswordMemberId(null)}
  />
)}
```

### Padrão 7: Botão "Alterar senha" no FormLayout (sidebar footer)

[VERIFIED: leitura direta de `src/features/form/FormLayout.tsx`]

O FormLayout tem um footer na sidebar que já contém o botão "Sair". O botão "Alterar senha" deve ser inserido **antes** do botão "Sair" no mesmo footer da sidebar:

```typescript
// FormLayout.tsx — sidebar footer, antes do botão Sair
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

Estado adicional necessário em FormLayout:
```typescript
const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
```

### Anti-Patterns a Evitar

- **Chamar `auth.admin.*` do cliente anon:** Requer `service_role`; o client anon não tem permissão. Sempre via Edge Function.
- **Reutilizar `addMemberSchema` diretamente:** O schema de addMember inclui `email`, que não é necessário aqui. Criar `resetPasswordSchema` separado.
- **Assumir que `current_password` valida server-side:** Sem `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` habilitado, o GoTrue ignora o campo. A verificação da senha atual no self-service requer abordagem alternativa (ver seção de pitfalls).
- **Fechar modal antes da mutation settle:** Chamar `onClose()` em `onSuccess` apenas — nunca no `onClick` do botão de submit.
- **Passar `isLoading: false` hardcoded em MemberTable (OrgDetail linha 79):** A tabela já recebe `isLoading: false` explicitamente — manter esse comportamento ao adicionar a prop `onResetPassword`.

---

## Don't Hand-Roll

| Problema | Não Construir | Usar | Motivo |
|----------|--------------|------|--------|
| Reset de senha server-side | Endpoint REST custom | `supabase.auth.admin.updateUserById()` na Edge Function | GoTrue cuida de hashing, invalidação de tokens e auditoria interna |
| Modal de confirmação/formulário | Div com lógica de foco customizada | `Dialog` + `DialogHeader` + `DialogContent` + `DialogFooter` de `@/components/ui` | Já implementado com Escape, overlay, foco automático e overflow de body |
| Validação de correspondência de senhas | Lógica imperativa no submit | `z.refine()` no schema Zod | Integra com React Hook Form; erro aparece inline no campo `confirmPassword` |
| Toast de feedback | `alert()` ou state manual | `useToast()` de `@/hooks/useToast` | Padrão estabelecido; Toaster já está no root |

---

## Pitfalls Comuns

### Pitfall 1: Verificação de senha atual no self-service não funciona server-side por padrão

**O que dá errado:** O campo `currentPassword` do formulário do `ChangePasswordModal` não é verificado pelo GoTrue se `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` não estiver habilitado. A chamada `supabase.auth.updateUser({ password })` será bem-sucedida mesmo se o usuário digitou uma senha atual incorreta.

**Por que acontece:** O Supabase GoTrue requer configuração explícita para impor verificação de senha atual. [ASSUMED — configuração padrão do projeto não foi verificada]

**Como evitar:** Implementar verificação da senha atual no frontend antes de chamar `updateUser`:
```typescript
// Estratégia de verificação via re-autenticação (sem expor credenciais ao servidor)
// Opção A (mais simples, sem chamada extra):
//   - Aceitar o risco de UX: o campo currentPassword existe mas não valida server-side
//   - Documentar como limitação conhecida
// Opção B (verificação real):
//   - Chamar supabase.auth.signInWithPassword({ email: user.email, password: currentPassword })
//   - Se erro → mostrar "Senha atual incorreta" no campo
//   - Se sucesso → chamar supabase.auth.updateUser({ password: newPassword })
```

**Sinal de alerta:** Se a requirement implícita é "garantir que o usuário conhece a senha atual", usar Opção B.

### Pitfall 2: `supabase.functions.invoke` retorna `error` mesmo com status 400/500

**O que dá errado:** `fnError` pode ser nulo mesmo quando a Edge Function retornou um erro HTTP, se o corpo de resposta for JSON válido. O check deve ser em `fnData?.success` além de `fnError`.

**Por que acontece:** `invoke()` do Supabase JS só popula `fnError` para erros de rede ou quando a Edge Function retorna um formato de erro específico. [VERIFIED: padrão já correto em AddMemberModal — verificar ambos `fnError` e `fnData`]

**Como evitar:** Sempre checar `if (fnError || !fnData?.success)` como no padrão da `AddMemberModal`.

### Pitfall 3: MemberTable recebe `isLoading: false` hardcoded em OrgDetail

**O que dá errado:** A linha 79 do `OrgDetail.tsx` atual já passa `isLoading={false}` explicitamente para `MemberTable`. Ao adicionar `onResetPassword`, manter esse hardcode — não remover ou alterar o comportamento existente.

**Por que acontece:** [VERIFIED: leitura direta de OrgDetail.tsx linha 79] — `MemberTable members={members} isLoading={false}` — o loading state é gerenciado pelo próprio OrgDetail com Spinner.

**Como evitar:** Ao modificar `MemberTable`, não alterar a prop `isLoading` — apenas adicionar a nova prop `onResetPassword`.

### Pitfall 4: Deploy da Edge Function exige `supabase functions deploy`

**O que dá errado:** A nova função não aparece no painel nem funciona em produção se o arquivo foi criado mas não deployado.

**Por que acontece:** Edge Functions precisam de deploy explícito via CLI — não é automático.

**Como evitar:** Incluir step explícito de `supabase functions deploy reset-user-password` no plano, tanto para ambiente de desenvolvimento local quanto para produção.

### Pitfall 5: Modal em FormLayout não tem acesso ao `user.email` facilmente

**O que dá errado:** Se a Opção B (verificação de senha atual via `signInWithPassword`) for escolhida no `ChangePasswordModal`, é necessário o email do usuário. O `useAuth()` expõe `user: User | null`, que contém `user.email`.

**Por que acontece:** `useAuth()` retorna o objeto `User` do Supabase, que inclui `email`. [VERIFIED: leitura de AuthProvider.tsx — `user: User | null` está no contexto]

**Como evitar:** Passar `user.email` do `useAuth()` como prop para o `ChangePasswordModal`, ou acessar via hook dentro do modal se ele for renderizado dentro do `AuthProvider` (o que é o caso — FormLayout está dentro do router autenticado).

---

## Inventário de Estado em Runtime

> Fase de funcionalidade nova — não é rename/refactor. Seção N/A.

---

## Disponibilidade de Ambiente

| Dependência | Requerida por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|----------|
| Supabase CLI | Deploy da Edge Function | [ASSUMED: sim, usado nas fases anteriores] | — | — |
| `supabase functions deploy` | Fase 13 | [ASSUMED: sim] | — | — |
| Supabase project (remote) | Edge Function em produção | [ASSUMED: configurado] | — | — |

**Dependências sem fallback:** Nenhuma — toda a lógica de código pode ser escrita e testada localmente antes do deploy.

---

## Arquitetura de Validação (Nyquist)

### Framework de Testes

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest + jsdom |
| Arquivo de config | `roteiro-unificado/vitest.config.ts` |
| Setup | `src/test-setup.ts` |
| Comando rápido | `cd roteiro-unificado && npm test -- --run` |
| Suite completa | `cd roteiro-unificado && npm test -- --run` |

### Mapeamento de Requisitos → Testes

| ID | Comportamento | Tipo de Teste | Comando |
|----|--------------|--------------|---------|
| PASS-01 | `resetPasswordSchema` valida mínimo 8 chars | unit | `npm test -- --run src/schemas/resetPassword.test.ts` |
| PASS-02 | `changePasswordSchema` valida correspondência de senhas | unit | `npm test -- --run src/schemas/changePassword.test.ts` |
| PASS-03 | `ResetPasswordModal` exibe erro quando mutation falha | unit (rtl) | `npm test -- --run src/components/admin/ResetPasswordModal.test.tsx` |
| PASS-04 | `MemberTable` exibe botão "Redefinir senha" para role `company` e oculta para `admin` | unit (rtl) | `npm test -- --run src/components/admin/MemberTable.test.tsx` |

### Gaps da Wave 0

- [ ] `src/schemas/resetPassword.test.ts` — cobre PASS-01
- [ ] `src/schemas/changePassword.test.ts` — cobre PASS-02
- [ ] `src/components/admin/ResetPasswordModal.test.tsx` — cobre PASS-03
- [ ] `src/components/admin/MemberTable.test.tsx` — cobre PASS-04 (arquivo novo; `MemberTable` não tem teste existente)

---

## Domínio de Segurança

### Categorias ASVS Aplicáveis

| Categoria ASVS | Aplica | Controle Padrão |
|----------------|--------|----------------|
| V2 Autenticação | sim | `supabase.auth.admin.updateUserById()` — GoTrue gerencia hashing (bcrypt) |
| V3 Gerenciamento de Sessão | parcial | `updateUser` do client SDK não invalida sessões ativas em outros dispositivos por padrão [ASSUMED] |
| V4 Controle de Acesso | sim | Botão "Redefinir senha" apenas para `role === 'company'`; Edge Function confia em quem a chama (admin autenticado via JWT anon) |
| V5 Validação de Input | sim | Zod valida mínimo 8 chars no cliente; Edge Function revalida no servidor |
| V6 Criptografia | sim — não hand-roll | GoTrue/bcrypt — nunca implementar hashing customizado |

### Padrões de Ameaça Conhecidos

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Admin redefinir senha de outro admin | Elevation of Privilege | Botão "Redefinir senha" oculto para `role === 'admin'`; nenhuma validação server-side na Edge Function (risco aceito para piloto com poucos admins) |
| Usuário company alterar senha de outro usuário | Tampering | `supabase.auth.updateUser()` opera no JWT do usuário logado — GoTrue garante que só o próprio usuário pode alterar sua senha via esse endpoint |
| Chamada direta à Edge Function com `user_id` de admin | Tampering | [ASSUMED] — a Edge Function não verifica o role do `user_id` alvo; qualquer usuário que tenha acesso ao anon key e ao user_id de um admin pode redefinir a senha de um admin via chamada direta. Para o piloto (5 construtoras, ambiente controlado) o risco é aceitável. Mitigação futura: verificar role do `user_id` alvo dentro da Edge Function antes de prosseguir. |
| Injeção de `user_id` malformado | Tampering | Validação UUID via regex na Edge Function (mesmo padrão de `create-user`) |

---

## Exemplos de Código Verificados

### Invocação da Edge Function no cliente

[VERIFIED: Context7 /supabase/supabase-js, FunctionsClient README]

```typescript
const { data, error } = await supabase.functions.invoke<{ success: boolean }>(
  'reset-user-password',
  { body: { user_id: 'uuid-do-membro', password: 'novaSenha123' } }
)
```

### Self-service (client SDK)

[VERIFIED: Context7 /supabase/supabase-js, GoTrueClient.ts]

```typescript
const { data, error } = await supabase.auth.updateUser({
  password: 'novaSenha123'
})
// error: AuthError | null
// AuthSessionMissingError se sessão expirou
```

### Dialog primitive (padrão existente)

[VERIFIED: leitura direta de `src/components/ui/dialog.tsx`]

```typescript
<Dialog open={open} onClose={onClose}>
  <DialogHeader>
    <DialogTitle>Redefinir senha</DialogTitle>
    <DialogDescription>
      Digite a nova senha para {memberEmail}.
    </DialogDescription>
  </DialogHeader>
  <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <DialogContent className="flex flex-col gap-4">
      {/* campos */}
    </DialogContent>
    <DialogFooter>
      <Button type="button" variant="secondary" onClick={onClose} disabled={isPending}>Cancelar</Button>
      <Button type="submit" variant="primary" isLoading={isPending}>Salvar</Button>
    </DialogFooter>
  </form>
</Dialog>
```

---

## Estado da Arte

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|-----------------|----------------|-------------|---------|
| `onSuccess` no `useQuery` (TanStack v4) | `useEffect([query.data])` para hidratação | TanStack Query v5 | Não aplicável a esta fase — mas padrão a seguir se usar queries |
| `manualChunks` no Vite | `rolldownOptions.output.codeSplitting.groups` | Vite 8 | Não aplicável a esta fase |

**Nada depreciado** relevante para os padrões desta fase. Todos os padrões de Dialog, useMutation e useToast são os mesmos estabelecidos nas fases anteriores.

---

## Log de Suposições

| # | Afirmação | Seção | Risco se Errado |
|---|-----------|-------|----------------|
| A1 | `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` não está habilitado no projeto — `current_password` é ignorada pelo GoTrue | Pitfall 1, API Supabase Auth | Se habilitada, a implementação do self-service precisa incluir `current_password` no corpo do `updateUser()` — mudança pequena mas necessária |
| A2 | `supabase functions deploy` está disponível e o projeto remoto está configurado | Disponibilidade de Ambiente | Se não estiver, o plano precisa incluir step de configuração do Supabase CLI |
| A3 | `updateUser()` do client SDK não invalida sessões ativas em outros dispositivos | Segurança V3 | Sessões paralelas permanecem válidas após mudança de senha — aceitável para o piloto |
| A4 | Edge Function `reset-user-password` não precisa verificar o role do `user_id` alvo (risco aceito para piloto) | Domínio de Segurança | Um usuário com acesso ao anon key poderia redefinir a senha de um admin via chamada direta — mitigação futura |

---

## Questões em Aberto

1. **Verificação de senha atual no self-service — Opção A (UX apenas) vs Opção B (re-autenticação)?**
   - O que sabemos: GoTrue não valida `current_password` por padrão.
   - O que está indefinido: qual nível de segurança é aceitável para o piloto (5 construtoras).
   - Recomendação: Implementar Opção B (`signInWithPassword` antes de `updateUser`) — custo mínimo de implementação, segurança correta para o contexto.

2. **Email do membro visível no `ResetPasswordModal`?**
   - O que sabemos: `OrgMemberWithEmail` inclui `email`; o modal recebe `userId`.
   - O que está indefinido: o CONTEXT.md menciona "modal com campo 'Nova senha'" mas não diz se o email do membro é exibido para contexto do admin.
   - Recomendação: Passar também `memberEmail?: string` para o modal e exibi-lo em `DialogDescription` — melhora UX do admin confirmando para qual usuário está redefinindo.

---

## Fontes

### Primárias (HIGH confidence)
- Context7 `/supabase/supabase-js` — `auth.admin.updateUserById()`, `auth.updateUser()`, `functions.invoke()`
- `supabase/functions/create-user/index.ts` — template da Edge Function (leitura direta)
- `src/components/admin/AddMemberModal.tsx` — padrão Dialog + useMutation + useToast (leitura direta)
- `src/components/admin/MemberTable.tsx` — estrutura atual da tabela (leitura direta)
- `src/pages/admin/OrgDetail.tsx` — gerenciamento de estado de modais (leitura direta)
- `src/features/form/FormLayout.tsx` — estrutura do sidebar e footer (leitura direta)
- `src/schemas/addMember.ts` — padrão de schema Zod para senha (leitura direta)
- `src/components/ui/dialog.tsx` — primitivo Dialog (leitura direta)
- `src/types/database.ts` — tipo `OrgMemberWithEmail` com `user_id` (leitura direta)
- `src/features/auth/AuthProvider.tsx` — `user: User | null` disponível via `useAuth()` (leitura direta)

### Secundárias (MEDIUM confidence)
- Nenhuma — todos os achados críticos foram verificados em fontes primárias.

### Terciárias (LOW confidence)
- Comportamento de `GOTRUE_SECURITY_UPDATE_PASSWORD_REQUIRE_CURRENT_PASSWORD` — documentação oficial não verificada; baseado em knowledge de training sobre padrão Supabase hosted. [ASSUMED]

---

## Metadados

**Breakdown de confiança:**
- Stack e bibliotecas: HIGH — nenhum pacote novo; tudo já instalado e em uso
- Padrões de Edge Function: HIGH — template `create-user` lido diretamente
- Padrões de modal/mutation: HIGH — `AddMemberModal` e `ArchiveOrgDialog` lidos diretamente
- API Supabase Auth: HIGH — verificado via Context7 /supabase/supabase-js
- Comportamento de self-service (senha atual): LOW-MEDIUM — configuração do GoTrue não verificada

**Data da pesquisa:** 2026-06-16
**Válido até:** 2026-07-16 (stack estável; mudanças na API Supabase são raras)
