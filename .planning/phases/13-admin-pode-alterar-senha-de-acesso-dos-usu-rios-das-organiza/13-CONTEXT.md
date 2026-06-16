# Phase 13: Admin pode alterar senha de acesso dos usuários das organizações - Context

**Gathered:** 2026-06-16
**Status:** Ready for planning

<domain>
## Phase Boundary

Dois fluxos de alteração de senha:

1. **Admin → company**: Admin interno redefine a senha de qualquer membro com role `company` diretamente pelo painel `/admin/org/:orgId`, via modal com campo de nova senha, sem depender do fluxo de recuperação por email.

2. **Company → própria**: Usuário da construtora (role `company`) altera sua própria senha via botão no header/sidebar do `FormLayout`, num modal que exige senha atual + nova senha + confirmação.

Não inclui: remoção de membros, alteração de email, self-service de admin, ou notificações por email.

</domain>

<decisions>
## Implementation Decisions

### Ponto de entrada — Admin

- **D-01:** **Coluna "Ações" na MemberTable** — nova coluna "Ações" na tabela de membros do `OrgDetail` com botão "Redefinir senha" por linha. Botão visível apenas para membros com role `company` (admin não pode ter senha redefinida pelo painel).
- **D-02:** **Sem dialog extra de confirmação** — o modal de redefinição já é a confirmação. Abrir modal + digitar senha + clicar "Salvar" = intenção clara. Dialog "Tem certeza?" seria friction desnecessária.

### Ponto de entrada — Company

- **D-03:** **Botão "Alterar senha" no header/sidebar do FormLayout** — área onde a construtora já está logada e preenchendo o formulário. Abre modal inline.

### Fluxo da nova senha — Admin redefine para company

- **D-04:** **Admin digita nova senha num modal** — modal simples com campo "Nova senha" (mín. 8 chars). Mesmo padrão visual do `AddMemberModal`. Admin define e repassa ao usuário por fora (ex.: via WhatsApp/email manual).
- **D-05:** **Edge Function com service_role** — chamar `supabase.auth.admin.updateUserById(userId, { password })` via nova Edge Function (não usar o cliente anon). Segue o mesmo padrão da Edge Function `create-user` já deployada.

### Fluxo da nova senha — Company altera a própria

- **D-06:** **Modal com senha atual + nova senha + confirmação** — usuário informa senha atual (verificação de segurança), nova senha e confirmação. Usa `supabase.auth.updateUser({ password })` diretamente no cliente (opera no JWT do próprio usuário, sem Edge Function).
- **D-07:** **Sem Edge Function para self-service** — `supabase.auth.updateUser()` do client SDK já opera com o token autenticado do usuário. Sem necessidade de service_role.

### Claude's Discretion

- Nome exato da nova Edge Function (ex.: `reset-user-password` ou `update-user-password`)
- Validação de força de senha (mín. 8 chars seguindo padrão do `addMemberSchema`)
- Posicionamento exato do botão "Alterar senha" no FormLayout (header vs sidebar vs menu)
- Handling de erros específicos da Supabase Auth API

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Padrão existente de Edge Function (referência obrigatória)
- `roteiro-unificado/src/components/admin/AddMemberModal.tsx` — padrão `useMutation` + `supabase.functions.invoke()` + `useToast` para ações admin; modal com campo de senha
- `roteiro-unificado/src/schemas/addMember.ts` — schema Zod de senha (validação mínimo 8 chars a reutilizar)

### Painel admin onde a feature vive
- `roteiro-unificado/src/pages/admin/OrgDetail.tsx` — página onde `MemberTable` será expandida com coluna Ações
- `roteiro-unificado/src/components/admin/MemberTable.tsx` — tabela a modificar (adicionar coluna + botão por linha)
- `roteiro-unificado/src/types/database.ts` — tipo `OrgMemberWithEmail` que passa para MemberTable (inclui `user_id` necessário para a Edge Function)

### FormLayout (ponto de entrada para company)
- `roteiro-unificado/src/components/layouts/FormLayout.tsx` — onde o botão "Alterar senha" será adicionado para role company

### UI components disponíveis
- `roteiro-unificado/src/components/ui/` — Dialog, Button, Input, useToast — todos reutilizáveis sem modificação

### Roadmap e requisitos
- `.planning/ROADMAP.md` §Phase 13 — goal e dependências

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Dialog` + `DialogHeader` + `DialogContent` + `DialogFooter` — primitivo já usado em `AddMemberModal` e `ArchiveOrgDialog`; reutilizar diretamente
- `useMutation` + `supabase.functions.invoke()` — padrão estabelecido em `AddMemberModal` para chamar Edge Functions
- `useToast()` — hook de toast já wired no root; usar para feedback de sucesso/erro
- `addMemberSchema` (Zod) — validação de senha já existe; reutilizar ou extender para `resetPasswordSchema`

### Established Patterns
- Edge Functions com `service_role` isolado no Deno runtime — `create-user` é o template; nova `reset-user-password` seguirá o mesmo padrão
- `React Hook Form` + `zodResolver` — validação de formulários; usar no modal de nova senha
- `OrgMemberWithEmail.user_id` — `user_id` do membro já está disponível via `useOrgDetail` (necessário para a Edge Function)

### Integration Points
- `MemberTable` recebe `members: OrgMemberWithEmail[]` — adicionar prop `onResetPassword?: (userId: string) => void` para expor o trigger
- `OrgDetail` gerencia state dos modais (`isAddMemberOpen`, `isArchiveOpen`) — adicionar `resetPasswordMemberId` seguindo o mesmo padrão
- `FormLayout` — adicionar botão no header/sidebar; abre modal de change-password usando `supabase.auth.updateUser()`

</code_context>

<specifics>
## Specific Ideas

- O fluxo admin é análogo ao `AddMemberModal` — copiar estrutura do modal e adaptar para redefinição
- Company self-service usa Supabase client SDK diretamente (sem Edge Function) — mais simples
- Botão "Redefinir senha" na tabela deve ser desabilitado/oculto para membros com role `admin`

</specifics>

<deferred>
## Deferred Ideas

- Notificação automática por email ao usuário quando a senha é redefinida pelo admin — fora do escopo v1
- Log de auditoria de alterações de senha — fora do escopo v1
- Expiração forçada de sessões ativas após reset — não discutido; Claude decide se implementar ou não

</deferred>

---

*Phase: 13-admin-pode-alterar-senha-de-acesso-dos-usu-rios-das-organiza*
*Context gathered: 2026-06-16*
