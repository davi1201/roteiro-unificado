# Phase 8: Autosave, Submissão & Versionamento — Mapa de Padrões

**Mapeado:** 2026-05-23
**Arquivos analisados:** 8 (6 novos/criados + 2 modificados)
**Análogos encontrados:** 8 / 8

---

## Classificação de Arquivos

| Arquivo Novo/Modificado | Role | Data Flow | Análogo Mais Próximo | Qualidade |
|-------------------------|------|-----------|----------------------|-----------|
| `src/hooks/useAutosave.ts` | hook | event-driven (store subscribe + debounce) | `src/stores/formStore.ts` linhas 149-156 (subscriber manual) | role-match |
| `src/features/form/useSubmitAssessment.ts` | hook/mutation | request-response | `src/features/admin/useArchiveOrg.ts` | exact |
| `src/features/form/useNewRevision.ts` | hook/mutation | request-response | `src/features/admin/useArchiveOrg.ts` | exact |
| `src/features/form/HistoryPage.tsx` | component/page | request-response (CRUD read) | `src/pages/admin/OrgDetail.tsx` | role-match |
| `src/stores/formStore.ts` (modificar) | store | CRUD / transform | `src/stores/formStore.ts` linhas 100-103 (`updateSection`) | exact |
| `src/features/form/FormLayout.tsx` (modificar) | component | request-response + event-driven | `src/features/form/FormLayout.tsx` (si mesmo) | exact |
| `src/router.tsx` (modificar) | config/route | request-response | `src/router.tsx` linhas 33-36 (rota `/form/:orgId`) | exact |
| `supabase/migrations/` (possível) | migration | — | Fases anteriores | partial |

---

## Atribuições de Padrão

### `src/hooks/useAutosave.ts` (hook, event-driven)

**Análogo:** `src/stores/formStore.ts` (subscriber manual, linhas 139-156) + `src/hooks/useToast.ts`

**Padrão de imports** (baseado em formStore.ts linhas 1-3 + useToast.ts linha 1):
```typescript
import { useEffect, useRef } from 'react'
import { createFormStore } from '@/stores/formStore'
import { calculateReadiness } from '@/lib/readiness'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import type { Json } from '@/types/database'
```

**Padrão central — subscriber Zustand com debounce via useRef** (espelha formStore.ts linhas 139-156):
```typescript
export function useAutosave(tenantId: string) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastRef = useRef(useToast())   // estabiliza — useToast() retorna objeto novo a cada render

  useEffect(() => {
    const store = createFormStore(tenantId)

    const unsubscribe = store.subscribe((state, prev) => {
      if (state.sectionData === prev.sectionData) return   // referência idêntica = sem mudança

      if (timerRef.current) clearTimeout(timerRef.current)  // cancela debounce anterior

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
          .upsert(payload, { onConflict: 'org_id,status' })  // ATENÇÃO: requer UNIQUE parcial — ver Armadilha 1

        if (error) {
          toastRef.current.warning('Falha ao salvar — tentando novamente')
        } else {
          const time = new Date().toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })
          toastRef.current.success(`Salvo às ${time}`, { duration: 2000 })
        }
      }, 1500)
    })

    return () => {
      unsubscribe()
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [tenantId])  // eslint-disable-line react-hooks/exhaustive-deps
}
```

**Análogo de subscriber existente** (formStore.ts linhas 149-156):
```typescript
// Padrão exato do subscriber manual já em uso no projeto:
store.subscribe((state, prev) => {
  if (state.sectionData !== prev.sectionData) {
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(state.sectionData))
    } catch {}
  }
})
```

**Nota crítica:** `toast` NÃO entra no array de deps do `useEffect` — `useToast()` retorna objeto novo a cada render. Usar `useRef` para memoizar (conforme Anti-Padrão documentado em RESEARCH.md).

---

### `src/features/form/useSubmitAssessment.ts` (hook/mutation, request-response)

**Análogo:** `src/features/admin/useArchiveOrg.ts` (linhas 1-26) — match exato de estrutura

