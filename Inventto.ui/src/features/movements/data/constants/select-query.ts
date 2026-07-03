export const SELECT_QUERY = `
  id,
  organization_id,
  user_id,
  type,
  reason,
  description,
  document_number,
  order_id,
  created_at,
  executed_at,
  profiles ( full_name, avatar_url ),
  movement_items!inner (
    id,
    quantity,
    unit_cost,
    unit_price,
    product_id,
    variant_id,
    products (
      name,
      sku,
      product_images ( url, is_primary )
    ),
    product_variants (
      sku,
      options,
      product_variant_images (
        is_primary,
        product_images ( url )
      )
    )
  )
`;
