export interface StorefrontDTO {
  id: string;
  organization_id: string;
  name: string;
  slug: string | null;
  catalog_id: string | null;
  status: 'active' | 'inactive';
  catalog: { id: string; name: string } | null;
}
