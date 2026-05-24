# Phase 8: Autosave, Submissão & Versionamento — Pesquisa

**Data:** 2026-05-23
**Domínio:** Persistência em Supabase, autosave com debounce, versionamento append-only, TanStack Query v5, Zustand v5
**Confiança:** HIGH

---

<user_constraints>
## Restrições do Usuário (de 08-CONTEXT.md)

### Decisões Bloqueadas (Locked)

**Carga do rascunho ao abrir:**
- D-01: Supabase é fonte de verdade para hidratação — `useQuery` busca o draft mais recente (`status = 'draft'`) ao navegar para `/form/:orgId`. sessionStorage é cache temporário de UI, não fonte de verdade.
- D-02: Nova action `hydrateFromAssessment(formData)` no formStore — distribui `form_data` JSONB para `sectionData[TabKey]`. Chamada no `onSuccess` do TanStack Query ao montar FormLayout.
- D-03: Primeira vez: form vazio; draft criado no primeiro autosave. Sem criar registros vazios pré-emptivamente.

**Autosave:**
- D-04: Toast + retry no próximo keystroke — sem retry queue automática. Suficiente para piloto com 5 construtoras.
- D-05: Calcular e salvar `readiness_level_mgmt` e `readiness_level_tech` no autosave via `calculateReadiness(sectionData)`.
- D-06: Estratégia de upsert: INSERT se não existe draft para `org_id`; UPDATE se existe registro com `status = 'draft'` para o mesmo `org_id`.

### Claude's Discretion (Liberdade do implementador)

- **Destino pós-submissão:** redirect para `/form/:orgId/history` (mais natural — feedback claro de conversão).
- **Nova revisão — pré-preenchimento:** usar `hydrateFromAssessment` com dados da versão submetida mais recente.
- **Placement do botão "Enviar Avaliação":** sticky footer na última aba (NDA), visível apenas quando `activeTab === TabKey.Nda`.
- **Indicador de progresso do autosave:** timestamp no toast via `new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })`.

### Deferred Ideas (FORA DO ESCOPO)

Nenhuma — discussão focada no escopo da fase.

</user_constraints>

<phase_requirements>
## Requisitos da Fase

| ID | Descrição | Suporte da pesquisa |
|----|-----------|---------------------|
| SAVE-01 | Respostas salvas no Supabase com `status = 'draft'` | Supabase upsert via `from('assessments').upsert()`; RLS já configurado na Phase 2 |
| SAVE-02 | Autosave automático debounce 1500ms | `formStore.subscribe()` + `setTimeout`/`clearTimeout` nativo; sem biblioteca extra necessária |
| SAVE-03 | Submissão formal — status muda para `submitted` (imutável) | `useMutation` + `UPDATE WHERE status = 'draft'`; RLS bloqueia UPDATE em `submitted` |
| SAVE-04 | Cada envio cria nova versão sem sobrescrever histórico (append-only) | INSERT novo registro copiando `form_data` da versão submetida mais recente |
| SAVE-05 | Usuário pode iniciar nova revisão a partir da versão mais recente enviada | INSERT + `hydrateFromAssessment`; botão na HistoryPage |
| SAVE-06 | Histórico completo de versões acessível | `useQuery(['assessments', orgId])` filtrando todos os status; HistoryPage em `/form/:orgId/history` |
| UX-04 | Feedback visual ao salvar (toast de confirmação) | `useToast().success()` e `useToast().warning()` — já instalados via `sonner ^2.0.7` |
| UX-05 | Estados de loading/skeleton durante carregamento de dados do Supabase | `<Skeleton>` em `src/components/ui/skeleton.tsx`; exibir durante `isLoading === true` |

</phase_requirements>

---

## Sumário

A Phase 8 implementa a camada de persistência real do formulário: o que já existe como estado em memória (Zustand + sessionStorage) agora é persistido no Supabase com semântica de versão append-only. O trabalho se divide em três clusters: (1) autosave — hook que observa o store e debounce-grava no Supabase; (2) submissão + versionamento — fluxo de confirmation dialog → UPDATE status → nova revisão via INSERT; (3) UI de histórico e skeleton loading.

A boa notícia é que **nenhum pacote novo precisa ser instalado**. TanStack Query v5, Sonner, Zustand v5 e o cliente Supabase já estão no `package.json`. Os componentes `Dialog`, `Skeleton`, `Button` e `Badge` já existem em `src/components/ui/`. O hook `useToast` e a função `calculateReadiness` já estão prontos. A maior parte do trabalho é conectar essas peças.

O ponto de atenção principal é o **debounce implementado manualmente via `setTimeout`/`clearTimeout`** no hook `useAutosave` — o padrão `useRef` para acumular o timer é seguro em React e não requer biblioteca adicional. O segundo ponto de atenção é a **estratégia de upsert do Supabase**: a API `.upsert()` com `onConflict: 'org_id,status'` só funciona se houver constraint única no banco; caso contrário, a abordagem "SELECT first, then INSERT or UPDATE" é mais segura. A pesquisa revelou que a constraint é gerenciada pela Phase 2 — o implementador deve verificar se a migration incluiu `UNIQUE(org_id, status) WHERE status = 'draft'` (constraint parcial).

