export interface PdvOrgCatalogDTO {
  pdv_catalog_id: string | null;
  catalog: { id: string; name: string } | null;
}

export interface PdvCatalogItemDTO {
  id: string;
  product_id: string;
  variant_id: string | null;
  price: number;
  product: {
    id: string;
    name: string;
    sku: string;
    stock: number;
    product_images: Array<{ url: string; is_primary: boolean }>;
    categories: Array<{ category: { id: string } | null }>;
  };
  variant: {
    id: string;
    sku: string;
    stock: number;
    options: Array<{ name: string; value: string }>;
  } | null;
}
