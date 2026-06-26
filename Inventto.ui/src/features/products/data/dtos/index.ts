export interface CategoryDTO {
  category: {
    id: string;
    name: string;
  };
}

export interface ImportCandidateDTO {
  id: string;
  name: string;
  sku: string;
  already_imported: boolean;
  image_url: string | null;
  image_public_id: string | null;
  variant_count: number;
}

export interface SourceVariantDTO {
  id: string;
  sku: string;
  options: ProductVariantOptionDTO[];
  image_url: string | null;
  image_public_id: string | null;
}

export interface ProductAttributeDTO {
  id: string;
  values: string[];
  label: string;
  type: string;
  slug: string;
}

export interface ProductImageDTO {
  id: string;
  url: string;
  name: string;
  type: string;
  public_id: string | null;
  is_primary: boolean;
}

export interface ProductVariantImageDTO {
  image_id: string;
  is_primary: boolean;
}

export interface ProductVariantOptionDTO {
  name: string;
  value: string;
}

export interface ProductVariantDTO {
  id: string;
  sku: string;
  stock: number;
  minimum_stock: number;
  cost_price: number;
  is_active: boolean;
  options: ProductVariantOptionDTO[];
  product_variant_images: ProductVariantImageDTO[];
}

export interface ProductDTO {
  id: string;
  organization_id: string;
  name: string;
  sku: string;
  description?: string | null;
  stock: number;
  minimum_stock: number;
  cost_price?: number;
  has_variants: boolean;
  is_active: boolean;
  created_at: string;
  categories: CategoryDTO[];
  product_attributes: ProductAttributeDTO[];
  product_images: ProductImageDTO[];
  product_variants: ProductVariantDTO[];
}

export interface PersistImageDTO {
  id?: string;
  url: string;
  name: string;
  isPrimary: boolean;
  public_id?: string;
}

export interface PersistAttributeDTO {
  name: string;
  type: string;
  slug?: string;
  values: string[];
}

export interface PersistVariantImageDTO {
  id: string;
  isPrimary: boolean;
}

export interface PersistVariantDTO {
  id?: string;
  sku: string;
  stock: number;
  minimumStock: number;
  isActive: boolean;
  options: { name: string; value: string }[];
  images: PersistVariantImageDTO[];
}

export interface PersistProductDTO {
  id?: string;
  organization_id: string;
  name: string;
  sku: string;
  description?: string;
  hasVariants: boolean;
  stock: number;
  minimumStock: number;
  isActive: boolean;
  category_ids: string[];
  allImages: PersistImageDTO[];
  attributes: PersistAttributeDTO[];
  variants: PersistVariantDTO[];
}
