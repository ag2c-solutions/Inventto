import { z } from 'zod';

import { passwordSchema } from '@/features/auth';

export const changePasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword']
  });

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
