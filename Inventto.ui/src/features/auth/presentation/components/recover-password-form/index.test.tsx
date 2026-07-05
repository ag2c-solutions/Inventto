import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RecoverPasswordForm } from './index';

const mockNavigate = vi.fn();
const mockRecoverPassword = vi.fn();
const mockVerifyRecoveryOtp = vi.fn();
const mockSetNewPassword = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/use-mutations', () => ({
  useRecoverPasswordMutation: () => ({ mutateAsync: mockRecoverPassword }),
  useVerifyRecoveryOtpMutation: () => ({
    mutateAsync: mockVerifyRecoveryOtp,
    isPending: false,
    error: null,
    reset: vi.fn()
  }),
  useSetNewPasswordMutation: () => ({ mutateAsync: mockSetNewPassword })
}));

vi.mock('@/shared/components/ui/input-otp', () => ({
  InputOTP: ({
    onChange,
    value,
    disabled,
    maxLength
  }: {
    onChange?: (val: string) => void;
    value?: string;
    disabled?: boolean;
    maxLength?: number;
  }) => (
    <input
      role="textbox"
      aria-label="Código de verificação de 6 dígitos"
      value={value ?? ''}
      maxLength={maxLength}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      data-testid="otp-input"
      readOnly={onChange === undefined}
    />
  ),
  InputOTPGroup: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  InputOTPSlot: () => null
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <RecoverPasswordForm />
    </MemoryRouter>
  );
}

describe('RecoverPasswordForm', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    mockRecoverPassword.mockResolvedValue(undefined);
    mockVerifyRecoveryOtp.mockResolvedValue({});
    mockSetNewPassword.mockResolvedValue(undefined);
  });

  async function advanceToOtpStep() {
    renderPage();

    await user.type(
      screen.getByLabelText('E-mail cadastrado'),
      'usuario@empresa.com'
    );
    await user.click(screen.getByRole('button', { name: 'Enviar código' }));

    await waitFor(() => {
      expect(screen.getByText('Digite o código')).toBeInTheDocument();
    });
  }

  async function advanceToPasswordStep() {
    await advanceToOtpStep();

    await user.type(screen.getByTestId('otp-input'), '123456');
    await user.click(screen.getByRole('button', { name: 'Confirmar código' }));

    await waitFor(() => {
      expect(screen.getByText('Defina sua nova senha')).toBeInTheDocument();
    });
  }

  describe('Passo 1 — e-mail', () => {
    it('deve renderizar o formulário de e-mail', () => {
      renderPage();

      expect(screen.getByText('Recuperar senha')).toBeInTheDocument();
      expect(screen.getByLabelText('E-mail cadastrado')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Enviar código' })
      ).toBeInTheDocument();
    });

    it('deve avançar para o passo de OTP ao enviar um e-mail válido', async () => {
      await advanceToOtpStep();

      expect(mockRecoverPassword).toHaveBeenCalledWith({
        email: 'usuario@empresa.com'
      });
      expect(screen.getByText(/u•••@empresa\.com/)).toBeInTheDocument();
    });

    it('deve avançar para o OTP mesmo quando o envio falha (RN002 anti-enumeração)', async () => {
      mockRecoverPassword.mockRejectedValue(new Error('rate limit'));

      await advanceToOtpStep();

      expect(screen.getByText('Digite o código')).toBeInTheDocument();
    });
  });

  describe('Passo 2 — verificação OTP', () => {
    it('deve renderizar título, CTA e opção de voltar', async () => {
      await advanceToOtpStep();

      expect(
        screen.getByRole('button', { name: 'Confirmar código' })
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Voltar para o e-mail' })
      ).toBeInTheDocument();
    });

    it('deve voltar para o passo de e-mail ao clicar em voltar', async () => {
      await advanceToOtpStep();

      await user.click(
        screen.getByRole('button', { name: 'Voltar para o e-mail' })
      );

      await waitFor(() => {
        expect(screen.getByText('Recuperar senha')).toBeInTheDocument();
      });
    });

    it('deve avançar para o passo de senha em um código válido', async () => {
      await advanceToPasswordStep();

      expect(mockVerifyRecoveryOtp).toHaveBeenCalledWith({
        email: 'usuario@empresa.com',
        token: '123456'
      });
    });
  });

  describe('Passo 3 — nova senha', () => {
    it('deve renderizar os campos de senha e o CTA', async () => {
      await advanceToPasswordStep();

      expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar nova senha')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Redefinir senha' })
      ).toBeInTheDocument();
    });

    it('deve redefinir a senha e navegar para o dashboard', async () => {
      await advanceToPasswordStep();

      await user.type(screen.getByLabelText('Nova senha'), 'NovaSenha@123');
      await user.type(
        screen.getByLabelText('Confirmar nova senha'),
        'NovaSenha@123'
      );
      await user.click(screen.getByRole('button', { name: 'Redefinir senha' }));

      await waitFor(() => {
        expect(mockSetNewPassword).toHaveBeenCalledWith({
          newPassword: 'NovaSenha@123'
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('deve exibir erro inline quando as senhas não coincidem', async () => {
      await advanceToPasswordStep();

      await user.type(screen.getByLabelText('Nova senha'), 'NovaSenha@123');
      await user.type(
        screen.getByLabelText('Confirmar nova senha'),
        'SenhaDiferente@456'
      );
      await user.click(screen.getByRole('button', { name: 'Redefinir senha' }));

      await waitFor(() => {
        expect(
          screen.getByText('As senhas não coincidem.')
        ).toBeInTheDocument();
      });

      expect(mockSetNewPassword).not.toHaveBeenCalled();
    });
  });
});
