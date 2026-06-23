-- ==============================================================================
-- 07_RPC_FUNCTIONS.SQL
-- Módulo: Regras de Negócio e Transações Complexas (RPC)
-- Status: PATCHED (Security Hardening RF009)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- HELPER: SLUGIFY
-- Gera slugs automaticamente para atributos customizados
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.slugify(value TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(trim(value), '[^a-zA-Z0-9]+', '-', 'g'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;


-- ==============================================================================
-- 1. AUTH: HANDLE NEW USER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_meta JSONB := new.raw_user_meta_data;
BEGIN
  -- Cria o Profile com a flag de senha provisória se vier nos metadados
  -- terms_accepted_at: persistido apenas no signup de Owner (RN006). NULL para employees.
  INSERT INTO public.profiles (id, email, full_name, avatar_url, must_change_password, terms_accepted_at)
  VALUES (
    new.id,
    new.email,
    v_meta->>'full_name',
    v_meta->>'avatar_url',
    COALESCE((v_meta->>'must_change_password')::boolean, false),
    (v_meta->>'terms_accepted_at')::timestamptz
  );

  -- CASO 1: É um Owner criando uma empresa nova
  IF (v_meta->>'company_name') IS NOT NULL THEN
    -- Code da área com fallback seguro: nulo/vazio → 'other'.
    -- Valor não-vazio fora do enum ainda falha no cast (input corrompido = fail loud).
    DECLARE
      v_area_code public.business_area_code :=
        COALESCE(NULLIF(v_meta->>'business_area_code', ''), 'other')::public.business_area_code;
    BEGIN
      INSERT INTO public.organizations (name, document, owner_id, business_area_code)
      VALUES (
        v_meta->>'company_name',
        v_meta->>'company_document',
        new.id,
        v_area_code
      )
      RETURNING id INTO v_org_id;

      -- Materializa categorias do template da área escolhida em public.categories
      INSERT INTO public.categories (organization_id, name)
      SELECT v_org_id, bac.name
      FROM public.business_area_categories bac
      WHERE bac.business_area_code = v_area_code;

      -- Materializa atributos do template da área escolhida em public.organization_attributes
      INSERT INTO public.organization_attributes (organization_id, label, slug, type, "values")
      SELECT v_org_id, baa.label, baa.slug, baa.type, baa."values"
      FROM public.business_area_attributes baa
      WHERE baa.business_area_code = v_area_code;

      INSERT INTO public.organization_members (organization_id, profile_id, role, status)
      VALUES (v_org_id, new.id, 'owner', 'active');
    END;
  
  -- CASO 2: É um Provisionamento Manual (Admin criando funcionário)
  ELSIF (v_meta->>'organization_id') IS NOT NULL THEN
    INSERT INTO public.organization_members (organization_id, profile_id, role, status)
    VALUES (
      (v_meta->>'organization_id')::uuid, 
      new.id, 
      (v_meta->>'role')::app_role, 
      'invited'
    );
  END IF;

  RETURN new;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ==============================================================================
-- 2. AUTH: Confirm First Access
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.confirm_first_access(p_user_id UUID, p_organization_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Atualiza o Profile (Remove a obrigatoriedade de senha)
  UPDATE public.profiles
  SET 
    must_change_password = false,
    updated_at = NOW()
  WHERE id = p_user_id;

  -- 2. Atualiza o Status do Membro (Ativa o usuário na organização)
  UPDATE public.organization_members
  SET status = 'active'
  WHERE profile_id = p_user_id
  AND organization_id = p_organization_id;
  
  -- Verifica se algo foi alterado (Opcional, para debug)
 IF NOT FOUND THEN
    RAISE WARNING 'Nenhum vínculo encontrado para User % na Org %', p_user_id, p_organization_id;
  END IF;
END;
$$;


-- ==============================================================================
-- 3. PRODUTOS: CREATE PRODUCT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_product(product_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
  v_product_id UUID;
  
  v_image_data JSONB;
  v_attr_data JSONB;
  v_variant_data JSONB;
  v_variant_image_link JSONB;
  v_category_data text;
  
  v_image_id UUID;
  v_variant_id UUID;
  image_id_map JSONB := '{}'::JSONB;

  -- Vars auxiliares para Atributos
  v_attr_label text;
  v_attr_slug text;
BEGIN
  v_org_id := (product_data->>'organization_id')::UUID;
  
  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  -- Insert Produto Pai
  INSERT INTO public.products (
    organization_id, 
    name, 
    sku, 
    description, 
    has_variants, 
    stock, 
    minimum_stock, 
    is_active
  )
  VALUES (
    v_org_id,
    product_data->>'name',
    product_data->>'sku',
    product_data->>'description',
    (product_data->>'hasVariants')::BOOLEAN,
    COALESCE((product_data->>'stock')::INT, 0),
    COALESCE((product_data->>'minimumStock')::INT, 5),
    COALESCE((product_data->>'isActive')::BOOLEAN, true)
  )
  RETURNING id INTO v_product_id;

  -- Categorias
  FOR v_category_data IN SELECT * FROM jsonb_array_elements_text(product_data->'category_ids')
  LOOP
    INSERT INTO public.product_categories (product_id, category_id)
    VALUES (v_product_id, v_category_data::UUID);
  END LOOP;

  -- Imagens
  FOR v_image_data IN SELECT * FROM jsonb_array_elements(product_data->'allImages')
  LOOP
    INSERT INTO public.product_images (organization_id, product_id, url, is_primary, public_id, name)
    VALUES (
      v_org_id, 
      v_product_id, 
      v_image_data->>'url', 
      (v_image_data->>'isPrimary')::BOOLEAN, 
      v_image_data->>'public_id',
      COALESCE(v_image_data->>'name', 'Imagem do Produto')
    )
    RETURNING id INTO v_image_id;
    image_id_map := image_id_map || jsonb_build_object(v_image_data->>'id', v_image_id);
  END LOOP;

  -- Atributos
  FOR v_attr_data IN SELECT * FROM jsonb_array_elements(product_data->'attributes')
  LOOP
    -- Tenta pegar label ou name
    v_attr_label := COALESCE(v_attr_data->>'label', v_attr_data->>'name');
    
    -- Gera slug se não vier
    v_attr_slug := v_attr_data->>'slug';
    IF v_attr_slug IS NULL OR v_attr_slug = '' THEN
        v_attr_slug := public.slugify(v_attr_label);
    END IF;

    INSERT INTO public.product_attributes (
      organization_id,
      product_id, 
      label, 
      slug,
      type, 
      "values"
    )
    VALUES (
      v_org_id,
      v_product_id, 
      v_attr_label,
      v_attr_slug,
      v_attr_data->>'type', 
      v_attr_data->'values'
    );
  END LOOP;

  -- Variantes
  IF (product_data->>'hasVariants')::BOOLEAN THEN
    FOR v_variant_data IN SELECT * FROM jsonb_array_elements(product_data->'variants')
    LOOP
      INSERT INTO public.product_variants (
        organization_id, product_id, sku, options, stock, minimum_stock, is_active
      )
      VALUES (
        v_org_id, 
        v_product_id, 
        v_variant_data->>'sku', 
        (v_variant_data->'options')::JSONB,
        COALESCE((v_variant_data->>'stock')::INT, 0), 
        COALESCE((v_variant_data->>'minimumStock')::INT, 5),
        COALESCE((v_variant_data->>'isActive')::BOOLEAN, true)
      )
      RETURNING id INTO v_variant_id;
      
      -- Vinculo Imagens Variante
      FOR v_variant_image_link IN SELECT * FROM jsonb_array_elements(v_variant_data->'images')
      LOOP
        v_image_id := (image_id_map->>(v_variant_image_link->>'id'))::UUID;
        IF v_image_id IS NOT NULL THEN
          INSERT INTO public.product_variant_images (variant_id, image_id, is_primary)
          VALUES (v_variant_id, v_image_id, COALESCE((v_variant_image_link->>'isPrimary')::BOOLEAN, false));
        END IF;
      END LOOP;
    END LOOP;
  END IF;

  RETURN v_product_id;
END;
$$;


-- ==============================================================================
-- 4. PRODUTOS: UPDATE PRODUCT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_product(product_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
  v_product_id UUID;
  
  v_image_data JSONB;
  v_attr_data JSONB;
  v_variant_data JSONB;
  v_variant_image_link JSONB;
  v_category_id_text text;
  
  v_image_id UUID;
  v_variant_id UUID;
  image_id_map JSONB := '{}'::JSONB;

  v_attr_label text;
  v_attr_slug text;
BEGIN
  v_product_id := (product_data->>'id')::UUID;
  v_org_id := (product_data->>'organization_id')::UUID;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  -- Update Produto
  UPDATE public.products
  SET
    name = product_data->>'name',
    sku = product_data->>'sku',
    description = product_data->>'description',
    has_variants = (product_data->>'hasVariants')::BOOLEAN,
    stock = COALESCE((product_data->>'stock')::INT, 0),
    minimum_stock = COALESCE((product_data->>'minimumStock')::INT, 5),
    is_active = COALESCE((product_data->>'isActive')::BOOLEAN, true),
    updated_at = NOW()
  WHERE id = v_product_id AND organization_id = v_org_id;

  -- Limpeza de Relações
  DELETE FROM public.product_categories WHERE product_id = v_product_id;
  DELETE FROM public.product_attributes WHERE product_id = v_product_id;
  DELETE FROM public.product_images WHERE product_id = v_product_id;
  
  -- Soft Delete Variants
  UPDATE public.product_variants SET deleted_at = NOW() 
  WHERE product_id = v_product_id AND organization_id = v_org_id;

  -- Recria Categorias
  FOR v_category_id_text IN SELECT * FROM jsonb_array_elements_text(product_data->'category_ids') LOOP
    INSERT INTO public.product_categories (product_id, category_id) VALUES (v_product_id, v_category_id_text::UUID);
  END LOOP;

  -- Recria Atributos
  FOR v_attr_data IN SELECT * FROM jsonb_array_elements(product_data->'attributes') LOOP
    v_attr_label := COALESCE(v_attr_data->>'label', v_attr_data->>'name');
    v_attr_slug := v_attr_data->>'slug';
    IF v_attr_slug IS NULL OR v_attr_slug = '' THEN
        v_attr_slug := public.slugify(v_attr_label);
    END IF;

    INSERT INTO public.product_attributes (
      organization_id, 
      product_id, 
      label, 
      slug, 
      type, 
      "values"
    )
    VALUES (
      v_org_id, 
      v_product_id, 
      v_attr_label, 
      v_attr_slug, 
      v_attr_data->>'type', 
      v_attr_data->'active_values'
    );
  END LOOP;

  -- Recria Imagens
  FOR v_image_data IN SELECT * FROM jsonb_array_elements(product_data->'allImages') LOOP
    INSERT INTO public.product_images (organization_id, product_id, url, is_primary, name, public_id) 
    VALUES (
      v_org_id, 
      v_product_id, 
      v_image_data->>'url', 
      (v_image_data->>'isPrimary')::BOOLEAN,
      COALESCE(v_image_data->>'name', 'Imagem atualizada'),
      v_image_data->>'public_id'
    )
    RETURNING id INTO v_image_id;
    image_id_map := image_id_map || jsonb_build_object(v_image_data->>'id', v_image_id);
  END LOOP;

  -- Upsert Variantes
  IF (product_data->>'hasVariants')::BOOLEAN THEN
    FOR v_variant_data IN SELECT * FROM jsonb_array_elements(product_data->'variants')
    LOOP
      v_variant_id := (v_variant_data->>'id')::UUID;
      
      IF v_variant_id IS NOT NULL AND EXISTS (SELECT 1 FROM public.product_variants WHERE id = v_variant_id) THEN
        UPDATE public.product_variants
        SET
          sku = v_variant_data->>'sku',
          options = (v_variant_data->'options')::JSONB,
          stock = COALESCE((v_variant_data->>'stock')::INT, 0),
          minimum_stock = COALESCE((v_variant_data->>'minimumStock')::INT, 5),
          is_active = COALESCE((v_variant_data->>'isActive')::BOOLEAN, true),
          deleted_at = NULL 
        WHERE id = v_variant_id;
      ELSE
        INSERT INTO public.product_variants (
          organization_id, product_id, sku, options, stock, minimum_stock, is_active
        )
        VALUES (
          v_org_id, 
          v_product_id, 
          v_variant_data->>'sku', 
          (v_variant_data->'options')::JSONB,
          COALESCE((v_variant_data->>'stock')::INT, 0), 
          COALESCE((v_variant_data->>'minimumStock')::INT, 5),
          COALESCE((v_variant_data->>'isActive')::BOOLEAN, true)
        )
        RETURNING id INTO v_variant_id;
      END IF;

      FOR v_variant_image_link IN SELECT * FROM jsonb_array_elements(v_variant_data->'images') LOOP
        v_image_id := (image_id_map->>(v_variant_image_link->>'id'))::UUID;
        IF v_image_id IS NOT NULL THEN
          INSERT INTO public.product_variant_images (variant_id, image_id, is_primary) 
          VALUES (v_variant_id, v_image_id, COALESCE((v_variant_image_link->>'isPrimary')::BOOLEAN, false))
          ON CONFLICT DO NOTHING;
        END IF;
      END LOOP;
    END LOOP;
  END IF;

  RETURN v_product_id;
END;
$$;


-- ==============================================================================
-- 5. PRODUTOS: DELETE (Soft Delete)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.soft_delete_product(
  p_product_id UUID,
  p_organization_id UUID
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  
  IF NOT public.has_role(p_organization_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  UPDATE public.products SET deleted_at = NOW(), updated_at = NOW()
  WHERE id = p_product_id AND organization_id = p_organization_id;

  UPDATE public.product_variants SET deleted_at = NOW()
  WHERE product_id = p_product_id AND organization_id = p_organization_id;
END;
$$;


-- ==============================================================================
-- 6. ESTOQUE: CREATE MOVEMENT
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_stock_movement(movement_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
  v_movement_id UUID;
  v_role public.app_role;
  
  v_item_data JSONB;
  v_product_id UUID;
  v_variant_id UUID;
  v_qty INTEGER;
  v_type public.movement_type;
  v_delta INTEGER;
  
  v_current_stock INTEGER;
  v_current_cost NUMERIC;
  v_input_cost NUMERIC;
  v_new_cost NUMERIC;
  v_total_value NUMERIC;
  v_registered_cost NUMERIC;
BEGIN
  v_org_id := (movement_data->>'organization_id')::UUID;
  v_type := (movement_data->>'type')::public.movement_type;

  -- 1. Validação de Permissão
  SELECT role INTO v_role FROM public.organization_members 
  WHERE profile_id = v_user_id AND organization_id = v_org_id;

  IF v_role IS NULL THEN RAISE EXCEPTION 'Acesso negado.'; END IF;
  
  -- Vendedores só podem registrar saídas
  IF v_role = 'sales' AND v_type <> 'withdrawal' THEN
    RAISE EXCEPTION 'Permissão negada: Vendedores só podem registrar saídas.';
  END IF;

  -- 2. Cria Header
  INSERT INTO public.movements (organization_id, user_id, type, reason, order_id, document_number)
  VALUES (
    v_org_id, 
    v_user_id, 
    v_type, 
    movement_data->>'reason', 
    (movement_data->>'order_id')::UUID,
    movement_data->>'document_number'
  )
  RETURNING id INTO v_movement_id;

  -- 3. Processa Itens
  FOR v_item_data IN SELECT * FROM jsonb_array_elements(movement_data->'items')
  LOOP
    v_product_id := (v_item_data->>'product_id')::UUID;
    v_variant_id := (v_item_data->>'variant_id')::UUID;
    v_qty := (v_item_data->>'quantity')::INTEGER;
    v_input_cost := COALESCE((v_item_data->>'unit_cost')::NUMERIC, 0);

    IF v_qty IS NULL OR v_qty = 0 THEN CONTINUE; END IF;

    CASE v_type
      WHEN 'entry' THEN v_delta := ABS(v_qty);
      WHEN 'withdrawal' THEN v_delta := ABS(v_qty) * -1;
      WHEN 'adjustment' THEN v_delta := v_qty; 
    END CASE;

    -- ============================================================
    -- LÓGICA DO CUSTO MÉDIO PONDERADO
    -- ============================================================
    
    -- A. Se for VARIANTE
    IF v_variant_id IS NOT NULL THEN
      SELECT stock, cost_price INTO v_current_stock, v_current_cost 
      FROM public.product_variants WHERE id = v_variant_id;
      
      IF v_type = 'entry' THEN
        v_total_value := (v_current_stock * v_current_cost) + (ABS(v_qty) * v_input_cost);
        v_new_cost := v_total_value / (v_current_stock + ABS(v_qty));
        
        UPDATE public.product_variants 
        SET stock = stock + v_delta, cost_price = v_new_cost 
        WHERE id = v_variant_id;
        
        v_registered_cost := v_input_cost;
      ELSE
        UPDATE public.product_variants SET stock = stock + v_delta WHERE id = v_variant_id;
        v_registered_cost := v_current_cost;
      END IF;

    -- B. Se for PRODUTO SIMPLES
    ELSIF v_product_id IS NOT NULL THEN
      SELECT stock, cost_price INTO v_current_stock, v_current_cost 
      FROM public.products WHERE id = v_product_id;
      
      IF v_type = 'entry' THEN
        v_total_value := (v_current_stock * v_current_cost) + (ABS(v_qty) * v_input_cost);
        IF (v_current_stock + ABS(v_qty)) > 0 THEN
             v_new_cost := v_total_value / (v_current_stock + ABS(v_qty));
        ELSE
             v_new_cost := v_input_cost;
        END IF;

        UPDATE public.products 
        SET stock = stock + v_delta, cost_price = v_new_cost 
        WHERE id = v_product_id;
        
        v_registered_cost := v_input_cost;
      ELSE
        UPDATE public.products SET stock = stock + v_delta WHERE id = v_product_id;
        v_registered_cost := v_current_cost;
      END IF;
    END IF;

    -- 4. Grava Histórico
    INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost, unit_price)
    VALUES (
      v_movement_id, 
      v_product_id, 
      v_variant_id, 
      ABS(v_qty), 
      v_registered_cost,
      (v_item_data->>'unit_price')::NUMERIC
    );
  END LOOP;

  RETURN v_movement_id;
END;
$$;

-- ==============================================================================
-- 7. ORGANIZAÇÕES: CREATE NEW ORGANIZATION (RF006)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.create_new_organization(
  p_name               TEXT,
  p_document           TEXT DEFAULT NULL,
  p_business_area_code public.business_area_code DEFAULT 'other'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id          UUID;
  v_user_id         UUID := auth.uid();
BEGIN
  -- Template de categorias/atributos NÃO é materializado aqui (RN008 — exclusivo do signup).
  -- Nota: slug pertence a Catalogs/Storefront (RN063).

  -- Inserção da Organização
  INSERT INTO public.organizations (name, document, owner_id, business_area_code)
  VALUES (p_name, p_document, v_user_id, COALESCE(p_business_area_code, 'other'))
  RETURNING id INTO v_org_id;

  -- Inserção do Membro (Dono)
  INSERT INTO public.organization_members (organization_id, profile_id, role, status)
  VALUES (v_org_id, v_user_id, 'owner', 'active');

  RETURN v_org_id;
END;
$$;

-- ==============================================================================
-- 8. ORGANIZAÇÕES: GET CANDIDATE MEMBERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_candidate_members(p_organization_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH my_orgs AS (
    SELECT organization_id 
    FROM organization_members 
    WHERE profile_id = auth.uid() 
    AND role IN ('owner')
  )
  SELECT DISTINCT 
    p.id, 
    p.full_name, 
    p.email, 
    p.avatar_url
  FROM profiles p
  JOIN organization_members om ON p.id = om.profile_id
  WHERE om.organization_id IN (SELECT organization_id FROM my_orgs)
  AND p.id NOT IN (
    SELECT profile_id 
    FROM organization_members 
    WHERE organization_id = p_organization_id
  );
END;
$$;

-- ==============================================================================
-- 9. ORGANIZAÇÕES: REPLICATE MEMBER
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.replicate_member(
  p_organization_id UUID,
  p_user_id UUID,
  p_role public.app_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- 1. Verificação de Segurança: Quem chama deve ser Manager/Owner da Org destino
  IF NOT public.has_role(p_organization_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: Apenas gerentes podem adicionar membros.';
  END IF;

  -- 2. Inserção Atômica (Idempotente)
  INSERT INTO public.organization_members (organization_id, profile_id, role, status)
  VALUES (p_organization_id, p_user_id, p_role, 'invited')
  ON CONFLICT (organization_id, profile_id) 
  DO UPDATE SET role = p_role, status = 'active';
END;
$$;

-- ==============================================================================
-- 10. ORGANIZAÇÕES: DESATIVAR ORGANIZAÇÃO (RF010, RN020, RN027, RN028)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.deactivate_organization(p_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- RN020: apenas Owner pode desativar.
  IF NOT public.has_role(p_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode desativar a organização.';
  END IF;

  UPDATE public.organizations
  SET status = 'inactive', updated_at = NOW()
  WHERE id = p_org_id;

  -- RN027: pedidos pendentes são cancelados e o estoque, liberado.
  -- TODO(RN027): Não há trigger/função no banco atual para liberação de estoque de forma atômica.
  -- Assim que o módulo de reservas/estoque estiver finalizado, implementar a lógica para retornar
  -- os itens cancelados ao inventário dentro desta mesma transação (ou via trigger no update do status).
  UPDATE public.orders
  SET status = 'cancelled', updated_at = NOW()
  WHERE organization_id = p_org_id
  AND status = 'pending';
END;
$$;

-- ==============================================================================
-- 11. ORGANIZAÇÕES: REATIVAR ORGANIZAÇÃO (RF010)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.reactivate_organization(p_org_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(p_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode reativar a organização.';
  END IF;

  UPDATE public.organizations
  SET status = 'active', updated_at = NOW()
  WHERE id = p_org_id;
END;
$$;

-- ==============================================================================
-- 12. ORGANIZAÇÕES: EXCLUIR ORGANIZAÇÃO (RF011, RN017, RN029)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.delete_organization(p_org_id UUID, p_purge BOOLEAN DEFAULT false)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Apenas Owner pode excluir
  IF NOT public.has_role(p_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode excluir a organização.';
  END IF;

  -- RN027: pedidos pendentes são cancelados e o estoque, liberado.
  UPDATE public.orders
  SET status = 'cancelled', updated_at = NOW()
  WHERE organization_id = p_org_id
  AND status = 'pending';

  IF p_purge = false THEN
    -- Retenção (soft delete)
    UPDATE public.organizations
    SET status = 'deleted', updated_at = NOW()
    WHERE id = p_org_id;
  ELSE
    -- Expurgo (hard delete)
    -- ON DELETE CASCADE configurado no BD cuidará de limpar os dados dependentes (produtos, imagens, categorias etc).
    DELETE FROM public.organizations WHERE id = p_org_id;
  END IF;
END;
$$;