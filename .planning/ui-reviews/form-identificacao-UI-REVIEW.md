# UI Review — IdentificacaoSection + FormLayout vs Sketch 002 Variant B

**Data:** 2026-05-24
**Referência:** `.planning/sketches/002-form-inputs/index.html` — Variante B ★ (vencedora)
**Arquivos auditados:** `IdentificacaoSection.tsx`, `FormLayout.tsx`, `FormCard.tsx`, `FormCardRow.tsx`, `AutosaveIndicator.tsx`, `tabConfig.ts`, `InputField`, `TextareaField`, `useAutosave`, `identificacaoSchema`, `index.css`
**Score geral:** 14/24

---

## Resumo de Pilares

| Pilar             | Score |
|-------------------|-------|
| Copywriting        | 2/4   |
| Visuals            | 2/4   |
| Color              | 3/4   |
| Typography         | 2/4   |
| Spacing            | 3/4   |
| Experience Design  | 2/4   |
| **Total**          | **14/24** |

---

## Top 3 Correções Prioritárias

### 1. `draftQuery.isError` renderiza formulário vazio sem aviso [BLOCKER]
Quando a query do Supabase falha, `isError: true` mas `FormLayout.tsx:204` renderiza `renderSection()` normalmente — campos vazios sem mensagem. Usuário preenche achando que draft carregou; ao salvar, sobrescreve nada. Não há fallback de erro visível.

**Fix:** Adicionar `if (draftQuery.isError) return <DraftLoadError />` antes do `renderSection()` em `FormLayout.tsx:204`.

---

### 2. Card "Reunião e Participantes" destrói Row 2 do sketch [BLOCKER]
O sketch especifica Row 2 como `[Responsáveis | Escopo do Piloto]` lado a lado — dois grupos operacionais complementares de densidade similar. A implementação atual é `[Reunião e Participantes | Responsáveis]`, relegando Escopo para uma Row 3 standalone.

Consequências:
- Hierarquia de informação invertida: usuário passa por logística de reunião antes de ver responsáveis
- "Reunião e Participantes" usa `iconColor="green"` (mesmo do Escopo), quebrando a diferenciação visual por cor
- "Reunião e Participantes" não existe no sketch aprovado

**Fix:** Mover "Reunião e Participantes" para Row 3 (ou integrar campos opcionais no Row 1). Row 2 deve ser `[Responsáveis (amber) | Escopo do Piloto (green)]`.

---

### 3. Campo `Cidade/UF sede` ausente + textareas sem char-count [HIGH]
Sketch Row 1 usa grid de 3 colunas: `Empresa/grupo (col-span 2)` + `Cidade/UF sede (col 3)` + CNPJ abaixo com `max-width: 280px`. A implementação tem apenas `Empresa/grupo` (full width) + `CNPJ` empilhados — cidade/UF nunca é coletada.

Textareas de Prioridades têm `"0 / 500"` char-count no sketch. `TextareaField` não tem prop de contador — estruturalmente impossível sem alteração do componente.

**Fix:**
1. Adicionar `cidadeUf: z.string().optional()` em `identificacaoSchema.ts`
2. Reestruturar Row 1 para grid 3-col com `Empresa/grupo` em col-span-2 e `Cidade/UF` no col 3
3. Adicionar `maxLength?: number` + exibição de `value.length / maxLength` ao `TextareaField`

---

## Findings Detalhados por Pilar

### Pilar 1 — Copywriting (2/4)

