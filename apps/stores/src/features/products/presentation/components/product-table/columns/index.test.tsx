import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { productWithVariantsFactory } from '../../../../tests/factories/product.factory';

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: vi.fn((publicId) => `thumb/${publicId}`)
  }
}));

vi.mock('./actions', () => ({
  ProductTableColumnActions: () => <div data-testid="column-actions" />
}));

import { columnsProductListTable } from '.';

const getColumn = (id: string) => {
  const column = columnsProductListTable.find(
    (col) =>
      col.id === id || (col as { accessorKey?: string }).accessorKey === id
  );

  if (!column) throw new Error(`Column ${id} not found`);

  return column;
};

type TestFilterFn = (
  row: unknown,
  columnId: string,
  filterValue: unknown,
  addMeta: (meta: unknown) => void
) => boolean;

const getFilterFn = (id: string) =>
  getColumn(id).filterFn as unknown as TestFilterFn;

const getCellRenderer = (id: string) =>
  getColumn(id).cell as (context: unknown) => React.ReactNode;

const buildRow = (
  product: ReturnType<typeof productWithVariantsFactory.build>
) => ({
  original: product,
  getIsExpanded: () => false,
  toggleExpanded: vi.fn()
});

describe('columnsProductListTable', () => {
  it('should filter by category using the categoryFilterFn', () => {
    const filterFn = getFilterFn('category');
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      categories: [{ id: 'cat-1', name: 'Roupas' }]
    });

    const matches = filterFn(buildRow(product), 'category', 'cat-1', vi.fn());
    const noMatch = filterFn(buildRow(product), 'category', 'cat-2', vi.fn());

    expect(matches).toBe(true);
    expect(noMatch).toBe(false);
  });

  it('should filter by status using the statusFilterFn', () => {
    const filterFn = getFilterFn('status');
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      isActive: false
    });

    const matches = filterFn(buildRow(product), 'status', 'inactive', vi.fn());

    expect(matches).toBe(true);
  });

  it('should render the expander cell only for products with variants', () => {
    const cellWithVariants = getCellRenderer('expander');
    const productWithVariants = productWithVariantsFactory.build();
    const productWithoutVariants = productWithVariantsFactory.build({
      hasVariants: false,
      variants: []
    });

    const { container: withVariants } = render(
      <>{cellWithVariants({ row: buildRow(productWithVariants) })}</>
    );
    expect(withVariants.querySelector('button')).toBeInTheDocument();

    const { container: withoutVariants } = render(
      <>{cellWithVariants({ row: buildRow(productWithoutVariants) })}</>
    );
    expect(withoutVariants.querySelector('button')).not.toBeInTheDocument();
  });

  it('should render the product cell with the product name', () => {
    const cell = getCellRenderer('product');
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      name: 'Camiseta Azul'
    });

    render(<>{cell({ row: buildRow(product) })}</>);

    expect(screen.getByText('Camiseta Azul')).toBeInTheDocument();
  });
});
