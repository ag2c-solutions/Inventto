import type {
  PersistProductDTO,
  ProductDTO,
  ProductVariantOptionDTO
} from '../types/dto';
import type {
  AttributeType,
  IProduct,
  IProductAttribute,
  IProductImage,
  IProductVariant,
  ProductBase,
  VariantOption
} from '../types/models';

export const ProductMapper = {
  toDomain(data: ProductDTO): IProduct {
    const allImages: IProductImage[] = (data.product_images || []).map(
      (image) => ({
        id: image.id,
        name: image.name,
        url: image.url,
        type: image.type,
        publicId: image.public_id || undefined,
        isPrimary: image.is_primary
      })
    );

    const attributes: IProductAttribute[] = (data.product_attributes || [])
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
      description: data.description || undefined,
      isActive: data.is_active,
      costPrice: data?.cost_price || undefined,
      stock: data.stock,
      minimumStock: data.minimum_stock,
      categories: data.categories.map((c) => c.category) || [],
      allImages: allImages.length > 0 ? allImages : undefined,
      attributes: attributes,
      createdAt: data.created_at
    };

    if (data.has_variants) {
      const variants: IProductVariant[] = (data.product_variants || []).map(
        (variant) => {
          const options: VariantOption[] = (variant.options || []).map(
            (opt: ProductVariantOptionDTO) => ({
              name: opt.name,
              value: opt.value
            })
          );

          return {
            id: variant.id,
            sku: variant.sku,
            stock: variant.stock,
            minimumStock: variant.minimum_stock,
            costPrice: variant.cost_price,
            isActive: variant.is_active,
            options: options,
            images: (variant.product_variant_images || [])
              .map((vi) => ({
                id: vi.image_id,
                isPrimary: vi.is_primary
              }))
              .sort((a, b) =>
                a.isPrimary === b.isPrimary ? 0 : a.isPrimary ? -1 : 1
              )
          };
        }
      );

      return {
        ...baseProduct,
        hasVariants: true,
        variants: variants
      };
    }

    return {
      ...baseProduct,
      hasVariants: false
    };
  },
  toPersistence(domain: IProduct): PersistProductDTO {
    return {
      id: domain.id,
      organization_id: domain.organizationId,
      name: domain.name,
      sku: domain.sku,
      description: domain.description,
      hasVariants: domain.hasVariants,
      stock: domain.stock,
      minimumStock: domain.minimumStock,
      isActive: domain.isActive,
      category_ids: domain.categories.map((c) => c.id),
      attributes: domain.hasVariants
        ? domain.attributes.map((attr) => ({
            attribute_id: attr.id,
            values: attr.values,
            type: attr.type,
            slug: attr.slug,
            name: attr.name
          }))
        : [],

      allImages: (domain.allImages || []).map((img) => ({
        id: img.id,
        url: img.url,
        name: img.name,
        isPrimary: img.isPrimary,
        public_id: img.publicId
      })),

      variants: domain.hasVariants
        ? domain.variants.map((v) => ({
            id: v.id,
            sku: v.sku,
            stock: v.stock,
            minimumStock: v.minimumStock,
            isActive: v.isActive,
            options: v.options,
            images: v.images.map((img) => ({
              id: img.id,
              isPrimary: img.isPrimary || false
            }))
          }))
        : []
    };
  }
};
