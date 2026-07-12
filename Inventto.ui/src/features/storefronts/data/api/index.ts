import { CloudinaryService } from '@/infra/cloudinary';
import { supabase } from '@/infra/supabase';

import {
  type CreateStorefrontPayload,
  type PublishPrereqKey,
  type SlugAvailability,
  type SlugAvailabilityReason,
  type Storefront,
  StorefrontPrereqsMissingError,
  StorefrontSlugUnavailableError,
  type UpdateStorefrontPayload,
  type UpdateStorefrontThemePayload
} from '../../domain/entities';
import type { StorefrontDTO } from '../dtos';
import {
  handleStorefrontError,
  PREREQS_MISSING_ERROR_MARKER,
  SLUG_UNAVAILABLE_ERROR_MARKER
} from '../handlers/error-handler';
import { StorefrontMapper } from '../mappers';

const SELECT_QUERY = `
  id,
  organization_id,
  name,
  slug,
  catalog_id,
  whatsapp,
  instagram,
  facebook,
  website,
  status,
  catalog:catalogs(id, name),
  theme
`;

function parseMissingPrereqs(message: string): PublishPrereqKey[] {
  const [, keysPart] = message.split(`${PREREQS_MISSING_ERROR_MARKER}:`);

  return (keysPart ?? '')
    .split(',')
    .map((key) => key.trim())
    .filter(Boolean) as PublishPrereqKey[];
}

function parseSlugUnavailableReason(message: string): SlugAvailabilityReason {
  const [, reason] = message.split(`${SLUG_UNAVAILABLE_ERROR_MARKER}:`);

  return (reason?.trim() || 'invalid') as SlugAvailabilityReason;
}

function toThemeRpcPayload(theme: UpdateStorefrontThemePayload) {
  return {
    colors: theme.colors,
    logo_url: theme.logoUrl ?? null,
    cover_url: theme.coverUrl ?? null,
    layout: theme.layout,
    card_style: theme.cardStyle
  };
}

function toStorefrontRpcPayload(
  payload: CreateStorefrontPayload | UpdateStorefrontPayload
) {
  return {
    name: payload.name,
    catalogId: payload.catalogId ?? null,
    slug: payload.slug ?? null,
    whatsapp: payload.whatsapp ?? null,
    instagram: payload.instagram ?? null,
    facebook: payload.facebook ?? null,
    website: payload.website ?? null,
    theme: payload.theme ? toThemeRpcPayload(payload.theme) : undefined
  };
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

  static async getStorefront(id: string): Promise<Storefront | undefined> {
    try {
      const { data, error } = await supabase
        .from('storefronts')
        .select(SELECT_QUERY)
        .eq('id', id)
        .maybeSingle()
        .overrideTypes<StorefrontDTO, { merge: false }>();

      if (error) throw error;
      if (!data) return undefined;

      return StorefrontMapper.toDomain(data);
    } catch (error) {
      handleStorefrontError(error, 'getStorefront');
    }
  }

  static async checkSlug(
    slug: string,
    storefrontId?: string
  ): Promise<SlugAvailability> {
    try {
      const { data, error } = await supabase.rpc('check_slug_available', {
        p_slug: slug,
        p_storefront_id: storefrontId ?? null
      });

      if (error) throw error;

      return data as SlugAvailability;
    } catch (error) {
      handleStorefrontError(error, 'checkSlug');
    }
  }

  static async createStorefront(
    payload: CreateStorefrontPayload
  ): Promise<string> {
    try {
      const { data, error } = await supabase.rpc('create_storefront', {
        payload: {
          organizationId: payload.organizationId,
          ...toStorefrontRpcPayload(payload)
        }
      });

      if (error) {
        if (error.message.includes(SLUG_UNAVAILABLE_ERROR_MARKER)) {
          throw new StorefrontSlugUnavailableError(
            parseSlugUnavailableReason(error.message)
          );
        }
        throw error;
      }

      return data as string;
    } catch (error) {
      handleStorefrontError(error, 'createStorefront');
    }
  }

  static async uploadLogo(file: File): Promise<string> {
    try {
      const { url } = await CloudinaryService.uploadImage(file);
      return url;
    } catch (error) {
      handleStorefrontError(error, 'uploadLogo');
    }
  }

  static async uploadCover(file: File): Promise<string> {
    try {
      const { url } = await CloudinaryService.uploadImage(file);
      return url;
    } catch (error) {
      handleStorefrontError(error, 'uploadCover');
    }
  }

  static async updateStorefront(
    payload: UpdateStorefrontPayload
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_storefront', {
        p_id: payload.id,
        payload: toStorefrontRpcPayload(payload)
      });

      if (error) {
        if (error.message.includes(SLUG_UNAVAILABLE_ERROR_MARKER)) {
          throw new StorefrontSlugUnavailableError(
            parseSlugUnavailableReason(error.message)
          );
        }
        throw error;
      }
    } catch (error) {
      handleStorefrontError(error, 'updateStorefront');
    }
  }
}
