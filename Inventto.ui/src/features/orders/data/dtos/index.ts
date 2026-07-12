export type OrderStatusDTO =
  | 'pending'
  | 'confirming'
  | 'picking'
  | 'delivering'
  | 'confirmed'
  | 'cancelled'
  | 'expired';

export interface OrderItemDTO {
  id: string;
  product_id: string | null;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  product_name_snapshot: string | null;
}

export interface OrderAddressDTO {
  zip_code?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  complement?: string;
}

export interface OrderDTO {
  id: string;
  organization_id: string;
  customer_id: string | null;
  seller_id: string | null;
  customer_name_snapshot: string | null;
  customer_phone_snapshot: string | null;
  channel: string;
  catalog_id: string | null;
  status: OrderStatusDTO;
  total_amount: number;
  payment_method: 'card' | 'cash' | 'pix' | null;
  delivery_address: OrderAddressDTO | null;
  cancellation_reason: string | null;
  claimed_at: string | null;
  finalized_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  seller: { id: string; full_name: string } | null;
  order_items: OrderItemDTO[];
}
