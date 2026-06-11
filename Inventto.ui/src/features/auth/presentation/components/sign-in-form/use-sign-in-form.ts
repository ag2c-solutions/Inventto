import { useState } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { EMAIL_NOT_CONFIRMED_ERROR } from '../../../data/handlers/error-handler';
import {
  useResendOtpMutation,
  useSignInMutation,
  useVerifyOtpMutation
} from '../../hooks/use-mutations';

import { type SignInFormData, signInSchema } from './schema';

// RN005: o throttle é reflexo do rate limit nativo do provedor, não bloqueio
// aplicacional — apenas desabilita o submit por um instante.
const THROTTLE_COOLDOWN_MS = 30_000;

export const THROTTLED_MESSAGE =
  'Muitas tentativas. Aguarde um instante e tente novamente.';

export function useSignInForm() {
  const { mutateAsync: signIn } = useSignInMutation();
  const {
    mutateAsync: verifyOtp,
    isPending: isVerifying,
    error: verifyError,
    reset: resetVerify
  } = useVerifyOtpMutation();
  const { mutateAsync: resendOtp } = useResendOtpMutation();
  const navigate = useNavigate();

  // E-mail pendente de confirmação: quando preenchido, o formulário está no
  // Passo 2 (OtpStep) — RF003/RN003.
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isThrottled, setIsThrottled] = useState(false);

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: SignInFormData) => {
    setFormError(null);

    await signIn(data)
      .then(() => navigate('/', { replace: true }))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : '';

        if (message === EMAIL_NOT_CONFIRMED_ERROR) {
          // Credencial válida com e-mail pendente: vai para o Passo 2 e
          // dispara o envio do código — sem erro neutro (RN003).
          setPendingEmail(data.email);
          resendOtp({ email: data.email }).catch(() => {});
          return;
        }

        if (message.includes('Muitas tentativas')) {
          setIsThrottled(true);
          setFormError(THROTTLED_MESSAGE);
          setTimeout(() => setIsThrottled(false), THROTTLE_COOLDOWN_MS);
        } else {
          setFormError(message || 'E-mail ou senha incorretos.');
        }

        form.setValue('password', '');
        setTimeout(() => form.setFocus('password'), 0);
      });
  };

  const handleVerifyOtp = (code: string) => {
    if (!pendingEmail) return;
    resetVerify();

    verifyOtp({ email: pendingEmail, token: code })
      .then(() => navigate('/', { replace: true }))
      .catch(() => {});
  };

  const handleResendOtp = () => {
    if (!pendingEmail) return;
    resendOtp({ email: pendingEmail }).catch(() => {});
  };

  const handleBackToCredentials = () => {
    resetVerify();
    setPendingEmail(null);
    form.setValue('password', '');
  };

  return {
    form,
    onSubmit,
    formError,
    isThrottled,
    pendingEmail,
    isVerifying,
    verifyErrorMessage:
      verifyError instanceof Error ? verifyError.message : null,
    handleVerifyOtp,
    handleResendOtp,
    handleBackToCredentials
  };
}
