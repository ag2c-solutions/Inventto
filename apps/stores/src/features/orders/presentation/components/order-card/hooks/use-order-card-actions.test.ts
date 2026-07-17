import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { orderFactory } from '../../../../tests/factories/order.factory';

import { useOrderCardActions } from './use-order-card-actions';

const { mockClaim, mockAdvance, mockFinalize } = vi.hoisted(() => ({
  mockClaim: { mutate: vi.fn(), isPending: false },
  mockAdvance: { mutate: vi.fn(), isPending: false },
  mockFinalize: { mutate: vi.fn(), isPending: false }
}));

vi.mock('../../../hooks/use-mutations', () => ({
  useClaimOrderMutation: () => mockClaim,
  useAdvanceOrderMutation: () => mockAdvance,
  useFinalizeOrderMutation: () => mockFinalize
}));

describe('useOrderCardActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose "Iniciar atendimento" as the primary chat action for pool orders', () => {
    const order = orderFactory.build({
      macroState: 'pool',
      microState: 'pending'
    });
    const { result } = renderHook(() =>
      useOrderCardActions({
        order,
        onOpenDetail: vi.fn(),
        onCancelRequest: vi.fn()
      })
    );

    expect(result.current.chatAction).toMatchObject({
      label: 'Iniciar atendimento',
      variant: 'primary'
    });
    expect(result.current.isMenuDisabled).toBe(true);
    expect(result.current.menuActions).toHaveLength(0);
  });

  it('should claim the order when "Iniciar atendimento" is triggered', () => {
    const order = orderFactory.build({
      macroState: 'pool',
      microState: 'pending'
    });
    const { result } = renderHook(() =>
      useOrderCardActions({
        order,
        onOpenDetail: vi.fn(),
        onCancelRequest: vi.fn()
      })
    );

    result.current.chatAction.onClick?.();

    expect(mockClaim.mutate).toHaveBeenCalledWith(order.id, expect.any(Object));
  });

  it('should expose "Abrir WhatsApp" as a ghost action for attending orders', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'confirming'
    });
    const { result } = renderHook(() =>
      useOrderCardActions({
        order,
        onOpenDetail: vi.fn(),
        onCancelRequest: vi.fn()
      })
    );

    expect(result.current.chatAction).toMatchObject({
      label: 'Abrir WhatsApp',
      variant: 'ghost'
    });
  });

  it('should disable the chat action for closed orders', () => {
    const order = orderFactory.build({
      macroState: 'done',
      microState: 'confirmed'
    });
    const { result } = renderHook(() =>
      useOrderCardActions({
        order,
        onOpenDetail: vi.fn(),
        onCancelRequest: vi.fn()
      })
    );

    expect(result.current.chatAction.variant).toBe('disabled');
  });

  it('should show "Iniciar separação" for confirming and call advance', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'confirming'
    });
    const { result } = renderHook(() =>
      useOrderCardActions({
        order,
        onOpenDetail: vi.fn(),
        onCancelRequest: vi.fn()
      })
    );

    expect(result.current.menuActions.map((action) => action.label)).toEqual([
      'Iniciar separação',
      'Cancelar pedido'
    ]);

    result.current.menuActions[0].onClick();
    expect(mockAdvance.mutate).toHaveBeenCalledWith({
      id: order.id,
      microState: 'confirming'
    });
  });

  it('should show "Despachar entrega" for picking and call advance', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'picking'
    });
    const { result } = renderHook(() =>
      useOrderCardActions({
        order,
        onOpenDetail: vi.fn(),
        onCancelRequest: vi.fn()
      })
    );

    expect(result.current.menuActions[0].label).toBe('Despachar entrega');
    result.current.menuActions[0].onClick();
    expect(mockAdvance.mutate).toHaveBeenCalledWith({
      id: order.id,
      microState: 'picking'
    });
  });

  it('should show "Finalizar pedido" for delivering and call finalize', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'delivering'
    });
    const { result } = renderHook(() =>
      useOrderCardActions({
        order,
        onOpenDetail: vi.fn(),
        onCancelRequest: vi.fn()
      })
    );

    expect(result.current.menuActions[0].label).toBe('Finalizar pedido');
    result.current.menuActions[0].onClick();
    expect(mockFinalize.mutate).toHaveBeenCalledWith({
      id: order.id,
      microState: 'delivering'
    });
  });

  it('should request cancellation instead of calling a mutation directly', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'picking'
    });
    const onCancelRequest = vi.fn();
    const { result } = renderHook(() =>
      useOrderCardActions({ order, onOpenDetail: vi.fn(), onCancelRequest })
    );

    const cancelAction = result.current.menuActions.find(
      (action) => action.label === 'Cancelar pedido'
    );
    cancelAction?.onClick();

    expect(onCancelRequest).toHaveBeenCalledWith(order);
  });

  it('should call onOpenDetail with the order', () => {
    const order = orderFactory.build();
    const onOpenDetail = vi.fn();
    const { result } = renderHook(() =>
      useOrderCardActions({ order, onOpenDetail, onCancelRequest: vi.fn() })
    );

    result.current.onOpenDetail();

    expect(onOpenDetail).toHaveBeenCalledWith(order);
  });
});
