-- ==============================================================================
-- 11_STOREFRONTS_SCHEMA.SQL
-- Módulo 8 · Vitrines/Storefronts (VIT-01)
-- O storefront é o canal de venda online: aponta para UM catálogo (RN059/
-- RN060 — de onde vêm produtos e preços) e carrega o que é só dele: slug,
-- identidade visual, WhatsApp e comportamento.
-- ==============================================================================

-- ==============================================================================
-- 1. TABELA STOREFRONTS
-- ==============================================================================
CREATE TABLE public.storefronts (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,

  -- RN060: vínculo único de canal a catálogo. ON DELETE SET NULL — o guard
  -- de RN061 (canal vinculado bloqueia remoção do catálogo) é aplicado no
  -- RPC delete_catalog, não aqui.
  catalog_id uuid REFERENCES public.catalogs(id) ON DELETE SET NULL,

  name text NOT NULL,
  -- RN072: unicidade GLOBAL de slug (não só por organização) — reserva o
  -- endereço inventto.app/{slug}. Nullable até o vendedor definir (VIT-03).
  slug text,
  whatsapp text,
  instagram text,
  facebook text,
  website text,

  -- Paleta, logo_url, cover_url, layout, card_style — preenchidos em VIT-04.
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

CREATE INDEX idx_storefronts_org ON public.storefronts(organization_id);

CREATE TRIGGER handle_updated_at_storefronts
BEFORE UPDATE ON public.storefronts
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- 2. RLS — RF028: leitura para membros da org; escrita só Manager/Owner.
-- Acesso público de leitura (telas públicas do storefront) é de outro
-- wireframe/módulo, via RPC get_public_* — não abrir SELECT anônimo aqui.
-- ==============================================================================
ALTER TABLE public.storefronts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view storefronts" ON public.storefronts
FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Managers can create storefronts" ON public.storefronts
FOR INSERT WITH CHECK (public.has_role(organization_id, 'manager'));

CREATE POLICY "Managers can update storefronts" ON public.storefronts
FOR UPDATE USING (public.has_role(organization_id, 'manager'));

CREATE POLICY "Managers can delete storefronts" ON public.storefronts
FOR DELETE USING (public.has_role(organization_id, 'manager'));

-- ==============================================================================
-- 3. SET_STOREFRONT_PUBLISHED (VIT-01)
-- Usada por "Despublicar" na lista. A validação de pré-requisitos (RN075)
-- para publicar fica em VIT-02 — esta função só grava o estado.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_storefront_published(
  p_id UUID,
  p_published BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.storefronts
  WHERE id = p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem publicar/despublicar vitrines.';
  END IF;

  UPDATE public.storefronts
  SET
    status = CASE WHEN p_published THEN 'active' ELSE 'inactive' END::public.storefront_status,
    published_at = CASE WHEN p_published THEN now() ELSE published_at END
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_storefront_published(UUID, BOOLEAN) TO authenticated;