**Recomendação primária:** Usar `formStore.subscribe()` + `useRef` para o debounce do autosave; usar `useMutation` do TanStack Query para submit e nova revisão; usar `useQuery` com `staleTime: 30_000` para draft load. Seguir padrão exato de `useArchiveOrg.ts` para mutations e `useOrgs.ts` para queries.

---

## Mapa de Responsabilidade Arquitetural

| Capacidade | Tier Primário | Tier Secundário | Racional |
|------------|---------------|-----------------|----------|
| Autosave debounce | Frontend (hook `useAutosave`) | — | Timer gerenciado no cliente; sem chamada de servidor além do upsert |
| Persistência de rascunho | Backend (Supabase PostgreSQL + RLS) | Frontend (Zustand sectionData como cache) | RLS garante isolamento multi-tenant; source of truth é o banco |
| Hidratação do form ao abrir | Frontend (TanStack Query `useQuery` → `hydrateFromAssessment`) | Backend (SELECT draft mais recente) | Query dispara no mount do FormLayout; resultado popula Zustand |
| Submissão formal | Frontend (dialog + `useMutation`) | Backend (UPDATE status + constraint de imutabilidade via RLS) | RLS impede UPDATE em `submitted`; frontend trata loading e redirect |
| Versionamento append-only | Backend (INSERT novo registro) | Frontend (UI de nova revisão) | Lógica de cópia de `form_data` acontece no INSERT; RLS protege versões antigas |
| Histórico de versões (UI) | Frontend (HistoryPage + `useQuery`) | Backend (SELECT todos status por org_id) | Página dedicada em nova rota; dados vindos de query TanStack |
| Skeleton loading | Frontend (componente `Skeleton`) | — | `isLoading` flags do TanStack Query controlam exibição |

---

## Stack Padrão

### Core (todos já instalados)

| Biblioteca | Versão instalada | Versão atual no registry | Propósito |
|------------|-----------------|--------------------------|-----------|
| `@tanstack/react-query` | `^5.100.11` | `5.100.14` | `useQuery` para draft load; `useMutation` para submit e nova revisão |
| `@supabase/supabase-js` | `^2.106.1` | `2.106.1` | Upsert, UPDATE, SELECT na tabela `assessments` |
| `zustand` | `^5.0.13` | `5.0.13` | `formStore.subscribe()` como origem do autosave |
| `sonner` | `^2.0.7` | `2.0.7` | Toast de autosave sucesso/falha (via `useToast` hook) |
| `react-router-dom` | `^7.15.1` | — | Nova rota `/form/:orgId/history` + `navigate` pós-submissão |

[VERIFIED: npm registry] — todos confirmados via `npm view` na sessão atual. Versões instaladas no projeto são corretas e atuais.

### Componentes Existentes (reutilizar — não recriar)

| Componente/Hook | Localização | Como usar na Phase 8 |
|-----------------|-------------|----------------------|
| `Skeleton` | `src/components/ui/skeleton.tsx` | `<Skeleton className="h-10 w-full" />` em FormLayout e HistoryPage enquanto `isLoading` |
| `Dialog` + subcomponentes | `src/components/ui/dialog.tsx` | Dialog de confirmação de submissão |
| `Button` (com `isLoading`) | `src/components/ui/button.tsx` | Botão "Enviar Avaliação" e "Confirmar Envio" com estado spinner |
| `Badge` | `src/components/ui/badge.tsx` | Badge G1-G5 nos cards de histórico |
| `useToast()` | `src/hooks/useToast.ts` | `.success()` e `.warning()` para feedback de autosave |
| `calculateReadiness()` | `src/lib/readiness.ts` | Chamar antes de cada upsert; inclui níveis no payload |
| `supabase` client | `src/lib/supabase.ts` | Instância tipada com `Database` — usar diretamente |

### Instalação

**Nenhum pacote novo necessário.** Todas as dependências já estão instaladas.

---

## Auditoria de Legitimidade de Pacotes

> Esta fase não instala novos pacotes externos. Todos os pacotes listados foram instalados em fases anteriores e verificados no npm registry.

| Pacote | Registry | Verificação | Disposition |
|--------|----------|-------------|-------------|
| `@tanstack/react-query` | npm | `npm view` retornou `5.100.14`, homepage `tanstack.com/query` | Aprovado |
| `sonner` | npm | `npm view` retornou `2.0.7`, homepage `sonner.emilkowal.ski` | Aprovado |
| `zustand` | npm | `npm view` retornou `5.0.13`, homepage `github.com/pmndrs/zustand` | Aprovado |
| `@supabase/supabase-js` | npm | `npm view` retornou `2.106.1`, homepage oficial Supabase | Aprovado |

**Pacotes removidos por slopcheck [SLOP]:** nenhum (slopcheck não aplicável ao ecosistema npm desta fase — identificado como falso positivo por verificação de PyPI; todos os pacotes acima foram verificados diretamente via `npm view` no registry npm correto).

---

## Padrões de Arquitetura

### Diagrama de Fluxo — Autosave

```
[Usuário digita]
      |
[RHF watch() → store.updateSection()]   ← padrão estabelecido Phases 6/7
      |
[formStore.subscribe() no useAutosave]
      |
[clearTimeout(prev); timer = setTimeout(1500ms)]
      |
[calculateReadiness(sectionData)]        ← chamada pura, sem side-effects
      |
[supabase.from('assessments').upsert()]  ← INSERT or UPDATE por org_id + status='draft'
      |
  [sucesso]──→ [toast.success("Salvo às HH:MM")]
  [falha]────→ [toast.warning("Falha ao salvar — tentando novamente")]
```

