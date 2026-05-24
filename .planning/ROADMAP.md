# Roadmap: Roteiro Unificado — App Web

**Projeto:** Avaliação de prontidão multi-tenant para construtoras (piloto Sinduscon)
**Stack:** React + Vite + Tailwind v4 + Supabase
**Granularidade:** Fine (12 fases)
**Cobertura:** 38/38 requisitos v1 ✓
**Criado em:** 2026-05-22

---

## Milestone 1: Fundação & Infraestrutura

**Goal:** A base técnica do projeto está pronta — projeto inicializado com design system, banco de dados isolado por RLS, autenticação funcional com roteamento por role, e painel de administração de organizações operacional. Time interno pode criar orgs e usuários; construtoras podem fazer login e chegar ao seu espaço.

---

### Phase 1: Scaffolding & Design System

**Goal:** Projeto React + Vite + Tailwind v4 inicializado, cliente Supabase configurado, biblioteca de componentes UI base criada com paleta azul/laranja.
**Requirements:** UX-01, UX-06
**Depends on:** Nenhum

#### Plans

**Wave 1** _(paralelo — sem dependências externas)_

1. **Inicializar projeto Vite + React + TypeScript** — `npm create vite@latest` com template React-TS; configurar paths de alias `@/` no `tsconfig.json` e `vite.config.ts`
2. **Configurar Supabase client** — instalar `@supabase/supabase-js`; criar `src/lib/supabase.ts` com `createClient`; configurar variáveis `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
3. **Configurar ESLint + Prettier + Husky** — configurar ESLint 10 flat config, `.prettierrc` com `prettier-plugin-tailwindcss`; hook `pre-commit` rodando lint e type-check

**Wave 2** _(paralelo — dependem da Wave 1)_ 2. **Configurar Tailwind v4** — instalar `@tailwindcss/vite`; substituir `tailwind.config.js` por `@import "tailwindcss"` + bloco `@theme {}` no CSS principal; definir tokens de cor `--color-primary: #123B66`, `--color-accent: #F28C28` e escala completa 4. **Configurar TanStack Query v5 e Zustand** — instalar e criar `QueryClientProvider` no root; instalar Zustand; criar store esqueleto para estado global do formulário

**Wave 3** _(depende de Wave 2)_ 6. **Criar sistema de Toast (Sonner)** — instalar `sonner`; adicionar `<Toaster>` no root; criar hook `useToast` com wrappers para success/error/loading/promise

**Wave 4** _(depende de Waves 2 + 3)_ 5. **Criar componentes UI base** — `Button` (variantes: primary, secondary, ghost), `Input`, `Textarea`, `Select`, `Card`, `Badge` (G1–G5), `Spinner`, `Skeleton` — todos consumindo tokens Tailwind v4; página DesignSystem para verificação visual

**Cross-cutting constraints:**

- Todos os tokens de cor devem ser definidos via `@theme {}` em CSS — nunca hardcodar hex nos componentes
- Alias `@/` deve ser configurado no `tsconfig.json` E no `vite.config.ts`

**UAT:**

- [ ] `npm run dev` abre app no browser sem erros de console
- [ ] Página inicial renderiza com fundo azul `#123B66` e botão laranja `#F28C28`
- [ ] Classes Tailwind v4 (ex: `bg-primary`) aplicam cores corretas via `@theme {}`
- [ ] Componentes Button, Input e Card renderizam visualmente distintos e responsivos
- [ ] Toast de teste dispara e desaparece após timeout
- [ ] `npm run build` completa sem erros TypeScript

---

### Phase 2: Database Schema & RLS

**Goal:** Banco de dados Supabase com todas as tabelas necessárias, enums, foreign keys e políticas RLS que garantem isolamento total entre organizações.
**Requirements:** ORG-01, ORG-02, ORG-04
**Depends on:** Phase 1 _(pode ser executada em paralelo com Phase 3)_

#### Plans

**Plans:** 3 plans

- [ ] 02-01-PLAN.md — Inicializar Supabase CLI, criar migrations de schema base (enums/tabelas/índices) e popular database.ts com tipos TypeScript
- [ ] 02-02-PLAN.md — Criar migrations de RLS (enable, helper functions, policies) e seed SQL com usuários de teste
- [ ] 02-03-PLAN.md — [BLOCKING] Aplicar schema ao banco remoto via supabase db push e verificar isolamento RLS

