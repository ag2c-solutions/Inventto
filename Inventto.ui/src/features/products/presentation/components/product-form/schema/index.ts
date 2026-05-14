import { z } from 'zod';

import { categorySchema } from '@/features/categories';

export const attributeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome do atributo é obrigatório.'),
  slug: z.string().optional(),
  type: z.enum(['text', 'color', 'number', 'select']),
  values: z
    .array(z.string().min(1, 'O valor não pode ser vazio.'))
    .min(1, 'Adicione pelo menos um valor para o atributo.'),
  isNew: z.boolean().optional()
});

export const ProductImageFormSchema = z.object({
  id: z.string(),
  file: z
    .any()
    .refine(
      (val) =>
        val instanceof File || val === undefined || val === ({} as const),
      {
        message: `Input must be a File or an uploaded image object: `
      }
    )
    .optional(),
  name: z.string(),
  url: z.string(),
  type: z.string(),
  publicId: z.string().optional(),
  isPrimary: z.boolean()
});

export const ProductVariantImageSchema = z.object({
  id: z.string(),
  isPrimary: z.boolean()
});

export const variantSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, 'SKU da variação é obrigatório.'),
  minimumStock: z.number().int().min(0, 'Estoque mínimo deve ser 0 ou mais.'),
  stock: z.number().int().min(0, 'Quantidade em estoque deve ser 0 ou mais.'),
  isActive: z.boolean(),
  options: z.array(
    z.object({
      name: z.string(),
      value: z.string()
    })
  ),
  images: z.array(ProductVariantImageSchema)
});

const FormCategorySchema = z.custom<z.infer<typeof categorySchema>>(
  (val) => categorySchema.safeParse(val).success,
  'Categoria é obrigatória.'
);

export const productSchemaWithVariants = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres.'),
  sku: z.string().min(1, 'SKU principal é obrigatório.'),
  description: z.string().optional(),
  categories: z
    .array(FormCategorySchema)
    .min(1, 'Selecione pelo menos uma categoria.'),
  minimumStock: z.number().int(),
  stock: z.number().int().min(0, 'Quantidade em estoque deve ser 0 ou mais.'),
  isActive: z.boolean(),
  hasVariants: z.literal(true),
  attributes: z
    .array(attributeSchema)
    .min(1, 'Deve conter pelo menos um atributo'),
  variants: z
    .array(variantSchema)
    .min(1, 'Deve conter pelo menos uma variante'),
  allImages: z.array(ProductImageFormSchema)
});

export const productSchemaWithoutVariants = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres.'),
  sku: z.string().min(1, 'SKU principal é obrigatório.'),
  description: z.string().optional(),
  categories: z
    .array(FormCategorySchema)
    .min(1, 'Selecione pelo menos uma categoria.'),
  minimumStock: z.number().int(),
  stock: z.number().int(),
  isActive: z.boolean(),
  hasVariants: z.literal(false),
  allImages: z.array(ProductImageFormSchema)
});

export const productSchema = z.discriminatedUnion('hasVariants', [
  productSchemaWithVariants,
  productSchemaWithoutVariants
]);

export type ProductFormWithVariantsData = z.infer<
  typeof productSchemaWithVariants
>;
export type ProductFormWithoutVariantsData = z.infer<
  typeof productSchemaWithoutVariants
>;
export type ProductFormData = z.infer<typeof productSchema>;