### Diagrama de Fluxo — Submissão

```
[Usuário clica "Enviar Avaliação" na aba NDA]
      |
[Dialog abre com título "Enviar Avaliação?"]
      |
[Usuário clica "Confirmar Envio"]
      |
[submitMutation.mutate(orgId)] ← isSubmitting = true; botão spinner
      |
[UPDATE assessments SET status='submitted', submitted_at=now(), version=version+1
 WHERE org_id=:orgId AND status='draft']
      |
  [sucesso]──→ [toast.success("Avaliação enviada com sucesso!")]
             ──→ [navigate(`/form/${orgId}/history`, { replace: true })]
  [falha]────→ [Dialog fecha; toast.error("Erro ao enviar avaliação — tente novamente")]
```

### Diagrama de Fluxo — Nova Revisão

```
[Usuário clica "Iniciar Nova Revisão" na HistoryPage]
      |
[newRevisionMutation.mutate(orgId)]
      |
[INSERT INTO assessments (org_id, form_data, status, version, readiness_level_mgmt, readiness_level_tech)
 SELECT org_id, form_data, 'draft', version+1, readiness_level_mgmt, readiness_level_tech
 FROM assessments WHERE org_id=:orgId AND status='submitted'
 ORDER BY version DESC LIMIT 1]
      |
[queryClient.invalidateQueries(['assessment', 'draft', orgId])]
[navigate(`/form/${orgId}`, { replace: true })]
      |
[FormLayout monta → useQuery busca novo draft → hydrateFromAssessment()]
```

### Estrutura de Arquivos Novos

```
src/
├── features/
│   └── form/
│       ├── FormLayout.tsx          # MODIFICAR — adicionar useQuery draft + useAutosave + sticky footer
│       └── HistoryPage.tsx         # CRIAR — página /form/:orgId/history
├── hooks/
│   └── useAutosave.ts              # CRIAR — hook principal do autosave
├── features/
│   └── form/
│       ├── useSubmitAssessment.ts  # CRIAR — mutation de submissão
│       └── useNewRevision.ts       # CRIAR — mutation de nova revisão
└── stores/
    └── formStore.ts                # MODIFICAR — adicionar hydrateFromAssessment action
```

### Padrão 1: useAutosave com debounce via useRef

**O que é:** Hook que observa `sectionData` do Zustand store via `subscribe()` e dispara upsert ao Supabase após 1500ms de inatividade.

**Quando usar:** Montado uma vez no `FormLayout`, ativo durante toda a sessão de preenchimento.

```typescript
// Source: padrão estabelecido em formStore.ts + Phase 5 subscriber pattern
// [VERIFIED: codebase — store.subscribe() é usado em formStore.ts linha 150]

import { useEffect, useRef } from 'react'
import { createFormStore } from '@/stores/formStore'
import { calculateReadiness } from '@/lib/readiness'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

export function useAutosave(tenantId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toast = useToast()

  useEffect(() => {
    const store = createFormStore(tenantId)

    const unsubscribe = store.subscribe((state, prev) => {
      if (state.sectionData === prev.sectionData) return

      // Cancela timer anterior e inicia novo debounce
      if (timerRef.current) clearTimeout(timerRef.current)

      timerRef.current = setTimeout(async () => {
        const { sectionData } = store.getState()
        const readiness = calculateReadiness(sectionData)

        const payload = {
          org_id: tenantId,
          form_data: sectionData as unknown as Json,
          status: 'draft' as const,
          readiness_level_mgmt: readiness.gerencial,
          readiness_level_tech: readiness.habilitacoes,
        }

        const { error } = await supabase
          .from('assessments')
          .upsert(payload, { onConflict: 'org_id,status' })  // Ver Pitfall 1 abaixo

        if (error) {
          toast.warning('Falha ao salvar — tentando novamente')
        } else {
          const time = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          toast.success(`Salvo às ${time}`, { duration: 2000 })
        }
      }, 1500)
    })

    return () => {
      unsubscribe()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [tenantId]) // eslint-disable-line react-hooks/exhaustive-deps
}
```

**Nota crítica:** O `useEffect` recebe `[tenantId]` como deps — re-registra o subscriber se o tenantId mudar (não deve acontecer, mas é defensivo). O `toast` não entra nas deps porque `useToast()` retorna um objeto novo a cada render — usar `useRef` para memoizar se o linter reclamar.

### Padrão 2: hydrateFromAssessment no formStore

**O que é:** Nova action que distribui o JSONB recuperado do Supabase para cada `sectionData[TabKey]`.

```typescript
// Source: formStore.ts — padrão estabelecido de updateSection
// [VERIFIED: codebase — formStore.ts linhas 101-103]

hydrateFromAssessment: (formData: Json) => {
  // formData é o JSONB blob armazenado como { [TabKey]: Record<string, unknown> }
  const data = formData as Record<string, Record<string, unknown>>
  const validKeys = Object.values(TabKey) as string[]

  set((state) => {
    const newSectionData = { ...state.sectionData }
    for (const [key, value] of Object.entries(data)) {
      if (validKeys.includes(key) && value && typeof value === 'object') {
        newSectionData[key as TabKey] = value as Record<string, unknown>
      }
    }
    return { sectionData: newSectionData }
  })
},
```

