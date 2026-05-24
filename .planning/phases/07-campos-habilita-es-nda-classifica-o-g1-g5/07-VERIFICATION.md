---
phase: 07-campos-habilita-es-nda-classifica-o-g1-g5
verified: 2026-05-24T00:00:00Z
status: human_needed
score: 13/13
overrides_applied: 0
human_verification:
  - test: "Checkbox aceitaTermos produz erro visível ao tentar submeter sem marcar"
    expected: "Mensagem 'Você deve aceitar os termos do NDA para continuar' aparece inline abaixo do checkbox quando o formulário é submetido sem marcar aceitaTermos"
    why_human: "Validação RHF mode:onBlur só dispara em blur; comportamento de submit (ou trigger de validação) deve ser conferido no browser — não é verificável via grep"
  - test: "Badge G1-G5 atualiza em tempo real ao mudar 'Nível gerencial' na Torre Decisão"
    expected: "Ao selecionar G3 no select, o badge G3 aparece imediatamente no ReadinessClassification sem reload"
    why_human: "Comportamento reativo do useMemo sobre sectionData do Zustand só é confirmável rodando o app"
  - test: "Formulário operável em 768px sem overflow horizontal nas 5 abas novas (UX-02)"
    expected: "Grid das matrizes colapsa para 1 coluna, sidebar vira pills horizontais, badge bar quebra com flex-wrap; sem scroll horizontal"
    why_human: "Layout responsivo requer inspeção visual em DevTools — Tailwind classes grid-cols-1 md:grid-cols-2 estão presentes mas comportamento real depende de viewport"
  - test: "NDA — campo dataAceite está disabled e preenchido com data atual no formato DD/MM/AAAA"
    expected: "Campo 'Data de aceite' exibe a data do dia atual em formato pt-BR e não aceita edição"
    why_human: "Valor de new Date().toLocaleDateString('pt-BR') no defaultValues deve ser conferido no browser"
  - test: "Persistência cross-tab: valores preservados ao navegar entre abas"
    expected: "Preencher 'Principal forma de venda' em Hab. Venda, navegar para outra aba e voltar preserva a seleção"
    why_human: "Comportamento do Zustand sessionStorage namespaced por tenantId precisa de execução real"
---

# Fase 7: Campos — Habilitações, NDA & Classificação G1-G5 — Relatório de Verificação

**Meta da Fase:** As 5 abas restantes (Hab. Venda, Hab. Repositórios, Hab. Responsáveis, Hab. Classificação e NDA) implementadas com todos os campos do HTML de referência, validação Zod (incluindo aceite obrigatório do NDA via `z.literal(true)`) e engine pura `calculateReadiness` que exibe badge G1-G5 + HAB-A..E + indicador NDA aceito em tempo real.
**Verificado:** 2026-05-24
**Status:** human_needed
**Re-verificação:** Não — verificação inicial

## Resultado Geral

**Score: 13/13 verdades verificadas.** Todos os artefatos existem, são substantivos e estão corretamente conectados. Pendência: 5 itens de verificação humana (comportamento em runtime, responsividade visual, validação de submit) que não podem ser confirmados via análise estática de código.

---

## Verdades Observáveis

