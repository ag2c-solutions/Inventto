ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS legal_name text;
