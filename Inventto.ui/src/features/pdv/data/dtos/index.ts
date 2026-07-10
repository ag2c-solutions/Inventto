export interface PdvOrgCatalogDTO {
  pdv_catalog_id: string | null;
  catalog: { id: string; name: string } | null;
}

export interface CreatePosSaleDTO {
  organization_id: string;
  catalog_id: string;
  customer: { phone: string; name?: string } | null;
  items: Array<{
    product_id: string;
    variant_id: string | null;
    quantity: number;
    reference_price: number;
    discount_amount: number;
    unit_price: number;
  }>;
}

export interface LookupPosCustomerDTO {
  customer_id: string;
  name: string;
  since: string;
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
