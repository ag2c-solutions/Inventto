import { formatDecimalToInteger } from '@/shared/utils';

import { formatVariantOptions } from '@/features/products';

import type { PdvCatalog, PdvProduct } from '../../domain/entities';
import type { PdvCatalogItemDTO, PdvOrgCatalogDTO } from '../dtos';

export class PdvCatalogMapper {
  static toDomain(dto: PdvOrgCatalogDTO): PdvCatalog | null {
    if (!dto.pdv_catalog_id || !dto.catalog) return null;

    return {
      id: dto.catalog.id,
      name: dto.catalog.name
    };
  }
}

export class PdvProductMapper {
  static toDomain(dto: PdvCatalogItemDTO): PdvProduct {
    const images = dto.product.product_images || [];
    const primaryImage = images.find((image) => image.is_primary) ?? images[0];
    const stock = dto.variant ? dto.variant.stock : dto.product.stock;
    const categoryId = dto.product.categories?.[0]?.category?.id;

    return {
      productId: dto.product_id,
      variantId: dto.variant_id ?? undefined,
      name: dto.product.name,
      variantLabel: dto.variant
        ? formatVariantOptions(dto.variant.options)
        : undefined,
      sku: dto.variant?.sku ?? dto.product.sku,
      price: formatDecimalToInteger(dto.price),
      stock,
      isOut: stock === 0,
      imageUrl: primaryImage?.url,
      categoryId
    };
  }
}
