-- Migration: 20260522000004_enable_rls.sql
-- Phase 2: Database Schema & RLS
-- Enables Row Level Security on all three tenant-isolated tables.
-- Depends on: 20260522000002_create_tables.sql (orgs, org_members, assessments must exist)
-- NOTE: With RLS enabled and no policies yet, all operations are denied by default.
--       Policies are added in migrations 000006–000008.

ALTER TABLE public.orgs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
