---
phase: 04-gest-o-de-organiza-es-painel-admin
verified: 2026-05-22T19:00:00Z
status: human_needed
score: 6/6 must-haves verified
overrides_applied: 0
human_verification:
  - test: "Abrir /admin/dashboard logado como admin e verificar que o layout aparece corretamente: sidebar azul de 240px à esquerda, header de 56px no topo, área de conteúdo com a tabela de orgs"
    expected: "AdminLayout renderizado com sidebar fixa, header com email do admin e botão 'Encerrar sessão', tabela de orgs no conteúdo principal"
    why_human: "Posicionamento CSS fixed com z-index, responsividade e dimensões reais só verificáveis no browser"
  - test: "Clicar em 'Encerrar sessão' no header e verificar redirecionamento para /login"
    expected: "Sessão encerrada, redirecionamento para /login com replace:true"
    why_human: "Integração com Supabase Auth e comportamento de navegação exige browser"
  - test: "Abrir o modal 'Nova Organização', preencher nome='Teste Ltda' e CNPJ='12345678000190', submeter e verificar que a nova org aparece na tabela sem reload de página"
    expected: "Insert no Supabase, invalidação de query ['orgs'], nova linha aparece na tabela, toast 'Organização criada com sucesso'"
    why_human: "Fluxo de mutação Supabase + react-query cache invalidation requer conexão real com banco"
  - test: "Abrir o modal 'Nova Organização', preencher CNPJ='abc' e tentar submeter — verificar mensagem de erro inline"
    expected: "Erro inline 'CNPJ deve ter 14 dígitos numéricos' aparece ao sair do campo ou ao tentar submeter"
    why_human: "Validação onBlur e renderização de erros de formulário requer interação real"
  - test: "Clicar em uma linha da tabela de orgs e verificar navegação para /admin/orgs/:orgId"
    expected: "Navega para página de detalhe com breadcrumb 'Organizações / Nome da Org', tabela de membros, botão 'Convidar Membro'"
    why_human: "Navegação React Router e rendering real da página de detalhe"
  - test: "Na página de detalhe de uma org ativa, clicar em 'Arquivar', confirmar com 'Sim, arquivar' e verificar que o badge muda para cinza 'Arquivada'"
    expected: "UPDATE active=false no Supabase, dupla invalidação de ['orgs'] e ['orgs', orgId], badge muda para 'Arquivada', botão 'Convidar Membro' fica desabilitado"
    why_human: "Fluxo de mutação + cache invalidation + atualização de UI requer conexão real com banco"
  - test: "Verificar que a Edge Function create-user foi implantada e está acessível: na página de detalhe de uma org, clicar 'Convidar Membro', preencher email e senha, submeter"
    expected: "Edge Function invocada, usuário criado no Supabase Auth, INSERT em org_members, toast 'Membro adicionado com sucesso', count de membros atualizado"
    why_human: "Edge Function requer deploy no projeto Supabase e SERVICE_ROLE_KEY configurado como secret — não verificável programaticamente"
---

# Fase 04: Gestão de Organizações & Painel Admin — Relatório de Verificação

**Meta da Fase:** Construir o painel administrativo interno: layout shell com sidebar (incluindo itens para fases futuras desabilitados), listagem de organizações, modal de criação de org, página de detalhe com gerenciamento de membros, e desativação de org.
**Verificado:** 2026-05-22T19:00:00Z
**Status:** human_needed
**Re-verificação:** Não — verificação inicial

## Conquista da Meta

