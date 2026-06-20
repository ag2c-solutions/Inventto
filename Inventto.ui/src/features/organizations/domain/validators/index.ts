import { z } from 'zod';

import { validateDocument } from '@/shared/utils';

export const memberRoleFormSchema = z.object({
  role: z.enum(['manager', 'sales'])
});

export type MemberRoleFormValues = z.infer<typeof memberRoleFormSchema>;

export const memberStatusFormSchema = z.object({
  status: z.enum(['active', 'inactive'])
});

export type MemberStatusFormValues = z.infer<typeof memberStatusFormSchema>;

export const replicationGroupSchema = z.enum([
  'categories',
  'operational',
  'visual'
]);

export const createOrganizationSchema = z
  .object({
    name: z.string().min(3, 'O nome deve ter no mínimo 3 caracteres.'),
    document: z
      .string()
      .optional()
      .refine(
        (val) => !val || validateDocument(val),
        'Documento inválido. Informe um CPF (11 dígitos) ou CNPJ (14 dígitos) válido.'
      ),
    copySettings: z.boolean().optional(),
    sourceOrgId: z.string().optional(),
    replicateGroups: z.array(replicationGroupSchema).optional()
  })
  .superRefine((data, ctx) => {
    if (data.copySettings && !data.sourceOrgId) {
      ctx.addIssue({
        code: 'custom',
        message: 'Selecione a organização de origem.',
        path: ['sourceOrgId']
      });
    }
  });

export type CreateOrganizationFormValues = z.infer<
  typeof createOrganizationSchema
>;
