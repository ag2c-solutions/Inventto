import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { OrganizationService } from '../../domain/services';
import { ORG_KEYS } from '../constants/org-keys';

export function useOrganizationQuery() {
  const { currentOrganization } = useUser();

  return useQuery({
    queryKey: ORG_KEYS.detail(currentOrganization?.id ?? ''),
    queryFn: () => OrganizationService.getById(currentOrganization),
    enabled: !!currentOrganization?.id,
    staleTime: 1000 * 60 * 30 // 30 minutos
  });
}

export function useOrganizationMembersQuery() {
  const { currentOrganization, user } = useUser();

  return useQuery({
    queryKey: currentOrganization?.id
      ? ORG_KEYS.members(currentOrganization.id)
      : ['members', 'null'],
    queryFn: () =>
      OrganizationService.getMembers(currentOrganization, user?.id ?? ''),
    enabled: !!currentOrganization,
    staleTime: 1000 * 60 * 5
  });
}

export function useCandidatesQuery() {
  const { currentOrganization } = useUser();

  return useQuery({
    queryKey: currentOrganization?.id
      ? ['organization', currentOrganization.id, 'candidates']
      : ['candidates', 'null'],
    queryFn: () =>
      OrganizationService.getCandidatesMembers(currentOrganization),
    staleTime: 1000 * 60 * 5
  });
}

export function useLookupCepQuery(cep: string) {
  return useQuery({
    queryKey: ['lookup-cep', cep],
    queryFn: () => OrganizationService.lookupCep(cep),
    staleTime: 1000 * 60 * 5,
    enabled: !!cep
  });
}
