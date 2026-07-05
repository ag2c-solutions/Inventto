import { MemoryRouter } from 'react-router';
import {
  act,
  render,
  renderHook,
  screen,
  waitFor
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SignUpFormProvider, useSignUpForm } from './hooks/use-sign-up-form';
import { SignUpForm } from './index';

const mockSignUp = vi.fn();
const mockVerifyOtp = vi.fn();
const mockResendOtp = vi.fn();
const mockNavigate = vi.fn();

vi.mock('../../../hooks/use-mutations', () => ({
  useSignUpMutation: () => ({
    mutateAsync: mockSignUp,
    isPending: false
  }),
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

// input-otp usa document.elementFromPoint que não existe no jsdom
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

window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe('SignUpForm Feature', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const fillStepOne = async (isCnpj = false, skipCorporateName = false) => {
    const companyInput = screen.getByLabelText(/nome fantasia da organização/i);
    const docInput = screen.getByLabelText(/documento/i);

    await user.type(companyInput, 'Inventto Tech');

    if (isCnpj) {
      await user.type(docInput, '33.400.689/0001-09');
      if (!skipCorporateName) {
        await waitFor(() =>
          expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument()
        );
        await user.type(
          screen.getByLabelText(/razão social/i),
          'Inventto Ltda'
        );
      }
    } else {
      await user.type(docInput, '123.456.789-09');
    }

    // Selecionar área de atuação (BusinessAreaButtonGroup)
    const clothingBtn = screen.getByTestId('business-area-option-clothing');
    await user.click(clothingBtn);
  };

  describe('Integration Tests (UI Flow)', () => {
    const renderComponent = () => {
      return render(
        <MemoryRouter initialEntries={['/auth/signup']}>
          <SignUpFormProvider>
            <SignUpForm />
          </SignUpFormProvider>
        </MemoryRouter>
      );
    };

    it('should navigate to login when "Já tenho conta" (Cancel) is clicked', async () => {
      renderComponent();

      const cancelBtn = screen.getByRole('button', {
        name: /já tenho conta\. entrar/i
      });

      await user.click(cancelBtn);

      expect(mockNavigate).toHaveBeenCalledWith('/auth/login');
    });

    it('should validate Step 1 and prevent navigation if empty', async () => {
      renderComponent();

      const nextBtn = screen.getByRole('button', { name: /avançar/i });

      await user.click(nextBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/o nome fantasia é obrigatório/i)
        ).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/^senha$/i)).not.toBeInTheDocument();
    });

    it('should block Step 1 if no business area is selected', async () => {
      renderComponent();

      const companyInput = screen.getByLabelText(
        /nome fantasia da organização/i
      );
      await user.type(companyInput, 'Inventto Tech');

      const docInput = screen.getByLabelText(/documento/i);
      await user.type(docInput, '123.456.789-09');

      // Não seleciona área de atuação
      const nextBtn = screen.getByRole('button', { name: /avançar/i });
      await user.click(nextBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/selecione uma área de atuação/i)
        ).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/nome completo/i)).not.toBeInTheDocument();
    });

    it('should prevent navigation if CNPJ is present but Corporate Name is missing', async () => {
      renderComponent();

      await fillStepOne(true, true);

      const nextBtn = screen.getByRole('button', { name: /avançar/i });

      await user.click(nextBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/a razão social é obrigatória para cnpj/i)
        ).toBeInTheDocument();
      });

      expect(screen.queryByLabelText(/^senha$/i)).not.toBeInTheDocument();
    });

    it('should navigate to Step 2 after valid Step 1', async () => {
      renderComponent();

      await fillStepOne(false);

      mockSignUp.mockResolvedValue({ user: { id: 'u1' } });

      const nextBtn = screen.getByRole('button', { name: /avançar/i });
      await user.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
      });
    });

    it('should block Step 2 if terms checkbox is not checked', async () => {
      renderComponent();

      await fillStepOne(false);

      const nextBtn = screen.getByRole('button', { name: /avançar/i });
      await user.click(nextBtn);

      await waitFor(() =>
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
      );

      // Preenche campos obrigatórios mas não marca os termos
      await user.type(screen.getByLabelText(/nome completo/i), 'Admin');
      await user.type(
        screen.getByLabelText(/e-mail institucional/i),
        'admin@test.com'
      );
      await user.type(screen.getByLabelText('Senha'), 'StrongPass123!');
      await user.type(
        screen.getByLabelText('Confirmar senha'),
        'StrongPass123!'
      );

      const continueBtn = screen.getByRole('button', { name: /continuar/i });
      await user.click(continueBtn);

      await waitFor(() => {
        expect(
          screen.getByText(/é preciso aceitar os termos para continuar/i)
        ).toBeInTheDocument();
      });

      expect(mockSignUp).not.toHaveBeenCalled();
    });

    it('should complete Happy Path (3 steps): P1 → P2 → signUp → P3 → verifyOtp → navigate', async () => {
      mockSignUp.mockResolvedValue({ user: { id: 'u1' } });
      mockVerifyOtp.mockResolvedValue({});

      renderComponent();

      // Passo 1
      await fillStepOne(false);
      const nextBtn = screen.getByRole('button', { name: /avançar/i });
      await user.click(nextBtn);

      // Passo 2
      await waitFor(() =>
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
      );

      await user.type(screen.getByLabelText(/nome completo/i), 'Admin');
      await user.type(
        screen.getByLabelText(/e-mail institucional/i),
        'admin@test.com'
      );
      await user.type(screen.getByLabelText('Senha'), 'StrongPass123!');
      await user.type(
        screen.getByLabelText('Confirmar senha'),
        'StrongPass123!'
      );

      const termsCheckbox = screen.getByRole('checkbox');
      await user.click(termsCheckbox);

      await user.click(screen.getByRole('button', { name: /continuar/i }));

      // signUp deve ter sido chamado (ao avançar do passo 2)
      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalledWith(
          expect.objectContaining({
            companyName: 'Inventto Tech',
            fullName: 'Admin',
            email: 'admin@test.com',
            businessAreaCode: 'clothing',
            acceptedTerms: true
          })
        );
      });

      // Deve avançar para P3 (OTP)
      await waitFor(() => {
        expect(screen.getByText(/verifique seu e-mail/i)).toBeInTheDocument();
      });

      // Passo 3 — inserir código OTP
      const otpInput = screen.getByRole('textbox', {
        name: /código de verificação/i
      });
      await user.type(otpInput, '123456');

      await user.click(
        screen.getByRole('button', { name: /ativar minha conta/i })
      );

      await waitFor(() => {
        expect(mockVerifyOtp).toHaveBeenCalledWith({
          email: 'admin@test.com',
          token: '123456'
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    it('should not advance to Step 3 if signUp fails', async () => {
      mockSignUp.mockRejectedValue(new Error('Email já cadastrado.'));

      renderComponent();

      await fillStepOne(false);
      await user.click(screen.getByRole('button', { name: /avançar/i }));

      await waitFor(() =>
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
      );

      await user.type(screen.getByLabelText(/nome completo/i), 'Admin');
      await user.type(
        screen.getByLabelText(/e-mail institucional/i),
        'admin@test.com'
      );
      await user.type(screen.getByLabelText('Senha'), 'StrongPass123!');
      await user.type(
        screen.getByLabelText('Confirmar senha'),
        'StrongPass123!'
      );
      await user.click(screen.getByRole('checkbox'));

      await user.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });

      // Não deve avançar para o passo 3
      expect(
        screen.queryByText(/verifique seu e-mail/i)
      ).not.toBeInTheDocument();
    });

    it('should not include slug in signUp payload', async () => {
      mockSignUp.mockResolvedValue({ user: { id: 'u1' } });

      renderComponent();

      await fillStepOne(false);
      await user.click(screen.getByRole('button', { name: /avançar/i }));

      await waitFor(() =>
        expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
      );

      await user.type(screen.getByLabelText(/nome completo/i), 'Admin');
      await user.type(
        screen.getByLabelText(/e-mail institucional/i),
        'admin@test.com'
      );
      await user.type(screen.getByLabelText('Senha'), 'StrongPass123!');
      await user.type(
        screen.getByLabelText('Confirmar senha'),
        'StrongPass123!'
      );
      await user.click(screen.getByRole('checkbox'));

      await user.click(screen.getByRole('button', { name: /continuar/i }));

      await waitFor(() => {
        expect(mockSignUp).toHaveBeenCalled();
      });

      const payload = mockSignUp.mock.calls[0][0];
      expect(payload).not.toHaveProperty('slug');
    });
  });

  describe('Unit Tests (Hook Logic & Edge Cases)', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <MemoryRouter>
        <SignUpFormProvider>{children}</SignUpFormProvider>
      </MemoryRouter>
    );

    it('should throw error if hook is used outside provider', () => {
      const consoleSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      expect(() => renderHook(() => useSignUpForm())).toThrow(
        'useSignUpForm deve ser usado dentro de um SignUpFormProvider'
      );

      consoleSpy.mockRestore();
    });

    it('should validate specific fields for "user" step manually (including acceptedTerms)', async () => {
      const { result } = renderHook(() => useSignUpForm(), { wrapper });
      const triggerSpy = vi.spyOn(result.current.form, 'trigger');

      // Mock signUp to prevent actual call when trigger passes
      mockSignUp.mockResolvedValue({ user: { id: 'u1' } });

      await act(async () => {
        await result.current.actions.handleBeforeNextStep({
          id: 'user',
          label: 'Dados',
          component: null
        });
      });

      expect(triggerSpy).toHaveBeenCalledWith([
        'fullName',
        'email',
        'password',
        'passwordConfirmation',
        'acceptedTerms'
      ]);
    });

    it('should return true for unknown steps', async () => {
      const { result } = renderHook(() => useSignUpForm(), { wrapper });

      let isValid;

      await act(async () => {
        isValid = await result.current.actions.handleBeforeNextStep({
          id: 'unknown',
          label: 'Unknown',
          component: null
        });
      });

      expect(isValid).toBe(true);
    });

    it('should handle submit errors gracefully (no slug in defaults)', async () => {
      mockSignUp.mockRejectedValue(new Error('Network Error'));

      const { result } = renderHook(() => useSignUpForm(), { wrapper });

      await act(async () => {
        result.current.form.reset({
          companyName: 'Test Company',
          document: '123.456.789-09',
          corporateName: '',
          businessAreaCode: 'clothing',
          fullName: 'Valid User',
          email: 'valid@test.com',
          password: 'StrongPass123!',
          passwordConfirmation: 'StrongPass123!',
          acceptedTerms: true
        });

        await result.current.actions.onSubmit();
      });

      expect(mockNavigate).not.toHaveBeenCalledWith('/', { replace: true });
    });
  });
});
