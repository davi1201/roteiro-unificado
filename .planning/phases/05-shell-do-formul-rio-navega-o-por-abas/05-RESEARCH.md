# Phase 5: Shell do Formulário & Navegação por Abas — Pesquisa

**Pesquisado:** 2026-05-22
**Domínio:** Zustand v5 + React Router v7 + Tailwind v4 — navegação por abas com estado cross-step persistido
**Confiança geral:** HIGH

---

<user_constraints>
## Restrições do Usuário (de CONTEXT.md)

### Decisões Bloqueadas

- **D-01:** Expandir `src/stores/formStore.ts` existente — não recriar, não criar store separada. Adicionar `activeTab: TabKey`, `visitedTabs: Set<TabKey>`, `sectionData`, e actions `setActiveTab`, `markTabVisited`, `updateSection`, `resetForm`. Manter `createFormStore(tenantId)` / `useFormStore(tenantId)` como interface pública.
- **D-02:** `sectionData` tipado como `Partial<Record<TabKey, Record<string, unknown>>>` — tipagem genérica em Phase 5. Phase 6 sobrepõe com Zod sem mudar a store.
- **D-03:** `sessionStorage` para `sectionData`; `localStorage` para `activeTab` e `visitedTabs`. Storage split via `partialize`.
- **D-04:** `enum TabKey` TypeScript com 10 valores: `identificacao`, `torre-decisao`, `torre-sienge`, `torre-acesso`, `torre-classificacao`, `hab-venda`, `hab-repositorios`, `hab-responsaveis`, `hab-classificacao`, `nda`. Exportar de `src/stores/formStore.ts`.
- **D-05:** Barra de progresso geral `h-1` sticky no topo — sem percentual numérico, só barra visual. `bg-primary` preenchida, `bg-gray-200` fundo.
- **D-06:** Sidebar: stepper vertical com ícone de status por aba. Ícone é o indicador — sem badge de % em Phase 5.
- **D-07:** Botão "Sair" com `mt-auto` no rodapé da sidebar, separado por `border-t`. Chama `signOut()` do `useAuth()`.
- **D-08:** Sidebar width `min-w-[220px] max-w-[300px]`. Conteúdo principal `flex-1`.
- **D-09:** Proxy de completude por "aba visitada": `0` = não visitada, `0.01` = visitada sem campos, `1` = completa.
- **D-10:** `useFormSection(tabName)` retorna `{ data, updateField, errors, completeness }`.
- **D-11:** `ProgressBadge`: `completeness === 0` → círculo vazio cinza, `> 0 && < 1` → meio-preenchido laranja, `=== 1` → check verde.

### Liberdade do Claude

- **URL hash navigation:** Usar `useLocation().hash` do React Router v7 para ler a aba ativa. `setActiveTab()` atualiza store E `window.location.hash`. Browser back via `popstate` nativo.
- **Estrutura de diretórios:** `src/features/form/` para hooks e componentes do formulário.
- **Mobile:** Sidebar vira `flex overflow-x-auto` com pills horizontais em `< md`. Pills scrolláveis com ícone de status.
- **tabConfig.ts:** Array `{ key: TabKey, label: string }` como fonte única de labels. Definir em `src/features/form/tabConfig.ts`.

### Ideias Diferidas (FORA DO ESCOPO)

- Tooltip no ícone de status "X de Y campos preenchidos" — Phase 6+
- Scroll automático para aba ativa na sidebar mobile (`scrollIntoView`) — Phase 12
- Animação de transição entre abas — Phase 12

</user_constraints>

---

<phase_requirements>
## Requisitos da Fase

| ID | Descrição | Suporte da Pesquisa |
|----|-----------|---------------------|
| FORM-01 | Formulário estruturado em abas: Identificação, Torre 360 (4 abas), Habilitações (4 abas), NDA | `enum TabKey` com 10 valores; `tabConfig.ts` define labels; `TabNavigation` renderiza a lista |
| FORM-04 | Usuário pode navegar entre abas livremente (dados da aba anterior são preservados) | `sectionData` em sessionStorage via Zustand persist; `setActiveTab` + URL hash; `useFormSection` abstrai acesso por aba |
| UX-03 | Indicador visual de aba ativa e progresso geral do formulário | `ProgressBadge` (3 estados) na sidebar; `ProgressBar` sticky no topo calculada sobre todas as abas |

</phase_requirements>

---

## Resumo

Esta fase constrói o shell navegável do formulário: 10 abas identificadas por `enum TabKey`, layout de duas colunas (sidebar de navegação + área de conteúdo), barra de progresso sticky no topo, e estado persistido no Zustand via storage split (localStorage para navegação, sessionStorage para dados de formulário). Nenhum campo real é implementado — esse trabalho fica para as Phases 6 e 7.

