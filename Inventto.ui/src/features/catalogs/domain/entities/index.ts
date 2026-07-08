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
