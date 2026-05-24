# Form Controls

## Design Decisions

### Cards em Grid para Grupos de Campos (Winner: Variante B do Sketch 002)

**O que foi escolhido:** Cada grupo semântico de campos vira um `card` com header (ícone colorido + título + subtítulo). Cards são organizados em grid — alguns full-width, alguns lado a lado — para reduzir scroll sem perder clareza.

**Por que ganhou:**
- Variante A (stacked com seções) reduz scroll mas a separação visual entre grupos ainda é ambígua (apenas um `<hr>`)
- Variante C (floating labels) é visualmente mais limpa mas labels longos (ex: "Quem conduz oportunidades comerciais?") ficam ilegíveis quando flutuados
- Variante B cria separação física real entre grupos via card — facilita scanning e erros de preenchimento

### Layout Grid de Cards (regra de quando colocar lado a lado)

```
ROW 1 — full width:      card principal (campos mais importantes / maiores)
ROW 2 — cols-2:          cards menores e complementares entre si
ROW N — full width:      cards com textareas / conteúdo longo
```

**Aplicado ao formulário de Identificação:**
```
[Dados da Empresa     — full width]  ← empresa, CNPJ, cidade em grid 3-col interno
[Responsáveis | Escopo do Piloto  ]  ← lado a lado (ambos têm ~3 campos, complementares)
[Prioridades          — full width]  ← 2 textareas em grid 2-col interno
```

**Regra de decisão:** colocar lado a lado quando:
1. Os dois grupos têm densidade similar (número parecido de campos)
2. São complementares semanticamente mas independentes cognitivamente
3. Nenhum dos dois tem textarea longa (precisa de largura)

### Card Header com Ícone Colorido

Cada card tem cor de ícone diferente para scanning rápido:
- **Azul** (`var(--color-primary)`): dados principais / identificação
- **Âmbar** (`var(--color-accent)`): responsáveis / pessoas
- **Verde** (`var(--color-g4)`): escopo / métricas
- **Roxo** (`#7c3aed`): prioridades / estratégia

### Campos dentro dos Cards

- Stack vertical com `gap: 12px` entre fields
- Grid `1fr 1fr` onde dois campos do mesmo tipo aparecem juntos (ex.: Nº de CNPJs + Nº de obras)
- `field-hint` abaixo do label (font-size 11px, muted) para campos que precisam de exemplo
- CNPJ formata em tempo real com máscara
- Validação visual no `onblur`: borda verde (`--color-success`) se ok, vermelha (`--color-danger`) se obrigatório e vazio

### Textareas nas Prioridades

Lado a lado em grid `1fr 1fr` dentro do card full-width. `rows="4"` como altura inicial. Contador de caracteres `0 / 500` alinhado à direita, muda para âmbar acima de 450.

### Footer Sticky do Formulário

```
[← Anterior]     [Salvar rascunho (link)] [Próxima aba →]
```
- `position: sticky; bottom: 0`
- Background `var(--color-surface)` com `border-top`
- "Salvar rascunho" como `btn-link` (menos destaque — autosave já cuida disso)
- Autosave indicator no topbar: ponto verde + "Salvo há X min"

## CSS Patterns

```css
/* Card */
.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg); /* 8px */
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

/* Card header */
.card-header {
  padding: 11px 16px;
  background: #f8fafc;
  border-bottom: 1px solid var(--color-border);
  display: flex; align-items: center; gap: 10px;
}
.card-icon {
  width: 28px; height: 28px;
  border-radius: var(--radius-md);
  display: flex; align-items: center; justify-content: center;
  color: white; font-size: 13px; flex-shrink: 0;
}
.card-icon.blue   { background: var(--color-primary); }
.card-icon.amber  { background: var(--color-accent); }
.card-icon.green  { background: var(--color-g4); }
.card-icon.purple { background: #7c3aed; }

.card-title { font-size: 13px; font-weight: 700; color: var(--color-text); }
.card-sub   { font-size: 11px; color: var(--color-text-muted); }

.card-body { padding: 16px; }

/* Card grid rows */
.card-row { display: grid; gap: 16px; }
.card-row.cols-1 { grid-template-columns: 1fr; }
.card-row.cols-2 { grid-template-columns: 1fr 1fr; }

/* Fields stacked dentro do card */
.gap-field { display: flex; flex-direction: column; gap: 12px; }

/* Grid interno 2 e 3 colunas */
.g2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.g3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px; }

/* Field */
.field { display: flex; flex-direction: column; gap: 4px; }
.field-label { font-size: 12.5px; font-weight: 600; color: var(--color-text); line-height: 1.3; }
.field-hint  { font-size: 11px; color: var(--color-text-muted); }
.req { color: var(--color-danger); margin-left: 1px; }

/* Input */
.input {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 7px 10px;
  font-size: 13.5px; font-family: var(--font-sans);
  color: var(--color-text); background: var(--color-surface);
  outline: none; width: 100%;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input:focus {
  border-color: var(--color-border-focus);
  box-shadow: 0 0 0 3px rgba(37,99,235,0.1);
}
.input.error { border-color: var(--color-danger); }
.input.ok    { border-color: var(--color-success); }
textarea.input { resize: vertical; min-height: 72px; }

/* Char counter */
.char-count { font-size: 10px; color: var(--color-text-subtle); text-align: right; margin-top: 2px; }

/* Sticky footer */
.form-footer {
  background: var(--color-surface);
  border-top: 1px solid var(--color-border);
  padding: 12px 24px;
  display: flex; align-items: center; justify-content: space-between;
  position: sticky; bottom: 0; z-index: 5;
}

/* Autosave indicator */
.autosave {
  font-size: 11px; color: var(--color-text-subtle);
  display: flex; align-items: center; gap: 5px;
}
.autosave-dot {
  width: 6px; height: 6px;
  border-radius: 50%; background: var(--color-g4);
}
```

