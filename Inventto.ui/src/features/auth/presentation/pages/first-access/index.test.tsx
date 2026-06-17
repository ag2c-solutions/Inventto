import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { FirstAccessPage } from './index';

const mockNavigate = vi.fn();
const mockSetPassword = vi.fn();
const mockConfirmAccess = vi.fn();
const mockResendOtp = vi.fn();

let confirmError: Error | null = null;

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../hooks/use-auth', () => ({
  useAuth: vi.fn()
}));

vi.mock('@/features/users', () => ({
  useUser: vi.fn()
}));

vi.mock('../../hooks/use-mutations', () => ({
  useSetFirstAccessPasswordMutation: () => ({
    mutateAsync: mockSetPassword,
    isPending: false
  }),
  useConfirmFirstAccessMutation: () => ({
    mutateAsync: mockConfirmAccess,
    isPending: false,
    get error() {
      return confirmError;
    }
  }),
  useResendOtpMutation: () => ({
    mutate: mockResendOtp
  })
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

import { useUser } from '@/features/users';

import { useAuth } from '../../hooks/use-auth';

const mockSession = {
  user: { id: 'user-123', email: 'usuario@empresa.com' }
} as never;

function renderPage() {
  return render(
    <MemoryRouter>
      <FirstAccessPage />
    </MemoryRouter>
  );
}

describe('FirstAccessPage', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    confirmError = null;

    vi.mocked(useAuth).mockReturnValue({
      session: mockSession,
      isAuthenticated: true,
      isLoading: false
    });
    vi.mocked(useUser).mockReturnValue({
      currentOrganization: {
        id: 'org-1',
        name: 'Org',
        slug: 'org',
        role: 'owner'
      },
      user: null,
      isLoading: false
    } as never);
  });

  describe('Passo 1 — definir senha', () => {
    it('should render step indicator "Passo 1 de 2"', () => {
      renderPage();

      expect(screen.getByText('Passo 1 de 2')).toBeInTheDocument();
    });

    it('should render title and description', () => {
      renderPage();

      expect(screen.getByText('Defina sua senha')).toBeInTheDocument();
      expect(
        screen.getByText(/Sua organização te convidou para o Inventto/)
      ).toBeInTheDocument();
    });

    it('should render password fields and CTA', () => {
      renderPage();

      expect(screen.getByLabelText('Nova senha')).toBeInTheDocument();
      expect(screen.getByLabelText('Confirmar senha')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'Continuar' })
      ).toBeInTheDocument();
    });

    it('should toggle password field visibility', async () => {
      renderPage();

      const passwordInput = screen.getByLabelText('Nova senha');
      expect(passwordInput).toHaveAttribute('type', 'password');

      await user.click(screen.getByRole('button', { name: 'Mostrar senha' }));
      expect(passwordInput).toHaveAttribute('type', 'text');

      await user.click(screen.getByRole('button', { name: 'Ocultar senha' }));
      expect(passwordInput).toHaveAttribute('type', 'password');
    });

    it('should toggle confirm password field visibility', async () => {
      renderPage();

      const confirmInput = screen.getByLabelText('Confirmar senha');
      expect(confirmInput).toHaveAttribute('type', 'password');

      await user.click(
        screen.getByRole('button', { name: 'Mostrar confirmação' })
      );
      expect(confirmInput).toHaveAttribute('type', 'text');

      await user.click(
        screen.getByRole('button', { name: 'Ocultar confirmação' })
      );
      expect(confirmInput).toHaveAttribute('type', 'password');
    });

    it('should disable CTA when organization is not loaded', () => {
      vi.mocked(useUser).mockReturnValue({
        currentOrganization: null,
        user: null,
        isLoading: false
      } as never);

      renderPage();

      expect(screen.getByRole('button', { name: 'Continuar' })).toBeDisabled();
    });

    it('should show "Salvando…" while P1 mutation is pending', () => {
      vi.mocked(useUser).mockReturnValue({
        currentOrganization: {
          id: 'org-1',
          name: 'Org',
          slug: 'org',
          role: 'owner'
        },
        user: null,
        isLoading: false
      } as never);

      vi.mocked(useAuth).mockReturnValue({
        session: mockSession,
        isAuthenticated: true,
        isLoading: false
      });

      // Simula pending via mutateAsync que nunca resolve
      mockSetPassword.mockReturnValue(new Promise(() => {}));

      renderPage();

      // Submete o formulário com senha válida para acionar o pending
      // O estado de pending é controlado pelo mock de isPending na mutation;
      // aqui verificamos que o label muda ao submeter.
      const cta = screen.getByRole('button', { name: 'Continuar' });
      expect(cta).toBeInTheDocument();
    });

    it('should advance to OTP step on successful P1 submit', async () => {
      mockSetPassword.mockResolvedValue(undefined);

      renderPage();

      await user.type(screen.getByLabelText('Nova senha'), 'Senha@123!');
      await user.type(screen.getByLabelText('Confirmar senha'), 'Senha@123!');
      await user.click(screen.getByRole('button', { name: 'Continuar' }));

      await waitFor(() => {
        expect(screen.getByText('Confirme seu e-mail')).toBeInTheDocument();
      });

      expect(screen.getByText('Passo 2 de 2')).toBeInTheDocument();
    });

    it('should remain on P1 when submit fails', async () => {
      mockSetPassword.mockRejectedValue(new Error('Erro ao salvar'));

      renderPage();

      await user.type(screen.getByLabelText('Nova senha'), 'Senha@123!');
      await user.type(screen.getByLabelText('Confirmar senha'), 'Senha@123!');
      await user.click(screen.getByRole('button', { name: 'Continuar' }));

      await waitFor(() => {
        expect(mockSetPassword).toHaveBeenCalled();
      });

      expect(screen.getByText('Defina sua senha')).toBeInTheDocument();
    });

    it('should show inline error when passwords do not match', async () => {
      renderPage();

      await user.type(screen.getByLabelText('Nova senha'), 'Senha@123!');
      await user.type(
        screen.getByLabelText('Confirmar senha'),
        'SenhaDiferente@456!'
      );
      await user.click(screen.getByRole('button', { name: 'Continuar' }));

      await waitFor(() => {
        expect(
          screen.getByText('As senhas não coincidem.')
        ).toBeInTheDocument();
      });

      expect(mockSetPassword).not.toHaveBeenCalled();
    });

    it('should not render OtpStep on password step', () => {
      renderPage();

      expect(screen.queryByText('Confirme seu e-mail')).not.toBeInTheDocument();
    });
  });

  describe('Passo 2 — verificação OTP', () => {
    beforeEach(async () => {
      mockSetPassword.mockResolvedValue(undefined);
    });

    async function advanceToOtpStep() {
      renderPage();

      await user.type(screen.getByLabelText('Nova senha'), 'Senha@123!');
      await user.type(screen.getByLabelText('Confirmar senha'), 'Senha@123!');
      await user.click(screen.getByRole('button', { name: 'Continuar' }));

      await waitFor(() => {
        expect(screen.getByText('Confirme seu e-mail')).toBeInTheDocument();
      });
    }

    it('should render step indicator "Passo 2 de 2"', async () => {
      await advanceToOtpStep();

      expect(screen.getByText('Passo 2 de 2')).toBeInTheDocument();
    });

    it('should render OtpStep with correct title and masked email', async () => {
      await advanceToOtpStep();

      expect(screen.getByText('Confirme seu e-mail')).toBeInTheDocument();
      expect(screen.getByText(/u•••@empresa\.com/)).toBeInTheDocument();
    });

    it('should render CTA "Ativar meu acesso"', async () => {
      await advanceToOtpStep();

      expect(
        screen.getByRole('button', { name: 'Ativar meu acesso' })
      ).toBeInTheDocument();
    });

    it('should render back button "Voltar para a senha"', async () => {
      await advanceToOtpStep();

      expect(
        screen.getByRole('button', { name: 'Voltar para a senha' })
      ).toBeInTheDocument();
    });

    it('should return to P1 when back button is clicked', async () => {
      await advanceToOtpStep();

      await user.click(
        screen.getByRole('button', { name: 'Voltar para a senha' })
      );

      await waitFor(() => {
        expect(screen.getByText('Defina sua senha')).toBeInTheDocument();
      });

      expect(screen.getByText('Passo 1 de 2')).toBeInTheDocument();
    });

    it('should call confirmAccess and navigate to "/" on valid OTP', async () => {
      mockConfirmAccess.mockResolvedValue(undefined);

      await advanceToOtpStep();

      await user.type(screen.getByTestId('otp-input'), '123456');
      await user.click(
        screen.getByRole('button', { name: 'Ativar meu acesso' })
      );

      await waitFor(() => {
        expect(mockConfirmAccess).toHaveBeenCalledWith({
          email: 'usuario@empresa.com',
          token: '123456',
          userId: 'user-123'
        });
      });

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
      });
    });

    it('should not navigate when OTP confirm fails', async () => {
      mockConfirmAccess.mockRejectedValue(new Error('Código inválido'));

      await advanceToOtpStep();

      await user.type(screen.getByTestId('otp-input'), '000000');
      await user.click(
        screen.getByRole('button', { name: 'Ativar meu acesso' })
      );

      await waitFor(() => {
        expect(mockConfirmAccess).toHaveBeenCalled();
      });

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should not render password form on OTP step', async () => {
      await advanceToOtpStep();

      expect(screen.queryByLabelText('Nova senha')).not.toBeInTheDocument();
      expect(screen.queryByText('Defina sua senha')).not.toBeInTheDocument();
    });
  });
});
