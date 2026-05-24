---
phase: 9
slug: dashboard-de-prontid-o
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-24
---

# Phase 9 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest ^4.1.7 + jsdom + @testing-library/react ^16.3.2 |
| **Config file** | `roteiro-unificado/vitest.config.ts` |
| **Quick run command** | `cd roteiro-unificado && npm test -- --run` |
| **Full suite command** | `cd roteiro-unificado && npm test -- --run --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd roteiro-unificado && npm test -- --run`
- **After every plan wave:** Run `cd roteiro-unificado && npm test -- --run --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green + UAT manual das 9 rotas
- **Max feedback latency:** ~15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 09-W0-01 | Wave 0 | 0 | DASH-04 | — | N/A | unit | `npm test -- --run src/lib/sectionStatus.test.ts` | ❌ Wave 0 | ⬜ pending |
| 09-W0-02 | Wave 0 | 0 | DASH-02 | — | N/A | unit | `npm test -- --run src/components/admin/CompanyCard.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 09-W0-03 | Wave 0 | 0 | DASH-01 | — | N/A | integration | `npm test -- --run src/features/admin/useOrgsWithReadiness.test.ts` | ❌ Wave 0 | ⬜ pending |
| 09-W0-04 | Wave 0 | 0 | DASH-05 | — | N/A | unit | `npm test -- --run src/pages/admin/AdminDashboard.test.tsx` | ❌ Wave 0 | ⬜ pending |
| 09-W0-05 | Wave 0 | 0 | DASH-03 | T-09-01 | cross-tenant guard redireciona orgId inválido | unit | `npm test -- --run src/features/form/CompanyDashboard.test.tsx` | ❌ Wave 0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `src/lib/sectionStatus.ts` — exportar função `computeTabStatus` (testável sem montar componente)
- [ ] `src/lib/sectionStatus.test.ts` — 5+ casos: REQUIRED_COUNT=0, Identificação=2, NDA=1, chaves com hífen, tabData nulo
- [ ] `src/components/admin/CompanyCard.test.tsx` — badge "Sem avaliação", badge G1-G5, campos "—"
- [ ] `src/features/admin/useOrgsWithReadiness.test.ts` — normalização JOIN, filtragem submitted, múltiplos assessments
- [ ] `src/pages/admin/AdminDashboard.test.tsx` — useMemo filtros: searchTerm vazio, filtro por nome, filtro por nível, "Sem avaliação"
- [ ] `src/features/form/CompanyDashboard.test.tsx` — cross-tenant guard: orgId !== authOrgId → Navigate

**Padrão de mock:**
```typescript
vi.mock('@/lib/supabase', () => ({ supabase: { from: vi.fn() } }))
vi.mock('react-router-dom', () => ({ Link: ({ children, to }: any) => <a href={to}>{children}</a> }))
```

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Admin vê grid AdminDashboard com badges G1-G5 corretos | DASH-01, DASH-02 | Sem framework E2E | Acessar `/admin/dashboard` com dados reais, inspecionar visualmente |
| Filtro G2 mostra apenas orgs G2 | DASH-05 | Depende de dados reais | Selecionar "G2" no select de nível, verificar que apenas orgs G2 aparecem |
| Construtora vê SectionProgress com estados corretos | DASH-03, DASH-04 | JSONB real do formulário | Acessar `/form/:orgId/dashboard`, verificar %, badges por aba |
| Admin acessa `/admin/orgs/:orgId` — combina dashboard + histórico | DASH-01 | Integração entre componentes | Clicar em "Ver detalhes" de CompanyCard, verificar layout completo |
| Construtora tenta acessar dashboard de outra org | DASH-03 | Teste de segurança manual | Editar URL com orgId de outra org, verificar redirecionamento |
| Loading skeletons aparecem antes de dados | DASH-02 | Comportamento visual transitório | Throttle de rede no DevTools, observar skeleton → dados |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
