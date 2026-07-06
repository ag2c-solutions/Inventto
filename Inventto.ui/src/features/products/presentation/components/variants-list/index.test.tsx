import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import {
  productImageFactory,
  productVariantFactory,
  variantOptionFactory
} from '../../../tests/factories/product.factory';

vi.mock('@/infra/cloudinary', () => ({
  CloudinaryService: {
    createThumbnail: vi.fn((publicId) => `thumb/${publicId}`)
  }
}));

import { ProductVariantsTable } from '.';

describe('ProductVariantsTable', () => {
  it('should render a row per variant with sku, options and stock', () => {
    const variant = productVariantFactory.build({
      sku: 'SKU-VAR-1',
      stock: 12,
      minimumStock: 5,
      options: [variantOptionFactory.build({ name: 'Tamanho', value: 'M' })]
    });

    render(<ProductVariantsTable productImages={[]} variants={[variant]} />);

    expect(screen.getByText('SKU-VAR-1')).toBeInTheDocument();
    expect(screen.getByText('Tamanho:')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('(Mín 5)')).toBeInTheDocument();
  });

  it('should apply a highlighted style to zeroed-stock rows', () => {
    const variant = productVariantFactory.build({ stock: 0, minimumStock: 5 });

    render(<ProductVariantsTable productImages={[]} variants={[variant]} />);

    expect(
      screen.getByLabelText('Status do estoque: Zerado')
    ).toBeInTheDocument();
  });

  it('should render one row for each variant provided', () => {
    const variants = productVariantFactory.buildList(3);

    render(<ProductVariantsTable productImages={[]} variants={variants} />);

    variants.forEach((variant) => {
      expect(screen.getByText(variant.sku)).toBeInTheDocument();
    });
  });

  it('should resolve variant images from the product images pool', () => {
    const image = productImageFactory.build({ id: 'img-1', isPrimary: true });
    const variant = productVariantFactory.build({
      images: [{ id: 'img-1', isPrimary: true }]
    });

    render(
      <ProductVariantsTable productImages={[image]} variants={[variant]} />
    );

    expect(screen.getByText(variant.sku)).toBeInTheDocument();
  });
});
