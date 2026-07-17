import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { MovementsListPage } from './index';

const mockUseMovementsQuery = vi.fn();

vi.mock('../../hooks/use-queries', () => ({
  useMovementsQuery: (filters?: unknown) => mockUseMovementsQuery(filters)
}));

vi.mock('../../components/movements-table', () => ({
  MovementsListTable: ({
    data,
    isLoading,
    productId
  }: {
    data: unknown[];
    isLoading: boolean;
    productId?: string;
  }) => (
    <div data-testid="mock-movements-table">
      <span data-testid="data-length">{data.length}</span>
      <span data-testid="is-loading">{String(isLoading)}</span>
      <span data-testid="product-id">{productId ?? ''}</span>
    </div>
  )
}));

describe('MovementsListPage', () => {
  beforeEach(() => {
    mockUseMovementsQuery.mockReturnValue({ data: [], isLoading: false });
  });

  it('should render the header and pass query state to the table', () => {
    render(
      <MemoryRouter initialEntries={['/movements']}>
        <MovementsListPage />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('heading', { name: 'Movimentações' })
    ).toBeInTheDocument();
    expect(mockUseMovementsQuery).toHaveBeenCalledWith(undefined);
    expect(screen.getByTestId('product-id')).toHaveTextContent('');
  });

  it('should forward the productId query param to the query and table', () => {
    render(
      <MemoryRouter initialEntries={['/movements?productId=prod-1']}>
        <MovementsListPage />
      </MemoryRouter>
    );

    expect(mockUseMovementsQuery).toHaveBeenCalledWith({
      productId: 'prod-1'
    });
    expect(screen.getByTestId('product-id')).toHaveTextContent('prod-1');
  });
});
