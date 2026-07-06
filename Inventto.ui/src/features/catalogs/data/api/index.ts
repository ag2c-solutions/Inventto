import { supabase } from '@/infra/supabase';

import { stripUndefined } from '@/shared/utils';

import type {
  Catalog,
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../../domain/entities';
import type { CatalogDTO } from '../dtos';
import { handleCatalogError } from '../handlers/error-handler';
import { CatalogMapper } from '../mappers';

const SELECT_QUERY = `
  id,
  organization_id,
  name,
  created_at,
  updated_at,
  catalog_items(count)
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
}
