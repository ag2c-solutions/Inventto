-- ============================================================
-- MIGRAÇÃO INCREMENTAL — PROD-08 v2
-- Substitui source_product_id por product_family_id.
-- Execute sobre um banco já populado (seed-v2 rodado).
-- Seguro para rodar múltiplas vezes (idempotente).
-- ============================================================

BEGIN;

-- ============================================================
-- PASSO 1: Adicionar product_family_id (ainda com source_product_id vivo)
-- ============================================================
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS product_family_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

-- ============================================================
-- PASSO 2: BACKFILL via CTE recursiva
-- Sobe pela cadeia de source_product_id para encontrar a raiz
-- de cada família. Isso precisa acontecer ANTES do DROP COLUMN.
-- ============================================================
WITH RECURSIVE lineage AS (
  -- Âncora: produtos sem source_product_id são raízes (família = eles mesmos)
  SELECT id AS product_id, id AS family_root
  FROM public.products
  WHERE source_product_id IS NULL

  UNION ALL

  -- Recursão: desce pelos filhos, propagando a raiz
  SELECT p.id AS product_id, l.family_root
  FROM public.products p
  JOIN lineage l ON l.product_id = p.source_product_id
)
UPDATE public.products p
SET product_family_id = l.family_root
FROM lineage l
WHERE p.id = l.product_id
  AND p.product_family_id IS NULL; -- evita reprocessar se já populado

-- Garante que nenhum produto ficou sem família (fallback: auto-raiz)
UPDATE public.products
SET product_family_id = id
WHERE product_family_id IS NULL;

RAISE NOTICE '✅ Backfill de product_family_id concluído. Verificando...';

-- Verificação: mostra contagem por tipo de família
DO $$
DECLARE
  v_roots INT;
  v_copies INT;
BEGIN
  SELECT count(*) INTO v_roots FROM public.products WHERE product_family_id = id AND deleted_at IS NULL;
  SELECT count(*) INTO v_copies FROM public.products WHERE product_family_id <> id AND deleted_at IS NULL;
  RAISE NOTICE '   • Produtos raiz (family_id = id): %', v_roots;
  RAISE NOTICE '   • Produtos importados (family_id ≠ id): %', v_copies;
END $$;

-- ============================================================
-- PASSO 3: Criar índice único por família (antes de dropar o antigo)
-- ============================================================
DROP INDEX IF EXISTS public.idx_products_import_source;

CREATE UNIQUE INDEX IF NOT EXISTS idx_products_family_per_org
  ON public.products (organization_id, product_family_id)
  WHERE product_family_id IS NOT NULL AND deleted_at IS NULL;

-- ============================================================
-- PASSO 4: Remover source_product_id (dados já migrados acima)
-- ============================================================
ALTER TABLE public.products
  DROP COLUMN IF EXISTS source_product_id;

-- ============================================================
-- PASSO 5: Trigger para novos inserts
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_product_family_id()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.product_family_id IS NULL THEN
    NEW.product_family_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_product_family_id ON public.products;
CREATE TRIGGER trg_set_product_family_id
  BEFORE INSERT ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.set_product_family_id();

-- ============================================================
-- PASSO 6: Atualizar RPCs
-- ============================================================

