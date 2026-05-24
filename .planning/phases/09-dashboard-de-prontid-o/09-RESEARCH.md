# Phase 09: Dashboard de Prontidão — Pesquisa

**Pesquisado:** 2026-05-24
**Domínio:** React dashboard — TanStack Query v5, Supabase PostgREST JOIN, Tailwind v4
**Confiança:** HIGH

---

<user_constraints>
## Restrições do Usuário (de 09-CONTEXT.md)

### Decisões Travadas

- **D-01:** OrgTable substituída por grid de CompanyCards — AdminDashboard não renderiza mais OrgTable; substitui por grid de CompanyCard components exibindo prontidão de cada org. As duas views não coexistem.
- **D-02:** Botão "Nova Org" permanece no header do AdminDashboard. CompanyCard tem apenas link "Ver detalhes" → `/admin/orgs/:orgId`. CreateOrgModal permanece em AdminDashboard.
- **D-03:** CompanyCard exibe dados da última avaliação com `status = 'submitted'` — query JOIN `orgs` + `assessments` filtrando `status = 'submitted'`, `ORDER BY version DESC LIMIT 1 per org`.
- **D-04:** Empresa sem avaliação submetida renderiza badge cinza "Sem avaliação". Card ainda aparece no grid. Data e nível técnico exibem "—". Link "Ver detalhes" funciona normalmente.
- **D-05:** SectionProgress lê `form_data` do JSONB do assessment via TanStack Query — dashboard da construtora busca o draft ativo (`status = 'draft'`) via `useQuery`. SectionProgress recebe `formData` como prop e analisa por aba. Independente do Zustand — não requer FormLayout montado.
- **D-06:** 3 estados por aba: Vazio / Em progresso / Completo — sem percentual numérico exibido.
- **D-07:** "Completo" via `REQUIRED_COUNT` dos schemas — importar `*_REQUIRED_COUNT` dos 10 schemas. "Vazio" se `Object.keys(form_data[tabKey] ?? {}).length === 0`. "Em progresso" caso contrário.

### Discrição do Claude

- Destino pós-login da construtora — manter redirect para `/form/:orgId` sem alterar AuthProvider. Dashboard acessível via link no FormLayout.
- OrgDetail — integração de assessment: adicionar seção abaixo do Card de org existente com `useQuery` próprio buscando avaliações da org. Manter layout atual intacto acima.
- Data fetch do admin dashboard — query Supabase com JOIN via PostgREST. Implementador escolhe abordagem mais legível.
- Ícones do SectionProgress — usar SVG inline simples por estado — mesmo padrão do ProgressBadge existente.

### Ideias Adiadas (FORA DE ESCOPO)

- Mudança do destino pós-login para `/form/:orgId/dashboard` — pode ser Phase 12.
- Notificação ao admin quando construtora submete avaliação — fora de escopo.
- Drill-down de seção no SectionProgress — implementador pode incluir se simples via `#hash`, caso contrário adia para Phase 12.
</user_constraints>

<phase_requirements>
## Requisitos da Fase

| ID | Descrição | Suporte da Pesquisa |
|----|-----------|---------------------|
| DASH-01 | Página inicial do admin mostra lista de empresas com status e nível de prontidão atual | hook `useOrgsWithReadiness` com JOIN PostgREST; grid de CompanyCards em AdminDashboard |
| DASH-02 | Card de empresa exibe: nome, CNPJ, data da última avaliação, nível gerencial (G1–G5), nível técnico | CompanyCard component; Badge component existente; Skeleton durante loading |
| DASH-03 | Construtora logada vai direto para o seu formulário/dashboard individual | Rota `/form/:orgId/dashboard` adicionada ao router.tsx sob ProtectedRoute |
| DASH-04 | Indicador visual de progresso do formulário por seção (% completo por aba) | SectionProgress com REQUIRED_COUNT de 10 schemas; ProgressBadge existente para ícones |
| DASH-05 | Filtro/busca de empresas no painel admin por nome ou nível de prontidão | client-side via useMemo; input de texto + select; botão "Limpar filtros" |
</phase_requirements>

---

## Sumário

Esta fase implementa dois painéis de prontidão distintos sobre o stack existente — nenhuma dependência nova é necessária. O trabalho é inteiramente de composição UI sobre primitivos já estabelecidos nas fases anteriores: TanStack Query v5 para data fetching, Tailwind v4 para estilo, Badge/Skeleton/Card/Button já em `src/components/ui/`, e ProgressBadge para ícones de estado.

