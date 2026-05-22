# Requirements: Roteiro Unificado — App Web

**Definido:** 2026-05-22
**Core Value:** Qualquer construtora do piloto consegue preencher, salvar e retomar sua avaliação de prontidão — e o time da SuaEquipe.IA visualiza o status de todas as empresas em um único lugar.

---

## v1 Requirements

### Autenticação (AUTH)

- [ ] **AUTH-01**: Usuário pode fazer login com email e senha via Supabase Auth
- [ ] **AUTH-02**: Sessão persiste após refresh do browser (`createBrowserClient`)
- [ ] **AUTH-03**: Usuário pode recuperar senha via link por email
- [ ] **AUTH-04**: Ao fazer login, usuário é redirecionado para sua empresa (org) automaticamente
- [ ] **AUTH-05**: Admin interno (SuaEquipe.IA) pode visualizar todas as empresas; construtora vê apenas a sua

### Multi-tenant / Organizações (ORG)

- [ ] **ORG-01**: Cada construtora é uma organização (`org`) isolada por RLS no Supabase
- [ ] **ORG-02**: Usuário pertence a exatamente uma org via tabela `org_members`
- [ ] **ORG-03**: Admin pode criar e gerenciar orgs pelo painel interno
- [ ] **ORG-04**: RLS garante que consultas de uma org nunca retornam dados de outra

### Formulário de Avaliação (FORM)

- [ ] **FORM-01**: Formulário estruturado em abas: Identificação, Torre 360 (Decisão, Sienge, Acesso, Classificação), Habilitações (Venda, Repositórios, Responsáveis, Classificação), NDA
- [ ] **FORM-02**: Todos os campos do HTML atual são preservados na versão React (nenhuma seção omitida)
- [ ] **FORM-03**: Validação de campos obrigatórios via Zod + React Hook Form antes de avançar de aba
- [ ] **FORM-04**: Usuário pode navegar entre abas livremente (dados da aba anterior são preservados)
- [ ] **FORM-05**: Seleções tipo dropdown, radio, checkbox e textarea são fiéis ao documento original
- [ ] **FORM-06**: Campos condicionais exibem/ocultam conforme seleção anterior (ex: "Possui BI?" → mostrar qual)
- [ ] **FORM-07**: Classificação de prontidão (G1–G5 gerencial; níveis técnicos) é calculada automaticamente com base nas respostas

### Persistência e Versionamento (SAVE)

- [ ] **SAVE-01**: Respostas do formulário são salvas no Supabase com status `rascunho` (draft)
- [ ] **SAVE-02**: Autosave automático (debounce 1500ms) enquanto o usuário preenche
- [ ] **SAVE-03**: Usuário pode submeter avaliação — status muda para `enviado` (imutável)
- [ ] **SAVE-04**: Cada envio cria uma nova versão (`version++`) sem sobrescrever histórico (append-only)
- [ ] **SAVE-05**: Usuário pode iniciar nova revisão a partir da versão mais recente enviada
- [ ] **SAVE-06**: Histórico completo de versões da empresa é acessível (lista de avaliações anteriores)

### Dashboard (DASH)

- [ ] **DASH-01**: Página inicial do admin mostra lista de empresas com status e nível de prontidão atual
- [ ] **DASH-02**: Card de empresa exibe: nome, CNPJ, data da última avaliação, nível gerencial (G1–G5), nível técnico
- [ ] **DASH-03**: Construtora logada vai direto para o seu formulário/dashboard individual
- [ ] **DASH-04**: Indicador visual de progresso do formulário por seção (% completo por aba)
- [ ] **DASH-05**: Filtro/busca de empresas no painel admin por nome ou nível de prontidão

### Exportação (EXPORT)

- [ ] **EXPORT-01**: Botão "Exportar PDF" gera relatório da avaliação com identidade visual (azul/laranja)
- [ ] **EXPORT-02**: PDF inclui todas as seções preenchidas, classificações calculadas e data da avaliação
- [ ] **EXPORT-03**: Botão "Exportar Excel" gera planilha `.xlsx` com todos os campos e respostas
- [ ] **EXPORT-04**: Exportação está disponível para qualquer versão do histórico (não só a mais recente)
- [ ] **EXPORT-05**: Chunk de exportação é lazy-loaded (não impacta o First Load do app)

### Design e UX (UX)

- [ ] **UX-01**: Paleta de cores: azul `#123B66` e laranja `#F28C28` como cores primárias
- [ ] **UX-02**: Layout responsivo — funciona em desktop e tablet (formulário em campo)
- [ ] **UX-03**: Indicador visual de aba ativa e progresso geral do formulário
- [ ] **UX-04**: Feedback visual ao salvar (toast de confirmação)
- [ ] **UX-05**: Estados de loading/skeleton durante carregamento de dados do Supabase
- [ ] **UX-06**: Formulário redesenhado — não é uma cópia fiel do HTML; experiência melhorada com Tailwind v4

---

## v2 Requirements

Deferidos para versão futura — fora do escopo do MVP.

### Integrações

- **INT-01**: Integração direta com API Sienge para leitura automática de módulos contratados
- **INT-02**: Envio de notificações por e-mail (convite, avaliação enviada, status atualizado)
- **INT-03**: Webhook para notificar sistemas externos quando avaliação é submetida

### Assinatura Digital

- **SIGN-01**: Assinatura eletrônica do NDA dentro do app
- **SIGN-02**: Geração de contrato NDA em PDF para download após assinatura

### Colaboração

- **COLLAB-01**: Múltiplos usuários de uma mesma construtora preenchendo em simultâneo (real-time)
- **COLLAB-02**: Comentários/anotações por campo para o time interno

### Analytics

- **ANA-01**: Relatório agregado de prontidão de todo o piloto (visão gerencial para Sinduscon)
- **ANA-02**: Comparativo entre empresas (benchmark anônimo)

---

## Out of Scope

| Feature | Motivo |
|---------|--------|
| App mobile nativo | Web responsiva cobre o caso de uso; escala não justifica custo |
| Módulo de assinatura do NDA | NDA é registrado no formulário; assinatura digital é fase posterior |
| Integração Sienge (v1) | Avaliação inicial é manual; integração técnica é fase pós-piloto |
| Notificações por e-mail/WhatsApp | Fora do MVP; não impacta prontidão para produção do piloto |
| Multi-idioma | Contexto brasileiro, português apenas |

---

## Traceabilidade

| Requisito | Fase | Status |
|-----------|------|--------|
| AUTH-01 a AUTH-05 | Fase 1 — Fundação & Auth | Pendente |
| ORG-01 a ORG-04 | Fase 1 — Fundação & Auth | Pendente |
| FORM-01 a FORM-03 | Fase 2 — Estrutura do Formulário | Pendente |
| FORM-04 a FORM-07 | Fase 3 — Lógica do Formulário | Pendente |
| SAVE-01 a SAVE-03 | Fase 4 — Persistência & Autosave | Pendente |
| SAVE-04 a SAVE-06 | Fase 5 — Versionamento | Pendente |
| DASH-01 a DASH-05 | Fase 6 — Dashboard | Pendente |
| EXPORT-01 a EXPORT-05 | Fase 7 — Exportação | Pendente |
| UX-01 a UX-06 | Transversal (em todas as fases) | Pendente |

**Cobertura:**
- v1 requirements: 38 total
- Mapeados para fases: 38
- Sem fase: 0 ✓

---
*Requirements definidos: 2026-05-22*
*Última atualização: 2026-05-22 após inicialização*
