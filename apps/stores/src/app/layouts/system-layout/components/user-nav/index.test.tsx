import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserNav } from './index';

const mocks = vi.hoisted(() => ({
  signOut: vi.fn(),
  useUser: vi.fn()
}));

vi.mock('@/features/auth', () => ({
  useSignOutMutation: () => ({
    mutateAsync: mocks.signOut
  })
}));

vi.mock('@/features/users', () => ({
  useUser: mocks.useUser,
  getUserNameInitials: (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase(),
  AvatarChange: () => <div data-testid="avatar-change-mock">Avatar Change</div>,
  PasswordChange: () => (
    <div data-testid="password-change-mock">Password Change</div>
  )
}));

window.PointerEvent = MouseEvent as typeof PointerEvent;
window.HTMLElement.prototype.scrollIntoView = vi.fn();
window.HTMLElement.prototype.hasPointerCapture = vi.fn();
window.HTMLElement.prototype.releasePointerCapture = vi.fn();

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } }
});

describe('UserNav Component (Integration)', () => {
  const defaultUser = {
    fullName: 'Admin Teste',
    email: 'admin@teste.com',
    avatarUrl: 'https://github.com/shadcn.png'
  };

  const defaultOrganization = {
    name: 'Empresa Teste Ltda'
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useUser.mockReturnValue({
      user: defaultUser,
      currentOrganization: defaultOrganization,
      isLoading: false
    });
    mocks.signOut.mockResolvedValue({});
  });

  const renderComponent = () => {
    return {
      user: userEvent.setup(),
      ...render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter initialEntries={['/']}>
            <Routes>
              <Route path="/" element={<UserNav />} />
              <Route
                path="/auth/login"
                element={
                  <div data-testid="login-page-mock">Página de Login</div>
                }
              />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      )
    };
  };

  it('should render default organization name when user has no organization', () => {
    mocks.useUser.mockReturnValue({
      user: defaultUser,
      currentOrganization: null,
      isLoading: false
    });

    renderComponent();

    expect(screen.getByText('Minha Empresa')).toBeInTheDocument();
  });

  it('should display user name and active organization in the trigger', () => {
    renderComponent();

    expect(screen.getByText('Admin Teste')).toBeInTheDocument();
    expect(screen.getByText('Empresa Teste Ltda')).toBeInTheDocument();
  });

  it('should display user name and email in the dropdown header', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('admin@teste.com')).toBeInTheDocument();
    expect(screen.getAllByText('Admin Teste').length).toBeGreaterThan(0);
  });

  it('should render AvatarChange in dropdown', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    expect(await screen.findByTestId('avatar-change-mock')).toBeInTheDocument();
  });

  it('should render PasswordChange in dropdown', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    expect(
      await screen.findByTestId('password-change-mock')
    ).toBeInTheDocument();
  });

  it('should perform logout and redirect to Login Page', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    await user.click(await screen.findByText('Sair do sistema'));

    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('login-page-mock')).toBeInTheDocument();
  });
});
