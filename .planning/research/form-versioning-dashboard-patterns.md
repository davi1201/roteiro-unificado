# Form Versioning / Revision History + Dashboard Patterns for Assessment Apps

**Target stack:** React + TanStack Query v5 + Supabase (PostgreSQL)  
**Context:** Multi-tenant app where each construction company (`empresa`) can fill an assessment form multiple times, save drafts, and eventually submit.

---

## Versioning Strategy

### Option A — Append-Only (Recomendada ✅)

Cada `save` insere uma nova linha na tabela. A versão atual é a de maior `version` (ou `created_at`) por empresa.

```sql
create table form_submissions (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references empresas(id),
  version     int  not null default 1,
  status      text not null check (status in ('draft', 'submitted')) default 'draft',
  data        jsonb not null,           -- snapshot completo do formulário
  created_by  uuid references auth.users(id),
  created_at  timestamptz default now(),
  submitted_at timestamptz,

  unique (empresa_id, version)
);

-- View de conveniência: pega a versão mais recente por empresa
create view latest_submissions as
select distinct on (empresa_id) *
from form_submissions
order by empresa_id, version desc;
```

**Próxima versão (sequence):**

```sql
-- Função para calcular próximo número de versão
create function next_version(p_empresa_id uuid) returns int language sql as $$
  select coalesce(max(version), 0) + 1
  from form_submissions
  where empresa_id = p_empresa_id
$$;
```

**Tradeoffs:**
| | Append-Only | Temporal Tables (`valid_from/valid_to`) | JSON Snapshot único |
|---|---|---|---|
| Histórico completo | ✅ | ✅ | ❌ (sobreescreve) |
| Complexidade da query | Baixa | Alta (range queries) | Mínima |
| Storage | Médio (1 linha/save) | Alto | Mínimo |
| RLS simples | ✅ | Moderado | ✅ |
| Rollback | ✅ trivial | ✅ | ❌ |
| Supabase-friendly | ✅ | ⚠️ requer extensão `temporal_tables` | ✅ |

**Conclusão:** Para Supabase, append-only com JSONB é o melhor custo-benefício. Temporal tables requerem extensão não nativa. JSON snapshot único é descartado pois perde histórico.

### Índices Necessários

```sql
create index on form_submissions (empresa_id, version desc);
create index on form_submissions (empresa_id, status);
create index on form_submissions (status, created_at desc); -- para o dashboard admin
```

---

## Draft vs Submitted Pattern

### Ciclo de vida de um formulário

```
[não iniciado] → [draft v1] → [draft v2] → ... → [submitted vN]
                                                        ↓
                                             (se reaberto)
                                             [draft vN+1] → [submitted vN+1]
```

### Schema de status recomendado

```sql
-- status na tabela form_submissions
-- 'draft'     → usuário salvou mas não submeteu
-- 'submitted' → submetido oficialmente; imutável
-- 'reopened'  → admin reabriu para edição (cria nova versão draft)
```

**Regra crítica:** `submitted` é imutável. Nunca faça UPDATE em uma linha `submitted`. Para reabrir, insira nova linha com status `draft` e versão `n+1`.

### RLS para multi-tenant

```sql
-- Empresa só vê seus próprios formulários
create policy "empresa vê seus formulários"
  on form_submissions for select
  to authenticated
  using (empresa_id = (select auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid);

-- Empresa só insere para si mesma
create policy "empresa cria seus formulários"
  on form_submissions for insert
  to authenticated
  with check (empresa_id = (select auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid);

-- Ninguém faz UPDATE — só INSERT (append-only forçado via política)
-- DELETE também bloqueado
```

### Função de submit (server-side)

```sql
-- Garante atomicidade: não deixa duas versões submetidas simultâneas
create function submit_form(p_submission_id uuid)
returns void language plpgsql security definer as $$
begin
  update form_submissions
  set status = 'submitted', submitted_at = now()
  where id = p_submission_id
    and status = 'draft'
    and empresa_id = (select auth.jwt() -> 'app_metadata' ->> 'empresa_id')::uuid;

  if not found then
    raise exception 'Formulário não encontrado ou já submetido';
  end if;
end;
$$;
```

---

## Dashboard Architecture

### Problema

Exibir para um admin (ou para a própria empresa) o status de preenchimento de N empresas, com indicadores de progresso por seção do formulário.

### Modelo de dados de progresso

Calcule o progresso no banco, não no frontend:

