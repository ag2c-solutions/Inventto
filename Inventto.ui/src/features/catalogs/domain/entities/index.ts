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
}

export interface AddCatalogItemsPayload {
  catalogId: string;
  productIds: string[];
}

export interface UpdateCatalogItemPricePayload {
  id: string;
  price: number;
  originalPrice?: number;
}
