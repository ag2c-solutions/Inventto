import type { Storefront } from '../../domain/entities';
import type { StorefrontDTO } from '../dtos';

export class StorefrontMapper {
  static toDomain(dto: StorefrontDTO): Storefront {
    return {
      id: dto.id,
      name: dto.name,
      slug: dto.slug ?? undefined,
      catalogId: dto.catalog_id ?? undefined,
      catalogName: dto.catalog?.name ?? undefined,
      whatsapp: dto.whatsapp ?? undefined,
      instagram: dto.instagram ?? undefined,
      facebook: dto.facebook ?? undefined,
      website: dto.website ?? undefined,
      state: dto.status === 'active' ? 'live' : 'inactive',
      publicUrl: dto.slug ? `inventto.app/${dto.slug}` : undefined
    };
  }
}
