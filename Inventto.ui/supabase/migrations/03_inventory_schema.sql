-- ==============================================================================
-- 03_INVENTORY_SCHEMA.SQL
-- Módulo: Catálogo, Estoque e Atributos
-- Dependência: 02_security_helpers.sql
-- Status: FINAL (Org Attributes via organization_attributes; Product Snapshot)
-- ==============================================================================

-- 1. Categorias (Vinculadas à Organização)
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 2. Produtos
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sku text NOT NULL,
  is_active boolean DEFAULT true,
  has_variants boolean DEFAULT false,
  stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 0,
  cost_price numeric(10, 2) DEFAULT 0,

  -- Rastreio de linhagem entre unidades (RF021/RN048). Identifica a "família" do produto
  -- (raiz original compartilhada entre todas as cópias importadas). Setado pelo trigger
  -- trg_set_product_family_id: originais recebem o próprio id; importados herdam da origem.
  product_family_id uuid REFERENCES public.products(id) ON DELETE SET NULL,

  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT products_pkey PRIMARY KEY (id)
);
-- SKU único por organização (RN038), ignorando soft-deletes — espelha as variantes.
CREATE UNIQUE INDEX idx_products_sku_active ON public.products (organization_id, sku) WHERE deleted_at IS NULL;
-- Prevenção de duplicidade na importação (RN048): uma mesma família de produto só pode
-- existir uma vez por organização destino. Cobre linhagem multi-nível.
CREATE UNIQUE INDEX idx_products_family_per_org ON public.products (organization_id, product_family_id) WHERE product_family_id IS NOT NULL AND deleted_at IS NULL;
-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER handle_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();
-- Trigger para auto-popular product_family_id: originais recebem o próprio id.
CREATE OR REPLACE FUNCTION public.set_product_family_id()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.product_family_id IS NULL THEN
    NEW.product_family_id := NEW.id;
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_set_product_family_id
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_product_family_id();

-- 3. Categorias do Produto (Pivô)
CREATE TABLE public.product_categories (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  
  CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id)
);

-- 4. Atributos do Produto (SNAPSHOT COMPLETO)
-- Tabela independente. Não possui FK para 'attributes'.
-- Armazena a cópia fiel (snapshot) do atributo no momento da criação/edição.
CREATE TABLE public.product_attributes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE, -- Necessário para RLS
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  
  label text NOT NULL,
  slug text NOT NULL,
  type text NOT NULL,
  "values" jsonb DEFAULT '[]'::jsonb,

  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),

  CONSTRAINT product_attributes_pkey PRIMARY KEY (id),
  -- Garante que não existam dois atributos com o mesmo slug no mesmo produto
  CONSTRAINT unique_product_attribute_slug UNIQUE (product_id, slug)
);
CREATE TRIGGER handle_updated_at_prod_attrs BEFORE UPDATE ON public.product_attributes FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 5. Variantes do Produto
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sku text NOT NULL,
  options jsonb NOT NULL, -- Ex: [{"name": "Cor", "value": "Azul"}, {"name": "Tamanho", "value": "G"}]
  stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 0,
  cost_price numeric(10, 2) DEFAULT 0,
  is_active boolean DEFAULT true,

  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT product_variants_pkey PRIMARY KEY (id)
);
-- Índice único para SKU apenas se não estiver deletado (Soft Delete)
CREATE UNIQUE INDEX idx_variants_sku_active ON public.product_variants (organization_id, sku) WHERE deleted_at IS NULL;

-- 6. Imagens do Produto
CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  name text NOT NULL,
  type text NOT NULL DEFAULT 'image/png',
  public_id text, -- ID externo (Cloudinary/S3)
  is_primary boolean DEFAULT false,
  
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT product_images_pkey PRIMARY KEY (id)
);

-- 7. Imagens da Variante (Pivô)
CREATE TABLE public.product_variant_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES public.product_images(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  
  CONSTRAINT product_variant_images_pkey PRIMARY KEY (id),
  CONSTRAINT unique_variant_image UNIQUE (variant_id, image_id)
);

-- 8. (removido — PROD-10) A view products_view_sales bypassava a RLS de products
-- sem filtro de organização (RN017) e não tinha consumidor. A leitura do papel
-- Sales é via RPCs sanitizadas em 07_rpc_functions.sql (RN057).


-- ==============================================================================
-- 2. SEGURANÇA (RLS & POLICIES)
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_images ENABLE ROW LEVEL SECURITY;

-- --- Policies Baseadas na Organização ---
CREATE POLICY "Members can view categories" ON public.categories FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Members can view product attributes" ON public.product_attributes FOR SELECT USING (public.is_org_member(organization_id));
-- PROD-10 · RN057: variantes carregam cost_price — leitura direta só Manager/Owner
-- (o papel Sales lê via RPCs sanitizadas em 07_rpc_functions.sql).
CREATE POLICY "Managers can view variants" ON public.product_variants
FOR SELECT USING (
  public.is_org_member(organization_id)
  AND public.has_role(organization_id, 'manager')
);
CREATE POLICY "Members can view images" ON public.product_images FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Managers can view full products" ON public.products 
FOR SELECT USING (
  public.is_org_member(organization_id) 
  AND public.has_role(organization_id, 'manager') 
);

-- --- Policies de Escrita (Managers) ---
-- Categorias na v1 são create-only/rename — exclusão é proibida (RN046).
CREATE POLICY "Managers can create categories" ON public.categories FOR INSERT WITH CHECK (public.has_role(organization_id, 'manager'));
CREATE POLICY "Managers can update categories" ON public.categories FOR UPDATE USING (public.has_role(organization_id, 'manager'));
CREATE POLICY "Managers can manage products" ON public.products FOR ALL USING (public.has_role(organization_id, 'manager'));
CREATE POLICY "Managers can manage product attributes" ON public.product_attributes FOR ALL USING (public.has_role(organization_id, 'manager'));
CREATE POLICY "Managers can manage variants" ON public.product_variants FOR ALL USING (public.has_role(organization_id, 'manager'));
CREATE POLICY "Managers can manage images" ON public.product_images FOR ALL USING (public.has_role(organization_id, 'manager'));

-- --- Policies para Tabelas Pivô (Verificação Indireta) ---
CREATE POLICY "Members can view product_cats" ON public.product_categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_categories.product_id AND public.is_org_member(organization_id))
);

CREATE POLICY "Members can view variant_imgs" ON public.product_variant_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.product_variants WHERE id = product_variant_images.variant_id AND public.is_org_member(organization_id))
);