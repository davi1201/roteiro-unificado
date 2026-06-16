# Phase 13: Admin pode alterar senha de acesso dos usuários das organizações - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-06-16
**Phase:** 13-admin-pode-alterar-senha-de-acesso-dos-usu-rios-das-organiza
**Areas discussed:** Ponto de entrada na UI, Fluxo da nova senha

---

## Ponto de entrada na UI

### Onde o botão aparece para o admin

| Option | Description | Selected |
|--------|-------------|----------|
| Coluna Ações na MemberTable | Nova coluna "Ações" na tabela de membros com botão por linha | ✓ |
| Botão no hover da linha | Botão aparece ao passar o mouse sobre a linha do membro | |
| Menu de contexto (...) | Ícone '...' por linha que abre dropdown com opções | |

**User's choice:** Coluna Ações na MemberTable
**Notes:** Padrão visual consistente com OrgTable existente.

---

### Escopo do botão (roles)

| Option | Description | Selected |
|--------|-------------|----------|
| Apenas role company | Botão só para membros com role company | ✓ (via freeform) |
| Todos os membros | Botão para qualquer membro independente do role | |

**User's choice:** Freeform — "a ideia é que na tabela de membros da construtora seja possível alterar a senha ou criar uma senha para o user, o role admin altera isso pro company e o company tbm pode alterar sua própria senha"
**Notes:** Revelou dois fluxos distintos: admin reseta senha de company; company altera a própria.

---

### Onde a company altera a própria senha

| Option | Description | Selected |
|--------|-------------|----------|
| Header/menu do FormLayout | Botão no header/sidebar do FormLayout onde a construtora preenche o formulário | ✓ |
| Página /perfil separada | Rota nova /form/:orgId/profile | |
| Apenas admin reseta | Company não tem auto-serviço | |

**User's choice:** Header/menu do FormLayout

---

## Fluxo da nova senha

### Admin define nova senha para company

| Option | Description | Selected |
|--------|-------------|----------|
| Admin digita a nova senha num modal | Modal simples com campo "Nova senha" via Edge Function service_role | ✓ |
| Sistema gera senha aleatória | Senha gerada e exibida ao admin para copiar | |
| Envio de email de reset para o usuário | supabase.auth.resetPasswordForEmail() — usuário recebe link | |

**User's choice:** Admin digita a nova senha num modal

---

### Company altera a própria senha

| Option | Description | Selected |
|--------|-------------|----------|
| Modal: senha atual + nova senha + confirmar | Exige senha atual para verificação de segurança | ✓ |
| Modal: apenas nova senha + confirmar | Sem pedir senha atual, mais simples | |

**User's choice:** Modal com senha atual + nova senha + confirmação

---

### Dialog de confirmação extra (fluxo admin)

| Option | Description | Selected |
|--------|-------------|----------|
| Não — o modal já é a confirmação | Abrir modal + digitar + salvar já confirma | ✓ |
| Sim — dialog "Tem certeza?" | Confirmação extra antes do modal | |

**User's choice:** Não — o modal já é a confirmação

---

## Claude's Discretion

- Nome exato da nova Edge Function
- Validação de força de senha além do mínimo 8 chars
- Posicionamento exato do botão "Alterar senha" no FormLayout (header vs sidebar)
- Handling de erros específicos da Supabase Auth API
- Expiração forçada de sessões ativas após reset

## Deferred Ideas

- Notificação automática por email ao usuário quando senha é redefinida pelo admin
- Log de auditoria de alterações de senha
