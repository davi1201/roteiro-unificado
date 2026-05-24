---
phase: 08-autosave-submissao-versionamento
reviewed: 2026-05-23T00:00:00Z
depth: standard
files_reviewed: 9
files_reviewed_list:
  - roteiro-unificado/src/hooks/useAutosave.ts
  - roteiro-unificado/src/stores/formStore.ts
  - roteiro-unificado/src/features/form/useSubmitAssessment.ts
  - roteiro-unificado/src/features/form/useNewRevision.ts
  - roteiro-unificado/src/features/form/FormLayout.tsx
  - roteiro-unificado/src/features/form/HistoryPage.tsx
  - roteiro-unificado/src/router.tsx
  - roteiro-unificado/src/types/database.ts
  - supabase/migrations/20260523000001_assessments_draft_unique.sql
findings:
  critical: 3
  warning: 4
  info: 3
  total: 10
status: issues_found
---

# Fase 08: Relatório de Code Review

**Revisado em:** 2026-05-23
**Profundidade:** standard
**Arquivos revisados:** 9
**Status:** issues_found

---

## Resumo

Revisão adversarial da fase 08 (autosave, submissão e versionamento). Os arquivos cobrem a
persistência de rascunhos via Supabase, submissão formal, nova revisão, histórico e roteamento.

A implementação demonstra atenção genuína a problemas difíceis (debounce, hydration loop,
SELECT→UPDATE/INSERT em vez de upsert com índice parcial). Ainda assim, foram encontradas três
falhas críticas: ausência de cross-tenant guard na `HistoryPage`, race condition real no
SELECT→INSERT do autosave e race condition no incremento de version na submissão. Quatro
warnings adicionais degradam robustez.

---

## Problemas Críticos

### CR-01: HistoryPage não tem cross-tenant guard — qualquer org autenticada acessa o histórico de outra

**Arquivo:** `roteiro-unificado/src/features/form/HistoryPage.tsx:52-55`

**Problema:** `HistoryPage` extrai `orgId` de `useParams()` e o usa diretamente nas queries sem
verificar se corresponde ao `authOrgId` da sessão autenticada. Um usuário da org `AAA` pode
navegar manualmente para `/form/BBB/history` e, se a RLS do Supabase não estiver configurada para
bloquear leitura de outras orgs (o que requereria políticas explícitas de SELECT cobrindo
`assessments`), veria o histórico da org `BBB`.

`FormLayout` tem esse guard explicitamente (linhas 149-151) mas `HistoryPage` não herda essa
proteção — as duas rotas são irmãs no router, ambas filhas de `ProtectedRoute` que só verifica
autenticação, não tenant.

```tsx
// HistoryPage.tsx — estado atual (linhas 51-55)
export function HistoryPage() {
  const { orgId } = useParams<{ orgId: string }>()
  // AUSENTE: verificação se orgId === authOrgId
  const { data: history, isLoading } = useAssessmentHistory(orgId ?? '')
```

**Correção:** Adicionar o mesmo guard de `FormLayout` na `HistoryPage`:

```tsx
export function HistoryPage() {
  const { orgId } = useParams<{ orgId: string }>()
  const { orgId: authOrgId, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  if (authLoading) return <Spinner />
  if (!orgId || !authOrgId) return <Navigate to="/login" replace />
  if (orgId !== authOrgId) return <Navigate to={`/form/${authOrgId}/history`} replace />

  // ...restante do componente
}
```

---

### CR-02: Race condition real no autosave — dois SELECT→INSERT simultâneos violam o índice único com perda silenciosa de dados

**Arquivo:** `roteiro-unificado/src/hooks/useAutosave.ts:62-96`

**Problema:** O fluxo SELECT → (INSERT se não existe) cria uma janela de race condition. Se o
usuário digita em duas abas do mesmo browser simultaneamente (ou se o debounce de duas sessões
distintas dispara com overlap), ambas as execuções paralelas podem:

1. Executar `SELECT ... WHERE status='draft'` e ambas receberem `existing = null`
2. Ambas executarem `INSERT` — a segunda falhará com violação do índice único
   (`assessments_org_id_draft_unique`)
3. O erro é capturado como `saveError` e exibido como toast "Falha ao salvar — tentando novamente"
4. **A partir desse ponto, o autosave continua funcionando para quem tem o draft**, mas o toast
   de erro passa a mensagem errada e **as mudanças daquela sessão são descartadas silenciosamente**.

O comentário na linha 83 `// guard extra contra condição de corrida` no UPDATE é correto, mas
não há guard equivalente no INSERT. O índice parcial existe precisamente para capturar essa
colisão, mas o código não trata o erro de unicidade de forma diferenciada de outros erros.

**Correção:** Após falha no INSERT, verificar se é violação de unicidade (`code: '23505'`) e
re-tentar como UPDATE:

