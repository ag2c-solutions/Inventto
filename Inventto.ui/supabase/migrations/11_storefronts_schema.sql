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

-- ==============================================================================
-- 4. RESERVED_SLUGS (VIT-02 · RN073)
-- Quarentena de 30 dias: ao remover uma vitrine, o slug fica reservado
-- antes de poder ser reutilizado por qualquer organização. A checagem de
-- disponibilidade de slug (VIT-03) consulta esta tabela.
-- ==============================================================================
CREATE TABLE public.reserved_slugs (
  slug text NOT NULL,
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  released_at timestamp with time zone NOT NULL,
  CONSTRAINT reserved_slugs_pkey PRIMARY KEY (slug)
);

-- Leitura ampla (checagem de disponibilidade de slug independe de org —
-- RN072 é unicidade global); escrita só pelas RPCs SECURITY DEFINER abaixo.
ALTER TABLE public.reserved_slugs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view reserved slugs" ON public.reserved_slugs
FOR SELECT TO authenticated USING (true);

-- ==============================================================================
-- 5. PUBLISH_STOREFRONT (VIT-02 · RN075)
-- Recomputa os pré-requisitos no servidor (fonte de verdade — a checagem no
-- client é só UX): catálogo vinculado, WhatsApp definido no storefront,
-- timezone e ao menos um dia com horário definidos na organização.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.publish_storefront(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_catalog_id UUID;
  v_whatsapp TEXT;
  v_settings JSONB;
  v_timezone TEXT;
  v_has_open_day BOOLEAN;
  v_missing TEXT[] := '{}';
BEGIN
  SELECT organization_id, catalog_id, whatsapp
  INTO v_org_id, v_catalog_id, v_whatsapp
  FROM public.storefronts
  WHERE id = p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem publicar vitrines.';
  END IF;

  IF v_catalog_id IS NULL THEN
    v_missing := array_append(v_missing, 'catalog');
  END IF;

  IF v_whatsapp IS NULL OR trim(v_whatsapp) = '' THEN
    v_missing := array_append(v_missing, 'whatsapp');
  END IF;

  SELECT settings INTO v_settings FROM public.organizations WHERE id = v_org_id;
  v_timezone := v_settings->'operational'->>'timezone';

  SELECT EXISTS (
    SELECT 1
    FROM jsonb_each(COALESCE(v_settings->'schedule', '{}'::jsonb)) AS day(key, value)
    WHERE (value->>'is_open')::boolean IS TRUE
  ) INTO v_has_open_day;

  IF v_timezone IS NULL OR trim(v_timezone) = '' OR NOT v_has_open_day THEN
    v_missing := array_append(v_missing, 'hours');
  END IF;

  IF array_length(v_missing, 1) > 0 THEN
    -- Marcador estável com o payload das chaves faltantes, mapeado pela UI
    -- pra abrir o PublishDialog (a UI já deriva a mesma lista localmente a
    -- partir de storefront+settings, mas o servidor é a fonte de verdade).
    RAISE EXCEPTION 'STOREFRONT_PREREQS_MISSING:%', array_to_string(v_missing, ',');
  END IF;

  UPDATE public.storefronts
  SET status = 'active', published_at = now()
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.publish_storefront(UUID) TO authenticated;

-- ==============================================================================
-- 6. REMOVE_STOREFRONT (VIT-02 · RN073)
-- Remove a vitrine e reserva o slug por 30 dias (quarentena) antes de poder
-- ser reutilizado.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.remove_storefront(p_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_slug TEXT;
BEGIN
  SELECT organization_id, slug INTO v_org_id, v_slug
  FROM public.storefronts
  WHERE id = p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem remover vitrines.';
  END IF;

  IF v_slug IS NOT NULL THEN
    INSERT INTO public.reserved_slugs (slug, organization_id, released_at)
    VALUES (v_slug, v_org_id, now() + interval '30 days')
    ON CONFLICT (slug) DO UPDATE SET released_at = EXCLUDED.released_at;
  END IF;

  DELETE FROM public.storefronts WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.remove_storefront(UUID) TO authenticated;

-- ==============================================================================
-- 7. CHECK_SLUG_AVAILABLE (VIT-03 · RN072/RN073)
-- Formato, palavras reservadas (rotas do app), unicidade GLOBAL (não só na
-- org) e quarentena (reserved_slugs, VIT-02). SECURITY DEFINER porque a
-- unicidade global precisa enxergar vitrines de OUTRAS orgs, fora do
-- alcance de RLS ("Members can view storefronts").
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_slug_available(
  p_slug TEXT,
  p_storefront_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  -- Rotas do app (app/routers) + termos de sistema — mantido espelhado com
  -- RESERVED_SLUGS em domain/validators no client.
  v_reserved TEXT[] := ARRAY[
    'auth', 'admin', 'api', 'app', 'login', 'signup', 'onboarding',
    'storefronts', 'settings', 'team', 'products', 'movements', 'catalogos',
    'pdv', 'dashboard', 'novo'
  ];
BEGIN
  IF p_slug IS NULL
    OR p_slug !~ '^[a-z0-9]+(-[a-z0-9]+)*$'
    OR length(p_slug) < 3
    OR length(p_slug) > 50
    OR p_slug = ANY(v_reserved)
  THEN
    RETURN jsonb_build_object('available', false, 'reason', 'invalid');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.storefronts
    WHERE slug = p_slug AND (p_storefront_id IS NULL OR id != p_storefront_id)
  ) THEN
    RETURN jsonb_build_object('available', false, 'reason', 'taken');
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.reserved_slugs
    WHERE slug = p_slug AND released_at > now()
  ) THEN
    RETURN jsonb_build_object('available', false, 'reason', 'reserved');
  END IF;

  RETURN jsonb_build_object('available', true, 'reason', 'ok');
END;
$$;

GRANT EXECUTE ON FUNCTION public.check_slug_available(TEXT, UUID) TO authenticated;

-- ==============================================================================
-- 8. CREATE_STOREFRONT (VIT-03)
-- Revalida o slug no servidor (não confia só no front). Aparência e
-- Comportamento (VIT-04/05) estendem esta mesma RPC via payload jsonb.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_storefront(payload JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID := (payload->>'organizationId')::uuid;
  v_slug TEXT := NULLIF(trim(payload->>'slug'), '');
  v_check JSONB;
  v_id UUID;
BEGIN
  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem criar vitrines.';
  END IF;

  IF v_slug IS NOT NULL THEN
    v_check := public.check_slug_available(v_slug, NULL);
    IF NOT (v_check->>'available')::boolean THEN
      RAISE EXCEPTION 'STOREFRONT_SLUG_UNAVAILABLE:%', v_check->>'reason';
    END IF;
  END IF;

  INSERT INTO public.storefronts (
    organization_id, name, catalog_id, slug, whatsapp, instagram, facebook, website,
    show_prices, show_sold_out, whatsapp_message
  ) VALUES (
    v_org_id,
    payload->>'name',
    NULLIF(payload->>'catalogId', '')::uuid,
    v_slug,
    NULLIF(payload->>'whatsapp', ''),
    NULLIF(payload->>'instagram', ''),
    NULLIF(payload->>'facebook', ''),
    NULLIF(payload->>'website', ''),
    COALESCE((payload->>'showPrices')::boolean, true),
    COALESCE((payload->>'showSoldOut')::boolean, true),
    NULLIF(payload->>'whatsappMessage', '')
  )
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_storefront(JSONB) TO authenticated;

-- ==============================================================================
-- 9. UPDATE_STOREFRONT (VIT-03 · RN073 · tema em VIT-04 · comportamento em VIT-05)
-- Revalida o slug no servidor. Ao TROCAR o slug, o antigo entra em
-- quarentena de 30 dias (mesmo mecanismo de remove_storefront).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_storefront(p_id UUID, payload JSONB)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_old_slug TEXT;
  v_new_slug TEXT := NULLIF(trim(payload->>'slug'), '');
  v_check JSONB;
BEGIN
  SELECT organization_id, slug INTO v_org_id, v_old_slug
  FROM public.storefronts
  WHERE id = p_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem editar vitrines.';
  END IF;

  IF v_new_slug IS NOT NULL AND v_new_slug IS DISTINCT FROM v_old_slug THEN
    v_check := public.check_slug_available(v_new_slug, p_id);
    IF NOT (v_check->>'available')::boolean THEN
      RAISE EXCEPTION 'STOREFRONT_SLUG_UNAVAILABLE:%', v_check->>'reason';
    END IF;
  END IF;

  UPDATE public.storefronts SET
    name = COALESCE(payload->>'name', name),
    catalog_id = NULLIF(payload->>'catalogId', '')::uuid,
    slug = COALESCE(v_new_slug, v_old_slug),
    whatsapp = NULLIF(payload->>'whatsapp', ''),
    instagram = NULLIF(payload->>'instagram', ''),
    facebook = NULLIF(payload->>'facebook', ''),
    website = NULLIF(payload->>'website', ''),
    -- VIT-04: bloco de tema (paleta/logo/capa/layout/estilo de card). '->'
    -- (não '->>') porque o valor gravado é jsonb, não texto.
    theme = COALESCE(payload->'theme', theme),
    -- VIT-05 · RN076: exibição de preços/esgotados + mensagem de WhatsApp.
    show_prices = COALESCE((payload->>'showPrices')::boolean, show_prices),
    show_sold_out = COALESCE((payload->>'showSoldOut')::boolean, show_sold_out),
    whatsapp_message = NULLIF(payload->>'whatsappMessage', '')
  WHERE id = p_id;

  IF v_old_slug IS NOT NULL AND v_new_slug IS NOT NULL AND v_new_slug IS DISTINCT FROM v_old_slug THEN
    INSERT INTO public.reserved_slugs (slug, organization_id, released_at)
    VALUES (v_old_slug, v_org_id, now() + interval '30 days')
    ON CONFLICT (slug) DO UPDATE SET released_at = EXCLUDED.released_at;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_storefront(UUID, JSONB) TO authenticated;

-- ==============================================================================
-- 10. STOREFRONT_FEATURED_PRODUCTS (VIT-05 · RN077)
-- Destaque é por storefront (não por catálogo): a mesma vitrine que
-- compartilha catálogo com outra pode destacar produtos diferentes.
-- Granularidade por produto (o wireframe lista por SKU, não por variante);
-- variant_id fica disponível para uso futuro mas não é exposto na UI v1.
-- ==============================================================================
CREATE TABLE public.storefront_featured_products (
  storefront_id uuid NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  -- Ordem de destaque no topo da vitrine — sem UI de reordenar na v1
  -- (fica pronta para quando existir), então cai na ordem de inserção.
  position int,
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT storefront_featured_products_pkey PRIMARY KEY (storefront_id, product_id)
);

ALTER TABLE public.storefront_featured_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can view featured products" ON public.storefront_featured_products
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.storefronts s
    WHERE s.id = storefront_id AND public.is_org_member(s.organization_id)
  )
);
-- Escrita só pela RPC SECURITY DEFINER abaixo — sem policy de INSERT/DELETE.

