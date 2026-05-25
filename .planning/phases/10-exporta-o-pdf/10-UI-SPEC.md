---
phase: 10
slug: exporta-o-pdf
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-25
---

# Phase 10 — UI Design Contract: Exportação PDF

> Contrato visual e de interação para a fase de exportação PDF. Gerado por gsd-ui-researcher, verificado por gsd-ui-checker.

---

## Design System

| Property | Value |
|----------|-------|
| Tool | none — custom Tailwind v4 `@theme {}` |
| Preset | not applicable |
| Component library | custom (Button, Badge, Spinner, Skeleton — src/components/ui/) |
| Icon library | SVG inline — nenhuma biblioteca de ícones externa |
| Font | Inter (via index.html + --font-sans token) |

**Fonte:** CONTEXT.md D-01, RESEARCH.md (Stack), codebase `index.css` + `src/components/ui/`

---

## Spacing Scale

Declarado — escala de 4px base, conforme tokens existentes do projeto:

| Token | Value | Usage |
|-------|-------|-------|
| xs | 4px | Gaps entre ícone e label no botão |
| sm | 8px | Gap entre badges no card de versão |
| md | 16px | Padding interno dos cards de versão (p-4) |
| lg | 24px | Padding horizontal da página (px-4 py-8) |
| xl | 32px | Espaçamento entre seção de cabeçalho e lista de versões (mt-8) |
| 2xl | 48px | Padding vertical de empty state (py-12) |
| 3xl | 64px | Não utilizado nesta fase |

Exceções:
- **Touch target do botão "Exportar PDF":** mínimo 32px de altura (size="sm" — h-8), aceitável pois é uso desktop/tablet
- **Botão spinner inline durante geração:** 16×16px (h-4 w-4), alinhado ao padrão do Button.isLoading existente

**Fonte:** `index.css @theme {}`, `HistoryPage.tsx` (padrões de espaçamento existentes), SKILL.md (base 4px)

---

## Typography

| Role | Size | Weight | Line Height | Uso nesta fase |
|------|------|--------|-------------|----------------|
| Body | 14px (text-sm) | 400 (regular) | 1.5 | Metadata de versão, datas, subtítulo da página |
| Label | 12.5px (text-xs) | 600 (semibold) | 1.4 | Badges de status, versão número, texto do botão sm |
| Heading | 20px (text-xl) | 600 (semibold) | 1.2 | "Histórico de Avaliações" (h1) |
| Display | 16px (text-base) | 600 (semibold) | 1.3 | Título do card de versão ("Versão N") |

**Nota para PDF interno (`@react-pdf/renderer`):**
- Fonte embutida: Helvetica (built-in do react-pdf — sem Font.register() necessário para v1)
- Corpo do PDF: 10pt / line-height 1.4
- Labels de seção do PDF: 12pt / weight Bold
- Cabeçalho de capa do PDF: 24pt / weight Bold ("SuaEquipe.IA" estilizado)
- Sub-cabeçalho de capa: 14pt / weight Normal (nome da construtora, CNPJ, versão, data)

**Fonte:** SKILL.md (13-14px body, 12.5px labels, 600 para labels ativos), `HistoryPage.tsx` (text-xl font-semibold), `button.tsx` (text-xs para size sm)

---

## Color

| Role | Value | Token | Usage |
|------|-------|-------|-------|
| Dominant (60%) | `#123B66` | `bg-primary` / `--color-primary` | Fundo da sidebar do formulário; não afeta HistoryPage |
| Secondary (30%) | `#FFFFFF` + `#F8FAFC` | `bg-white` + `bg-gray-50` | Cards de versão (bg-white), fundo da página (bg-gray-50 implícito) |
| Accent (10%) | `#F28C28` | `bg-accent` / `--color-accent` | Badge "Enviado" no card de versão; **nunca** usado no botão "Exportar PDF" |
| Destructive | `--color-g1` (vermelho) | `bg-g1` | Não há ações destrutivas nesta fase |

**Accent reservado especificamente para:**
1. Badge de status "Enviado" no card de versão (`<span class="bg-accent ...">Enviado</span>`)
2. Capa do PDF: sublinhado/acento na logomarca tipográfica "SuaEquipe.IA"
3. Cor de fundo do cabeçalho de seções no PDF (barra lateral colorida)

**Botão "Exportar PDF":** usa `variant="secondary"` (borda azul primário, texto azul primário, fundo branco) — NÃO usa accent. Isso alinha com o botão "Ver detalhes" já existente no card.

**Escala G1-G5 no PDF:**
- G1 Crítico: `#B91C1C` (aproximação de `--color-g1`)
- G2 Baixo: `#F28C28` (= accent)
- G3 Médio: `#D97706` (âmbar)
- G4 Bom: `#1D4ED8` (azul)
- G5 Excelente: `#16A34A` (verde)

**Fonte:** CONTEXT.md D-01, REQUIREMENTS.md UX-01, `index.css @theme {}`, `badge.tsx` (gradeConfig), `HistoryPage.tsx` (badge accent para "Enviado")

---

## Componentes — Inventário por Contexto

### HistoryPage (Web UI)

| Componente | Estado atual | Mudança Phase 10 |
|-----------|-------------|-----------------|
| `Button` (variant="secondary", size="sm") | Existente — "Ver detalhes" | Adicionar "Exportar PDF" ao lado de "Ver detalhes" em cards com `status === 'submitted'` |
| `Spinner` (size="sm") | Existente | Inline no botão durante geração do blob (substitui texto "Exportar PDF" enquanto `loading === true`) |
| `Badge` (grade prop) | Existente — G1-G5 no card | Sem mudança |
| `Skeleton` | Existente — 3 cards no loading state | Sem mudança |

