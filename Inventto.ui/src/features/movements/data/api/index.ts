import { supabase } from '@/infra/supabase';

import type { Movement } from '../../domain/entities';
import type { CreateMovementPayload } from '../../domain/services';
import type { MovementDTO } from '../dtos';
import { handleMovementError } from '../handlers/error-handler';
import { MovementMapper } from '../mappers';

export interface GetMovementsFilters {
  organizationId: string;
  productId?: string;
}

const SELECT_QUERY = `
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

export class MovementApi {
  static async getAll(filters: GetMovementsFilters): Promise<Movement[]> {
    try {
      let query = supabase
        .from('movements')
        .select(SELECT_QUERY)
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
      if (error instanceof Error) throw error;
      handleMovementError(error, 'getAll');
    }
  }

  static async create({
    input,
    organizationId
  }: CreateMovementPayload): Promise<string> {
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
      if (error instanceof Error) throw error;
      handleMovementError(error, 'create');
    }
  }
}
