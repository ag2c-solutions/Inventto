import { z } from 'zod';

export const catalogSchema = z.object({
  name: z.string().trim().min(1, 'Informe um nome para o catálogo.')
});

export type CatalogFormValues = z.infer<typeof catalogSchema>;
