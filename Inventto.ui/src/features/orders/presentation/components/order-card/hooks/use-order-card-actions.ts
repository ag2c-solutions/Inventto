import { Ban, Flag, type LucideIcon, Package, Truck } from 'lucide-react';

import type { Order, OrderMicroState } from '../../../../domain/entities';
import {
  useAdvanceOrderMutation,
  useClaimOrderMutation,
  useFinalizeOrderMutation
} from '../../../hooks/use-mutations';

export interface OrderCardMenuAction {
  label: string;
  icon: LucideIcon;
  danger?: boolean;
  onClick: () => void;
}

export interface OrderCardChatAction {
  label: string;
  variant: 'primary' | 'ghost' | 'disabled';
  onClick?: () => void;
}

interface EsteiraStep {
  label: string;
  icon: LucideIcon;
  kind: 'advance' | 'finalize';
}

// Esteira (RF034/§8): rótulo e RPC disparada por micro-estado. "Finalizar"
// é sempre a etapa terminal (RN087 — consome a reserva e gera a saída).
const ESTEIRA_STEP_BY_MICRO_STATE: Partial<
  Record<OrderMicroState, EsteiraStep>
> = {
  confirming: { label: 'Iniciar separação', icon: Package, kind: 'advance' },
  picking: { label: 'Despachar entrega', icon: Truck, kind: 'advance' },
  delivering: { label: 'Finalizar pedido', icon: Flag, kind: 'finalize' }
};

interface UseOrderCardActionsOptions {
  order: Order;
  onOpenDetail: (order: Order) => void;
  onCancelRequest: (order: Order) => void;
}

// RN084/RF032: mensagem padrão do WhatsApp — a origem definitiva (storefront
// de origem, whatsapp_message de VIT-05) ainda não está ligada ao pedido;
// ver "Ponto de verificação" do PED-02.
function buildWhatsAppUrl(order: Order): string | undefined {
  if (!order.customerPhone) return undefined;

  const digits = order.customerPhone.replace(/\D/g, '');
  const message = encodeURIComponent(
    `Olá, ${order.customerName ?? ''}! Sobre o seu pedido ${order.code}...`
  );

  return `https://wa.me/55${digits}?text=${message}`;
}

export function useOrderCardActions({
  order,
  onOpenDetail,
  onCancelRequest
}: UseOrderCardActionsOptions) {
  const claimMutation = useClaimOrderMutation();
  const advanceMutation = useAdvanceOrderMutation();
  const finalizeMutation = useFinalizeOrderMutation();

  const isPool = order.macroState === 'pool';
  const isAttending = order.macroState === 'attending';

  function openWhatsApp() {
    const url = buildWhatsAppUrl(order);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  // Pool: assume o pedido (RN082) e, ao concluir, abre o WhatsApp — a mesma
  // ação de dados + efeito local descritos no PED-02.
  const chatAction: OrderCardChatAction = isPool
    ? {
        label: 'Iniciar atendimento',
        variant: 'primary',
        onClick: () =>
          claimMutation.mutate(order.id, { onSuccess: openWhatsApp })
      }
    : isAttending
      ? { label: 'Abrir WhatsApp', variant: 'ghost', onClick: openWhatsApp }
      : { label: 'Abrir WhatsApp', variant: 'disabled' };

  const esteiraStep = ESTEIRA_STEP_BY_MICRO_STATE[order.microState];

  const menuActions: OrderCardMenuAction[] =
    isAttending && esteiraStep
      ? [
          {
            label: esteiraStep.label,
            icon: esteiraStep.icon,
            onClick: () =>
              esteiraStep.kind === 'finalize'
                ? finalizeMutation.mutate({
                    id: order.id,
                    microState: order.microState
                  })
                : advanceMutation.mutate({
                    id: order.id,
                    microState: order.microState
                  })
          },
          {
            label: 'Cancelar pedido',
            icon: Ban,
            danger: true,
            onClick: () => onCancelRequest(order)
          }
        ]
      : [];

  return {
    chatAction,
    menuActions,
    isMenuDisabled: !isAttending,
    onOpenDetail: () => onOpenDetail(order),
    isPending:
      claimMutation.isPending ||
      advanceMutation.isPending ||
      finalizeMutation.isPending
  };
}
