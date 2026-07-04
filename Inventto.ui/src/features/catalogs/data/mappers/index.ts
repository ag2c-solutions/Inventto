import { DEFAULT_THEME } from '../../domain/constants';
import type {
  Catalog,
  CatalogThemeConfig,
  CreateCatalogPayload,
  PublicStorefront
} from '../../domain/entities';
import type {
  CatalogDTO,
  CatalogThemeConfigDTO,
  PublicCatalogResponseDTO
} from '../dtos';

export class CatalogMapper {
  static toDomain(dto: CatalogDTO): Catalog {
    return {
      id: dto.id,
      name: dto.name,
      slug: dto.slug,
      whatsappNumber: dto.whatsapp_number,
      description: dto.description || '',
      isActive: dto.is_active,
      themeConfig: CatalogMapper.parseThemeConfig(dto.theme_config),
      createdAt: new Date(dto.created_at)
    };
  }

  static toPersistence(
    payload: Partial<CreateCatalogPayload & { isActive?: boolean }>
  ): Partial<CatalogDTO> {
    return {
      organization_id: payload.organizationId,
      name: payload.name,
      slug: payload.slug,
      whatsapp_number: payload.whatsappNumber,
      description: payload.description,
      is_active: payload.isActive,
      theme_config: payload.themeConfig
        ? CatalogMapper.formatThemeForPersistence(payload.themeConfig)
        : undefined
    };
  }

  static toPublicStorefront(dto: PublicCatalogResponseDTO): PublicStorefront {
    if (!dto || !dto.catalog) {
      throw new Error('Dados do catálogo inválidos.');
    }

    return {
      info: {
        name: dto.catalog.name,
        description: dto.catalog.description || '',
        whatsappNumber: dto.catalog.whatsapp_number,
        theme: CatalogMapper.parseThemeConfig(dto.catalog.theme_config)
      },
      products: (dto.items || []).map((item) => ({
        id: item.item_id,
        name: item.product_name,
        description: item.product_description || '',
        price: item.price,
        originalPrice: item.original_price,
        isFeatured: item.is_featured,
        isInStock: item.in_stock,
        images: Array.isArray(item.images) ? item.images : [],
        variant: item.variant_id
          ? {
              id: item.variant_id,
              attributes: item.variant_attributes || {}
            }
          : undefined
      }))
    };
  }

  private static parseThemeConfig(
    dto: CatalogThemeConfigDTO | null | undefined
  ): CatalogThemeConfig {
    return {
      colors: CatalogMapper.resolveColors(dto?.colors),
      branding: CatalogMapper.resolveBranding(dto?.branding),
      layout: CatalogMapper.resolveLayout(dto?.layout),
      behavior: CatalogMapper.resolveBehavior(dto?.behavior),
      socialLinks: dto?.social_links ? dto.social_links : undefined
    };
  }

  private static formatThemeForPersistence(
    domain: CatalogThemeConfig
  ): CatalogThemeConfigDTO {
    const colors = domain?.colors || DEFAULT_THEME.colors;
    const branding = domain?.branding || DEFAULT_THEME.branding;
    const layout = domain?.layout || DEFAULT_THEME.layout;
    const behavior = domain?.behavior || DEFAULT_THEME.behavior;

    return {
      colors: {
        primary: colors.primary ?? DEFAULT_THEME.colors.primary,
        background: colors.background ?? DEFAULT_THEME.colors.background,
        text: colors.text ?? DEFAULT_THEME.colors.text,
        secondary: colors.secondary
      },
      branding: {
        show_cover: branding.showCover ?? DEFAULT_THEME.branding.showCover,
        logo_url: branding.logoUrl,
        cover_image_url: branding.coverImageUrl
      },
      layout: {
        mode: layout.mode ?? DEFAULT_THEME.layout.mode,
        products_per_page:
          layout.productsPerPage ?? DEFAULT_THEME.layout.productsPerPage,
        card_style: layout.cardStyle
      },
      behavior: {
        display_price:
          behavior.displayPrice ?? DEFAULT_THEME.behavior.displayPrice,
        whatsapp_message:
          behavior.whatsappMessage ?? DEFAULT_THEME.behavior.whatsappMessage,
        show_out_of_stock: behavior.showOutOfStock
      },
      social_links: domain?.socialLinks
    };
  }

  private static resolveColors(dto?: CatalogThemeConfigDTO['colors']) {
    return {
      primary: dto?.primary ?? DEFAULT_THEME.colors.primary,
      background: dto?.background ?? DEFAULT_THEME.colors.background,
      text: dto?.text ?? DEFAULT_THEME.colors.text,
      secondary: dto?.secondary
    };
  }

  private static resolveBranding(dto?: CatalogThemeConfigDTO['branding']) {
    return {
      showCover: dto?.show_cover ?? DEFAULT_THEME.branding.showCover,
      logoUrl: dto?.logo_url,
      coverImageUrl: dto?.cover_image_url
    };
  }

  private static resolveLayout(dto?: CatalogThemeConfigDTO['layout']) {
    return {
      mode: dto?.mode ?? DEFAULT_THEME.layout.mode,
      productsPerPage:
        dto?.products_per_page ?? DEFAULT_THEME.layout.productsPerPage,
      cardStyle: dto?.card_style
    };
  }

  private static resolveBehavior(dto?: CatalogThemeConfigDTO['behavior']) {
    return {
      displayPrice: dto?.display_price ?? DEFAULT_THEME.behavior.displayPrice,
      whatsappMessage:
        dto?.whatsapp_message ?? DEFAULT_THEME.behavior.whatsappMessage,
      showOutOfStock: dto?.show_out_of_stock
    };
  }
}
