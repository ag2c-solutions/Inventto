export interface PdvCatalog {
  id: string;
  name: string;
}

export interface PdvProduct {
  productId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  sku?: string;
  // Preço do item de catálogo, em centavos (mesma convenção de CatalogItem).
  price: number;
  stock: number;
  isOut: boolean;
  imageUrl?: string;
  categoryId?: string;
}

export interface CartItem {
  productId: string;
  variantId?: string;
  name: string;
  variantLabel?: string;
  sku?: string;
  imageUrl?: string;
  // Preço unitário e desconto por unidade, em centavos.
  unitPrice: number;
  discount: number;
  quantity: number;
}

export interface PdvCustomer {
  customerId: string;
  name: string;
  since: Date;
}

export interface SaleCustomerInput {
  phone: string;
  // Ausente quando o telefone já pertence a um cliente conhecido nesta org
  // (a UI não pede nome de novo — só para cliente novo).
  name?: string;
}

export interface SaleItemInput {
  productId: string;
  variantId?: string;
  quantity: number;
  // Em centavos.
  referencePrice: number;
  discountAmount: number;
  // Saldo disponível no momento da confirmação — usado só para o guard
  // (RN055), não é enviado ao backend (que revalida de qualquer forma).
  availableStock: number;
}

export type PaymentMethod = 'cash' | 'card' | 'pix';

export interface ConfirmSaleInput {
  organizationId: string;
  catalogId: string;
  customer?: SaleCustomerInput;
  items: SaleItemInput[];
  paymentMethod: PaymentMethod;
  // Em centavos — só relevante quando paymentMethod === 'cash'.
  amountPaid?: number;
  paymentProofUrl?: string;
}
