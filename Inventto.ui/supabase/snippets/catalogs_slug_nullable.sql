-- CAT-01 · RN058-RN059 — catálogo canal-agnóstico é criado só com nome (Dialog sem slug).
-- Remove o NOT NULL de catalogs.slug (mantém coluna + UNIQUE — nulos não colidem —
-- para o Storefront/Vitrines realocar depois).
ALTER TABLE public.catalogs ALTER COLUMN slug DROP NOT NULL;