O padrão estabelecido nas fases anteriores é sólido: `createFormStore(tenantId)` / `useFormStore(tenantId)` já existem com persist namespaceado por tenant, `Set<T>` já é serializado como Array no `partialize`, e o `AdminLayout` / `AdminSidebar` provêm o padrão visual exato a replicar para o `FormLayout`.

**Recomendação principal:** Expandir `formStore.ts` in-place usando **dois blocos `persist` independentes** — um persistindo para localStorage (`activeTab`, `visitedTabs`) e outro para sessionStorage (`sectionData`). A alternativa de subscriber manual é viável mas aumenta a complexidade do teardown; dois `persist` aninhados (middleware composto) é o padrão documentado no Zustand para storage split.

---

## Mapa de Responsabilidades Arquiteturais

| Capacidade | Tier Principal | Tier Secundário | Justificativa |
|-----------|----------------|-----------------|---------------|
| Estado da navegação por abas (`activeTab`, `visitedTabs`) | Cliente — Zustand (localStorage) | — | Estado de navegação é cliente-side; persiste entre sessões do browser |
| Dados de resposta temporários (`sectionData`) | Cliente — Zustand (sessionStorage) | — | Dados transitórios até Phase 8 (Supabase é a persistência real) |
| Layout do formulário (sidebar + conteúdo) | Frontend — React Components | — | Componentes de UI puros; sem chamadas ao servidor |
| URL hash navigation | Frontend — React Router v7 | Browser History API | `useLocation().hash` lê; `window.location.hash` escreve; popstate nativo para back |
| Indicador de progresso | Frontend — Componentes calculados | Zustand store | `completeness` calculado no hook `useFormSection`; `ProgressBar` agrega por aba |
| Autenticação / Sair | Cliente — useAuth() | Supabase Auth | `signOut()` já implementado em Phase 3; FormLayout apenas consome |

---

## Stack Padrão

### Core (já instalado no projeto)

| Biblioteca | Versão instalada | Propósito | Verificação |
|-----------|------------------|-----------|-------------|
| `zustand` | 5.0.13 | Store cross-step com persist split | [VERIFIED: npm registry] |
| `react-router-dom` | 7.15.1 (re-exporta de `react-router`) | `useLocation().hash`, `useNavigate`, `useParams` | [VERIFIED: npm registry] |
| `tailwindcss` | 4.3.0 + `@tailwindcss/vite` | Classes utilitárias, tokens `@theme` | [VERIFIED: npm registry] |
| `react` | 19.2.6 | Framework base | [VERIFIED: npm registry] |

### Nenhum pacote novo necessário nesta fase

Esta fase **não instala pacotes novos**. Todos os utilitários necessários (Zustand, React Router, Tailwind, Heroicons SVG inline) já estão disponíveis no projeto. A seção de auditoria de pacotes se aplica somente a instalações novas — omitida aqui por não haver nenhuma.

---

## Padrões de Arquitetura

### Diagrama de Fluxo de Dados

```
Browser URL (#torre-decisao)
        │
        ▼
  useLocation().hash   ──── FormLayout (mount effect) ────► setActiveTab(TabKey)
                                                                   │
        ┌──────────────────────────────────────────────────────────┘
        ▼
  formStore (Zustand)
  ├── localStorage:    activeTab, visitedTabs
  └── sessionStorage:  sectionData

        │
        ├──► TabNavigation  ──► ProgressBadge (por aba)
        │         │
        │    item clicado ──► setActiveTab + markTabVisited + window.location.hash
        │
        ├──► ProgressBar (topo) ── calcula média de completeness de todas as abas
        │
        └──► <Outlet> / conteúdo da aba ativa
                   │
             useFormSection(tabName)
             └── { data, updateField, errors, completeness }
```

### Estrutura de Diretórios Recomendada

```
src/
├── stores/
│   └── formStore.ts          # expandir in-place (TabKey enum + novas actions)
├── features/
│   └── form/
│       ├── FormLayout.tsx     # layout principal (flex h-screen)
│       ├── TabNavigation.tsx  # stepper desktop + pills mobile
│       ├── ProgressBar.tsx    # faixa h-1 sticky topo
│       ├── ProgressBadge.tsx  # ícone SVG por estado de completeness
│       ├── useFormSection.ts  # hook abstração data/updateField/errors/completeness
│       └── tabConfig.ts       # array { key: TabKey, label: string } — fonte única
└── router.tsx                 # substituir placeholder por <FormLayout />
```

### Padrão 1: Storage Split no Zustand v5

