import { useState } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  type ResetPasswordFormValues,
  resetPasswordSchema
} from '../../../../domain/validators';
import {
  useRecoverPasswordMutation,
  useSetNewPasswordMutation,
  useVerifyRecoveryOtpMutation
} from '../../../hooks/use-mutations';
import { type RecoverPasswordFormData, recoverPasswordSchema } from '../schema';

type RecoverStep = 'email' | 'otp' | 'password';

export function useRecoverPasswordForm() {
  const navigate = useNavigate();
  const [step, setStep] = useState<RecoverStep>('email');
  const [email, setEmail] = useState('');

  const { mutateAsync: recoverPassword } = useRecoverPasswordMutation();
  const {
    mutateAsync: verifyRecoveryOtp,
    isPending: isVerifying,
    error: otpError,
    reset: resetVerify
  } = useVerifyRecoveryOtpMutation();
  const { mutateAsync: setNewPassword } = useSetNewPasswordMutation();

  const emailForm = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: '' }
  });

  const passwordForm = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmitEmail = async (data: RecoverPasswordFormData) => {
    // RN002 (anti-enumeração): avança para o passo de OTP independentemente de
    // o e-mail existir — a tela do código não revela se há conta associada.
    await recoverPassword({ email: data.email }).catch(() => {});

    setEmail(data.email);
    setStep('otp');
  };

  const onSubmitOtp = async (code: string) => {
    resetVerify();

    await verifyRecoveryOtp({ email, token: code })
      .then(() => setStep('password'))
      .catch(() => {});
  };

  const onResendOtp = () => {
    if (email) recoverPassword({ email }).catch(() => {});
  };

  const onBackToEmail = () => {
    resetVerify();
    setStep('email');
  };

  const onSubmitPassword = async (data: ResetPasswordFormValues) => {
    await setNewPassword({ newPassword: data.password })
      .then(() => navigate('/', { replace: true }))
      .catch(() => {});
  };

  return {
    step,
    email,
    emailForm,
    passwordForm,
    isVerifying,
    otpError: otpError instanceof Error ? otpError.message : null,
    onSubmitEmail,
    onSubmitOtp,
    onResendOtp,
    onBackToEmail,
    onSubmitPassword
  };
}