| # | Verdade | Status | Evidência |
|---|---------|--------|-----------|
| 1 | InputField exportado de `@/components/ui` e usa Controller + Input | VERIFICADO | `input-field.tsx` linha 1: importa Controller+FieldValues; exportado em `index.ts` linha 31 |
| 2 | NDA_TEXT é readonly string[] com >= 10 cláusulas extraídas do HTML | VERIFICADO | `grep -c "Cláusula"` retorna 12 em `nda-text.ts`; `export const NDA_TEXT` presente |
| 3 | calculateReadiness é função pura que mapeia slugs g1..g5 → G1..G5 e hab-a..hab-e → HAB-A..HAB-E, retorna null para campos não preenchidos | VERIFICADO | `readiness.ts`: gerencialMap (g1-g5), habMap (hab-a..hab-e), retorno `?? null`, sem imports React |
| 4 | 5 schemas Zod criados — 4 com REQUIRED_COUNT=0, NDA com REQUIRED_COUNT=1 | VERIFICADO | Todos os 5 arquivos existem; constantes `HAB_*_REQUIRED_COUNT = 0` e `NDA_REQUIRED_COUNT = 1` confirmadas |
| 5 | ndaSchema usa `z.literal(true, { message: '...' })` como único campo obrigatório (Zod v4 API) | VERIFICADO | `nda.ts` linha 37-39: `z.literal(true, { message: 'Você deve aceitar os termos do NDA para continuar' })` — API Zod v4 correta (Zod ^4.4.3) |
| 6 | hab-classificacao.ts: classificacaoFinal usa enum lowercase hab-a..hab-e compatível com habMap do calculateReadiness | VERIFICADO | `hab-classificacao.ts` linha 18: `z.enum(['hab-a', 'hab-b', 'hab-c', 'hab-d', 'hab-e'])` — bate exatamente com habMap de readiness.ts |
| 7 | HabVendaSection: 6 campos flat + matriz 10 cenários × 5 colunas com subscription anti-loop | VERIFICADO | principalFormaVenda, quemPedeDocumentos, prazoTipico, perdeuOportunidade, principaisExigencias, ondeCostumaTravar encontrados; HAB_SCENARIOS.map (10 slugs); `subscription.unsubscribe()` presente |
| 8 | HabRepositoriosSection: CheckboxGroupField (12 opções) + 4 selects + 14 domínios com repositorioPrincipal como SelectField (enum, não string) | VERIFICADO | CheckboxGroupField importado e usado; HAB_DOCUMENT_DOMAINS (14 slugs); `repositorioPrincipal` como SelectField com 5 options enum |
| 9 | HabResponsaveisSection: CheckboxGroupField (12 dificuldades) + 4 selects + 10 atividades × 5 colunas | VERIFICADO | dificuldadesRecorrentes CheckboxGroupField, existeChecklist/existeRenovacao/existeValidacao/tempoMedioKit SelectField; HAB_RESPONSIBILITIES.map (10 slugs) |
| 10 | HabClassificacaoSection: 4 selects (incluindo classificacaoFinal com options hab-a..hab-e) + 5 textareas | VERIFICADO | classificacaoFinalOptions com value 'hab-a' presente; 5 TextareaField (fase1, fase2, riscosPrincipais, evidenciasEssenciais, observacoesFinais) |
| 11 | NdaSection: texto NDA_TEXT em div scrollable + Controller direto para aceitaTermos (boolean, não CheckboxGroupField) + campo dataAceite disabled | VERIFICADO | `NDA_TEXT.map` presente; `max-h-[400px] overflow-y-auto` confirmado; Controller inline com `type="checkbox"`; `disabled` na linha 85; `CheckboxGroupField` ausente (grep retorna 0) |
| 12 | ReadinessClassification: useMemo sobre store.sectionData, exibe Badge G1-G5 + spans HAB-X coloridos + indicador NDA aceito + empty state | VERIFICADO | `useMemo(() => calculateReadiness(store.sectionData), [store.sectionData])`; `Badge` + habConfig com 5 chaves HAB-A..HAB-E; `NDA aceito` span; empty state "Preencha as abas de classificação..." |
| 13 | FormLayout: 6 imports novos + 5 cases no switch (Hab. Venda/Repos/Respons/Class/NDA) + ReadinessClassification entre h1 e renderSection | VERIFICADO | Todas as 6 linhas de import confirmadas; 5 cases no switch (linhas 53-62); `<ReadinessClassification tenantId={tenantId} />` na linha 188, entre h1 (187) e renderSection (197) |

**Score: 13/13 verdades verificadas**

---

## Artefatos Requeridos

