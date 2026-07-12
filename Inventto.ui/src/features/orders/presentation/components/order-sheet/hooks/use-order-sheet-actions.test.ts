import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { orderFactory } from '../../../../tests/factories/order.factory';

import { useOrderSheetActions } from './use-order-sheet-actions';

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

describe('useOrderSheetActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should expose "Iniciar atendimento" with no cancel for pool orders', () => {
    const order = orderFactory.build({
      macroState: 'pool',
      microState: 'pending'
    });
    const { result } = renderHook(() =>
      useOrderSheetActions({ order, onCancelRequest: vi.fn() })
    );

    expect(result.current.primaryAction?.label).toBe('Iniciar atendimento');
    expect(result.current.onCancel).toBeUndefined();
  });

  it('should claim the order when the pool primary action is triggered', () => {
    const order = orderFactory.build({
      macroState: 'pool',
      microState: 'pending'
    });
    const { result } = renderHook(() =>
      useOrderSheetActions({ order, onCancelRequest: vi.fn() })
    );

    result.current.primaryAction?.onClick();

    expect(mockClaim.mutate).toHaveBeenCalledWith(order.id);
  });

  it('should show "Iniciar separação" + Cancelar for confirming', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'confirming'
    });
    const onCancelRequest = vi.fn();
    const { result } = renderHook(() =>
      useOrderSheetActions({ order, onCancelRequest })
    );

    expect(result.current.primaryAction?.label).toBe('Iniciar separação');
    result.current.primaryAction?.onClick();
    expect(mockAdvance.mutate).toHaveBeenCalledWith({
      id: order.id,
      microState: 'confirming'
    });

    result.current.onCancel?.();
    expect(onCancelRequest).toHaveBeenCalledWith(order);
  });

  it('should show "Despachar entrega" for picking and call advance', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'picking'
    });
    const { result } = renderHook(() =>
      useOrderSheetActions({ order, onCancelRequest: vi.fn() })
    );

    expect(result.current.primaryAction?.label).toBe('Despachar entrega');
    result.current.primaryAction?.onClick();
    expect(mockAdvance.mutate).toHaveBeenCalledWith({
      id: order.id,
      microState: 'picking'
    });
  });

  it('should call finalize_order (via finalize) when delivering and notify onFinalized on success', () => {
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'delivering'
    });
    const onFinalized = vi.fn();
    const { result } = renderHook(() =>
      useOrderSheetActions({ order, onCancelRequest: vi.fn(), onFinalized })
    );

    expect(result.current.primaryAction?.label).toBe('Finalizar pedido');
    result.current.primaryAction?.onClick();

    expect(mockFinalize.mutate).toHaveBeenCalledWith(
      { id: order.id, microState: 'delivering' },
      { onSuccess: onFinalized }
    );
  });

  it('should have no primary action for closed orders (somente leitura)', () => {
    const order = orderFactory.build({
      macroState: 'done',
      microState: 'confirmed'
    });
    const { result } = renderHook(() =>
      useOrderSheetActions({ order, onCancelRequest: vi.fn() })
    );

    expect(result.current.primaryAction).toBeUndefined();
    expect(result.current.onCancel).toBeUndefined();
  });

  it('should report isSaving with "Finalizando…" while the finalize mutation is pending', () => {
    mockFinalize.isPending = true;
    const order = orderFactory.build({
      macroState: 'attending',
      microState: 'delivering'
    });
    const { result } = renderHook(() =>
      useOrderSheetActions({ order, onCancelRequest: vi.fn() })
    );

    expect(result.current.isSaving).toBe(true);
    expect(result.current.savingLabel).toBe('Finalizando…');

    mockFinalize.isPending = false;
  });
});
