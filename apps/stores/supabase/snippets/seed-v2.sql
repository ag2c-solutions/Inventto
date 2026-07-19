DO $$
DECLARE
  -- -------------------------------------------------------------------------
  -- 1. VARIÁVEIS DE AMBIENTE
  -- -------------------------------------------------------------------------
  v_user_id UUID:='9fe990c2-39e1-4ca1-84eb-c3a7911e80c0';

  -- Vendedor demo (papel Sales — MOV-08/PROD-10): a própria seed cria o usuário
  -- em auth.users se não existir. Login real na UI: vendedor@inventto.ui · Vendedor@123
  v_sales_user_id UUID := 'b5f3d0c8-4b1e-4e58-9d2a-7c94a1e6f302';
  v_owner_email TEXT;

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
  v_reason_idx INT;

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

  -- -------------------------------------------------------------------------
  -- 2. CATÁLOGO · VITRINE · PEDIDOS (PED-01)
  -- -------------------------------------------------------------------------
  v_catalog_id UUID;
  v_storefront_id UUID;
  v_order_id UUID;

  -- Pool/Em atendimento ficam recentes (Kanban "ao vivo" — não faz sentido um
  -- pending de 90 dias atrás); Finalizados/Cancelados/Expirados são o
  -- histórico e por isso são a maioria, espalhados pelos últimos 120 dias
  -- (RF037: dashboard filtra até 90d — 120 garante dado nas bordas do filtro).
  v_order_statuses public.order_status[] := ARRAY[
    'pending','pending','pending','pending','pending',
    'confirming','confirming','confirming',
    'picking','picking','picking',
    'delivering','delivering','delivering',
    'confirmed','confirmed','confirmed','confirmed','confirmed',
    'confirmed','confirmed','confirmed','confirmed','confirmed',
    'confirmed','confirmed','confirmed','confirmed','confirmed',
    'confirmed','confirmed','confirmed','confirmed','confirmed',
    'confirmed','confirmed','confirmed','confirmed','confirmed',
    'confirmed','confirmed','confirmed','confirmed','confirmed',
    'cancelled','cancelled','cancelled','cancelled',
    'cancelled','cancelled','cancelled','cancelled',
    'expired','expired','expired','expired',
    'expired','expired','expired','expired'
  ]::public.order_status[];
  v_order_status public.order_status;

  -- Precisa bater exatamente com ORDER_CANCEL_REASONS (features/orders/
  -- domain/validators) — cancellation_reason agora é enum real (MOV-06),
  -- não aceita mais sinônimos improvisados.
  v_cancel_reasons TEXT[] := ARRAY[
    'Falta de estoque', 'Cliente solicitou', 'Dados inválidos', 'Área não atendida'
  ];
  v_addresses TEXT[] := ARRAY[
    '{"zip_code":"01310-100","street":"Av. Paulista","number":"1000","neighborhood":"Bela Vista","city":"São Paulo","state":"SP"}',
    '{"zip_code":"88015-200","street":"Av. Beira-Mar Norte","number":"1040","neighborhood":"Centro","city":"Florianópolis","state":"SC"}',
    '{"zip_code":"51020-090","street":"Travessa do Carmo","number":"47","neighborhood":"Boa Viagem","city":"Recife","state":"PE"}',
    '{"zip_code":"01410-001","street":"Rua das Acácias","number":"218","complement":"Apto 52","neighborhood":"Jardim Paulista","city":"São Paulo","state":"SP"}'
  ];
  v_cust_names TEXT[] := ARRAY[
    'Mariana Costa','Rafael Souza','Beatriz Lima','Paulo Mendes','Carla Dias',
    'Lucas Antunes','Helena Rocha','Diego Farias','Tânia Melo','André Pinto',
    'Fernanda Alves','Bruno Cardoso','Camila Torres','Eduardo Ramos','Juliana Prado',
    'Marcelo Nunes','Patrícia Gomes','Rodrigo Silva','Vanessa Cruz','Igor Barbosa',
    'Larissa Freitas','Thiago Moraes','Renata Vieira','Gustavo Pires'
  ];

  v_seller_id UUID;
  v_claimed_at TIMESTAMPTZ;
  v_expires_at TIMESTAMPTZ;
  v_finalized_at TIMESTAMPTZ;
  v_cancellation_reason TEXT;
  v_payment_method public.payment_method;
  v_delivery_address JSONB;
  v_age_minutes NUMERIC;
  v_order_created_at TIMESTAMPTZ;

  v_item_product_id UUID;
  v_item_variant_id UUID;
  v_item_price NUMERIC;
  v_item_name TEXT;
  v_item_qty INT;
  v_item_available INT;
  v_order_total NUMERIC;
  v_reservation_status TEXT;
  k INT;