A parte de maior risco técnico é a query JOIN do painel admin — o PostgREST do Supabase tem comportamento particular ao usar `.eq()` em tabelas relacionadas com `!left` join: o filtro `eq('assessments.status', 'submitted')` aplicado diretamente em `select()` exclui orgs sem avaliações submetidas. A decisão D-04 exige que orgs sem avaliação apareçam com badge cinza, portanto o padrão correto é filtrar via PostgREST `referencedTable` ou pós-processar o resultado no cliente — ambas as abordagens estão documentadas na seção de padrões.

O SectionProgress precisa calcular estados sem montar o FormLayout. Isso é viável porque os 10 schemas já exportam `*_REQUIRED_COUNT` e o form_data do draft está disponível via `useQuery(['assessment', 'draft', orgId])` — o mesmo queryKey que o FormLayout usa, portanto o cache do TanStack Query será reaproveitado se o usuário navegou pelo formulário antes de acessar o dashboard.

**Recomendação principal:** Criar hook `useOrgsWithReadiness` separado de `useOrgs` para não quebrar o fluxo existente da paginação. O hook novo faz o JOIN e normaliza a resposta; o hook original permanece inalterado para as views que não precisam de assessment data.

---

## Mapa de Responsabilidade Arquitetural

| Capacidade | Tier Primário | Tier Secundário | Racional |
|------------|--------------|----------------|---------|
| Grid de CompanyCards com filtros | Frontend (React) | — | Filtro client-side via useMemo; sem estado no servidor |
| Query JOIN orgs+assessments | Supabase PostgREST | TanStack Query (cache) | Supabase faz o JOIN; TanStack Query gerencia loading/erro/stale |
| Cálculo de estado de aba (SectionProgress) | Frontend (função pura) | — | Lógica em JS sobre form_data JSONB; sem round-trip ao servidor |
| Rota `/form/:orgId/dashboard` | React Router (client) | ProtectedRoute guard | Rota folha; cross-tenant guard idêntico ao HistoryPage |
| Seção de assessment no OrgDetail | Frontend (React) | Supabase (query) | `useQuery` próprio isolado dos outros queries do OrgDetail |
| Badge G1-G5 / "Sem avaliação" | Frontend (componente) | — | Badge.tsx existente; "Sem avaliação" é variante inline |

---

## Stack Padrão

### Já instalado — não instalar nada novo

| Biblioteca | Versão (instalada) | Propósito nesta fase | Fonte |
|------------|-------------------|----------------------|-------|
| `@tanstack/react-query` | ^5.100.11 | useQuery para orgs+assessments e draft do construtora | [VERIFIED: package.json] |
| `@supabase/supabase-js` | ^2.106.1 | query PostgREST JOIN; client já em `src/lib/supabase.ts` | [VERIFIED: package.json] |
| `tailwindcss` | ^4.3.0 | grid de cards, tokens de cor, responsive breakpoints | [VERIFIED: package.json] |
| `react-router-dom` | ^7.15.1 | nova rota `/form/:orgId/dashboard`; Navigate para cross-tenant guard | [VERIFIED: package.json] |
| `react` | 19.2.6 | useMemo para filtros client-side | [VERIFIED: package.json] |

**Nenhum pacote novo a instalar.** Toda a fase reutiliza componentes e hooks existentes.

---

## Auditoria de Legitimidade de Pacotes

Nenhum pacote novo será instalado nesta fase. [VERIFIED: 09-UI-SPEC.md §Registry Safety confirma "nenhuma dependência nova de terceiros"].

---

## Padrões de Arquitetura

### Diagrama do Sistema

```
Browser
  │
  ├── /admin/dashboard
  │     AdminDashboard
  │       └── useOrgsWithReadiness()         ──→  Supabase: orgs JOIN assessments (status=submitted)
  │             └── useMemo(filter)          (client-side — sem round-trip)
  │                   └── CompanyCard[]
  │
  ├── /admin/orgs/:orgId
  │     OrgDetail (existente — layout preservado)
  │       └── AssessmentSection
  │             └── useQuery(['assessments', orgId])  ──→  Supabase: assessments WHERE org_id=orgId ORDER BY version DESC
  │
  └── /form/:orgId/dashboard
        CompanyDashboard
          ├── cross-tenant guard (useAuth)
          └── CompanyDashboardContent
                ├── useQuery(['assessment', 'draft', orgId])  ──→  Supabase: draft ativo (cache TQ5)
                └── SectionProgress(formData)     (puro — sem Supabase adicional)
                      └── computeTabStatus(tabKey, formData, REQUIRED_COUNT)
```

### Estrutura de Arquivos Novos

```
src/
├── components/admin/
│   ├── CompanyCard.tsx          # card do grid admin (novo)
│   └── AssessmentSection.tsx    # seção de avaliações no OrgDetail (novo)
├── features/admin/
│   └── useOrgsWithReadiness.ts  # hook novo com JOIN assessments (novo)
└── features/form/
    ├── CompanyDashboard.tsx     # página /form/:orgId/dashboard (novo)
    └── SectionProgress.tsx     # grid de 10 cards de progresso (novo)
```