**O que é:** `persist` middleware do Zustand aceita apenas uma `storage` por instância. Para persistir partes do estado em storages diferentes (localStorage vs. sessionStorage), a abordagem suportada é usar dois middlewares `persist` compostos (aninhados), cada um com `partialize` diferente, ou usar um subscriber manual para escrever em sessionStorage.

**Quando usar:** Sempre que diferentes fatias do estado tiverem ciclos de vida distintos (navegação = entre sessões; dados de rascunho = apenas na sessão atual).

**Problema com a abordagem atual:** O `formStore.ts` existente usa apenas um `persist` apontando para `localStorage`. Adicionar `sectionData` ao mesmo `persist` violaria D-03. A solução é compor dois middlewares `persist`.

**Exemplo — storage split com dois `persist`:**

```typescript
// Fonte: padrão composto do Zustand v5 (verificado nos tipos do pacote instalado)
// ATENÇÃO: Zustand não tem "partialize por storage" nativo. 
// Padrão 1 (recomendado): dois stores separados + composição manual
// Padrão 2 (alternativa): um persist (localStorage) + subscriber que espelha sectionData no sessionStorage

// PADRÃO RECOMENDADO para esta fase — subscriber manual na factory:
export function createFormStore(tenantId: string): StoreApi<FormStore> {
  if (!storesByTenant.has(tenantId)) {
    const store = create<FormStore>()(
      persist(
        (set, get) => ({
          // ...estado existente expandido...
          // actions novas
          updateSection: (tab, data) => {
            set((state) => ({
              sectionData: { ...state.sectionData, [tab]: data },
            }))
          },
        }),
        {
          name: `form-progress-${tenantId}`,
          storage: createJSONStorage(() => localStorage),
          // localStorage: apenas navegação e progresso, NÃO sectionData
          partialize: (state) => ({
            currentStep: state.currentStep,
            completedSteps: [...state.completedSteps],
            activeTab: state.activeTab,
            visitedTabs: [...state.visitedTabs],  // Set → Array
          }),
          onRehydrateStorage: () => (state) => {
            if (state) {
              state.completedSteps = new Set(state.completedSteps as unknown as number[])
              state.visitedTabs = new Set(state.visitedTabs as unknown as TabKey[])
            }
          },
        }
      )
    )

    // sessionStorage para sectionData — subscriber manual
    const SESSION_KEY = `form-data-${tenantId}`
    try {
      const saved = sessionStorage.getItem(SESSION_KEY)
      if (saved) {
        store.setState({ sectionData: JSON.parse(saved) })
      }
    } catch { /* ignore parse errors */ }

    store.subscribe((state, prev) => {
      if (state.sectionData !== prev.sectionData) {
        try {
          sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.sectionData))
        } catch { /* ignore quota errors */ }
      }
    })

    storesByTenant.set(tenantId, store)
  }
  return storesByTenant.get(tenantId)!
}
```

**Observação crítica:** O padrão de dois `persist` compostos em Zustand v5 requer que o segundo persist envolva o primeiro como middleware aninhado, o que torna os tipos TypeScript complexos e o `partialize` ambíguo (ambos veem o estado completo). O **subscriber manual** é mais explícito, mais fácil de testar e não introduz ambiguidade de tipos — preferível para esta fase. [VERIFIED: tipos do pacote instalado `node_modules/zustand/middleware/persist.d.ts`]

### Padrão 2: URL Hash Navigation com React Router v7

**O que é:** `useLocation().hash` retorna o fragmento atual (ex: `"#torre-decisao"`). `window.location.hash = tabKey` escreve sem causar full-navigation. React Router v7 não intercepta mudanças de hash (`<Link>` com `to="#..."` causaria scroll-to-anchor, não mudança de rota) — escrever no hash diretamente via `window.location.hash` é o padrão correto para navegação de UI sem mudar a rota.

**Ciclo completo:**
1. Usuário clica na aba → `setActiveTab(tab)` + `markTabVisited(tab)` + `window.location.hash = tab`
2. Usuário clica "back" → `popstate` dispara → `useLocation().hash` atualiza → `useEffect` detecta mudança → `setActiveTab(hashToTab(location.hash))`
3. Deep-link `#torre-decisao` → ao montar `FormLayout`, ler `location.hash` → `setActiveTab` correspondente (fallback: `TabKey.Identificacao`)

**Detalhe importante — React Router v7 vs v6:** O pacote instalado é `react-router-dom@7.15.1`, que re-exporta tudo de `react-router`. `useLocation()` retorna o objeto `Location` padrão do HTML5 History API, com `.hash` disponível. [VERIFIED: `node_modules/react-router/dist/development/index.d.ts`]

