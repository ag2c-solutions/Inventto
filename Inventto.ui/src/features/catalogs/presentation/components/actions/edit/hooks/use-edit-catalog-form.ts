import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  type CatalogFormValues,
  catalogSchema
} from '@/features/catalogs/domain/validators';

export function useEditCatalogForm(name?: string) {
  const form = useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: { name: '' }
  });

  useEffect(() => {
    if (name !== undefined) {
      form.reset({ name });
    }
  }, [name, form]);

  return form;
}
