import { useQuery } from '@tanstack/react-query';

import { useDebouncedValue } from '@/shared/hooks/use-debounced-value';

import { useUser } from '@/features/users';

import { StorefrontApi } from '../../data/api';
import { STOREFRONT_KEYS } from '../constants';

export function useStorefrontsQuery() {
  const { currentOrganization } = useUser();

  return useQuery({
    queryKey: [...STOREFRONT_KEYS.all, currentOrganization?.id],
    queryFn: () => StorefrontApi.getStorefronts(currentOrganization!.id),
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 5
  });
}

export function useStorefrontQuery(id?: string) {
  return useQuery({
    queryKey: [...STOREFRONT_KEYS.all, id],
    queryFn: () => StorefrontApi.getStorefront(id!),
    enabled: !!id
  });
}

// Debounce embutido aqui (não em use-slug-availability) para o hook do
// slug-field ficar só com a lógica de estado/UI — a query já resolve
// "esperar o usuário parar de digitar".
export function useCheckSlugQuery(slug: string, storefrontId?: string) {
  const trimmed = slug.trim();
  const debounced = useDebouncedValue(trimmed, 400);

  const query = useQuery({
    queryKey: [...STOREFRONT_KEYS.all, 'check-slug', debounced, storefrontId],
    queryFn: () => StorefrontApi.checkSlug(debounced, storefrontId),
    enabled: debounced.length >= 3
  });

  return { ...query, isSettled: trimmed === debounced && !query.isFetching };
}
