import z from 'zod';

export const recoverPasswordSchema = z.object({
  email: z.email('Informe um e-mail válido.')
});

export type RecoverPasswordFormData = z.infer<typeof recoverPasswordSchema>;
