import { supabase } from '@/infra/supabase';

import type { CreateMovementInput, Movement } from '../../domain/entities';
import { SELECT_QUERY } from '../constants/select-query';
import type { MovementDTO } from '../dtos';
import { handleMovementError } from '../handlers/error-handler';
import { MovementMapper } from '../mappers';

export interface GetMovementsFilters {
  organizationId: string;
  productId?: string;
}

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
      handleMovementError(error, 'getAll');
    }
  }

  static async create({
    input,
    organizationId
  }: {
    input: CreateMovementInput;
    organizationId: string;
  }): Promise<string> {
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
      handleMovementError(error, 'create');
    }
  }
}
