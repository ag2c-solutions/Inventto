import { useQuery } from '@tanstack/react-query';

import { CatalogApi } from '../../data/api';
import { CATALOG_KEYS } from '../constants';

export function useCatalogsQuery() {
  return useQuery({
    queryKey: CATALOG_KEYS.all,
    queryFn: CatalogApi.getAll,
    staleTime: 1000 * 60 * 5
  });
}

export function useCatalogByIDQuery(id: string) {
  return useQuery({
    queryKey: CATALOG_KEYS.detail(id),
    queryFn: () => CatalogApi.getOneById(id),
    enabled: !!id
  });
}
