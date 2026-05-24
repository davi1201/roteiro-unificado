-- Migration: 20260523000002_fix_rls_assessments_submit.sql
-- Phase 08.1: Fix SAVE-03 — permitir transição draft→submitted para role company.
--
-- Problema: a policy `assessments_update_draft` em 20260522000008 foi escrita com
-- WITH CHECK (status = 'draft'). PostgreSQL avalia WITH CHECK contra a NOVA linha
-- resultante do UPDATE (não a linha original). Quando useSubmitAssessment executa
-- UPDATE SET status='submitted', a nova linha tem status='submitted', violando o
-- WITH CHECK — PostgreSQL retorna erro RLS 42501 e a submissão falha.
--
-- Fix: manter USING restrito a status='draft' (apenas drafts podem ser atualizados,
-- bloqueando a regressão submitted→draft) mas ampliar WITH CHECK para aceitar
-- status IN ('draft', 'submitted'), permitindo que a nova linha seja either um
-- autosave (draft) ou uma submissão (submitted).
--
-- Nenhum código TypeScript precisa mudar — o hook useSubmitAssessment.ts já está correto.
-- PostgreSQL não suporta CREATE OR REPLACE POLICY — é necessário DROP + CREATE.

DROP POLICY IF EXISTS "assessments_update_draft" ON public.assessments;

CREATE POLICY "assessments_update_draft"
  ON public.assessments FOR UPDATE
  TO authenticated
  USING (
    (SELECT public.is_org_member(org_id))
    AND status = 'draft'
  )
  WITH CHECK (
    (SELECT public.is_org_member(org_id))
    AND status IN ('draft', 'submitted')
  );
