import { supabase } from '@/infra/supabase';

import {
  type PublishPrereqKey,
  type Storefront,
  StorefrontPrereqsMissingError
} from '../../domain/entities';
import type { StorefrontDTO } from '../dtos';
import {
  handleStorefrontError,
  PREREQS_MISSING_ERROR_MARKER
} from '../handlers/error-handler';
import { StorefrontMapper } from '../mappers';

const SELECT_QUERY = `
  id,
  organization_id,
  name,
  slug,
  catalog_id,
  whatsapp,
  status,
  catalog:catalogs(id, name)
`;

function parseMissingPrereqs(message: string): PublishPrereqKey[] {
  const [, keysPart] = message.split(`${PREREQS_MISSING_ERROR_MARKER}:`);

  return (keysPart ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean) as PublishPrereqKey[];
}

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

  static async publishStorefront(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('publish_storefront', {
        p_id: id
      });

      if (error) {
        if (error.message.includes(PREREQS_MISSING_ERROR_MARKER)) {
          throw new StorefrontPrereqsMissingError(
            parseMissingPrereqs(error.message)
          );
        }
        throw error;
      }
    } catch (error) {
      handleStorefrontError(error, 'publishStorefront');
    }
  }

  static async removeStorefront(id: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('remove_storefront', {
        p_id: id
      });

      if (error) throw error;
    } catch (error) {
      handleStorefrontError(error, 'removeStorefront');
    }
  }
}
