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
  // (a UI não pede nome de novo — só para cliente novo). Enviado à RPC.
  name?: string;
  // Nome resolvido pra exibição (cliente encontrado OU nome digitado pro
  // novo) — usado só no comprovante (PDV-06), nunca enviado à RPC.
  displayName?: string;
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

// PDV-06: snapshot do carrinho/pagamento no momento da confirmação — montado
// no client antes de disparar a mutation (o carrinho é limpo no onSuccess),
// usado só para exibir o comprovante. Não é buscado/persistido via API.
export interface ConfirmedSale {
  orderId: string;
  organizationName: string;
  organizationLogoUrl?: string;
  confirmedAt: Date;
  items: CartItem[];
  // Em centavos.
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  // Em centavos — só presentes quando paymentMethod === 'cash'.
  amountPaid?: number;
  changeAmount?: number;
  customer?: SaleCustomerInput;
}