**Layout do botão "Exportar PDF" no card:**
```
[Ver detalhes]  [Exportar PDF]   ← ambos side-by-side em gap-2
```
Quando gerando: `[Ver detalhes]  [⟳ Gerando...]`  — botão desabilitado + spinner sm inline

### PDFDocument (`@react-pdf/renderer` — chunk isolado)

| Elemento | Especificação Visual |
|---------|---------------------|
| Capa | Fundo azul `#123B66` full-page; "SuaEquipe.IA" em branco 24pt Bold com sublinhado laranja `#F28C28`; nome da empresa em branco 18pt; CNPJ 12pt cinza-claro; "Avaliação v{N}" 14pt branco; data de geração 12pt; badge G1-G5 gerencial em destaque (círculo colorido 40px com label) |
| Header de seção | Barra horizontal `#123B66` h=24pt; texto da seção em branco 12pt Bold |
| Linha de campo | Label 10pt cinza `#6B7280`; valor 10pt preto `#111827`; layout em duas colunas (40%/60%) |
| Campo vazio | Valor exibe "—" em cinza `#9CA3AF` |
| Rodapé de página | Número de página direita; "SuaEquipe.IA" esquerda; linha topo cinza `#E5E7EB` |
| Margem | 40pt (≈ 14mm) em todos os lados |
| Página final | Tabela de classificação G1-G5: 5 colunas (Grade / Descrição / Gerencial / Técnico / Status); badge G1-G5 gerencial em destaque 32pt centralizado |

---

## Interações & Estados

### Botão "Exportar PDF" — Máquina de Estados

```
IDLE → [clique] → LOADING → [blob pronto] → window.open(url) → IDLE
                           → [erro]       → toast.error()    → IDLE
```

| Estado | Visual | Comportamento |
|--------|--------|--------------|
| `IDLE` | `Button variant="secondary" size="sm"` com texto "Exportar PDF" | Clicável |
| `LOADING` | Mesmo botão com `isLoading={true}` (spinner inline h-4 w-4) + texto "Gerando..." | `disabled`, ponteiro padrão |
| `SUCCESS` | Retorna para IDLE | `window.open(blobUrl)` abre nova aba; sem toast (feedback visual é a nova aba abrir) |
| `ERROR` | Retorna para IDLE | `useToast().error("Falha ao gerar PDF. Tente novamente.")` |

**Lazy-load:** chunk PDF é carregado na primeira vez que o botão é clicado. O `Suspense` fallback é o próprio estado LOADING (spinner) — o usuário não percebe distinção entre "carregando chunk" e "gerando blob".

### Toast de Erro

Disparar via `useToast().error()` — padrão obrigatório do projeto (nunca importar `toast` do sonner diretamente).

---

## Copywriting Contract

| Elemento | Cópia |
|---------|-------|
| Primary CTA (botão) | **"Exportar PDF"** |
| CTA durante geração | **"Gerando..."** |
| Empty state heading | "Nenhuma avaliação enviada ainda" *(já existente — sem mudança)* |
| Empty state body | "Preencha o formulário e clique em 'Enviar Avaliação' para criar sua primeira versão." *(já existente)* |
| Erro ao gerar PDF | "Falha ao gerar PDF. Tente novamente." |
| Título da página PDF (capa) | "Relatório de Prontidão Gerencial" |
| Sub-título da capa | "Avaliação v{N} — {Nome da Empresa}" |
| Rodapé do PDF (esquerda) | "SuaEquipe.IA — Relatório Confidencial" |
| Seção vazia no PDF | Todos os campos exibem "—" (sem texto adicional) |
| Classificação final (última pág.) | "Classificação de Prontidão" como h2; "Nível Gerencial:" como label em destaque |

Ações destrutivas nesta fase: **nenhuma** — exportação é operação read-only.

**Fonte:** CONTEXT.md D-03, D-04, `HistoryPage.tsx` (empty state copy existente)

---

## Acessibilidade

| Elemento | Requisito |
|---------|-----------|
| Botão "Exportar PDF" | `aria-label="Exportar PDF — Versão {N}"` para diferenciar múltiplos botões na lista |
| Estado loading | `aria-busy="true"` no botão + `aria-label="Gerando PDF..."` |
| Nova aba aberta | Comportamento nativo do browser (window.open) — sem necessidade de aria adicional |
| Contraste do badge accent ("Enviado") | Branco sobre `#F28C28` — ratio ≈ 2.6:1 (abaixo do AA para texto pequeno; aceitável para badge decorativo ≤ 3px, mas implementador deve verificar com text-primary-900 se necessário) |

---

## Registry Safety

| Registry | Blocks Used | Safety Gate |
|----------|-------------|-------------|
| shadcn official | nenhum (projeto não usa shadcn) | não aplicável |
| Terceiros | nenhum declarado | não aplicável |

**Nota:** `@react-pdf/renderer` é dependência npm (não registry shadcn) — fora do escopo do safety gate de registry. Verificação de segurança da dependência é responsabilidade do package.json lockfile.

---

## Checker Sign-Off

- [ ] Dimension 1 Copywriting: PASS
- [ ] Dimension 2 Visuals: PASS
- [ ] Dimension 3 Color: PASS
- [ ] Dimension 4 Typography: PASS
- [ ] Dimension 5 Spacing: PASS
- [ ] Dimension 6 Registry Safety: PASS

**Approval:** pending

---

*Phase: 10 — Exportação PDF*
*UI-SPEC gerado: 2026-05-25*
*Fontes primárias: CONTEXT.md (D-01–D-04), index.css (@theme tokens), HistoryPage.tsx, badge.tsx, button.tsx, SKILL.md*
