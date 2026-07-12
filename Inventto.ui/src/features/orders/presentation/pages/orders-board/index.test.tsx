import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Order } from '../../../domain/entities';
import { orderFactory } from '../../../tests/factories/order.factory';

const {
  mockUseOrdersQuery,
  mockUseRealtimeOrders,
  mockUseMembersQuery,
  mockCancelMutate
} = vi.hoisted(() => ({
  mockUseOrdersQuery: vi.fn(),
  mockUseRealtimeOrders: vi.fn(() => ({ newOrderIds: new Set<string>() })),
  mockUseMembersQuery: vi.fn(() => ({ data: [] })),
  mockCancelMutate: vi.fn()
}));

vi.mock('../../hooks/use-queries', () => ({
  useOrdersQuery: mockUseOrdersQuery
}));

vi.mock('../../hooks/use-realtime-orders', () => ({
  useRealtimeOrders: mockUseRealtimeOrders
}));

vi.mock('../../hooks/use-mutations', () => ({
  useCancelOrderMutation: () => ({ mutate: mockCancelMutate })
}));

vi.mock('@/features/organizations', () => ({
  useOrganizationMembersQuery: mockUseMembersQuery
}));

vi.mock('../../components/orders-header', () => ({
  OrdersHeader: ({ inProgressCount }: { inProgressCount: number }) => (
    <div data-testid="orders-header">{inProgressCount}</div>
  )
}));

vi.mock('../../components/orders-filters', () => ({
  OrdersFilters: () => <div data-testid="orders-filters" />
}));

let capturedOnCancelRequest: ((order: Order) => void) | undefined;

vi.mock('../../components/orders-board', () => ({
  OrdersBoard: ({
    onCancelRequest
  }: {
    onCancelRequest: (order: Order) => void;
  }) => {
    capturedOnCancelRequest = onCancelRequest;
    return <div data-testid="orders-board" />;
  }
}));

import { OrdersBoardPage } from '.';

describe('OrdersBoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMembersQuery.mockReturnValue({ data: [] });
  });

  it('should compose header, filters and board', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });

    render(<OrdersBoardPage />);

    expect(screen.getByTestId('orders-header')).toBeInTheDocument();
    expect(screen.getByTestId('orders-filters')).toBeInTheDocument();
    expect(screen.getByTestId('orders-board')).toBeInTheDocument();
  });

  it('should count pool + attending orders as "em andamento"', () => {
    mockUseOrdersQuery.mockReturnValue({
      data: [
        orderFactory.build({ macroState: 'pool' }),
        orderFactory.build({ macroState: 'attending' }),
        orderFactory.build({ macroState: 'done' }),
        orderFactory.build({ macroState: 'cancelled' })
      ],
      isLoading: false
    });

    render(<OrdersBoardPage />);

    expect(screen.getByTestId('orders-header')).toHaveTextContent('2');
  });

  it('should show skeletons instead of the board while loading', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: true });

    render(<OrdersBoardPage />);

    expect(screen.queryByTestId('orders-board')).not.toBeInTheDocument();
  });

  it('should start the realtime subscription', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });

    render(<OrdersBoardPage />);

    expect(mockUseRealtimeOrders).toHaveBeenCalled();
  });

  it('should cancel the order with the prompted reason', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });
    const promptSpy = vi
      .spyOn(window, 'prompt')
      .mockReturnValue('Cliente desistiu');
    const order = orderFactory.build({ id: 'o1', microState: 'picking' });

    render(<OrdersBoardPage />);
    capturedOnCancelRequest?.(order);

    expect(mockCancelMutate).toHaveBeenCalledWith({
      id: 'o1',
      microState: 'picking',
      reason: 'Cliente desistiu'
    });

    promptSpy.mockRestore();
  });

  it('should not cancel when the prompt is dismissed without a reason', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });
    const promptSpy = vi.spyOn(window, 'prompt').mockReturnValue(null);
    const order = orderFactory.build({ id: 'o1', microState: 'picking' });

    render(<OrdersBoardPage />);
    capturedOnCancelRequest?.(order);

    expect(mockCancelMutate).not.toHaveBeenCalled();

    promptSpy.mockRestore();
  });
});
