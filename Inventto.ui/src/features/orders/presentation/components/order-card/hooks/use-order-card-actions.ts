import { Ban, type LucideIcon } from 'lucide-react';

import type { Order } from '../../../../domain/entities';
import { ESTEIRA_STEP_BY_MICRO_STATE } from '../../../constants';
import {
  useAdvanceOrderMutation,
  useClaimOrderMutation,
  useFinalizeOrderMutation
} from '../../../hooks/use-mutations';
import { buildWhatsAppUrl } from '../../../utils/build-whatsapp-url';

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

interface UseOrderCardActionsOptions {
  order: Order;
  onOpenDetail: (order: Order) => void;
  onCancelRequest: (order: Order) => void;
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
