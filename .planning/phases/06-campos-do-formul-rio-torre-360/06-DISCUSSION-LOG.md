# Phase 6: Campos do Formulário — Torre 360 - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 06-campos-do-formul-rio-torre-360
**Areas discussed:** Arquitetura RHF + Zustand, Estrutura de diretórios das seções

---

## Arquitetura RHF + Zustand

### Q1: Escopo do useForm()

| Option | Description | Selected |
|--------|-------------|----------|
| useForm() por aba | Cada aba monta seu próprio useForm com schema Zod específico. Schema menor, RHF não carrega todos os campos de uma vez. | ✓ |
| useForm() global no FormLayout | Um único useForm no FormLayout, schema Zod unificado. Validação cruzada possível, mas schema grande e RHF lida com fields desmountáveis. | |

**User's choice:** useForm() por aba (recomendado aceito)

---

### Q2: Sync RHF → Zustand

| Option | Description | Selected |
|--------|-------------|----------|
| watch() + useEffect | `const values = watch(); useEffect(() => { updateSection(tab, values) }, [values])` | ✓ |
| onSubmit por aba | Só sincroniza ao clicar "Avançar". Usuário perde dados se trocar de aba sem confirmar. | |
| Nenhum sync (RHF é source of truth) | RHF guarda dados; Zustand mantém apenas metadata. sectionData torna-se redundante. | |

**User's choice:** watch() + useEffect (recomendado aceito)

---

### Q3: useFormSection atualização

| Option | Description | Selected |
|--------|-------------|----------|
| Sim — useFormSection recebe control do RHF | `useFormSection(tenantId, tab, control?)` expõe errors reais e completeness calculado. | ✓ |
| Não — manter useFormSection como está | Cada Section gerencia erros localmente via RHF formState.errors. completeness permanece 0.01. | |

**User's choice:** Atualizar useFormSection com control opcional (recomendado aceito)

---

### Q4: Inicialização do useForm com dados existentes

| Option | Description | Selected |
|--------|-------------|----------|
| defaultValues do sectionData da store | `useForm({ resolver: zodResolver(schema), defaultValues: sectionData[tab] ?? {} })` | ✓ |
| reset() no useEffect ao montar | useForm com defaultValues vazio, depois reset() no mount. Ciclo extra de render. | |

**User's choice:** defaultValues da store (recomendado aceito)

---

## Estrutura de Diretórios das Seções

### Q1: Localização dos Section components

| Option | Description | Selected |
|--------|-------------|----------|
| src/features/form/sections/ | Subpasta limpa: IdentificacaoSection.tsx, TorreDecisaoSection.tsx, etc. Compatível com estrutura existente. | ✓ |
| src/features/form/ (flat) | Todos os arquivos na pasta form/ sem subpasta. Pasta fica grande com 10+ arquivos. | |
| src/pages/form/ por aba | Cada aba como página separada com rota própria. Quebra modelo hash navigation da Phase 5. | |

**User's choice:** src/features/form/sections/ (recomendado aceito)

---

### Q2: Localização dos field components

| Option | Description | Selected |
|--------|-------------|----------|
| src/components/ui/ | Componentes genéricos reutilizáveis. Exportados via barrel export junto com Button, Badge, Spinner. | ✓ |
| src/features/form/fields/ | Isolados na feature form. Dificulta reutilizar em fases futuras. | |
| src/components/form/ | Nova subpasta de components específica para form. Terceiro diretório de components. | |

**User's choice:** src/components/ui/ (recomendado aceito)

---

### Q3: Localização dos Zod schemas

| Option | Description | Selected |
|--------|-------------|----------|
| src/schemas/ com um arquivo por aba | identificacao.ts, torre-decisao.ts, etc. Desacoplados dos componentes, reutilizáveis na Phase 8. ROADMAP já menciona src/schemas/. | ✓ |
| Co-located no arquivo da seção | Schema no topo de IdentificacaoSection.tsx. Acopla schema ao componente. | |

**User's choice:** src/schemas/ (recomendado aceito)

---

### Q4: Como Section components recebem o controle do RHF

| Option | Description | Selected |
|--------|-------------|----------|
| Props explícitas: <IdentificacaoSection tenantId control errors /> | Simples de ler, fácil de testar, sem context magic. | ✓ |
| FormProvider + useFormContext() | Menos prop drilling, mas acopla sections ao context do FormLayout. Conflita com useForm() por aba. | |

**User's choice:** Props explícitas (recomendado aceito)

---

## Claude's Discretion

- **ConditionalField:** wrapper com `watch()` + `unregister()` ao ocultar; `condition: boolean` como prop
- **completeness real:** `filledRequiredFields / totalRequiredFields` do schema Zod, substituindo proxy 0.01 da Phase 5
- **Field component API:** recebem `control` via prop, não `useFormContext`, para isolamento e reusabilidade

## Deferred Ideas

- Validação cruzada entre abas — deferred para Phase 7 ou avaliação no planning
- "Selecionar todos" genérico no CheckboxGroupField — implementar só para Torre Sienge por enquanto
- Animação de transição ao mostrar/ocultar ConditionalField — deferred para Phase 12
