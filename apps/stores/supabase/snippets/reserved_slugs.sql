-- VIT-02 · RN073: reflete a criação da tabela reserved_slugs em
-- 11_storefronts_schema.sql. Depende de storefronts_table.sql (organizations FK).
CREATE TABLE IF NOT EXISTS public.reserved_slugs (
  slug text NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  released_at timestamp with time zone NOT NULL,
  CONSTRAINT reserved_slugs_pkey PRIMARY KEY (slug)
);

ALTER TABLE public.reserved_slugs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can view reserved slugs" ON public.reserved_slugs;
CREATE POLICY "Authenticated users can view reserved slugs" ON public.reserved_slugs
FOR SELECT TO authenticated USING (true);