**Arquivos modificados:**
- `src/pages/admin/AdminDashboard.tsx` — substituir OrgTable por grid de CompanyCard; adicionar filtros
- `src/pages/admin/OrgDetail.tsx` — adicionar `<AssessmentSection orgId={orgId} />` após os Cards existentes
- `src/router.tsx` — adicionar rota `/form/:orgId/dashboard`

### Padrão 1: Query JOIN PostgREST para orgs+assessments

**O problema do filtro em left join:**
O PostgREST aplica `.eq('assessments.status', 'submitted')` no `select()` como filtro de linha da tabela principal quando a relação é `!inner`, e como filtro da tabela relacionada quando é `!left`. Com `!left`, orgs sem avaliação são retornadas com `assessments: null` — o comportamento correto para D-04.

```typescript
// Source: Supabase PostgREST docs (comportamento verificado em useOrgs.ts existente)
// Hook: src/features/admin/useOrgsWithReadiness.ts

type AssessmentSnapshot = {
  readiness_level_mgmt: string | null
  readiness_level_tech: string | null
  submitted_at: string | null
  version: number
}

type OrgWithReadiness = {
  id: string
  name: string
  cnpj: string | null
  active: boolean
  latestAssessment: AssessmentSnapshot | null
}

export function useOrgsWithReadiness() {
  return useQuery<OrgWithReadiness[]>({
    queryKey: ['orgs', 'with-readiness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orgs')
        .select(`
          id, name, cnpj, active,
          assessments!left(readiness_level_mgmt, readiness_level_tech, submitted_at, version)
        `)
        .eq('active', true)
        .order('name', { ascending: true })
      if (error) throw error

      return ((data ?? []) as unknown as RawRow[]).map((row) => {
        // PostgREST retorna array de assessments; filtrar submitted e pegar version mais alta
        const submitted = (Array.isArray(row.assessments) ? row.assessments : [])
          .filter((a) => a.status === 'submitted')  // nota: status não está no select — ver pitfall
          .sort((a, b) => b.version - a.version)
        return {
          id: row.id,
          name: row.name,
          cnpj: row.cnpj,
          active: row.active,
          latestAssessment: submitted[0] ?? null,
        }
      })
    },
    staleTime: 60_000,
  })
}
```

**ATENÇÃO — pitfall do select sem `status`:** Para filtrar apenas `submitted` no cliente, o campo `status` deve estar incluído no select. Adicionar `status` à lista ou usar `.eq('assessments.status', 'submitted')` como filtro PostgREST com cuidado (ver Pitfall 2 abaixo).

### Padrão 2: Filtros client-side com useMemo

```typescript
// Source: padrão já usado em AdminDashboard.tsx (pagedOrgs via useMemo)
const [searchTerm, setSearchTerm] = useState('')
const [gradeFilter, setGradeFilter] = useState<string>('Todos')

const filteredOrgs = useMemo(() => {
  return orgs.filter((org) => {
    const matchesSearch =
      searchTerm === '' ||
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (org.cnpj ?? '').toLowerCase().includes(searchTerm.toLowerCase())

    const matchesGrade =
      gradeFilter === 'Todos' ||
      (gradeFilter === 'Sem avaliação'
        ? !org.latestAssessment
        : org.latestAssessment?.readiness_level_mgmt === gradeFilter)

    return matchesSearch && matchesGrade
  })
}, [orgs, searchTerm, gradeFilter])
```

### Padrão 3: computeTabStatus — lógica pura para SectionProgress

```typescript
// Source: CONTEXT.md D-07
type TabStatus = 'empty' | 'in-progress' | 'complete'

function computeTabStatus(
  tabKey: TabKey,
  formData: Record<string, unknown> | null | undefined,
  requiredCount: number
): TabStatus {
  const tabData = formData?.[tabKey]
  if (!tabData || typeof tabData !== 'object' || Object.keys(tabData).length === 0) {
    return 'empty'
  }
  if (requiredCount === 0) {
    // Aba sem campos obrigatórios: "completo" se tem qualquer dado, senão "em progresso"
    // Per D-07: "Vazio" se keys === 0 (já tratado acima). Qualquer dado = Em progresso.
    // Para abas com REQUIRED_COUNT=0, não há "completo" formal — tratar como "em progresso".
    return 'in-progress'
  }
  // Contar campos não-nulos e não-string-vazia
  const filledCount = Object.values(tabData as Record<string, unknown>).filter(
    (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  ).length
  return filledCount >= requiredCount ? 'complete' : 'in-progress'
}
```

