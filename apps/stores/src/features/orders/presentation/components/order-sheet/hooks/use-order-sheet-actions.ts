import { Play } from 'lucide-react';

import type { Order } from '../../../../domain/entities';
import { ESTEIRA_STEP_BY_MICRO_STATE } from '../../../constants';
import {
  useAdvanceOrderMutation,
  useClaimOrderMutation,
  useFinalizeOrderMutation
} from '../../../hooks/use-mutations';
import type { OrderSheetPrimaryAction } from '../../order-sheet-footer';

interface UseOrderSheetActionsOptions {
  order: Order;
  onCancelRequest: (order: Order) => void;
  // RN087: "Finalizar" é a etapa terminal — ao concluir, a Sheet fecha e
  // volta para a lista (wireframe "sheet-saving").
  onFinalized?: () => void;
}

// Mapeia a esteira (RF034) para a ação primária do rodapé da Sheet: Pool
// só assume (sem secundária); Em atendimento avança/finaliza + Cancelar;
// encerrados não têm `primaryAction` (somente leitura).
export function useOrderSheetActions({
  order,
  onCancelRequest,
  onFinalized
}: UseOrderSheetActionsOptions) {
  const claimMutation = useClaimOrderMutation();
  const advanceMutation = useAdvanceOrderMutation();
  const finalizeMutation = useFinalizeOrderMutation();

  const isPool = order.macroState === 'pool';
  const isAttending = order.macroState === 'attending';
  const esteiraStep = ESTEIRA_STEP_BY_MICRO_STATE[order.microState];

  const primaryAction: OrderSheetPrimaryAction | undefined = isPool
    ? {
        label: 'Iniciar atendimento',
        icon: Play,
        onClick: () => claimMutation.mutate(order.id)
      }
    : isAttending && esteiraStep
      ? {
          label: esteiraStep.label,
          icon: esteiraStep.icon,
          onClick: () =>
            esteiraStep.kind === 'finalize'
              ? finalizeMutation.mutate(
                  { id: order.id, microState: order.microState },
                  { onSuccess: onFinalized }
                )
              : advanceMutation.mutate({
                  id: order.id,
                  microState: order.microState
                })
        }
      : undefined;

  const isSaving =
    claimMutation.isPending ||
    advanceMutation.isPending ||
    finalizeMutation.isPending;

  const savingLabel = finalizeMutation.isPending
    ? 'Finalizando…'
    : 'Processando…';

  return {
    primaryAction,
    // Pool ainda não tem Cancelar no rodapé (wireframe — precisa assumir
    // primeiro); só Em atendimento (confirmando/separação/entrega).
    onCancel: isAttending ? () => onCancelRequest(order) : undefined,
    isSaving,
    savingLabel
  };
}