**UAT:**

- [ ] Usuário `empresa1` autenticado consegue fazer SELECT apenas em assessments da sua org
- [ ] Tentativa de SELECT em assessment de outra org retorna 0 linhas (RLS ativo)
- [ ] Usuário `admin` consegue SELECT em todas as orgs e assessments
- [ ] INSERT em assessment com `org_id` inválido falha com erro de RLS
- [ ] Migration roda sem erros via `supabase db push`
- [ ] Seed cria os usuários de teste com roles corretos

---

### Phase 3: Authentication & Roteamento por Role

**Goal:** Login, persistência de sessão e recuperação de senha funcionando via Supabase Auth; usuário é redirecionado automaticamente para seu espaço após login.
**Requirements:** AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05
**Depends on:** Phase 1 _(pode ser executada em paralelo com Phase 2)_

**Plans:** 6/6 plans executed — COMPLETA

Plans:

- [x] 03-01-PLAN.md — Instalar dependências (react-router-dom, RHF, Zod) + AuthProvider + useAuth()
- [x] 03-02-PLAN.md — Hook useUser() + atualizar formStore com persist key namespaceada por tenantId
- [x] 03-03-PLAN.md — Página de Login com layout UI-SPEC, validação Zod/RHF, auth flicker
- [x] 03-04-PLAN.md — Páginas ForgotPassword e ResetPassword (fluxo de recuperação de senha)
- [x] 03-05-PLAN.md — ProtectedRoute, AdminRoute e configuração do React Router v6
- [x] 03-06-PLAN.md — Wiring final: App.tsx + main.tsx + roteamento pós-login por role

**UAT:**

- [ ] Admin faz login e é redirecionado para `/admin/dashboard`
- [ ] Construtora faz login e é redirecionada para `/form/:orgId` da sua org
- [ ] Sessão persiste após F5 — usuário continua logado sem re-login
- [ ] Link de recuperação de senha enviado para email funciona; nova senha pode ser definida
- [ ] Acesso direto a `/admin/dashboard` sem autenticação redireciona para `/login`
- [ ] Construtora tentando acessar `/admin/dashboard` é bloqueada e redirecionada

---

### Phase 4: Gestão de Organizações & Painel Admin

**Goal:** Admin interno consegue criar, listar e gerenciar organizações e seus usuários pelo painel; construtoras são criadas com acesso imediato após cadastro.
**Requirements:** ORG-03
**Depends on:** Phases 2 + 3 _(pode ser executada em paralelo com Phase 5)_

**Plans:** 5/5 plans complete

Plans:
**Wave 1**

- [x] 04-01-PLAN.md — Criar shell do painel admin (Dialog primitive + AdminLayout + AdminSidebar + AdminHeader; substituir placeholders das rotas admin no router.tsx)

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 04-02-PLAN.md — Criar página de listagem de organizações (hook useOrgs com member_count agregado + OrgTable apresentacional + paginação client-side)

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 04-03-PLAN.md — Criar modal de criação de organização (schema Zod + CreateOrgModal com React Hook Form + INSERT orgs + invalidateQueries)
- [x] 04-04-PLAN.md — Criar página de detalhe da organização e Edge Function create-user (service_role isolado em Deno; AddMemberModal com fluxo Edge Function → INSERT org_members)

**Wave 4** *(blocked on Wave 3 completion)*

- [x] 04-05-PLAN.md — Implementar desativação de organização (useArchiveOrg + ArchiveOrgDialog; wiring em AdminDashboard e OrgDetail)

**Wave structure:**

- Wave 1: 04-01 (foundation: layout shell + Dialog primitive + router)
- Wave 2: 04-02 (listagem depende do layout)
- Wave 3: 04-03, 04-04 (criação + detalhe — paralelos, sem overlap de arquivos)
- Wave 4: 04-05 (arquivamento — modifica AdminDashboard e OrgDetail, requer 04-03 e 04-04 finalizados)

**UAT:**

