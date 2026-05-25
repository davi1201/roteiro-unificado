---
status: approved
phase: 10-exporta-o-pdf
source: [10-VERIFICATION.md]
started: 2026-05-25T18:45:00Z
updated: 2026-05-25T18:45:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Bundle isolation (EXPORT-05)
expected: chunk @react-pdf aparece separado do index-*.js principal no output de `npm run build`
result: ✅ confirmed — pdf-BsYjszVF.js (1.44MB) separado do index-D7AN7KZ0.js (328KB)

### 2. Lazy-load em runtime
expected: DevTools → Network não carrega chunk react-pdf ao abrir HistoryPage; carrega apenas ao clicar "Exportar PDF"
result: ✅ approved by user

### 3. PDF visual
expected: capa azul #123B66, marca "SuaEquipe.IA" com ".IA" laranja, nome da construtora, CNPJ, "Avaliação vN", data, badge G1-G5
result: ✅ approved by user during checkpoint

### 4. 10 seções + D-03 + tabela G1-G5
expected: PDF contém todas as 10 abas (Torre 360 + Habilitações + NDA), campos vazios mostram "—", última página tem tabela de classificação G1-G5
result: ✅ approved by user

### 5. Versão histórica (EXPORT-04)
expected: exportar v1 mostra dados da v1, não da versão mais recente
result: ✅ approved by user

### 6. Acentos PT-BR
expected: caracteres ã, ç, é, ô renderizam corretamente no PDF (sem broken characters)
result: ✅ approved by user

## Summary

total: 6
passed: 6
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps
