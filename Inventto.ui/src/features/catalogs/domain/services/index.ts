import { CatalogApi } from '../../data/api';
import type {
  AddCatalogItemsPayload,
  Catalog,
  CatalogItem,
  CreateCatalogPayload,
  UpdateCatalogItemPricePayload,
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

export class CatalogItemService {
  static async getItems(catalogId: string): Promise<CatalogItem[]> {
    return CatalogApi.getItems(catalogId);
  }

  static async addItems(
    params: AddCatalogItemsPayload
  ): Promise<CatalogItem[]> {
    if (params.productIds.length === 0) {
      throw new Error('Selecione ao menos um produto.');
    }

    return CatalogApi.addItems(params);
  }

  static async updateItemPrice(
    params: UpdateCatalogItemPricePayload
  ): Promise<CatalogItem> {
    if (!params.price || params.price <= 0) {
      throw new Error('Defina um preço para incluir este item.');
    }

    if (params.originalPrice !== undefined && params.originalPrice <= 0) {
      throw new Error('O preço original deve ser maior que zero.');
    }

    return CatalogApi.updateItemPrice(params);
  }

  static async removeItem(id: string): Promise<void> {
    return CatalogApi.removeItem(id);
  }

  static async restoreItem(item: CatalogItem): Promise<CatalogItem> {
    return CatalogApi.restoreItem(item);
  }
}
