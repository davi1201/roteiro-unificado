-- Migration: 20260522000001_create_enums.sql
-- Phase 2: Database Schema & RLS
-- Creates PostgreSQL custom types (enums) used across the schema.

CREATE TYPE public.member_role AS ENUM ('admin', 'company');
CREATE TYPE public.assessment_status AS ENUM ('draft', 'submitted');
