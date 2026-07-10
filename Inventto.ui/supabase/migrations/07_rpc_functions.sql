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
    COALESCE((product_data->>'minimumStock')::INT, 0),
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
        COALESCE((v_variant_data->>'minimumStock')::INT, 0),
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

  v_old_sku text;
  v_has_movements BOOLEAN;
BEGIN
  v_product_id := (product_data->>'id')::UUID;
  v_org_id := (product_data->>'organization_id')::UUID;

  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  SELECT sku INTO v_old_sku FROM public.products WHERE id = v_product_id AND organization_id = v_org_id;
  IF v_old_sku IS DISTINCT FROM (product_data->>'sku') THEN
    v_has_movements := public.check_product_has_movements(v_product_id);
    IF v_has_movements THEN
      RAISE EXCEPTION 'SKU não pode ser alterado pois há movimentações registradas para este item.';
    END IF;
  END IF;

  -- Update Produto
  UPDATE public.products
  SET
    name = product_data->>'name',
    sku = product_data->>'sku',
    description = product_data->>'description',
    has_variants = (product_data->>'hasVariants')::BOOLEAN,
    stock = COALESCE((product_data->>'stock')::INT, 0),
    minimum_stock = COALESCE((product_data->>'minimumStock')::INT, 0),
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
        SELECT sku INTO v_old_sku FROM public.product_variants WHERE id = v_variant_id;
        IF v_old_sku IS DISTINCT FROM (v_variant_data->>'sku') THEN
          v_has_movements := public.check_product_has_movements(v_product_id);
          IF v_has_movements THEN
            RAISE EXCEPTION 'SKU não pode ser alterado pois há movimentações registradas para este item.';
          END IF;
        END IF;

        UPDATE public.product_variants
        SET
          sku = v_variant_data->>'sku',
          options = (v_variant_data->'options')::JSONB,
          stock = COALESCE((v_variant_data->>'stock')::INT, 0),
          minimum_stock = COALESCE((v_variant_data->>'minimumStock')::INT, 0),
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
          COALESCE((v_variant_data->>'minimumStock')::INT, 0),
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
-- 4.1. PRODUTOS: DISPONIBILIDADE DE SKU (RN038 — validação em tempo real)
-- Retorna TRUE se o SKU está livre na organização (ignora soft-deletes e,
-- opcionalmente, o próprio produto em edição).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_product_sku_available(
  p_organization_id UUID,
  p_sku TEXT,
  p_exclude_product_id UUID DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_org_member(p_organization_id) THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  IF p_sku IS NULL OR btrim(p_sku) = '' THEN
    RETURN FALSE;
  END IF;

  RETURN NOT EXISTS (
    SELECT 1
    FROM public.products
    WHERE organization_id = p_organization_id
      AND deleted_at IS NULL
      AND lower(sku) = lower(btrim(p_sku))
      AND (p_exclude_product_id IS NULL OR id <> p_exclude_product_id)
  );
END;
$$;


-- ==============================================================================
-- 4.2. PRODUTOS: CHECK MOVEMENTS (RN044)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.check_product_has_movements(p_product_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.movement_items WHERE product_id = p_product_id
  );
END;
$$;

-- ==============================================================================
-- 4.3. PRODUTOS: SET ACTIVE (RN045)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_product_active(
  p_product_id UUID,
  p_organization_id UUID,
  p_is_active BOOLEAN
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

  UPDATE public.products SET is_active = p_is_active, updated_at = NOW()
  WHERE id = p_product_id AND organization_id = p_organization_id;

  UPDATE public.product_variants SET is_active = p_is_active
  WHERE product_id = p_product_id AND organization_id = p_organization_id;
END;
$$;


-- ==============================================================================
-- 4.4. PRODUTOS: CANDIDATOS À IMPORTAÇÃO (RF021, RN048, RN049)
-- Lista produtos da org de origem e sinaliza os que já foram importados para a
-- org destino. Caller precisa ser membro de ambas as orgs (RN017 — mesmo tenant).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_import_candidates(
  p_source_org_id UUID,
  p_target_org_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  sku TEXT,
  already_imported BOOLEAN,
  image_url TEXT,
  image_public_id TEXT,
  variant_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF p_source_org_id = p_target_org_id THEN
    RAISE EXCEPTION 'A organização de origem deve ser diferente da organização de destino.';
  END IF;

  -- RN017: isolamento por tenant — só enxerga origem/destino de que é membro.
  IF NOT public.is_org_member(p_source_org_id) OR NOT public.is_org_member(p_target_org_id) THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.sku,
    EXISTS (
      SELECT 1
      FROM public.products t
      WHERE t.organization_id = p_target_org_id
        AND t.source_product_id = p.id
        AND t.deleted_at IS NULL
    ) AS already_imported,
    img.url AS image_url,
    img.public_id AS image_public_id,
    (
      SELECT count(*)::int
      FROM public.product_variants pv
      WHERE pv.product_id = p.id AND pv.deleted_at IS NULL
    ) AS variant_count
  FROM public.products p
  LEFT JOIN LATERAL (
    SELECT pi.url, pi.public_id
    FROM public.product_images pi
    WHERE pi.product_id = p.id
    ORDER BY pi.is_primary DESC, pi.created_at ASC
    LIMIT 1
  ) img ON true
  WHERE p.organization_id = p_source_org_id
    AND p.deleted_at IS NULL
  ORDER BY p.name ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_import_candidates(UUID, UUID) TO authenticated;

-- ==============================================================================
-- 4.5. PRODUTOS: IMPORTAR ENTRE UNIDADES (RF021, RN017, RN038, RN039/RN047, RN048)
-- Copia os DADOS MESTRES dos produtos selecionados da org origem para a org
-- destino, gerando novas entidades com estoque ZERO. NUNCA copia saldo, custo,
-- preços de catálogo nem movimentações. Retorna a quantidade efetivamente
-- importada (produtos já importados são ignorados — RN048).
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.import_products(
  p_source_org_id UUID,
  p_target_org_id UUID,
  p_product_ids UUID[]
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_source_product RECORD;
  v_new_product_id UUID;
  v_new_sku TEXT;
  v_suffix INT;
  v_imported_count INT := 0;

  v_category RECORD;
  v_attr RECORD;
  v_image RECORD;
  v_variant RECORD;
  v_variant_image RECORD;
  v_new_category_id UUID;
  v_new_image_id UUID;
  v_new_variant_id UUID;
  image_id_map JSONB;
BEGIN
  IF p_source_org_id = p_target_org_id THEN
    RAISE EXCEPTION 'A organização de origem deve ser diferente da organização de destino.';
  END IF;

  -- Autorização: Manager/Owner do destino + membro da origem (RN017).
  IF NOT public.has_role(p_target_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes podem importar produtos.';
  END IF;

  IF NOT public.is_org_member(p_source_org_id) THEN
    RAISE EXCEPTION 'Acesso negado: você não pertence à organização de origem.';
  END IF;

  FOR v_source_product IN
    SELECT * FROM public.products
    WHERE id = ANY(p_product_ids)
      AND organization_id = p_source_org_id
      AND deleted_at IS NULL
  LOOP
    -- RN048: pula produtos já importados nesta org destino.
    IF EXISTS (
      SELECT 1 FROM public.products
      WHERE organization_id = p_target_org_id
        AND source_product_id = v_source_product.id
        AND deleted_at IS NULL
    ) THEN
      CONTINUE;
    END IF;

    -- RN038: resolve colisão de SKU na org destino com sufixo incremental.
    v_new_sku := v_source_product.sku;
    v_suffix := 1;
    WHILE EXISTS (
      SELECT 1 FROM public.products
      WHERE organization_id = p_target_org_id
        AND lower(sku) = lower(v_new_sku)
        AND deleted_at IS NULL
    ) LOOP
      v_new_sku := v_source_product.sku || '-' || v_suffix;
      v_suffix := v_suffix + 1;
    END LOOP;

    -- Produto pai: estoque/custo SEMPRE zerados (RN039/RN047).
    INSERT INTO public.products (
      organization_id, name, sku, description, has_variants,
      stock, minimum_stock, cost_price, is_active, source_product_id
    )
    VALUES (
      p_target_org_id,
      v_source_product.name,
      v_new_sku,
      v_source_product.description,
      v_source_product.has_variants,
      0, 0, 0, true,
      v_source_product.id
    )
    RETURNING id INTO v_new_product_id;

    -- Categorias: mapeadas por nome (find-or-create na org destino).
    FOR v_category IN
      SELECT c.name
      FROM public.product_categories pc
      JOIN public.categories c ON c.id = pc.category_id
      WHERE pc.product_id = v_source_product.id
    LOOP
      SELECT id INTO v_new_category_id
      FROM public.categories
      WHERE organization_id = p_target_org_id AND name = v_category.name
      LIMIT 1;

      IF v_new_category_id IS NULL THEN
        INSERT INTO public.categories (organization_id, name)
        VALUES (p_target_org_id, v_category.name)
        RETURNING id INTO v_new_category_id;
      END IF;

      INSERT INTO public.product_categories (product_id, category_id)
      VALUES (v_new_product_id, v_new_category_id)
      ON CONFLICT DO NOTHING;
    END LOOP;

    -- Atributos (snapshot).
    FOR v_attr IN
      SELECT label, slug, type, "values"
      FROM public.product_attributes
      WHERE product_id = v_source_product.id
    LOOP
      INSERT INTO public.product_attributes (organization_id, product_id, label, slug, type, "values")
      VALUES (p_target_org_id, v_new_product_id, v_attr.label, v_attr.slug, v_attr.type, v_attr."values");
    END LOOP;

    -- Imagens (mantém vínculos de variante via mapa de ids).
    image_id_map := '{}'::JSONB;
    FOR v_image IN
      SELECT id, url, name, type, public_id, is_primary
      FROM public.product_images
      WHERE product_id = v_source_product.id
    LOOP
      INSERT INTO public.product_images (organization_id, product_id, url, name, type, public_id, is_primary)
      VALUES (p_target_org_id, v_new_product_id, v_image.url, v_image.name, v_image.type, v_image.public_id, v_image.is_primary)
      RETURNING id INTO v_new_image_id;
      image_id_map := image_id_map || jsonb_build_object(v_image.id::text, v_new_image_id);
    END LOOP;

    -- Variantes: SKU resolvido + estoque/custo zerados (RN039/RN047).
    IF v_source_product.has_variants THEN
      FOR v_variant IN
        SELECT id, sku, options
        FROM public.product_variants
        WHERE product_id = v_source_product.id AND deleted_at IS NULL
      LOOP
        v_new_sku := v_variant.sku;
        v_suffix := 1;
        WHILE EXISTS (
          SELECT 1 FROM public.product_variants
          WHERE organization_id = p_target_org_id
            AND lower(sku) = lower(v_new_sku)
            AND deleted_at IS NULL
        ) LOOP
          v_new_sku := v_variant.sku || '-' || v_suffix;
          v_suffix := v_suffix + 1;
        END LOOP;

        INSERT INTO public.product_variants (
          organization_id, product_id, sku, options, stock, minimum_stock, cost_price, is_active
        )
        VALUES (
          p_target_org_id, v_new_product_id, v_new_sku, v_variant.options, 0, 0, 0, true
        )
        RETURNING id INTO v_new_variant_id;

        FOR v_variant_image IN
          SELECT image_id, is_primary
          FROM public.product_variant_images
          WHERE variant_id = v_variant.id
        LOOP
          v_new_image_id := (image_id_map->>(v_variant_image.image_id::text))::UUID;
          IF v_new_image_id IS NOT NULL THEN
            INSERT INTO public.product_variant_images (variant_id, image_id, is_primary)
            VALUES (v_new_variant_id, v_new_image_id, v_variant_image.is_primary)
            ON CONFLICT DO NOTHING;
          END IF;
        END LOOP;
      END LOOP;
    END IF;

    v_imported_count := v_imported_count + 1;
  END LOOP;

  RETURN v_imported_count;
END;
$$;

GRANT EXECUTE ON FUNCTION public.import_products(UUID, UUID, UUID[]) TO authenticated;

-- ==============================================================================
-- 4.6. PRODUTOS: VARIANTES DE UM PRODUTO DE ORIGEM (RF021 — preview da importação)
-- Lista as variantes (SKU, atributos e imagem) de um produto da org de origem,
-- para o preview expansível da tela de importação. SEM dados de estoque/custo.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.get_source_product_variants(
  p_source_org_id UUID,
  p_product_id UUID
)
RETURNS TABLE (
  id UUID,
  sku TEXT,
  options JSONB,
  image_url TEXT,
  image_public_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- RN017: só enxerga variantes de org de que é membro.
  IF NOT public.is_org_member(p_source_org_id) THEN
    RAISE EXCEPTION 'Acesso negado: Permissão insuficiente.';
  END IF;

  RETURN QUERY
  SELECT
    v.id,
    v.sku,
    v.options,
    img.url AS image_url,
    img.public_id AS image_public_id
  FROM public.product_variants v
  LEFT JOIN LATERAL (
    SELECT pi.url, pi.public_id
    FROM public.product_variant_images pvi
    JOIN public.product_images pi ON pi.id = pvi.image_id
    WHERE pvi.variant_id = v.id
    ORDER BY pvi.is_primary DESC
    LIMIT 1
  ) img ON true
  WHERE v.product_id = p_product_id
    AND v.organization_id = p_source_org_id
    AND v.deleted_at IS NULL
  ORDER BY v.sku ASC;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_source_product_variants(UUID, UUID) TO authenticated;

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
  INSERT INTO public.movements (organization_id, user_id, type, reason, description, order_id, document_number, executed_at)
  VALUES (
    v_org_id,
    v_user_id,
    v_type,
    movement_data->>'reason',
    movement_data->>'description',
    (movement_data->>'order_id')::UUID,
    movement_data->>'document_number',
    COALESCE((movement_data->>'executed_at')::TIMESTAMPTZ, now())
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
    END CASE;

    -- ============================================================
    -- LÓGICA DO CUSTO MÉDIO PONDERADO
    -- ============================================================

    -- A. Se for VARIANTE
    IF v_variant_id IS NOT NULL THEN
      SELECT stock, cost_price INTO v_current_stock, v_current_cost
      FROM public.product_variants WHERE id = v_variant_id;

      -- RN055: saldo não pode ficar negativo em saídas
      IF v_type = 'withdrawal' AND (v_current_stock + v_delta) < 0 THEN
        RAISE EXCEPTION 'Estoque insuficiente — há % disponível.', v_current_stock;
      END IF;

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

      -- RN055: saldo não pode ficar negativo em saídas
      IF v_type = 'withdrawal' AND (v_current_stock + v_delta) < 0 THEN
        RAISE EXCEPTION 'Estoque insuficiente — há % disponível.', v_current_stock;
      END IF;

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
  -- RF013/RN035: o membro replicado compartilha a identidade e já tem acesso,
  -- portanto entra 'active' (sem primeiro acesso), não 'invited'.
  INSERT INTO public.organization_members (organization_id, profile_id, role, status)
  VALUES (p_organization_id, p_user_id, p_role, 'active')
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

-- ==============================================================================
-- 13. EQUIPE: ATUALIZAR FUNÇÃO DO MEMBRO (RF014, RN037)
-- Owner-only. Invariantes do Owner não se expressam bem em RLS, por isso a
-- edição de membro passa por RPC e a tabela não tem UPDATE direto pelo client.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_member_role(
  p_member_id UUID,
  p_role public.app_role
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_target_role public.app_role;
BEGIN
  -- RN037: 'owner' nunca é atribuível.
  IF p_role NOT IN ('manager', 'sales') THEN
    RAISE EXCEPTION 'Função inválida: apenas Gerente ou Vendedor podem ser atribuídos.';
  END IF;

  SELECT organization_id, role INTO v_org_id, v_target_role
  FROM public.organization_members
  WHERE id = p_member_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Membro não encontrado.';
  END IF;

  -- RN020: apenas o Owner da org gere membros.
  IF NOT public.has_role(v_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode gerir membros.';
  END IF;

  -- RN037: o Owner não pode ser rebaixado.
  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'O proprietário não pode ter a função alterada.';
  END IF;

  UPDATE public.organization_members
  SET role = p_role, updated_at = NOW()
  WHERE id = p_member_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_member_role(UUID, public.app_role) TO authenticated;

-- ==============================================================================
-- 14. EQUIPE: ATUALIZAR STATUS DO MEMBRO (RF014, RN036, RN037)
-- Owner-only. 'invited' é estado de sistema (1º acesso), não selecionável.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.update_member_status(
  p_member_id UUID,
  p_status public.member_status
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_target_role public.app_role;
BEGIN
  -- RN036: 'invited' é estado de sistema, não pode ser definido manualmente.
  IF p_status NOT IN ('active', 'inactive') THEN
    RAISE EXCEPTION 'Status inválido: apenas Ativo ou Inativo podem ser definidos.';
  END IF;

  SELECT organization_id, role INTO v_org_id, v_target_role
  FROM public.organization_members
  WHERE id = p_member_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Membro não encontrado.';
  END IF;

  -- RN020: apenas o Owner da org gere membros.
  IF NOT public.has_role(v_org_id, 'owner') THEN
    RAISE EXCEPTION 'Acesso negado: apenas o proprietário pode gerir membros.';
  END IF;

  -- RN037: o próprio Owner não se inativa.
  IF v_target_role = 'owner' THEN
    RAISE EXCEPTION 'O proprietário não pode ter o status alterado.';
  END IF;

  UPDATE public.organization_members
  SET status = p_status, updated_at = NOW()
  WHERE id = p_member_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_member_status(UUID, public.member_status) TO authenticated;
-- ==============================================================================
-- DELETE_CATALOG (CAT-04 · RN061/RN062)
-- Remove um catálogo com guard de canais vinculados no servidor.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.delete_catalog(p_catalog_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_linked_channels INTEGER := 0;
BEGIN
  SELECT organization_id INTO v_org_id
  FROM public.catalogs
  WHERE id = p_catalog_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Catálogo não encontrado.';
  END IF;

  -- RN062: apenas Manager/Owner da organização removem catálogos.
  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem remover catálogos.';
  END IF;

  -- RN061: canais vinculados bloqueiam a remoção. Fonte do PDV (Módulo 7,
  -- PDV-01) já existe; storefronts.catalog_id (Módulo 8) ainda não — quando
  -- existir, somar aqui também. Ex.:
  --   v_linked_channels := v_linked_channels +
  --     (SELECT COUNT(*) FROM public.storefronts WHERE catalog_id = p_catalog_id);
  v_linked_channels := v_linked_channels +
    (SELECT COUNT(*) FROM public.organizations WHERE pdv_catalog_id = p_catalog_id);

  IF v_linked_channels > 0 THEN
    -- Marcador estável mapeado pela UI para a variante B do dialog.
    RAISE EXCEPTION 'CATALOG_HAS_LINKED_CHANNELS';
  END IF;

  -- Cascata remove catalog_items; orders.catalog_id é ON DELETE SET NULL,
  -- então pedidos preservam o histórico (RN061).
  DELETE FROM public.catalogs WHERE id = p_catalog_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_catalog(UUID) TO authenticated;
-- ==============================================================================
-- SET_PDV_CATALOG (PDV-01 · RN065)
-- Vincula um catálogo ao PDV da organização. O catálogo do vínculo é a fonte
-- de verdade dos preços exibidos em /pdv.
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.set_pdv_catalog(p_catalog_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_org_id UUID;
  v_is_active BOOLEAN;
BEGIN
  SELECT organization_id, is_active INTO v_org_id, v_is_active
  FROM public.catalogs
  WHERE id = p_catalog_id;

  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Catálogo não encontrado.';
  END IF;

  IF NOT v_is_active THEN
    RAISE EXCEPTION 'Este catálogo está inativo e não pode ser vinculado ao PDV.';
  END IF;

  -- RN065/RN067: vincular catálogo ao PDV é configuração da organização —
  -- apenas Manager/Owner.
  IF NOT public.has_role(v_org_id, 'manager') THEN
    RAISE EXCEPTION 'Acesso negado: apenas gerentes ou proprietários podem vincular um catálogo ao PDV.';
  END IF;

  UPDATE public.organizations
  SET pdv_catalog_id = p_catalog_id, updated_at = NOW()
  WHERE id = v_org_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.set_pdv_catalog(UUID) TO authenticated;
