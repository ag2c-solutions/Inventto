import { useEffect, useState } from 'react';

import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';

import type { SaleCustomerInput } from '../../../../domain/entities';
import { useLookupCustomerQuery } from '../../../hooks/use-queries';

export function useCustomerLookup(
  onChange: (customer: SaleCustomerInput | null) => void
) {
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');

  const trimmedPhone = phone.trim();
  const debouncedPhone = useDebouncedValue(trimmedPhone, 400);

  const { data: found, isLoading } = useLookupCustomerQuery(debouncedPhone);

  const isSettled = trimmedPhone === debouncedPhone && !isLoading;
  const isNew = isSettled && trimmedPhone.length > 0 && !found;

  useEffect(() => {
    if (!trimmedPhone) {
      onChange(null);
      return;
    }

    // Enquanto o debounce ainda não assentou (ou a busca está em voo), não
    // propaga — evita mandar "cliente novo" prematuro enquanto o usuário
    // ainda está digitando o telefone.
    if (!isSettled) return;

    if (found) {
      onChange({ phone: trimmedPhone });
    } else {
      onChange({ phone: trimmedPhone, name: name.trim() || undefined });
    }
  }, [trimmedPhone, isSettled, found, name, onChange]);

  return {
    phone,
    setPhone,
    name,
    setName,
    found,
    isLoading,
    isNew
  };
}
