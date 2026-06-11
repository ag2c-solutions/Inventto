import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useRecoverPasswordMutation } from '../../../hooks/use-mutations';

import { type RecoverPasswordFormData, recoverPasswordSchema } from './schema';

export function useRecoverPasswordForm() {
  const { mutateAsync: recoverPassword } = useRecoverPasswordMutation();
  const [isSent, setIsSent] = useState(false);

  const form = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: RecoverPasswordFormData) => {
    await recoverPassword(data).catch(() => {});

    setIsSent(true);
  };

  return {
    form,
    onSubmit,
    isSent
  };
}