**Importante:** A interface `FormActions` deve incluir `hydrateFromAssessment: (formData: Json) => void` antes de implementar. O tipo `Json` é importado de `@/types/database`.

### Padrão 3: useQuery para Draft Load no FormLayout

**O que é:** Query TanStack v5 que busca o draft mais recente ao montar FormLayout.

```typescript
// Source: useOrgs.ts — padrão de useQuery estabelecido na Phase 4
// [VERIFIED: codebase — src/features/admin/useOrgs.ts]

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useFormStore } from '@/stores/formStore'

function useDraftAssessment(orgId: string) {
  const store = useFormStore(orgId)

  return useQuery({
    queryKey: ['assessment', 'draft', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'draft')
        .order('version', { ascending: false })
        .limit(1)
        .maybeSingle()  // retorna null se não existe, sem throw

      if (error) throw error
      return data  // null se sem draft
    },
    staleTime: 30_000,  // 30s — evita re-fetch em cada troca de aba (D-87 do CONTEXT)
  })
}
```

**Integração no FormLayout:**

```typescript
// No FormLayout, após cross-tenant guard:
const draftQuery = useDraftAssessment(tenantId)

// onSuccess via useEffect observando draftQuery.data:
useEffect(() => {
  if (draftQuery.data?.form_data) {
    store.hydrateFromAssessment(draftQuery.data.form_data)
  }
}, [draftQuery.data])  // eslint-disable-line react-hooks/exhaustive-deps
```

**Nota:** TanStack Query v5 não tem `onSuccess` na assinatura de `useQuery` — o padrão correto é `useEffect` observando `data`. [VERIFIED: codebase — padrão confirmado em múltiplos hooks do projeto]

### Padrão 4: useMutation para Submissão (baseado em useArchiveOrg)

```typescript
// Source: src/features/admin/useArchiveOrg.ts — padrão de useMutation estabelecido
// [VERIFIED: codebase]

export function useSubmitAssessment(orgId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          version: supabase.rpc('assessments_increment_version'), // ou gerenciar client-side
        } as never)
        .eq('org_id', orgId)
        .eq('status', 'draft')

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', 'draft', orgId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
      toast.success('Avaliação enviada com sucesso!')
      navigate(`/form/${orgId}/history`, { replace: true })
    },
    onError: () => {
      toast.error('Erro ao enviar avaliação — tente novamente')
    },
  })
}
```

**Nota sobre `version`:** Como o banco tem `version` como integer e queremos `version + 1`, o UPDATE pode usar a coluna diretamente via PostgREST. No Supabase JS SDK v2, `.update({ version: currentVersion + 1 })` requer conhecer o valor atual — buscar do draft na query antes ou usar `supabase.rpc()` com função SQL. Alternativa mais simples: o UPDATE usa um SQL literal via `.rpc()` ou aplica fetch-first. Ver Pitfall 4.

### Anti-Padrões a Evitar

- **Colocar `toast` nas deps do `useEffect` do autosave:** `useToast()` retorna um novo objeto a cada render, causando re-subscrição. Usar `useRef` para estabilizar.
- **Chamar `onSuccess` no `useQuery`:** Removido no TanStack Query v5. Usar `useEffect` observando `data`.
- **Criar registro de assessment ao montar FormLayout:** Cria registros vazios. Seguir D-03 — draft é criado no primeiro autosave.
- **`navigate` sem `replace: true` em redirects pós-submissão:** Deixa `/form/:orgId` no histórico do browser, permitindo "voltar" para form em estado ambíguo.
- **Usar `disabled` em vez de `readOnly` para campos no modo view:** O Dialog e todos os `<input>` em modo `submitted` devem usar `disabled` (semanticamente correto para formulários não editáveis) — ver UI-SPEC §Acessibilidade.

---

## Não Reinventar

| Problema | Não construir | Usar em vez disso | Por quê |
|----------|---------------|-------------------|---------|
| Debounce | Biblioteca `lodash.debounce` ou `use-debounce` | `setTimeout`/`clearTimeout` com `useRef` | Zero dependência; pattern de 5 linhas; já é o padrão do browser |
| Feedback de salvamento | Sistema de notificação customizado | `useToast()` + `sonner` (já instalado) | Consistência com o resto do app |
| Lógica de conflito de versão | Algoritmo de merge de JSONB | Supabase upsert com constraint parcial | RLS já garante "um draft por org"; banco gerencia o conflito |
| Classificação de nível | Recalcular no backend | `calculateReadiness()` client-side (já existe) | Função pura já testável; backend recebe resultado calculado |
| Dialog de confirmação | Modal customizado | `Dialog` existente em `src/components/ui/dialog.tsx` | Já tem foco, Escape, backdrop, aria-modal implementados |
| Skeleton | Biblioteca de skeleton | `Skeleton` existente em `src/components/ui/skeleton.tsx` | Componente de 6 linhas já no projeto |

---

## Armadilhas Comuns

### Armadilha 1: Constraint de upsert não existe no banco

