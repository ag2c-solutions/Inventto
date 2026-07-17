import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';

import { useLookupCepQuery } from '@/features/organizations/presentation/hooks/use-queries';

import type { OrganizationSettingsFormData } from '../schema';

interface UseCepLookupReturn {
  cepLoading: boolean;
  handleCepBlur: (cep: string) => void;
}

export function useCepLookup(
  form: UseFormReturn<OrganizationSettingsFormData>
): UseCepLookupReturn {
  const [cep, setCep] = useState('');
  const { data: address, isFetching: cepLoading } = useLookupCepQuery(cep);

  useEffect(() => {
    if (!address) return;

    form.setValue('address.zip', address.zip, { shouldDirty: true });
    form.setValue('address.street', address.street, { shouldDirty: true });
    form.setValue('address.district', address.district, { shouldDirty: true });
    form.setValue('address.city', address.city, { shouldDirty: true });
    form.setValue('address.state', address.state, { shouldDirty: true });
  }, [address, form]);

  const handleCepBlur = (value: string) => {
    if (value.replace(/\D/g, '').length === 8) {
      setCep(value);
    }
  };

  return { cepLoading, handleCepBlur };
}