-- 6.1 get_import_candidates: already_imported por família
DROP FUNCTION IF EXISTS public.get_import_candidates(UUID, UUID);
CREATE OR REPLACE FUNCTION public.get_import_candidates(
  p_source_org_id UUID,
  p_target_org_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  sku TEXT,
  already_imported BOOLEAN,
  image_url TEXT,
  image_public_id TEXT,
  variant_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_source_org_id = p_target_org_id THEN
    RAISE EXCEPTION 'A organização de origem deve ser diferente da organização de destino.';
  END IF;

  IF NOT public.is_org_member(p_source_org_id) OR NOT public.is_org_member(p_target_org_id) THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.sku,
    EXISTS (
      SELECT 1
      FROM public.products t
      WHERE t.organization_id = p_target_org_id
        AND t.product_family_id = p.product_family_id
        AND t.deleted_at IS NULL
    ) AS already_imported,
    img.url AS image_url,
    img.public_id AS image_public_id,
    (
      SELECT count(*)::int
      FROM public.product_variants pv
      WHERE pv.product_id = p.id AND pv.deleted_at IS NULL
    ) AS variant_count
  FROM public.products p
  LEFT JOIN LATERAL (
    SELECT pi.url, pi.public_id
    FROM public.product_images pi
    WHERE pi.product_id = p.id
    ORDER BY pi.is_primary DESC, pi.created_at ASC
    LIMIT 1
  ) img ON true
  WHERE p.organization_id = p_source_org_id
    AND p.deleted_at IS NULL
  ORDER BY p.name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_import_candidates(UUID, UUID) TO authenticated;

-- 6.2 get_source_product_variants: sem alterações, mas recriado para garantir consistência
DROP FUNCTION IF EXISTS public.get_source_product_variants(UUID, UUID);
CREATE OR REPLACE FUNCTION public.get_source_product_variants(
  p_source_org_id UUID,
  p_product_id UUID
)
RETURNS TABLE (
  id UUID,
  sku TEXT,
  options JSONB,
  image_url TEXT,
  image_public_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_org_member(p_source_org_id) THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  RETURN QUERY
  SELECT
    v.id,
    v.sku,
    v.options,
    img.url AS image_url,
    img.public_id AS image_public_id
  FROM public.product_variants v
  LEFT JOIN LATERAL (
    SELECT pi.url, pi.public_id
    FROM public.product_variant_images pvi
    JOIN public.product_images pi ON pi.id = pvi.image_id
    WHERE pvi.variant_id = v.id
    ORDER BY pvi.is_primary DESC
    LIMIT 1
  ) img ON true
  WHERE v.product_id = p_product_id
    AND v.organization_id = p_source_org_id
    AND v.deleted_at IS NULL
  ORDER BY v.sku ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_source_product_variants(UUID, UUID) TO authenticated;

-- 6.3 import_products: propaga product_family_id + dedupe por família
CREATE OR REPLACE FUNCTION public.import_products(
  p_source_org_id UUID,
  p_target_org_id UUID,
  p_product_ids UUID[]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_product RECORD;
  v_new_product_id UUID;
  v_new_sku TEXT;
  v_suffix INT;
  v_imported_count INT := 0;

  v_category RECORD;
  v_attr RECORD;
  v_image RECORD;
  v_variant RECORD;
  v_variant_image RECORD;
  v_new_category_id UUID;
  v_new_image_id UUID;
  v_new_variant_id UUID;
  image_id_map JSONB;
BEGIN
  IF p_source_org_id = p_target_org_id THEN
    RAISE EXCEPTION 'A organização de origem deve ser diferente da organização de destino.';
  END IF;

  IF NOT public.has_role(p_target_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes podem importar produtos.';
  END IF;

  IF NOT public.is_org_member(p_source_org_id) THEN
    RAISE EXCEPTION 'Acesso negado: você não pertence à organização de origem.';
  END IF;

  FOR v_source_product IN
    SELECT * FROM public.products
    WHERE id = ANY(p_product_ids)
      AND organization_id = p_source_org_id
      AND deleted_at IS NULL
  LOOP
    IF EXISTS (
      SELECT 1 FROM public.products
      WHERE organization_id = p_target_org_id
        AND product_family_id = v_source_product.product_family_id
        AND deleted_at IS NULL
    ) THEN
      CONTINUE;
    END IF;

    v_new_sku := v_source_product.sku;
    v_suffix := 1;
    WHILE EXISTS (
      SELECT 1 FROM public.products
      WHERE organization_id = p_target_org_id
        AND lower(sku) = lower(v_new_sku)
        AND deleted_at IS NULL
    ) LOOP
      v_new_sku := v_source_product.sku || '-' || v_suffix;
      v_suffix := v_suffix + 1;
    END LOOP;

    INSERT INTO public.products (
      organization_id, name, sku, description, has_variants,
      stock, minimum_stock, cost_price, is_active, product_family_id
    )
    VALUES (
      p_target_org_id,
      v_source_product.name,
      v_new_sku,
      v_source_product.description,
      v_source_product.has_variants,
      0, 0, 0, true,
      v_source_product.product_family_id
    )
    RETURNING id INTO v_new_product_id;

    FOR v_category IN
      SELECT c.name
      FROM public.product_categories pc
      JOIN public.categories c ON c.id = pc.category_id
      WHERE pc.product_id = v_source_product.id
    LOOP
      SELECT id INTO v_new_category_id
      FROM public.categories
      WHERE organization_id = p_target_org_id AND name = v_category.name
      LIMIT 1;

      IF v_new_category_id IS NULL THEN
        INSERT INTO public.categories (organization_id, name)
        VALUES (p_target_org_id, v_category.name)
        RETURNING id INTO v_new_category_id;
      END IF;

      INSERT INTO public.product_categories (product_id, category_id)
      VALUES (v_new_product_id, v_new_category_id)
      ON CONFLICT DO NOTHING;
    END LOOP;

    FOR v_attr IN
      SELECT label, slug, type, "values"
      FROM public.product_attributes
      WHERE product_id = v_source_product.id
    LOOP
      INSERT INTO public.product_attributes (organization_id, product_id, label, slug, type, "values")
      VALUES (p_target_org_id, v_new_product_id, v_attr.label, v_attr.slug, v_attr.type, v_attr."values");
    END LOOP;

    image_id_map := '{}'::JSONB;
    FOR v_image IN
      SELECT id, url, name, type, public_id, is_primary
      FROM public.product_images
      WHERE product_id = v_source_product.id
    LOOP
      INSERT INTO public.product_images (organization_id, product_id, url, name, type, public_id, is_primary)
      VALUES (p_target_org_id, v_new_product_id, v_image.url, v_image.name, v_image.type, v_image.public_id, v_image.is_primary)
      RETURNING id INTO v_new_image_id;
      image_id_map := image_id_map || jsonb_build_object(v_image.id::text, v_new_image_id);
    END LOOP;

    IF v_source_product.has_variants THEN
      FOR v_variant IN
        SELECT id, sku, options
        FROM public.product_variants
        WHERE product_id = v_source_product.id AND deleted_at IS NULL
      LOOP
        v_new_sku := v_variant.sku;
        v_suffix := 1;
        WHILE EXISTS (
          SELECT 1 FROM public.product_variants
          WHERE organization_id = p_target_org_id
            AND lower(sku) = lower(v_new_sku)
            AND deleted_at IS NULL
        ) LOOP
          v_new_sku := v_variant.sku || '-' || v_suffix;
          v_suffix := v_suffix + 1;
        END LOOP;

        INSERT INTO public.product_variants (
          organization_id, product_id, sku, options, stock, minimum_stock, cost_price, is_active
        )
        VALUES (
          p_target_org_id, v_new_product_id, v_new_sku, v_variant.options, 0, 0, 0, true
        )
        RETURNING id INTO v_new_variant_id;

        FOR v_variant_image IN
          SELECT image_id, is_primary
          FROM public.product_variant_images
          WHERE variant_id = v_variant.id
        LOOP
          v_new_image_id := (image_id_map->>(v_variant_image.image_id::text))::UUID;
          IF v_new_image_id IS NOT NULL THEN
            INSERT INTO public.product_variant_images (variant_id, image_id, is_primary)
            VALUES (v_new_variant_id, v_new_image_id, v_variant_image.is_primary)
            ON CONFLICT DO NOTHING;
          END IF;
        END LOOP;
      END LOOP;
    END IF;

    v_imported_count := v_imported_count + 1;
  END LOOP;

  RETURN v_imported_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_products(UUID, UUID, UUID[]) TO authenticated;

RAISE NOTICE '✅ Migração PROD-08 v2 concluída com sucesso!';

COMMIT;
