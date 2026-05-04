import z from 'zod';

export const categorySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'O nome da categoria é obrigatório.')
});

export type CategoryFormValues = z.infer<typeof categorySchema>;
