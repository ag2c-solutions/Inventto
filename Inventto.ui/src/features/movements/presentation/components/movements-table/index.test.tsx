import { BrowserRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Movement } from '../../../domain/entities';

import { MovementsListTable } from './index';

vi.mock('@/shared/components/common/data-table', () => ({
  DataTable: ({
    tableOptions,
    renderSubRow,
    children
  }: {
    tableOptions: { data?: unknown[] };
    renderSubRow?: (
      row: { original: unknown },
      index: number
    ) => React.ReactNode;
    children?: React.ReactNode;
  }) => (
    <div data-testid="mock-datatable">
      <span data-testid="datatable-row-count">
        {tableOptions.data?.length ?? 0}
      </span>

      {!!tableOptions.data?.[0] && !!renderSubRow && (
        <div data-testid="mock-sub-row-container">
          {renderSubRow({ original: tableOptions.data[0] }, 0)}
        </div>
      )}

      {children}
    </div>
  ),
  DataTableTextFilter: ({ placeholder }: { placeholder?: string }) => (
    <div data-testid="mock-text-filter">{placeholder}</div>
  ),
  DataTableSelectFilter: ({
    options,
    placeholder
  }: {
    options: unknown[];
    placeholder?: string;
  }) => (
    <div data-testid="mock-select-filter">
      {placeholder}: {options.length} options
    </div>
  ),
  DataTableDateRangeFilter: () => <div data-testid="mock-date-filter" />,
  DataTableContent: () => <div data-testid="mock-table-content" />,
  PaginationControllers: () => <div data-testid="mock-pagination" />
}));

vi.mock('@/features/permissions', () => ({
  ActionButton: ({ children }: { children?: React.ReactNode }) => (
    <>{children}</>
  ),
  VisibleTo: ({ children }: { children?: React.ReactNode }) => <>{children}</>
}));

vi.mock('./columns', () => ({
  columnsMovementsListTable: []
}));

vi.mock('../details', () => ({
  MovementDetails: ({ movement }: { movement: Movement }) => (
    <div data-testid="mock-items-table">
      Items Count: {movement.items?.length || 0}
    </div>
  )
}));

const mockMovements: Movement[] = [
  {
    id: '1',
    organizationId: 'org-1',
    type: 'entry',
    reason: 'Compra',
    createdAt: new Date('2023-10-01T10:00:00Z'),
    totalQuantity: 100,
    totalValue: 500,
    items: [
      {
        id: 'item-1',
        movementId: '1',
        productId: 'p1',
        quantity: 5,
        unitCost: 10,
        unitPrice: 20,
        product: {
          name: 'Produto 1',
          imageUrl: undefined,
          variantOptions: undefined
        }
      }
    ]
  },
  {
    id: '2',
    organizationId: 'org-1',
    type: 'withdrawal',
    reason: 'Venda',
    createdAt: new Date('2023-10-02T14:30:00Z'),
    totalQuantity: 5,
    totalValue: 100,
    items: []
  }
];

describe('MovementsListTable', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  it('should pass data correctly to DataTable', () => {
    render(<MovementsListTable data={mockMovements} />, { wrapper });

    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expect(screen.getByTestId('datatable-row-count')).toHaveTextContent('2');
  });

  it('should render empty state correctly when data is empty', () => {
    render(<MovementsListTable data={[]} />, { wrapper });

    expect(screen.getByTestId('datatable-row-count')).toHaveTextContent('0');
  });

  it('should handle undefined data gracefully', () => {
    render(<MovementsListTable data={undefined as unknown as Movement[]} />, {
      wrapper
    });

    expect(screen.getByTestId('datatable-row-count')).toHaveTextContent('0');
  });

  it('should render sub-row content (MovementsItemsTable)', () => {
    render(<MovementsListTable data={mockMovements} />, { wrapper });

    const subRowContainer = screen.getByTestId('mock-sub-row-container');

    expect(subRowContainer).toBeInTheDocument();
    expect(screen.getByTestId('mock-items-table')).toHaveTextContent(
      'Items Count: 1'
    );
  });

  it('should render all filters and controllers', () => {
    render(<MovementsListTable data={mockMovements} />, { wrapper });

    expect(screen.getByTestId('mock-text-filter')).toHaveTextContent(
      'Buscar por motivo, doc ou responsável...'
    );
    expect(screen.getByTestId('mock-select-filter')).toHaveTextContent(
      'Tipo: 4 options'
    );
    expect(screen.getByTestId('mock-date-filter')).toBeInTheDocument();
    expect(screen.getByTestId('mock-table-content')).toBeInTheDocument();
    expect(screen.getByTestId('mock-pagination')).toBeInTheDocument();
  });
});
