import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { formatDocument } from '@/shared/utils';

import {
  type CreateOrganizationFormValues,
  createOrganizationSchema
} from '../../../domain/validators';

interface UseCreateOrganizationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function useCreateOrganizationForm({
  onSuccess,
  onCancel
}: UseCreateOrganizationFormProps = {}) {
  const form = useForm<CreateOrganizationFormValues>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: '',
      document: '',
      copySettings: false,
      sourceOrgId: undefined,
      replicateGroups: ['categories', 'operational', 'visual']
    }
  });

  const copySettings = form.watch('copySettings');

  function handleDocumentChange(value: string) {
    const masked = formatDocument(value);
    form.setValue('document', masked);
  }

  function handleCopySettingsToggle(checked: boolean) {
    form.setValue('copySettings', checked);
    if (!checked) {
      form.setValue('sourceOrgId', undefined);
      form.setValue('replicateGroups', ['categories', 'operational', 'visual']);
    }
  }

  function handleCancel() {
    form.reset();
    onCancel?.();
  }

  return {
    form,
    copySettings,
    handleDocumentChange,
    handleCopySettingsToggle,
    handleCancel,
    onSuccess
  };
}
