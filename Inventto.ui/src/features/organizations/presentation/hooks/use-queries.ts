import { useQuery } from '@tanstack/react-query';

import { useUser } from '@/features/users';

import { OrganizationApi } from '../../data/api';
import { ORG_KEYS } from '../consts';

export function useOrganizationQuery() {
  const { currentOrganization: organization } = useUser();
  const orgId = organization?.id;

  if (!orgId) throw new Error('Organization ID is required');

  return useQuery({
    queryKey: ORG_KEYS.detail(orgId),
    queryFn: () => OrganizationApi.getById(orgId),
    enabled: !!orgId,
    staleTime: 1000 * 60 * 30 // 30 minutos
  });
}

export function useOrganizationMembersQuery() {
  const { currentOrganization: organization } = useUser();
  const orgId = organization?.id;

  return useQuery({
    queryKey: orgId ? ORG_KEYS.members(orgId) : ['members', 'null'],
    queryFn: () => {
      if (!orgId) throw new Error('Organization ID is required');

      return OrganizationApi.getMembers(orgId);
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5 // 5 minutos
  });
}

export function useCandidatesQuery() {
  const { currentOrganization: organization } = useUser();
  const orgId = organization?.id;

  if (!orgId) throw new Error('Organization ID is required');

  return useQuery({
    queryKey: ['organization', orgId, 'candidates'],
    queryFn: () => OrganizationApi.getCandidatesMembers(orgId),
    staleTime: 1000 * 60 * 5
  });
}
