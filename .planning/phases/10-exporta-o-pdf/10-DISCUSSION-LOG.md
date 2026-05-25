# Phase 10: Exportação PDF - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-25
**Phase:** 10-exportação-pdf
**Areas discussed:** Logo e capa, Seções sem preenchimento, Trigger do download

---

## Logo e capa

### O que usar na capa sem logo disponível?

| Option | Description | Selected |
|--------|-------------|----------|
| Texto estilizado | "SuaEquipe.IA" em azul #123B66 com acento laranja #F28C28. Zero dependência de asset externo. | ✓ |
| Logo PNG fornecida | Usuário fornece PNG/SVG; importado como base64 no react-pdf. | |
| Sem logo na capa | Apenas nome da empresa, data e versão. | |

**User's choice:** Texto estilizado  
**Notes:** Nenhum asset de logo existe no projeto (apenas react.svg do Vite e vite.svg). Decisão elimina bloqueio de implementação.

### O que aparece na capa além de nome e data?

| Option | Description | Selected |
|--------|-------------|----------|
| Mínimo: nome + versão + data | Limpo e profissional. | |
| Completo: + CNPJ + classificação | CNPJ da empresa e G1-G5 em destaque na capa. | ✓ |
| Extendido: + período + responsável | Data de submissão original e nome do responsável. | |

**User's choice:** Completo: + CNPJ + classificação  
**Notes:** Contexto imediato na capa sem virar a página.

---

## Seções sem preenchimento

| Option | Description | Selected |
|--------|-------------|----------|
| Omitir seção inteira | Seção não aparece se nenhum campo foi preenchido. Documento mais enxuto. | |
| Mostrar com — em todos os campos | Seção aparece com todos os campos mostrando "—". Documento completo para auditoria. | ✓ |

**User's choice:** Mostrar com — em todos os campos  
**Notes:** Auditoria clara — diferencia "campo não respondido" de "campo não incluído".

---

## Trigger do download

| Option | Description | Selected |
|--------|-------------|----------|
| Download direto | Spinner → arquivo baixa automaticamente via PDFDownloadLink. | |
| Preview em nova aba | BlobProvider → PDF abre em nova aba; usuário salva manualmente. | ✓ |

**User's choice:** Preview em nova aba  
**Notes:** Usa BlobProvider + window.open(url). Spinner enquanto blob resolve.

---

## Claude's Discretion

- **Biblioteca PDF:** `@react-pdf/renderer` — prescrita pelo ROADMAP, sem discussão necessária.
- **Lazy-loading:** chunk isolado via `React.lazy` — prescrito pelo ROADMAP Plan 1.
- **Botão no admin (AssessmentSection):** não discutido — implementador decide incluir ou adiar.
- **Nome do arquivo:** `assessment_v{N}_{empresa}_{data}.pdf` — seguir prescrição do ROADMAP.

## Deferred Ideas

- Botão "Exportar PDF" no painel admin (AssessmentSection/OrgDetail) — deferred para Phase 12 se necessário.
- Download direto automático via `PDFDownloadLink` — deferred para feedback pós-piloto.
