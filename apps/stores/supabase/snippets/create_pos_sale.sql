-- PDV-05 — RPC create_pos_sale com forma de pagamento/troco/comprovante,
-- para a instância em execução. Aplicar no SQL editor do Supabase. Reflete
-- 07_rpc_functions.sql. Depende de payment_method_enum.sql e
-- orders_payment_columns.sql.

CREATE OR REPLACE FUNCTION public.create_pos_sale(sale_data JSONB)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_org_id UUID;
  v_catalog_id UUID;
  v_customer_phone TEXT;
  v_customer_name TEXT;
  v_customer_id UUID;
  v_order_id UUID;
  v_total_amount NUMERIC := 0;
  v_item JSONB;
  v_product_name TEXT;
  v_movement_items JSONB := '[]'::jsonb;
  v_movement_payload JSONB;
  v_payment_method public.payment_method;
  v_amount_paid NUMERIC;
  v_payment_proof_url TEXT;
BEGIN
  v_org_id := (sale_data->>'organization_id')::UUID;
  v_catalog_id := (sale_data->>'catalog_id')::UUID;

  IF NOT public.is_org_member(v_org_id) THEN
    RAISE EXCEPTION 'Acesso negado.';
  END IF;

  IF sale_data->'items' IS NULL OR jsonb_array_length(sale_data->'items') = 0 THEN
    RAISE EXCEPTION 'A venda precisa ter ao menos um item.';
  END IF;

  v_payment_method := NULLIF(sale_data->>'payment_method', '')::public.payment_method;
  IF v_payment_method IS NULL THEN
    RAISE EXCEPTION 'Selecione a forma de pagamento.';
  END IF;

  v_amount_paid := (sale_data->>'amount_paid')::NUMERIC;
  v_payment_proof_url := NULLIF(sale_data->>'payment_proof_url', '');

  v_customer_phone := NULLIF(TRIM(sale_data->'customer'->>'phone'), '');
  v_customer_name := NULLIF(TRIM(sale_data->'customer'->>'name'), '');

  IF v_customer_phone IS NOT NULL THEN
    INSERT INTO public.customers (phone)
    VALUES (v_customer_phone)
    ON CONFLICT (phone) DO UPDATE SET updated_at = now()
    RETURNING id INTO v_customer_id;

    INSERT INTO public.customer_store_profiles (organization_id, customer_id, name)
    VALUES (v_org_id, v_customer_id, COALESCE(v_customer_name, 'Cliente'))
    ON CONFLICT (organization_id, customer_id) DO NOTHING;

    SELECT name INTO v_customer_name
    FROM public.customer_store_profiles
    WHERE organization_id = v_org_id AND customer_id = v_customer_id;
  END IF;

  SELECT COALESCE(SUM((item->>'unit_price')::NUMERIC * (item->>'quantity')::INTEGER), 0)
  INTO v_total_amount
  FROM jsonb_array_elements(sale_data->'items') AS item;

  IF v_payment_method = 'cash' AND (v_amount_paid IS NULL OR v_amount_paid < v_total_amount) THEN
    RAISE EXCEPTION 'O valor recebido é menor que o total da venda.';
  END IF;

  INSERT INTO public.orders (
    organization_id, customer_id, seller_id,
    customer_name_snapshot, customer_phone_snapshot,
    channel, catalog_id, status, total_amount,
    payment_method, amount_paid, payment_proof_url
  )
  VALUES (
    v_org_id, v_customer_id, v_user_id,
    v_customer_name, v_customer_phone,
    'pos', v_catalog_id, 'confirmed', v_total_amount,
    v_payment_method,
    CASE WHEN v_payment_method = 'cash' THEN v_amount_paid ELSE NULL END,
    v_payment_proof_url
  )
  RETURNING id INTO v_order_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(sale_data->'items')
  LOOP
    SELECT name INTO v_product_name
    FROM public.products WHERE id = (v_item->>'product_id')::UUID;

    INSERT INTO public.order_items (
      order_id, product_id, variant_id, quantity,
      unit_price, reference_price, discount_amount, product_name_snapshot
    )
    VALUES (
      v_order_id,
      (v_item->>'product_id')::UUID,
      (v_item->>'variant_id')::UUID,
      (v_item->>'quantity')::INTEGER,
      (v_item->>'unit_price')::NUMERIC,
      (v_item->>'reference_price')::NUMERIC,
      COALESCE((v_item->>'discount_amount')::NUMERIC, 0),
      v_product_name
    );

    v_movement_items := v_movement_items || jsonb_build_object(
      'product_id', v_item->>'product_id',
      'variant_id', v_item->'variant_id',
      'quantity', v_item->>'quantity',
      'unit_price', v_item->>'unit_price'
    );
  END LOOP;

  v_movement_payload := jsonb_build_object(
    'organization_id', v_org_id,
    'type', 'withdrawal',
    'reason', 'sale',
    'order_id', v_order_id,
    'items', v_movement_items
  );
  PERFORM public.create_stock_movement(v_movement_payload);

  IF v_customer_id IS NOT NULL THEN
    UPDATE public.customer_store_profiles
    SET total_spent = total_spent + v_total_amount, last_purchase_at = now()
    WHERE organization_id = v_org_id AND customer_id = v_customer_id;
  END IF;

  RETURN v_order_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_pos_sale(JSONB) TO authenticated;
