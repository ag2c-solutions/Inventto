import { z } from 'zod';

// ... (Helpers e Regex mantidos igual) ...
const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
const dayScheduleSchema = z
  .object({
    isOpen: z.boolean(),
    open: z.string().optional(),
    close: z.string().optional()
  })
  .superRefine((data, ctx) => {
    // ... (Lógica do superRefine mantida igual)
    if (data.isOpen) {
      if (!data.open || !timeRegex.test(data.open)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Horário de abertura obrigatório',
          path: ['open']
        });
      }
      if (!data.close || !timeRegex.test(data.close)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Horário de fechamento obrigatório',
          path: ['close']
        });
      }
    }
  });

export const organizationSettingsSchema = z.object({
  identity: z.object({
    displayName: z
      .string()
      .min(2, 'O nome da loja deve ter pelo menos 2 caracteres')
      .max(50, 'O nome deve ser curto e objetivo'),
    logoUrl: z.string().url('URL inválida').optional().or(z.literal(''))
  }),

  operational: z.object({
    timezone: z
      .string({ error: 'Selecione o fuso horário da loja' })
      .min(1, 'Obrigatório'),

    // REMOVIDO: .transform()
    whatsappMain: z
      .string()
      .min(10, 'Número inválido (mínimo DDD + 8 dígitos)'),

    // REMOVIDO: .transform()
    whatsappSupport: z.string().optional()
  }),

  sales: z.object({
    // REMOVIDO: .default(false) -> Controlado pelo defaultValues do Hook
    acceptOrdersOutsideHours: z.boolean()
  }),

  schedule: z.object({
    mon: dayScheduleSchema,
    tue: dayScheduleSchema,
    wed: dayScheduleSchema,
    thu: dayScheduleSchema,
    fri: dayScheduleSchema,
    sat: dayScheduleSchema,
    sun: dayScheduleSchema
  })
});

export type OrganizationSettingsFormData = z.infer<
  typeof organizationSettingsSchema
>;

export const defaultSettingsValues: OrganizationSettingsFormData = {
  identity: {
    displayName: '',
    logoUrl: ''
  },
  operational: {
    timezone:
      Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo',
    whatsappMain: '',
    whatsappSupport: ''
  },
  sales: {
    acceptOrdersOutsideHours: false
  },
  schedule: {
    mon: { isOpen: true, open: '09:00', close: '18:00' },
    tue: { isOpen: true, open: '09:00', close: '18:00' },
    wed: { isOpen: true, open: '09:00', close: '18:00' },
    thu: { isOpen: true, open: '09:00', close: '18:00' },
    fri: { isOpen: true, open: '09:00', close: '18:00' },
    sat: { isOpen: false, open: '', close: '' },
    sun: { isOpen: false, open: '', close: '' }
  }
};
