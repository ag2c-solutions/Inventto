import { z } from 'zod';

import { normalizeDocument, validateDocument } from '@/shared/utils';

const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

const dayScheduleSchema = z
  .object({
    isOpen: z.boolean(),
    open: z.string().optional(),
    close: z.string().optional()
  })
  .superRefine((data, ctx) => {
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

export const organizationSettingsSchema = z
  .object({
    name: z
      .string()
      .min(2, 'O nome da loja deve ter pelo menos 2 caracteres')
      .max(50, 'O nome deve ser curto e objetivo'),

    document: z.string().optional(),
    legalName: z.string().optional(),
    identity: z.object({
      logoUrl: z.url('URL inválida').optional().or(z.literal('')),
      logoFile: z.instanceof(File).optional()
    }),

    address: z.object({
      zip: z.string().optional(),
      street: z.string().optional(),
      number: z.string().optional(),
      complement: z.string().optional(),
      district: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional()
    }),

    operational: z.object({
      timezone: z
        .string({ error: 'Selecione o fuso horário da loja' })
        .min(1, 'Obrigatório')
    }),

    sales: z.object({
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
  })
  .superRefine((data, ctx) => {
    const doc = data.document?.trim();
    if (!doc) return;

    if (!validateDocument(doc)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Documento inválido. Verifique os números.',
        path: ['document']
      });
      return;
    }

    const isCnpj = normalizeDocument(doc).length > 11;
    if (isCnpj && !data.legalName?.trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Razão social é obrigatória para CNPJ.',
        path: ['legalName']
      });
    }
  });

export type OrganizationSettingsFormData = z.infer<
  typeof organizationSettingsSchema
>;

export const defaultSettingsValues: OrganizationSettingsFormData = {
  name: '',
  document: '',
  legalName: '',
  identity: {
    logoUrl: ''
  },
  address: {
    zip: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: ''
  },
  operational: {
    timezone: 'America/Sao_Paulo'
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
