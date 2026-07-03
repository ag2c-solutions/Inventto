import type { Organization } from '@/features/organizations';

export type MovementType = 'entry' | 'withdrawal' | 'adjustment';
export type MovementReason =
  | 'Compra'
  | 'Devolução(entrada)'
  | 'Transferência(entrada)'
  | 'Venda'
  | 'Devolução(saída)'
  | 'Transferência(saída)'
  | 'Perda'
  | 'Consumo'
  | 'Inventário'
  | 'Correção'
  | 'Outro';

interface MovementUser {
  fullName: string;
  avatarUrl?: string;
}

interface MovementProductInfo {
  name: string;
  imageUrl?: string;
  sku?: string;
  variantOptions?: string;
}

export interface MovementItem {
  id: string;
  movementId: string;
  productId: string;
  variantId?: string;
  quantity: number;
  unitCost: number;
  unitPrice: number;
  originalValue?: number;
  discount?: number;
  netValue?: number;
  product: MovementProductInfo;
}

export interface Movement {
  id: string;
  organizationId: string;
  type: MovementType;
  reason: MovementReason;
  documentNumber?: string;
  orderId?: string;
  description?: string;
  createdAt: Date;
  executedAt?: Date;
  totalQuantity: number;
  totalValue: number;
  user?: MovementUser;
  items: MovementItem[];
}

export interface CreateMovementItemInput {
  productId: string;
  variantId?: string | null;
  quantity: number;
  unitCost?: number;
  unitPrice?: number;
}

export interface CreateMovementInput {
  type: MovementType;
  reason: MovementReason;
  documentNumber?: string;
  items: CreateMovementItemInput[];
}

export interface CreateMovementPayload {
  input: CreateMovementInput;
  organization: Organization | null;
}