| Artefato | Esperado | Status | Detalhes |
|----------|----------|--------|---------|
| `src/components/ui/input-field.tsx` | Wrapper RHF para input simples | VERIFICADO | Exporta `InputField<T extends FieldValues>` com Controller + label + error inline |
| `src/components/ui/index.ts` | Barrel export incluindo InputField | VERIFICADO | Linha 31: `export { InputField } from './input-field'` |
| `src/constants/nda-text.ts` | NDA_TEXT com >= 10 cláusulas | VERIFICADO | 12 entradas (cabeçalho + 11 cláusulas); strings puras sem HTML |
| `src/lib/readiness.ts` | Engine pura calculateReadiness + ReadinessResult | VERIFICADO | Função pura, importa TabKey, exporta interface + função |
| `src/schemas/hab-venda.ts` | Schema + HAB_SCENARIOS (10) + REQUIRED_COUNT=0 | VERIFICADO | 10 slugs, `as const`, REQUIRED_COUNT=0 |
| `src/schemas/hab-repositorios.ts` | Schema + HAB_DOCUMENT_DOMAINS (14) + REQUIRED_COUNT=0 | VERIFICADO | 14 slugs, `as const`, REQUIRED_COUNT=0 |
| `src/schemas/hab-responsaveis.ts` | Schema + HAB_RESPONSIBILITIES (10) + REQUIRED_COUNT=0 | VERIFICADO | 10 slugs, `as const`, REQUIRED_COUNT=0 |
| `src/schemas/hab-classificacao.ts` | classificacaoFinal enum hab-a..hab-e + REQUIRED_COUNT=0 | VERIFICADO | enum lowercase confirmado, REQUIRED_COUNT=0 |
| `src/schemas/nda.ts` | z.literal(true) obrigatório + NDA_REQUIRED_COUNT=1 | VERIFICADO | z.literal(true, { message: '...' }) Zod v4 API correta |
| `src/features/form/sections/HabVendaSection.tsx` | 6 campos flat + 10 cenários | VERIFICADO | Substantivo, conectado, padrão anti-loop |
| `src/features/form/sections/HabRepositoriosSection.tsx` | CheckboxGroup + 14 domínios | VERIFICADO | Substantivo, conectado, InputField para responsavelInterno |
| `src/features/form/sections/HabResponsaveisSection.tsx` | CheckboxGroup + 10 atividades | VERIFICADO | Substantivo, conectado, padrão anti-loop |
| `src/features/form/sections/HabClassificacaoSection.tsx` | 4 selects + 5 textareas | VERIFICADO | max-w-2xl, slugs hab-a..hab-e nos options |
| `src/features/form/sections/NdaSection.tsx` | Texto scrollable + checkbox Controller | VERIFICADO | max-h-[400px], CheckboxGroupField ausente (correto) |
| `src/features/form/ReadinessClassification.tsx` | useMemo + Badge + habConfig | VERIFICADO | Todos os 5 HAB badges, empty state, NDA aceito |
| `src/features/form/FormLayout.tsx` | Switch 10 abas + ReadinessClassification | VERIFICADO | Placeholder "Esta seção" removido, default defensivo "Aba desconhecida." |

---

## Verificação de Links-Chave (Wiring)

| De | Para | Via | Status | Detalhes |
|----|------|-----|--------|---------|
| `readiness.ts` | `@/stores/formStore` (TabKey) | import | VERIFICADO | Linha 1: `import { TabKey } from '@/stores/formStore'` |
| `input-field.tsx` | `./input` (Input component) | import | VERIFICADO | Linha 2: `import { Input } from './input'` |
| `HabVendaSection` | `@/schemas/hab-venda` (schema + HAB_SCENARIOS) | import | VERIFICADO | Importa habVendaSchema, HabVendaData, HabScenarioSlug, HAB_SCENARIOS |
| `HabRepositoriosSection` | `@/schemas/hab-repositorios` | import | VERIFICADO | Importa habRepositoriosSchema, HAB_DOCUMENT_DOMAINS |
| `hab-classificacao.ts` (slugs) | `readiness.ts` (habMap) | compatibilidade de slug | VERIFICADO | hab-a..hab-e usados em ambos os arquivos identicamente |
| `nda.ts` (aceitaTermos) | `calculateReadiness` | aceitaTermos field name | VERIFICADO | readiness.ts linha 63: `nda['aceitaTermos'] === true` |
| `NdaSection` | `@/constants/nda-text` (NDA_TEXT) | import + NDA_TEXT.map | VERIFICADO | `NDA_TEXT.map((paragraph, i) => ...)` linha 46 |
| `ReadinessClassification` | `@/lib/readiness` (calculateReadiness) | useMemo | VERIFICADO | `useMemo(() => calculateReadiness(store.sectionData), [store.sectionData])` |
| `FormLayout.tsx` → 5 Section components | renderSection switch | switch case | VERIFICADO | 5 cases explícitos linhas 53-62; sem placeholder "Esta seção ainda não possui campos" |
| `FormLayout.tsx` → ReadinessClassification | JSX entre h1 e renderSection | JSX render | VERIFICADO | Linha 188, exatamente entre h1 (187) e renderSection (197) |

