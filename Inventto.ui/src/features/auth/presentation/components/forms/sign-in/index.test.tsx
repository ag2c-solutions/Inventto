import { MemoryRouter } from 'react-router';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignInForm } from './index';

const mockMutateAsync = vi.fn();
const mockVerifyOtp = vi.fn();
const mockResendOtp = vi.fn().mockResolvedValue(undefined);

let verifyOtpError: Error | null = null;

vi.mock('../../../hooks/use-mutations', () => ({
  useSignInMutation: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false
  }),

  useVerifyOtpMutation: () => ({
    mutateAsync: mockVerifyOtp,
    reset: vi.fn(),
    isPending: false,
    get error() {
      return verifyOtpError;
    }
  }),

  useResendOtpMutation: () => ({ mutateAsync: mockResendOtp })
}));

const mockNavigate = vi.fn();
vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

vi.mock('@/app/brand/logo', () => ({
  Logo: () => <div data-testid="mock-logo">Logo</div>
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
    [key: string]: unknown;
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

describe('SignInForm Component', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();

    verifyOtpError = null;

    mockResendOtp.mockResolvedValue(undefined);
  });

  const renderComponent = () =>
    render(
      <MemoryRouter>
        <SignInForm />
      </MemoryRouter>
    );

  it('should render the form with all necessary fields', () => {
    renderComponent();

    expect(screen.getByTestId('mock-logo')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('should display validation errors when submitting empty form', async () => {
    renderComponent();

    const submitBtn = screen.getByRole('button', { name: /entrar/i });

    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/e-mail inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/a senha é obrigatória/i)).toBeInTheDocument();
    });

    expect(mockMutateAsync).not.toHaveBeenCalled();
  });

  it('should call mutation and navigate on success', async () => {
    mockMutateAsync.mockImplementation(async () => {
      await new Promise((resolve) => setTimeout(resolve, 100));

      return { user: { id: '1' } };
    });

    renderComponent();

    await user.type(screen.getByLabelText(/e-mail/i), 'admin@inventto.com');
    await user.type(screen.getByLabelText(/senha/i), 'SecurePass123!');

    const submitBtn = screen.getByRole('button', { name: /entrar/i });
    const clickPromise = user.click(submitBtn);

    await waitFor(() => {
      expect(submitBtn).toBeDisabled();
    });

    await clickPromise;

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith({
        email: 'admin@inventto.com',
        password: 'SecurePass123!'
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('should reset password field and restore focus on login error', async () => {
    mockMutateAsync.mockRejectedValue(new Error('Invalid credentials'));

    renderComponent();

    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitBtn = screen.getByRole('button', { name: /entrar/i });

    await user.type(emailInput, 'admin@inventto.com');
    await user.type(passwordInput, 'WrongPass');

    await user.click(submitBtn);

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(passwordInput).toHaveValue('');
    });

    expect(emailInput).toHaveValue('admin@inventto.com');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should switch to OTP verification when email is pending confirmation', async () => {
    mockMutateAsync.mockRejectedValue(new Error('EMAIL_NOT_CONFIRMED'));

    renderComponent();

    await user.type(screen.getByLabelText(/e-mail/i), 'pending@inventto.com');
    await user.type(screen.getByLabelText(/senha/i), 'ValidPass123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Confirme seu e-mail')).toBeInTheDocument();
    });

    expect(screen.getByText(/p•••@inventto\.com/)).toBeInTheDocument();
    expect(mockResendOtp).toHaveBeenCalledWith({
      email: 'pending@inventto.com'
    });

    await user.click(
      screen.getByRole('button', { name: /voltar para o e-mail/i })
    );
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
  });

  it('should display inline error in OtpStep when OTP is invalid', async () => {
    verifyOtpError = new Error('Código inválido ou expirado.');

    mockMutateAsync.mockRejectedValue(new Error('EMAIL_NOT_CONFIRMED'));
    mockVerifyOtp.mockReturnValue(new Promise(() => {}));

    renderComponent();

    await user.type(screen.getByLabelText(/e-mail/i), 'pending@inventto.com');
    await user.type(screen.getByLabelText(/senha/i), 'ValidPass123!');
    await user.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(screen.getByText('Confirme seu e-mail')).toBeInTheDocument();
    });

    expect(screen.getByRole('alert')).toHaveTextContent(
      'Código inválido ou expirado.'
    );

    await user.type(screen.getByTestId('otp-input'), '000000');

    await user.click(
      screen.getByRole('button', { name: /confirmar e entrar/i })
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
