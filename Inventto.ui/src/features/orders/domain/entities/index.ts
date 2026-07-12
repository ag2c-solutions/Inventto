// PED-01: esteira de fulfillment (wireframe) — ver memória ped-lifecycle-decision.
export type OrderMicroState =
  | 'pending'
  | 'confirming'
  | 'picking'
  | 'delivering'
  | 'confirmed'
  | 'cancelled'
  | 'expired';

// RF034: 4 colunas do painel — pool, em atendimento, finalizados, cancelados.
export type OrderMacroState = 'pool' | 'attending' | 'done' | 'cancelled';

export type OrderPaymentMethod = 'card' | 'cash' | 'pix';

export type OrderPeriod = 'today' | '7d' | '30d' | '90d' | 'all';

export interface OrderAddress {
  zipCode?: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  complement?: string;
}

export interface OrderItem {
  productId?: string;
  variantId?: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  code: string;
  customerName?: string;
  customerPhone?: string;
  items: OrderItem[];
  total: number;
  macroState: OrderMacroState;
  microState: OrderMicroState;
  sellerId?: string;
  sellerName?: string;
  address?: OrderAddress;
  paymentMethod?: OrderPaymentMethod;
  channel: string;
  // RN083: "Origem" na Sheet ("Vitrine online · {catálogo}") — só pedidos
  // channel="catalog_store" passam pelo painel, então o prefixo é fixo na
  // UI; aqui só o nome do catálogo de origem.
  catalogName?: string;
  cancellationReason?: string;
  receivedAt: Date;
  claimedAt?: Date;
  finalizedAt?: Date;
  expiresAt?: Date;
  // Para ordenar "Em atendimento" pela última ação (RF034).
  lastActionAt: Date;
}

export interface OrderFilters {
  search?: string;
  period?: OrderPeriod;
  sellerId?: string;
}

/**
 * Erro de domínio (RN082): outro vendedor assumiu o pedido primeiro. A UI
 * mapeia para um toast específico em vez de um erro genérico.
 */
export class OrderAlreadyClaimedError extends Error {
  constructor() {
    super('Este pedido já foi assumido por outro vendedor.');
    this.name = 'OrderAlreadyClaimedError';
  }
}

/**
 * Erro de domínio: a transição pedida não é válida a partir do
 * micro-estado atual do pedido (esteira fora de ordem, ou já finalizado).
 */
export class OrderInvalidTransitionError extends Error {
  constructor() {
    super('Não é possível avançar este pedido neste estado.');
    this.name = 'OrderInvalidTransitionError';
  }
}