BEGIN
  v_org_ids := ARRAY[v_org_id];

  -- -------------------------------------------------------------------------
  -- 4. RESOLUÇÃO DE USUÁRIOS (ANTES do reset — para herdar o dono dos dados
  -- atuais; depois do TRUNCATE não haveria mais organizations p/ consultar)
  -- -------------------------------------------------------------------------
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_user_id) THEN
     -- Fallback determinístico: 1º o dono das organizações existentes (re-run
     -- preserva o login que o humano já usa); senão o auth user mais antigo.
     -- Nunca o vendedor (que é criado por esta seed).
     SELECT owner_id INTO v_user_id FROM public.organizations
     WHERE owner_id <> v_sales_user_id LIMIT 1;

     IF v_user_id IS NULL THEN
       SELECT id INTO v_user_id FROM auth.users
       WHERE id <> v_sales_user_id ORDER BY created_at LIMIT 1;
     END IF;
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '❌ ERRO: Nenhum usuário encontrado em auth.users.';
  END IF;

  SELECT email INTO v_owner_email FROM auth.users WHERE id = v_user_id;

  -- -------------------------------------------------------------------------
  -- 5. HARD RESET (LIMPEZA TOTAL - EXCETO ATTRIBUTES)
  -- -------------------------------------------------------------------------
  RAISE NOTICE '🧹 EXECUTANDO LIMPEZA DE DADOS DE TESTE...';

  -- OBS: public.attributes fica de fora para preservar a Migration 08.
  -- DELETE em vez de TRUNCATE CASCADE: TRUNCATE exige AccessExclusiveLock em
  -- TODAS as tabelas arrastadas pelo CASCADE de uma vez (inclusive orders/
  -- catalogs/storefronts, que nem apareciam na lista), e isso colide com
  -- qualquer leitura concorrente em prod (PostgREST/Realtime/dashboard) →
  -- deadlock (40P01). DELETE usa RowExclusiveLock, que não bloqueia SELECTs.
  -- O restante das tabelas (product_variants, product_images, catalogs,
  -- storefronts, order_items, stock_reservations, etc.) já cai via ON DELETE
  -- CASCADE das FKs; só movements/orders/organizations/profiles precisam de
  -- DELETE explícito porque as FKs deles para organizations/profiles não têm
  -- cascade — a ordem abaixo é obrigatória por causa disso.
  DELETE FROM public.movements;
  DELETE FROM public.orders;
  DELETE FROM public.organizations;
  DELETE FROM public.profiles;

  -- 5.1 VENDEDOR (papel Sales) — cria o usuário auth se não existir (idempotente;
  -- sobrevive a re-runs porque a seed NÃO trunca auth.users). No primeiro run o
  -- trigger on_auth_user_created cria o profile (sem company_name no metadata,
  -- não cria organização); nos re-runs o profile é recriado na seção 6.
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = v_sales_user_id) THEN
    INSERT INTO auth.users (
      instance_id, id, aud, role, email, encrypted_password,
      email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
      created_at, updated_at, confirmation_token, recovery_token,
      email_change_token_new, email_change
    ) VALUES (
      '00000000-0000-0000-0000-000000000000', v_sales_user_id,
      'authenticated', 'authenticated', 'vendedor@inventto.ui',
      extensions.crypt('Vendedor@123', extensions.gen_salt('bf')),
      now(), '{"provider":"email","providers":["email"]}'::jsonb,
      '{"full_name":"Vendedor Demo"}'::jsonb,
      now(), now(), '', '', '', ''
    );

    INSERT INTO auth.identities (
      id, user_id, provider_id, identity_data, provider,
      last_sign_in_at, created_at, updated_at
    ) VALUES (
      gen_random_uuid(), v_sales_user_id, v_sales_user_id::text,
      jsonb_build_object('sub', v_sales_user_id::text, 'email', 'vendedor@inventto.ui', 'email_verified', true),
      'email', now(), now(), now()
    ) ON CONFLICT (provider_id, provider) DO NOTHING;

    RAISE NOTICE '👤 Vendedor criado em auth.users (vendedor@inventto.ui · Vendedor@123)';
  END IF;

  RAISE NOTICE '🚀 SEED V13 (org + vendedor Sales) INICIADA | Owner: % | Vendedor: %', v_user_id, v_sales_user_id;

  -- -------------------------------------------------------------------------
  -- 6. SETUP BÁSICO (PROFILE + 2 ORGANIZAÇÕES DO MESMO TENANT)
  -- -------------------------------------------------------------------------
  -- E-mail do profile = e-mail REAL do auth user (o login não muda com a seed).
  INSERT INTO public.profiles (id, full_name, email, avatar_url)
  VALUES (v_user_id, 'Admin User', v_owner_email, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin')
  ON CONFLICT (id) DO UPDATE SET full_name = 'Admin User', email = v_owner_email;

  -- O mesmo usuário é Owner das duas unidades → habilita a importação (RF021).
  FOR v_org_idx IN 1..array_length(v_org_ids, 1) LOOP
    INSERT INTO public.organizations (id, owner_id, name, document, settings)
    VALUES (v_org_ids[v_org_idx], v_user_id, v_org_names[v_org_idx], v_org_docs[v_org_idx], '{"theme": "system"}')
    ON CONFLICT (id) DO UPDATE SET owner_id = v_user_id;

    INSERT INTO public.organization_members (organization_id, profile_id, role)
    VALUES (v_org_ids[v_org_idx], v_user_id, 'owner');
  END LOOP;

  -- Vendedor: profile explícito (o trigger só cobre o primeiro run — nos re-runs
  -- o TRUNCATE apaga profiles e o usuário auth já existe, então o trigger não
  -- dispara) + papel 'sales' SÓ na org principal. Com ele dá para logar na UI e
  -- exercitar o recorte do Sales de verdade: PDV/lista via RPCs sanitizadas
  -- (PROD-10), histórico próprio sem custo e sem registro manual (MOV-08).
  INSERT INTO public.profiles (id, full_name, email, avatar_url, must_change_password)
  VALUES (v_sales_user_id, 'Vendedor Demo', 'vendedor@inventto.ui', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vendedor', false)
  ON CONFLICT (id) DO UPDATE SET full_name = 'Vendedor Demo', must_change_password = false;

  INSERT INTO public.organization_members (organization_id, profile_id, role, status)
  VALUES (v_org_id, v_sales_user_id, 'sales', 'active');

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
    -- 12 notas fiscais de entrada espalhadas pelos últimos 120 dias (compras
    -- periódicas de reposição), cada uma com múltiplos itens.
    FOR i IN 1..12 LOOP
      v_doc_number := 'NF-' || floor(random() * 90000 + 10000)::text;

      INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
      VALUES (v_current_org, v_user_id, 'entry', 'purchase', v_doc_number, NOW() - (random() * 115 + 5) * INTERVAL '1 day')
      RETURNING id INTO v_movement_id;

      -- Adiciona de 4 a 9 itens variados por nota
      FOR r_variant IN
        SELECT p.id as p_id, v.id as v_id, p.has_variants
        FROM public.products p
        LEFT JOIN public.product_variants v ON v.product_id = p.id
        WHERE p.organization_id = v_current_org
        ORDER BY random() LIMIT (floor(random() * 6 + 4)::int)
      LOOP
        v_initial_cost := (random() * 50 + 20)::NUMERIC(10,2);
        v_qty_entry := floor(random() * 30 + 15)::int;
        
        INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost)
        VALUES (v_movement_id, r_variant.p_id, r_variant.v_id, v_qty_entry, v_initial_cost);
        
        IF r_variant.has_variants THEN
          UPDATE public.product_variants SET stock = stock + v_qty_entry, cost_price = v_initial_cost WHERE id = r_variant.v_id;
        ELSE
          UPDATE public.products SET stock = stock + v_qty_entry, cost_price = v_initial_cost WHERE id = r_variant.p_id;
        END IF;
      END LOOP;
    END LOOP;

    -- 9.2 Vendas de Balcão (PDV · channel='pos') — RF037/RN090/RN091: gera o
    -- pedido em orders (o que get_sales_summary/get_recent_activity de fato
    -- leem pro dashboard/atalhos) junto com a baixa de estoque em movements,
    -- espelhando o par que create_pos_sale grava em produção. catalog_id fica
    -- NULL aqui (o catálogo só existe depois, na seção 9.4) e é preenchido
    -- num UPDATE logo após ela. 36 vendas espalhadas pelos últimos 120 dias.
    FOR i IN 1..36 LOOP
      v_doc_number := 'PDV-' || floor(random() * 90000 + 10000)::text;
      v_order_created_at := NOW() - (random() * 119 + 1) * INTERVAL '1 day';

      -- 1/3 das vendas são do Vendedor — popula o histórico próprio dele
      -- (MOV-08/RF038: Sales vê só as suas movimentações/vendas, via RPC
      -- sanitizada).
      v_seller_id := CASE WHEN v_current_org = v_org_id AND i % 3 = 0 THEN v_sales_user_id ELSE v_user_id END;
      v_payment_method := (ARRAY['pix', 'card', 'cash'])[1 + floor(random() * 3)::int]::public.payment_method;

      INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
      VALUES (v_current_org, v_seller_id, 'withdrawal', 'sale', v_doc_number, v_order_created_at)
      RETURNING id INTO v_movement_id;

      -- Pedido de balcão correspondente — já nasce 'confirmed' e sem
      -- finalized_at (o dashboard usa COALESCE(finalized_at, created_at)
      -- pra vendas de balcão, que nunca recebem finalized_at).
      INSERT INTO public.orders (
        organization_id, seller_id, channel, status,
        total_amount, payment_method, amount_paid, created_at
      ) VALUES (
        v_current_org, v_seller_id, 'pos', 'confirmed',
        0, v_payment_method, NULL, v_order_created_at
      )
      RETURNING id INTO v_order_id;

      v_order_total := 0;

      -- Adiciona de 1 a 4 itens por venda
      FOR r_variant IN
        SELECT p.id as p_id, v.id as v_id, p.name as p_name, p.has_variants,
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

          INSERT INTO public.order_items (order_id, product_id, variant_id, quantity, unit_price, reference_price, discount_amount, product_name_snapshot)
          VALUES (v_order_id, r_variant.p_id, r_variant.v_id, v_qty_withdrawal, v_sale_price, v_sale_price, 0, r_variant.p_name);

          IF r_variant.has_variants THEN
            UPDATE public.product_variants SET stock = stock - v_qty_withdrawal WHERE id = r_variant.v_id;
          ELSE
            UPDATE public.products SET stock = stock - v_qty_withdrawal WHERE id = r_variant.p_id;
          END IF;

          v_order_total := v_order_total + (v_sale_price * v_qty_withdrawal);
        END IF;
      END LOOP;

      UPDATE public.orders SET total_amount = v_order_total WHERE id = v_order_id;
    END LOOP;

    -- 9.3 Outros (Devolução, Perda, Consumo, Inventário)
    -- 16 movimentações avulsas espalhadas pelos últimos 120 dias, alternando
    -- entre os 4 motivos (4 ciclos completos em vez de 1 único).
    FOR i IN 1..16 LOOP
      v_reason_idx := ((i - 1) % 4) + 1;

      -- Alterna entre motivos diferentes
      IF v_reason_idx = 1 THEN
        -- return_in (Devolução de Cliente)
        INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
        VALUES (v_current_org, v_user_id, 'entry', 'return_in', 'DEV-' || floor(random() * 900 + 100)::text, NOW() - (random() * 119 + 1) * INTERVAL '1 day')
        RETURNING id INTO v_movement_id;
      ELSIF v_reason_idx = 2 THEN
        -- loss (Perda/Avaria)
        INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
        VALUES (v_current_org, v_user_id, 'withdrawal', 'loss', NULL, NOW() - (random() * 119 + 1) * INTERVAL '1 day')
        RETURNING id INTO v_movement_id;
      ELSIF v_reason_idx = 3 THEN
        -- consumption (Consumo interno)
        INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
        VALUES (v_current_org, v_user_id, 'withdrawal', 'consumption', NULL, NOW() - (random() * 119 + 1) * INTERVAL '1 day')
        RETURNING id INTO v_movement_id;
      ELSE
        -- inventory (Ajuste de balanço - entrada)
        INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
        VALUES (v_current_org, v_user_id, 'entry', 'inventory', 'BAL-' || floor(random() * 9000 + 1000)::text, NOW() - (random() * 119 + 1) * INTERVAL '1 day')
        RETURNING id INTO v_movement_id;
      END IF;

      -- Adiciona de 1 a 2 itens nestas movimentações avulsas
      FOR r_variant IN
        SELECT p.id as p_id, v.id as v_id, p.has_variants,
               COALESCE(v.cost_price, p.cost_price, 25.0) as c_price,
               COALESCE(v.stock, p.stock) as curr_stock
        FROM public.products p
        LEFT JOIN public.product_variants v ON v.product_id = p.id
        WHERE p.organization_id = v_current_org
        ORDER BY random() LIMIT (floor(random() * 2 + 1)::int)
      LOOP
        v_qty_withdrawal := floor(random() * 2 + 1)::int;

        -- loss/consumption tiram estoque de verdade — clampa pro que existe
        -- (return_in/inventory só somam, não precisam de teto).
        IF v_reason_idx = 2 OR v_reason_idx = 3 THEN
          v_qty_withdrawal := LEAST(v_qty_withdrawal, r_variant.curr_stock);
        END IF;

        IF v_qty_withdrawal > 0 THEN
          INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost)
          VALUES (v_movement_id, r_variant.p_id, r_variant.v_id, v_qty_withdrawal, r_variant.c_price);

          IF r_variant.has_variants THEN
            IF v_reason_idx = 1 OR v_reason_idx = 4 THEN
              UPDATE public.product_variants SET stock = stock + v_qty_withdrawal WHERE id = r_variant.v_id;
            ELSE
              UPDATE public.product_variants SET stock = stock - v_qty_withdrawal WHERE id = r_variant.v_id;
            END IF;
          ELSE
            IF v_reason_idx = 1 OR v_reason_idx = 4 THEN
              UPDATE public.products SET stock = stock + v_qty_withdrawal WHERE id = r_variant.p_id;
            ELSE
              UPDATE public.products SET stock = stock - v_qty_withdrawal WHERE id = r_variant.p_id;
            END IF;
          END IF;
        END IF;
      END LOOP;
    END LOOP;
  END LOOP;

  -- -------------------------------------------------------------------------
  -- 9.4 CATÁLOGO "Loja Virtual" (org principal — CAT-0x)
  -- Reusa os produtos já gerados no passo 8: os 10 primeiros por SKU entram
  -- no catálogo (todas as variantes, quando houver).
  -- -------------------------------------------------------------------------
  RAISE NOTICE '🗂️  Criando catálogo "Loja Virtual"...';

  INSERT INTO public.catalogs (organization_id, name, is_active)
  VALUES (v_org_id, 'Loja Virtual', true)
  RETURNING id INTO v_catalog_id;

  -- PDV: aponta o catálogo da org — sem isso a página /pdv abre sem catálogo
  -- configurado (e o Sales, que não configura, ficaria travado).
  UPDATE public.organizations SET pdv_catalog_id = v_catalog_id WHERE id = v_org_id;

  FOR r_prod IN
    SELECT id, has_variants, cost_price
    FROM public.products
    WHERE organization_id = v_org_id
    ORDER BY sku
    LIMIT 10
  LOOP
    IF r_prod.has_variants THEN
      FOR r_variant IN
        SELECT id FROM public.product_variants WHERE product_id = r_prod.id
      LOOP
        INSERT INTO public.catalog_items (catalog_id, product_id, variant_id, price)
        VALUES (v_catalog_id, r_prod.id, r_variant.id, GREATEST(COALESCE(r_prod.cost_price, 25) * 2.5, 39.9));
      END LOOP;
    ELSE
      INSERT INTO public.catalog_items (catalog_id, product_id, variant_id, price)
      VALUES (v_catalog_id, r_prod.id, NULL, GREATEST(COALESCE(r_prod.cost_price, 25) * 2.5, 39.9));
    END IF;
  END LOOP;

  -- Backfill do catalog_id nas vendas de balcão (9.2) — o catálogo só existe
  -- a partir daqui, então elas nasceram com catalog_id NULL.
  UPDATE public.orders SET catalog_id = v_catalog_id
  WHERE organization_id = v_org_id AND channel = 'pos' AND catalog_id IS NULL;

  -- -------------------------------------------------------------------------
  -- 9.5 VITRINE "Inventto Store" vinculada ao catálogo acima (VIT-0x)
  -- Publicada direto (bypassa publish_storefront — é gravação de seed, não
  -- fluxo de usuário) para já servir de origem (channel=catalog_store) dos
  -- pedidos simulados abaixo.
  -- -------------------------------------------------------------------------
  RAISE NOTICE '🛍️  Criando vitrine "Inventto Store"...';

  INSERT INTO public.storefronts (
    organization_id, catalog_id, name, slug, whatsapp, theme,
    show_prices, show_sold_out, whatsapp_message, status, published_at
  ) VALUES (
    v_org_id, v_catalog_id, 'Inventto Store', 'inventto-store', '11987654321',
    '{"colors":{"primary":"#3A3631","background":"#F7F5F2","secondary":"#8B857D","text":"#2C2A28"},"layout":"grid","card_style":"minimal-large-image"}'::jsonb,
    true, true, 'Olá! Vi sua vitrine e gostaria de fazer um pedido.',
    'active', now()
  )
  RETURNING id INTO v_storefront_id;

  -- -------------------------------------------------------------------------
  -- 9.6 PEDIDOS SIMULADOS (PED-01) — cobre as 4 colunas do Kanban: 5 Pool
  -- (pending) · 9 Em atendimento (confirming/picking/delivering), sempre
  -- recentes (é a esteira "ao vivo") · 30 Finalizados (confirmed) · 16
  -- Cancelados/Expirados (cancelled/expired) — estes últimos 46 espalhados
  -- pelos últimos 120 dias, pra alimentar o dashboard (RF037, filtro até
  -- 90d) com histórico de verdade. Reserva de estoque (RN080/RN086)
  -- acompanha o estado: ativa durante o ciclo, consumida ao finalizar,
  -- liberada ao cancelar/expirar.
  -- -------------------------------------------------------------------------
  RAISE NOTICE '📥 Simulando % pedidos na esteira de fulfillment...', array_length(v_order_statuses, 1);

  FOR i IN 1..array_length(v_order_statuses, 1) LOOP
    v_order_status := v_order_statuses[i];

    -- Responsável: pool e expirados nunca foram assumidos; 1/3 dos assumidos
    -- é do Vendedor (order:view_own — Sales vê o pool + os próprios pedidos).
    v_seller_id := CASE
      WHEN v_order_status IN ('pending', 'expired') THEN NULL
      WHEN i % 3 = 0 THEN v_sales_user_id
      ELSE v_user_id
    END;

    -- Pool/em atendimento: idade em minutos/horas (esteira "ao vivo", como
    -- antes). Finalizados/cancelados/expirados: idade em dias, espalhada
    -- pelos últimos 120 dias — é o que dá histórico real pro dashboard.
    v_age_minutes := CASE v_order_status
      WHEN 'pending'     THEN random() * 25 + 2
      WHEN 'confirming'  THEN random() * 30 + 15
      WHEN 'picking'     THEN random() * 40 + 20
      WHEN 'delivering'  THEN random() * 60 + 30
      ELSE (random() * 119 + 1) * 1440
    END;
    v_order_created_at := now() - (v_age_minutes * INTERVAL '1 minute');

    -- Duração do atendimento (criação → assumir) é sempre curta (minutos),
    -- independente de quão antigo é o pedido — não escala com v_age_minutes,
    -- senão um pedido de 100 dias atrás "levaria semanas" pra ser assumido.
    v_claimed_at := CASE WHEN v_seller_id IS NOT NULL
      THEN v_order_created_at + (random() * 25 + 2) * INTERVAL '1 minute'
      ELSE NULL END;

    v_expires_at := CASE
      WHEN v_order_status = 'pending' THEN now() + (random() * 28 + 2) * INTERVAL '1 minute'
      WHEN v_order_status = 'expired' THEN v_order_created_at + (random() * 15 + 5) * INTERVAL '1 minute'
      ELSE NULL END;

    v_finalized_at := CASE WHEN v_order_status = 'confirmed'
      THEN COALESCE(v_claimed_at, v_order_created_at) + (random() * 90 + 30) * INTERVAL '1 minute'
      ELSE NULL END;

    v_cancellation_reason := CASE
      WHEN v_order_status = 'cancelled' THEN v_cancel_reasons[1 + floor(random() * array_length(v_cancel_reasons, 1))::int]
      WHEN v_order_status = 'expired' THEN 'Expirou no Pool'
      ELSE NULL END;

    v_payment_method := (ARRAY['pix', 'card'])[1 + floor(random() * 2)::int]::public.payment_method;
    v_delivery_address := (v_addresses[1 + floor(random() * array_length(v_addresses, 1))::int])::jsonb;

    INSERT INTO public.orders (
      organization_id, seller_id, customer_name_snapshot, customer_phone_snapshot,
      channel, catalog_id, status, total_amount, payment_method, delivery_address,
      cancellation_reason, claimed_at, finalized_at, expires_at, created_at
    ) VALUES (
      -- v_cust_names tem 24 nomes; com mais de 24 pedidos, recicla em ciclo.
      v_org_id, v_seller_id, v_cust_names[1 + ((i - 1) % array_length(v_cust_names, 1))],
      '(11) 9' || lpad((8000 + i * 137)::text, 4, '0') || '-' || lpad((1000 + i * 53)::text, 4, '0'),
      'catalog_store', v_catalog_id, v_order_status, 0, v_payment_method, v_delivery_address,
      -- cast explícito: variável TEXT não converte implicitamente p/ enum (MOV-06)
      v_cancellation_reason::public.order_cancellation_reason,
      v_claimed_at, v_finalized_at, v_expires_at, v_order_created_at
    )
    RETURNING id INTO v_order_id;

    v_reservation_status := CASE v_order_status
      WHEN 'confirmed' THEN 'consumed'
      WHEN 'cancelled' THEN 'released'
      WHEN 'expired' THEN 'released'
      ELSE 'active'
    END;

    v_order_total := 0;

    FOR k IN 1..(1 + floor(random() * 3)::int) LOOP
      v_item_product_id := NULL;
      v_item_variant_id := NULL;

      -- RN080/RN086: só reserva o que existe de fato — estoque disponível
      -- (stock − reservas ativas, o mesmo public.available_stock() usado em
      -- produção) precisa ser > 0, senão o pedido simulado reserva mais do
      -- que a loja tem.
      SELECT p.id, v.id, GREATEST(COALESCE(v.cost_price, p.cost_price, 25) * 2.5, 39.9), p.name,
             public.available_stock(p.id, v.id)
      INTO v_item_product_id, v_item_variant_id, v_item_price, v_item_name, v_item_available
      FROM public.products p
      LEFT JOIN public.product_variants v ON v.product_id = p.id
      WHERE p.organization_id = v_org_id
        AND public.available_stock(p.id, v.id) > 0
      ORDER BY random()
      LIMIT 1;

      -- Organização esgotada para este item (sem candidato com estoque
      -- disponível) — pula em vez de reservar quantidade fantasma.
      IF v_item_product_id IS NULL THEN
        CONTINUE;
      END IF;

      v_item_qty := LEAST(1 + floor(random() * 3)::int, v_item_available);

      INSERT INTO public.order_items (order_id, product_id, variant_id, quantity, unit_price, product_name_snapshot)
      VALUES (v_order_id, v_item_product_id, v_item_variant_id, v_item_qty, v_item_price, v_item_name);

      INSERT INTO public.stock_reservations (order_id, product_id, variant_id, quantity, status)
      VALUES (v_order_id, v_item_product_id, v_item_variant_id, v_item_qty, v_reservation_status);

      -- RN087: finalizado já baixou o estoque (consumed vira saída).
      IF v_order_status = 'confirmed' THEN
        IF v_item_variant_id IS NOT NULL THEN
          UPDATE public.product_variants SET stock = GREATEST(stock - v_item_qty, 0) WHERE id = v_item_variant_id;
        ELSE
          UPDATE public.products SET stock = GREATEST(stock - v_item_qty, 0) WHERE id = v_item_product_id;
        END IF;
      END IF;

      v_order_total := v_order_total + (v_item_price * v_item_qty);
    END LOOP;

    UPDATE public.orders SET total_amount = v_order_total WHERE id = v_order_id;
  END LOOP;

  -- -------------------------------------------------------------------------
  -- 9.7 PISO DE ESTOQUE — depois de entradas/vendas/avulsas (9.1-9.3) e dos
  -- pedidos confirmados (9.6, que também baixa estoque real), nenhum produto
  -- ou variante pode fechar a seed com stock <= 0. Cobre só quem zerou, com
  -- 1 movimento de ajuste de balanço datado de hoje — não mexe em quem já
  -- está com estoque saudável.
  -- -------------------------------------------------------------------------
  RAISE NOTICE '📊 Aplicando piso de estoque (garantindo que nada feche zerado)...';

  INSERT INTO public.movements (organization_id, user_id, type, reason, document_number, created_at)
  VALUES (v_org_id, v_user_id, 'entry', 'inventory', 'BAL-FLOOR-' || to_char(now(), 'YYYYMMDD'), now())
  RETURNING id INTO v_movement_id;

  FOR r_variant IN
    SELECT id, NULL::uuid AS variant_id, minimum_stock, stock, cost_price
    FROM public.products
    WHERE organization_id = v_org_id AND has_variants = false AND stock <= 0
    UNION ALL
    SELECT product_id AS id, id AS variant_id, minimum_stock, stock, cost_price
    FROM public.product_variants
    WHERE organization_id = v_org_id AND stock <= 0
  LOOP
    -- Repõe acima do mínimo (não só acima de zero), pra também não nascer
    -- com o badge de "últimas peças" assim que a seed termina.
    v_qty_entry := GREATEST(r_variant.minimum_stock, 5) + floor(random() * 10)::int - r_variant.stock;

    INSERT INTO public.movement_items (movement_id, product_id, variant_id, quantity, unit_cost)
    VALUES (v_movement_id, r_variant.id, r_variant.variant_id, v_qty_entry, COALESCE(r_variant.cost_price, 25));

    IF r_variant.variant_id IS NOT NULL THEN
      UPDATE public.product_variants SET stock = stock + v_qty_entry WHERE id = r_variant.variant_id;
    ELSE
      UPDATE public.products SET stock = stock + v_qty_entry WHERE id = r_variant.id;
    END IF;
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

  RAISE NOTICE '✅ SEED FINALIZADA COM SUCESSO! (org + vendedor Sales + catálogo/PDV + vitrine + % pedidos)', array_length(v_order_statuses, 1);
  RAISE NOTICE '🔑 Logins: % (Owner) · vendedor@inventto.ui / Vendedor@123 (Sales)', v_owner_email;
END $$;
