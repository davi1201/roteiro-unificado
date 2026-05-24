-- Migration: 20260523000001_assessments_draft_unique.sql
-- Phase 8: Autosave, Submissão & Versionamento
-- Adiciona constraint UNIQUE parcial para garantir no máximo um draft ativo por org.
-- Dependências: 20260522000002_create_tables.sql (tabela public.assessments)
--
-- Por que parcial (WHERE status = 'draft'):
--   Múltiplos registros submitted por org são válidos — o modelo de dados é append-only
--   (SAVE-04: cada envio cria uma nova versão sem sobrescrever o histórico).
--   Apenas um rascunho (draft) por org deve existir em qualquer momento.
--
-- Por que CREATE UNIQUE INDEX (não CONSTRAINT UNIQUE no DDL):
--   PostgreSQL suporta índices únicos parciais com cláusula WHERE, enquanto a sintaxe
--   CONSTRAINT UNIQUE não aceita WHERE clause. O Supabase upsert com onConflict funciona
--   com índices únicos (não apenas constraints DDL).
--
-- Por que as colunas são (org_id, status):
--   O hook useAutosave usa onConflict: 'org_id,status' no upsert do Supabase.
--   O PostgREST exige que as colunas em onConflict correspondam exatamente às colunas
--   do índice único. Um índice com apenas (org_id) causaria erro em runtime.
--
-- Idempotência: IF NOT EXISTS garante que re-execução da migration não cause erro.

CREATE UNIQUE INDEX IF NOT EXISTS assessments_org_id_draft_unique
  ON public.assessments (org_id, status)
  WHERE (status = 'draft');
