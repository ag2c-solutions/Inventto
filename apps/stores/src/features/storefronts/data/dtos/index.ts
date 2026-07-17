export interface StorefrontThemeDTO {
  colors?: {
    primary?: string;
    background?: string;
    secondary?: string;
    text?: string;
  };
  logo_url?: string;
  cover_url?: string;
  layout?: 'grid' | 'list';
  card_style?: string;
}

export interface StorefrontDTO {
  id: string;
  organization_id: string;
  name: string;
  slug: string | null;
  catalog_id: string | null;
  whatsapp: string | null;
  instagram: string | null;
  facebook: string | null;
  website: string | null;
  status: 'active' | 'inactive';
  catalog: { id: string; name: string } | null;
  theme: StorefrontThemeDTO;
  show_prices: boolean;
  show_sold_out: boolean;
  whatsapp_message: string | null;
}

export interface FeaturableProductDTO {
  product_id: string;
  variant_id: string | null;
  product: {
    id: string;
    name: string;
    sku: string;
    product_images: Array<{ url: string; is_primary: boolean }>;
  };
}
