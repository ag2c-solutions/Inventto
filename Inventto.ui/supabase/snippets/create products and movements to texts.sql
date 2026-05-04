DO $$
DECLARE
  -- -------------------------------------------------------------------------
  -- 1. VARIÁVEIS DE AMBIENTE
  -- -------------------------------------------------------------------------
  v_user_id UUID:='44138642-cdc7-4f60-b137-5929b51271b7';
  v_org_id UUID := '00000000-0000-0000-0000-000000000002';
  
  -- -------------------------------------------------------------------------
  -- 2. IDs ESTÁTICOS (CONSTANTES)
  -- -------------------------------------------------------------------------
  -- (IDs de atributos removidos pois agora vêm da Migration 08)
  
  v_cat_tech_id UUID   := 'c0000000-0000-0000-0000-000000000001';
  v_cat_office_id UUID := 'c0000000-0000-0000-0000-000000000002';
  v_cat_wear_id UUID   := 'c0000000-0000-0000-0000-000000000003';
  v_cat_peri_id UUID   := 'c0000000-0000-0000-0000-000000000004';
  
  -- -------------------------------------------------------------------------
  -- 3. VARIÁVEIS DE CONTROLE E LOGICA
  -- -------------------------------------------------------------------------
  v_prod_id UUID;
  v_variant_id UUID;
  v_movement_id UUID;
  v_image_id UUID;
  v_cat_ids UUID[];
  
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
  v_base_text_color TEXT;
  
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

  RAISE NOTICE '🚀 SEED V11 INICIADA | User: %', v_user_id;

  -- -------------------------------------------------------------------------
  -- 6. SETUP BÁSICO
  -- -------------------------------------------------------------------------
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (v_user_id, 'Admin User', 'admin@inventto.ui', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Admin User';

  INSERT INTO public.organizations (id, owner_id, name, slug, document, settings)
  VALUES (v_org_id, v_user_id, 'Inventto Demo Store', 'inventto-demo', '12.345.678/0001-90', '{"theme": "system"}')
  ON CONFLICT (id) DO UPDATE SET owner_id = v_user_id;

  INSERT INTO public.organization_members (organization_id, profile_id, role)
  VALUES (v_org_id, v_user_id, 'owner');

  -- -------------------------------------------------------------------------
  -- 7. METADADOS (CATEGORIAS)
  -- -------------------------------------------------------------------------
  -- Attributes agora são ignorados aqui (vêm da Migration 08)
  
  INSERT INTO public.categories (id, organization_id, name) VALUES
    (v_cat_tech_id, v_org_id, 'Tech & Gadgets'), 
    (v_cat_office_id, v_org_id, 'Office'),
    (v_cat_wear_id, v_org_id, 'Wearables'), 
    (v_cat_peri_id, v_org_id, 'Periféricos');
  
  v_cat_ids := ARRAY[v_cat_tech_id, v_cat_office_id, v_cat_wear_id, v_cat_peri_id];

  -- -------------------------------------------------------------------------
  -- 8. GERAÇÃO DE PRODUTOS
  -- -------------------------------------------------------------------------
  FOR i IN 1..15 LOOP
    v_parent_sku := 'INV-' || (3000 + i);
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
      v_org_id, v_prod_name, 'Produto premium.', 
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
       VALUES (v_org_id, v_prod_id, v_img_url, (j = 1), v_prod_name || ' - View ' || j); 
    END LOOP;

    -- === LÓGICA DE VARIANTES ===
    IF (i % 4) <> 0 THEN
       
       -- Seleciona Subconjunto Aleatório
       SELECT array_agg(x) INTO v_selected_colors FROM (SELECT unnest(v_pool_colors) x ORDER BY random() LIMIT (2 + floor(random() * 2))) sub;
       SELECT array_agg(x) INTO v_selected_sizes FROM (SELECT unnest(v_pool_sizes) x ORDER BY random() LIMIT (2 + floor(random() * 2))) sub;

       -- Atributos do Produto (SNAPSHOT - Grava direto na product_attributes)
       INSERT INTO public.product_attributes (organization_id, product_id, label, slug, type, "values") 
       VALUES (v_org_id, v_prod_id, 'Cor', 'cor', 'color', to_jsonb(v_selected_colors));
       
       INSERT INTO public.product_attributes (organization_id, product_id, label, slug, type, "values") 
       VALUES (v_org_id, v_prod_id, 'Tamanho', 'tamanho', 'select', to_jsonb(v_selected_sizes));

       -- Variantes
       FOREACH v_color IN ARRAY v_selected_colors LOOP
         v_color_name := split_part(v_color, '|', 1);
         v_color_hex  := replace(split_part(v_color, '|', 2), '#', '');
         
         FOREACH v_size IN ARRAY v_selected_sizes LOOP
             v_sku_suffix := upper(substring(v_color_name, 1, 3)) || '-' || upper(substring(v_size, 1, 3));
             
             INSERT INTO public.product_variants (
               organization_id, product_id, sku, options, stock, cost_price, minimum_stock
             ) VALUES (
               v_org_id, v_prod_id, v_parent_sku || '-' || v_sku_suffix, 
               jsonb_build_array(
                 jsonb_build_object('name', 'Cor', 'value', v_color),
                 jsonb_build_object('name', 'Tamanho', 'value', v_size)
               ), 0, 0, 5
             ) RETURNING id INTO v_variant_id;
             
             v_img_url := 'https://placehold.co/600x600/' || v_color_hex || '/FFFFFF?text=' || replace(v_prod_name, ' ', '+') || '+' || v_color_name;
             INSERT INTO public.product_images (organization_id, product_id, url, is_primary, name)
             VALUES (v_org_id, v_prod_id, v_img_url, false, v_prod_name || ' ' || v_color_name) RETURNING id INTO v_image_id;
             
             INSERT INTO public.product_variant_images (variant_id, image_id, is_primary) VALUES (v_variant_id, v_image_id, true);
         END LOOP;
       END LOOP;
    END IF;
  END LOOP;


  -- -------------------------------------------------------------------------
  -- 9. SIMULAÇÃO DE ESTOQUE (MOVIMENTAÇÕES)
  -- -------------------------------------------------------------------------
  FOR r_prod IN SELECT * FROM public.products WHERE organization_id = v_org_id
  LOOP
    v_initial_cost := (random() * 50 + 20)::NUMERIC(10,2);
    v_sale_price   := v_initial_cost * 2.5;
    
    IF r_prod.has_variants THEN
      FOR r_variant IN SELECT * FROM public.product_variants WHERE product_id = r_prod.id LOOP
          -- Entrada
          v_qty_entry := floor(random() * 50 + 20)::int;
          v_doc_number := 'NF-' || floor(random() * 90000 + 10000)::text;
          
          INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at) 
          VALUES (v_org_id, v_user_id, 'entry', 'Seed Entry', v_doc_number, NOW() - INTERVAL '30 days') 
          RETURNING id INTO v_movement_id;
          
          INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost) 
          VALUES (v_movement_id, r_prod.id, r_variant.id, v_qty_entry, v_initial_cost);
          
          UPDATE public.product_variants SET stock = stock + v_qty_entry, cost_price = v_initial_cost WHERE id = r_variant.id;
          
          -- Saída
          v_qty_withdrawal := floor(random() * (v_qty_entry - 5) + 1)::int;
          v_doc_number := 'PDV-' || floor(random() * 90000 + 10000)::text;
          
          INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at) 
          VALUES (v_org_id, v_user_id, 'withdrawal', 'Seed Sale', v_doc_number, NOW() - INTERVAL '10 days') 
          RETURNING id INTO v_movement_id;
          
          INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost, unit_price) 
          VALUES (v_movement_id, r_prod.id, r_variant.id, v_qty_withdrawal, v_initial_cost, v_sale_price);
          
          UPDATE public.product_variants SET stock = stock - v_qty_withdrawal WHERE id = r_variant.id;
      END LOOP;
    ELSE
          -- Produto Simples
          v_qty_entry := floor(random() * 80 + 20)::int;
          v_doc_number := 'NF-' || floor(random() * 90000 + 10000)::text;
          
          INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at) 
          VALUES (v_org_id, v_user_id, 'entry', 'Seed Entry', v_doc_number, NOW() - INTERVAL '60 days') 
          RETURNING id INTO v_movement_id;
          
          INSERT INTO public.movement_items (movement_id, product_id, quantity, unit_cost) 
          VALUES (v_movement_id, r_prod.id, v_qty_entry, v_initial_cost);
          
          UPDATE public.products SET stock = stock + v_qty_entry, cost_price = v_initial_cost WHERE id = r_prod.id;
          
          -- Saída
          v_qty_withdrawal := floor(random() * (v_qty_entry - 10) + 1)::int;
          v_doc_number := 'PDV-' || floor(random() * 90000 + 10000)::text;
          
          INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at) 
          VALUES (v_org_id, v_user_id, 'withdrawal', 'Seed Sale', v_doc_number, NOW() - INTERVAL '5 days') 
          RETURNING id INTO v_movement_id;
          
          INSERT INTO public.movement_items (movement_id, product_id, quantity, unit_cost, unit_price) 
          VALUES (v_movement_id, r_prod.id, v_qty_withdrawal, v_initial_cost, v_sale_price);
          
          UPDATE public.products SET stock = stock - v_qty_withdrawal WHERE id = r_prod.id;
    END IF;
  END LOOP;

  RAISE NOTICE '✅ SEED FINALIZADA COM SUCESSO!';
END $$;