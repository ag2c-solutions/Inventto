import { useNavigate } from 'react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { useUser } from '@/features/users';

import {
  type FirstAccessFormValues,
  firstAccessSchema
} from '../../domain/validators';

import { useAuth } from './use-auth';
import { useCompleteFirstAccessMutation } from './use-mutations';

export function useFirstAccess() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { currentOrganization } = useUser();
  const { mutateAsync, isPending } = useCompleteFirstAccessMutation();
  const isReady = !!currentOrganization?.id;

  const form = useForm<FirstAccessFormValues>({
    resolver: zodResolver(firstAccessSchema),
    defaultValues: { password: '', confirmPassword: '' }
  });

  const onSubmit = async (data: FirstAccessFormValues) => {
    if (!session) return;

    await mutateAsync({
      newPassword: data.password,
      userId: session.user.id
    })
      .then(() => navigate('/', { replace: true }))
      .catch(() => {});
  };

  return { form, onSubmit, isReady, isPending };
}
