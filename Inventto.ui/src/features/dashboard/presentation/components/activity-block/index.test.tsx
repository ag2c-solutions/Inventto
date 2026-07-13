import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  ownRecentSaleFactory,
  recentMovementFactory,
  recentOrderFactory
} from '../../../tests/factories/recent-activity.factory';
import { useRecentActivityQuery } from '../../hooks/use-queries';

import { ActivityBlock } from '.';

vi.mock('../../hooks/use-queries');

const mockUseRecentActivityQuery = vi.mocked(useRecentActivityQuery);

function mockQuery(
  overrides: Partial<ReturnType<typeof useRecentActivityQuery>>
) {
  mockUseRecentActivityQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides
  } as unknown as ReturnType<typeof useRecentActivityQuery>);
}

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('ActivityBlock', () => {
  it('should show movements, orders and the three shortcuts for the owner', () => {
    mockQuery({
      data: {
        recentMovements: [recentMovementFactory.build()],
        recentOrders: [recentOrderFactory.build()]
      }
    });

    renderWithRouter(<ActivityBlock role="owner" />);

    expect(screen.getByText('Movimentações recentes')).toBeInTheDocument();
    expect(screen.getByText('Últimos pedidos')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /Entrada de estoque/ })
    ).toBeInTheDocument();
    expect(screen.queryByText('Suas últimas vendas')).not.toBeInTheDocument();
  });

  it('should show movements, orders and the three shortcuts for the manager', () => {
    mockQuery({
      data: {
        recentMovements: [recentMovementFactory.build()],
        recentOrders: [recentOrderFactory.build()]
      }
    });

    renderWithRouter(<ActivityBlock role="manager" />);

    expect(screen.getByText('Movimentações recentes')).toBeInTheDocument();
    expect(screen.getByText('Últimos pedidos')).toBeInTheDocument();
  });

  it('should show only own sales and "Nova venda" for sales', () => {
    mockQuery({
      data: { ownRecentSales: [ownRecentSaleFactory.build()] }
    });

    renderWithRouter(<ActivityBlock role="sales" />);

    expect(screen.getByText('Suas últimas vendas')).toBeInTheDocument();
    expect(
      screen.queryByText('Movimentações recentes')
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Últimos pedidos')).not.toBeInTheDocument();
    expect(screen.getAllByRole('link')).toHaveLength(1);
  });

  it('should show the error state and allow retry when the query fails', () => {
    mockQuery({ isError: true });

    renderWithRouter(<ActivityBlock role="owner" />);

    expect(screen.getByText('Não foi possível carregar.')).toBeInTheDocument();
  });
});
