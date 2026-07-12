import { supabase } from '@/infra/supabase';

import type { Storefront } from '../../domain/entities';
import type { StorefrontDTO } from '../dtos';
import { handleStorefrontError } from '../handlers/error-handler';
import { StorefrontMapper } from '../mappers';

const SELECT_QUERY = `
  id,
  organization_id,
  name,
  slug,
  catalog_id,
  status,
  catalog:catalogs(id, name)
`;

export class StorefrontApi {
  static async getStorefronts(organizationId: string): Promise<Storefront[]> {
    try {
      const { data, error } = await supabase
        .from('storefronts')
        .select(SELECT_QUERY)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })
        .overrideTypes<StorefrontDTO[], { merge: false }>();

      if (error) throw error;

      return data.map(StorefrontMapper.toDomain);
    } catch (error) {
      handleStorefrontError(error, 'getStorefronts');
    }
  }

  static async setPublished(id: string, published: boolean): Promise<void> {
    try {
      const { error } = await supabase.rpc('set_storefront_published', {
        p_id: id,
        p_published: published
      });

      if (error) throw error;
    } catch (error) {
      handleStorefrontError(error, 'setPublished');
    }
  }
}
