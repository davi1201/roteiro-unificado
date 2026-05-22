-- Migration: 20260522000003_create_indexes.sql
-- Phase 2: Database Schema & RLS
-- Creates indexes for membership lookup, assessment queries, and dashboard filters.
-- Depends on: 20260522000002_create_tables.sql

-- Membership lookup — used by every RLS policy (most critical index)
CREATE INDEX idx_org_members_user_id ON public.org_members (user_id);
CREATE INDEX idx_org_members_org_id  ON public.org_members (org_id);

-- Assessment queries by org
CREATE INDEX idx_assessments_org_id  ON public.assessments (org_id);
CREATE INDEX idx_assessments_status  ON public.assessments (status);

-- Dashboard filter: readiness classification columns (D-04, DASH-05)
CREATE INDEX idx_assessments_readiness_mgmt ON public.assessments (readiness_level_mgmt);
CREATE INDEX idx_assessments_readiness_tech ON public.assessments (readiness_level_tech);

-- History query: latest version per org (SAVE-04, SAVE-06)
CREATE INDEX idx_assessments_org_version ON public.assessments (org_id, version DESC);

-- NOTE: GIN index on form_data JSONB is deferred — form_data is read as a whole blob
-- in this phase. If future queries filter on specific JSON keys, add a GIN index on
-- form_data using GIN operator class.