### Verdades Observáveis

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | Layout admin com sidebar de 240px (w-60) fixa e header de 56px (h-14) fixo; signOut chama signOut() + navigate('/login', {replace:true}) | ✓ VERIFICADO | AdminLayout.tsx usa `fixed` + `w-60`/`h-14`; AdminHeader.tsx linha 13: `await signOut()`, linha 14: `navigate('/login', { replace: true })` |
| 2 | Tabela de orgs com 6 colunas (Nome, CNPJ, Membros, Criado em, Status, Ações), badges de status, count de membros, paginação, estados skeleton/empty/erro | ✓ VERIFICADO | OrgTable.tsx: 6 `<th scope="col">` confirmados; badge verde/cinza para Ativa/Arquivada; Skeleton em loading; estado vazio com "Nenhuma organização cadastrada"; AdminDashboard.tsx: paginação client-side com useState(page) + useMemo |
| 3 | Modal de criação de org com validação Zod (nome obrigatório, CNPJ regex /^\d{14}$/), Supabase INSERT com active:true, invalidateQueries(['orgs']) no sucesso | ✓ VERIFICADO | createOrg.ts: `.trim().min(1, 'O nome é obrigatório')` e `.regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos numéricos')`; CreateOrgModal.tsx: `supabase.from('orgs').insert(payload as never)`; `queryClient.invalidateQueries({ queryKey: ['orgs'] })` em onSuccess |
| 4 | Edge Function create-user (Deno, SERVICE_ROLE_KEY de Deno.env, nunca exposta ao cliente), valida POST, email/password/org_id, retorna {user_id} ou {error} | ✓ VERIFICADO | supabase/functions/create-user/index.ts: `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`; validação de método 405; validação email regex, password.length < 8, org_id UUID; `auth.admin.createUser({ email_confirm: true })`; retorna `{ user_id: data.user.id }`; `grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/` retorna 0 resultados |
| 5 | AddMemberModal com fluxo 2 passos: (1) invoke Edge Function create-user → (2) INSERT em org_members; invalida ['org_members', orgId] E ['orgs'] | ✓ VERIFICADO | AddMemberModal.tsx: `supabase.functions.invoke<{ user_id: string }>('create-user', {...})`; `supabase.from('org_members').insert({...})`; `invalidateQueries({ queryKey: ['org_members', orgId] })` + `invalidateQueries({ queryKey: ['orgs'] })` |
| 6 | ArchiveOrgDialog com confirmação "Sim, arquivar"/"Manter organização", UPDATE active=false, invalidação dupla ['orgs'] + ['orgs', orgId] | ✓ VERIFICADO | useArchiveOrg.ts: `.update({ active: false } as never).eq('id', orgId)`; `invalidateQueries({ queryKey: ['orgs'] })` + `invalidateQueries({ queryKey: ['orgs', orgId] })`; ArchiveOrgDialog.tsx: botão danger "Sim, arquivar" e secondary "Manter organização"; OrgDetail.tsx e AdminDashboard.tsx ambos wired |

**Pontuação:** 6/6 verdades verificadas

### Artefatos Exigidos

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|---------|
| `src/components/ui/dialog.tsx` | Dialog primitive com 6 sub-componentes | ✓ VERIFICADO | 6 funções exportadas: Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter; `role="dialog"`, `aria-modal="true"`, Escape handler, body scroll lock, focus trap via useRef |
| `src/components/layouts/AdminLayout.tsx` | Wrapper com sidebar + header + Outlet | ✓ VERIFICADO | `<AdminSidebar />`, `<AdminHeader />`, `<main className="mt-14 ml-60 p-8"><Outlet /></main>` |
| `src/components/layouts/AdminSidebar.tsx` | Sidebar com 3 nav items | ✓ VERIFICADO | NavLink para /admin/dashboard (Organizações), 2 `<span aria-disabled="true">` (Dashboard, Exportações) com "Em breve" |
| `src/components/layouts/AdminHeader.tsx` | Header com email + signOut | ✓ VERIFICADO | `{user?.email}`, botão "Encerrar sessão", `signOut()` + `navigate('/login', { replace: true })` |
| `src/features/admin/useOrgs.ts` | useOrgs hook com queryKey ['orgs'] + member_count | ✓ VERIFICADO | `queryKey: ['orgs']`, `.select('...org_members(count)')`, normalização com `member_count` |
| `src/components/admin/OrgTable.tsx` | Tabela com 6 colunas, estados | ✓ VERIFICADO | 6 `<th scope="col">`, badges Ativa/Arquivada, Skeleton loading, empty state, `e.stopPropagation()` na célula Ações, `cursor-pointer` nas linhas |
| `src/schemas/createOrg.ts` | Schema Zod + tipo CreateOrgFormData | ✓ VERIFICADO | `createOrgSchema` com `.trim().min(1)` e `.regex(/^\d{14}$/)`, tipo inferido `CreateOrgFormData` |
| `src/components/admin/CreateOrgModal.tsx` | Modal com RHF + Zod + INSERT + invalidateQueries | ✓ VERIFICADO | `zodResolver(createOrgSchema)`, `mode: 'onBlur'`, `supabase.from('orgs').insert`, `invalidateQueries({ queryKey: ['orgs'] })`, toasts pt-br, autoFocus, maxLength=14 |
| `supabase/functions/create-user/index.ts` | Edge Function Deno com service_role | ✓ VERIFICADO | `Deno.serve`, `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`, validações de input, `email_confirm: true`, retorna `{ user_id }` |
| `supabase/functions/create-user/deno.json` | Config mínima do Deno runtime | ✓ VERIFICADO | Arquivo existe com import map para esm.sh/@supabase/supabase-js@2 |
| `src/schemas/addMember.ts` | Schema Zod para email + senha | ✓ VERIFICADO | `addMemberSchema` com `.email('Insira um email válido')`, `.min(8, 'Senha deve ter no mínimo 8 caracteres')` |
| `src/features/admin/useOrgDetail.ts` | Hook com 2 useQuery (org + membros) | ✓ VERIFICADO | queryKey `['orgs', orgId]` + `['org_members', orgId]`, `enabled: !!orgId`, `.single<Tables<'orgs'>>()` |
| `src/components/admin/AddMemberModal.tsx` | Modal com fluxo 2-step | ✓ VERIFICADO | `functions.invoke('create-user', ...)`, `from('org_members').insert`, dupla invalidação, SERVICE_ROLE_KEY = 0 ocorrências |
| `src/features/admin/useArchiveOrg.ts` | Hook useMutation UPDATE active=false | ✓ VERIFICADO | `.update({ active: false }).eq('id', orgId)`, dupla invalidação, toasts pt-br |
| `src/components/admin/ArchiveOrgDialog.tsx` | Dialog de confirmação | ✓ VERIFICADO | Props `{ open, orgId, orgName, onClose }`, early return quando null, botão danger, botão secondary, `<strong>` no nome |
| `src/pages/admin/AdminDashboard.tsx` | Página completa wired | ✓ VERIFICADO | `useOrgs()`, `OrgTable`, `CreateOrgModal`, `ArchiveOrgDialog`, `archiveTarget` state, sem placeholders |
| `src/pages/admin/OrgDetail.tsx` | Página completa wired | ✓ VERIFICADO | `useOrgDetail`, `MemberTable`, `AddMemberModal`, `ArchiveOrgDialog`, breadcrumb, botão Arquivar danger |
| `src/router.tsx` | Rotas admin com AdminLayout wrapper | ✓ VERIFICADO | `AdminLayout` wrapping `AdminDashboard` e `OrgDetail` como filhos do `AdminRoute`; sem "Phase 4" placeholder |

