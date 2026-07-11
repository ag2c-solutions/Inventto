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

  it('should reflow columns by breakpoint (1-2 on mobile, up to 5 on desktop)', () => {
    const { container } = render(
      <ProductGrid
        products={pdvProductFactory.buildList(1)}
        onAddProduct={vi.fn()}
      />
    );

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('sm:grid-cols-3');
    expect(grid).toHaveClass('md:grid-cols-4');
    expect(grid).toHaveClass('lg:grid-cols-5');
  });
});

describe('ProductGridSkeleton', () => {
  it('should render 10 skeleton cards reflowing with the same column breakpoints', () => {
    const { container } = render(<ProductGridSkeleton />);

    const grid = container.firstElementChild;
    expect(grid).toHaveClass('grid-cols-2');
    expect(grid).toHaveClass('sm:grid-cols-3');
    expect(
      container.querySelectorAll('[data-slot="skeleton"]').length
    ).toBeGreaterThan(0);
  });
});
