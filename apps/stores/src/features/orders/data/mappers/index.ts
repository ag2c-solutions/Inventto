import type {
  Order,
  OrderAddress,
  OrderItem,
  OrderMacroState,
  OrderMicroState
} from '../../domain/entities';
import type { OrderDTO, OrderStatusDTO } from '../dtos';

const MACRO_STATE_BY_STATUS: Record<OrderStatusDTO, OrderMacroState> = {
  pending: 'pool',
  confirming: 'attending',
  picking: 'attending',
  delivering: 'attending',
  confirmed: 'done',
  cancelled: 'cancelled',
  expired: 'cancelled'
};

export class OrderMapper {
  static toDomain(dto: OrderDTO): Order {
    const items: OrderItem[] = (dto.order_items ?? []).map((item) => ({
      productId: item.product_id ?? undefined,
      variantId: item.variant_id ?? undefined,
      name: item.product_name_snapshot ?? 'Produto',
      quantity: item.quantity,
      unitPrice: item.unit_price
    }));

    return {
      id: dto.id,
      code: dto.id.slice(0, 8).toUpperCase(),
      customerName: dto.customer_name_snapshot ?? undefined,
      customerPhone: dto.customer_phone_snapshot ?? undefined,
      items,
      total: dto.total_amount,
      macroState: MACRO_STATE_BY_STATUS[dto.status],
      microState: dto.status as OrderMicroState,
      sellerId: dto.seller_id ?? undefined,
      sellerName: dto.seller?.full_name ?? undefined,
      address: this.toAddress(dto),
      paymentMethod: dto.payment_method ?? undefined,
      channel: dto.channel,
      catalogName: dto.catalog?.name ?? undefined,
      cancellationReason: dto.cancellation_reason ?? undefined,
      receivedAt: new Date(dto.created_at),
      claimedAt: dto.claimed_at ? new Date(dto.claimed_at) : undefined,
      finalizedAt: dto.finalized_at ? new Date(dto.finalized_at) : undefined,
      expiresAt: dto.expires_at ? new Date(dto.expires_at) : undefined,
      lastActionAt: new Date(dto.updated_at)
    };
  }

  private static toAddress(dto: OrderDTO): OrderAddress | undefined {
    if (!dto.delivery_address) return undefined;

    const address = dto.delivery_address;
    return {
      zipCode: address.zip_code,
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      complement: address.complement
    };
  }
}
