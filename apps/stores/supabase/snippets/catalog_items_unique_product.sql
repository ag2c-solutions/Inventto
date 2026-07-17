-- CAT-03 — impede duplicar o mesmo produto/variante no catálogo (trata variant_id nulo).
CREATE UNIQUE INDEX IF NOT EXISTS catalog_items_unique_product_no_variant
  ON public.catalog_items (catalog_id, product_id) WHERE variant_id IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS catalog_items_unique_product_variant
  ON public.catalog_items (catalog_id, product_id, variant_id) WHERE variant_id IS NOT NULL;
