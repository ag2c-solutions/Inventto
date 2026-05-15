import { MemoryRouter, Route, Routes } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
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
  AvatarChangeForm: ({
    onSuccess,
    onCancel
  }: {
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="avatar-form-mock">
      Avatar Form
      <button onClick={onSuccess}>Trigger Success</button>
      <button onClick={onCancel}>Trigger Cancel</button>
    </div>
  ),
  ChangePasswordForm: ({
    onSuccess,
    onCancel
  }: {
    onSuccess: () => void;
    onCancel: () => void;
  }) => (
    <div data-testid="password-form-mock">
      Password Form
      <button onClick={onSuccess}>Trigger Success</button>
      <button onClick={onCancel}>Trigger Cancel</button>
    </div>
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

  it('should render default organization name when user has no organization', async () => {
    mocks.useUser.mockReturnValue({
      user: defaultUser,
      currentOrganization: null,
      isLoading: false
    });

    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Minha Empresa')).toBeInTheDocument();
  });

  it('should display user information in the dropdown header', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    expect(await screen.findByText('Admin Teste')).toBeInTheDocument();
    expect(await screen.findByText('Empresa Teste Ltda')).toBeInTheDocument();
  });

  it('should open Avatar Dialog when clicking "Alterar Avatar"', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    await user.click(await screen.findByText('Alterar Avatar'));

    expect(await screen.findByTestId('avatar-form-mock')).toBeInTheDocument();
  });

  it('should open Password Dialog when clicking "Alterar Senha"', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    await user.click(await screen.findByText('Alterar Senha'));

    expect(await screen.findByTestId('password-form-mock')).toBeInTheDocument();
  });

  it('should close Avatar Dialog on success callback', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Alterar Avatar'));
    await user.click(screen.getByText('Trigger Success'));

    await waitFor(() => {
      expect(screen.queryByTestId('avatar-form-mock')).not.toBeInTheDocument();
    });
  });

  it('should close Avatar Dialog on cancel callback', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Alterar Avatar'));
    await user.click(screen.getByText('Trigger Cancel'));

    await waitFor(() => {
      expect(screen.queryByTestId('avatar-form-mock')).not.toBeInTheDocument();
    });
  });

  it('should close Password Dialog on success callback', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Alterar Senha'));
    await user.click(screen.getByText('Trigger Success'));

    await waitFor(() => {
      expect(
        screen.queryByTestId('password-form-mock')
      ).not.toBeInTheDocument();
    });
  });

  it('should close Password Dialog on cancel callback', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Alterar Senha'));
    await user.click(screen.getByText('Trigger Cancel'));

    await waitFor(() => {
      expect(
        screen.queryByTestId('password-form-mock')
      ).not.toBeInTheDocument();
    });
  });

  it('should close dialog when pressing Escape', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Alterar Avatar'));
    expect(await screen.findByTestId('avatar-form-mock')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    await waitFor(() => {
      expect(screen.queryByTestId('avatar-form-mock')).not.toBeInTheDocument();
    });
  });

  it('should perform logout and redirect to Login Page', async () => {
    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));

    await user.click(await screen.findByText('Sair do sistema'));

    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(await screen.findByTestId('login-page-mock')).toBeInTheDocument();
  });

  it('should handle logout error gracefully', async () => {
    mocks.signOut.mockRejectedValue(new Error('Logout failed'));

    const { user } = renderComponent();

    await user.click(screen.getByRole('button'));
    await user.click(await screen.findByText('Sair do sistema'));

    expect(mocks.signOut).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('login-page-mock')).not.toBeInTheDocument();
  });
});
