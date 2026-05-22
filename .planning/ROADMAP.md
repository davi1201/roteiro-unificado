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

**Plans:** 1/6 plans executed

Plans:
- [x] 03-01-PLAN.md — Instalar dependências (react-router-dom, RHF, Zod) + AuthProvider + useAuth()
- [ ] 03-02-PLAN.md — Hook useUser() + atualizar formStore com persist key namespaceada por tenantId
- [ ] 03-03-PLAN.md — Página de Login com layout UI-SPEC, validação Zod/RHF, auth flicker
- [ ] 03-04-PLAN.md — Páginas ForgotPassword e ResetPassword (fluxo de recuperação de senha)
- [ ] 03-05-PLAN.md — ProtectedRoute, AdminRoute e configuração do React Router v6
- [ ] 03-06-PLAN.md — Wiring final: App.tsx + main.tsx + roteamento pós-login por role

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

#### Plans

1. **Criar layout do painel admin** — sidebar com navegação (Organizações, Dashboard, Exportações); header com nome do usuário admin e botão de logout; área de conteúdo responsiva
2. **Criar página de listagem de organizações** — tabela com colunas: nome, CNPJ, nº de membros, data de criação, status; paginação simples; botão "Nova Organização"
3. **Criar modal/página de criação de organização** — formulário com React Hook Form + Zod: `nome`, `cnpj`; validação de CNPJ (formato); INSERT em `orgs`; feedback de sucesso com toast
4. **Criar página de detalhe da organização** — lista de membros (`org_members`) com role; botão "Convidar Usuário"; formulário de adição manual: email + criação via `supabase.auth.admin.createUser()` + INSERT em `org_members`
5. **Implementar desativação de organização** — campo `active` em `orgs`; botão "Arquivar" com dialog de confirmação; org arquivada some da listagem principal mas mantém dados

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

#### Plans

1. **Criar Zustand store do formulário** — `useFormStore` com estado tipado para todas as 10 seções; actions `updateSection(tab, data)`, `setActiveTab(tab)`, `resetForm()`; persistência no `sessionStorage` para sobreviver a refreshes acidentais
2. **Criar componente `FormLayout`** — layout de duas colunas: sidebar de abas (esquerda) + área de conteúdo (direita); responsivo — sidebar vira tabs horizontais em mobile/tablet
3. **Criar componente `TabNavigation`** — lista das 10 abas: Identificação, Torre Decisão, Torre Sienge, Torre Acesso, Torre Classificação, Hab Venda, Hab Repositórios, Hab Responsáveis, Hab Classificação, NDA; cada tab com ícone, label e indicador de status (não iniciado / em progresso / completo)
4. **Implementar indicador de progresso por aba** — `ProgressBadge` por tab exibindo `%` de campos preenchidos da seção; barra de progresso geral no topo somando todas as seções (UX-03)
5. **Criar hook `useFormSection(tabName)`** — abstração que retorna `{ data, updateField, errors, completeness }` para a aba solicitada; valida completude baseado em campos obrigatórios da seção
6. **Criar rotas do formulário** — `/form/:orgId` renderiza `FormLayout`; navegação entre abas atualiza URL hash (`#identificacao`, `#torre-decisao`, etc.) para deep-link e browser back button funcionar

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

#### Plans

1. **Criar biblioteca de componentes de campo** — `RadioGroupField`, `CheckboxGroupField`, `SelectField`, `TextareaField`, `ConditionalField` (wrapper que exibe/oculta filhos baseado em condição); todos integrados com React Hook Form via `Controller` e estilizados com Tailwind v4
2. **Implementar aba Identificação** — campos: Razão Social, CNPJ, cidade/estado, nome do responsável, cargo, email, telefone, número de obras ativas, faturamento estimado; todos com validação Zod
3. **Implementar aba Torre Decisão** — campos fiéis ao HTML: nível de maturidade em decisão baseada em dados, uso de BI, qual BI (condicional: mostra campo "qual?" se resposta for "sim"), frequência de reuniões operacionais, envolvimento do diretor; RadioGroups e Selects
4. **Implementar aba Torre Sienge** — campos: módulos Sienge contratados (CheckboxGroup multi-seleção), módulos ativos em uso, nível de uso por módulo (RadioGroup), integração com outros sistemas (condicional: mostra campo "quais?" se "sim")
5. **Implementar aba Torre Acesso** — campos: quantidade de usuários cadastrados vs. ativos, perfis de usuário configurados, treinamentos realizados, barreiras de adoção (CheckboxGroup), responsável pelo Sienge
6. **Implementar aba Torre Classificação** — campos: auto-avaliação das torres (dropdowns G1–G5 por dimensão); resumo visual das seleções acima; campos de observação livres por dimensão
7. **Conectar Zod schemas a React Hook Form por aba** — schemas Zod exportados de `src/schemas/`; `useForm<FormData>` com `zodResolver`; erros inline exibidos abaixo de cada campo

**UAT:**

- [ ] Aba Torre Decisão: ao selecionar "Sim, utiliza BI" o campo "Qual BI?" aparece; ao selecionar "Não" o campo desaparece
- [ ] Aba Torre Sienge: checkboxes de módulos Sienge permitem multi-seleção; "selecionar todos" funciona
- [ ] Campos obrigatórios exibem mensagem de erro ao tentar avançar sem preencher
- [ ] Todos os campos do HTML de referência existem nas abas correspondentes (verificar manualmente contra `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html`)
- [ ] Campos RadioGroup mostram seleção visual clara (cor primary ao selecionar)
- [ ] Layout de campo é responsivo em 768px (tablet)

