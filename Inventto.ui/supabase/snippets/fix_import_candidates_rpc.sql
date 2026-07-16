-- ============================================================
-- FIX — RPCs de importação (get_import_candidates / import_products)
-- referenciando a coluna antiga products.source_product_id, que foi
-- renomeada para product_family_id em bfeb168 (fix(products): replace
-- source_product_id with product_family_id for multi-level lineage
-- dedup — RN048). A migration 03_inventory_schema.sql já foi corrigida
-- na época, mas 07_rpc_functions.sql nunca acompanhou a mudança —
-- por isso get_import_candidates falha com:
--   {"code":"42703","message":"column t.source_product_id does not exist"}
--
-- Idempotente e seguro em produção: detecta se source_product_id ainda
-- existe (banco nunca migrado) e faz o rename + backfill completo nesse
-- caso; se a coluna já é product_family_id (banco já no schema atual),
-- pula direto para recriar as RPCs.
-- ============================================================

BEGIN;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'products' AND column_name = 'source_product_id'
  ) THEN
    RAISE NOTICE 'source_product_id encontrada — executando migração completa (rename + backfill).';

    -- PASSO 1: adicionar product_family_id (ainda com source_product_id vivo)
    ALTER TABLE public.products
      ADD COLUMN IF NOT EXISTS product_family_id uuid REFERENCES public.products(id) ON DELETE SET NULL;

    -- PASSO 2: backfill via CTE recursiva — sobe a cadeia de source_product_id
    -- até achar a raiz de cada família (precisa acontecer ANTES do DROP COLUMN).
    WITH RECURSIVE lineage AS (
      SELECT id AS product_id, id AS family_root
      FROM public.products
      WHERE source_product_id IS NULL

      UNION ALL

      SELECT p.id AS product_id, l.family_root
      FROM public.products p
      JOIN lineage l ON l.product_id = p.source_product_id
    )
    UPDATE public.products p
    SET product_family_id = l.family_root
    FROM lineage l
    WHERE p.id = l.product_id
      AND p.product_family_id IS NULL;

    -- Fallback: garante que nenhum produto ficou sem família.
    UPDATE public.products
    SET product_family_id = id
    WHERE product_family_id IS NULL;

    -- PASSO 3: índice único por família, substitui o índice antigo por source.
    DROP INDEX IF EXISTS public.idx_products_import_source;
    CREATE UNIQUE INDEX IF NOT EXISTS idx_products_family_per_org
      ON public.products (organization_id, product_family_id)
      WHERE product_family_id IS NOT NULL AND deleted_at IS NULL;

    -- PASSO 4: remove a coluna antiga (dados já migrados acima).
    ALTER TABLE public.products
      DROP COLUMN IF EXISTS source_product_id;
  ELSE
    RAISE NOTICE 'product_family_id já é a coluna vigente — pulando rename/backfill, só recriando as RPCs.';
  END IF;
END $$;

-- PASSO 5: trigger de auto-população em novos inserts (idempotente).
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
-- PASSO 6: RPCs — dedupe por família (não mais por pai direto)
-- ============================================================

-- 6.1 get_import_candidates
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
    -- Dedupe por família: já importado se existir na org destino
    -- qualquer produto com o mesmo product_family_id.
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

-- 6.2 import_products
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
    -- RN048: dedupe por família — bloqueia se a org destino já tem produto da mesma família.
    IF EXISTS (
      SELECT 1 FROM public.products
      WHERE organization_id = p_target_org_id
        AND product_family_id = v_source_product.product_family_id
        AND deleted_at IS NULL
    ) THEN
      CONTINUE;
    END IF;

    -- RN038: resolve colisão de SKU na org destino com sufixo incremental.
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

    -- Produto pai: estoque/custo SEMPRE zerados (RN039/RN047).
    INSERT INTO public.products (
      organization_id, name, sku, description, has_variants,
      -- Propaga a família: P3 (importado de P2) aponta para o mesmo
      -- product_family_id de P1 — resolve o bug de linhagem.
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

    -- Categorias: mapeadas por nome (find-or-create na org destino).
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

    -- Atributos (snapshot).
    FOR v_attr IN
      SELECT label, slug, type, "values"
      FROM public.product_attributes
      WHERE product_id = v_source_product.id
    LOOP
      INSERT INTO public.product_attributes (organization_id, product_id, label, slug, type, "values")
      VALUES (p_target_org_id, v_new_product_id, v_attr.label, v_attr.slug, v_attr.type, v_attr."values");
    END LOOP;

    -- Imagens (mantém vínculos de variante via mapa de ids).
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

    -- Variantes: SKU resolvido + estoque/custo zerados (RN039/RN047).
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

-- 6.3 get_source_product_variants — sem alterações de coluna, recriada só
-- para garantir consistência de definição no ambiente.
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

DO $$ BEGIN
  RAISE NOTICE '✅ Fix aplicado: get_import_candidates/import_products agora usam product_family_id.';
END $$;

COMMIT;