**Mapeamento completeness → ProgressBadge:** Per 09-UI-SPEC.md §SectionProgress, o componente `ProgressBadge` recebe `completeness: number`. Usar: `empty → 0`, `in-progress → 0.5`, `complete → 1`.

### Padrão 4: Cross-tenant guard no CompanyDashboard

Idêntico ao HistoryPage.tsx (padrão estabelecido):

```typescript
// Source: src/features/form/HistoryPage.tsx (padrão verificado)
export function CompanyDashboard() {
  const { orgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, isLoading: authLoading } = useAuth()

  if (authLoading || !orgId || !authOrgId) {
    return <div className="bg-primary flex min-h-screen items-center justify-center">
      <Spinner size="lg" className="border-white border-t-transparent" />
    </div>
  }

  if (orgId !== authOrgId) {
    return <Navigate to={`/form/${authOrgId}/dashboard`} replace />
  }

  return <CompanyDashboardContent orgId={orgId} />
}
```

### Padrão 5: useQuery para draft no CompanyDashboard

O queryKey `['assessment', 'draft', orgId]` é o mesmo que FormLayout.tsx usa — o cache do TanStack Query é reaproveitado automaticamente quando o usuário alterna entre formulário e dashboard.

```typescript
// Source: src/features/form/FormLayout.tsx (queryKey verificado)
const draftQuery = useQuery({
  queryKey: ['assessment', 'draft', orgId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('assessments')
      .select('form_data, readiness_level_mgmt, readiness_level_tech, submitted_at, version')
      .eq('org_id', orgId)
      .eq('status', 'draft')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle<AssessmentRow>()
    if (error) throw error
    return data
  },
  staleTime: 30_000,
  enabled: !!orgId,
})
```

### Padrão 6: AssessmentSection em OrgDetail

Segue o padrão de `useAssessmentHistory` embutido no HistoryPage.tsx — hook local com queryKey `['assessments', orgId]`:

```typescript
// Source: src/features/form/HistoryPage.tsx (extrair padrão)
// src/components/admin/AssessmentSection.tsx
function useOrgAssessments(orgId: string) {
  return useQuery({
    queryKey: ['assessments', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, version, status, submitted_at, readiness_level_mgmt, readiness_level_tech')
        .eq('org_id', orgId)
        .order('version', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    staleTime: 60_000,
    enabled: !!orgId,
  })
}
```

**ATENÇÃO:** O queryKey `['assessments', orgId]` é o mesmo que HistoryPage usa. Se admin e construtora (no mesmo browser) compartilham cache, o admin verá dados da org da construtora. Isso é aceitável — RLS garante que um admin genuíno pode ver todas as orgs. Não há vazamento cross-tenant porque admin tem role diferente e acessa orgId diferente.

### Anti-Padrões a Evitar

- **Compartilhar hook `useOrgs` expandido:** Alterar `useOrgs` para incluir assessments quebraria a paginação existente no AdminDashboard (PAGE_SIZE=10 aplicado antes do retorno). Criar `useOrgsWithReadiness` separado.
- **Filtrar `status='submitted'` via `.eq()` em tabela relacionada com `!left`:** O PostgREST com `!left` e `.eq('assessments.status', 'submitted')` transforma o left join em inner join, excluindo orgs sem avaliação. Incluir `status` no `select()` e filtrar no cliente.
- **Usar Zustand store em CompanyDashboard:** O SectionProgress deve receber `formData` como prop e calcular o status localmente. Não chamar `useFormStore(orgId)` fora do contexto do FormLayout — a store é inicializada pelo FormLayout e pode estar vazia.
- **Recalcular readiness_level_mgmt:** O campo já está salvo no banco pelo autosave da Phase 8 (D-05 do 08-CONTEXT.md). Não reexecutar `calculateReadiness()` no dashboard — usar o valor persistido em `readiness_level_mgmt`.

---

## Não Construir do Zero

| Problema | Não Construir | Usar em Vez | Por quê |
|----------|--------------|------------|---------|
| Badge G1-G5 | classe inline com cores manuais | `Badge` de `src/components/ui/badge.tsx` | Cores semânticas já mapeadas em `@theme {}` tokens (bg-g1..bg-g5) |
| Ícones de estado de aba | SVGs customizados | `ProgressBadge` de `src/features/form/ProgressBadge.tsx` | Exatamente os 3 estados necessários (0=círculo vazio, 0-1=clock, 1=check) |
| Skeleton durante loading | div piscante CSS manual | `Skeleton` de `src/components/ui/skeleton.tsx` | `animate-pulse rounded-md bg-gray-200` — consistente com resto do app |
| Container de card | div com border manual | `Card`, `CardHeader`, `CardContent`, `CardFooter` de `src/components/ui/card.tsx` | Padding e border já estabelecidos no design system |
| Toast de erro | alert() ou div de erro | `useToast()` de `src/hooks/useToast.ts` com `.error()` | Padrão obrigatório; nunca Sonner direto |
| Formatação de CNPJ | regex ad hoc | `formatCnpj()` já definido em `OrgTable.tsx` | Extrai ou duplica — evitar divergência de formato |

