-- CAT-01 — editar o nome do catálogo (CAT-02) precisa gravar updated_at.
ALTER TABLE public.catalogs ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

DROP TRIGGER IF EXISTS handle_updated_at_catalogs ON public.catalogs;
CREATE TRIGGER handle_updated_at_catalogs
BEFORE UPDATE ON public.catalogs
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
