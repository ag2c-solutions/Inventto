import { BrowserRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Order } from '../../../domain/entities';
import { orderFactory } from '../../../tests/factories/order.factory';

const {
  mockUseOrdersQuery,
  mockUseRealtimeOrders,
  mockUseMembersQuery,
  mockCancelMutate,
  mockNavigate,
  mockUseParams,
  mockOpenOrderSheet
} = vi.hoisted(() => ({
  mockUseOrdersQuery: vi.fn(),
  mockUseRealtimeOrders: vi.fn(() => ({ newOrderIds: new Set<string>() })),
  mockUseMembersQuery: vi.fn(() => ({ data: [] })),
  mockCancelMutate: vi.fn(),
  mockNavigate: vi.fn(),
  mockUseParams: vi.fn(() => ({})),
  mockOpenOrderSheet: vi.fn()
}));

vi.mock('react-router', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: mockUseParams
  };
});

vi.mock('../../hooks/use-queries', () => ({
  useOrdersQuery: mockUseOrdersQuery
}));

vi.mock('../../hooks/use-realtime-orders', () => ({
  useRealtimeOrders: mockUseRealtimeOrders
}));

vi.mock('../../hooks/use-mutations', () => ({
  useCancelOrderMutation: () => ({ mutate: mockCancelMutate })
}));

vi.mock('../../hooks/use-open-order-sheet', () => ({
  useOpenOrderSheet: () => mockOpenOrderSheet
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

vi.mock('../../components/order-sheet', () => ({
  OrderSheet: () => <div data-testid="order-sheet" />
}));

let capturedOnCancelRequest: ((order: Order) => void) | undefined;
let capturedOnOpenDetail: ((order: Order) => void) | undefined;

vi.mock('../../components/orders-board', () => ({
  OrdersBoard: ({
    onOpenDetail,
    onCancelRequest
  }: {
    onOpenDetail: (order: Order) => void;
    onCancelRequest: (order: Order) => void;
  }) => {
    capturedOnOpenDetail = onOpenDetail;
    capturedOnCancelRequest = onCancelRequest;
    return <div data-testid="orders-board" />;
  }
}));

import { OrdersBoardPage } from '.';

const renderPage = () =>
  render(
    <BrowserRouter>
      <OrdersBoardPage />
    </BrowserRouter>
  );

describe('OrdersBoardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseMembersQuery.mockReturnValue({ data: [] });
    mockUseParams.mockReturnValue({});
  });

  it('should compose header, filters, board and the order sheet', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });

    renderPage();

    expect(screen.getByTestId('orders-header')).toBeInTheDocument();
    expect(screen.getByTestId('orders-filters')).toBeInTheDocument();
    expect(screen.getByTestId('orders-board')).toBeInTheDocument();
    expect(screen.getByTestId('order-sheet')).toBeInTheDocument();
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

    renderPage();

    expect(screen.getByTestId('orders-header')).toHaveTextContent('2');
  });

  it('should show skeletons instead of the board while loading', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: true });

    renderPage();

    expect(screen.queryByTestId('orders-board')).not.toBeInTheDocument();
  });

  it('should start the realtime subscription', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });

    renderPage();

    expect(mockUseRealtimeOrders).toHaveBeenCalled();
  });

  it('should navigate to /pedidos/:id and open the sheet when a card is opened', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });
    const order = orderFactory.build({ id: 'o1' });

    renderPage();
    capturedOnOpenDetail?.(order);

    expect(mockNavigate).toHaveBeenCalledWith('/pedidos/o1');
    expect(mockOpenOrderSheet).toHaveBeenCalledWith('o1');
  });

  it('should open the sheet for the :id deep-link on mount (PED-04)', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });
    mockUseParams.mockReturnValue({ id: 'o1' });

    renderPage();

    expect(mockOpenOrderSheet).toHaveBeenCalledWith('o1');
  });

  it('should cancel the order with the prompted reason', () => {
    mockUseOrdersQuery.mockReturnValue({ data: [], isLoading: false });
    const promptSpy = vi
      .spyOn(window, 'prompt')
      .mockReturnValue('Cliente desistiu');
    const order = orderFactory.build({ id: 'o1', microState: 'picking' });

    renderPage();
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

    renderPage();
    capturedOnCancelRequest?.(order);

    expect(mockCancelMutate).not.toHaveBeenCalled();

    promptSpy.mockRestore();
  });
});