---

## Armadilhas Comuns

### Armadilha 1: PostgREST left join vira inner join com `.eq()` na tabela relacionada

**O que dá errado:** `supabase.from('orgs').select('*, assessments!left(...)').eq('assessments.status', 'submitted')` — o `.eq()` aplicado depois do `select()` filtra a tabela principal, não a relacionada. Orgs sem avaliações submetidas são excluídas do resultado. D-04 exige que apareçam.

**Por que acontece:** O `.eq()` no PostgREST sem qualificação `referencedTable` é um filtro na tabela principal. Para filtrar a tabela relacionada sem excluir linhas da principal, o campo deve estar no `select()` e o filtro deve ocorrer no cliente.

**Como evitar:** Incluir `status` no select da relação e filtrar `submitted` no cliente durante o `map()` da normalização.

**Sinais de alerta:** Grid admin mostrando apenas orgs que já enviaram avaliação; orgs novas (sem assessment) desaparecendo do painel.

### Armadilha 2: form_data como `Json` do Supabase não é tipado

**O que dá errado:** `draftQuery.data?.form_data` tem tipo `Json` (definido em `database.ts`) — um union recursivo. TypeScript aceita qualquer acesso de propriedade mas não há IntelliSense nem verificação real.

**Por que acontece:** O schema JSONB no PostgreSQL não tem estrutura fixa; o tipo gerado é genérico.

**Como evitar:** Cast explícito para `Record<string, Record<string, unknown>>` no `computeTabStatus`. Exemplo: `const formData = draftQuery.data?.form_data as Record<string, Record<string, unknown>> | null`.

**Sinais de alerta:** TypeScript passando mas runtime retornando `undefined` para chaves de aba.

### Armadilha 3: REQUIRED_COUNT=0 não significa "aba vazia = em progresso automático"

**O que dá errado:** 8 das 10 abas têm `REQUIRED_COUNT=0`. Se "completo" for `filledCount >= requiredCount`, então `0 >= 0 === true` e toda aba com qualquer dado seria marcada "completo" — mas abas sem nenhum dado também seriam "completo" (0 >= 0).

**Por que acontece:** O critério D-07 do CONTEXT.md é: "Vazio" se `Object.keys(form_data[tabKey] ?? {}).length === 0`. Para `REQUIRED_COUNT=0`, não existe estado "completo" formal — a aba ou está vazia ou "em progresso".

**Como evitar:** Para `requiredCount === 0`, retornar sempre `'in-progress'` (nunca `'complete'`). Apenas as abas com `REQUIRED_COUNT > 0` (Identificação=2, NDA=1) podem atingir o estado "completo".

**Sinais de alerta:** Todas as abas mostrando ícone verde check mesmo com poucos dados preenchidos.

### Armadilha 4: Paginação do AdminDashboard precisa ser removida junto com OrgTable

**O que dá errado:** O `AdminDashboard.tsx` atual tem lógica de paginação (`PAGE_SIZE=10`, `page` state, `pagedOrgs` useMemo, botões Anterior/Próxima). Com o grid de cards (máximo 5 construtoras no piloto), a paginação não é necessária e o `pagedOrgs` passaria dados errados para o grid.

**Por que acontece:** A paginação foi implementada para OrgTable. Ao substituir OrgTable por grid de CompanyCards, toda a lógica de paginação deve ser removida — o hook `useOrgsWithReadiness` retorna todos os registros ativos diretamente.

**Como evitar:** Remover completamente: `PAGE_SIZE`, `page` state, `totalPages`, `pagedOrgs`, e os botões Anterior/Próxima ao reescrever AdminDashboard.

**Sinais de alerta:** Grid mostrando apenas 10 empresas mesmo com mais cadastradas.

### Armadilha 5: QueryKey conflito entre HistoryPage e AssessmentSection

**O que dá errado:** Ambos `HistoryPage` e `AssessmentSection` usam `queryKey: ['assessments', orgId]`. Se um admin abre OrgDetail para org X enquanto a construtora de org X tinha HistoryPage aberta em outra aba, o cache é compartilhado (mesmo orgId). Isso é correto por design — RLS permite ao admin ler, e o dado é o mesmo.

**Por que é mencionado:** Não é um bug; é comportamental esperado. Não criar queryKey diferente para AssessmentSection — reaproveitar o cache é o comportamento correto.

**Como evitar:** Manter o mesmo queryKey. Se o planner vir dois hooks com o mesmo key, não "corrigir" adicionando prefixos.

