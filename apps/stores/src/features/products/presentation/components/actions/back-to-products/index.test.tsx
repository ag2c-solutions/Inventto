import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BackToProductsLink } from '.';

describe('BackToProductsLink', () => {
  it('should render a link back to the products list', () => {
    render(
      <MemoryRouter>
        <BackToProductsLink />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /produtos/i });
    expect(link).toHaveAttribute('href', '/products');
  });
});