- [ ] Admin cria nova org "Construtora XYZ" com CNPJ válido — org aparece na lista
- [ ] Admin adiciona usuário `maria@xyz.com` à org XYZ com role `company`
- [ ] Usuário `maria@xyz.com` faz login e é redirecionada para `/form/:orgId` da org XYZ
- [ ] Admin arquiva org — org não aparece mais na listagem ativa
- [ ] CNPJ com formato inválido no formulário exibe erro de validação inline

---

## Milestone 2: Formulário & Persistência

**Goal:** Formulário completo de avaliação com todas as 10 abas implementadas, validação Zod, campos condicionais, classificação G1-G5 calculada automaticamente, autosave em rascunho e versionamento append-only de avaliações submetidas. Construtora preenche, salva, retoma e submete a avaliação completa.

---

### Phase 5: Shell do Formulário & Navegação por Abas

**Goal:** Estrutura do formulário com 10 abas navegáveis livremente, indicador de progresso por aba e estado cross-step gerenciado pelo Zustand.
**Requirements:** FORM-01, FORM-04, UX-03
**Depends on:** Phases 2 + 3 _(pode ser executada em paralelo com Phase 4)_

**Plans:** 4/4 plans executed — COMPLETA ✅

Plans:
**Wave 1** *(paralelo — sem dependências entre si)*

- [x] 05-01-PLAN.md — Expandir formStore (TabKey enum, activeTab, visitedTabs, sectionData + 4 actions, storage split localStorage/sessionStorage) e criar tabConfig.ts (TAB_CONFIG com 10 itens)
- [x] 05-02-PLAN.md — Criar ProgressBadge.tsx (componente puro presentacional com 3 estados SVG inline: círculo vazio / clock / check)

**Wave 2** *(blocked on Wave 1 — depende de TabKey, TAB_CONFIG e ProgressBadge)*

- [x] 05-03-PLAN.md — Criar useFormSection hook + TabNavigation (stepper desktop / pills mobile com guard anti-loop de hash) + ProgressBar (faixa sticky h-1 no topo com aria-valuenow)

**Wave 3** *(blocked on Wave 2)*

- [x] 05-04-PLAN.md — Criar FormLayout (sidebar bg-primary + TabNavigation + botão Sair + hash sync useEffect + cross-tenant guard) e religar router.tsx substituindo placeholder de /form/:orgId; checkpoint humano final de verificação visual no browser

**Wave structure:**

- Wave 1: 05-01 (store + tabConfig) + 05-02 (ProgressBadge) — paralelos, sem overlap de arquivos
- Wave 2: 05-03 (hook + TabNavigation + ProgressBar) — consome artefatos da Wave 1
- Wave 3: 05-04 (FormLayout + router wiring + checkpoint) — composição final

**UAT:**

- [ ] Construtora logada acessa `/form/:orgId` e vê formulário com 10 abas na sidebar
- [ ] Clique em qualquer aba muda o conteúdo principal sem recarregar a página
- [ ] Digitar em campo de uma aba, ir para outra aba e voltar — dados estão preservados
- [ ] Barra de progresso geral avança ao preencher campos
- [ ] Em mobile (375px), abas aparecem como tabs horizontais scrolláveis no topo
- [ ] URL hash muda conforme aba ativa; pressionar "back" no browser volta à aba anterior

---

### Phase 6: Campos do Formulário — Torre 360

**Goal:** As 5 abas da Torre 360 (Identificação + Torres Decisão, Sienge, Acesso, Classificação) implementadas com todos os campos do HTML original, tipos corretos e campos condicionais funcionando.
**Requirements:** FORM-05, FORM-06
**Depends on:** Phase 5

**Plans:** 7/7 plans complete

Plans:
**Wave 1** *(blocker — biblioteca de field components)*

- [x] 06-01-PLAN.md — Criar biblioteca de field components (SelectField, TextareaField, RadioGroupField, CheckboxGroupField, ConditionalField) como wrappers de Controller em src/components/ui/ + atualizar barrel index.ts

**Wave 2** *(paralelo — 5 Section components + 5 schemas Zod, todos dependem de 06-01)*

