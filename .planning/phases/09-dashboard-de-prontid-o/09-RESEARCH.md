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

A parte de maior risco técnico é a query JOIN do painel admin — o PostgREST do Supabase tem comportamento particular ao usar `.eq()` em tabelas relacionadas com `!left` join: o filtro `eq('assessments.status', 'submitted')` aplicado diretamente em `select()` exclui orgs sem avaliações submetidas. A decisão D-04 exige que orgs sem avaliação apareçam com badge cinza, portanto o campo `status` deve ser incluído no `select()` da relação e a filtragem feita no cliente durante o `map()` de normalização.

O SectionProgress precisa calcular estados sem montar o FormLayout. Isso é viável porque os 10 schemas já exportam `*_REQUIRED_COUNT` e o form_data do draft está disponível via `useQuery(['assessment', 'draft', orgId])`. Ponto crítico verificado: as chaves de primeiro nível do JSONB `form_data` correspondem exatamente aos valores do enum `TabKey` — strings com hífen como `'torre-decisao'`, `'hab-venda'`, não camelCase. Isso foi confirmado em `formStore.ts` onde `TabKey.TorreDecisao = 'torre-decisao'`.

**Recomendação principal:** Criar hook `useOrgsWithReadiness` separado de `useOrgs` para não quebrar o fluxo existente. Exportar `computeTabStatus` como função pura em arquivo próprio (`src/lib/sectionStatus.ts`) para facilitar testes unitários. O componente `Button` existente **não suporta `asChild`** (sem integração Radix Slot) — usar `<Link>` direto com classes Tailwind no CardFooter.

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
| Cross-tenant isolation | API / Backend (RLS) | Frontend guard | RLS bloqueia no servidor; guard redireciona na UI |

---

## Stack Padrão

### Já instalado — não instalar nada novo

| Biblioteca | Versão (instalada) | Propósito nesta fase | Fonte |
|------------|-------------------|----------------------|-------|
| `@tanstack/react-query` | ^5.100.11 | useQuery para orgs+assessments e draft da construtora | [VERIFIED: package.json] |
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
  ├── /admin/dashboard  (protegido por AdminRoute → role='admin')
  │     AdminDashboard
  │       └── useOrgsWithReadiness()         ──→  Supabase: orgs!left(assessments) com status no select
  │             └── useMemo(filter)          (client-side — sem round-trip)
  │                   └── CompanyCard[]
  │
  ├── /admin/orgs/:orgId  (protegido por AdminRoute)
  │     OrgDetail (layout existente — preservado)
  │       └── AssessmentSection
  │             └── useQuery(['assessments', orgId])  ──→  Supabase: assessments WHERE org_id=orgId
  │
  └── /form/:orgId/dashboard  (protegido por ProtectedRoute)
        CompanyDashboard
          ├── cross-tenant guard: orgId !== authOrgId → Navigate
          └── CompanyDashboardContent
                ├── useQuery(['assessment', 'draft', orgId])  ──→  Supabase: draft ativo
                └── SectionProgress(formData)
                      └── computeTabStatus(tabKey, formData, REQUIRED_COUNT)
                            └── Usa TabKey valores com hífen: 'torre-decisao', 'hab-venda', etc.
```

### Estrutura de Arquivos Novos

```
src/
├── components/admin/
│   ├── CompanyCard.tsx          # card do grid admin (novo)
│   └── AssessmentSection.tsx    # seção de avaliações no OrgDetail (novo)
├── features/admin/
│   └── useOrgsWithReadiness.ts  # hook novo com JOIN assessments (novo)
├── features/form/
│   ├── CompanyDashboard.tsx     # página /form/:orgId/dashboard (novo)
│   └── SectionProgress.tsx     # grid de 10 cards de progresso (novo)
└── lib/
    └── sectionStatus.ts         # computeTabStatus — função pura exportada (novo)
```

**Arquivos modificados:**
- `src/pages/admin/AdminDashboard.tsx` — substituir OrgTable por grid de CompanyCard; adicionar filtros; remover lógica de paginação (PAGE_SIZE, page state, pagedOrgs, botões Anterior/Próxima)
- `src/pages/admin/OrgDetail.tsx` — adicionar `<AssessmentSection orgId={orgId} />` após os Cards existentes
- `src/router.tsx` — adicionar rota `/form/:orgId/dashboard`

### Padrão 1: Query JOIN PostgREST para orgs+assessments

**O problema do filtro em left join:**
O PostgREST com `!left` e `.eq('assessments.status', 'submitted')` como filtro de tabela principal transforma o left join em inner join, excluindo orgs sem avaliação. A solução correta é incluir `status` no `select()` da relação e filtrar no cliente.

```typescript
// Source: padrão derivado de useOrgs.ts + análise do comportamento PostgREST
// Hook: src/features/admin/useOrgsWithReadiness.ts

type AssessmentSnapshot = {
  id: string
  readiness_level_mgmt: string | null
  readiness_level_tech: string | null
  submitted_at: string | null
  version: number
  status: string
}

