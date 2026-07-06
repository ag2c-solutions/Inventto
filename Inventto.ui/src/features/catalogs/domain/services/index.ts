import { CatalogApi } from '../../data/api';
import type {
  Catalog,
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../entities';

export class CatalogService {
  static async create(params: CreateCatalogPayload): Promise<Catalog> {
    if (!params.name?.trim()) {
      throw new Error('Informe um nome para o catálogo.');
    }

    return CatalogApi.add(params);
  }

  static async update(params: UpdateCatalogPayload): Promise<Catalog> {
    if (params.name !== undefined && !params.name.trim()) {
      throw new Error('Informe um nome para o catálogo.');
    }

    return CatalogApi.update(params);
  }

  static async remove(id: string): Promise<void> {
    return CatalogApi.remove(id);
  }
}
