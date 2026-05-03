import { z } from 'zod';

export const memberFormSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z
    .string()
    .min(1, 'O e-mail é obrigatório.')
    .email('Formato de e-mail inválido.'),
  role: z.enum(['manager', 'sales'], {
    error: () => ({ message: 'Selecione uma função válida.' })
  }),
  password: z
    .string()
    .min(6, 'A senha provisória deve ter no mínimo 6 caracteres.')
});

export type MemberFormData = z.infer<typeof memberFormSchema>;
