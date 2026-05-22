---
phase: 05
slug: shell-do-formul-rio-navega-o-por-abas
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-05-22
---

# Phase 05 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.
> **Decisão de validação:** Phase 5 é puramente shell de navegação (sem campos reais, sem lógica de negócio). Todos os comportamentos críticos (hash navigation, data preservation, responsive layout) são mais adequados para verificação manual/E2E do que unit tests. `vitest` será introduzido na Phase 7 quando houver lógica pura testável (`calculateReadiness`). Esta decisão está documentada em `05-RESEARCH.md § Arquitetura de Validação § Alternativa pragmática`.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Nenhum instalado — verificação via type-check + lint + build + UAT manual |
| **Config file** | `roteiro-unificado/tsconfig.json` (type-check), `roteiro-unificado/eslint.config.js` (lint) |
| **Quick run command** | `cd roteiro-unificado && npm run type-check` |
| **Full suite command** | `cd roteiro-unificado && npm run type-check && npm run lint && npm run build` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `cd roteiro-unificado && npm run type-check`
- **After every plan wave:** Run `cd roteiro-unificado && npm run type-check && npm run lint && npm run build`
- **Before `/gsd:verify-work`:** Full suite must be green + UAT manual checklist completa
- **Max feedback latency:** ~30 seconds (type-check)

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 05-01-01 | 01 | 1 | FORM-01, FORM-04 | T-05-cross-tenant | `partialize` exclui `sectionData` do localStorage | type-check + grep | `cd roteiro-unificado && npm run type-check && grep -c "sessionStorage" src/stores/formStore.ts` | ✅ W1 | ⬜ pending |
| 05-01-02 | 01 | 1 | FORM-01 | — | `TAB_CONFIG` tem exatamente 10 itens | grep | `cd roteiro-unificado && node -e "const m = require('./src/features/form/tabConfig'); console.log(m.TAB_CONFIG?.length)"` | ✅ W1 | ⬜ pending |
| 05-02-01 | 02 | 1 | UX-03 | — | Nenhum hex hardcoded em ProgressBadge | grep | `cd roteiro-unificado && grep -E "#[0-9a-fA-F]{3,8}" src/features/form/ProgressBadge.tsx \| wc -l` | ✅ W1 | ⬜ pending |
| 05-03-01 | 03 | 2 | FORM-04, UX-03 | — | `useFormSection` retorna `completeness: 0.01` após markTabVisited | type-check | `cd roteiro-unificado && npm run type-check` | ✅ W2 | ⬜ pending |
| 05-03-02 | 03 | 2 | UX-03 | — | TabNavigation usa `bg-primary-800` para aba ativa | grep | `cd roteiro-unificado && grep "primary-800" src/features/form/TabNavigation.tsx` | ✅ W2 | ⬜ pending |
| 05-03-03 | 03 | 2 | UX-03 | — | ProgressBar tem `aria-valuenow` | grep | `cd roteiro-unificado && grep "aria-valuenow" src/features/form/ProgressBar.tsx` | ✅ W2 | ⬜ pending |
| 05-04-01 | 04 | 3 | FORM-01, FORM-04 | T-05-unauthorized-access | `routeOrgId === authOrgId` guard presente | grep | `cd roteiro-unificado && grep "routeOrgId" src/features/form/FormLayout.tsx` | ✅ W3 | ⬜ pending |
| 05-04-02 | 04 | 3 | FORM-01 | — | router.tsx importa FormLayout (não placeholder) | grep | `cd roteiro-unificado && grep "FormLayout" src/router.tsx` | ✅ W3 | ⬜ pending |
| 05-04-03 | 04 | 3 | FORM-01, FORM-04, UX-03 | — | UAT manual — navegação completa funcional | manual | Ver § Manual-Only Verifications | n/a | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

Nenhum. Validação de Phase 5 é inteiramente coberta por:
- Type-check (`npm run type-check`) — detecta erros de tipo, interfaces incorretas
- Lint (`npm run lint`) — detecta padrões proibidos (ex: hex hardcoded via regra ESLint customizada)
- Build (`npm run build`) — valida bundle sem erros de compilação
- UAT manual — comportamentos de navegação/hash/responsive

*Vitest será introduzido na Phase 7 quando `calculateReadiness` oferecer lógica pura testável.*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Clique em aba muda conteúdo sem reload | FORM-01 | Interação browser; não testável via grep/type-check | Clicar em cada uma das 10 abas; verificar que o conteúdo principal troca |
| Navegação livre preserva dados entre abas | FORM-04 | Estado de store in-browser; requer interação real | Digitar em placeholder de aba A; ir para aba B; voltar para aba A; verificar que texto está presente |
| URL hash muda conforme aba ativa | FORM-04 | Browser behavior; não testável staticamente | Clicar em "Torre Decisão"; verificar que URL mostra `#torre-decisao` |
| Browser back/forward navega entre abas | FORM-04 | Browser history API; não testável staticamente | Navegar aba A → aba B → pressionar back; verificar que aba A é ativada |
| Mobile: pills horizontais scrolláveis em 375px | UX-03 | Layout visual; requer browser resize | Abrir DevTools → 375px width; verificar que sidebar vira pills scrolláveis |
| Barra de progresso avança ao visitar abas | UX-03 | Comportamento visual browser | Visitar 5 abas; verificar que a barra de progresso topo avançou |
| Botão Sair chama signOut e redireciona para /login | AUTH | Fluxo de sessão; requer browser | Clicar "Sair"; verificar redirect para /login com `replace: true` |
| Deep-link via URL hash carrega aba correta | FORM-04 | Comportamento de URL; requer browser | Abrir `/form/:orgId#torre-sienge` diretamente; verificar que aba Torre Sienge está ativa |
| Cross-tenant guard redireciona para org correta | Security | Requer sessão autenticada | Acessar `/form/outro-org-id` enquanto logado como construtora; verificar redirect para org correta |
| Spinner aparece enquanto store rehidrata | UX | Loading state visual | F5 na página; verificar Spinner brevemente antes do formulário aparecer (pode ser muito rápido) |
| Nenhum console.error no carregamento | Quality | Verificação geral de runtime | Abrir DevTools Console; F5; verificar zero erros |

---

## Validation Sign-Off

- [x] Todos os tasks têm `<automated>` verify via type-check/grep/build ou estão documentados como manual
- [x] Continuidade de amostragem: nenhuma sequência de 3+ tasks sem verificação automatizada
- [x] Wave 0: N/A (nenhum arquivo de teste necessário para esta fase)
- [x] Sem flags de watch-mode nos comandos automatizados
- [x] Latência de feedback: ~30s (type-check) — dentro do limite
- [x] `nyquist_compliant: true` definido no frontmatter

**Approval:** pending