```typescript
// Fonte: tipos verificados em node_modules/react-router/dist/development/index.d.ts
import { useLocation, useNavigate, useParams } from 'react-router-dom'

// FormLayout — sincronização hash ↔ store
useEffect(() => {
  const raw = location.hash.replace('#', '') // "torre-decisao"
  const match = TAB_KEYS.find(k => k === raw)
  setActiveTab(match ?? TabKey.Identificacao)
}, [location.hash])
```

### Padrão 3: ProgressBadge — SVG Inline (sem biblioteca)

**O que é:** O projeto usa Heroicons SVG inline (padrão estabelecido em `AdminSidebar.tsx`). Nenhuma biblioteca de ícones importada — SVG copiado diretamente no JSX com `aria-hidden="true"`.

**Três ícones necessários:**
- Círculo vazio (não iniciado): `<circle cx="12" cy="12" r="9">` com `fill="none" stroke="currentColor"`
- Meio-preenchido (em progresso): semicírculo — pode ser círculo vazio + `clipPath` ou Heroicons `clock` / criar path custom
- Check (completo): Heroicons `CheckCircleIcon` — `M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z`

**Abordagem recomendada para "meio-preenchido":** Usar um path SVG custom de dois semicírculos (esquerda preenchida, direita vazia). Alternativa simples: ícone de relógio Heroicons (`ClockIcon`) que visualmente comunica "em andamento". Decisão sobre qual ícone exato fica a cargo do planner (não há decisão bloqueada para o ícone específico do estado "em progresso").

### Anti-Padrões a Evitar

- **Recriar a store do zero:** `createFormStore` e `useFormStore` devem ser expandidos in-place — não criar `src/stores/tabStore.ts` separada. Cross-tenant leakage é resolvido pela persist key namespaceada, que já existe.
- **Usar `<Link to="#aba">` do React Router para navegação de tabs:** Causa comportamento de scroll-to-anchor, não mudança de aba. Usar `window.location.hash = tabKey` diretamente.
- **Hardcodar hex nos componentes:** Sempre usar tokens `bg-primary`, `text-accent`, `text-green-500`. Nunca `#123B66` ou `#F28C28` nos arquivos `.tsx`.
- **Renderizar `TabNavigation` antes da store reidratar:** Verificar `useStore.persist.hasHydrated()` (Zustand v5 expõe `persist.hasHydrated()` no StoreApi) ou usar flag de loading antes de renderizar a sidebar. [ASSUMED — verificar comportamento exato de `hasHydrated` no Zustand v5]
- **Checar `window` em SSR:** Projeto é Vite SPA puro (sem SSR); `window.location.hash` e `sessionStorage` são seguros.

---

## Não Construir do Zero

| Problema | Não Construir | Usar Em Vez | Motivo |
|----------|---------------|-------------|--------|
| Layout sidebar + conteúdo | Novo sistema de grid | Padrão `AdminLayout` (flex h-screen, sidebar fixa) | Pattern já estabelecido em Phase 4; FormLayout é variação direta |
| Componentes de UI (Button, Spinner) | Novos componentes | `src/components/ui/index.ts` — Button, Spinner, Skeleton | Barrel export já disponível; Button `ghost` para o Sair |
| Autenticação no FormLayout | Novo provider | `useAuth()` de `src/features/auth/useAuth.ts` | Hook já testado em Phase 3; expõe `orgId`, `signOut` |
| Serialização de `Set` para JSON | Lógica customizada | Padrão `[...state.completedSteps]` + `new Set(...)` | Padrão já estabelecido na store existente para `completedSteps` |
| Proteger rota `/form/:orgId` | Novo guard | `ProtectedRoute` existente em `src/components/routing/` | Rota já está dentro do `ProtectedRoute` em `router.tsx` |

**Insight chave:** O projeto já tem todos os building blocks. Phase 5 é puramente integração e extensão — não introduz novas dependências.

---

## Armadilhas Comuns

### Armadilha 1: Storage Split com `partialize` — sectionData vazando para localStorage

**O que dá errado:** Ao adicionar `sectionData` ao estado do Zustand e esquecer de excluí-lo do `partialize`, ele vai para o localStorage junto com a navegação. Isso viola D-03 e pode causar persistência indesejada de dados de formulário entre sessões.

**Por que acontece:** O `partialize` retorna o subconjunto do estado que vai para o storage configurado no `persist`. Se omitido, todo o estado é persistido.

**Como evitar:** `partialize` deve retornar **explicitamente** apenas `{ currentStep, completedSteps, activeTab, visitedTabs }` — nunca `sectionData`. O subscriber manual cuida do sessionStorage separadamente.

**Sinais de alerta:** Abrindo DevTools → Application → Local Storage e encontrando a chave `form-progress-${tenantId}` com `sectionData` no JSON.

---

### Armadilha 2: Sincronização hash ↔ store — loop infinito

