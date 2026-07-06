import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import {
  productImageFactory,
  productVariantFactory,
  productWithVariantsFactory
} from '../../../../../../../tests/factories/product.factory';

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: vi.fn((publicId) => `thumb/${publicId}`)
  }
}));

vi.mock('../../../../columns/actions', () => ({
  ProductTableColumnActions: () => <div data-testid="column-actions" />
}));

import { ProductCard } from '.';

describe('ProductCard', () => {
  it('should render name, sku and categories', () => {
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      name: 'Camiseta Azul',
      sku: 'SKU-1',
      categories: [{ id: 'cat-1', name: 'Roupas' }]
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText('Camiseta Azul')).toBeInTheDocument();
    expect(screen.getByText('SKU-1')).toBeInTheDocument();
    expect(screen.getByText('Roupas')).toBeInTheDocument();
  });

  it('should render the simple footer with stock for a product without variants', () => {
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      isActive: true,
      stock: 15,
      minimumStock: 5
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText('15 un')).toBeInTheDocument();
  });

  it('should show "Inativo" in the footer when the product is inactive', () => {
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      isActive: false
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('should render the variants footer and expand/collapse variant rows on click', async () => {
    const user = userEvent.setup();
    const variant = productVariantFactory.build({
      sku: 'VAR-SKU-1',
      stock: 3,
      minimumStock: 5,
      isActive: true
    });
    const product = productWithVariantsFactory.build({
      variants: [variant]
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText('1 variações')).toBeInTheDocument();
    expect(screen.queryByText('VAR-SKU-1')).not.toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /expandir variações/i })
    );

    expect(screen.getByText('VAR-SKU-1')).toBeInTheDocument();

    await user.click(
      screen.getByRole('button', { name: /recolher variações/i })
    );

    expect(screen.queryByText('VAR-SKU-1')).not.toBeInTheDocument();
  });

  it('should render a fallback avatar when there is no primary image', () => {
    const product = productWithVariantsFactory.build({
      hasVariants: false,
      variants: [],
      allImages: [productImageFactory.build({ isPrimary: false })]
    });

    render(<ProductCard product={product} />);

    expect(screen.getByText('IMG')).toBeInTheDocument();
  });
});
