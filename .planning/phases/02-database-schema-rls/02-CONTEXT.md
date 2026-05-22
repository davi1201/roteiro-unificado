# Phase 2: Database Schema & RLS - Context

**Gathered:** 2026-05-22
**Status:** Ready for planning

<domain>
## Phase Boundary

Criar o schema PostgreSQL completo no Supabase — tabelas `orgs`, `org_members`, `assessments`, enums, foreign keys, índices e políticas RLS que garantem isolamento total entre organizações. Inclui seed de dados de teste e atualização dos tipos TypeScript em `database.ts`.

Esta fase é infraestrutura pura — sem UI. Output: banco funcional com RLS ativo e tipos TypeScript sincronizados.

</domain>

<decisions>
## Implementation Decisions

### Armazenamento de dados do formulário
- **D-01:** `form_data` armazenado como **JSONB blob** na tabela `assessments` — uma coluna por avaliação completa. Abordagem alinhada com o ROADMAP.
- **D-02:** O JSONB guarda **snapshot completo** do formulário — todos os campos, mesmo os não preenchidos (valor `null`). Facilita restaurar qualquer versão e elimina necessidade de merge com defaults.
- **D-03:** Validação do schema do `form_data` feita **exclusivamente no app via Zod** — o Postgres aceita qualquer JSON válido sem `CHECK constraint`. Flexibilidade para evoluir campos do formulário sem migrations adicionais.

### Classificação de prontidão
- **D-04:** Resultados de classificação armazenados como **colunas diretas em `assessments`**: `readiness_level_mgmt VARCHAR` (G1–G5) e `readiness_level_tech VARCHAR` (nível técnico). Calculadas na submissão, indexadas para queries rápidas no dashboard.

### Claude's Discretion
- **Admin identity model**: Como admins SuaEquipe.IA são identificados (role em `org_members` de org interna vs flag global) — escolha a abordagem mais simples que suporte as RLS policies de acesso cross-org.
- **Schema management workflow**: CLI Supabase local com migrations rastreadas em git vs SQL no dashboard — seguir a abordagem que o ambiente de desenvolvimento suportar.
- **TypeScript types**: Escrever manualmente os tipos em `database.ts` para esta fase; adicionar comentário sobre regeneração via `supabase gen types typescript` quando o projeto tiver CLI configurado.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Schema & Requisitos
- `.planning/REQUIREMENTS.md` §ORG (ORG-01, ORG-02, ORG-04) — requisitos de isolamento multi-tenant que o schema deve satisfazer
- `.planning/ROADMAP.md` §Phase 2 — definição das tabelas, enums, índices, RLS policies e seed planejados

### Código existente (deve ser atualizado)
- `roteiro-unificado/src/types/database.ts` — arquivo de tipos TypeScript que DEVE ser populado com as tabelas criadas nesta fase; o cliente Supabase já importa este tipo
- `roteiro-unificado/src/lib/supabase.ts` — cliente Supabase tipado com `Database`; não modificar, mas verificar compatibilidade após atualizar `database.ts`

### Referência de domínio
- `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html` — documento HTML original do formulário; referência para entender os campos que o JSONB `form_data` vai armazenar

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `roteiro-unificado/src/types/database.ts`: arquivo esqueleto já existe com tipos utilitários (`Tables<T>`, `Json`) — expandir com as tabelas reais, não criar um novo arquivo
- `roteiro-unificado/src/lib/supabase.ts`: cliente já tipado com `createClient<Database>` — nenhuma mudança necessária após `database.ts` ser atualizado

### Established Patterns
- Variáveis de ambiente: padrão `VITE_SUPABASE_*` já em uso — seed script e migrations devem assumir essas variáveis configuradas

### Integration Points
- `database.ts` é o contrato entre o banco e o TypeScript — todas as fases seguintes (Auth, Form, Dashboard) dependem dos tipos gerados aqui
- RLS policies definidas aqui são o mecanismo de segurança que a Phase 3 (Auth) vai confiar — as policies devem ser testadas antes da Phase 3 começar

</code_context>

<specifics>
## Specific Ideas

- Tabela `assessments` deve ter `readiness_level_mgmt` e `readiness_level_tech` como colunas indexadas para suportar filtros do dashboard admin (DASH-05)
- `form_data JSONB` como snapshot completo permite exportação Excel fiel sem lógica de merge (EXPORT-03)

</specifics>

<deferred>
## Deferred Ideas

Nenhuma — discussão focada no escopo da fase.

</deferred>

---

*Phase: 02-database-schema-rls*
*Context gathered: 2026-05-22*
