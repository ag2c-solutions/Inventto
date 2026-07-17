import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../../components/product-table', () => ({
  ProductListTable: () => <div data-testid="product-table" />
}));

import { ProductsListPage } from '.';

describe('ProductsListPage', () => {
  it('should render the page heading and the products table', () => {
    render(<ProductsListPage />);

    expect(screen.getByText('Produtos')).toBeInTheDocument();
    expect(screen.getByTestId('product-table')).toBeInTheDocument();
  });
});