```typescript
const { error: insertError } = await supabase.from('assessments').insert(insertPayload)
if (insertError) {
  if (insertError.code === '23505') {
    // Corrida: outro processo inseriu o draft — re-fetch e atualiza
    const { data: retried } = await supabase
      .from('assessments').select('id').eq('org_id', orgId).eq('status', 'draft').maybeSingle()
    if (retried?.id) {
      const { error } = await supabase.from('assessments')
        .update(updatePayload).eq('id', retried.id).eq('status', 'draft')
      saveError = error
    }
  } else {
    saveError = insertError
  }
}
```

---

### CR-03: useSubmitAssessment — incremento de version é não-atômico (read-modify-write sem lock)

**Arquivo:** `roteiro-unificado/src/features/form/useSubmitAssessment.ts:14-33`

**Problema:** O código faz `SELECT version` seguido de `UPDATE version = draft.version + 1`.
Esse padrão é uma race condition clássica. Se dois clientes (duas abas, duas sessões) executarem
`mutate()` simultaneamente:

1. Ambos leem `version = 1`
2. Ambos enviam `UPDATE ... SET version = 2`
3. O resultado: duas linhas com `version = 2` e `status = 'submitted'` na mesma org

O comentário na linha 13 diz "evita race condition — Armadilha 4" mas a "armadilha" descrita no
RESEARCH.md era sobre upsert + índice parcial, não sobre leitura atômica. O incremento de version
pelo cliente **nunca é seguro** sem serialização no banco.

```typescript
// useSubmitAssessment.ts — estado atual
const { data: draft } = await supabase.from('assessments')
  .select('version').eq('org_id', orgId).eq('status', 'draft').single()
// ...
.update({ version: draft.version + 1 }) // NÃO-ATÔMICO
```

**Correção:** Usar `version = version + 1` via SQL expression, ou uma Supabase Edge Function /
RPC que realize a transição atomicamente. No PostgREST, a forma mais segura é uma RPC:

```sql
-- supabase/migrations/XXXXXX_submit_assessment_fn.sql
CREATE OR REPLACE FUNCTION submit_assessment(p_org_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE assessments
  SET status = 'submitted',
      submitted_at = NOW(),
      version = version + 1
  WHERE org_id = p_org_id AND status = 'draft';
END;
$$;
```

```typescript
// useSubmitAssessment.ts — correção
const { error } = await supabase.rpc('submit_assessment', { p_org_id: orgId })
if (error) throw error
```

---

## Warnings

### WR-01: storesByTenant nunca é limpo no logout — cross-tenant data leak entre sessões de usuários diferentes

**Arquivo:** `roteiro-unificado/src/stores/formStore.ts:70-193`

**Problema:** `storesByTenant` é uma `Map` declarada em escopo de módulo (linha 70). Ela acumula
uma `StoreApi<FormStore>` por `tenantId` visto durante a sessão do browser. Quando o usuário faz
logout e outro usuário (de outra org) loga no mesmo browser sem recarregar a página, a store da
org anterior ainda existe em memória em `storesByTenant`. Se algum componente chamar
`createFormStore(tenantIdAnterior)` ele recebe a store populada — incluindo `sectionData` que não
foi para o `localStorage` mas está no módulo.

Além disso, as persist keys do `localStorage` (`form-progress-${tenantId}`) e `sessionStorage`
(`form-data-${tenantId}`) também não são limpas no logout.

**Correção:** Expor uma função `clearFormStore(tenantId)` que remova da `Map` e limpe as chaves
de storage; chamá-la no handler de logout:

```typescript
export function clearFormStore(tenantId: string): void {
  storesByTenant.delete(tenantId)
  try {
    localStorage.removeItem(`form-progress-${tenantId}`)
    sessionStorage.removeItem(`form-data-${tenantId}`)
  } catch {}
}
```

---

### WR-02: CSS de padding dinâmico produz classe inválida no Tailwind — sticky footer não funciona na aba NDA

**Arquivo:** `roteiro-unificado/src/features/form/FormLayout.tsx:186`

**Problema:** A interpolação de template string:

```tsx
<main className={`flex-1 p-4 md:p-6${store.activeTab === TabKey.Nda ? 'pb-20' : ''}`}>
```

Quando `activeTab === TabKey.Nda`, produz a string `"flex-1 p-4 md:p-6pb-20"`. A classe
`md:p-6pb-20` não existe no Tailwind — falta um espaço separando `md:p-6` de `pb-20`. O padding
inferior necessário para o conteúdo não ficar atrás do sticky footer **não é aplicado**.

**Correção:**

```tsx
<main className={`flex-1 p-4 md:p-6 ${store.activeTab === TabKey.Nda ? 'pb-20' : ''}`}>
```

---

### WR-03: useNewRevision não exibe toast de sucesso — usuário não recebe feedback antes da navegação

