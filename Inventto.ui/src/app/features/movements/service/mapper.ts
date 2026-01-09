import type {
  Movement, 
  MovementItem, 
  MovementDTO,
  MovementItemDTO,
  CreateMovementInput,
  CreateStockMovementRPCDTO,
  CreateMovementItemInput,
  CreateMovementItemRPCDTO,
} from '../types';

import { formatVariantOptions, getProductImage } from '../utils';

const toDomainItem=(dto: MovementItemDTO): MovementItem => {
  return {
    id: dto.id,
    movementId: dto.movement_id,
    productId: dto.product_id ?? '',
    variantId: dto.variant_id ?? undefined,
    quantity: dto.quantity,
    unitCost: Number(dto.unit_cost ?? 0),
    unitPrice: Number(dto.unit_price ?? 0),
    product: {
      name: dto.products?.name ?? 'Produto Desconhecido',
      imageUrl: getProductImage(dto.products, dto.product_variants),
      sku: dto.product_variants?.sku ?? undefined,
      variantOptions: formatVariantOptions(dto.product_variants?.options),
    },
  };
}

export const MovementMapper = {
  toDomain(dto: MovementDTO): Movement {
    const items = (dto.movement_items ?? []).map((item) => toDomainItem(item));
    const totalQuantity = items.reduce((acc, item) => acc + Math.abs(item.quantity), 0);
    const totalValue = items.reduce((acc, item) => acc + (Math.abs(item.quantity) * (item.unitCost || 0)), 0);

    return {
      id: dto.id,
      organizationId: dto.organization_id,
      type: dto.type,
      reason: dto.reason ?? '',
      documentNumber: dto.document_number ?? undefined,
      orderId: dto.order_id ?? undefined,
      createdAt: new Date(dto.created_at),
      totalQuantity,
      totalValue,
      user: dto.profiles ? {
        fullName: dto.profiles.full_name ?? 'Sistema',
        avatarUrl: dto.profiles.avatar_url ?? undefined
      } : undefined,
      items
    };
  },

  

  toPersistence(domain: CreateMovementInput, organizationId: string): CreateStockMovementRPCDTO {
    return {
      organization_id: organizationId,
      type: domain.type,
      reason: domain.reason,
      document_number: domain.documentNumber ?? null,
      order_id: null,
      items: domain.items.map(this.toPersistenceItem)
    };
  },

  toPersistenceItem(item: CreateMovementItemInput): CreateMovementItemRPCDTO {
    return {
      product_id: item.productId,
      variant_id: item.variantId ?? null,
      quantity: item.quantity,
      unit_cost: item.unitCost,
      unit_price: item.unitPrice
    };
  }
};