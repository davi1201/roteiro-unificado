---
phase: 12
slug: polimento-ux-performance-deploy
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-05-25
---

# Phase 12 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest 4.1.7 + jsdom |
| **Config file** | `roteiro-unificado/vitest.config.ts` |
| **Quick run command** | `npm test -- --run` |
| **Full suite command** | `npm test -- --run` |
| **Estimated runtime** | ~7 seconds (167 tests, 32 files) |

---

## Sampling Rate

- **After every task commit:** Run `npm test -- --run`
- **After every plan wave:** Run `npm test -- --run`
- **Before `/gsd:verify-work`:** Full suite must be green + smoke tests in production
- **Max feedback latency:** ~7 seconds (automated); manual checks as specified

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 12-01-01 | 01 | 1 | UX-02 | — | N/A | manual | DevTools device mode (768/1024/1280px) | N/A | ⬜ pending |
| 12-01-02 | 01 | 1 | UX-02 | — | N/A | manual | Browser resize + visual check | N/A | ⬜ pending |
| 12-02-01 | 02 | 1 | UX-01 | — | N/A | manual | DevTools Accessibility panel + contrast calc | N/A | ⬜ pending |
| 12-02-02 | 02 | 1 | UX-01 | — | N/A | unit | `npm test -- --run` (existing suite) | ✅ | ⬜ pending |
| 12-03-01 | 03 | 2 | UX-03 | — | N/A | unit | `npm test -- --run` | ✅ | ⬜ pending |
| 12-03-02 | 03 | 2 | UX-05 | — | N/A | manual | Lighthouse CLI: `npx lighthouse <url> --only-categories=performance` | N/A | ⬜ pending |
| 12-04-01 | 04 | 2 | — | T-12-01 | Credenciais de prod nunca no bundle (sem VITE_SUPABASE_* de dev) | manual | `grep -r "SUPABASE" dist/` deve retornar vazio ou valores de prod | N/A | ⬜ pending |
| 12-05-01 | 05 | 3 | — | T-12-02 | Deploy SPA — rotas não quebram em refresh direto | manual | Navegar diretamente para `/dashboard`, `/form/:id` em produção | N/A | ⬜ pending |
| 12-05-02 | 05 | 3 | — | — | N/A | manual | CI verde antes de merge para main | N/A | ⬜ pending |
| 12-06-01 | 06 | 3 | UX-04, UX-06 | — | N/A | manual | Smoke test completo em produção (ver checklist) | N/A | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Nenhum — infraestrutura de testes está completa (167 testes passando). Os novos requisitos UX desta fase são primariamente verificação visual/manual que não requerem novos arquivos de teste automatizados.

*Existing infrastructure covers all automated phase requirements.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Layout responsivo em 768px/1024px/1280px | UX-02 | Verificação visual — sem API DOM confiável para layout real | DevTools → Device Mode → testar cada breakpoint em login, formulário, dashboard, histórico, exportação |
| Contraste de cor ≥ 4.5:1 (WCAG AA) | UX-01 | Requer inspeção visual e cálculo de contraste | DevTools Accessibility panel + confirmar branco/dark text sobre `#F28C28` e `#123B66` |
| Estados de loading/skeleton | UX-05 | Depende de throttling de rede real | DevTools Network → Slow 3G → observar skeletons em dashboard e formulário |
| Lighthouse Performance ≥ 85, FCP < 1.5s | — | Métrica runtime — não testável em unit tests | `npx lighthouse <prod-url> --only-categories=performance --output=json` |
| Smoke test completo em produção | UX-01–UX-06 | Verifica integração real em produção | Login admin → criar org → login construtora → preencher → autosave → submeter → histórico → exportar PDF → exportar Excel |
| Credenciais de dev não vazam no build | — | Requer inspeção do bundle compilado | `grep -r "SUPABASE" dist/` ou inspecionar sources no DevTools em produção |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 7s (automated) / smoke tests in production
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
