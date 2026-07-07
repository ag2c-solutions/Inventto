import { supabase } from '@/infra/supabase';

import { stripUndefined } from '@/shared/utils';

import type {
  AddCatalogItemsPayload,
  Catalog,
  CatalogItem,
  CreateCatalogPayload,
  UpdateCatalogItemPricePayload,
  UpdateCatalogPayload
} from '../../domain/entities';
import type { CatalogDTO, CatalogItemDTO } from '../dtos';
import { handleCatalogError } from '../handlers/error-handler';
import { CatalogItemMapper, CatalogMapper } from '../mappers';

const SELECT_QUERY = `
  id,
  organization_id,
  name,
  created_at,
  updated_at,
  catalog_items(count)
`;

const ITEM_SELECT_QUERY = `
  id,
  catalog_id,
  product_id,
  variant_id,
  price,
  original_price,
  product:products(
    id,
    name,
    sku,
    product_images(url, is_primary)
  )
`;

export class CatalogApi {
  static async getAll(): Promise<Catalog[]> {
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select(SELECT_QUERY)
        .order('created_at', { ascending: false })
        .overrideTypes<CatalogDTO[], { merge: false }>();

      if (error) throw error;

      return data.map(CatalogMapper.toDomain);
    } catch (error) {
      handleCatalogError(error, 'getAll');
    }
  }

  static async getOneById(id: string): Promise<Catalog> {
    try {
      const { data, error } = await supabase
        .from('catalogs')
        .select(SELECT_QUERY)
        .eq('id', id)
        .single()
        .overrideTypes<CatalogDTO, { merge: false }>();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Catálogo não encontrado.');
        }
        throw error;
      }

      return CatalogMapper.toDomain(data);
    } catch (error) {
      handleCatalogError(error, 'getOneById');
    }
  }

  static async add(params: CreateCatalogPayload): Promise<Catalog> {
    try {
      const dbPayload = stripUndefined(CatalogMapper.toPersistence(params));

      const { data, error } = await supabase
        .from('catalogs')
        .insert(dbPayload)
        .select(SELECT_QUERY)
        .single()
        .overrideTypes<CatalogDTO, { merge: false }>();

      if (error) throw error;

      return CatalogMapper.toDomain(data);
    } catch (error) {
      handleCatalogError(error, 'add');
    }
  }

  static async update(params: UpdateCatalogPayload): Promise<Catalog> {
    try {
      const { id, ...updates } = params;
      const dbUpdates = stripUndefined(CatalogMapper.toPersistence(updates));

      const { data, error } = await supabase
        .from('catalogs')
        .update(dbUpdates)
        .eq('id', id)
        .select(SELECT_QUERY)
        .single()
        .overrideTypes<CatalogDTO, { merge: false }>();

      if (error) throw error;

      return CatalogMapper.toDomain(data);
    } catch (error) {
      handleCatalogError(error, 'update');
    }
  }

  static async remove(id: string): Promise<void> {
    try {
      const { error } = await supabase.from('catalogs').delete().eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleCatalogError(error, 'remove');
    }
  }

  static async getItems(catalogId: string): Promise<CatalogItem[]> {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .select(ITEM_SELECT_QUERY)
        .eq('catalog_id', catalogId)
        .overrideTypes<CatalogItemDTO[], { merge: false }>();

      if (error) throw error;

      return data.map(CatalogItemMapper.toDomain);
    } catch (error) {
      handleCatalogError(error, 'getItems');
    }
  }

  static async addItems(
    params: AddCatalogItemsPayload
  ): Promise<CatalogItem[]> {
    try {
      const rows = params.productIds.map((productId) => ({
        catalog_id: params.catalogId,
        product_id: productId,
        price: 0
      }));

      const { data, error } = await supabase
        .from('catalog_items')
        .insert(rows)
        .select(ITEM_SELECT_QUERY)
        .overrideTypes<CatalogItemDTO[], { merge: false }>();

      if (error) throw error;

      return data.map(CatalogItemMapper.toDomain);
    } catch (error) {
      handleCatalogError(error, 'addItems');
    }
  }

  static async updateItemPrice(
    params: UpdateCatalogItemPricePayload
  ): Promise<CatalogItem> {
    try {
      const { id, price, originalPrice } = params;

      const { data, error } = await supabase
        .from('catalog_items')
        .update({ price, original_price: originalPrice ?? null })
        .eq('id', id)
        .select(ITEM_SELECT_QUERY)
        .single()
        .overrideTypes<CatalogItemDTO, { merge: false }>();

      if (error) throw error;

      return CatalogItemMapper.toDomain(data);
    } catch (error) {
      handleCatalogError(error, 'updateItemPrice');
    }
  }

  static async removeItem(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('catalog_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      handleCatalogError(error, 'removeItem');
    }
  }

  static async restoreItem(item: CatalogItem): Promise<CatalogItem> {
    try {
      const { data, error } = await supabase
        .from('catalog_items')
        .insert({
          catalog_id: item.catalogId,
          product_id: item.productId,
          variant_id: item.variantId ?? null,
          price: item.price,
          original_price: item.originalPrice ?? null
        })
        .select(ITEM_SELECT_QUERY)
        .single()
        .overrideTypes<CatalogItemDTO, { merge: false }>();

      if (error) throw error;

      return CatalogItemMapper.toDomain(data);
    } catch (error) {
      handleCatalogError(error, 'restoreItem');
    }
  }
}