**Arquivo:** `roteiro-unificado/src/features/form/useNewRevision.ts:45-49`

**Problema:** O `onSuccess` handler navega imediatamente para `/form/${orgId}` sem chamar
`toast.success()`. O `toast` é importado mas usado apenas no `onError`. O usuário que clica em
"Iniciar Nova Revisão" não recebe confirmação visual de que a nova revisão foi criada — a
navegação acontece mas pode parecer que nada ocorreu, especialmente se o TanStack Query demorar
para invalidar e o formulário aparecer vazio brevemente.

```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['assessment', 'draft', orgId] })
  queryClient.invalidateQueries({ queryKey: ['assessments', orgId] })
  // AUSENTE: toast.success('Nova revisão iniciada')
  navigate(`/form/${orgId}`, { replace: true })
},
```

**Correção:** Adicionar `toast.success('Nova revisão iniciada com sucesso!')` antes do `navigate`.

---

### WR-04: useAutosave usa useRef(useToast()) — hook chamado fora do ciclo de render normal

**Arquivo:** `roteiro-unificado/src/hooks/useAutosave.ts:43`

**Problema:** `useRef(useToast())` invoca `useToast()` como valor inicial do `useRef`. Enquanto
isso não viola a regra "só chame hooks no top-level" tecnicamente (está no top-level de
`useAutosave`), o resultado é que `toastRef.current` nunca é atualizado após o primeiro render.
Se `useToast()` retornar funções que dependem de contexto React (ex: `useContext` internamente),
esse contexto pode ficar stale após atualizações de provider. O comentário do código justifica
isso como "estabiliza a referência", mas o padrão correto para estabilizar callbacks sem stale
closures é `useCallback`, não capturar em ref na inicialização.

**Correção:** Manter `useToast()` no top-level do hook e passar as funções diretamente para
dentro do `setTimeout`, ou usar o padrão de ref de callback:

```typescript
const toast = useToast()
const toastRef = useRef(toast)
useEffect(() => { toastRef.current = toast }) // atualiza ref a cada render
```

---

## Informações

### IN-01: Comentário da migration SQL contradiz a implementação atual

**Arquivo:** `supabase/migrations/20260523000001_assessments_draft_unique.sql:17-19`

**Problema:** O comentário nas linhas 17-19 diz "O hook useAutosave usa `onConflict: 'org_id,status'`
no upsert do Supabase". Mas a implementação real em `useAutosave.ts` foi alterada para o padrão
SELECT→UPDATE/INSERT exatamente para **evitar** o upsert com `onConflict` (conforme descrito no
docblock do próprio hook na linha 19-27). O comentário da migration ficou desatualizado após a
refatoração e induz o leitor a erro.

**Correção:** Atualizar o comentário para refletir que o índice único serve como constraint de
integridade de dados (prevenção de dois drafts simultâneos), não como alvo de `onConflict`.

---

### IN-02: Uso de `as never` suprime tipagem do TypeScript em dois hooks críticos

**Arquivo:** `roteiro-unificado/src/features/form/useSubmitAssessment.ts:27` e
`roteiro-unificado/src/features/form/useNewRevision.ts:41`

**Problema:** Ambos os hooks usam `as never` para silenciar erros de tipo do TypeScript no
payload do Supabase:

```typescript
// useSubmitAssessment.ts:27
} as never)

// useNewRevision.ts:41
} as never)
```

`as never` é o type assertion mais agressivo possível — converte qualquer tipo para `never`,
desabilitando toda verificação de tipo naquele ponto. Se os campos do payload divergirem do
schema (ex: coluna renomeada no banco), o TypeScript não alertará.

**Correção:** Tipar os payloads explicitamente com `Database['public']['Tables']['assessments']['Update']`
e `Database['public']['Tables']['assessments']['Insert']`, como já é feito corretamente em
`useAutosave.ts` (linhas 8-9 e 74-93).

---

### IN-03: HistoryPage exibe botão "Ver detalhes" sem funcionalidade implementada

**Arquivo:** `roteiro-unificado/src/features/form/HistoryPage.tsx:169-171`

**Problema:** O botão "Ver detalhes" é renderizado para cada versão com status `submitted` mas
não tem handler `onClick`, não navega a lugar nenhum e não tem estado disabled:

```tsx
<Button variant="secondary" size="sm">
  Ver detalhes
</Button>
```

Um botão sem ação em produção confunde o usuário e indica código incompleto.

**Correção:** Implementar a navegação para uma página de detalhes da versão, ou adicionar
`disabled` e tooltip "Em breve" se a funcionalidade for planejada para fase futura. Não deixar
botão sem handler em produção.

---

_Revisado em: 2026-05-23_
_Revisor: Claude (gsd-code-reviewer)_
_Profundidade: standard_