**Padrão de imports** (useArchiveOrg.ts linhas 1-3):
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'
```

**Padrão central — useMutation com invalidação e navigate** (espelha useArchiveOrg.ts linhas 5-26):
```typescript
export function useSubmitAssessment(orgId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
    mutationFn: async () => {
      // Busca version atual antes de incrementar (evita race condition — ver Armadilha 4)
      const { data: draft, error: fetchError } = await supabase
        .from('assessments')
        .select('version')
        .eq('org_id', orgId)
        .eq('status', 'draft')
        .single()

      if (fetchError) throw fetchError

      const { error } = await supabase
        .from('assessments')
        .update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          version: draft.version + 1,
        } as never)
        .eq('org_id', orgId)
        .eq('status', 'draft')

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', 'draft', orgId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
      toast.success('Avaliação enviada com sucesso!')
      navigate(`/form/${orgId}/history`, { replace: true })  // replace: true — padrão de auth (FormLayout.tsx linha 97)
    },
    onError: () => {
      toast.error('Erro ao enviar avaliação — tente novamente')
    },
  })
}
```

**Padrão de analog de referência completo** (useArchiveOrg.ts linhas 1-26):
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

export function useArchiveOrg() {
  const queryClient = useQueryClient()
  const toast = useToast()

  return useMutation({
    mutationFn: async (orgId: string) => {
      const { error } = await supabase
        .from('orgs')
        .update({ active: false } as never)
        .eq('id', orgId)
      if (error) throw error
    },
    onSuccess: (_data, orgId) => {
      queryClient.invalidateQueries({ queryKey: ['orgs'] })
      queryClient.invalidateQueries({ queryKey: ['orgs', orgId] })
      toast.success('Organização arquivada')
    },
    onError: () => {
      toast.error('Erro ao arquivar organização. Tente novamente.')
    },
  })
}
```

---

### `src/features/form/useNewRevision.ts` (hook/mutation, request-response)

**Análogo:** `src/features/admin/useArchiveOrg.ts` (linhas 1-26) — mesma estrutura de useMutation

**Padrão de imports** (idêntico ao useArchiveOrg.ts + navigate):
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'
import { useNavigate } from 'react-router-dom'
```

**Padrão central — INSERT copiando form_data da versão submetida mais recente**:
```typescript
export function useNewRevision(orgId: string) {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const toast = useToast()

  return useMutation({
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

      // INSERT novo draft copiando form_data (append-only — versões submitted intocadas)
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
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assessment', 'draft', orgId] })
      queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
      navigate(`/form/${orgId}`, { replace: true })
    },
    onError: () => {
      toast.error('Erro ao iniciar nova revisão — tente novamente')
    },
  })
}
```

---

### `src/features/form/HistoryPage.tsx` (component/page, CRUD read)

**Análogo:** `src/pages/admin/OrgDetail.tsx` (linhas 1-98) — page que usa `useParams` + query + isLoading guard + Card layout

**Padrão de imports** (OrgDetail.tsx linhas 1-7):
```typescript
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button, Card, CardHeader, CardContent } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { useNewRevision } from './useNewRevision'
```

**Padrão de isLoading guard** (OrgDetail.tsx linhas 15-21):
```typescript
// Padrão idêntico ao OrgDetail — guard no topo do componente:
if (isLoading) {
  return (
    <div className="space-y-4 p-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
    </div>
  )
}
```

**Padrão de useQuery para histórico** (baseado em useOrgs.ts linhas 22-45):
```typescript
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

**Padrão de estrutura JSX** (OrgDetail.tsx linhas 45-98):
```typescript
export function HistoryPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const navigate = useNavigate()
  const { data: history, isLoading } = useAssessmentHistory(orgId ?? '')
  const newRevisionMutation = useNewRevision(orgId ?? '')

  if (isLoading) { /* Skeleton */ }
  if (!history || history.length === 0) { /* Estado vazio */ }

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Breadcrumb — padrão de OrgDetail.tsx linhas 48-54 */}
      <nav aria-label="Breadcrumb" className="text-sm">...</nav>

      {/* Card lista de versões — padrão de OrgDetail.tsx linhas 66-80 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Histórico de Avaliações</h2>
          <Button
            variant="primary"
            onClick={() => newRevisionMutation.mutate()}
            isLoading={newRevisionMutation.isPending}   // padrão de ArchiveOrgDialog.tsx linha 58
          >
            Iniciar Nova Revisão
          </Button>
        </CardHeader>
        <CardContent>
          {history.map(row => (
            <div key={row.id}>
              <Badge>{row.status === 'draft' ? 'Rascunho' : 'Enviada'}</Badge>
              {/* ... campos da versão ... */}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
```

---

### `src/stores/formStore.ts` — adicionar `hydrateFromAssessment` (store, transform)

**Análogo:** `src/stores/formStore.ts` linhas 100-103 (`updateSection` action) — padrão exato de set() com spread

**Padrão da action existente para copiar** (formStore.ts linhas 100-103):
```typescript
// Padrão de updateSection — BASE para hydrateFromAssessment:
updateSection: (tab, data) =>
  set((state) => ({ sectionData: { ...state.sectionData, [tab]: data } })),
```