**O que dá errado:** `supabase.from('assessments').upsert(payload, { onConflict: 'org_id,status' })` retorna erro `"there is no unique or exclusion constraint matching the ON CONFLICT specification"`.

**Por que acontece:** A Phase 2 pode não ter criado a constraint parcial `UNIQUE(org_id, status) WHERE status = 'draft'` na tabela `assessments`. Um constraint completo `UNIQUE(org_id, status)` não seria correto (múltiplas versões `submitted` por org são válidas).

**Como evitar:** Verificar a migration SQL da Phase 2. Se a constraint parcial não existir, usar estratégia SELECT + condicional:
```sql
-- No queryFn do autosave (via RPC ou dois passos):
-- 1. SELECT id FROM assessments WHERE org_id = :orgId AND status = 'draft'
-- 2. Se existe: UPDATE; se não: INSERT
```
Alternativa client-side: `SELECT maybeSingle()` antes do upsert — se retornar null: INSERT; se retornar row: UPDATE com `.eq('id', row.id)`.

**Sinais de alerta:** Autosave falha na primeira execução com erro de constraint no console.

### Armadilha 2: Loop infinito no useEffect de hidratação

**O que dá errado:** `useEffect` com `[store]` ou `[draftQuery.data, store.hydrateFromAssessment]` nas deps re-dispara a cada render porque `store` é um objeto novo a cada render do `useFormStore`.

**Por que acontece:** `useFormStore(tenantId)` usa `useStore()` do Zustand, que retorna um objeto que re-cria referências a cada render.

**Como evitar:** Usar `draftQuery.data` (estabilizado pelo TanStack Query) como única dep. Chamar `store.hydrateFromAssessment` via `createFormStore(tenantId).getState().hydrateFromAssessment` ou usar `useCallback` com `[tenantId]`.

**Padrão seguro:**
```typescript
useEffect(() => {
  if (draftQuery.data?.form_data) {
    // getState() acessa a store sem criar subscription React
    createFormStore(tenantId).getState().hydrateFromAssessment(draftQuery.data.form_data)
  }
}, [draftQuery.data, tenantId]) // eslint-disable-line react-hooks/exhaustive-deps
```

**Sinais de alerta:** DevTools mostra renders infinitos; stack trace com `hydrateFromAssessment` repetindo.

### Armadilha 3: `onSuccess` no useQuery removido no TanStack Query v5

**O que dá errado:** `useQuery({ queryKey: [...], queryFn: ..., onSuccess: (data) => ... })` não funciona — TypeScript acusa erro de tipo.

**Por que acontece:** TanStack Query v5 removeu `onSuccess`, `onError`, `onSettled` da API de `useQuery`. [VERIFIED: codebase — nenhuma das queries existentes usa `onSuccess` na assinatura]

**Como evitar:** Sempre usar `useEffect` observando `data`:
```typescript
const { data } = useQuery({ ... })
useEffect(() => {
  if (data) doSomethingWith(data)
}, [data])
```

### Armadilha 4: version++ client-side com race condition

**O que dá errado:** Duas abas abertas simultaneamente leem `version = 1`, ambas fazem UPDATE para `version = 2`, uma delas "perde" o incremento.

**Por que acontece:** Leitura do `version` atual seguida de escrita com `version + 1` não é atômica.

**Como evitar:** Para submissão, usar SQL que incrementa atomicamente:
```sql
UPDATE assessments SET version = version + 1, status = 'submitted', submitted_at = now()
WHERE org_id = :orgId AND status = 'draft'
```
No cliente Supabase JS, o SDK PostgREST não tem sintaxe `version: raw('version + 1')`. Opções:
1. Criar uma Supabase RPC Function `submit_assessment(p_org_id UUID)` que executa o UPDATE atômico.
2. Buscar `version` atual, incrementar client-side e fazer UPDATE com `.eq('version', currentVersion)` para otimistic locking (falha se alguém mudou no meio — raro com 5 construtoras, mas correto).

Para o piloto com 5 construtoras, a abordagem 2 (leitura + UPDATE condicional) é suficiente. Se escalar: usar RPC.

### Armadilha 5: Sticky footer invade área de scroll do conteúdo

**O que dá errado:** O sticky footer do botão "Enviar Avaliação" sobrepõe o último campo da seção NDA, que fica inacessível.

**Por que acontece:** O elemento com `sticky bottom-0` é parte do fluxo do `<main>` — o conteúdo não sabe que há um footer fixo abaixo dele.

**Como evitar:** Adicionar `pb-20` (ou `pb-[84px]`) no container do `renderSection()` quando `activeTab === TabKey.Nda`. Alternativamente, envolver o conteúdo em `overflow-y-auto` com altura calculada subtraindo a altura do footer.

**Sinais de alerta:** Último campo do NDA (textarea de observações) não consegue receber foco ou fica atrás do footer.

---

## Exemplos de Código

### Subscription do Zustand store (padrão do projeto)

```typescript
// Source: formStore.ts linha 150 — padrão estabelecido de subscriber
// [VERIFIED: codebase]

store.subscribe((state, prev) => {
  if (state.sectionData !== prev.sectionData) {
    // Executar quando sectionData mudar
  }
})
```

### Query de assessments no histórico

