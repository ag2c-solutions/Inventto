type MovementTypeDTO = 'entry' | 'withdrawal';
export type MovementReasonDTO =
  // RN053 — motivos vigentes (Sheet · MOV-03)
  | 'purchase'
  | 'customer_return'
  | 'adjustment_in'
  | 'loss_damage'
  | 'supplier_return'
  | 'internal_use'
  | 'adjustment_out'
  | 'other'
  // motivos legados — mantidos apenas para exibir movimentações já registradas
  | 'return_in'
  | 'transfer_in'
  | 'sale'
  | 'return_out'
  | 'transfer_out'
  | 'loss'
  | 'consumption'
  | 'inventory'
  | 'correction';

export interface ProfileDTO {
  full_name: string | null;
  avatar_url: string | null;
}

export interface ProductImageDTO {
  url: string;
  is_primary: boolean;
}

export interface ProductSummaryDTO {
  name: string;
  sku?: string | null;
  product_images: ProductImageDTO[];
}

interface VariantImageJoinDTO {
  is_primary: boolean;
  product_images: {
    url: string;
  } | null;
}

export interface VariantSummaryDTO {
  sku: string | null;
  options:
    | {
        name: string;
        value: string;
      }[]
    | null;
  product_variant_images: VariantImageJoinDTO[];
}

export interface MovementItemDTO {
  id: string;
  movement_id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  unit_cost: number | null;
  unit_price: number | null;
  products?: ProductSummaryDTO | null;
  product_variants?: VariantSummaryDTO | null;
}

// MOV-06: só o suficiente pra decidir se a ação "Estornar venda" aparece —
// não é o mesmo conceito de OrderMacroState/OrderMicroState (features/orders),
// que a feature movements não importa (mantém o cross-feature só via texto cru).
export type MovementOrderStatusDTO =
  | 'pending'
  | 'confirming'
  | 'picking'
  | 'delivering'
  | 'confirmed'
  | 'cancelled'
  | 'expired';

export interface MovementOrderDTO {
  status: MovementOrderStatusDTO;
}

export interface MovementDTO {
  id: string;
  organization_id: string;
  user_id: string | null;
  type: MovementTypeDTO;
  reason: MovementReasonDTO;
  description: string | null;
  document_number: string | null;
  order_id: string | null;
  created_at: string;
  executed_at: string;
  profiles?: ProfileDTO | null;
  orders?: MovementOrderDTO | null;
  movement_items?: MovementItemDTO[];
}

export interface CreateMovementItemRPCDTO {
  product_id: string;
  variant_id?: string | null;
  quantity: number;
  unit_cost?: number;
  unit_price?: number;
}

export interface CreateStockMovementRPCDTO {
  organization_id: string;
  type: MovementTypeDTO;
  reason: MovementReasonDTO | null;
  description?: string | null;
  document_number?: string | null;
  order_id?: string | null;
  executed_at: string;
  items: CreateMovementItemRPCDTO[];
}
