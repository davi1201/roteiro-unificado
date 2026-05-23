# Phase 8: Autosave, Submissão & Versionamento - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-23
**Phase:** 08-autosave-submiss-o-versionamento
**Areas discussed:** Carga do rascunho ao abrir, Autosave offline / resiliência

---

## Carga do rascunho ao abrir

| Option | Description | Selected |
|--------|-------------|----------|
| Sempre busca do Supabase | useQuery busca draft mais recente do DB; ignora sessionStorage. Garante restauração cross-device. sessionStorage vira só cache temporário de UI. | ✓ |
| sessionStorage tem prioridade | Se sessionStorage tem dados, usa sem consultar DB. Mais rápido, mas pode mostrar dados stale. | |
| Merge: DB + sessionStorage | Mescla os dois com timestamp. Alta complexidade, poucos benefícios reais para o piloto. | |

**User's choice:** Sempre busca do Supabase

---

| Option | Description | Selected |
|--------|-------------|----------|
| Nova action hydrateFromAssessment | formStore ganha action hydrateFromAssessment(formData) que distribui o JSONB para cada sectionData[TabKey]. TanStack Query chama a action no onSuccess. | ✓ |
| Substitui sectionData direto | useQuery retorna form_data e componente faz store.setState({sectionData: formData}) diretamente. | |
| Você decide | Implementador escolhe a abordagem mais adequada ao padrão existente no formStore. | |

**User's choice:** Nova action hydrateFromAssessment

---

| Option | Description | Selected |
|--------|-------------|----------|
| Form abre vazio, draft criado no primeiro autosave | Sem draft = form em branco. Registro em assessments criado quando autosave dispara pela primeira vez (INSERT). | ✓ |
| Draft criado ao abrir a página (eager INSERT) | FormLayout faz INSERT imediato de registro vazio ao montar. Garante que registro sempre existe para UPDATEs, mas cria registros vazios. | |

**User's choice:** Form abre vazio, draft criado no primeiro autosave

---

## Autosave offline / resiliência

| Option | Description | Selected |
|--------|-------------|----------|
| Toast warning + retry no próximo keystroke | Toast "Falha ao salvar — tentando novamente". Próximo change re-dispara debounce normalmente. Simples, cobre o caso real do piloto. | ✓ |
| Retry automático com backoff (1s, 3s, 10s) | useAutosave re-tenta 3x com backoff exponencial. Toast muda de "salvando..." para "falha" só após esgotar retries. Mais robusto mas adiciona complexidade. | |
| Banner persistente de conexão | Detectar online/offline events; banner fixo "Sem conexão". Desaparece ao reconectar + flush automático. | |

**User's choice:** Toast warning + retry no próximo keystroke

---

| Option | Description | Selected |
|--------|-------------|----------|
| Sim — calcular e salvar no autosave | useAutosave chama calculateReadiness(sectionData) e inclui níveis no upsert. Dashboard da Fase 9 tem dados frescos sem aguardar submissão. | ✓ |
| Não — só salvar no submit | readiness_level_mgmt e readiness_level_tech calculados e salvos apenas na submissão formal. Draft salva apenas form_data bruto. | |

**User's choice:** Sim — calcular e salvar no autosave

---

## Claude's Discretion

- **Destino pós-submissão** — não discutido. Claude decidiu: redirect para `/form/:orgId/history` após confirmação é o fluxo mais natural.
- **Nova revisão — pré-preenchimento** — não discutido. Claude seguirá o ROADMAP ("copiando form_data da versão mais recente") usando `hydrateFromAssessment`.
- **Placement do botão "Enviar Avaliação"** — não discutido. Claude decide baseado no layout mais adequado (sticky footer na aba NDA ou FormLayout).

## Deferred Ideas

None — discussão focada no escopo da fase.
