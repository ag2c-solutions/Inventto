import { useState } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { EMAIL_NOT_CONFIRMED_ERROR } from '../../../../../domain/constants';
import {
  useResendOtpMutation,
  useSignInMutation,
  useVerifyOtpMutation
} from '../../../../hooks/use-mutations';
import { type SignInFormData, signInSchema } from '../schema';

export function useSignInForm() {
  const { mutateAsync: signIn } = useSignInMutation();
  const { mutateAsync: resendOtp } = useResendOtpMutation();
  const navigate = useNavigate();
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);

  const {
    mutateAsync: verifyOtp,
    isPending: isVerifying,
    error: verifyError,
    reset: resetVerify
  } = useVerifyOtpMutation();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: SignInFormData) => {
    await signIn(data)
      .then(() => navigate('/', { replace: true }))
      .catch((error: unknown) => {
        const message = error instanceof Error ? error.message : '';

        if (message === EMAIL_NOT_CONFIRMED_ERROR) {
          setPendingEmail(data.email);

          resendOtp({ email: data.email });
          return;
        }

        form.resetField('password');
        queueMicrotask(() => form.setFocus('password'));
      });
  };

  const handleVerifyOtp = async (code: string) => {
    if (!pendingEmail) return;

    resetVerify();

    await verifyOtp({ email: pendingEmail, token: code })
      .then(() => navigate('/', { replace: true }))
      .catch(() => {});
  };

  const handleResendOtp = async () => {
    if (!pendingEmail) return;

    await resendOtp({ email: pendingEmail });
  };

  const handleBackToCredentials = () => {
    resetVerify();

    setPendingEmail(null);

    form.resetField('password');
  };

  return {
    form,
    onSubmit,
    pendingEmail,
    isVerifying,
    verifyErrorMessage:
      verifyError instanceof Error ? verifyError.message : null,
    handleVerifyOtp,
    handleResendOtp,
    handleBackToCredentials
  };
}
