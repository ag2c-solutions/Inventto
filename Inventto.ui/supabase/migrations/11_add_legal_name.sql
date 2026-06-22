-- 11_ADD_LEGAL_NAME.SQL
-- Adiciona razão social à tabela organizations (RN018 — identidade fiscal editável)
-- O endereço estruturado (RN024) é armazenado em organizations.settings.address (JSONB)

ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS legal_name text;