## HTML Structures

```html
<!-- Form wrapper -->
<form style="padding:20px 24px; display:flex; flex-direction:column; gap:16px; max-width:960px;">

  <!-- ROW full-width: card principal -->
  <div class="card-row cols-1">
    <div class="card">
      <div class="card-header">
        <div class="card-icon blue"><!-- SVG ícone --></div>
        <div>
          <div class="card-title">Dados da Empresa</div>
          <div class="card-sub">Identificação básica no piloto Sinduscon</div>
        </div>
      </div>
      <div class="card-body">
        <!-- grid 3-col: [empresa x2] [cidade] -->
        <div class="g3" style="margin-bottom:12px;">
          <div class="field" style="grid-column:span 2;">
            <label class="field-label">Empresa / grupo<span class="req">*</span></label>
            <input class="input" type="text" placeholder="Nome da construtora">
          </div>
          <div class="field">
            <label class="field-label">Cidade/UF</label>
            <input class="input" type="text" placeholder="São Paulo/SP">
          </div>
        </div>
        <!-- CNPJ isolado com max-width -->
        <div class="field" style="max-width:280px;">
          <label class="field-label">CNPJ principal<span class="req">*</span></label>
          <input class="input" type="text" placeholder="00.000.000/0001-00">
        </div>
      </div>
    </div>
  </div>

  <!-- ROW 2-cols: cards menores lado a lado -->
  <div class="card-row cols-2">
    <div class="card">
      <div class="card-header">
        <div class="card-icon amber"><!-- icon --></div>
        <div><div class="card-title">Responsáveis</div><div class="card-sub">Quem responde</div></div>
      </div>
      <div class="card-body gap-field">
        <div class="field">
          <label class="field-label">Resp. Torre 360<span class="req">*</span></label>
          <div class="field-hint">Nome e contato</div>
          <input class="input" type="text" placeholder="Nome · (11) 99999-9999">
        </div>
        <div class="field">
          <label class="field-label">Resp. Habilitações<span class="req">*</span></label>
          <div class="field-hint">Nome e contato</div>
          <input class="input" type="text" placeholder="Nome · (11) 88888-8888">
        </div>
        <div class="field">
          <label class="field-label">Conduz oportunidades comerciais?</label>
          <input class="input" type="text" placeholder="Diretoria, comercial...">
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-header">
        <div class="card-icon green"><!-- icon --></div>
        <div><div class="card-title">Escopo do Piloto</div><div class="card-sub">Abrangência</div></div>
      </div>
      <div class="card-body gap-field">
        <div class="field">
          <label class="field-label">Nº de CNPJs/SPEs</label>
          <div class="field-hint">Quantidade e observações</div>
          <input class="input" type="text">
        </div>
        <div class="field">
          <label class="field-label">Nº de obras/empreendimentos</label>
          <div class="field-hint">Quantidade, status e observações</div>
          <input class="input" type="text">
        </div>
      </div>
    </div>
  </div>

  <!-- ROW full-width: textareas lado a lado dentro do card -->
  <div class="card-row cols-1">
    <div class="card">
      <div class="card-header">
        <div class="card-icon purple"><!-- icon --></div>
        <div><div class="card-title">Prioridades</div></div>
      </div>
      <div class="card-body">
        <div class="g2" style="gap:16px;">
          <div class="field">
            <label class="field-label">Prioridade Torre 360</label>
            <textarea class="input" rows="4" placeholder="Descreva..."></textarea>
            <div class="char-count">0 / 500</div>
          </div>
          <div class="field">
            <label class="field-label">Prioridade Habilitações</label>
            <textarea class="input" rows="4" placeholder="Descreva..."></textarea>
            <div class="char-count">0 / 500</div>
          </div>
        </div>
      </div>
    </div>
  </div>

</form>

<!-- Footer sticky -->
<div class="form-footer">
  <button class="btn-ghost">← Anterior</button>
  <div style="display:flex; gap:8px; align-items:center;">
    <button class="btn-link">Salvar rascunho</button>
    <button class="btn-primary">Próxima aba →</button>
  </div>
</div>
```

## What to Avoid

- **Floating labels (Variante C):** labels longos (ex.: "Quem conduz oportunidades comerciais?") ficam truncados e ilegíveis quando flutuados para 10px; não usar neste projeto
- **Stacked sem separação física (Variante A):** `<hr>` não cria separação cognitiva suficiente entre grupos semânticos distintos
- **Emoji como ícone de card:** emoji tem rendering inconsistente entre OS; usar SVG monocromo dentro do card-icon colorido
- **Textareas em cards separados:** gera cards desproporcionais se lado a lado com card de inputs curtos; preferir full-width para textareas
- **`resize: none` em textareas:** usuários precisam de controle sobre tamanho em campos de descrição longa

## Origin

Sintetizado do Sketch 002 (form-inputs), Variante B vencedora.
Source: `sources/002-form-inputs/index.html`