- [x] 06-02-PLAN.md — Aba Identificação: schema Zod (12 campos, 2 obrigatórios com regex CNPJ) + IdentificacaoSection com máscara de CNPJ
- [x] 06-03-PLAN.md — Aba Torre Decisão: schema Zod + TorreDecisaoSection com ConditionalField (campo "Qual BI?" condicional ao select "Existe BI hoje?")
- [x] 06-04-PLAN.md — Aba Torre Sienge: schema Zod aninhado (12 módulos × 5 colunas via moduleSchema reutilizado) + TorreSiengeSection com cards responsivos por módulo
- [x] 06-05-PLAN.md — Aba Torre Acesso: schema Zod (8 selects + 3 textareas + checkbox group de 6 opções) + TorreAcessoSection
- [x] 06-06-PLAN.md — Aba Torre Classificação: schema Zod (T360-A..E + abordagem + 5 textareas de plano + checkbox group de 9 evidências) + TorreClassificacaoSection

**Wave 3** *(wiring final — depende das 5 Sections + atualização de useFormSection)*

- [x] 06-07-PLAN.md — Ampliar useFormSection (control? opcional, completeness real via useFormState) + ligar FormLayout switch(activeTab) com os 5 Section components + checkpoint humano de verificação visual no browser

**Wave structure:**

- Wave 1: 06-01 (biblioteca de field components — blocker para todas as Sections)
- Wave 2: 06-02..06-06 (5 Sections + 5 schemas em paralelo — todos dependem de Wave 1, sem overlap de arquivos)
- Wave 3: 06-07 (integração final — modifica useFormSection.ts e FormLayout.tsx, requer todas as Sections prontas)

**UAT:**

- [ ] Aba Torre Decisão: ao selecionar "Sim, utiliza BI" o campo "Qual BI?" aparece; ao selecionar "Não" o campo desaparece
- [ ] Aba Torre Sienge: cards de 12 módulos × 5 campos cada renderizam com options do HTML original
- [ ] Campos obrigatórios (Empresa, CNPJ) exibem mensagem de erro inline ao perder foco em branco/inválido
- [ ] Todos os campos do HTML de referência existem nas abas correspondentes (verificar manualmente contra `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html`)
- [ ] Campos RadioGroup mostram seleção visual clara (ring-2 ring-primary bg-primary/10 ao selecionar)
- [ ] Layout de campo é responsivo em 768px (tablet)

---

### Phase 7: Campos — Habilitações, NDA & Classificação G1-G5

**Goal:** As 5 abas restantes (Hab. Venda, Hab. Repositórios, Hab. Responsáveis, Hab. Classificação e NDA) implementadas com todos os campos do HTML de referência, validação Zod (incluindo aceite obrigatório do NDA via `z.literal(true)`) e engine pura `calculateReadiness` que exibe badge G1-G5 + HAB-A..E + indicador NDA aceito em tempo real (sem score automático — valores vêm de selects diretos preenchidos pelo consultor).
**Requirements:** FORM-02, FORM-03, FORM-07, UX-02
**Depends on:** Phase 6

**Plans:** 6 plans

Plans:
**Wave 1** *(paralelo — sem dependências entre si, sem overlap de arquivos)*

- [ ] 07-01-PLAN.md — Fundação: InputField (wrapper RHF), barrel export, constante NDA_TEXT em src/constants/, função pura calculateReadiness em src/lib/readiness.ts
- [ ] 07-02-PLAN.md — 5 schemas Zod (hab-venda, hab-repositorios, hab-responsaveis com matriz aninhada; hab-classificacao flat; nda com z.literal(true))

**Wave 2** *(paralelo — 3 planos de Sections, todos consomem schemas + InputField + readiness da Wave 1)*

- [ ] 07-03-PLAN.md — HabVendaSection (6 flat + 10 cenários × 5 colunas) + HabRepositoriosSection (CheckboxGroupField + 4 selects + 1 textarea + 14 domínios × 5 colunas)
- [ ] 07-04-PLAN.md — HabResponsaveisSection (CheckboxGroupField + 4 selects + textarea + 10 atividades × 5 colunas) + HabClassificacaoSection (4 selects + 5 textareas, classificacaoFinal hab-a..hab-e)
- [ ] 07-05-PLAN.md — NdaSection (texto scrollable + 4 InputFields + Controller boolean para aceitaTermos + textarea) + ReadinessClassification (useMemo + Badge G1-G5 + spans HAB-X + indicador NDA)

