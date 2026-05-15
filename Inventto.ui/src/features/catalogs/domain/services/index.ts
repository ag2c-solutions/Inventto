import { CatalogApi } from '../../data/api';
import type {
  Catalog,
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../entities';

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
    const normalizedSlug = slug.toLowerCase().trim();

    if (!normalizedSlug || normalizedSlug.length < 3) return false;

    return CatalogApi.checkSlugAvailability(normalizedSlug);
  }
}