| Severidade | Finding |
|------------|---------|
| ⚠ WARNING | **Topbar sem subtitle** — `TabConfig` tem só `key` e `label`. Sketch mostra 2 linhas: título `"Identificação"` (16px bold) + subtítulo `"Dados gerais da construtora e responsáveis"` (12px muted). `FormLayout.tsx:200` renderiza só o label. |
| ⚠ WARNING | **Label errado em Responsáveis** — `"Responsável técnico/Sienge"` (`IdentificacaoSection.tsx:184`) ≠ sketch `"Resp. Torre 360"`. O sketch nomeia pelo domínio do produto, não pela ferramenta. |
| ⚠ WARNING | **Card inventado sem copy no sketch** — "Reunião e Participantes" com campos "Data da reunião", "Sponsor do piloto", "Participantes e papéis" — nenhum desses existe no Variant B. |
| ⚠ WARNING | **Sem char-count em textareas** — Sketch mostra `"0 / 500"` em cada textarea de Prioridades, atualizado ao digitar. `TextareaField` não tem propriedade de contador. |
| ✓ POSITIVE | CTAs do footer batem exatamente: `"← Anterior"` (ghost), `"Salvar rascunho"` (link), `"Próxima aba →"` (primary). Dialog copy é contextual ("Manter Rascunho"). |

---

### Pilar 2 — Visuals (2/4)

| Severidade | Finding |
|------------|---------|
| ✗ BLOCKER | **Row 2 layout invertido** — Sketch: `[Responsáveis \| Escopo do Piloto]`. Implementação: `[Reunião e Participantes \| Responsáveis]`. Escopo virou Row 3 standalone. Hierarquia de scanning completamente diferente. |
| ✗ BLOCKER | **Campo `Cidade/UF sede` ausente** — Sketch usa grid 3-col em Row 1. Implementação usa 2 campos empilhados sem o campo de cidade. |
| ⚠ WARNING | **Sem field hints** — Sketch mostra `.field-hint` (11px muted) abaixo de cada label em Responsáveis ("Nome e contato (ex.: João · 99999-9999)") e em Escopo ("Quantidade e observações relevantes"). `InputField` não tem prop `helpText` — estruturalmente impossível sem alteração. |
| ✓ POSITIVE | `FormCard` e `FormCardRow` implementam fielmente o sistema de cards do sketch: header colorido (ícone 28×28, título 13px bold, subtítulo 11px muted), body 16px, border + shadow-sm. |

---

### Pilar 3 — Color (3/4)

| Severidade | Finding |
|------------|---------|
| ⚠ WARNING | **"Reunião" usa mesmo verde do "Escopo"** — Dois cards na mesma tela têm `iconColor="green"` (bg-g5). A diferenciação visual por cor perde significado; usuário não distingue os grupos pelo ícone. |
| ⚠ WARNING | **`bg-[#7c3aed]` hardcoded** — `FormCard.tsx:31` usa classe arbitrária Tailwind sem token. Se a cor purple mudar, requer busca no código fonte. Adicionar `--color-purple: #7c3aed` em `index.css`. |
| ✓ POSITIVE | Blue (`bg-primary`), amber (`bg-accent`), green (`bg-g5`) usam tokens de design corretos. |
| ✓ POSITIVE | `bg-primary` concentrado na sidebar e botões primários — não vaza para elementos decorativos. |

---

### Pilar 4 — Typography (2/4)

| Severidade | Finding |
|------------|---------|
| ⚠ WARNING | **Topbar title subdimensionado** — `FormLayout.tsx:200` usa `text-[13px]`. Sketch `.tab-title { font-size: 16px; font-weight: 600 }`. A diferença de 3px faz o heading principal parecer label secundário. |
| ⚠ WARNING | **Field labels oversized** — `IdentificacaoSection.tsx` e componentes `InputField`/`TextareaField` usam `text-sm` (14px). Sketch `.field-label { font-size: 12.5px }`. Labels maiores que inputs criam hierarquia estranha. Afeta todas as seções do formulário. |
| ⚠ WARNING | **3 tamanhos arbitrários ativos** — `text-[13px]` (topbar label, card title) e `text-[11px]` (card subtitle) bypassam a escala Tailwind. Um projeto com design system deveria ter utilities customizados. |
| ✓ POSITIVE | Apenas 2 font-weights (`font-semibold`, `font-bold`) — dentro do limite de 2. Distinção correta: bold em card titles, semibold no restante. |