**Wave 3** *(wiring final + checkpoint humano — depende das 3 Sections da Wave 2)*

- [ ] 07-06-PLAN.md — Wiring FormLayout (6 imports + 5 cases novos no switch + ReadinessClassification entre h1 e renderSection) + checkpoint visual de 11 passos cobrindo as 5 abas novas, engine em tempo real, erro NDA, responsividade 768px

**Wave structure:**

- Wave 1: 07-01 (UI wrapper + constants + lib) + 07-02 (schemas Zod) — paralelos, sem overlap
- Wave 2: 07-03 (HabVenda + HabRepositorios) + 07-04 (HabResponsaveis + HabClassificacao) + 07-05 (Nda + ReadinessClassification) — paralelos, sem overlap entre Section files
- Wave 3: 07-06 (FormLayout wiring + checkpoint humano blocking)

**UAT:**

- [ ] Aba NDA: o checkbox "Li e aceito os termos" é obrigatório — não é possível submeter sem marcá-lo
- [ ] Classificação G1-G5 atualiza em tempo real conforme usuário muda seleções nas abas de classificação
- [ ] Badge de classificação gerencial exibe cor correta (ex: G1 = vermelho, G5 = verde)
- [ ] Todos os campos do documento HTML original estão presentes no formulário React (nenhuma seção omitida)
- [ ] Formulário é preenchível completamente em tablet de 768px sem overflow horizontal
- [ ] Submissão com campo obrigatório vazio exibe erro inline na aba correta (React Hook Form)

---

### Phase 8: Autosave, Submissão & Versionamento

**Goal:** Rascunhos são salvos automaticamente a cada 1.5s de inatividade, submissão cria versão imutável, histórico de versões é acessível e nova revisão pode ser iniciada.
**Requirements:** SAVE-01, SAVE-02, SAVE-03, SAVE-04, SAVE-05, SAVE-06, UX-04, UX-05
**Depends on:** Phase 7

**Plans:** 6/6 plans complete

Plans:

**Wave 1**
- [x] 08-00-PLAN.md — Infraestrutura Vitest (instalar + vitest.config.ts + stubs dos arquivos de teste)

**Wave 2** *(bloqueada pela Wave 1)*
- [x] 08-01-PLAN.md — Migration UNIQUE parcial `(org_id, status) WHERE status=draft` para upsert do autosave

**Wave 3** *(bloqueada pela Wave 2 — paralela)*
- [x] 08-02-PLAN.md — formStore.hydrateFromAssessment + hook useAutosave com debounce 1500ms
- [x] 08-03-PLAN.md — useSubmitAssessment (UPDATE draft→submitted) + useNewRevision (INSERT append-only)

**Wave 4** *(bloqueada pela Wave 3)*
- [x] 08-04-PLAN.md — FormLayout wiring (useQuery draft, skeleton, dialog submissão) + HistoryPage criada

**Wave 5** *(bloqueada pela Wave 4)*
- [x] 08-05-PLAN.md — Rota /form/:orgId/history + checkpoint visual do fluxo completo

**Cross-cutting constraints:**
- `onConflict: 'org_id,status'` em useAutosave deve corresponder exatamente ao índice criado em 08-01
- Todos os hooks usam `useToast()` wrapper — nunca importar `toast` do sonner diretamente
- TanStack Query v5: hidratação via `useEffect([draftQuery.data])`, não `onSuccess` (removido na v5)

**UAT:**

- [ ] Preencher campo e aguardar 1.5s — toast "Salvo automaticamente" aparece
- [ ] Fechar browser e reabrir `/form/:orgId` — rascunho está preservado com todos os campos
- [ ] Clicar "Enviar Avaliação" → confirmar no dialog → status muda para "enviado" e form fica read-only
- [ ] Após envio, iniciar nova revisão cria versão 2 com dados copiados da versão 1
- [ ] Histórico de versões lista ambas as versões com datas e níveis G1-G5 corretos
- [ ] Usuário sem internet vê toast de warning de falha no autosave (simular offline no DevTools)
- [ ] Skeleton aparece ao carregar formulário pela primeira vez (simular rede lenta)