```sql
-- View materializada ou view comum (atualizada via trigger)
create view dashboard_status as
select
  e.id          as empresa_id,
  e.nome,
  ls.version    as current_version,
  ls.status,
  ls.updated_at,
  ls.submitted_at,
  -- progresso por seção calculado via JSON
  jsonb_array_length(ls.data -> 'secao_a' -> 'respostas')     as secao_a_count,
  (ls.data -> 'secao_b' ->> 'completa')::boolean              as secao_b_ok,
  -- percentual geral (adaptar conforme estrutura do form)
  round(
    (
      case when ls.data ? 'secao_a' then 1 else 0 end +
      case when ls.data ? 'secao_b' then 1 else 0 end +
      case when ls.data ? 'secao_c' then 1 else 0 end
    )::numeric / 3 * 100
  ) as completion_pct
from empresas e
left join latest_submissions ls on ls.empresa_id = e.id;
```

### Padrão de componente Dashboard (React)

**Estrutura de fetch:**

```
/dashboard
  ├── useQuery(['dashboard-status'])   → lista todas empresas + status
  └── /empresa/:id
        └── useQuery(['form', empresaId, 'latest'])  → formulário atual
```

**Cards de status por empresa:**

```tsx
type EmpresaStatus = {
  empresa_id: string;
  nome: string;
  current_version: number | null;
  status: 'nao_iniciado' | 'draft' | 'submitted';
  completion_pct: number;
  submitted_at: string | null;
};

// Cor semântica por status
const statusConfig = {
  nao_iniciado: { label: 'Não iniciado', color: 'gray', icon: Circle },
  draft: { label: 'Em andamento', color: 'yellow', icon: Clock },
  submitted: { label: 'Submetido', color: 'green', icon: Check },
};
```

**Aggregação para o admin (query única eficiente):**

```sql
select
  status,
  count(*) as total
from dashboard_status
group by status;
-- resultado: { nao_iniciado: 12, draft: 8, submitted: 5 }
```

---

## React Query v5 Patterns

### Query Keys — convenção para formulários

```ts
// queryKeys.ts — factory pattern (recomendado TkDodo)
export const formKeys = {
  all: ['forms'] as const,
  byEmpresa: (empresaId: string) =>
    [...formKeys.all, 'empresa', empresaId] as const,
  latest: (empresaId: string) =>
    [...formKeys.byEmpresa(empresaId), 'latest'] as const,
  version: (empresaId: string, v: number) =>
    [...formKeys.byEmpresa(empresaId), 'v', v] as const,
  history: (empresaId: string) =>
    [...formKeys.byEmpresa(empresaId), 'history'] as const,
  dashboard: ['forms', 'dashboard'] as const,
};
```

### useQuery para carregar o formulário atual

```ts
export function useLatestForm(empresaId: string) {
  return useQuery({
    queryKey: formKeys.latest(empresaId),
    queryFn: () =>
      supabase
        .from('latest_submissions')
        .select('*')
        .eq('empresa_id', empresaId)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          return data; // null = formulário nunca iniciado
        }),
    staleTime: 1000 * 60 * 2, // 2 min; formulário muda pouco
  });
}
```

### useMutation para autosave (draft)

```ts
export function useAutosaveForm(empresaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['autosave', empresaId], // scope: serializa saves da mesma empresa
    scope: { id: empresaId }, // v5: evita saves paralelos para mesma empresa

    mutationFn: async (formData: FormData) => {
      const currentVersion =
        queryClient.getQueryData<Submission>(formKeys.latest(empresaId))
          ?.version ?? 0;

      const { data, error } = await supabase
        .from('form_submissions')
        .insert({
          empresa_id: empresaId,
          version: currentVersion + 1,
          status: 'draft',
          data: formData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },

    onMutate: async (formData) => {
      // Cancela refetches em andamento para não sobrescrever o otimista
      await queryClient.cancelQueries({ queryKey: formKeys.latest(empresaId) });

      // Snapshot para rollback
      const previous = queryClient.getQueryData(formKeys.latest(empresaId));

      // Atualiza cache otimisticamente
      queryClient.setQueryData(
        formKeys.latest(empresaId),
        (old: Submission | null) => ({
          ...(old ?? {}),
          data: formData,
          status: 'draft',
          version: (old?.version ?? 0) + 1,
        })
      );

      return { previous };
    },

    onError: (_err, _vars, context) => {
      // Rollback
      queryClient.setQueryData(formKeys.latest(empresaId), context?.previous);
    },

    onSettled: () => {
      // Sempre refetch para garantir consistência
      queryClient.invalidateQueries({ queryKey: formKeys.latest(empresaId) });
    },
  });
}
```

### useMutation para submit

