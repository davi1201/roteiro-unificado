---
status: complete
phase: 06-campos-do-formul-rio-torre-360
source: [06-01-SUMMARY.md, 06-02-SUMMARY.md, 06-03-SUMMARY.md, 06-04-SUMMARY.md, 06-05-SUMMARY.md, 06-06-SUMMARY.md, 06-07-SUMMARY.md]
started: 2026-05-24T00:00:00Z
updated: 2026-05-24T03:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

[testing complete]

## Tests

### 1. 5 abas Torre 360 acessíveis
expected: Ao abrir o formulário logado, as abas Identificação, Torre Decisão, Torre Sienge, Torre Acesso e Torre Classificação estão visíveis na navegação. Clicar em cada aba carrega os campos correspondentes (sem erro, sem tela em branco).
result: pass

### 2. Máscara CNPJ na aba Identificação
expected: Na aba Identificação, digitar apenas números no campo CNPJ formata automaticamente para o padrão XX.XXX.XXX/XXXX-XX. Ex: digitar 12345678901234 exibe 12.345.678/9012-34.
result: pass

### 3. Campo condicional "Qual BI?" na Torre Decisão
expected: Na aba Torre Decisão, selecionar "Sim (Power BI)" ou "Sim (outro BI)" no select "Existe BI hoje?" revela o campo "Qual BI?". Selecionar qualquer outra opção (Não, Em implantação) faz o campo desaparecer.
result: pass

### 4. Aba Torre Sienge — 12 cards de módulos
expected: A aba Torre Sienge exibe 12 cards de módulos Sienge (ex: Cadastros, Financeiro, BI…). Cada card contém selects de Contratado, Uso Real, Confiança do Dado, Controle Paralelo e campo de Observações. Layout responsivo em grid.
result: pass

### 5. CheckboxGroup com seleção múltipla
expected: Nas abas Torre Acesso ou Torre Classificação, marcar vários checkboxes e desmarcar individualmente funciona — cada item mantém estado visual independente e não interfere nos demais.
result: pass

### 6. Navegação cross-tab preserva dados
expected: Preencher um campo na aba Identificação (ex: nome da empresa), clicar em outra aba (ex: Torre Decisão), voltar para Identificação — o valor preenchido permanece no campo.
result: pass

### 7. Validação inline na Identificação
expected: Com o campo "Empresa" vazio, clicar fora dele (onBlur) exibe mensagem de erro de validação. Preencher o campo com texto válido (mínimo 2 caracteres) remove a mensagem de erro.
result: pass

## Summary

total: 7
passed: 7
issues: 0
pending: 0
skipped: 0
blocked: 0

## Gaps

[none yet]
