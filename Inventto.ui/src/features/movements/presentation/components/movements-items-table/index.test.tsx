import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Movement, MovementItem } from '../../domain/entities';

import { MovementsItemsTable } from './index';

vi.mock('@/shared/components/common/simple-data-table', () => ({
  SimpleDataTable: ({ data, columns, meta }: any) => (
    <table data-testid="mock-simple-table">
      <tbody>
        {data.map((row: any, rowIndex: number) => (
          <tr key={rowIndex} data-testid="table-row">
            {columns.map((col: any, colIndex: number) => (
              <td key={colIndex}>
                {typeof col.cell === 'function'
                  ? col.cell({
                      row: { original: row },
                      table: { options: { meta } }
                    })
                  : row[col.accessorKey]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  )
}));

vi.mock('@/shared/components/common/image-card', () => ({
  ImageCard: ({ src, alt }: any) => (
    <img data-testid="mock-image" src={src} alt={alt} />
  )
}));

vi.mock('@/shared/components/ui/badge', () => ({
  Badge: ({ children, className }: any) => (
    <span data-testid="mock-badge" className={className}>
      {children}
    </span>
  )
}));

const mockParentEntry: Movement = {
  id: '1',
  organizationId: 'org-1',
  type: 'entry',
  reason: 'Test',
  createdAt: new Date('2023-01-01'),
  totalQuantity: 10,
  totalValue: 0,
  items: []
};

const mockParentWithdrawal: Movement = {
  ...mockParentEntry,
  type: 'withdrawal'
};

const mockParentAdjustment: Movement = {
  ...mockParentEntry,
  type: 'adjustment'
};

const mockItems: MovementItem[] = [
  {
    id: 'item-1',
    movementId: '1',
    productId: 'p1',
    quantity: 5,
    unitCost: 10,
    unitPrice: 20,
    product: {
      name: 'Camisa Polo',
      imageUrl: 'camisa.jpg',
      variantOptions: 'Azul / G'
    }
  },
  {
    id: 'item-2',
    movementId: '1',
    productId: 'p2',
    quantity: 2,
    unitCost: 5,
    unitPrice: 10,
    product: {
      name: 'Boné',
      imageUrl: undefined,
      variantOptions: undefined
    }
  }
];

describe('MovementsItemsTable', () => {
  it('should render the table and items correctly', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    expect(screen.getByTestId('mock-simple-table')).toBeInTheDocument();
    expect(screen.getAllByTestId('table-row')).toHaveLength(2);
    expect(screen.getByText('Camisa Polo')).toBeInTheDocument();
    expect(screen.getByText('Boné')).toBeInTheDocument();
  });

  it('should display image placeholder when image is missing', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    const images = screen.getAllByTestId('mock-image');

    expect(images[0]).toHaveAttribute('src', 'camisa.jpg');
    expect(images[1]).toHaveAttribute('src', '/placeholder.svg');
  });

  it('should display variant attributes or "item único" fallback', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    expect(screen.getByText('Azul / G')).toBeInTheDocument();
    expect(screen.getByText('Item único')).toBeInTheDocument();
  });

  it('should render entry quantities with plus sign and green color', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    const quantityCell = screen.getByText('+5');

    expect(quantityCell).toBeInTheDocument();
    expect(quantityCell).toHaveClass('text-green-600');
  });

  it('should render withdrawal quantities with minus sign and red color', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentWithdrawal} />
    );

    const quantityCell = screen.getByText('-5');

    expect(quantityCell).toBeInTheDocument();
    expect(quantityCell).toHaveClass('text-red-600');
  });

  it('should render adjustment quantities with no sign and orange color', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentAdjustment} />
    );

    const quantityCell = screen.getByText('5');

    expect(quantityCell).toBeInTheDocument();
    expect(quantityCell).toHaveClass('text-orange-600');
    expect(quantityCell).not.toHaveTextContent('+');
    expect(quantityCell).not.toHaveTextContent('-');
  });

  it('should display current stock correctly', () => {
    render(
      <MovementsItemsTable data={mockItems} parentData={mockParentEntry} />
    );

    // unitCost is shown as currency in the columns (text may be split across elements)
    expect(
      screen.getByText((content) => content.includes('10,00'))
    ).toBeInTheDocument();
    expect(
      screen.getByText((content) => content.includes('5,00'))
    ).toBeInTheDocument();
  });
});
