import { useState } from 'react';
import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUser } from '@/features/users';

import {
  type FirstAccessFormValues,
  firstAccessSchema
} from '../../domain/validators';

import { useAuth } from './use-auth';
import {
  useConfirmFirstAccessMutation,
  useResendOtpMutation,
  useSetFirstAccessPasswordMutation
} from './use-mutations';

type FirstAccessStep = 'password' | 'otp';

export function useFirstAccess() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { currentOrganization } = useUser();
  const [step, setStep] = useState<FirstAccessStep>('password');

  const { mutateAsync: setPassword, isPending: isPendingPassword } =
    useSetFirstAccessPasswordMutation();
  const {
    mutateAsync: confirmAccess,
    isPending: isPendingOtp,
    error: otpError
  } = useConfirmFirstAccessMutation();
  const { mutate: resendOtp } = useResendOtpMutation();

  const isReady = !!currentOrganization?.id;
  const email = session?.user.email ?? '';

  const form = useForm<FirstAccessFormValues>({
    resolver: zodResolver(firstAccessSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmitPassword = async (data: FirstAccessFormValues) => {
    if (!session) return;

    await setPassword({ newPassword: data.password, email })
      .then(() => setStep('otp'))
      .catch(() => {});
  };

  const onSubmitOtp = async (code: string) => {
    if (!session) return;

    await confirmAccess({ email, token: code, userId: session.user.id })
      .then(() => navigate('/', { replace: true }))
      .catch(() => {});
  };

  const onResendOtp = () => {
    if (email) resendOtp({ email });
  };

  const onBackToPassword = () => setStep('password');

  return {
    step,
    form,
    email,
    isReady,
    isPendingPassword,
    isPendingOtp,
    otpError: otpError?.message ?? null,
    onSubmitPassword,
    onSubmitOtp,
    onResendOtp,
    onBackToPassword
  };
}
