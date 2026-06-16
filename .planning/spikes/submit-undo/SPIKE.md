# Spike: Desfazer Envio Acidental do Formulário

**Problema:** Usuário da construtora enviou o formulário sem querer e quer voltar exatamente onde estava.

---

## Diagnóstico do estado atual

### O que `useSubmitAssessment` faz ao submeter:
```
assessments.status  'draft'  →  'submitted'
assessments.submitted_at     →  new Date().toISOString()
assessments.version          →  version + 1
onSuccess                    →  navigate('/form/:orgId/history')
```

### O que `useNewRevision` faz:
```
1. Busca row mais recente com status='submitted'
2. INSERT novo row com status='draft', mesmos form_data, version+1
3. navigate('/form/:orgId')
```

### O que já funciona:
`useNewRevision` **já resolve o problema funcionalmente** — copia todos os dados e abre novo draft.
O mecanismo existe. O problema é **UX**: o usuário não sabe que pode/deve usar isso.

---

## Mapa das opções

### Opção A — UX-only: melhorar o caminho pós-submit (RECOMENDADA)
**O que muda:** nenhum schema, nenhuma lógica nova.  
**Como:** pós-submit, em vez de ir para history e deixar o usuário achar o botão, o fluxo guia diretamente.

Variante A1 — **Banner no dialog de confirmação**  
```
Dialog "Enviar Avaliação?"
  ├── [Manter Rascunho]  [Confirmar Envio]
  └── após submit:
      Banner: "Enviado! Deseja continuar editando?"  [Sim, continuar] → useNewRevision
```

Variante A2 — **Card de recuperação na HistoryPage**  
Na `HistoryContent`, quando `mostRecentIsSubmitted && submitted_at < 15min atrás`:
```
Card azul: "Enviou agora? Você pode continuar editando."
  [Retomar Edição] → useNewRevision
```

**Trade-off:** não é "desfazer" de verdade — cria versão N+1. Mas preserva o histórico (bom para auditoria).

---

### Opção B — Soft-undo: reverter status submitted→draft
**O que muda:** nova mutation que faz UPDATE status='draft' na row.  
```sql
UPDATE assessments
SET status='draft', submitted_at=NULL, version=version-1
WHERE org_id=? AND status='submitted' AND submitted_at > NOW() - INTERVAL '15 minutes'
```

**Riscos:**
- RLS atual permite UPDATE em rows submitted? (verificar policy)
- Quebra o princípio append-only (pode ser desejável ou não)
- Sem janela de tempo, qualquer versão histórica pode ser revertida

**Trade-off:** UX mais limpa ("desfez de verdade"), mas perde o audit trail da submissão acidental.

---

### Opção C — Auto-draft pós-submit
**O que muda:** `useSubmitAssessment.onSuccess` chama `useNewRevision` automaticamente.  
Submit vira "checkpoint" em vez de "finalização".

**Trade-off:** semântica muda — toda submissão abre um novo draft. Usuário nunca fica "travado" na history page. Porém cria versões extras mesmo quando desnecessário.

---

## Análise de risco

| Risco | Opção | Severidade | Mitigação |
|-------|-------|------------|-----------|
| RLS bloqueia UPDATE em submitted | B | ALTO | Verificar policies antes de implementar |
| Usuário não acha o botão "Iniciar Nova Revisão" | A1/A2 | MÉDIO | Melhorar visibilidade — resolve com UX |
| Version drift (V2 submitted + V3 draft "de engano") | A | BAIXO | Aceitar — o histórico mostra corretamente |
| Loop de versões se usuario faz muitas submissões | C | MÉDIO | Guardar flag "tem draft ativo" |

---

## Decisão recomendada

**Opção A2 + melhoria no dialog de confirmação.**

Motivo:
1. `useNewRevision` já funciona e está testado
2. Schema intocado — zero risco de regressão
3. O append-only preserve audit trail (relevante para piloto Sinduscon)
4. A construtora consegue retomar em 2 cliques

### Fluxo resultante após a melhoria:
```
1. Usuário clica "Enviar Avaliação" → Dialog abre
2. Dialog mostra: "Esta versão ficará imutável. Você pode iniciar uma revisão após o envio."
3. Usuário confirma → submit → navega para /history
4. Na history page:
   - Card destacado (cor diferente) no topo quando submitted_at < 15min:
     "Enviou agora? Clique aqui para continuar editando."
   - OU renomear "Iniciar Nova Revisão" → "Retomar Edição" nesse contexto
5. Clique → useNewRevision → volta ao formulário com dados intactos
```

---

## Mudanças mínimas para implementar (Opção A2)

### 1. `FormLayout.tsx` — melhorar copy do dialog
```diff
- "Após o envio, esta versão ficará imutável. Você poderá iniciar uma nova revisão a partir dela."
+ "Esta versão ficará salva no histórico. Logo após o envio, você pode continuar editando se precisar."
```

### 2. `HistoryContent.tsx` — banner de recuperação rápida
Adicionar acima da lista de versões quando `submitted_at` < 15 min:
```tsx
{mostRecentIsSubmitted && isRecentSubmission(history[0].submitted_at) && (
  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 flex items-center justify-between">
    <p className="text-sm text-blue-800">Enviou agora? Você pode continuar editando.</p>
    <Button variant="primary" size="sm" onClick={() => newRevisionMutation.mutate()}>
      Retomar Edição
    </Button>
  </div>
)}
```

### 3. Helper `isRecentSubmission`
```ts
function isRecentSubmission(submittedAt: string | null): boolean {
  if (!submittedAt) return false
  return Date.now() - new Date(submittedAt).getTime() < 15 * 60 * 1000
}
```

---

## Verificação de viabilidade

- [x] `useNewRevision` copia `form_data` corretamente (code review confirm)
- [x] `submitted_at` está disponível em `AssessmentRow` em `HistoryContent.tsx`
- [x] `newRevisionMutation` já instanciado em `HistoryContent`
- [x] `mostRecentIsSubmitted` já calculado
- [ ] Verificar: RLS permite SELECT de `submitted_at` (para o helper de 15min)
- [ ] Testar: após `useNewRevision`, store Zustand hidrata corretamente com dados da versão anterior

---

## Complexidade estimada

**Opção A2:** ~30-50 linhas de código, 2 arquivos (`FormLayout.tsx`, `HistoryContent.tsx`), sem mudança de schema.  
**Opção B:** +1 migration SQL, +1 Edge Function ou mutation nova, verificação de RLS policies, potencial conflito com audit trail.

---

## Status do spike
- [x] Análise de codebase concluída
- [x] Opções mapeadas
- [x] Recomendação definida
- [ ] Protótipo da Opção A2 construído
- [ ] Testes de regressão verificados
