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
}