**O que dá errado:** Se `useEffect([location.hash])` chama `setActiveTab(tab)` e `setActiveTab` escreve em `window.location.hash`, e o `location.hash` re-dispara o efeito — loop.

**Por que acontece:** O React Router v7 re-renderiza ao detectar mudança de `location`. Se a escrita em `window.location.hash` fizer o React Router emitir nova localização, o `useEffect` dispara de novo.

**Como evitar:** Verificar antes de escrever: `if (location.hash !== '#' + tab) { window.location.hash = tab }`. A condição evita escrita quando o hash já está correto.

**Sinais de alerta:** Console com renders em loop; DevTools Performance mostrando re-renders contínuos no `FormLayout`.

---

### Armadilha 3: `useFormStore(orgId)` — orgId nulo durante hidratação

**O que dá errado:** `FormLayout` tenta chamar `useFormStore(orgId)` mas `orgId` ainda é `null` enquanto `AuthProvider` está carregando. A função `createFormStore` cria uma store com chave `form-progress-null`, corrompendo o isolamento por tenant.

**Por que acontece:** `useAuth().orgId` é assíncrono — fica `null` até o fetch de `org_members` completar.

**Como evitar:** Usar `orgId` de `useParams()` (que é síncrono e vem da URL) como `tenantId`, ou aguardar `isLoading === false` do `useAuth()` antes de renderizar o conteúdo que usa a store. O `ProtectedRoute` já bloqueia na hidratação da sessão auth, mas `orgId` pode ainda ser `null` depois dele.

**Recomendação:** `const { orgId: routeOrgId } = useParams<{ orgId: string }>()` é mais robusto que `useAuth().orgId` para o `tenantId` da store, pois está disponível imediatamente. Verificar se o `routeOrgId` corresponde ao `useAuth().orgId` para segurança extra.

**Sinais de alerta:** Store criada com chave `form-progress-null` visível no localStorage; dados de formulário não persistindo entre navegações.

---

### Armadilha 4: `visitedTabs` como `Set<TabKey>` — serialização no `partialize`

**O que dá errado:** `new Set()` não serializa para JSON corretamente (`JSON.stringify(new Set([1,2]))` retorna `{}`). Se o `partialize` não converter para Array antes de persistir, a reidratação retorna `visitedTabs` como `{}` (objeto vazio), não como `Set`.

**Por que acontece:** `JSON.stringify` ignora propriedades não enumeráveis de `Set`.

**Como evitar:** Mesmo padrão já usado para `completedSteps`: `partialize: (state) => ({ ..., visitedTabs: [...state.visitedTabs] })` e `onRehydrateStorage` reconverte: `state.visitedTabs = new Set(state.visitedTabs as unknown as TabKey[])`.

**Sinais de alerta:** `visitedTabs.has(tab)` lançando `TypeError: visitedTabs.has is not a function` após reload.

---

## Exemplos de Código

### Expansão do formStore.ts (estrutura completa)

```typescript
// Fonte: tipos verificados em node_modules/zustand/middleware/persist.d.ts
// + padrão existente em src/stores/formStore.ts (Phase 3)

export enum TabKey {
  Identificacao      = 'identificacao',
  TorreDecisao       = 'torre-decisao',
  TorreSienge        = 'torre-sienge',
  TorreAcesso        = 'torre-acesso',
  TorreClassificacao = 'torre-classificacao',
  HabVenda           = 'hab-venda',
  HabRepositorios    = 'hab-repositorios',
  HabResponsaveis    = 'hab-responsaveis',
  HabClassificacao   = 'hab-classificacao',
  Nda                = 'nda',
}

interface FormState {
  currentStep: number
  completedSteps: Set<number>
  // Novos em Phase 5:
  activeTab: TabKey
  visitedTabs: Set<TabKey>
  sectionData: Partial<Record<TabKey, Record<string, unknown>>>
}

interface FormActions {
  setCurrentStep: (step: number) => void
  markStepComplete: (step: number) => void
  markStepIncomplete: (step: number) => void
  reset: () => void
  // Novos em Phase 5:
  setActiveTab: (tab: TabKey) => void
  markTabVisited: (tab: TabKey) => void
  updateSection: (tab: TabKey, data: Record<string, unknown>) => void
  resetForm: () => void
}
```

### tabConfig.ts

