export interface CatalogDTO {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  catalog_items: Array<{ count: number }>;
}

export interface CatalogItemDTO {
  id: string;
  catalog_id: string;
  product_id: string;
  variant_id: string | null;
  price: number;
  original_price: number | null;
  product: {
    id: string;
    name: string;
    sku: string;
    product_images: Array<{ url: string; is_primary: boolean }>;
  };
}
