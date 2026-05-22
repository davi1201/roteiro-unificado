<!-- GSD:project-start source:PROJECT.md -->
## Project

**Roteiro Unificado — App Web**

Aplicação web multi-tenant para conduzir e registrar avaliações de prontidão gerencial, técnica, operacional e documental de construtoras no piloto Sinduscon (SuaEquipe.IA). Cada construtora acessa com login próprio, preenche o formulário unificado (Torre 360 + Habilitações + NDA) e o time interno acompanha o status e histórico de prontidão. Substitui o HTML estático atual por uma plataforma colaborativa com persistência, dashboard e exportação.

**Core Value:** Qualquer construtora do piloto consegue preencher, salvar e retomar sua avaliação de prontidão — e o time da SuaEquipe.IA visualiza o status de todas as empresas em um único lugar.

### Language

- **Documentação**: sempre em pt-br — CONTEXT.md, RESEARCH.md, PLAN.md, SUMMARY.md, VERIFICATION.md e qualquer artefato de planejamento devem ser escritos em português brasileiro. Código, commits e nomes de arquivo permanecem em inglês.

### Constraints

- **Stack (frontend)**: React + Vite + Tailwind v4 — decisão do usuário, não negociável
- **Backend/BaaS**: Supabase (PostgreSQL + Auth + Storage + RLS) — decisão do usuário
- **Multi-tenant**: isolamento via Row Level Security (RLS) do Supabase — cada construtora vê apenas seus dados
- **Escala inicial**: piloto com 5 construtoras; arquitetura deve suportar crescimento sem reescrita
- **Export PDF**: biblioteca client-side (ex: react-pdf ou jsPDF) para não depender de servidor de renderização
- **Export Excel**: SheetJS (xlsx) — client-side
<!-- GSD:project-end -->

<!-- GSD:stack-start source:STACK.md -->
## Technology Stack

Technology stack not yet documented. Will populate after codebase mapping or first phase.
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

Conventions not yet established. Will populate as patterns emerge during development.
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

Architecture not yet mapped. Follow existing patterns found in the codebase.
<!-- GSD:architecture-end -->

<!-- GSD:skills-start source:skills/ -->
## Project Skills

No project skills found. Add skills to any of: `.claude/skills/`, `.agents/skills/`, `.cursor/skills/`, `.github/skills/`, or `.codex/skills/` with a `SKILL.md` index file.
<!-- GSD:skills-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd-quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd-debug` for investigation and bug fixing
- `/gsd-execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->



<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd-profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
