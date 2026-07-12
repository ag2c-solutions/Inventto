import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { orderFactory } from '../../../tests/factories/order.factory';

const { mockUseOrdersQuery, mockUseRealtimeOrders, mockUseMembersQuery } =
  vi.hoisted(() => ({
    mockUseOrdersQuery: vi.fn(),
    mockUseRealtimeOrders: vi.fn(),
    mockUseMembersQuery: vi.fn(() => ({ data: [] }))
  }));

vi.mock('../../hooks/use-queries', () => ({
  useOrdersQuery: mockUseOrdersQuery
}));

vi.mock('../../hooks/use-realtime-orders', () => ({
  useRealtimeOrders: mockUseRealtimeOrders
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

vi.mock('../../components/orders-board', () => ({
  OrdersBoard: () => <div data-testid="orders-board" />
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
});
