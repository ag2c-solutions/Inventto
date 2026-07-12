import { useMutation, useQueryClient } from '@tanstack/react-query';

import { StorefrontService } from '../../domain/services';
import { STOREFRONT_KEYS } from '../constants';

export function useUnpublishStorefrontMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => StorefrontService.unpublish(id),
    meta: { successMessage: 'Vitrine despublicada.' },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STOREFRONT_KEYS.all });
    }
  });
}
