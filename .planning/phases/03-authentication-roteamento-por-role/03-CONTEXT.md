# Phase 3: Authentication & Roteamento por Role - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Implementar autenticação completa com Supabase Auth: login com email/senha, persistência de sessão via `createBrowserClient`, recuperação de senha por email, e roteamento automático pós-login baseado em role (`admin` → `/admin/dashboard`, construtora → `/form/:orgId`). Inclui `AuthProvider`, `ProtectedRoute`, `AdminRoute`, hook `useAuth()` e hook `useUser()`.

Esta fase entrega o mecanismo de acesso ao app — sem UI de formulário, dashboard ou admin. Output: usuário autenticado chega à rota correta; usuário não autenticado é bloqueado em qualquer rota protegida.

</domain>

<decisions>
## Implementation Decisions

### Layout da página de Login
- **D-01:** Layout **card centralizado simples** — fundo azul sólido `#123B66` cobrindo 100vh, card branco centralizado vertical e horizontalmente. Usar `Card` component existente (`src/components/ui/card.tsx`).
- **D-02:** Card contém: logotipo/nome **"Roteiro Unificado"** com subtítulo **"Piloto Sinduscon"** acima do formulário (sem ilustrações externas). Campo email, campo senha, link "Esqueci minha senha", botão "Entrar".
- **D-03:** Link **"Esqueci minha senha"** posicionado abaixo do campo de senha, alinhado à direita — comportamento esperado pelo usuário, leva para `/forgot-password`.

### Erros de autenticação
- **D-04:** Mensagens de erro de autenticação (credenciais inválidas, conta não encontrada): **genéricas** — sempre exibir "Email ou senha inválidos" independente do motivo. Não revelar se email está ou não cadastrado.
- **D-05:** Erro de autenticação do servidor exibido via **Toast** (Toaster já configurado em `main.tsx` — não adicionar novo). Usar `useToast` com `toast.error()`.
- **D-06:** Erros de **validação de campo** (email inválido, campo vazio) via Zod/React Hook Form exibidos **inline abaixo de cada campo** — padrão consistente com fases futuras do formulário.
- **D-07:** Botão "Entrar" durante chamada Supabase Auth: **disabled + Spinner inline** (usar `Spinner` component existente, importar de `@/components/ui`). Previne duplo-submit.

### Estado de carregamento inicial (auth flicker)
- **D-08:** Durante inicialização (~200ms antes de `onAuthStateChange` disparar): exibir **Spinner full-screen** — fundo azul `#123B66`, `Spinner` branco centralizado. Usa `isLoading` do AuthContext. Evita flash de redirect para `/login` para usuários já autenticados.
- **D-09:** Sessão expirada durante uso do app: **redirect silencioso para `/login`** — `AuthProvider` detecta estado `SIGNED_OUT` via `onAuthStateChange`, limpa sessão, React Router redireciona automaticamente.
- **D-10:** Após **logout**: redirect direto para `/login` sem toast de confirmação. Simples e imediato.

### Claude's Discretion
- **Fluxo de reset de senha**: após redefinição bem-sucedida, redirecionar para `/login` com toast de sucesso "Senha redefinida com sucesso"; página `/reset-password` recebe token via query string (`?token=xxx`) do email; token expirado exibe mensagem de erro e link para solicitar novo email.
- **Namespace da Zustand store**: implementar `form-progress-${tenantId}` como persist key no `formStore` ao invés de `form-progress` genérico — evitar cross-tenant leakage quando usuário alterna entre contas (pendente registrado no STATE.md).
- **Identificação de admins**: via `role === 'admin'` na tabela `org_members` — buscar via `auth.uid()` ao fazer login. AdminRoute verifica esta role.
- **Estrutura do AuthContext**: expor `{ user, session, role, orgId, isLoading, signOut }` — `isLoading` é `true` durante inicialização (D-08); `signOut` chama `supabase.auth.signOut()` + redirect.
- **Localização dos arquivos**: `src/features/auth/` para `AuthProvider.tsx`, `useAuth.ts`, `useUser.ts`; `src/components/routing/` para `ProtectedRoute.tsx` e `AdminRoute.tsx`; `src/pages/` para `Login.tsx`, `ForgotPassword.tsx`, `ResetPassword.tsx`.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requisitos e escopo
- `.planning/REQUIREMENTS.md` §AUTH (AUTH-01 a AUTH-05) — requisitos de autenticação e roteamento por role que esta fase deve satisfazer
- `.planning/ROADMAP.md` §Phase 3 — planos prescritos (AuthProvider, Login, ForgotPassword, React Router, roteamento pós-login, useUser)

