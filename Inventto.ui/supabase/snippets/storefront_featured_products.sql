-- VIT-05 · RN077: reflete a tabela storefront_featured_products em 11_storefronts_schema.sql.
-- Depende de storefronts_table.sql, 03_inventory_schema.sql (products/product_variants).
CREATE TABLE public.storefront_featured_products (
  storefront_id uuid NOT NULL REFERENCES public.storefronts(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
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
