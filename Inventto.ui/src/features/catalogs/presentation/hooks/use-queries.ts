import { useQuery } from '@tanstack/react-query';

import { CatalogApi } from '../../data/api';
import { CatalogService } from '../../domain/services';

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
    queryFn: () => CatalogApi.getOneById(id),
    enabled: !!id
  });
}

export function useCatalogCheckSlugAvailabilityQuery(slug: string) {
  return useQuery({
    queryKey: ['catalogCheckSlugAvailability', slug],
    queryFn: () => CatalogService.checkSlugAvailability(slug),
    enabled: !!slug
  });
}