**Nova action `hydrateFromAssessment`** (adicionar na interface `FormActions` + impl):
```typescript
// 1. Adicionar na interface FormActions (após linha 54):
hydrateFromAssessment: (formData: Json) => void

// 2. Adicionar na implementação do store (após updateSection, antes de resetForm):
hydrateFromAssessment: (formData) => {
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

**Import necessário** (adicionar no topo de formStore.ts junto com os imports existentes):
```typescript
import type { Json } from '@/types/database'
```

---

### `src/features/form/FormLayout.tsx` — adicionar useQuery + useAutosave + sticky footer (component, request-response)

**Análogo:** `src/features/form/FormLayout.tsx` (si mesmo) — arquivo a ser modificado

**Padrão de imports a adicionar** (inserir após os imports existentes nas linhas 1-20):
```typescript
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Skeleton } from '@/components/ui/skeleton'
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '@/components/ui/dialog'
import { useAutosave } from '@/hooks/useAutosave'
import { useSubmitAssessment } from './useSubmitAssessment'
import { createFormStore } from '@/stores/formStore'
```

**Padrão de useQuery para draft load** (baseado em useOrgs.ts + useOrgDetail.ts):
```typescript
// Adicionar no corpo de FormLayout, após `const store = useFormStore(tenantId)`:
const draftQuery = useQuery({
  queryKey: ['assessment', 'draft', tenantId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('org_id', tenantId)
      .eq('status', 'draft')
      .order('version', { ascending: false })
      .limit(1)
      .maybeSingle()      // retorna null se não existe draft — sem throw (D-03)
    if (error) throw error
    return data
  },
  staleTime: 30_000,      // 30s — evita re-fetch em cada troca de aba (D-01)
  enabled: !!tenantId,    // padrão de useOrgDetail.ts linha 17
})
```

**Padrão de hidratação — useEffect observando data** (TanStack v5: sem onSuccess):
```typescript
// CRÍTICO: TanStack Query v5 não tem onSuccess em useQuery — usar useEffect (ver RESEARCH.md Armadilha 3)
useEffect(() => {
  if (draftQuery.data?.form_data) {
    // getState() acessa store sem criar subscription React — evita loop infinito (Armadilha 2)
    createFormStore(tenantId).getState().hydrateFromAssessment(draftQuery.data.form_data)
  }
}, [draftQuery.data, tenantId])  // eslint-disable-line react-hooks/exhaustive-deps
```

**Padrão de montagem de useAutosave**:
```typescript
// Montar hook após guards de auth (linha 88 do FormLayout atual):
useAutosave(tenantId)   // hook sem return — efeito colateral puro; sem deps adicionais
```

**Padrão de Skeleton durante isLoading** (espelha OrgDetail.tsx linhas 15-21):
```typescript
// No JSX, substituir `{renderSection(store.activeTab, tenantId)}` por:
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

**Padrão de sticky footer com Dialog de confirmação** (espelha ArchiveOrgDialog.tsx linhas 32-64):
```typescript
// Adicionar estado local para controlar dialog:
const [isSubmitOpen, setIsSubmitOpen] = useState(false)
const submitMutation = useSubmitAssessment(tenantId)

// No JSX, após </main>:
{store.activeTab === TabKey.Nda && (
  <div className="sticky bottom-0 border-t border-gray-200 bg-white p-4 shadow-md">
    <Button variant="primary" onClick={() => setIsSubmitOpen(true)}>
      Enviar Avaliação
    </Button>
  </div>
)}

{/* Dialog de confirmação — padrão exato de ArchiveOrgDialog.tsx */}
<Dialog open={isSubmitOpen} onClose={() => setIsSubmitOpen(false)}>
  <DialogHeader>
    <DialogTitle>Enviar Avaliação?</DialogTitle>
  </DialogHeader>
  <DialogContent>
    <p className="text-sm text-gray-700">
      Após o envio, a avaliação ficará bloqueada para edição. Você poderá iniciar uma nova
      revisão a partir do histórico.
    </p>
  </DialogContent>
  <DialogFooter>
    <Button variant="secondary" onClick={() => setIsSubmitOpen(false)}
      disabled={submitMutation.isPending}>
      Cancelar
    </Button>
    <Button variant="primary" isLoading={submitMutation.isPending}   {/* padrão de ArchiveOrgDialog.tsx linha 58 */}
      onClick={() => submitMutation.mutate()}>
      {submitMutation.isPending ? 'Enviando...' : 'Confirmar Envio'}
    </Button>
  </DialogFooter>
</Dialog>
```

**Nota pb-20** (ver RESEARCH.md Armadilha 5 — sticky footer invade área de scroll):
```typescript
// No container de renderSection, adicionar padding-bottom quando na aba NDA:
<main className={`flex-1 p-4 md:p-6 ${store.activeTab === TabKey.Nda ? 'pb-20' : ''}`}>
```

---

### `src/router.tsx` — adicionar rota `/form/:orgId/history` (config/route)

**Análogo:** `src/router.tsx` linhas 33-36 (rota `/form/:orgId` existente) — match exato

