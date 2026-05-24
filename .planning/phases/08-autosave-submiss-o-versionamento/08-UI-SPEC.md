---
phase: 8
slug: autosave-submissao-versionamento
status: draft
shadcn_initialized: false
preset: none
created: 2026-05-23
revised: 2026-05-23
---

# Phase 8 — UI Design Contract

> Contrato visual e de interação para autosave, submissão formal e histórico de versões.
> Gerado por gsd-ui-researcher. Verificado por gsd-ui-checker.

---

## Design System

| Property           | Value                                                        |
|--------------------|--------------------------------------------------------------|
| Tool               | none — Tailwind v4 com `@theme {}` customizado               |
| Preset             | not applicable                                               |
| Component library  | componentes próprios em `src/components/ui/`                 |
| Icon library       | none — ícones SVG inline ou Unicode quando necessário        |
| Font               | Inter (via `--font-sans` em `@theme {}`)                     |

Fonte: `roteiro-unificado/src/index.css` — tokens existentes, confirmados.

---

## Spacing Scale

Declarado (múltiplos de 4 apenas — escala 8-point):

| Token | Value | Usage                                              |
|-------|-------|----------------------------------------------------|
| xs    | 4px   | Gaps entre ícone e label no toast, badges inline   |
| sm    | 8px   | Padding interno de badges de status no histórico   |
| md    | 16px  | Padding de cards de histórico, gaps entre botões   |
| lg    | 24px  | Padding da seção de histórico, padding do dialog   |
| xl    | 32px  | Espaço entre cabeçalho e lista de versões          |
| 2xl   | 48px  | Separação de blocos de seção na HistoryPage        |
| 3xl   | 64px  | Não usado nesta fase                               |

Exceções:
- Sticky footer do botão "Enviar Avaliação": `h-16` (64px altura), `py-4` (16px vertical) — alinhado com layout existente do FormLayout.
- Skeleton placeholders: altura mínima de `h-6` (24px) por linha e `h-10` (40px) por bloco de card — proporcional ao conteúdo real que substitui.

---

## Typography

| Role     | Size   | Weight          | Line Height |
|----------|--------|-----------------|-------------|
| Body     | 14px   | 400 (regular)   | 1.5         |
| Label    | 14px   | 600 (semibold)  | 1.4         |
| Heading  | 20px   | 600 (semibold)  | 1.2         |
| Display  | 28px   | 600 (semibold)  | 1.2         |

**Pesos declarados: 2 — 400 (regular) e 600 (semibold).** O tamanho 28px do Display já confere hierarquia visual suficiente sem necessidade de um terceiro peso.

Nota: herda das fases anteriores. `text-xl font-semibold` no `<h1>` do FormLayout = 20px/600 — não alterar.
Texto de version number no histórico: `text-sm font-semibold` (14px/600).
Texto de data/metadata no histórico: `text-sm text-gray-500` (14px/400).

---

## Color

| Role              | Value (token)          | Hex       | Usage                                                  |
|-------------------|------------------------|-----------|--------------------------------------------------------|
| Dominant (60%)    | `bg-gray-50`           | ~#F9FAFB  | Background geral da página (já existente no FormLayout) |
| Secondary (30%)   | `bg-white` / `bg-primary` | #FFFFFF / #123B66 | Cards do histórico (branco); sidebar (azul primário)  |
| Accent (10%)      | `bg-accent` / `text-accent` | #F28C28 | Badge de status "Enviado" — único elemento accent desta fase |
| Destructive       | `bg-g1` / `text-g1`    | ~#DC2626  | Não usado nesta fase — nenhuma ação destrutiva         |

Accent reservado para:
1. Badge de status "Enviado" na lista de histórico — `bg-accent text-white` para distinguir visualmente de "Rascunho".

