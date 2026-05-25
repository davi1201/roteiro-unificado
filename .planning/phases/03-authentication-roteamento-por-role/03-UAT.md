---
status: testing
phase: 03-authentication-roteamento-por-role
source: [03-01-SUMMARY.md, 03-02-SUMMARY.md, 03-03-SUMMARY.md, 03-04-SUMMARY.md, 03-05-SUMMARY.md, 03-06-SUMMARY.md]
started: 2026-05-24T00:00:00Z
updated: 2026-05-24T00:00:00Z
---

## Current Test
<!-- OVERWRITE each test - shows where we are -->

number: 2
name: Auth Flicker Guard (loading state)
expected: |
  Com o app recém-aberto ou após recarregar a página, durante a inicialização do Supabase Auth
  deve aparecer um spinner branco sobre fundo azul. O formulário de login NÃO deve aparecer
  antes da sessão ser verificada.
awaiting: user response

## Tests

### 1. Página de Login — Layout Visual
expected: Acesse /login. Deve aparecer um card centralizado sobre fundo azul escuro (bg-primary), com título "Roteiro Unificado" e subtítulo "Piloto Sinduscon". Campos de e-mail e senha visíveis, botão "Entrar" e link "Esqueci minha senha" abaixo do campo senha.
result: pass

### 2. Auth Flicker Guard (loading state)
expected: Com o app recém-aberto ou após recarregar a página, durante a inicialização do Supabase Auth deve aparecer um spinner branco sobre fundo azul. O formulário de login NÃO deve aparecer antes da sessão ser verificada.
result: [pending]

### 3. Validação Inline do Formulário
expected: Clique no campo email, não preencha nada, clique em outro campo. Deve aparecer mensagem de erro inline abaixo do campo email. Tente submeter com senha em branco — erro inline no campo senha. Nenhum toast deve disparar nestas validações.
result: [pending]

### 4. Login com Credenciais Inválidas
expected: Preencha email e senha incorretos e clique "Entrar". O botão deve mostrar estado de loading ("Entrando...") durante o submit. Ao concluir, deve aparecer toast de erro com texto exato "Email ou senha inválidos" — sem revelar se o email existe ou não.
result: [pending]

### 5. Redirect Pós-Login — Role Company (Construtora)
expected: Faça login com uma conta de construtora (role: company). Após login bem-sucedido, deve ser redirecionado automaticamente para /form/:orgId (com o orgId da empresa). URL muda para a rota do formulário.
result: [pending]

### 6. Redirect Pós-Login — Role Admin
expected: Faça login com uma conta admin. Após login bem-sucedido, deve ser redirecionado automaticamente para /admin/dashboard.
result: [pending]

### 7. Proteção de Rota — ProtectedRoute (sem autenticação)
expected: Sem estar autenticado, acesse diretamente /form/qualquer-id na barra de endereços. Deve ser redirecionado imediatamente para /login. O botão "voltar" do browser NÃO deve retornar para /form/... (redirect usa replace).
result: [pending]

### 8. Proteção de Rota — AdminRoute (role errada)
expected: Logado como construtora (role: company), tente acessar /admin/dashboard diretamente. Deve ser redirecionado para /login — sem exibir conteúdo da página de admin.
result: [pending]

### 9. Link "Esqueci minha senha"
expected: Na página de login, clique em "Esqueci minha senha". Deve navegar para /forgot-password com layout idêntico ao login (fundo azul, card centralizado, max-w-[400px]) e título "Recuperar senha".
result: [pending]

### 10. Envio de E-mail de Recuperação (ForgotPassword)
expected: Em /forgot-password, preencha um email e clique "Enviar link". Botão mostra loading durante submit. Ao concluir, deve aparecer toast de sucesso "Link enviado. Verifique sua caixa de entrada". Página permanece exibida (não redireciona). Link "Voltar para o login" visível.
result: [pending]

### 11. Guard de Sessão Já Autenticada (Login redirect automático)
expected: Com sessão ativa, acesse /login diretamente. Deve ser redirecionado automaticamente para a rota correta por role (/form/:orgId ou /admin/dashboard) sem exibir o formulário de login.
result: [pending]

## Summary

total: 11
passed: 1
issues: 0
pending: 10
skipped: 0
blocked: 0

## Gaps

[none yet]
