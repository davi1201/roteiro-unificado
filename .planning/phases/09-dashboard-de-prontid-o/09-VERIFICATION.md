---
phase: 09-dashboard-de-prontidao
verified: 2026-05-24T02:30:00Z
status: human_needed
score: 10/10
overrides_applied: 0
human_verification:
  - test: "Verificação visual do AdminDashboard — grid de CompanyCards com badges e filtros"
    expected: "Admin vê grid de cards (não tabela), badges G1-G5 coloridos, orgs sem avaliação com pill cinza 'Sem avaliação', filtro por nome/CNPJ/nível funciona, contagem exibida, 'Limpar filtros' reseta"
    why_human: "Comportamento visual e interativo do grid, responsividade em múltiplos tamanhos, badge colorido — não verificável por grep"
  - test: "Verificação visual do OrgDetail — seção 'Avaliações' no detalhe da org"
    expected: "Clicar 'Ver detalhes' em um CompanyCard abre /admin/orgs/:orgId com layout de org/membros intacto acima e seção 'Avaliações' abaixo listando versões ou estado vazio"
    why_human: "Composição visual do layout existente com nova seção — verificar que layout de membros não quebrou"
  - test: "Verificação visual do CompanyDashboard — painel da construtora"
    expected: "Construtora acessa /form/:orgId/dashboard e vê card de classificação atual, SectionProgress com 10 abas em estado correto (Não iniciado/Em progresso/Completo), botões 'Continuar Avaliação' e 'Ver Histórico' funcionam"
    why_human: "Aparência e comportamento dos ProgressBadge SVGs, formatação da data pt-BR, navegação dos botões — não verificável por grep"
  - test: "Cross-tenant guard em produção — construtora tenta URL de outra org"
    expected: "Editar URL para /form/{outroOrgId}/dashboard redireciona imediatamente para a própria org da construtora"
    why_human: "Requer sessão autenticada real; o teste automatizado verifica o guard mas não testa com Supabase Auth real"
  - test: "Responsividade do grid — múltiplos breakpoints"
    expected: "Em ~768px o grid mostra 2 colunas; em mobile 1 coluna; em desktop 3 colunas"
    why_human: "Layout responsivo só é verificável no browser"
---

# Phase 09: Dashboard de Prontidão — Relatório de Verificação

**Phase Goal:** Entregar dois painéis de prontidão funcionais — AdminDashboard (grid de empresas com readiness badges) e CompanyDashboard (progresso por seção) — com lógica pura testável separada dos componentes, conectados às rotas e verificados visualmente.
**Verified:** 2026-05-24T02:30:00Z
**Status:** human_needed
**Re-verification:** Não — verificação inicial

---

## Verificação de Objetivo

