-- ==============================================================================
-- 00_TYPES_AND_ENUMS.SQL
-- Definição de Tipos Enumerados do Sistema
-- Deve ser o primeiro arquivo a ser executado.
-- ==============================================================================

-- Papéis de Usuário (Controle de Acesso)
CREATE TYPE public.app_role AS ENUM ('owner', 'manager', 'sales'); 

-- Status do Pedido
CREATE TYPE public.order_status AS ENUM ('pending', 'confirmed', 'cancelled', 'expired');

-- Canais de Venda (Origem do Pedido)
CREATE TYPE public.sale_channel AS ENUM ('pos', 'whatsapp_direct', 'catalog_store', 'marketplace');

-- PDV-05: Forma de Pagamento (criado aqui — Pedidos/PED-01 reusa em vez de recriar)
CREATE TYPE public.payment_method AS ENUM ('cash', 'card', 'pix');

-- Tipos de Atributos de Produto (Grade)
CREATE TYPE public.attribute_type AS ENUM ('text', 'color', 'select', 'number');

-- Tipos de Movimentação de Estoque
CREATE TYPE public.movement_type AS ENUM ('entry', 'withdrawal');

-- Motivos de Movimentação de Estoque
CREATE TYPE public.movement_reason AS ENUM ('purchase', 'return_in', 'transfer_in', 'sale', 'return_out', 'transfer_out', 'loss','consumption','inventory','correction', 'other');

-- Status do Membro
CREATE TYPE public.member_status AS ENUM ('active', 'inactive', 'invited');

-- Áreas de Negócio
CREATE TYPE public.business_area_code AS ENUM ('clothing', 'petshop', 'other');

-- Status da Organização
CREATE TYPE public.organization_status AS ENUM ('active', 'inactive', 'deleted');

-- VIT-01 · RN074: estados do storefront ("removido" = linha excluída, sem enum).
CREATE TYPE public.storefront_status AS ENUM ('active', 'inactive');