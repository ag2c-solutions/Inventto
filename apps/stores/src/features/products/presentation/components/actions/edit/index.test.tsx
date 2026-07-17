import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { EditProductAction } from '.';

describe('EditProductAction', () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({ role: 'owner' });
  });

  it('should render a link to the product edit page when the user has permission', () => {
    render(
      <MemoryRouter>
        <EditProductAction productId="prod-1" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', { name: /editar/i });
    expect(link).toHaveAttribute('href', '/products/prod-1/edit');
  });

  it('should render nothing when the user has no permission', () => {
    mockUseUser.mockReturnValue({ role: 'sales' });

    render(
      <MemoryRouter>
        <EditProductAction productId="prod-1" />
      </MemoryRouter>
    );

    expect(
      screen.queryByRole('link', { name: /editar/i })
    ).not.toBeInTheDocument();
  });
});
