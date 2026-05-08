import type {
  AttributeType,
  CreateProduct,
  IProduct,
  IProductAttribute,
  IProductImage,
  IProductVariant,
  ProductBase,
  UpdateProduct,
  VariantOption
} from '../../domain/entities';
import type {
  PersistProductDTO,
  ProductDTO,
  ProductVariantOptionDTO
} from '../dtos';

export class ProductMapper {
  static toDomain(data: ProductDTO): IProduct {
    const allImages: IProductImage[] = (data.product_images ?? []).map(
      (image) => ({
        id: image.id,
        name: image.name,
        url: image.url,
        type: image.type,
        publicId: image.public_id ?? undefined,
        isPrimary: image.is_primary
      })
    );

    const attributes: IProductAttribute[] = (data.product_attributes ?? [])
      .filter((attr) => attr !== null)
      .map((attr) => ({
        id: attr.id,
        name: attr.label,
        slug: attr.slug,
        type: attr.type as AttributeType,
        values: attr.values
      }));

    const baseProduct: ProductBase = {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      sku: data.sku,
      description: data.description ?? undefined,
      isActive: data.is_active,
      costPrice: data.cost_price ?? undefined,
      stock: data.stock,
      minimumStock: data.minimum_stock,
      categories: data.categories?.map((category) => category.category) ?? [],
      allImages,
      attributes,
      createdAt: data.created_at
    };

    if (data.has_variants) {
      const variants: IProductVariant[] = (data.product_variants ?? []).map(
        (variant) => {
          const options: VariantOption[] = (variant.options ?? []).map(
            (option: ProductVariantOptionDTO) => ({
              name: option.name,
              value: option.value
            })
          );

          return {
            id: variant.id,
            sku: variant.sku,
            stock: variant.stock,
            minimumStock: variant.minimum_stock,
            costPrice: variant.cost_price ?? undefined,
            isActive: variant.is_active,
            options,
            images: (variant.product_variant_images ?? [])
              .map((variantImage) => ({
                id: variantImage.image_id,
                isPrimary: variantImage.is_primary
              }))
              .sort((current, next) =>
                current.isPrimary === next.isPrimary
                  ? 0
                  : current.isPrimary
                    ? -1
                    : 1
              )
          };
        }
      );

      return {
        ...baseProduct,
        hasVariants: true,
        variants
      };
    }

    return {
      ...baseProduct,
      hasVariants: false,
      variants: []
    };
  }

  static toPersistence(
    domain: CreateProduct | UpdateProduct
  ): PersistProductDTO {
    return {
      id: 'id' in domain ? domain.id : undefined,
      organization_id: domain.organizationId,
      name: domain.name,
      sku: domain.sku,
      description: domain.description ?? undefined,
      hasVariants: domain.hasVariants,
      stock: domain.stock,
      minimumStock: domain.minimumStock,
      isActive: domain.isActive,
      category_ids: domain.categories.map((category) => category.id),

      attributes: domain.hasVariants
        ? domain.attributes.map((attribute) => ({
            attribute_id: attribute.id,
            values: attribute.values,
            type: attribute.type,
            slug: attribute.slug,
            name: attribute.name
          }))
        : [],

      allImages: domain.allImages.map((image) => ({
        id: image.id,
        url: image.url,
        name: image.name,
        type: image.type,
        isPrimary: image.isPrimary,
        public_id: image.publicId
      })),

      variants: domain.hasVariants
        ? domain.variants.map((variant) => ({
            id: variant.id,
            sku: variant.sku,
            stock: variant.stock,
            minimumStock: variant.minimumStock,
            isActive: variant.isActive,
            options: variant.options,
            images: variant.images.map((image) => ({
              id: image.id,
              isPrimary: image.isPrimary ?? false
            }))
          }))
        : []
    };
  }
}
