-- Migration: 20260522000002_create_tables.sql
-- Phase 2: Database Schema & RLS
-- Creates core tables: orgs, org_members, assessments.
-- Depends on: 20260522000001_create_enums.sql (public.member_role, public.assessment_status)

-- Organizations (tenants) — one row per construtora or internal team
CREATE TABLE public.orgs (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  cnpj       TEXT        UNIQUE,
  active     BOOLEAN     NOT NULL DEFAULT TRUE,  -- soft-delete flag (Phase 4)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Organization membership — each auth user belongs to exactly one org (ORG-02)
CREATE TABLE public.org_members (
  id         UUID                  PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     UUID                  NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  user_id    UUID                  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role       public.member_role    NOT NULL DEFAULT 'company',
  created_at TIMESTAMPTZ           NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)  -- one user belongs to exactly one org (ORG-02)
);

-- Assessments — JSONB blob per evaluation; readiness columns indexed for dashboard (D-04)
CREATE TABLE public.assessments (
  id                   UUID                      PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id               UUID                      NOT NULL REFERENCES public.orgs(id) ON DELETE CASCADE,
  status               public.assessment_status  NOT NULL DEFAULT 'draft',
  version              INTEGER                   NOT NULL DEFAULT 1,
  form_data            JSONB                     NOT NULL DEFAULT '{}',
  readiness_level_mgmt VARCHAR(10),   -- G1–G5 gerencial (D-04)
  readiness_level_tech VARCHAR(100),  -- technical level string (D-04)
  created_at           TIMESTAMPTZ               NOT NULL DEFAULT NOW(),
  submitted_at         TIMESTAMPTZ               -- NULL until status = 'submitted'
);
