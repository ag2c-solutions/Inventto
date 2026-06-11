import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useRecoverPasswordMutation } from '../../hooks/use-mutations';

import { type RecoverPasswordFormData, recoverPasswordSchema } from './schema';

export function useRecoverPasswordForm() {
  const { mutateAsync: recoverPassword } = useRecoverPasswordMutation();
  const [isSent, setIsSent] = useState(false);

  const form = useForm<RecoverPasswordFormData>({
    resolver: zodResolver(recoverPasswordSchema),
    defaultValues: { email: '' }
  });

  const onSubmit = async (data: RecoverPasswordFormData) => {
    // RN002 (anti-enumeração): mesmo em erro a tela transiciona para o
    // estado "sent" — a resposta é neutra e não revela se o e-mail existe.
    await recoverPassword(data).catch(() => {});

    setIsSent(true);
  };

  return {
    form,
    onSubmit,
    isSent
  };
}
