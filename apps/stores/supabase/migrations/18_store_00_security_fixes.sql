-- ==============================================================================
-- 18_STORE_00_SECURITY_FIXES.SQL
-- Achados da auditoria STORE-00 (confirmar que nenhuma tabela consumida pelo
-- storefront abre acesso a anon) que não são sobre anon diretamente, mas
-- surgiram na varredura: uma tabela órfã sem RLS e um RPC público sem teto
-- de paginação.
-- Dependência: 06_movements_schema.sql, 17_storefront_public_rpcs.sql
-- ==============================================================================

-- ==============================================================================
-- 1. DROP INVENTORY_RESERVATIONS (tabela órfã, sem RLS)
-- Criada em 06_movements_schema.sql, nunca ganhou ENABLE ROW LEVEL SECURITY
-- nem policy alguma, e não é referenciada por nenhum RPC ou código de app —
-- a reserva de estoque real é public.stock_reservations (05_sales_schema.sql,
-- com RLS "Inherit visibility from Orders"). Fica exposta sem filtro nenhum
-- via Data API caso o schema `public` esteja habilitado; sem consumidor,
-- a correção é remover, não proteger.
-- ==============================================================================
DROP TABLE IF EXISTS public.inventory_reservations;

-- ==============================================================================
-- 2. GET_PUBLIC_STOREFRONT_PRODUCTS — teto de p_page_size
-- RPC pública (GRANT ... TO anon). p_page_size não tinha limite superior;
-- como a função retorna um único jsonb (não SETOF/TABLE), o `max_rows` do
-- PostgREST (config.toml) não se aplica aqui — um cliente anônimo podia
-- pedir p_page_size arbitrariamente grande e forçar a agregação do catálogo
-- inteiro numa chamada só. Clampa em 100 (a UI usa 24).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_public_storefront_products(
  p_slug text,
  p_category_id uuid DEFAULT NULL,
  p_page int DEFAULT 1,
  p_page_size int DEFAULT 24
)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_storefront_id uuid;
  v_catalog_id uuid;
  v_show_prices boolean;
  v_show_sold_out boolean;
  v_page_size int := LEAST(GREATEST(p_page_size, 1), 100);
  v_offset int := GREATEST(p_page - 1, 0) * v_page_size;
  v_items jsonb;
  v_total bigint;
  v_categories jsonb;
BEGIN
  SELECT id, catalog_id, show_prices, show_sold_out
  INTO v_storefront_id, v_catalog_id, v_show_prices, v_show_sold_out
  FROM public.storefronts
  WHERE slug = p_slug AND status = 'active';

  IF v_storefront_id IS NULL OR v_catalog_id IS NULL THEN
    RETURN jsonb_build_object('items', '[]'::jsonb, 'total', 0, 'categories', '[]'::jsonb);
  END IF;

  -- Categorias do catálogo inteiro (não filtradas por p_category_id — os
  -- chips precisam mostrar todas as opções pro cliente trocar de filtro),
  -- restritas a produtos ativos que de fato aparecem no catálogo.
  SELECT COALESCE(jsonb_agg(jsonb_build_object('id', cat.id, 'name', cat.name) ORDER BY cat.name), '[]'::jsonb)
  INTO v_categories
  FROM (
    SELECT DISTINCT c.id, c.name
    FROM public.categories c
    JOIN public.product_categories pc ON pc.category_id = c.id
    JOIN public.catalog_items ci ON ci.product_id = pc.product_id
    JOIN public.products p ON p.id = ci.product_id AND p.is_active = true AND p.deleted_at IS NULL
    WHERE ci.catalog_id = v_catalog_id
  ) cat;

  WITH base AS (
    SELECT
      ci.id AS catalog_item_id,
      ci.product_id,
      ci.variant_id,
      ci.price,
      ci.original_price,
      p.name,
      COALESCE(pv.minimum_stock, p.minimum_stock) AS minimum_stock,
      public.available_stock(ci.product_id, ci.variant_id) AS available,
      fp.position AS featured_position,
      COALESCE(
        (SELECT pi_img.url
           FROM public.product_variant_images pvi
           JOIN public.product_images pi_img ON pi_img.id = pvi.image_id
           WHERE pvi.variant_id = ci.variant_id AND pvi.is_primary = true
           LIMIT 1),
        (SELECT pi.url FROM public.product_images pi
           WHERE pi.product_id = ci.product_id AND pi.is_primary = true
           LIMIT 1),
        (SELECT pi.url FROM public.product_images pi
           WHERE pi.product_id = ci.product_id
           LIMIT 1)
      ) AS image_url
    FROM public.catalog_items ci
    JOIN public.products p
      ON p.id = ci.product_id AND p.is_active = true AND p.deleted_at IS NULL
    LEFT JOIN public.product_variants pv
      ON pv.id = ci.variant_id AND pv.is_active = true AND pv.deleted_at IS NULL
    LEFT JOIN public.storefront_featured_products fp
      ON fp.storefront_id = v_storefront_id
     AND fp.product_id = ci.product_id
     AND fp.variant_id IS NOT DISTINCT FROM ci.variant_id
    WHERE ci.catalog_id = v_catalog_id
      -- item aponta pra uma variante que precisa existir e estar ativa
      AND (ci.variant_id IS NULL OR pv.id IS NOT NULL)
      AND (
        p_category_id IS NULL OR EXISTS (
          SELECT 1 FROM public.product_categories pc
          WHERE pc.product_id = ci.product_id AND pc.category_id = p_category_id
        )
      )
  ),
  translated AS (
    SELECT *,
      CASE
        WHEN available <= 0 THEN 'esgotado'
        WHEN minimum_stock > 0 AND available <= minimum_stock THEN 'ultimas_pecas'
        ELSE 'disponivel'
      END AS availability
    FROM base
  ),
  visible AS (
    SELECT * FROM translated
    WHERE v_show_sold_out OR availability <> 'esgotado'
  ),
  paged AS (
    SELECT *, COUNT(*) OVER () AS total_count
    FROM visible
    ORDER BY (featured_position IS NULL), featured_position, name
    LIMIT v_page_size OFFSET v_offset
  )
  SELECT
    COALESCE(
      jsonb_agg(
        jsonb_build_object(
          'id', catalog_item_id,
          'productId', product_id,
          'variantId', variant_id,
          'name', name,
          'imageUrl', image_url,
          'price', CASE WHEN v_show_prices THEN price ELSE NULL END,
          'originalPrice', CASE WHEN v_show_prices THEN original_price ELSE NULL END,
          'availability', availability,
          'isFeatured', featured_position IS NOT NULL
        )
        ORDER BY (featured_position IS NULL), featured_position, name
      ),
      '[]'::jsonb
    ),
    COALESCE(MAX(total_count), 0)
  INTO v_items, v_total
  FROM paged;

  RETURN jsonb_build_object('items', v_items, 'total', v_total, 'categories', v_categories);
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_public_storefront_products(text, uuid, int, int) TO anon, authenticated;