---

## Milestone 3: Insights & Entrega

**Goal:** Dashboard de prontidão funcional para admin e construtoras, exportação PDF e Excel operacionais e com identidade visual correta, app polido, performático e deployado em produção.

---

### Phase 08.1: Fix SAVE-03 RLS — permitir draft→submitted (INSERTED)

**Goal:** Construtora (role company) consegue submeter avaliação (transição draft→submitted) sem erro RLS — bug crítico SAVE-03 corrigido via migration corretiva na policy `assessments_update_draft`, preservando o bloqueio de regressão submitted→draft.
**Requirements:** SAVE-03
**Depends on:** Phase 8
**Plans:** 1/1 plans complete

Plans:
- [x] 08.1-01-PLAN.md — Migration corretiva do WITH CHECK em assessments_update_draft (draft→submitted) + [BLOCKING] supabase db push + checkpoint de verificação end-to-end ✅ SAVE-03 desbloqueado

### Phase 9: Dashboard de Prontidão

**Goal:** Admin vê status de todas as empresas com filtros; construtora vê seu próprio painel de progresso e histórico.
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Depends on:** Phase 8

**Plans:** 4/4 plans complete

Plans:
**Wave 1** *(paralelo — lógica/contratos sem dependências)*

- [x] 09-01-PLAN.md — Lógica pura: computeTabStatus (src/lib/sectionStatus.ts) + hook useOrgsWithReadiness (JOIN orgs+assessments, filtro submitted no cliente)

**Wave 2** *(paralelo — dependem de 09-01; sem overlap de arquivos)*

- [x] 09-02-PLAN.md — Componentes admin: CompanyCard (Badge G1-G5 / "Sem avaliação") + AssessmentSection (histórico de versões para OrgDetail)
- [x] 09-03-PLAN.md — Painel construtora: SectionProgress (10 cards de progresso) + CompanyDashboard (/form/:orgId/dashboard com cross-tenant guard)

**Wave 3** *(wiring final + checkpoint humano — depende de 09-02 e 09-03)*

- [x] 09-04-PLAN.md — Wiring: AdminDashboard grid+filtros (substitui OrgTable) + AssessmentSection no OrgDetail + rota /form/:orgId/dashboard + checkpoint visual

**Wave structure:**

- Wave 1: 09-01 (sectionStatus + useOrgsWithReadiness — contratos consumidos pelas Waves 2-3)
- Wave 2: 09-02 (componentes admin) + 09-03 (componentes construtora) — paralelos, sem overlap de arquivos
- Wave 3: 09-04 (composição em AdminDashboard/OrgDetail/router + checkpoint humano blocking)

**UAT:**

- [ ] Admin acessa `/admin/dashboard` e vê cards de todas as orgs com G1-G5
- [ ] Filtrar por "G2" mostra apenas empresas com classificação G2
- [ ] Buscar "Construtora XYZ" filtra e exibe o card correto
- [ ] Construtora logada acessa `/form/:orgId/dashboard` e vê sua classificação e progresso
- [ ] `SectionProgress` mostra Torre Decisão como "Completo" após preencher todos os campos daquela aba
- [ ] Admin clica em empresa no dashboard → abre detalhe com histórico de versões da empresa

---

### Phase 10: Exportação PDF

**Goal:** Botão "Exportar PDF" gera relatório com identidade visual azul/laranja para qualquer versão do histórico, sem impacto no First Load do app.
**Requirements:** EXPORT-01, EXPORT-02, EXPORT-04, EXPORT-05
**Depends on:** Phase 9 _(pode ser executada em paralelo com Phase 11)_

#### Plans

