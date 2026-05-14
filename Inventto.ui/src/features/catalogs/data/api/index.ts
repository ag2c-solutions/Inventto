import { stripUndefined } from '@/shared/utils';

import { supabase } from '@/infra/supabase';

import type { Catalog, PublicStorefront } from '../../domain/entities';
import type {
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../../domain/services';
import type { CatalogDTO } from '../dtos';
import { handleCatalogError } from '../handlers/error-handler';
import { CatalogMapper } from '../mappers';

const SELECT_QUERY = `
  id,
  organization_id,
  name,
  slug,
  whatsapp_number,
  description,
  is_active,
  theme_config,
  created_at,
  updated_at
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
      const rawDbPayload = CatalogMapper.toPersistence({
        ...params,
        isActive: true
      });

      const dbPayload = stripUndefined(rawDbPayload);

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
      const rawDbUpdates = CatalogMapper.toPersistence(updates);
      const dbUpdates = {
        ...stripUndefined(rawDbUpdates),
        updated_at: new Date().toISOString()
      };

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

  static async checkSlugAvailability(slug: string): Promise<boolean> {
    if (slug.length < 3) return false;

    try {
      const { count, error } = await supabase
        .from('catalogs')
        .select('id', { count: 'exact', head: true })
        .eq('slug', slug);

      if (error) return false;

      return count === 0;
    } catch (error) {
      console.error('Erro ao verificar slug:', error);

      return false;
    }
  }

  static async getPublicStorefront(slug: string): Promise<PublicStorefront> {
    try {
      const { data, error } = await supabase.rpc('get_public_catalog', {
        p_slug: slug
      });

      if (error) throw error;

      return CatalogMapper.toPublicStorefront(data);
    } catch (error) {
      handleCatalogError(error, 'getPublicStorefront');
    }
  }
}
