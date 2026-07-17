import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import type { IProductVariant } from '../../../../domain/entities';

import { ProductTableColumnStock } from './stock';

const makeVariant = (
  overrides: Partial<IProductVariant> & { stock: number; minimumStock: number }
): IProductVariant => ({
  id: `v-${overrides.sku ?? overrides.stock}`,
  sku: 'SKU',
  isActive: true,
  images: [],
  options: [{ name: 'Cor', value: 'Branco' }],
  ...overrides
});

describe('ProductTableColumnStock', () => {
  it('produto simples: exibe badge de saudável com quantidade 1', () => {
    const { container } = render(
      <ProductTableColumnStock totalStock={42} minimumStock={5} variants={[]} />
    );

    expect(container.querySelector('.lucide-square-check')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('produto simples: saldo 0 deriva o estado Zerado e exibe badge correspondente', () => {
    const { container } = render(
      <ProductTableColumnStock totalStock={0} minimumStock={5} variants={[]} />
    );

    expect(container.querySelector('.lucide-ban')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('grade: exibe badges sumarizando as quantidades de variantes por status', () => {
    const { container } = render(
      <ProductTableColumnStock
        totalStock={30}
        variants={[
          makeVariant({ stock: 30, minimumStock: 5 }), // healthy
          makeVariant({ stock: 0, minimumStock: 6 }), // zeroed
          makeVariant({ stock: 0, minimumStock: 6 }) // another zeroed
        ]}
      />
    );

    expect(container.querySelector('.lucide-square-check')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument(); // 1 variante saudavel

    expect(container.querySelector('.lucide-ban')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument(); // 2 variantes zeradas
  });
});
