-- ==============================================================================
-- 08_SEED_BUSINESS_AREA_TEMPLATES.SQL
-- Seed: Áreas de Negócio + Templates de Categorias e Atributos por Área
-- Renomeado de: 08_seed_global_attributes.sql
-- Dependência: AUTH-01 (business_areas, business_area_categories, business_area_attributes)
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
INSERT INTO public.business_areas (code, name) VALUES
  ('clothing', 'Loja de roupas'),
  ('petshop',  'Petshop'),
  ('other',    'Outro')
ON CONFLICT (code) DO NOTHING;


-- ==============================================================================
-- 2. TEMPLATE — CLOTHING (Loja de roupas)
-- ==============================================================================

-- 2a. Categorias
INSERT INTO public.business_area_categories (business_area_id, name)
SELECT ba.id, cat.name
FROM public.business_areas ba,
     (VALUES
       ('Feminino'),
       ('Masculino'),
       ('Infantil'),
       ('Acessórios'),
       ('Calçados')
     ) AS cat(name)
WHERE ba.code = 'clothing'
ON CONFLICT DO NOTHING;

-- 2b. Atributos
INSERT INTO public.business_area_attributes (business_area_id, label, slug, type, "values")
SELECT ba.id, attr.label, attr.slug, attr.type, attr."values"::jsonb
FROM public.business_areas ba,
     (VALUES
       -- Cor (color): Label|#HEX
       (
         'Cor',
         'cor',
         'color',
         '["Azul Marinho|#001F5B","Branco|#FFFFFF","Preto|#000000","Vermelho|#CC0000","Cinza|#808080","Rosa|#FF69B4","Bege|#F5F0E8","Verde Oliva|#808000"]'
       ),
       -- Tamanho (Letras)
       (
         'Tamanho (Letras)',
         'tamanho-letras',
         'text',
         '["PP","P","M","G","GG","EXG"]'
       ),
       -- Tamanho (Números — vestuário infantil/calçados)
       (
         'Tamanho (Números)',
         'tamanho-numeros',
         'text',
         '["34","36","38","40","42","44","46","48"]'
       ),
       -- Material
       (
         'Material',
         'material',
         'select',
         '["Algodão","Poliéster","Linho","Denim","Couro","Sintético","Viscose","Malha"]'
       ),
       -- Gênero
       (
         'Gênero',
         'genero',
         'select',
         '["Feminino","Masculino","Unissex","Infantil"]'
       )
     ) AS attr(label, slug, type, "values")
WHERE ba.code = 'clothing'
ON CONFLICT (business_area_id, slug) DO NOTHING;


-- ==============================================================================
-- 3. TEMPLATE — PETSHOP
-- ==============================================================================

-- 3a. Categorias
INSERT INTO public.business_area_categories (business_area_id, name)
SELECT ba.id, cat.name
FROM public.business_areas ba,
     (VALUES
       ('Ração e Alimentos'),
       ('Higiene e Beleza'),
       ('Brinquedos'),
       ('Acessórios'),
       ('Medicamentos e Suplementos'),
       ('Camas e Casinhas')
     ) AS cat(name)
WHERE ba.code = 'petshop'
ON CONFLICT DO NOTHING;

-- 3b. Atributos
INSERT INTO public.business_area_attributes (business_area_id, label, slug, type, "values")
SELECT ba.id, attr.label, attr.slug, attr.type, attr."values"::jsonb
FROM public.business_areas ba,
     (VALUES
       -- Espécie
       (
         'Espécie',
         'especie',
         'select',
         '["Cão","Gato","Pássaro","Peixe","Roedor","Réptil","Outro"]'
       ),
       -- Porte
       (
         'Porte',
         'porte',
         'select',
         '["Miniatura","Pequeno","Médio","Grande","Gigante"]'
       ),
       -- Peso (text com unidade — decisão de produto)
       (
         'Peso',
         'peso',
         'text',
         '["500 g","1 kg","2 kg","3 kg","5 kg","10 kg","15 kg","20 kg"]'
       ),
       -- Sabor / Fórmula
       (
         'Sabor / Fórmula',
         'sabor-formula',
         'select',
         '["Frango","Carne","Peixe","Cordeiro","Misto","Natural","Sem Cereais"]'
       ),
       -- Cor (acessórios/coleiras)
       (
         'Cor',
         'cor',
         'color',
         '["Azul|#1E90FF","Vermelho|#CC0000","Verde|#228B22","Amarelo|#FFD700","Preto|#000000","Rosa|#FF69B4","Laranja|#FF8C00"]'
       )
     ) AS attr(label, slug, type, "values")
WHERE ba.code = 'petshop'
ON CONFLICT (business_area_id, slug) DO NOTHING;


-- ==============================================================================
-- 4. OTHER — Sem template
-- ==============================================================================
-- Nenhum INSERT de categoria ou atributo para 'other'.
-- Org com business_area_id = other nasce sem categories e sem organization_attributes.
-- A materialização no handle_new_user (INSERT ... SELECT ... WHERE business_area_id = <área>)
-- simplesmente não insere nada. Sem CASE especial.
