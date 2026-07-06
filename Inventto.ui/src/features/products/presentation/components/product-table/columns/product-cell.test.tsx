import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { productWithVariantsFactory } from '../../../../tests/factories/product.factory';

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: vi.fn((publicId) => `thumb/${publicId}`)
  }
}));

import { ProductTableColumnProduct } from './product-cell';

describe('ProductTableColumnProduct', () => {
  it('should render the product name and sku', () => {
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      name: 'Camiseta Azul',
      sku: 'SKU-1'
    });

    render(<ProductTableColumnProduct product={product} />);

    expect(screen.getByText('Camiseta Azul')).toBeInTheDocument();
    expect(screen.getByText('SKU-1')).toBeInTheDocument();
  });

  it('should show the variants count when the product has variants', () => {
    const product = productWithVariantsFactory.build();

    render(<ProductTableColumnProduct product={product} />);

    expect(
      screen.getByText(`${product.variants.length} variações`)
    ).toBeInTheDocument();
  });

  it('should not show a variants count for a simple product', () => {
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: []
    });

    render(<ProductTableColumnProduct product={product} />);

    expect(screen.queryByText(/variaç/)).not.toBeInTheDocument();
  });
});
