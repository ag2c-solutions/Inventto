import { CatalogApi } from '../../data/api';
import type { Catalog, CatalogThemeConfig } from '../entities';

export interface CreateCatalogPayload {
  name: string;
  slug: string;
  whatsappNumber: string;
  description?: string;
  themeConfig: CatalogThemeConfig;
}

export interface UpdateCatalogPayload
  extends Partial<Omit<CreateCatalogPayload, 'slug'>> {
  id: string;
  slug?: string;
  isActive?: boolean;
}

export class CatalogService {
  static async add(params: CreateCatalogPayload): Promise<Catalog> {
    return CatalogApi.add(params);
  }

  static async update(params: UpdateCatalogPayload): Promise<Catalog> {
    return CatalogApi.update(params);
  }

  static async remove(id: string): Promise<void> {
    return CatalogApi.remove(id);
  }

  static async checkSlugAvailability(slug: string): Promise<boolean> {
    return CatalogApi.checkSlugAvailability(slug);
  }
}