---

### Phase 7: Campos — Habilitações, NDA & Classificação G1-G5

**Goal:** As 5 abas de Habilitações e NDA implementadas com todos os campos, validação Zod completa e engine de classificação automática G1-G5 gerencial + níveis técnicos.
**Requirements:** FORM-02, FORM-03, FORM-07, UX-02
**Depends on:** Phase 6

#### Plans

1. **Implementar abas Hab. Venda e Hab. Repositórios** — campos fiéis ao HTML: processos de venda cadastrados no Sienge, uso de CRM, documentação de repositórios técnicos, status de aprovações e licenças; RadioGroups, Selects, campos condicionais
2. **Implementar abas Hab. Responsáveis e Hab. Classificação** — campos: responsáveis técnicos mapeados, formação, certificações; auto-avaliação de habilitações por dimensão (dropdowns G1–G5); campo de observação livre
3. **Implementar aba NDA** — campos: nome do representante legal, CPF, cargo, declaração de aceite (checkbox obrigatório), data de aceite (auto-preenchida com data atual), campo de observações adicionais
4. **Implementar engine de classificação G1-G5** — função pura `calculateReadiness(formData): ReadinessResult` em `src/lib/readiness.ts`; lógica de scoring por dimensão Torre + Habilitações + NDA; output: `{ gerencial: 'G1'|'G2'|...|'G5', tecnico: string, operacional: string }`; cálculo reativo via `useMemo` no store
5. **Criar componente `ReadinessClassification`** — exibe resultado G1-G5 com descrição textual, badge colorido e breakdown por dimensão; renderizado na última aba e como preview flutuante
6. **Verificar cobertura total de campos do HTML de referência** — percorrer `roteiro_unificado_completo_torre360_habilitacoes_nda_piloto_sinduscon_v2.html` campo a campo; confirmar 100% de prontidão (FORM-02); ajustar campos faltantes
7. **Auditoria de responsividade** — testar formulário completo em 1280px (desktop), 1024px, 768px (tablet); corrigir quebras de layout; garantir que em tablet o formulário é totalmente operacional (UX-02)

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

#### Plans

1. **Implementar autosave com debounce** — hook `useAutosave()` que observa mudanças no Zustand store; `debounce(1500ms)` antes de disparar `upsert` no Supabase (`assessments` com `status = 'draft'`); estratégia de upsert: INSERT if not exists, UPDATE if exists com mesmo `org_id + status = 'draft'`
2. **Implementar toast de confirmação de autosave** — ao salvar com sucesso: toast discreto "Salvo automaticamente" com timestamp; ao falhar (offline/erro): toast de warning "Falha ao salvar — tentando novamente"
3. **Implementar submissão formal** — botão "Enviar Avaliação" na última aba; dialog de confirmação; ao confirmar: UPDATE `status = 'submitted'`, `submitted_at = now()`, `version = version + 1`; registro se torna read-only no frontend
4. **Implementar append-only versioning** — ao submeter: a row atual é marcada como `submitted`; próxima revisão cria novo registro com `version + 1` copiando `form_data` da versão mais recente; nunca sobrescrever registros `submitted`; RLS policy bloqueia UPDATE em registros submitted para role `company`
5. **Criar UI de histórico de versões** — página `/form/:orgId/history`; lista de avaliações com: versão, data de envio, nível G1-G5 da época, status; botão "Ver detalhes" abre o form em modo read-only; botão "Iniciar nova revisão" disponível na versão mais recente
6. **Implementar skeleton loading** — estados de loading com `Skeleton` nos cards do formulário, histórico e dashboard enquanto TanStack Query busca dados; sem flash de conteúdo vazio (UX-05)

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

### Phase 9: Dashboard de Prontidão

**Goal:** Admin vê status de todas as empresas com filtros; construtora vê seu próprio painel de progresso e histórico.
**Requirements:** DASH-01, DASH-02, DASH-03, DASH-04, DASH-05
**Depends on:** Phase 8

#### Plans

1. **Criar página admin dashboard** — `/admin/dashboard`; query TanStack Query buscando todas as orgs com sua última avaliação (JOIN `orgs` + `assessments`); grid de cards de empresas
2. **Criar `CompanyCard`** — card exibindo: nome da empresa, CNPJ (truncado), badge G1-G5 com cor semântica, data da última avaliação, nível técnico (string), link "Ver detalhes"; skeleton enquanto carrega (DASH-02)
3. **Implementar filtros no painel admin** — input de busca por nome/CNPJ (client-side filter); select de filtro por nível de prontidão (G1–G5 + "Todos"); botão "Limpar filtros"; contagem de resultados exibidos (DASH-05)
4. **Criar dashboard da construtora** — `/form/:orgId/dashboard`; exibe: classificação atual G1-G5, última atualização, barra de progresso total, breakdown de progresso por seção (% de campos preenchidos por aba); botão "Continuar avaliação" → `/form/:orgId`; link para histórico de versões (DASH-03, DASH-04)
5. **Criar componente `SectionProgress`** — grid de cards por aba do formulário (10 abas); cada card: nome da aba, ícone, `%` de completude, badge de status (Não iniciado / Em progresso / Completo)
6. **Implementar view de detalhe de empresa (admin)** — `/admin/orgs/:orgId`; combina dashboard da empresa + histórico de versões + link de exportação; admin pode ver tudo que a empresa vê

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
