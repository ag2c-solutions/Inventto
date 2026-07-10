-- ==============================================================================
-- 05_SALES_SCHEMA.SQL
-- Módulo: Vendas, Pedidos e Catálogos
-- Dependências: 03_inventory_schema.sql (Produtos) e 04_crm_customers.sql (Clientes)
-- ==============================================================================

-- ==============================================================================
-- 1. TABELA CATALOGS (Canais de Venda Personalizados)
-- ==============================================================================
CREATE TABLE public.catalogs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  slug text, -- nullable: catálogo canal-agnóstico (CAT-01); reservado ao Storefront/Vitrines (Módulo 8)
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT catalogs_pkey     PRIMARY KEY (id),
  CONSTRAINT catalogs_slug_key UNIQUE (slug)
);

CREATE TRIGGER handle_updated_at_catalogs
BEFORE UPDATE ON public.catalogs
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- PDV-01 · RN065: vínculo do catálogo do PDV, coluna criada em 01_base_tables.sql.
-- ON DELETE SET NULL: se o catálogo vinculado for removido, o PDV cai no bloqueio
-- (mesma postura do guard RN061 de CAT-04) em vez de referenciar um catálogo morto.
ALTER TABLE public.organizations
  ADD CONSTRAINT organizations_pdv_catalog_id_fkey
  FOREIGN KEY (pdv_catalog_id) REFERENCES public.catalogs(id) ON DELETE SET NULL;

-- ==============================================================================
-- 2. TABELA CATALOG_ITEMS (Preços Específicos por Catálogo)
-- ==============================================================================
CREATE TABLE public.catalog_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  catalog_id uuid NOT NULL REFERENCES public.catalogs(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE CASCADE,

  price numeric(10, 2) NOT NULL,
  original_price numeric(10, 2), -- CAT-03 · RN063: promoção opcional

  CONSTRAINT catalog_items_pkey PRIMARY KEY (id)
);

-- CAT-03 · impede duplicar o mesmo produto/variante no catálogo (trata variant_id nulo).
CREATE UNIQUE INDEX catalog_items_unique_product_no_variant
  ON public.catalog_items (catalog_id, product_id) WHERE variant_id IS NULL;
CREATE UNIQUE INDEX catalog_items_unique_product_variant
  ON public.catalog_items (catalog_id, product_id, variant_id) WHERE variant_id IS NOT NULL;

-- ==============================================================================
-- 3. TABELA ORDERS (Pedidos)
-- ==============================================================================
CREATE TABLE public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id),
  customer_id uuid NOT NULL REFERENCES public.customers(id),
  seller_id uuid REFERENCES public.profiles(id),
  
  customer_name_snapshot text,
  customer_phone_snapshot text,
  
  channel public.sale_channel NOT NULL DEFAULT 'whatsapp_direct',
  catalog_id uuid REFERENCES public.catalogs(id) ON DELETE SET NULL,
  
  status public.order_status DEFAULT 'pending',
  total_amount numeric(10, 2) DEFAULT 0,
  
  expires_at timestamp with time zone, 
  
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT orders_pkey PRIMARY KEY (id)
);

CREATE TRIGGER handle_updated_at_orders 
BEFORE UPDATE ON public.orders 
FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ==============================================================================
-- 4. TABELA ORDER_ITEMS (Itens do Pedido)
-- ==============================================================================
CREATE TABLE public.order_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  
  product_id uuid REFERENCES public.products(id) ON DELETE SET NULL,
  variant_id uuid REFERENCES public.product_variants(id) ON DELETE SET NULL,
  
  quantity integer NOT NULL,
  unit_price numeric(10, 2) NOT NULL,
  
  product_name_snapshot text,
  
  CONSTRAINT order_items_pkey PRIMARY KEY (id)
);

-- ==============================================================================
-- 5. ÍNDICES DE PERFORMANCE
-- ==============================================================================
-- Orders
CREATE INDEX idx_orders_org ON public.orders(organization_id);
CREATE INDEX idx_orders_customer ON public.orders(customer_id);
CREATE INDEX idx_orders_seller ON public.orders(seller_id);

-- Order Items
CREATE INDEX idx_order_items_order_id ON public.order_items(order_id);
CREATE INDEX idx_order_items_product_id ON public.order_items(product_id);

-- ==============================================================================
-- 6. SEGURANÇA (RLS)
-- ==============================================================================

ALTER TABLE public.catalogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- 6.1. CATÁLOGOS (Leitura para todos os membros; escrita restrita a Manager/Owner — RN062)
CREATE POLICY "Members can view catalogs" ON public.catalogs
FOR SELECT USING (public.is_org_member(organization_id));

CREATE POLICY "Managers can create catalogs" ON public.catalogs
FOR INSERT WITH CHECK (public.has_role(organization_id, 'manager'));

CREATE POLICY "Managers can update catalogs" ON public.catalogs
FOR UPDATE USING (public.has_role(organization_id, 'manager'));

CREATE POLICY "Managers can delete catalogs" ON public.catalogs
FOR DELETE USING (public.has_role(organization_id, 'manager'));

CREATE POLICY "Members can view catalog items" ON public.catalog_items
FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.catalogs WHERE id = catalog_items.catalog_id AND public.is_org_member(organization_id))
);

CREATE POLICY "Managers can create catalog items" ON public.catalog_items
FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.catalogs WHERE id = catalog_items.catalog_id AND public.has_role(organization_id, 'manager'))
);

CREATE POLICY "Managers can update catalog items" ON public.catalog_items
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.catalogs WHERE id = catalog_items.catalog_id AND public.has_role(organization_id, 'manager'))
);

CREATE POLICY "Managers can delete catalog items" ON public.catalog_items
FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.catalogs WHERE id = catalog_items.catalog_id AND public.has_role(organization_id, 'manager'))
);

-- 6.2. ORDERS (Regra Condicional V9.3: Manager vê tudo, Sales vê suas ou do site)
CREATE POLICY "Access Control for Orders" ON public.orders
FOR SELECT USING (
  public.is_org_member(organization_id)
  AND (
    public.has_role(organization_id, 'manager')
    OR
    seller_id = auth.uid()
    OR
    channel = 'catalog_store' 
  )
);

-- 6.3. ORDER ITEMS (Herança de Visibilidade)
CREATE POLICY "Inherit visibility from Orders" ON public.order_items
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.orders 
    WHERE public.orders.id = public.order_items.order_id
  )
);

-- 6.4. ESCRITA BLOQUEADA
-- Insert/Update deve ser feito via RPC (create_order) para garantir consistência de estoque.