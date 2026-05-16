import { type z } from 'zod';

import type {
  attributeTypeSchema,
  createProductSchema,
  productAttributeSchema,
  productBaseSchema,
  productImageSchema,
  productInputBaseSchema,
  productSchema,
  productStockStatusSchema,
  productVariantInputSchema,
  productVariantSchema,
  updateProductSchema,
  variantImageSchema,
  variantOptionSchema
} from '../validators';

export type ProductStockStatus = z.infer<typeof productStockStatusSchema>;
export type AttributeType = z.infer<typeof attributeTypeSchema>;
export type VariantOption = z.infer<typeof variantOptionSchema>;
export type IProductAttribute = z.infer<typeof productAttributeSchema>;
export type IProductImage = z.infer<typeof productImageSchema>;
export type IvariantImage = z.infer<typeof variantImageSchema>;
export type ProductInputBase = z.infer<typeof productInputBaseSchema>;
export type ProductBase = z.infer<typeof productBaseSchema>;
export type CreateProductVariant = z.infer<typeof productVariantInputSchema>;
export type UpdateProductVariant = z.infer<typeof productVariantInputSchema>;
export type IProductVariant = z.infer<typeof productVariantSchema>;
export type CreateProduct = z.infer<typeof createProductSchema>;
export type UpdateProduct = z.infer<typeof updateProductSchema>;
export type IProduct = z.infer<typeof productSchema>;
