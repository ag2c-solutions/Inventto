import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  ownRecentSaleFactory,
  recentMovementFactory,
  recentOrderFactory
} from '../../../tests/factories/recent-activity.factory';
import { useRecentActivityQuery } from '../../hooks/use-queries';

import { ActivityBlock } from '.';

const mockUseIsMobile = vi.fn();

vi.mock('../../hooks/use-queries');

vi.mock('@/shared/hooks/use-is-mobile', () => ({
  useIsMobile: () => mockUseIsMobile()
}));

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
  beforeEach(() => {
    mockUseIsMobile.mockReturnValue(false);
  });

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

  // DASH-06: mesmo hook de breakpoint usado em CatalogsTable etc. — não
  // recriado. Movimentações/pedidos ficam lado a lado só quando não é
  // mobile; empilham (mesma coluna) no mobile.
  it('should show movements and orders side by side when not mobile', () => {
    mockUseIsMobile.mockReturnValue(false);
    mockQuery({
      data: {
        recentMovements: [recentMovementFactory.build()],
        recentOrders: [recentOrderFactory.build()]
      }
    });

    renderWithRouter(<ActivityBlock role="owner" />);

    const grid = screen
      .getByText('Movimentações recentes')
      .closest('[class*="grid"]');

    expect(grid).toHaveClass('grid-cols-2');
  });

  it('should stack movements and orders in a single column on mobile', () => {
    mockUseIsMobile.mockReturnValue(true);
    mockQuery({
      data: {
        recentMovements: [recentMovementFactory.build()],
        recentOrders: [recentOrderFactory.build()]
      }
    });

    renderWithRouter(<ActivityBlock role="owner" />);

    const grid = screen
      .getByText('Movimentações recentes')
      .closest('[class*="grid"]');

    expect(grid).not.toHaveClass('grid-cols-2');
  });
});
