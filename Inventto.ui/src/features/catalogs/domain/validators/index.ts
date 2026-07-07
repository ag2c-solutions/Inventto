import { z } from 'zod';

export const catalogSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome para o catálogo.')
});

export type CatalogFormValues = z.infer<typeof catalogSchema>;

export const catalogItemPriceSchema = z.object({
  price: z.number().positive('Defina um preço para incluir este item.'),
  originalPrice: z
    .number()
    .positive('O preço original deve ser maior que zero.')
    .optional()
});

export type CatalogItemPriceFormValues = z.infer<typeof catalogItemPriceSchema>;
