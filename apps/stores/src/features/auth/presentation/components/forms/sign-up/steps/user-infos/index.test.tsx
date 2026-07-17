import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FormProvider, useForm } from 'react-hook-form';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { UserStep } from './index';

const formRef: { current: unknown } = vi.hoisted(() => ({ current: null }));

vi.mock('../../hooks/use-sign-up-form', () => ({
  useSignUpForm: () => ({ form: formRef.current })
}));

function Harness() {
  const form = useForm({
    defaultValues: {
      companyName: '',
      document: '',
      corporateName: '',
      businessAreaCode: '',
      fullName: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      acceptedTerms: false
    }
  });

  formRef.current = form;

  return (
    <FormProvider {...form}>
      <UserStep />
    </FormProvider>
  );
}

describe('UserStep', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should toggle password visibility when clicking the eye icon', async () => {
    render(<Harness />);

    const passwordInput = document.getElementById(
      'signup-password'
    ) as HTMLInputElement;
    expect(passwordInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByLabelText('Mostrar senha'));

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByLabelText('Ocultar senha')).toBeInTheDocument();

    await user.click(screen.getByLabelText('Ocultar senha'));

    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('should toggle password confirmation visibility when clicking the eye icon', async () => {
    render(<Harness />);

    const confirmationInput = document.getElementById(
      'signup-password-confirmation'
    ) as HTMLInputElement;
    expect(confirmationInput).toHaveAttribute('type', 'password');

    await user.click(screen.getByLabelText('Mostrar confirmação de senha'));

    expect(confirmationInput).toHaveAttribute('type', 'text');

    await user.click(screen.getByLabelText('Ocultar confirmação de senha'));

    expect(confirmationInput).toHaveAttribute('type', 'password');
  });

  it('should stop propagation when clicking the terms of use link', () => {
    render(<Harness />);

    const termsLink = screen.getByRole('link', { name: 'Termos de Uso' });
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

    termsLink.dispatchEvent(clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });

  it('should stop propagation when clicking the privacy policy link', () => {
    render(<Harness />);

    const privacyLink = screen.getByRole('link', {
      name: 'Política de Privacidade'
    });
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true
    });
    const stopPropagationSpy = vi.spyOn(clickEvent, 'stopPropagation');

    privacyLink.dispatchEvent(clickEvent);

    expect(stopPropagationSpy).toHaveBeenCalled();
  });
});
