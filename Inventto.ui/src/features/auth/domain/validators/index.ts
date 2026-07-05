import { z } from 'zod';

import { normalizeDocument, validateDocument } from '@/shared/utils';

export const passwordSchema = z
  .string()
  .min(8, 'A senha deve ter no mínimo 8 caracteres.')
  .max(32, 'A senha deve ter no máximo 32 caracteres.')
  .regex(/[A-Z]/, 'Deve conter pelo menos uma letra maiúscula.')
  .regex(/[a-z]/, 'Deve conter pelo menos uma letra minúscula.')
  .regex(/[0-9]/, 'Deve conter pelo menos um número.')
  .regex(/[^A-Za-z0-9]/, 'Deve conter pelo menos um caractere especial.');

export const organizationSchema = z
  .object({
    companyName: z.string().min(2, 'O Nome Fantasia é obrigatório.'),
    document: z
      .string()
      .min(1, 'O documento é obrigatório.')
      .refine((val) => validateDocument(val), {
        message: 'Documento inválido. Verifique os números.'
      }),
    corporateName: z.string().optional(),
    businessAreaCode: z.string().min(1, 'Selecione uma área de atuação.')
  })
  .superRefine((data, ctx) => {
    const cleanDoc = normalizeDocument(data.document);
    const isCnpj = cleanDoc.length > 11;

    if (isCnpj && (!data.corporateName || data.corporateName.trim() === '')) {
      ctx.addIssue({
        code: 'custom',
        message: 'A Razão Social é obrigatória para CNPJ.',
        path: ['corporateName']
      });
    }
  });

export const userSchema = z
  .object({
    fullName: z.string().min(3, 'Informe seu nome completo.'),
    email: z.email('Informe um e-mail válido.'),
    password: passwordSchema,
    passwordConfirmation: z.string(),
    acceptedTerms: z.boolean().refine((v) => v === true, {
      message: 'É preciso aceitar os Termos para continuar.'
    })
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'As senhas não coincidem.',
    path: ['passwordConfirmation']
  });

export const signUpSchema = z.intersection(organizationSchema, userSchema);

export const firstAccessSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem.',
    path: ['confirmPassword']
  });

// AUTH-07 (Redefinir senha) usa o mesmo formato e mensagens do first access.
export const resetPasswordSchema = firstAccessSchema;

export type SignUpFormValues = z.infer<typeof signUpSchema>;
export type FirstAccessFormValues = z.infer<typeof firstAccessSchema>;
export type ResetPasswordFormValues = FirstAccessFormValues;
