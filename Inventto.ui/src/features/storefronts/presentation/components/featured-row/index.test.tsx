import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { FeaturedProduct } from '../../../domain/entities';

import { FeaturedRow } from './index';

const product: FeaturedProduct = {
  productId: 'p1',
  name: 'Vestido Linho Areia',
  sku: 'VL-AREIA-01',
  imageUrl: 'https://cdn.test/p1.png',
  isFeatured: false
};

describe('FeaturedRow', () => {
  const user = userEvent.setup();

  it('should show the product name and SKU', () => {
    render(<FeaturedRow product={product} onToggle={vi.fn()} />);

    expect(screen.getByText('Vestido Linho Areia')).toBeInTheDocument();
    expect(screen.getByText('VL-AREIA-01')).toBeInTheDocument();
  });

  it('should show StarOff and "Destacar" affordance when not featured', () => {
    render(<FeaturedRow product={product} onToggle={vi.fn()} />);

    expect(
      screen.getByRole('button', { name: 'Destacar Vestido Linho Areia' })
    ).toHaveAttribute('aria-pressed', 'false');
  });

  it('should show Star (filled) and "Remover destaque" affordance when featured', () => {
    render(
      <FeaturedRow
        product={{ ...product, isFeatured: true }}
        onToggle={vi.fn()}
      />
    );

    expect(
      screen.getByRole('button', {
        name: 'Remover destaque de Vestido Linho Areia'
      })
    ).toHaveAttribute('aria-pressed', 'true');
  });

  it('should call onToggle with the product when clicked', async () => {
    const onToggle = vi.fn();
    render(<FeaturedRow product={product} onToggle={onToggle} />);

    await user.click(
      screen.getByRole('button', { name: 'Destacar Vestido Linho Areia' })
    );

    expect(onToggle).toHaveBeenCalledWith(product);
  });

  it('should disable the toggle when disabled', () => {
    render(<FeaturedRow product={product} onToggle={vi.fn()} disabled />);

    expect(
      screen.getByRole('button', { name: 'Destacar Vestido Linho Areia' })
    ).toBeDisabled();
  });
});
