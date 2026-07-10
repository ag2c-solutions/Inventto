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
