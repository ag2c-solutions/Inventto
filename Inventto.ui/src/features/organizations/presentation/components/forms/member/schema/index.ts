import { z } from 'zod';

import { passwordSchema } from '@/features/auth';

export const memberFormSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
    email: z
      .string()
      .min(1, 'O e-mail é obrigatório.')
      .email('Formato de e-mail inválido.'),
    role: z.enum(['manager', 'sales'], {
      error: () => ({ message: 'Selecione uma função válida.' })
    }),
    // Senha provisória só é exigida no fluxo de novo membro. Na replicação o
    // usuário já tem acesso ativo (RN035), então a validação é dispensada.
    password: z.string().optional(),
    isReplication: z.boolean()
  })
  .superRefine((data, ctx) => {
    if (data.isReplication) return;

    // RN001: reusa o passwordSchema da feature auth (mín. 8 + complexidade).
    const result = passwordSchema.safeParse(data.password ?? '');

    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          code: 'custom',
          message: issue.message,
          path: ['password']
        });
      }
    }
  });

export type MemberFormData = z.infer<typeof memberFormSchema>;
