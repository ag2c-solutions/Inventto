-- CAT-03 · RN063 — preço original (promoção) é opcional na curadoria.
ALTER TABLE public.catalog_items ADD COLUMN IF NOT EXISTS original_price numeric(10, 2);
