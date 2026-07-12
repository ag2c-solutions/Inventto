-- PED-01 · reflete 05_sales_schema.sql
-- Reserva de estoque (RN080/RN086): disponível = stock − SUM(reservas ativas).
CREATE TABLE IF NOT EXISTS public.stock_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'released', 'consumed')),
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT stock_reservations_pkey PRIMARY KEY (id)
);

CREATE INDEX IF NOT EXISTS idx_stock_reservations_order_id ON public.stock_reservations(order_id);
CREATE INDEX IF NOT EXISTS idx_stock_reservations_product ON public.stock_reservations(product_id, variant_id) WHERE status = 'active';

ALTER TABLE public.stock_reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Inherit visibility from Orders" ON public.stock_reservations;
CREATE POLICY "Inherit visibility from Orders" ON public.stock_reservations
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders
    WHERE public.orders.id = public.stock_reservations.order_id
  )
);