```typescript
// Fonte: D-04 em 05-CONTEXT.md; enum TabKey definido em formStore.ts
import { TabKey } from '@/stores/formStore'

export interface TabConfig {
  key: TabKey
  label: string
}

export const TAB_CONFIG: TabConfig[] = [
  { key: TabKey.Identificacao,      label: 'Identificação' },
  { key: TabKey.TorreDecisao,       label: 'Torre Decisão' },
  { key: TabKey.TorreSienge,        label: 'Torre Sienge' },
  { key: TabKey.TorreAcesso,        label: 'Torre Acesso' },
  { key: TabKey.TorreClassificacao, label: 'Torre Classificação' },
  { key: TabKey.HabVenda,           label: 'Hab. Venda' },
  { key: TabKey.HabRepositorios,    label: 'Hab. Repositórios' },
  { key: TabKey.HabResponsaveis,    label: 'Hab. Responsáveis' },
  { key: TabKey.HabClassificacao,   label: 'Hab. Classificação' },
  { key: TabKey.Nda,                label: 'NDA' },
]
```

### useFormSection.ts

```typescript
// Fonte: D-10 em 05-CONTEXT.md
import { useFormStore, TabKey } from '@/stores/formStore'

export function useFormSection(tenantId: string, tab: TabKey) {
  const store = useFormStore(tenantId)

  const data = store.sectionData[tab] ?? {}

  const updateField = (field: string, value: unknown) => {
    store.updateSection(tab, { ...data, [field]: value })
  }

  // Phase 5: sem Zod schema — errors sempre vazio
  const errors: Record<string, string> = {}

  // Phase 5: completeness via visitedTabs (D-09)
  const completeness = !store.visitedTabs.has(tab) ? 0 : 0.01

  return { data, updateField, errors, completeness }
}
```

### FormLayout — estrutura de roteamento

```typescript
// Fonte: padrão existente em router.tsx + ProtectedRoute.tsx
// Substituir em router.tsx:
{
  element: <ProtectedRoute />,
  children: [
    {
      path: '/form/:orgId',
      element: <FormLayout />,  // substituir <div>Form Page — Phase 5</div>
    },
  ],
},
```

### ProgressBadge — SVG Inline

```tsx
// Fonte: padrão Heroicons inline de AdminSidebar.tsx
interface ProgressBadgeProps {
  completeness: number  // 0 | 0.01 | 1
}

export function ProgressBadge({ completeness }: ProgressBadgeProps) {
  if (completeness === 1) {
    // Check circle — verde
    return (
      <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24"
           strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )
  }
  if (completeness > 0) {
    // Clock — laranja (em progresso)
    return (
      <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24"
           strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    )
  }
  // Circle empty — cinza (não iniciado)
  return (
    <svg className="h-4 w-4 text-primary-300" fill="none" viewBox="0 0 24 24"
         strokeWidth={1.5} stroke="currentColor" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
    </svg>
  )
}
```

---

## Estado da Arte

| Abordagem Antiga | Abordagem Atual | Quando Mudou | Impacto |
|------------------|-----------------|--------------|---------|
| `react-router-dom` v6 com `useLocation` | `react-router-dom` v7 re-exporta de `react-router` — mesma API `useLocation()` e `.hash` | v7.0 (instalado 7.15.1) | Zero breaking change para uso de `hash` |
| Zustand `persist` com storage único | Zustand v5 sem mudança de API para `persist` — subscriber manual para storage split | Zustand v5 (instalado 5.0.13) | Padrão de subscriber manual permanece válido |
| `formStore.ts` atual: `currentStep` + `completedSteps` (numéricos) | Phase 5 adiciona: `activeTab: TabKey`, `visitedTabs: Set<TabKey>`, `sectionData` | Esta fase | Migração in-place; interface pública `useFormStore` não muda |

**Depreciados/Obsoletos:**
- `currentStep: number` e `completedSteps: Set<number>` na store: não serão removidos em Phase 5 (manter compatibilidade com qualquer uso existente), mas `activeTab: TabKey` os substitui conceitualmente para navegação por abas. Phase 6+ pode deprecar formalmente.

---

## Inventário de Estado em Runtime

> Esta fase não é de renomeação/refatoração. Omitido conforme orientação.

---

## Perguntas em Aberto

1. **`hasHydrated()` no Zustand v5 — API exata**
   - O que sabemos: Zustand v5 expõe `persist.hasHydrated()` no `StoreApi` quando `persist` é usado
   - O que está incerto: se `useFormStore(tenantId)` expõe diretamente esse método, ou se é necessário acessar via `createFormStore(tenantId).persist.hasHydrated()`
   - Recomendação: usar flag local `const [hydrated, setHydrated] = useState(false)` dentro do `onRehydrateStorage` como fallback confiável; ou simplesmente exibir `Spinner` enquanto `sectionData` é `undefined` (indica que store não hidratou ainda)

2. **`orgId` de `useParams` vs `useAuth().orgId`**
   - O que sabemos: `router.tsx` define `/form/:orgId` com `:orgId` sendo o UUID da org; `useAuth().orgId` é o orgId do usuário autenticado
   - O que está incerto: se admin pode acessar `/form/:orgId` de outra empresa (Phase 9 preview); nessa fase, formLayout deve usar `useParams().orgId` como `tenantId`
   - Recomendação: usar `useParams<{ orgId: string }>().orgId` como `tenantId` — mais direto e disponível imediatamente sem aguardar auth async

