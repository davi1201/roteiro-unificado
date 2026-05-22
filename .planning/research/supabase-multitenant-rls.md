# Supabase Multi-Tenant Architecture with RLS

**Context:** B2B SaaS form app for 5–50 construction companies  
**Researched:** 2026-05-22  
**Sources:** Supabase official docs (RLS, Auth, Storage, Realtime)

---

## Multi-Tenant Strategy

### Pattern Comparison

| Pattern                               | When to use                                          | Tradeoffs                                                       |
| ------------------------------------- | ---------------------------------------------------- | --------------------------------------------------------------- |
| **Shared schema + RLS** (recommended) | 5–50 tenants, same data shape                        | Simpler ops; one DB to manage; row-level isolation via policies |
| Separate schemas per tenant           | 50+ tenants, need schema-level customization         | More complex migrations; Supabase dashboard support is limited  |
| Separate projects per tenant          | Enterprise isolation requirements, strict compliance | High cost; no cross-tenant queries; complex to operate          |

**Recommendation for 5–50 tenants: Shared schema + RLS.**

- One Supabase project, all tenants in the same tables.
- An `org_id` (UUID) column on every data table links rows to a tenant.
- RLS policies enforce that users only see rows belonging to their org.
- Simple to migrate, cheap, and the Supabase dashboard handles it natively.

### Core Schema Shape

```sql
-- Tenants / organizations
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz default now()
);

-- User ↔ org membership (many-to-many)
create table public.org_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member', -- 'owner' | 'admin' | 'member'
  created_at timestamptz default now(),
  unique(org_id, user_id)
);

-- Every data table carries org_id
create table public.forms (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  -- ...
);
```

---

## RLS Policy Patterns

### Helper Function (security definer)

Avoid inline subqueries that re-scan `org_members` on every row. Use a `security definer` function in a **private schema** (not exposed to the API):

```sql
-- Put helper functions in a non-exposed schema
create schema if not exists private;

create or replace function private.get_user_org_ids()
returns setof uuid
language sql
security definer
stable
set search_path = ''
as $$
  select org_id from public.org_members
  where user_id = (select auth.uid());
$$;
```

### RLS Policies on Data Tables

```sql
alter table public.forms enable row level security;

-- SELECT: user sees only their org's rows
create policy "members can select org forms"
on public.forms
for select
to authenticated
using (
  org_id in (select private.get_user_org_ids())
);

-- INSERT: user can only create rows for their org
create policy "members can insert org forms"
on public.forms
for insert
to authenticated
with check (
  org_id in (select private.get_user_org_ids())
);

-- UPDATE
create policy "members can update org forms"
on public.forms
for update
to authenticated
using  (org_id in (select private.get_user_org_ids()))
with check (org_id in (select private.get_user_org_ids()));

-- DELETE (admins only example)
create policy "admins can delete org forms"
on public.forms
for delete
to authenticated
using (
  exists (
    select 1 from public.org_members
    where org_id = forms.org_id
      and user_id = (select auth.uid())
      and role in ('owner', 'admin')
  )
);
```

### RLS on org_members itself

```sql
alter table public.org_members enable row level security;

-- Users can see membership records for their own orgs
create policy "members can view own org membership"
on public.org_members
for select
to authenticated
using (
  org_id in (select private.get_user_org_ids())
);

-- Only owners/admins can insert new members
create policy "admins can add members"
on public.org_members
for insert
to authenticated
with check (
  exists (
    select 1 from public.org_members m
    where m.org_id = org_members.org_id
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin')
  )
);
```

### Performance Rules (from official Supabase benchmarks)

1. **Wrap functions with `select`** — `(select auth.uid())` instead of `auth.uid()` caches the result per statement (initPlan optimization).
2. **Always specify `TO authenticated`** — prevents the policy from evaluating for `anon` users.
3. **Index `org_id` on every data table** — `create index on public.forms using btree (org_id);`
4. **Add explicit filters in queries** — even though RLS enforces it, passing `.eq('org_id', orgId)` helps the query planner.
5. **Use `security definer` functions** for membership checks — bypasses RLS on the join table, avoiding double-policy overhead.
6. **Minimize joins in policies** — fetch IDs into a set (`in (select ...)`) rather than joining back to the source table.

---

## Auth Architecture

### User → Org Linking

The recommended pattern: `auth.users` → `public.profiles` (1:1) → `public.org_members` (M:N).

```sql
-- Extended profile (auto-created on signup via trigger)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  updated_at timestamptz
);

-- Trigger to create profile row on every new signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### Invite Flow (Email-Based)

Supabase does not have a built-in org-invite UI, but the pattern is:

1. Admin generates an invite record in `public.invites` (token, org_id, email, expires_at).
2. Send email with a link containing the token.
3. On click, the new user signs up via Magic Link or Password.
4. After signup, your server-side function (Edge Function or webhook) reads the invite token, validates it, then inserts into `org_members`.

```sql
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  token text unique not null default encode(gen_random_bytes(32), 'hex'),
  invited_by uuid references auth.users(id),
  accepted_at timestamptz,
  expires_at timestamptz default (now() + interval '7 days')
);
```

> Do NOT use `raw_user_meta_data` to store `org_id` for RLS — users can modify it. Use the `org_members` table or `raw_app_meta_data` (set server-side only).

### app_metadata vs user_metadata

| Field                | Who can write           | Safe for RLS?               |
| -------------------- | ----------------------- | --------------------------- |
| `raw_app_meta_data`  | Server / Admin API only | ✅ Yes                      |
| `raw_user_meta_data` | The user themselves     | ❌ No — users can modify it |

For simple single-org-per-user setups, storing `org_id` in `app_metadata` works. For multi-org membership, use the `org_members` table + `security definer` function.

---

## React Integration

### For Vite/React SPA (no SSR)

For a pure client-side Vite app, use `@supabase/supabase-js` directly — `@supabase/ssr` is optimized for Next.js/SvelteKit SSR with cookie management.

```bash
npm install @supabase/supabase-js
```

```ts
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types'; // generated types

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseKey);
```

> Use the new **publishable key** (`sb_publishable_xxx`) — the legacy `anon` key still works until end of 2026 but is being deprecated.

### Auth State Listener

Set up once at app root (e.g., in `App.tsx` or a Context provider):

```tsx
import { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabaseClient';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) =>
      setSession(session)
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;
  return (
    <AuthContext.Provider value={{ session }}>{children}</AuthContext.Provider>
  );
}
```

### Querying with org_id

Always pass `org_id` explicitly — this helps the query planner even with RLS active:

```ts
const { data, error } = await supabase
  .from('forms')
  .select('*')
  .eq('org_id', currentOrgId) // explicit filter = better query plan
  .order('created_at', { ascending: false });
