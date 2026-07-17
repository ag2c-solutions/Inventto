import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { productVariantFactory } from '../../../tests/factories/product.factory';

import { ProductGradeSummary } from '.';

describe('ProductGradeSummary', () => {
  it('should render the stacked layout by default showing the physical total', () => {
    const variants = [
      productVariantFactory.build({ stock: 30, minimumStock: 5 }),
      productVariantFactory.build({ stock: 0, minimumStock: 5 })
    ];

    render(<ProductGradeSummary variants={variants} />);

    expect(screen.getByText('Resumo da grade')).toBeInTheDocument();
    expect(screen.getByText(/Total físico: 30 un\./)).toBeInTheDocument();
  });

  it('should render the inline layout with the active variants count', () => {
    const variants = [
      productVariantFactory.build({
        stock: 30,
        minimumStock: 5,
        isActive: true
      }),
      productVariantFactory.build({
        stock: 0,
        minimumStock: 5,
        isActive: false
      })
    ];

    render(<ProductGradeSummary variants={variants} layout="inline" />);

    expect(screen.getByText(/30 un\./)).toBeInTheDocument();
    expect(screen.getByText(/1 item único/)).toBeInTheDocument();
  });

  it('should only render statuses that are present in the summary', () => {
    const variants = [
      productVariantFactory.build({ stock: 30, minimumStock: 5 })
    ];

    render(<ProductGradeSummary variants={variants} />);

    expect(screen.queryByText('Crítico')).not.toBeInTheDocument();
  });
});
