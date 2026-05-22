# Phase 4: Gestão de Organizações & Painel Admin - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 04-gest-o-de-organiza-es-painel-admin
**Areas discussed:** Adicionar usuário à org, Modal vs página para criar org, Sidebar: escopo na Phase 4

---

## Adicionar usuário à org

| Option | Description | Selected |
|--------|-------------|----------|
| Edge Function | Supabase Edge Function com service_role em variável de ambiente — cliente chama com anon key. Seguro, exige deploy de uma Edge Function adicional. | ✓ |
| Criar manualmente no Supabase dashboard | Admin cria usuários no dashboard Supabase; app apenas vincula o user_id à org via INSERT em org_members. Zero código de criação de usuário. | |
| inviteUserByEmail() via Edge Function | Usuário recebe email de convite e define a própria senha. Melhor UX de onboarding, mas ainda exige Edge Function. | |

**User's choice:** Edge Function com service_role

---

| Option | Description | Selected |
|--------|-------------|----------|
| Senha temporária | Admin define email + senha inicial; usuário faz login imediato. Simples para o piloto. | ✓ |
| Convite por email (inviteUserByEmail) | Usuário recebe email com link para definir a própria senha. Fluxo mais profissional mas requer que email chegue e usuário clique. | |

**User's choice:** Senha temporária

---

## Modal vs página para criar org

| Option | Description | Selected |
|--------|-------------|----------|
| Modal/Dialog | Dialog sobreposto na listagem — admin não perde contexto da lista. Fluxo rápido para o piloto. | ✓ |
| Página separada /admin/orgs/new | Rota dedicada. Mais espaço para campos extras no futuro. Requer nova rota no router. | |

**User's choice:** Modal/Dialog

---

| Option | Description | Selected |
|--------|-------------|----------|
| Fecha modal + atualiza lista | TanStack Query refetch automático após INSERT — org nova aparece na tabela sem reload. | ✓ |
| Fecha modal + navega para detalhe da org | Admin vai diretamente para /admin/orgs/:orgId para já adicionar membros. | |

**User's choice:** Fecha modal + atualiza lista

---

## Sidebar: escopo na Phase 4

| Option | Description | Selected |
|--------|-------------|----------|
| Sidebar completa já | Montar todos os itens (Organizações, Dashboard, Exportações) — itens de fases futuras desabilitados/cinza com tooltip "Em breve". Evita refactor de layout em Phase 9. | ✓ |
| Apenas Organizações agora | Sidebar minimalista com só o que funciona. Expandir em Phase 9. | |

**User's choice:** Sidebar completa já (todos os itens desde Phase 4)

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sempre visível | Sidebar estática sem toggle. Simples para o piloto. | ✓ |
| Colapsável | Botão para encolher sidebar e ganhar espaço. | |

**User's choice:** Sempre visível

---

## Claude's Discretion

- Dialog/Modal component: criar novo `src/components/ui/dialog.tsx` (nenhum existe ainda)
- Validação CNPJ: somente formato 14 dígitos, sem algoritmo de dígito verificador
- Sidebar links desabilitados: `href="#"` com `aria-disabled="true"` e `cursor-not-allowed`
- Paginação: client-side simples (5 empresas no piloto)
- Layout do admin: `AdminLayout` como wrapper com sidebar + header, filho do Outlet de AdminRoute

## Deferred Ideas

- Edição de nome/CNPJ de org existente — fora do escopo Phase 4
- Filtro/busca de orgs por nome — Phase 9 (DASH-05)
- Preview de avaliação da empresa no detalhe da org — Phase 9 (depende de Phase 8)