---

### Pilar 5 — Spacing (3/4)

| Severidade | Finding |
|------------|---------|
| ⚠ WARNING | **Padding do `main` maior que sketch** — `p-6 md:p-8` (24px/32px) vs sketch `.form-wrap { padding: 20px 24px }`. No desktop, 32px de lado comprime a largura útil dos cards 8px além do sketch. |
| ⚠ WARNING | **`h-10` no topbar bloqueia subtitle** — Topbar tem `h-10` (40px) fixo. Para adicionar a linha de subtítulo (fix #1 do Copywriting), o topbar precisa expandir para ~56px — o `h-10` vai clipar. |
| ✓ POSITIVE | `gap-4` (16px) entre `FormCardRow` bate exato com sketch `gap: 16px`. |
| ✓ POSITIVE | `FormCard` body `p-4` (16px) = sketch `.card-body { padding: 16px }`. |
| ✓ POSITIVE | Card header `px-4 py-3` ≈ sketch `.card-header { padding: 11px 16px }` (1px de desvio no vertical). |
| ✓ POSITIVE | Nenhum valor de spacing arbitrário — todos os valores arbitrários são tamanhos de texto, não espaçamento. |

---

### Pilar 6 — Experience Design (2/4)

| Severidade | Finding |
|------------|---------|
| ✗ BLOCKER | **`draftQuery.isError` silencioso** — Query pode falhar (Supabase throw). `isError: true` não tem branch em `FormLayout.tsx`. Formulário renderiza vazio sem aviso — usuário perde draft anterior sem saber. |
| ⚠ WARNING | **`AutosaveIndicator.error` nunca conectado** — Prop `error` do `AutosaveIndicator` existe mas `FormLayout.tsx:201` passa só `lastSaved`. Falha de autosave gera toast (1x) mas indicador no topbar fica mostrando o último save bem-sucedido indefinidamente. |
| ⚠ WARNING | **`Cidade/UF sede` nunca coletada** — Ausência de campo no schema significa que esse dado simplesmente não é persistido. |
| ✓ POSITIVE | Estado de loading de auth: spinner fullscreen com `border-white border-t-transparent`. |
| ✓ POSITIVE | Loading de draft: 4 skeletons com `aria-busy="true"`. |
| ✓ POSITIVE | Dialog de confirmação de envio guarda ação destrutiva irreversível. |
| ✓ POSITIVE | Botões "← Anterior" e "Próxima aba →" desabilitados nas bordas (`disabled={!prevTab}`). |

---

## Checklist de Correções

- [ ] **BLOCKER** Adicionar `if (draftQuery.isError)` branch com UI de erro em `FormLayout.tsx`
- [ ] **BLOCKER** Reestruturar Row 2: `[Responsáveis | Escopo do Piloto]` conforme sketch
- [ ] **HIGH** Adicionar campo `cidadeUf` ao schema + grid 3-col em Row 1
- [ ] **HIGH** Adicionar char-count a `TextareaField` (prop `maxLength`)
- [ ] **MEDIUM** Adicionar `subtitle` field ao `TabConfig` + render 2 linhas no topbar
- [ ] **MEDIUM** Corrigir label "Responsável técnico/Sienge" → "Resp. Torre 360"
- [ ] **MEDIUM** Adicionar `helpText` prop ao `InputField`; wiring nos campos de Responsáveis e Escopo
- [ ] **MEDIUM** Conectar `AutosaveIndicator error={saveError}` em `FormLayout`
- [ ] **LOW** Trocar `bg-[#7c3aed]` por token `--color-purple` em `index.css`
- [ ] **LOW** Corrigir font-size do topbar title: `text-[13px]` → `text-base` (16px)
- [ ] **LOW** Corrigir field labels: `text-sm` (14px) → `text-[12.5px]` nos componentes de input
- [ ] **LOW** Topbar `h-10` → remover altura fixa (auto) para suportar subtitle