type RawRow = {
  id: string
  name: string
  cnpj: string | null
  active: boolean
  assessments: AssessmentSnapshot[] | null
}

export type OrgWithReadiness = {
  id: string
  name: string
  cnpj: string | null
  active: boolean
  latestAssessment: Omit<AssessmentSnapshot, 'status'> | null
}

export function useOrgsWithReadiness() {
  return useQuery<OrgWithReadiness[]>({
    queryKey: ['orgs', 'with-readiness'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orgs')
        .select(`
          id, name, cnpj, active,
          assessments!left(id, readiness_level_mgmt, readiness_level_tech, submitted_at, version, status)
        `)
        .eq('active', true)
        .order('name', { ascending: true })
      if (error) throw error

      return ((data ?? []) as unknown as RawRow[]).map((row) => {
        // Filtrar no cliente: apenas submitted; pegar versão mais alta
        const submitted = (Array.isArray(row.assessments) ? row.assessments : [])
          .filter((a) => a.status === 'submitted')
          .sort((a, b) => b.version - a.version)
        return {
          id: row.id,
          name: row.name,
          cnpj: row.cnpj,
          active: row.active,
          latestAssessment: submitted[0]
            ? {
                id: submitted[0].id,
                readiness_level_mgmt: submitted[0].readiness_level_mgmt,
                readiness_level_tech: submitted[0].readiness_level_tech,
                submitted_at: submitted[0].submitted_at,
                version: submitted[0].version,
              }
            : null,
        }
      })
    },
    staleTime: 60_000,
  })
}
```

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

**Chave crítica:** Os valores do enum `TabKey` usam hífen (`'torre-decisao'`, `'hab-venda'`), não camelCase. Isso foi confirmado em `src/stores/formStore.ts`:

```typescript
export enum TabKey {
  TorreDecisao = 'torre-decisao',  // string com hífen — NÃO torreDecisao
  HabVenda = 'hab-venda',           // string com hífen — NÃO habVenda
  // ...
}
```

```typescript
// Source: CONTEXT.md D-07; formStore.ts TabKey verificado
// Arquivo: src/lib/sectionStatus.ts (exportado para testabilidade)

export type TabStatus = 'empty' | 'in-progress' | 'complete'

export function computeTabStatus(
  tabKey: string,
  formData: Record<string, unknown> | null | undefined,
  requiredCount: number
): TabStatus {
  const tabData = formData?.[tabKey]

  // "Vazio" se não há objeto ou objeto vazio
  if (!tabData || typeof tabData !== 'object' || Object.keys(tabData as object).length === 0) {
    return 'empty'
  }

  // Para abas com REQUIRED_COUNT=0: nunca "completo" — máximo é "em progresso"
  if (requiredCount === 0) {
    return 'in-progress'
  }

  // Contar campos não-nulos, não-undefined, não-string-vazia, não-array-vazio
  const filledCount = Object.values(tabData as Record<string, unknown>).filter(
    (v) => v !== null && v !== undefined && v !== '' && !(Array.isArray(v) && v.length === 0)
  ).length

  return filledCount >= requiredCount ? 'complete' : 'in-progress'
}

// Mapeamento completeness → ProgressBadge (per 09-UI-SPEC.md)
export const STATUS_TO_COMPLETENESS: Record<TabStatus, number> = {
  empty: 0,
  'in-progress': 0.5,
  complete: 1,
}
```

### Padrão 4: Cross-tenant guard no CompanyDashboard

Idêntico ao HistoryPage.tsx (padrão estabelecido em Phase 8):

```typescript
// Source: src/features/form/HistoryPage.tsx (padrão verificado — replicar exatamente)
export function CompanyDashboard() {
  const { orgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, isLoading: authLoading } = useAuth()

  if (authLoading || !orgId || !authOrgId) {
    return (
      <div className="bg-primary flex min-h-screen items-center justify-center">
        <Spinner size="lg" className="border-white border-t-transparent" />
      </div>
    )
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
// Source: padrão de FormLayout.tsx (queryKey verificado indiretamente via useAutosave)
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
      .maybeSingle()
    if (error) throw error
    return data
  },
  staleTime: 30_000,
  enabled: !!orgId,
})
```

### Padrão 6: AssessmentSection em OrgDetail

Extrai o padrão de `useAssessmentHistory` embutido no HistoryPage.tsx:

```typescript
// Source: src/features/form/HistoryPage.tsx §useAssessmentHistory
// Arquivo: src/components/admin/AssessmentSection.tsx