### Truths Observáveis

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | D-07: computeTabStatus retorna 'empty'/'in-progress'/'complete' corretamente por aba usando REQUIRED_COUNT dos schemas | VERIFIED | `src/lib/sectionStatus.ts` exporta `computeTabStatus`, `STATUS_TO_COMPLETENESS`, `TabStatus`; verificação `requiredCount === 0` antes de filledCount na linha 56; 10 testes passando |
| 2 | D-03: useOrgsWithReadiness retorna todas as orgs ativas, com latestAssessment derivada apenas da avaliação status='submitted' de maior version, e null quando não há avaliação submetida | VERIFIED | `src/features/admin/useOrgsWithReadiness.ts`: LEFT JOIN sem filtro no servidor (linha 63 `assessments!left`); filtro `.filter(a => a.status === 'submitted')` no cliente (linha 75); sort por version desc; 4 testes passando |
| 3 | CompanyCard exibe nome, CNPJ, data, nível técnico e Badge G1-G5 quando há avaliação submetida | VERIFIED | `src/components/admin/CompanyCard.tsx`: renderiza `<Badge grade=... />` quando `readiness_level_mgmt` presente; data formatada pt-BR; nível técnico; 6 testes passando |
| 4 | D-04: CompanyCard exibe badge cinza 'Sem avaliação' e '—' nos campos quando latestAssessment é null | VERIFIED | Linha 44-48: pill `bg-gray-200 text-gray-600` quando `latestAssessment` null; `formattedDate = '—'` e `techLevel = '—'` nas linhas 23-32 |
| 5 | AssessmentSection lista as versões de avaliação de uma org (histórico) com estados loading/empty | VERIFIED | `src/components/admin/AssessmentSection.tsx`: hook interno `useOrgAssessments` com `queryKey: ['assessments', orgId]`; estados loading (3 Skeletons), empty ("Nenhuma avaliação registrada"), error (useToast), data (cards por versão) |
| 6 | D-06: SectionProgress mostra 10 cards (1 por aba) com estado Vazio/Em progresso/Completo correto, sem percentual numérico | VERIFIED | `src/features/form/SectionProgress.tsx`: `TAB_CONFIG.map` sobre 10 abas; `REQUIRED_COUNTS` mapeia 10 TabKeys; pills "Não iniciado"/"Em progresso"/"Completo"; sem valores numéricos percentuais expostos |
| 7 | D-05: Construtora acessando /form/:orgId/dashboard vê sua classificação atual e o SectionProgress, que lê form_data do JSONB do draft via TanStack Query (independente do Zustand) | VERIFIED | `src/features/form/CompanyDashboard.tsx`: `queryKey: ['assessment', 'draft', orgId]`; `<SectionProgress formData={formData} />`; cast tipado `as Record<string, Record<string, unknown>> | null` (sem `as any`) |
| 8 | Construtora tentando acessar dashboard de outra org é redirecionada para a própria | VERIFIED | Linha 48: `if (orgId !== authOrgId)` → `<Navigate to={\`/form/${authOrgId}/dashboard\`} replace />`; 3 testes passando incluindo caso de divergência |
| 9 | D-01: Admin vê grid de CompanyCards (OrgTable removida, as duas views não coexistem) com badges G1-G5 e estado 'Sem avaliação' | VERIFIED | `src/pages/admin/AdminDashboard.tsx`: nenhuma referência a `OrgTable`, `PAGE_SIZE`, `pagedOrgs`; importa `CompanyCard` e `useOrgsWithReadiness`; grid `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| 10 | Admin filtra/busca por nome, CNPJ e nível de prontidão; contagem de resultados é exibida | VERIFIED | `filterOrgs` exportada e testada; `filteredOrgs.length empresa(s) encontrada(s)`; select com "Todos/G1-G5/Sem avaliação"; "Limpar filtros"; 6 testes de filterOrgs passando |

**Score:** 10/10 truths verificadas

---

### Artefatos Obrigatórios

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|---------|
| `roteiro-unificado/src/lib/sectionStatus.ts` | Função pura computeTabStatus + STATUS_TO_COMPLETENESS + tipo TabStatus | VERIFIED | 71 linhas; exports: `computeTabStatus`, `STATUS_TO_COMPLETENESS`, `TabStatus` |
| `roteiro-unificado/src/lib/sectionStatus.test.ts` | Testes — 10 casos behavior | VERIFIED | 10 testes passando |
| `roteiro-unificado/src/features/admin/useOrgsWithReadiness.ts` | Hook TanStack Query com JOIN orgs+assessments e tipo OrgWithReadiness | VERIFIED | 99 linhas; `assessments!left`; filtro no cliente; `staleTime: 60_000` |
| `roteiro-unificado/src/features/admin/useOrgsWithReadiness.test.ts` | Testes — 4 casos behavior | VERIFIED | 4 testes passando |
| `roteiro-unificado/src/components/admin/CompanyCard.tsx` | Card de empresa para o grid do AdminDashboard | VERIFIED | 71 linhas; Badge G1-G5, pill cinza, "—", `buttonVariants`, sem `asChild` |
| `roteiro-unificado/src/components/admin/CompanyCard.test.tsx` | Testes — 6 casos behavior | VERIFIED | 6 testes passando |
| `roteiro-unificado/src/components/admin/AssessmentSection.tsx` | Seção de avaliações para o OrgDetail | VERIFIED | 162 linhas; queryKey compartilhado, 4 estados, `useToast()` (sem sonner direto) |
| `roteiro-unificado/src/features/form/SectionProgress.tsx` | Grid de 10 cards de progresso por aba | VERIFIED | 86 linhas; 10 imports `_REQUIRED_COUNT`; `computeTabStatus`; `STATUS_TO_COMPLETENESS`; `TAB_CONFIG.map` |
| `roteiro-unificado/src/features/form/CompanyDashboard.tsx` | Página /form/:orgId/dashboard com cross-tenant guard | VERIFIED | 175 linhas; guard completo; cast tipado; `<SectionProgress formData=`; "Continuar Avaliação"/"Ver Histórico" |
| `roteiro-unificado/src/features/form/CompanyDashboard.test.tsx` | Testes — 3 casos guard | VERIFIED | 3 testes passando |
| `roteiro-unificado/src/pages/admin/AdminDashboard.tsx` | Grid de CompanyCards com filtros client-side | VERIFIED | 179 linhas; `useOrgsWithReadiness`; `CompanyCard`; `filteredOrgs`; sem OrgTable/PAGE_SIZE/pagedOrgs; mantém CreateOrgModal |
| `roteiro-unificado/src/pages/admin/AdminDashboard.test.tsx` | Testes — 6 casos filterOrgs | VERIFIED | 6 testes passando |
| `roteiro-unificado/src/pages/admin/OrgDetail.tsx` | OrgDetail com AssessmentSection integrada | VERIFIED | `import { AssessmentSection }` na linha 8; `<AssessmentSection orgId={orgId} />` na linha 84 |
| `roteiro-unificado/src/router.tsx` | Rota /form/:orgId/dashboard sob ProtectedRoute | VERIFIED | `CompanyDashboard` importado na linha 12; rota na linha 43-45; dentro do bloco `<ProtectedRoute />` |

---

### Verificação de Links-Chave (Wiring)

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `sectionStatus.ts` | `formStore.ts (TabKey)` | import TabKey; chaves com hífen | WIRED | `TabKey` importado em SectionProgress.tsx linha 4; chaves como `'torre-decisao'` usadas via enum |
| `useOrgsWithReadiness.ts` | `supabase orgs!left(assessments)` | PostgREST select com status na relação | WIRED | `assessments!left(id, readiness_level_mgmt, readiness_level_tech, submitted_at, version, status)` linha 63 |
| `CompanyCard.tsx` | `useOrgsWithReadiness.ts (OrgWithReadiness)` | import type OrgWithReadiness | WIRED | `import type { OrgWithReadiness } from '@/features/admin/useOrgsWithReadiness'` linha 6 |
| `CompanyCard.tsx` | `/admin/orgs/:orgId` | Link com buttonVariants (sem asChild) | WIRED | `<Link to={\`/admin/orgs/${org.id}\`} className={buttonVariants({...})}>` linhas 61-64 |
| `SectionProgress.tsx` | `sectionStatus.ts (computeTabStatus, STATUS_TO_COMPLETENESS)` | import + REQUIRED_COUNT dos 10 schemas | WIRED | `import { computeTabStatus, STATUS_TO_COMPLETENESS } from '@/lib/sectionStatus'` linha 3; 10 schemas importados linhas 5-14 |
| `CompanyDashboard.tsx` | `useAuth orgId / Navigate` | cross-tenant guard orgId !== authOrgId | WIRED | `const { orgId: authOrgId, isLoading: authLoading } = useAuth()` linha 37; `if (orgId !== authOrgId)` linha 48 |
| `AdminDashboard.tsx` | `useOrgsWithReadiness + CompanyCard` | grid de CompanyCards filtrado por useMemo | WIRED | Ambos importados linhas 4-6; `filteredOrgs.map(org => <CompanyCard key={org.id} org={org} />)` linha 173 |
| `OrgDetail.tsx` | `AssessmentSection` | `<AssessmentSection orgId={orgId} />` após Cards existentes | WIRED | Linha 84; montado após seção de membros e antes dos modais |
| `router.tsx` | `CompanyDashboard` | rota folha sob ProtectedRoute | WIRED | Linhas 32-45: ProtectedRoute contém `/form/:orgId/dashboard` com `<CompanyDashboard />` |

---

### Rastreamento de Data-Flow (Level 4)

| Artefato | Variável de Dados | Fonte | Produz Dados Reais | Status |
|----------|-------------------|-------|-------------------|--------|
| `AdminDashboard.tsx` | `orgs` / `filteredOrgs` | `useOrgsWithReadiness()` → Supabase `orgs!left(assessments)` | Sim — query PostgREST com JOIN real | FLOWING |
| `CompanyCard.tsx` | prop `org: OrgWithReadiness` | passado pelo grid em AdminDashboard a partir de `filteredOrgs` | Sim — propagado de `useOrgsWithReadiness` | FLOWING |
| `CompanyDashboard.tsx` | `formData` | `useQuery` → Supabase `assessments` com `.eq('status', 'draft')` | Sim — query real ao Supabase | FLOWING |
| `SectionProgress.tsx` | prop `formData` | passado de `CompanyDashboardContent.draftQuery.data?.form_data` | Sim — JSONB do draft real | FLOWING |
| `AssessmentSection.tsx` | `assessments` | `useOrgAssessments(orgId)` → Supabase `assessments.eq('org_id', orgId)` | Sim — query real por org | FLOWING |

---

### Spot-Checks Comportamentais

| Comportamento | Comando | Resultado | Status |
|--------------|---------|-----------|--------|
| sectionStatus — 10 casos behavior | `npm test -- --run src/lib/sectionStatus.test.ts` | 10 passed | PASS |
| useOrgsWithReadiness — 4 casos behavior | `npm test -- --run src/features/admin/useOrgsWithReadiness.test.ts` | 4 passed | PASS |
| CompanyCard — 6 casos behavior | `npm test -- --run src/components/admin/CompanyCard.test.tsx` | 6 passed | PASS |
| CompanyDashboard guard — 3 casos | `npm test -- --run src/features/form/CompanyDashboard.test.tsx` | 3 passed | PASS |
| AdminDashboard filterOrgs — 6 casos | `npm test -- --run src/pages/admin/AdminDashboard.test.tsx` | 6 passed | PASS |
| Suíte completa | `npm test -- --run` | 55 passed (10 test files) | PASS |

---

### Cobertura de Requisitos

| Requisito | Plano Fonte | Descrição | Status | Evidência |
|-----------|-------------|-----------|--------|-----------|
| DASH-01 | 09-01, 09-04 | Página inicial do admin mostra lista de empresas com status e nível de prontidão atual | SATISFIED | AdminDashboard com grid de CompanyCards via useOrgsWithReadiness; badges G1-G5 e "Sem avaliação" |
| DASH-02 | 09-02 | Card de empresa exibe: nome, CNPJ, data da última avaliação, nível gerencial (G1–G5), nível técnico | SATISFIED | CompanyCard exibe todos os campos; "—" quando ausentes; Badge G1-G5 |
| DASH-03 | 09-03, 09-04 | Construtora logada vai direto para o seu formulário/dashboard individual | SATISFIED | Rota `/form/:orgId/dashboard` registrada sob ProtectedRoute; cross-tenant guard implementado |
| DASH-04 | 09-01, 09-03 | Indicador visual de progresso do formulário por seção (% completo por aba) | SATISFIED | SectionProgress com 10 cards; computeTabStatus com STATUS_TO_COMPLETENESS; ProgressBadge visual |
| DASH-05 | 09-04 | Filtro/busca de empresas no painel admin por nome ou nível de prontidão | SATISFIED | filterOrgs com busca por nome/CNPJ case-insensitive e gradeFilter G1-G5/Sem avaliação; 6 testes |

Todos os 5 requisitos DASH-01 a DASH-05 são SATISFIED.

---

### Anti-Patterns Encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|-----------|---------|
| `CompanyDashboard.tsx` linha 81 | 81 | Comentário `NUNCA \`as any\`` em code comment (não é marcador de dívida) | Info | Intencionalmente documenta proibição; não é TBD/FIXME/XXX |
| `AssessmentSection.tsx` linha 151 | 147-153 | Botão "Exportar" disabled com `title="Em breve"` | Info | Intencional — reservado para Phase 10/11; disabled explicitamente; sem lógica de navegação |
| `HistoryPage.tsx` (pré-existente) | 55 | `navigate` declarado mas não usado — erro TypeScript TS6133 | Warning (pré-existente) | Introduzido no commit `ac97a2c` (Phase 8 fix); não é de responsabilidade desta fase |
| `useSubmitAssessment.test.ts` (pré-existente) | 126 | Erro TypeScript TS2352 e TS2493 em teste de Phase 8 | Warning (pré-existente) | Commit `93f3d78` (Phase 8); 09-04-SUMMARY documenta explicitamente como pré-existente |

**Marcadores de dívida bloqueantes (TBD/FIXME/XXX não referenciados):** Nenhum encontrado nos arquivos desta fase.

**Build:** Falha em `npm run build` devido aos erros TypeScript pré-existentes em `HistoryPage.tsx` e `useSubmitAssessment.test.ts` — introduzidos na Phase 8, não na Phase 9. Nenhum arquivo novo da Phase 9 contribui para erros TypeScript (verificado: `npx tsc --noEmit 2>&1 | grep -v "HistoryPage\|useSubmitAssessment"` retorna vazio).

---

### Verificação Humana Necessária

#### 1. Verificação Visual do AdminDashboard

**Test:** Login como admin → `/admin/dashboard`. Confirmar grid de cards (não tabela), badges G1-G5 coloridos, orgs sem avaliação com pill cinza "Sem avaliação" e campos "—". Testar filtros: busca por nome, por CNPJ, seleção G2, seleção "Sem avaliação", conferir contagem, clicar "Limpar filtros".
**Expected:** Grid responsivo de CompanyCards, badges visuais corretos, filtros funcionam, contagem atualiza, "Limpar filtros" reseta.
**Why human:** Aparência visual dos badges coloridos, responsividade do grid, interação do formulário de filtro — não verificável por grep.

#### 2. Verificação do OrgDetail com AssessmentSection

**Test:** Clicar "Ver detalhes →" em um CompanyCard → `/admin/orgs/:orgId`. Verificar layout de org/membros intacto no topo e seção "Avaliações" abaixo listando versões ou empty state.
**Expected:** Layout existente (org + membros) não quebrado; seção "Avaliações" aparece com h2, lista de versões com pills de status e badges, ou empty state correto.
**Why human:** Composição visual e ordem dos elementos na página — não verificável por grep.

#### 3. Verificação Visual do CompanyDashboard

**Test:** Login como construtora → `/form/:orgId/dashboard`. Verificar card de classificação atual (Badge G1-G5 ou "Sem avaliação"), SectionProgress com 10 abas nos estados corretos, botões "Continuar Avaliação" e "Ver Histórico" navegam corretamente.
**Expected:** Painel completo com classificação, 10 cards de progresso com estado visual correto (Não iniciado/Em progresso/Completo), navegação funcional.
**Why human:** Aparência dos ProgressBadge SVGs, cores dos pills, comportamento de navegação dos botões — não verificável por grep.

#### 4. Cross-Tenant Guard em Produção

**Test:** Logado como construtora A, editar URL para `/form/{orgIdB}/dashboard` (org de outra construtora).
**Expected:** Redirecionamento imediato para `/form/{orgIdA}/dashboard` (org da construtora logada).
**Why human:** Requer sessão Supabase Auth real; o teste automatizado verifica o guard com mock mas não testa integração com auth real.

#### 5. Responsividade do Grid

**Test:** Redimensionar janela entre mobile (~375px), tablet (~768px) e desktop (>1024px) no AdminDashboard e CompanyDashboard.
**Expected:** Mobile: 1 coluna; tablet: 2 colunas; desktop: 3 colunas.
**Why human:** Layout responsivo Tailwind verificável apenas no browser.

---

### Resumo dos Gaps

Nenhum gap bloqueante encontrado. Todos os 10 must-haves verificados. A única pendência é o checkpoint humano de verificação visual (Task 3 do Plan 09-04), que havia sido aprovado pelo usuário conforme SUMMARY 09-04 mas é obrigatório reavaliar no contexto desta verificação formal, pois a evidência de aprovação é apenas a afirmação no SUMMARY — não há log capturado programaticamente.

**Score final: 10/10 truths verificadas.**
**Status: human_needed** — aguardando confirmação humana das 5 verificações visuais/funcionais acima.

---

_Verified: 2026-05-24T02:30:00Z_
_Verifier: Claude (gsd-verifier)_
