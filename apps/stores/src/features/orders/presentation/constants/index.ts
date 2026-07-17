import { Flag, type LucideIcon, Package, Truck } from 'lucide-react';

import type {
  OrderMicroState,
  OrderPaymentMethod
} from '../../domain/entities';

export const ORDER_KEYS = {
  all: ['orders'] as const,
  detail: (id?: string) => ['orders', 'detail', id] as const
} as const;

// RN083: checkout coleta a forma de pagamento, mas a transação não é
// processada pelo app — daí o sufixo "(offline)" no rótulo da Sheet.
export const PAYMENT_METHOD_LABELS: Record<OrderPaymentMethod, string> = {
  card: 'Cartão (offline)',
  cash: 'Dinheiro (offline)',
  pix: 'Pix (offline)'
};

export interface EsteiraStep {
  label: string;
  icon: LucideIcon;
  kind: 'advance' | 'finalize';
}

// Esteira (RF034/§8): rótulo e RPC disparada por micro-estado. "Finalizar"
// é sempre a etapa terminal (RN087 — consome a reserva e gera a saída).
// Compartilhado entre o rodapé do card (PED-02) e o rodapé da Sheet (PED-04).
export const ESTEIRA_STEP_BY_MICRO_STATE: Partial<
  Record<OrderMicroState, EsteiraStep>
> = {
  confirming: { label: 'Iniciar separação', icon: Package, kind: 'advance' },
  picking: { label: 'Despachar entrega', icon: Truck, kind: 'advance' },
  delivering: { label: 'Finalizar pedido', icon: Flag, kind: 'finalize' }
};
