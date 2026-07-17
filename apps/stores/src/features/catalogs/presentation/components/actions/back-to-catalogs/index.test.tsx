import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BackToCatalogsLink } from '.';

describe('BackToCatalogsLink', () => {
  it('should render a link back to the products list', () => {
    render(
      <MemoryRouter>
        <BackToCatalogsLink />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /catálogos/i });
    expect(link).toHaveAttribute('href', '/catalogos');
  });
});
