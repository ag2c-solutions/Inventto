import { z } from 'zod';

const variantOptionSchema = z.object({
  name: z.string(),
  value: z.string()
});

export const movementItemSchema = z.object({
  productId: z.string(),
  productName: z.string(),
  productImage: z.string().optional(),
  sku: z.string().optional(),
  variantId: z.string().nullable().optional(),
  variantName: z.string().optional(),
  variantOptions: z.array(variantOptionSchema).optional(),
  currentStock: z.number(),
  unitCost: z.number(),
  unitPrice: z.number(),
  quantity: z.number().min(1, 'A quantidade deve ser maior que 0')
});

export const baseMovementSchema = z.object({
  type: z.enum(['entry', 'withdrawal']),
  date: z.date({
    error: (issue) => {
      if (
        issue.code === z.ZodIssueCode.invalid_type &&
        issue.received === 'undefined'
      ) {
        return { message: 'Selecione uma data' };
      }
      return { message: 'Data inválida' };
    }
  }),

  time: z
    .string()
    .regex(
      /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/,
      'Horário inválido'
    ),

  reason: z.string().min(1, 'Selecione o motivo da movimentação'),
  description: z.string().optional(),
  documentNumber: z.string().optional(),
  totalQuantity: z.number(),
  items: z
    .array(movementItemSchema)
    .min(1, 'Adicione pelo menos um item à movimentação')
});

export const movementSchema = baseMovementSchema.superRefine((data, ctx) => {
  if (data.reason === 'Outro' && !data.description?.trim()) {
    ctx.addIssue({
      code: 'custom',
      message: 'Descreva o motivo quando selecionar "Outro"',
      path: ['description']
    });
  }

  if (data.type === 'withdrawal') {
    data.items.forEach((item, index) => {
      if (item.quantity > item.currentStock) {
        ctx.addIssue({
          code: 'custom',
          message: `Estoque insuficiente (Disponível: ${item.currentStock})`,
          path: ['items', index, 'quantity']
        });
      }
    });
  }
});

export type MovementFormData = z.infer<typeof movementSchema>;
