import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { pdvProductFactory } from '../../../tests/factories/pdv-product.factory';

import { ProductGrid, ProductGridSkeleton } from './index';

describe('ProductGrid', () => {
  it('should render one card per product', () => {
    const products = pdvProductFactory.buildList(3);

    render(<ProductGrid products={products} onAddProduct={vi.fn()} />);

    products.forEach((product) => {
      expect(screen.getByText(product.name)).toBeInTheDocument();
    });
  });

  it('should reflow columns using auto-fill minmax', () => {
    const { container } = render(
      <ProductGrid
        products={pdvProductFactory.buildList(1)}
        onAddProduct={vi.fn()}
      />
    );

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(240px,1fr))]');
  });
});

describe('ProductGridSkeleton', () => {
  it('should render 10 skeleton cards reflowing with auto-fill minmax', () => {
    const { container } = render(<ProductGridSkeleton />);

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid-cols-[repeat(auto-fill,minmax(280px,1fr))]');
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
  });
});