### Verificação de Links Críticos (Wiring)

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `router.tsx` | `AdminLayout` | `element: <AdminLayout />` como filho de `AdminRoute` | ✓ WIRED | Linha 41: `{ element: <AdminLayout />, children: [...] }` |
| `AdminLayout.tsx` | `Outlet` de react-router-dom | `<Outlet />` dentro do `<main>` | ✓ WIRED | Linha 11: `<Outlet />` |
| `AdminHeader.tsx` | `useAuth().signOut` | onClick do botão "Encerrar sessão" | ✓ WIRED | `handleSignOut` chama `await signOut()` e `navigate('/login', { replace: true })` |
| `ui/index.ts` | `dialog.tsx` | barrel export | ✓ WIRED | Exporta Dialog, DialogHeader, DialogTitle, DialogDescription, DialogContent, DialogFooter |
| `AdminDashboard.tsx` | `useOrgs()` | invocado no topo do componente | ✓ WIRED | `const { data: orgs = [], isLoading, isError, error } = useOrgs()` |
| `useOrgs.ts` | `supabase.from('orgs')` | queryFn faz SELECT | ✓ WIRED | `.from('orgs').select('...org_members(count)').order(...)` |
| `OrgTable.tsx` | `navigate('/admin/orgs/:orgId')` | onClick da linha | ✓ WIRED | `onClick={() => navigate('/admin/orgs/${org.id}')` |
| `AdminDashboard.tsx` | `CreateOrgModal` | estado `isCreateModalOpen` | ✓ WIRED | `handleNewOrg = () => setIsCreateModalOpen(true)`, modal renderizado com `open={isCreateModalOpen}` |
| `CreateOrgModal.tsx` | `supabase.from('orgs').insert` | `useMutation.mutationFn` | ✓ WIRED | `supabase.from('orgs').insert(payload as never)` |
| `CreateOrgModal.tsx` | `queryClient.invalidateQueries({ queryKey: ['orgs'] })` | `onSuccess` da mutation | ✓ WIRED | Linha 49: `queryClient.invalidateQueries({ queryKey: ['orgs'] })` |
| `AddMemberModal.tsx` | `supabase.functions.invoke('create-user')` | passo 1 do mutationFn | ✓ WIRED | `supabase.functions.invoke<{ user_id: string }>('create-user', { body: {...} })` |
| `AddMemberModal.tsx` | `supabase.from('org_members').insert` | passo 2 do mutationFn (D-03) | ✓ WIRED | `supabase.from('org_members').insert({ org_id, user_id, role: 'company' })` |
| `supabase/functions/create-user/index.ts` | `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')` | runtime Deno (nunca no cliente) | ✓ WIRED | Linha 3: `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`; 0 ocorrências em `src/` |
| `ArchiveOrgDialog.tsx` | `useArchiveOrg().mutate` | onClick do botão "Sim, arquivar" | ✓ WIRED | `archiveOrgMutation.mutate(orgId, { onSuccess: () => onClose() })` |
| `useArchiveOrg.ts` | `supabase.from('orgs').update({ active: false })` | `useMutation.mutationFn` | ✓ WIRED | `.update({ active: false } as never).eq('id', orgId)` |
| `AdminDashboard.tsx` | `ArchiveOrgDialog` | estado `archiveTarget` | ✓ WIRED | `handleArchive = (orgId, orgName) => setArchiveTarget(...)`, dialog com `open={archiveTarget !== null}` |

