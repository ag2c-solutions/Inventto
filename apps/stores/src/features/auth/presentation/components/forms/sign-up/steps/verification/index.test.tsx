import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { VerificationStep } from './index';

const mockVerifyOtp = vi.fn();
const mockResendOtp = vi.fn();
const mockPrevStep = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../hooks/use-sign-up-form', () => ({
  useSignUpForm: () => ({
    form: {
      getValues: (field?: string) => {
        if (field === 'email') return 'joana@email.com';
        return { email: 'joana@email.com' };
      }
    }
  })
}));

vi.mock('../../../../../hooks/use-mutations', () => ({
  useVerifyOtpMutation: () => ({
    mutateAsync: mockVerifyOtp,
    isPending: false,
    error: null,
    reset: vi.fn()
  }),
  useResendOtpMutation: () => ({
    mutateAsync: mockResendOtp,
    isPending: false
  })
}));

vi.mock('@/shared/components/common/wizard', () => ({
  useWizard: () => ({
    actions: {
      prevStep: mockPrevStep
    }
  })
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

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
      aria-label="Código de verificação de 8 dígitos"
      value={value ?? ''}
      maxLength={maxLength}
      disabled={disabled}
      onChange={(e) => onChange?.(e.target.value)}
      data-testid="otp-input"
    />
  ),
  InputOTPGroup: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  InputOTPSlot: () => null
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}));

describe('VerificationStep', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = () => {
    const queryClient = new QueryClient({
      defaultOptions: { mutations: { retry: false } }
    });
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <VerificationStep />
        </MemoryRouter>
      </QueryClientProvider>
    );
  };

  it('deve renderizar OtpStep com title, subtítulo com e-mail mascarado e ctaLabel corretos', () => {
    renderComponent();

    expect(screen.getByText('Verifique seu e-mail')).toBeInTheDocument();

    expect(screen.getByText(/j•••@email\.com/i)).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: /ativar minha conta/i })
    ).toBeInTheDocument();
  });

  it('deve chamar verifyOtp com { email, token: code } ao submeter', async () => {
    mockVerifyOtp.mockResolvedValue({});
    renderComponent();

    const input = screen.getByRole('textbox', {
      name: /código de verificação/i
    });
    await user.type(input, '12345678');

    await user.click(
      screen.getByRole('button', { name: /ativar minha conta/i })
    );

    await waitFor(() => {
      expect(mockVerifyOtp).toHaveBeenCalledWith({
        email: 'joana@email.com',
        token: '12345678'
      });
    });
  });

  it('deve chamar resendOtp com { email } ao clicar em reenviar', async () => {
    mockResendOtp.mockResolvedValue(undefined);
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: /não recebeu\? reenviar código/i })
    );

    expect(mockResendOtp).toHaveBeenCalledWith({ email: 'joana@email.com' });
  });

  it('deve navegar para / com sucesso após verifyOtp', async () => {
    mockVerifyOtp.mockResolvedValue({});
    renderComponent();

    const input = screen.getByRole('textbox', {
      name: /código de verificação/i
    });
    await user.type(input, '87654321');

    await user.click(
      screen.getByRole('button', { name: /ativar minha conta/i })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('deve chamar prevStep ao clicar em voltar', async () => {
    renderComponent();

    await user.click(
      screen.getByRole('button', { name: /voltar para a etapa anterior/i })
    );

    expect(mockPrevStep).toHaveBeenCalled();
  });
});