---

## Disponibilidade de Ambiente

| Dependência | Necessária Para | Disponível | Versão | Fallback |
|-------------|-----------------|------------|--------|----------|
| Node.js | Build / dev server | ✓ | 20.19.3 (do STATE.md) | — |
| `localStorage` / `sessionStorage` | Persist da store | ✓ | Browser API nativa | — |
| Supabase | Não necessário em Phase 5 | ✓ | Já configurado (Phase 3) | — |

**Nenhuma dependência faltando.** Phase 5 é puramente frontend sem novas chamadas ao Supabase.

---

## Arquitetura de Validação

### Framework de Testes

| Propriedade | Valor |
|-------------|-------|
| Framework | Nenhum instalado — Wave 0 deve instalar `vitest` + `@testing-library/react` |
| Arquivo de configuração | Inexistente — Wave 0 deve criar `vitest.config.ts` |
| Comando rápido | `npx vitest run --reporter=verbose` (após instalação) |
| Suite completa | `npx vitest run` |

**Nota:** O projeto não possui nenhum arquivo de teste em `src/` (verificado com `find`). `vitest` e `@testing-library/react` não estão instalados. Para cumprir `nyquist_validation: true`, Wave 0 deve incluir instalação e configuração básica.

**Alternativa pragmática:** Os UATs desta fase são todos testes de navegação de browser (clicar em aba, verificar URL hash, verificar dados preservados). Esses UATs são mais adequados para testes manuais ou E2E (Playwright) do que unit tests. O planner pode optar por documentar os UATs como checklist manual para Phase 5 e introduzir vitest somente quando houver lógica pura testável (ex: `calculateReadiness` na Phase 7).

### Mapeamento de Requisitos → Testes

| ID | Comportamento | Tipo | Comando | Arquivo existe? |
|----|--------------|-------|---------|----------------|
| FORM-01 | `TAB_CONFIG` possui 10 itens com keys e labels corretos | unit | `vitest run src/features/form/tabConfig.test.ts` | ❌ Wave 0 |
| FORM-04 | `useFormSection` retorna `completeness: 0.01` após `markTabVisited` | unit | `vitest run src/features/form/useFormSection.test.ts` | ❌ Wave 0 |
| FORM-04 | `updateSection` persiste `sectionData[tab]` na store | unit | incluso acima | ❌ Wave 0 |
| UX-03 | `ProgressBadge` renderiza ícone correto por `completeness` | unit/component | `vitest run src/features/form/ProgressBadge.test.tsx` | ❌ Wave 0 |
| FORM-04 | Navegação livre entre abas preserva dados (hash ↔ store) | manual / E2E | UAT manual no browser | n/a |

### Taxa de Amostragem

- **Por commit:** `vitest run src/features/form/ --reporter=verbose` (somente novos testes da fase)
- **Por merge de wave:** `vitest run` (suite completa)
- **Gate da fase:** Suite completa verde antes de `/gsd:verify-work`

### Gaps do Wave 0

- [ ] `vitest.config.ts` — configuração básica para Vite + React (jsdom)
- [ ] `src/features/form/tabConfig.test.ts` — cobre FORM-01
- [ ] `src/features/form/useFormSection.test.ts` — cobre FORM-04 (lógica pura)
- [ ] `src/features/form/ProgressBadge.test.tsx` — cobre UX-03 (renderização condicional)
- [ ] Instalar: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `jsdom` como devDependencies

---

## Domínio de Segurança

> `security_enforcement` não está explicitamente definido no config.json — tratado como habilitado.

### Categorias ASVS Aplicáveis

| Categoria ASVS | Aplica | Controle Padrão |
|---------------|--------|-----------------|
| V2 Autenticação | não — Phase 3 cobriu; FormLayout apenas consome `useAuth()` | — |
| V3 Gerenciamento de Sessão | parcial — `signOut()` no botão Sair encerra sessão Supabase corretamente | `useAuth().signOut()` já implementado |
| V4 Controle de Acesso | sim — `/form/:orgId` deve validar que `orgId` da URL = `orgId` do usuário autenticado | Verificar `routeOrgId === authOrgId` antes de renderizar o formulário |
| V5 Validação de Entrada | não aplicável — Phase 5 não tem campos reais (sem inputs de usuário a validar) | — |
| V6 Criptografia | não aplicável | — |

### Padrões de Ameaça Conhecidos

