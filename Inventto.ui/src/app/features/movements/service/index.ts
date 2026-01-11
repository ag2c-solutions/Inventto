import { supabase } from '@/app/config/supabase';
import { MovementMapper } from './mapper';
import { handleMovementError } from './error-handler';
import type { MovementDTO, Movement, CreateMovementInput } from '../types/';

interface GetAllFilters {
  productId?: string;
  organizationId: string;
}

const SelectQuery = `
  id,
  organization_id,
  user_id,
  type,
  reason,
  document_number,
  order_id,
  created_at,
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

async function getAll(filters: GetAllFilters): Promise<Movement[]> {
  try {
    let query = supabase
      .from('movements')
      .select(SelectQuery)
      .eq('organization_id', filters.organizationId)
      .order('created_at', { ascending: false });

    if (filters.productId) {
      query = query.eq('movement_items.product_id', filters.productId);
    }

    const { data, error } = await query.overrideTypes<
      Array<MovementDTO>,
      { merge: false }
    >();

    if (error) throw error;

    return data.map(MovementMapper.toDomain);
  } catch (error) {
    throw handleMovementError(error, 'getAll');
  }
}

async function create(
  input: CreateMovementInput,
  organizationId: string
): Promise<string> {
  try {
    const persistencePayload = MovementMapper.toPersistence(
      input,
      organizationId
    );
    const { data, error } = await supabase.rpc('create_stock_movement', {
      movement_data: persistencePayload
    });

    if (error) throw error;

    return data;
  } catch (error) {
    throw handleMovementError(error, 'create');
  }
}

export const MovementService = {
  getAll,
  create
};
