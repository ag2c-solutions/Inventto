import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useSignInMutation } from '../../hooks/use-mutations';

import { type SignInFormData, signInSchema } from './schema';

export function useSignInForm() {
  const { mutateAsync } = useSignInMutation();
  const navigate = useNavigate();

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: '', password: '' }
  });

  const onSubmit = async (data: SignInFormData) => {
    await mutateAsync(data)
      .then(() => navigate('/', { replace: true }))
      .catch(() => {
        form.setValue('password', '');
        setTimeout(() => form.setFocus('password'), 0);
      });
  };

  return { form, onSubmit };
}
