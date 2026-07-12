-- VIT-01: reflete a criação da tabela storefronts em 11_storefronts_schema.sql.
-- Depende de storefront_status_enum.sql.
CREATE TABLE IF NOT EXISTS public.storefronts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  catalog_id uuid REFERENCES public.catalogs(id) ON DELETE SET NULL,
  name text NOT NULL,
  slug text,
  whatsapp text,
  instagram text,
  facebook text,
  website text,
  theme jsonb NOT NULL DEFAULT '{}',
  show_prices boolean NOT NULL DEFAULT true,
  show_sold_out boolean NOT NULL DEFAULT true,
  whatsapp_message text,
  status public.storefront_status NOT NULL DEFAULT 'inactive',
  published_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT storefronts_pkey PRIMARY KEY (id),
  CONSTRAINT storefronts_slug_key UNIQUE (slug)
);

CREATE INDEX IF NOT EXISTS idx_storefronts_org ON public.storefronts(organization_id);

DROP TRIGGER IF EXISTS handle_updated_at_storefronts ON public.storefronts;
CREATE TRIGGER handle_updated_at_storefronts
BEFORE UPDATE ON public.storefronts
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
