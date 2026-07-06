import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { variantOptionFactory } from '../../../tests/factories/product.factory';

import { VariantOptionBadge } from '.';

describe('VariantOptionBadge', () => {
  it('should render a ColorBadge when the option value is a hex color', () => {
    const option = variantOptionFactory.build({
      name: 'Cor',
      value: '#FF0000'
    });

    render(<VariantOptionBadge option={option} />);

    expect(screen.getByText('#FF0000')).toBeInTheDocument();
  });

  it('should render a text badge with name and value when it is not a color', () => {
    const option = variantOptionFactory.build({ name: 'Tamanho', value: 'M' });

    render(<VariantOptionBadge option={option} />);

    expect(screen.getByText('Tamanho:')).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
  });
});
