# Phase 9: Dashboard de Prontidão - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-24
**Phase:** 09-dashboard-de-prontid-o
**Areas discussed:** Admin dashboard (tabela ou cards), Completude por seção (SectionProgress)

---

## Admin Dashboard — Tabela ou Cards?

### Pergunta 1: Como integrar dados de prontidão ao AdminDashboard existente?

| Opção | Descrição | Selecionado |
|-------|-----------|-------------|
| Substituir tabela por cards | Grid de CompanyCards com G1-G5, CNPJ, última avaliação. Botões de gestão migram para OrgDetail. Dashboard vira painel de prontidão puro. | ✓ |
| Adicionar cards acima da tabela | Cards de prontidão no topo; tabela existente abaixo. Duas visões na mesma página. | |
| Duas abas: Dashboard / Organizações | Tab 'Dashboard' com cards; tab 'Organizações' com tabela atual. | |

**User's choice:** Substituir tabela por cards  
**Notes:** Dashboard vira painel de prontidão puro — OrgTable removida.

---

### Pergunta 2: O que acontece com "Nova Org" e "Arquivar"?

| Opção | Descrição | Selecionado |
|-------|-----------|-------------|
| Manter "Nova Org" no header do dashboard | Botão "Nova Org" permanece no canto superior direito. "Arquivar" fica no OrgDetail (já existe). CompanyCard só tem link "Ver detalhes". | ✓ |
| Mover tudo para OrgDetail | Dashboard vira somente visualização. Criar org via menu separado ou link. | |

**User's choice:** Manter "Nova Org" no header do dashboard  
**Notes:** Mínima mudança de fluxo para o admin — só a tabela muda de forma.

---

### Pergunta 3: De qual avaliação o CompanyCard puxar dados?

| Opção | Descrição | Selecionado |
|-------|-----------|-------------|
| Draft ativo (mais recente) | Estado mais atual, mesmo não enviado. readiness_level_mgmt do draft via autosave. | |
| Última avaliação submetida (status='submitted') | Apenas avaliações formalmente enviadas. Mais "oficial" mas pode estar desatualizado. | ✓ |
| A mais recente (qualquer status) | Draft ativo se existir, senão a última submetida. Sempre o dado mais fresco. | |

**User's choice:** Última avaliação submetida (status='submitted')  
**Notes:** Dashboard admin mostra apenas dados formalmente entregues — draft em andamento não vaza.

---

### Pergunta 4: Empresa sem avaliação submetida ainda?

| Opção | Descrição | Selecionado |
|-------|-----------|-------------|
| Badge "Sem avaliação" + data vazia | Card renderiza normalmente com badge cinza "Sem avaliação" e texto "Não iniciado". Ainda tem link "Ver detalhes". | ✓ |
| Ocultar empresa no dashboard | Empresas sem submissão não aparecem no painel de prontidão. | |

**User's choice:** Badge "Sem avaliação" + data vazia  
**Notes:** Admin mantém visão completa de quem ainda não enviou.

---

## Completude por Seção (SectionProgress)

### Pergunta 1: De onde virão os dados do SectionProgress?

| Opção | Descrição | Selecionado |
|-------|-----------|-------------|
| Do JSONB assessments.form_data | Dashboard busca assessment via TanStack Query. SectionProgress analisa form_data[tab]. Independente do Zustand. | ✓ |
| Do Zustand formStore (sectionData) | Reutiliza store existente. Mais simples, mas acopla dashboard ao FormLayout. | |
| De ambos: form_data + store como live | Store quando FormLayout ativo, form_data quando não. Mais flexível mas mais complexo. | |

**User's choice:** Do JSONB assessments.form_data  
**Notes:** Dashboard da construtora é rota independente — não pode depender do Zustand.

---

### Pergunta 2: Como calcular % de completude?

| Opção | Descrição | Selecionado |
|-------|-----------|-------------|
| Status simples: Vazio / Em progresso / Completo | Sem % numérico. Completo = todos obrigatórios via REQUIRED_COUNT. Em progresso = qualquer outro caso. | ✓ |
| Contagem campos / REQUIRED_COUNT | % real (ex: 4/12 = 33%). Mais preciso, mais acoplamento com schemas. | |
| Booleano: tocado ou não tocado | Simples mas menos informativo. | |

**User's choice:** Status simples: Vazio / Em progresso / Completo  
**Notes:** Sem % numérico exibido — apenas status por ícone/cor.

---

### Pergunta 3: Como determinar "Completo"?

| Opção | Descrição | Selecionado |
|-------|-----------|-------------|
| REQUIRED_COUNT de cada schema | Importar REQUIRED_COUNT dos 10 schemas existentes. "Completo" quando todos os obrigatórios estão preenchidos. Preciso e consistente. | ✓ |
| Heurística: campo sentinela por aba | Cada aba tem 1 campo chave (ex: 'empresa' para Identificação). Simples mas impreciso. | |
| Claude decide | Implementador escolhe abordagem mais simples. | |

**User's choice:** REQUIRED_COUNT de cada schema  
**Notes:** Consistência com a validação já implementada nos schemas.

---

## Claude's Discretion

- **Destino pós-login da construtora** — não discutido; área não selecionada. Mantido redirect para `/form/:orgId` sem mudança de routing. Dashboard acessível via link no FormLayout.
- **OrgDetail — integração de assessment** — não discutido; área não selecionada. ROADMAP define que OrgDetail combina dashboard + histórico + link exportação. Implementador adiciona seção abaixo do Card existente.
- **Data fetch do admin dashboard** — implementador escolhe entre JOIN direto no PostgREST ou hook `useOrgsWithReadiness` separado.
- **Ícones do SectionProgress** — usar ProgressBadge existente (Phase 5) por consistência.

## Deferred Ideas

- Mudança do destino pós-login para `/form/:orgId/dashboard` — possível em Phase 12 (polimento).
- Drill-down de seção via hash URL — implementador inclui se trivial, caso contrário Phase 12.
- Notificações ao admin quando construtora submete — fora de escopo (PROJECT.md Out of Scope).
