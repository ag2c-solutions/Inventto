import { z } from 'zod';

export const memberRoleFormSchema = z.object({
  role: z.enum(['manager', 'sales'])
});

export type MemberRoleFormValues = z.infer<typeof memberRoleFormSchema>;

export const memberStatusFormSchema = z.object({
  status: z.enum(['active', 'inactive'])
});

export type MemberStatusFormValues = z.infer<typeof memberStatusFormSchema>;
