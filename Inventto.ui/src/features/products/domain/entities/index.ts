import { z } from 'zod';

const requiredString = (message: string) => z.string().trim().min(1, message);

const optionalString = z.string().trim().optional().nullable();

export const productStockStatusSchema = z.enum([
  'critical',
  'warning',
  'healthy'
]);

export const productUserRoleSchema = z.string();

export const attributeTypeSchema = z.enum([
  'text',
  'color',
  'number',
  'select'
]);

const categorySchema = z.object({
  id: requiredString('Categoria obrigatória.'),
  name: requiredString('Nome da categoria obrigatório.')
});

export const variantOptionSchema = z.object({
  name: requiredString('Nome da opção obrigatório.'),
  value: requiredString('Valor da opção obrigatório.')
});

export const productAttributeSchema = z.object({
  id: requiredString('Atributo obrigatório.'),
  name: requiredString('Nome do atributo obrigatório.'),
  slug: requiredString('Slug do atributo obrigatório.'),
  type: attributeTypeSchema,
  values: z.array(requiredString('Valor do atributo obrigatório.')).default([])
});

export const productImageSchema = z.object({
  id: requiredString('Imagem obrigatória.'),
  url: requiredString('URL da imagem obrigatória.'),
  name: requiredString('Nome da imagem obrigatório.'),
  type: requiredString('Tipo da imagem obrigatório.'),
  publicId: z.string().trim().optional(),
  isPrimary: z.boolean()
});

export const variantImageSchema = z.object({
  id: requiredString('Imagem da variação obrigatória.'),
  isPrimary: z.boolean().optional()
});

export const productVariantInputSchema = z.object({
  id: z.string().trim().optional(),
  sku: requiredString('SKU da variação obrigatório.'),
  stock: z
    .number()
    .int('Estoque deve ser um número inteiro.')
    .min(0, 'Estoque não pode ser negativo.'),
  minimumStock: z
    .number()
    .int('Estoque mínimo deve ser um número inteiro.')
    .min(0, 'Estoque mínimo não pode ser negativo.'),
  isActive: z.boolean(),
  images: z.array(variantImageSchema).default([]),
  options: z
    .array(variantOptionSchema)
    .min(1, 'Variação deve possuir ao menos uma opção.')
});

export const productVariantSchema = productVariantInputSchema.extend({
  id: requiredString('Variação obrigatória.'),
  costPrice: z
    .number()
    .min(0, 'Preço de custo não pode ser negativo.')
    .optional()
});

export const productInputBaseSchema = z.object({
  organizationId: requiredString('Organização obrigatória.'),
  name: requiredString('Nome do produto obrigatório.'),
  sku: requiredString('SKU do produto obrigatório.'),
  description: optionalString,
  categories: z.array(categorySchema).min(1, 'Categoria obrigatória.'),
  stock: z
    .number()
    .int('Estoque deve ser um número inteiro.')
    .min(0, 'Estoque não pode ser negativo.'),
  minimumStock: z
    .number()
    .int('Estoque mínimo deve ser um número inteiro.')
    .min(0, 'Estoque mínimo não pode ser negativo.'),
  isActive: z.boolean(),
  attributes: z.array(productAttributeSchema).default([]),
  allImages: z.array(productImageSchema).default([])
});

export const productBaseSchema = productInputBaseSchema.extend({
  id: requiredString('Produto obrigatório.'),
  costPrice: z
    .number()
    .min(0, 'Preço de custo não pode ser negativo.')
    .optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
});

export const createProductWithVariantsSchema = productInputBaseSchema.extend({
  hasVariants: z.literal(true),
  variants: z
    .array(productVariantInputSchema)
    .min(1, 'Produto com variações deve possuir ao menos uma variação.')
});

export const createProductWithoutVariantsSchema = productInputBaseSchema.extend(
  {
    hasVariants: z.literal(false),
    variants: z
      .array(productVariantInputSchema)
      .max(0, 'Produto simples não deve possuir variações.')
      .default([])
  }
);

export const createProductSchema = z.discriminatedUnion('hasVariants', [
  createProductWithVariantsSchema,
  createProductWithoutVariantsSchema
]);

export const updateProductWithVariantsSchema = productInputBaseSchema.extend({
  id: requiredString('Produto não informado.'),
  hasVariants: z.literal(true),
  variants: z
    .array(productVariantInputSchema)
    .min(1, 'Produto com variações deve possuir ao menos uma variação.')
});

export const updateProductWithoutVariantsSchema = productInputBaseSchema.extend(
  {
    id: requiredString('Produto não informado.'),
    hasVariants: z.literal(false),
    variants: z
      .array(productVariantInputSchema)
      .max(0, 'Produto simples não deve possuir variações.')
      .default([])
  }
);

export const updateProductSchema = z.discriminatedUnion('hasVariants', [
  updateProductWithVariantsSchema,
  updateProductWithoutVariantsSchema
]);

export const productWithVariantsSchema = productBaseSchema.extend({
  hasVariants: z.literal(true),
  variants: z
    .array(productVariantSchema)
    .min(1, 'Produto com variações deve possuir ao menos uma variação.')
});

export const productWithoutVariantsSchema = productBaseSchema.extend({
  hasVariants: z.literal(false),
  variants: z.array(productVariantSchema).default([])
});

export const productSchema = z.discriminatedUnion('hasVariants', [
  productWithVariantsSchema,
  productWithoutVariantsSchema
]);

export type ProductStockStatus = z.infer<typeof productStockStatusSchema>;
export type ProductUserRole = z.infer<typeof productUserRoleSchema>;
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
