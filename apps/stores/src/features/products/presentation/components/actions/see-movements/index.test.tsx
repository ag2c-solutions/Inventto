import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

import { SeeProductMovementsAction } from '.';

describe('SeeProductMovementsAction', () => {
  beforeEach(() => {
    mockUseUser.mockReturnValue({ role: 'sales' });
  });

  it('should render a link to the movements history filtered by productId', () => {
    render(
      <MemoryRouter>
        <SeeProductMovementsAction productId="prod-1" />
      </MemoryRouter>
    );

    const link = screen.getByRole('link', {
      name: /histórico de movimentação/i
    });
    expect(link).toHaveAttribute('href', '/movements?productId=prod-1');
  });

  it('should render nothing while permissions are still loading', () => {
    mockUseUser.mockReturnValue({ role: undefined });

    render(
      <MemoryRouter>
        <SeeProductMovementsAction productId="prod-1" />
      </MemoryRouter>
    );

    expect(
      screen.queryByRole('link', { name: /histórico de movimentação/i })
    ).not.toBeInTheDocument();
  });
});
