DO $$
DECLARE
  -- -------------------------------------------------------------------------
  -- 1. VARIÁVEIS DE AMBIENTE
  -- -------------------------------------------------------------------------
  v_user_id UUID:='9fe990c2-39e1-4ca1-84eb-c3a7911e80c0';

  -- Org A (loja principal — é a referenciada pelo app/login)
  v_org_id   UUID := 'a28808c6-ae0d-4374-9ac2-53acd3b5aec2';
  v_org_id_b UUID := 'a2a80ef3-7db7-4ccd-a670-5ccb7c4813a1';

  -- Multi-org: arrays paralelos para gerar as duas unidades no mesmo loop.
  v_org_ids      UUID[] := ARRAY[v_org_id, v_org_id_b];
  v_org_names    TEXT[] := ARRAY['Inventto Demo Store'];
  v_org_docs     TEXT[] := ARRAY['12.345.678/0001-90'];
  v_org_prefixes TEXT[] := ARRAY['INV'];
  v_org_counts   INT[]  := ARRAY[15, 8];

  v_org_idx INT;
  v_current_org UUID;
  v_prefix TEXT;
  v_count INT;

  -- -------------------------------------------------------------------------
  -- 3. VARIÁVEIS DE CONTROLE E LOGICA
  -- -------------------------------------------------------------------------
  v_prod_id UUID;
  v_variant_id UUID;
  v_movement_id UUID;
  v_image_id UUID;
  v_cat_ids UUID[];

  -- Pré-importação (demonstra badge "Já importado" + preview de variantes)
  v_new_prod_id UUID;

  -- Arrays de Opções (Para gerar os Snapshots nos produtos)
  v_pool_colors TEXT[] := ARRAY['Midnight|#1e293b', 'White|#FFFFFF', 'Red Alert|#EF4444', 'Ocean Blue|#3B82F6', 'Emerald|#10B981'];
  v_pool_sizes TEXT[] := ARRAY['Standard', 'Pro', 'Max', 'Ultra'];

  -- Auxiliares de Loop
  i INT;
  j INT;

  -- Seleção de Atributos
  v_selected_colors TEXT[];
  v_selected_sizes TEXT[];
  v_color TEXT;
  v_size TEXT;
  v_color_name TEXT;
  v_color_hex TEXT;
  v_sku_suffix TEXT;

  -- Dados do Produto
  v_prod_name TEXT;
  v_img_url TEXT;
  v_parent_sku TEXT;
  v_base_bg_color TEXT;

  -- Dados Financeiros
  v_min_stock INT;
  v_initial_cost NUMERIC;
  v_sale_price NUMERIC;
  v_qty_entry INT;
  v_qty_withdrawal INT;
  v_doc_number TEXT;

  -- Declaração dos Records
  r_prod RECORD;
  r_variant RECORD;

