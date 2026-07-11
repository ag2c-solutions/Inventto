import type { PaymentMethod } from '../../domain/entities';

export const PDV_KEYS = {
  catalog: (organizationId: string) =>
    ['pdv', 'catalog', organizationId] as const,
  products: (catalogId: string) => ['pdv', 'products', catalogId] as const,
  customer: (organizationId: string, phone: string) =>
    ['pdv', 'customer', organizationId, phone] as const
} as const;

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Dinheiro',
  card: 'Cartão',
  pix: 'Pix'
};
