import { subscribeToTableChanges } from '@/infra/real-time';
import { supabase } from '@/infra/supabase';

import {
  type Order,
  OrderAlreadyClaimedError,
  OrderInvalidTransitionError
} from '../../domain/entities';
import type { OrderDTO } from '../dtos';
import {
  handleOrderError,
  ORDER_ALREADY_CLAIMED_ERROR_MARKER,
  ORDER_INVALID_TRANSITION_ERROR_MARKER
} from '../handlers/error-handler';
import { OrderMapper } from '../mappers';

const SELECT_QUERY = `
  id,
  organization_id,
  customer_id,
  seller_id,
  customer_name_snapshot,
  customer_phone_snapshot,
  channel,
  catalog_id,
  status,
  total_amount,
  payment_method,
  delivery_address,
  cancellation_reason,
  claimed_at,
  finalized_at,
  expires_at,
  created_at,
  updated_at,
  seller:profiles(id, full_name),
  order_items(id, product_id, variant_id, quantity, unit_price, product_name_snapshot)
`;

export class OrderApi {
  static async getOrders(organizationId: string): Promise<Order[]> {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(SELECT_QUERY)
        .eq('organization_id', organizationId)
        .order('updated_at', { ascending: false })
        .overrideTypes<OrderDTO[], { merge: false }>();

      if (error) throw error;

      return data.map((dto) => OrderMapper.toDomain(dto));
    } catch (error) {
      handleOrderError(error, 'getOrders');
    }
  }

  static async claimOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('claim_order', { p_id: id });

      if (error) {
        if (error.message.includes(ORDER_ALREADY_CLAIMED_ERROR_MARKER)) {
          throw new OrderAlreadyClaimedError();
        }
        throw error;
      }
    } catch (error) {
      handleOrderError(error, 'claimOrder');
    }
  }

  static async advanceOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('advance_order', { p_id: id });

      if (error) {
        if (error.message.includes(ORDER_INVALID_TRANSITION_ERROR_MARKER)) {
          throw new OrderInvalidTransitionError();
        }
        throw error;
      }
    } catch (error) {
      handleOrderError(error, 'advanceOrder');
    }
  }

  static async finalizeOrder(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('finalize_order', { p_id: id });

      if (error) {
        if (error.message.includes(ORDER_INVALID_TRANSITION_ERROR_MARKER)) {
          throw new OrderInvalidTransitionError();
        }
        throw error;
      }
    } catch (error) {
      handleOrderError(error, 'finalizeOrder');
    }
  }

  static async cancelOrder(id: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('cancel_order', {
        p_id: id,
        p_reason: reason
      });

      if (error) {
        if (error.message.includes(ORDER_INVALID_TRANSITION_ERROR_MARKER)) {
          throw new OrderInvalidTransitionError();
        }
        throw error;
      }
    } catch (error) {
      handleOrderError(error, 'cancelOrder');
    }
  }

  // RF035: assinatura em tempo real do painel — a presentation não fala com
  // o infra diretamente (boundaries), então o wrapper fica aqui.
  static subscribeToChanges(
    organizationId: string,
    onChange: () => void
  ): () => void {
    return subscribeToTableChanges(`orders-board-${organizationId}`, {
      table: 'orders',
      filter: `organization_id=eq.${organizationId}`,
      onChange
    });
  }
}