BEGIN
  v_org_ids := ARRAY[v_org_id];

  -- -------------------------------------------------------------------------
  -- 4. HARD RESET (LIMPEZA TOTAL - EXCETO ATTRIBUTES)
  -- -------------------------------------------------------------------------
  RAISE NOTICE '🧹 EXECUTANDO LIMPEZA DE DADOS DE TESTE...';

  -- OBS: public.attributes removida do truncate para preservar a Migration 08
  TRUNCATE TABLE
    public.movement_items,
    public.movements,
    public.product_variant_images,
    public.product_variants,
    public.product_images,
    public.product_attributes,
    public.product_categories,
    public.products,
    public.categories,
    public.organization_members,
    public.organizations,
    public.profiles
  CASCADE;

  -- -------------------------------------------------------------------------
  -- 5. VALIDAÇÃO DE USUÁRIO
  -- -------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
     SELECT id INTO v_user_id FROM auth.users LIMIT 1;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ ERRO: Nenhum usuário encontrado em auth.users.';
  END IF;

  RAISE NOTICE '🚀 SEED V12 (multi-org) INICIADA | User: %', v_user_id;

  -- -------------------------------------------------------------------------
  -- 6. SETUP BÁSICO (PROFILE + 2 ORGANIZAÇÕES DO MESMO TENANT)
  -- -------------------------------------------------------------------------
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (v_user_id, 'Admin User', 'admin@inventto.ui', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Admin User';

  -- O mesmo usuário é Owner das duas unidades → habilita a importação (RF021).
  FOR v_org_idx IN 1..array_length(v_org_ids, 1) LOOP
    INSERT INTO public.organizations (id, owner_id, name, document, settings)
    VALUES (v_org_ids[v_org_idx], v_user_id, v_org_names[v_org_idx], v_org_docs[v_org_idx], '{"theme": "system"}')
    ON CONFLICT (id) DO UPDATE SET owner_id = v_user_id;

    INSERT INTO public.organization_members (organization_id, profile_id, role)
    VALUES (v_org_ids[v_org_idx], v_user_id, 'owner');
  END LOOP;

  -- -------------------------------------------------------------------------
  -- 7 + 8 + 9. POR ORGANIZAÇÃO: CATEGORIAS, PRODUTOS E MOVIMENTAÇÕES
  -- -------------------------------------------------------------------------
  FOR v_org_idx IN 1..array_length(v_org_ids, 1) LOOP
    v_current_org := v_org_ids[v_org_idx];
    v_prefix := v_org_prefixes[v_org_idx];
    v_count := v_org_counts[v_org_idx];

    RAISE NOTICE '🏬 Populando org % (%): % produtos', v_org_idx, v_org_names[v_org_idx], v_count;

    -- 7. CATEGORIAS (ids dinâmicos — únicos por organização)
    INSERT INTO public.categories (organization_id, name) VALUES
      (v_current_org, 'Tech & Gadgets'),
      (v_current_org, 'Office'),
      (v_current_org, 'Wearables'),
      (v_current_org, 'Periféricos');

    SELECT array_agg(id) INTO v_cat_ids
    FROM public.categories WHERE organization_id = v_current_org;

    -- 8. GERAÇÃO DE PRODUTOS
    FOR i IN 1..v_count LOOP
      v_parent_sku := v_prefix || '-' || (3000 + i);
      v_min_stock := floor(random() * 10 + 5)::int;

      v_prod_name := CASE (i % 5)
        WHEN 0 THEN 'Ultra Monitor ' || i
        WHEN 1 THEN 'Ergo Chair ' || i
        WHEN 2 THEN 'Gaming Headset ' || i
        WHEN 3 THEN 'Mech Keyboard ' || i
        ELSE 'Smart Mouse ' || i
      END;

      v_base_bg_color := CASE WHEN (i % 2) = 0 THEN '1e293b' ELSE '475569' END;

      -- Insert Produto Pai
      INSERT INTO public.products (organization_id, name, description, has_variants, sku, stock, cost_price, minimum_stock, is_active)
      VALUES (
        v_current_org, v_prod_name, 'Produto premium.',
        CASE WHEN (i % 4) = 0 THEN false ELSE true END,
        v_parent_sku, 0, 0, v_min_stock, true
      ) RETURNING id INTO v_prod_id;

      -- Vincula Categoria
      INSERT INTO public.product_categories (product_id, category_id)
      VALUES (v_prod_id, v_cat_ids[1 + floor(random() * array_length(v_cat_ids, 1))]);

      -- Imagens Pai
      FOR j IN 1..3 LOOP
         v_img_url := 'https://placehold.co/600x600/' || v_base_bg_color || '/FFFFFF?text=' || replace(v_prod_name, ' ', '+') || '+View+' || j;
         INSERT INTO public.product_images (organization_id, product_id, url, is_primary, name)
         VALUES (v_current_org, v_prod_id, v_img_url, (j = 1), v_prod_name || ' - View ' || j);
      END LOOP;

      -- === LÓGICA DE VARIANTES ===
      IF (i % 4) <> 0 THEN

         -- Seleciona Subconjunto Aleatório
         SELECT array_agg(x) INTO v_selected_colors FROM (SELECT unnest(v_pool_colors) x ORDER BY random() LIMIT (2 + floor(random() * 2))) sub;
         SELECT array_agg(x) INTO v_selected_sizes FROM (SELECT unnest(v_pool_sizes) x ORDER BY random() LIMIT (2 + floor(random() * 2))) sub;

         -- Atributos do Produto (SNAPSHOT - Grava direto na product_attributes)
         INSERT INTO public.product_attributes (organization_id, product_id, label, slug, type, "values")
         VALUES (v_current_org, v_prod_id, 'Cor', 'cor', 'color', to_jsonb(v_selected_colors));

         INSERT INTO public.product_attributes (organization_id, product_id, label, slug, type, "values")
         VALUES (v_current_org, v_prod_id, 'Tamanho', 'tamanho', 'select', to_jsonb(v_selected_sizes));

         -- Variantes
         FOREACH v_color IN ARRAY v_selected_colors LOOP
           v_color_name := split_part(v_color, '|', 1);
           v_color_hex  := replace(split_part(v_color, '|', 2), '#', '');

           FOREACH v_size IN ARRAY v_selected_sizes LOOP
               v_sku_suffix := upper(substring(v_color_name, 1, 3)) || '-' || upper(substring(v_size, 1, 3));

               INSERT INTO public.product_variants (
                 organization_id, product_id, sku, options, stock, cost_price, minimum_stock
               ) VALUES (
                 v_current_org, v_prod_id, v_parent_sku || '-' || v_sku_suffix,
                 jsonb_build_array(
                   jsonb_build_object('name', 'Cor', 'value', v_color),
                   jsonb_build_object('name', 'Tamanho', 'value', v_size)
                 ), 0, 0, 5
               ) RETURNING id INTO v_variant_id;

               v_img_url := 'https://placehold.co/600x600/' || v_color_hex || '/FFFFFF?text=' || replace(v_prod_name, ' ', '+') || '+' || v_color_name;
               INSERT INTO public.product_images (organization_id, product_id, url, is_primary, name)
               VALUES (v_current_org, v_prod_id, v_img_url, false, v_prod_name || ' ' || v_color_name) RETURNING id INTO v_image_id;

               INSERT INTO public.product_variant_images (variant_id, image_id, is_primary) VALUES (v_variant_id, v_image_id, true);
           END LOOP;
         END LOOP;
      END IF;
    END LOOP;

    -- 9. SIMULAÇÃO DE ESTOQUE (MOVIMENTAÇÕES) — apenas desta organização
    
    -- 9.1 Entradas Iniciais (purchase - Compra)
    -- Vamos criar 4 notas fiscais de entrada contendo múltiplos itens
    FOR i IN 1..4 LOOP
      v_doc_number := 'NF-' || floor(random() * 90000 + 10000)::text;
      
      INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
      VALUES (v_current_org, v_user_id, 'entry', 'purchase', v_doc_number, NOW() - (random() * 30 + 30) * INTERVAL '1 day')
      RETURNING id INTO v_movement_id;

      -- Adiciona de 3 a 8 itens variados por nota
      FOR r_variant IN 
        SELECT p.id as p_id, v.id as v_id, p.has_variants 
        FROM public.products p 
        LEFT JOIN public.product_variants v ON v.product_id = p.id
        WHERE p.organization_id = v_current_org
        ORDER BY random() LIMIT (floor(random() * 6 + 3)::int)
      LOOP
        v_initial_cost := (random() * 50 + 20)::NUMERIC(10,2);
        v_qty_entry := floor(random() * 30 + 10)::int;
        
        INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost)
        VALUES (v_movement_id, r_variant.p_id, r_variant.v_id, v_qty_entry, v_initial_cost);
        
        IF r_variant.has_variants THEN
          UPDATE public.product_variants SET stock = stock + v_qty_entry, cost_price = v_initial_cost WHERE id = r_variant.v_id;
        ELSE
          UPDATE public.products SET stock = stock + v_qty_entry, cost_price = v_initial_cost WHERE id = r_variant.p_id;
        END IF;
      END LOOP;
    END LOOP;

    -- 9.2 Vendas (sale)
    -- Vamos criar 12 vendas com múltiplos itens
    FOR i IN 1..12 LOOP
      v_doc_number := 'PDV-' || floor(random() * 90000 + 10000)::text;
      
      INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
      VALUES (v_current_org, v_user_id, 'withdrawal', 'sale', v_doc_number, NOW() - (random() * 20 + 5) * INTERVAL '1 day')
      RETURNING id INTO v_movement_id;

      -- Adiciona de 1 a 4 itens por venda
      FOR r_variant IN 
        SELECT p.id as p_id, v.id as v_id, p.has_variants, 
               COALESCE(v.cost_price, p.cost_price) as c_price, 
               COALESCE(v.stock, p.stock) as curr_stock
        FROM public.products p 
        LEFT JOIN public.product_variants v ON v.product_id = p.id
        WHERE p.organization_id = v_current_org AND COALESCE(v.stock, p.stock) > 0
        ORDER BY random() LIMIT (floor(random() * 4 + 1)::int)
      LOOP
        v_sale_price := r_variant.c_price * 2.5;
        v_qty_withdrawal := floor(random() * 3 + 1)::int;
        
        IF v_qty_withdrawal > r_variant.curr_stock THEN
           v_qty_withdrawal := r_variant.curr_stock;
        END IF;
        
        IF v_qty_withdrawal > 0 THEN
          INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost, unit_price)
          VALUES (v_movement_id, r_variant.p_id, r_variant.v_id, v_qty_withdrawal, r_variant.c_price, v_sale_price);
          
          IF r_variant.has_variants THEN
            UPDATE public.product_variants SET stock = stock - v_qty_withdrawal WHERE id = r_variant.v_id;
          ELSE
            UPDATE public.products SET stock = stock - v_qty_withdrawal WHERE id = r_variant.p_id;
          END IF;
        END IF;
      END LOOP;
    END LOOP;

    -- 9.3 Outros (Devolução, Perda, Consumo, Inventário)
    FOR i IN 1..4 LOOP
      -- Alterna entre motivos diferentes
      IF i = 1 THEN
        -- return_in (Devolução de Cliente)
        INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
        VALUES (v_current_org, v_user_id, 'entry', 'return_in', 'DEV-' || floor(random() * 900 + 100)::text, NOW() - (random() * 5 + 1) * INTERVAL '1 day')
        RETURNING id INTO v_movement_id;
      ELSIF i = 2 THEN
        -- loss (Perda/Avaria)
        INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
        VALUES (v_current_org, v_user_id, 'withdrawal', 'loss', NULL, NOW() - (random() * 5 + 1) * INTERVAL '1 day')
        RETURNING id INTO v_movement_id;
      ELSIF i = 3 THEN
        -- consumption (Consumo interno)
        INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
        VALUES (v_current_org, v_user_id, 'withdrawal', 'consumption', NULL, NOW() - (random() * 5 + 1) * INTERVAL '1 day')
        RETURNING id INTO v_movement_id;
      ELSE
        -- inventory (Ajuste de balanço - entrada)
        INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
        VALUES (v_current_org, v_user_id, 'entry', 'inventory', 'BAL-2026', NOW() - (random() * 5 + 1) * INTERVAL '1 day')
        RETURNING id INTO v_movement_id;
      END IF;

      -- Adiciona de 1 a 2 itens nestas movimentações avulsas
      FOR r_variant IN 
        SELECT p.id as p_id, v.id as v_id, p.has_variants, COALESCE(v.cost_price, p.cost_price, 25.0) as c_price
        FROM public.products p 
        LEFT JOIN public.product_variants v ON v.product_id = p.id
        WHERE p.organization_id = v_current_org
        ORDER BY random() LIMIT (floor(random() * 2 + 1)::int)
      LOOP
        v_qty_withdrawal := floor(random() * 2 + 1)::int;
        
        INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost)
        VALUES (v_movement_id, r_variant.p_id, r_variant.v_id, v_qty_withdrawal, r_variant.c_price);
        
        IF r_variant.has_variants THEN
          IF i = 1 OR i = 4 THEN
            UPDATE public.product_variants SET stock = stock + v_qty_withdrawal WHERE id = r_variant.v_id;
          ELSE
            UPDATE public.product_variants SET stock = stock - v_qty_withdrawal WHERE id = r_variant.v_id;
          END IF;
        ELSE
          IF i = 1 OR i = 4 THEN
            UPDATE public.products SET stock = stock + v_qty_withdrawal WHERE id = r_variant.p_id;
          ELSE
            UPDATE public.products SET stock = stock - v_qty_withdrawal WHERE id = r_variant.p_id;
          END IF;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;

  -- -------------------------------------------------------------------------
  -- 10. PRÉ-IMPORTAÇÃO (DEMO DO RF021)
  -- Copia 2 produtos da Filial (origem) para a Demo Store, propagando
  -- product_family_id e ESTOQUE ZERO (RN039/RN047). Assim a tela de Importar
  -- já abre com itens "Já importado" e com o preview de variantes populado.
  -- -------------------------------------------------------------------------
  RAISE NOTICE '📦 Pré-importando 2 produtos da Filial Norte → Demo Store...';

  FOR r_prod IN
    SELECT * FROM public.products
    WHERE organization_id = v_org_id_b
    ORDER BY sku
    LIMIT 2
  LOOP
    INSERT INTO public.products (
      organization_id, name, description, has_variants, sku,
      stock, cost_price, minimum_stock, is_active, product_family_id
    )
    VALUES (
      v_org_id, r_prod.name, r_prod.description, r_prod.has_variants, r_prod.sku || '-IMP',
      0, 0, r_prod.minimum_stock, true,
      -- Herda a família da origem: demonstra dedupe multi-nível (RN048)
      r_prod.product_family_id
    )
    RETURNING id INTO v_new_prod_id;

    -- Categorias: mapeadas por nome para a org destino
    INSERT INTO public.product_categories (product_id, category_id)
    SELECT v_new_prod_id, c_dst.id
    FROM public.product_categories pc
    JOIN public.categories c_src ON c_src.id = pc.category_id
    JOIN public.categories c_dst ON c_dst.name = c_src.name AND c_dst.organization_id = v_org_id
    WHERE pc.product_id = r_prod.id;

    -- Atributos (snapshot)
    INSERT INTO public.product_attributes (organization_id, product_id, label, slug, type, "values")
    SELECT v_org_id, v_new_prod_id, label, slug, type, "values"
    FROM public.product_attributes WHERE product_id = r_prod.id;

    -- Imagem primária do produto
    INSERT INTO public.product_images (organization_id, product_id, url, is_primary, name)
    SELECT v_org_id, v_new_prod_id, url, is_primary, name
    FROM public.product_images
    WHERE product_id = r_prod.id AND is_primary = true;

    -- Variantes (estoque zero)
    FOR r_variant IN SELECT * FROM public.product_variants WHERE product_id = r_prod.id LOOP
      INSERT INTO public.product_variants (organization_id, product_id, sku, options, stock, cost_price, minimum_stock)
      VALUES (v_org_id, v_new_prod_id, r_variant.sku || '-IMP', r_variant.options, 0, 0, 5);
    END LOOP;
  END LOOP;

  RAISE NOTICE '✅ SEED FINALIZADA COM SUCESSO! (2 orgs + pré-importação)';
END $$;
