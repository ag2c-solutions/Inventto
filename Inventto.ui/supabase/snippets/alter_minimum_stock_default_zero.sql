-- PROD-03 · RN050 — estoque mínimo padrão 0 (era 5).
ALTER TABLE public.products ALTER COLUMN minimum_stock SET DEFAULT 0;
ALTER TABLE public.product_variants ALTER COLUMN minimum_stock SET DEFAULT 0;
