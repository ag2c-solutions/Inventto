import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useUser } from '../../users/hooks/use-user';
import type { OrganizationSettings, MemberStatus, CreateMemberDTO } from '../types/';
import { ORG_KEYS } from '../consts';
import { OrganizationService } from '../services';
import type { UserRole } from '../../users/types';
import { USERS_KEYS } from '../../users/hooks/use-query';

export function useOrganizationQuery() {
  const { organization } = useUser();
  const orgId = organization?.id;

  if (!orgId) throw new Error('Organization ID is required');

  return useQuery({
    queryKey: orgId ? ORG_KEYS.detail(orgId) : ['organization', 'null'],
    queryFn: () => OrganizationService.getById(orgId),
    enabled: !!orgId, 
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

export function useOrganizationMembersQuery() {
  const { organization } = useUser();
  const orgId = organization?.id;

  return useQuery({
    queryKey: orgId ? ORG_KEYS.members(orgId) : ['members', 'null'],
    queryFn: () => {
      if (!orgId) throw new Error('Organization ID is required');

      return OrganizationService.getMembers(orgId);
    },
    enabled: !!orgId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: OrganizationService.create,
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({ queryKey: USERS_KEYS.profile(user.id) });
      }
    },
    meta: {
      successMessage: 'Nova organização criada com sucesso!',
    },
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  const { organization } = useUser();
  const orgId = organization?.id;

  if (!orgId) throw new Error('Organization ID is required');

  return useMutation({
    mutationFn: (data: { name?: string; settings?: OrganizationSettings }) => 
      OrganizationService.update(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.detail(orgId) });
    },
    meta: {
      successMessage: 'Configurações salvas com sucesso.',
    },
  });
}

export function useCandidatesQuery() {
  const { organization } = useUser();
  const orgId = organization?.id;

  if (!orgId) throw new Error('Organization ID is required');

  return useQuery({
    queryKey: ['organization', orgId, 'candidates'],
    queryFn: () => OrganizationService.getCandidatesMembers(orgId),
    staleTime: 1000 * 60 * 5, // Cache por 50 minutos
  });
}

export function useCreateMemberMutation() {
  const queryClient = useQueryClient();
  const { organization } = useUser();
  const orgId = organization?.id;

  if (!orgId) throw new Error('Organization ID is required');

  return useMutation({
    mutationFn: (data: CreateMemberDTO) =>
      OrganizationService.createMember(orgId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.members(orgId) });
    },
    meta: {
      successMessage: 'Convite enviado com sucesso!',
    },
  });
}

export function useReplicateMemberMutation() {
  const queryClient = useQueryClient();
  const { organization } = useUser();
  const orgId = organization?.id;

  if (!orgId) throw new Error('Organization ID is required');

  return useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: 'manager' | 'sales' }) =>
      OrganizationService.replicateMember(orgId, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.members(orgId) });
      queryClient.invalidateQueries({ queryKey: ['organization', orgId, 'candidates'] });
    },
    meta: {
      successMessage: 'Membro importado com sucesso!',
    },
  });
}

export function useUpdateMemberRoleMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: UserRole }) =>
      OrganizationService.updateMemberRole(memberId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.all }); 
    },
    meta: {
      successMessage: 'Cargo do membro atualizado.',
    },
  });
}

export function useUpdateMemberStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ memberId, status }: { memberId: string; status: MemberStatus }) =>
      OrganizationService.updateMemberStatus(memberId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.all });
    },
    meta: {
      successMessage: 'Status do membro alterado.',
    },
  });
}