function useOrgAssessments(orgId: string) {
  return useQuery({
    queryKey: ['assessments', orgId],  // mesmo queryKey do HistoryPage — cache compartilhado por design
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

### Padrão 7: Link no CardFooter (sem asChild)

O componente `Button` existente **não suporta `asChild`** — é um `forwardRef` simples sem integração Radix Slot. Para links navegáveis no CardFooter, usar `<Link>` direto com classes `buttonVariants`:

```typescript
// Source: src/components/ui/button.tsx — verificado: sem asChild
import { Link } from 'react-router-dom'
import { buttonVariants } from '@/components/ui/button'

// No CardFooter:
<Link
  to={`/admin/orgs/${org.id}`}
  className={buttonVariants({ variant: 'ghost', size: 'sm' })}
>
  Ver detalhes →
</Link>
```

### Anti-Padrões a Evitar

- **Expandir `useOrgs` para incluir assessments:** Quebraria a paginação existente no AdminDashboard (PAGE_SIZE=10). Criar `useOrgsWithReadiness` separado.
- **Filtrar `status='submitted'` com `.eq()` em tabela relacionada com `!left`:** Transforma left join em inner join, excluindo orgs sem avaliação. Incluir `status` no `select()` e filtrar no cliente.
- **Usar `TabKey.TorreDecisao` como chave de objeto literal:** O valor do enum é `'torre-decisao'` (com hífen). `formData[TabKey.TorreDecisao]` e `formData['torre-decisao']` são equivalentes; usar o enum é mais seguro que strings literais.
- **Usar Zustand store em CompanyDashboard:** SectionProgress recebe `formData` como prop. Não chamar `useFormStore(orgId)` fora do FormLayout — a store pode estar vazia.
- **Recalcular readiness_level_mgmt:** O campo está salvo no banco pelo autosave (Phase 8 D-05). Usar o valor persistido, não reexecutar `calculateReadiness()`.
- **Manter lógica de paginação no AdminDashboard:** PAGE_SIZE, page state, pagedOrgs, botões Anterior/Próxima devem ser todos removidos ao substituir OrgTable pelo grid.
- **`0 >= 0` como critério de "completo":** Para `REQUIRED_COUNT=0`, `filledCount >= 0` é sempre verdadeiro — toda aba com qualquer dado seria marcada "completo". Verificar explicitamente `requiredCount === 0` antes de avaliar.

---

## Não Construir do Zero

| Problema | Não Construir | Usar em Vez | Por quê |
|----------|--------------|------------|---------|
| Badge G1-G5 | classe inline com cores manuais | `Badge` de `src/components/ui/badge.tsx` | Cores semânticas em `@theme {}` tokens (bg-g1..bg-g5) |
| Ícones de estado de aba | SVGs customizados | `ProgressBadge` de `src/features/form/ProgressBadge.tsx` | Exatamente os 3 estados: 0=círculo, 0.5=clock, 1=check |
| Skeleton durante loading | div piscante CSS manual | `Skeleton` de `src/components/ui/skeleton.tsx` | `animate-pulse rounded-md bg-gray-200` — consistente |
| Container de card | div com border manual | `Card`, `CardHeader`, `CardContent`, `CardFooter` de `src/components/ui/card.tsx` | Padding e border já estabelecidos |
| Toast de erro | alert() ou div de erro | `useToast()` de `src/hooks/useToast.ts` com `.error()` | Padrão obrigatório; nunca Sonner direto |

---

## REQUIRED_COUNT Consolidado por Aba

Todos verificados diretamente dos arquivos de schema em `src/schemas/`:

| TabKey (valor do enum) | Label | REQUIRED_COUNT | Pode atingir "Completo" |
|------------------------|-------|---------------|------------------------|
| `'identificacao'` | Identificação | 2 | Sim |
| `'torre-decisao'` | Torre Decisão | 0 | Não (máximo: Em progresso) |
| `'torre-sienge'` | Torre Sienge | 0 | Não |
| `'torre-acesso'` | Torre Acesso | 0 | Não |
| `'torre-classificacao'` | Torre Classificação | 0 | Não |
| `'hab-venda'` | Hab. Venda | 0 | Não |
| `'hab-repositorios'` | Hab. Repositórios | 0 | Não |
| `'hab-responsaveis'` | Hab. Responsáveis | 0 | Não |
| `'hab-classificacao'` | Hab. Classificação | 0 | Não |
| `'nda'` | NDA | 1 | Sim |

[VERIFIED: verificado em cada arquivo de schema em `src/schemas/`]

**Implicação para SectionProgress:** Apenas Identificação e NDA podem mostrar o ícone verde check. As outras 8 abas oscilam entre círculo vazio e ícone clock.

---

## Armadilhas Comuns

### Armadilha 1: PostgREST left join vira inner join com `.eq()` na tabela relacionada

**O que dá errado:** `supabase.from('orgs').select('*, assessments!left(...)').eq('assessments.status', 'submitted')` — o `.eq()` sem `referencedTable` filtra a tabela principal. Orgs sem avaliações submetidas são excluídas do resultado. D-04 exige que apareçam.

**Por que acontece:** `.eq()` no PostgREST sem `referencedTable` qualificado é filtro na tabela principal — converte o LEFT JOIN em INNER JOIN.

**Como evitar:** Incluir `status` no `select()` da relação (`assessments!left(..., status)`) e filtrar `submitted` no cliente durante o `map()` de normalização.

**Sinais de alerta:** Grid admin mostrando apenas orgs que já enviaram avaliação; orgs novas desaparecendo do painel.

### Armadilha 2: form_data JSONB usa strings com hífen, não camelCase

**O que dá errado:** Tentar acessar `formData['torreDecisao']` ou `formData['TorreDecisao']` retorna `undefined`. Os dados não aparecem no SectionProgress.

**Por que acontece:** O enum `TabKey` usa strings com hífen (`TabKey.TorreDecisao = 'torre-decisao'`). O `formStore.updateSection(tab, data)` salva no JSONB com essa chave. Logo `form_data['torre-decisao']` é a chave correta.

**Como evitar:** Sempre usar `formData?.[tabKey]` onde `tabKey` é o valor do enum (e.g., `TabKey.TorreDecisao` que resolve para `'torre-decisao'`). Nunca hardcodar strings de aba.

**Sinais de alerta:** Todos os cards de SectionProgress mostrando "Não iniciado" mesmo com formulário parcialmente preenchido.

### Armadilha 3: REQUIRED_COUNT=0 e o critério `filledCount >= requiredCount`

**O que dá errado:** `0 >= 0` é `true` — toda aba com `REQUIRED_COUNT=0` que tiver qualquer dado seria marcada "completo" em vez de "em progresso". Mas pior: aba com `REQUIRED_COUNT=0` e dados vazios também satisfaz `0 >= 0` — seria marcada "completo" mesmo estando vazia.

**Por que acontece:** A lógica genérica `filledCount >= requiredCount` não distingue "sem obrigatórios" de "completo".

**Como evitar:** Verificar explicitamente: `if (requiredCount === 0) return 'in-progress'` antes de avaliar `filledCount`. A checagem de "vazio" (`keys.length === 0`) ocorre antes desta etapa.

**Sinais de alerta:** Todas as abas mostrando ícone verde check com poucos dados preenchidos.

### Armadilha 4: Paginação do AdminDashboard precisa ser removida junto com OrgTable

**O que dá errado:** `AdminDashboard.tsx` atual tem `PAGE_SIZE=10`, `page` state, `pagedOrgs` useMemo, botões Anterior/Próxima. Ao substituir OrgTable por grid de CompanyCards, esses estados ficam órfãos e `pagedOrgs` passaria slice incorreto para o grid.

**Como evitar:** Remover completamente: `PAGE_SIZE`, `page` state, `totalPages`, `pagedOrgs`, e os botões de paginação. O hook `useOrgsWithReadiness` retorna todos os registros ativos.

**Sinais de alerta:** Grid mostrando apenas 10 empresas; TypeScript warning de variável não usada.

### Armadilha 5: `form_data` tem tipo `Json` — sem IntelliSense

**O que dá errado:** `draftQuery.data?.form_data` tem tipo `Json` (union recursivo de `database.ts`). TypeScript aceita qualquer acesso de propriedade mas runtime pode retornar `undefined`.

**Como evitar:** Cast explícito: `const formData = data?.form_data as Record<string, Record<string, unknown>> | null`. Nunca usar `as any` — o cast tipado preserva segurança.

### Armadilha 6: Button sem asChild — não usar wrapper para Link

**O que dá errado:** `<Button variant="ghost" asChild><Link to="...">Ver detalhes</Link></Button>` — `Button` não suporta `asChild` (verificado em `src/components/ui/button.tsx`). A prop é ignorada silenciosamente e o Link não funciona como botão.

**Como evitar:** Usar `buttonVariants` importado de `button.tsx` diretamente no `className` do `<Link>`:
```typescript
import { buttonVariants } from '@/components/ui/button'
<Link to={...} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
```

---

## Exemplos de Código

### SectionProgress — estrutura JSX com computeTabStatus

```typescript
// Source: CONTEXT.md D-07; formStore.ts TabKey; ProgressBadge.tsx; 09-UI-SPEC.md
// src/features/form/SectionProgress.tsx

import { TAB_CONFIG } from './tabConfig'
import { ProgressBadge } from './ProgressBadge'
import { computeTabStatus, STATUS_TO_COMPLETENESS } from '@/lib/sectionStatus'
import { IDENTIFICACAO_REQUIRED_COUNT } from '@/schemas/identificacao'
import { TORRE_DECISAO_REQUIRED_COUNT } from '@/schemas/torre-decisao'
import { TORRE_SIENGE_REQUIRED_COUNT } from '@/schemas/torre-sienge'
import { TORRE_ACESSO_REQUIRED_COUNT } from '@/schemas/torre-acesso'
import { TORRE_CLASSIFICACAO_REQUIRED_COUNT } from '@/schemas/torre-classificacao'
import { HAB_VENDA_REQUIRED_COUNT } from '@/schemas/hab-venda'
import { HAB_REPOSITORIOS_REQUIRED_COUNT } from '@/schemas/hab-repositorios'
import { HAB_RESPONSAVEIS_REQUIRED_COUNT } from '@/schemas/hab-responsaveis'
import { HAB_CLASSIFICACAO_REQUIRED_COUNT } from '@/schemas/hab-classificacao'
import { NDA_REQUIRED_COUNT } from '@/schemas/nda'
import { TabKey } from '@/stores/formStore'

const REQUIRED_COUNTS: Record<TabKey, number> = {
  [TabKey.Identificacao]: IDENTIFICACAO_REQUIRED_COUNT,
  [TabKey.TorreDecisao]: TORRE_DECISAO_REQUIRED_COUNT,
  [TabKey.TorreSienge]: TORRE_SIENGE_REQUIRED_COUNT,
  [TabKey.TorreAcesso]: TORRE_ACESSO_REQUIRED_COUNT,
  [TabKey.TorreClassificacao]: TORRE_CLASSIFICACAO_REQUIRED_COUNT,
  [TabKey.HabVenda]: HAB_VENDA_REQUIRED_COUNT,
  [TabKey.HabRepositorios]: HAB_REPOSITORIOS_REQUIRED_COUNT,
  [TabKey.HabResponsaveis]: HAB_RESPONSAVEIS_REQUIRED_COUNT,
  [TabKey.HabClassificacao]: HAB_CLASSIFICACAO_REQUIRED_COUNT,
  [TabKey.Nda]: NDA_REQUIRED_COUNT,
}

const STATUS_LABELS = {
  empty: { label: 'Não iniciado', className: 'bg-gray-100 text-gray-600' },
  'in-progress': { label: 'Em progresso', className: 'bg-orange-100 text-orange-700' },
  complete: { label: 'Completo', className: 'bg-green-100 text-green-700' },
} as const

type SectionProgressProps = {
  formData: Record<string, Record<string, unknown>> | null
}

export function SectionProgress({ formData }: SectionProgressProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {TAB_CONFIG.map(({ key, label }) => {
        const status = computeTabStatus(key, formData, REQUIRED_COUNTS[key])
        const { label: statusLabel, className } = STATUS_LABELS[status]
        return (
          <div key={key} className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="flex items-center gap-2">
              <ProgressBadge completeness={STATUS_TO_COMPLETENESS[status]} />
              <span className="text-sm font-medium text-gray-900">{label}</span>
            </div>
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs ${className}`}>
              {statusLabel}
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
| Button wrapper para Link | buttonVariants direto no Link | Sem asChild no Button existente — padrão correto |

---

## Log de Premissas

| # | Afirmação | Seção | Risco se Errado |
|---|-----------|-------|-----------------|
| A1 | `Button` não suporta `asChild` — verificado em `src/components/ui/button.tsx` | Padrão 7 / Armadilha 6 | Premissa correta — `button.tsx` usa `forwardRef` simples sem Radix Slot |

**Todas as premissas anteriores (A2, A3) foram resolvidas:**
- A2 (Button asChild): **resolvido** — Button não suporta asChild; usar `buttonVariants` direto
- A3 (form_data shape): **resolvido** — chaves são os valores do enum `TabKey` com hífen (verificado em `formStore.ts`)

---

## Perguntas em Aberto

Nenhuma questão técnica bloqueante restante. As duas perguntas abertas da versão anterior foram resolvidas pela leitura do código.

---

## Disponibilidade do Ambiente

| Dependência | Requerida Por | Disponível | Versão | Fallback |
|-------------|--------------|-----------|--------|---------|
| Node.js | `npm run dev` / `npm test` | ✓ | 20.19.3 | — |
| Supabase project | queries em produção | ✓ | configurado | `.env.local` pendente (Phase 3 todo) |
| Vitest | testes unitários | ✓ | ^4.1.7 | — |
| Supabase CLI | migrations | ✓ | usado em Phase 8.1 | — |

**Nenhuma dependência nova ou bloqueante.**

---

## Arquitetura de Validação

> `nyquist_validation: true` confirmado em `.planning/config.json`.

### Framework de Testes

| Propriedade | Valor |
|-------------|-------|
| Framework | Vitest ^4.1.7 + jsdom + @testing-library/react ^16.3.2 |
| Arquivo de config | `roteiro-unificado/vitest.config.ts` |
| Comando rápido | `cd roteiro-unificado && npm test -- --run` |
| Suite completa | `cd roteiro-unificado && npm test -- --run --coverage` |

### Dimensão 1: Testes Unitários (lógica de componente e funções puras)

Foco em `computeTabStatus` e filtros client-side — funções puras sem dependências externas.

| Req ID | Comportamento | Tipo | Comando | Arquivo |
|--------|--------------|------|---------|---------|
| DASH-04 | `computeTabStatus` retorna 'empty' se tabData vazio/nulo | unit | `npm test -- --run src/lib/sectionStatus.test.ts` | ❌ Wave 0 |
| DASH-04 | `computeTabStatus` retorna 'in-progress' se REQUIRED_COUNT=0 e tem dados | unit | `npm test -- --run src/lib/sectionStatus.test.ts` | ❌ Wave 0 |
| DASH-04 | `computeTabStatus` retorna 'complete' para Identificação (REQUIRED_COUNT=2) com ≥2 campos | unit | `npm test -- --run src/lib/sectionStatus.test.ts` | ❌ Wave 0 |
| DASH-04 | `computeTabStatus` retorna 'in-progress' para NDA (REQUIRED_COUNT=1) com 0 campos preenchidos | unit | `npm test -- --run src/lib/sectionStatus.test.ts` | ❌ Wave 0 |
| DASH-04 | `computeTabStatus` usa chave com hífen ('torre-decisao') não camelCase | unit | `npm test -- --run src/lib/sectionStatus.test.ts` | ❌ Wave 0 |
| DASH-05 | filtro useMemo retorna todas as orgs quando searchTerm='' e gradeFilter='Todos' | unit | `npm test -- --run src/pages/admin/AdminDashboard.test.tsx` | ❌ Wave 0 |
| DASH-05 | filtro por nome filtra case-insensitive | unit | `npm test -- --run src/pages/admin/AdminDashboard.test.tsx` | ❌ Wave 0 |
| DASH-05 | filtro 'Sem avaliação' retorna apenas orgs sem latestAssessment | unit | `npm test -- --run src/pages/admin/AdminDashboard.test.tsx` | ❌ Wave 0 |
| DASH-02 | CompanyCard renderiza badge cinza "Sem avaliação" quando assessment=null | unit | `npm test -- --run src/components/admin/CompanyCard.test.tsx` | ❌ Wave 0 |
| DASH-02 | CompanyCard renderiza Badge G1-G5 quando assessment presente | unit | `npm test -- --run src/components/admin/CompanyCard.test.tsx` | ❌ Wave 0 |
| DASH-02 | CompanyCard exibe "—" em campos sem valor | unit | `npm test -- --run src/components/admin/CompanyCard.test.tsx` | ❌ Wave 0 |

**Estratégia de mock para CompanyCard e AdminDashboard:**
```typescript
// Mock supabase (padrão estabelecido — ver useSubmitAssessment.test.ts)
vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }))
vi.mock('react-router-dom', () => ({ Link: ({ children, to }: any) => <a href={to}>{children}</a> }))
```

### Dimensão 2: Testes de Integração (hooks TanStack Query + Supabase)

Foco em `useOrgsWithReadiness` — normalização do JOIN e filtragem de submitted.

| Req ID | Comportamento | Tipo | Comando | Arquivo |
|--------|--------------|------|---------|---------|
| DASH-01 | `useOrgsWithReadiness` retorna orgs com latestAssessment=null quando sem assessments submetidos | integration | `npm test -- --run src/features/admin/useOrgsWithReadiness.test.ts` | ❌ Wave 0 |
| DASH-01 | `useOrgsWithReadiness` retorna versão mais alta quando há múltiplos assessments submitted | integration | `npm test -- --run src/features/admin/useOrgsWithReadiness.test.ts` | ❌ Wave 0 |
| DASH-01 | `useOrgsWithReadiness` não inclui draft no latestAssessment | integration | `npm test -- --run src/features/admin/useOrgsWithReadiness.test.ts` | ❌ Wave 0 |

**Padrão de mock para hooks com TanStack Query:**
```typescript
// Seguir padrão de useSubmitAssessment.test.ts: QueryClientProvider wrapper + vi.mock supabase
function makeWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return ({ children }: { children: React.ReactNode }) =>
    createElement(QueryClientProvider, { client: qc }, children)
}
```

### Dimensão 3: Testes E2E / UAT (cenários de navegador)

Sem framework E2E instalado no projeto. UAT manual obrigatório:

| Cenário | Verificação Manual |
|---------|-------------------|
| Admin acessa `/admin/dashboard` — vê grid de CompanyCards com badges G1-G5 | Visual inspect |
| Admin filtra por "G2" — apenas orgs com readiness_level_mgmt="G2" aparecem | Visual inspect |
| Admin filtra "Sem avaliação" — apenas orgs sem assessment submetido aparecem | Visual inspect |
| Admin clica "Ver detalhes" em CompanyCard — navega para `/admin/orgs/:orgId` | Navegação |
| Admin em OrgDetail — seção "Avaliações" lista histórico de versões | Visual inspect |
| Construtora acessa `/form/:orgId/dashboard` — vê SectionProgress com estados corretos | Visual inspect |
| Construtora tenta acessar dashboard de outra org — redireciona para própria org | Navegação |
| Construtora clica "Continuar Avaliação" — navega para `/form/:orgId` | Navegação |
| Construtora clica "Ver Histórico" — navega para `/form/:orgId/history` | Navegação |

### Dimensão 4: Testes Visuais/Snapshot

Não aplicável nesta fase — o projeto não usa snapshot testing (biblioteca ausente no package.json). Validação visual é feita por inspeção manual dos estados documentados em `09-UI-SPEC.md`.

Estados obrigatórios a verificar manualmente:
- Loading: 6 Skeleton cards em AdminDashboard
- Loading: Spinner + Skeleton cards em CompanyDashboard
- Empty state: "Nenhuma empresa cadastrada" quando orgs=[]
- Empty state: "Nenhuma avaliação enviada ainda" em CompanyDashboard sem draft
- Grid responsivo: 1/2/3 colunas em mobile/tablet/desktop

### Dimensão 5: Performance (custo de query e re-renders)

| Aspecto | Expectativa | Verificação |
|---------|-------------|-------------|
| Query JOIN orgs+assessments | ≤ 200ms para 5 orgs (piloto pequeno) | DevTools Network tab |
| Filtros client-side | Zero latência (useMemo, sem round-trip) | Inspeção visual — sem loading indicator |
| Re-renders em SectionProgress | 10 cards renderizados uma vez; sem re-render em filtro do admin | React DevTools Profiler |
| staleTime 60s em useOrgsWithReadiness | Sem re-fetch ao navegar AdminDashboard → OrgDetail → AdminDashboard em < 60s | TanStack Query Devtools |

**Nota de escala:** Com 5 construtoras no piloto, não há preocupação de performance nesta fase. A query JOIN retorna no máximo ~25 rows (5 orgs × 5 versões máximas). O `useMemo` de filtros é O(n) com n≤5.

### Dimensão 6: Segurança — RLS e Isolamento por Role

| Ameaça | Camada de Defesa | Como Verificar |
|--------|-----------------|----------------|
| Construtora acessa `/form/:orgIdOutra/dashboard` via URL direta | Cross-tenant guard no CompanyDashboard (`orgId !== authOrgId → Navigate`) | Testar manualmente com orgId diferente na URL |
| Construtora vê dados de outra org via query direta | RLS no Supabase (`assessments_select` policy: `is_org_member(org_id)`) | Query retorna 0 rows sem erro — RLS bloqueia silenciosamente |
| Usuário company acessa `/admin/dashboard` | `AdminRoute` guard: `role !== 'admin' → Navigate('/login')` | Testar com usuário role='company' |
| Admin não autenticado acessa `/admin/dashboard` | `AdminRoute` guard: `!session → Navigate('/login')` | Testar sem sessão |
| Injeção via form_data JSONB renderizado | Dashboard é read-only; valores do JSONB usados como texto, nunca `dangerouslySetInnerHTML` | Code review obrigatório |

**Políticas RLS relevantes (verificadas nas migrations):**
- `assessments_select`: admin vê tudo; company vê apenas `is_org_member(org_id)`
- `orgs_select`: admin vê tudo; company vê apenas `is_org_member(id)`
- Ambas verificadas em `supabase/migrations/20260522000006_rls_policies_orgs.sql` e `20260522000008_rls_policies_assessments.sql`

### Dimensão 7: Acessibilidade

| Elemento | Requisito | Implementação |
|----------|-----------|---------------|
| CompanyCard | `aria-label` semântico | `<article aria-label="...">` — padrão de HistoryPage.tsx |
| Badge "Sem avaliação" | Texto alternativo para screen reader | Texto visível no badge é suficiente; não precisa `aria-label` extra |
| Filtros do admin | Labels de formulário | `<label htmlFor="search">` e `<label htmlFor="grade-filter">` obrigatórios |
| SectionProgress cards | Status legível | Pill de texto ("Não iniciado", "Em progresso", "Completo") — não apenas ícone |
| ProgressBadge SVGs | `aria-hidden="true"` | Já implementado em ProgressBadge.tsx — verificado |
| Botões de navegação | Texto descritivo | "Ver detalhes →", "Continuar Avaliação" — textos são descritivos |
| Grid responsivo | Ordem de foco em mobile | Ordem DOM deve seguir ordem visual; `grid` CSS não reordena DOM |

### Dimensão 8: Lacunas de Cobertura e Riscos

| Lacuna | Risco | Mitigação |
|--------|-------|-----------|
| `useOrgsWithReadiness` não testado contra Supabase real | JOIN com `!left` pode se comportar diferente em produção vs. mock | Teste de integração com mock + verificação visual em staging |
| Estado vazio de SectionProgress (sem draft ativo) | CompanyDashboard quando construtora ainda não iniciou draft — formData=null | Testar caso `draftQuery.data === null` explicitamente |
| Admin sem orgs cadastradas | Grid vazio vs. empty state | Verificar empty state manualmente após limpar banco |
| Filtro "Sem avaliação" com gradeFilter | Interação entre searchTerm e gradeFilter='Sem avaliação' simultâneos | Cobrir no teste do useMemo de filtros |
| `buttonVariants` não exportado em versões anteriores do Button | `import { buttonVariants }` pode falhar | Verificado em `button.tsx` — `buttonVariants` está exportado |

### Taxa de Amostragem

- **Por commit de task:** `cd roteiro-unificado && npm test -- --run`
- **Por merge de wave:** `cd roteiro-unificado && npm test -- --run` (suite completa)
- **Gate de fase:** Suite completa verde + UAT manual das 9 rotas antes de `/gsd:verify-work`

### Gaps do Wave 0

- [ ] `src/lib/sectionStatus.test.ts` — cobre DASH-04 com 5+ casos de `computeTabStatus`
- [ ] `src/components/admin/CompanyCard.test.tsx` — cobre DASH-02 (badge "Sem avaliação", badge G1-G5, campos "—")
- [ ] `src/features/admin/useOrgsWithReadiness.test.ts` — cobre DASH-01 (normalização JOIN, filtragem submitted)
- [ ] `src/pages/admin/AdminDashboard.test.tsx` — cobre DASH-05 (useMemo de filtros com 4+ cenários)
- [ ] `src/features/form/CompanyDashboard.test.tsx` — cobre DASH-03 (cross-tenant guard → Navigate)

A função `computeTabStatus` deve ser exportada em arquivo próprio (`src/lib/sectionStatus.ts`) para ser testável sem montar componente. Seguir o padrão de `src/lib/readiness.test.ts` (testes puros, sem mock de supabase).

---

## Domínio de Segurança

### Categorias ASVS Aplicáveis

| Categoria ASVS | Aplica | Controle Padrão |
|----------------|--------|----------------|
| V2 Autenticação | sim | Supabase Auth via AuthProvider — já implementado (Phase 3) |
| V3 Gerenciamento de Sessão | sim | `createBrowserClient` persiste sessão — já implementado |
| V4 Controle de Acesso | sim | Cross-tenant guard em CompanyDashboard; AdminRoute guarda rotas `/admin/*` |
| V5 Validação de Entrada | não | Dashboard é read-only — nenhum campo de entrada no fluxo crítico (filtros são client-side inofensivos) |
| V6 Criptografia | não | Sem operações criptográficas nesta fase |

### Padrões de Ameaça para este Stack

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Construtora acessando dashboard de outra org via URL manipulation | Spoofing | Cross-tenant guard `orgId !== authOrgId → Navigate` — replicar exatamente HistoryPage |
| Admin vendo dados via RLS bypass | Elevation of Privilege | RLS no Supabase; `is_admin()` function configurada (Phase 2) — não alterar políticas |
| Dados de form_data injetados via JSONB | Tampering | Dashboard é read-only; valores usados como texto, nunca `dangerouslySetInnerHTML` |

---

## Fontes

### Primárias (confiança HIGH)
- `src/features/form/HistoryPage.tsx` — padrão de queryKey, skeleton, cross-tenant guard, card de versão
- `src/components/ui/badge.tsx` — Grade type, gradeConfig, tokens bg-g1..bg-g5
- `src/components/ui/button.tsx` — confirmação: sem asChild, `buttonVariants` exportado
- `src/features/form/ProgressBadge.tsx` — mapeamento completeness → SVG (0, 0-1, 1)
- `src/features/form/tabConfig.ts` — TAB_CONFIG com 10 abas e TabKey enum
- `src/stores/formStore.ts` — TabKey enum values com hífen (e.g., `'torre-decisao'`); shape de sectionData
- `src/schemas/` (10 arquivos) — REQUIRED_COUNT exports verificados; confirmados 8×0, Identificacao=2, NDA=1
- `src/types/database.ts` — colunas da tabela assessments confirmadas; tipo `Json` genérico
- `src/features/admin/useOrgs.ts` — padrão PostgREST com normalização de shape (modelo para useOrgsWithReadiness)
- `src/pages/admin/AdminDashboard.tsx` — estado atual a modificar; lógica de paginação a remover
- `src/pages/admin/OrgDetail.tsx` — estado atual a modificar; layout a preservar
- `src/router.tsx` — estrutura de rotas existente; onde adicionar `/form/:orgId/dashboard`
- `supabase/migrations/20260522000006_rls_policies_orgs.sql` — RLS orgs verificada
- `supabase/migrations/20260522000008_rls_policies_assessments.sql` — RLS assessments verificada
- `.planning/phases/09-dashboard-de-prontid-o/09-CONTEXT.md` — decisões travadas D-01 a D-07
- `.planning/phases/09-dashboard-de-prontid-o/09-UI-SPEC.md` — especificação visual aprovada

### Secundárias (confiança MEDIUM)
- `package.json` — versões de dependências verificadas
- `.planning/STATE.md` — decisões acumuladas de fases anteriores
- `.planning/config.json` — `nyquist_validation: true` confirma seção de validação obrigatória
- `src/features/form/useSubmitAssessment.test.ts` — padrão de mock supabase para testes de hook
- `src/lib/readiness.test.ts` — padrão de teste de função pura sem mock

---

## Metadados

**Breakdown de confiança:**
- Stack padrão: HIGH — todas as dependências verificadas no package.json e codebase
- Arquitetura: HIGH — padrões extraídos diretamente do código existente (HistoryPage, formStore, useOrgs)
- Armadilhas: HIGH — verificadas contra o código real; premissas A2/A3 da versão anterior resolvidas
- Segurança: HIGH — RLS verificada nas migrations; guard verificado em AdminRoute.tsx/HistoryPage.tsx

**Data da pesquisa:** 2026-05-24
**Válido até:** 2026-06-24 (stack estável; mudanças de schema do Supabase invalidam)