**Padrão de import a adicionar** (linha 10 do router.tsx):
```typescript
import { HistoryPage } from '@/features/form/HistoryPage'
```

**Padrão de adição de rota** (espelha router.tsx linhas 30-36):
```typescript
// Dentro do bloco `element: <ProtectedRoute />` (após linha 33):
{
  element: <ProtectedRoute />,
  children: [
    {
      path: '/form/:orgId',
      element: <FormLayout />,
    },
    // ADICIONAR:
    {
      path: '/form/:orgId/history',
      element: <HistoryPage />,
    },
  ],
},
```

---

## Padrões Compartilhados

### Toast — feedback de operações
**Fonte:** `src/hooks/useToast.ts` (linhas 1-38)
**Aplicar em:** `useAutosave.ts`, `useSubmitAssessment.ts`, `useNewRevision.ts`
```typescript
// Importar e usar sempre via wrapper — nunca `toast` do sonner diretamente:
import { useToast } from '@/hooks/useToast'

const toast = useToast()
toast.success('mensagem')
toast.warning('mensagem')
toast.error('mensagem')
```

### useMutation — estrutura de mutation
**Fonte:** `src/features/admin/useArchiveOrg.ts` (linhas 1-26)
**Aplicar em:** `useSubmitAssessment.ts`, `useNewRevision.ts`
```typescript
return useMutation({
  mutationFn: async (...) => {
    const { error } = await supabase.from('...').update(...).eq(...)
    if (error) throw error
  },
  onSuccess: (_data, args) => {
    queryClient.invalidateQueries({ queryKey: [...] })
    toast.success('...')
  },
  onError: () => {
    toast.error('...')
  },
})
```

### navigate com replace: true
**Fonte:** `src/features/form/FormLayout.tsx` linha 97 (`<Navigate to={...} replace />`) + `src/features/auth/*.ts`
**Aplicar em:** `useSubmitAssessment.ts` (pós-submit), `useNewRevision.ts` (pós-insert)
```typescript
navigate(`/form/${orgId}/history`, { replace: true })  // Não deixa URL ambígua no histórico do browser
```

### `as never` no Supabase update
**Fonte:** `src/features/admin/useArchiveOrg.ts` linha 13 + `src/features/admin/useOrgDetail.ts`
**Aplicar em:** `useSubmitAssessment.ts`
```typescript
// O SDK Supabase JS v2 com tipos strict requer `as never` em updates parciais:
.update({ status: 'submitted', submitted_at: new Date().toISOString() } as never)
```

### enabled: !!param em useQuery
**Fonte:** `src/features/admin/useOrgDetail.ts` linha 17
**Aplicar em:** Draft query no FormLayout, useAssessmentHistory na HistoryPage
```typescript
useQuery({
  queryKey: [...],
  queryFn: async () => { ... },
  enabled: !!orgId,   // não dispara quando orgId é undefined
})
```

### Dialog + mutation.isPending para loading no botão
**Fonte:** `src/components/admin/ArchiveOrgDialog.tsx` linhas 54-61
**Aplicar em:** Dialog de confirmação de submissão no FormLayout
```typescript
<Button isLoading={mutation.isPending} disabled={mutation.isPending}>
  {mutation.isPending ? 'Texto de progresso...' : 'Texto normal'}
</Button>
```

---

## Sem Análogo Encontrado

| Arquivo | Role | Data Flow | Razão |
|---------|------|-----------|-------|
| `supabase/migrations/` (UNIQUE parcial) | migration | — | Sem migrations de constraint parcial no codebase; seguir padrão SQL da Phase 2 se necessário |

---

## Armadilhas Documentadas (para o Planner referenciar no PLAN.md)

1. **Constraint UNIQUE(org_id, status) WHERE status = 'draft'** — verificar existência na migration da Phase 2 antes de usar `upsert({ onConflict: 'org_id,status' })`; fallback: SELECT + INSERT/UPDATE condicional
2. **Loop infinito na hidratação** — deps do `useEffect` devem ser `[draftQuery.data, tenantId]`, nunca `[store]` ou `[store.hydrateFromAssessment]`
3. **TanStack Query v5 sem onSuccess em useQuery** — usar `useEffect` observando `data`
4. **version++ com race condition** — buscar version atual antes do UPDATE; não calcular client-side sem busca prévia
5. **Sticky footer cobrindo conteúdo NDA** — adicionar `pb-20` no container de `renderSection` quando `activeTab === TabKey.Nda`

---

## Metadados

**Escopo de busca de análogos:** `roteiro-unificado/src/` (todos os subdiretórios)
**Arquivos varridos:** 70 (via listagem + leitura direta dos análogos)
**Data de extração:** 2026-05-23
