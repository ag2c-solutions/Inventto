import { MemoryRouter } from 'react-router';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResetPasswordPage } from './index';

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../hooks/use-mutations', () => ({
  useResetPasswordMutation: () => ({
    mutateAsync: vi.fn(),
    isPending: false
  })
}));

vi.mock('@/app/brand/logo', () => ({
  Logo: () => <div data-testid="mock-logo">Logo</div>
}));

import { useAuth } from '../../hooks/use-auth';

function renderPage() {
  return render(
    <MemoryRouter>
      <ResetPasswordPage />
    </MemoryRouter>
  );
}

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show the loading state while the session is being validated', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAuthenticated: false,
      isRecoverySession: false,
      isLoading: true
    });

    renderPage();

    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(screen.queryByRole('heading')).not.toBeInTheDocument();
  });

  it('should render the form when there is a recovery session (token válido)', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: '1' } } as never,
      isAuthenticated: true,
      isRecoverySession: true,
      isLoading: false
    });

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Defina sua nova senha' })
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Link expirado ou inválido')
    ).not.toBeInTheDocument();
  });

  it('should render the full error state without the form when there is no session (RN012/RN013)', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: null,
      isAuthenticated: false,
      isRecoverySession: false,
      isLoading: false
    });

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Link expirado ou inválido' })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        'Este link de redefinição não é mais válido. Solicite uma nova redefinição para continuar.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Recuperar senha de novo' })
    ).toHaveAttribute('href', '/auth/forgot-password');
    expect(
      screen.queryByRole('heading', { name: 'Defina sua nova senha' })
    ).not.toBeInTheDocument();
  });

  it('should render InvalidResetLink when authenticated but NOT a recovery session (sessão normal)', () => {
    vi.mocked(useAuth).mockReturnValue({
      session: { user: { id: '1' } } as never,
      isAuthenticated: true,
      isRecoverySession: false,
      isLoading: false
    });

    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Link expirado ou inválido' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Defina sua nova senha' })
    ).not.toBeInTheDocument();
  });
});
