import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUpdatePasswordMutation } from '../../../hooks/use-mutation';
import { type ChangePasswordFormData, changePasswordSchema } from '../schema';

export function useChangePassword() {
  const { mutateAsync, isPending } = useUpdatePasswordMutation();

  const form = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    mode: 'onChange',
    defaultValues: {
      password: '',
      confirmPassword: ''
    }
  });

  const handleSubmit = async (data: ChangePasswordFormData) => {
    await mutateAsync(data.password);

    form.reset();
  };

  return {
    form,
    isSubmitting: isPending,
    handleSubmit
  };
}
