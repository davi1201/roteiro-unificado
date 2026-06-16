---
slug: submit-undo-ux
date: 2026-06-16
status: in-progress
---

# Quick Task: UX de Recuperação Após Envio Acidental

Implementar Opção A do spike submit-undo — melhorar o fluxo pós-submit para que o usuário
consiga facilmente retomar a edição após envio acidental.

## Tarefas

### T1 — HistoryContent.tsx: banner de recuperação rápida
- Adicionar helper `isRecentSubmission(submittedAt)` — retorna true se submitted_at < 15min
- Renderizar card azul acima da lista quando `mostRecentIsSubmitted && isRecentSubmission`
- Card: texto "Enviou agora? Você pode continuar editando." + botão "Retomar Edição" → `newRevisionMutation.mutate()`
- Arquivo: `roteiro-unificado/src/features/form/HistoryContent.tsx`

### T2 — FormLayout.tsx: melhorar copy do dialog de confirmação
- Atualizar `DialogDescription` para preparar o usuário sobre possibilidade de retomar
- Arquivo: `roteiro-unificado/src/features/form/FormLayout.tsx`

## Critérios de conclusão
- [ ] Banner aparece na HistoryContent quando submitted_at < 15min
- [ ] Banner desaparece após 15min (é condicional, não precisa de timer client-side)
- [ ] Clicar "Retomar Edição" chama useNewRevision corretamente
- [ ] Copy do dialog de FormLayout atualizado
- [ ] Nenhum teste existente quebrado
