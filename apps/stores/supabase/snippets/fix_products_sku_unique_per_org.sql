-- PROD-03 · RN038 — SKU único por organização (não global).
-- Remove o UNIQUE global de products.sku e cria índice parcial por organização,
-- espelhando product_variants (idx_variants_sku_active).

-- 1. Descobre e remove a constraint UNIQUE global de products.sku (nome gerado pelo Postgres).
DO $$
DECLARE
  v_constraint text;
BEGIN
  SELECT conname INTO v_constraint
  FROM pg_constraint
  WHERE conrelid = 'public.products'::regclass
    AND contype = 'u'
    AND conkey = ARRAY[
      (SELECT attnum FROM pg_attribute
       WHERE attrelid = 'public.products'::regclass AND attname = 'sku')
    ];

  IF v_constraint IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.products DROP CONSTRAINT %I', v_constraint);
  END IF;
END $$;

-- 2. Índice único parcial por organização (ignora soft-deletes).
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_sku_active
  ON public.products (organization_id, sku)
  WHERE deleted_at IS NULL;
