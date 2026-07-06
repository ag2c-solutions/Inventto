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
