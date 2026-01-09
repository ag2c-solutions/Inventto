type MovementTypeDTO = 'entry' | 'withdrawal' | 'adjustment';

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
  options: Record<string, string> | null; 
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

export interface MovementDTO {
  id: string;
  organization_id: string;
  user_id: string | null;
  type: MovementTypeDTO;
  reason: string | null;
  document_number: string | null; 
  order_id: string | null;
  created_at: string;
  profiles?: ProfileDTO | null;
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
  reason: string | null;
  document_number?: string | null; 
  order_id?: string | null;
  items: CreateMovementItemRPCDTO[];
}