---
status: complete
completed_at: 2026-05-26
---

# Summary: Exportar JSON das respostas da avaliação

## O que foi feito

- **ExportJsonButton.tsx** criado: busca `form_data` via Supabase (RLS protege automaticamente), gera blob JSON com payload completo (assessmentId, version, orgName, submittedAt, readinessLevels, formData) e dispara download com filename sanitizado `avaliacao-v{version}-{orgName}.json`.
- **HistoryContent.tsx** atualizado: `ExportJsonButton` adicionado ao lado do `ExportPdfButton` em cada card de versão com `status === 'submitted'`.
- **ExportJsonButton.test.tsx** criado: 4 testes cobrindo IDLE, LOADING, ERROR (toast) e sucesso (blob criado + download disparado).

## Commit

`bdfa5a0` — feat: adicionar botão Exportar JSON no histórico de avaliações
</content>
</invoke>