1. **Configurar lazy-loading do chunk PDF** — criar `src/lib/pdf/index.ts` como dynamic import; `React.lazy(() => import('./PDFGenerator'))`; `@react-pdf/renderer` nunca incluído no bundle principal; Suspense wrapper com fallback spinner
2. **Criar template PDF — cover e header** — componente `PDFDocument` com `@react-pdf/renderer`; capa com logo SuaEquipe.IA, nome da empresa, data de geração, versão da avaliação; paleta azul `#123B66` + laranja `#F28C28`; tipografia consistente
3. **Criar seções do PDF — Torre 360** — seções para cada aba: Identificação, Torre Decisão, Sienge, Acesso, Classificação; campos exibidos como pares "Label: Valor"; campos não preenchidos exibem "—"
4. **Criar seções do PDF — Habilitações, NDA e Classificação Final** — seções Hab Venda, Repositórios, Responsáveis, Classificação, NDA; página final com tabela de classificação G1-G5 por dimensão e classificação gerencial destacada (EXPORT-02)
5. **Implementar botão "Exportar PDF" no histórico** — botão disponível em cada versão da lista de histórico; ao clicar: lazy-load do chunk + fetch dos dados da versão selecionada + trigger de download `assessment_v{N}_{empresa}_{data}.pdf` (EXPORT-04)
6. **Testar e ajustar layout PDF** — gerar PDF com dados de seed completos; verificar paginação (sem conteúdo cortado), fontes embutidas, cores corretas; ajustar margens e quebras de página

**UAT:**

- [ ] First Load do app não inclui `@react-pdf/renderer` no bundle inicial (verificar no Network tab)
- [ ] Ao clicar "Exportar PDF", spinner aparece durante geração e PDF faz download
- [ ] PDF gerado exibe capa com nome da empresa, data e versão
- [ ] Todos os campos preenchidos aparecem no PDF; campos vazios exibem "—"
- [ ] Tabela de classificação G1-G5 está presente na última página
- [ ] PDF exportado de versão 1 (histórico) mostra dados da versão 1, não da mais recente

---

### Phase 11: Exportação Excel

**Goal:** Botão "Exportar Excel" gera planilha `.xlsx` com todos os campos e respostas, disponível para qualquer versão, lazy-loaded.
**Requirements:** EXPORT-03, EXPORT-05
**Depends on:** Phase 9 _(pode ser executada em paralelo com Phase 10)_

#### Plans

1. **Configurar lazy-loading do chunk Excel** — dynamic import de `xlsx` (SheetJS); nunca no bundle principal; Suspense wrapper compartilhado com o de PDF ou independente
2. **Implementar serialização flat dos dados do formulário** — função `flattenFormData(formData): Row[]` que converte JSONB aninhado em array de `{ secao, campo, pergunta, resposta }` — uma linha por campo
3. **Criar workbook multi-sheet** — planilha por seção do formulário (10 sheets: Identificação, Torre Decisão, etc.); sheet extra "Resumo" com metadados (empresa, CNPJ, versão, data, G1-G5 final); headers com estilo (negrito, cor azul)
4. **Implementar botão "Exportar Excel" no histórico** — botão na lista de versões; fetch dos dados da versão + geração via SheetJS + download `assessment_v{N}_{empresa}_{data}.xlsx`; disponível para qualquer versão do histórico (EXPORT-04)
5. **Testar exportação com dados completos** — gerar Excel com seed de dados preenchidos; verificar: colunas alinhadas, acentos corretos (UTF-8), classificação G1-G5 no sheet Resumo, sem colunas truncadas

**UAT:**

- [ ] `xlsx` não está no bundle principal (verificar Network tab — carrega apenas ao clicar "Exportar Excel")
- [ ] Excel baixado abre sem erros no LibreOffice Calc e Microsoft Excel
- [ ] Sheet "Resumo" contém empresa, data, versão e classificação G1-G5
- [ ] Sheet "Torre Decisão" contém todos os campos daquela aba com respostas
- [ ] Acentuação brasileira está correta em todas as células (sem caracteres estranhos)
- [ ] Excel exportado de versão histórica contém dados daquela versão específica

---

### Phase 12: Polimento UX, Performance & Deploy

**Goal:** App auditado visualmente, bundle otimizado, variáveis de ambiente de produção configuradas, deploy realizado e smoke tests passando em produção.
**Requirements:** _(UX transversal — verificação final de UX-01 a UX-06 como sistema completo)_
**Depends on:** Phases 10 + 11

#### Plans

