import { useQuery } from '@tanstack/react-query';

import { CatalogApi } from '../../data/api';

export function useCatalogsQuery() {
  return useQuery({
    queryKey: ['catalogs'],
    queryFn: CatalogApi.getAll,
    staleTime: 1000 * 60 * 5
  });
}

export function useCatalogByIDQuery(id: string) {
  return useQuery({
    queryKey: ['catalog', id],
    queryFn: ({ queryKey }) => CatalogApi.getOneById(queryKey[1] as string),
    enabled: !!id
  });
}