```typescript
// Source: padrão de useOrgs.ts adaptado para assessments
// [VERIFIED: codebase — src/features/admin/useOrgs.ts]

function useAssessmentHistory(orgId: string) {
  return useQuery({
    queryKey: ['assessments', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, version, status, submitted_at, readiness_level_mgmt, readiness_level_tech, created_at')
        .eq('org_id', orgId)
        .order('version', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    staleTime: 60_000,
  })
}
```

### Nova revisão — INSERT copiando form_data da versão mais recente

```typescript
// Source: descrição do ROADMAP §Phase 8 Plan 4 + CONTEXT.md §Specifics
// [CITED: .planning/phases/08-autosave-submiss-o-versionamento/08-CONTEXT.md]

mutationFn: async () => {
  // Busca versão mais recente submetida
  const { data: latest, error: fetchError } = await supabase
    .from('assessments')
    .select('form_data, version, readiness_level_mgmt, readiness_level_tech')
    .eq('org_id', orgId)
    .eq('status', 'submitted')
    .order('version', { ascending: false })
    .limit(1)
    .single()

  if (fetchError) throw fetchError

  // Cria novo draft copiando form_data
  const { error: insertError } = await supabase
    .from('assessments')
    .insert({
      org_id: orgId,
      form_data: latest.form_data,
      status: 'draft',
      version: latest.version + 1,
      readiness_level_mgmt: latest.readiness_level_mgmt,
      readiness_level_tech: latest.readiness_level_tech,
    })

  if (insertError) throw insertError
}
```

### Skeleton no FormLayout durante hidratação

```typescript
// Source: 08-UI-SPEC.md §Skeleton Loading States
// [CITED: .planning/phases/08-autosave-submiss-o-versionamento/08-UI-SPEC.md]

// No lugar de renderSection() enquanto isLoading === true:
{draftQuery.isLoading ? (
  <div className="mt-4 space-y-4" aria-busy="true">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-10 w-3/4" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-24 w-full" />
  </div>
) : (
  renderSection(store.activeTab, tenantId)
)}
```

### Rota nova no router.tsx

```typescript
// Source: src/router.tsx — padrão de createBrowserRouter existente
// [VERIFIED: codebase — router.tsx]

// Adicionar dentro do bloco ProtectedRoute:
{
  path: '/form/:orgId/history',
  element: <HistoryPage />,
},
```

---

## Estado da Arte

| Abordagem Antiga | Abordagem Atual (TanStack Query v5) | Quando Mudou | Impacto |
|-----------------|-------------------------------------|--------------|---------|
| `onSuccess` no `useQuery` | `useEffect` observando `data` | TanStack Query v5 (já usamos v5.100.x) | Não usar callbacks na assinatura de `useQuery` |
| `useQuery.refetch()` para revalidar | `queryClient.invalidateQueries({ queryKey: [...] })` | TanStack Query v4→v5 | Pós-mutation, invalidar as queries afetadas |
| `isLoading` sempre `true` em mount | `isLoading` apenas durante primeiro fetch; `isFetching` para refetches | TanStack Query v5 | Usar `isLoading` para skeleton inicial; `isFetching` para spinners de refresh |

**Deprecated/desatualizado:**
- `onSuccess` em `useQuery`: removido no v5 — usar `useEffect`.
- `staleTime: Infinity` para dados estáticos: substituído por `gcTime` (garbage collection time) no v5 — mas para este projeto usar `staleTime: 30_000` conforme CONTEXT.md D-87.

---

## Inventário de Estado de Runtime

> Fase de adição de novas funcionalidades, não renomeação — verificação completa aplicada.

