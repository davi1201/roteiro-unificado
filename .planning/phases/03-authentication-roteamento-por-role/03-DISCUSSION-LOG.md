# Phase 3: Authentication & Roteamento por Role - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-05-22
**Phase:** 03-authentication-roteamento-por-role
**Areas discussed:** Layout da página de Login, Erros de autenticação, Estado de carregamento inicial

---

## Layout da página de Login

### Estrutura geral

| Option | Description | Selected |
|--------|-------------|----------|
| Card centralizado simples | Fundo azul #123B66 sólido, card branco centralizado. Usa Card component existente. | ✓ |
| Split 50/50 com branding | Lado esquerdo ilustração/tagline, lado direito formulário. Exige novo layout component. | |
| Full-page com logo no topo | Fundo branco ou gradiente, logo e tagline centralizados no topo. | |

**User's choice:** Card centralizado simples

### Conteúdo do card

| Option | Description | Selected |
|--------|-------------|----------|
| Logo + nome do produto | "Roteiro Unificado" + subtítulo "Piloto Sinduscon" acima do formulário | ✓ |
| Só o formulário | Card minimalista: apenas título "Entrar" + campos + botão | |
| Você decide | Planner escolhe visualmente | |

**User's choice:** Logo + nome do produto

### Fundo da página

| Option | Description | Selected |
|--------|-------------|----------|
| Azul sólido #123B66 | Fundo inteiro na cor primária. Card branco destaca bem. | ✓ |
| Gradiente azul escuro → azul médio | Gradiente sutil entre #0d2d4f e #123B66 | |
| Branco / neutro | Fundo branco ou cinza claro com card sombreado | |

**User's choice:** Azul sólido #123B66

### Link "Esqueci minha senha"

| Option | Description | Selected |
|--------|-------------|----------|
| Abaixo do campo de senha | Link discreto alinhado à direita abaixo do Input de senha, → /forgot-password | ✓ |
| Abaixo do botão de login | Link centrado abaixo do botão "Entrar" | |
| Você decide | Implementar onde fizer sentido visualmente | |

**User's choice:** Abaixo do campo de senha

---

## Erros de autenticação

### Especificidade da mensagem de erro

| Option | Description | Selected |
|--------|-------------|----------|
| Genérico: "Email ou senha inválidos" | Uma mensagem para qualquer falha. Mais seguro — não revela se email está cadastrado. | ✓ |
| Específico por tipo de erro | "Email não cadastrado" vs "Senha incorreta". Mais amigável mas revela info sobre contas. | |
| Você decide | Implementar a mensagem que fizer mais sentido | |

**User's choice:** Genérico — "Email ou senha inválidos"

### Localização do erro de auth

| Option | Description | Selected |
|--------|-------------|----------|
| Banner vermelho inline no card | Alert/banner vermelho acima dos campos, dentro do card | |
| Toast no canto superior direito | Usa Toaster já configurado no main.tsx | ✓ |
| Erro inline abaixo de cada campo | Mensagem abaixo de cada input | |

**User's choice:** Toast no canto superior direito

### Erros de validação de campo

| Option | Description | Selected |
|--------|-------------|----------|
| Inline abaixo de cada campo | Mensagens Zod/RHF abaixo do campo com erro. Consistente com fases futuras. | ✓ |
| Toast também | Tudo via toast, inclusive validação. | |
| Você decide | Misturar conforme tipo de erro | |

**User's choice:** Inline abaixo de cada campo

### Loading state do botão

| Option | Description | Selected |
|--------|-------------|----------|
| Desabilitar + Spinner inline no botão | disabled + Spinner component existente. Previne duplo-submit. | ✓ |
| Spinner full-card | Card inteiro mostra loading durante chamada | |
| Você decide | Loading state conforme preferência | |

**User's choice:** Desabilitar + Spinner inline

---

## Estado de carregamento inicial (auth flicker)

### Loading durante inicialização

| Option | Description | Selected |
|--------|-------------|----------|
| Spinner full-screen centralizado | Fundo azul com Spinner branco centralizado. Evita flash para /login. | ✓ |
| Nada / tela em branco | App monta sem conteúdo por ~200ms. Pode piscar para /login. | |
| Skeleton do layout | Exibe skeleton do layout que vai aparecer. Mais trabalhoso. | |

**User's choice:** Spinner full-screen centralizado

### Sessão expirada durante uso

| Option | Description | Selected |
|--------|-------------|----------|
| Redirect silencioso para /login | Supabase detecta 401, AuthProvider limpa sessão, redirect automático. | ✓ |
| Toast de aviso + redirect | "Sua sessão expirou" + redirect após 2s. | |
| Modal de reautenticação | Modal pede senha sem sair da página. Complexo para piloto. | |

**User's choice:** Redirect silencioso para /login

### Comportamento do logout

| Option | Description | Selected |
|--------|-------------|----------|
| /login direto | Redirect para /login com estado limpo. | ✓ |
| /login com toast de confirmação | "Você saiu com sucesso" toast na página de login. | |
| Você decide | Implementar o redirect que fizer mais sentido. | |

**User's choice:** /login (sem toast)

---

## Claude's Discretion

- **Fluxo de reset de senha**: redirect para /login após redefinição + toast de sucesso; token expirado exibe erro com link para solicitar novo email
- **Namespace da Zustand store**: `form-progress-${tenantId}` (pendente registrado no STATE.md)
- **Identificação de admins**: role === 'admin' em org_members
- **Estrutura do AuthContext**: `{ user, session, role, orgId, isLoading, signOut }`
- **Localização de arquivos**: features/auth/, components/routing/, pages/

## Deferred Ideas

Nenhuma — discussão mantida dentro do escopo da fase.