### Rastreamento de Fluxo de Dados (Nível 4)

| Artefato | Variável de Dado | Fonte | Produz Dados Reais | Status |
|----------|----------------|-------|-------------------|--------|
| `OrgTable.tsx` (apresentacional) | `orgs: OrgWithMemberCount[]` | props de `AdminDashboard` → `useOrgs()` | Sim — query Supabase `from('orgs').select(...)` | ✓ FLOWING |
| `AdminDashboard.tsx` | `orgs` via `useOrgs()` | `useQuery` → `supabase.from('orgs')...` | Sim — query real com `org_members(count)` | ✓ FLOWING |
| `OrgDetail.tsx` | `org`, `members` via `useOrgDetail()` | 2x `useQuery` → Supabase | Sim — `.from('orgs')...single()` + `.from('org_members')...` | ✓ FLOWING |
| `CreateOrgModal.tsx` | insert payload | `useForm` → `useMutation` → Supabase | Sim — `from('orgs').insert(...)` com active:true | ✓ FLOWING |
| `AddMemberModal.tsx` | `user_id` retornado | `functions.invoke` → insert | Sim — Edge Function retorna UUID real + insert em org_members | ✓ FLOWING |

### Spot-Checks Comportamentais

| Comportamento | Comando | Resultado | Status |
|--------------|---------|-----------|--------|
| Build de produção passa sem erros de TypeScript | `npm run build` no diretório roteiro-unificado | Exit 0; "✓ built in 344ms"; 0 erros TypeScript (tsc -b passou) | ✓ PASS |
| SERVICE_ROLE_KEY ausente do código cliente | `grep -rn "SUPABASE_SERVICE_ROLE_KEY" src/` | 0 ocorrências em todos os arquivos de `src/` | ✓ PASS |
| Placeholder "Phase 4" removido do router | `grep -n "Phase 4" src/router.tsx` | 0 ocorrências | ✓ PASS |
| Placeholders de handleArchive/handleNewOrg removidos | `grep -n "Funcionalidade disponível em breve" src/pages/admin/AdminDashboard.tsx` | 0 ocorrências | ✓ PASS |
| Stub "orgId: {orgId}" removido de OrgDetail | `grep -n "orgId: {orgId}" src/pages/admin/OrgDetail.tsx` | 0 ocorrências | ✓ PASS |
| Sem hex hardcoded nos layouts | `grep -n "#123B66\|#F28C28" src/components/layouts/*.tsx` | 0 ocorrências | ✓ PASS |
| Dialog sem dependência @radix-ui | `grep -n "@radix-ui" src/components/ui/dialog.tsx` | 0 ocorrências | ✓ PASS |
| 6 sub-componentes Dialog exportados | `grep -c "export function Dialog..." dialog.tsx` | 6 | ✓ PASS |
| 6 colunas na tabela de orgs | `grep -c 'scope="col"' OrgTable.tsx` | 6 | ✓ PASS |
| Commits documentados existem no git | `git log --oneline` | Todos os 11 hashes documentados nos SUMMARYs estão presentes | ✓ PASS |

### Cobertura de Requisitos

| Requisito | Plano de Origem | Descrição | Status | Evidência |
|-----------|----------------|-----------|--------|---------|
| ORG-03 | 04-01, 04-02, 04-03, 04-04, 04-05 | Admin consegue criar orgs, adicionar usuários e arquivar orgs pelo painel | ✓ SATISFEITO | AdminDashboard + OrgDetail + todos os modais + Edge Function implementados e wired |

