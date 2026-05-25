---
slug: cors-create-user-not-deployed
status: resolved
trigger: manual
goal: find_and_fix
created: 2026-05-25T10:26:00Z
updated: 2026-05-25T10:27:17Z
---

# Debug: CORS Error on create-user Edge Function

## Symptoms

CORS error when creating a member in org via admin panel (AddMemberModal).

Error: "Access to fetch at 'https://zbfajqtvplabdcmjmdiw.supabase.co/functions/v1/create-user' from origin
'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access
control check: It does not have HTTP ok status."

## Evidence

- timestamp: 2026-05-25T10:26:46Z
  finding: |
    OPTIONS preflight to /functions/v1/create-user returned HTTP 404:
    {"code":"NOT_FOUND","message":"Requested function was not found"}
    The Supabase gateway's own 404 does not include a 2xx status, causing the
    browser to report it as a CORS failure. The function source code and CORS
    headers are correct — the function simply was never deployed.

- timestamp: 2026-05-25T10:26:50Z
  finding: |
    `supabase functions list --project-ref zbfajqtvplabdcmjmdiw` returned zero rows.
    Confirms the function existed only locally (supabase/functions/create-user/index.ts)
    but had never been deployed to the remote project.

- timestamp: 2026-05-25T10:27:17Z
  finding: |
    After deploying with `supabase functions deploy create-user`, OPTIONS preflight
    returns HTTP 200 with correct headers:
      access-control-allow-origin: *
      access-control-allow-headers: authorization, x-client-info, apikey, content-type
      access-control-allow-methods: POST, OPTIONS

## Hypotheses

1. [x] Function not deployed to remote project — CONFIRMED ROOT CAUSE
2. [ ] Missing/wrong CORS headers in function code — NOT the issue (code is correct)
3. [ ] Module-level throw on missing env vars crashing function startup — NOT the issue (function was absent, not crashing)

## Resolution

- **root_cause:** The `create-user` Edge Function existed only in the local repository
  (`supabase/functions/create-user/index.ts`) but had never been deployed to the remote Supabase
  project. The Supabase gateway returned HTTP 404 for the OPTIONS preflight, which the browser
  reports as a CORS failure because a non-2xx status fails the preflight check.

- **fix:** Deployed the function via:
  `supabase functions deploy create-user --project-ref zbfajqtvplabdcmjmdiw`
  Preflight now returns HTTP 200 with all required CORS headers. Admin panel create-member flow
  is unblocked.
