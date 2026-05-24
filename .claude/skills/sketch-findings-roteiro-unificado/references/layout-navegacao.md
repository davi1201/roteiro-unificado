# Layout & Navegação

## Design Decisions

### Sidebar Colapsável (Winner: Variante B do Sketch 001)

**O que foi escolhido:** Sidebar com toggle de colapso — expande a 240px (com ícones + labels) e recolhe a 60px (só ícones). Botão de toggle no canto direito da sidebar, estilo pill branco.

**Por que ganhou sobre as alternativas:**
- Variante A (sidebar fixa sem colapso) desperdiça espaço horizontal permanentemente
- Variante C (sidebar + context bar) consolida bem mas adiciona uma layer de UI que não agrega para app pequeno (5 empresas)
- Variante B equilibra espaço e acessibilidade de navegação

**Propriedades visuais validadas:**
- Largura expandida: `240px` (`--sidebar-width`)
- Largura colapsada: `60px` (`--sidebar-width-collapsed`)
- Background: `var(--color-primary)` (#1e3a5f — azul escuro)
- Transição: `width 0.25s ease` (sidebar) + `margin-left 0.25s ease` (main area)
- Ícones nav: `18×18px`, `stroke-width: 1.5`, stroke: `currentColor`
- Item ativo: `background: rgba(255,255,255,0.15)` + `font-weight: 600`
- Item hover: `background: rgba(255,255,255,0.08)`
- Item desabilitado: `opacity: 0.4; cursor: not-allowed`

### Topbar com Breadcrumb

**O que foi escolhido:** Topbar sticky com breadcrumb (Admin › Página Atual) no lado esquerdo e ações CTA no lado direito. Sem título grande de página — o breadcrumb já contextualiza.

**Propriedades:**
- Height: `56px` (`--header-height`)
- Background: `var(--color-surface)` com `border-bottom: 1px solid var(--color-border)`
- Shadow: `0 1px 3px rgba(0,0,0,0.05)` (leve, não competitivo)
- `position: sticky; top: 0; z-index: 20`
- Breadcrumb: `font-size: 13px`, separador `›`, último item `font-weight: 600; color: var(--color-text)`

### Posição do Toggle Button

Botão de colapso: `position: absolute; top: 12px; right: -12px` — fica na borda direita da sidebar, sobreposto ao conteúdo principal ligeiramente. Diâmetro `24px`, fundo branco, borda sólida, shadow-sm.

## CSS Patterns

```css
/* Sidebar colapsável */
.sidebar {
  width: var(--sidebar-width); /* 240px */
  background: var(--color-primary);
  position: fixed; top: 0; left: 0; bottom: 0; z-index: 30;
  transition: width 0.25s ease;
  overflow: hidden;
  display: flex; flex-direction: column;
}
.sidebar.collapsed { width: var(--sidebar-width-collapsed); /* 60px */ }

/* Main area acompanha sidebar */
.main-area {
  margin-left: var(--sidebar-width);
  transition: margin-left 0.25s ease;
}
.main-area.expanded { margin-left: var(--sidebar-width-collapsed); }

/* Nav item */
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px; border-radius: var(--radius-md);
  font-size: 13.5px; cursor: pointer; color: rgba(255,255,255,0.75);
  white-space: nowrap; overflow: hidden;
  transition: background 0.15s ease;
}
.nav-item:hover { background: rgba(255,255,255,0.08); color: white; }
.nav-item.active { background: rgba(255,255,255,0.15); color: white; font-weight: 600; }
.nav-item.disabled { opacity: 0.4; cursor: not-allowed; }

/* Toggle button */
.toggle-btn {
  position: absolute; top: 12px; right: -12px; z-index: 31;
  width: 24px; height: 24px;
  background: white; border: 1px solid var(--color-border);
  border-radius: var(--radius-full); cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  box-shadow: var(--shadow-sm); transition: box-shadow 0.15s ease;
}
.toggle-btn:hover { box-shadow: var(--shadow-md); }

/* Topbar */
.topbar {
  position: sticky; top: 0; z-index: 20;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
  padding: 0 24px; height: var(--header-height);
  display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

/* Breadcrumb */
.breadcrumb {
  display: flex; align-items: center; gap: 6px;
  font-size: 13px; color: var(--color-text-muted);
}
.breadcrumb .current { color: var(--color-text); font-weight: 600; }
```

## HTML Structures

```html
<!-- Shell admin com sidebar colapsável -->
<div class="admin-layout" style="display:flex; min-height:100vh;">

  <aside class="sidebar" id="sidebar">
    <button class="toggle-btn" onclick="toggleSidebar()">
      <!-- chevron icon -->
    </button>

    <!-- Brand -->
    <div style="padding:14px 16px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; gap:10px;">
      <div class="logo-icon">R</div>
      <span class="sidebar-brand-name">Roteiro Unificado</span>
    </div>

    <!-- Nav -->
    <nav style="flex:1; padding:8px; overflow-y:auto;">
      <a class="nav-item active" href="/admin/dashboard">
        <!-- icon svg 18x18 -->
        <span class="nav-label">Organizações</span>
      </a>
      <span class="nav-item disabled">
        <!-- icon svg -->
        <span class="nav-label">Dashboard</span>
        <span class="nav-badge">Em breve</span>
      </span>
    </nav>

    <!-- Footer user -->
    <div style="padding:12px 8px; border-top:1px solid rgba(255,255,255,0.1);">
      <div class="user-pill">
        <div class="avatar">A</div>
        <span class="nav-label user-name">Admin</span>
      </div>
    </div>
  </aside>

  <!-- Main -->
  <div class="main-area" id="main-area">
    <header class="topbar">
      <nav class="breadcrumb">
        <span>Admin</span>
        <span>›</span>
        <span class="current">Organizações</span>
      </nav>
      <div><!-- CTA buttons --></div>
    </header>
    <main style="padding:24px;">
      <!-- page content -->
    </main>
  </div>
</div>
```

```js
// Toggle collapse
let collapsed = false;
function toggleSidebar() {
  collapsed = !collapsed;
  document.getElementById('sidebar').classList.toggle('collapsed', collapsed);
  document.getElementById('main-area').classList.toggle('expanded', collapsed);
  // Swap chevron direction
  document.querySelectorAll('.nav-label').forEach(l => l.style.display = collapsed ? 'none' : '');
}
```

## What to Avoid

- **Sidebar sem colapso (Variante A):** ocupa 240px fixos — perde espaço útil em telas menores sem necessidade
- **Context bar separado (Variante C):** consolida bem mas adiciona height extra acima do conteúdo; não vale para app com poucas páginas
- **Header com título grande de página:** duplica a informação já no breadcrumb; cria hierarquia redundante
- **Logout solto no rodapé sem contexto:** mover para dentro do user-pill ou adjacente a ele

## Origin

Sintetizado do Sketch 001 (sidebar-layout), Variante B vencedora.
Source: `sources/001-sidebar-layout/index.html`
