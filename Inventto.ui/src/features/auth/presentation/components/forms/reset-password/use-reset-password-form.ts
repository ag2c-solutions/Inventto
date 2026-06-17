import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  type ResetPasswordFormValues,
  resetPasswordSchema
} from '../../../../domain/validators';
import { useResetPasswordMutation } from '../../../hooks/use-mutations';

export function useResetPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const { mutateAsync: resetPassword, isPending } = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    await resetPassword({ newPassword: data.password })
      .then(() => setIsSuccess(true))
      .catch(() => {});
  };

  return { form, onSubmit, isPending, isSuccess };
}
