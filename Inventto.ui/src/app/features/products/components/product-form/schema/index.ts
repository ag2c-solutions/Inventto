import { CategorySchema } from '@/app/features/categories/schemas';
import { z } from 'zod';

export const attributeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome do atributo é obrigatório.'),
  slug: z.string().optional(),
  type: z.enum(['text', 'color', 'number', 'select']).default('text'),
  values: z
    .array(z.string().min(1, "O valor não pode ser vazio."))
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
  isPrimary: z.boolean().default(false)
});

export const ProductVariantImageSchema = z.object({
  id: z.string(),
  isPrimary: z.boolean().default(false)
});

export const variantSchema = z.object({
  id: z.string(),
  sku: z.string().min(1, 'SKU da variação é obrigatório.'),
  minimumStock: z
    .number()
    .int()
    .min(0, 'Estoque mínimo deve ser 0 ou mais.')
    .default(0),
  stock: z
    .number()
    .int()
    .min(0, 'Quantidade em estoque deve ser 0 ou mais.')
    .default(0),
  costPrice: z
    .number()
    .min(0, 'Preço de custo deve ser 0 ou mais.')
    .default(0),
  isActive: z.boolean().default(true),
  options: z.array(
    z.object({
      name: z.string(),
      value: z.string()
    })
  ),
  images: z.array(ProductVariantImageSchema)
});

const FormCategorySchema = z.custom<z.infer<typeof CategorySchema>>(
  (val) => CategorySchema.safeParse(val).success,
  { message: 'Categoria é obrigatória.' }
);

export const productSchemaWithVariants = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres.'),
  sku: z.string().min(1, 'SKU principal é obrigatório.'),
  description: z.string().optional(),
  categories: z
    .array(FormCategorySchema)
    .min(1, 'Selecione pelo menos uma categoria.'),
  minimumStock: z.number().int().default(0),
  stock: z
    .number()
    .int()
    .min(0, 'Quantidade em estoque deve ser 0 ou mais.')
    .default(0),
  costPrice: z
    .number()
    .min(0, 'Preço de custo deve ser 0 ou mais.')
    .default(0),
  isActive: z.boolean().default(true),
  hasVariants: z.literal(true),
  attributes: z
    .array(attributeSchema)
    .min(1, 'Deve conter pelo menos um atributo'),
  variants: z
    .array(variantSchema)
    .min(1, 'Deve conter pelo menos uma variante'),
  allImages: z.array(ProductImageFormSchema).optional()
});

export const productSchemaWithoutVariants = z.object({
  id: z.string().optional(),
  name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres.'),
  sku: z.string().min(1, 'SKU principal é obrigatório.'),
  description: z.string().optional(),
  categories: z
    .array(FormCategorySchema)
    .min(1, 'Selecione pelo menos uma categoria.'),
  minimumStock: z.number().int().default(0),
  stock: z.number().int().default(0),
  costPrice: z
    .number()
    .min(0, 'Preço de custo deve ser 0 ou mais.')
    .default(0),
  isActive: z.boolean().default(true),
  hasVariants: z.literal(false),
  allImages: z.array(ProductImageFormSchema).optional()
});

export const productSchema = z.discriminatedUnion('hasVariants', [
  productSchemaWithVariants,
  productSchemaWithoutVariants
]);

export type ProductFormData = {
  id?: string;
  name: string;
  sku: string;
  description?: string;
  categories: z.infer<typeof FormCategorySchema>[];
  minimumStock: number;
  stock: number;
  costPrice: number;
  isActive: boolean;
  hasVariants: boolean;
  attributes: z.infer<typeof attributeSchema>[];
  variants: z.infer<typeof variantSchema>[];
  allImages?: z.infer<typeof ProductImageFormSchema>[];
};