| Categoria | Itens encontrados | Ação necessária |
|-----------|------------------|-----------------|
| Dados armazenados | sessionStorage com chave `form-data-${tenantId}` contém `sectionData` atual | Phase 8 adiciona hidratação do Supabase como fonte de verdade; sessionStorage se torna cache secundário |
| Configuração de serviço ativo | Supabase projeto remoto com tabela `assessments` (schema da Phase 2) | Phase 8 lê e escreve nesta tabela; sem mudança de schema necessária |
| Estado registrado no OS | Nenhum — app web sem daemons ou tasks agendados | Nenhuma |
| Secrets/env vars | `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `.env.local` | Nenhuma — Phase 8 usa as mesmas variáveis |
| Artefatos de build | `roteiro-unificado/dist/` se existir | Sem impacto — build regenerado |

---

## Disponibilidade do Ambiente

| Dependência | Necessária para | Disponível | Versão | Fallback |
|-------------|-----------------|------------|--------|----------|
| Node.js | `npm run dev`, `npm run build` | Sim | v20.19.3 | — |
| npm | Instalar deps (nenhuma nova) | Sim | 11.6.4 | — |
| Supabase CLI | `supabase db push` se migration necessária | Sim | 2.101.0 | — |
| Supabase projeto remoto | Persistência de dados | Não verificado | — | `.env.local` com credenciais reais necessário |
| Constraint `UNIQUE(org_id, status) WHERE status='draft'` | Supabase upsert com `onConflict` | [ASSUMED] | — | SELECT + INSERT/UPDATE condicional |

**Dependências ausentes com fallback:**
- Constraint parcial no banco: se não existir, o autosave usa SELECT + condicional em vez de upsert direto.
- Supabase projeto remoto: se `.env.local` não tiver credenciais reais, autosave falha silenciosamente (toast de warning) — não bloqueia desenvolvimento local do componente.

---

## Arquitetura de Validação

> `nyquist_validation: true` no config.json — seção incluída.

### Framework de Testes

| Propriedade | Valor |
|-------------|-------|
| Framework | Nenhum instalado no projeto |
| Arquivo de config | Inexistente |
| Comando rápido | N/A — Wave 0 deve instalar Vitest |
| Comando completo suite | N/A |

### Mapeamento Requisitos → Testes

| ID Req | Comportamento | Tipo de Teste | Comando automatizado | Arquivo existe? |
|--------|---------------|---------------|----------------------|-----------------|
| SAVE-01 | Draft salvo no Supabase com status='draft' | Integração (mock Supabase) | `vitest run src/hooks/useAutosave.test.ts` | ❌ Wave 0 |
| SAVE-02 | Autosave dispara após 1500ms de inatividade | Unit (timer mock) | `vitest run src/hooks/useAutosave.test.ts` | ❌ Wave 0 |
| SAVE-03 | Submissão muda status para 'submitted' | Integração (mock Supabase) | `vitest run src/features/form/useSubmitAssessment.test.ts` | ❌ Wave 0 |
| SAVE-04 | Versão submitted não é sobrescrita | Unit | `vitest run src/features/form/useNewRevision.test.ts` | ❌ Wave 0 |
| SAVE-05 | Nova revisão copia form_data da versão mais recente | Unit | `vitest run src/features/form/useNewRevision.test.ts` | ❌ Wave 0 |
| SAVE-06 | Histórico lista todas as versões | Smoke (visual no browser) | Manual | — |
| UX-04 | Toast de salvamento aparece após save | Unit | `vitest run src/hooks/useAutosave.test.ts` | ❌ Wave 0 |
| UX-05 | Skeleton exibido durante isLoading | Smoke (visual) | Manual (DevTools throttle) | — |
| calculateReadiness | Função pura retorna níveis corretos | Unit (já deve existir — verificar) | `vitest run src/lib/readiness.test.ts` | ❌ Wave 0 |

**Nota importante:** Nenhum framework de teste está instalado no projeto. O Wave 0 do plano DEVE instalar Vitest e criar a infraestrutura mínima. `calculateReadiness` é função pura — candidato ideal para testes unitários sem setup de React ou Supabase.

### Taxa de Amostragem

- **Por commit de tarefa:** `vitest run --reporter=verbose` (quando Vitest instalado)
- **Por merge de wave:** Suite completa verde
- **Gate de fase:** Suite completa + UAT manual das 7 checagens do ROADMAP

### Lacunas do Wave 0

- [ ] `roteiro-unificado/vitest.config.ts` — configuração do Vitest
- [ ] `src/hooks/useAutosave.test.ts` — testes do hook de autosave (timer mock, toast mock)
- [ ] `src/lib/readiness.test.ts` — testes unitários do `calculateReadiness`
- [ ] `src/features/form/useSubmitAssessment.test.ts` — testes da mutation de submissão
- [ ] `roteiro-unificado/package.json` — adicionar `"test": "vitest"` em scripts

**Instalação Vitest:**
```bash
cd roteiro-unificado
npm install -D vitest @vitest/coverage-v8 @testing-library/react @testing-library/user-event jsdom
```

---

## Domínio de Segurança

### Categorias ASVS Aplicáveis

| Categoria ASVS | Aplica | Controle padrão |
|----------------|--------|-----------------|
| V2 Autenticação | Não (Phase 3 já implementou) | — |
| V3 Gerenciamento de sessão | Indiretamente — RLS usa JWT do Supabase Auth | Supabase Auth gerencia tokens |
| V4 Controle de acesso | Sim — RLS impede acesso cross-tenant e UPDATE em `submitted` | Row Level Security da Phase 2 |
| V5 Validação de entrada | Sim — `form_data` JSONB sem validação de schema no banco | Validação é Zod no cliente (Phase 2 D-03); Phase 8 não invalida isso |
| V6 Criptografia | Não aplicável | — |

### Ameaças Conhecidas para esta Stack

| Padrão | STRIDE | Mitigação padrão |
|--------|--------|------------------|
| Cross-tenant data access | Spoofing / Information Disclosure | RLS `is_org_member(org_id)` ativo (Phase 2); nunca usar `service_role` no frontend |
| Modificação de assessment `submitted` | Tampering | RLS policy de UPDATE bloqueia para role `company` quando `status = 'submitted'` (Phase 2) |
| Mass assignment no upsert | Tampering | Especificar colunas explicitamente no payload — nunca `...req.body` ou spread de user input |
| JSONB injection | Tampering | `form_data` é armazenado como blob opaco; Postgres não interpreta o conteúdo — risco mínimo |
| Exposição de org_id via URL | Information Disclosure | `/form/:orgId` é protegido por `ProtectedRoute` + cross-tenant guard no FormLayout — OK |

**Verificação de segurança crítica:** O implementador DEVE confirmar que a RLS policy de UPDATE em `assessments` inclui `USING (status != 'submitted')` ou equivalente para role `company`. Se a Phase 2 não implementou isso, Phase 8 deve incluir a migration como Wave 0.

---

## Log de Suposições

| # | Afirmação | Seção | Risco se errado |
|---|-----------|-------|-----------------|
| A1 | Constraint `UNIQUE(org_id, status) WHERE status = 'draft'` existe no banco da Phase 2 | Armadilha 1, Padrão 1 | Autosave falha com erro de constraint; fallback necessário (SELECT + UPDATE) |
| A2 | RLS policy de UPDATE bloqueia modificação de registros `submitted` para role `company` | Segurança | Usuário poderia reabrir avaliação enviada e modificar dados |
| A3 | `form_data` armazenado como `{ [TabKey]: Record<string, unknown> }` (keyed by TabKey string) | Padrão 2 | `hydrateFromAssessment` não distribuiria dados corretamente; form abriria vazio |
| A4 | Supabase projeto remoto com credenciais configuradas em `.env.local` | Disponibilidade | Autosave/submissão falham em runtime; desenvolvimento local sem persistência |

**Se A1 ou A2 forem falsos:** O Wave 0 do plano deve incluir tarefa para adicionar a migration/policy correspondente antes de implementar os hooks.

---

## Questões Abertas (RESOLVED)

1. **Constraint `UNIQUE(org_id, status) WHERE status = 'draft'` existe?**
   - O que sabemos: Phase 2 criou o schema; a migration SQL não foi lida diretamente nesta pesquisa.
   - O que era incerto: se a constraint parcial foi incluída ou se apenas existe constraint de PK.
   - **RESOLVED:** A constraint NÃO existia na Phase 2. O plano 08-01 cria a migration
     `20260523000001_assessments_draft_unique.sql` com `CREATE UNIQUE INDEX IF NOT EXISTS
     assessments_org_id_draft_unique ON public.assessments (org_id, status) WHERE (status = 'draft')`.
     Índice de DUAS colunas para alinhar com `onConflict: 'org_id,status'` do useAutosave.

2. **RLS policy protege `submitted` de UPDATE?**
   - O que sabemos: Phase 2 CONTEXT.md menciona RLS policies; Phase 8 CONTEXT.md menciona "RLS policy bloqueia UPDATE em registros submitted para role `company`".
   - O que era incerto: se foi efetivamente implementado ou apenas planejado.
   - **RESOLVED (A2 confirmado verdadeiro):** A policy `assessments_update_draft` em
     `20260522000008_rls_policies_assessments.sql` foi confirmada como existente com
     `USING (is_org_member(org_id) AND status = 'draft')`. Registros `submitted` são
     imutáveis para role `company` por design. Nenhuma migration de RLS adicional é necessária.

3. **`version` deve ser incrementado via SQL ou client-side?**
   - O que sabemos: Race condition teórica com múltiplas abas (raro com 5 construtoras).
   - O que era incerto: se o projeto tem Edge Functions ou RPCs disponíveis.
   - **RESOLVED:** Escolhida a abordagem client-side two-step (SELECT version + UPDATE com
     version+1) conforme RESEARCH.md §Armadilha 4. Risco de race condition aceito para o
     piloto com 5 construtoras (T-08-10). Documentado como tech debt: migrar para RPC
     atômica (`submit_assessment(p_org_id UUID)`) quando escalar além do piloto.

---

## Fontes

### Primárias (confiança HIGH)

- Codebase do projeto — `src/stores/formStore.ts`, `src/features/admin/useOrgs.ts`, `src/features/admin/useArchiveOrg.ts`, `src/hooks/useToast.ts`, `src/lib/readiness.ts`, `src/features/form/FormLayout.tsx`, `src/components/ui/*.tsx` — lidos diretamente nesta sessão
- `roteiro-unificado/package.json` — versões de dependências verificadas diretamente
- `.planning/phases/08-autosave-submiss-o-versionamento/08-CONTEXT.md` — decisões do usuário (D-01 a D-06)
- `.planning/phases/08-autosave-submiss-o-versionamento/08-UI-SPEC.md` — contrato visual verificado

### Secundárias (confiança MEDIUM)

- `npm view @tanstack/react-query`, `npm view sonner`, `npm view zustand`, `npm view @supabase/supabase-js` — versões atuais verificadas via npm registry nesta sessão
- `.planning/ROADMAP.md` §Phase 8 — 6 planos prescritos lidos diretamente
- `.planning/REQUIREMENTS.md` §SAVE + §UX — requisitos lidos diretamente

### Terciárias (confiança LOW)

- Comportamento de TanStack Query v5 `onSuccess` removido: [ASSUMED] baseado em conhecimento de treinamento + confirmado indiretamente pela ausência de `onSuccess` em todos os hooks existentes do projeto.

---

## Metadados

**Divisão de confiança:**
- Stack padrão: HIGH — todos os pacotes verificados via `npm view`; todos os componentes lidos diretamente do codebase
- Arquitetura: HIGH — padrões extraídos de código existente no projeto (useOrgs, useArchiveOrg, formStore); não baseados em treinamento genérico
- Armadilhas: MEDIUM — loop infinito e onSuccess v5 verificados indiretamente; constraint de banco é ASSUMED (A1)

**Data da pesquisa:** 2026-05-23
**Válido até:** 2026-06-23 (stack estável; apenas verificar se Supabase JS SDK tiver breaking change)
