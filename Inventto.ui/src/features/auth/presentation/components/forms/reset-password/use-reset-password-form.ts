import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  type ResetPasswordFormValues,
  resetPasswordSchema
} from '../../../../domain/validators';
import { useResetPasswordMutation } from '../../../hooks/use-mutations';

export function useResetPasswordForm() {
  const navigate = useNavigate();
  const { mutateAsync: resetPassword, isPending } = useResetPasswordMutation();

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    // Erro de submit (ex.: sessão de recovery expirada) vira toast via
    // MutationCache global; o usuário permanece no formulário.
    await resetPassword({ newPassword: data.password })
      .then(() => navigate('/auth/login', { replace: true }))
      .catch(() => {});
  };

  return { form, onSubmit, isPending };
}
