import type { Storefront, StorefrontTheme } from '../../domain/entities';
import type { StorefrontDTO } from '../dtos';

// Vitrines criadas antes do VIT-04 (ou sem tema definido ainda) têm
// `theme = '{}'` no banco — a UI sempre trabalha com um tema completo.
const DEFAULT_THEME: StorefrontTheme = {
  colors: {
    primary: '#3A3631',
    background: '#F7F5F2',
    secondary: '#8B857D',
    text: '#2C2A28'
  },
  layout: 'grid',
  cardStyle: 'minimal-large-image'
};

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
      publicUrl: dto.slug ? `inventto.app/${dto.slug}` : undefined,
      theme: {
        colors: {
          primary: dto.theme?.colors?.primary ?? DEFAULT_THEME.colors.primary,
          background:
            dto.theme?.colors?.background ?? DEFAULT_THEME.colors.background,
          secondary:
            dto.theme?.colors?.secondary ?? DEFAULT_THEME.colors.secondary,
          text: dto.theme?.colors?.text ?? DEFAULT_THEME.colors.text
        },
        logoUrl: dto.theme?.logo_url ?? undefined,
        coverUrl: dto.theme?.cover_url ?? undefined,
        layout: dto.theme?.layout ?? DEFAULT_THEME.layout,
        cardStyle:
          (dto.theme?.card_style as StorefrontTheme['cardStyle']) ??
          DEFAULT_THEME.cardStyle
      }
    };
  }
}
