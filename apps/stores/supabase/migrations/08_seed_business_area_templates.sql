-- ==============================================================================
-- 08_SEED_BUSINESS_AREA_TEMPLATES.SQL
-- Seed: Áreas de Negócio + Templates de Categorias e Atributos por Área
-- Renomeado de: 08_seed_global_attributes.sql
-- Dependência: AUTH-01 (business_area_categories, business_area_attributes)
-- RN: RN008, RN042
-- ==============================================================================
-- Domínio de `type` (RN042): text | number | select | color
-- Formato de `values` (jsonb array):
--   color  → cada item: "Label|#HEX"
--   select → lista simples de strings
--   text   → lista simples de strings (com unidades quando necessário)
--   number → não utilizado neste seed
-- ==============================================================================


-- ------------------------------------------------------------------------------
-- 1. BUSINESS AREAS
-- ------------------------------------------------------------------------------
-- Removido a favor de enum.


-- ==============================================================================
-- 2. TEMPLATE — CLOTHING (Loja de roupas)
-- ==============================================================================

-- 2a. Categorias
INSERT INTO public.business_area_categories (business_area_code, name) VALUES
  ('clothing', 'Feminino'),
  ('clothing', 'Masculino'),
  ('clothing', 'Infantil'),
  ('clothing', 'Acessórios'),
  ('clothing', 'Calçados')
ON CONFLICT (business_area_code, name) DO NOTHING;

-- 2b. Atributos
INSERT INTO public.business_area_attributes (business_area_code, label, slug, type, "values") VALUES
  ('clothing', 'Cor', 'cor', 'color'::public.attribute_type,
   '["Azul Marinho|#001F5B","Branco|#FFFFFF","Preto|#000000","Vermelho|#CC0000","Cinza|#808080","Rosa|#FF69B4","Bege|#F5F0E8","Verde Oliva|#808000"]'::jsonb),
  ('clothing', 'Tamanho (Letras)', 'tamanho-letras', 'text'::public.attribute_type,
   '["PP","P","M","G","GG","EXG"]'::jsonb),
  ('clothing', 'Tamanho (Números)', 'tamanho-numeros', 'text'::public.attribute_type,
   '["34","36","38","40","42","44","46","48"]'::jsonb),
  ('clothing', 'Material', 'material', 'select'::public.attribute_type,
   '["Algodão","Poliéster","Linho","Denim","Couro","Sintético","Viscose","Malha"]'::jsonb),
  ('clothing', 'Gênero', 'genero', 'select'::public.attribute_type,
   '["Feminino","Masculino","Unissex","Infantil"]'::jsonb)
ON CONFLICT (business_area_code, slug) DO NOTHING;


-- ==============================================================================
-- 3. TEMPLATE — PETSHOP
-- ==============================================================================

-- 3a. Categorias
INSERT INTO public.business_area_categories (business_area_code, name) VALUES
  ('petshop', 'Ração e Alimentos'),
  ('petshop', 'Higiene e Beleza'),
  ('petshop', 'Brinquedos'),
  ('petshop', 'Acessórios'),
  ('petshop', 'Medicamentos e Suplementos'),
  ('petshop', 'Camas e Casinhas')
ON CONFLICT (business_area_code, name) DO NOTHING;

-- 3b. Atributos
INSERT INTO public.business_area_attributes (business_area_code, label, slug, type, "values") VALUES
  ('petshop', 'Espécie', 'especie', 'select'::public.attribute_type,
   '["Cão","Gato","Pássaro","Peixe","Roedor","Réptil","Outro"]'::jsonb),
  ('petshop', 'Porte', 'porte', 'select'::public.attribute_type,
   '["Miniatura","Pequeno","Médio","Grande","Gigante"]'::jsonb),
  ('petshop', 'Peso', 'peso', 'text'::public.attribute_type,
   '["500 g","1 kg","2 kg","3 kg","5 kg","10 kg","15 kg","20 kg"]'::jsonb),
  ('petshop', 'Sabor / Fórmula', 'sabor-formula', 'select'::public.attribute_type,
   '["Frango","Carne","Peixe","Cordeiro","Misto","Natural","Sem Cereais"]'::jsonb),
  ('petshop', 'Cor', 'cor', 'color'::public.attribute_type,
   '["Azul|#1E90FF","Vermelho|#CC0000","Verde|#228B22","Amarelo|#FFD700","Preto|#000000","Rosa|#FF69B4","Laranja|#FF8C00"]'::jsonb)
ON CONFLICT (business_area_code, slug) DO NOTHING;


-- ==============================================================================
-- 4. OTHER — Sem template
-- ==============================================================================
-- Nenhum INSERT de categoria ou atributo para 'other'.
-- Org com business_area_code = 'other' nasce sem categories e sem organization_attributes.
-- A materialização no handle_new_user simplesmente não insere nada. Sem CASE especial.
