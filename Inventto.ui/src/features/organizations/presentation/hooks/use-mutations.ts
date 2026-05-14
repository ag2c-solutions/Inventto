import { useMutation, useQueryClient } from '@tanstack/react-query';

import { type UserRole, USERS_KEYS, useUser } from '@/features/users';

import type {
  CreateMember,
  CreateOrganizationInput,
  MemberStatus,
  OrganizationSettings
} from '../../domain/entities';
import { OrganizationService } from '../../domain/services';
import { ORG_KEYS } from '../consts';

export function useCreateOrganizationMutation() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  return useMutation({
    mutationFn: (payload: CreateOrganizationInput) =>
      OrganizationService.create(payload),
    onSuccess: () => {
      if (user?.id) {
        queryClient.invalidateQueries({
          queryKey: USERS_KEYS.profile(user.id)
        });
      }
    },
    meta: {
      successMessage: 'Nova organização criada com sucesso!'
    }
  });
}

export function useUpdateOrganizationMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: (settings: OrganizationSettings) =>
      OrganizationService.update(currentOrganization, settings),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.detail(currentOrganization?.id ?? '')
      });
    },
    meta: {
      successMessage: 'Configurações salvas com sucesso.'
    }
  });
}

export function useCreateMemberMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: (data: CreateMember) =>
      OrganizationService.createMember(currentOrganization, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.members(currentOrganization?.id ?? '')
      });
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.candidates(currentOrganization?.id ?? '')
      });
    },
    meta: {
      successMessage: 'Convite enviado com sucesso!'
    }
  });
}

export function useReplicateMemberMutation() {
  const queryClient = useQueryClient();
  const { currentOrganization } = useUser();

  return useMutation({
    mutationFn: ({
      userId,
      role
    }: {
      userId: string;
      role: 'manager' | 'sales';
    }) =>
      OrganizationService.replicateMember(currentOrganization, userId, role),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.members(currentOrganization?.id ?? '')
      });
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.candidates(currentOrganization?.id ?? '')
      });
      queryClient.invalidateQueries({
        queryKey: ORG_KEYS.members(currentOrganization?.id ?? '')
      });
    },
    meta: {
      successMessage: 'Membro importado com sucesso!'
    }
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
      successMessage: 'Cargo do membro atualizado.'
    }
  });
}

export function useUpdateMemberStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberId,
      status
    }: {
      memberId: string;
      status: MemberStatus;
    }) => OrganizationService.updateMemberStatus(memberId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORG_KEYS.all });
    },
    meta: {
      successMessage: 'Status do membro alterado.'
    }
  });
}
