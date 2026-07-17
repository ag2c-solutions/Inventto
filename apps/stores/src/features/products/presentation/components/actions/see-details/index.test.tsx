import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { SeeProductDetailsAction } from '.';

describe('SeeProductDetailsAction', () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({ role: 'sales' });
  });

  it('should render a link to the product details page', () => {
    render(
      <MemoryRouter>
        <SeeProductDetailsAction productId="prod-1" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /detalhes/i });
    expect(link).toHaveAttribute('href', '/products/prod-1');
  });

  it('should render nothing while permissions are still loading', () => {
    mockUseUser.mockReturnValue({ role: undefined });

    render(
      <MemoryRouter>
        <SeeProductDetailsAction productId="prod-1" />
      </MemoryRouter>
    );

    expect(
      screen.queryByRole('link', { name: /detalhes/i })
    ).not.toBeInTheDocument();
  });
});
