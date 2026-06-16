---
slug: submit-undo-ux
status: complete
---

# Summary: UX de Recuperação Após Envio Acidental

## O que foi feito

- `HistoryContent.tsx`: adicionado helper `isRecentSubmission` + banner azul que aparece quando `submitted_at < 15min`, com botão "Retomar Edição" chamando `useNewRevision`
- `FormLayout.tsx`: copy do dialog de confirmação atualizado para avisar que o usuário pode retomar após o envio

## Resultado
- 196 testes passando, nenhuma regressão
- Zero mudança de schema/DB
- Audit trail preservado (append-only)
