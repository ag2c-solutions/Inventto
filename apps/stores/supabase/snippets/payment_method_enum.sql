-- PDV-05 — enum payment_method, para a instância em execução.
-- Aplicar no SQL editor do Supabase. Reflete 00_types_and_enums.sql.
-- Criado aqui — o módulo Pedidos (PED-01) deve reusar, não recriar.

CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'pix');