---

## REQUIRED_COUNT consolidado por aba

Todos verificados diretamente dos arquivos de schema:

| TabKey | Label | REQUIRED_COUNT | Pode atingir "Completo" |
|--------|-------|---------------|------------------------|
| `identificacao` | Identificação | 2 | Sim |
| `torreDecisao` | Torre Decisão | 0 | Não (máximo: Em progresso) |
| `torreSienge` | Torre Sienge | 0 | Não |
| `torreAcesso` | Torre Acesso | 0 | Não |
| `torreClassificacao` | Torre Classificação | 0 | Não |
| `habVenda` | Hab. Venda | 0 | Não |
| `habRepositorios` | Hab. Repositórios | 0 | Não |
| `habResponsaveis` | Hab. Responsáveis | 0 | Não |
| `habClassificacao` | Hab. Classificação | 0 | Não |
| `nda` | NDA | 1 | Sim |

[VERIFIED: verificado em cada arquivo de schema em `src/schemas/`]

**Implicação para SectionProgress:** Apenas Identificação e NDA podem mostrar o ícone verde check. As outras 8 abas oscilam entre círculo vazio (Não iniciado) e ícone clock (Em progresso). O planner deve garantir que `computeTabStatus` trate `REQUIRED_COUNT=0` como caso especial.

---

## Exemplos de Código

### CompanyCard — estrutura JSX

```typescript
// Baseado em: src/components/ui/card.tsx, badge.tsx, 09-UI-SPEC.md
// src/components/admin/CompanyCard.tsx

import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent, CardFooter, Badge, Button } from '@/components/ui'
import type { Grade } from '@/components/ui/badge'

interface CompanyCardProps {
  org: OrgWithReadiness
}

export function CompanyCard({ org }: CompanyCardProps) {
  const assessment = org.latestAssessment
  return (
    <Card className="border-gray-200 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <span className="text-base font-semibold text-gray-900 truncate">{org.name}</span>
          {assessment?.readiness_level_mgmt ? (
            <Badge grade={assessment.readiness_level_mgmt as Grade} />
          ) : (
            <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
              Sem avaliação
            </span>
          )}
        </div>
        {org.cnpj && (
          <p className="text-xs text-gray-500 font-mono">{formatCnpj(org.cnpj)}</p>
        )}
      </CardHeader>
      <CardContent className="pt-0 space-y-1">
        <p className="text-sm text-gray-500">
          Última avaliação:{' '}
          {assessment?.submitted_at
            ? new Date(assessment.submitted_at).toLocaleDateString('pt-BR')
            : '—'}
        </p>
        <p className="text-sm text-gray-600">
          Nível técnico: {assessment?.readiness_level_tech ?? '—'}
        </p>
      </CardContent>
      <CardFooter className="pt-3 border-t border-gray-100">
        <Button variant="ghost" size="sm" asChild>
          <Link to={`/admin/orgs/${org.id}`}>Ver detalhes →</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
```

**Verificar:** O componente `Button` atual tem suporte a `asChild`? Caso não tenha, usar `<Link>` diretamente com classes Tailwind em vez de envolver em Button. Inspecionar `src/components/ui/button.tsx` antes de implementar.

### SectionProgress — grid de 10 cards

```typescript
// Baseado em: TAB_CONFIG, ProgressBadge, 09-UI-SPEC.md
// src/features/form/SectionProgress.tsx

import { TAB_CONFIG } from './tabConfig'
import { ProgressBadge } from './ProgressBadge'
import { IDENTIFICACAO_REQUIRED_COUNT } from '@/schemas/identificacao'
import { TORRE_DECISAO_REQUIRED_COUNT } from '@/schemas/torre-decisao'
// ... todos os 10 imports

const REQUIRED_COUNTS: Record<TabKey, number> = {
  [TabKey.Identificacao]: IDENTIFICACAO_REQUIRED_COUNT,
  [TabKey.TorreDecisao]: TORRE_DECISAO_REQUIRED_COUNT,
  // ...
}

const STATUS_CONFIG = {
  empty: { label: 'Não iniciado', className: 'bg-gray-100 text-gray-600', completeness: 0 },
  'in-progress': { label: 'Em progresso', className: 'bg-orange-100 text-orange-700', completeness: 0.5 },
  complete: { label: 'Completo', className: 'bg-green-100 text-green-700', completeness: 1 },
} as const

export function SectionProgress({ formData }: { formData: Record<string, Record<string, unknown>> | null }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TAB_CONFIG.map(({ key, label }) => {
        const status = computeTabStatus(key, formData, REQUIRED_COUNTS[key])
        const config = STATUS_CONFIG[status]
        return (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <ProgressBadge completeness={config.completeness} />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </div>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${config.className}`}>
              {config.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}
