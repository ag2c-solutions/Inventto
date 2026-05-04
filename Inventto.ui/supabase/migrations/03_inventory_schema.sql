-- ==============================================================================
-- 03_INVENTORY_SCHEMA.SQL
-- Módulo: Catálogo, Estoque e Atributos
-- Dependência: 02_security_helpers.sql
-- Status: FINAL (Global Dictionary + Product Snapshot)
-- ==============================================================================

-- 1. Tabela Global de Atributos (Dicionário do Sistema)
-- Esta tabela é pública/global e serve apenas como catálogo de sugestões.
CREATE TABLE public.attributes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  label text NOT NULL,        -- Ex: "Cor", "Tamanho"
  slug text NOT NULL UNIQUE,  -- Ex: "cor", "text-sizing"
  type text NOT NULL,         -- Ex: "color", "select", "number"
  "values" jsonb DEFAULT '[]'::jsonb, -- Valores padrão sugeridos
  
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT attributes_pkey PRIMARY KEY (id)
);

-- 2. Categorias (Vinculadas à Organização)
CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

-- 3. Produtos
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  sku text NOT NULL UNIQUE,
  is_active boolean DEFAULT true,
  has_variants boolean DEFAULT false,
  stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 5,
  cost_price numeric(10, 2) DEFAULT 0,
  
  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT products_pkey PRIMARY KEY (id)
);
-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER handle_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- 4. Categorias do Produto (Pivô)
CREATE TABLE public.product_categories (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  
  CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id)
);

-- 5. Atributos do Produto (SNAPSHOT COMPLETO)
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

-- 6. Variantes do Produto
CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  options jsonb NOT NULL, -- Ex: [{"name": "Cor", "value": "Azul"}, {"name": "Tamanho", "value": "G"}]
  stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 5,
  cost_price numeric(10, 2) DEFAULT 0,
  is_active boolean DEFAULT true,

  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT product_variants_pkey PRIMARY KEY (id)
);
-- Índice único para SKU apenas se não estiver deletado (Soft Delete)
CREATE UNIQUE INDEX idx_variants_sku_active ON public.product_variants (organization_id, sku) WHERE deleted_at IS NULL;

-- 7. Imagens do Produto
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

-- 8. Imagens da Variante (Pivô)
CREATE TABLE public.product_variant_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES public.product_images(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  
  CONSTRAINT product_variant_images_pkey PRIMARY KEY (id),
  CONSTRAINT unique_variant_image UNIQUE (variant_id, image_id)
);

-- 9. View Segura: Produtos para Vendedores (Sem Cost Price)
CREATE OR REPLACE VIEW public.products_view_sales AS
SELECT 
  id,
  organization_id,
  name,
  description,
  sku,
  is_active,
  has_variants,
  stock,
  minimum_stock,
  created_at,
  updated_at
FROM public.products
WHERE deleted_at IS NULL;
GRANT SELECT ON public.products_view_sales TO authenticated;


-- ==============================================================================
-- 2. SEGURANÇA (RLS & POLICIES)
-- ==============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_images ENABLE ROW LEVEL SECURITY;

-- --- Policies para 'attributes' (Global) ---
-- Leitura pública para todos os usuários autenticados (ou anônimos, se desejado, mas aqui usamos authenticated)
CREATE POLICY "Everyone can view system attributes" ON public.attributes FOR SELECT USING (true);
-- Ninguém edita attributes via API (apenas via Super Admin/Seed direto no banco)
-- (Nenhuma policy de INSERT/UPDATE/DELETE criada implica em acesso negado padrão)

-- --- Policies Baseadas na Organização ---
CREATE POLICY "Members can view categories" ON public.categories FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Members can view product attributes" ON public.product_attributes FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Members can view variants" ON public.product_variants FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Members can view images" ON public.product_images FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Managers can view full products" ON public.products 
FOR SELECT USING (
  public.is_org_member(organization_id) 
  AND public.has_role(organization_id, 'manager') 
);

-- --- Policies de Escrita (Managers) ---
CREATE POLICY "Managers can manage categories" ON public.categories FOR ALL USING (public.has_role(organization_id, 'manager'));
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