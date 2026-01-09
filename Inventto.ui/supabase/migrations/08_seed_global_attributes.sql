-- Limpa atributos globais antigos (se houver)
TRUNCATE TABLE public.attributes RESTART IDENTITY CASCADE;

INSERT INTO public.attributes (label, slug, type, "values") VALUES
-- 1. COR (Label|Hex)
(
  'Cor', 
  'cor', 
  'color', 
  '["Azul|#0000FF", "Branco|#FFFFFF", "Preto|#000000", "Vermelho|#FF0000"]'::jsonb
),
-- 2. TAMANHO (Letras)
(
  'Tamanho (Letras)', 
  'text-sizing', 
  'text', 
  '["PP", "P", "M", "G", "GG", "EXG"]'::jsonb
),
-- 3. TAMANHO (Numérico)
(
  'Tamanho (Números)', 
  'numeric-sizing', 
  'number', 
  '["34", "36", "38", "40", "42", "44", "46", "48"]'::jsonb
),
-- 4. VOLTAGEM
(
  'Voltagem', 
  'voltage', 
  'select', 
  '["110v", "127v", "220v"]'::jsonb
),
-- 5. PESO
(
  'Peso (kg)', 
  'weight-kg', 
  'text', 
  '["1 kg", "3 kg", "5 kg", "10 kg", "15 kg", "20 kg"]'::jsonb
);