-- seed.sql — dados de teste para o piloto Sinduscon
-- APLICAR VIA: Dashboard SQL Editor do Supabase (não via supabase db reset — destrutivo no remote)
-- Credenciais de teste: admin@suaequipe.ia / Admin@123 | empresa1@teste.com / Empresa@123
--
-- Este script é idempotente: executar mais de uma vez causará erro de duplicação (ON CONFLICT
-- pode ser adicionado depois se necessário). Em ambiente de desenvolvimento limpo, executar
-- após aplicar todas as migrations (000001–000008).
--
-- Dependências:
--   pgcrypto extension (habilitada por padrão no Supabase)
--   Migrations 000001–000008 aplicadas (tabelas e RLS presentes)

CREATE EXTENSION IF NOT EXISTS "pgcrypto" SCHEMA extensions;

DO $$
DECLARE
  v_admin_id      UUID := gen_random_uuid();
  v_empresa_id    UUID := gen_random_uuid();
  v_org_suaequipe UUID := gen_random_uuid();
  v_org_empresa1  UUID := gen_random_uuid();
  v_admin_pw      TEXT := extensions.crypt('Admin@123', extensions.gen_salt('bf'));
  v_empresa_pw    TEXT := extensions.crypt('Empresa@123', extensions.gen_salt('bf'));
BEGIN

  -- ============================================================
  -- Usuário 1: admin@suaequipe.ia (role: admin)
  -- ============================================================
  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_admin_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'admin@suaequipe.ia',
    v_admin_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  );

  -- auth.identities OBRIGATÓRIO: sem este INSERT, login retorna 200 mas session é null
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_admin_id,
    v_admin_id,
    json_build_object('sub', v_admin_id::text, 'email', 'admin@suaequipe.ia'),
    'email',
    v_admin_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  -- ============================================================
  -- Usuário 2: empresa1@teste.com (role: company)
  -- ============================================================
  INSERT INTO auth.users (
    id, instance_id, aud, role, email,
    encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data,
    created_at, updated_at
  ) VALUES (
    v_empresa_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'empresa1@teste.com',
    v_empresa_pw,
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW()
  );

  -- auth.identities OBRIGATÓRIO: sem este INSERT, login retorna 200 mas session é null
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  ) VALUES (
    v_empresa_id,
    v_empresa_id,
    json_build_object('sub', v_empresa_id::text, 'email', 'empresa1@teste.com'),
    'email',
    v_empresa_id::text,
    NOW(),
    NOW(),
    NOW()
  );

  -- ============================================================
  -- Organizações (active=TRUE explícito — coluna adicionada no Plano 02-01)
  -- ============================================================
  INSERT INTO public.orgs (id, name, cnpj, active) VALUES
    (v_org_suaequipe, 'SuaEquipe.IA (Admin)', NULL, TRUE),
    (v_org_empresa1,  'Construtora Teste 1', '12.345.678/0001-99', TRUE);

  -- ============================================================
  -- Memberships: admin na org SuaEquipe.IA; empresa1 na Construtora Teste 1
  -- ============================================================
  INSERT INTO public.org_members (org_id, user_id, role) VALUES
    (v_org_suaequipe, v_admin_id,   'admin'),
    (v_org_empresa1,  v_empresa_id, 'company');

  -- ============================================================
  -- Assessment de rascunho inicial para empresa1 (form_data vazio — pronto para preenchimento)
  -- ============================================================
  INSERT INTO public.assessments (org_id, status, version, form_data) VALUES
    (v_org_empresa1, 'draft', 1, '{}');

END $$;
