---
title: Exportar JSON das respostas da avaliação
slug: export-json-respostas
date: 2026-05-26
status: in-progress
---

# Exportar JSON das respostas da avaliação

Adicionar botão "Exportar JSON" no card de cada versão enviada no histórico (HistoryContent),
ao lado do ExportPdfButton existente.

## Tasks

- [ ] T1: Criar ExportJsonButton.tsx — busca form_data via Supabase, gera download .json
- [ ] T2: Adicionar ExportJsonButton no HistoryContent.tsx ao lado do ExportPdfButton
- [ ] T3: Criar ExportJsonButton.test.tsx com testes básicos

## Detalhes técnicos

- Fetch: `supabase.from('assessments').select('form_data').eq('id', assessmentId).single()`
- Filename: `avaliacao-v{version}-{orgName}.json` (lowercase, spaces→hyphens)
- Download: Blob URL com `<a>` element + click + revokeObjectURL
- Pattern igual ao ExportPdfButton: state machine IDLE/LOADING/ERROR + useToast
- Aparece apenas para assessments com status `submitted` (mesmo critério do ExportPdfButton)
</content>
</invoke>