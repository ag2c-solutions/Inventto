import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUpdatePasswordMutation } from '../../../hooks/use-mutation';
import { type ChangePasswordFormData, changePasswordSchema } from '../schema';

export function useChangePassword(onSuccess?: () => void) {
  const { mutateAsync, isPending } = useUpdatePasswordMutation();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: ''
    }
  });

  const handleSubmit = async (data: ChangePasswordFormData) => {
    try {
      await mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.password
      });

      form.reset();
      onSuccess?.();
    } catch (error: any) {
      if (
        error?.name === 'CurrentPasswordInvalidError' ||
        error?.message === 'Senha atual incorreta.'
      ) {
        form.setError('currentPassword', { message: 'Senha atual incorreta.' });
      }
    }
  };

  return {
    form,
    isSubmitting: isPending,
    handleSubmit
  };
}
