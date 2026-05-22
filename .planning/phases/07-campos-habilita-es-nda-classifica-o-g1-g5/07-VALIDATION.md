---
phase: 7
slug: 07-campos-habilita-es-nda-classifica-o-g1-g5
status: ready
nyquist_compliant: true
wave_0_complete: true
created: 2026-05-22
---

# Phase 7 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Vitest (opcional — Wave 0 instala se a equipe optar por testes unitários) |
| **Config file** | `vitest.config.ts` — Wave 0 cria se não existir |
| **Quick run command** | `npx vitest run src/lib/readiness.test.ts` |
| **Full suite command** | `npx vitest run` |
| **Estimated runtime** | ~5 segundos |

---

## Sampling Rate

- **After every task commit:** Run `npx tsc --noEmit` (type check rápido)
- **After every plan wave:** Run `npx vitest run` (se Vitest instalado) + `npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + inspeções manuais UAT concluídas
- **Max feedback latency:** ~10 segundos (type check) / ~5 segundos (unit tests)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 07-01-T1 | 01 | 1 | FORM-02 | — | N/A | type-check + grep | `npx tsc --noEmit` + grep schemas hab-venda/hab-repositorios/hab-responsaveis | ✅ | ⬜ pending |
| 07-02-T1 | 02 | 1 | FORM-02 | — | N/A | type-check + grep | `npx tsc --noEmit` + grep schemas hab-classificacao/nda | ✅ | ⬜ pending |
| 07-03-T1 | 03 | 2 | FORM-02, FORM-03 | Bypass NDA: `z.literal(true)` impede submit sem aceite | checkbox obrigatório gera erro inline | type-check + manual | `npx tsc --noEmit` + inspeção Section components Hab.Venda/Hab.Repositorios | ✅ | ⬜ pending |
| 07-04-T1 | 04 | 2 | FORM-02 | — | N/A | type-check + manual | `npx tsc --noEmit` + inspeção Section components Hab.Responsaveis/Hab.Classificacao | ✅ | ⬜ pending |
| 07-05-T1 | 05 | 2 | FORM-07 | Bypass NDA | `z.literal(true)` | type-check + opcional Vitest | `npx tsc --noEmit` + (opcional) `npx vitest run src/lib/readiness.test.ts` | ✅ | ⬜ pending |
| 07-05-T2 | 05 | 2 | FORM-07 | — | N/A | type-check | `npx tsc --noEmit` + grep `<ReadinessClassification` | ✅ | ⬜ pending |
| 07-06-T1 | 06 | 3 | FORM-02, FORM-03, FORM-07 | — | switch fechado sobre `TabKey` | type-check + lint | `npx tsc --noEmit` + `npm run lint` | ✅ | ⬜ pending |
| 07-06-T2 | 06 | 3 | FORM-02, FORM-03, FORM-07, UX-02 | Bypass NDA | checkbox obrigatório gera erro inline + responsivo 768px sem overflow | checkpoint humano | inspeção visual no browser (11 passos) — cobre auditoria campo a campo (FORM-02), erro NDA (FORM-03), badge G1-G5/HAB-X tempo real (FORM-07) e viewport 768px (UX-02) | ✅ | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `src/lib/readiness.test.ts` — **opcional** per RESEARCH.md §Validation Architecture; testes unitários cobririam `calculateReadiness` (campo vazio → null, `'g1'` → `'G1'`, `'hab-a'` → `'HAB-A'`, `aceitaTermos: true` → `ndaAceito: true`). Não é pré-requisito de execução.
- [x] `npx vitest` — **opcional**; UAT manuais do ROADMAP §Phase 7 cobrem todos os critérios de aceitação se a equipe optar por não instalar Vitest agora.

*Política decidida: Vitest fica opcional para a Phase 7. Cobertura primária = UAT manuais + checkpoint humano em 07-06-T2. Os 11 passos de inspeção visual cobrem FORM-02, FORM-03, FORM-07 e UX-02.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Todos os campos do HTML presentes no React | FORM-02 | Auditoria visual campo a campo — não há test runner que compare HTML/JSX estruturalmente | Abrir `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html` e `src/features/form/sections/Hab*.tsx` lado a lado; confirmar cada label e tipo de campo |
| Erro inline ao submeter sem marcar NDA | FORM-03 | Comportamento de UI interativo | Abrir aba NDA, clicar submeter sem marcar checkbox; confirmar mensagem "Você deve aceitar os termos do NDA para continuar" aparece inline |
| Badge G1-G5 atualiza em tempo real | FORM-07 | Estado reativo — requer interação manual | Selecionar nível gerencial → confirmar badge muda imediatamente; trocar classificação HAB → confirmar badge HAB muda |
| Formulário operável em 768px | UX-02 | Responsividade requer browser/DevTools | Abrir DevTools → device 768px; preencher campos em todas as 5 abas; confirmar sem overflow horizontal |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify ou Wave 0 dependencies (todos os 8 tasks têm `npx tsc --noEmit` ou checkpoint humano; Vitest é opcional)
- [x] Sampling continuity: nenhum trecho de 3 tasks consecutivos sem automated verify (type-check roda após cada task)
- [x] Wave 0 cobre todas as referências MISSING (Vitest reclassificado como opcional per RESEARCH.md)
- [x] No watch-mode flags
- [x] Feedback latency < 30s (`npx tsc --noEmit` ~10s)
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved (revisão 1)