```

### Rota nova em router.tsx

```typescript
// Source: src/router.tsx (padrão verificado)
// Adicionar dentro do bloco element: <ProtectedRoute />
{
  path: '/form/:orgId/dashboard',
  element: <CompanyDashboard />,
},
```

---

## Estado da Arte

| Abordagem Antiga | Abordagem Atual | Impacto |
|-----------------|----------------|---------|
| OrgTable (tabela HTML) no AdminDashboard | Grid de CompanyCards com prontidão | Informação de prontidão visível sem drill-down |
| Sem dashboard da construtora | `/form/:orgId/dashboard` com SectionProgress | Construtora vê progresso por seção sem abrir formulário |
| AdminDashboard com paginação PAGE_SIZE=10 | Grid sem paginação (piloto com ≤5 construtoras) | Remoção de estado desnecessário |

---

## Log de Premissas

| # | Afirmação | Seção | Risco se Errado |
|---|-----------|-------|-----------------|
| A1 | O campo `status` da tabela `assessments` precisa estar no `select()` para filtrar no cliente — não está no select sugerido no CONTEXT.md `<specifics>` | Padrão 1 / Armadilha 1 | Query retornaria dados sem `status`; filtro de `submitted` no cliente falharia silenciosamente retornando 0 assessments por org |
| A2 | `Button` component não suporta `asChild` (RadixUI slot pattern) | Padrão CompanyCard | Precisaria usar `<Link>` com classes Tailwind direto em vez de Button wrapper |
| A3 | O `form_data` JSONB usa `TabKey` como chave de primeiro nível (e.g., `form_data['identificacao']`) — baseado no padrão de `hydrateFromAssessment` e `useFormSection` | Padrão 3 (computeTabStatus) | SectionProgress calcularia estados errados — todos "vazio" |

**A3 é a premissa de maior risco.** Verificar o shape de `form_data` em `useFormSection.ts` ou `useAutosave.ts` antes de implementar `computeTabStatus`.

---

## Perguntas em Aberto

1. **Button suporta `asChild`?**
   - O que sabemos: `button.tsx` existe em `src/components/ui/` mas não foi lido completamente.
   - O que está incerto: se tem o pattern Radix Slot (`asChild` prop) para envolver um `<Link>`.
   - Recomendação: implementador deve inspecionar `button.tsx` no Wave 0. Se não suportar, usar `<Link className="...">Ver detalhes →</Link>` diretamente no CardFooter.

2. **Shape exato de `form_data` no JSONB**
   - O que sabemos: `useFormSection.ts` faz autosave por aba; `hydrateFromAssessment` restaura o store a partir do JSONB.
   - O que está incerto: se a chave de primeiro nível é exatamente o valor do enum `TabKey` (e.g., `'identificacao'`) ou algum outro formato.
   - Recomendação: implementador deve verificar `useFormSection.ts` ou `useAutosave.ts` para confirmar o shape antes de implementar `computeTabStatus`.

---

## Disponibilidade do Ambiente

| Dependência | Requerida Por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|---------|
| Node.js | `npm run dev` / `npm test` | ✓ | 20.19.3 (State.md) | — |
| Supabase project | queries em produção | ✓ | configurado (State.md) | `.env.local` pendente (Phase 3 todo) |
| Vitest | testes unitários | ✓ | ^4.1.7 | — |
| Supabase CLI | migrations | ✓ | usado em Phase 8.1 | — |

**Nenhuma dependência nova ou bloqueante.**

---

## Arquitetura de Validação

### Framework de Testes

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest 4.1.7 + jsdom |
| Arquivo de config | `roteiro-unificado/vitest.config.ts` |
| Comando rápido | `cd roteiro-unificado && npm test -- --run` |
| Suite completa | `cd roteiro-unificado && npm test -- --run --coverage` |

### Mapa Requisito → Teste

| ID | Comportamento | Tipo | Comando Automatizado | Arquivo Existe? |
|----|--------------|------|---------------------|-----------------|
| DASH-01 | Grid de CompanyCards renderiza orgs com prontidão | smoke (manual) | inspeção visual `/admin/dashboard` | — |
| DASH-02 | CompanyCard exibe badge "Sem avaliação" quando sem assessment | unit | `npm test -- --run src/components/admin/CompanyCard.test.tsx` | ❌ Wave 0 |
| DASH-03 | CompanyDashboard redireciona cross-tenant | unit | `npm test -- --run src/features/form/CompanyDashboard.test.tsx` | ❌ Wave 0 |
| DASH-04 | computeTabStatus retorna estado correto para cada combinação de dados | unit | `npm test -- --run src/features/form/SectionProgress.test.ts` | ❌ Wave 0 |
| DASH-05 | Filtro client-side filtra por nome, CNPJ e nível | unit | `npm test -- --run src/pages/admin/AdminDashboard.test.tsx` | ❌ Wave 0 |

### Taxa de Amostragem

- **Por commit de task:** `cd roteiro-unificado && npm test -- --run`
- **Por merge de wave:** `cd roteiro-unificado && npm test -- --run` (suite completa)
- **Gate de fase:** Suite completa verde antes de `/gsd:verify-work`

### Gaps do Wave 0

- [ ] `src/components/admin/CompanyCard.test.tsx` — cobre DASH-02 (badge "Sem avaliação", formatação CNPJ)
- [ ] `src/features/form/SectionProgress.test.ts` — cobre DASH-04 (`computeTabStatus` pura)
- [ ] `src/features/form/CompanyDashboard.test.tsx` — cobre DASH-03 (cross-tenant guard, rota)
- [ ] `src/pages/admin/AdminDashboard.test.tsx` — cobre DASH-05 (filtros useMemo)

A função `computeTabStatus` deve ser exportada separadamente (arquivo `src/lib/sectionStatus.ts` ou inline no SectionProgress) para ser testável sem montar o componente inteiro.

---

## Domínio de Segurança

### Categorias ASVS Aplicáveis

| Categoria ASVS | Aplica | Controle Padrão |
|----------------|--------|----------------|
| V2 Autenticação | sim | Supabase Auth via AuthProvider — já implementado (Phase 3) |
| V3 Gerenciamento de Sessão | sim | `createBrowserClient` persiste sessão — já implementado |
| V4 Controle de Acesso | sim | Cross-tenant guard em CompanyDashboard; AdminRoute guarda rotas `/admin/*` |
| V5 Validação de Entrada | não | Dashboard é read-only — nenhum campo de entrada no fluxo crítico (filtros são client-side) |
| V6 Criptografia | não | Sem operações criptográficas nesta fase |

### Padrões de Ameaça para este Stack

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Construtora acessando dashboard de outra org via URL manipulation | Spoofing | Cross-tenant guard `orgId !== authOrgId → Navigate` — mesmo padrão do HistoryPage |
| Admin vendo dados via RLS bypass | Elevation of Privilege | RLS no Supabase; `is_admin()` function já configurada (Phase 2) |
| Dados de form_data injetados via JSONB | Tampering | Dashboard é read-only; nenhum dado do JSONB é renderizado como HTML bruto (usar texto, não dangerouslySetInnerHTML) |

**Nota de implementação:** O guard de cross-tenant para `/form/:orgId/dashboard` é obrigatório. O padrão está estabelecido em HistoryPage.tsx e deve ser replicado identicamente — não simplificar.

---

## Fontes

### Primárias (confiança HIGH)
- `src/features/form/HistoryPage.tsx` — padrão de queryKey, skeleton, cross-tenant guard, card de versão
- `src/components/ui/badge.tsx` — Grade type, gradeConfig, uso de tokens bg-g1..bg-g5
- `src/features/form/ProgressBadge.tsx` — mapeamento completeness → SVG (0, 0-1, 1)
- `src/features/form/tabConfig.ts` — TAB_CONFIG com 10 abas e TabKey enum
- `src/schemas/` (10 arquivos) — REQUIRED_COUNT exports verificados diretamente
- `src/types/database.ts` — colunas da tabela assessments confirmadas
- `src/features/admin/useOrgs.ts` — padrão PostgREST com normalização de shape
- `src/pages/admin/AdminDashboard.tsx` — estado atual a ser modificado
- `src/pages/admin/OrgDetail.tsx` — estado atual a ser modificado
- `src/router.tsx` — estrutura de rotas existente
- `.planning/phases/09-dashboard-de-prontid-o/09-CONTEXT.md` — decisões travadas D-01 a D-07
- `.planning/phases/09-dashboard-de-prontid-o/09-UI-SPEC.md` — especificação visual aprovada

### Secundárias (confiança MEDIUM)
- `package.json` — versões de dependências verificadas
- `.planning/STATE.md` — decisões acumuladas de fases anteriores
- `.planning/config.json` — `nyquist_validation: true` confirma seção de validação obrigatória

---

## Metadados

**Breakdown de confiança:**
- Stack padrão: HIGH — todas as dependências verificadas no package.json e codebase existente
- Arquitetura: HIGH — padrões extraídos diretamente do código existente (HistoryPage, FormLayout, useOrgs)
- Armadilhas: HIGH — Armadilha 1 (PostgREST left join) verificada contra padrão de useOrgs.ts; outras derivadas de análise do código

**Data da pesquisa:** 2026-05-24
**Válido até:** 2026-06-24 (stack estável; mudanças de schema do Supabase invalidam)