-- ==============================================================================
-- 11. SET_STOREFRONT_FEATURE (VIT-05 · RN077/RN059)
-- Liga/desliga o destaque de um produto nesta vitrine. Ao ligar, exige que
-- o produto esteja no catálogo vinculado ao storefront (RN059) — coerência
-- entre o que a vitrine vende e o que ela pode destacar.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_storefront_feature(
  p_storefront_id UUID,
  p_product_id UUID,
  p_variant_id UUID DEFAULT NULL,
  p_on BOOLEAN DEFAULT true
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_catalog_id UUID;
BEGIN
  SELECT organization_id, catalog_id INTO v_org_id, v_catalog_id
  FROM public.storefronts
  WHERE id = p_storefront_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Vitrine não encontrada.';
  END IF;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem destacar produtos.';
  END IF;

  IF p_on THEN
    IF v_catalog_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.catalog_items
      WHERE catalog_id = v_catalog_id
        AND product_id = p_product_id
        AND variant_id IS NOT DISTINCT FROM p_variant_id
    ) THEN
      RAISE EXCEPTION 'Este produto não pertence ao catálogo vinculado a esta vitrine.';
    END IF;

    INSERT INTO public.storefront_featured_products (storefront_id, product_id, variant_id)
    VALUES (p_storefront_id, p_product_id, p_variant_id)
    ON CONFLICT (storefront_id, product_id) DO NOTHING;
  ELSE
    DELETE FROM public.storefront_featured_products
    WHERE storefront_id = p_storefront_id AND product_id = p_product_id;
  END IF;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_storefront_feature(UUID, UUID, UUID, BOOLEAN) TO authenticated;