### Anti-Padrões Encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| Múltiplos arquivos (CreateOrgModal, AddMemberModal, useArchiveOrg) | Várias | `as never` / `as unknown as never` em chamadas Supabase | Info | Cast necessário por limitação de tipagem com schema Supabase manual — documentado nos SUMMARYs como dívida técnica removível via `supabase gen types`. Não afeta comportamento em runtime. |

Nenhum marcador de dívida TBD/FIXME/XXX encontrado nos arquivos modificados por esta fase.

### Verificação Necessária por Humano

#### 1. Renderização visual do AdminLayout

**Teste:** Acessar `/admin/dashboard` como admin logado
**Esperado:** Sidebar azul (bg-primary) de 240px à esquerda, header de 56px no topo com email do admin e botão "Encerrar sessão", área de conteúdo com tabela de orgs
**Por que humano:** Posicionamento CSS com `fixed` e z-index, dimensões visuais reais, responsividade — só verificável no browser

#### 2. Fluxo de signOut

**Teste:** Clicar em "Encerrar sessão" no header
**Esperado:** Sessão encerrada no Supabase, redirecionamento para /login com `replace:true`
**Por que humano:** Integração com Supabase Auth e comportamento de navegação

#### 3. Criação de organização via modal

**Teste:** Clicar "Nova Organização", preencher nome='Teste Ltda' e CNPJ='12345678000190', submeter
**Esperado:** INSERT no Supabase, tabela atualiza sem reload com nova linha, toast "Organização criada com sucesso"
**Por que humano:** Fluxo de mutação Supabase + react-query cache invalidation requer conexão real

#### 4. Validação Zod onBlur no modal de criação

**Teste:** Abrir modal "Nova Organização", digitar CNPJ='abc', sair do campo
**Esperado:** Mensagem de erro inline "CNPJ deve ter 14 dígitos numéricos" aparece
**Por que humano:** Validação onBlur e renderização de erros de formulário requer interação

#### 5. Navegação da tabela para detalhe da org

**Teste:** Clicar em uma linha da tabela
**Esperado:** Navega para /admin/orgs/:orgId com breadcrumb, nome/status da org, tabela de membros, botão "Convidar Membro"
**Por que humano:** Navegação React Router e rendering real da página

#### 6. Arquivamento de organização

**Teste:** Clicar "Arquivar" em uma org ativa, confirmar com "Sim, arquivar"
**Esperado:** UPDATE active=false no Supabase, badge muda para "Arquivada" cinza, "Convidar Membro" fica desabilitado
**Por que humano:** Fluxo de mutação + cache invalidation + atualização de UI

#### 7. Adição de membro via Edge Function

**Teste:** Na página de detalhe de uma org ativa, clicar "Convidar Membro", preencher email e senha >= 8 chars
**Esperado:** Edge Function invocada, usuário criado no Supabase Auth, INSERT em org_members, toast "Membro adicionado com sucesso", count de membros atualizado
**Por que humano:** Edge Function requer deploy no projeto Supabase com `SUPABASE_SERVICE_ROLE_KEY` configurado como secret — não verificável sem infraestrutura ativa

**Nota sobre deploy da Edge Function:** O plano 04-04 documenta instrução de deploy manual: `supabase functions deploy create-user --no-verify-jwt` + `supabase secrets set SUPABASE_SERVICE_ROLE_KEY=...`. Este passo de setup é responsabilidade do usuário — o código da função está correto, mas o teste funcional completo depende do deploy.

### Resumo de Gaps

Nenhum gap técnico encontrado. Todos os 6 must-haves estão verificados com evidência no código.

Os 7 itens de verificação humana acima são todos comportamentais (integração com Supabase em produção, rendering visual, fluxos de UI interativos) que não podem ser verificados por análise estática de código. O código base está correto e completo.

**Observação de segurança crítica:** A aceitabilidade de `ACCESS-CONTROL-ALLOW-ORIGIN: '*'` na Edge Function e o deploy com `--no-verify-jwt` foram documentados como risco aceito para o piloto (T-04-19, T-04-25 no threat_model do plano 04-04). Considerar restringir CORS e adicionar verificação de JWT na Edge Function antes de ampliar o piloto.

---

_Verificado: 2026-05-22T19:00:00Z_
_Verificador: Claude (gsd-verifier)_
