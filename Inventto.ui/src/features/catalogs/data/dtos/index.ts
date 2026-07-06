export interface CatalogDTO {
  id: string;
  organization_id: string;
  name: string;
  created_at: string;
  updated_at: string;
  catalog_items: Array<{ count: number }>;
}