```ts
export function useSubmitForm(empresaId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (submissionId: string) => {
      const { error } = await supabase.rpc('submit_form', {
        p_submission_id: submissionId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      // Invalida tudo relacionado a essa empresa
      queryClient.invalidateQueries({
        queryKey: formKeys.byEmpresa(empresaId),
      });
      queryClient.invalidateQueries({ queryKey: formKeys.dashboard });
    },
  });
}
```

### Debounce do autosave (evitar flood de requisições)

```ts
// hook auxiliar
function useDebouncedAutosave(empresaId: string, delay = 1500) {
  const { mutate } = useAutosaveForm(empresaId)
  return useMemo(() => debounce(mutate, delay), [mutate, delay])
}

// No componente de formulário:
const save = useDebouncedAutosave(empresaId)

<input onChange={(e) => {
  setFieldValue('nome', e.target.value)
  save(getValues()) // dispara debounced
}} />
```

### Dashboard query

```ts
export function useDashboard() {
  return useQuery({
    queryKey: formKeys.dashboard,
    queryFn: () =>
      supabase
        .from('dashboard_status')
        .select('*')
        .order('nome')
        .then(({ data, error }) => {
          if (error) throw error;
          return data ?? [];
        }),
    staleTime: 1000 * 30, // 30s; dashboard pode ficar um pouco stale
    refetchInterval: 1000 * 60, // polling a cada 1 min (opcional)
  });
}
```

---

## Gotchas

### 1. Race condition no autosave com `scope`

Sem `scope: { id: empresaId }` no v5, múltiplas chamadas ao `mutate` do autosave disparam em paralelo. A segunda pode sobrescrever a primeira no banco com dados mais antigos. **Sempre use `scope.id`** para serializar saves por empresa.

### 2. `version` sem lock otimista cria gaps

Se dois tabs abertos do mesmo usuário salvam ao mesmo tempo, ambos calculam `max(version) + 1 = 5` e tentam inserir `version = 5`. O segundo vai falhar com violação de `UNIQUE (empresa_id, version)`. Trate esse erro no frontend mostrando "Conflito detectado — recarregue a página".

### 3. Invalidação do dashboard após submit

Após um submit, **invalidar `formKeys.dashboard`** além de `formKeys.latest`. É fácil esquecer e o card da empresa fica mostrando "Em andamento" mesmo após submissão.

### 4. `staleTime` no formulário vs dashboard

- Formulário em edição: `staleTime: 0` (sempre buscar última versão ao montar)
- Dashboard: `staleTime: 30_000` a `60_000` (pode tolerar dados ligeiramente desatualizados)
- Histórico de versões: `staleTime: Infinity` (versões antigas nunca mudam)

### 5. RLS com `app_metadata` vs `user_metadata`

Use `auth.jwt() -> 'app_metadata'` para `empresa_id`, nunca `user_metadata`. O `user_metadata` pode ser alterado pelo próprio usuário via `supabase.auth.update()`, criando escalação de privilégio para acessar dados de outra empresa.

### 6. View `latest_submissions` com RLS

Views no Supabase são criadas como `security definer` por padrão (bypassam RLS). Em Postgres 15+, adicione `with (security_invoker = true)` à view para que as políticas da tabela base sejam respeitadas:

```sql
create view latest_submissions
with (security_invoker = true) as
select distinct on (empresa_id) *
from form_submissions
order by empresa_id, version desc;
```

### 7. Otimistic update de dashboard no submit

Para o dashboard sentir o submit imediatamente (sem esperar refetch), faça setQueryData direto:

```ts
onMutate: async () => {
  queryClient.setQueryData(formKeys.dashboard, (old: EmpresaStatus[]) =>
    old.map((e) =>
      e.empresa_id === empresaId
        ? { ...e, status: 'submitted', submitted_at: new Date().toISOString() }
        : e
    )
  );
};
```

### 8. Nunca fazer `select *` no dashboard sem filtro

Conforme docs do Supabase, `select()` sem filtro em tabela com RLS causa full table scan a cada request. Sempre adicione `.eq('empresa_id', ...)` mesmo que a política já filtre — o Postgres usa o filtro explícito para otimizar o plano de query.

---

**Fontes:**

- TanStack Query v5 — Optimistic Updates: https://tanstack.com/query/v5/docs/framework/react/guides/optimistic-updates
- TanStack Query v5 — Mutation Scopes: https://tanstack.com/query/v5/docs/framework/react/guides/mutations#mutation-scopes
- Supabase RLS Performance: https://supabase.com/docs/guides/database/postgres/row-level-security#rls-performance-recommendations
- Supabase Triggers: https://supabase.com/docs/guides/database/postgres/triggers
- TkDodo — Query Key Factory: https://tkdodo.eu/blog/effective-react-query-keys