1. **Auditoria de responsividade completa** — percorrer todos os fluxos (login, formulário, dashboard, histórico, exportação) em 1280px, 1024px e 768px; corrigir overflow, elementos sobrepostos, texto ilegível em cada breakpoint
2. **Auditoria de acessibilidade básica** — `aria-label` em botões icônicos, foco visível em todos os campos interativos, contraste de cor ≥ 4.5:1 (WCAG AA) para texto sobre fundos azul/laranja; verificar com DevTools Accessibility panel
3. **Otimização de bundle e performance** — configurar `rollupOptions.output.manualChunks` no `vite.config.ts` para separar vendor, supabase e react-router; medir FCP/LCP com Lighthouse; target: FCP < 1.5s, Lighthouse Performance ≥ 85
4. **Configurar variáveis de ambiente de produção** — criar `.env.production` com `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` de produção; garantir que credenciais de dev não vazam no build de produção
5. **Deploy para Vercel** — conectar repositório; configurar environment variables no painel Vercel; configurar `vercel.json` com rewrites para SPA (`"rewrites": [{"source": "/(.*)", "destination": "/index.html"}]`); primeiro deploy
6. **Smoke tests pós-deploy** — testar em produção: login admin → criar org → login construtora → preencher formulário → autosave → submeter → ver histórico → exportar PDF → exportar Excel; registrar resultado de cada passo

**UAT:**

- [ ] Em produção (`https://[app].vercel.app`): login funciona para admin e construtora
- [ ] Formulário completo pode ser preenchido e submetido em produção
- [ ] PDF e Excel gerados em produção são idênticos ao comportamento em desenvolvimento
- [ ] Lighthouse Performance ≥ 85 na página de login e no dashboard
- [ ] Nenhuma credencial de Supabase dev aparece no código-fonte do build de produção
- [ ] App funciona em Safari (macOS e iOS) — sem regressões de CSS ou fetch

---

## Resumo de Cobertura

| Requisito                                   | Fase                                  |
| ------------------------------------------- | ------------------------------------- |
| UX-01, UX-06                                | Phase 1 — Scaffolding & Design System |
| ORG-01, ORG-02, ORG-04                      | Phase 2 — Database Schema & RLS       |
| AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05 | Phase 3 — Authentication & Roteamento |
| ORG-03                                      | Phase 4 — Gestão de Organizações      |
| FORM-01, FORM-04, UX-03                     | Phase 5 — Shell do Formulário         |
| FORM-05, FORM-06                            | Phase 6 — Campos Torre 360            |
| FORM-02, FORM-03, FORM-07, UX-02            | Phase 7 — Habilitações, NDA & G1-G5   |
| SAVE-01–SAVE-06, UX-04, UX-05               | Phase 8 — Autosave & Versionamento    |
| DASH-01–DASH-05                             | Phase 9 — Dashboard de Prontidão      |
| EXPORT-01, EXPORT-02, EXPORT-04, EXPORT-05  | Phase 10 — Exportação PDF             |
| EXPORT-03, EXPORT-04\*                      | Phase 11 — Exportação Excel           |

> \*EXPORT-04 (exportação de versão histórica) é implementado em ambas as fases de exportação (PDF e Excel); mapeado formalmente em Phase 10.

**Total v1:** 38 requisitos mapeados ✓ — 0 órfãos

---

## Grafo de Dependências

```
Phase 1 (Scaffolding)
├── Phase 2 (DB Schema)        ─── paralelo com Phase 3
├── Phase 3 (Auth)             ─── paralelo com Phase 2
│   └── Phase 4 (Org Mgmt)    ─── paralelo com Phase 5
│   └── Phase 5 (Form Shell)  ─── paralelo com Phase 4
│       └── Phase 6 (Torre 360)
│           └── Phase 7 (Hab + NDA + G1-G5)
│               └── Phase 8 (Autosave + Versioning)
│                   └── Phase 9 (Dashboard)
│                       ├── Phase 10 (PDF Export)   ─── paralelo com Phase 11
│                       └── Phase 11 (Excel Export) ─── paralelo com Phase 10
│                           └── Phase 12 (Polish + Deploy)
```

---

_Roadmap criado: 2026-05-22_
_38 requisitos v1 | 12 fases | 3 milestones_
