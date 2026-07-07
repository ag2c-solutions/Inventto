import type {
  Catalog,
  CatalogItem,
  CreateCatalogPayload,
  UpdateCatalogPayload
} from '../../domain/entities';
import type { CatalogDTO, CatalogItemDTO } from '../dtos';

export class CatalogMapper {
  static toDomain(dto: CatalogDTO): Catalog {
    return {
      id: dto.id,
      organizationId: dto.organization_id,
      name: dto.name,
      createdAt: new Date(dto.created_at),
      updatedAt: new Date(dto.updated_at),
      productsCount: dto.catalog_items?.[0]?.count ?? 0,
      // Fonte de vínculo (storefronts/PDV) ainda não existe — Módulo 8/7.
      channelsCount: 0
    };
  }

  static toPersistence(
    payload: Partial<CreateCatalogPayload & UpdateCatalogPayload>
  ): Partial<Pick<CatalogDTO, 'organization_id' | 'name'>> {
    return {
      organization_id: payload.organizationId,
      name: payload.name
    };
  }
}

export class CatalogItemMapper {
  static toDomain(dto: CatalogItemDTO): CatalogItem {
    const images = dto.product.product_images || [];
    const primaryImage = images.find((image) => image.is_primary) ?? images[0];

    return {
      id: dto.id,
      catalogId: dto.catalog_id,
      productId: dto.product_id,
      variantId: dto.variant_id ?? undefined,
      price: dto.price,
      originalPrice: dto.original_price ?? undefined,
      product: {
        id: dto.product.id,
        name: dto.product.name,
        sku: dto.product.sku,
        imageUrl: primaryImage?.url
      }
    };
  }
}
