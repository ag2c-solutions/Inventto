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
  description text,
  document_number text,
  order_id uuid REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at timestamp with time zone DEFAULT now(),
  executed_at timestamp with time zone NOT NULL DEFAULT now(),

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
CREATE INDEX idx_movements_executed ON public.movements(executed_at DESC);

-- ==============================================================================
-- 5. SEGURANÇA (RLS)
-- ==============================================================================

ALTER TABLE public.movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movement_items ENABLE ROW LEVEL SECURITY;

-- [ALTERADO]: Visibilidade Granular
CREATE POLICY "Access control for movements" ON public.movements
FOR SELECT USING (
  -- Caso 1: É Gerente ou Dono? Vê tudo.
  public.has_role(organization_id, 'manager')
  OR
  -- Caso 2: É Vendedor? Vê apenas suas próprias movimentações.
  (public.is_org_member(organization_id) AND user_id = auth.uid())
);

-- Managers podem criar movimentações
CREATE POLICY "Managers can create movements" ON public.movements
FOR INSERT WITH CHECK (public.has_role(organization_id, 'manager'));

-- Sales também podem criar (Vendas)
CREATE POLICY "Sales can create movements" ON public.movements
FOR INSERT WITH CHECK (public.has_role(organization_id, 'sales'));

-- --- Policies para Items (Herança) ---
CREATE POLICY "Inherit movement access items" ON public.movement_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.movements
    WHERE id = movement_items.movement_id
    -- A policy de SELECT da movements já filtra quem pode ver o pai
  )
);

CREATE POLICY "Managers create items" ON public.movement_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.movements
    WHERE id = movement_id
    AND public.has_role(organization_id, 'manager')
  )
);

CREATE POLICY "Sales create items" ON public.movement_items
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.movements
    WHERE id = movement_id
    AND public.has_role(organization_id, 'sales')
  )
);