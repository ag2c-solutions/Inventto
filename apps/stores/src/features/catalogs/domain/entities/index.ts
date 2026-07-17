export interface Catalog {
  id: string;
  organizationId: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  productsCount: number;
  channelsCount: number;
}

export interface CreateCatalogPayload {
  organizationId: string;
  name: string;
}

export interface UpdateCatalogPayload {
  id: string;
  name?: string;
}

export interface CatalogItem {
  id: string;
  catalogId: string;
  productId: string;
  variantId?: string;
  // 0 = ainda sem preço definido (item pendente — RN063 exige > 0 para valer).
  price: number;
  originalPrice?: number;
  product: {
    id: string;
    name: string;
    sku: string;
    imageUrl?: string;
  };
  variant?: {
    id: string;
    sku: string;
    options: { name: string; value: string }[];
  };
}

export interface CatalogItemInput {
  productId: string;
  variantId?: string;
  price: number;
  originalPrice?: number | null;
}

export interface AddCatalogItemsPayload {
  catalogId: string;
  items: CatalogItemInput[];
}

export interface UpdateCatalogItemPricePayload {
  id: string;
  price: number;
  originalPrice?: number | null;
}

/** Payload para atualizar preços de múltiplos itens em lote. */
export interface UpdateCatalogItemsPricesPayload {
  catalogId: string;
  items: UpdateCatalogItemPricePayload[];
}

/**
 * Erro de domínio (RN061): o catálogo não pode ser removido enquanto houver
 * canais (PDV/vitrines) usando-o. A UI mapeia este erro para a variante
 * bloqueada do dialog de remoção.
 */
export class CatalogHasLinkedChannelsError extends Error {
  constructor() {
    super(
      'Este catálogo está sendo usado por canais vinculados. Desvincule-os antes de remover.'
    );
    this.name = 'CatalogHasLinkedChannelsError';
  }
}