---

## Rastreamento de Fluxo de Dados (Nível 4)

| Artefato | Variável de Dados | Fonte | Produz Dados Reais | Status |
|----------|------------------|-------|--------------------|--------|
| `ReadinessClassification` | `result` (ReadinessResult) | `store.sectionData` via `calculateReadiness` | Sim — lê sectionData do Zustand preenchido pelas Sections via watch() | FLOWING |
| `HabVendaSection` | `sectionData[TabKey.HabVenda]` | useForm defaultValues + watch() subscription → store.updateSection | Sim — RHF watch atualiza Zustand em cada mudança de campo | FLOWING |
| `HabClassificacaoSection.classificacaoFinal` | `result.habilitacoes` em ReadinessClassification | HabClassificacaoSection → store.updateSection → calculateReadiness.habMap | Sim — pipeline completo verificado | FLOWING |

---

## Verificação de Cobertura de Requisitos

| Requisito | Planos | Descrição | Status | Evidência |
|-----------|--------|-----------|--------|-----------|
| FORM-02 | 07-02, 07-03, 07-04, 07-05, 07-06 | Todos os campos do HTML atual preservados na versão React | VERIFICADO | 5 Section components com todos os campos das abas Habilitações e NDA; arrays de slugs com 10/14/10 entradas; checkpoint visual confirmou cobertura de campos |
| FORM-03 | 07-02, 07-05, 07-06 | Validação de campos obrigatórios via Zod + React Hook Form | VERIFICADO — parcialmente humano | `z.literal(true)` em ndaSchema com mensagem de erro configurada; zodResolver em todas as Sections; exibição do erro requer verificação humana em runtime |
| FORM-07 | 07-01, 07-05, 07-06 | Classificação G1-G5 / HAB-X calculada automaticamente | VERIFICADO | `calculateReadiness` função pura mapeando slugs; ReadinessClassification com useMemo sobre sectionData; Badge G1-G5 e habConfig HAB-A..HAB-E presentes; behavior em tempo real requer verificação humana |
| UX-02 | 07-03, 07-04, 07-06 | Layout responsivo — funciona em desktop e tablet 768px | VERIFICADO estático — humano para visual | Classes `grid-cols-1 md:grid-cols-2` em HabVendaSection, HabRepositoriosSection, HabResponsaveisSection; `flex-wrap` em ReadinessClassification; verificação visual em 768px requer runtime |

---

## Verificações Comportamentais (Spot-Checks)

Step 7b: TypeScript `npx tsc --noEmit` em `roteiro-unificado/` — resultado parcial.

| Comportamento | Comando | Resultado | Status |
|--------------|---------|-----------|--------|
| Compilação TypeScript sem erros nos arquivos da Fase 7 | `npx tsc --noEmit` | 3 erros em `HistoryPage.tsx` e `useSubmitAssessment.test.ts` — ambos arquivos da Fase 8 (criados em 23-mai, não da Fase 7) | PASS (erros pré-existentes de Fase 8, fora do escopo) |
| InputField exportado de barrel | `grep -c "export { InputField }" src/components/ui/index.ts` | 1 | PASS |
| NDA_TEXT com >= 10 cláusulas | `grep -c "Cláusula" src/constants/nda-text.ts` | 12 | PASS |
| calculateReadiness exportada | `grep -c "export function calculateReadiness" src/lib/readiness.ts` | 1 | PASS |
| FormLayout sem placeholder "Esta seção" | `grep -c "Esta seção ainda não possui campos" FormLayout.tsx` | 0 | PASS |