### Código existente (reutilizar — não recriar)
- `roteiro-unificado/src/lib/supabase.ts` — cliente Supabase tipado; usar este client, não criar novo
- `roteiro-unificado/src/types/database.ts` — tipos TypeScript do banco (tabela `org_members` com coluna `role`)
- `roteiro-unificado/src/components/ui/index.ts` — barrel export de Button, Input, Card, Spinner, Skeleton — importar daqui
- `roteiro-unificado/src/hooks/useToast.ts` — hook de toast com wrappers success/error/loading
- `roteiro-unificado/src/main.tsx` — ponto de entrada; `AuthProvider` deve envolver `App` aqui; `Toaster` já presente

### Código existente (modificar)
- `roteiro-unificado/src/App.tsx` — atualmente renderiza só `<DesignSystem />`; precisa ser substituído por `<RouterProvider>` com as rotas da aplicação
- `roteiro-unificado/src/stores/formStore.ts` — persist key deve ser atualizada para `form-progress-${tenantId}` (namespace por tenant)

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `Button` (`src/components/ui/button.tsx`) — variantes `primary`, `secondary`, `ghost`; usar `primary` no botão "Entrar"
- `Input` (`src/components/ui/input.tsx`) — campo de texto estilizado; usar para email e senha
- `Card` (`src/components/ui/card.tsx`) — container com sombra/bordas; base do card de login
- `Spinner` (`src/components/ui/spinner.tsx`) — spinner de loading; usar inline no botão e full-screen no auth flicker
- `Skeleton` (`src/components/ui/skeleton.tsx`) — disponível se necessário para estados de loading futuros
- `useToast` (`src/hooks/useToast.ts`) — wrappers para `toast.success()`, `toast.error()`, `toast.loading()`, `toast.promise()`

### Established Patterns
- `Toaster` já montado em `main.tsx` — não adicionar `<Toaster>` novamente em nenhum componente
- `QueryClientProvider` já em `main.tsx` — TanStack Query disponível; auth queries podem usar `useQuery`
- Tokens de cor via `@theme {}` em `index.css` — usar `bg-primary` (`#123B66`) e `text-accent` (`#F28C28`), nunca hardcodar hex nos componentes
- Alias `@/` configurado — importar sempre via `@/components/ui`, `@/lib/supabase`, etc.

### Integration Points
- `main.tsx` — `AuthProvider` envolve `<App />`; posição: filho de `QueryClientProvider`, pai de `App`
- `App.tsx` — substituir `<DesignSystem />` por `<RouterProvider router={router} />` com React Router v6
- `src/types/database.ts` — tipos `Tables<'org_members'>` disponíveis após Phase 2; `orgId` e `role` vêm desta tabela

</code_context>

<specifics>
## Specific Ideas

- Fundo da tela de login: `bg-primary` (token Tailwind v4 = `#123B66`) full-screen; não usar gradient
- Card de login: branco, sombra média, largura máxima ~400px, centralizado com `flex items-center justify-center min-h-screen`
- Spinner de inicialização (D-08): mesmo fundo azul `bg-primary`, `Spinner` com classe de cor branca centralizado — transição visual suave para quando o conteúdo aparecer

</specifics>

<deferred>
## Deferred Ideas

Nenhuma — discussão mantida dentro do escopo da fase.

</deferred>

---

*Phase: 03-authentication-roteamento-por-role*
*Context gathered: 2026-05-22*
