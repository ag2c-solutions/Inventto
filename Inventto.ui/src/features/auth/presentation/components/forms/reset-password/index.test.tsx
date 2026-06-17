import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ResetPasswordForm } from './index';

const mockResetPassword = vi.fn();

vi.mock('../../../hooks/use-mutations', () => ({
  useResetPasswordMutation: () => ({
    mutateAsync: mockResetPassword,
    isPending: false
  })
}));

vi.mock('@/app/brand/logo', () => ({
  Logo: () => <div data-testid="mock-logo">Logo</div>
}));

function renderForm() {
  return render(
    <MemoryRouter>
      <ResetPasswordForm />
    </MemoryRouter>
  );
}

describe('ResetPasswordForm Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render title, password fields, helper, CTA and back link', () => {
    renderForm();

    expect(
      screen.getByRole('heading', { name: 'Defina sua nova senha' })
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirmar nova senha')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Mínimo de 8 caracteres, com letra maiúscula, minúscula, número e caractere especial.'
      )
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Redefinir senha' })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Voltar para o Login' })
    ).toHaveAttribute('href', '/auth/login');
  });

  it('should show inline error and not submit when password is weak (RN001)', async () => {
    renderForm();

    await user.type(screen.getByLabelText('Nova senha'), 'fraca');
    await user.type(screen.getByLabelText('Confirmar nova senha'), 'fraca');
    await user.click(screen.getByRole('button', { name: 'Redefinir senha' }));

    await waitFor(() => {
      expect(
        screen.getByText('A senha deve ter no mínimo 8 caracteres.')
      ).toBeInTheDocument();
    });
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('should show inline error and not submit when passwords do not match', async () => {
    renderForm();

    await user.type(screen.getByLabelText('Nova senha'), 'StrongPass123!');
    await user.type(
      screen.getByLabelText('Confirmar nova senha'),
      'OutraSenha123!'
    );
    await user.click(screen.getByRole('button', { name: 'Redefinir senha' }));

    await waitFor(() => {
      expect(screen.getByText('As senhas não coincidem.')).toBeInTheDocument();
    });
    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('should submit the new password when the form is valid', async () => {
    mockResetPassword.mockResolvedValue(undefined);

    renderForm();

    await user.type(screen.getByLabelText('Nova senha'), 'StrongPass123!');
    await user.type(
      screen.getByLabelText('Confirmar nova senha'),
      'StrongPass123!'
    );
    await user.click(screen.getByRole('button', { name: 'Redefinir senha' }));

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith({
        newPassword: 'StrongPass123!'
      });
    });
  });

  it('should toggle password visibility', async () => {
    renderForm();

    const passwordInput = screen.getByLabelText('Nova senha');
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(
      screen.getAllByRole('button', { name: 'Mostrar senha' })[0]
    );

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(
      screen.getAllByRole('button', { name: 'Ocultar senha' })[0]
    ).toBeInTheDocument();
  });
});
