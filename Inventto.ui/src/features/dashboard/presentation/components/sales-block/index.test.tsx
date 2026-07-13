import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { salesSummaryFactory } from '../../../tests/factories/sales-summary.factory';
import { useSalesSummaryQuery } from '../../hooks/use-queries';

import { SalesBlock } from '.';

vi.mock('../../hooks/use-queries');

vi.mock('../sales-chart', () => ({
  SalesChart: () => <div data-testid="sales-chart" />
}));

const mockUseSalesSummaryQuery = vi.mocked(useSalesSummaryQuery);

function mockQuery(
  overrides: Partial<ReturnType<typeof useSalesSummaryQuery>>
) {
  mockUseSalesSummaryQuery.mockReturnValue({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    ...overrides
  } as unknown as ReturnType<typeof useSalesSummaryQuery>);
}

describe('SalesBlock', () => {
  it('should show the period selector, chart and revenue for the owner', () => {
    const summary = salesSummaryFactory.build({
      revenueTotal: 1198.2,
      salesCount: 5
    });
    mockQuery({ data: summary });

    render(<SalesBlock role="owner" />);

    expect(screen.getByTestId('sales-chart')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: '30 dias' })).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*1\.198,20/)).toBeInTheDocument();
  });

  it('should show the chart for the manager without owner extras', () => {
    const summary = salesSummaryFactory.build({
      inventoryAtCost: 500,
      avgMargin: 0.5
    });
    mockQuery({ data: summary });

    render(<SalesBlock role="manager" />);

    expect(screen.getByTestId('sales-chart')).toBeInTheDocument();
    expect(screen.queryByText('Inventário a custo')).not.toBeInTheDocument();
  });

  it('should show the simple counter without a chart or period selector for sales', () => {
    mockQuery({
      data: { ownSalesToday: { count: 3, total: 318.8 } }
    });

    render(<SalesBlock role="sales" />);

    expect(screen.queryByTestId('sales-chart')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText(/R\$\s*318,80/)).toBeInTheDocument();
  });

  it('should show the error state and allow retry when the query fails', () => {
    mockQuery({ isError: true });

    render(<SalesBlock role="owner" />);

    expect(screen.getByText('Não foi possível carregar.')).toBeInTheDocument();
  });
});
