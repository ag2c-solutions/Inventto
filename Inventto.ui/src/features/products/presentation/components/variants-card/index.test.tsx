import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { productVariantFactory } from '../../../tests/factories/product.factory';

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: vi.fn((publicId) => `thumb/${publicId}`)
  }
}));

import { ProductVariantsCard } from '.';

describe('ProductVariantsCard', () => {
  it('should render the consolidated total stock and the variants count', () => {
    const variants = [
      productVariantFactory.build({ stock: 10, isActive: true }),
      productVariantFactory.build({ stock: 5, isActive: true })
    ];

    render(<ProductVariantsCard variants={variants} productImages={[]} />);

    expect(screen.getByText(/2 variantes/)).toBeInTheDocument();
    expect(screen.getByText(/15 un\. em estoque/)).toBeInTheDocument();
  });

  it('should use singular wording for a single variant', () => {
    const variants = [productVariantFactory.build({ stock: 10 })];

    render(<ProductVariantsCard variants={variants} productImages={[]} />);

    expect(screen.getByText(/1 variante ·/)).toBeInTheDocument();
  });

  it('should render the variants table rows', () => {
    const variant = productVariantFactory.build({ sku: 'SKU-CARD-1' });

    render(<ProductVariantsCard variants={[variant]} productImages={[]} />);

    expect(screen.getByText('SKU-CARD-1')).toBeInTheDocument();
  });
});