---

## Anti-padrões Encontrados

| Arquivo | Linha | Padrão | Severidade | Impacto |
|---------|-------|--------|------------|---------|
| — | — | Nenhum TBD/FIXME/XXX encontrado nos arquivos da Fase 7 | — | — |

Notas sobre warnings do scanner de anti-padrões:
- Ocorrências de `placeholder` em `input-field.tsx`, `HabRepositoriosSection.tsx`, `NdaSection.tsx` são **props de placeholder HTML** (`<input placeholder="...">`) — não são stubs de implementação.
- Ocorrências de `optional` em schemas são `z.string().optional()` Zod legítimos.
- Nenhum `return null`, `return {}` ou `return []` encontrado em código de produção da Fase 7.

---

## Verificação Humana Requerida

Os checks automatizados passaram em 13/13 verdades. Os itens abaixo exigem execução do app no browser:

### 1. Validação NDA — erro inline do checkbox aceitaTermos

**Teste:** Rodar `npm run dev` em `roteiro-unificado/`, navegar para a aba NDA, NÃO marcar o checkbox "Li e aceito os termos do NDA mútuo", e tentar submeter ou forçar blur no campo.
**Esperado:** Mensagem "Você deve aceitar os termos do NDA para continuar" aparece inline abaixo do checkbox.
**Por que humano:** Comportamento de validação com RHF mode:onBlur e z.literal(true) com Zod v4 API `{ message }` (em vez de errorMap antigo) só pode ser confirmado em runtime.

### 2. Engine G1-G5 atualiza badge em tempo real

**Teste:** Ir para aba Torre Decisão, selecionar "G3" no select "Nível gerencial".
**Esperado:** Badge G3 aparece imediatamente na barra ReadinessClassification (entre o título da aba e o conteúdo) sem necessidade de salvar/recarregar.
**Por que humano:** Reatividade do useMemo sobre store.sectionData do Zustand só é confirmável em runtime.

### 3. Engine HAB-X atualiza badge em tempo real

**Teste:** Ir para aba Hab. Classificação, selecionar "HAB-A — Pronta para operação" no select "Classificação final".
**Esperado:** Span "HAB-A — Pronta" (fundo verde) aparece no badge bar.
**Por que humano:** Reatividade da pipeline HabClassificacaoSection → store → calculateReadiness → ReadinessClassification só é confirmável em runtime.

### 4. Campo dataAceite disabled com data atual

**Teste:** Abrir a aba NDA e verificar o campo "Data de aceite".
**Esperado:** Campo exibe a data atual no formato DD/MM/AAAA (ex: 24/05/2026) e não aceita edição (disabled).
**Por que humano:** O valor `new Date().toLocaleDateString('pt-BR')` é avaliado em runtime.

### 5. Responsividade 768px nas 5 abas novas (UX-02)

**Teste:** Usar DevTools (modo responsivo iPad ou 768px) e navegar pelas abas Hab. Venda, Hab. Repositórios, Hab. Responsáveis, Hab. Classificação, NDA.
**Esperado:** Grid de matrizes colapsa para 1 coluna, sem overflow horizontal em nenhuma aba.
**Por que humano:** Classes Tailwind `grid-cols-1 md:grid-cols-2` estão presentes no código mas o comportamento visual de layout depende do viewport.

---

## Resumo de Gaps

Nenhum gap bloqueador encontrado. Todas as 13 verdades observáveis foram VERIFICADAS via análise estática. Os 5 itens de verificação humana são comportamentos de runtime que dependem do browser e foram identificados como `checkpoint:human-verify` no próprio plano 07-06.

---

_Verificado: 2026-05-24_
_Verificador: Claude (gsd-verifier)_
