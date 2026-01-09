-- ==============================================================================
-- 03_INVENTORY_SCHEMA.SQL
-- Módulo: Catálogo, Estoque e Atributos
-- Dependência: 02_security_helpers.sql
-- ==============================================================================

-- 1. TABELAS (Estrutura mantida igual)
CREATE TABLE public.attributes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES public.organizations(id) ON DELETE CASCADE,
  label text NOT NULL,
  slug text NOT NULL,
  type public.attribute_type NOT NULL DEFAULT 'text',
  "values" jsonb DEFAULT '[]'::jsonb,
  
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT attributes_pkey PRIMARY KEY (id),
  CONSTRAINT unique_attribute_slug_per_org UNIQUE (organization_id, slug)
);

CREATE TABLE public.categories (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  
  created_at timestamp with time zone DEFAULT now(),

  CONSTRAINT categories_pkey PRIMARY KEY (id)
);

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
CREATE TRIGGER handle_updated_at_products BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TABLE public.product_categories (
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  
  CONSTRAINT product_categories_pkey PRIMARY KEY (product_id, category_id)
);

CREATE TABLE public.product_attributes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  attribute_id uuid NOT NULL REFERENCES public.attributes(id) ON DELETE CASCADE,
  active_values jsonb,

  CONSTRAINT product_attributes_pkey PRIMARY KEY (id),
  CONSTRAINT unique_product_attribute UNIQUE (product_id, attribute_id)
);

CREATE TABLE public.product_variants (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  sku text NOT NULL UNIQUE,
  options jsonb NOT NULL,
  stock integer DEFAULT 0,
  minimum_stock integer DEFAULT 5,
  cost_price numeric(10, 2) DEFAULT 0,
  is_active boolean DEFAULT true,

  deleted_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT product_variants_pkey PRIMARY KEY (id)
);
CREATE UNIQUE INDEX idx_variants_sku_active ON public.product_variants (organization_id, sku) WHERE deleted_at IS NULL;

CREATE TABLE public.product_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  public_id text,
  is_primary boolean DEFAULT false,
  
  created_at timestamp with time zone DEFAULT now(),
  
  CONSTRAINT product_images_pkey PRIMARY KEY (id)
);

CREATE TABLE public.product_variant_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL REFERENCES public.product_variants(id) ON DELETE CASCADE,
  image_id uuid NOT NULL REFERENCES public.product_images(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false,
  
  CONSTRAINT product_variant_images_pkey PRIMARY KEY (id),
  CONSTRAINT unique_variant_image UNIQUE (variant_id, image_id)
);

-- ==============================================================================
-- 2. SEGURANÇA (RLS & POLICIES)
-- ==============================================================================

-- Habilita RLS
ALTER TABLE public.attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variant_images ENABLE ROW LEVEL SECURITY;

-- Policies Principais
CREATE POLICY "Members can view attributes" ON public.attributes FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Members can view categories" ON public.categories FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Members can view products" ON public.products FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Members can view variants" ON public.product_variants FOR SELECT USING (public.is_org_member(organization_id));
CREATE POLICY "Members can view images" ON public.product_images FOR SELECT USING (public.is_org_member(organization_id));

-- Policies de Tabelas Pivô e Detalhes
CREATE POLICY "Members can view product_cats" ON public.product_categories FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_categories.product_id AND public.is_org_member(organization_id))
);

-- [FIX DO LINTER] Adicionadas policies que faltavam
CREATE POLICY "Members can view product attributes" ON public.product_attributes FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.products WHERE id = product_attributes.product_id AND public.is_org_member(organization_id))
);

CREATE POLICY "Members can view variant images" ON public.product_variant_images FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.product_variants WHERE id = product_variant_images.variant_id AND public.is_org_member(organization_id))
);

-- Escrita restrita a Managers (Categorias e Atributos)
CREATE POLICY "Managers can manage attributes" ON public.attributes FOR ALL USING (public.has_role(organization_id, 'manager'));
CREATE POLICY "Managers can manage categories" ON public.categories FOR ALL USING (public.has_role(organization_id, 'manager'));