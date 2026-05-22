# Phase 4: Gestão de Organizações & Painel Admin - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Construir o painel administrativo interno: layout shell com sidebar (incluindo itens para fases futuras desabilitados), listagem de organizações, modal de criação de org, página de detalhe com gerenciamento de membros, e desativação de org. O admin consegue criar construtoras, adicionar usuários via Edge Function segura (service_role), e arquivar orgs. Nenhuma UI de formulário de avaliação ou dashboard de prontidão nesta fase.

</domain>

<decisions>
## Implementation Decisions

### Adicionar usuário à org
- **D-01:** Criação de usuário via **Supabase Edge Function** — a `service_role` key NÃO pode estar no código do cliente (browser). Edge Function criada em `supabase/functions/create-user/index.ts`, recebe `{ email, password, org_id }` e chama `adminClient.auth.admin.createUser()` com service_role em variável de ambiente da função.
- **D-02:** Fluxo: **senha temporária** definida pelo admin no formulário — usuário recebe email + senha e pode fazer login imediatamente. Não usar `inviteUserByEmail()` nesta fase.
- **D-03:** Após criar usuário via Edge Function, cliente faz INSERT em `org_members` com o `user_id` retornado + `org_id` + `role = 'company'`.

### Criação de organização
- **D-04:** Criação de nova org via **Modal/Dialog** sobreposto na listagem — admin não perde contexto da tabela. Não criar rota `/admin/orgs/new`.
- **D-05:** Após criação bem-sucedida: **fechar modal + invalidar TanStack Query** para refetch automático da listagem. Org nova aparece na tabela sem reload de página.

### Sidebar do painel admin
- **D-06:** Sidebar **completa desde Phase 4** — montar todos os itens do ROADMAP (Organizações, Dashboard, Exportações) na estrutura de navegação. Itens de fases futuras (Dashboard, Exportações) renderizados como links desabilitados/cinza com tooltip "Em breve".
- **D-07:** Sidebar **sempre visível** (sem botão de colapso). Layout admin não precisa de sidebar colapsável para o piloto.

### Claude's Discretion
- **Dialog component**: criar novo componente `src/components/ui/dialog.tsx` (usando Radix UI Primitive ou implementação simples com `role="dialog"`, `aria-modal`). Nenhum Dialog existe ainda na lib de UI.
- **Validação CNPJ**: somente formato (14 dígitos numéricos, sem pontuação ou máscara) — não implementar algoritmo de dígito verificador para o piloto. Regex: `/^\d{14}$/` ou com formatação `XX.XXX.XXX/XXXX-XX`.
- **Sidebar navigation links**: "Organizações" → `/admin/dashboard` (rota atual do painel); "Dashboard" e "Exportações" → `#` com `aria-disabled="true"` e `cursor-not-allowed`.
- **Layout admin vs layout autenticado**: criar `AdminLayout` como componente wrapper com sidebar + header; as rotas filhas de `AdminRoute` usam este layout — não interferir com `ProtectedRoute` que envolve as rotas de `/form/:orgId`.
- **Paginação**: client-side simples para o piloto (5 empresas) — não implementar cursor pagination ou server-side pagination.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e escopo
- `.planning/REQUIREMENTS.md` §ORG (ORG-03) — requisito de gerenciamento de orgs pelo painel interno
- `.planning/ROADMAP.md` §Phase 4 — planos prescritos: layout, listagem, criação modal, detalhe, desativação

### Código existente (reutilizar — não recriar)
- `roteiro-unificado/src/lib/supabase.ts` — cliente Supabase tipado; usar para queries de orgs/membros
- `roteiro-unificado/src/types/database.ts` — tipos TypeScript das tabelas `orgs` e `org_members`
- `roteiro-unificado/src/components/ui/index.ts` — barrel export de Button, Input, Card, Badge, Spinner, Skeleton — importar daqui
- `roteiro-unificado/src/hooks/useToast.ts` — toast.success()/error() para feedback de ações admin
- `roteiro-unificado/src/features/auth/useAuth.ts` — hook de auth; usar para nome do admin no header e logout

### Código existente (modificar)
- `roteiro-unificado/src/router.tsx` — adicionar rotas admin novas (e.g. `/admin/orgs`, se necessário) dentro do bloco `AdminRoute`; substituir placeholders "Phase 4" por componentes reais

### Segurança crítica
- `supabase/functions/` — diretório onde a Edge Function `create-user` deve ser criada; Edge Function usa `SUPABASE_SERVICE_ROLE_KEY` como variável de ambiente, nunca exposta ao cliente

### Referência de roteamento
- `roteiro-unificado/src/components/routing/AdminRoute.tsx` — guard existente que envolve rotas admin; `AdminLayout` é filho do `Outlet` desta rota

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` (`src/components/ui/button.tsx`) — variantes `primary`, `secondary`, `ghost`; usar `primary` em botões de ação (Nova Organização, Salvar, Convidar)
- `Input` (`src/components/ui/input.tsx`) — campos de nome, CNPJ, email, senha nos formulários
- `Card` (`src/components/ui/card.tsx`) — base para cards de conteúdo na sidebar e área principal
- `Badge` (`src/components/ui/badge.tsx`) — status de org (ativa/arquivada) e role de membro
- `Spinner` / `Skeleton` — loading states em listagens e modais
- `useToast` (`src/hooks/useToast.ts`) — feedback após criar org, adicionar membro, arquivar

### Established Patterns
- TanStack Query já configurado — usar `useQuery` para buscar orgs/membros, `useMutation` para INSERT/UPDATE; `queryClient.invalidateQueries()` após mutações
- Tokens de cor via `@theme {}` — `bg-primary` (#123B66), `text-accent` (#F28C28); nunca hardcodar hex
- Alias `@/` — importar sempre via `@/components/ui`, `@/lib/supabase`, etc.
- React Hook Form + Zod — padrão estabelecido em Phase 3 (Login); usar para formulários de criação de org e adição de membro

### Integration Points
- `router.tsx` — AdminRoute já envolve `/admin/dashboard` e `/admin/orgs/:orgId`; Phase 4 popula esses placeholders
- `AdminRoute.tsx` — Outlet já presente; `AdminLayout` conecta aqui como wrapper de conteúdo
- `useAuth` — expõe `{ user, role, signOut }` para o header do admin mostrar nome e botão de logout

</code_context>

<specifics>
## Specific Ideas

- Sidebar fixa à esquerda com largura ~240px; área de conteúdo ocupa o resto (`flex-1`)
- Header do admin: nome do usuário admin (de `useAuth`) + botão "Sair" à direita
- Tabela de orgs: linhas clicáveis que navegam para `/admin/orgs/:orgId`; botão "Arquivar" na linha com dialog de confirmação
- Modal de criação: campos `nome` (obrigatório) e `cnpj` (14 dígitos, obrigatório); botão "Criar" com Spinner inline durante submit
- Página de detalhe (`/admin/orgs/:orgId`): título com nome da org, tabela de membros (email, role, data de entrada), formulário de adição de membro (email + senha temporária) abaixo ou em modal separado

</specifics>

<deferred>
## Deferred Ideas

- **Edição de nome/CNPJ da org** — não incluído no escopo do ROADMAP Phase 4; pode ser adicionado em fase de polimento
- **Filtro/busca de orgs por nome** — prescrito para Phase 9 (DASH-05); não implementar aqui
- **Visualização da avaliação da empresa no detalhe da org** — dado que assessment data só existe após Phase 8; campo deferred para Phase 9

</deferred>

---

*Phase: 04-gest-o-de-organiza-es-painel-admin*
*Context gathered: 2026-05-22*
