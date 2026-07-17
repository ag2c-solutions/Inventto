import { z } from 'zod';

export const catalogSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome para o catálogo.')
});

export type CatalogFormValues = z.infer<typeof catalogSchema>;

// Preços trabalham em centavos (inteiro) — mesma convenção do MoneyInput.

// Schema para configuração de uma variante individual dentro do dialog
export const variantPriceInputSchema = z.object({
  variantId: z.string(),
  included: z.boolean(),
  price: z.number().positive('Defina um preço para esta variante.').optional(),
  originalPrice: z
    .number()
    .positive('O preço original deve ser maior que zero.')
    .nullable()
    .optional()
});

export type VariantPriceInput = z.infer<typeof variantPriceInputSchema>;

// Schema para configuração de um produto (simples ou com variantes) dentro do dialog
export const catalogItemInputSchema = z.object({
  productId: z.string(),
  priceMode: z.enum(['single', 'per_variant']),
  // Preço único (produto simples ou priceMode === 'single')
  price: z.number().positive('Defina um preço de venda.').optional(),
  originalPrice: z
    .number()
    .positive('O preço original deve ser maior que zero.')
    .nullable()
    .optional(),
  // Configuração por variante
  variants: z.array(variantPriceInputSchema).optional()
});

export type CatalogItemInputFormValues = z.infer<typeof catalogItemInputSchema>;

// Schema do formulário completo do dialog
export const configurePricesSchema = z.object({
  items: z.array(catalogItemInputSchema)
});

export type ConfigurePricesFormValues = z.infer<typeof configurePricesSchema>;
