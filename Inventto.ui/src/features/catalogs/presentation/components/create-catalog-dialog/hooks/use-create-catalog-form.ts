import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import {
  type CatalogFormValues,
  catalogSchema
} from '../../../../domain/validators';

export function useCreateCatalogForm() {
  return useForm<CatalogFormValues>({
    resolver: zodResolver(catalogSchema),
    defaultValues: { name: '' }
  });
}
