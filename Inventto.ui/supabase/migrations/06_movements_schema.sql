-- ==============================================================================
-- 06_MOVEMENTS_SCHEMA.SQL
-- Módulo: Controle de Estoque (Livro Razão) e Reservas
-- Dependências: 03_inventory_schema.sql e 05_sales_schema.sql
-- ==============================================================================

-- ==============================================================================
-- 1. TABELA INVENTORY_RESERVATIONS (Carrinho / Checkout)
-- ==============================================================================
CREATE TABLE public.inventory_reservations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  order_id uuid REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  quantity integer NOT NULL,  
  expires_at timestamp with time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT inventory_reservations_pkey PRIMARY KEY (id)
);

-- ==============================================================================
-- 2. TABELA MOVEMENTS (Audit Log de Estoque)
-- ==============================================================================
CREATE TABLE public.movements (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),  
  user_id uuid REFERENCES public.profiles(id), 
  type public.movement_type NOT NULL,
  reason text,
  document_number text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT movements_pkey PRIMARY KEY (id)
);

-- ==============================================================================
-- 3. TABELA MOVEMENT_ITEMS (Detalhes da Movimentação)
-- ==============================================================================
CREATE TABLE public.movement_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  movement_id uuid NOT NULL REFERENCES public.movements(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.products(id),
  variant_id uuid REFERENCES public.product_variants(id),
  quantity integer NOT NULL,
  unit_cost numeric(10, 2),
  unit_price numeric(10, 2),

  CONSTRAINT movement_items_pkey PRIMARY KEY (id)
);

-- ==============================================================================
-- 4. ÍNDICES DE PERFORMANCE
-- ==============================================================================
-- Reservas
CREATE INDEX idx_reservations_org ON public.inventory_reservations(organization_id);
CREATE INDEX idx_reservations_variant ON public.inventory_reservations(variant_id);

-- Movimentações
CREATE INDEX idx_movements_org ON public.movements(organization_id);
CREATE INDEX idx_movements_order ON public.movements(order_id);
CREATE INDEX idx_movements_created ON public.movements(created_at DESC);

-- ==============================================================================
-- 5. SEGURANÇA (RLS)
-- ==============================================================================

ALTER TABLE public.inventory_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_items ENABLE ROW LEVEL SECURITY;

-- 5.1. RESERVAS
CREATE POLICY "Members can view reservations" ON public.inventory_reservations
FOR SELECT USING (public.is_org_member(organization_id));

-- 5.2. MOVIMENTAÇÕES (Leitura)
CREATE POLICY "Members can view movements" ON public.movements
FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Members can view movement items" ON public.movement_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.movements 
    WHERE public.movements.id = public.movement_items.movement_id 
    AND public.is_org_member(public.movements.organization_id)
  )
);

-- 5.3. ESCRITA BLOQUEADA
-- Movimentações são críticas. Apenas a função create_stock_movement pode inserir aqui.