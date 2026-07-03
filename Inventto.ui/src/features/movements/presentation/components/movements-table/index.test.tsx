import { BrowserRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Movement } from '../../../domain/entities';

import { MovementsListTable } from './index';

const mockUseUser = vi.fn();

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

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
  DataTableDateRangeFilter: () => <div data-testid="mock-date-filter" />,
  DataTableContent: () => <div data-testid="mock-table-content" />,
  PaginationControllers: () => <div data-testid="mock-pagination" />
}));

vi.mock('./columns', () => ({
  columnsMovementsListTable: []
}));

vi.mock('./type-tabs', () => ({
  MovementsTypeTabs: () => <div data-testid="mock-type-tabs" />
}));

vi.mock(
  '@/shared/components/common/data-table/pieces/data-table-tabs-filter',
  () => ({
    DataTableTabFilter: () => <div data-testid="mock-tabs-filter" />
  })
);

vi.mock('./loading', () => ({
  MovementsListTableLoading: () => <div data-testid="mock-loading" />
}));

vi.mock('./onboarding-empty', () => ({
  MovementsOnboardingEmpty: () => <div data-testid="mock-onboarding-empty" />
}));

vi.mock('../add-moviment', () => ({
  AddNewMovements: () => {
    const { role } = mockUseUser();
    if (role === 'sales') return null;
    return <button type="button">Registrar</button>;
  }
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
    executedAt: new Date('2023-10-01T10:00:00Z'),
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
          sku: 'SKU-1',
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
    executedAt: new Date('2023-10-02T14:30:00Z'),
    totalQuantity: 5,
    totalValue: 100,
    items: []
  }
];

describe('MovementsListTable', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>{children}</BrowserRouter>
  );

  beforeEach(() => {
    mockUseUser.mockReturnValue({ role: 'owner' });
  });

  it('should render the loading skeleton when isLoading is true', () => {
    render(<MovementsListTable data={[]} isLoading />, { wrapper });

    expect(screen.getByTestId('mock-loading')).toBeInTheDocument();
  });

  it('should render the firstrun onboarding empty state when there is no data', () => {
    render(<MovementsListTable data={[]} isLoading={false} />, { wrapper });

    const onboarding = screen.getByTestId('mock-onboarding-empty');
    expect(onboarding).toBeInTheDocument();
  });

  it('should render an inline empty message when pre-filtered by product with no results', () => {
    render(<MovementsListTable data={[]} isLoading={false} productId="p1" />, {
      wrapper
    });

    expect(
      screen.queryByTestId('mock-onboarding-empty')
    ).not.toBeInTheDocument();
    expect(
      screen.getByText('Nenhuma movimentação encontrada para este produto.')
    ).toBeInTheDocument();
  });

  it('should pass data correctly to DataTable', () => {
    render(<MovementsListTable data={mockMovements} isLoading={false} />, {
      wrapper
    });

    expect(screen.getByTestId('mock-datatable')).toBeInTheDocument();
    expect(screen.getByTestId('datatable-row-count')).toHaveTextContent('2');
  });

  it('should render sub-row content (MovementDetails)', () => {
    render(<MovementsListTable data={mockMovements} isLoading={false} />, {
      wrapper
    });

    expect(screen.getByTestId('mock-items-table')).toHaveTextContent(
      'Items Count: 1'
    );
  });

  it('should render exactly the 3 filters (type tabs, text and date range) plus the CTA for manager/owner', () => {
    render(<MovementsListTable data={mockMovements} isLoading={false} />, {
      wrapper
    });

    expect(screen.getByTestId('mock-tabs-filter')).toBeInTheDocument();
    expect(screen.getByTestId('mock-text-filter')).toHaveTextContent(
      'Buscar por produto ou SKU'
    );
    expect(screen.getByTestId('mock-date-filter')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /registrar/i })
    ).toBeInTheDocument();
  });

  it('should hide the register CTA for sales role', () => {
    mockUseUser.mockReturnValue({ role: 'sales' });

    render(<MovementsListTable data={mockMovements} isLoading={false} />, {
      wrapper
    });

    expect(
      screen.queryByRole('button', { name: /registrar/i })
    ).not.toBeInTheDocument();
  });

  it('should render the active product filter chip with the resolved product name', () => {
    render(
      <MovementsListTable
        data={mockMovements}
        isLoading={false}
        productId="p1"
      />,
      { wrapper }
    );

    expect(screen.getByText('Filtrando por produto:')).toBeInTheDocument();
    expect(screen.getByText('Produto 1')).toBeInTheDocument();
  });

  it('should render the movements count with product-scoped label when pre-filtered', () => {
    render(
      <MovementsListTable
        data={mockMovements}
        isLoading={false}
        productId="p1"
      />,
      { wrapper }
    );

    expect(screen.getByText('movimentações deste produto')).toBeInTheDocument();
  });
});