| Padrão | STRIDE | Mitigação Padrão |
|--------|--------|-----------------|
| Acesso direto a `/form/:orgId` de outra empresa | Elevation of Privilege | Verificar `useParams().orgId === useAuth().orgId` em `FormLayout`; redirecionar para `/form/${authOrgId}` se divergir |
| `sectionData` em sessionStorage — XSS pode ler | Information Disclosure | XSS já mitigado pelo React (escape automático); sessionStorage é mesma origem; não armazenar dados sensíveis em Phase 5 (sem campos reais) |

---

## Restrições do Projeto (de CLAUDE.md)

| Diretiva | Impacto em Phase 5 |
|----------|-------------------|
| Stack frontend: React + Vite + Tailwind v4 | FormLayout, TabNavigation, ProgressBar, ProgressBadge devem usar Tailwind v4 com tokens `@theme` |
| Backend/BaaS: Supabase | Phase 5 não chama Supabase diretamente — preparação para Phase 8 |
| Multi-tenant via RLS | `useFormStore(orgId)` usa `orgId` como persist key — isolamento client-side. Verificar `routeOrgId === authOrgId` |
| Documentação em pt-br | RESEARCH.md, PLAN.md, SUMMARY.md em português; código, commits, nomes de arquivo em inglês |
| Nunca hardcodar hex | Usar `bg-primary`, `text-accent`, `text-green-500` nos componentes |
| Não criar arquivos fora do GSD workflow | Cumprido — este é o output do gsd-researcher |

---

## Fontes

### Primárias (confiança HIGH)

- `node_modules/zustand/middleware/persist.d.ts` — tipos do `PersistOptions`, `partialize`, `onRehydrateStorage`, `createJSONStorage` [VERIFIED: pacote instalado v5.0.13]
- `node_modules/react-router/dist/development/index.d.ts` — assinaturas de `useLocation`, `useNavigate`, `useParams`; `Location.hash` [VERIFIED: pacote instalado v7.15.1 via react-router-dom]
- `src/stores/formStore.ts` — padrão existente de `createFormStore` / `useFormStore`, persist key namespaceada, serialização de `Set` [VERIFIED: codebase]
- `src/components/layouts/AdminSidebar.tsx` — padrão de ícones SVG inline, classes Tailwind para estado ativo/inativo [VERIFIED: codebase]
- `src/features/auth/AuthProvider.tsx` — interface `AuthContextType` com `orgId`, `signOut`, `isLoading` [VERIFIED: codebase]
- `src/components/ui/index.ts` — barrel exports disponíveis: Button, Spinner, Badge, Card [VERIFIED: codebase]
- `src/index.css` — tokens `@theme`: `--color-primary`, `--color-accent`, escala `primary-*`, `g1`-`g5` [VERIFIED: codebase]
- `.planning/phases/05-shell-do-formul-rio-navega-o-por-abas/05-CONTEXT.md` — decisões D-01 a D-11 [VERIFIED: codebase]
- `.planning/phases/05-shell-do-formul-rio-navega-o-por-abas/05-UI-SPEC.md` — contrato visual aprovado [VERIFIED: codebase]

### Secundárias (confiança MEDIUM)

- `package.json` — versões exatas de todas as dependências [VERIFIED: codebase]
- STATE.md / ROADMAP.md — contexto histórico das fases anteriores [VERIFIED: codebase]

### Terciárias (confiança LOW)

- Nenhuma — todas as afirmações foram verificadas diretamente no codebase ou nos pacotes instalados.

---

## Log de Premissas

| # | Afirmação | Seção | Risco se Errado |
|---|-----------|-------|-----------------|
| A1 | `useFormStore(tenantId).persist?.hasHydrated()` está disponível no Zustand v5 como API pública | Armadilhas 3, Perguntas em Aberto | Baixo — fallback com `useState` flag no `onRehydrateStorage` é robusto |
| A2 | O ícone de relógio Heroicons para estado "em progresso" é aceitável visualmente pelo usuário | Code Examples / ProgressBadge | Baixo — decisão visual, substituível por qualquer SVG inline |

**Se esta tabela for insuficiente:** Apenas A1 e A2 são premissas — todas as outras afirmações desta pesquisa foram verificadas diretamente.

---

## Metadados

**Breakdown de confiança:**
- Stack padrão: HIGH — todos os pacotes verificados nos `node_modules` instalados
- Arquitetura: HIGH — padrões verificados no codebase existente (formStore, AdminLayout, AdminSidebar)
- Armadilhas: HIGH — baseadas em tipos verificados e padrões observados no código existente
- Testes: MEDIUM — nenhum framework de teste instalado; recomendações são standard para Vite + React

**Data da pesquisa:** 2026-05-22
**Válida até:** 2026-06-22 (bibliotecas estáveis; sem dependências de fast-moving APIs)