```

---

## Realtime for Collaborative Forms

### When to use Realtime

Use Realtime for **collaborative editing** (multiple users filling the same form simultaneously). For simple "last save wins" scenarios, polling or optimistic updates are simpler.

### Broadcast (low-latency, ephemeral)

Best for cursor positions, field-focus indicators, live typing:

```ts
// Each user joins a channel per form
const channel = supabase.channel(`form:${formId}`, {
  config: { private: true }, // requires auth
});

// Send field update
channel.send({
  type: 'broadcast',
  event: 'field_update',
  payload: { fieldId: 'field_1', value: 'New value', userId: session.user.id },
});

// Receive updates
channel
  .on('broadcast', { event: 'field_update' }, (payload) => {
    // update local UI
  })
  .subscribe();

// Cleanup on unmount
return () => supabase.removeChannel(channel);
```

**RLS for Realtime Broadcast** — authenticated users must have a policy on `realtime.messages`:

```sql
create policy "authenticated can receive broadcasts"
on "realtime"."messages"
for select
to authenticated
using (true); -- or add org-scoped check via topic naming
```

### Postgres Changes (persistent, auditable)

Use for tracking saved form submissions that other users need to see:

```ts
supabase
  .channel('form_submissions')
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'form_submissions',
      filter: `org_id=eq.${currentOrgId}`,
    },
    (payload) => {
      // new submission arrived
    }
  )
  .subscribe();
```

---

## Storage for Attachments

### Bucket Setup

Use **private buckets** for tenant files. Structure paths as `{org_id}/{form_id}/{filename}` for clean RLS policies.

```sql
-- RLS on storage.objects

-- Allow org members to upload to their org folder
create policy "org members can upload"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'form-attachments'
  and (storage.foldername(name))[1] in (
    select org_id::text from public.org_members
    where user_id = (select auth.uid())
  )
);

-- Allow org members to read their org's files
create policy "org members can read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'form-attachments'
  and (storage.foldername(name))[1] in (
    select org_id::text from public.org_members
    where user_id = (select auth.uid())
  )
);
```

### Upload from React

```ts
const uploadAttachment = async (file: File, orgId: string, formId: string) => {
  const path = `${orgId}/${formId}/${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from('form-attachments')
    .upload(path, file);
  if (error) throw error;
  return data.path;
};
```

---

## Gotchas & Pitfalls

### 1. `auth.uid()` returns `null` for unauthenticated requests

RLS policies silently fail (return no rows) instead of erroring. Always add explicit auth checks or `TO authenticated` on policies. Never expose data assuming RLS will block anonymous users — it does, but the error surfacing is confusing.

### 2. `raw_user_meta_data` is not safe for authorization

Users can call `supabase.auth.updateUser({ data: { org_id: 'another-org' } })` and modify it. Only `raw_app_meta_data` (set via Admin/Service key) is safe for authorization data.

### 3. JWT staleness with `app_metadata`

If you use `auth.jwt()` in policies for org checks, the JWT is not always fresh. A user removed from an org still has the old JWT until it expires (~1 hour). Use the `org_members` table approach for real-time membership changes.

### 4. Views bypass RLS by default

Views created by `postgres` user run as `security definer`. In Postgres 15+, add `with (security_invoker = true)` to views. In older versions, keep views in a non-exposed schema.

### 5. `@supabase/ssr` is NOT needed for Vite SPAs

`@supabase/ssr`'s `createBrowserClient` is a thin wrapper that handles cookie storage for SSR hydration. For a pure Vite SPA, just use `createClient` from `@supabase/supabase-js` — the standard localStorage session management is correct.

### 6. Multiple Realtime subscriptions cause connection issues

Don't create a new channel per re-render. Use `useRef` or put channel creation in `useEffect` with a single cleanup `supabase.removeChannel(channel)`.

### 7. RLS performance: the N+1 policy problem

Without `security definer` functions or wrapping helpers with `(select ...)`, each row evaluates the policy function independently. For a table with 10k rows, a naive join in the policy causes a full scan of `org_members` per row. Always use the `security definer` helper pattern.

### 8. `UPDATE` policies require a `SELECT` policy

If you create only an `UPDATE` policy, the operation silently fails. Postgres requires the user to be able to `SELECT` the row before updating it.

### 9. Don't share the `service_role` key with the client

The `service_role` key bypasses all RLS. It must only be used server-side (Edge Functions, backend). Use the publishable key in the browser.

### 10. Rate limits on Auth emails

By default, users can request a magic link/OTP only once every 60 seconds, and invites expire after 1 hour. For bulk invites, build a queue and rate-limit sending on your end.