Nota sobre o botão "Enviar Avaliação": usa `variant="primary"` (`bg-primary` #123B66, azul), **não** accent. A proeminência visual vem de `size="lg"` + sticky footer fixo no viewport — não de cor accent. O accent NÃO é aplicado ao botão.

Nota: as cores `--color-primary: #123B66` e `--color-accent: #F28C28` existem como tokens Tailwind v4 em `src/index.css` — usar via classes utilitárias, nunca via hex hardcoded.

---

## Componentes Visuais por Contexto

### Toast de Autosave

| Estado        | Variante       | Copy                                         | Ícone  |
|---------------|----------------|----------------------------------------------|--------|
| Sucesso       | `toast.success` | "Salvo às HH:MM"                             | ✓ (Sonner padrão) |
| Falha/offline | `toast.warning` | "Falha ao salvar — tentando novamente"       | ⚠ (Sonner padrão) |

- Posicionamento: canto inferior direito (padrão Sonner configurado no root `<Toaster />`).
- Duração sucesso: 2000ms (discreto — não interrompe preenchimento).
- Duração falha: 4000ms (dá tempo de ler a mensagem).
- Timestamp: `new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })`.

### Dialog de Confirmação de Submissão

Usa `src/components/ui/dialog.tsx` existente (max-w-md, bg-white, rounded-lg, shadow-xl).

| Elemento              | Spec                                                                  |
|-----------------------|-----------------------------------------------------------------------|
| Título                | "Enviar Avaliação?" — `DialogTitle` (text-xl font-semibold text-gray-900) |
| Descrição             | "Após o envio, esta versão ficará imutável. Você poderá iniciar uma nova revisão a partir dela." — `DialogDescription` (text-sm text-gray-500) |
| Botão confirmar       | `<Button variant="primary" size="md">Confirmar Envio</Button>` — à direita |
| Botão cancelar        | `<Button variant="secondary" size="md">Manter Rascunho</Button>` — à esquerda |
| Footer layout         | `DialogFooter` — `justify-end gap-3` (já definido no Dialog existente) |

### Botão "Enviar Avaliação"

- Localização: sticky footer na área `<main>` do FormLayout, visível **apenas quando `activeTab === TabKey.Nda`**.
- Classes: `sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4 md:px-6` envolvendo o botão.
- Botão: `<Button variant="primary" size="lg" className="w-full sm:w-auto">Enviar Avaliação</Button>`.
- Estado loading: `isLoading={isSubmitting}` — botão exibe spinner integrado via `ButtonProps.isLoading`.
- Estado read-only (após submissão): botão some; exibe `<p className="text-sm text-gray-500 italic">Avaliação enviada em DD/MM/AAAA às HH:MM</p>`.

### HistoryPage — `/form/:orgId/history`

Layout: página full-width com `max-w-3xl mx-auto px-4 py-8`.

| Elemento              | Spec                                                                  |
|-----------------------|-----------------------------------------------------------------------|
| Cabeçalho da página   | `<h1 className="text-xl font-semibold text-gray-900">Histórico de Avaliações</h1>` |
| Subtitle              | `<p className="text-sm text-gray-500 mt-1">Todas as versões enviadas pela sua empresa</p>` |
| Botão voltar          | `<Button variant="ghost" size="sm">← Voltar ao Formulário</Button>` — acima do `<h1>` |
| Lista de versões      | Stack vertical com `gap-4` entre cards                               |

#### Card de Versão

```
bg-white rounded-lg border border-gray-200 shadow-sm p-4 md:p-6
```

| Campo           | Spec                                                                    |
|-----------------|-------------------------------------------------------------------------|
| Versão          | `"Versão N"` — `text-sm font-semibold text-gray-900`                   |
| Data de envio   | `"Enviada em DD/MM/AAAA às HH:MM"` — `text-sm text-gray-500`           |
| Status badge    | "Enviado": `bg-accent text-white`; "Rascunho": `bg-gray-100 text-gray-700` — ambos `text-xs font-semibold px-3 py-0.5 rounded-full` |
| Nível gerencial | Badge G1-G5 usando `<Badge grade={...} />` existente                    |
| Nível técnico   | `text-sm text-gray-600` — string direta (ex: "HAB-B")                  |
| Botão histórico | `<Button variant="secondary" size="sm">Ver detalhes</Button>` — abre form em modo read-only |
| Botão revisão   | `<Button variant="primary" size="sm">Iniciar Nova Revisão</Button>` — visível **apenas na versão mais recente com status submitted** |

### Skeleton Loading States

Usa `<Skeleton className="..." />` de `src/components/ui/skeleton.tsx` (animate-pulse, rounded-md, bg-gray-200).

#### Skeleton do FormLayout (aguardando hydration do draft)

Exibido enquanto `isLoading === true` no `useQuery(['assessment', 'draft', orgId])`.

```
<!-- No lugar do renderSection() -->
<div className="mt-4 space-y-4">
  <Skeleton className="h-10 w-full" />     <!-- campo fake -->
  <Skeleton className="h-10 w-3/4" />
  <Skeleton className="h-10 w-full" />
  <Skeleton className="h-24 w-full" />     <!-- textarea fake -->
</div>
```

#### Skeleton da HistoryPage (aguardando lista de assessments)

```
<div className="space-y-4">
  <!-- 3 cards fake -->
  <div className="rounded-lg border border-gray-200 bg-white p-4 space-y-3">
    <Skeleton className="h-5 w-24" />     <!-- "Versão N" -->
    <Skeleton className="h-4 w-48" />     <!-- data -->
    <Skeleton className="h-6 w-16" />     <!-- badge status -->
  </div>
  <!-- repetir 2x -->
</div>
```

### Indicador de Autosave no Header da Seção

Opcional: linha de texto discreto abaixo do `<h1>` do FormLayout quando `activeTab !== TabKey.Nda`:

```
<p className="text-xs text-gray-400 mt-0.5">
  {lastSavedAt ? `Salvo às ${lastSavedAt}` : 'Não salvo ainda'}
</p>
```

Visível apenas quando `isSaving === false && lastSavedAt !== null`. Ocultar durante `isSaving === true`.

---

## Copywriting Contract

| Elemento                          | Copy                                                                               |
|-----------------------------------|------------------------------------------------------------------------------------|
| Toast autosave sucesso            | "Salvo às {HH:MM}"                                                                 |
| Toast autosave falha              | "Falha ao salvar — tentando novamente"                                             |
| Indicador inline de salvamento    | "Salvo às {HH:MM}" / "Não salvo ainda"                                             |
| Botão enviar avaliação            | "Enviar Avaliação"                                                                  |
| Dialog título                     | "Enviar Avaliação?"                                                                 |
| Dialog descrição                  | "Após o envio, esta versão ficará imutável. Você poderá iniciar uma nova revisão a partir dela." |
| Dialog botão confirmar            | "Confirmar Envio"                                                                   |
| Dialog botão cancelar             | "Manter Rascunho"                                                                   |
| Estado pós-envio (no lugar do botão) | "Avaliação enviada em {DD/MM/AAAA} às {HH:MM}"                                |
| HistoryPage título                | "Histórico de Avaliações"                                                           |
| HistoryPage subtítulo             | "Todas as versões enviadas pela sua empresa"                                        |
| Empty state (sem histórico)       | Heading: "Nenhuma avaliação enviada ainda" / Body: "Preencha o formulário e clique em 'Enviar Avaliação' para criar sua primeira versão." |
| Toast erro de submissão           | "Erro ao enviar avaliação — tente novamente"                                        |
| Toast sucesso de submissão        | "Avaliação enviada com sucesso!"                                                    |
| Toast erro ao iniciar revisão     | "Erro ao iniciar nova revisão — tente novamente"                                    |
| Botão ver detalhes no histórico   | "Ver detalhes"                                                                      |
| Botão iniciar nova revisão        | "Iniciar Nova Revisão"                                                              |
| Botão voltar ao formulário        | "← Voltar ao Formulário"                                                            |
| Badge status enviado              | "Enviado"                                                                           |
| Badge status rascunho             | "Rascunho"                                                                          |

Nenhuma ação destrutiva nesta fase — não há delete de versões ou de rascunhos pelo usuário.

---

## Interaction States

### Estado do formulário por status do assessment

| Status do assessment | Campos editáveis | Botão "Enviar Avaliação" | Autosave ativo |
|----------------------|------------------|--------------------------|----------------|
| Nenhum draft (primeira vez) | Sim | Sim (na aba NDA) | Sim — cria draft no primeiro change |
| Draft ativo          | Sim              | Sim (na aba NDA)         | Sim — upsert a cada 1500ms de inatividade |
| Submitted (view)     | Não — `disabled` em todos os campos | Oculto — exibe texto de data de envio | Não |

### Indicadores de feedback visual imediatos

| Ação do usuário          | Feedback visual                                           | Timing    |
|--------------------------|-----------------------------------------------------------|-----------|
| Digitar em qualquer campo | Nenhum imediato (debounce 1500ms antes de salvar)        | —         |
| Autosave disparado       | Indicador inline "Salvo às HH:MM" atualiza               | Após save |
| Autosave falha           | Toast warning (canto inferior direito, 4000ms)            | Imediato  |
| Clicar "Enviar Avaliação" | Dialog abre                                             | Imediato  |
| Confirmar envio          | Botão confirmar entra em estado `isLoading`; dialog permanece aberto | Enquanto request roda |
| Envio concluído          | Dialog fecha; toast success "Avaliação enviada!"; redirect para HistoryPage | Após sucesso |
| Envio falhou             | Dialog fecha; toast error                                 | Após falha |
| Clicar "Iniciar Nova Revisão" | Botão entra em `isLoading`; redirect para `/form/:orgId` após sucesso | Após request |

---

## Acessibilidade

| Elemento                  | Requisito                                                              |
|---------------------------|------------------------------------------------------------------------|
| Dialog                    | `role="dialog" aria-modal="true"` — já implementado no `Dialog` existente |
| Botão "Enviar Avaliação"  | `aria-label="Enviar avaliação de prontidão"` quando apenas ícone; com texto explícito é desnecessário |
| Toast                     | Sonner gerencia `role="status"` e `aria-live` automaticamente          |
| Skeleton                  | Adicionar `aria-busy="true"` no container pai enquanto loading          |
| HistoryPage lista         | Cada card: `<article>` semântico com `aria-label="Versão N — Enviada em DD/MM/AAAA"` |
| Campos em modo read-only  | `disabled` nos inputs (já semanticamente correto) — não usar apenas `readOnly` |

---

## Responsividade

Herda do layout existente do FormLayout (`md:flex-row`, sidebar `md:max-w-[300px]`).

| Breakpoint | Ajustes específicos desta fase                                          |
|------------|-------------------------------------------------------------------------|
| < 768px (mobile) | Sticky footer do botão ocupa largura total (`w-full`); Dialog com `max-w-[calc(100vw-32px)]` |
| >= 768px (tablet+) | Sticky footer alinha o botão à direita (`justify-end`); Dialog em `max-w-md` padrão |

HistoryPage: `max-w-3xl mx-auto` funciona bem em todos os breakpoints. Cards com `flex-col sm:flex-row` para separar metadados e botões de ação.

---

## Registry Safety

| Registry          | Blocks Used   | Safety Gate                               |
|-------------------|---------------|-------------------------------------------|
| shadcn official   | none          | not applicable — não usa shadcn           |
| npm packages      | `@tanstack/react-query ^5.100.11` (já instalado), `sonner ^2.0.7` (já instalado) | Pacotes instalados nas fases anteriores — sem novo pacote externo nesta fase |

Nenhum terceiro registry declarado. Nenhum bloco de terceiros a vetar.

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

## Revision Log

| Data       | Problema                                               | Correção aplicada                                               |
|------------|--------------------------------------------------------|-----------------------------------------------------------------|
| 2026-05-23 | D1: Dialog cancelar usava label genérica "Cancelar"    | Substituído por "Manter Rascunho" em todo o documento           |
| 2026-05-23 | D4: Três pesos declarados (400, 600, 700)              | Display alterado de 700 (bold) para 600 (semibold) — 2 pesos   |
| 2026-05-23 | D5: Badge usava `px-2.5` (10px, não múltiplo de 4)    | Substituído por `px-3` (12px) em todo o documento              |
| 2026-05-23 | D3 (rec): Accent listado como reservado para o botão  | Removido — accent reservado apenas para badge "Enviado"; botão usa `variant="primary"` (bg-primary) |

---

*Phase: 08-autosave-submissao-versionamento*
*UI-SPEC gerado: 2026-05-23*
*UI-SPEC revisado: 2026-05-23 — 3 blocking fixes + 1 recommendation aplicados*
*Fonte de decisões: 08-CONTEXT.md (D-01 a D-06 + Discretion), REQUIREMENTS.md §SAVE + §UX, index.css tokens, componentes existentes em src/components/ui/*
