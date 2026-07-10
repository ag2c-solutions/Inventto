import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { PdvApi } from '../../data/api';
import { PDV_KEYS } from '../constants';

export function usePdvCatalogQuery() {
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id ?? '';

  return useQuery({
    queryKey: PDV_KEYS.catalog(organizationId),
    queryFn: () => PdvApi.getPdvCatalog(organizationId),
    enabled: !!organizationId
  });
}

export function usePdvProductsQuery(catalogId: string | undefined) {
  return useQuery({
    queryKey: PDV_KEYS.products(catalogId ?? ''),
    queryFn: () => PdvApi.getPdvProducts(catalogId as string),
    enabled: !!catalogId
  });
}

// Recebe o telefone já normalizado/debounced pelo chamador
// (customer-section/hooks/use-customer-lookup.ts) — esta query não debounce.
export function useLookupCustomerQuery(phone: string) {
  const { currentOrganization } = useUser();
  const organizationId = currentOrganization?.id ?? '';

  return useQuery({
    queryKey: PDV_KEYS.customer(organizationId, phone),
    queryFn: () => PdvApi.lookupCustomer(organizationId, phone),
    enabled: !!organizationId && !!phone
  });
}
