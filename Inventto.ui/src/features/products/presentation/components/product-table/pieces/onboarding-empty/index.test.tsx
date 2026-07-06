import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockUseUser } = vi.hoisted(() => ({ mockUseUser: vi.fn() }));

vi.mock('@/features/users', () => ({
  useUser: () => mockUseUser()
}));

vi.mock('@/features/permissions', () => ({
  ActionButton: ({
    children,
    ...props
  }: React.ComponentProps<'button'> & { action: string }) => (
    <button {...props}>{children}</button>
  )
}));

import { ProductListOnboardingEmpty } from '.';

describe('ProductListOnboardingEmpty', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show the import CTA when there is more than one organization available', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1' },
      availableOrganizations: [{ id: 'org-1' }, { id: 'org-2' }]
    });

    render(
      <MemoryRouter>
        <ProductListOnboardingEmpty />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('link', { name: /importar produtos/i })
    ).toBeInTheDocument();
  });

  it('should hide the import CTA when there is only one organization', () => {
    mockUseUser.mockReturnValue({
      currentOrganization: { id: 'org-1' },
      availableOrganizations: [{ id: 'org-1' }]
    });

    render(
      <MemoryRouter>
        <ProductListOnboardingEmpty />
      </MemoryRouter>
    );

    expect(
      screen.queryByRole('link', { name: /importar produtos/i })
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /cadastrar produto/i })
    ).toBeInTheDocument();
  });
});
